import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const sourceDir = join(root, 'jadx_decompiled/sources/it/paranoidsquirrels/idleguildmaster/storage/data/quests/instances')
const stringsXml = readFileSync(join(root, 'jadx_decompiled/resources/res/values/strings.xml'), 'utf8')
const strings = new Map([...stringsXml.matchAll(/<string name="([^"]+)">([\s\S]*?)<\/string>/g)].map((match) => [match[1], match[2]
  .replace(/<[^>]+>/g, '').replaceAll('\\n', '\n').replaceAll("\\'", "'")
  .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('Ã—', '×').replaceAll('â€™', '’')]))

const target = {
  ActiveDeterrent: () => 10, AndStayDead: () => 5,
  Annihilator: (i) => [30, 30, 80, 150, 250, 400, 700, 1000, 1500, 2000, 3000, 5000][i],
  BotchedRitual: () => 5, ClashOfTitans: (i) => (i - 9) * 25 + 50,
  Conqueror: (i) => (i - 1) * 1500, CoupDEtat: () => 100,
  CriticalHit: (i) => [0, 100, 300, 1000, 3000, 5000, 7500, 10000, 13750, 17500, 21250, 25000][i],
  CrystalClear: (i) => (i - 4) * 25, DarknessWithin: () => 10, Delirious: (i) => i * 25,
  EldritchHorror: () => 5, EndlessAgony: () => 5, Exorcism: (i) => i * 20,
  ExpertDuelist: (i) => (i - 3) * 1500, FallingApart: (i) => (i - 5) * 5000,
  FastLearner: (i) => i * 100, FromHell: (i) => (i - 10) * 5 + 15, GodFeared: () => 300,
  HeavyArmor: (i) => Math.trunc(1.7 ** (i - 1) * 500), HitOrMiss: (i) => Math.trunc(1.5 ** (i - 1) * 100),
  IceBreaker: (i) => (i - 5) * 5, Innocence: (i) => (i - 8) * 10 + 15, ItsATrap: (i) => i * 20,
  LaroxianPower: () => 5, LightBringer: (i) => i * 3 - 3,
  LongMarch: (i) => i === 1 ? 500 : (i - 1) * 3000, LuckyRoll: (i) => i * 50,
  Marathon: () => 60, MasterCrafter: (i) => i - 1, Medic: (i) => (i - 1) * 15000 + 5000,
  Miracle: (i) => i - 6, Myopia: (i) => (i - 7) * 50 + 300, NiceTry: () => 10,
  Paleontologist: () => 10, Protector: (i) => (i - 1) * 60000 + 10000, Psychiatrist: () => 1000,
  Pulverization: () => 1000, RagingVolcano: () => 5, Regicide: () => 5,
  Shocking: (i) => (i - 3) * 50, SlowBurn: (i) => (i - 3) * 2500,
  SmartFighter: (i) => i === 1 ? 1000 : (i - 1) * 10000 + 5000, SmokingHot: (i) => (i - 3) * 100,
  SoftAndFluffy: (i) => (i - 2) * 5, SoothingRemedy: (i) => (i - 5) * 2000,
  SpeedyHare: (i) => (i - 8) * 20 + 50, Spiky: (i) => i * 5000,
  Student: (i) => i === 1 ? 1000 : Math.trunc(1.5 ** (i - 1) * 5000), TabulaRasa: (i) => (i - 2) * 10,
  Thalassophobia: () => 5, TheEnd: (i) => i * 15, Tormentor: (i) => i === 1 ? 100 : i * 500,
  Unscathed: (i) => (i - 3) * 25 + 50, VampiricThirst: (i) => Math.trunc(1.7 ** (i - 3) * 5000),
  Warrior: (i) => i === 1 ? 1000 : 5000 * i,
}

const doctrineGroups = {
  Affliction: ['VampiricThirst', 'FallingApart', 'TheEnd', 'Innocence', 'SoftAndFluffy', 'Tormentor', 'Delirious'],
  Control: ['SmokingHot', 'Shocking', 'SlowBurn', 'IceBreaker', 'Regicide', 'CrystalClear', 'LaroxianPower'],
  Fortitude: ['HeavyArmor', 'Spiky', 'Protector', 'SpeedyHare', 'ClashOfTitans', 'Unscathed', 'GodFeared'],
  Grace: ['Medic', 'LightBringer', 'SoothingRemedy', 'Psychiatrist', 'AndStayDead', 'Miracle', 'DarknessWithin'],
  Illusion: ['HitOrMiss', 'LuckyRoll', 'ItsATrap', 'NiceTry', 'EldritchHorror', 'ActiveDeterrent', 'Marathon'],
  Knowledge: ['Student', 'Myopia', 'Paleontologist', 'MasterCrafter', 'FromHell', 'FastLearner', 'Exorcism'],
  Ruin: ['Annihilator', 'SmartFighter', 'CriticalHit', 'CoupDEtat', 'BotchedRitual', 'Pulverization', 'Thalassophobia'],
  War: ['ExpertDuelist', 'Warrior', 'LongMarch', 'Conqueror', 'EndlessAgony', 'TabulaRasa', 'RagingVolcano'],
}

const quests = readdirSync(sourceDir).filter((file) => file.endsWith('.java')).map((file) => {
  const source = readFileSync(join(sourceDir, file), 'utf8')
  const id = file.replace('.java', '')
  const nameKey = source.match(/idName = R\.string\.([a-z0-9_]+)/)?.[1]
  const descriptionKey = source.match(/idDescription = R\.string\.([a-z0-9_]+)/)?.[1]
  const rarity = Number(source.match(/defaultRarity = (\d+)/)?.[1])
  const minimumDifficulty = Number(source.match(/minimumDifficulty = (\d+)/)?.[1])
  if (!target[id]) throw new Error(`Missing target formula for ${id}`)
  return {
    id,
    name: strings.get(nameKey) ?? id,
    description: strings.get(descriptionKey) ?? '',
    defaultRarity: rarity,
    minimumDifficulty,
    targets: Array.from({ length: 11 }, (_, offset) => Math.max(1, target[id](offset + 1))),
    doctrines: Object.entries(doctrineGroups).flatMap(([doctrine, ids]) => ids.includes(id) ? [doctrine] : []),
  }
}).sort((left, right) => left.id.localeCompare(right.id))

writeFileSync(join(root, 'web_game/public/data/quests.json'), `${JSON.stringify(quests, null, 2)}\n`)
console.log(`Extracted ${quests.length} quests`)
