export type ScreenId = 'headquarters' | 'adventurers' | 'dungeons' | 'raids'
export type Language = 'en' | 'vi'
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'

export type StatusEffectType =
  | 'TAUNT'
  | 'DEFENSIVE_STANCE'
  | 'STUN'
  | 'STUN_NOT_CLEANSABLE'
  | 'SILENCE'
  | 'ABLAZE'
  | 'POISON'
  | 'REGENERATION'
  | 'LESSER_CURSE'
  | 'CURSE'
  | 'GREATER_CURSE'
  | 'OMINOUS_CURSE'
  | 'ABHORRENT_CURSE'
  | 'BLEED'
  | 'DELIRIUM'
  | 'FRENZY'
  | 'ANOINTED'
  | 'SKELETON_KEY'
  | 'FEEBLE_TETHER'
  | 'INSPIRE'
  | 'EXALT'
  | 'PETRIFY'
  | 'FALSE_LIFE'
  | 'TERRIFY'
  | 'FROZEN'

export interface StatusEffectState {
  type: StatusEffectType
  turnsLeft: number
  causeKey?: string
  potency?: number
}

export interface ConfiguredStatusEffect {
  statusEffect?: {
    type?: StatusEffectType
    turns?: number
    turnsLeft?: number
    probability?: number
  }
}

export type ActionType =
  | 'IDLE'
  | 'ENTER_DUNGEON'
  | 'ENTER_ROOM'
  | 'FIGHT'
  | 'LOOT'
  | 'SEARCH'
  | 'RESPAWN'
  | 'FLEE'

export interface AdventurerDefinition {
  id: string
  name: string
  description: string
  imageKey: string
  statusImmunities?: StatusEffectType[]
  fields: {
    maxLevel: number
    currentMana?: number
    baseMaxHp: number
    baseConstitution: number
    baseIntelligence: number
    baseDexterity: number
    baseDefense: number
    baseMagicDefense: number
    activeSkill?: string
    passiveSkill?: string
    healer?: boolean
    cleanser?: boolean
    alwaysHits?: boolean
    threat?: number
    counterattack?: number
    retaliationPhysicalDamage?: number
    retaliationMagicalDamage?: number
    baseLifesteal?: number
    flatDodgeChance?: number
    immunityToStatus?: number
    regeneration?: number
    criticalDamage?: number
    flying?: boolean
    initiative?: boolean
    poisonBonus?: number
    onFireBonusDamage?: number
    freezeBonusDamage?: number
    regenerationBonus?: number
    maxOverheal?: number
    darknessDamageAmplification?: number
    darknessReduction?: number
    nightVision?: boolean
    saboteur?: boolean
    stunChanceOnLowerHp?: number
    healsMinionBound?: boolean
    moreDamageWhenHalfLife?: boolean
    moreDamageDealtAndTaken?: boolean
    forcesTargetToCounterattack?: boolean
    addsDefensesToRetaliate?: boolean
    increaseHealingAgainst?: { key?: string; value?: number }
    onTargetHit?: ConfiguredStatusEffect
    onHit?: ConfiguredStatusEffect[] | { value?: ConfiguredStatusEffect[] }
    onSelfHit?: ConfiguredStatusEffect
    onDeathEffectsOnAllies?: ConfiguredStatusEffect | ConfiguredStatusEffect[]
    onDeathEffectsOnEnemies?: ConfiguredStatusEffect | ConfiguredStatusEffect[]
    endOfTurnAction?: string
    endOfTurnActions?: { repeat?: number; value?: string }
    weaponType?: { key?: string }
    armorType?: { key?: string }
  }
}

