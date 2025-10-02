const submitButton = document.getElementById("filterSubmit");
const genreSelection = document.getElementById("genre");
const adultSelection = document.getElementById("isAdult");


submitButton.addEventListener("click",  async () => {

    console.log("Submitting choices")
    const currentGenreID = genreSelection.value
    const isAdult = adultSelection.checked
    fetchMovies(currentGenreID, isAdult);
});

async function fetchMovies(genreID, isAdult) {

    // call API - get movies
  const url = `/get-movies?genreID=${genreID}&isAdult=${isAdult}`

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    // get first movie
    const movies = result.results
    populateMovies(movies)

  } catch (error) {
    console.error(error.message);
  }
}

function populateMovies(movies) {

    const moviesContainer = document.getElementById("moviesContainer");
    moviesContainer.innerHTML = '';

    movies.forEach(movie => {
    // For each plant, build a “card” with image + name
    const card = document.createElement("button");
    card.classList.add("movie-card");

    const img = document.createElement("img");
    img.src = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
    img.alt = movie.title;
    card.appendChild(img);

    // Add the name / description
    const info = document.createElement("div");
    info.classList.add("movie-info");

    const nameEl = document.createElement("h3");
    nameEl.textContent = movie.title;

    info.appendChild(nameEl);

    card.appendChild(info);
    moviesContainer.appendChild(card);

    })
}