import { describe, expect, it } from 'vitest'
import {
  enterAncientGraveDiggingRoom,
  enterBlackwaterPortRoom,
  enterCelestialMothershipRoom,
  enterDivineArcheologyRoom,
  enterBarrenWastelandsRoom,
  enterEnchantedForestRoom,
  enterEternalBattlefieldRoom,
  enterFrostbitePeaksRoom,
  enterHiddenCityOfLaroxRoom,
  enterImperialRescueRoom,
  enterKaunisRoom,
  enterLostLandsRoom,
  enterObsidianMinesRoom,
  enterSleepingPlanetRoom,
  enterTheDreadfulAscentRoom,
  enterTheCultistRebelsRoom,
  enterTheDireDescentRoom,
  enterTheSlimePondRoom,
  enterTheLostExpeditionRoom,
  enterTheSouthernGroveRoom,
  enterTheTowerRoom,
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
  rollBlackwaterPortEncounter,
  rollCelestialMothershipEncounter,
  rollDivineArcheologyEncounter,
  rollBarrenWastelandsEncounter,
  rollEternalBattlefieldEncounter,
  rollFrostbitePeaksEncounter,
  rollHiddenCityOfLaroxEncounter,
  rollImperialRescueEncounter,
  rollKaunisEncounter,
  rollLostLandsEncounter,
  rollObsidianMinesEncounter,
  rollSleepingPlanetEncounter,
  rollTheDreadfulAscentEncounter,
  rollTheCultistRebelsEncounter,
  rollTheDireDescentEncounter,
  rollTheSlimePondEncounter,
  rollTheLostExpeditionEncounter,
  rollTheSouthernGroveEncounter,
  rollTheTowerEncounter,
  rollTheGoldenCityEncounter,
  rollTheDesertEncounter,
  searchEnchantedForest,
  searchBlackwaterPort,
  searchBarrenWastelands,
  searchEternalBattlefield,
  searchFrostbitePeaks,
  searchHiddenCityOfLarox,
  searchLostLands,
  searchObsidianMines,
  searchTheGoldenCity,
  searchTheDesert,
  searchTheSouthernGrove,
  startEnchantedForestFight,
  startAncientGraveDiggingFight,
  startBlackwaterPortFight,
  startCelestialMothershipFight,
  startDivineArcheologyFight,
  startBarrenWastelandsFight,
  startEternalBattlefieldFight,
  startFrostbitePeaksFight,
  startHiddenCityOfLaroxFight,
  startImperialRescueFight,
  startKaunisFight,
  startLostLandsFight,
  startObsidianMinesFight,
  startSleepingPlanetFight,
  startTheDreadfulAscentFight,
  startTheCultistRebelsFight,
  startTheDireDescentFight,
  startTheSlimePondFight,
  startTheLostExpeditionFight,
  startTheSouthernGroveFight,
  startTheTowerFight,
  startTheGoldenCityFight,
  startTheDesertFight,
  THE_DESERT_LOGS,
} from './areaScripts'
import type { AreaEventState } from './types'

describe('Ancient Grave Digging recovered raid script', () => {
  it('uses every fixed encounter exactly and leaves narrative rooms empty', () => {
    expect(rollAncientGraveDiggingEncounter(3)).toEqual(['Undead', 'Undead', 'UndeadWarlord', 'Undead', 'Undead'])
    expect(rollAncientGraveDiggingEncounter(4)).toEqual(['Undead', 'UndeadWarlord', 'Abomination', 'UndeadWarlord', 'Undead'])
    expect(rollAncientGraveDiggingEncounter(6)).toEqual(['UndeadArcher', 'UndeadWarlord', 'UndeadGeneral', 'UndeadWarlord', 'UndeadArcher'])
    expect(rollAncientGraveDiggingEncounter(8)).toEqual(['DeathHound', 'UndeadWarlord', 'UndeadWarlord', 'UndeadWarlord', 'DeathHound'])
    expect(rollAncientGraveDiggingEncounter(9)).toEqual(['UndeadWarlord', 'UndeadWarlord', 'UndeadGeneral', 'UndeadWarlord', 'UndeadWarlord'])
    expect(rollAncientGraveDiggingEncounter(11)).toEqual(['Necrolith', 'KabarTheRotten', 'Necrolith'])
    for (const progress of [1, 2, 5, 7, 10, 12]) expect(rollAncientGraveDiggingEncounter(progress)).toEqual([])
  })

  it('terminates in room twelve and emits only matching fight narration', () => {
    expect(enterAncientGraveDiggingRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('open door') })
    expect(enterAncientGraveDiggingRoom(12)).toMatchObject({ completed: true, log: expect.stringContaining('kill a lich') })
    expect(startAncientGraveDiggingFight(3)).toContain('reanimated bodies')
    expect(startAncientGraveDiggingFight(5)).toBeNull()
    expect(startAncientGraveDiggingFight(11)).toContain('metal scepter')
  })

  it("collapses every living Necrolith when Ka'Bar dies", () => {
    const enemies = [
      { enemyId: 'Necrolith', hp: 1_000_000 },
      { enemyId: 'KabarTheRotten', hp: 0 },
      { enemyId: 'Necrolith', hp: 1_000_000 },
    ]
    const result = killAncientGraveDiggingEnemy('KabarTheRotten', enemies)
    expect(enemies.map((enemy) => enemy.hp)).toEqual([0, 0, 0])
    expect(result.logs).toHaveLength(2)
    expect(result.logs[0]).toContain('crumbles to dust')
    expect(killAncientGraveDiggingEnemy('Necrolith', enemies).logs).toEqual([])
  })
})

describe('The Slime Pond recovered raid script', () => {
  it('rolls one slime per progress plus one with the exact species bands', () => {
    const rolls = [0.694999, 0.695, 0.795, 0.895, 0.995]
    expect(rollTheSlimePondEncounter(4, () => rolls.shift()!)).toEqual([
      'Slime', 'FireSlime', 'ElectricSlime', 'FrozenSlime', 'VoidSlime',
    ])
    expect(rolls).toEqual([])
    expect(rollTheSlimePondEncounter(2, () => 0)).toHaveLength(3)
    expect(rollTheSlimePondEncounter(3, () => 0)).toHaveLength(4)
  })

  it('only places the King in room six and terminates in room seven', () => {
    for (const progress of [1, 5, 7]) expect(rollTheSlimePondEncounter(progress)).toEqual([])
    expect(rollTheSlimePondEncounter(6)).toEqual(['SlimeKing'])
    expect(enterTheSlimePondRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('pond') })
    expect(enterTheSlimePondRoom(7)).toMatchObject({ completed: true, log: expect.stringContaining('taxonomists') })
    expect(startTheSlimePondFight(2)).toBe('The slimes attack!')
    expect(startTheSlimePondFight(5)).toBeNull()
    expect(startTheSlimePondFight(6)).toContain('unnatural agility')
  })
})

