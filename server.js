import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import OpenAI from "openai";

dotenv.config();
const port = process.env._PORT || 3000;

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

// Recipe
let dishInfo = {
  summary: "",
  ingrediants: "",
  instructions: "",
  healthScore: "",
};

function fillDishInfoData(data) {
  dishInfo.summary = data.summary;
  dishInfo.instructions = data.instructions;
  dishInfo.healthScore = data.healthScore;
}

async function initializeRecipe() {
  const dish = "Lembas+bread"; // from the lord of the rings

  const recipeSearch = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?query=${dish}&number=1&apiKey=${RECIPE_API_KEY}`,
  );
  const SearchData = await recipeSearch.json();
  const id = SearchData.results[0].id;

  const recipeAPI = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?apiKey=${RECIPE_API_KEY}`,
  );
  const recipeData = await recipeAPI.json();

  fillDishInfoData(recipeData);

  console.log(dishInfo);
}

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
  const {params} = req.body;
  const url = `https://api.unsplash.com/search/photos?${params}`;
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_API_KEY}`,
    },
  });
  console.log('This is working');
  const output = await result.json();
  console.log(output);
  res.send(output);
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
