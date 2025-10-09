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

async function fetchPaletteFromLocalStorage({
  apiBase = "http://localhost:3000",
  storageKey = "filmTitle",
} = {}) {
  const title = localStorage.getItem(storageKey);
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error(
      `No movie title found in localStorage under key "${storageKey}".`,
    );
  }

  const res = await fetch(`${apiBase}/api/palette`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.trim() }),
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

export async function applyMoviePalette(options) {
  try {
    const palette = await fetchPaletteFromLocalStorage(options);

    setMovieColors(palette);

    console.info("Applied movie palette:", palette);
  } catch (error) {
    console.error(error);
  }
}
