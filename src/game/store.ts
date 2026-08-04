import { useSyncExternalStore } from 'react'
import type { ContentIndex } from './content'
import type { AdventurerState, DoctrineId, EquipmentSlot, GameState, Language } from './types'
import {
  cancelWorkshopJob,
  cancelMarketListing,
  changeRareTrait,
  collectMarketSale,
  collectChest,
  collectWorkshopJob,
  consumeSpecial,
  consumePotion,
  createInitialState,
  dismissAdventurer,
  equipItem,
  hireGuest,
  markTavernGuestsSeen,
  queueWorkshopRecipe,
  listMarketItem,
  refillRaidTry,
  retreatRun,
  setTavernLocked,
  startRun,
  tickGame,
  upgradeTavern,
  upgradeMarket,
  buyMerchantOffer,
  refreshMerchantRegular,
  refreshMerchantSpecial,
  promoteAdventurer,
  ascendAdventurer,
  hatchPetEgg,
  feedPet,
  mergePet,
  moveAdventurer,
  openGeodes,
  recallAdventurer,
  togglePetFavourite,
  upgradeShelter,
  selectDoctrine,
  changeDoctrineAbility,
  resetDoctrine,
  claimQuest,
  buyQuestRefresh,
  upgradeFacility,
} from './engine'
import { offlineSeconds } from './formulas'
import { defaultWeaponId } from './stats'
import { createGameSync, type GameSync } from '../sync/client'
import type { CloudSyncStatus, RemoteSave } from '../sync/protocol'

const SAVE_KEY = 'guild-master-web-save-v1'
const CLOUD_TICK_SYNC_INTERVAL_MS = 60_000

export class GameStore {
  private state: GameState
  private listeners = new Set<() => void>()
  private timer: number | undefined
  private index: ContentIndex
  private cloudSync: GameSync | null
  private lastCloudPersistAt = 0

  constructor(index: ContentIndex) {
    this.index = index
    this.state = this.load()
    this.cloudSync = createGameSync()
    void this.cloudSync?.initialize()
    const elapsed = offlineSeconds(Date.now(), this.state.lastAccess)
    tickGame(this.state, this.index, elapsed)
    this.persist()
  }

