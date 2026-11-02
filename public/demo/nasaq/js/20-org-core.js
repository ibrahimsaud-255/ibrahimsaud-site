/*
 * 20-org-core.js — نواة «حزمة المنظمات»: الفريق والصلاحيات وطبقة البيانات
 * (بُنيت أولاً لجمعية رسو لبناء الشخصية — كل ما يخص العميل في config.js → org)
 * ─────────────────────────────────────────────────────────────────────────
 * يُحمَّل بعد ملفات نظام بزنس (01..19) ويعيد تعريف بعض دوالها عمداً
 * (enterApp, navItems, looseLaunch, bootstrap, applyTheme) — آخر تعريف هو المعتمد.
 * ⚠️ تعريفات فقط — لا جمل تنفيذية عند التحميل (انظر 99-boot.js).
 */

/* ═════════ الإعدادات التنظيمية — تُقرأ من config.js (CONFIG.org) ═════════
   كل عميل يعرّف أقسامه وصلاحياتها وتصنيفاته المالية في config.js فقط؛ القيم هنا افتراضية عامة. */
const ORG_CFG = CONFIG.org || {};
const DEPTS = ORG_CFG.depts || {
  exec:      { name: 'الإدارة العليا', short: 'الإدارة', color: '#CAB05F', units: [] },
  ops:       { name: 'العمليات والمشاريع', short: 'العمليات', color: '#41747F', units: [] },
  marketing: { name: 'التسويق والاتصال', short: 'التسويق', color: '#6C8EBF', units: [] },
  finance:   { name: 'الشؤون المالية والإدارية', short: 'المالية', color: '#8A6D3B', units: [] },
};
const ROLES = ORG_CFG.roles || { admin: 'المدير العام', manager: 'مدير إدارة', staff: 'موظف' };
const DEPT_APPS = ORG_CFG.deptApps || {
  exec: ['site', 'inbox', 'tasks', 'library', 'finance', 'donors', 'team', 'programs', 'reports', 'newsletter'],
  ops: ['programs', 'inbox', 'tasks', 'library'],
  marketing: ['site', 'inbox', 'programs', 'tasks', 'library', 'newsletter'],
  finance: ['finance', 'donors', 'reports', 'tasks', 'library'],
};
const ALL_APPS = ['site', 'inbox', 'tasks', 'library', 'finance', 'donors', 'team', 'newsletter', 'programs', 'reports', 'beneficiaries', 'volunteers', 'hr', 'procurement', 'governance', 'grants', 'mail'];
const APP_LABELS = Object.assign({ site: 'إدارة الموقع', programs: 'البرامج / الخدمات (في الموقع)', inbox: 'الوارد من الموقع', tasks: 'المهام', library: 'مكتبة المخرجات', finance: 'المالية والسندات', donors: 'الداعمون / العملاء الرئيسيون', reports: 'التقارير', team: 'الفريق والصلاحيات', newsletter: 'مشتركو النشرة', beneficiaries: 'المستفيدون والتسجيل والحضور', volunteers: 'التطوع والساعات', hr: 'الموارد البشرية', procurement: 'المشتريات والموردون', governance: 'الحوكمة والاجتماعات', grants: 'المنح والشراكات', mail: 'الصادر والوارد' }, ORG_CFG.appLabels || {});
const JOB_TITLES = ORG_CFG.jobTitles || ['المدير العام', 'مدير إدارة', 'محاسب', 'أخصائي تسويق', 'منسق مشاريع', 'مساعد إداري'];
const TERMS = Object.assign({ org: 'المنشأة', head: 'المدير العام', finHead: 'مدير المالية', board: 'مجلس الإدارة' }, ORG_CFG.terms || {});

/* تطبيقات النظام كما تظهر في القائمة والمكتب */
const RUSO_APPS = [
  { id: 'home',     name: 'الرئيسية',        icon: 'home',          c: '#2BA3B0,#0E5560' },
  { id: 'tasks',    name: 'المهام',           icon: 'list-checks',   c: '#23B5A8,#0B6B64', app: 'tasks' },
  { id: 'library',  name: 'مكتبة المخرجات',   short: 'المكتبة',   icon: 'folder-open',   c: '#FFCF4A,#E0960F', app: 'library' },
  { id: 'inbox',    name: 'الوارد',           icon: 'inbox',         c: '#4D9BFF,#1B56D9', app: 'inbox' },
  { id: 'site',     name: 'إدارة الموقع',     short: 'الموقع',     icon: 'globe',         c: '#3EDB86,#0C9650', app: ['site', 'programs'] },
  { id: 'finance',  name: 'المالية',          icon: 'wallet',        c: '#FFA552,#E5601A', app: ['finance', 'donors', 'reports'] },
  { id: 'ledger',   name: 'المحاسبة',          icon: 'book-open-check', c: '#2FD3C4,#0A7781', app: ['finance', 'reports'] },
  { id: 'requests', name: 'طلبات الصرف',      short: 'طلباتي',      icon: 'hand-coins',    c: '#FF7A9C,#D92F62' },
  { id: 'beneficiaries', name: 'المستفيدون',     icon: 'users-round',   c: '#FFB547,#E5791A', app: 'beneficiaries' },
  { id: 'volunteers', name: 'التطوع',            icon: 'hand-heart',    c: '#FF7A9C,#C9306A', app: 'volunteers' },
  { id: 'procurement', name: 'المشتريات',        icon: 'shopping-cart', c: '#3DD6A0,#0B8F66', app: 'procurement' },
  { id: 'hr',       name: 'الموارد البشرية',     icon: 'contact-round', c: '#5AA9FF,#2457C9', app: 'hr' },
  { id: 'myhr',     name: 'طلباتي الإدارية',     icon: 'file-user',     c: '#7BC6FF,#2F7FD0' },
  { id: 'governance', name: 'الحوكمة',           icon: 'landmark',      c: '#B08CFF,#6A3FD6', app: 'governance' },
  { id: 'grants',   name: 'المنح والشراكات',     icon: 'gem',           c: '#F2CF63,#B5871A', app: 'grants' },
  { id: 'mail',     name: 'الصادر والوارد',      icon: 'mails',         c: '#8EA4C8,#45597F', app: 'mail' },
  { id: 'calendar', name: 'التقويم',          icon: 'calendar-days', c: '#FF6A5C,#DA2525' },
  { id: 'boards',   name: 'الخرائط الذهنية',  icon: 'git-fork',      c: '#9B7BFF,#5532E0' },
  { id: 'team',     name: 'الفريق والصلاحيات', icon: 'users',        c: '#7E95BC,#3E4F72', app: 'team' },
];

