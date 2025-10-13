window.addEventListener("load", async function () {
  const film = localStorage.getItem("filmTitle");
  const gameButton = document.querySelector(".gameBtn");
  const img = document.getElementById("city-img");
  const userGuess = document.getElementById("userGuess");
  const scoreBoard = document.getElementById("scoreBoard");
  const keyboard = document.getElementById("virtualKeyboard");

  const word = "tokyo";

  // Getting the location 

  gameButton.addEventListener("click", async () => {
    img.src = "../images/loading-7528_256.gif";
    const response = await fetch("/get-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        input: `Give one verified filming location of the movie ${film}. It should be from the IMDB/Wikidata databases and include the name of the city and country where the movie was filmed. Provide the answer in a maximum of three words. Always return with a city, country.`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Server error ${response.status}`);
    }
    const data = await response.json();
    const locationStr = data.result; // "tokyo, Japan"
    const [city, country] = locationStr.split(",").map((s) => s.trim());
    word = country;

    // Getting the Image
    const params = new URLSearchParams({
      query: country,
      per_page: 1,
      order_by: "relevant",
    });

    const result = await fetch("/get-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: params.toString() }),
    });
    console.log("This is working");
    const output = await result.json();

    console.log(output);

    if (output.results && output.results.length > 0) {
      img.src = output.results[0].urls.small;
    } else {
      img.src = ""; // Or set a default/fallback image
    }
  });

  //create input field
  for (let char of word) {
    let charInputDiv = document.createElement("div");
    charInputDiv.classList.add("userGuessLetter");
    userGuess.appendChild(charInputDiv);
  }

  let childNodes = userGuess.childNodes;
  let maxGuess = 6;

  // Creating Virtual Keyboard
  const keys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
  for (let key of keys) {
    const keyBtn = document.createElement("button");
    keyBtn.classList.add("keys");
    keyBtn.setAttribute("type", "button");
    keyBtn.textContent = key;
    keyboard.appendChild(keyBtn);
  };
  
  const keysContainer = document.querySelectorAll('.keys');
  
  keysContainer.forEach((key) => {
    key.addEventListener('click', () => {
      const letter = key.textContent;
      if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            childNodes[i].textContent = letter;
          }
        }
      } else {
        key.classList.add("disable");
        
      }
    });
  });
});
