/*
 * 30-compliance.js — «ملفّ الجمعيّة» + «الامتثال والإفصاح» (المرحلة ١ من مقترح docs/نظام-الجمعيات)
 * ─────────────────────────────────────────────────────────────────────────
 * • ملفّ الجمعيّة (شاشة orgfile): ٧ خطوات تُدخل مرّة واحدة وتغذّي كلّ شيء — الوثائق والتقارير والموقع لاحقاً.
 *   يُحفظ في orgs.profile (الدالّة update_org_profile) بالمفاتيح القديمة نفسها (license, address, phone, email,
 *   bankName, iban, accName, logo, boardMembers) + مفاتيح جديدة. التحقّق النظاميّ على اللائحة التنفيذيّة المعدّلة ٢٠٢٦.
 * • الامتثال والإفصاح (شاشة comply): جاهزيّة الإفصاح /١٠٠ على أوزان معيار الشفافية والإفصاح (المركز الوطني)،
 *   الفحوص النظاميّة، ومزامنة تقويم الالتزامات مع مواعيد اللائحة (العموميّة، الحساب الختاميّ، الانتخابات، الترخيص…).
 * المراجع: docs/نظام-الجمعيات/بحث/ (ncnp-requirements.md, regulation-2026-notes.md).
 * البادئة: of (الملفّ) و cx (الامتثال). ⚠️ تعريفات فقط — التسجيل في RENDER و RUSO_APPS داخل 99-boot.js.
 */

/* ═════════ تعريف الخطوات والحقول ═════════
   [المفتاح, العنوان, النوع, خيارات/تلميح, مطلوب؟]  — الأنواع: text textarea lines num money date select bool email tel url img color obj */
const OF_REGIONS = { '': '— اختر —', riyadh: 'منطقة الرياض', makkah: 'منطقة مكة المكرمة', madinah: 'منطقة المدينة المنورة', qassim: 'منطقة القصيم', eastern: 'المنطقة الشرقية', asir: 'منطقة عسير', tabuk: 'منطقة تبوك', hail: 'منطقة حائل', northern: 'منطقة الحدود الشمالية', jazan: 'منطقة جازان', najran: 'منطقة نجران', baha: 'منطقة الباحة', jouf: 'منطقة الجوف' };
const OF_STEPS = [
  { id: 'identity', name: 'الهويّة', icon: 'fingerprint', fields: [
    ['_name', 'اسم الجمعيّة الرسميّ (كما في الترخيص)', 'text', '', 1], ['nameEn', 'الاسم بالإنجليزيّة', 'text', 'يظهر في الختم والوثائق'], ['shortName', 'الاسم المختصر', 'text', 'مثال: رسو'],
    ['logo', 'الشعار', 'img', 'PNG بخلفيّة شفّافة — يظهر في الوثائق والمطبوعات والموقع', 1], ['brandColor', 'اللون الأساسيّ للهويّة', 'color', 'لون واحد يكفي — تُبنى منه الوثائق والموقع', 1],
    ['vision', 'الرؤية', 'textarea', '', 1], ['mission', 'الرسالة', 'textarea', '', 1], ['values', 'القيم', 'lines', 'قيمة في كلّ سطر'],
    ['goals', 'الأهداف الاستراتيجيّة', 'lines', 'هدف في كلّ سطر — تُربط بها البرامج والتقارير', 1], ['field', 'مجال النشاط', 'text', 'مثال: تنمويّ — بناء شخصيّة الشباب', 1], ['audience', 'الفئات المستهدفة', 'text', 'مثال: الأطفال، الشباب، الأسر'],
  ] },
  { id: 'registration', name: 'التسجيل', icon: 'badge-check', fields: [
    ['license', 'رقم الترخيص (المركز الوطني)', 'text', 'الرقم الحقيقيّ — يظهر في الختم وكلّ الوثائق', 1], ['licenseDate', 'تاريخ الترخيص', 'date', 'الترخيص ٥ سنوات ويتجدّد (م١١٣)', 1],
    ['supervisor', 'الجهة المشرفة فنّيّاً', 'text', 'الجهة الحكوميّة التي يدخل نشاطكم في اختصاصها', 1],
    ['region', 'المنطقة', 'select', OF_REGIONS, 1], ['city', 'المدينة / المحافظة', 'text', '', 1], ['address', 'العنوان الوطنيّ (المدينة، الحيّ، الشارع)', 'text', '', 1],
    ['branches', 'الفروع والمكاتب', 'lines', 'فرع في كلّ سطر: المدينة — العنوان (إن وُجدت)'],
    ['fiscalEnd', 'نهاية السنة الماليّة', 'select', { '12': 'ديسمبر (الافتراضيّ — م١١٥)', '06': 'يونيو', '03': 'مارس', '09': 'سبتمبر' }],
    ['membership', 'عضويّة الجمعيّة العموميّة', 'select', { open: 'مفتوحة للعموم', closed: 'مغلقة على فئة بشروط' }, 1], ['membershipFee', 'رسوم العضويّة السنويّة', 'money'],
    ['gaCount', 'عدد أعضاء الجمعيّة العموميّة الحاليّ', 'num', 'يُستخدم للتحقّق من نسبة المجلس (م٢٢)', 1], ['publicBenefit', 'حاصلة على صفة النفع العام (م٣٤)', 'bool'],
  ] },
  { id: 'board', name: 'المجلس', icon: 'landmark', fields: [
    ['boardSize', 'عدد أعضاء مجلس الإدارة', 'num', 'من ٥ إلى ١٣ (م٢٢)', 1], ['termNo', 'رقم الدورة الحاليّة', 'num', 'الدورة الأولى = 1'],
    ['termStart', 'بداية الدورة', 'date', '', 1], ['termYears', 'مدّة الدورة بالسنوات', 'num', 'من سنة إلى ٤ سنوات (م٢٣)', 1], ['termEnd', 'نهاية الدورة', 'date', 'تُحسب تلقائياً من البداية والمدّة إن تُركت فارغة', 1],
    ['boardMembers', 'أعضاء المجلس', 'obj', [['n', 'الاسم'], ['r', 'المنصب (رئيس، نائب، مشرف ماليّ، أمين سرّ، عضو)'], ['x', 'من خارج العموميّة؟ (نعم/لا)']], 1],
    ['committees', 'اللجان المنبثقة', 'obj', [['name', 'اسم اللجنة'], ['chair', 'الرئيس'], ['members', 'الأعضاء (بفواصل)']], 1],
    ['signatories', 'التوقيع على الحسابات البنكيّة', 'select', { chair_vice: 'مشترك: رئيس المجلس ونائبه (الأصل — م٣٢/٤)', two_members: 'مشترك: عضوان من المجلس يفوّضهما (م٣٢/٥)', leader: 'مشترك مع قياديّ تنفيذيّ — بموافقة المركز (م٣٢/٦)' }, 1],
    ['meetingsPerYear', 'اجتماعات المجلس المخطّطة سنوياً', 'num', '٤ على الأقلّ، اجتماع كلّ ٣ أشهر (م٢٨)', 1],
  ] },
  { id: 'management', name: 'الإدارة', icon: 'briefcase', fields: [
    ['execTitle', 'مسمّى المسؤول التنفيذيّ', 'text', 'مسمّى واحد يُستخدم في كلّ الوثائق', 1], ['execName', 'اسم المسؤول التنفيذيّ', 'text', '', 1],
    ['execEmail', 'بريده', 'email'], ['execPhone', 'جوّاله', 'tel'], ['execFullTime', 'متفرّغ (م٢٩/١٧)', 'bool'],
    ['financeTitle', 'مسمّى المدير الماليّ', 'text', '', 1], ['financeName', 'اسم المدير الماليّ', 'text', '', 1], ['financeFullTime', 'متفرّغ (م٢٩/١٧)', 'bool'],
    ['complianceOfficer', 'مسؤول الالتزام / مكافحة غسل الأموال', 'text', 'الاسم والمسمّى', 1],
    ['depts', 'الإدارات', 'lines', 'إدارة في كلّ سطر — يُبنى منها الهيكل التنظيميّ لاحقاً'],
    ['preparedBy', 'جهة إعداد الوثائق', 'text', 'مثال: وحدة التميّز المؤسّسيّ'], ['reviewedBy', 'جهة مراجعة الوثائق', 'text', 'مثال: لجنة المراجعة'],
  ] },
  { id: 'finance', name: 'المال والصلاحيّات', icon: 'scale', fields: [
    ['auditor', 'المراجع الخارجيّ المرخّص', 'text', 'إلزاميّ (م١١٥/٣)', 1],
    ['bankName', 'البنك الرئيس', 'text', '', 1], ['iban', 'الآيبان', 'text', '', 1], ['accName', 'اسم صاحب الحساب', 'text'],
    ['zakat', 'تستقبل الجمعيّة أموال زكاة', 'bool'], ['zakatIban', 'آيبان حساب الزكاة المستقلّ (م٣١)', 'text'],
    ['quotesLimit', 'الشراء المباشر بلا عروض حتى', 'money', 'فوقه: ثلاثة عروض أسعار'], ['tenderLimit', 'المنافسة العامّة فوق', 'money'],
    ['boardLimit', 'الصرف الذي يتطلّب موافقة المجلس فوق', 'money'], ['cashLimit', 'حدّ الصرف النقديّ', 'money'],
    ['advanceLimit', 'حدّ العهدة / السلفة', 'money'], ['pettyCash', 'سقف النثريّة', 'money'],
    ['retentionYears', 'مدّة حفظ السجلّات (سنوات)', 'num', '١٠ سنوات على الأقلّ (م١١٨)', 1],
  ] },
  { id: 'contact', name: 'التواصل', icon: 'phone', fields: [
    ['email', 'البريد الرسميّ', 'email', '', 1], ['phone', 'الهاتف / الجوّال', 'tel', '', 1], ['website', 'الموقع الإلكترونيّ', 'url', 'إن لم يكن لكم موقع فسيوفّره النظام لاحقاً'],
    ['complaints', 'قناة الشكاوى والمقترحات', 'text', 'رابط نموذج أو رقم مخصّص — يُحسب في مؤشّر الشفافية', 1],
    ['whistleEmail', 'بريد البلاغات عن المخالفات', 'email', 'تذكره سياسة الإبلاغ عن المخالفات', 1], ['privacyEmail', 'بريد الخصوصيّة', 'email', 'تذكره سياسة خصوصيّة البيانات'],
    ['social', 'حسابات التواصل الاجتماعيّ', 'lines', 'رابط في كلّ سطر'],
  ] },
  { id: 'approval', name: 'الاعتماد', icon: 'stamp', fields: [
    ['approvalBody', 'جهة اعتماد الوثائق', 'select', { board: 'مجلس الإدارة', assembly: 'الجمعيّة العموميّة' }],
    ['sessionNo', 'رقم آخر جلسة اعتماد', 'text', 'تُكتب في كتلة الاعتماد لكلّ وثيقة'], ['sessionDate', 'تاريخها', 'date'],
  ] },
];
const OF_DEF = { fiscalEnd: '12', membership: 'open', termYears: 4, termNo: 1, meetingsPerYear: 4, execTitle: 'المدير التنفيذي', financeTitle: 'المدير المالي', signatories: 'chair_vice', approvalBody: 'board', execFullTime: true, financeFullTime: true,
  quotesLimit: 10000, tenderLimit: 1000000, boardLimit: 50000, cashLimit: 5000, advanceLimit: 5000, pettyCash: 3000, retentionYears: 10 };
