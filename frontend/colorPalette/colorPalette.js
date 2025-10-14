const REQUIRED_PALETTE_KEYS = [
  "--color-primary",
  "--bg-color",
  "--section-bg-color",
  "--text-color-accent",
  "--text-color",
];

const root = document.documentElement;

const setMovieColors = (palette) => {
  REQUIRED_PALETTE_KEYS.forEach((cssVar) => {
    const value = palette?.[cssVar];
    if (typeof value === "string") {
      root.style.setProperty(cssVar, value);
    }
  });
};

const isValidHex = (color) => /^#([0-9A-Fa-f]{6})$/.test(color);

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

async function fetchPaletteFromLocalStorage({ randomPixels }) {
  const apiBase = "http://localhost:3000";
  const storageKey = "filmTitle";

  const title = localStorage.getItem(storageKey);
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error(
      `No movie title found in localStorage under key "${storageKey}".`
    );
  }

  const res = await fetch(`${apiBase}/api/palette`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.trim(),
      palette: JSON.stringify(randomPixels),
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
    if (typeof value !== "string" || !isValidHex(value)) {
      throw new Error(`Palette is missing a valid hex color for "${key}".`);
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

  const uniqueSampleIndexes = new Set();
  const randomPixels = [];

  while (uniqueSampleIndexes.size < Math.min(100, totalPixels)) {
    const randomIndex = Math.floor(Math.random() * totalPixels);
    if (uniqueSampleIndexes.has(randomIndex)) {
      continue;
    }
    uniqueSampleIndexes.add(randomIndex);

    const x = randomIndex % width;
    const y = Math.floor(randomIndex / width);
    const { data } = context.getImageData(x, y, 1, 1);

    randomPixels.push({
      x,
      y,
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3],
    });
  }

  return randomPixels;
}

export async function applyMoviePalette(imageUrl) {
  try {
    const randomPixels = await getPixelsFromImageUrl(imageUrl);
    const palette = await fetchPaletteFromLocalStorage({ randomPixels });
    console.log(palette);
    setMovieColors(palette);
  } catch (error) {
    console.error("applyMoviePalette failed:", error);
    return [];
  }
}
