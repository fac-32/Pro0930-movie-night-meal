// ratings buttons
const ratingStar1Button = document.getElementById("starRating_1");
const ratingStar2Button = document.getElementById("starRating_2");
const ratingStar3Button = document.getElementById("starRating_3");
const ratingStar4Button = document.getElementById("starRating_4");
const ratingStar5Button = document.getElementById("starRating_5");

const ratingStars = [
  ratingStar1Button,
  ratingStar2Button,
  ratingStar3Button,
  ratingStar4Button,
  ratingStar5Button,
];

var currentRating = 0;

// ratings
ratingStars.forEach((starButton, index) => {
  starButton.addEventListener("click", () => {
    console.log(index + 1);

    for (let i = 0; i < ratingStars.length; i++) {
      const shouldFade = i > index;
      ratingStars[i].style.opacity = shouldFade ? "0.3" : "1";
    }

    currentRating = index + 1;
  });

  starButton.style.opacity = "0.3";
});

export function getCurrentRating() {
  return currentRating;
}

export function getStarCount(value) {
  if (value >= 8) return 5;
  if (value >= 6) return 4;
  if (value >= 4) return 3;
  if (value >= 2) return 2;
  if (value >= 1) return 1;
  return 0;
}

export function populateRatingStars(ratingContainer, ratingValue) {
  const numberOfStars = getStarCount(ratingValue);

  for (let index = 0; index < numberOfStars; index++) {
    const star = document.createElement("img");
    star.src = "./images/Star.png";
    star.width = 30;
    star.height = 30;
    ratingContainer.appendChild(star);
  }
}
