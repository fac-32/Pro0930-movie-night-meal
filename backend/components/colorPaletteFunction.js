import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const MODEL = "gpt-4o-2024-08-06";

const HslColor = z.object({
  h: z.number().finite().min(0).max(360),
  s: z.number().finite().min(0).max(100),
  l: z.number().finite().min(0).max(100),
});
const ColorPaletteSchema = z.object({
  palette: z.array(HslColor).length(5),
});

const formatHslKey = (h, s, l) =>
  `${Math.round(Number(h))}|${Math.round(Number(s))}|${Math.round(Number(l))}`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toCssHsl = ({ h, s, l }) =>
  `hsl(${Math.round(Number(h))}, ${Math.round(Number(s))}%, ${Math.round(
    Number(l)
  )}%)`;

const adjustBgColor = ({ h, s, l }) => ({
  h,
  s: Math.min(Math.round(Number(s)), 35),
  l: Math.min(Math.round(Number(l)), 35),
});

const adjustTextColor = ({ h, s, l }) => {
  const roundedS = Math.round(Number(s));
  const roundedL = Math.round(Number(l));

  const cappedS = Math.min(roundedS, 70);

  if (roundedL > 50) {
    return {
      h,
      s: cappedS,
      l: Math.max(roundedL, 75),
    };
  }

  return {
    h,
    s: cappedS,
    l: Math.min(roundedL, 25),
  };
};

const CSS_VARIABLE_KEYS = [
  "--color-primary",
  "--bg-color",
  "--section-bg-color",
  "--text-color-accent",
  "--text-color",
];

export async function getColorsForMovie(movieTitle, sampledPixels, apiKey) {
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
2) The output must contain exactly 5 colors expressed as HSL objects with integer values, e.g., {"h": 12, "s": 65, "l": 48}.
3) Choose for background color the most frequently occurring colors from samples.
4) Choose --text-color and --section-bg-color so that they form a visually appealing and readable contrast pair — one for background of section and one for text.
Make sure the pair has enough contrast (at least WCAG 2.1 ratio 4.5:1) and looks harmonious together.
5) color primary should be accent color

`,
      },
      {
        role: "user",
        content: `I will give you ~200 pixel samples from a movie poster. Each pixel is an object with {x, y, h, s, l}.
Hue (h) is 0-360 degrees, Saturation (s) and Lightness (l) are percentages (0-100). Use these values directly when selecting colors.

Samples:
${JSON.stringify(sampledPixels)}
`,
      },
    ],
    text: {
      format: zodTextFormat(ColorPaletteSchema, "color_palette"),
    },
  });
  const parsedPalette = response.output_parsed.palette;

  const validColorSet = new Set(
    (Array.isArray(sampledPixels) ? sampledPixels : [])
      .map(({ h, s, l }) => {
        if (
          typeof h === "undefined" ||
          typeof s === "undefined" ||
          typeof l === "undefined"
        ) {
          return null;
        }
        return formatHslKey(h, s, l);
      })
      .filter(Boolean)
  );

  const invalidColors = parsedPalette.filter(
    (color) => !validColorSet.has(formatHslKey(color.h, color.s, color.l))
  );

  if (invalidColors.length > 0) {
    console.error(
      "OpenAI palette contains colors outside the input samples:",
      invalidColors
    );
    throw new Error("Received colors not present in input samples.");
  }

  const palette = CSS_VARIABLE_KEYS.reduce((acc, key, index) => {
    const hslColor = parsedPalette[index];
    let adjustedColor = hslColor;

    if (key === "--bg-color") {
      adjustedColor = adjustBgColor(hslColor);
    } else if (key === "--text-color") {
      adjustedColor = adjustTextColor(hslColor);
    }

    acc[key] = toCssHsl(adjustedColor);
    return acc;
  }, {});

  return { palette };
}
