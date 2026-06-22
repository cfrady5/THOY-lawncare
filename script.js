/* THOY Lawncare — interactions (clean rebuild). No dependencies. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* Mobile nav */
  function initNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMobile");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky-nav shadow after scrolling */
  function initStickyNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal with staggering inside [data-stagger] groups */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var kids = group.querySelectorAll(":scope > [data-reveal]");
      Array.prototype.forEach.call(kids, function (kid, i) {
        kid.style.setProperty("--rd", Math.min(i, 8) * 80 + "ms");
      });
    });
    if (reduce || !hasIO) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* Count-up stats */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target) || 0;
    if (reduce) { el.textContent = target; return; }
    var dur = 1400, start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  function initCounters() {
    var els = document.querySelectorAll(".count");
    if (!els.length) return;
    if (!hasIO) { els.forEach(function (el) { el.textContent = el.dataset.target; }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* Demo contact form */
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

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* Horizontal galleries (Services page) — seamless CSS marquee loop (compositor
     driven, never stalls), click anywhere to pause/resume. */
  function initGalleries() {
    document.querySelectorAll(".gallery").forEach(function (gallery) {
      var shots = Array.prototype.slice.call(gallery.querySelectorAll(":scope > .shot"));
      if (!shots.length) return;
      var wrap = gallery.closest(".gallery-wrap") || gallery;

      // move shots into a track and clone the set once for a seamless -50% loop
      var track = document.createElement("div");
      track.className = "gallery-track";
      shots.forEach(function (s) { track.appendChild(s); });
      shots.forEach(function (s) { track.appendChild(s.cloneNode(true)); });
      gallery.appendChild(track);

      function setDuration() {              // keep a consistent ~45px/sec speed
        var half = track.scrollWidth / 2;
        track.style.animationDuration = Math.max(14, half / 45) + "s";
      }
      setDuration();
      window.addEventListener("resize", setDuration);

      // click the gallery to stop the loop; click again to resume
      gallery.addEventListener("click", function () {
        var paused = gallery.classList.toggle("paused-anim");
        wrap.classList.toggle("paused", paused);
      });
    });
  }

  function init() {
    initNav();
    initStickyNav();
    initReveal();
    initCounters();
    initForm();
    initYear();
    initGalleries();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