describe('Divine Archeology recovered epic raid script', () => {
  it('uses fixed armies, max-progress skips, and both unique-drop guards', () => {
    expect(rollDivineArcheologyEncounter(2, 2, false, false, false)).toEqual([
      'ShahuriWarrior', 'ShahuriArcher', 'ShahuriMage', 'ShahuriArcher', 'ShahuriWarrior',
    ])
    for (const progress of [4, 5, 6]) {
      expect(rollDivineArcheologyEncounter(progress, progress, false, false, false)).toEqual(Array.from({ length: 5 }, () => 'SandDemon'))
    }
    expect(rollDivineArcheologyEncounter(9, 9, false, false, false)).toEqual(['ShaKireFirstSwordsman'])
    expect(rollDivineArcheologyEncounter(9, 9, false, true, false)).toEqual([])
    expect(rollDivineArcheologyEncounter(12, 12, true, false, false)).toEqual(['ShaTheHiddenGod'])
    expect(rollDivineArcheologyEncounter(12, 12, false, false, false)).toEqual([])
    expect(rollDivineArcheologyEncounter(12, 12, true, false, true)).toEqual([])
    expect(rollDivineArcheologyEncounter(4, 6, false, false, false)).toEqual([])
  })

  it('requires exactly 200 living Constitution to open the pyramid door', () => {
    expect(enterDivineArcheologyRoom(12, 199)).toMatchObject({ completed: true, event: null, log: expect.stringContaining('required: 200') })
    expect(enterDivineArcheologyRoom(12, 200)).toMatchObject({ completed: false, event: { kind: 'PYRAMID_DOOR_OPEN' }, log: expect.stringContaining('opens wide') })
    expect(enterDivineArcheologyRoom(13, 0)).toMatchObject({ completed: true, log: expect.stringContaining('strange trinket') })
    expect(startDivineArcheologyFight(9)).toContain('four swords')
    expect(startDivineArcheologyFight(10)).toBeNull()
  })
})

describe('Imperial Rescue recovered epic raid script', () => {
  it('uses all eight fixed encounter rooms and max-progress skips', () => {
    expect(rollImperialRescueEncounter(1, 1, false)).toEqual(['InsaneCitizen', 'InsaneCitizen', 'CityWarden', 'InsaneCitizen', 'InsaneCitizen'])
    expect(rollImperialRescueEncounter(2, 2, false)).toEqual(['InsaneCitizen', 'CityWarden', 'InsaneMerchant', 'CityWarden', 'InsaneCitizen'])
    expect(rollImperialRescueEncounter(3, 3, false)).toEqual(['CityWarden', 'InsaneCitizen', 'ImperialGuard', 'InsaneCitizen', 'CityWarden'])
    expect(rollImperialRescueEncounter(6, 6, false)).toEqual(Array.from({ length: 5 }, () => 'ImperialGuard'))
    expect(rollImperialRescueEncounter(7, 7, false)).toEqual(['ImperialGuard', 'ImperialGuard', 'ImperialMage', 'ImperialGuard', 'ImperialGuard'])
    expect(rollImperialRescueEncounter(9, 9, false)).toEqual(['InsaneCitizen', 'InsaneMerchant', 'InsaneCitizen', 'InsaneMerchant', 'InsaneCitizen'])
    expect(rollImperialRescueEncounter(11, 11, false)).toEqual(['ImperialGuard', 'ImperialMage', 'ImperialGuard', 'ImperialMage', 'ImperialGuard'])
    expect(rollImperialRescueEncounter(14, 14, false)).toEqual(['EmperorClovisXXVIII'])
    expect(rollImperialRescueEncounter(7, 9, false)).toEqual([])
    expect(rollImperialRescueEncounter(14, 14, true)).toEqual([])
  })

  it('terminates in room fifteen and narrates only combat rooms', () => {
    expect(enterImperialRescueRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('huge courtyard') })
    expect(enterImperialRescueRoom(15)).toMatchObject({ completed: true, log: expect.stringContaining('finally at rest') })
    expect(startImperialRescueFight(1)).toContain('enraged citizen')
    expect(startImperialRescueFight(8)).toBeNull()
    expect(startImperialRescueFight(14)).toContain('royal insignia')
  })
})

describe('The Cultist Rebels recovered branching raid script', () => {
  it('advances the halls with exact random bands and encounter thresholds', () => {
    const initialized = enterTheCultistRebelsRoom(5, null, false, () => { throw new Error('room five consumes no RNG') })
    expect(initialized).toMatchObject({ event: { kind: 'HALLS_EXPLORATION', progress: 0 }, completed: false })
    const rolls = [0.333, 0.499]
    const advanced = enterTheCultistRebelsRoom(6, initialized.event, false, () => rolls.shift()!)
    expect(advanced).toMatchObject({ event: { progress: 1 }, log: expect.stringContaining('door on the left') })
    expect(rolls).toEqual([])
    const event = { kind: 'HALLS_EXPLORATION', progress: 1 } satisfies AreaEventState
    expect(rollTheCultistRebelsEncounter(event, () => 0.399999)).toEqual([])
    expect(rollTheCultistRebelsEncounter(event, () => 0.4)).toEqual(['LesserTitan'])
    expect(rollTheCultistRebelsEncounter(event, () => 0.75)).toEqual(Array.from({ length: 5 }, () => 'Crusader'))
  })

  it('opens the Skeleton Key route only when equipped and reaches the Primordial Titan', () => {
    const event = { kind: 'HALLS_EXPLORATION', progress: 8 } satisfies AreaEventState
    const locked = enterTheCultistRebelsRoom(20, event, false, () => { throw new Error('locked-door room consumes no RNG') })
    expect(locked.event).toEqual({ kind: 'HALLS_EXPLORATION', progress: 9 })
    const keyed = enterTheCultistRebelsRoom(20, event, true, () => { throw new Error('key route consumes no RNG') })
    expect(keyed.event).toEqual({ kind: 'HALLS_SKELETON_DOOR', progress: 0 })
    const unlock = enterTheCultistRebelsRoom(21, keyed.event, true, Math.random)
    const chamber = enterTheCultistRebelsRoom(22, unlock.event, true, Math.random)
    expect(chamber).toMatchObject({ event: { kind: 'HALLS_SKELETON_DOOR', progress: 2 }, log: expect.stringContaining('white marble') })
    expect(rollTheCultistRebelsEncounter(chamber.event)).toEqual(['PrimordialTitan'])
    expect(startTheCultistRebelsFight(chamber.event, 1)).toContain('breaks its chains')
    expect(enterTheCultistRebelsRoom(23, chamber.event, true, Math.random)).toMatchObject({ completed: true })
  })

  it('keeps the no-key route through the two cultists and preserves note bands', () => {
    const notes = enterTheCultistRebelsRoom(20, { kind: 'HALLS_EXPLORATION', progress: 4 }, false, () => 0.8)
    expect(notes).toMatchObject({ event: { progress: 5 }, log: expect.stringContaining('Experiment n.4') })
    const cultistRoom = enterTheCultistRebelsRoom(20, { kind: 'HALLS_EXPLORATION', progress: 13 }, false, Math.random)
    expect(cultistRoom.event).toEqual({ kind: 'HALLS_EXPLORATION', progress: 14 })
    expect(rollTheCultistRebelsEncounter(cultistRoom.event)).toEqual(['Claris', 'Thorvus'])
    expect(startTheCultistRebelsFight(cultistRoom.event, 2)).toContain('Two hooded cultists')
    expect(enterTheCultistRebelsRoom(21, cultistRoom.event, false, Math.random)).toMatchObject({ completed: true })
  })
})