const OF_MANDATORY_COMMITTEES = [['لجنة المراجعة', /مراجع/], ['لجنة الترشيحات والمكافآت', /ترشيح|مكافآت/]];
const OF = { step: 'identity' };
const ofD = s => new Date(String(s).slice(0, 10) + 'T00:00:00Z'), ofIso = d => d.toISOString().slice(0, 10);   // تواريخ بلا منطقة زمنيّة (UTC) — لا انزياح يوم

/* ═════════ قراءة الملفّ وتطبيعه ═════════ */
function ofProfile() {
  const o = SAAS_ORG || { name: CONFIG.companyName, profile: {} }, p = Object.assign({}, OF_DEF, o.profile || {});
  p._name = o.name || '';
  if (!p.termEnd && p.termStart && +p.termYears) { const d = ofD(p.termStart); d.setUTCFullYear(d.getUTCFullYear() + +p.termYears); d.setUTCDate(d.getUTCDate() - 1); p._termEndAuto = ofIso(d); }
  if (!Array.isArray(p.committees) || !p.committees.length) p.committees = OF_MANDATORY_COMMITTEES.map(([name]) => ({ name, chair: '', members: '' }));
  return p;
}
const ofTermEnd = p => p.termEnd || p._termEndAuto || '';
const ofLicenseExpiry = p => { if (!p.licenseDate) return ''; const d = ofD(p.licenseDate); d.setUTCFullYear(d.getUTCFullYear() + 5); return ofIso(d); };
const ofBoard = p => (p.boardMembers || []).map(m => Array.isArray(m) ? { n: m[0] || '', r: m[1] || '', x: m[2] || '' } : m).filter(m => m.n);
const ofEmpty = v => v == null || v === '' || (Array.isArray(v) && !v.length);
function ofStepDone(p, s) { const req = s.fields.filter(f => f[4]); const ok = req.filter(f => f[0] === 'termEnd' ? !!ofTermEnd(p) : f[0] === 'boardMembers' ? ofBoard(p).length > 0 : !ofEmpty(p[f[0]])); return { ok: ok.length, all: req.length }; }
function ofCompleteness(p) { let ok = 0, all = 0; OF_STEPS.forEach(s => { const d = ofStepDone(p, s); ok += d.ok; all += d.all; }); return all ? Math.round(ok / all * 100) : 0; }

/* ═════════ التحقّق النظاميّ — اللائحة التنفيذيّة المعدّلة ٢٠٢٦ ═════════
   يُرجع [{lvl: ok|warn|bad|info, t: النصّ, ref: المادّة, step}] — تستخدمه شاشة الملفّ وشاشة الامتثال */
