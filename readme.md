# Movie Night Meal

Lightweight full-stack app to pick a movie and get a themed recipe + small UI features (palette extraction, filming-location hangman, Google sign-in).

## Quick links (important files & symbols)
- App entry: [server.js](server.js)  
- Package manifest: [package.json](package.json)  
- Frontend main page: [frontend/index.html](frontend/index.html)  
- Frontend main script: [`script.js`](frontend/script.js)  
- Palette applicator: [`applyMoviePalette`](frontend/colorPalette/colorPalette.js) — [frontend/colorPalette/colorPalette.js](frontend/colorPalette/colorPalette.js)  
- Palette generation (backend): [`getColorsForMovie`](backend/components/colorPaletteFunction.js) — [backend/components/colorPaletteFunction.js](backend/components/colorPaletteFunction.js)  
- Palette route: [backend/routes/colorPaletteRoute.js](backend/routes/colorPaletteRoute.js)  
- Recipe generation: [`getRecipe`](backend/Controllers/recipe.controller.js) — [backend/Controllers/recipe.controller.js](backend/Controllers/recipe.controller.js)  
- Film-location & images: [`getLocation`](backend/Controllers/locationController.js), [`getImage`](backend/Controllers/imageController.js) — [backend/Controllers/locationController.js](backend/Controllers/locationController.js), [backend/Controllers/imageController.js](backend/Controllers/imageController.js)  
- Movie discovery route/controller: [`getMovie`](backend/Controllers/movieController.js) — [backend/routes/movieRoute.js](backend/routes/movieRoute.js) / [backend/Controllers/movieController.js](backend/Controllers/movieController.js)  
- Wishlist model & controllers: [`Whishlist` model](backend/models/wishlist.model.js), [backend/Controllers/whishlist.controller.js](backend/Controllers/whishlist.controller.js), [backend/routes/whishlist.route.js](backend/routes/whishlist.route.js)  
- Google auth backend: [`googleAuth`](backend/Controllers/signinController.js) — [backend/Controllers/signinController.js](backend/Controllers/signinController.js) and route [backend/routes/signinRoute.js](backend/routes/signinRoute.js)  
- Frontend game: [frontend/filmLocation/filmLocation.html](frontend/filmLocation/filmLocation.html) and [`filmLocation.js`](frontend/filmLocation/filmLocation.js)  
- CSS: [frontend/styles.css](frontend/styles.css), [frontend/recipe/recipe.css](frontend/recipe/recipe.css), [frontend/filmLocation/game.css](frontend/filmLocation/game.css)

## Setup

1. Copy or create your environment file (do NOT commit secrets):
   - Example env file: [.env](.env) (this repo contains an .env in the workspace — treat keys as sensitive; rotate if real)
   - Required environment variables:
     - OPENAI_API_KEY
     - TMDB_API_KEY
     - UNSPLASH_API_KEY
     - RECIPE_API_KEY (used by recipe controller if present)
     - MONGO_URI (MongoDB connection)

2. Install
```sh
npm ci
```

3. Run (dev)
```sh
npm run dev
```
- Server runs on the port from environment `process.env._PORT` or `3000`. See [server.js](server.js).

## Endpoints (overview)
- POST /api/palette — generate color palette for a movie (calls [`getColorsForMovie`](backend/components/colorPaletteFunction.js)) — file: [backend/routes/colorPaletteRoute.js](backend/routes/colorPaletteRoute.js)  
- GET /get-movies?genreID=...&startDate=...&endDate=...&rating=... — movie discovery (TMDB) — [backend/routes/movieRoute.js](backend/routes/movieRoute.js)  
- GET /api/recipe?movie=Movie%20Title — recipe generation using OpenAI — [backend/routes/recipe.route.js](backend/routes/recipe.route.js) -> [`getRecipe`](backend/Controllers/recipe.controller.js)  
- POST /get-location — generate short filming-location (used by hangman) — [backend/routes/gameRoute.js](backend/routes/gameRoute.js) -> [`getLocation`](backend/Controllers/locationController.js)  
- POST /get-image — fetch images from Unsplash — [backend/routes/gameRoute.js](backend/routes/gameRoute.js) -> [`getImage`](backend/Controllers/imageController.js)  
- Wishlist: GET/POST/DELETE under /api/whishlist — [backend/routes/whishlist.route.js](backend/routes/whishlist.route.js)

## Frontend notes
- The UI stores the selected movie title in `localStorage` under `filmTitle`. See [frontend/script.js](frontend/script.js) and [frontend/recipe/recipe.js](frontend/recipe/recipe.js).
- Palette extraction runs in the browser: [`applyMoviePalette`](frontend/colorPalette/colorPalette.js) reads pixel samples from the movie poster and POSTs to `/api/palette`.
- Hangman game (film location) requests location and an image from backend endpoints defined in [backend/routes/gameRoute.js](backend/routes/gameRoute.js).

## Backend notes
- OpenAI usage:
  - Palette generator: [backend/components/colorPaletteFunction.js](backend/components/colorPaletteFunction.js) uses the OpenAI Responses API with a zod schema to parse hex colors.
  - Recipe generator: [backend/Controllers/recipe.controller.js](backend/Controllers/recipe.controller.js) calls OpenAI chat completion to return recipe JSON.
- MongoDB connection handled in [backend/config/db.js](backend/config/db.js). Wishlist schema is in [backend/models/wishlist.model.js](backend/models/wishlist.model.js).

## Development tips & gotchas
- Ensure correct env variable names and that secrets are not committed.
- Frontend scripts use module imports (ESM). `package.json` sets `"type": "module"`.
- Some frontend fetch paths expect backend route mount points — confirm routes registered in [server.js](server.js).
- Prettier check is configured in CI: see [.github/workflows/prettier.yml](.github/workflows/prettier.yml) and the `lint` script in [package.json](package.json).

## Contributing
- Follow existing style, run `npm run lint` before PRs.
- Rotate API keys if you accidentally publish them.

## License
- Project uses ISC as declared in [package.json](package.json).

