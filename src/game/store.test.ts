import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { indexContent } from './content'
import { createInitialState } from './engine'
import { GameStore } from './store'
import type { GameContent } from './types'

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../public/data/${name}.json`, import.meta.url), 'utf8'))
const content: GameContent = { adventurers: load('adventurers'), enemies: load('enemies'), areas: load('areas'), items: load('items'), pets: load('pets'), quests: load('quests'), messages: load('messages') }
const index = indexContent(content)
const memory = new Map<string, string>()

beforeEach(() => {
  memory.clear()
  vi.stubGlobal('localStorage', { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) })
})

afterEach(() => vi.unstubAllGlobals())

describe('save migrations', () => {
  it('migrates every supported save version without dropping new achievement state', () => {
    for (let version = 1; version <= 24; version += 1) {
      const legacy = structuredClone(createInitialState(index)) as unknown as Record<string, unknown>
      legacy.version = version
      delete legacy.achievementStats
      delete legacy.unlockedAchievements
      if (version < 22) delete (legacy.buildings as Record<string, unknown>).shelterAutofeed
      memory.set('guild-master-web-save-v1', JSON.stringify(legacy))

      const store = new GameStore(index)
      const migrated = store.getSnapshot()
      expect(migrated.version).toBe(25)
      expect(migrated.achievementStats).toEqual(expect.objectContaining({ craftedItems: 0, soldItems: 0, claimedQuests: 0 }))
      expect(Array.isArray(migrated.unlockedAchievements)).toBe(true)
      expect(migrated.buildings.shelterAutofeed).toBe(0)
      expect(Array.isArray(migrated.knownRecipes)).toBe(true)
    }
  })

  it('rejects malformed backups without overwriting the active guild', () => {
    const store = new GameStore(index)
    const before = store.getSnapshot()
    expect(store.importSave('{not json')).toMatchObject({ ok: false })
    expect(store.getSnapshot()).toEqual(before)
    expect(store.importSave(JSON.stringify({ format: 'guild-master-web-save', state: { version: 999 } }))).toMatchObject({ ok: false })
    expect(store.getSnapshot()).toEqual(before)
  })

  it('exports and restores a versioned backup through the same migration path', () => {
    const source = new GameStore(index)
    source.setLanguage('vi')
    const backup = source.exportSave()
    const target = new GameStore(index)
    expect(target.importSave(backup)).toMatchObject({ ok: true })
    expect(target.getSnapshot()).toMatchObject({ version: 25, language: 'vi' })
  })
})
