/**
 * A first-party, server-side page-view counter shared by pronos, DNP,
 * compos, and groupes — the same accuracy reasoning as arsene-cms's own
 * article-view counter: a consent-gated analytics tag only counts
 * visitors who accept, and DuckDuckGo/Firefox/Brave/ad-blockers drop the
 * request to a known tracker domain before consent even matters. This
 * fires once, to pronos's own already-trusted backend (the same one
 * fc-shared/feedback.js already posts to from every sibling site), so
 * there's no third-party domain for a blocklist to catch.
 *
 * A bare fire-on-load script, not a custom element like <fc-feedback> —
 * there's no user interaction here, just a beacon. Load with
 * `<script src=".../pageview.js" data-project="dnp" async></script>` in
 * <head>; the project comes off the script tag's own `data-project`
 * attribute, since a plain <script> has nowhere else to carry it.
 */
(function () {
  var API_URL = 'https://dmytkubjxwwwkroutvdu.supabase.co/functions/v1/api/v1/page-view';

  var script = document.currentScript;
  var project = script && script.getAttribute('data-project');
  if (!project) return;

  fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ project: project }),
    keepalive: true,
  }).catch(function () {
    // Best-effort — a dropped beacon must never affect the page itself.
  });
})();
