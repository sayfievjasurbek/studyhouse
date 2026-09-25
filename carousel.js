/* ============================================
   STUDY HOUSE — university logo carousel

   To change the strip, edit LOGOS below and nothing else. Add a logo only from
   the university's own official site or brand page, unmodified, and put the
   file in /images as logo-<name>.webp.

   The heading on the page is "Universities we help you apply to". Do not
   change it to "partners" or "recently admitted" — neither is verified.
   ============================================ */

(function () {
  'use strict';

  var LOGOS = [
    { name: 'University of Cambridge',        file: 'logo-cambridge.webp' },
    { name: 'The University of Edinburgh',    file: 'logo-edinburgh.webp' },
    { name: 'Technical University of Munich', file: 'logo-tum.webp' },
    { name: 'The University of Sydney',       file: 'logo-sydney.webp' },
    { name: 'Tampere University',             file: 'logo-tampere.webp' }
  ];

  var track = document.getElementById('uni-carousel-track');
  if (!track || !LOGOS.length) return;

  var root = document.documentElement.getAttribute('data-root') || '';

  /* The CSS loop translates the track by -50%, so the list is rendered twice.
     With few logos the strip would be shorter than the viewport and the loop
     would show a gap, so repeat until it is comfortably wider than the screen. */
  var perCopy = LOGOS.length;
  var copies = 2;
  while (perCopy * copies < 14) copies += 2;

  var html = '';
  for (var c = 0; c < copies; c++) {
    LOGOS.forEach(function (logo) {
      var hidden = c > 0 ? ' aria-hidden="true"' : '';
      html += '<div class="uni-logo-card" role="listitem"' + hidden + '>' +
        '<img src="' + root + 'images/' + logo.file + '" alt="' + logo.name +
        ' logo" class="uni-logo-card__img" loading="lazy" decoding="async">' +
        '</div>';
    });
  }
  track.innerHTML = html;

  /* One loop of the animation must cover exactly half the track. */
  track.style.setProperty('--logo-copies', copies);

  if (window.shI18n) window.shI18n.refresh(track);
})();
