-- Commerce, entitlement and official-leaderboard data deliberately never live
-- inside game_saves.state. All mutation functions below are service_role-only.
create table if not exists public.account_roles (
  account_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'player' check (role in ('player', 'moderator', 'admin')),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_entitlements (
  account_id uuid not null references public.profiles(id) on delete cascade,
  entitlement_id text not null check (entitlement_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (account_id, entitlement_id)
);

create table if not exists public.protected_entitlement_grants (
  grant_id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete cascade,
  entitlement_id text not null check (entitlement_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  source_type text not null check (source_type in ('payment', 'redeem_code', 'admin')),
  source_id text not null check (char_length(source_id) between 1 and 160),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  unique (account_id, entitlement_id, source_type, source_id)
);

create table if not exists public.protected_asset_spends (
  spend_id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete cascade,
  asset_id text not null check (asset_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  amount bigint not null check (amount > 0),
  source_id text not null check (char_length(source_id) between 1 and 160),
  metadata jsonb not null default '{}'::jsonb,
  spent_at timestamptz not null default now(),
  unique (account_id, asset_id, source_id)
);

create table if not exists public.payment_products (
  product_id text primary key check (product_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  title text not null check (char_length(title) between 1 and 120),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  price_minor bigint not null check (price_minor > 0),
  asset_id text check (asset_id is null or asset_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  asset_amount bigint check (asset_amount is null or asset_amount > 0),
  entitlement_id text check (entitlement_id is null or entitlement_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((asset_id is not null and asset_amount is not null) or entitlement_id is not null)
);

create table if not exists public.payment_orders (
  order_id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null check (provider ~ '^[a-z][a-z0-9_]{2,63}$'),
  product_id text not null references public.payment_products(product_id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  price_minor bigint not null check (price_minor > 0),
  asset_id text check (asset_id is null or asset_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  asset_amount bigint check (asset_amount is null or asset_amount > 0),
  entitlement_id text check (entitlement_id is null or entitlement_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  provider_order_id text unique,
  provider_payment_id text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((asset_id is not null and asset_amount is not null) or entitlement_id is not null)
);
create index if not exists payment_orders_account_created_at_idx on public.payment_orders (account_id, created_at desc);

create table if not exists public.payment_webhook_events (
  provider text not null check (provider ~ '^[a-z][a-z0-9_]{2,63}$'),
  provider_event_id text not null check (char_length(provider_event_id) between 1 and 160),
  order_id uuid not null references public.payment_orders(order_id) on delete restrict,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  received_at timestamptz not null default now(),
  primary key (provider, provider_event_id)
);

create table if not exists public.security_audit_log (
  audit_id bigint generated always as identity primary key,
  account_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_]{2,80}$'),
  outcome text not null check (outcome in ('allowed', 'denied', 'failed')),
  request_id text check (request_id is null or char_length(request_id) between 1 and 160),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[a-f0-9]{64}$'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists security_audit_log_account_created_at_idx on public.security_audit_log (account_id, created_at desc);
create index if not exists security_audit_log_event_created_at_idx on public.security_audit_log (event_type, created_at desc);

create table if not exists public.leaderboard_seasons (
  season_id text primary key check (season_id ~ '^[a-z][a-z0-9_]{2,63}$'),
  title text not null check (char_length(title) between 1 and 120),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  season_id text not null references public.leaderboard_seasons(season_id) on delete cascade,
  account_id uuid not null references public.profiles(id) on delete cascade,
  score bigint not null check (score >= 0),
  source_type text not null check (source_type = 'server_verified'),
  source_id text not null check (char_length(source_id) between 1 and 160),
  submitted_at timestamptz not null default now(),
  primary key (season_id, account_id),
  unique (season_id, source_id)
);
create index if not exists leaderboard_entries_season_score_idx on public.leaderboard_entries (season_id, score desc, submitted_at asc);

alter table public.account_roles enable row level security;
alter table public.account_entitlements enable row level security;
alter table public.protected_entitlement_grants enable row level security;
alter table public.protected_asset_spends enable row level security;
alter table public.payment_products enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.security_audit_log enable row level security;
alter table public.leaderboard_seasons enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "Users can read their role" on public.account_roles for select using ((select auth.uid()) = account_id);
create policy "Users can read their entitlements" on public.account_entitlements for select using ((select auth.uid()) = account_id);
create policy "Users can read their entitlement grants" on public.protected_entitlement_grants for select using ((select auth.uid()) = account_id);
create policy "Users can read their protected asset spends" on public.protected_asset_spends for select using ((select auth.uid()) = account_id);
create policy "Users can read their orders" on public.payment_orders for select using ((select auth.uid()) = account_id);
create policy "Anyone can read visible leaderboard seasons" on public.leaderboard_seasons for select using (status in ('active', 'closed'));
create policy "Anyone can read official leaderboard entries" on public.leaderboard_entries for select using (true);

drop trigger if exists account_roles_set_updated_at on public.account_roles;
create trigger account_roles_set_updated_at before update on public.account_roles for each row execute function public.set_updated_at();
drop trigger if exists account_entitlements_set_updated_at on public.account_entitlements;
create trigger account_entitlements_set_updated_at before update on public.account_entitlements for each row execute function public.set_updated_at();
drop trigger if exists payment_products_set_updated_at on public.payment_products;
create trigger payment_products_set_updated_at before update on public.payment_products for each row execute function public.set_updated_at();
drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
create trigger payment_orders_set_updated_at before update on public.payment_orders for each row execute function public.set_updated_at();

create or replace function public.grant_default_player_role()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.account_roles (account_id, role) values (new.id, 'player') on conflict (account_id) do nothing;
  return new;
end;
$$;
drop trigger if exists profiles_grant_default_player_role on public.profiles;
create trigger profiles_grant_default_player_role after insert on public.profiles
for each row execute function public.grant_default_player_role();
insert into public.account_roles (account_id, role)
select id, 'player' from public.profiles on conflict (account_id) do nothing;

create or replace function public.grant_protected_entitlement(
  p_account_id uuid,
  p_entitlement_id text,
  p_source_type text,
  p_source_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (grant_status text, active boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare inserted_grant uuid;
begin
  if p_entitlement_id !~ '^[a-z][a-z0-9_]{2,63}$'
    or p_source_type not in ('payment', 'redeem_code', 'admin')
    or char_length(p_source_id) not between 1 and 160 then
    raise exception 'Invalid protected-entitlement grant.' using errcode = '22023';
  end if;
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  insert into public.protected_entitlement_grants (account_id, entitlement_id, source_type, source_id, metadata)
  values (p_account_id, p_entitlement_id, p_source_type, p_source_id, coalesce(p_metadata, '{}'::jsonb))
  on conflict (account_id, entitlement_id, source_type, source_id) do nothing returning grant_id into inserted_grant;
  if inserted_grant is null then
    return query select 'duplicate'::text, coalesce((select e.active from public.account_entitlements e where e.account_id = p_account_id and e.entitlement_id = p_entitlement_id), false);
    return;
  end if;
  insert into public.account_entitlements (account_id, entitlement_id, active)
  values (p_account_id, p_entitlement_id, true)
  on conflict (account_id, entitlement_id) do update set active = true;
  return query select 'granted'::text, true;
end;
$$;

create or replace function public.spend_protected_asset(
  p_account_id uuid,
  p_asset_id text,
  p_amount bigint,
  p_source_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (spend_status text, balance bigint)
language plpgsql security definer set search_path = public, pg_temp as $$
declare current_balance bigint;
declare inserted_spend uuid;
begin
  if p_asset_id !~ '^[a-z][a-z0-9_]{2,63}$' or p_amount <= 0 or char_length(p_source_id) not between 1 and 160 then
    raise exception 'Invalid protected-asset spend.' using errcode = '22023';
  end if;
  insert into public.protected_asset_spends (account_id, asset_id, amount, source_id, metadata)
  values (p_account_id, p_asset_id, p_amount, p_source_id, coalesce(p_metadata, '{}'::jsonb))
  on conflict (account_id, asset_id, source_id) do nothing returning spend_id into inserted_spend;
  if inserted_spend is null then
    select balance into current_balance from public.account_assets
    where account_id = p_account_id and asset_id = p_asset_id;
    return query select 'duplicate'::text, coalesce(current_balance, 0);
    return;
  end if;
  select balance into current_balance from public.account_assets
  where account_id = p_account_id and asset_id = p_asset_id for update;
  if current_balance is null or current_balance < p_amount then
    delete from public.protected_asset_spends where spend_id = inserted_spend;
    return query select 'insufficient'::text, coalesce(current_balance, 0);
    return;
  end if;
  update public.account_assets set balance = balance - p_amount
  where account_id = p_account_id and asset_id = p_asset_id
  returning balance into current_balance;
  insert into public.security_audit_log (account_id, event_type, outcome, request_id, metadata)
  values (p_account_id, 'protected_asset_spend', 'allowed', p_source_id, coalesce(p_metadata, '{}'::jsonb));
  return query select 'spent'::text, current_balance;
end;
$$;

create or replace function public.create_payment_order(
  p_account_id uuid,
  p_product_id text,
  p_provider text
)
returns table (order_id uuid, provider text, product_id text, currency char(3), price_minor bigint, status text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare product public.payment_products%rowtype;
begin
  if p_provider !~ '^[a-z][a-z0-9_]{2,63}$' then raise exception 'Invalid payment provider.' using errcode = '22023'; end if;
  select * into product from public.payment_products where product_id = p_product_id and active;
  if not found then raise exception 'Payment product is unavailable.' using errcode = '22023'; end if;
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  return query
  insert into public.payment_orders (account_id, provider, product_id, currency, price_minor, asset_id, asset_amount, entitlement_id)
  values (p_account_id, p_provider, product.product_id, product.currency, product.price_minor, product.asset_id, product.asset_amount, product.entitlement_id)
  returning payment_orders.order_id, payment_orders.provider, payment_orders.product_id, payment_orders.currency, payment_orders.price_minor, payment_orders.status;
end;
$$;

create or replace function public.complete_verified_payment(
  p_provider text,
  p_provider_event_id text,
  p_order_id uuid,
  p_provider_payment_id text,
  p_payload_sha256 text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (payment_status text, account_id uuid, asset_id text, asset_balance bigint, entitlement_id text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare payment public.payment_orders%rowtype;
declare inserted_event text;
declare resulting_asset_balance bigint;
begin
  if p_provider !~ '^[a-z][a-z0-9_]{2,63}$' or char_length(p_provider_event_id) not between 1 and 160
    or char_length(p_provider_payment_id) not between 1 and 160 or p_payload_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid verified payment.' using errcode = '22023';
  end if;
  insert into public.payment_webhook_events (provider, provider_event_id, order_id, payload_sha256)
  values (p_provider, p_provider_event_id, p_order_id, p_payload_sha256)
  on conflict (provider, provider_event_id) do nothing returning provider_event_id into inserted_event;
  if inserted_event is null then
    select * into payment from public.payment_orders where order_id = p_order_id;
    return query select 'duplicate'::text, payment.account_id, payment.asset_id, null::bigint, payment.entitlement_id;
    return;
  end if;
  select * into payment from public.payment_orders where order_id = p_order_id for update;
  if not found or payment.provider <> p_provider then raise exception 'Payment order is invalid.' using errcode = '22023'; end if;
  if payment.status = 'paid' then
    return query select 'already_paid'::text, payment.account_id, payment.asset_id, null::bigint, payment.entitlement_id;
    return;
  end if;
  if payment.status <> 'pending' then raise exception 'Payment order is no longer payable.' using errcode = '22023'; end if;

  update public.payment_orders set status = 'paid', provider_payment_id = p_provider_payment_id, paid_at = now(), metadata = coalesce(p_metadata, '{}'::jsonb)
  where order_id = payment.order_id;
  if payment.asset_id is not null then
    select balance into resulting_asset_balance from public.grant_protected_asset(payment.account_id, payment.asset_id, payment.asset_amount, 'payment', p_provider_event_id, p_metadata);
  end if;
  if payment.entitlement_id is not null then
    perform public.grant_protected_entitlement(payment.account_id, payment.entitlement_id, 'payment', p_provider_event_id, p_metadata);
  end if;
  insert into public.security_audit_log (account_id, event_type, outcome, request_id, metadata)
  values (payment.account_id, 'payment_webhook', 'allowed', p_provider_event_id, jsonb_build_object('orderId', payment.order_id, 'provider', p_provider));
  return query select 'paid'::text, payment.account_id, payment.asset_id, resulting_asset_balance, payment.entitlement_id;
end;
$$;

create or replace function public.record_official_leaderboard_result(
  p_season_id text,
  p_account_id uuid,
  p_score bigint,
  p_source_id text
)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_score < 0 or char_length(p_source_id) not between 1 and 160 then raise exception 'Invalid leaderboard result.' using errcode = '22023'; end if;
  if not exists (select 1 from public.leaderboard_seasons where season_id = p_season_id and status = 'active' and now() between starts_at and ends_at) then
    raise exception 'Leaderboard season is not active.' using errcode = '22023';
  end if;
  insert into public.leaderboard_entries (season_id, account_id, score, source_type, source_id)
  values (p_season_id, p_account_id, p_score, 'server_verified', p_source_id)
  on conflict (season_id, account_id) do update set score = greatest(public.leaderboard_entries.score, excluded.score), submitted_at = now();
end;
$$;

revoke all on function public.grant_protected_entitlement(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.spend_protected_asset(uuid, text, bigint, text, jsonb) from public, anon, authenticated;
revoke all on function public.create_payment_order(uuid, text, text) from public, anon, authenticated;
revoke all on function public.complete_verified_payment(text, text, uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.record_official_leaderboard_result(text, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.grant_protected_entitlement(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.spend_protected_asset(uuid, text, bigint, text, jsonb) to service_role;
grant execute on function public.create_payment_order(uuid, text, text) to service_role;
grant execute on function public.complete_verified_payment(text, text, uuid, text, text, jsonb) to service_role;
grant execute on function public.record_official_leaderboard_result(text, uuid, bigint, text) to service_role;
