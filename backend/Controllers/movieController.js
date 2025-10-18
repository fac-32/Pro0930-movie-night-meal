import fetch from "node-fetch";

export const getMovie = async (req, res) => {
  try {
    const genreID = req.query.genreID;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const rating = req.query.rating;

    const voteValue = rating * 2 - 2;

    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=1&with_genres=${genreID}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&vote_average.gte=${voteValue}&api_key=${process.env.TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    res.send(result);
  } catch (error) {
    console.error(error.message);
  }
};
