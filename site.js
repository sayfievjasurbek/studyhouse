/* ============================================
   STUDY HOUSE — shared page furniture

   The navbar, the mobile menu and the footer are defined once here and injected
   into every page, so one edit updates the whole site. A page opts in with two
   things and nothing else:

     <html lang="en" data-root="../../">      <- how to get back to the site root
     ...
     <div data-site-header></div>             <- optional: where the navbar goes
     <div data-site-footer></div>             <- optional: where the footer goes
     <script src="../../site.js"></script>

   If the placeholder <div>s are missing the header is put first in <body> and
   the footer last, which is what almost every page wants.

   Load order at the end of <body>: site.js, script.js, booking.js, i18n.js.
   i18n.js must come last — it reads the finished markup.
   ============================================ */

(function () {
  'use strict';

  /* ---------- CONFIG: contact details ----------
     Fill these in and they appear in the footer. A detail left empty is not
     shown at all — the site never displays a made-up phone number or address.
     Telegram is a username without the @; address is free text. */
  var CONTACT = {
    phone: '',        // e.g. '+998 90 123 45 67'
    telegram: '',     // e.g. 'studyhouse_uz'
    email: '',        // e.g. 'hello@studyhouse.uz'
    address: ''       // e.g. 'Amir Temur 1, Tashkent'
  };

  /* ---------- CONFIG: social profiles ----------
     Same rule: an empty URL hides that icon. */
  var SOCIAL = {
    instagram: '',
    telegram: '',
    linkedin: '',
    youtube: ''
  };

  /* ---------- The menu, in one place ---------- */
  var NAV = [
    { label: 'Home',           href: 'index.html',                key: 'home' },
    { label: 'Destinations',   href: 'destinations/index.html',   key: 'destinations' },
    { label: 'Services',       href: 'services/index.html',       key: 'services' },
    { label: 'Our Expertise',  href: 'expertise/index.html',      key: 'expertise' },
    { label: 'GPA Calculator', href: 'gpa-calculator/index.html', key: 'gpa' },
    { label: 'Contact',        href: '#contact',                  key: 'contact' }
  ];

  /* Not in the header any more — universities are reached from the homepage
     section and the Universities card on the Services page — but the footer
     still links to it. */
  var UNIVERSITIES = { label: 'Universities', href: 'index.html#universities-section', key: 'universities' };

  /* Footer link columns, built from the same list so they can never drift apart */
  var FOOTER_COLS = [
    { title: 'Explore',     keys: ['home', 'universities', 'destinations', 'services'] },
    { title: 'Study House', keys: ['expertise', 'gpa', 'contact'] }
  ];

  var SOCIAL_ICONS = {
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>',
    telegram: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    linkedin: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    youtube: '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" stroke="currentColor" stroke-width="1.5"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="currentColor"/>'
  };
  var SOCIAL_NAMES = { instagram: 'Instagram', telegram: 'Telegram', linkedin: 'LinkedIn', youtube: 'YouTube' };

  /* ---------- Paths ---------- */
  var root = document.documentElement.getAttribute('data-root') || '';
  /* Which menu item is the current page. Set with <html data-page="services">. */
  var current = document.documentElement.getAttribute('data-page') || '';

  function url(href) {
    return href.charAt(0) === '#' ? href : root + href;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function item(key) {
    for (var i = 0; i < NAV.length; i++) if (NAV[i].key === key) return NAV[i];
    return key === UNIVERSITIES.key ? UNIVERSITIES : null;
  }

  /* ---------- Header ---------- */
  function headerHTML() {
    var links = NAV.map(function (n) {
      var active = n.key === current ? ' navbar__link--active' : '';
      var aria = n.key === current ? ' aria-current="page"' : '';
      return '<li><a href="' + esc(url(n.href)) + '" class="navbar__link' + active + '"' + aria + '>' + esc(n.label) + '</a></li>';
    }).join('');

    var mobile = NAV.map(function (n) {
      return '<a href="' + esc(url(n.href)) + '" class="mobile-nav__link" data-nav-close>' + esc(n.label) + '</a>';
    }).join('');

    return '' +
      '<nav class="navbar" id="navbar">' +
        '<div class="container navbar__inner">' +
          '<a href="' + esc(url('index.html')) + '" class="navbar__logo" id="nav-logo" aria-label="Study House - International Education Agency">' +
            '<img src="' + esc(root) + 'images/logo-mark.webp" alt="Study House Emblem" class="navbar__logo-mark-img" width="256" height="246">' +
            '<img src="' + esc(root) + 'images/logo-text.webp" alt="Study House — International Education Agency" class="navbar__logo-text-img" width="600" height="80">' +
          '</a>' +
          '<ul class="navbar__links" id="nav-links">' + links + '</ul>' +
          '<div class="navbar__cta">' +
            '<a href="#book-a-consultation" data-booking class="btn btn--consult" id="nav-cta">Book a Consultation →</a>' +
          '</div>' +
          '<button class="navbar__hamburger" id="hamburger-btn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</nav>' +
      '<div class="mobile-nav" id="mobile-nav">' + mobile +
        '<a href="#book-a-consultation" data-booking class="btn btn--consult" data-nav-close>Book a Consultation →</a>' +
      '</div>';
  }

  /* ---------- Footer ---------- */
  function contactHTML() {
    var rows = [];
    if (CONTACT.phone) {
      rows.push(['Phone', '<a href="tel:' + esc(CONTACT.phone.replace(/[^\d+]/g, '')) + '">' + esc(CONTACT.phone) + '</a>']);
    }
    if (CONTACT.telegram) {
      var tg = CONTACT.telegram.replace(/^@/, '');
      rows.push(['Telegram', '<a href="https://t.me/' + esc(tg) + '" target="_blank" rel="noopener noreferrer">@' + esc(tg) + '</a>']);
    }
    if (CONTACT.email) {
      rows.push(['Email', '<a href="mailto:' + esc(CONTACT.email) + '">' + esc(CONTACT.email) + '</a>']);
    }
    if (CONTACT.address) {
      rows.push(['Address', '<span>' + esc(CONTACT.address) + '</span>']);
    }

    if (!rows.length) {
      /* Nothing is invented: until the owner fills in CONTACT above, the column
         offers the booking form instead of a placeholder phone number. */
      return '<p class="footer__contact-empty">The fastest way to reach us is the booking form — we reply within 24 hours.</p>' +
             '<a href="#book-a-consultation" data-booking class="btn btn--consult--dark footer__contact-btn">Book a Consultation →</a>';
    }

    return '<ul class="footer__contact-list">' + rows.map(function (r) {
      return '<li><span class="footer__contact-label">' + esc(r[0]) + '</span>' + r[1] + '</li>';
    }).join('') + '</ul>';
  }

  function socialHTML() {
    var icons = Object.keys(SOCIAL_ICONS).filter(function (k) { return SOCIAL[k]; }).map(function (k) {
      return '<a class="footer__social-icon" href="' + esc(SOCIAL[k]) + '" target="_blank" rel="noopener noreferrer" aria-label="' + SOCIAL_NAMES[k] + '">' +
        '<svg viewBox="0 0 24 24" fill="none">' + SOCIAL_ICONS[k] + '</svg></a>';
    }).join('');
    return icons ? '<div class="footer__social">' + icons + '</div>' : '';
  }

  function colHTML(col) {
    var links = col.keys.map(function (k) {
      var n = item(k);
      return '<li><a href="' + esc(url(n.href)) + '" class="footer__link">' + esc(n.label) + '</a></li>';
    }).join('');
    return '<nav class="footer__col" aria-label="' + esc(col.title) + '">' +
      '<h2 class="footer__col-title">' + esc(col.title) + '</h2>' +
      '<ul class="footer__col-list">' + links + '</ul></nav>';
  }

  function footerHTML() {
    /* The ownership note belongs on the Services pages only. */
    var onServices = /\/services\//.test(location.pathname) || current === 'services';
    var note = onServices
      ? '<p class="footer__note">Programme names and logos belong to their owners; Study House is an independent consultancy.</p>'
      : '';

    return '' +
      '<footer class="footer" id="site-footer">' +
        '<div class="container">' +
          '<div class="footer__grid">' +
            '<div class="footer__brand">' +
              '<a href="' + esc(url('index.html')) + '" class="footer__logo" aria-label="Study House - International Education Agency">' +
                '<img src="' + esc(root) + 'images/logo-mark.webp" alt="Study House Emblem" class="footer__logo-mark-img" loading="lazy" decoding="async" width="256" height="246">' +
              '</a>' +
              '<p class="footer__tagline">Your Global Education Partner</p>' +
              '<p class="footer__blurb">Study House is an independent education consultancy. We prepare your application; we do not decide admissions or visas.</p>' +
              socialHTML() +
            '</div>' +
            FOOTER_COLS.map(colHTML).join('') +
            '<div class="footer__col footer__contact" id="contact">' +
              '<h2 class="footer__col-title">Contact</h2>' +
              contactHTML() +
            '</div>' +
          '</div>' +
          '<div class="footer__bottom">' +
            '<p class="footer__copyright">© <span id="sh-year">' + new Date().getFullYear() + '</span> Study House. All rights reserved.</p>' +
            note +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- Inject ---------- */
  function mount(slotAttr, html, where) {
    var slot = document.querySelector('[' + slotAttr + ']');
    if (slot) { slot.outerHTML = html; return; }
    document.body.insertAdjacentHTML(where, html);
  }

  mount('data-site-header', headerHTML(), 'afterbegin');
  mount('data-site-footer', footerHTML(), 'beforeend');
})();
