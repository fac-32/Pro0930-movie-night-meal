window.addEventListener("load", async function () {
  const film = localStorage.getItem("filmTitle");
  const img = document.getElementById("city-img");
  const gameButton = document.querySelector(".gameBtn");
  const endGamePopup = document.getElementById("endGamePopup");
  const msgBoard = document.getElementById("msgBoard");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const userGuess = document.getElementById("userGuess");
  const keyboard = document.getElementById("virtualKeyboard");

  let word;
  let isGameOn = true;
  let childNodes;
  let maxGuessLeft = 6;

  //create input field
  function createInputFields() {
    for (let char of word) {
      let charInputDiv = document.createElement("div");
      charInputDiv.classList.add("userGuessLetter");
      userGuess.appendChild(charInputDiv);
    }
    childNodes = userGuess.childNodes;
  }
  
  // Endgame Msg

  function showPopup(msg) {
    msgBoard.textContent = msg;
    endGamePopup.classList.remove("hide");
    isGameOn = false;
  }
  
  // Getting the location 

  gameButton.addEventListener("click", async () => {
    img.src = "../images/loading-7528_256.gif";
    const response = await fetch("/get-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        input: `Provide one filming location for the movie ${film} from IMDB or Wikidata databases. The location should include both the city and country, and the answer must be no more than three words. If no official filming location exists, give the location where the original art or setting was established. Always prioritize filming locations from reputable sources, and do not respond with 'can't provide' or 'no info available' — instead, give the fallback location.`
      }),
    });
    if (!response.ok) {
      throw new Error(`Server error ${response.status}`);
    }
    const data = await response.json();
    const locationStr = data.result; // "tokyo, Japan"
    const [city, country] = locationStr.split(",").map((s) => s.trim());
    word = country.match(/[a-zA-Z]+/g).join(' ').toLowerCase();

    console.log(word);

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

    if (output.results && output.results.length > 0) {
      img.src = output.results[0].urls.small;
    } else {
      img.src = ""; // Or set a default/fallback image
    }

    createInputFields();

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

    // gameReset

    function gameReset() {
      isGameOn = true;
      maxGuessLeft = 6;
      msgBoard.textContent = "";
      endGamePopup.classList.add("hide");
      userGuess.innerHTML = "";
      createInputFields();
      keysContainer.forEach(key => {
        key.classList.remove("disable");
      }); 
    }

    //Game Logic 
    
    keysContainer.forEach((key) => {
      key.addEventListener('click', () => {
        if (!isGameOn) return;

        let letter = key.textContent;
        if (word.includes(letter)) {
          for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
              childNodes[i].textContent = letter;
            }
          }
        } else {
          key.classList.add("disable");
          maxGuessLeft -= 1;
        }

        const allRevealed = Array.from(childNodes).every(e => e.textContent !== "");
        if (allRevealed) {
          showPopup("You Win!");
        } else if (maxGuessLeft === 0) {
          showPopup("You Lose.");
        }
      });
    });

    playAgainBtn.addEventListener("click", function() {
      gameReset();
    });
  });
});
