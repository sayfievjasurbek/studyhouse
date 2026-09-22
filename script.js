/* ============================================
   STUDY HOUSE — Interactive Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Navbar scroll shadow ---
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- Mobile Nav ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('[data-nav-close]').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerBtn.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Student Stories Carousel ---
  const stories = [
    {
      quote: '"Study House made my dream of studying in the UK come true. Their team was with me at every step — from choosing a university to getting my visa."',
      name: 'Amina T.',
      university: 'University of Oxford'
    },
    {
      quote: '"I never thought I\'d study at ETH Zürich. Study House showed me it was possible, guided my application, and now I\'m living my dream in Switzerland."',
      name: 'David K.',
      university: 'ETH Zürich'
    },
    {
      quote: '"The team at Study House took care of everything — from selecting the right program to arranging my accommodation in Melbourne. Truly exceptional service."',
      name: 'Priya R.',
      university: 'University of Melbourne'
    },
    {
      quote: '"Moving to New York for university felt overwhelming, but Study House made the entire process seamless. I can\'t recommend them enough."',
      name: 'Carlos M.',
      university: 'New York University'
    }
  ];

  const quoteEl = document.getElementById('story-quote');
  const attrEl = document.getElementById('story-attribution');
  const dotsContainer = document.getElementById('story-dots');
  let currentStory = 0;

  function updateStory(index) {
    const story = stories[index];
    
    // Fade out
    quoteEl.style.opacity = '0';
    quoteEl.style.transform = 'translateY(10px)';
    attrEl.style.opacity = '0';

    setTimeout(() => {
      quoteEl.textContent = story.quote;
      attrEl.innerHTML = `<strong>${story.name}</strong> — ${story.university}`;

      // Fade in
      quoteEl.style.opacity = '1';
      quoteEl.style.transform = 'translateY(0)';
      attrEl.style.opacity = '1';
    }, 300);

    // Update dots
    dotsContainer.querySelectorAll('.stories__dot').forEach((dot, i) => {
      dot.classList.toggle('stories__dot--active', i === index);
    });

    currentStory = index;
  }

  // Add transition styles
  if (quoteEl) {
    quoteEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    attrEl.style.transition = 'opacity 0.3s ease';
  }

  // Dot click handlers
  dotsContainer?.querySelectorAll('.stories__dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.story);
      updateStory(index);
    });
  });

  // Auto-advance carousel every 6 seconds
  setInterval(() => {
    const nextIndex = (currentStory + 1) % stories.length;
    updateStory(nextIndex);
  }, 6000);

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target === '#') return;

      const targetEl = document.querySelector(target);
      if (targetEl) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

});
