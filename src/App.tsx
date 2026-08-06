import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import './App.css'
import type { ContentIndex } from './game/content'
import { assetUrl } from './game/content'
import type { AdventurerDefinition, AdventurerState, AreaDefinition, AreaRun, EnemyDefinition, EnemyState, EquipmentSlot, GameContent, ItemDefinition, PetAbilityType, PetDefinition, PetState, ScreenId, StatusEffectState, StatusEffectType } from './game/types'
import { adventurerAttackBounds, buildingCapacity, experienceToNextLevel, marketListingsCapacity, marketListingsPrice, marketSaleSeconds, marketTimePrice, petFoodToNextLevel, quartersPrice, shelterAutofeedPrice, shelterCapacity, shelterPrice, storagePrice, tavernCapacityPrice, tavernTimePrice, tavernVisitorIntervalSeconds, workshopCraftSeconds, workshopQueueCapacity, workshopQueuePrice, workshopTimePrice } from './game/formulas'
import { GameStore, useGame } from './game/store'
import { I18nProvider, localizeActiveSkill, localizeDoctrineAbility, localizeKingMessage, localizePassiveSkill, localizeQuestDescription, localizeRareTrait, localizeStatus, useI18n } from './game/i18n'
import { inventoryCount, maxCraftable, RECIPES } from './game/recipes'
import { adventurerStats, defaultWeaponId, equipmentDifference, equipmentItemId, itemMatchesSlot, weaponIsMagic, weaponIsRanged, weaponTypeKey } from './game/stats'
import { Modal } from './components/Modal'
import { ProgressBar } from './components/ProgressBar'
import { areaTeamSize, canConsumeSpecial, completedEpicRaid, epicRaidProgressTarget, potionLimit, potionTypeForItem, promotionChoices, questRefreshPrice, raidTryAvailable, raidTryCost, RARE_TRAITS, statusIconKey } from './game/engine'
import { DOCTRINE_ABILITIES, DOCTRINES, doctrineAbilityValue, doctrineIds, doctrinePointsAvailable } from './game/doctrines'
import { ACHIEVEMENTS, achievementProgress } from './game/achievements'
import { ACTIVE_SKILLS, type CombatSkillStep, type TargetMode } from './game/combatSkills'

interface AppProps {
  content: GameContent
  index: ContentIndex
  store: GameStore
}

type DialogState =
  | { type: 'building'; id: string }
  | { type: 'market'; itemId?: string }
  | { type: 'area'; areaId: string }
  | { type: 'send'; areaId: string }
  | { type: 'refillRaid'; areaId: string }
  | { type: 'adventurer'; uid: number }
  | { type: 'equipment'; uid: number; slot: EquipmentSlot }
  | { type: 'merchant' }
  | { type: 'quests' }
  | { type: 'messages' }
  | { type: 'bestiary' }
  | { type: 'potion'; itemId: string }
  | { type: 'roster' }
  | { type: 'faq' }
  | { type: 'account' }
  | { type: 'settings' }
  | { type: 'achievements' }
  | { type: 'shop' }
  | { type: 'reset' }
  | null

const TRAIT_DETAILS: Record<string, [string, string]> = {
  BOOKWORM: ['Intelligence +10%; Constitution and Dexterity −5%.', 'Trí tuệ +10%; Thể chất và Nhanh nhẹn −5%.'],
  BOOKWORM_PLUS: ['Intelligence +15%; Constitution and Dexterity −5%.', 'Trí tuệ +15%; Thể chất và Nhanh nhẹn −5%.'],
  BRUTE: ['Constitution +10%; Intelligence −5%.', 'Thể chất +10%; Trí tuệ −5%.'],
  BRUTE_PLUS: ['Constitution +15%; Intelligence −5%.', 'Thể chất +15%; Trí tuệ −5%.'],
  FERAL: ['Dexterity +10%; Constitution and Intelligence −5%.', 'Nhanh nhẹn +10%; Thể chất và Trí tuệ −5%.'],
  FERAL_PLUS: ['Dexterity +15%; Constitution and Intelligence −5%.', 'Nhanh nhẹn +15%; Thể chất và Trí tuệ −5%.'],
  EMPATHETIC: ['Healing done and received is 20% stronger.', 'Hiệu quả hồi máu gây ra và nhận vào tăng 20%.'],
  GIFTED: ['Mana regeneration +2 each turn.', 'Hồi năng lượng mỗi lượt +2.'],
  INTIMIDATING: ['Threat +1, making enemies more likely to target this adventurer.', 'Uy hiếp +1, khiến kẻ địch ưu tiên mục tiêu này hơn.'],
  FOCUSED: ['Accuracy +15%.', 'Độ chính xác +15%.'],
  DRAGON_BLOOD: ['Reduces each incoming hit by a flat amount based on class level cap; stronger after Ascension.', 'Giảm phẳng sát thương mỗi đòn dựa trên cấp tối đa của class; mạnh hơn sau Thăng hoa.'],
  CURSED: ['Lifesteal +15%, but loses 4% max HP to decay each turn.', 'Hút máu +15%, nhưng mất 4% HP tối đa mỗi lượt vì suy kiệt.'],
  REACTIVE: ['Counterattack chance +10%.', 'Tỷ lệ phản đòn +10%.'],
  NOCTURNAL: ['Darkness damage amplification +0.5%.', 'Khuếch đại sát thương trong Bóng tối +0,5%.'],
  MINDFUL: ['Status-effect immunity +10%.', 'Miễn nhiễm hiệu ứng trạng thái +10%.'],
  TROLL_BLOOD: ['Regenerates HP each turn based on class level cap; stronger after Ascension.', 'Hồi HP mỗi lượt dựa trên cấp tối đa của class; mạnh hơn sau Thăng hoa.'],
  NIMBLE: ['Dodge chance +8%.', 'Tỷ lệ né tránh +8%.'],
  RUTHLESS: ['Critical damage is multiplied by 1.2.', 'Sát thương chí mạng được nhân 1,2.'],
  BLESSED: ['Darkness reduction +8 for the party.', 'Giảm Bóng tối của đội +8.'],
  ALERT: ['Acts first at the start of combat.', 'Hành động đầu tiên khi bắt đầu giao chiến.'],
}

const STAT_DETAILS: Record<string, [string, string]> = {
  HP: ['Maximum health. It gains +1 per level and can be raised by equipment, Health potions, doctrines and Ascension. Damage lowers current HP only; removing bonuses can lower the maximum.', 'Máu tối đa. Tăng +1 mỗi cấp và có thể tăng bằng trang bị, Potion of Health, Doctrine và Thăng hoa. Sát thương chỉ giảm HP hiện tại; tháo bonus có thể hạ HP tối đa.'],
  CON: ['Reduces every incoming hit by floor(CON ÷ 8). It also powers Sword damage and part of Dagger damage. Increase it with equipment, potions and doctrines; traits can raise or lower it by percentage.', 'Giảm mỗi đòn nhận vào theo floor(CON ÷ 8). Đồng thời tăng sát thương Kiếm và một phần sát thương Dao găm. Tăng bằng trang bị, potion và Doctrine; trait có thể tăng/giảm theo phần trăm.'],
  INT: ['Powers Staff magic damage and increases mana regeneration (floor(INT ÷ 10) + 10). Increase it with equipment, potions and doctrines; traits can modify it.', 'Tăng sát thương phép từ Trượng và hồi năng lượng (floor(INT ÷ 10) + 10). Tăng bằng trang bị, potion và Doctrine; trait có thể điều chỉnh chỉ số này.'],
  DEX: ['Powers Bow damage and part of Dagger damage. It also raises critical chance by 0.4% per relevant attack stat, capped at 40%. Increase it with equipment, potions and doctrines; traits can modify it.', 'Tăng sát thương Cung và một phần sát thương Dao găm. Nó cũng tăng tỷ lệ chí mạng 0,4% theo chỉ số tấn công liên quan, tối đa 40%. Tăng bằng trang bị, potion và Doctrine; trait có thể điều chỉnh chỉ số này.'],
  DEF: ['Reduces physical damage by 1% per point, capped at 100%, before Constitution and other flat reductions. Increase it with equipment, Defense potions and doctrines; it drops if those bonuses are removed.', 'Giảm sát thương vật lý 1% mỗi điểm, tối đa 100%, trước khi tính Thể chất và các giảm trừ phẳng khác. Tăng bằng trang bị, Potion of Defense và Doctrine; tháo bonus thì giảm.'],
  MDEF: ['Reduces magic damage by 1% per point, capped at 100%, before Constitution and other flat reductions. Increase it with equipment, Magic Defense potions and doctrines; it drops if those bonuses are removed.', 'Giảm sát thương phép 1% mỗi điểm, tối đa 100%, trước khi tính Thể chất và các giảm trừ phẳng khác. Tăng bằng trang bị, Potion of Magic Defense và Doctrine; tháo bonus thì giảm.'],
}

function DetailHint({ label, value, detail, className = '' }: { label: string; value?: ReactNode; detail: string; className?: string }) {
  const [open, setOpen] = useState(false)
  return <span className={`detail-hint ${value === undefined ? 'trait-hint' : ''} ${className} ${open ? 'is-open' : ''}`}>
    <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{label}<i aria-hidden="true">?</i></button>
    {value !== undefined && <b>{value}</b>}
    <span className="detail-hint-popup" role="tooltip">{detail}</span>
  </span>
}

function TraitHint({ language, trait }: { language: string; trait: string }) {
  const detail = TRAIT_DETAILS[trait]?.[language === 'vi' ? 1 : 0] ?? (language === 'vi' ? 'Đặc tính này không có mô tả bổ sung.' : 'This trait has no additional description.')
  return <DetailHint label={localizeRareTrait(language as 'en' | 'vi', trait)} detail={detail} />
}

function StatHint({ language, label, value }: { language: string; label: keyof typeof STAT_DETAILS; value: ReactNode }) {
  return <DetailHint label={label} value={value} detail={STAT_DETAILS[label][language === 'vi' ? 1 : 0]} />
}

const skillTargetText: Record<TargetMode, [string, string]> = {
  randomEnemy: ['a random enemy', 'một kẻ địch ngẫu nhiên'], allEnemies: ['all enemies', 'toàn bộ kẻ địch'], lowestAbsoluteEnemy: ['the enemy with the lowest HP', 'kẻ địch có HP thấp nhất'], lowestRelativeEnemy: ['the enemy with the lowest HP percentage', 'kẻ địch có phần trăm HP thấp nhất'], randomExceptSelf: ['a random target other than the caster', 'một mục tiêu ngẫu nhiên, trừ người dùng'], allExceptSelf: ['all other targets', 'mọi mục tiêu khác'], all: ['all targets', 'mọi mục tiêu'], randomAlly: ['a random ally', 'một đồng minh ngẫu nhiên'], randomAllyExceptSelf: ['a random ally other than the caster', 'một đồng minh ngẫu nhiên khác'], lowestAbsoluteAlly: ['the ally with the lowest HP', 'đồng minh có HP thấp nhất'], lowestRelativeAlly: ['the ally with the lowest HP percentage', 'đồng minh có phần trăm HP thấp nhất'], lowestShieldAlly: ['the ally with the lowest shield', 'đồng minh có khiên thấp nhất'], mostConditionsOrLowestRelativeAlly: ['the ally with the most conditions, otherwise the lowest HP percentage', 'đồng minh có nhiều hiệu ứng nhất, nếu không thì HP% thấp nhất'], allAllies: ['all allies', 'toàn bộ đồng minh'],
}

function describeActiveStep(language: string, step: CombatSkillStep) {
  const vi = language === 'vi'
  const target = skillTargetText[step.target ?? 'randomEnemy'][vi ? 1 : 0]
  const action = step.healing
    ? (vi ? `Hồi phục cho ${target}` : `Heals ${target}`)
    : (vi ? `Tấn công ${target}` : `Attacks ${target}`)
  const details: string[] = []
  if (step.targetCount && step.targetCount > 1) details.push(vi ? `${step.targetCount} đòn` : `${step.targetCount} hits`)
  if (step.damageAmplification !== undefined) details.push(vi ? `${step.damageAmplification}× sức mạnh` : `${step.damageAmplification}× power`)
  if (step.criticalAmplification !== undefined) details.push(vi ? `${step.criticalAmplification}× sát thương chí mạng` : `${step.criticalAmplification}× critical damage`)
  if (step.status) {
    const chance = Math.round((step.status.probability ?? 1) * 100)
    const duration = step.status.turnsFromDamageDivisor ? (vi ? `theo sát thương (${step.status.turnsFromDamageDivisor})` : `from damage (${step.status.turnsFromDamageDivisor})`) : (step.status.turnsLeft >= 999 ? (vi ? 'đến hết trận' : 'for the battle') : (vi ? `${step.status.turnsLeft} lượt` : `${step.status.turnsLeft} turns`))
    details.push(vi ? `${chance}% gây ${localizeStatus('vi', step.status.type)} (${duration})` : `${chance}% ${localizeStatus('en', step.status.type)} (${duration})`)
  }
  if (step.executionThreshold) details.push(vi ? `kết liễu dưới ${step.executionThreshold * 100}% HP` : `executes below ${step.executionThreshold * 100}% HP`)
  if (step.recastOnKill) details.push(vi ? 'niệm lại khi hạ mục tiêu' : 'recasts on kill')
  if (step.reviveProbability) details.push(vi ? `${step.reviveProbability * 100}% hồi sinh đồng minh` : `${step.reviveProbability * 100}% ally revive`)
  return `${action}${details.length ? ` — ${details.join(', ')}.` : '.'}`
}

function describeActiveSkill(language: string, skillId: string) {
  const profile = ACTIVE_SKILLS[skillId]
  const vi = language === 'vi'
  if (!profile) return vi ? 'Tự động niệm khi Mana đạt 100.' : 'Casts automatically when Mana reaches 100.'
  const special: Record<string, [string, string]> = {
    escape: ['Escapes from combat instead of dealing damage.', 'Thoát khỏi giao chiến thay vì gây sát thương.'],
    enGarde: ['Attacks, then adopts a defensive stance.', 'Tấn công rồi chuyển sang thế phòng thủ.'],
    fireDance: ['Starts the Fire Ritual and sets the caster Ablaze.', 'Khởi động Fire Ritual và khiến người dùng bị Ablaze.'],
    dreamForge: ['Restores 10,000 HP to the caster before striking.', 'Hồi 10.000 HP cho người dùng trước khi tấn công.'],
    fragmentation: ['Splits into several ranged hits.', 'Tách thành nhiều đòn đánh tầm xa.'],
    overdrive: ['A powered-up area attack.', 'Đòn diện rộng cường hóa.'],
    botchedSacrifice: ['Uses its special combat behavior.', 'Dùng cơ chế chiến đấu đặc biệt của skill này.'],
  }
  const lines = [vi ? 'Tự động niệm khi Mana đạt 100.' : 'Casts automatically when Mana reaches 100.']
  if (profile.special) lines.push(special[profile.special]?.[vi ? 1 : 0] ?? '')
  lines.push(...profile.steps.map((step) => describeActiveStep(language, step)))
  return lines.filter(Boolean).join(' ')
}

function describePassiveSkill(language: string, skillId: string, fields: AdventurerDefinition['fields']) {
  const vi = language === 'vi'
  const details: string[] = [vi ? 'Luôn có hiệu lực trong chiến đấu.' : 'Always active in combat.']
  const add = (en: string, vn: string) => details.push(vi ? vn : en)
  const onHit = (fields.onTargetHit as { statusEffect?: { type?: StatusEffectState['type']; turns?: number; probability?: number } } | undefined)?.statusEffect
  const onDeathEnemies = fields.onDeathEffectsOnEnemies as Array<{ statusEffect?: { type?: StatusEffectState['type'] } }> | undefined
  const onDeathAllies = fields.onDeathEffectsOnAllies as Array<{ statusEffect?: { type?: StatusEffectState['type'] } }> | undefined
  if (skillId.startsWith('PASSIVE_THREATENING') || Number(fields.threat ?? 1) > 1) add(`Threat ${fields.threat ?? 1}: enemies favor this unit.`, `Threat ${fields.threat ?? 1}: kẻ địch ưu tiên nhắm vào nhân vật này.`)
  if (fields.alwaysHits) add('Basic attacks cannot miss.', 'Đòn đánh thường không thể trượt.')
  if (fields.healer) add('After acting, heals the ally with the lowest HP percentage.', 'Sau lượt, hồi máu cho đồng minh có HP% thấp nhất.')
  if (fields.cleanser) add('The heal also removes one negative status.', 'Lần hồi máu cũng xóa một hiệu ứng xấu.')
  if (Number(fields.flatDodgeChance ?? 0) > 0) add(`+${Math.round(Number(fields.flatDodgeChance) * 100)}% dodge.`, `+${Math.round(Number(fields.flatDodgeChance) * 100)}% né tránh.`)
  if (Number(fields.baseLifesteal ?? 0) > 0) add(`${fields.baseLifesteal}% lifesteal.`, `${fields.baseLifesteal}% hút máu.`)
  if (Number(fields.counterattack ?? 0) > 0) add(`${Math.round(Number(fields.counterattack) * 100)}% counterattack chance.`, `${Math.round(Number(fields.counterattack) * 100)}% phản đòn.`)
  if (Number(fields.darknessReduction ?? 0) > 0) add(`Reduces party darkness by ${fields.darknessReduction}.`, `Giảm Bóng tối của đội ${fields.darknessReduction}.`)
  if (Number(fields.darknessDamageAmplification ?? 0) > 0) add(`+${Math.round(Number(fields.darknessDamageAmplification) * 100)}% damage per Darkness.`, `+${Math.round(Number(fields.darknessDamageAmplification) * 100)}% sát thương mỗi điểm Bóng tối.`)
  if (Number(fields.immunityToStatus ?? 0) > 0) add(`${Math.round(Number(fields.immunityToStatus) * 100)}% status immunity.`, `${Math.round(Number(fields.immunityToStatus) * 100)}% kháng hiệu ứng.`)
  if (fields.nightVision) add('Ignores the Darkness accuracy penalty.', 'Bỏ qua phạt chính xác từ Bóng tối.')
  if (onHit?.type) {
    const chance = Math.round((onHit.probability ?? 1) * 100)
    add(`${chance}% chance for basic attacks to apply ${localizeStatus('en', onHit.type)} for ${onHit.turns ?? 1} turns.`, `${chance}% gây ${localizeStatus('vi', onHit.type)} trong ${onHit.turns ?? 1} lượt bằng đòn thường.`)
  }
  if (onDeathEnemies?.length) add('On death, inflicts its configured effects on all enemies.', 'Khi chết, gây các hiệu ứng đã cấu hình lên toàn bộ kẻ địch.')
  if (onDeathAllies?.length) add('On death, grants its configured effects to allies.', 'Khi chết, ban các hiệu ứng đã cấu hình cho đồng minh.')
  if (Number(fields.stunChanceOnLowerHp ?? 0) > 0) add(`${Math.round(Number(fields.stunChanceOnLowerHp) * 100)}% chance to Stun targets below the caster's HP.`, `${Math.round(Number(fields.stunChanceOnLowerHp) * 100)}% Stun mục tiêu có HP thấp hơn người dùng.`)
  if (typeof fields.endOfTurnAction === 'string') {
    if (fields.endOfTurnAction.startsWith('RIDER')) add('Performs its mount follow-up attack after acting.', 'Thực hiện đòn đánh nối tiếp của thú cưỡi sau lượt.')
    else if (fields.endOfTurnAction.startsWith('SHIELD')) add('Provides its shield support after acting.', 'Hỗ trợ khiên cho đồng minh sau lượt.')
    else if (fields.endOfTurnAction.startsWith('EXTRA_ATTACK')) add('Performs an extra follow-up attack after acting.', 'Thực hiện thêm một đòn đánh nối tiếp sau lượt.')
  }
  if (skillId === 'PASSIVE_SABOTEUR' || fields.saboteur) add('Targets enemy back rows when possible.', 'Ưu tiên nhắm hàng sau của kẻ địch khi có thể.')
  if (skillId === 'PASSIVE_CHAOTIC') add('Basic attacks choose any other combatant at random.', 'Đòn thường chọn ngẫu nhiên bất kỳ mục tiêu nào khác.')
  if (skillId === 'PASSIVE_DESPISE_WEAKNESS') add('Basic attacks favor enemies with the lowest HP percentage.', 'Đòn thường ưu tiên kẻ địch có HP% thấp nhất.')
  if (skillId === 'PASSIVE_PYROMANCY_II') add('Performs two extra weak attacks after acting.', 'Thực hiện thêm hai đòn yếu sau lượt.')
  return details.join(' ')
}

function SkillHint({ language, kind, skillId, fields }: { language: string; kind: 'active' | 'passive'; skillId: string; fields: AdventurerDefinition['fields'] }) {
  const label = kind === 'active' ? localizeActiveSkill(language as 'en' | 'vi', skillId) : localizePassiveSkill(language as 'en' | 'vi', skillId)
  const detail = kind === 'active' ? describeActiveSkill(language, skillId) : describePassiveSkill(language, skillId, fields)
  return <DetailHint label={label} detail={detail} className="skill-hint" />
}

function Currency({ amount, icon, label }: { amount: number; icon: string; label: string }) {
  return (
    <div className="currency" aria-label={`${amount} ${label}`}>
      <img src={assetUrl(icon)} alt="" />
      <strong>{amount.toLocaleString()}</strong>
    </div>
  )
}

function ToolButton({ icon, label, disabled, onClick }: { icon: string; label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button className="tool-button" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      <img src={assetUrl(icon)} alt="" />
    </button>
  )
}

function Headquarters({ onOpen, tavernCount, tavernCapacity }: { onOpen: (id: string) => void; tavernCount: number; tavernCapacity: number }) {
  const { t } = useI18n()
  const buildings = [
    ['quarters', 'sign_quarters'],
    ['tavern', 'sign_tavern'],
    ['storage', 'sign_storage'],
    ['market', 'sign_market'],
    ['workshop', 'sign_workshop'],
    ['shelter', 'sign_shelter'],
  ]
  return (
    <div className="headquarters-list view-enter">
      {buildings.map(([id, icon]) => (
        <button className="building-card" key={id} onClick={() => onOpen(id)}>
          <img className="building-sign" src={assetUrl(icon)} alt="" />
          <span>
            <strong>{t(`building.${id}`)}</strong>
            <small>{id === 'tavern' ? t('building.tavern.status', { current: tavernCount, max: tavernCapacity }) : t(`building.${id}.desc`)}</small>
          </span>
          <span className="card-chevron">›</span>
        </button>
      ))}
    </div>
  )
}

