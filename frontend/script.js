window.addEventListener("load", function () {
  const submitButton = document.getElementById("filterSubmit");
  const genreSelection = document.getElementById("genre");
  const startYearSelection = document.getElementById("startYear");
  const endYearSelection = document.getElementById("endYear");
  const errorMessage = document.getElementById("error-message");
  const choiceContainer = document.getElementById("choice-container");

  const recipeButton = this.document.getElementById("recipePageBtn");

  const modal = document.getElementById("myModal");
  const span = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modalMovieTitle");
  const modalPoster = document.getElementById("modalMovieImg");
  const modalOverview = document.getElementById("movieOverview");

  var validFilterInput = true;

  submitButton.addEventListener("click", async () => {
    if (!validFilterInput) {
      return;
    }

    console.log("Submitting choices");
    const currentGenreID = genreSelection.value;
    const startYear = startYearSelection.value;
    const endYear = endYearSelection.value;

    fetchMovies(currentGenreID, startYear, endYear);
  });

  async function fetchMovies(genreID, startYear, endYear) {
    // get start and end year dates
    const startDate = new Date(startYear, 0, 1).toISOString().slice(0, 10);
    const endDate = new Date(endYear, 11, 31).toISOString().slice(0, 10);

    // call API - get movies
    const url = `/get-movies?genreID=${genreID}&startDate=${startDate}&endDate=${endDate}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      const movies = result.results;
      populateMovies(movies);
    } catch (error) {
      console.error(error.message);
    }
  }

  function populateMovies(movies) {
    const moviesContainer = document.getElementById("moviesContainer");
    moviesContainer.innerHTML = "";

    movies.forEach((movie) => {
      const card = document.createElement("button");
      card.classList.add("movie-card");

      card.addEventListener("click", () => {
        // populate movie modal
        modal.style.display = "block";
        modalTitle.textContent = movie.title;
        modalPoster.src = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
        modalOverview.textContent = movie.overview;
        localStorage.setItem("filmTitle", movie.title);
      });

      const img = document.createElement("img");
      img.src = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
      img.alt = movie.title;
      card.appendChild(img);

      const info = document.createElement("div");
      info.classList.add("movie-info");

      const nameEl = document.createElement("h3");
      nameEl.textContent = movie.title;

      info.appendChild(nameEl);

      card.appendChild(info);
      moviesContainer.appendChild(card);
    });
  }

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  function validateReleaseYears() {
    const startYear = parseInt(startYearSelection.value, 10);
    const endYear = parseInt(endYearSelection.value, 10);

    if (startYear > endYear) {
      errorMessage.style.display = "inline";
      validFilterInput = false;
    } else {
      errorMessage.style.display = "none";
      validFilterInput = true;
    }
  }

  startYearSelection.addEventListener("input", validateReleaseYears);
  endYearSelection.addEventListener("input", validateReleaseYears);

  const gameBtn = document.createElement("button");
  gameBtn.classList.add("gameBtn");
  gameBtn.type = "button";
  gameBtn.textContent = "Play Game?";
  choiceContainer.appendChild(gameBtn);

  gameBtn.addEventListener("click", () => {
    window.location.href = "filmLocation/filmLocation.html";
  });

  recipePageBtn.addEventListener("click", () => {

    this.window.location.href = "recipe/recipe.html";
});
  
});
