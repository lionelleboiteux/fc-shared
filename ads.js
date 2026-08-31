/**
 * Google AdSense + Funding Choices (GDPR consent) loader shared by pronos,
 * DNP, and compos — all three use the same AdSense publisher account. Load
 * this with a plain `<script src=".../ads.js" async></script>` in <head>,
 * same placement as the inline scripts it replaces.
 */
(function () {
  var PUB_ID = 'pub-6481777982811975';

  function addScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    for (var k in attrs || {}) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }

  // Must load before AdSense so ads only fire once consent is resolved.
  addScript('https://fundingchoicesmessages.google.com/i/' + PUB_ID + '?ers=1', { async: 'async' });

  (function signalGooglefcPresent() {
    if (!window.frames['googlefcPresent']) {
      if (document.body) {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
        iframe.style.display = 'none';
        iframe.name = 'googlefcPresent';
        document.body.appendChild(iframe);
      } else {
        setTimeout(signalGooglefcPresent, 0);
      }
    }
  })();

  addScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + PUB_ID, {
    async: 'async',
    crossorigin: 'anonymous',
  });
})();
