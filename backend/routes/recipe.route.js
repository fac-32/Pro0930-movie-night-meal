import express from "express";

import { getRecipe } from "../Controllers/recipe.controller.js";

const router = express.Router();

router.get("/", getRecipe);

export default router;
