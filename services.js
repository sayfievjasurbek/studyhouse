/* ============================================
   STUDY HOUSE — Services page

   Builds the six programme cards from data/programmes.json and opens each
   programme in a modal on the same page. The Universities card opens the
   booking form directly instead.

   Logos: the owner supplies each programme's official logo, unmodified, at
   images/programmes/logos/<id>.png. Until a file exists the badge shows the
   programme name in type — never an invented or redrawn mark.
   ============================================ */

(function () {
  'use strict';

  var grid = document.getElementById('prog-grid');
  if (!grid) return;

  var root = document.documentElement.getAttribute('data-root') || '';
  var DATA = null;
  var modal = null;
  var lastTrigger = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(en) { return window.shI18n ? window.shI18n.t(en) : en; }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined) return;
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }

  /* A fact we could not verify renders as a marked placeholder, never a guess. */
  function value(v) {
    return v === null
      ? h('span', { class: 'cmp-todo', text: t('Not verified yet — see the official site') })
      : document.createTextNode(t(v));
  }

  function badge(p) {
    var wrap = h('span', { class: 'prog-badge' });
    /* A logo is shown only once its file is listed in data/programmes.json.
       Until then the badge is the programme name in type, and the page does not
       request a file that does not exist (which would log a 404 on every visit). */
    if (p.logo) {
      var img = h('img', {
        src: root + p.logo, alt: p.name + ' logo', class: 'prog-badge__img', width: '200', height: '80'
      });
      img.addEventListener('error', function () {
        wrap.textContent = '';
        wrap.appendChild(h('span', { class: 'prog-badge__text', text: p.name }));
      });
      wrap.appendChild(img);
    } else {
      wrap.appendChild(h('span', { class: 'prog-badge__text', text: p.name }));
    }
    return wrap;
  }

  /* ---------- Cards ---------- */
  function card(p) {
    var art = h('article', { class: 'prog-card' });
    art.appendChild(h('img', {
      src: root + 'images/programmes/' + p.id + '-card.webp', alt: '',
      class: 'prog-card__img', loading: p.id === 'universities' ? null : 'lazy',
      fetchpriority: p.id === 'universities' ? 'high' : null,
      decoding: 'async', width: '800', height: '1000'
    }));
    art.appendChild(h('div', { class: 'prog-card__overlay' }));

    var body = h('div', { class: 'prog-card__body' });
    body.appendChild(badge(p));
    body.appendChild(h('h3', { class: 'prog-card__title', text: t(p.title) }));
    body.appendChild(h('p', { class: 'prog-card__blurb', text: t(p.line) }));

    var btn;
    if (p.action === 'booking') {
      btn = h('button', {
        type: 'button', class: 'btn btn--consult--dark prog-card__btn',
        'data-booking': '', 'data-booking-source': 'services', text: t('Learn more')
      });
    } else {
      btn = h('button', {
        type: 'button', class: 'btn btn--consult--dark prog-card__btn',
        'aria-haspopup': 'dialog', text: t('Learn more')
      });
      btn.addEventListener('click', function () { open(p, btn); });
    }
    body.appendChild(btn);
    art.appendChild(body);
    return art;
  }

  /* ---------- Modal ---------- */
  function buildModal() {
    var el = h('div', { class: 'pmodal', id: 'programme-modal', hidden: 'hidden' });
    el.innerHTML =
      '<div class="pmodal__panel" role="dialog" aria-modal="true" aria-labelledby="pmodal-title" tabindex="-1">' +
        '<button type="button" class="pmodal__close" data-pmodal-close aria-label="Close">&times;</button>' +
        '<div class="pmodal__body"></div>' +
      '</div>';
    document.body.appendChild(el);

    var pressedOnOverlay = false;
    el.addEventListener('mousedown', function (e) { pressedOnOverlay = e.target === el; });
    el.addEventListener('click', function (e) {
      if (e.target === el && pressedOnOverlay) close();
      if (e.target.closest('[data-pmodal-close]')) close();
    });
    return el;
  }

  function section(title, node) {
    return h('section', { class: 'pmodal__section' },
      h('h3', { class: 'pmodal__h', text: t(title) }), node);
  }

  function fill(p) {
    var body = modal.querySelector('.pmodal__body');
    body.textContent = '';

    /* photo + logo */
    var head = h('header', { class: 'pmodal__head' });
    head.appendChild(h('img', {
      src: root + 'images/programmes/' + p.id + '-hero.webp', alt: '',
      class: 'pmodal__img', width: '1600', height: '760', decoding: 'async'
    }));
    head.appendChild(h('div', { class: 'pmodal__head-overlay' }));
    var headText = h('div', { class: 'pmodal__head-text' });
    headText.appendChild(badge(p));
    headText.appendChild(h('h2', { class: 'pmodal__title', id: 'pmodal-title', text: t(p.title) }));
    headText.appendChild(h('p', { class: 'pmodal__line', text: t(p.line) }));
    head.appendChild(headText);
    body.appendChild(head);

    var main = h('div', { class: 'pmodal__main' });
    main.appendChild(h('p', { class: 'pmodal__intro', text: t(p.intro) }));

    /* quick facts */
    var facts = h('dl', { class: 'pmodal__facts' });
    p.facts.forEach(function (f) {
      facts.appendChild(h('dt', { text: t(f[0]) }));
      facts.appendChild(h('dd', {}, value(f[1])));
    });
    main.appendChild(section('Quick facts', facts));

    /* eligibility */
    var elig = h('ul', { class: 'check-list check-list--modal' });
    p.eligibility.forEach(function (x) { elig.appendChild(h('li', { class: 'check-item', text: t(x) })); });
    main.appendChild(section('Are you eligible?', elig));

    /* how to apply */
    var steps = h('ol', { class: 'tl tl--modal' });
    p.steps.forEach(function (s) {
      steps.appendChild(h('li', { class: 'tl-step' },
        h('span', { class: 'tl-step__when', text: t(s[0]) }),
        h('span', { class: 'tl-step__what', text: t(s[1]) })));
    });
    var stepsWrap = h('div', {}, steps, h('p', { class: 'prog-note', text: t(p.stepsNote) }));
    main.appendChild(section('How to apply', stepsWrap));

    /* what we do */
    var work = h('div', { class: 'pmodal__work' });
    [
      ['Application preparation', 'We go through the official requirements with you line by line, check your documents against them, and keep you to the published dates.'],
      ['Essays and written work', 'We help you plan and edit your own essays so they answer the question that was actually asked. We do not write them for you.'],
      ['Interview practice', 'Mock interviews in English with honest feedback, using the format this programme actually uses.']
    ].forEach(function (w) {
      work.appendChild(h('div', { class: 'pmodal__work-item' },
        h('h4', { class: 'pmodal__work-title', text: t(w[0]) }),
        h('p', { class: 'pmodal__work-text', text: t(w[1]) })));
    });
    var workWrap = h('div', {}, work,
      h('p', { class: 'prog-disclaimer', text: t('Study House is an independent consultancy. We prepare applications. We do not select candidates, award scholarships or issue visas, and we cannot promise any outcome.') }));
    main.appendChild(section('What we do for you', workWrap));

    /* FAQ */
    var faq = h('div', { class: 'faq__list' });
    p.faq.forEach(function (q) {
      faq.appendChild(h('details', { class: 'faq-item' },
        h('summary', { text: t(q[0]) }),
        h('div', { class: 'faq-item__body' }, h('p', {}, value(q[1])))));
    });
    main.appendChild(section('Questions parents ask', faq));

    /* sources + CTA */
    var src = h('p', { class: 'source-line' }, h('strong', { text: t('Last updated:') + ' ' }),
      t('26 September 2026'), ' · ', h('strong', { text: t('Sources:') + ' ' }));
    p.sources.forEach(function (s, i) {
      if (i) src.appendChild(document.createTextNode(' · '));
      src.appendChild(h('a', { href: s[1], target: '_blank', rel: 'noopener noreferrer', text: s[0] }));
    });
    main.appendChild(src);

    main.appendChild(h('button', {
      type: 'button', class: 'btn btn--consult pmodal__cta',
      'data-booking': '', 'data-booking-programme': p.id, 'data-booking-source': p.id,
      text: t('Book a Consultation') + ' →'
    }));

    body.appendChild(main);
    if (window.shI18n) window.shI18n.refresh(body);
  }

  /* ---------- Open / close ---------- */
  var isOpen = false;
  var inertSaved = [];

  function setBackgroundInert(on) {
    if (on) {
      Array.prototype.forEach.call(document.body.children, function (n) {
        if (n === modal || n.tagName === 'SCRIPT') return;
        inertSaved.push([n, n.inert]);
        n.inert = true;
      });
    } else {
      inertSaved.forEach(function (pair) { pair[0].inert = pair[1]; });
      inertSaved = [];
    }
  }

  function open(p, trigger) {
    if (isOpen) return;
    isOpen = true;
    lastTrigger = trigger || document.activeElement;
    fill(p);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';          // scroll lock
    setBackgroundInert(true);
    requestAnimationFrame(function () {
      modal.classList.add('pmodal--open');
      modal.querySelector('.pmodal__panel').focus({ preventScroll: true });
      modal.querySelector('.pmodal__panel').scrollTop = 0;
    });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove('pmodal--open');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    setTimeout(function () { if (!isOpen) modal.hidden = true; }, reduceMotion ? 0 : 200);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;

    var panel = modal.querySelector('.pmodal__panel');
    var focusable = Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; }
    );
    if (!focusable.length) { e.preventDefault(); panel.focus(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* The booking form sits above this modal, so opening it closes this one. */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-booking]');
    if (trigger && isOpen && modal.contains(trigger)) {
      setBackgroundInert(false);
      isOpen = false;
      modal.classList.remove('pmodal--open');
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }, true);

  /* ---------- Boot ---------- */
  function build() {
    grid.textContent = '';
    DATA.programmes.forEach(function (p) { grid.appendChild(card(p)); });
    if (window.shI18n) window.shI18n.refresh(grid);
  }

  fetch(root + 'data/programmes.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (json) {
      DATA = json;
      modal = buildModal();
      build();
      document.addEventListener('shlangchange', build);
    })
    .catch(function (err) {
      console.error('[services] could not load the programme data:', err);
      grid.appendChild(h('p', { class: 'cmp-empty', text: t('The programmes could not be loaded. Please refresh the page.') }));
    });
})();
