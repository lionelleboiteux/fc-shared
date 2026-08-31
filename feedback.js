/**
 * <fc-feedback project="pronos"></fc-feedback> — the feedback box shared by
 * pronos, DNP, and compos. Always posts to pronos's centralized
 * /v1/feedback endpoint (the only site with a backend), tagged with the
 * `project` attribute so submissions from all three sites land in one place
 * and stay distinguishable.
 */
(function () {
  if (customElements.get('fc-feedback')) return;

  var API_URL = 'https://dmytkubjxwwwkroutvdu.supabase.co/functions/v1/api/v1/feedback';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var STYLE_ID = 'fc-feedback-style';
  var CSS = [
    'fc-feedback{display:block;background:var(--card,#fff);border:2px solid var(--accent,var(--fc-blue,#3d9be9));border-radius:16px;padding:1.1rem 1.25rem 1.25rem;margin-bottom:1.25rem;color:var(--ink,#1c1917);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
    'fc-feedback h2{font-size:1.15rem;margin:0 0 .6rem;text-align:center;}',
    '.fc-feedback-intro{color:var(--muted,#6b6560);font-size:.9rem;text-align:center;margin:0 0 .5rem;}',
    '.fc-feedback-contact-row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.5rem;}',
    '.fc-feedback-field{flex:1 1 10rem;min-width:0;}',
    '.fc-feedback-label{display:block;font-size:.8rem;font-weight:600;margin:0 0 .2rem;}',
    '.fc-feedback-input,.fc-feedback-textarea{width:100%;padding:.55rem .7rem;border:1px solid var(--border,#d6d3d1);border-radius:8px;background:var(--card,#fff);color:var(--ink,#1c1917);font-size:.95rem;font-family:inherit;box-sizing:border-box;}',
    '.fc-feedback-textarea{resize:vertical;margin-top:.5rem;}',
    '.fc-feedback-submit{display:block;width:100%;margin-top:.75rem;padding:.6rem;background:var(--accent,var(--fc-blue,#3d9be9));color:var(--accent-ink,#fff);border:none;border-radius:10px;font-size:.95rem;font-weight:700;cursor:pointer;}',
    '.fc-feedback-submit:disabled{opacity:.6;cursor:default;}',
    '.fc-feedback-message{font-size:.85rem;margin:.5rem 0 0;min-height:1.2em;}',
    '.fc-feedback-message.error{color:var(--error,#b91c1c);}',
    '.fc-feedback-message.ok{color:var(--ok,#15803d);}',
  ].join('');

  var nextId = 0;

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
    var project = host.getAttribute('project') || 'pronos';
    var titleText = host.getAttribute('title') || 'Une question, un problème, une suggestion ?';
    var introText = host.getAttribute('intro') || 'Vous avez des questions, problèmes ou suggestions ? Envoyez-les-nous !';
    var uid = 'fc-feedback-' + (nextId += 1);

    host.appendChild(el('h2', { text: titleText }));
    host.appendChild(el('p', { class: 'fc-feedback-intro', text: introText }));

    var pseudoInput = el('input', {
      type: 'text', id: uid + '-pseudo', class: 'fc-feedback-input', maxlength: '60', autocomplete: 'nickname',
    });
    var emailInput = el('input', {
      type: 'email', id: uid + '-email', class: 'fc-feedback-input', autocomplete: 'email',
    });
    var contactRow = el('div', { class: 'fc-feedback-contact-row' }, [
      el('div', { class: 'fc-feedback-field' }, [
        el('label', { class: 'fc-feedback-label', for: uid + '-pseudo', text: 'Pseudo (optionnel)' }),
        pseudoInput,
      ]),
      el('div', { class: 'fc-feedback-field' }, [
        el('label', { class: 'fc-feedback-label', for: uid + '-email', text: 'Email (optionnel)' }),
        emailInput,
      ]),
    ]);
    host.appendChild(contactRow);

    var textarea = el('textarea', {
      class: 'fc-feedback-textarea',
      maxlength: '2000',
      rows: '4',
      'aria-label': 'Votre message',
    });
    var message = el('p', { class: 'fc-feedback-message' });
    var submitBtn = el('button', { type: 'button', class: 'fc-feedback-submit', text: 'Envoyer' });

    host.appendChild(textarea);
    host.appendChild(message);
    host.appendChild(submitBtn);

    // Both fields are entirely optional (AC: neither pseudo nor email is
    // required to send feedback) — this is only a fast UX check against a
    // typo'd address; the server re-validates independently.
    submitBtn.addEventListener('click', function () {
      var value = textarea.value.trim();
      var pseudo = pseudoInput.value.trim();
      var email = emailInput.value.trim();

      if (!value) {
        message.className = 'fc-feedback-message error';
        message.textContent = 'Merci d’écrire un message avant d’envoyer.';
        textarea.focus();
        return;
      }
      if (email && !EMAIL_RE.test(email)) {
        message.className = 'fc-feedback-message error';
        message.textContent = 'Adresse email invalide.';
        emailInput.focus();
        return;
      }
      submitBtn.disabled = true;
      message.className = 'fc-feedback-message';
      message.textContent = 'Envoi en cours…';

      fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: value,
          project: project,
          pseudo: pseudo || undefined,
          email: email || undefined,
        }),
      })
        .then(function (r) {
          return r.json().then(function (body) {
            return { status: r.status, body: body };
          });
        })
        .then(function (res) {
          submitBtn.disabled = false;
          if (res.status === 200) {
            message.className = 'fc-feedback-message ok';
            message.textContent = 'Merci, votre message a bien été envoyé !';
            textarea.value = '';
          } else if (res.status === 429) {
            message.className = 'fc-feedback-message error';
            message.textContent = 'Trop de messages envoyés — réessayez dans une minute.';
          } else {
            message.className = 'fc-feedback-message error';
            message.textContent = (res.body && res.body.error && res.body.error.message) || 'Erreur lors de l’envoi.';
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          message.className = 'fc-feedback-message error';
          message.textContent = 'Connexion impossible. Réessayez.';
        });
    });
  }

  customElements.define(
    'fc-feedback',
    class extends HTMLElement {
      connectedCallback() {
        ensureStyle();
        render(this);
      }
    },
  );
})();
