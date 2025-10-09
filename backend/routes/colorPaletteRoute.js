// server/routes/palette.js
import { Router } from "express";
import { getColorsForMovie } from "../components/colorPaletteFunction.js";

export const paletteRouter = Router();

// POST /api/palette  { "title": "Inception" }
paletteRouter.post("/", async (req, res) => {
  try {
    const { title, randomPixels } = req.body || {};
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'title' string in body" });
    }

    const { palette } = await getColorsForMovie(
      title,
      randomPixels,
      process.env.OPENAI_API_KEY
    );
    return res.json({ ok: true, palette });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// /api/palette/hello
//paletteRouter.post("/hello", async (req, res) => {})
