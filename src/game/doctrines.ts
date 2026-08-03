import type { AdventurerState, DoctrineId } from './types'
import type { ContentIndex } from './content'

export interface DoctrineAbilityDefinition {
  id: string
  cost: number
  increase: number
  maxLevel: number
  row: 1 | 2 | 3
}

const ability = (id: string, cost: number, increase: number, maxLevel: number, row: 1 | 2 | 3): DoctrineAbilityDefinition =>
  ({ id, cost, increase, maxLevel, row })

export const DOCTRINE_ABILITIES: Record<string, DoctrineAbilityDefinition> = Object.fromEntries([
  ability('IMPROVED_HEALTH', 1, 15, 5, 1), ability('IMPROVED_CONSTITUTION', 1, 2, 5, 1),
  ability('IMPROVED_DEXTERITY', 1, 2, 5, 1), ability('IMPROVED_INTELLIGENCE', 1, 2, 5, 1),
  ability('EXALTED_CONSTITUTION', 1, 3, 5, 1), ability('EXALTED_DEXTERITY', 1, 3, 5, 1),
  ability('EXALTED_INTELLIGENCE', 1, 3, 5, 1), ability('EXALTED_HEALTH', 1, 25, 5, 2),
  ability('EXALTED_MANA', 3, 1, 3, 2), ability('LORE_MASTER', 10, 100, 1, 3),
  ability('SERVUS_SANGUINIS', 2, 8, 3, 2), ability('SERVUS_UMBRAE', 2, 2, 3, 2),
  ability('NECROSIS_PORPHYRICA', 3, 25, 3, 2), ability('GENUS_VAMPYRI', 5, 20, 1, 3),
  ability('IMPENETRABLE_WILLPOWER', 2, 20, 3, 2), ability('CHILLING_FLOW', 3, 30, 2, 2),
  ability('MIND_BENDER', 2, 5, 3, 2), ability('STAR_GAZE', 4, 5, 2, 3),
  ability('ARCANE_SUPPRESSION', 6, 150, 1, 3), ability('CONDITIONED_REFLEXES', 2, 10, 3, 2),
  ability('TACTICAL_KNOWLEDGE', 3, 20, 2, 2), ability('RELENTLESS_ASSAULT', 7, 1, 1, 3),
  ability('WEAPON_MASTER', 10, 1, 1, 3), ability('EPHEMERAL_PRESENCE', 2, 3, 3, 2),
  ability('BEAT_THE_ODDS', 3, 1, 1, 3), ability('FALSE_LIFE', 4, 4, 2, 3),
  ability('TRUE_AGONY', 3, 1500, 1, 3), ability('TROLL_RESISTANCE', 3, 1, 2, 2),
  ability('WARLOCK_RESILIENCE', 3, 1, 2, 2), ability('MANIFEST_DANGER', 4, 1, 1, 2),
  ability('MIRROR_OF_ANGUISH', 8, 1, 1, 3), ability('EXPOSE_WEAKNESS', 2, 8, 3, 2),
  ability('EXPLOIT_WEAKNESS', 2, 12, 3, 2), ability('LIGHTNING_SPEED', 3, 15, 3, 3),
  ability('EYE_FOR_AN_EYE', 4, 50, 1, 3), ability('RAGEBOUND', 4, 35, 1, 3),
  ability('DIVINE_INTERVENTION', 2, 1, 3, 2), ability('SELFLESS_SPIRIT', 2, 10, 4, 2),
  ability('OVERHEAL', 3, 5, 2, 3), ability('HEALING_NOVA', 5, 7, 1, 3),
].map((entry) => [entry.id, entry]))

export const DOCTRINES: Record<DoctrineId, { id: DoctrineId; imageKey: string; abilities: string[] }> = {
  Affliction: { id: 'Affliction', imageKey: 'doctrine_of_affliction', abilities: ['IMPROVED_HEALTH', 'IMPROVED_DEXTERITY', 'NECROSIS_PORPHYRICA', 'SERVUS_SANGUINIS', 'SERVUS_UMBRAE', 'GENUS_VAMPYRI'] },
  Control: { id: 'Control', imageKey: 'doctrine_of_control', abilities: ['IMPROVED_INTELLIGENCE', 'IMPENETRABLE_WILLPOWER', 'MIND_BENDER', 'CHILLING_FLOW', 'STAR_GAZE', 'ARCANE_SUPPRESSION'] },
  Fortitude: { id: 'Fortitude', imageKey: 'doctrine_of_fortitude', abilities: ['IMPROVED_HEALTH', 'IMPROVED_CONSTITUTION', 'MANIFEST_DANGER', 'TROLL_RESISTANCE', 'WARLOCK_RESILIENCE', 'MIRROR_OF_ANGUISH'] },
  Grace: { id: 'Grace', imageKey: 'doctrine_of_grace', abilities: ['IMPROVED_HEALTH', 'IMPROVED_INTELLIGENCE', 'SELFLESS_SPIRIT', 'DIVINE_INTERVENTION', 'OVERHEAL', 'HEALING_NOVA'] },
  Illusion: { id: 'Illusion', imageKey: 'doctrine_of_illusion', abilities: ['IMPROVED_DEXTERITY', 'IMPROVED_INTELLIGENCE', 'EPHEMERAL_PRESENCE', 'BEAT_THE_ODDS', 'FALSE_LIFE', 'TRUE_AGONY'] },
  Knowledge: { id: 'Knowledge', imageKey: 'doctrine_of_knowlegde', abilities: ['EXALTED_CONSTITUTION', 'EXALTED_DEXTERITY', 'EXALTED_INTELLIGENCE', 'EXALTED_HEALTH', 'EXALTED_MANA', 'LORE_MASTER'] },
  Ruin: { id: 'Ruin', imageKey: 'doctrine_of_ruin', abilities: ['IMPROVED_DEXTERITY', 'EXPOSE_WEAKNESS', 'EXPLOIT_WEAKNESS', 'LIGHTNING_SPEED', 'EYE_FOR_AN_EYE', 'RAGEBOUND'] },
  War: { id: 'War', imageKey: 'doctrine_of_war', abilities: ['IMPROVED_CONSTITUTION', 'IMPROVED_DEXTERITY', 'CONDITIONED_REFLEXES', 'TACTICAL_KNOWLEDGE', 'RELENTLESS_ASSAULT', 'WEAPON_MASTER'] },
}

export const doctrineIds = Object.keys(DOCTRINES) as DoctrineId[]

export function doctrineAbilityValue(member: AdventurerState, abilityId: string) {
  if (!member.doctrineId) return 0
  const slot = DOCTRINES[member.doctrineId].abilities.indexOf(abilityId)
  const definition = DOCTRINE_ABILITIES[abilityId]
  return slot < 0 || !definition ? 0 : (member.doctrineLevels[slot] ?? 0) * definition.increase
}

export function doctrinePointsFromLevels(member: AdventurerState, index: ContentIndex) {
  const maxLevel = index.adventurers.get(member.classId)?.fields.maxLevel ?? 5
  return Math.trunc((Math.trunc((maxLevel - 5) * 0.5 * Math.trunc(maxLevel / 5)) + member.level) / 15) + 3
}

export function doctrinePointsAvailable(member: AdventurerState, index: ContentIndex, loyaltyLevel: number) {
  if (!member.ascended || !member.doctrineId) return 0
  const spent = DOCTRINES[member.doctrineId].abilities.reduce((total, id, slot) =>
    total + (member.doctrineLevels[slot] ?? 0) * DOCTRINE_ABILITIES[id].cost, 0)
  return doctrinePointsFromLevels(member, index) + loyaltyLevel - spent
}
