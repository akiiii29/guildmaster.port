import { useSyncExternalStore } from 'react'
import type { ContentIndex } from './content'
import type { AdventurerState, DoctrineId, EquipmentSlot, GameSettings, GameState, Language } from './types'
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
  discoverRecipesForItem,
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
  releasePet,
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
import { recipeById } from './recipes'
import { reconcileAchievements } from './achievements'
import { createGameSync, type GameSync } from '../sync/client'
import type { CloudSyncStatus, RemoteSave } from '../sync/protocol'

const SAVE_KEY = 'guild-master-web-save-v1'
const CLOUD_TICK_SYNC_INTERVAL_MS = 60_000
const SUPPORTED_SAVE_VERSIONS = new Set(Array.from({ length: 25 }, (_, index) => index + 1))

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export class GameStore {
  private state: GameState
  private listeners = new Set<() => void>()
  private timer: number | undefined
  private index: ContentIndex
  private cloudSync: GameSync | null
  private lastCloudPersistAt = 0
  private offlineProgressSeconds = 0
  private onStorage = (event: StorageEvent) => {
    if (event.key !== SAVE_KEY || !event.newValue) return
    const incoming = this.migrateSerialized(event.newValue)
    if (!incoming || incoming.lastAccess <= this.state.lastAccess) return
    this.state = incoming
    this.listeners.forEach((listener) => listener())
  }

  constructor(index: ContentIndex) {
    this.index = index
    this.state = this.load()
    this.cloudSync = createGameSync()
    void this.cloudSync?.initialize().then(async () => {
      if (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser()) return
      const remote = await this.cloudSync.pullLatest()
      if (remote) this.mergeAuthoritativeBenefits(remote)
      // Keep the active browser expedition intact. In strict Gem mode the
      // server is authoritative only for protected Gems and Gem-pack flags;
      // replaying its independent RNG state would replace local combat loot
      // and reports with a different run.
      await this.refreshAuthoritativeBenefits()
    })
    const elapsed = offlineSeconds(Date.now(), this.state.lastAccess)
    this.offlineProgressSeconds = elapsed
    tickGame(this.state, this.index, elapsed)
    this.persist()
    if (typeof window !== 'undefined') window.addEventListener('storage', this.onStorage)
  }

  private load() {
    return this.migrateSerialized(localStorage.getItem(SAVE_KEY)) ?? createInitialState(this.index)
  }

  private migrateSerialized(raw: string | null, allowAuthoritativePacks = false): GameState | null {
    try {
      if (!raw) return null
      const parsed = JSON.parse(raw) as GameState
      if (!isRecord(parsed) || !SUPPORTED_SAVE_VERSIONS.has(parsed.version) || !isRecord(parsed.buildings) || !isRecord(parsed.runs)) return null
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
      const adventurers = (Array.isArray(parsed.adventurers) ? parsed.adventurers : []).map(normalizeAdventurer)
      const tavernGuests = (Array.isArray(parsed.tavernGuests) ? parsed.tavernGuests : []).map(normalizeAdventurer)

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
        report: run.report ?? { startedAt: parsed.lastAccess ?? Date.now(), areasCleared: 0, wipes: 0, xpEarned: 0, xpLost: 0, enemiesKilled: {} },
      }]))
      const raidTries = Object.fromEntries([...this.index.areas.values()]
        .filter((area) => area.areaType !== 0)
        .map((area) => {
          const run = runs[area.id]
          const wasActive = run && !run.finished && run.partyIds.length > 0
          return [area.id, parsed.raidTries?.[area.id] ?? !wasActive]
        }))

      const migrated: GameState = {
        ...parsed,
        version: 25,
        language: parsed.language ?? 'en',
        settings: {
          sellMaxAmount: parsed.settings?.sellMaxAmount ?? 1,
          craftMaxAmount: parsed.settings?.craftMaxAmount ?? 1,
          confirmUpgrade: parsed.settings?.confirmUpgrade ?? true,
          confirmRetreat: parsed.settings?.confirmRetreat ?? true,
          confirmSwap: parsed.settings?.confirmSwap ?? true,
          autoOpenDungeonDetail: parsed.settings?.autoOpenDungeonDetail ?? true,
          verboseLogs: parsed.settings?.verboseLogs ?? false,
          colorblindMode: parsed.settings?.colorblindMode ?? false,
        },
        // Only a state returned by gem-action may restore purchased packs.
        // Local storage and imported saves cannot grant a paid bonus.
        purchasedPacks: allowAuthoritativePacks
          ? { starter: parsed.purchasedPacks?.starter === true, merchant: parsed.purchasedPacks?.merchant === true }
          : { starter: false, merchant: false },
        lastDailyReset: parsed.lastDailyReset ?? (() => {
          const date = new Date(parsed.lastAccess || Date.now())
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })(),
        adventurers,
        dismissedAdventurers: (Array.isArray(parsed.dismissedAdventurers) ? parsed.dismissedAdventurers : []).map((entry) => ({ ...entry, member: normalizeAdventurer(entry.member) })),
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
        knownRecipes: [],
        achievementStats: isRecord(parsed.achievementStats) ? {
          craftedItems: Number.isFinite(parsed.achievementStats.craftedItems) ? Math.max(0, parsed.achievementStats.craftedItems) : 0,
          soldItems: Number.isFinite(parsed.achievementStats.soldItems) ? Math.max(0, parsed.achievementStats.soldItems) : 0,
          claimedQuests: Number.isFinite(parsed.achievementStats.claimedQuests) ? Math.max(0, parsed.achievementStats.claimedQuests) : 0,
          defeatedEnemies: isRecord(parsed.achievementStats.defeatedEnemies) ? Object.fromEntries(Object.entries(parsed.achievementStats.defeatedEnemies).filter(([, value]) => typeof value === 'number' && value > 0)) : {},
        } : { craftedItems: 0, soldItems: 0, claimedQuests: 0, defeatedEnemies: Object.fromEntries((Array.isArray(parsed.seenEnemies) ? parsed.seenEnemies : []).map((enemyId) => [enemyId, 1])) },
        unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? [...new Set(parsed.unlockedAchievements.filter((id): id is string => typeof id === 'string'))] : [],
        pendingAchievementNotifications: [],
      }
      const knownRecipeIds = Array.isArray(parsed.knownRecipes)
        ? parsed.knownRecipes.filter((recipeId): recipeId is string => typeof recipeId === 'string')
        : []
      migrated.knownRecipes = [...new Set(knownRecipeIds.filter((recipeId) => recipeById.has(recipeId)))]
      if (migrated.knownRecipes.length === 0) {
        const discoveredItems = new Set([...migrated.seenItems, ...migrated.inventory.map((stack) => stack.itemId)])
        discoveredItems.forEach((itemId) => discoverRecipesForItem(migrated, itemId))
      }
      reconcileAchievements(migrated, this.index)
      return migrated
    } catch {
      return null
    }
  }

  private persist(queueCloud = true) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Unable to persist local game save.', error)
      return
    }
    if (queueCloud && this.cloudSync?.getUser()) {
      this.lastCloudPersistAt = Date.now()
      this.cloudSync?.queueSnapshot(this.state)
    }
  }

  private commit(mutator: (draft: GameState) => void, queueCloud = true) {
    const draft = structuredClone(this.state)
    mutator(draft)
    const newlyUnlocked = reconcileAchievements(draft, this.index)
    draft.pendingAchievementNotifications = [...draft.pendingAchievementNotifications, ...newlyUnlocked]
    draft.lastAccess = Date.now()
    this.state = draft
    this.persist(queueCloud)
    this.listeners.forEach((listener) => listener())
  }

  private actionId() {
    return crypto.randomUUID()
  }

  private mergeAuthoritativeBenefits(remote: RemoteSave) {
    const migrated = this.migrateSerialized(JSON.stringify(remote.state), true)
    if (!migrated) return false
    const draft = structuredClone(this.state)
    draft.gems = migrated.gems
    draft.purchasedPacks = migrated.purchasedPacks
    this.state = draft
    this.persist(false)
    void this.cloudSync?.adoptRemote(remote)
    this.listeners.forEach((listener) => listener())
    return true
  }

  private async refreshAuthoritativeBenefits() {
    if (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser()) return false
    const remote = await this.cloudSync.applyGemAuthorityAction({ id: this.actionId(), type: 'tick' }, this.state)
    if (!remote) return false
    return this.mergeAuthoritativeBenefits(remote)
  }

  private async commitAuthoritative(
    type: string,
    payload: Record<string, unknown>,
    fallback: (draft: GameState) => void,
    preserveLocalState = false,
  ) {
    if (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser()) {
      this.commit(fallback)
      return true
    }
    const remote = await this.cloudSync.applyGemAuthorityAction({ id: this.actionId(), type, payload }, this.state)
    if (!remote) {
      const status = this.cloudSync.getStatus()
      if (status.kind === 'conflict') this.replaceWithCloudSave(status.remote)
      return false
    }
    if (preserveLocalState) {
      // Combat and loot continue locally in strict Gem mode. Apply the local
      // expedition transition after the server has recorded the intent, then
      // merge only protected values so an older server run cannot overwrite
      // inventory collected from a local chest.
      this.commit(fallback, false)
      return this.mergeAuthoritativeBenefits(remote)
    }
    const migrated = this.migrateSerialized(JSON.stringify(remote.state), true)
    if (!migrated) return false
    this.state = migrated
    this.persist(false)
    void this.cloudSync.adoptRemote(remote)
    this.listeners.forEach((listener) => listener())
    return true
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.state

  getOfflineProgressSeconds = () => this.offlineProgressSeconds

  exportSave() {
    return JSON.stringify({ format: 'guild-master-web-save', exportedAt: new Date().toISOString(), state: this.state }, null, 2)
  }

  importSave(serialized: string) {
    try {
      const parsed = JSON.parse(serialized) as unknown
      const candidate = isRecord(parsed) && parsed.format === 'guild-master-web-save' ? parsed.state : parsed
      const migrated = this.migrateSerialized(JSON.stringify(candidate))
      if (!migrated) return { ok: false, message: 'This backup is invalid or uses an unsupported save version.' }
      this.state = migrated
      this.persist()
      this.listeners.forEach((listener) => listener())
      return { ok: true, message: 'Backup restored successfully.' }
    } catch {
      return { ok: false, message: 'This backup is not valid JSON.' }
    }
  }

  acknowledgeAchievementNotifications() {
    if (this.state.pendingAchievementNotifications.length === 0) return
    this.commit((draft) => { draft.pendingAchievementNotifications = [] }, false)
  }

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

  async redeemCode(code: string) {
    const result = await this.cloudSync?.redeemCode(code) ?? { ok: false, message: 'Cloud sync is not configured for this deployment.' }
    if (result.ok && result.reward && this.index.items.has(result.reward.itemId) && result.reward.stack > 0) {
      this.commit((draft) => {
        const stack = draft.inventory.find((entry) => entry.itemId === result.reward!.itemId)
        if (stack) stack.stack += result.reward!.stack
        else draft.inventory.push({ itemId: result.reward!.itemId, stack: result.reward!.stack })
        discoverRecipesForItem(draft, result.reward!.itemId)
      })
    }
    return result
  }

  createPaymentOrder(productId: string) {
    return this.cloudSync?.createPaymentOrder(productId) ?? Promise.resolve({ ok: false, message: 'Cloud payments are not configured for this deployment.' })
  }

  getPaymentOrderStatus(orderId: string) {
    return this.cloudSync?.getPaymentOrderStatus(orderId) ?? Promise.resolve(null)
  }

  async refreshProtectedGems() {
    if (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser()) return false
    const gems = await this.cloudSync.getProtectedGemBalance()
    if (gems === null) return false
    this.commit((draft) => { draft.gems = gems }, false)
    return true
  }

  replaceWithCloudSave(save: RemoteSave) {
    const migrated = this.migrateSerialized(JSON.stringify(save.state), true)
    if (!migrated) return false
    this.state = migrated
    this.persist(false)
    void this.cloudSync?.adoptRemote(save)
    this.listeners.forEach((listener) => listener())
    return true
  }

  markMessageRead = (id: number) => this.commit((draft) => {
    draft.unreadMessages = draft.unreadMessages.filter((messageId) => messageId !== id)
  })

  consumePotion(uid: number, itemId: string) {
    return this.commitAuthoritative('consumePotion', { uid, itemId }, (draft) => { consumePotion(draft, this.index, uid, itemId) })
  }

  async openGeodes() {
    const before = this.state.gems
    const ok = await this.commitAuthoritative('openGeodes', {}, (draft) => { openGeodes(draft) })
    return ok ? Math.max(0, this.state.gems - before) : 0
  }

  consumeSpecial(uid: number, itemId: string) {
    return this.commitAuthoritative('consumeSpecial', { uid, itemId }, (draft) => { consumeSpecial(draft, this.index, uid, itemId) })
  }

  changeRareTrait(uid: number, trait: string, itemId: 'Evo23Vial' | 'Evo23Vial2') {
    return this.commitAuthoritative('changeRareTrait', { uid, trait, itemId }, (draft) => { changeRareTrait(draft, uid, trait, itemId) })
  }

  moveAdventurer(uid: number, delta: -1 | 1) {
    return this.commitAuthoritative('moveAdventurer', { uid, delta }, (draft) => { moveAdventurer(draft, uid, delta) })
  }

  dismissAdventurer(uid: number) {
    return this.commitAuthoritative('dismiss', { uid }, (draft) => { dismissAdventurer(draft, uid) })
  }

  recallAdventurer(uid: number) {
    return this.commitAuthoritative('recall', { uid }, (draft) => { recallAdventurer(draft, uid) })
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
    return this.commitAuthoritative('hire', { uid }, (draft) => { hireGuest(draft, uid, this.index) })
  }

  toggleTavernLock() {
    return this.commitAuthoritative('setTavernLocked', { locked: !this.state.tavernLocked }, (draft) => setTavernLocked(draft, !draft.tavernLocked))
  }

  markTavernSeen() {
    return this.commitAuthoritative('markTavernSeen', {}, (draft) => markTavernGuestsSeen(draft))
  }

  upgradeTavern(kind: 'capacity' | 'time') {
    return this.commitAuthoritative('upgradeTavern', { kind }, (draft) => { upgradeTavern(draft, kind) })
  }

  upgradeFacility(kind: 'quarters' | 'storage' | 'workshopQueue' | 'workshopTime') {
    return this.commitAuthoritative('upgradeFacility', { kind }, (draft) => { upgradeFacility(draft, kind) })
  }

  send(areaId: string, party: number[], petUid: number | null = null) {
    return this.commitAuthoritative('startRun', { areaId, partyIds: party, petUid }, (draft) => { startRun(draft, areaId, party, this.index, petUid) }, true)
  }

  refillRaid(areaId: string) {
    return this.commitAuthoritative('refillRaid', { areaId }, (draft) => { refillRaidTry(draft, areaId, this.index) })
  }

  retreat(areaId: string) {
    return this.commitAuthoritative('retreat', { areaId }, (draft) => retreatRun(draft, areaId, this.index), true)
  }

  collect(areaId: string) {
    let collected = false
    this.commit((draft) => { collected = collectChest(draft, areaId, this.index) })
    return Promise.resolve(collected)
  }

  setLanguage(language: Language) {
    this.commit((draft) => { draft.language = language })
  }

  updateSettings(settings: Partial<GameSettings>) {
    this.commit((draft) => { draft.settings = { ...draft.settings, ...settings } })
  }

  craft(recipeId: string, amount = 1) {
    return this.commitAuthoritative('craft', { itemId: recipeId, amount }, (draft) => { queueWorkshopRecipe(draft, this.index, recipeId, amount) })
  }

  collectCraft(uid: number) {
    return this.commitAuthoritative('collectCraft', { uid }, (draft) => { collectWorkshopJob(draft, uid, this.index) })
  }

  cancelCraft(uid: number) {
    return this.commitAuthoritative('cancelCraft', { uid }, (draft) => { cancelWorkshopJob(draft, uid) })
  }

  listForSale(itemId: string, amount: number) {
    return this.commitAuthoritative('listForSale', { itemId, amount }, (draft) => { listMarketItem(draft, this.index, itemId, amount) })
  }

  cancelSale(uid: number) {
    return this.commitAuthoritative('cancelSale', { uid }, (draft) => { cancelMarketListing(draft, uid) })
  }

  collectSale(uid: number) {
    return this.commitAuthoritative('collectSale', { uid }, (draft) => { collectMarketSale(draft, this.index, uid) })
  }

  upgradeMarket(kind: 'listings' | 'time') {
    return this.commitAuthoritative('upgradeMarket', { kind }, (draft) => { upgradeMarket(draft, kind) })
  }

  refreshMerchant() {
    return this.commitAuthoritative('refreshMerchant', {}, (draft) => {
      refreshMerchantRegular(draft, this.index)
      refreshMerchantSpecial(draft, this.index)
    })
  }

  buyMerchant(uid: number) {
    const offer = [...this.state.merchantRegularStock, ...this.state.merchantSpecialStock].find((entry) => entry.uid === uid)
    if (offer?.gems && (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser())) {
      // Gem-priced merchant goods spend protected currency and must be tied to
      // an account, just like permanent packs.
      return Promise.resolve(false)
    }
    return this.commitAuthoritative('buyMerchant', { uid }, (draft) => { buyMerchantOffer(draft, uid) })
  }

  buyPack(pack: 'starter' | 'merchant') {
    if (!this.cloudSync?.isGemAuthorityEnabled() || !this.cloudSync.getUser()) {
      // Permanent packs are account-bound benefits. Never complete this
      // transaction locally: a guest save cannot restore a pack after reload.
      return Promise.resolve(false)
    }
    return this.cloudSync.applyGemAuthorityAction({ id: this.actionId(), type: 'buyPack', payload: { pack } }, this.state)
      .then((remote) => remote ? this.mergeAuthoritativeBenefits(remote) : false)
  }

  promote(uid: number, classId: string) {
    return this.commitAuthoritative('promote', { uid, classId }, (draft) => { promoteAdventurer(draft, this.index, uid, classId) })
  }

  ascend(uid: number) {
    return this.commitAuthoritative('ascend', { uid }, (draft) => { ascendAdventurer(draft, this.index, uid) })
  }

  selectDoctrine(uid: number, doctrineId: DoctrineId) {
    return this.commitAuthoritative('selectDoctrine', { uid, doctrineId }, (draft) => { selectDoctrine(draft, this.index, uid, doctrineId) })
  }

  changeDoctrineAbility(uid: number, abilityId: string, delta: 1 | -1) {
    return this.commitAuthoritative('changeDoctrineAbility', { uid, abilityId, delta }, (draft) => { changeDoctrineAbility(draft, this.index, uid, abilityId, delta) })
  }

  resetDoctrine(uid: number) {
    return this.commitAuthoritative('resetDoctrine', { uid }, (draft) => { resetDoctrine(draft, this.index, uid) })
  }

  refreshQuests() {
    return this.commitAuthoritative('refreshQuests', {}, (draft) => { buyQuestRefresh(draft, this.index) })
  }

  claimQuest(id: string) {
    return this.commitAuthoritative('claimQuest', { itemId: id }, (draft) => { claimQuest(draft, id) })
  }

  hatchPet(eggId: string) {
    return this.commitAuthoritative('hatchPet', { itemId: eggId }, (draft) => { hatchPetEgg(draft, this.index, eggId) })
  }

  feedPet(uid: number, itemId: string, amount: number) {
    return this.commitAuthoritative('feedPet', { uid, itemId, amount }, (draft) => { feedPet(draft, this.index, uid, itemId, amount) })
  }

  mergePet(sourceUid: number, targetUid: number) {
    return this.commitAuthoritative('mergePet', { uid: sourceUid, targetUid }, (draft) => { mergePet(draft, sourceUid, targetUid) })
  }

  releasePet(uid: number) {
    return this.commitAuthoritative('releasePet', { uid }, (draft) => { releasePet(draft, uid, this.index) })
  }

  togglePetFavourite(uid: number) {
    return this.commitAuthoritative('togglePetFavourite', { uid }, (draft) => { togglePetFavourite(draft, uid) })
  }

  upgradeShelter(kind: 'capacity' | 'autofeed') {
    return this.commitAuthoritative('upgradeShelter', { kind }, (draft) => { upgradeShelter(draft, kind) })
  }

  equip(uid: number, slot: EquipmentSlot, itemId: string | null) {
    return this.commitAuthoritative('equip', { uid, slot, itemId }, (draft) => { equipItem(draft, this.index, uid, slot, itemId) })
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
