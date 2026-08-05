import { createClient } from 'npm:@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !publicKey || !serviceRoleKey) throw new Error('Supabase redeem secrets are not configured.')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed.' }, 405)
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ ok: false, message: 'Authentication is required.' }, 401)
  const auth = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData } = await auth.auth.getUser(authorization.slice('Bearer '.length))
  if (!userData.user) return json({ ok: false, message: 'Invalid session.' }, 401)

  let body: { code?: unknown }
  try { body = await request.json() } catch { return json({ ok: false, message: 'Request body must be JSON.' }, 400) }
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  if (!/^[A-Z0-9-]{4,64}$/.test(code)) return json({ ok: false, message: 'Invalid code format.' }, 400)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: row, error } = await admin.from('redeem_codes').select('code,reward,active,max_claims,claims,expires_at').eq('code', code).maybeSingle()
  if (error || !row || !row.active || (row.expires_at && Date.parse(row.expires_at) <= Date.now()) || (row.max_claims !== null && row.claims >= row.max_claims)) {
    return json({ ok: false, message: 'This code is invalid or expired.' }, 400)
  }
  const { error: claimError } = await admin.from('redeem_claims').insert({ account_id: userData.user.id, code })
  if (claimError) return json({ ok: false, message: claimError.code === '23505' ? 'This code has already been redeemed.' : 'Unable to redeem this code.' }, 400)
  await admin.from('redeem_codes').update({ claims: row.claims + 1 }).eq('code', code)
  return json({ ok: true, message: 'Code redeemed.', reward: row.reward })
})
