export const ACTION_TURNS = {
  ENTER_DUNGEON: 5,
  ENTER_ROOM: 5,
  FIGHT: 2,
  LOOT: 5,
  SEARCH: 5,
  RESPAWN: 18,
  FLEE: 12,
} as const

export const javaInt = (value: number) => {
  if (Number.isNaN(value)) return 0
  if (value >= 2_147_483_647) return 2_147_483_647
  if (value <= -2_147_483_648) return -2_147_483_648
  return Math.trunc(value)
}

export const gameRound = (value: number) => javaInt(value + 0.0001)
export const javaDiv = (a: number, b: number) => Math.trunc(a / b)

export function experienceToNextLevel(level: number, ascended = false) {
  const p = level ** 1.4
  let result = javaInt((3 + p) * 10 * p)
  if (ascended) result *= 2
  if (result >= 10_000) return javaDiv(result, 1_000) * 1_000
  if (result >= 1_000) return javaDiv(result, 100) * 100
  if (result >= 100) return javaDiv(result, 10) * 10
  return result
}

export function hitProbability(
  attackStat: number,
  defenseStat: number,
  flatDodge = 0,
) {
  return Math.max(0.1, attackStat / (defenseStat / 5 + attackStat) - flatDodge)
}

export function applyDamage(
  incoming: number,
  defense: number,
  constitution: number,
  flatDamageReduction = 0,
  shield = 0,
) {
  const effectiveDefense = Math.min(1, 0.01 * defense)
  return gameRound(Math.max(
    1,
    (1 - effectiveDefense) * incoming
      - javaDiv(constitution, 8)
      - flatDamageReduction
      - shield,
  ))
}

export function adventurerAttackBounds(
  weaponType: string,
  constitution: number,
  intelligence: number,
  dexterity: number,
  weaponId?: string,
  threat = 1,
) {
  const type = weaponType.replace('type_', '')
  let modifier = type === 'staff'
    ? intelligence
    : type === 'bow'
      ? dexterity
      : type === 'dagger'
      ? constitution + dexterity
      : constitution
  if (weaponId === 'ColossalSword') modifier = constitution >= 120 ? constitution : javaDiv(constitution, 2)
  if (weaponId === 'VoidCrusher') modifier = constitution >= 275 ? constitution : javaDiv(constitution, 2)
  if (weaponId === 'SerpentSting') modifier *= 3
  if (weaponId === 'SerpentBite') modifier *= Math.max(1, threat)
  if (weaponId === 'StaffOfTheArchmage') modifier = javaInt(modifier * 1.07875)
  modifier = Math.fround(modifier)
  const delta = weaponId === 'StaffOfTheArchmage'
    ? 0.11935110081112399
    : weaponId === 'UnstableStaff'
      ? 0.8
    : type === 'staff'
      ? 0.05
      : type === 'bow'
        ? 0.1
        : type === 'dagger'
          ? 0.25
          : 0.15
  return { min: gameRound(modifier * (1 - delta)), max: gameRound(modifier * (1 + delta)) }
}

export const rollBetween = (min: number, max: number, rng = Math.random) => min + rng() * (max - min)

export function buildingCapacity(kind: 'quarters' | 'tavern' | 'storage', level: number, permanentUpgrade = 0, packs: { starter?: boolean; merchant?: boolean } = {}) {
  if (kind === 'quarters') return level + permanentUpgrade + 2 + (packs.starter ? 1 : 0)
  if (kind === 'tavern') return level + permanentUpgrade + 1 + (packs.starter ? 1 : 0)
  return level + permanentUpgrade + 35 + (packs.starter ? 35 : 0) + (packs.merchant ? 70 : 0)
}

export const offlineSeconds = (now: number, last: number) => last === 0
  ? 1
  : Math.max(1, Math.min(43_200, Math.floor((now - last) / 1_000 + 0.5)))

