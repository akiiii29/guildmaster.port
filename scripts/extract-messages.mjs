import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const stringsXml = readFileSync(join(root, 'jadx_decompiled/resources/res/values/strings.xml'), 'utf8')
const strings = new Map([...stringsXml.matchAll(/<string name="([^"]+)">([\s\S]*?)<\/string>/g)].map((match) => [match[1], match[2]
  .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'")
  .replaceAll('<br/>', '\n').replace(/<[^>]+>/g, '')
  .replaceAll('\\n', '\n').replaceAll("\\'", "'")]))

const unlockAreas = {
  1: null,
  2: 'TheDesert',
  3: 'EternalBattlefield',
  4: 'TheGoldenCity',
  5: 'BlackwaterPort',
  6: 'FrostbitePeaks',
  7: 'ObsidianMines',
  8: 'TheDreadfulAscent',
  9: 'TheSouthernGrove',
  10: 'TheSouthernGrove',
  11: 'TheSouthernGrove',
  12: 'BarrenWastelands',
  13: 'HiddenCityOfLarox',
  14: 'LostLands',
  15: 'TheDireDescent',
  16: 'SleepingPlanet',
  17: 'SleepingPlanet',
}

const messages = Array.from({ length: 17 }, (_, offset) => {
  const id = offset + 1
  return {
    id,
    title: strings.get(`lore_${id}_title`) ?? `Message ${id}`,
    body: strings.get(`lore_${id}_body`) ?? '',
    unlockAreaId: unlockAreas[id],
  }
})

writeFileSync(join(root, 'web_game/public/data/messages.json'), `${JSON.stringify(messages, null, 2)}\n`)
console.log(`Extracted ${messages.length} king messages`)
