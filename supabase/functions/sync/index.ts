import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !publicKey || !serviceRoleKey) throw new Error('Supabase sync secrets are not configured.')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type JsonRecord = Record<string, unknown>

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function validSnapshot(value: unknown) {
  if (!isRecord(value) || !isRecord(value.state)) return false
  return value.protocolVersion === 1
    && typeof value.gameVersion === 'number'
    && typeof value.deviceId === 'string'
    && typeof value.baseRevision === 'number'
    && typeof value.clientUpdatedAt === 'string'
    && typeof value.state.version === 'number'
}

function validEvents(value: unknown) {
  if (value === undefined) return true
  if (!Array.isArray(value) || value.length > 100) return false
  return value.every((event) => isRecord(event)
    && typeof event.id === 'string'
    && typeof event.type === 'string'
    && typeof event.occurredAt === 'string')
}

function toSave(row: JsonRecord) {
  return {
    revision: Number(row.revision),
    gameVersion: Number(row.game_version),
    updatedAt: String(row.updated_at),
    state: row.state,
  }
}

function errorDetail(error: unknown) {
  if (!isRecord(error)) return { code: 'SYNC_UNKNOWN', message: 'Cloud sync backend failed.' }
  return {
    code: typeof error.code === 'string' ? error.code : 'SYNC_UNKNOWN',
    message: typeof error.message === 'string' ? error.message : 'Cloud sync backend failed.',
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401)
  const token = authorization.slice('Bearer '.length)
  const auth = createClient(supabaseUrl, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData, error: userError } = await auth.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'Invalid session.' }, 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be JSON.' }, 400)
  }
  if (!isRecord(body) || body.protocolVersion !== 1 || (body.action !== 'pull' && body.action !== 'push')) {
    return json({ error: 'Invalid sync request.' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  if (body.action === 'pull') {
    const { data, error } = await admin
      .from('game_saves')
      .select('revision, game_version, updated_at, state')
      .eq('account_id', userData.user.id)
      .maybeSingle()
    if (error) return json({ error: 'Unable to load the cloud save.' }, 500)
    return json({ save: data ? toSave(data as JsonRecord) : null })
  }

  if (!validSnapshot(body.snapshot) || !validEvents(body.events)) return json({ error: 'Invalid snapshot or event batch.' }, 400)
  const snapshot = body.snapshot as JsonRecord
  const { data, error } = await admin.rpc('apply_sync_batch', {
    p_account_id: userData.user.id,
    p_state: snapshot.state,
    p_game_version: snapshot.gameVersion,
    p_base_revision: snapshot.baseRevision,
    p_device_id: snapshot.deviceId,
    p_client_updated_at: snapshot.clientUpdatedAt,
    p_events: body.events ?? [],
  })
  if (error || !Array.isArray(data) || !data[0]) {
    const detail = errorDetail(error)
    console.error('apply_sync_batch failed', detail)
    return json({ error: detail.message, code: detail.code }, 500)
  }
  const result = data[0] as JsonRecord
  return json({ status: result.result_status, save: toSave(result), acceptedEvents: Number(result.accepted_events) })
})
