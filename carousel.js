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

  /* `scale` (optional, default 1) sizes a logo up or down. A round emblem or a
     stacked logo needs more room than a wide wordmark to stay legible. */
  var LOGOS = [
    { name: 'University of Cambridge',        file: 'logo-cambridge.webp' },
    { name: 'University of Pittsburgh',       file: 'logo-pittsburgh.webp' },
    { name: 'Technical University of Munich', file: 'logo-tum.webp' },
    { name: 'The University of Melbourne',    file: 'logo-melbourne.webp' },
    { name: 'The University of Edinburgh',    file: 'logo-edinburgh.webp' },
    { name: 'Humboldt-Universität zu Berlin', file: 'logo-humboldt.webp', scale: 1.3 },
    { name: 'The University of Sydney',       file: 'logo-sydney.webp' },
    { name: 'Universitat de Barcelona',       file: 'logo-barcelona.webp' },
    { name: 'Tampere University',             file: 'logo-tampere.webp' },
    { name: 'Universiteit van Amsterdam',     file: 'logo-amsterdam.webp', scale: 1.15 }
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
      var size = logo.scale ? ' style="--logo-scale:' + logo.scale + '"' : '';
      html += '<div class="uni-logo-card" role="listitem"' + hidden + '>' +
        '<img src="' + root + 'images/' + logo.file + '" alt="' + logo.name +
        ' logo" class="uni-logo-card__img"' + size + ' loading="lazy" decoding="async">' +
        '</div>';
    });
  }
  track.innerHTML = html;

  /* The loop moves the track by half its length, so the time it takes has to
     grow with the number of logos or the strip speeds up every time one is added.
     1.8s per logo is the pace the strip has always had (5 logos, 4 copies, 36s). */
  track.style.setProperty('--logo-duration', (perCopy * copies * 1.8) + 's');

  if (window.shI18n) window.shI18n.refresh(track);
})();
