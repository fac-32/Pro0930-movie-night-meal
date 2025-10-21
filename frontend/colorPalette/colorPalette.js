const REQUIRED_PALETTE_KEYS = [
  "--bg-color",
  "--text-color",
  "--text-color-accent",
  "--section-bg-color",
];

const root = document.documentElement;
const TMDB_IMAGE_HOSTS = new Set(["image.tmdb.org", "media.themoviedb.org"]);

const buildPaletteImageUrl = (inputUrl) => {
  console.debug("buildPaletteImageUrl input", inputUrl);
  if (!inputUrl || typeof inputUrl !== "string") {
    return inputUrl;
  }

  try {
    const parsed = new URL(inputUrl, window.location.href);
    if (parsed.origin === window.location.origin) {
      console.debug("buildPaletteImageUrl local origin", parsed.href);
      return parsed.href;
    }

    if (parsed.protocol === "https:" && TMDB_IMAGE_HOSTS.has(parsed.hostname)) {
      const proxyUrl = `/api/palette/image?url=${encodeURIComponent(parsed.href)}`;
      console.debug("buildPaletteImageUrl proxy", proxyUrl);
      return proxyUrl;
    }

    console.warn("Unexpected palette image origin:", parsed.origin);
  } catch (error) {
    console.warn("Failed to parse image URL for palette:", error);
  }

  console.debug("buildPaletteImageUrl passthrough", inputUrl);
  return inputUrl;
};

const rgbToHsl = (r, g, b) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const setMovieColors = (palette) => {
  REQUIRED_PALETTE_KEYS.forEach((cssVar) => {
    const value = palette?.[cssVar];
    if (typeof value === "string") {
      root.style.setProperty(cssVar, value);
    }
  });
};

const isValidHslString = (color) =>
  typeof color === "string" &&
  /hsl\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?%\s*,\s*-?\d+(?:\.\d+)?%\s*\)/i.test(
    color,
  );

// can be replaces with .modalPoster selector
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src || typeof src !== "string") {
      reject(new Error("loadImage requires a non-empty string URL."));
      return;
    }

    const image = new Image(); // <img src=src>
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load image from URL: ${src}`));
    image.src = src;
  });
}

async function fetchPaletteFromLocalStorage({ sampledPixels }) {
  const storageKey = "filmTitle";

  const title = localStorage.getItem(storageKey);
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error(
      `No movie title found in localStorage under key "${storageKey}".`,
    );
  }

  const res = await fetch("/api/palette", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.trim(),
      sampledPixels,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || !payload?.ok) {
    const msg = payload?.error || `HTTP ${res.status}`;
    throw new Error(`Palette request failed: ${msg}`);
  }

  const palette = payload?.palette;
  if (!palette || typeof palette !== "object") {
    throw new Error("Palette response malformed (expected palette object).");
  }

  for (const key of REQUIRED_PALETTE_KEYS) {
    const value = palette[key];
    if (!isValidHslString(value)) {
      throw new Error(`Palette is missing a valid HSL color for "${key}".`);
    }
  }

  return palette;
}

async function getPixelsFromImageUrl(imageUrl) {
  const image = await loadImage(imageUrl);

  const width = Math.max(1, image.naturalWidth || image.width);
  const height = Math.max(1, image.naturalHeight || image.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Unable to acquire 2D canvas context.");
  }

  context.drawImage(image, 0, 0, width, height);

  const totalPixels = width * height;
  if (!Number.isFinite(totalPixels) || totalPixels <= 0) {
    throw new Error("Image has invalid dimensions.");
  }

  const TARGET_SAMPLE_COUNT = 200;
  const aspectRatio = width / height;
  const approxCols = Math.max(
    1,
    Math.ceil(Math.sqrt(TARGET_SAMPLE_COUNT * aspectRatio)),
  );
  const approxRows = Math.max(1, Math.ceil(TARGET_SAMPLE_COUNT / approxCols));

  const cellWidth = width / approxCols;
  const cellHeight = height / approxRows;
  const sampledPixels = [];

  for (let row = 0; row < approxRows; row += 1) {
    for (let col = 0; col < approxCols; col += 1) {
      const centerX = Math.min(
        width - 1,
        Math.max(0, Math.floor(col * cellWidth + cellWidth / 2)),
      );
      const centerY = Math.min(
        height - 1,
        Math.max(0, Math.floor(row * cellHeight + cellHeight / 2)),
      );

      const { data } = context.getImageData(centerX, centerY, 1, 1);
      const [r, g, b, a] = data;
      const { h, s, l } = rgbToHsl(r, g, b);

      sampledPixels.push({
        x: centerX,
        y: centerY,
        h,
        s,
        l,
        a,
      });

      if (sampledPixels.length >= TARGET_SAMPLE_COUNT) {
        return sampledPixels;
      }
    }
  }

  return sampledPixels;
}

export async function applyMoviePalette(imageUrl) {
  try {
    const paletteSourceUrl = buildPaletteImageUrl(imageUrl);
    const sampledPixels = await getPixelsFromImageUrl(paletteSourceUrl);
    const palette = await fetchPaletteFromLocalStorage({
      sampledPixels,
    });
    setMovieColors(palette);
  } catch (error) {
    console.error("applyMoviePalette failed:", error);
    return [];
  }
}
