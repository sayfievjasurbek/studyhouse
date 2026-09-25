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

  function setMenu(open) {
    if (!hamburgerBtn || !mobileNav) return;
    hamburgerBtn.classList.toggle('active', open);
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        setMenu(false);
        hamburgerBtn.focus();
      }
    });
  }

  document.querySelectorAll('[data-nav-close]').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
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
