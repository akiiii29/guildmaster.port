import type {
  AdventurerDefinition,
  AdventurerState,
  AreaDefinition,
  AreaRun,
  ConfiguredStatusEffect,
  EnemyDefinition,
  EnemyState,
  EquipmentSlot,
  GameState,
  InventoryStack,
  StatusEffectState,
  StatusEffectType,
  PetAbilityType,
  PetState,
  DoctrineId,
} from './types'
import type { ContentIndex } from './content'
import {
  ACTION_TURNS,
  adventurerAttackBounds,
  applyDamage,
  buildingCapacity,
  experienceToNextLevel,
  gameRound,
  rollBetween,
  tavernCapacityPrice,
  tavernTimePrice,
  tavernVisitorIntervalSeconds,
  marketListingsCapacity,
  marketListingsPrice,
  marketSaleSeconds,
  marketTimePrice,
  petFoodToNextLevel,
  shelterCapacity,
  shelterPrice,
  shelterAutofeedPrice,
  quartersPrice,
  storagePrice,
  workshopCraftSeconds,
  workshopQueueCapacity,
  workshopQueuePrice,
  workshopTimePrice,
} from './formulas'
import { maxCraftable, RECIPES, recipeById } from './recipes'
import { PROMOTION_PATHS } from './promotionPaths'
import {
  adventurerStats,
  defaultWeaponId,
  equipmentItemId,
  itemMatchesSlot,
  setEquipmentItemId,
  weaponIsMagic,
  weaponIsRanged,
  weaponTypeKey,
} from './stats'
import {
  ACTIVE_SKILLS,
  type CombatSkillStep,
  type TargetMode,
} from './combatSkills'
import { DOCTRINE_ABILITIES, DOCTRINES, doctrineAbilityValue, doctrinePointsAvailable } from './doctrines'
import {
  ANCIENT_GRAVE_DIGGING_LOGS,
  BARREN_WASTELANDS_LOGS,
  BLACKWATER_PORT_LOGS,
  CELESTIAL_MOTHERSHIP_LOGS,
  DIVINE_ARCHEOLOGY_LOGS,
  ENCHANTED_FOREST_LOGS,
  ETERNAL_BATTLEFIELD_LOGS,
  FROSTBITE_PEAKS_LOGS,
  HIDDEN_CITY_OF_LAROX_LOGS,
  IMPERIAL_RESCUE_LOGS,
  KAUNIS_LOGS,
  LOST_LANDS_LOGS,
  OBSIDIAN_MINES_LOGS,
  SLEEPING_PLANET_LOGS,
  THE_TOWER_LOGS,
  THE_DREADFUL_ASCENT_LOGS,
  THE_DIRE_DESCENT_LOGS,
  THE_CULTIST_REBELS_LOGS,
  THE_SLIME_POND_LOGS,
  THE_LOST_EXPEDITION_LOGS,
  THE_SOUTHERN_GROVE_LOGS,
  enterEnchantedForestRoom,
  enterAncientGraveDiggingRoom,
  enterBarrenWastelandsRoom,
  enterBlackwaterPortRoom,
  enterCelestialMothershipRoom,
  enterDivineArcheologyRoom,
  enterEternalBattlefieldRoom,
  enterFrostbitePeaksRoom,
  enterHiddenCityOfLaroxRoom,
  enterImperialRescueRoom,
  enterKaunisRoom,
  enterLostLandsRoom,
  enterObsidianMinesRoom,
  enterSleepingPlanetRoom,
  enterTheTowerRoom,
  enterTheDreadfulAscentRoom,
  enterTheDireDescentRoom,
  enterTheCultistRebelsRoom,
  enterTheSlimePondRoom,
  enterTheLostExpeditionRoom,
  enterTheSouthernGroveRoom,
  enterTheGoldenCityRoom,
  enterTheDesertRoom,
  killEnchantedForestEnemy,
  killAncientGraveDiggingEnemy,
  killCelestialMothershipEnemy,
  killEternalBattlefieldEnemy,
  killTheDesertEnemy,
  laroxMagicAmplification,
  advanceLostLandsFireRitual,
  rollEnchantedForestEncounter,
  rollAncientGraveDiggingEncounter,
  rollBarrenWastelandsEncounter,
  rollBlackwaterPortEncounter,
  rollCelestialMothershipEncounter,
  rollDivineArcheologyEncounter,
  rollEternalBattlefieldEncounter,
  rollFrostbitePeaksEncounter,
  rollHiddenCityOfLaroxEncounter,
  rollImperialRescueEncounter,
  rollKaunisEncounter,
  rollLostLandsEncounter,
  rollObsidianMinesEncounter,
  rollSleepingPlanetEncounter,
  rollTheTowerEncounter,
  rollTheDreadfulAscentEncounter,
  rollTheDireDescentEncounter,
  rollTheCultistRebelsEncounter,
  rollTheSlimePondEncounter,
  rollTheLostExpeditionEncounter,
  rollTheSouthernGroveEncounter,
  rollTheGoldenCityEncounter,
  rollTheDesertEncounter,
  searchEnchantedForest,
  searchBarrenWastelands,
  searchBlackwaterPort,
  searchEternalBattlefield,
  searchFrostbitePeaks,
  searchHiddenCityOfLarox,
  searchLostLands,
  searchObsidianMines,
  searchTheGoldenCity,
  searchTheSouthernGrove,
  searchTheDesert,
  startEnchantedForestFight,
  startAncientGraveDiggingFight,
  startBarrenWastelandsFight,
  startBlackwaterPortFight,
  startCelestialMothershipFight,
  startDivineArcheologyFight,
  startEternalBattlefieldFight,
  startFrostbitePeaksFight,
  startHiddenCityOfLaroxFight,
  startImperialRescueFight,
  startKaunisFight,
  startLostLandsFight,
  startObsidianMinesFight,
  startSleepingPlanetFight,
  startTheTowerFight,
  startTheDreadfulAscentFight,
  startTheDireDescentFight,
  startTheCultistRebelsFight,
  startTheSlimePondFight,
  startTheLostExpeditionFight,
  startTheSouthernGroveFight,
  startTheGoldenCityFight,
  startTheDesertFight,
  THE_GOLDEN_CITY_LOGS,
  THE_DESERT_LOGS,
} from './areaScripts'

const BASE_CLASSES = ['Footman', 'Rogue', 'Archer', 'Apprentice'] as const
const TRAITS = ['BOOKWORM', 'BRUTE', 'FERAL', null] as const

const RAID_TEAM_SIZES: Record<string, number> = {
  AncientGraveDigging: 8,
  CelestialMothership: 8,
  DivineArcheology: 8,
  ImperialRescue: 8,
  Kaunis: 14,
  SleepingPlanet: 14,
  TheCultistRebels: 8,
  TheDireDescent: 8,
  TheDreadfulAscent: 8,
  TheLostExpedition: 8,
  TheSlimePond: 5,
  TheTower: 14,
}

const CHEAPER_RAID_REFILLS = new Set(['Kaunis', 'SleepingPlanet', 'TheTower'])
const INITIAL_SEEN_ITEMS = [
  'ScarletStrand', 'Intercession', 'Dreamcatcher',
  'UpgradeMarketQueue', 'UpgradeMarketTime', 'UpgradeQuarters', 'UpgradeShelter', 'UpgradeStorage',
  'UpgradeTavernCapacity', 'UpgradeTavernTime', 'UpgradeWorkshopQueue', 'UpgradeWorkshopTime', 'Evo23Vial2',
]
const UNIQUE_DROP_IDS = [
  'DivineZygote', 'DivineEmbryo', 'DivineLarvae', 'Sha',
  'EyesOfTheSwordsman', 'AmuletOfTheSwordsman', 'SkeletonKey',
  'SerpentStaff', 'SerpentLunge', 'SerpentBite', 'SerpentSting',
]

export function areaTeamSize(area?: AreaDefinition) {
  if (!area) return 4
  if (RAID_TEAM_SIZES[area.id]) return RAID_TEAM_SIZES[area.id]
  if (area.maxTeamSize && area.maxTeamSize > 0) return area.maxTeamSize
  return 4
}

export function raidTryCost(areaId: string) {
  return CHEAPER_RAID_REFILLS.has(areaId) ? 15 : 30
}

export function raidTryAvailable(state: GameState, areaId: string) {
  return state.raidTries[areaId] ?? true
}

const EPIC_RAID_PROGRESS_TARGETS: Record<string, number> = {
  TheDreadfulAscent: 13,
  CelestialMothership: 18,
  TheDireDescent: 7,
  DivineArcheology: 13,
  ImperialRescue: 15,
}

export function epicRaidProgressTarget(areaId: string) {
  return EPIC_RAID_PROGRESS_TARGETS[areaId]
}

export function completedEpicRaid(run: AreaRun | undefined) {
  if (!run?.finished || run.chest.length > 0) return false
  const target = epicRaidProgressTarget(run.areaId)
  return target !== undefined && run.maxProgress >= target
}

function localDayStart(timestamp: number) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function refreshDailyRaidTries(state: GameState, index: ContentIndex, now = Date.now()) {
  const today = localDayStart(now)
  if (today <= state.lastDailyReset) return false
  for (const area of index.areas.values()) {
    if (area.areaType !== 0) state.raidTries[area.id] = true
  }
  state.lastDailyReset = today
  return true
}

const appendLog = (run: AreaRun, message: string) => {
  run.logs = [message, ...run.logs].slice(0, 30)
}

export function makeAdventurer(
  definition: AdventurerDefinition,
  uid: number,
  rng = Math.random,
): AdventurerState {
  return {
    uid,
    classId: definition.id,
    name: definition.name.replaceAll("\\'", "'"),
    level: 1,
    xp: 0,
    hp: definition.fields.baseMaxHp,
    mana: Number(definition.fields.currentMana ?? 0),
    shield: 0,
    positiveStatusEffects: [],
    negativeStatusEffects: [],
    trait: TRAITS[Math.floor(rng() * TRAITS.length)],
    rareTrait: null,
    areaId: null,
    weaponId: defaultWeaponId(definition),
    armorId: null,
    accessoryId: null,
    seen: false,
    ascended: false,
    doctrineId: null,
    doctrineLevels: [],
    potionsDrank: Array(11).fill(0),
  }
}

export function createInitialState(index: ContentIndex): GameState {
  const guestClass = index.adventurers.get('Footman') ?? index.adventurers.get(BASE_CLASSES[Math.floor(Math.random() * 4)])!
  const now = Date.now()
  const firstGuest = makeAdventurer(guestClass, 1)
  firstGuest.trait = null
  return {
    version: 25,
    language: 'en',
    settings: {
      sellMaxAmount: 1,
      craftMaxAmount: 1,
      confirmUpgrade: true,
      confirmRetreat: true,
      confirmSwap: true,
      autoOpenDungeonDetail: true,
      verboseLogs: false,
      colorblindMode: false,
    },
    lastAccess: now,
    lastDailyReset: localDayStart(now),
    tutorialStep: 1,
    money: 0,
    gems: 1_000,
    purchasedPacks: { starter: false, merchant: false },
    loyalty: {
      Affliction: { level: 0, stars: 0 }, Control: { level: 0, stars: 0 },
      Fortitude: { level: 0, stars: 0 }, Grace: { level: 0, stars: 0 },
      Illusion: { level: 0, stars: 0 }, Knowledge: { level: 0, stars: 0 },
      Ruin: { level: 0, stars: 0 }, War: { level: 0, stars: 0 },
    },
    activeQuests: [],
    lastQuestReset: localWeekStart(now),
    questsRefreshed: false,
    nextAdventurerId: 2,
    nextTavernVisit: tavernVisitorIntervalSeconds(0),
    tavernLocked: false,
    tavernGuests: [firstGuest],
    adventurers: [],
    dismissedAdventurers: [],
    inventory: [],
    knownRecipes: [],
    nextWorkshopJobId: 1,
    workshopQueue: [],
    completedWorkshopItems: [],
    nextMarketListingId: 1,
    marketListings: [],
    soldMarketItems: [],
    nextMerchantOfferId: 1,
    merchantRegularStock: [],
    merchantSpecialStock: [],
    lastMerchantRegularReset: localDayStart(now),
    lastMerchantSpecialReset: localWeekStart(now),
    permanentUpgrades: {},
    nextPetId: 1,
    pets: [],
    buildings: {
      quarters: 0,
      tavernCapacity: 0,
      tavernTime: 0,
      storage: 0,
      marketListings: 0,
      marketTime: 0,
      workshopQueue: 0,
      workshopTime: 0,
      shelter: 0,
      shelterAutofeed: 0,
    },
    unlockedAreas: ['EnchantedForest'],
    seenItems: [...INITIAL_SEEN_ITEMS],
    seenEnemies: [],
    receivedMessages: [1],
    unreadMessages: [1],
    raidTries: Object.fromEntries([...index.areas.values()].filter((area) => area.areaType !== 0).map((area) => [area.id, true])),
    runs: {},
    achievementStats: { craftedItems: 0, soldItems: 0, claimedQuests: 0, defeatedEnemies: {} },
    unlockedAchievements: [],
    pendingAchievementNotifications: [],
    totalTicks: 0,
  }
}

const addStack = (list: InventoryStack[], stack: InventoryStack) => {
  const current = list.find((entry) => entry.itemId === stack.itemId)
  if (current) current.stack += stack.stack
  else list.push({ ...stack })
}

function hasStorageSpaceFor(state: GameState, stacks: InventoryStack[]) {
  const existing = new Set(state.inventory.map((entry) => entry.itemId))
  const newIds = new Set(stacks.filter((stack) => stack.stack > 0 && !existing.has(stack.itemId)).map((stack) => stack.itemId))
  const capacity = buildingCapacity('storage', state.buildings.storage, state.permanentUpgrades.UpgradeStorage ?? 0, state.purchasedPacks)
  return state.inventory.length + newIds.size <= capacity
}

const removeStack = (list: InventoryStack[], itemId: string, amount: number) => {
  const current = list.find((entry) => entry.itemId === itemId)
  if (!current || current.stack < amount) return false
  current.stack -= amount
  if (current.stack === 0) list.splice(list.indexOf(current), 1)
  return true
}

function spawnTavernVisitor(state: GameState, index: ContentIndex, rng = Math.random) {
  const tutorialStep = state.tutorialStep
  const classId = tutorialStep <= 1
    ? 'Footman'
    : tutorialStep === 6
      ? 'LightDisciple'
      : tutorialStep === 7
        ? 'Archer'
        : BASE_CLASSES[Math.floor(rng() * BASE_CLASSES.length)]
  const definition = index.adventurers.get(classId) ?? index.adventurers.get('Footman')
  if (!definition) return false
  const visitor = makeAdventurer(definition, state.nextAdventurerId++, rng)
  if (tutorialStep <= 1) visitor.trait = null
  else if (tutorialStep === 6) visitor.trait = 'BOOKWORM'
  else if (tutorialStep === 7) {
    visitor.trait = 'FERAL'
    state.tutorialStep = 8
  }
  state.tavernGuests.unshift(visitor)
  state.tavernGuests = state.tavernGuests.slice(0, buildingCapacity('tavern', state.buildings.tavernCapacity, state.permanentUpgrades.UpgradeTavernCapacity ?? 0, state.purchasedPacks))
  return true
}

export function progressTavernTime(state: GameState, index: ContentIndex, seconds: number) {
  if (state.tavernLocked) return
  const interval = tavernVisitorIntervalSeconds(state.buildings.tavernTime, state.permanentUpgrades.UpgradeTavernTime ?? 0)
  let arrivals = Math.floor(seconds / interval)
  let nextVisit = state.nextTavernVisit - (seconds % interval)
  if (nextVisit < 0) {
    nextVisit += interval
    arrivals += 1
  }
  state.nextTavernVisit = nextVisit
  const arrivalLimit = Math.min(arrivals, buildingCapacity('tavern', state.buildings.tavernCapacity, state.permanentUpgrades.UpgradeTavernCapacity ?? 0, state.purchasedPacks))
  for (let arrival = 0; arrival < arrivalLimit; arrival += 1) spawnTavernVisitor(state, index)
}

function workshopSeconds(state: GameState, itemPrice: number, stack: number, recipeId: string) {
  if (state.tutorialStep === 3 && recipeId === 'Leather') return 10
  if (state.tutorialStep === 4 && recipeId === 'CopperArmor') return 20
  return Math.max(1, workshopCraftSeconds(itemPrice, stack, state.buildings.workshopTime, state.permanentUpgrades.UpgradeWorkshopTime ?? 0, state.purchasedPacks.merchant))
}

function tickWorkshop(state: GameState) {
  const current = state.workshopQueue[0]
  if (!current) return
  current.remainingSeconds -= 1
  if (current.remainingSeconds > 0) return
  current.remainingSeconds = 0
  state.completedWorkshopItems.push(current)
  state.workshopQueue.shift()
}

const action = (run: AreaRun, next: keyof typeof ACTION_TURNS) => {
  run.action = next
  run.actionTotal = ACTION_TURNS[next]
  run.actionRemaining = ACTION_TURNS[next]
}

function rollEncounter(state: GameState, run: AreaRun, index: ContentIndex) {
  if (run.areaId === 'EnchantedForest') {
    return rollEnchantedForestEncounter(
      run.event,
      Math.random(),
      buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks) <= 2,
    )
  }
  if (run.areaId === 'TheDesert') return rollTheDesertEncounter(run.event, Math.random())
  if (run.areaId === 'EternalBattlefield') return rollEternalBattlefieldEncounter(Math.random())
  if (run.areaId === 'TheGoldenCity') return rollTheGoldenCityEncounter(run.event, Math.random())
  if (run.areaId === 'BlackwaterPort') {
    const result = rollBlackwaterPortEncounter(run.event, Math.random())
    run.event = result.event
    result.logs.forEach((log) => appendLog(run, log))
    return result.roster
  }
  if (run.areaId === 'FrostbitePeaks') return rollFrostbitePeaksEncounter(Math.random())
  if (run.areaId === 'BarrenWastelands') return rollBarrenWastelandsEncounter(Math.random())
  if (run.areaId === 'HiddenCityOfLarox') return rollHiddenCityOfLaroxEncounter(Math.random())
  if (run.areaId === 'LostLands') {
    const result = rollLostLandsEncounter(run.event, Math.random())
    run.event = result.event
    return result.roster
  }
  if (run.areaId === 'ObsidianMines') {
    const bossReady = run.event?.kind === 'UNSPEAKABLE_HORROR' && run.event.progress >= 70
    const result = rollObsidianMinesEncounter(run.event, bossReady ? 0 : Math.random())
    run.event = result.event
    return result.roster
  }
  if (run.areaId === 'AncientGraveDigging') return rollAncientGraveDiggingEncounter(run.progress)
  if (run.areaId === 'TheSlimePond') return rollTheSlimePondEncounter(run.progress)
  if (run.areaId === 'DivineArcheology') {
    return rollDivineArcheologyEncounter(
      run.progress,
      run.maxProgress,
      run.event?.kind === 'PYRAMID_DOOR_OPEN',
      ownsItem(state, 'EyesOfTheSwordsman', run.areaId),
      ownsItem(state, 'DivineZygote', run.areaId),
    )
  }
  if (run.areaId === 'ImperialRescue') {
    return rollImperialRescueEncounter(run.progress, run.maxProgress, ownsItem(state, 'SkeletonKey', run.areaId))
  }
  if (run.areaId === 'TheCultistRebels') return rollTheCultistRebelsEncounter(run.event)
  if (run.areaId === 'TheLostExpedition') return rollTheLostExpeditionEncounter(run.progress, run.event)
  if (run.areaId === 'SleepingPlanet') return rollSleepingPlanetEncounter(run.progress)
  if (run.areaId === 'Kaunis') return rollKaunisEncounter(run.progress)
  if (run.areaId === 'TheTower') return rollTheTowerEncounter(run.progress)
  if (run.areaId === 'TheDreadfulAscent') {
    return rollTheDreadfulAscentEncounter(run.progress, run.maxProgress, ownsItem(state, 'SerpentStaff', run.areaId))
  }
  if (run.areaId === 'CelestialMothership') {
    return rollCelestialMothershipEncounter(run.progress, run.maxProgress, ownsItem(state, 'Evo23Vial', run.areaId))
  }
  if (run.areaId === 'TheDireDescent') {
    return rollTheDireDescentEncounter(run.progress, run.maxProgress, ownsItem(state, 'SerpentLunge', run.areaId))
  }
  if (run.areaId === 'TheSouthernGrove') {
    const result = rollTheSouthernGroveEncounter(run.event, Math.random())
    run.event = result.event
    return result.roster
  }
  const area = index.areas.get(run.areaId)
  if (!area) return []
  const rosters = area.encounterRosters.filter((entry) => entry.enemies.length > 0)
  if (Math.random() >= 0.5 || rosters.length === 0) return []
  return rosters[Math.floor(Math.random() * rosters.length)].enemies
}

function ownsItem(state: GameState, itemId: string, areaId?: string) {
  return state.seenItems.includes(itemId)
    || state.inventory.some((item) => item.itemId === itemId && item.stack > 0)
    || state.adventurers.some((member) => [member.weaponId, member.armorId, member.accessoryId].includes(itemId))
    || Boolean(areaId && state.runs[areaId]?.chest.some((item) => item.itemId === itemId && item.stack > 0))
}

export function discoverRecipesForItem(state: GameState, itemId: string) {
  RECIPES.forEach((recipe) => {
    if (recipe.ingredients.some((ingredient) => ingredient.itemId === itemId) && !state.knownRecipes.includes(recipe.id)) state.knownRecipes.push(recipe.id)
  })
}

function rememberItem(state: GameState, itemId: string) {
  if (!state.seenItems.includes(itemId)) state.seenItems.push(itemId)
  discoverRecipesForItem(state, itemId)
}

function addToInventory(state: GameState, stack: InventoryStack) {
  addStack(state.inventory, stack)
  rememberItem(state, stack.itemId)
}

function uniqueItemsHeld(state: GameState, index: ContentIndex) {
  const held = new Set<string>()
  state.inventory.forEach((stack) => { if (stack.stack > 0) held.add(stack.itemId) })
  state.adventurers.forEach((member) => {
    ;[member.weaponId, member.armorId, member.accessoryId].forEach((itemId) => { if (itemId) held.add(itemId) })
  })
  Object.values(state.runs)
    .filter((run) => (index.areas.get(run.areaId)?.areaType ?? 0) !== 0)
    .forEach((run) => run.chest.forEach((stack) => { if (stack.stack > 0) held.add(stack.itemId) }))
  for (const job of [...state.workshopQueue, ...state.completedWorkshopItems]) {
    held.add(job.itemId)
    recipeById.get(job.recipeId)?.ingredients.forEach((ingredient) => held.add(ingredient.itemId))
  }
  return held
}

function missingUniqueDrops(state: GameState, index: ContentIndex) {
  const candidates = UNIQUE_DROP_IDS.filter((itemId) => state.seenItems.includes(itemId))
  for (const itemId of [...candidates]) {
    const origin = String(index.items.get(itemId)?.fields.uniqueOrigin ?? '')
    if (origin && origin !== itemId) {
      const position = candidates.indexOf(origin)
      if (position >= 0) candidates.splice(position, 1)
    }
  }
  const held = uniqueItemsHeld(state, index)
  return candidates.filter((itemId) => !held.has(itemId))
}