function AdventurersView({ store, index, onOpen, onManage }: { store: GameStore; index: ContentIndex; onOpen: (uid: number) => void; onManage: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  return (
    <div className="adventurer-list view-enter">
      <div className="section-heading">
        <strong>{t('adventurers.members')}</strong>
        <span>{state.adventurers.length} / {buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)}</span>
      </div>
      {state.adventurers.length === 0 && <EmptyState text={t('adventurers.empty')} />}
      {state.adventurers.map((adventurer) => {
        const definition = index.adventurers.get(adventurer.classId)
        if (!definition) return null
        const equipment = (['weapon', 'armor', 'accessory'] as EquipmentSlot[]).map((slot) => {
          const itemId = equipmentItemId(adventurer, slot)
          return { slot, item: itemId ? index.items.get(itemId) : undefined }
        })
        const traits = [adventurer.trait, adventurer.rareTrait]
          .filter(Boolean)
          .map((trait) => name(String(trait).replaceAll('_', ' ')))
          .join(' · ')
        return (
          <button className="adventurer-card" key={adventurer.uid} onClick={() => onOpen(adventurer.uid)}>
            <div className="adventurer-list-portrait">
              <img src={assetUrl(definition.imageKey)} alt="" />
              {adventurer.ascended && <span><img src={assetUrl(adventurer.doctrineId ? DOCTRINES[adventurer.doctrineId].imageKey : 'doctrine_of_knowledge')} alt="" /></span>}
              <small>{adventurer.level}</small>
            </div>
            <div className="adventurer-main">
              <strong>{adventurer.name}</strong>
              <small>{traits || name(definition.name)}</small>
            </div>
            {equipment.map(({ slot, item }) => <span className="adventurer-list-equipment" key={slot}><img src={assetUrl(item?.imageKey ?? 'empty_equipment')} alt="" /></span>)}
          </button>
        )
      })}
      {(state.adventurers.length > 0 || state.dismissedAdventurers.length > 0) && <button className="roster-manage-button" onClick={onManage}>⌃ {t('roster.manage')}</button>}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><span>◇</span><p>{text}</p></div>
}

function AreaCard({
  area,
  run,
  party,
  onClick,
  onCollect,
  raidTry,
  nextUnlock,
}: {
  area: AreaDefinition
  run?: AreaRun
  party: Array<{ member: AdventurerState; imageKey: string; maxHp: number }>
  onClick: () => void
  onCollect: () => void
  raidTry?: boolean
  nextUnlock?: { name: string; progress: number }
}) {
  const { t, name } = useI18n()
  const lootCount = run?.chest.reduce((total, item) => total + item.stack, 0) ?? 0
  const activeRun = run && !run.finished && run.partyIds.length > 0 ? run : undefined
  const actionProgress = activeRun ? (activeRun.actionTotal - activeRun.actionRemaining) / Math.max(1, activeRun.actionTotal) * 100 : 0
  const epicTarget = area.areaType === 2 ? epicRaidProgressTarget(area.id) : undefined
  const currentProgress = activeRun?.progress ?? (area.areaType === 2 ? run?.maxProgress : undefined)
  return (
    <article className="area-card">
      <button className="area-card-open" onClick={onClick} aria-label={activeRun ? `${name(area.name)}, ${t(`action.${activeRun.action}`)}` : name(area.name)}>
      <img className="area-card-image" src={assetUrl(area.summaryImageKey)} alt="" />
      <div className="area-card-content">
        <strong className="area-card-title">{name(area.name)}</strong>
        {area.areaType !== 0 && (
          <span className="raid-markers" aria-label={raidTry ? t('raid.tryAvailable') : t('raid.tryUnavailable')}>
            {area.areaType === 2 && <img src={assetUrl('epic_raid')} alt={t('raid.epic')} />}
            <img src={assetUrl(raidTry ? 'raid_try_available' : 'raid_try_unavailable')} alt="" />
          </span>
        )}
        {currentProgress !== undefined && <small className="area-map-progress">{area.areaType === 2 && epicTarget
          ? t('raid.epicProgress', { current: currentProgress, target: epicTarget })
          : t('map.roomProgress', { current: currentProgress })}</small>}
        {nextUnlock && <small className="area-unlock-progress">{t('map.nextUnlock', { current: Math.min(activeRun?.progress ?? 0, nextUnlock.progress), target: nextUnlock.progress, area: nextUnlock.name })}</small>}
        {activeRun ? (
          <>
            <div className="expedition-party" aria-label={t('dungeon.exploring', { count: party.length })}>
              {party.map(({ member, imageKey, maxHp }, partyIndex) => (
                <span className="expedition-member" key={member.uid} style={{ marginLeft: partyIndex === 0 ? 0 : 8 }}>
                  <img src={assetUrl(member.hp > 0 ? imageKey : 'tombstone')} alt={member.name} />
                  <i><b style={{ width: `${Math.max(0, Math.min(100, member.hp / maxHp * 100))}%` }} /></i>
                </span>
              ))}
            </div>
            <small className="area-action-label">{t(`action.${activeRun.action}`)}</small>
            <i className="area-action-progress"><b style={{ width: `${actionProgress}%` }} /></i>
          </>
        ) : null}
      </div>
      </button>
      {lootCount > 0 && (
        <button className="area-loot" onClick={onCollect} aria-label={t('dungeon.collectDrops', { count: lootCount, area: name(area.name) })}>
          <strong>{lootCount}/2k</strong>
          <img src={assetUrl(lootCount >= 2000 ? 'loot_chest_full' : 'loot_chest')} alt="" />
        </button>
      )}
    </article>
  )
}

function AreasView({
  store,
  index,
  content,
  raid,
  onOpen,
}: {
  store: GameStore
  index: ContentIndex
  content: GameContent
  raid: boolean
  onOpen: (areaId: string) => void
}) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const dungeonOrder = ['EnchantedForest', 'TheDesert', 'EternalBattlefield', 'TheGoldenCity', 'BlackwaterPort', 'FrostbitePeaks', 'ObsidianMines', 'TheSouthernGrove', 'BarrenWastelands', 'HiddenCityOfLarox', 'LostLands']
  const raidOrder = ['DivineArcheology', 'AncientGraveDigging', 'ImperialRescue', 'TheCultistRebels', 'TheLostExpedition', 'TheDreadfulAscent', 'CelestialMothership', 'TheDireDescent', 'SleepingPlanet', 'Kaunis', 'TheTower']
  const order = raid ? raidOrder : dungeonOrder
  const areas = content.areas
    .filter((area) => raid ? area.areaType !== 0 : area.areaType === 0)
    .filter((area) => state.unlockedAreas.includes(area.id))
    .filter((area) => !completedEpicRaid(state.runs[area.id]))
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  const nextRaidUnlock = content.areas
    .filter((area) => state.unlockedAreas.includes(area.id))
    .flatMap((area) => area.unlocks.map((unlock) => ({ source: area, unlock, target: index.areas.get(unlock.areaGetter) })))
    .filter((entry) => entry.target && entry.target.areaType !== 0 && !state.unlockedAreas.includes(entry.unlock.areaGetter))
    .sort((left, right) => left.unlock.progress - right.unlock.progress)[0]
  return (
    <div className="area-list view-enter">
      {areas.length === 0 && raid && <>
        <EmptyState text={t('raid.noneUnlocked')} />
        {nextRaidUnlock?.target && <p className="raid-unlock-hint">{t('raid.nextUnlock', {
          area: name(nextRaidUnlock.target.name),
          source: name(nextRaidUnlock.source.name),
          current: Math.min(state.runs[nextRaidUnlock.source.id]?.progress ?? 0, nextRaidUnlock.unlock.progress),
          target: nextRaidUnlock.unlock.progress,
        })}</p>}
      </>}
      {areas.map((area) => (
        <AreaCard
          key={area.id}
          area={area}
          run={state.runs[area.id]}
          party={(state.runs[area.id]?.partyIds ?? []).flatMap((uid) => {
            const member = state.adventurers.find((entry) => entry.uid === uid)
            const definition = member && index.adventurers.get(member.classId)
            return member && definition ? [{ member, imageKey: definition.imageKey, maxHp: adventurerStats(member, index).maxHp }] : []
          })}
          onClick={() => onOpen(area.id)}
          onCollect={() => store.collect(area.id)}
          raidTry={area.areaType !== 0 ? raidTryAvailable(state, area.id) : undefined}
          nextUnlock={area.unlocks
            .filter((unlock) => !state.unlockedAreas.includes(unlock.areaGetter))
            .sort((left, right) => left.progress - right.progress)
            .map((unlock) => ({ name: name(index.areas.get(unlock.areaGetter)?.name ?? unlock.areaGetter), progress: unlock.progress }))[0]}
        />
      ))}
    </div>
  )
}

function formatSeconds(seconds: number) {
  const safe = Math.max(0, Math.ceil(seconds))
  const hours = Math.floor(safe / 3_600)
  const minutes = Math.floor(safe / 60)
  const minutePart = Math.floor((safe / 60) % 60)
  const secondPart = safe % 60
  if (hours === 0) return `${minutes}:${String(secondPart).padStart(2, '0')}`
  return `${hours}:${String(minutePart).padStart(2, '0')}:${String(secondPart).padStart(2, '0')}`
}

