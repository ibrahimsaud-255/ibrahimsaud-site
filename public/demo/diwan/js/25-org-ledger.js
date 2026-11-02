/*
 * 25-org-ledger.js — المحاسبة (قيد مزدوج) للمنظمات غير الهادفة للربح
 * دليل الحسابات، قيود اليومية، دفتر الأستاذ، ميزان المراجعة، القوائم المالية (المركز المالي/الأنشطة/التدفقات النقدية)،
 * الأصول الثابتة والإهلاك، العهد، البنوك والتسوية البنكية، الرواتب، إقفال السنة المالية.
 * مبني على معيار المحاسبة للمنشآت غير الهادفة للربح (صافي أصول مقيدة/غير مقيدة) وعلى السجلات التي تطلبها
 * اللائحة المالية: اليومية العامة، الأستاذ العام، الأصول الثابتة، العهد، يومية الصندوق، حصر أوامر الصرف.
 * سندات الصرف والقبض تُرحَّل آلياً إلى القيود عند صرفها/اعتمادها (لا إدخال مزدوج).
 * ⚠️ تعريفات فقط.
 */
const LG = { tab: 'dash', st: 'position', year: new Date().getFullYear(), acct: '', from: '', to: '', jq: '', jst: '', tbClose: false, zero: false, recAcct: '', recPeriod: '', data: null };
const acLive = () => RUSO_LIVE && !RUSO_DEMO;
const LG_TYPES = { asset: { t: 'الأصول', dr: 1 }, liability: { t: 'الالتزامات', dr: 0 }, net_assets: { t: 'صافي الأصول', dr: 0 }, revenue: { t: 'الإيرادات والمكاسب', dr: 0 }, expense: { t: 'المصروفات والخسائر', dr: 1 } };
const LG_SRC = { manual: 'يدوي', voucher: 'سند', depreciation: 'إهلاك', payroll: 'رواتب', custody: 'عهدة', opening: 'افتتاحي', closing: 'إقفال', reversal: 'عكسي', asset: 'أصول' };
const ASSET_CATS = {
  furniture: { t: 'الأثاث والتجهيزات', a: '1210', dep: '1211' }, computers: { t: 'أجهزة الكمبيوتر', a: '1220', dep: '1221' },
  leasehold: { t: 'تحسينات الأماكن المستأجرة', a: '1230', dep: '1231' }, machinery: { t: 'الآلات والمعدات', a: '1240', dep: '1241' },
};
/* حسابات النظام الثابتة (يقرأها الترحيل الآلي) */
const SYS = { cash: '1101', bank: '1102', undeposited: '1104', custody: '1110', advances: '1111', prepaid: '1120', vat: '1130', receivable: '1140',
  payables: '2101', accrued: '2102', salPay: '2103', gosiPay: '2104', deferred: '2105', eos: '2201', naU: '3101', naR: '3102', dep: '5390', disposal: '5391', otherRev: '' };
const LG_PAYROLL = Object.assign({ gosiEmp: 9.75, gosiOrg: 11.75, gosiOrgNonSaudi: 2, payDay: 27, programDepts: ['projects'] }, ((ORG_CFG.finance || {}).payroll) || {});

/* ── دليل الحسابات الافتراضي: الهيكل من القوائم المراجَعة + بنود السندات من config ── */
function acDefaultChart() {
  const A = [], add = (code, name, type, o) => A.push(Object.assign({ code, name, type, parent: code.length > 1 ? (code.length === 2 ? code[0] : code.slice(0, 2)) : '', is_group: code.length < 4, contra: false, category: '', cash: false, active: true, sort: A.length }, o || {}));
  add('1', 'الأصول', 'asset'); add('11', 'الأصول المتداولة', 'asset');
  add('1101', 'النقد بالصندوق', 'asset', { cash: true }); add('1102', 'البنك — ' + (CONFIG.bankName || 'الحساب الجاري'), 'asset', { cash: true });
  add('1103', 'البنك — حساب التبرعات المقيدة', 'asset', { cash: true }); add('1104', 'متحصلات تحت الإيداع', 'asset', { cash: true });
  add('1110', 'عهد الموظفين', 'asset'); add('1111', 'سلف الموظفين', 'asset'); add('1120', 'مصروفات مدفوعة مقدماً', 'asset');
  add('1130', 'ضريبة القيمة المضافة المستردة', 'asset'); add('1140', 'تبرعات ومنح مستحقة القبض', 'asset');
  add('12', 'الأصول غير المتداولة', 'asset');
  Object.values(ASSET_CATS).forEach(c => { add(c.a, c.t, 'asset', c.a === '1210' ? { category: 'cap_assets' } : {}); add(c.dep, 'مجمع إهلاك ' + c.t, 'asset', { contra: true }); });
  add('2', 'الالتزامات', 'liability'); add('21', 'الالتزامات المتداولة', 'liability');
  add('2101', 'الموردون والدائنون', 'liability'); add('2102', 'مصروفات مستحقة', 'liability'); add('2103', 'رواتب مستحقة الدفع', 'liability');
  add('2104', 'التأمينات الاجتماعية المستحقة', 'liability'); add('2105', 'منح مقبوضة مقدماً (إيرادات مؤجلة)', 'liability'); add('2106', 'أمانات', 'liability');
  add('22', 'الالتزامات غير المتداولة', 'liability'); add('2201', 'التزامات منافع الموظفين (مكافأة نهاية الخدمة)', 'liability');
  add('3', 'صافي الأصول', 'net_assets'); add('31', 'صافي الأصول', 'net_assets');
  add('3101', 'صافي الأصول غير المقيدة', 'net_assets'); add('3102', 'صافي الأصول المقيدة', 'net_assets'); add('3103', 'صافي أصول الأوقاف', 'net_assets');
  add('4', 'الإيرادات والمكاسب', 'revenue'); add('41', 'الإيرادات والتبرعات', 'revenue');
  FIN_REVENUE.forEach((c, i) => add('41' + String(i + 1).padStart(2, '0'), c.name, 'revenue', { category: c.key }));
  add('5', 'المصروفات والخسائر', 'expense');
  const gp = { activities: '51', allocated: '52', admin: '53' };
  Object.entries(FIN_EXP_GROUPS).filter(([g]) => gp[g]).forEach(([g, t]) => {
    add(gp[g], t, 'expense'); FIN_EXPENSE.filter(c => c.group === g).forEach((c, i) => add(gp[g] + String(i + 1).padStart(2, '0'), c.name, 'expense', { category: c.key }));
  });
  add('5390', 'إهلاك الممتلكات والآلات والمعدات', 'expense', { parent: '53' }); add('5391', 'خسائر استبعاد أصول', 'expense', { parent: '53' });
  return A;
}
const acAcc = code => (LG.data.accounts || []).find(a => a.code === code);
const acName = code => { const a = acAcc(code); return a ? a.name : code; };
const acCatAcc = cat => { const a = (LG.data.accounts || []).find(x => x.category === cat && !x.is_group); return a ? a.code : (cat === 'cap_assets' ? '1210' : ''); };
const acLeaves = f => (LG.data.accounts || []).filter(a => !a.is_group && a.active !== false && (!f || f(a))).sort((a, b) => a.code.localeCompare(b.code));
function acAccOptions(sel, f) {
  return `<option value="">— اختر الحساب —</option>` + Object.entries(LG_TYPES).map(([k, t]) => `<optgroup label="${t.t}">${acLeaves(a => a.type === k && (!f || f(a))).map(a => `<option value="${a.code}"${a.code === sel ? ' selected' : ''}>${a.code} — ${esc(a.name)}</option>`).join('')}</optgroup>`).join('');
}
const acAmt = n => { n = Math.round(Number(n || 0) * 100) / 100; return n < 0 ? `(${sar(-n)})` : sar(n); };
const acYearOf = d => +String(d || '').slice(0, 4);
const acMonthEnd = p => { const [y, m] = p.split('-').map(Number); const d = new Date(y, m, 0); return y + '-' + String(m).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const acPrevMonth = () => { const d = new Date(); d.setDate(0); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };

/* ═════════ التحميل والتهيئة ═════════ */
async function acLoad() {
  const L = t => RDB.list(t).catch(() => []);
  const [accounts, entries, assets, cust, banks, recs, profiles, runs, fy, vouchers] = await Promise.all(['accounts', 'journal_entries', 'fixed_assets', 'custodies', 'bank_accounts', 'bank_recs', 'payroll_profiles', 'payroll_runs', 'fiscal_years', 'vouchers'].map(L));
  LG.data = { accounts, entries: entries.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : (a.number || 0) - (b.number || 0))), assets, cust, banks, recs, profiles, runs, fy, vouchers };
}
async function acEnsureSetup() {
  if ((LG.data.accounts || []).length || !can('finance')) return;
  for (const a of acDefaultChart()) await RDB.insert('accounts', a);
  if (!LG.data.banks.length) await RDB.insert('bank_accounts', { name: 'الحساب الجاري', bank: CONFIG.bankName || '', iban: '', account_code: SYS.bank, active: true });
  await acLoad();
  if (canReviewFin()) await acSeedHistory();
  await acLoad(); rToast('تم تجهيز دليل الحسابات والأرصدة الحقيقية من القوائم المراجَعة');
}
/* ═════════ بيانات السنوات السابقة: قيود من القوائم المالية المراجَعة للعميل (config.js ← org.finance.history) ═════════
 * قيود إجمالية لكل سنة تعيد إنتاج قائمة المركز المالي وقائمة الأنشطة والتدفقات النقدية كما وردت حرفياً،
 * ثم قيد إقفال وقفل السنة — فتستلم الجمعية النظام وتاريخها المالي موجود، وتبدأ 2026 من أرصدتها الحقيقية. */
/* سجل السنوات السابقة لكل عميل في config.js ← org.finance.history (اختياري) — المحرّك هنا عام */
const AC_HIST = ((ORG_CFG.finance || {}).history) || null;
async function acSeedHistory() {
  if (!AC_HIST || !AC_HIST.years) return;
  const YEARS = Object.keys(AC_HIST.years).map(Number).sort(), LAST = YEARS[YEARS.length - 1];
  if (LG.data.entries.some(e => e.status !== 'void' && acYearOf(e.date) <= LAST)) return;
  const L = (a, d, c, m) => ({ a, d: d || 0, c: c || 0, f: 'u', p: null, m: m || '' });
  const post = (date, memo, lines, sid) => acSave({ date, source: 'manual', source_id: sid, memo, status: 'posted', attachment_url: '', lines: lines.filter(l => l.d || l.c) });
  for (const y of YEARS) {
    const A = AC_HIST.years[y], D = A.date, ref = ' — ' + A.src;
    const revT = Object.values(A.rev).reduce((s, v) => s + v, 0), expT = Object.values(A.exp).reduce((s, v) => s + v, 0);
    await post(D, `إيرادات ومكاسب ${y}` + ref, [L(SYS.bank, revT)].concat(Object.entries(A.rev).map(([k, v]) => L(acCatAcc(k), 0, v, FIN_REVENUE.find(c => c.key === k).name))), `audit-${y}-rev`);
    const prepaidUsed = Math.max(0, -A.prepaidChange);
    await post(D, `مصروفات ${y} (عدا الإهلاك ونهاية الخدمة)` + ref, Object.entries(A.exp).map(([k, v]) => L(acCatAcc(k), v, 0, finCat(k).name)).concat([L(SYS.accrued, 0, A.accruedNew, 'مصروفات مستحقة آخر السنة'), L(SYS.prepaid, 0, prepaidUsed, 'إطفاء مصروفات مدفوعة مقدماً'), L(SYS.bank, 0, expT - A.accruedNew - prepaidUsed)]), `audit-${y}-exp`);
    if (A.accruedPaid) await post(D, `سداد المصروفات المستحقة من ${y - 1}` + ref, [L(SYS.accrued, A.accruedPaid), L(SYS.bank, 0, A.accruedPaid)], `audit-${y}-accr`);
    const pre = Math.max(0, A.prepaidChange);
    if (pre || A.vatChange) await post(D, `دفعات مقدمة وضريبة قيمة مضافة مستردة ${y}` + ref, [L(SYS.prepaid, pre), L(SYS.vat, A.vatChange), L(SYS.bank, 0, pre + A.vatChange)], `audit-${y}-cur`);
    const ppeT = Object.values(A.ppe).reduce((s, v) => s + v, 0);
    await post(D, `إضافات الممتلكات والآلات والمعدات ${y}` + ref, Object.entries(A.ppe).map(([k, v]) => L(ASSET_CATS[k].a, v, 0, ASSET_CATS[k].t)).concat([L(SYS.bank, 0, ppeT - A.donatedPPE), L(SYS.naU, 0, A.donatedPPE, 'ممتلكات متبرع بها')]), `audit-${y}-ppe`);
    const depT = Object.values(A.dep).reduce((s, v) => s + v, 0);
    await post(D, `إهلاك الممتلكات والآلات والمعدات ${y}` + ref, [L(SYS.dep, depT)].concat(Object.entries(A.dep).map(([k, v]) => L(ASSET_CATS[k].dep, 0, v, ASSET_CATS[k].t))), `audit-${y}-dep`);
    if (A.eos) await post(D, `مخصص مكافأة نهاية الخدمة ${y}` + ref, [L(acCatAcc('ad_eos'), A.eos), L(SYS.eos, 0, A.eos)], `audit-${y}-eos`);
    await acCloseYearCore(y);
  }
  // سجل الأصول حسب الفئات بأرصدة آخر سنة مراجَعة (التكلفة ومجمع الإهلاك)
  const C = AC_HIST.assets || {};
  if (!LG.data.assets.length) for (const [cat, [cost, dep, pd]] of Object.entries(C)) await RDB.insert('fixed_assets', { code: 'FA-' + cat.slice(0, 3).toUpperCase() + '-01', name: ASSET_CATS[cat].t + ' — رصيد ' + LAST, category: cat, location: AC_HIST.location || '', purchase_date: pd, cost, salvage: 0, rate: 10, acc_dep: dep, dep_until: LAST + '-12-31', status: 'active', notes: 'من إيضاح الممتلكات في القوائم المالية المراجَعة — يمكن تفصيله إلى أصول فردية', supplier: '', model: '', maintenance: 0, disposal_reason: '' });
}

