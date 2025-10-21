window.addEventListener("load", async function () {
  const film = localStorage.getItem("filmTitle");
  const pageTitle = document.getElementById("gameHeader");
  const img = document.getElementById("city-img");
  const gameButton = document.querySelector(".gameBtn");
  const endGamePopup = document.getElementById("endGamePopup");
  const emoji = document.getElementById("emoji");
  const msgBoard = document.getElementById("msgBoard");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const hints = document.getElementById("hints");
  const userGuess = document.getElementById("userGuess");
  const keyboard = document.getElementById("virtualKeyboard");
  const hangmanDiv = document.getElementById("hangman-image-side");

  pageTitle.textContent = `Guess the "${film}" movie's filming location`;

  let titleCaseWord;
  let guessWord;
  let isGameOn = true;
  let childNodes;
  let maxGuessLeft = 6;
  let imgIndex = 0;
  let win = "../images/victory.gif";
  let lose = "../images/lost.gif";

  let lastGameResult = null;

  // Store session activity
  function saveState() {
    sessionStorage.setItem(
      "hangmanState",
      JSON.stringify({
        guessWord,
        isGameOn,
        maxGuessLeft,
        imgIndex,
        childNodesText: Array.from(childNodes).map((n) => n.textContent),
        lastGameResult,
        imgSrc: img.src,
      }),
    );
  }

  // Page refresh
  function loadState() {
    const stateStr = sessionStorage.getItem("hangmanState");
    if (!stateStr) return false;

    try {
      const state = JSON.parse(stateStr);

      guessWord = state.guessWord || "";
      isGameOn = state.isGameOn !== undefined ? state.isGameOn : true;
      maxGuessLeft = state.maxGuessLeft || 6;
      imgIndex = state.imgIndex || 0;
      lastGameResult = state.lastGameResult || null;
      img.src = state.imgSrc || "";

      // Setup UI elements
      userGuess.innerHTML = "";
      createInputFields();
      for (let i = 0; i < childNodes.length; i++) {
        childNodes[i].textContent = state.childNodesText?.[i] || "";
      }

      loadHangmanImg(imgIndex);

      const keys = Array.from(keyboard.children);
      keys.forEach((k) =>
        state.guessedKeys?.includes(k.textContent)
          ? k.classList.add("disable")
          : k.classList.remove("disable"),
      );

      if (!isGameOn && lastGameResult) {
        showPopup(
          lastGameResult === "win" ? "You Win!" : "You Lose.",
          capitalizeEachWord(guessWord),
          lastGameResult === "win" ? win : lose,
        );
      }

      return true;
    } catch (e) {
      console.error("Failed to load state:", e);
      return false;
    }
  }

  //create input field

  function createInputFields() {
    for (let char of guessWord) {
      let charInputDiv = document.createElement("div");
      charInputDiv.classList.add("userGuessLetter");
      userGuess.appendChild(charInputDiv);
    }
    childNodes = userGuess.childNodes;
  }

  // Endgame Msg

  function showPopup(msg, country, url) {
    emoji.src = url;
    msgBoard.textContent = `${msg} Answer: ${country}`;
    endGamePopup.classList.remove("hide");
    isGameOn = false;
  }

  // Load Hangman Image

  function loadHangmanImg(imgIndex) {
    let hangmanImg = `../images/hangman-${imgIndex}.png`;
    hangmanDiv.innerHTML = `<img src=${hangmanImg}>`;
  }

  // Capitalize First Letter

  function capitalizeEachWord(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Create Virtual Keyboard

  function initKeyboard() {
    const keys = [
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
    ];

    keyboard.innerHTML = "";

    for (let key of keys) {
      const keyBtn = document.createElement("button");
      keyBtn.classList.add("keys");
      keyBtn.setAttribute("type", "button");
      keyBtn.textContent = key;
      keyboard.appendChild(keyBtn);
    }
  }

  // Game Reset

  function gameReset(fullReset = false) {
    isGameOn = true;
    maxGuessLeft = 6;
    imgIndex = 0;
    loadHangmanImg(imgIndex);
    msgBoard.textContent = "";
    endGamePopup.classList.add("hide");
    userGuess.innerHTML = "";
    createInputFields();
    const keysContainer = document.querySelectorAll(".keys");
    keysContainer.forEach((key) => {
      key.classList.remove("disable");
    });
    if (fullReset) {
      img.removeAttribute('src');;
    }
    lastGameResult = null;
    saveState();
  }

  // Game Logic

  function keyboardListener() {
    const keysContainer = document.querySelectorAll(".keys");
    keysContainer.forEach((key) => {
      key.addEventListener("click", () => {
        if (!isGameOn) return;

        let letter = key.textContent;
        if (guessWord.includes(letter)) {
          for (let i = 0; i < guessWord.length; i++) {
            if (guessWord[i] === letter) {
              childNodes[i].textContent = letter;
            }
          }
        } else {
          key.classList.add("disable");
          maxGuessLeft -= 1;
          imgIndex += 1;
          loadHangmanImg(imgIndex);
        }

        const allRevealed = Array.from(childNodes).every(
          (e) => e.textContent !== "",
        );
        if (allRevealed) {
          lastGameResult = "win";
          saveState();
          showPopup("You Win!", titleCaseWord, win);
        } else if (maxGuessLeft === 0) {
          lastGameResult = "lose";
          saveState();
          showPopup("You Lose.", titleCaseWord, lose);
        } else {
          saveState();
        }
      });
    });
  }

  // Getting the location
  gameButton.addEventListener("click", async () => {
    img.src = "../images/loading-7528_256.gif";
    const response = await fetch("/get-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        input: `Given a movie title ${film}, return the main filming location in the Json format result: State/City, Country (e.g., "Texas, USA" or "London, England"). Use verified filming locations from IMDB or Wikidata. If in the USA, output the State(one of the 59 states of the USA) and Country(USA); otherwise, output City and Country. If no official filming location exists, provide the original art or story setting from reputable sources. Always respond with recognized locations, keeping the answer to max three words. Return JSON format, {result: State/City, Country}.`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Server error ${response.status}`);
    }

    const data = await response.json();

    const locationStrRaw = data.result; // e.g. '```json\n{"result": "Tokyo, Japan"}\n```

    // Remove the markdown code block markers and extra whitespace
    const locationJsonStr = locationStrRaw
      .replace(/```json\s*/g, '') // Remove opening ```
      .replace(/```/g, '')         // Remove closing ```
      .trim();

    let locationData;
    try {
      locationData = JSON.parse(locationJsonStr); // Parse pure JSON string
    } catch (e) {
      console.error("Failed to parse location JSON:", e);
      throw e;
    }

    const locationStr = locationData.result;
    

    let [city, country] = locationStr.split(",").map((s) => s.trim());
    

    if (!country) {
      country = city;
      console.log("Updated Country:", country);
    } 
    
    if (country.toLowerCase() === "usa" || country.toLowerCase() === "us") {
      // If the country is USA, we only need the state
      country = city;
      console.log("Updated Country (State):", country);
    } 

    // Getting ONLY letters for guessing
    let word = country
      .match(/[a-zA-Z]+/g)
      .join(" ")
      .toLowerCase();

    titleCaseWord = capitalizeEachWord(word);
    guessWord = word.replace(/\s+/g, "");

    hints.textContent = "Hint: It's Country/State, but not City";

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

    const output = await result.json();

    console.log("Image search results:", output.results);

    if (output.results && output.results.length > 1) {
      const randomIndex = Math.floor(Math.random() * output.results.length);
      img.src = output.results[randomIndex].urls.small;
    } else if (output.results && output.results.length === 1) {
      img.src = output.results[0].urls.small;
    } else {
      img.removeAttribute('src');
    }

    createInputFields();
    initKeyboard();
    keyboardListener();
    gameReset(false);
    lastGameResult = null;
    saveState();
  });

  playAgainBtn.addEventListener("click", function () {
    if (lastGameResult === "win") {
      sessionStorage.clear();
      gameReset(true);
      gameButton.click();
    } else if (lastGameResult === "lose") {
      gameReset(false);
    }
  });

  window.addEventListener("popstate", () => {
    sessionStorage.clear();
    img.removeAttribute('src');;
    gameReset(true);
  });

  const movie = JSON.parse(localStorage.getItem("movieInfo"));
  console.log(movie);
  const secondBkg = `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`;
  if (secondBkg) {
    document.body.style.setProperty(
      "--recipe-background-image",
      `url(${secondBkg})`,
    );
  } else {
    document.body.style.removeProperty("--recipe-background-image");
  }
});
