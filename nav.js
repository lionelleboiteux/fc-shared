/**
 * <fc-nav current="pronos"></fc-nav> — the fantasy-coach.fr top nav bar,
 * shared across pronos, DNP, compos, and the main Wix site (and any future
 * sibling site). Injects its own CSS once per page so no site needs to keep
 * a copy of the .site-banner/.site-nav rules. Add a new sibling or submenu
 * item to LINKS here and every site picks it up on next load — no per-site
 * edit needed.
 *
 * Top-level items may carry a `children` array (label + url pairs) to
 * mirror the real fantasy-coach.fr menu's dropdowns — this mirrors the
 * live Wix menu structure, so it stays the canonical replacement for it.
 */
(function () {
  if (customElements.get('fc-nav')) return;

  var STYLE_ID = 'fc-nav-style';
  var CSS = [
    // Host pages (e.g. Wix) may give their own header a z-index in the
    // tens; elevate fc-nav's own stacking context well above that so its
    // dropdowns aren't painted over.
    'fc-nav{display:block;position:relative;z-index:9999;}',
    '.site-banner{background:linear-gradient(180deg,var(--fc-blue-light,#63b0ee) 0%,var(--fc-blue,#3d9be9) 100%);color:#fff;margin:0 -1rem 1.5rem;padding:1.25rem 1rem 0;}',
    '.site-banner-top{display:flex;align-items:center;justify-content:center;gap:.75rem;flex-wrap:wrap;text-align:center;}',
    '.site-logo{width:56px;height:56px;border-radius:50%;}',
    '.site-title{display:block;font-size:1.5rem;font-weight:800;color:#fff;text-decoration:none;}',
    '.site-tagline{margin:.1rem 0 0;font-size:.82rem;opacity:.9;}',
    '.site-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:.25rem 1rem;margin-top:1rem;padding:.6rem 0;border-top:1px solid rgba(255,255,255,.3);font-size:.85rem;position:relative;z-index:30;}',
    '.site-nav a{color:#fff;text-decoration:none;font-weight:600;}',
    '.site-nav a.active{text-decoration:underline;text-underline-offset:3px;}',
    '.nav-item{position:relative;display:flex;align-items:center;gap:.15rem;}',
    '.nav-caret{background:none;border:none;color:#fff;cursor:pointer;font-size:.65rem;padding:.2rem;line-height:1;opacity:.85;}',
    '.nav-caret:hover{opacity:1;}',
    '.nav-dropdown{position:absolute;top:100%;left:50%;transform:translateX(-50%);background:#fff;border-radius:.4rem;box-shadow:0 6px 16px rgba(0,0,0,.2);padding:.4rem 0;min-width:210px;z-index:40;flex-direction:column;}',
    '.nav-dropdown[hidden]{display:none;}',
    '.nav-item.open .nav-dropdown{display:flex;}',
    '.nav-dropdown a{color:#1a1a1a;text-decoration:none;font-weight:600;font-size:.85rem;padding:.45rem 1rem;white-space:nowrap;}',
    '.nav-dropdown a:hover{background:#eef6ff;}',
  ].join('');

  var LOGO_URL =
    'https://static.wixstatic.com/media/449182_b075115d95e54908bebcaaef43561929~mv2.png/v1/fill/w_174,h_174,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/newlogo.png';

  // Canonical sibling-site + brand-page menu, mirroring the live Wix menu
  // (including its dropdowns) so this is the one source of truth for nav
  // everywhere. Adding/renaming a page or submenu item here is the only
  // edit needed to update every site's nav bar.
  var LINKS = [
    {
      id: 'ligue1',
      label: 'Ligue 1',
      url: 'https://www.fantasy-coach.fr/ligue1',
      children: [
        { label: 'Indisponibles / DNP', url: 'https://l1.dnp.fantasy-coach.fr/' },
        { label: 'Suspendus au prochain jaune', url: 'https://www.fantasy-coach.fr/suspendus-prochain-jaune' },
        { label: 'Compos', url: 'https://l1.compos.fantasy-coach.fr/' },
        { label: 'Groupes', url: 'https://www.fantasy-coach.fr/groupes' },
        { label: 'Mercato', url: 'https://www.fantasy-coach.fr/mercato' },
        { label: 'Indisponibles/DNP Last Update', url: 'https://www.fantasy-coach.fr/indisponibles-dnp-last-update' },
      ],
    },
    {
      id: 'fantasy-l1',
      label: 'Fantasy L1',
      url: 'https://www.fantasy-coach.fr/fantasy-l1',
      children: [
        { label: 'LCDE', url: 'https://www.fantasy-coach.fr/lcde' },
        { label: 'MPG', url: 'https://www.fantasy-coach.fr/mpg' },
      ],
    },
    {
      id: 'sorare',
      label: 'Sorare',
      url: 'https://www.fantasy-coach.fr/sorare',
      children: [
        { label: 'Tutos Sorare', url: 'https://www.fantasy-coach.fr/sorare/tuto-sorare' },
        { label: 'Extraction Galerie', url: 'https://www.fantasy-coach.fr/sorare/sorare-extract' },
        { label: 'Prize Pool Sorare', url: 'https://www.fantasy-coach.fr/sorare/rewards-prizepool-sorare' },
        { label: 'Stats de gardiens', url: 'https://www.fantasy-coach.fr/sorare/stats-gardiens-sorare' },
        { label: 'Calendrier GW', url: 'https://www.fantasy-coach.fr/sorare/calendrier-gw-sorare' },
        { label: 'Rewards Points', url: 'https://www.fantasy-coach.fr/sorare/rewards-sorare' },
      ],
    },
    { id: 'fpl', label: 'FPL', url: 'https://www.fantasy-coach.fr/fpl' },
    {
      id: 'bundesliga',
      label: 'Bundesliga',
      url: 'https://www.fantasy-coach.fr/bundesliga',
      children: [
        { label: '1.Bundesliga', url: 'https://www.fantasy-coach.fr/1-bundesliga' },
        { label: '2.Bundesliga', url: 'https://www.fantasy-coach.fr/2-bundesliga' },
      ],
    },
    {
      id: 'scandinavie',
      label: 'Scandinavie',
      url: 'https://www.fantasy-coach.fr/scandinavie',
      children: [
        { label: 'Eliteserien', url: 'https://www.fantasy-coach.fr/eliteserien' },
        { label: 'Allsvenskan', url: 'https://www.fantasy-coach.fr/allsvenskan' },
      ],
    },
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

  function closeAllDropdowns(except) {
    document.querySelectorAll('fc-nav .nav-item.open').forEach(function (item) {
      if (item !== except) {
        item.classList.remove('open');
        var dd = item.querySelector('.nav-dropdown');
        var caret = item.querySelector('.nav-caret');
        if (dd) dd.hidden = true;
        if (caret) caret.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function toggleDropdown(item) {
    var isOpen = item.classList.contains('open');
    closeAllDropdowns();
    if (isOpen) return;
    item.classList.add('open');
    var dd = item.querySelector('.nav-dropdown');
    var caret = item.querySelector('.nav-caret');
    if (dd) dd.hidden = false;
    if (caret) caret.setAttribute('aria-expanded', 'true');
  }

  // One document-level listener handles every fc-nav instance; harmless to
  // add more than once since the whole script guards against re-running.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item')) closeAllDropdowns();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDropdowns();
  });

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
    LINKS.forEach(function (l, i) {
      var linkAttrs = { href: l.url, text: l.label };
      if (l.id === current) linkAttrs.class = 'active';
      var link = el('a', linkAttrs);

      if (!l.children || !l.children.length) {
        nav.appendChild(el('span', { class: 'nav-item' }, [link]));
        return;
      }

      var ddId = 'fc-nav-dd-' + i;
      var caret = el('button', {
        class: 'nav-caret',
        type: 'button',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        'aria-controls': ddId,
        'aria-label': 'Plus de pages ' + l.label,
        text: '▾',
      });
      var dropdown = el(
        'div',
        { class: 'nav-dropdown', id: ddId, hidden: '' },
        l.children.map(function (c) {
          return el('a', { href: c.url, text: c.label });
        }),
      );

      var item = el('span', { class: 'nav-item' }, [link, caret, dropdown]);
      caret.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(item);
      });
      item.addEventListener('mouseenter', function () {
        toggleDropdown(item);
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('open');
        dropdown.hidden = true;
        caret.setAttribute('aria-expanded', 'false');
      });
      nav.appendChild(item);
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
