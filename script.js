// script.js - navbar toggle, smooth scroll, animate skill bars, contact form simulation

document.addEventListener('DOMContentLoaded', () => {
  // NAV TOGGLE
  const hamburger = document.getElementById('hamburger');
  const navList = document.querySelector('.nav-list');

  function setAria(expanded) {
    if (hamburger) hamburger.setAttribute('aria-expanded', String(expanded));
  }

  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      const active = navList.classList.toggle('mobile-active');
      hamburger.classList.toggle('active');
      setAria(active);
    });

    // close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navList.classList.contains('mobile-active')) {
          navList.classList.remove('mobile-active');
          hamburger.classList.remove('active');
          setAria(false);
        }
      });
    });

    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!navList.contains(e.target) && !hamburger.contains(e.target) && navList.classList.contains('mobile-active')) {
        navList.classList.remove('mobile-active');
        hamburger.classList.remove('active');
        setAria(false);
      }
    });
  }

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // SKILL BARS: animate when visible
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.querySelectorAll('.skill-progress').forEach((bar, i) => {
          const level = parseInt(bar.getAttribute('data-level') || '0', 10);
          // stagger
          setTimeout(() => { bar.style.width = level + '%'; }, i * 120);
        });
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.skill-card').forEach(card => {
    // ensure initial width 0
    card.querySelectorAll('.skill-progress').forEach(bar => bar.style.width = '0');
    skillObserver.observe(card);
  });

  // CONTACT FORM (simulate submission)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submit = contactForm.querySelector('button[type="submit"]');
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      submit.disabled = true;
      const originalText = submit.textContent;
      submit.textContent = 'Sending…';

      setTimeout(() => {
        alert('Message sent. Thank you — I will get back to you soon.');
        contactForm.reset();
        submit.textContent = originalText;
        submit.disabled = false;
      }, 1200);
    });
  }

  // small accessibility nicety: show focus outlines for keyboard users
  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-tabbing');
  });
});
