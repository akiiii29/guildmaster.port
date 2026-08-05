import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ACHIEVEMENTS, reconcileAchievements } from './achievements'
import { indexContent } from './content'
import { createInitialState } from './engine'
import type { GameContent } from './types'

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../public/data/${name}.json`, import.meta.url), 'utf8'))
const content: GameContent = { adventurers: load('adventurers'), enemies: load('enemies'), areas: load('areas'), items: load('items'), pets: load('pets'), quests: load('quests'), messages: load('messages') }

describe('achievement parity', () => {
  it('contains every official milestone exactly once', () => {
    expect(ACHIEVEMENTS).toHaveLength(50)
    expect(new Set(ACHIEVEMENTS.map((achievement) => achievement.id)).size).toBe(50)
  })

  it('unlocks completed milestones once without any in-game currency reward', () => {
    const state = createInitialState(indexContent(content))
    state.achievementStats.craftedItems = 100
    state.money = 1_000

    const firstUnlock = reconcileAchievements(state, indexContent(content))
    expect(state.unlockedAchievements).toEqual(expect.arrayContaining(['apprentice_blacksmith', 'wealthy']))
    expect(state.money).toBe(1_000)
    expect(firstUnlock).toEqual(expect.arrayContaining(['apprentice_blacksmith', 'wealthy']))

    const unlockedCount = state.unlockedAchievements.length
    expect(reconcileAchievements(state, indexContent(content))).toEqual([])
    expect(state.unlockedAchievements).toHaveLength(unlockedCount)
  })
})
