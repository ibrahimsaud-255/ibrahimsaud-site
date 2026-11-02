/* شريط المعاينة لنسخ العرض على ibrahimsaud.com/demo/ — زجاج بأسلوب آبل.
   <script src="/demo/bar.js" data-name="..." data-front="/demo/x/" data-dash="/demo/x/dash/"></script>
   بدون data-front يظهر زرّ الرجوع واسم النسخة فقط. */
(function () {
  if (window.__isbar) return; window.__isbar = 1;
  var s = document.currentScript || (function () { var a = document.getElementsByTagName('script'); return a[a.length - 1]; })();
  var name = (s && s.getAttribute('data-name')) || '';
  var front = (s && s.getAttribute('data-front')) || '';
  var dash = (s && s.getAttribute('data-dash')) || '';
  var back = '/systems/#try';
  var css =
    '#isbar{position:fixed;inset-inline:12px;inset-block-end:calc(10px + env(safe-area-inset-bottom));z-index:2147483000;display:flex;align-items:center;gap:8px;' +
    'padding:6px;border-radius:999px;background:rgba(250,250,252,.72);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);' +
    'border:1px solid rgba(255,255,255,.7);box-shadow:0 10px 40px rgba(20,30,60,.22),inset 0 1px 0 rgba(255,255,255,.9);' +
    'font-family:"Thmanyah Sans",-apple-system,system-ui,sans-serif;direction:rtl;max-width:620px;margin-inline:auto;color:#1d1d1f}' +
    '#isbar *{box-sizing:border-box}#isbar a{text-decoration:none;color:inherit}' +
    '#isbar .b{display:inline-flex;align-items:center;gap:4px;font-size:14px;font-weight:700;padding:9px 14px;border-radius:999px;white-space:nowrap}' +
    '#isbar .b:hover{background:rgba(0,0,0,.05)}' +
    '#isbar .seg{display:flex;gap:2px;margin-inline:auto;background:rgba(0,0,0,.06);border-radius:999px;padding:3px}' +
    '#isbar .seg a{font-size:13px;font-weight:700;color:#6e6e73;padding:7px 14px;border-radius:999px;white-space:nowrap}' +
    '#isbar .seg a.on{background:#fff;color:#1d1d1f;box-shadow:0 2px 8px rgba(0,0,0,.12)}' +
    '#isbar .nm{margin-inline:auto;font-size:13px;font-weight:700;color:#6e6e73;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#isbar .cta{background:#2F66FF;color:#fff!important;font-size:14px;font-weight:700;padding:9px 16px;border-radius:999px;white-space:nowrap}' +
    '@media(max-width:520px){#isbar .cta span{display:none}#isbar .seg a{padding:7px 11px}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  function same(u) { try { var a = new URL(u, location.href); return a.pathname === location.pathname && (a.search === '' || location.search.indexOf(a.search.slice(1)) >= 0); } catch (e) { return false; } }
  var mid = '<span class="nm">' + name + ' · نسخة عرض</span>';
  if (front && dash) {
    var onDash = same(dash) && !same(front);
    mid = '<div class="seg"><a href="' + front + '" class="' + (onDash ? '' : 'on') + '">الواجهة</a><a href="' + dash + '" class="' + (onDash ? 'on' : '') + '">لوحة التحكّم</a></div>';
  }
  function build() {
    if (document.getElementById('isbar')) return;
    var bar = document.createElement('div'); bar.id = 'isbar';
    bar.innerHTML = '<a class="b" href="' + back + '" aria-label="رجوع لصفحة ديوان">‹ ديوان</a>' + mid +
      '<a class="cta" href="https://wa.me/966504895213?text=' + encodeURIComponent('السلام عليكم، جرّبت نسخة العرض (' + name + ') وأبي نظام مثلها') + '">أبي مثله<span> لجهتي</span></a>';
    document.body.appendChild(bar);
    document.body.style.paddingBottom = '78px';
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
