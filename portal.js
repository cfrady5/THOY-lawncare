/* THOY Lawncare — employee portal.
   Auth + CRUD for site stats, text content, service photos, and the request
   inbox. All access is enforced server-side by Supabase Row Level Security;
   this script only drives the UI. */
(function () {
  "use strict";
  var cfg = window.THOY_SB;
  if (!cfg || !window.supabase) { alert("Config not loaded."); return; }
  var sb = window.supabase.createClient(cfg.url, cfg.anon);

  var SERVICES = ["mowing", "cleanup", "mulching", "edging"];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmtDate(s){ try { return new Date(s).toLocaleString(); } catch(e){ return s; } }
  function flash(el, ok, text){ el.className = "msg " + (ok?"ok":"err"); el.textContent = text; el.style.display="block"; setTimeout(function(){ el.style.display="none"; }, 3500); }

  /* ---------------- auth ---------------- */
  var loginView = $("#login"), dashView = $("#dash");
  function showDash(email){ loginView.hidden = true; dashView.hidden = false; $("#who").textContent = email; loadAll(); }
  function showLogin(){ dashView.hidden = true; loginView.hidden = false; }

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("#loginBtn"), msg = $("#loginMsg");
    btn.disabled = true; btn.textContent = "Signing in…"; msg.style.display = "none";
    sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value })
      .then(function (res) {
        btn.disabled = false; btn.textContent = "Sign in";
        if (res.error) { flash(msg, false, res.error.message); return; }
        gateAndEnter(res.data.user);
      });
  });

  function gateAndEnter(user){
    // confirm this account is on the employee allowlist (RLS returns rows only to employees)
    sb.from("employees").select("email").eq("email", user.email).then(function (res) {
      if (res.error || !res.data || !res.data.length) {
        flash($("#loginMsg"), false, "This account isn't authorized for the portal.");
        sb.auth.signOut(); return;
      }
      showDash(user.email);
    });
  }

  $("#signout").addEventListener("click", function () { sb.auth.signOut().then(showLogin); });

  sb.auth.getSession().then(function (res) {
    var s = res.data && res.data.session;
    if (s && s.user) gateAndEnter(s.user); else showLogin();
  });

  /* ---------------- tabs ---------------- */
  $$("#tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#tabs button").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      var t = b.getAttribute("data-tab");
      $$(".panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== t; });
    });
  });

  function loadAll(){ loadRequests(); loadStats(); loadContent(); loadPhotos(); }

  /* ---------------- requests ---------------- */
  function loadRequests(){
    var wrap = $("#reqList");
    sb.from("contact_messages").select("*").order("created_at", { ascending: false }).then(function (res) {
      if (res.error) { wrap.innerHTML = '<p class="empty">Could not load ('+esc(res.error.message)+').</p>'; return; }
      if (!res.data.length) { wrap.innerHTML = '<p class="empty">No requests yet.</p>'; return; }
      wrap.innerHTML = res.data.map(function (m) {
        var contact = [m.phone, m.email, m.address].filter(Boolean).map(esc).join(" · ");
        var opts = ["new","read","resolved","archived"].map(function (s) {
          return '<option value="'+s+'"'+(m.status===s?" selected":"")+'>'+s+'</option>';
        }).join("");
        return '<div class="card2 req '+esc(m.status)+'" data-id="'+m.id+'">'
          + '<div class="top"><span class="name">'+esc(m.name||"(no name)")+'</span><span class="meta">'+esc(fmtDate(m.created_at))+'</span></div>'
          + (contact ? '<div class="contact">'+contact+'</div>' : '')
          + (m.message ? '<div class="body">'+esc(m.message)+'</div>' : '')
          + '<div class="row-actions"><select class="req-status">'+opts+'</select>'
          + '<button class="btn-sm btn-danger req-del">Delete</button></div></div>';
      }).join("");
      $$(".req", wrap).forEach(function (card) {
        var id = card.getAttribute("data-id");
        $(".req-status", card).addEventListener("change", function (e) {
          sb.from("contact_messages").update({ status: e.target.value }).eq("id", id).then(function(r){
            if (!r.error) { card.className = "card2 req " + e.target.value; }
          });
        });
        $(".req-del", card).addEventListener("click", function () {
          if (!confirm("Delete this request?")) return;
          sb.from("contact_messages").delete().eq("id", id).then(function (r) { if (!r.error) card.remove(); });
        });
      });
    });
  }

  /* ---------------- stats ---------------- */
  var statsCache = [];
  function loadStats(){
    sb.from("site_stats").select("*").order("sort_order", { ascending: true }).then(function (res) {
      if (res.error) return;
      statsCache = res.data;
      $("#statsRows").innerHTML = res.data.map(function (s) {
        return '<div class="grid-stats" data-id="'+s.id+'">'
          + '<div class="fld"><label>Label</label><input class="s-label" value="'+esc(s.label)+'"></div>'
          + '<div class="fld"><label>Number</label><input class="s-value" type="number" value="'+esc(s.value)+'"></div>'
          + '<div class="fld"><label>Suffix</label><input class="s-suffix" value="'+esc(s.suffix)+'"></div>'
          + '</div>';
      }).join("");
    });
  }
  $("#saveStats").addEventListener("click", function () {
    var rows = $$("#statsRows .grid-stats");
    var ups = rows.map(function (r) {
      return sb.from("site_stats").update({
        label: $(".s-label", r).value,
        value: parseInt($(".s-value", r).value, 10) || 0,
        suffix: $(".s-suffix", r).value,
        updated_at: new Date().toISOString()
      }).eq("id", r.getAttribute("data-id"));
    });
    Promise.all(ups).then(function (results) {
      var bad = results.filter(function (x) { return x.error; });
      flash($("#statsMsg"), !bad.length, bad.length ? bad[0].error.message : "Saved.");
    });
  });

  /* ---------------- content ---------------- */
  function loadContent(){
    sb.from("site_content").select("key,value").then(function (res) {
      if (res.error) return;
      var map = {}; res.data.forEach(function (r) { map[r.key] = r.value; });
      $$("[data-key]").forEach(function (el) { if (map[el.getAttribute("data-key")] != null) el.value = map[el.getAttribute("data-key")]; });
    });
  }
  $("#saveContent").addEventListener("click", function () {
    var rows = $$("[data-key]").map(function (el) {
      return { key: el.getAttribute("data-key"), value: el.value, updated_at: new Date().toISOString() };
    });
    sb.from("site_content").upsert(rows, { onConflict: "key" }).then(function (r) {
      flash($("#contentMsg"), !r.error, r.error ? r.error.message : "Saved.");
    });
  });

  /* ---------------- service photos ---------------- */
  function loadPhotos(){
    var host = $("#photoServices");
    host.innerHTML = SERVICES.map(function (svc) {
      return '<div class="card2 photos-svc" data-svc="'+svc+'">'
        + '<h3>'+svc+'</h3>'
        + '<div class="row-actions"><label class="btn-sm btn-out" style="cursor:pointer">Add photos'
        + '<input type="file" accept="image/*" multiple hidden class="up-input"></label>'
        + '<span class="uploading" data-up hidden></span></div>'
        + '<div class="photo-grid" data-grid><p class="empty">Loading…</p></div></div>';
    }).join("");
    $$(".photos-svc").forEach(function (block) {
      var svc = block.getAttribute("data-svc");
      $(".up-input", block).addEventListener("change", function (e) { uploadPhotos(svc, e.target.files, block); e.target.value = ""; });
      renderPhotos(svc, block);
    });
  }

  function renderPhotos(svc, block){
    var grid = $("[data-grid]", block);
    sb.from("service_photos").select("*").eq("service", svc).order("sort_order", { ascending: true }).then(function (res) {
      if (res.error) { grid.innerHTML = '<p class="empty">'+esc(res.error.message)+'</p>'; return; }
      if (!res.data.length) { grid.innerHTML = '<p class="empty">No photos yet.</p>'; return; }
      grid.innerHTML = res.data.map(function (p) {
        return '<div class="photo" data-id="'+p.id+'"><img src="'+esc(p.image)+'" alt="">'
          + '<div class="pf"><label><input type="checkbox" class="p-pub"'+(p.published?" checked":"")+'>Live</label>'
          + '<button class="btn-sm btn-danger p-del" style="padding:5px 10px">Delete</button></div></div>';
      }).join("");
      $$(".photo", grid).forEach(function (pel) {
        var id = pel.getAttribute("data-id");
        var img = $("img", pel).getAttribute("src");
        $(".p-pub", pel).addEventListener("change", function (e) {
          sb.from("service_photos").update({ published: e.target.checked }).eq("id", id);
        });
        $(".p-del", pel).addEventListener("click", function () {
          if (!confirm("Delete this photo?")) return;
          sb.from("service_photos").delete().eq("id", id).then(function (r) {
            if (r.error) return;
            var path = img.split("/service-photos/")[1];
            if (path) sb.storage.from("service-photos").remove([decodeURIComponent(path)]);
            pel.remove();
          });
        });
      });
    });
  }

  function uploadPhotos(svc, files, block){
    if (!files || !files.length) return;
    var note = $("[data-up]", block); note.hidden = false;
    var list = Array.prototype.slice.call(files);
    var i = 0, done = 0;
    (function next(){
      if (i >= list.length) { note.hidden = true; renderPhotos(svc, block); return; }
      var file = list[i++];
      note.textContent = "Uploading " + i + " of " + list.length + "…";
      var safe = file.name.replace(/[^\w.\-]+/g, "_");
      var path = svc + "/" + Date.now() + "_" + safe;
      sb.storage.from("service-photos").upload(path, file, { cacheControl: "3600", upsert: false }).then(function (up) {
        if (up.error) { alert("Upload failed: " + up.error.message); note.hidden = true; return; }
        var pub = sb.storage.from("service-photos").getPublicUrl(path);
        return sb.from("service_photos").insert({
          service: svc, image: pub.data.publicUrl, alt: svc + " photo", sort_order: Date.now(), published: true
        }).then(function (ins) { if (ins.error) alert("Save failed: " + ins.error.message); done++; next(); });
      });
    })();
  }

  // keep UI in sync if the session ends in another tab
  sb.auth.onAuthStateChange(function (evt, session) {
    if (!session) showLogin();
  });
})();
