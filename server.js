import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import OpenAI from "openai";
import { paletteRouter } from "./backend/routes/colorPaletteRoute.js";
import { OAuth2Client } from "google-auth-library";

import { connectDB } from "./backend/config/db.js";
import whishlistRouter from "./backend/routes/whishlist.route.js";
import recipeRouter from "./backend/routes/recipe.route.js";

dotenv.config();
const port = process.env._PORT || 3000;
// const API_KEY = process.env.API_KEY;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
//const RECIPE_API_KEY = process.env.RECIPE_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, "/frontend");

app.use(express.static(staticPath));
app.use(express.json());

app.use("/api/whishlist", whishlistRouter);
app.use("/api/recipe", recipeRouter);

//Google Signin
const client = new OAuth2Client(
  "693400949255-0375vn82b9l3j9dqvlkp9se04a2sc5tj.apps.googleusercontent.com",
);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "693400949255-0375vn82b9l3j9dqvlkp9se04a2sc5tj.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload; // Contains user info: email, name, picture, sub (unique ID)
}

app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    res.json({ success: true, user: payload });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// route for color palette
app.use("/api/palette", paletteRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// filter movies
app.get("/get-movies", async (req, res) => {
  try {
    const genreID = req.query.genreID;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const rating = req.query.rating;

    const voteValue = rating * 2 - 2;

    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=1&with_genres=${genreID}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&vote_average.gte=${voteValue}&api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

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
