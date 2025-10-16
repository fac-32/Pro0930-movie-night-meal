import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

import { connectDB } from "./backend/config/db.js";

import paletteRouter from "./backend/routes/colorPaletteRoute.js";
import whishlistRouter from "./backend/routes/whishlist.route.js";
import recipeRouter from "./backend/routes/recipe.route.js";
import gameRouter from "./backend/routes/gameRoute.js";
import signinRouter from "./backend/routes/signinRoute.js";
import movieRouter from "./backend/routes/movieRoute.js";

dotenv.config();

const port = process.env._PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, "/frontend");

app.use(express.static(staticPath));
app.use(express.json());

app.use("/", movieRouter);
app.use("/api/whishlist", whishlistRouter);
app.use("/api/recipe", recipeRouter);
app.use("/", gameRouter);
app.use("/api/signin", signinRouter);
app.use("/api/palette", paletteRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