/* ═════════ التصنيفات المالية (قابلة للاستبدال من CONFIG.org.finance) ═════════ */
const FIN_REVENUE = (ORG_CFG.finance || {}).revenue || [
  { key: 'sales', name: 'إيرادات المبيعات والخدمات' }, { key: 'don_grantors', name: 'منح وتبرعات' },
  { key: 'gov_grants', name: 'إعانات حكومية' }, { key: 'other_rev', name: 'إيرادات أخرى' },
];
const FIN_EXP_GROUPS = (ORG_CFG.finance || {}).groups || { activities: 'تكلفة النشاط', admin: 'المصروفات الإدارية والعمومية', capital: 'أصول ثابتة' };
const FIN_EXPENSE = (ORG_CFG.finance || {}).expense || [
  { key: 'prog_exp', group: 'activities', name: 'مصروفات المشاريع والأنشطة' }, { key: 'al_media', group: 'activities', name: 'تسويق وإعلان' },
  { key: 'ad_salaries', group: 'admin', name: 'رواتب وأجور' }, { key: 'ad_rent', group: 'admin', name: 'إيجارات' },
  { key: 'ad_utilities', group: 'admin', name: 'هاتف وكهرباء وماء' }, { key: 'al_station', group: 'admin', name: 'قرطاسية ومطبوعات' },
  { key: 'ad_gov', group: 'admin', name: 'رسوم حكومية' }, { key: 'cap_assets', group: 'capital', name: 'شراء أصول ثابتة' },
];
const finCat = k => FIN_REVENUE.find(c => c.key === k) || FIN_EXPENSE.find(c => c.key === k) || { key: k, name: k || '—' };
const V_STATUS = {
  request:  { t: 'طلب صرف', c: '#6C8EBF' },
  draft:    { t: 'مسودة', c: '#94a3b8' },
  pending:  { t: 'بانتظار المراجعة المالية', c: '#f59e0b' },
  reviewed: { t: 'بانتظار اعتماد ' + TERMS.head, c: '#CAB05F' },
  approved: { t: 'معتمد', c: '#22c55e' },
  paid:     { t: 'صُرف', c: '#41747F' },
  rejected: { t: 'مرفوض', c: '#ef4444' },
  void:     { t: 'ملغى', c: '#64748b' },
};
const PAY_METHODS = { transfer: 'حوالة بنكية', cheque: 'شيك', cash: 'نقداً', card: 'شبكة / بطاقة', other: 'أخرى' };

