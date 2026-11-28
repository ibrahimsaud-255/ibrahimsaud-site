/*
 * core.js — نواة المنصّة: الإعدادات + طبقة البيانات + الأدوات المشتركة
 * ─────────────────────────────────────────────────────────────────────────
 * مثل «نظام الجمعيات»: طبقة البيانات كلّها في DB (load/save). اليوم تعمل في
 * «الوضع التجريبيّ» داخل المتصفّح (localStorage)، وعند الربط بقاعدة البيانات
 * يتغيّر هذا الملفّ فقط (DB.load / DB.save / DB.sendOtp / DB.verifyOtp).
 */
const CONFIG = {
  name: 'مسابقة الشيخ محمد بن عبدالله الماجد',
  sub: 'لحفظ السنة النبوية بمحافظة ثادق ومراكزها',
  short: 'مسابقة الماجد',
  org: 'جمعية الدعوة والإرشاد وتوعية الجاليات بمحافظة ثادق',
  partner: 'مؤسسة الماجد الأهلية',
  text: 'الأربعون النووية',
  demo: true,
  storageKey: 'majed_sunnah_v1',
  groupSize: 25,
  // المراكز تُعدَّل من «الإعدادات» في لوحة الإدارة
  centers: ['ثادق'],
  // المراحل (الخطة الزمنية — ملحق الوثيقة: ثمانية أسابيع)
  phases: [
    { key: 'reg',   name: 'الإعداد والإطلاق والتسجيل', weeks: 'الأسبوع الأول' },
    { key: 'learn', name: 'التحفيظ والمتابعة والتأهيل', weeks: 'الأسبوع ٢–٦' },
    { key: 'final', name: 'التصفيات النهائية',          weeks: 'الأسبوع السابع' },
    { key: 'honor', name: 'التكريم والتقرير الختامي',    weeks: 'الأسبوع الثامن' },
  ],
  // معايير التحكيم الشفهيّ (لجان التحكيم): الحفظ، ضبط الألفاظ، الفهم، حسن الأداء
  criteria: [
    { key: 'hifz',  name: 'الحفظ',          max: 50 },
    { key: 'dabt',  name: 'ضبط الألفاظ',    max: 20 },
    { key: 'fahm',  name: 'الفهم',          max: 20 },
    { key: 'adaa',  name: 'حسن الأداء',     max: 10 },
  ],
  passMark: 70,          // درجة التأهّل للتصفيات (من ١٠٠)
  committees: 6,         // ٣ للرجال + ٣ للنساء، كلّ لجنة محكّمان
};

// المسارات الستّة — ملحق الوثيقة «ثانياً: مسارات المسابقة والمستفيدون»
const TRACKS = [
  { id: 1, key: 'kids',    name: 'الأطفال والناشئة', who: 'أصغر من ١٠ سنوات', amount: 10, plan: 'حفظ ١٠ أحاديث مختارة من الأربعين النووية', target: 50,  exam: 'اختبار شفهيّ مبسّط + مشاركة تطبيقيّة', color: '#0A84FF' },
  { id: 2, key: 'elders',  name: 'كبار السنّ',        who: 'من ٦٠ سنة فأكثر', amount: 10, plan: 'حفظ ١٠ أحاديث مختارة، مع شرح ميسّر لمعانيها', target: 50,  exam: 'اختبار شفهيّ مبسّط في الحفظ والمعنى', color: '#AC7F5E' },
  { id: 3, key: 'jaliyat', name: 'الجاليات',          who: 'الناطقون بغير العربية من ١٣ سنة فأكثر', amount: 15, plan: 'حفظ ١٥ حديثاً مختاراً، مع مساندة لغويّة لفهم المعاني', target: 75, exam: 'اختبار مبسّط في الحفظ والمعنى', color: '#30B0C7' },
  { id: 4, key: 'full',    name: 'الحفظ الكامل',      who: 'الشباب والعموم من ١٣ سنة فأكثر', amount: 42, plan: 'حفظ الأربعين النووية كاملة (٤٢ حديثاً)', target: 100, exam: 'اختبار إلكترونيّ + شفهيّ', color: '#0E5A4A' },
  { id: 5, key: 'elite',   name: 'المتميّزون والمتفوّقون', who: 'من ١٣ سنة فأكثر، ويُقبل الأصغر حسب الإتقان', amount: 50, plan: 'الأربعون النووية مع زيادة ابن رجب الحنبلي (٥٠ حديثاً)', target: 100, exam: 'حفظ وفهم + تصفية نهائيّة', color: '#A47B2C' },
  { id: 6, key: 'huffaz',  name: 'الحفّاظ',           who: 'من ١٣ سنة فأكثر', amount: 100, plan: 'حفظ ١٠٠ حديث تحدّدها اللجنة العلميّة', target: 75, exam: 'حفظ وفهم + تصفية نهائيّة', color: '#5E5CE6' },
];
const TRACK = id => TRACKS.find(t => t.id === +id);

