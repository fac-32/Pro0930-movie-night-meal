import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

dotenv.config();
const port = process.env._PORT || 3000;
const API_KEY = process.env.API_KEY;
const RECIPE_API_KEY = process.env.RECIPE_API_KEY; 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, "/frontend");

let dishInfo = 
{
  summary: "",
  ingrediants: "",
  instructions: "",
  healthScore: ""
}

function fillDishInfoData(data)
{
    dishInfo.summary = data.summary;
    dishInfo.instructions = data.instructions;
    dishInfo.healthScore = data.healthScore;

}

async function initializeRecipe()
{
  const dish = 'Lembas+bread' // from the lord of the rings 

  const recipeSearch = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${dish}&number=1&apiKey=${RECIPE_API_KEY}`)
  const SearchData = await recipeSearch.json();
  const id = SearchData.results[0].id;

  const recipeAPI = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${RECIPE_API_KEY}`)
  const recipeData = await recipeAPI.json();

  fillDishInfoData(recipeData);

  console.log(dishInfo);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
  initializeRecipe();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
