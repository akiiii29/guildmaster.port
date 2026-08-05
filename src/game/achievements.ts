import type { ContentIndex } from './content'
import type { GameState } from './types'
import { potionLimit } from './engine'
import { DOCTRINE_ABILITIES, DOCTRINES } from './doctrines'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  points: number
  progress: (state: GameState, index: ContentIndex) => number
  target?: number
}

const count = (state: GameState, id: string) => state.achievementStats.defeatedEnemies[id] ?? 0
const hasAll = (state: GameState, ids: string[]) => ids.every((id) => count(state, id) > 0) ? 1 : 0
const ownArea = (areaId: string) => (state: GameState) => state.unlockedAreas.includes(areaId) ? 1 : 0
const tier = (state: GameState, index: ContentIndex) => Math.max(0, ...state.adventurers.map((member) => Math.trunc(Number(index.adventurers.get(member.classId)?.fields.maxLevel ?? 0) / 5)))

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'apprentice_blacksmith', title: 'Apprentice Blacksmith', description: 'Craft 100 items', points: 1000, progress: (s) => s.achievementStats.craftedItems, target: 100 },
  { id: 'guild_management_101', title: 'Guild Management 101', description: 'Finish the Tutorial', points: 1000, progress: (s) => s.tutorialStep >= 8 ? 1 : 0 },
  { id: 'seasoned_blacksmith', title: 'Seasoned Blacksmith', description: 'Craft 1000 items', points: 1500, progress: (s) => s.achievementStats.craftedItems, target: 1000 },
  { id: 'legendary_blacksmith', title: 'Legendary Blacksmith', description: 'Craft 10000 items', points: 2000, progress: (s) => s.achievementStats.craftedItems, target: 10000 },
  { id: 'seasoned_merchant', title: 'Seasoned Merchant', description: 'Sell 1000 items', points: 1500, progress: (s) => s.achievementStats.soldItems, target: 1000 },
  { id: 'apprentice_merchant', title: 'Apprentice Merchant', description: 'Sell 100 items', points: 1000, progress: (s) => s.achievementStats.soldItems, target: 100 },
  { id: 'legendary_merchant', title: 'Legendary Merchant', description: 'Sell 10000 items', points: 2000, progress: (s) => s.achievementStats.soldItems, target: 10000 },
  { id: 'small_guild', title: 'Small Guild', description: 'Own 5 Adventurers', points: 1000, progress: (s) => s.adventurers.length, target: 5 },
  { id: 'versatile_army', title: 'Versatile Army', description: 'Own 20 Adventurers', points: 2000, progress: (s) => s.adventurers.length, target: 20 },
  { id: 'respectable_guild', title: 'Respectable Guild', description: 'Own 12 Adventurers', points: 1500, progress: (s) => s.adventurers.length, target: 12 },
  { id: 'rare_specimen', title: 'Rare Specimen', description: 'Own a pet with 4 abilities', points: 1000, progress: (s) => s.pets.some((pet) => pet.abilities.filter((ability) => ability !== 'EMPTY').length >= 4) ? 1 : 0 },
  { id: 'ascended', title: 'Ascended', description: 'Have one Ascended adventurer', points: 1000, progress: (s) => s.adventurers.some((member) => member.ascended) ? 1 : 0 },
  { id: 'workaholic', title: 'Workaholic', description: 'Finish 150 quests', points: 2000, progress: (s) => s.achievementStats.claimedQuests, target: 150 },
  { id: 'busy', title: 'Busy', description: 'Finish 25 quests', points: 1000, progress: (s) => s.achievementStats.claimedQuests, target: 25 },
  { id: 'jack_of_one_trade', title: 'Jack of one trade', description: 'Have every doctrine ability fully upgraded on an adventurer', points: 1500, progress: (s) => s.adventurers.some((member) => {
    const abilities = member.doctrineId ? DOCTRINES[member.doctrineId].abilities : []
    return abilities.length > 0 && abilities.every((abilityId, slot) =>
      (member.doctrineLevels[slot] ?? 0) >= DOCTRINE_ABILITIES[abilityId].maxLevel)
  }) ? 1 : 0 },
  { id: 'heavy_drinker', title: 'Heavy Drinker', description: 'Have an adventurer drink the maximum amount of every potion', points: 1000, progress: (s, index) => s.adventurers.some((member) => Array.from({ length: 11 }, (_, potion) => (member.potionsDrank[potion] ?? 0) >= potionLimit(member, index, potion)).every(Boolean)) ? 1 : 0 },
  { id: 'filthy_rich', title: 'Filthy Rich', description: 'Own a platinum coin', points: 1500, progress: (s) => s.money >= 1_000_000 ? 1 : 0 },
  { id: 'wealthy', title: 'Wealthy', description: 'Own a gold coin', points: 1000, progress: (s) => s.money >= 1_000 ? 1 : 0 },
  { id: 'the_desert', title: 'The Desert', description: 'Unlock The Desert', points: 2000, progress: ownArea('TheDesert') },
  { id: 'eternal_battlefield', title: 'Eternal Battlefield', description: 'Unlock the Eternal Battlefield', points: 2000, progress: ownArea('EternalBattlefield') },
  { id: 'blackwater_port', title: 'Blackwater Port', description: 'Unlock Blackwater Port', points: 2000, progress: ownArea('BlackwaterPort') },
  { id: 'the_golden_city', title: 'The Golden City', description: 'Unlock the Golden City', points: 2000, progress: ownArea('TheGoldenCity') },
  { id: 'frostbite_peaks', title: 'Frostbite Peaks', description: 'Unlock Frostbite Peaks', points: 2000, progress: ownArea('FrostbitePeaks') },
  { id: 'obsidian_mines', title: 'Obsidian Mines', description: 'Unlock the Obsidian Mines', points: 2000, progress: ownArea('ObsidianMines') },
  { id: 'the_barren_wastelands', title: 'The Barren Wastelands', description: 'Unlock the Barren Wastelands', points: 2000, progress: ownArea('BarrenWastelands') },
  { id: 'the_southern_grove', title: 'The Southern Grove', description: 'Unlock the Southern Grove', points: 2000, progress: ownArea('TheSouthernGrove') },
  { id: 'the_hidden_city', title: 'The Hidden City', description: 'Unlock the Hidden City of Larox', points: 2000, progress: ownArea('HiddenCityOfLarox') },
  { id: 'the_lost_lands', title: 'The Lost Lands', description: 'Unlock the Lost Lands', points: 2000, progress: ownArea('LostLands') },
  { id: 'rescue_team', title: 'Rescue Team', description: 'Find and defeat Emperor Clovis XXVIII', points: 3000, progress: (s) => count(s, 'EmperorClovisXXVIII') },
  { id: 'deicide', title: 'Deicide', description: 'Enter the secret pyramid and defeat Sha, the Hidden God', points: 3000, progress: (s) => count(s, 'ShaTheHiddenGod') },
  { id: 'the_seer', title: 'The Seer', description: 'Climb the unholy mountain and defeat Herald Kali', points: 3000, progress: (s) => count(s, 'HeraldKali') },
  { id: 'infiltrator', title: 'Infiltrator', description: 'Infiltrate the Celestial Mothership and defeat Legate Hadrian', points: 3000, progress: (s) => count(s, 'LegateHadrian') },
  { id: 'royal_pudding', title: 'Royal Pudding', description: 'Defeat the Slime King', points: 2500, progress: (s) => count(s, 'SlimeKing') },
  { id: 'the_core', title: 'The Core', description: "Defeat the Serpent's minions at the core of the planet", points: 3000, progress: (s) => hasAll(s, ['HeraldXavi', 'HeraldMaya', 'HeraldShoran']) },
  { id: 'the_necromancer', title: 'The Necromancer', description: "Defeat Ka'Bar, the Rotten", points: 2500, progress: (s) => count(s, 'KabarTheRotten') },
  { id: 'the_cultists', title: 'The Cultists', description: 'Defeat the Cultist Rebels', points: 2500, progress: (s) => hasAll(s, ['Claris', 'Thorvus']) },
  { id: 'cosmic_horror', title: 'Cosmic Horror', description: 'Defeat the Avatar of the Ancient', points: 2500, progress: (s) => count(s, 'AvatarOfTheAncient') },
  { id: 'agonizing_titan', title: 'Agonizing Titan', description: 'Defeat the Primordial Titan', points: 2500, progress: (s) => count(s, 'PrimordialTitan') },
  { id: 'the_apostle', title: 'The Apostle', description: "Defeat Tekeli'li", points: 2500, progress: (s) => count(s, 'TekeliLiFirstApostle') },
  { id: 'unity', title: 'Unity', description: 'Defeat the Singularity', points: 2500, progress: (s) => count(s, 'Singularity') },
  { id: 'the_tower', title: 'The Tower', description: 'Defeat all the prisoners of the Tower', points: 2500, progress: (s) => hasAll(s, ['Lazarus', 'Phoenix', 'HeadlessKnight', 'Ultraslime', 'TheExiled', 'TheAncient', 'TheMachine']) },
  { id: 'the_council', title: 'The Council', description: 'Defeat King Aino and his inner circle', points: 2500, progress: (s) => hasAll(s, ['ChiefScientistAva', 'KingAino', 'FirstMinisterAtos']) },
  ...[
    ['novice', 'Novice', 2, 500], ['skilled', 'Skilled', 3, 1000], ['expert', 'Expert', 4, 1500], ['veteran', 'Veteran', 5, 2000],
    ['legendary', 'Legendary', 6, 2500], ['mythic', 'Mythic', 7, 3000], ['fabled', 'Fabled', 8, 3500], ['divine', 'Divine', 9, 4000],
  ].map(([id, title, requiredTier, points]) => ({ id: String(id), title: String(title), description: `Own a Tier ${requiredTier} or higher Adventurer`, points: Number(points), progress: (s: GameState, index: ContentIndex) => tier(s, index), target: Number(requiredTier) })),
]

export function achievementProgress(state: GameState, index: ContentIndex) {
  return ACHIEVEMENTS.map((definition) => {
    const target = definition.target ?? 1
    const value = Math.min(target, definition.progress(state, index))
    return { ...definition, target, value, unlocked: state.unlockedAchievements.includes(definition.id) }
  })
}

export function reconcileAchievements(state: GameState, index: ContentIndex) {
  const newlyUnlocked: string[] = []
  for (const achievement of achievementProgress(state, index)) {
    if (achievement.value >= achievement.target && !state.unlockedAchievements.includes(achievement.id)) {
      state.unlockedAchievements.push(achievement.id)
      newlyUnlocked.push(achievement.id)
    }
  }
  return newlyUnlocked
}
