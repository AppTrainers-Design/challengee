# App Challenge

Bilingual school game development competition demo built with React, TypeScript, and Vite.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

No API key or backend is required. Competition data is stored in each browser's local storage; it is not shared between users or devices.

## GitHub Pages

Public site: https://apptrainers-design.github.io/challengee/

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site on every push to `main`. GitHub Pages must use **GitHub Actions** as its deployment source under **Settings → Pages**.

Vite's base path is `/challengee/` so scripts and styles load from the repository's Pages URL.

To check the production build locally:

```sh
npm run build
npm run preview
```

Open the preview at http://localhost:4173/challengee/.
