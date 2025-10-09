import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import OpenAI from "openai";
import { paletteRouter } from "./backend/routes/colorPaletteRoute.js";

import { connectDB } from "./config/db.js";
import Whishlist from "./models/wishlist.model.js";

dotenv.config();
const port = process.env._PORT || 3000;
// const API_KEY = process.env.API_KEY;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RECIPE_API_KEY = process.env.RECIPE_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, "/frontend");

app.use(express.static(staticPath));
app.use(express.json());

// route for color palette
app.use("/api/palette", paletteRouter);

// Recipe
let dishInfo = {
  summary: "",
  ingrediants: "",
  instructions: "",
  healthScore: "",
};

function fillDishInfoData(data) {
  const cleanHTML = (text) => (text ? text.replace(/<\/?[^>]+(>|$)/g, "") : "");
  dishInfo.summary = cleanHTML(data.summary || "");
  dishInfo.instructions = cleanHTML(
    data.instructions || "Instructions unavailable.",
  );
  dishInfo.healthScore = data.healthScore || "N/A";

  if (data.extendedIngredients && Array.isArray(data.extendedIngredients)) {
    dishInfo.ingrediants = data.extendedIngredients
      .map((ing) => `- ${ing.original}`)
      .join("<br>");
  } else {
    dishInfo.ingrediants = "Ingredients not available.";
  }

  return dishInfo;
}

async function initializeRecipe() {
  const dish = "Lembas+bread"; // changed to a safer example dish

  const recipeSearch = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?query=${dish}&number=1&language=en&apiKey=${RECIPE_API_KEY}`,
  );
  const SearchData = await recipeSearch.json();

  if (!SearchData.results?.length) {
    throw new Error("No recipes found for that dish.");
  }

  const id = SearchData.results[0].id;

  const recipeAPI = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?apiKey=${RECIPE_API_KEY}`,
  );
  const recipeData = await recipeAPI.json();

  // Fill in Spoonacular data first
  fillDishInfoData(recipeData);

  // Then clean up instructions with OpenAI
  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const prompt = `
    The following recipe instructions may contain jokes or be in another language.
    Please rewrite them in clear, proper English cooking steps.
    Keep all key details, and make them sound like normal recipe directions.

    Recipe title: ${dish}
    Instructions: ${dishInfo.instructions}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    dishInfo.instructions = response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI cleanup failed:", error);
  }

  console.log("✅ Cleaned dish:", dishInfo);
  return dishInfo;
}

app.get("/recipe", async (req, res) => {
  try {
    if (!dishInfo.summary) {
      await initializeRecipe();
    }
    res.json(dishInfo);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// MongooDB

app.post("/api/whishlist", async (req, res) => {
  const movie = req.body;
  if (!movie.movieName) {
    return res
      .status(400)
      .json({ success: false, message: "no movie name found" });
  }

  const newMovie = new Whishlist(movie);

  try {
    await newMovie.save();
    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    console.log("Error in adding movie: ", error.message);
    res.status(500).jsonp({ success: false, message: "server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
  initializeRecipe();
});

// filter movies
app.get("/get-movies", async (req, res) => {
  try {
    const genreID = req.query.genreID;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=1&with_genres=${genreID}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&api_key=${TMDB_API_KEY}`;
    console.log(url);
    console.log("about to call API");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error(error.message);
  }
});

// finding filmed location

app.post("/get-location", async (req, res) => {
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
  const { model, input } = req.body;
  try {
    const response = await openai.responses.create({
      model: model,
      input: [
        {
          role: "user",
          content: input,
        },
      ],
    });
    res.json({ result: response.output_text });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal Server Error" });
  }
});

// Rendering image for the city

app.post("/get-image", async (req, res) => {
  const { params } = req.body;
  const url = `https://api.unsplash.com/search/photos?${params}`;
  const result = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
    },
  });
  console.log("This is working");
  const output = await result.json();
  console.log(output);
  res.send(output);
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
