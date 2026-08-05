import type { DoctrineId, EquipmentSlot, GameSettings, GameState } from './types.ts'
import type { ContentIndex } from './content.ts'
import {
  ascendAdventurer,
  buyMerchantOffer,
  buyQuestRefresh,
  cancelMarketListing,
  cancelWorkshopJob,
  changeDoctrineAbility,
  changeRareTrait,
  claimQuest,
  collectChest,
  collectMarketSale,
  collectWorkshopJob,
  consumePotion,
  consumeSpecial,
  dismissAdventurer,
  equipItem,
  feedPet,
  hatchPetEgg,
  hireGuest,
  listMarketItem,
  markTavernGuestsSeen,
  mergePet,
  moveAdventurer,
  openGeodes,
  promoteAdventurer,
  queueWorkshopRecipe,
  recallAdventurer,
  refillRaidTry,
  refreshMerchantRegular,
  refreshMerchantSpecial,
  releasePet,
  resetDoctrine,
  retreatRun,
  selectDoctrine,
  setTavernLocked,
  startRun,
  tickGame,
  togglePetFavourite,
  upgradeFacility,
  upgradeMarket,
  upgradeShelter,
  upgradeTavern,
} from './engine.ts'

export interface GameAction {
  id: string
  type: string
  payload?: Record<string, unknown>
}

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const integer = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) ? value : null
const text = (value: unknown) => typeof value === 'string' && value.length <= 120 ? value : null
const boolean = (value: unknown) => typeof value === 'boolean' ? value : null

/**
 * The server runs this reducer before it authorizes a gem reward/spend. The
 * browser sends intent and identifiers only; it never sends a resulting state
 * or a gem delta.
 */
