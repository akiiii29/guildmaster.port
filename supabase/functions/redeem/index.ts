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

const attemptsPerTenMinutes = 12

async function audit(admin: ReturnType<typeof createClient>, accountId: string, outcome: 'allowed' | 'denied' | 'failed', detail: string) {
  await admin.from('security_audit_log').insert({
    account_id: accountId,
    event_type: 'redeem_code',
    outcome,
    metadata: { detail },
  })
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
  const since = new Date(Date.now() - 10 * 60_000).toISOString()
  const { count, error: attemptsError } = await admin
    .from('redeem_attempts')
    .select('attempt_id', { count: 'exact', head: true })
    .eq('account_id', userData.user.id)
    .gte('attempted_at', since)
  if (attemptsError) return json({ ok: false, message: 'Unable to validate this request.' }, 500)
  if ((count ?? 0) >= attemptsPerTenMinutes) {
    await audit(admin, userData.user.id, 'denied', 'rate_limited')
    return json({ ok: false, message: 'Too many redeem attempts. Please try again later.' }, 429)
  }
  const { error: recordAttemptError } = await admin.from('redeem_attempts').insert({ account_id: userData.user.id })
  if (recordAttemptError) return json({ ok: false, message: 'Unable to validate this request.' }, 500)

  const { data, error } = await admin.rpc('claim_redeem_code', {
    p_account_id: userData.user.id,
    p_code: code,
  })
  const result = Array.isArray(data) ? data[0] : null
  if (error || !result || typeof result.claim_status !== 'string') {
    console.error('claim_redeem_code failed', error)
    await audit(admin, userData.user.id, 'failed', 'backend_error')
    return json({ ok: false, message: 'Unable to redeem this code.' }, 500)
  }
  if (result.claim_status === 'already_claimed') {
    await audit(admin, userData.user.id, 'denied', 'already_claimed')
    return json({ ok: false, message: 'This code has already been redeemed.' }, 400)
  }
  if (result.claim_status === 'invalid') {
    await audit(admin, userData.user.id, 'denied', 'invalid_or_expired')
    return json({ ok: false, message: 'This code is invalid or expired.' }, 400)
  }
  await audit(admin, userData.user.id, 'allowed', result.claim_status)
  if (result.claim_status === 'claimed_asset') {
    return json({ ok: true, message: 'Protected reward credited to your account.', asset: { id: result.asset_id, balance: Number(result.asset_balance) } })
  }
  return json({ ok: true, message: 'Code redeemed.', reward: result.reward })
})
