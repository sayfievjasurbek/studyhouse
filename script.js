/* ============================================
   STUDY HOUSE — shared page behaviour

   Runs on every page. The markup it drives (navbar, mobile menu, footer) is
   injected by site.js, which must be loaded first.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll reveal ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // --- Navbar scroll shadow ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile menu ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  let inertSaved = [];

  /* While the menu is open the page behind it must not be reachable by Tab or a
     screen reader. The header stays live so the button can close the menu. */
  function setBackgroundInert(on) {
    if (on) {
      Array.prototype.forEach.call(document.body.children, (n) => {
        if (n === navbar || n === mobileNav || n.tagName === 'SCRIPT' || n.tagName === 'NOSCRIPT') return;
        if (n.id === 'booking' || n.id === 'programme-modal') return;
        inertSaved.push([n, n.inert]);
        n.inert = true;
      });
    } else {
      inertSaved.forEach((pair) => { pair[0].inert = pair[1]; });
      inertSaved = [];
    }
  }

  function setMenu(open) {
    if (!hamburgerBtn || !mobileNav) return;
    if (open === mobileNav.classList.contains('open')) return;
    hamburgerBtn.classList.toggle('active', open);
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';      // scroll lock
    setBackgroundInert(open);
    if (open) {
      const first = mobileNav.querySelector('a, button');
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));

    /* Tap on the empty part of the menu (outside the links) closes it */
    mobileNav.addEventListener('click', (e) => { if (e.target === mobileNav) setMenu(false); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        setMenu(false);
        hamburgerBtn.focus();
      }
    });

    /* Rotating a tablet or widening the window past the menu breakpoint must not
       leave the page locked behind an invisible menu. */
    const wide = window.matchMedia('(min-width: 1101px)');
    const onWide = () => { if (wide.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
  }

  document.querySelectorAll('[data-nav-close]').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // --- The on-screen keyboard must not cover the field being typed in ---
  /* --vvh is the height of the part of the page that is actually visible. On iOS
     the keyboard shrinks the visual viewport but not the layout viewport, so
     `100dvh` alone leaves the bottom of a sheet under the keyboard; the booking
     form uses --vvh to shrink with it. */
  const vv = window.visualViewport;
  const setVvh = () => document.documentElement.style.setProperty('--vvh', (vv ? vv.height : window.innerHeight) + 'px');
  setVvh();
  if (vv) { vv.addEventListener('resize', setVvh); vv.addEventListener('scroll', setVvh); }
  window.addEventListener('resize', setVvh);

  const coarse = window.matchMedia('(pointer: coarse)');
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (!el || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || !coarse.matches) return;
    /* the keyboard takes a moment to appear; scroll after it has */
    setTimeout(() => {
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) { el.scrollIntoView(); }
    }, 320);
  });

  // --- Smooth scroll for in-page anchors ---
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.hasAttribute('data-booking')) return;
    const target = anchor.getAttribute('href');
    if (target === '#') return;
    const targetEl = document.querySelector(target);
    if (!targetEl) return;
    e.preventDefault();
    const navHeight = navbar ? navbar.offsetHeight : 0;
    window.scrollTo({
      top: targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20,
      behavior: 'smooth'
    });
  });

  // --- Pill toggles (institution filters on the destination pages) ---
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.closest('.pills, .inst-database__pills, .container')
        ?.querySelectorAll('.pill').forEach(p => p.classList.remove('pill--active'));
      pill.classList.add('pill--active');
    });
  });

});
