import express from "express";
import { getLocation } from "../Controllers/locationController.js";
import { getImage } from "../Controllers/imageController.js";

const router = express.Router();

router.post("/get-location", getLocation);
router.post("/get-image", getImage);

export default router;

