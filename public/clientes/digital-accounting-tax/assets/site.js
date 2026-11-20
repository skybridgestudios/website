(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var lang = root.lang === 'en' ? 'en' : 'es';
  save('dat-lang', lang);

  /* language switch: land on the same section you were reading, not the top */
  var readLine = function () { var n = document.querySelector('.nav'); return (n ? n.getBoundingClientRect().bottom : 0) + 12; };
  try {
    var spot = sessionStorage.getItem('dat-spot');
    if (spot) {
      sessionStorage.removeItem('dat-spot');
      spot = JSON.parse(spot);
      var target = document.querySelectorAll('main section')[spot.i];
      if (target && !(spot.i === 0 && spot.f < 0.03)) {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        var place = function () {
          var r0 = target.getBoundingClientRect();
          window.scrollTo({ top: Math.max(0, window.scrollY + r0.top + spot.f * r0.height - readLine()), left: 0, behavior: 'instant' });
        };
        place();
        window.addEventListener('load', place, { once: true });
      }
    }
  } catch (e) {}
  document.querySelectorAll('.lang a[hreflang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try {
        var secs = document.querySelectorAll('main section'), line = readLine(), best = 0, frac = 0;
        for (var k = 0; k < secs.length; k++) {
          var rc = secs[k].getBoundingClientRect();
          if (rc.top <= line && rc.bottom > line) { best = k; frac = rc.height ? (line - rc.top) / rc.height : 0; break; }
        }
        sessionStorage.setItem('dat-spot', JSON.stringify({ i: best, f: frac }));
        if (window.__datRetStep != null) sessionStorage.setItem('dat-ret', String(window.__datRetStep));
      } catch (e) {}
    });
  });
  try { sessionStorage.setItem('dat-seen', '1'); } catch (e) {}

  /* mobile menu */
  var navEl = document.getElementById('nav'), menuBtn = document.getElementById('menuBtn');
  function menu(open) { navEl.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { menu(!navEl.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navEl.classList.contains('open')) { menu(false); menuBtn.focus(); } });
    document.addEventListener('click', function (e) { if (!navEl.contains(e.target)) menu(false); });
  }

  /* office hours: Monday to Friday 8:30 to 16:30, America/New_York */
  (function () {
    var p = {};
    try { new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { return; }
    var day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
    var m = parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10);
    var wk = day >= 1 && day <= 5, open = wk && m >= 510 && m < 990;
    var T = lang === 'es'
      ? [open ? 'Abierto ahora, cerramos a las 4:30 p. m.' : (wk && m < 510) ? 'Cerrado, abrimos hoy a las 8:30 a. m.' : (day >= 1 && day <= 4) ? 'Cerrado, abrimos mañana a las 8:30 a. m.' : 'Cerrado, abrimos el lunes a las 8:30 a. m.']
      : [open ? 'Open now, closing at 4:30 p.m.' : (wk && m < 510) ? 'Closed, opening today at 8:30 a.m.' : (day >= 1 && day <= 4) ? 'Closed, opening tomorrow at 8:30 a.m.' : 'Closed, opening Monday at 8:30 a.m.'];
    document.querySelectorAll('[data-open]').forEach(function (el) {
      el.setAttribute('data-state', open ? 'open' : 'closed');
      el.textContent = T[0];
    });
    document.querySelectorAll('tr[data-day]').forEach(function (r) { if (parseInt(r.getAttribute('data-day'), 10) === day) r.classList.add('today'); });
  })();

  /* palette (demo only: remove the switcher once the client picks one) */
  var curSw = document.getElementById('curSw');
  function setPal(p) {
    if (!document.querySelector('[data-pal="' + p + '"]')) p = 'tinta';
    root.setAttribute('data-palette', p);
    document.querySelectorAll('[data-pal]').forEach(function (b) {
      var on = b.getAttribute('data-pal') === p;
      b.setAttribute('aria-pressed', String(on));
      if (on && curSw) curSw.style.background = b.querySelector('i').style.background;
    });
    save('dat-pal', p);
  }
  setPal(load('dat-pal') || 'tinta');
  document.querySelectorAll('[data-pal]').forEach(function (b) { b.addEventListener('click', function () { setPal(b.getAttribute('data-pal')); }); });
  var dockBtn = document.getElementById('dockBtn'), palPanel = document.getElementById('palPanel');
  if (dockBtn && palPanel) {
    var openPanel = function (o) { palPanel.hidden = !o; dockBtn.setAttribute('aria-expanded', String(o)); };
    dockBtn.addEventListener('click', function (e) { e.stopPropagation(); openPanel(palPanel.hidden); });
    document.addEventListener('click', function (e) { if (!palPanel.hidden && !palPanel.contains(e.target)) openPanel(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !palPanel.hidden) { openPanel(false); dockBtn.focus(); } });
  }
  /* hide the palette button only inside our own phone preview (telefono.html), never in other frames */
  try {
    if (/[?&]view=phone/.test(location.search)) sessionStorage.setItem('dat-phone', '1');
    if (window.self !== window.top && sessionStorage.getItem('dat-phone') === '1') root.classList.add('embed');
  } catch (e) {}
  window.addEventListener('message', function (e) { var d = e.data || {}; if (d.datPal) setPal(d.datPal); });

  /* document checklist tabs */
  var tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-tab');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== k; });
    });
  });

  /* scroll-linked motion */
  var bar = document.querySelector('.progress');
  var hero = document.getElementById('hero');
  var stage = document.getElementById('stage');
  var stepsEl = document.getElementById('steps');
  var fill = document.getElementById('fill');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var stepNum = document.getElementById('stepNum');
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (navEl) navEl.classList.toggle('scrolled', y > 24);
    if (!reduce && hero && stage) {
      var s = Math.max(0, Math.min(1, y / (hero.offsetHeight * 0.75)));
      stage.style.setProperty('--s', s.toFixed(3));
    }
    if (stepsEl && fill) {
      var sr = stepsEl.getBoundingClientRect();
      var pp = Math.max(0, Math.min(1, (vh * 0.6 - sr.top) / sr.height));
      fill.style.transform = 'scaleY(' + pp.toFixed(3) + ')';
      var active = 0;
      steps.forEach(function (st, i) { if (st.getBoundingClientRect().top < vh * 0.62) active = i; });
      steps.forEach(function (st, i) { st.classList.toggle('on', i <= active); });
      if (stepNum) stepNum.textContent = String(active + 1);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* home: the return fills in line by line, gets filed, then starts again */
  var ret = document.getElementById('ret');
  if (ret) {
    var rRows = Array.prototype.slice.call(ret.querySelectorAll('.steps-x li'));
    var rBar = document.getElementById('retBar'), rPct = document.getElementById('retPct'), rToast = document.getElementById('retToast');
    var setStep = function (n) {
      window.__datRetStep = n;
      rRows.forEach(function (r, i) { r.classList.toggle('done', i < n); r.classList.toggle('busy', i === n); });
      var p = Math.round(n / rRows.length * 100);
      rBar.style.width = p + '%'; rPct.textContent = p + '%';
      ret.setAttribute('data-state', n >= rRows.length ? 'filed' : (n >= 3 ? 'review' : 'prep'));
    };
    if (!reduce) {
      var step = 0;
      var run = function () {
        if (document.hidden) { setTimeout(run, 1000); return; }
        setStep(step);
        if (step === rRows.length) {
          ret.classList.remove('filed'); void ret.offsetWidth; ret.classList.add('filed');
          setTimeout(function () { if (rToast) rToast.classList.add('show'); }, 650);
          setTimeout(function () {
            if (rToast) rToast.classList.remove('show'); ret.classList.remove('filed');
            step = 0; setStep(0); setTimeout(run, 1100);
          }, 4600);
          return;
        }
        step++;
        setTimeout(run, step === 1 ? 700 : 950);
      };
      /* reset the baked 'filed' state without any fade, so nothing flickers on load */
      root.classList.add('hero-init');
      ret.classList.remove('filed'); if (rToast) rToast.classList.remove('show');
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('hero-init'); }); });
      var resume = null;
      try { resume = sessionStorage.getItem('dat-ret'); sessionStorage.removeItem('dat-ret'); } catch (e) {}
      if (resume !== null && !isNaN(+resume)) {
        step = Math.min(Math.max(+resume, 0), rRows.length - 1); setStep(step); step++;
        setTimeout(run, 950);
      } else {
        setStep(0);
        setTimeout(run, 900);
      }
    }
  }

  /* pointer: the hero sheet and the ITIN papers lean toward the cursor */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    if (hero && stage) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var glide = function () {
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
        stage.style.setProperty('--ry', cx.toFixed(2)); stage.style.setProperty('--rx', cy.toFixed(2));
        raf = (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) ? requestAnimationFrame(glide) : 0;
      };
      var aim = function (x, y) { tx = x; ty = y; if (!raf) raf = requestAnimationFrame(glide); };
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        aim(((e.clientX - r.left) / r.width - 0.5) * 5, -((e.clientY - r.top) / r.height - 0.5) * 4);
      });
      hero.addEventListener('pointerleave', function () { aim(0, 0); });
    }
    var art = document.getElementById('itinArt');
    if (art) {
      var tilts = art.querySelectorAll('[data-tilt]');
      art.addEventListener('pointermove', function (e) {
        var r = art.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5;
        tilts.forEach(function (el, i) {
          var base = parseFloat(el.getAttribute('data-tilt')), k = i === 0 ? 1 : 1.4;
          el.style.transform = 'perspective(1200px) rotate(' + base + 'deg) rotateY(' + (x * 7 * k).toFixed(2) + 'deg) rotateX(' + (-yy * 5 * k).toFixed(2) + 'deg)';
        });
      });
      art.addEventListener('pointerleave', function () { tilts.forEach(function (el) { el.style.transform = ''; }); });
    }
  }

  /* reveal on scroll: transform only, so every section is readable at rest */
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('motion');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('main [data-reveal], main .svc').forEach(function (el, i) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.setAttribute('data-reveal', '');
        if (el.classList.contains('svc')) el.style.setProperty('--d', ((i % 6) * 0.05) + 's');
        el.classList.add('pre');
        io.observe(el);
      }
    });
  }
})();
