# Aphrodite's Digital House

A static, personal digital sanctuary for a small tortoise: a botanical editorial
site with a live, timestamp-accurate age clock, editable milestones, a
photographic diary and an interactive miniature habitat.

**A little life, counted in every second.**

## Static by design — no backend

Everything runs in the browser. There is no server, database or API.

- **Settings, milestones, captions** are saved in `localStorage`.
- **Photographs** are optimised in the browser, then stored as blobs in
  `IndexedDB` (they never leave the device).
- The age clock is calculated from `Date.now()` and her birth timestamp on every
  tick, using `Intl` for time-zone conversion — never by incrementing a counter.

Because there is no routing and no server, the built site works anywhere static
files are served, including GitHub Pages subpaths.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

A workflow is included at `.github/workflows/deploy.yml`.

1. Create a repository and push this project to the `main` branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site will be published at
   `https://<user>.github.io/<repo>/`.

`vite.config.ts` uses `base: './'`, so assets resolve correctly from any project
subpath. No 404 redirect trick is needed because navigation uses in-page anchors
only.

## Her data

- Defaults: born **approximately 6 October 2025**, assumed birth time **12:00 PM**,
  time zone **Asia/Kolkata**. The estimated time is labelled throughout until you
  record the real one in Settings.
- Deleting photographs and milestones asks for confirmation first.
- **Reset her house** in Settings clears this browser's stored data and returns
  the site to its first day.

## Browser support

Modern Chrome, Edge, Firefox and Safari. IndexedDB, `Intl` time zones and
`createImageBitmap` are used with graceful fallbacks where available. Animation
respects `prefers-reduced-motion`.

## Illustrations

The tortoise, ferns, stones, portrait study and diary plates are original vector
artwork drawn for this project. They can be replaced with real photographs from
the site itself.
