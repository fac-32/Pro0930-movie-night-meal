import mongoose from "mongoose";
import Whishlist from "../models/wishlist.model.js";

export const getMovies = async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ success: false, message: "User email is required" });
  }

  try {
    const movies = await Whishlist.find({ userEmail }, "movieName movieInfo -_id"); // ✅ include movieInfo
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const addMovie = async (req, res) => {
  const { movieName, userEmail, movieInfo } = req.body;

  if (!movieName || !userEmail) {
    return res
      .status(400)
      .json({ success: false, message: "No movie name and/or email found" });
  }

  try {
    const existingMovie = await Whishlist.findOne({ movieName, userEmail });

    if (existingMovie) {
      return res
        .status(409)
        .json({ success: false, message: "Movie already exists in wishlist" });
    }

    const newMovie = new Whishlist({ movieName, userEmail, movieInfo });
    await newMovie.save();

    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    console.error("Error in adding movie: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteMovie = async (req, res) => {
  const { movieName, userEmail } = req.body;

  if (!movieName || !userEmail) {
    return res.status(400).json({ success: false, message: "Missing movieName or userEmail" });
  }

  try {
    const deletedMovie = await Whishlist.findOneAndDelete({ movieName, userEmail });

    if (!deletedMovie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    res.status(200).json({ success: true, message: "Movie deleted" });
  } catch (err) {
    console.error("Error deleting movie:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



