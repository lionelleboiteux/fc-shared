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
    '.site-socials{display:flex;gap:.6rem;align-items:center;}',
    '.site-socials img{width:22px;height:22px;display:block;}',
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

  var SOCIALS = [
    { label: 'Bluesky', url: 'https://bsky.app/profile/fantasycoachfr.bsky.social', icon: 'data:image/png;base64,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' },
    { label: 'Mastodon', url: 'https://mastodon.social/@FantasyCoachFR', icon: 'data:image/png;base64,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' },
    { label: 'X', url: 'https://x.com/FantasyCoach_FR', icon: 'data:image/png;base64,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' },
  ];

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
    var socials = el(
      'div',
      { class: 'site-socials' },
      SOCIALS.map(function (s) {
        return el('a', { href: s.url, 'aria-label': s.label, target: '_blank', rel: 'noopener' }, [
          el('img', { src: s.icon, alt: s.label }),
        ]);
      }),
    );
    var top = el('div', { class: 'site-banner-top' }, [logoLink, titleBlock, socials]);

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
