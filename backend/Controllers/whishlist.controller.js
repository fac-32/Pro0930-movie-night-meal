import mongoose from "mongoose";
import Whishlist from "../models/wishlist.model.js";

export const getMovies = async (req, res) => {
  const { userEmail } = req.query; // get userEmail from query string

  if (!userEmail) {
    return res
      .status(400)
      .json({ success: false, message: "User email is required" });
  }

  try {
    const movies = await Whishlist.find({ userEmail }, "movieName -_id");

    const movieNames = movies.map((movie) => movie.movieName);

    res.status(200).json(movieNames);
  } catch (error) {
    console.error("Error fetching movies: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addMovie = async (req, res) => {
  const { movieName, userEmail } = req.body;

  if (!movieName || !userEmail) {
    return res
      .status(400)
      .json({ success: false, message: "No movie name and/or email found" });
  }

  try {
    // 🟡 Check if this movie already exists for this user
    const existingMovie = await Whishlist.findOne({ movieName, userEmail });

    if (existingMovie) {
      return res
        .status(409) // conflict
        .json({ success: false, message: "Movie already exists in wishlist" });
    }

    // 🟢 If not, create and save new entry
    const newMovie = new Whishlist({ movieName, userEmail });
    await newMovie.save();

    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    console.error("Error in adding movie: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMovie = async (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id) || userEmail === "") {
    return res
      .status(404)
      .json({ success: false, message: "invalid movie ID and/or email" });
  }

  try {
    const deletedMovie = await Whishlist.findOneAndDelete({
      _id: id,
      userEmail: userEmail,
    });

    if (!deletedMovie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found for this user" });
    }

    res.status(200).json({ success: true, message: "Movie deleted" });
  } catch (error) {
    console.log("error in deleting Movie: ", error.message);
    res.status(500).json({ success: false, message: "server error" });
  }
};
