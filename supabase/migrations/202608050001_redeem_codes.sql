create table if not exists public.redeem_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{4,64}$'),
  reward jsonb not null check (
    jsonb_typeof(reward) = 'object'
    and jsonb_typeof(reward -> 'itemId') = 'string'
    and jsonb_typeof(reward -> 'stack') = 'number'
  ),
  active boolean not null default true,
  max_claims integer,
  claims integer not null default 0 check (claims >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.redeem_claims (
  account_id uuid not null references public.profiles(id) on delete cascade,
  code text not null references public.redeem_codes(code) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (account_id, code)
);

alter table public.redeem_codes enable row level security;
alter table public.redeem_claims enable row level security;
