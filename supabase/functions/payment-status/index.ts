import { createClient } from 'npm:@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !publicKey || !serviceRoleKey) throw new Error('Supabase payment-status secrets are not configured.')

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401)

  let body: { orderId?: unknown }
  try { body = await request.json() } catch { return json({ error: 'Request body must be JSON.' }, 400) }
  const orderId = typeof body.orderId === 'string' ? body.orderId : ''
  if (!uuidPattern.test(orderId)) return json({ error: 'Invalid payment order.' }, 400)

  const auth = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData } = await auth.auth.getUser(authorization.slice('Bearer '.length))
  if (!userData.user) return json({ error: 'Invalid session.' }, 401)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: order, error } = await admin.from('payment_orders')
    .select('status')
    .eq('order_id', orderId)
    .eq('account_id', userData.user.id)
    .maybeSingle()
  if (error) return json({ error: 'Unable to load payment order.' }, 500)
  if (!order) return json({ error: 'Payment order was not found.' }, 404)
  return json({ status: order.status })
})
