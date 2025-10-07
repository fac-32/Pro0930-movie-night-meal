window.addEventListener("load", function () {
  const film = localStorage.getItem("filmTitle");
  const location = document.getElementById("location");
  const gameButton = document.querySelector(".gameBtn");

  console.log(gameButton);
  gameButton.addEventListener("click", async () => {
    console.log("this is working");
    const response = await fetch("/get-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        input: `Give one verified filming location of the movie ${film}. It should be from the IMDB/Wikidata databases and include the name of the city and country where the movie was filmed. Provide the answer in a maximum of three words.`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Server error ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    location.textContent = data.result;
  });
});
