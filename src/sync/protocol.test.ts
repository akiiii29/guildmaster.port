import { describe, expect, it } from 'vitest'
import { isGameState, isRemoteSave } from './protocol'

const state = {
  version: 18,
  lastAccess: 123,
  adventurers: [],
  inventory: [],
  buildings: {},
  runs: {},
}

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
})
