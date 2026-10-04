/* NEDLSALAH — motion layer (GSAP + ScrollTrigger, Lenis, SplitType).
   Runs only when the page is in motion mode (html.fx) AND the libraries loaded.
   If anything is missing or throws, the page keeps working with the native layer in index.html. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('fx')) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  try { init(); } catch (err) { console.warn('[enhance] disabled:', err); root.classList.remove('lenis'); }

  function init() {
    gsap.registerPlugin(ST);
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
    var clamp = gsap.utils.clamp;
    var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    var navPad = function () { return parseFloat(getComputedStyle(root).scrollPaddingTop) || 0; };

    /* ── 1. Lenis smooth scroll (native touch, native keyboard, anchors preserved) ── */
    var lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
      root.classList.add('lenis');
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.addEventListener('click', function (e) {
        var back = e.target.closest && e.target.closest('#backTop');
        if (back) { e.stopImmediatePropagation(); lenis.scrollTo(0, { duration: 1.4, force: true }); return; }
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var el = document.getElementById(id.slice(1)); if (!el) return;
        e.preventDefault();
        var go = function () { lenis.scrollTo(el, { offset: -navPad(), duration: 1.3, force: true }); };
        if (root.classList.contains('menu-open')) setTimeout(go, 150); else go();
        try { history.pushState(null, '', id); } catch (x) {}
      }, true);
      /* mobile menu locks the page: pause Lenis while it is open */
      new MutationObserver(function () { root.classList.contains('menu-open') ? lenis.stop() : lenis.start(); })
        .observe(root, { attributes: true, attributeFilter: ['class'] });
    }

    /* ── 2. Marquee of the six real services; speed reacts to scroll velocity ── */
    var marq = null, marqTl = null, boost = 0;
    function buildMarquee() {
      var titles = $$('.svc-t').map(function (e) { return e.textContent.trim(); }); if (!titles.length) return;
      if (!marq) {
        marq = document.createElement('div'); marq.className = 'marq'; marq.setAttribute('aria-hidden', 'true');
        marq.appendChild(Object.assign(document.createElement('div'), { className: 'marq-track' }));
        var s = $('#services'); s.parentNode.insertBefore(marq, s);
        ST.create({ trigger: marq, start: 'top bottom', end: 'bottom top', onToggle: function (st) { if (marqTl) st.isActive ? marqTl.play() : marqTl.pause(); } });
        ST.create({ onUpdate: function (st) { boost = Math.min(6, Math.abs(st.getVelocity()) / 350); } });
        gsap.ticker.add(function () { boost *= 0.94; if (marqTl) marqTl.timeScale(1 + boost); });
      }
      var track = $('.marq-track', marq); track.textContent = '';
      for (var k = 0; k < 2; k++) {
        var g = document.createElement('div'); g.className = 'marq-g';
        titles.forEach(function (t, i) {
          var a = document.createElement('span'); a.className = 'marq-i' + (i % 2 ? ' o' : ''); a.textContent = t;
          var d = document.createElement('span'); d.className = 'marq-d'; g.appendChild(a); g.appendChild(d);
        });
        track.appendChild(g);
      }
      if (marqTl) marqTl.kill();
      var rtl = root.dir === 'rtl';
      marqTl = gsap.fromTo(track, { xPercent: rtl ? -50 : 0 }, { xPercent: rtl ? 0 : -50, duration: 46, ease: 'none', repeat: -1 });
    }

    /* ── 3. About statement: words light up as you scroll (words only — Arabic stays joined) ── */
    var stTween = null;
    function buildStatement() {
      var p = $('.statement'); if (!p || !window.SplitType) return;
      if (stTween) { stTween.scrollTrigger && stTween.scrollTrigger.kill(); stTween.kill(); stTween = null; }
      var tmp = document.createElement('div'); tmp.textContent = p.textContent;
      var sp = new window.SplitType(tmp, { types: 'words', tagName: 'span' });
      if (!sp.words || !sp.words.length) return;
      p.textContent = ''; while (tmp.firstChild) p.appendChild(tmp.firstChild);
      stTween = gsap.fromTo(sp.words, { opacity: 0.16 }, {
        opacity: 1, ease: 'none', stagger: { each: 0.4 }, duration: 1,
        scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 55%', scrub: 0.5 }
      });
    }

    /* ── 4. Real numbers count up once (e.g. 7+) ── */
    function countUps() {
      $$('.stats dd, .meta dd').forEach(function (dd) {
        var m = /^(\d+)(\+?)$/.exec(dd.textContent.trim()); if (!m) return;
        var n = +m[1], plus = m[2], o = { v: 0 };
        ST.create({ trigger: dd, start: 'top 92%', once: true, onEnter: function () {
          gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: function () { dd.textContent = Math.round(o.v) + plus; }, onComplete: function () { dd.textContent = n + plus; } });
        } });
      });
    }

    /* ── 5. Pointer system (fine pointers only): one listener, one loop ── */
    if (fine) {
      var P = { x: innerWidth / 2, y: innerHeight / 2, dirty: false };
      addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; P.x = e.clientX; P.y = e.clientY; P.dirty = true; }, { passive: true });

      /* hero: words lean toward the cursor + soft accent spotlight */
      var heroEl = $('#hero'), h1 = $('.hero-h1'), heroOn = true, hw = [], hwDirty = true;
      var spot = document.createElement('div'); spot.className = 'spot'; spot.setAttribute('aria-hidden', 'true'); heroEl.insertBefore(spot, heroEl.firstChild);
      var sx = 0, sy = 0, sInit = false;
      new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; if (!heroOn) { leanReset(); spot.classList.remove('on'); } }).observe(heroEl);
      var cacheWords = function () {
        hw = $$('.w', h1).map(function (el) {
          var r = el.getBoundingClientRect();
          return { cx: r.left + r.width / 2 - gsap.getProperty(el, 'x'), cy: r.top + r.height / 2 - gsap.getProperty(el, 'y') + scrollY,
            qx: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }), qy: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }) };
        }); hwDirty = false;
      };
      var leanReset = function () { hw.forEach(function (w) { w.qx(0); w.qy(0); }); };
      var lean = function () {
        if (!h1.classList.contains('is-in')) return; if (hwDirty) cacheWords();
        var sY = scrollY;
        hw.forEach(function (w) {
          var dx = P.x - w.cx, dy = P.y - (w.cy - sY), d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 560); f *= f;
          w.qx(dx / (d + 80) * f * 16); w.qy(dy / (d + 80) * f * 12);
        });
      };
      var spotTick = function () {
        var r = heroEl.getBoundingClientRect(), tx = P.x - r.left, ty = P.y - r.top;
        if (!sInit) { sx = tx; sy = ty; sInit = true; }
        sx += (tx - sx) * 0.09; sy += (ty - sy) * 0.09;
        spot.style.setProperty('--sx', sx.toFixed(1) + 'px'); spot.style.setProperty('--sy', sy.toFixed(1) + 'px'); spot.classList.add('on');
        return Math.abs(tx - sx) > 0.4 || Math.abs(ty - sy) > 0.4;
      };

      /* rows pull their type toward the pointer (small, eased, never changes layout) */
      var cfgs = [
        { host: '.svc-btn', child: '.svc-t', k: 0.05, max: 14 },
        { host: '.svc-btn', child: '.svc-arr', k: 0.14, max: 24 },
        { host: '.cert', child: '.c-title', k: 0.04, max: 12 },
        { host: '.cert', child: '.c-year', k: -0.03, max: 8 },
        { host: '.sk-items li', child: null, k: 0.22, max: 5 },
        { host: '.mail', child: null, k: 0.1, max: 18 }
      ];
      var active = [];
      var release = function (a) { a.qx(0); a.qy(0); };
      document.addEventListener('pointerover', function (e) {
        if (e.pointerType === 'touch' || !e.target.closest) return;
        var next = [];
        cfgs.forEach(function (c) {
          var h = e.target.closest(c.host); if (!h) return;
          var prev = active.filter(function (a) { return a.c === c && a.h === h; })[0];
          if (prev) { next.push(prev); return; }
          var t = c.child ? $(c.child, h) : h; if (!t) return;
          next.push({ c: c, h: h, t: t, qx: gsap.quickTo(t, 'x', { duration: 0.7, ease: 'power3.out' }), qy: gsap.quickTo(t, 'y', { duration: 0.7, ease: 'power3.out' }) });
        });
        active.forEach(function (a) { if (next.indexOf(a) < 0) release(a); });
        active = next; P.dirty = true;
      });
      root.addEventListener('mouseleave', function () { active.forEach(release); active = []; leanReset(); });
      var pull = function (a) {
        var r = a.h.getBoundingClientRect(), self = a.t === a.h;
        var cx = r.left + r.width / 2 - (self ? gsap.getProperty(a.t, 'x') : 0), cy = r.top + r.height / 2 - (self ? gsap.getProperty(a.t, 'y') : 0);
        a.qx(clamp(-a.c.max, a.c.max, (P.x - cx) * a.c.k)); a.qy(clamp(-a.c.max, a.c.max, (P.y - cy) * a.c.k * 0.8));
      };

      var busy = false;
      gsap.ticker.add(function () {
        if (!P.dirty && !busy) return; P.dirty = false; busy = false;
        if (heroOn) { lean(); busy = spotTick(); }
        active.forEach(pull);
      });
    }

    /* ── 6. Keep everything in step with layout and language ── */
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { if (typeof hwDirty !== 'undefined') hwDirty = true; ST.refresh(); }, 250); }).observe(document.body);
    new MutationObserver(function () {
      requestAnimationFrame(function () { if (typeof hwDirty !== 'undefined') hwDirty = true; buildMarquee(); buildStatement(); ST.refresh(); });
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });

    buildMarquee(); buildStatement(); countUps();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
    window.__fx2 = { lenis: !!lenis, split: !!window.SplitType };
  }
})();
