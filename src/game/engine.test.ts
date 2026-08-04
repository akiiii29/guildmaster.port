/// <reference types="node" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { indexContent } from './content'
import { areaTeamSize, ascendAdventurer, buyMerchantOffer, buyQuestRefresh, cancelMarketListing, changeDoctrineAbility, claimQuest, collectChest, collectMarketSale, collectWorkshopJob, combatTurn, completedEpicRaid, consumePotion, consumeSpecial, createInitialState, dismissAdventurer, equipItem, feedPet, hatchPetEgg, hireGuest, incrementQuest, listMarketItem, markTavernGuestsSeen, mergePet, moveAdventurer, openGeodes, potionLimit, promoteAdventurer, promotionChoices, progressTavernTime, queueWorkshopRecipe, questRefreshPrice, raidTryCost, recallAdventurer, refillRaidTry, refreshDailyRaidTries, refreshMerchantCooldowns, refreshMerchantRegular, refreshMerchantSpecial, refreshQuests, releasePet, resetDoctrine, retreatRun, selectDoctrine, setTavernLocked, startRun, tickGame, togglePetFavourite, upgradeFacility, upgradeMarket, upgradeShelter, upgradeTavern } from './engine'
import { adventurerAttackBounds, applyDamage, buildingCapacity, experienceToNextLevel, marketListingsCapacity, marketListingsPrice, marketSaleSeconds, marketTimePrice, offlineSeconds, quartersPrice, shelterAutofeedPrice, shelterPrice, storagePrice, tavernCapacityPrice, tavernTimePrice, workshopCraftSeconds, workshopQueueCapacity, workshopQueuePrice, workshopTimePrice } from './formulas'
import { RECIPES } from './recipes'
import { adventurerStats } from './stats'
import type { GameContent } from './types'
import { ACTIVE_SKILLS } from './combatSkills'
import { doctrinePointsAvailable, doctrinePointsFromLevels } from './doctrines'

