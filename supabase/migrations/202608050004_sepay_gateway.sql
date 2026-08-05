-- SePay identifies an incoming transfer by its numeric `id`; the payer's bank
-- content contains our immutable GM payment code.  The code and expected VND
-- amount are generated server-side and cannot be chosen by the browser.
drop function if exists public.create_payment_order(uuid, text, text);

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
  select * into product from public.payment_products where product_id = p_product_id and active;
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

create or replace function public.complete_sepay_payment(
  p_sepay_id bigint,
  p_payment_code text,
  p_transfer_amount bigint,
  p_gateway text,
  p_reference_code text,
  p_payload_sha256 text
)
returns table (payment_status text, account_id uuid, asset_id text, asset_balance bigint, entitlement_id text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare payment public.payment_orders%rowtype;
declare resulting_asset_balance bigint;
declare event_id text := p_sepay_id::text;
begin
  if p_sepay_id <= 0 or p_payment_code !~ '^GM[A-F0-9]{32}$' or p_transfer_amount <= 0
    or char_length(p_gateway) not between 1 and 63 or p_payload_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid SePay payment.' using errcode = '22023';
  end if;
  select * into payment from public.payment_orders
  where provider = 'sepay' and provider_order_id = p_payment_code for update;
  if not found then raise exception 'Payment code is invalid.' using errcode = '22023'; end if;
  if payment.status = 'paid' then
    return query select 'already_paid'::text, payment.account_id, payment.asset_id, null::bigint, payment.entitlement_id;
    return;
  end if;
  if payment.status <> 'pending' then raise exception 'Payment order is no longer payable.' using errcode = '22023'; end if;
  if payment.price_minor <> p_transfer_amount then raise exception 'Payment amount does not match the order.' using errcode = '22023'; end if;

  insert into public.payment_webhook_events (provider, provider_event_id, order_id, payload_sha256)
  values ('sepay', event_id, payment.order_id, p_payload_sha256)
  on conflict (provider, provider_event_id) do nothing;
  if not found then
    return query select 'duplicate'::text, payment.account_id, payment.asset_id, null::bigint, payment.entitlement_id;
    return;
  end if;

  update public.payment_orders
  set status = 'paid', provider_payment_id = coalesce(nullif(p_reference_code, ''), 'sepay-' || event_id), paid_at = now(),
    metadata = jsonb_build_object('gateway', p_gateway, 'sepayId', p_sepay_id, 'referenceCode', p_reference_code)
  where order_id = payment.order_id;
  if payment.asset_id is not null then
    select balance into resulting_asset_balance from public.grant_protected_asset(
      payment.account_id, payment.asset_id, payment.asset_amount, 'payment', 'sepay-' || event_id,
      jsonb_build_object('gateway', p_gateway, 'sepayId', p_sepay_id));
  end if;
  if payment.entitlement_id is not null then
    perform public.grant_protected_entitlement(
      payment.account_id, payment.entitlement_id, 'payment', 'sepay-' || event_id,
      jsonb_build_object('gateway', p_gateway, 'sepayId', p_sepay_id));
  end if;
  insert into public.security_audit_log (account_id, event_type, outcome, request_id, metadata)
  values (payment.account_id, 'sepay_payment', 'allowed', event_id,
    jsonb_build_object('orderId', payment.order_id, 'amount', p_transfer_amount, 'gateway', p_gateway));
  return query select 'paid'::text, payment.account_id, payment.asset_id, resulting_asset_balance, payment.entitlement_id;
end;
$$;

revoke all on function public.create_payment_order(uuid, text, text) from public, anon, authenticated;
revoke all on function public.complete_sepay_payment(bigint, text, bigint, text, text, text) from public, anon, authenticated;
grant execute on function public.create_payment_order(uuid, text, text) to service_role;
grant execute on function public.complete_sepay_payment(bigint, text, bigint, text, text, text) to service_role;
