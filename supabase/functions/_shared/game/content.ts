import type { GameContent } from './types.ts'
import adventurers from '../../../../public/data/adventurers.json' with { type: 'json' }
import enemies from '../../../../public/data/enemies.json' with { type: 'json' }
import areas from '../../../../public/data/areas.json' with { type: 'json' }
import items from '../../../../public/data/items.json' with { type: 'json' }
import pets from '../../../../public/data/pets.json' with { type: 'json' }
import quests from '../../../../public/data/quests.json' with { type: 'json' }
import messages from '../../../../public/data/messages.json' with { type: 'json' }

const content: GameContent = { adventurers, enemies, areas, items, pets, quests, messages }

export const serverContentIndex = () => ({
  adventurers: new Map(content.adventurers.map((entry) => [entry.id, entry])),
  enemies: new Map(content.enemies.map((entry) => [entry.id, entry])),
  areas: new Map(content.areas.map((entry) => [entry.id, entry])),
  items: new Map(content.items.map((entry) => [entry.id, entry])),
  pets: new Map((content.pets ?? []).map((entry) => [entry.id, entry])),
  quests: new Map((content.quests ?? []).map((entry) => [entry.id, entry])),
  messages: new Map((content.messages ?? []).map((entry) => [entry.id, entry])),
})

export type ContentIndex = ReturnType<typeof serverContentIndex>
