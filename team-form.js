/**
 * <fc-team-form team="Marseille" league="L1" reversed></fc-team-form> — a
 * team's last 5 league results as colored letters: G (green, win), N
 * (amber, draw), P (red, loss), oldest on the left, newest on the right.
 * Pass the `reversed` boolean attribute for an away-team row (e.g. in
 * presentations' match cards, home team's row above the shared pitch,
 * away team's below) so the sequence renders newest-left/oldest-right —
 * both teams' most recent result then sits next to the shared center.
 * Hovering a letter shows the full score, home-first as actually played
 * (e.g. "PSG 2-1 OM"), using each side's 2-3 letter code.
 *
 * `league` is a short code matching pronos' `leagues.code` (e.g. "L1" for
 * Ligue 1, the only one seeded today) — defaults to "L1" since every
 * current consumer is Ligue-1-only.
 *
 * League matches only: pronos' schema has no domestic cup or European
 * competition data (no source exists anywhere for those yet).
 *
 * Fetches from pronos' Supabase Edge Function — the same backend
 * feedback.js/pageview.js already post to, "the only site with a
 * backend".
 */
(function () {
  if (customElements.get('fc-team-form')) return;

  var API_URL = 'https://dmytkubjxwwwkroutvdu.supabase.co/functions/v1/api/v1/teams/form';
  var STYLE_ID = 'fc-team-form-style';
  var CSS = [
    'fc-team-form{display:inline-flex;gap:.3rem;align-items:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
    '.fc-team-form-letter{display:inline-flex;align-items:center;justify-content:center;width:1.4rem;height:1.4rem;border-radius:4px;font-size:.75rem;font-weight:700;color:#fff;cursor:default;}',
    '.fc-team-form-letter.win{background:var(--ok,#15803d);}',
    '.fc-team-form-letter.draw{background:var(--warn,#eab308);color:#1c1917;}',
    '.fc-team-form-letter.loss{background:var(--error,#b91c1c);}',
    '.fc-team-form-empty{color:var(--muted,#6b6560);font-size:.8rem;}',
  ].join('');

  var LETTER = { W: 'G', D: 'N', L: 'P' };
  var CLASS = { W: 'win', D: 'draw', L: 'loss' };

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

  // Always home-first, as actually played -- not "us first". Falls back to
  // the short/full name if a code isn't seeded for some team yet, rather
  // than showing "undefined".
  function tooltipFor_(ownCode, entry) {
    var opponentLabel = entry.opponent_code || entry.opponent_short_name || entry.opponent_name;
    var homeLabel = entry.is_home ? ownCode : opponentLabel;
    var awayLabel = entry.is_home ? opponentLabel : ownCode;
    var homeScore = entry.is_home ? entry.team_score : entry.opponent_score;
    var awayScore = entry.is_home ? entry.opponent_score : entry.team_score;
    return homeLabel + ' ' + homeScore + '-' + awayScore + ' ' + awayLabel;
  }

  function renderEmpty_(host, text) {
    host.textContent = '';
    host.appendChild(el('span', { class: 'fc-team-form-empty', text: text }));
  }

  function render(host) {
    var team = host.getAttribute('team');
    var league = host.getAttribute('league') || 'L1';
    var reversed = host.hasAttribute('reversed');
    if (!team) return;

    renderEmpty_(host, '…');

    fetch(API_URL + '?league=' + encodeURIComponent(league) + '&name=' + encodeURIComponent(team))
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then(function (data) {
        var results = data.results || [];
        if (results.length === 0) {
          renderEmpty_(host, '—');
          return;
        }
        host.textContent = '';
        var ordered = reversed ? results.slice().reverse() : results;
        ordered.forEach(function (entry) {
          host.appendChild(
            el('span', {
              class: 'fc-team-form-letter ' + CLASS[entry.result],
              title: tooltipFor_(data.code, entry),
              text: LETTER[entry.result],
            }),
          );
        });
      })
      .catch(function () {
        renderEmpty_(host, '—');
      });
  }

  customElements.define(
    'fc-team-form',
    class extends HTMLElement {
      connectedCallback() {
        ensureStyle();
        render(this);
      }
    },
  );
})();