function ofChecks(p, meetings) {
  const out = [], add = (lvl, t, ref, step) => out.push({ lvl, t, ref, step });
  const n = +p.boardSize || 0, ga = +p.gaCount || 0, B = ofBoard(p), ext = B.filter(m => /^(نعم|y|yes|خارج)/i.test(String(m.x).trim())).length;
  if (!n) add('warn', 'حدّد عدد أعضاء مجلس الإدارة', 'م٢٢', 'board');
  else if (n < 5 || n > 13) add('bad', `عدد أعضاء المجلس ${n} — النظام يشترط من ٥ إلى ١٣`, 'م٢٢/١', 'board');
  else add('ok', `عدد أعضاء المجلس ${n} ضمن الحدّ النظاميّ`, 'م٢٢/١', 'board');
  if (n && ga) { if (n > ga * 0.5) add('bad', `المجلس (${n}) أكثر من ٥٠٪ من أعضاء الجمعيّة العموميّة (${ga}) — يلزم زيادة العموميّة إلى ${n * 2} على الأقلّ`, 'م٢٢/١', 'registration'); else add('ok', `المجلس لا يتجاوز ٥٠٪ من العموميّة (${n} من ${ga})`, 'م٢٢/١', 'registration'); }
  if (B.length && n && B.length !== n) add('warn', `عدد الأعضاء المسجّلين (${B.length}) لا يطابق عدد المجلس (${n})`, 'م٢٢', 'board');
  if (n && ext > Math.floor(n / 3)) add('bad', `أعضاء من خارج العموميّة (${ext}) يتجاوزون ثلث المجلس`, 'م٢٢/٢', 'board');
  if (B.length) { const roles = B.map(m => m.r).join(' '); if (!/رئيس/.test(roles) || !/نائب/.test(roles)) add('warn', 'حدّد رئيس المجلس ونائبه — يُعيَّنان في أوّل اجتماع', 'م٢٧', 'board'); }
  const ty = +p.termYears || 0; if (ty && (ty < 1 || ty > 4)) add('bad', `مدّة الدورة ${ty} سنوات — النظام: من سنة إلى ٤ سنوات`, 'م٢٣/١', 'board');
  const mp = +p.meetingsPerYear || 0; if (mp < 4) add('bad', 'اجتماعات المجلس أقلّ من ٤ سنوياً', 'م٢٨', 'board');
  if (Array.isArray(meetings)) {
    const since = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
    const held = meetings.filter(m => m.body === 'board' && ['held', 'minutes'].includes(m.status) && String(m.date) >= since).length;
    add(held >= 4 ? 'ok' : 'warn', `عُقد ${held} اجتماع مجلس خلال آخر ١٢ شهراً${held >= 4 ? '' : ' — المطلوب ٤ على الأقلّ (كلّ ٣ أشهر)'}`, 'م٢٨', null);
  }
  const C = (p.committees || []).filter(c => c.name);
  OF_MANDATORY_COMMITTEES.forEach(([name, re]) => { const c = C.find(x => re.test(x.name)); add(c && (c.chair || c.members) ? 'ok' : 'warn', c ? (c.chair || c.members ? `${name} مشكّلة` : `${name} بلا أعضاء`) : `${name} غير مشكّلة`, 'م٣٠/٢', 'board'); });
  if (p.signatories === 'leader') add('info', 'التوقيع مع قياديّ تنفيذيّ يحتاج موافقة المركز المسبقة', 'م٣٢/٦', 'board');
  if (!p.execName) add('warn', 'عيّن المسؤول التنفيذيّ وأبلغ المركز بقرار تعيينه', 'م٢٩/١٧', 'management');
  else if (!p.execFullTime) add('warn', 'المسؤول التنفيذيّ غير متفرّغ — يلزم التفرّغ ما لم يستثنِ المركز', 'م٢٩/١٧', 'management');
  if (!p.financeName) add('warn', 'عيّن مديراً ماليّاً متفرّغاً', 'م٢٩/١٧', 'management');
  else if (!p.financeFullTime) add('warn', 'المدير الماليّ غير متفرّغ — يلزم التفرّغ ما لم يستثنِ المركز', 'م٢٩/١٧', 'management');
  if (!p.auditor) add('bad', 'لا يوجد مراجع حسابات خارجيّ مرخّص', 'م١١٥/٣', 'finance'); else add('ok', 'مراجع الحسابات الخارجيّ محدّد', 'م١١٥/٣', 'finance');
  if (p.zakat && !p.zakatIban) add('bad', 'أموال الزكاة تحتاج حساباً بنكيّاً مستقلّاً وسجلّاً خاصّاً', 'م٣١', 'finance');
  if ((+p.retentionYears || 0) < 10) add('bad', `حفظ السجلّات ${+p.retentionYears || 0} سنوات — الحدّ الأدنى ١٠`, 'م١١٨', 'finance');
  if (p.publicBenefit && p.membership === 'closed') add('bad', 'صفة النفع العام تشترط عضويّة مفتوحة', 'م٣٤/٣', 'registration');
  const exp = ofLicenseExpiry(p), d2 = s => Math.round((ofD(s) - ofD(today())) / 864e5);
  if (exp) { const d = d2(exp); add(d < 0 ? 'bad' : d <= 180 ? 'warn' : 'ok', d < 0 ? `انتهى الترخيص في ${fmtD(exp)}` : `الترخيص ينتهي ${fmtD(exp)}${d <= 180 ? ` — بعد ${d} يوماً، قدّم طلب التجديد` : ''}`, 'م١١٣', 'registration'); }
  const te = ofTermEnd(p);
  if (te) { const d = d2(te); add(d < 0 ? 'bad' : d <= 180 ? 'warn' : 'ok', d < 0 ? `انتهت دورة المجلس في ${fmtD(te)} — المجلس يستمرّ حتى انتخاب جديد` : `دورة المجلس تنتهي ${fmtD(te)}${d <= 180 ? ` — بعد ${d} يوماً: ابدأ إجراءات الانتخاب (الدعوة قبل ١٨٠ يوماً)` : ''}`, 'م٢٤', 'board'); }
  return out;
}

