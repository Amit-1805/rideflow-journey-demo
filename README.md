# Rideflow — Interactive Ride Journey

A responsive ride-booking experience built with HTML, CSS, inline SVG, and vanilla JavaScript. No framework, package installation, or build step is needed.

## Live preview

After GitHub Pages is enabled for this repository, the site will be available at:

`https://<your-github-username>.github.io/<repository-name>/`

The included GitHub Actions workflow publishes the site from the `main` branch whenever changes are pushed. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source once.

## Run locally

Open `index.html` in a modern browser. The five supported sample locations are:

- Riverside Park
- Old Town Market
- Northstar Station
- Sunset Beach
- Garden District

The map and routes are an illustrated demo. Real address search and road routing require a mapping or geocoding data provider.

## Features

- Validated pickup and destination selection, with swap and reset controls.
- A responsive illustrated city map with route, pins, and a moving ride vehicle.
- Bike, auto-rickshaw, and car ride choices.
- A journey sequence with driver arrival, passenger pickup, travel, and arrival states.
- Keyboard-friendly controls and reduced-motion support.
- No external JavaScript dependencies.

## Project files

- `index.html` — page structure and inline SVG map
- `style.css` — responsive styling and native animations
- `script.js` — route selection, ride state, and vehicle animation
- `.github/workflows/pages.yml` — GitHub Pages deployment

## License

MIT. See [LICENSE](LICENSE).