// الاختبارات: ٣ مرحليّة (مؤشّر الأداء: ٣ اختبارات إلكترونيّة على الأقلّ) + النهائيّ الشفهيّ
const DEFAULT_EXAMS = [
  { id: 'e1', name: 'الاختبار المرحليّ الأوّل',  kind: 'stage', week: 3, max: 100 },
  { id: 'e2', name: 'الاختبار المرحليّ الثاني',  kind: 'stage', week: 4, max: 100 },
  { id: 'e3', name: 'الاختبار المرحليّ الثالث',  kind: 'stage', week: 6, max: 100 },
  { id: 'fn', name: 'التصفية النهائيّة (شفهيّ)', kind: 'final', week: 7, max: 100 },
];

/* ═════════ الفرز الآليّ على المسارات ═════════
 * القواعد من ملحق الوثيقة:
 *  - أصغر من ١٠ ← الأطفال والناشئة
 *  - ٦٠ فأكثر ← كبار السنّ (ويجوز لهم الحفظ الكامل أو المتميّزون)
 *  - غير الناطق بالعربية ١٣+ ← الجاليات (ويجوز لهم الحفظ الكامل أو المتميّزون)
 *  - ١٣+ ← حسب الطموح: الكامل / المتميّزون (٥٠) / الحفّاظ (١٠٠)
 *  - ١٠–١٢ سنة: غير مغطّاة في الوثيقة ← الأطفال والناشئة مؤقّتاً مع تنبيه «تحتاج قرار اللجنة»،
 *    ويجوز «المتميّزون» حسب الإتقان.
 */
function eligibleTracks(p) {
  const a = +p.age, out = [];
  if (a < 10) return [1, 5];
  if (a < 13) return [1, 5];
  if (a >= 60) out.push(2);
  if (p.arabic === 'no') out.push(3);
  out.push(4, 5, 6);
  return out;
}
function suggestTrack(p) {
  const a = +p.age;
  if (a < 13) return { id: 1, note: a >= 10 ? 'عمر ١٠–١٢ غير محدّد في الوثيقة — يحتاج قرار اللجنة العلميّة' : '' };
  if (p.goal === '100') return { id: 6 };
  if (p.goal === '50') return { id: 5 };
  if (a >= 60 && p.goal !== '42') return { id: 2 };
  if (p.arabic === 'no' && p.goal !== '42') return { id: 3 };
  return { id: 4 };
}

/* ═════════ أدوات عامّة ═════════ */
// نسخة «المعاينة» (ملفّ واحد داخل رابط Claude): لا تحميل ملفّات ولا طباعة — التصدير نسخٌ للحافظة
const IN_ARTIFACT = !!window.__ARTIFACT;
const SS = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  del(k) { try { sessionStorage.removeItem(k); } catch {} },
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const AR = n => (n ?? '').toLocaleString('ar-SA');
const fmtNum = n => Number(n || 0).toLocaleString('ar-SA', { maximumFractionDigits: 1 });
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
const uid = () => Math.random().toString(36).slice(2, 10);
const initials = n => (n || '؟').trim().split(/\s+/)[0].slice(0, 1);
const fmtDate = d => new Date(d).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long' });

// أيقونات (رسم بنمط SF Symbols / Lucide، داخليّة بلا مكتبات خارجيّة)
const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  group: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  exam: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 16V11M12 16V7M17 16v-3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chev: '<path d="m15 18-6-6 6-6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  sidebar: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  wand: '<path d="m15 4-1 1M18 7l1-1M14.5 9.5 4 20l-1-1L13.5 8.5M17.5 2v2M21 6h-2M17.5 10V8M14 6h2"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 10.5l-6.1 1.7L12 18l-1.9-5.8L4 10.5l6.1-1.7z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8.2 10.2 5 3h4l3 6M15.8 10.2 19 3h-4l-3 6"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

