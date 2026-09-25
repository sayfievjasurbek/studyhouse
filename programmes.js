/* ============================================
   STUDY HOUSE — Services page behaviour

   1. The filter buttons above the programme grid (instant, no reload).
   2. The programme logo badges. The owner supplies each logo as
      images/programmes/logos/<slug>.png, downloaded unmodified from the
      programme's own official site. Until a file exists the badge shows the
      programme name in type — never an invented or redrawn mark.
   ============================================ */

(function () {
  'use strict';

  /* ---------- Logo badges ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-logo-fallback]'), function (img) {
    img.addEventListener('error', function () {
      var span = document.createElement('span');
      span.className = 'prog-badge__text';
      span.textContent = img.getAttribute('data-logo-fallback');
      img.parentNode.replaceChild(span, img);
    });
    /* A cached error can fire before this listener is attached. */
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });

  /* ---------- Filters ---------- */
  var grid = document.getElementById('prog-grid');
  if (!grid) return;

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.prog-filter'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.prog-card'));
  var count = document.querySelector('.prog-count');

  function t(en) { return window.shI18n ? window.shI18n.t(en) : en; }

  function apply(key) {
    var shown = 0;
    cards.forEach(function (c) {
      var tags = (c.getAttribute('data-tags') || '').split(' ');
      var on = key === 'all' || tags.indexOf(key) !== -1;
      c.hidden = !on;
      if (on) shown++;
    });
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-filter') === key;
      b.classList.toggle('pill--active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (count) {
      count.textContent = shown + ' ' + t(shown === 1 ? 'programme' : 'programmes');
    }
    grid.setAttribute('data-filter', key);
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
  });

  apply('all');
  document.addEventListener('shlangchange', function () {
    apply(grid.getAttribute('data-filter') || 'all');
  });
})();
