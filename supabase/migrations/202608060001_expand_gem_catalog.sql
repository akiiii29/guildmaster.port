-- Keep existing orders immutable, but retire the previous purchasable catalog.
update public.payment_products
set active = false
where product_id in ('gems_100', 'starter_pack');

insert into public.payment_products (
  product_id, title, currency, price_minor, asset_id, asset_amount, metadata, active
)
values
  ('gems_10000', '10,000 Gems', 'VND', 10000, 'gems', 10000, '{"kind":"gem_pack"}'::jsonb, true),
  ('gems_20000', '20,000 Gems', 'VND', 20000, 'gems', 20000, '{"kind":"gem_pack"}'::jsonb, true),
  ('gems_50000', '50,000 Gems', 'VND', 50000, 'gems', 50000, '{"kind":"gem_pack"}'::jsonb, true)
on conflict (product_id) do update
set
  title = excluded.title,
  currency = excluded.currency,
  price_minor = excluded.price_minor,
  asset_id = excluded.asset_id,
  asset_amount = excluded.asset_amount,
  entitlement_id = null,
  metadata = excluded.metadata,
  active = true;
