import { describe, expect, it } from 'vitest'
import { gameStateFingerprint, isGameState, isRemoteSave } from './protocol'
import type { GameState } from '../game/types'

const state = {
  version: 18,
  lastAccess: 123,
  adventurers: [],
  inventory: [],
  buildings: {},
  runs: {},
} as unknown as GameState

describe('cloud sync protocol guards', () => {
  it('accepts the minimum game save shape required by the sync client', () => {
    expect(isGameState(state)).toBe(true)
  })

  it('rejects malformed remote saves', () => {
    expect(isRemoteSave({ revision: 1, gameVersion: 18, updatedAt: '2026-08-04T00:00:00.000Z', state: {} })).toBe(false)
  })

  it('accepts a validated remote save envelope', () => {
    expect(isRemoteSave({ revision: 4, gameVersion: 18, updatedAt: '2026-08-04T00:00:00.000Z', state })).toBe(true)
  })

  it('is stable for an unchanged state and changes with the save payload', () => {
    expect(gameStateFingerprint(state)).toBe(gameStateFingerprint(structuredClone(state)))
    expect(gameStateFingerprint({ ...state, lastAccess: 11 })).not.toBe(gameStateFingerprint(state))
  })
})
