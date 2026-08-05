-- `product_id` is also an OUT column of create_payment_order, so qualify the
-- catalog columns explicitly. This fixes PostgreSQL's ambiguous-column error
-- on live order creation.
create or replace function public.create_payment_order(
  p_account_id uuid,
  p_product_id text,
  p_provider text
)
returns table (
  order_id uuid,
  provider text,
  product_id text,
  currency char(3),
  price_minor bigint,
  status text,
  payment_code text
)
language plpgsql security definer set search_path = public, pg_temp as $$
declare product public.payment_products%rowtype;
declare next_code text;
begin
  if p_provider <> 'sepay' then raise exception 'Unsupported payment provider.' using errcode = '22023'; end if;
  select * into product from public.payment_products
  where payment_products.product_id = p_product_id and payment_products.active;
  if not found or product.currency <> 'VND' then raise exception 'Payment product is unavailable.' using errcode = '22023'; end if;
  next_code := 'GM' || upper(replace(gen_random_uuid()::text, '-', ''));
  insert into public.profiles (id) values (p_account_id) on conflict (id) do nothing;
  return query
  insert into public.payment_orders (account_id, provider, product_id, currency, price_minor, asset_id, asset_amount, entitlement_id, provider_order_id)
  values (p_account_id, 'sepay', product.product_id, product.currency, product.price_minor, product.asset_id, product.asset_amount, product.entitlement_id, next_code)
  returning payment_orders.order_id, payment_orders.provider, payment_orders.product_id, payment_orders.currency,
    payment_orders.price_minor, payment_orders.status, payment_orders.provider_order_id;
end;
$$;

revoke all on function public.create_payment_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_payment_order(uuid, text, text) to service_role;