/* ═════════ طبقة البيانات ═════════ */
const DB = (() => {
  let mem = null;
  const safe = {
    get(k) { try { return localStorage.getItem(k); } catch { return mem; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { mem = v; } },
    del(k) { try { localStorage.removeItem(k); } catch { mem = null; } },
  };
  let state = null;
  function blank() {
    return { v: 1, seq: 1000, participants: [], groups: [], exams: DEFAULT_EXAMS.map(e => ({ ...e })), scores: {}, finals: {},
      committees: [], settings: { regOpen: true, centers: [...CONFIG.centers], passMark: CONFIG.passMark, groupSize: CONFIG.groupSize }, log: [] };
  }
  function load() {
    if (state) return state;
    try { state = JSON.parse(safe.get(CONFIG.storageKey) || 'null'); } catch { state = null; }
    if (!state) { state = blank(); seed(state); save(); }
    return state;
  }
  function save() { safe.set(CONFIG.storageKey, JSON.stringify(state)); }
  function reset() { safe.del(CONFIG.storageKey); state = null; return load(); }
  function nextNo() { state.seq += 1; return state.seq; }
  function addLog(t) { state.log.unshift({ t, at: Date.now() }); state.log = state.log.slice(0, 60); }

  // رمز التحقّق: في الوضع التجريبيّ يظهر الرمز على الشاشة؛ عند الربط يُرسل للبريد من الخادم.
  const otps = {};
  async function sendOtp(email) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    otps[email.toLowerCase()] = { code, at: Date.now() };
    return { demoCode: CONFIG.demo ? code : null };
  }
  async function verifyOtp(email, code) {
    const o = otps[email.toLowerCase()];
    return !!o && o.code === String(code).trim() && Date.now() - o.at < 10 * 60e3;
  }
  return { load, save, reset, nextNo, addLog, sendOtp, verifyOtp, get s() { return load(); } };
})();

/* ═════════ بيانات تجريبيّة (أسماء عامّة وهميّة) ═════════ */
function seed(S) {
  let r = 7; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const mN = ['عبدالله', 'محمد', 'فهد', 'سعد', 'عبدالرحمن', 'خالد', 'سلمان', 'تركي', 'ناصر', 'يوسف', 'إبراهيم', 'عمر', 'بدر', 'ماجد', 'سلطان', 'راشد', 'حمد', 'مشاري'];
  const fN = ['نورة', 'سارة', 'هيا', 'منيرة', 'الجوهرة', 'لطيفة', 'ريم', 'العنود', 'مها', 'أسماء', 'جواهر', 'لمى', 'شهد', 'رغد', 'حصة', 'دانة'];
  const last = ['العتيبي', 'الدوسري', 'القحطاني', 'الشمري', 'السبيعي', 'المطيري', 'الحربي', 'السهلي', 'العنزي', 'الرشيدي', 'الزهراني', 'الماجد'];
  const jN = ['Ahmed Rahman', 'Mohammed Karim', 'Abdul Hakim', 'Yusuf Ali', 'Imran Hossain', 'Bilal Ahmad', 'Fatima Begum', 'Aisha Noor'];
  const now = Date.now();
  const plan = [[1, 38], [2, 22], [3, 30], [4, 58], [5, 36], [6, 16]];
  plan.forEach(([tid, n]) => {
    for (let i = 0; i < n; i++) {
      const g = rnd() < (tid === 3 ? .25 : .48) ? 'f' : 'm';
      let age = tid === 1 ? 6 + Math.floor(rnd() * 4) : tid === 2 ? 60 + Math.floor(rnd() * 15) : 13 + Math.floor(rnd() * 30);
      const name = tid === 3 ? pick(jN) : `${pick(g === 'm' ? mN : fN)} ${pick(mN)} ${pick(last)}`;
      const status = rnd() < .08 ? 'pending' : rnd() < .06 ? 'withdrawn' : 'active';
      S.participants.push({
        id: uid(), no: ++S.seq, name, gender: g, age, arabic: tid === 3 ? 'no' : 'yes', nationality: tid === 3 ? 'غير سعودي' : 'سعودي',
        phone: '05' + String(Math.floor(10000000 + rnd() * 89999999)), email: `user${S.seq}@example.com`, center: 'ثادق',
        guardian: tid === 1 ? `ولي أمر ${name.split(' ')[0]}` : '', memorized: Math.floor(rnd() * 10), goal: tid === 6 ? '100' : tid === 5 ? '50' : '42',
        track: tid, status, verified: true, createdAt: now - Math.floor(rnd() * 9) * 864e5 - Math.floor(rnd() * 864e5), group: null,
      });
    }
  });
  autoGroups(S);
  // درجات تجريبيّة للاختبارين المرحليّين الأوّلين
  S.participants.filter(p => p.status === 'active').forEach(p => {
    ['e1', 'e2'].forEach((e, k) => {
      if (rnd() < (k ? .82 : .93)) (S.scores[e] ||= {})[p.id] = Math.min(100, Math.round(58 + rnd() * 42));
    });
  });
  S.committees = Array.from({ length: CONFIG.committees }, (_, i) => ({
    id: 'c' + (i + 1), name: `لجنة التحكيم ${['الأولى', 'الثانية', 'الثالثة'][i % 3]} — ${i < 3 ? 'رجال' : 'نساء'}`, gender: i < 3 ? 'm' : 'f',
    judges: ['', ''],
  }));
  S.log = [{ t: 'أُطلقت المنصّة في الوضع التجريبيّ', at: now }];
}

