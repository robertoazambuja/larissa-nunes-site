(function () {
  'use strict';

  // Mobile menu
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('active');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    nav.querySelectorAll('.header__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Header scroll shadow
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('header--scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Scroll reveal with stagger
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    var parent = el.parentElement;
    if (parent) {
      var siblings = Array.from(parent.children).filter(function(c) { return c.classList.contains('reveal'); });
      var idx = siblings.indexOf(el);
      el.style.transitionDelay = (idx * 0.1) + 's';
    }
    obs.observe(el);
  });
})();
