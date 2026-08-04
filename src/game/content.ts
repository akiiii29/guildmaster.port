import type { GameContent } from './types'

const readJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Unable to load ${path}`)
  return response.json() as Promise<T>
}

export async function loadGameContent(): Promise<GameContent> {
  const [adventurers, enemies, areas, items, pets, quests, messages] = await Promise.all([
    readJson<GameContent['adventurers']>('/data/adventurers.json'),
    readJson<GameContent['enemies']>('/data/enemies.json'),
    readJson<GameContent['areas']>('/data/areas.json'),
    readJson<GameContent['items']>('/data/items.json'),
    readJson<NonNullable<GameContent['pets']>>('/data/pets.json'),
    readJson<NonNullable<GameContent['quests']>>('/data/quests.json'),
    readJson<NonNullable<GameContent['messages']>>('/data/messages.json'),
  ])
  return { adventurers, enemies, areas, items, pets, quests, messages }
}

const assetExtensions: Record<string, 'png' | 'svg'> = {
  bottom_nav_castle: 'svg',
}

export const assetUrl = (key?: string) => key ? `/assets/${key}.${assetExtensions[key] ?? 'png'}` : ''

export const indexContent = (content: GameContent) => ({
  adventurers: new Map(content.adventurers.map((entry) => [entry.id, entry])),
  enemies: new Map(content.enemies.map((entry) => [entry.id, entry])),
  areas: new Map(content.areas.map((entry) => [entry.id, entry])),
  items: new Map(content.items.map((entry) => [entry.id, entry])),
  pets: new Map((content.pets ?? []).map((entry) => [entry.id, entry])),
  quests: new Map((content.quests ?? []).map((entry) => [entry.id, entry])),
  messages: new Map((content.messages ?? []).map((entry) => [entry.id, entry])),
})

export type ContentIndex = ReturnType<typeof indexContent>