function spawnEnemies(ids: string[], index: ContentIndex): EnemyState[] {
  return ids.flatMap((enemyId, position) => {
    const enemy = index.enemies.get(enemyId)
    return enemy ? [{
      uid: `${enemyId}-${position}-${Date.now()}`,
      enemyId,
      hp: enemy.fields.baseMaxHp,
      mana: Number(enemy.fields.currentMana ?? 0),
      shield: 0,
      positiveStatusEffects: [],
      negativeStatusEffects: [],
    }] : []
  })
}

function buildTurnOrder(state: GameState, run: AreaRun, index: ContentIndex) {
  const actors = [
    ...run.partyIds.flatMap((uid) => {
      const adventurer = state.adventurers.find((entry) => entry.uid === uid)
      const definition = adventurer && index.adventurers.get(adventurer.classId)
      return adventurer && definition ? [{ key: `a:${uid}`, dex: adventurerStats(adventurer, index).dexterity, initiative: Boolean(definition.fields.initiative) || adventurer.rareTrait === 'ALERT' }] : []
    }),
    ...run.summons.flatMap((summon) => {
      const definition = index.adventurers.get(summon.classId)
      return definition ? [{ key: `a:${summon.uid}`, dex: adventurerStats(summon, index).dexterity, initiative: Boolean(definition.fields.initiative) || summon.rareTrait === 'ALERT' }] : []
    }),
    ...run.enemies.flatMap((enemy) => {
      const definition = index.enemies.get(enemy.enemyId)
      return definition ? [{ key: `e:${enemy.uid}`, dex: definition.fields.baseDexterity, initiative: Boolean(definition.fields.initiative) }] : []
    }),
  ]
  run.turnOrder = actors.sort((a, b) => Number(b.initiative) - Number(a.initiative) || b.dex - a.dex).map((entry) => entry.key)
  run.turnIndex = 0
}

function livingParty(state: GameState, run: AreaRun) {
  const roster = run.partyIds.flatMap((uid) => {
    const adventurer = state.adventurers.find((entry) => entry.uid === uid)
    return adventurer && adventurer.hp > 0 ? [adventurer] : []
  })
  return [...roster, ...run.summons.filter((summon) => summon.hp > 0)]
}

function livingEnemies(run: AreaRun) {
  return run.enemies.filter((entry) => entry.hp > 0)
}

type CombatantState = Pick<AdventurerState | EnemyState, 'hp' | 'mana' | 'shield' | 'positiveStatusEffects' | 'negativeStatusEffects'>

const STATUS_ICONS: Partial<Record<StatusEffectType, string>> = {
  TAUNT: 'icon_effect_taunt',
  DEFENSIVE_STANCE: 'icon_effect_defensive_stance',
  STUN: 'icon_effect_stun',
  STUN_NOT_CLEANSABLE: 'icon_effect_stun',
  SILENCE: 'icon_effect_silence',
  ABLAZE: 'icon_effect_ablaze',
  POISON: 'icon_effect_poison',
  REGENERATION: 'icon_effect_regeneration',
  LESSER_CURSE: 'icon_effect_curse',
  CURSE: 'icon_effect_curse',
  GREATER_CURSE: 'icon_effect_curse',
  OMINOUS_CURSE: 'icon_effect_curse',
  ABHORRENT_CURSE: 'icon_effect_curse',
  BLEED: 'icon_effect_bleed',
  DELIRIUM: 'icon_effect_delirium',
  FRENZY: 'icon_effect_frenzy',
  ANOINTED: 'icon_effect_anointed',
  INSPIRE: 'icon_effect_inspire',
  EXALT: 'icon_effect_exalt',
  PETRIFY: 'icon_effect_petrify',
  FALSE_LIFE: 'icon_effect_false_life',
  TERRIFY: 'icon_effect_terrify',
  FROZEN: 'icon_effect_freeze',
}

export const statusIconKey = (type: StatusEffectType) => STATUS_ICONS[type]

function absorbDamage(target: CombatantState, damage: number) {
  const absorbed = Math.min(target.shield, damage)
  target.shield -= absorbed
  target.hp = Math.max(0, target.hp - (damage - absorbed))
}

function addStatus(target: CombatantState, effect: StatusEffectState, causeKey?: string) {
  const negative = !['DEFENSIVE_STANCE', 'REGENERATION', 'DELIRIUM', 'FRENZY', 'ANOINTED', 'SKELETON_KEY', 'FEEBLE_TETHER', 'INSPIRE', 'EXALT', 'FALSE_LIFE'].includes(effect.type)
  const statuses = negative ? target.negativeStatusEffects : target.positiveStatusEffects
  const current = statuses.find((entry) => entry.type === effect.type)
  if (effect.type === 'BLEED' && current) {
    current.turnsLeft += effect.turnsLeft
    return
  }
  if (current && effect.turnsLeft > current.turnsLeft) statuses.splice(statuses.indexOf(current), 1)
  statuses.push({ type: effect.type, turnsLeft: effect.turnsLeft, causeKey, potency: effect.potency })
}

function hasStatus(target: CombatantState, type: StatusEffectType) {
  return target.negativeStatusEffects.some((entry) => entry.type === type)
    || target.positiveStatusEffects.some((entry) => entry.type === type)
}

interface CombatantRef {
  key: string
  side: 'party' | 'enemy'
  team: number
  definitionId: string
  state: AdventurerState | EnemyState
  questState: GameState
  name: string
  maxHp: number
  constitution: number
  intelligence: number
  dexterity: number
  defense: number
  magicDefense: number
  minDamage: number
  maxDamage: number
  manaRegen: number
  magic: boolean
  ranged: boolean
  flying: boolean
  activeSkill?: string
  passiveSkill?: string
  healer: boolean
  cleanser: boolean
  threat: number
  alwaysHits: boolean
  accuracyBonus: number
  flatDodge: number
  flatDamageReduction: number
  statusImmunity: number
  regeneration: number
  criticalChance: number
  criticalDamage: number
  lifesteal: number
  lifestealWithMinion: number
  healingModifier: number
  maxOverheal: number
  counterattack: number
  retaliationPhysical: number
  retaliationMagical: number
  onTargetHitEffects: Array<NonNullable<CombatSkillStep['status']>>
  onSelfHitEffects: Array<NonNullable<CombatSkillStep['status']>>
  onDeathEffectsOnAllies: Array<NonNullable<CombatSkillStep['status']>>
  onDeathEffectsOnEnemies: Array<NonNullable<CombatSkillStep['status']>>
  endOfTurnActions: string[]
  initiative: boolean
  darknessDamageAmplification: number
  nightVision: boolean
  saboteur: boolean
  stunChanceOnLowerHp: number
  poisonBonus: number
  onFireBonusDamage: number
  freezeBonusDamage: number
  regenerationBonus: number
  healsMinionBound: boolean
  inspireExaltBonusTurns: number
  increaseHealingAgainst?: { key: string; value: number }
  statusImmunities: StatusEffectType[]
  petDecoy: number
  petBarrier: number
  petSavage: number
  criticalReduction: number
  armorIgnored: number
  ignoreStatusImmunity: number
  rollsDamageThreeTimes: boolean
  extraAttackChance: number
  falseLifeChance: number
  falseLifeDamage: number
  resurrectionChance: number
  lifestealOverheal: number
  damagePerTurnPerStatus: number
  healingNova: number
  moreDamageWhenHalfLife: boolean
  moreDamageDealtAndTaken: boolean
  forcesTargetToCounterattack: boolean
  addsDefensesToRetaliate: boolean
  livingCompanionBonusDamage: number
}

function itemCombatBonus(member: AdventurerState, index: ContentIndex, key: string) {
  return [member.weaponId, member.armorId, member.accessoryId]
    .reduce((sum, itemId) => sum + Number(itemId ? index.items.get(itemId)?.fields[key] ?? 0 : 0), 0)
}

function adventurerExperienceMultiplier(member: AdventurerState, index: ContentIndex) {
  return 1 + itemCombatBonus(member, index, 'bonusExperience') * 0.01
}

function adventurerDecay(member: AdventurerState, index: ContentIndex, maxHp: number) {
  let decay = itemCombatBonus(member, index, 'decay')
  if (member.summonerUid !== undefined) decay = Math.max(1, decay + maxHp * 0.25)
  if (member.rareTrait === 'CURSED') decay = Math.max(1, decay + maxHp * 0.04)
  return gameRound(decay)
}

function configuredStatus(value: ConfiguredStatusEffect | undefined) {
  const effect = value?.statusEffect
  return effect?.type ? { type: effect.type, turnsLeft: effect.turns ?? effect.turnsLeft ?? 0, probability: effect.probability ?? 1 } : undefined
}

function configuredStatuses(values: ConfiguredStatusEffect | ConfiguredStatusEffect[] | undefined) {
  const list = values ? (Array.isArray(values) ? values : [values]) : []
  return list.flatMap((value) => {
    const status = configuredStatus(value)
    return status ? [status] : []
  })
}

function configuredOnHitStatuses(values: ConfiguredStatusEffect[] | { value?: ConfiguredStatusEffect[] } | undefined) {
  return configuredStatuses(Array.isArray(values) ? values : values?.value)
}

function configuredHealingTarget(value: { key?: string; value?: number } | undefined) {
  return value?.key && value.value !== undefined ? { key: value.key, value: value.value } : undefined
}

function configuredEndActions(fields: { endOfTurnAction?: string; endOfTurnActions?: { repeat?: number; value?: string } }) {
  const result = fields.endOfTurnAction ? [fields.endOfTurnAction] : []
  const repeated = fields.endOfTurnActions
  if (repeated?.value) result.push(...Array.from({ length: repeated.repeat ?? 1 }, () => repeated.value!))
  return result
}

function combatants(state: GameState, run: AreaRun, index: ContentIndex): CombatantRef[] {
  const pet = state.pets.find((entry) => entry.uid === run.petUid)
  const petRegeneration = petAbilityStrength(pet, 'REGENERATION')
  const petLifesteal = petAbilityStrength(pet, 'LIFESTEAL')
  const petCounterattack = petAbilityStrength(pet, 'COUNTERATTACK')
  const petDecoy = petAbilityStrength(pet, 'DECOY')
  const petBarrier = petAbilityStrength(pet, 'BARRIER')
  const petSavage = petAbilityStrength(pet, 'SAVAGE')
  const partyMembers = [
    ...run.partyIds.flatMap((uid) => {
      const member = state.adventurers.find((entry) => entry.uid === uid)
      return member ? [member] : []
    }),
    ...run.summons,
  ]
  const party = partyMembers.flatMap((member): CombatantRef[] => {
    const definition = member && index.adventurers.get(member.classId)
    if (!member || !definition) return []
    const equipment = [member.weaponId, member.armorId, member.accessoryId]
      .flatMap((itemId) => itemId ? [index.items.get(itemId)].filter(Boolean) : [])
    const stats = adventurerStats(member, index)
    const weaponId = member.weaponId ?? defaultWeaponId(definition)
    const weapon = weaponId ? index.items.get(weaponId) : undefined
    const weaponType = weaponTypeKey(weapon, definition.fields.weaponType?.key ?? 'type_sword')
    const threat = Math.max(1, Number(definition.fields.threat ?? 1) + itemCombatBonus(member, index, 'threat') + doctrineAbilityValue(member, 'MANIFEST_DANGER') + (member.rareTrait === 'INTIMIDATING' ? 1 : 0))
    const bounds = adventurerAttackBounds(weaponType, stats.constitution, stats.intelligence, stats.dexterity, weaponId ?? undefined, threat)
    const magic = weaponIsMagic(weapon, weaponType)
    const attackStat = magic ? stats.intelligence : stats.dexterity
    return [{
      key: `a:${member.uid}`,
      side: 'party',
      team: 0,
      definitionId: definition.id,
      state: member,
      questState: state,
      name: member.name,
      maxHp: stats.maxHp,
      constitution: stats.constitution,
      intelligence: stats.intelligence,
      dexterity: stats.dexterity,
      defense: stats.defense,
      magicDefense: stats.magicDefense,
      minDamage: bounds.min,
      maxDamage: bounds.max,
      manaRegen: Math.trunc(stats.intelligence / 10) + 10 + doctrineAbilityValue(member, 'EXALTED_MANA') + (member.rareTrait === 'GIFTED' ? 2 : 0),
      magic,
      ranged: weaponIsRanged(weapon, weaponType),
      flying: Boolean(definition.fields.flying),
      activeSkill: definition.fields.activeSkill,
      passiveSkill: definition.fields.passiveSkill,
      healer: Boolean(definition.fields.healer),
      cleanser: Boolean(definition.fields.cleanser),
      threat,
      alwaysHits: Boolean(definition.fields.alwaysHits) || equipment.some((item) => Boolean(item?.fields.alwaysHits)),
      accuracyBonus: member.rareTrait === 'FOCUSED' ? 0.15 : 0,
      flatDodge: Number(definition.fields.flatDodgeChance ?? 0) + itemCombatBonus(member, index, 'flatDodgeChance') + doctrineAbilityValue(member, 'EPHEMERAL_PRESENCE') * 0.01 + (member.potionsDrank?.[10] ?? 0) * 0.01 + (member.rareTrait === 'NIMBLE' ? 0.08 : 0),
      flatDamageReduction: member.rareTrait === 'DRAGON_BLOOD' ? Math.trunc(definition.fields.maxLevel / 5) + (member.ascended ? 9 : 0) : 0,
      statusImmunity: Number(definition.fields.immunityToStatus ?? 0) + itemCombatBonus(member, index, 'immunityToStatus') + doctrineAbilityValue(member, 'IMPENETRABLE_WILLPOWER') * 0.01 + (member.potionsDrank?.[9] ?? 0) * 0.01 + (member.rareTrait === 'MINDFUL' ? 0.1 : 0),
      regeneration: Number(definition.fields.regeneration ?? 0) + itemCombatBonus(member, index, 'regeneration')
        + (petRegeneration > 0 ? gameRound(petRegeneration * 0.3 + 1) : 0)
        + (member.rareTrait === 'TROLL_BLOOD' ? Math.trunc(definition.fields.maxLevel / 5) + (member.ascended ? 9 : 0) : 0),
      criticalChance: definition.fields.passiveSkill === 'PASSIVE_BLIND_RAGE'
        ? 1
        : Math.min(0.4, attackStat * 0.004) + itemCombatBonus(member, index, 'criticalChance') + doctrineAbilityValue(member, 'EXPOSE_WEAKNESS') * 0.01 + (member.potionsDrank?.[6] ?? 0) * 0.01,
      criticalDamage: (Number(definition.fields.criticalDamage ?? 1.5) + itemCombatBonus(member, index, 'criticalDamage') + doctrineAbilityValue(member, 'EXPLOIT_WEAKNESS') * 0.01 + (member.potionsDrank?.[7] ?? 0) * 0.02) * (member.rareTrait === 'RUTHLESS' ? 1.2 : 1),
      lifesteal: Number(definition.fields.baseLifesteal ?? 0) + itemCombatBonus(member, index, 'lifesteal') + petLifesteal * 0.15 + doctrineAbilityValue(member, 'SERVUS_SANGUINIS') + (member.rareTrait === 'CURSED' ? 15 : 0),
      lifestealWithMinion: itemCombatBonus(member, index, 'lifestealWithMinion'),
      healingModifier: (1 + itemCombatBonus(member, index, 'healingModifier') + doctrineAbilityValue(member, 'SELFLESS_SPIRIT') * 0.01) * (member.rareTrait === 'EMPATHETIC' ? 1.2 : 1),
      maxOverheal: Number(definition.fields.maxOverheal ?? 0) + itemCombatBonus(member, index, 'maxOverheal') + doctrineAbilityValue(member, 'OVERHEAL'),
      counterattack: Number(definition.fields.counterattack ?? 0) + itemCombatBonus(member, index, 'counterattack') + petCounterattack * 0.0035 + doctrineAbilityValue(member, 'CONDITIONED_REFLEXES') * 0.01 + (member.rareTrait === 'REACTIVE' ? 0.1 : 0),
      retaliationPhysical: Number(definition.fields.retaliationPhysicalDamage ?? 0) + itemCombatBonus(member, index, 'retaliationPhysicalDamage'),
      retaliationMagical: Number(definition.fields.retaliationMagicalDamage ?? 0) + itemCombatBonus(member, index, 'retaliationMagicalDamage'),
      onTargetHitEffects: [
        configuredStatus(definition.fields.onTargetHit),
        ...configuredOnHitStatuses(definition.fields.onHit),
        ...equipment.flatMap((item) => configuredStatuses(item?.fields.onTargetHit as ConfiguredStatusEffect | undefined)),
        doctrineAbilityValue(member, 'CHILLING_FLOW') > 0 ? { type: 'FROZEN' as const, turnsLeft: 1, probability: doctrineAbilityValue(member, 'CHILLING_FLOW') * 0.01 } : undefined,
        doctrineAbilityValue(member, 'STAR_GAZE') > 0 ? { type: 'PETRIFY' as const, turnsLeft: 1, probability: doctrineAbilityValue(member, 'STAR_GAZE') * 0.01 } : undefined,
      ].filter(Boolean) as Array<NonNullable<CombatSkillStep['status']>>,
      onSelfHitEffects: [
        configuredStatus(definition.fields.onSelfHit),
        ...equipment.flatMap((item) => configuredStatuses(item?.fields.onSelfHit as ConfiguredStatusEffect | undefined)),
      ].filter(Boolean) as Array<NonNullable<CombatSkillStep['status']>>,
      onDeathEffectsOnAllies: configuredStatuses(definition.fields.onDeathEffectsOnAllies),
      onDeathEffectsOnEnemies: configuredStatuses(definition.fields.onDeathEffectsOnEnemies),
      endOfTurnActions: [
        ...configuredEndActions(definition.fields),
        ...equipment.flatMap((item) => configuredEndActions(item?.fields as { endOfTurnAction?: string; endOfTurnActions?: { repeat?: number; value?: string } })),
      ],
      initiative: Boolean(definition.fields.initiative) || equipment.some((item) => Boolean(item?.fields.initiative)) || member.rareTrait === 'ALERT',
      darknessDamageAmplification: Number(definition.fields.darknessDamageAmplification ?? 0) + itemCombatBonus(member, index, 'darknessDamageAmplification') + doctrineAbilityValue(member, 'SERVUS_UMBRAE') * 0.001 + (member.potionsDrank?.[8] ?? 0) * 0.001 + (member.rareTrait === 'NOCTURNAL' ? 0.005 : 0),
      nightVision: Boolean(definition.fields.nightVision),
      saboteur: Boolean(definition.fields.saboteur),
      stunChanceOnLowerHp: Number(definition.fields.stunChanceOnLowerHp ?? 0),
      poisonBonus: Number(definition.fields.poisonBonus ?? 0) + itemCombatBonus(member, index, 'poisonBonus'),
      onFireBonusDamage: Number(definition.fields.onFireBonusDamage ?? 0) + itemCombatBonus(member, index, 'onFireBonusDamage'),
      freezeBonusDamage: Number(definition.fields.freezeBonusDamage ?? 0) + itemCombatBonus(member, index, 'freezeBonusDamage'),
      regenerationBonus: Number(definition.fields.regenerationBonus ?? 0) + itemCombatBonus(member, index, 'regenerationBonus'),
      healsMinionBound: Boolean(definition.fields.healsMinionBound),
      inspireExaltBonusTurns: itemCombatBonus(member, index, 'exaltInspireBonusTurns'),
      increaseHealingAgainst: configuredHealingTarget(definition.fields.increaseHealingAgainst),
      statusImmunities: definition.statusImmunities ?? [],
      petDecoy: petDecoy * 0.01,
      petBarrier: petBarrier > 0 ? gameRound(petBarrier * 0.1 + 1) : 0,
      petSavage: petSavage * 0.003,
      criticalReduction: doctrineAbilityValue(member, 'NECROSIS_PORPHYRICA') * 0.01,
      armorIgnored: doctrineAbilityValue(member, 'TACTICAL_KNOWLEDGE') * 0.01,
      ignoreStatusImmunity: doctrineAbilityValue(member, 'MIND_BENDER') * 0.01,
      rollsDamageThreeTimes: doctrineAbilityValue(member, 'BEAT_THE_ODDS') > 0,
      extraAttackChance: doctrineAbilityValue(member, 'LIGHTNING_SPEED') * 0.01,
      falseLifeChance: doctrineAbilityValue(member, 'FALSE_LIFE') * 0.01,
      falseLifeDamage: doctrineAbilityValue(member, 'TRUE_AGONY'),
      resurrectionChance: doctrineAbilityValue(member, 'DIVINE_INTERVENTION') * 0.01,
      lifestealOverheal: doctrineAbilityValue(member, 'GENUS_VAMPYRI'),
      damagePerTurnPerStatus: doctrineAbilityValue(member, 'ARCANE_SUPPRESSION'),
      healingNova: doctrineAbilityValue(member, 'HEALING_NOVA'),
      moreDamageWhenHalfLife: doctrineAbilityValue(member, 'EYE_FOR_AN_EYE') > 0,
      moreDamageDealtAndTaken: doctrineAbilityValue(member, 'RAGEBOUND') > 0,
      forcesTargetToCounterattack: doctrineAbilityValue(member, 'RELENTLESS_ASSAULT') > 0,
      addsDefensesToRetaliate: doctrineAbilityValue(member, 'MIRROR_OF_ANGUISH') > 0,
      livingCompanionBonusDamage: itemCombatBonus(member, index, 'livingCompanionBonusDamage'),
    }]
  })
  const enemies = run.enemies.flatMap((enemy): CombatantRef[] => {
    const definition = index.enemies.get(enemy.enemyId)
    if (!definition) return []
    const magic = Boolean(definition.magic)
    const attackStat = magic ? definition.fields.baseIntelligence : definition.fields.baseDexterity
    return [{
      key: `e:${enemy.uid}`,
      side: 'enemy',
      team: Number(definition.fields.team ?? 0),
      definitionId: definition.id,
      state: enemy,
      questState: state,
      name: definition.name,
      maxHp: definition.fields.baseMaxHp,
      constitution: definition.fields.baseConstitution,
      intelligence: definition.fields.baseIntelligence,
      dexterity: definition.fields.baseDexterity,
      defense: definition.fields.baseDefense,
      magicDefense: definition.fields.baseMagicDefense,
      minDamage: definition.minDamage,
      maxDamage: definition.maxDamage,
      manaRegen: definition.id.startsWith('Herald') ? 10 : Math.trunc(definition.fields.baseIntelligence / 10) + 10,
      magic,
      ranged: Boolean(definition.ranged),
      flying: Boolean(definition.fields.flying),
      activeSkill: definition.fields.activeSkill,
      passiveSkill: definition.fields.passiveSkill,
      healer: Boolean(definition.fields.healer),
      cleanser: Boolean(definition.fields.cleanser),
      threat: Math.max(1, Number(definition.fields.threat ?? 1)),
      alwaysHits: Boolean(definition.fields.alwaysHits),
      accuracyBonus: 0,
      flatDodge: Number(definition.fields.flatDodgeChance ?? 0),
      flatDamageReduction: 0,
      statusImmunity: Number(definition.fields.immunityToStatus ?? 0),
      regeneration: Number(definition.fields.regeneration ?? 0),
      criticalChance: definition.fields.passiveSkill === 'PASSIVE_BLIND_RAGE' ? 1 : Math.min(0.4, attackStat * 0.004),
      criticalDamage: Number(definition.fields.criticalDamage ?? 1.5),
      lifesteal: Number(definition.fields.baseLifesteal ?? 0),
      lifestealWithMinion: 0,
      healingModifier: 1,
      maxOverheal: Number(definition.fields.maxOverheal ?? 0),
      counterattack: Number(definition.fields.counterattack ?? 0),
      retaliationPhysical: Number(definition.fields.retaliationPhysicalDamage ?? 0),
      retaliationMagical: Number(definition.fields.retaliationMagicalDamage ?? 0),
      onTargetHitEffects: [
        configuredStatus(definition.fields.onTargetHit),
        ...configuredOnHitStatuses(definition.fields.onHit),
      ].filter(Boolean) as Array<NonNullable<CombatSkillStep['status']>>,
      onSelfHitEffects: [
        configuredStatus(definition.fields.onSelfHit),
        ...(definition.fields.passiveSkill === 'PASSIVE_NEUROTOXICITY' ? configuredOnHitStatuses(definition.fields.onHit) : []),
      ].filter(Boolean) as Array<NonNullable<CombatSkillStep['status']>>,
      onDeathEffectsOnAllies: configuredStatuses(definition.fields.onDeathEffectsOnAllies),
      onDeathEffectsOnEnemies: configuredStatuses(definition.fields.onDeathEffectsOnEnemies),
      endOfTurnActions: configuredEndActions(definition.fields),
      initiative: Boolean(definition.fields.initiative),
      darknessDamageAmplification: Number(definition.fields.darknessDamageAmplification ?? 0),
      nightVision: Boolean(definition.fields.nightVision),
      saboteur: false,
      stunChanceOnLowerHp: Number(definition.fields.stunChanceOnLowerHp ?? 0),
      poisonBonus: Number(definition.fields.poisonBonus ?? 0),
      onFireBonusDamage: Number(definition.fields.onFireBonusDamage ?? 0),
      freezeBonusDamage: Number(definition.fields.freezeBonusDamage ?? 0),
      regenerationBonus: Number(definition.fields.regenerationBonus ?? 0),
      healsMinionBound: Boolean(definition.fields.healsMinionBound),
      inspireExaltBonusTurns: 0,
      increaseHealingAgainst: configuredHealingTarget(definition.fields.increaseHealingAgainst),
      statusImmunities: definition.statusImmunities ?? [],
      petDecoy: 0,
      petBarrier: 0,
      petSavage: 0,
      criticalReduction: 0,
      armorIgnored: 0,
      ignoreStatusImmunity: 0,
      rollsDamageThreeTimes: false,
      extraAttackChance: 0,
      falseLifeChance: 0,
      falseLifeDamage: 0,
      resurrectionChance: 0,
      lifestealOverheal: 0,
      damagePerTurnPerStatus: 0,
      healingNova: 0,
      moreDamageWhenHalfLife: Boolean(definition.fields.moreDamageWhenHalfLife),
      moreDamageDealtAndTaken: Boolean(definition.fields.moreDamageDealtAndTaken),
      forcesTargetToCounterattack: Boolean(definition.fields.forcesTargetToCounterattack),
      addsDefensesToRetaliate: Boolean(definition.fields.addsDefensesToRetaliate),
      livingCompanionBonusDamage: 0,
    }]
  })
  return [...party, ...enemies]
}

