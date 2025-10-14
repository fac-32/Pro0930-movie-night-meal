const ingrediantsEL = document.getElementById("ingrediants");
const instructionsEL = document.getElementById("instructions");
const summaryEL = document.getElementById("summary");
const healthScoreEL = document.getElementById("healthScore");
const movieTitleEL = document.getElementById("movieTitle");
const gameContainer = document.getElementById("gameSection");
const dishNameEL = document.getElementById("dishName");
const caloriesEL = document.getElementById("calories");

const movieTitle = localStorage.getItem("filmTitle");

movieTitleEL.innerText = movieTitle;

window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch(`/api/recipe?movie=${encodeURIComponent(movieTitle)}`);
  const data = await res.json();

  ingrediantsEL.innerHTML = "Ingrediants: " + data.ingrediants;
  instructionsEL.innerHTML = "Instructions: " + data.instructions;
  healthScoreEL.innerHTML = "Health Score: " + data.healthScore;
  summaryEL.innerHTML = "Summary: " + data.summary;
  dishNameEL.innerHTML = "Dish Name: " + data.dishName;
  caloriesEL.innerHTML = "Calories: " + data.calories;

  const gameBtn = document.createElement("button");
  gameBtn.classList.add("gameBtn");
  gameBtn.type = "button";
  gameBtn.textContent = "Play A Game?";
  gameContainer.appendChild(gameBtn);

  gameBtn.addEventListener("click", () => {
    window.location.href = "../filmLocation/filmLocation.html";
  });
});
