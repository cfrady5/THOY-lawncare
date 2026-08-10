/* THOY Lawncare — public site dynamic content (progressive enhancement).
   Reads editable content/stats/photos from Supabase and wires the contact
   form. If Supabase or the config is unavailable, the page silently keeps its
   hard-coded content, so the site never breaks. */
(function () {
  "use strict";

  var cfg = window.THOY_SB;
  var sb = null;
  if (cfg && cfg.url && cfg.anon && window.supabase) {
    try { sb = window.supabase.createClient(cfg.url, cfg.anon); } catch (e) { sb = null; }
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---- editable text (hero, about, contact info) ---- */
  function applyContent(map) {
    document.querySelectorAll("[data-content]").forEach(function (el) {
      var v = map[el.getAttribute("data-content")];
      if (v != null && v !== "") el.textContent = v;
    });
  }

  /* ---- stats (four cards, matched to DB rows by order) ---- */
  function applyStats(rows) {
    var stats = document.querySelectorAll(".stats-grid .stat");
    if (!stats.length) return;
    rows.forEach(function (row, i) {
      var el = stats[i];
      if (!el) return;
      var count = el.querySelector(".count");
      if (count) { count.setAttribute("data-target", row.value); count.textContent = "0"; }
      var suf = el.querySelector(".stat-suffix");
      if (suf) suf.textContent = row.suffix || "";
      var label = el.querySelector(".stat-label");
      if (label) label.textContent = row.label || "";
    });
  }

  /* ---- service galleries (rebuilt from DB photos when present) ---- */
  function applyServicePhotos() {
    var galleries = document.querySelectorAll(".gallery[data-service]");
    galleries.forEach(function (g) {
      var service = g.getAttribute("data-service");
      sb.from("service_photos").select("image,alt").eq("service", service)
        .eq("published", true).order("sort_order", { ascending: true })
        .then(function (res) {
          if (res.error || !res.data || !res.data.length) return; // keep placeholders
          g.innerHTML = res.data.map(function (p) {
            return '<div class="shot"><img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" loading="lazy" /></div>';
          }).join("");
          delete g.dataset.marquee;
          if (window.THOY && window.THOY.setupGallery) window.THOY.setupGallery(g);
        });
    });
  }

  /* ---- contact form -> contact_messages ---- */
  function wireForm() {
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var payload = {
        name: (form.name && form.name.value || "").trim(),
        phone: (form.phone && form.phone.value || "").trim(),
        email: (form.email && form.email.value || "").trim(),
        address: (form.address && form.address.value || "").trim(),
        message: (form.message && form.message.value || "").trim()
      };
      if (!payload.name) { if (form.name) form.name.focus(); return; }

      function done(ok) {
        if (note) {
          note.hidden = false;
          note.textContent = ok
            ? "Thanks! Your request came through — we'll get right back to you."
            : "Sorry, something went wrong. Please call or email us and we'll help right away.";
        }
        if (ok) form.reset();
        if (btn) { btn.disabled = false; btn.textContent = "Send Request"; }
      }

      if (!sb) { done(true); return; } // no backend: still acknowledge
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      sb.from("contact_messages").insert(payload).then(function (res) {
        done(!res.error);
      });
    });
  }

  function loadData() {
    if (!sb) return;
    sb.from("site_content").select("key,value").then(function (res) {
      if (!res.error && res.data) {
        var map = {};
        res.data.forEach(function (r) { map[r.key] = r.value; });
        applyContent(map);
      }
    });
    sb.from("site_stats").select("label,value,suffix,sort_order")
      .order("sort_order", { ascending: true }).then(function (res) {
        if (!res.error && res.data) applyStats(res.data);
      });
    applyServicePhotos();
  }

  function init() { loadData(); wireForm(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