function combatDamageAmount(target: CombatantRef, incoming: number, magic: boolean, armorIgnored = 0) {
  const effectiveIncoming = target.passiveSkill === 'PASSIVE_SWARM' ? 1 : incoming
  const exaltReduction = target.state.positiveStatusEffects.filter((effect) => effect.type === 'EXALT').length * 5
  const passiveReduction = target.passiveSkill === 'PASSIVE_BIOENHANCED'
    ? 15
    : target.passiveSkill === 'PASSIVE_BIOENHANCED_II'
      ? 40
      : 0
  const damage = Math.max(
    1,
    applyDamage(
      effectiveIncoming,
      (magic ? target.magicDefense : target.defense) * (1 - armorIgnored),
      target.constitution,
      exaltReduction + passiveReduction + target.flatDamageReduction,
      target.petBarrier,
    ),
  )
  if (target.side === 'party') {
    incrementQuest(target.questState, 'Protector', damage)
    incrementQuest(target.questState, 'HeavyArmor', Math.trunc(Math.max(0, effectiveIncoming - damage)))
  }
  return damage
}

function recordAppliedDamageQuests(actor: CombatantRef, target: CombatantRef, damage: number, questCritical = 1) {
  if (actor.side === 'party') {
    if (questCritical > 1) incrementQuest(actor.questState, 'SmartFighter', damage)
    incrementQuest(actor.questState, 'Annihilator', damage, true)
    if (target.side === 'enemy') incrementQuest(actor.questState, 'Warrior', 1)
  }
  if (target.side === 'party' && damage <= 1) incrementQuest(target.questState, 'Unscathed', 1)
}

function resolveStatuses(target: CombatantRef, run: AreaRun, refs: CombatantRef[], index: ContentIndex) {
  let skipTurn = false
  let silenced = false
  const statuses = [...target.state.positiveStatusEffects, ...target.state.negativeStatusEffects]
  let regeneration = target.regeneration
  let suppressionDamage = 0
  for (const status of statuses) {
    const list = target.state.negativeStatusEffects.includes(status) ? target.state.negativeStatusEffects : target.state.positiveStatusEffects
    const deadTaunter = status.type === 'TAUNT'
      && status.causeKey
      && !refs.some((candidate) => candidate.key === status.causeKey && candidate.state.hp > 0)
    if (status.turnsLeft <= 0 || deadTaunter) {
      list.splice(list.indexOf(status), 1)
      continue
    }
    status.turnsLeft -= 1
    if (status.type === 'STUN' || status.type === 'STUN_NOT_CLEANSABLE' || status.type === 'PETRIFY') {
      skipTurn = true
      appendLog(run, `${target.name} is stunned and cannot act.`)
    } else if (status.type === 'TERRIFY') {
      const damage = combatDamageAmount(target, gameRound(target.maxHp * 0.2 * areaMagicDamageAmplification(run)), true)
      absorbDamage(target.state, damage)
      skipTurn = true
      appendLog(run, `${target.name} suffered ${damage} status damage.`)
    } else if (status.type === 'SILENCE') {
      silenced = true
      appendLog(run, `${target.name} is silenced.`)
    } else if (status.type === 'FROZEN') {
      const damage = combatDamageAmount(target, 10 + (status.potency ?? 0), false)
      absorbDamage(target.state, damage)
      if (target.side === 'enemy') incrementQuest(target.questState, 'SlowBurn', damage)
      appendLog(run, `${target.name} suffered ${damage} status damage.`)
    } else if (status.type === 'ABLAZE') {
      const damage = combatDamageAmount(target, gameRound(target.maxHp * (0.05 + (status.potency ?? 0) * 0.01) * areaMagicDamageAmplification(run)), true)
      absorbDamage(target.state, damage)
      if (target.side === 'enemy') incrementQuest(target.questState, 'SlowBurn', damage)
      appendLog(run, `${target.name} suffered ${damage} status damage.`)
    } else if (status.type === 'REGENERATION') {
      regeneration += Math.max(1, gameRound(target.maxHp * (0.06 + (status.potency ?? 0) * 0.01)))
    } else if (status.type === 'BLEED') {
      const damage = status.turnsLeft + 1
      target.state.hp = Math.max(0, target.state.hp - damage)
      if (target.side === 'enemy') incrementQuest(target.questState, 'SlowBurn', damage)
      appendLog(run, `${target.name} suffered ${damage} status damage.`)
    } else if (status.type === 'FEEBLE_TETHER' && target.state.mana < 100) {
      target.state.hp = 0
      target.state.shield = 0
      appendLog(run, `${target.name} suffered a broken tether.`)
    }
    if (NEGATIVE_STATUS.has(status.type) && status.causeKey) {
      suppressionDamage += refs.find((candidate) => candidate.key === status.causeKey)?.damagePerTurnPerStatus ?? 0
    }
  }
  if (target.side === 'party') {
    const adventurer = target.state as AdventurerState
    const decay = adventurerDecay(adventurer, index, target.maxHp)
    if (decay > 0) {
      incrementQuest(target.questState, 'FallingApart', decay)
      adventurer.hp = Math.max(0, adventurer.hp - decay)
      appendLog(run, `${target.name} lost ${decay} HP to decay.`)
    }
  }
  if (suppressionDamage > 0 && target.state.hp > 0) {
    const damage = combatDamageAmount(target, suppressionDamage * areaMagicDamageAmplification(run), true)
    absorbDamage(target.state, damage)
    appendLog(run, `${target.name} suffered ${damage} arcane suppression damage.`)
  }
  if (regeneration > 0 && target.state.hp > 0 && target.state.hp < target.maxHp) {
    const recovered = Math.min(regeneration, target.maxHp - target.state.hp)
    target.state.hp += recovered
    if (target.side === 'party') incrementQuest(target.questState, 'SoothingRemedy', recovered)
    appendLog(run, `${target.name} recovered ${recovered} health.`)
  }
  return { skipTurn, silenced }
}

const NEGATIVE_STATUS = new Set<StatusEffectType>([
  'TAUNT', 'STUN', 'STUN_NOT_CLEANSABLE', 'SILENCE', 'ABLAZE', 'POISON',
  'LESSER_CURSE', 'CURSE', 'GREATER_CURSE', 'OMINOUS_CURSE', 'ABHORRENT_CURSE',
  'BLEED', 'PETRIFY', 'TERRIFY', 'FROZEN',
])

function applyCombatStatus(target: CombatantRef, status: NonNullable<CombatSkillStep['status']>, cause: CombatantRef) {
  if (target.passiveSkill === 'PASSIVE_BEND_REALITY') {
    if (['TAUNT', 'LESSER_CURSE', 'CURSE', 'GREATER_CURSE', 'OMINOUS_CURSE', 'ABHORRENT_CURSE'].includes(status.type)) return false
    if (target.key === cause.key) return false
    return applyCombatStatus(cause, status, cause)
  }
  const probability = status.probability ?? 1
  const ignoresImmunity = Math.random() < cause.ignoreStatusImmunity
  if ((!ignoresImmunity && target.statusImmunities.includes(status.type)) || Math.random() > probability) return false
  if (!ignoresImmunity && NEGATIVE_STATUS.has(status.type) && Math.random() < target.statusImmunity) {
    if (target.side === 'party') incrementQuest(target.questState, 'CrystalClear', 1)
    return false
  }
  if (target.side === 'enemy' && status.type === 'STUN') incrementQuest(target.questState, 'Shocking', 1)
  if (target.side === 'enemy' && status.type === 'ABLAZE') incrementQuest(target.questState, 'SmokingHot', 1)
  const potency = status.type === 'POISON'
    ? cause.poisonBonus
    : status.type === 'ABLAZE'
      ? cause.onFireBonusDamage
      : status.type === 'FROZEN'
        ? cause.freezeBonusDamage
        : status.type === 'REGENERATION'
          ? cause.regenerationBonus
          : undefined
  addStatus(target.state, {
    type: status.type,
    turnsLeft: status.turnsLeft,
    potency,
  }, cause.key)
  return true
}

function applyEnvironmentalStatus(target: CombatantRef, status: NonNullable<CombatSkillStep['status']>) {
  const probability = status.probability ?? 1
  if (target.statusImmunities.includes(status.type) || Math.random() > probability) return false
  if (NEGATIVE_STATUS.has(status.type) && Math.random() < target.statusImmunity) return false
  addStatus(target.state, { type: status.type, turnsLeft: status.turnsLeft })
  return true
}

function weightedRandom(candidates: CombatantRef[]) {
  if (!candidates.length) return undefined
  const total = candidates.reduce((sum, candidate) => sum + candidate.threat, 0)
  if (total <= 0) return candidates[Math.floor(Math.random() * candidates.length)]
  let roll = Math.random() * total
  for (const candidate of candidates) {
    roll -= candidate.threat
    if (roll < 0) return candidate
  }
  return candidates[candidates.length - 1]
}

function randomEnemy(actor: CombatantRef, refs: CombatantRef[], candidates = refs.filter((candidate) => candidate.side !== actor.side)) {
  const taunt = actor.state.negativeStatusEffects.find((effect) => effect.type === 'TAUNT' && effect.causeKey)
  const taunter = taunt && refs.find((candidate) => candidate.key === taunt.causeKey && candidate.state.hp > 0)
  if (taunter && candidates.includes(taunter)) return taunter
  if (taunt && (!taunter || !candidates.includes(taunter))) {
    actor.state.negativeStatusEffects.splice(actor.state.negativeStatusEffects.indexOf(taunt), 1)
  }
  const alive = candidates.filter((candidate) => candidate.state.hp > 0)
  const decoy = actor.side === 'enemy' ? (alive.find((candidate) => candidate.side === 'party')?.petDecoy ?? 0) : 0
  if (decoy > 0 && Math.random() < decoy / (alive.length + decoy)) return undefined
  return weightedRandom(alive)
}

function selectTargets(actor: CombatantRef, refs: CombatantRef[], mode: TargetMode = 'randomEnemy', count = 1) {
  const allies = refs.filter((candidate) => candidate.side === actor.side)
  const enemies = refs.filter((candidate) => candidate.side !== actor.side)
  const randomEnemies = actor.side === 'enemy' && actor.team !== 0
    ? [...enemies, ...refs.filter((candidate) => candidate.side === 'enemy' && candidate.team !== actor.team)]
    : enemies
  const alive = (list: CombatantRef[]) => list.filter((candidate) => candidate.state.hp > 0)
  const random = (list: CombatantRef[]) => list[Math.floor(Math.random() * list.length)]
  const lowestAbsolute = (list: CombatantRef[]) => [...alive(list)].sort((left, right) => left.state.hp - right.state.hp)[0]
  const lowestRelative = (list: CombatantRef[]) => [...alive(list)].sort((left, right) => left.state.hp / left.maxHp - right.state.hp / right.maxHp)[0]
  if (mode === 'allEnemies') return alive(enemies)
  if (mode === 'allAllies') return allies
  if (mode === 'allExceptSelf') return alive(refs.filter((candidate) => candidate.key !== actor.key))
  if (mode === 'all') return alive(refs)
  if (mode === 'lowestAbsoluteEnemy') return [lowestAbsolute(enemies)].filter(Boolean) as CombatantRef[]
  if (mode === 'lowestRelativeEnemy') return [lowestRelative(enemies)].filter(Boolean) as CombatantRef[]
  if (mode === 'lowestAbsoluteAlly') return [lowestAbsolute(allies)].filter(Boolean) as CombatantRef[]
  if (mode === 'lowestRelativeAlly') return [lowestRelative(allies)].filter(Boolean) as CombatantRef[]
  if (mode === 'lowestShieldAlly') return [
    [...alive(allies)].sort((left, right) => left.state.shield / left.maxHp - right.state.shield / right.maxHp)[0],
  ].filter(Boolean) as CombatantRef[]
  if (mode === 'mostConditionsOrLowestRelativeAlly') return [
    [...alive(allies)].sort((left, right) => right.state.negativeStatusEffects.length - left.state.negativeStatusEffects.length
      || left.state.hp / left.maxHp - right.state.hp / right.maxHp)[0],
  ].filter(Boolean) as CombatantRef[]
  if (mode === 'randomAlly') return [random(alive(allies))].filter(Boolean) as CombatantRef[]
  if (mode === 'randomAllyExceptSelf') return [random(alive(allies.filter((candidate) => candidate.key !== actor.key)))].filter(Boolean) as CombatantRef[]
  if (mode === 'randomExceptSelf') return [random(alive(refs.filter((candidate) => candidate.key !== actor.key)))].filter(Boolean) as CombatantRef[]
  return Array.from({ length: count }, () => randomEnemy(actor, refs, randomEnemies)).filter(Boolean) as CombatantRef[]
}

function combatHitProbability(actor: CombatantRef, target: CombatantRef, darkness: number) {
  const attackStat = actor.magic ? actor.intelligence : actor.dexterity
  const defenseStat = actor.magic ? target.intelligence : target.dexterity
  let probability = attackStat / (defenseStat / 5 + attackStat)
  if (darkness > 0 && !(actor.side === 'enemy' && target.side === 'enemy')) {
    const visionTarget = actor.side === 'enemy'
      ? (target.nightVision ? 0 : 1)
      : (actor.nightVision ? 1 : 0)
    probability -= darkness * 0.01 * (probability - visionTarget)
  }
  return Math.max(0.1, probability + actor.accuracyBonus - target.flatDodge)
}

function petAbilityStrength(pet: PetState | undefined, ability: PetAbilityType) {
  if (!pet) return 0
  const slot = pet.abilities.indexOf(ability)
  return slot < 0 ? 0 : Math.max(0, pet.level - slot * 20)
}

function calculateRoomDarkness(state: GameState, run: AreaRun, index: ContentIndex) {
  const pet = state.pets.find((entry) => entry.uid === run.petUid)
  const brightness = livingParty(state, run).reduce((total, member) => {
    const definition = index.adventurers.get(member.classId)
    return total
      + Number(definition?.fields.darknessReduction ?? 0)
      + itemCombatBonus(member, index, 'darknessReduction')
      + (member.rareTrait === 'BLESSED' ? 8 : 0)
  }, 0) + (petAbilityStrength(pet, 'BRIGHT') > 0 ? gameRound(petAbilityStrength(pet, 'BRIGHT') * 0.5 + 1) : 0)
  const configured = index.areas.get(run.areaId)?.darkness ?? 0
  incrementQuest(state, 'LightBringer', brightness, true)
  const base = run.areaId === 'FrostbitePeaks' && run.event?.kind === 'BLIZZARD'
    ? Math.trunc(Math.random() * 20) + 40
    : run.areaId === 'ObsidianMines'
      ? 10 + (run.event?.kind === 'UNSPEAKABLE_HORROR' ? Math.min(70, run.event.progress) : 0)
    : typeof configured === 'number'
    ? configured
    : configured.runtimeFormula === 'progressOffset'
      ? run.progress + (configured.offset ?? 0)
      : run.progress === configured.progress
        ? configured.whenTrue ?? 0
        : configured.whenFalse ?? 0
  return Math.max(0, base - brightness)
}

function localDarkness(_state: GameState, run: AreaRun, _index: ContentIndex) {
  return run.localDarkness
}

function areaMagicDamageAmplification(run: AreaRun) {
  return run.areaId === 'HiddenCityOfLarox' && run.event?.kind === 'MAGIC_AMPLIFICATION'
    ? laroxMagicAmplification(run.event.progress)
    : 1
}

const CURSE_MINIONS: Array<{ type: StatusEffectType; classId: string; weaponId: string; armorId: string | null }> = [
  { type: 'ABHORRENT_CURSE', classId: 'BoneHydra', weaponId: 'SerpentJaws', armorId: 'SpikedSkeleton' },
  { type: 'OMINOUS_CURSE', classId: 'BoneNightmare', weaponId: 'SerpentJaws', armorId: null },
  { type: 'GREATER_CURSE', classId: 'BoneHorror', weaponId: 'DecomposedLimb', armorId: null },
  { type: 'CURSE', classId: 'Skeleton', weaponId: 'DecomposedLimb', armorId: null },
  { type: 'LESSER_CURSE', classId: 'Zombie', weaponId: 'DecomposedLimb', armorId: null },
]

function reanimateEnemy(target: CombatantRef, refs: CombatantRef[], run: AreaRun, index: ContentIndex) {
  const curse = CURSE_MINIONS
    .map((entry) => ({ entry, status: target.state.negativeStatusEffects.find((status) => status.type === entry.type) }))
    .find(({ status }) => Boolean(status?.causeKey))
  const summoner = curse?.status?.causeKey
    ? refs.find((candidate) => candidate.key === curse.status?.causeKey && candidate.side === 'party' && candidate.state.hp > 0)
    : undefined
  const definition = curse && index.adventurers.get(curse.entry.classId)
  if (!curse || !summoner || !definition) return

  for (const oldSummon of run.summons) {
    oldSummon.hp = 0
    oldSummon.shield = 0
    run.turnOrder = run.turnOrder.filter((key) => key !== `a:${oldSummon.uid}`)
  }
  run.summons = []
  const uid = Math.min(-1, ...refs.filter((candidate) => candidate.side === 'party').map((candidate) => Number(candidate.key.slice(2)))) - 1
  const minion = makeAdventurer(definition, uid, () => 0)
  minion.name = definition.name
  minion.trait = null
  minion.areaId = run.areaId
  minion.summonerUid = Number(summoner.key.slice(2))
  minion.weaponId = curse.entry.weaponId
  minion.armorId = curse.entry.armorId
  const summonerState = summoner.state as AdventurerState
  minion.accessoryId = summonerState.weaponId === 'WickedScepter'
    ? 'EyeOfUr'
    : summonerState.weaponId === 'CursedScepter'
      ? 'AncientEye'
      : null
  minion.hp = adventurerStats(minion, index).maxHp
  if (summonerState.accessoryId === 'SkeletonKey') {
    addStatus(minion, { type: 'SKELETON_KEY', turnsLeft: 999 }, summoner.key)
  }
  run.summons.push(minion)
  const summonerIndex = run.turnOrder.indexOf(summoner.key)
  run.turnOrder.splice(summonerIndex >= 0 ? summonerIndex + 1 : run.turnOrder.length, 0, `a:${minion.uid}`)
  appendLog(run, `${summoner.name} reanimated ${target.name} as ${minion.name}.`)
}

