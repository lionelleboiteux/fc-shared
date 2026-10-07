#!/bin/sh
# Publishes the browser scripts to https://assets.fantasy-coach.fr/ (Cloudflare
# Pages project "fc-shared"). Only the top-level *.js files ship — never .env,
# gs/ or the README.
set -e
cd "$(dirname "$0")"
rm -rf .dist && mkdir .dist
cp ./*.js .dist/
cat > .dist/_headers <<'H'
/*.js
  Cache-Control: public, max-age=300, stale-while-revalidate=86400
  Access-Control-Allow-Origin: *
H
npx wrangler pages deploy .dist --project-name=fc-shared --branch=main --commit-dirty=true
rm -rf .dist
