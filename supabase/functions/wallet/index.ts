import { createClient } from 'npm:@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
if (!url || !publicKey) throw new Error('Supabase wallet secrets are not configured.')

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401)
  const client = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  })
  const { data: userData } = await client.auth.getUser(authorization.slice('Bearer '.length))
  if (!userData.user) return json({ error: 'Invalid session.' }, 401)

  // RLS permits this client to read only its own wallet, entitlements and role.
  const [assets, entitlements, role] = await Promise.all([
    client.from('account_assets').select('asset_id,balance,updated_at').order('asset_id'),
    client.from('account_entitlements').select('entitlement_id,active,granted_at').eq('active', true).order('entitlement_id'),
    client.from('account_roles').select('role').maybeSingle(),
  ])
  if (assets.error || entitlements.error || role.error) return json({ error: 'Unable to load protected account data.' }, 500)
  return json({ assets: assets.data ?? [], entitlements: entitlements.data ?? [], role: role.data?.role ?? 'player' })
})
