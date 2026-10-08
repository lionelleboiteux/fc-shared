# fc-shared

Shared frontend components for the fantasy-coach.fr sibling sites
([pronos](https://pronos.fantasy-coach.fr/), [DNP](https://l1.dnp.fantasy-coach.fr/),
[compos](https://l1.compos.fantasy-coach.fr/), [groupes](https://groupes.fantasy-coach.fr/),
[presentations](https://l1.presentations.fantasy-coach.fr/)).
Plain, dependency-free Web
Components served from assets.fantasy-coach.fr (Cloudflare Pages) — no build step, no
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
  an optional pseudo/email row, a message textarea, and a submit button, and
  posts to pronos's centralized `/v1/feedback` endpoint (the only site with a
  backend), tagged with the `project` attribute so submissions from all three
  sites land in one place. Pseudo/email are never required to send feedback,
  but when given they're stored alongside the message and included in the
  notification email so there's someone to reply to.
- **`ga.js`** — the Google Analytics 4 (`gtag.js`) loader, one property
  across every site rather than one per site (each hit already carries its
  own hostname, so per-site traffic stays fully distinguishable in reports).
  `<script src=".../ga.js" async></script>` in `<head>`. Consent Mode v2
  defaults to denied until Funding Choices (`ads.js`) resolves the
  visitor's actual choice — see the file's own doc comment for the one
  manual step (a Google-account setting, not code) that makes that gating
  actually take effect.
- **`pageview.js`** — a first-party, server-side view counter, accurate
  where `ga.js` structurally can't be (consent-gated, and blocked outright
  by DuckDuckGo/Firefox/Brave/ad-blockers before consent even matters). A
  bare fire-on-load script, not a custom element — reads which site it's
  on from its own `data-project` attribute and posts one beacon to
  pronos's centralized `/v1/page-view` endpoint, the same backend
  `feedback.js` already posts to. `<script src=".../pageview.js"
  data-project="dnp" async></script>` in `<head>`.
- **`team-form.js`** — `<fc-team-form team="Marseille" league="L1" reversed></fc-team-form>`.
  A team's last 5 **league** results (cup/European competitions have no data
  source anywhere) as colored letters — G/N/P (green/amber/red) for
  win/draw/loss, oldest on the left, newest on the right. The `reversed`
  boolean attribute mirrors that (newest-left/oldest-right), for an
  away-team row shown alongside the home team's. Hovering a letter shows
  the full score, home-first, using each side's short code (e.g.
  "PSG 2-1 OM"). Fetches from pronos's centralized `/v1/teams/form`
  endpoint, the same backend as `feedback.js`/`pageview.js`; recomputed
  server-side on the existing hourly fixture-ingest cron, not by this
  script. `league` defaults to `"L1"` (pronos' `leagues.code` for Ligue 1),
  the only league seeded with team short names/codes today.

## Usage

In each site's `<head>`:

```html
<script src="https://assets.fantasy-coach.fr/nav.js" defer></script>
<script src="https://assets.fantasy-coach.fr/ads.js" async></script>
<script src="https://assets.fantasy-coach.fr/feedback.js" defer></script>
<script src="https://assets.fantasy-coach.fr/ga.js" async></script>
<script src="https://assets.fantasy-coach.fr/pageview.js" data-project="dnp" async></script>
<script src="https://assets.fantasy-coach.fr/team-form.js" defer></script>
```

The `@e2cb2f0` above is the current pinned commit — see "Rollout" below before
editing anything in this repo.

In the body, where the old inline nav/feedback markup used to be:

```html
<fc-nav current="pronos"></fc-nav>
...
<fc-feedback project="pronos"></fc-feedback>
...
<fc-team-form team="Marseille" league="L1"></fc-team-form>
```

`current`/`project` values: `pronos`, `dnp`, `compos`, `groupes`, `presentations`.

## Rollout

The scripts are served from `https://assets.fantasy-coach.fr/` (Cloudflare
Pages project `fc-shared`), **unpinned**: every consuming site loads the
same URL, so a change here reaches all of them with no per-site edit or
redeploy. **After any change to a file in this repo:**

1. Commit and push.
2. Run `./deploy.sh` (publishes the top-level `*.js` files; needs `wrangler`
   logged in to the fantasycoachfr@gmail.com account).

Visitors pick the change up once their cached copy expires. `_headers` asks
for 5 minutes, but the zone's Browser Cache TTL setting is 4 hours and
overrides it on this free plan, so allow up to ~4h. This replaces the old
jsDelivr setup: `@main` could sit unseen for 7 days, and the SHA-pinning
workaround needed six sites bumped and redeployed per change.

Trade-off: a bad deploy reaches every site at once. To roll back, revert the
commit and run `./deploy.sh` again.
