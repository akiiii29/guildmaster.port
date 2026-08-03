import type { AreaEventState } from './types'

export const THE_DESERT_LOGS = {
  enter: "In front of the expedition lies the endless Sha'huri Desert, inhabited by the once friendly people of the same name. Engaged in a thousand years battle with the Golden City, since the corruption took over, the war has ended and all contacts have been interrupted.",
  encounters: [
    'A shadow in the barren wastelands quickly raises the group attention.',
    'The group is not alone. Few steps ahead, an enemy threat is ready to fight.',
    'Unusual vibrations below your feet precede the fight that is going to take place.',
    'Concealed by a dune, enemies were waiting for your arrival.',
    'Screams pierce the stillness of the air, as the team is assaulted from ahead.',
  ],
  rooms: [
    "The sand drags below the adventurer's steps, in a landscape that hasn't changed for hours.",
    'A small trail of footprints lies on the ground. It must be recent.',
    'With the sun so high in the sky, every step is harder than the previous.',
    "The adventurers keep going forward, with only the occasional cactus breaking the landscape's monotony.",
    'Scorching winds caress the dunes ahead as the sand seems to dance atop of them.',
  ],
  armyReady: 'The dunes start moving like a tempestuous sea, animated by an ancient defense system. Sand figures start rising around you. They stretch as far as the eye can see…',
  armyAdvance: 'The team bravely advances between the overwhelming horde.',
  armyAttack: "The ancient Sha'huri army attacks you with all its might.",
  armyDefeated: 'As suddenly as it rose, the endless army crumbles to dust, unrecognizable from the sand below your feet.',
  sandstorm: "The sky darkens suddenly, and a brief but powerful sandstorm overwhelms the adventurers team.",
  oasis: 'Not much further, the team finds a rare desert oasis, full of palm trees and with a small pond of crystal clear water. They decide to rest for a while. Everyone recovered 10 HP and 10 Mana.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const DESERT_ENCOUNTERS: Array<[number, string[]]> = [
  [25, ['ShahuriWarrior']],
  [50, ['ShahuriArcher']],
  [75, ['Wurm']],
  [100, ['SandVulture']],
  [125, ['Wurm', 'SandVulture']],
  [150, ['Wurm', 'Wurm']],
  [175, ['SandVulture', 'SandVulture']],
  [200, ['ShahuriWarrior', 'ShahuriWarrior']],
  [225, ['ShahuriArcher', 'ShahuriArcher']],
  [245, ['Wurm', 'SandVulture', 'Wurm']],
  [265, ['ShahuriArcher', 'ShahuriWarrior', 'ShahuriArcher']],
  [285, ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriWarrior']],
  [305, ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriMage']],
  [325, ['ShahuriWarrior', 'ShahuriMage', 'ShahuriWarrior']],
  [345, ['ShahuriMage', 'ShahuriArcher', 'ShahuriMage']],
  [360, ['ShahuriMage', 'ShahuriWarrior', 'ShahuriMage']],
  [375, ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriMage', 'ShahuriWarrior']],
  [390, ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriMage', 'ShahuriWarrior']],
  [405, ['ShahuriArcher', 'ShahuriWarrior', 'ShahuriMage', 'ShahuriArcher']],
  [420, ['ShahuriMage', 'ShahuriArcher', 'ShahuriWarrior', 'ShahuriMage']],
  [435, ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriArcher', 'ShahuriWarrior']],
  [450, ['Djinn']],
]

const indexedLog = (logs: readonly string[], roll: number) => logs[Math.min(logs.length - 1, Math.trunc(roll * logs.length))]

export const ENCHANTED_FOREST_LOGS = {
  enter: "The party sets foot in the forest just outside the guild's camp. Once a magical place where kids used to play, you feel the corruption tendrils are starting to reach these trees.",
  encounters: [
    'There is a sound of a branch cracking. The team turns around.',
    'Few meters ahead, from the bushes, a pair of eyes are watching the expedition.',
    'Something was here before you, and has no intention to leave.',
    'A low pitched growl echoes in the air.',
    'You notice a movement behind the trees.',
  ],
  rooms: [
    'The team makes its way into a forest clearing, bathed in dim sunlight and surrounded by ancient trees.',
    'There is a narrow forest path ahead, enclosed by towering trees.',
    "This area is engulfed by an abundance of high trees and untamed wilderness. It's very hard to see the sky above.",
    'Blooming wildflowers are scattered everywhere, along with a few trees. Would have been a nice place for a camping trip in better times.',
    'The trees make space for a narrow forest path, now muddy and overgrown with shrubs.',
  ],
  spiritAwakens: "A piercing scream echoes through the trees. It's rapidly getting closer…",
  spiritEncounter: 'Among the sparse trees, an enraged spirit stands before you. "Why did you do it…" — the wind whispers.',
  fountain: "The group approaches an old fountain, covered in moss but otherwise perfectly functioning. After drinking its water, all wounds instantly disappear. Adventurers' HP are fully restored.",
  fairy: "The team finds a small fairy, trapped in a hunter's net and screaming at the top of her lungs. When they free her, she performs a quick spell and disappears into the crowns of the trees. Adventurers' Mana has been filled.",
  pitfall: 'A large pitfall setup by hunters, concealed by a patch of leaves, lies in front of the team.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const ENCHANTED_FOREST_ENCOUNTERS: Array<[number, string[]]> = [
  [10, ['GoldenRabbit']],
  [30, ['Ent']],
  [80, ['Wolf']],
  [130, ['Boar']],
  [180, ['Treant']],
  [210, ['Centaur']],
  [240, ['Wolf', 'Wolf']],
  [270, ['Boar', 'Wolf']],
  [300, ['Boar', 'Boar']],
  [330, ['Wolf', 'Treant']],
  [360, ['Boar', 'Treant']],
  [380, ['Treant', 'Treant']],
  [400, ['Centaur', 'Centaur']],
  [420, ['Wolf', 'Wolf', 'Wolf']],
  [440, ['Wolf', 'Boar', 'Wolf']],
  [460, ['Treant', 'Boar', 'Wolf']],
  [480, ['Wolf', 'Centaur', 'Wolf']],
  [500, ['Treant', 'Centaur', 'Boar']],
]

export function rollEnchantedForestEncounter(event: AreaEventState | null, roll: number, smallQuarters: boolean) {
  if (event?.kind === 'ENRAGED_SPIRIT') return ['ForestSpirit']
  if (event?.kind === 'TUTORIAL') return ['TutorialWolf']
  const value = roll * 1_000
  if (value >= 500) return []
  if (smallQuarters) {
    if (value < 100) return ['Wolf']
    if (value < 200) return ['Boar']
    if (value < 300) return ['Treant']
    if (value < 400) return ['Centaur']
    return ['Wolf', 'Wolf']
  }
  return ENCHANTED_FOREST_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function enterEnchantedForestRoom(roll: number) {
  return indexedLog(ENCHANTED_FOREST_LOGS.rooms, roll)
}

export function startEnchantedForestFight(event: AreaEventState | null, roll: number) {
  if (event?.kind === 'ENRAGED_SPIRIT') {
    return { event: null, log: ENCHANTED_FOREST_LOGS.spiritEncounter }
  }
  return { event, log: indexedLog(ENCHANTED_FOREST_LOGS.encounters, roll) }
}

export function killEnchantedForestEnemy(event: AreaEventState | null, enemyId: string) {
  if (enemyId !== 'GoldenRabbit') return { event, logs: [] as string[] }
  return {
    event: { kind: 'ENRAGED_SPIRIT', progress: 0 } satisfies AreaEventState,
    logs: [ENCHANTED_FOREST_LOGS.spiritAwakens],
  }
}

export type EnchantedForestSearchResult =
  | { type: 'item'; itemId: 'CopperOre' | 'Wood' }
  | { type: 'fountain' }
  | { type: 'fairy' }
  | { type: 'pitfall' }
  | { type: 'nothing' }

export function searchEnchantedForest(roll: number): EnchantedForestSearchResult {
  if (roll < 0.05) return { type: 'item', itemId: 'CopperOre' }
  if (roll < 0.15) return { type: 'item', itemId: 'Wood' }
  if (roll < 0.17) return { type: 'fountain' }
  if (roll < 0.19) return { type: 'fairy' }
  if (roll < 0.23) return { type: 'pitfall' }
  return { type: 'nothing' }
}

export const ETERNAL_BATTLEFIELD_LOGS = {
  enter: "The smell of the burning graves permeates the air, raising a thick smoke curtain that is hard to penetrate. The team advances carefully through the edge of the thousand years battlefield, unable to imagine how the corruption could have twisted the Sha'huri and Imperial remains that were left behind.",
  encounters: [
    "Dead hands grasp the ground below the team's feet, struggling to reach the surface.",
    'Right in front of you, something notices your presence. It instantly attacks.',
    'Surprised by an unbearable stench, the team turns around to discover the enemies following them.',
    'Something stands up from the burning pile of bodies, refusing to stay dead.',
    'Without notice, the wind briefly opens up the smoke barrier, revealing the group to a hostile presence.',
  ],
  rooms: [
    'The adventurers cover their mouths as they pass a pile of burning remains.',
    'The team enters a frugal encampment, now deserted, with plates still full of food near an extinguished campfire.',
    'The sun, high in the sky, is barely visible though the tick fog.',
    "The ground is scattered by Sha'huri remains, displaying the kind of wounds that no weapon made by men could inflict.",
    'In the distance, an army of undead is marching in casual directions.',
  ],
  wispReward: "A Will o' Wisp descends from the sky. Unlike the others, he doesn't seem hostile. It offers an Orb of Ectoplasm as a gift and departs without a word.",
  explosiveTrap: "A cable holding an Imperial's explosive trap is stepped on.",
  sealTrap: "The team finds themselves on a hidden Sha'huri seal, covered by the ashes. It lightens up, and horrible visions flood the adventurers minds.",
  nothing: "Looking around, you didn't find anything of value.",
} as const

const ETERNAL_BATTLEFIELD_ENCOUNTERS: Array<[number, string[]]> = [
  [20, ['DeathHound']],
  [40, ['Undead']],
  [60, ['UndeadArcher']],
  [90, ['Undead', 'Undead']],
  [120, ['Undead', 'DeathHound']],
  [150, ['Undead', 'UndeadArcher']],
  [180, ['UndeadArcher', 'UndeadArcher']],
  [210, ['Abomination', 'UndeadWarlord']],
  [240, ['Ghoul', 'WillOWisp']],
  [260, ['Undead', 'Undead', 'Undead']],
  [280, ['Undead', 'UndeadArcher', 'Undead']],
  [300, ['UndeadArcher', 'UndeadWarlord', 'UndeadArcher']],
  [320, ['Undead', 'UndeadWarlord', 'Undead']],
  [340, ['UndeadArcher', 'Abomination', 'UndeadArcher']],
  [360, ['DeathHound', 'UndeadWarlord', 'DeathHound']],
  [380, ['Undead', 'WillOWisp', 'Undead']],
  [400, ['Undead', 'Ghoul', 'UndeadArcher']],
  [420, ['DeathHound', 'Ghoul', 'DeathHound']],
  [440, ['Undead', 'Undead', 'Undead', 'Undead']],
  [460, ['Undead', 'UndeadArcher', 'UndeadArcher', 'Undead']],
  [480, ['Undead', 'UndeadArcher', 'Ghoul', 'Undead']],
  [500, ['Undead', 'UndeadArcher', 'DeathHound', 'Undead']],
  [520, ['Undead', 'UndeadWarlord', 'UndeadArcher', 'UndeadArcher']],
  [540, ['Undead', 'UndeadArcher', 'DeathHound', 'UndeadArcher', 'Undead']],
  [560, ['Undead', 'Undead', 'UndeadWarlord', 'Undead', 'Undead']],
  [580, ['Undead', 'WillOWisp', 'UndeadArcher', 'DeathHound', 'Undead']],
]

export function rollEternalBattlefieldEncounter(roll: number) {
  const value = roll * 1_000
  if (value >= 580) return []
  return ETERNAL_BATTLEFIELD_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function enterEternalBattlefieldRoom(roll: number) {
  return indexedLog(ETERNAL_BATTLEFIELD_LOGS.rooms, roll)
}

export function startEternalBattlefieldFight(roll: number) {
  return indexedLog(ETERNAL_BATTLEFIELD_LOGS.encounters, roll)
}

export function killEternalBattlefieldEnemy(event: AreaEventState | null, enemyId: string) {
  if (enemyId !== 'WillOWisp') return { event, logs: [] as string[] }
  const progress = (event?.kind === 'WILL_O_WISP_HUNT' ? event.progress : 0) + 1
  return {
    event: { kind: 'WILL_O_WISP_HUNT', progress } satisfies AreaEventState,
    logs: [`The Will o' Wisp thanks you for freeing it from its mortal body. [Will o' Wisps slain: ${progress}/200]`],
  }
}

export type EternalBattlefieldSearchResult =
  | { type: 'reward'; itemId: 'OrbOfEctoplasm'; event: null }
  | { type: 'trap'; stat: 'Dexterity' | 'Intelligence'; difficulty: number; damage: number; magic: boolean; log: string }
  | { type: 'nothing' }

export function searchEternalBattlefield(event: AreaEventState | null, roll: number): EternalBattlefieldSearchResult {
  if (event?.kind === 'WILL_O_WISP_HUNT' && event.progress >= 200) {
    return { type: 'reward', itemId: 'OrbOfEctoplasm', event: null }
  }
  if (roll < 0.04) {
    return { type: 'trap', stat: 'Dexterity', difficulty: 7, damage: 80, magic: false, log: ETERNAL_BATTLEFIELD_LOGS.explosiveTrap }
  }
  if (roll < 0.08) {
    return { type: 'trap', stat: 'Intelligence', difficulty: 21, damage: 30, magic: true, log: ETERNAL_BATTLEFIELD_LOGS.sealTrap }
  }
  return { type: 'nothing' }
}

export const THE_GOLDEN_CITY_LOGS = {
  enter: "The party crosses the unhinged gates of the empire's capital, setting foot on its marble streets. Once a home for merchants, artisans and intellectuals, the inhabitants have since descended into a feral state. The main body of the army was sent north in a rushed attempt to fight the source of the corruption, leaving here only a few guards and an elite force, albeit stripped to the bone, to protect the Emperor.",
  encounters: [
    'After turning a corner, angry citizen attack the group.',
    'From behind a granite statue, an armed group comes forward.',
    'In front of the team, a mob with bloodshot eyes unsheathes its weapons.',
    'A calm, albeit incomprehensible discourse turn into screams of blind rage as the team approaches its source.',
    'The adventurers turn around, alerted by steps rushing from behind.',
  ],
  rooms: [
    'As the team is walking the marble streets, you hear a cracking sound from inside one of the houses. You enter to investigate.',
    'Under the gaze of the monstrous eye in the sky, the explorers struggle to maintain their resolve.',
    'The adventurers keep walking the city streets, among golden statues with intricate designs.',
    'The screams permeating the air seem to be getting closer, as you advance through the marble streets stained with blood.',
    'A disoriented citizen passes close to the group, his face deformed by madness, yelling incomprehensible questions to the watcher above.',
  ],
  angryEyeStarts: 'Suddenly a dull, static rumble fills the air. You can feel the endless anger of the being above, as its eye widens and the inhabitants enter a delirious state.\nEnemy damage is doubled for the duration.',
  angryEyeEnds: 'Finally the rumble stops. You can see a group of citizen nearby collapsing to the ground, exhausted.',
  healingPriest: "You hear calls for help from a nearby basement. An old priest, who managed to hide before the fall of the city, asks you for some food. After fulfilling his request, he performs a healing spell to restore the team's energies.\nAdventurers' HP are fully restored.",
  eyeDrain: 'The eye focuses on the Adventurers, drawing energy from them. This damage is magic, and reduced by Constitution.',
  ironWedgeTrap: 'As a team member opens a door nearby, an iron wedge swings towards the group.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const THE_GOLDEN_CITY_ENCOUNTERS: Array<[number, string[]]> = [
  [30, ['InsaneCitizen']],
  [60, ['CityWarden']],
  [80, ['InsaneCitizen', 'InsaneCitizen']],
  [100, ['InsaneCitizen', 'CityWarden']],
  [120, ['CityWarden', 'CityWarden']],
  [130, ['CityWarden', 'ImperialGuard']],
  [150, ['CityWarden', 'InsanePriest']],
  [170, ['InsaneCitizen', 'InsaneCitizen', 'InsaneCitizen']],
  [190, ['InsaneCitizen', 'CityWarden', 'InsaneCitizen']],
  [210, ['CityWarden', 'InsaneCitizen', 'CityWarden']],
  [230, ['CityWarden', 'InsaneMerchant', 'CityWarden']],
  [240, ['CityWarden', 'ImperialGuard', 'CityWarden']],
  [250, ['InsaneCitizen', 'ArcaneAssassin', 'InsaneCitizen']],
  [260, ['InsaneCitizen', 'ArcaneAssassin', 'CityWarden']],
  [270, ['CityWarden', 'ImperialMage', 'CityWarden']],
  [280, ['CityWarden', 'ImperialMage', 'ImperialGuard']],
  [300, ['CityWarden', 'InsanePriest', 'CityWarden']],
  [320, ['InsaneCitizen', 'InsanePriest', 'InsaneCitizen']],
  [340, ['CityWarden', 'InsaneCitizen', 'InsaneCitizen', 'CityWarden']],
  [360, ['InsaneCitizen', 'InsaneCitizen', 'InsaneCitizen', 'InsaneCitizen']],
  [370, ['CityWarden', 'ImperialGuard', 'ArcaneAssassin', 'CityWarden']],
  [380, ['InsaneCitizen', 'InsaneCitizen', 'ImperialMage', 'InsaneCitizen']],
  [390, ['CityWarden', 'ImperialMage', 'ArcaneAssassin', 'InsanePriest']],
  [400, ['CityWarden', 'InsanePriest', 'InsanePriest', 'ImperialGuard']],
  [410, ['CityWarden', 'ImperialGuard', 'ImperialMage', 'ArcaneAssassin', 'CityWarden']],
  [420, ['CityWarden', 'InsaneCitizen', 'ImperialMage', 'InsaneCitizen', 'CityWarden']],
  [430, ['CityWarden', 'InsaneCitizen', 'ImperialGuard', 'InsaneCitizen', 'CityWarden']],
  [440, ['CityWarden', 'InsaneCitizen', 'ArcaneAssassin', 'InsaneCitizen', 'CityWarden']],
  [460, ['CityWarden', 'InsaneCitizen', 'InsanePriest', 'InsaneCitizen', 'CityWarden']],
  [470, ['CityWarden', 'ImperialMage', 'InsanePriest', 'ArcaneAssassin', 'CityWarden']],
]

export function rollTheGoldenCityEncounter(event: AreaEventState | null, roll: number) {
  if (event && event.kind !== 'ANGRY_EYE') return []
  const value = roll * 1_000
  if (value >= 470) return []
  return THE_GOLDEN_CITY_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function enterTheGoldenCityRoom(event: AreaEventState | null, roomRoll: number, eventRoll: number) {
  const logs = [indexedLog(THE_GOLDEN_CITY_LOGS.rooms, roomRoll)]
  if (event || eventRoll >= 0.003) return { event, logs }
  return {
    event: { kind: 'ANGRY_EYE', progress: 5 } satisfies AreaEventState,
    logs: [...logs, THE_GOLDEN_CITY_LOGS.angryEyeStarts],
  }
}

export function startTheGoldenCityFight(event: AreaEventState | null, narrativeRoll: number, eventRoll: number) {
  const logs = [indexedLog(THE_GOLDEN_CITY_LOGS.encounters, narrativeRoll)]
  if (event?.kind !== 'ANGRY_EYE') return { event, logs, delirious: false }
  if (eventRoll < 0.25) {
    return { event: null, logs: [...logs, THE_GOLDEN_CITY_LOGS.angryEyeEnds], delirious: false }
  }
  return { event, logs, delirious: true }
}

export type TheGoldenCitySearchResult =
  | { type: 'trap'; stat: 'Dexterity'; difficulty: 20; damage: 50; magic: false; log: string }
  | { type: 'eyeDrain' }
  | { type: 'heal' }
  | { type: 'item'; itemId: 'SilkThread' | 'Redwood' | 'Ivory' | 'GoldScraps' }
  | { type: 'nothing' }

export function searchTheGoldenCity(roll: number): TheGoldenCitySearchResult {
  if (roll < 0.04) return { type: 'trap', stat: 'Dexterity', difficulty: 20, damage: 50, magic: false, log: THE_GOLDEN_CITY_LOGS.ironWedgeTrap }
  if (roll < 0.06) return { type: 'eyeDrain' }
  if (roll < 0.09) return { type: 'heal' }
  if (roll < 0.1) return { type: 'item', itemId: 'SilkThread' }
  if (roll < 0.11) return { type: 'item', itemId: 'Redwood' }
  if (roll < 0.115) return { type: 'item', itemId: 'Ivory' }
  if (roll < 0.117) return { type: 'item', itemId: 'GoldScraps' }
  return { type: 'nothing' }
}

export const BLACKWATER_PORT_LOGS = {
  enter: 'Few people who enter Blackwater Port uninvited get to leave on their feet. Controlled by the fearsome pirates of the nearby Skull Island, because of their agreements with the Empire this was the central commercial hub of the region. It is said that the place was already cursed before the corruption struck.',
  encounters: [
    'Hostile entities appear from behind a nearby lowered sail',
    'A glass bottle cracks nearby. Immediately after, something attack you.',
    'Distracted by the rustling of the waves, you realize almost too late you are being followed.',
    'From below the docks, something emerges. It wants your heads.',
    'The cracking of the wood planks below alerts you of the incoming attack.',
  ],
  rooms: [
    'Walking along the quay, the several docked ships are all in ruins. You swear you saw a candle light in a distant cabin.',
    'A building near the coast crumbled on the paved street. The team is forced to board one of the decaying ship to circumvent the obstacle.',
    "The wood below the team's feet creaks dangerously as they advance through the docks.",
    "A ship sailing far from your position sounds its horns. It's unlikely they saw the expedition… right?",
    'A feral monkey rushes at the team, armed with a dull knife. Suddenly, a huge tentacle emerges from the dark sea and drags it below. This is a dangerous place…',
  ],
  krakenWarning: "It's been a while since you haven't ran into a soul… what could be scaring these ruthless pirates?",
  krakenFight: 'You notice a huge, dark spot just below the surface. What kind of horror lies under the sea?',
  krakenVictory: 'The unknown mass goes back to the dark ocean depths.',
  krakenReward: "A small round object is floating in the water. With some difficulty, the team manages to retrieve an Eye of the Abyss. The monster is far from dead, but it's surely hurt.",
  pearl: 'A scared capuchin monkey emerges from beyond some crates. How long was it hiding there? It hands you a polished oyster pearl, and runs to the woods outside the port.',
  flintlockTrap: 'A tripwire suddenly snaps, triggering nearby flintlock guns aimed at the team.',
  anchorTrap: 'When a team member steps on a hidden pressure plate, a huge anchors falls from above.',
  cursedGoldTrap: 'A pile of gold is sitting in front of the adventurers. As soon as they touch it, the curse activates and it turns into a sticky, corrosive substance.',
  floodingNetTrap: 'A suspended net is released onto the adventurers, ensnaring them. The water in the chamber starts rising.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const BLACKWATER_PORT_ENCOUNTERS: Array<[number, string[]]> = [
  [1, ['Mimic']],
  [11, ['MysteriousTentacle']],
  [50, ['Deckhand']],
  [90, ['Pirate']],
  [110, ['Deckhand', 'Pirate']],
  [130, ['Deckhand', 'Deckhand']],
  [150, ['Pirate', 'Pirate']],
  [170, ['Deckhand', 'PirateLieutenant']],
  [190, ['Pirate', 'PirateLieutenant']],
  [205, ['Deckhand', 'Pirate', 'Deckhand']],
  [220, ['Pirate', 'Deckhand', 'Pirate']],
  [235, ['Pirate', 'Pirate', 'Pirate']],
  [250, ['Pirate', 'PirateLieutenant', 'Pirate']],
  [265, ['Pirate', 'PirateLieutenant', 'Deckhand']],
  [280, ['Pirate', 'PirateCaptain', 'Pirate']],
  [295, ['Pirate', 'PirateCaptain', 'Deckhand']],
  [310, ['Pirate', 'Pirate', 'Pirate', 'Pirate']],
  [325, ['Deckhand', 'Pirate', 'Pirate', 'Deckhand']],
  [340, ['Pirate', 'PirateLieutenant', 'Deckhand', 'Pirate']],
  [355, ['Pirate', 'Pirate', 'Pirate', 'Pirate', 'Pirate']],
  [370, ['Deckhand', 'Pirate', 'Pirate', 'Deckhand', 'Deckhand']],
  [385, ['Deckhand', 'Pirate', 'PirateLieutenant', 'Deckhand', 'Deckhand']],
]

export function enterBlackwaterPortRoom(roll: number) {
  return indexedLog(BLACKWATER_PORT_LOGS.rooms, roll)
}

export function rollBlackwaterPortEncounter(event: AreaEventState | null, roll: number) {
  const value = roll * 1_000
  if (value >= 385) {
    const progress = (event?.kind === 'THE_KRAKEN' ? event.progress : 0) + 1
    return {
      event: { kind: 'THE_KRAKEN', progress } satisfies AreaEventState,
      roster: [] as string[],
      logs: progress === 10 ? [BLACKWATER_PORT_LOGS.krakenWarning] : [] as string[],
    }
  }
  if (event?.kind === 'THE_KRAKEN' && event.progress >= 10) {
    return {
      event: { kind: 'THE_KRAKEN_FIGHT', progress: 0 } satisfies AreaEventState,
      roster: Array.from({ length: 5 }, () => 'MysteriousTentacle'),
      logs: [] as string[],
    }
  }
  return {
    event: null,
    roster: BLACKWATER_PORT_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? [],
    logs: [] as string[],
  }
}

export function startBlackwaterPortFight(event: AreaEventState | null, roll: number) {
  if (event?.kind === 'THE_KRAKEN_FIGHT') return BLACKWATER_PORT_LOGS.krakenFight
  return indexedLog(BLACKWATER_PORT_LOGS.encounters, roll)
}

export type BlackwaterPortSearchResult =
  | { type: 'reward'; itemId: 'EyeOfTheAbyss'; event: null; log: string }
  | { type: 'item'; itemId: 'Pearl' | 'GhostwoodStump' | 'MissingPage'; log?: string }
  | { type: 'trap'; stat: 'Dexterity' | 'Constitution' | 'Intelligence'; difficulty: number; damage: number; magic: boolean; log: string }
  | { type: 'nothing' }

export function searchBlackwaterPort(event: AreaEventState | null, roll: number): BlackwaterPortSearchResult {
  if (event?.kind === 'THE_KRAKEN_FIGHT') {
    return { type: 'reward', itemId: 'EyeOfTheAbyss', event: null, log: BLACKWATER_PORT_LOGS.krakenReward }
  }
  if (roll < 0.03) return { type: 'item', itemId: 'Pearl', log: BLACKWATER_PORT_LOGS.pearl }
  if (roll < 0.06) return { type: 'item', itemId: 'GhostwoodStump' }
  if (roll < 0.11) return { type: 'item', itemId: 'MissingPage' }
  if (roll < 0.16) return { type: 'trap', stat: 'Dexterity', difficulty: 40, damage: 40, magic: false, log: BLACKWATER_PORT_LOGS.flintlockTrap }
  if (roll < 0.21) return { type: 'trap', stat: 'Dexterity', difficulty: 10, damage: 150, magic: false, log: BLACKWATER_PORT_LOGS.anchorTrap }
  if (roll < 0.26) return { type: 'trap', stat: 'Constitution', difficulty: 20, damage: 60, magic: true, log: BLACKWATER_PORT_LOGS.cursedGoldTrap }
  if (roll < 0.31) return { type: 'trap', stat: 'Intelligence', difficulty: 20, damage: 60, magic: false, log: BLACKWATER_PORT_LOGS.floodingNetTrap }
  return { type: 'nothing' }
}

export const FROSTBITE_PEAKS_LOGS = {
  enter: "The team begins the climb of the mountain range known as the Frostbite Peaks, well aware that it's freezing temperature and steep mountain passes are not the greatest danger: these mountains are said to be inhabited by trolls, a primitive humanoid species gifted with inhuman physical capabilities.",
  encounters: [
    'The team notices a pungent smell in the air. Not long after, it discovers why.',
    'There are footsteps in the snow. The trail ends soon to a group of enemies.',
    'Behind a nearby rock, enemies were waiting for you.',
    'Something was perfectly camouflaged in the white snow. It attacks the expedition as soon as they approach.',
    'From a nearby cave opening, a group of enemies emerges to attack the team.',
  ],
  rooms: [
    'A narrow passage forces the expedition to form a line and hug the mountain, being extremely careful as to not fall in the chasm below.',
    'Even with the heaviest equipment, the ice cold climate makes every step harder than the previous.',
    'The expedition stops for a break and lights a fire in a shallow caves opening.',
    'In the distance, a magic pillar going all the way to the sky is visible. You must severe the link as soon as possible.',
    'The team discovers a frozen pile of bodies, perfectly preserved from the cold. Bite marks and sings of blunt force trauma indicate that cold was unlikely the cause of death.',
    "Climbing gear is left suspended on the mountain side, covering it almost entirely. It has to be from the imperial army's passage.",
    'There is imperial equipment scattered all over an extinguished campfire. It must be recent.',
  ],
  blizzardStarts: 'The wind gets suddenly colder. A blizzard descends upon the mountains, greatly reducing visibility and increasing the threat of freezing.',
  blizzardEnds: 'The blizzard has ceased.',
  iceTrap: 'A pressure plate, hidden by snow, makes the ice crack below the teams feet. Soon enough, everyone will be submerged in freezing water.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const FROSTBITE_PEAKS_ENCOUNTERS: Array<[number, string[]]> = [
  [20, ['TrollWhelp', 'TrollWhelp']],
  [40, ['TrollWhelp', 'Troll']],
  [60, ['Troll', 'TrollWarrior']],
  [65, ['IceElemental', 'IceElemental']],
  [85, ['TrollWhelp', 'Troll', 'TrollWhelp']],
  [105, ['Troll', 'TrollWhelp', 'Troll']],
  [125, ['Troll', 'Troll', 'Troll']],
  [145, ['Troll', 'TrollWarrior', 'Troll']],
  [165, ['Troll', 'TrollShaman', 'Troll']],
  [185, ['TrollWarrior', 'Troll', 'TrollWarrior']],
  [205, ['Troll', 'TrollShaman', 'TrollWarrior']],
  [210, ['IceElemental', 'SnowWyvern', 'IceElemental']],
  [230, ['TrollWhelp', 'Troll', 'Troll', 'TrollWhelp']],
  [250, ['TrollWhelp', 'Troll', 'TrollWarrior', 'Troll']],
  [270, ['Troll', 'TrollWarrior', 'TrollShaman', 'Troll']],
  [290, ['TrollWarrior', 'Troll', 'TrollShaman', 'TrollWarrior']],
]

const frostbiteRoomLog = (roll: number) => {
  const thresholds = [0.14, 0.28, 0.43, 0.57, 0.71, 0.85, 1]
  return FROSTBITE_PEAKS_LOGS.rooms[thresholds.findIndex((threshold) => roll < threshold)]
}

export function rollFrostbitePeaksEncounter(roll: number) {
  const value = roll * 1_000
  if (value >= 290) return []
  return FROSTBITE_PEAKS_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function enterFrostbitePeaksRoom(event: AreaEventState | null, roomRoll: number, eventRoll: number) {
  const logs: string[] = [frostbiteRoomLog(roomRoll)]
  let nextEvent = event
  if (!nextEvent && eventRoll < 0.01) {
    nextEvent = { kind: 'BLIZZARD', progress: 0 }
    logs.push(FROSTBITE_PEAKS_LOGS.blizzardStarts)
  } else if (nextEvent?.kind === 'BLIZZARD') {
    const progress = nextEvent.progress + 1
    if (progress > 5) {
      nextEvent = null
      logs.push(FROSTBITE_PEAKS_LOGS.blizzardEnds)
    } else nextEvent = { ...nextEvent, progress }
  }
  return { event: nextEvent, logs, freezeChance: nextEvent?.kind === 'BLIZZARD' ? 0.15 : 0.05 }
}

export function startFrostbitePeaksFight(roll: number) {
  return indexedLog(FROSTBITE_PEAKS_LOGS.encounters, roll)
}

export type FrostbitePeaksSearchResult =
  | { type: 'crate'; chance: number; success: boolean; items: Array<{ itemId: 'Winterwood' | 'FrostmetalOre' | 'IceFiber' | 'FrostCrystal'; stack: number }> }
  | { type: 'item'; itemId: 'Winterwood' | 'IceFiber' | 'FrostmetalOre'; stack: 1 }
  | { type: 'trap'; stat: 'Constitution'; difficulty: 35; damage: 70; magic: false; log: string }
  | { type: 'nothing' }

export function searchFrostbitePeaks(roll: number, bestDexterity: number, successRoll: number, crystalRoll: number): FrostbitePeaksSearchResult {
  if (roll < 0.01) {
    const chance = Math.trunc(bestDexterity / 2)
    const success = successRoll * 100 < chance
    const items: Array<{ itemId: 'Winterwood' | 'FrostmetalOre' | 'IceFiber' | 'FrostCrystal'; stack: number }> = success
      ? [
          { itemId: 'Winterwood', stack: 3 },
          { itemId: 'FrostmetalOre', stack: 3 },
          { itemId: 'IceFiber', stack: 3 },
        ]
      : []
    if (success && crystalRoll < 0.25) items.push({ itemId: 'FrostCrystal', stack: 1 })
    return { type: 'crate', chance, success, items }
  }
  if (roll < 0.03) return { type: 'item', itemId: 'Winterwood', stack: 1 }
  if (roll < 0.05) return { type: 'item', itemId: 'IceFiber', stack: 1 }
  if (roll < 0.06) return { type: 'item', itemId: 'FrostmetalOre', stack: 1 }
  if (roll < 0.1) return { type: 'trap', stat: 'Constitution', difficulty: 35, damage: 70, magic: false, log: FROSTBITE_PEAKS_LOGS.iceTrap }
  return { type: 'nothing' }
}

export const OBSIDIAN_MINES_LOGS = {
  enter: "Abandoned for centuries, these mines were the main source of the Empire for precious obsidian. Now, they are inhabited by all kinds of creatures that dwell in the dark. Legends say an unspeakable horror has inhabited the mines' lowest levels, and when an unnatural darkness arises any explorer should run for their lives.",
  encounters: [
    'Not far from your position, eerie steps on the rocky pavement alert the team.',
    'The limestone pillars concealed hostile presences.',
    'After turning a corner, something notices your presence and attacks you.',
    'Hidden in a dark spot, monsters leap at the expedition.',
    'From a dark pit in the ground, leading to the infested mine depths, monsters are crawling towards the team.',
  ],
  rooms: [
    'Extinguished torches line up the walls of a corridor, way too damp to be ignited again.',
    'An empty abandoned cart lies on rails now full of rust.',
    'Thousand years old stalagmites descend from the rock ceiling, trickling drops of water in a small puddle.',
    "You hear flowing water near you: a small river must have found its way in the mine's crevasses.",
    'The team coasts a precipice leading into the void. Below, tens of skeletons still clad in imperial armors lie suspended into a huge spiderweb.',
    'Mining tools lie abandoned on the ground. An old mining expedition must have met something they were unprepared for.',
    'Imperial soldiers corpses are all over the place. These caverns are dangerous enough to pose a significant threat even to the best equipped army of the known world.',
  ],
  horrorWarning: 'An unspeakable horror noticed your presence.',
  nothing: "Looking around, you didn't find anything of value.",
} as const

const OBSIDIAN_MINES_ENCOUNTERS: Array<[number, string[]]> = [
  [15, ['GiantSpider']],
  [30, ['VampireBat']],
  [45, ['ObsidianGolem']],
  [60, ['LostMiner']],
  [85, ['GiantSpider', 'GiantSpider']],
  [110, ['VampireBat', 'VampireBat']],
  [135, ['GiantSpider', 'VampireBat']],
  [160, ['LostMiner', 'ObsidianGolem']],
  [200, ['GiantSpider', 'VampireBat', 'GiantSpider']],
  [240, ['GiantSpider', 'ObsidianGolem', 'GiantSpider']],
  [280, ['GiantSpider', 'ObsidianGolem', 'VampireBat']],
  [320, ['GiantSpider', 'Beholder', 'GiantSpider']],
  [360, ['GiantSpider', 'Beholder', 'VampireBat']],
  [400, ['GiantSpider', 'Beholder', 'ObsidianGolem']],
  [440, ['VampireBat', 'Beholder', 'ObsidianGolem']],
  [480, ['GiantSpider', 'VampireBat', 'VampireBat', 'GiantSpider']],
  [520, ['GiantSpider', 'GiantSpider', 'VampireBat', 'GiantSpider']],
  [560, ['GiantSpider', 'VampireBat', 'ObsidianGolem', 'GiantSpider']],
  [600, ['ObsidianGolem', 'VampireBat', 'Beholder', 'GiantSpider']],
]

const obsidianRoomLog = (roll: number) => {
  const thresholds = [0.14, 0.28, 0.43, 0.57, 0.71, 0.85, 1]
  return OBSIDIAN_MINES_LOGS.rooms[thresholds.findIndex((threshold) => roll < threshold)]
}

export function enterObsidianMinesRoom(event: AreaEventState | null, roomRoll: number) {
  const logs: string[] = [obsidianRoomLog(roomRoll)]
  if (!event) return { event: { kind: 'UNSPEAKABLE_HORROR', progress: 0 } satisfies AreaEventState, logs }
  if (event.kind === 'UNSPEAKABLE_HORROR_COOLDOWN') {
    const progress = event.progress + 1
    return {
      event: progress < 10
        ? { ...event, progress }
        : { kind: 'UNSPEAKABLE_HORROR', progress: 0 } satisfies AreaEventState,
      logs,
    }
  }
  if (event.kind === 'UNSPEAKABLE_HORROR') {
    const noticed = event.progress >= 50
    const nextEvent = { ...event, progress: event.progress + (noticed ? 5 : 1) }
    if (noticed) logs.push(OBSIDIAN_MINES_LOGS.horrorWarning)
    return { event: nextEvent, logs }
  }
  return { event, logs }
}

export function rollObsidianMinesEncounter(event: AreaEventState | null, roll: number) {
  if (event?.kind === 'UNSPEAKABLE_HORROR' && event.progress >= 70) {
    return {
      event: { kind: 'UNSPEAKABLE_HORROR_COOLDOWN', progress: 0 } satisfies AreaEventState,
      roster: ['PaleHermit'],
    }
  }
  const value = roll * 1_000
  return {
    event,
    roster: value >= 600
      ? []
      : OBSIDIAN_MINES_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? [],
  }
}

export function startObsidianMinesFight(roll: number) {
  return indexedLog(OBSIDIAN_MINES_LOGS.encounters, roll)
}

export function searchObsidianMines(roll: number) {
  return roll < 0.01
    ? { type: 'item' as const, itemId: 'ObsidianChunk' as const }
    : { type: 'nothing' as const }
}

export const ANCIENT_GRAVE_DIGGING_LOGS = {
  enter: 'The team crosses the dark entrance to the ancient Catacombs of the Eternal battlefield. This is an ancient place where, after the agreement of the year fourteen of the eternal war, both factions can give their fallen high-ranking fighters a worthy burial.\nStrangely enough, instead of finding a quiet place, horrible sounds are coming from the lower levels…',
  event: "Without its master's magic to hold the pieces together, the Necrolith crumbles to dust.",
  encounters: {
    3: 'From a nearby wall, reanimated bodies crawl towards the expedition',
    4: 'A nearby wooden door is shattered into a thousand splinters by a towering presence.',
    6: 'In front of them, an undead clad in a golden armor orders its followers into the battle. A curious display of sentience for an undead, the team notes.',
    8: 'From the darkness, the monsters start running at the adventurers.',
    9: 'A second wave of undead leaves the team no respite.',
    11: 'Inside the crypt, a decrepit skeleton holding a metal scepter lets out a frightening scream.',
  } as Record<number, string>,
  rooms: [
    'The adventurers take the first step beyond the open door.',
    'Piles of skulls and bones are piled up on the sides, covering the walls of the corridor.',
    'The air becomes more chilling, the corridor darker. The noises from below are almost unbearable.',
    'The corridor ceiling gets a bit lower.',
    'The group resumes their expedition, taking a flight of stairs down to the lower levels.',
    'The stairs end, and the corridor opens into a large, dark hall.',
    'A voice of unknown origin, as dry as these putrid walls, echoes in the hall. It is not loud enough to understand.',
    'In the center of the circular hall, a pillar made of bones holds up the tall ceiling.',
    'At the end of the now empty hall, an adorned iron door blocks the path.',
    'The voice speaks again, this time a bit clearer. It says "Come forth, my children. Come join my ranks."',
    'The door is unlocked, and reveals a circular crypt.',
    "The room is now empty, and the screams have stopped. There isn't really a way to kill a lich, but it should stay quiet for a while. The team turns back and reaches for the surface.",
  ],
} as const

export function enterAncientGraveDiggingRoom(progress: number) {
  return {
    log: ANCIENT_GRAVE_DIGGING_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 12,
  }
}

export function rollAncientGraveDiggingEncounter(progress: number) {
  if (progress === 3) return ['Undead', 'Undead', 'UndeadWarlord', 'Undead', 'Undead']
  if (progress === 4) return ['Undead', 'UndeadWarlord', 'Abomination', 'UndeadWarlord', 'Undead']
  if (progress === 6) return ['UndeadArcher', 'UndeadWarlord', 'UndeadGeneral', 'UndeadWarlord', 'UndeadArcher']
  if (progress === 8) return ['DeathHound', 'UndeadWarlord', 'UndeadWarlord', 'UndeadWarlord', 'DeathHound']
  if (progress === 9) return ['UndeadWarlord', 'UndeadWarlord', 'UndeadGeneral', 'UndeadWarlord', 'UndeadWarlord']
  if (progress === 11) return ['Necrolith', 'KabarTheRotten', 'Necrolith']
  return []
}

export function startAncientGraveDiggingFight(progress: number) {
  return ANCIENT_GRAVE_DIGGING_LOGS.encounters[progress] ?? null
}

export function killAncientGraveDiggingEnemy(enemyId: string, enemies: Array<{ enemyId: string; hp: number }>) {
  if (enemyId !== 'KabarTheRotten') return { logs: [] as string[] }
  const necroliths = enemies.filter((enemy) => enemy.enemyId === 'Necrolith' && enemy.hp > 0)
  for (const necrolith of necroliths) necrolith.hp = 0
  return { logs: necroliths.map(() => ANCIENT_GRAVE_DIGGING_LOGS.event) }
}

export const THE_SLIME_POND_LOGS = {
  enter: 'Deep within the Enchanted Forest, after opening your way through a mostly invisible, secluded path, the expedition finds themselves in front of an eerie pond. It looks quite peaceful: the creatures of the forest seem to have given respite from their relentless chase, and the atmosphere gives off magic vibes. It must have something to do with the extremely vivid color, or the perceived viscosity of the water in the pond, almost too thick.',
  encounters: {
    2: 'The slimes attack!',
    3: 'The slimes jump down from the trees, as the team prepares for the fight.',
    4: 'Surrounded, the adventurers raise their weapons once again.',
    6: 'With unnatural agility, it makes a higher leap and lands exactly in front of the team.',
  } as Record<number, string>,
  rooms: [
    'After removing the last remaining twigs obstructing the way, the team moves towards the pond to investigate.',
    "Almost invisible below the body of water, creatures unlike anything they've seen before swarm the expedition.",
    'Turning around, the team discovers that the trees around the pond are swarming with slimes, coming out of their hideouts to aid their companions.',
    'Without a break, the neverending stream of slimes keep coming out of the water and down from the trees.',
    'In the distance, thumping sounds of growing intensity make the leaves tremble on the branches. The army of slimes stopped their assault, and watches the group from afar.',
    'As the thumping increases, the adventurers spot something in the distance: an iridescent mass, adorned with royal attire, is slowly jumping towards the group.',
    "The King of the Slimes slowly loses consistency, becoming almost liquid. It seeps into the ground like rainwater leaving no trace, while the other slimes scatter in panic. You wonder if these creatures were peaceful before the corruption, and will make sure to report your findings to the kingdom's taxonomists to understand more of their nature.",
  ],
} as const

export function enterTheSlimePondRoom(progress: number) {
  return {
    log: THE_SLIME_POND_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 7,
  }
}

export function rollTheSlimePondEncounter(progress: number, rng: () => number = Math.random) {
  if (progress === 6) return ['SlimeKing']
  if (progress !== 2 && progress !== 3 && progress !== 4) return []
  return Array.from({ length: progress + 1 }, () => {
    const roll = rng()
    if (roll < 0.695) return 'Slime'
    if (roll < 0.795) return 'FireSlime'
    if (roll < 0.895) return 'ElectricSlime'
    if (roll < 0.995) return 'FrozenSlime'
    return 'VoidSlime'
  })
}

export function startTheSlimePondFight(progress: number) {
  return THE_SLIME_POND_LOGS.encounters[progress] ?? null
}

export const DIVINE_ARCHEOLOGY_LOGS = {
  enter: "After days of travels to the far East region of the Sha'huri desert, the colossal silhouette of a pyramid emerges from the horizon. Despite the current events its condition seems pristine, its apex still glistening with a golden sheen.",
  encounters: {
    2: "A small Sha'huri group, likely standing guard to the sacred site, spots the team.",
    4: 'The ancient defense system activates once again, and warriors emerge from the sand. They look way more threatening than the ones you have met before.',
    5: 'Another wave of statues emerges from the sand, still gaining consistency at the time they first strike you.',
    6: 'The relentless stream of sentient sand keeps coming without a break.',
    9: "In the middle of the corridor, a huge figure is standing guard. It is unlike any Sha'huri warrior you have seen before: height reaching almost four meters, wielding four swords, one for each of its hands.",
    12: 'In the chamber, right at the center, a creature of unfathomable origin is standing perfectly still. It is unlike anything the team has seen before, inspiring deep rooted awe and overwhelming terror at the same time. When its eye opens, everyone present feels like their very soul was being peered into.',
  } as Record<number, string>,
  rooms: {
    1: 'The adventurers navigate through the dunes, their boots sinking into the warm sand. Slowly, the pyramid is getting closer.',
    2: 'The rhythmic crunch of footsteps harmonizes with the desert winds, as the expedition starts to make out the intricate block pattern that makes up the building.',
    3: 'The sound of blaring trumpets is heard in the distance, and the sand starts twisting below your feet. This is unlikely to be a good sign.',
    4: "Sha'huri deterrent system activated, threat level: EXTINCTION.",
    5: "Sha'huri deterrent system activated, threat level: EXTINCTION.",
    6: "Sha'huri deterrent system activated, threat level: EXTINCTION.",
    7: 'The trumpet sound finally stop, and the sand is once again at rest.',
    8: 'After some more minutes, the team is getting close to the pyramid. As they advance, the immense size of the construction becomes more apparent.',
    9: 'The expedition finally reaches the pyramid base. There is no door, just a wide opening on one of the sides that leads to a long corridor. Light is coming from ardent torches that lines the two walls.',
    10: 'The team walks deeper into the corridor that seems to never end, being thankful for the torches that make the travel less frightening.',
    11: 'A giant stone door blocks the path of the expedition. It is sealed shut, and bears the symbol of a triangle with an open eye inscribed inside.',
    13: 'Cracks starts forming on the alien being surface, as its eye look around frantically, almost scared. Suddenly, it explodes in a thousand pieces, leaving almost no trace. Almost, because on the ground lies a strange trinket…',
  } as Record<number, string>,
  doorClosed: "Together, the adventurers push the door with all their strength. However, it doesn't seem to move. [Global Constitution required: 200]",
  doorOpen: 'Together, the adventurers push the door with all their strength. Slowly, it opens wide to reveal a single, inner chamber.',
} as const

export function enterDivineArcheologyRoom(progress: number, totalConstitution: number) {
  if (progress === 12) {
    const opened = totalConstitution >= 200
    return {
      log: opened ? DIVINE_ARCHEOLOGY_LOGS.doorOpen : DIVINE_ARCHEOLOGY_LOGS.doorClosed,
      event: opened ? { kind: 'PYRAMID_DOOR_OPEN', progress: 0 } satisfies AreaEventState : null,
      completed: !opened,
    }
  }
  return {
    log: DIVINE_ARCHEOLOGY_LOGS.rooms[progress] ?? '',
    event: null,
    completed: progress >= 13,
  }
}

export function rollDivineArcheologyEncounter(
  progress: number,
  maxProgress: number,
  doorOpen: boolean,
  hasEyesOfTheSwordsman: boolean,
  hasDivineZygote: boolean,
) {
  if (progress < maxProgress) return []
  if (progress === 2) return ['ShahuriWarrior', 'ShahuriArcher', 'ShahuriMage', 'ShahuriArcher', 'ShahuriWarrior']
  if (progress === 4 || progress === 5 || progress === 6) return Array.from({ length: 5 }, () => 'SandDemon')
  if (progress === 9 && !hasEyesOfTheSwordsman) return ['ShaKireFirstSwordsman']
  if (progress === 12 && doorOpen && !hasDivineZygote) return ['ShaTheHiddenGod']
  return []
}

export function startDivineArcheologyFight(progress: number) {
  return DIVINE_ARCHEOLOGY_LOGS.encounters[progress] ?? null
}

export const IMPERIAL_RESCUE_LOGS = {
  enter: 'In the center of the Golden City, a dilapidated Imperial Palace overlooks the surrounding area. While this expedition is a significant deviation from your voyage to the north, it is your duty to try to rescue the Emperor of a friendly nation. Therefore, King Roderic gave your guild the order to do everything you can to bring His Majesty to safety.',
  encounters: {
    1: 'A crowd of enraged citizen fills the courtyard. They attack you.',
    2: 'Another wave comes at you with bloodshot eyes.',
    3: 'Another group engages. They want your heads.',
    6: 'A group of guards is wandering the corridors aimlessly. As soon as they see you, they engage the fight.',
    7: 'Another team of sentinels attacks you.',
    9: 'The guests, probably struck by the corruption during the cursed meal, are still sitting at the table.',
    11: 'A team of palace guards is roaming before the door.',
    14: 'An inhumane scream comes from above the opened door, behind the team. Looking up, a hideous creature, still dressed in royal insignia, leaps down from the ceiling.',
  } as Record<number, string>,
  rooms: [
    'The team reaches the entrance of the huge courtyard. The Eye above is looking interested.',
    'Marble statues with golden detail stand all over the perimeter, an immortal testament of the opulence of this court.',
    'In the middle of the courtyard an adorned fountain, now out of function, acts as the central decoration.',
    'At the end of the courtyard, a wide granite staircase leads up to the entrance of the Palace.',
    'One side of the door is halfway open. The expedition enters the palace.',
    'On the ground, a red carpet with golden edges extends all the way through the intertwined corridors.',
    'The team advances through rows of marble statues, recognizing at least a couple renowned generals.',
    'At the end of the corridor, the team finds a locked door, intricately decorated but easy to break down.',
    'The adventurers find themselves in a large dining room, with a long laden table.',
    'Looking at the table, they notice the food is black with mold: it must have lied there for weeks.',
    'At the end of the room, an open door leads to a short corridor. It leads to a single door, at its end.',
    'The door bears the seal of the Clovis family. It is closed, but unlocked.',
    "The open door reveals the Emperor's Throne Room. It has been thrashed, without a single furniture being intact or in it's supposed place.",
    'The golden throne, still in its place, is empty.',
    'With the Emperor finally at rest, the team leaves the forsaken palace to report the events to the King.',
  ],
} as const

export function enterImperialRescueRoom(progress: number) {
  return {
    log: IMPERIAL_RESCUE_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 15,
  }
}

export function rollImperialRescueEncounter(progress: number, maxProgress: number, hasSkeletonKey: boolean) {
  if (progress < maxProgress) return []
  if (progress === 1) return ['InsaneCitizen', 'InsaneCitizen', 'CityWarden', 'InsaneCitizen', 'InsaneCitizen']
  if (progress === 2) return ['InsaneCitizen', 'CityWarden', 'InsaneMerchant', 'CityWarden', 'InsaneCitizen']
  if (progress === 3) return ['CityWarden', 'InsaneCitizen', 'ImperialGuard', 'InsaneCitizen', 'CityWarden']
  if (progress === 6) return Array.from({ length: 5 }, () => 'ImperialGuard')
  if (progress === 7) return ['ImperialGuard', 'ImperialGuard', 'ImperialMage', 'ImperialGuard', 'ImperialGuard']
  if (progress === 9) return ['InsaneCitizen', 'InsaneMerchant', 'InsaneCitizen', 'InsaneMerchant', 'InsaneCitizen']
  if (progress === 11) return ['ImperialGuard', 'ImperialMage', 'ImperialGuard', 'ImperialMage', 'ImperialGuard']
  if (progress === 14 && !hasSkeletonKey) return ['EmperorClovisXXVIII']
  return []
}

export function startImperialRescueFight(progress: number) {
  return IMPERIAL_RESCUE_LOGS.encounters[progress] ?? null
}

export const THE_CULTIST_REBELS_LOGS = {
  enter: "A dark dilapidated manor stands out before you. It's dimensions are modest, part of the roof has collapsed and the snow has covered the internal floor. Four tall metal coils stand at the corners, pointing directly into the sky. The expedition walks through the broken front door.",
  encounters: {
    lesserTitan: 'A single entity stands in the middle of the room, almost as tall as the ceiling.',
    crusaders: 'Soldiers dressed in white and red garments are wandering aimlessly inside the room.',
    cultists: 'Two hooded cultists were waiting in the room. They start muttering something in an unknown language.',
    primordialTitan: 'The construct wakes up, and effortlessly breaks its chains with supernatural strength.',
  },
  rooms: {
    1: 'Two staircases lead to the upper floor, filled with snow and broken, old furniture.',
    2: 'On the first floor, there seems to be nothing valuable or interesting.',
    3: 'In a corner, near a frozen fireplace, the team notices a closed trapdoor. It opens without too much effort.',
    4: 'A narrow flight of stairs leads in the depths of the building. After minutes of walking, the team emerge in a completely different setting.',
    5: 'The adventurers finds themselves in a square room with four doors at the sides. The floor and walls are made of white marble.',
    lab: 'This room, identical to the others, is completely empty except for a drawer in the corner. Upon it lies medical equipment and some notes on a piece of paper.',
    lockedDoor: "The team chooses one of the doors, and find themselves in a square room. It's empty, and there are only two other doors: one locked, bearing the symbol of a skull with red eyes, the other unlocked.",
    bypass: 'Without a way to open the locked door, the expedition chooses to advance through the unlocked one.\nThey find themselves in a square room, with three doors on the sides.',
    cultistRoom: 'The next room is much bigger than the others, without any other doors and fully furnished. A dining table lies in the center, and three beds are placed against the left wall.',
    ending: 'Victorious, the team starts their ascent towards the surface.',
    skeletonUnlock: 'Noticing a resemblance between the symbol and the handle of the Skeleton Key, they try to see if it fits. It does! The door unlocks.',
    titanRoom: 'The next room is perfectly circular. In the middle, a gigantic construct made of white marble is standing, surrounded by magic devices and held in place by enormous steel chains.',
  },
  navigation: [
    'The team chooses the door on the left, and find themselves in a square room identical to the previous.',
    'The team chooses the door straight ahead, and find themselves in a square room identical to the previous.',
    'The team chooses the door on the right, and find themselves in a square room identical to the previous.',
  ],
  notes: [
    'The notes read:\n\nExperiment n.1:\nSubjects: 2 farmers, male and female, taken last night from the village in the eartern valley. Low to moderate psyonic capabilities.\nResult: failure, two lesser titans produced.',
    'The notes read:\n\nExperiment n.2:\nSubject: 1 merchant, male, took shelter in the upper ruins during a storm.\nResult: failure, one lesser titan produced.',
    "The notes read:\n\nExperiment n.3:\nSubject: 1 cultist, female. Beatrix volunteered to see if magic abilities improve success rates.\nResult: failure, one lesser titan produced. Why you didn't listen…",
    "The notes read:\n\nExperiment n.4:\nSubject: 1 traveler, male, likely a fugitive. Was found in the upper ruins with a purse of gold and no supplies.\nResult: Success! The body merged with the Primordial, its Keveral's field increased indicating a proportional increase in power.",
    'The notes read:\n\nExperiment n.5:\nSubject: 1 soldier, male, part of the umpteenth crusade sent by the eastern kingdoms. Low psyonic capabilities.\nResult: failure, one lesser titan produced.',
  ],
} as const

export function enterTheCultistRebelsRoom(
  progress: number,
  event: AreaEventState | null,
  hasEquippedSkeletonKey: boolean,
  rng: () => number = Math.random,
): { event: AreaEventState | null; log: string; completed: boolean } {
  if (progress >= 1 && progress <= 4) {
    return { event, log: THE_CULTIST_REBELS_LOGS.rooms[progress as 1 | 2 | 3 | 4], completed: false }
  }
  if (progress === 5) {
    return {
      event: { kind: 'HALLS_EXPLORATION', progress: 0 } satisfies AreaEventState,
      log: THE_CULTIST_REBELS_LOGS.rooms[5],
      completed: false,
    }
  }
  if (!event) return { event: null, log: '', completed: true }
  if (event.kind === 'HALLS_SKELETON_DOOR') {
    if (event.progress === 0) return { event: { ...event, progress: 1 }, log: THE_CULTIST_REBELS_LOGS.rooms.skeletonUnlock, completed: false }
    if (event.progress === 1) return { event: { ...event, progress: 2 }, log: THE_CULTIST_REBELS_LOGS.rooms.titanRoom, completed: false }
    if (event.progress === 2) return { event: { ...event, progress: 3 }, log: THE_CULTIST_REBELS_LOGS.rooms.ending, completed: true }
    return { event, log: '', completed: false }
  }
  if (event.kind !== 'HALLS_EXPLORATION') return { event, log: '', completed: false }
  if (event.progress === 3) return { event: { ...event, progress: 4 }, log: THE_CULTIST_REBELS_LOGS.rooms.lab, completed: false }
  if (event.progress === 4) {
    const notesRoll = rng()
    const noteIndex = notesRoll <= 0.2 ? 0 : notesRoll <= 0.4 ? 1 : notesRoll <= 0.6 ? 2 : notesRoll <= 0.8 ? 3 : 4
    return { event: { ...event, progress: 5 }, log: THE_CULTIST_REBELS_LOGS.notes[noteIndex], completed: false }
  }
  if (event.progress === 8) {
    return {
      event: hasEquippedSkeletonKey
        ? { kind: 'HALLS_SKELETON_DOOR', progress: 0 }
        : { ...event, progress: 9 },
      log: THE_CULTIST_REBELS_LOGS.rooms.lockedDoor,
      completed: false,
    }
  }
  if (event.progress === 9) return { event: { ...event, progress: 10 }, log: THE_CULTIST_REBELS_LOGS.rooms.bypass, completed: false }
  if (event.progress === 13) return { event: { ...event, progress: 14 }, log: THE_CULTIST_REBELS_LOGS.rooms.cultistRoom, completed: false }
  if (event.progress === 14) return { event: { ...event, progress: 15 }, log: THE_CULTIST_REBELS_LOGS.rooms.ending, completed: true }
  const navigationRoll = rng()
  const navigationIndex = navigationRoll <= 0.333 ? 0 : navigationRoll <= 0.666 ? 1 : 2
  return {
    event: { ...event, progress: event.progress + (rng() < 0.5 ? 1 : 0) },
    log: THE_CULTIST_REBELS_LOGS.navigation[navigationIndex],
    completed: false,
  }
}

const CULTIST_HALL_ENCOUNTERS = new Set([1, 2, 3, 6, 7, 8, 11, 12, 13])

export function rollTheCultistRebelsEncounter(event: AreaEventState | null, rng: () => number = Math.random) {
  if (!event) return []
  if (event.kind === 'HALLS_EXPLORATION' && event.progress === 14) return ['Claris', 'Thorvus']
  if (event.kind === 'HALLS_SKELETON_DOOR' && event.progress === 2) return ['PrimordialTitan']
  if (event.kind !== 'HALLS_EXPLORATION' || !CULTIST_HALL_ENCOUNTERS.has(event.progress)) return []
  const roll = rng()
  if (roll < 0.4) return []
  if (roll < 0.75) return ['LesserTitan']
  return Array.from({ length: 5 }, () => 'Crusader')
}

export function startTheCultistRebelsFight(event: AreaEventState | null, enemyCount: number) {
  if (event?.kind === 'HALLS_EXPLORATION' && event.progress === 14) return THE_CULTIST_REBELS_LOGS.encounters.cultists
  if (event?.kind === 'HALLS_SKELETON_DOOR' && event.progress === 2) return THE_CULTIST_REBELS_LOGS.encounters.primordialTitan
  return enemyCount === 1 ? THE_CULTIST_REBELS_LOGS.encounters.lesserTitan : THE_CULTIST_REBELS_LOGS.encounters.crusaders
}

export const THE_LOST_EXPEDITION_LOGS = {
  enter: 'After navigating countless tunnels and winding passages deep into the mines, the expedition finally arrives at a submerged lake. The suffocating darkness obscures their surroundings, but undeterred, the team presses forward, wading cautiously through the knee-deep water.',
  encounters: {
    2: 'The shadow, disturbed by the light, turns with a twitching movement.',
    4: 'Suddenly, several miners are encircling the group.',
    8: 'The hideous inhabitants of the temple immediately attack.',
    9: 'More deformed creatures swarm the team.',
    10: "Following their leader's orders, the monstrous creatures attack.",
    14: 'The creatures notice the explorers.',
    trapMiners: 'Two miners attack.',
    apostle: 'The team is shaken by the most horrible roar they have ever heard.',
  } as Record<number | 'trapMiners' | 'apostle', string>,
  rooms: [
    'The expedition moves forward with caution. In the distance, the deep, haunting notes of an organ reverberate through the cavern, sending shivers down your spine. You can’t help but dread what might be hiding in the suffocating darkness.',
    'Suddenly, torches reveal a hunched shadow looming over the water.',
    'Wondering what miners from the centuries old expedition are doing here, the team keeps walking in the shallow waters.',
    'After a moment, the sound of more footsteps splashing through the water echoes nearby.',
    'The sound of footsteps in the water now echoes from all directions. The expedition quickens its pace.',
    'A faint silhouette of a distant building appears ahead. The team sprints toward it, hoping to find shelter from the miners lurking in the shadows.',
    "As the building comes into clearer view, the team realizes it's an ancient temple. It's adorned with strange, unsettling decorations. The organ sounds appear to come from within.",
    'Without hesitation, the team forces open the heavy stone door and slams it shut behind them. The organ music abruptly stops.',
    'A door bursts open from a side of the main room.',
    "The team proceeds toward the altar at the end of the room. A tall figure, dressed in what seems like a mockery of a priest's attire, whispers rapidly in an unknown language.",
    'Behind the altar, a wooden door bearing strange symbols stands partially open. The team proceeds through it.',
    'The door leads to a long corridor, swallowed by total darkness like the rest of the temple.',
    'The corridor opens into a vast room, where cultists are immersed in some kind of ritual. A large magic portal, leading into the vast emptiness of space, is open on the roof.',
    'Beneath the portal, an ethereal vision rests on the ground, gradually pulling small amounts of black matter from above.',
    'Without a way to close the portal, the team leaves the ancient temple.',
  ],
  trapRooms: {
    1: 'One of the adventurers accidentally triggers a hidden pressure plate. A trapdoor opens beneath them, and they plummet several meters, landing hard on a stone pavement.',
    2: 'Unable to climb back up, the team is forced to descends into the bowels of the temple through a spiral staircase.',
    3: 'The descent lasts for minutes, then stretches into hours. The stairs appear to be carved from a single, endless stone block. The effort to create this passage must have required an unimaginable amount of resources.',
    4: "The team continues descending the unchanging stairs, questioning whether there’s an end in sight. Such a deep passage couldn't have been built merely to expand the temple above, but to reach a specific, previously isolated destination.",
    5: "As they wonder what awaits them at the bottom of the stairs, the adventurers' conversation is cut short by the sound of another set of footsteps growing closer.",
    6: 'Finally, the stairs open into a short corridor.',
    7: 'At the end of the corridor lies a vast, semi-spherical room. In the center, something that defies human comprehension is being fed the corpse of a massive beholder by obedient servants.',
    8: "Shaken by the terrible monster they just vanquished, the team begins to climb the endless stairs towards the temple's entrance.",
  } as Record<number, string>,
} as const

export function enterTheLostExpeditionRoom(progress: number, event: AreaEventState | null, rng: () => number = Math.random) {
  if (!event) {
    return {
      event: progress === 11 && rng() < 0.2
        ? { kind: 'LOST_EXPEDITION_TRAPDOOR', progress: 0 } satisfies AreaEventState
        : null,
      log: THE_LOST_EXPEDITION_LOGS.rooms[progress - 1] ?? '',
      fallDamage: false,
      completed: progress >= 15,
    }
  }
  if (event.kind !== 'LOST_EXPEDITION_TRAPDOOR') return { event, log: '', fallDamage: false, completed: false }
  const current = event.progress
  return {
    event: { ...event, progress: Math.min(8, current + 1) },
    log: THE_LOST_EXPEDITION_LOGS.trapRooms[current] ?? '',
    fallDamage: current === 1,
    completed: current === 8,
  }
}

export function rollTheLostExpeditionEncounter(progress: number, event: AreaEventState | null) {
  if (event?.kind === 'LOST_EXPEDITION_TRAPDOOR') {
    if (event.progress === 5) return ['LostMiner', 'LostMiner']
    if (event.progress === 7) return ['LostMiner', 'LostMiner', 'TekeliLiFirstApostle', 'LostMiner', 'LostMiner']
    return []
  }
  if (progress === 2) return ['LostMiner']
  if (progress === 4) return Array.from({ length: 5 }, () => 'LostMiner')
  if (progress === 8) return ['BleakDisciple', 'EldritchHound', 'BleakDisciple']
  if (progress === 9) return ['EldritchHound', 'EldritchHound', 'BleakDisciple', 'EldritchHound', 'EldritchHound']
  if (progress === 10) return ['EldritchHound', 'BleakDisciple', 'BleakDeacon', 'BleakDisciple', 'EldritchHound']
  if (progress === 14) return ['BleakDisciple', 'AvatarOfTheAncient', 'BleakDisciple']
  return []
}

export function startTheLostExpeditionFight(progress: number, event: AreaEventState | null) {
  if (event?.kind === 'LOST_EXPEDITION_TRAPDOOR') {
    if (event.progress === 5) return THE_LOST_EXPEDITION_LOGS.encounters.trapMiners
    if (event.progress === 7) return THE_LOST_EXPEDITION_LOGS.encounters.apostle
    return null
  }
  return THE_LOST_EXPEDITION_LOGS.encounters[progress] ?? null
}

export const SLEEPING_PLANET_LOGS = {
  enter: 'The machine lights up, and the molten core reveals a passage into an eerie world teeming with alien flora. The expedition steps through the portal and finds itself surrounded by towering mushrooms, as tall as trees.',
  encounters: {
    5: '"You have to leave, or we\'ll feast on your bones"',
    8: '"This was your last chance"',
    10: '"You will not wake it. Leave now, and don\'t interfere!"',
    12: '"We won\'t allow you to hurt the Singularity!"',
    14: 'The frequency of the sound intensifies. It is now almost unbearable.',
  } as Record<number, string>,
  rooms: [
    'As they explore, strange patterns, resembling living animals, begin to flicker in rhythmic pulses.',
    'A deep rumbling echoes through the air. With each swell of sound, the visions grow more vivid.',
    'Drawn to the source of the sound, the expedition pushes forward.',
    'The images of three horses materialize before the adventurers.',
    '"You have to help them. Their suffering is immeasurable"',
    'Baffled, the adventurers continue toward the sound.',
    'A different image materializes, this time of a giant flying beast.',
    '"They escaped wars, poverty, suffering. The most powerful mages of this universe gave everything to become One."',
    'A swarm of incorporeal insects surrounds the expedition.',
    '"You have to find a way to free it. No one deserves its destiny."',
    'An enormous titan, sat behind an immense forge, stares down at the expedition.',
    '"And then, when death was abolished and defenses were lowered, the Serpent manifested in our skies, and started eating it. Forever.',
    'The Singularity lies in a valley ahead.',
    'Deprived of its dreams, the Singularity twitches erratically.',
    'The Singularity stops moving, deprived of its energy. It goes back to a peaceful sleep.',
  ],
} as const

export function enterSleepingPlanetRoom(progress: number) {
  return {
    log: SLEEPING_PLANET_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 15,
  }
}

export function rollSleepingPlanetEncounter(progress: number) {
  if (progress === 5) return Array.from({ length: 3 }, () => 'DreamwroughtBeast')
  if (progress === 8) return ['DreamwroughtBeast', 'DreamwroughtDragon', 'DreamwroughtBeast']
  if (progress === 10) return ['DreamwroughtBeast', 'DreamwroughtSwarm', 'DreamwroughtBeast']
  if (progress === 12) return ['DreamwroughtBeast', 'DreamwroughtForge', 'DreamwroughtBeast']
  if (progress === 14) return ['Singularity']
  return []
}

export function startSleepingPlanetFight(progress: number) {
  return SLEEPING_PLANET_LOGS.encounters[progress] ?? null
}

export const KAUNIS_LOGS = {
  enter: 'The machine lights up, and the molten core reveals a passage to a desolate land, with a sky darkened by ominous clouds. The expedition steps through and arrives at the edge of a dilapidated village, marked by strange, unfamiliar architecture.',
  encounters: {
    1: 'A wave of mutated horrors surges down the road.',
    6: 'It crushes the old man in an instant and turn toward the adventurers.',
    9: 'Something else approaches, inhumanly fast.',
    10: 'They direct their attention at the intruders.',
    11: "The manor's security force descends from all directions.",
    12: 'Instantly, they sprint down to attack.',
    16: 'They raise from their seats and attack.',
  } as Record<number, string>,
  rooms: [
    'Rag-clad villagers glance at the newcomers and wave them away in fear. Moments later, they all retreat inside their homes.',
    'An old man emerges from one of the crumbling houses. He warns that others will come soon, then begins recounting the story of his world: a utopia turned nightmare.',
    'He speaks of the discovery of immortality, and of the mental decay triggered by the repeated return of the Black Serpent.',
    'Of the discovery of the Panacea, able to stop the decline and allowing the ruling class to cling to power indefinitely.',
    'And of the lie begotten by their fear, which created a demented government guided by madness, focused on creating the most advanced forms of repression disregarding all ethics.',
    'From behind a building, a large monster emerges along with its following.',
    'A red castle, enveloped by lightnings, looms at the horizon.',
    'The adventurers continue down winding country roads, surrounded by barren fields.',
    'The march is long and uneventful, until they spot something far away.',
    'The gates of a grand manor draw near. On the front steps, a group of disfigured mutants stands guard.',
    "Inside, the manor's main hall is decrepit. Piles of broken furniture are stacked against one wall.",
    'On the wide marble staircase, more writhing masses of flesh await.',
    'A long corridor stretches above the stairs. The throne room must be close.',
    "At the corridor's end stands a massive cracked door, half-open.",
    'Beyond the door, the Royal Council sits around a table, strewn with rotten food and shattered bottles.',
    'A monstrous figure wearing a rusted crown, once a man, now something else, calls for the guards. No one answers.',
    'The council members lie on the ground, with the mysterious technology already repairing their wounds. The adventurers start their travel back to the portal.',
  ],
} as const

export function enterKaunisRoom(progress: number) {
  return {
    log: KAUNIS_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 17,
  }
}

export function rollKaunisEncounter(progress: number) {
  if (progress === 1) return Array.from({ length: 3 }, () => 'Necrobot')
  if (progress === 6) return ['Necrobot', 'Necrobot', 'Enforcer', 'Necrobot', 'Necrobot']
  if (progress === 9) return ['Phantasm']
  if (progress === 10) return ['Necrobot', 'Enforcer', 'Enforcer', 'Necrobot']
  if (progress === 11) return ['Necrobot', 'Necrobot', 'Cerebrum', 'Necrobot', 'Necrobot']
  if (progress === 12) return ['Necrobot', 'Phantasm', 'Necrobot']
  if (progress === 16) return ['ChiefScientistAva', 'KingAino', 'FirstMinisterAtos']
  return []
}

export function startKaunisFight(progress: number) {
  return KAUNIS_LOGS.encounters[progress] ?? null
}

export const THE_TOWER_LOGS = {
  enter: 'The machine lights up, and the molten core reveals a passage to the interior of a building. It is lavishly furnished and impeccably maintained, beyond the large window on the wall, the cold void of space stretches endlessly.',
  heal: "Adventurer's HP have been replenished",
  resurrect: 'An Adventurer was resurrected',
  encounters: {
    8: '"The first bearer of the curse, who doomed countless worlds to eternal hunger."',
    12: '"The mother of herself; a blasphemy against life, death, and causality."',
    16: '"A being of pure burning hatred, rejected by the Otherworld out of sheer fear."',
    22: '"Once thought to be a moon of the prosperous planet of Neferis. The inhabitants only had a couple minutes to acknowledge their mistake."',
    26: '"A benevolent god of enlighted people, subdued by the trickery of those hungry for power"',
    31: '"A wound on this universe, barely contained but never healed. Eternal glory will come to its saviour, unending suffering to everything else."',
    35: '"A piece of art that sculpts itself, and you, and me, and everything else. Its downfall, the laws it forged to bind us."',
  } as Record<number, string>,
  rooms: {
    1: 'The puzzled adventurers look around, wondering how could this mansion be floating through space and what purpose it might serve.',
    2: 'Suddenly, a disembodied voice breaks the silence.',
    3: '"Welcome, visitors, to the Tower."',
    4: '"This place served as a cosmic prison for countless ages. As you may have guessed, it could not escape Yadalbaoth\'s corruption."',
    5: '"Each prisoner here is confined for a different reason—deceit, betrayal, the extermination of whole civilizations or, in some cases, as the victim of a cruel setup."',
    6: '"As per our rules, visitors may challenge them. I will now present your first opponent."',
    7: 'A heavy door opens on the left wall.',
    8: 'An elegant but otherwise unremarkable man enters the hall.',
    9: 'After being defeated, he silently returns to his cell.',
    11: 'A second door opens on the left wall.', 12: 'A massive golden-feathered bird flies into the room.', 13: 'A pile of dust is swept away by a sentient broom.',
    15: 'A third door opens on the left wall.', 16: 'A knight clad into a black armor, missing its head, walks out.', 17: 'An invisible force drags the unconscious knight back to its cell.',
    19: 'The first door on the right wall opens into an enormous chamber.', 20: '"For… logistical reasons, I\'ll have to ask you to enter the cell yourselves this time."', 21: 'The adventurers step in, discovering an enormous room with a sky-high ceiling.', 22: 'In the darkness, an immense mass is stirring.', 23: 'Victorious, the adventurers return to the main hall.',
    25: 'A fourth door opens on the left wall.', 26: 'A man taller than average and with an extremely fit build walks into the main hall.', 27: 'The man bows before you, as to acknowledge his defeat, and walks back to his cell.',
    29: '"Maintain your composure. What comes next would shake mortals and gods alike."', 30: 'A fifth door opens on the left wall.', 31: 'A vision of pure terror drifts out of its cell. Darkness invades the hall.', 32: 'The horror explodes into tiny shards. Once again, the animated broom sweeps them back into the cell.',
    34: 'A sixth door opens on the left wall.', 35: 'A mountain of cogs and cables rolls out of the cell.', 36: 'The machine explodes into a thousand pieces. After a few seconds, it rebuilds itself, and teleports back to its cell.',
    37: '"Well done, Adventurers! This is the first time someone defeats all the prisoners since, ironically, your fifth contender did so eons ago."',
    38: '"These were different times, however… For instance, the Machine was still roaming the cosmos, and the unspeakable horror in cell #6 was still in its infancy, horsing around and devouring small planets…"',
    39: '"But I digress. You reached a legendary achievement not many can boast. Tales will be written about your victory. I had a lot of fun, and hope you come try again in the future!"',
  } as Record<number, string>,
} as const

const TOWER_REST_ROOMS = new Set([10, 14, 18, 24, 28, 33])

export function enterTheTowerRoom(progress: number) {
  return { log: THE_TOWER_LOGS.rooms[progress] ?? '', rest: TOWER_REST_ROOMS.has(progress), completed: progress >= 39 }
}

export function rollTheTowerEncounter(progress: number) {
  const bosses: Record<number, string> = { 8: 'Lazarus', 12: 'Phoenix', 16: 'HeadlessKnight', 22: 'Ultraslime', 26: 'TheExiled', 31: 'TheAncient', 35: 'TheMachine' }
  return bosses[progress] ? [bosses[progress]] : []
}

export function startTheTowerFight(progress: number) {
  return THE_TOWER_LOGS.encounters[progress] ?? null
}

export const THE_DREADFUL_ASCENT_LOGS = {
  enter: 'A mountain of writhing souls stands tall outside the Obsidian Mines exit. Their degree of paleness vary considerably, from the newly added soldiers to those trapped there for millennia. At the summit, the wicked seer performs its ritual.',
  encounters: {
    2: 'All around the team, the spirits of long forgotten warriors emerge from the mountain.',
    3: "From below the team's feet, ghastly arms are digging upwards.",
    4: 'Knights with vitreous eyes advance towards the expedition.',
    5: 'The unsteady ethereal blob around the team forms a few, definite hateful figures.',
    8: 'The restless mountain materializes again in the form of long forgotten souls, forgotten for millennia.',
    10: '"You cowardly insects dare speak to me while i\'m performing the holy ritual? Die, and nourish the Mountain!"',
  } as Record<number, string>,
  rooms: [
    'The team takes a deep breath and begins the dreadful ascent.',
    'The grotesque mass below, stretching endlessly into the ashen sky, provides an extremely unstable terrain.',
    'The adventurers feet plunge into undulating sea of spectral forms with every new step.',
    'The team presses through the swirling miasma of hate and resentment, forging a new path with only determination as their tool.',
    'The screams of agony around the group almost breaks the sanity of the climbers.',
    'In the distance, a colossal wraith formed from the amalgamation of countless souls watches the surrounding.',
    'The team hides for some minutes waiting for the gigantic threat to direct its gaze elsewhere.',
    'Ghastly appendages try to pull the explorers down into the throbbing mass at every occasion.',
    'The expedition resumes, with the pillar on the summit now closer than ever.',
    'The traitorous Seer, now serving its true master, exits his trance-like state to confront the adventurers.',
    '"You will not break the Astral Graft. Witness my eternal form, and perish in the fire of a thousand suns!"',
    '"Master, i… am sorry for this cycle. I cannot manifest the Graft anymore. The next one will be stronger…"',
    'The purple pillar ascending into the sky instantly snaps, twisting like a cut appendage. As the mountain quickly deflates, the clouds start dissipating showing the stars behind. Two colossal maws, each bigger than a whole mountain, close violently around the body of the Seer. They slowly retreat into the vastness of the night, leaving behind nothing but a small, unremarkable red book.',
  ],
} as const

export function enterTheDreadfulAscentRoom(progress: number) {
  return {
    log: THE_DREADFUL_ASCENT_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 13,
  }
}

export function rollTheDreadfulAscentEncounter(progress: number, maxProgress: number, hasSerpentStaff: boolean) {
  if (progress < maxProgress) return []
  if (progress === 2) return Array.from({ length: 3 }, () => 'EtherealSoul')
  if (progress === 3) return Array.from({ length: 4 }, () => 'EtherealSoul')
  if (progress === 4 || progress === 5 || progress === 8) return Array.from({ length: 5 }, () => 'EtherealSoul')
  if (progress === 10) return ['KasimirTheSeer']
  if (progress === 11 && !hasSerpentStaff) return ['HeraldKali']
  return []
}

export function startTheDreadfulAscentFight(progress: number) {
  return THE_DREADFUL_ASCENT_LOGS.encounters[progress] ?? null
}

export const CELESTIAL_MOTHERSHIP_LOGS = {
  enter: 'The expedition spotted a massive, pale blue structure at the edge of the Barren Wastelands. After their report, a team is assigned to investigate.',
  event: 'With its source of power irreversibly compromised, the G.C.S.S. deactivates.',
  encounters: {
    2: 'Two flying devices spot the team; one immediately flies off.',
    3: 'A nearby patrol shifts its focus toward the team.',
    4: 'The first wave reaches the team and attacks with full force.',
    5: 'Another wave prepares to halt the advance.',
    6: 'The relentless celestial attack continues.',
    8: 'A massive ship hovers overhead, as ground units leap several meters to the ground.',
    9: 'More ships approach, accompanied by ground support.',
    12: 'Two unknown devices on the side of the door are armed.',
    15: 'Two devices, identical to the ones encountered before, are activated.',
    17: 'He flips a switch and charges toward the adventurers.',
  } as Record<number, string>,
  rooms: [
    'As they approach, it becomes clear the structure is of artificial origin.',
    'Beneath the structure, hundreds of thousands of celestial soldiers stand ready in the distance.',
    'Suddenly, the enemy ranks stir, metal clattering as they advance toward your position!',
    'The expedition hurries across the barren landscape, skipping through the ever present banshee burrows.',
    'As the celestial structure looms closer, the team shivers, awestruck by its immense size.',
    'Chased by the entire celestial army, the team sharply veers into a narrow passage, hoping to delay the advance.',
    'After a few minutes of running, the metallic clatter of the celestial horde fades a little, and the team spots the exit of the passage.',
    'The expedition is now no more than a minute away from the building.',
    'Several ropes hang from a metal platform above. The horde is closing in.',
    'With the whole Celestial Army at your heels, the team manage to climb onto the structure.',
    "Inside, the structure is even more alien: vast, empty spaces with ceilings soaring tens of meters high and architecture unlike anything they've ever seen.",
    'In front, an imposing metal door blocks the path.',
    'Behind the door is a large round room, with no other exits in sight.',
    'In the center, a lone lever is present. When pulled, it lifts the team to the upper levels.',
    'A small atrium lies ahead, with a door similar to the one they forced open earlier.',
    'A long corridor leads to a round room filled with switches and levers.',
    'In the center of the room, a towering humanoid rises from the command chair.',
    "Cracks begin to form on the structure's ceiling, suggesting the triggering of some safety mechanism.",
    'As the room begins to collapse, someone pulls a lever on the right wall. In an instant, the team is teleported to high ground miles away, where they watch the building crumble from a safe distance.',
  ],
} as const

export function enterCelestialMothershipRoom(progress: number) {
  return {
    log: CELESTIAL_MOTHERSHIP_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 19,
  }
}

export function rollCelestialMothershipEncounter(progress: number, maxProgress: number, hasEvo23Vial: boolean) {
  if (progress < maxProgress) return []
  if (progress === 2) return ['Oculus']
  if (progress === 3) return ['Oculus', 'CelestialLancer', 'CelestialLancer', 'CelestialLancer', 'Oculus']
  if (progress === 4 || progress === 5 || progress === 6) return Array.from({ length: 5 }, () => 'CelestialLancer')
  if (progress === 8) return ['CelestialLancer', 'CelestialLancer', 'CelestialDestroyer', 'CelestialLancer', 'CelestialLancer']
  if (progress === 9) return ['CelestialDestroyer', 'CelestialLancer', 'CelestialLancer', 'CelestialLancer', 'CelestialDestroyer']
  if (progress === 12 || progress === 15) return ['Gcss', 'ReinforcedDoor', 'Gcss']
  if (progress === 17 && !hasEvo23Vial) return ['LegateHadrian']
  return []
}

export function startCelestialMothershipFight(progress: number) {
  return CELESTIAL_MOTHERSHIP_LOGS.encounters[progress] ?? null
}

export function killCelestialMothershipEnemy(enemyId: string, enemies: Array<{ enemyId: string; hp: number }>) {
  if (enemyId !== 'ReinforcedDoor') return { logs: [] as string[] }
  const guards = enemies.filter((enemy) => enemy.enemyId === 'Gcss' && enemy.hp > 0)
  for (const guard of guards) guard.hp = 0
  return { logs: guards.map(() => CELESTIAL_MOTHERSHIP_LOGS.event) }
}

export const THE_DIRE_DESCENT_LOGS = {
  enter: "Beneath the fiery volcano, a network of tunnels descends into the planet's depths. The heat is unbearable, yet the expedition presses on with unwavering determination.",
  encounter: '"Your quest ends here, Adventurers."',
  rooms: [
    'A faint light pierces the darkness ahead, suggesting the Core is near.',
    'A whisper echoes through the tunnels, resembling people arguing in an unintelligible language.',
    'The light grows brighter, intensifying along with the heat.',
    'Rounding a corner, the expedition enters a vast cavern. In the distance, the core reveals itself with an eerie, unnatural purple light.',
    "Before the chasm, three colossal, nightmarish entities resembling the Seer's true form stand guard to an arcane machine.",
    'The long battle has left the team exhausted, and barely alive.',
    'The adventurers decide that the machine should not be touched. King Roderic will be informed of its presence, and a more competent research team will likely be dispatched.',
    "The guild's expedition is over. They slowly ascend towards the surface, eager to see the sunlight once more.",
  ],
} as const

export function enterTheDireDescentRoom(progress: number) {
  return {
    log: THE_DIRE_DESCENT_LOGS.rooms[progress - 1] ?? '',
    completed: progress >= 8,
  }
}

export function rollTheDireDescentEncounter(progress: number, maxProgress: number, hasSerpentLunge: boolean) {
  if (progress < maxProgress || progress !== 5 || hasSerpentLunge) return []
  return ['HeraldXavi', 'HeraldMaya', 'HeraldShoran']
}

export function startTheDireDescentFight(progress: number) {
  return progress === 5 ? THE_DIRE_DESCENT_LOGS.encounter : null
}

const SOUTHERN_GROVE_ENCOUNTERS: Array<[number, string[]]> = [
  [20, ['GiantTortoise']],
  [40, ['GiantMoth']],
  [60, ['GreenSpitfang']],
  [90, ['GiantTortoise', 'GiantMoth']],
  [120, ['GiantTortoise', 'GreenSpitfang']],
  [150, ['GiantMoth', 'GreenSpitfang']],
  [180, ['Dryad', 'GreenSpitfang']],
  [210, ['AncientEnt', 'Dryad']],
  [240, ['GiantMoth', 'AncientEnt', 'GiantMoth']],
  [260, ['GiantTortoise', 'GreenSpitfang', 'GiantMoth']],
  [280, ['GreenSpitfang', 'GiantTortoise', 'GreenSpitfang']],
  [300, ['GiantMoth', 'GreenSpitfang', 'GiantMoth']],
  [320, ['GreenSpitfang', 'GiantTortoise', 'Dryad']],
  [340, ['GreenSpitfang', 'Dryad', 'GiantTortoise', 'GiantMoth']],
  [360, ['GreenSpitfang', 'AncientEnt', 'Dryad', 'GreenSpitfang']],
  [380, ['GiantMoth', 'GiantTortoise', 'Dryad', 'GreenSpitfang']],
  [400, ['GiantTortoise', 'GiantMoth', 'GreenSpitfang', 'GiantTortoise']],
]

export const THE_SOUTHERN_GROVE_LOGS = {
  enter: "In front of the expedition stands out the endless mass of brambles that marks the southern end of the civilized world. These areas harbor an aggressive fauna, poorly studied by a few brave explorers. As if the danger wasn't enough, a mild earthquake is constantly shaking the vegetation…",
  rooms: [
    'The adventurers cut a thick branch full of spikes before proceeding to the next areas',
    'Carefully enough, the expedition crosses a small muddy stream',
    "The sound of cracking trees alert the team. It's probably a wise idea to head in the opposite directions.",
    'A thick curtain of dead branches blocks the path. The team has to find a way around it.',
    'A patch of trees in the distance suddenly falls, swallowed by the terrain below. The team hastens its pace.',
    "The expedition passes a huge tree growing around long dead remains, but you can't tell the species of the unfortunate victim.",
    'Around the corner, several cracked eggs as big as an average person lie on the ground.',
    'A natural bridge of brambles allows to safely cross a large, deep creek running through the forest.',
    'The constant earthquake increases for a moment, prompting the expedition to run away from the tallest trees.',
    'The expedition carefully advance through a patch of shaking trees.',
  ],
  encounters: [
    'Silently, something descends from the branches above.',
    'In a nearby clearing surrounded by spikes, enemies are alerted by the team steps.',
    'With a swift knife strike, the team cuts a spike curtain that reveals the hostile creatures behind.',
    'Something is following the team. The escape is interrupted by a mass of brambles that would take too long to cut.',
    'Wild creatures crawl out from below the side of a collapsed path.',
  ],
  findingBramble: 'A huge bramble mass, shaken by the constant earthquake, falls from the branches above.',
  findingDryad: 'The team notices a white haired Dryad sitting on a nearby branch, staring at them while whispering the formula of an unknown spell.',
  wurmTrap: 'The ground below collapses into the maws of a colossal Wurm. Adventurers must get out of the way, and fast!',
  wurmSpawn: 'The Primeval Wurm stands as tall as a mountain. It tries to devour the team with unexpected speed.',
} as const

export function enterTheSouthernGroveRoom(roll: number) {
  return indexedLog(THE_SOUTHERN_GROVE_LOGS.rooms, roll)
}

export function rollTheSouthernGroveEncounter(event: AreaEventState | null, roll: number) {
  if (event?.kind === 'PRIMEVAL_WURM_PROGRESS' && event.progress >= 14_000) {
    return {
      event: { kind: 'PRIMEVAL_WURM_COOLDOWN', progress: 0 } satisfies AreaEventState,
      roster: ['PrimevalWurm'],
    }
  }
  const value = roll * 1_000
  return {
    event,
    roster: value >= 600
      ? []
      : SOUTHERN_GROVE_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? [],
  }
}

export function startTheSouthernGroveFight(event: AreaEventState | null, roll: number) {
  return event?.kind === 'PRIMEVAL_WURM_COOLDOWN' && event.progress === 0
    ? THE_SOUTHERN_GROVE_LOGS.wurmSpawn
    : indexedLog(THE_SOUTHERN_GROVE_LOGS.encounters, roll)
}

export function searchTheSouthernGrove(
  event: AreaEventState | null,
  averageDexterity: number,
  rng: () => number,
) {
  let nextEvent = event ?? { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 0 } satisfies AreaEventState
  if (nextEvent.kind === 'PRIMEVAL_WURM_PROGRESS') {
    const step = Math.max(14, 300 - averageDexterity)
    nextEvent = { ...nextEvent, progress: nextEvent.progress + step }
    const turns = Math.trunc((14_000 - nextEvent.progress) / step) + 1
    if (nextEvent.progress >= 14_000) {
      return { type: 'wurmTrap' as const, event: nextEvent, averageDexterity, turns }
    }
    const roll = rng() * 1_000
    if (roll < 60) return { type: 'item' as const, event: nextEvent, itemId: 'ElysianWood' as const, averageDexterity, turns }
    if (roll < 110) return { type: 'trap' as const, event: nextEvent, log: THE_SOUTHERN_GROVE_LOGS.findingBramble, stat: 'Dexterity' as const, difficulty: 50, damage: 75, magic: false, averageDexterity, turns }
    if (roll < 135) return { type: 'trap' as const, event: nextEvent, log: THE_SOUTHERN_GROVE_LOGS.findingDryad, stat: 'Intelligence' as const, difficulty: 40, damage: 90, magic: true, averageDexterity, turns }
    return { type: 'nothing' as const, event: nextEvent, averageDexterity, turns }
  }
  if (nextEvent.kind === 'PRIMEVAL_WURM_COOLDOWN') {
    nextEvent = nextEvent.progress >= 40
      ? { kind: 'PRIMEVAL_WURM_PROGRESS', progress: 0 }
      : { ...nextEvent, progress: nextEvent.progress + 1 }
  }
  const roll = rng() * 1_000
  if (roll < 60) return { type: 'item' as const, event: nextEvent, itemId: 'ElysianWood' as const }
  if (roll < 110) return { type: 'trap' as const, event: nextEvent, log: THE_SOUTHERN_GROVE_LOGS.findingBramble, stat: 'Dexterity' as const, difficulty: 50, damage: 75, magic: false }
  if (roll < 135) return { type: 'trap' as const, event: nextEvent, log: THE_SOUTHERN_GROVE_LOGS.findingDryad, stat: 'Intelligence' as const, difficulty: 40, damage: 90, magic: true }
  return { type: 'nothing' as const, event: nextEvent }
}

const BARREN_WASTELANDS_ENCOUNTERS: Array<[number, string[]]> = [
  [100, ['Banshee']],
  [130, ['CelestialLancer', 'Banshee']],
  [160, ['CelestialLancer', 'Iconoclast', 'Oculus', 'Banshee']],
  [190, ['Iconoclast', 'Oculus', 'Iconoclast', 'Banshee']],
  [220, ['CelestialLancer', 'Banshee', 'CelestialLancer', 'Oculus', 'Oculus']],
  [250, ['Oculus', 'Oculus', 'Banshee', 'Iconoclast', 'Iconoclast']],
  [267, ['Iconoclast']],
  [284, ['Oculus']],
  [301, ['CelestialDestroyer']],
  [318, ['CelestialLancer', 'Iconoclast']],
  [335, ['Iconoclast', 'Iconoclast']],
  [352, ['Iconoclast', 'Oculus']],
  [369, ['Oculus', 'Oculus']],
  [386, ['Iconoclast', 'Oculus', 'Iconoclast']],
  [403, ['Oculus', 'CelestialLancer', 'Oculus']],
  [420, ['Iconoclast', 'CelestialLancer', 'Oculus']],
  [437, ['CelestialLancer', 'Iconoclast', 'CelestialLancer']],
  [454, ['Oculus', 'Iconoclast', 'Iconoclast', 'Oculus']],
  [471, ['Oculus', 'Iconoclast', 'CelestialLancer', 'Oculus']],
  [488, ['Iconoclast', 'CelestialLancer', 'Oculus', 'Iconoclast']],
  [495, ['Iconoclast', 'CelestialDestroyer', 'Oculus']],
]

export const BARREN_WASTELANDS_LOGS = {
  enter: 'A desolate land stretches as far as the eye can see. These are the hunting grounds of the Banshees, ruthless armored beasts known for their solitary nature. However, something else is going on: constructs resembling flying eyes roam the skies, while the horizon looks like a sea of flames.',
  rooms: [
    "Far away, a Banshee crawls out of the ground and leaps to an unsuspecting invader trying to burn some remains. It's over before he even notices the attacker.",
    'A large celestial platoon is marching to the north. The team hides behind a nearby rock, waiting for them to pass.',
    'A wounded Banshee digs a hole in the ground at surprising speed and disappears inside it.',
    "A flying ship is scanning the ground for living targets. You hope it didn't locate the expedition.",
    'A huge golden ship, clearly not from this world, appears in the sky out of thin air. Tens of celestials jump down several meters on an unsuspecting Banshee.',
    'On your left, a group of celestials are pouring an unknown liquid inside one of the holes on the ground.',
    'The team proceeds with caution, surrounded by the sounds of the ongoing battle.',
    'On the ground are still visible the remains of a recent skirmish.',
    'A large group of flying eyes floating above suddenly divides, each racing in a different direction.',
    'Fires are burning all around the team, making the air almost unbreathable.',
  ],
  encounters: [
    'The team steps into an unavoidable fight.',
    'In the open field, the team is spotted from far away.',
    'Just in time, the adventurers turn around to find enemies charging at them.',
    'After a strenuous run, the expedition realizes it must face the chasing threat.',
    'From behind a large fire burning in the plain, something attacks the expedition.',
  ],
  trap: 'In the ground, in an abandoned Banshee burrow, lies a poorly concealed alien weapon. The team is about to step on the tripwire.',
} as const

export function enterBarrenWastelandsRoom(roll: number) {
  return indexedLog(BARREN_WASTELANDS_LOGS.rooms, roll)
}

export function rollBarrenWastelandsEncounter(roll: number) {
  const value = roll * 1_000
  if (value >= 495) return []
  return BARREN_WASTELANDS_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function startBarrenWastelandsFight(roll: number) {
  return indexedLog(BARREN_WASTELANDS_LOGS.encounters, roll)
}

export function searchBarrenWastelands(roll: number) {
  return roll < 0.02
    ? { type: 'trap' as const, log: BARREN_WASTELANDS_LOGS.trap, stat: 'Dexterity' as const, difficulty: 30, damage: 70, magic: false }
    : { type: 'nothing' as const }
}

const HIDDEN_CITY_OF_LAROX_ENCOUNTERS: Array<[number, string[]]> = [
  [25, ['Imp']],
  [50, ['MagicArmor']],
  [75, ['Imp', 'Imp']],
  [100, ['MagicArmor', 'MagicArmor']],
  [125, ['Imp', 'NexusResearcher']],
  [150, ['Imp', 'MagicArmor']],
  [175, ['NexusResearcher', 'MagicArmor']],
  [200, ['MagicArmor', 'WizardOfLarox']],
  [222, ['Imp', 'Imp', 'Imp']],
  [244, ['MagicArmor', 'NexusResearcher', 'MagicArmor']],
  [266, ['Imp', 'NexusResearcher', 'MagicArmor']],
  [288, ['MagicArmor', 'NexusResearcher', 'WizardOfLarox']],
  [310, ['WizardOfLarox', 'MagicArmor', 'WizardOfLarox']],
  [332, ['Imp', 'MagicArmor', 'WizardOfLarox']],
  [354, ['MagicArmor', 'WizardOfLarox', 'MagicArmor']],
  [376, ['MagicArmor', 'WizardOfLarox', 'NexusResearcher', 'MagicArmor']],
  [398, ['MagicArmor', 'WizardOfLarox', 'ArchmageOfLarox', 'MagicArmor']],
  [420, ['MagicArmor', 'WizardOfLarox', 'NexusResearcher', 'Imp']],
  [442, ['Imp', 'NexusResearcher', 'WizardOfLarox', 'Imp']],
  [464, ['MagicArmor', 'WickedTribute', 'NexusResearcher', 'MagicArmor']],
]

export const HIDDEN_CITY_OF_LAROX_LOGS = {
  enter: 'The massive doors of the City of Larox, an ancient underground civilization lost for millennia, loom before the wary expedition. In the distance, a colossal artifact hums with seemingly random vibrations, reconfiguring itself in the blink of an eye. Using a sewer passage leading outside, the team slips past the marble walls undetected.',
  rooms: [
    'From a nearby house, its walls adorned with arcane symbols, faint whispers in an ancient language can be heard.',
    'In the distance, the Nexus emits a strong shockwave, and reconfigures itself once more.',
    'A procession of robed individuals walks through a large street ahead. The team proceeds with extreme caution.',
    'On a nearby doorstep, five candles around a burnt, red incision suggest some kind of ritual recently took place.',
    'A skeleton lies suspended below a second floor window. What kind of civilized society allows this?',
    'Several crystals emerging from the ground, a natural occurrence in these caverns, vibrate in the same frequency of the Nexus.',
    'Candles in a nearby house are immediately put off as the team approaches.',
    'A loud shout echoes in the distance, swiftly followed by a lightning in the same spot.',
    'High above, a small, misshapen flying creature with a reddish hue soars through the air, clutching a piece of furniture.',
    'Two tall empty armors, animated by a blue light, stand guard to a nearby street.',
  ],
  encounters: [
    'A sharp, whistling sound approaches at lightning speed.',
    "Turning a corner, menacing figures notice the team's presence, and suddenly attack.",
    'Behind the team, enemies try a surprise attack.',
    'Quick, unintelligible words are uttered nearby just before the team is attacked',
    'A nearby wooden door is obliterated by an overwhelming power. From the dark room beyond, enemies surge toward the team.',
  ],
  magicAmplification: 'In the distance, the Nexus shifts rapidly, forming shapes that defy human understanding. It emits a pulsating light before settling into a new, enigmatic configuration.',
  magicTrap: 'From the feet of one of the team members, light begins to reveal the radial symmetry of a magic seal. A fraction of second later, a defensive spell is triggered.',
  hostileNexus: 'The air grows intensely dry. In the distance, the massive artifact begins to pulsate with increasing intensity. Along the sides of the street, obsidian walls spring up in an instant, shielding the civilian buildings.',
  heal: "An old man pulls the team aside. He praises your actions on the surface and, unlike the haughty members of the council, expresses genuine hope that you succeed in reaching the lower caverns. He uncorks a vial with a dark liquid.\nAdventurers' HP are fully restored, harmful effects are cleansed.",
} as const

export function enterHiddenCityOfLaroxRoom(roll: number) {
  return indexedLog(HIDDEN_CITY_OF_LAROX_LOGS.rooms, roll)
}

export function rollHiddenCityOfLaroxEncounter(roll: number) {
  const value = roll * 1_000
  if (value >= 464) return []
  return HIDDEN_CITY_OF_LAROX_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function startHiddenCityOfLaroxFight(roll: number) {
  return indexedLog(HIDDEN_CITY_OF_LAROX_LOGS.encounters, roll)
}

export function laroxMagicAmplification(progress: number) {
  if (progress <= 45) return progress * 10 / 900 + 0.5
  if (progress < 55) return 1
  return (progress - 54) * 15 / 900 + 1
}

export function searchHiddenCityOfLarox(event: AreaEventState | null, roll: number, amplificationRng: () => number) {
  const value = roll * 1_000
  if (!event || value < 200) {
    const progress = Math.trunc(amplificationRng() * 100)
    const amplification = laroxMagicAmplification(progress)
    return {
      type: 'amplification' as const,
      event: { kind: 'MAGIC_AMPLIFICATION', progress } satisfies AreaEventState,
      percent: Math.trunc(amplification * 100 - 100),
    }
  }
  if (value < 230) return { type: 'trap' as const, event, log: HIDDEN_CITY_OF_LAROX_LOGS.magicTrap, stat: 'Intelligence' as const, difficulty: 50, damage: 100, magic: true }
  if (value < 260) return { type: 'hostileNexus' as const, event }
  if (value < 280) return { type: 'heal' as const, event }
  return { type: 'nothing' as const, event }
}

const LOST_LANDS_ENCOUNTERS: Array<[number, string[]]> = [
  [26, ['Berserker']],
  [52, ['Pterodactyl']],
  [78, ['Terrorsaurus']],
  [104, ['AmanitaObscura', 'Berserker']],
  [130, ['Berserker', 'Berserker']],
  [156, ['StoneShaman', 'Pterodactyl']],
  [182, ['Berserker', 'AmanitaObscura', 'Berserker']],
  [208, ['Terrorsaurus', 'StoneShaman', 'Pterodactyl']],
  [234, ['Terrorsaurus', 'StoneShaman', 'Terrorsaurus']],
  [260, ['Pterodactyl', 'StoneShaman', 'Pterodactyl']],
  [286, ['Berserker', 'StoneShaman', 'Terrorsaurus']],
  [312, ['AmanitaObscura', 'StoneShaman', 'Pterodactyl']],
]

export const LOST_LANDS_LOGS = {
  enter: 'After days spent in the dark, twisted tunnels stretching below the Nexus, the expedition finally spots a faint light. Deep within the caverns lies a lush plain, dimly lit by the glow of an active volcano. The valley teems with vegetation and hints at a primitive civilization — small stone pyramids are scattered across the landscape.',
  rooms: [
    'The team opens its way through a thick patch of ferns.',
    'A stream of lava cuts the expedition path. They coast it for a while, looking for a way to cross it.',
    'A small path made of cobblestone leads somewhere in the middle of the vegetation.',
    'A tall pyramids made of giant stone blocks stands in the middle of a small valley. Rolling drum noises come from inside.',
    'An ear shattering roar comes from ahead. The team hides for a while.',
    'In the distance, a deep rumble is followed swiftly by a small jet of lava erupting from the volcano.',
    'Above your heads, a swarm of the biggest birds you have ever seen crosses the sky.',
    'A small, abandoned encampment lies in the middle of the forest. Below a steel cauldron, the embers are still smoking.',
    'The team sees two tree stumps, and a sharp stone axe planted firmly in one of them.',
    'A rhythmic, tribal song is being chanted in the distance. No one can recognize the language.',
  ],
  encounters: [
    'From beyond the thick wall of leaves, enemies charge at the team.',
    'Behind the team, enemies are quickly approaching.',
    'A group of enemies emerges from the dark entrance of a nearby pyramid.',
    'The team is ambushed by enemies, who were waiting on the tall trees.',
    'As they round a bend in the winding stone path, the team is confronted by a group of enemies.',
  ],
  titanSummon: 'An immense being, as tall as the ceiling of the cavern, emerges from the raging volcano.',
  diamond: 'A brief shimmer on a nearby rock, unassuming at first glance, catches the attention of one of the adventurers. Once broken, the rock reveals the most beautiful gem they have ever seen.',
} as const

export function enterLostLandsRoom(roll: number) {
  return indexedLog(LOST_LANDS_LOGS.rooms, roll)
}

export function rollLostLandsEncounter(event: AreaEventState | null, roll: number) {
  if (event?.kind === 'FIRE_RITUAL' && event.progress >= 100) return { event: null, roster: ['SmolderingTitan'] }
  const value = roll * 1_000
  return {
    event,
    roster: value >= 312 ? [] : LOST_LANDS_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? [],
  }
}

export function startLostLandsFight(roster: string[], roll: number) {
  return roster.length === 1 && roster[0] === 'SmolderingTitan'
    ? LOST_LANDS_LOGS.titanSummon
    : indexedLog(LOST_LANDS_LOGS.encounters, roll)
}

export function advanceLostLandsFireRitual(event: AreaEventState | null, roll: number) {
  const progress = Math.min(100, (event?.kind === 'FIRE_RITUAL' ? event.progress : 0) + 1 + Math.trunc(roll * 5))
  return { kind: 'FIRE_RITUAL', progress } satisfies AreaEventState
}

export function searchLostLands(firstRoll: number, secondRng: () => number) {
  if (firstRoll < 0.001 && secondRng() < 0.1) return { type: 'item' as const, itemId: 'Diamond' as const, log: LOST_LANDS_LOGS.diamond }
  return { type: 'nothing' as const }
}

export function rollTheDesertEncounter(event: AreaEventState | null, roll: number) {
  const value = roll * 1_000
  if (event?.kind === 'SHAHURI_ARMY_READY') {
    return ['SandStatue', 'SandStatue', 'SandStatue', 'SandStatue', 'SandStatue']
  }
  if (value >= 450) return []
  return DESERT_ENCOUNTERS.find(([threshold]) => value < threshold)?.[1] ?? []
}

export function enterTheDesertRoom(event: AreaEventState | null, roll: number) {
  if (event?.kind !== 'SHAHURI_ARMY_READY') {
    return { event, log: indexedLog(THE_DESERT_LOGS.rooms, roll) }
  }
  if (event.progress < 10) return { event, log: THE_DESERT_LOGS.armyAdvance }
  return { event: null, log: THE_DESERT_LOGS.armyDefeated }
}

export function startTheDesertFight(event: AreaEventState | null, roll: number) {
  if (event?.kind !== 'SHAHURI_ARMY_READY') {
    return { event, log: indexedLog(THE_DESERT_LOGS.encounters, roll) }
  }
  return {
    event: { ...event, progress: event.progress + 1 },
    log: THE_DESERT_LOGS.armyAttack,
  }
}

export function killTheDesertEnemy(event: AreaEventState | null, enemyId: string) {
  if (!['ShahuriWarrior', 'ShahuriMage', 'ShahuriArcher'].includes(enemyId)) {
    return { event, logs: [] as string[] }
  }
  if (!event) {
    return {
      event: { kind: 'SHAHURI_ARMY_CHARGING', progress: 1 } satisfies AreaEventState,
      logs: ["Sha'huri deterrent system activated, threat level: [1/100]"],
    }
  }
  if (event.kind !== 'SHAHURI_ARMY_CHARGING') return { event, logs: [] as string[] }
  const progress = event.progress + 1
  const progressLog = `Sha'huri deterrent system activated, threat level: [${progress}/100]`
  if (progress < 100) return { event: { ...event, progress }, logs: [progressLog] }
  return {
    event: { kind: 'SHAHURI_ARMY_READY', progress: 0 } satisfies AreaEventState,
    logs: [progressLog, THE_DESERT_LOGS.armyReady],
  }
}

export type TheDesertSearchResult =
  | { type: 'item'; itemId: 'Quartz' | 'Sandstone' }
  | { type: 'silence' }
  | { type: 'oasis' }
  | { type: 'nothing' }

export function searchTheDesert(event: AreaEventState | null, roll: number): TheDesertSearchResult {
  if (event?.kind === 'SHAHURI_ARMY_READY') return { type: 'nothing' }
  if (roll < 0.01) return { type: 'item', itemId: 'Quartz' }
  if (roll < 0.035) return { type: 'item', itemId: 'Sandstone' }
  if (roll < 0.085) return { type: 'silence' }
  if (roll < 0.1) return { type: 'oasis' }
  return { type: 'nothing' }
}
