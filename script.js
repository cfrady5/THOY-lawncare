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

  /* Horizontal galleries (Services page) — auto-scroll, click to pause/resume,
     seamless loop (children cloned), arrow controls. */
  function initGalleries() {
    document.querySelectorAll(".gallery-wrap").forEach(function (wrap) {
      var track = wrap.querySelector(".gallery");
      var prev = wrap.querySelector(".gallery-nav.prev");
      var next = wrap.querySelector(".gallery-nav.next");
      if (!track || !track.children.length) return;

      var n = track.children.length;
      // clone the set once so the strip can loop seamlessly
      for (var i = 0; i < n; i++) track.appendChild(track.children[i].cloneNode(true));

      function loopW() { return track.children[n].offsetLeft - track.children[0].offsetLeft; }
      function step() {
        var first = track.querySelector(".shot");
        return first ? first.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
      }

      var paused = reduce;          // reduced-motion users start paused (static)
      var pos = 0;                  // float accumulator (scrollLeft rounds to int)
      var SPEED = 32;               // px per second
      var last = 0;
      function frame(now) {
        if (!last) last = now;
        var dt = Math.min(now - last, 50); // clamp so tab-throttle gaps don't jump
        last = now;
        if (!paused) {
          var w = loopW();
          pos += SPEED * dt / 1000;
          if (w > 0 && pos >= w) pos -= w;
          track.scrollLeft = pos;
        }
        requestAnimationFrame(frame);
      }
      function nudge(dir) {
        var w = loopW();
        pos += dir * step();
        if (w > 0) pos = ((pos % w) + w) % w;
        track.scrollLeft = pos;
      }

      // click the gallery to stop; click again to resume
      track.addEventListener("click", function () {
        paused = !paused;
        wrap.classList.toggle("paused", paused);
        if (!paused) pos = track.scrollLeft;   // resync after manual browsing
      });
      if (prev) prev.addEventListener("click", function (e) { e.stopPropagation(); nudge(-1); });
      if (next) next.addEventListener("click", function (e) { e.stopPropagation(); nudge(1); });

      if (!reduce) requestAnimationFrame(frame);
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
