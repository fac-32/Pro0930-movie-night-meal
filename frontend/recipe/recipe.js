import { applyMoviePalette } from "../colorPalette/colorPalette.js";

const ingredientsEL = document.getElementById("ingredients");
const instructionsEL = document.getElementById("instructions");
const summaryEL = document.getElementById("summary");
const healthScoreEL = document.getElementById("healthScore");
const movieTitleEL = document.getElementById("movieTitle");
const gameContainer = document.getElementById("gameSection");
const dishNameEL = document.getElementById("dishName");
const caloriesEL = document.getElementById("calories");
const loadingImgEL = document.getElementById("loadingImg");
const hiddenTitlesEL = document.getElementsByClassName("hide-title");

function parseIngredients(rawIngredients) {
  if (!rawIngredients) return [];

  if (Array.isArray(rawIngredients)) {
    return rawIngredients.map((item) => item.trim()).filter(Boolean);
  }

  const normalized = String(rawIngredients).replace(/\r/g, "").trim();
  if (!normalized) return [];

  return normalized
    .replace(/[•·▪●◦]/g, "\n")
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInstructionSteps(rawInstructions) {
  if (!rawInstructions) return [];

  if (Array.isArray(rawInstructions)) {
    return rawInstructions.map((step) => step.trim()).filter(Boolean);
  }

  const normalized = String(rawInstructions).replace(/\r/g, "").trim();
  if (!normalized) return [];

  const segmented = normalized
    .replace(/\s*(?:Step\s*\d+[:.-]?)\s+/gi, "\n")
    .replace(/\s*(?:\d+\.\s+)/g, "\n");

  const steps = segmented
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.length > 1) {
    return steps;
  }

  return [normalized];
}

function renderIngredients(rawIngredients) {
  const ingredients = parseIngredients(rawIngredients);
  ingredientsEL.innerHTML = "";

  ingredients.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    ingredientsEL.appendChild(listItem);
  });
}

function renderInstructions(rawInstructions) {
  const steps = parseInstructionSteps(rawInstructions);
  instructionsEL.innerHTML = "";

  steps.forEach((step) => {
    const listItem = document.createElement("li");
    listItem.textContent = step;
    instructionsEL.appendChild(listItem);
  });
}

const movieTitle = localStorage.getItem("filmTitle");

Array.from(hiddenTitlesEL).forEach((el) => {
  el.style.display = "none";
});

movieTitleEL.innerText = movieTitle;

window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch(
    `/api/recipe?movie=${encodeURIComponent(movieTitle)}`
  );
  const data = await res.json();

  renderIngredients(data.ingredients);
  renderInstructions(data.instructions);
  healthScoreEL.innerHTML = "Health Score: " + data.healthScore + " / 100";
  summaryEL.innerHTML = data.summary;
  dishNameEL.innerHTML = "Dish Name: " + data.dishName;
  caloriesEL.innerHTML = "Calories: " + data.calories;
  loadingImgEL.src = "";
  loadingImgEL.style.display = "none";

  Array.from(hiddenTitlesEL).forEach((el) => {
    el.style.display = "block";
  });

  const movie = JSON.parse(localStorage.getItem("movieInfo"));
  console.log(movie);
  const baseBkg = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
  const secondBkg = `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`;
  applyMoviePalette(baseBkg);

  const gameBtn = document.createElement("button");
  gameBtn.classList.add("gameBtn");
  gameBtn.type = "button";
  gameBtn.textContent = "Play A Game?";
  gameContainer.appendChild(gameBtn);

  gameBtn.addEventListener("click", () => {
    window.location.href = "../filmLocation/filmLocation.html";
  });
});
