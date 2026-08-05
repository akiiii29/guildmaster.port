import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { indexContent } from './content'
import { achievementProgress, reconcileAchievements } from './achievements'
import { claimQuest, collectChest, collectMarketSale, collectWorkshopJob, createInitialState, hireGuest, listMarketItem, queueWorkshopRecipe, startRun, tickGame } from './engine'
import type { GameContent } from './types'

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../public/data/${name}.json`, import.meta.url), 'utf8'))
const content: GameContent = { adventurers: load('adventurers'), enemies: load('enemies'), areas: load('areas'), items: load('items'), pets: load('pets'), quests: load('quests'), messages: load('messages') }

describe('new guild progression e2e', () => {
  it('moves a new guild through a dungeon, crafting, market, quest and raid setup without losing progress', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.chest = [{ itemId: 'BeastPelt', stack: 2 }]
    expect(state.inventory).toEqual([])
    expect(queueWorkshopRecipe(state, index, 'Leather', 1)).toBe(false)
    expect(collectChest(state, 'EnchantedForest', index)).toBe(true)
    expect(queueWorkshopRecipe(state, index, 'Leather', 1)).toBe(true)
    state.workshopQueue[0].remainingSeconds = 1
    tickGame(state, index, 1)
    expect(collectWorkshopJob(state, state.completedWorkshopItems[0].uid, index)).toBe(true)
    const leather = state.inventory.find((stack) => stack.itemId === 'Leather')
    expect(leather?.stack).toBeGreaterThan(0)
    expect(listMarketItem(state, index, 'Leather', 1)).toBe(true)
    state.marketListings[0].remainingSeconds = 1
    tickGame(state, index, 1)
    expect(collectMarketSale(state, index, state.soldMarketItems[0].uid)).toBe(true)
    state.activeQuests = [{ id: 'Annihilator', category: 'King', rarity: 1, progress: 30, target: 30 }]
    expect(claimQuest(state, 'Annihilator')).toBe(true)
    state.unlockedAreas.push('DivineArcheology')
    while (state.adventurers.length < 4) state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid: state.nextAdventurerId++, areaId: null })
    expect(startRun(state, 'DivineArcheology', state.adventurers.map((member) => member.uid), index)).toBe(true)
    reconcileAchievements(state, index)
    expect(state.achievementStats).toMatchObject({ craftedItems: 1, soldItems: 1, claimedQuests: 1 })
    expect(achievementProgress(state, index)).toHaveLength(50)
  })
})
