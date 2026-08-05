import { createClient } from 'npm:@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const webhookSecret = Deno.env.get('SEPAY_WEBHOOK_SECRET')
if (!url || !serviceRoleKey || !webhookSecret) throw new Error('SePay webhook secrets are not configured.')

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function hexBytes(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null
  return Uint8Array.from(value.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)))
}

async function hmacMatches(payload: string, timestamp: string | null, value: string | null) {
  const signature = hexBytes(value?.replace(/^sha256=/i, '') ?? '')
  const unixSeconds = Number(timestamp)
  if (!signature || !Number.isInteger(unixSeconds) || Math.abs(Date.now() / 1_000 - unixSeconds) > 300) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(`${timestamp}.${payload}`))
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function auditDenied(admin: ReturnType<typeof createClient>, request: Request, reason: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const ipHash = ip ? await sha256(ip) : null
  await admin.from('security_audit_log').insert({ event_type: 'payment_webhook', outcome: 'denied', ip_hash: ipHash, metadata: { reason } })
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const raw = await request.text()
  if (!await hmacMatches(raw, request.headers.get('x-sepay-timestamp'), request.headers.get('x-sepay-signature'))) {
    await auditDenied(admin, request, 'invalid_signature')
    return json({ error: 'Invalid webhook signature.' }, 401)
  }

  let body: unknown
  try { body = JSON.parse(raw) } catch { return json({ error: 'Request body must be JSON.' }, 400) }
  const content = isRecord(body) && typeof body.content === 'string' ? body.content.toUpperCase() : ''
  const paymentCode = content.match(/(?:^|[^A-Z0-9])(GM[A-F0-9]{32})(?:$|[^A-Z0-9])/)?.[1] ?? ''
  if (!isRecord(body)
    || !Number.isSafeInteger(body.id)
    || typeof body.gateway !== 'string'
    || typeof body.transferAmount !== 'number'
    || !Number.isSafeInteger(body.transferAmount)
    || body.transferType !== 'in'
    || !paymentCode) {
    await auditDenied(admin, request, 'invalid_payload')
    return json({ error: 'Invalid payment webhook.' }, 400)
  }

  const { data, error } = await admin.rpc('complete_sepay_payment', {
    p_sepay_id: body.id,
    p_payment_code: paymentCode,
    p_transfer_amount: body.transferAmount,
    p_gateway: body.gateway,
    p_reference_code: typeof body.referenceCode === 'string' ? body.referenceCode : '',
    p_payload_sha256: await sha256(raw),
  })
  const result = Array.isArray(data) ? data[0] : null
  if (error || !result) {
    console.error('complete_verified_payment failed', error)
    await auditDenied(admin, request, 'payment_rejected')
    return json({ error: 'Payment could not be credited.' }, 400)
  }
  return json({ success: true, status: result.payment_status })
})