/* ═════════ أدوات عامة ═════════ */
const RUSO_LIVE = !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
let ME = null;            // صف الموظف الحالي من جدول members
let RUSO_DEMO = false;
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : 'x' + Date.now().toString(16) + Math.random().toString(16).slice(2));
const sar = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = d => { if (!d) return '—'; const x = new Date(d); return isNaN(x) ? esc(d) : x.toLocaleDateString('ar-u-ca-gregory-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }); };
const daysTo = d => { if (!d) return null; const a = new Date(today()), b = new Date(d); return Math.round((b - a) / 864e5); };
function myApps() { if (!ME) return []; if (ME.role === 'admin') return ALL_APPS.slice(); return (ME.apps && ME.apps.length) ? ME.apps : ['tasks', 'library']; }
function can(a) { const L = myApps(); return Array.isArray(a) ? a.some(x => L.includes(x)) : L.includes(a); }
const isAdmin = () => !!ME && ME.role === 'admin';
const isManager = () => !!ME && (ME.role === 'admin' || ME.role === 'manager');
const canReviewFin = () => !!ME && (ME.role === 'admin' || (ME.role === 'manager' && (ME.apps || []).includes('finance')));
function appVisible(a) { return !a.app || can(a.app); }
function memberName(id) { const m = (ORG.members || []).find(x => x.id === id); return m ? m.name : '—'; }
function initials(n) { return String(n || '؟').replace(/^(د|م|أ)\.\s*/, '').trim().charAt(0); }
function avatar(m, size = 30) { const d = DEPTS[(m || {}).dept] || DEPTS.exec; if (m && m.avatar_url) return `<img class="r-av r-av-img" src="${esc(m.avatar_url)}" alt="" style="width:${size}px;height:${size}px" title="${esc(m.name || '')}" loading="lazy">`; return `<span class="r-av" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .45)}px;background:${d.color}22;color:${d.color}" title="${esc((m || {}).name || '')}">${esc(initials((m || {}).name))}</span>`; }
function rToast(msg, bad) { let t = document.getElementById('rToast'); if (!t) { t = document.createElement('div'); t.id = 'rToast'; document.body.appendChild(t); } t.className = 'r-toast' + (bad ? ' bad' : ''); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200); }
function rTabs(id, tabs, cur, fn) { return `<div class="r-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${t.id === cur}" class="${t.id === cur ? 'on' : ''}" onclick="${fn}('${t.id}')">${t.icon ? `<i data-lucide="${t.icon}"></i>` : ''}${esc(t.name)}${t.n ? ` <span class="r-cnt">${t.n}</span>` : ''}</button>`).join('')}</div>`; }
function rEmpty(icon, text, btn) { return `<div class="r-empty"><i data-lucide="${icon}"></i><p>${text}</p>${btn || ''}</div>`; }
function vBadge(st) { const s = V_STATUS[st] || { t: st, c: '#999' }; return `<span class="r-badge" style="--c:${s.c}">${s.t}</span>`; }
function linkChip(l) { if (!l || !l.url) return ''; const drive = /drive\.google|docs\.google/.test(l.url); return `<a class="r-link" href="${esc(l.url)}" target="_blank" rel="noopener"><i data-lucide="${drive ? 'hard-drive' : 'link'}"></i>${esc(l.title || (drive ? 'Google Drive' : 'رابط'))}</a>`; }
function validUrl(u) { return !u || /^https?:\/\//i.test(u); }
function fval(id) { const e = document.getElementById(id); return e ? (e.type === 'checkbox' ? e.checked : e.value.trim()) : ''; }

/* تفقيط المبلغ بالحروف (مطلوب في سند الصرف حسب اللائحة) */
function tafqeet(n) {
  n = Math.round(Number(n || 0) * 100) / 100;
  const riyals = Math.floor(n), halalas = Math.round((n - riyals) * 100);
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hund = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const three = x => { const h = Math.floor(x / 100), r = x % 100, p = []; if (h) p.push(hund[h]); if (r) { if (r < 20) p.push(ones[r]); else { const o = r % 10, t = Math.floor(r / 10); p.push(o ? ones[o] + ' و' + tens[t] : tens[t]); } } return p.join(' و'); };
  const scale = (x, one, two, few, many) => x === 1 ? one : x === 2 ? two : (x >= 3 && x <= 10) ? three(x) + ' ' + few : three(x) + ' ' + many;
  if (riyals === 0 && halalas === 0) return 'صفر ريال';
  const parts = [];
  const m = Math.floor(riyals / 1e6), k = Math.floor((riyals % 1e6) / 1000), r = riyals % 1000;
  if (m) parts.push(scale(m, 'مليون', 'مليونان', 'ملايين', 'مليون'));
  if (k) parts.push(scale(k, 'ألف', 'ألفان', 'آلاف', 'ألف'));
  if (r) parts.push(three(r));
  let s = parts.length ? parts.join(' و') + ' ريال' : '';
  if (halalas) s += (s ? ' و' : '') + three(halalas) + ' هللة';
  return s + ' فقط لا غير';
}

/* ═════════ طبقة البيانات: Supabase أو قاعدة تجريبية محلية ═════════ */
const ORG = { members: [], programs: [] };
const DEMO_KEY = (CONFIG.storageKey || 'org') + '_demo_db';
function demoDB() { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { return null; } }
function demoSave(d) { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); }
const RDB = {
  async list(t, opt = {}) {
    if (RUSO_LIVE && !RUSO_DEMO) {
      let q = sb.from(t).select(opt.select || '*');
      if (opt.eq) Object.entries(opt.eq).forEach(([k, v]) => q = q.eq(k, v));
      if (opt.order) q = q.order(opt.order, { ascending: !!opt.asc });
      if (opt.limit) q = q.limit(opt.limit);
      const { data, error } = await q; if (error) throw error; return data || [];
    }
    let rows = ((demoDB() || {})[t] || []).slice();
    if (opt.eq) rows = rows.filter(r => Object.entries(opt.eq).every(([k, v]) => r[k] === v));
    rows = rows.filter(r => demoCanSee(t, r));
    if (opt.order) rows.sort((a, b) => (a[opt.order] > b[opt.order] ? 1 : a[opt.order] < b[opt.order] ? -1 : 0) * (opt.asc ? 1 : -1));
    return opt.limit ? rows.slice(0, opt.limit) : rows;
  },
  async insert(t, row) {
    if (RUSO_LIVE && !RUSO_DEMO) { const { data, error } = await sb.from(t).insert(row).select().single(); if (error) throw error; return data; }
    const d = demoDB() || {}; d[t] = d[t] || [];
    row = Object.assign({ id: rid(), created_at: new Date().toISOString() }, row);
    if (t === 'vouchers') demoVoucherRules(d, row, null);
    d[t].push(row); demoSave(d); return row;
  },
  async update(t, id, patch) {
    if (RUSO_LIVE && !RUSO_DEMO) { const { data, error } = await sb.from(t).update(patch).eq('id', id).select().single(); if (error) throw error; return data; }
    const d = demoDB() || {}; const r = (d[t] || []).find(x => x.id === id); if (!r) throw new Error('غير موجود');
    const nr = Object.assign({}, r, patch);
    if (t === 'vouchers') demoVoucherRules(d, nr, r);
    Object.assign(r, nr); demoSave(d); return r;
  },
  async remove(t, id) {
    if (RUSO_LIVE && !RUSO_DEMO) { const { error } = await sb.from(t).delete().eq('id', id); if (error) throw error; return; }
    const d = demoDB() || {}; d[t] = (d[t] || []).filter(x => x.id !== id); demoSave(d);
  },
  async upsertSetting(key, value) {
    if (RUSO_LIVE && !RUSO_DEMO) { const { error } = await sb.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }); if (error) throw error; return; }
    const d = demoDB() || {}; d.site_settings = (d.site_settings || []).filter(x => x.key !== key); d.site_settings.push({ id: key, key, value }); demoSave(d);
  },
  async uploadImage(file) {
    const blob = await rCompressImage(file, 1600, .82);
    if (RUSO_LIVE && !RUSO_DEMO) {
      const path = new Date().getFullYear() + '/' + rid() + '.webp';
      const { error } = await sb.storage.from('site-media').upload(path, blob, { contentType: 'image/webp', upsert: false });
      if (error) throw error;
      return sb.storage.from('site-media').getPublicUrl(path).data.publicUrl;
    }
    return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  },
};
/* نفس قواعد الـtrigger في قاعدة البيانات — حتى يتصرف الوضع التجريبي مثل الحقيقي */
function demoVoucherRules(d, v, old) {
  const F = CONFIG.finance, fin = can('finance');
  if (v.kind === 'payment' && v.method === 'cash' && Number(v.amount) > F.cashLimit) throw new Error('الصرف النقدي لا يتجاوز ' + sar(F.cashLimit) + ' ريال — استخدم شيكاً أو حوالة');
  v.board_required = v.kind === 'payment' && Number(v.amount) > F.boardLimit;
  const nextNo = () => 1 + Math.max(1000, ...(d.vouchers || []).filter(x => x.kind === v.kind && x.number).map(x => x.number));
  if (!old) {
    v.created_by = v.created_by || ME.id;
    if (!fin) { v.status = 'request'; v.kind = 'payment'; }
    if (!['request', 'draft', 'pending'].includes(v.status)) v.status = 'pending';
    if (!v.number && v.status !== 'request') v.number = nextNo();
    return;
  }
  if (v.status !== old.status) {
    const st = v.status;
    if (old.status === 'request' && ['draft', 'pending'].includes(st) && !fin) throw new Error('تحويل طلب الصرف إلى سند من صلاحية الشؤون المالية');
    if (st === 'reviewed' && !canReviewFin()) throw new Error('المراجعة المالية لـ' + TERMS.finHead + ' أو ' + TERMS.head);
    if (['approved', 'void'].includes(st) && !isAdmin()) throw new Error('اعتماد السندات وإلغاؤها لـ' + TERMS.head + ' فقط');
    if (st === 'rejected' && !canReviewFin()) throw new Error('رفض السند للمراجع المالي أو ' + TERMS.head);
    if (st === 'paid' && (old.status !== 'approved' || !fin)) throw new Error('لا يُصرف إلا سند معتمد، ومن الشؤون المالية');
    if (!v.number && st !== 'request') v.number = nextNo();
    const now = new Date().toISOString();
    if (st === 'reviewed') { v.reviewed_by = ME.id; v.reviewed_at = now; }
    if (st === 'approved') { v.approved_by = ME.id; v.approved_at = now; if (!v.reviewed_by) { v.reviewed_by = ME.id; v.reviewed_at = now; } }
    if (st === 'paid') { v.paid_by = ME.id; v.paid_at = now; }
  } else if (['approved', 'paid', 'void'].includes(old.status) && !isAdmin()) {
    if (!(fin && Number(v.amount) === Number(old.amount) && v.party === old.party && v.category === old.category)) throw new Error('لا يمكن تعديل سند معتمد');
  }
}
/* محاكاة RLS في الوضع التجريبي */
function demoCanSee(t, r) {
  if (!ME) return true;
  if (t === 'org_tasks') return isAdmin() || r.dept === ME.dept || r.assignee === ME.id || r.created_by === ME.id;
  if (t === 'vouchers') return can(['finance', 'reports']) || r.created_by === ME.id;
  if (t === 'submissions') return can('inbox');
  if (t === 'donors') return can(['finance', 'donors']);
  if (t === 'budgets') return can(['finance', 'reports']);
  return true;
}
async function rCompressImage(file, max, q) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return await new Promise(r => c.toBlob(r, 'image/webp', q));
}
async function loadOrg() {
  try { ORG.members = await RDB.list('members', { order: 'created_at', asc: true }); } catch (e) { ORG.members = []; }
  try { ORG.programs = await RDB.list('programs', { order: 'sort', asc: true }); } catch (e) { ORG.programs = []; }
  if (!(RUSO_LIVE && !RUSO_DEMO)) demoBackfillAvatars();
  await syncDeptApps();
}
/* من يتبع صلاحيات قسمه يحصل تلقائياً على أي تطبيق يُضاف لقسمه لاحقاً؛ المخصَّص يدوياً لا يُمس */
const ERP_NEW_APPS = ['beneficiaries', 'volunteers', 'hr', 'procurement', 'governance', 'grants', 'mail'];
async function syncDeptApps() {
  if (!ME || ME.role !== 'admin') return;
  for (const m of ORG.members) {
    if (m.role === 'admin' || m.apps_custom === true) continue;
    const def = (DEPT_APPS[m.dept] || ['tasks', 'library']).slice(), key = a => (a || []).slice().sort().join();
    const legacyDefault = key(m.apps) === key(def.filter(a => !ERP_NEW_APPS.includes(a)));
    if (m.apps_custom === undefined && !legacyDefault && key(m.apps) !== key(def)) { try { await RDB.update('members', m.id, { apps_custom: true }); m.apps_custom = true; } catch (e) {} continue; }
    if (key(m.apps) !== key(def) || m.apps_custom !== false) { try { await RDB.update('members', m.id, { apps: def, apps_custom: false }); m.apps = def; m.apps_custom = false; } catch (e) { console.warn('syncDeptApps', e); } }
  }
}
/* الوضع التجريبي: صور الفريق الافتراضية لمن لم يضع صورته */
function demoBackfillAvatars() {
  const DM = ORG_CFG.demo || {}, av = DM.avatars || [], names = (DM.members || []).map(x => x[0]); if (!av.length) return;
  const d = demoDB(); if (!d || !d.members) return; let ch = false;
  d.members.forEach(m => { const i = names.indexOf(m.name); if (!m.avatar_url && !m.avatar_set && i >= 0 && av[i]) { m.avatar_url = av[i]; ch = true; } });
  if (ch) { demoSave(d); ORG.members = ORG.members.map(m => d.members.find(x => x.id === m.id) || m); if (ME) Object.assign(ME, d.members.find(x => x.id === ME.id) || {}); }
}
/* ── حسابي: كل موظف يغيّر صورته بنفسه ── */
function myAccountModal() {
  const m = ME; let pending = null;
  openModal('حسابي', `<div class="r-acct"><div class="r-acct-av" id="maPrev">${avatar(m, 112)}</div>
      <div><b style="font-size:18px">${esc(m.name)}</b><div class="r-sub">${esc(m.title || ROLES[m.role])} · ${esc((DEPTS[m.dept] || {}).name || '')}</div><div class="r-sub" dir="ltr" style="text-align:right">${esc(m.email || '')}</div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><label class="btn btn-gold btn-sm"><i data-lucide="camera"></i> تغيير الصورة<input type="file" accept="image/*" hidden id="maFile"></label>
      ${m.avatar_url ? '<button type="button" class="btn btn-ghost btn-sm" id="maDel">إزالة الصورة</button>' : ''}</div></div></div>
    <div class="r-hint">تُقصّ الصورة مربعة وتُضغط تلقائياً (أقل من 20 ك.ب) — يفضّل صورة شخصية واضحة للوجه.</div>`,
    async () => {
      if (pending === null) { closeModal(); return; }
      try {
        if (RUSO_LIVE && !RUSO_DEMO) { const { error } = await sb.rpc('set_my_avatar', { url: pending }); if (error) throw error; }
        else { const d = demoDB(); const r = d.members.find(x => x.id === m.id); r.avatar_url = pending; r.avatar_set = true; demoSave(d); }
        ME.avatar_url = pending; await loadOrg(); rUserChip(); closeModal(); rToast('تم تحديث صورة الحساب'); rerenderCur();
      } catch (e) { rToast(e.message, 1); }
    });
  const inp = document.getElementById('maFile');
  inp.onchange = async () => { const f = inp.files[0]; if (!f) return; pending = await rAvatarData(f); document.getElementById('maPrev').innerHTML = avatar({ name: m.name, avatar_url: pending }, 112); };
  const del = document.getElementById('maDel'); if (del) del.onclick = () => { pending = ''; document.getElementById('maPrev').innerHTML = avatar({ name: m.name, dept: m.dept }, 112); };
  refreshIcons();
}
/* قصّ مربع (يميل للأعلى حيث الوجه) وضغط إلى webp صغير يُحفظ مباشرة مع الحساب — بلا تخزين خارجي */
async function rAvatarData(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const s = Math.min(img.width, img.height), sx = (img.width - s) / 2, sy = Math.max(0, (img.height - s) * .2);
  const c = document.createElement('canvas'); c.width = c.height = 240; c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, 240, 240);
  return c.toDataURL('image/webp', .82);
}
function programName(id) { const p = ORG.programs.find(x => x.id === id); return p ? p.title : ''; }
function programOptions(sel, empty = 'بدون برنامج') { return `<option value="">${empty}</option>` + ORG.programs.map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}>${esc(p.title)}</option>`).join(''); }
function memberOptions(sel, empty = 'غير مسند') { return `<option value="">${empty}</option>` + Object.keys(DEPTS).map(k => { const ms = ORG.members.filter(m => m.dept === k && m.active !== false); return ms.length ? `<optgroup label="${DEPTS[k].name}">${ms.map(m => `<option value="${m.id}"${m.id === sel ? ' selected' : ''}>${esc(m.name)} — ${esc(m.title)}</option>`).join('')}</optgroup>` : ''; }).join(''); }
function deptOptions(sel) { return Object.entries(DEPTS).map(([k, d]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${d.name}</option>`).join(''); }

/* ═════════ الدخول (يستبدل enterApp في 01-core) ═════════ */
async function enterApp(user) {
  if (USER && user && USER.id === user.id) return;
  USER = user; lmsg('جارٍ التحقق من صلاحياتك...');
  try {
    const { data, error } = await sb.from('members').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!data || data.active === false) {
      await sb.auth.signOut(); USER = null; lmsg('');
      lerr('حسابك غير مضاف في فريق ' + TERMS.org + ' بعد. اطلب من ' + TERMS.head + ' إضافة بريدك من «الفريق والصلاحيات» ثم أعد الدخول.');
      return;
    }
    ME = data;
    await loadCloud(); migrateData(); save();
    await loadOrg();
  } catch (e) { lerr('تعذّر تحميل البيانات: ' + (e.message || e)); lmsg(''); return; }
  lmsg(''); showShell();
}
function showShell() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  rDefaultWall();
  renderNav(); initSidebarShell(); applyBranding(); applyWallpaper(); rUserChip();
  const dt = document.getElementById('ctDate'); if (dt) dt.textContent = new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' });
  go('home');
}
function rUserChip() {
  const f = document.querySelector('.nav-foot'); if (!f || !ME) return;
  let c = document.getElementById('rMe'); if (!c) { c = document.createElement('div'); c.id = 'rMe'; f.prepend(c); }
  c.className = 'r-me';
  c.innerHTML = `<button type="button" class="r-me-av" onclick="myAccountModal()" title="تغيير صورة الحساب">${avatar(ME, 34)}</button><div style="flex:1"><b>${esc(ME.name)}</b><span>${esc(ME.title || ROLES[ME.role])}</span></div><button type="button" class="r-me-wp" onclick="myAccountModal()" title="حسابي" aria-label="حسابي"><i data-lucide="user-round-cog"></i></button>` +
    (RUSO_DEMO ? `<select class="r-demo-switch" onchange="demoSwitch(this.value)" title="جرّب النظام بصلاحيات موظف آخر">${ORG.members.map(m => `<option value="${m.id}"${m.id === ME.id ? ' selected' : ''}>عرض كـ: ${esc(m.name.split(' ')[0])} — ${esc(DEPTS[m.dept].short)}</option>`).join('')}</select>` : '');
}

/* ═════════ الوضع التجريبي (بدون قاعدة بيانات) ═════════ */
function demoSeed() {
  const DM = ORG_CFG.demo || {};
  const dk = Object.keys(DEPTS);
  const M = ([name, title, dept, role, apps]) => ({ id: rid(), user_id: null, email: 'user' + Math.random().toString(36).slice(2, 6) + '@example.com', name, title, dept, role, apps: role === 'admin' ? [] : (apps || DEPT_APPS[dept] || ['tasks', 'library']), apps_custom: !!apps, phone: '', active: true, created_at: new Date().toISOString() });
  const members = (DM.members || [['المدير العام', TERMS.head, dk[0], 'admin'], ['مدير التسويق', 'مدير إدارة', dk[2] || dk[0], 'manager'], ['مدير المالية', TERMS.finHead, dk[3] || dk[0], 'manager'], ['مدير العمليات', 'مدير إدارة', dk[1] || dk[0], 'manager'], ['موظف خدمات', 'موظف', dk[3] || dk[0], 'staff', ['tasks', 'library']], ['منسق مشاريع', 'موظف', dk[1] || dk[0], 'staff']]).map(M);
  members.forEach((m, i) => { m.avatar_url = (DM.avatars || [])[i] || ''; });
  const ed = members.find(m => m.role === 'admin') || members[0];
  const pick = (f) => members.find(f) || ed;
  const fin = pick(m => m.role === 'manager' && m.apps.includes('finance'));
  const comms = pick(m => m.role === 'manager' && m.apps.includes('site'));
  const proj = pick(m => m.role === 'manager' && m.apps.includes('programs') && !m.apps.includes('site'));
  const sup = pick(m => m.role === 'staff' && m.dept === fin.dept);
  const pm = pick(m => m.role === 'staff' && m.dept === proj.dept);
  const P = ([slug, title]) => ({ id: rid(), slug, title, axis: '', audience: '', summary: '', body: '', cover_url: '', status_label: '', registration_open: false, register_url: '', duration: '', location: '', seats: '', partner: '', outcomes: [], faqs: [], gallery: [], featured: false, published: true, sort: 0 });
  const programs = (DM.programs || [['program-a', 'البرنامج الأول'], ['program-b', 'البرنامج الثاني'], ['program-c', 'البرنامج الثالث'], ['program-d', 'البرنامج الرابع'], ['program-e', 'البرنامج الخامس']]).map(P);
  while (programs.length < 5) programs.push(P(['p' + programs.length, 'برنامج ' + (programs.length + 1)]));
  programs.forEach((p, i) => p.sort = i);
  programs[1].registration_open = true; programs[1].status_label = 'التسجيل مفتوح';
  const d0 = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const T = (title, dept, assignee, status, priority, due, prog, links, desc) => ({ id: rid(), title, description: desc || '', dept, program_id: prog || null, assignee, created_by: ed.id, status, priority, due_date: due, links: links || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  const tasks = [
    T('تصميم إعلان التسجيل في ' + programs[1].title, comms.dept, comms.id, 'doing', 'high', d0(2), programs[1].id, [{ title: 'مجلد التصاميم', url: 'https://drive.google.com/drive/folders/EXAMPLE' }], 'مقاسات: بوست إنستغرام + ستوري + إكس. الالتزام بالهوية البصرية.'),
    T('نشر خبر اختتام ' + programs[3].title + ' في الموقع', comms.dept, comms.id, 'review', 'normal', d0(1), programs[3].id, [{ title: 'صور الختام', url: 'https://drive.google.com/drive/folders/EXAMPLE2' }]),
    T('إعداد تقرير الربع للجهة المانحة — ' + programs[4].title, proj.dept, pm.id, 'todo', 'high', d0(6), programs[4].id),
    T('حجز القاعة والتنسيق اللوجستي — ' + programs[1].title, proj.dept, proj.id, 'doing', 'urgent', d0(-1), programs[1].id),
    T('التسوية البنكية الشهرية', fin.dept, fin.id, 'todo', 'normal', d0(4)),
    T('صيانة أجهزة قاعة التدريب', sup.dept, sup.id, 'done', 'low', d0(-6)),
    T('اعتماد خطة المحتوى للربع القادم', ed.dept, ed.id, 'todo', 'normal', d0(9)),
  ];
  tasks[5].done_at = new Date().toISOString();
  const donors = (DM.donors || ['جهة مانحة أولى', 'جهة مانحة ثانية', 'شريك ثالث', 'جهة حكومية']).map((name, i) => ({ id: rid(), name, kind: i === 3 ? 'government' : 'foundation', contact: '', phone: '', email: '', notes: '' }));
  while (donors.length < 4) donors.push({ id: rid(), name: 'داعم ' + (donors.length + 1), kind: 'foundation', contact: '', phone: '', email: '', notes: '' });
  const V = (kind, number, amount, party, category, status, extra) => Object.assign({ id: rid(), kind, number, date: d0(-Math.floor(Math.random() * 40)), amount, party, donor_id: null, category, program_id: null, dept: '', fund: 'unrestricted', method: 'transfer', reference: '', bank_account: '', description: '', attachment_url: '', quotes_count: 0, board_required: amount > 20000, deposited: kind === 'receipt', deposited_at: null, status, reject_reason: '', created_by: fin.id, created_at: new Date().toISOString() }, extra || {});
  const trail = v => { const t = new Date(Date.now() - 2 * 864e5).toISOString(); if (['reviewed', 'approved', 'paid'].includes(v.status)) { v.reviewed_by = fin.id; v.reviewed_at = t; } if (['approved', 'paid'].includes(v.status)) { v.approved_by = ed.id; v.approved_at = t; } if (v.status === 'paid') { v.paid_by = fin.id; v.paid_at = t; } return v; };
  const vouchers = [
    V('receipt', 1001, 150000, donors[0].name, 'don_grantors', 'approved', { donor_id: donors[0].id, fund: 'restricted', program_id: programs[4].id, description: 'الدفعة الأولى من منحة ' + programs[4].title }),
    V('receipt', 1002, 60000, donors[2].name, 'don_grantors', 'approved', { donor_id: donors[2].id, fund: 'restricted', program_id: programs[2].id, description: 'دعم ' + programs[2].title, deposited: false }),
    V('receipt', 1003, 1200, 'اشتراكات الأعضاء', 'membership', 'approved', { method: 'cash' }),
    V('payment', 1001, 8500, 'مؤسسة الضيافة', 'prog_exp', 'paid', { program_id: programs[2].id, description: 'ضيافة حفل الاختتام — ' + programs[2].title, method: 'transfer', reference: 'TRX-55821' }),
    V('payment', 1002, 24500, 'مركز التدريب المعتمد', 'prog_exp', 'reviewed', { program_id: programs[0].id, description: 'أتعاب المدربين — ' + programs[0].title, quotes_count: 3, attachment_url: 'https://drive.google.com/drive/folders/EXAMPLE3' }),
    V('payment', 1003, 3200, 'مكتبة القرطاسية', 'al_station', 'pending', { description: 'قرطاسية ومطبوعات البرامج', method: 'card' }),
    V('payment', null, 1800, 'مطبعة محلية', 'al_media', 'request', { dept: comms.dept, created_by: comms.id, description: 'طباعة رول أب — ' + programs[1].title, program_id: programs[1].id }),
  ].map(trail);
  const resources = [
    { id: rid(), title: 'الهوية البصرية — الشعار والخطوط والقوالب', url: 'https://drive.google.com/drive/folders/EXAMPLE-IDENTITY', kind: 'design', dept: comms.dept, tags: ['هوية'], notes: 'المرجع الوحيد لأي تصميم', pinned: true, created_by: comms.id, created_at: new Date().toISOString() },
    { id: rid(), title: 'صور ' + programs[1].title + ' (عالية الدقة)', url: 'https://drive.google.com/drive/folders/EXAMPLE-AFAQ', kind: 'image', dept: comms.dept, program_id: programs[1].id, tags: ['صور', 'برامج'], notes: '', pinned: false, created_by: comms.id, created_at: new Date().toISOString() },
    { id: rid(), title: 'التقرير الختامي — ' + programs[0].title, url: 'https://drive.google.com/file/d/EXAMPLE-REPORT', kind: 'doc', dept: proj.dept, program_id: programs[0].id, tags: ['تقارير'], notes: '', pinned: false, created_by: proj.id, created_at: new Date().toISOString() },
    { id: rid(), title: 'فيديو ختام ' + programs[2].title, url: 'https://drive.google.com/file/d/EXAMPLE-VIDEO', kind: 'video', dept: comms.dept, program_id: programs[2].id, tags: ['فيديو'], notes: '', pinned: false, created_by: comms.id, created_at: new Date().toISOString() },
    { id: rid(), title: 'اللائحة المالية ودليل الإجراءات', url: 'https://drive.google.com/drive/folders/EXAMPLE-POLICIES', kind: 'folder', dept: fin.dept, tags: ['لوائح'], notes: '', pinned: true, created_by: fin.id, created_at: new Date().toISOString() },
  ];
  const submissions = [
    { id: rid(), kind: 'registration', program_id: programs[1].id, ref_title: programs[1].title, name: 'سارة محمد', email: 'sara@example.com', phone: '0500000001', message: 'أرغب في معرفة التخصصات الصحية', payload: { gender: 'أنثى', age: '17', occupation: 'طالب ثانوي' }, status: 'new', notes: '', created_at: new Date().toISOString() },
    { id: rid(), kind: 'volunteer', ref_title: '', name: 'خالد العمر', email: '', phone: '0500000002', message: '', payload: { skills: 'تصوير وتصميم', availability: 'نهاية الأسبوع', gender: 'ذكر' }, status: 'new', notes: '', created_at: new Date(Date.now() - 864e5).toISOString() },
    { id: rid(), kind: 'partnership', ref_title: '', name: 'م. فهد السالم', email: 'csr@company.sa', phone: '0500000003', message: 'نود رعاية برنامج للشباب ضمن مسؤوليتنا الاجتماعية', payload: { org: 'شركة محلية', type: 'رعاية برنامج' }, status: 'in_progress', notes: 'تم الاتصال — موعد الأحد', created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: rid(), kind: 'contact', ref_title: '', name: 'أبو عبدالله', email: 'a@example.com', phone: '', message: 'هل البرامج برسوم؟', payload: { subject: 'استفسار عام' }, status: 'done', notes: '', created_at: new Date(Date.now() - 6 * 864e5).toISOString() },
  ];
  const budgets = [
    { id: rid(), year: new Date().getFullYear(), program_id: programs[0].id, category: 'prog_exp', amount: 90000, notes: '' },
    { id: rid(), year: new Date().getFullYear(), program_id: programs[2].id, category: 'prog_exp', amount: 70000, notes: '' },
    { id: rid(), year: new Date().getFullYear(), program_id: null, category: 'ad_salaries', amount: 180000, notes: '' },
    { id: rid(), year: new Date().getFullYear(), program_id: null, category: 'al_media', amount: 15000, notes: '' },
  ];
  return { members, programs, org_tasks: tasks, task_comments: [], donors, vouchers, resources, submissions, budgets, subscribers: [{ id: rid(), email: 'parent@example.com', source: 'website', subscribed: true, created_at: new Date().toISOString() }], news: [], partners: [], testimonials: [], faqs: [], documents: [], opportunities: [], site_settings: [] };
}
async function enterRusoDemo() {
  RUSO_DEMO = true;
  if (!demoDB()) demoSave(demoSeed());
  const d = demoDB();
  const want = sessionStorage.getItem(DEMO_KEY + '_me');
  ME = d.members.find(m => m.id === want) || d.members.find(m => m.role === 'admin') || d.members[0];
  USER = { id: 'demo', email: ME.email };
  S = demoLoadState(ME.id); await loadOrg();
  showShell();
  rToast('الوضع التجريبي — البيانات محفوظة في هذا المتصفح فقط');
}
function demoSwitch(id) {
  sessionStorage.setItem(DEMO_KEY + '_me', id); const m = ORG.members.find(x => x.id === id); if (!m) return;
  try { localStorage.setItem(KEY + '::' + ME.id, JSON.stringify(S)); } catch (e) {}
  ME = m; S = demoLoadState(m.id); rDefaultWall(); save(); applyWallpaper(); renderNav(); rUserChip(); go('home'); rToast('تعرض الآن النظام بصلاحيات: ' + m.name);
}
/* في الوضع التجريبي: لكل موظف مساحته الشخصية (خلفيته وتقويمه وخرائطه) — كما في الوضع الحقيقي */
function demoLoadState(id) { try { const r = localStorage.getItem(KEY + '::' + id); if (r) return deepMerge(JSON.parse(JSON.stringify(def)), JSON.parse(r)); } catch (e) {} return JSON.parse(JSON.stringify(def)); }
function demoReset() { if (!confirm('إعادة البيانات التجريبية لحالتها الأولى؟')) return; localStorage.removeItem(DEMO_KEY); sessionStorage.removeItem(DEMO_KEY + '_me'); location.reload(); }

/* ═════════ إعادة تعريف دوال الغلاف ═════════ */
async function bootstrap() {
  const params = new URLSearchParams(location.search);
  if (!RUSO_LIVE || params.get('demo')) { await enterRusoDemo(); return; }
  if (RECOVERY_MODE || /[#?&]type=recovery/.test(location.hash) || /[?&]type=recovery/.test(location.search)) { RECOVERY_MODE = true; showReset(); return; }
  try { const { data } = await sb.auth.getSession(); if (data && data.session && !RECOVERY_MODE) { await enterApp(data.session.user); return; } } catch (e) {}
  const em = document.getElementById('em'); if (em) em.focus();
}
async function logout() {
  if (RUSO_DEMO) { sessionStorage.removeItem(DEMO_KEY + '_me'); location.href = location.pathname; return; }
  await sb.auth.signOut(); USER = null; ME = null; STATE_ID = null;
  document.getElementById('appShell').classList.add('hidden'); document.getElementById('loginView').classList.remove('hidden');
}
function navItems() { return RUSO_APPS.filter(appVisible); }
function navName(v) { const a = RUSO_APPS.find(x => x.id === v); return a ? a.name : (v === 'settings' ? 'الإعدادات' : v === 'desktop' ? 'المكتب' : ''); }
function looseLaunch() { return RUSO_APPS.filter(a => a.id !== 'home' && appVisible(a)); }
function applyTheme() { document.documentElement.setAttribute('data-theme', 'light'); }
function applyBranding() { const sl = document.querySelector('.logo-area img'); if (sl) sl.src = CONFIG.brandLogoLight || CONFIG.brandLogo; const tg = document.querySelector('.sidebar .tagline'); if (tg) tg.textContent = 'النظام الداخلي'; applyTheme(); }
/* أيقونات التطبيقات: ألوان مشبعة معتمة بلمعة خفيفة على نمط أبل (بدل الشفافية التي تبهت فوق الخلفيات الفاتحة) */
function lpTile(a) {
  const [c1, c2] = String(a.c || '#41747F,#2E5860').split(',');
  const inner = `<span class="lp-ic r-ic" style="--c1:${c1};--c2:${c2 || c1}"><i data-lucide="${a.icon}"></i></span><span class="lp-name">${esc(a.name)}</span>`;
  return a.href ? `<a class="lp-tile" href="${a.href}"${a.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
    : `<button class="lp-tile" type="button" onclick="go('${a.id}')">${inner}</button>`;
}
function renderDesktop() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="page-head"><h1>التطبيقات</h1><button class="btn btn-ghost" onclick="wallpaperModal()"><i data-lucide="image"></i> خلفية الشاشة</button></div>
    <div class="lp-grid desk-grid">${looseLaunch().map(lpTile).join('')}</div></div>`;
  refreshIcons();
}

/* ═════════ خلفية الشاشة — صور فقط، ولكل موظف خلفيته (تُحفظ في مساحته الشخصية) ═════════ */
const ORG_WALL_IMAGES = ORG_CFG.wallImages || [];   // صور العميل [{key,name,url}] + خلفيات النظام الجاهزة
function rWallList() { return ORG_CFG.wallOnly ? ORG_WALL_IMAGES.slice() : ORG_WALL_IMAGES.concat(WALL_IMAGES); }
/* خلفية محفوظة لم تعد ضمن القائمة (أُلغيت) ← تُستبدل بالافتراضية */
function rWallFix() {
  const w = S.settings && S.settings.wallpaper;
  if (w && w.type === 'url' && !rWallList().some(x => x.key === w.key || x.url === w.url)) { const d = rWallList().find(x => x.key === ORG_CFG.defaultWallpaper) || rWallList()[0]; S.settings.wallpaper = d ? { type: 'url', key: d.key, url: d.url } : { type: 'none' }; try { save(); } catch (e) {} }
  if (w && w.type === 'none' && ORG_CFG.wallOnly) { const d = rWallList().find(x => x.key === ORG_CFG.defaultWallpaper); if (d) { S.settings.wallpaper = { type: 'url', key: d.key, url: d.url }; try { save(); } catch (e) {} } }
}
function wpSet(w) { S.settings.wallpaper = w; S.settings.wpChosen = true; save(); applyWallpaper(); wpRenderBody(); wpMsg('تم تطبيق الخلفية'); }
function wpPickUrl(key) { const im = rWallList().find(x => x.key === key); if (im) wpSet({ type: 'url', key: im.key, url: im.url }); }
function wpPickImage(id) { const f = wpList().find(x => x.id === id); if (f) wpSet({ type: 'image', id: f.id, value: f.value }); }
function wpNone() { wpSet({ type: 'none' }); }
function wpImageUrl() {
  const w = S.settings && S.settings.wallpaper; if (!w) return '';
  if (w.type === 'url') return w.url || '';
  if (w.type === 'image') { if (w.value) return w.value; const f = wpList().find(x => x.id === w.id); return f ? f.value : ''; }
  return '';
}
function applyWallpaper() {
  rWallFix();
  let el = document.getElementById('orgWall');
  if (!el) { el = document.createElement('div'); el.id = 'orgWall'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el); }
  const sh = document.querySelector('.shell'); if (sh) { sh.style.background = ''; sh.style.backgroundAttachment = ''; }
  const url = wpImageUrl();
  el.style.backgroundImage = url ? 'url("' + url.replace(/"/g, '%22') + '")' : '';
  document.documentElement.classList.toggle('has-wp', !!url);
  wpTone(url);
}
/* سطوع الخلفية (يُقاس تلقائياً لأي صورة — حتى ما يرفعه الموظف) ← نص أبيض فوق الداكنة ونص داكن فوق الفاتحة */
function wpTone(url) {
  const H = document.documentElement, set = t => { H.classList.toggle('wp-dark', t === 'dark'); H.classList.toggle('wp-light', t === 'light'); };
  if (!url) { set(''); return; }
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('wp_tone') || '{}'); } catch (e) {}
  const k = url.length > 200 ? url.slice(0, 60) + url.length + url.slice(-60) : url;
  if (cache[k]) { set(cache[k]); return; }
  set('dark');
  const img = new Image(); img.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = 48; c.height = 27; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 48, 27);
      const d = x.getImageData(0, 0, 48, 27).data; let L = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { const row = Math.floor(i / 4 / 48), w = row < 9 ? 2 : 1; L += w * (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]); n += w; }   // أعلى الصورة أهم (العناوين هناك)
      const t = L / n / 255 > .56 ? 'light' : 'dark'; cache[k] = t; try { localStorage.setItem('wp_tone', JSON.stringify(cache)); } catch (e) {} set(t);
    } catch (e) { set('dark'); }
  };
  img.src = url;
}
function wpRenderBody() {
  const body = document.getElementById('wpBody'); if (!body) return;
  const cur = (S.settings && S.settings.wallpaper) || { type: 'none' }, mine = wpList();
  const chip = (on, style, label, click, del) => `<div class="wp-chip img${on ? ' on' : ''}" role="button" tabindex="0" onclick="${click}" onkeydown="if(event.key==='Enter')${click}" style="${style}" title="${esc(label)}">${del || ''}<span>${on ? '<i class="inl" data-lucide="check"></i> مُفعّلة' : esc(label)}</span></div>`;
  body.innerHTML = `
    ${ORG_WALL_IMAGES.length ? `<div class="wp-sec-title"><i data-lucide="images"></i> صور ${esc(TERMS.org)}</div>
    <div class="wp-grid">${ORG_WALL_IMAGES.map(im => chip(cur.type === 'url' && cur.key === im.key, `background-image:url('${im.url}')`, im.name, `wpPickUrl('${im.key}')`)).join('')}</div>` : ''}
    ${ORG_CFG.wallOnly ? '' : `<div class="wp-sec-title"><i data-lucide="mountain"></i> خلفيات جاهزة</div>
    <div class="wp-grid">${WALL_IMAGES.map(im => chip(cur.type === 'url' && cur.key === im.key, `background-image:url('${im.url}')`, im.name, `wpPickUrl('${im.key}')`)).join('')}
      <div class="wp-chip none${cur.type === 'none' ? ' on' : ''}" role="button" tabindex="0" onclick="wpNone()"><span>${cur.type === 'none' ? '<i class="inl" data-lucide="check"></i> ' : ''}بدون خلفية</span></div></div>`}
    <div class="wp-sec-title"><i data-lucide="upload"></i> صوري ${mine.length ? `<span class="r-sub">(${mine.length})</span>` : ''}</div>
    ${mine.length ? `<div class="wp-grid">${mine.map(im => chip(cur.type === 'image' && cur.id === im.id, `background-image:url('${im.value}')`, im.name || 'صورتي', `wpPickImage('${im.id}')`, `<button class="wp-del" onclick="event.stopPropagation();wpDelImage('${im.id}')" title="حذف" aria-label="حذف">×</button>`)).join('')}</div>`
      : '<p class="r-sub" style="margin:0 0 14px">ارفع صورة من جهازك أو جوالك لتصبح خلفيتك — تُضغط تلقائياً وتبقى خاصة بك.</p>'}`;
  refreshIcons();
}

/* ═════════ تجربة الجوال: شريط تنقل سفلي + جداول كبطاقات ═════════ */
function go(view) {
  CUR = view;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.v === view));
  const t = document.getElementById('ctTitle'); if (t) t.textContent = navName(view);
  (RENDER[view] || renderHome)();
  refreshIcons();
  const sbar = document.getElementById('sidebar'); if (sbar) sbar.classList.remove('open');
  rTabbar();
  try { window.scrollTo({ top: 0 }); const m = document.querySelector('.main'); if (m) m.scrollTop = 0; } catch (e) {}
}
function rTabbar() {
  const shell = document.getElementById('appShell'); if (!shell || !ME) return;
  let bar = document.getElementById('rTabbar');
  if (!bar) { bar = document.createElement('nav'); bar.id = 'rTabbar'; bar.setAttribute('aria-label', 'التنقل السريع'); shell.appendChild(bar); }
  const order = ['home', 'tasks', 'finance', 'inbox', 'site', 'requests', 'library'];
  const items = order.map(id => RUSO_APPS.find(a => a.id === id)).filter(a => a && appVisible(a)).slice(0, 4);
  bar.innerHTML = items.map(a => `<button type="button" class="${CUR === a.id ? 'on' : ''}" onclick="go('${a.id}')"${CUR === a.id ? ' aria-current="page"' : ''}><i data-lucide="${a.icon}"></i><span>${esc(a.short || a.name)}</span></button>`).join('')
    + `<button type="button" onclick="toggleSidebar()"><i data-lucide="menu"></i><span>المزيد</span></button>`;
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}
function rCardify() {
  document.querySelectorAll('#main table.r-table:not(.r-fs)').forEach(tb => {
    const hs = Array.from(tb.querySelectorAll('thead th')).map(th => th.textContent.trim());
    tb.querySelectorAll('tbody tr').forEach(tr => Array.from(tr.children).forEach((td, i) => { if (!td.hasAttribute('data-label') && !td.hasAttribute('colspan')) td.setAttribute('data-label', hs[i] || ''); }));
  });
}
function refreshIcons() { try { if (window.lucide) lucide.createIcons(); } catch (e) {} rCardify(); }
/* الحفظ: نفس سلوك نظام بزنس + في الوضع التجريبي تُحفظ مساحة كل موظف باسمه */
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); if (RUSO_DEMO && ME) localStorage.setItem(KEY + '::' + ME.id, JSON.stringify(S)); } catch (e) {}
  scheduleCloudSave(); scheduleHomeRefresh();
}
function rDefaultWall() { if (S.settings && !S.settings.wpChosen && ORG_CFG.defaultWallpaper) { const w = rWallList().find(x => x.key === ORG_CFG.defaultWallpaper); if (w) S.settings.wallpaper = { type: 'url', key: w.key, url: w.url }; } }
