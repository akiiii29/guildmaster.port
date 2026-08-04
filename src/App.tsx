import { useEffect, useRef, useState, type MouseEvent } from 'react'
import './App.css'
import type { ContentIndex } from './game/content'
import { assetUrl } from './game/content'
import type { AdventurerDefinition, AdventurerState, AreaDefinition, AreaRun, EnemyDefinition, EnemyState, EquipmentSlot, GameContent, ItemDefinition, PetDefinition, PetState, ScreenId, StatusEffectState } from './game/types'
import { buildingCapacity, experienceToNextLevel, marketListingsCapacity, marketListingsPrice, marketSaleSeconds, marketTimePrice, petFoodToNextLevel, quartersPrice, shelterAutofeedPrice, shelterCapacity, shelterPrice, storagePrice, tavernCapacityPrice, tavernTimePrice, tavernVisitorIntervalSeconds, workshopCraftSeconds, workshopQueueCapacity, workshopQueuePrice, workshopTimePrice } from './game/formulas'
import { GameStore, useGame } from './game/store'
import { I18nProvider, useI18n } from './game/i18n'
import { inventoryCount, maxCraftable, RECIPES } from './game/recipes'
import { adventurerStats, defaultWeaponId, equipmentDifference, equipmentItemId, itemMatchesSlot } from './game/stats'
import { activeSkillLabel } from './game/combatSkills'
import { Modal } from './components/Modal'
import { ProgressBar } from './components/ProgressBar'
import { areaTeamSize, canConsumeSpecial, completedEpicRaid, epicRaidProgressTarget, potionLimit, potionTypeForItem, promotionChoices, questRefreshPrice, raidTryAvailable, raidTryCost, RARE_TRAITS, statusIconKey } from './game/engine'
import { DOCTRINE_ABILITIES, DOCTRINES, doctrineIds, doctrinePointsAvailable } from './game/doctrines'

interface AppProps {
  content: GameContent
  index: ContentIndex
  store: GameStore
}

type DialogState =
  | { type: 'building'; id: string }
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
  | null

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

function WorkshopDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [showRecipes, setShowRecipes] = useState(false)
  const [craftingRecipeId, setCraftingRecipeId] = useState<string | null>(null)
  const [craftAmount, setCraftAmount] = useState(1)
  const [upgrade, setUpgrade] = useState<'queue' | 'time' | null>(null)
  const capacity = workshopQueueCapacity(state.buildings.workshopQueue, state.permanentUpgrades.UpgradeWorkshopQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)
  const visibleRecipes = state.tutorialStep === 3
    ? RECIPES.filter((recipe) => recipe.id === 'Leather')
    : RECIPES
  const jobs = [...state.completedWorkshopItems, ...state.workshopQueue]
  const queueFull = jobs.length >= capacity
  const craftingRecipe = craftingRecipeId ? RECIPES.find((recipe) => recipe.id === craftingRecipeId) : undefined
  const maxCraftAmount = craftingRecipe ? maxCraftable(state, craftingRecipe) : 1
  const amount = Math.max(1, Math.min(craftAmount, maxCraftAmount))
  const craftingResult = craftingRecipe && index.items.get(craftingRecipe.result.itemId)
  const craftingTime = craftingRecipe && craftingResult
    ? state.tutorialStep === 3 && craftingRecipe.id === 'Leather' ? 10 : state.tutorialStep === 4 && craftingRecipe.id === 'CopperArmor' ? 20 : workshopCraftSeconds(Number(craftingResult.fields.price ?? 1), craftingRecipe.result.stack * amount, state.buildings.workshopTime, state.permanentUpgrades.UpgradeWorkshopTime ?? 0, state.purchasedPacks.merchant)
    : 0

  return (
    <Modal title={t('building.workshop')} onClose={onClose} wide>
      <div className="workshop-summary">
        <strong>{t('workshop.queue', { used: jobs.length, max: capacity })}</strong>
        <span>{t('workshop.speed', { speed: (1 / (0.9 ** (state.buildings.workshopTime + (state.permanentUpgrades.UpgradeWorkshopTime ?? 0)))).toFixed(2) })}</span>
      </div>
      {state.purchasedPacks.merchant && <div className="market-pack-bonuses"><span>{t('workshop.merchantPackBonus')}</span></div>}
      <div className="tavern-upgrades">
        {state.buildings.workshopQueue < 10 && <button disabled={state.money < workshopQueuePrice(state.buildings.workshopQueue)} onClick={() => setUpgrade('queue')}><strong>{t('workshop.upgradeQueue')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{workshopQueuePrice(state.buildings.workshopQueue).toLocaleString()}</span></button>}
        {state.buildings.workshopTime < 25 && <button disabled={state.money < workshopTimePrice(state.buildings.workshopTime)} onClick={() => setUpgrade('time')}><strong>{t('workshop.upgradeTime')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{workshopTimePrice(state.buildings.workshopTime).toLocaleString()}</span></button>}
      </div>
      {jobs.length === 0 && <EmptyState text={t('workshop.empty')} />}
      <div className="workshop-list">
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
            </section> : <div className="recipe-list">
              {visibleRecipes.map((recipe) => {
                const result = index.items.get(recipe.result.itemId)
                const craftable = maxCraftable(state, recipe)
                return (
                  <article className="recipe-card" key={recipe.id}>
                    <span className="recipe-result"><img src={assetUrl(result?.imageKey)} alt="" /><b>{name(result?.name ?? recipe.result.itemId)}</b></span>
                    <span className="recipe-arrow">←</span>
                    <span className="recipe-ingredients">
                      {recipe.ingredients.map((ingredient) => {
                        const item = index.items.get(ingredient.itemId)
                        const owned = inventoryCount(state, ingredient.itemId)
                        return <i className={owned < ingredient.stack ? 'missing' : ''} key={ingredient.itemId}><img src={assetUrl(item?.imageKey)} alt="" /><b>{ingredient.stack}</b><small>{owned}</small></i>
                      })}
                    </span>
                    <span className="recipe-meta">{t('workshop.available', { count: craftable })}</span>
                    <button disabled={craftable < 1 || queueFull} onClick={() => { setCraftingRecipeId(recipe.id); setCraftAmount(1) }}>{t('workshop.craft')}</button>
                  </article>
                )
              })}
            </div>}
            {!craftingRecipe && <button className="recipes-close" onClick={() => setShowRecipes(false)}>{t('common.close')}</button>}
          </section>
        </div>
      )}
      {upgrade && <UpgradeConfirmation target={t(upgrade === 'queue' ? 'workshop.upgradeQueue' : 'workshop.upgradeTime')} cost={upgrade === 'queue' ? workshopQueuePrice(state.buildings.workshopQueue) : workshopTimePrice(state.buildings.workshopTime)} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeFacility(upgrade === 'queue' ? 'workshopQueue' : 'workshopTime'); setUpgrade(null) }} />}
    </Modal>
  )
}