describe('The Lost Expedition recovered branching raid script', () => {
  it('uses only the six intended main-route encounters', () => {
    expect(rollTheLostExpeditionEncounter(2, null)).toEqual(['LostMiner'])
    expect(rollTheLostExpeditionEncounter(4, null)).toEqual(Array.from({ length: 5 }, () => 'LostMiner'))
    expect(rollTheLostExpeditionEncounter(8, null)).toEqual(['BleakDisciple', 'EldritchHound', 'BleakDisciple'])
    expect(rollTheLostExpeditionEncounter(9, null)).toEqual(['EldritchHound', 'EldritchHound', 'BleakDisciple', 'EldritchHound', 'EldritchHound'])
    expect(rollTheLostExpeditionEncounter(10, null)).toEqual(['EldritchHound', 'BleakDisciple', 'BleakDeacon', 'BleakDisciple', 'EldritchHound'])
    expect(rollTheLostExpeditionEncounter(14, null)).toEqual(['BleakDisciple', 'AvatarOfTheAncient', 'BleakDisciple'])
    for (const progress of [1, 3, 5, 6, 7, 11, 12, 13, 15]) expect(rollTheLostExpeditionEncounter(progress, null)).toEqual([])
  })

  it('opens the trapdoor below the exact twenty-percent boundary', () => {
    expect(enterTheLostExpeditionRoom(11, null, () => 0.199999).event).toEqual({ kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 0 })
    expect(enterTheLostExpeditionRoom(11, null, () => 0.2).event).toBeNull()
    expect(enterTheLostExpeditionRoom(15, null, () => { throw new Error('room fifteen consumes no RNG') })).toMatchObject({ completed: true })
  })

  it('runs the eight-step lower route with fall damage and the Apostle fights', () => {
    let event: AreaEventState = { kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 0 }
    const blank = enterTheLostExpeditionRoom(12, event)
    expect(blank).toMatchObject({ event: { progress: 1 }, log: '', fallDamage: false })
    event = blank.event!
    const fall = enterTheLostExpeditionRoom(13, event)
    expect(fall).toMatchObject({ event: { progress: 2 }, fallDamage: true, log: expect.stringContaining('pressure plate') })
    expect(rollTheLostExpeditionEncounter(99, { ...event, progress: 5 })).toEqual(['LostMiner', 'LostMiner'])
    expect(rollTheLostExpeditionEncounter(99, { ...event, progress: 7 })).toEqual(['LostMiner', 'LostMiner', 'TekeliLiFirstApostle', 'LostMiner', 'LostMiner'])
    expect(startTheLostExpeditionFight(99, { ...event, progress: 7 })).toContain('horrible roar')
    const ending = enterTheLostExpeditionRoom(20, { ...event, progress: 8 })
    expect(ending).toMatchObject({ completed: true, event: { progress: 8 }, log: expect.stringContaining('endless stairs') })
  })
})

describe('Sleeping Planet recovered fourteen-adventurer raid script', () => {
  it('uses all five exact dreamwrought encounters', () => {
    expect(rollSleepingPlanetEncounter(5)).toEqual(Array.from({ length: 3 }, () => 'DreamwroughtBeast'))
    expect(rollSleepingPlanetEncounter(8)).toEqual(['DreamwroughtBeast', 'DreamwroughtDragon', 'DreamwroughtBeast'])
    expect(rollSleepingPlanetEncounter(10)).toEqual(['DreamwroughtBeast', 'DreamwroughtSwarm', 'DreamwroughtBeast'])
    expect(rollSleepingPlanetEncounter(12)).toEqual(['DreamwroughtBeast', 'DreamwroughtForge', 'DreamwroughtBeast'])
    expect(rollSleepingPlanetEncounter(14)).toEqual(['Singularity'])
    for (const progress of [1, 4, 6, 7, 9, 11, 13, 15]) expect(rollSleepingPlanetEncounter(progress)).toEqual([])
  })

  it('ends in room fifteen and keeps every encounter quote on its room', () => {
    expect(enterSleepingPlanetRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('strange patterns') })
    expect(enterSleepingPlanetRoom(15)).toMatchObject({ completed: true, log: expect.stringContaining('peaceful sleep') })
    expect(startSleepingPlanetFight(5)).toContain('feast on your bones')
    expect(startSleepingPlanetFight(13)).toBeNull()
    expect(startSleepingPlanetFight(14)).toContain('almost unbearable')
  })
})

describe('Kaunis recovered fourteen-adventurer raid script', () => {
  it('uses all seven fixed encounters in their original order', () => {
    expect(rollKaunisEncounter(1)).toEqual(['Necrobot', 'Necrobot', 'Necrobot'])
    expect(rollKaunisEncounter(6)).toEqual(['Necrobot', 'Necrobot', 'Enforcer', 'Necrobot', 'Necrobot'])
    expect(rollKaunisEncounter(9)).toEqual(['Phantasm'])
    expect(rollKaunisEncounter(10)).toEqual(['Necrobot', 'Enforcer', 'Enforcer', 'Necrobot'])
    expect(rollKaunisEncounter(11)).toEqual(['Necrobot', 'Necrobot', 'Cerebrum', 'Necrobot', 'Necrobot'])
    expect(rollKaunisEncounter(12)).toEqual(['Necrobot', 'Phantasm', 'Necrobot'])
    expect(rollKaunisEncounter(16)).toEqual(['ChiefScientistAva', 'KingAino', 'FirstMinisterAtos'])
    for (const progress of [2, 5, 7, 8, 13, 15, 17]) expect(rollKaunisEncounter(progress)).toEqual([])
  })

  it('preserves all room and fight narration and terminates in room seventeen', () => {
    expect(enterKaunisRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('Rag-clad villagers') })
    expect(enterKaunisRoom(17)).toMatchObject({ completed: true, log: expect.stringContaining('repairing their wounds') })
    expect(startKaunisFight(1)).toContain('mutated horrors')
    expect(startKaunisFight(16)).toContain('raise from their seats')
    expect(startKaunisFight(15)).toBeNull()
  })
})