function UpgradeConfirmation({ target, cost, onCancel, onConfirm }: { target: string; cost: number; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n()
  return <div className="confirm-layer"><section className="confirm-box upgrade-confirm"><h3>{t('common.confirmUpgradeTitle')}</h3><p>{t('common.confirmUpgrade', { target, cost: cost.toLocaleString() })}</p><div><button onClick={onCancel}>{t('common.cancel')}</button><button onClick={onConfirm}>{t('common.yes')}</button></div></section></div>
}

function ActionConfirmation({ title, body, onCancel, onConfirm }: { title: string; body: string; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n()
  return <div className="confirm-layer"><section className="confirm-box"><h3>{title}</h3><p>{body}</p><div><button onClick={onCancel}>{t('common.cancel')}</button><button onClick={onConfirm}>{t('common.yes')}</button></div></section></div>
}

type SettingsInfoTab = 'upgrades' | 'statuses' | 'experience'

const STATUS_REFERENCE: Array<{ type: StatusEffectType; description: [string, string] }> = [
  { type: 'ABLAZE', description: ['Takes damage equal to 5% of max HP each turn.', 'Mất 5% HP tối đa mỗi lượt.'] },
  { type: 'POISON', description: ['Deals 20% less damage.', 'Gây ít hơn 20% sát thương.'] },
  { type: 'ANOINTED', description: ['Deals 25% more damage.', 'Gây thêm 25% sát thương.'] },
  { type: 'INSPIRE', description: ['Deals 25% more damage.', 'Gây thêm 25% sát thương.'] },
  { type: 'EXALT', description: ['Deals 25% more damage and takes 5 less damage.', 'Gây thêm 25% sát thương và nhận ít hơn 5 sát thương.'] },
  { type: 'FRENZY', description: ['Deals 30% more damage.', 'Gây thêm 30% sát thương.'] },
  { type: 'DELIRIUM', description: ['Deals double damage.', 'Gây gấp đôi sát thương.'] },
  { type: 'FROZEN', description: ['Cannot dodge and takes 10 physical damage each turn.', 'Không thể né và nhận 10 sát thương vật lý mỗi lượt.'] },
  { type: 'BLEED', description: ['Takes damage equal to its Bleed stacks, then loses one stack.', 'Nhận sát thương bằng số cộng dồn Bleed, sau đó mất 1 cộng dồn.'] },
  { type: 'DEFENSIVE_STANCE', description: ['Blocks the next incoming hit.', 'Chặn đòn đánh kế tiếp nhận vào.'] },
  { type: 'REGENERATION', description: ['Restores 6% of max HP each turn.', 'Hồi 6% HP tối đa mỗi lượt.'] },
  { type: 'STUN', description: ['Skips its turn.', 'Bỏ lượt.'] },
  { type: 'STUN_NOT_CLEANSABLE', description: ['Skips its turn and cannot be cleansed.', 'Bỏ lượt và không thể được thanh tẩy.'] },
  { type: 'SILENCE', description: ['Cannot use skills or gain Mana.', 'Không thể dùng skill hoặc nhận Mana.'] },
  { type: 'TAUNT', description: ['Forces attacks toward the taunting unit; skill targeting is focused on it.', 'Ép đòn đánh nhắm vào đơn vị gây Taunt; skill cũng ưu tiên mục tiêu đó.'] },
  { type: 'PETRIFY', description: ['Cannot dodge, takes 15% more damage and skips its turn.', 'Không thể né, nhận thêm 15% sát thương và bỏ lượt.'] },
  { type: 'TERRIFY', description: ['Skips its turn and takes 20% max HP as magic damage.', 'Bỏ lượt và nhận sát thương phép bằng 20% HP tối đa.'] },
  { type: 'LESSER_CURSE', description: ['On death, raises a Zombie for the caster’s side; the summon decays by 25% max HP each turn.', 'Khi chết, triệu hồi Zombie cho phe người dùng; lính triệu hồi mất 25% HP tối đa mỗi lượt.'] },
  { type: 'CURSE', description: ['On death, raises a Bone Horror; the summon decays by 25% max HP each turn and has triple target priority.', 'Khi chết, triệu hồi Bone Horror; lính triệu hồi mất 25% HP tối đa mỗi lượt và có ưu tiên bị nhắm gấp 3.'] },
  { type: 'GREATER_CURSE', description: ['A stronger curse that raises a Bone Nightmare on death.', 'Lời nguyền mạnh hơn, triệu hồi Bone Nightmare khi chết.'] },
  { type: 'OMINOUS_CURSE', description: ['A powerful curse that raises a reinforced Bone Nightmare on death.', 'Lời nguyền mạnh, triệu hồi Bone Nightmare cường hóa khi chết.'] },
  { type: 'ABHORRENT_CURSE', description: ['The strongest curse variant, raising an empowered undead minion on death.', 'Biến thể lời nguyền mạnh nhất, triệu hồi undead cường hóa khi chết.'] },
  { type: 'SKELETON_KEY', description: ['Marks the key objective needed by some raid routes.', 'Đánh dấu mục tiêu chìa khóa cần cho một số nhánh raid.'] },
  { type: 'FEEBLE_TETHER', description: ['Marks a tethered target for related skill interactions.', 'Đánh dấu mục tiêu bị liên kết cho các tương tác skill liên quan.'] },
  { type: 'FALSE_LIFE', description: ['A temporary life-preserving effect used by specific skills.', 'Hiệu ứng duy trì sự sống tạm thời của một số skill.'] },
]

const UPGRADE_REFERENCE = [
  { id: 'quarters', label: ['Quarters capacity', 'Sức chứa Khu nhà'], max: 22, price: quartersPrice },
  { id: 'tavernCapacity', label: ['Tavern capacity', 'Sức chứa Tavern'], max: 6, price: tavernCapacityPrice },
  { id: 'tavernTime', label: ['Tavern time', 'Thời gian Tavern'], max: 19, price: tavernTimePrice },
  { id: 'storage', label: ['Storage capacity', 'Sức chứa Storage'], max: 79, price: storagePrice },
  { id: 'workshopQueue', label: ['Workshop queue', 'Hàng chờ Workshop'], max: 9, price: workshopQueuePrice },
  { id: 'workshopTime', label: ['Workshop time', 'Thời gian Workshop'], max: 24, price: workshopTimePrice },
  { id: 'marketListings', label: ['Market listings', 'Ô đăng bán Market'], max: 9, price: marketListingsPrice },
  { id: 'marketTime', label: ['Market time', 'Thời gian Market'], max: 24, price: marketTimePrice },
  { id: 'shelter', label: ['Shelter capacity', 'Sức chứa Shelter'], max: 10, price: shelterPrice },
  { id: 'shelterAutofeed', label: ['Shelter Auto-feed', 'Tự cho ăn Shelter'], max: 0, price: shelterAutofeedPrice },
] as const

function SettingsInfo({ language }: { language: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<SettingsInfoTab>('upgrades')
  const [upgradeId, setUpgradeId] = useState<(typeof UPGRADE_REFERENCE)[number]['id']>('quarters')
  const [ascended, setAscended] = useState(false)
  const vi = language === 'vi'
  const text = vi
    ? { title: 'Thông tin game', upgrades: 'Chi phí nâng cấp', statuses: 'Hiệu ứng trạng thái', experience: 'Bảng EXP', building: 'Nâng cấp', level: 'Cấp hiện tại', next: 'Lên cấp', cost: 'Chi phí', status: 'Hiệu ứng', description: 'Tác dụng', required: 'EXP cần', reached: 'EXP đã đạt', total: 'EXP cộng dồn', ascended: 'Ascended ×2 EXP' }
    : { title: 'Game information', upgrades: 'Upgrade costs', statuses: 'Status effects', experience: 'EXP table', building: 'Upgrade', level: 'Current level', next: 'Next level', cost: 'Cost', status: 'Status', description: 'Effect', required: 'XP required', reached: 'XP reached', total: 'Cumulative XP', ascended: 'Ascended ×2 XP' }
  const upgrade = UPGRADE_REFERENCE.find((entry) => entry.id === upgradeId) ?? UPGRADE_REFERENCE[0]
  let accumulatedXp = 0
  return <section className="settings-info">
    <button className="settings-info-trigger" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>ⓘ {text.title}</button>
    {open && <div className="settings-info-body">
      <div className="settings-info-tabs" role="tablist" aria-label={text.title}>
        {(['upgrades', 'statuses', 'experience'] as SettingsInfoTab[]).map((entry) => <button type="button" key={entry} className={tab === entry ? 'active' : ''} onClick={() => setTab(entry)}>{text[entry]}</button>)}
      </div>
      {tab === 'upgrades' && <>
        <label className="settings-reference-select">{text.building}<select value={upgradeId} onChange={(event) => setUpgradeId(event.target.value as typeof upgradeId)}>{UPGRADE_REFERENCE.map((entry) => <option key={entry.id} value={entry.id}>{entry.label[vi ? 1 : 0]}</option>)}</select></label>
        <div className="settings-reference-table"><table><thead><tr><th>{text.level}</th><th>{text.next}</th><th>{text.cost}</th></tr></thead><tbody>{Array.from({ length: upgrade.max + 1 }, (_, level) => <tr key={level}><td>{level}</td><td>{upgradeId === 'shelterAutofeed' ? text.next : level + 1}</td><td>{upgrade.price(level).toLocaleString()}</td></tr>)}</tbody></table></div>
      </>}
      {tab === 'statuses' && <div className="settings-reference-table"><table><thead><tr><th>{text.status}</th><th>{text.description}</th></tr></thead><tbody>{STATUS_REFERENCE.map((entry) => <tr key={entry.type}><td><span className="settings-status-name"><img src={assetUrl(statusIconKey(entry.type))} alt="" />{localizeStatus(language as 'en' | 'vi', entry.type)}</span></td><td>{entry.description[vi ? 1 : 0]}</td></tr>)}</tbody></table></div>}
      {tab === 'experience' && <><label className="settings-info-toggle"><input type="checkbox" checked={ascended} onChange={(event) => setAscended(event.target.checked)} />{text.ascended}</label><div className="settings-reference-table"><table><thead><tr><th>{text.level}</th><th>{text.required}</th><th>{text.reached}</th><th>{text.total}</th></tr></thead><tbody>{Array.from({ length: 45 }, (_, index) => { const level = index + 1; const required = experienceToNextLevel(level, ascended); const reached = accumulatedXp; accumulatedXp += required; return <tr key={level}><td>{level}</td><td>{required.toLocaleString()}</td><td>{reached.toLocaleString()}</td><td>{accumulatedXp.toLocaleString()}</td></tr> })}</tbody></table></div></>}
    </div>}
  </section>
}

function SettingsDialog({ store, onClose }: { store: GameStore; onClose: () => void }) {
  const state = useGame(store)
  const { language, t } = useI18n()
  const amounts = [1, 5, 10, 25, 50, 100, 999]
  const update = (key: keyof typeof state.settings, value: number | boolean) => store.updateSettings({ [key]: value })
  const toggle = (key: keyof typeof state.settings, label: string, detail: string) => <label className="settings-toggle" key={key}><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={Boolean(state.settings[key])} onChange={(event) => update(key, event.target.checked)} /></label>
  return <Modal title={t('drawer.settings')} onClose={onClose}>
    <section className="settings-dialog">
      <label>{t('settings.sellAmount')}<select value={state.settings.sellMaxAmount} onChange={(event) => update('sellMaxAmount', Number(event.target.value))}>{amounts.map((amount) => <option key={amount} value={amount}>{amount === 999 ? t('settings.all') : amount}</option>)}</select></label>
      <label>{t('settings.craftAmount')}<select value={state.settings.craftMaxAmount} onChange={(event) => update('craftMaxAmount', Number(event.target.value))}>{amounts.map((amount) => <option key={amount} value={amount}>{amount === 999 ? t('settings.all') : amount}</option>)}</select></label>
      {toggle('confirmUpgrade', t('settings.confirmUpgrade'), t('settings.confirmUpgradeHint'))}
      {toggle('confirmRetreat', t('settings.confirmRetreat'), t('settings.confirmRetreatHint'))}
      {toggle('confirmSwap', t('settings.confirmSwap'), t('settings.confirmSwapHint'))}
      {toggle('autoOpenDungeonDetail', t('settings.autoOpen'), t('settings.autoOpenHint'))}
      {toggle('verboseLogs', t('settings.verbose'), t('settings.verboseHint'))}
      {toggle('colorblindMode', t('settings.colorblind'), t('settings.colorblindHint'))}
      <SettingsInfo language={language} />
    </section>
    <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

function IdleProgressDialog({ seconds, onClose }: { seconds: number; onClose: () => void }) {
  const { t } = useI18n()
  return <div className="confirm-layer"><section className="confirm-box idle-progress"><h3>{t('idle.title')}</h3><p>{t('idle.body', { time: formatSeconds(seconds) })}</p><ProgressBar value={seconds} max={Math.max(1, seconds)} label={formatSeconds(seconds)} /><div><button onClick={onClose}>{t('common.close')}</button></div></section></div>
}

const VIETQR_ACCOUNT = 'VQRQAJQJY8278'
const VIETQR_BANK = 'MBBank'
const VIETQR_HOLDER = 'NGUYEN KHANH HOANG'
const GEM_PACKAGES = [
  { productId: 'gems_10000', gems: 10_000, price: 10_000 },
  { productId: 'gems_20000', gems: 20_000, price: 20_000 },
  { productId: 'gems_50000', gems: 50_000, price: 50_000 },
] as const

function ShopDialog({ store, onClose }: { store: GameStore; onClose: () => void }) {
  const { t } = useI18n()
  const [order, setOrder] = useState<{ orderId: string; productId: string; priceMinor: number; paymentCode: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  const createOrder = async (productId: string) => {
    setCreating(true)
    setMessage(null)
    const result = await store.createPaymentOrder(productId)
    setCreating(false)
    if (!result.ok || !result.order) {
      setMessage(result.message)
      return
    }
    setPaid(false)
    setOrder(result.order)
  }

  useEffect(() => {
    if (!order || paid) return
    let cancelled = false
    const checkPayment = async () => {
      const status = await store.getPaymentOrderStatus(order.orderId)
      if (cancelled) return
      if (status === 'paid') {
        setPaid(true)
        void store.refreshProtectedGems()
      } else if (status === 'failed' || status === 'expired' || status === 'refunded') {
        setMessage(t('shop.paymentUnavailable'))
      }
    }
    void checkPayment()
    const timer = window.setInterval(() => void checkPayment(), 4_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [order, paid, store, t])

  const qrUrl = order
    ? `https://vietqr.app/img?bank=${VIETQR_BANK}&acc=${VIETQR_ACCOUNT}&amount=${order.priceMinor}&des=${order.paymentCode}&template=compact&showinfo=true&holder=${encodeURIComponent(VIETQR_HOLDER)}`
    : ''
  return <Modal title={t('shop.title')} onClose={onClose}>
    <section className="iap-dialog">
      <img className="iap-gem-icon" src={assetUrl('gem')} alt="" />
      <p>{t('shop.intro')}</p>
      {!order ? <div className="iap-package-list">{GEM_PACKAGES.map((pack) => <button className="iap-package" disabled={creating} key={pack.productId} onClick={() => void createOrder(pack.productId)}><img src={assetUrl('gem')} alt="" /><span><strong>{pack.gems.toLocaleString()} {t('currency.gems')}</strong><small>{t('shop.gemPackAmount')}</small></span><b>{pack.price.toLocaleString()} VND</b></button>)}</div> : <>
        <div className="iap-qr"><img src={qrUrl} alt={t('shop.qrAlt')} /></div>
        <strong className="iap-payment-code">{order.paymentCode}</strong>
        <p>{t('shop.transferExact', { price: order.priceMinor.toLocaleString() })}</p>
        {!paid && <small className="iap-waiting">{t('shop.waiting')}</small>}
        {paid && <strong className="iap-paid">{t('shop.paid')}</strong>}
      </>}
      {message && <p className="iap-error">{message}</p>}
      <p className="iap-note">{t('shop.note')}</p>
    </section>
    <div className="workshop-actions">{order && !paid && <button disabled={creating} onClick={() => void createOrder(order.productId)}>{t('shop.newOrder')}</button>}<button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

function WorkshopDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [showRecipes, setShowRecipes] = useState(false)
  const [craftingRecipeId, setCraftingRecipeId] = useState<string | null>(null)
  const [craftAmount, setCraftAmount] = useState(1)
  const [recipeFilter, setRecipeFilter] = useState<'all' | 'materials' | 'weapons' | 'armors' | 'accessories'>('all')
  const [recipeSort, setRecipeSort] = useState<'type' | 'craftable' | 'alphabetical'>('type')
  const [hideInsufficient, setHideInsufficient] = useState(true)
  const [highlightRecipeId, setHighlightRecipeId] = useState<string | null>(null)
  const [cancelJobUid, setCancelJobUid] = useState<number | null>(null)
  const [upgrade, setUpgrade] = useState<'queue' | 'time' | null>(null)
  const recipeListRef = useRef<HTMLDivElement>(null)
  const capacity = workshopQueueCapacity(state.buildings.workshopQueue, state.permanentUpgrades.UpgradeWorkshopQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)
  const visibleRecipes = state.tutorialStep === 3
    ? RECIPES.filter((recipe) => recipe.id === 'Leather')
    : RECIPES.filter((recipe) => state.knownRecipes.includes(recipe.id))
  const jobs = [...state.completedWorkshopItems, ...state.workshopQueue]
  const cancellableJobs = jobs.filter((job) => !state.completedWorkshopItems.some((entry) => entry.uid === job.uid))
  const queueFull = jobs.length >= capacity
  const craftingRecipe = craftingRecipeId ? RECIPES.find((recipe) => recipe.id === craftingRecipeId) : undefined
  const maxCraftAmount = craftingRecipe ? maxCraftable(state, craftingRecipe) : 1
  const amount = Math.max(1, Math.min(craftAmount, maxCraftAmount))
  const craftingResult = craftingRecipe && index.items.get(craftingRecipe.result.itemId)
  const craftingTime = craftingRecipe && craftingResult
    ? state.tutorialStep === 3 && craftingRecipe.id === 'Leather' ? 10 : state.tutorialStep === 4 && craftingRecipe.id === 'CopperArmor' ? 20 : workshopCraftSeconds(Number(craftingResult.fields.price ?? 1), craftingRecipe.result.stack * amount, state.buildings.workshopTime, state.permanentUpgrades.UpgradeWorkshopTime ?? 0, state.purchasedPacks.merchant)
    : 0
  const filteredRecipes = visibleRecipes.filter((recipe) => {
    const type = index.items.get(recipe.result.itemId)?.type ?? ''
    const matches = recipeFilter === 'all' ? true
      : recipeFilter === 'weapons' ? ['Bow', 'Dagger', 'Staff', 'Sword'].includes(type)
        : recipeFilter === 'armors' ? ['HeavyArmor', 'MediumArmor', 'LightArmor'].includes(type)
          : recipeFilter === 'accessories' ? type === 'Accessory'
            : !['Bow', 'Dagger', 'Staff', 'Sword', 'HeavyArmor', 'MediumArmor', 'LightArmor', 'Accessory'].includes(type)
    return matches && (!hideInsufficient || maxCraftable(state, recipe) > 0)
  }).sort((left, right) => {
    const leftItem = index.items.get(left.result.itemId); const rightItem = index.items.get(right.result.itemId)
    if (recipeSort === 'craftable') return maxCraftable(state, right) - maxCraftable(state, left)
    if (recipeSort === 'alphabetical') return name(leftItem?.name ?? left.result.itemId).localeCompare(name(rightItem?.name ?? right.result.itemId))
    return (leftItem?.type ?? '').localeCompare(rightItem?.type ?? '') || name(leftItem?.name ?? left.result.itemId).localeCompare(name(rightItem?.name ?? right.result.itemId))
  })

  useEffect(() => {
    if (!highlightRecipeId || craftingRecipeId || !showRecipes) return
    const card = recipeListRef.current?.querySelector<HTMLElement>(`[data-recipe-id="${highlightRecipeId}"]`)
    if (!card) return
    card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const clearHighlight = window.setTimeout(() => setHighlightRecipeId(null), 1_000)
    return () => window.clearTimeout(clearHighlight)
  }, [craftingRecipeId, highlightRecipeId, hideInsufficient, recipeFilter, recipeSort, showRecipes])

  const showIngredientRecipe = (itemId: string) => {
    const target = visibleRecipes.find((recipe) => recipe.result.itemId === itemId)
    if (!target) return
    setRecipeFilter('all')
    setHideInsufficient(false)
    setHighlightRecipeId(target.id)
  }

  return (
    <Modal title={t('building.workshop')} onClose={onClose} wide>
      <div className="workshop-summary">
        <strong>{t('workshop.queue', { used: jobs.length, max: capacity })}</strong>
        <span>{t('workshop.speed', { speed: (1 / (0.9 ** (state.buildings.workshopTime + (state.permanentUpgrades.UpgradeWorkshopTime ?? 0)))).toFixed(2) })}</span>
      </div>
      {state.purchasedPacks.merchant && <div className="market-pack-bonuses"><span>{t('workshop.merchantPackBonus')}</span></div>}
      <div className="tavern-upgrades">
        {state.buildings.workshopQueue < 10 && <button disabled={state.money < workshopQueuePrice(state.buildings.workshopQueue)} onClick={() => state.settings.confirmUpgrade ? setUpgrade('queue') : store.upgradeFacility('workshopQueue')}><strong>{t('workshop.upgradeQueue')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{workshopQueuePrice(state.buildings.workshopQueue).toLocaleString()}</span></button>}
        {state.buildings.workshopTime < 25 && <button disabled={state.money < workshopTimePrice(state.buildings.workshopTime)} onClick={() => state.settings.confirmUpgrade ? setUpgrade('time') : store.upgradeFacility('workshopTime')}><strong>{t('workshop.upgradeTime')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{workshopTimePrice(state.buildings.workshopTime).toLocaleString()}</span></button>}
      </div>
      {jobs.length === 0 && <EmptyState text={t('workshop.empty')} />}
      <div className="workshop-list" onClickCapture={(event) => {
        const button = (event.target as HTMLElement).closest('.cancel-craft')
        if (!button) return
        event.preventDefault()
        event.stopPropagation()
        const position = Array.from(event.currentTarget.querySelectorAll('.cancel-craft')).indexOf(button)
        setCancelJobUid(cancellableJobs[position]?.uid ?? null)
      }}>
        {jobs.map((job) => {
          const item = index.items.get(job.itemId)
          const complete = state.completedWorkshopItems.some((entry) => entry.uid === job.uid)
          const progress = complete ? 100 : (job.totalSeconds - job.remainingSeconds) / Math.max(1, job.totalSeconds) * 100
          return (
            <article className={`workshop-job ${complete ? 'complete' : ''}`} key={job.uid}>
              <span className="workshop-job-item"><img src={assetUrl(item?.imageKey)} alt="" /><b>{job.stack}</b></span>
              <span className="workshop-job-copy">
                <strong>{name(item?.name ?? job.itemId)}</strong>
                <small>{complete ? t('common.complete') : formatSeconds(job.remainingSeconds)}</small>
                {!complete && <i><b style={{ width: `${progress}%` }} /></i>}
              </span>
              <button className={complete ? 'collect-craft' : 'cancel-craft'} title={complete ? t('common.collect') : t('workshop.cancel')} onClick={() => complete ? store.collectCraft(job.uid) : store.cancelCraft(job.uid)}>{complete ? '✓' : '×'}</button>
            </article>
          )
        })}
      </div>
      <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button><button onClick={() => setShowRecipes(true)}>{t('workshop.recipes')}</button></div>
      {showRecipes && (
        <div className="recipes-layer" onMouseDown={() => setShowRecipes(false)}>
          <section className="recipes-panel" onMouseDown={(event) => event.stopPropagation()}>
            <strong>{t('workshop.recipes')}</strong>
            {craftingRecipe && craftingResult ? <section className="craft-preview">
              <div className="craft-preview-result"><img src={assetUrl(craftingResult.imageKey)} alt="" /><strong>{name(craftingResult.name)}</strong></div>
              <div className="craft-preview-ingredients">{craftingRecipe.ingredients.map((ingredient) => {
                const item = index.items.get(ingredient.itemId)
                return <span key={ingredient.itemId}><img src={assetUrl(item?.imageKey)} alt="" />{ingredient.stack * amount}</span>
              })}</div>
              <p>{t('workshop.craftTime', { time: formatSeconds(craftingTime) })}</p>
              <div className="market-quantity"><button disabled={amount <= 1} onClick={() => setCraftAmount(amount - 1)}>-</button><strong>{amount}</strong><button disabled={amount >= maxCraftAmount} onClick={() => setCraftAmount(amount + 1)}>+</button></div>
              <input className="market-quantity-slider" type="range" min="1" max={maxCraftAmount} value={amount} onChange={(event) => setCraftAmount(Number(event.target.value))} />
              <div className="workshop-actions"><button onClick={() => setCraftingRecipeId(null)}>{t('common.close')}</button><button disabled={queueFull || maxCraftAmount < 1} onClick={() => { store.craft(craftingRecipe.id, amount); setCraftingRecipeId(null); setShowRecipes(false) }}>{t('workshop.craft')}</button></div>
            </section> : <section className="recipe-browser"><div className="storage-filters recipe-filters"><label>{t('workshop.recipeFilter')}<select value={recipeFilter} onChange={(event) => setRecipeFilter(event.target.value as typeof recipeFilter)}><option value="all">{t('storage.all')}</option><option value="materials">{t('storage.materials')}</option><option value="weapons">{t('storage.weapons')}</option><option value="armors">{t('storage.armors')}</option><option value="accessories">{t('storage.accessories')}</option></select></label><label>{t('workshop.recipeSort')}<select value={recipeSort} onChange={(event) => setRecipeSort(event.target.value as typeof recipeSort)}><option value="type">{t('storage.sortType')}</option><option value="craftable">{t('workshop.sortCraftable')}</option><option value="alphabetical">{t('storage.sortAlphabetical')}</option></select></label><label className="recipe-hide"><input type="checkbox" checked={hideInsufficient} onChange={(event) => setHideInsufficient(event.target.checked)} />{t('workshop.hideInsufficient')}</label></div><div className="recipe-list" ref={recipeListRef}>
              {filteredRecipes.map((recipe) => {
                const result = index.items.get(recipe.result.itemId)
                const craftable = maxCraftable(state, recipe)
                return (
                  <article className={`recipe-card ${highlightRecipeId === recipe.id ? 'is-highlighted' : ''}`} data-recipe-id={recipe.id} key={recipe.id}>
                    <span className="recipe-result"><img src={assetUrl(result?.imageKey)} alt="" /><b>{name(result?.name ?? recipe.result.itemId)}</b></span>
                    <span className="recipe-arrow">←</span>
                    <span className="recipe-ingredients">
                      {recipe.ingredients.map((ingredient) => {
                        const item = index.items.get(ingredient.itemId)
                        const owned = inventoryCount(state, ingredient.itemId)
                        const canShowRecipe = visibleRecipes.some((candidate) => candidate.result.itemId === ingredient.itemId)
                        return <button className={`recipe-ingredient ${owned < ingredient.stack ? 'missing' : ''} ${canShowRecipe ? '' : 'is-static'}`} aria-disabled={!canShowRecipe} key={ingredient.itemId} title={name(item?.name ?? ingredient.itemId)} onClick={() => { if (canShowRecipe) showIngredientRecipe(ingredient.itemId) }}><img src={assetUrl(item?.imageKey)} alt="" /><b>{ingredient.stack}</b><small>{owned}</small><ItemOriginTooltip itemId={ingredient.itemId} index={index} /></button>
                      })}
                    </span>
                    <span className="recipe-meta">{t('workshop.available', { count: craftable })}</span>
                  <button disabled={craftable < 1 || queueFull} onClick={() => { setCraftingRecipeId(recipe.id); setCraftAmount(Math.min(craftable, state.settings.craftMaxAmount)) }}>{t('workshop.craft')}</button>
                  </article>
                )
              })}
              {filteredRecipes.length === 0 && <EmptyState text={t('workshop.noRecipes')} />}
            </div></section>}
            {!craftingRecipe && <button className="recipes-close" onClick={() => setShowRecipes(false)}>{t('common.close')}</button>}
          </section>
        </div>
      )}
      {upgrade && <UpgradeConfirmation target={t(upgrade === 'queue' ? 'workshop.upgradeQueue' : 'workshop.upgradeTime')} cost={upgrade === 'queue' ? workshopQueuePrice(state.buildings.workshopQueue) : workshopTimePrice(state.buildings.workshopTime)} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeFacility(upgrade === 'queue' ? 'workshopQueue' : 'workshopTime'); setUpgrade(null) }} />}
      {cancelJobUid !== null && <ActionConfirmation title={t('workshop.cancel')} body={t('workshop.cancelConfirm')} onCancel={() => setCancelJobUid(null)} onConfirm={() => { store.cancelCraft(cancelJobUid); setCancelJobUid(null) }} />}
    </Modal>
  )
}

function TavernLockIcon({ locked }: { locked: boolean }) {
  const path = locked
    ? 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z'
    : 'M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z'
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>
}

function recruitAssessment(definition: AdventurerDefinition, stats: ReturnType<typeof adventurerStats>, t: ReturnType<typeof useI18n>['t']) {
  const { fields } = definition
  const strengths: string[] = []
  const weaknesses: string[] = []
  const attributes = [
    ['constitution', stats.constitution] as const,
    ['intelligence', stats.intelligence] as const,
    ['dexterity', stats.dexterity] as const,
  ]
  const highest = attributes.reduce((best, candidate) => candidate[1] > best[1] ? candidate : best)
  const lowest = attributes.reduce((worst, candidate) => candidate[1] < worst[1] ? candidate : worst)

  strengths.push(t(`tavern.assessment.${highest[0]}`))
  if (fields.healer) strengths.push(t('tavern.assessment.healer'))
  if (fields.cleanser) strengths.push(t('tavern.assessment.cleanser'))
  if (fields.alwaysHits) strengths.push(t('tavern.assessment.accurate'))
  if (fields.initiative) strengths.push(t('tavern.assessment.initiative'))
  if ((fields.threat ?? 1) > 1 || stats.defense >= stats.magicDefense * 1.5) strengths.push(t('tavern.assessment.frontline'))

  weaknesses.push(t(`tavern.assessment.low${lowest[0][0].toUpperCase()}${lowest[0].slice(1)}`))
  if (stats.defense === 0) weaknesses.push(t('tavern.assessment.noDefense'))
  if (stats.magicDefense === 0) weaknesses.push(t('tavern.assessment.noMagicDefense'))
  if (!fields.activeSkill || fields.activeSkill === 'ACTIVE_NONE') weaknesses.push(t('tavern.assessment.noActive'))

  return { strengths: [...new Set(strengths)].slice(0, 3), weaknesses: [...new Set(weaknesses)].slice(0, 3) }
}

function TavernDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t, name, description } = useI18n()
  const [showHelp, setShowHelp] = useState(false)
  const [showNoSpace, setShowNoSpace] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<number | null>(null)
  const [upgrade, setUpgrade] = useState<'capacity' | 'time' | null>(null)
  const capacity = buildingCapacity('tavern', state.buildings.tavernCapacity, state.permanentUpgrades.UpgradeTavernCapacity ?? 0, state.purchasedPacks)
  const quartersFull = state.adventurers.length >= buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)
  const interval = tavernVisitorIntervalSeconds(state.buildings.tavernTime, state.permanentUpgrades.UpgradeTavernTime ?? 0)
  const remaining = Math.max(0, Math.min(interval, state.nextTavernVisit))
  const remainingPercent = interval > 0 ? remaining / interval * 100 : 0
  const capacityCost = tavernCapacityPrice(state.buildings.tavernCapacity)
  const timeCost = tavernTimePrice(state.buildings.tavernTime)
  const detailsGuest = selectedGuest === null ? undefined : state.tavernGuests.find((guest) => guest.uid === selectedGuest)
  const detailsDefinition = detailsGuest && index.adventurers.get(detailsGuest.classId)
  const detailsStats = detailsGuest ? adventurerStats(detailsGuest, index) : undefined
  const detailsTraits = detailsGuest ? [detailsGuest.trait, detailsGuest.rareTrait].filter((trait): trait is string => Boolean(trait)) : []
  const detailsActiveSkill = detailsDefinition?.fields.activeSkill && detailsDefinition.fields.activeSkill !== 'ACTIVE_NONE' ? <SkillHint language={language} kind="active" skillId={detailsDefinition.fields.activeSkill} fields={detailsDefinition.fields} /> : t('adventurer.noSkill')
  const detailsPassiveSkill = detailsDefinition?.fields.passiveSkill && detailsDefinition.fields.passiveSkill !== 'PASSIVE_NONE' ? <SkillHint language={language} kind="passive" skillId={detailsDefinition.fields.passiveSkill} fields={detailsDefinition.fields} /> : t('adventurer.noSkill')
  const detailsAssessment = detailsDefinition && detailsStats ? recruitAssessment(detailsDefinition, detailsStats, t) : undefined
  const close = () => {
    store.markTavernSeen()
    onClose()
  }

  return (
    <Modal title={t('building.tavern')} onClose={close}>
      <section className="tavern-dialog-content">
        <p className="tavern-help-copy">{t('tavern.intro')}</p>
        <p className="tavern-description">{t('tavern.capacity', { current: state.tavernGuests.length, max: capacity })}</p>
        <p className="tavern-description">{t('tavern.interval', { time: formatSeconds(interval) })}</p>

        <div className={`tavern-timer ${state.tavernLocked ? 'locked' : ''}`}>
          <span>{t('tavern.nextVisitor', { time: formatSeconds(remaining) })}</span>
          <i aria-hidden="true"><b style={{ width: `${remainingPercent}%` }} /></i>
          <button onClick={() => store.toggleTavernLock()} aria-label={t(state.tavernLocked ? 'tavern.unlock' : 'tavern.lock')} title={t(state.tavernLocked ? 'tavern.unlock' : 'tavern.lock')}>
            <TavernLockIcon locked={state.tavernLocked} />
          </button>
        </div>

        {(state.buildings.tavernCapacity < 7 || state.buildings.tavernTime < 20) && (
          <div className="tavern-upgrades">
            {state.buildings.tavernCapacity < 7 && (
              <button disabled={state.money < capacityCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('capacity') : store.upgradeTavern('capacity')}>
                <strong>{t('tavern.upgradeCapacity')}</strong>
                <span><img src={assetUrl('coin_copper')} alt="" />{capacityCost.toLocaleString()}</span>
              </button>
            )}
            {state.buildings.tavernTime < 20 && (
              <button disabled={state.money < timeCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('time') : store.upgradeTavern('time')}>
                <strong>{t('tavern.upgradeTime')}</strong>
                <span><img src={assetUrl('coin_copper')} alt="" />{timeCost.toLocaleString()}</span>
              </button>
            )}
          </div>
        )}

        {state.tavernGuests.length === 0 ? <p className="tavern-empty">{t('tavern.empty')}</p> : (
          <div className="tavern-visitor-list">
            {state.tavernGuests.map((guest) => {
              const definition = index.adventurers.get(guest.classId)
              if (!definition) return null
              const traits = [guest.trait, guest.rareTrait].filter((trait): trait is string => Boolean(trait)).map((trait) => localizeRareTrait(language, trait)).join(' · ')
              return (
                <article className="tavern-visitor" key={guest.uid} role="button" tabIndex={0} onClick={() => setSelectedGuest(guest.uid)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedGuest(guest.uid) }}>
                  <span className="tavern-visitor-image"><img src={assetUrl(definition.imageKey)} alt="" /></span>
                  <span className="tavern-visitor-copy">
                    <strong>{name(definition.name)}</strong>
                    {!guest.seen && <em>{t('tavern.new')}</em>}
                    <small>{traits}</small>
                  </span>
                  <button className={quartersFull ? 'unavailable' : ''} onClick={(event) => { event.stopPropagation(); if (quartersFull) setShowNoSpace(true); else store.hire(guest.uid) }}>{t('tavern.recruit')}</button>
                </article>
              )
            })}
          </div>
        )}

        <footer className="tavern-actions"><button onClick={() => setShowHelp(true)}>{t('common.help')}</button><button onClick={close}>{t('common.close')}</button></footer>

        {showHelp && <div className="confirm-layer"><div className="confirm-box tavern-info"><h3>{t('building.tavern')}</h3>{t('tavern.help').split('\n').map((line, index) => line ? <p key={`${line}-${index}`}>{line}</p> : <br key={index} />)}<div><button onClick={() => setShowHelp(false)}>{t('common.close')}</button></div></div></div>}
        {showNoSpace && <div className="confirm-layer"><div className="confirm-box tavern-info"><h3>{t('tavern.noSpaceTitle')}</h3><p>{t('tavern.noSpace')}</p><div><button onClick={() => setShowNoSpace(false)}>{t('common.close')}</button></div></div></div>}
        {detailsGuest && detailsDefinition && detailsStats && detailsAssessment && <div className="confirm-layer"><div className="confirm-box tavern-guest-detail"><div className="entity-detail"><div className="portrait-frame large"><img src={assetUrl(detailsDefinition.imageKey)} alt="" /></div><div><h3>{name(detailsDefinition.name)}</h3><p>{description(detailsDefinition.id, detailsDefinition.description)}</p></div></div><div className="stat-grid"><StatHint language={language} label="CON" value={detailsStats.constitution} /><StatHint language={language} label="INT" value={detailsStats.intelligence} /><StatHint language={language} label="DEX" value={detailsStats.dexterity} /><StatHint language={language} label="HP" value={detailsStats.maxHp} /><StatHint language={language} label="DEF" value={detailsStats.defense} /><StatHint language={language} label="MDEF" value={detailsStats.magicDefense} /></div>{detailsTraits.length > 0 && <p className="tavern-detail-traits"><strong>{t('battle.traits')}:</strong> {detailsTraits.map((trait, position) => <span key={trait}>{position > 0 && ' · '}<TraitHint language={language} trait={trait} /></span>)}</p>}<section className="adventurer-skills tavern-detail-skills"><article><small>{t('battle.active')}</small><strong>{detailsActiveSkill}</strong></article><article><small>{t('battle.passive')}</small><strong>{detailsPassiveSkill}</strong></article></section><section className="tavern-assessment"><h3>{t('tavern.assessment.title')}</h3><article><strong>{t('tavern.assessment.strengths')}</strong><ul>{detailsAssessment.strengths.map((insight) => <li key={insight}>{insight}</li>)}</ul></article><article><strong>{t('tavern.assessment.weaknesses')}</strong><ul>{detailsAssessment.weaknesses.map((insight) => <li key={insight}>{insight}</li>)}</ul></article></section><div className="tavern-detail-actions"><button onClick={() => setSelectedGuest(null)}>{t('common.close')}</button></div></div></div>}
        {upgrade && <UpgradeConfirmation target={t(upgrade === 'capacity' ? 'tavern.upgradeCapacity' : 'tavern.upgradeTime')} cost={upgrade === 'capacity' ? capacityCost : timeCost} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeTavern(upgrade); setUpgrade(null) }} />}
      </section>
    </Modal>
  )
}

function MarketDialog({ store, index, onClose, initialSellingItemId }: { store: GameStore; index: ContentIndex; onClose: () => void; initialSellingItemId?: string }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [sellingItemId, setSellingItemId] = useState<string | null>(initialSellingItemId ?? null)
  const [sellingAmount, setSellingAmount] = useState(1)
  const [upgrade, setUpgrade] = useState<'listings' | 'time' | null>(null)
  const [cancelSaleUid, setCancelSaleUid] = useState<number | null>(null)
  const capacity = marketListingsCapacity(state.buildings.marketListings, state.permanentUpgrades.UpgradeMarketQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)
  const listingCost = marketListingsPrice(state.buildings.marketListings)
  const timeCost = marketTimePrice(state.buildings.marketTime)
  const jobs = [...state.soldMarketItems.map((job) => ({ ...job, sold: true })), ...state.marketListings.map((job) => ({ ...job, sold: false }))]
  const cancellableSales = jobs.filter((job) => !job.sold)
  const sellingStack = state.inventory.find((stack) => stack.itemId === sellingItemId)
  const sellingItem = sellingStack && index.items.get(sellingStack.itemId)
  const maxSellingAmount = sellingStack?.stack ?? 1
  const amount = Math.max(1, Math.min(sellingAmount, maxSellingAmount))
  const sellingPrice = Number(sellingItem?.fields.price ?? 0) * amount
  const sellingTime = marketSaleSeconds(Number(sellingItem?.fields.price ?? 0), amount, state.buildings.marketTime, state.permanentUpgrades.UpgradeMarketTime ?? 0, state.purchasedPacks.merchant)
  const openSale = (itemId: string) => {
    setSellingItemId(itemId)
    const available = state.inventory.find((stack) => stack.itemId === itemId)?.stack ?? 1
    setSellingAmount(Math.min(available, state.settings.sellMaxAmount))
  }
  const confirmSale = () => {
    if (!sellingItemId) return
    store.listForSale(sellingItemId, amount)
    setSellingItemId(null)
  }
  return (
    <Modal title={t('building.market')} onClose={onClose} wide>
      <div className="workshop-summary"><strong>{t('market.listings', { used: jobs.length, max: capacity })}</strong><span>{t('market.speed', { speed: (1 / (0.9 ** (state.buildings.marketTime + (state.permanentUpgrades.UpgradeMarketTime ?? 0)))).toFixed(2) })}</span></div>
      {(state.purchasedPacks.starter || state.purchasedPacks.merchant) && <div className="market-pack-bonuses">{state.purchasedPacks.starter && <span>{t('market.starterPackBonus')}</span>}{state.purchasedPacks.merchant && <span>{t('market.merchantPackBonus')}</span>}</div>}
      <div className="tavern-upgrades">
        {state.buildings.marketListings < 10 && <button disabled={state.money < listingCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('listings') : store.upgradeMarket('listings')}><strong>{t('market.upgradeListings')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{listingCost.toLocaleString()}</span></button>}
        {state.buildings.marketTime < 25 && <button disabled={state.money < timeCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('time') : store.upgradeMarket('time')}><strong>{t('market.upgradeTime')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{timeCost.toLocaleString()}</span></button>}
      </div>
      {jobs.length === 0 && <EmptyState text={t('market.empty')} />}
      <div className="workshop-list" onClickCapture={(event) => {
        const button = (event.target as HTMLElement).closest('.cancel-craft')
        if (!button) return
        event.preventDefault()
        event.stopPropagation()
        const position = Array.from(event.currentTarget.querySelectorAll('.cancel-craft')).indexOf(button)
        setCancelSaleUid(cancellableSales[position]?.uid ?? null)
      }}>{jobs.map((job) => {
        const item = index.items.get(job.itemId)
        const progress = job.sold ? 100 : (job.totalSeconds - job.remainingSeconds) / Math.max(1, job.totalSeconds) * 100
        return <article className={`workshop-job ${job.sold ? 'complete' : ''}`} key={job.uid}><span className="workshop-job-item"><img src={assetUrl(item?.imageKey)} alt="" /><b>{job.stack}</b></span><span className="workshop-job-copy"><strong>{name(item?.name ?? job.itemId)}</strong><small>{job.sold ? t('market.sold') : formatSeconds(job.remainingSeconds)}</small>{!job.sold && <i><b style={{ width: `${progress}%` }} /></i>}</span><button className={job.sold ? 'collect-craft' : 'cancel-craft'} onClick={() => job.sold ? store.collectSale(job.uid) : store.cancelSale(job.uid)}>{job.sold ? Number(item?.fields.price ?? 0) * job.stack : '×'}</button></article>
      })}</div>
      <h3 className="market-inventory-title">{t('market.chooseItem')}</h3>
      <div className="item-grid">{state.inventory.filter((stack) => Number(index.items.get(stack.itemId)?.fields.price ?? 0) > 0 && !index.items.get(stack.itemId)?.fields.notSellable).map((stack) => {
        const item = index.items.get(stack.itemId)
        return <button className="item-slot market-sell-slot" disabled={jobs.length >= capacity} key={stack.itemId} onClick={() => openSale(stack.itemId)}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span><small>{Number(item?.fields.price ?? 0) * stack.stack}</small></button>
      })}</div>
      <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
      {sellingStack && sellingItem && <div className="market-sell-layer" onMouseDown={() => setSellingItemId(null)}>
        <section className="market-sell-panel" onMouseDown={(event) => event.stopPropagation()}>
          <h3>{t('market.sellTitle', { item: name(sellingItem.name) })}</h3>
          <div className="market-sale-preview"><span className="workshop-job-item"><img src={assetUrl(sellingItem.imageKey)} alt="" /><b>{amount}</b></span><strong>{sellingPrice.toLocaleString()}</strong></div>
          <p>{t('market.saleTime', { time: formatSeconds(sellingTime) })}</p>
          <div className="market-quantity"><button aria-label={t('market.decreaseAmount')} disabled={amount <= 1} onClick={() => setSellingAmount(amount - 1)}>-</button><strong>{amount}</strong><button aria-label={t('market.increaseAmount')} disabled={amount >= maxSellingAmount} onClick={() => setSellingAmount(amount + 1)}>+</button></div>
          <input className="market-quantity-slider" aria-label={t('market.amount')} type="range" min="1" max={maxSellingAmount} value={amount} onChange={(event) => setSellingAmount(Number(event.target.value))} />
          <div className="workshop-actions"><button onClick={() => setSellingItemId(null)}>{t('common.close')}</button><button onClick={confirmSale}>{t('market.confirmSale')}</button></div>
        </section>
      </div>}
      {upgrade && <UpgradeConfirmation target={t(upgrade === 'listings' ? 'market.upgradeListings' : 'market.upgradeTime')} cost={upgrade === 'listings' ? listingCost : timeCost} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeMarket(upgrade); setUpgrade(null) }} />}
      {cancelSaleUid !== null && <ActionConfirmation title={t('market.cancelSale')} body={t('market.cancelSaleConfirm')} onCancel={() => setCancelSaleUid(null)} onConfirm={() => { store.cancelSale(cancelSaleUid); setCancelSaleUid(null) }} />}
    </Modal>
  )
}

function MerchantDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [selectedOfferUid, setSelectedOfferUid] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (state.nextMerchantOfferId === 1) store.refreshMerchant()
  }, [state.nextMerchantOfferId, store])
  const nextDay = new Date(now); nextDay.setHours(24, 0, 0, 0)
  const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + ((7 - nextWeek.getDay()) % 7 || 7)); nextWeek.setHours(0, 0, 0, 0)
  const section = (title: string, offers: typeof state.merchantRegularStock, countdown: number) => <section className="merchant-section"><h3>{title}</h3><small className="merchant-countdown">{t('merchant.refreshIn', { time: formatSeconds(Math.max(0, Math.ceil((countdown - now) / 1000))) })}</small>{offers.length === 0 ? <EmptyState text={t('merchant.empty')} /> : <div className="item-grid">{offers.map((offer) => {
    const item = index.items.get(offer.itemId)
    const affordable = offer.gems ? state.gems >= offer.price : state.money >= offer.price
    return <button className="item-slot merchant-offer" disabled={!affordable} key={offer.uid} onClick={() => setSelectedOfferUid(offer.uid)}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{offer.stack}</strong><span>{name(item?.name ?? offer.itemId)}</span><small><img src={assetUrl(offer.gems ? 'gem' : 'coin_copper')} alt="" />{offer.price}</small></button>
  })}</div>}</section>
  const selectedOffer = [...state.merchantRegularStock, ...state.merchantSpecialStock].find((offer) => offer.uid === selectedOfferUid)
  const selectedItem = selectedOffer && index.items.get(selectedOffer.itemId)
  return <Modal title={t('tool.merchant')} onClose={onClose} wide>{section(t('merchant.regular'), state.merchantRegularStock, nextDay.getTime())}{section(t('merchant.special'), state.merchantSpecialStock, nextWeek.getTime())}<div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>{selectedOffer && selectedItem && <div className="confirm-layer"><section className="confirm-box merchant-confirm"><img src={assetUrl(selectedItem.imageKey)} alt="" /><div className="merchant-confirm-copy"><h3>{name(selectedItem.name)}</h3><p>{t('merchant.buyConfirm', { count: selectedOffer.stack, item: name(selectedItem.name), price: selectedOffer.price })}</p><ItemFacts item={selectedItem} index={index} /></div><div className="merchant-confirm-actions"><button onClick={() => setSelectedOfferUid(null)}>{t('common.cancel')}</button><button onClick={() => { store.buyMerchant(selectedOffer.uid); setSelectedOfferUid(null) }}><img src={assetUrl(selectedOffer.gems ? 'gem' : 'coin_copper')} alt="" />{selectedOffer.price}</button></div></section></div>}</Modal>
}

function QuestsDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t } = useI18n()
  const categories = ['King', ...doctrineIds] as const
  const rarityReward = (rarity: number, king: boolean) => king
    ? rarity === 1 ? 10 : rarity === 2 ? 20 : rarity === 3 ? 40 : 100
    : rarity === 4 ? 5 : rarity
  const refreshPrice = questRefreshPrice(state)
  const [confirmRefresh, setConfirmRefresh] = useState(false)
  return <Modal title={t('tool.quests')} onClose={onClose} wide>
    <div className="quest-loyalty">{doctrineIds.map((id) => {
      const loyalty = state.loyalty[id]
      const target = loyalty.level * 3 + 4
      return <span key={id}><img src={assetUrl(DOCTRINES[id].imageKey)} alt="" /><b>{loyalty.level}</b><small>{loyalty.level >= 10 ? t('common.max') : `${loyalty.stars}/${target}`}</small></span>
    })}</div>
    {state.activeQuests.length === 0 && <EmptyState text={t('quests.empty')} />}
    {categories.map((category) => {
      const quests = state.activeQuests.filter((quest) => quest.category === category)
      if (!quests.length) return null
      return <section className="quest-section" key={category}><h3>{category === 'King' ? t('quests.king') : t(`doctrine.${category}`)}</h3>{quests.map((quest) => {
        const definition = index.quests.get(quest.id)
        const complete = quest.progress >= quest.target
        return <article className={`quest-card rarity-${quest.rarity} ${complete ? 'complete' : ''}`} key={quest.id}><div><strong>{definition?.name ?? quest.id}</strong><p>{localizeQuestDescription(language, quest.id, definition?.description ?? '').replace(/%1?\$?d/, String(quest.target))}</p><ProgressBar value={quest.progress} max={quest.target} label={`${quest.progress}/${quest.target}`} /></div><button disabled={!complete} onClick={() => store.claimQuest(quest.id)}><span>{category === 'King' ? '♦' : '★'}</span><b>{rarityReward(quest.rarity, category === 'King')}</b></button></article>
      })}</section>
    })}
    <div className="workshop-actions"><button disabled={state.adventurers.length === 0 || state.questsRefreshed || state.gems < refreshPrice} onClick={() => setConfirmRefresh(true)}>{t('quests.refresh')} · ♦{refreshPrice}</button><button onClick={onClose}>{t('common.close')}</button></div>
    {confirmRefresh && <ActionConfirmation title={t('quests.refresh')} body={t('quests.refreshConfirm', { price: refreshPrice })} onCancel={() => setConfirmRefresh(false)} onConfirm={() => { store.refreshQuests(); setConfirmRefresh(false) }} />}
  </Modal>
}

function petAbilityDetail(language: 'en' | 'vi', ability: PetAbilityType, level: number, slot: number) {
  const strength = ability === 'EMPTY' ? 0 : Math.max(0, level - slot * 20)
  const name: Record<PetAbilityType, [string, string]> = {
    EMPTY: ['Empty', 'Trống'], FIGHTER: ['Fighter', 'Chiến binh'], HEALER: ['Healer', 'Hồi máu'], DECOY: ['Decoy', 'Mồi nhử'], OPPORTUNIST: ['Opportunist', 'Cơ hội'], MAGIC: ['Magic', 'Ma thuật'], SAVAGE: ['Savage', 'Hoang dã'], BRIGHT: ['Bright', 'Ánh sáng'], EXPERIENCE: ['Teacher', 'Gia sư'], DROPS: ['Curious', 'Tò mò'], COUNTERATTACK: ['Vigilant', 'Cảnh giác'], LIFESTEAL: ['Bloodthirsty', 'Khát máu'], REGENERATION: ['Soothing', 'Xoa dịu'], BARRIER: ['Protective', 'Bảo hộ'],
  }
  const text: Record<PetAbilityType, [string, string]> = {
    EMPTY: ['No ability.', 'Chưa có kỹ năng.'],
    FIGHTER: [`On ally turns: ${Math.max(1, Math.round(strength * .9))}-${Math.max(1, Math.round(strength * 1.1))} damage.`, `Mỗi lượt đồng minh: ${Math.max(1, Math.round(strength * .9))}-${Math.max(1, Math.round(strength * 1.1))} sát thương.`],
    HEALER: [`On ally turns: heal ${Math.max(1, Math.round(strength * .9))}-${Math.max(1, Math.round(strength * 1.1))} HP.`, `Mỗi lượt đồng minh: hồi ${Math.max(1, Math.round(strength * .9))}-${Math.max(1, Math.round(strength * 1.1))} HP.`],
    DECOY: [`Threat ${strength}; cannot be hit.`, `Đe dọa ${strength}; không thể bị đánh trúng.`],
    OPPORTUNIST: [`Executes enemies below ${(strength * .2).toFixed(1)}% HP.`, `Kết liễu địch dưới ${(strength * .2).toFixed(1)}% HP.`],
    MAGIC: [`${(strength * .3).toFixed(1)}% chance each ally turn to apply a random status for ${Math.max(1, Math.round(strength * .028 + 1))} turns.`, `${(strength * .3).toFixed(1)}% mỗi lượt đồng minh gây trạng thái ngẫu nhiên trong ${Math.max(1, Math.round(strength * .028 + 1))} lượt.`],
    SAVAGE: [`Critical hits have ${(strength * .3).toFixed(1)}% chance to apply the multiplier twice.`, `Đòn chí mạng có ${(strength * .3).toFixed(1)}% xác suất nhân hệ số hai lần.`],
    BRIGHT: [`Reduces darkness by ${Math.round(strength * .5 + 1)}.`, `Giảm bóng tối ${Math.round(strength * .5 + 1)}.`],
    EXPERIENCE: [`Experience gained +${(strength * .4).toFixed(1)}%.`, `Kinh nghiệm nhận được +${(strength * .4).toFixed(1)}%.`],
    DROPS: [`${(strength * .3).toFixed(1)}% chance to roll drops twice.`, `${(strength * .3).toFixed(1)}% xác suất tung chiến lợi phẩm hai lần.`],
    COUNTERATTACK: [`Counterattack chance +${(strength * .35).toFixed(1)}%.`, `Xác suất phản đòn +${(strength * .35).toFixed(1)}%.`],
    LIFESTEAL: [`Grants ${Math.round(strength * .15)}% lifesteal.`, `Cho ${Math.round(strength * .15)}% hút máu.`],
    REGENERATION: [`Allies regenerate ${Math.round(strength * .3 + 1)} HP/turn.`, `Đồng minh hồi ${Math.round(strength * .3 + 1)} HP/lượt.`],
    BARRIER: [`Blocks ${strength} damage from any source.`, `Chặn ${strength} sát thương từ mọi nguồn.`],
  }
  return { name: name[ability][language === 'vi' ? 1 : 0], description: text[ability][language === 'vi' ? 1 : 0], strength }
}

function doctrineAbilityDetail(language: 'en' | 'vi', abilityId: string, value: number) {
  const flat: Record<string, [string, string]> = {
    IMPROVED_HEALTH: ['HP', 'HP'], IMPROVED_CONSTITUTION: ['Constitution', 'Thể chất'], IMPROVED_DEXTERITY: ['Dexterity', 'Nhanh nhẹn'], IMPROVED_INTELLIGENCE: ['Intelligence', 'Trí tuệ'],
    EXALTED_CONSTITUTION: ['Constitution', 'Thể chất'], EXALTED_DEXTERITY: ['Dexterity', 'Nhanh nhẹn'], EXALTED_INTELLIGENCE: ['Intelligence', 'Trí tuệ'], EXALTED_HEALTH: ['HP', 'HP'], EXALTED_MANA: ['mana regeneration', 'hồi mana'],
    SERVUS_SANGUINIS: ['lifesteal', 'hút máu'], TROLL_RESISTANCE: ['Defense', 'Phòng thủ'], WARLOCK_RESILIENCE: ['Magic Defense', 'Kháng phép'], MANIFEST_DANGER: ['Threat', 'Đe dọa'],
  }
  const percent = new Set(['SERVUS_UMBRAE', 'NECROSIS_PORPHYRICA', 'IMPENETRABLE_WILLPOWER', 'CHILLING_FLOW', 'MIND_BENDER', 'STAR_GAZE', 'CONDITIONED_REFLEXES', 'TACTICAL_KNOWLEDGE', 'EPHEMERAL_PRESENCE', 'FALSE_LIFE', 'EXPOSE_WEAKNESS', 'EXPLOIT_WEAKNESS', 'LIGHTNING_SPEED', 'EYE_FOR_AN_EYE', 'RAGEBOUND', 'DIVINE_INTERVENTION', 'SELFLESS_SPIRIT', 'OVERHEAL', 'HEALING_NOVA'])
  if (flat[abilityId]) return language === 'vi' ? `${flat[abilityId][1]} +${value}.` : `${flat[abilityId][0]} +${value}.`
  if (percent.has(abilityId)) return language === 'vi' ? `Hiệu lực hiện tại: ${value}%.` : `Current effect: ${value}%.`
  const special: Record<string, [string, string]> = {
    LORE_MASTER: ['Accessories grant double HP, Constitution, Dexterity and Intelligence.', 'Phụ kiện cho gấp đôi HP, Thể chất, Nhanh nhẹn và Trí tuệ.'],
    GENUS_VAMPYRI: ['Lifesteal can overheal into a shield.', 'Hút máu có thể hồi vượt và tạo lá chắn.'],
    ARCANE_SUPPRESSION: ['Deals magical damage for each negative status inflicted.', 'Gây sát thương phép theo mỗi trạng thái bất lợi đã gây ra.'],
    RELENTLESS_ASSAULT: ['Forces the target to counterattack.', 'Buộc mục tiêu phản đòn.'],
    WEAPON_MASTER: ['Can equip any weapon.', 'Có thể trang bị mọi loại vũ khí.'],
    BEAT_THE_ODDS: ['Rolls damage three times and uses the best result.', 'Tung sát thương ba lần và dùng kết quả cao nhất.'],
    MIRROR_OF_ANGUISH: ['Retaliates with Defense and Magic Defense.', 'Phản kích bằng Phòng thủ và Kháng phép.'],
    TRUE_AGONY: ['False Life retaliates when removed by an enemy.', 'False Life phản kích khi bị địch phá bỏ.'],
  }
  return (special[abilityId] ?? [abilityId.replaceAll('_', ' '), abilityId.replaceAll('_', ' ')])[language === 'vi' ? 1 : 0]
}

function ShelterDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t, name, description } = useI18n()
  const [mergeSource, setMergeSource] = useState<number | null>(null)
  const [selectedPetUid, setSelectedPetUid] = useState<number | null>(null)
  const [feedAll, setFeedAll] = useState(false)
  const [upgrade, setUpgrade] = useState<'capacity' | 'autofeed' | null>(null)
  const capacity = shelterCapacity(state.buildings.shelter, state.permanentUpgrades.UpgradeShelter ?? 0)
  const capacityCost = shelterPrice(state.buildings.shelter)
  const autofeedCost = shelterAutofeedPrice(state.buildings.shelterAutofeed)
  const eggs = state.inventory.filter((stack) => index.items.get(stack.itemId)?.type === 'Egg')
  const foods = state.inventory.filter((stack) => Number(index.items.get(stack.itemId)?.fields.feedPower ?? 0) > 0)
  const pets = [...state.pets].sort((left, right) => Number(right.favourite) - Number(left.favourite) || right.level - left.level || left.uid - right.uid)
  const selectedPet = state.pets.find((pet) => pet.uid === selectedPetUid)
  const selectedDefinition = selectedPet && index.pets.get(selectedPet.petId)
  const mergeSourcePet = state.pets.find((pet) => pet.uid === mergeSource)
  const releaseSelectedPet = async () => {
    if (selectedPet && await store.releasePet(selectedPet.uid)) {
      setSelectedPetUid(null)
      if (mergeSource === selectedPet.uid) setMergeSource(null)
    }
  }
  return <Modal title={t('building.shelter')} onClose={onClose} wide>
    <div className="workshop-summary"><strong>{t('shelter.capacity', { used: state.pets.length, max: capacity })}</strong></div>
    <div className="tavern-upgrades">
      {state.buildings.shelter < 11 && <button disabled={state.money < capacityCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('capacity') : store.upgradeShelter('capacity')}><strong>{t('shelter.upgradeCapacity')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{capacityCost.toLocaleString()}</span></button>}
      {state.buildings.shelterAutofeed < 1 && <button disabled={state.money < autofeedCost} onClick={() => state.settings.confirmUpgrade ? setUpgrade('autofeed') : store.upgradeShelter('autofeed')}><strong>{t('shelter.unlockAutofeed')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{autofeedCost.toLocaleString()}</span></button>}
    </div>
    {eggs.length > 0 && <section className="shelter-eggs"><h3>{t('shelter.eggs')}</h3><div className="item-grid">{eggs.map((stack) => {
      const item = index.items.get(stack.itemId)
      return <button className="item-slot" disabled={state.pets.length >= capacity} key={stack.itemId} onClick={() => store.hatchPet(stack.itemId)}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span></button>
    })}</div></section>}
    {state.pets.length === 0 ? <EmptyState text={t('shelter.empty')} /> : <div className="pet-list">{pets.map((pet) => {
      const definition = index.pets.get(pet.petId)
      const required = petFoodToNextLevel(pet.level)
      return <article className="pet-card" key={pet.uid}><img src={assetUrl(definition?.imageKey)} alt="" /><div><strong>{name(definition?.name ?? pet.petId)} · {t('common.level')} {pet.level}</strong><small>{pet.abilities.filter((ability) => ability !== 'EMPTY').map((ability, slot) => petAbilityDetail(language, ability, pet.level, slot).name).join(' · ')}</small><ProgressBar value={pet.food} max={required} label={`${pet.food}/${required}`} /></div><div className="pet-actions">{state.buildings.shelterAutofeed > 0 && <button className={pet.favourite ? 'selected' : ''} title={t('shelter.favourite')} onClick={() => store.togglePetFavourite(pet.uid)}>{pet.favourite ? '★' : '☆'}</button>}{foods.map((stack) => <button key={stack.itemId} title={name(index.items.get(stack.itemId)?.name ?? stack.itemId)} onClick={() => store.feedPet(pet.uid, stack.itemId, 1)}><img src={assetUrl(index.items.get(stack.itemId)?.imageKey)} alt="" /></button>)}<button onClick={() => setMergeSource(mergeSource === pet.uid ? null : pet.uid)}>{mergeSource === pet.uid ? '✓' : '⇄'}</button>{mergeSource !== null && mergeSource !== pet.uid && <button onClick={() => { store.mergePet(mergeSource, pet.uid); setMergeSource(null) }}>{t('shelter.mergeHere')}</button>}</div></article>
    })}</div>}
    {state.pets.length > 0 && <div className="pet-detail-selector">{pets.map((pet) => <button className={selectedPetUid === pet.uid ? 'selected' : ''} key={pet.uid} onClick={() => setSelectedPetUid(pet.uid)}>{t('shelter.viewPet', { pet: name(index.pets.get(pet.petId)?.name ?? pet.petId) })}</button>)}</div>}
    {foods.length > 0 && <button className={`shelter-feed-mode ${feedAll ? 'selected' : ''}`} onClick={() => setFeedAll(!feedAll)}>{feedAll ? t('shelter.feedAll') : t('shelter.feedOne')}</button>}
    {selectedPet && selectedDefinition && <div className="confirm-layer"><section className="confirm-box pet-detail"><img src={assetUrl(selectedDefinition.imageKey)} alt="" /><div><h3>{name(selectedDefinition.name)} · {t('common.level')} {selectedPet.level}</h3><p className="pet-family">{language === 'vi' ? 'Loại' : 'Type'}: {selectedDefinition.family}</p><p>{description(selectedDefinition.id, selectedDefinition.description)}</p><ProgressBar value={selectedPet.food} max={petFoodToNextLevel(selectedPet.level)} label={`${selectedPet.food}/${petFoodToNextLevel(selectedPet.level)}`} /><h4>{t('shelter.abilities')}</h4><ul className="pet-ability-list">{selectedPet.abilities.map((ability, abilityIndex) => { const detail = petAbilityDetail(language, ability, selectedPet.level, abilityIndex); const unlockedAt = abilityIndex * 20 + 1; const unlocked = selectedPet.level >= unlockedAt; return <li className={!unlocked || ability === 'EMPTY' ? 'locked' : ''} key={`${ability}-${abilityIndex}`}><strong>{detail.name} {unlocked ? `(${detail.strength})` : t('shelter.unlockAbility', { level: unlockedAt })}</strong><small>{detail.description}</small></li> })}</ul></div><div className="pet-detail-actions">{state.buildings.shelterAutofeed > 0 && <button className={selectedPet.favourite ? 'selected' : ''} onClick={() => store.togglePetFavourite(selectedPet.uid)}>{selectedPet.favourite ? t('shelter.unfavourite') : t('shelter.favourite')}</button>}{foods.map((stack) => <button key={stack.itemId} onClick={() => store.feedPet(selectedPet.uid, stack.itemId, feedAll ? stack.stack : 1)}><img src={assetUrl(index.items.get(stack.itemId)?.imageKey)} alt="" />{feedAll ? stack.stack : 1}</button>)}{selectedPet.level <= 1 && selectedPet.food === 0 && <button onClick={releaseSelectedPet}>{t('shelter.setFree')}</button>}<button onClick={() => setSelectedPetUid(null)}>{t('common.close')}</button></div></section></div>}
    {mergeSourcePet && <div className="confirm-layer"><section className="confirm-box merge-pet-dialog"><h3>{t('shelter.mergeTitle')}</h3><p>{t('shelter.mergeHint', { pet: name(index.pets.get(mergeSourcePet.petId)?.name ?? mergeSourcePet.petId) })}</p><div className="merge-pet-targets">{pets.filter((pet) => pet.uid !== mergeSourcePet.uid).map((pet) => <button key={pet.uid} onClick={() => { store.mergePet(mergeSourcePet.uid, pet.uid); setMergeSource(null) }}><img src={assetUrl(index.pets.get(pet.petId)?.imageKey)} alt="" />{name(index.pets.get(pet.petId)?.name ?? pet.petId)} / {t('common.level')} {pet.level}</button>)}</div><div><button onClick={() => setMergeSource(null)}>{t('common.cancel')}</button></div></section></div>}
    {upgrade && <UpgradeConfirmation target={t(upgrade === 'capacity' ? 'shelter.upgradeCapacity' : 'shelter.unlockAutofeed')} cost={upgrade === 'capacity' ? capacityCost : autofeedCost} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeShelter(upgrade); setUpgrade(null) }} />}
    <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

