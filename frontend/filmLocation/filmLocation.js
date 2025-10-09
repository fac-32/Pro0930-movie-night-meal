window.addEventListener("load", async function () {
  const film = localStorage.getItem("filmTitle");
  const userGuess = document.getElementById("location");
  const gameButton = document.querySelector(".gameBtn");
  const img = document.getElementById("city-img");

  console.log(gameButton);
  gameButton.addEventListener("click", async () => {
    img.src = "Images/loading-7528_256.gif"
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
    const locationStr = data.result;          // "tokyo, Japan"
    const [city, country] = locationStr.split(',').map(s => s.trim());
    console.log(data);
  
    const params = new URLSearchParams ({
      query: city, country,
      per_page: 1,
      order_by: 'relevant'
    });

    const result = await fetch("/get-image", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: params.toString() })
    });
    console.log('This is working');
    const output = await result.json();

    console.log(output);

    if (output.results && output.results.length > 0) {
      img.src = output.results[0].urls.small;
    } else {
      img.src = ''; // Or set a default/fallback image
    }
  });
});