export const tavernVisitorIntervalMs = (level: number, upgrade = 0) =>
  Math.trunc(0.9 ** (level + upgrade) * 28_800 * 1_000)

export const tavernVisitorIntervalSeconds = (level: number, upgrade = 0) =>
  Math.trunc(tavernVisitorIntervalMs(level, upgrade) / 1_000)

export function truncatePrice(value: number) {
  const price = Math.trunc(value)
  if (price <= 10_000) return price
  if (price <= 1_000_000) return price - price % 100
  return price - price % 10_000
}

export const tavernCapacityPrice = (level: number) =>
  truncatePrice(3 ** level * 5_000)

export const tavernTimePrice = (level: number) =>
  truncatePrice(1.7 ** level * 200)

const QUARTERS_PRICES = [5, 275, 2_000, 10_000, 40_000, 100_000, 200_000, 300_000, 400_000, 500_000, 700_000, 1_000_000, 1_400_000, 1_850_000, 2_400_000, 3_000_000, 4_000_000, 5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000, 10_000_000]
export const quartersPrice = (level: number) =>
  truncatePrice(QUARTERS_PRICES[level] ?? Number.MAX_SAFE_INTEGER)

export function storagePrice(level: number) {
  const next = level + 1
  if (next > 80) return Number.MAX_SAFE_INTEGER
  let price = Math.min(next, 10) * 50
  if (next > 10) price += Math.min(level - 9, 10) * 150
  if (next > 20) price += Math.min(level - 19, 10) * 800
  if (next > 30) price += Math.min(level - 29, 10) * 4_000
  if (next > 40) price += Math.min(level - 39, 10) * 12_000
  if (next > 50) price += Math.min(level - 49, 10) * 22_000
  if (next > 60) price += Math.min(level - 59, 20) * 30_000
  return price
}

export const workshopQueuePrice = (level: number) =>
  truncatePrice(4.5 ** level * 20)

export const workshopTimePrice = (level: number) =>
  truncatePrice(1.7 ** level * 10)

export const workshopQueueCapacity = (level: number, permanentUpgrade = 0, starterPack = false, merchantPack = false) =>
  level + 1 + permanentUpgrade + (starterPack ? 1 : 0) + (merchantPack ? 2 : 0)

export const workshopCraftSeconds = (price: number, stack: number, timeLevel: number, permanentUpgrade = 0, merchantPack = false) =>
  Math.trunc((merchantPack ? 0.6 : 1) * 0.9 ** (timeLevel + permanentUpgrade - 1) * Math.max(price - 1, 1) * 6 * stack)

export const marketListingsCapacity = (level: number, permanentUpgrade = 0, starterPack = false, merchantPack = false) =>
  level + 1 + permanentUpgrade + (starterPack ? 1 : 0) + (merchantPack ? 2 : 0)

export const marketListingsPrice = (level: number) =>
  truncatePrice(4.5 ** level * 20)

export const marketTimePrice = (level: number) =>
  truncatePrice(1.7 ** level * 10)

export const marketSaleSeconds = (price: number, stack: number, timeLevel: number, permanentUpgrade = 0, merchantPack = false) =>
  Math.trunc((merchantPack ? 0.6 : 1) * 0.9 ** (timeLevel + permanentUpgrade - 1) * price * 4 * stack)

export const petFoodToNextLevel = (level: number) =>
  Math.trunc(1.085 ** level * 30)

export const shelterCapacity = (level: number, permanentUpgrade = 0) =>
  level + permanentUpgrade + 2

const SHELTER_PRICES = [500, 2_000, 8_000, 32_000, 64_000, 128_000, 256_000, 512_000, 1_000_000, 2_000_000, 4_000_000]
export const shelterPrice = (level: number) =>
  truncatePrice(SHELTER_PRICES[level] ?? Number.MAX_SAFE_INTEGER)

export const shelterAutofeedPrice = (level: number) =>
  level > 0 ? Number.MAX_SAFE_INTEGER : 10_000
