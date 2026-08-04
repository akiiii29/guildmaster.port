import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assetUrl } from './content'
import { DOCTRINE_ABILITIES } from './doctrines'
import { statusIconKey } from './engine'
import type { StatusEffectType } from './types'

const root = process.cwd()

function assetExists(key: string) {
  return existsSync(resolve(root, 'public', assetUrl(key).slice(1)))
}

function collectImageKeys(value: unknown, keys: Set<string>) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((entry) => collectImageKeys(entry, keys))
    return
  }
  for (const [property, entry] of Object.entries(value)) {
    if (/ImageKey$/.test(property) && typeof entry === 'string') keys.add(entry)
    collectImageKeys(entry, keys)
  }
}

describe('web asset catalog', () => {
  it('contains every image referenced by extracted game content', () => {
    const keys = new Set<string>()
    for (const name of ['adventurers', 'areas', 'enemies', 'items', 'pets']) {
      collectImageKeys(JSON.parse(readFileSync(resolve(root, `public/data/${name}.json`), 'utf8')), keys)
    }
    expect([...keys].filter((key) => !assetExists(key))).toEqual([])
  })

  it('contains UI, generated, status, and doctrine assets', () => {
    const keys = [
      'bottom_nav_castle', 'bottom_nav_adventurers', 'bottom_nav_dungeons', 'bottom_nav_raids',
      'sign_quarters', 'sign_tavern', 'sign_storage', 'sign_market', 'sign_workshop', 'sign_shelter',
      'empty_equipment', 'tombstone', 'unknown', 'tutorial_icon', 'loot_chest', 'loot_chest_full',
      'raid_try_available', 'raid_try_unavailable', 'epic_raid', 'animated_icon_damaged',
      'coin_copper', 'gem', 'king_message', 'drawer_icon_king_message', 'drawer_icon_faq',
      'drawer_icon_bestiary', 'drawer_icon_achievements',
      ...Array.from({ length: 6 }, (_, level) => `darkness_${level}`),
      ...Object.keys(DOCTRINE_ABILITIES).map((id) => `doctrine_ability_${id.toLowerCase()}`),
      ...(['TAUNT', 'DEFENSIVE_STANCE', 'STUN', 'SILENCE', 'ABLAZE', 'POISON', 'REGENERATION', 'LESSER_CURSE', 'BLEED', 'DELIRIUM', 'FRENZY', 'ANOINTED', 'INSPIRE', 'EXALT', 'PETRIFY', 'FALSE_LIFE', 'TERRIFY', 'FROZEN'] as StatusEffectType[]).map(statusIconKey).filter((key): key is string => Boolean(key)),
    ]
    expect(keys.filter((key) => !assetExists(key))).toEqual([])
  })
})
