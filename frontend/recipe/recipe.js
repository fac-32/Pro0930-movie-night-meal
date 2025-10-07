const ingrediantsEL = document.getElementById("ingrediants");
const instructionsEL = document.getElementById("instructions");
const summaryEL = document.getElementById("summary");
const healthScoreEL = document.getElementById("healthScore");
const movieTitleEL = document.getElementById("movieTitle");

const movieTitle = localStorage.getItem("filmTitle");

movieTitleEL.innerText = movieTitle;

window.addEventListener("DOMContentLoaded", async() => 
{
    const res = await fetch("/recipe");
    const data = await res.json();

    ingrediantsEL.innerHTML = data.ingrediants;
    instructionsEL.innerHTML = data.instructions;
    healthScoreEL.innerHTML = data.healthScore;
    summaryEL.innerHTML = data.summary;
});
