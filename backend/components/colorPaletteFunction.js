import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
//import { clearColorPaletteCache } from "../components/clearColorPaletteCache.js";

const MODEL = "gpt-4o-2024-08-06";

export const cachingPalette = {};

const HslColor = z.object({
  h: z.number().finite().min(0).max(360),
  s: z.number().finite().min(0).max(100),
  l: z.number().finite().min(0).max(100),
});
const ColorPaletteSchema = z.object({
  palette: z.array(HslColor).length(2),
});

const formatHslKey = (h, s, l) =>
  `${Math.round(Number(h))}|${Math.round(Number(s))}|${Math.round(Number(l))}`;

const normalizeHue = (value) => {
  const rounded = Math.round(Number(value));
  return ((rounded % 360) + 360) % 360;
};

const clampPercent = (value) =>
  Math.max(0, Math.min(100, Math.round(Number(value))));

const normalizeHsl = ({ h, s, l }) => ({
  h: normalizeHue(h),
  s: clampPercent(s),
  l: clampPercent(l),
});

const toCssHsl = ({ h, s, l }) =>
  `hsl(${Math.round(Number(h))}, ${Math.round(Number(s))}%, ${Math.round(
    Number(l),
  )}%)`;

const adjustBgColor = (color) => {
  const base = normalizeHsl(color);
  return {
    h: base.h,
    s: Math.max(15, Math.min(base.s, 25)),
    l: Math.max(15, Math.min(base.l, 25)),
  };
};

const adjustTextColor = (color) => {
  const base = normalizeHsl(color);
  const cappedS = Math.min(base.s, 70);

  return {
    h: base.h,
    s: cappedS,
    l: clampPercent(Math.max(base.l, 85)),
  };
};

const deriveAccentColor = (color) => {
  const base = normalizeHsl(color);
  return {
    h: base.h,
    s: clampPercent(base.s + 20),
    l: clampPercent(base.l - 20),
  };
};

const deriveSectionColor = (color) => {
  const base = normalizeHsl(color);
  return {
    h: base.h,
    s: clampPercent(base.s + 10),
    l: clampPercent(base.l + 10),
  };
};

const CSS_VARIABLE_KEYS = ["--bg-color", "--text-color"];

export async function getColorsForMovie(movieTitle, sampledPixels, apiKey) {
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  //if need to clear cache - use this line below and import on the top
  //clearColorPaletteCache();

  //CACHING
  // validation of exist palette or new one
  const cacheKey =
    typeof movieTitle === "string" && movieTitle.trim().length > 0
      ? movieTitle.trim()
      : null;
  if (cacheKey && cachingPalette[cacheKey]) {
    const cached = cachingPalette[cacheKey];
    //console.log(`use existing palette for ${cacheKey}`);
    return { palette: { ...cached.palette } };
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse({
    model: MODEL,
    input: [
      {
        role: "system",
        content: `You are a deterministic color extractor and explainer.

Your task: Select exactly 2 representative colors from the provided pixel samples.

Rules:
1) You MUST use only the colors explicitly present in the input. Never invent, modify, average, or guess new colors.
2) The output must contain exactly 2 colors expressed as HSL objects with integer values, e.g., {"h": 12, "s": 65, "l": 48}.
3) From the list of colors in samplePixels, find the two colors. These two colors must form the most contrasting pair — 
they must be visually distinct enough to be used together (for example, one as background and the other as text). 
Make sure the pair has enough contrast (at least WCAG 2.1 ratio 4.5:1) and looks harmonious together.


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
      .filter(Boolean),
  );

  // const invalidColors = parsedPalette.filter(
  //   (color) => !validColorSet.has(formatHslKey(color.h, color.s, color.l))
  // );

  // if (invalidColors.length > 0) {
  //   console.error(
  //     "OpenAI palette contains colors outside the input samples:",
  //     invalidColors
  //   );
  //   throw new Error("Received colors not present in input samples.");
  // }

  const resolvedColors = CSS_VARIABLE_KEYS.reduce((acc, key, index) => {
    const hslColor = parsedPalette[index];
    if (!hslColor) {
      throw new Error(`Missing color data for "${key}".`);
    }

    let adjustedColor = hslColor;

    if (key === "--bg-color") {
      adjustedColor = adjustBgColor(hslColor);
    } else if (key === "--text-color") {
      adjustedColor = adjustTextColor(hslColor);
    }

    acc[key] = normalizeHsl(adjustedColor);
    return acc;
  }, {});

  const textColor = resolvedColors["--text-color"];
  const bgColor = resolvedColors["--bg-color"];

  if (textColor) {
    resolvedColors["--text-color-accent"] = deriveAccentColor(textColor);
  }

  if (bgColor) {
    resolvedColors["--section-bg-color"] = deriveSectionColor(bgColor);
  }

  const palette = Object.entries(resolvedColors).reduce((acc, [key, color]) => {
    acc[key] = toCssHsl(color);
    return acc;
  }, {});

  //create new value in object to cachcing palette for furher req
  const result = { palette };

  if (cacheKey) {
    cachingPalette[cacheKey] = { palette: { ...palette } };
    //console.log(`create new palette for ${cacheKey}`);
  }

  return result;
}
