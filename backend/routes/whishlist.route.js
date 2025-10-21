import express from "express";

import {
  addMovie,
  deleteMovie,
  getMovies,
} from "../Controllers/whishlist.controller.js";

const router = express.Router();

router.get("/", getMovies);
router.post("/", addMovie);
router.delete("/", deleteMovie);

export default router;