function resolveCombatDeath(target: CombatantRef, refs: CombatantRef[], run: AreaRun, index: ContentIndex) {
  if (target.state.hp > 0) return false
  if (target.side === 'enemy' && target.passiveSkill === 'PASSIVE_ABSURD_GENEALOGY' && Math.random() < 0.65) {
    target.state.hp = target.maxHp
    target.state.mana = 100
    target.state.negativeStatusEffects = []
    appendLog(run, `${target.name} returned to life.`)
    return true
  }

  const hadTether = hasStatus(target.state, 'FEEBLE_TETHER')
  if (target.side === 'party') {
    const state = target.state as AdventurerState
    if (state.summonerUid !== undefined) {
      run.summons = run.summons.filter((summon) => summon.uid !== state.uid)
      run.turnOrder = run.turnOrder.filter((key) => key !== target.key)
      return false
    }
    incrementQuest(target.questState, 'TheEnd', 1)
    if (state.accessoryId === 'AmuletOfResurrection' && Math.random() < 0.4) {
      state.hp = target.maxHp
      state.negativeStatusEffects = []
      state.positiveStatusEffects = state.positiveStatusEffects.filter((effect) => effect.type !== 'FEEBLE_TETHER')
      appendLog(run, `${target.name} was resurrected by the Amulet of Resurrection.`)
      return true
    }
    if (index.areas.get(run.areaId)?.areaType === 0 && state.xp > 0) {
      const lost = Math.ceil(state.xp * 0.2)
      state.xp -= lost
      run.report.xpLost += lost
      appendLog(run, `${target.name} lost ${lost} experience.`)
    }
    const ownerUid = Number(target.key.slice(2))
    const bound = run.summons.filter((summon) => summon.summonerUid === ownerUid)
    if (bound.length) {
      const boundIds = new Set(bound.map((summon) => `a:${summon.uid}`))
      run.summons = run.summons.filter((summon) => summon.summonerUid !== ownerUid)
      run.turnOrder = run.turnOrder.filter((key) => !boundIds.has(key))
    }
    target.state.positiveStatusEffects = []
    target.state.negativeStatusEffects = []
    target.state.shield = 0
    if (target.definitionId === 'EldritchAlchemist' && !hadTether) {
      target.state.hp = target.maxHp
      target.state.mana = 100
      addStatus(target.state, { type: 'FEEBLE_TETHER', turnsLeft: 999 }, target.key)
      appendLog(run, `${target.name} returned with a feeble tether.`)
    }
  }
  if (hadTether) return false
  if (target.side === 'enemy') {
    run.report.enemiesKilled[target.definitionId] = (run.report.enemiesKilled[target.definitionId] ?? 0) + 1
    if (run.areaId === 'EnchantedForest') {
      const result = killEnchantedForestEnemy(run.event, target.definitionId)
      run.event = result.event
      result.logs.forEach((log) => appendLog(run, log))
    } else if (run.areaId === 'EternalBattlefield') {
      const result = killEternalBattlefieldEnemy(run.event, target.definitionId)
      run.event = result.event
      result.logs.forEach((log) => appendLog(run, log))
    } else if (run.areaId === 'TheDesert') {
      const result = killTheDesertEnemy(run.event, target.definitionId)
      run.event = result.event
      result.logs.forEach((log) => appendLog(run, log))
    } else if (run.areaId === 'CelestialMothership') {
      const result = killCelestialMothershipEnemy(target.definitionId, run.enemies)
      result.logs.forEach((log) => appendLog(run, log))
    } else if (run.areaId === 'AncientGraveDigging') {
      const result = killAncientGraveDiggingEnemy(target.definitionId, run.enemies)
      result.logs.forEach((log) => appendLog(run, log))
    }
    reanimateEnemy(target, refs, run, index)
    const nova = refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)
      .reduce((sum, candidate) => sum + candidate.healingNova * candidate.healingModifier, 0)
    if (nova > 0) {
      refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0).forEach((candidate) => {
        const amount = gameRound(0.01 * nova * (candidate.maxHp - candidate.state.hp))
        candidate.state.hp = Math.min(candidate.maxHp, candidate.state.hp + amount)
      })
      appendLog(run, `Healing nova restored the party (${Math.trunc(nova)}%).`)
    }
  }

  const allies = refs.filter((candidate) => candidate.side === target.side && candidate.state.hp > 0)
  const enemies = refs.filter((candidate) => candidate.side !== target.side && candidate.state.hp > 0)
  for (const effect of target.onDeathEffectsOnAllies) {
    for (const ally of allies) applyCombatStatus(ally, effect, target)
  }
  for (const effect of target.onDeathEffectsOnEnemies) {
    for (const enemy of enemies) applyCombatStatus(enemy, effect, target)
  }
  if (target.onDeathEffectsOnAllies.length || target.onDeathEffectsOnEnemies.length) {
    appendLog(run, `${target.name}'s final effects spread across the battlefield.`)
  }
  return target.state.hp > 0
}

function triggerBasicOnHit(actor: CombatantRef, target: CombatantRef) {
  for (const effect of actor.onTargetHitEffects) applyCombatStatus(target, effect, actor)
  if (actor.passiveSkill === 'PASSIVE_ELEMENTAL_CONTROL' || actor.passiveSkill === 'PASSIVE_ELEMENTAL_MASTERY') {
    const roll = Math.random()
    const type: StatusEffectType = roll > 2 / 3 ? 'FROZEN' : roll > 1 / 3 ? 'STUN' : 'ABLAZE'
    applyCombatStatus(target, {
      type,
      turnsLeft: actor.passiveSkill === 'PASSIVE_ELEMENTAL_MASTERY' ? 4 : 2,
    }, actor)
  }
  if (target.state.hp < actor.state.hp && actor.stunChanceOnLowerHp > 0) {
    applyCombatStatus(target, { type: 'STUN', turnsLeft: 1, probability: actor.stunChanceOnLowerHp }, actor)
  }
}

function applyCombatLifesteal(actor: CombatantRef, refs: CombatantRef[], damage: number, run: AreaRun) {
  if (actor.state.hp <= 0) return
  const minion = actor.side === 'party'
    ? refs.find((candidate) => candidate.side === 'party'
      && (candidate.state as AdventurerState).summonerUid === Number(actor.key.slice(2)))
    : undefined
  const lifesteal = actor.lifesteal + (minion ? actor.lifestealWithMinion : 0)
  if (lifesteal <= 0) return
  const recovered = gameRound(damage * lifesteal * 0.01)
  const before = actor.state.hp
  actor.state.hp = Math.min(actor.maxHp, actor.state.hp + recovered)
  const restored = actor.state.hp - before
  if (restored > 0) {
    if (actor.side === 'party') incrementQuest(actor.questState, 'VampiricThirst', restored)
    appendLog(run, `${actor.name} restored ${restored} health through lifesteal.`)
  }
  const excess = Math.max(0, recovered - (actor.maxHp - before))
  if (excess > 0 && actor.lifestealOverheal > 0) {
    actor.state.shield = Math.max(actor.state.shield, Math.min(actor.state.shield + excess, gameRound(actor.maxHp * actor.lifestealOverheal * 0.01)))
  }
  if (actor.healsMinionBound && minion?.state.hp) minion.state.hp = Math.min(minion.maxHp, minion.state.hp + recovered)
}

function dealCombatDamage(actor: CombatantRef, target: CombatantRef, skillStep: CombatSkillStep, refs: CombatantRef[], run: AreaRun, index: ContentIndex, darkness: number, triggersOnHit = false, reactionDepth = 0) {
  if (skillStep.status?.applyOnDodge) applyCombatStatus(target, skillStep.status, actor)
  const ranged = skillStep.forceRanged ?? actor.ranged
  const cannotReachFlying = !ranged && !actor.flying && target.flying
  const alwaysHits = actor.alwaysHits || hasStatus(target.state, 'FROZEN')
  if (cannotReachFlying || (!alwaysHits && Math.random() > combatHitProbability(actor, target, darkness))) {
    if (target.side === 'party') incrementQuest(target.questState, 'HitOrMiss', 1)
    appendLog(run, `${actor.name} missed ${target.name}.`)
    return { hit: false, killed: false, damage: 0 }
  }
  const defensiveStatus = target.state.positiveStatusEffects.find((effect) => effect.type === 'DEFENSIVE_STANCE' || effect.type === 'FALSE_LIFE')
  if (defensiveStatus) {
    target.state.positiveStatusEffects = target.state.positiveStatusEffects.filter((effect) => effect !== defensiveStatus)
    appendLog(run, `${target.name} blocked ${actor.name}'s attack.`)
    if (defensiveStatus.type === 'FALSE_LIFE' && !ranged && target.falseLifeDamage > 0 && actor.state.hp > 0) {
      if (target.side === 'party') incrementQuest(target.questState, 'ActiveDeterrent', 1)
      const reflected = combatDamageAmount(actor, target.falseLifeDamage * areaMagicDamageAmplification(run), true, target.armorIgnored)
      absorbDamage(actor.state, reflected)
      appendLog(run, `${target.name}'s false life dealt ${reflected} damage to ${actor.name}.`)
      resolveCombatDeath(actor, refs, run, index)
    }
    return { hit: true, killed: false, damage: 0 }
  }
  let critical = Math.random() < actor.criticalChance
    ? actor.criticalDamage * (skillStep.criticalAmplification ?? 1)
    : 1
  if (critical > 1 && target.criticalReduction > 0) critical -= (critical - 1) * target.criticalReduction
  const questCritical = critical
  if (actor.side === 'party' && questCritical > 1) {
    incrementQuest(actor.questState, 'CriticalHit', 1)
    if (questCritical >= 2.5) incrementQuest(actor.questState, 'Pulverization', 1)
  }
  if (critical > 1 && actor.side === 'party' && actor.petSavage > 0 && Math.random() < actor.petSavage) critical *= critical
  const poison = actor.state.negativeStatusEffects.find((effect) => effect.type === 'POISON')
  const poisonPenalty = poison ? Math.max(0, 1 - (0.2 + (poison.potency ?? 0) * 0.01)) : 1
  const skillDarknessAmplification = skillStep.darknessDamageScale
    ? (1 + darkness * 0.01) * skillStep.darknessDamageScale
    : 1
  const darknessAmplification = (1 + actor.darknessDamageAmplification * darkness) * skillDarknessAmplification
  const positiveStatusAmplification = actor.state.positiveStatusEffects.reduce((value, effect) => {
    if (effect.type === 'DELIRIUM' || effect.type === 'SKELETON_KEY') return value * 2
    if (effect.type === 'FRENZY') return value * 1.3
    if (effect.type === 'ANOINTED' || effect.type === 'INSPIRE' || effect.type === 'EXALT') return value * 1.25
    return value
  }, 1)
  const petrifyAmplification = hasStatus(target.state, 'PETRIFY') ? 1.1 : 1
  const damageRoll = actor.rollsDamageThreeTimes
    ? Math.max(rollBetween(actor.minDamage, actor.maxDamage), rollBetween(actor.minDamage, actor.maxDamage), rollBetween(actor.minDamage, actor.maxDamage))
    : rollBetween(actor.minDamage, actor.maxDamage)
  if (actor.side === 'party' && damageRoll > actor.maxDamage - 1) {
    incrementQuest(actor.questState, 'LuckyRoll', 1)
    appendLog(run, `${actor.name} rolled maximum damage.`)
  }
  const doctrineDamage = (actor.moreDamageWhenHalfLife && actor.state.hp <= actor.maxHp * 0.5 ? 1.5 : 1)
    * (actor.moreDamageDealtAndTaken ? 1.35 : 1)
    * (target.moreDamageDealtAndTaken ? 1.35 : 1)
  const incomingDamage = damageRoll * critical * doctrineDamage * (skillStep.damageAmplification ?? 1) * darknessAmplification * poisonPenalty * positiveStatusAmplification * petrifyAmplification * (actor.magic ? areaMagicDamageAmplification(run) : 1)
  const calculatedDamage = combatDamageAmount(target, incomingDamage, actor.magic, actor.armorIgnored)
  const damage = calculatedDamage
  if (target.side === 'party') {
    const mitigated = Math.max(0, gameRound(incomingDamage) - damage)
    if (mitigated > 0) appendLog(run, `${target.name} mitigated ${mitigated} damage.`)
  }
  recordAppliedDamageQuests(actor, target, damage, questCritical)
  absorbDamage(target.state, damage)
  if (skillStep.executionThreshold && target.state.hp / target.maxHp < skillStep.executionThreshold) target.state.hp = 0
  if (skillStep.status && !skillStep.status.applyOnDodge) {
    const effect = { ...skillStep.status }
    if (effect.turnsFromDamageDivisor) effect.turnsLeft = Math.trunc(damage / effect.turnsFromDamageDivisor + 0.0001)
    applyCombatStatus(target, effect, actor)
  }
  if (triggersOnHit) {
    triggerBasicOnHit(actor, target)
  }
  applyCombatLifesteal(actor, refs, damage, run)
  appendLog(run, `${actor.name} dealt ${damage}${critical > 1 ? ' critical' : ''} damage to ${target.name}.`)
  resolveCombatDeath(target, refs, run, index)
  if (!ranged && target.state.hp > 0 && actor.state.hp > 0 && reactionDepth < 4) {
    let retaliation = 0
    const retaliationPhysical = target.retaliationPhysical + (target.addsDefensesToRetaliate ? target.defense : 0)
    const retaliationMagical = target.retaliationMagical + (target.addsDefensesToRetaliate ? target.magicDefense : 0)
    if (retaliationPhysical > 0) {
      const dealt = combatDamageAmount(actor, retaliationPhysical, false, target.armorIgnored)
      absorbDamage(actor.state, dealt)
      if (target.side === 'party') incrementQuest(target.questState, 'Spiky', dealt)
      retaliation += dealt
    }
    if (retaliationMagical > 0) {
      const dealt = combatDamageAmount(actor, retaliationMagical * areaMagicDamageAmplification(run), true, target.armorIgnored)
      absorbDamage(actor.state, dealt)
      if (target.side === 'party') incrementQuest(target.questState, 'Spiky', dealt)
      retaliation += dealt
    }
    if (retaliation > 0) appendLog(run, `${target.name} retaliated for ${retaliation} damage against ${actor.name}.`)
    if (actor.state.hp <= 0) resolveCombatDeath(actor, refs, run, index)
    for (const effect of target.onSelfHitEffects) {
      if (NEGATIVE_STATUS.has(effect.type)) applyCombatStatus(actor, effect, target)
    }
    if (actor.state.hp > 0 && (actor.forcesTargetToCounterattack || Math.random() < target.counterattack)) {
      if (target.side === 'party') incrementQuest(target.questState, 'ExpertDuelist', 1)
      appendLog(run, `${target.name} counterattacked ${actor.name}.`)
      dealCombatDamage(target, actor, {}, refs, run, index, darkness, true, reactionDepth + 1)
    }
  }
  for (const effect of target.onSelfHitEffects) {
    if (!NEGATIVE_STATUS.has(effect.type)) applyCombatStatus(target, effect, target)
  }
  return { hit: true, killed: target.state.hp <= 0, damage }
}

function healCombatTarget(actor: CombatantRef, target: CombatantRef, skillStep: CombatSkillStep, run: AreaRun) {
  const wasDead = target.state.hp <= 0
  if (wasDead && Math.random() < ((skillStep.reviveProbability ?? 0) + actor.resurrectionChance)) {
    target.state.hp = 1
    if (actor.side === 'party') incrementQuest(actor.questState, 'Miracle', 1)
    appendLog(run, `${actor.name} resurrected ${target.name}.`)
  }
  if (target.state.hp <= 0) return
  let critical = Math.random() < actor.criticalChance
    ? actor.criticalDamage * (skillStep.criticalAmplification ?? 1)
    : 1
  if (actor.side === 'party' && critical > 1) {
    incrementQuest(actor.questState, 'CriticalHit', 1)
    if (critical >= 2.5) incrementQuest(actor.questState, 'Pulverization', 1)
  }
  const healingRoll = actor.rollsDamageThreeTimes
    ? Math.max(rollBetween(actor.minDamage, actor.maxDamage), rollBetween(actor.minDamage, actor.maxDamage), rollBetween(actor.minDamage, actor.maxDamage))
    : rollBetween(actor.minDamage, actor.maxDamage)
  if (actor.side === 'party' && healingRoll > actor.maxDamage - 1) {
    incrementQuest(actor.questState, 'LuckyRoll', 1)
    appendLog(run, `${actor.name} rolled maximum damage.`)
  }
  const poison = actor.state.negativeStatusEffects.find((effect) => effect.type === 'POISON')
  const poisonPenalty = poison ? Math.max(0, 1 - (0.2 + (poison.potency ?? 0) * 0.01)) : 1
  const amount = Math.max(1, gameRound(
    healingRoll
      * poisonPenalty
      * critical
      * actor.healingModifier
      * (actor.increaseHealingAgainst?.key === target.definitionId ? actor.increaseHealingAgainst.value : 1)
      * (skillStep.damageAmplification ?? 1)
      * 0.5
  ))
  const before = target.state.hp
  target.state.hp = Math.min(target.maxHp, target.state.hp + amount)
  const restored = target.state.hp - before
  if (actor.side === 'party' && restored > 0) incrementQuest(actor.questState, 'Medic', restored)
  const excess = Math.max(0, amount - (target.maxHp - before))
  if (actor.maxOverheal > 0 && excess > 0) {
    target.state.shield = Math.max(target.state.shield, Math.min(target.state.shield + excess, gameRound(target.maxHp * actor.maxOverheal * 0.01)))
  }
  if (actor.cleanser && target.state.negativeStatusEffects.length) {
    if (actor.definitionId === 'ChiefScientistAva') target.state.negativeStatusEffects = []
    else {
      const longest = [...target.state.negativeStatusEffects].sort((left, right) => right.turnsLeft - left.turnsLeft)[0]
      target.state.negativeStatusEffects = target.state.negativeStatusEffects.filter((effect) => effect !== longest)
    }
  }
  for (const effect of actor.onTargetHitEffects) applyCombatStatus(target, effect, actor)
  if (skillStep.status) applyCombatStatus(target, skillStep.status, actor)
  appendLog(run, `${actor.name} healed ${target.name} for ${amount}.`)
}

const SHIELD_END_ACTIONS: Record<string, { amount: number; type: StatusEffectType; turns: number }> = {
  SHIELD_INSPIRE_I: { amount: 30, type: 'INSPIRE', turns: 1 },
  SHIELD_INSPIRE_II: { amount: 30, type: 'INSPIRE', turns: 3 },
  SHIELD_INSPIRE_III: { amount: 75, type: 'INSPIRE', turns: 3 },
  SHIELD_EXALT_I: { amount: 75, type: 'EXALT', turns: 3 },
  SHIELD_EXALT_II: { amount: 75, type: 'EXALT', turns: 5 },
}

interface FlatEndAction {
  damage: number
  magic?: boolean
  forceRanged?: boolean
  procsOnMelee?: boolean
  status?: NonNullable<CombatSkillStep['status']>
  replicatesBasicAttack?: boolean
  triggersRetaliation?: boolean
  fromLivingCompanion?: boolean
  damageFromHp?: boolean
}

const FLAT_END_ACTIONS: Record<string, FlatEndAction> = {
  RIDER_I: { damage: 25, forceRanged: false, triggersRetaliation: true, fromLivingCompanion: true },
  RIDER_II: { damage: 40, forceRanged: false, triggersRetaliation: true, fromLivingCompanion: true },
  RIDER_III: { damage: 55, forceRanged: false, triggersRetaliation: true, fromLivingCompanion: true },
  RIDER_IV: { damage: 55, forceRanged: true, fromLivingCompanion: true },
  RIDER_V: { damage: 70, forceRanged: true, fromLivingCompanion: true },
  RIDER_VI: { damage: 85, forceRanged: true, fromLivingCompanion: true },
  RIDER_VII: { damage: 100, forceRanged: true, fromLivingCompanion: true },
  BLEED_POKE: { damage: 1, procsOnMelee: true, status: { type: 'BLEED', turnsLeft: 8 } },
  BLEED_POKE_II: { damage: 1, procsOnMelee: true, status: { type: 'BLEED', turnsLeft: 20 } },
  STUN_FLAT: { damage: 50, forceRanged: true, status: { type: 'STUN', turnsLeft: 1, probability: 0.1 } },
  STUN_FLAT_II: { damage: 100, forceRanged: true, status: { type: 'STUN', turnsLeft: 1, probability: 0.11 } },
  EXTRA_ATTACK_1: { damage: 1, replicatesBasicAttack: true, triggersRetaliation: true },
  EXTRA_ATTACK_90: { damage: 90, replicatesBasicAttack: true, triggersRetaliation: true },
  EXTRA_ATTACK_140_MAGIC: { damage: 140, magic: true, forceRanged: true, fromLivingCompanion: true },
  EXTRA_ATTACK_200_MAGIC: { damage: 180, magic: true, forceRanged: true, fromLivingCompanion: true },
  EXTRA_ATTACK_HP_TO_DAMAGE: { damage: 0, magic: false, forceRanged: true, fromLivingCompanion: true, damageFromHp: true },
}

function endActionDamage(actor: CombatantRef, target: CombatantRef, action: FlatEndAction, refs: CombatantRef[], run: AreaRun, index: ContentIndex) {
  const ranged = action.forceRanged ?? actor.ranged
  const cannotReachFlying = !ranged && !actor.flying && target.flying
  const alwaysHits = actor.alwaysHits || hasStatus(target.state, 'FROZEN')
  if (cannotReachFlying || (!alwaysHits && Math.random() > combatHitProbability(actor, target, run.localDarkness))) {
    if (target.side === 'party') incrementQuest(target.questState, 'HitOrMiss', 1)
    appendLog(run, `${actor.name} missed ${target.name}.`)
    return
  }
  const defensiveStatus = target.state.positiveStatusEffects.find((effect) => effect.type === 'DEFENSIVE_STANCE' || effect.type === 'FALSE_LIFE')
  if (defensiveStatus) {
    target.state.positiveStatusEffects = target.state.positiveStatusEffects.filter((effect) => effect !== defensiveStatus)
    appendLog(run, `${target.name} blocked ${actor.name}'s attack.`)
    if (defensiveStatus.type === 'FALSE_LIFE' && !ranged && target.falseLifeDamage > 0 && actor.state.hp > 0) {
      if (target.side === 'party') incrementQuest(target.questState, 'ActiveDeterrent', 1)
      const reflected = combatDamageAmount(actor, target.falseLifeDamage * areaMagicDamageAmplification(run), true, target.armorIgnored)
      absorbDamage(actor.state, reflected)
      appendLog(run, `${target.name}'s false life dealt ${reflected} damage to ${actor.name}.`)
      resolveCombatDeath(actor, refs, run, index)
    }
    return
  }
  const baseDamage = action.damageFromHp ? actor.state.hp : action.damage
  const livingCompanionMultiplier = action.fromLivingCompanion
    ? 1 + actor.livingCompanionBonusDamage * 0.01
    : 1
  const doctrineDamage = (actor.moreDamageWhenHalfLife && actor.state.hp <= actor.maxHp * 0.5 ? 1.5 : 1)
    * (actor.moreDamageDealtAndTaken ? 1.35 : 1)
    * (target.moreDamageDealtAndTaken ? 1.35 : 1)
  const positiveStatusAmplification = actor.state.positiveStatusEffects.reduce((value, effect) => {
    if (effect.type === 'DELIRIUM' || effect.type === 'SKELETON_KEY') return value * 2
    if (effect.type === 'FRENZY') return value * 1.3
    if (effect.type === 'ANOINTED' || effect.type === 'INSPIRE' || effect.type === 'EXALT') return value * 1.25
    return value
  }, 1)
  const petrifyAmplification = hasStatus(target.state, 'PETRIFY') ? 1.1 : 1
  const rawDamage = baseDamage
    * livingCompanionMultiplier
    * doctrineDamage
    * positiveStatusAmplification
    * petrifyAmplification
    * (action.magic ? areaMagicDamageAmplification(run) : 1)
  const damage = combatDamageAmount(target, rawDamage, Boolean(action.magic), actor.armorIgnored)
  recordAppliedDamageQuests(actor, target, damage)
  absorbDamage(target.state, damage)
  if (action.status) applyCombatStatus(target, action.status, actor)
  triggerBasicOnHit(actor, target)
  applyCombatLifesteal(actor, refs, damage, run)
  appendLog(run, `${actor.name} dealt ${damage} damage to ${target.name}.`)
  resolveCombatDeath(target, refs, run, index)
  if (action.triggersRetaliation && !ranged && target.state.hp > 0 && actor.state.hp > 0) {
    let retaliation = 0
    if (target.retaliationPhysical > 0) {
      const dealt = combatDamageAmount(actor, target.retaliationPhysical + (target.addsDefensesToRetaliate ? target.defense : 0), false, target.armorIgnored)
      absorbDamage(actor.state, dealt)
      if (target.side === 'party') incrementQuest(target.questState, 'Spiky', dealt)
      retaliation += dealt
    }
    if (target.retaliationMagical > 0) {
      const dealt = combatDamageAmount(actor, (target.retaliationMagical + (target.addsDefensesToRetaliate ? target.magicDefense : 0)) * areaMagicDamageAmplification(run), true, target.armorIgnored)
      absorbDamage(actor.state, dealt)
      if (target.side === 'party') incrementQuest(target.questState, 'Spiky', dealt)
      retaliation += dealt
    }
    if (retaliation > 0) appendLog(run, `${target.name} retaliated for ${retaliation} damage against ${actor.name}.`)
    if (actor.state.hp <= 0) resolveCombatDeath(actor, refs, run, index)
    for (const effect of target.onSelfHitEffects) {
      if (NEGATIVE_STATUS.has(effect.type)) applyCombatStatus(actor, effect, target)
    }
    if (actor.state.hp > 0 && (actor.forcesTargetToCounterattack || Math.random() < target.counterattack)) {
      if (target.side === 'party') incrementQuest(target.questState, 'ExpertDuelist', 1)
      appendLog(run, `${target.name} counterattacked ${actor.name}.`)
      dealCombatDamage(target, actor, {}, refs, run, index, run.localDarkness, true, 1)
    }
  }
  for (const effect of target.onSelfHitEffects) {
    if (!NEGATIVE_STATUS.has(effect.type)) applyCombatStatus(target, effect, target)
  }
}

