import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { GameState } from '../game/types'
import { SyncQueue } from './queue'
import { gameStateFingerprint, isRemoteSave, SYNC_PROTOCOL_VERSION, type CloudSyncStatus, type RemoteSave, type SyncSnapshot } from './protocol'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export interface GameSync {
  initialize(): Promise<void>
  getStatus(): CloudSyncStatus
  subscribe(listener: () => void): () => void
  getUser(): User | null
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  queueSnapshot(state: GameState): void
  syncNow(state?: GameState): Promise<CloudSyncStatus>
  pullLatest(): Promise<RemoteSave | null>
  adoptRemote(save: RemoteSave): Promise<void>
  redeemCode(code: string): Promise<{ ok: boolean; message: string; reward?: { itemId: string; stack: number } }>
  isGemAuthorityEnabled(): boolean
  applyGemAuthorityAction(action: { id: string; type: string; payload?: Record<string, unknown> }, legacyState?: GameState): Promise<RemoteSave | null>
}

const gemAuthorityEnabled = import.meta.env.VITE_GEM_AUTHORITY === 'true'

export function isCloudSyncConfigured() {
  return Boolean(supabaseUrl && supabaseKey)
}

function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

async function messageFrom(error: unknown) {
  if (isRecord(error) && error.context instanceof Response) {
    try {
      const payload = await error.context.clone().json() as unknown
      if (isRecord(payload) && typeof payload.error === 'string') {
        return typeof payload.code === 'string' ? `${payload.error} (${payload.code})` : payload.error
      }
    } catch {
      // Fall back to the SDK error when the response does not contain JSON.
    }
  }
  return error instanceof Error ? error.message : String(error)
}

