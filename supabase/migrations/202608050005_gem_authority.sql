-- Canonical action ledger for strict gem mode. `game_saves.state` is written
-- only by the gem-authority Edge Function once an account has crossed over.
alter table public.game_saves
  add column if not exists authority_mode text not null default 'legacy'
    check (authority_mode in ('legacy', 'gem_authoritative')),
  add column if not exists gem_cutover_at timestamptz;

create table if not exists public.authoritative_game_actions (
  action_id uuid primary key,
  account_id uuid not null references public.profiles(id) on delete cascade,
  base_revision bigint not null check (base_revision >= 0),
  action_type text not null check (action_type ~ '^[A-Za-z][A-Za-z0-9_]{1,79}$'),
  received_at timestamptz not null default now()
);
create index if not exists authoritative_game_actions_account_received_idx
  on public.authoritative_game_actions (account_id, received_at desc);

-- An older browser or a leaked service workflow must never overwrite a strict
-- save through the legacy snapshot RPC. Only this function sets the local
-- transaction flag before it writes a strict state.
create or replace function public.guard_authoritative_game_save()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' and old.authority_mode = 'gem_authoritative'
    and coalesce(current_setting('app.gem_authority_write', true), '') <> 'on' then
    raise exception 'Server-authoritative gem saves can only be updated by the gem authority.' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists game_saves_guard_authoritative_write on public.game_saves;
create trigger game_saves_guard_authoritative_write before update on public.game_saves
for each row execute function public.guard_authoritative_game_save();

create or replace function public.apply_authoritative_game_state(
  p_account_id uuid,
  p_action_id uuid,
  p_action_type text,
  p_base_revision bigint,
  p_state jsonb,
  p_game_version integer,
  p_gems_before bigint,
  p_gems_after bigint,
  p_cutover boolean default false
)
returns table (result_status text, revision bigint, state jsonb, game_version integer, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare current_save public.game_saves%rowtype;
declare has_current boolean;
declare duplicate_action boolean;
declare current_gem_balance bigint;
begin
  if p_gems_before < 0 or p_gems_after < 0 then
    raise exception 'Invalid gem balance.' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  perform set_config('app.gem_authority_write', 'on', true);
  select * into current_save from public.game_saves where account_id = p_account_id for update;
  has_current := found;

  -- account_assets is the real gem wallet. game_saves.state.gems is only a
  -- server-written mirror consumed by the UI/game reducer.
  insert into public.account_assets (account_id, asset_id, balance)
  values (p_account_id, 'gems', 0)
  on conflict (account_id, asset_id) do nothing;
  select balance into current_gem_balance from public.account_assets
  where account_id = p_account_id and asset_id = 'gems' for update;

  select exists (select 1 from public.authoritative_game_actions where action_id = p_action_id) into duplicate_action;
  if duplicate_action then
    if has_current then
      return query select 'duplicate'::text, current_save.revision,
        jsonb_set(current_save.state, '{gems}', to_jsonb(current_gem_balance)), current_save.game_version, current_save.updated_at;
    else
      return query select 'duplicate'::text, 0::bigint, p_state, p_game_version, now();
    end if;
    return;
  end if;

  if has_current and p_base_revision <> current_save.revision then
    return query select 'conflict'::text, current_save.revision,
      jsonb_set(current_save.state, '{gems}', to_jsonb(current_gem_balance)), current_save.game_version, current_save.updated_at;
    return;
  end if;

  -- A payment/redeem can credit the wallet between the Edge Function's read
  -- and this transaction. Never overwrite that real-time credit with an old
  -- game-state mirror; make the client reload and retry its intent instead.
  if current_gem_balance <> p_gems_before then
    if has_current then
      update public.game_saves set state = jsonb_set(current_save.state, '{gems}', to_jsonb(current_gem_balance)),
        revision = current_save.revision + 1, client_updated_at = now()
      where account_id = p_account_id;
      select * into current_save from public.game_saves where account_id = p_account_id;
      return query select 'conflict'::text, current_save.revision, current_save.state, current_save.game_version, current_save.updated_at;
    else
      return query select 'conflict'::text, 0::bigint,
        jsonb_set(p_state, '{gems}', to_jsonb(current_gem_balance)), p_game_version, now();
    end if;
    return;
  end if;

  insert into public.authoritative_game_actions (action_id, account_id, base_revision, action_type)
  values (p_action_id, p_account_id, p_base_revision, p_action_type);

  update public.account_assets set balance = p_gems_after
  where account_id = p_account_id and asset_id = 'gems';

  if has_current then
    update public.game_saves set state = p_state, game_version = p_game_version,
      revision = current_save.revision + 1, authority_mode = 'gem_authoritative',
      gem_cutover_at = coalesce(game_saves.gem_cutover_at, case when p_cutover then now() else null end),
      device_id = current_save.device_id, client_updated_at = now()
    where account_id = p_account_id;
  else
    insert into public.game_saves (account_id, state, game_version, revision, device_id, client_updated_at, authority_mode, gem_cutover_at)
    values (p_account_id, p_state, p_game_version, 1, gen_random_uuid(), now(), 'gem_authoritative', case when p_cutover then now() else null end);
  end if;

  select * into current_save from public.game_saves where account_id = p_account_id;
  return query select 'applied'::text, current_save.revision, current_save.state, current_save.game_version, current_save.updated_at;
end;
$$;

revoke all on function public.apply_authoritative_game_state(uuid, uuid, text, bigint, jsonb, integer, bigint, bigint, boolean) from public, anon, authenticated;
grant execute on function public.apply_authoritative_game_state(uuid, uuid, text, bigint, jsonb, integer, bigint, bigint, boolean) to service_role;