function executeEndOfTurnActions(actor: CombatantRef, refs: CombatantRef[], run: AreaRun, index: ContentIndex, darkness: number) {
  const actions = [...actor.endOfTurnActions]
  if (actor.extraAttackChance > 0 && Math.random() < actor.extraAttackChance) actions.push('EXTRA_ATTACK')
  if (actor.passiveSkill === 'PASSIVE_BERSERKER_RAGE' && actor.state.hp <= actor.maxHp * 0.5) actions.push('EXTRA_ATTACK')
  if (actor.passiveSkill === 'PASSIVE_PYROMANCY_II') actions.push('EXTRA_ATTACK_1', 'EXTRA_ATTACK_1')
  if (actor.passiveSkill === 'PASSIVE_SWARM') {
    actions.push(...Array.from({ length: Math.max(0, actor.state.hp - 1) }, () => 'EXTRA_ATTACK_90'))
  }
  for (const actionId of actions) {
    if (actionId === 'STUN_SELF_NOT_CLEANSABLE') {
      addStatus(actor.state, { type: 'STUN_NOT_CLEANSABLE', turnsLeft: 1 }, actor.key)
      continue
    }
    const shieldAction = SHIELD_END_ACTIONS[actionId]
    if (shieldAction) {
      const target = selectTargets(actor, refs, 'lowestShieldAlly')[0]
      if (!target) continue
      const before = target.state.shield
      target.state.shield = Math.min(gameRound(target.maxHp * 0.2), before + gameRound(shieldAction.amount * actor.healingModifier))
      addStatus(target.state, { type: shieldAction.type, turnsLeft: shieldAction.turns + actor.inspireExaltBonusTurns }, actor.key)
      appendLog(run, `${actor.name} shielded ${target.name} for ${target.state.shield - before}.`)
      continue
    }
    const target = selectTargets(actor, refs, actor.passiveSkill === 'PASSIVE_CHAOTIC' ? 'randomExceptSelf' : 'randomEnemy')[0]
    if (!target) continue
    if (actionId === 'EXTRA_ATTACK' || actionId === 'EXTRA_ATTACK_MELEE') {
      dealCombatDamage(actor, target, actionId === 'EXTRA_ATTACK_MELEE' ? { forceRanged: false } : {}, refs, run, index, darkness, true)
      continue
    }
    const flat = FLAT_END_ACTIONS[actionId]
    if (flat) {
      if (flat.procsOnMelee !== undefined && flat.procsOnMelee === actor.ranged) continue
      endActionDamage(actor, target, flat, refs, run, index)
    }
  }
  if (actor.falseLifeChance > 0) {
    applyCombatStatus(actor, { type: 'FALSE_LIFE', turnsLeft: 999, probability: actor.falseLifeChance }, actor)
  }
}

function executeActiveSkill(actor: CombatantRef, refs: CombatantRef[], activeSkill: string, run: AreaRun, index: ContentIndex, darkness: number, depth = 0) {
  const profile = ACTIVE_SKILLS[activeSkill]
  if (!profile || depth > 20) return
  if (actor.side === 'party' && areaMagicDamageAmplification(run) >= 1.6) {
    incrementQuest(actor.questState, 'LaroxianPower', 1)
  }
  if (profile.special === 'escape') {
    if (actor.side === 'enemy') run.enemies = run.enemies.filter((enemy) => `e:${enemy.uid}` !== actor.key)
    run.turnOrder = run.turnOrder.filter((key) => key !== actor.key)
    appendLog(run, `${actor.name} escaped.`)
    return
  }
  if (profile.special === 'enGarde') addStatus(actor.state, { type: 'DEFENSIVE_STANCE', turnsLeft: 999 }, actor.key)
  if (profile.special === 'fragmentation') actor.state.hp = Math.max(1, actor.state.hp - 5_000)
  if (profile.special === 'dreamForge') actor.state.hp = Math.min(actor.maxHp, actor.state.hp + 10_000)
  if (profile.special === 'fireDance') {
    addStatus(actor.state, { type: 'ABLAZE', turnsLeft: 3 }, actor.key)
    appendLog(run, `${actor.name} used ${activeSkill}.`)
    if (run.areaId === 'LostLands') {
      run.event = advanceLostLandsFireRitual(run.event, Math.random())
      appendLog(run, `The Fire Ritual is ${run.event.progress}% complete.`)
    }
    return
  }
  if (profile.special === 'botchedSacrifice') {
    appendLog(run, `${actor.name} used Botched Sacrifice, but no one answers the call.`)
    return
  }
  if (profile.special === 'overdrive') {
    const armor = refs.find((candidate) => candidate.definitionId === 'MagicArmor' && candidate.state.hp > 0)
    if (!armor) return
    armor.state.hp = Math.max(1, armor.state.hp - 300)
  }
  let loggedUse = false
  let countedOffensiveCast = false
  for (const originalStep of profile.steps) {
    const skillStep: CombatSkillStep = { ...originalStep, status: originalStep.status ? { ...originalStep.status } : undefined }
    if (profile.tetherDamageAmplification && actor.definitionId === 'EldritchAlchemist' && hasStatus(actor.state, 'FEEBLE_TETHER')) {
      skillStep.damageAmplification = profile.tetherDamageAmplification
    }
    if (activeSkill === 'ACTIVE_INSTILL_TERROR' && skillStep.status) skillStep.status.probability = darkness * 0.01
    const targets = selectTargets(actor, refs, skillStep.target, skillStep.targetCount)
    if (!targets.length) continue
    if (!skillStep.noLog && !loggedUse) {
      loggedUse = true
      appendLog(run, `${actor.name} used ${activeSkill}.`)
    }
    if (actor.side === 'party' && !skillStep.healing && !skillStep.noLog && !countedOffensiveCast) {
      countedOffensiveCast = true
      incrementQuest(actor.questState, 'Tormentor', 1)
    }
    for (const target of targets) {
      if (skillStep.healing) healCombatTarget(actor, target, skillStep, run)
      else {
        const result = dealCombatDamage(actor, target, skillStep, refs, run, index, darkness)
        if (result.killed && skillStep.recastOnKill && actor.state.hp > 0) executeActiveSkill(actor, refs, activeSkill, run, index, darkness, depth + 1)
      }
    }
  }
}

function increaseMana(target: CombatantRef, activeSkill?: string) {
  if (!activeSkill || activeSkill === 'ACTIVE_NONE') return false
  if (target.state.mana >= 100) {
    if (target.passiveSkill !== 'PASSIVE_INFINITY') target.state.mana = 0
    return true
  }
  return false
}

function regenerateMana(target: CombatantState, manaRegen: number, activeSkill?: string) {
  if (!activeSkill || activeSkill === 'ACTIVE_NONE') return
  target.mana = Math.min(100, target.mana + manaRegen)
}

function weightedEnemyDrop(definition: EnemyDefinition) {
  const roll = Math.random() * 1000
  let total = 0
  for (const drop of definition.drops) {
    total += drop.weight
    if (roll < total) return drop
  }
  return undefined
}

function rollDrops(state: GameState, run: AreaRun, index: ContentIndex) {
  const pet = state.pets.find((entry) => entry.uid === run.petUid)
  const extraDropChance = petAbilityStrength(pet, 'DROPS') * 0.003
  for (const enemy of run.enemies) {
    const definition = index.enemies.get(enemy.enemyId)
    if (!definition) continue
    const roll = Math.random() * 1000
    let total = 0
    for (const drop of definition.drops) {
      total += drop.weight
      if (roll < total) {
        addStack(run.chest, { itemId: drop.item, stack: drop.stack })
        const item = index.items.get(drop.item)
        appendLog(run, `Found ${drop.stack}× ${item?.name ?? drop.item}.`)
        break
      }
    }
    if (Math.random() < extraDropChance) {
      const extra = weightedEnemyDrop(definition)
      if (extra) {
        addStack(run.chest, { itemId: extra.item, stack: extra.stack })
        appendLog(run, `Found ${extra.stack}x ${index.items.get(extra.item)?.name ?? extra.item}.`)
      }
    }
    if (Math.random() < 0.0005) addStack(run.chest, { itemId: 'Geode', stack: 1 })
  }
}

function awardExperience(state: GameState, run: AreaRun, index: ContentIndex) {
  const survivors = livingParty(state, run).filter((member) => member.summonerUid === undefined)
  if (!survivors.length) return
  const total = run.enemies.reduce((sum, enemy) => sum + (index.enemies.get(enemy.enemyId)?.fields.expGiven ?? 0), 0)
  const pet = state.pets.find((entry) => entry.uid === run.petUid)
  const baseShare = total / survivors.length
  const petMultiplier = 1 + petAbilityStrength(pet, 'EXPERIENCE') * 0.004
  for (const adventurer of survivors) {
    const definition = index.adventurers.get(adventurer.classId)
    if (!definition) continue
    const experienceMultiplier = adventurerExperienceMultiplier(adventurer, index) * petMultiplier
    const share = gameRound(baseShare * experienceMultiplier)
    if (experienceMultiplier >= 1.5) incrementQuest(state, 'FastLearner', 1)
    incrementQuest(state, 'Student', share)
    let remainingXp = share
    while (adventurer.level < definition.fields.maxLevel && remainingXp > 0) {
      const required = experienceToNextLevel(adventurer.level, adventurer.ascended)
      const gained = Math.min(required - adventurer.xp, remainingXp)
      remainingXp -= gained
      adventurer.xp += gained
      run.report.xpEarned += gained
      if (adventurer.xp >= required) {
        adventurer.level += 1
        adventurer.xp = 0
        adventurer.hp = adventurerStats(adventurer, index).maxHp
        appendLog(run, `${adventurer.name} reached level ${adventurer.level}.`)
      }
    }
  }
}

function runPetActions(state: GameState, run: AreaRun, index: ContentIndex, actingSide: CombatantRef['side'], actingActor?: CombatantRef) {
  const pet = state.pets.find((entry) => entry.uid === run.petUid)
  if (!pet) return
  let refs = combatants(state, run, index)
  if (actingSide === 'party') {
    const fighter = petAbilityStrength(pet, 'FIGHTER')
    const enemies = refs.filter((candidate) => candidate.side === 'enemy' && candidate.state.hp > 0)
    const target = fighter > 0 ? weightedRandom(enemies) : undefined
    if (target) {
      const companionMultiplier = actingActor?.side === 'party' ? 1 + actingActor.livingCompanionBonusDamage * 0.01 : 1
      const effectiveFighter = fighter * companionMultiplier
      const rawDamage = gameRound(Math.max(1, effectiveFighter * 0.9 + Math.random() * effectiveFighter * 0.2))
      const damage = combatDamageAmount(target, rawDamage, false)
      absorbDamage(target.state, damage)
      appendLog(run, `${pet.petId} dealt ${damage} damage to ${target.name}.`)
      resolveCombatDeath(target, refs, run, index)
    }

    refs = combatants(state, run, index)
    const healer = petAbilityStrength(pet, 'HEALER')
    const healTarget = healer > 0
      ? refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)
        .sort((left, right) => left.state.hp / left.maxHp - right.state.hp / right.maxHp)[0]
      : undefined
    if (healTarget && healTarget.state.hp < healTarget.maxHp) {
      const amount = gameRound(Math.max(1, healer * 0.9 + Math.random() * healer * 0.2))
      const before = healTarget.state.hp
      healTarget.state.hp = Math.min(healTarget.maxHp, healTarget.state.hp + amount)
      if (actingActor?.side === 'party') incrementQuest(actingActor.questState, 'Medic', healTarget.state.hp - before)
      appendLog(run, `${pet.petId} healed ${healTarget.name} for ${amount}.`)
    }
  }

  refs = combatants(state, run, index)
  const executionThreshold = petAbilityStrength(pet, 'OPPORTUNIST') * 0.002
  if (executionThreshold > 0) {
    refs.filter((candidate) => candidate.side === 'enemy' && candidate.state.hp > 0 && candidate.state.hp / candidate.maxHp < executionThreshold)
      .forEach((target) => {
        target.state.hp = 0
        appendLog(run, `${pet.petId} executed ${target.name}.`)
        resolveCombatDeath(target, refs, run, index)
      })
  }

  if (actingSide !== 'party') return
  refs = combatants(state, run, index)
  const magic = petAbilityStrength(pet, 'MAGIC')
  const chance = magic * 0.003
  if (chance <= 0) return
  const roll = Math.random()
  const types: StatusEffectType[] = ['TAUNT', 'DEFENSIVE_STANCE', 'STUN', 'SILENCE', 'ABLAZE', 'POISON', 'REGENERATION', 'BLEED', 'FROZEN']
  const type = roll < 0.9
    ? types[Math.floor(roll * 10)]
    : chance < 0.15 ? 'LESSER_CURSE' : chance < 0.3 ? 'CURSE' : 'GREATER_CURSE'
  const party = refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0 && (candidate.state as AdventurerState).summonerUid === undefined)
  const enemies = refs.filter((candidate) => candidate.side === 'enemy' && candidate.state.hp > 0)
  const cause = type === 'TAUNT'
    ? [...party].sort((left, right) => right.threat - left.threat)[0]
    : type.includes('CURSE')
      ? [...party].sort((left, right) => right.intelligence - left.intelligence)[0]
      : party[Math.floor(Math.random() * party.length)]
  const negative = NEGATIVE_STATUS.has(type)
  const target = negative
    ? enemies[Math.floor(Math.random() * enemies.length)]
    : party[Math.floor(Math.random() * party.length)]
  if (cause && target && applyCombatStatus(target, { type, turnsLeft: gameRound(magic * 0.028 + 1), probability: chance }, cause)) {
    appendLog(run, `${pet.petId} applied ${type} to ${target.name}.`)
  }
}

function trackCombatQuests(state: GameState, run: AreaRun, index: ContentIndex, before: CombatantRef[]) {
  const after = combatants(state, run, index)
  const killed = before.filter((entry) => entry.side === 'enemy' && entry.state.hp > 0)
    .filter((entry) => after.some((candidate) => candidate.key === entry.key && candidate.state.hp <= 0))
  const killQuest: Record<string, string> = {
    KabarTheRotten: 'AndStayDead', Banshee: 'ClashOfTitans', ArchmageOfLarox: 'CoupDEtat',
    PaleHermit: 'DarknessWithin', AvatarOfTheAncient: 'EldritchHorror', PrimordialTitan: 'EndlessAgony',
    WillOWisp: 'Exorcism', WickedTribute: 'FromHell', IceElemental: 'IceBreaker', Dryad: 'Innocence',
    Beholder: 'Myopia', Mimic: 'NiceTry', GoldenRabbit: 'SoftAndFluffy',
    GiantTortoise: 'SpeedyHare', SmolderingTitan: 'RagingVolcano', SlimeKing: 'Regicide',
  }
  const killQuestAreas: Record<string, string> = {
    KabarTheRotten: 'AncientGraveDigging', Banshee: 'BarrenWastelands', ArchmageOfLarox: 'HiddenCityOfLarox',
    PaleHermit: 'ObsidianMines', AvatarOfTheAncient: 'TheLostExpedition', PrimordialTitan: 'TheCultistRebels',
    WillOWisp: 'EternalBattlefield', WickedTribute: 'HiddenCityOfLarox', IceElemental: 'FrostbitePeaks',
    Dryad: 'TheSouthernGrove', Beholder: 'ObsidianMines', Mimic: 'BlackwaterPort', GoldenRabbit: 'EnchantedForest',
    GiantTortoise: 'TheSouthernGrove', SmolderingTitan: 'LostLands', SlimeKing: 'TheSlimePond',
  }
  killed.forEach((target) => {
    state.achievementStats.defeatedEnemies[target.definitionId] = (state.achievementStats.defeatedEnemies[target.definitionId] ?? 0) + 1
    const questId = killQuest[target.definitionId]
    if (questId && killQuestAreas[target.definitionId] === run.areaId) incrementQuest(state, questId, 1)
    if (run.areaId === 'TheDesert' && ['ShahuriWarrior', 'ShahuriMage', 'ShahuriArcher'].includes(target.definitionId)) {
      incrementQuest(state, 'Conqueror', 1)
    }
    if (run.areaId === 'TheDesert' && target.definitionId === 'SandStatue') incrementQuest(state, 'GodFeared', 1)
    if (run.areaId === 'TheGoldenCity' && target.definitionId === 'InsaneCitizen') incrementQuest(state, 'Psychiatrist', 1)
  })
  const cultistIds = new Set(run.enemies.filter((enemy) => enemy.enemyId === 'Claris' || enemy.enemyId === 'Thorvus').map((enemy) => enemy.enemyId))
  if (run.areaId === 'TheCultistRebels' && killed.length > 0 && cultistIds.has('Claris') && cultistIds.has('Thorvus') && !livingEnemies(run).length) {
    incrementQuest(state, 'BotchedRitual', 1)
  }
  if (killed.length >= 4) incrementQuest(state, 'TabulaRasa', 1)
}

export function combatTurn(state: GameState, run: AreaRun, index: ContentIndex) {
  const party = livingParty(state, run)
  const enemies = livingEnemies(run)
  if (!party.length || !enemies.length) return
  if (!run.turnOrder.length) buildTurnOrder(state, run, index)

  let actorKey = run.turnOrder[run.turnIndex % run.turnOrder.length]
  run.turnIndex = (run.turnIndex + 1) % Math.max(1, run.turnOrder.length)
  let guard = run.turnOrder.length
  while (guard-- > 0) {
    const alive = actorKey.startsWith('a:')
      ? party.some((entry) => entry.uid === Number(actorKey.slice(2)))
      : enemies.some((entry) => entry.uid === actorKey.slice(2))
    if (alive) break
    actorKey = run.turnOrder[run.turnIndex % run.turnOrder.length]
    run.turnIndex = (run.turnIndex + 1) % Math.max(1, run.turnOrder.length)
  }
  const refs = combatants(state, run, index)
  const actor = refs.find((candidate) => candidate.key === actorKey)
  if (!actor || actor.state.hp <= 0) return
  const before = structuredClone(refs)
  const finishTurn = () => {
    runPetActions(state, run, index, actor.side, actor)
    trackCombatQuests(state, run, index, before)
  }
  const statusResult = resolveStatuses(actor, run, refs, index)
  if (actor.state.hp <= 0) {
    resolveCombatDeath(actor, refs, run, index)
    if (actor.state.hp <= 0) {
      finishTurn()
      return
    }
  }
  if (statusResult.skipTurn) {
    finishTurn()
    return
  }

  const activeSkill = actor.activeSkill
  const casts = !statusResult.silenced && increaseMana(actor, activeSkill)
  if (casts && activeSkill) {
    const darkness = localDarkness(state, run, index)
    executeActiveSkill(actor, refs, activeSkill, run, index, darkness)
    if ((ACTIVE_SKILLS[activeSkill]?.steps.length ?? 0) > 0) executeEndOfTurnActions(actor, refs, run, index, darkness)
    finishTurn()
    return
  }
  if (!statusResult.silenced) regenerateMana(actor.state, actor.manaRegen, activeSkill)

  if (actor.healer) {
    const target = selectTargets(actor, refs, 'lowestRelativeAlly')[0]
    if (target) healCombatTarget(actor, target, {}, run)
    executeEndOfTurnActions(actor, refs, run, index, localDarkness(state, run, index))
    finishTurn()
    return
  }
  const prehistoric = actor.passiveSkill === 'PASSIVE_PREHISTORIC_AVIAN' || actor.passiveSkill === 'PASSIVE_PREHISTORIC_COLOSSUS'
  const protectedByEmpathy = run.areaId === 'LostLands'
    && refs.some((candidate) => candidate.side === actor.side && candidate.passiveSkill === 'PASSIVE_NATURAL_EMPATHY' && candidate.state.hp > 0)
  const targetMode: TargetMode = actor.passiveSkill === 'PASSIVE_CHAOTIC'
    || actor.passiveSkill === 'PASSIVE_PRIMORDIAL_HUNGER'
    || (prehistoric && !protectedByEmpathy)
    ? 'randomExceptSelf'
    : actor.passiveSkill === 'PASSIVE_DESPISE_WEAKNESS' || actor.passiveSkill === 'PASSIVE_WICKED_APPETITE'
      ? 'lowestRelativeEnemy'
      : 'randomEnemy'
  const target = selectTargets(actor, refs, targetMode)[0]
  const darkness = localDarkness(state, run, index)
  if (target) dealCombatDamage(actor, target, {}, refs, run, index, darkness, true)
  executeEndOfTurnActions(actor, refs, run, index, darkness)
  finishTurn()
}

function triggerTrap(
  state: GameState,
  run: AreaRun,
  index: ContentIndex,
  stat: 'Dexterity' | 'Constitution' | 'Intelligence',
  difficulty: number,
  rawDamage: number,
  magic: boolean,
) {
  appendLog(run, `Dodge roll is made with ${stat}. Difficulty is ${difficulty}.`)
  const darkness = localDarkness(state, run, index)
  const refs = combatants(state, run, index)
  const members = refs
    .filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)
    .sort((left, right) => Number(right.saboteur) - Number(left.saboteur))
  for (const member of members) {
    const checkStat = member.saboteur
      ? member.dexterity
      : stat === 'Dexterity'
        ? member.dexterity
        : stat === 'Constitution'
          ? member.constitution
          : member.intelligence
    let failureChance = difficulty / (checkStat + difficulty)
    if (darkness > 0 && !member.nightVision) {
      failureChance -= darkness * 0.01 * (failureChance - 1)
    }
    const dodgeChance = 100 - Math.trunc(failureChance * 100 + 0.0001)
    if (Math.random() <= failureChance) {
      const damage = combatDamageAmount(member, rawDamage * (magic ? areaMagicDamageAmplification(run) : 1), magic)
      absorbDamage(member.state, damage)
      appendLog(run, `${member.name} couldn't avoid the trap and took ${damage} damage. Dodge chance was ${dodgeChance}%.`)
      if (member.state.hp <= 0) resolveCombatDeath(member, refs, run, index)
    } else {
      appendLog(run, `${member.name} avoided the trap. Dodge chance was ${dodgeChance}%`)
      incrementQuest(state, 'ItsATrap', 1)
      if (member.saboteur) {
        appendLog(run, `${member.name} disarmed the trap.`)
        break
      }
    }
  }
}

