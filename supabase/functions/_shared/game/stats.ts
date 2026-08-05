import type { ContentIndex } from './content.ts'
import { gameRound } from './formulas.ts'
import type {
  AdventurerDefinition,
  AdventurerState,
  EquipmentSlot,
  ItemDefinition,
} from './types.ts'
import { doctrineAbilityValue } from './doctrines.ts'

export interface AdventurerStats {
  maxHp: number
  constitution: number
  intelligence: number
  dexterity: number
  defense: number
  magicDefense: number
}

export const STAT_LABELS: Array<[keyof AdventurerStats, string]> = [
  ['maxHp', 'HP'],
  ['constitution', 'CON'],
  ['intelligence', 'INT'],
  ['dexterity', 'DEX'],
  ['defense', 'DEF'],
  ['magicDefense', 'MDEF'],
]

const DEFAULT_WEAPONS: Record<string, string> = {
  type_sword: 'Spade',
  type_staff: 'Cane',
  type_dagger: 'Sickle',
  type_bow: 'TrainingBow',
}

const WEAPON_ITEM_TYPES: Record<string, string> = {
  type_sword: 'Sword',
  type_staff: 'Staff',
  type_dagger: 'Dagger',
  type_bow: 'Bow',
}

const ARMOR_ITEM_TYPES: Record<string, string> = {
  type_armor_heavy: 'HeavyArmor',
  type_armor_medium: 'MediumArmor',
  type_armor_light: 'LightArmor',
}

const MAGIC_WEAPON_OVERRIDES = new Set(['ArcaneDagger', 'DryadsCurse', 'SylvanMandate'])
const RANGED_WEAPON_OVERRIDES = new Set([
  'AegisMechanica',
  'CeremonialDagger',
  'FlyingReaper',
  'InfernalChakram',
  'LivingWhip',
  'RitualBlade',
])

export function defaultWeaponId(definition?: AdventurerDefinition) {
  return DEFAULT_WEAPONS[definition?.fields.weaponType?.key ?? ''] ?? null
}

export function weaponTypeKey(item: ItemDefinition | undefined, fallback = 'type_sword') {
  const type = item?.type
  if (type === 'Sword') return 'type_sword'
  if (type === 'Staff') return 'type_staff'
  if (type === 'Dagger') return 'type_dagger'
  if (type === 'Bow') return 'type_bow'
  return fallback
}

export function weaponIsMagic(item: ItemDefinition | undefined, typeKey: string) {
  return typeKey === 'type_staff' || MAGIC_WEAPON_OVERRIDES.has(item?.id ?? '')
}

export function weaponIsRanged(item: ItemDefinition | undefined, typeKey: string) {
  return typeKey === 'type_staff' || typeKey === 'type_bow' || RANGED_WEAPON_OVERRIDES.has(item?.id ?? '')
}

export function equipmentItemId(member: AdventurerState, slot: EquipmentSlot) {
  if (slot === 'weapon') return member.weaponId
  if (slot === 'armor') return member.armorId
  return member.accessoryId
}

export function setEquipmentItemId(member: AdventurerState, slot: EquipmentSlot, itemId: string | null) {
  if (slot === 'weapon') member.weaponId = itemId
  else if (slot === 'armor') member.armorId = itemId
  else member.accessoryId = itemId
}

export function itemMatchesSlot(item: ItemDefinition, definition: AdventurerDefinition, slot: EquipmentSlot, member?: AdventurerState) {
  if (slot === 'weapon') {
    if (member && doctrineAbilityValue(member, 'WEAPON_MASTER') > 0) return Object.values(WEAPON_ITEM_TYPES).includes(item.type)
    return item.type === WEAPON_ITEM_TYPES[definition.fields.weaponType?.key ?? '']
  }
  if (slot === 'armor') return item.type === ARMOR_ITEM_TYPES[definition.fields.armorType?.key ?? '']
  return item.type === 'Accessory'
}

export function equipmentStats(item?: ItemDefinition): AdventurerStats {
  return {
    maxHp: Number(item?.fields.maxHp ?? 0),
    constitution: Number(item?.fields.constitution ?? 0),
    intelligence: Number(item?.fields.intelligence ?? 0),
    dexterity: Number(item?.fields.dexterity ?? 0),
    defense: Number(item?.fields.defense ?? 0),
    magicDefense: Number(item?.fields.magicDefense ?? 0),
  }
}

