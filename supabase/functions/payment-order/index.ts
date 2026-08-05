import { createClient } from 'npm:@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !publicKey || !serviceRoleKey) throw new Error('Supabase payment-order secrets are not configured.')
const paymentProvider = 'sepay'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401)
  const auth = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData } = await auth.auth.getUser(authorization.slice('Bearer '.length))
  if (!userData.user) return json({ error: 'Invalid session.' }, 401)

  let body: unknown
  try { body = await request.json() } catch { return json({ error: 'Request body must be JSON.' }, 400) }
  const productId = isRecord(body) && typeof body.productId === 'string' ? body.productId : ''
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(productId)) return json({ error: 'Invalid payment product.' }, 400)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const since = new Date(Date.now() - 10 * 60_000).toISOString()
  const { count, error: rateError } = await admin.from('security_audit_log')
    .select('audit_id', { count: 'exact', head: true })
    .eq('account_id', userData.user.id)
    .eq('event_type', 'payment_order_created')
    .gte('created_at', since)
  if (rateError) return json({ error: 'Unable to validate this request.' }, 500)
  if ((count ?? 0) >= 5) return json({ error: 'Too many payment-order requests. Please try again later.' }, 429)

  const { data, error } = await admin.rpc('create_payment_order', {
    p_account_id: userData.user.id,
    p_product_id: productId,
    p_provider: paymentProvider,
  })
  const order = Array.isArray(data) ? data[0] : null
  if (error || !order) {
    console.error('create_payment_order failed', error)
    return json({ error: 'Unable to create a payment order.' }, 400)
  }
  await admin.from('security_audit_log').insert({
    account_id: userData.user.id,
    event_type: 'payment_order_created',
    outcome: 'allowed',
    request_id: String(order.order_id),
    metadata: { productId, provider: paymentProvider },
  })
  return json({ order })
})
