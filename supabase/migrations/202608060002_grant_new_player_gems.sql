-- The browser displays this same starting balance, but the database wallet is
-- canonical. This trigger grants it once, when a profile is first created.
create or replace function public.grant_new_player_gems()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare grant_result record;
begin
  select * into grant_result from public.grant_protected_asset(
    new.id,
    'gems',
    1000,
    'admin',
    'new_player_gems_v1',
    jsonb_build_object('reason', 'new_player_welcome')
  );

  if grant_result.grant_status = 'granted' then
    insert into public.security_audit_log (account_id, event_type, outcome, request_id, metadata)
    values (
      new.id,
      'new_player_gems',
      'allowed',
      'new_player_gems_v1',
      jsonb_build_object('amount', 1000, 'balance', grant_result.balance)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_grant_new_player_gems on public.profiles;
create trigger profiles_grant_new_player_gems
after insert on public.profiles
for each row execute function public.grant_new_player_gems();
