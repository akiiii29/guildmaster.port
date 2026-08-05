-- Protected assets are intentionally separate from game_saves.state.  The
-- browser may own a local, editable game save, but it can never write a paid
-- entitlement, a payment credit, or a protected gem balance.
create table if not exists public.account_assets (
  account_id uuid not null references public.profiles(id) on delete cascade,
  asset_id text not null check (asset_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  primary key (account_id, asset_id)
);

create table if not exists public.protected_asset_grants (
  grant_id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete cascade,
  asset_id text not null check (asset_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  amount bigint not null check (amount > 0),
  source_type text not null check (source_type in ('redeem_code', 'payment', 'admin')),
  source_id text not null check (char_length(source_id) between 1 and 160),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  unique (account_id, source_type, source_id, asset_id)
);
create index if not exists protected_asset_grants_account_granted_at_idx
  on public.protected_asset_grants (account_id, granted_at desc);

create table if not exists public.redeem_attempts (
  attempt_id bigint generated always as identity primary key,
  account_id uuid not null references public.profiles(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index if not exists redeem_attempts_account_attempted_at_idx
  on public.redeem_attempts (account_id, attempted_at desc);

-- Keep old gameplay-item codes valid while allowing server-only asset rewards.
alter table public.redeem_codes drop constraint if exists redeem_codes_reward_check;
alter table public.redeem_codes add constraint redeem_codes_reward_check check (
  jsonb_typeof(reward) = 'object'
  and (
    (
      coalesce(reward ->> 'kind', 'game_item') = 'game_item'
      and jsonb_typeof(reward -> 'itemId') = 'string'
      and jsonb_typeof(reward -> 'stack') = 'number'
    )
    or (
      reward ->> 'kind' = 'protected_asset'
      and (reward ->> 'assetId') ~ '^[a-z][a-z0-9_]{2,63}$'
      and jsonb_typeof(reward -> 'amount') = 'number'
      and (reward ->> 'amount')::bigint > 0
    )
  )
);

alter table public.account_assets enable row level security;
alter table public.protected_asset_grants enable row level security;
alter table public.redeem_attempts enable row level security;

create policy "Users can read their protected assets" on public.account_assets
  for select using ((select auth.uid()) = account_id);
create policy "Users can read their protected asset grants" on public.protected_asset_grants
  for select using ((select auth.uid()) = account_id);

drop trigger if exists account_assets_set_updated_at on public.account_assets;
create trigger account_assets_set_updated_at before update on public.account_assets
for each row execute function public.set_updated_at();

-- Only trusted server code (service_role) may call this.  source_type/source_id
-- make payment webhooks and admin retries idempotent.
create or replace function public.grant_protected_asset(
  p_account_id uuid,
  p_asset_id text,
  p_amount bigint,
  p_source_type text,
  p_source_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (grant_status text, balance bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  next_balance bigint;
  inserted_grant uuid;
begin
  if p_asset_id !~ '^[a-z][a-z0-9_]{2,63}$' or p_amount <= 0
    or p_source_type not in ('redeem_code', 'payment', 'admin')
    or char_length(p_source_id) not between 1 and 160 then
    raise exception 'Invalid protected-asset grant.' using errcode = '22023';
  end if;

  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  insert into public.protected_asset_grants (account_id, asset_id, amount, source_type, source_id, metadata)
  values (p_account_id, p_asset_id, p_amount, p_source_type, p_source_id, coalesce(p_metadata, '{}'::jsonb))
  on conflict (account_id, source_type, source_id, asset_id) do nothing
  returning grant_id into inserted_grant;

  if inserted_grant is null then
    select a.balance into next_balance from public.account_assets a
    where a.account_id = p_account_id and a.asset_id = p_asset_id;
    return query select 'duplicate'::text, coalesce(next_balance, 0);
    return;
  end if;

  insert into public.account_assets (account_id, asset_id, balance)
  values (p_account_id, p_asset_id, p_amount)
  on conflict (account_id, asset_id) do update set balance = public.account_assets.balance + excluded.balance
  returning account_assets.balance into next_balance;

  return query select 'granted'::text, next_balance;
end;
$$;

-- Redeem is one transaction: lock the code, enforce its global cap, record the
-- account claim, and (for protected rewards) grant the asset.  A browser never
-- receives permission to update either table.
create or replace function public.claim_redeem_code(
  p_account_id uuid,
  p_code text
)
returns table (
  claim_status text,
  reward jsonb,
  asset_id text,
  asset_balance bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  code_row public.redeem_codes%rowtype;
  reward_kind text;
  protected_asset_id text;
  protected_amount bigint;
  grant_result record;
begin
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  select * into code_row from public.redeem_codes where code = p_code for update;

  if not found or not code_row.active or (code_row.expires_at is not null and code_row.expires_at <= now())
    or (code_row.max_claims is not null and code_row.claims >= code_row.max_claims) then
    return query select 'invalid'::text, null::jsonb, null::text, null::bigint;
    return;
  end if;

  begin
    insert into public.redeem_claims (account_id, code) values (p_account_id, p_code);
  exception when unique_violation then
    return query select 'already_claimed'::text, null::jsonb, null::text, null::bigint;
    return;
  end;

  update public.redeem_codes set claims = claims + 1 where code = p_code;
  reward_kind := coalesce(code_row.reward ->> 'kind', 'game_item');

  if reward_kind = 'protected_asset' then
    protected_asset_id := code_row.reward ->> 'assetId';
    protected_amount := (code_row.reward ->> 'amount')::bigint;
    if protected_asset_id !~ '^[a-z][a-z0-9_]{2,63}$' or protected_amount is null or protected_amount <= 0 then
      raise exception 'Redeem code has an invalid protected reward.' using errcode = '22023';
    end if;
    select * into grant_result from public.grant_protected_asset(
      p_account_id, protected_asset_id, protected_amount, 'redeem_code', p_code, jsonb_build_object('code', p_code));
    return query select 'claimed_asset'::text, null::jsonb, protected_asset_id, grant_result.balance;
    return;
  end if;

  return query select 'claimed_game_item'::text, code_row.reward, null::text, null::bigint;
end;
$$;

revoke all on function public.grant_protected_asset(uuid, text, bigint, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_redeem_code(uuid, text) from public, anon, authenticated;
grant execute on function public.grant_protected_asset(uuid, text, bigint, text, text, jsonb) to service_role;
grant execute on function public.claim_redeem_code(uuid, text) to service_role;
