/* ============================================
   STUDY HOUSE — Booking modal (shared by every page)

   Any element with a `data-booking` attribute opens the form:
     <a href="#booking" class="btn" data-booking>Book a Consultation →</a>
   Optional: data-booking-country="usa" pre-selects a country.

   The form POSTs JSON to BOOKING_ENDPOINT, a Google Apps Script web app that
   passes the request on to Telegram. The bot token and chat ID live in that
   script, never here: this file is public, so the only thing in it is the URL.
   ============================================ */

(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxwfk2gXRZ9UcPZW8bIIE6kTWT_hJ4KpImEFkD_F1BhHU42nywh1Jit7tEMEM-V-xBkzw/exec';
  var REQUEST_TIMEOUT_MS = 15000;

  var scriptSrc = document.currentScript ? document.currentScript.src : location.href;
  var MASCOT_BASE = new URL('images/mascot/', scriptSrc).href;
  var LOGO_URL = new URL('images/logo-mark.webp', scriptSrc).href;

  /* Mascot poses (files in /images/mascot/). A pose whose file has not been added yet
     shows the wave pose instead, and a missing wave pose falls back to the Study House
     emblem. AVAILABLE lists the pose files that exist: when you add one (say
     mascot-happy.png), add its name here too, and it is used from then on. Keeping the
     list stops the browser from asking for files that are not there, which would log 404s. */
  var AVAILABLE = ['wave'];
  var POSES = {
    wave:    { file: 'mascot-wave.png',    say: "Hi! Let's plan your studies abroad." },
    curious: { file: 'mascot-curious.png', say: 'Nice to meet you! What is your name?' },
    phone:   { file: 'mascot-phone.png',   say: 'How can we reach you?' },
    globe:   { file: 'mascot-globe.png',   say: 'Where would you like to study?' },
    happy:   { file: 'mascot-happy.png',   say: 'Yay! We got your request.' },
    worried: { file: 'mascot-worried.png', say: "Oops, let's fix that together." }
  };

  /* One list of everything a visitor can be interested in. `kind` decides
     whether the submitted request carries a country or a programme. */
  var INTERESTS = [
    { group: 'Countries', kind: 'country', items: [
      ['germany', 'Germany'], ['italy', 'Italy'], ['latvia', 'Latvia'], ['france', 'France'],
      ['spain', 'Spain'], ['finland', 'Finland'], ['united-kingdom', 'United Kingdom'],
      ['australia', 'Australia'], ['usa', 'USA'], ['china', 'China']
    ] },
    { group: 'Programmes', kind: 'programme', items: [
      ['uwc', 'UWC'], ['work-and-travel', 'Work and Travel in Germany'], ['flex', 'FLEX'],
      ['erasmus-plus', 'Erasmus+'], ['chevening', 'Chevening']
    ] },
    { group: '', kind: 'other', items: [['other', 'Other / not sure yet']] }
  ];

  /* Flat lookup: value -> { label, kind } */
  var INTEREST_BY_VALUE = {};
  INTERESTS.forEach(function (g) {
    g.items.forEach(function (it) { INTEREST_BY_VALUE[it[0]] = { label: it[1], kind: g.kind }; });
  });

  var MESSAGES = {
    first: 'Please enter your first name.',
    surname: 'Please enter your surname.',
    phone: 'Enter a valid Uzbek mobile number: +998 followed by 9 digits.',
    telegram: 'Telegram username must be 5–32 characters: letters, numbers and underscores, starting with a letter.',
    country: 'Please choose a country or programme.',
    consent: 'Please tick the box to agree.',
    fixFields: 'Please check the highlighted fields.',
    failed: 'Sorry, we could not send your request. Please try again in a moment.'
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i18n = function () { return window.shI18n; };
  function setText(el, en) { if (i18n()) i18n().setText(el, en); else el.textContent = en; }

  /* ---------- Markup ---------- */
  function field(id, name, label, inner, extra) {
    return '<div class="field" data-field="' + name + '">' +
      '<label for="bk-' + id + '">' + label + '</label>' + inner +
      '<p class="field__error" id="bk-' + id + '-err" hidden></p>' + (extra || '') + '</div>';
  }

  function buildModal() {
    var options = '<option value="">Select a country or programme</option>' + INTERESTS.map(function (g) {
      var opts = g.items.map(function (c) {
        return '<option value="' + c[0] + '">' + c[1] + '</option>';
      }).join('');
      return g.group ? '<optgroup label="' + g.group + '">' + opts + '</optgroup>' : opts;
    }).join('');

    var el = document.createElement('div');
    el.className = 'booking';
    el.id = 'booking';
    el.hidden = true;
    el.innerHTML =
      '<div class="booking__panel" role="dialog" aria-modal="true" aria-labelledby="bk-title" aria-describedby="bk-intro" tabindex="-1">' +
        '<button type="button" class="booking__close" data-booking-close aria-label="Close">&times;</button>' +
        '<div class="booking__mascot" aria-hidden="true">' +
          '<div class="booking__stage"><img class="booking__mascot-img" alt="" width="452" height="545"></div>' +
          '<p class="booking__bubble" id="bk-bubble"></p>' +
        '</div>' +
        '<div class="booking__main">' +
          '<div id="bk-formwrap">' +
            '<h2 class="booking__title" id="bk-title">Book a Consultation</h2>' +
            '<p class="booking__intro" id="bk-intro">Leave your details and we will reply within 24 hours.</p>' +
            '<form id="bk-form" novalidate>' +
              '<div class="booking__row">' +
                field('first', 'first', 'First name', '<input id="bk-first" name="firstName" type="text" autocomplete="given-name" autocapitalize="words" enterkeyhint="next" required aria-describedby="bk-first-err">') +
                field('surname', 'surname', 'Surname', '<input id="bk-surname" name="surname" type="text" autocomplete="family-name" autocapitalize="words" enterkeyhint="next" required aria-describedby="bk-surname-err">') +
              '</div>' +
              field('phone', 'phone', 'Mobile phone', '<input id="bk-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" placeholder="+998 90 123 45 67" required aria-describedby="bk-phone-err">') +
              field('telegram', 'telegram', 'Telegram username (optional)', '<input id="bk-telegram" name="telegram" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next" placeholder="@username" aria-describedby="bk-telegram-err">') +
              field('country', 'country', 'Country or programme of interest', '<select id="bk-country" name="country" required aria-describedby="bk-country-err">' + options + '</select>') +
              '<p class="booking__prefill" id="bk-prefill" hidden></p>' +
              '<div class="booking__hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
              '<div class="field field--check" data-field="consent">' +
                '<label class="check"><input id="bk-consent" name="consent" type="checkbox" required aria-describedby="bk-consent-err">' +
                '<span>I agree that Study House may contact me using these details about my consultation request.</span></label>' +
                '<p class="field__error" id="bk-consent-err" hidden></p>' +
              '</div>' +
              '<p class="booking__privacy">Your details are sent to the Study House team only so we can reply to your request.</p>' +
              '<p class="booking__status" id="bk-status" role="alert" hidden></p>' +
              '<button type="submit" class="btn btn--consult booking__submit" id="bk-submit">Send request</button>' +
            '</form>' +
          '</div>' +
          '<div class="booking__success" id="bk-success" tabindex="-1" hidden>' +
            '<h2 class="booking__title">Thank you! We will contact you shortly</h2>' +
            '<button type="button" class="btn btn--outline" data-booking-close>Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    if (i18n()) i18n().refresh(el);
    return el;
  }

  var modal = buildModal();
  var panel = modal.querySelector('.booking__panel');
  var form = modal.querySelector('#bk-form');
  var formWrap = modal.querySelector('#bk-formwrap');
  var success = modal.querySelector('#bk-success');
  var statusEl = modal.querySelector('#bk-status');
  var submitBtn = modal.querySelector('#bk-submit');
  var img = modal.querySelector('.booking__mascot-img');
  var bubble = modal.querySelector('#bk-bubble');
  var prefillNote = modal.querySelector('#bk-prefill');
  var el = {
    first: form.elements.firstName, surname: form.elements.surname, phone: form.elements.phone,
    telegram: form.elements.telegram, country: form.elements.country, consent: form.elements.consent
  };

  /* ---------- Mascot ---------- */
  var pose = null;
  var fadeTimer = null;
  var fallbackStep = 0;

  function poseUrl(name) { return MASCOT_BASE + POSES[AVAILABLE.indexOf(name) >= 0 ? name : 'wave'].file; }

  function loadPose(name) {
    fallbackStep = 0;
    modal.querySelector('.booking__mascot').classList.remove('booking__mascot--emblem');
    img.src = poseUrl(name);
  }

  img.addEventListener('error', function () {
    fallbackStep += 1;
    if (fallbackStep === 1 && pose !== 'wave') {
      img.src = poseUrl('wave');
    } else {
      modal.querySelector('.booking__mascot').classList.add('booking__mascot--emblem');
      img.src = LOGO_URL;
    }
  });

  function setPose(name, instant) {
    if (name === pose) return;
    pose = name;
    setText(bubble, POSES[name].say);
    clearTimeout(fadeTimer);
    if (instant || reduceMotion) { loadPose(name); img.classList.remove('is-fading'); return; }
    img.classList.add('is-fading');
    fadeTimer = setTimeout(function () {
      loadPose(name);
      img.classList.remove('is-fading');
    }, 150);
  }

  function preloadPoses() {
    AVAILABLE.forEach(function (k) { var i = new Image(); i.src = poseUrl(k); });
  }

  form.addEventListener('focusin', function (e) {
    var id = e.target.id;
    if (id === 'bk-first' || id === 'bk-surname') setPose('curious');
    else if (id === 'bk-phone' || id === 'bk-telegram') setPose('phone');
    else if (id === 'bk-country') setPose('globe');
  });

  /* ---------- Validation ---------- */
  var NAME_RE = /^[\p{L}][\p{L}\p{M}'ʻʼ’\- ]+$/u;
  var TG_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

  function phoneDigits(value) {
    var digits;
    if (value.indexOf('+998') === 0) digits = value.slice(4).replace(/\D/g, '');
    else {
      digits = value.replace(/\D/g, '');
      if (digits.length > 9 && digits.indexOf('998') === 0) digits = digits.slice(3);
    }
    return digits.slice(0, 9);
  }

  function formatPhone(digits) {
    var g = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
    return '+998' + (g.length ? ' ' + g.join(' ') : ' ');
  }

  var validators = {
    first: function () { var v = el.first.value.trim(); return v.length >= 2 && NAME_RE.test(v) ? '' : MESSAGES.first; },
    surname: function () { var v = el.surname.value.trim(); return v.length >= 2 && NAME_RE.test(v) ? '' : MESSAGES.surname; },
    phone: function () { return phoneDigits(el.phone.value).length === 9 ? '' : MESSAGES.phone; },
    telegram: function () {
      var v = el.telegram.value.trim().replace(/^@/, '');
      return v === '' || TG_RE.test(v) ? '' : MESSAGES.telegram;
    },
    country: function () { return el.country.value ? '' : MESSAGES.country; },
    consent: function () { return el.consent.checked ? '' : MESSAGES.consent; }
  };
  var ORDER = ['first', 'surname', 'phone', 'telegram', 'country', 'consent'];

  function showError(name, message) {
    var input = el[name];
    var err = modal.querySelector('#bk-' + name + '-err');
    if (message) {
      setText(err, message);
      err.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      err.hidden = true;
      input.removeAttribute('aria-invalid');
    }
    input.closest('.field').classList.toggle('field--invalid', !!message);
  }

  function validate(name) { var m = validators[name](); showError(name, m); return !m; }

  ORDER.forEach(function (name) {
    var input = el[name];
    input.addEventListener('blur', function () {
      if (name === 'telegram' && input.value.trim()) {
        var v = input.value.trim().replace(/^@/, '');
        input.value = '@' + v;
      }
      if (name === 'phone' && phoneDigits(input.value).length === 0) input.value = '';
      if (input.dataset.touched) validate(name);   // only nag about fields the visitor has actually used
    });
    input.addEventListener('input', function () {
      input.dataset.touched = '1';
      if (input.closest('.field').classList.contains('field--invalid')) validate(name);
    });
    input.addEventListener('change', function () {
      input.dataset.touched = '1';
      if (input.closest('.field').classList.contains('field--invalid')) validate(name);
    });
  });

  el.phone.addEventListener('focus', function () { if (!el.phone.value) el.phone.value = '+998 '; });
  el.phone.addEventListener('input', function () {
    var digits = phoneDigits(el.phone.value);
    el.phone.value = digits ? formatPhone(digits) : '+998 ';
  });

  /* ---------- Open / close ---------- */
  var lastTrigger = null;
  var inertSaved = [];
  var isOpen = false;

  function setBackgroundInert(on) {
    if (on) {
      Array.prototype.forEach.call(document.body.children, function (n) {
        if (n === modal || n.tagName === 'SCRIPT') return;
        inertSaved.push([n, n.inert]);
        n.inert = true;
      });
    } else {
      inertSaved.forEach(function (p) { p[0].inert = p[1]; });
      inertSaved = [];
    }
  }

  /* Extra context sent with the request but not typed by the visitor:
     { gpa: '3.4 / 4.0 (university scale)', source: 'gpa-calculator' } */
  var context = {};

  function clearFields() {
    form.reset();
    ORDER.forEach(function (name) { showError(name, ''); delete el[name].dataset.touched; });
    context = {};
    prefillNote.hidden = true;
    statusEl.hidden = true;
  }

  function resetForm() {
    clearFields();
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
    setText(submitBtn, 'Send request');
    formWrap.hidden = false;
    success.hidden = true;
  }

  /* open() takes either the element that was clicked or an options object:
       openBooking({ country: 'usa' })
       openBooking({ programme: 'chevening' })
       openBooking({ gpa: '3.4 / 4.0 (university scale)', source: 'gpa-calculator' })
     Both forms end up here. */
  function open(arg) {
    if (isOpen) return;
    isOpen = true;

    var opts = {};
    var trigger = null;
    if (arg && arg.nodeType === 1) {
      trigger = arg;
      opts.country = trigger.getAttribute('data-booking-country') || '';
      opts.programme = trigger.getAttribute('data-booking-programme') || '';
      opts.gpa = trigger.getAttribute('data-booking-gpa') || '';
      opts.source = trigger.getAttribute('data-booking-source') || '';
    } else if (arg && typeof arg === 'object') {
      opts = arg;
    }

    lastTrigger = trigger || document.activeElement;
    resetForm();

    var choice = opts.programme || opts.country || opts.interest || '';
    if (choice && INTEREST_BY_VALUE[choice]) el.country.value = choice;

    if (opts.gpa) context.gpa = String(opts.gpa);
    if (opts.source) context.source = String(opts.source);
    if (context.gpa) {
      prefillNote.textContent = '';
      var lead = document.createElement('span');
      prefillNote.appendChild(lead);
      setText(lead, 'We will send your GPA estimate with this request:');
      prefillNote.appendChild(document.createTextNode(' ' + context.gpa));
      prefillNote.hidden = false;
    }

    pose = null;
    setPose('wave', true);
    preloadPoses();

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    requestAnimationFrame(function () {
      modal.classList.add('booking--open');
      el.first.focus({ preventScroll: true });
    });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove('booking--open');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    setTimeout(function () { if (!isOpen) modal.hidden = true; }, reduceMotion ? 0 : 200);
    returnFocus();
  }

  /* Give focus back to the button that opened the form. If that button is no longer
     visible (e.g. a link inside the mobile menu, which closes on click), use the
     hamburger button so keyboard users are not dropped at the top of the page. */
  function returnFocus() {
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
    if (document.activeElement === lastTrigger) return;
    var burger = document.getElementById('hamburger-btn');
    if (burger && burger.offsetParent !== null) burger.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-booking]');
    if (trigger) { e.preventDefault(); open(trigger); return; }
    if (e.target.closest && e.target.closest('[data-booking-close]')) close();
  });

  var pressedOnOverlay = false;
  modal.addEventListener('mousedown', function (e) { pressedOnOverlay = e.target === modal; });
  modal.addEventListener('click', function (e) { if (e.target === modal && pressedOnOverlay) close(); });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var focusable = Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; }
    );
    if (!focusable.length) { e.preventDefault(); panel.focus(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Submit ---------- */
  function setStatus(message) {
    if (!message) { statusEl.hidden = true; return; }
    setText(statusEl, message);
    statusEl.hidden = false;
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    setText(submitBtn, on ? 'Sending…' : 'Send request');
  }

  function showSuccess() {
    clearFields();                 // the request is sent: start the next visit with an empty form
    setLoading(false);
    setPose('happy');
    formWrap.hidden = true;
    success.hidden = false;
    success.focus();
  }

  function showFailure() {
    setPose('worried');
    setLoading(false);
    setStatus(MESSAGES.failed);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('');
    var firstInvalid = null;
    ORDER.forEach(function (name) { if (!validate(name) && !firstInvalid) firstInvalid = name; });
    if (firstInvalid) {
      setPose('worried');
      setStatus(MESSAGES.fixFields);
      el[firstInvalid].focus();
      return;
    }

    var payload = {
      firstName: el.first.value.trim(),
      surname: el.surname.value.trim(),
      phone: '+998' + phoneDigits(el.phone.value),
      telegram: el.telegram.value.trim() ? '@' + el.telegram.value.trim().replace(/^@/, '') : '',
      interest: INTEREST_BY_VALUE[el.country.value].label,        // English label, not the translated one
      website: form.elements.website.value,                       // honeypot: always empty for a person, the server drops the request if it is not
      interestType: INTEREST_BY_VALUE[el.country.value].kind,     // 'country' | 'programme' | 'other'
      consent: true,
      language: i18n() ? i18n().lang() : document.documentElement.lang,
      page: location.pathname,
      submittedAt: new Date().toISOString()
    };
    if (context.gpa) payload.gpa = context.gpa;
    if (context.source) payload.source = context.source;

    setLoading(true);
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS) : null;

    /* text/plain on purpose: it is a "simple" request, so the browser sends no CORS
       preflight, which Apps Script cannot answer. The script still reads the body as JSON. */
    fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (result) {
      if (!result || result.ok !== true) throw new Error('Server said: ' + JSON.stringify(result));
      showSuccess();
    }).catch(function (err) {
      console.error('[booking] submit failed:', err);
      showFailure();
    }).then(function () { if (timer) clearTimeout(timer); });
  });

  /* Public API. openBooking({...}) is the documented way for other scripts
     (the GPA calculator, the programme pages) to open a prefilled form. */
  window.openBooking = open;
  window.shBooking = { open: open, close: close, poses: POSES };
})();
