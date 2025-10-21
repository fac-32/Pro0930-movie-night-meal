import { cachingPalette } from "./colorPaletteFunction.js";

export function clearColorPaletteCache() {
  for (const key of Object.keys(cachingPalette)) {
    delete cachingPalette[key];
  }
}