/* ═════════ حفظ القيود والترحيل ═════════ */
function acCheck(e) {
  const d = e.lines.reduce((s, l) => s + Number(l.d || 0), 0), c = e.lines.reduce((s, l) => s + Number(l.c || 0), 0);
  if (e.lines.some(l => !l.a || !acAcc(l.a) || acAcc(l.a).is_group)) return 'كل سطر يحتاج حساباً تفصيلياً من الدليل';
  if (e.lines.some(l => Number(l.d || 0) && Number(l.c || 0))) return 'السطر الواحد إما مدين أو دائن';
  if (Math.round(d * 100) !== Math.round(c * 100)) return `القيد غير متوازن: المدين ${sar(d)} ≠ الدائن ${sar(c)}`;
  if (!d) return 'القيد فارغ';
  if (acYearClosed(acYearOf(e.date)) && e.source !== 'closing') return 'السنة المالية ' + acYearOf(e.date) + ' مقفلة';
  return '';
}
const acYearClosed = y => (LG.data.fy || []).some(f => +f.year === +y && f.status === 'closed');
async function acSave(e, id) {
  e.lines = e.lines.map(l => ({ a: l.a, d: Math.round(Number(l.d || 0) * 100) / 100, c: Math.round(Number(l.c || 0) * 100) / 100, f: l.f === 'r' ? 'r' : 'u', p: l.p || null, m: l.m || '', party: l.party || '' }));
  if (e.status === 'posted') { const err = acCheck(e); if (err) throw new Error(err); }
  e.total = e.lines.reduce((s, l) => s + l.d, 0);
  if (!acLive()) {   // في الوضع التجريبي نحاكي الـtrigger: الترقيم والمرحِّل
    if (!id) { const y = acYearOf(e.date); e.number = 1 + Math.max(0, ...LG.data.entries.filter(x => acYearOf(x.date) === y).map(x => x.number || 0)); e.created_by = ME.id; }
    if (e.status === 'posted') { e.posted_by = ME.id; e.posted_at = new Date().toISOString(); }
  }
  const r = id ? await RDB.update('journal_entries', id, e) : await RDB.insert('journal_entries', e);
  if (id) LG.data.entries = LG.data.entries.map(x => x.id === id ? r : x); else LG.data.entries.push(r);
  return r;
}
const acBySource = (src, sid) => LG.data.entries.find(x => x.source === src && x.source_id === sid && x.status !== 'void');

/* ترحيل السندات آلياً — يُستدعى عند فتح المحاسبة وبعد كل حركة سند (لا يكرر: مفتاح المصدر فريد) */
function acVoucherEntry(v) {
  const amt = Number(v.amount || 0), f = v.fund === 'restricted' ? 'r' : 'u', p = v.program_id || null, m = (v.description || '') + (v.number ? ` — سند ${v.number}` : ''), party = v.party || '';
  const cat = acCatAcc(v.category); if (!cat || !amt) return null;
  const cashAcc = v.method === 'cash' ? SYS.cash : SYS.bank;
  const lines = v.kind === 'payment'
    ? [{ a: cat, d: amt, c: 0, f, p, m, party }, { a: cashAcc, d: 0, c: amt, f, p, m, party }]
    : [{ a: v.method === 'cash' && !v.deposited ? SYS.cash : SYS.bank, d: amt, c: 0, f, p, m, party }, { a: cat, d: 0, c: amt, f, p, m, party }];
  return { date: (v.kind === 'payment' ? String(v.paid_at || v.date).slice(0, 10) : v.date) || today(), source: 'voucher', source_id: v.id, memo: (v.kind === 'payment' ? 'سند صرف' : 'سند قبض') + ' رقم ' + (v.number || '—') + ' — ' + party, lines, status: 'posted', attachment_url: v.attachment_url || '' };
}
async function acSyncVouchers(quiet) {
  if (!can('finance') || !LG.data) return 0;
  let n = 0;
  for (const v of LG.data.vouchers) {
    const ready = (v.kind === 'payment' && v.status === 'paid') || (v.kind === 'receipt' && ['approved', 'paid'].includes(v.status));
    const posted = acBySource('voucher', v.id);
    try {
      if (ready && !posted) { const e = acVoucherEntry(v); if (e && !acYearClosed(acYearOf(e.date))) { await acSave(e); n++; } }
      // إيداع نقدية مقبوضة لاحقاً: من الصندوق إلى البنك
      if (ready && v.kind === 'receipt' && v.method === 'cash' && v.deposited && posted && posted.lines[0].a === SYS.cash && !acBySource('voucher', v.id + ':dep')) {
        await acSave({ date: v.deposited_at || today(), source: 'voucher', source_id: v.id + ':dep', memo: 'إيداع متحصلات سند قبض ' + (v.number || ''), status: 'posted', attachment_url: '', lines: [{ a: SYS.bank, d: +v.amount, c: 0, f: v.fund === 'restricted' ? 'r' : 'u' }, { a: SYS.cash, d: 0, c: +v.amount, f: v.fund === 'restricted' ? 'r' : 'u' }] }); n++;
      }
      // سند أُلغي بعد ترحيله ← قيد عكسي
      if (v.status === 'void' && posted && !acBySource('reversal', v.id)) { await acSave(acReverseOf(posted, 'إلغاء سند ' + (v.number || ''), v.id)); n++; }
    } catch (e) { if (!quiet) rToast('تعذّر ترحيل سند ' + (v.number || '') + ': ' + e.message, 1); }
  }
  return n;
}
function acReverseOf(e, why, sid) {
  const y = acYearOf(e.date), d = acYearClosed(y) ? today() : (today() < e.date ? e.date : today());
  return { date: d, source: 'reversal', source_id: sid || e.id, memo: 'قيد عكسي للقيد رقم ' + e.number + (why ? ' — ' + why : ''), status: 'posted', attachment_url: '', lines: e.lines.map(l => Object.assign({}, l, { d: l.c, c: l.d })) };
}

/* ═════════ محرّك الأرصدة ═════════ */
/* opt: { from, to, ex: [مصادر مستبعدة], fund, openingInBegin } */
function acLines(opt = {}) {
  const out = [];
  for (const e of LG.data.entries) {
    if (e.status !== 'posted') continue;
    if (opt.to && e.date > opt.to) continue;
    if (opt.from && e.date < opt.from) continue;
    if (opt.ex && opt.ex.includes(e.source)) continue;
    e.lines.forEach((l, i) => { if (!opt.fund || l.f === opt.fund) out.push({ e, i, a: l.a, d: +l.d || 0, c: +l.c || 0, f: l.f, p: l.p, m: l.m, party: l.party, date: e.date }); });
  }
  return out;
}
const acNet = (lines, pre) => lines.reduce((s, l) => s + (l.a.startsWith(pre) ? l.d - l.c : 0), 0);   // مدين − دائن
const acNatural = (code, net) => { const a = acAcc(code) || acAcc(code[0]) || { type: 'asset' }; return LG_TYPES[a.type].dr ? net : -net; };
/* رصيد حتى تاريخ (شامل)، بطبيعته */
const acBalTo = (code, to) => acNatural(code, acNet(acLines({ to }), code));
const acCashCodes = () => (LG.data.accounts || []).filter(a => a.cash && !a.is_group).map(a => a.code);
const acCashBal = to => { const L = acLines({ to }); return acCashCodes().reduce((s, c) => s + acNet(L, c), 0); };
/* قيم السنة: نطاق ورصيد البداية (القيد الافتتاحي لسنة البدء يُعامل كرصيد بداية) */
function acYearRange(y) { return { from: y + '-01-01', to: y + '-12-31' }; }
function acBeginLines(y) { const prev = acLines({ to: (y - 1) + '-12-31' }); return prev.concat(acLines({ from: y + '-01-01', to: y + '-12-31' }).filter(l => l.e.source === 'opening')); }
function acEndLines(y) { return acLines({ to: y + '-12-31' }); }
function acYearMoves(y, extraEx) { return acLines(Object.assign(acYearRange(y), { ex: ['opening'].concat(extraEx || []) })); }

