/* ============================================
   STUDY HOUSE — "Compare universities" component

   A country page defines window.SH_COMPARE (see destinations/usa/data.js) and
   contains <div id="compare-root"></div>. The visitor picks 2 or 3 universities
   and sees them side by side (a table on desktop, stacked cards on phones).

   Every cell is either a string or { todo: true } for a figure that has not been
   verified yet — those render as a clearly marked placeholder, never a guess.
   ============================================ */

(function () {
  'use strict';

  var root = document.getElementById('compare-root');
  if (!root) return;

  var cfg = null;

  var MAX = 3;
  var ROWS = [
    ['city', 'City'],
    ['type', 'Public or private'],
    ['qs', 'QS World University Rank'],
    ['tuition', 'Tuition per year'],
    ['living', 'Living cost'],
    ['english', 'English-taught programs & language test'],
    ['fields', 'Strongest fields'],
    ['scholarships', 'Scholarships for international students'],
    ['deadline', 'Main application deadline'],
    ['selective', 'How selective']
  ];
  var TAGS = [
    ['prestige', 'Most prestigious', 'Highest QS rank in this list'],
    ['value', 'Best value', 'Lowest cost among the figures shown in this table'],
    ['scholarships', 'Best for scholarships', 'Largest published award for international students in this list']
  ];

  var selected = [];
  var lastFocusId = null;

  function t(s) { return window.shI18n ? window.shI18n.t(s) : s; }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }

  /* QS writes joint ranks as "=20" — keep that notation, add # only to plain numbers */
  function rankLabel(r) { return String(r).charAt(0) === '=' ? r : '#' + r; }

  function byId(id) {
    return cfg.universities.filter(function (u) { return u.id === id; })[0];
  }

  function tagsFor(id) {
    return TAGS.filter(function (tg) { return cfg.tags && cfg.tags[tg[0]] === id; });
  }

  function tagEl(tg) {
    return h('span', { class: 'cmp-tag cmp-tag--' + tg[0], title: t(tg[2]) }, t(tg[1]));
  }

  function cellNode(u, key) {
    var v = u[key];
    if (key === 'qs') return h('span', { class: 'cmp-qs' }, rankLabel(u.qs), h('small', { text: ' QS ' + cfg.qsYear }));
    if (key === 'type') return document.createTextNode(t(v));
    if (v && typeof v === 'object' && v.todo) return h('span', { class: 'cmp-todo' }, t('Not verified yet — see the official site'));
    return document.createTextNode(t(v));
  }

  /* ---------- Picker ---------- */
  function buildPicker() {
    var wrap = h('div', { class: 'cmp-picker' });
    var label = h('p', { class: 'cmp-picker__label', id: 'cmp-picker-label', text: t('Choose 2 or 3 universities to compare side by side') });
    var group = h('div', { class: 'cmp-chips', role: 'group', 'aria-labelledby': 'cmp-picker-label' });
    var full = selected.length >= MAX;

    cfg.universities.forEach(function (u) {
      var on = selected.indexOf(u.id) !== -1;
      var chip = h('button', {
        type: 'button', class: 'cmp-chip' + (on ? ' cmp-chip--on' : ''), 'data-id': u.id,
        'aria-pressed': on ? 'true' : 'false'
      }, h('span', { class: 'cmp-chip__name', text: u.name }), h('span', { class: 'cmp-chip__qs', text: 'QS ' + rankLabel(u.qs) }));
      if (!on && full) { chip.setAttribute('aria-disabled', 'true'); chip.classList.add('cmp-chip--off'); }
      chip.addEventListener('click', function () { toggle(u.id); });
      group.appendChild(chip);
    });

    var status = h('p', { class: 'cmp-status', role: 'status', 'aria-live': 'polite' },
      t('Selected') + ': ' + selected.length + ' / ' + MAX + (full ? ' — ' + t('You can compare up to 3 universities. Remove one to add another.') : ''));

    wrap.appendChild(label);
    wrap.appendChild(group);
    wrap.appendChild(status);
    return wrap;
  }

  function toggle(id) {
    var i = selected.indexOf(id);
    if (i !== -1) selected.splice(i, 1);
    else if (selected.length < MAX) selected.push(id);
    lastFocusId = id;
    render();
  }

  /* ---------- Table (desktop) ---------- */
  function buildTable(unis) {
    var table = h('table', { class: 'cmp-table' });
    table.appendChild(h('caption', { class: 'sr-only', text: t('University comparison table') }));

    var head = h('tr');
    head.appendChild(h('td', { class: 'cmp-table__corner' }));
    unis.forEach(function (u) {
      var th = h('th', { scope: 'col', class: 'cmp-table__uni' }, h('span', { class: 'cmp-table__name', text: u.name }));
      var tg = tagsFor(u.id);
      if (tg.length) { var box = h('span', { class: 'cmp-tags' }); tg.forEach(function (x) { box.appendChild(tagEl(x)); }); th.appendChild(box); }
      head.appendChild(th);
    });
    table.appendChild(h('thead', {}, head));

    var body = h('tbody');
    ROWS.forEach(function (r) {
      var tr = h('tr', {}, h('th', { scope: 'row', text: t(r[1]) }));
      unis.forEach(function (u) { tr.appendChild(h('td', {}, cellNode(u, r[0]))); });
      body.appendChild(tr);
    });
    table.appendChild(body);
    /* The table scrolls sideways inside its own box on mid-size screens (narrower
       ones get stacked cards instead). The box is keyboard-focusable, and a hint
       appears whenever there is more to scroll to and disappears at the end. */
    var scroll = h('div', { class: 'cmp-scroll', tabindex: '0', role: 'region', 'aria-label': t('University comparison table') }, table);
    var hint = h('p', { class: 'cmp-hint', 'aria-hidden': 'true', text: '← ' + t('Swipe sideways to see more') + ' →' });
    var box = h('div', { class: 'cmp-tablewrap' }, scroll, hint);
    function sync() {
      box.classList.toggle('is-scrollable', scroll.scrollWidth > scroll.clientWidth + 1);
      box.classList.toggle('at-start', scroll.scrollLeft <= 2);
      box.classList.toggle('at-end', scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 2);
    }
    scroll.addEventListener('scroll', sync, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(sync).observe(scroll); else window.addEventListener('resize', sync);
    setTimeout(sync, 0);
    return box;
  }

  /* ---------- Cards (phones) ---------- */
  function buildCards(unis) {
    var wrap = h('div', { class: 'cmp-cards' });
    unis.forEach(function (u) {
      var card = h('article', { class: 'cmp-card' });
      card.appendChild(h('h3', { class: 'cmp-card__name', text: u.name }));
      var tg = tagsFor(u.id);
      if (tg.length) { var box = h('div', { class: 'cmp-tags' }); tg.forEach(function (x) { box.appendChild(tagEl(x)); }); card.appendChild(box); }
      var dl = h('dl', { class: 'cmp-card__list' });
      ROWS.forEach(function (r) {
        dl.appendChild(h('dt', { text: t(r[1]) }));
        dl.appendChild(h('dd', {}, cellNode(u, r[0])));
      });
      card.appendChild(dl);
      wrap.appendChild(card);
    });
    return wrap;
  }

  /* ---------- Footer: date, ranking, sources, CTA ---------- */
  /* Chrome has no month names for the "uz" locale and falls back to "2026 M09 25",
     so Uzbek dates are written out here in the usual "2026-yil 25-sentabr" form. */
  var UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
                   'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

  function formatDate(iso) {
    var lang = window.shI18n ? window.shI18n.lang() : 'en';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    if (lang === 'uz') {
      return d.getFullYear() + '-yil ' + d.getDate() + '-' + UZ_MONTHS[d.getMonth()];
    }
    try {
      return new Intl.DateTimeFormat(lang === 'ru' ? 'ru' : 'en-GB',
        { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) { return iso; }
  }

  function link(label, url) {
    return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: label });
  }

  function buildFooter() {
    var box = h('div', { class: 'cmp-foot' });
    box.appendChild(h('p', { class: 'cmp-foot__meta' },
      h('strong', { text: t('Last updated') + ': ' }), formatDate(cfg.updated),
      ' · ', h('strong', { text: t('Ranking') + ': ' }), link(cfg.qsEdition, cfg.qsUrl)));
    box.appendChild(h('p', { class: 'cmp-foot__note', text: t('Tags are based only on the figures shown in this table. Fees change every year — always confirm on the official page.') }));

    var details = h('details', { class: 'cmp-sources' }, h('summary', { text: t('Sources for each university') }));
    var list = h('ul', { class: 'cmp-sources__list' });
    cfg.universities.forEach(function (u) {
      var li = h('li', {}, h('strong', { text: u.name }));
      var links = h('span', { class: 'cmp-sources__links' });
      (u.sources || []).forEach(function (s, i) { if (i) links.appendChild(document.createTextNode(' · ')); links.appendChild(link(s[0], s[1])); });
      li.appendChild(links);
      list.appendChild(li);
    });
    details.appendChild(list);
    box.appendChild(details);

    box.appendChild(h('div', { class: 'cmp-cta' },
      h('a', { href: '#book-a-consultation', class: 'btn btn--consult', 'data-booking': '', 'data-booking-country': cfg.country || '', text: t('Get my personal shortlist') + ' →' })));
    return box;
  }

  /* ---------- Render ---------- */
  function render() {
    root.textContent = '';
    root.appendChild(buildPicker());

    var unis = selected.map(byId).filter(Boolean);
    var out = h('div', { class: 'cmp-output' });
    if (unis.length < 2) {
      out.appendChild(h('p', { class: 'cmp-empty', text: t('Select at least 2 universities to see the comparison.') }));
    } else {
      out.appendChild(buildTable(unis));
      out.appendChild(buildCards(unis));
    }
    root.appendChild(out);
    root.appendChild(buildFooter());

    if (lastFocusId) {
      var chip = root.querySelector('.cmp-chip[data-id="' + lastFocusId + '"]');
      if (chip) chip.focus({ preventScroll: true });
    }
  }

  /* A card/table is built after i18n has initialised (scripts run before DOMContentLoaded) */
  function start() {
    selected = (cfg.defaults || cfg.universities.slice(0, 2).map(function (u) { return u.id; })).slice(0, MAX);
    render();
    document.addEventListener('shlangchange', function () { lastFocusId = null; render(); });
  }

  function fail(err) {
    console.error('[compare] could not load the university data:', err);
    root.textContent = '';
    root.appendChild(h('p', { class: 'cmp-empty', text: t('The comparison table could not be loaded. Please refresh the page.') }));
  }

  /* The university data is one JSON file per country (see data/usa.json), so the
     same file feeds this table and the GPA calculator. It is fetched, which means
     the site has to be served over http(s) — opening index.html from the file
     system will not work. */
  function load() {
    var src = root.getAttribute('data-src');
    if (!src) { fail('no data-src on #compare-root'); return; }
    fetch(src, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) { cfg = json; start(); })
      .catch(fail);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