function finishRaidRun(state: GameState, run: AreaRun, finishedReason: AreaRun['finishedReason'] = 'victory') {
  for (const uid of run.partyIds) {
    const member = state.adventurers.find((entry) => entry.uid === uid)
    if (member) member.areaId = null
  }
  run.partyIds = []
  run.summons = []
  run.enemies = []
  run.turnOrder = []
  run.turnIndex = 0
  run.event = null
  run.action = 'IDLE'
  run.actionRemaining = 0
  run.actionTotal = 1
  run.finished = true
  run.finishedReason = finishedReason
}

function finishAction(state: GameState, run: AreaRun, index: ContentIndex) {
  switch (run.action) {
    case 'ENTER_DUNGEON':
      if (run.areaId === 'EnchantedForest' && state.tutorialStep === 2) {
        run.event = { kind: 'TUTORIAL', progress: 0 }
      }
      appendLog(run, run.areaId === 'EnchantedForest'
        ? ENCHANTED_FOREST_LOGS.enter
        : run.areaId === 'TheDesert'
          ? THE_DESERT_LOGS.enter
          : run.areaId === 'EternalBattlefield'
            ? ETERNAL_BATTLEFIELD_LOGS.enter
            : run.areaId === 'TheGoldenCity'
              ? THE_GOLDEN_CITY_LOGS.enter
              : run.areaId === 'BlackwaterPort'
                ? BLACKWATER_PORT_LOGS.enter
                : run.areaId === 'FrostbitePeaks'
                  ? FROSTBITE_PEAKS_LOGS.enter
                  : run.areaId === 'ObsidianMines'
                    ? OBSIDIAN_MINES_LOGS.enter
                    : run.areaId === 'AncientGraveDigging'
                      ? ANCIENT_GRAVE_DIGGING_LOGS.enter
                    : run.areaId === 'TheSlimePond'
                      ? THE_SLIME_POND_LOGS.enter
                    : run.areaId === 'DivineArcheology'
                      ? DIVINE_ARCHEOLOGY_LOGS.enter
                    : run.areaId === 'ImperialRescue'
                      ? IMPERIAL_RESCUE_LOGS.enter
                    : run.areaId === 'TheCultistRebels'
                      ? THE_CULTIST_REBELS_LOGS.enter
                    : run.areaId === 'TheLostExpedition'
                      ? THE_LOST_EXPEDITION_LOGS.enter
                    : run.areaId === 'SleepingPlanet'
                      ? SLEEPING_PLANET_LOGS.enter
                    : run.areaId === 'Kaunis'
                      ? KAUNIS_LOGS.enter
                    : run.areaId === 'TheTower'
                      ? THE_TOWER_LOGS.enter
                    : run.areaId === 'TheDreadfulAscent'
                      ? THE_DREADFUL_ASCENT_LOGS.enter
                      : run.areaId === 'CelestialMothership'
                        ? CELESTIAL_MOTHERSHIP_LOGS.enter
                        : run.areaId === 'TheDireDescent'
                          ? THE_DIRE_DESCENT_LOGS.enter
                      : run.areaId === 'TheSouthernGrove'
                        ? THE_SOUTHERN_GROVE_LOGS.enter
                        : run.areaId === 'BarrenWastelands'
                          ? BARREN_WASTELANDS_LOGS.enter
                          : run.areaId === 'HiddenCityOfLarox'
                            ? HIDDEN_CITY_OF_LAROX_LOGS.enter
                            : run.areaId === 'LostLands'
                              ? LOST_LANDS_LOGS.enter
            : `The party entered ${index.areas.get(run.areaId)?.name ?? run.areaId}.`)
      action(run, 'ENTER_ROOM')
      break
    case 'ENTER_ROOM': {
      const area = index.areas.get(run.areaId)
      const isRaid = Boolean(area && area.areaType !== 0)
      if (isRaid) {
        incrementQuest(state, 'LongMarch', 1)
        run.progress = Math.min(250, run.progress + 1)
        run.maxProgress = Math.max(run.maxProgress, run.progress)
      }
      if (run.areaId === 'TheSouthernGrove' && run.event?.kind === 'PRIMEVAL_WURM_PROGRESS') {
        incrementQuest(state, 'Marathon', run.progress, true)
      }
      if (run.areaId === 'AncientGraveDigging') {
        const result = enterAncientGraveDiggingRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheSlimePond') {
        const result = enterTheSlimePondRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'DivineArcheology') {
        const totalConstitution = livingParty(state, run).reduce((sum, member) => {
          return sum + (index.adventurers.has(member.classId) ? adventurerStats(member, index).constitution : 0)
        }, 0)
        const result = enterDivineArcheologyRoom(run.progress, totalConstitution)
        run.event = result.event
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'ImperialRescue') {
        const result = enterImperialRescueRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheCultistRebels') {
        const hasEquippedSkeletonKey = run.partyIds.some((uid) => {
          return state.adventurers.find((member) => member.uid === uid)?.accessoryId === 'SkeletonKey'
        })
        const result = enterTheCultistRebelsRoom(run.progress, run.event, hasEquippedSkeletonKey)
        run.event = result.event
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheLostExpedition') {
        const result = enterTheLostExpeditionRoom(run.progress, run.event)
        run.event = result.event
        if (result.log) appendLog(run, result.log)
        if (result.fallDamage) {
          const refs = combatants(state, run, index)
          for (const member of refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)) {
            const damage = combatDamageAmount(member, 40, false)
            absorbDamage(member.state, damage)
            appendLog(run, `${member.name} lost ${damage} HP from the fall.`)
            if (member.state.hp <= 0) resolveCombatDeath(member, refs, run, index)
          }
        }
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'SleepingPlanet') {
        const result = enterSleepingPlanetRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'Kaunis') {
        const result = enterKaunisRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheTower') {
        const result = enterTheTowerRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.rest) {
          let resurrected = false
          for (const uid of run.partyIds) {
            const member = state.adventurers.find((candidate) => candidate.uid === uid)
            if (!member || !index.adventurers.has(member.classId)) continue
            if (member.hp <= 0 && resurrected) continue
            if (member.hp <= 0) resurrected = true
            member.hp = adventurerStats(member, index).maxHp
          }
          if (resurrected) appendLog(run, THE_TOWER_LOGS.resurrect)
          appendLog(run, THE_TOWER_LOGS.heal)
        }
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheDreadfulAscent') {
        const result = enterTheDreadfulAscentRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'CelestialMothership') {
        const result = enterCelestialMothershipRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'TheDireDescent') {
        const result = enterTheDireDescentRoom(run.progress)
        if (result.log) appendLog(run, result.log)
        if (result.completed) {
          finishRaidRun(state, run)
          break
        }
      } else if (run.areaId === 'EnchantedForest') {
        appendLog(run, enterEnchantedForestRoom(Math.random()))
      } else if (run.areaId === 'EternalBattlefield') {
        appendLog(run, enterEternalBattlefieldRoom(Math.random()))
      } else if (run.areaId === 'TheGoldenCity') {
        const result = enterTheGoldenCityRoom(run.event, Math.random(), run.event ? 1 : Math.random())
        run.event = result.event
        result.logs.forEach((log) => appendLog(run, log))
      } else if (run.areaId === 'BlackwaterPort') {
        appendLog(run, enterBlackwaterPortRoom(Math.random()))
      } else if (run.areaId === 'FrostbitePeaks') {
        const result = enterFrostbitePeaksRoom(run.event, Math.random(), run.event ? 1 : Math.random())
        run.event = result.event
        result.logs.forEach((log) => appendLog(run, log))
        const partyIds = new Set(run.partyIds.map((uid) => `a:${uid}`))
        const refs = combatants(state, run, index)
        for (const member of refs.filter((candidate) => partyIds.has(candidate.key))) {
          if (Math.random() >= result.freezeChance || member.statusImmunities.includes('FROZEN')) continue
          Math.random()
          if (Math.random() < member.statusImmunity) continue
          addStatus(member.state, { type: 'FROZEN', turnsLeft: 3 })
        }
      } else if (run.areaId === 'ObsidianMines') {
        const result = enterObsidianMinesRoom(run.event, Math.random())
        run.event = result.event
        result.logs.forEach((log) => appendLog(run, log))
      } else if (run.areaId === 'TheSouthernGrove') {
        appendLog(run, enterTheSouthernGroveRoom(Math.random()))
      } else if (run.areaId === 'BarrenWastelands') {
        appendLog(run, enterBarrenWastelandsRoom(Math.random()))
      } else if (run.areaId === 'HiddenCityOfLarox') {
        appendLog(run, enterHiddenCityOfLaroxRoom(Math.random()))
      } else if (run.areaId === 'LostLands') {
        appendLog(run, enterLostLandsRoom(Math.random()))
      } else if (run.areaId === 'TheDesert') {
        const result = enterTheDesertRoom(
          run.event,
          run.event?.kind === 'SHAHURI_ARMY_READY' ? 0 : Math.random(),
        )
        run.event = result.event
        appendLog(run, result.log)
      }
      const roomRefs = combatants(state, run, index)
      for (const member of roomRefs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)) {
        resolveStatuses(member, run, roomRefs, index)
        if (member.state.hp <= 0) resolveCombatDeath(member, roomRefs, run, index)
      }
      run.localDarkness = calculateRoomDarkness(state, run, index)
      if (!livingParty(state, run).length) {
        appendLog(run, 'The party was defeated.')
        run.report.wipes += 1
        if (isRaid) finishRaidRun(state, run, 'defeat')
        else action(run, 'RESPAWN')
        break
      }
      const roster = rollEncounter(state, run, index)
      if (roster.length) {
        run.enemies = spawnEnemies(roster, index)
        for (const enemy of run.enemies) {
          if (!state.seenEnemies.includes(enemy.enemyId)) state.seenEnemies.push(enemy.enemyId)
        }
        buildTurnOrder(state, run, index)
        if (run.areaId === 'EnchantedForest') {
          const result = startEnchantedForestFight(
            run.event,
            run.event?.kind === 'ENRAGED_SPIRIT' ? 0 : Math.random(),
          )
          run.event = result.event
          appendLog(run, result.log)
        } else if (run.areaId === 'EternalBattlefield') {
          appendLog(run, startEternalBattlefieldFight(Math.random()))
        } else if (run.areaId === 'TheGoldenCity') {
          const result = startTheGoldenCityFight(
            run.event,
            Math.random(),
            run.event?.kind === 'ANGRY_EYE' ? Math.random() : 1,
          )
          run.event = result.event
          result.logs.forEach((log) => appendLog(run, log))
          if (result.delirious) {
            for (const enemy of run.enemies) addStatus(enemy, { type: 'DELIRIUM', turnsLeft: 999 })
          }
        } else if (run.areaId === 'BlackwaterPort') {
          appendLog(run, startBlackwaterPortFight(
            run.event,
            run.event?.kind === 'THE_KRAKEN_FIGHT' ? 0 : Math.random(),
          ))
        } else if (run.areaId === 'FrostbitePeaks') {
          appendLog(run, startFrostbitePeaksFight(Math.random()))
        } else if (run.areaId === 'ObsidianMines') {
          appendLog(run, startObsidianMinesFight(Math.random()))
        } else if (run.areaId === 'AncientGraveDigging') {
          const encounterLog = startAncientGraveDiggingFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'TheSlimePond') {
          const encounterLog = startTheSlimePondFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'DivineArcheology') {
          const encounterLog = startDivineArcheologyFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'ImperialRescue') {
          const encounterLog = startImperialRescueFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
          for (const enemy of run.enemies) addStatus(enemy, { type: 'DELIRIUM', turnsLeft: 999 }, `e:${enemy.uid}`)
        } else if (run.areaId === 'TheCultistRebels') {
          appendLog(run, startTheCultistRebelsFight(run.event, roster.length))
        } else if (run.areaId === 'TheLostExpedition') {
          const encounterLog = startTheLostExpeditionFight(run.progress, run.event)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'SleepingPlanet') {
          const encounterLog = startSleepingPlanetFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'Kaunis') {
          const encounterLog = startKaunisFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'TheTower') {
          const encounterLog = startTheTowerFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'TheDreadfulAscent') {
          const encounterLog = startTheDreadfulAscentFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'CelestialMothership') {
          const encounterLog = startCelestialMothershipFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'TheDireDescent') {
          const encounterLog = startTheDireDescentFight(run.progress)
          if (encounterLog) appendLog(run, encounterLog)
        } else if (run.areaId === 'TheSouthernGrove') {
          appendLog(run, startTheSouthernGroveFight(run.event, Math.random()))
        } else if (run.areaId === 'BarrenWastelands') {
          appendLog(run, startBarrenWastelandsFight(Math.random()))
        } else if (run.areaId === 'HiddenCityOfLarox') {
          appendLog(run, startHiddenCityOfLaroxFight(Math.random()))
        } else if (run.areaId === 'LostLands') {
          appendLog(run, startLostLandsFight(roster, Math.random()))
        } else if (run.areaId === 'TheDesert') {
          const result = startTheDesertFight(
            run.event,
            run.event?.kind === 'SHAHURI_ARMY_READY' ? 0 : Math.random(),
          )
          run.event = result.event
          appendLog(run, result.log)
        } else appendLog(run, `Encountered ${roster.map((id) => index.enemies.get(id)?.name ?? id).join(', ')}.`)
        action(run, 'FIGHT')
      } else action(run, isRaid ? 'ENTER_ROOM' : 'SEARCH')
      break
    }
    case 'FIGHT': {
      const area = index.areas.get(run.areaId)
      const isRaid = Boolean(area && area.areaType !== 0)
      combatTurn(state, run, index)
      if (!livingParty(state, run).length) {
        appendLog(run, 'The party was defeated.')
        run.report.wipes += 1
        if (isRaid) finishRaidRun(state, run, 'defeat')
        else action(run, 'RESPAWN')
      } else if (!livingEnemies(run).length) {
        if (run.areaId === 'TheGoldenCity' && run.event?.kind === 'ANGRY_EYE') {
          incrementQuest(state, 'Delirious', run.enemies.filter((enemy) => enemy.hp <= 0).length)
        }
        awardExperience(state, run, index)
        rollDrops(state, run, index)
        appendLog(run, 'The party won the fight.')
        if (run.areaId === 'BlackwaterPort' && run.event?.kind === 'THE_KRAKEN_FIGHT') {
          appendLog(run, BLACKWATER_PORT_LOGS.krakenVictory)
        }
        action(run, 'LOOT')
      } else action(run, 'FIGHT')
      break
    }
    case 'LOOT':
      if (state.tutorialStep === 2) state.tutorialStep = 3
      run.enemies = []
      action(run, index.areas.get(run.areaId)?.areaType === 0 ? 'SEARCH' : 'ENTER_ROOM')
      break
    case 'SEARCH': {
      if (run.areaId === 'EnchantedForest') {
        const result = searchEnchantedForest(Math.random())
        if (result.type === 'item') {
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'fountain') {
          for (const member of livingParty(state, run)) member.hp = adventurerStats(member, index).maxHp
          appendLog(run, ENCHANTED_FOREST_LOGS.fountain)
        } else if (result.type === 'fairy') {
          for (const member of livingParty(state, run)) member.mana = 100
          appendLog(run, ENCHANTED_FOREST_LOGS.fairy)
        } else if (result.type === 'pitfall') {
          appendLog(run, ENCHANTED_FOREST_LOGS.pitfall)
          triggerTrap(state, run, index, 'Dexterity', 10, 10, false)
        } else appendLog(run, ENCHANTED_FOREST_LOGS.nothing)
      } else if (run.areaId === 'EternalBattlefield') {
        const rewardReady = run.event?.kind === 'WILL_O_WISP_HUNT' && run.event.progress >= 200
        const result = searchEternalBattlefield(run.event, rewardReady ? 0 : Math.random())
        if (result.type === 'reward') {
          run.event = result.event
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, ETERNAL_BATTLEFIELD_LOGS.wispReward)
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else appendLog(run, ETERNAL_BATTLEFIELD_LOGS.nothing)
      } else if (run.areaId === 'TheGoldenCity') {
        const result = searchTheGoldenCity(Math.random())
        if (result.type === 'item') {
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else if (result.type === 'eyeDrain') {
          appendLog(run, THE_GOLDEN_CITY_LOGS.eyeDrain)
          const refs = combatants(state, run, index)
          const partyIds = new Set(run.partyIds.map((uid) => `a:${uid}`))
          for (const member of refs.filter((candidate) => partyIds.has(candidate.key) && candidate.state.hp > 0)) {
            const rawDamage = Math.max(1, 40 - member.constitution)
            const damage = combatDamageAmount(member, rawDamage, true)
            absorbDamage(member.state, damage)
            appendLog(run, `${damage} HP was drawn from ${member.name}.`)
            if (member.state.hp <= 0) resolveCombatDeath(member, refs, run, index)
          }
        } else if (result.type === 'heal') {
          for (const uid of run.partyIds) {
            const member = state.adventurers.find((entry) => entry.uid === uid)
            if (member && index.adventurers.has(member.classId)) member.hp = adventurerStats(member, index).maxHp
          }
          appendLog(run, THE_GOLDEN_CITY_LOGS.healingPriest)
        } else appendLog(run, THE_GOLDEN_CITY_LOGS.nothing)
      } else if (run.areaId === 'BlackwaterPort') {
        const rewardReady = run.event?.kind === 'THE_KRAKEN_FIGHT'
        const result = searchBlackwaterPort(run.event, rewardReady ? 0 : Math.random())
        if (result.type === 'reward') {
          incrementQuest(state, 'Thalassophobia', 1)
          run.event = result.event
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, result.log)
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'item') {
          if (result.log) appendLog(run, result.log)
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else appendLog(run, BLACKWATER_PORT_LOGS.nothing)
      } else if (run.areaId === 'FrostbitePeaks') {
        const party = run.partyIds.flatMap((uid) => {
          const member = state.adventurers.find((entry) => entry.uid === uid && entry.hp > 0)
          return member ? [{ member, dexterity: adventurerStats(member, index).dexterity }] : []
        })
        const lockpicker = [...party].sort((left, right) => right.dexterity - left.dexterity)[0]
        const searchRoll = Math.random()
        let successRoll = 1
        let crystalRoll = 1
        if (searchRoll < 0.01 && lockpicker) {
          successRoll = Math.random()
          if (successRoll * 100 < Math.trunc(lockpicker.dexterity / 2)) crystalRoll = Math.random()
        }
        const result = searchFrostbitePeaks(searchRoll, lockpicker?.dexterity ?? 0, successRoll, crystalRoll)
        if (result.type === 'crate' && lockpicker) {
          appendLog(run, `Behind a nearby rock lies a winterwood crate with a huge iron lock. It must be a Troll storage of sorts. With a Dexterity of ${lockpicker.dexterity}, ${lockpicker.member.name} tries to pick the lock. It has a ${result.chance}% proability of success.`)
          appendLog(run, result.success
            ? `${lockpicker.member.name} succeeded!`
            : `${lockpicker.member.name} failed, breaking the lock.`)
          for (const item of result.items) {
            addStack(run.chest, item)
            appendLog(run, `Looking around the place, you found ${item.stack} ${index.items.get(item.itemId)?.name ?? item.itemId}.`)
          }
        } else if (result.type === 'item') {
          addStack(run.chest, result)
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else appendLog(run, FROSTBITE_PEAKS_LOGS.nothing)
      } else if (run.areaId === 'ObsidianMines') {
        const result = searchObsidianMines(Math.random())
        if (result.type === 'item') {
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else appendLog(run, OBSIDIAN_MINES_LOGS.nothing)
      } else if (run.areaId === 'TheSouthernGrove') {
        const party = run.partyIds.flatMap((uid) => {
          const member = state.adventurers.find((entry) => entry.uid === uid && entry.hp > 0)
          return member ? [adventurerStats(member, index).dexterity] : []
        })
        const averageDexterity = gameRound(party.reduce((sum, dexterity) => sum + dexterity, 0) / Math.max(1, party.length))
        const result = searchTheSouthernGrove(run.event, averageDexterity, Math.random)
        run.event = result.event
        if ('turns' in result && result.type !== 'wurmTrap') {
          appendLog(run, `A rumbling sound is quickly approaching. With an average dexterity of ${result.averageDexterity}, it will reach the team in ${result.turns} turns.`)
        }
        if (result.type === 'wurmTrap') {
          appendLog(run, THE_SOUTHERN_GROVE_LOGS.wurmTrap)
          triggerTrap(state, run, index, 'Dexterity', 80, 1000, false)
        } else if (result.type === 'item') {
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else appendLog(run, "Looking around, you didn't find anything of value.")
      } else if (run.areaId === 'BarrenWastelands') {
        const result = searchBarrenWastelands(Math.random())
        if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else appendLog(run, "Looking around, you didn't find anything of value.")
      } else if (run.areaId === 'HiddenCityOfLarox') {
        const result = searchHiddenCityOfLarox(run.event, Math.random(), Math.random)
        run.event = result.event
        if (result.type === 'amplification') {
          appendLog(run, `${HIDDEN_CITY_OF_LAROX_LOGS.magicAmplification}\nMagic Damage amplification is now ${result.percent}%`)
        } else if (result.type === 'trap') {
          appendLog(run, result.log)
          triggerTrap(state, run, index, result.stat, result.difficulty, result.damage, result.magic)
        } else if (result.type === 'hostileNexus') {
          appendLog(run, HIDDEN_CITY_OF_LAROX_LOGS.hostileNexus)
          const refs = combatants(state, run, index)
          for (const member of refs.filter((candidate) => candidate.side === 'party' && candidate.state.hp > 0)) {
            applyEnvironmentalStatus(member, { type: 'ABLAZE', turnsLeft: 5, probability: 0.85 })
            applyEnvironmentalStatus(member, { type: 'FROZEN', turnsLeft: 5, probability: 0.85 })
            applyEnvironmentalStatus(member, { type: 'SILENCE', turnsLeft: 5, probability: 0.85 })
          }
        } else if (result.type === 'heal') {
          for (const uid of run.partyIds) {
            const member = state.adventurers.find((entry) => entry.uid === uid)
            if (!member || !index.adventurers.has(member.classId)) continue
            member.hp = adventurerStats(member, index).maxHp
            member.negativeStatusEffects = []
          }
          for (const summon of run.summons) {
            if (!index.adventurers.has(summon.classId)) continue
            summon.hp = adventurerStats(summon, index).maxHp
            summon.negativeStatusEffects = []
          }
          appendLog(run, HIDDEN_CITY_OF_LAROX_LOGS.heal)
        } else appendLog(run, "Looking around, you didn't find anything of value.")
      } else if (run.areaId === 'LostLands') {
        const result = searchLostLands(Math.random(), Math.random)
        if (result.type === 'item') {
          appendLog(run, result.log)
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else appendLog(run, "Looking around, you didn't find anything of value.")
      } else if (run.areaId === 'TheDesert') {
        const result = searchTheDesert(run.event, Math.random())
        if (result.type === 'item') {
          addStack(run.chest, { itemId: result.itemId, stack: 1 })
          appendLog(run, `Looking around the place, you found 1 ${index.items.get(result.itemId)?.name ?? result.itemId}.`)
        } else if (result.type === 'silence') {
          for (const member of livingParty(state, run)) addStatus(member, { type: 'SILENCE', turnsLeft: 5 })
          appendLog(run, THE_DESERT_LOGS.sandstorm)
        } else if (result.type === 'oasis') {
          for (const member of livingParty(state, run)) {
            member.hp = Math.min(adventurerStats(member, index).maxHp, member.hp + 10)
            member.mana = Math.min(100, member.mana + 10)
          }
          appendLog(run, THE_DESERT_LOGS.oasis)
        } else appendLog(run, THE_DESERT_LOGS.nothing)
      } else {
        for (const member of livingParty(state, run)) {
          if (index.adventurers.has(member.classId)) member.hp = Math.min(adventurerStats(member, index).maxHp, member.hp + 1)
        }
        appendLog(run, 'The party searched the room.')
      }
      if (!livingParty(state, run).length) {
        appendLog(run, 'The party was defeated.')
        run.report.wipes += 1
        action(run, 'RESPAWN')
        break
      }
      run.progress += 1
      run.report.areasCleared += 1
      incrementQuest(state, 'LongMarch', 1)
      action(run, 'ENTER_ROOM')
      break
    }
    case 'RESPAWN':
      for (const uid of run.partyIds) {
        const member = state.adventurers.find((entry) => entry.uid === uid)
        if (member && index.adventurers.has(member.classId)) {
          member.hp = adventurerStats(member, index).maxHp
          member.shield = 0
          member.positiveStatusEffects = []
          member.negativeStatusEffects = []
        }
      }
      run.enemies = []
      run.summons = []
      if (run.areaId === 'TheDesert') run.event = null
      if (run.areaId === 'TheGoldenCity') run.event = null
      if (run.areaId === 'BlackwaterPort') run.event = null
      if (run.areaId === 'ObsidianMines') run.event = { kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 }
      if (run.areaId === 'TheSouthernGrove') run.event = { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 0 }
      if (run.areaId === 'LostLands') run.event = null
      if (index.areas.get(run.areaId)?.areaType === 0 && run.progress < 250) run.progress = 0
      action(run, 'ENTER_ROOM')
      break
    case 'FLEE':
      run.enemies = []
      if (run.areaId === 'BlackwaterPort') run.event = null
      action(run, 'ENTER_ROOM')
      break
    default:
      break
  }
}

function tickRun(state: GameState, run: AreaRun, index: ContentIndex) {
  if (run.action === 'IDLE') return
  run.actionRemaining -= 1
  if (run.actionRemaining <= 0) finishAction(state, run, index)
  for (const enemy of run.enemies) {
    if (!state.seenEnemies.includes(enemy.enemyId)) state.seenEnemies.push(enemy.enemyId)
  }

  const area = index.areas.get(run.areaId)
  for (const unlock of area?.unlocks ?? []) {
    if (run.progress >= unlock.progress && !state.unlockedAreas.includes(unlock.areaGetter)) {
      state.unlockedAreas.push(unlock.areaGetter)
      for (const message of index.messages.values()) {
        if (message.unlockAreaId !== unlock.areaGetter || state.receivedMessages.includes(message.id)) continue
        state.receivedMessages.push(message.id)
        state.unreadMessages.push(message.id)
      }
      appendLog(run, `${index.areas.get(unlock.areaGetter)?.name ?? unlock.areaGetter} has been unlocked.`)
    }
  }
}

export function tickGame(state: GameState, index: ContentIndex, elapsed = 1) {
  refreshDailyRaidTries(state, index)
  refreshMerchantCooldowns(state, index)
  if (state.adventurers.length && localWeekStart(Date.now()) > localWeekStart(state.lastQuestReset)) refreshQuests(state, index)
  const ticks = Math.max(1, Math.min(43_200, elapsed))
  for (let i = 0; i < ticks; i += 1) {
    state.totalTicks += 1
    progressTavernTime(state, index, 1)
    Object.values(state.runs).forEach((run) => tickRun(state, run, index))
    tickWorkshop(state)
    tickMarket(state)
  }
  state.lastAccess = Date.now()
  state.dismissedAdventurers = state.dismissedAdventurers.filter((entry) => Date.now() - entry.dismissedAt < 86_400_000)
}

function tickMarket(state: GameState) {
  let remaining = 1
  while (remaining > 0 && state.marketListings.length > 0) {
    const listing = state.marketListings[0]
    const consumed = Math.min(remaining, listing.remainingSeconds)
    listing.remainingSeconds -= consumed
    remaining -= consumed
    if (listing.remainingSeconds <= 0) {
      state.marketListings.shift()
      state.soldMarketItems.push(listing)
    }
  }
}

export function listMarketItem(state: GameState, index: ContentIndex, itemId: string, amount: number) {
  const item = index.items.get(itemId)
  const stack = Math.trunc(amount)
  if (!item || stack < 1 || Number(item.fields.price ?? 0) < 1 || Boolean(item.fields.notSellable)) return false
  if (state.marketListings.length + state.soldMarketItems.length >= marketListingsCapacity(state.buildings.marketListings, state.permanentUpgrades.UpgradeMarketQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)) return false
  if (!removeStack(state.inventory, itemId, stack)) return false
  const totalSeconds = Math.max(1, marketSaleSeconds(Number(item.fields.price), stack, state.buildings.marketTime, state.permanentUpgrades.UpgradeMarketTime ?? 0, state.purchasedPacks.merchant) + 1)
  state.marketListings.push({ uid: state.nextMarketListingId++, itemId, stack, totalSeconds, remainingSeconds: totalSeconds })
  return true
}

export function cancelMarketListing(state: GameState, uid: number) {
  const listing = state.marketListings.find((entry) => entry.uid === uid)
  if (!listing || !hasStorageSpaceFor(state, [{ itemId: listing.itemId, stack: listing.stack }])) return false
  state.marketListings.splice(state.marketListings.indexOf(listing), 1)
  addToInventory(state, { itemId: listing.itemId, stack: listing.stack })
  return true
}

export function collectMarketSale(state: GameState, index: ContentIndex, uid: number) {
  const listing = state.soldMarketItems.find((entry) => entry.uid === uid)
  const item = listing && index.items.get(listing.itemId)
  if (!listing || !item) return false
  state.soldMarketItems.splice(state.soldMarketItems.indexOf(listing), 1)
  state.money += Number(item.fields.price ?? 0) * listing.stack
  state.achievementStats.soldItems += listing.stack
  return true
}

export function upgradeMarket(state: GameState, kind: 'listings' | 'time') {
  if (kind === 'listings') {
    if (state.buildings.marketListings >= 10) return false
    const price = marketListingsPrice(state.buildings.marketListings)
    if (state.money < price) return false
    state.money -= price
    state.buildings.marketListings += 1
    return true
  }
  if (state.buildings.marketTime >= 25) return false
  const price = marketTimePrice(state.buildings.marketTime)
  if (state.money < price) return false
  state.money -= price
  state.buildings.marketTime += 1
  return true
}

export function promotionChoices(member: AdventurerState, index: ContentIndex) {
  const definition = index.adventurers.get(member.classId)
  if (!definition || member.level < definition.fields.maxLevel || definition.fields.maxLevel >= 45) return []
  return (PROMOTION_PATHS[member.classId] ?? []).filter((id) => index.adventurers.has(id))
}

function resetRunAfterClassChange(state: GameState, member: AdventurerState, index: ContentIndex) {
  if (!member.areaId) return
  const run = state.runs[member.areaId]
  const area = index.areas.get(member.areaId)
  if (!run || !area) {
    member.areaId = null
    return
  }
  if (area.areaType !== 0) {
    retreatRun(state, member.areaId, index)
    return
  }
  run.progress = 0
  run.enemies = []
  run.summons = []
  run.turnOrder = []
  run.turnIndex = 0
  run.event = null
  run.action = 'ENTER_DUNGEON'
  run.actionRemaining = ACTION_TURNS.ENTER_DUNGEON
  run.actionTotal = ACTION_TURNS.ENTER_DUNGEON
}

function changeAdventurerClass(state: GameState, index: ContentIndex, member: AdventurerState, classId: string, ascended: boolean) {
  const target = index.adventurers.get(classId)
  if (!target) return false
  resetRunAfterClassChange(state, member, index)
  member.classId = classId
  member.name = target.name.replaceAll("\\'", "'")
  member.level = 1
  member.xp = 0
  member.mana = Number(target.fields.currentMana ?? 0)
  member.shield = 0
  member.positiveStatusEffects = []
  member.negativeStatusEffects = []
  member.ascended = ascended
  member.hp = adventurerStats(member, index).maxHp
  return true
}

export function promoteAdventurer(state: GameState, index: ContentIndex, uid: number, classId: string) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member || !promotionChoices(member, index).includes(classId)) return false
  return changeAdventurerClass(state, index, member, classId, member.ascended)
}

export function ascendAdventurer(state: GameState, index: ContentIndex, uid: number) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  const definition = member && index.adventurers.get(member.classId)
  if (!member || !definition || member.ascended || member.level < definition.fields.maxLevel || definition.fields.maxLevel < 45) return false
  const weaponType = definition.fields.weaponType?.key ?? ''
  const baseClass = weaponType.includes('bow') ? 'Archer' : weaponType.includes('dagger') ? 'Rogue' : weaponType.includes('staff') ? 'Apprentice' : 'Footman'
  return changeAdventurerClass(state, index, member, baseClass, true)
}

