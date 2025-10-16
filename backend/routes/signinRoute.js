import express from "express";
import { googleAuth } from "../Controllers/signinController.js";

const router = express.Router();

router.post("/auth/google", googleAuth);

export default router;
