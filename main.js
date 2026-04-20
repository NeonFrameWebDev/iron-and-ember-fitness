/* Iron & Ember Fitness, site motion + interactions.
   Uses GSAP + ScrollTrigger + Lenis if available; degrades gracefully. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  /* ----- helpers ----- */
  function $(q, scope) { return (scope || document).querySelector(q); }
  function $$(q, scope) { return Array.from((scope || document).querySelectorAll(q)); }

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* =====================================
     Intro loader (first visit only)
     ===================================== */
  var loader = document.getElementById('loader');
  function finishLoader() {
    if (loader) {
      loader.classList.add('is-done');
      setTimeout(function () { if (loader && loader.parentNode) loader.remove(); }, 900);
    }
    document.body.classList.remove('is-locked');
  }

  if (loader) {
    var alreadySeen = sessionStorage.getItem('ie_seen') === '1';
    if (alreadySeen || reduceMotion) {
      finishLoader();
      kickHero();
    } else {
      sessionStorage.setItem('ie_seen', '1');
      document.body.classList.add('is-locked');
      var bar = loader.querySelector('.loader__bar');
      var count = loader.querySelector('.loader__count');
      setTimeout(function () { loader.classList.add('is-ready'); }, 80);
      var n = 0;
      var target = 100;
      var interval = setInterval(function () {
        n += Math.floor(Math.random() * 7) + 2;
        if (n >= target) n = target;
        if (count) count.textContent = (n < 10 ? '0' + n : n) + ' / 100';
        if (bar) bar.style.width = n + '%';
        if (n >= target) {
          clearInterval(interval);
          setTimeout(function () {
            finishLoader();
            kickHero();
          }, 380);
        }
      }, 48);
      // hard safety timeout
      setTimeout(finishLoader, 5000);
    }
  } else {
    kickHero();
  }

  /* =====================================
     Custom text split for hero words
     ===================================== */
  function splitIntoSpans(el) {
    if (!el || el.dataset.split === '1') return;
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.transitionDelay = (i * 0.04) + 's';
      el.appendChild(s);
    });
    el.dataset.split = '1';
  }

  function kickHero() {
    $$('.hero__word').forEach(splitIntoSpans);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$('.hero__word span').forEach(function (s) { s.style.transform = 'translateY(0)'; s.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'; });
      });
    });
    // hero background subtle zoom in
    var bg = $('.hero__bg');
    if (bg && !reduceMotion) {
      bg.style.transition = 'transform 2.2s cubic-bezier(0.22, 1, 0.36, 1)';
      requestAnimationFrame(function () { bg.style.transform = 'scale(1)'; });
    }
  }

  /* =====================================
     Scroll progress bar + nav blur
     ===================================== */
  var progress = document.getElementById('progress');
  var nav = document.getElementById('nav');
  var railFill = document.getElementById('railFill');
  var navSlash = document.querySelector('.nav__mark .slash');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var pct = Math.min(100, Math.max(0, y / docH * 100));
    if (progress) progress.style.width = pct + '%';
    if (railFill) railFill.style.height = pct + '%';
    if (navSlash) navSlash.style.transform = 'translateY(-0.05em) rotate(' + (y * 0.25) + 'deg)';
    if (nav) {
      if (y > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =====================================
     Mobile menu overlay
     ===================================== */
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menuBtn');
  var menuClose = document.getElementById('menuClose');
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.inert = false;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.inert = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a, i) {
      a.style.setProperty('--i', i);
      a.addEventListener('click', closeMenu);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu();
  });

  /* =====================================
     Native smooth anchor scroll
     ===================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 80;
      var y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* =====================================
     .rise reveal on scroll (IO fallback or ScrollTrigger)
     ===================================== */
  if (hasGSAP && hasScrollTrigger && !reduceMotion) {
    $$('.rise').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function () { el.classList.add('is-in'); },
        once: true
      });
    });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    $$('.rise').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rise').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =====================================
     Section heading word reveal
     ===================================== */
  if (hasGSAP && hasScrollTrigger && !reduceMotion) {
    $$('[data-split]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) {
        return '<span class="splitw"><span class="splitw__i">' + w + '</span></span>';
      }).join(' ');
      el.querySelectorAll('.splitw__i').forEach(function (s) { s.style.display = 'inline-block'; s.style.transform = 'translateY(110%)'; });
      el.querySelectorAll('.splitw').forEach(function (s) { s.style.display = 'inline-block'; s.style.overflow = 'hidden'; });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function () {
          gsap.to(el.querySelectorAll('.splitw__i'), {
            y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05
          });
        },
        once: true
      });
    });
  }

  /* =====================================
     Marquee: clone children so -50% loop works
     ===================================== */
  $$('.marquee__track').forEach(function (track) {
    var kids = Array.from(track.children);
    kids.forEach(function (k) { track.appendChild(k.cloneNode(true)); });
  });

  /* Moments row is horizontally scrollable natively via overflow-x: auto */

  /* =====================================
     Programs pinned image swap
     ===================================== */
  if (hasGSAP && hasScrollTrigger) {
    var blocks = $$('.programs-pinned__block');
    var medias = $$('.programs-pinned__media img');
    blocks.forEach(function (block, i) {
      ScrollTrigger.create({
        trigger: block,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: function () { swapMedia(i); },
        onEnterBack: function () { swapMedia(i); }
      });
    });
    function swapMedia(i) {
      medias.forEach(function (m, j) { m.classList.toggle('is-active', j === i); });
    }
    if (medias.length) medias[0].classList.add('is-active');
  }

  /* =====================================
     Magnetic cursor (desktop, pointer:fine)
     ===================================== */
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    var mouseX = 0, mouseY = 0;
    var cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
    });
    function loop() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = 'translate3d(' + (cursorX - 5) + 'px,' + (cursorY - 5) + 'px, 0)';
      requestAnimationFrame(loop);
    }
    loop();
    $$('a, button, .program-strip, .coach-card, .price-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-link'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-link'); });
    });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('is-hidden'); });
  }

  /* =====================================
     Animated stat counters with slam
     ===================================== */
  var statsAnimated = false;
  function overshootEase(t) {
    if (t < 0.72) return 1.08 * (1 - Math.pow(1 - t / 0.72, 3));
    var p = (t - 0.72) / 0.28;
    return 1.08 - 0.08 * (p * p * (3 - 2 * p));
  }
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var numEl = el.querySelector('.stat__num');
    var duration = 1600;
    var start = null;
    function fmt(n) { return (target >= 1000 ? n.toLocaleString() : n) + suffix; }
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      numEl.textContent = fmt(Math.round(overshootEase(t) * target));
      if (t < 1) requestAnimationFrame(step);
      else {
        numEl.textContent = fmt(target);
        el.classList.add('stat--slam');
        el.addEventListener('animationend', function () { el.classList.remove('stat--slam'); }, { once: true });
      }
    }
    requestAnimationFrame(step);
  }
  function kickStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    $$('.stat').forEach(function (el, i) { setTimeout(function () { animateCounter(el); }, i * 180); });
  }
  var statsSec = document.querySelector('.stats');
  if (statsSec) {
    if (hasGSAP && hasScrollTrigger) {
      ScrollTrigger.create({ trigger: statsSec, start: 'top 80%', once: true, onEnter: kickStats });
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { kickStats(); } });
      }, { threshold: 0.3 }).observe(statsSec);
    } else {
      kickStats();
    }
  }

  /* =====================================
     Testimonial rotator (if present)
     ===================================== */
  var testiStage = $('.testi__stage');
  if (testiStage) {
    var slides = $$('.testi__slide', testiStage);
    var dots = $$('.testi__dot');
    var idx = 0;
    var tick = null;
    function show(i) {
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
      idx = i;
    }
    function autoNext() { show((idx + 1) % slides.length); }
    function startTick() { stopTick(); tick = setInterval(autoNext, 7000); }
    function stopTick() { if (tick) clearInterval(tick); tick = null; }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { show(i); startTick(); });
    });
    testiStage.addEventListener('mouseenter', stopTick);
    testiStage.addEventListener('mouseleave', startTick);
    show(0);
    startTick();
  }

  /* =====================================
     FAQ accordion (details/summary)
     Enhance so only one opens at a time
     ===================================== */
  $$('.faq__item').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        $$('.faq__item').forEach(function (o) { if (o !== d) o.open = false; });
      }
    });
  });

  /* =====================================
     Floating label form
     ===================================== */
  $$('.field input, .field textarea, .field select').forEach(function (i) {
    function check() {
      var val = i.value;
      var field = i.closest('.field');
      if (!field) return;
      if (val && val.length) field.classList.add('is-filled');
      else field.classList.remove('is-filled');
    }
    i.addEventListener('input', check);
    i.addEventListener('change', check);
    check();
  });

  /* =====================================
     Contact form submit
     ===================================== */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Message Sent';
      btn.disabled = true;
      btn.style.background = '#1F8A3E';
      btn.style.borderColor = '#1F8A3E';
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
        $$('.field').forEach(function (f) { f.classList.remove('is-filled'); });
      }, 2400);
    });
  }

  /* =====================================
     Page transition sweep on internal nav
     ===================================== */
  var sweep = null;
  function getSweep() {
    if (!sweep) {
      sweep = document.createElement('div');
      sweep.className = 'page-transition';
      document.body.appendChild(sweep);
    }
    return sweep;
  }
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (a.hasAttribute('target') && a.getAttribute('target') === '_blank') return;
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('http') && !href.startsWith(location.origin)) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (a.closest('.menu') === menu && menu.classList.contains('is-open')) return;
      // only intercept same-origin same-tab
      e.preventDefault();
      var s = getSweep();
      s.classList.add('is-sweeping');
      setTimeout(function () { window.location.href = href; }, 520);
    });
    // reveal: when page loads, run reveal direction
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        // back/forward from bfcache, remove overlay
        var s = $('.page-transition');
        if (s) s.remove();
      }
    });
  }

})();
