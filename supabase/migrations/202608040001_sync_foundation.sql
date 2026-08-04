create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_saves (
  account_id uuid primary key references public.profiles(id) on delete cascade,
  state jsonb not null,
  game_version integer not null check (game_version > 0),
  revision bigint not null default 0 check (revision >= 0),
  device_id uuid not null,
  client_updated_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_events (
  event_id uuid primary key,
  account_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index if not exists progress_events_account_received_at_idx on public.progress_events (account_id, received_at desc);

create table if not exists public.achievement_definitions (
  achievement_id text primary key check (achievement_id ~ '^[a-z0-9_]{3,80}$'),
  event_type text not null check (char_length(event_type) between 1 and 80),
  target bigint not null check (target > 0),
  hidden boolean not null default false,
  content_version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_achievements (
  account_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(achievement_id) on delete cascade,
  progress bigint not null default 0 check (progress >= 0),
  unlocked_at timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  primary key (account_id, achievement_id)
);

create table if not exists public.reward_ledger (
  account_id uuid not null references public.profiles(id) on delete cascade,
  reward_key text not null check (char_length(reward_key) between 1 and 160),
  source_type text not null check (char_length(source_type) between 1 and 80),
  source_id text not null check (char_length(source_id) between 1 and 160),
  payload jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  primary key (account_id, reward_key)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists game_saves_set_updated_at on public.game_saves;
create trigger game_saves_set_updated_at before update on public.game_saves
for each row execute function public.set_updated_at();

drop trigger if exists achievement_definitions_set_updated_at on public.achievement_definitions;
create trigger achievement_definitions_set_updated_at before update on public.achievement_definitions
for each row execute function public.set_updated_at();

drop trigger if exists account_achievements_set_updated_at on public.account_achievements;
create trigger account_achievements_set_updated_at before update on public.account_achievements
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;
alter table public.progress_events enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.account_achievements enable row level security;
alter table public.reward_ledger enable row level security;

create policy "Users can read their profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can read their save" on public.game_saves for select using ((select auth.uid()) = account_id);
create policy "Users can read their events" on public.progress_events for select using ((select auth.uid()) = account_id);
create policy "Authenticated users can read achievement definitions" on public.achievement_definitions for select to authenticated using (true);
create policy "Users can read their achievements" on public.account_achievements for select using ((select auth.uid()) = account_id);
create policy "Users can read their rewards" on public.reward_ledger for select using ((select auth.uid()) = account_id);

create or replace function public.apply_sync_batch(
  p_account_id uuid,
  p_state jsonb,
  p_game_version integer,
  p_base_revision bigint,
  p_device_id uuid,
  p_client_updated_at timestamptz,
  p_events jsonb default '[]'::jsonb
)
returns table (
  result_status text,
  revision bigint,
  state jsonb,
  game_version integer,
  updated_at timestamptz,
  accepted_events integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_save public.game_saves%rowtype;
  has_current boolean;
  next_revision bigint;
  inserted_events integer := 0;
begin
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;

  select * into current_save
  from public.game_saves
  where account_id = p_account_id
  for update;
  has_current := found;

  if has_current and p_base_revision <> current_save.revision then
    return query select 'conflict'::text, current_save.revision, current_save.state,
      current_save.game_version, current_save.updated_at, 0;
    return;
  end if;

  if jsonb_typeof(p_events) <> 'array' then
    raise exception 'p_events must be an array';
  end if;

  insert into public.progress_events (event_id, account_id, device_id, event_type, payload, occurred_at)
  select (entry ->> 'id')::uuid, p_account_id, p_device_id, entry ->> 'type',
    coalesce(entry -> 'payload', '{}'::jsonb), (entry ->> 'occurredAt')::timestamptz
  from jsonb_array_elements(p_events) as entry
  on conflict (event_id) do nothing;
  get diagnostics inserted_events = row_count;

  next_revision := case when has_current then current_save.revision + 1 else 1 end;
  insert into public.game_saves (account_id, state, game_version, revision, device_id, client_updated_at)
  values (p_account_id, p_state, p_game_version, next_revision, p_device_id, p_client_updated_at)
  on conflict (account_id) do update set
    state = excluded.state,
    game_version = excluded.game_version,
    revision = excluded.revision,
    device_id = excluded.device_id,
    client_updated_at = excluded.client_updated_at;

  select * into current_save from public.game_saves where account_id = p_account_id;
  return query select 'applied'::text, current_save.revision, current_save.state,
    current_save.game_version, current_save.updated_at, inserted_events;
end;
$$;

revoke all on function public.apply_sync_batch(uuid, jsonb, integer, bigint, uuid, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.apply_sync_batch(uuid, jsonb, integer, bigint, uuid, timestamptz, jsonb) to service_role;
