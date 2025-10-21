import { getCurrentRating, populateRatingStars } from "./ratingsUtils.js";
import { applyMoviePalette } from "./colorPalette/colorPalette.js";

window.addEventListener("load", function () {
  const submitButton = document.getElementById("filterSubmit");
  const genreSelection = document.getElementById("genre");
  const startYearSelection = document.getElementById("startYear");
  const endYearSelection = document.getElementById("endYear");
  const errorMessage = document.getElementById("error-message");
  //const choiceContainer = document.getElementById("choice-container");

  const modal = document.getElementById("myModal");
  const span = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modalMovieTitle");
  const modalPoster = document.getElementById("modalMovieImg");
  const modalReleaseDate = document.getElementById("movieReleaseDate");
  const modalOverview = document.getElementById("movieOverview");
  const modalRatingContainer = document.getElementById("movieRatingContainer");
  const modalContent = document.querySelector(".modal-content");

  const modalSelectButton = document.getElementById("movieSelectButton");
  const wishlistButton = document.getElementById("addToWishlistButton");

  var validFilterInput = true;
  let addMovie = true;

  submitButton.addEventListener("click", async () => {
    if (!validFilterInput) {
      return;
    }

    console.log("Submitting choices");
    const currentGenreID = genreSelection.value;
    const startYear = startYearSelection.value;
    const endYear = endYearSelection.value;

    fetchMovies(currentGenreID, startYear, endYear, getCurrentRating());
  });

  async function fetchMovies(genreID, startYear, endYear, rating) {
    // get start and end year dates
    const startDate = new Date(startYear, 0, 1).toISOString().slice(0, 10);
    const endDate = new Date(endYear, 11, 31).toISOString().slice(0, 10);

    // call API - get movies
    const url = `/get-movies?genreID=${genreID}&startDate=${startDate}&endDate=${endDate}&rating=${rating}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();

      const movies = result.results;
      populateMovies(movies);
    } catch (error) {
      console.error(error.message);
    }
  }

  function populateMovies(movies) {
    const moviesContainer = document.getElementById("moviesContainer");
    moviesContainer.innerHTML = "";
    modalRatingContainer.innerHTML = "";

    movies.forEach((movie) => {
      const card = document.createElement("button");
      card.classList.add("movie-card");

      card.addEventListener("click", async () => {
        const email = localStorage.getItem("userEmail");
        if (email) {
          try {
            const res = await fetch(`/api/whishlist?userEmail=${email}`);
            if (res.ok) {
              const movieList = await res.json();
              const movieExists = movieList.includes(movie.title);
              addMovie = !movieExists;
              wishlistButton.innerHTML = movieExists
                ? "Remove From Wishlist"
                : "Add To Wishlist";
            } else {
              console.warn("Couldn't fetch wishlist for this user");
              wishlistButton.innerHTML = "Add To Wishlist";
            }
          } catch (error) {
            console.error("Error checking wishlist:", error);
            wishlistButton.innerHTML = "Add To Wishlist";
          }
        } else {
          wishlistButton.innerHTML = "Add To Wishlist";
        }

        modalRatingContainer.innerHTML = "";
        // populate movie modal
        modal.style.display = "flex";
        const baseBkgUrl =
          "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces";
        modalContent.style.backgroundImage = `url('${baseBkgUrl}${movie.backdrop_path}')`;
        modalTitle.textContent = `${movie.title} (${new Date(movie.release_date).getFullYear()})`;
        modalPoster.src = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
        modalPoster.onerror = function () {
          this.onerror = null;
          this.src = "./images/movie_poster_placeholder.png";
        };
        modalOverview.textContent = movie.overview;
        modalReleaseDate.textContent = `Release Date: ${new Date(movie.release_date).toLocaleDateString()}`;
        populateRatingStars(modalRatingContainer, movie.vote_average);

        localStorage.setItem("filmTitle", movie.title);
        localStorage.setItem("movieInfo", JSON.stringify(movie));
      });

      const img = document.createElement("img");
      img.src = `https://media.themoviedb.org/t/p/w220_and_h330_face${movie.poster_path}`;
      img.alt = movie.title;
      img.onerror = function () {
        this.onerror = null;
        this.src = "./images/movie_poster_placeholder.png";
      };
      card.appendChild(img);

      const info = document.createElement("div");
      info.classList.add("movie-info");

      const nameEl = document.createElement("h3");
      nameEl.textContent = movie.title;
      const dateEl = document.createElement("p");
      const options = { year: "numeric", month: "long", day: "2-digit" };
      dateEl.textContent = new Date(movie.release_date).toLocaleDateString(
        "en-US",
        options,
      );

      info.appendChild(nameEl);
      info.appendChild(dateEl);

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

  modalSelectButton.addEventListener("click", () => {
    window.location.href = "recipe/recipe.html";
  });

  wishlistButton.addEventListener("click", async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        alert("⚠️ Please sign in with Google first!");
        return;
      }

      const movieTitle = localStorage.getItem("filmTitle");
      if (!movieTitle) {
        alert("⚠️ Please select a movie first!");
        return;
      }

      //  Add movie
      if (addMovie) {
        const movieInfo = JSON.parse(localStorage.getItem("movieInfo") || "{}");

        const addRes = await fetch("/api/whishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieName: movieTitle,
            userEmail: email,
            movieInfo: movieInfo,
          }),
        });

        if (addRes.ok) {
          alert(`✅ "${movieTitle}" added to your wishlist!`);
          wishlistButton.innerHTML = "Remove From Wishlist";
          addMovie = false;
          return;
        } else {
          const errData = await addRes.json();
          console.error("Failed to add movie:", errData.message);
          alert("⚠️ Something went wrong while adding.");
        }
      }
      // Remove movie
      else {
        const delRes = await fetch("/api/whishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieName: movieTitle,
            userEmail: email,
          }),
        });

        if (delRes.ok) {
          alert(`❌ "${movieTitle}" removed from your wishlist.`);
          wishlistButton.innerHTML = "Add To Wishlist";
          addMovie = true;
        } else {
          alert("⚠️ Failed to remove movie from wishlist.");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("⚠️ Error connecting to server.");
    }
  });
});