  private load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return createInitialState(this.index)
      const parsed = JSON.parse(raw) as GameState
      if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(parsed.version) || !parsed.buildings || !parsed.runs) return createInitialState(this.index)
      const normalizeAdventurer = (entry: AdventurerState): AdventurerState => {
        const definition = this.index.adventurers.get(entry.classId)
        return {
          ...entry,
          name: (definition?.name ?? entry.name).replaceAll("\\'", "'"),
          weaponId: entry.weaponId ?? defaultWeaponId(definition),
          armorId: entry.armorId ?? null,
          accessoryId: entry.accessoryId ?? null,
          seen: entry.seen ?? false,
          ascended: entry.ascended ?? false,
          doctrineId: entry.doctrineId ?? null,
          doctrineLevels: entry.doctrineLevels ?? [],
          potionsDrank: entry.potionsDrank ?? Array(11).fill(0),
          shield: entry.shield ?? 0,
          positiveStatusEffects: entry.positiveStatusEffects ?? [],
          negativeStatusEffects: entry.negativeStatusEffects ?? [],
        }
      }
      const adventurers = (parsed.adventurers ?? []).map(normalizeAdventurer)
      const tavernGuests = (parsed.tavernGuests ?? []).map(normalizeAdventurer)

      // Saves made by the first web prototype rolled a random tutorial recruit.
      // The original game always starts with a Footman so Copper Armor remains usable at step 5.
      if (parsed.version === 1 && parsed.tutorialStep <= 5) {
        const tutorialMember = parsed.tutorialStep <= 1 ? tavernGuests[0] : adventurers[0]
        const footman = this.index.adventurers.get('Footman')
        if (tutorialMember && footman && tutorialMember.classId !== 'Footman') {
          tutorialMember.classId = 'Footman'
          tutorialMember.weaponId = defaultWeaponId(footman)
          tutorialMember.armorId = null
          tutorialMember.hp = Math.min(tutorialMember.hp, footman.fields.baseMaxHp + tutorialMember.level - 1)
        }
      }

      const nextTavernVisit = parsed.version < 3
        ? Math.max(0, Math.ceil((parsed.nextTavernVisit - (parsed.lastAccess || Date.now())) / 1_000))
        : parsed.nextTavernVisit
      const runs = Object.fromEntries(Object.entries(parsed.runs).map(([areaId, run]) => [areaId, {
        ...run,
        event: run.event ?? null,
        maxProgress: run.maxProgress ?? run.progress ?? 0,
        finished: run.finished ?? false,
        finishedReason: run.finishedReason,
        localDarkness: run.localDarkness ?? 0,
        summons: (run.summons ?? []).map(normalizeAdventurer),
        enemies: (run.enemies ?? []).map((enemy) => ({
          ...enemy,
          shield: enemy.shield ?? 0,
          positiveStatusEffects: enemy.positiveStatusEffects ?? [],
          negativeStatusEffects: enemy.negativeStatusEffects ?? [],
        })),
      }]))
      const raidTries = Object.fromEntries([...this.index.areas.values()]
        .filter((area) => area.areaType !== 0)
        .map((area) => {
          const run = runs[area.id]
          const wasActive = run && !run.finished && run.partyIds.length > 0
          return [area.id, parsed.raidTries?.[area.id] ?? !wasActive]
        }))

      return {
        ...parsed,
        version: 20,
        language: parsed.language ?? 'en',
        purchasedPacks: { starter: true, merchant: true },
        lastDailyReset: parsed.lastDailyReset ?? (() => {
          const date = new Date(parsed.lastAccess || Date.now())
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })(),
        adventurers,
        dismissedAdventurers: (parsed.dismissedAdventurers ?? []).map((entry) => ({ ...entry, member: normalizeAdventurer(entry.member) })),
        tavernGuests,
        runs,
        raidTries,
        nextTavernVisit,
        tavernLocked: parsed.tavernLocked ?? false,
        nextWorkshopJobId: parsed.nextWorkshopJobId ?? 1,
        workshopQueue: parsed.workshopQueue ?? [],
        completedWorkshopItems: parsed.completedWorkshopItems ?? [],
        nextMarketListingId: parsed.nextMarketListingId ?? 1,
        marketListings: parsed.marketListings ?? [],
        soldMarketItems: parsed.soldMarketItems ?? [],
        nextMerchantOfferId: parsed.nextMerchantOfferId ?? 1,
        merchantRegularStock: parsed.merchantRegularStock ?? [],
        merchantSpecialStock: parsed.merchantSpecialStock ?? [],
        lastMerchantRegularReset: parsed.lastMerchantRegularReset ?? parsed.lastDailyReset ?? Date.now(),
        lastMerchantSpecialReset: parsed.lastMerchantSpecialReset ?? parsed.lastDailyReset ?? Date.now(),
        permanentUpgrades: parsed.permanentUpgrades ?? {},
        loyalty: parsed.loyalty ?? {
          Affliction: { level: 0, stars: 0 }, Control: { level: 0, stars: 0 },
          Fortitude: { level: 0, stars: 0 }, Grace: { level: 0, stars: 0 },
          Illusion: { level: 0, stars: 0 }, Knowledge: { level: 0, stars: 0 },
          Ruin: { level: 0, stars: 0 }, War: { level: 0, stars: 0 },
        },
        activeQuests: parsed.activeQuests ?? [],
        lastQuestReset: parsed.lastQuestReset ?? parsed.lastDailyReset ?? Date.now(),
        questsRefreshed: parsed.questsRefreshed ?? false,
        seenEnemies: parsed.seenEnemies ?? [],
        receivedMessages: parsed.receivedMessages ?? [1],
        unreadMessages: parsed.unreadMessages ?? [],
        nextPetId: parsed.nextPetId ?? 1,
        pets: parsed.pets ?? [],
        buildings: { ...parsed.buildings, shelterAutofeed: parsed.buildings.shelterAutofeed ?? 0 },
        seenItems: parsed.seenItems ?? [],
      }
    } catch {
      return createInitialState(this.index)
    }
  }

  private persist(queueCloud = true) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state))
    if (queueCloud && this.cloudSync?.getUser()) {
      this.lastCloudPersistAt = Date.now()
      this.cloudSync?.queueSnapshot(this.state)
    }
  }

  private commit(mutator: (draft: GameState) => void, queueCloud = true) {
    const draft = structuredClone(this.state)
    mutator(draft)
    draft.lastAccess = Date.now()
    this.state = draft
    this.persist(queueCloud)
    this.listeners.forEach((listener) => listener())
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.state

  getCloudSyncStatus = (): CloudSyncStatus => this.cloudSync?.getStatus() ?? { kind: 'disabled' }

  subscribeCloudSync = (listener: () => void) => this.cloudSync?.subscribe(listener) ?? (() => {})

  getCloudUser = () => this.cloudSync?.getUser() ?? null

  signInWithGoogle() {
    return this.cloudSync?.signInWithGoogle() ?? Promise.resolve()
  }

  signOut() {
    return this.cloudSync?.signOut() ?? Promise.resolve()
  }

  syncNow() {
    return this.cloudSync?.syncNow(this.state) ?? Promise.resolve(this.getCloudSyncStatus())
  }

  pullCloudSave() {
    return this.cloudSync?.pullLatest() ?? Promise.resolve(null)
  }

  replaceWithCloudSave(save: RemoteSave) {
    this.state = structuredClone(save.state)
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state))
    void this.cloudSync?.adoptRemote(save)
    this.listeners.forEach((listener) => listener())
  }

  markMessageRead = (id: number) => this.commit((draft) => {
    draft.unreadMessages = draft.unreadMessages.filter((messageId) => messageId !== id)
  })

  consumePotion(uid: number, itemId: string) {
    this.commit((draft) => { consumePotion(draft, this.index, uid, itemId) })
  }

  openGeodes() {
    let gems = 0
    this.commit((draft) => { gems = openGeodes(draft) })
    return gems
  }

  consumeSpecial(uid: number, itemId: string) {
    this.commit((draft) => { consumeSpecial(draft, this.index, uid, itemId) })
  }

  changeRareTrait(uid: number, trait: string, itemId: 'Evo23Vial' | 'Evo23Vial2') {
    this.commit((draft) => { changeRareTrait(draft, uid, trait, itemId) })
  }

  moveAdventurer(uid: number, delta: -1 | 1) {
    this.commit((draft) => { moveAdventurer(draft, uid, delta) })
  }

  dismissAdventurer(uid: number) {
    this.commit((draft) => { dismissAdventurer(draft, uid) })
  }

  recallAdventurer(uid: number) {
    this.commit((draft) => { recallAdventurer(draft, uid) })
  }

  start() {
    if (this.timer) return
    this.timer = window.setInterval(() => {
      const queueCloud = Date.now() - this.lastCloudPersistAt >= CLOUD_TICK_SYNC_INTERVAL_MS
      this.commit((draft) => tickGame(draft, this.index), queueCloud)
    }, 1_000)
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer)
    this.timer = undefined
  }

  hire(uid: number) {
    this.commit((draft) => { hireGuest(draft, uid, this.index) })
  }

  toggleTavernLock() {
    this.commit((draft) => setTavernLocked(draft, !draft.tavernLocked))
  }

  markTavernSeen() {
    this.commit((draft) => markTavernGuestsSeen(draft))
  }

  upgradeTavern(kind: 'capacity' | 'time') {
    this.commit((draft) => { upgradeTavern(draft, kind) })
  }

  upgradeFacility(kind: 'quarters' | 'storage' | 'workshopQueue' | 'workshopTime') {
    this.commit((draft) => { upgradeFacility(draft, kind) })
  }

  send(areaId: string, party: number[], petUid: number | null = null) {
    this.commit((draft) => { startRun(draft, areaId, party, this.index, petUid) })
  }

  refillRaid(areaId: string) {
    let purchased = false
    this.commit((draft) => { purchased = refillRaidTry(draft, areaId, this.index) })
    return purchased
  }

  retreat(areaId: string) {
    this.commit((draft) => retreatRun(draft, areaId, this.index))
  }

  collect(areaId: string) {
    let collected = false
    this.commit((draft) => { collected = collectChest(draft, areaId, this.index) })
    return collected
  }

  setLanguage(language: Language) {
    this.commit((draft) => { draft.language = language })
  }

  craft(recipeId: string) {
    this.commit((draft) => { queueWorkshopRecipe(draft, this.index, recipeId) })
  }

  collectCraft(uid: number) {
    this.commit((draft) => { collectWorkshopJob(draft, uid, this.index) })
  }

  cancelCraft(uid: number) {
    this.commit((draft) => { cancelWorkshopJob(draft, uid) })
  }

  listForSale(itemId: string, amount: number) {
    this.commit((draft) => { listMarketItem(draft, this.index, itemId, amount) })
  }

  cancelSale(uid: number) {
    this.commit((draft) => { cancelMarketListing(draft, uid) })
  }

  collectSale(uid: number) {
    this.commit((draft) => { collectMarketSale(draft, this.index, uid) })
  }

  upgradeMarket(kind: 'listings' | 'time') {
    this.commit((draft) => { upgradeMarket(draft, kind) })
  }

  refreshMerchant() {
    this.commit((draft) => {
      refreshMerchantRegular(draft, this.index)
      refreshMerchantSpecial(draft, this.index)
    })
  }

  buyMerchant(uid: number) {
    this.commit((draft) => { buyMerchantOffer(draft, uid) })
  }

  promote(uid: number, classId: string) {
    this.commit((draft) => { promoteAdventurer(draft, this.index, uid, classId) })
  }

  ascend(uid: number) {
    this.commit((draft) => { ascendAdventurer(draft, this.index, uid) })
  }

  selectDoctrine(uid: number, doctrineId: DoctrineId) {
    this.commit((draft) => { selectDoctrine(draft, this.index, uid, doctrineId) })
  }

  changeDoctrineAbility(uid: number, abilityId: string, delta: 1 | -1) {
    this.commit((draft) => { changeDoctrineAbility(draft, this.index, uid, abilityId, delta) })
  }

  resetDoctrine(uid: number) {
    this.commit((draft) => { resetDoctrine(draft, this.index, uid) })
  }

  refreshQuests() {
    this.commit((draft) => { buyQuestRefresh(draft, this.index) })
  }

  claimQuest(id: string) {
    this.commit((draft) => { claimQuest(draft, id) })
  }

  hatchPet(eggId: string) {
    this.commit((draft) => { hatchPetEgg(draft, this.index, eggId) })
  }

  feedPet(uid: number, itemId: string, amount: number) {
    this.commit((draft) => { feedPet(draft, this.index, uid, itemId, amount) })
  }

  mergePet(sourceUid: number, targetUid: number) {
    this.commit((draft) => { mergePet(draft, sourceUid, targetUid) })
  }

  togglePetFavourite(uid: number) {
    this.commit((draft) => { togglePetFavourite(draft, uid) })
  }

  upgradeShelter(kind: 'capacity' | 'autofeed') {
    this.commit((draft) => { upgradeShelter(draft, kind) })
  }

  equip(uid: number, slot: EquipmentSlot, itemId: string | null) {
    this.commit((draft) => { equipItem(draft, this.index, uid, slot, itemId) })
  }

  reset() {
    this.state = createInitialState(this.index)
    this.persist()
    this.listeners.forEach((listener) => listener())
  }
}

export function useGame(store: GameStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
