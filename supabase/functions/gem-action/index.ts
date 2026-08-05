import { createClient } from 'npm:@supabase/supabase-js@2'
import { applyAuthoritativeAction, advanceServerTime, type GameAction } from '../_shared/game/actions.ts'
import { serverContentIndex } from '../_shared/game/content.ts'
import { createInitialState } from '../_shared/game/engine.ts'
import type { GameState } from '../_shared/game/types.ts'

const url = Deno.env.get('SUPABASE_URL')
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
if (!url || !publicKey || !serviceRoleKey) throw new Error('Supabase gem-authority secrets are not configured.')

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const actionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isGameState(value: unknown): value is GameState {
  return isRecord(value)
    && typeof value.version === 'number'
    && typeof value.lastAccess === 'number'
    && typeof value.gems === 'number'
    && Array.isArray(value.inventory)
    && Array.isArray(value.adventurers)
    && isRecord(value.runs)
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
  if (!isRecord(body) || !isRecord(body.action)
    || typeof body.action.id !== 'string' || !actionIdPattern.test(body.action.id)
    || typeof body.action.type !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{1,79}$/.test(body.action.type)
    || !Number.isSafeInteger(body.baseRevision) || body.baseRevision < 0) {
    return json({ error: 'Invalid game action.' }, 400)
  }

  const action: GameAction = { id: body.action.id, type: body.action.type, payload: isRecord(body.action.payload) ? body.action.payload : {} }
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const [{ data: saved, error: readError }, { data: wallet, error: walletError }] = await Promise.all([
    admin.from('game_saves')
      .select('state,revision,authority_mode')
      .eq('account_id', userData.user.id)
      .maybeSingle(),
    admin.from('account_assets')
      .select('balance')
      .eq('account_id', userData.user.id)
      .eq('asset_id', 'gems')
      .maybeSingle(),
  ])
  if (readError || walletError) return json({ error: 'Unable to load authoritative state.' }, 500)

  const index = serverContentIndex()
  // An account without a cloud save may bring its existing browser progress
  // across once. Its legacy gem balance is always discarded below. This is a
  // compatibility migration, not a trusted gameplay reward submission.
  const legacyState = isRecord(body.legacyState) && isGameState(body.legacyState) ? body.legacyState : null
  const state = saved && isGameState(saved.state)
    ? structuredClone(saved.state)
    : legacyState ? structuredClone(legacyState) : createInitialState(index)
  const cutover = saved?.authority_mode !== 'gem_authoritative'
  // Legacy local gems are deliberately discarded at cutover. Paid/redeemed
  // gems already stored in the protected wallet survive and become the mirror.
  const gemsBefore = Math.max(0, Number(wallet?.balance ?? 0))
  state.gems = gemsBefore
  advanceServerTime(state, index)
  if (!applyAuthoritativeAction(state, index, action)) return json({ error: 'This action is not valid for the authoritative game state.' }, 409)

  const { data, error } = await admin.rpc('apply_authoritative_game_state', {
    p_account_id: userData.user.id,
    p_action_id: action.id,
    p_action_type: action.type,
    p_base_revision: body.baseRevision,
    p_state: state,
    p_game_version: state.version,
    p_gems_before: gemsBefore,
    p_gems_after: state.gems,
    p_cutover: cutover,
  })
  const result = Array.isArray(data) ? data[0] : null
  if (error || !result) {
    console.error('apply_authoritative_game_state failed', error)
    return json({ error: 'Unable to save authoritative game state.' }, 500)
  }
  if (result.result_status === 'applied' && state.gems !== gemsBefore) {
    await admin.from('security_audit_log').insert({
      account_id: userData.user.id,
      event_type: 'gem_authority_action',
      outcome: 'allowed',
      request_id: action.id,
      metadata: { action: action.type, delta: state.gems - gemsBefore, balance: state.gems },
    })
  }
  return json({ status: result.result_status, save: { revision: Number(result.revision), gameVersion: Number(result.game_version), updatedAt: result.updated_at, state: result.state } })
})