describe('The Tower recovered fourteen-adventurer raid script', () => {
  it('places each of the seven prisoners at the exact recovered floor', () => {
    expect(rollTheTowerEncounter(8)).toEqual(['Lazarus'])
    expect(rollTheTowerEncounter(12)).toEqual(['Phoenix'])
    expect(rollTheTowerEncounter(16)).toEqual(['HeadlessKnight'])
    expect(rollTheTowerEncounter(22)).toEqual(['Ultraslime'])
    expect(rollTheTowerEncounter(26)).toEqual(['TheExiled'])
    expect(rollTheTowerEncounter(31)).toEqual(['TheAncient'])
    expect(rollTheTowerEncounter(35)).toEqual(['TheMachine'])
    expect(rollTheTowerEncounter(34)).toEqual([])
  })

  it('marks all six rest floors and terminates on floor thirty-nine', () => {
    for (const progress of [10, 14, 18, 24, 28, 33]) expect(enterTheTowerRoom(progress).rest).toBe(true)
    expect(enterTheTowerRoom(38)).toMatchObject({ completed: false, rest: false })
    expect(enterTheTowerRoom(39)).toMatchObject({ completed: true, log: expect.stringContaining('legendary achievement') })
    expect(startTheTowerFight(31)).toContain('wound on this universe')
    expect(startTheTowerFight(33)).toBeNull()
  })
})

describe('Lost Lands recovered area script', () => {
  it('uses every recovered prehistoric encounter boundary', () => {
    expect(rollLostLandsEncounter(null, 0.0259).roster).toEqual(['Berserker'])
    expect(rollLostLandsEncounter(null, 0.026).roster).toEqual(['Pterodactyl'])
    expect(rollLostLandsEncounter(null, 0.0779).roster).toEqual(['Terrorsaurus'])
    expect(rollLostLandsEncounter(null, 0.2079).roster).toEqual(['Terrorsaurus', 'StoneShaman', 'Pterodactyl'])
    expect(rollLostLandsEncounter(null, 0.3119).roster).toEqual(['AmanitaObscura', 'StoneShaman', 'Pterodactyl'])
    expect(rollLostLandsEncounter(null, 0.312).roster).toEqual([])
    expect(enterLostLandsRoom(0)).toContain('thick patch of ferns')
  })

  it('advances Fire Ritual by one to five points and summons the Titan at 100', () => {
    expect(advanceLostLandsFireRitual(null, 0)).toEqual({ kind: 'FIRE_RITUAL', progress: 1 })
    expect(advanceLostLandsFireRitual({ kind: 'FIRE_RITUAL', progress: 90 }, 0.999)).toEqual({ kind: 'FIRE_RITUAL', progress: 95 })
    const complete = advanceLostLandsFireRitual({ kind: 'FIRE_RITUAL', progress: 99 }, 0.99)
    expect(complete).toEqual({ kind: 'FIRE_RITUAL', progress: 100 })
    const boss = rollLostLandsEncounter(complete, 0.99)
    expect(boss).toEqual({ event: null, roster: ['SmolderingTitan'] })
    expect(startLostLandsFight(boss.roster, 0.99)).toContain('raging volcano')
  })

  it('keeps the Diamond at the recovered one-in-ten-thousand search chance', () => {
    expect(searchLostLands(0.000999, () => 0.0999)).toMatchObject({ type: 'item', itemId: 'Diamond' })
    expect(searchLostLands(0.000999, () => 0.1)).toEqual({ type: 'nothing' })
    expect(searchLostLands(0.001, () => { throw new Error('outer miss must not consume the second roll') })).toEqual({ type: 'nothing' })
    expect(startLostLandsFight(['Berserker'], 0)).toContain('wall of leaves')
  })
})

describe('Hidden City of Larox recovered area script', () => {
  it('uses every important encounter boundary and the 46.4% cutoff', () => {
    expect(rollHiddenCityOfLaroxEncounter(0.0249)).toEqual(['Imp'])
    expect(rollHiddenCityOfLaroxEncounter(0.025)).toEqual(['MagicArmor'])
    expect(rollHiddenCityOfLaroxEncounter(0.1999)).toEqual(['MagicArmor', 'WizardOfLarox'])
    expect(rollHiddenCityOfLaroxEncounter(0.3979)).toEqual(['MagicArmor', 'WizardOfLarox', 'ArchmageOfLarox', 'MagicArmor'])
    expect(rollHiddenCityOfLaroxEncounter(0.4639)).toEqual(['MagicArmor', 'WickedTribute', 'NexusResearcher', 'MagicArmor'])
    expect(rollHiddenCityOfLaroxEncounter(0.464)).toEqual([])
    expect(enterHiddenCityOfLaroxRoom(0)).toContain('arcane symbols')
    expect(startHiddenCityOfLaroxFight(0.99)).toContain('wooden door')
  })

  it('matches the Nexus magic amplification curve exactly', () => {
    expect(laroxMagicAmplification(0)).toBe(0.5)
    expect(laroxMagicAmplification(45)).toBe(1)
    expect(laroxMagicAmplification(46)).toBe(1)
    expect(laroxMagicAmplification(54)).toBe(1)
    expect(laroxMagicAmplification(55)).toBeCloseTo(1.0166666667)
    expect(laroxMagicAmplification(99)).toBe(1.75)
    expect(searchHiddenCityOfLarox(null, 0.99, () => 0)).toMatchObject({ type: 'amplification', percent: -50, event: { kind: 'MAGIC_AMPLIFICATION', progress: 0 } })
    expect(searchHiddenCityOfLarox({ kind: 'MAGIC_AMPLIFICATION', progress: 50 }, 0.1999, () => 0.999)).toMatchObject({ type: 'amplification', percent: 75, event: { progress: 99 } })
  })

  it('uses exact trap, hostile Nexus, heal, and empty search bands', () => {
    const event = { kind: 'MAGIC_AMPLIFICATION', progress: 50 } satisfies AreaEventState
    const unused = () => { throw new Error('non-amplification searches must not reroll the Nexus') }
    expect(searchHiddenCityOfLarox(event, 0.2299, unused)).toMatchObject({ type: 'trap', stat: 'Intelligence', difficulty: 50, damage: 100, magic: true })
    expect(searchHiddenCityOfLarox(event, 0.2599, unused)).toMatchObject({ type: 'hostileNexus' })
    expect(searchHiddenCityOfLarox(event, 0.2799, unused)).toMatchObject({ type: 'heal' })
    expect(searchHiddenCityOfLarox(event, 0.28, unused)).toMatchObject({ type: 'nothing' })
  })
})

