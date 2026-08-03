import type { StatusEffectType } from './types'

export type TargetMode =
  | 'randomEnemy'
  | 'allEnemies'
  | 'lowestAbsoluteEnemy'
  | 'lowestRelativeEnemy'
  | 'randomExceptSelf'
  | 'allExceptSelf'
  | 'all'
  | 'randomAlly'
  | 'randomAllyExceptSelf'
  | 'lowestAbsoluteAlly'
  | 'lowestRelativeAlly'
  | 'lowestShieldAlly'
  | 'mostConditionsOrLowestRelativeAlly'
  | 'allAllies'

export interface SkillStatusSpec {
  type: StatusEffectType
  turnsLeft: number
  probability?: number
  applyOnDodge?: boolean
  turnsFromDamageDivisor?: number
}

export interface CombatSkillStep {
  target?: TargetMode
  targetCount?: number
  damageAmplification?: number
  darknessDamageScale?: number
  criticalAmplification?: number
  healing?: boolean
  status?: SkillStatusSpec
  forceRanged?: boolean
  executionThreshold?: number
  recastOnKill?: boolean
  reviveProbability?: number
  noLog?: boolean
}

export type SkillSpecial =
  | 'escape'
  | 'fragmentation'
  | 'overdrive'
  | 'fireDance'
  | 'botchedSacrifice'
  | 'dreamForge'
  | 'enGarde'

export interface ActiveSkillProfile {
  steps: CombatSkillStep[]
  special?: SkillSpecial
  tetherDamageAmplification?: number
}

const step = (value: CombatSkillStep = {}): CombatSkillStep => value
const skill = (...steps: CombatSkillStep[]): ActiveSkillProfile => ({ steps })
const all = (value: CombatSkillStep = {}): CombatSkillStep => ({ target: 'allEnemies', ...value })
const count = (targetCount: number, value: CombatSkillStep = {}): CombatSkillStep => ({ target: 'randomEnemy', targetCount, ...value })
const status = (type: StatusEffectType, turnsLeft: number, probability = 1, applyOnDodge = false): SkillStatusSpec => ({ type, turnsLeft, probability, applyOnDodge })

