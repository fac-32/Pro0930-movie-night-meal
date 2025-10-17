import express from "express";
import { getMovie } from "../Controllers/movieController.js";

const router = express.Router();

router.get("/get-movies", getMovie);

export default router;