/* ═════════ واجهة التطبيق ═════════ */
function acTabs() {
  const t = [{ id: 'dash', name: 'لوحة المحاسبة', icon: 'layout-dashboard' }, { id: 'journal', name: 'قيود اليومية', icon: 'notebook-pen' }, { id: 'chart', name: 'دليل الحسابات', icon: 'list-tree' },
    { id: 'ledger', name: 'دفتر الأستاذ', icon: 'book-open' }, { id: 'trial', name: 'ميزان المراجعة', icon: 'scale' }, { id: 'statements', name: 'القوائم المالية', icon: 'file-bar-chart' },
    { id: 'assets', name: 'الأصول الثابتة', icon: 'armchair' }, { id: 'custody', name: 'العهد', icon: 'wallet-cards' }, { id: 'banks', name: 'البنوك والتسويات', icon: 'landmark' },
    { id: 'payroll', name: 'الرواتب', icon: 'banknote' }, { id: 'years', name: 'السنة المالية', icon: 'calendar-check' }];
  return can('finance') ? t : t.filter(x => ['dash', 'ledger', 'trial', 'statements', 'assets'].includes(x.id));
}
async function renderLedgerApp() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  await acLoad(); await acEnsureSetup();
  const n = await acSyncVouchers(true); if (n) rToast('رُحّل ' + n + ' سنداً إلى القيود آلياً');
  if (!acTabs().find(t => t.id === LG.tab)) LG.tab = 'dash';
  acPaint();
}
function acGo(tab) { LG.tab = tab; if (CUR !== 'ledger') { go('ledger'); return; } acPaint(); }
function acPaint() {
  const body = { dash: acDash, journal: acJournal, chart: acChart, ledger: acLedger, trial: acTrial, statements: acStatements, assets: acAssets, custody: acCustody, banks: acBanks, payroll: acPayroll, years: acYears }[LG.tab] || acDash;
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>المحاسبة</h1><p class="r-sub" style="margin:4px 0 0">قيد مزدوج وفق معيار المنشآت غير الهادفة للربح — السندات تُرحَّل آلياً عند صرفها واعتمادها</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${can('finance') ? `<button class="btn btn-gold" onclick="acEntryModal()"><i data-lucide="plus"></i> قيد يومية</button>` : ''}</div></div>
    ${rTabs('ac', acTabs(), LG.tab, 'acGo')}<div id="acBody">${body()}</div></div>`;
  refreshIcons();
}
const acYearSel = (fn = 'acPaint()') => { const ys = Array.from(new Set([new Date().getFullYear(), ...LG.data.entries.map(e => acYearOf(e.date))])).filter(Boolean).sort((a, b) => b - a); return `<select onchange="LG.year=+this.value;${fn}">${ys.map(y => `<option${y === LG.year ? ' selected' : ''}>${y}</option>`).join('')}</select>`; };
const acPrintBtn = (box, title) => `<button class="btn btn-ghost btn-sm" onclick="acPrintBox('${box}','${esc(title)}')"><i data-lucide="printer"></i> طباعة</button>`;

/* ── لوحة المحاسبة ── */
function acDash() {
  const y = LG.year, now = today(), L = acLines({ to: now }), M = acYearMoves(y, ['closing']);
  const rev = -acNet(M, '4'), exp = acNet(M, '5');
  const restricted = -acNet(L.filter(l => l.f === 'r' && /^[345]/.test(l.a)), '');
  const drafts = LG.data.entries.filter(e => e.status === 'draft');
  const unposted = LG.data.vouchers.filter(v => ((v.kind === 'payment' && v.status === 'paid') || (v.kind === 'receipt' && ['approved', 'paid'].includes(v.status))) && !acBySource('voucher', v.id));
  const pm = acPrevMonth(), depDue = LG.data.assets.filter(a => a.status === 'active' && (!a.dep_until || a.dep_until < acMonthEnd(pm)) && Number(a.acc_dep) < Number(a.cost) - Number(a.salvage || 0));
  const overdue = LG.data.cust.filter(c => c.status === 'open' && c.kind === 'temporary' && c.due_at && c.due_at < now);
  const recMissing = LG.data.banks.filter(b => b.active !== false && !LG.data.recs.some(r => r.account_code === b.account_code && r.period === pm && r.status === 'approved'));
  const curP = now.slice(0, 7), payDue = LG.data.profiles.some(p => p.active !== false) && !LG.data.runs.some(r => r.period === curP);
  const alerts = [
    drafts.length && ['notebook-pen', `${drafts.length} قيد مسودة بانتظار الترحيل`, `LG.jst='draft';acGo('journal')`],
    unposted.length && ['refresh-cw', `${unposted.length} سند معتمد لم يُرحّل بعد`, `acSyncNow()`],
    depDue.length && ['armchair', `إهلاك ${depDue.length} أصل لم يُرحّل حتى نهاية ${pm}`, `acGo('assets')`],
    overdue.length && ['alarm-clock', `${overdue.length} عهدة مؤقتة تجاوزت موعد التسوية (10 أيام من انتهاء الغرض)`, `acGo('custody')`],
    recMissing.length && ['landmark', `التسوية البنكية لشهر ${pm} لم تُعتمد (${recMissing.map(b => esc(b.name)).join('، ')})`, `acGo('banks')`],
    payDue && ['banknote', `مسير رواتب ${curP} لم يُعدّ بعد — الصرف بحد أقصى يوم ${LG_PAYROLL.payDay}`, `acGo('payroll')`],
  ].filter(Boolean);
  const cashRows = acCashCodes().map(c => ({ c, v: acNet(L, c) })).filter(x => x.v);
  return `<div class="r-filters">${acYearSel()}</div>
  <div class="r-kpis">
    <div class="r-kpi static"><i data-lucide="landmark"></i><b class="sm">${acAmt(acCashBal(now))}</b><span>النقد وما في حكمه الآن</span></div>
    <div class="r-kpi static"><i data-lucide="arrow-down-to-line"></i><b class="sm">${acAmt(rev)}</b><span>الإيرادات ${y}</span></div>
    <div class="r-kpi static"><i data-lucide="arrow-up-from-line"></i><b class="sm">${acAmt(exp)}</b><span>المصروفات ${y}</span></div>
    <div class="r-kpi static"><i data-lucide="lock"></i><b class="sm">${acAmt(restricted)}</b><span>صافي الأصول المقيدة</span></div>
  </div>
  <div class="r-grid2">
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="bell-ring"></i> يحتاج إجراءك</h3></div>
      ${alerts.map(a => `<button class="r-row ac-alert" onclick="${a[2]}"><i data-lucide="${a[0]}"></i><span>${a[1]}</span><i data-lucide="chevron-left" class="r-chev"></i></button>`).join('') || '<p class="r-sub">كل شيء محدّث — لا قيود معلقة ولا تسويات متأخرة.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="wallet"></i> أرصدة النقد والبنوك</h3></div>
      ${cashRows.map(x => `<div class="r-row"><span>${esc(acName(x.c))}</span><b>${acAmt(x.v)} ر.س</b></div>`).join('') || '<p class="r-sub">لا أرصدة بعد.</p>'}
      <div class="r-row"><span>التغير في صافي الأصول ${y}</span><b style="color:${rev - exp < 0 ? 'var(--bad)' : 'inherit'}">${acAmt(rev - exp)} ر.س</b></div></div>
  </div>
  <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="history"></i> آخر القيود</h3><button class="link-btn" onclick="acGo('journal')">كل القيود</button></div>${acEntriesTable(LG.data.entries.slice(-8).reverse())}</div>`;
}
async function acSyncNow() { const n = await acSyncVouchers(); rToast(n ? 'رُحّل ' + n + ' قيد' : 'لا سندات بانتظار الترحيل'); acPaint(); }

/* ── قيود اليومية ── */
function acEntriesTable(list) {
  return `<div style="overflow:auto"><table class="r-table"><thead><tr><th>رقم</th><th>التاريخ</th><th>البيان</th><th>المصدر</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>
  ${list.map(e => `<tr onclick="acEntryView('${e.id}')" style="cursor:pointer"><td><b>${e.number || '—'}</b></td><td>${fmtD(e.date)}</td><td>${esc(e.memo)}</td><td><span class="r-chip" style="--c:#41747F">${LG_SRC[e.source] || e.source}</span></td><td><b>${sar(e.total)}</b></td>
    <td>${e.status === 'posted' ? '<span class="r-badge" style="--c:#22c55e">مرحّل</span>' : e.status === 'draft' ? '<span class="r-badge" style="--c:#f59e0b">مسودة</span>' : '<span class="r-badge" style="--c:#94a3b8">ملغى</span>'}</td></tr>`).join('') || `<tr><td colspan="6">${rEmpty('notebook-pen', 'لا قيود.')}</td></tr>`}</tbody></table></div>`;
}
function acJournal() {
  const q = LG.jq.trim(), list = LG.data.entries.filter(e => acYearOf(e.date) === LG.year && (!LG.jst || e.status === LG.jst) && (!q || (e.memo + ' ' + e.number + ' ' + e.lines.map(l => l.a + ' ' + (l.m || '') + ' ' + (l.party || '')).join(' ')).includes(q))).slice().reverse();
  return `<div class="r-filters">${acYearSel()}<div class="r-seg">${[['', 'الكل'], ['draft', 'مسودات'], ['posted', 'مرحّلة'], ['void', 'ملغاة']].map(([k, t]) => `<button class="${LG.jst === k ? 'on' : ''}" onclick="LG.jst='${k}';acPaint()">${t}</button>`).join('')}</div>
    <input placeholder="بحث في القيود…" value="${esc(LG.jq)}" onchange="LG.jq=this.value;acPaint()" style="max-width:220px">
    ${can('finance') ? `<button class="btn btn-ghost btn-sm" onclick="acSyncNow()"><i data-lucide="refresh-cw"></i> ترحيل السندات</button>` : ''}
    <button class="btn btn-ghost btn-sm" onclick="acExportJournal()"><i data-lucide="download"></i> تصدير اليومية</button></div>
  <div class="card" style="padding:0">${acEntriesTable(list)}</div>`;
}
function acExportJournal() {
  const rows = [['رقم القيد', 'التاريخ', 'البيان', 'المصدر', 'الحالة', 'رقم الحساب', 'اسم الحساب', 'مدين', 'دائن', 'الأموال', 'البرنامج', 'البيان التفصيلي']];
  LG.data.entries.filter(e => acYearOf(e.date) === LG.year).forEach(e => e.lines.forEach(l => rows.push([e.number, e.date, e.memo, LG_SRC[e.source], e.status, l.a, acName(l.a), l.d, l.c, l.f === 'r' ? 'مقيدة' : 'غير مقيدة', programName(l.p), l.m])));
  acCSV(rows, 'دفتر-اليومية-' + LG.year);
}
function acCSV(rows, name) {
  const csv = '﻿' + rows.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name + '.csv'; a.click();
}
function acLineRow(l, i) {
  return `<div class="ac-line" data-i="${i}"><select class="ac-a" onchange="acLinesLive()">${acAccOptions(l.a)}</select>
    <input class="ac-d" type="number" min="0" step="0.01" placeholder="مدين" value="${l.d || ''}" oninput="if(this.value)this.parentElement.querySelector('.ac-c').value='';acLinesLive()">
    <input class="ac-c" type="number" min="0" step="0.01" placeholder="دائن" value="${l.c || ''}" oninput="if(this.value)this.parentElement.querySelector('.ac-d').value='';acLinesLive()">
    <select class="ac-f"><option value="u">غير مقيدة</option><option value="r"${l.f === 'r' ? ' selected' : ''}>مقيدة</option></select>
    <select class="ac-p">${programOptions(l.p, 'بلا برنامج')}</select>
    <input class="ac-m" placeholder="البيان" value="${esc(l.m || '')}"><button type="button" class="x" onclick="this.parentElement.remove();acLinesLive()" title="حذف السطر">×</button></div>`;
}
function acReadLines() { return Array.from(document.querySelectorAll('#acLines .ac-line')).map(r => ({ a: r.querySelector('.ac-a').value, d: Number(r.querySelector('.ac-d').value || 0), c: Number(r.querySelector('.ac-c').value || 0), f: r.querySelector('.ac-f').value, p: r.querySelector('.ac-p').value || null, m: r.querySelector('.ac-m').value.trim() })).filter(l => l.a || l.d || l.c); }
function acLinesLive() {
  const L = acReadLines(), d = L.reduce((s, l) => s + l.d, 0), c = L.reduce((s, l) => s + l.c, 0), el = document.getElementById('acTot'); if (!el) return;
  const ok = Math.round(d * 100) === Math.round(c * 100) && d > 0;
  el.innerHTML = `<span>المدين <b>${sar(d)}</b></span><span>الدائن <b>${sar(c)}</b></span><span class="${ok ? 'ok' : 'bad'}">${ok ? 'متوازن ✓' : 'الفرق ' + sar(Math.abs(d - c))}</span>`;
}
function acEntryModal(id, preset) {
  const e = id ? LG.data.entries.find(x => x.id === id) : Object.assign({ date: today(), memo: '', lines: [{}, {}], attachment_url: '', source: 'manual', status: 'draft' }, preset || {});
  if (id && e.status !== 'draft') { acEntryView(id); return; }
  const save = async status => {
    const row = { date: fval('je_date'), memo: fval('je_memo'), attachment_url: fval('je_att'), lines: acReadLines(), status, source: e.source || 'manual' };
    if (e.source_id) row.source_id = e.source_id;
    if (!row.memo) { rToast('اكتب بيان القيد', 1); return; }
    if (!validUrl(row.attachment_url)) { rToast('رابط المستندات يجب أن يبدأ بـ https://', 1); return; }
    if (status === 'posted' && !canReviewFin()) { rToast('الترحيل صلاحية مراجِع المالية — احفظه مسودة', 1); return; }
    try { await acSave(row, id); closeModal(); rToast(status === 'posted' ? 'تم ترحيل القيد' : 'حُفظ القيد مسودة'); acPaint(); } catch (er) { rToast(er.message, 1); }
  };
  openModal((id ? 'تعديل قيد' : 'قيد يومية') + (e.number ? ' رقم ' + e.number : ''), `
    <div class="row2"><div class="field"><label>التاريخ</label><input type="date" id="je_date" value="${esc(e.date)}"></div>
      <div class="field"><label>المستندات المؤيدة (Google Drive)</label><input id="je_att" dir="ltr" value="${esc(e.attachment_url || '')}" placeholder="https://drive.google.com/…"></div></div>
    <div class="field"><label>البيان العام</label><input id="je_memo" value="${esc(e.memo)}" placeholder="مثال: إثبات إيجار المقر المستحق لشهر مارس"></div>
    <div class="ac-lhead"><span>الحساب</span><span>مدين</span><span>دائن</span><span>الأموال</span><span>البرنامج</span><span>البيان</span><span></span></div>
    <div id="acLines">${e.lines.map(acLineRow).join('')}</div>
    <button type="button" class="link-btn" onclick="document.getElementById('acLines').insertAdjacentHTML('beforeend',acLineRow({},Date.now()))">+ سطر</button>
    <div class="ac-tot" id="acTot"></div>
    <div class="r-hint">مستند القيد مسلسل من بداية السنة لنهايتها (اللائحة المالية). القيد المرحّل لا يُعدّل — يُلغى أو يُعكس.</div>`,
    () => save('draft'), id ? async () => { if (!confirm('حذف المسودة؟')) return; await RDB.remove('journal_entries', id); LG.data.entries = LG.data.entries.filter(x => x.id !== id); closeModal(); acPaint(); } : null);
  const m = document.querySelector('.modal'); if (m) m.style.maxWidth = '980px';
  const sb = document.getElementById('mSave'); if (sb) { sb.textContent = 'حفظ مسودة'; if (canReviewFin()) sb.insertAdjacentHTML('beforebegin', `<button class="btn btn-gold" id="jePost"><i data-lucide="check-check"></i> ترحيل</button>`); sb.className = 'btn btn-ghost'; }
  const pb = document.getElementById('jePost'); if (pb) pb.onclick = () => save('posted');
  acLinesLive(); refreshIcons();
}
function acEntryView(id) {
  const e = LG.data.entries.find(x => x.id === id); if (!e) return;
  const acts = [];
  if (e.status === 'draft' && can('finance')) acts.push(`<button class="btn btn-gold" onclick="closeModal();acEntryModal('${id}')">تعديل / ترحيل</button>`);
  if (e.status === 'posted' && canReviewFin() && !['closing'].includes(e.source) && !acBySource('reversal', e.id)) acts.push(`<button class="btn btn-ghost" onclick="acReverse('${id}')"><i data-lucide="undo-2"></i> قيد عكسي</button>`);
  if (e.status === 'posted' && canReviewFin() && e.source === 'manual' && !acYearClosed(acYearOf(e.date))) acts.push(`<button class="btn btn-ghost" style="color:var(--bad)" onclick="acVoid('${id}')">إلغاء القيد</button>`);
  const v = e.source === 'voucher' ? LG.data.vouchers.find(x => x.id === String(e.source_id).split(':')[0]) : null;
  document.getElementById('modalRoot').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:860px">
    <div class="modal-head"><h3>قيد يومية رقم ${e.number || '—'} — ${fmtD(e.date)}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body" id="acEntryBox"><p style="margin:0 0 10px"><b>${esc(e.memo)}</b></p>
      <table class="r-table r-fs"><thead><tr><th>الحساب</th><th>البيان</th><th>الأموال</th><th>مدين</th><th>دائن</th></tr></thead><tbody>
      ${e.lines.map(l => `<tr><td>${l.a} — ${esc(acName(l.a))}${l.p ? `<div class="r-sub">${esc(programName(l.p))}</div>` : ''}</td><td>${esc(l.m || '')}${l.party ? `<div class="r-sub">${esc(l.party)}</div>` : ''}</td><td>${l.f === 'r' ? 'مقيدة' : 'غير مقيدة'}</td><td>${l.d ? sar(l.d) : ''}</td><td>${l.c ? sar(l.c) : ''}</td></tr>`).join('')}
      <tr class="tot"><td colspan="3">الإجمالي</td><td>${sar(e.lines.reduce((s, l) => s + +l.d, 0))}</td><td>${sar(e.lines.reduce((s, l) => s + +l.c, 0))}</td></tr></tbody></table>
      <dl class="r-dl" style="margin-top:12px"><dt>المصدر</dt><dd>${LG_SRC[e.source] || e.source}${v ? ` — <button class="link-btn" onclick="closeModal();FIN.tab='${v.kind}';go('finance')">${v.kind === 'payment' ? 'سند صرف' : 'سند قبض'} ${v.number || ''}</button>` : ''}</dd>
        <dt>أعدّه</dt><dd>${esc(memberName(e.created_by))}</dd><dt>رحّله</dt><dd>${e.posted_by ? esc(memberName(e.posted_by)) + ' · ' + fmtD(e.posted_at) : '—'}</dd>
        <dt>المستندات</dt><dd>${e.attachment_url ? linkChip({ url: e.attachment_url, title: 'المستندات المؤيدة' }) : '—'}</dd>${e.void_reason ? `<dt>سبب الإلغاء</dt><dd>${esc(e.void_reason)}</dd>` : ''}</dl></div>
    <div class="modal-foot" style="flex-wrap:wrap">${acts.join('')}<button class="btn btn-ghost" style="margin-right:auto" onclick="acPrintEntry('${id}')"><i data-lucide="printer"></i> طباعة مستند القيد</button></div></div></div>`;
  refreshIcons();
}
async function acReverse(id) { const e = LG.data.entries.find(x => x.id === id); const why = prompt('سبب القيد العكسي:'); if (why === null) return; try { await acSave(acReverseOf(e, why)); closeModal(); rToast('أُنشئ القيد العكسي'); acPaint(); } catch (er) { rToast(er.message, 1); } }
async function acVoid(id) { const r = prompt('سبب إلغاء القيد (يحفظ للمراجعة):'); if (!r) return; try { await acSave({ status: 'void', void_reason: r, lines: LG.data.entries.find(x => x.id === id).lines }, id); closeModal(); acPaint(); } catch (er) { rToast(er.message, 1); } }

/* ── دليل الحسابات ── */
function acChart() {
  const L = acLines({ to: today() });
  const rows = (LG.data.accounts || []).slice().sort((a, b) => a.code.localeCompare(b.code)).map(a => {
    const bal = acNatural(a.code, acNet(L, a.code)), lvl = a.code.length === 1 ? 0 : a.code.length === 2 ? 1 : 2;
    return `<tr class="${a.is_group ? 'grp' : ''}${a.active === false ? ' off' : ''}"><td style="padding-inline-start:${10 + lvl * 22}px">${a.is_group ? '<b>' : ''}${a.code} — ${esc(a.name)}${a.is_group ? '</b>' : ''}${a.contra ? ' <span class="r-chip" style="--c:#94a3b8">مقابل</span>' : ''}${a.cash ? ' <span class="r-chip" style="--c:#41747F">نقدية</span>' : ''}${a.category ? ' <span class="r-chip" style="--c:#CAB05F" title="يُرحّل إليه بند السندات">' + esc(finCat(a.category).name || a.category) + '</span>' : ''}</td>
      <td>${LG_TYPES[a.type].t}</td><td><b>${acAmt(bal)}</b></td><td>${!a.is_group ? `<button class="link-btn" onclick="LG.acct='${a.code}';acGo('ledger')">الأستاذ</button>` : ''} ${can('finance') ? `<button class="link-btn" onclick="acAccountModal('${a.code}')">تعديل</button>` : ''}</td></tr>`;
  }).join('');
  return `<div class="r-filters">${can('finance') ? `<button class="btn btn-gold btn-sm" onclick="acAccountModal()"><i data-lucide="plus"></i> حساب جديد</button>` : ''}<span class="r-sub">الترقيم هرمي: 1 أصول · 2 التزامات · 3 صافي أصول · 4 إيرادات · 5 مصروفات. الحساب التجميعي لا يُقيد عليه مباشرة.</span></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table ac-tree"><thead><tr><th>الحساب</th><th>النوع</th><th>الرصيد الحالي</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function acAccountModal(code) {
  const a = code ? acAcc(code) : { code: '', name: '', parent: '', type: 'expense', is_group: false, contra: false, category: '', cash: false, active: true };
  const groups = (LG.data.accounts || []).filter(x => x.is_group).sort((x, y) => x.code.localeCompare(y.code));
  openModal(code ? 'تعديل حساب ' + code : 'حساب جديد', `
    <div class="row3"><div class="field"><label>رقم الحساب</label><input id="ac_code" dir="ltr" value="${esc(a.code)}"${code ? ' disabled' : ''} placeholder="مثال: 5312"></div>
      <div class="field" style="grid-column:span 2"><label>اسم الحساب</label><input id="ac_name" value="${esc(a.name)}"></div></div>
    <div class="row2"><div class="field"><label>الحساب الأب</label><select id="ac_parent">${groups.map(g => `<option value="${g.code}"${g.code === a.parent ? ' selected' : ''}>${g.code} — ${esc(g.name)}</option>`).join('')}</select></div>
      <div class="field"><label>ربط ببند السندات (اختياري)</label><select id="ac_cat"><option value="">—</option>${FIN_REVENUE.concat(FIN_EXPENSE).map(c => `<option value="${c.key}"${c.key === a.category ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div></div>
    <label class="r-check"><input type="checkbox" id="ac_group"${a.is_group ? ' checked' : ''}> حساب تجميعي (لا يُقيد عليه)</label>
    <label class="r-check"><input type="checkbox" id="ac_cash"${a.cash ? ' checked' : ''}> نقد وما في حكمه (صندوق/بنك)</label>
    <label class="r-check"><input type="checkbox" id="ac_contra"${a.contra ? ' checked' : ''}> حساب مقابل (مثل مجمع الإهلاك)</label>
    <label class="r-check"><input type="checkbox" id="ac_active"${a.active !== false ? ' checked' : ''}> نشط</label>
    <div class="r-hint">رقم الحساب الفرعي يبدأ برقم أبيه (مثال: تحت 53 ← 5312) لتعمل الأرصدة التجميعية والقوائم تلقائياً.</div>`,
    async () => {
      const parent = fval('ac_parent'), p = acAcc(parent), row = { name: fval('ac_name'), parent, type: p ? p.type : a.type, is_group: fval('ac_group'), cash: fval('ac_cash'), contra: fval('ac_contra'), active: fval('ac_active'), category: fval('ac_cat') };
      if (!code) { row.code = fval('ac_code'); if (!/^\d+$/.test(row.code) || !row.code.startsWith(parent)) { rToast('رقم الحساب أرقام فقط ويبدأ برقم الحساب الأب ' + parent, 1); return; } if (acAcc(row.code)) { rToast('الرقم مستخدم', 1); return; } }
      if (!row.name) return;
      try { if (code) await RDB.update('accounts', a.id, row); else await RDB.insert('accounts', Object.assign(row, { sort: 999 })); closeModal(); await acLoad(); acPaint(); } catch (e) { rToast(e.message, 1); }
    }, code && !acLines().some(l => l.a === code) && !a.is_group ? async () => { if (!confirm('حذف الحساب؟')) return; await RDB.remove('accounts', a.id); closeModal(); await acLoad(); acPaint(); } : null);
}

/* ── دفتر الأستاذ ── */
function acLedger() {
  const y = LG.year, from = LG.from || y + '-01-01', to = LG.to || y + '-12-31', code = LG.acct || SYS.bank, a = acAcc(code);
  const open = acNatural(code, acNet(acLines({ to: dayBefore(from) }), code));
  const L = acLines({ from, to }).filter(l => l.a.startsWith(code));
  let run = open;
  const rows = L.map(l => { run += acNatural(code, l.d - l.c); return `<tr onclick="acEntryView('${l.e.id}')" style="cursor:pointer"><td>${fmtD(l.date)}</td><td>${l.e.number}</td><td>${esc(l.m || l.e.memo)}${l.party ? `<div class="r-sub">${esc(l.party)}</div>` : ''}</td><td>${l.a !== code ? l.a : ''}${l.f === 'r' ? ' <span class="r-chip" style="--c:#8A6D3B">مقيد</span>' : ''}</td><td>${l.d ? sar(l.d) : ''}</td><td>${l.c ? sar(l.c) : ''}</td><td><b>${acAmt(run)}</b></td></tr>`; }).join('');
  const td = L.reduce((s, l) => s + l.d, 0), tc = L.reduce((s, l) => s + l.c, 0);
  return `<div class="r-filters"><select onchange="LG.acct=this.value;acPaint()" style="max-width:340px">${(LG.data.accounts || []).slice().sort((x, z) => x.code.localeCompare(z.code)).map(x => `<option value="${x.code}"${x.code === code ? ' selected' : ''}>${x.is_group ? '▸ ' : ''}${x.code} — ${esc(x.name)}</option>`).join('')}</select>
    <label class="r-sub">من <input type="date" value="${from}" onchange="LG.from=this.value;acPaint()"></label><label class="r-sub">إلى <input type="date" value="${to}" onchange="LG.to=this.value;acPaint()"></label>
    ${acPrintBtn('acLedgerBox', 'دفتر الأستاذ')}<button class="btn btn-ghost btn-sm" onclick="acExportLedger()"><i data-lucide="download"></i> CSV</button></div>
  <div class="card r-card" id="acLedgerBox"><div class="r-card-h"><h3>${code} — ${esc(a ? a.name : '')}</h3><span class="r-sub">${fmtD(from)} — ${fmtD(to)}</span></div>
  <div style="overflow:auto"><table class="r-table r-fs"><thead><tr><th>التاريخ</th><th>القيد</th><th>البيان</th><th>حساب فرعي</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>
    <tr class="sec"><td colspan="6">الرصيد الافتتاحي</td><td><b>${acAmt(open)}</b></td></tr>${rows || `<tr><td colspan="7" class="r-sub">لا حركات في الفترة.</td></tr>`}
    <tr class="tot"><td colspan="4">إجمالي الحركة / الرصيد الختامي</td><td>${sar(td)}</td><td>${sar(tc)}</td><td>${acAmt(run)}</td></tr></tbody></table></div></div>`;
}
const dayBefore = d => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() - 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
function acExportLedger() {
  const y = LG.year, from = LG.from || y + '-01-01', to = LG.to || y + '-12-31', code = LG.acct || SYS.bank;
  acCSV([['التاريخ', 'رقم القيد', 'البيان', 'الحساب', 'مدين', 'دائن', 'الأموال', 'البرنامج']].concat(acLines({ from, to }).filter(l => l.a.startsWith(code)).map(l => [l.date, l.e.number, l.m || l.e.memo, l.a, l.d, l.c, l.f === 'r' ? 'مقيدة' : 'غير مقيدة', programName(l.p)])), 'أستاذ-' + code + '-' + y);
}

/* ── ميزان المراجعة ── */
function acTrialData(y, withClose) {
  const B = acBeginLines(y), M = acYearMoves(y, withClose ? [] : ['closing']);
  return (LG.data.accounts || []).slice().sort((a, b) => a.code.localeCompare(b.code)).map(a => {
    const ob = acNet(B, a.code), md = M.filter(l => l.a.startsWith(a.code)).reduce((s, l) => s + l.d, 0), mc = M.filter(l => l.a.startsWith(a.code)).reduce((s, l) => s + l.c, 0), cb = ob + md - mc;
    return { a, ob, md, mc, cb };
  });
}
function acTrial() {
  const y = LG.year, R = acTrialData(y, LG.tbClose).filter(r => LG.zero || r.ob || r.md || r.mc), leaf = R.filter(r => !r.a.is_group);
  const sum = k => leaf.reduce((s, r) => s + r[k], 0), dr = v => v > 0 ? sar(v) : '', cr = v => v < 0 ? sar(-v) : '';
  const T = { obD: leaf.reduce((s, r) => s + Math.max(r.ob, 0), 0), obC: leaf.reduce((s, r) => s + Math.max(-r.ob, 0), 0), md: sum('md'), mc: sum('mc'), cbD: leaf.reduce((s, r) => s + Math.max(r.cb, 0), 0), cbC: leaf.reduce((s, r) => s + Math.max(-r.cb, 0), 0) };
  const ok = Math.round(T.cbD * 100) === Math.round(T.cbC * 100);
  return `<div class="r-filters">${acYearSel()}<label class="r-check"><input type="checkbox"${LG.tbClose ? ' checked' : ''} onchange="LG.tbClose=this.checked;acPaint()"> بعد قيد الإقفال</label><label class="r-check"><input type="checkbox"${LG.zero ? ' checked' : ''} onchange="LG.zero=this.checked;acPaint()"> إظهار الحسابات الصفرية</label>
    ${acPrintBtn('acTrialBox', 'ميزان المراجعة')}<button class="btn btn-ghost btn-sm" onclick="acExportTrial()"><i data-lucide="download"></i> CSV</button></div>
  <div class="card r-card" id="acTrialBox"><div class="r-card-h"><h3>ميزان المراجعة للسنة المنتهية في 31 ديسمبر ${y}</h3><span class="r-badge" style="--c:${ok ? '#22c55e' : '#ef4444'}">${ok ? 'متوازن' : 'غير متوازن'}</span></div>
  <div style="overflow:auto"><table class="r-table r-fs ac-tb"><thead><tr><th rowspan="2">الحساب</th><th colspan="2">الرصيد الافتتاحي</th><th colspan="2">حركة السنة</th><th colspan="2">الرصيد الختامي</th></tr><tr><th>مدين</th><th>دائن</th><th>مدين</th><th>دائن</th><th>مدين</th><th>دائن</th></tr></thead><tbody>
  ${R.map(r => `<tr class="${r.a.is_group ? 'grp' : ''}"><td style="padding-inline-start:${10 + (r.a.code.length === 1 ? 0 : r.a.code.length === 2 ? 1 : 2) * 18}px">${r.a.code} — ${esc(r.a.name)}</td><td>${dr(r.ob)}</td><td>${cr(r.ob)}</td><td>${r.md ? sar(r.md) : ''}</td><td>${r.mc ? sar(r.mc) : ''}</td><td>${dr(r.cb)}</td><td>${cr(r.cb)}</td></tr>`).join('')}
  <tr class="tot"><td>الإجمالي</td><td>${sar(T.obD)}</td><td>${sar(T.obC)}</td><td>${sar(T.md)}</td><td>${sar(T.mc)}</td><td>${sar(T.cbD)}</td><td>${sar(T.cbC)}</td></tr></tbody></table></div></div>`;
}
function acExportTrial() { acCSV([['رقم الحساب', 'اسم الحساب', 'افتتاحي', 'حركة مدين', 'حركة دائن', 'ختامي']].concat(acTrialData(LG.year, LG.tbClose).filter(r => !r.a.is_group).map(r => [r.a.code, r.a.name, r.ob, r.md, r.mc, r.cb])), 'ميزان-المراجعة-' + LG.year); }

/* ── القوائم المالية (بنفس عرض القوائم المراجَعة، مع سنة المقارنة) ── */
function acPosition(y) {
  const E = acEndLines(y), bal = pre => acNet(E, pre);
  const leaves = pre => acLeaves(a => a.code.startsWith(pre)).map(a => ({ a, v: acNatural(a.code, bal(a.code)) }));
  const cash = acCashCodes().reduce((s, c) => s + bal(c), 0);
  const curOther = leaves('11').filter(x => !x.a.cash && x.v);
  const ppe = bal('12');
  const curL = leaves('21').filter(x => x.v), ncL = leaves('22').filter(x => x.v);
  const assets = bal('1'), liab = -bal('2'), na = assets - liab;
  const naR = -E.filter(l => l.f === 'r' && /^[345]/.test(l.a)).reduce((s, l) => s + l.d - l.c, 0);
  return { cash, curOther, ppe, curL, ncL, assets, liab, na, naR, naU: na - naR, curA: cash + curOther.reduce((s, x) => s + x.v, 0) };
}
function acActivities(y) {
  const M = acYearMoves(y, ['closing']), by = (pre, f) => M.filter(l => l.a.startsWith(pre) && l.f === f).reduce((s, l) => s + l.d - l.c, 0);
  const rev = acLeaves(a => a.type === 'revenue').map(a => ({ n: a.name, u: -by(a.code, 'u'), r: -by(a.code, 'r') })).filter(x => x.u || x.r);
  const groups = (LG.data.accounts || []).filter(a => a.type === 'expense' && a.code.length === 2).sort((a, b) => a.code.localeCompare(b.code)).map(g => ({ t: g.name, items: acLeaves(a => a.code.startsWith(g.code)).map(a => ({ n: a.name, u: by(a.code, 'u'), r: by(a.code, 'r') })).filter(x => x.u || x.r) })).filter(g => g.items.length);
  const tot = a => a.reduce((x, i) => ({ u: x.u + i.u, r: x.r + i.r }), { u: 0, r: 0 });
  return { rev, groups, tr: tot(rev), te: tot(groups.flatMap(g => g.items)) };
}
function acCashFlow(y) {
  const B = acBeginLines(y), E = acEndLines(y), M = acYearMoves(y, ['closing']);
  const ch = pre => acNet(E, pre) - acNet(B, pre);
  const A = acActivities(y), dNA = (A.tr.u + A.tr.r) - (A.te.u + A.te.r);
  const dep = M.filter(l => l.a === SYS.dep).reduce((s, l) => s + l.d - l.c, 0), loss = M.filter(l => l.a === SYS.disposal).reduce((s, l) => s + l.d - l.c, 0);
  const wc = acLeaves(a => a.code.startsWith('11') && !a.cash).map(a => ({ n: a.name, v: -ch(a.code) })).concat(acLeaves(a => a.code.startsWith('2')).map(a => ({ n: a.name, v: -ch(a.code) }))).filter(x => Math.abs(x.v) >= .005);
  const cashSet = acCashCodes(), byEntry = {};
  M.forEach(l => { (byEntry[l.e.id] = byEntry[l.e.id] || []).push(l); });
  let inv = 0; Object.values(byEntry).forEach(ls => { if (ls.some(l => l.a.startsWith('12'))) inv += ls.filter(l => cashSet.includes(l.a)).reduce((s, l) => s + l.d - l.c, 0); });
  const cashB = cashSet.reduce((s, c) => s + acNet(B, c), 0), cashE = cashSet.reduce((s, c) => s + acNet(E, c), 0);
  const opInd = dNA + dep + loss + wc.reduce((s, x) => s + x.v, 0), other = (cashE - cashB - inv) - opInd;
  return { dNA, dep, loss, wc, op: opInd + other, other, inv, cashB, cashE };
}
function acStatements() {
  const y = LG.year, p = y - 1, hasPrev = LG.data.entries.some(e => e.status === 'posted' && acYearOf(e.date) <= p);
  const sub = `<div class="r-seg">${[['position', 'المركز المالي'], ['activities', 'الأنشطة'], ['cashflow', 'التدفقات النقدية']].map(([k, t]) => `<button class="${LG.st === k ? 'on' : ''}" onclick="LG.st='${k}';acPaint()">${t}</button>`).join('')}</div>`;
  const col = (a, b) => `<td>${acAmt(a)}</td>${hasPrev ? `<td>${acAmt(b)}</td>` : ''}`, head = `<th>${y}</th>${hasPrev ? `<th>${p}</th>` : ''}`, span = hasPrev ? 3 : 2;
  let html = '';
  if (LG.st === 'position') {
    const A = acPosition(y), B = acPosition(p);
    const r = (n, a, b, cls) => `<tr${cls ? ` class="${cls}"` : ''}><td>${n}</td>${col(a, b)}</tr>`, sec = t => `<tr class="sec"><td colspan="${span}">${t}</td></tr>`;
    const pick = (list, code) => (list.find(x => x.a.code === code) || { v: 0 }).v;
    html = `<h3>قائمة المركز المالي كما في 31 ديسمبر ${y}</h3><table class="r-table r-fs"><thead><tr><th>باللاير السعودي</th>${head}</tr></thead><tbody>
      ${sec('الأصول')}<tr class="grp"><td colspan="${span}">الأصول المتداولة</td></tr>${r('النقد وما في حكمه', A.cash, B.cash)}
      ${Array.from(new Set(A.curOther.concat(B.curOther).map(x => x.a.code))).map(c => r(esc(acName(c)), pick(A.curOther, c), pick(B.curOther, c))).join('')}
      ${r('إجمالي الأصول المتداولة', A.curA, B.curA, 'tot')}<tr class="grp"><td colspan="${span}">الأصول غير المتداولة</td></tr>${r('ممتلكات وآلات ومعدات — بالصافي', A.ppe, B.ppe)}${r('إجمالي الأصول غير المتداولة', A.ppe, B.ppe, 'tot')}
      ${r('إجمالي الأصول', A.assets, B.assets, 'tot')}
      ${sec('الالتزامات وصافي الأصول')}<tr class="grp"><td colspan="${span}">الالتزامات المتداولة</td></tr>
      ${Array.from(new Set(A.curL.concat(B.curL).map(x => x.a.code))).map(c => r(esc(acName(c)), pick(A.curL, c), pick(B.curL, c))).join('')}
      ${r('إجمالي الالتزامات المتداولة', A.curL.reduce((s, x) => s + x.v, 0), B.curL.reduce((s, x) => s + x.v, 0), 'tot')}
      <tr class="grp"><td colspan="${span}">الالتزامات غير المتداولة</td></tr>${Array.from(new Set(A.ncL.concat(B.ncL).map(x => x.a.code))).map(c => r(esc(acName(c)), pick(A.ncL, c), pick(B.ncL, c))).join('')}
      ${r('إجمالي الالتزامات غير المتداولة', A.ncL.reduce((s, x) => s + x.v, 0), B.ncL.reduce((s, x) => s + x.v, 0), 'tot')}
      <tr class="grp"><td colspan="${span}">صافي الأصول</td></tr>${r('صافي الأصول غير المقيدة', A.naU, B.naU)}${r('صافي الأصول المقيدة', A.naR, B.naR)}${r('إجمالي صافي الأصول', A.na, B.na, 'tot')}
      ${r('إجمالي الالتزامات وصافي الأصول', A.liab + A.na, B.liab + B.na, 'tot')}</tbody></table>`;
  } else if (LG.st === 'activities') {
    const A = acActivities(y), PA = hasPrev ? acActivities(p) : null;
    const pt = (n, gi) => { if (!PA) return null; const all = (PA.rev.concat(PA.groups.flatMap(g => g.items))).find(x => x.n === n); return all ? all.u + all.r : 0; };
    const row = (n, u, r, cls, prev) => `<tr${cls ? ` class="${cls}"` : ''}><td>${n}</td><td>${acAmt(u)}</td><td>${acAmt(r)}</td><td><b>${acAmt(u + r)}</b></td>${PA ? `<td>${acAmt(prev || 0)}</td>` : ''}</tr>`;
    const cs = PA ? 5 : 4, sec = t => `<tr class="sec"><td colspan="${cs}">${t}</td></tr>`;
    const na0 = acPosition(p), na1 = acPosition(y);
    html = `<h3>قائمة الأنشطة للسنة المنتهية في 31 ديسمبر ${y}</h3><table class="r-table r-fs"><thead><tr><th>باللاير السعودي</th><th>غير مقيدة</th><th>مقيدة</th><th>${y}</th>${PA ? `<th>${p}</th>` : ''}</tr></thead><tbody>
      ${sec('الإيرادات والمكاسب')}${A.rev.map(x => row(esc(x.n), x.u, x.r, '', pt(x.n))).join('') || `<tr><td colspan="${cs}" class="r-sub">لا إيرادات</td></tr>`}${row('إجمالي الإيرادات والمكاسب', A.tr.u, A.tr.r, 'tot', PA ? PA.tr.u + PA.tr.r : 0)}
      ${sec('المصروفات والخسائر')}${A.groups.map(g => `<tr class="grp"><td colspan="${cs}">${esc(g.t)}</td></tr>` + g.items.map(x => row('&nbsp;&nbsp;' + esc(x.n), x.u, x.r, '', pt(x.n))).join('')).join('') || `<tr><td colspan="${cs}" class="r-sub">لا مصروفات</td></tr>`}
      ${row('إجمالي المصروفات والخسائر', A.te.u, A.te.r, 'tot', PA ? PA.te.u + PA.te.r : 0)}
      ${row('التغير في صافي الأصول خلال السنة', A.tr.u - A.te.u, A.tr.r - A.te.r, 'tot', PA ? PA.tr.u + PA.tr.r - PA.te.u - PA.te.r : 0)}
      ${row('صافي الأصول بداية السنة', na0.naU, na0.naR, '', null)}${row('صافي الأصول نهاية السنة', na1.naU, na1.naR, 'tot', null)}</tbody></table>`;
  } else {
    const C = acCashFlow(y), P = hasPrev ? acCashFlow(p) : null, pv = k => P ? P[k] : 0;
    const r = (n, a, b, cls) => `<tr${cls ? ` class="${cls}"` : ''}><td>${n}</td>${col(a, b)}</tr>`, sec = t => `<tr class="sec"><td colspan="${span}">${t}</td></tr>`;
    html = `<h3>قائمة التدفقات النقدية للسنة المنتهية في 31 ديسمبر ${y}</h3><table class="r-table r-fs"><thead><tr><th>باللاير السعودي</th>${head}</tr></thead><tbody>
      ${sec('التدفقات النقدية من الأنشطة التشغيلية')}${r('التغير في صافي الأصول خلال العام', C.dNA, pv('dNA'))}
      <tr class="grp"><td colspan="${span}">تعديلات لتسوية التغير في صافي الأصول مع صافي النقد من الأنشطة التشغيلية:</td></tr>
      ${r('إهلاك الممتلكات والآلات والمعدات', C.dep, pv('dep'))}${C.loss ? r('خسائر استبعاد أصول', C.loss, pv('loss')) : ''}
      ${C.wc.map(x => r('التغير في ' + esc(x.n), x.v, P ? ((P.wc.find(z => z.n === x.n) || {}).v || 0) : 0)).join('')}
      ${Math.abs(C.other) >= .5 ? r('بنود أخرى', C.other, pv('other')) : ''}
      ${r('صافي التدفقات النقدية من الأنشطة التشغيلية', C.op, pv('op'), 'tot')}
      ${sec('التدفقات النقدية من الأنشطة الاستثمارية')}${r('إضافات واستبعادات الممتلكات والآلات والمعدات', C.inv, pv('inv'))}${r('صافي التدفقات النقدية من الأنشطة الاستثمارية', C.inv, pv('inv'), 'tot')}
      ${r('صافي التغير في النقد وما في حكمه خلال العام', C.cashE - C.cashB, P ? P.cashE - P.cashB : 0, 'tot')}${r('النقد وما في حكمه بداية العام', C.cashB, pv('cashB'))}${r('النقد وما في حكمه نهاية العام', C.cashE, pv('cashE'), 'tot')}</tbody></table>`;
  }
  return `<div class="r-filters">${acYearSel()}${sub}${acPrintBtn('acStBox', 'القوائم المالية')}</div>
  <div class="card r-card ac-st" id="acStBox"><div class="ac-st-org"><b>${esc(CONFIG.companyName)}</b><span>جمعية أهلية مسجلة في المركز الوطني لتنمية القطاع غير الربحي برقم (${esc(CONFIG.license || '')})</span></div>${html}
  <p class="r-sub" style="margin-top:12px">من القيود المرحّلة في النظام — للمتابعة الإدارية ورفعها للمراجع الخارجي، وليست بديلاً عن القوائم المراجَعة.</p></div>`;
}

/* ── الأصول الثابتة ── */
const acMonthly = a => (Number(a.cost) - Number(a.salvage || 0)) * Number(a.rate || 10) / 100 / 12;
function acAssets() {
  const A = LG.data.assets.slice().sort((a, b) => (a.category + a.code).localeCompare(b.category + b.code));
  const nbv = a => Number(a.cost) - Number(a.acc_dep || 0);
  const byCat = Object.entries(ASSET_CATS).map(([k, c]) => { const L = A.filter(a => a.category === k && a.status === 'active'); return { c, cost: L.reduce((s, a) => s + +a.cost, 0), dep: L.reduce((s, a) => s + +(a.acc_dep || 0), 0) }; });
  return `<div class="r-filters">${can('finance') ? `<button class="btn btn-gold btn-sm" onclick="acAssetModal()"><i data-lucide="plus"></i> إضافة أصل</button><button class="btn btn-ghost btn-sm" onclick="acDepRun()"><i data-lucide="calculator"></i> احتساب الإهلاك وترحيله</button>` : ''}${acPrintBtn('acAssetBox', 'سجل الأصول الثابتة')}
    <span class="r-sub">قسط ثابت — الأثاث والكمبيوتر والتحسينات والآلات 10% سنوياً (السياسات المحاسبية المعتمدة).</span></div>
  <div class="r-kpis">${byCat.map(x => `<div class="r-kpi static"><i data-lucide="armchair"></i><b class="sm">${sar(x.cost - x.dep)}</b><span>${x.c.t} (صافي)</span></div>`).join('')}</div>
  <div class="card" style="padding:0;overflow:auto" id="acAssetBox"><table class="r-table"><thead><tr><th>الرمز</th><th>الأصل</th><th>الفئة</th><th>الموقع / العهدة</th><th>تاريخ الشراء</th><th>التكلفة</th><th>مجمع الإهلاك</th><th>الصافي</th><th>مُهلك حتى</th><th></th></tr></thead><tbody>
  ${A.map(a => `<tr${a.status === 'disposed' ? ' class="off"' : ''}><td>${esc(a.code)}</td><td><b>${esc(a.name)}</b>${a.model ? `<div class="r-sub">${esc(a.model)}</div>` : ''}</td><td>${ASSET_CATS[a.category] ? ASSET_CATS[a.category].t : a.category}</td><td>${esc(a.location)}${a.custodian ? `<div class="r-sub">عهدة: ${esc(memberName(a.custodian))}</div>` : ''}</td><td>${fmtD(a.purchase_date)}</td><td>${sar(a.cost)}</td><td>${sar(a.acc_dep)}</td><td><b>${sar(nbv(a))}</b></td><td>${a.status === 'disposed' ? 'مستبعد ' + fmtD(a.disposed_at) : fmtD(a.dep_until)}</td>
    <td>${can('finance') && a.status === 'active' ? `<button class="link-btn" onclick="acAssetModal('${a.id}')">تعديل</button> <button class="link-btn" onclick="acDispose('${a.id}')">استبعاد</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="10">${rEmpty('armchair', 'لا أصول مسجلة.')}</td></tr>`}</tbody></table></div>`;
}
function acAssetModal(id) {
  const a = id ? LG.data.assets.find(x => x.id === id) : { code: 'FA-' + String(LG.data.assets.length + 1).padStart(3, '0'), name: '', category: 'furniture', location: 'مقر الجمعية', custodian: '', purchase_date: today(), supplier: '', model: '', cost: '', salvage: 0, rate: 10, acc_dep: 0, notes: '', voucher_id: '' };
  const capV = LG.data.vouchers.filter(v => v.kind === 'payment' && v.category === 'cap_assets' && v.status === 'paid' && !LG.data.assets.some(x => x.voucher_id === v.id && x.id !== id));
  openModal(id ? 'تعديل أصل' : 'إضافة أصل ثابت', `
    ${id ? '' : `<div class="field"><label>طريقة الإضافة</label><select id="fa_how" onchange="document.getElementById('fa_vrow').style.display=this.value==='voucher'?'':'none';document.getElementById('fa_drow').style.display=this.value==='opening'?'':'none'">
      <option value="voucher">شراء بسند صرف (بند شراء أصول ثابتة)</option><option value="inkind">تبرع عيني (يثبت على صافي الأصول مباشرة)</option><option value="opening">أصل قائم قبل النظام (رصيد افتتاحي)</option></select></div>
      <div class="field" id="fa_vrow"><label>سند الصرف</label><select id="fa_v"><option value="">—</option>${capV.map(v => `<option value="${v.id}">سند ${v.number} — ${esc(v.party)} — ${sar(v.amount)}</option>`).join('')}</select></div>`}
    <div class="row3"><div class="field"><label>الرمز</label><input id="fa_code" value="${esc(a.code)}"></div><div class="field" style="grid-column:span 2"><label>اسم الأصل</label><input id="fa_name" value="${esc(a.name)}"></div></div>
    <div class="row3"><div class="field"><label>الفئة</label><select id="fa_cat">${Object.entries(ASSET_CATS).map(([k, c]) => `<option value="${k}"${k === a.category ? ' selected' : ''}>${c.t}</option>`).join('')}</select></div>
      <div class="field"><label>تاريخ الشراء</label><input type="date" id="fa_date" value="${esc(a.purchase_date)}"></div><div class="field"><label>التكلفة</label><input type="number" id="fa_cost" value="${esc(a.cost)}"></div></div>
    <div class="row3"><div class="field"><label>نسبة الإهلاك السنوية %</label><input type="number" id="fa_rate" value="${esc(a.rate)}"></div><div class="field"><label>القيمة المتبقية</label><input type="number" id="fa_salv" value="${esc(a.salvage || 0)}"></div>
      <div class="field" id="fa_drow" style="display:${id ? '' : 'none'}"><label>مجمع الإهلاك حتى تاريخه</label><input type="number" id="fa_dep" value="${esc(a.acc_dep || 0)}"></div></div>
    <div class="row3"><div class="field"><label>الموقع</label><input id="fa_loc" value="${esc(a.location)}"></div><div class="field"><label>في عهدة</label><select id="fa_cust"><option value="">—</option>${ORG.members.map(m => `<option value="${m.id}"${m.id === a.custodian ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div><div class="field"><label>المورد</label><input id="fa_sup" value="${esc(a.supplier)}"></div></div>
    <div class="row2"><div class="field"><label>الموديل / سنة الصنع</label><input id="fa_model" value="${esc(a.model)}"></div><div class="field"><label>ملاحظات</label><input id="fa_notes" value="${esc(a.notes)}"></div></div>
    <div class="r-hint">حقول سجل الأصول حسب المادة 59 من اللائحة المالية. العهدة العينية تمنع المخالصة قبل تسليم الأصل.</div>`,
    async () => {
      const row = { code: fval('fa_code'), name: fval('fa_name'), category: fval('fa_cat'), purchase_date: fval('fa_date'), cost: Number(fval('fa_cost') || 0), rate: Number(fval('fa_rate') || 10), salvage: Number(fval('fa_salv') || 0), location: fval('fa_loc'), custodian: fval('fa_cust') || null, supplier: fval('fa_sup'), model: fval('fa_model'), notes: fval('fa_notes') };
      if (!row.name || !row.cost) { rToast('الاسم والتكلفة مطلوبان', 1); return; }
      try {
        if (id) { await RDB.update('fixed_assets', id, row); }
        else {
          const how = fval('fa_how'), cat = ASSET_CATS[row.category];
          if (how === 'opening') { row.acc_dep = Number(fval('fa_dep') || 0); row.dep_until = dayBefore(String(new Date().getFullYear()) + '-01-01'); }
          else row.acc_dep = 0;
          if (how === 'voucher') { row.voucher_id = fval('fa_v') || null; if (!row.voucher_id) { rToast('اختر سند الصرف', 1); return; } }
          const r = await RDB.insert('fixed_assets', row);
          if (how === 'voucher' && cat.a !== '1210') await acSave({ date: row.purchase_date, source: 'asset', source_id: r.id, memo: 'إعادة تبويب أصل: ' + row.name, status: 'posted', attachment_url: '', lines: [{ a: cat.a, d: row.cost, c: 0, f: 'u' }, { a: '1210', d: 0, c: row.cost, f: 'u' }] });
          if (how === 'inkind') await acSave({ date: row.purchase_date, source: 'asset', source_id: r.id, memo: 'تبرع عيني بأصل: ' + row.name + ' (محضر استلام عيني)', status: 'posted', attachment_url: '', lines: [{ a: cat.a, d: row.cost, c: 0, f: 'u' }, { a: SYS.naU, d: 0, c: row.cost, f: 'u' }] });
        }
        closeModal(); await acLoad(); acPaint(); rToast('تم حفظ الأصل');
      } catch (e) { rToast(e.message, 1); }
    });
  if (!id) { const s = document.getElementById('fa_how'); if (s) s.dispatchEvent(new Event('change')); }
}
async function acDepRun() {
  const p = prompt('احتساب الإهلاك حتى نهاية شهر (YYYY-MM):', acPrevMonth()); if (!p || !/^\d{4}-\d{2}$/.test(p)) return;
  const end = acMonthEnd(p); if (acYearClosed(acYearOf(end))) { rToast('السنة مقفلة', 1); return; }
  const lines = [], upd = [];
  for (const a of LG.data.assets.filter(x => x.status === 'active')) {
    const start = a.dep_until ? a.dep_until.slice(0, 7) : null, pd = a.purchase_date.slice(0, 7);
    const [ey, em] = p.split('-').map(Number), from = start ? (() => { const [y, m] = start.split('-').map(Number); return y * 12 + m; })() : (() => { const [y, m] = pd.split('-').map(Number); return y * 12 + m - 1; })();
    const months = ey * 12 + em - from; if (months <= 0) continue;
    const room = Number(a.cost) - Number(a.salvage || 0) - Number(a.acc_dep || 0), amt = Math.round(Math.min(acMonthly(a) * months, room) * 100) / 100;
    if (amt <= 0) continue;
    const c = ASSET_CATS[a.category]; lines.push({ a: SYS.dep, d: amt, c: 0, f: 'u', m: a.name }, { a: c.dep, d: 0, c: amt, f: 'u', m: a.name }); upd.push([a, amt]);
  }
  if (!lines.length) { rToast('لا إهلاك مستحق حتى ' + p); return; }
  const total = upd.reduce((s, x) => s + x[1], 0);
  if (!confirm(`ترحيل إهلاك ${upd.length} أصل حتى ${p} بإجمالي ${sar(total)} ريال؟`)) return;
  try {
    await acSave({ date: end, source: 'depreciation', source_id: 'dep-' + p, memo: 'إهلاك الممتلكات والآلات والمعدات حتى ' + p, status: 'posted', attachment_url: '', lines });
    for (const [a, amt] of upd) await RDB.update('fixed_assets', a.id, { acc_dep: Math.round((Number(a.acc_dep || 0) + amt) * 100) / 100, dep_until: end });
    await acLoad(); acPaint(); rToast('رُحّل الإهلاك: ' + sar(total));
  } catch (e) { rToast(e.message, 1); }
}
async function acDispose(id) {
  const a = LG.data.assets.find(x => x.id === id), why = prompt('مبرر الاستبعاد (تلف/بيع/تقادم):'); if (!why) return;
  const proceeds = Number(prompt('قيمة البيع إن وُجدت (0 إن لم يُبع):', '0') || 0), c = ASSET_CATS[a.category], nbv = Number(a.cost) - Number(a.acc_dep || 0), diff = proceeds - nbv;
  const lines = [{ a: c.dep, d: Number(a.acc_dep || 0), c: 0, f: 'u' }, { a: c.a, d: 0, c: Number(a.cost), f: 'u' }];
  if (proceeds) lines.push({ a: SYS.bank, d: proceeds, c: 0, f: 'u' });
  if (diff < 0) lines.push({ a: SYS.disposal, d: -diff, c: 0, f: 'u' }); else if (diff > 0) lines.push({ a: acCatAcc('other_rev') || '4107', d: 0, c: diff, f: 'u' });
  try {
    await acSave({ date: today(), source: 'asset', source_id: 'disp-' + id, memo: 'استبعاد أصل: ' + a.name + ' — ' + why + ' (يتطلب موافقة رئيس المجلس لبيع الأصول)', status: 'posted', attachment_url: '', lines: lines.filter(l => l.d || l.c) });
    await RDB.update('fixed_assets', id, { status: 'disposed', disposed_at: today(), disposal_reason: why }); await acLoad(); acPaint();
  } catch (e) { rToast(e.message, 1); }
}

/* ── العهد ── */
const acCustBal = c => Number(c.amount || 0) - (c.moves || []).filter(m => m.entry && m.kind !== 'refill').reduce((s, m) => s + Number(m.amount || 0), 0);
function acCustody() {
  const L = LG.data.cust.slice().sort((a, b) => (b.number || 0) - (a.number || 0));
  return `<div class="r-filters">${can('finance') ? `<button class="btn btn-gold btn-sm" onclick="acCustodyModal()"><i data-lucide="plus"></i> صرف عهدة</button>` : ''}
    <span class="r-sub">العهدة شخصية باسم موظف دائم من خارج الحسابات · لا عهدة مؤقتة لمن لديه عهدة غير مسواة · التسوية خلال 10 أيام من انتهاء الغرض · لا تُدوّر بين السنوات.</span></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>رقم</th><th>الموظف</th><th>النوع</th><th>الغرض</th><th>المبلغ</th><th>المتبقي</th><th>موعد التسوية</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${L.map(c => { const late = c.status === 'open' && c.kind === 'temporary' && c.due_at && c.due_at < today(); return `<tr><td>${c.number || '—'}</td><td>${esc(memberName(c.member_id))}</td><td>${c.kind === 'permanent' ? 'مستديمة' : 'مؤقتة'}</td><td>${esc(c.purpose)}</td><td>${sar(c.amount)}</td><td><b>${sar(acCustBal(c))}</b></td><td style="color:${late ? 'var(--bad)' : 'inherit'}">${fmtD(c.due_at)}${late ? ' — متأخرة' : ''}</td>
    <td>${c.status === 'open' ? '<span class="r-badge" style="--c:#f59e0b">مفتوحة</span>' : '<span class="r-badge" style="--c:#22c55e">مسواة</span>'}</td><td>${`<button class="link-btn" onclick="acCustodySettle('${c.id}')">${c.status === 'open' && can('finance') ? 'تسوية' : 'عرض'}</button>`}</td></tr>`; }).join('') || `<tr><td colspan="9">${rEmpty('wallet-cards', 'لا عهد.')}</td></tr>`}</tbody></table></div>`;
}
function acCustodyModal() {
  const F = CONFIG.finance || {}, due = new Date(); due.setDate(due.getDate() + 10);
  openModal('صرف عهدة', `
    <div class="row2"><div class="field"><label>الموظف (صاحب العهدة)</label><select id="cu_m">${ORG.members.filter(m => m.active !== false).map(m => `<option value="${m.id}">${esc(m.name)} — ${esc(m.title || '')}</option>`).join('')}</select></div>
      <div class="field"><label>النوع</label><select id="cu_k"><option value="temporary">مؤقتة (لغرض محدد)</option><option value="permanent">مستديمة (نثريات — تُستعاض)</option></select></div></div>
    <div class="row3"><div class="field"><label>المبلغ</label><input type="number" id="cu_a"></div><div class="field"><label>تاريخ الصرف</label><input type="date" id="cu_d" value="${today()}"></div>
      <div class="field"><label>موعد التسوية</label><input type="date" id="cu_due" value="${due.toISOString().slice(0, 10)}"></div></div>
    <div class="field"><label>الغرض ومجالات الصرف</label><input id="cu_p" placeholder="مثال: مشتريات ضيافة لفعالية البرنامج"></div>
    <div class="field"><label>تُصرف من</label><select id="cu_src">${acLeaves(a => a.cash).map(a => `<option value="${a.code}"${a.code === SYS.bank ? ' selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
    <div class="r-hint">السلف والعهد النقدية في حدود ${sar(F.advanceLimit || 5000)} ريال بموافقة ${TERMS.head}.</div>`,
    async () => {
      const m = fval('cu_m'), amt = Number(fval('cu_a') || 0), kind = fval('cu_k'), mem = ORG.members.find(x => x.id === m) || {};
      if (!amt || !fval('cu_p')) { rToast('المبلغ والغرض مطلوبان', 1); return; }
      if (LG.data.cust.some(c => c.member_id === m && c.status === 'open') && kind === 'temporary') { rToast('لا تُصرف عهدة مؤقتة لمن لديه عهدة أخرى غير مسواة (اللائحة المالية)', 1); return; }
      if ((mem.apps || []).includes('finance') && !confirm('صاحب العهدة لديه صلاحية المالية — اللائحة تشترط أن يكون من خارج الحسابات. متابعة؟')) return;
      if (amt > ((CONFIG.finance || {}).advanceLimit || 5000) && !confirm('المبلغ يتجاوز حد العهد/السلف — هل لديك موافقة ' + TERMS.head + '؟')) return;
      try {
        const no = 1 + Math.max(0, ...LG.data.cust.map(c => c.number || 0));
        const c = await RDB.insert('custodies', { number: no, member_id: m, kind, purpose: fval('cu_p'), amount: amt, opened_at: fval('cu_d'), due_at: fval('cu_due') || null, status: 'open', moves: [], created_by: ME.id });
        await acSave({ date: fval('cu_d'), source: 'custody', source_id: c.id, memo: `صرف عهدة ${kind === 'permanent' ? 'مستديمة' : 'مؤقتة'} رقم ${no} — ${mem.name || ''}`, status: 'posted', attachment_url: '', lines: [{ a: SYS.custody, d: amt, c: 0, f: 'u', party: mem.name }, { a: fval('cu_src'), d: 0, c: amt, f: 'u', party: mem.name }] });
        closeModal(); await acLoad(); acPaint(); rToast('صُرفت العهدة رقم ' + no);
      } catch (e) { rToast(e.message, 1); }
    });
}
function acCustodySettle(id) {
  const c = LG.data.cust.find(x => x.id === id), mem = ORG.members.find(x => x.id === c.member_id) || {}, open = c.status === 'open' && can('finance');
  const done = (c.moves || []).filter(m => m.entry);
  openModal(`العهدة رقم ${c.number} — ${esc(mem.name || '')}`, `
    <div class="r-vhead"><div><b class="r-vamt">${sar(acCustBal(c))} <small>ر.س متبقية</small></b><div class="r-sub">${c.kind === 'permanent' ? 'مستديمة' : 'مؤقتة'} · ${esc(c.purpose)} · صُرفت ${sar(c.amount)}</div></div></div>
    ${done.length ? `<table class="r-table r-fs"><thead><tr><th>التاريخ</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead><tbody>${done.map(m => `<tr><td>${fmtD(m.date)}</td><td>${m.kind === 'return' ? 'رد نقدية' : esc(acName(m.a))}</td><td>${esc(m.desc || '')}${m.url ? ' ' + linkChip({ url: m.url, title: 'الفواتير' }) : ''}</td><td>${sar(m.amount)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${open ? `<h4 style="margin:16px 0 6px">كشف تفريغ العهدة (الفواتير)</h4><div id="cuRows">${acCustRow()}</div>
      <button type="button" class="link-btn" onclick="document.getElementById('cuRows').insertAdjacentHTML('beforeend',acCustRow())">+ فاتورة</button>
      <div class="row2" style="margin-top:10px"><div class="field"><label>نقدية مردودة للصندوق</label><input type="number" id="cu_ret" value="0"></div>
        <div class="field"><label>طريقة المعالجة</label><select id="cu_mode"><option value="clear">تسوية (تخفيض العهدة)</option>${c.kind === 'permanent' ? '<option value="refill">استعاضة (تعويض المصروف ليبقى سقف العهدة)</option>' : ''}</select></div></div>
      <div class="r-hint">لا تُسجّل العهدة إجمالياً عند التسوية — كل فاتورة على حسابها حسب طبيعتها. لا يُصرف من العهدة رواتب أو مكافآت أو سلف.</div>` : ''}`,
    open ? async () => {
      const rows = Array.from(document.querySelectorAll('#cuRows .ac-line')).map(r => ({ date: r.querySelector('.cu-d').value || today(), a: r.querySelector('.ac-a').value, amount: Number(r.querySelector('.cu-am').value || 0), desc: r.querySelector('.ac-m').value.trim(), p: r.querySelector('.ac-p').value || null, url: r.querySelector('.cu-u').value.trim(), kind: 'expense' })).filter(r => r.amount && r.a);
      const ret = Number(fval('cu_ret') || 0), mode = fval('cu_mode'), exp = rows.reduce((s, r) => s + r.amount, 0);
      if (!rows.length && !ret) { rToast('أضف فاتورة أو مبلغاً مردوداً', 1); return; }
      if (rows.some(r => !validUrl(r.url))) { rToast('روابط الفواتير يجب أن تبدأ بـ https://', 1); return; }
      if (mode === 'clear' && exp + ret > acCustBal(c) + .001) { rToast('المصروف والمردود يتجاوزان رصيد العهدة', 1); return; }
      const lines = rows.map(r => ({ a: r.a, d: r.amount, c: 0, f: 'u', p: r.p, m: r.desc, party: mem.name }));
      if (ret) lines.push({ a: SYS.cash, d: ret, c: 0, f: 'u', m: 'نقدية مردودة من العهدة', party: mem.name });
      if (mode === 'refill') { if (exp) lines.push({ a: SYS.bank, d: 0, c: exp, f: 'u', m: 'استعاضة عهدة', party: mem.name }); if (ret) lines.push({ a: SYS.custody, d: 0, c: ret, f: 'u', party: mem.name }); }
      else lines.push({ a: SYS.custody, d: 0, c: exp + ret, f: 'u', party: mem.name });
      try {
        const e = await acSave({ date: today(), source: 'custody', source_id: id + ':' + Date.now(), memo: `${mode === 'refill' ? 'استعاضة' : 'تسوية'} العهدة رقم ${c.number} — ${mem.name || ''}`, status: 'posted', attachment_url: '', lines });
        const moves = (c.moves || []).concat(rows.map(r => Object.assign(r, { entry: e.id, kind: mode === 'refill' ? 'refill' : 'expense' })), ret ? [{ date: today(), kind: 'return', amount: ret, desc: 'نقدية مردودة', entry: e.id }] : []);
        const left = Number(c.amount) - moves.filter(m => m.kind !== 'refill').reduce((s, m) => s + Number(m.amount), 0);
        await RDB.update('custodies', id, { moves, status: left <= .001 ? 'settled' : 'open' });
        closeModal(); await acLoad(); acPaint(); rToast(left <= .001 ? 'سُوّيت العهدة بالكامل' : 'سُجلت التسوية — المتبقي ' + sar(left));
      } catch (er) { rToast(er.message, 1); }
    } : null);
  const m = document.querySelector('.modal'); if (m) m.style.maxWidth = '920px';
  const sb = document.getElementById('mSave'); if (sb) sb.textContent = 'ترحيل التسوية';
}
function acCustRow() { return `<div class="ac-line cu"><input class="cu-d" type="date" value="${today()}"><select class="ac-a">${acAccOptions('', a => a.type === 'expense')}</select><input class="cu-am" type="number" min="0" step="0.01" placeholder="المبلغ"><select class="ac-p">${programOptions('', 'بلا برنامج')}</select><input class="ac-m" placeholder="البيان / المورد"><input class="cu-u" dir="ltr" placeholder="رابط الفاتورة"><button type="button" class="x" onclick="this.parentElement.remove()">×</button></div>`; }

/* ── البنوك والتسوية البنكية ── */
function acBanks() {
  const pm = LG.recPeriod || acPrevMonth();
  return `<div class="r-filters">${can('finance') ? `<button class="btn btn-gold btn-sm" onclick="acBankModal()"><i data-lucide="plus"></i> حساب بنكي</button>` : ''}<span class="r-sub">التسوية البنكية شهرية: يعدها المحاسب ويعتمدها مدير الشؤون المالية (اللائحة المالية).</span></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>الحساب</th><th>البنك</th><th>الآيبان</th><th>الرصيد الدفتري</th><th>آخر تسوية معتمدة</th><th></th></tr></thead><tbody>
  ${LG.data.banks.map(b => { const last = LG.data.recs.filter(r => r.account_code === b.account_code && r.status === 'approved').sort((x, y) => y.period.localeCompare(x.period))[0]; return `<tr><td><b>${esc(b.name)}</b><div class="r-sub">${b.account_code} — ${esc(acName(b.account_code))}</div></td><td>${esc(b.bank)}</td><td dir="ltr" style="text-align:right">${esc(b.iban || '—')}</td><td><b>${acAmt(acBalTo(b.account_code, today()))}</b></td><td>${last ? last.period : '—'}</td>
    <td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="acRec('${b.account_code}','${pm}')">تسوية ${pm}</button> ${can('finance') ? `<button class="link-btn" onclick="acBankModal('${b.id}')">تعديل</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="6">${rEmpty('landmark', 'لا حسابات بنكية.')}</td></tr>`}</tbody></table></div>
  <div class="card r-card"><div class="r-card-h"><h3>التسويات السابقة</h3></div>${LG.data.recs.slice().sort((a, b) => b.period.localeCompare(a.period)).map(r => `<button class="r-row ac-alert" onclick="acRec('${r.account_code}','${r.period}')"><span>${r.period} — ${esc(acName(r.account_code))}</span><span>رصيد الكشف ${sar(r.statement_balance)}</span>${r.status === 'approved' ? '<span class="r-badge" style="--c:#22c55e">معتمدة</span>' : '<span class="r-badge" style="--c:#f59e0b">مسودة</span>'}</button>`).join('') || '<p class="r-sub">لا تسويات بعد.</p>'}</div>`;
}
function acBankModal(id) {
  const b = id ? LG.data.banks.find(x => x.id === id) : { name: '', bank: CONFIG.bankName || '', iban: '', account_code: '', active: true };
  openModal(id ? 'تعديل حساب بنكي' : 'حساب بنكي جديد', `<div class="row2"><div class="field"><label>اسم الحساب</label><input id="bk_n" value="${esc(b.name)}"></div><div class="field"><label>البنك</label><input id="bk_b" value="${esc(b.bank)}"></div></div>
    <div class="row2"><div class="field"><label>الآيبان</label><input id="bk_i" dir="ltr" value="${esc(b.iban)}" placeholder="SA…"></div><div class="field"><label>الحساب في الدليل</label><select id="bk_a">${acAccOptions(b.account_code, a => a.cash)}</select></div></div>`,
    async () => { const row = { name: fval('bk_n'), bank: fval('bk_b'), iban: fval('bk_i'), account_code: fval('bk_a') }; if (!row.name || !row.account_code) return; try { if (id) await RDB.update('bank_accounts', id, row); else await RDB.insert('bank_accounts', row); closeModal(); await acLoad(); acPaint(); } catch (e) { rToast(e.message, 1); } });
}
function acRec(code, period) {
  LG.recPeriod = period; const end = acMonthEnd(period);
  const rec = LG.data.recs.find(r => r.account_code === code && r.period === period) || { account_code: code, period, statement_balance: '', cleared: [], notes: '', status: 'draft' };
  const prevCleared = new Set(LG.data.recs.filter(r => r.account_code === code && r.period < period && r.status === 'approved').flatMap(r => r.cleared || []));
  const L = acLines({ to: end }).filter(l => l.a === code && !prevCleared.has(l.e.id + ':' + l.i));
  const book = acBalTo(code, end), locked = rec.status === 'approved';
  openModal(`التسوية البنكية — ${esc(acName(code))} — ${period}`, `
    <div class="row3"><div class="field"><label>الرصيد الدفتري في ${fmtD(end)}</label><input value="${sar(book)}" disabled></div>
      <div class="field"><label>رصيد كشف البنك</label><input type="number" step="0.01" id="rc_sb" value="${esc(rec.statement_balance)}" oninput="acRecLive(${book})"${locked ? ' disabled' : ''}></div><div class="field"><label>الفرق</label><input id="rc_diff" disabled></div></div>
    <p class="r-sub">ضع علامة على الحركات الظاهرة في كشف البنك. غير المعلّمة: إيداعات بالطريق أو شيكات لم تُصرف.</p>
    <div style="max-height:46vh;overflow:auto"><table class="r-table r-fs"><thead><tr><th></th><th>التاريخ</th><th>القيد</th><th>البيان</th><th>إيداع</th><th>سحب</th></tr></thead><tbody>
    ${L.map(l => { const k = l.e.id + ':' + l.i; return `<tr><td><input type="checkbox" class="rc-k" value="${k}" data-d="${l.d}" data-c="${l.c}"${(rec.cleared || []).includes(k) ? ' checked' : ''} onchange="acRecLive(${book})"${locked ? ' disabled' : ''}></td><td>${fmtD(l.date)}</td><td>${l.e.number}</td><td>${esc(l.m || l.e.memo)}</td><td>${l.d ? sar(l.d) : ''}</td><td>${l.c ? sar(l.c) : ''}</td></tr>`; }).join('') || '<tr><td colspan="6" class="r-sub">لا حركات.</td></tr>'}</tbody></table></div>
    <div class="ac-tot" id="rc_sum"></div><div class="field"><label>ملاحظات</label><input id="rc_n" value="${esc(rec.notes)}"${locked ? ' disabled' : ''}></div>
    ${locked ? `<div class="r-warn info"><i data-lucide="badge-check"></i> معتمدة من ${esc(memberName(rec.approved_by))}</div>` : ''}`,
    locked ? null : async () => acRecSave(code, period, rec, 'draft'));
  const sb = document.getElementById('mSave');
  if (sb && !locked) { sb.textContent = 'حفظ مسودة'; sb.className = 'btn btn-ghost'; if (canReviewFin()) { sb.insertAdjacentHTML('beforebegin', '<button class="btn btn-gold" id="rcApprove">اعتماد التسوية</button>'); document.getElementById('rcApprove').onclick = () => acRecSave(code, period, rec, 'approved'); } }
  const m = document.querySelector('.modal'); if (m) m.style.maxWidth = '860px';
  acRecLive(book); refreshIcons();
}
function acRecLive(book) {
  const sb = Number((document.getElementById('rc_sb') || {}).value || 0); let dep = 0, chq = 0;
  document.querySelectorAll('.rc-k').forEach(k => { if (!k.checked) { dep += +k.dataset.d; chq += +k.dataset.c; } });
  const adj = sb + dep - chq, diff = Math.round((adj - book) * 100) / 100;
  const d = document.getElementById('rc_diff'); if (d) d.value = sar(diff);
  const s = document.getElementById('rc_sum'); if (s) s.innerHTML = `<span>رصيد الكشف <b>${sar(sb)}</b></span><span>+ إيداعات بالطريق <b>${sar(dep)}</b></span><span>− شيكات معلقة <b>${sar(chq)}</b></span><span>= الرصيد المعدّل <b>${sar(adj)}</b></span><span class="${diff === 0 ? 'ok' : 'bad'}">${diff === 0 ? 'مطابق ✓' : 'فرق ' + sar(diff)}</span>`;
}
async function acRecSave(code, period, rec, status) {
  const row = { account_code: code, period, statement_balance: Number(fval('rc_sb') || 0), cleared: Array.from(document.querySelectorAll('.rc-k:checked')).map(k => k.value), notes: fval('rc_n'), status, prepared_by: rec.prepared_by || ME.id };
  if (status === 'approved') { const d = (document.getElementById('rc_diff') || {}).value; if (d && d !== '0.00' && !confirm('يوجد فرق غير مسوّى (' + d + ') — اعتماد مع الفرق؟')) return; row.approved_by = ME.id; }
  try { if (rec.id) await RDB.update('bank_recs', rec.id, row); else await RDB.insert('bank_recs', row); closeModal(); await acLoad(); acPaint(); rToast(status === 'approved' ? 'اعتُمدت التسوية' : 'حُفظت التسوية'); } catch (e) { rToast(e.message, 1); }
}

/* ── الرواتب ── */
function acPayCalc(m, pr, period) {
  const base = Number(pr.basic || 0) + Number(pr.housing || 0), gross = base + Number(pr.transport || 0) + Number(pr.other || 0);
  const ge = pr.saudi !== false ? Math.round(base * LG_PAYROLL.gosiEmp) / 100 : 0, go = Math.round(base * (pr.saudi !== false ? LG_PAYROLL.gosiOrg : LG_PAYROLL.gosiOrgNonSaudi)) / 100;
  const yrs = pr.hired_at ? (new Date(period + '-28') - new Date(pr.hired_at)) / 3.156e10 : 0, eos = Math.round(base / (yrs >= 5 ? 1 : 2) / 12 * 100) / 100;
  return { member_id: m.id, name: m.name, dept: m.dept, basic: +pr.basic || 0, housing: +pr.housing || 0, transport: +pr.transport || 0, other: +pr.other || 0, gross, gosi_emp: ge, gosi_org: go, eos, deduct: 0, net: Math.round((gross - ge) * 100) / 100, iban: pr.iban || '' };
}
function acPayroll() {
  const P = LG.data.profiles, runs = LG.data.runs.slice().sort((a, b) => b.period.localeCompare(a.period));
  const rv = canReviewFin();
  return `<div class="r-filters">${rv ? `<button class="btn btn-gold btn-sm" onclick="acRunNew()"><i data-lucide="plus"></i> مسير رواتب شهر</button>` : ''}<span class="r-sub">الصرف بحد أقصى يوم ${LG_PAYROLL.payDay} · التأمينات: الموظف ${LG_PAYROLL.gosiEmp}% والجمعية ${LG_PAYROLL.gosiOrg}% من الأساسي + السكن · مخصص نهاية الخدمة يُحمّل شهرياً.</span></div>
  <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3><i data-lucide="users"></i> ملفات الرواتب</h3></div>
    ${ORG.members.filter(m => m.active !== false && m.role !== 'volunteer').map(m => { const p = P.find(x => x.member_id === m.id); return `<button class="r-row ac-alert" onclick="${rv ? `acProfileModal('${m.id}')` : ''}"><span>${esc(m.name)}<div class="r-sub">${esc(m.title || '')}</div></span><b>${p && p.active !== false ? sar(Number(p.basic) + Number(p.housing) + Number(p.transport) + Number(p.other)) + ' ر.س' : '<span class="r-sub">لم يُحدد</span>'}</b></button>`; }).join('')}</div>
  <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="file-spreadsheet"></i> المسيرات</h3></div>
    ${runs.map(r => `<button class="r-row ac-alert" onclick="acRunView('${r.id}')"><span>${r.period}</span><span>${(r.lines || []).length} موظف</span><b>${sar(r.total_net)}</b>${{ draft: '<span class="r-badge" style="--c:#f59e0b">مسودة</span>', approved: '<span class="r-badge" style="--c:#CAB05F">معتمد — بانتظار الصرف</span>', paid: '<span class="r-badge" style="--c:#22c55e">مصروف</span>' }[r.status]}</button>`).join('') || '<p class="r-sub">لا مسيرات بعد. حدّد رواتب الموظفين أولاً ثم أنشئ مسير الشهر.</p>'}</div></div>`;
}
function acProfileModal(mid) {
  const m = ORG.members.find(x => x.id === mid), p = LG.data.profiles.find(x => x.member_id === mid) || { basic: '', housing: '', transport: '', other: 0, saudi: true, iban: '', hired_at: '', active: true };
  openModal('راتب — ' + esc(m.name), `<div class="row2"><div class="field"><label>الراتب الأساسي</label><input type="number" id="pp_b" value="${esc(p.basic)}"></div><div class="field"><label>بدل السكن</label><input type="number" id="pp_h" value="${esc(p.housing)}"></div></div>
    <div class="row2"><div class="field"><label>بدل النقل</label><input type="number" id="pp_t" value="${esc(p.transport)}"></div><div class="field"><label>بدلات أخرى</label><input type="number" id="pp_o" value="${esc(p.other)}"></div></div>
    <div class="row2"><div class="field"><label>الآيبان</label><input id="pp_i" dir="ltr" value="${esc(p.iban)}" placeholder="SA…"></div><div class="field"><label>تاريخ المباشرة</label><input type="date" id="pp_d" value="${esc(p.hired_at || '')}"></div></div>
    <label class="r-check"><input type="checkbox" id="pp_s"${p.saudi !== false ? ' checked' : ''}> سعودي (يخضع لفرع المعاشات في التأمينات)</label><label class="r-check"><input type="checkbox" id="pp_a"${p.active !== false ? ' checked' : ''}> يُدرج في المسير</label>`,
    async () => {
      const row = { member_id: mid, basic: +fval('pp_b') || 0, housing: +fval('pp_h') || 0, transport: +fval('pp_t') || 0, other: +fval('pp_o') || 0, iban: fval('pp_i'), hired_at: fval('pp_d') || null, saudi: fval('pp_s'), active: fval('pp_a') };
      try { if (LG.data.profiles.some(x => x.member_id === mid)) { if (acLive()) { const { error } = await sb.from('payroll_profiles').update(row).eq('member_id', mid); if (error) throw error; } else { const d = demoDB(); Object.assign(d.payroll_profiles.find(x => x.member_id === mid), row); demoSave(d); } } else await RDB.insert('payroll_profiles', row); closeModal(); await acLoad(); acPaint(); } catch (e) { rToast(e.message, 1); }
    });
}
async function acRunNew() {
  const d = new Date(), p = prompt('شهر المسير (YYYY-MM):', d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')); if (!p || !/^\d{4}-\d{2}$/.test(p)) return;
  if (LG.data.runs.some(r => r.period === p)) { rToast('يوجد مسير لهذا الشهر', 1); return; }
  const lines = ORG.members.map(m => { const pr = LG.data.profiles.find(x => x.member_id === m.id && x.active !== false); return pr ? acPayCalc(m, pr, p) : null; }).filter(Boolean);
  if (!lines.length) { rToast('حدّد رواتب الموظفين أولاً', 1); return; }
  try { const r = await RDB.insert('payroll_runs', { period: p, lines, total_net: lines.reduce((s, l) => s + l.net, 0), status: 'draft', created_by: ME.id }); await acLoad(); acRunView(r.id); } catch (e) { rToast(e.message, 1); }
}
function acRunView(id) {
  const r = LG.data.runs.find(x => x.id === id), ed = r.status === 'draft' && canReviewFin();
  const T = k => r.lines.reduce((s, l) => s + Number(l[k] || 0), 0);
  openModal('مسير رواتب ' + r.period, `<div id="acRunBox"><table class="r-table r-fs"><thead><tr><th>الموظف</th><th>الأساسي</th><th>السكن</th><th>النقل</th><th>أخرى</th><th>الإجمالي</th><th>تأمينات الموظف</th><th>استقطاع/سلف</th><th>الصافي</th></tr></thead><tbody>
    ${r.lines.map((l, i) => `<tr><td>${esc(l.name)}</td><td>${sar(l.basic)}</td><td>${sar(l.housing)}</td><td>${sar(l.transport)}</td><td>${sar(l.other)}</td><td>${sar(l.gross)}</td><td>${sar(l.gosi_emp)}</td><td>${ed ? `<input type="number" class="pr-ded" data-i="${i}" value="${l.deduct || 0}" style="width:90px">` : sar(l.deduct)}</td><td><b>${sar(l.net)}</b></td></tr>`).join('')}
    <tr class="tot"><td>الإجمالي</td><td>${sar(T('basic'))}</td><td>${sar(T('housing'))}</td><td>${sar(T('transport'))}</td><td>${sar(T('other'))}</td><td>${sar(T('gross'))}</td><td>${sar(T('gosi_emp'))}</td><td>${sar(T('deduct'))}</td><td>${sar(T('net'))}</td></tr></tbody></table>
    <p class="r-sub">حصة الجمعية في التأمينات: ${sar(T('gosi_org'))} · مخصص نهاية الخدمة للشهر: ${sar(T('eos'))}</p></div>`,
    ed ? async () => acRunApprove(id) : (r.status === 'approved' && canReviewFin() ? async () => acRunPay(id) : null));
  const m = document.querySelector('.modal'); if (m) m.style.maxWidth = '1000px';
  const sb = document.getElementById('mSave'); if (sb) sb.textContent = r.status === 'draft' ? 'اعتماد المسير وإثبات القيد' : 'تسجيل الصرف (تحويل البنك)';
  const foot = document.querySelector('.modal-foot'); if (foot) foot.insertAdjacentHTML('beforeend', `<button class="btn btn-ghost" onclick="acPrintBox('acRunBox','مسير رواتب ${r.period}')"><i data-lucide="printer"></i> طباعة</button><button class="btn btn-ghost" onclick="acRunBankFile('${id}')"><i data-lucide="download"></i> ملف البنك</button>`);
  refreshIcons();
}
async function acRunApprove(id) {
  const r = LG.data.runs.find(x => x.id === id);
  document.querySelectorAll('.pr-ded').forEach(i => { const l = r.lines[+i.dataset.i]; l.deduct = Number(i.value || 0); l.net = Math.round((l.gross - l.gosi_emp - l.deduct) * 100) / 100; });
  const T = (f, k) => r.lines.filter(f).reduce((s, l) => s + Number(l[k] || 0), 0), prog = l => LG_PAYROLL.programDepts.includes(l.dept), all = () => true;
  const end = acMonthEnd(r.period), lines = [];
  const add = (cat, v, m) => { if (v) lines.push({ a: acCatAcc(cat), d: Math.round(v * 100) / 100, c: 0, f: 'u', m }); };
  add('al_salaries', T(prog, 'gross'), 'رواتب وبدلات — الإدارات التشغيلية'); add('ad_salaries', T(l => !prog(l), 'gross'), 'رواتب وبدلات — الإدارية');
  add('ad_gosi', T(all, 'gosi_org'), 'حصة الجمعية في التأمينات'); add('ad_eos', T(all, 'eos'), 'مخصص مكافأة نهاية الخدمة');
  const cr = (a, v, m) => { if (v) lines.push({ a, d: 0, c: Math.round(v * 100) / 100, f: 'u', m }); };
  cr(SYS.salPay, T(all, 'net'), 'صافي الرواتب المستحقة'); cr(SYS.gosiPay, T(all, 'gosi_emp') + T(all, 'gosi_org'), 'اشتراكات التأمينات المستحقة'); cr(SYS.advances, T(all, 'deduct'), 'استقطاع سلف'); cr(SYS.eos, T(all, 'eos'), 'مخصص نهاية الخدمة');
  if (lines.some(l => !l.a)) { rToast('بنود الرواتب غير مربوطة بحسابات في الدليل', 1); return; }
  try { const e = await acSave({ date: end, source: 'payroll', source_id: 'pay-' + r.period, memo: 'إثبات رواتب شهر ' + r.period, status: 'posted', attachment_url: '', lines }); await RDB.update('payroll_runs', id, { lines: r.lines, total_net: T(all, 'net'), status: 'approved', entry_id: e.id, approved_by: ME.id }); closeModal(); await acLoad(); acPaint(); rToast('اعتُمد المسير وأُثبت القيد'); } catch (er) { rToast(er.message, 1); }
}
async function acRunPay(id) {
  const r = LG.data.runs.find(x => x.id === id), d = prompt('تاريخ التحويل:', today()); if (!d) return;
  try { const e = await acSave({ date: d, source: 'payroll', source_id: 'paid-' + r.period, memo: 'صرف رواتب شهر ' + r.period + ' (تحويل بنكي)', status: 'posted', attachment_url: '', lines: [{ a: SYS.salPay, d: r.total_net, c: 0, f: 'u' }, { a: SYS.bank, d: 0, c: r.total_net, f: 'u' }] }); await RDB.update('payroll_runs', id, { status: 'paid', pay_entry_id: e.id }); closeModal(); await acLoad(); acPaint(); rToast('سُجّل صرف الرواتب'); } catch (er) { rToast(er.message, 1); }
}
function acRunBankFile(id) { const r = LG.data.runs.find(x => x.id === id); acCSV([['الاسم', 'الآيبان', 'المبلغ', 'البيان']].concat(r.lines.map(l => [l.name, l.iban, l.net, 'راتب ' + r.period])), 'تحويل-رواتب-' + r.period); }

/* ── السنة المالية والإقفال ── */
function acYears() {
  const ys = Array.from(new Set([new Date().getFullYear(), ...LG.data.entries.map(e => acYearOf(e.date))])).filter(Boolean).sort((a, b) => b - a);
  const histYears = AC_HIST && AC_HIST.years ? Object.keys(AC_HIST.years) : [], hist = histYears.length && LG.data.entries.some(e => e.status !== 'void' && acYearOf(e.date) <= +histYears[histYears.length - 1]);
  return `${!hist && histYears.length && canReviewFin() ? `<div class="r-warn info"><i data-lucide="info"></i> لم تُستورد أرصدة السنوات السابقة. <button class="link-btn" onclick="acSeedHistory().then(acLoad).then(acPaint)">استيراد ${histYears.join(' و')} من القوائم المالية المراجَعة</button></div>` : hist ? `<div class="r-warn info"><i data-lucide="badge-check"></i> السنوات ${histYears.join(' و')} مُدخلة من القوائم المالية المراجَعة${AC_HIST.auditor ? ' (' + esc(AC_HIST.auditor) + ')' : ''} ومقفلة — السنة الحالية تبدأ من أرصدتها الحقيقية.</div>` : ''}
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>السنة</th><th>القيود المرحّلة</th><th>مسودات</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${ys.map(y => { const f = (LG.data.fy || []).find(x => +x.year === y), E = LG.data.entries.filter(e => acYearOf(e.date) === y); return `<tr><td><b>${y}</b></td><td>${E.filter(e => e.status === 'posted').length}</td><td>${E.filter(e => e.status === 'draft').length}</td><td>${f && f.status === 'closed' ? `<span class="r-badge" style="--c:#64748b">مقفلة ${fmtD(f.closed_at)}</span>` : '<span class="r-badge" style="--c:#22c55e">مفتوحة</span>'}</td>
    <td>${isAdmin() ? (f && f.status === 'closed' ? `<button class="link-btn" onclick="acReopen(${y})">إعادة فتح</button>` : `<button class="btn btn-ghost btn-sm" onclick="acCloseYear(${y})"><i data-lucide="lock"></i> إقفال السنة</button>`) : ''}</td></tr>`; }).join('')}</tbody></table></div>
  <div class="card r-card"><h3>مواعيد الإقفال (اللائحة المالية)</h3><ul class="r-sub" style="line-height:2"><li>تعليمات الإقفال قبل 30 يوماً من نهاية السنة.</li><li>ميزان المراجعة خلال شهر من نهاية السنة.</li><li>رفع الحساب الختامي خلال شهرين، واعتماد المجلس خلال 3 أشهر.</li><li>تُسوّى العهد قبل الإقفال ولا تُدوّر بين السنوات.</li></ul></div>`;
}
async function acCloseYear(y) {
  const E = LG.data.entries.filter(e => acYearOf(e.date) === y);
  const issues = [];
  if (E.some(e => e.status === 'draft')) issues.push('توجد قيود مسودة غير مرحّلة');
  if (LG.data.vouchers.some(v => acYearOf(v.date) === y && ['pending', 'reviewed', 'approved'].includes(v.status) && v.kind === 'payment')) issues.push('سندات صرف لم يكتمل صرفها');
  if (LG.data.cust.some(c => c.status === 'open' && acYearOf(c.opened_at) <= y)) issues.push('عهد غير مسواة (لا تُدوّر بين السنوات)');
  if (LG.data.assets.some(a => a.status === 'active' && (!a.dep_until || a.dep_until < y + '-12-31') && Number(a.acc_dep) < Number(a.cost) - Number(a.salvage || 0))) issues.push('إهلاك الأصول لم يُرحّل حتى 31 ديسمبر');
  if (issues.length && !confirm('قبل الإقفال:\n• ' + issues.join('\n• ') + '\n\nالإقفال رغم ذلك؟')) return;
  if (!confirm(`إقفال السنة المالية ${y}؟ تُقفل حسابات الإيرادات والمصروفات في صافي الأصول، وتُمنع أي قيود جديدة على السنة.`)) return;
  try { await acCloseYearCore(y); await acLoad(); acPaint(); rToast('أُقفلت السنة المالية ' + y); } catch (e) { rToast(e.message, 1); }
}
async function acCloseYearCore(y) {
  const M = acLines(Object.assign(acYearRange(y), { ex: ['closing'] })), lines = []; let u = 0, r = 0;
  acLeaves(a => a.type === 'revenue' || a.type === 'expense').forEach(a => ['u', 'r'].forEach(f => { const n = M.filter(l => l.a === a.code && l.f === f).reduce((s, l) => s + l.d - l.c, 0); if (Math.abs(n) < .005) return; lines.push({ a: a.code, d: n < 0 ? -n : 0, c: n > 0 ? n : 0, f, m: 'إقفال' }); if (f === 'u') u += n; else r += n; }));
  if (u) lines.push({ a: SYS.naU, d: u > 0 ? u : 0, c: u < 0 ? -u : 0, f: 'u', m: 'التغير في صافي الأصول غير المقيدة' });
  if (r) lines.push({ a: SYS.naR, d: r > 0 ? r : 0, c: r < 0 ? -r : 0, f: 'r', m: 'التغير في صافي الأصول المقيدة' });
  let ce = null; if (lines.length) ce = await acSave({ date: y + '-12-31', source: 'closing', source_id: 'close-' + y, memo: 'قيد إقفال السنة المالية ' + y, status: 'posted', attachment_url: '', lines });
  const row = { year: y, status: 'closed', closed_by: ME.id, closed_at: new Date().toISOString(), closing_entry: ce ? ce.id : null };
  if ((LG.data.fy || []).some(f => +f.year === y)) { if (acLive()) { const { error } = await sb.from('fiscal_years').update(row).eq('year', y); if (error) throw error; } else { const d = demoDB(); Object.assign(d.fiscal_years.find(f => +f.year === y), row); demoSave(d); } }
  else { const r2 = await RDB.insert('fiscal_years', row); (LG.data.fy = LG.data.fy || []).push(r2); }
}
async function acReopen(y) {
  if (!confirm('إعادة فتح السنة ' + y + '؟ يُلغى قيد الإقفال.')) return;
  try {
    if (acLive()) { const { error } = await sb.from('fiscal_years').update({ status: 'open' }).eq('year', y); if (error) throw error; } else { const d = demoDB(); d.fiscal_years.find(f => +f.year === y).status = 'open'; demoSave(d); }
    await acLoad(); const ce = acBySource('closing', 'close-' + y); if (ce) await acSave({ status: 'void', void_reason: 'إعادة فتح السنة', lines: ce.lines }, ce.id);
    await acLoad(); acPaint(); rToast('أُعيد فتح السنة ' + y);
  } catch (e) { rToast(e.message, 1); }
}

/* ═════════ الطباعة بهوية الجمعية ═════════ */
function acPrintDoc(title, inner) {
  rPrintHTML(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${esc(title)}</title><base href="${location.href.replace(/[^/]*$/, '')}"><style>${CONFIG.printFonts || ''}
  @page{size:A4;margin:14mm}body{font-family:${CONFIG.printFontFamily || 'Tahoma'},Tahoma,sans-serif;color:#14292D;font-size:12.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #41747F;padding-bottom:10px;margin-bottom:14px}.hd img{height:48px}.hd h1{margin:0;font-size:20px}
  table{width:100%;border-collapse:collapse}td,th{padding:6px 8px;border-bottom:1px solid #dde5e6;text-align:right;vertical-align:top}th{background:#EEF4F4}.tot td{font-weight:700;border-top:2px solid #41747F}.sec td{background:#EEF4F4;font-weight:700}.grp td{font-weight:700;color:#41747F}
  button,select,input[type=checkbox],.r-chip,.r-badge{display:none!important}.r-sub{color:#5d7378;font-size:11px}.r-card-h h3,h3{font-size:15px;margin:6px 0 10px}
  .sigs{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px;text-align:center}.sigs div{border-top:1px solid #9fb6ba;padding-top:6px}.ft{margin-top:24px;font-size:10.5px;color:#5d7378;border-top:1px dashed #cfdcde;padding-top:6px}</style></head><body>
  <div class="hd"><img src="${esc(CONFIG.brandLogo)}" alt=""><h1>${esc(title)}</h1></div>${inner}
  <div class="sigs"><div>أعدّه (المحاسب)</div><div>راجعه (${esc(TERMS.finHead || 'مدير الشؤون المالية')})</div><div>اعتمده (${esc(TERMS.head)})</div></div>
  <div class="ft">${esc(CONFIG.companyName)} — ترخيص ${esc(CONFIG.license || '')} — طُبع ${new Date().toLocaleString('ar-u-ca-gregory-nu-latn')}</div></body></html>`);
}
function acPrintBox(id, title) { const el = document.getElementById(id); if (el) acPrintDoc(title, el.innerHTML); }
function acPrintEntry(id) { const e = LG.data.entries.find(x => x.id === id); acPrintDoc('مستند قيد رقم ' + (e.number || '') + ' — ' + e.date, document.getElementById('acEntryBox').innerHTML); }

/* ربط المالية بالمحاسبة: كل صرف/اعتماد/إيداع/إلغاء سند يُرحَّل فوراً (دون انتظار فتح تطبيق المحاسبة) */
async function acAfterVoucher() { if (!can('finance')) return; try { await acLoad(); if ((LG.data.accounts || []).length) await acSyncVouchers(true); } catch (e) { console.warn('[المحاسبة]', e); } }
if (typeof vMove === 'function') { const _vMove = vMove; vMove = async function () { await _vMove.apply(this, arguments); acAfterVoucher(); }; }
if (typeof vDeposit === 'function') { const _vDep = vDeposit; vDeposit = async function () { await _vDep.apply(this, arguments); acAfterVoucher(); }; }
