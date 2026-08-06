-- Packs are now permanent Gem purchases. Remove the temporary entitlement that
-- granted both bonuses to every existing web save.
-- This is the same transaction-local guard bypass used by the authoritative
-- RPC; direct browser writes remain blocked.
select set_config('app.gem_authority_write', 'on', true);

update public.game_saves
set state = jsonb_set(
  jsonb_set(state, '{purchasedPacks,starter}', 'false'::jsonb, true),
  '{purchasedPacks,merchant}', 'false'::jsonb, true
)
where state ? 'purchasedPacks';
