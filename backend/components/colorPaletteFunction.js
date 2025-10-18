import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const MODEL = "gpt-4o-2024-08-06";

const HexColor = z.string().regex(/^#([0-9A-Fa-f]{6})$/);
const ColorPaletteSchema = z.object({
  palette: z.array(HexColor).length(5),
});
const CSS_VARIABLE_KEYS = [
  "--color-primary",
  "--bg-color",
  "--section-bg-color",
  "--text-color-accent",
  "--text-color",
];

export async function getColorsForMovie(movieTitle, randomPixels, apiKey) {
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse({
    model: MODEL,
    input: [
      {
        role: "system",
        content: `You are a deterministic color extractor and explainer.

Your task: Select exactly 5 representative colors from the provided pixel samples.

Rules:
1) You MUST use only the colors explicitly present in the input. Never invent, modify, average, or guess new colors.  
2) The output must contain exactly 5 colors in HEX format, uppercase, e.g., "#C80200". 
3) Choose for background color the most frequently occurring colors from samples.
4) Ensure --text-color is legible on section background color.
5) color primary should be accent color
`,
      },
      {
        role: "user",
        content: `I will give you N=100 pixel samples from a movie poster. Each pixel is an object with {x, y, r, g, b}.  

Samples:
${JSON.stringify(randomPixels)}
`,
      },
    ],
    text: {
      format: zodTextFormat(ColorPaletteSchema, "color_palette"),
    },
  });
  const parsedPalette = response.output_parsed.palette;

  const palette = CSS_VARIABLE_KEYS.reduce((acc, key, index) => {
    acc[key] = parsedPalette[index];
    return acc;
  }, {});

  return { palette };
}