export interface EnemyDefinition {
  id: string
  name: string
  description: string
  imageKey: string
  statusImmunities?: StatusEffectType[]
  minDamage: number
  maxDamage: number
  magic?: boolean
  ranged?: boolean
  drops: Array<{ item: string; stack: number; weight: number }>
  fields: {
    baseMaxHp: number
    baseConstitution: number
    baseIntelligence: number
    baseDexterity: number
    baseDefense: number
    baseMagicDefense: number
    team?: number
    expGiven: number
    moreDamageWhenHalfLife?: boolean
    moreDamageDealtAndTaken?: boolean
    forcesTargetToCounterattack?: boolean
    addsDefensesToRetaliate?: boolean
    currentMana?: number
    activeSkill?: string
    passiveSkill?: string
    healer?: boolean
    cleanser?: boolean
    alwaysHits?: boolean
    threat?: number
    counterattack?: number
    retaliationPhysicalDamage?: number
    retaliationMagicalDamage?: number
    baseLifesteal?: number
    flatDodgeChance?: number
    immunityToStatus?: number
    regeneration?: number
    criticalDamage?: number
    flying?: boolean
    initiative?: boolean
    poisonBonus?: number
    onFireBonusDamage?: number
    freezeBonusDamage?: number
    regenerationBonus?: number
    maxOverheal?: number
    darknessDamageAmplification?: number
    darknessReduction?: number
    nightVision?: boolean
    stunChanceOnLowerHp?: number
    healsMinionBound?: boolean
    increaseHealingAgainst?: { key?: string; value?: number }
    onTargetHit?: ConfiguredStatusEffect
    onHit?: ConfiguredStatusEffect[] | { value?: ConfiguredStatusEffect[] }
    onSelfHit?: ConfiguredStatusEffect
    onDeathEffectsOnAllies?: ConfiguredStatusEffect | ConfiguredStatusEffect[]
    onDeathEffectsOnEnemies?: ConfiguredStatusEffect | ConfiguredStatusEffect[]
    endOfTurnAction?: string
    endOfTurnActions?: { repeat?: number; value?: string }
  }
}

export interface AreaDefinition {
  id: string
  name: string
  areaType: number
  maxTeamSize?: number | null
  darkness?: number | {
    runtimeFormula: 'progressOffset' | 'progressEquals'
    offset?: number
    progress?: number
    whenTrue?: number
    whenFalse?: number
  }
  enemies: string[]
  encounterRosters: Array<{ enemies: string[] }>
  unlocks: Array<{ areaGetter: string; progress: number }>
  summaryImageKey: string
  detailImageKey: string
  regularMerchantOffers?: Array<{ item: string; stack: number; weight: number }>
  specialMerchantOffers?: Array<{ item: string; stack: number; weight: number }>
}

export interface ItemDefinition {
  id: string
  name: string
  description: string
  imageKey: string
  type: string
  fields: {
    price?: number
    maxHp?: number
    constitution?: number
    intelligence?: number
    dexterity?: number
    defense?: number
    magicDefense?: number
    idEffect?: { key?: string }
    [key: string]: unknown
  }
}

export interface PetDefinition {
  id: string
  family: string
  name: string
  description: string
  imageKey: string
  fields: { abilityNumber: number }
}

export type PetAbilityType = 'EMPTY' | 'FIGHTER' | 'HEALER' | 'DECOY' | 'OPPORTUNIST' | 'MAGIC' | 'SAVAGE' | 'BRIGHT' | 'EXPERIENCE' | 'DROPS' | 'COUNTERATTACK' | 'LIFESTEAL' | 'REGENERATION' | 'BARRIER'

export interface PetState {
  uid: number
  petId: string
  level: number
  food: number
  abilities: PetAbilityType[]
  favourite: boolean
}

export type DoctrineId = 'Affliction' | 'Control' | 'Fortitude' | 'Grace' | 'Illusion' | 'Knowledge' | 'Ruin' | 'War'

export interface LoyaltyProgress {
  level: number
  stars: number
}

export interface QuestDefinition {
  id: string
  name: string
  description: string
  defaultRarity: number
  minimumDifficulty: number
  targets: number[]
  doctrines: DoctrineId[]
}

export interface QuestState {
  id: string
  category: DoctrineId | 'King'
  rarity: number
  progress: number
  target: number
}

export interface KingMessageDefinition {
  id: number
  title: string
  body: string
  unlockAreaId: string | null
}

export interface GameContent {
  adventurers: AdventurerDefinition[]
  enemies: EnemyDefinition[]
  areas: AreaDefinition[]
  items: ItemDefinition[]
  pets?: PetDefinition[]
  quests?: QuestDefinition[]
  messages?: KingMessageDefinition[]
}

export interface AdventurerState {
  uid: number
  classId: string
  name: string
  level: number
  xp: number
  hp: number
  mana: number
  shield: number
  positiveStatusEffects: StatusEffectState[]
  negativeStatusEffects: StatusEffectState[]
  trait: string | null
  rareTrait: string | null
  areaId: string | null
  weaponId: string | null
  armorId: string | null
  accessoryId: string | null
  seen: boolean
  ascended: boolean
  doctrineId: DoctrineId | null
  doctrineLevels: number[]
  potionsDrank: number[]
  summonerUid?: number
}

export interface DismissedAdventurer {
  member: AdventurerState
  dismissedAt: number
}

export interface EnemyState {
  uid: string
  enemyId: string
  hp: number
  mana: number
  shield: number
  positiveStatusEffects: StatusEffectState[]
  negativeStatusEffects: StatusEffectState[]
}