describe('Barren Wastelands recovered area script', () => {
  it('uses the exact mixed encounter thresholds', () => {
    expect(rollBarrenWastelandsEncounter(0.0999)).toEqual(['Banshee'])
    expect(rollBarrenWastelandsEncounter(0.1)).toEqual(['CelestialLancer', 'Banshee'])
    expect(rollBarrenWastelandsEncounter(0.1599)).toEqual(['CelestialLancer', 'Iconoclast', 'Oculus', 'Banshee'])
    expect(rollBarrenWastelandsEncounter(0.2669)).toEqual(['Iconoclast'])
    expect(rollBarrenWastelandsEncounter(0.3009)).toEqual(['CelestialDestroyer'])
    expect(rollBarrenWastelandsEncounter(0.4949)).toEqual(['Iconoclast', 'CelestialDestroyer', 'Oculus'])
    expect(rollBarrenWastelandsEncounter(0.495)).toEqual([])
  })

  it('uses original narrative bands and the two-percent alien trap', () => {
    expect(enterBarrenWastelandsRoom(0)).toContain('Banshee crawls out')
    expect(startBarrenWastelandsFight(0.99)).toContain('large fire')
    expect(searchBarrenWastelands(0.0199)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 30, damage: 70, magic: false })
    expect(searchBarrenWastelands(0.02)).toEqual({ type: 'nothing' })
  })
})

describe('The Dreadful Ascent recovered epic raid script', () => {
  it('uses the exact fixed encounter roster for every combat room', () => {
    expect(rollTheDreadfulAscentEncounter(2, 2, false)).toEqual(Array.from({ length: 3 }, () => 'EtherealSoul'))
    expect(rollTheDreadfulAscentEncounter(3, 3, false)).toEqual(Array.from({ length: 4 }, () => 'EtherealSoul'))
    for (const progress of [4, 5, 8]) {
      expect(rollTheDreadfulAscentEncounter(progress, progress, false)).toEqual(Array.from({ length: 5 }, () => 'EtherealSoul'))
    }
    expect(rollTheDreadfulAscentEncounter(10, 10, false)).toEqual(['KasimirTheSeer'])
    expect(rollTheDreadfulAscentEncounter(11, 11, false)).toEqual(['HeraldKali'])
  })

  it('skips cleared rooms and never repeats the unique Herald reward', () => {
    expect(rollTheDreadfulAscentEncounter(1, 4, false)).toEqual([])
    expect(rollTheDreadfulAscentEncounter(3, 4, false)).toEqual([])
    expect(rollTheDreadfulAscentEncounter(11, 11, true)).toEqual([])
    expect(rollTheDreadfulAscentEncounter(12, 12, false)).toEqual([])
  })

  it('terminates on room thirteen and only has fight narration on scripted rooms', () => {
    expect(enterTheDreadfulAscentRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('dreadful ascent') })
    expect(enterTheDreadfulAscentRoom(13)).toMatchObject({ completed: true, log: expect.stringContaining('purple pillar') })
    expect(startTheDreadfulAscentFight(2)).toContain('spirits of long forgotten warriors')
    expect(startTheDreadfulAscentFight(11)).toBeNull()
  })
})

describe('Celestial Mothership recovered epic raid script', () => {
  it('uses the exact fixed roster and checkpoint skip rules', () => {
    expect(rollCelestialMothershipEncounter(2, 2, false)).toEqual(['Oculus'])
    expect(rollCelestialMothershipEncounter(3, 3, false)).toEqual(['Oculus', 'CelestialLancer', 'CelestialLancer', 'CelestialLancer', 'Oculus'])
    expect(rollCelestialMothershipEncounter(4, 4, false)).toEqual(Array.from({ length: 5 }, () => 'CelestialLancer'))
    expect(rollCelestialMothershipEncounter(8, 8, false)).toEqual(['CelestialLancer', 'CelestialLancer', 'CelestialDestroyer', 'CelestialLancer', 'CelestialLancer'])
    expect(rollCelestialMothershipEncounter(9, 9, false)).toEqual(['CelestialDestroyer', 'CelestialLancer', 'CelestialLancer', 'CelestialLancer', 'CelestialDestroyer'])
    expect(rollCelestialMothershipEncounter(12, 12, false)).toEqual(['Gcss', 'ReinforcedDoor', 'Gcss'])
    expect(rollCelestialMothershipEncounter(17, 17, false)).toEqual(['LegateHadrian'])
    expect(rollCelestialMothershipEncounter(9, 10, false)).toEqual([])
    expect(rollCelestialMothershipEncounter(17, 17, true)).toEqual([])
  })

  it('deactivates both G.C.S.S. units when the reinforced door is destroyed', () => {
    const enemies = [
      { enemyId: 'Gcss', hp: 50 },
      { enemyId: 'ReinforcedDoor', hp: 0 },
      { enemyId: 'Gcss', hp: 50 },
    ]
    const result = killCelestialMothershipEnemy('ReinforcedDoor', enemies)
    expect(enemies.map((enemy) => enemy.hp)).toEqual([0, 0, 0])
    expect(result.logs).toHaveLength(2)
    expect(result.logs[0]).toContain('source of power')
  })

  it('finishes at room nineteen and narrates every scripted encounter', () => {
    expect(enterCelestialMothershipRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('artificial origin') })
    expect(enterCelestialMothershipRoom(19)).toMatchObject({ completed: true, log: expect.stringContaining('teleported') })
    expect(startCelestialMothershipFight(2)).toContain('flying devices')
    expect(startCelestialMothershipFight(17)).toContain('flips a switch')
    expect(startCelestialMothershipFight(18)).toBeNull()
  })
})

describe('The Dire Descent recovered epic raid script', () => {
  it('only spawns the three Heralds at the room-five checkpoint', () => {
    expect(rollTheDireDescentEncounter(5, 5, false)).toEqual(['HeraldXavi', 'HeraldMaya', 'HeraldShoran'])
    expect(rollTheDireDescentEncounter(4, 4, false)).toEqual([])
    expect(rollTheDireDescentEncounter(5, 6, false)).toEqual([])
    expect(rollTheDireDescentEncounter(5, 5, true)).toEqual([])
  })

  it('narrates eight rooms and terminates after the final ascent', () => {
    expect(enterTheDireDescentRoom(1)).toMatchObject({ completed: false, log: expect.stringContaining('Core is near') })
    expect(enterTheDireDescentRoom(7)).toMatchObject({ completed: false, log: expect.stringContaining('King Roderic') })
    expect(enterTheDireDescentRoom(8)).toMatchObject({ completed: true, log: expect.stringContaining('sunlight') })
    expect(startTheDireDescentFight(5)).toBe('"Your quest ends here, Adventurers."')
    expect(startTheDireDescentFight(6)).toBeNull()
  })
})