class SupabaseGameSync implements GameSync {
  private readonly queue = new SyncQueue()
  private readonly listeners = new Set<() => void>()
  private readonly client: SupabaseClient
  private status: CloudSyncStatus = { kind: 'signed-out' }
  private user: User | null = null
  private timer: number | undefined
  private hasUnresolvedConflict = false

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async initialize() {
    const { data, error } = await this.client.auth.getSession()
    if (error) {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
      return
    }
    this.user = data.session?.user ?? null
    if (this.user) await this.queue.ensureAccount(this.user.id)
    const revision = await this.queue.getServerRevision()
    this.setStatus(this.user ? { kind: 'idle', revision } : { kind: 'signed-out' })
    this.client.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user ?? null
      void this.refreshAfterAuthChange()
    })
  }

  getStatus = () => this.status

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getUser = () => this.user

  async signInWithGoogle() {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) this.setStatus({ kind: 'error', message: await messageFrom(error) })
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
      return
    }
    this.user = null
    this.setStatus({ kind: 'signed-out' })
  }

  queueSnapshot(state: GameState) {
    if (gemAuthorityEnabled) return
    if (!this.user) return
    void this.enqueueSnapshot(state).then(() => {
      if (!this.hasUnresolvedConflict) this.scheduleSync()
    }).catch(async (error: unknown) => {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
    })
  }

  async syncNow(state?: GameState) {
    if (gemAuthorityEnabled) {
      await this.pullLatest()
      return this.status
    }
    if (this.hasUnresolvedConflict) return this.status
    if (state) await this.enqueueSnapshot(state)
    return this.flush()
  }

  async pullLatest(): Promise<RemoteSave | null> {
    if (!this.user) {
      this.setStatus({ kind: 'signed-out' })
      return null
    }
    if (isOffline()) {
      this.setStatus({ kind: 'offline' })
      return null
    }
    this.setStatus({ kind: 'syncing' })
    const { data, error } = await this.client.functions.invoke('sync', { body: { action: 'pull', protocolVersion: SYNC_PROTOCOL_VERSION } })
    if (error) {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
      return null
    }
    const save = (data as { save?: unknown }).save
    if (!save) {
      const revision = await this.queue.getServerRevision()
      this.setStatus({ kind: 'idle', revision })
      return null
    }
    if (!isRemoteSave(save)) {
      this.setStatus({ kind: 'error', message: 'The server returned an invalid save.' })
      return null
    }
    await this.queue.setServerRevision(save.revision)
    this.setStatus({ kind: 'idle', revision: save.revision })
    return save
  }

  async adoptRemote(save: RemoteSave) {
    await Promise.all([
      this.queue.setServerRevision(save.revision),
      this.queue.setSyncedFingerprint(gameStateFingerprint(save.state)),
      this.queue.clear(),
    ])
    this.hasUnresolvedConflict = false
    this.setStatus({ kind: 'idle', revision: save.revision })
  }

  async redeemCode(code: string) {
    if (!this.user) return { ok: false, message: 'Sign in before redeeming a code.' }
    const { data, error } = await this.client.functions.invoke('redeem', { body: { code } })
    if (error || !isRecord(data) || typeof data.ok !== 'boolean' || typeof data.message !== 'string') {
      return { ok: false, message: error ? await messageFrom(error) : 'Redeem service returned an invalid response.' }
    }
    const reward = isRecord(data.reward) && typeof data.reward.itemId === 'string' && typeof data.reward.stack === 'number'
      ? { itemId: data.reward.itemId, stack: data.reward.stack }
      : undefined
    return { ok: data.ok, message: data.message, reward }
  }

  isGemAuthorityEnabled = () => gemAuthorityEnabled

  async applyGemAuthorityAction(action: { id: string; type: string; payload?: Record<string, unknown> }, legacyState?: GameState) {
    if (!gemAuthorityEnabled || !this.user) return null
    if (isOffline()) {
      this.setStatus({ kind: 'offline' })
      return null
    }
    const baseRevision = await this.queue.getServerRevision()
    this.setStatus({ kind: 'syncing' })
    const { data, error } = await this.client.functions.invoke('gem-action', {
      body: { baseRevision, action, legacyState: legacyState ? structuredClone(legacyState) : undefined },
    })
    if (error) {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
      return null
    }
    const response = data as { status?: string; save?: unknown }
    if (!isRemoteSave(response.save)) {
      this.setStatus({ kind: 'error', message: 'The server returned an invalid authoritative save.' })
      return null
    }
    const save = response.save
    await this.queue.setServerRevision(save.revision)
    if (response.status === 'conflict') {
      this.hasUnresolvedConflict = true
      this.setStatus({ kind: 'conflict', remote: save })
      return null
    }
    this.hasUnresolvedConflict = false
    this.setStatus({ kind: 'idle', revision: save.revision })
    return save
  }

  private async refreshAfterAuthChange() {
    if (this.user) await this.queue.ensureAccount(this.user.id)
    const revision = await this.queue.getServerRevision()
    this.setStatus(this.user ? { kind: 'idle', revision } : { kind: 'signed-out' })
    if (this.user) {
      if (!gemAuthorityEnabled) void this.flush()
    }
  }

  private async enqueueSnapshot(state: GameState) {
    const fingerprint = gameStateFingerprint(state)
    const [queued, syncedFingerprint] = await Promise.all([this.queue.peek(), this.queue.getSyncedFingerprint()])
    if (queued?.fingerprint === fingerprint || (!queued && syncedFingerprint === fingerprint)) return false

    const [deviceId, baseRevision] = await Promise.all([this.queue.getDeviceId(), this.queue.getServerRevision()])
    const snapshot: SyncSnapshot = {
      protocolVersion: SYNC_PROTOCOL_VERSION,
      gameVersion: state.version,
      deviceId,
      baseRevision,
      clientUpdatedAt: new Date(state.lastAccess).toISOString(),
      state: structuredClone(state),
    }
    await this.queue.enqueue(snapshot, fingerprint)
    return true
  }

  private scheduleSync() {
    if (this.timer || !this.user) return
    this.timer = window.setTimeout(() => {
      this.timer = undefined
      void this.flush()
    }, 1_500)
  }

  private async flush(): Promise<CloudSyncStatus> {
    if (this.hasUnresolvedConflict) return this.status
    if (!this.user) {
      this.setStatus({ kind: 'signed-out' })
      return this.status
    }
    if (isOffline()) {
      this.setStatus({ kind: 'offline' })
      return this.status
    }
    const queued = await this.queue.peek()
    if (!queued) {
      const revision = await this.queue.getServerRevision()
      this.setStatus({ kind: 'idle', revision })
      return this.status
    }
    this.setStatus({ kind: 'syncing' })
    const { data, error } = await this.client.functions.invoke('sync', {
      body: { action: 'push', protocolVersion: SYNC_PROTOCOL_VERSION, snapshot: queued.snapshot },
    })
    if (error) {
      this.setStatus({ kind: 'error', message: await messageFrom(error) })
      return this.status
    }
    const response = data as { status?: string; save?: unknown }
    if (!isRemoteSave(response.save)) {
      this.setStatus({ kind: 'error', message: 'The server returned an invalid sync response.' })
      return this.status
    }
    await this.queue.setServerRevision(response.save.revision)
    if (response.status === 'conflict') {
      this.hasUnresolvedConflict = true
      this.setStatus({ kind: 'conflict', remote: response.save })
      return this.status
    }
    await this.queue.setSyncedFingerprint(queued.fingerprint)
    this.hasUnresolvedConflict = false
    await this.queue.removeIfCurrent(queued.queuedAt)
    this.setStatus({ kind: 'idle', revision: response.save.revision })
    return this.status
  }

  private setStatus(status: CloudSyncStatus) {
    this.status = status
    this.listeners.forEach((listener) => listener())
  }
}

export function createGameSync(): GameSync | null {
  if (!supabaseUrl || !supabaseKey) return null
  return new SupabaseGameSync(createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }))
}