export function selectDoctrine(state: GameState, index: ContentIndex, uid: number, doctrineId: DoctrineId) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member?.ascended || !DOCTRINES[doctrineId]) return false
  if (member.doctrineId && member.doctrineLevels.some((level) => level > 0)) return false
  member.doctrineId = doctrineId
  member.doctrineLevels = Array(DOCTRINES[doctrineId].abilities.length).fill(0)
  member.hp = Math.min(member.hp, adventurerStats(member, index).maxHp)
  return true
}

export function changeDoctrineAbility(state: GameState, index: ContentIndex, uid: number, abilityId: string, delta: 1 | -1) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member?.doctrineId) return false
  const doctrine = DOCTRINES[member.doctrineId]
  const slot = doctrine.abilities.indexOf(abilityId)
  const ability = DOCTRINE_ABILITIES[abilityId]
  if (slot < 0 || !ability) return false
  const current = member.doctrineLevels[slot] ?? 0
  if (delta > 0) {
    const loyaltyLevel = state.loyalty[member.doctrineId]?.level ?? 0
    if (current >= ability.maxLevel || doctrinePointsAvailable(member, index, loyaltyLevel) < ability.cost) return false
    member.doctrineLevels[slot] = current + 1
  } else {
    if (current <= 0) return false
    if (abilityId === 'WEAPON_MASTER' && current === 1) {
      const definition = index.adventurers.get(member.classId)
      const equipped = member.weaponId ? index.items.get(member.weaponId) : undefined
      const projectedMember = { ...member, doctrineLevels: member.doctrineLevels.map((level, index) => index === slot ? 0 : level) }
      if (definition && equipped && !itemMatchesSlot(equipped, definition, 'weapon', projectedMember)
        && !hasStorageSpaceFor(state, [{ itemId: equipped.id, stack: 1 }])) return false
    }
    member.doctrineLevels[slot] = current - 1
    if (abilityId === 'WEAPON_MASTER' && member.doctrineLevels[slot] === 0) {
      const definition = index.adventurers.get(member.classId)
      const equipped = member.weaponId ? index.items.get(member.weaponId) : undefined
      if (definition && equipped && !itemMatchesSlot(equipped, definition, 'weapon', member)) {
        addToInventory(state, { itemId: equipped.id, stack: 1 })
        member.weaponId = defaultWeaponId(definition)
      }
    }
  }
  member.hp = Math.min(member.hp, adventurerStats(member, index).maxHp)
  return true
}

export function resetDoctrine(state: GameState, index: ContentIndex, uid: number) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member?.doctrineId) return false
  member.doctrineId = null
  member.doctrineLevels = []
  member.hp = Math.min(member.hp, adventurerStats(member, index).maxHp)
  return true
}

const PET_ABILITIES: PetAbilityType[] = ['FIGHTER', 'HEALER', 'DECOY', 'OPPORTUNIST', 'MAGIC', 'SAVAGE', 'BRIGHT', 'EXPERIENCE', 'DROPS', 'COUNTERATTACK', 'LIFESTEAL', 'REGENERATION', 'BARRIER']
const PET_FAMILY_FIRST: Record<string, PetAbilityType[]> = {
  Avian: ['DECOY'], Construct: ['MAGIC', 'BRIGHT'], Esoteric: ['EXPERIENCE', 'DROPS'],
  Insect: ['FIGHTER', 'BARRIER'], Reptile: ['SAVAGE', 'OPPORTUNIST'],
  Wild: ['LIFESTEAL', 'COUNTERATTACK'], Wooden: ['REGENERATION', 'HEALER'],
}
const PET_EGGS: Record<string, [string, string, string]> = {
  AvianEgg: ['Dove', 'Owl', 'Eagle'], ConstructEgg: ['Rockling', 'Golem', 'Tesseract'],
  EsotericEgg: ['FloatingEye', 'TentacleTangle', 'ThingFromTheAbyss'], InsectEgg: ['Mosquito', 'Beetle', 'Tarantula'],
  ReptileEgg: ['Lizard', 'TreeFrog', 'Crocodile'], WildEgg: ['Rat', 'Squirrel', 'RedWolf'],
  WoodenEgg: ['FloatingSeed', 'WalkingBush', 'HolyTree'],
}

function rollUniquePetAbility(used: PetAbilityType[], rng = Math.random) {
  const available = PET_ABILITIES.filter((ability) => !used.includes(ability))
  return available[Math.min(available.length - 1, Math.floor(rng() * available.length))]
}

export function hatchPetEgg(state: GameState, index: ContentIndex, eggId: string, rng = Math.random) {
  const species = PET_EGGS[eggId]
  if (!species || state.pets.length >= shelterCapacity(state.buildings.shelter, state.permanentUpgrades.UpgradeShelter ?? 0)) return false
  if (!removeStack(state.inventory, eggId, 1)) return false
  const roll = rng()
  const petId = roll < 0.75 ? species[0] : roll < 0.95 ? species[1] : species[2]
  const definition = index.pets.get(petId)
  if (!definition) {
    addToInventory(state, { itemId: eggId, stack: 1 })
    return false
  }
  const firstPool = PET_FAMILY_FIRST[definition.family] ?? PET_ABILITIES
  const abilities: PetAbilityType[] = [firstPool[Math.min(firstPool.length - 1, Math.floor(rng() * firstPool.length))]]
  abilities.push(rollUniquePetAbility(abilities, rng))
  while (abilities.length < definition.fields.abilityNumber) abilities.push(rollUniquePetAbility(abilities, rng))
  while (abilities.length < 4) abilities.push('EMPTY')
  state.pets.push({ uid: state.nextPetId++, petId, level: 1, food: 0, abilities, favourite: false })
  return true
}

function givePetFood(pet: PetState, amount: number) {
  let remaining = amount
  while (remaining > 0) {
    const required = petFoodToNextLevel(pet.level)
    const used = Math.min(required - pet.food, remaining)
    pet.food += used
    remaining -= used
    if (pet.food >= required) {
      pet.level += 1
      pet.food = 0
    }
  }
}

export function feedPet(state: GameState, index: ContentIndex, petUid: number, foodItemId: string, amount: number) {
  const pet = state.pets.find((entry) => entry.uid === petUid)
  const item = index.items.get(foodItemId)
  const stack = Math.trunc(amount)
  const power = Number(item?.fields.feedPower ?? 0)
  if (!pet || stack < 1 || power < 1 || !removeStack(state.inventory, foodItemId, stack)) return false
  givePetFood(pet, power * stack)
  return true
}

export function mergePet(state: GameState, sourceUid: number, targetUid: number) {
  const source = state.pets.find((entry) => entry.uid === sourceUid)
  const target = state.pets.find((entry) => entry.uid === targetUid)
  if (!source || !target || source === target || (source.level <= 1 && source.food === 0)) return false
  let totalFood = source.food
  for (let level = 1; level < source.level; level += 1) totalFood += petFoodToNextLevel(level)
  givePetFood(target, gameRound(totalFood * 0.8))
  state.pets.splice(state.pets.indexOf(source), 1)
  return true
}

export function releasePet(state: GameState, petUid: number, index?: ContentIndex) {
  const pet = state.pets.find((entry) => entry.uid === petUid)
  if (!pet || ((pet.level > 1 || pet.food > 0) && state.pets.length > 1)) return false
  for (const [areaId, run] of Object.entries(state.runs)) {
    if (!run.finished && run.petUid === petUid) retreatRun(state, areaId, index)
  }
  state.pets.splice(state.pets.indexOf(pet), 1)
  return true
}

export function togglePetFavourite(state: GameState, petUid: number) {
  if (state.buildings.shelterAutofeed < 1) return false
  const pet = state.pets.find((entry) => entry.uid === petUid)
  if (!pet) return false
  pet.favourite = !pet.favourite
  return true
}

export function upgradeShelter(state: GameState, kind: 'capacity' | 'autofeed') {
  if (kind === 'capacity') {
    if (state.buildings.shelter >= 11) return false
    const price = shelterPrice(state.buildings.shelter)
    if (state.money < price) return false
    state.money -= price
    state.buildings.shelter += 1
    return true
  }
  if (state.buildings.shelterAutofeed >= 1) return false
  const price = shelterAutofeedPrice(state.buildings.shelterAutofeed)
  if (state.money < price) return false
  state.money -= price
  state.buildings.shelterAutofeed = 1
  return true
}

function weightedMerchantItem(offers: Array<{ item: string; stack: number; weight: number }>, rng = Math.random) {
  const total = offers.reduce((sum, offer) => sum + offer.weight, 0)
  let roll = rng() * total
  for (const offer of offers) {
    roll -= offer.weight
    if (roll < 0) return offer
  }
  return offers[offers.length - 1]
}

const DUNGEON_ORDER = ['EnchantedForest', 'TheDesert', 'EternalBattlefield', 'TheGoldenCity', 'BlackwaterPort', 'FrostbitePeaks', 'ObsidianMines', 'TheSouthernGrove', 'BarrenWastelands', 'HiddenCityOfLarox', 'LostLands']

function rollQuestRarity(rng = Math.random) {
  const roll = rng()
  return roll < 0.7 ? 1 : roll < 0.9 ? 2 : roll < 0.97 ? 3 : 4
}

export function refreshQuests(state: GameState, index: ContentIndex, rng = Math.random) {
  if (!state.adventurers.length || !index.quests.size) return false
  const difficulty = Math.max(1, DUNGEON_ORDER.filter((id) => state.unlockedAreas.includes(id)).length)
  const pool = [...index.quests.values()].filter((quest) => quest.minimumDifficulty <= difficulty)
  const selected = new Set<string>()
  const result: GameState['activeQuests'] = []
  const extract = (category: DoctrineId | 'King', amount: number) => {
    for (let count = 0; count < amount; count += 1) {
      const categoryPool = pool.filter((quest) => !selected.has(quest.id)
        && (category === 'King' || quest.doctrines.includes(category)))
      const rarity = rollQuestRarity(rng)
      const matching = categoryPool.filter((quest) => quest.defaultRarity === rarity)
      const globalPool = pool.filter((quest) => !selected.has(quest.id))
      const globalMatching = globalPool.filter((quest) => quest.defaultRarity === rarity)
      const candidates = matching.length ? matching : globalMatching.length ? globalMatching : globalPool
      if (!candidates.length) return
      const definition = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))]
      selected.add(definition.id)
      if (definition.id === 'BotchedRitual') selected.add('EndlessAgony')
      if (definition.id === 'EndlessAgony') selected.add('BotchedRitual')
      result.push({
        id: definition.id,
        category,
        rarity,
        progress: 0,
        target: definition.targets[Math.min(definition.targets.length - 1, difficulty - 1)],
      })
    }
  }
  const doctrineCounts = state.adventurers.reduce<Partial<Record<DoctrineId, number>>>((counts, member) => {
    if (member.doctrineId && state.loyalty[member.doctrineId].level < 10) counts[member.doctrineId] = (counts[member.doctrineId] ?? 0) + 1
    return counts
  }, {})
  Object.entries(doctrineCounts).forEach(([id, amount]) => extract(id as DoctrineId, amount ?? 0))
  extract('King', 5)
  state.activeQuests = result.sort((left, right) => right.rarity - left.rarity)
  state.lastQuestReset = Date.now()
  state.questsRefreshed = false
  return true
}

export function questRefreshPrice(state: GameState) {
  const hasUnmaxedLoyalty = Object.values(state.loyalty).some((loyalty) => loyalty.level < 10)
  if (!hasUnmaxedLoyalty) return 100
  const assigned = state.adventurers.filter((member) => member.doctrineId).length
  return Math.min(250, assigned * 10 + 100)
}

export function buyQuestRefresh(state: GameState, index: ContentIndex, rng = Math.random) {
  if (state.questsRefreshed) return false
  const price = questRefreshPrice(state)
  if (state.gems < price || !refreshQuests(state, index, rng)) return false
  state.gems -= price
  state.questsRefreshed = true
  return true
}

export function incrementQuest(state: GameState, id: string, amount: number, assignValue = false) {
  if (amount <= 0) return
  const quest = state.activeQuests.find((entry) => entry.id === id)
  if (!quest || quest.progress >= quest.target) return
  quest.progress = Math.min(quest.target, assignValue ? amount : quest.progress + amount)
}

export function claimQuest(state: GameState, id: string) {
  const quest = state.activeQuests.find((entry) => entry.id === id)
  if (!quest || quest.progress < quest.target) return false
  const reward = quest.rarity === 1 ? 1 : quest.rarity === 2 ? 2 : quest.rarity === 3 ? 3 : 5
  if (quest.category === 'King') {
    state.gems += quest.rarity === 1 ? 10 : quest.rarity === 2 ? 20 : quest.rarity === 3 ? 40 : 100
  } else {
    const loyalty = state.loyalty[quest.category]
    loyalty.stars += reward
    while (loyalty.level < 10 && loyalty.stars >= loyalty.level * 3 + 4) {
      loyalty.stars -= loyalty.level * 3 + 4
      loyalty.level += 1
    }
  }
  state.activeQuests.splice(state.activeQuests.indexOf(quest), 1)
  state.achievementStats.claimedQuests += 1
  return true
}

export function refreshMerchantRegular(state: GameState, index: ContentIndex, rng = Math.random) {
  const areas = DUNGEON_ORDER.filter((id) => state.unlockedAreas.includes(id)).slice(-4)
  state.merchantRegularStock = areas.flatMap((id) => {
    const offer = weightedMerchantItem(index.areas.get(id)?.regularMerchantOffers ?? [], rng)
    const item = offer && index.items.get(offer.item)
    if (!offer || !item) return []
    return [{ uid: state.nextMerchantOfferId++, itemId: offer.item, stack: offer.stack, price: Number(item.fields.price ?? 0) * offer.stack * 10, gems: false, special: false }]
  })
}