/* توزيع المجموعات: لكلّ مسار ولكلّ جنس، مجموعات بمتوسّط groupSize */
function autoGroups(S) {
  const size = +(S.settings?.groupSize || CONFIG.groupSize);
  const keep = {}; (S.groups || []).forEach(g => keep[g.id] = g);
  S.groups = [];
  TRACKS.forEach(t => ['m', 'f'].forEach(g => {
    const list = S.participants.filter(p => p.track === t.id && p.gender === g && p.status !== 'withdrawn');
    if (!list.length) return;
    const n = Math.max(1, Math.round(list.length / size));
    for (let i = 0; i < n; i++) {
      const id = `g${t.id}${g}${i + 1}`;
      S.groups.push({ id, track: t.id, gender: g, n: i + 1, name: `${t.name} — ${g === 'm' ? 'بنين/رجال' : 'بنات/نساء'} ${n > 1 ? '(' + AR(i + 1) + ')' : ''}`.trim(), teacher: keep[id]?.teacher || '' });
    }
    list.sort((a, b) => a.age - b.age).forEach((p, i) => p.group = `g${t.id}${g}${(i % n) + 1}`);
  }));
}
function assignGroup(S, p) {
  const gs = S.groups.filter(g => g.track === p.track && g.gender === p.gender);
  if (!gs.length) { autoGroups(S); return; }
  const count = id => S.participants.filter(x => x.group === id).length;
  p.group = gs.sort((a, b) => count(a.id) - count(b.id))[0].id;
}

/* متوسّط الاختبارات المرحليّة لمشارك */
function stageAvg(S, p) {
  const ex = S.exams.filter(e => e.kind === 'stage');
  const vals = ex.map(e => S.scores[e.id]?.[p.id]).filter(v => v != null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}
function finalScore(S, p) {
  const f = S.finals[p.id]; if (!f) return null;
  return CONFIG.criteria.reduce((a, c) => a + (+f[c.key] || 0), 0);
}

/* ═════════ واجهة: إشعار + نافذة ═════════ */
function toast(msg, icon = 'check') {
  if (window.UI_ADMIN?.active) return window.UI_ADMIN.toast(msg, icon);
  let w = $('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icon) + `<span>${msg}</span>`;
  w.appendChild(t); setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2600);
}
function sheet({ title, body, foot = '', wide = false, onMount }) {
  if (window.UI_ADMIN?.active) return window.UI_ADMIN.sheet({ title, body, foot, wide, onMount });
  const b = document.createElement('div'); b.className = 'sheet-back';
  b.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h3>${title}</h3><button class="icon-btn" data-x aria-label="إغلاق">${ic('x')}</button></div>
    <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}</div>`;
  const close = () => { b.remove(); document.removeEventListener('keydown', k); };
  const k = e => e.key === 'Escape' && close();
  b.addEventListener('click', e => { if (e.target === b || e.target.closest('[data-x]')) close(); });
  document.addEventListener('keydown', k);
  document.body.appendChild(b); onMount && onMount(b, close);
  return close;
}
function download(name, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + text], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
// تصدير جدول: ملفّ CSV يفتح في Excel، أو (في المعاينة) نسخٌ للحافظة يُلصق في Excel مباشرة
function exportTable(name, rows) {
  if (!IN_ARTIFACT) { download(name, csv(rows)); toast('صُدّر الملفّ', 'down'); return; }
  const tsv = rows.map(r => r.map(v => String(v ?? '').replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
  (navigator.clipboard?.writeText(tsv) || Promise.reject()).then(() => toast('نُسخ الجدول — الصقه في Excel', 'down'), () => toast('التصدير يعمل في النسخة المنشورة على الدومين', 'info'));
}
function confirmSheet(msg, yes, onYes) {
  sheet({ title: 'تأكيد', body: `<p>${msg}</p>`, foot: `<button class="btn btn-danger" data-yes>${yes}</button><button class="btn" data-x>إلغاء</button>`,
    onMount: (el, close) => $('[data-yes]', el).onclick = () => { close(); onYes(); } });
}
const csv = rows =>rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