describe('The Southern Grove recovered area script', () => {
  it('uses every recovered encounter threshold and the 60% outer cutoff', () => {
    expect(rollTheSouthernGroveEncounter(null, 0.0199).roster).toEqual(['GiantTortoise'])
    expect(rollTheSouthernGroveEncounter(null, 0.02).roster).toEqual(['GiantMoth'])
    expect(rollTheSouthernGroveEncounter(null, 0.0599).roster).toEqual(['GreenSpitfang'])
    expect(rollTheSouthernGroveEncounter(null, 0.3399).roster).toEqual(['GreenSpitfang', 'Dryad', 'GiantTortoise', 'GiantMoth'])
    expect(rollTheSouthernGroveEncounter(null, 0.3999).roster).toEqual(['GiantTortoise', 'GiantMoth', 'GreenSpitfang', 'GiantTortoise'])
    expect(rollTheSouthernGroveEncounter(null, 0.4).roster).toEqual([])
    expect(rollTheSouthernGroveEncounter(null, 0.6).roster).toEqual([])
    expect(enterTheSouthernGroveRoom(0)).toContain('thick branch')
  })

  it('advances the Primeval Wurm chase using average Dexterity', () => {
    let result = searchTheSouthernGrove(null, 100, () => 0.99)
    expect(result).toMatchObject({ type: 'nothing', averageDexterity: 100, turns: 70, event: { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 200 } })

    result = searchTheSouthernGrove({ kind: 'PRIMEVAL_WURM_PROGRESS', progress: 13_800 }, 100, () => {
      throw new Error('the terminal Wurm trap must not consume a normal-search roll')
    })
    expect(result).toMatchObject({ type: 'wurmTrap', event: { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 14_000 } })

    const encounter = rollTheSouthernGroveEncounter(result.event, 0.99)
    expect(encounter).toEqual({ event: { kind: 'PRIMEVAL_WURM_COOLDOWN', progress: 0 }, roster: ['PrimevalWurm'] })
    expect(startTheSouthernGroveFight(encounter.event, 0.99)).toContain('Primeval Wurm')
  })

  it('uses exact search bands and restarts the chase after 41 cooldown searches', () => {
    expect(searchTheSouthernGrove(null, 300, () => 0.0599)).toMatchObject({ type: 'item', itemId: 'ElysianWood', event: { progress: 14 } })
    expect(searchTheSouthernGrove(null, 300, () => 0.1099)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 50, damage: 75, magic: false })
    expect(searchTheSouthernGrove(null, 300, () => 0.1349)).toMatchObject({ type: 'trap', stat: 'Intelligence', difficulty: 40, damage: 90, magic: true })

    let event: AreaEventState = { kind: 'PRIMEVAL_WURM_COOLDOWN', progress: 0 }
    for (let room = 1; room <= 40; room += 1) {
      event = searchTheSouthernGrove(event, 100, () => 0.99).event
      expect(event).toEqual({ kind: 'PRIMEVAL_WURM_COOLDOWN', progress: room })
    }
    event = searchTheSouthernGrove(event, 100, () => 0.99).event
    expect(event).toEqual({ kind: 'PRIMEVAL_WURM_PROGRESS', progress: 0 })
  })
})

describe('Obsidian Mines recovered area script', () => {
  it('uses the exact encounter thresholds and search chance', () => {
    expect(rollObsidianMinesEncounter(null, 0.0149).roster).toEqual(['GiantSpider'])
    expect(rollObsidianMinesEncounter(null, 0.015).roster).toEqual(['VampireBat'])
    expect(rollObsidianMinesEncounter(null, 0.5999).roster).toEqual(['ObsidianGolem', 'VampireBat', 'Beholder', 'GiantSpider'])
    expect(rollObsidianMinesEncounter(null, 0.6).roster).toEqual([])
    expect(startObsidianMinesFight(0)).toContain('eerie steps')
    expect(searchObsidianMines(0.0099)).toEqual({ type: 'item', itemId: 'ObsidianChunk' })
    expect(searchObsidianMines(0.01)).toEqual({ type: 'nothing' })
  })

  it('accelerates the horror hunt at 50 and summons Pale Hermit at 70', () => {
    let event: AreaEventState | null = null
    let result = enterObsidianMinesRoom(event, 0)
    event = result.event
    expect(event).toEqual({ kind: 'UNSPEAKABLE_HORROR', progress: 0 })

    for (let room = 1; room <= 50; room += 1) event = enterObsidianMinesRoom(event, 0).event
    expect(event).toEqual({ kind: 'UNSPEAKABLE_HORROR', progress: 50 })

    for (const progress of [55, 60, 65, 70]) {
      result = enterObsidianMinesRoom(event, 0)
      event = result.event
      expect(event).toEqual({ kind: 'UNSPEAKABLE_HORROR', progress })
      expect(result.logs[1]).toContain('noticed your presence')
    }

    const boss = rollObsidianMinesEncounter(event, 0.99)
    expect(boss).toEqual({
      event: { kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 },
      roster: ['PaleHermit'],
    })
  })

  it('restarts the horror hunt after ten cooldown rooms', () => {
    let event: AreaEventState | null = { kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 }
    for (let room = 1; room < 10; room += 1) {
      event = enterObsidianMinesRoom(event, 0).event
      expect(event).toEqual({ kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: room })
    }
    event = enterObsidianMinesRoom(event, 0).event
    expect(event).toEqual({ kind: 'UNSPEAKABLE_HORROR', progress: 0 })
  })
})

