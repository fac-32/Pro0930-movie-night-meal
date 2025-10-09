import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const MODEL = "gpt-4o-2024-08-06";

const HexColor = z.string().regex(/^#([0-9A-Fa-f]{6})$/);

const ColorPaletteSchema = z.object({
  "--color-primary": HexColor,
  "--bg-color": HexColor,
  "--section-bg-color": HexColor,
  "--text-color-accent": HexColor,
  "--text-color": HexColor,
});

export async function getColorsForMovie(movieTitle, randomPixels, apiKey) {
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse({
    model: MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a film-savvy color designer creating UI palettes. Respond with JSON only—no explanations, markdown, or prose. Each palette must include exactly five six-digit hex colors under the keys: --color-primary, --bg-color, --section-bg-color, --text-color-accent, --text-color.",
      },
      {
        role: "user",
        content: `Here are some pixles with colors from cinema poster: ${randomPixels}`,
      },
      {
        role: "user",
        content: `Movie title: "${movieTitle}". Craft a cohesive palette inspired by the film's mood, cinematography, and era. Ensure --text-color is legible on --bg-color.`,
      },
    ],
    text: {
      format: zodTextFormat(ColorPaletteSchema, "color_palette"),
    },
  });

  return { palette: response.output_parsed };
}
