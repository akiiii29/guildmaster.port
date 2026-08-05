# Supabase setup

This folder is the versioned backend for account login, cloud-save sync and the
achievement/reward foundation. The browser continues to work entirely locally
until the two public Vite variables are configured.

## Trust boundary

Before strict-gem mode is enabled, `game_saves.state` is a convenience save
for local gameplay, not a source of truth for money, paid gems, packs,
redeemable value, or competitive ranking. Players can edit a browser save;
such edits must never create a protected asset.

Protected value lives in `account_assets` and `protected_asset_grants`. Both
tables are read-only to the signed-in user. Only a trusted server using the
`service_role` may call `grant_protected_asset`, and its
`(account_id, source_type, source_id, asset_id)` key makes repeated provider
webhooks safe. Do not copy a protected balance into `game_saves.state`.

1. Create a Supabase project and enable Google under **Authentication → Providers**.
2. Add the local and production URLs to the Google OAuth redirect allow-list.
3. Copy `.env.example` to `.env.local`, then set the project URL and **publishable** key.
   Do not put `SUPABASE_SERVICE_ROLE_KEY` in a Vite environment file.
4. Install the Supabase CLI, log in, link the project, and deploy the migration:

   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase functions deploy sync
   supabase functions deploy redeem
   supabase functions deploy payment-order
   supabase functions deploy payment-webhook
   supabase functions deploy wallet
   supabase functions deploy gem-action
   ```

5. In Supabase, keep the automatically supplied `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`/`SUPABASE_PUBLISHABLE_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` available to the `sync` Edge Function only.

`game_saves` uses an optimistic `revision`. A device whose local snapshot was
based on an older revision receives `conflict` instead of overwriting another
device. `progress_events` and `reward_ledger` are intentionally present before
achievement rules are added, so future rewards can be made idempotent.

Gameplay-only redeem codes can use the legacy reward shape
`{"itemId":"Leather","stack":5}`. A protected redeem reward uses
`{"kind":"protected_asset","assetId":"gems","amount":100}`. Claiming is
atomic: the server locks the code, checks the global cap, records the account
claim, and credits the protected wallet in one transaction. The Edge Function
also limits each account to 12 attempts per 10 minutes.

## Strict server gems

Set `VITE_GEM_AUTHORITY=true` only after migration `202608050005` and the
`gem-action` Function have been deployed. A signed-in account is migrated by
its next game tick:

- The old browser gem total is reset to `0`.
- Existing game progress is retained once to make migration non-destructive.
- `account_assets(asset_id = 'gems')` becomes the canonical balance; the gem
  field in the game state is a server-written UI mirror only.
- The server replays game time on actions and authorizes each gem-changing
  intent: King Quest claims, Geodes, quest refresh, gem-priced Merchant offers
  and Raid refills. It records every intent idempotently and rejects offline
  gem-changing actions.

Payment/redeem credits are written directly to `account_assets`; the next
authoritative action refreshes the UI mirror. Browser edits can still change a
temporary display, but cannot spend, earn or persist server gems.

The one-time legacy progress migration necessarily trusts non-gem progress
already held by the player (for example an unclaimed old quest or Geode). If
that is unacceptable, reset inventory and quests as well instead of retaining
progress. After the account crosses over, those actions are server-verified.

## Payments and leaderboard

Set these server secrets before deploying payment functions:

```sh
supabase secrets set SEPAY_WEBHOOK_SECRET=the-hmac-secret-created-in-sepay
supabase secrets set APP_ORIGIN=https://your-domain.example
```

`payment-order` accepts only a `productId`; price, currency, asset amount and
pack entitlement are copied from the server-owned `payment_products` catalog.
Create catalog entries as an administrator, for example a gem pack with
`asset_id = 'gems'`, or a pack with `entitlement_id = 'starter_pack'`.

## SePay webhook

The payment backend is configured specifically for SePay. In SePay create a
webhook for **Có tiền vào**, select **HMAC-SHA256**, and use:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-webhook
```

SePay signs the raw body with `X-SePay-Signature` and `X-SePay-Timestamp`. The
function verifies the official `{timestamp}.{raw_body}` HMAC format, rejects
requests older than five minutes, accepts only incoming transfers, and returns
`{"success":true}` for an accepted delivery.

Each call to `payment-order` returns a unique `payment_code` such as
`GM<32_HEX_CHARS>`. Put that exact code in the dynamic VietQR transfer content
shown to the signed-in buyer. The SePay `content` must contain this code and
`transferAmount` must equal the server-owned VND product price. The transaction
`id` is unique and is used to make SePay retries safe. A single static QR image
cannot safely identify a buyer or an order; use per-order dynamic QR content.

SePay sends a raw JSON payload like:

```json
{
  "id": 92704,
  "gateway": "Vietcombank",
  "content": "GM... chuyen tien",
  "transferType": "in",
  "transferAmount": 500000
}
```

The function de-duplicates the SePay event, locks the order, and grants
assets/entitlements in one database transaction. Never grant from a QR scan,
browser redirect, client amount, or client-supplied payment ID. See SePay's
[webhook guide](https://docs.sepay.vn/tich-hop-webhooks.html) and
[HMAC authentication specification](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc).

Signed-in clients can read their protected balance, active packs and role via
the `wallet` function. This is a display/account API only; it does not grant or
debit anything. A future gem-spend endpoint must authorize the specific
server-verified game action before calling `spend_protected_asset`.

Do not build an official leaderboard from `game_saves`, local gems, or browser
stats. It must be written through `record_official_leaderboard_result` only by
a server-verified competition event. A purely local-score board should be
labelled unverified. `security_audit_log` records redeem, payment-order,
webhook and protected-spend decisions; `account_roles` defaults new accounts to
`player` and can only be changed through trusted server administration.