function traitModifier(trait: string | null, stat: keyof AdventurerStats) {
  if (stat === 'constitution') {
    if (trait === 'BRUTE') return 1.1
    if (trait === 'BRUTE_PLUS') return 1.15
    if (trait === 'BOOKWORM' || trait === 'FERAL') return 0.95
  }
  if (stat === 'intelligence') {
    if (trait === 'BOOKWORM') return 1.1
    if (trait === 'BOOKWORM_PLUS') return 1.15
    if (trait === 'BRUTE' || trait === 'FERAL') return 0.95
  }
  if (stat === 'dexterity') {
    if (trait === 'FERAL') return 1.1
    if (trait === 'FERAL_PLUS') return 1.15
    if (trait === 'BOOKWORM' || trait === 'BRUTE') return 0.95
  }
  return 1
}

export function adventurerStats(member: AdventurerState, index: ContentIndex): AdventurerStats {
  const definition = index.adventurers.get(member.classId)
  if (!definition) return { maxHp: 1, constitution: 0, intelligence: 0, dexterity: 0, defense: 0, magicDefense: 0 }
  const ascendedMultiplier = member.ascended ? 1.5 : 1
  const stats: AdventurerStats = {
    maxHp: Math.trunc((definition.fields.baseMaxHp + member.level - 1) * ascendedMultiplier),
    constitution: Math.trunc(definition.fields.baseConstitution * ascendedMultiplier),
    intelligence: Math.trunc(definition.fields.baseIntelligence * ascendedMultiplier),
    dexterity: Math.trunc(definition.fields.baseDexterity * ascendedMultiplier),
    defense: definition.fields.baseDefense,
    magicDefense: definition.fields.baseMagicDefense,
  }
  for (const itemId of [member.weaponId, member.armorId, member.accessoryId]) {
    const bonus = equipmentStats(itemId ? index.items.get(itemId) : undefined)
    const multiplier = itemId === member.accessoryId && doctrineAbilityValue(member, 'LORE_MASTER') > 0 ? 2 : 1
    for (const [key] of STAT_LABELS) stats[key] += bonus[key] * multiplier
  }
  stats.maxHp += doctrineAbilityValue(member, 'IMPROVED_HEALTH') + doctrineAbilityValue(member, 'EXALTED_HEALTH')
  stats.constitution += doctrineAbilityValue(member, 'IMPROVED_CONSTITUTION') + doctrineAbilityValue(member, 'EXALTED_CONSTITUTION')
  stats.intelligence += doctrineAbilityValue(member, 'IMPROVED_INTELLIGENCE') + doctrineAbilityValue(member, 'EXALTED_INTELLIGENCE')
  stats.dexterity += doctrineAbilityValue(member, 'IMPROVED_DEXTERITY') + doctrineAbilityValue(member, 'EXALTED_DEXTERITY')
  stats.defense += doctrineAbilityValue(member, 'TROLL_RESISTANCE')
  stats.magicDefense += doctrineAbilityValue(member, 'WARLOCK_RESILIENCE')
  stats.constitution += member.potionsDrank?.[0] ?? 0
  stats.dexterity += member.potionsDrank?.[1] ?? 0
  stats.intelligence += member.potionsDrank?.[2] ?? 0
  stats.maxHp += (member.potionsDrank?.[3] ?? 0) * 5
  stats.defense += member.potionsDrank?.[4] ?? 0
  stats.magicDefense += member.potionsDrank?.[5] ?? 0
  for (const key of ['constitution', 'intelligence', 'dexterity'] as const) {
    stats[key] = gameRound(stats[key] * traitModifier(member.trait, key))
  }
  return stats
}

export function equipmentDifference(current: ItemDefinition | undefined, candidate: ItemDefinition) {
  const before = equipmentStats(current)
  const after = equipmentStats(candidate)
  return STAT_LABELS.map(([key, label]) => ({ key, label, value: after[key] - before[key] }))
}
