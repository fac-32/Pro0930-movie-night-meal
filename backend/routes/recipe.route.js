import express from "express";

import { getRecipe } from "../Controllers/recipe.controller.js";
import { clearRecipeCache } from "../components/clearRecipeCache.js";

const router = express.Router();

router.get("/", getRecipe);
router.post("/clear", (req, res) => {
  clearRecipeCache();
  res.status(204).end();
});

export default router;
