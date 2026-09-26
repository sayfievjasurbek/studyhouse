/* ============================================
   STUDY HOUSE — university logo carousel

   To change the strip, edit LOGOS below and nothing else. Add a logo only from
   the university's own official site or brand page, unmodified, and put the
   file in /images as logo-<name>.webp. `w` and `h` are the file's pixel size;
   they let the browser lay the strip out before the images arrive.

   The heading on the page is "Top Universities we help you apply to". Do not
   change it to "partners" or "recently admitted" — neither is verified.

   How it moves: the strip is a normal horizontally scrolling box that this
   script nudges along slowly. That is what makes it work by touch: a finger
   swipe scrolls it natively (with momentum), and the automatic drift stops while
   a finger, the mouse pointer or keyboard focus is on it, and comes back a few
   seconds after the touch ends. The logo list is repeated so the strip never
   runs out, and the position wraps invisibly.
   ============================================ */

(function () {
  'use strict';

  /* `scale` (optional, default 1) sizes a logo up or down. A round emblem or a
     stacked logo needs more room than a wide wordmark to stay legible. */
  var LOGOS = [
    { name: 'University of Cambridge',        file: 'logo-cambridge.webp',  w: 400, h: 93 },
    { name: 'University of Pittsburgh',       file: 'logo-pittsburgh.webp', w: 351, h: 112 },
    { name: 'Technical University of Munich', file: 'logo-tum.webp',        w: 300, h: 167 },
    { name: 'The University of Melbourne',    file: 'logo-melbourne.webp',  w: 464, h: 112 },
    { name: 'The University of Edinburgh',    file: 'logo-edinburgh.webp',  w: 400, h: 105 },
    { name: 'Humboldt-Universität zu Berlin', file: 'logo-humboldt.webp',   w: 144, h: 144, scale: 1.3 },
    { name: 'The University of Sydney',       file: 'logo-sydney.webp',     w: 400, h: 138 },
    { name: 'Universitat de Barcelona',       file: 'logo-barcelona.webp',  w: 412, h: 112 },
    { name: 'Tampere University',             file: 'logo-tampere.webp',    w: 400, h: 106 },
    { name: 'Universiteit van Amsterdam',     file: 'logo-amsterdam.webp',  w: 457, h: 128, scale: 1.15 }
  ];

  var SECONDS_PER_LOGO = 1.8;      // the pace the strip has always had
  var RESUME_AFTER_TOUCH_MS = 2800;

  var scroller = document.getElementById('uni-carousel');
  var track = document.getElementById('uni-carousel-track');
  if (!scroller || !track || !LOGOS.length) return;

  var root = document.documentElement.getAttribute('data-root') || '';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reduced motion: one static copy of the list, no drifting. It can still be swiped. */
  var copies = reduceMotion ? 1 : 4;
  var perCopy = LOGOS.length;

  var html = '';
  for (var c = 0; c < copies; c++) {
    LOGOS.forEach(function (logo) {
      var hidden = c > 0 ? ' aria-hidden="true"' : '';
      /* --ar lets the CSS size the slot before the image loads (see styles.css) */
      var size = ' style="--ar:' + (logo.w / logo.h).toFixed(4) + (logo.scale ? ';--logo-scale:' + logo.scale : '') + '"';
      html += '<div class="uni-logo-card" role="listitem"' + hidden + '>' +
        '<img src="' + root + 'images/' + logo.file + '" alt="' + logo.name + ' logo" ' +
        'class="uni-logo-card__img" width="' + logo.w + '" height="' + logo.h + '"' + size +
        ' loading="lazy" decoding="async" draggable="false"></div>';
    });
  }
  track.innerHTML = html;

  /* The strip is a scrollable region, so keyboard users can reach and scroll it. */
  scroller.setAttribute('tabindex', '0');
  scroller.setAttribute('role', 'region');
  if (!scroller.getAttribute('aria-label')) scroller.setAttribute('aria-label', 'University logos');

  if (window.shI18n) window.shI18n.refresh(track);
  if (reduceMotion || copies < 2) return;

  /* ---------- the drift ---------- */
  var loop = 0;          // distance from one logo to the same logo in the next copy
  var speed = 0;         // pixels per second
  var pos = 0;
  var paused = false;
  var holdUntil = 0;
  var last = 0;

  function measure() {
    var a = track.children[0], b = track.children[perCopy];
    if (!a || !b) return;
    var before = loop;
    loop = b.offsetLeft - a.offsetLeft;
    speed = loop / (perCopy * SECONDS_PER_LOGO);
    /* keep the position inside the second copy so there is always room to swipe
       both ways; on first measurement start there */
    if (!before || scroller.scrollLeft < loop) { pos = loop; scroller.scrollLeft = pos; }
  }

  /* Keep the position inside [loop, 2*loop). The copies are identical, so
     jumping by one loop is invisible — including in the middle of a swipe. */
  function wrap() {
    if (!loop) return;
    var x = scroller.scrollLeft;
    if (x >= loop * 2) { scroller.scrollLeft = x - loop; }
    else if (x < loop) { scroller.scrollLeft = x + loop; }
  }
  scroller.addEventListener('scroll', wrap, { passive: true });

  function tick(ts) {
    var dt = last ? Math.min((ts - last) / 1000, 0.1) : 0;
    last = ts;
    if (loop) {
      if (paused || ts < holdUntil) {
        pos = scroller.scrollLeft;                       // follow the finger / momentum
      } else {
        pos += speed * dt;
        if (pos >= loop * 2) pos -= loop;
        scroller.scrollLeft = pos;
      }
    }
    requestAnimationFrame(tick);
  }

  function hold() { holdUntil = performance.now() + RESUME_AFTER_TOUCH_MS; }

  /* Mouse: pause while the pointer is over it */
  scroller.addEventListener('mouseenter', function () { paused = true; });
  scroller.addEventListener('mouseleave', function () { paused = false; });
  /* Touch: pause on contact, resume a moment after the last touch and its momentum */
  scroller.addEventListener('touchstart', function () { paused = true; }, { passive: true });
  scroller.addEventListener('touchend', function () { paused = false; hold(); }, { passive: true });
  scroller.addEventListener('touchcancel', function () { paused = false; hold(); }, { passive: true });
  /* A trackpad or mouse-wheel scroll counts too */
  scroller.addEventListener('wheel', hold, { passive: true });
  /* Keyboard focus */
  scroller.addEventListener('focusin', function () { paused = true; });
  scroller.addEventListener('focusout', function () { paused = false; hold(); });
  scroller.addEventListener('keydown', hold);

  /* Do no work while the tab is hidden */
  document.addEventListener('visibilitychange', function () { last = 0; });

  /* The layout changes with the window (logo sizes are per breakpoint) */
  window.addEventListener('resize', function () {
    var x = scroller.scrollLeft, l = loop;
    measure();
    if (l && loop) { pos = (x / l) * loop; scroller.scrollLeft = pos; }
  });
  window.addEventListener('load', measure);
  measure();
  requestAnimationFrame(tick);
})();
