# Supabase setup

This folder is the versioned backend for account login, cloud-save sync and the
achievement/reward foundation. The browser continues to work entirely locally
until the two public Vite variables are configured.

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
   ```

5. In Supabase, keep the automatically supplied `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`/`SUPABASE_PUBLISHABLE_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` available to the `sync` Edge Function only.

`game_saves` uses an optimistic `revision`. A device whose local snapshot was
based on an older revision receives `conflict` instead of overwriting another
device. `progress_events` and `reward_ledger` are intentionally present before
achievement rules are added, so future rewards can be made idempotent.

Gameplay-only redeem codes live in `redeem_codes`. An administrator can insert
a code such as `WELCOME-LEATHER` with a reward JSON payload like
`{"itemId":"Leather","stack":5}`. The `redeem` function requires a signed-in
account, normalizes codes, and records one claim per account. Do not use this
table for gems, payments, refunds, or IAP entitlements.
