import { recipeCache } from "../Controllers/recipe.controller.js";

export function clearRecipeCache() {
  for (const key of Object.keys(recipeCache)) {
    delete recipeCache[key];
  }
}
