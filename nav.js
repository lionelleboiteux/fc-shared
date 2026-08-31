/**
 * <fc-nav current="pronos"></fc-nav> — the fantasy-coach.fr top nav bar,
 * shared across pronos, DNP, and compos (and any future sibling site).
 * Injects its own CSS once per page so no site needs to keep a copy of the
 * .site-banner/.site-nav rules. Add a new sibling to LINKS here and every
 * site picks it up on next load — no per-site edit needed.
 */
(function () {
  if (customElements.get('fc-nav')) return;

  var STYLE_ID = 'fc-nav-style';
  var CSS = [
    'fc-nav{display:block;}',
    '.site-banner{background:linear-gradient(180deg,var(--fc-blue-light,#63b0ee) 0%,var(--fc-blue,#3d9be9) 100%);color:#fff;margin:0 -1rem 1.5rem;padding:1.25rem 1rem 0;}',
    '.site-banner-top{display:flex;align-items:center;justify-content:center;gap:.75rem;flex-wrap:wrap;text-align:center;}',
    '.site-logo{width:56px;height:56px;border-radius:50%;}',
    '.site-title{display:block;font-size:1.5rem;font-weight:800;color:#fff;text-decoration:none;}',
    '.site-tagline{margin:.1rem 0 0;font-size:.82rem;opacity:.9;}',
    '.site-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:.25rem 1rem;margin-top:1rem;padding:.6rem 0;border-top:1px solid rgba(255,255,255,.3);font-size:.85rem;}',
    '.site-nav a{color:#fff;text-decoration:none;font-weight:600;}',
    '.site-nav a.active{text-decoration:underline;text-underline-offset:3px;}',
  ].join('');

  var LOGO_URL =
    'https://static.wixstatic.com/media/449182_b075115d95e54908bebcaaef43561929~mv2.png/v1/fill/w_174,h_174,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/newlogo.png';

  // Canonical sibling-site + brand-page list. The whole point of fc-nav:
  // adding/renaming a site here is the only edit needed to update every
  // site's nav bar.
  var LINKS = [
    { id: 'ligue1', label: 'Ligue 1', url: 'https://www.fantasy-coach.fr/ligue1' },
    { id: 'fantasy-l1', label: 'Fantasy L1', url: 'https://www.fantasy-coach.fr/fantasy-l1' },
    { id: 'sorare', label: 'Sorare', url: 'https://www.fantasy-coach.fr/sorare' },
    { id: 'fpl', label: 'FPL', url: 'https://www.fantasy-coach.fr/fpl' },
    { id: 'bundesliga', label: 'Bundesliga', url: 'https://www.fantasy-coach.fr/bundesliga' },
    { id: 'pronos', label: 'Pronos', url: 'https://pronos.fantasy-coach.fr/' },
    { id: 'dnp', label: 'Indispos', url: 'https://l1.dnp.fantasy-coach.fr/' },
    { id: 'compos', label: 'Compos', url: 'https://l1.compos.fantasy-coach.fr/' },
  ];

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c) e.appendChild(c);
    });
    return e;
  }

  function render(host) {
    var current = host.getAttribute('current');

    var logoLink = el('a', { href: 'https://www.fantasy-coach.fr/' }, [
      el('img', { class: 'site-logo', src: LOGO_URL, alt: 'logo fantasy coach' }),
    ]);
    var titleBlock = el('div', {}, [
      el('a', { class: 'site-title', href: 'https://www.fantasy-coach.fr/', text: 'Fantasy Coach' }),
      el('p', { class: 'site-tagline', text: 'La référence Fantasy Foot' }),
    ]);
    var top = el('div', { class: 'site-banner-top' }, [logoLink, titleBlock]);

    var nav = el('nav', { class: 'site-nav' });
    LINKS.forEach(function (l) {
      var attrs = { href: l.url, text: l.label };
      if (l.id === current) attrs.class = 'active';
      nav.appendChild(el('a', attrs));
    });

    host.appendChild(top);
    host.appendChild(nav);
  }

  customElements.define(
    'fc-nav',
    class extends HTMLElement {
      connectedCallback() {
        ensureStyle();
        this.classList.add('site-banner');
        render(this);
      }
    },
  );
})();
