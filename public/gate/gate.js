/* ============================================================================
   بوابة مواقع العملاء — إبراهيم سعود
   ملف واحد يُضاف لأي موقع عميل:
     <script src="/gate/gate.js" data-site="manabir"></script>
   أو بخريطة مسارات لموقع فيه أكثر من مشروع:
     <script src="/gate/gate.js" data-map='{"/sarah":"sarah"}'></script>

   وظيفته:
   ١) يقيس الزيارات (بلا أي بيانات شخصية) ويرسلها لنظامك.
   ٢) إن كان الموقع مقفلاً: يُغبّش الموقع كاملاً ويترك «عدسة» يحرّكها الزائر
      فيرى تحتها أجزاء واضحة فقط — ولا يستطيع التصفّح أو النسخ،
      وفي الزاوية زر واتساب يوصله إليك مباشرة (ويصلك إشعار في النظام).
   ============================================================================ */
(function () {
  "use strict";

  var ME = document.currentScript;
  if (!ME) return;
  var BASE = ME.src.replace(/gate\.js(\?.*)?$/, "");
  var SLUG = ME.getAttribute("data-site") || "";

  /* خريطة مسارات لموقع فيه أكثر من مشروع */
  if (!SLUG) {
    var raw = ME.getAttribute("data-map");
    if (raw) {
      try {
        var map = JSON.parse(raw);
        for (var prefix in map) {
          if (Object.prototype.hasOwnProperty.call(map, prefix) &&
              location.pathname.indexOf(prefix) === 0) { SLUG = map[prefix]; break; }
        }
      } catch (e) { /* خريطة غير صالحة: لا تفعل شيئاً */ }
    }
  }
  if (!SLUG) return;   /* مسار خارج البوابة: لا حجب ولا قياس */

  var API = "https://rrerwhhxrjyzmnnjsfev.supabase.co/rest/v1";
  var KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";
  var HDR = { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" };

  var CACHE_KEY = "gate:" + SLUG;
  var OWNER_KEY = "gate-owner:" + SLUG;
  var VISITOR_KEY = "gate-vid";
  var CACHE_MS = 5 * 60 * 1000;   /* مدة الاعتماد على آخر حالة معروفة عند انقطاع الشبكة */
  var TIMEOUT = 6000;

  /* ------------------------------------------------------------------ أدوات */
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  function post(path, body) {
    return fetch(API + path, { method: "POST", headers: HDR, body: JSON.stringify(body), keepalive: true });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function visitorId() {
    var v = ls(VISITOR_KEY);
    if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); ls(VISITOR_KEY, v); }
    return v;
  }

  /* مفتاح المعاينة: يصل مرة واحدة في الرابط ثم يُحفظ ويُمسح من شريط العنوان */
  function ownerKey() {
    var m = /[?&]k=([A-Za-z0-9]+)/.exec(location.search);
    if (m) {
      ls(OWNER_KEY, m[1]);
      try {
        var clean = location.href.replace(/([?&])k=[A-Za-z0-9]+&?/, "$1").replace(/[?&]$/, "");
        history.replaceState(null, "", clean);
      } catch (e) { /* تجاهل */ }
      return m[1];
    }
    return ls(OWNER_KEY) || "";
  }

  /* ------------------------------------------------- حجب الصفحة حتى التحقق */
  var hold = document.createElement("style");
  hold.textContent =
    ".gate-hold body{visibility:hidden!important}" +
    ".gate-hold::after{content:'';position:fixed;inset:0;background:#0b0b0d;z-index:2147483000}";
  document.documentElement.className += " gate-hold";
  (document.head || document.documentElement).appendChild(hold);

  function release() {
    document.documentElement.className = document.documentElement.className.replace(/\bgate-hold\b/g, "");
    if (hold.parentNode) hold.parentNode.removeChild(hold);
  }

  /* ------------------------------------------------------------- قياس الزيارة */
  function track() {
    if (ls("gate-notrack")) return;
    try {
      post("/site_visits", {
        slug: SLUG,
        path: location.pathname + location.hash,
        ref: document.referrer ? document.referrer.slice(0, 300) : "",
        device: matchMedia("(max-width:820px)").matches ? "mobile" : "desktop",
        visitor: visitorId()
      })["catch"](function () { });
    } catch (e) { /* لا يعطّل الموقع أبداً */ }
  }

  /* ------------------------------------------------------------ سؤال البوابة */
  function ask() {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    return fetch(API + "/rpc/gate_state", {
      method: "POST",
      headers: HDR,
      body: JSON.stringify({ p_slug: SLUG, p_key: ownerKey() }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      /* البوابة غير مُنصَّبة بعد أو إعداد ناقص: لا نُعطّل موقع العميل */
      if (r.status === 404 || r.status === 400 || r.status === 401 || r.status === 403) return null;
      if (!r.ok) throw new Error("gate " + r.status);
      return r.json();
    }).then(function (rows) {
      if (rows === null) return { state: "open", note: "", owner: false, setup: true };
      var row = (rows && rows[0]) || null;
      if (!row) return { state: "open", note: "", owner: false, unknown: true };  /* موقع غير مسجّل = مفتوح */
      ls(CACHE_KEY, JSON.stringify({ s: row.state, n: row.note, w: row.wa, t: Date.now() }));
      return row;
    })["catch"](function () {
      clearTimeout(timer);
      /* انقطاع الشبكة: نعتمد آخر حالة معروفة إن كانت حديثة، وإلا نُبقي الباب مغلقاً */
      var c = ls(CACHE_KEY);
      if (c) {
        try {
          var o = JSON.parse(c);
          return { state: o.s, note: o.n, wa: o.w, owner: false, stale: Date.now() - o.t >= CACHE_MS };
        } catch (e) { /* تجاهل */ }
      }
      return { state: "locked", note: "", owner: false, offline: true };
    });
  }

  /* ============================================================================
     شاشة القفل — الموقع مغبّش، وعدسة تُحرَّك فتكشف ما تحتها
     ========================================================================== */
  function lock(note, wa, offline) {
    var css = document.createElement("style");
    css.textContent = GATE_CSS;
    (document.head || document.documentElement).appendChild(css);

    var phone = String(wa || "966504895213").replace(/[^0-9]/g, "");
    var waText = encodeURIComponent("السلام عليكم، شفت الموقع من العدسة وأبغى أشوفه كامل.");
    var waLink = "https://wa.me/" + phone + "?text=" + waText;

    var root = document.createElement("div");
    root.id = "gateLens";
    root.setAttribute("dir", "rtl");
    root.innerHTML =
      '<div class="gl-veil" id="glVeil"></div>' +
      '<div class="gl-loupe" id="glLoupe">' +
        '<div class="gl-glass"></div>' +
        '<div class="gl-shine"></div>' +
        '<div class="gl-fringe"></div>' +
        '<div class="gl-ring">' +
          '<div class="gl-edge-out"></div>' +
          '<div class="gl-edge-in"></div>' +
          '<svg class="gl-engrave" viewBox="0 0 200 200" aria-hidden="true">' +
            '<defs><path id="glArc" d="M 14,100 A 86,86 0 0 0 186,100"></path></defs>' +
            '<text class="gl-en-dark"><textPath href="#glArc" startOffset="50%" text-anchor="middle">اضغط للتوسيع</textPath></text>' +
            '<text class="gl-en-light" dy="1"><textPath href="#glArc" startOffset="50%" text-anchor="middle">اضغط للتوسيع</textPath></text>' +
          "</svg>" +
        "</div>" +
      "</div>" +
      '<div class="gl-badge" id="glBadge">' +
        '<span class="gl-lock"></span><span>نسخة معاينة — حرّك العدسة</span>' +
      "</div>" +
      (note ? '<div class="gl-note">' + esc(note) + "</div>" : "") +
      '<a class="gl-wa" id="glWa" href="' + esc(waLink) + '" target="_blank" rel="noopener">' +
        '<span class="gl-wa-ico"></span><span>تواصل معي لفتح الموقع</span>' +
      "</a>";

    document.documentElement.className += " gate-locked";
    /* خارج <body> عمداً حتى لا تتأثر بأي تحويلات في الصفحة */
    document.documentElement.appendChild(root);
    release();

    /* منع أي تفاعل أو نسخ من الصفحة خلف الطبقة */
    ["contextmenu", "copy", "cut", "selectstart", "dragstart"].forEach(function (ev) {
      document.addEventListener(ev, function (e) { e.preventDefault(); }, true);
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && /^[usSpPcCaA]$/.test(e.key)) e.preventDefault();
    }, true);

    /* ------------------------------------------- حركة العدسة وتكبيرها بالضغط */
    var x = innerWidth / 2, y = innerHeight * 0.42;     /* الموضع الحالي */
    var tx = x, ty = y;                                  /* الموضع المطلوب */
    var moved = false, dragging = false;

    function baseR() {
      var v = Math.min(innerWidth, innerHeight);
      return innerWidth < 640 ? Math.min(v * 0.26, 118) : Math.min(v * 0.19, 132);
    }
    var r = baseR(), rT = r;

    function place() {
      root.style.setProperty("--x", x.toFixed(1) + "px");
      root.style.setProperty("--y", y.toFixed(1) + "px");
      root.style.setProperty("--r", r.toFixed(1) + "px");
    }
    place();

    var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    (function loop() {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      r += (rT - r) * 0.18;
      place();
      requestAnimationFrame(loop);
    })();

    /* كلما زاد ضغط الإصبع/الماوس اتّسعت العدسة وشاهد أكثر */
    function grow(pressure) {
      var p = (typeof pressure === "number" && pressure > 0 && pressure < 1) ? pressure : 0.5;
      rT = Math.min(baseR() * (1.5 + p * 1.1), Math.min(innerWidth, innerHeight) * 0.46);
      root.classList.add("pressing");
    }
    function shrink() {
      rT = baseR();
      root.classList.remove("pressing");
    }

    function moveTo(px, py) {
      tx = Math.max(0, Math.min(innerWidth, px));
      ty = Math.max(0, Math.min(innerHeight, py));
      if (!moved) {
        moved = true;
        var b = document.getElementById("glBadge");
        if (b) setTimeout(function () { b.classList.add("out"); }, 1600);
      }
    }

    root.addEventListener("pointermove", function (e) {
      if (e.pointerType === "mouse" || dragging) moveTo(e.clientX, e.clientY);
      if (dragging) grow(e.pressure);
    }, { passive: true });

    root.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".gl-wa")) return;
      dragging = true;
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* تجاهل */ }
      moveTo(e.clientX, e.clientY);
      grow(e.pressure);
    });
    root.addEventListener("pointerup", function () { dragging = false; shrink(); });
    root.addEventListener("pointercancel", function () { dragging = false; shrink(); });
    root.addEventListener("pointerleave", function () { dragging = false; shrink(); });

    /* دعم Force Touch على أجهزة آبل */
    root.addEventListener("webkitmouseforcechanged", function (e) {
      if (dragging && e.webkitForce) grow(Math.min(1, (e.webkitForce - 1) / 2));
    });

    /* إيماءة تعريفية: العدسة تتجوّل قليلاً حتى يلمسها الزائر */
    if (!reduce) {
      var t0 = Date.now();
      (function drift() {
        if (moved) return;
        var e = (Date.now() - t0) / 1000;
        tx = innerWidth / 2 + Math.sin(e * 0.7) * Math.min(180, innerWidth * 0.16);
        ty = innerHeight * 0.42 + Math.cos(e * 0.5) * Math.min(90, innerHeight * 0.08);
        requestAnimationFrame(drift);
      })();
    }

    window.addEventListener("resize", function () {
      tx = Math.min(tx, innerWidth); ty = Math.min(ty, innerHeight);
      if (!dragging) rT = baseR();
    });

    /* ------------------------------------------- زر واتساب */
    document.getElementById("glWa").addEventListener("click", function () {
      post("/site_knocks", { slug: SLUG, msg: "طلب فتح عبر واتساب — " + location.pathname })["catch"](function () { });
    });
  }

  /* ------------------------------------------------------------ نمط الشاشة */
  var GATE_CSS = [
    ".gate-locked{overflow:hidden!important}",
    ".gate-locked body{overflow:hidden!important;pointer-events:none!important;",
    "user-select:none!important;-webkit-user-select:none!important}",

    /* لا opacity/transform/filter على هذا العنصر — أي منها يُلغي تأثير التغبيش لما تحته */
    "#gateLens{--r:120px;--x:50vw;--y:42vh;",
    "position:fixed;inset:0;z-index:2147483001;pointer-events:auto;cursor:none;",
    "font-family:'IBM Plex Sans Arabic','Segoe UI',system-ui,sans-serif;color:#fff}",
    "@media (pointer:coarse){#gateLens{cursor:default}}",

    /* طبقة التغبيش فوق الموقع، وفيها فتحة دائرية تكشف ما تحتها بوضوح كامل (بلا تحجيم) */
    ".gl-veil{position:absolute;inset:0;",
    "background:rgba(10,14,18,.14);",
    "-webkit-backdrop-filter:blur(7px) saturate(.92);",
    "backdrop-filter:blur(7px) saturate(.92);",
    "-webkit-mask:radial-gradient(circle calc(var(--r) * 1.005) at var(--x) var(--y),transparent 0 99%,#000 100%);",
    "mask:radial-gradient(circle calc(var(--r) * 1.005) at var(--x) var(--y),transparent 0 99%,#000 100%)}",

    /* جسم العدسة: قطر الزجاج = 2r ، والحلقة حوله بسماكة ٢٨٪ */
    ".gl-loupe{position:absolute;left:var(--x);top:var(--y);",
    "width:calc(var(--r)*2.78);height:calc(var(--r)*2.78);",
    "transform:translate(-50%,-50%);pointer-events:none;",
    "filter:drop-shadow(0 26px 40px rgba(0,0,0,.6)) drop-shadow(0 6px 12px rgba(0,0,0,.45))}",
    "#gateLens.pressing .gl-loupe{filter:drop-shadow(0 34px 52px rgba(0,0,0,.66)) drop-shadow(0 8px 16px rgba(0,0,0,.5))}",
    "#gateLens.pressing .gl-fringe{opacity:1}",

    /* الحلقة ثلاثية الأبعاد */
    ".gl-ring{position:absolute;inset:0;border-radius:50%;",
    "background:",
    "radial-gradient(52% 34% at 50% 3%,rgba(255,255,255,.62),rgba(255,255,255,0) 58%),",
    "radial-gradient(44% 26% at 50% 99%,rgba(255,255,255,.26),rgba(255,255,255,0) 62%),",
    "radial-gradient(30% 60% at 2% 50%,rgba(255,255,255,.12),rgba(255,255,255,0) 60%),",
    "conic-gradient(from 212deg,#5a5a63,#1a1a1f 10%,#41414b 24%,#0e0e12 40%,#4e4e59 56%,#141418 72%,#3c3c45 86%,#5a5a63);",
    "-webkit-mask:radial-gradient(circle closest-side,transparent 0 71.4%,#000 72%);",
    "mask:radial-gradient(circle closest-side,transparent 0 71.4%,#000 72%);",
    /* حافة علوية مضيئة وسفلية غامقة = إحساس الأسطوانة */
    "box-shadow:inset 0 3px 4px rgba(255,255,255,.3),inset 0 -5px 9px rgba(0,0,0,.72),",
    "inset 0 0 0 1px rgba(0,0,0,.5)}",

    /* الحافة الخارجية: خيط ضوء رفيع يلفّ الحلقة */
    ".gl-edge-out{position:absolute;inset:0;border-radius:50%;",
    "background:conic-gradient(from 250deg,rgba(255,255,255,.65),rgba(255,255,255,.06) 26%,",
    "rgba(255,255,255,.34) 50%,rgba(255,255,255,.04) 74%,rgba(255,255,255,.6));",
    "-webkit-mask:radial-gradient(circle closest-side,transparent 0 98.4%,#000 99%);",
    "mask:radial-gradient(circle closest-side,transparent 0 98.4%,#000 99%)}",

    /* الجدار الداخلي: مقلوب الإضاءة (غامق أعلى، فاتح أسفل) فيبدو مقعّراً */
    ".gl-edge-in{position:absolute;inset:0;border-radius:50%;",
    "background:linear-gradient(180deg,rgba(0,0,0,.85),rgba(255,255,255,.28));",
    "-webkit-mask:radial-gradient(circle closest-side,transparent 0 71.4%,#000 72% 75.5%,transparent 77%);",
    "mask:radial-gradient(circle closest-side,transparent 0 71.4%,#000 72% 75.5%,transparent 77%)}",

    /* النقش العربي على الحلقة (خط ثمانية إن توفّر) */
    "@font-face{font-family:'Thmanyah Gate';src:url('/fonts/thmanyah/thmanyahsans-Bold.woff2') format('woff2');font-weight:700;font-display:swap}",
    ".gl-engrave{position:absolute;inset:0;width:100%;height:100%;overflow:visible}",
    ".gl-engrave text{font-family:'Thmanyah Gate','IBM Plex Sans Arabic',system-ui,sans-serif;",
    "font-size:13px;font-weight:700;letter-spacing:.5px}",
    ".gl-en-dark{fill:rgba(0,0,0,.78)}",
    ".gl-en-light{fill:rgba(255,255,255,.34)}",

    /* الحافة الطيفية عند التقاء الزجاج بالحلقة */
    ".gl-fringe{position:absolute;inset:0;border-radius:50%;opacity:.85;mix-blend-mode:screen;",
    "background:conic-gradient(from 30deg,rgba(255,60,120,.6),rgba(255,200,60,.5) 18%,",
    "rgba(80,255,180,.5) 36%,rgba(70,170,255,.6) 55%,rgba(180,90,255,.55) 72%,rgba(255,60,120,.6));",
    "-webkit-mask:radial-gradient(circle closest-side,transparent 0 69%,#000 71% 73%,transparent 75%);",
    "mask:radial-gradient(circle closest-side,transparent 0 69%,#000 71% 73%,transparent 75%)}",

    /* زجاج العدسة: يزيد الوضوح قليلاً ويظلّل الحافة فقط */
    ".gl-glass{position:absolute;left:50%;top:50%;width:72%;height:72%;transform:translate(-50%,-50%);",
    "border-radius:50%;pointer-events:none;",
    "-webkit-backdrop-filter:saturate(1.1) contrast(1.03);backdrop-filter:saturate(1.1) contrast(1.03);",
    "background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0) 72%,rgba(0,0,0,.1) 94%,rgba(0,0,0,.2) 100%);",
    "box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}",

    /* لمعة زجاجية علوية */
    ".gl-shine{position:absolute;left:50%;top:50%;width:72%;height:72%;transform:translate(-50%,-50%);",
    "border-radius:50%;pointer-events:none;",
    "background:radial-gradient(52% 28% at 32% 16%,rgba(255,255,255,.3),transparent 66%),",
    "radial-gradient(34% 16% at 70% 86%,rgba(255,255,255,.12),transparent 70%)}",

    /* شارة علوية */
    ".gl-badge{position:absolute;top:22px;left:50%;transform:translateX(-50%);pointer-events:none;",
    "display:flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:999px;",
    "background:rgba(18,20,24,.62);border:1px solid rgba(255,255,255,.16);",
    "-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);",
    "font-size:12.5px;font-weight:600;letter-spacing:-.01em;",
    "box-shadow:0 10px 26px rgba(0,0,0,.4);transition:opacity .6s,transform .6s}",
    ".gl-badge.out{opacity:0;transform:translateX(-50%) translateY(-8px)}",
    ".gl-lock{width:13px;height:13px;background:currentColor;flex:none;",
    "-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round'%3E%3Crect x='4' y='10.5' width='16' height='10.5' rx='2.5'/%3E%3Cpath d='M8 10.5V7.6a4 4 0 0 1 8 0v2.9'/%3E%3C/svg%3E\") center/contain no-repeat;",
    "mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round'%3E%3Crect x='4' y='10.5' width='16' height='10.5' rx='2.5'/%3E%3Cpath d='M8 10.5V7.6a4 4 0 0 1 8 0v2.9'/%3E%3C/svg%3E\") center/contain no-repeat}",

    /* رسالة اختيارية من النظام */
    ".gl-note{position:absolute;top:70px;left:50%;transform:translateX(-50%);pointer-events:none;",
    "max-width:min(420px,86vw);text-align:center;font-size:12.5px;line-height:1.9;",
    "color:rgba(255,255,255,.82);text-shadow:0 2px 10px rgba(0,0,0,.6)}",

    /* زر واتساب */
    ".gl-wa{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom));right:20px;",
    "display:inline-flex;align-items:center;gap:9px;",
    "height:48px;padding:0 20px;border-radius:999px;text-decoration:none;color:#fff;cursor:pointer;",
    "background:linear-gradient(180deg,#2ad36a,#14a94e);border:1px solid rgba(255,255,255,.25);",
    "font-size:14px;font-weight:600;pointer-events:auto;",
    "box-shadow:0 14px 34px rgba(20,169,78,.42),inset 0 1px 0 rgba(255,255,255,.35);",
    "animation:glPop .6s .5s cubic-bezier(.2,.9,.2,1) both;transition:transform .18s,box-shadow .2s}",
    ".gl-wa:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(20,169,78,.55),inset 0 1px 0 rgba(255,255,255,.35)}",
    ".gl-wa:active{transform:scale(.97)}",
    ".gl-wa-ico{width:20px;height:20px;flex:none;background:currentColor;",
    "-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.7.7-2.5-.3-.4A8 8 0 0 1 12 4m-3.4 4.3c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5v-.5l-.9-2c-.2-.5-.4-.5-.6-.5z'/%3E%3C/svg%3E\") center/contain no-repeat;",
    "mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.7.7-2.5-.3-.4A8 8 0 0 1 12 4m-3.4 4.3c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5v-.5l-.9-2c-.2-.5-.4-.5-.6-.5z'/%3E%3C/svg%3E\") center/contain no-repeat}",

    "@keyframes glPop{from{opacity:0;transform:translateY(16px)}}",
    "@media (max-width:640px){",
    ".gl-wa{right:12px;bottom:calc(12px + env(safe-area-inset-bottom));height:46px;padding:0 16px;font-size:13px}",
    ".gl-badge{font-size:11.5px;height:32px;padding:0 13px}}",
    "@media (prefers-reduced-motion:reduce){#gateLens,.gl-wa{animation:none!important}}"
  ].join("");

  /* ------------------------------------------------------------------ التشغيل */
  function start() {
    ask().then(function (r) {
      if (r.owner) { ls("gate-notrack", "1"); release(); return; }   /* معاينتك أنت: بلا قياس وبلا قفل */
      if (r.state === "locked") {
        var run = function () { lock(r.note, r.wa, r.offline); };
        if (document.body) run(); else document.addEventListener("DOMContentLoaded", run);
        return;
      }
      release();
      track();
    })["catch"](function () { release(); });
  }

  start();

  /* شبكة أمان: لا يبقى الموقع محجوباً لو حدث خطأ غير متوقع */
  setTimeout(function () {
    if (/gate-hold/.test(document.documentElement.className) && !document.getElementById("gateLens")) release();
  }, TIMEOUT + 2500);

  /* معاينة الشكل فقط (تُستخدم من نظامك) — لا تفتح ولا تقفل شيئاً */
  window.__gatePeek = function (note) {
    if (document.getElementById("gateLens")) return;
    lock(note || "", "", false);
  };
})();
