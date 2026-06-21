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

  /* Walking character: play the transparent VP9-alpha WebM where it's supported
     (Chrome / Edge / Firefox). Safari doesn't render alpha in WebM and
     reduced-motion users keep the still, so in those cases we leave the video's
     own poster frame in place rather than loading the clip. */
  function initCharVideo() {
    var video = document.getElementById("charVideo");
    if (!video) return;
    var ua = navigator.userAgent;
    var isSafari = /^((?!chrome|chromium|android|crios|fxios).)*safari/i.test(ua);
    if (reduceMotion || isSafari) return; // poster frame stays

    video.src = "assets/character-walk.webm";
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked → poster stays */ });
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

  function init() {
    initMobileNav();
    initHeaderScroll();
    initScrollReveal();
    initCountUp();
    initCharVideo();
    initYear();
    initForm();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