describe('Frostbite Peaks recovered area script', () => {
  it('uses the exact encounter thresholds and narrative bands', () => {
    expect(rollFrostbitePeaksEncounter(0.0199)).toEqual(['TrollWhelp', 'TrollWhelp'])
    expect(rollFrostbitePeaksEncounter(0.02)).toEqual(['TrollWhelp', 'Troll'])
    expect(rollFrostbitePeaksEncounter(0.2899)).toEqual(['TrollWarrior', 'Troll', 'TrollShaman', 'TrollWarrior'])
    expect(rollFrostbitePeaksEncounter(0.29)).toEqual([])
    expect(startFrostbitePeaksFight(0)).toContain('pungent smell')
  })

  it('runs Blizzard for the original six active rooms', () => {
    let result = enterFrostbitePeaksRoom(null, 0, 0.0099)
    expect(result).toMatchObject({ event: { kind: 'BLIZZARD', progress: 0 }, freezeChance: 0.15 })
    expect(result.logs[1]).toContain('blizzard descends')

    for (let room = 1; room <= 5; room += 1) {
      result = enterFrostbitePeaksRoom(result.event, 0, 1)
      expect(result).toMatchObject({ event: { kind: 'BLIZZARD', progress: room }, freezeChance: 0.15 })
    }

    result = enterFrostbitePeaksRoom(result.event, 0, 1)
    expect(result.event).toBeNull()
    expect(result.freezeChance).toBe(0.05)
    expect(result.logs[1]).toBe('The blizzard has ceased.')
  })

  it('matches the locked crate and normal search bands', () => {
    expect(searchFrostbitePeaks(0, 40, 0.1999, 0.2499)).toMatchObject({
      type: 'crate', chance: 20, success: true,
      items: [
        { itemId: 'Winterwood', stack: 3 },
        { itemId: 'FrostmetalOre', stack: 3 },
        { itemId: 'IceFiber', stack: 3 },
        { itemId: 'FrostCrystal', stack: 1 },
      ],
    })
    expect(searchFrostbitePeaks(0, 40, 0.2, 0)).toMatchObject({ type: 'crate', chance: 20, success: false, items: [] })
    expect(searchFrostbitePeaks(0.0299, 0, 1, 1)).toEqual({ type: 'item', itemId: 'Winterwood', stack: 1 })
    expect(searchFrostbitePeaks(0.0499, 0, 1, 1)).toEqual({ type: 'item', itemId: 'IceFiber', stack: 1 })
    expect(searchFrostbitePeaks(0.0599, 0, 1, 1)).toEqual({ type: 'item', itemId: 'FrostmetalOre', stack: 1 })
    expect(searchFrostbitePeaks(0.0999, 0, 1, 1)).toMatchObject({ type: 'trap', stat: 'Constitution', difficulty: 35, damage: 70, magic: false })
    expect(searchFrostbitePeaks(0.1, 0, 1, 1)).toEqual({ type: 'nothing' })
  })
})

describe('Blackwater Port recovered area script', () => {
  it('uses the exact normal encounter thresholds', () => {
    expect(rollBlackwaterPortEncounter(null, 0.0009).roster).toEqual(['Mimic'])
    expect(rollBlackwaterPortEncounter(null, 0.001).roster).toEqual(['MysteriousTentacle'])
    expect(rollBlackwaterPortEncounter(null, 0.3849).roster).toEqual([
      'Deckhand', 'Pirate', 'PirateLieutenant', 'Deckhand', 'Deckhand',
    ])
    expect(enterBlackwaterPortRoom(0)).toContain('Walking along the quay')
  })

  it('requires ten consecutive empty rooms before the Kraken fight', () => {
    let event: AreaEventState | null = null
    for (let empty = 1; empty <= 10; empty += 1) {
      const result = rollBlackwaterPortEncounter(event, 0.385)
      event = result.event
      expect(event).toEqual({ kind: 'THE_KRAKEN', progress: empty })
      expect(result.roster).toEqual([])
      expect(result.logs).toHaveLength(empty === 10 ? 1 : 0)
    }

    const fight = rollBlackwaterPortEncounter(event, 0)
    expect(fight.event).toEqual({ kind: 'THE_KRAKEN_FIGHT', progress: 0 })
    expect(fight.roster).toEqual(Array.from({ length: 5 }, () => 'MysteriousTentacle'))
    expect(startBlackwaterPortFight(fight.event, 0)).toContain('huge, dark spot')
    expect(searchBlackwaterPort(fight.event, 0.99)).toMatchObject({ type: 'reward', itemId: 'EyeOfTheAbyss', event: null })
  })

  it('resets a short empty streak and matches all search bands', () => {
    const streak = { kind: 'THE_KRAKEN', progress: 9 } satisfies AreaEventState
    expect(rollBlackwaterPortEncounter(streak, 0).event).toBeNull()
    expect(searchBlackwaterPort(null, 0.0299)).toMatchObject({ type: 'item', itemId: 'Pearl' })
    expect(searchBlackwaterPort(null, 0.0599)).toEqual({ type: 'item', itemId: 'GhostwoodStump' })
    expect(searchBlackwaterPort(null, 0.1099)).toEqual({ type: 'item', itemId: 'MissingPage' })
    expect(searchBlackwaterPort(null, 0.1599)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 40, damage: 40, magic: false })
    expect(searchBlackwaterPort(null, 0.2099)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 10, damage: 150, magic: false })
    expect(searchBlackwaterPort(null, 0.2599)).toMatchObject({ type: 'trap', stat: 'Constitution', difficulty: 20, damage: 60, magic: true })
    expect(searchBlackwaterPort(null, 0.3099)).toMatchObject({ type: 'trap', stat: 'Intelligence', difficulty: 20, damage: 60, magic: false })
    expect(searchBlackwaterPort(null, 0.31)).toEqual({ type: 'nothing' })
  })
})

describe('The Golden City recovered area script', () => {
  it('uses the exact encounter thresholds and empty-room cutoff', () => {
    expect(rollTheGoldenCityEncounter(null, 0.0299)).toEqual(['InsaneCitizen'])
    expect(rollTheGoldenCityEncounter(null, 0.03)).toEqual(['CityWarden'])
    expect(rollTheGoldenCityEncounter(null, 0.4699)).toEqual([
      'CityWarden', 'ImperialMage', 'InsanePriest', 'ArcaneAssassin', 'CityWarden',
    ])
    expect(rollTheGoldenCityEncounter(null, 0.47)).toEqual([])
  })

  it('starts Angry Eye at 0.3% and resolves it at 25% per fight', () => {
    const room = enterTheGoldenCityRoom(null, 0, 0.00299)
    expect(room.event).toEqual({ kind: 'ANGRY_EYE', progress: 5 })
    expect(room.logs[1]).toContain('Enemy damage is doubled')

    const continues = startTheGoldenCityFight(room.event, 0, 0.25)
    expect(continues).toMatchObject({ event: room.event, delirious: true })

    const ends = startTheGoldenCityFight(room.event, 0, 0.2499)
    expect(ends.event).toBeNull()
    expect(ends.delirious).toBe(false)
    expect(ends.logs[1]).toContain('rumble stops')
  })

  it('matches every recovered search probability band', () => {
    expect(searchTheGoldenCity(0.0399)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 20, damage: 50, magic: false })
    expect(searchTheGoldenCity(0.0599)).toEqual({ type: 'eyeDrain' })
    expect(searchTheGoldenCity(0.0899)).toEqual({ type: 'heal' })
    expect(searchTheGoldenCity(0.0999)).toEqual({ type: 'item', itemId: 'SilkThread' })
    expect(searchTheGoldenCity(0.1099)).toEqual({ type: 'item', itemId: 'Redwood' })
    expect(searchTheGoldenCity(0.1149)).toEqual({ type: 'item', itemId: 'Ivory' })
    expect(searchTheGoldenCity(0.1169)).toEqual({ type: 'item', itemId: 'GoldScraps' })
    expect(searchTheGoldenCity(0.117)).toEqual({ type: 'nothing' })
  })
})