export const ACTIVE_SKILLS: Record<string, ActiveSkillProfile> = {
  ACTIVE_MIGHTY_STRIKE: skill(step({ damageAmplification: 2 })),
  ACTIVE_CRUSHING_STRIKE: skill(step({ damageAmplification: 2.5 })),
  ACTIVE_TAUNT_I: skill(step({ damageAmplification: 2, status: status('TAUNT', 2, 1, true) })),
  ACTIVE_TAUNT_II: skill(step({ damageAmplification: 2, status: status('TAUNT', 4, 1, true) })),
  ACTIVE_TAUNT_III: skill(step({ damageAmplification: 2, status: status('TAUNT', 8, 1, true) })),
  ACTIVE_TAUNT_IV: skill(step({ damageAmplification: 6, status: status('TAUNT', 8, 1, true) })),
  ACTIVE_EN_GARDE: { special: 'enGarde', steps: [step({ damageAmplification: 2 })] },
  ACTIVE_OVERWHELM: skill(step({ damageAmplification: 3, status: status('STUN', 1, 0.7) })),
  ACTIVE_DECIMATE_I: skill(all({ damageAmplification: 3, status: status('STUN', 1, 0.7) })),
  ACTIVE_DECIMATE_II: skill(all({ damageAmplification: 3, status: status('STUN', 1) })),
  ACTIVE_DECIMATE_III: skill(all({ damageAmplification: 4, status: status('STUN', 1) })),
  ACTIVE_CONDEMN: skill(step({ damageAmplification: 2.5, status: status('SILENCE', 1, 1, true) })),
  ACTIVE_CONDEMN_ALL_I: skill(all({ damageAmplification: 2.5, status: status('SILENCE', 1, 1, true) })),
  ACTIVE_CONDEMN_ALL_II: skill(all({ damageAmplification: 2.5, status: status('SILENCE', 2, 1, true) })),
  ACTIVE_BARRAGE_I: skill(count(2)),
  ACTIVE_BARRAGE_II: { steps: [count(3)], tetherDamageAmplification: 10 },
  ACTIVE_BARRAGE_III: skill(count(4)),
  ACTIVE_BARRAGE_IV: skill(count(5)),
  ACTIVE_BARRAGE_V: skill(count(6)),
  ACTIVE_BARRAGE_VI: skill(count(7)),
  ACTIVE_BARRAGE_VII: skill(count(9)),
  ACTIVE_BARRAGE_VIII: skill(count(11)),
  ACTIVE_FOCUSED_BARRAGE: skill(all({ damageAmplification: 0.5 }), all({ damageAmplification: 0.5, noLog: true })),
  ACTIVE_INCINERATE: skill(all({ damageAmplification: 2, forceRanged: true, status: status('ABLAZE', 1, 1, true) })),
  ACTIVE_INCINERATE_II: skill(all({ damageAmplification: 3, forceRanged: true, status: status('ABLAZE', 1, 1, true) })),
  ACTIVE_SUBLIMATE: skill(
    all({ damageAmplification: 1.7, forceRanged: true, status: status('ABLAZE', 1, 1, true) }),
    all({ damageAmplification: 1.7, noLog: true, status: status('FROZEN', 2) }),
  ),
  ACTIVE_BACKSTAB_I: skill(step({ criticalAmplification: 1.5 })),
  ACTIVE_BACKSTAB_II: skill(step({ criticalAmplification: 2 })),
  ACTIVE_BACKSTAB_III: skill(step({ criticalAmplification: 3 })),
  ACTIVE_UMBRAL_STRIKE_I: skill(step({ criticalAmplification: 1.5, darknessDamageScale: 2 })),
  ACTIVE_UMBRAL_STRIKE_II: skill(step({ criticalAmplification: 1.5, darknessDamageScale: 5 })),
  ACTIVE_UMBRAL_STRIKE_III: skill(step({ criticalAmplification: 2, darknessDamageScale: 6 })),
  ACTIVE_ECLIPSE_I: skill(step({ target: 'lowestAbsoluteEnemy', criticalAmplification: 3, recastOnKill: true })),
  ACTIVE_ECLIPSE_II: skill(step({ target: 'lowestRelativeEnemy', criticalAmplification: 3, executionThreshold: 0.1, recastOnKill: true })),
  ACTIVE_ECLIPSE_III: skill(step({ target: 'lowestRelativeEnemy', criticalAmplification: 3, executionThreshold: 0.2, recastOnKill: true })),
  ACTIVE_ECLIPSE_IV: skill(step({ target: 'lowestRelativeEnemy', criticalAmplification: 3, executionThreshold: 0.25, recastOnKill: true })),
  ACTIVE_FEINT: skill(step({ criticalAmplification: 1.5, status: status('STUN', 1) })),
  ACTIVE_PETRIFYING_MELODY: skill(step({ criticalAmplification: 1.5, forceRanged: true, status: status('PETRIFY', 1) })),
  ACTIVE_THOUSAND_CUTS: skill(step({ criticalAmplification: 3, status: { ...status('BLEED', 0), turnsFromDamageDivisor: 3 } })),
  ACTIVE_THOUSAND_CUTS_II: skill(step({ criticalAmplification: 3, status: { ...status('BLEED', 0), turnsFromDamageDivisor: 2 } })),
  ACTIVE_ENERGY_BURST_I: skill(step({ damageAmplification: 1.5, forceRanged: true })),
  ACTIVE_ENERGY_BURST_II: skill(step({ damageAmplification: 2, forceRanged: true })),
  ACTIVE_FIRE_BURST: skill(step({ damageAmplification: 2, forceRanged: true, status: status('ABLAZE', 1) })),
  ACTIVE_FIREBALL: skill(all({ damageAmplification: 2, forceRanged: true, status: status('ABLAZE', 1) })),
  ACTIVE_METEOR_I: skill(all({ damageAmplification: 2.3, forceRanged: true, status: status('ABLAZE', 1) })),
  ACTIVE_METEOR_II: skill(all({ damageAmplification: 2.3, forceRanged: true, status: status('ABLAZE', 2) })),
  ACTIVE_HEAL: skill(step({ target: 'lowestRelativeAlly', healing: true, damageAmplification: 2 })),
  ACTIVE_MASS_HEAL_I: skill(step({ target: 'allAllies', healing: true, damageAmplification: 2 })),
  ACTIVE_MASS_HEAL_II: skill(step({ target: 'allAllies', healing: true, damageAmplification: 2, status: status('REGENERATION', 2) })),
  ACTIVE_MASS_HEAL_III: skill(step({ target: 'allAllies', healing: true, damageAmplification: 2.3, status: status('REGENERATION', 3) })),
  ACTIVE_RESTORATION_I: skill(step({ target: 'allAllies', healing: true, damageAmplification: 2.3, reviveProbability: 0.04, status: status('REGENERATION', 3) })),
  ACTIVE_RESTORATION_II: skill(step({ target: 'allAllies', healing: true, damageAmplification: 2.6, reviveProbability: 0.06, status: status('REGENERATION', 3) })),
  ACTIVE_CURSE_I: skill(step({ damageAmplification: 3, status: status('LESSER_CURSE', 999) })),
  ACTIVE_CURSE_II: skill(step({ damageAmplification: 3.25, status: status('CURSE', 999) })),
  ACTIVE_CURSE_III: skill(step({ damageAmplification: 3.5, status: status('GREATER_CURSE', 999) })),
  ACTIVE_CURSE_IV: skill(step({ damageAmplification: 3.75, status: status('OMINOUS_CURSE', 999) })),
  ACTIVE_CURSE_V: skill(step({ damageAmplification: 4, status: status('ABHORRENT_CURSE', 999) })),
  ACTIVE_FLAY: skill(step({ target: 'randomExceptSelf', damageAmplification: 10, forceRanged: false })),
  ACTIVE_ANNIHILATE: skill(step({ target: 'allExceptSelf', damageAmplification: 10, forceRanged: false })),
  ACTIVE_OBLITERATE: skill(step({ target: 'allExceptSelf', damageAmplification: 20, forceRanged: false })),
  ACTIVE_EXTIRPATE: skill(step({ target: 'allExceptSelf', damageAmplification: 30, forceRanged: false })),
  ACTIVE_WHIP_AND_TEAR: skill(
    step({ target: 'allExceptSelf', damageAmplification: 30, forceRanged: false }),
    step({ target: 'randomExceptSelf', forceRanged: true, noLog: true }),
  ),
  ACTIVE_STOMP: skill(all({ status: status('STUN', 1) })),
  ACTIVE_ESCAPE: { special: 'escape', steps: [] },
  ACTIVE_SOOTHING_WINDS: skill(all({ status: status('STUN', 3, 0.6, true) })),
  ACTIVE_QUICKSAND_GRASP: skill(step({ damageAmplification: 2, status: status('SILENCE', 4) })),
  ACTIVE_SANDSTORM: skill(all({ damageAmplification: 0.5, status: status('SILENCE', 5, 0.8, true) })),
  ACTIVE_RESTORE_ORDER: skill(all({ damageAmplification: 0.9 })),
  ACTIVE_PROTECT_THE_WEAK: skill(all({ damageAmplification: 0.1, status: status('TAUNT', 2, 1, true) })),
  ACTIVE_STATIC_SURGE: skill(all({ damageAmplification: 2.5, status: status('STUN', 1, 0.5) })),
  ACTIVE_ARCANE_STRIKE: skill(step({ damageAmplification: 4 })),
  ACTIVE_FLINTLOCK_SHOT: skill(step({ damageAmplification: 2, forceRanged: true, status: status('ABLAZE', 1) })),
  ACTIVE_ICE_TOMB: skill(step({ damageAmplification: 10, status: status('FROZEN', 20) })),
  ACTIVE_FROZEN_BREATH: skill(all({ status: status('FROZEN', 2) })),
  ACTIVE_ARCANE_BARRAGE: skill(count(12)),
  ACTIVE_DESERT_JUDGEMENT: skill(count(4, { damageAmplification: 1.5 })),
  ACTIVE_DISEMBODY: skill(all({ damageAmplification: 1111, criticalAmplification: 0.66 })),
  ACTIVE_PANDEMONIUM: skill(all({ damageAmplification: 0.75, criticalAmplification: 0.66 })),
  ACTIVE_FRAGMENTATION: { special: 'fragmentation', steps: [count(5, { forceRanged: true })] },
  ACTIVE_ARCANE_DIFFUSION: skill(all({ damageAmplification: 0.4 })),
  ACTIVE_SACRIFICE: skill(step({ damageAmplification: 100, criticalAmplification: 0.66 })),
  ACTIVE_CHOKING_POWDER: skill(all({ damageAmplification: 0.4, status: status('SILENCE', 3, 1, true) })),
  ACTIVE_DAZE: skill(all({ damageAmplification: 0.1, status: status('STUN', 2) })),
  ACTIVE_FLEECE: skill(all({ damageAmplification: 0.35, status: status('BLEED', 40) })),
  ACTIVE_DISASSEMBLE: skill(all({ damageAmplification: 0.1, status: status('TAUNT', 5, 1, true) })),
  ACTIVE_OVERDRIVE: { special: 'overdrive', steps: [all({ damageAmplification: 0.7, status: status('STUN', 1) })] },
  ACTIVE_RAYS_OF_DESTRUCTION: skill(count(8, { damageAmplification: 0.4 })),
  ACTIVE_THE_TEN_HELLS: skill(all({ damageAmplification: 100_000, criticalAmplification: 0.66 })),
  ACTIVE_INSTILL_TERROR: skill(all({ damageAmplification: 0.15, status: status('STUN', 1, 0, true) })),
  ACTIVE_FIRE_DANCE: { special: 'fireDance', steps: [] },
  ACTIVE_BOTCHED_SACRIFICE: { special: 'botchedSacrifice', steps: [] },
  ACTIVE_DREAM_FORGE: { special: 'dreamForge', steps: [count(10, { damageAmplification: 2 })] },
  ACTIVE_GRAVITY_SHIFT: skill(all({ damageAmplification: 0.5 })),
  ACTIVE_SMASH: skill(all({ damageAmplification: 0.5 })),
  ACTIVE_LIGHTS_OUT: skill(step({ target: 'lowestRelativeEnemy', damageAmplification: 10 })),
  ACTIVE_LIVE_TEST: skill(all({ damageAmplification: 0.05, status: status('POISON', 3, 1, true) })),
  ACTIVE_AT_THE_STAKE: skill(all({ damageAmplification: 0.2, status: status('ABLAZE', 4) })),
  ACTIVE_TABULA_RASA: skill(all({ damageAmplification: 0.5, status: status('ABLAZE', 2) })),
  ACTIVE_BOUNCE: skill(count(10, { damageAmplification: 0.5, status: status('STUN', 4) })),
  ACTIVE_DEVOUR_SPIRIT: skill(all({ damageAmplification: 0.2, status: status('TERRIFY', 1) })),
}

export function activeSkillLabel(skillId: string) {
  return skillId
    .replace(/^ACTIVE_/, '')
    .replace(/_([IVX]+)$/, ' $1')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

