/* ============================================
   STUDY HOUSE — GPA calculator

   Mounts into any element with a data-gpa attribute:

     <div data-gpa></div>            compact: calculator + result only
     <div data-gpa="full"></div>     also the Ambitious / Realistic / Safe lists

   All conversion tables live in data/grades.json, with their sources and the
   year. The university lists are the same data/<country>.json files the
   comparison tables use, so a figure is only ever corrected in one place.

   Every number this produces is an estimate and is labelled as one. It is not
   a prediction of admission, and it never claims to be.
   ============================================ */

(function () {
  'use strict';

  var mounts = Array.prototype.slice.call(document.querySelectorAll('[data-gpa]'));
  if (!mounts.length) return;

  var root = document.documentElement.getAttribute('data-root') || '';
  var COUNTRIES = ['usa', 'australia', 'china'];

  var G = null;          // grades.json
  var UNIS = [];         // flattened universities from the country files
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(en) { return window.shI18n ? window.shI18n.t(en) : en; }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
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

  /* ---------- Conversions ---------- */

  /* A grade on `scale` -> the band it falls in (Scholaro's table for Uzbekistan). */
  function band(scale, value) {
    var bands = G.scales[scale].bands;
    for (var i = 0; i < bands.length; i++) if (value >= bands[i].min) return bands[i];
    return bands[bands.length - 1];
  }

  /* Weighted mean of the band grade points -> GPA on the 4.0 scale. */
  function gpaOf(rows, scale) {
    var points = 0, credits = 0;
    rows.forEach(function (r) {
      if (r.value === null) return;
      var w = r.credits > 0 ? r.credits : 1;
      points += band(scale, r.value).gpa * w;
      credits += w;
    });
    return credits ? points / credits : null;
  }

  /* Modified Bavarian formula: 1 + 3 * (Nmax - Nd) / (Nmax - Nmin).
     Applied to the weighted average of the raw grades, then clamped to the
     German 1.0-4.0 range. */
  function germanOf(rows, scale) {
    var sc = G.scales[scale];
    var sum = 0, credits = 0;
    rows.forEach(function (r) {
      if (r.value === null) return;
      var w = r.credits > 0 ? r.credits : 1;
      sum += r.value * w;
      credits += w;
    });
    if (!credits) return null;
    var nd = sum / credits;
    if (nd < sc.pass) return null;                       // below the pass mark: no German grade
    var g = 1 + 3 * (sc.max - nd) / (sc.max - sc.pass);
    return Math.min(G.german.passLimit, Math.max(G.german.best, g));
  }

  function ukOf(gpa) {
    var bands = G.uk.bands;
    for (var i = 0; i < bands.length; i++) if (gpa >= bands[i].min) return bands[i].label;
    return bands[bands.length - 1].label;
  }

  function profileOf(gpa) {
    for (var i = 0; i < G.profile.length; i++) if (gpa >= G.profile[i].minGpa) return G.profile[i];
    return G.profile[G.profile.length - 1];
  }

  /* QS rank as a number ("=20" -> 20) so it can be compared */
  function rankNum(qs) {
    var n = parseInt(String(qs).replace(/^=/, ''), 10);
    return isNaN(n) ? 9999 : n;
  }

  function shortlist(profileId) {
    var b = G.shortlist.bands[profileId];
    var out = { ambitious: [], realistic: [], safe: [] };
    UNIS.forEach(function (u) {
      var r = rankNum(u.qs);
      if (r < b.ambitious) out.ambitious.push(u);
      else if (r < b.realistic) out.realistic.push(u);
      else out.safe.push(u);
    });
    Object.keys(out).forEach(function (k) {
      out[k].sort(function (a, c) { return rankNum(a.qs) - rankNum(c.qs); });
    });
    return out;
  }

  /* ---------- One calculator instance ---------- */
  function Calculator(el) {
    var full = el.getAttribute('data-gpa') === 'full';
    var tab = 'school';                 // 'school' | 'university'
    var scale = 'uz5';                  // university tab can switch to uz100
    var rows = [];
    var nextId = 1;
    var result = null;
    var ui = {};

    function scaleForTab() { return tab === 'school' ? 'uz5' : scale; }

    function addRow(name, value, credits, key) {
      rows.push({
        id: nextId++, name: name || '', key: key || null, edited: false,
        value: value == null ? null : value, credits: credits || null
      });
    }

    /* What to show in the name box: the visitor's own text once they type, the
       translated template name until then. */
    function rowName(r) { return (r.key && !r.edited) ? t(r.key) : r.name; }

    function seed() {
      rows = [];
      var tpl = G.templates[tab][0];
      tpl.subjects.slice(0, full ? tpl.subjects.length : 4).forEach(function (s) { addRow(t(s), null, null, s); });
    }

    /* ----- Markup ----- */
    function build() {
      el.textContent = '';
      el.className = 'gpa' + (full ? ' gpa--full' : '');

      /* Tabs */
      var tabs = h('div', { class: 'gpa__tabs', role: 'tablist', 'aria-label': t('Grade scale') });
      [['school', 'School'], ['university', 'University']].forEach(function (p) {
        var b = h('button', {
          type: 'button', class: 'gpa__tab' + (tab === p[0] ? ' gpa__tab--on' : ''),
          role: 'tab', 'aria-selected': tab === p[0] ? 'true' : 'false', text: t(p[1])
        });
        b.addEventListener('click', function () {
          if (tab === p[0]) return;
          tab = p[0];
          scale = tab === 'school' ? 'uz5' : 'uz100';
          seed();
          build();
        });
        tabs.appendChild(b);
      });
      el.appendChild(tabs);

      var card = h('div', { class: 'gpa__card' });
      el.appendChild(card);

      /* Scale switch + templates */
      var bar = h('div', { class: 'gpa__bar' });
      if (tab === 'university') {
        var sw = h('div', { class: 'gpa__scales', role: 'group', 'aria-label': t('Grade scale') });
        [['uz100', '100-point'], ['uz5', '5-point']].forEach(function (p) {
          var b = h('button', {
            type: 'button', class: 'gpa__scale' + (scale === p[0] ? ' gpa__scale--on' : ''),
            'aria-pressed': scale === p[0] ? 'true' : 'false', text: t(p[1])
          });
          b.addEventListener('click', function () {
            if (scale === p[0]) return;
            scale = p[0];
            rows.forEach(function (r) { r.value = null; });
            build();
          });
          sw.appendChild(b);
        });
        bar.appendChild(sw);
      }

      var tplWrap = h('div', { class: 'gpa__templates' });
      tplWrap.appendChild(h('span', { class: 'gpa__templates-label', text: t('Quick start') + ':' }));
      G.templates[tab].forEach(function (tpl) {
        var b = h('button', { type: 'button', class: 'gpa__tpl', text: t(tpl.label) });
        b.addEventListener('click', function () {
          rows = [];
          tpl.subjects.forEach(function (s) { addRow(t(s), null, null, s); });
          build();
        });
        tplWrap.appendChild(b);
      });
      bar.appendChild(tplWrap);
      card.appendChild(bar);

      /* Rows */
      ui.list = h('div', { class: 'gpa__rows' });
      card.appendChild(ui.list);
      rows.forEach(function (r) { ui.list.appendChild(rowEl(r)); });

      var actions = h('div', { class: 'gpa__actions' });
      var add = h('button', { type: 'button', class: 'gpa__add', text: '+ ' + t('Add subject') });
      add.addEventListener('click', function () {
        addRow('', null, null);
        ui.list.appendChild(rowEl(rows[rows.length - 1]));
        ui.list.lastChild.querySelector('input').focus();
        recalc();
      });
      actions.appendChild(add);
      card.appendChild(actions);

      /* Result */
      ui.result = h('div', { class: 'gpa__result', 'aria-live': 'polite' });
      card.appendChild(ui.result);

      if (full) {
        ui.lists = h('div', { class: 'gpa__lists' });
        el.appendChild(ui.lists);
      }

      recalc();
      if (window.shI18n) window.shI18n.refresh(el);
    }

    function rowEl(r) {
      var sc = G.scales[scaleForTab()];
      var wrap = h('div', { class: 'gpa__row' });

      var name = h('input', {
        type: 'text', class: 'gpa__name', value: rowName(r),
        'aria-label': t('Subject name'), placeholder: t('Subject')
      });
      name.addEventListener('input', function () { r.name = name.value; r.edited = true; });

      var grade = h('input', {
        type: 'number', class: 'gpa__grade', inputmode: 'numeric',
        min: '0', max: String(sc.max), step: String(sc.step),
        'aria-label': t('Grade'), placeholder: tab === 'school' ? '5' : (scaleForTab() === 'uz100' ? '85' : '5')
      });
      if (r.value !== null) grade.value = r.value;
      grade.addEventListener('input', function () {
        var v = grade.value === '' ? null : Number(grade.value);
        if (v !== null && (isNaN(v) || v < 0 || v > sc.max)) {
          wrap.classList.add('gpa__row--bad');
          r.value = null;
        } else {
          wrap.classList.remove('gpa__row--bad');
          r.value = v;
        }
        recalc();
      });

      wrap.appendChild(name);
      wrap.appendChild(grade);

      if (tab === 'university') {
        var cr = h('input', {
          type: 'number', class: 'gpa__credits', inputmode: 'numeric', min: '0', step: '1',
          'aria-label': t('Credits (optional)'), placeholder: t('Cr.')
        });
        if (r.credits) cr.value = r.credits;
        cr.addEventListener('input', function () {
          r.credits = cr.value === '' ? null : Number(cr.value);
          recalc();
        });
        wrap.appendChild(cr);
      }

      var del = h('button', {
        type: 'button', class: 'gpa__del', 'aria-label': t('Remove subject'), html: '&times;'
      });
      del.addEventListener('click', function () {
        rows = rows.filter(function (x) { return x.id !== r.id; });
        wrap.remove();
        recalc();
      });
      wrap.appendChild(del);
      return wrap;
    }

    /* ----- Result ----- */
    var thinkTimer = null;

    function recalc() {
      var sc = scaleForTab();
      var filled = rows.filter(function (r) { return r.value !== null; });
      if (!filled.length) {
        result = null;
        renderEmpty();
        return;
      }
      result = {
        gpa: gpaOf(rows, sc),
        german: germanOf(rows, sc),
        subjects: filled.length,
        tab: tab,
        scale: G.scales[sc].label
      };
      result.uk = ukOf(result.gpa);
      result.profile = profileOf(result.gpa);
      renderResult();
    }

    function renderEmpty() {
      ui.result.textContent = '';
      ui.result.appendChild(h('p', { class: 'gpa__hint', text: t('Enter at least one grade to see your estimate.') }));
      if (ui.lists) ui.lists.textContent = '';
    }

    function ring(gpa) {
      var pct = Math.max(0, Math.min(1, gpa / 4));
      var R = 52, C = 2 * Math.PI * R;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 120 120');
      svg.setAttribute('class', 'gpa__ring');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML =
        '<defs><linearGradient id="gpaGold" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#916329"/><stop offset="55%" stop-color="#CC9855"/><stop offset="100%" stop-color="#FBD49E"/>' +
        '</linearGradient></defs>' +
        '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="9"/>' +
        '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="url(#gpaGold)" stroke-width="9" stroke-linecap="round" ' +
          'transform="rotate(-90 60 60)" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" class="gpa__ring-arc"/>';
      requestAnimationFrame(function () {
        var arc = svg.querySelector('.gpa__ring-arc');
        if (reduceMotion) { arc.style.transition = 'none'; }
        arc.setAttribute('stroke-dashoffset', String(C * (1 - pct)));
      });
      return svg;
    }

    function countUp(node, to) {
      if (reduceMotion) { node.textContent = to.toFixed(2); return; }
      var from = 0, start = null, dur = 700, done = false;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        node.textContent = (from + (to - from) * (1 - Math.pow(1 - p, 3))).toFixed(2);
        if (p < 1) requestAnimationFrame(step); else done = true;
      }
      requestAnimationFrame(step);
      /* Safety net: if the frame callbacks never arrive, still show the number. */
      setTimeout(function () { if (!done) node.textContent = to.toFixed(2); }, dur + 80);
    }

    /* Poses the owner has not supplied yet fall back to the wave pose; if that
       is missing too the mascot is simply hidden. */
    function mascot(pose) {
      var img = h('img', { class: 'gpa__mascot', alt: '', width: '452', height: '545' });
      img.setPose = function (name) {
        img.dataset.pose = name;
        img.src = root + 'images/mascot/mascot-' + name + '.png';
      };
      img.addEventListener('error', function () {
        if (img.dataset.pose === 'wave') { img.hidden = true; return; }
        img.setPose('wave');
      });
      img.setPose(pose);
      return img;
    }

    function renderResult() {
      var r = result;
      ui.result.textContent = '';

      var gauge = h('div', { class: 'gpa__gauge' });
      gauge.appendChild(ring(r.gpa));
      var num = h('span', { class: 'gpa__gauge-num', text: '0.00' });
      gauge.appendChild(h('div', { class: 'gpa__gauge-inner' },
        num,
        h('span', { class: 'gpa__gauge-of', text: '/ 4.00' })));
      countUp(num, r.gpa);

      var stats = h('div', { class: 'gpa__stats' });
      function stat(label, value, note) {
        var box = h('div', { class: 'gpa__stat' },
          h('span', { class: 'gpa__stat-label', text: t(label) }),
          h('span', { class: 'gpa__stat-value', text: value }));
        if (note) box.appendChild(h('span', { class: 'gpa__stat-note', text: t(note) }));
        return box;
      }
      stats.appendChild(stat('German grade (estimate)',
        r.german === null ? '—' : r.german.toFixed(1),
        r.german === null ? 'Below the pass mark for this scale' : '1.0 is the best grade'));
      stats.appendChild(stat('UK class (estimate)', t(r.uk)));
      stats.appendChild(stat('Profile strength', t(r.profile.label)));

      /* thinking while the numbers move, happy once a strong result lands */
      var pose = mascot('thinking');
      clearTimeout(thinkTimer);
      thinkTimer = setTimeout(function () {
        if (result && result.profile.id === 'strong') pose.setPose('happy');
      }, reduceMotion ? 0 : 750);

      var head = h('div', { class: 'gpa__result-head' }, gauge, stats, pose);
      ui.result.appendChild(head);

      ui.result.appendChild(h('p', { class: 'gpa__estimate' },
        h('strong', { text: t('Estimate only.') }), ' ',
        t('Based on') + ' ' + r.subjects + ' ' + t('subjects') + ' · ' + t(r.scale) + '. ' +
        t('Universities and credential-evaluation services apply their own rules.')));

      var cta = h('button', {
        type: 'button', class: 'btn btn--consult--dark gpa__cta',
        text: t('Get my personal shortlist') + ' →'
      });
      cta.addEventListener('click', function () {
        var label = r.gpa.toFixed(2) + ' / 4.00 (' + t(r.scale) + ', ' + t(r.tab === 'school' ? 'School' : 'University') + ')'
          + (r.german === null ? '' : ' · ' + t('German') + ' ' + r.german.toFixed(1))
          + ' · ' + t(r.uk);
        if (window.openBooking) window.openBooking({ gpa: label, source: 'gpa-calculator' });
      });
      ui.result.appendChild(cta);

      if (ui.lists) renderLists(r);
    }

    function renderLists(r) {
      ui.lists.textContent = '';
      if (!UNIS.length) return;
      var groups = shortlist(r.profile.id);

      ui.lists.appendChild(h('h2', { class: 'gpa__lists-heading', text: t('Where this profile sits') }));
      ui.lists.appendChild(h('p', { class: 'gpa__lists-note', text: t(G.shortlist.note) }));

      var grid = h('div', { class: 'gpa__groups' });
      [
        ['ambitious', 'Ambitious', 'Ranked well above the level this profile usually clears — worth one or two applications, with a backup.'],
        ['realistic', 'Realistic', 'In the range where this profile is competitive on the published entry requirements.'],
        ['safe', 'Safe', 'Less selective on the published figures, so more likely to work out — still apply properly.']
      ].forEach(function (g) {
        var list = groups[g[0]];
        var box = h('div', { class: 'gpa__group gpa__group--' + g[0] });
        box.appendChild(h('h3', { class: 'gpa__group-title', text: t(g[1]) }));
        box.appendChild(h('p', { class: 'gpa__group-why', text: t(g[2]) }));
        if (!list.length) {
          box.appendChild(h('p', { class: 'gpa__group-empty', text: t('Nothing in our current country lists falls into this group for this profile. That is a reason to talk to an advisor, not a dead end.') }));
        } else {
          var ul = h('ul', { class: 'gpa__group-list' });
          list.forEach(function (u) {
            ul.appendChild(h('li', {},
              h('a', { href: root + 'destinations/' + u.countryId + '/index.html', class: 'gpa__uni' },
                h('span', { class: 'gpa__uni-name', text: u.name }),
                h('span', { class: 'gpa__uni-meta', text: 'QS ' + (String(u.qs).charAt(0) === '=' ? u.qs : '#' + u.qs) + ' · ' + t(u.countryLabel) }))));
          });
          box.appendChild(ul);
        }
        grid.appendChild(box);
      });
      ui.lists.appendChild(grid);
    }

    seed();
    build();
    document.addEventListener('shlangchange', build);
  }

  /* ---------- Load the data, then mount ---------- */
  var LABELS = { usa: 'USA', australia: 'Australia', china: 'China' };

  function fail(err) {
    console.error('[gpa] could not load the conversion data:', err);
    mounts.forEach(function (el) {
      el.textContent = '';
      el.appendChild(h('p', { class: 'gpa__hint', text: t('The calculator could not be loaded. Please refresh the page.') }));
    });
  }

  function json(path) {
    return fetch(root + path, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error(path + ': HTTP ' + res.status);
      return res.json();
    });
  }

  function start() {
    json('data/grades.json')
      .then(function (g) {
        G = g;
        /* The country files are a nice-to-have: without them the calculator
           still works, it just cannot show the shortlist. */
        return Promise.all(COUNTRIES.map(function (c) {
          return json('data/' + c + '.json').catch(function () { return null; });
        }));
      })
      .then(function (files) {
        files.forEach(function (f, i) {
          if (!f) return;
          f.universities.forEach(function (u) {
            UNIS.push(Object.assign({}, u, { countryId: COUNTRIES[i], countryLabel: LABELS[COUNTRIES[i]] }));
          });
        });
        mounts.forEach(function (el) { Calculator(el); });
        renderSources();
      })
      .catch(fail);
  }

  /* The conversion sources belong on the page, next to the "Last updated" date. */
  function renderSources() {
    var box = document.getElementById('gpa-sources');
    if (!box || !G.sources) return;
    box.appendChild(document.createTextNode(' · '));
    box.appendChild(h('strong', { text: t('Sources:') + ' ' }));
    G.sources.forEach(function (src, i) {
      if (i) box.appendChild(document.createTextNode(' · '));
      box.appendChild(h('a', { href: src[1], target: '_blank', rel: 'noopener noreferrer', text: src[0] }));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
