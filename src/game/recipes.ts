import type { GameState, InventoryStack } from './types'

export interface RecipeDefinition {
  id: string
  result: InventoryStack
  ingredients: InventoryStack[]
}

// Starter recipes recovered from Recipes.java. More recipes can be appended
// without changing the workshop runtime or UI.
export const RECIPES: RecipeDefinition[] = [
  {
    id: 'Leather',
    result: { itemId: 'Leather', stack: 1 },
    ingredients: [{ itemId: 'BeastPelt', stack: 2 }],
  },
  {
    id: 'CopperArmor',
    result: { itemId: 'CopperArmor', stack: 1 },
    ingredients: [
      { itemId: 'Leather', stack: 1 },
      { itemId: 'CopperIngot', stack: 2 },
    ],
  },
]

export const recipeById = new Map(RECIPES.map((recipe) => [recipe.id, recipe]))

export function inventoryCount(state: GameState, itemId: string) {
  return state.inventory.find((item) => item.itemId === itemId)?.stack ?? 0
}

export function maxCraftable(state: GameState, recipe: RecipeDefinition) {
  return Math.min(...recipe.ingredients.map((ingredient) => Math.floor(inventoryCount(state, ingredient.itemId) / ingredient.stack)))
}
