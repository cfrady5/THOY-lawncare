/* THOY Lawncare — interactions.
   Motion system (reveal-on-scroll, staggered grids, count-up, scrolled header)
   adapted from the shared ARI site system. No dependencies. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsIO = "IntersectionObserver" in window;
  var STEP = 90, MAX = 8;

  /* Mobile nav */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var mobile = document.getElementById("navMobile");
    if (!toggle || !mobile) return;
    toggle.addEventListener("click", function () {
      var open = mobile.classList.toggle("open");
      mobile.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("open");
        mobile.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Header gains a shadow / condenses once you scroll */
  function initHeaderScroll() {
    var header = document.querySelector(".nav");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal + staggered grids */
  function assignDelays(els) {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var kids = group.querySelectorAll(":scope > [data-reveal], :scope > .reveal");
      Array.prototype.forEach.call(kids, function (kid, i) {
        if (!kid.hasAttribute("data-delay"))
          kid.style.setProperty("--reveal-delay", Math.min(i, MAX) * STEP + "ms");
      });
    });
    var lastParent = null, idx = 0;
    els.forEach(function (el) {
      if (el.hasAttribute("data-delay")) {
        el.style.setProperty("--reveal-delay", (parseInt(el.dataset.delay, 10) || 0) + "ms");
        return;
      }
      if (el.style.getPropertyValue("--reveal-delay")) return;
      if (el.closest("[data-stagger]")) return;
      if (el.parentElement !== lastParent) { lastParent = el.parentElement; idx = 0; }
      el.style.setProperty("--reveal-delay", Math.min(idx, 6) * STEP + "ms");
      idx++;
    });
  }
  function show(el) {
    el.classList.add("is-visible");
    if (el.classList.contains("reveal")) el.classList.add("visible");
  }
  function initScrollReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal, [data-reveal]"));
    if (!els.length) return;
    assignDelays(els);
    if (reduceMotion || !supportsIO) { els.forEach(show); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* Count-up stats */
  function withCommas(s) {
    var p = String(s).split(".");
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return p.join(".");
  }
  function render(el, v) {
    el.textContent = (el.dataset.prefix || "") +
      withCommas(v.toFixed(parseInt(el.dataset.decimals, 10) || 0)) +
      (el.dataset.suffix || "");
  }
  function animate(el) {
    var target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    if (reduceMotion) { render(el, target); return; }
    var dur = 1500, start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      render(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  function initCountUp() {
    var els = document.querySelectorAll(".count");
    if (!els.length) return;
    if (!supportsIO) { Array.prototype.forEach.call(els, function (el) { render(el, parseFloat(el.dataset.target) || 0); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(els, function (el) { obs.observe(el); });
  }

  /* Footer year */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* Demo contact form (no backend on GitHub Pages) */
  function initForm() {
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    if (!form || !note) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.hidden = false;
      form.reset();
    });
  }

  /* Pinned card stack — maps scroll through a tall container to a card reveal.
     Each card slides up and the next settles over it. Desktop + motion only;
     otherwise the cards fall back to the plain CSS column. */
  function initCardStack() {
    var scrolls = document.querySelectorAll("[data-card-stack]");
    if (!scrolls.length) return;
    var mq = window.matchMedia("(min-width: 801px)");
    Array.prototype.forEach.call(scrolls, function (scrollEl) {
      var sticky = scrollEl.querySelector(".diff-sticky");
      var cards = Array.prototype.slice.call(scrollEl.querySelectorAll(".diff-card"));
      if (!sticky || !cards.length) return;
      var n = cards.length, ticking = false, REVEAL = 0.86;
      function active() { return mq.matches && !reduceMotion; }
      function clearCards() {
        cards.forEach(function (c) { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; c.classList.remove("is-active"); });
      }
      function update() {
        ticking = false;
        if (!active()) { clearCards(); return; }
        var rect = scrollEl.getBoundingClientRect();
        var stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
        var dist = scrollEl.offsetHeight - sticky.offsetHeight;
        var p = dist > 0 ? (stickyTop - rect.top) / dist : 0;
        if (p < 0) p = 0; else if (p > 1) p = 1;
        var pr = p / REVEAL; if (pr > 1) pr = 1;
        var f = pr * (n - 1);
        var current = Math.round(f);
        cards.forEach(function (card, i) {
          var d = f - i, y, scale, opacity;
          if (d <= 0) {
            var t = d + 1; if (t < 0) t = 0;
            y = (1 - t) * 110;
            opacity = (t - 0.12) / 0.2; if (opacity < 0) opacity = 0; else if (opacity > 1) opacity = 1;
            scale = 0.96 + 0.04 * t;
          } else {
            var dd = d > 3 ? 3 : d;
            y = -dd * 18; scale = 1 - dd * 0.05; opacity = 1 - d * 0.7; if (opacity < 0) opacity = 0;
          }
          card.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + scale.toFixed(3) + ")";
          card.style.opacity = opacity.toFixed(3);
          card.style.zIndex = String(i + 1);
          card.classList.toggle("is-active", i === current);
        });
      }
      function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      if (mq.addEventListener) mq.addEventListener("change", update);
      update();
    });
  }

  function init() {
    initMobileNav();
    initHeaderScroll();
    initScrollReveal();
    initCountUp();
    initCardStack();
    initYear();
    initForm();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