export function applyAuthoritativeAction(state: GameState, index: ContentIndex, action: GameAction) {
  const payload = object(action.payload)
  const uid = integer(payload.uid)
  const itemId = text(payload.itemId)
  const areaId = text(payload.areaId)
  switch (action.type) {
    case 'tick': return true
    case 'consumePotion': return uid !== null && itemId ? consumePotion(state, index, uid, itemId) : false
    case 'openGeodes': openGeodes(state); return true
    case 'consumeSpecial': return uid !== null && itemId ? consumeSpecial(state, index, uid, itemId) : false
    case 'changeRareTrait': {
      const trait = text(payload.trait)
      return uid !== null && trait && (itemId === 'Evo23Vial' || itemId === 'Evo23Vial2') ? changeRareTrait(state, uid, trait, itemId) : false
    }
    case 'moveAdventurer': {
      const delta = payload.delta === -1 || payload.delta === 1 ? payload.delta : null
      return uid !== null && delta ? moveAdventurer(state, uid, delta) : false
    }
    case 'dismiss': return uid !== null ? dismissAdventurer(state, uid) : false
    case 'recall': return uid !== null ? recallAdventurer(state, uid) : false
    case 'hire': return uid !== null ? hireGuest(state, uid, index) : false
    case 'setTavernLocked': {
      const locked = boolean(payload.locked)
      return locked === null ? false : (setTavernLocked(state, locked), true)
    }
    case 'markTavernSeen': markTavernGuestsSeen(state); return true
    case 'upgradeTavern': return payload.kind === 'capacity' || payload.kind === 'time' ? upgradeTavern(state, payload.kind) : false
    case 'upgradeFacility': return payload.kind === 'quarters' || payload.kind === 'storage' || payload.kind === 'workshopQueue' || payload.kind === 'workshopTime'
      ? upgradeFacility(state, payload.kind) : false
    case 'startRun': {
      const partyIds = Array.isArray(payload.partyIds) && payload.partyIds.every((value) => integer(value) !== null) ? payload.partyIds as number[] : []
      const petUid = payload.petUid === null ? null : integer(payload.petUid)
      return areaId ? startRun(state, areaId, partyIds, index, petUid) : false
    }
    case 'refillRaid': return areaId ? refillRaidTry(state, areaId, index) : false
    case 'retreat': return areaId ? (retreatRun(state, areaId, index), true) : false
    case 'collectChest': return areaId ? collectChest(state, areaId, index) : false
    case 'craft': {
      const amount = integer(payload.amount)
      return itemId && amount !== null ? queueWorkshopRecipe(state, index, itemId, amount) : false
    }
    case 'collectCraft': return uid !== null ? collectWorkshopJob(state, uid, index) : false
    case 'cancelCraft': return uid !== null ? cancelWorkshopJob(state, uid) : false
    case 'listForSale': {
      const amount = integer(payload.amount)
      return itemId && amount !== null ? listMarketItem(state, index, itemId, amount) : false
    }
    case 'cancelSale': return uid !== null ? cancelMarketListing(state, uid) : false
    case 'collectSale': return uid !== null ? collectMarketSale(state, index, uid) : false
    case 'upgradeMarket': return payload.kind === 'listings' || payload.kind === 'time' ? upgradeMarket(state, payload.kind) : false
    case 'refreshMerchant': refreshMerchantRegular(state, index); refreshMerchantSpecial(state, index); return true
    case 'buyMerchant': return uid !== null ? buyMerchantOffer(state, uid) : false
    case 'promote': {
      const classId = text(payload.classId)
      return uid !== null && classId ? promoteAdventurer(state, index, uid, classId) : false
    }
    case 'ascend': return uid !== null ? ascendAdventurer(state, index, uid) : false
    case 'selectDoctrine': {
      const doctrineId = text(payload.doctrineId) as DoctrineId | null
      return uid !== null && doctrineId ? selectDoctrine(state, index, uid, doctrineId) : false
    }
    case 'changeDoctrineAbility': {
      const abilityId = text(payload.abilityId)
      const delta = payload.delta === -1 || payload.delta === 1 ? payload.delta : null
      return uid !== null && abilityId && delta ? changeDoctrineAbility(state, index, uid, abilityId, delta) : false
    }
    case 'resetDoctrine': return uid !== null ? resetDoctrine(state, index, uid) : false
    case 'refreshQuests': return buyQuestRefresh(state, index)
    case 'claimQuest': return itemId ? claimQuest(state, itemId) : false
    case 'hatchPet': return itemId ? hatchPetEgg(state, index, itemId) : false
    case 'feedPet': {
      const amount = integer(payload.amount)
      return uid !== null && itemId && amount !== null ? feedPet(state, index, uid, itemId, amount) : false
    }
    case 'mergePet': {
      const targetUid = integer(payload.targetUid)
      return uid !== null && targetUid !== null ? mergePet(state, uid, targetUid) : false
    }
    case 'releasePet': return uid !== null ? releasePet(state, uid, index) : false
    case 'togglePetFavourite': return uid !== null ? (togglePetFavourite(state, uid), true) : false
    case 'upgradeShelter': return payload.kind === 'capacity' || payload.kind === 'autofeed' ? upgradeShelter(state, payload.kind) : false
    case 'equip': {
      const slot = payload.slot === 'weapon' || payload.slot === 'armor' || payload.slot === 'accessory' ? payload.slot as EquipmentSlot : null
      const equipmentId = payload.itemId === null ? null : itemId
      return uid !== null && slot ? equipItem(state, index, uid, slot, equipmentId) : false
    }
    case 'settings': {
      const settings = object(payload.settings) as Partial<GameSettings>
      state.settings = { ...state.settings, ...settings }
      return true
    }
    default: return false
  }
}

export function advanceServerTime(state: GameState, index: ContentIndex, now = Date.now()) {
  const elapsed = Math.min(12 * 60 * 60, Math.max(0, Math.floor((now - state.lastAccess) / 1_000)))
  if (elapsed > 0) tickGame(state, index, elapsed)
  state.lastAccess = now
}
