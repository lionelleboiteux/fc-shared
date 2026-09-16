/**
 * Google Analytics 4 (gtag.js) loader shared by every fantasy-coach.fr
 * site — same jsDelivr-CDN, no-build-step, self-contained pattern as
 * nav.js/ads.js. Load with a plain <script src=".../ga.js" async></script>
 * in <head>. One property (`MEASUREMENT_ID` below) across every site,
 * rather than a separate GA property per site: Google's own recommended
 * setup for a family of related sites — each hit already carries its own
 * hostname, so per-site traffic is still fully distinguishable inside
 * the one property's reports.
 *
 * Consent Mode v2 defaults to denied for both storage types until
 * Funding Choices (ads.js, already loaded alongside this on every site
 * that uses it) resolves the visitor's actual choice and pushes its own
 * consent update onto the same `dataLayer` — gtag.js picks that up
 * automatically, no extra wiring needed here. This only actually gates
 * anything once Consent Mode is turned on in the Google account's own
 * Privacy & Messaging settings (a one-time account setting, not
 * something this file can do) — until then, defaulting to denied just
 * means GA silently collects nothing rather than firing unconditionally
 * for an EU visitor who was never asked. A site with no Funding Choices
 * banner at all behaves the same way: consent is never updated, so GA
 * collects nothing there either, rather than defaulting to fully-open
 * tracking.
 */
(function () {
  var MEASUREMENT_ID = 'G-ZF3S3MCNC8';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  var s = document.createElement('script');
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  s.async = true;
  document.head.appendChild(s);
})();
