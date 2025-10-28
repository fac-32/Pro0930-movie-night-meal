import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const recipeCache = {};

let dishInfo = {
  movie: "",
  dishName: "",
  summary: "",
  ingredients: "",
  instructions: "",
  calories: "",
  healthScore: "",
};

function cleanMarkdown(text = "") {
  return text
    .replace(/[#*`]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const getRecipe = async (req, res) => {
  try {
    const movie = req.query.movie || "The Lord of the Rings";
    const cacheKey =
      typeof movie === "string" && movie.trim().length > 0
        ? movie.trim()
        : null;

    if (cacheKey && recipeCache[cacheKey]) {
      console.log(`Serving cached recipe for movie: ${cacheKey}`);
      return res.json({ ...recipeCache[cacheKey] });
    }

    console.log(`Generating recipe for movie: ${movie}`);

    const prompt = `
    You are a creative culinary AI. 
    Given a movie title, create an imaginative dish inspired by it.

    For the movie: "${movie}", provide:
    - A creative dish name that fits the theme of the movie
    - A short, engaging summary of the dish
    - A detailed list of ingredients (with quantities)
    - Step-by-step cooking instructions
    - Estimated calories
    - A health score from 0 to 100 (100 = very healthy)

    Respond ONLY in the following JSON format:

    {
      "dishName": "string",
      "summary": "string",
      "ingredients": "string (formatted list)",
      "instructions": "string (step-by-step)",
      "calories": "number",
      "healthScore": "number"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const rawContent = response.choices[0].message.content.trim();
    let data;

    try {
      data = JSON.parse(rawContent);
    } catch (e) {
      console.error("Could not parse JSON, attempting cleanup...");
      data = JSON.parse(rawContent.replace(/```json|```/g, "").trim());
    }

    dishInfo = {
      movie,
      dishName: cleanMarkdown(data.dishName),
      summary: cleanMarkdown(data.summary),
      ingredients: cleanMarkdown(data.ingredients),
      instructions: cleanMarkdown(data.instructions),
      calories: data.calories || "N/A",
      healthScore: data.healthScore || "N/A",
    };

    if (cacheKey) {
      recipeCache[cacheKey] = { ...dishInfo };
    }

    res.json(dishInfo);
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({
      error: "Failed to generate recipe.",
      details: error.message,
    });
  }
};