export function LegacyStorageDialog({ store, index, onClose, onConsume }: { store: GameStore; index: ContentIndex; onClose: () => void; onConsume: (itemId: string) => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
  const [filter, setFilter] = useState<'all' | 'materials' | 'weapons' | 'armors' | 'accessories' | 'consumables'>('all')
  const [sort, setSort] = useState<'type' | 'quantity' | 'alphabetical' | 'priceUnit' | 'priceTotal'>('type')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [confirmUpgrade, setConfirmUpgrade] = useState(false)
  const capacity = buildingCapacity('storage', state.buildings.storage, state.permanentUpgrades.UpgradeStorage ?? 0, state.purchasedPacks)
  const price = storagePrice(state.buildings.storage)
  const equipmentTypes = new Set(['Bow', 'Dagger', 'Staff', 'Sword', 'HeavyArmor', 'MediumArmor', 'LightArmor', 'Accessory'])
  const consumableTypes = new Set(['Consumable', 'Egg', 'Food', 'Potion', 'Upgrade'])
  const items = state.inventory.filter((stack) => {
    const type = index.items.get(stack.itemId)?.type ?? 'Item'
    if (filter === 'materials') return !equipmentTypes.has(type) && !consumableTypes.has(type)
    if (filter === 'weapons') return ['Bow', 'Dagger', 'Staff', 'Sword'].includes(type)
    if (filter === 'armors') return ['HeavyArmor', 'MediumArmor', 'LightArmor'].includes(type)
    if (filter === 'accessories') return type === 'Accessory'
    if (filter === 'consumables') return consumableTypes.has(type)
    return true
  }).sort((left, right) => {
    const a = index.items.get(left.itemId)
    const b = index.items.get(right.itemId)
    if (sort === 'quantity') return right.stack - left.stack
    if (sort === 'alphabetical') return name(a?.name ?? left.itemId).localeCompare(name(b?.name ?? right.itemId))
    const aPrice = Number(a?.fields.price ?? 0)
    const bPrice = Number(b?.fields.price ?? 0)
    if (sort === 'priceUnit') return bPrice - aPrice
    if (sort === 'priceTotal') return bPrice * right.stack - aPrice * left.stack
    return (a?.type ?? '').localeCompare(b?.type ?? '') || name(a?.name ?? left.itemId).localeCompare(name(b?.name ?? right.itemId))
  })
  const selectedStack = state.inventory.find((stack) => stack.itemId === selectedItemId)
  const selected = selectedStack && index.items.get(selectedStack.itemId)
  const canUse = selected?.type === 'Potion' || ['Geode', 'Intercession', 'PotionOfRejuvenation', 'PotionOfClumsiness', 'Evo23Vial', 'Evo23Vial2'].includes(selected?.id ?? '')
  return <Modal title={t('building.storage')} onClose={onClose} wide>
    <div className="section-heading"><strong>{t('storage.items')}</strong><span>{state.inventory.length} / {capacity}</span></div>
    <button className="storage-filter-toggle" onClick={() => setShowFilters(!showFilters)}>{showFilters ? t('storage.hideFilters') : t('storage.showFilters')}</button>
    {showFilters && <div className="storage-filters"><label>{t('storage.filter')}<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">{t('storage.all')}</option><option value="materials">{t('storage.materials')}</option><option value="weapons">{t('storage.weapons')}</option><option value="armors">{t('storage.armors')}</option><option value="accessories">{t('storage.accessories')}</option><option value="consumables">{t('storage.consumables')}</option></select></label><label>{t('storage.sort')}<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="type">{t('storage.sortType')}</option><option value="quantity">{t('storage.sortQuantity')}</option><option value="alphabetical">{t('storage.sortAlphabetical')}</option><option value="priceUnit">{t('storage.sortPriceUnit')}</option><option value="priceTotal">{t('storage.sortPriceTotal')}</option></select></label></div>}
    {state.buildings.storage < 80 && <div className="tavern-upgrades storage-upgrades"><button disabled={state.money < price} onClick={() => state.settings.confirmUpgrade ? setConfirmUpgrade(true) : store.upgradeFacility('storage')}><strong>{t('storage.upgrade')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{price.toLocaleString()}</span></button></div>}
    {items.length === 0 && <EmptyState text={t('storage.empty')} />}
    <div className="item-grid">{items.map((stack) => {
      const item = index.items.get(stack.itemId)
      return <button className="item-slot" onClick={() => setSelectedItemId(stack.itemId)} key={stack.itemId}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span></button>
    })}</div>
    {confirmUpgrade && <UpgradeConfirmation target={t('storage.upgrade')} cost={price} onCancel={() => setConfirmUpgrade(false)} onConfirm={() => { store.upgradeFacility('storage'); setConfirmUpgrade(false) }} />}
    {selectedStack && selected && <div className="confirm-layer"><section className="confirm-box item-detail"><img src={assetUrl(selected.imageKey)} alt="" /><div className="item-detail-copy"><h3>{name(selected.name)}</h3><p>{description(selected.id, selected.description)}</p><small>{t('storage.stack', { count: selectedStack.stack })} · {t('storage.value', { value: Number(selected.fields.price ?? 0) })}</small></div><div className="item-detail-actions">{selected.type === 'Egg' && <button onClick={() => { store.hatchPet(selected.id); setSelectedItemId(null) }}>{t('storage.hatch')}</button>}{canUse && <button onClick={() => { onConsume(selected.id); setSelectedItemId(null) }}>{t('storage.use')}</button>}<button onClick={() => setSelectedItemId(null)}>{t('common.close')}</button></div></section></div>}
  </Modal>
}

function areaNamesForEnemy(enemyId: string, index: ContentIndex, name: (value: string) => string) {
  return [...index.areas.values()]
    .filter((area) => area.enemies.includes(enemyId) || area.encounterRosters.some((roster) => roster.enemies.includes(enemyId)))
    .map((area) => name(area.name))
}

function ItemOriginTooltip({ itemId, index }: { itemId: string; index: ContentIndex }) {
  const { language, name } = useI18n()
  const item = index.items.get(itemId)
  const enemies = [...index.enemies.values()].filter((enemy) => enemy.drops.some((drop) => drop.item === itemId))
  const crafted = RECIPES.some((recipe) => recipe.result.itemId === itemId)
  const copy = language === 'vi'
    ? { drop: 'Rơi từ', craft: 'Có thể chế tạo tại Workshop', none: 'Chưa có nguồn rơi hoặc công thức.' }
    : { drop: 'Drops from', craft: 'Can be crafted in the Workshop', none: 'No drop source or recipe is known.' }
  return <span className="item-origin-tooltip" role="tooltip"><strong>{name(item?.name ?? itemId)}</strong>{enemies.length > 0 && <><small>{copy.drop}</small><span className="origin-enemy-list">{enemies.map((enemy) => { const maps = areaNamesForEnemy(enemy.id, index, name); return <span className="origin-enemy" title={maps.join(' · ')} key={enemy.id}><img src={assetUrl(enemy.imageKey)} alt="" /><span><span className="origin-enemy-name">{name(enemy.name)}</span><small>{maps.join(' · ') || '—'}</small></span></span> })}</span></>}{crafted && <small className="origin-crafted">{copy.craft}</small>}{enemies.length === 0 && !crafted && <small>{copy.none}</small>}</span>
}

function useClosableTooltip() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])
  return { open, rootRef, setOpen }
}

function ItemRelationIcon({ itemId, index, amount }: { itemId: string; index: ContentIndex; amount?: number }) {
  const { name } = useI18n()
  const { open, rootRef, setOpen } = useClosableTooltip()
  const item = index.items.get(itemId)
  return <span className={`relation-icon ${open ? 'is-open' : ''}`} ref={rootRef}><button type="button" title={name(item?.name ?? itemId)} aria-expanded={open} onClick={() => setOpen((value) => !value)}><img src={assetUrl(item?.imageKey)} alt="" />{amount !== undefined && <b>×{amount}</b>}</button><ItemOriginTooltip itemId={itemId} index={index} /></span>
}

function EnemyRelationIcon({ enemyId, index }: { enemyId: string; index: ContentIndex }) {
  const { language, name } = useI18n()
  const { open, rootRef, setOpen } = useClosableTooltip()
  const enemy = index.enemies.get(enemyId)
  if (!enemy) return null
  const maps = areaNamesForEnemy(enemyId, index, name)
  const mapLabel = language === 'vi' ? 'Xuất hiện ở' : 'Appears in'
  return <span className={`relation-icon ${open ? 'is-open' : ''}`} ref={rootRef}><button type="button" title={name(enemy.name)} aria-expanded={open} onClick={() => setOpen((value) => !value)}><img src={assetUrl(enemy.imageKey)} alt="" /></button><span className="enemy-origin-tooltip" role="tooltip"><strong>{name(enemy.name)}</strong><small>{mapLabel}: {maps.join(' · ') || '—'}</small></span></span>
}

function ItemFacts({ item, index }: { item: ItemDefinition; index: ContentIndex }) {
  const { t } = useI18n()
  const labels: Record<string, string> = { maxHp: 'HP', constitution: 'CON', intelligence: 'INT', dexterity: 'DEX', defense: 'DEF', magicDefense: 'MDEF', criticalChance: 'CRIT', criticalDamage: 'CRIT DMG.', bonusExperience: 'XP BONUS', lifesteal: 'LIFESTEAL', counterattack: 'COUNTER', regeneration: 'REGEN', healingModifier: 'HEAL MOD.', darknessReduction: 'DARKNESS RED.', darknessDamageAmplification: 'DARKNESS DMG.', immunityToStatus: 'STATUS IMM.', flatDodgeChance: 'DODGE', threat: 'THREAT', price: 'VALUE', feedPower: 'FEED POWER' }
  const percent = new Set(['criticalChance', 'criticalDamage', 'bonusExperience', 'lifesteal', 'counterattack', 'healingModifier', 'darknessDamageAmplification', 'immunityToStatus', 'flatDodgeChance'])
  const facts = Object.entries(item.fields).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value) && value !== 0 && value !== false)
  const sources = [...index.enemies.values()].filter((enemy) => enemy.drops.some((drop) => drop.item === item.id))
  const buildsFrom = RECIPES.find((recipe) => recipe.result.itemId === item.id)
  const buildsInto = RECIPES.filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.itemId === item.id))
  return <><dl className="item-facts"><div><dt>{t('item.type')}</dt><dd>{item.type}</dd></div>{facts.map(([key, value]) => <div key={key}><dt>{labels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</dt><dd>{typeof value === 'boolean' ? t('common.yes') : `${value}${percent.has(key) ? '%' : ''}`}</dd></div>)}</dl><section className="item-relations">{sources.length > 0 && <div><strong>{t('item.sources')}</strong><span className="relation-icons">{sources.map((enemy) => <EnemyRelationIcon enemyId={enemy.id} index={index} key={enemy.id} />)}</span></div>}{buildsFrom && <div><strong>{t('item.buildsFrom')}</strong><span className="relation-icons">{buildsFrom.ingredients.map((ingredient) => <ItemRelationIcon itemId={ingredient.itemId} amount={ingredient.stack} index={index} key={ingredient.itemId} />)}</span></div>}{buildsInto.length > 0 && <div><strong>{t('item.buildsInto')}</strong><span className="relation-icons">{buildsInto.map((recipe) => <ItemRelationIcon itemId={recipe.result.itemId} amount={recipe.result.stack} index={index} key={recipe.id} />)}</span></div>}</section></>
}

function StorageDialog({ store, index, onClose, onConsume, onSell }: { store: GameStore; index: ContentIndex; onClose: () => void; onConsume: (itemId: string) => void; onSell: (itemId: string) => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
  const [filter, setFilter] = useState<'all' | 'materials' | 'weapons' | 'armors' | 'accessories' | 'consumables'>('all')
  const [sort, setSort] = useState<'type' | 'quantity' | 'alphabetical' | 'priceUnit' | 'priceTotal'>('type')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [confirmUpgrade, setConfirmUpgrade] = useState(false)
  const capacity = buildingCapacity('storage', state.buildings.storage, state.permanentUpgrades.UpgradeStorage ?? 0, state.purchasedPacks)
  const price = storagePrice(state.buildings.storage)
  const equipmentTypes = new Set(['Bow', 'Dagger', 'Staff', 'Sword', 'HeavyArmor', 'MediumArmor', 'LightArmor', 'Accessory'])
  const consumableTypes = new Set(['Consumable', 'Egg', 'Food', 'Potion', 'Upgrade'])
  const items = state.inventory.filter((stack) => {
    const type = index.items.get(stack.itemId)?.type ?? 'Item'
    return filter === 'materials' ? !equipmentTypes.has(type) && !consumableTypes.has(type)
      : filter === 'weapons' ? ['Bow', 'Dagger', 'Staff', 'Sword'].includes(type)
        : filter === 'armors' ? ['HeavyArmor', 'MediumArmor', 'LightArmor'].includes(type)
          : filter === 'accessories' ? type === 'Accessory'
            : filter === 'consumables' ? consumableTypes.has(type) : true
  }).sort((left, right) => {
    const a = index.items.get(left.itemId); const b = index.items.get(right.itemId)
    const priceA = Number(a?.fields.price ?? 0); const priceB = Number(b?.fields.price ?? 0)
    if (sort === 'quantity') return right.stack - left.stack
    if (sort === 'alphabetical') return name(a?.name ?? left.itemId).localeCompare(name(b?.name ?? right.itemId))
    if (sort === 'priceUnit') return priceB - priceA
    if (sort === 'priceTotal') return priceB * right.stack - priceA * left.stack
    return (a?.type ?? '').localeCompare(b?.type ?? '') || name(a?.name ?? left.itemId).localeCompare(name(b?.name ?? right.itemId))
  })
  const selectedStack = state.inventory.find((stack) => stack.itemId === selectedItemId)
  const selected = selectedStack && index.items.get(selectedStack.itemId)
  const canUse = selected?.type === 'Potion' || ['Geode', 'Intercession', 'PotionOfRejuvenation', 'PotionOfClumsiness', 'Evo23Vial', 'Evo23Vial2'].includes(selected?.id ?? '')
  return <Modal title={t('building.storage')} onClose={onClose} wide>
    <div className="section-heading"><strong>{t('storage.items')}</strong><span>{state.inventory.length} / {capacity}</span></div>
    <div className="storage-filters"><label>{t('storage.filter')}<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">{t('storage.all')}</option><option value="materials">{t('storage.materials')}</option><option value="weapons">{t('storage.weapons')}</option><option value="armors">{t('storage.armors')}</option><option value="accessories">{t('storage.accessories')}</option><option value="consumables">{t('storage.consumables')}</option></select></label><label>{t('storage.sort')}<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="type">{t('storage.sortType')}</option><option value="quantity">{t('storage.sortQuantity')}</option><option value="alphabetical">{t('storage.sortAlphabetical')}</option><option value="priceUnit">{t('storage.sortPriceUnit')}</option><option value="priceTotal">{t('storage.sortPriceTotal')}</option></select></label></div>
    {state.buildings.storage < 80 && <div className="tavern-upgrades storage-upgrades"><button disabled={state.money < price} onClick={() => state.settings.confirmUpgrade ? setConfirmUpgrade(true) : store.upgradeFacility('storage')}><strong>{t('storage.upgrade')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{price.toLocaleString()}</span></button></div>}
    {items.length === 0 && <EmptyState text={t('storage.empty')} />}
    <div className="item-grid">{items.map((stack) => { const item = index.items.get(stack.itemId); return <button className="item-slot" onClick={() => setSelectedItemId(stack.itemId)} key={stack.itemId}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span></button> })}</div>
    {confirmUpgrade && <UpgradeConfirmation target={t('storage.upgrade')} cost={price} onCancel={() => setConfirmUpgrade(false)} onConfirm={() => { store.upgradeFacility('storage'); setConfirmUpgrade(false) }} />}
    {selected && selectedStack && <div className="confirm-layer"><section className="confirm-box item-detail"><img src={assetUrl(selected.imageKey)} alt="" /><div className="item-detail-copy"><h3>{name(selected.name)}</h3><p>{description(selected.id, selected.description)}</p><small>{t('storage.stack', { count: selectedStack.stack })} · {t('storage.value', { value: Number(selected.fields.price ?? 0) })}</small><ItemFacts item={selected} index={index} /></div><div className="item-detail-actions">{selected.type === 'Egg' && <button onClick={() => { store.hatchPet(selected.id); setSelectedItemId(null) }}>{t('storage.hatch')}</button>}{canUse && <button onClick={() => { onConsume(selected.id); setSelectedItemId(null) }}>{t('storage.use')}</button>}{Number(selected.fields.price ?? 0) > 0 && !selected.fields.notSellable && <button onClick={() => onSell(selected.id)}>{t('market.confirmSale')}</button>}<button onClick={() => setSelectedItemId(null)}>{t('common.close')}</button></div></section></div>}
  </Modal>
}

function BuildingDialog({ id, store, index, onClose, onConsume, onOpenMarket }: { id: string; store: GameStore; index: ContentIndex; onClose: () => void; onConsume: (itemId: string) => void; onOpenMarket: (itemId: string) => void }) {
  const state = useGame(store)
  const { t } = useI18n()
  const [confirmQuarters, setConfirmQuarters] = useState(false)
  const title = t(`building.${id}`)
  if (id === 'workshop') return <WorkshopDialog store={store} index={index} onClose={onClose} />
  if (id === 'tavern') return <TavernDialog store={store} index={index} onClose={onClose} />
  if (id === 'market') return <MarketDialog store={store} index={index} onClose={onClose} />
  if (id === 'shelter') return <ShelterDialog store={store} index={index} onClose={onClose} />
  if (id === 'storage') return <StorageDialog store={store} index={index} onClose={onClose} onConsume={onConsume} onSell={onOpenMarket} />
  if (id === 'quarters') {
    const capacity = buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)
    const price = quartersPrice(state.buildings.quarters)
    return <Modal title={t('building.quarters')} onClose={onClose}>
      <div className="building-detail"><img src={assetUrl('sign_quarters')} alt="" /><h3>{t('quarters.capacity', { used: state.adventurers.length, max: capacity })}</h3><p>{t('quarters.description')}</p></div>
      {state.buildings.quarters < 23 && <div className="tavern-upgrades"><button disabled={state.money < price} onClick={() => state.settings.confirmUpgrade ? setConfirmQuarters(true) : store.upgradeFacility('quarters')}><strong>{t('quarters.upgrade')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{price.toLocaleString()}</span></button></div>}
      {confirmQuarters && <UpgradeConfirmation target={t('quarters.upgrade')} cost={price} onCancel={() => setConfirmQuarters(false)} onConfirm={() => { store.upgradeFacility('quarters'); setConfirmQuarters(false) }} />}
      <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
    </Modal>
  }
  return (
    <Modal title={title} onClose={onClose}>
      <div className="building-detail">
        <img src={assetUrl(`sign_${id}`)} alt="" />
        <p>{t('building.unavailable')}</p>
      </div>
    </Modal>
  )
}

function SendTeamDialog({ areaId, store, index, onClose, onSent }: { areaId: string; store: GameStore; index: ContentIndex; onClose: () => void; onSent: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [selected, setSelected] = useState<number[]>([])
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'load' | 'save' | null>(null)
  const [selectedPet, setSelectedPet] = useState<number | null>(null)
  const [showPetPicker, setShowPetPicker] = useState(false)
  const area = index.areas.get(areaId)
  const available = state.adventurers.filter((entry) => !entry.areaId)
  const teamSize = areaTeamSize(area)
  const savedTeamKey = `guild-master-web-team-${areaId}`

  const choose = (uid: number) => {
    if (pickerSlot === null) return
    setSelected((current) => {
      const next = current.filter((id) => id !== uid)
      if (pickerSlot >= next.length) next.push(uid)
      else next[pickerSlot] = uid
      return next.slice(0, teamSize)
    })
    setPickerSlot(null)
  }

  const flash = (kind: 'load' | 'save') => {
    setFeedback(kind)
    window.setTimeout(() => setFeedback(null), 420)
  }

  const saveTeam = () => {
    localStorage.setItem(savedTeamKey, JSON.stringify(selected))
    flash('save')
  }

  const loadTeam = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(savedTeamKey) ?? '[]') as number[]
      const availableIds = new Set(available.map((member) => member.uid))
      setSelected(saved.filter((uid) => availableIds.has(uid)).slice(0, teamSize))
    } catch {
      setSelected([])
    }
    flash('load')
  }

  return (
    <div className="team-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="team-dialog" role="dialog" aria-modal="true" aria-label={t('team.composition', { area: name(area?.name ?? areaId) })} onMouseDown={(event) => event.stopPropagation()}>
        <div className="team-slots">
          {Array.from({ length: teamSize }, (_, slotIndex) => {
            const member = state.adventurers.find((entry) => entry.uid === selected[slotIndex])
            const definition = member && index.adventurers.get(member.classId)
            return (
              <button className={`team-slot ${member && definition ? 'filled' : 'empty'}`} key={slotIndex} onClick={() => setPickerSlot(slotIndex)}>
                {member && definition ? (
                  <>
                    <span className="team-slot-portrait"><img src={assetUrl(definition.imageKey)} alt="" /><small>{member.level}</small></span>
                    <span className="team-slot-copy"><strong>{member.name}</strong><small>{name(member.trait?.replaceAll('_', ' ') ?? '')}</small></span>
                    <span className="team-slot-equipment" aria-hidden="true">
                      {([member.weaponId, member.armorId, member.accessoryId] as Array<string | null>).map((itemId, equipmentIndex) => (
                        <i key={`${equipmentIndex}-${itemId ?? 'empty'}`}><img src={assetUrl(itemId ? index.items.get(itemId)?.imageKey : 'empty_equipment')} alt="" /></i>
                      ))}
                    </span>
                  </>
                ) : <span className="team-plus">+</span>}
              </button>
            )
          })}
        </div>
        <button className="team-pet-slot" type="button" title={t('team.noPets')} onClick={() => setShowPetPicker(true)}>{selectedPet === null ? <span>+</span> : <img src={assetUrl(index.pets.get(state.pets.find((pet) => pet.uid === selectedPet)?.petId ?? '')?.imageKey)} alt="" />}</button>
        <div className="team-memory-actions">
          <button className={feedback === 'load' ? 'blink-success' : ''} onClick={loadTeam}>{t('team.load')}</button>
          <button className={feedback === 'save' ? 'blink-success' : ''} onClick={saveTeam}>{t('team.save')}</button>
        </div>
        <div className="team-dialog-actions">
          <button onClick={onClose}>{t('common.close')}</button>
          <button onClick={() => setSelected([])}>{t('common.clear')}</button>
          <button className="send-team-action" disabled={selected.length === 0} onClick={() => { store.send(areaId, selected, selectedPet); onSent() }}>{t('team.send')}</button>
        </div>
        {pickerSlot !== null && (
          <div className="team-picker-layer" onMouseDown={() => setPickerSlot(null)}>
            <div className="team-picker" onMouseDown={(event) => event.stopPropagation()}>
              <strong>{t('team.choose')}</strong>
              <div>
                {selected[pickerSlot] && <button className="team-picker-remove" onClick={() => { setSelected((current) => current.filter((_, index) => index !== pickerSlot)); setPickerSlot(null) }}>{t('common.remove')}</button>}
                {available.map((member) => {
                  const definition = index.adventurers.get(member.classId)
                  const usedElsewhere = selected.includes(member.uid) && selected[pickerSlot] !== member.uid
                  return definition ? <button className="team-picker-member" disabled={usedElsewhere} key={member.uid} onClick={() => choose(member.uid)}><img src={assetUrl(definition.imageKey)} alt="" /><span><b>{member.name}</b><small>{name(definition.name)} · {t('common.level')} {member.level}</small></span></button> : null
                })}
              </div>
              <button className="team-picker-close" onClick={() => setPickerSlot(null)}>{t('common.close')}</button>
            </div>
          </div>
        )}
        {showPetPicker && <div className="team-picker-layer" onMouseDown={() => setShowPetPicker(false)}><div className="team-picker" onMouseDown={(event) => event.stopPropagation()}><strong>{t('team.choosePet')}</strong><div><button className="team-picker-remove" onClick={() => { setSelectedPet(null); setShowPetPicker(false) }}>{t('common.remove')}</button>{state.pets.filter((pet) => !Object.values(state.runs).some((run) => !run.finished && run.petUid === pet.uid)).map((pet) => { const definition = index.pets.get(pet.petId); return <button className="team-picker-member" key={pet.uid} onClick={() => { setSelectedPet(pet.uid); setShowPetPicker(false) }}><img src={assetUrl(definition?.imageKey)} alt="" /><span><b>{name(definition?.name ?? pet.petId)}</b><small>{t('common.level')} {pet.level}</small></span></button> })}</div><button className="team-picker-close" onClick={() => setShowPetPicker(false)}>{t('common.close')}</button></div></div>}
      </section>
    </div>
  )
}

