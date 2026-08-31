# fc-shared

Shared frontend components for the fantasy-coach.fr sibling sites
([pronos](https://pronos.fantasy-coach.fr/), [DNP](https://l1.dnp.fantasy-coach.fr/),
[compos](https://l1.compos.fantasy-coach.fr/)). Plain, dependency-free Web
Components delivered straight from GitHub via jsDelivr — no build step, no
npm, no bundler, so every site keeps its current $0-hosting, zero-tooling
setup.

## Components

- **`nav.js`** — `<fc-nav current="pronos"></fc-nav>`. Renders the shared top
  banner/nav (logo, title, sibling-site links), highlighting whichever site
  the `current` attribute names. Adding a new sibling site is a one-line edit
  to the `LINKS` array in this file — every site picks it up on next load.
- **`ads.js`** — the Google AdSense + Funding Choices (GDPR consent) loader,
  identical across all three sites. `<script src=".../ads.js" async></script>`
  in `<head>`, same publisher ID (`pub-6481777982811975`) as before.
- **`feedback.js`** — `<fc-feedback project="pronos"></fc-feedback>`. Renders
  a feedback textarea/submit card and posts to pronos's centralized
  `/v1/feedback` endpoint (the only site with a backend), tagged with the
  `project` attribute so submissions from all three sites land in one place.

## Usage

In each site's `<head>`:

```html
<script src="https://cdn.jsdelivr.net/gh/lionelleboiteux/fc-shared@main/nav.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/lionelleboiteux/fc-shared@main/ads.js" async></script>
<script src="https://cdn.jsdelivr.net/gh/lionelleboiteux/fc-shared@main/feedback.js" defer></script>
```

In the body, where the old inline nav/feedback markup used to be:

```html
<fc-nav current="pronos"></fc-nav>
...
<fc-feedback project="pronos"></fc-feedback>
```

`current`/`project` values: `pronos`, `dnp`, `compos`.

## Rollout

Pinned to the `@main` branch ref, so an edit here propagates to all three
live sites on next page load (jsDelivr caches branch refs for ~12h — use
jsDelivr's [purge API](https://www.jsdelivr.com/tools/purge) to force an
immediate refresh). Switch a site to a pinned tag (e.g. `@v1.0.0`) instead if
tighter control over when it picks up changes is ever needed.
