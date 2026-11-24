/*
 * «جوّالي» — الطالب: POST /season/me {code,pin}   ·   المشرف: POST /season/staff و /season/staff/act
 * (دالّة api: localhost ← staging، والموقع ← production). ?demo=1 بيانات توضيحيّة، و&as=staff للمشرف، و&stage= للمرحلة.
 * المواقيت محسوبة محلّيّاً بطريقة أمّ القرى حسب مدينة الموسم (settings.city).
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search), NAT = window.JW_NATIVE || null, LOCAL = NAT ? NAT.staging : /^(localhost|127\.0\.0\.1)$/.test(location.hostname), DEMO = Q.get('demo') === '1', DPICK = Q.get('demo') === 'pick';
  const API = LOCAL ? 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech' : 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech';
  const $ = document.getElementById('app'), K = 'jawwali2', WEB = NAT ? 'https://ibrahimsaud.com/charity/' : '../';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const RS = '<svg class="rsym" viewBox="0 0 1124.14 1256.39" role="img" aria-label="ريال"><path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/></svg>';
  /* عملة الموسم: اسمها ورمزها من الإعدادات (settings.currency) — الافتراض «العملات» برمز الريال */
  const CUR = () => { const c = ((typeof D !== 'undefined' && D && D.season.settings) || {}).currency || {}; return { name: c.name || 'الريالات', one: c.one || 'ريال', icon: c.icon || '', img: c.img || '' }; };
  const money = (n, cls) => `<span class="money${cls ? ' ' + cls : ''}" dir="ltr">${CUR().img ? `<img class="cimg" src="${esc(imgSrc(CUR().img))}" alt="">` : CUR().icon ? `<i class="cico" aria-hidden="true">${esc(CUR().icon)}</i>` : RS}<b>${Number(n || 0).toLocaleString('en-US')}</b></span>`;
  const SV = { out: P('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'), ref: P('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>'), send: P('<path d="M7 17 17 7M8 7h9v9"/>'), recv: P('<path d="M17 7 7 17M16 17H7V8"/>'), xfer: P('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'), bag: P('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'), star: P('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>'), minus: P('<path d="M5 12h14"/>'), pin: P('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'), cam: P('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'), person: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4.2"/><path d="M3.5 21c.8-4.6 4.2-7 8.5-7s7.7 2.4 8.5 7z"/></svg>' };
  /* أيقونات خطّيّة بيضاء بدل الإيموجي (قاعدة المنتج: لا إيموجي في الواجهة) */
  const IP = { bus: '<path d="M8 6v6M16 6v6M2 12h20M7 18h10M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="m15.5 13.5 1.5 8.5-5-3-5 3 1.5-8.5"/>', camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>', bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>', gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>', share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>', ball: '<circle cx="12" cy="12" r="10"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/><path d="M12 2v5M16 10l5-1.5M14.5 15l3 4.5M9.5 15l-3 4.5M8 10 3 8.5"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>', food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>', users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    spark: '<path d="M12 3l1.9 5.8L20 10l-5 3.9L16.6 20 12 16.6 7.4 20 9 13.9 4 10l6.1-1.2z"/>', sprout: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', sq: '<rect x="3" y="3" width="18" height="18" rx="5"/>', sqok: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 12 3 3 5-6"/>', cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>' };
  const I = (k, cls) => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IP[k] || IP.spark}</svg>`;
  /* رمز QR يُرسم SVG من مكتبة qrcode-generator (vendor/qrcode.min.js) */
  function qrSVG(text) { try { const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`; return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="رمز التحقّق" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`; } catch (e) { return ''; } }
  const verifyURL = no => (NAT ? 'https://ibrahimsaud.com/charity/season/' : location.origin + location.pathname) + '?' + (DEMO ? 'demo=1&as=staff&' : '') + 'v=' + no + (D && D.season.code ? '&c=' + D.season.code : '');
  /* الخلفيّات: الطالب بلون مرحلته (ألوان حروف ودروس) والمشرف بالجرافيت */
  const WALL = { 'ابتدائي': ['primary', '#00C6FF'], 'متوسط': ['middle', '#FF9000'], 'ثانوي': ['secondary', '#1A3365'] };
  const CITIES = { 'الرياض': [24.7136, 46.6753], 'جدة': [21.4858, 39.1925], 'مكة المكرمة': [21.3891, 39.8579], 'المدينة المنورة': [24.5247, 39.5692], 'الدمام': [26.4207, 50.0888], 'الخبر': [26.2794, 50.2083],
    'الأحساء': [25.3833, 49.5867], 'القطيف': [26.5196, 50.0115], 'الجبيل': [27.0046, 49.646], 'الطائف': [21.2703, 40.4158], 'أبها': [18.2164, 42.5053], 'خميس مشيط': [18.3, 42.7333], 'تبوك': [28.3838, 36.555],
    'حائل': [27.5114, 41.69], 'بريدة': [26.326, 43.975], 'عنيزة': [26.0844, 43.9935], 'جازان': [16.8892, 42.5511], 'نجران': [17.5656, 44.2289], 'الباحة': [20.0129, 41.4677], 'سكاكا': [29.9697, 40.2064], 'عرعر': [30.9753, 41.0381], 'ينبع': [24.0895, 38.0618] };
  const MEDIA = LOCAL ? 'https://br-red-smoke-baq7yp0d.storage.c-8.eu-central-1.aws.neon.tech/media' : 'https://br-dark-band-bajth6rv.storage.c-8.eu-central-1.aws.neon.tech/media';
  const imgSrc = p => !p ? '' : (window.JW_LIB && JW_LIB.src(p, './')) || (/^(https?:|data:|\.\/)/.test(p) ? p : MEDIA + '/' + String(p).split('/').map(encodeURIComponent).join('/'));
  /* لون كلّ مرحلة في كلّ لمسة (القلب، نقاط التفاعل، شارة التكريم) — والمشرف (جامعي) بالأسود */
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
     الطالب والمشرف: مسح رمز البطاقة أو رمز الموسم + الرمز السرّيّ · الإدارة: البريد وكلمة المرور في النظام نفسه (صلاحيّات كاملة) */
  let ROLE = null; try { if (Q.get('role') === 'reset') localStorage.removeItem('jw_role'); ROLE = localStorage.getItem('jw_role'); } catch (e) {}
  const ROLES = [['ابتدائي', 'طالب ابتدائي', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 3, wc: 1, c: 7, cc: 8, b: 8, s: 2, e: 2, m: 1, fs: 5, h: 0 }],
    ['متوسط', 'طالب متوسط', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 0, h: 2, hc: 1, c: 7, cc: 6, b: 9, s: 4, e: 0, m: 6, fs: 0 }],
    ['ثانوي', 'طالب ثانوي', 'عملاتك، جدولك، صلاتك، وفريقك', { w: 1, ws: 5, c: 0, b: 10, s: 3, e: 4, m: 2, fs: 2 }],
    ['staff', 'مشرف', 'امنح، تحقّق من الدخول، انشر — دخول سريع بالرمز', { w: 2, ws: 0, c: 0, b: 11, s: 5, f: 7, g: 6, fs: 3, e: 0, m: 0 }],
    ['admin', 'الإدارة', 'المدير التنفيذي والمدراء — بالبريد وكلمة المرور', { w: 1, ws: 1, c: 1, b: 6, s: 2, f: 8, fs: 2, e: 0, m: 0 }]];
  const ROLE_ART = { 'ابتدائي': 'pro3d/020.webp', 'متوسط': '3d/029.webp', 'ثانوي': 'pro3d/024.webp', staff: 'pro3d/025.webp', admin: 'pro3d/022.webp' };
  const roleArt = (k, av) => ROLE_ART[k] ? `<img src="./avatars/${ROLE_ART[k]}" alt="" decoding="async">` : AV.svg(av);
  const roleColor = k => STAGEC[k] || (k === 'staff' ? '#1C1C1E' : '#1003BD');
  function rolePick() {
    const dk = document.getElementById('dock'); if (dk) dk.remove();
    setWall('staff', 'wave');
    const attr = DPICK ? 'data-demo' : 'data-role';
    $.innerHTML = `<div class="scr"><div class="onb">${DPICK ? `<button class="rback" data-demo-exit>‹ رجوع</button><h1>جرّب التطبيق</h1><p>بيانات توضيحيّة لجمعيّة تجريبيّة — تصفّح بحرّيّة، لا شيء يُحفظ. اختر الدور:</p>` : `<h1>جوّالي</h1><p>أهلاً بك في الموسم. من أنت؟</p>`}
      <div class="roles">${ROLES.map(([k, n, d, av]) => `<button class="role" ${attr}="${k}" style="--rc:${roleColor(k)}"><span class="rav">${roleArt(k, av)}</span><span class="rtx"><b>${n}</b><small>${DPICK && k === 'admin' ? 'النظام كاملاً: الموقع، الحوكمة، المالية، الموسم' : d}</small></span><span class="chev" aria-hidden="true">‹</span></button>`).join('')}</div>
      ${DPICK ? '' : `<button class="demo-cta" data-demo-pick><b>جرّب التطبيق بدون حساب</b><small>طالب، مشرف، أو إدارة — ببيانات توضيحيّة</small></button>`}</div></div>`;
  }
  function login(msg) {
    const dk = document.getElementById('dock'); if (dk) dk.remove();
    if (!ROLE) { rolePick(); return; }
    const r = ROLES.find(x => x[0] === ROLE) || ROLES[1], staff = ROLE === 'staff', admin = ROLE === 'admin';
    MODE = staff ? 'staff' : 'me';
    if (DEMO && !admin) { fetchData(); return; }
    setWall(staff || admin ? 'staff' : null, 'wave');
    const head = `<button class="rback" data-role-reset>‹ تغيير</button><div class="lhead"><span class="rav big" style="--rc:${roleColor(ROLE)}">${roleArt(ROLE, r[3])}</span><h1>${r[1]}</h1></div>`;
    if (admin) {
      $.innerHTML = `<div class="scr"><div class="login">${head}<p>المدير التنفيذي وفريق الإدارة يدخلون النظام كاملاً بالبريد وكلمة المرور: الموقع، الحوكمة، المال، والموسم.</p>
        <a class="btn" href="${WEB}${DEMO ? 'index.html?demo=1' : ''}">الدخول بالبريد وكلمة المرور</a><p class="note">نسيت كلمة المرور؟ تستعيدها من شاشة الدخول نفسها.</p></div></div>`;
      return;
    }
    const cam = !!NAT || 'BarcodeDetector' in window;
    $.innerHTML = `<div class="scr"><div class="login">${head}
      ${cam ? `<button class="btn" data-act="scanlogin">${SV.cam} ${staff ? 'امسح رمز الدخول' : 'امسح الرمز على بطاقتك'}</button><video id="lcam" playsinline muted hidden></video>`
        : `<div class="note">${staff ? 'امسح رمز الدخول الذي أرسلته لك الإدارة' : 'امسح الرمز المطبوع على بطاقتك'} بكاميرا الجوال — يفتح «جوّالي» ويدخلك مباشرة.</div>`}
      <div class="or"><span>أو بالرمز</span></div>
      <label class="fld">رمز الموسم<input id="c" maxlength="6" autocapitalize="characters" autocomplete="off" value="${esc((saved || {}).code || Q.get('c') || '')}"></label>
      <label class="fld">${staff ? 'رمز المشرف' : 'رمزك السرّيّ (على بطاقتك)'}<input id="p" maxlength="6" inputmode="numeric" autocomplete="off"></label>
      <p class="err" id="e" role="alert">${esc(msg || '')}</p><button class="btn sec" id="go">دخول</button></div></div>`;
    const go = () => fetchData(document.getElementById('c').value.trim().toUpperCase(), document.getElementById('p').value.trim(), true);
    document.getElementById('go').onclick = go;
    document.getElementById('p').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }
  /* الدخول بمسح رمز البطاقة: الرمز رابط فيه رمز الموسم والرمز السرّيّ (c و p) */
  function loginLink(raw) { try { const u = new URL(raw, location.href), c = u.searchParams.get('c'), p = u.searchParams.get('p'); return c && p ? { c: c.toUpperCase(), p, staff: u.searchParams.get('as') === 'staff' } : null; } catch (e) { return null; } }
  async function scanLogin() {
    if (NAT) { try { const L = loginLink(await NAT.scan(ROLE === 'staff' ? 'امسح رمز الدخول' : 'امسح الرمز على بطاقتك')); if (!L) { toast('هذا ليس رمز دخول «جوّالي»', 1); return; } MODE = L.staff ? 'staff' : 'me'; fetchData(L.c, L.p, true); } catch (e) {} return; }
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
      home(); deepLink(); if (PEND) { const f = PEND; PEND = null; f(); } if (NAT) NAT.push.sync({ code, pin, as: MODE === 'staff' ? 'staff' : 'me' }, API); Promise.all([loadFeed(), loadSurv()]).then(() => { if (!document.querySelector('.view')) home(); });
    } catch (e) { if (fromLogin || !D) login(e.message); else toast(e.message, 1); }
  }
  let linked = false, PEND = null;
  function deepLink() { const op = Q.get('open'); if (op && ['pray', 'cal', 'news', 'bank'].includes(op) && !linked) { linked = true; OPEN[op](); return; } const v = +Q.get('v'); if (!v || linked) return; linked = true; if (MODE === 'staff') OPEN.scan(v); else if (v !== D.me.no) OPEN.xfer(v); }
  function setWall(kind, fixed) {
    const w = document.getElementById('wall');
    if (kind === 'staff') { const sty = fixed || (STY_STAFF.some(x => x[0] === wallStyle) ? wallStyle : 'graphite'); w.style.backgroundImage = `url(./walls/staff-${sty}.jpg)`; document.documentElement.style.setProperty('--tc', '#48484A'); document.documentElement.style.setProperty('--sc', '#1C1C1E'); return; }
    const st = (D && D.me && D.me.stage) || (WALL[ROLE] ? ROLE : ''), x = WALL[st] || WALL['متوسط'], c = ((((D || {}).season || {}).settings) || {}).stages || {};
    const sty = fixed || (STY_ME.some(y => y[0] === wallStyle) ? wallStyle : 'wave');
    w.style.backgroundImage = `url(./walls/${x[0]}-${sty}.jpg)`;
    document.documentElement.style.setProperty('--tc', c[st] || x[1]); document.documentElement.style.setProperty('--sc', STAGEC[st] || x[1]); document.documentElement.style.setProperty('--sf', onColor(STAGEC[st] || x[1]));
  }
  const team = id => ((D.season.teams || []).find(t => t.id === id)) || { name: '', color: '#888' };
  const fmtDay = d => { try { return new Date(d + 'T00:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return d; } };
  const now = () => new Date().toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
  const hijri = () => { try { return new Date().toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } };
  // أيقونات النظام المعتمدة نفسها (رسوم Icon Composer) — المشرف بنسختها الداكنة
  const app = (k, n, art) => `<button class="app" data-open="${k}"><span class="ic">${(k === 'news' && newPosts()) || (k === 'survey' && SURV.some(x => !x.done)) ? '<i class="badge" aria-label="جديد"></i>' : ''}${art ? `<img src="../assets/apps/${MODE === 'staff' ? 'dark' : 'default'}/${art}.webp?v=2" alt="">` : SV[k]}</span><span>${n}</span></button>`;

  /* ═════════ الجدول المتكرّر: كلّ نشاط أسبوعيّ (r = يوم الأسبوع) يُولَّد في الأسابيع القادمة؛ والمؤرّخ كما هو ═════════ */
  function occ(ahead) {
    const out = [], t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    (D.schedule || []).forEach(x => {
      if (x.r == null) { out.push(x); return; }
      for (let i = 0; i < (ahead || 21); i++) { const d = new Date(t0.getTime() + i * 864e5); if (d.getDay() === +x.r && iso(d) >= x.d) out.push(Object.assign({}, x, { d: iso(d), rep: true })); }
    });
    return out.sort((a, b) => (a.d + (a.f || '')).localeCompare(b.d + (b.f || '')));
  }
  /* ═════════ التحفيز طوال السنة: أسابيع الحضور المتتالية ومستوى الحضور ═════════ */
  const BDG = n => `<img class="bdg" src="./badges/${n}.webp" alt="">`;
  const LEVELS = [[0, 'مبتدئ', I('sprout', 'lvl0')], [4, 'برونزيّ', BDG('bronze')], [12, 'فضّيّ', BDG('silver')], [24, 'ذهبيّ', BDG('gold')], [40, 'ماسيّ', BDG('diamond')]];
  function level(n) { let k = 0; LEVELS.forEach((l, i) => { if (n >= l[0]) k = i; }); const nx = LEVELS[k + 1]; return { name: LEVELS[k][1], icon: LEVELS[k][2], next: nx ? nx[1] : '', left: nx ? nx[0] - n : 0, pct: nx ? Math.round((n - LEVELS[k][0]) / (nx[0] - LEVELS[k][0]) * 100) : 100 }; }
  function streak(days) {   // أسابيع متتالية (تبدأ الأحد) فيها حضور، حتى هذا الأسبوع أو الذي قبله
    const wk = d => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() - x.getDay()); return x.toISOString().slice(0, 10); };
    const set = new Set((days || []).map(wk)); let w = new Date(); w.setHours(0, 0, 0, 0); w.setDate(w.getDate() - w.getDay());
    const key = () => new Date(w.getTime() - w.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!set.has(wk(key()))) w = new Date(w.getTime() - 7 * 864e5);
    let n = 0; while (set.has(wk(key())) && n < 60) { n++; w = new Date(w.getTime() - 7 * 864e5); } return n;
  }

  /* ═════════ الشاشة الرئيسيّة ═════════ */
  function home() {
    setWall(MODE === 'staff' ? 'staff' : null);
    const np = nextPrayer(), todayISO = (d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))(new Date()), OC = occ(45), nowHM = new Date().toTimeString().slice(0, 5), next = OC.find(x => x.k !== 'trip' && x.k !== 'zone' && x.k !== 'break' && (x.d > todayISO || (x.d === todayISO && (x.e || x.f || '99') >= nowHM))), trip = OC.find(x => x.k === 'trip' && x.d >= todayISO);
    const top = `<div class="bar"><span>${now()}</span><span>${esc(hijri())}</span></div>`;
    const pw = `<button class="widget pray-next" data-open="pray"><small>الصلاة القادمة · ${esc(cityLL()[0])}</small><b>${np[0]} ${fmtT(np[1])}</b><small>بعد <span class="cd" id="cd">${cd(np[1] - new Date())}</span></small></button>`;
    if (MODE === 'staff') {
      const me = D.me;
      $.innerHTML = `<div class="scr">${top}<button class="meav" data-open="avatar" aria-label="شخصيّتي">${AV.of(me.avatar, me.name)}</button><p class="hello">أهلاً ${esc(me.name.split(' ')[0])}</p><p class="sub">${me.role === 'lead' ? 'قائد' : me.role === 'guest' ? 'ضيف' : 'مشرف'}${me.stage ? ' · ' + esc(me.stage) : ''} · ${esc(D.season.name)}</p>
        ${me.daily ? budgetWidget() : ''}<div class="apps">${app('news', 'الأخبار', 'w-news')}${me.perms && me.perms.post === false ? '' : app('publish', 'انشر', 'w-testimonials')}${app('give', 'امنح', 'finance')}${can('fine') ? app('fine', 'مخالفة', 'governance') : ''}${can('customs') ? app('customs', esc(((D.season.settings || {}).customs || {}).name || 'الجمارك'), 'ledger') : ''}${me.perms && me.perms.points === false ? '' : app('teams', 'نقاط الفرق', 'season')}${me.perms && me.perms.sell ? app('counter', 'الكاونتر' + ((D.orders || []).length ? ' (' + D.orders.length + ')' : ''), 'procurement') : ''}${can('guests') ? app('guest', 'رمز ضيف', 'myhr') : ''}${((D.season.settings || {}).zones || []).length ? app('zone', 'مكاني', 'site') : ''}${D.me.role === 'guest' ? '' : app('com', D.me.committee ? 'لجنتي' : 'اعتذار', D.me.committee ? 'team' : 'calendar')}${D.me.role === 'guest' ? '' : app('follow', 'المتابعة', 'tasks')}${(D.season.settings || {}).league && D.me.role !== 'guest' ? app('league', 'الدوري', 'w-programs') : ''}${canCert() ? app('cert', 'شهادة شكر', 'w-documents') : ''}${me.perms && me.perms.store ? app('mstore', 'إدارة المتجر', 'library') : ''}${app('scan', 'تحقّق', 'comply')}${app('people', 'الطلاب', 'beneficiaries')}${app('cal', 'الجدول', 'calendar')}${app('pray', 'الصلاة', 'prayer')}${app('games', 'الألعاب', 'letters')}${app('survey', 'رأيك', 'requests')}${app('trophy', 'الترتيب', 'team')}${app('id', 'بطاقتي', 'hr')}${app('wall', 'الخلفيّة', '_wall')}</div>
        <div class="wrow"><button class="widget" data-open="give"><small>منحتَ هذا الموسم</small><b>${money(me.given || 0)}</b></button><button class="widget" data-open="people"><small>طلابك</small><b>${(D.members || []).length}</b></button></div>
        ${pw}<div id="pushb"></div></div>`;
    } else {
      const t = team(D.me.team);
      $.innerHTML = `<div class="scr">${top}<button class="meav" data-open="avatar" aria-label="شخصيّتي">${AV.of(D.me.avatar, D.me.name)}</button><p class="hello">أهلاً ${esc(D.me.name.split(' ')[0])}</p><p class="sub">${esc(t.name)} · رقمك ${esc(D.me.no)}${D.me.stage ? ' · ' + esc(D.me.stage) : ''}</p>
        <div class="apps">${app('news', 'الأخبار', 'w-news')}${app('bank', 'البنك', 'finance')}${app('cal', 'الجدول', 'calendar')}${app('pray', 'الصلاة', 'prayer')}${app('shop', 'المتجر', 'procurement')}${(D.season.settings || {}).league ? app('league', 'الدوري', 'w-programs') : ''}${app('trophy', 'الترتيب', 'season')}${app('id', 'بطاقتي', 'hr')}${app('survey', 'رأيك', 'requests')}${app('wall', 'الخلفيّة', '_wall')}</div>
        <div class="wrow"><button class="widget" data-open="bank"><small>رصيدك</small><b>${money(D.me.balance)}</b></button><button class="widget" data-open="trophy"><small>فريقك</small><b>${esc(t.name)}</b></button></div>
        ${whereNow()}${(() => { const lv = level(D.me.att || 0), st = streak(D.me.attd); return `<button class="widget lvl" data-open="id"><span class="lv-i" aria-hidden="true">${lv.icon}</span><span><small>مستوى الحضور</small><b>${lv.name}${st ? ` · ${BDG('flame')} ${st} ${st === 1 ? 'أسبوع' : st <= 10 ? 'أسابيع' : 'أسبوعاً'}` : ''}</b>${lv.next ? `<small>باقي ${lv.left} حضور للمستوى ${lv.next}</small><i class="lv-bar"><u style="width:${lv.pct}%"></u></i>` : '<small>أعلى مستوى — ما شاء الله</small>'}</span></button>`; })()}
        ${trip ? `<button class="widget trip hasimg" data-open="cal"><img class="wzi" src="./city/trips.webp" alt=""><small>${I('bus')} الرحلة القادمة · ${esc(fmtDay(trip.d))}</small><b>${esc(trip.t)}</b><small>${(() => { const n = Math.round((new Date(trip.d + 'T00:00:00') - new Date(todayISO + 'T00:00:00')) / 864e5); return n === 0 ? 'اليوم!' : n === 1 ? 'غداً' : 'بعد ' + n + ' يوماً'; })()}${trip.p ? ' · ' + esc(trip.p) : ''}</small></button>` : ''}
        ${pw}${next ? `<button class="widget" data-open="cal"><small>النشاط القادم · ${esc(fmtDay(next.d))}</small><b>${esc(next.t)}</b><small>${esc([next.f && next.f + (next.e ? '–' + next.e : ''), next.p].filter(Boolean).join(' · '))}</small></button>` : ''}
        <div id="pushb"></div></div>`;
    }
    paintDock(); pushBanner();
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
    return `<article class="post k-${esc(p.k)}"><header><span class="pav${p.staff ? ' st avr' : ''}">${p.staff ? AV.of(p.bav, p.by) : esc(String(p.by || '؟').charAt(0))}</span><span class="pby"><b>${esc(p.by)}</b><small>${p.staff ? 'مشرف' : 'الإدارة'} · ${ago(p.at)}</small></span>${kind ? `<em class="pk">${kind}</em>` : ''}</header>
      ${p.img ? `<div class="pimg${p.k === 'teaser' ? ' tz' : ''}"><img src="${esc(imgSrc(p.img))}" alt="" loading="lazy">${p.k === 'teaser' ? '<span>قريباً…</span>' : ''}</div>` : p.k === 'honor' && p.hon ? `<div class="phon" style="--c:${STAGEC[p.hon.g] || '#FF9000'}"><span class="hav">${AV.of(p.hon.av, p.hon.n)}<i><img src="./badges/star.webp" alt=""></i></span><b>${esc(p.hon.n)}</b><small>${esc(p.hon.g || '')}</small></div>` : ''}
      <div class="pb">${p.k === 'honor' && p.hon && p.img ? `<span class="hchip" style="--c:${STAGEC[p.hon.g] || '#FF9000'}">${I('award')} ${esc(p.hon.n)}</span>` : ''}<b>${esc(p.t)}</b>${p.b ? `<p>${esc(p.b)}</p>` : ''}</div>
      <footer><button class="heart${p.mine ? ' on' : ''}" style="--hc:${hc}" data-react="${esc(p.id)}" aria-pressed="${!!p.mine}" aria-label="أعجبني">${HEART}</button><span class="rsum">${sum}</span>${total ? `<small class="rt">${total}</small>` : ''}</footer></article>`;
  }
  function paintFeed() { const el = document.getElementById('feed'); if (el) el.innerHTML = FEED.map(postHTML).join('') || '<div class="emptyimg"><img src="./states/news.webp" alt=""></div><p class="empty">لا منشورات بعد.</p>'; }
  async function react(id) {
    const p = FEED.find(x => x.id === id); if (!p) return;
    const g = MODE === 'staff' ? 'جامعي' : (D.me.stage || 'متوسط'); p.r = p.r || {};
    p.mine = !p.mine; p.r[g] = Math.max(0, (p.r[g] || 0) + (p.mine ? 1 : -1)); if (!p.r[g]) delete p.r[g]; paintFeed();
    if (!DEMO) { try { await post('/season/react', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me', post: id }); } catch (e) { toast(e.message, 1); } }
  }
  /* صورة المشرف: تُصغَّر في الجوال (١٤٤٠ بكسل WebP) ثمّ تُرفع */
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
      view('شكراً لك', `<div class="svthanks"><div aria-hidden="true">${I('check', 'big')}</div><h3>وصل رأيك</h3><p>رأيك يصنع الموسم القادم.</p><button class="btn sec" data-close>تمّ</button></div>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  function sampleSurv() {
    const q = (id, t, l, o) => Object.assign({ id, t, l }, o ? { o } : {});
    return MODE === 'staff' ? [{ id: 'sv2', title: 'رضا المشرفين', intro: 'أنتم قلب الموسم — نريد أن نسمعكم.', done: false, q: [q('a', 'stars', 'وضوح المهامّ والأدوار'), q('b', 'stars', 'دعم الإدارة'), q('c', 'choice', 'هل ترغب بالمشاركة في الموسم القادم؟', ['نعم بالتأكيد', 'ربّما', 'لا']), q('d', 'text', 'ما الذي يجعل تجربتك أفضل؟')] }]
      : [{ id: 'sv1', title: 'رضا المشاركين عن الموسم', intro: 'رأيك يصنع الموسم القادم — دقيقتان فقط.', done: false, q: [q('a', 'stars', 'البرامج والأنشطة'), q('b', 'stars', 'المشرفون وتعاملهم'), q('c', 'choice', 'أكثر شيء أعجبك', ['الرحلات', 'المسابقات', 'الرياضة', 'الدورات والمهارات']), q('d', 'nps', 'هل تنصح صديقك بالتسجيل معنا؟'), q('e', 'text', 'ماذا تتمنّى في الموسم القادم؟')] },
        { id: 'sv0', title: 'تقييم رحلة البحر', done: true, q: [] }];
  }

  function onColor(h) { const n = parseInt(String(h).slice(1), 16), L = [n >> 16, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }), Y = .2126 * L[0] + .7152 * L[1] + .0722 * L[2]; return (Y + .05) / .05 > 1.05 / (Y + .05) ? '#000' : '#fff'; }
  function view(title, body) {
    const old = document.querySelector('.view'); if (old) old.remove();
    const v = document.createElement('div'); v.className = 'view'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', title);
    v.innerHTML = `<div class="vh"><button aria-label="رجوع" data-close>›</button><h2>${title}</h2></div><div class="vb">${body}</div>`;
    document.body.appendChild(v); if (D) paintDock(OPENED); return v;
  }
  let OPENED = '', RKM = true, RKT = 'teams';
  function toast(m, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = m; t.setAttribute('role', 'status'); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  /* ═════════ التطبيقات ═════════ */
  const OPEN = {
    survey() { survList(); },
    mstore() { storeList(); },
    games() { const u = WEB + 'games/' + (DEMO ? '?demo=1' : ''); if (NAT) NAT.external(u); else location.href = u; },
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
        <label class="pick"><input type="file" accept="image/*" id="pf" hidden><span id="pfv">${I('camera')} أضف صورة</span></label>
        <button class="btn" data-act="publish" style="margin-top:12px">انشر</button>
        <p class="note">يظهر للطلاب والمشرفين في «الأخبار» فوراً. صوّر بإذن المشاركين، وتجنّب نشر الوجوه بلا موافقة.</p>`);
      v.querySelector('#pf').onchange = e => { PUB.file = e.target.files[0] || null; if (PUB.file) document.getElementById('pfv').innerHTML = `<img src="${URL.createObjectURL(PUB.file)}" alt="">`; };
    },
    wall() {
      const list = MODE === 'staff' ? STY_STAFF : STY_ME, st = MODE === 'staff' ? 'staff' : (WALL[(D.me || {}).stage] || WALL['متوسط'])[0];
      const cur = list.some(x => x[0] === wallStyle) ? wallStyle : list[0][0];
      view('الخلفيّة', `<p class="note">${MODE === 'staff' ? 'خلفيّات المشرفين داكنة — لونهم الأسود.' : 'كلّ الخلفيّات بلون مرحلتك — حتى يُعرف جوالك من مرحلتك.'}</p>
        <div class="walls">${list.map(([k, n]) => `<button class="wpick${k === cur ? ' on' : ''}" data-wall="${k}"><img src="./walls/${st}-${k}.jpg" alt=""><span>${n}</span></button>`).join('')}</div>`);
    },
    pray() {
      const [c, [la, ln]] = cityLL(), list = prayers(new Date(), la, ln), np = nextPrayer(), nowD = new Date();
      const perm = 'Notification' in window ? Notification.permission : 'unsupported';
      view('الصلاة', `<div class="note">مواقيت ${esc(c)} — تقويم أمّ القرى (تقريبيّة). يظهر تنبيه في «جوّالي» وقت كلّ صلاة.</div>
        ${list.map(p => `<div class="pt${p[0] === np[0] && p[1].getTime() === np[1].getTime() ? ' next' : p[1] < nowD ? ' past' : ''}"><span>${p[0]}</span><b>${fmtT(p[1])}</b></div>`).join('')}
        <button class="btn sec" style="margin-top:18px" data-act="adhantest">${I('volume')} اسمع الأذان</button>
        <button class="btn sec" style="margin-top:10px" data-act="pushon">${I('bell')} الإشعارات والجوال مقفل</button>
        <p class="empty" style="padding:18px 6px">«إنّ الصلاة كانت على المؤمنين كتاباً موقوتاً»</p>`);
    },
    avatar() {
      AVE = Object.assign({}, AV.has(D.me.avatar) ? D.me.avatar : AV.seed(D.me.name)); AVM = AV.isPk(AVE) || !AV.has(D.me.avatar) ? 'lib' : AV.isMj(AVE) ? 'mj' : 'draw'; if (!AV.has(D.me.avatar)) AVE = {};
      view('شخصيّتي', `<div class="seg avmode three" role="tablist"><button data-avmode="lib" role="tab">المكتبة</button><button data-avmode="mj" role="tab">Memoji آبل</button><button data-avmode="draw" role="tab">مرسومة</button></div>
        <div class="avprev" id="avp"></div><div id="avlib" hidden><div class="libg" id="libg" role="tablist"></div><div class="libgrid" id="libgrid"><p class="empty">جارٍ التحميل…</p></div></div><div id="avmj" hidden><div class="mjbox" id="mjbox" contenteditable="true" role="textbox" aria-label="الصق ملصق Memoji هنا" inputmode="text"></div>
          <ol class="mjsteps"><li>اضغط على المربّع فوق</li><li>افتح لوحة الإيموجي (زرّ الوجه في لوحة المفاتيح) ثمّ <b>الملصقات</b></li><li>اختر الـMemoji حقّك — أو صمّم واحداً من زرّ <b>＋</b></li></ol>
          <label class="btn sec mjfile">أو اختر صورة Memoji محفوظة<input type="file" accept="image/*" id="mjf" hidden></label></div>
        <div id="avdraw"><div class="avtabs" role="tablist">${AV.CATS.map(c => `<button role="tab" data-avcat="${c.id}">${c.n}</button>`).join('')}</div><div id="avb"></div></div>
        <button class="btn" data-act="avsave" style="margin-top:16px">احفظ شخصيّتي</button><p class="note">شخصيّتك تظهر في بطاقتك والترتيب والأخبار — بدل الصورة.</p>`);
      avMode(AVM); mjWire();
    },
    home() { const v = document.querySelector('.view'); if (v) v.remove(); OPENED = ''; if (D) home(); },
    /* الجدول: أيّام بشرائح، وكلّ نشاط بطاقة بوقت كبير وأيقونة ولون — «الآن» و«التالي» واضحان */
    cal(sel) {
      const days = {}; occ(28).forEach(x => (days[x.d] = days[x.d] || []).push(x));
      const keys = Object.keys(days).sort(), today = isoDay(new Date()), tomorrow = isoDay(new Date(Date.now() + 864e5));
      if (!keys.length) { view('الجدول', '<div class="emptyimg"><img src="./states/schedule.webp" alt=""></div><p class="empty">لم يُنشر الجدول بعد.</p>'); return; }
      sel = sel && days[sel] ? sel : (keys.find(d => d >= today) || keys[keys.length - 1]);
      const nowD = new Date(), list = days[sel].slice().sort((a, b) => String(a.f).localeCompare(String(b.f)));
      const at = (d, t) => t ? new Date(d + 'T' + t + ':00') : null;
      let nextI = -1; list.forEach((x, i) => { if (nextI < 0 && at(x.d, x.f) > nowD) nextI = i; });
      const chip = d => { const dt = new Date(d + 'T00:00:00'); return `<button class="dchip${d === sel ? ' on' : ''}" data-day="${d}" aria-pressed="${d === sel}"><small>${d === today ? 'اليوم' : d === tomorrow ? 'غداً' : dt.toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'short' })}</small><b>${dt.getDate()}</b></button>`; };
      view('الجدول', `<div class="dchips">${keys.map(chip).join('')}</div><p class="dlong">${esc(fmtDay(sel))}</p>
        <div class="evs">${list.map((x, i) => { const s1 = at(x.d, x.f), s2 = at(x.d, x.e), st = s1 && s2 && nowD >= s1 && nowD < s2 ? 'now' : i === nextI ? 'next' : s2 && s2 < nowD ? 'past' : '', [h, ap] = h12(x.f);
          return `<div class="ev ${st}" style="--ec:${EVC[i % EVC.length]}"><div class="evt"><b>${h}</b><small>${ap}</small></div><div class="evc"><span class="eve" aria-hidden="true">${x.k === 'trip' ? I('bus') : evEmoji(x.t)}</span><span class="evx"><b>${esc(x.t)}</b>
            <small>${x.p ? SV.pin + esc(x.p) : ''}${x.e ? ` · حتى ${h12(x.e).join(' ')}` : ''}${MODE === 'staff' && x.g ? ' · ' + esc(x.g) : ''}${x.rep ? ' · كلّ أسبوع' : ''}</small></span>${st === 'now' ? '<em>الآن</em>' : st === 'next' ? '<em class="nx">التالي</em>' : ''}</div></div>`; }).join('')}</div>`);
    },
    /* الترتيب: منصّة تتويج للفرق بألوانها، وقائمة الأفراد بصورة رمزيّة بلون المرحلة وحلقة بلون الفريق */
    trophy(tab) {
      if (tab === 'm' || tab === 's') { RKM = tab === 'm'; tab = RKT; } RKT = tab = tab === 'people' ? 'people' : 'teams';
      const TS = RKM ? (D.teamsMonth || {}) : (D.teams || {});
      const teams = (D.season.teams || []).map(t => Object.assign({}, t, { pts: TS[t.id] || 0 })).sort((a, b) => b.pts - a.pts), max = Math.max(1, ...teams.map(t => t.pts));
      const rich = MODE === 'staff' ? (D.members || []).filter(m => m.b > 0).sort((a, b) => b.b - a.b).slice(0, 10).map(m => ({ n: m.n.split(' ')[0], team: m.t, g: m.g, av: m.av, b: m.b })) : (D.rich || []);
      const richM = RKM && MODE === 'me' ? (D.richMonth || []) : null;
      const mine = MODE === 'me' ? D.me.team : '', medal = [BDG('gold'), BDG('silver'), BDG('bronze')];
      const pod = [teams[1], teams[0], teams[2]].map((t, k) => t ? `<div class="pod${t.id === mine ? ' me' : ''}" style="--c:${esc(t.color)}"><span class="pm" aria-hidden="true">${medal[[1, 0, 2][k]]}</span><b>${esc(t.name)}</b><span class="pp">${t.pts}<small> نقطة</small></span><div class="pillar" style="height:${[96, 132, 72][k]}px"><span>${[2, 1, 3][k]}</span></div>${t.id === mine ? '<em>فريقك</em>' : ''}</div>` : '<div class="pod"></div>').join('');
      view('الترتيب', `<div class="rkper"><button class="${RKM ? 'on' : ''}" data-rk="m">هذا الشهر</button><button class="${RKM ? '' : 'on'}" data-rk="s">الموسم كاملاً</button></div><div class="seg rkseg" role="tablist"><button class="${tab === 'teams' ? 'on' : ''}" data-rk="teams" role="tab" aria-selected="${tab === 'teams'}">الفرق</button><button class="${tab === 'people' ? 'on' : ''}" data-rk="people" role="tab" aria-selected="${tab === 'people'}">الأفراد</button></div>
        ${tab === 'teams' ? `<div class="podium">${pod}</div><div class="tlist">${teams.slice(3).map((t, i) => `<div class="trow${t.id === mine ? ' me' : ''}" style="--c:${esc(t.color)}"><span class="tn">${i + 4}</span><span class="tx2"><b>${esc(t.name)}</b><i><u style="width:${Math.round(t.pts / max * 100)}%"></u></i></span><b>${t.pts}</b></div>`).join('')}</div>`
          : `<p class="dlong">${richM ? 'الأكثر كسباً هذا الشهر' : 'الأكثر رصيداً في الموسم'}</p><div class="plist">${(richM || rich).map((r, i) => `<div class="prow${i < 3 ? ' top' : ''}"><span class="prk">${i < 3 ? medal[i] : i + 1}</span><span class="pav2 avr" style="--sc2:${STAGEC[r.g] || '#5E5CE6'};--tc2:${esc(team(r.team).color)}">${AV.of(r.av, r.n)}</span><span class="tx2"><b>${esc(r.n)}</b><small><i class="dot" style="--c:${esc(team(r.team).color)}"></i> ${esc(team(r.team).name)}${r.g ? ' · ' + esc(r.g) : ''}</small></span>${money(r.b)}</div>`).join('') || '<p class="empty">لا أحد بعد.</p>'}</div>`}`);
    },
    ref() { fetchData(saved.code, saved.pin); toast('حُدِّث'); },
    out() { if (NAT) NAT.push.off(API); const v = document.querySelector('.view'); if (v) v.remove(); try { localStorage.removeItem(K); } catch (e) {} saved = { code: saved && saved.code }; D = null; login(); },
    /* البنك: بطاقة بلون المرحلة، ثلاثة أزرار (حوّل، استلم، المتجر)، والحركات مجمّعة بالأيّام */
    bank() {
      const me = D.me, tx = me.tx || [], groups = {};
      tx.forEach(x => { const k = isoDay(new Date(x.t)); (groups[k] = groups[k] || []).push(x); });
      const today = isoDay(new Date()), yest = isoDay(new Date(Date.now() - 864e5));
      const kind = x => x.k === 'fine' || x.k === 'fee' ? ['minus', 'out'] : x.k === 'order' || x.k === 'buy' || /^شراء/.test(x.r || '') ? ['bag', 'buy'] : /^حوالة إلى/.test(x.r || '') ? ['send', 'out'] : /^حوالة من/.test(x.r || '') ? ['recv', 'in'] : x.a > 0 ? ['star', 'in'] : ['minus', 'out'];
      view('البنك', `<div class="wcard${['bank', 'lab', 'gold'].includes((D.season.settings || {}).story) ? ' story" style="--story:url(./story/' + D.season.settings.story + '.webp)' : ''}"><div class="wtop"><span>بنك ${esc(D.season.name)}</span><span class="wchip">${esc(me.stage || '')}</span></div>
          <div class="wbal"><small>رصيدك</small>${money(me.balance, 'xl')}</div>
          <div class="wfoot"><b>${esc(me.name)}</b><span dir="ltr">#${me.no}</span></div></div>${nextSalary()}
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
        <p class="note">من ١ إلى ١٠٠ ${esc(CUR().one)} في المرّة · بقي لك اليوم ${left} حوالات. الحوالة لا تُسترجع.</p>`);
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
      const ords = MODE === 'staff' ? [] : (D.me.orders || []);
      view('المتجر', `${bal != null ? `<div class="shead"><span>رصيدك</span>${money(bal)}</div>` : ''}${ords.length ? `<div class="myords"><b>${I('receipt')} طلباتك تنتظرك عند الكاونتر</b>${ords.map(o => `<span>${esc(o.item)}</span>`).join('')}<small>امسح بطاقتك أو قل رقمك ${D.me.no}</small></div>` : ''}
        <div class="shop">${(D.items || []).map((i, k) => `<button class="prod${bal != null && bal < i.p ? ' far' : ''}${i.s === 0 ? ' out' : ''}" data-prod="${k}">
          <span class="pimg2" style="--h:${hue(i.n)}">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="" loading="lazy">` : `<span class="pe" aria-hidden="true">${I('gift')}</span>`}${i.s != null ? `<em>${i.s ? 'بقي ' + i.s : 'نفد'}</em>` : ''}</span>
          <span class="pinf"><b>${esc(i.n)}</b>${money(i.p)}</span></button>`).join('') || '<p class="empty">المتجر فارغ الآن.</p>'}</div>`);
    },
    /* بطاقتي: مثل بطاقة توكّلنا — صورة وبيانات صحيحة ورمز تحقّق وحركة حيّة تمنع تصوير الشاشة */
    id() {
      const st = MODE === 'staff', me = D.me, col = st ? '#1C1C1E' : (STAGEC[me.stage] || '#5E5CE6'), t = st ? null : team(me.team);
      const rows = st ? [['الصفة', me.role === 'lead' ? 'قائد' : 'مشرف'], ['المرحلة', me.stage || 'كلّ المراحل'], ['الموسم', D.season.name]]
        : [['رقم المشارك', '<span dir="ltr">#' + me.no + '</span>'], ['المرحلة', esc(me.stage || '—')], ['الصفّ', esc(me.grade || '—')], ['الفريق', `<i class="dot" style="--c:${esc(t.color)}"></i> ${esc(t.name)}`], ['أيّام الحضور', String(me.att || 0)], ['المستوى', (l => l.icon + ' ' + l.name)(level(me.att || 0)) + (streak(me.attd) ? ' · ' + BDG('flame') + streak(me.attd) : '')]];
      view('بطاقتي', `<div class="idcard${st ? ' staff' : ''}" style="--cc:${col};--cf:${onColor(col)}">
          <div class="idtop"><span><b>${esc(D.season.org || '')}</b><small>${esc(D.season.name)}</small></span><span class="idk">${st ? 'بطاقة مشرف' : 'بطاقة مشارك'}</span></div>
          <div class="idbody"><button class="idph" data-open="avatar" aria-label="عدّل شخصيّتك">${AV.of(me.avatar, me.name)}<span class="ided">✎</span></button>
            <div class="idinfo"><b class="idn">${esc(me.name)}</b><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${st ? esc(v) : v}</dd></div>`).join('')}</dl></div></div>
          ${st ? '' : `<div class="idqr">${qrSVG(verifyURL(me.no))}</div>`}
          <div class="idlive"><i aria-hidden="true"></i><span>بطاقة سارية · <b id="idclk">${clk()}</b></span></div><span class="shine" aria-hidden="true"></span></div>
        <p class="note">${st ? 'بطاقتك في الموسم. للتحقّق من بطاقات الطلاب افتح «تحقّق».' : 'اعرضها عند دخول النادي أو البرنامج — يمسح المشرف الرمز فتظهر شخصيّتك وبياناتك من النظام ويُسجَّل حضورك.'} اضغط الشخصيّة لتصمّمها.</p>
        <button class="btn sec logout" data-open="out">تسجيل الخروج</button>`);
      const tk = setInterval(() => { const el = document.getElementById('idclk'); if (!el) return clearInterval(tk); el.textContent = clk(); }, 1000);
    },
    /* تحقّق (للمشرف): يمسح رمز البطاقة أو يكتب الرقم — الصورة والبيانات تأتي من الخادم، فلا تنفع لقطة شاشة لبطاقة غيره */
    async scan(no) {
      view('تحقّق', `<button class="btn" data-act="camera" ${NAT || 'BarcodeDetector' in window ? '' : 'hidden'}>${SV.cam} امسح بطاقة الطالب</button><video id="cam" playsinline muted hidden></video>
        <label class="fld">أو اكتب رقم المشارك<input id="vn" class="big" inputmode="numeric" autocomplete="off" placeholder="—" value="${no || ''}"></label>
        <div id="vr"></div>${NAT || 'BarcodeDetector' in window ? '' : '<p class="note">في الآيفون: امسح رمز البطاقة بكاميرا الجوال العاديّة فيفتح هنا مباشرة.</p>'}`);
      const inp = document.getElementById('vn'); let tm = null;
      inp.oninput = () => { clearTimeout(tm); tm = setTimeout(() => verify(+inp.value.trim()), 350); };
      if (no) verify(no);
    },
    give() { STF.kind = 'coin'; staffForm(); },
    counter() { STF.kind = 'sell'; staffForm(); },
    fine() { STF.kind = 'fine'; staffForm(); },
    zone() { zoneView(); },
    com() { comView(); },
    follow() { followView(); },
    league() { leagueView(); },
    cert() { certView(); },
    customs() { STF.kind = 'fee'; staffForm(); },
    guest() {
      STF.gb = STF.gb || 100;
      view('رمز ضيف', `<p class="note">لمقدّم الورشة أو الضيف: يمنح الطلاب أثناء الأسئلة من رصيد محدّد، بلا حساب ولا تدريب. ينتهي الرمز آخر يوم البرنامج.</p>
        <label class="fld">اسم الضيف<input id="gn" class="tx" maxlength="40" placeholder="مثلاً: أ. خالد — ورشة التصوير"></label>
        <div class="amts">${[50, 100, 150].map(a => `<button data-gb="${a}" class="${STF.gb === a ? 'on' : ''}">${a}</button>`).join('')}</div>
        <button class="btn" data-act="guest" style="margin-top:14px">أنشئ الرمز</button>`);
    },
    teams() {
      const ts = D.season.teams || [];
      view('نقاط الفرق', `<div class="teams">${ts.map(t => `<button style="--c:${esc(t.color)}" data-team="${esc(t.id)}" class="${STF.team === t.id ? 'on' : ''}">${esc(t.name)}<br><small>${(D.teams || {})[t.id] || 0} نقطة</small></button>`).join('')}</div>
        <div class="amts">${[5, 10, 20, -5].map(a => `<button data-pts="${a}" class="${STF.pts === a ? 'on' : ''}">${a > 0 ? '+' + a : '−' + Math.abs(a)}</button>`).join('')}</div>
        <div class="chips">${['مشاركة', 'فوز في مسابقة', 'انضباط', 'تعاون', 'مخالفة'].map(r => `<button class="chip${STF.reason === r ? ' on' : ''}" data-reason="${r}">${r}</button>`).join('')}</div>
        <button class="btn" data-act="point">امنح النقاط</button>`);
    },
    people() {
      const v = view('الطلاب', `<input class="srch" type="search" placeholder="ابحث بالاسم أو الرقم" id="ps"><div class="seg two pfil"><button class="on" data-pf="all">الكلّ</button><button data-pf="zero">لم يكسب اليوم (${(D.members || []).filter(m => !m.td).length})</button></div><div id="pl"></div>`);
      let pf = 'all'; v.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { pf = b.dataset.pf; v.querySelectorAll('[data-pf]').forEach(x => x.classList.toggle('on', x === b)); paint(v.querySelector('#ps').value.trim()); });
      const paint = q => { document.getElementById('pl').innerHTML = (D.members || []).filter(m => (pf === 'all' || !m.td) && (!q || m.n.includes(q) || String(m.no) === q)).map(m => `<button class="row svrow" data-vno="${m.no}"><span style="display:flex;gap:10px;align-items:center"><span class="pav2 sm avr" style="--sc2:${STAGEC[m.g] || '#5E5CE6'};--tc2:${esc(team(m.t).color)}">${AV.of(m.av, m.n)}</span><span><b>${esc(m.n)}</b><small>#${m.no} · ${esc(m.g || '')} · ${esc(team(m.t).name)}</small></span></span>${money(m.b)}</button>`).join('') || '<p class="empty">لا نتائج.</p>'; };
      paint(''); v.querySelector('#ps').oninput = e => paint(e.target.value.trim());
    },
  };

  let AVE = {}, AVC = 'face', AVM = 'draw', AVDRAW = null;
  /* ملصق Memoji من لوحة مفاتيح الآيفون: يُلصق في المربّع فيُصغَّر ويُحفظ صورة شفّافة (av.mj) — ينشئه صاحبه، لا نأخذه من ملفّات آبل */
  function avMode(m) {
    AVM = m; document.querySelectorAll('[data-avmode]').forEach(b => { b.classList.toggle('on', b.dataset.avmode === m); b.setAttribute('aria-selected', String(b.dataset.avmode === m)); });
    document.getElementById('avmj').hidden = m !== 'mj'; document.getElementById('avdraw').hidden = m !== 'draw'; document.getElementById('avlib').hidden = m !== 'lib';
    if (m === 'lib') { document.getElementById('avp').classList.remove('zoom'); document.getElementById('avp').innerHTML = AV.isPk(AVE) ? AV.of(AVE, D.me.name) : '<div class="mjempty">اختر شخصيّتك من الأسفل</div>'; AV.lib().then(g => libPaint(LIBG || ((g[0] || {}).id))); return; }
    if (m === 'draw') { if (AV.isPk(AVE)) AVE = Object.assign({}, AVDRAW || AV.seed(D.me.name)); if (AV.isMj(AVE)) AVE = Object.assign({}, AVDRAW || AV.seed(D.me.name)); avPaint(); }
    else { if (!AV.isMj(AVE)) AVDRAW = Object.assign({}, AVE); document.getElementById('avp').innerHTML = AV.isMj(AVE) ? AV.of(AVE, D.me.name) : '<div class="mjempty">ملصقك يظهر هنا</div>'; document.getElementById('avp').classList.remove('zoom'); }
  }
  /* مكتبة الأفاتارات بالمجموعات (مثل بلايستيشن): شرائح المجموعات ثمّ شبكة الصور */
  let LIBG = null;
  async function libPaint(gid) {
    const groups = await AV.lib(), gEl = document.getElementById('libg'), grid = document.getElementById('libgrid'); if (!gEl || !grid) return;
    if (!groups.length) { grid.innerHTML = '<p class="empty">المكتبة غير متاحة الآن — جرّب «مرسومة» أو «Memoji آبل».</p>'; gEl.innerHTML = ''; return; }
    const g = groups.find(x => x.id === gid) || groups[0]; LIBG = g.id;
    gEl.innerHTML = groups.map(x => `<button class="${x.id === g.id ? 'on' : ''}" data-libg="${esc(x.id)}" role="tab" aria-selected="${x.id === g.id}">${esc(x.name)}</button>`).join('');
    grid.innerHTML = g.items.map(it => `<button class="libit${AVE.pk === it ? ' on' : ''}" data-libpk="${esc(it)}" aria-label="شخصيّة"><img src="${AV.BASE + esc(it)}" alt="" loading="lazy" decoding="async"></button>`).join('');
  }
  function libPick(pk) {
    AVE = { pk }; document.getElementById('avp').innerHTML = AV.of(AVE, D.me.name); avPop();
    document.querySelectorAll('[data-libpk]').forEach(b => b.classList.toggle('on', b.dataset.libpk === pk));
  }
  async function mjTake(blob) {
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(blob); });
      const S = 192, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), k = Math.min(S / img.width, S / img.height);
      g.drawImage(img, (S - img.width * k) / 2, (S - img.height * k) / 2, img.width * k, img.height * k);
      let q = .9, u = c.toDataURL('image/webp', q); if (!/^data:image\/webp/.test(u)) u = c.toDataURL('image/png');
      while (u.length > 55000 && q > .4) { q -= .15; u = c.toDataURL('image/webp', q); }
      if (u.length > 58000) { toast('الصورة كبيرة — جرّب ملصقاً آخر', 1); return; }
      AVE = { mj: u }; avMode('mj'); avPop(); toast('تمام — اضغط «احفظ شخصيّتي»');
    } catch (e) { toast('تعذّرت قراءة الملصق', 1); }
  }
  function mjWire() {
    const box = document.getElementById('mjbox'); if (!box) return;
    box.addEventListener('paste', e => { const f = [...(e.clipboardData || {}).files || []].find(x => /^image\//.test(x.type) || /\.(heic|heif)$/i.test(x.name || '')); if (f) { e.preventDefault(); mjTake(f); } });
    box.addEventListener('input', async () => { const im = box.querySelector('img'); if (!im) { if (box.textContent.trim()) { box.textContent = ''; toast('هذا إيموجي عاديّ — اختر من «الملصقات»'); } return; }
      try { await (im.decode ? im.decode().catch(() => {}) : 0); const src = im.currentSrc || im.src || (box.querySelector('source') || {}).srcset; const b = await (await fetch(src)).blob(); box.innerHTML = ''; mjTake(b); } catch (e) { box.innerHTML = ''; toast('تعذّرت قراءة الملصق', 1); } });
    document.getElementById('mjf').onchange = e => { const f = e.target.files[0]; if (f) mjTake(f); };
  }
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
  /* الراتب القادم (إعداد الإدارة settings.salary): أقرب يوم محدّد بعد الآن بتوقيت الرياض */
  function nextSalary() {
    const S = (D.season.settings || {}).salary; if (!S || !S.on || !(S.days || []).length || (S.stage && S.stage !== D.me.stage)) return '';
    const [h, m] = String(S.time || '17:00').split(':').map(Number), now = Date.now();
    for (let i = 0; i < 8; i++) { const r = new Date(now + 3 * 3600e3 + i * 864e5); if (!S.days.includes(r.getUTCDay())) continue; const at = Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate(), h - 3, m); if (at + 15 * 60000 < now) continue;
      const day = i === 0 ? 'اليوم' : i === 1 ? 'غداً' : new Date(at).toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'long', timeZone: 'Asia/Riyadh' });
      return `<div class="salnext"><span aria-hidden="true">${I('wallet')}</span><span><b>${esc(S.label || 'راتب')} القادم: ${money(S.amount)}</b><small>${day} الساعة ${h12(S.time).join(' ')}</small></span></div>`; }
    return '';
  }
  /* ═════════ إدارة المتجر (لمدير المتجر فقط — perms.store، والخادم يتحقّق) ═════════ */
  let MS = null;
  function storeList() {
    view('إدارة المتجر', `<button class="btn" data-act="msnew" style="margin-bottom:12px">＋ صنف جديد</button>
      <div class="mslist">${(D.items || []).map((i, k) => `<button class="msrow${i.on === false ? ' off' : ''}" data-msedit="${k}"><span class="msth" style="--h:${hue(i.n)}">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="">` : I('gift')}</span>
        <span class="tx2"><b>${esc(i.n)}</b><small>${i.on === false ? 'مخفيّ · ' : ''}${i.s != null ? 'بقي ' + i.s : 'بلا حدّ'}</small></span>${money(i.p)}</button>`).join('') || '<p class="empty">المتجر فارغ — أضف أوّل صنف.</p>'}</div>
      <p class="note">أنت مدير المتجر — ما تضيفه يظهر للطلاب فوراً في «المتجر». الإخفاء يبقي الصنف عندك ويخفيه عن الطلاب.</p>`);
  }
  function storeEdit(k) {
    const i = k == null ? { on: true } : Object.assign({}, D.items[k]); MS = { i, file: null, lib: null };
    view(k == null ? 'صنف جديد' : 'تعديل الصنف', `<button class="btn sec" data-act="mslib" style="margin-bottom:10px">${I('image')} اختر من مكتبة الصور الجاهزة</button><div id="mslib" class="libgrid" hidden>${(window.JW_LIB ? JW_LIB.shop : []).map(([id, n]) => `<button data-libshop="${id}" aria-label="${esc(n)}"><img src="./shop/${id}.webp" alt="" loading="lazy"><small>${esc(n)}</small></button>`).join('')}</div><label class="pick msimg"><input type="file" accept="image/*" id="msf" hidden><span id="msfv">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="">` : I('camera') + ' صورة المنتج (اختياريّة)'}</span></label>
      <label class="fld">الاسم<input id="msn" class="tx" maxlength="80" value="${esc(i.n || '')}" placeholder="مثلاً: آيس كريم"></label>
      <label class="fld">السعر (${esc(CUR().one)})<input id="msp" inputmode="numeric" value="${esc(i.p || '')}"></label>
      <label class="fld">الكمّيّة (اتركها فارغة إن كانت بلا حدّ)<input id="mss" inputmode="numeric" value="${i.s == null ? '' : esc(i.s)}"></label>
      <label class="fld">الوصف<textarea id="msd" class="tx" rows="2" maxlength="300">${esc(i.d || '')}</textarea></label>
      ${k == null ? '' : `<label class="mstog"><input type="checkbox" id="mso"${i.on === false ? '' : ' checked'}> معروض للطلاب</label>`}
      <button class="btn" data-act="mssave" style="margin-top:14px">حفظ</button>`);
    document.getElementById('msf').onchange = e => { MS.file = e.target.files[0] || null; if (MS.file) document.getElementById('msfv').innerHTML = `<img src="${URL.createObjectURL(MS.file)}" alt="">`; };
  }
  async function storeSave(btn) {
    const v = id => (document.getElementById(id) || {}).value || '';
    const item = { name: v('msn').trim(), price: +v('msp').replace(/\D/g, ''), stock: v('mss').trim() === '' ? '' : +v('mss').replace(/\D/g, ''), emoji: MS.i.e || '', d: v('msd').trim(), on: document.getElementById('mso') ? document.getElementById('mso').checked : true };
    if (MS.i.id) item.id = MS.i.id;
    if (!MS.file && MS.lib) item.img = MS.lib;
    if (item.name.length < 2 || !item.price) { toast('اكتب الاسم والسعر', 1); return; }
    btn.disabled = true; btn.textContent = 'جارٍ الحفظ…';
    try {
      if (MS.file) { const blob = await shrink(MS.file); if (DEMO) item.img = URL.createObjectURL(blob); else { const r = await fetch(API + '/season/upload?' + new URLSearchParams({ code: saved.code, pin: saved.pin }), { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: blob }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر رفع الصورة'); item.img = d.path; } }
      const out = DEMO ? { item: { id: item.id || 'n' + Date.now(), n: item.name, p: item.price, s: item.stock === '' ? null : item.stock, img: item.img || MS.i.img || '', d: item.d, e: item.emoji, on: item.on } }
        : await post('/season/item', { code: saved.code, pin: saved.pin, as: 'staff', item });
      const k = (D.items || []).findIndex(x => x.id === out.item.id); if (k >= 0) D.items[k] = out.item; else (D.items = D.items || []).push(out.item);
      toast('حُفظ ✓'); storeList();
    } catch (e) { toast(e.message, 1); btn.disabled = false; btn.textContent = 'حفظ'; }
  }
  /* ═════════ أدوات الشاشات: التاريخ والوقت، ألوان الأنشطة، الحوالة، صفحة الصنف، التحقّق ═════════ */
  const isoDay = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const h12 = t => { if (!t) return ['', '']; const [H, M] = String(t).split(':').map(Number); return [((H % 12) || 12) + ':' + String(M || 0).padStart(2, '0'), H < 12 ? 'ص' : 'م']; };
  const EVC = ['#FF9F0A', '#30D158', '#64D2FF', '#BF5AF2', '#FF375F', '#FFD60A'];
  const EVE = [[/كرة|دوري|رياض|سباحة|مباراة|طائرة/, 'ball'], [/رحلة|زيارة|مخيّم|مخيم/, 'bus'], [/مسابقة|حروف|مليون|تحدّي|تحدي|تنافس/, 'trophy'], [/صلاة|درس|قرآن|حلقة|محاضرة|مجلس/, 'book'], [/وجبة|عشاء|غداء|إفطار|فطور|تموين/, 'food'], [/ورشة|دورة|تصوير|برمجة|مهارة|مهاري/, 'tool'], [/استقبال|تسجيل|افتتاح/, 'users'], [/تكريم|حفل|ختام|نوعي/, 'award']];
  const evEmoji = t => I((EVE.find(([r]) => r.test(t || '')) || [0, 'spark'])[1]);
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
      view('تمّت الحوالة', `<div class="done2"><img class="okimg" src="./states/done.webp" alt=""><h3>${money(XF.amt, 'xl')}</h3><p>وصلت إلى ${esc(XF.who.name)}</p><p class="note">رصيدك الآن ${money(bal)}</p><button class="btn sec" data-open="bank">البنك</button></div>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  const PRE = () => !!((D.season.settings || {}).preorder);
  async function preorder(btn) {
    const id = btn.dataset.preorder, it = (D.items || []).find(i => i.id === id); if (!it) return; btn.disabled = true;
    try {
      const r = DEMO ? { ok: true, order: 'o' + Date.now(), item: it.n, balance: D.me.balance - it.p } : await post('/season/order', { code: saved.code, pin: saved.pin, item: id });
      D.me.balance = r.balance; D.me.orders = (D.me.orders || []).concat([{ id: r.order, item: r.item, p: it.p, t: new Date().toISOString() }]); if (it.s != null) it.s--;
      view('طلبك محجوز', `<div class="done2"><img class="okimg" src="./states/done.webp" alt=""><h3>${esc(r.item)}</h3><p>اذهب إلى الكاونتر وامسح بطاقتك أو قل رقمك <b>${D.me.no}</b> — طلبك جاهز باسمك.</p></div><button class="btn sec" data-open="shop">المتجر</button>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  function prod(k) {
    const i = (D.items || [])[k]; if (!i) return; const bal = MODE === 'staff' ? null : D.me.balance, can = bal == null || bal >= i.p;
    view(i.n, `<div class="pbig" style="--h:${hue(i.n)}">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="">` : `<span class="pe" aria-hidden="true">${I('gift')}</span>`}</div>
      <div class="pdet"><h2>${esc(i.n)}</h2>${money(i.p, 'xl')}${i.s != null ? `<span class="stk${i.s ? '' : ' none'}">${i.s ? 'بقي ' + i.s + ' فقط' : 'نفدت الكمّيّة'}</span>` : ''}
        ${i.d ? `<p>${esc(i.d)}</p>` : ''}
        ${bal == null ? '' : can && PRE() && i.s !== 0 ? `<div class="buyhow ok"><b>رصيدك يكفي ✓</b><span>اطلبه الآن ويُحجز لك — استلمه من الكاونتر بمسح بطاقتك.</span></div><button class="btn" data-preorder="${esc(i.id)}" style="margin-top:12px">اطلب «${esc(i.n)}» بـ ${i.p}</button>`
          : can ? `<div class="buyhow ok"><b>رصيدك يكفي ✓</b><span>اذهب إلى الكاونتر وقل رقمك <b>${D.me.no}</b> — يُخصم السعر من رصيدك.</span></div>`
          : `<div class="buyhow"><b>ينقصك ${money(i.p - bal)}</b><i><u style="width:${Math.round(bal / i.p * 100)}%"></u></i><span>اجمع ${esc(CUR().name)} من الأنشطة والمسابقات.</span></div>`}
        <button class="btn sec" data-open="shop" style="margin-top:14px">كلّ الأصناف</button></div>`);
  }
  async function checkin(btn) {
    const no = +btn.dataset.no; btn.disabled = true;
    try {
      const r = DEMO ? { ok: true, already: false, coins: 5, today: 37, at: new Date().toISOString() } : await post('/season/checkin', { code: saved.code, pin: saved.pin, as: 'staff', no });
      document.getElementById('ckin').innerHTML = `<div class="vok">${r.already ? 'مسجّل من قبل' : '✓ سُجّل حضوره'} · ${fmtT(new Date(r.at))}${r.coins ? ` · +${r.coins} ${esc(CUR().one)}` : ''}</div><small>الحاضرون اليوم: ${r.today}</small>`;
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
  const cardNo = raw => +(new URL(raw, location.href).searchParams.get('v') || String(raw).replace(/\D/g, ''));
  async function scanCam() {
    if (NAT) { try { const n = cardNo(await NAT.scan('امسح بطاقة الطالب')); if (!n) { toast('هذا ليس رمز بطاقة', 1); return; } const i = document.getElementById('vn'); if (i) i.value = n; verify(n); } catch (e) {} return; }
    const v = document.getElementById('cam'); if (!v) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = stream; v.hidden = false; await v.play();
      const det = new BarcodeDetector({ formats: ['qr_code'] });
      const stop = () => { stream.getTracks().forEach(t => t.stop()); v.hidden = true; };
      const loop = async () => {
        if (!document.body.contains(v)) return stop();
        try { const c = await det.detect(v); const raw = c[0] && c[0].rawValue; if (raw) { const n = cardNo(raw); if (n) { stop(); document.getElementById('vn').value = n; verify(n); return; } } } catch (e) {}
        requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { toast('تعذّر فتح الكاميرا — اكتب الرقم', 1); }
  }

  /* ═════════ نموذج المشرف: رقم الطالب ← المبلغ أو الصنف ← تنفيذ (الخادم يتحقّق من الحدود والمرحلة) ═════════ */
  const STF = { kind: 'coin', amt: 10, reason: 'مشاركة', item: '', team: '', pts: 10, vio: '' };
  /* صلاحيّة إضافيّة: القائد يملكها كلّها، والضيف لا شيء منها */
  const can = k => D.me.role === 'lead' || !!(D.me.perms && D.me.perms[k]);
  const leftToday = () => D.me.daily ? Math.max(0, D.me.daily - (D.me.givenToday || 0)) : null;
  /* المدينة: «أين أنا الآن» — يوم البرنامج يبدأ ٤ فجراً، وما قبل ٤ فجراً يُحسب بعد منتصف الليل */
  const hmOf = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); if (!m) return null; const h = +m[1]; return h * 60 + +m[2] + (h < 4 ? 1440 : 0); };
  const pdayISO = () => { const d = new Date(Date.now() - 4 * 3600e3); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const nowHM = () => { const d = new Date(); return hmOf(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); };
  function whereNow() {
    const day = pdayISO(), rows = (D.schedule || []).filter(x => (x.k === 'zone' || x.k === 'break') && x.d === day).sort((a, b) => hmOf(a.f) - hmOf(b.f)); if (!rows.length) return '';
    const n = nowHM(), cur = rows.find(x => n >= hmOf(x.f) - 10 && n <= hmOf(x.e)), nx = rows.find(x => hmOf(x.f) - 10 > n);
    const zc = id => (((D.season.settings || {}).zones || []).find(z => z.id === id) || {}).c || '#0A84FF';
    if (!cur && !nx) return '';
    const x = cur || nx;
    const zim = (((D.season.settings || {}).zones || []).find(z => z.id === x.zone) || {}).img || (x.period === 'cat' ? 'lib:city/cat' : '');
    return `<button class="widget wnow${zim ? ' hasimg' : ''}" data-open="cal" style="--zc:${esc(x.k === 'zone' ? zc(x.zone || '') : '#8E8E93')}">${zim ? `<img class="wzi" src="${esc(imgSrc(zim))}" alt="">` : ''}<small>${cur ? 'أين أنا الآن' : 'التالي · ' + fmtT2(x.f)}</small><b>${esc(x.t)}</b><small>${esc([x.p, cur ? 'حتى ' + fmtT2(x.e) : ''].filter(Boolean).join(' · '))}</small>${cur && nx ? `<small class="wnx">بعدها: ${esc(nx.t)} · ${fmtT2(nx.f)}</small>` : ''}</button>`;
  }
  const fmtT2 = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return ((h % 12) || 12) + ':' + String(m || 0).padStart(2, '0') + (h < 12 ? ' ص' : ' م'); };
  /* «مكاني» للمشرف: منطقته والفترة الحاليّة والمرحلة القادمة إليه + «وصلت» + مسح بطاقات الداخلين */
  let CITY = null;
  async function cityLoad() {
    try { CITY = DEMO ? (CITY || { period: { id: 'p1', n: 'الفترة الأولى', f: '21:00', e: '21:45' }, zone: 'comp', here: null, expected: ['متوسط'], count: 12 }) : await post('/season/city/now', { code: saved.code, pin: saved.pin, as: 'staff' }); }
    catch (e) { toast(e.message, 1); CITY = null; }
  }
  async function zoneView() {
    await cityLoad(); if (!CITY) return;
    const z = (((D.season.settings || {}).zones || []).find(x => x.id === CITY.zone)) || null, P = CITY.period;
    view('مكاني', `<div class="zcard" style="--zc:${esc(z ? z.c || '#0A84FF' : '#8E8E93')}">${z && z.img ? `<img class="zci" src="${esc(imgSrc(z.img))}" alt="">` : ''}<small>موقعك</small><b>${z ? esc(z.n) : 'متنقّل — بلا منطقة ثابتة'}</b>${z && z.p ? `<small>${esc(z.p)}</small>` : ''}</div>
      ${CITY.here ? `<div class="vok">✓ وصلت ${fmtT(new Date(CITY.here.at))}${CITY.here.late ? ` · متأخّر ${CITY.here.minutes} د` : ''}</div>` : `<button class="btn" data-act="here">وصلت — سجّل حضوري</button>`}
      <div class="znow"><small>${P ? esc(P.n) + ' · ' + fmtT2(P.f) + '–' + fmtT2(P.e) : 'لا فترة الآن'}</small>${P && (CITY.expected || []).length ? `<b>القادمون إليك: ${CITY.expected.map(esc).join('، ')}</b><small>سُجّل دخول <b id="zc">${CITY.count || 0}</b></small>` : P ? '<small>لا مرحلة مجدولة في منطقتك هذه الفترة.</small>' : ''}</div>
      ${P ? `${CAN_SCAN() ? `<button class="btn sec scanb" data-act="pscan">${SV.cam} امسح بطاقات الداخلين</button><video id="cam2" playsinline muted hidden></video>` : ''}
      <label class="fld">أو رقم الطالب<input id="pn" class="big" inputmode="numeric" autocomplete="off" placeholder="—"></label><button class="btn" data-act="patt">سجّل دخوله</button><div id="plog" class="plog"></div>` : ''}
      <p class="note">التأخّر يُحسب آليّاً من بداية الفترة — الإدارة ترى من دخل متأخّراً ومن لم يصل.</p>`);
  }
  async function cityAct(body, quiet) {
    try {
      const r = DEMO ? (body.kind === 'here' ? { ok: true, late: false, minutes: 0, at: new Date().toISOString() } : (() => { const m = (D.members || []).find(x => x.no === body.member_no); if (!m) throw new Error('لا يوجد مشارك بهذا الرقم'); CITY.count++; return { ok: true, name: m.n, stage: m.g, late: false, here: CITY.count, expected: 'متوسط' }; })())
        : await post('/season/city', { code: saved.code, pin: saved.pin, as: 'staff', act: body });
      if (body.kind === 'here') { CITY.here = r; zoneView(); return r; }
      const c = document.getElementById('zc'); if (c) c.textContent = r.here;
      const lg = document.getElementById('plog'); if (lg) lg.insertAdjacentHTML('afterbegin', `<div class="${r.late ? 'plate' : ''}">${r.late ? I('clock') : '✓'} ${esc(String(r.name).split(' ').slice(0, 2).join(' '))} <small>${esc(r.stage || '')}${r.expected && r.stage !== r.expected ? ' · ليس دوره هنا' : ''}</small></div>`);
      if (!quiet) toast(r.late ? 'سُجّل — متأخّر' : 'سُجّل ✓'); return r;
    } catch (e) { toast(e.message, 1); return null; }
  }
  async function pscanLoop() { for (;;) { const n = await scanNo('cam2'); if (!n || !document.getElementById('plog')) return; await cityAct({ kind: 'patt', member_no: n }, true); } }
  /* «لجنتي»: ميزانيّة اللجنة ومصروفاتها بفواتير مصوّرة (القائد يحمل السلفة)، ومهامّ الخطّة، والاعتذار المسبق */
  const sar = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
  let EXF = null;
  function comView() {
    const c = D.me.committee, ex = D.me.excuses || [];
    const exc = `<h3 class="sech">${I('cal')} اعتذار مسبق</h3><p class="note">إن عرفت أنّك لن تحضر يوماً فاعتذر مبكراً — تجهّز الإدارة بديلاً من قائمة الاحتياط.</p>
      <label class="fld">اليوم<input id="exd" type="date" class="tx" min="${isoDay(new Date())}"></label><label class="fld">السبب (اختياريّ)<input id="exr" class="tx" maxlength="120"></label>
      <button class="btn sec" data-act="excuse">أرسل الاعتذار</button>${ex.length ? `<p class="note">اعتذاراتك القادمة: ${ex.map(d => esc(fmtDay(d))).join('، ')}</p>` : ''}`;
    if (!c) { view('اعتذار', exc); return; }
    const spent = +c.spent || 0, bud = +c.budget || 0, cash = (+c.advanced || 0) - spent - (+c.returned || 0), pct = bud ? Math.min(100, Math.round(spent / bud * 100)) : 0;
    view('لجنتي', `<div class="zcard" style="--zc:${esc(c.color || '#0A84FF')}"><small>${esc(c.dept || 'لجنة')}${c.lead ? ' · أنت القائد' : ''}</small><b>${esc(c.name)}</b><small>${c.members} ${c.members === 1 ? 'عضو' : c.members === 2 ? 'عضوان' : c.members <= 10 ? 'أعضاء' : 'عضواً'}${c.status === 'closed' ? ' · الماليّة مُقفلة' : ''}</small></div>
      ${bud ? `<div class="znow"><small>الميزانيّة</small><b>صُرف ${sar(spent)} من ${sar(bud)} ر.س</b><i class="lv-bar"><u style="width:${pct}%"></u></i>${c.lead ? `<small>معك من السُّلَف: <b>${sar(cash)}</b> ر.س</small>` : ''}</div>` : ''}
      ${c.lead && c.status !== 'closed' ? `<h3 class="sech">${I('receipt')} سجّل مصروفاً</h3>
        <label class="pick msimg"><input type="file" accept="image/*" capture="environment" id="exf" hidden><span id="exfv">${I('camera')} صوّر الفاتورة</span></label>
        <label class="fld">المبلغ (ر.س)<input id="exa" class="big" inputmode="decimal" placeholder="—"></label>
        <label class="fld">المورّد<input id="exp" class="tx" maxlength="80" placeholder="مثلاً: مكتبة جرير"></label>
        <label class="fld">البيان<input id="exn" class="tx" maxlength="160" placeholder="مثلاً: جوائز اليوم"></label>
        <button class="btn" data-act="expense">سجّل المصروف</button>` : ''}
      ${(c.tasks || []).length ? `<h3 class="sech">مهامّ اللجنة</h3><div class="tasks">${c.tasks.map((t, i) => `<button class="task${t.done ? ' done' : ''}" data-task="${i}">${I(t.done ? 'sqok' : 'sq')}<span>${esc(t.t)}</span></button>`).join('')}</div>` : ''}
      ${(c.mine || []).length ? `<h3 class="sech">مصروفاتك</h3><div class="olist">${c.mine.map(x => `<div class="row svrow"><span><b>${esc(x.p || x.n || 'مصروف')}</b><small>${esc(fmtDay(x.d))}${x.r ? ' · بفاتورة' : ''}</small></span><b dir="ltr">${sar(x.a)}</b></div>`).join('')}</div>` : ''}
      ${exc}`);
    EXF = null; const f = document.getElementById('exf'); if (f) f.onchange = e => { EXF = e.target.files[0] || null; if (EXF) document.getElementById('exfv').innerHTML = `<img src="${URL.createObjectURL(EXF)}" alt="">`; };
  }
  async function comAct(body, btn) {
    if (btn) btn.disabled = true;
    try {
      if (body.kind === 'expense' && EXF && !DEMO) { const blob = await shrink(EXF); const r = await fetch(API + '/season/upload?' + new URLSearchParams({ code: saved.code, pin: saved.pin }), { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: blob }); const j = await r.json(); if (j.error) throw new Error(j.error); body.receipt = j.path; }
      const r = DEMO ? demoCom(body) : await post('/season/committee', { code: saved.code, pin: saved.pin, as: 'staff', act: body });
      if (body.kind === 'expense') { D.me.committee = r.committee; toast('سُجّل المصروف ✓'); }
      else if (body.kind === 'task') { D.me.committee.tasks[body.i].done = body.done; }
      else if (body.kind === 'excuse') { D.me.excuses = [...new Set((D.me.excuses || []).concat([r.day]))].sort(); toast('وصل اعتذارك'); }
      comView();
    } catch (e) { toast(e.message, 1); if (btn) btn.disabled = false; }
  }
  function demoCom(b) {
    const c = D.me.committee;
    if (b.kind === 'expense') { c.spent = (+c.spent || 0) + b.amount; c.mine = [{ a: b.amount, p: b.party, n: b.note, d: isoDay(new Date()), r: !!EXF }].concat(c.mine || []); return { ok: true, committee: c }; }
    if (b.kind === 'excuse') return { ok: true, day: b.day };
    return { ok: true };
  }
  /* «المتابعة»: ملاحظة اليوم لكلّ مشرف، وتقييم الفعاليّة بأسئلة سلوكيّة لأعضاء «المتابعة والتقييم» */
  const canEval = () => D.me.role === 'lead' || !!(D.me.perms || {}).eval || /تقييم/.test((D.me.committee || {}).name || '');
  const EV = { kind: 'note', cat: 'issue', on_time: null, staff_ok: null, ready: null, engage: 0 };
  let EVF = null;
  const yn = (k, l) => `<div class="ynrow"><span>${l}</span><div class="seg two yn"><button class="${EV[k] === true ? 'on' : ''}" data-yn="${k}" data-v="1">نعم</button><button class="${EV[k] === false ? 'on' : ''}" data-yn="${k}" data-v="0">لا</button></div></div>`;
  function followView() {
    const ev = canEval() && EV.kind === 'event', now = (D.schedule || []).filter(x => x.d === pdayISO() && x.k !== 'break'), n = nowHM();
    const cur = now.find(x => n >= hmOf(x.f) - 10 && n <= hmOf(x.e) + 30);
    view('المتابعة', `${canEval() ? `<div class="seg two"><button class="${!ev ? 'on' : ''}" data-evk="note">ملاحظة اليوم</button><button class="${ev ? 'on' : ''}" data-evk="event">تقييم فعاليّة</button></div>` : ''}
      ${ev ? `<label class="fld">الفعاليّة<input id="evt" class="tx" maxlength="80" value="${esc(cur ? cur.t : '')}" placeholder="مثلاً: ورشة التصوير"></label>
        ${yn('on_time', 'بدأت في وقتها؟')}${EV.on_time === false ? `<label class="fld">كم تأخّرت؟ (دقائق)<input id="evl" class="big" inputmode="numeric" placeholder="—"></label>` : ''}
        ${yn('staff_ok', 'المشرف حاضر من البداية؟')}${yn('ready', 'التجهيز جاهز؟ (أدوات، بروجكتر، موادّ)')}
        <p class="note">التفاعل</p><div class="amts">${[1, 2, 3, 4, 5].map(v => `<button data-eng="${v}" class="${EV.engage === v ? 'on' : ''}">${v}</button>`).join('')}</div>
        <label class="fld">عدد الحضور<input id="evc" class="big" inputmode="numeric" placeholder="—"></label>`
      : `<div class="chips">${[['issue', 'مشكلة'], ['idea', 'فكرة'], ['good', 'إيجابيّة']].map(([k, l]) => `<button class="chip${EV.cat === k ? ' on' : ''}" data-evc="${k}">${l}</button>`).join('')}</div>`}
      <label class="fld">${ev ? 'ملاحظات' : 'الملاحظة'}<textarea id="evb" class="tx" rows="3" maxlength="500" placeholder="${ev ? 'مثلاً: البروجكتر مشوّش، نفدت الموادّ' : 'ما الذي رأيته اليوم؟'}"></textarea></label>
      <label class="pick msimg"><input type="file" accept="image/*" capture="environment" id="evf" hidden><span id="evfv">${I('camera')} صورة (اختياريّة)</span></label>
      <button class="btn" data-act="evsend" style="margin-top:12px">${ev ? 'سجّل التقييم' : 'أرسل الملاحظة'}</button>
      <p class="note">${ev ? 'أسئلة «نعم/لا» تقيس ما حدث فعلاً — أصدق من «ممتاز جدّاً» للجميع.' : 'الملاحظات تتجمّع في «التقييم والإغلاق» عند الإدارة، وأفضلها يصير درساً للموسم القادم.'}</p>`);
    EVF = null; const f = document.getElementById('evf'); if (f) f.onchange = e => { EVF = e.target.files[0] || null; if (EVF) document.getElementById('evfv').innerHTML = `<img src="${URL.createObjectURL(EVF)}" alt="">`; };
  }
  async function evSend(btn) {
    const v = id => (document.getElementById(id) || {}).value || '', ev = canEval() && EV.kind === 'event';
    const body = ev ? { kind: 'event', title: v('evt').trim(), on_time: EV.on_time, late_min: v('evl'), staff_ok: EV.staff_ok, ready: EV.ready, engage: EV.engage || '', count: v('evc'), body: v('evb').trim() } : { kind: 'note', cat: EV.cat, body: v('evb').trim() };
    if (ev && body.title.length < 2) { toast('اكتب اسم الفعاليّة', 1); return; }
    if (!ev && body.body.length < 3) { toast('اكتب الملاحظة', 1); return; }
    btn.disabled = true;
    try {
      if (EVF && !DEMO) { const blob = await shrink(EVF); const r = await fetch(API + '/season/upload?' + new URLSearchParams({ code: saved.code, pin: saved.pin }), { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: blob }); const j = await r.json(); if (j.error) throw new Error(j.error); body.photo = j.path; }
      if (!DEMO) await post('/season/eval', { code: saved.code, pin: saved.pin, as: 'staff', eval: body });
      Object.assign(EV, { on_time: null, staff_ok: null, ready: null, engage: 0 }); toast(ev ? 'سُجّل التقييم ✓' : 'وصلت ملاحظتك ✓'); followView();
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  /* «الدوري»: الطالب يرى نفسه على ملعب فريقه ومركزه ومباراته القادمة والترتيب — والمشرف الرياضيّ يسجّل النتيجة الحيّة */
  let LGD = null, LGM = null, LGP = null;
  const lgAv = p => AV.of(p.av, p.n);
  async function lgLoad() {
    try { LGD = DEMO ? (LGD || demoLeague()) : await post('/season/league', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me' }); } catch (e) { toast(e.message, 1); LGD = null; }
  }
  const lgTeam = (L, id) => (L.teams || []).find(t => t.id === id) || { name: '؟', color: '#888', players: [] };
  async function leagueView() {
    if (!LGD) await lgLoad(); if (!LGD) return; const LS = LGD.leagues || [];
    if (!LS.length) { view('الدوري', '<p class="empty">لم يبدأ الدوري بعد.</p>'); return; }
    const today = pdayISO();
    view('الدوري', LS.map(L => {
      const mine = L.mine ? lgTeam(L, L.mine) : null, myId = MODE === 'staff' ? null : (mine && (mine.players.find(p => p.no === D.me.no) || {}).id);
      const ms = (L.matches || []), next = mine ? ms.find(m => m.s !== 'done' && (m.h === mine.id || m.a === mine.id)) : null, S = LGE.standings(L), sc = LGE.scorers(L);
      const row = m => { const h = lgTeam(L, m.h), a = lgTeam(L, m.a); return `<button class="lgm${m.s === 'live' ? ' live' : ''}" ${LGD.sports ? `data-lgm="${esc(m.id)}" data-lgl="${esc(L.id)}"` : 'disabled'}><span><i class="dot" style="--c:${esc(h.color)}"></i> ${esc(h.name)}</span><b dir="rtl">${m.s === 'scheduled' ? esc(m.f || 'vs') : `<bdi>${m.hs}</bdi> – <bdi>${m.as}</bdi>`}</b><span>${esc(a.name)} <i class="dot" style="--c:${esc(a.color)}"></i></span><small>${m.s === 'live' ? 'مباشر الآن' : m.s === 'done' ? 'انتهت' : esc(m.d ? fmtDay(m.d) : 'الجولة ' + m.r)}${m.p ? ' · ' + esc(m.p) : ''}</small></button>`; };
      return `<h3 class="sech">${esc(L.name)}</h3>
        ${mine && myId ? `<div class="znow"><small>فريقك</small><b style="color:${esc(mine.color)}">${esc(mine.name)}</b><small>مركزك: <b>${esc(LGE.posName(L.sport, (mine.pos || {})[myId]) || 'احتياط')}</b></small></div>${LGE.pitch(L.sport, mine, { me: myId, avatar: lgAv })}` : ''}
        ${next ? `<div class="znow"><small>مباراتك القادمة</small><b>${esc(lgTeam(L, next.h).name)} × ${esc(lgTeam(L, next.a).name)}</b><small>${esc([next.d ? fmtDay(next.d) : '', next.f ? fmtT2(next.f) : '', next.p].filter(Boolean).join(' · '))}</small></div>` : ''}
        ${LGD.sports ? `<p class="note">اضغط على المباراة لتسجيل نتيجتها.</p>` : ''}
        <div class="lglist">${ms.filter(m => m.s === 'live').concat(ms.filter(m => m.s === 'scheduled' && (!m.d || m.d >= today)).slice(0, 6), ms.filter(m => m.s === 'done').slice(-4).reverse()).map(row).join('') || '<p class="empty">لا مباريات بعد.</p>'}</div>
        <table class="lgt"><tr><th>#</th><th>الفريق</th><th>لعب</th><th>${L.sport === 'volleyball' ? 'أشواط' : 'أهداف'}</th><th>النقاط</th></tr>${S.map((r, i) => `<tr${mine && r.id === mine.id ? ' class="me"' : ''}><td>${i + 1}</td><td><i class="dot" style="--c:${esc(r.color)}"></i> ${esc(r.name)}</td><td>${r.p}</td><td dir="ltr">${r.gf}:${r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
        ${sc.length ? `<p class="note">الهدّافون: ${sc.slice(0, 5).map(p => `${esc(p.n)} (${p.g})`).join(' · ')}</p>` : ''}`;
    }).join(''));
  }
  /* تسجيل النتيجة: كرة القدم (هدف بالهدّاف، تراجع، إنهاء برجل المباراة) · الطائرة (نقطة بنقطة، الأشواط آليّة) */
  function matchView(lid, mid) {
    const L = (LGD.leagues || []).find(x => x.id === lid), m = L && (L.matches || []).find(x => x.id === mid); if (!m) return; LGM = { lid, mid };
    const h = lgTeam(L, m.h), a = lgTeam(L, m.a), vb = L.sport === 'volleyball', cur = vb ? (m.sets || []).slice(-1)[0] || [0, 0] : null;
    const side = (t, s) => `<div class="msd" style="--c:${esc(t.color)}"><b>${esc(t.name)}</b><div class="msc" dir="ltr">${vb ? (s === 'h' ? cur[0] : cur[1]) : (s === 'h' ? m.hs : m.as)}</div>${m.s !== 'done' ? `<button class="btn" data-lgact="${vb ? 'point' : 'goal'}" data-side="${s}">${vb ? '+ نقطة' : '+ هدف'}</button>` : ''}</div>`;
    view(L.name, `<div class="mboard">${side(h, 'h')}<span class="mvs">${vb ? `<small>الأشواط</small><b dir="ltr">${m.hs} – ${m.as}</b>` : '–'}</span>${side(a, 'a')}</div>
      ${vb && (m.sets || []).length ? `<p class="note" dir="ltr" style="text-align:center">${m.sets.map(x => x[0] + '-' + x[1]).join('  ·  ')}</p>` : ''}
      ${!vb && (m.ev || []).length ? `<div class="mev">${m.ev.map(e => { const t = e.s === 'h' ? h : a, p = (t.players || []).find(x => x.id === e.m); return `<span><i class="dot" style="--c:${esc(t.color)}"></i> ${p ? esc(p.n) : 'هدف'}</span>`; }).join('')}</div>` : ''}
      ${m.s === 'done' ? `<div class="vok">انتهت المباراة</div><button class="btn sec" data-lgact="reopen">أعد فتحها للتصحيح</button>`
        : `<div class="mact">${!vb && (m.ev || []).length ? `<button class="btn sec" data-lgact="undo">تراجع عن آخر هدف</button>` : ''}<button class="btn sec" data-lgact="finishask">إنهاء المباراة</button></div>`}`);
  }
  function pickPlayer(title, players, cb, none) {
    LGP = cb;
    view(title, `<div class="ppick">${players.map(p => `<button data-lgp="${esc(p.id)}"><span class="pav2 sm avr">${lgAv(p)}</span><b>${esc(p.n)}</b></button>`).join('')}${none ? `<button data-lgp=""><b>${none}</b></button>` : ''}</div>`);
  }
  async function lgAct(kind, extra) {
    const L = (LGD.leagues || []).find(x => x.id === LGM.lid), m = (L.matches || []).find(x => x.id === LGM.mid), body = Object.assign({ kind, match: m.id }, extra || {});
    try {
      if (DEMO) demoLgAct(L, m, body); else { const r = await post('/season/league/act', { code: saved.code, pin: saved.pin, as: 'staff', act: body }); LGD.leagues = r.leagues; }
      if (kind === 'finish') { toast('انتهت المباراة ✓'); document.querySelectorAll('.view').forEach(v => v.remove()); leagueView(); return; }
      document.querySelectorAll('.view').forEach(v => v.remove()); matchView(LGM.lid, LGM.mid);
    } catch (e) { toast(e.message, 1); }
  }
  function demoLgAct(L, m, b) {
    if (b.kind === 'goal') { m.s = 'live'; if (b.side === 'h') m.hs++; else m.as++; m.ev = (m.ev || []).concat([{ t: 'goal', s: b.side, m: b.member || null }]); }
    else if (b.kind === 'point') { m.s = 'live'; m.sets = m.sets && m.sets.length ? m.sets : [[0, 0]]; const c = m.sets[m.sets.length - 1]; c[b.side === 'h' ? 0 : 1]++; const tg = m.sets.length >= 3 ? 15 : 25; if ((c[0] >= tg || c[1] >= tg) && Math.abs(c[0] - c[1]) >= 2) { m.hs = m.sets.filter(x => x[0] > x[1]).length; m.as = m.sets.filter(x => x[1] > x[0]).length; if (m.hs < 2 && m.as < 2) m.sets.push([0, 0]); } }
    else if (b.kind === 'undo') { const e = (m.ev || []).pop(); if (e) { if (e.s === 'h') m.hs--; else m.as--; } }
    else if (b.kind === 'finish') { m.s = 'done'; m.mvp = b.mvp || null; } else if (b.kind === 'reopen') m.s = 'live';
  }
  function demoLeague() {
    const ps = (D.members || []).slice(0, 8).map(m => ({ id: m.id, n: m.n, av: m.av, no: m.no }));
    if (MODE === 'me') ps[0] = { id: 'me', n: D.me.name.split(' ').slice(0, 2).join(' '), av: D.me.avatar, no: D.me.no };
    while (ps.length < 8) ps.push({ id: 'p' + ps.length, n: ['فهد سعد', 'بدر علي', 'نواف ماجد', 'سلمان خالد', 'مشاري حمد', 'يزن عمر', 'عبدالله فيصل', 'ريان محمد'][ps.length], av: {}, no: 20 + ps.length });
    const A = ps.slice(0, 4), B = ps.slice(4, 8), pos = (arr, k) => Object.fromEntries(arr.map((p, i) => [p.id, k[i]]));
    return { sports: MODE === 'staff', leagues: [{ id: 'L1', name: 'دوري المتوسّط', sport: 'football', rules: { win: 3, draw: 1 }, mine: MODE === 'me' ? 'A' : null,
      teams: [{ id: 'A', name: 'النسور', color: '#16A34A', players: A, pos: pos(A, ['GK', 'RB', 'LB', 'ST']) }, { id: 'B', name: 'الصقور', color: '#DC2626', players: B, pos: pos(B, ['GK', 'CB', 'RM', 'ST']) }, { id: 'C', name: 'الفهود', color: '#EA580C', players: [], pos: {} }],
      matches: [{ id: 'm1', h: 'A', a: 'B', r: 1, d: pdayISO(), f: '22:00', p: 'الملعب', s: 'live', hs: 1, as: 0, ev: [{ t: 'goal', s: 'h', m: A[3].id }] }, { id: 'm2', h: 'B', a: 'C', r: 2, d: pdayISO(), f: '23:00', p: 'الملعب', s: 'scheduled', hs: 0, as: 0, ev: [] }, { id: 'm3', h: 'C', a: 'A', r: 3, s: 'scheduled', hs: 0, as: 0, ev: [] }] }] };
  }
  /* شهادة شكر من الجوال بعد الورشة مباشرة: تُصدر برقم تحقّق، وتُطبع أو تُرسل رابطها (season/cert/?id=) */
  const canCert = () => D.me.role === 'lead' || !!(D.me.perms || {}).certs || /برامج|نوعي|علاقات/.test((D.me.committee || {}).name || '');
  let CK = 'thanks';
  function certView() {
    view('شهادة شكر', `<div class="seg three ck">${[['thanks', 'شكر'], ['merit', 'تميّز'], ['participation', 'مشاركة']].map(([k, l]) => `<button class="${CK === k ? 'on' : ''}" data-ck="${k}">${l}</button>`).join('')}</div>
      <label class="fld">الاسم<input id="cn" class="tx" maxlength="80" list="cnl" placeholder="مثلاً: أ. خالد العتيبي"><datalist id="cnl">${(D.members || []).map(m => `<option value="${esc(m.n)}">`).join('')}</datalist></label>
      <label class="fld">السبب<textarea id="cr" class="tx" rows="3" maxlength="160" placeholder="مثلاً: على تقديمه ورشة التصوير بالجوال"></textarea></label>
      <button class="btn" data-act="certgo">أصدر الشهادة</button><p class="note">تُصدر برقم تحقّق ورمز QR — تطبعها أو ترسل رابطها للمكرَّم في الحال.</p>`);
  }
  async function certGo(btn) {
    const v = id => ((document.getElementById(id) || {}).value || '').trim(), body = { kind: CK, name: v('cn'), reason: v('cr') };
    if (body.name.length < 3) { toast('اكتب الاسم', 1); return; } btn.disabled = true;
    try {
      const r = DEMO ? { id: null } : await post('/season/cert', { code: saved.code, pin: saved.pin, as: 'staff', cert: body });
      const url = (NAT ? 'https://ibrahimsaud.com/charity/season/' : location.origin + location.pathname.replace(/[^/]*$/, '')) + 'cert/?' + (DEMO ? 'demo=1' : 'id=' + r.id);
      view('أُصدرت الشهادة', `<div class="done2"><img class="okimg" src="./states/done.webp" alt=""><h3>${esc(body.name)}</h3><p>${esc(body.reason)}</p></div>
        <a class="btn" href="${esc(url)}" target="_blank" rel="noopener">اعرض الشهادة واطبعها</a><button class="btn sec" style="margin-top:10px" data-share="${esc(url)}" data-share-t="${esc('شهادة ' + body.name)}">أرسل الرابط</button>`);
    } catch (e) { toast(e.message, 1); btn.disabled = false; }
  }
  function budgetWidget() {
    const d = D.me.daily, g = Math.min(D.me.givenToday || 0, d), left = d - g, pct = Math.round(g / d * 100);
    return `<button class="widget budget" data-open="give"><span class="bring" style="--p:${pct}"><b>${left}</b><small>باقي</small></span><span><small>رصيدك اليوم</small><b>${left ? 'وزّع ' + left + ' ' + esc(CUR().one) + ' قبل الختام' : 'خلّصت رصيد اليوم — بكرة رصيد جديد'}</b><small>منحتَ ${g} من ${d} · يتجدّد كلّ يوم</small></span></button>`;
  }
  const CAN_SCAN = () => !!NAT || 'BarcodeDetector' in window;
  /* البطاقة تكفي: مسح رمز بطاقة الطالب يرجع رقمه (كاميرا الآيفون أو BarcodeDetector) */
  function scanNo(vid) {
    return new Promise(async res => {
      if (NAT) { try { res(cardNo(await NAT.scan('امسح بطاقة الطالب')) || 0); } catch (e) { res(0); } return; }
      const v = document.getElementById(vid); if (!v || !('BarcodeDetector' in window)) { toast('اكتب الرقم — المسح غير متاح هنا', 1); return res(0); }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = stream; v.hidden = false; await v.play();
        const det = new BarcodeDetector({ formats: ['qr_code'] }), stop = () => { stream.getTracks().forEach(t => t.stop()); v.hidden = true; };
        const loop = async () => {
          if (!document.body.contains(v)) { stop(); return res(0); }
          try { const c = await det.detect(v); const raw = c[0] && c[0].rawValue; if (raw) { const n = cardNo(raw); if (n) { stop(); return res(n); } } } catch (e) {}
          requestAnimationFrame(loop);
        };
        loop();
      } catch (e) { toast('تعذّر فتح الكاميرا — اكتب الرقم', 1); res(0); }
    });
  }
  const TITLES = { coin: 'امنح', sell: 'الكاونتر', fine: 'مخالفة', fee: 'الجمارك' };
  function whoHTML(no) {
    const m = (D.members || []).find(x => String(x.no) === String(no)); if (!m) return '<small>امسح بطاقته أو اكتب رقمه.</small>';
    const ord = (D.orders || []).filter(o => o.no === m.no);
    return `<span class="dot" style="--c:${esc(team(m.t).color)}"></span><span><b>${esc(m.n)}</b><small> · ${esc(team(m.t).name)} · الرصيد ${m.b}${m.td != null ? ' · اليوم +' + m.td : ''}${m.f ? ' · مخالفات ' + m.f : ''}</small></span>`
      + (STF.kind === 'sell' && ord.length ? `<div class="ords">${ord.map(o => `<div class="ord"><span>${I('receipt')} ${esc(o.item)} <small>${o.p}</small></span><button class="chip on" data-deliver="${esc(o.id)}" data-dno="${m.no}">سلّم</button><button class="chip" data-deliver="${esc(o.id)}" data-dno="${m.no}" data-cancel="1">ألغِ</button></div>`).join('')}</div>` : '');
  }
  function staffForm(no) {
    const k = STF.kind, lim = (D.me.perms || {}).coins || 50, sell = k === 'sell', left = leftToday();
    const amts = [5, 10, 25, 50, 100].filter(a => a <= lim && (left == null || a <= Math.max(left, 5))).slice(0, 3).concat(can('fine') ? [] : [-Math.min(10, lim)]);
    if (!amts.includes(STF.amt)) STF.amt = amts[0];
    const vios = (D.season.violations || []); if (k === 'fine' && !vios.find(v => v.n === STF.vio)) STF.vio = (vios[0] || {}).n || '';
    const cus = (D.season.settings || {}).customs || {};
    const body = sell ? `<div class="items">${(D.items || []).filter(i => i.on !== false).map(i => `<button class="item${STF.item === i.id ? ' on' : ''}" data-item="${esc(i.id)}"><span class="ie" aria-hidden="true">${i.img ? `<img src="${esc(imgSrc(i.img))}" alt="">` : I('gift')}</span><b>${esc(i.n)}</b>${money(i.p)}${i.s != null ? `<small>بقي ${i.s}</small>` : ''}</button>`).join('') || '<p class="empty">المتجر فارغ.</p>'}</div>
        ${(D.orders || []).length ? `<h3 class="sech">طلبات تنتظر التسليم (${D.orders.length})</h3><div class="olist">${D.orders.map(o => `<button class="row svrow" data-ono="${o.no}"><span><b>${esc(o.item)}</b><small>#${o.no} · ${esc(String(o.n).split(' ')[0])}</small></span>${money(o.p)}</button>`).join('')}</div>` : ''}`
      : k === 'fine' ? `<div class="chips vios">${vios.map(v => `<button class="chip${STF.vio === v.n ? ' on' : ''}" data-vio="${esc(v.n)}">${esc(v.n)} <small dir="ltr">−${v.a}</small></button>`).join('')}</div><p class="note">يُخصم من رصيده (لا يصير سالباً)، ويُسجَّل في سجلّه السلوكيّ.</p>`
      : k === 'fee' ? `<div class="feebox">${money(cus.amount || 5, 'xl')}<small>${esc(cus.name || 'الجمارك')} — رسم ثابت يُخصم من رصيده</small></div>`
      : `<div class="amts">${amts.map(a => `<button data-amt="${a}" class="${STF.amt === a ? 'on' : ''}">${a > 0 ? '+' + a : '−' + Math.abs(a)}</button>`).join('')}</div>
      <div class="chips">${['حضور', 'مشاركة', 'فوز في مسابقة', 'انضباط', 'تعاون', 'إبداع'].concat(can('fine') ? [] : ['مخالفة']).map(r => `<button class="chip${STF.reason === r ? ' on' : ''}" data-reason="${r}">${r}</button>`).join('')}</div>`;
    const v = view(TITLES[k], `${CAN_SCAN() ? `<button class="btn sec scanb" data-act="scansn">${SV.cam} امسح بطاقة الطالب</button><video id="cam2" playsinline muted hidden></video>` : ''}
      <label class="fld">رقم الطالب<input id="sn" class="big" inputmode="numeric" autocomplete="off" placeholder="—" value="${no || ''}"></label>
      <div class="who" id="who">${whoHTML(no)}</div>${body}
      <button class="btn" data-act="${k}" style="margin-top:14px">${{ coin: 'امنح', sell: 'بيع', fine: 'سجّل المخالفة', fee: 'حصّل الرسم' }[k]}</button>
      <p class="note">${k === 'coin' ? `حدّك ${lim} في المرّة${left != null ? ` · باقي من رصيدك اليوم <b>${left}</b>` : ''}. ` : ''}كلّ حركة تُسجَّل باسمك.</p>`);
    const inp = v.querySelector('#sn');
    inp.oninput = () => { document.getElementById('who').innerHTML = whoHTML(inp.value.trim()); };
  }
  async function act(kind) {
    let body;
    if (kind === 'point') { if (!STF.team) { toast('اختر الفريق', 1); return; } body = { kind: 'point', team: STF.team, points: STF.pts, reason: STF.reason }; }
    else if (kind === 'guest') {
      const nm = ((document.getElementById('gn') || {}).value || '').trim(); if (nm.length < 2) { toast('اكتب اسم الضيف', 1); return; }
      body = { kind: 'guest', name: nm, budget: STF.gb || 100 };
    } else {
      const no = ((document.getElementById('sn') || {}).value || '').trim(); if (!no) { toast('امسح البطاقة أو اكتب الرقم', 1); return; }
      if (kind === 'sell' && !STF.item) { toast('اختر الصنف', 1); return; }
      if (kind === 'fine' && !STF.vio) { toast('اختر المخالفة', 1); return; }
      body = kind === 'sell' ? { kind: 'sell', member_no: +no, item: STF.item } : kind === 'fine' ? { kind: 'fine', member_no: +no, violation: STF.vio }
        : kind === 'fee' ? { kind: 'fee', member_no: +no } : { kind: 'coin', member_no: +no, amount: STF.amt, reason: STF.reason };
    }
    const btn = document.querySelector('[data-act="' + kind + '"]'); if (btn) btn.disabled = true;
    try {
      const r = DEMO ? demoAct(body) : await post('/season/staff/act', { code: saved.code, pin: saved.pin, act: body });
      if (kind === 'point') { D.teams = D.teams || {}; D.teams[STF.team] = (D.teams[STF.team] || 0) + STF.pts; toast(`${STF.pts > 0 ? '+' : ''}${STF.pts} لـ${team(STF.team).name}`); OPEN.teams(); return; }
      if (kind === 'guest') { guestDone(r); return; }
      const m = (D.members || []).find(x => x.no === body.member_no); if (m) { m.b = r.balance; if (kind === 'fine') m.f = (m.f || 0) + 1; if (kind === 'coin' && body.amount > 0) m.td = (m.td || 0) + body.amount; }
      if (kind === 'coin' && body.amount > 0) { D.me.given = (D.me.given || 0) + body.amount; D.me.givenToday = (D.me.givenToday || 0) + body.amount; }
      const first = String(r.name).split(' ')[0];
      toast(kind === 'sell' ? `بِيع «${r.item}» — رصيده ${r.balance}` : kind === 'fine' ? `سُجّلت المخالفة على ${first} (−${r.amount}) — رصيده ${r.balance}` : kind === 'fee' ? `حُصّل ${r.amount} من ${first} — رصيده ${r.balance}` : `${body.amount > 0 ? '+' : ''}${body.amount} لـ${first} — رصيده ${r.balance}`);
      staffForm();
    } catch (e) { toast(e.message, 1); if (btn) btn.disabled = false; }
  }
  async function deliver(id, no, cancel) {
    try {
      const r = DEMO ? (() => { const o = D.orders.find(x => x.id === id), m = D.members.find(x => x.no === no); if (cancel && m) m.b += o.p; return { ok: true, name: m.n, balance: m.b, item: o.item, cancelled: cancel ? o.item : null }; })()
        : await post('/season/staff/act', { code: saved.code, pin: saved.pin, act: { kind: 'deliver', member_no: no, order: id, cancel: !!cancel } });
      D.orders = (D.orders || []).filter(o => o.id !== id); const m = (D.members || []).find(x => x.no === no); if (m) m.b = r.balance;
      toast(cancel ? `أُلغي «${r.cancelled}» ورجع المبلغ` : `سُلّم «${r.item}» ✓`); STF.kind = 'sell'; staffForm(no);
    } catch (e) { toast(e.message, 1); }
  }
  /* رمز الضيف: مقدّم الورشة يمسحه فيمنح الطلاب من رصيد محدّد، وينتهي آخر يوم البرنامج */
  function guestDone(r) {
    const link = (NAT ? 'https://ibrahimsaud.com/charity/season/' : location.origin + location.pathname) + '?c=' + encodeURIComponent(D.season.code || '') + '&p=' + r.pin + '&as=staff';
    view('رمز الضيف', `<div class="recv"><small>${esc(r.name)}</small><div class="rqr">${qrSVG(link)}</div><div class="rno" dir="ltr">${esc(r.pin)}</div>
      <p>يمسح الضيف الرمز بكاميرا جواله فيدخل مباشرة. رصيده ${r.budget} ${esc(CUR().one)}، وينتهي الرمز آخر يوم البرنامج.</p></div>
      <button class="btn" data-share="${esc(link)}" data-share-t="${esc('رمز الضيف في ' + D.season.name)}">شارك الرابط</button>`);
  }

  document.addEventListener('click', e => {
    const dm = e.target.closest('[data-demo]'); if (dm) { demoGo(dm.dataset.demo); return; }
    if (e.target.closest('[data-demo-pick]')) { location.href = location.pathname + '?demo=pick'; return; }
    if (e.target.closest('[data-demo-exit]')) { location.href = location.pathname; return; }
    if (e.target.closest('[data-demo-menu]')) { demoMenu(); return; }
    const rl = e.target.closest('[data-role]'); if (rl) { ROLE = rl.dataset.role; try { localStorage.setItem('jw_role', ROLE); } catch (er) {} login(); return; }
    if (e.target.closest('[data-role-reset]')) { ROLE = null; try { localStorage.removeItem('jw_role'); } catch (er) {} login(); return; }
    const lg = e.target.closest('[data-libg]'); if (lg) { libPaint(lg.dataset.libg); return; }
    const lp = e.target.closest('[data-libpk]'); if (lp) { libPick(lp.dataset.libpk); return; }
    const amd = e.target.closest('[data-avmode]'); if (amd) { avMode(amd.dataset.avmode); return; }
    const ac2 = e.target.closest('[data-avcat]'); if (ac2) { AVC = ac2.dataset.avcat; avPaint(); return; }
    const ak = e.target.closest('[data-avk]'); if (ak) { if (AV.isMj(AVE)) AVE = Object.assign({}, AVDRAW || AV.seed(D.me.name)); AVE[ak.dataset.avk] = +ak.dataset.avv; avPaint(); avPop(); return; }
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
    const ls = e.target.closest('[data-libshop]'); if (ls && MS) { const L = JW_LIB.shop.find(x => x[0] === ls.dataset.libshop); MS.lib = 'lib:shop/' + L[0]; MS.file = null; MS.i.img = MS.lib; document.getElementById('msfv').innerHTML = `<img src="./shop/${L[0]}.webp" alt="">`; const f = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v; }; f('msn', L[1]); f('msp', L[2]); f('msd', L[3]); ls.parentElement.hidden = true; return; }
    const me1 = e.target.closest('[data-msedit]'); if (me1) { storeEdit(+me1.dataset.msedit); return; }
    const em = e.target.closest('[data-emo]'); if (em && MS) { MS.i.e = em.dataset.emo; em.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === em)); return; }
    const vm = e.target.closest('[data-vno]'); if (vm) { OPEN.scan(+vm.dataset.vno); return; }
    const c = e.target.closest('[data-close]'); if (c) { const au = document.getElementById('adhanAudio'); if (au && !au.paused && !document.querySelector('.adhan')) { au.pause(); au.currentTime = 0; } c.closest('.view').remove(); if (D) home(); return; }
    const pick = (attr, set) => { const b = e.target.closest('[' + attr + ']'); if (!b) return false; set(b.getAttribute(attr)); b.parentElement.querySelectorAll('[' + attr + ']').forEach(x => x.classList.toggle('on', x === b)); return true; };
    const ckb = e.target.closest('[data-ck]'); if (ckb) { CK = ckb.dataset.ck; ckb.parentElement.querySelectorAll('[data-ck]').forEach(b => b.classList.toggle('on', b === ckb)); return; }
    const ek = e.target.closest('[data-evk]'); if (ek) { EV.kind = ek.dataset.evk; followView(); return; }
    const ec = e.target.closest('[data-evc]'); if (ec) { EV.cat = ec.dataset.evc; ec.parentElement.querySelectorAll('[data-evc]').forEach(b => b.classList.toggle('on', b === ec)); return; }
    const ey = e.target.closest('[data-yn]'); if (ey) { const keep = (document.getElementById('evb') || {}).value, t = (document.getElementById('evt') || {}).value; EV[ey.dataset.yn] = ey.dataset.v === '1'; followView(); if (keep) document.getElementById('evb').value = keep; if (t != null && document.getElementById('evt')) document.getElementById('evt').value = t; return; }
    const eg = e.target.closest('[data-eng]'); if (eg) { EV.engage = +eg.dataset.eng; eg.parentElement.querySelectorAll('[data-eng]').forEach(b => b.classList.toggle('on', b === eg)); return; }
    const lm = e.target.closest('[data-lgm]'); if (lm) { matchView(lm.dataset.lgl, lm.dataset.lgm); return; }
    const la = e.target.closest('[data-lgact]'); if (la) { const k = la.dataset.lgact, L = (LGD.leagues || []).find(x => x.id === LGM.lid), m = (L.matches || []).find(x => x.id === LGM.mid);
      if (k === 'goal') { const t = lgTeam(L, la.dataset.side === 'h' ? m.h : m.a); pickPlayer('من سجّل؟ — ' + t.name, t.players || [], id => lgAct('goal', { side: la.dataset.side, member: id }), 'بدون تحديد'); return; }
      if (k === 'finishask') { pickPlayer('رجل المباراة', (lgTeam(L, m.h).players || []).concat(lgTeam(L, m.a).players || []), id => lgAct('finish', { mvp: id }), 'بدون رجل مباراة'); return; }
      lgAct(k, k === 'point' ? { side: la.dataset.side } : {}); return; }
    const lpk = e.target.closest('[data-lgp]'); if (lpk && LGP) { const cb = LGP; LGP = null; lpk.closest('.view').remove(); cb(lpk.dataset.lgp || ''); return; }
    const tk = e.target.closest('[data-task]'); if (tk) { const i = +tk.dataset.task; comAct({ kind: 'task', i, done: !D.me.committee.tasks[i].done }); return; }
    const dl = e.target.closest('[data-deliver]'); if (dl) { deliver(dl.dataset.deliver, +dl.dataset.dno, !!dl.dataset.cancel); return; }
    const on2 = e.target.closest('[data-ono]'); if (on2) { const i = document.getElementById('sn'); if (i) { i.value = on2.dataset.ono; i.oninput(); i.scrollIntoView({ block: 'center' }); } return; }
    const shr = e.target.closest('[data-share]'); if (shr) { const u = shr.dataset.share; if (navigator.share) navigator.share({ title: shr.dataset.shareT, url: u }).catch(() => {}); else { try { navigator.clipboard.writeText(u); toast('نُسخ الرابط'); } catch (er) {} } return; }
    const pre = e.target.closest('[data-preorder]'); if (pre) { preorder(pre); return; }
    if (pick('data-vio', v => STF.vio = v) || pick('data-gb', v => STF.gb = +v)) return;
    if (pick('data-amt', v => STF.amt = +v) || pick('data-pts', v => STF.pts = +v) || pick('data-reason', v => STF.reason = v) || pick('data-item', v => STF.item = v) || pick('data-team', v => STF.team = v)) return;
    const ac = e.target.closest('[data-act]'); if (ac && ac.dataset.act === 'publish') { publish(); return; } if (ac && ac.dataset.act === 'svsend') { survSend(ac); return; } if (ac && ac.dataset.act === 'xsend') { xferSend(ac); return; } if (ac && ac.dataset.act === 'camera') { scanCam(); return; } if (ac && ac.dataset.act === 'scanlogin') { scanLogin(); return; } if (ac && ac.dataset.act === 'checkin') { checkin(ac); return; } if (ac && ac.dataset.act === 'certgo') { certGo(ac); return; } if (ac && ac.dataset.act === 'evsend') { evSend(ac); return; } if (ac && ac.dataset.act === 'expense') { const a = +String((document.getElementById('exa') || {}).value || '').replace(/[^\d.]/g, ''); if (!a) { toast('اكتب المبلغ', 1); return; } comAct({ kind: 'expense', amount: a, party: (document.getElementById('exp') || {}).value || '', note: (document.getElementById('exn') || {}).value || '' }, ac); return; } if (ac && ac.dataset.act === 'excuse') { const d = (document.getElementById('exd') || {}).value; if (!d) { toast('اختر اليوم', 1); return; } comAct({ kind: 'excuse', day: d, reason: (document.getElementById('exr') || {}).value || '' }, ac); return; } if (ac && ac.dataset.act === 'here') { ac.disabled = true; cityAct({ kind: 'here' }); return; } if (ac && ac.dataset.act === 'pscan') { pscanLoop(); return; } if (ac && ac.dataset.act === 'patt') { const i = document.getElementById('pn'); if (i && i.value.trim()) { cityAct({ kind: 'patt', member_no: +i.value.trim() }); i.value = ''; } return; } if (ac && ac.dataset.act === 'scansn') { scanNo('cam2').then(n => { const i = document.getElementById('sn'); if (n && i) { i.value = n; i.oninput(); } }); return; } if (ac && ac.dataset.act === 'adhantest') { adhanTest(ac); return; } if (ac && ac.dataset.act === 'msnew') { storeEdit(null); return; } if (ac && ac.dataset.act === 'mslib') { const g = document.getElementById('mslib'); if (g) g.hidden = !g.hidden; return; } if (ac && ac.dataset.act === 'mssave') { storeSave(ac); return; } if (ac && ac.dataset.act === 'avsave') { avSave(ac); return; } if (ac) { if (ac.dataset.act === 'pushon') { pushEnable(ac); return; } act(ac.dataset.act); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const v = document.querySelector('.view'); if (v) { v.remove(); if (D) home(); } } });

  /* ═════════ التنبيهات: الصلاة (شاشة كاملة + صوت الأذان إن وُضع ملفّه، وإلا نغمة) والنشاط القادم قبل ١٠ دقائق ═════════ */
  const fired = new Set();
  function tone() { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [523.25, 659.25, 783.99].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(ac.destination); const t0 = ac.currentTime + i * .5; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.25, t0 + .05); g.gain.exponentialRampToValueAtTime(.001, t0 + 1.4); o.start(t0); o.stop(t0 + 1.5); }); } catch (e) {} }
  /* المتصفّحات (خاصّة الآيفون) تمنع الصوت بلا لمسة: أوّل لمسة في التطبيق «تفتح» عنصر الأذان صامتاً ليعمل وقت الصلاة */
  let audioOK = false;
  document.addEventListener('pointerdown', () => { if (audioOK) return; const a = document.getElementById('adhanAudio'); if (!a) return; a.muted = true; const p = a.play(); if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; audioOK = true; }).catch(() => { a.muted = false; }); }, { passive: true });
  function adhanTest(btn) { const a = document.getElementById('adhanAudio'); if (!a.paused) { a.pause(); a.currentTime = 0; btn.innerHTML = I('volume') + ' اسمع الأذان'; return; } a.muted = false; a.play().then(() => { btn.textContent = '■ إيقاف'; a.onended = () => { btn.innerHTML = I('volume') + ' اسمع الأذان'; }; }).catch(() => toast('تعذّر تشغيل الصوت', 1)); }
  /* ═════════ الإشعارات الحقيقيّة (Web Push): تصل والجوال مقفل — في الآيفون بعد «إضافة إلى الشاشة الرئيسيّة» ═════════ */
  const isIOS = !/Android/i.test(navigator.userAgent) && (/iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let swReg = null;
  if (!NAT && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').then(r => { swReg = r; }).catch(() => {});
  async function pushState() {
    if (NAT) return NAT.push.state();
    if (isIOS && !standalone()) return 'install';
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    try { const r = swReg || await navigator.serviceWorker.ready; const sub = await r.pushManager.getSubscription(); return sub && Notification.permission === 'granted' ? 'on' : 'off'; } catch (e) { return 'off'; }
  }
  const b64 = s2 => { const p = '='.repeat((4 - s2.length % 4) % 4), raw = atob((s2 + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); };
  async function pushEnable(btn) {
    const st = await pushState();
    if (st === 'install') { installHelp(); return; }
    if (st === 'unsupported') { toast('هذا المتصفّح لا يدعم الإشعارات — جرّب سفاري أو كروم', 1); return; }
    if (st === 'denied') { toast('الإشعارات ممنوعة لـ«جوّالي» — فعّلها من إعدادات الجوال', 1); return; }
    if (btn) btn.disabled = true;
    if (NAT) {
      try { if (DEMO) throw new Error('الإشعارات تعمل بعد الدخول بحسابك'); await NAT.push.enable({ code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me' }, API); toast('فُعّلت الإشعارات ✓ — يصلك الأذان والأخبار والجوال مقفل'); home(); }
      catch (e) { toast(e.message || 'تعذّر تفعيل الإشعارات', 1); if (btn) btn.disabled = false; }
      return;
    }
    try {
      if (await Notification.requestPermission() !== 'granted') throw new Error('لم تُسمح الإشعارات');
      if (DEMO) { toast('فُعّلت الإشعارات ✓ (تجريبيّ)'); OPEN.pray(); return; }
      const r = swReg || await navigator.serviceWorker.ready, { key } = await (await fetch(API + '/season/push/key')).json();
      const sub = (await r.pushManager.getSubscription()) || await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key) });
      await post('/season/push/sub', { code: saved.code, pin: saved.pin, as: MODE === 'staff' ? 'staff' : 'me', sub: sub.toJSON() });
      try { localStorage.setItem('jw_push', '1'); } catch (e) {}
      toast('فُعّلت الإشعارات ✓ — يصلك الأذان والأخبار والجوال مقفل'); home();
    } catch (e) { toast(e.message || 'تعذّر تفعيل الإشعارات', 1); if (btn) btn.disabled = false; }
  }
  function installHelp() {
    view('أضف «جوّالي» للشاشة', `<div class="inst"><div class="inst-ic"><img src="./icons/icon-192.png" alt=""></div>
      <p>في الآيفون تصل الإشعارات (الأذان والأخبار والعملات) بعد إضافة «جوّالي» للشاشة الرئيسيّة:</p>
      <ol><li>اضغط زرّ <b>المشاركة</b> <span class="shr" aria-hidden="true">${I('share')}</span> أسفل سفاري</li><li>اختر <b>«إضافة إلى الشاشة الرئيسيّة»</b></li><li>افتح «جوّالي» من أيقونته ثمّ اضغط <b>«فعّل الإشعارات»</b></li></ol>
      <p class="note">رمزك محفوظ — لن تحتاج إدخاله مرّة أخرى.</p></div>`);
  }
  async function pushBanner() {
    const el = document.getElementById('pushb'); if (!el) return;
    let hide = false; try { hide = localStorage.getItem('jw_push_x') === '1'; } catch (e) {}
    const st = await pushState(); if (hide || st === 'on' || st === 'unsupported') return;
    el.innerHTML = `<button class="widget pushb" data-act="pushon"><span class="pb-i" aria-hidden="true">${I('bell')}</span><span><b>فعّل الإشعارات</b><small>${st === 'install' ? 'أضف «جوّالي» للشاشة الرئيسيّة ليصلك الأذان والجوال مقفل' : st === 'denied' ? 'الإشعارات ممنوعة — فعّلها من الإعدادات' : 'الأذان والأخبار وعملاتك تصلك والجوال مقفل'}</small></span></button>`;
  }
  function sound() { try { const a = document.getElementById('adhanAudio'); const p = a.play(); if (p) p.catch(tone); } catch (e) { tone(); } }
  function notify(title, body) { try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: '../assets/apps/default/prayer.webp' }); } catch (e) {} }
  function adhan(name) {
    const d = document.createElement('div'); d.className = 'adhan'; d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-label', 'وقت الصلاة');
    d.innerHTML = `<div class="moon" aria-hidden="true">${I('moon', 'big')}</div><h1>حان الآن وقت صلاة ${name}</h1><p>حيّ على الصلاة، حيّ على الفلاح</p><button class="btn" style="max-width:320px">حسناً</button>`;
    d.querySelector('button').onclick = () => { d.remove(); try { const a = document.getElementById('adhanAudio'); a.pause(); a.currentTime = 0; } catch (e) {} };
    document.body.appendChild(d); sound(); notify('حان وقت صلاة ' + name, D ? D.season.name : '');
  }
  setInterval(() => {
    if (!D) return; const nowD = new Date(), [, [la, ln]] = cityLL(), key = nowD.toDateString();
    prayers(nowD, la, ln).filter(p => p[0] !== 'الشروق').forEach(([n, t]) => { const k = key + n, diff = nowD - t; if (diff >= 0 && diff < 90000 && !fired.has(k)) { fired.add(k); adhan(n); } });
    occ(2).forEach(x => { if (!x.f) return; const t = new Date(x.d + 'T' + x.f + ':00'), k = 'a' + x.d + x.f + x.t, diff = t - nowD; if (diff > 0 && diff <= 600000 && !fired.has(k)) { fired.add(k); toast(`بعد ${Math.max(1, Math.round(diff / 60000))} دقائق: ${x.t}`); notify('النشاط القادم: ' + x.t, x.p || ''); } });
    const el = document.getElementById('cd'); if (el) el.textContent = cd(nextPrayer()[1] - nowD);
  }, 20000);
  setInterval(() => { if (D && saved && saved.pin && !document.hidden && !document.querySelector('.view') && !DEMO) fetchData(saved.code, saved.pin); }, 60000);

  /* ═════════ بيانات توضيحيّة ═════════ */
  const T = [{ id: 'g', name: 'الأخضر', color: '#16A34A' }, { id: 'r', name: 'الأحمر', color: '#DC2626' }, { id: 'b', name: 'الأزرق', color: '#2563EB' }, { id: 'o', name: 'البرتقاليّ', color: '#EA580C' }];
  const iso = ms => new Date(Date.now() + ms).toISOString().slice(0, 10);
  const DZ = (dm, len, t, p, zone) => { const d = new Date(Date.now() + dm * 6e4), e = new Date(d.getTime() + len * 6e4), hh = x => String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0'); return { d: pdayISO(), f: hh(d), e: hh(e), t, p, g: '', k: 'zone', zone }; };
  const SCH = () => [DZ(-20, 45, 'المنطقة التنافسيّة', 'القاعات السفليّة', 'comp'), DZ(40, 45, 'المنطقة المهاريّة', 'القاعات العلويّة', 'skill'), { d: iso(0), f: '16:30', e: '17:15', t: 'الاستقبال والتسجيل', p: 'البوّابة', g: '' }, { d: iso(0), f: '17:30', e: '18:15', t: 'صلاة العصر ودرس قصير', p: 'المصلّى', g: '' }, { d: iso(0), f: '18:30', e: '19:30', t: 'دوري كرة القدم', p: 'الملعب', g: '' }, { d: iso(0), f: '19:45', e: '20:30', t: 'وجبة العشاء', p: 'الساحة', g: '' }, { d: iso(0), f: '20:45', e: '21:30', t: 'مسابقة خلية الحروف', p: 'القاعة', g: 'متوسط' },
    { d: iso(864e5), f: '16:00', e: '21:00', t: 'رحلة البحر', p: 'شاطئ نصف القمر', g: '' }, { d: iso(0), r: new Date(Date.now() + 2 * 864e5).getDay(), f: '19:30', e: '20:15', t: 'مجلس السيرة النبويّة', p: 'المصلّى', g: '' }, { d: iso(0), r: new Date(Date.now() + 2 * 864e5).getDay(), f: '20:30', e: '21:30', t: 'كرة طائرة', p: 'الملعب', g: '' }, { d: iso(12 * 864e5), k: 'trip', f: '06:00', e: '22:00', t: 'رحلة المدينة المنورة', p: 'من مقرّ الجمعيّة', g: '' }, { d: iso(2 * 864e5), f: '17:00', e: '18:30', t: 'ورشة تصوير بالجوال', p: 'المعمل', g: '' }, { d: iso(2 * 864e5), f: '19:00', e: '20:00', t: 'مسابقة السيرة', p: 'القاعة', g: '' }];
  const ITM = [{ id: 'i1', n: 'وجبة عشاء', p: 30, img: 'lib:shop/dinner', d: 'برجر مع بطاطس وعصير من مطعم الموسم.' }, { id: 'i5', n: 'آيس كريم', p: 15, img: 'lib:shop/icecream', d: 'كوب آيس كريم بالنكهة التي تختارها.' }, { id: 'i2', n: 'كرة قدم', p: 150, img: 'lib:shop/football', s: 3, d: 'كرة مقاس ٥ — لك أن تأخذها للبيت.' },
    { id: 'i6', n: 'قبّعة الموسم', p: 80, img: 'lib:shop/cap', s: 12, d: 'قبّعة بشعار الموسم ولون فريقك.' }, { id: 'i3', n: 'اختيار النشاط', p: 100, img: 'lib:shop/pick', d: 'فريقك يختار نشاط يوم الخميس.' }, { id: 'i4', n: 'الصفّ الأوّل في الرحلة', p: 200, img: 'lib:shop/bus', s: 1, d: 'مقعدك محجوز في الصفّ الأوّل في رحلة البحر.' },
    { id: 'i7', n: 'شاحن متنقّل', p: 250, img: 'lib:shop/powerbank', s: 2, d: '١٠ آلاف ملّي أمبير — للرحلات الطويلة.' }, { id: 'i8', n: 'كتاب قصص', p: 60, img: 'lib:shop/storybook', s: 5, d: 'قصص الأنبياء للناشئة — طبعة مصوّرة.' }];
  function sample() {
    const t = new Date().toISOString();
    return { season: { name: 'النادي الصيفيّ ١٤٤٨', org: 'جمعيّة تجريبيّة', code: 'DEMO42', teams: T, settings: Object.assign(DEMO_SET(), { salary: { on: true, amount: 20, days: [4, 0], time: '17:00', label: 'راتب' } }) }, me: { name: 'يزن عمر الحربي', orders: [{ id: 'o9', item: 'آيس كريم', p: 15, t }], today: 35, no: 8, team: 'r', stage: Q.get('stage') || (WALL[ROLE] ? ROLE : 'متوسط'), att: 14, attd: [0, 7, 9, 14, 16, 21, 28].map(n => iso(-n * 864e5)), avatar: AVSAVED(), grade: 'الثاني المتوسّط', school: 'متوسّطة الملك فهد', photo: '', balance: 145, sentToday: 1,
      tx: [{ a: 20, r: 'حوالة من فهد #3 — شكراً', t }, { a: 50, r: 'فوز في مسابقة', t }, { a: -30, r: 'شراء: وجبة عشاء', t: new Date(Date.now() - 864e5).toISOString() }, { a: -10, r: 'حوالة إلى بدر #7', t: new Date(Date.now() - 864e5).toISOString() }, { a: 25, r: 'انضباط', t: new Date(Date.now() - 2 * 864e5).toISOString() }, { a: 90, r: 'إبداع', t: new Date(Date.now() - 2 * 864e5).toISOString() }] },
      teams: { r: 120, g: 95, b: 80, o: 40 }, teamsMonth: { g: 45, r: 30, b: 25, o: 10 }, richMonth: [{ n: 'نواف', team: 'g', g: 'ابتدائي', b: 70 }, { n: 'يزن', team: 'r', g: 'متوسط', b: 55 }, { n: 'فهد', team: 'g', g: 'ثانوي', b: 40 }], rich: [{ n: 'فهد', team: 'g', g: 'ثانوي', b: 210 }, { n: 'يزن', team: 'r', g: 'متوسط', b: 145 }, { n: 'بدر', team: 'b', g: 'ابتدائي', b: 120 }, { n: 'سلمان', team: 'o', g: 'متوسط', b: 95 }, { n: 'نواف', team: 'g', g: 'ابتدائي', b: 70 }, { n: 'مشاري', team: 'b', g: 'ثانوي', b: 40 }], items: ITM, schedule: SCH() };
  }
  /* التجربة بقصّة «مدينة القيم»: الدنانير والبنك المركزيّ والجمارك والطلب المسبق */
  function DEMO_SET() { return { city: 'الأحساء', league: true, zones: [{ id: 'skill', n: 'المنطقة المهاريّة', p: 'القاعات العلويّة', c: '#0A84FF', img: 'lib:city/skill' }, { id: 'comp', n: 'المنطقة التنافسيّة', p: 'القاعات السفليّة', c: '#FF9F0A', img: 'lib:city/comp' }, { id: 'fun', n: 'المنطقة الترفيهيّة', p: 'الملعب وغرفة الألعاب', c: '#30D158', img: 'lib:city/fun' }], story: 'bank', currency: { name: 'الريالات', one: 'ريال', icon: '' }, preorder: true, customs: { name: 'الجمارك', amount: 5 }, daily: { staff: 300, member: 50 } }; }
  function AVSAVED() { try { return JSON.parse(localStorage.getItem('jw_demo_av') || '{}'); } catch (e) { return {}; } }
  function sampleStaff() {
    const names = ['محمد أحمد', 'عبدالله سعد', 'فهد خالد', 'سلمان علي', 'نواف ماجد', 'يزن عمر', 'بدر سامي', 'مشاري حمد'];
    return { season: { name: 'النادي الصيفيّ ١٤٤٨', org: 'جمعيّة تجريبيّة', code: 'DEMO42', teams: T, settings: DEMO_SET(), violations: [{ n: 'إزعاج', a: 10 }, { n: 'تسيّب من البرنامج', a: 15 }, { n: 'تأخّر', a: 5 }, { n: 'لباس غير مناسب', a: 5 }, { n: 'عدم احترام', a: 20 }] }, me: { name: 'عبدالرحمن المشرف', avatar: AVSAVED(), role: 'staff', stage: 'متوسط', perms: { coins: 50, points: true, sell: true, store: true, fine: true, customs: true, guests: true, eval: true, sports: true, certs: true }, given: 340, daily: 300, givenToday: 110, committee: { id: 'c1', name: 'لجنة التحفيز', dept: 'إدارة الفعاليّات', color: '#EAB308', lead: true, budget: 20000, advanced: 5000, returned: 0, spent: 3650, members: 6, status: 'approved', tasks: [{ t: 'قصّة العملة وتصميمها', done: true }, { t: 'شراء الجوائز اليوميّة والختاميّة' }, { t: 'تكريم الأعلى كسباً' }], mine: [{ a: 350, p: 'مكتبة جرير', n: 'جوائز اليوم', d: iso(-864e5), r: true }] }, excuses: [] }, orders: [{ id: 'o1', no: 2, n: 'عبدالله سعد', item: 'آيس كريم', p: 15, t: new Date().toISOString() }],
      members: names.map((n, i) => ({ id: 'm' + i, no: i + 1, n, g: ['متوسط', 'ابتدائي', 'ثانوي'][i % 3], av: {}, t: T[i % 4].id, b: [40, 120, 210, 15, 60, 145, 90, 0][i], td: [10, 0, 25, 0, 15, 30, 0, 0][i], f: [0, 0, 1, 2, 0, 0, 0, 1][i] })), teams: { r: 120, g: 95, b: 80, o: 40 }, items: ITM, schedule: SCH() };
  }
  function sampleFeed() {
    const h = n => new Date(Date.now() - n * 3600e3).toISOString();
    return [
      { id: 'f1', k: 'honor', t: 'نجم اليوم: الانضباط والصلاة في وقتها', b: 'حافظ على صلاة الجماعة طوال الأسبوع وكان قدوةً لفريقه. بارك الله فيه.', img: '', at: h(1), by: 'عبدالرحمن الخالدي', staff: true, hon: { n: 'يزن عمر', g: 'متوسط' }, r: { 'متوسط': 24, 'ابتدائي': 9, 'ثانوي': 6, 'جامعي': 4 }, mine: false },
      { id: 'f2', k: 'program', t: 'غداً: رحلة البحر', b: 'التجمّع الساعة ٤ عصراً عند البوّابة. أحضر قبّعتك وماءك. الحضور يُحسب بـ٢٠ عملة.', img: './walls/primary-wave.jpg', at: h(3), by: 'الإدارة', staff: false, r: { 'ابتدائي': 31, 'متوسط': 18, 'ثانوي': 11 }, mine: true },
      { id: 'f3', k: 'teaser', t: 'شيءٌ كبير قادم يوم الخميس…', b: 'خمّنوا!', img: './walls/middle-sunset.jpg', at: h(6), by: 'الإدارة', staff: false, r: { 'متوسط': 40, 'ثانوي': 22, 'ابتدائي': 15, 'جامعي': 7 }, mine: false },
      { id: 'f4', k: 'news', t: 'الأحمر يتصدّر دوري كرة القدم', b: 'فوز ٣–١ على الأزرق في مباراة حماسيّة. الترتيب في تطبيق «الترتيب».', img: './walls/secondary-forest.jpg', at: h(26), by: 'فيصل العتيبي', staff: true, r: { 'ثانوي': 17, 'متوسط': 12 }, mine: false },
    ];
  }
  function demoMember(no) { const m = (D.members || []).find(x => x.no === no); return m ? { found: true, no: m.no, n: m.n, g: m.g, grade: '', t: m.t, photo: '', b: m.b } : { found: false }; }
  function demoAct(b) {
    if (b.kind === 'point') return { ok: true };
    if (b.kind === 'guest') return { ok: true, name: b.name, pin: String(100000 + Math.floor(Math.random() * 899999)), budget: b.budget, expires: '' };
    const m = (D.members || []).find(x => x.no === b.member_no); if (!m) throw new Error('لا يوجد مشارك بهذا الرقم');
    if (b.kind === 'fine') { const v = D.season.violations.find(x => x.n === b.violation), a = Math.min(v.a, m.b); return { ok: true, name: m.n, balance: m.b - a, amount: a }; }
    if (b.kind === 'fee') { const a = D.season.settings.customs.amount; if (m.b < a) throw new Error('الرصيد لا يكفي للرسم (' + m.b + ')'); return { ok: true, name: m.n, balance: m.b - a, amount: a }; }
    if (b.kind === 'coin' && b.amount > 0 && D.me.daily && (D.me.givenToday || 0) + b.amount > D.me.daily) throw new Error('باقي من رصيدك اليوم ' + (D.me.daily - D.me.givenToday) + ' فقط');
    if (b.kind === 'coin') { if (Math.abs(b.amount) > D.me.perms.coins) throw new Error('الحدّ المسموح لك ' + D.me.perms.coins + ' في المرّة'); if (m.b + b.amount < 0) throw new Error('الرصيد لا يكفي للخصم'); return { ok: true, name: m.n, balance: m.b + b.amount }; }
    const it = ITM.find(i => i.id === b.item); if (m.b < it.p) throw new Error('الرصيد لا يكفي (' + m.b + ')'); return { ok: true, name: m.n, balance: m.b - it.p, item: it.n };
  }
  /* ═════════ وضع التجربة: كلّ الأدوار ببيانات توضيحيّة بلا رمز — للعرض على الجمعيّات ═════════ */
  function demoGo(k) {
    if (k === 'admin') { location.href = WEB + 'index.html?demo=1'; return; }
    location.href = location.pathname + '?demo=1&as=' + (k === 'staff' ? 'staff' : 'me&stage=' + encodeURIComponent(k));
  }
  function demoMenu() {
    view('وضع التجربة', `<p class="note">تتصفّح بيانات جمعيّة توضيحيّة — لا شيء يُحفظ ولا يصل لأحد.</p>
      <div class="roles">${ROLES.map(([k, n, , av]) => `<button class="role" data-demo="${k}" style="--rc:${roleColor(k)}"><span class="rav">${roleArt(k, av)}</span><span class="rtx"><b>${n}</b></span><span class="chev" aria-hidden="true">‹</span></button>`).join('')}</div>
      <button class="btn sec" style="margin-top:16px" data-demo-exit>خروج من التجربة</button>`);
  }
  if (DEMO) { const c = document.createElement('button'); c.className = 'demochip'; c.dataset.demoMenu = ''; c.setAttribute('aria-label', 'وضع التجربة — بدّل الدور أو اخرج'); c.innerHTML = 'تجربة <span aria-hidden="true">⇄</span>'; document.body.appendChild(c); }
  const L0 = loginLink(location.href);
  AV.lib().then(g => { if (g.length && D && !document.querySelector('.view')) home(); });
  if (L0 && !DEMO) { MODE = L0.staff ? 'staff' : 'me'; ROLE = L0.staff ? 'staff' : ROLE; history.replaceState(null, '', location.pathname); fetchData(L0.c, L0.p, true); }
  else if (DEMO && Q.get('as')) { ROLE = Q.get('as') === 'staff' ? 'staff' : (Q.get('stage') || ROLE || 'متوسط'); fetchData(); }
  else if (!DEMO && saved && saved.pin) fetchData(saved.code, saved.pin); else login();
  /* تطبيق الآيفون: فتح شاشة من إشعار (?open=pray) أو من رابط عامّ مُسح بكاميرا الجوال (?c=&p= دخول، ?v= بطاقة) */
  if (NAT) NAT.onOpen(url => {
    let u; try { u = new URL(url, location.href); } catch (e) { return; }
    const L = loginLink(u.href); if (L && !DEMO) { MODE = L.staff ? 'staff' : 'me'; ROLE = L.staff ? 'staff' : ROLE; fetchData(L.c, L.p, true); return; }
    const op = u.searchParams.get('open'), v = +u.searchParams.get('v');
    const go = () => { const cur = document.querySelector('.view'); if (cur) cur.remove(); if (['pray', 'cal', 'news', 'bank'].includes(op)) { home(); OPEN[op](); } else if (v) { if (MODE === 'staff') OPEN.scan(v); else if (v !== D.me.no) OPEN.xfer(v); } };
    if (D) go(); else PEND = go;
  });
})();