function RefillRaidDialog({ areaId, store, index, onClose, onBought }: { areaId: string; store: GameStore; index: ContentIndex; onClose: () => void; onBought: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [failed, setFailed] = useState(false)
  const area = index.areas.get(areaId)
  const cost = raidTryCost(areaId)
  const buy = async () => {
    if (await store.refillRaid(areaId)) onBought()
    else setFailed(true)
  }
  return (
    <Modal title={t('raid.additionalTry')} onClose={onClose}>
      <section className="raid-refill">
        <img className="raid-refill-icon" src={assetUrl('raid_try_unavailable')} alt="" />
        <p>{t('raid.refillPrompt', { area: name(area?.name ?? areaId), cost })}</p>
        <div className="raid-refill-balance"><Currency amount={state.gems} icon="gem" label={t('currency.gems')} /></div>
        {failed && <p className="raid-refill-error">{t('raid.notEnoughGems')}</p>}
        <footer>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="raid-refill-buy" onClick={buy}><img src={assetUrl('gem')} alt="" />{cost}</button>
        </footer>
      </section>
    </Modal>
  )
}

type BattleInspectSelection =
  | { kind: 'enemy'; state: EnemyState; definition: EnemyDefinition }
  | { kind: 'adventurer'; state: AdventurerState; definition: AdventurerDefinition }
  | { kind: 'pet'; state: PetState; definition: PetDefinition }

function BattleEntity({ image, name, hp, maxHp, mana = 0, shield = 0, statuses = [], activeSkill = false, onInspect }: { image: string; name: string; hp: number; maxHp: number; mana?: number; shield?: number; statuses?: StatusEffectState[]; activeSkill?: boolean; onInspect?: () => void }) {
  const { status: statusName } = useI18n()
  const previousVitals = useRef({ hp, shield })
  const previousStatusSignature = useRef<string | null>(null)
  const [damaged, setDamaged] = useState(false)
  const [lifeTransition, setLifeTransition] = useState<'is-defeated' | 'is-revived' | ''>('')
  const [statusUpdated, setStatusUpdated] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; tone: 'damage' | 'heal' | 'shield' } | null>(null)
  const shownStatuses = statuses.slice(0, 3)
  const statusSignature = shownStatuses.map((status) => `${status.type}:${status.turnsLeft}`).join('|')
  useEffect(() => {
    const previous = previousVitals.current
    const damage = Math.max(0, previous.hp - hp) + Math.max(0, previous.shield - shield)
    const heal = Math.max(0, hp - previous.hp)
    const barrier = Math.max(0, shield - previous.shield)
    const nextLifeTransition = previous.hp > 0 && hp <= 0 ? 'is-defeated' : previous.hp <= 0 && hp > 0 ? 'is-revived' : ''
    previousVitals.current = { hp, shield }
    if (nextLifeTransition) setLifeTransition(nextLifeTransition)
    if (damage === 0 && heal === 0 && barrier === 0) return
    const isDamage = damage > 0
    setDamaged(isDamage)
    setFeedback({ text: `${isDamage ? '-' : '+'}${isDamage ? damage : heal || barrier}`, tone: isDamage ? 'damage' : heal > 0 ? 'heal' : 'shield' })
    const stop = window.setTimeout(() => {
      setDamaged(false)
      setFeedback(null)
      setLifeTransition('')
    }, isDamage ? 800 : 700)
    return () => window.clearTimeout(stop)
  }, [hp, shield])
  useEffect(() => {
    if (previousStatusSignature.current === null) {
      previousStatusSignature.current = statusSignature
      return
    }
    if (previousStatusSignature.current === statusSignature) return
    previousStatusSignature.current = statusSignature
    setStatusUpdated(true)
    const stop = window.setTimeout(() => setStatusUpdated(false), 350)
    return () => window.clearTimeout(stop)
  }, [statusSignature])
  const activate = () => onInspect?.()
  return (
    <div
      className={`battle-entity ${damaged ? 'is-damaged' : ''} ${lifeTransition} ${onInspect ? 'is-interactive' : ''}`}
      title={name}
      role={onInspect ? 'button' : undefined}
      tabIndex={onInspect ? 0 : undefined}
      onClick={activate}
      onKeyDown={(event) => {
        if (onInspect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          activate()
        }
      }}
      aria-label={`${name}, ${hp} of ${maxHp} health, ${shield} shield, ${mana} mana`}
    >
      <div className={`entity-statuses ${statusUpdated ? 'is-updated' : ''}`}>
        {Array.from({ length: 3 }, (_, statusIndex) => {
          const status = shownStatuses[statusIndex]
          if (!status) return <i className="empty" key={`empty-${statusIndex}`} aria-hidden="true" />
          const icon = statusIconKey(status.type)
          return <i key={`${status.type}-${statusIndex}`} title={`${statusName(status.type)} (${status.turnsLeft})`} aria-label={`${statusName(status.type)}, ${status.turnsLeft}`} style={icon ? { backgroundImage: `url(${assetUrl(icon)})` } : undefined} />
        })}
      </div>
      <img className="battle-sprite" src={assetUrl(hp > 0 ? image : 'tombstone')} alt="" />
      {damaged && <img className="battle-damage-flash" src={assetUrl('animated_icon_damaged')} alt="" aria-hidden="true" />}
      {feedback && <span className={`battle-float-number ${feedback.tone}`} aria-hidden="true">{feedback.text}</span>}
      <div className="entity-bars" aria-hidden="true">
        <span className="entity-hp" style={{ width: `${Math.max(0, Math.min(100, hp / maxHp * 100))}%` }} />
        <span className="entity-shield" style={{ width: `${Math.max(0, Math.min(100, shield / maxHp * 100))}%` }} />
        {activeSkill && <span className={`entity-mana ${mana >= 100 ? 'mana-full' : ''}`} style={{ width: `${Math.max(0, Math.min(100, mana))}%` }} />}
      </div>
    </div>
  )
}

function battleLogTone(line: string) {
  const value = line.toLowerCase()
  if (value.includes('miss') || value.includes("couldn't avoid") || value.includes('avoided')) return 'miss'
  if (value.includes('critical') || value.includes('crit')) return 'critical'
  if (value.includes('immune') || value.includes('immunity') || value.includes('blocked')) return 'blocked'
  if (value.includes('healed') || value.includes('restored') || value.includes('regenerated')) return 'heal'
  if (value.includes('damage') || value.includes('attacked') || value.includes('hit ') || value.includes('struck')) return 'damage'
  if (value.includes('status') || value.includes('poison') || value.includes('stun') || value.includes('curse') || value.includes('frozen')) return 'status'
  if (value.includes('found') || value.includes('unlocked') || value.includes('won') || value.includes('reward')) return 'reward'
  return ''
}

function battleLogFaction(line: string, partyNames: Set<string>, enemyNames: Set<string>) {
  const startsWithName = (names: Set<string>) => [...names].some((entry) => line.startsWith(`${entry} `) || line.startsWith(`${entry}'s `))
  if (startsWithName(partyNames)) return 'party'
  if (startsWithName(enemyNames)) return 'enemy'
  if ([...partyNames].some((entry) => line.includes(` from ${entry}.`) || line.includes(` to ${entry}.`))) return 'party'
  if ([...enemyNames].some((entry) => line.includes(` from ${entry}.`) || line.includes(` to ${entry}.`))) return 'enemy'
  return 'system'
}

function darknessAsset(darkness: number) {
  if (darkness < 17) return 'darkness_0'
  if (darkness < 34) return 'darkness_1'
  if (darkness < 50) return 'darkness_2'
  if (darkness < 67) return 'darkness_3'
  if (darkness < 84) return 'darkness_4'
  return 'darkness_5'
}

function areaDarknessValue(area: AreaDefinition, run: AreaRun) {
  if (area.id === 'FrostbitePeaks' && run.event?.kind === 'BLIZZARD') return 40
  if (area.id === 'ObsidianMines') return 10 + (run.event?.kind === 'UNSPEAKABLE_HORROR' ? Math.min(70, run.event.progress) : 0)
  const configured = area.darkness ?? 0
  if (typeof configured === 'number') return configured
  if (configured.runtimeFormula === 'progressOffset') return run.progress + (configured.offset ?? 0)
  return run.progress === configured.progress ? configured.whenTrue ?? 0 : configured.whenFalse ?? 0
}