const content: GameContent = {
  adventurers: [
    {
      id: 'Footman', name: 'Footman', description: '', imageKey: 'unit_footman',
      fields: { maxLevel: 5, baseMaxHp: 40, baseConstitution: 8, baseIntelligence: 4, baseDexterity: 4, baseDefense: 20, baseMagicDefense: 20, activeSkill: 'ACTIVE_MIGHTY_STRIKE', weaponType: { key: 'type_sword' }, armorType: { key: 'type_armor_heavy' } },
    },
    {
      id: 'LightDisciple', name: 'Light Disciple', description: '', imageKey: 'unit_light_disciple',
      fields: { maxLevel: 10, baseMaxHp: 25, baseConstitution: 3, baseIntelligence: 15, baseDexterity: 5, baseDefense: 0, baseMagicDefense: 30, weaponType: { key: 'type_staff' }, armorType: { key: 'type_armor_light' } },
    },
    {
      id: 'Archer', name: 'Archer', description: '', imageKey: 'unit_archer',
      fields: { maxLevel: 5, baseMaxHp: 30, baseConstitution: 4, baseIntelligence: 4, baseDexterity: 8, baseDefense: 10, baseMagicDefense: 10, weaponType: { key: 'type_bow' }, armorType: { key: 'type_armor_medium' } },
    },
  ],
  enemies: [{
    id: 'TutorialWolf', name: 'Wolf', description: '', imageKey: 'unit_wolf', minDamage: 1, maxDamage: 1, drops: [{ item: 'BeastPelt', stack: 1, weight: 1000 }],
    fields: { baseMaxHp: 2, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 12 },
  }, {
    id: 'TestDummy', name: 'Training Golem', description: '', imageKey: 'unit_ent', minDamage: 10, maxDamage: 10, drops: [],
    fields: { baseMaxHp: 1000, baseConstitution: 20, baseIntelligence: 20, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 0, activeSkill: 'ACTIVE_STOMP' },
  }],
  areas: [{ id: 'EnchantedForest', name: 'Enchanted Forest', areaType: 0, enemies: ['TutorialWolf'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '' }],
  items: [
    { id: 'BeastPelt', name: 'Beast Pelt', description: '', imageKey: 'beast_pelt', type: 'Item', fields: { price: 1 } },
    { id: 'Leather', name: 'Leather', description: '', imageKey: 'leather', type: 'Item', fields: { price: 3 } },
    { id: 'CopperIngot', name: 'Copper Ingot', description: '', imageKey: 'copper_ingot', type: 'Item', fields: { price: 5 } },
    { id: 'CopperArmor', name: 'Copper Armor', description: '', imageKey: 'copper_armor', type: 'HeavyArmor', fields: { price: 20, maxHp: 30, constitution: 1 } },
    { id: 'Spade', name: 'Spade', description: '', imageKey: 'spade', type: 'Sword', fields: { price: 0, constitution: 1 } },
    { id: 'Cane', name: 'Cane', description: '', imageKey: 'cane', type: 'Staff', fields: { price: 0, intelligence: 1 } },
    { id: 'TrainingBow', name: 'Training Bow', description: '', imageKey: 'training_bow', type: 'Bow', fields: { price: 0, dexterity: 1 } },
  ],
}

describe('original-compatible game loop', () => {
  it('queues, processes, cancels, and collects market listings with original timing', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    state.purchasedPacks = { starter: false, merchant: false }
    state.inventory.push({ itemId: 'BeastPelt', stack: 5 })
    expect(marketSaleSeconds(1, 2, 0)).toBe(8)
    expect(listMarketItem(state, index, 'BeastPelt', 2)).toBe(true)
    expect(listMarketItem(state, index, 'BeastPelt', 1)).toBe(false)
    tickGame(state, index, 8)
    expect(state.soldMarketItems).toHaveLength(0)
    tickGame(state, index, 1)
    expect(state.soldMarketItems).toHaveLength(1)
    expect(collectMarketSale(state, index, state.soldMarketItems[0].uid)).toBe(true)
    expect(state.money).toBe(2)

    state.buildings.marketListings = 1
    expect(listMarketItem(state, index, 'BeastPelt', 2)).toBe(true)
    expect(cancelMarketListing(state, state.marketListings[0].uid)).toBe(true)
    expect(state.inventory.find((entry) => entry.itemId === 'BeastPelt')?.stack).toBe(3)
  })

  it('uses exact market upgrade prices and caps', () => {
    const state = createInitialState(indexContent(content))
    expect(marketListingsPrice(0)).toBe(20)
    expect(marketTimePrice(0)).toBe(10)
    state.money = 30
    expect(upgradeMarket(state, 'listings')).toBe(true)
    expect(upgradeMarket(state, 'time')).toBe(true)
    expect(state.money).toBe(0)
    state.buildings.marketListings = 10
    state.buildings.marketTime = 25
    state.money = Number.MAX_SAFE_INTEGER
    expect(upgradeMarket(state, 'listings')).toBe(false)
    expect(upgradeMarket(state, 'time')).toBe(false)
  })

  it('applies Starter and Merchant Pack bonuses to the market as in the APK', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(state.purchasedPacks).toEqual({ starter: true, merchant: true })
    expect(marketListingsCapacity(0, 0, true, true)).toBe(4)
    expect(marketSaleSeconds(100, 1, 0, 0, true)).toBe(266)

    state.inventory.push({ itemId: 'BeastPelt', stack: 1 })
    expect(listMarketItem(state, index, 'BeastPelt', 1)).toBe(true)
    expect(state.marketListings[0].totalSeconds).toBe(marketSaleSeconds(1, 1, 0, 0, true) + 1)
  })

  it('applies the enabled packs to every capacity and Workshop craft speed', () => {
    const state = createInitialState(indexContent(content))
    expect(buildingCapacity('quarters', 0, 0, state.purchasedPacks)).toBe(3)
    expect(buildingCapacity('tavern', 0, 0, state.purchasedPacks)).toBe(2)
    expect(buildingCapacity('storage', 0, 0, state.purchasedPacks)).toBe(140)
    expect(workshopQueueCapacity(0, 0, true, true)).toBe(4)
    expect(workshopCraftSeconds(20, 2, 0, 0, true)).toBe(152)
  })

  it('ports all 321 APK Workshop recipes', () => {
    expect(RECIPES).toHaveLength(321)
    expect(new Set(RECIPES.map((recipe) => recipe.id)).size).toBe(321)
  })

  it('rolls and buys regular and special merchant offers from unlocked area tables', () => {
    const variant = structuredClone(content)
    variant.areas[0].regularMerchantOffers = [{ item: 'BeastPelt', stack: 3, weight: 240 }]
    variant.areas[0].specialMerchantOffers = [{ item: 'CopperArmor', stack: 1, weight: 91 }]
    const index = indexContent(variant)
    const state = createInitialState(index)
    refreshMerchantRegular(state, index, () => 0)
    refreshMerchantSpecial(state, index, () => 0)
    expect(state.merchantRegularStock[0]).toMatchObject({ itemId: 'BeastPelt', stack: 3, price: 30, gems: false })
    expect(state.merchantSpecialStock[0]).toMatchObject({ itemId: 'CopperArmor', stack: 1, price: 55, gems: true })
    state.money = 30
    state.gems = 55
    expect(buyMerchantOffer(state, state.merchantRegularStock[0].uid)).toBe(true)
    expect(buyMerchantOffer(state, state.merchantSpecialStock[0].uid)).toBe(true)
    expect(state.inventory).toEqual(expect.arrayContaining([{ itemId: 'BeastPelt', stack: 3 }, { itemId: 'CopperArmor', stack: 1 }]))
    expect(state).toMatchObject({ money: 0, gems: 0 })
  })

  it('refreshes merchant stock at local daily and weekly boundaries', () => {
    const variant = structuredClone(content)
    variant.areas[0].regularMerchantOffers = [{ item: 'BeastPelt', stack: 3, weight: 1 }]
    variant.areas[0].specialMerchantOffers = [{ item: 'CopperArmor', stack: 1, weight: 1 }]
    const index = indexContent(variant)
    const state = createInitialState(index)
    const base = new Date(2026, 7, 2, 12).getTime()
    state.lastMerchantRegularReset = new Date(2026, 7, 1).getTime()
    state.lastMerchantSpecialReset = new Date(2026, 6, 26).getTime()
    expect(refreshMerchantCooldowns(state, index, base, () => 0.99)).toBe(true)
    expect(state.merchantRegularStock[0]).toMatchObject({ itemId: 'BeastPelt' })
    expect(state.merchantSpecialStock[0]).toMatchObject({ itemId: 'CopperArmor' })
    expect(refreshMerchantCooldowns(state, index, base, () => 0)).toBe(false)
  })

  it('consumes permanent upgrades instead of putting them in storage', () => {
    const state = createInitialState(indexContent(content))
    state.gems = 500
    state.merchantSpecialStock.push({ uid: 1, itemId: 'UpgradeMarketQueue', stack: 1, price: 500, gems: true, special: true })
    expect(buyMerchantOffer(state, 1)).toBe(true)
    expect(state.permanentUpgrades.UpgradeMarketQueue).toBe(1)
    expect(state.inventory.some((entry) => entry.itemId === 'UpgradeMarketQueue')).toBe(false)
  })

  it('promotes at max level while preserving identity, equipment, and traits', () => {
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'Warrior', name: 'Warrior', description: '', imageKey: 'unit_warrior',
      fields: { maxLevel: 10, baseMaxHp: 50, baseConstitution: 10, baseIntelligence: 4, baseDexterity: 5, baseDefense: 25, baseMagicDefense: 20, weaponType: { key: 'type_sword' }, armorType: { key: 'type_armor_heavy' } },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1, index)).toBe(true)
    const member = state.adventurers[0]
    member.level = 5
    member.xp = 123
    member.trait = 'BRUTE'
    expect(promotionChoices(member, index)).toEqual(['Warrior'])
    expect(promoteAdventurer(state, index, member.uid, 'Warrior')).toBe(true)
    expect(member).toMatchObject({ uid: 1, classId: 'Warrior', level: 1, xp: 0, trait: 'BRUTE', weaponId: 'Spade', ascended: false })
  })

  it('ascends a tier-nine class back to its weapon base class with doubled XP', () => {
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'DivineChampion', name: 'Divine Champion', description: '', imageKey: 'unit_divine_champion',
      fields: { maxLevel: 45, baseMaxHp: 200, baseConstitution: 40, baseIntelligence: 10, baseDexterity: 20, baseDefense: 60, baseMagicDefense: 40, weaponType: { key: 'type_sword' }, armorType: { key: 'type_armor_heavy' } },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    member.classId = 'DivineChampion'
    member.level = 45
    member.xp = 999
    expect(ascendAdventurer(state, index, member.uid)).toBe(true)
    expect(member).toMatchObject({ classId: 'Footman', level: 1, xp: 0, ascended: true })
    expect(experienceToNextLevel(1, true)).toBe(experienceToNextLevel(1) * 2)
    expect(ascendAdventurer(state, index, member.uid)).toBe(false)
  })

  it('selects doctrines and spends the exact loyalty-point costs on abilities', () => {
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'DivineChampion', name: 'Divine Champion', description: '', imageKey: 'unit_divine_champion',
      fields: { maxLevel: 45, baseMaxHp: 200, baseConstitution: 40, baseIntelligence: 10, baseDexterity: 20, baseDefense: 60, baseMagicDefense: 40, weaponType: { key: 'type_sword' }, armorType: { key: 'type_armor_heavy' } },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    member.classId = 'DivineChampion'
    member.level = 45
    member.ascended = true
    expect(doctrinePointsFromLevels(member, index)).toBe(18)
    expect(selectDoctrine(state, index, member.uid, 'Fortitude')).toBe(true)
    expect(doctrinePointsAvailable(member, index, 0)).toBe(18)
    const beforeHp = adventurerStats(member, index).maxHp
    expect(changeDoctrineAbility(state, index, member.uid, 'IMPROVED_HEALTH', 1)).toBe(true)
    expect(doctrinePointsAvailable(member, index, 0)).toBe(17)
    expect(adventurerStats(member, index).maxHp).toBe(beforeHp + 15)
    expect(changeDoctrineAbility(state, index, member.uid, 'MIRROR_OF_ANGUISH', 1)).toBe(true)
    expect(doctrinePointsAvailable(member, index, 0)).toBe(9)
    for (let level = 1; level < 5; level += 1) expect(changeDoctrineAbility(state, index, member.uid, 'IMPROVED_HEALTH', 1)).toBe(true)
    expect(changeDoctrineAbility(state, index, member.uid, 'TROLL_RESISTANCE', 1)).toBe(true)
    expect(doctrinePointsAvailable(member, index, 0)).toBe(2)
    expect(changeDoctrineAbility(state, index, member.uid, 'TROLL_RESISTANCE', 1)).toBe(false)
    expect(resetDoctrine(state, index, member.uid)).toBe(true)
    expect(member).toMatchObject({ doctrineId: null, doctrineLevels: [] })
  })

  it('applies Illusion False Life and True Agony during the combat reaction chain', () => {
    vi.mocked(Math.random).mockReturnValue(0)
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    member.ascended = true
    member.doctrineId = 'Illusion'
    member.doctrineLevels = [0, 0, 0, 0, 1, 1]
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'dummy', enemyId: 'TestDummy', hp: 1000, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']
    combatTurn(state, run, index)
    expect(member.positiveStatusEffects.some((effect) => effect.type === 'FALSE_LIFE')).toBe(true)
    run.turnOrder = ['e:dummy']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(member.positiveStatusEffects.some((effect) => effect.type === 'FALSE_LIFE')).toBe(false)
    expect(run.logs.some((line) => line.includes("false life dealt"))).toBe(true)
    expect(run.enemies[0].hp).toBe(0)
  })

  it('allows every weapon through Weapon Master and unequips it when the ability is removed', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    member.ascended = true
    member.doctrineId = 'War'
    member.doctrineLevels = [0, 0, 0, 0, 0, 1]
    state.inventory.push({ itemId: 'TrainingBow', stack: 1 })
    expect(equipItem(state, index, member.uid, 'weapon', 'TrainingBow')).toBe(true)
    expect(member.weaponId).toBe('TrainingBow')
    expect(changeDoctrineAbility(state, index, member.uid, 'WEAPON_MASTER', -1)).toBe(true)
    expect(member.weaponId).toBe('Spade')
    expect(state.inventory).toContainEqual({ itemId: 'TrainingBow', stack: 1 })
  })

  it('extracts, progresses, and claims king and doctrine quests', () => {
    const variant = structuredClone(content)
    variant.quests = [{
      id: 'Annihilator', name: 'Annihilator', description: 'Deal %d damage',
      defaultRarity: 1, minimumDifficulty: 1, targets: Array(11).fill(30), doctrines: ['Ruin'],
    }]
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1, index)).toBe(true)
    expect(state.activeQuests).toHaveLength(1)
    expect(state.activeQuests[0]).toMatchObject({ id: 'Annihilator', category: 'King', rarity: 1, target: 30 })
    incrementQuest(state, 'Annihilator', 30)
    expect(claimQuest(state, 'Annihilator')).toBe(true)
    expect(state.gems).toBe(10)

    state.activeQuests = [{ id: 'Annihilator', category: 'Ruin', rarity: 4, progress: 30, target: 30 }]
    expect(claimQuest(state, 'Annihilator')).toBe(true)
    expect(state.loyalty.Ruin).toEqual({ level: 1, stars: 1 })
    expect(refreshQuests(state, index, () => 0)).toBe(true)
    expect(questRefreshPrice(state)).toBe(100)
    state.gems = 100
    expect(buyQuestRefresh(state, index, () => 0)).toBe(true)
    expect(state).toMatchObject({ gems: 0, questsRefreshed: true })
    expect(buyQuestRefresh(state, index, () => 0)).toBe(false)
  })

  it('hatches pets with family ability guarantees, feeds, and merges at eighty percent', () => {
    const variant = structuredClone(content)
    variant.pets = [{ id: 'Rat', family: 'Wild', name: 'Rat', description: '', imageKey: 'pet_rat', fields: { abilityNumber: 2 } }]
    variant.items.push(
      { id: 'WildEgg', name: 'Wild Egg', description: '', imageKey: 'wild_egg', type: 'Egg', fields: { price: 1 } },
      { id: 'Apple', name: 'Apple', description: '', imageKey: 'apple', type: 'Food', fields: { price: 1, feedPower: 40 } },
    )
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.inventory.push({ itemId: 'WildEgg', stack: 2 }, { itemId: 'Apple', stack: 1 })
    expect(hatchPetEgg(state, index, 'WildEgg', () => 0)).toBe(true)
    expect(hatchPetEgg(state, index, 'WildEgg', () => 0)).toBe(true)
    expect(state.pets[0]).toMatchObject({ petId: 'Rat', level: 1 })
    expect(state.pets[0].abilities[0]).toBe('LIFESTEAL')
    expect(new Set(state.pets[0].abilities.filter((ability) => ability !== 'EMPTY')).size).toBe(2)
    expect(feedPet(state, index, state.pets[0].uid, 'Apple', 1)).toBe(true)
    expect(state.pets[0].level).toBe(2)
    const source = state.pets[0]
    const target = state.pets[1]
    expect(mergePet(state, source.uid, target.uid)).toBe(true)
    expect(state.pets).toHaveLength(1)
    expect(target.level).toBe(2)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index, target.uid)).toBe(true)
    expect(state.runs.EnchantedForest.petUid).toBe(target.uid)
    expect(releasePet(state, target.uid, index)).toBe(true)
    expect(state.pets).toHaveLength(0)
    expect(state.runs.EnchantedForest).toBeUndefined()
  })

  it('upgrades the shelter and auto-feeds collected food to favourite pets', () => {
    const variant = structuredClone(content)
    variant.pets = [{ id: 'Rat', family: 'Wild', name: 'Rat', description: '', imageKey: 'pet_rat', fields: { abilityNumber: 2 } }]
    variant.items.push({ id: 'Apple', name: 'Apple', description: '', imageKey: 'apple', type: 'Food', fields: { price: 1, feedPower: 40 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.pets.push(
      { uid: 1, petId: 'Rat', level: 1, food: 0, abilities: ['LIFESTEAL', 'EMPTY', 'EMPTY', 'EMPTY'], favourite: false },
      { uid: 2, petId: 'Rat', level: 1, food: 0, abilities: ['LIFESTEAL', 'EMPTY', 'EMPTY', 'EMPTY'], favourite: false },
    )
    expect(togglePetFavourite(state, 1)).toBe(false)
    expect(shelterPrice(0)).toBe(500)
    expect(shelterAutofeedPrice(0)).toBe(10_000)
    state.money = 10_500
    expect(upgradeShelter(state, 'capacity')).toBe(true)
    expect(upgradeShelter(state, 'autofeed')).toBe(true)
    expect(state.money).toBe(0)
    expect(togglePetFavourite(state, 1)).toBe(true)
    expect(togglePetFavourite(state, 2)).toBe(true)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    state.runs.EnchantedForest.chest = [{ itemId: 'Apple', stack: 2 }, { itemId: 'BeastPelt', stack: 1 }]
    collectChest(state, 'EnchantedForest', index)
    expect(state.pets.map((pet) => ({ level: pet.level, food: pet.food }))).toEqual([
      { level: 2, food: 8 },
      { level: 2, food: 8 },
    ])
    expect(state.inventory.some((stack) => stack.itemId === 'Apple')).toBe(false)
    expect(state.inventory).toContainEqual({ itemId: 'BeastPelt', stack: 1 })
  })

  it('uses the recovered Quarters, Storage, and Workshop upgrade formulas', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(quartersPrice(0)).toBe(5)
    expect(quartersPrice(3)).toBe(10_000)
    expect(quartersPrice(22)).toBe(10_000_000)
    expect(storagePrice(0)).toBe(50)
    expect(storagePrice(10)).toBe(650)
    expect(storagePrice(20)).toBe(2_800)
    expect(workshopQueuePrice(0)).toBe(20)
    expect(workshopTimePrice(0)).toBe(10)
    state.money = 85
    expect(upgradeFacility(state, 'quarters')).toBe(true)
    expect(upgradeFacility(state, 'storage')).toBe(true)
    expect(upgradeFacility(state, 'workshopQueue')).toBe(true)
    expect(upgradeFacility(state, 'workshopTime')).toBe(true)
    expect(state.money).toBe(0)
    expect(state.buildings).toMatchObject({ quarters: 1, storage: 1, workshopQueue: 1, workshopTime: 1 })
  })

  it('applies potion class limits and permanent stat bonuses', () => {
    const variant = structuredClone(content)
    variant.items.push({ id: 'PotionOfConstitution', name: 'Potion of Constitution', description: '', imageKey: 'potion_of_constitution', type: 'Potion', fields: { price: 100 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    state.inventory.push({ itemId: 'PotionOfConstitution', stack: 2 })
    expect(potionLimit(member, index, 0)).toBe(1)
    const constitution = adventurerStats(member, index).constitution
    expect(consumePotion(state, index, member.uid, 'PotionOfConstitution')).toBe(true)
    expect(adventurerStats(member, index).constitution).toBe(constitution + 1)
    expect(consumePotion(state, index, member.uid, 'PotionOfConstitution')).toBe(false)
    expect(state.inventory).toContainEqual({ itemId: 'PotionOfConstitution', stack: 1 })
  })

  it('opens all geodes with the original one-percent jackpot and quest progress', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    state.inventory.push({ itemId: 'Geode', stack: 3 })
    state.activeQuests.push({ id: 'Paleontologist', category: 'Knowledge', rarity: 1, progress: 0, target: 10 })
    let roll = 0
    expect(openGeodes(state, () => roll++ === 0 ? 0.009 : 0.5)).toBe(102)
    expect(state.gems).toBe(102)
    expect(state.inventory).not.toContainEqual(expect.objectContaining({ itemId: 'Geode' }))
    expect(state.activeQuests[0].progress).toBe(3)
  })

  it('uses Intercession without a level reset and Clumsiness to clear agility potions', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    const member = state.adventurers[0]
    member.level = 4
    member.potionsDrank[10] = 2
    state.inventory.push({ itemId: 'Intercession', stack: 1 }, { itemId: 'PotionOfClumsiness', stack: 1 })
    expect(consumeSpecial(state, index, member.uid, 'Intercession')).toBe(true)
    expect(member).toMatchObject({ ascended: true, level: 4 })
    expect(consumeSpecial(state, index, member.uid, 'PotionOfClumsiness')).toBe(true)
    expect(member.potionsDrank[10]).toBe(0)
  })

  it('reorders, dismisses, and recalls idle adventurers for 24 hours', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid: 2, name: 'Second' })
    expect(moveAdventurer(state, 2, -1)).toBe(true)
    expect(state.adventurers.map((member) => member.uid)).toEqual([2, 1])
    const now = Date.now()
    expect(dismissAdventurer(state, 2, now)).toBe(true)
    expect(state.dismissedAdventurers[0].member.uid).toBe(2)
    expect(recallAdventurer(state, 2, now + 86_399_999)).toBe(true)
    expect(state.adventurers.map((member) => member.uid)).toEqual([1, 2])
    expect(dismissAdventurer(state, 2, now)).toBe(true)
    expect(recallAdventurer(state, 2, now + 86_400_000)).toBe(false)
  })

  it('keeps a dungeon chest intact when Storage has no free item slots', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    state.purchasedPacks = { starter: false, merchant: false }
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    state.inventory = Array.from({ length: 35 }, (_, id) => ({ itemId: `Stored${id}`, stack: 1 }))
    state.runs.EnchantedForest.chest = [{ itemId: 'BeastPelt', stack: 1 }]
    expect(collectChest(state, 'EnchantedForest', index)).toBe(false)
    expect(state.runs.EnchantedForest.chest).toEqual([{ itemId: 'BeastPelt', stack: 1 }])
    state.runs.EnchantedForest.chest = [{ itemId: 'Stored0', stack: 2 }]
    expect(collectChest(state, 'EnchantedForest', index)).toBe(true)
    expect(state.inventory[0]).toEqual({ itemId: 'Stored0', stack: 3 })
  })

  it('runs fighter, healer, and opportunist pet actions after an adventurer turn', () => {
    vi.mocked(Math.random).mockReturnValue(0.5)
    const variant = structuredClone(content)
    variant.pets = [{ id: 'Rat', family: 'Wild', name: 'Rat', description: '', imageKey: 'pet_rat', fields: { abilityNumber: 3 } }]
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.pets.push({ uid: 1, petId: 'Rat', level: 300, food: 0, abilities: ['FIGHTER', 'HEALER', 'OPPORTUNIST', 'EMPTY'], favourite: false })
    expect(startRun(state, 'EnchantedForest', [1], index, 1)).toBe(true)
    const run = state.runs.EnchantedForest
    state.adventurers[0].hp = 10
    run.enemies = [{ uid: 'dummy', enemyId: 'TestDummy', hp: 1000, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']
    combatTurn(state, run, index)
    expect(run.logs.some((line) => line.startsWith('Rat dealt ') && line.endsWith(' damage to Training Golem.'))).toBe(true)
    expect(run.logs.some((line) => line.startsWith('Rat healed '))).toBe(true)
    run.enemies[0].hp = 1
    run.turnOrder = ['e:dummy']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(run.enemies[0].hp).toBe(0)
    expect(run.logs.some((line) => line === 'Rat executed Training Golem.')).toBe(true)
  })
  beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0))
  afterEach(() => vi.restoreAllMocks())

  it('uses the recovered XP and 12-hour offline cap', () => {
    expect(experienceToNextLevel(1)).toBe(40)
    expect(offlineSeconds(100_000_000, 1)).toBe(43_200)
  })

  it('consumes one raid try on dispatch, resets it at local midnight, and refills at the recovered gem price', () => {
    const variant = structuredClone(content)
    variant.areas.push({ id: 'CelestialMothership', name: 'Celestial Mothership', areaType: 2, enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '' })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('CelestialMothership')
    expect(areaTeamSize(index.areas.get('CelestialMothership'))).toBe(8)
    expect(raidTryCost('CelestialMothership')).toBe(30)
    expect(startRun(state, 'CelestialMothership', [1], index)).toBe(true)
    expect(state.raidTries.CelestialMothership).toBe(false)
    state.runs.CelestialMothership.finished = true
    state.runs.CelestialMothership.partyIds = []
    state.adventurers[0].areaId = null
    expect(startRun(state, 'CelestialMothership', [1], index)).toBe(false)

    state.gems = 30
    expect(refillRaidTry(state, 'CelestialMothership', index)).toBe(true)
    expect(state).toMatchObject({ gems: 0, raidTries: { CelestialMothership: true } })

    state.raidTries.CelestialMothership = false
    const tomorrow = state.lastDailyReset + 86_400_000
    expect(refreshDailyRaidTries(state, index, tomorrow)).toBe(true)
    expect(state.raidTries.CelestialMothership).toBe(true)
    expect(refreshDailyRaidTries(state, index, tomorrow + 1_000)).toBe(false)
  })

  it('has a runtime profile for every active skill present in extracted content', () => {
    const extracted = [
      JSON.parse(readFileSync(new URL('../../public/data/adventurers.json', import.meta.url), 'utf8')),
      JSON.parse(readFileSync(new URL('../../public/data/enemies.json', import.meta.url), 'utf8')),
    ].flat() as Array<{ fields: { activeSkill?: string } }>
    const usedSkills = [...new Set(extracted
      .map((entry) => entry.fields.activeSkill)
      .filter((skill): skill is string => Boolean(skill && skill !== 'ACTIVE_NONE')))]
      .sort()
    expect(Object.keys(ACTIVE_SKILLS).sort()).toEqual(usedSkills)
  })

  it('pauses tavern arrivals and applies the original upgrade formulas', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    state.tutorialStep = 8
    state.tavernGuests = []
    state.nextTavernVisit = 2
    setTavernLocked(state, true)
    progressTavernTime(state, index, 10)
    expect(state.nextTavernVisit).toBe(2)
    expect(state.tavernGuests).toEqual([])

    setTavernLocked(state, false)
    progressTavernTime(state, index, 2)
    expect(state.nextTavernVisit).toBe(0)
    progressTavernTime(state, index, 1)
    expect(state.tavernGuests).toHaveLength(1)
    expect(state.tavernGuests[0].seen).toBe(false)
    markTavernGuestsSeen(state)
    expect(state.tavernGuests[0].seen).toBe(true)

    state.money = 5_200
    state.nextTavernVisit = 1_000
    expect(tavernCapacityPrice(0)).toBe(5_000)
    expect(tavernCapacityPrice(1)).toBe(15_000)
    expect(tavernTimePrice(0)).toBe(200)
    expect(tavernTimePrice(1)).toBe(340)
    expect(upgradeTavern(state, 'capacity')).toBe(true)
    expect(upgradeTavern(state, 'time')).toBe(true)
    expect(state.buildings).toMatchObject({ tavernCapacity: 1, tavernTime: 1 })
    expect(state).toMatchObject({ money: 0, nextTavernVisit: 900 })
  })

  it('runs the first tutorial expedition through combat and loot', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(state.tutorialStep).toBe(2)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    tickGame(state, index, 40)
    expect(state.tutorialStep).toBe(3)
    expect(state.runs.EnchantedForest.progress).toBeGreaterThan(0)
    expect(state.runs.EnchantedForest.chest.find((stack) => stack.itemId === 'BeastPelt')?.stack).toBeGreaterThanOrEqual(1)
    state.runs.EnchantedForest.chest[0].stack = 2
    collectChest(state, 'EnchantedForest')
    expect(state.tutorialStep).toBe(3)
    expect(state.runs.EnchantedForest.chest).toEqual([])
    expect(state.inventory).toContainEqual({ itemId: 'BeastPelt', stack: 2 })

    expect(queueWorkshopRecipe(state, index, 'Leather')).toBe(true)
    tickGame(state, index, 10)
    expect(state.completedWorkshopItems).toHaveLength(1)
    collectWorkshopJob(state, state.completedWorkshopItems[0].uid)
    expect(state.tutorialStep).toBe(4)
    expect(state.inventory).toContainEqual({ itemId: 'Leather', stack: 1 })
    expect(state.inventory).toContainEqual({ itemId: 'CopperIngot', stack: 2 })

    expect(queueWorkshopRecipe(state, index, 'CopperArmor')).toBe(true)
    tickGame(state, index, 20)
    collectWorkshopJob(state, state.completedWorkshopItems[0].uid)
    expect(state.tutorialStep).toBe(5)
    expect(state.inventory).toContainEqual({ itemId: 'CopperArmor', stack: 1 })

    expect(equipItem(state, index, 1, 'armor', 'CopperArmor')).toBe(true)
    expect(state.tutorialStep).toBe(6)
    expect(state.inventory.some((entry) => entry.itemId === 'CopperArmor')).toBe(false)
    expect(state.adventurers[0].armorId).toBe('CopperArmor')
    const expectedUnarmoredHp = 40 + state.adventurers[0].level - 1
    expect(adventurerStats(state.adventurers[0], index)).toMatchObject({ maxHp: expectedUnarmoredHp + 30, constitution: 10 })
    state.adventurers[0].hp = expectedUnarmoredHp + 30
    expect(equipItem(state, index, 1, 'armor', null)).toBe(true)
    expect(state.adventurers[0]).toMatchObject({ armorId: null, hp: expectedUnarmoredHp })
    expect(state.inventory).toContainEqual({ itemId: 'CopperArmor', stack: 1 })
    expect(equipItem(state, index, 1, 'weapon', 'CopperArmor')).toBe(false)
    expect(equipItem(state, index, 1, 'armor', 'CopperArmor')).toBe(true)
    const disciple = state.tavernGuests.find((guest) => guest.classId === 'LightDisciple')
    expect(disciple?.trait).toBe('BOOKWORM')

    expect(hireGuest(state, disciple!.uid, index)).toBe(true)
    expect(state.tutorialStep).toBe(8)
    expect(state.tavernGuests[0]).toMatchObject({ classId: 'Archer', trait: 'FERAL' })
  })

  it('routes dungeon victory through Loot then Search before the next room', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.action = 'LOOT'
    run.actionRemaining = 1
    run.actionTotal = 1
    run.progress = 7

    tickGame(state, index, 1)
    expect(run.action).toBe('SEARCH')
    expect(run.progress).toBe(7)

    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run.action).toBe('ENTER_ROOM')
    expect(run.progress).toBe(8)
  })

  it('runs The Dreadful Ascent as an eight-member epic raid with max-progress skips', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheDreadfulAscent', name: 'The Dreadful Ascent', areaType: 2,
      enemies: ['EtherealSoul', 'KasimirTheSeer', 'HeraldKali'], encounterRosters: [],
      unlocks: [{ areaGetter: 'TheSouthernGrove', progress: 13 }], summaryImageKey: '', detailImageKey: '',
    }, {
      id: 'TheSouthernGrove', name: 'The Southern Grove', areaType: 0,
      enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'EtherealSoul', name: 'Ethereal Soul', description: '', imageKey: 'unit_ethereal_soul', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    }, {
      id: 'KasimirTheSeer', name: 'Kasimir, the Seer', description: '', imageKey: 'unit_kasimir_the_seer', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    }, {
      id: 'HeraldKali', name: 'Herald Kali', description: '', imageKey: 'unit_herald_kali', minDamage: 1, maxDamage: 1,
      drops: [{ item: 'SerpentStaff', stack: 1, weight: 1000 }],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    variant.items.push({ id: 'SerpentStaff', name: 'Serpent Staff', description: '', imageKey: 'serpent_staff', type: 'Staff', fields: { intelligence: 40 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    for (let uid = 2; uid <= 9; uid += 1) {
      state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid, name: `Footman ${uid}`, areaId: null })
    }
    state.unlockedAreas.push('TheDreadfulAscent')
    expect(areaTeamSize(index.areas.get('TheDreadfulAscent'))).toBe(8)
    expect(startRun(state, 'TheDreadfulAscent', state.adventurers.map((member) => member.uid), index)).toBe(true)
    const run = state.runs.TheDreadfulAscent
    expect(run.partyIds).toHaveLength(8)

    run.maxProgress = 2
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 1, maxProgress: 2, action: 'ENTER_ROOM' })
    expect(run.enemies).toEqual([])

    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 2, maxProgress: 2, action: 'FIGHT' })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(Array.from({ length: 3 }, () => 'EtherealSoul'))
    expect(state.seenEnemies).toEqual(['EtherealSoul'])
  })

  it('ends an epic raid on wipe without respawning or healing the party', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheDreadfulAscent', name: 'The Dreadful Ascent', areaType: 2,
      enemies: ['EtherealSoul'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'EtherealSoul', name: 'Ethereal Soul', description: '', imageKey: 'unit_ethereal_soul', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheDreadfulAscent')
    expect(startRun(state, 'TheDreadfulAscent', [1], index)).toBe(true)
    const run = state.runs.TheDreadfulAscent
    state.adventurers[0].hp = 0
    run.enemies = [{ uid: 'soul', enemyId: 'EtherealSoul', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.action = 'FIGHT'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ action: 'IDLE', finished: true, finishedReason: 'defeat', partyIds: [], enemies: [] })
    expect(state.adventurers[0]).toMatchObject({ hp: 0, areaId: null })
  })

  it('records a raid retreat separately from a victory result', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheDreadfulAscent', name: 'The Dreadful Ascent', areaType: 1,
      enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheDreadfulAscent')
    expect(startRun(state, 'TheDreadfulAscent', [1], index)).toBe(true)

    retreatRun(state, 'TheDreadfulAscent', index)

    expect(state.runs.TheDreadfulAscent).toMatchObject({ finished: true, finishedReason: 'retreat', partyIds: [], enemies: [] })
  })

  it('finishes room thirteen, unlocks Southern Grove, and preserves raid history for a rerun', () => {
    const variant = structuredClone(content)
    variant.messages = [
      { id: 9, title: 'Message nine', body: '', unlockAreaId: 'TheSouthernGrove' },
      { id: 10, title: 'Message ten', body: '', unlockAreaId: 'TheSouthernGrove' },
      { id: 11, title: 'Message eleven', body: '', unlockAreaId: 'TheSouthernGrove' },
    ]
    variant.areas.push({
      id: 'TheDreadfulAscent', name: 'The Dreadful Ascent', areaType: 2,
      enemies: [], encounterRosters: [], unlocks: [{ areaGetter: 'TheSouthernGrove', progress: 13 }], summaryImageKey: '', detailImageKey: '',
    }, {
      id: 'TheSouthernGrove', name: 'The Southern Grove', areaType: 0,
      enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheDreadfulAscent')
    expect(startRun(state, 'TheDreadfulAscent', [1], index)).toBe(true)
    const run = state.runs.TheDreadfulAscent
    run.progress = 12
    run.maxProgress = 12
    run.chest = [{ itemId: 'BeastPelt', stack: 1 }]
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 13, maxProgress: 13, action: 'IDLE', finished: true, finishedReason: 'victory', partyIds: [] })
    expect(run.logs[0]).toContain('The Southern Grove has been unlocked')
    expect(run.logs[1]).toContain('purple pillar')
    expect(state.unlockedAreas).toContain('TheSouthernGrove')
    expect(state.receivedMessages).toEqual([1, 9, 10, 11])
    expect(state.unreadMessages).toEqual([1, 9, 10, 11])
    state.raidTries.TheDreadfulAscent = true
    expect(startRun(state, 'TheDreadfulAscent', [1], index)).toBe(true)
    expect(state.runs.TheDreadfulAscent).toMatchObject({ progress: 0, maxProgress: 13, finished: false, chest: [{ itemId: 'BeastPelt', stack: 1 }] })
  })

  it('runs The Dire Descent Herald checkpoint, botched offering, and three-way unlock', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheDireDescent', name: 'The Dire Descent', areaType: 2,
      enemies: ['HeraldXavi', 'HeraldMaya', 'HeraldShoran'], encounterRosters: [],
      unlocks: [
        { areaGetter: 'SleepingPlanet', progress: 7 },
        { areaGetter: 'Kaunis', progress: 7 },
        { areaGetter: 'TheTower', progress: 7 },
      ], summaryImageKey: '', detailImageKey: '',
    })
    for (const areaId of ['SleepingPlanet', 'Kaunis', 'TheTower']) {
      variant.areas.push({ id: areaId, name: areaId, areaType: 1, enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '' })
    }
    for (const [id, item] of [['HeraldXavi', 'SerpentLunge'], ['HeraldMaya', 'SerpentSting'], ['HeraldShoran', 'SerpentBite']] as const) {
      variant.enemies.push({
        id, name: id.replace('Herald', 'Herald '), description: '', imageKey: `unit_${id.toLowerCase()}`,
        minDamage: 280, maxDamage: 305, magic: true, ranged: true,
        drops: [{ item, stack: 1, weight: 1000 }],
        fields: { baseMaxHp: 4500, baseConstitution: 500, baseIntelligence: 500, baseDexterity: 500, baseDefense: 0, baseMagicDefense: 0, expGiven: 9600, currentMana: 100, activeSkill: 'ACTIVE_BOTCHED_SACRIFICE', passiveSkill: 'PASSIVE_CLAIRVOYANCE', alwaysHits: true, immunityToStatus: 0.5 },
      })
      variant.items.push({ id: item, name: item, description: '', imageKey: item, type: 'Item', fields: { price: 10_000 } })
    }
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheDireDescent')
    expect(startRun(state, 'TheDireDescent', [1], index)).toBe(true)
    const run = state.runs.TheDireDescent
    run.progress = 4
    run.maxProgress = 4
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 5, maxProgress: 5, action: 'FIGHT' })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['HeraldXavi', 'HeraldMaya', 'HeraldShoran'])
    run.turnOrder = [`e:${run.enemies[0].uid}`]
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(run.logs[0]).toBe('Herald Xavi used Botched Sacrifice, but no one answers the call.')

    run.enemies = []
    run.progress = 6
    run.maxProgress = 6
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(state.unlockedAreas).toEqual(expect.arrayContaining(['SleepingPlanet', 'Kaunis', 'TheTower']))

    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 8, maxProgress: 8, action: 'IDLE', finished: true, partyIds: [] })
  })

  it("runs Ancient Grave Digging and collapses both Necroliths when Ka'Bar dies", () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'AncientGraveDigging', name: 'Ancient Grave Digging', areaType: 1,
      darkness: { runtimeFormula: 'progressOffset', offset: 25 },
      enemies: ['KabarTheRotten', 'Necrolith'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'KabarTheRotten', name: "Ka'Bar, the Rotten", description: '', imageKey: 'unit_kabar_the_rotten',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 900, baseConstitution: 14, baseIntelligence: 34, baseDexterity: 8, baseDefense: 50, baseMagicDefense: 0, expGiven: 360, passiveSkill: 'PASSIVE_LICH_CURSE' },
    }, {
      id: 'Necrolith', name: 'Necrolith', description: '', imageKey: 'unit_necrolith',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 1_000_000, baseConstitution: 500, baseIntelligence: 1, baseDexterity: 1, baseDefense: 100, baseMagicDefense: 100, expGiven: 10, threat: 2, passiveSkill: 'PASSIVE_THREATENING_I' },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('AncientGraveDigging')
    expect(areaTeamSize(index.areas.get('AncientGraveDigging'))).toBe(8)
    expect(startRun(state, 'AncientGraveDigging', [1], index)).toBe(true)
    const run = state.runs.AncientGraveDigging
    run.progress = 10
    run.maxProgress = 10
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 11, action: 'FIGHT', localDarkness: 36 })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['Necrolith', 'KabarTheRotten', 'Necrolith'])
    const kabar = run.enemies[1]
    kabar.hp = 1
    state.adventurers[0].negativeStatusEffects = [{ type: 'TAUNT', turnsLeft: 99, causeKey: `e:${kabar.uid}` }]
    run.turnOrder = ['a:1']
    run.turnIndex = 0

    combatTurn(state, run, index)

    expect(run.enemies.map((enemy) => enemy.hp)).toEqual([0, 0, 0])
    expect(run.logs.filter((line) => line.includes('Necrolith crumbles to dust'))).toHaveLength(2)

    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 12, maxProgress: 12, action: 'IDLE', finished: true, partyIds: [] })
    expect(run.logs[0]).toContain("There isn't really a way to kill a lich")
  })

  it('runs The Slime Pond King fight and applies every extracted on-hit status', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheSlimePond', name: 'The Slime Pond', areaType: 1, darkness: 0,
      enemies: ['SlimeKing'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'SlimeKing', name: 'Slime King', description: '', imageKey: 'unit_slime_king',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 1000, baseConstitution: 38, baseIntelligence: 5, baseDexterity: 8,
        baseDefense: 40, baseMagicDefense: 0, expGiven: 240, alwaysHits: true,
        immunityToStatus: 0.5, passiveSkill: 'PASSIVE_DISSOLVE_BY_DECREE',
        onHit: ['POISON', 'SILENCE', 'FROZEN', 'ABLAZE', 'STUN'].map((type) => ({
          statusEffect: { type: type as 'POISON' | 'SILENCE' | 'FROZEN' | 'ABLAZE' | 'STUN', turns: 3, probability: 0.7 },
        })),
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheSlimePond')
    expect(areaTeamSize(index.areas.get('TheSlimePond'))).toBe(5)
    expect(startRun(state, 'TheSlimePond', [1], index)).toBe(true)
    const run = state.runs.TheSlimePond
    run.progress = 5
    run.maxProgress = 5
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 6, action: 'FIGHT', localDarkness: 0 })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['SlimeKing'])
    run.turnOrder = [`e:${run.enemies[0].uid}`]
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(state.adventurers[0].negativeStatusEffects.map((effect) => effect.type)).toEqual([
      'POISON', 'SILENCE', 'FROZEN', 'ABLAZE', 'STUN',
    ])

    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 7, maxProgress: 7, action: 'IDLE', finished: true, partyIds: [] })
    expect(run.logs[0]).toContain('King of the Slimes slowly loses consistency')
  })

  it('rechecks the Divine Archeology 200-CON door and completes the hidden-god route', () => {
    const variant = structuredClone(content)
    variant.adventurers[0].fields.baseConstitution = 25
    variant.areas.push({
      id: 'DivineArcheology', name: 'Divine Archeology', areaType: 2, darkness: 0,
      enemies: ['ShaTheHiddenGod'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'ShaTheHiddenGod', name: 'Sha, the Hidden God', description: '', imageKey: 'unit_sha_the_hidden_god',
      minDamage: 1, maxDamage: 1, drops: [{ item: 'DivineZygote', stack: 1, weight: 1000 }],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    variant.items.push({ id: 'DivineZygote', name: 'Divine Zygote', description: '', imageKey: 'divine_zygote', type: 'Accessory', fields: { price: 1000 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    for (let uid = 2; uid <= 8; uid += 1) {
      state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid, name: `Footman ${uid}`, areaId: null })
    }
    state.unlockedAreas.push('DivineArcheology')
    expect(startRun(state, 'DivineArcheology', state.adventurers.map((member) => member.uid), index)).toBe(true)
    let run = state.runs.DivineArcheology
    run.progress = 11
    run.maxProgress = 11
    state.adventurers[0].hp = 0
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 12, maxProgress: 12, finished: true, action: 'IDLE', event: null })
    expect(run.logs[0]).toContain('Global Constitution required: 200')

    state.raidTries.DivineArcheology = true
    expect(startRun(state, 'DivineArcheology', state.adventurers.map((member) => member.uid), index)).toBe(true)
    run = state.runs.DivineArcheology
    run.progress = 11
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 12, maxProgress: 12, action: 'FIGHT', event: { kind: 'PYRAMID_DOOR_OPEN' } })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['ShaTheHiddenGod'])
    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 13, maxProgress: 13, finished: true, action: 'IDLE' })
    expect(completedEpicRaid(run)).toBe(true)
  })

  it('runs Imperial Rescue with permanent enemy Delirium and the Skeleton Key guard', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'ImperialRescue', name: 'Imperial Rescue', areaType: 2, darkness: 0,
      enemies: ['EmperorClovisXXVIII'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'EmperorClovisXXVIII', name: 'Emperor Clovis XXVIII', description: '', imageKey: 'unit_emperor_clovis_xxviii',
      minDamage: 115, maxDamage: 140, drops: [{ item: 'SkeletonKey', stack: 1, weight: 1000 }],
      fields: {
        baseMaxHp: 6800, baseConstitution: 18, baseIntelligence: 1, baseDexterity: 48,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 9600, initiative: true,
        currentMana: 100, immunityToStatus: 0.75, activeSkill: 'ACTIVE_PANDEMONIUM', passiveSkill: 'PASSIVE_ENHANCED_IMMUNITY',
      },
    })
    variant.items.push({ id: 'SkeletonKey', name: 'Skeleton Key', description: '', imageKey: 'skeleton_key', type: 'Accessory', fields: { intelligence: 36, notSellable: true } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('ImperialRescue')
    expect(startRun(state, 'ImperialRescue', [1], index)).toBe(true)
    const run = state.runs.ImperialRescue
    run.progress = 13
    run.maxProgress = 13
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 14, maxProgress: 14, action: 'FIGHT' })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['EmperorClovisXXVIII'])
    expect(run.enemies[0].positiveStatusEffects).toEqual([{
      type: 'DELIRIUM', turnsLeft: 999, causeKey: `e:${run.enemies[0].uid}`,
    }])
    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 15, maxProgress: 15, finished: true, action: 'IDLE' })
    expect(completedEpicRaid(run)).toBe(true)
  })

  it('routes an equipped Skeleton Key through The Cultist Rebels hidden Titan door', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheCultistRebels', name: 'The Cultist Rebels', areaType: 1, darkness: 0,
      enemies: ['PrimordialTitan'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'PrimordialTitan', name: 'Primordial Titan', description: '', imageKey: 'unit_primordial_titan',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    variant.items.push({ id: 'SkeletonKey', name: 'Skeleton Key', description: '', imageKey: 'skeleton_key', type: 'Accessory', fields: { intelligence: 36 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.adventurers[0].accessoryId = 'SkeletonKey'
    state.unlockedAreas.push('TheCultistRebels')
    expect(startRun(state, 'TheCultistRebels', [1], index)).toBe(true)
    const run = state.runs.TheCultistRebels
    run.progress = 5
    run.event = { kind: 'HALLS_EXPLORATION', progress: 8 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)
    expect(run).toMatchObject({ event: { kind: 'HALLS_SKELETON_DOOR', progress: 0 }, action: 'ENTER_ROOM' })

    for (let room = 0; room < 2; room += 1) {
      run.actionRemaining = 1
      run.actionTotal = 1
      tickGame(state, index, 1)
    }
    expect(run).toMatchObject({ event: { kind: 'HALLS_SKELETON_DOOR', progress: 2 }, action: 'FIGHT' })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['PrimordialTitan'])
    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ finished: true, action: 'IDLE', partyIds: [] })
    expect(run.logs[0]).toContain('starts their ascent towards the surface')
  })

  it('applies The Lost Expedition trapdoor fall damage before continuing at darkness 100', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheLostExpedition', name: 'The Lost Expedition', areaType: 1, darkness: 100,
      enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheLostExpedition')
    expect(startRun(state, 'TheLostExpedition', [1], index)).toBe(true)
    const run = state.runs.TheLostExpedition
    run.progress = 12
    run.event = { kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 1 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ localDarkness: 100, event: { kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 2 } })
    expect(state.adventurers[0].hp).toBe(9)
    expect(run.logs[0]).toBe('Footman lost 31 HP from the fall.')

    run.event = { kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 8 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ finished: true, action: 'IDLE', partyIds: [] })
    expect(run.logs[0]).toContain('endless stairs')
  })

  it('runs Sleeping Planet with fourteen adventurers and the cheaper raid refill', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'SleepingPlanet', name: 'Sleeping Planet', areaType: 1, darkness: 0,
      enemies: ['Singularity'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'Singularity', name: 'Singularity', description: '', imageKey: 'unit_singularity',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    for (let uid = 2; uid <= 14; uid += 1) {
      state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid, name: `Footman ${uid}`, areaId: null })
    }
    state.unlockedAreas.push('SleepingPlanet')
    expect(areaTeamSize(index.areas.get('SleepingPlanet'))).toBe(14)
    expect(raidTryCost('SleepingPlanet')).toBe(15)
    expect(startRun(state, 'SleepingPlanet', state.adventurers.map((member) => member.uid), index)).toBe(true)
    const run = state.runs.SleepingPlanet
    expect(run.partyIds).toHaveLength(14)
    run.progress = 13
    run.maxProgress = 13
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 14, action: 'FIGHT' })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['Singularity'])
    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 15, finished: true, action: 'IDLE', partyIds: [] })
  })

  it('runs Kaunis with fourteen adventurers through the three-member council', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'Kaunis', name: 'Kaunis', areaType: 1, darkness: 18,
      enemies: ['ChiefScientistAva', 'KingAino', 'FirstMinisterAtos'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    for (const [id, name] of [
      ['ChiefScientistAva', 'Chief Scientist Ava'],
      ['KingAino', 'King Aino'],
      ['FirstMinisterAtos', 'First Minister Atos'],
    ]) {
      variant.enemies.push({
        id, name, description: '', imageKey: `unit_${id}`,
        minDamage: 1, maxDamage: 1, drops: [],
        fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
      })
    }
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    for (let uid = 2; uid <= 14; uid += 1) {
      state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid, name: `Footman ${uid}`, areaId: null })
    }
    state.unlockedAreas.push('Kaunis')
    expect(areaTeamSize(index.areas.get('Kaunis'))).toBe(14)
    expect(raidTryCost('Kaunis')).toBe(15)
    expect(startRun(state, 'Kaunis', state.adventurers.map((member) => member.uid), index)).toBe(true)
    const run = state.runs.Kaunis
    expect(run.partyIds).toHaveLength(14)
    run.progress = 15
    run.maxProgress = 15
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 16, action: 'FIGHT', localDarkness: 18 })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['ChiefScientistAva', 'KingAino', 'FirstMinisterAtos'])
    expect(run.logs[0]).toBe('They raise from their seats and attack.')
    run.enemies = []
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 17, finished: true, action: 'IDLE', partyIds: [] })
    expect(run.logs[0]).toContain('repairing their wounds')
  })

  it('runs The Tower rest, darkness, final prisoner, and completion lifecycle', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheTower', name: 'The Tower', areaType: 1,
      darkness: { runtimeFormula: 'progressEquals', progress: 31, whenTrue: 50, whenFalse: 0 },
      enemies: ['TheAncient', 'TheMachine'], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    for (const [id, name] of [['TheAncient', 'The Ancient'], ['TheMachine', 'The Machine']]) {
      variant.enemies.push({
        id, name, description: '', imageKey: `unit_${id}`, minDamage: 1, maxDamage: 1, drops: [],
        fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
      })
    }
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    for (let uid = 2; uid <= 14; uid += 1) state.adventurers.push({ ...structuredClone(state.adventurers[0]), uid, areaId: null })
    state.unlockedAreas.push('TheTower')
    expect(startRun(state, 'TheTower', state.adventurers.map((member) => member.uid), index)).toBe(true)
    const run = state.runs.TheTower
    run.progress = 30
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 31, localDarkness: 50 })
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['TheAncient'])

    state.adventurers[0].hp = 0
    state.adventurers[1].hp = 1
    run.enemies = []
    run.progress = 32
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    tickGame(state, index, 1)
    expect(state.adventurers[0].hp).toBeGreaterThan(0)
    expect(state.adventurers[1].hp).toBe(adventurerStats(state.adventurers[1], index).maxHp)
    expect(run.logs.slice(0, 2)).toEqual(["Adventurer's HP have been replenished", 'An Adventurer was resurrected'])

    run.progress = 34
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    tickGame(state, index, 1)
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['TheMachine'])
    run.enemies = []
    run.progress = 38
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    tickGame(state, index, 1)
    expect(run).toMatchObject({ progress: 39, finished: true, action: 'IDLE', partyIds: [] })
  })

  it('integrates The Southern Grove chase/search loop and unlocks Barren Wastelands at 60', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheSouthernGrove', name: 'The Southern Grove', areaType: 0, darkness: 15,
      enemies: [], encounterRosters: [], unlocks: [{ areaGetter: 'BarrenWastelands', progress: 60 }], summaryImageKey: '', detailImageKey: '',
    }, {
      id: 'BarrenWastelands', name: 'Barren Wastelands', areaType: 0,
      enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.items.push({ id: 'ElysianWood', name: 'Elysian Wood', description: '', imageKey: 'elysian_wood', type: 'Item', fields: { price: 1 } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('TheSouthernGrove')
    expect(startRun(state, 'TheSouthernGrove', [1], index)).toBe(true)
    const run = state.runs.TheSouthernGrove
    run.progress = 59
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(run).toMatchObject({ progress: 60, action: 'ENTER_ROOM', event: { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 296 } })
    expect(run.chest).toContainEqual({ itemId: 'ElysianWood', stack: 1 })
    expect(run.logs[0]).toBe('Barren Wastelands has been unlocked.')
    expect(run.logs[2]).toContain('average dexterity of 4')
    expect(state.unlockedAreas).toContain('BarrenWastelands')
  })

  it('applies Hidden City of Larox Nexus amplification to magical traps', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'HiddenCityOfLarox', name: 'Hidden City of Larox', areaType: 0, darkness: 8,
      enemies: [], encounterRosters: [], unlocks: [{ areaGetter: 'LostLands', progress: 100 }], summaryImageKey: '', detailImageKey: '',
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('HiddenCityOfLarox')
    expect(startRun(state, 'HiddenCityOfLarox', [1], index)).toBe(true)
    const run = state.runs.HiddenCityOfLarox
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    run.event = { kind: 'MAGIC_AMPLIFICATION', progress: 0 }
    state.adventurers[0].hp = 200
    vi.mocked(Math.random).mockReturnValueOnce(0.21).mockReturnValue(0)

    tickGame(state, index, 1)
    expect(state.adventurers[0].hp).toBe(161)

    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    run.event = { kind: 'MAGIC_AMPLIFICATION', progress: 99 }
    state.adventurers[0].hp = 200
    vi.mocked(Math.random).mockReturnValueOnce(0.21).mockReturnValue(0)

    tickGame(state, index, 1)
    expect(state.adventurers[0].hp).toBe(61)
  })

  it('lets a Lost Lands Stone Shaman complete Fire Ritual and summon Smoldering Titan', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'LostLands', name: 'Lost Lands', areaType: 0, darkness: 12,
      enemies: ['StoneShaman', 'SmolderingTitan'], encounterRosters: [], unlocks: [{ areaGetter: 'TheDireDescent', progress: 100 }], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'StoneShaman', name: 'Stone Shaman', description: '', imageKey: 'unit_stone_shaman', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 20, baseDexterity: 10, baseDefense: 0, baseMagicDefense: 0, expGiven: 1, currentMana: 100, activeSkill: 'ACTIVE_FIRE_DANCE', passiveSkill: 'PASSIVE_NATURAL_EMPATHY', healer: true },
    }, {
      id: 'SmolderingTitan', name: 'Smoldering Titan', description: '', imageKey: 'unit_smoldering_titan', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 1000, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.unlockedAreas.push('LostLands')
    expect(startRun(state, 'LostLands', [1], index)).toBe(true)
    const run = state.runs.LostLands
    run.event = { kind: 'FIRE_RITUAL', progress: 99 }
    run.enemies = [{ uid: 'shaman', enemyId: 'StoneShaman', hp: 100, mana: 100, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:shaman']
    run.turnIndex = 0

    combatTurn(state, run, index)
    expect(run.event).toEqual({ kind: 'FIRE_RITUAL', progress: 100 })
    expect(run.logs[0]).toBe('The Fire Ritual is 100% complete.')

    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)

    expect(run.event).toBeNull()
    expect(run.action).toBe('FIGHT')
    expect(run.enemies.map((enemy) => enemy.enemyId)).toEqual(['SmolderingTitan'])
    expect(run.logs[0]).toContain('raging volcano')
  })

  it('resolves the Enchanted Forest pitfall with the recovered dodge formula', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    state.adventurers[0].hp = 40
    vi.mocked(Math.random).mockReturnValueOnce(0.2).mockReturnValue(0)

    tickGame(state, index, 1)

    expect(state.adventurers[0].hp).toBeLessThan(40)
    expect(run.logs[0]).toContain("couldn't avoid the trap")
    expect(run.logs[0]).toContain('Dodge chance was 29%')
    expect(run.progress).toBe(1)
  })

  it('starts The Desert deterrent event when a Sha\'huri enemy dies', () => {
    const variant = structuredClone(content)
    variant.adventurers[0].fields.alwaysHits = true
    variant.areas.push({
      id: 'TheDesert', name: 'The Desert', areaType: 0, enemies: ['ShahuriWarrior'],
      encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'ShahuriWarrior', name: "Sha'huri Warrior", description: '', imageKey: 'unit_shahuri_warrior',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 1, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 0 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('TheDesert')
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'TheDesert', [1])).toBe(true)
    const run = state.runs.TheDesert
    run.enemies = [{
      uid: 'shahuri', enemyId: 'ShahuriWarrior', hp: 1, mana: 0, shield: 0,
      positiveStatusEffects: [], negativeStatusEffects: [],
    }]
    run.turnOrder = ['a:1']
    run.turnIndex = 0

    combatTurn(state, run, index)

    expect(run.event).toEqual({ kind: 'SHAHURI_ARMY_CHARGING', progress: 1 })
    expect(run.logs[0]).toContain('[1/100]')
  })

  it('runs the Golden City Angry Eye event and Constitution-reduced eye drain', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'TheGoldenCity', name: 'The Golden City', areaType: 0, enemies: ['InsaneCitizen'],
      encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'InsaneCitizen', name: 'Insane Citizen', description: '', imageKey: 'unit_insane_citizen',
      minDamage: 10, maxDamage: 10, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true, criticalDamage: 1,
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('TheGoldenCity')
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'TheGoldenCity', [1])).toBe(true)
    const run = state.runs.TheGoldenCity
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.002)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.99)

    tickGame(state, index, 1)

    expect(run.event).toEqual({ kind: 'ANGRY_EYE', progress: 5 })
    expect(run.action).toBe('FIGHT')
    expect(run.enemies[0].positiveStatusEffects[0]).toMatchObject({ type: 'DELIRIUM', turnsLeft: 999 })

    run.turnOrder = [`e:${run.enemies[0].uid}`]
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(state.adventurers[0].hp).toBe(25)

    state.adventurers[0].hp = 40
    run.enemies = []
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random).mockReset().mockReturnValue(0.05)
    tickGame(state, index, 1)

    expect(state.adventurers[0].hp).toBe(17)
    expect(run.logs[0]).toBe('23 HP was drawn from Footman.')
  })

  it('runs the integrated Blackwater Kraken reward and Constitution trap paths', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'BlackwaterPort', name: 'Blackwater Port', areaType: 0, enemies: ['MysteriousTentacle'],
      encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'MysteriousTentacle', name: 'Mysterious Tentacle', description: '', imageKey: 'unit_mysterious_tentacle',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 1, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 0 },
    })
    variant.items.push({
      id: 'EyeOfTheAbyss', name: 'Eye of the Abyss', description: '', imageKey: 'eye_of_the_abyss', type: 'Item', fields: { price: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('BlackwaterPort')
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'BlackwaterPort', [1])).toBe(true)
    const run = state.runs.BlackwaterPort
    run.event = { kind: 'THE_KRAKEN', progress: 10 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random).mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(0.99)

    tickGame(state, index, 1)

    expect(run.event).toEqual({ kind: 'THE_KRAKEN_FIGHT', progress: 0 })
    expect(run.enemies).toHaveLength(5)
    expect(run.logs[0]).toContain('huge, dark spot')

    run.enemies.forEach((enemy) => { enemy.hp = 0 })
    run.action = 'FIGHT'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run.action).toBe('LOOT')
    expect(run.logs[0]).toBe('The unknown mass goes back to the dark ocean depths.')

    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run.event).toBeNull()
    expect(run.chest).toContainEqual({ itemId: 'EyeOfTheAbyss', stack: 1 })

    state.adventurers[0].hp = 40
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random).mockReset().mockReturnValueOnce(0.25).mockReturnValue(0)
    tickGame(state, index, 1)

    expect(state.adventurers[0].hp).toBe(0)
    expect(run.logs.some((line) => line === 'Dodge roll is made with Constitution. Difficulty is 20.')).toBe(true)
    expect(run.action).toBe('RESPAWN')
  })

  it('stores Frostbite Blizzard darkness per room and resolves its locked crate', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'FrostbitePeaks', name: 'Frostbite Peaks', areaType: 0, darkness: 0, enemies: [],
      encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.items.push(
      { id: 'Winterwood', name: 'Winterwood', description: '', imageKey: 'winterwood', type: 'Item', fields: { price: 1 } },
      { id: 'FrostmetalOre', name: 'Frostmetal Ore', description: '', imageKey: 'frostmetal_ore', type: 'Item', fields: { price: 1 } },
      { id: 'IceFiber', name: 'Ice Fiber', description: '', imageKey: 'ice_fiber', type: 'Item', fields: { price: 1 } },
      { id: 'FrostCrystal', name: 'Frost Crystal', description: '', imageKey: 'frost_crystal', type: 'Item', fields: { price: 1 } },
    )
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('FrostbitePeaks')
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'FrostbitePeaks', [1])).toBe(true)
    const run = state.runs.FrostbitePeaks
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.3)

    tickGame(state, index, 1)

    expect(run.event).toEqual({ kind: 'BLIZZARD', progress: 0 })
    expect(run.localDarkness).toBe(50)
    expect(state.adventurers[0].hp).toBe(33)
    expect(state.adventurers[0].negativeStatusEffects[0]).toMatchObject({ type: 'FROZEN', turnsLeft: 2 })
    expect(run.action).toBe('SEARCH')

    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random).mockReset()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.2)
      .mockReturnValue(0.99)
    tickGame(state, index, 1)

    expect(run.chest).toEqual(expect.arrayContaining([
      { itemId: 'Winterwood', stack: 3 },
      { itemId: 'FrostmetalOre', stack: 3 },
      { itemId: 'IceFiber', stack: 3 },
      { itemId: 'FrostCrystal', stack: 1 },
    ]))
    expect(run.logs.some((line) => line.includes('With a Dexterity of 4, Footman'))).toBe(true)
  })

  it('spawns the Obsidian Pale Hermit at darkness 80 without an encounter roll', () => {
    const variant = structuredClone(content)
    variant.areas.push({
      id: 'ObsidianMines', name: 'Obsidian Mines', areaType: 0, darkness: 10, enemies: ['PaleHermit'],
      encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '',
    })
    variant.enemies.push({
      id: 'PaleHermit', name: 'Pale Hermit', description: '', imageKey: 'unit_pale_hermit',
      minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 10, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 0 },
    })
    variant.items.push({
      id: 'ObsidianChunk', name: 'Obsidian Chunk', description: '', imageKey: 'obsidian_chunk', type: 'Item', fields: { price: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('ObsidianMines')
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'ObsidianMines', [1])).toBe(true)
    const run = state.runs.ObsidianMines
    run.event = { kind: 'UNSPEAKABLE_HORROR', progress: 65 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    vi.mocked(Math.random).mockReset().mockReturnValue(0)

    tickGame(state, index, 1)

    expect(run.localDarkness).toBe(80)
    expect(run.event).toEqual({ kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 })
    expect(run.enemies).toHaveLength(1)
    expect(run.enemies[0].enemyId).toBe('PaleHermit')
    expect(run.action).toBe('FIGHT')
    expect(vi.mocked(Math.random)).toHaveBeenCalledTimes(2)

    run.enemies = []
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run.chest).toContainEqual({ itemId: 'ObsidianChunk', stack: 1 })

    run.event = { kind: 'UNSPEAKABLE_HORROR', progress: 30 }
    run.action = 'RESPAWN'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(run.event).toEqual({ kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 })
  })

  it('uses original mana timing, active skills, shield absorption, and statuses', () => {
    const index = indexContent(content)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{
      uid: 'dummy', enemyId: 'TestDummy', hp: 1000, mana: 0, shield: 0,
      positiveStatusEffects: [], negativeStatusEffects: [],
    }]
    run.turnOrder = ['a:1']
    run.turnIndex = 0

    for (let turn = 0; turn < 10; turn += 1) combatTurn(state, run, index)
    expect(state.adventurers[0].mana).toBe(100)
    expect(run.logs.some((line) => line.includes('used ACTIVE_MIGHTY_STRIKE'))).toBe(false)
    combatTurn(state, run, index)
    expect(state.adventurers[0].mana).toBe(0)
    expect(run.logs[0]).toContain('damage to Training Golem')
    expect(run.logs[1]).toBe('Footman used ACTIVE_MIGHTY_STRIKE.')

    state.adventurers[0].hp = 40
    state.adventurers[0].shield = 5
    run.enemies[0].mana = 100
    run.turnOrder = ['e:dummy']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(state.adventurers[0]).toMatchObject({ hp: 34, shield: 0 })
    expect(state.adventurers[0].negativeStatusEffects[0]).toMatchObject({ type: 'STUN', turnsLeft: 1 })
  })

  it('combines darkness amplification with poison potency from its source', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.areas[0].darkness = 50
    variant.enemies.push({
      id: 'Darkling', name: 'Darkling', description: '', imageKey: 'unit_darkling', minDamage: 10, maxDamage: 10, drops: [],
      fields: {
        baseMaxHp: 100,
        baseConstitution: 1,
        baseIntelligence: 1,
        baseDexterity: 20,
        baseDefense: 0,
        baseMagicDefense: 0,
        expGiven: 0,
        alwaysHits: true,
        criticalDamage: 1,
        darknessDamageAmplification: 0.02,
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.localDarkness = 50
    run.enemies = [{
      uid: 'darkling', enemyId: 'Darkling', hp: 100, mana: 0, shield: 0,
      positiveStatusEffects: [],
      negativeStatusEffects: [{ type: 'POISON', turnsLeft: 3, potency: 30, causeKey: 'a:99' }],
    }]
    run.turnOrder = ['e:darkling']
    run.turnIndex = 0

    combatTurn(state, run, index)

    // 10 base × (1 + .02 × 50 darkness) × (1 - (.2 + .3 poison)) = 10,
    // then 20% defense and 1 constitution reduction produces 7 damage.
    expect(state.adventurers[0].hp).toBe(33)
  })

  it('applies extracted on-death effects to every living enemy', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'TestAlchemist', name: 'Test Alchemist', description: '', imageKey: 'unit_alchemist',
      fields: {
        maxLevel: 5,
        baseMaxHp: 5,
        baseConstitution: 1,
        baseIntelligence: 1,
        baseDexterity: 1,
        baseDefense: 0,
        baseMagicDefense: 0,
        poisonBonus: 30,
        weaponType: { key: 'type_bow' },
        armorType: { key: 'type_armor_medium' },
        onDeathEffectsOnEnemies: [
          { statusEffect: { type: 'POISON', turns: 5, probability: 1 } },
          { statusEffect: { type: 'STUN', turns: 1, probability: 1 } },
        ],
      },
    })
    variant.enemies.push({
      id: 'Executioner', name: 'Executioner', description: '', imageKey: 'unit_ent', minDamage: 10, maxDamage: 10, drops: [],
      fields: {
        baseMaxHp: 100,
        baseConstitution: 1,
        baseIntelligence: 1,
        baseDexterity: 20,
        baseDefense: 0,
        baseMagicDefense: 0,
        expGiven: 0,
        alwaysHits: true,
        criticalDamage: 1,
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.tavernGuests[0].classId = 'TestAlchemist'
    state.tavernGuests[0].name = 'Test Alchemist'
    state.tavernGuests[0].hp = 5
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{
      uid: 'executioner', enemyId: 'Executioner', hp: 100, mana: 0, shield: 0,
      positiveStatusEffects: [], negativeStatusEffects: [],
    }]
    run.turnOrder = ['e:executioner']
    run.turnIndex = 0

    combatTurn(state, run, index)

    expect(state.adventurers[0].hp).toBe(0)
    expect(run.enemies[0].negativeStatusEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'POISON', turnsLeft: 5, potency: 30, causeKey: 'a:1' }),
      expect.objectContaining({ type: 'STUN', turnsLeft: 1, causeKey: 'a:1' }),
    ]))
    expect(run.logs[0]).toContain('final effects spread')
  })

  it('reanimates a cursed enemy as a bound battlefield minion', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'TestNecromancer', name: 'Test Necromancer', description: '', imageKey: 'unit_necromancer',
      fields: {
        maxLevel: 5,
        baseMaxHp: 50,
        baseConstitution: 5,
        baseIntelligence: 100,
        baseDexterity: 5,
        baseDefense: 0,
        baseMagicDefense: 0,
        alwaysHits: true,
        activeSkill: 'ACTIVE_CURSE_I',
        weaponType: { key: 'type_staff' },
        armorType: { key: 'type_armor_light' },
      },
    }, {
      id: 'Zombie', name: 'Zombie', description: '', imageKey: 'unit_zombie',
      fields: {
        maxLevel: 15,
        baseMaxHp: 100,
        baseConstitution: 10,
        baseIntelligence: 1,
        baseDexterity: 5,
        baseDefense: 20,
        baseMagicDefense: 0,
        activeSkill: 'ACTIVE_NONE',
        weaponType: { key: 'type_sword' },
        armorType: { key: 'type_armor_heavy' },
      },
    })
    variant.items.push({
      id: 'DecomposedLimb', name: 'Decomposed Limb', description: '', imageKey: 'decomposed_limb', type: 'Sword', fields: { constitution: 1 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.tavernGuests[0].classId = 'TestNecromancer'
    state.tavernGuests[0].name = 'Test Necromancer'
    state.tavernGuests[0].hp = 50
    state.tavernGuests[0].mana = 100
    state.tavernGuests[0].weaponId = 'Cane'
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    state.adventurers[0].mana = 100
    run.enemies = [{
      uid: 'corpse', enemyId: 'TutorialWolf', hp: 1, mana: 0, shield: 0,
      positiveStatusEffects: [], negativeStatusEffects: [],
    }]
    run.turnOrder = ['a:1', 'e:corpse']
    run.turnIndex = 0

    combatTurn(state, run, index)

    expect(run.enemies[0].hp).toBe(0)
    expect(run.summons).toHaveLength(1)
    expect(run.summons[0]).toMatchObject({ classId: 'Zombie', summonerUid: 1, weaponId: 'DecomposedLimb', hp: 100 })
    expect(run.turnOrder[1]).toBe(`a:${run.summons[0].uid}`)
    expect(run.logs.some((line) => line.includes('reanimated Wolf as Zombie'))).toBe(true)
  })

  it('reflects non-curse statuses from Bend Reality back to their source', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'Poisoner', name: 'Poisoner', description: '', imageKey: 'unit_alchemist',
      fields: {
        maxLevel: 5, baseMaxHp: 50, baseConstitution: 5, baseIntelligence: 5, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, alwaysHits: true,
        onTargetHit: { statusEffect: { type: 'POISON', turns: 2, probability: 1 } },
        weaponType: { key: 'type_bow' }, armorType: { key: 'type_armor_medium' },
      },
    })
    variant.enemies.push({
      id: 'RealityMachine', name: 'Reality Machine', description: '', imageKey: 'unit_machine', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 10, baseDexterity: 10,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, passiveSkill: 'PASSIVE_BEND_REALITY',
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    Object.assign(state.tavernGuests[0], { classId: 'Poisoner', name: 'Poisoner', hp: 50, weaponId: 'TrainingBow' })
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'machine', enemyId: 'RealityMachine', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']

    combatTurn(state, run, index)

    expect(run.enemies[0].negativeStatusEffects).toEqual([])
    expect(state.adventurers[0].negativeStatusEffects[0]).toMatchObject({ type: 'POISON', turnsLeft: 2, causeKey: 'a:1' })
  })

  it('executes Berserker and Swarm dynamic multi-attacks', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.adventurers.push({
      id: 'TestTank', name: 'Test Tank', description: '', imageKey: 'unit_footman',
      fields: {
        maxLevel: 5, baseMaxHp: 1000, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1,
        baseDefense: 0, baseMagicDefense: 0, alwaysHits: true,
        weaponType: { key: 'type_sword' }, armorType: { key: 'type_armor_heavy' },
      },
    })
    variant.enemies.push({
      id: 'TestBerserker', name: 'Test Berserker', description: '', imageKey: 'unit_berserker', minDamage: 10, maxDamage: 10, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true,
        criticalDamage: 1, passiveSkill: 'PASSIVE_BERSERKER_RAGE',
      },
    }, {
      id: 'TestSwarm', name: 'Test Swarm', description: '', imageKey: 'unit_swarm', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 3, baseConstitution: 1, baseIntelligence: 20, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true,
        criticalDamage: 1, passiveSkill: 'PASSIVE_SWARM',
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    Object.assign(state.tavernGuests[0], { classId: 'TestTank', name: 'Test Tank', hp: 1000, weaponId: 'Spade' })
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'berserker', enemyId: 'TestBerserker', hp: 50, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:berserker']
    combatTurn(state, run, index)
    expect(state.adventurers[0].hp).toBe(980)

    state.adventurers[0].hp = 1000
    run.enemies = [{ uid: 'swarm', enemyId: 'TestSwarm', hp: 3, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:swarm']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(state.adventurers[0].hp).toBe(819)

    state.adventurers[0].hp = 1000
    run.enemies[0].hp = 3
    run.turnOrder = ['a:1']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(run.enemies[0].hp).toBe(2)
  })

  it('preserves Infinity mana and rolls Elemental Control status on basic hits', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.enemies.push({
      id: 'TestInfinity', name: 'Test Infinity', description: '', imageKey: 'unit_singularity', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 20, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true, currentMana: 100,
        criticalDamage: 1, passiveSkill: 'PASSIVE_INFINITY', activeSkill: 'ACTIVE_GRAVITY_SHIFT',
      },
    }, {
      id: 'Elementalist', name: 'Elementalist', description: '', imageKey: 'unit_wizard', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 20, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true,
        criticalDamage: 1, passiveSkill: 'PASSIVE_ELEMENTAL_CONTROL',
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'infinity', enemyId: 'TestInfinity', hp: 100, mana: 100, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:infinity']
    combatTurn(state, run, index)
    combatTurn(state, run, index)
    expect(run.enemies[0].mana).toBe(100)
    expect(run.logs.filter((line) => line === 'Test Infinity used ACTIVE_GRAVITY_SHIFT.')).toHaveLength(2)

    state.adventurers[0].negativeStatusEffects = []
    run.enemies = [{ uid: 'elementalist', enemyId: 'Elementalist', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:elementalist']
    run.turnIndex = 0
    combatTurn(state, run, index)
    expect(state.adventurers[0].negativeStatusEffects[0]).toMatchObject({ type: 'FROZEN', turnsLeft: 2 })
  })

  it('lets Territorial enemies attack a different enemy type', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.enemies.push({
      id: 'TestBanshee', name: 'Test Banshee', description: '', imageKey: 'unit_banshee', minDamage: 10, maxDamage: 10, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 20, baseDexterity: 20,
        baseDefense: 0, baseMagicDefense: 0, team: 2, expGiven: 0, alwaysHits: true,
        criticalDamage: 1, passiveSkill: 'PASSIVE_TERRITORIAL',
      },
    }, {
      id: 'OtherMonster', name: 'Other Monster', description: '', imageKey: 'unit_wolf', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0,
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [
      { uid: 'banshee', enemyId: 'TestBanshee', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] },
      { uid: 'other', enemyId: 'OtherMonster', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] },
    ]
    run.turnOrder = ['e:banshee']

    combatTurn(state, run, index)

    expect(state.adventurers[0].hp).toBe(40)
    expect(run.enemies[1].hp).toBe(90)
  })

  it('combines equipment hit effects and end-of-turn actions with class combat data', () => {
    vi.mocked(Math.random).mockReturnValue(0.99)
    const variant = structuredClone(content)
    variant.items.push({
      id: 'TriggeredBow', name: 'Triggered Bow', description: '', imageKey: 'training_bow', type: 'Bow',
      fields: {
        alwaysHits: true,
        onTargetHit: { statusEffect: { type: 'POISON', turns: 2, probability: 1 } },
        endOfTurnAction: 'EXTRA_ATTACK_1',
      },
    })
    variant.enemies.push({
      id: 'EvasiveTarget', name: 'Evasive Target', description: '', imageKey: 'unit_wolf', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 100, baseDexterity: 100,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0,
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    Object.assign(state.tavernGuests[0], { classId: 'Archer', name: 'Archer', hp: 30, weaponId: 'TriggeredBow' })
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1])).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'evasive', enemyId: 'EvasiveTarget', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']

    combatTurn(state, run, index)

    expect(run.enemies[0].hp).toBeLessThan(100)
    expect(run.enemies[0].negativeStatusEffects[0]).toMatchObject({ type: 'POISON', turnsLeft: 2, causeKey: 'a:1' })
    expect(run.logs.filter((line) => line.includes('damage to Evasive Target'))).toHaveLength(2)
  })

  it('awards experience quests per adventurer multiplier without double counting', () => {
    const variant = structuredClone(content)
    variant.items.push({
      id: 'ExperienceSword', name: 'Experience Sword', description: '', imageKey: 'spade', type: 'Sword',
      fields: { price: 1, bonusExperience: 50 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.activeQuests = [
      { id: 'FastLearner', category: 'King', rarity: 1, progress: 0, target: 1 },
      { id: 'Student', category: 'King', rarity: 1, progress: 0, target: 18 },
    ]
    expect(hireGuest(state, 1)).toBe(true)
    state.adventurers[0].weaponId = 'ExperienceSword'
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'xp', enemyId: 'TutorialWolf', hp: 0, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.action = 'FIGHT'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(state.activeQuests).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'FastLearner', progress: 1 }),
      expect.objectContaining({ id: 'Student', progress: 18 }),
    ]))
    expect(state.adventurers[0].xp).toBe(18)
  })

  it('counts Crystal Clear when a negative status is blocked by immunity', () => {
    const variant = structuredClone(content)
    variant.adventurers[0].fields.immunityToStatus = 1
    variant.enemies.push({
      id: 'StatusCaster', name: 'Status Caster', description: '', imageKey: 'unit_wizard', minDamage: 1, maxDamage: 1, drops: [],
      fields: {
        baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 1,
        baseDefense: 0, baseMagicDefense: 0, expGiven: 0, alwaysHits: true,
        onTargetHit: { statusEffect: { type: 'STUN', turns: 1, probability: 1 } },
      },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.activeQuests = [{ id: 'CrystalClear', category: 'Control', rarity: 3, progress: 0, target: 2 }]
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'caster', enemyId: 'StatusCaster', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:caster']

    combatTurn(state, run, index)
    combatTurn(state, run, index)

    expect(state.activeQuests[0]).toMatchObject({ progress: 2 })
    expect(state.adventurers[0].negativeStatusEffects).toEqual([])
  })

  it('applies original cursed decay and tracks Falling Apart without consuming shields', () => {
    const variant = structuredClone(content)
    variant.items.push({
      id: 'DecaySword', name: 'Decay Sword', description: '', imageKey: 'spade', type: 'Sword',
      fields: { price: 1, decay: 20 },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.activeQuests = [{ id: 'FallingApart', category: 'Control', rarity: 3, progress: 0, target: 21 }]
    expect(hireGuest(state, 1)).toBe(true)
    state.adventurers[0].weaponId = 'DecaySword'
    state.adventurers[0].rareTrait = 'CURSED'
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    state.adventurers[0].shield = 100
    run.enemies = [{ uid: 'dummy', enemyId: 'TestDummy', hp: 1000, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']

    combatTurn(state, run, index)

    expect(state.activeQuests[0]).toMatchObject({ progress: 21 })
    expect(state.adventurers[0].hp).toBe(20)
    expect(state.adventurers[0].shield).toBe(100)
    expect(run.logs.findIndex((line) => line.includes('lost 21 HP to decay')))
      .toBeGreaterThan(run.logs.findIndex((line) => line.includes('dealt') && line.includes('Training Golem')))
  })

  it('counts Marathon only for Primeval Wurm progress and Long March on searches', () => {
    const variant = structuredClone(content)
    variant.areas.push({ id: 'TheSouthernGrove', name: 'The Southern Grove', areaType: 0, enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '' })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('TheSouthernGrove')
    state.activeQuests = [
      { id: 'Marathon', category: 'Ruin', rarity: 4, progress: 0, target: 20 },
      { id: 'LongMarch', category: 'King', rarity: 1, progress: 0, target: 20 },
    ]
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'TheSouthernGrove', [1], index)).toBe(true)
    const run = state.runs.TheSouthernGrove
    run.progress = 7
    run.event = { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 7 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1

    vi.mocked(Math.random).mockReturnValue(0.99)
    tickGame(state, index, 1)

    expect(state.activeQuests).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'Marathon', progress: 7 }),
      expect.objectContaining({ id: 'LongMarch', progress: 0 }),
    ]))

    run.event = { kind: 'PRIMEVAL_WURM_COOLDOWN', progress: 0 }
    run.action = 'ENTER_ROOM'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(state.activeQuests.find((quest) => quest.id === 'Marathon')?.progress).toBe(7)

    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(state.activeQuests.find((quest) => quest.id === 'LongMarch')?.progress).toBe(1)
  })

  it('counts Thalassophobia only when the Kraken fight search yields its reward', () => {
    const variant = structuredClone(content)
    variant.areas.push({ id: 'BlackwaterPort', name: 'Blackwater Port', areaType: 0, enemies: [], encounterRosters: [], unlocks: [], summaryImageKey: '', detailImageKey: '' })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.unlockedAreas.push('BlackwaterPort')
    state.activeQuests = [{ id: 'Thalassophobia', category: 'Ruin', rarity: 4, progress: 0, target: 2 }]
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'BlackwaterPort', [1], index)).toBe(true)
    const run = state.runs.BlackwaterPort
    run.event = { kind: 'THE_KRAKEN_FIGHT', progress: 0 }
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1

    tickGame(state, index, 1)

    expect(state.activeQuests[0]).toMatchObject({ progress: 1 })
    run.event = { kind: 'THE_KRAKEN', progress: 0 }
    run.action = 'SEARCH'
    run.actionRemaining = 1
    run.actionTotal = 1
    tickGame(state, index, 1)
    expect(state.activeQuests[0]).toMatchObject({ progress: 1 })
  })

  it('increments Master Crafter when a completed craft is collected', () => {
    const variant = structuredClone(content)
    variant.items.find((item) => item.id === 'Leather')!.fields.price = 100
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.inventory.push({ itemId: 'BeastPelt', stack: 2 })
    state.activeQuests = [{ id: 'MasterCrafter', category: 'King', rarity: 1, progress: 0, target: 1 }]
    expect(queueWorkshopRecipe(state, index, 'Leather')).toBe(true)
    expect(state.activeQuests[0].progress).toBe(0)
    const job = state.workshopQueue[0]
    tickGame(state, index, job.totalSeconds)
    expect(state.completedWorkshopItems).toHaveLength(1)
    expect(collectWorkshopJob(state, job.uid, index)).toBe(true)
    expect(state.activeQuests[0]).toMatchObject({ progress: 1 })
  })

  it('keeps Android rounding and rare weapon damage deltas', () => {
    expect(applyDamage(100, 20, 9, 1, 0.5)).toBe(77)
    expect(adventurerAttackBounds('type_staff', 1, 40, 1, 'UnstableStaff')).toEqual({ min: 8, max: 72 })
  })

  it('applies equipment poison potency and preserves same-status stacking', () => {
    const variant = structuredClone(content)
    variant.adventurers[0].fields.alwaysHits = true
    variant.adventurers[0].fields.onTargetHit = { statusEffect: { type: 'POISON', turns: 5, probability: 1 } }
    variant.items.push(
      { id: 'ToxinPouch', name: 'Toxin Pouch', description: '', imageKey: 'pouch', type: 'Accessory', fields: { price: 1, poisonBonus: 30 } },
      { id: 'PoisonSword', name: 'Poison Sword', description: '', imageKey: 'sword', type: 'Sword', fields: { price: 1, onTargetHit: { statusEffect: { type: 'POISON', turns: 5, probability: 1 } } } },
      { id: 'PoisonArmor', name: 'Poison Armor', description: '', imageKey: 'armor', type: 'HeavyArmor', fields: { price: 1, onTargetHit: { statusEffect: { type: 'POISON', turns: 2, probability: 1 } } } },
    )
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    state.adventurers[0].accessoryId = 'ToxinPouch'
    state.adventurers[0].weaponId = 'PoisonSword'
    state.adventurers[0].armorId = 'PoisonArmor'
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'poison-target', enemyId: 'TestDummy', hp: 1000, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['a:1']

    vi.mocked(Math.random).mockReturnValue(0.99)
    combatTurn(state, run, index)

    const poisons = run.enemies[0].negativeStatusEffects.filter((effect) => effect.type === 'POISON')
    expect(poisons).toHaveLength(3)
    expect(poisons.map((effect) => effect.turnsLeft)).toEqual([5, 5, 2])
    expect(poisons[0].potency).toBe(30)
  })

  it('remembers collected unique items and exposes missing unique drops at one gem', () => {
    const variant = structuredClone(content)
    variant.items.push({ id: 'SkeletonKey', name: 'Skeleton Key', description: '', imageKey: 'key', type: 'Accessory', fields: { price: 1, uniqueOrigin: 'SkeletonKey', notSellable: true } })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.seenItems.push('SkeletonKey')
    state.runs.EnchantedForest = {
      areaId: 'EnchantedForest', action: 'IDLE', actionRemaining: 0, actionTotal: 1, progress: 0, maxProgress: 0,
      partyIds: [], petUid: null, enemies: [], summons: [], turnOrder: [], turnIndex: 0, event: null, chest: [{ itemId: 'SkeletonKey', stack: 1 }],
      logs: [], localDarkness: 0, finished: false,
    }
    expect(collectChest(state, 'EnchantedForest', index)).toBe(true)
    expect(state.seenItems).toContain('SkeletonKey')
    expect(state.inventory).toContainEqual({ itemId: 'SkeletonKey', stack: 1 })

    state.inventory = []
    refreshMerchantSpecial(state, index, () => 0.99)
    expect(state.merchantSpecialStock).toContainEqual(expect.objectContaining({ itemId: 'SkeletonKey', price: 1, gems: true }))
  })

  it('lets nonzero-team enemies target other enemy teams without targeting their own team', () => {
    const variant = structuredClone(content)
    const enemy = (id: string, name: string, team?: number, threat = 1) => ({
      id, name, description: '', imageKey: 'unit_wolf', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 1, baseDexterity: 100, baseDefense: 0, baseMagicDefense: 0, team, expGiven: 0, threat, alwaysHits: true },
    })
    variant.enemies.push(
      enemy('TeamLeader', 'Team Leader', 1),
      enemy('TeamMate', 'Team Mate', 1, 1000),
      enemy('OtherEnemy', 'Other Enemy', 0, 100),
    )
    const index = indexContent(variant)
    const state = createInitialState(index)
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [
      { uid: 'leader', enemyId: 'TeamLeader', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] },
      { uid: 'mate', enemyId: 'TeamMate', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] },
      { uid: 'other', enemyId: 'OtherEnemy', hp: 100, mana: 0, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] },
    ]
    run.turnOrder = ['e:leader']

    vi.mocked(Math.random).mockReturnValue(0.99)
    combatTurn(state, run, index)

    expect(state.adventurers[0].hp).toBe(40)
    expect(run.enemies.find((entry) => entry.uid === 'mate')?.hp).toBe(100)
    expect(run.enemies.find((entry) => entry.uid === 'other')?.hp).toBeLessThan(100)
  })

  it('does not count an escaped enemy as a kill quest or clear-the-room kill', () => {
    const variant = structuredClone(content)
    variant.enemies.push({
      id: 'Escaper', name: 'Escaper', description: '', imageKey: 'unit_wolf', minDamage: 1, maxDamage: 1, drops: [],
      fields: { baseMaxHp: 100, baseConstitution: 1, baseIntelligence: 100, baseDexterity: 1, baseDefense: 0, baseMagicDefense: 0, expGiven: 0, activeSkill: 'ACTIVE_ESCAPE' },
    })
    const index = indexContent(variant)
    const state = createInitialState(index)
    state.activeQuests = [
      { id: 'AndStayDead', category: 'King', rarity: 1, progress: 0, target: 1 },
      { id: 'TabulaRasa', category: 'Ruin', rarity: 4, progress: 0, target: 1 },
    ]
    expect(hireGuest(state, 1)).toBe(true)
    expect(startRun(state, 'EnchantedForest', [1], index)).toBe(true)
    const run = state.runs.EnchantedForest
    run.enemies = [{ uid: 'escape', enemyId: 'Escaper', hp: 100, mana: 100, shield: 0, positiveStatusEffects: [], negativeStatusEffects: [] }]
    run.turnOrder = ['e:escape']

    combatTurn(state, run, index)

    expect(run.enemies).toEqual([])
    expect(state.activeQuests).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'AndStayDead', progress: 0 }),
      expect.objectContaining({ id: 'TabulaRasa', progress: 0 }),
    ]))
  })
})
