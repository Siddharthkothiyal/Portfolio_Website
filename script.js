/* ============================================================
   Portfolio — Interactive Script
   Nav, reveal, counters, spotlight, accessibility helpers
   ============================================================ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const doc = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupHeaderScroll();
    setupMobileNav();
    setupSmoothScroll();
    setupReveals();
    setupActiveNavOnScroll();
    setupCounters();
    setupEngBars();
    setupSpotlight();
    setupKeyboardA11y();
  }

  /* ------------------------------------------------------------
     HEADER — scroll state
     ------------------------------------------------------------ */
  function setupHeaderScroll() {
    const header = $('#siteHeader');
    if (!header) return;
    let lastY = 0;
    let ticking = false;

    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      if (y > 12) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
      lastY = y;
      ticking = false;
    };
    update();

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------
     MOBILE NAV — overlay
     ------------------------------------------------------------ */
  function setupMobileNav() {
    const hamburger = $('#hamburger');
    const mobileNav = $('#mobileNav');
    if (!hamburger || !mobileNav) return;

    const openNav = () => {
      mobileNav.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      doc.style.overflow = 'hidden';
    };
    const closeNav = () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      doc.style.overflow = '';
    };
    const toggle = () => {
      if (mobileNav.classList.contains('open')) closeNav();
      else openNav();
    };

    hamburger.addEventListener('click', toggle);

    // close when clicking links
    $$('.mobile-nav-list a', mobileNav).forEach(a => {
      a.addEventListener('click', closeNav);
    });

    // esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeNav();
    });

    // sync with viewport — if resized to desktop, close
    const mq = window.matchMedia('(min-width: 781px)');
    const onChange = (ev) => { if (ev.matches) closeNav(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange); // older Safari
  }

  /* ------------------------------------------------------------
     SMOOTH SCROLL (native when possible, plus nav-offset)
     ------------------------------------------------------------ */
  function setupSmoothScroll() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = $('#siteHeader')?.offsetHeight || 64;
        const rect = target.getBoundingClientRect();
        const top = rect.top + (window.scrollY || window.pageYOffset) - navH + 1;
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }

  /* ------------------------------------------------------------
     REVEAL ON SCROLL — IntersectionObserver
     ------------------------------------------------------------ */
  function setupReveals() {
    if (prefersReducedMotion) {
      $$('.reveal, .stagger').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal, .stagger').forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------
     ACTIVE NAV — scroll spy
     ------------------------------------------------------------ */
  function setupActiveNavOnScroll() {
    const sectionIds = ['home', 'about', 'skills', 'projects', 'engineering', 'experience', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const links = $$('.nav-links .nav-link');
    if (!sections.length || !links.length) return;

    const linkForId = (id) => links.find(l => l.getAttribute('href') === '#' + id);
    const navH = $('#siteHeader')?.offsetHeight || 64;

    const io = new IntersectionObserver((entries) => {
      let visible = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!visible || entry.boundingClientRect.top < visible.boundingClientRect.top) {
            visible = entry;
          }
        }
      });
      if (visible) {
        links.forEach(l => l.classList.remove('is-active'));
        const l = linkForId(visible.target.id);
        if (l) l.classList.add('is-active');
      }
    }, {
      rootMargin: `-${navH + 8}px 0px -60% 0px`,
      threshold: 0
    });
    sections.forEach(s => io.observe(s));
  }

  /* ------------------------------------------------------------
     ANIMATED COUNTERS (stats in About)
     ------------------------------------------------------------ */
  function setupCounters() {
    const counters = $$('.stat-num[data-count]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      if (!target || target < 1) return;
      if (prefersReducedMotion) { el.textContent = target; return; }

      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = val;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => io.observe(c));
  }

  /* ------------------------------------------------------------
     ENGINEERING — progress bar fills
     ------------------------------------------------------------ */
  function setupEngBars() {
    const bars = $$('.eng-bar-fill');
    if (!bars.length) return;

    const fill = (el) => {
      const pct = el.getAttribute('data-fill') || '0';
      if (prefersReducedMotion) { el.style.width = pct + '%'; return; }
      requestAnimationFrame(() => { el.style.width = pct + '%'; });
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fill(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(b => io.observe(b));
  }

  /* ------------------------------------------------------------
     PROJECT CARD SPOTLIGHT — mouse position follows cursor
     ------------------------------------------------------------ */
  function setupSpotlight() {
    if (prefersReducedMotion) return;

    $$('.project-card').forEach(card => {
      let rafId = 0;
      card.addEventListener('mousemove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mx', x + '%');
          card.style.setProperty('--my', y + '%');
          rafId = 0;
        });
      });
    });
  }

  /* ------------------------------------------------------------
     A11Y — show focus outlines for keyboard users only
     ------------------------------------------------------------ */
  function setupKeyboardA11y() {
    const onKeyUp = (e) => {
      if (e.key === 'Tab') {
        doc.classList.add('user-tabbing');
        document.body.removeEventListener('keyup', onKeyUp);
        document.addEventListener('mousedown', onMouseDown, { once: true });
      }
    };
    const onMouseDown = () => {
      doc.classList.remove('user-tabbing');
      document.body.addEventListener('keyup', onKeyUp, { once: true });
    };
    document.body.addEventListener('keyup', onKeyUp, { once: true });
  }
})();