function BattleInspectPanel({ selection, index, onClose }: { selection: BattleInspectSelection; index: ContentIndex; onClose: () => void }) {
  const { language, t, name, description, status } = useI18n()
  let title = ''
  let subtitle = ''
  let image = ''
  let copy = ''
  const rows: Array<[string, string]> = []
  const skills: Array<[string, string]> = []
  const equipment: Array<{ slot: EquipmentSlot; item?: ItemDefinition }> = []
  let traits = ''
  let drops: Array<{ item: string; stack: number }> = []
  let activeStatuses: StatusEffectState[] = []
  if (selection.kind === 'enemy') {
    const { state, definition } = selection
    title = name(definition.name)
    image = definition.imageKey
    copy = description(definition.id, definition.description)
    rows.push(['HP', `${state.hp}/${definition.fields.baseMaxHp}`])
    rows.push([t('bestiary.damage'), `${definition.minDamage}–${definition.maxDamage}`])
    rows.push([t('bestiary.defense'), String(definition.fields.baseDefense)])
    rows.push([t('bestiary.magicDefense'), String(definition.fields.baseMagicDefense)])
    rows.push(['CON', String(definition.fields.baseConstitution)])
    rows.push(['INT', String(definition.fields.baseIntelligence)])
    rows.push(['DEX', String(definition.fields.baseDexterity)])
    rows.push(['XP', String(definition.fields.expGiven)])
    if (definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE') skills.push([t('battle.active'), localizeActiveSkill(language, definition.fields.activeSkill)])
    if (definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE') skills.push([t('battle.passive'), localizePassiveSkill(language, definition.fields.passiveSkill)])
    drops = definition.drops
  } else if (selection.kind === 'adventurer') {
    const { state, definition } = selection
    const stats = adventurerStats(state, index)
    title = state.name
    subtitle = `${name(definition.name)} · ${t('common.level')} ${state.level}`
    image = definition.imageKey
    copy = description(definition.id, definition.description)
    rows.push(['HP', `${state.hp}/${stats.maxHp}`])
    rows.push([t('battle.shield'), String(state.shield)])
    rows.push([t('battle.mana'), String(state.mana)])
    rows.push(['CON', String(stats.constitution)])
    rows.push(['INT', String(stats.intelligence)])
    rows.push(['DEX', String(stats.dexterity)])
    rows.push([t('bestiary.defense'), String(stats.defense)])
    rows.push([t('bestiary.magicDefense'), String(stats.magicDefense)])
    rows.push([t('battle.experience'), String(state.xp)])
    if (definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE') skills.push([t('battle.active'), localizeActiveSkill(language, definition.fields.activeSkill)])
    if (definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE') skills.push([t('battle.passive'), localizePassiveSkill(language, definition.fields.passiveSkill)])
    for (const slot of ['weapon', 'armor', 'accessory'] as EquipmentSlot[]) {
      const itemId = equipmentItemId(state, slot)
      equipment.push({ slot, item: itemId ? index.items.get(itemId) : undefined })
    }
    traits = [state.trait, state.rareTrait].filter(Boolean).map((trait) => String(trait).replaceAll('_', ' ')).join(' · ')
    activeStatuses = [...state.positiveStatusEffects, ...state.negativeStatusEffects]
  } else {
    const { state, definition } = selection
    const required = petFoodToNextLevel(state.level)
    title = name(definition.name)
    subtitle = `${definition.family} · ${t('common.level')} ${state.level}`
    image = definition.imageKey
    copy = description(definition.id, definition.description)
    rows.push([t('battle.food'), `${state.food}/${required}`])
    rows.push([t('battle.abilitySlots'), String(definition.fields.abilityNumber)])
  }
  return (
    <div className="battle-inspect-layer" role="presentation" onMouseDown={onClose}>
      <section className="battle-inspect-panel" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="battle-inspect-header">
          <img src={assetUrl(image)} alt="" />
          <div><h3>{title}</h3>{subtitle && <small>{subtitle}</small>}</div>
        </header>
        <p className="battle-inspect-description">{copy}</p>
        <dl className="battle-inspect-stats">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {traits && <p className="battle-inspect-traits"><strong>{t('battle.traits')}</strong>{traits}</p>}
        {skills.length > 0 && <div className="battle-inspect-skills"><strong>{t('battle.skills')}</strong>{skills.map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div>}
        {equipment.length > 0 && <div className="battle-inspect-equipment"><strong>{t('battle.equipment')}</strong>{equipment.map(({ slot, item }) => <span key={slot}><img src={assetUrl(item?.imageKey ?? 'empty_equipment')} alt="" /><small>{t(`equipment.${slot}`)}</small><b>{item ? name(item.name) : t('equipment.none')}</b></span>)}</div>}
        {activeStatuses.length > 0 && <div className="battle-inspect-statuses"><strong>{t('battle.statuses')}</strong>{activeStatuses.map((effect, position) => <span key={`${effect.type}-${position}`}>{status(effect.type)} · {effect.turnsLeft}</span>)}</div>}
        {selection.kind === 'pet' && <div className="battle-inspect-abilities"><strong>{t('battle.abilities')}</strong>{selection.state.abilities.map((ability, abilityIndex) => ability === 'EMPTY' ? null : <span className={selection.state.level >= abilityIndex * 20 + 1 ? '' : 'locked'} key={`${ability}-${abilityIndex}`}>{ability.replace(/_/g, ' ')} · {selection.state.level >= abilityIndex * 20 + 1 ? t('battle.unlocked') : t('battle.unlockAt', { level: abilityIndex * 20 + 1 })}</span>)}</div>}
        {drops.length > 0 && <>
          <h4 className="battle-inspect-subheading">{t('bestiary.drops')}</h4>
          <div className="battle-inspect-drops">{drops.map((drop, position) => { const item = index.items.get(drop.item); return <span key={`${drop.item}-${position}`}><img src={assetUrl(item?.imageKey)} alt="" />{name(item?.name ?? drop.item)} ×{drop.stack}</span> })}</div>
        </>}
        <button className="battle-inspect-close" onClick={onClose}>{t('common.close')}</button>
      </section>
    </div>
  )
}

function BattleDarknessPanel({ darkness, onClose }: { darkness: number; onClose: () => void }) {
  const { t } = useI18n()
  const descriptionKey = darkness <= 0 ? 'battle.darkness0' : darkness <= 25 ? 'battle.darkness1' : darkness <= 50 ? 'battle.darkness2' : darkness <= 75 ? 'battle.darkness3' : 'battle.darkness4'
  return (
    <div className="battle-inspect-layer" role="presentation" onMouseDown={onClose}>
      <section className="battle-darkness-panel" role="dialog" aria-modal="true" aria-label={t('battle.darknessTitle')} onMouseDown={(event) => event.stopPropagation()}>
        <img src={assetUrl(darknessAsset(darkness))} alt="" />
        <h3>{t('battle.darknessTitle')}</h3>
        <p>{t(descriptionKey, { value: Math.round(darkness) })}</p>
        <button className="battle-inspect-close" onClick={onClose}>{t('common.close')}</button>
      </section>
    </div>
  )
}

function BattleResultPanel({ run, index, store, onClose }: { run: AreaRun; index: ContentIndex; store: GameStore; onClose: () => void }) {
  const { t, name } = useI18n()
  const inferredResult = run.logs.some((line) => line === 'The party was defeated.')
    ? 'defeat'
    : run.logs.some((line) => line === 'The party won the fight.') || (run.maxProgress > 0 && run.progress >= run.maxProgress)
      ? 'victory'
      : 'retreat'
  const result = run.finishedReason ?? inferredResult
  const [collectFailed, setCollectFailed] = useState(false)
  const collect = async () => {
    if (run.chest.length === 0 || await store.collect(run.areaId)) onClose()
    else setCollectFailed(true)
  }
  return (
    <div className="battle-result-panel">
      <strong>{t(result === 'defeat' ? 'battle.resultDefeat' : result === 'retreat' ? 'battle.resultRetreat' : 'battle.resultVictory')}</strong>
      <p>{t('battle.resultComplete')}</p>
      {run.chest.length > 0 && <div className="battle-result-loot"><small>{t('battle.loot')}</small>{run.chest.map((stack) => { const item = index.items.get(stack.itemId); return <span key={stack.itemId}><img src={assetUrl(item?.imageKey)} alt="" />{name(item?.name ?? stack.itemId)} ×{stack.stack}</span> })}</div>}
      {collectFailed && <p className="battle-result-error">{t('battle.lootFull')}</p>}
      <div className="battle-result-actions">
        {run.chest.length > 0 && <button onClick={collect}>{t('common.collect')}</button>}
        <button onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  )
}

function AdventureReportPanel({ run, index, onClose }: { run: AreaRun; index: ContentIndex; onClose: () => void }) {
  const { t, name } = useI18n()
  const duration = Math.max(0, Math.floor((Date.now() - run.report.startedAt) / 1_000))
  const kills = Object.entries(run.report.enemiesKilled)
  return <div className="battle-inspect-layer" role="presentation" onMouseDown={onClose}>
    <section className="battle-inspect-panel adventure-report" role="dialog" aria-modal="true" aria-label={t('report.title')} onMouseDown={(event) => event.stopPropagation()}>
      <h3>{t('report.title')}</h3>
      <dl className="battle-inspect-stats">
        <div><dt>{t('report.duration')}</dt><dd>{formatSeconds(duration)}</dd></div>
        <div><dt>{t('report.clears')}</dt><dd>{run.report.areasCleared}</dd></div>
        <div><dt>{t('report.wipes')}</dt><dd>{run.report.wipes}</dd></div>
        <div><dt>{t('report.xpEarned')}</dt><dd>{run.report.xpEarned.toLocaleString()}</dd></div>
        <div><dt>{t('report.xpLost')}</dt><dd>{run.report.xpLost.toLocaleString()}</dd></div>
        <div><dt>{t('report.xpPerHour')}</dt><dd>{duration > 0 ? Math.round(run.report.xpEarned / duration * 3_600).toLocaleString() : '0'}</dd></div>
      </dl>
      <h4 className="battle-inspect-subheading">{t('report.kills')}</h4>
      {kills.length === 0 ? <EmptyState text={t('report.noKills')} /> : <div className="battle-inspect-drops">{kills.map(([enemyId, count]) => { const enemy = index.enemies.get(enemyId); return <span key={enemyId}><img src={assetUrl(enemy?.imageKey)} alt="" />{name(enemy?.name ?? enemyId)} ×{count}</span> })}</div>}
      <button className="battle-inspect-close" onClick={onClose}>{t('common.close')}</button>
    </section>
  </div>
}

function AreaDialog({ areaId, store, index, onClose }: { areaId: string; store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name, log } = useI18n()
  const [confirmRetreat, setConfirmRetreat] = useState(false)
  const [inspect, setInspect] = useState<BattleInspectSelection | null>(null)
  const [showDarkness, setShowDarkness] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const area = index.areas.get(areaId)
  const run = state.runs[areaId]
  if (!area) return null
  if (!run) return null
  const party = run.partyIds.flatMap((uid) => {
    const member = state.adventurers.find((entry) => entry.uid === uid)
    const definition = member && index.adventurers.get(member.classId)
    return member && definition ? [{ member, definition }] : []
  }).concat(run.summons.flatMap((member) => {
    const definition = index.adventurers.get(member.classId)
    return definition ? [{ member, definition }] : []
  }))
  const pet = run.petUid == null ? undefined : state.pets.find((entry) => entry.uid === run.petUid)
  const petDefinition = pet && index.pets.get(pet.petId)
  const partyLogNames = new Set([...party.map(({ member }) => member.name), pet?.petId].filter((entry): entry is string => Boolean(entry)))
  const enemyLogNames = new Set(run.enemies.map((enemy) => index.enemies.get(enemy.enemyId)?.name).filter((entry): entry is string => Boolean(entry)))
  const hasDarkness = areaDarknessValue(area, run) !== 0
  const progress = run.actionTotal > 0 ? Math.max(0, Math.min(100, (run.actionTotal - run.actionRemaining) / run.actionTotal * 100)) : 0
  const epicTarget = area.areaType === 2 ? epicRaidProgressTarget(area.id) : undefined
  const renderPartyMember = ({ member, definition }: { member: AdventurerState; definition: AdventurerDefinition }) => <BattleEntity key={member.uid} image={definition.imageKey} name={member.name} hp={member.hp} maxHp={adventurerStats(member, index).maxHp} mana={member.mana} shield={member.shield} statuses={[...member.positiveStatusEffects, ...member.negativeStatusEffects]} activeSkill={Boolean(definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE')} onInspect={() => setInspect({ kind: 'adventurer', state: member, definition })} />
  return (
    <div className="battle-dialog-backdrop" role="presentation">
      <section className="battle-dialog" role="dialog" aria-modal="true" aria-label={name(area.name)}>
        <header className="battle-dialog-title"><div><h2>{name(area.name)}</h2><small>{epicTarget
          ? t('raid.epicProgress', { current: run.maxProgress, target: epicTarget })
          : t('map.roomProgress', { current: run.progress })}</small></div></header>
        <div className="battle-scene-frame">
          <img className="battle-background" src={assetUrl(area.detailImageKey)} alt="" />
          {hasDarkness && <button className="battle-moon" onClick={() => setShowDarkness(true)} aria-label={t('battle.darknessTitle')}><img src={assetUrl(darknessAsset(run.localDarkness))} alt="" /></button>}
          {pet && petDefinition && <button className="battle-pet" onClick={() => setInspect({ kind: 'pet', state: pet, definition: petDefinition })} aria-label={name(petDefinition.name)}><img src={assetUrl(petDefinition.imageKey)} alt="" /></button>}
          {!run.finished && <div className={`battlefield-units ${party.length > 8 ? 'battlefield-many' : ''}`}>
            <div className="battle-row enemy-row">
              {run.enemies.slice(0, 5).map((enemy) => {
                const definition = index.enemies.get(enemy.enemyId)
                return definition ? <BattleEntity key={enemy.uid} image={definition.imageKey} name={name(definition.name)} hp={enemy.hp} maxHp={definition.fields.baseMaxHp} mana={enemy.mana} shield={enemy.shield} statuses={[...enemy.positiveStatusEffects, ...enemy.negativeStatusEffects]} activeSkill={Boolean(definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE')} onInspect={() => setInspect({ kind: 'enemy', state: enemy, definition })} /> : null
              })}
            </div>
            {party.length > 10 && <div className="battle-row party-row">{party.slice(10, 15).map(renderPartyMember)}</div>}
            {party.length > 5 && <div className="battle-row party-row">{party.slice(5, 10).map(renderPartyMember)}</div>}
            <div className="battle-row party-row">{party.slice(0, 5).map(renderPartyMember)}</div>
          </div>}
          {run.finished && <BattleResultPanel run={run} index={index} store={store} onClose={onClose} />}
        </div>
        <div className="mirrored-progress" aria-label={t('battle.progress', { action: t(`action.${run.action}`) })}>
          <i><span style={{ width: `${progress}%` }} /></i>
          <i><span style={{ width: `${progress}%` }} /></i>
        </div>
        <div className="original-dungeon-log" aria-live="polite">{(state.settings.verboseLogs ? run.logs : run.logs.slice(0, 8)).map((line, logIndex) => { const faction = battleLogFaction(line, partyLogNames, enemyLogNames); return <p className={`battle-log-line ${battleLogTone(line)} ${faction} ${logIndex === 0 ? 'is-latest' : ''}`} key={`${line}-${logIndex}`}><i className="battle-log-faction" aria-label={faction === 'party' ? 'Party action' : faction === 'enemy' ? 'Enemy action' : 'System event'} aria-hidden="true" />{log(line)}</p> })}</div>
        <div className="battle-actions">
          <button onClick={() => setShowReport(true)}>{t('report.title')}</button>
          <button onClick={() => state.settings.confirmRetreat ? setConfirmRetreat(true) : (store.retreat(areaId), onClose())}>{t('battle.retreat')}</button>
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
        {confirmRetreat && <div className="confirm-layer"><div className="confirm-box"><h3>{t('battle.retreatTitle')}</h3><p>{t('battle.retreatConfirm')}</p><div><button onClick={() => setConfirmRetreat(false)}>{t('common.cancel')}</button><button onClick={() => { store.retreat(areaId); onClose() }}>{t('common.yes')}</button></div></div></div>}
        {inspect && <BattleInspectPanel selection={inspect} index={index} onClose={() => setInspect(null)} />}
        {showDarkness && <BattleDarknessPanel darkness={run.localDarkness} onClose={() => setShowDarkness(false)} />}
        {showReport && <AdventureReportPanel run={run} index={index} onClose={() => setShowReport(false)} />}
      </section>
    </div>
  )
}

function AdventurerDialog({ uid, store, index, onClose, onSelectEquipment }: { uid: number; store: GameStore; index: ContentIndex; onClose: () => void; onSelectEquipment: (slot: EquipmentSlot) => void }) {
  const state = useGame(store)
  const { language, t, name, description } = useI18n()
  const [showDoctrine, setShowDoctrine] = useState(false)
  const [selectedDoctrineAbility, setSelectedDoctrineAbility] = useState<string | null>(null)
  const [confirmDoctrineReset, setConfirmDoctrineReset] = useState(false)
  const member = state.adventurers.find((entry) => entry.uid === uid)
  const definition = member && index.adventurers.get(member.classId)
  if (!member || !definition) return null
  const stats = adventurerStats(member, index)
  const promotions = promotionChoices(member, index)
  const canAscend = !member.ascended && member.level >= definition.fields.maxLevel && definition.fields.maxLevel >= 45
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory']
  const activeSkill = definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE' ? localizeActiveSkill(language, definition.fields.activeSkill) : t('adventurer.noSkill')
  const passiveSkill = definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE' ? localizePassiveSkill(language, definition.fields.passiveSkill) : t('adventurer.noSkill')
  const xpRequired = member.level >= definition.fields.maxLevel ? 0 : experienceToNextLevel(member.level, member.ascended)
  const traits = [member.trait, member.rareTrait].filter((trait): trait is string => Boolean(trait))
  const equippedItems = [member.weaponId, member.armorId, member.accessoryId].flatMap((itemId) => itemId ? [index.items.get(itemId)].filter((item): item is ItemDefinition => Boolean(item)) : [])
  const bonus = (key: string) => equippedItems.reduce((total, item) => total + Number(item.fields[key] ?? 0), 0)
  const weapon = member.weaponId ? index.items.get(member.weaponId) : undefined
  const weaponType = weaponTypeKey(weapon, definition.fields.weaponType?.key ?? 'type_sword')
  const threat = Math.max(1, Number(definition.fields.threat ?? 1) + bonus('threat') + (member.rareTrait === 'INTIMIDATING' ? 1 : 0))
  const attack = adventurerAttackBounds(weaponType, stats.constitution, stats.intelligence, stats.dexterity, member.weaponId ?? undefined, threat)
  const criticalDamage = (Number(definition.fields.criticalDamage ?? 1.5) + bonus('criticalDamage') + doctrineAbilityValue(member, 'EXPLOIT_WEAKNESS') * .01) * (member.rareTrait === 'RUTHLESS' ? 1.2 : 1)
  const healingModifier = (1 + bonus('healingModifier') + doctrineAbilityValue(member, 'SELFLESS_SPIRIT') * .01) * (member.rareTrait === 'EMPATHETIC' ? 1.2 : 1)
  const darknessReduction = Number(definition.fields.darknessReduction ?? 0) + bonus('darknessReduction') + (member.rareTrait === 'BLESSED' ? 8 : 0)
  const retaliationPhysical = Number(definition.fields.retaliationPhysicalDamage ?? 0) + bonus('retaliationPhysicalDamage')
  const retaliationMagical = Number(definition.fields.retaliationMagicalDamage ?? 0) + bonus('retaliationMagicalDamage')
  const decay = Math.max(0, bonus('decay') + (member.rareTrait === 'CURSED' ? Math.ceil(stats.maxHp * .04) : 0))
  const advancedStats = [
    ['ATK', `${attack.min}-${attack.max}`], ['TYPE', weaponIsMagic(weapon, weaponType) ? 'MAGIC' : weaponIsRanged(weapon, weaponType) ? 'RANGED' : 'MELEE'], ['MANA', String(Math.trunc(stats.intelligence / 10) + 10)],
    ['THREAT', String(threat)], ['DODGE', `${Math.round((Number(definition.fields.flatDodgeChance ?? 0) + bonus('flatDodgeChance')) * 100)}%`], ['CRIT', `${Math.round(Math.min(.4, (weaponIsMagic(weapon, weaponType) ? stats.intelligence : stats.dexterity) * .004 + bonus('criticalChance')) * 100)}%`],
    ['LIFESTEAL', `${Number(definition.fields.baseLifesteal ?? 0) + bonus('lifesteal')}%`], ['COUNTER', `${Math.round((Number(definition.fields.counterattack ?? 0) + bonus('counterattack')) * 100)}%`], ['REGEN', String(Number(definition.fields.regeneration ?? 0) + bonus('regeneration'))],
    ['STATUS IMM.', `${Math.round((Number(definition.fields.immunityToStatus ?? 0) + bonus('immunityToStatus')) * 100)}%`], ['DARKNESS DMG.', `${Math.round((Number(definition.fields.darknessDamageAmplification ?? 0) + bonus('darknessDamageAmplification')) * 100)}%`],
    ['CRIT DMG.', `${Math.round(criticalDamage * 100)}%`], ['RETALIATION', `${retaliationPhysical}/${retaliationMagical}`], ['DARKNESS RED.', String(darknessReduction)],
    ['XP BONUS', `${bonus('bonusExperience')}%`], ['HEAL MOD.', `${Math.round(healingModifier * 100)}%`], ['DECAY', String(decay)],
  ]
  return (
    <Modal title={member.name} onClose={onClose}>
      <div className={`entity-detail ${member.ascended ? 'ascended' : ''}`}>
        <div className="portrait-frame large"><img src={assetUrl(definition.imageKey)} alt="" /></div>
        <div><h3>{name(definition.name)} · {t('common.level')} {member.level}</h3><p>{description(definition.id, definition.description)}</p></div>
      </div>
      <div className="stat-grid">
        <StatHint language={language} label="CON" value={stats.constitution} /><StatHint language={language} label="INT" value={stats.intelligence} /><StatHint language={language} label="DEX" value={stats.dexterity} />
        <StatHint language={language} label="HP" value={`${member.hp}/${stats.maxHp}`} /><StatHint language={language} label="DEF" value={stats.defense} /><StatHint language={language} label="MDEF" value={stats.magicDefense} />
      </div>
      <section className="adventurer-progress">
        <div><strong>{t('battle.experience')}</strong><span>{xpRequired === 0 ? t('common.max') : `${member.xp.toLocaleString()}/${xpRequired.toLocaleString()}`}</span></div>
        {xpRequired > 0 && <ProgressBar value={member.xp} max={xpRequired} />}
        {traits.length > 0 && <p><strong>{t('battle.traits')}:</strong> {traits.map((trait, position) => <span key={trait}>{position > 0 && ' · '}<TraitHint language={language} trait={trait} /></span>)}</p>}
      </section>
      <section className="adventurer-skills">
        <article><small>{t('battle.active')}</small>{definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE' ? <SkillHint language={language} kind="active" skillId={definition.fields.activeSkill} fields={definition.fields} /> : <strong>{activeSkill}</strong>}</article>
        <article><small>{t('battle.passive')}</small>{definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE' ? <SkillHint language={language} kind="passive" skillId={definition.fields.passiveSkill} fields={definition.fields} /> : <strong>{passiveSkill}</strong>}</article>
      </section>
      <section className="adventurer-advanced"><h3>{t('adventurer.combatStats')}</h3><div className="stat-grid">{advancedStats.map(([label, value]) => <span key={label}>{label} <b>{value}</b></span>)}</div></section>
      <section className="adventurer-potions"><h3>{t('adventurer.potions')}</h3><div>{['PotionOfConstitution', 'PotionOfDexterity', 'PotionOfIntelligence', 'PotionOfHealth', 'PotionOfDefense', 'PotionOfMagicDefense', 'PotionOfPrecision', 'PotionOfViciousness', 'PotionOfDarkness', 'PotionOfImmunity', 'PotionOfAgility'].map((itemId, potionType) => <span key={itemId}><img src={assetUrl(index.items.get(itemId)?.imageKey)} alt="" />{member.potionsDrank[potionType] ?? 0}/{potionLimit(member, index, potionType)}</span>)}</div></section>
      <div className="equipment-row">
        {slots.map((slot) => {
          const itemId = equipmentItemId(member, slot)
          const item = itemId ? index.items.get(itemId) : undefined
          return (
            <button key={slot} onClick={() => onSelectEquipment(slot)}>
              <img src={assetUrl(item?.imageKey ?? 'empty_equipment')} alt="" />
              <span><small>{t(`equipment.${slot}`)}</small><b>{item ? name(item.name) : t('equipment.none')}</b></span>
            </button>
          )
        })}
      </div>
      {(promotions.length > 0 || canAscend) && <section className="promotion-panel"><h3>{canAscend ? t('promotion.ascendTitle') : t('promotion.title')}</h3>{promotions.map((classId) => {
        const target = index.adventurers.get(classId)
        return target ? <button key={classId} onClick={() => store.promote(uid, classId)}><img src={assetUrl(target.imageKey)} alt="" /><span><strong>{name(target.name)}</strong><small>{t('promotion.resetLevel')}</small></span><b>✓</b></button> : null
      })}{canAscend && <button className="ascend-action" onClick={() => store.ascend(uid)}><img src={assetUrl(definition.imageKey)} alt="" /><span><strong>{t('promotion.ascend')}</strong><small>{t('promotion.ascendHint')}</small></span><b>✦</b></button>}</section>}
      {member.ascended && <section className="doctrine-panel">
        <button className="doctrine-heading" onClick={() => setShowDoctrine((value) => !value)}>
          <img src={assetUrl(member.doctrineId ? DOCTRINES[member.doctrineId].imageKey : 'doctrine_of_knowledge')} alt="" />
          <span><strong>{member.doctrineId ? t(`doctrine.${member.doctrineId}`) : t('doctrine.choose')}</strong><small>{t('doctrine.hint')}</small></span><b>{showDoctrine ? '−' : '+'}</b>
        </button>
        {showDoctrine && (!member.doctrineId ? <div className="doctrine-choices">{doctrineIds.map((id) => <button key={id} onClick={() => store.selectDoctrine(uid, id)}><img src={assetUrl(DOCTRINES[id].imageKey)} alt="" /><span>{t(`doctrine.${id}`)}</span></button>)}</div> : (() => {
          const doctrine = DOCTRINES[member.doctrineId]
          const loyalty = state.loyalty[member.doctrineId]?.level ?? 0
          const points = doctrinePointsAvailable(member, index, loyalty)
          const selectedAbility = selectedDoctrineAbility ? DOCTRINE_ABILITIES[selectedDoctrineAbility] : undefined
          const selectedSlot = selectedDoctrineAbility ? doctrine.abilities.indexOf(selectedDoctrineAbility) : -1
          const selectedLevel = selectedSlot < 0 ? 0 : member.doctrineLevels[selectedSlot] ?? 0
          return <><div className="doctrine-points"><strong>{t('doctrine.points', { points })}</strong><small>{t('doctrine.loyalty', { level: loyalty })}</small></div><div className="doctrine-abilities">{doctrine.abilities.map((abilityId, slot) => {
            const ability = DOCTRINE_ABILITIES[abilityId]
            const level = member.doctrineLevels[slot] ?? 0
            return <article className={selectedDoctrineAbility === abilityId ? 'selected' : ''} key={abilityId} onClick={() => setSelectedDoctrineAbility(abilityId)}><img src={assetUrl(`doctrine_ability_${abilityId.toLowerCase()}`)} alt="" /><div><strong>{localizeDoctrineAbility(language, abilityId)}</strong><small>{t('doctrine.abilityValue', { value: level * ability.increase })} · {ability.cost} LP</small></div><button disabled={level <= 0} onClick={(event) => { event.stopPropagation(); store.changeDoctrineAbility(uid, abilityId, -1) }}>−</button><b>{level}/{ability.maxLevel}</b><button disabled={level >= ability.maxLevel || points < ability.cost} onClick={(event) => { event.stopPropagation(); store.changeDoctrineAbility(uid, abilityId, 1) }}>+</button></article>
          })}</div>{selectedAbility && <section className="doctrine-description"><strong>{localizeDoctrineAbility(language, selectedAbility.id)} · {selectedLevel}/{selectedAbility.maxLevel}</strong><p>{doctrineAbilityDetail(language, selectedAbility.id, selectedLevel * selectedAbility.increase)}</p></section>}<button className="doctrine-reset" onClick={() => setConfirmDoctrineReset(true)}>{t('doctrine.reset')}</button></>
        })())}
      </section>}
      {confirmDoctrineReset && <ActionConfirmation title={t('doctrine.reset')} body={t('doctrine.resetConfirm')} onCancel={() => setConfirmDoctrineReset(false)} onConfirm={() => { store.resetDoctrine(uid); setConfirmDoctrineReset(false) }} />}
    </Modal>
  )
}

function EquipmentChoiceRow({ item, stack, current, onChoose }: { item?: ItemDefinition; stack?: number; current?: ItemDefinition; onChoose?: () => void }) {
  const { t, name } = useI18n()
  const differences = item ? equipmentDifference(current, item) : []
  const gains = differences.filter((entry) => entry.value > 0)
  const losses = differences.filter((entry) => entry.value < 0)
  return (
    <button className={`equipment-choice ${onChoose ? '' : 'current'}`} type="button" onClick={onChoose} disabled={!onChoose} title={item?.description}>
      <span className="equipment-choice-icon">
        <img src={assetUrl(item?.imageKey ?? 'empty_equipment')} alt="" />
        {stack !== undefined && <b>{stack}</b>}
      </span>
      <span className="equipment-choice-copy">
        <strong>{item ? name(item.name) : t('equipment.none')}</strong>
        <span className="equipment-difference">
          {gains.length > 0 && <i className="gain">{gains.map((entry) => `+${entry.value} ${entry.label}`).join('  ')}</i>}
          {losses.length > 0 && <i className="loss">{losses.map((entry) => `${entry.value} ${entry.label}`).join('  ')}</i>}
        </span>
      </span>
    </button>
  )
}

function SelectEquipmentDialog({ uid, slot, store, index, onDone }: { uid: number; slot: EquipmentSlot; store: GameStore; index: ContentIndex; onDone: () => void }) {
  const state = useGame(store)
  const { t } = useI18n()
  const [pendingItemId, setPendingItemId] = useState<string | null | undefined>(undefined)
  const member = state.adventurers.find((entry) => entry.uid === uid)
  const definition = member && index.adventurers.get(member.classId)
  if (!member || !definition) return null
  const currentId = equipmentItemId(member, slot)
  const current = currentId ? index.items.get(currentId) : undefined
  const typeKey = slot === 'accessory'
    ? 'accessory'
    : slot === 'weapon'
      ? (definition.fields.weaponType?.key ?? '').replace('type_', '')
      : (definition.fields.armorType?.key ?? '').replace('type_armor_', '')
  const candidates = state.inventory.flatMap((stack) => {
    const item = index.items.get(stack.itemId)
    return item && itemMatchesSlot(item, definition, slot, member) ? [{ item, stack: stack.stack }] : []
  })
  const canUnequip = Boolean(currentId && !(slot === 'weapon' && currentId === defaultWeaponId(definition)))
  const choose = (itemId: string | null) => {
    if (state.settings.confirmSwap) setPendingItemId(itemId)
    else { store.equip(uid, slot, itemId); onDone() }
  }

  return (
    <Modal title={t('equipment.selectTitle', { type: t(`equipment.type.${typeKey}`) })} onClose={onDone}>
      <section className="equipment-select">
        <small className="equipment-current-label">{t('equipment.equipped')}</small>
        <EquipmentChoiceRow item={current} />
        {candidates.length > 0 ? (
          <div className="equipment-candidate-list">
            {candidates.map(({ item, stack }) => (
              <EquipmentChoiceRow key={item.id} item={item} stack={stack} current={current} onChoose={() => choose(item.id)} />
            ))}
          </div>
        ) : <p className="equipment-empty">{t('equipment.empty')}</p>}
        <footer className="equipment-select-actions">
          <button disabled={!canUnequip} onClick={() => choose(null)}>{t('common.unequip')}</button>
          <button onClick={onDone}>{t('common.close')}</button>
        </footer>
      </section>
      {pendingItemId !== undefined && <ActionConfirmation title={t('settings.confirmSwap')} body={t('equipment.swapConfirm')} onCancel={() => setPendingItemId(undefined)} onConfirm={() => { store.equip(uid, slot, pendingItemId); onDone() }} />}
    </Modal>
  )
}

function ConsumePotionDialog({ itemId, store, index, onClose }: { itemId: string; store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t, name } = useI18n()
  const item = index.items.get(itemId)
  const potionType = potionTypeForItem(itemId)
  const special = ['Intercession', 'PotionOfRejuvenation', 'PotionOfClumsiness'].includes(itemId)
  const evo = itemId === 'Evo23Vial' || itemId === 'Evo23Vial2'
  const [gemsFound, setGemsFound] = useState<number | null>(null)
  const [rareTraitUid, setRareTraitUid] = useState<number | null>(null)
  const [pendingRareTrait, setPendingRareTrait] = useState<string | null>(null)
  const [confirmSpecialUid, setConfirmSpecialUid] = useState<number | null>(null)
  const stack = state.inventory.find((entry) => entry.itemId === itemId)?.stack ?? 0
  const eligible = state.adventurers.filter((member) => evo
    ? true
    : special ? canConsumeSpecial(member, itemId)
    : potionType !== undefined && (member.potionsDrank[potionType] ?? 0) < potionLimit(member, index, potionType))
  if (itemId === 'Geode') {
    return (
      <Modal title={name(item?.name ?? itemId)} onClose={onClose}>
        <div className="consume-special">
          <img src={assetUrl(item?.imageKey)} alt="" />
          {gemsFound === null
            ? <><p>{name(item?.description ?? '')}</p><button disabled={stack < 1} onClick={async () => setGemsFound(await store.openGeodes())}>{t('potion.openAll')} · {stack}</button></>
            : <><h3>{t('potion.gemsFound', { count: gemsFound })}</h3><img className="consume-reward" src={assetUrl('gem')} alt="" /></>}
        </div>
      </Modal>
    )
  }
  const rareTraitMember = rareTraitUid === null ? undefined : state.adventurers.find((member) => member.uid === rareTraitUid)
  if (evo && rareTraitMember) {
    return (
      <Modal title={t('trait.changeTitle')} onClose={() => setRareTraitUid(null)}>
        <div className="rare-trait-current"><strong>{rareTraitMember.name}</strong><small>{t('trait.current')}: {rareTraitMember.rareTrait ? localizeRareTrait(language, rareTraitMember.rareTrait) : t('trait.none')}</small></div>
        <div className="rare-trait-list">
          {RARE_TRAITS.filter((trait) => trait !== rareTraitMember.rareTrait).map((trait) => (
            <button key={trait} onClick={() => setPendingRareTrait(trait)}>{localizeRareTrait(language, trait)}</button>
          ))}
        </div>
        {pendingRareTrait && <ActionConfirmation title={t('trait.changeTitle')} body={t('trait.confirm', { trait: localizeRareTrait(language, pendingRareTrait) })} onCancel={() => setPendingRareTrait(null)} onConfirm={() => { store.changeRareTrait(rareTraitMember.uid, pendingRareTrait, itemId); setPendingRareTrait(null); setRareTraitUid(null) }} />}
      </Modal>
    )
  }
  return (
    <Modal title={name(item?.name ?? itemId)} onClose={onClose}>
      <div className="potion-selected">
        <img src={assetUrl(item?.imageKey)} alt="" />
        <span><strong>{stack}</strong><small>{name(item?.description ?? '')}</small></span>
      </div>
      {eligible.length === 0 && <EmptyState text={t('potion.noEligible')} />}
      <div className="potion-adventurers">
        {eligible.map((member) => {
          const definition = index.adventurers.get(member.classId)
          const drank = potionType === undefined ? 0 : member.potionsDrank[potionType] ?? 0
          const limit = potionType === undefined ? 0 : potionLimit(member, index, potionType)
          return (
            <button key={member.uid} disabled={stack < 1} onClick={() => {
              if (evo) setRareTraitUid(member.uid)
              else if (special) setConfirmSpecialUid(member.uid)
              else store.consumePotion(member.uid, itemId)
            }}>
              <img src={assetUrl(definition?.imageKey)} alt="" />
              <span><strong>{member.name}</strong><small>{name(definition?.name ?? member.classId)} · {t('common.level')} {member.level}</small></span>
              <b>{special || evo ? '✓' : `${drank}/${limit}`}</b>
            </button>
          )
        })}
      </div>
      {confirmSpecialUid !== null && <ActionConfirmation title={name(item?.name ?? itemId)} body={t('potion.confirmSpecial', { name: state.adventurers.find((member) => member.uid === confirmSpecialUid)?.name ?? '' })} onCancel={() => setConfirmSpecialUid(null)} onConfirm={() => { store.consumeSpecial(confirmSpecialUid, itemId); setConfirmSpecialUid(null) }} />}
    </Modal>
  )
}

function RosterDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [dismissUid, setDismissUid] = useState<number | null>(null)
  const capacity = buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)
  return (
    <Modal title={t('roster.manage')} onClose={onClose}>
      <div className="roster-list">
        {state.adventurers.map((member, position) => {
          const definition = index.adventurers.get(member.classId)
          return (
            <article key={member.uid}>
              <img src={assetUrl(definition?.imageKey)} alt="" />
              <span><strong>{member.name}</strong><small>{name(definition?.name ?? member.classId)}</small></span>
              <div><button disabled={position === 0} onClick={() => store.moveAdventurer(member.uid, -1)}>↑</button><button disabled={position === state.adventurers.length - 1} onClick={() => store.moveAdventurer(member.uid, 1)}>↓</button></div>
              <button className="roster-dismiss" disabled={Boolean(member.areaId)} onClick={() => setDismissUid(member.uid)}>{t('roster.dismiss')}</button>
            </article>
          )
        })}
      </div>
      {state.dismissedAdventurers.length > 0 && <h3 className="roster-recall-title">{t('roster.recall')}</h3>}
      <div className="roster-list recalled">
        {state.dismissedAdventurers.map(({ member, dismissedAt }) => {
          const definition = index.adventurers.get(member.classId)
          const hours = Math.max(0, Math.ceil((86_400_000 - (Date.now() - dismissedAt)) / 3_600_000))
          return <article key={member.uid}><img src={assetUrl(definition?.imageKey)} alt="" /><span><strong>{member.name}</strong><small>{t('roster.expires', { hours })}</small></span><button disabled={state.adventurers.length >= capacity} onClick={() => store.recallAdventurer(member.uid)}>{t('roster.recallAction')}</button></article>
        })}
      </div>
      {dismissUid !== null && <ActionConfirmation title={t('roster.dismiss')} body={t('roster.dismissConfirm', { name: state.adventurers.find((member) => member.uid === dismissUid)?.name ?? '' })} onCancel={() => setDismissUid(null)} onConfirm={() => { store.dismissAdventurer(dismissUid); setDismissUid(null) }} />}
    </Modal>
  )
}

function FaqDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Modal title={t('drawer.faq')} onClose={onClose}>
      <div className="faq-list">
        {[1, 2, 3, 4, 5].map((id) => (
          <article key={id}>
            <button onClick={() => setOpen(open === id ? null : id)}><strong>{t(`faq.${id}.title`)}</strong><b>{open === id ? '−' : '+'}</b></button>
            {open === id && <p>{t(`faq.${id}.body`)}</p>}
          </article>
        ))}
      </div>
    </Modal>
  )
}

function MessagesDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t } = useI18n()
  const [selected, setSelected] = useState<number | null>(state.unreadMessages[0] ?? null)
  const messages = state.receivedMessages
    .map((id) => index.messages.get(id))
    .filter((message) => message !== undefined)
    .reverse()

  useEffect(() => {
    if (selected !== null && state.unreadMessages.includes(selected)) store.markMessageRead(selected)
  }, [selected, state.unreadMessages, store])

  const active = selected === null ? null : index.messages.get(selected)
  const localizedActive = active ? localizeKingMessage(language, active.id, active) : null
  return (
    <Modal title={t('messages.title')} onClose={onClose}>
      {active ? (
        <article className="king-letter">
          <button className="letter-back" onClick={() => setSelected(null)}>‹ {t('common.back')}</button>
          <h3>{localizedActive?.title}</h3>
          {localizedActive?.body.split('\n').map((paragraph, position) => paragraph
            ? <p key={position}>{paragraph}</p>
            : <br key={position} />)}
        </article>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <button className={state.unreadMessages.includes(message.id) ? 'unread' : ''} key={message.id} onClick={() => setSelected(message.id)}>
              <img src={assetUrl('king_message')} alt="" />
              <span><strong>{localizeKingMessage(language, message.id, message).title}</strong><small>{t('messages.from')}</small></span>
              <b>›</b>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

function BestiaryDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { language, t, name, description } = useI18n()
  const [raid, setRaid] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const enemy = selected ? index.enemies.get(selected) : undefined
  const areas = [...index.areas.values()].filter((area) => (
    state.unlockedAreas.includes(area.id) && (raid ? area.areaType !== 0 : area.areaType === 0)
  ))

  if (enemy && state.seenEnemies.includes(enemy.id)) {
    return (
      <Modal title={name(enemy.name)} onClose={() => setSelected(null)}>
        <article className="bestiary-detail">
          <img src={assetUrl(enemy.imageKey)} alt="" />
          <p>{description(enemy.id, enemy.description)}</p>
          <dl>
            <div><dt>HP</dt><dd>{enemy.fields.baseMaxHp}</dd></div>
            <div><dt>{t('bestiary.damage')}</dt><dd>{enemy.minDamage}–{enemy.maxDamage}</dd></div>
            <div><dt>{t('bestiary.defense')}</dt><dd>{enemy.fields.baseDefense}</dd></div>
            <div><dt>{t('bestiary.magicDefense')}</dt><dd>{enemy.fields.baseMagicDefense}</dd></div>
            <div><dt>DEX</dt><dd>{enemy.fields.baseDexterity}</dd></div>
            <div><dt>XP</dt><dd>{enemy.fields.expGiven}</dd></div>
          </dl>
          <section className="adventurer-skills"><article><small>{t('battle.active')}</small><strong>{enemy.fields.activeSkill && enemy.fields.activeSkill !== 'ACTIVE_NONE' ? localizeActiveSkill(language, enemy.fields.activeSkill) : t('adventurer.noSkill')}</strong></article><article><small>{t('battle.passive')}</small><strong>{enemy.fields.passiveSkill && enemy.fields.passiveSkill !== 'PASSIVE_NONE' ? localizePassiveSkill(language, enemy.fields.passiveSkill) : t('adventurer.noSkill')}</strong></article></section>
          {enemy.drops.length > 0 && <h3>{t('bestiary.drops')}</h3>}
          <div className="bestiary-drops">
            {enemy.drops.map((drop, position) => {
              const item = index.items.get(drop.item)
              return <span key={`${drop.item}-${position}`}><img src={assetUrl(item?.imageKey)} alt="" />{name(item?.name ?? drop.item)} ×{drop.stack}</span>
            })}
          </div>
        </article>
      </Modal>
    )
  }

  return (
    <Modal title={t('bestiary.title')} onClose={onClose} wide>
      <div className="bestiary-tabs">
        <button className={!raid ? 'active' : ''} onClick={() => setRaid(false)}>{t('screen.dungeons')}</button>
        <button className={raid ? 'active' : ''} onClick={() => setRaid(true)}>{t('screen.raids')}</button>
      </div>
      <div className="bestiary-areas">
        {areas.map((area) => {
          const enemyIds = [...new Set([...area.enemies, ...area.encounterRosters.flatMap((roster) => roster.enemies)])]
          return (
            <section key={area.id}>
              <h3>{name(area.name)}</h3>
              <div className="bestiary-grid">
                {enemyIds.map((enemyId) => {
                  const definition = index.enemies.get(enemyId)
                  const seen = state.seenEnemies.includes(enemyId)
                  return (
                    <button key={enemyId} disabled={!seen} onClick={() => setSelected(enemyId)} title={seen ? name(definition?.name ?? enemyId) : t('bestiary.unknown')}>
                      <img src={assetUrl(seen ? definition?.imageKey : 'unknown')} alt="" />
                      <small>{seen ? name(definition?.name ?? enemyId) : '???'}</small>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </Modal>
  )
}

function AccountDialog({ store, onClose }: { store: GameStore; onClose: () => void }) {
  const { t } = useI18n()
  const [status, setStatus] = useState(store.getCloudSyncStatus())
  const [working, setWorking] = useState(false)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const [pendingRestore, setPendingRestore] = useState<ReturnType<GameStore['pullCloudSave']> extends Promise<infer T> ? T : null>(null)

  useEffect(() => store.subscribeCloudSync(() => setStatus(store.getCloudSyncStatus())), [store])

  const sync = async () => {
    setWorking(true)
    await store.syncNow()
    setWorking(false)
  }
  const restore = async () => {
    const remote = status.kind === 'conflict' ? status.remote : await store.pullCloudSave()
    if (remote) setPendingRestore(remote)
  }

  const exportBackup = () => {
    const blob = new Blob([store.exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `guild-master-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setBackupMessage(t('account.exported'))
  }

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const result = store.importSave(await file.text())
    setBackupMessage(result.ok ? t('account.imported') : result.message)
    event.target.value = ''
  }

  const detail = status.kind === 'signed-out' ? t('account.signedOut')
    : status.kind === 'syncing' ? t('account.syncing')
      : status.kind === 'offline' ? t('account.offline')
        : status.kind === 'conflict' ? t('account.conflict')
          : status.kind === 'error' ? `${t('account.error')}: ${status.message}`
            : status.kind === 'disabled' ? t('account.disabled')
              : t('account.synced', { revision: status.revision })
  const user = store.getCloudUser()

  return (
    <Modal title={t('account.title')} onClose={onClose}>
      <p className="dialog-intro">{t('account.intro')}</p>
      <section className="account-sync">
        <strong>{user?.email ?? t('account.guest')}</strong>
        <p>{detail}</p>
      </section>
      <div className="account-actions">
        <button className="secondary-button" onClick={exportBackup}>{t('account.export')}</button>
        <button className="secondary-button" onClick={() => importRef.current?.click()}>{t('account.import')}</button>
        <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event)} />
      </div>
      {backupMessage && <p className="account-backup-message" role="status">{backupMessage}</p>}
      {status.kind !== 'disabled' && <div className="account-actions">
        {!user && <button className="primary-button" disabled={working} onClick={() => void store.signInWithGoogle()}>{t('account.signIn')}</button>}
        {user && <>
          <button className="primary-button" disabled={working || status.kind === 'syncing'} onClick={() => void sync()}>{t('account.sync')}</button>
          <button className="secondary-button" disabled={working || status.kind === 'syncing'} onClick={() => void restore()}>{t('account.restore')}</button>
          <button className="danger-button" disabled={working} onClick={() => void store.signOut()}>{t('account.signOut')}</button>
        </>}
      </div>}
      {pendingRestore && <ActionConfirmation title={t('account.restore')} body={t('account.restoreConfirm')} onCancel={() => setPendingRestore(null)} onConfirm={() => { store.replaceWithCloudSave(pendingRestore); setPendingRestore(null) }} />}
    </Modal>
  )
}

function AchievementsDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t } = useI18n()
  const achievements = achievementProgress(state, index)
  return <Modal title={t('drawer.achievements')} onClose={onClose}>
    <p className="achievement-intro">{t('achievement.intro')} {state.unlockedAchievements.length}/{achievements.length}</p>
    <section className="achievement-list">{achievements.map((achievement) => {
      return <article className={achievement.unlocked ? 'complete' : ''} key={achievement.id}><span>{achievement.unlocked ? '★' : '☆'}</span><div><strong>{achievement.title}</strong><small>{achievement.description} · {achievement.points.toLocaleString()} XP</small><ProgressBar value={achievement.value} max={achievement.target} label={`${achievement.value.toLocaleString()}/${achievement.target.toLocaleString()}`} /></div></article>
    })}</section>
    <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

function AppShell({ content, index, store }: AppProps) {
  const state = useGame(store)
  const { t } = useI18n()
  const [screen, setScreen] = useState<ScreenId>('headquarters')
  const [drawer, setDrawer] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [idleProgress, setIdleProgress] = useState(() => store.getOfflineProgressSeconds())
  const pendingAchievementId = state.pendingAchievementNotifications[0]
  const pendingAchievement = ACHIEVEMENTS.find((achievement) => achievement.id === pendingAchievementId)

  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  useEffect(() => {
    if (dialog === null && state.unreadMessages.length > 0) setDialog({ type: 'messages' })
  }, [dialog, state.unreadMessages])

  useEffect(() => {
    if (state.unreadMessages.length === 0 && idleProgress > 5) return
    if (state.unreadMessages.length > 0) setIdleProgress(0)
  }, [idleProgress, state.unreadMessages])

  useEffect(() => {
    if (!pendingAchievementId) return
    const timer = window.setTimeout(() => store.acknowledgeAchievementNotifications(), 4_000)
    return () => window.clearTimeout(timer)
  }, [pendingAchievementId, store])

  const nav = [
    ['headquarters', 'bottom_nav_castle'],
    ['adventurers', 'bottom_nav_adventurers'],
    ['dungeons', 'bottom_nav_dungeons'],
    ['raids', 'bottom_nav_raids'],
  ] as const

  const openArea = (areaId: string) => {
    const run = state.runs[areaId]
    const area = index.areas.get(areaId)
    if (run && !run.finished && run.partyIds.length > 0) {
      setDialog({ type: 'area', areaId })
    } else if (area?.areaType !== 0 && !raidTryAvailable(state, areaId)) {
      setDialog({ type: 'refillRaid', areaId })
    } else {
      setDialog({ type: 'send', areaId })
    }
  }

  const handleShellClick = (event: MouseEvent) => {
    const button = (event.target as HTMLElement).closest('button')
    const icon = button?.querySelector('img')?.src ?? ''
    const label = button?.textContent ?? ''
    if (icon.includes('drawer_icon_king_message') || label.includes(t('drawer.messages'))) {
      setDrawer(false)
      setDialog({ type: 'messages' })
    } else if (icon.includes('drawer_icon_bestiary') || label.includes(t('drawer.bestiary'))) {
      setDrawer(false)
      setDialog({ type: 'bestiary' })
    } else if (icon.includes('drawer_icon_faq') || label.includes(t('drawer.faq'))) {
      setDrawer(false)
      setDialog({ type: 'faq' })
    }
  }

  return (
    <div className={`game-shell ${state.settings.colorblindMode ? 'colorblind-mode' : ''}`} onClick={handleShellClick}>
      <header className="top-bar">
        <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setDrawer(true)}>☰</button>
        <h1>{t(`screen.${screen}`)}</h1>
        <Currency amount={state.gems} icon="gem" label={t('currency.gems')} />
      </header>
      <div className="money-strip"><Currency amount={state.money} icon="coin_copper" label={t('currency.coins')} /></div>
      {state.tutorialStep <= 7 && (
        <section className="tutorial-strip">
          <img src={assetUrl('tutorial_icon')} alt="" />
          <div><strong>{t('tutorial.title')} <em>{state.tutorialStep}/7</em></strong><p>{t(`tutorial.${state.tutorialStep}`)}</p></div>
        </section>
      )}
      <div className="tools-strip">
        <ToolButton icon="shop" label={t('tool.shop')} onClick={() => setDialog({ type: 'shop' })} />
        <div className="tool-with-badge">
          <ToolButton icon="king_message" label={t('tool.messages')} onClick={() => setDialog({ type: 'messages' })} />
          {state.unreadMessages.length > 0 && <b>{state.unreadMessages.length}</b>}
        </div>
        <ToolButton icon="merchant" label={t('tool.merchant')} onClick={() => setDialog({ type: 'merchant' })} />
        <ToolButton icon="quest_marker" label={t('tool.quests')} disabled={state.adventurers.length === 0} onClick={() => setDialog({ type: 'quests' })} />
        <ToolButton icon="gem" label={t('redeem.comingSoon')} disabled />
      </div>

      <main className="game-content">
        {screen === 'headquarters' && <Headquarters onOpen={(id) => setDialog({ type: 'building', id })} tavernCount={state.tavernGuests.length} tavernCapacity={buildingCapacity('tavern', state.buildings.tavernCapacity, state.permanentUpgrades.UpgradeTavernCapacity ?? 0, state.purchasedPacks)} />}
        {screen === 'adventurers' && <AdventurersView store={store} index={index} onOpen={(uid) => setDialog({ type: 'adventurer', uid })} onManage={() => setDialog({ type: 'roster' })} />}
        {screen === 'dungeons' && <AreasView store={store} index={index} content={content} raid={false} onOpen={openArea} />}
        {screen === 'raids' && <AreasView store={store} index={index} content={content} raid onOpen={openArea} />}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {nav.map(([id, icon]) => (
          <button key={id} className={screen === id ? 'active' : ''} aria-current={screen === id ? 'page' : undefined} onClick={() => setScreen(id)}>
            <img src={assetUrl(icon)} alt="" /><span>{t(`screen.${id}`)}</span>
          </button>
        ))}
      </nav>

      {pendingAchievement && <aside className="achievement-toast" role="status" aria-live="polite"><span>★</span><div><strong>{t('drawer.achievements')}</strong><small>{pendingAchievement.title}</small></div></aside>}

      {drawer && <div className="drawer-backdrop" onMouseDown={() => setDrawer(false)}><aside className="drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-title">Guild Master</div><button onClick={() => { setDrawer(false); setDialog({ type: 'settings' }) }}>⚙ {t('drawer.settings')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'roster' }) }}>⌁ {t('drawer.recall')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'messages' }) }}><img src={assetUrl('drawer_icon_king_message')} alt="" />{t('drawer.messages')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'faq' }) }}><img src={assetUrl('drawer_icon_faq')} alt="" />{t('drawer.faq')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'bestiary' }) }}><img src={assetUrl('drawer_icon_bestiary')} alt="" />{t('drawer.bestiary')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'account' }) }}><span className="drawer-cloud">☁</span>{t('drawer.account')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'achievements' }) }}><img src={assetUrl('drawer_icon_achievements')} alt="" />{t('drawer.achievements')}</button><a className="drawer-link" href="https://www.reddit.com/r/IdleGuildmaster/" target="_blank" rel="noreferrer">Reddit</a><a className="drawer-link" href="https://cafe.naver.com/idleguildmaster" target="_blank" rel="noreferrer">Cafe Naver</a><div className="drawer-language"><span>{t('drawer.language')}</span><div><button className={state.language === 'en' ? 'active' : ''} onClick={() => store.setLanguage('en')}>English</button><button className={state.language === 'vi' ? 'active' : ''} onClick={() => store.setLanguage('vi')}>Tiếng Việt</button></div></div><div className="drawer-spacer" /><button className="reset-button" onClick={() => { setDrawer(false); setDialog({ type: 'reset' }) }}>{t('drawer.newGuild')}</button></aside></div>}

      {dialog?.type === 'building' && <BuildingDialog id={dialog.id} store={store} index={index} onClose={() => setDialog(null)} onConsume={(itemId) => setDialog({ type: 'potion', itemId })} onOpenMarket={(itemId) => setDialog({ type: 'market', itemId })} />}
      {dialog?.type === 'market' && <MarketDialog store={store} index={index} initialSellingItemId={dialog.itemId} onClose={() => setDialog(null)} />}
      {dialog?.type === 'send' && <SendTeamDialog areaId={dialog.areaId} store={store} index={index} onClose={() => setDialog(null)} onSent={() => state.settings.autoOpenDungeonDetail ? setDialog({ type: 'area', areaId: dialog.areaId }) : setDialog(null)} />}
      {dialog?.type === 'refillRaid' && <RefillRaidDialog areaId={dialog.areaId} store={store} index={index} onClose={() => setDialog(null)} onBought={() => setDialog({ type: 'send', areaId: dialog.areaId })} />}
      {dialog?.type === 'area' && <AreaDialog areaId={dialog.areaId} store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'adventurer' && <AdventurerDialog uid={dialog.uid} store={store} index={index} onClose={() => setDialog(null)} onSelectEquipment={(slot) => setDialog({ type: 'equipment', uid: dialog.uid, slot })} />}
      {dialog?.type === 'equipment' && <SelectEquipmentDialog uid={dialog.uid} slot={dialog.slot} store={store} index={index} onDone={() => setDialog({ type: 'adventurer', uid: dialog.uid })} />}
      {dialog?.type === 'merchant' && <MerchantDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'quests' && <QuestsDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'messages' && <MessagesDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'bestiary' && <BestiaryDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'potion' && <ConsumePotionDialog itemId={dialog.itemId} store={store} index={index} onClose={() => setDialog({ type: 'building', id: 'storage' })} />}
      {dialog?.type === 'roster' && <RosterDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'faq' && <FaqDialog onClose={() => setDialog(null)} />}
      {dialog?.type === 'account' && <AccountDialog store={store} onClose={() => setDialog(null)} />}
      {dialog?.type === 'settings' && <SettingsDialog store={store} onClose={() => setDialog(null)} />}
      {dialog?.type === 'achievements' && <AchievementsDialog store={store} index={index} onClose={() => setDialog(null)} />}
      {dialog?.type === 'shop' && <ShopDialog store={store} onClose={() => setDialog(null)} />}
      {dialog?.type === 'reset' && <ActionConfirmation title={t('drawer.newGuild')} body={t('drawer.resetConfirm')} onCancel={() => setDialog(null)} onConfirm={() => { store.reset(); setDialog(null) }} />}
      {idleProgress > 5 && dialog === null && <IdleProgressDialog seconds={idleProgress} onClose={() => setIdleProgress(0)} />}
    </div>
  )
}

export default function App(props: AppProps) {
  const state = useGame(props.store)
  return <I18nProvider language={state.language}><AppShell {...props} /></I18nProvider>
}