function TavernLockIcon({ locked }: { locked: boolean }) {
  const path = locked
    ? 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z'
    : 'M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z'
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>
}

function TavernDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
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
              <button disabled={state.money < capacityCost} onClick={() => setUpgrade('capacity')}>
                <strong>{t('tavern.upgradeCapacity')}</strong>
                <span><img src={assetUrl('coin_copper')} alt="" />{capacityCost.toLocaleString()}</span>
              </button>
            )}
            {state.buildings.tavernTime < 20 && (
              <button disabled={state.money < timeCost} onClick={() => setUpgrade('time')}>
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
              const traits = [guest.trait, guest.rareTrait].filter(Boolean).map((trait) => name(String(trait)).replaceAll('_', ' ')).join(' · ')
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
        {detailsGuest && detailsDefinition && detailsStats && <div className="confirm-layer"><div className="confirm-box tavern-guest-detail"><div className="entity-detail"><div className="portrait-frame large"><img src={assetUrl(detailsDefinition.imageKey)} alt="" /></div><div><h3>{name(detailsDefinition.name)}</h3><p>{description(detailsDefinition.id, detailsDefinition.description)}</p></div></div><div className="stat-grid"><span>CON <b>{detailsStats.constitution}</b></span><span>INT <b>{detailsStats.intelligence}</b></span><span>DEX <b>{detailsStats.dexterity}</b></span><span>HP <b>{detailsStats.maxHp}</b></span><span>DEF <b>{detailsStats.defense}</b></span><span>MDEF <b>{detailsStats.magicDefense}</b></span></div><div className="tavern-detail-actions"><button onClick={() => setSelectedGuest(null)}>{t('common.close')}</button></div></div></div>}
        {upgrade && <UpgradeConfirmation target={t(upgrade === 'capacity' ? 'tavern.upgradeCapacity' : 'tavern.upgradeTime')} cost={upgrade === 'capacity' ? capacityCost : timeCost} onCancel={() => setUpgrade(null)} onConfirm={() => { store.upgradeTavern(upgrade); setUpgrade(null) }} />}
      </section>
    </Modal>
  )
}

function MarketDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [sellingItemId, setSellingItemId] = useState<string | null>(null)
  const [sellingAmount, setSellingAmount] = useState(1)
  const capacity = marketListingsCapacity(state.buildings.marketListings, state.permanentUpgrades.UpgradeMarketQueue ?? 0, state.purchasedPacks.starter, state.purchasedPacks.merchant)
  const listingCost = marketListingsPrice(state.buildings.marketListings)
  const timeCost = marketTimePrice(state.buildings.marketTime)
  const jobs = [...state.soldMarketItems.map((job) => ({ ...job, sold: true })), ...state.marketListings.map((job) => ({ ...job, sold: false }))]
  const sellingStack = state.inventory.find((stack) => stack.itemId === sellingItemId)
  const sellingItem = sellingStack && index.items.get(sellingStack.itemId)
  const maxSellingAmount = sellingStack?.stack ?? 1
  const amount = Math.max(1, Math.min(sellingAmount, maxSellingAmount))
  const sellingPrice = Number(sellingItem?.fields.price ?? 0) * amount
  const sellingTime = marketSaleSeconds(Number(sellingItem?.fields.price ?? 0), amount, state.buildings.marketTime, state.permanentUpgrades.UpgradeMarketTime ?? 0, state.purchasedPacks.merchant)
  const openSale = (itemId: string) => {
    setSellingItemId(itemId)
    setSellingAmount(1)
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
        {state.buildings.marketListings < 10 && <button disabled={state.money < listingCost} onClick={() => store.upgradeMarket('listings')}><strong>{t('market.upgradeListings')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{listingCost.toLocaleString()}</span></button>}
        {state.buildings.marketTime < 25 && <button disabled={state.money < timeCost} onClick={() => store.upgradeMarket('time')}><strong>{t('market.upgradeTime')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{timeCost.toLocaleString()}</span></button>}
      </div>
      {jobs.length === 0 && <EmptyState text={t('market.empty')} />}
      <div className="workshop-list">{jobs.map((job) => {
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
    </Modal>
  )
}

function MerchantDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const [selectedOfferUid, setSelectedOfferUid] = useState<number | null>(null)
  useEffect(() => {
    if (state.nextMerchantOfferId === 1) store.refreshMerchant()
  }, [state.nextMerchantOfferId, store])
  const section = (title: string, offers: typeof state.merchantRegularStock) => <section className="merchant-section"><h3>{title}</h3>{offers.length === 0 ? <EmptyState text={t('merchant.empty')} /> : <div className="item-grid">{offers.map((offer) => {
    const item = index.items.get(offer.itemId)
    const affordable = offer.gems ? state.gems >= offer.price : state.money >= offer.price
    return <button className="item-slot merchant-offer" disabled={!affordable} key={offer.uid} onClick={() => setSelectedOfferUid(offer.uid)}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{offer.stack}</strong><span>{name(item?.name ?? offer.itemId)}</span><small><img src={assetUrl(offer.gems ? 'gem' : 'coin_copper')} alt="" />{offer.price}</small></button>
  })}</div>}</section>
  const selectedOffer = [...state.merchantRegularStock, ...state.merchantSpecialStock].find((offer) => offer.uid === selectedOfferUid)
  const selectedItem = selectedOffer && index.items.get(selectedOffer.itemId)
  return <Modal title={t('tool.merchant')} onClose={onClose} wide>{section(t('merchant.regular'), state.merchantRegularStock)}{section(t('merchant.special'), state.merchantSpecialStock)}<div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>{selectedOffer && selectedItem && <div className="confirm-layer"><section className="confirm-box merchant-confirm"><img src={assetUrl(selectedItem.imageKey)} alt="" /><div><h3>{name(selectedItem.name)}</h3><p>{t('merchant.buyConfirm', { count: selectedOffer.stack, item: name(selectedItem.name), price: selectedOffer.price })}</p></div><div><button onClick={() => setSelectedOfferUid(null)}>{t('common.cancel')}</button><button onClick={() => { store.buyMerchant(selectedOffer.uid); setSelectedOfferUid(null) }}><img src={assetUrl(selectedOffer.gems ? 'gem' : 'coin_copper')} alt="" />{selectedOffer.price}</button></div></section></div>}</Modal>
}

function QuestsDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t } = useI18n()
  const categories = ['King', ...doctrineIds] as const
  const rarityReward = (rarity: number, king: boolean) => king
    ? rarity === 1 ? 10 : rarity === 2 ? 20 : rarity === 3 ? 40 : 100
    : rarity === 4 ? 5 : rarity
  const refreshPrice = questRefreshPrice(state)
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
        return <article className={`quest-card rarity-${quest.rarity} ${complete ? 'complete' : ''}`} key={quest.id}><div><strong>{definition?.name ?? quest.id}</strong><p>{(definition?.description ?? '').replace(/%1?\$?d/, String(quest.target))}</p><ProgressBar value={quest.progress} max={quest.target} label={`${quest.progress}/${quest.target}`} /></div><button disabled={!complete} onClick={() => store.claimQuest(quest.id)}><span>{category === 'King' ? '♦' : '★'}</span><b>{rarityReward(quest.rarity, category === 'King')}</b></button></article>
      })}</section>
    })}
    <div className="workshop-actions"><button disabled={state.adventurers.length === 0 || state.questsRefreshed || state.gems < refreshPrice} onClick={() => store.refreshQuests()}>{t('quests.refresh')} · ♦{refreshPrice}</button><button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

function ShelterDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
  const [mergeSource, setMergeSource] = useState<number | null>(null)
  const [selectedPetUid, setSelectedPetUid] = useState<number | null>(null)
  const [feedAll, setFeedAll] = useState(false)
  const capacity = shelterCapacity(state.buildings.shelter, state.permanentUpgrades.UpgradeShelter ?? 0)
  const capacityCost = shelterPrice(state.buildings.shelter)
  const autofeedCost = shelterAutofeedPrice(state.buildings.shelterAutofeed)
  const eggs = state.inventory.filter((stack) => index.items.get(stack.itemId)?.type === 'Egg')
  const foods = state.inventory.filter((stack) => Number(index.items.get(stack.itemId)?.fields.feedPower ?? 0) > 0)
  const pets = [...state.pets].sort((left, right) => Number(right.favourite) - Number(left.favourite) || right.level - left.level || left.uid - right.uid)
  const selectedPet = state.pets.find((pet) => pet.uid === selectedPetUid)
  const selectedDefinition = selectedPet && index.pets.get(selectedPet.petId)
  const releaseSelectedPet = () => {
    if (selectedPet && store.releasePet(selectedPet.uid)) {
      setSelectedPetUid(null)
      if (mergeSource === selectedPet.uid) setMergeSource(null)
    }
  }
  return <Modal title={t('building.shelter')} onClose={onClose} wide>
    <div className="workshop-summary"><strong>{t('shelter.capacity', { used: state.pets.length, max: capacity })}</strong></div>
    <div className="tavern-upgrades">
      {state.buildings.shelter < 11 && <button disabled={state.money < capacityCost} onClick={() => store.upgradeShelter('capacity')}><strong>{t('shelter.upgradeCapacity')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{capacityCost.toLocaleString()}</span></button>}
      {state.buildings.shelterAutofeed < 1 && <button disabled={state.money < autofeedCost} onClick={() => store.upgradeShelter('autofeed')}><strong>{t('shelter.unlockAutofeed')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{autofeedCost.toLocaleString()}</span></button>}
    </div>
    {eggs.length > 0 && <section className="shelter-eggs"><h3>{t('shelter.eggs')}</h3><div className="item-grid">{eggs.map((stack) => {
      const item = index.items.get(stack.itemId)
      return <button className="item-slot" disabled={state.pets.length >= capacity} key={stack.itemId} onClick={() => store.hatchPet(stack.itemId)}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span></button>
    })}</div></section>}
    {state.pets.length === 0 ? <EmptyState text={t('shelter.empty')} /> : <div className="pet-list">{pets.map((pet) => {
      const definition = index.pets.get(pet.petId)
      const required = petFoodToNextLevel(pet.level)
      return <article className="pet-card" key={pet.uid}><img src={assetUrl(definition?.imageKey)} alt="" /><div><strong>{name(definition?.name ?? pet.petId)} · {t('common.level')} {pet.level}</strong><small>{pet.abilities.filter((ability) => ability !== 'EMPTY').join(' · ')}</small><ProgressBar value={pet.food} max={required} label={`${pet.food}/${required}`} /></div><div className="pet-actions">{state.buildings.shelterAutofeed > 0 && <button className={pet.favourite ? 'selected' : ''} title={t('shelter.favourite')} onClick={() => store.togglePetFavourite(pet.uid)}>{pet.favourite ? '★' : '☆'}</button>}{foods.map((stack) => <button key={stack.itemId} title={name(index.items.get(stack.itemId)?.name ?? stack.itemId)} onClick={() => store.feedPet(pet.uid, stack.itemId, 1)}><img src={assetUrl(index.items.get(stack.itemId)?.imageKey)} alt="" /></button>)}<button onClick={() => setMergeSource(mergeSource === pet.uid ? null : pet.uid)}>{mergeSource === pet.uid ? '✓' : '⇄'}</button>{mergeSource !== null && mergeSource !== pet.uid && <button onClick={() => { store.mergePet(mergeSource, pet.uid); setMergeSource(null) }}>{t('shelter.mergeHere')}</button>}</div></article>
    })}</div>}
    {state.pets.length > 0 && <div className="pet-detail-selector">{pets.map((pet) => <button className={selectedPetUid === pet.uid ? 'selected' : ''} key={pet.uid} onClick={() => setSelectedPetUid(pet.uid)}>{t('shelter.viewPet', { pet: name(index.pets.get(pet.petId)?.name ?? pet.petId) })}</button>)}</div>}
    {foods.length > 0 && <button className={`shelter-feed-mode ${feedAll ? 'selected' : ''}`} onClick={() => setFeedAll(!feedAll)}>{feedAll ? t('shelter.feedAll') : t('shelter.feedOne')}</button>}
    {selectedPet && selectedDefinition && <div className="confirm-layer"><section className="confirm-box pet-detail"><img src={assetUrl(selectedDefinition.imageKey)} alt="" /><div><h3>{name(selectedDefinition.name)} · {t('common.level')} {selectedPet.level}</h3><p>{description(selectedDefinition.id, selectedDefinition.description)}</p><ProgressBar value={selectedPet.food} max={petFoodToNextLevel(selectedPet.level)} label={`${selectedPet.food}/${petFoodToNextLevel(selectedPet.level)}`} /><h4>{t('shelter.abilities')}</h4><ul>{selectedPet.abilities.map((ability, abilityIndex) => <li className={ability === 'EMPTY' ? 'locked' : ''} key={`${ability}-${abilityIndex}`}>{ability === 'EMPTY' ? t('shelter.unlockAbility', { level: [21, 41, 61][abilityIndex - 1] ?? 1 }) : name(ability)}</li>)}</ul></div><div className="pet-detail-actions">{state.buildings.shelterAutofeed > 0 && <button className={selectedPet.favourite ? 'selected' : ''} onClick={() => store.togglePetFavourite(selectedPet.uid)}>{selectedPet.favourite ? t('shelter.unfavourite') : t('shelter.favourite')}</button>}{foods.map((stack) => <button key={stack.itemId} onClick={() => store.feedPet(selectedPet.uid, stack.itemId, feedAll ? stack.stack : 1)}><img src={assetUrl(index.items.get(stack.itemId)?.imageKey)} alt="" />{feedAll ? stack.stack : 1}</button>)}{selectedPet.level <= 1 && selectedPet.food === 0 && <button onClick={releaseSelectedPet}>{t('shelter.setFree')}</button>}<button onClick={() => setSelectedPetUid(null)}>{t('common.close')}</button></div></section></div>}
    <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
  </Modal>
}

function StorageDialog({ store, index, onClose, onConsume }: { store: GameStore; index: ContentIndex; onClose: () => void; onConsume: (itemId: string) => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
  const [filter, setFilter] = useState<'all' | 'materials' | 'weapons' | 'armors' | 'accessories' | 'consumables'>('all')
  const [sort, setSort] = useState<'type' | 'quantity' | 'alphabetical' | 'priceUnit' | 'priceTotal'>('type')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
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
    {state.buildings.storage < 80 && <div className="tavern-upgrades storage-upgrades"><button disabled={state.money < price} onClick={() => store.upgradeFacility('storage')}><strong>{t('storage.upgrade')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{price.toLocaleString()}</span></button></div>}
    {items.length === 0 && <EmptyState text={t('storage.empty')} />}
    <div className="item-grid">{items.map((stack) => {
      const item = index.items.get(stack.itemId)
      return <button className="item-slot" onClick={() => setSelectedItemId(stack.itemId)} key={stack.itemId}><img src={assetUrl(item?.imageKey)} alt="" /><strong>{stack.stack}</strong><span>{name(item?.name ?? stack.itemId)}</span></button>
    })}</div>
    {selectedStack && selected && <div className="confirm-layer"><section className="confirm-box item-detail"><img src={assetUrl(selected.imageKey)} alt="" /><div><h3>{name(selected.name)}</h3><p>{description(selected.id, selected.description)}</p><small>{t('storage.stack', { count: selectedStack.stack })} · {t('storage.value', { value: Number(selected.fields.price ?? 0) })}</small></div><div>{selected.type === 'Egg' && <button onClick={() => { store.hatchPet(selected.id); setSelectedItemId(null) }}>{t('storage.hatch')}</button>}{canUse && <button onClick={() => { onConsume(selected.id); setSelectedItemId(null) }}>{t('storage.use')}</button>}<button onClick={() => setSelectedItemId(null)}>{t('common.close')}</button></div></section></div>}
  </Modal>
}

function BuildingDialog({ id, store, index, onClose, onConsume }: { id: string; store: GameStore; index: ContentIndex; onClose: () => void; onConsume: (itemId: string) => void }) {
  const state = useGame(store)
  const { t } = useI18n()
  const [confirmQuarters, setConfirmQuarters] = useState(false)
  const title = t(`building.${id}`)
  if (id === 'workshop') return <WorkshopDialog store={store} index={index} onClose={onClose} />
  if (id === 'tavern') return <TavernDialog store={store} index={index} onClose={onClose} />
  if (id === 'market') return <MarketDialog store={store} index={index} onClose={onClose} />
  if (id === 'shelter') return <ShelterDialog store={store} index={index} onClose={onClose} />
  if (id === 'storage') return <StorageDialog store={store} index={index} onClose={onClose} onConsume={onConsume} />
  if (id === 'quarters') {
    const capacity = buildingCapacity('quarters', state.buildings.quarters, state.permanentUpgrades.UpgradeQuarters ?? 0, state.purchasedPacks)
    const price = quartersPrice(state.buildings.quarters)
    return <Modal title={t('building.quarters')} onClose={onClose}>
      <div className="building-detail"><img src={assetUrl('sign_quarters')} alt="" /><h3>{t('quarters.capacity', { used: state.adventurers.length, max: capacity })}</h3><p>{t('quarters.description')}</p></div>
      {state.buildings.quarters < 23 && <div className="tavern-upgrades"><button disabled={state.money < price} onClick={() => setConfirmQuarters(true)}><strong>{t('quarters.upgrade')}</strong><span><img src={assetUrl('coin_copper')} alt="" />{price.toLocaleString()}</span></button></div>}
      {confirmQuarters && <UpgradeConfirmation target={t('quarters.upgrade')} cost={price} onCancel={() => setConfirmQuarters(false)} onConfirm={() => { store.upgradeFacility('quarters'); setConfirmQuarters(false) }} />}
      <div className="workshop-actions"><button onClick={onClose}>{t('common.close')}</button></div>
    </Modal>
  }
  return (
    <Modal title={title} onClose={onClose}>
      <div className="building-detail">
        <img src={assetUrl(`sign_${id}`)} alt="" />
        <h3>Level {id === 'quarters' ? state.buildings.quarters : 0}</h3>
        <p>This facility is wired to the original game-state boundary. Its complete queue and upgrade controls are the next port slice.</p>
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
  const buy = () => {
    if (store.refillRaid(areaId)) onBought()
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
  const { t, name, description, status } = useI18n()
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
    if (definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE') skills.push([t('battle.active'), activeSkillLabel(definition.fields.activeSkill)])
    if (definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE') skills.push([t('battle.passive'), definition.fields.passiveSkill.replace(/^PASSIVE_/, '').replaceAll('_', ' ')])
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
    if (definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE') skills.push([t('battle.active'), activeSkillLabel(definition.fields.activeSkill)])
    if (definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE') skills.push([t('battle.passive'), definition.fields.passiveSkill.replace(/^PASSIVE_/, '').replaceAll('_', ' ')])
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
  const collect = () => {
    if (run.chest.length === 0 || store.collect(run.areaId)) onClose()
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

function AreaDialog({ areaId, store, index, onClose }: { areaId: string; store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name, log } = useI18n()
  const [confirmRetreat, setConfirmRetreat] = useState(false)
  const [inspect, setInspect] = useState<BattleInspectSelection | null>(null)
  const [showDarkness, setShowDarkness] = useState(false)
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
        <div className="original-dungeon-log" aria-live="polite">{run.logs.map((line, logIndex) => <p className={`battle-log-line ${battleLogTone(line)} ${logIndex === 0 ? 'is-latest' : ''}`} key={`${line}-${logIndex}`}>{log(line)}</p>)}</div>
        <div className="battle-actions">
          <button onClick={() => setConfirmRetreat(true)}>{t('battle.retreat')}</button>
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
        {confirmRetreat && <div className="confirm-layer"><div className="confirm-box"><h3>{t('battle.retreatTitle')}</h3><p>{t('battle.retreatConfirm')}</p><div><button onClick={() => setConfirmRetreat(false)}>{t('common.cancel')}</button><button onClick={() => { store.retreat(areaId); onClose() }}>{t('common.yes')}</button></div></div></div>}
        {inspect && <BattleInspectPanel selection={inspect} index={index} onClose={() => setInspect(null)} />}
        {showDarkness && <BattleDarknessPanel darkness={run.localDarkness} onClose={() => setShowDarkness(false)} />}
      </section>
    </div>
  )
}

function AdventurerDialog({ uid, store, index, onClose, onSelectEquipment }: { uid: number; store: GameStore; index: ContentIndex; onClose: () => void; onSelectEquipment: (slot: EquipmentSlot) => void }) {
  const state = useGame(store)
  const { t, name, description } = useI18n()
  const [showDoctrine, setShowDoctrine] = useState(false)
  const member = state.adventurers.find((entry) => entry.uid === uid)
  const definition = member && index.adventurers.get(member.classId)
  if (!member || !definition) return null
  const stats = adventurerStats(member, index)
  const promotions = promotionChoices(member, index)
  const canAscend = !member.ascended && member.level >= definition.fields.maxLevel && definition.fields.maxLevel >= 45
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory']
  const activeSkill = definition.fields.activeSkill && definition.fields.activeSkill !== 'ACTIVE_NONE' ? activeSkillLabel(definition.fields.activeSkill) : t('adventurer.noSkill')
  const passiveSkill = definition.fields.passiveSkill && definition.fields.passiveSkill !== 'PASSIVE_NONE' ? definition.fields.passiveSkill.replace(/^PASSIVE_/, '').replaceAll('_', ' ') : t('adventurer.noSkill')
  const xpRequired = member.level >= definition.fields.maxLevel ? 0 : experienceToNextLevel(member.level, member.ascended)
  const traits = [member.trait, member.rareTrait].filter((trait): trait is string => Boolean(trait)).map((trait) => trait.replaceAll('_', ' '))
  return (
    <Modal title={member.name} onClose={onClose}>
      <div className={`entity-detail ${member.ascended ? 'ascended' : ''}`}>
        <div className="portrait-frame large"><img src={assetUrl(definition.imageKey)} alt="" /></div>
        <div><h3>{name(definition.name)} · {t('common.level')} {member.level}</h3><p>{description(definition.id, definition.description)}</p></div>
      </div>
      <div className="stat-grid">
        <span>CON <b>{stats.constitution}</b></span><span>INT <b>{stats.intelligence}</b></span><span>DEX <b>{stats.dexterity}</b></span>
        <span>HP <b>{member.hp}/{stats.maxHp}</b></span><span>DEF <b>{stats.defense}</b></span><span>MDEF <b>{stats.magicDefense}</b></span>
      </div>
      <section className="adventurer-progress">
        <div><strong>{t('battle.experience')}</strong><span>{xpRequired === 0 ? t('common.max') : `${member.xp.toLocaleString()}/${xpRequired.toLocaleString()}`}</span></div>
        {xpRequired > 0 && <ProgressBar value={member.xp} max={xpRequired} />}
        {traits.length > 0 && <p><strong>{t('battle.traits')}:</strong> {traits.join(' · ')}</p>}
      </section>
      <section className="adventurer-skills">
        <article><small>{t('battle.active')}</small><strong>{activeSkill}</strong></article>
        <article><small>{t('battle.passive')}</small><strong>{passiveSkill}</strong></article>
      </section>
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
          return <><div className="doctrine-points"><strong>{t('doctrine.points', { points })}</strong><small>{t('doctrine.loyalty', { level: loyalty })}</small></div><div className="doctrine-abilities">{doctrine.abilities.map((abilityId, slot) => {
            const ability = DOCTRINE_ABILITIES[abilityId]
            const level = member.doctrineLevels[slot] ?? 0
            return <article key={abilityId}><img src={assetUrl(`doctrine_ability_${abilityId.toLowerCase()}`)} alt="" /><div><strong>{abilityId.replaceAll('_', ' ')}</strong><small>{t('doctrine.abilityValue', { value: level * ability.increase })}</small></div><button disabled={level <= 0} onClick={() => store.changeDoctrineAbility(uid, abilityId, -1)}>−</button><b>{level}/{ability.maxLevel}</b><button disabled={level >= ability.maxLevel || points < ability.cost} onClick={() => store.changeDoctrineAbility(uid, abilityId, 1)}>+</button></article>
          })}</div><button className="doctrine-reset" onClick={() => store.resetDoctrine(uid)}>{t('doctrine.reset')}</button></>
        })())}
      </section>}
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

  return (
    <Modal title={t('equipment.selectTitle', { type: t(`equipment.type.${typeKey}`) })} onClose={onDone}>
      <section className="equipment-select">
        <small className="equipment-current-label">{t('equipment.equipped')}</small>
        <EquipmentChoiceRow item={current} />
        {candidates.length > 0 ? (
          <div className="equipment-candidate-list">
            {candidates.map(({ item, stack }) => (
              <EquipmentChoiceRow key={item.id} item={item} stack={stack} current={current} onChoose={() => { store.equip(uid, slot, item.id); onDone() }} />
            ))}
          </div>
        ) : <p className="equipment-empty">{t('equipment.empty')}</p>}
        <footer className="equipment-select-actions">
          <button disabled={!canUnequip} onClick={() => { store.equip(uid, slot, null); onDone() }}>{t('common.unequip')}</button>
          <button onClick={onDone}>{t('common.close')}</button>
        </footer>
      </section>
    </Modal>
  )
}

function ConsumePotionDialog({ itemId, store, index, onClose }: { itemId: string; store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
  const item = index.items.get(itemId)
  const potionType = potionTypeForItem(itemId)
  const special = ['Intercession', 'PotionOfRejuvenation', 'PotionOfClumsiness'].includes(itemId)
  const evo = itemId === 'Evo23Vial' || itemId === 'Evo23Vial2'
  const [gemsFound, setGemsFound] = useState<number | null>(null)
  const [rareTraitUid, setRareTraitUid] = useState<number | null>(null)
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
            ? <><p>{name(item?.description ?? '')}</p><button disabled={stack < 1} onClick={() => setGemsFound(store.openGeodes())}>{t('potion.openAll')} · {stack}</button></>
            : <><h3>{t('potion.gemsFound', { count: gemsFound })}</h3><img className="consume-reward" src={assetUrl('gem')} alt="" /></>}
        </div>
      </Modal>
    )
  }
  const rareTraitMember = rareTraitUid === null ? undefined : state.adventurers.find((member) => member.uid === rareTraitUid)
  if (evo && rareTraitMember) {
    return (
      <Modal title={t('trait.changeTitle')} onClose={() => setRareTraitUid(null)}>
        <div className="rare-trait-current"><strong>{rareTraitMember.name}</strong><small>{t('trait.current')}: {rareTraitMember.rareTrait?.replaceAll('_', ' ') ?? t('trait.none')}</small></div>
        <div className="rare-trait-list">
          {RARE_TRAITS.filter((trait) => trait !== rareTraitMember.rareTrait).map((trait) => (
            <button key={trait} onClick={() => {
              if (window.confirm(t('trait.confirm', { trait: trait.replaceAll('_', ' ') }))) {
                store.changeRareTrait(rareTraitMember.uid, trait, itemId)
                setRareTraitUid(null)
              }
            }}>{trait.replaceAll('_', ' ')}</button>
          ))}
        </div>
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
              else if (special) {
                if (window.confirm(t('potion.confirmSpecial', { name: member.name }))) store.consumeSpecial(member.uid, itemId)
              } else store.consumePotion(member.uid, itemId)
            }}>
              <img src={assetUrl(definition?.imageKey)} alt="" />
              <span><strong>{member.name}</strong><small>{name(definition?.name ?? member.classId)} · {t('common.level')} {member.level}</small></span>
              <b>{special || evo ? '✓' : `${drank}/${limit}`}</b>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

function RosterDialog({ store, index, onClose }: { store: GameStore; index: ContentIndex; onClose: () => void }) {
  const state = useGame(store)
  const { t, name } = useI18n()
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
              <button className="roster-dismiss" disabled={Boolean(member.areaId)} onClick={() => {
                if (window.confirm(t('roster.dismissConfirm', { name: member.name }))) store.dismissAdventurer(member.uid)
              }}>{t('roster.dismiss')}</button>
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
  const { t } = useI18n()
  const [selected, setSelected] = useState<number | null>(state.unreadMessages[0] ?? null)
  const messages = state.receivedMessages
    .map((id) => index.messages.get(id))
    .filter((message) => message !== undefined)
    .reverse()

  useEffect(() => {
    if (selected !== null && state.unreadMessages.includes(selected)) store.markMessageRead(selected)
  }, [selected, state.unreadMessages, store])

  const active = selected === null ? null : index.messages.get(selected)
  return (
    <Modal title={t('messages.title')} onClose={onClose}>
      {active ? (
        <article className="king-letter">
          <button className="letter-back" onClick={() => setSelected(null)}>‹ {t('common.back')}</button>
          <h3>{active.title}</h3>
          {active.body.split('\n').map((paragraph, position) => paragraph
            ? <p key={position}>{paragraph}</p>
            : <br key={position} />)}
        </article>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <button className={state.unreadMessages.includes(message.id) ? 'unread' : ''} key={message.id} onClick={() => setSelected(message.id)}>
              <img src={assetUrl('king_message')} alt="" />
              <span><strong>{message.title}</strong><small>{t('messages.from')}</small></span>
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
  const { t, name } = useI18n()
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
          <p>{name(enemy.description)}</p>
          <dl>
            <div><dt>HP</dt><dd>{enemy.fields.baseMaxHp}</dd></div>
            <div><dt>{t('bestiary.damage')}</dt><dd>{enemy.minDamage}–{enemy.maxDamage}</dd></div>
            <div><dt>{t('bestiary.defense')}</dt><dd>{enemy.fields.baseDefense}</dd></div>
            <div><dt>{t('bestiary.magicDefense')}</dt><dd>{enemy.fields.baseMagicDefense}</dd></div>
            <div><dt>DEX</dt><dd>{enemy.fields.baseDexterity}</dd></div>
            <div><dt>XP</dt><dd>{enemy.fields.expGiven}</dd></div>
          </dl>
          <section className="adventurer-skills"><article><small>{t('battle.active')}</small><strong>{enemy.fields.activeSkill && enemy.fields.activeSkill !== 'ACTIVE_NONE' ? activeSkillLabel(enemy.fields.activeSkill) : t('adventurer.noSkill')}</strong></article><article><small>{t('battle.passive')}</small><strong>{enemy.fields.passiveSkill && enemy.fields.passiveSkill !== 'PASSIVE_NONE' ? enemy.fields.passiveSkill.replace(/^PASSIVE_/, '').replaceAll('_', ' ') : t('adventurer.noSkill')}</strong></article></section>
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

  useEffect(() => store.subscribeCloudSync(() => setStatus(store.getCloudSyncStatus())), [store])

  const sync = async () => {
    setWorking(true)
    await store.syncNow()
    setWorking(false)
  }
  const restore = async () => {
    const remote = status.kind === 'conflict' ? status.remote : await store.pullCloudSave()
    if (remote && window.confirm(t('account.restoreConfirm'))) store.replaceWithCloudSave(remote)
  }

  if (status.kind === 'disabled') {
    return <Modal title={t('account.title')} onClose={onClose}><p className="dialog-intro">{t('account.disabled')}</p></Modal>
  }

  const detail = status.kind === 'signed-out' ? t('account.signedOut')
    : status.kind === 'syncing' ? t('account.syncing')
      : status.kind === 'offline' ? t('account.offline')
        : status.kind === 'conflict' ? t('account.conflict')
          : status.kind === 'error' ? `${t('account.error')}: ${status.message}`
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
        {!user && <button className="primary-button" disabled={working} onClick={() => void store.signInWithGoogle()}>{t('account.signIn')}</button>}
        {user && <>
          <button className="primary-button" disabled={working || status.kind === 'syncing'} onClick={() => void sync()}>{t('account.sync')}</button>
          <button className="secondary-button" disabled={working || status.kind === 'syncing'} onClick={() => void restore()}>{t('account.restore')}</button>
          <button className="danger-button" disabled={working} onClick={() => void store.signOut()}>{t('account.signOut')}</button>
        </>}
      </div>
    </Modal>
  )
}

function AppShell({ content, index, store }: AppProps) {
  const state = useGame(store)
  const { t } = useI18n()
  const [screen, setScreen] = useState<ScreenId>('headquarters')
  const [drawer, setDrawer] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)

  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  useEffect(() => {
    if (dialog === null && state.unreadMessages.length > 0) setDialog({ type: 'messages' })
  }, [dialog, state.unreadMessages])

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
    <div className="game-shell" onClick={handleShellClick}>
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
        <ToolButton icon="shop" label={t('tool.shop')} disabled />
        <div className="tool-with-badge">
          <ToolButton icon="king_message" label={t('tool.messages')} onClick={() => setDialog({ type: 'messages' })} />
          {state.unreadMessages.length > 0 && <b>{state.unreadMessages.length}</b>}
        </div>
        <ToolButton icon="merchant" label={t('tool.merchant')} onClick={() => setDialog({ type: 'merchant' })} />
        <ToolButton icon="quest_marker" label={t('tool.quests')} disabled={state.adventurers.length === 0} onClick={() => setDialog({ type: 'quests' })} />
      </div>

      <main className="game-content">
        {screen === 'headquarters' && <Headquarters onOpen={(id) => setDialog({ type: 'building', id })} tavernCount={state.tavernGuests.length} tavernCapacity={buildingCapacity('tavern', state.buildings.tavernCapacity, state.permanentUpgrades.UpgradeTavernCapacity ?? 0, state.purchasedPacks)} />}
        {screen === 'adventurers' && <AdventurersView store={store} index={index} onOpen={(uid) => setDialog({ type: 'adventurer', uid })} onManage={() => setDialog({ type: 'roster' })} />}
        {screen === 'dungeons' && <AreasView store={store} index={index} content={content} raid={false} onOpen={openArea} />}
        {screen === 'raids' && <AreasView store={store} index={index} content={content} raid onOpen={openArea} />}
      </main>

      <nav className="bottom-nav">
        {nav.map(([id, icon]) => (
          <button key={id} className={screen === id ? 'active' : ''} onClick={() => setScreen(id)}>
            <img src={assetUrl(icon)} alt="" /><span>{t(`screen.${id}`)}</span>
          </button>
        ))}
      </nav>

      {drawer && <div className="drawer-backdrop" onMouseDown={() => setDrawer(false)}><aside className="drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-title">Guild Master</div><button><img src={assetUrl('drawer_icon_king_message')} alt="" />{t('drawer.messages')}</button><button><img src={assetUrl('drawer_icon_faq')} alt="" />{t('drawer.faq')}</button><button><img src={assetUrl('drawer_icon_bestiary')} alt="" />{t('drawer.bestiary')}</button><button onClick={() => { setDrawer(false); setDialog({ type: 'account' }) }}><span className="drawer-cloud">☁</span>{t('drawer.account')}</button><button><img src={assetUrl('drawer_icon_achievements')} alt="" />{t('drawer.achievements')}</button><div className="drawer-language"><span>{t('drawer.language')}</span><div><button className={state.language === 'en' ? 'active' : ''} onClick={() => store.setLanguage('en')}>English</button><button className={state.language === 'vi' ? 'active' : ''} onClick={() => store.setLanguage('vi')}>Tiếng Việt</button></div></div><div className="drawer-spacer" /><button className="reset-button" onClick={() => { if (window.confirm(t('drawer.resetConfirm'))) { store.reset(); setDrawer(false) } }}>{t('drawer.newGuild')}</button></aside></div>}

      {dialog?.type === 'building' && <BuildingDialog id={dialog.id} store={store} index={index} onClose={() => setDialog(null)} onConsume={(itemId) => setDialog({ type: 'potion', itemId })} />}
      {dialog?.type === 'send' && <SendTeamDialog areaId={dialog.areaId} store={store} index={index} onClose={() => setDialog(null)} onSent={() => setDialog({ type: 'area', areaId: dialog.areaId })} />}
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
    </div>
  )
}

export default function App(props: AppProps) {
  const state = useGame(props.store)
  return <I18nProvider language={state.language}><AppShell {...props} /></I18nProvider>
}
