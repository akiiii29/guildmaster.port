import type { GameState } from '../game/types'

export const SYNC_PROTOCOL_VERSION = 1

export interface SyncSnapshot {
  protocolVersion: number
  gameVersion: number
  deviceId: string
  baseRevision: number
  clientUpdatedAt: string
  state: GameState
}

export interface RemoteSave {
  revision: number
  gameVersion: number
  updatedAt: string
  state: GameState
}

/**
 * A compact, deterministic fingerprint of the full persisted game state.
 * It is only used to avoid uploading a snapshot that the cloud has already
 * accepted; the server remains the authority for revisions and conflicts.
 */
export function gameStateFingerprint(state: GameState) {
  const serialized = JSON.stringify(state)
  let hash = 0x811c9dc5
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${serialized.length}:${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export type CloudSyncStatus =
  | { kind: 'disabled' }
  | { kind: 'signed-out' }
  | { kind: 'idle'; revision: number }
  | { kind: 'syncing' }
  | { kind: 'offline' }
  | { kind: 'conflict'; remote: RemoteSave }
  | { kind: 'error'; message: string }

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<GameState>
  return typeof candidate.version === 'number'
    && typeof candidate.lastAccess === 'number'
    && Array.isArray(candidate.adventurers)
    && Array.isArray(candidate.inventory)
    && !!candidate.buildings
    && !!candidate.runs
}

export function isRemoteSave(value: unknown): value is RemoteSave {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<RemoteSave>
  return typeof candidate.revision === 'number'
    && typeof candidate.gameVersion === 'number'
    && typeof candidate.updatedAt === 'string'
    && isGameState(candidate.state)
}
