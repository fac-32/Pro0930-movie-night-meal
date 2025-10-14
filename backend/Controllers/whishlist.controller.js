import mongoose from "mongoose";
import Whishlist from "../models/wishlist.model.js";

export const getMovies = async (req, res) => {

};

export const addMovie = async (req, res) => {
    const movie = req.body;
  if (!movie.movieName) {
    return res
      .status(400)
      .json({ success: false, message: "no movie name found" });
   }

  const newMovie = new Whishlist(movie);

  try {
    await newMovie.save();
    res.status(201).json({ success: true, data: newMovie });
  } catch (error) {
    console.log("Error in adding movie: ", error.message);
    res.status(500).jsonp({ success: false, message: "server error" });
  }
};

export const deleteMovie = async (req, res) => {

};