/* ═════════ شاشة «ملفّ الجمعيّة» ═════════ */
async function renderOrgFile() {
  const main = document.getElementById('main'); main.innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  OF._meetings = await RDB.list('meetings', { order: 'date' }).catch(() => []);
  ofPaint();
}
function ofGo(step) { ofCollect(true); OF.step = step; ofPaint(); }
function ofPaint() {
  const p = OF._draft || ofProfile(), pct = ofCompleteness(p), ed = isAdmin();
  const s = OF_STEPS.find(x => x.id === OF.step) || OF_STEPS[0], idx = OF_STEPS.indexOf(s);
  const checks = ofChecks(p).filter(c => c.step === s.id && c.lvl !== 'ok');
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>ملفّ الجمعيّة</h1><p class="r-sub" style="margin:4px 0 0">تُدخل مرّة واحدة — وتُبنى منها الوثائق النظاميّة والتقارير والموقع.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" onclick="go('comply')"><i data-lucide="shield-check"></i> الامتثال والإفصاح</button></div></div>
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="gauge"></i> اكتمال الملفّ</h3><b>${pct}%</b></div><div class="of-bar"><span style="width:${pct}%"></span></div></div>
    <div class="of-wrap">
      <nav class="of-nav" aria-label="خطوات الملفّ">${OF_STEPS.map((x, i) => { const d = ofStepDone(p, x), full = d.ok === d.all; return `<button class="${x.id === s.id ? 'on' : ''}" onclick="ofGo('${x.id}')"><span class="of-n${full ? ' done' : ''}">${full ? '<i data-lucide="check"></i>' : i + 1}</span><span class="of-t">${x.name}<small>${d.all ? `${d.ok} من ${d.all}` : 'اختياريّ'}</small></span></button>`; }).join('')}</nav>
      <div class="card r-card of-form">
        <h3><i data-lucide="${s.icon}"></i> ${s.name}</h3>
        ${checks.map(c => `<div class="r-warn ${c.lvl === 'bad' ? 'bad' : c.lvl === 'warn' ? 'warn' : ''}"><i data-lucide="${c.lvl === 'info' ? 'info' : 'alert-triangle'}"></i><span>${esc(c.t)} <small>(${c.ref})</small></span></div>`).join('')}
        <fieldset ${ed ? '' : 'disabled'} style="border:0;padding:0;margin:0">${s.fields.map(f => ofField(f, p)).join('')}
        ${s.id === 'approval' ? `<button type="button" class="btn btn-ghost btn-sm" onclick="ofFromMeeting()"><i data-lucide="history"></i> من آخر اجتماع مجلس مسجّل</button>` : ''}</fieldset>
        ${ed ? `<div class="of-actions">${idx > 0 ? `<button class="btn btn-ghost" onclick="ofGo('${OF_STEPS[idx - 1].id}')">السابق</button>` : '<span></span>'}
          <div style="display:flex;gap:8px"><button class="btn btn-ghost" onclick="ofSave()"><i data-lucide="save"></i> حفظ</button>
          ${idx < OF_STEPS.length - 1 ? `<button class="btn btn-gold" onclick="ofSave('${OF_STEPS[idx + 1].id}')">حفظ والتالي</button>` : `<button class="btn btn-gold" onclick="ofSave(null,true)">حفظ وإنهاء</button>`}</div></div>`
          : '<p class="r-sub">ملفّ الجمعيّة يعدّله المدير التنفيذيّ.</p>'}
      </div>
    </div></div>`;
  refreshIcons();
}
function ofField(f, p) {
  const [k, label, type, opt, req] = f, id = 'of_' + k, v = p[k], star = req ? ' <span class="of-req">*</span>' : '';
  const hint = typeof opt === 'string' && opt ? `<div class="r-hint">${esc(opt)}</div>` : '';
  if (type === 'bool') return `<label class="r-check"><input type="checkbox" id="${id}"${v ? ' checked' : ''}> ${label}</label>`;
  if (type === 'textarea') return `<div class="field"><label>${label}${star}</label><textarea id="${id}" rows="3">${esc(v || '')}</textarea>${hint}</div>`;
  if (type === 'lines') return `<div class="field"><label>${label}${star}</label><textarea id="${id}" rows="4">${esc((Array.isArray(v) ? v : []).join('\n'))}</textarea>${hint}</div>`;
  if (type === 'select') return `<div class="field"><label>${label}${star}</label><select id="${id}">${Object.entries(opt).map(([a, b]) => `<option value="${esc(a)}"${String(a) === String(v == null ? '' : v) ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`;
  if (type === 'color') return `<div class="field"><label>${label}${star}</label><div style="display:flex;gap:10px;align-items:center"><input type="color" id="${id}" value="${esc(/^#[0-9a-f]{6}$/i.test(v || '') ? v : '#1003BD')}" style="width:56px;height:40px;padding:2px"><span class="r-sub">${esc(v || 'لم يُحدَّد')}</span></div>${hint}</div>`;
  if (type === 'img') return `<div class="field"><label>${label}${star}</label><div class="r-imgfield"><span class="r-thumb lg" id="${id}_pv">${v ? `<img src="${esc(v)}" alt="">` : '<i data-lucide="image"></i>'}</span><div style="flex:1"><input id="${id}" dir="ltr" value="${esc(v || '')}" placeholder="https://" oninput="document.getElementById('${id}_pv').innerHTML=this.value?'<img src=&quot;'+this.value.replace(/&quot;/g,'')+'&quot;>':''"><label class="btn btn-ghost btn-sm" style="margin-top:6px"><i data-lucide="upload"></i> رفع الشعار<input type="file" accept="image/png,image/webp,image/jpeg" hidden onchange="siteUpload(this,'${id}')"></label></div></div>${hint}</div>`;
  if (type === 'obj') {
    const rows = k === 'boardMembers' ? ofBoard(p) : (Array.isArray(v) ? v : []);
    const list = rows.length ? rows : [{}];
    return `<div class="field"><label>${label}${star}</label><div id="${id}" class="r-objlist">${list.map(r => objRow(opt, r)).join('')}</div><button type="button" class="link-btn" onclick="document.getElementById('${id}').insertAdjacentHTML('beforeend',objRow(ofFieldDef('${k}')[3],{}))">+ إضافة</button>${hint}</div>`;
  }
  if (k === 'termEnd' && !v && p._termEndAuto) return `<div class="field"><label>${label}${star}</label><input id="${id}" type="date" value=""><div class="r-hint">محسوبة: ${fmtD(p._termEndAuto)} — اتركها فارغة لاعتمادها</div></div>`;
  const it = { num: 'number', money: 'number', date: 'date', email: 'email', tel: 'tel', url: 'url' }[type] || 'text';
  const ltr = ['email', 'tel', 'url'].includes(type) || ['iban', 'zakatIban', 'license', 'nameEn'].includes(k);
  return `<div class="field"><label>${label}${star}</label><input id="${id}" type="${it}"${ltr ? ' dir="ltr"' : ''}${type === 'url' ? ' placeholder="https://"' : ''} value="${esc(v == null ? '' : v)}">${hint}</div>`;
}
const ofFieldDef = k => OF_STEPS.flatMap(s => s.fields).find(f => f[0] === k);
/* يقرأ حقول الخطوة الظاهرة إلى مسودّة (لا يحفظ) */
function ofCollect(keepDraft) {
  const s = OF_STEPS.find(x => x.id === OF.step); if (!s || !document.getElementById('of_' + s.fields[0][0])) return OF._draft || ofProfile();
  const p = Object.assign({}, OF._draft || ofProfile());
  s.fields.forEach(([k, , type]) => {
    const el = document.getElementById('of_' + k); if (!el) return;
    if (type === 'bool') p[k] = el.checked;
    else if (type === 'num' || type === 'money') p[k] = el.value === '' ? '' : Number(el.value);
    else if (type === 'lines') p[k] = el.value.split('\n').map(x => x.trim()).filter(Boolean);
    else if (type === 'obj') {
      const rows = Array.from(el.querySelectorAll('.r-objrow')).map(r => { const o = {}; r.querySelectorAll('input').forEach(i => o[i.dataset.k] = i.value.trim()); return o; }).filter(o => Object.values(o).some(Boolean));
      p[k] = k === 'boardMembers' ? rows.filter(r => r.n).map(r => [r.n, r.r || 'عضو مجلس الإدارة', r.x || '']) : rows;
    } else p[k] = el.value.trim();
  });
  if (keepDraft) OF._draft = p;
  return p;
}
async function ofSave(nextStep, finish) {
  if (!isAdmin()) { rToast('ملفّ الجمعيّة يعدّله المدير التنفيذيّ', true); return; }
  const p = ofCollect(true), name = String(p._name || '').trim();
  if (!name) { OF.step = 'identity'; ofPaint(); rToast('اكتب اسم الجمعيّة', true); return; }
  if (p.logo && !/^https:\/\//.test(p.logo)) { rToast('رابط الشعار يبدأ بـ https://', true); return; }
  const profile = Object.assign({}, p); delete profile._name; delete profile._termEndAuto;
  Object.keys(profile).forEach(k => { if (k.startsWith('_')) delete profile[k]; });
  try {
    await ofPersist(name, profile);
    OF._draft = null; rToast('حُفظ ملفّ الجمعيّة');
    if (finish) { go('comply'); return; }
    if (nextStep) OF.step = nextStep;
    ofPaint();
  } catch (e) { rToast('تعذّر الحفظ: ' + (e.message || e), true); }
}
async function ofPersist(name, profile) {
  if (RUSO_LIVE && !RUSO_DEMO) { const { error } = await sb.rpc('update_org_profile', { org_name: name, org_profile: profile }); if (error) throw error; await saasReloadOrg(); }
  else { SAAS_ORG = Object.assign({}, SAAS_ORG || {}, { name, profile }); saasApplyProfile(SAAS_ORG); try { localStorage.setItem(DEMO_KEY + '_org', JSON.stringify(SAAS_ORG)); } catch (e) {} }
  save(); applyBranding();
}
function ofFromMeeting() {
  const m = (OF._meetings || []).filter(x => x.body === 'board' && ['held', 'minutes'].includes(x.status)).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  if (!m) { rToast('لا يوجد اجتماع مجلس معقود في «الحوكمة» بعد', true); return; }
  const a = document.getElementById('of_sessionNo'), b = document.getElementById('of_sessionDate');
  if (a) a.value = m.number || ''; if (b) b.value = m.date || ''; rToast('أُخذت بيانات اجتماع ' + fmtD(m.date));
}
/* يطبّق حدود الصلاحيّات من الملفّ على CONFIG.finance — يناديه saasApplyProfile فتلتزم بها طلبات الشراء والصرف */
function ofApplyProfile(p) {
  if (!p) return; const F = CONFIG.finance = CONFIG.finance || {};
  [['quotesLimit', 'quotesLimit'], ['boardLimit', 'boardLimit'], ['cashLimit', 'cashLimit'], ['advanceLimit', 'advanceLimit']].forEach(([a, b]) => { if (+p[a] > 0) F[b] = +p[a]; });
  if (p.execTitle) TERMS.head = p.execTitle;
}

/* ═════════ جاهزيّة الإفصاح /١٠٠ — أوزان معيار الشفافية والإفصاح (المركز الوطني، الإصدار ٤) ═════════
   auto = يُحسب من بيانات النظام · manual = تؤكّده الجمعيّة (يُحفظ في profile.disclosure) */
const CX_NORM = s => String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
const CX_POLICIES = [['جمع التبرعات', /جمع التبرعات/], ['تنظيم العلاقة مع المستفيدين', /المستفيد/], ['إدارة المتطوعين', /المتطوع|التطوع/], ['تعارض المصالح', /تعارض المصالح/], ['الإبلاغ عن المخالفات', /الابلاغ عن المخالفات|المبلغين/], ['خصوصية البيانات', /خصوصيه البيانات|خصوصية البيانات/], ['الاحتفاظ بالوثائق وإتلافها', /الاحتفاظ بالوثائق/]];
function cxItems(p, D) {
  const docs = (D.documents || []).filter(d => d.published !== false), has = re => docs.find(d => re.test(CX_NORM(d.title)));
  const man = k => !!((p.disclosure || {})[k] || {}).done, y = new Date().getFullYear(), B = ofBoard(p);
  const fin = docs.filter(d => d.category === 'financials').map(d => +String(d.year || '').replace(/\D/g, '').slice(0, 4) || 0).sort((a, b) => b - a)[0] || 0;
  const assembly = (D.meetings || []).filter(m => m.body === 'assembly' && m.minutes_url).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const I = [];
  const it = (ind, key, t, max, got, how, act) => I.push({ ind, key, t, max, got: Math.max(0, Math.min(max, Math.round(got * 10) / 10)), how, act });
  it(1, 'site', 'موقع رسميّ ببيانات التواصل وحسابات التواصل', 5, (p.website ? 2 : 0) + (p.phone && p.email ? 2 : 0) + ((p.social || []).length ? 1 : 0), 'الموقع + الهاتف والبريد + حسابات التواصل', "ofOpen('contact')");
  it(1, 'bylaws', 'اللائحة الأساسيّة المعتمدة منشورة', 6, has(/اللائحه الاساسيه|اللائحة الاساسية/) ? 6 : 0, 'وثيقة بعنوان «اللائحة الأساسيّة» في الحوكمة والوثائق', "siteGo('documents')");
  CX_POLICIES.forEach(([t, re], i) => it(1, 'pol' + i, 'سياسة ' + t, 2, has(re) ? 2 : 0, 'وثيقة منشورة بهذا العنوان — ستولّدها مكتبة الوثائق (المرحلة ٢)', "siteGo('documents')"));
  it(2, 'ga', 'أعضاء الجمعيّة العموميّة ونوع عضويّتهم', 2, man('ga') ? 2 : 0, 'أكّد بعد نشر القائمة (بلا أرقام هويّات)', "cxToggle('ga')", 1);
  it(2, 'gaMin', 'محاضر الجمعيّة العموميّة وفرز الأصوات', 2, assembly ? 2 : 0, assembly ? 'آخر محضر: ' + fmtD(assembly.date) : 'اجتماع «الجمعيّة العموميّة» برابط المحضر في الحوكمة', "go('governance')");
  it(2, 'board', 'أعضاء المجلس ومدّة الدورة واللجان', 7, (B.length >= 5 ? 3 : B.length ? 1.5 : 0) + (p.termStart && ofTermEnd(p) ? 2 : 0) + ((p.committees || []).some(c => c.name && (c.chair || c.members)) ? 2 : 0), 'من خطوة «المجلس» في ملفّ الجمعيّة', "ofOpen('board')");
  it(2, 'leaders', 'القياديّون وبيانات تواصلهم', 5, (p.execName ? 3 : 0) + (p.execEmail || p.execPhone ? 2 : 0), 'المسؤول التنفيذيّ وبريده أو جوّاله', "ofOpen('management')");
  it(2, 'vacancy', 'إعلان الوظائف القياديّة الشاغرة', 1, man('vacancy') ? 1 : 0, 'أكّد: لا شاغر قياديّ، أو أُعلن عنه', "cxToggle('vacancy')", 1);
  it(3, 'complaints', 'نافذة الاستفسارات والمقترحات والشكاوى', 5, p.complaints ? 5 : 0, 'قناة الشكاوى في خطوة «التواصل»', "ofOpen('contact')");
  it(3, 'surveys', 'استبانات الرضا ونشر نتائجها (سنويّاً)', 7, man('surveys') ? 7 : 0, 'استبيانات جاهزة بقوالبها وتحليلها في «الموسم ← الاستبيانات» — أكّد بعد نشر النتائج', "cxToggle('surveys')", 1);
  it(4, 'vision', 'الرؤية والرسالة والأهداف', 7, (p.vision ? 3 : 0) + (p.mission ? 2 : 0) + ((p.goals || []).length ? 2 : 0), 'من خطوة «الهويّة»', "ofOpen('identity')");
  it(4, 'progRep', 'تقارير البرامج والأنشطة', 6, docs.some(d => d.category === 'reports') ? 6 : 0, 'وثيقة في تصنيف «التقارير» (تولّدها مرحلة التقارير لاحقاً)', "siteGo('documents')");
  it(4, 'stats', 'إحصاءات المستفيدين والمساعدات', 7, (D.benCount > 0 ? 5 : 0) + ((D.programs || []).some(x => x.published !== false) ? 2 : 0), D.benCount ? `${D.benCount} مستفيداً مسجّلاً — سيُنشر العدد آليّاً في الموقع` : 'سجّل المستفيدين في تطبيق «المستفيدون»', "go('beneficiaries')");
  it(4, 'notify', 'إبلاغ المستهدفين عند نشر سياسة أو تحديثها', 2, man('notify') ? 2 : 0, 'أكّد بعد إرسال رسالة/إشعار للمستفيدين بالتحديث', "cxToggle('notify')", 1);
  it(5, 'fin', 'القوائم الماليّة المدقّقة لآخر سنة', 13, fin >= y - 1 ? 13 : fin ? 5 : 0, fin ? `آخر قوائم منشورة: ${fin}` + (fin < y - 1 ? ` — المطلوب ${y - 1}` : '') : 'ارفع القوائم المدقّقة في تصنيف «القوائم الماليّة»', "siteGo('documents')");
  it(6, 'ncnp', `نموذج الإفصاح على منصّة المركز (${y})`, 11, man('ncnp') && ((p.disclosure || {}).ncnp || {}).year == y ? 11 : 0, 'أكّد بعد تعبئته واعتماده من رئيس المجلس', "cxToggle('ncnp')", 1);
  return I;
}
const CX_IND = { 1: 'نشر اللوائح والسياسات', 2: 'بيانات القائمين على الجمعيّة', 3: 'التغذية الراجعة', 4: 'الأهداف والبرامج', 5: 'القوائم الماليّة', 6: 'نموذج الإفصاح' };
const CX = { tab: 'score' };

/* ═════════ شاشة «الامتثال والإفصاح» ═════════ */
async function renderComply() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  const L = (t, o) => RDB.list(t, o).catch(() => []);
  const [documents, meetings, compliance, programs, ben] = await Promise.all([L('documents', { order: 'sort', asc: true }), L('meetings', { order: 'date' }), L('compliance', { order: 'due', asc: true }), L('programs', { order: 'sort', asc: true }), L('beneficiaries')]);
  CX.D = { documents, meetings, compliance, programs, benCount: ben.length };
  cxPaint();
}
function cxGo(t) { CX.tab = t; cxPaint(); }
function ofOpen(step) { OF.step = step; OF._draft = null; go('orgfile'); }
function cxPaint() {
  const p = ofProfile(), D = CX.D || {}, I = cxItems(p, D), score = Math.round(I.reduce((s, x) => s + x.got, 0)), checks = ofChecks(p, D.meetings);
  const bad = checks.filter(c => c.lvl === 'bad').length, warn = checks.filter(c => c.lvl === 'warn').length;
  const open = (D.compliance || []).filter(c => c.status === 'open'), late = open.filter(c => c.due < today());
  const col = score >= 85 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const tabs = [{ id: 'score', name: 'جاهزيّة الإفصاح', icon: 'gauge' }, { id: 'checks', name: 'الفحص النظاميّ', icon: 'scale', n: bad + warn || '' }, { id: 'dates', name: 'المواعيد النظاميّة', icon: 'calendar-check-2', n: late.length || '' }];
  let body = '';
  if (CX.tab === 'score') {
    const missing = I.filter(x => x.got < x.max).sort((a, b) => (b.max - b.got) - (a.max - a.got));
    body = `<div class="cx-top card r-card"><div class="cx-ring" style="--p:${score};--c:${col}"><b>${score}</b><span>من ١٠٠</span></div>
      <div style="flex:1;min-width:220px"><h3 style="margin:0 0 6px">جاهزيّة الإفصاح والشفافية</h3>
      <p class="r-sub" style="margin:0 0 10px;line-height:1.8">محسوبة على أوزان معيار «الشفافية والإفصاح» في مؤشّر حوكمة المركز الوطني (٢٠٪ من التقييم الكلّيّ). المقيِّم يتحقّق من الموقع أوّلاً — وكلّ ما يكتمل هنا سيُنشر في موقع الجمعيّة آليّاً.</p>
      ${missing.length ? `<b style="font-size:13.5px">أكبر ما ينقص:</b><div style="margin-top:6px">${missing.slice(0, 3).map(x => `<button class="r-chip cx-gap" onclick="${x.act}">+${Math.round((x.max - x.got) * 10) / 10} · ${esc(x.t)}</button>`).join('')}</div>` : '<b style="color:#22c55e">مكتملة — أحسنتم.</b>'}</div></div>
      ${Object.entries(CX_IND).map(([n, name]) => { const L = I.filter(x => x.ind == n), g = L.reduce((s, x) => s + x.got, 0), m = L.reduce((s, x) => s + x.max, 0);
        return `<div class="card r-card"><div class="r-card-h"><h3>${name}</h3><b>${Math.round(g * 10) / 10} / ${m}</b></div>${L.map(x => `<div class="cx-row"><span class="cx-st ${x.got >= x.max ? 'ok' : x.got > 0 ? 'mid' : ''}"><i data-lucide="${x.got >= x.max ? 'check' : x.got > 0 ? 'minus' : 'x'}"></i></span><div class="cx-t"><b>${esc(x.t)}</b><small>${esc(x.how)}</small></div><span class="cx-pts">${x.got}/${x.max}</span>${x.manual && isAdmin() ? `<button class="btn btn-ghost btn-sm" onclick="${x.act}">${x.got >= x.max ? 'إلغاء التأكيد' : 'تأكيد'}</button>` : x.got < x.max ? `<button class="btn btn-ghost btn-sm" onclick="${x.act}">إكمال</button>` : ''}</div>`).join('')}</div>`; }).join('')}
      <p class="r-sub" style="line-height:1.8">⚠️ الأوزان من إصدار ٢٠٢٣ من دليل المعيار؛ منذ مايو ٢٠٢٦ يُقيَّم المركز حسب حجم الجمعيّة — راجع أوزان دورتكم على منصّة «مكين».</p>`;
  } else if (CX.tab === 'checks') {
    const ic = { ok: 'check-circle-2', warn: 'alert-triangle', bad: 'x-circle', info: 'info' };
    const order = { bad: 0, warn: 1, info: 2, ok: 3 };
    body = `<div class="r-kpis">${kpi('x-circle', bad, 'مخالفة نظاميّة')}${kpi('alert-triangle', warn, 'تنبيه')}${kpi('check-circle-2', checks.filter(c => c.lvl === 'ok').length, 'مستوفى')}</div>
      <div class="card r-card"><h3><i data-lucide="scale"></i> الفحص على اللائحة التنفيذيّة المعدّلة (٢٠٢٦)</h3>
      ${checks.slice().sort((a, b) => order[a.lvl] - order[b.lvl]).map(c => `<div class="cx-row"><span class="cx-st ${c.lvl === 'ok' ? 'ok' : c.lvl === 'bad' ? 'bad' : 'mid'}"><i data-lucide="${ic[c.lvl]}"></i></span><div class="cx-t"><b>${esc(c.t)}</b><small>${c.ref}</small></div>${c.step && isAdmin() && c.lvl !== 'ok' ? `<button class="btn btn-ghost btn-sm" onclick="ofOpen('${c.step}')">تعديل</button>` : ''}</div>`).join('')}
      <div class="r-warn" style="margin-top:12px"><i data-lucide="info"></i><span>عند أيّ تغيير في أعضاء المجلس أو المسؤول التنفيذيّ: تُؤخذ موافقة المركز خلال ١٥ يوماً (م٢٩/١٩)، ويُحدَّث سجلّ المركز كلّ ٦ أشهر (م١١٤).</span></div></div>`;
  } else {
    const gen = cxCalendar(p), have = new Set(open.map(c => c.title));
    const miss = gen.filter(g => !have.has(g.title));
    body = `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="calendar-check-2"></i> المواعيد النظاميّة من ملفّ الجمعيّة</h3>
      ${can('governance') ? `<button class="btn btn-gold btn-sm" onclick="cxSyncCalendar()"${miss.length ? '' : ' disabled'}><i data-lucide="refresh-cw"></i> ${miss.length ? `أضف ${miss.length} إلى تقويم الالتزامات` : 'التقويم مُحدَّث'}</button>` : ''}</div>
      <p class="r-sub" style="margin:0 0 10px">تُحسب من السنة الماليّة ودورة المجلس وتاريخ الترخيص. ما يُضاف يظهر في «الحوكمة ← تقويم الالتزامات» وفي التقويم.</p>
      ${gen.map(g => `<div class="cx-row"><span class="cx-st ${have.has(g.title) ? 'ok' : ''}"><i data-lucide="${have.has(g.title) ? 'check' : 'plus'}"></i></span><div class="cx-t"><b>${esc(g.title)}</b><small>${esc(g.ref)}</small></div><span class="cx-pts" style="color:${g.due < today() ? 'var(--bad)' : ''}">${fmtD(g.due)}</span></div>`).join('') || rEmpty('calendar', 'أكمل ملفّ الجمعيّة (السنة الماليّة، دورة المجلس، الترخيص) لتظهر المواعيد.')}</div>
      <div class="card r-card"><div class="r-card-h"><h3>الالتزامات المفتوحة</h3><button class="link-btn" onclick="go('governance')">الحوكمة</button></div>
      ${open.slice(0, 12).map(c => `<div class="r-row"><span>${esc(c.title)}</span><span class="r-sub" style="color:${c.due < today() ? 'var(--bad)' : ''}">${fmtD(c.due)}</span></div>`).join('') || '<p class="r-sub">لا التزامات مفتوحة.</p>'}</div>`;
  }
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>الامتثال والإفصاح</h1></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" onclick="go('orgfile')"><i data-lucide="building-2"></i> ملفّ الجمعيّة · ${ofCompleteness(p)}%</button></div></div>
    ${rTabs('cx', tabs, CX.tab, 'cxGo')}${body}</div>`;
  refreshIcons();
}
async function cxToggle(k) {
  if (!isAdmin()) { rToast('يؤكّده المدير التنفيذيّ', true); return; }
  const o = SAAS_ORG || { name: CONFIG.companyName, profile: {} }, profile = Object.assign({}, o.profile || {}), dsc = Object.assign({}, profile.disclosure || {});
  const y = new Date().getFullYear(), on = !(dsc[k] && dsc[k].done && (k !== 'ncnp' || dsc[k].year == y));
  if (on) dsc[k] = { done: true, at: today(), year: y }; else delete dsc[k];
  profile.disclosure = dsc;
  try { await ofPersist(o.name || CONFIG.companyName, profile); cxPaint(); } catch (e) { rToast('تعذّر الحفظ: ' + (e.message || e), true); }
}

/* ═════════ المواعيد النظاميّة — من ملفّ الجمعيّة (اللائحة ٢٠٢٦) ═════════ */
function cxCalendar(p) {
  const out = [], t = today(), iso = ofIso, rel0 = (s, days) => { const d = ofD(s); d.setUTCDate(d.getUTCDate() + days); return iso(d); };
  const add = (title, ref, due, recur) => out.push({ title, ref, due, recur });
  const fe = +(p.fiscalEnd || 12), nextOn = (m, d) => { const y0 = +t.slice(0, 4); let x = new Date(Date.UTC(y0, m - 1, d)); if (iso(x) < t) x = new Date(Date.UTC(y0 + 1, m - 1, d)); return iso(x); };
  const afterFy = months => { const m = ((fe + months - 1) % 12) + 1, last = new Date(Date.UTC(2001, m, 0)).getUTCDate(); return nextOn(m, last); };
  add('اجتماع الجمعيّة العموميّة العاديّ وإقرار القوائم المدقّقة', 'اللائحة م٢٩/١٥ — خلال ٤ أشهر من نهاية السنة الماليّة', afterFy(4), 'yearly');
  add('نشر القوائم الماليّة المدقّقة في الموقع قبل العموميّة بأسبوع', 'النظام م٢١/٧ — ومؤشّر الشفافية (١٣ درجة)', rel0(afterFy(4), -7), 'yearly');
  add('رفع الحساب الختاميّ والقوائم المدقّقة للمركز', 'اللائحة م٢٩/١٥ وم١١٥/٣ — خلال ٤ أشهر من نهاية السنة', afterFy(4), 'yearly');
  add('رفع محضر الجمعيّة العموميّة للمركز (ومحضر فرز الأصوات إن وُجدت انتخابات)', 'اللائحة م٢١ — خلال ١٥ يوماً من الاجتماع', rel0(afterFy(4), 15), 'yearly');
  add('نشر الحساب الختاميّ والتقرير السنويّ (الإداريّ والماليّ) في الموقع', 'اللائحة م٢٩/٢٠', afterFy(5), 'yearly');
  add('تحديث بيانات الجمعيّة في سجلّ المركز — النصف الأوّل', 'اللائحة م١١٤/٢ — تحديث نصف سنويّ', nextOn(6, 30), 'yearly');
  add('تحديث بيانات الجمعيّة في سجلّ المركز — النصف الثاني', 'اللائحة م١١٤/٢ — تحديث نصف سنويّ', nextOn(12, 31), 'yearly');
  add('عرض الموازنة التقديريّة للسنة الجديدة على الجمعيّة العموميّة', 'اللائحة م٢٩/١٦', afterFy(0), 'yearly');
  add('التقييم الذاتيّ للحوكمة ونموذج الإفصاح على منصّة المركز', 'مؤشّر الحوكمة — نافذة التقييم السنويّة (٢٠٢٦: ٦ مايو–١٧ سبتمبر)', nextOn(9, 15), 'yearly');
  { const y0 = +t.slice(0, 4), q = [3, 6, 9, 12].map(m => iso(new Date(Date.UTC(y0, m, 0)))).find(d => d >= t) || iso(new Date(Date.UTC(y0 + 1, 3, 0)));
    add('اجتماع مجلس الإدارة الدوريّ (ربع سنويّ)', 'اللائحة م٢٨ — ٤ اجتماعات سنوياً على الأقلّ، كلّ ٣ أشهر', q, 'quarterly'); }
  const te = ofTermEnd(p);
  if (te && te >= t) {
    const rel = days => rel0(te, days);
    [['دعوة أعضاء العموميّة للترشّح لمجلس الإدارة الجديد', 'اللائحة م٢٤/١ — قبل نهاية الدورة بـ١٨٠ يوماً على الأقلّ', -180],
     ['قفل باب الترشّح لمجلس الإدارة', 'اللائحة م٢٤/٢ — قبل نهاية الدورة بـ٩٠ يوماً', -90],
     ['رفع أسماء المرشّحين للمركز', 'اللائحة م٢٤/٣ — خلال أسبوع من قفل الترشّح', -83],
     ['عرض قائمة المرشّحين المعتمدة في المقرّ والموقع', 'اللائحة م٢٤/٤ — قبل نهاية الدورة بـ١٥ يوماً حدّاً أقصى', -15],
     ['انتخاب مجلس الإدارة في اجتماع الجمعيّة العموميّة', 'اللائحة م٢٤/٥ — لجنة انتخابات من ٣ أعضاء على الأقلّ (م٢٣/٢)', 0],
     ['تزويد المركز بأسماء الأعضاء المنتخَبين ونشرهم في الموقع', 'اللائحة م٢٤/٥ — خلال ١٥ يوماً من الانتخاب', 15],
     ['تسليم واستلام الأعمال والمستندات بين المجلسين بمحضر موقّع', 'اللائحة م٣٢/٢ب', 20]].forEach(([a, b, d]) => { const due = rel(d); if (due >= t || d >= 0) add(a, b, due, 'once'); });
  }
  const le = ofLicenseExpiry(p);
  if (le && le >= t) add('تقديم طلب تجديد ترخيص الجمعيّة', 'اللائحة م١١٣ — الترخيص ٥ سنوات', (() => { const d = rel0(le, -90); return d < t ? t : d; })(), 'once');
  return out.sort((a, b) => a.due.localeCompare(b.due));
}
async function cxSyncCalendar(silent) {
  if (!can('governance')) return;
  const p = ofProfile(), open = (await RDB.list('compliance', { order: 'due', asc: true }).catch(() => [])).filter(c => c.status === 'open'), have = new Set(open.map(c => c.title));
  const miss = cxCalendar(p).filter(g => !have.has(g.title));
  try {
    for (const g of miss) await RDB.insert('compliance', { title: g.title, ref: g.ref, due: g.due, recur: g.recur, status: 'open', created_by: ME.id });
    if (!silent) rToast(miss.length ? `أُضيف ${miss.length} موعداً إلى تقويم الالتزامات` : 'التقويم مُحدَّث');
    if (CUR === 'comply') { CX.D.compliance = await RDB.list('compliance', { order: 'due', asc: true }).catch(() => []); cxPaint(); }
  } catch (e) { rToast('تعذّر التحديث: ' + (e.message || e), true); }
}

/* يستبدل erpSeedCompliance في 26-org-erp — أوّل فتح للحوكمة: مواعيد اللائحة الماليّة التشغيليّة + المواعيد النظاميّة من الملفّ
   (اجتماع العموميّة صار من cxCalendar بصياغة اللائحة ٢٠٢٦ فلا يتكرّر) */
async function erpSeedCompliance() {
  if ((ERP.rows.compliance || []).length || !can('governance')) return;
  const y = new Date().getFullYear(), Y = m => y + '-' + m;
  const items = [
    ['رفع ميزان المراجعة للسنة المنتهية', 'اللائحة المالية — خلال شهر من نهاية السنة', Y('01-31'), 'yearly'],
    ['إقرارات تعارض المصالح السنوية (المجلس والموظفون)', 'سياسة تعارض المصالح', Y('01-31'), 'yearly'],
    ['رفع الحساب الختامي للمراجع الخارجي', 'اللائحة المالية — خلال شهرين', Y('02-28'), 'yearly'],
    ['اعتماد القوائم المالية من مجلس الإدارة', 'اللائحة المالية — قبل عرضها على الجمعيّة العموميّة', Y('03-31'), 'yearly'],
    ['تقرير ربع سنوي للرئيس والجهة المشرفة', 'اللائحة المالية', Y('03-31'), 'quarterly'],
    ['مراجعة سقف العهد المستديمة', 'اللائحة المالية — كل 3 أشهر', Y('03-31'), 'quarterly'],
    ['إعداد مشروع الموازنة للسنة القادمة', 'اللائحة المالية — قبل نهاية السنة بثلاثة أشهر', Y('09-30'), 'yearly'],
    ['خطة الشراء السنوية', 'سياسة الشراء', Y('11-30'), 'yearly'],
    ['تعليمات إقفال السنة المالية', 'اللائحة المالية — قبل 30 يوماً من نهاية السنة', Y('12-01'), 'yearly'],
    ['جرد الأصول الثابتة والصندوق وتسوية العهد', 'اللائحة المالية', Y('12-31'), 'yearly'],
  ];
  const next = (due, recur) => { let d = due; const t = today(); while (d < t) d = cxAdvance(d, recur); return d; };
  for (const [title, ref, due, recur] of items) await RDB.insert('compliance', { title, ref, due: next(due, recur), recur, status: 'open', created_by: ME.id });
  await cxSyncCalendar(true);
  await erpLoad('compliance');
}

/* الموعد التالي لالتزام دوريّ — يحافظ على «آخر يوم في الشهر» (٣١ مارس ← ٣٠ يونيو ← ٣٠ سبتمبر ← ٣١ ديسمبر) بدل الانزلاق لأوّل الشهر */
function cxAdvance(due, recur) {
  const d = ofD(due), y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate(), eom = day === new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const add = recur === 'quarterly' ? 3 : recur === 'monthly' ? 1 : recur === 'semiannual' ? 6 : 12;
  const last = new Date(Date.UTC(y, m + add + 1, 0)).getUTCDate();
  return ofIso(new Date(Date.UTC(y, m + add, eom ? last : Math.min(day, last))));
}
/* يستبدل cmpNext في 26-org-erp — الإنجاز يولّد الموعد القادم بالحساب الصحيح أعلاه */
async function cmpNext(r) {
  if (!r.recur || r.recur === 'once') return;
  await RDB.insert('compliance', { title: r.title, ref: r.ref, due: cxAdvance(r.due, r.recur), recur: r.recur, owner: r.owner || null, status: 'open', created_by: ME.id });
}

/* يستبدل saasProfileModal في 29-saas — «بيانات الجمعيّة» صارت شاشة «ملفّ الجمعيّة» */
function saasProfileModal() { OF._draft = null; go('orgfile'); }
