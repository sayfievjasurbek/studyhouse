/* ============================================
   STUDY HOUSE — GPA calculator

   Mounts into any element with a data-gpa attribute:

     <div data-gpa></div>            compact: the three steps, short result
     <div data-gpa="full"></div>     also the Ambitious / Realistic / Safe lists

   Three steps: 1 Grades, 2 Profile, 3 Results, with a "Start over" link.
   Grades are entered as one average score on the scale the visitor picks.

   Every conversion table, scale, score range and threshold lives in
   data/grades.json with its source and year. The university lists are the same
   data/<country>.json files the comparison tables use.

   Everything this produces is an estimate and is labelled as one. It is not a
   prediction of admission, and it shows no percentile or earnings claims,
   because there is no cited source for them.

   Input rules: no minus or decrement control anywhere, every field is clamped
   to its published range, and no negative number can reach a result.
   ============================================ */

(function () {
  'use strict';

  var mounts = Array.prototype.slice.call(document.querySelectorAll('[data-gpa]'));
  if (!mounts.length) return;

  var root = document.documentElement.getAttribute('data-root') || '';
  var G = null;                 // grades.json
  var UNIS = [];                // universities from the country files
  var LOADED = {};              // country data id -> true when its file was read
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

  /* ---------- Scales ---------- */
  function scale(id) {
    var s = G.scales[id];
    if (s && s.sameAs) {
      var merged = {};
      var base = G.scales[s.sameAs];
      Object.keys(base).forEach(function (k) { merged[k] = base[k]; });
      Object.keys(s).forEach(function (k) { if (k !== 'sameAs') merged[k] = s[k]; });
      return merged;
    }
    return s;
  }

  function isLetterScale(id) { return scale(id).kind === 'letter'; }

  function clamp(id, v) {
    var s = scale(id);
    if (v === null || isNaN(v)) return null;
    return Math.min(s.max, Math.max(Math.max(0, s.min), v));
  }

  function bandOf(id, v) {
    var bands = scale(id).bands || [];
    for (var i = 0; i < bands.length; i++) if (v >= bands[i].min) return bands[i];
    return null;
  }

  /* ONE overall GPA on the 4.0 scale across every row, weighted by credits or
     hours when they are given. null when the scale has no published conversion
     (IB, A-Level) — the calculator then shows no GPA rather than inventing one. */
  function gpaOf(id, rows) {
    var s = scale(id);
    if (!s.gpa) return null;
    var points = 0, weight = 0;
    rows.forEach(function (r) {
      if (r.value === null) return;
      var w = r.weight > 0 ? r.weight : 1;
      var p;
      if (s.gpa === 'direct' || s.gpa === 'letters') p = r.value;
      else { var b = bandOf(id, r.value); p = b ? b.gpa : 0; }
      points += p * w;
      weight += w;
    });
    if (!weight) return null;
    return Math.max(0, Math.min(4, points / weight));
  }

  function rawMean(id, rows) {
    var sum = 0, weight = 0;
    rows.forEach(function (r) {
      if (r.value === null) return;
      var w = r.weight > 0 ? r.weight : 1;
      sum += r.value * w;
      weight += w;
    });
    return weight ? sum / weight : null;
  }

  /* Modified Bavarian formula, clamped to the German 1.0-4.0 range. */
  function germanOf(id, rows) {
    var s = scale(id);
    var nd = rawMean(id, rows);
    if (nd === null || nd < s.pass) return null;
    var g = 1 + 3 * (s.max - nd) / (s.max - s.pass);
    return Math.min(G.german.passLimit, Math.max(G.german.best, g));
  }

  /* Position on the student's own scale, 0..1 — works for every scale. */
  function ratioOf(id, rows) {
    var s = scale(id);
    var nd = rawMean(id, rows);
    if (nd === null) return null;
    var r = (nd - s.pass) / (s.max - s.pass);
    /* Round before comparing: an exact threshold like 0.8 otherwise arrives as
       0.7999999999999998 and drops the profile a band. */
    return Math.max(0, Math.min(1, Math.round(r * 1e6) / 1e6));
  }

  function ukOf(gpa) {
    var b = G.uk.bands;
    for (var i = 0; i < b.length; i++) if (gpa >= b[i].min) return b[i].label;
    return b[b.length - 1].label;
  }

  function profileOf(ratio) {
    for (var i = 0; i < G.profile.length; i++) if (ratio >= G.profile[i].minRatio) return G.profile[i];
    return G.profile[G.profile.length - 1];
  }

  function testById(id) {
    for (var i = 0; i < G.tests.length; i++) if (G.tests[i].id === id) return G.tests[i];
    return null;
  }

  function countryById(id) {
    for (var i = 0; i < G.countries.length; i++) if (G.countries[i].id === id) return G.countries[i];
    return null;
  }

  /* ---------- Shortlist ---------- */
  function rankNum(qs) {
    var n = parseInt(String(qs).replace(/^=/, ''), 10);
    return isNaN(n) ? 9999 : n;
  }

  /* Read a published minimum IELTS / TOEFL out of the university's English
     cell, only where it is unambiguous. Nothing parses, nothing is claimed. */
  function englishMinimum(u) {
    var txt = typeof u.english === 'string' ? u.english : '';
    var out = {};
    var m = txt.match(/IELTS\s*([0-9](?:\.[05])?)/i);
    if (m) out.ielts = parseFloat(m[1]);
    m = txt.match(/TOEFL[^0-9]{0,18}?(\d{2,3})/i);
    if (m) out.toefl = parseInt(m[1], 10);
    return out;
  }

  function shortlist(state, result) {
    var bands = G.shortlist.bands[result.profile.id];
    var picked = state.countries.length
      ? UNIS.filter(function (u) { return state.countries.indexOf(u.countryId) !== -1; })
      : UNIS.slice();

    var out = { ambitious: [], realistic: [], safe: [] };
    picked.forEach(function (u) {
      var r = rankNum(u.qs);
      var group = r < bands.ambitious ? 'ambitious' : (r < bands.realistic ? 'realistic' : 'safe');
      var note = null;
      var need = englishMinimum(u);
      var ielts = state.scores.ielts, toefl = state.scores.toefl;
      if (need.ielts && ielts !== undefined && ielts < need.ielts) {
        group = 'ambitious';
        note = t('Published IELTS minimum') + ' ' + need.ielts + ' — ' + t('above your') + ' ' + ielts;
      } else if (need.toefl && toefl !== undefined && toefl < need.toefl) {
        group = 'ambitious';
        note = t('Published TOEFL minimum') + ' ' + need.toefl + ' — ' + t('above your') + ' ' + toefl;
      }
      out[group].push({ u: u, note: note });
    });

    Object.keys(out).forEach(function (k) {
      out[k].sort(function (a, b) { return rankNum(a.u.qs) - rankNum(b.u.qs); });
    });
    return out;
  }

  function countriesWithoutData(state) {
    return state.countries.filter(function (id) {
      var c = countryById(id);
      return !c || !c.data || !LOADED[c.data];
    }).map(function (id) { return countryById(id).label; });
  }

  /* ---------- One calculator ---------- */
  function Calculator(el) {
    var full = el.getAttribute('data-gpa') === 'full';
    var state, result, ui;

    function fresh() {
      state = {
        step: 1,
        scaleId: 'uz5',
        known: null,
        countries: [],
        firstName: '',
        level: 'school-11',
        tests: [],
        scores: {}
      };
      result = null;
      ui = {};
    }

    /* ---------- Shell ---------- */
    function render() {
      el.textContent = '';
      el.className = 'gpa' + (full ? ' gpa--full' : '');
      el.appendChild(progress());

      var card = h('div', { class: 'gpa__card' });
      card.appendChild(state.step === 1 ? stepGrades() : state.step === 2 ? stepProfile() : stepResults());
      el.appendChild(card);

      if (state.step === 3 && full) el.appendChild(listsSection());
      if (window.shI18n) window.shI18n.refresh(el);
    }

    function goto(step) {
      state.step = step;
      render();
      var card = el.querySelector('.gpa__card');
      if (card && !reduceMotion) {
        card.classList.add('gpa__card--enter');
        var show = function () { card.classList.remove('gpa__card--enter'); };
        requestAnimationFrame(function () { requestAnimationFrame(show); });
        setTimeout(show, 60);
      }
    }

    function progress() {
      var steps = [['1', 'Grades'], ['2', 'Profile'], ['3', 'Results']];
      var wrap = h('div', { class: 'gpa__progress' });
      var list = h('ol', { class: 'gpa__steps' });
      steps.forEach(function (s, i) {
        var n = i + 1;
        var cls = 'gpa__step' + (n === state.step ? ' gpa__step--on' : '') + (n < state.step ? ' gpa__step--done' : '');
        var li = h('li', { class: cls, 'aria-current': n === state.step ? 'step' : null },
          h('span', { class: 'gpa__step-num', text: s[0] }),
          h('span', { class: 'gpa__step-label', text: t(s[1]) }));
        if (n < state.step) {
          li.classList.add('gpa__step--clickable');
          li.addEventListener('click', function () { goto(n); });
        }
        list.appendChild(li);
      });
      wrap.appendChild(list);
      wrap.appendChild(h('div', { class: 'gpa__bar-track' },
        h('div', { class: 'gpa__bar-fill', style: 'width:' + (state.step / 3 * 100) + '%' })));

      var reset = h('button', { type: 'button', class: 'gpa__reset', text: t('Start over') });
      reset.addEventListener('click', function () { fresh(); render(); });
      wrap.appendChild(reset);
      return wrap;
    }

    function heading(title, sub) {
      return h('div', { class: 'gpa__head' },
        h('h3', { class: 'gpa__title', text: title }),
        sub ? h('p', { class: 'gpa__sub', text: t(sub) }) : null);
    }

    function field(label, control, note) {
      return h('div', { class: 'gpa__field' },
        h('label', { class: 'gpa__label', 'for': control.id || null, text: t(label) }),
        control,
        note ? h('p', { class: 'gpa__hint', text: note }) : null);
    }

    /* A text box for numbers: no spinner and no minus, so a negative can never be
       typed. A comma counts as a decimal point (many people write 3,8), the number
       of decimal places is capped at opts.decimals, and the value is clamped to its
       range on blur. What the visitor typed is kept as they typed it: 3.8 stays 3.8
       and 3.80 stays 3.80. */
    function numberBox(opts) {
      var input = h('input', {
        type: 'text', inputmode: 'decimal', class: 'gpa__num ' + (opts.cls || ''),
        id: opts.id || null, 'aria-label': t(opts.label),
        placeholder: opts.placeholder || '', autocomplete: 'off',
        enterkeyhint: 'done', autocapitalize: 'off', autocorrect: 'off'
      });
      if (opts.value !== null && opts.value !== undefined) input.value = opts.value;

      var places = opts.decimals || 0;

      function read() {
        var raw = input.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
        var parts = raw.split('.');
        raw = parts[0];
        if (places > 0 && parts.length > 1) raw += '.' + parts.slice(1).join('').slice(0, places);
        if (raw !== input.value) input.value = raw;
        return raw === '' || raw === '.' ? null : parseFloat(raw);
      }

      input.addEventListener('input', function () {
        var v = read();
        opts.onInput(v === null || isNaN(v) ? null : v);
      });
      input.addEventListener('blur', function () {
        var v = read();
        if (v === null || isNaN(v)) { input.value = ''; opts.onInput(null); return; }
        var c = opts.clamp(v);
        if (c !== v) {
          input.value = String(parseFloat(c.toFixed(places)));       // out of range: show the nearest allowed value
        } else {
          input.value = input.value.replace(/\.$/, '');               // "3." -> "3", otherwise leave it as typed
        }
        opts.onInput(c);
        if (opts.after) opts.after();
      });
      return input;
    }

    /* ---------- Step 1: grades ---------- */
    function stepGrades() {
      var box = h('div', { class: 'gpa__step-body' });
      box.appendChild(heading(t('Your grades'), 'Tell us how your grades are written and where you would like to study.'));

      var sc = scale(state.scaleId);
      var sel = h('select', { class: 'gpa__select', id: 'gpa-scale', 'aria-label': t('Grading system') });
      Object.keys(G.scales).forEach(function (id) {
        var o = h('option', { value: id, text: t(G.scales[id].label) });
        if (id === state.scaleId) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () {
        state.scaleId = sel.value;
        state.known = null;          /* the old number means nothing on a new scale */
        render();
      });
      box.appendChild(field('Grading system', sel, sc.note ? t(sc.note) : null));

      box.appendChild(knownInput());

      var chips = h('div', { class: 'gpa__chips', role: 'group', 'aria-labelledby': 'gpa-dest-label' });
      G.countries.forEach(function (c) {
        var on = state.countries.indexOf(c.id) !== -1;
        var b = h('button', {
          type: 'button', class: 'gpa__chip' + (on ? ' gpa__chip--on' : ''),
          'aria-pressed': on ? 'true' : 'false', text: t(c.label)
        });
        b.addEventListener('click', function () {
          var i = state.countries.indexOf(c.id);
          if (i === -1) state.countries.push(c.id); else state.countries.splice(i, 1);
          render();
        });
        chips.appendChild(b);
      });
      box.appendChild(h('div', { class: 'gpa__field' },
        h('span', { class: 'gpa__label', id: 'gpa-dest-label', text: t('Where do you want to go?') }),
        chips,
        h('p', { class: 'gpa__hint', text: t('Choose as many as you like, or none to see everything.') })));

      var err = h('p', { class: 'gpa__error', role: 'alert', hidden: 'hidden' });
      var next = h('button', { type: 'button', class: 'btn btn--consult--dark gpa__next', text: t('Continue') + ' →' });
      next.addEventListener('click', function () {
        if (state.known === null) {
          err.textContent = t('Enter your average score to continue.');
          err.hidden = false;
          return;
        }
        err.hidden = true;
        goto(2);
      });
      box.appendChild(err);
      box.appendChild(next);
      return box;
    }

    function knownInput() {
      var sc = scale(state.scaleId);
      if (isLetterScale(state.scaleId)) {
        var sel = h('select', { class: 'gpa__select', id: 'gpa-known', 'aria-label': t('Average grade') });
        sel.appendChild(h('option', { value: '', text: t('Select your average grade') }));
        sc.letters.forEach(function (l) {
          var o = h('option', { value: String(l.points), text: l.grade });
          if (state.known === l.points) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', function () {
          state.known = sel.value === '' ? null : parseFloat(sel.value);
        });
        return field('Average grade', sel, null);
      }
      var box = numberBox({
        id: 'gpa-known', label: 'Average score', cls: 'gpa__num--wide',
        value: state.known, placeholder: sc.placeholder || String(sc.max), decimals: sc.decimals,
        clamp: function (v) { return clamp(state.scaleId, v); },
        onInput: function (v) { state.known = v; }
      });
      var hint = t('Allowed range') + ': ' + Math.max(0, sc.min) + ' – ' + sc.max;
      if (sc.decimals > 0 && sc.example) hint += ' · ' + t('Decimals are fine') + ', ' + t('e.g.') + ' ' + sc.example;
      return field('Average score', box, hint);
    }

    /* ---------- Step 2: profile ---------- */
    function stepProfile() {
      var box = h('div', { class: 'gpa__step-body' });
      box.appendChild(heading(t('About you'), 'Two more things, so the result fits your situation.'));

      var name = h('input', {
        type: 'text', class: 'gpa__text', id: 'gpa-name', maxlength: '40',
        value: state.firstName, placeholder: t('e.g. Nodira'), 'aria-label': t('First name'),
        autocomplete: 'given-name', autocapitalize: 'words', enterkeyhint: 'done'
      });
      name.addEventListener('input', function () { state.firstName = name.value; });
      box.appendChild(field('First name', name, t('Used on your result card.')));

      var lvl = h('select', { class: 'gpa__select', id: 'gpa-level', 'aria-label': t('Education level') });
      G.levels.forEach(function (l) {
        var o = h('option', { value: l.id, text: t(l.label) });
        if (l.id === state.level) o.selected = true;
        lvl.appendChild(o);
      });
      lvl.addEventListener('change', function () { state.level = lvl.value; });
      box.appendChild(field('Education level', lvl));

      var tests = h('div', { class: 'gpa__tests' });
      G.tests.forEach(function (test) {
        var on = state.tests.indexOf(test.id) !== -1;
        var line = h('div', { class: 'gpa__test' + (on ? ' gpa__test--on' : '') });
        var toggle = h('button', {
          type: 'button', class: 'gpa__test-toggle',
          'aria-pressed': on ? 'true' : 'false', text: t(test.label)
        });
        toggle.addEventListener('click', function () {
          var i = state.tests.indexOf(test.id);
          if (i !== -1) {
            state.tests.splice(i, 1);
            delete state.scores[test.id];
          } else if (test.noScore) {
            state.tests = [test.id];
            state.scores = {};
          } else {
            state.tests = state.tests.filter(function (x) { return x !== 'none'; });
            state.tests.push(test.id);
          }
          render();
        });
        line.appendChild(toggle);

        if (on && !test.noScore) {
          line.appendChild(numberBox({
            label: test.label + ' ' + t('score'), cls: 'gpa__score',
            value: state.scores[test.id], decimals: test.decimals, placeholder: String(test.max),
            clamp: function (v) { return Math.min(test.max, Math.max(test.min, v)); },
            onInput: function (v) {
              if (v === null) delete state.scores[test.id]; else state.scores[test.id] = v;
            }
          }));
          line.appendChild(h('span', { class: 'gpa__test-range', text: t(test.range) }));
        }
        tests.appendChild(line);
      });
      box.appendChild(h('div', { class: 'gpa__field' },
        h('span', { class: 'gpa__label', text: t('Language tests') }),
        tests,
        h('p', { class: 'gpa__hint', text: t('Pick every test you have taken, then enter the score.') })));

      var nav = h('div', { class: 'gpa__nav' });
      var back = h('button', { type: 'button', class: 'gpa__back', text: '← ' + t('Back') });
      back.addEventListener('click', function () { goto(1); });
      var go = h('button', { type: 'button', class: 'btn btn--consult--dark gpa__next', text: t('Get my result') + ' →' });
      go.addEventListener('click', function () { compute(); goto(3); });
      nav.appendChild(back);
      nav.appendChild(go);
      box.appendChild(nav);
      return box;
    }

    /* ---------- Compute ---------- */
    function compute() {
      var rows = [{ value: state.known, weight: null }];
      var sc = scale(state.scaleId);
      var gpa = gpaOf(state.scaleId, rows);
      var ratio = ratioOf(state.scaleId, rows);
      result = {
        gpa: gpa,
        german: germanOf(state.scaleId, rows),
        ratio: ratio,
        profile: profileOf(ratio === null ? 0 : ratio),
        scaleLabel: sc.label
      };
      /* A UK class is a degree classification, so it is only shown for
         university-level grades. */
      result.uk = (gpa !== null && G.uk.appliesTo.indexOf(state.level) !== -1) ? ukOf(gpa) : null;
    }

    /* ---------- Step 3: results ---------- */
    function stepResults() {
      var r = result;
      var box = h('div', { class: 'gpa__step-body' });
      var who = state.firstName.trim();
      box.appendChild(heading(who ? t('Your estimate') + ', ' + who : t('Your estimate'), null));

      var head = h('div', { class: 'gpa__result-head' });
      if (r.gpa !== null) {
        var gauge = h('div', { class: 'gpa__gauge' });
        gauge.appendChild(ring(r.gpa));
        var num = h('span', { class: 'gpa__gauge-num', text: '0.00' });
        gauge.appendChild(h('div', { class: 'gpa__gauge-inner' },
          num, h('span', { class: 'gpa__gauge-of', text: '/ 4.00' })));
        head.appendChild(gauge);
        countUp(num, r.gpa);
      } else {
        head.appendChild(h('div', { class: 'gpa__gauge gpa__gauge--none' },
          h('p', { class: 'gpa__gauge-note', text: t('No published 4.0 GPA conversion exists for this qualification.') })));
      }

      var stats = h('div', { class: 'gpa__stats' });
      function stat(label, value, note) {
        var b = h('div', { class: 'gpa__stat' },
          h('span', { class: 'gpa__stat-label', text: t(label) }),
          h('span', { class: 'gpa__stat-value', text: value }));
        if (note) b.appendChild(h('span', { class: 'gpa__stat-note', text: t(note) }));
        return b;
      }
      stats.appendChild(stat('German grade (estimate)',
        r.german === null ? '—' : r.german.toFixed(1),
        r.german === null ? 'Below the pass mark for this scale' : '1.0 is the best grade'));
      stats.appendChild(r.uk
        ? stat('UK class (estimate)', t(r.uk))
        : stat('UK class (estimate)', '—', 'Only applies to university-level grades'));
      stats.appendChild(stat('Profile strength', t(r.profile.label)));
      head.appendChild(stats);
      box.appendChild(head);

      box.appendChild(h('p', { class: 'gpa__estimate' },
        h('strong', { text: t('Estimate only.') }), ' ',
        t(r.scaleLabel) + '. ' +
        t('The German figure uses the modified Bavarian formula') + ': ' + G.german.formula + '. ' +
        t('Universities and credential-evaluation services apply their own rules.')));

      var actions = h('div', { class: 'gpa__actions' });
      var cta = h('button', { type: 'button', class: 'btn btn--consult--dark gpa__cta',
        text: t('Get my personal shortlist') + ' →' });
      cta.addEventListener('click', function () {
        if (window.openBooking) window.openBooking({ gpa: summaryLine(), source: 'gpa-calculator' });
      });
      var dl = h('button', { type: 'button', class: 'gpa__ghost', text: '↓ ' + t('Download result card') });
      dl.addEventListener('click', downloadCard);
      var sh = h('button', { type: 'button', class: 'gpa__ghost', text: '↗ ' + t('Share') });
      sh.addEventListener('click', shareCard);
      actions.appendChild(cta);
      actions.appendChild(dl);
      actions.appendChild(sh);
      ui.actions = actions;
      box.appendChild(actions);

      var back = h('button', { type: 'button', class: 'gpa__back', text: '← ' + t('Back') });
      back.addEventListener('click', function () { goto(2); });
      box.appendChild(back);
      return box;
    }

    function summaryLine() {
      var r = result, bits = [];
      if (r.gpa !== null) bits.push('GPA ' + r.gpa.toFixed(2) + '/4.00');
      if (r.german !== null) bits.push(t('German') + ' ' + r.german.toFixed(1));
      if (r.uk) bits.push(t(r.uk));
      bits.push(t(r.profile.label));
      bits.push(t(r.scaleLabel));
      if (state.countries.length) {
        bits.push(state.countries.map(function (id) { return t(countryById(id).label); }).join(', '));
      }
      state.tests.forEach(function (id) {
        if (id === 'none') { bits.push(t('No test yet')); return; }
        if (state.scores[id] !== undefined) bits.push(testById(id).label + ' ' + state.scores[id]);
      });
      return bits.join(' · ');
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
          '<stop offset="0%" stop-color="#916329"/><stop offset="55%" stop-color="#CC9855"/>' +
          '<stop offset="100%" stop-color="#FBD49E"/></linearGradient></defs>' +
        '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="9"/>' +
        '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="url(#gpaGold)" stroke-width="9" ' +
          'stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="' + C +
          '" stroke-dashoffset="' + C + '" class="gpa__ring-arc"/>';
      /* The arc starts empty and transitions to its value. A frame callback is
         the natural trigger, but it does not fire everywhere (headless
         rendering, background tabs), so a timer repeats the set. */
      function fill() {
        var arc = svg.querySelector('.gpa__ring-arc');
        if (!arc) return;
        if (reduceMotion) arc.style.transition = 'none';
        arc.setAttribute('stroke-dashoffset', String(C * (1 - pct)));
      }
      requestAnimationFrame(fill);
      setTimeout(fill, 60);
      return svg;
    }

    function countUp(node, to) {
      if (reduceMotion) { node.textContent = to.toFixed(2); return; }
      var start = null, dur = 750, done = false;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        node.textContent = Math.max(0, to * (1 - Math.pow(1 - p, 3))).toFixed(2);
        if (p < 1) requestAnimationFrame(step); else done = true;
      }
      requestAnimationFrame(step);
      setTimeout(function () { if (!done) node.textContent = to.toFixed(2); }, dur + 80);
    }

    /* ---------- Result card ---------- */
    function drawCard() {
      var W = 1000, H = 560;
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var x = c.getContext('2d');

      var bg = x.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#021F47'); bg.addColorStop(1, '#07336D');
      x.fillStyle = bg; x.fillRect(0, 0, W, H);

      var gold = x.createLinearGradient(60, 0, 300, 0);
      gold.addColorStop(0, '#916329'); gold.addColorStop(0.55, '#CC9855'); gold.addColorStop(1, '#FBD49E');

      x.fillStyle = '#E8BB7D';
      x.font = '600 15px Inter, Helvetica, sans-serif';
      x.fillText('STUDY HOUSE · ' + t('GPA Calculator').toUpperCase(), 60, 52);
      x.fillStyle = gold; x.fillRect(60, 68, 120, 4);

      var who = state.firstName.trim();
      x.fillStyle = '#FFFFFF';
      x.font = '700 40px Georgia, serif';
      x.fillText(who ? t('Your estimate') + ', ' + who : t('Your estimate'), 60, 132);

      var r = result;
      if (r.gpa !== null) {
        x.fillStyle = gold;
        x.font = '700 110px Georgia, serif';
        var g = r.gpa.toFixed(2);
        x.fillText(g, 60, 256);
        x.fillStyle = 'rgba(255,255,255,0.55)';
        x.font = '500 24px Inter, Helvetica, sans-serif';
        x.fillText('/ 4.00', 60 + x.measureText(g).width + 190, 256);
      } else {
        x.fillStyle = 'rgba(255,255,255,0.85)';
        x.font = '500 22px Inter, Helvetica, sans-serif';
        x.fillText(t('No published 4.0 GPA conversion exists for this qualification.'), 60, 220);
      }

      var rows = [];
      if (r.german !== null) rows.push([t('German grade (estimate)'), r.german.toFixed(1)]);
      if (r.uk) rows.push([t('UK class (estimate)'), t(r.uk)]);
      rows.push([t('Profile strength'), t(r.profile.label)]);
      rows.push([t('Grading system'), t(r.scaleLabel)]);

      var y = 330, col = 60;
      rows.forEach(function (row, i) {
        if (i === 2) { col = 540; y = 330; }
        x.fillStyle = '#E8BB7D';
        x.font = '600 12px Inter, Helvetica, sans-serif';
        x.fillText(String(row[0]).toUpperCase(), col, y);
        x.fillStyle = '#FFFFFF';
        x.font = '600 22px Inter, Helvetica, sans-serif';
        x.fillText(String(row[1]), col, y + 30);
        y += 78;
      });

      x.fillStyle = 'rgba(255,255,255,0.5)';
      x.font = '400 13px Inter, Helvetica, sans-serif';
      x.fillText(t('Estimate only.') + ' ' + t('Universities and credential-evaluation services apply their own rules.'), 60, H - 32);
      return c;
    }

    function cardFileName() {
      var n = state.firstName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return 'study-house-gpa' + (n ? '-' + n : '') + '.png';
    }

    function withBlob(fn) {
      var c = drawCard();
      if (c.toBlob) c.toBlob(fn, 'image/png');
      else fn(null);
    }

    function downloadCard() {
      withBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = h('a', { href: url, download: cardFileName() });
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      });
    }

    function shareCard() {
      var text = (state.firstName.trim() ? state.firstName.trim() + ' — ' : '') +
        summaryLine() + ' · ' + t('Estimate only.');
      withBlob(function (blob) {
        var file = blob && window.File ? new File([blob], cardFileName(), { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], text: text, title: 'Study House' }).catch(function () {});
        } else if (navigator.share) {
          navigator.share({ text: text, url: location.href }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(text + ' — ' + location.href)
            .then(function () { flash(t('Copied to clipboard')); }, downloadCard);
        } else {
          downloadCard();
        }
      });
    }

    function flash(msg) {
      if (!ui.actions) return;
      var n = h('p', { class: 'gpa__flash', role: 'status', text: msg });
      ui.actions.appendChild(n);
      setTimeout(function () { n.remove(); }, 2600);
    }

    /* ---------- Ambitious / Realistic / Safe ---------- */
    function listsSection() {
      var wrap = h('div', { class: 'gpa__lists' });
      var groups = shortlist(state, result);

      wrap.appendChild(h('h2', { class: 'gpa__lists-heading', text: t('Where this profile sits') }));
      wrap.appendChild(h('p', { class: 'gpa__lists-note', text: t(G.shortlist.note) }));

      var missing = countriesWithoutData(state);
      if (missing.length) {
        wrap.appendChild(h('p', { class: 'gpa__lists-missing' },
          t('We do not have a side-by-side university list for') + ' ' +
          missing.map(function (m) { return t(m); }).join(', ') + ' ' +
          t('yet, so nothing for it is shown below. Ask us in a consultation rather than guessing.')));
      }

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
          list.forEach(function (row) {
            var u = row.u;
            var li = h('li', {},
              h('a', { href: root + 'destinations/' + u.countryId + '/index.html', class: 'gpa__uni' },
                h('span', { class: 'gpa__uni-name', text: u.name }),
                h('span', { class: 'gpa__uni-meta',
                  text: 'QS ' + (String(u.qs).charAt(0) === '=' ? u.qs : '#' + u.qs) + ' · ' + t(u.countryLabel) })));
            if (row.note) li.appendChild(h('span', { class: 'gpa__uni-note', text: row.note }));
            ul.appendChild(li);
          });
          box.appendChild(ul);
        }
        grid.appendChild(box);
      });
      wrap.appendChild(grid);
      return wrap;
    }

    fresh();
    render();
    document.addEventListener('shlangchange', render);
  }

  /* ---------- Load, then mount ---------- */
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
        var ids = G.countries.filter(function (c) { return c.data; }).map(function (c) { return c.data; });
        return Promise.all(ids.map(function (id) {
          return json('data/' + id + '.json')
            .then(function (f) { return [id, f]; })
            .catch(function () { return [id, null]; });
        }));
      })
      .then(function (files) {
        files.forEach(function (pair) {
          var id = pair[0], f = pair[1];
          if (!f) return;
          LOADED[id] = true;
          f.universities.forEach(function (u) {
            UNIS.push(Object.assign({}, u, { countryId: id, countryLabel: LABELS[id] || id }));
          });
        });
        mounts.forEach(function (el) { Calculator(el); });
        renderSources();
      })
      .catch(fail);
  }

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