export interface InventoryStack {
  itemId: string
  stack: number
}

export interface WorkshopJob {
  uid: number
  recipeId: string
  itemId: string
  stack: number
  totalSeconds: number
  remainingSeconds: number
}

export interface MarketListing {
  uid: number
  itemId: string
  stack: number
  totalSeconds: number
  remainingSeconds: number
}

export interface MerchantOfferState {
  uid: number
  itemId: string
  stack: number
  price: number
  gems: boolean
  special: boolean
}

export interface AreaEventState {
  kind: 'SHAHURI_ARMY_CHARGING' | 'SHAHURI_ARMY_READY' | 'ENRAGED_SPIRIT' | 'TUTORIAL' | 'WILL_O_WISP_HUNT' | 'ANGRY_EYE' | 'THE_KRAKEN' | 'THE_KRAKEN_FIGHT' | 'BLIZZARD' | 'UNSPEAKABLE_HORROR' | 'UNSPEAKABLE_HORROR_COOLDOWN' | 'PRIMEVAL_WURM_PROGRESS' | 'PRIMEVAL_WURM_COOLDOWN' | 'MAGIC_AMPLIFICATION' | 'FIRE_RITUAL' | 'PYRAMID_DOOR_OPEN' | 'HALLS_EXPLORATION' | 'HALLS_SKELETON_DOOR' | 'LOST_EXPEDITION_TRAPDOOR'
  progress: number
}

export interface RunReport {
  startedAt: number
  areasCleared: number
  wipes: number
  xpEarned: number
  xpLost: number
  enemiesKilled: Record<string, number>
}

export interface AreaRun {
  areaId: string
  action: ActionType
  actionRemaining: number
  actionTotal: number
  progress: number
  maxProgress: number
  finished: boolean
  finishedReason?: 'victory' | 'defeat' | 'retreat'
  localDarkness: number
  event: AreaEventState | null
  partyIds: number[]
  petUid?: number | null
  summons: AdventurerState[]
  enemies: EnemyState[]
  turnOrder: string[]
  turnIndex: number
  chest: InventoryStack[]
  logs: string[]
  report: RunReport
}

export interface BuildingLevels {
  quarters: number
  tavernCapacity: number
  tavernTime: number
  storage: number
  marketListings: number
  marketTime: number
  workshopQueue: number
  workshopTime: number
  shelter: number
  shelterAutofeed: number
}

export interface GameSettings {
  sellMaxAmount: number
  craftMaxAmount: number
  confirmUpgrade: boolean
  confirmRetreat: boolean
  confirmSwap: boolean
  autoOpenDungeonDetail: boolean
  verboseLogs: boolean
  colorblindMode: boolean
}

export interface AchievementStats {
  craftedItems: number
  soldItems: number
  claimedQuests: number
  defeatedEnemies: Record<string, number>
}

export interface GameState {
  version: number
  language: Language
  settings: GameSettings
  lastAccess: number
  lastDailyReset: number
  tutorialStep: number
  money: number
  gems: number
  purchasedPacks: {
    starter: boolean
    merchant: boolean
  }
  loyalty: Record<DoctrineId, LoyaltyProgress>
  activeQuests: QuestState[]
  lastQuestReset: number
  questsRefreshed: boolean
  nextAdventurerId: number
  nextTavernVisit: number
  tavernLocked: boolean
  tavernGuests: AdventurerState[]
  adventurers: AdventurerState[]
  dismissedAdventurers: DismissedAdventurer[]
  inventory: InventoryStack[]
  nextWorkshopJobId: number
  workshopQueue: WorkshopJob[]
  completedWorkshopItems: WorkshopJob[]
  nextMarketListingId: number
  marketListings: MarketListing[]
  soldMarketItems: MarketListing[]
  nextMerchantOfferId: number
  merchantRegularStock: MerchantOfferState[]
  merchantSpecialStock: MerchantOfferState[]
  lastMerchantRegularReset: number
  lastMerchantSpecialReset: number
  permanentUpgrades: Record<string, number>
  nextPetId: number
  pets: PetState[]
  buildings: BuildingLevels
  unlockedAreas: string[]
  seenItems: string[]
  seenEnemies: string[]
  receivedMessages: number[]
  unreadMessages: number[]
  raidTries: Record<string, boolean>
  runs: Record<string, AreaRun>
  achievementStats: AchievementStats
  unlockedAchievements: string[]
  pendingAchievementNotifications: string[]
  totalTicks: number
}