describe('Eternal Battlefield recovered area script', () => {
  it('uses all recovered encounter thresholds and narrative bands', () => {
    expect(rollEternalBattlefieldEncounter(0.0199)).toEqual(['DeathHound'])
    expect(rollEternalBattlefieldEncounter(0.02)).toEqual(['Undead'])
    expect(rollEternalBattlefieldEncounter(0.5799)).toEqual(['Undead', 'WillOWisp', 'UndeadArcher', 'DeathHound', 'Undead'])
    expect(rollEternalBattlefieldEncounter(0.58)).toEqual([])
    expect(enterEternalBattlefieldRoom(0)).toContain('burning remains')
    expect(startEternalBattlefieldFight(0)).toContain('Dead hands')
  })

  it('tracks 200 Will o\' Wisps and grants the search reward', () => {
    let event: AreaEventState | null = null
    for (let kill = 1; kill <= 200; kill += 1) {
      event = killEternalBattlefieldEnemy(event, 'WillOWisp').event
    }
    expect(event).toEqual({ kind: 'WILL_O_WISP_HUNT', progress: 200 })
    expect(searchEternalBattlefield(event, 0.99)).toEqual({ type: 'reward', itemId: 'OrbOfEctoplasm', event: null })
  })

  it('matches both trap probability bands', () => {
    expect(searchEternalBattlefield(null, 0.0399)).toMatchObject({ type: 'trap', stat: 'Dexterity', difficulty: 7, damage: 80, magic: false })
    expect(searchEternalBattlefield(null, 0.0799)).toMatchObject({ type: 'trap', stat: 'Intelligence', difficulty: 21, damage: 30, magic: true })
    expect(searchEternalBattlefield(null, 0.08)).toEqual({ type: 'nothing' })
  })
})

describe('Enchanted Forest recovered area script', () => {
  it('uses the original early-game and full encounter tables', () => {
    expect(rollEnchantedForestEncounter(null, 0, true)).toEqual(['Wolf'])
    expect(rollEnchantedForestEncounter(null, 0.499, true)).toEqual(['Wolf', 'Wolf'])
    expect(rollEnchantedForestEncounter(null, 0.5, true)).toEqual([])
    expect(rollEnchantedForestEncounter(null, 0, false)).toEqual(['GoldenRabbit'])
    expect(rollEnchantedForestEncounter(null, 0.01, false)).toEqual(['Ent'])
    expect(rollEnchantedForestEncounter(null, 0.499, false)).toEqual(['Treant', 'Centaur', 'Boar'])
  })

  it('keeps tutorial wolves active and chains Golden Rabbit into Forest Spirit', () => {
    expect(rollEnchantedForestEncounter({ kind: 'TUTORIAL', progress: 0 }, 0.9, false)).toEqual(['TutorialWolf'])
    const awakened = killEnchantedForestEnemy(null, 'GoldenRabbit')
    expect(awakened.event).toEqual({ kind: 'ENRAGED_SPIRIT', progress: 0 })
    expect(rollEnchantedForestEncounter(awakened.event, 0.9, false)).toEqual(['ForestSpirit'])
    const started = startEnchantedForestFight(awakened.event, 0)
    expect(started.event).toBeNull()
    expect(started.log).toContain('enraged spirit')
  })

  it('selects room narrative and exact search probability bands', () => {
    expect(enterEnchantedForestRoom(0)).toContain('forest clearing')
    expect(searchEnchantedForest(0.0499)).toEqual({ type: 'item', itemId: 'CopperOre' })
    expect(searchEnchantedForest(0.1499)).toEqual({ type: 'item', itemId: 'Wood' })
    expect(searchEnchantedForest(0.1699)).toEqual({ type: 'fountain' })
    expect(searchEnchantedForest(0.1899)).toEqual({ type: 'fairy' })
    expect(searchEnchantedForest(0.2299)).toEqual({ type: 'pitfall' })
    expect(searchEnchantedForest(0.23)).toEqual({ type: 'nothing' })
  })
})

describe('The Desert recovered area script', () => {
  it('uses the exact normal and army encounter thresholds', () => {
    expect(rollTheDesertEncounter(null, 0.0249)).toEqual(['ShahuriWarrior'])
    expect(rollTheDesertEncounter(null, 0.025)).toEqual(['ShahuriArcher'])
    expect(rollTheDesertEncounter(null, 0.4499)).toEqual(['Djinn'])
    expect(rollTheDesertEncounter(null, 0.45)).toEqual([])
    expect(rollTheDesertEncounter({ kind: 'SHAHURI_ARMY_READY', progress: 0 }, 0.99)).toEqual([
      'SandStatue', 'SandStatue', 'SandStatue', 'SandStatue', 'SandStatue',
    ])
  })

  it('charges the deterrent system for 100 Sha\'huri kills', () => {
    let event: AreaEventState | null = null
    for (let kill = 1; kill <= 100; kill += 1) {
      const result = killTheDesertEnemy(event, 'ShahuriWarrior')
      event = result.event
      expect(result.logs[0]).toContain(`[${kill}/100]`)
    }
    expect(event).toEqual({ kind: 'SHAHURI_ARMY_READY', progress: 0 })
  })

  it('runs ten statue waves and then collapses the army', () => {
    let event: AreaEventState | null = { kind: 'SHAHURI_ARMY_READY', progress: 0 }
    for (let fight = 0; fight < 10; fight += 1) {
      const room = enterTheDesertRoom(event, 0)
      expect(room.log).toBe(THE_DESERT_LOGS.armyAdvance)
      const started = startTheDesertFight(room.event, 0)
      event = started.event
    }
    const finalRoom = enterTheDesertRoom(event, 0)
    expect(finalRoom).toEqual({ event: null, log: THE_DESERT_LOGS.armyDefeated })
  })

  it('matches the recovered search-room probability bands', () => {
    expect(searchTheDesert(null, 0.0099)).toEqual({ type: 'item', itemId: 'Quartz' })
    expect(searchTheDesert(null, 0.0349)).toEqual({ type: 'item', itemId: 'Sandstone' })
    expect(searchTheDesert(null, 0.0849)).toEqual({ type: 'silence' })
    expect(searchTheDesert(null, 0.0999)).toEqual({ type: 'oasis' })
    expect(searchTheDesert(null, 0.1)).toEqual({ type: 'nothing' })
  })
})