export function refreshMerchantSpecial(state: GameState, index: ContentIndex, rng = Math.random) {
  const unlocked = DUNGEON_ORDER.filter((id) => state.unlockedAreas.includes(id))
  const area = index.areas.get(unlocked[unlocked.length - 1] ?? 'EnchantedForest')
  const rolled = weightedMerchantItem(area?.specialMerchantOffers ?? [], rng)
  const offers = rolled ? [{ uid: state.nextMerchantOfferId++, itemId: rolled.item, stack: rolled.stack, price: 50 + unlocked.length * 5, gems: true, special: true }] : []
  if (rng() < 0.55 && index.items.has('Aegis')) offers.push({ uid: state.nextMerchantOfferId++, itemId: 'Aegis', stack: 1, price: 1000, gems: true, special: true })
  if (index.items.has('ScarletStrand')) offers.push({ uid: state.nextMerchantOfferId++, itemId: 'ScarletStrand', stack: 1, price: 650, gems: true, special: true })
  for (const itemId of missingUniqueDrops(state, index)) {
    offers.push({ uid: state.nextMerchantOfferId++, itemId, stack: 1, price: 1, gems: true, special: true })
  }
  const potions = [
    ['PotionOfConstitution', 80], ['PotionOfDexterity', 80], ['PotionOfIntelligence', 80], ['PotionOfHealth', 80],
    ['PotionOfDefense', 120], ['PotionOfMagicDefense', 100], ['PotionOfPrecision', 80], ['PotionOfViciousness', 80],
    ['PotionOfDarkness', 80], ['PotionOfImmunity', 70], ['PotionOfAgility', 80],
  ] as const
  for (let i = 0; i < 3; i += 1) {
    const potion = potions[Math.min(potions.length - 1, Math.floor(rng() * potions.length))]
    if (index.items.has(potion[0])) offers.push({ uid: state.nextMerchantOfferId++, itemId: potion[0], stack: 1, price: potion[1], gems: true, special: true })
  }
  const foods = [['GlazedDonut', 50], ['GourmetIcecream', 100], ['Maxxiburger', 200], ['Cheesecake', 400], ['Ambrosia', 800], ['CeremonialCake', 1500]] as const
  const availableFoods = [...foods]
  for (let i = 0; i < 3 && availableFoods.length > 0; i += 1) {
    const food = availableFoods.splice(Math.min(availableFoods.length - 1, Math.floor(rng() * availableFoods.length)), 1)[0]
    if (index.items.has(food[0])) offers.push({ uid: state.nextMerchantOfferId++, itemId: food[0], stack: 1, price: food[1], gems: true, special: true })
  }
  const upgradeCaps: Record<string, number> = { UpgradeMarketQueue: 1, UpgradeMarketTime: 2, UpgradeQuarters: 1, UpgradeShelter: 1, UpgradeStorage: 10, UpgradeTavernCapacity: 1, UpgradeTavernTime: 2, UpgradeWorkshopQueue: 1, UpgradeWorkshopTime: 2 }
  const availableUpgrades = Object.entries(upgradeCaps).filter(([id, cap]) => index.items.has(id) && (state.permanentUpgrades[id] ?? 0) < cap)
  if ((state.permanentUpgrades.UpgradeStorage ?? 0) < 6) {
    const storage = availableUpgrades.find(([id]) => id === 'UpgradeStorage')
    if (storage) offers.push({ uid: state.nextMerchantOfferId++, itemId: storage[0], stack: 1, price: Number(index.items.get(storage[0])?.fields.gemPrice ?? 80), gems: true, special: true })
  }
  const randomUpgrades = availableUpgrades.filter(([id]) => id !== 'UpgradeStorage')
  while (randomUpgrades.length > 0 && offers.filter((offer) => offer.itemId.startsWith('Upgrade')).length < 3) {
    const [id] = randomUpgrades.splice(Math.min(randomUpgrades.length - 1, Math.floor(rng() * randomUpgrades.length)), 1)[0]
    offers.push({ uid: state.nextMerchantOfferId++, itemId: id, stack: 1, price: Number(index.items.get(id)?.fields.gemPrice ?? 0), gems: true, special: true })
  }
  state.merchantSpecialStock = offers
}

export function buyMerchantOffer(state: GameState, offerUid: number) {
  const list = state.merchantRegularStock.some((offer) => offer.uid === offerUid) ? state.merchantRegularStock : state.merchantSpecialStock
  const offer = list.find((entry) => entry.uid === offerUid)
  if (!offer) return false
  if (offer.gems ? state.gems < offer.price : state.money < offer.price) return false
  if (!offer.itemId.startsWith('Upgrade') && !hasStorageSpaceFor(state, [{ itemId: offer.itemId, stack: offer.stack }])) return false
  if (offer.gems) state.gems -= offer.price
  else state.money -= offer.price
  if (offer.itemId.startsWith('Upgrade')) state.permanentUpgrades[offer.itemId] = (state.permanentUpgrades[offer.itemId] ?? 0) + 1
  else {
    addToInventory(state, { itemId: offer.itemId, stack: offer.stack })
  }
  list.splice(list.indexOf(offer), 1)
  return true
}

export const PACK_GEM_COST = { starter: 700, merchant: 3_000 } as const

export function buyPack(state: GameState, pack: keyof typeof PACK_GEM_COST) {
  if (state.purchasedPacks[pack] || state.gems < PACK_GEM_COST[pack]) return false
  state.gems -= PACK_GEM_COST[pack]
  state.purchasedPacks[pack] = true
  return true
}

function localWeekStart(timestamp: number) {
  const date = new Date(timestamp)
  date.setDate(date.getDate() - date.getDay())
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function refreshMerchantCooldowns(state: GameState, index: ContentIndex, now = Date.now(), rng = Math.random) {
  const today = localDayStart(now)
  const week = localWeekStart(now)
  let changed = false
  if (today > state.lastMerchantRegularReset) {
    refreshMerchantRegular(state, index, rng)
    state.lastMerchantRegularReset = today
    changed = true
  }
  if (week > state.lastMerchantSpecialReset) {
    refreshMerchantSpecial(state, index, rng)
    state.lastMerchantSpecialReset = week
    changed = true
  }
  return changed
}

export function hireGuest(state: GameState, guestUid: number, index?: ContentIndex) {
  if (state.adventurers.length >= buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)) return false
  const guest = state.tavernGuests.find((entry) => entry.uid === guestUid)
  if (!guest) return false
  state.tavernGuests = state.tavernGuests.filter((entry) => entry.uid !== guestUid)
  state.adventurers.push(guest)
  if (index && state.activeQuests.length === 0 && !state.questsRefreshed) refreshQuests(state, index)
  if (state.tutorialStep === 1 || state.tutorialStep === 6) {
    const previousStep = state.tutorialStep
    state.tutorialStep += 1
    if (previousStep === 6 && index) progressTavernTime(state, index, 28_800)
  }
  return true
}

export function setTavernLocked(state: GameState, locked: boolean) {
  state.tavernLocked = locked
}

export function markTavernGuestsSeen(state: GameState) {
  state.tavernGuests.forEach((guest) => { guest.seen = true })
}

export function upgradeTavern(state: GameState, kind: 'capacity' | 'time') {
  if (kind === 'capacity') {
    if (state.buildings.tavernCapacity >= 7) return false
    const price = tavernCapacityPrice(state.buildings.tavernCapacity)
    if (state.money < price) return false
    state.money -= price
    state.buildings.tavernCapacity += 1
    return true
  }
  if (state.buildings.tavernTime >= 20) return false
  const price = tavernTimePrice(state.buildings.tavernTime)
  if (state.money < price) return false
  state.money -= price
  state.buildings.tavernTime += 1
  state.nextTavernVisit = Math.trunc(state.nextTavernVisit * 0.9)
  return true
}

export function upgradeFacility(state: GameState, kind: 'quarters' | 'storage' | 'workshopQueue' | 'workshopTime') {
  const config = kind === 'quarters'
    ? { level: state.buildings.quarters, max: 23, price: quartersPrice(state.buildings.quarters) }
    : kind === 'storage'
      ? { level: state.buildings.storage, max: 80, price: storagePrice(state.buildings.storage) }
      : kind === 'workshopQueue'
        ? { level: state.buildings.workshopQueue, max: 10, price: workshopQueuePrice(state.buildings.workshopQueue) }
        : { level: state.buildings.workshopTime, max: 25, price: workshopTimePrice(state.buildings.workshopTime) }
  if (config.level >= config.max || state.money < config.price) return false
  state.money -= config.price
  if (kind === 'quarters') state.buildings.quarters += 1
  else if (kind === 'storage') state.buildings.storage += 1
  else if (kind === 'workshopQueue') state.buildings.workshopQueue += 1
  else state.buildings.workshopTime += 1
  return true
}

const POTION_TYPES: Record<string, number> = {
  PotionOfConstitution: 0,
  PotionOfDexterity: 1,
  PotionOfIntelligence: 2,
  PotionOfHealth: 3,
  PotionOfDefense: 4,
  PotionOfMagicDefense: 5,
  PotionOfPrecision: 6,
  PotionOfViciousness: 7,
  PotionOfDarkness: 8,
  PotionOfImmunity: 9,
  PotionOfAgility: 10,
}

export const RARE_TRAITS = ['EMPATHETIC', 'GIFTED', 'INTIMIDATING', 'FOCUSED', 'DRAGON_BLOOD', 'CURSED', 'REACTIVE', 'NOCTURNAL', 'MINDFUL', 'TROLL_BLOOD', 'NIMBLE', 'RUTHLESS', 'BLESSED', 'ALERT'] as const

const POTION_LIMITS: Record<string, number[]> = {
  type_sword: [9, 3, 1, 10, 5, 5, 2, 2, 3, 15, 3],
  type_bow: [4, 10, 4, 5, 3, 3, 6, 6, 4, 3, 6],
  type_dagger: [7, 7, 4, 5, 3, 3, 8, 4, 6, 1, 6],
  type_staff: [3, 3, 14, 3, 1, 5, 2, 6, 4, 10, 3],
}

export const potionTypeForItem = (itemId: string) => POTION_TYPES[itemId]

export function potionLimit(member: AdventurerState, index: ContentIndex, potionType: number) {
  const definition = index.adventurers.get(member.classId)
  const limits = POTION_LIMITS[definition?.fields.weaponType?.key ?? '']
  if (!definition || !limits) return 0
  const standard = definition.fields.maxLevel * (1 / 35)
  if (!member.ascended) return Math.trunc(limits[potionType] * standard)
  const preAscension = limits[potionType] * 45 / 35
  const postFactor = potionType === 4 || potionType === 5
    ? 1
    : definition.fields.maxLevel / 35 * (potionType >= 6 ? 0.5 : 1)
  const postAscension = (potionType === 4 || potionType === 5 ? 1 : limits[potionType]) * postFactor
  return Math.trunc(preAscension + postAscension)
}

export function consumePotion(state: GameState, index: ContentIndex, uid: number, itemId: string) {
  const potionType = POTION_TYPES[itemId]
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (potionType === undefined || !member || (member.potionsDrank[potionType] ?? 0) >= potionLimit(member, index, potionType)) return false
  if (!removeStack(state.inventory, itemId, 1)) return false
  member.potionsDrank[potionType] = (member.potionsDrank[potionType] ?? 0) + 1
  return true
}

export function openGeodes(state: GameState, rng = Math.random) {
  const stack = state.inventory.find((entry) => entry.itemId === 'Geode')?.stack ?? 0
  if (stack < 1) return 0
  const gems = Array.from({ length: stack }, () => rng() < 0.01 ? 100 : 1).reduce((sum, amount) => sum + amount, 0)
  removeStack(state.inventory, 'Geode', stack)
  state.gems += gems
  incrementQuest(state, 'Paleontologist', stack)
  return gems
}

export function canConsumeSpecial(member: AdventurerState, itemId: string) {
  if (itemId === 'Intercession') return !member.ascended
  if (itemId === 'PotionOfClumsiness') return (member.potionsDrank?.[10] ?? 0) > 0
  return itemId === 'PotionOfRejuvenation'
}

export function consumeSpecial(state: GameState, index: ContentIndex, uid: number, itemId: string) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member || !canConsumeSpecial(member, itemId) || !state.inventory.some((entry) => entry.itemId === itemId && entry.stack > 0)) return false
  if (itemId === 'Intercession') {
    member.ascended = true
  } else if (itemId === 'PotionOfClumsiness') {
    member.potionsDrank[10] = 0
  } else {
    const weaponType = index.adventurers.get(member.classId)?.fields.weaponType?.key ?? ''
    const baseClass = weaponType.includes('bow') ? 'Archer' : weaponType.includes('dagger') ? 'Rogue' : weaponType.includes('staff') ? 'Apprentice' : 'Footman'
    if (!changeAdventurerClass(state, index, member, baseClass, member.ascended)) return false
  }
  removeStack(state.inventory, itemId, 1)
  return true
}

export function changeRareTrait(state: GameState, uid: number, trait: string, itemId: 'Evo23Vial' | 'Evo23Vial2') {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member || !RARE_TRAITS.includes(trait as typeof RARE_TRAITS[number]) || member.rareTrait === trait) return false
  if (!removeStack(state.inventory, itemId, 1)) return false
  member.rareTrait = trait
  return true
}

export function moveAdventurer(state: GameState, uid: number, delta: -1 | 1) {
  const from = state.adventurers.findIndex((entry) => entry.uid === uid)
  const to = from + delta
  if (from < 0 || to < 0 || to >= state.adventurers.length) return false
  const [member] = state.adventurers.splice(from, 1)
  state.adventurers.splice(to, 0, member)
  return true
}

export function dismissAdventurer(state: GameState, uid: number, now = Date.now()) {
  const member = state.adventurers.find((entry) => entry.uid === uid)
  if (!member || member.areaId) return false
  state.adventurers = state.adventurers.filter((entry) => entry.uid !== uid)
  state.dismissedAdventurers.push({ member, dismissedAt: now })
  return true
}

export function recallAdventurer(state: GameState, uid: number, now = Date.now()) {
  const dismissed = state.dismissedAdventurers.find((entry) => entry.member.uid === uid)
  const capacity = buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)
  if (!dismissed || now - dismissed.dismissedAt >= 86_400_000 || state.adventurers.length >= capacity) return false
  state.dismissedAdventurers = state.dismissedAdventurers.filter((entry) => entry.member.uid !== uid)
  state.adventurers.push(dismissed.member)
  return true
}

export function equipItem(
  state: GameState,
  index: ContentIndex,
  adventurerUid: number,
  slot: EquipmentSlot,
  itemId: string | null,
) {
  const member = state.adventurers.find((entry) => entry.uid === adventurerUid)
  const definition = member && index.adventurers.get(member.classId)
  if (!member || !definition) return false
  const oldItemId = equipmentItemId(member, slot)
  const defaultId = defaultWeaponId(definition)

  if (itemId === null) {
    if (!oldItemId || (slot === 'weapon' && oldItemId === defaultId)) return false
    if (!hasStorageSpaceFor(state, [{ itemId: oldItemId, stack: 1 }])) return false
    addToInventory(state, { itemId: oldItemId, stack: 1 })
    setEquipmentItemId(member, slot, slot === 'weapon' ? defaultId : null)
    member.hp = Math.min(member.hp, adventurerStats(member, index).maxHp)
    return true
  }

  const candidate = index.items.get(itemId)
  if (!candidate || !itemMatchesSlot(candidate, definition, slot, member)) return false
  const projectedInventory = state.inventory.map((stack) => ({ ...stack }))
  if (!removeStack(projectedInventory, itemId, 1)) return false
  if (oldItemId && !(slot === 'weapon' && oldItemId === defaultId)) addStack(projectedInventory, { itemId: oldItemId, stack: 1 })
  const storageCapacity = buildingCapacity('storage', state.buildings.storage, state.permanentUpgrades.UpgradeStorage ?? 0, state.purchasedPacks)
  if (projectedInventory.length > storageCapacity) return false
  if (!removeStack(state.inventory, itemId, 1)) return false
  if (oldItemId && !(slot === 'weapon' && oldItemId === defaultId)) addToInventory(state, { itemId: oldItemId, stack: 1 })
  setEquipmentItemId(member, slot, itemId)
  member.hp = Math.min(member.hp, adventurerStats(member, index).maxHp)

  if (state.tutorialStep === 5 && itemId === 'CopperArmor') {
    state.tutorialStep = 6
    progressTavernTime(state, index, 28_800)
  }
  return true
}

export function startRun(state: GameState, areaId: string, partyIds: number[], index?: ContentIndex, petUid: number | null = null) {
  if (!state.unlockedAreas.includes(areaId) || partyIds.length === 0) return false
  const previous = state.runs[areaId]
  if (previous && !previous.finished && previous.partyIds.length > 0) return false
  const area = index?.areas.get(areaId)
  const isRaid = area ? area.areaType !== 0 : areaId === 'TheDreadfulAscent'
  if (isRaid && !raidTryAvailable(state, areaId)) return false
  const teamLimit = areaTeamSize(area)
  const uniqueParty = [...new Set(partyIds)]
  const validParty = uniqueParty
    .filter((uid) => state.adventurers.some((entry) => entry.uid === uid && !entry.areaId))
    .slice(0, teamLimit)
  if (!validParty.length) return false
  const petInUse = Object.values(state.runs).some((run) => !run.finished && run.partyIds.length > 0 && run.petUid === petUid)
  const validPetUid = petUid !== null && state.pets.some((pet) => pet.uid === petUid) && !petInUse ? petUid : null
  if (isRaid) state.raidTries[areaId] = false
  validParty.forEach((uid) => {
    const member = state.adventurers.find((entry) => entry.uid === uid)
    if (!member) return
    member.areaId = areaId
    if (index && index.adventurers.has(member.classId)) member.hp = adventurerStats(member, index).maxHp
    member.mana = 0
    member.shield = 0
    member.positiveStatusEffects = []
    member.negativeStatusEffects = []
  })
  state.runs[areaId] = {
    areaId,
    action: 'ENTER_DUNGEON',
    actionRemaining: ACTION_TURNS.ENTER_DUNGEON,
    actionTotal: ACTION_TURNS.ENTER_DUNGEON,
    progress: isRaid ? 0 : previous?.progress ?? 0,
    maxProgress: previous?.maxProgress ?? previous?.progress ?? 0,
    finished: false,
    localDarkness: 0,
    event: null,
    partyIds: validParty,
    petUid: validPetUid,
    summons: [],
    enemies: [],
    turnOrder: [],
    turnIndex: 0,
    chest: previous?.chest ?? [],
    logs: ['The expedition is preparing to enter the dungeon.'],
    report: { startedAt: Date.now(), areasCleared: 0, wipes: 0, xpEarned: 0, xpLost: 0, enemiesKilled: {} },
  }
  return true
}

export function refillRaidTry(state: GameState, areaId: string, index: ContentIndex) {
  const area = index.areas.get(areaId)
  const run = state.runs[areaId]
  if (!area || area.areaType === 0 || raidTryAvailable(state, areaId)) return false
  if (run && !run.finished && run.partyIds.length > 0) return false
  const cost = raidTryCost(areaId)
  if (state.gems < cost) return false
  state.gems -= cost
  state.raidTries[areaId] = true
  return true
}

export function retreatRun(state: GameState, areaId: string, index?: ContentIndex) {
  const run = state.runs[areaId]
  if (!run) return
  const area = index?.areas.get(areaId)
  if (area && area.areaType !== 0) {
    finishRaidRun(state, run, 'retreat')
    return
  }
  // Dungeon loot belongs to the player as soon as it reaches the chest.
  // Collect it before deleting the run; if Storage is full, retain a finished
  // run so the chest remains available instead of discarding its contents.
  if (run.chest.length > 0 && !collectChest(state, areaId, index)) {
    run.progress = 0
    run.maxProgress = 0
    run.localDarkness = 0
    finishRaidRun(state, run, 'retreat')
    return
  }
  run.partyIds.forEach((uid) => {
    const member = state.adventurers.find((entry) => entry.uid === uid)
    if (member) member.areaId = null
  })
  delete state.runs[areaId]
}

export function collectChest(state: GameState, areaId: string, index?: ContentIndex) {
  const run = state.runs[areaId]
  if (!run) return false
  const favouritePets = state.buildings.shelterAutofeed > 0
    ? state.pets.filter((pet) => pet.favourite)
    : []
  const storedStacks = run.chest.filter((stack) => {
    const feedPower = Number(index?.items.get(stack.itemId)?.fields.feedPower ?? 0)
    return !(favouritePets.length > 0 && feedPower > 0)
  })
  if (!hasStorageSpaceFor(state, storedStacks)) return false
  let totalFeedPower = 0
  run.chest.forEach((stack) => {
    const feedPower = Number(index?.items.get(stack.itemId)?.fields.feedPower ?? 0)
    if (favouritePets.length > 0 && feedPower > 0) totalFeedPower += feedPower * stack.stack
    else {
      addToInventory(state, stack)
    }
  })
  if (totalFeedPower > 0) {
    const share = Math.trunc(totalFeedPower / favouritePets.length)
    favouritePets.forEach((pet) => givePetFood(pet, share))
  }
  run.chest = []
  return true
}

export function queueWorkshopRecipe(state: GameState, index: ContentIndex, recipeId: string, amount = 1) {
  const recipe = recipeById.get(recipeId)
  const result = recipe && index.items.get(recipe.result.itemId)
  const batches = Math.trunc(amount)
  if (!recipe || !result || !state.knownRecipes.includes(recipeId) || batches < 1 || maxCraftable(state, recipe) < batches) return false
  const capacity = workshopQueueCapacity(state.buildings.workshopQueue, state.permanentUpgrades.UpgradeWorkshopQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)
  if (state.workshopQueue.length + state.completedWorkshopItems.length >= capacity) return false
  recipe.ingredients.forEach((ingredient) => removeStack(state.inventory, ingredient.itemId, ingredient.stack * batches))
  const resultStack = recipe.result.stack * batches
  const seconds = workshopSeconds(state, result.fields.price ?? 1, resultStack, recipe.id)
  state.workshopQueue.push({
    uid: state.nextWorkshopJobId++,
    recipeId: recipe.id,
    itemId: recipe.result.itemId,
    stack: resultStack,
    totalSeconds: seconds,
    remainingSeconds: seconds,
  })
  return true
}

export function collectWorkshopJob(state: GameState, uid: number, index?: ContentIndex) {
  const job = state.completedWorkshopItems.find((entry) => entry.uid === uid)
  if (!job || !hasStorageSpaceFor(state, [{ itemId: job.itemId, stack: job.stack }])) return false
  state.completedWorkshopItems = state.completedWorkshopItems.filter((entry) => entry.uid !== uid)
  addToInventory(state, { itemId: job.itemId, stack: job.stack })
  state.achievementStats.craftedItems += job.stack
  incrementQuest(state, 'MasterCrafter', Math.trunc(Number(index?.items.get(job.itemId)?.fields.price ?? 0) * 0.01), true)
  if (state.tutorialStep === 3 && job.itemId === 'Leather') {
    state.tutorialStep = 4
    addToInventory(state, { itemId: 'CopperIngot', stack: 2 })
  } else if (state.tutorialStep === 4 && job.itemId === 'CopperArmor') {
    state.tutorialStep = 5
  }
  return true
}

export function cancelWorkshopJob(state: GameState, uid: number) {
  const job = state.workshopQueue.find((entry) => entry.uid === uid)
  const recipe = job && recipeById.get(job.recipeId)
  const batches = job && recipe ? Math.max(1, Math.trunc(job.stack / recipe.result.stack)) : 0
  const refund = recipe?.ingredients.map((ingredient) => ({ itemId: ingredient.itemId, stack: ingredient.stack * batches })) ?? []
  if (!job || !recipe || !hasStorageSpaceFor(state, refund)) return false
  state.workshopQueue = state.workshopQueue.filter((entry) => entry.uid !== uid)
  refund.forEach((ingredient) => addToInventory(state, ingredient))
  return true
}
