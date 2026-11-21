/*
 * «جوّالي» — الطالب: POST /season/me {code,pin}   ·   الميسّر: POST /season/staff و /season/staff/act
 * (دالّة api: localhost ← staging، والموقع ← production). ?demo=1 بيانات توضيحيّة، و&as=staff للميسّر، و&stage= للمرحلة.
 * المواقيت محسوبة محلّيّاً بطريقة أمّ القرى حسب مدينة الموسم (settings.city).
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search), LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname), DEMO = Q.get('demo') === '1';
  const API = LOCAL ? 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech' : 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech';
  const $ = document.getElementById('app'), K = 'jawwali2';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const RS = '<svg class="rsym" viewBox="0 0 1124.14 1256.39" role="img" aria-label="ريال"><path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/></svg>';
  const money = (n, cls) => `<span class="money${cls ? ' ' + cls : ''}" dir="ltr">${RS}<b>${Number(n || 0).toLocaleString('en-US')}</b></span>`;
  const SV = { out: P('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'), ref: P('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>'), send: P('<path d="M7 17 17 7M8 7h9v9"/>'), recv: P('<path d="M17 7 7 17M16 17H7V8"/>'), xfer: P('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'), bag: P('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'), star: P('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>'), minus: P('<path d="M5 12h14"/>'), pin: P('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'), cam: P('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'), person: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4.2"/><path d="M3.5 21c.8-4.6 4.2-7 8.5-7s7.7 2.4 8.5 7z"/></svg>' };
  /* رمز QR يُرسم SVG من مكتبة qrcode-generator (vendor/qrcode.min.js) */
  function qrSVG(text) { try { const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`; return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="رمز التحقّق" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`; } catch (e) { return ''; } }
  const verifyURL = no => location.origin + location.pathname + '?' + (DEMO ? 'demo=1&as=staff&' : '') + 'v=' + no + (D && D.season.code ? '&c=' + D.season.code : '');
  /* الخلفيّات: الطالب بلون مرحلته (ألوان حروف ودروس) والميسّر بالجرافيت */
  const WALL = { 'ابتدائي': ['primary', '#00C6FF'], 'متوسط': ['middle', '#FF9000'], 'ثانوي': ['secondary', '#1A3365'] };
  const CITIES = { 'الرياض': [24.7136, 46.6753], 'جدة': [21.4858, 39.1925], 'مكة المكرمة': [21.3891, 39.8579], 'المدينة المنورة': [24.5247, 39.5692], 'الدمام': [26.4207, 50.0888], 'الخبر': [26.2794, 50.2083],
    'الأحساء': [25.3833, 49.5867], 'القطيف': [26.5196, 50.0115], 'الجبيل': [27.0046, 49.646], 'الطائف': [21.2703, 40.4158], 'أبها': [18.2164, 42.5053], 'خميس مشيط': [18.3, 42.7333], 'تبوك': [28.3838, 36.555],
    'حائل': [27.5114, 41.69], 'بريدة': [26.326, 43.975], 'عنيزة': [26.0844, 43.9935], 'جازان': [16.8892, 42.5511], 'نجران': [17.5656, 44.2289], 'الباحة': [20.0129, 41.4677], 'سكاكا': [29.9697, 40.2064], 'عرعر': [30.9753, 41.0381], 'ينبع': [24.0895, 38.0618] };
  const MEDIA = LOCAL ? 'https://br-red-smoke-baq7yp0d.storage.c-8.eu-central-1.aws.neon.tech/media' : 'https://br-dark-band-bajth6rv.storage.c-8.eu-central-1.aws.neon.tech/media';
  const imgSrc = p => !p ? '' : /^(https?:|data:|\.\/)/.test(p) ? p : MEDIA + '/' + String(p).split('/').map(encodeURIComponent).join('/');
  /* لون كلّ مرحلة في كلّ لمسة (القلب، نقاط التفاعل، شارة التكريم) — والميسّر (جامعي) بالأسود */
  const STAGEC = { 'ابتدائي': '#00C6FF', 'متوسط': '#FF9000', 'ثانوي': '#1A3365', 'جامعي': '#1C1C1E' };
  const STY_ME = [['wave', 'موج'], ['warm', 'دافئ'], ['dark', 'داكن'], ['sunset', 'غروب'], ['forest', 'غابة']], STY_STAFF = [['graphite', 'جرافيت'], ['wave', 'موج'], ['forest', 'غابة']];
  let FEED = [], wallStyle = null; try { wallStyle = localStorage.getItem('jw_wall'); } catch (e) {}
  let D = null, saved = null, MODE = Q.get('as') === 'staff' ? 'staff' : 'me';
  try { saved = JSON.parse(localStorage.getItem(K) || 'null'); if (saved && !Q.get('as')) MODE = saved.mode || 'me'; } catch (e) {}

  /* ═════════ مواقيت الصلاة — أمّ القرى (الفجر ١٨٫٥°، العشاء بعد المغرب بـ٩٠ دقيقة و١٢٠ في رمضان) — تقريبيّة بدقيقة أو اثنتين ═════════ */
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  function prayers(date, lat, lng) {
    const y = date.getFullYear(), m = date.getMonth() + 1, dd = date.getDate(), A = Math.floor((14 - m) / 12), yy = y + 4800 - A, mm = m + 12 * A - 3;
    const jd = dd + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
    const d = jd - 2451545, g = rad((357.529 + .98560028 * d) % 360), q = ((280.459 + .98564736 * d) % 360 + 360) % 360;
    const L = rad(q + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)), e = rad(23.439 - .00000036 * d);
    const RA = ((deg(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15) % 24 + 24) % 24, dec = Math.asin(Math.sin(e) * Math.sin(L));
    let eqt = q / 15 - RA; if (eqt > 12) eqt -= 24; if (eqt < -12) eqt += 24;
    const noon = 12 + 3 - lng / 15 - eqt, la = rad(lat);
    const T = a => deg(Math.acos((-Math.sin(rad(a)) - Math.sin(dec) * Math.sin(la)) / (Math.cos(dec) * Math.cos(la)))) / 15;
    const asrA = -deg(Math.atan(1 / (1 + Math.tan(Math.abs(la - dec)))));
    let ramadan = false; try { ramadan = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(date) === '9'; } catch (err) {}
    const mag = noon + T(.833), base = new Date(date); base.setHours(0, 0, 0, 0);
    const H = h => new Date(base.getTime() + Math.round(h * 60) * 60000);
    return [['الفجر', H(noon - T(18.5))], ['الشروق', H(noon - T(.833))], ['الظهر', H(noon + 2 / 60)], ['العصر', H(noon + T(asrA))], ['المغرب', H(mag)], ['العشاء', H(mag + (ramadan ? 2 : 1.5))]];
  }
  const fmtT = d => d.toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
  function cityLL() { const c = ((D && D.season.settings) || {}).city || 'الرياض'; return [c, CITIES[c] || CITIES['الرياض']]; }
  function nextPrayer() { const [, [la, ln]] = cityLL(), now = new Date(); const n = prayers(now, la, ln).filter(p => p[0] !== 'الشروق').find(p => p[1] > now); return n || prayers(new Date(now.getTime() + 864e5), la, ln)[0]; }
  const cd = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + ' س ' + (m % 60) + ' د' : m + ' دقيقة'; };

  /* ═════════ الدخول ═════════ */
  /* شاشة البداية (تطبيق الآيفون): يختار من هو، ثمّ دخول يناسبه —
     الطالب والميسّر: مسح رمز البطاقة أو رمز الموسم + الرمز السرّيّ · الإدارة: البريد وكلمة المرور في النظام نفسه (صلاحيّات كاملة) */
  let ROLE = null; try { ROLE = localStorage.getItem('jw_role'); } catch (e) {}
  const ROLES = [['ابتدائي', 'طالب ابتدائي', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 3, wc: 1, c: 7, cc: 8, b: 8, s: 2, e: 2, m: 1, fs: 5, h: 0 }],
    ['متوسط', 'طالب متوسط', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 0, h: 2, hc: 1, c: 7, cc: 6, b: 9, s: 4, e: 0, m: 6, fs: 0 }],
    ['ثانوي', 'طالب ثانوي', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 1, ws: 5, c: 0, b: 10, s: 3, e: 4, m: 2, fs: 2 }],
    ['staff', 'ميسّر', 'امنح، تحقّق من الدخول، انشر — دخول سريع بالرمز', { w: 2, ws: 0, c: 0, b: 11, s: 5, f: 7, g: 6, fs: 3, e: 0, m: 0 }],
    ['admin', 'الإدارة', 'المدير التنفيذي والمدراء — بالبريد وكلمة المرور', { w: 1, ws: 1, c: 1, b: 6, s: 2, f: 8, fs: 2, e: 0, m: 0 }]];
  const roleColor = k => STAGEC[k] || (k === 'staff' ? '#1C1C1E' : '#1003BD');
  function rolePick() {
    const dk = document.getElementById('dock'); if (dk) dk.remove();
    setWall('staff');
    $.innerHTML = `<div class="scr"><div class="onb"><h1>جوّالي</h1><p>أهلاً بك في الموسم. من أنت؟</p>
      <div class="roles">${ROLES.map(([k, n, d, av]) => `<button class="role" data-role="${k}" style="--rc:${roleColor(k)}"><span class="rav">${AV.svg(av)}</span><span class="rtx"><b>${n}</b><small>${d}</small></span><span class="chev" aria-hidden="true">‹</span></button>`).join('')}</div></div></div>`;
  }
  function login(msg) {
    const dk = document.getElementById('dock'); if (dk) dk.remove();
    if (!ROLE) { rolePick(); return; }
    const r = ROLES.find(x => x[0] === ROLE) || ROLES[1], staff = ROLE === 'staff', admin = ROLE === 'admin';
    MODE = staff ? 'staff' : 'me';
    if (DEMO && !admin) { fetchData(); return; }
    setWall(staff || admin ? 'staff' : null);
    const head = `<button class="rback" data-role-reset>‹ تغيير</button><div class="lhead"><span class="rav big" style="--rc:${roleColor(ROLE)}">${AV.svg(r[3])}</span><h1>${r[1]}</h1></div>`;
    if (admin) {
      $.innerHTML = `<div class="scr"><div class="login">${head}<p>المدير التنفيذي وفريق الإدارة يدخلون النظام كاملاً بالبريد وكلمة المرور: الموقع، الحوكمة، المال، والموسم.</p>
        <a class="btn" href="../${DEMO ? 'index.html?demo=1' : ''}">الدخول بالبريد وكلمة المرور</a><p class="note">نسيت كلمة المرور؟ تستعيدها من شاشة الدخول نفسها.</p></div></div>`;
      return;
    }
    const cam = 'BarcodeDetector' in window;
    $.innerHTML = `<div class="scr"><div class="login">${head}
      ${cam ? `<button class="btn" data-act="scanlogin">${SV.cam} ${staff ? 'امسح رمز الدخول' : 'امسح الرمز على بطاقتك'}</button><video id="lcam" playsinline muted hidden></video>`
        : `<div class="note">${staff ? 'امسح رمز الدخول الذي أرسلته لك الإدارة' : 'امسح الرمز المطبوع على بطاقتك'} بكاميرا الجوال — يفتح «جوّالي» ويدخلك مباشرة.</div>`}
      <div class="or"><span>أو بالرمز</span></div>
      <label class="fld">رمز الموسم<input id="c" maxlength="6" autocapitalize="characters" autocomplete="off" value="${esc((saved || {}).code || Q.get('c') || '')}"></label>
      <label class="fld">${staff ? 'رمز الميسّر' : 'رمزك السرّيّ (على بطاقتك)'}<input id="p" maxlength="6" inputmode="numeric" autocomplete="off"></label>
      <p class="err" id="e" role="alert">${esc(msg || '')}</p><button class="btn sec" id="go">دخول</button></div></div>`;
    const go = () => fetchData(document.getElementById('c').value.trim().toUpperCase(), document.getElementById('p').value.trim(), true);
    document.getElementById('go').onclick = go;
    document.getElementById('p').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }
  /* الدخول بمسح رمز البطاقة: الرمز رابط فيه رمز الموسم والرمز السرّيّ (c و p) */
  function loginLink(raw) { try { const u = new URL(raw, location.href), c = u.searchParams.get('c'), p = u.searchParams.get('p'); return c && p ? { c: c.toUpperCase(), p, staff: u.searchParams.get('as') === 'staff' } : null; } catch (e) { return null; } }
  async function scanLogin() {
    const v = document.getElementById('lcam'); if (!v) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = stream; v.hidden = false; await v.play();
      const det = new BarcodeDetector({ formats: ['qr_code'] }), stop = () => { stream.getTracks().forEach(t => t.stop()); v.hidden = true; };
      const loop = async () => {
        if (!document.body.contains(v)) return stop();
        try { const c = await det.detect(v); const L = c[0] && loginLink(c[0].rawValue); if (L) { stop(); MODE = L.staff ? 'staff' : 'me'; fetchData(L.c, L.p, true); return; } } catch (e) {}
        requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { toast('تعذّر فتح الكاميرا — اكتب الرمز', 1); }
  }
  async function post(path, body) {
    const r = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر الاتّصال'); return d;
  }
  async function fetchData(code, pin, fromLogin) {
    if (DEMO) { D = MODE === 'staff' ? sampleStaff() : sample(); saved = { code: 'DEMO42', pin: '000000', mode: MODE }; if (!FEED.length) FEED = sampleFeed(); if (!SURV.length) SURV = sampleSurv(); home(); deepLink(); return; }
    const btn = document.getElementById('go'); if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الدخول…'; }
    try {
      D = await post(MODE === 'staff' ? '/season/staff' : '/season/me', { code, pin });
      saved = { code, pin, mode: MODE }; ROLE = MODE === 'staff' ? 'staff' : (D.me.stage || ROLE); try { localStorage.setItem(K, JSON.stringify(saved)); localStorage.setItem('jw_role', ROLE); } catch (e) {}
      home(); deepLink(); Promise.all([loadFeed(), loadSurv()]).then(() => { if (!document.querySelector('.view')) home(); });
    } catch (e) { if (fromLogin || !D) login(e.message); else toast(e.message, 1); }
  }
  let linked = false;
  function deepLink() { const v = +Q.get('v'); if (!v || linked) return; linked = true; if (MODE === 'staff') OPEN.scan(v); else if (v !== D.me.no) OPEN.xfer(v); }
  function setWall(kind) {
    const w = document.getElementById('wall');
    if (kind === 'staff') { const sty = STY_STAFF.some(x => x[0] === wallStyle) ? wallStyle : 'graphite'; w.style.backgroundImage = `url(./walls/staff-${sty}.jpg)`; document.documentElement.style.setProperty('--tc', '#48484A'); document.documentElement.style.setProperty('--sc', '#1C1C1E'); return; }
    const st = (D && D.me && D.me.stage) || (WALL[ROLE] ? ROLE : ''), x = WALL[st] || WALL['متوسط'], c = ((((D || {}).season || {}).settings) || {}).stages || {};
    const sty = STY_ME.some(y => y[0] === wallStyle) ? wallStyle : 'wave';
    w.style.backgroundImage = `url(./walls/${x[0]}-${sty}.jpg)`;
    document.documentElement.style.setProperty('--tc', c[st] || x[1]); document.documentElement.style.setProperty('--sc', STAGEC[st] || x[1]); document.documentElement.style.setProperty('--sf', onColor(STAGEC[st] || x[1]));
  }
  const team = id => ((D.season.teams || []).find(t => t.id === id)) || { name: '', color: '#888' };
  const fmtDay = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return d; } };
  const now = () => new Date().toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
  const hijri = () => { try { return new Date().toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } };
  // أيقونات النظام المعتمدة نفسها (رسوم Icon Composer) — الميسّر بنسختها الداكنة
  const app = (k, n, art) => `<button class="app" data-open="${k}"><span class="ic">${(k === 'news' && newPosts()) || (k === 'survey' && SURV.some(x => !x.done)) ? '<i class="badge" aria-label="جديد"></i>' : ''}${art ? `<img src="../assets/apps/${MODE === 'staff' ? 'dark' : 'default'}/${art}.webp?v=2" alt="">` : SV[k]}</span><span>${n}</span></button>`;

  /* ═════════ الشاشة الرئيسيّة ═════════ */
  function home() {
    setWall(MODE === 'staff' ? 'staff' : null);
    const np = nextPrayer(), todayISO = new Date().toISOString().slice(0, 10), next = (D.schedule || []).find(x => x.d >= todayISO);
    const top = `<div class="bar"><span>${now()}</span><span>${esc(hijri())}</span></div>`;
    const pw = `<button class="widget pray-next" data-open="pray"><small>الصلاة القادمة · ${esc(cityLL()[0])}</small><b>${np[0]} ${fmtT(np[1])}</b><small>بعد <span class="cd" id="cd">${cd(np[1] - new Date())}</span></small></button>`;
    if (MODE === 'staff') {
      const me = D.me;
      $.innerHTML = `<div class="scr">${top}<button class="meav" data-open="avatar" aria-label="شخصيّتي">${AV.of(me.avatar, me.name)}</button><p class="hello">أهلاً ${esc(me.name.split(' ')[0])}</p><p class="sub">${me.role === 'lead' ? 'قائد' : 'ميسّر'}${me.stage ? ' · ' + esc(me.stage) : ''} · ${esc(D.season.name)}</p>
        <div class="apps">${app('news', 'الأخبار', 'w-news')}${me.perms && me.perms.post === false ? '' : app('publish', 'انشر', 'w-testimonials')}${app('give', 'امنح', 'finance')}${app('teams', 'نقاط الفرق', 'season')}${me.perms && me.perms.sell ? app('counter', 'الكاونتر', 'procurement') : ''}${app('scan', 'تحقّق', 'comply')}${app('people', 'الطلاب', 'beneficiaries')}${app('cal', 'الجدول', 'calendar')}${app('pray', 'الصلاة', 'prayer')}${app('games', 'الألعاب', 'letters')}${app('survey', 'رأيك', 'requests')}${app('trophy', 'الترتيب', 'team')}${app('id', 'بطاقتي', 'hr')}${app('wall', 'الخلفيّة', '_wall')}</div>
        <div class="wrow"><button class="widget" data-open="give"><small>منحتَ هذا الموسم</small><b>${money(me.given || 0)}</b></button><button class="widget" data-open="people"><small>طلابك</small><b>${(D.members || []).length}</b></button></div>
        ${pw}</div>`;
    } else {
      const t = team(D.me.team);
      $.innerHTML = `<div class="scr">${top}<button class="meav" data-open="avatar" aria-label="شخصيّتي">${AV.of(D.me.avatar, D.me.name)}</button><p class="hello">أهلاً ${esc(D.me.name.split(' ')[0])}</p><p class="sub">${esc(t.name)} · رقمك ${esc(D.me.no)}${D.me.stage ? ' · ' + esc(D.me.stage) : ''}</p>
        <div class="apps">${app('news', 'الأخبار', 'w-news')}${app('bank', 'البنك', 'finance')}${app('cal', 'الجدول', 'calendar')}${app('pray', 'الصلاة', 'prayer')}${app('shop', 'المتجر', 'procurement')}${app('trophy', 'الترتيب', 'season')}${app('id', 'بطاقتي', 'hr')}${app('survey', 'رأيك', 'requests')}${app('wall', 'الخلفيّة', '_wall')}</div>
        <div class="wrow"><button class="widget" data-open="bank"><small>رصيدك</small><b>${money(D.me.balance)}</b></button><button class="widget" data-open="trophy"><small>فريقك</small><b>${esc(t.name)}</b></button></div>
        ${pw}${next ? `<button class="widget" data-open="cal"><small>النشاط القادم · ${esc(fmtDay(next.d))}</small><b>${esc(next.t)}</b><small>${esc([next.f && next.f + (next.e ? '–' + next.e : ''), next.p].filter(Boolean).join(' · '))}</small></button>` : ''}
        </div>`;
    }
    paintDock();
  }
  function paintDock(cur) {
    const look = MODE === 'staff' ? 'dark' : 'default', k = MODE === 'staff' ? [['news', 'الأخبار', 'w-news'], ['give', 'امنح', 'finance'], ['scan', 'تحقّق', 'comply']] : [['news', 'الأخبار', 'w-news'], ['bank', 'البنك', 'finance'], ['id', 'بطاقتي', 'hr']];
    const h = `<nav class="dock" id="dock" aria-label="التطبيقات"><button class="app${!cur ? ' cur' : ''}" data-open="home" aria-label="الرئيسية"><span class="ic"><img src="../assets/apps/${look}/desktop.webp?v=2" alt=""></span><span>الرئيسية</span></button><i class="dsep" aria-hidden="true"></i>${k.map(([a, n, art]) => app(a, n, art).replace('class="app"', `class="app${cur === a ? ' cur' : ''}" aria-label="${n}"`)).join('')}</nav>`;
    const d = document.getElementById('dock'); if (d) d.outerHTML = h; else document.body.insertAdjacentHTML('beforeend', h);
  }
  function newPosts() { let seen = ''; try { seen = localStorage.getItem('jw_seen') || ''; } catch (e) {} return FEED.length && String(FEED[0].at) > seen ? FEED.filter(p => String(p.at) > seen).length : 0; }
  async function loadFeed() {
    try { FEED = DEMO ? sampleFeed() : await post('/season/feed', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me' }); } catch (e) { FEED = FEED || []; }
  }
  const ago = t => { const m = Math.round((Date.now() - new Date(t)) / 60000); return m < 1 ? 'الآن' : m < 60 ? 'قبل ' + m + ' د' : m < 1440 ? 'قبل ' + Math.round(m / 60) + ' س' : new Date(t).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'short' }); };
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  function postHTML(p) {
    const myStage = MODE === 'staff' ? 'جامعي' : (D.me.stage || 'متوسط'), hc = STAGEC[myStage] || '#FF2D55';
    const sum = Object.entries(p.r || {}).sort((a, b) => b[1] - a[1]).map(([g, n]) => `<span class="rs" title="${esc(g)}"><i style="--c:${STAGEC[g] || '#999'}"></i>${n}</span>`).join('');
    const total = Object.values(p.r || {}).reduce((a, b) => a + b, 0);
    const kind = { honor: 'تكريم', program: 'برنامج', teaser: 'قريباً' }[p.k] || '';
    return `<article class="post k-${esc(p.k)}"><header><span class="pav${p.staff ? ' st avr' : ''}">${p.staff ? AV.of(p.bav, p.by) : esc(String(p.by || '؟').charAt(0))}</span><span class="pby"><b>${esc(p.by)}</b><small>${p.staff ? 'ميسّر' : 'الإدارة'} · ${ago(p.at)}</small></span>${kind ? `<em class="pk">${kind}</em>` : ''}</header>
      ${p.img ? `<div class="pimg${p.k === 'teaser' ? ' tz' : ''}"><img src="${esc(imgSrc(p.img))}" alt="" loading="lazy">${p.k === 'teaser' ? '<span>قريباً…</span>' : ''}</div>` : p.k === 'honor' && p.hon ? `<div class="phon" style="--c:${STAGEC[p.hon.g] || '#FF9000'}"><span class="hav">${AV.of(p.hon.av, p.hon.n)}<i>🏅</i></span><b>${esc(p.hon.n)}</b><small>${esc(p.hon.g || '')}</small></div>` : ''}
      <div class="pb">${p.k === 'honor' && p.hon && p.img ? `<span class="hchip" style="--c:${STAGEC[p.hon.g] || '#FF9000'}">🏅 ${esc(p.hon.n)}</span>` : ''}<b>${esc(p.t)}</b>${p.b ? `<p>${esc(p.b)}</p>` : ''}</div>
      <footer><button class="heart${p.mine ? ' on' : ''}" style="--hc:${hc}" data-react="${esc(p.id)}" aria-pressed="${!!p.mine}" aria-label="أعجبني">${HEART}</button><span class="rsum">${sum}</span>${total ? `<small class="rt">${total}</small>` : ''}</footer></article>`;
  }
  function paintFeed() { const el = document.getElementById('feed'); if (el) el.innerHTML = FEED.map(postHTML).join('') || '<p class="empty">لا منشورات بعد.</p>'; }
  async function react(id) {
    const p = FEED.find(x => x.id === id); if (!p) return;
    const g = MODE === 'staff' ? 'جامعي' : (D.me.stage || 'متوسط'); p.r = p.r || {};
    p.mine = !p.mine; p.r[g] = Math.max(0, (p.r[g] || 0) + (p.mine ? 1 : -1)); if (!p.r[g]) delete p.r[g]; paintFeed();
    if (!DEMO) { try { await post('/season/react', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me', post: id }); } catch (e) { toast(e.message, 1); } }
  }
  /* صورة الميسّر: تُصغَّر في الجوال (١٤٤٠ بكسل WebP) ثمّ تُرفع */
  function shrink(file) { return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const k = Math.min(1, 1440 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => b ? res(b) : rej(new Error('تعذّرت الصورة')), 'image/webp', .82); }; img.onerror = () => rej(new Error('تعذّرت قراءة الصورة')); img.src = URL.createObjectURL(file); }); }
  const PUB = { kind: 'news', file: null };
  async function publish() {
    const t = (document.getElementById('pt') || {}).value || '', b = (document.getElementById('pbd') || {}).value || '', no = (document.getElementById('pno') || {}).value || '';
    if (t.trim().length < 2) { toast('اكتب العنوان', 1); return; }
    if (PUB.kind === 'honor' && !no) { toast('اكتب رقم الطالب المكرَّم', 1); return; }
    const btn = document.querySelector('[data-act="publish"]'); if (btn) { btn.disabled = true; btn.textContent = 'جارٍ النشر…'; }
    try {
      let img = '';
      if (PUB.file) {
        const blob = await shrink(PUB.file);
        if (DEMO) img = URL.createObjectURL(blob);
        else { const r = await fetch(API + '/season/upload?' + new URLSearchParams({ code: saved.code, pin: saved.pin }), { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: blob }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر رفع الصورة'); img = d.path; }
      }
      const postBody = { kind: PUB.kind, title: t.trim(), body: b.trim(), img, member_no: no ? +no : null };
      if (DEMO) { const m = (D.members || []).find(x => x.no === +no); FEED.unshift({ id: 'p' + Date.now(), k: PUB.kind, t: postBody.title, b: postBody.body, img, at: new Date().toISOString(), by: D.me.name, staff: true, hon: m ? { n: m.n, g: m.g } : null, r: {}, mine: false }); }
      else { await post('/season/post', { code: saved.code, pin: saved.pin, post: postBody }); await loadFeed(); }
      PUB.file = null; toast('نُشر ✓'); OPEN.news();
    } catch (e) { toast(e.message, 1); if (btn) { btn.disabled = false; btn.textContent = 'انشر'; } }
  }
  /* ═════════ «رأيك»: الاستبيانات المفتوحة لي — نجوم، توصية ٠–١٠، اختيار، نصّ ═════════ */
  let SURV = [], SVA = null;
  async function loadSurv() { try { SURV = DEMO ? (SURV.length ? SURV : sampleSurv()) : await post('/season/surveys', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me' }); } catch (e) { SURV = SURV || []; } }
  function survList() {
    const pend = SURV.filter(x => !x.done);
    if (pend.length === 1 && SURV.length === 1) return survOpen(pend[0].id);
    view('رأيك', SURV.length ? SURV.map(v => `<button class="row svrow" data-svopen="${esc(v.id)}"${v.done ? ' disabled' : ''}><span><b>${esc(v.title)}</b><small>${v.done ? 'أجبتَ — شكراً لك' : (v.q || []).length + ' أسئلة · دقيقتان'}</small></span><span aria-hidden="true">${v.done ? '✓' : '‹'}</span></button>`).join('')
      : '<p class="empty">لا استبيانات الآن. سنسألك رأيك قريباً.</p>');
  }
  function survOpen(id) {
    const v = SURV.find(x => x.id === id); if (!v) return; SVA = { id, a: {} };
    const qh = q => {
      const id2 = esc(q.id);
      if (q.t === 'stars') return `<div class="svs" role="radiogroup" aria-label="${esc(q.l)}">${[1, 2, 3, 4, 5].map(n => `<button data-sv="${id2}" data-v="${n}" role="radio" aria-label="${n} من ٥">★</button>`).join('')}</div>`;
      if (q.t === 'nps') return `<div class="svn">${[...Array(11).keys()].map(n => `<button data-sv="${id2}" data-v="${n}">${n}</button>`).join('')}</div><div class="svn-l"><small>لا أنصح</small><small>أنصح بشدّة</small></div>`;
      if (q.t === 'choice') return `<div class="svc">${(q.o || []).map(o => `<button data-sv="${id2}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      return `<textarea class="tx" data-svt="${id2}" rows="3" maxlength="1000" placeholder="اكتب هنا (اختياريّ)"></textarea>`;
    };
    view(v.title, `${v.intro ? `<p class="note">${esc(v.intro)}</p>` : ''}${(v.q || []).map(q => `<div class="svq"><h3>${esc(q.l)}</h3>${qh(q)}</div>`).join('')}
      <button class="btn" data-act="svsend">إرسال</button><p class="note" style="text-align:center">لا يظهر اسمك في النتائج.</p>`);
  }
  function svPick(b) {
    const q = b.dataset.sv, v = b.dataset.v, box = b.parentElement; SVA.a[q] = /^\d+$/.test(v) && !box.classList.contains('svc') ? +v : v;
    box.querySelectorAll('[data-sv]').forEach(x => { const on = box.classList.contains('svs') ? +x.dataset.v <= +v : x === b; x.classList.toggle('on', on); if (x.getAttribute('role') === 'radio') x.setAttribute('aria-checked', String(x === b)); });
  }
  async function survSend(btn) {
    document.querySelectorAll('[data-svt]').forEach(t => { if (t.value.trim()) SVA.a[t.dataset.svt] = t.value.trim(); });
    if (!Object.keys(SVA.a).length) { toast('أجب عن سؤال واحد على الأقلّ', 1); return; }
    btn.disabled = true;
    try {
      if (!DEMO) await post('/season/survey', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me', survey: SVA.id, answers: SVA.a });
      const v = SURV.find(x => x.id === SVA.id); if (v) v.done = true;
      view('شكراً لك', `<div class="svthanks"><div aria-hidden="true">💚</div><h3>وصل رأيك</h3><p>رأيك يصنع الموسم القادم.</p><button class="btn sec" data-close>تمّ</button></div>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  function sampleSurv() {
    const q = (id, t, l, o) => Object.assign({ id, t, l }, o ? { o } : {});
    return MODE === 'staff' ? [{ id: 'sv2', title: 'رضا الميسّرين', intro: 'أنتم قلب الموسم — نريد أن نسمعكم.', done: false, q: [q('a', 'stars', 'وضوح المهامّ والأدوار'), q('b', 'stars', 'دعم الإدارة'), q('c', 'choice', 'هل ترغب بالمشاركة في الموسم القادم؟', ['نعم بالتأكيد', 'ربّما', 'لا']), q('d', 'text', 'ما الذي يجعل تجربتك أفضل؟')] }]
      : [{ id: 'sv1', title: 'رضا المشاركين عن الموسم', intro: 'رأيك يصنع الموسم القادم — دقيقتان فقط.', done: false, q: [q('a', 'stars', 'البرامج والأنشطة'), q('b', 'stars', 'الميسّرون وتعاملهم'), q('c', 'choice', 'أكثر شيء أعجبك', ['الرحلات', 'المسابقات', 'الرياضة', 'الدورات والمهارات']), q('d', 'nps', 'هل تنصح صديقك بالتسجيل معنا؟'), q('e', 'text', 'ماذا تتمنّى في الموسم القادم؟')] },
        { id: 'sv0', title: 'تقييم رحلة البحر', done: true, q: [] }];
  }

  function onColor(h) { const n = parseInt(String(h).slice(1), 16), L = [n >> 16, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }), Y = .2126 * L[0] + .7152 * L[1] + .0722 * L[2]; return (Y + .05) / .05 > 1.05 / (Y + .05) ? '#000' : '#fff'; }
  function view(title, body) {
    const old = document.querySelector('.view'); if (old) old.remove();
    const v = document.createElement('div'); v.className = 'view'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', title);
    v.innerHTML = `<div class="vh"><button aria-label="رجوع" data-close>›</button><h2>${title}</h2></div><div class="vb">${body}</div>`;
    document.body.appendChild(v); if (D) paintDock(OPENED); return v;
  }
  let OPENED = '';
  function toast(m, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = m; t.setAttribute('role', 'status'); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  /* ═════════ التطبيقات ═════════ */
  const OPEN = {
    survey() { survList(); },
    games() { location.href = '../games/' + (DEMO ? '?demo=1' : ''); },
    async news() {
      view('الأخبار', `<div id="feed"><p class="empty">جارٍ التحميل…</p></div>`);
      await loadFeed(); paintFeed();
      try { if (FEED[0]) localStorage.setItem('jw_seen', String(FEED[0].at)); } catch (e) {}
    },
    publish() {
      PUB.file = null;
      const v = view('انشر', `<div class="seg pubk"><button class="${PUB.kind === 'news' ? 'on' : ''}" data-pk="news">خبر</button><button class="${PUB.kind === 'honor' ? 'on' : ''}" data-pk="honor">تكريم طالب</button></div>
        <label class="fld" id="pnoF" ${PUB.kind === 'honor' ? '' : 'hidden'}>رقم الطالب المكرَّم<input id="pno" inputmode="numeric" autocomplete="off"></label>
        <label class="fld">العنوان<input id="pt" class="tx" maxlength="120" placeholder="مثلاً: تكريم نجم الأسبوع"></label>
        <label class="fld">النصّ (اختياريّ)<textarea id="pbd" class="tx" rows="3" maxlength="1500"></textarea></label>
        <label class="pick"><input type="file" accept="image/*" id="pf" hidden><span id="pfv">📷 أضف صورة</span></label>
        <button class="btn" data-act="publish" style="margin-top:12px">انشر</button>
        <p class="note">يظهر للطلاب والميسّرين في «الأخبار» فوراً. صوّر بإذن المشاركين، وتجنّب نشر الوجوه بلا موافقة.</p>`);
      v.querySelector('#pf').onchange = e => { PUB.file = e.target.files[0] || null; if (PUB.file) document.getElementById('pfv').innerHTML = `<img src="${URL.createObjectURL(PUB.file)}" alt="">`; };
    },
    wall() {
      const list = MODE === 'staff' ? STY_STAFF : STY_ME, st = MODE === 'staff' ? 'staff' : (WALL[(D.me || {}).stage] || WALL['متوسط'])[0];
      const cur = list.some(x => x[0] === wallStyle) ? wallStyle : list[0][0];
      view('الخلفيّة', `<p class="note">${MODE === 'staff' ? 'خلفيّات الميسّرين داكنة — لونهم الأسود.' : 'كلّ الخلفيّات بلون مرحلتك — حتى يُعرف جوالك من مرحلتك.'}</p>
        <div class="walls">${list.map(([k, n]) => `<button class="wpick${k === cur ? ' on' : ''}" data-wall="${k}"><img src="./walls/${st}-${k}.jpg" alt=""><span>${n}</span></button>`).join('')}</div>`);
    },
    pray() {
      const [c, [la, ln]] = cityLL(), list = prayers(new Date(), la, ln), np = nextPrayer(), nowD = new Date();
      const perm = 'Notification' in window ? Notification.permission : 'unsupported';
      view('الصلاة', `<div class="note">مواقيت ${esc(c)} — تقويم أمّ القرى (تقريبيّة). يظهر تنبيه في «جوّالي» وقت كلّ صلاة.</div>
        ${list.map(p => `<div class="pt${p[0] === np[0] && p[1].getTime() === np[1].getTime() ? ' next' : p[1] < nowD ? ' past' : ''}"><span>${p[0]}</span><b>${fmtT(p[1])}</b></div>`).join('')}
        <button class="btn sec" style="margin-top:18px" data-act="adhantest">🔊 اسمع الأذان</button>
        ${perm === 'default' ? `<button class="btn sec" style="margin-top:10px" data-act="notif">فعّل التنبيهات على جوالي</button>` : ''}
        <p class="empty" style="padding:18px 6px">«إنّ الصلاة كانت على المؤمنين كتاباً موقوتاً»</p>`);
    },
    avatar() {
      AVE = Object.assign({}, AV.has(D.me.avatar) ? D.me.avatar : AV.seed(D.me.name));
      view('شخصيّتي', `<div class="avprev" id="avp"></div><div class="avtabs" role="tablist">${AV.CATS.map(c => `<button role="tab" data-avcat="${c.id}">${c.n}</button>`).join('')}</div><div id="avb"></div>
        <button class="btn" data-act="avsave" style="margin-top:16px">احفظ شخصيّتي</button><p class="note">شخصيّتك تظهر في بطاقتك والترتيب والأخبار — بدل الصورة.</p>`);
      avPaint();
    },
    home() { const v = document.querySelector('.view'); if (v) v.remove(); OPENED = ''; if (D) home(); },
    /* الجدول: أيّام بشرائح، وكلّ نشاط بطاقة بوقت كبير وأيقونة ولون — «الآن» و«التالي» واضحان */
    cal(sel) {
      const days = {}; (D.schedule || []).forEach(x => (days[x.d] = days[x.d] || []).push(x));
      const keys = Object.keys(days).sort(), today = isoDay(new Date()), tomorrow = isoDay(new Date(Date.now() + 864e5));
      if (!keys.length) { view('الجدول', '<p class="empty">لم يُنشر الجدول بعد.</p>'); return; }
      sel = sel && days[sel] ? sel : (keys.find(d => d >= today) || keys[keys.length - 1]);
      const nowD = new Date(), list = days[sel].slice().sort((a, b) => String(a.f).localeCompare(String(b.f)));
      const at = (d, t) => t ? new Date(d + 'T' + t + ':00') : null;
      let nextI = -1; list.forEach((x, i) => { if (nextI < 0 && at(x.d, x.f) > nowD) nextI = i; });
      const chip = d => { const dt = new Date(d + 'T00:00:00'); return `<button class="dchip${d === sel ? ' on' : ''}" data-day="${d}" aria-pressed="${d === sel}"><small>${d === today ? 'اليوم' : d === tomorrow ? 'غداً' : dt.toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'short' })}</small><b>${dt.getDate()}</b></button>`; };
      view('الجدول', `<div class="dchips">${keys.map(chip).join('')}</div><p class="dlong">${esc(fmtDay(sel))}</p>
        <div class="evs">${list.map((x, i) => { const s1 = at(x.d, x.f), s2 = at(x.d, x.e), st = s1 && s2 && nowD >= s1 && nowD < s2 ? 'now' : i === nextI ? 'next' : s2 && s2 < nowD ? 'past' : '', [h, ap] = h12(x.f);
          return `<div class="ev ${st}" style="--ec:${EVC[i % EVC.length]}"><div class="evt"><b>${h}</b><small>${ap}</small></div><div class="evc"><span class="eve" aria-hidden="true">${evEmoji(x.t)}</span><span class="evx"><b>${esc(x.t)}</b>
            <small>${x.p ? SV.pin + esc(x.p) : ''}${x.e ? ` · حتى ${h12(x.e).join(' ')}` : ''}${MODE === 'staff' && x.g ? ' · ' + esc(x.g) : ''}</small></span>${st === 'now' ? '<em>الآن</em>' : st === 'next' ? '<em class="nx">التالي</em>' : ''}</div></div>`; }).join('')}</div>`);
    },
    /* الترتيب: منصّة تتويج للفرق بألوانها، وقائمة الأفراد بصورة رمزيّة بلون المرحلة وحلقة بلون الفريق */
    trophy(tab) {
      tab = tab === 'people' ? 'people' : 'teams';
      const teams = (D.season.teams || []).map(t => Object.assign({}, t, { pts: (D.teams || {})[t.id] || 0 })).sort((a, b) => b.pts - a.pts), max = Math.max(1, ...teams.map(t => t.pts));
      const rich = MODE === 'staff' ? (D.members || []).filter(m => m.b > 0).sort((a, b) => b.b - a.b).slice(0, 10).map(m => ({ n: m.n.split(' ')[0], team: m.t, g: m.g, av: m.av, b: m.b })) : (D.rich || []);
      const mine = MODE === 'me' ? D.me.team : '', medal = ['🥇', '🥈', '🥉'];
      const pod = [teams[1], teams[0], teams[2]].map((t, k) => t ? `<div class="pod${t.id === mine ? ' me' : ''}" style="--c:${esc(t.color)}"><span class="pm" aria-hidden="true">${medal[[1, 0, 2][k]]}</span><b>${esc(t.name)}</b><span class="pp">${t.pts}<small> نقطة</small></span><div class="pillar" style="height:${[96, 132, 72][k]}px"><span>${[2, 1, 3][k]}</span></div>${t.id === mine ? '<em>فريقك</em>' : ''}</div>` : '<div class="pod"></div>').join('');
      view('الترتيب', `<div class="seg rkseg" role="tablist"><button class="${tab === 'teams' ? 'on' : ''}" data-rk="teams" role="tab" aria-selected="${tab === 'teams'}">الفرق</button><button class="${tab === 'people' ? 'on' : ''}" data-rk="people" role="tab" aria-selected="${tab === 'people'}">الأفراد</button></div>
        ${tab === 'teams' ? `<div class="podium">${pod}</div><div class="tlist">${teams.slice(3).map((t, i) => `<div class="trow${t.id === mine ? ' me' : ''}" style="--c:${esc(t.color)}"><span class="tn">${i + 4}</span><span class="tx2"><b>${esc(t.name)}</b><i><u style="width:${Math.round(t.pts / max * 100)}%"></u></i></span><b>${t.pts}</b></div>`).join('')}</div>`
          : `<p class="dlong">الأكثر عملات في الموسم</p><div class="plist">${rich.map((r, i) => `<div class="prow${i < 3 ? ' top' : ''}"><span class="prk">${i < 3 ? medal[i] : i + 1}</span><span class="pav2 avr" style="--sc2:${STAGEC[r.g] || '#5E5CE6'};--tc2:${esc(team(r.team).color)}">${AV.of(r.av, r.n)}</span><span class="tx2"><b>${esc(r.n)}</b><small><i class="dot" style="--c:${esc(team(r.team).color)}"></i> ${esc(team(r.team).name)}${r.g ? ' · ' + esc(r.g) : ''}</small></span>${money(r.b)}</div>`).join('') || '<p class="empty">لا أحد بعد.</p>'}</div>`}`);
    },
    ref() { fetchData(saved.code, saved.pin); toast('حُدِّث'); },
    out() { const v = document.querySelector('.view'); if (v) v.remove(); try { localStorage.removeItem(K); } catch (e) {} saved = { code: saved && saved.code }; D = null; login(); },
    /* البنك: بطاقة بلون المرحلة، ثلاثة أزرار (حوّل، استلم، المتجر)، والحركات مجمّعة بالأيّام */
    bank() {
      const me = D.me, tx = me.tx || [], groups = {};
      tx.forEach(x => { const k = isoDay(new Date(x.t)); (groups[k] = groups[k] || []).push(x); });
      const today = isoDay(new Date()), yest = isoDay(new Date(Date.now() - 864e5));
      const kind = x => /^شراء/.test(x.r || '') ? ['bag', 'buy'] : /^حوالة إلى/.test(x.r || '') ? ['send', 'out'] : /^حوالة من/.test(x.r || '') ? ['recv', 'in'] : x.a > 0 ? ['star', 'in'] : ['minus', 'out'];
      view('البنك', `<div class="wcard"><div class="wtop"><span>بنك ${esc(D.season.name)}</span><span class="wchip">${esc(me.stage || '')}</span></div>
          <div class="wbal"><small>رصيدك</small>${money(me.balance, 'xl')}</div>
          <div class="wfoot"><b>${esc(me.name)}</b><span dir="ltr">#${me.no}</span></div></div>
        <div class="qacts"><button data-open="xfer"><span>${SV.xfer}</span>حوّل</button><button data-open="recv"><span>${SV.recv}</span>استلم</button><button data-open="shop"><span>${SV.bag}</span>المتجر</button></div>
        ${Object.keys(groups).sort().reverse().map(d => `<h3>${d === today ? 'اليوم' : d === yest ? 'أمس' : esc(fmtDay(d))}</h3><div class="txl">${groups[d].map(x => { const [ic, c] = kind(x);
          return `<div class="txr"><span class="txi ${c}">${SV[ic]}</span><span class="tx2"><b>${esc(x.r || (x.a > 0 ? 'إيداع' : 'سحب'))}</b><small>${new Date(x.t).toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' })}</small></span><span class="amt ${x.a > 0 ? 'pos' : 'neg'}" dir="ltr">${x.a > 0 ? '+' : '−'}${money(Math.abs(x.a))}</span></div>`; }).join('')}</div>`).join('') || '<p class="empty">لا حركات بعد — اجمع العملات من الأنشطة.</p>'}`);
    },
    /* حوّل: رقم صديقك ← يظهر اسمه من الخادم ← المبلغ ← تأكيد */
    xfer(to) {
      if (((D.season.settings || {}).transfers) === false) { view('حوّل', '<p class="empty">الحوالات موقوفة في هذا الموسم.</p>'); return; }
      XF.to = to ? String(to) : ''; XF.who = null; XF.amt = 10; XF.note = '';
      const left = Math.max(0, 5 - (D.me.sentToday || 0));
      view('حوّل', `<div class="xbal">رصيدك ${money(D.me.balance)}</div>
        <label class="fld">رقم المستلم<input id="xt" class="big" inputmode="numeric" autocomplete="off" placeholder="—" value="${esc(XF.to)}"></label>
        <div class="who" id="xw"><small>اكتب الرقم المكتوب في «بطاقتي» عند صديقك.</small></div>
        <div class="amts xamts">${[5, 10, 20, 50].map(a => `<button data-xamt="${a}" class="${a === XF.amt ? 'on' : ''}">${a}</button>`).join('')}</div>
        <label class="fld">مبلغ آخر<input id="xa" inputmode="numeric" autocomplete="off" value="${XF.amt}"></label>
        <label class="fld">ملاحظة (اختياريّ)<input id="xn" class="tx" maxlength="60" placeholder="مثلاً: شكراً على المساعدة"></label>
        <button class="btn" data-act="xsend" id="xb" style="margin-top:14px" disabled>حوّل</button>
        <p class="note">من ١ إلى ١٠٠ عملة في المرّة · بقي لك اليوم ${left} حوالات. الحوالة لا تُسترجع.</p>`);
      const ti = document.getElementById('xt'); ti.oninput = () => xferWho(ti.value.trim()); if (XF.to) xferWho(XF.to);
      document.getElementById('xa').oninput = e => { XF.amt = +e.target.value.replace(/\D/g, '') || 0; document.querySelectorAll('[data-xamt]').forEach(x => x.classList.toggle('on', +x.dataset.xamt === XF.amt)); xferBtn(); };
    },
    /* استلم: رقمك بخطّ كبير ورمز QR — صديقك يمسحه فيفتح التحويل لك مباشرة */
    recv() {
      view('استلم', `<div class="recv"><small>رقمك في الموسم</small><div class="rno">${D.me.no}</div><div class="rqr">${qrSVG(verifyURL(D.me.no))}</div><p>صديقك يمسح الرمز بكاميرا جواله أو يكتب رقمك في «حوّل».</p></div>`);
    },
    /* المتجر: صور كبيرة، السعر بالريال، وما ينقصك للشراء */
    shop() {
      const bal = MODE === 'staff' ? null : D.me.balance;
      view('المتجر', `${bal != null ? `<div class="shead"><span>رصيدك</span>${money(bal)}</div>` : ''}
        <div class="shop">${(D.items || []).map((i, k) => `<button class="prod${bal != null && bal < i.p ? ' far' : ''}${i.s === 0 ? ' out' : ''}" data-prod="${k}">
          <span class="pimg2" style="--h:${hue(i.n)}">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="" loading="lazy">` : `<span class="pe" aria-hidden="true">${esc(i.e || '🎁')}</span>`}${i.s != null ? `<em>${i.s ? 'بقي ' + i.s : 'نفد'}</em>` : ''}</span>
          <span class="pinf"><b>${esc(i.n)}</b>${money(i.p)}</span></button>`).join('') || '<p class="empty">المتجر فارغ الآن.</p>'}</div>`);
    },
    /* بطاقتي: مثل بطاقة توكّلنا — صورة وبيانات صحيحة ورمز تحقّق وحركة حيّة تمنع تصوير الشاشة */
    id() {
      const st = MODE === 'staff', me = D.me, col = st ? '#1C1C1E' : (STAGEC[me.stage] || '#5E5CE6'), t = st ? null : team(me.team);
      const rows = st ? [['الصفة', me.role === 'lead' ? 'قائد' : 'ميسّر'], ['المرحلة', me.stage || 'كلّ المراحل'], ['الموسم', D.season.name]]
        : [['رقم المشارك', '<span dir="ltr">#' + me.no + '</span>'], ['المرحلة', esc(me.stage || '—')], ['الصفّ', esc(me.grade || '—')], ['الفريق', `<i class="dot" style="--c:${esc(t.color)}"></i> ${esc(t.name)}`], ['أيّام الحضور', String(me.att || 0)]];
      view('بطاقتي', `<div class="idcard${st ? ' staff' : ''}" style="--cc:${col};--cf:${onColor(col)}">
          <div class="idtop"><span><b>${esc(D.season.org || '')}</b><small>${esc(D.season.name)}</small></span><span class="idk">${st ? 'بطاقة ميسّر' : 'بطاقة مشارك'}</span></div>
          <div class="idbody"><button class="idph" data-open="avatar" aria-label="عدّل شخصيّتك">${AV.of(me.avatar, me.name)}<span class="ided">✎</span></button>
            <div class="idinfo"><b class="idn">${esc(me.name)}</b><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${st ? esc(v) : v}</dd></div>`).join('')}</dl></div></div>
          ${st ? '' : `<div class="idqr">${qrSVG(verifyURL(me.no))}</div>`}
          <div class="idlive"><i aria-hidden="true"></i><span>بطاقة سارية · <b id="idclk">${clk()}</b></span></div><span class="shine" aria-hidden="true"></span></div>
        <p class="note">${st ? 'بطاقتك في الموسم. للتحقّق من بطاقات الطلاب افتح «تحقّق».' : 'اعرضها عند دخول النادي أو البرنامج — يمسح الميسّر الرمز فتظهر شخصيّتك وبياناتك من النظام ويُسجَّل حضورك.'} اضغط الشخصيّة لتصمّمها.</p>
        <button class="btn sec logout" data-open="out">تسجيل الخروج</button>`);
      const tk = setInterval(() => { const el = document.getElementById('idclk'); if (!el) return clearInterval(tk); el.textContent = clk(); }, 1000);
    },
    /* تحقّق (للميسّر): يمسح رمز البطاقة أو يكتب الرقم — الصورة والبيانات تأتي من الخادم، فلا تنفع لقطة شاشة لبطاقة غيره */
    async scan(no) {
      view('تحقّق', `<button class="btn" data-act="camera" ${'BarcodeDetector' in window ? '' : 'hidden'}>${SV.cam} امسح بطاقة الطالب</button><video id="cam" playsinline muted hidden></video>
        <label class="fld">أو اكتب رقم المشارك<input id="vn" class="big" inputmode="numeric" autocomplete="off" placeholder="—" value="${no || ''}"></label>
        <div id="vr"></div>${'BarcodeDetector' in window ? '' : '<p class="note">في الآيفون: امسح رمز البطاقة بكاميرا الجوال العاديّة فيفتح هنا مباشرة.</p>'}`);
      const inp = document.getElementById('vn'); let tm = null;
      inp.oninput = () => { clearTimeout(tm); tm = setTimeout(() => verify(+inp.value.trim()), 350); };
      if (no) verify(no);
    },
    give() { STF.kind = 'coin'; staffForm(); },
    counter() { STF.kind = 'sell'; staffForm(); },
    teams() {
      const ts = D.season.teams || [];
      view('نقاط الفرق', `<div class="teams">${ts.map(t => `<button style="--c:${esc(t.color)}" data-team="${esc(t.id)}" class="${STF.team === t.id ? 'on' : ''}">${esc(t.name)}<br><small>${(D.teams || {})[t.id] || 0} نقطة</small></button>`).join('')}</div>
        <div class="amts">${[5, 10, 20, -5].map(a => `<button data-pts="${a}" class="${STF.pts === a ? 'on' : ''}">${a > 0 ? '+' + a : '−' + Math.abs(a)}</button>`).join('')}</div>
        <div class="chips">${['مشاركة', 'فوز في مسابقة', 'انضباط', 'تعاون', 'مخالفة'].map(r => `<button class="chip${STF.reason === r ? ' on' : ''}" data-reason="${r}">${r}</button>`).join('')}</div>
        <button class="btn" data-act="point">امنح النقاط</button>`);
    },
    people() {
      const v = view('الطلاب', `<input class="srch" type="search" placeholder="ابحث بالاسم أو الرقم" id="ps"><div id="pl"></div>`);
      const paint = q => { document.getElementById('pl').innerHTML = (D.members || []).filter(m => !q || m.n.includes(q) || String(m.no) === q).map(m => `<button class="row svrow" data-vno="${m.no}"><span style="display:flex;gap:10px;align-items:center"><span class="pav2 sm avr" style="--sc2:${STAGEC[m.g] || '#5E5CE6'};--tc2:${esc(team(m.t).color)}">${AV.of(m.av, m.n)}</span><span><b>${esc(m.n)}</b><small>#${m.no} · ${esc(m.g || '')} · ${esc(team(m.t).name)}</small></span></span>${money(m.b)}</button>`).join('') || '<p class="empty">لا نتائج.</p>'; };
      paint(''); v.querySelector('#ps').oninput = e => paint(e.target.value.trim());
    },
  };

  let AVE = {}, AVC = 'face';
  function avPaint() {
    const cat = AV.CATS.find(c => c.id === AVC) || AV.CATS[0], p = document.getElementById('avp');
    p.innerHTML = AV.svg(AVE); p.classList.toggle('zoom', cat.crop === 'head');
    document.querySelectorAll('[data-avcat]').forEach(b => { b.classList.toggle('on', b.dataset.avcat === AVC); b.setAttribute('aria-selected', String(b.dataset.avcat === AVC)); });
    document.getElementById('avb').innerHTML = cat.g.filter(g => !g.when || g.when(AVE)).map(g => {
      const cols = typeof g.cols === 'function' ? g.cols(AVE) : g.cols, cur = AVE[g.k] || 0;
      if (cols) return `<h4 class="avh">${g.t}</h4><div class="avcols">${cols.map((c, i) => `<button class="avc${cur % cols.length === i ? ' on' : ''}" style="--c:${c}" data-avk="${g.k}" data-avv="${i}" aria-label="${g.t} ${i + 1}"></button>`).join('')}</div>`;
      const crop = (g.crop || cat.crop) === 'head' ? 'head' : '';
      return `<h4 class="avh">${g.t}</h4><div class="avopts">${g.names.map((nm, i) => `<button class="avo${cur % g.names.length === i ? ' on' : ''}" data-avk="${g.k}" data-avv="${i}">${AV.svg(Object.assign({}, AVE, { [g.k]: i }), { crop, label: nm })}<span>${nm}</span></button>`).join('')}</div>`;
    }).join('') + (cat.note ? `<p class="note">${cat.note}</p>` : '');
  }
  function avPop() { const p = document.getElementById('avp'); if (!p) return; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
  async function avSave(btn) {
    btn.disabled = true;
    try {
      if (DEMO) { try { localStorage.setItem('jw_demo_av', JSON.stringify(AVE)); } catch (e) {} }
      else await post('/season/avatar', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me', avatar: AVE });
      D.me.avatar = Object.assign({}, AVE); toast('حُفظت شخصيّتك ✓'); OPEN.id();
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  /* ═════════ أدوات الشاشات: التاريخ والوقت، ألوان الأنشطة، الحوالة، صفحة الصنف، التحقّق ═════════ */
  const isoDay = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const h12 = t => { if (!t) return ['', '']; const [H, M] = String(t).split(':').map(Number); return [((H % 12) || 12) + ':' + String(M || 0).padStart(2, '0'), H < 12 ? 'ص' : 'م']; };
  const EVC = ['#FF9F0A', '#30D158', '#64D2FF', '#BF5AF2', '#FF375F', '#FFD60A'];
  const EVE = [[/كرة|دوري|رياض|سباحة|مباراة/, '⚽'], [/رحلة|زيارة|مخيّم|مخيم/, '🚌'], [/مسابقة|حروف|مليون|تحدّي|تحدي/, '🏆'], [/صلاة|درس|قرآن|حلقة|محاضرة/, '🕌'], [/وجبة|عشاء|غداء|إفطار|فطور/, '🍽️'], [/ورشة|دورة|تصوير|برمجة|مهارة/, '🛠️'], [/استقبال|تسجيل|افتتاح/, '👋'], [/تكريم|حفل|ختام/, '🎉']];
  const evEmoji = t => (EVE.find(([r]) => r.test(t || '')) || [0, '✨'])[1];
  const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const clk = () => new Date().toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

  const XF = { to: '', who: null, amt: 10, note: '' };
  let xfTimer = null;
  function xferWho(v) {
    XF.to = v; XF.who = null; xferBtn(); const el = document.getElementById('xw'); if (!el) return;
    clearTimeout(xfTimer); if (!/^\d+$/.test(v)) { el.innerHTML = '<small>اكتب الرقم المكتوب في «بطاقتي» عند صديقك.</small>'; return; }
    el.innerHTML = '<small>جارٍ البحث…</small>';
    xfTimer = setTimeout(async () => {
      try {
        const r = DEMO ? (+v === D.me.no ? Promise.reject(new Error('لا يمكنك التحويل لنفسك')) : { name: ['فهد سعد', 'بدر سامي', 'نواف ماجد'][+v % 3], team: T[+v % 4].id, stage: 'متوسط' })
          : await post('/season/transfer', { code: saved.code, pin: saved.pin, to: +v, dry: true });
        const w = await r; if (XF.to !== v) return; XF.who = w;
        el.innerHTML = `<span class="pav2 sm avr" style="--sc2:${STAGEC[w.stage] || '#5E5CE6'};--tc2:${esc(team(w.team).color)}">${AV.of(w.av, w.name)}</span><span><b>${esc(w.name)}</b><small> · ${esc(team(w.team).name)}</small></span>`; xferBtn();
      } catch (e) { if (XF.to === v) el.innerHTML = `<small class="bad">${esc(e.message)}</small>`; }
    }, 350);
  }
  function xferBtn() { const b = document.getElementById('xb'); if (!b) return; const ok = XF.who && XF.amt >= 1 && XF.amt <= 100 && XF.amt <= D.me.balance; b.disabled = !ok; b.innerHTML = XF.who && XF.amt ? `حوّل ${XF.amt} لـ${esc(String(XF.who.name).split(' ')[0])}` : 'حوّل'; }
  async function xferSend(btn) {
    const note = ((document.getElementById('xn') || {}).value || '').trim(); btn.disabled = true;
    try {
      let bal;
      if (DEMO) { if (XF.amt > D.me.balance) throw new Error('رصيدك لا يكفي'); bal = D.me.balance - XF.amt; }
      else bal = (await post('/season/transfer', { code: saved.code, pin: saved.pin, to: +XF.to, amount: XF.amt, note })).balance;
      const first = String(XF.who.name).split(' ')[0];
      D.me.balance = bal; D.me.sentToday = (D.me.sentToday || 0) + 1;
      (D.me.tx = D.me.tx || []).unshift({ a: -XF.amt, r: `حوالة إلى ${first} #${XF.to}${note ? ' — ' + note : ''}`, t: new Date().toISOString() });
      view('تمّت الحوالة', `<div class="done2"><div class="ok" aria-hidden="true">✓</div><h3>${money(XF.amt, 'xl')}</h3><p>وصلت إلى ${esc(XF.who.name)}</p><p class="note">رصيدك الآن ${money(bal)}</p><button class="btn sec" data-open="bank">البنك</button></div>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  function prod(k) {
    const i = (D.items || [])[k]; if (!i) return; const bal = MODE === 'staff' ? null : D.me.balance, can = bal == null || bal >= i.p;
    view(i.n, `<div class="pbig" style="--h:${hue(i.n)}">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="">` : `<span class="pe" aria-hidden="true">${esc(i.e || '🎁')}</span>`}</div>
      <div class="pdet"><h2>${esc(i.n)}</h2>${money(i.p, 'xl')}${i.s != null ? `<span class="stk${i.s ? '' : ' none'}">${i.s ? 'بقي ' + i.s + ' فقط' : 'نفدت الكمّيّة'}</span>` : ''}
        ${i.d ? `<p>${esc(i.d)}</p>` : ''}
        ${bal == null ? '' : can ? `<div class="buyhow ok"><b>رصيدك يكفي ✓</b><span>اذهب إلى الكاونتر وقل رقمك <b>${D.me.no}</b> — يُخصم السعر من رصيدك.</span></div>`
          : `<div class="buyhow"><b>ينقصك ${money(i.p - bal)}</b><i><u style="width:${Math.round(bal / i.p * 100)}%"></u></i><span>اجمع العملات من الأنشطة والمسابقات.</span></div>`}
        <button class="btn sec" data-open="shop" style="margin-top:14px">كلّ الأصناف</button></div>`);
  }
  async function checkin(btn) {
    const no = +btn.dataset.no; btn.disabled = true;
    try {
      const r = DEMO ? { ok: true, already: false, coins: 5, today: 37, at: new Date().toISOString() } : await post('/season/checkin', { code: saved.code, pin: saved.pin, as: 'staff', no });
      document.getElementById('ckin').innerHTML = `<div class="vok">${r.already ? 'مسجّل من قبل' : '✓ سُجّل حضوره'} · ${fmtT(new Date(r.at))}${r.coins ? ` · +${r.coins} عملة` : ''}</div><small>الحاضرون اليوم: ${r.today}</small>`;
      const m = (D.members || []).find(x => x.no === no); if (m && r.coins && !r.already) m.b += r.coins;
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  async function verify(no) {
    const el = document.getElementById('vr'); if (!el || !no) { if (el) el.innerHTML = ''; return; }
    el.innerHTML = '<p class="empty">جارٍ التحقّق…</p>';
    try {
      const m = DEMO ? demoMember(no) : await post('/season/member', { code: saved.code, pin: saved.pin, as: 'staff', no });
      if (DEMO && m.found) m.here = null;
      if (!m.found) { el.innerHTML = `<div class="vres bad"><div class="vbad">✕</div><b>لا يوجد مشارك بالرقم ${no}</b><small>تأكّد من الرقم أو راجع الإدارة.</small></div>`; return; }
      const t = team(m.t);
      el.innerHTML = `<div class="vres" style="--cc:${STAGEC[m.g] || '#5E5CE6'}"><div class="vph">${AV.of(m.av, m.n)}</div>
        <div class="vok">✓ مسجّل في الموسم</div><b class="vn2">${esc(m.n)}</b><small>#${m.no} · ${esc(m.g || '')}${m.grade ? ' · ' + esc(m.grade) : ''}</small>
        <small><i class="dot" style="--c:${esc(t.color)}"></i> ${esc(t.name)} · الرصيد ${money(m.b)}</small><div id="ckin">${m.here ? `<div class="vok">حاضر اليوم منذ ${fmtT(new Date(m.here))}</div>` : `<button class="btn" data-act="checkin" data-no="${m.no}">سجّل حضوره</button>`}</div></div>`;
    } catch (e) { el.innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
  }
  async function scanCam() {
    const v = document.getElementById('cam'); if (!v) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = stream; v.hidden = false; await v.play();
      const det = new BarcodeDetector({ formats: ['qr_code'] });
      const stop = () => { stream.getTracks().forEach(t => t.stop()); v.hidden = true; };
      const loop = async () => {
        if (!document.body.contains(v)) return stop();
        try { const c = await det.detect(v); const raw = c[0] && c[0].rawValue; if (raw) { const n = +(new URL(raw, location.href).searchParams.get('v') || raw.replace(/\D/g, '')); if (n) { stop(); document.getElementById('vn').value = n; verify(n); return; } } } catch (e) {}
        requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { toast('تعذّر فتح الكاميرا — اكتب الرقم', 1); }
  }

  /* ═════════ نموذج الميسّر: رقم الطالب ← المبلغ أو الصنف ← تنفيذ (الخادم يتحقّق من الحدود والمرحلة) ═════════ */
  const STF = { kind: 'coin', amt: 10, reason: 'مشاركة', item: '', team: '', pts: 10 };
  function staffForm() {
    const lim = (D.me.perms || {}).coins || 50, sell = STF.kind === 'sell';
    const amts = [5, 10, 25, 50, 100].filter(a => a <= lim).slice(0, 3).concat([-Math.min(10, lim)]);
    if (!amts.includes(STF.amt)) STF.amt = amts[0];
    const v = view(sell ? 'الكاونتر' : 'امنح عملات', `<label class="fld">رقم الطالب<input id="sn" class="big" inputmode="numeric" autocomplete="off" placeholder="—"></label>
      <div class="who" id="who"><small>اكتب الرقم المكتوب على بطاقته أو في «بطاقتي».</small></div>
      ${sell ? `<div class="items">${(D.items || []).map(i => `<button class="item${STF.item === i.id ? ' on' : ''}" data-item="${esc(i.id)}"><span class="ie" aria-hidden="true">${esc(i.e || '🎁')}</span><b>${esc(i.n)}</b>${money(i.p)}${i.s != null ? `<small>بقي ${i.s}</small>` : ''}</button>`).join('') || '<p class="empty">المتجر فارغ.</p>'}</div>`
        : `<div class="amts">${amts.map(a => `<button data-amt="${a}" class="${STF.amt === a ? 'on' : ''}">${a > 0 ? '+' + a : '−' + Math.abs(a)}</button>`).join('')}</div>
      <div class="chips">${['حضور', 'مشاركة', 'فوز في مسابقة', 'انضباط', 'تعاون', 'إبداع', 'مخالفة'].map(r => `<button class="chip${STF.reason === r ? ' on' : ''}" data-reason="${r}">${r}</button>`).join('')}</div>`}
      <button class="btn" data-act="${sell ? 'sell' : 'coin'}" style="margin-top:14px">${sell ? 'بيع' : 'امنح'}</button>
      <p class="note">حدّك: ${lim} عملة في المرّة. كلّ حركة تُسجَّل باسمك.</p>`);
    const inp = v.querySelector('#sn');
    inp.oninput = () => { const m = (D.members || []).find(x => String(x.no) === inp.value.trim()); document.getElementById('who').innerHTML = m ? `<span class="dot" style="--c:${esc(team(m.t).color)}"></span><span><b>${esc(m.n)}</b><small> · ${esc(team(m.t).name)} · الرصيد ${m.b}</small></span>` : '<small>اكتب الرقم المكتوب على بطاقته أو في «بطاقتي».</small>'; };
  }
  async function act(kind) {
    let body;
    if (kind === 'point') { if (!STF.team) { toast('اختر الفريق', 1); return; } body = { kind: 'point', team: STF.team, points: STF.pts, reason: STF.reason }; }
    else {
      const no = ((document.getElementById('sn') || {}).value || '').trim(); if (!no) { toast('اكتب رقم الطالب', 1); return; }
      if (kind === 'sell' && !STF.item) { toast('اختر الصنف', 1); return; }
      body = kind === 'sell' ? { kind: 'sell', member_no: +no, item: STF.item } : { kind: 'coin', member_no: +no, amount: STF.amt, reason: STF.reason };
    }
    const btn = document.querySelector('[data-act="' + kind + '"]'); if (btn) btn.disabled = true;
    try {
      const r = DEMO ? demoAct(body) : await post('/season/staff/act', { code: saved.code, pin: saved.pin, act: body });
      if (kind === 'point') { D.teams = D.teams || {}; D.teams[STF.team] = (D.teams[STF.team] || 0) + STF.pts; toast(`${STF.pts > 0 ? '+' : ''}${STF.pts} لـ${team(STF.team).name}`); OPEN.teams(); }
      else {
        const m = (D.members || []).find(x => x.no === body.member_no); if (m) m.b = r.balance;
        if (kind === 'coin' && body.amount > 0) D.me.given = (D.me.given || 0) + body.amount;
        toast(kind === 'sell' ? `بِيع «${r.item}» — رصيده ${r.balance}` : `${body.amount > 0 ? '+' : ''}${body.amount} لـ${String(r.name).split(' ')[0]} — رصيده ${r.balance}`); staffForm();
      }
    } catch (e) { toast(e.message, 1); if (btn) btn.disabled = false; }
  }

  document.addEventListener('click', e => {
    const rl = e.target.closest('[data-role]'); if (rl) { ROLE = rl.dataset.role; try { localStorage.setItem('jw_role', ROLE); } catch (er) {} login(); return; }
    if (e.target.closest('[data-role-reset]')) { ROLE = null; try { localStorage.removeItem('jw_role'); } catch (er) {} login(); return; }
    const ac2 = e.target.closest('[data-avcat]'); if (ac2) { AVC = ac2.dataset.avcat; avPaint(); return; }
    const ak = e.target.closest('[data-avk]'); if (ak) { AVE[ak.dataset.avk] = +ak.dataset.avv; avPaint(); avPop(); return; }
    const rx = e.target.closest('[data-react]'); if (rx) { react(rx.dataset.react); return; }
    const pk = e.target.closest('[data-pk]'); if (pk) { PUB.kind = pk.dataset.pk; pk.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === pk)); const f = document.getElementById('pnoF'); if (f) f.hidden = PUB.kind !== 'honor'; return; }
    const wp = e.target.closest('[data-wall]'); if (wp) { wallStyle = wp.dataset.wall; try { localStorage.setItem('jw_wall', wallStyle); } catch (er) {} setWall(MODE === 'staff' ? 'staff' : null); wp.parentElement.querySelectorAll('.wpick').forEach(b => b.classList.toggle('on', b === wp)); return; }
    const so = e.target.closest('[data-svopen]'); if (so) { survOpen(so.dataset.svopen); return; }
    const sv = e.target.closest('[data-sv]'); if (sv) { svPick(sv); return; }
    const o = e.target.closest('[data-open]'); if (o && OPEN[o.dataset.open]) { OPENED = o.dataset.open; OPEN[o.dataset.open](); return; }
    const dy = e.target.closest('[data-day]'); if (dy) { OPEN.cal(dy.dataset.day); return; }
    const rk = e.target.closest('[data-rk]'); if (rk) { OPEN.trophy(rk.dataset.rk); return; }
    const pr = e.target.closest('[data-prod]'); if (pr) { prod(+pr.dataset.prod); return; }
    const xa = e.target.closest('[data-xamt]'); if (xa) { XF.amt = +xa.dataset.xamt; const ia = document.getElementById('xa'); if (ia) ia.value = XF.amt; xa.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === xa)); xferBtn(); return; }
    const vm = e.target.closest('[data-vno]'); if (vm) { OPEN.scan(+vm.dataset.vno); return; }
    const c = e.target.closest('[data-close]'); if (c) { const au = document.getElementById('adhanAudio'); if (au && !au.paused && !document.querySelector('.adhan')) { au.pause(); au.currentTime = 0; } c.closest('.view').remove(); if (D) home(); return; }
    const pick = (attr, set) => { const b = e.target.closest('[' + attr + ']'); if (!b) return false; set(b.getAttribute(attr)); b.parentElement.querySelectorAll('[' + attr + ']').forEach(x => x.classList.toggle('on', x === b)); return true; };
    if (pick('data-amt', v => STF.amt = +v) || pick('data-pts', v => STF.pts = +v) || pick('data-reason', v => STF.reason = v) || pick('data-item', v => STF.item = v) || pick('data-team', v => STF.team = v)) return;
    const ac = e.target.closest('[data-act]'); if (ac && ac.dataset.act === 'publish') { publish(); return; } if (ac && ac.dataset.act === 'svsend') { survSend(ac); return; } if (ac && ac.dataset.act === 'xsend') { xferSend(ac); return; } if (ac && ac.dataset.act === 'camera') { scanCam(); return; } if (ac && ac.dataset.act === 'scanlogin') { scanLogin(); return; } if (ac && ac.dataset.act === 'checkin') { checkin(ac); return; } if (ac && ac.dataset.act === 'adhantest') { adhanTest(ac); return; } if (ac && ac.dataset.act === 'avsave') { avSave(ac); return; } if (ac) { if (ac.dataset.act === 'notif') { Notification.requestPermission().then(() => OPEN.pray()); return; } act(ac.dataset.act); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const v = document.querySelector('.view'); if (v) { v.remove(); if (D) home(); } } });

  /* ═════════ التنبيهات: الصلاة (شاشة كاملة + صوت الأذان إن وُضع ملفّه، وإلا نغمة) والنشاط القادم قبل ١٠ دقائق ═════════ */
  const fired = new Set();
  function tone() { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [523.25, 659.25, 783.99].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(ac.destination); const t0 = ac.currentTime + i * .5; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.25, t0 + .05); g.gain.exponentialRampToValueAtTime(.001, t0 + 1.4); o.start(t0); o.stop(t0 + 1.5); }); } catch (e) {} }
  /* المتصفّحات (خاصّة الآيفون) تمنع الصوت بلا لمسة: أوّل لمسة في التطبيق «تفتح» عنصر الأذان صامتاً ليعمل وقت الصلاة */
  let audioOK = false;
  document.addEventListener('pointerdown', () => { if (audioOK) return; const a = document.getElementById('adhanAudio'); if (!a) return; a.muted = true; const p = a.play(); if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; audioOK = true; }).catch(() => { a.muted = false; }); }, { passive: true });
  function adhanTest(btn) { const a = document.getElementById('adhanAudio'); if (!a.paused) { a.pause(); a.currentTime = 0; btn.textContent = '🔊 اسمع الأذان'; return; } a.muted = false; a.play().then(() => { btn.textContent = '■ إيقاف'; a.onended = () => { btn.textContent = '🔊 اسمع الأذان'; }; }).catch(() => toast('تعذّر تشغيل الصوت', 1)); }
  function sound() { try { const a = document.getElementById('adhanAudio'); const p = a.play(); if (p) p.catch(tone); } catch (e) { tone(); } }
  function notify(title, body) { try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: '../assets/apps/default/prayer.webp' }); } catch (e) {} }
  function adhan(name) {
    const d = document.createElement('div'); d.className = 'adhan'; d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-label', 'وقت الصلاة');
    d.innerHTML = `<div class="moon" aria-hidden="true">🕌</div><h1>حان الآن وقت صلاة ${name}</h1><p>حيّ على الصلاة، حيّ على الفلاح</p><button class="btn" style="max-width:320px">حسناً</button>`;
    d.querySelector('button').onclick = () => { d.remove(); try { const a = document.getElementById('adhanAudio'); a.pause(); a.currentTime = 0; } catch (e) {} };
    document.body.appendChild(d); sound(); notify('حان وقت صلاة ' + name, D ? D.season.name : '');
  }
  setInterval(() => {
    if (!D) return; const nowD = new Date(), [, [la, ln]] = cityLL(), key = nowD.toDateString();
    prayers(nowD, la, ln).filter(p => p[0] !== 'الشروق').forEach(([n, t]) => { const k = key + n, diff = nowD - t; if (diff >= 0 && diff < 90000 && !fired.has(k)) { fired.add(k); adhan(n); } });
    (D.schedule || []).forEach(x => { if (!x.f) return; const t = new Date(x.d + 'T' + x.f + ':00'), k = 'a' + x.d + x.f + x.t, diff = t - nowD; if (diff > 0 && diff <= 600000 && !fired.has(k)) { fired.add(k); toast(`بعد ${Math.max(1, Math.round(diff / 60000))} دقائق: ${x.t}`); notify('النشاط القادم: ' + x.t, x.p || ''); } });
    const el = document.getElementById('cd'); if (el) el.textContent = cd(nextPrayer()[1] - nowD);
  }, 20000);
  setInterval(() => { if (D && saved && saved.pin && !document.hidden && !document.querySelector('.view') && !DEMO) fetchData(saved.code, saved.pin); }, 60000);

  /* ═════════ بيانات توضيحيّة ═════════ */
  const T = [{ id: 'g', name: 'الأخضر', color: '#16A34A' }, { id: 'r', name: 'الأحمر', color: '#DC2626' }, { id: 'b', name: 'الأزرق', color: '#2563EB' }, { id: 'o', name: 'البرتقاليّ', color: '#EA580C' }];
  const iso = ms => new Date(Date.now() + ms).toISOString().slice(0, 10);
  const SCH = () => [{ d: iso(0), f: '16:30', e: '17:15', t: 'الاستقبال والتسجيل', p: 'البوّابة', g: '' }, { d: iso(0), f: '17:30', e: '18:15', t: 'صلاة العصر ودرس قصير', p: 'المصلّى', g: '' }, { d: iso(0), f: '18:30', e: '19:30', t: 'دوري كرة القدم', p: 'الملعب', g: '' }, { d: iso(0), f: '19:45', e: '20:30', t: 'وجبة العشاء', p: 'الساحة', g: '' }, { d: iso(0), f: '20:45', e: '21:30', t: 'مسابقة خلية الحروف', p: 'القاعة', g: 'متوسط' },
    { d: iso(864e5), f: '16:00', e: '21:00', t: 'رحلة البحر', p: 'شاطئ نصف القمر', g: '' }, { d: iso(2 * 864e5), f: '17:00', e: '18:30', t: 'ورشة تصوير بالجوال', p: 'المعمل', g: '' }, { d: iso(2 * 864e5), f: '19:00', e: '20:00', t: 'مسابقة السيرة', p: 'القاعة', g: '' }];
  const ITM = [{ id: 'i1', n: 'وجبة عشاء', p: 30, e: '🍔', d: 'برجر مع بطاطس وعصير من مطعم الموسم.' }, { id: 'i5', n: 'آيس كريم', p: 15, e: '🍦', d: 'كوب آيس كريم بالنكهة التي تختارها.' }, { id: 'i2', n: 'كرة قدم', p: 150, s: 3, e: '⚽', d: 'كرة مقاس ٥ — لك أن تأخذها للبيت.' },
    { id: 'i6', n: 'قبّعة الموسم', p: 80, s: 12, e: '🧢', d: 'قبّعة بشعار الموسم ولون فريقك.' }, { id: 'i3', n: 'اختيار النشاط', p: 100, e: '🎯', d: 'فريقك يختار نشاط يوم الخميس.' }, { id: 'i4', n: 'الصفّ الأوّل في الرحلة', p: 200, s: 1, e: '🚌', d: 'مقعدك محجوز في الصفّ الأوّل في رحلة البحر.' },
    { id: 'i7', n: 'شاحن متنقّل', p: 250, s: 2, e: '🔋', d: '١٠ آلاف ملّي أمبير — للرحلات الطويلة.' }, { id: 'i8', n: 'كتاب قصص', p: 60, s: 5, e: '📚', d: 'قصص الأنبياء للناشئة — طبعة مصوّرة.' }];
  function sample() {
    const t = new Date().toISOString();
    return { season: { name: 'النادي الصيفيّ ١٤٤٨', org: 'جمعيّة تجريبيّة', code: 'DEMO42', teams: T, settings: { city: 'الأحساء' } }, me: { name: 'يزن عمر الحربي', no: 8, team: 'r', stage: Q.get('stage') || (WALL[ROLE] ? ROLE : 'متوسط'), att: 6, avatar: AVSAVED(), grade: 'الثاني المتوسّط', school: 'متوسّطة الملك فهد', photo: '', balance: 145, sentToday: 1,
      tx: [{ a: 20, r: 'حوالة من فهد #3 — شكراً', t }, { a: 50, r: 'فوز في مسابقة', t }, { a: -30, r: 'شراء: وجبة عشاء', t: new Date(Date.now() - 864e5).toISOString() }, { a: -10, r: 'حوالة إلى بدر #7', t: new Date(Date.now() - 864e5).toISOString() }, { a: 25, r: 'انضباط', t: new Date(Date.now() - 2 * 864e5).toISOString() }, { a: 90, r: 'إبداع', t: new Date(Date.now() - 2 * 864e5).toISOString() }] },
      teams: { r: 120, g: 95, b: 80, o: 40 }, rich: [{ n: 'فهد', team: 'g', g: 'ثانوي', b: 210 }, { n: 'يزن', team: 'r', g: 'متوسط', b: 145 }, { n: 'بدر', team: 'b', g: 'ابتدائي', b: 120 }, { n: 'سلمان', team: 'o', g: 'متوسط', b: 95 }, { n: 'نواف', team: 'g', g: 'ابتدائي', b: 70 }, { n: 'مشاري', team: 'b', g: 'ثانوي', b: 40 }], items: ITM, schedule: SCH() };
  }
  function AVSAVED() { try { return JSON.parse(localStorage.getItem('jw_demo_av') || '{}'); } catch (e) { return {}; } }
  function sampleStaff() {
    const names = ['محمد أحمد', 'عبدالله سعد', 'فهد خالد', 'سلمان علي', 'نواف ماجد', 'يزن عمر', 'بدر سامي', 'مشاري حمد'];
    return { season: { name: 'النادي الصيفيّ ١٤٤٨', org: 'جمعيّة تجريبيّة', teams: T, settings: { city: 'الأحساء' } }, me: { name: 'عبدالرحمن الميسّر', avatar: AVSAVED(), role: 'staff', stage: 'متوسط', perms: { coins: 50, points: true, sell: true }, given: 340 },
      members: names.map((n, i) => ({ id: 'm' + i, no: i + 1, n, g: ['متوسط', 'ابتدائي', 'ثانوي'][i % 3], av: {}, t: T[i % 4].id, b: [40, 120, 210, 15, 60, 145, 90, 0][i] })), teams: { r: 120, g: 95, b: 80, o: 40 }, items: ITM, schedule: SCH() };
  }
  function sampleFeed() {
    const h = n => new Date(Date.now() - n * 3600e3).toISOString();
    return [
      { id: 'f1', k: 'honor', t: 'نجم اليوم: الانضباط والصلاة في وقتها', b: 'حافظ على صلاة الجماعة طوال الأسبوع وكان قدوةً لفريقه. بارك الله فيه.', img: '', at: h(1), by: 'عبدالرحمن الخالدي', staff: true, hon: { n: 'يزن عمر', g: 'متوسط' }, r: { 'متوسط': 24, 'ابتدائي': 9, 'ثانوي': 6, 'جامعي': 4 }, mine: false },
      { id: 'f2', k: 'program', t: 'غداً: رحلة البحر 🌊', b: 'التجمّع الساعة ٤ عصراً عند البوّابة. أحضر قبّعتك وماءك. الحضور يُحسب بـ٢٠ عملة.', img: './walls/primary-wave.jpg', at: h(3), by: 'الإدارة', staff: false, r: { 'ابتدائي': 31, 'متوسط': 18, 'ثانوي': 11 }, mine: true },
      { id: 'f3', k: 'teaser', t: 'شيءٌ كبير قادم يوم الخميس… 👀', b: 'خمّنوا!', img: './walls/middle-sunset.jpg', at: h(6), by: 'الإدارة', staff: false, r: { 'متوسط': 40, 'ثانوي': 22, 'ابتدائي': 15, 'جامعي': 7 }, mine: false },
      { id: 'f4', k: 'news', t: 'الأحمر يتصدّر دوري كرة القدم', b: 'فوز ٣–١ على الأزرق في مباراة حماسيّة. الترتيب في تطبيق «الترتيب».', img: './walls/secondary-forest.jpg', at: h(26), by: 'فيصل العتيبي', staff: true, r: { 'ثانوي': 17, 'متوسط': 12 }, mine: false },
    ];
  }
  function demoMember(no) { const m = (D.members || []).find(x => x.no === no); return m ? { found: true, no: m.no, n: m.n, g: m.g, grade: '', t: m.t, photo: '', b: m.b } : { found: false }; }
  function demoAct(b) {
    if (b.kind === 'point') return { ok: true };
    const m = (D.members || []).find(x => x.no === b.member_no); if (!m) throw new Error('لا يوجد مشارك بهذا الرقم');
    if (b.kind === 'coin') { if (Math.abs(b.amount) > D.me.perms.coins) throw new Error('الحدّ المسموح لك ' + D.me.perms.coins + ' عملة'); if (m.b + b.amount < 0) throw new Error('الرصيد لا يكفي للخصم'); return { ok: true, name: m.n, balance: m.b + b.amount }; }
    const it = ITM.find(i => i.id === b.item); if (m.b < it.p) throw new Error('الرصيد لا يكفي (' + m.b + ')'); return { ok: true, name: m.n, balance: m.b - it.p, item: it.n };
  }
  const L0 = loginLink(location.href);
  if (L0 && !DEMO) { MODE = L0.staff ? 'staff' : 'me'; ROLE = L0.staff ? 'staff' : ROLE; history.replaceState(null, '', location.pathname); fetchData(L0.c, L0.p, true); }
  else if (DEMO && Q.get('as')) { ROLE = Q.get('as') === 'staff' ? 'staff' : (Q.get('stage') || ROLE || 'متوسط'); fetchData(); }
  else if (!DEMO && saved && saved.pin) fetchData(saved.code, saved.pin); else login();
})();
