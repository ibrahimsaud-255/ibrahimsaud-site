/*
 * 22-org-finance.js — المالية: سندات الصرف والقبض، طلبات الصرف، الداعمون، الموازنة، قائمة الأنشطة
 * الدورة مطابقة لسياسة الصرف للبرامج والأنشطة ونظام الرقابة لأوامر الصرف الداخلية:
 *   طلب صرف (الإدارة) → سند بانتظار المراجعة (المحاسب) → مراجعة وتأكيد الرصيد (مدير الشؤون الإدارية والمالية)
 *   → اعتماد (المدير التنفيذي) → صُرف (المالية). القواعد نفسها مفروضة في قاعدة البيانات (vouchers_before).
 * ⚠️ تعريفات فقط.
 */
const FIN = { tab: 'overview', v: [], donors: [], budgets: [], year: new Date().getFullYear(), stFilter: '' };

function finTabs() {
  const t = [];
  if (can(['finance', 'reports'])) t.push({ id: 'overview', name: 'نظرة عامة', icon: 'layout-dashboard' });
  if (can('finance')) {
    t.push({ id: 'payment', name: 'سندات الصرف', icon: 'arrow-up-from-line', n: FIN.v.filter(v => v.kind === 'payment' && ['pending', 'reviewed', 'approved'].includes(v.status)).length });
    t.push({ id: 'receipt', name: 'سندات القبض', icon: 'arrow-down-to-line' });
    t.push({ id: 'requests', name: 'طلبات الصرف', icon: 'hand-coins', n: FIN.v.filter(v => v.status === 'request').length });
  }
  if (can(['finance', 'donors'])) t.push({ id: 'donors', name: 'الداعمون والمانحون', icon: 'handshake' });
  if (can(['finance', 'reports'])) { t.push({ id: 'budget', name: 'الموازنة', icon: 'target' }); t.push({ id: 'report', name: 'قائمة الأنشطة', icon: 'file-bar-chart' }); }
  return t;
}
async function renderFinance() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  [FIN.v, FIN.donors, FIN.budgets] = await Promise.all([
    RDB.list('vouchers', { order: 'created_at' }).catch(() => []),
    can(['finance', 'donors']) ? RDB.list('donors', { order: 'name', asc: true }).catch(() => []) : [],
    can(['finance', 'reports']) ? RDB.list('budgets').catch(() => []) : [],
  ]);
  const tabs = finTabs();
  if (!tabs.find(t => t.id === FIN.tab)) FIN.tab = tabs[0] ? tabs[0].id : 'overview';
  paintFinance();
}
function finGo(tab) { FIN.tab = tab; FIN.stFilter = ''; if (CUR !== 'finance') { go('finance'); } else paintFinance(); }
function paintFinance() {
  const body = { overview: finOverview, payment: () => finVouchers('payment'), receipt: () => finVouchers('receipt'), requests: finRequests, donors: finDonors, budget: finBudget, report: finReport }[FIN.tab] || finOverview;
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><h1>المالية</h1><div style="display:flex;gap:8px;flex-wrap:wrap">
      ${can('finance') ? `<button class="btn btn-gold" onclick="voucherModal(null,'payment')"><i data-lucide="arrow-up-from-line"></i> سند صرف</button><button class="btn btn-ghost" onclick="voucherModal(null,'receipt')"><i data-lucide="arrow-down-to-line"></i> سند قبض</button>` : ''}</div></div>
    ${rTabs('fin', finTabs(), FIN.tab, 'finGo')}
    <div id="finBody">${body()}</div></div>`;
  refreshIcons();
}
const yr = v => String(v.date || '').slice(0, 4) === String(FIN.year);
const okV = v => ['approved', 'paid'].includes(v.status);

/* ── نظرة عامة ── */
function finOverview() {
  const V = FIN.v.filter(v => yr(v) && okV(v));
  const inc = V.filter(v => v.kind === 'receipt'), exp = V.filter(v => v.kind === 'payment');
  const sum = a => a.reduce((s, v) => s + Number(v.amount || 0), 0);
  const restrictedIn = sum(inc.filter(v => v.fund === 'restricted')), restrictedOut = sum(exp.filter(v => v.fund === 'restricted'));
  const groups = Object.keys(FIN_EXP_GROUPS).map(g => ({ g, t: FIN_EXP_GROUPS[g], v: sum(exp.filter(v => (FIN_EXPENSE.find(c => c.key === v.category) || {}).group === g)) }));
  const totalExp = sum(exp) || 1;
  const progShare = sum(exp.filter(v => ['activities', 'allocated'].includes((FIN_EXPENSE.find(c => c.key === v.category) || {}).group)));
  const pipe = ['request', 'pending', 'reviewed', 'approved'].map(s => ({ s, n: FIN.v.filter(v => v.status === s && v.kind === 'payment').length, a: sum(FIN.v.filter(v => v.status === s && v.kind === 'payment')) }));
  const undeposited = FIN.v.filter(v => v.kind === 'receipt' && !v.deposited && !['void', 'rejected'].includes(v.status));
  const byProg = ORG.programs.map(p => ({ p, inc: sum(inc.filter(v => v.program_id === p.id)), exp: sum(exp.filter(v => v.program_id === p.id)), bud: FIN.budgets.filter(b => b.year == FIN.year && b.program_id === p.id).reduce((s, b) => s + Number(b.amount), 0) })).filter(x => x.inc || x.exp || x.bud);
  return `${yearPicker()}
  <div class="r-kpis">
    <div class="r-kpi static"><i data-lucide="arrow-down-to-line"></i><b class="sm">${sar(sum(inc))}</b><span>الإيرادات المعتمدة ${FIN.year}</span></div>
    <div class="r-kpi static"><i data-lucide="arrow-up-from-line"></i><b class="sm">${sar(sum(exp))}</b><span>المصروفات المعتمدة ${FIN.year}</span></div>
    <div class="r-kpi static"><i data-lucide="scale"></i><b class="sm">${sar(sum(inc) - sum(exp))}</b><span>التغير في صافي الأصول</span></div>
    <div class="r-kpi static"><i data-lucide="lock"></i><b class="sm">${sar(restrictedIn - restrictedOut)}</b><span>رصيد التبرعات المقيدة غير المصروف</span></div>
  </div>
  <div class="r-grid2">
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="git-pull-request-arrow"></i> سندات الصرف في الدورة</h3></div>
      ${pipe.map(p => `<div class="r-row"><span>${vBadge(p.s)}</span><span>${p.n} سند</span><b>${sar(p.a)} ر.س</b></div>`).join('')}
      ${undeposited.length ? `<div class="r-warn"><i data-lucide="landmark"></i> ${undeposited.length} سند قبض لم يُسجَّل إيداعه (${sar(sum(undeposited))} ر.س). المتحصلات فوق 10,000 تودع خلال يوم عمل.</div>` : ''}</div>
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="pie-chart"></i> توزيع المصروفات</h3><span class="r-sub">${Math.round(progShare / totalExp * 100)}% على البرامج والأنشطة</span></div>
      ${groups.map(g => `<div class="r-dept-row"><div class="r-dept-n">${g.t}</div><div class="r-bar"><span style="flex:${g.v || .0001};background:#41747F">${g.v ? sar(g.v) : ''}</span><span style="flex:${Math.max(totalExp - g.v, .0001)};background:#E8EEEF"></span></div></div>`).join('')}</div>
  </div>
  ${byProg.length ? `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="target"></i> البرامج: الموازنة والصرف</h3></div><table class="r-table"><thead><tr><th>البرنامج</th><th>الموازنة</th><th>المصروف</th><th>نسبة الصرف</th><th>الإيراد المقيد له</th></tr></thead><tbody>
    ${byProg.map(x => { const pct = x.bud ? Math.round(x.exp / x.bud * 100) : null; return `<tr><td>${esc(x.p.title)}</td><td>${x.bud ? sar(x.bud) : '—'}</td><td>${sar(x.exp)}</td><td>${pct == null ? '—' : `<div class="r-mini"><span style="width:${Math.min(pct, 100)}%;background:${pct > 100 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#41747F'}"></span></div> ${pct}%`}</td><td>${sar(x.inc)}</td></tr>`; }).join('')}</tbody></table></div>` : ''}`;
}
function yearPicker() { const ys = Array.from(new Set([new Date().getFullYear(), ...FIN.v.map(v => +String(v.date).slice(0, 4)).filter(Boolean)])).sort((a, b) => b - a); return `<div class="r-filters"><select onchange="FIN.year=+this.value;paintFinance()">${ys.map(y => `<option${y === FIN.year ? ' selected' : ''}>${y}</option>`).join('')}</select></div>`; }

/* ── قوائم السندات ── */
function finVouchers(kind) {
  const list = FIN.v.filter(v => v.kind === kind && v.status !== 'request' && (!FIN.stFilter || v.status === FIN.stFilter)).sort((a, b) => (b.number || 0) - (a.number || 0));
  const sts = kind === 'payment' ? ['pending', 'reviewed', 'approved', 'paid', 'rejected', 'void', 'draft'] : ['pending', 'reviewed', 'approved', 'rejected', 'void', 'draft'];
  return `<div class="r-filters"><div class="r-seg">${[''].concat(sts).map(s => `<button class="${FIN.stFilter === s ? 'on' : ''}" onclick="FIN.stFilter='${s}';paintFinance()">${s ? V_STATUS[s].t : 'الكل'}</button>`).join('')}</div>
    <button class="btn btn-ghost btn-sm" onclick="finExport('${kind}')"><i data-lucide="download"></i> تصدير CSV</button></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>رقم</th><th>التاريخ</th><th>${kind === 'payment' ? 'المستفيد' : 'المستلم منه'}</th><th>البند</th><th>البرنامج</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${list.map(v => `<tr onclick="voucherView('${v.id}')" style="cursor:pointer"><td><b>${v.number || '—'}</b></td><td>${fmtD(v.date)}</td><td>${esc(v.party)}${v.fund === 'restricted' ? ' <span class="r-chip" style="--c:#8A6D3B">مقيد</span>' : ''}</td><td>${esc(finCat(v.category).name)}</td><td>${esc(programName(v.program_id) || '—')}</td><td><b>${sar(v.amount)}</b></td><td>${vBadge(v.status)}${v.board_required ? ' <span class="r-chip" style="--c:#ef4444" title="يتجاوز 20,000 ريال">مجلس الإدارة</span>' : ''}${kind === 'receipt' && !v.deposited && !['void', 'rejected'].includes(v.status) ? ' <span class="r-chip" style="--c:#f59e0b">لم يودع</span>' : ''}</td><td>${v.attachment_url ? '<i data-lucide="paperclip"></i>' : ''}</td></tr>`).join('') || `<tr><td colspan="8">${rEmpty('receipt-text', 'لا سندات.')}</td></tr>`}</tbody></table></div>`;
}
function finRequests() {
  const list = FIN.v.filter(v => v.status === 'request');
  return `<p class="r-sub">طلبات الصرف الواردة من الإدارات (نموذج طلب الصرف على النشاط). تحوَّل إلى سند صرف بعد التأكد من المستندات وتوفر الرصيد.</p>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>الإدارة الطالبة</th><th>مقدم الطلب</th><th>الغرض</th><th>البرنامج</th><th>المبلغ</th><th>المستندات</th><th></th></tr></thead><tbody>
  ${list.map(v => `<tr><td>${esc(DEPTS[v.dept] ? DEPTS[v.dept].short : '—')}</td><td>${esc(memberName(v.created_by))}</td><td>${esc(v.description)}<div class="r-sub">${esc(v.party)}</div></td><td>${esc(programName(v.program_id) || '—')}</td><td><b>${sar(v.amount)}</b></td><td>${v.attachment_url ? linkChip({ url: v.attachment_url, title: 'المستندات' }) : '<span class="r-sub">لا يوجد</span>'}</td>
    <td style="white-space:nowrap"><button class="btn btn-gold btn-sm" onclick="voucherModal('${v.id}','payment',true)">تحويل لسند</button> <button class="btn btn-ghost btn-sm" onclick="vReject('${v.id}')">رفض</button></td></tr>`).join('') || `<tr><td colspan="7">${rEmpty('hand-coins', 'لا طلبات صرف جديدة.')}</td></tr>`}</tbody></table></div>`;
}
function finExport(kind) {
  const list = FIN.v.filter(v => v.kind === kind && v.status !== 'request');
  const head = ['الرقم', 'التاريخ', 'الطرف', 'البند', 'البرنامج', 'نوع التبرع', 'طريقة الدفع', 'المرجع', 'المبلغ', 'الحالة', 'الوصف'];
  const rows = list.map(v => [v.number, v.date, v.party, finCat(v.category).name, programName(v.program_id), v.fund === 'restricted' ? 'مقيد' : 'غير مقيد', PAY_METHODS[v.method], v.reference, v.amount, V_STATUS[v.status].t, v.description]);
  const csv = '﻿' + [head].concat(rows).map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = (kind === 'payment' ? 'سندات-الصرف' : 'سندات-القبض') + '-' + today() + '.csv'; a.click();
}

/* ── إنشاء/تعديل سند ── */
function catOptions(kind, sel) {
  if (kind === 'receipt') return FIN_REVENUE.map(c => `<option value="${c.key}"${c.key === sel ? ' selected' : ''}>${c.name}</option>`).join('');
  return Object.entries(FIN_EXP_GROUPS).map(([g, t]) => `<optgroup label="${t}">${FIN_EXPENSE.filter(c => c.group === g).map(c => `<option value="${c.key}"${c.key === sel ? ' selected' : ''}>${c.name}</option>`).join('')}</optgroup>`).join('');
}
function voucherModal(id, kind, fromRequest) {
  const v = id ? FIN.v.find(x => x.id === id) : { kind, date: today(), amount: '', party: '', donor_id: '', category: kind === 'receipt' ? 'don_grantors' : 'prog_exp', program_id: '', dept: '', fund: 'unrestricted', method: 'transfer', reference: '', bank_account: '', description: '', attachment_url: '', quotes_count: 0, status: 'pending' };
  kind = v.kind;
  const P = kind === 'payment';
  openModal((fromRequest ? 'تحويل طلب الصرف إلى سند' : id ? 'تعديل ' : '') + (fromRequest ? '' : P ? 'سند صرف' : 'سند قبض') + (v.number ? ' رقم ' + v.number : ''), `
    <div class="row3"><div class="field"><label>التاريخ</label><input type="date" id="v_date" value="${esc(v.date)}"></div>
      <div class="field"><label>المبلغ (ر.س)</label><input type="number" min="0" step="0.01" id="v_amount" value="${esc(v.amount)}" oninput="vLive()"></div>
      <div class="field"><label>طريقة ${P ? 'الصرف' : 'الاستلام'}</label><select id="v_method" onchange="vLive()">${Object.entries(PAY_METHODS).map(([k, t]) => `<option value="${k}"${k === v.method ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="r-words" id="v_words"></div>
    <div class="row2"><div class="field"><label>${P ? 'صرفنا للمكرم / المستفيد' : 'استلمنا من المكرم / الجهة'}</label><input id="v_party" value="${esc(v.party)}" list="v_donors"><datalist id="v_donors">${FIN.donors.map(d => `<option value="${esc(d.name)}">`).join('')}</datalist></div>
      ${P ? `<div class="field"><label>آيبان المستفيد / الحساب</label><input id="v_bank" dir="ltr" value="${esc(v.bank_account)}" placeholder="SA…"></div>` : `<div class="field"><label>الداعم (من السجل)</label><select id="v_donor"><option value="">—</option>${FIN.donors.map(d => `<option value="${d.id}"${d.id === v.donor_id ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>`}</div>
    <div class="row2"><div class="field"><label>${P ? 'بند المصروف' : 'بند الإيراد'}</label><select id="v_cat" onchange="vLive()">${catOptions(kind, v.category)}</select></div>
      <div class="field"><label>البرنامج / النشاط</label><select id="v_prog">${programOptions(v.program_id, 'عام (غير مرتبط ببرنامج)')}</select></div></div>
    <div class="row3"><div class="field"><label>نوع الأموال</label><select id="v_fund"><option value="unrestricted">غير مقيدة</option><option value="restricted"${v.fund === 'restricted' ? ' selected' : ''}>مقيدة لبرنامج / مشروع</option></select></div>
      <div class="field"><label>رقم الشيك / الحوالة</label><input id="v_ref" value="${esc(v.reference)}"></div>
      ${P ? `<div class="field"><label>الإدارة الطالبة</label><select id="v_dept"><option value="">—</option>${deptOptions(v.dept)}</select></div>` : `<div class="field"><label>الإيداع</label><label class="r-check"><input type="checkbox" id="v_dep"${v.deposited ? ' checked' : ''}> أودع في البنك</label></div>`}</div>
    <div class="field"><label>${P ? 'وذلك قيمة (أسباب الصرف)' : 'الغرض من المبلغ'}</label><textarea id="v_desc" rows="2">${esc(v.description)}</textarea></div>
    <div class="row2"><div class="field"><label><i data-lucide="paperclip" class="inl"></i> المستندات المؤيدة (رابط Google Drive)</label><input id="v_att" dir="ltr" value="${esc(v.attachment_url)}" placeholder="https://drive.google.com/…"></div>
      ${P ? `<div class="field"><label>عدد عروض الأسعار</label><input type="number" min="0" id="v_quotes" value="${esc(v.quotes_count || 0)}" oninput="vLive()"></div>` : '<div></div>'}</div>
    <div id="v_warn"></div>
    ${P ? `<details class="r-docs"><summary>المستندات المطلوبة حسب سياسة الصرف</summary><ul>
      <li>مشتريات: فاتورة أصلية باسم ${TERMS.org} + أمر الشراء + إيصال الاستلام + محضر فحص إذا تجاوزت 1,000 ريال.</li>
      <li>عقود الخدمات: العقد أو خطاب التعميد + إفادة الإدارة بتنفيذ الخدمة.</li>
      <li>أصل ثابت: نموذج تعميد + عروض الأسعار + الفاتورة، ثم إدراجه في سجل الأصول.</li>
      <li>رواتب: كشف الاستحقاقات من الموارد البشرية معتمداً.</li></ul></details>` : ''}`,
    async () => {
      const row = { date: fval('v_date'), amount: Number(fval('v_amount') || 0), method: fval('v_method'), party: fval('v_party'), category: fval('v_cat'), program_id: fval('v_prog') || null, fund: fval('v_fund'), reference: fval('v_ref'), description: fval('v_desc'), attachment_url: fval('v_att') };
      if (P) Object.assign(row, { bank_account: fval('v_bank'), dept: fval('v_dept'), quotes_count: Number(fval('v_quotes') || 0) });
      else Object.assign(row, { donor_id: fval('v_donor') || null, deposited: fval('v_dep'), deposited_at: fval('v_dep') ? (v.deposited_at || today()) : null });
      if (!row.amount || !row.party) { rToast('المبلغ واسم الطرف مطلوبان', 1); return; }
      if (!validUrl(row.attachment_url)) { rToast('رابط المستندات يجب أن يبدأ بـ https://', 1); return; }
      if (row.fund === 'restricted' && !row.program_id) { rToast('الأموال المقيدة يجب ربطها ببرنامج (سياسة توجيه التبرع إلى مشروع)', 1); return; }
      try {
        if (fromRequest) { row.status = 'pending'; await RDB.update('vouchers', id, row); }
        else if (id) await RDB.update('vouchers', id, row);
        else { row.kind = kind; row.status = 'pending'; await RDB.insert('vouchers', row); }
        closeModal(); rToast(fromRequest ? 'تم تحويل الطلب إلى سند — بانتظار المراجعة المالية' : 'تم حفظ السند — بانتظار المراجعة المالية'); renderFinance();
      } catch (e) { rToast(e.message, 1); }
    }, id && !fromRequest && (isAdmin() || ['draft', 'rejected'].includes(v.status)) ? async () => { if (!confirm('حذف السند نهائياً؟ (يفضّل الإلغاء للحفاظ على التسلسل)')) return; try { await RDB.remove('vouchers', id); closeModal(); renderFinance(); } catch (e) { rToast(e.message, 1); } } : null);
  setTimeout(vLive, 0);
}
function vLive() {
  const a = Number(fval('v_amount') || 0), m = fval('v_method'), F = CONFIG.finance, P = !!document.getElementById('v_quotes');
  const w = document.getElementById('v_words'); if (w) w.textContent = a ? tafqeet(a) : '';
  const msgs = [];
  if (P && m === 'cash' && a > F.cashLimit) msgs.push(['bad', 'الصرف النقدي لا يتجاوز 10,000 ريال — اختر شيكاً أو حوالة بنكية.']);
  if (P && a > F.boardLimit) msgs.push(['warn', 'المبلغ يتجاوز 20,000 ريال — يتطلب اعتماد مجلس الإدارة (لائحة الصلاحيات). أرفق قرار المجلس في المستندات.']);
  if (P && a > F.quotesLimit && Number(fval('v_quotes') || 0) < 3) msgs.push(['warn', 'المشتريات فوق 10,000 ريال تتطلب 3 عروض أسعار على الأقل وفحص لجنة الشراء المباشر.']);
  if (P && fval('v_cat') === 'cap_assets') msgs.push(['info', 'أصل ثابت: يُدرج في سجل الأصول بعد الصرف.']);
  if (P && a > F.inspectLimit && fval('v_cat') !== 'ad_salaries') msgs.push(['info', 'للأصناف الموردة فوق 1,000 ريال: محضر فحص يوقعه مدير الإدارة الطالبة وأمين الصندوق.']);
  if (!P && a > F.depositLimit) msgs.push(['info', 'المتحصلات فوق 10,000 ريال تودع في البنك نفس اليوم أو حتى 12 ظهراً من يوم العمل التالي.']);
  const box = document.getElementById('v_warn'); if (box) box.innerHTML = msgs.map(x => `<div class="r-warn ${x[0]}"><i data-lucide="${x[0] === 'bad' ? 'octagon-alert' : x[0] === 'warn' ? 'triangle-alert' : 'info'}"></i> ${x[1]}</div>`).join('');
  refreshIcons();
}

/* ── عرض السند وإجراءات الدورة ── */
function voucherView(id) {
  const v = FIN.v.find(x => x.id === id); if (!v) return;
  const P = v.kind === 'payment';
  const acts = [];
  if (v.status === 'pending' && canReviewFin()) acts.push(`<button class="btn btn-gold" onclick="vMove('${id}','reviewed')"><i data-lucide="search-check"></i> تمت المراجعة — الرصيد متوفر</button>`);
  if (v.status === 'reviewed' && isAdmin()) acts.push(`<button class="btn btn-gold" onclick="vMove('${id}','approved')"><i data-lucide="stamp"></i> اعتماد</button>`);
  if (v.status === 'pending' && isAdmin() && !canReviewFin()) acts.push(`<button class="btn btn-gold" onclick="vMove('${id}','approved')">اعتماد</button>`);
  if (v.status === 'approved' && P && can('finance')) acts.push(`<button class="btn btn-gold" onclick="vPay('${id}')"><i data-lucide="banknote"></i> تسجيل الصرف</button>`);
  if (!P && can('finance') && !v.deposited && !['void', 'rejected'].includes(v.status)) acts.push(`<button class="btn btn-ghost" onclick="vDeposit('${id}')"><i data-lucide="landmark"></i> تسجيل الإيداع</button>`);
  if (['pending', 'reviewed'].includes(v.status) && canReviewFin()) acts.push(`<button class="btn btn-ghost" onclick="vReject('${id}')">رفض</button>`);
  if (['pending', 'draft', 'rejected'].includes(v.status) && can('finance')) acts.push(`<button class="btn btn-ghost" onclick="closeModal();voucherModal('${id}')">تعديل</button>`);
  if (isAdmin() && !['void'].includes(v.status)) acts.push(`<button class="btn btn-ghost" style="color:var(--bad)" onclick="vVoid('${id}')">إلغاء السند</button>`);
  const step = (label, who, at, on) => `<div class="r-step${on ? ' on' : ''}"><span></span><b>${label}</b><small>${who ? esc(who) + ' · ' + fmtD(at) : '—'}</small></div>`;
  document.getElementById('modalRoot').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:720px">
    <div class="modal-head"><h3>${P ? 'سند صرف' : 'سند قبض'} رقم ${v.number || '—'}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="r-vhead"><div><b class="r-vamt">${sar(v.amount)} <small>ر.س</small></b><div class="r-sub">${tafqeet(v.amount)}</div></div>${vBadge(v.status)}</div>
      <div class="r-steps">${step(P ? 'أُعدّ السند' : 'سُجّل القبض', memberName(v.created_by), v.created_at, 1)}${step('المراجعة المالية', v.reviewed_by && memberName(v.reviewed_by), v.reviewed_at, !!v.reviewed_by)}${step('اعتماد ' + TERMS.head, v.approved_by && memberName(v.approved_by), v.approved_at, !!v.approved_by)}${P ? step('الصرف', v.paid_by && memberName(v.paid_by), v.paid_at, !!v.paid_by) : step('الإيداع', v.deposited ? 'مودع' : '', v.deposited_at, v.deposited)}</div>
      <dl class="r-dl"><dt>${P ? 'المستفيد' : 'المستلم منه'}</dt><dd>${esc(v.party)}</dd><dt>التاريخ</dt><dd>${fmtD(v.date)}</dd><dt>البند</dt><dd>${esc(finCat(v.category).name)}</dd><dt>البرنامج</dt><dd>${esc(programName(v.program_id) || 'عام')}</dd>
        <dt>الأموال</dt><dd>${v.fund === 'restricted' ? 'مقيدة' : 'غير مقيدة'}</dd><dt>الطريقة</dt><dd>${PAY_METHODS[v.method] || v.method}${v.reference ? ' — ' + esc(v.reference) : ''}</dd>
        ${v.bank_account ? `<dt>الحساب</dt><dd dir="ltr" style="text-align:right">${esc(v.bank_account)}</dd>` : ''}${v.dept ? `<dt>الإدارة الطالبة</dt><dd>${esc(DEPTS[v.dept].name)}</dd>` : ''}
        <dt>البيان</dt><dd>${esc(v.description || '—')}</dd>${P ? `<dt>عروض الأسعار</dt><dd>${v.quotes_count || 0}</dd>` : ''}
        <dt>المستندات</dt><dd>${v.attachment_url ? linkChip({ url: v.attachment_url, title: 'فتح المستندات المؤيدة' }) : '<span style="color:var(--bad)">لم تُرفق مستندات</span>'}</dd></dl>
      ${v.board_required ? `<div class="r-warn warn"><i data-lucide="triangle-alert"></i> يتجاوز 20,000 ريال — يلزم قرار مجلس الإدارة ضمن المستندات.</div>` : ''}
      ${v.reject_reason ? `<div class="r-warn bad"><i data-lucide="octagon-alert"></i> سبب الرفض/الإلغاء: ${esc(v.reject_reason)}</div>` : ''}
    </div>
    <div class="modal-foot" style="flex-wrap:wrap">${acts.join('')}<button class="btn btn-ghost" style="margin-right:auto" onclick="vPrint('${id}')"><i data-lucide="printer"></i> طباعة السند</button></div></div></div>`;
  refreshIcons();
}
async function vMove(id, status, extra) {
  try { await RDB.update('vouchers', id, Object.assign({ status }, extra || {})); closeModal(); rToast(V_STATUS[status].t); await renderFinance(); if (CUR === 'home') renderHome(); }
  catch (e) { rToast(e.message, 1); }
}
function vPay(id) { const ref = prompt('رقم الشيك أو الحوالة:', (FIN.v.find(x => x.id === id) || {}).reference || ''); if (ref === null) return; vMove(id, 'paid', ref ? { reference: ref } : {}); }
function vReject(id) { const r = prompt('سبب الرفض (يظهر لمقدم الطلب):'); if (r === null) return; vMove(id, 'rejected', { reject_reason: r }); }
function vVoid(id) { const r = prompt('سبب الإلغاء (يحفظ مع السند للمراجعة):'); if (!r) return; vMove(id, 'void', { reject_reason: r }); }
async function vDeposit(id) { try { await RDB.update('vouchers', id, { deposited: true, deposited_at: today() }); closeModal(); rToast('تم تسجيل الإيداع'); renderFinance(); } catch (e) { rToast(e.message, 1); } }

/* ── طباعة السند بهوية العميل (شعاره وخطه من config.js) — مطابق لقالب «سند صرف/قبض» التقليدي ── */
function vPrint(id) {
  const v = FIN.v.find(x => x.id === id) || (W._myReq || []).find(x => x.id === id); if (!v) return;
  const P = v.kind === 'payment', base = location.href.replace(/[^/]*$/, '');
  const sig = (ar, en, who) => `<div class="sig"><span>${ar}</span><i>${who ? esc(who) : ''}</i><small>${en}</small></div>`;
  rPrintHTML(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${P ? 'سند صرف' : 'سند قبض'} ${v.number || ''}</title><base href="${base}">
  <style>${CONFIG.printFonts || ''}
  @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:${CONFIG.printFontFamily || 'Tahoma'},Tahoma,sans-serif;color:#14292D;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pg{width:210mm;min-height:297mm;position:relative;padding:16mm 16mm 30mm;overflow:hidden}
  .top{display:flex;justify-content:space-between;align-items:flex-start}.top img{height:56px}.ttl h1{margin:0;font-size:34px}.ttl small{color:#c0392b;font-size:13px}.ttl b{color:#14292D}
  .pills{display:grid;grid-template-columns:1.2fr 1.6fr .8fr;gap:12px;margin:22px 0 18px}.pill{border:1.4px solid #41747F;border-radius:999px;padding:9px 18px;font-size:15px;display:flex;justify-content:space-between}
  .row{display:flex;align-items:flex-end;gap:12px;margin:15px 0;font-size:16px}.row .l{white-space:nowrap;font-weight:700}.row .v{flex:1;border-bottom:1px solid #9fb6ba;padding:0 6px 3px;min-height:26px}.row .en{white-space:nowrap;color:#5d7378;font-size:13px}
  .box{display:inline-block;width:14px;height:14px;border:1.4px solid #14292D;border-radius:3px;vertical-align:-2px;margin-left:5px;text-align:center;line-height:11px;font-size:12px}
  .wm{position:absolute;inset:0;display:grid;place-items:center;opacity:.06;pointer-events:none}.wm img{width:360px}
  .sigs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:40px}.sig{text-align:center;font-size:14px}.sig span{font-weight:700;display:block}.sig i{display:block;font-style:normal;border-bottom:1px solid #9fb6ba;min-height:36px;padding-top:12px;font-size:12.5px;color:#41747F}.sig small{color:#5d7378}
  .meta{margin-top:18px;font-size:11.5px;color:#5d7378;border-top:1px dashed #cfdcde;padding-top:8px}
  .foot{position:absolute;bottom:18mm;inset-inline:16mm;display:flex;justify-content:space-between;font-size:11.5px;color:#41747F}
  .zz{position:absolute;bottom:0;left:0;right:0;height:11mm;background:linear-gradient(135deg,#41747F 25%,transparent 25%) 0 0/24mm 11mm,linear-gradient(225deg,#41747F 25%,transparent 25%) 0 0/24mm 11mm,linear-gradient(135deg,#CAB05F 25%,transparent 25%) 12mm 0/24mm 11mm,linear-gradient(225deg,#CAB05F 25%,transparent 25%) 12mm 0/24mm 11mm}
  @media screen{body{background:#e9eef0}.pg{background:#fff;margin:20px auto;box-shadow:0 10px 40px rgba(0,0,0,.15)}}</style></head><body>
  <div class="pg">${CONFIG.brandMark ? `<div class="wm"><img src="${esc(CONFIG.brandMark)}" alt=""></div>` : ""}
    <div class="top"><img src="${esc(CONFIG.brandLogo)}" alt="${esc(CONFIG.companyName)}"><div class="ttl"><h1>${P ? 'سند صرف' : 'سند قبض'}</h1><small>رقم السند: <b>${v.number || '—'}</b></small></div></div>
    <div class="pills"><div class="pill"><span>التاريخ</span><b>${esc(v.date)}</b></div><div class="pill"><span>المبلغ</span><b>${sar(v.amount)} ريال</b></div><div class="pill"><span>الأموال</span><b style="font-size:12px">${v.fund === 'restricted' ? 'مقيد' : 'غير مقيد'}</b></div></div>
    <div class="row"><span class="l">${P ? 'صرفنا للمكرم' : 'استلمنا من المكرم'}</span><span class="v">${esc(v.party)}</span><span class="en">${P ? 'Paid To' : 'Received From'}</span></div>
    <div class="row"><span class="l">مبلغ وقدره</span><span class="v">${tafqeet(v.amount)}</span><span class="en">The Sum Of</span></div>
    <div class="row"><span class="l"><span class="box">${v.method === 'cash' ? '✓' : ''}</span>نقداً &nbsp; <span class="box">${v.method === 'cheque' ? '✓' : ''}</span>شيك &nbsp; <span class="box">${v.method === 'transfer' ? '✓' : ''}</span>حوالة &nbsp; رقم</span><span class="v">${esc(v.reference)}</span><span class="l">على بنك / حساب</span><span class="v" dir="ltr" style="text-align:right">${esc(v.bank_account || CONFIG.bankName)}</span></div>
    <div class="row"><span class="l">وذلك قيمة</span><span class="v">${esc(v.description)}</span><span class="en">For</span></div>
    <div class="row"><span class="l">البند</span><span class="v">${esc(finCat(v.category).name)}</span><span class="l">البرنامج</span><span class="v">${esc(programName(v.program_id) || 'عام')}</span></div>
    ${P ? '' : `<div class="row"><span class="l">الإيداع</span><span class="v">${v.deposited ? 'أودع بتاريخ ' + esc(v.deposited_at || '') : ''}</span></div>`}
    <div class="sigs">${sig('أعدّه (المحاسب)', 'Accountant', memberName(v.created_by))}${sig('راجعه (الشؤون المالية)', 'Finance Manager', v.reviewed_by ? memberName(v.reviewed_by) : '')}${sig('اعتمده (' + TERMS.head + ')', 'Executive Director', v.approved_by ? memberName(v.approved_by) : '')}${sig(P ? 'المستلم (الاسم الرباعي)' : 'أمين الصندوق', P ? 'Receiver' : 'Cashier', '')}</div>
    <div class="meta">الحالة في النظام: ${V_STATUS[v.status].t}${v.approved_at ? ' · اعتمد إلكترونياً في ' + new Date(v.approved_at).toLocaleString('ar-u-ca-gregory-nu-latn') : ''}${v.attachment_url ? ' · المستندات المؤيدة: ' + esc(v.attachment_url) : ''}</div>
    <div class="foot"><span>${esc(CONFIG.companyName)} — ترخيص ${esc(CONFIG.license)}</span><span>${esc(CONFIG.companyAddress)}</span><span dir="ltr">${esc(CONFIG.websiteUrl.replace(/^https?:\/\//, ''))}</span></div><div class="zz"></div></div>
  </body></html>`);
}
/* طباعة عبر إطار مخفي — لا يحتاج إذن النوافذ المنبثقة، ويتيح «حفظ كـ PDF» من نافذة الطباعة */
function rPrintHTML(html) {
  let fr = document.getElementById('rPrintFrame'); if (fr) fr.remove();
  fr = document.createElement('iframe'); fr.id = 'rPrintFrame'; fr.setAttribute('aria-hidden', 'true');
  fr.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px';
  document.body.appendChild(fr);
  const d = fr.contentDocument; d.open(); d.write(html); d.close();
  fr.onload = () => setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { rToast('تعذّرت الطباعة', 1); } }, 300);
}

/* ── طلبات الصرف (لكل موظف) ── */
async function renderRequests() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  const all = await RDB.list('vouchers', { order: 'created_at' }).catch(() => []);
  W._myReq = all.filter(v => v.created_by === ME.id && v.kind === 'payment');
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>طلبات الصرف</h1><p class="r-sub" style="margin:4px 0 0">اطلب صرف مبلغ لنشاط أو برنامج — يصل للشؤون المالية، ثم يمر بالمراجعة والاعتماد، وتتابع حالته هنا.</p></div><button class="btn btn-gold" onclick="requestModal()"><i data-lucide="plus"></i> طلب صرف جديد</button></div>
    <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>التاريخ</th><th>الغرض</th><th>البرنامج</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead><tbody>
    ${W._myReq.map(v => `<tr><td>${fmtD(v.created_at)}</td><td>${esc(v.description)}<div class="r-sub">${esc(v.party)}</div>${v.reject_reason ? `<div style="color:var(--bad);font-size:12.5px">${esc(v.reject_reason)}</div>` : ''}</td><td>${esc(programName(v.program_id) || '—')}</td><td><b>${sar(v.amount)}</b></td><td>${vBadge(v.status)}</td><td>${v.status === 'request' ? `<button class="link-btn" onclick="requestModal('${v.id}')">تعديل</button>` : v.number ? `<button class="link-btn" onclick="vPrint('${v.id}')">السند</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="6">${rEmpty('hand-coins', 'لم تقدم طلبات صرف بعد.')}</td></tr>`}</tbody></table></div></div>`;
  refreshIcons();
}
function requestModal(id) {
  const v = id ? (W._myReq || []).find(x => x.id === id) : { amount: '', party: '', program_id: '', description: '', attachment_url: '', dept: ME.dept };
  openModal(id ? 'تعديل طلب الصرف' : 'طلب صرف على نشاط', `
    <div class="row2"><div class="field"><label>المبلغ المطلوب (ر.س)</label><input type="number" min="0" id="q_amount" value="${esc(v.amount)}"></div>
      <div class="field"><label>الإدارة الطالبة</label><select id="q_dept">${deptOptions(v.dept)}</select></div></div>
    <div class="field"><label>الغرض من الصرف</label><textarea id="q_desc" rows="2" placeholder="مثال: طباعة رول أب لمعرض آفاق">${esc(v.description)}</textarea></div>
    <div class="row2"><div class="field"><label>المورد / المستفيد</label><input id="q_party" value="${esc(v.party)}"></div>
      <div class="field"><label>البرنامج / النشاط</label><select id="q_prog">${programOptions(v.program_id, 'عام')}</select></div></div>
    <div class="field"><label>رابط المستندات (عرض السعر / الفاتورة) على Google Drive</label><input id="q_att" dir="ltr" value="${esc(v.attachment_url)}" placeholder="https://drive.google.com/…"></div>
    <div class="r-hint">الطلب أمر كتابي بديل عن الأوامر الشفهية (سياسة الصرف). المستندات يجب أن تكون باسم ${TERMS.org}.</div>`,
    async () => {
      const row = { amount: Number(fval('q_amount') || 0), dept: fval('q_dept'), description: fval('q_desc'), party: fval('q_party'), program_id: fval('q_prog') || null, attachment_url: fval('q_att') };
      if (!row.amount || !row.description) { rToast('المبلغ والغرض مطلوبان', 1); return; }
      if (!validUrl(row.attachment_url)) { rToast('الرابط يجب أن يبدأ بـ https://', 1); return; }
      try {
        if (id) await RDB.update('vouchers', id, row);
        else await RDB.insert('vouchers', Object.assign(row, { kind: 'payment', status: 'request', category: 'prog_exp', method: 'transfer', date: today(), created_by: ME.id }));
        closeModal(); rToast('أُرسل طلب الصرف للشؤون المالية'); if (CUR === 'requests') renderRequests(); else rerenderCur();
      } catch (e) { rToast(e.message, 1); }
    }, id ? async () => { if (!confirm('حذف الطلب؟')) return; await RDB.remove('vouchers', id); closeModal(); renderRequests(); } : null);
}

/* ── الداعمون ── */
const DONOR_KINDS = { foundation: 'مؤسسة مانحة', government: 'جهة حكومية', company: 'شركة / قطاع خاص', individual: 'فرد' };
function finDonors() {
  const sumBy = id => FIN.v.filter(v => v.kind === 'receipt' && v.donor_id === id && okV(v)).reduce((s, v) => s + Number(v.amount), 0);
  return `<div class="r-filters"><button class="btn btn-gold btn-sm" onclick="donorModal()"><i data-lucide="plus"></i> داعم جديد</button></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>الداعم</th><th>النوع</th><th>التواصل</th><th>إجمالي الدعم المعتمد</th><th>ملاحظات</th><th></th></tr></thead><tbody>
  ${FIN.donors.map(d => `<tr><td><b>${esc(d.name)}</b></td><td>${DONOR_KINDS[d.kind] || d.kind}</td><td>${esc(d.contact)}${d.phone ? `<div class="r-sub" dir="ltr" style="text-align:right">${esc(d.phone)}</div>` : ''}${d.email ? `<div class="r-sub">${esc(d.email)}</div>` : ''}</td><td>${can(['finance', 'reports']) ? sar(sumBy(d.id)) : '—'}</td><td>${esc(d.notes)}</td><td><button class="link-btn" onclick="donorModal('${d.id}')">تعديل</button></td></tr>`).join('') || `<tr><td colspan="6">${rEmpty('handshake', 'لا داعمين بعد.')}</td></tr>`}</tbody></table></div>`;
}
function donorModal(id) {
  const d = id ? FIN.donors.find(x => x.id === id) : { name: '', kind: 'foundation', contact: '', phone: '', email: '', notes: '' };
  openModal(id ? 'تعديل داعم' : 'داعم جديد', `
    <div class="row2"><div class="field"><label>الاسم</label><input id="d_name" value="${esc(d.name)}"></div><div class="field"><label>النوع</label><select id="d_kind">${Object.entries(DONOR_KINDS).map(([k, t]) => `<option value="${k}"${k === d.kind ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="row3"><div class="field"><label>مسؤول التواصل</label><input id="d_contact" value="${esc(d.contact)}"></div><div class="field"><label>الجوال</label><input id="d_phone" dir="ltr" value="${esc(d.phone)}"></div><div class="field"><label>البريد</label><input id="d_email" dir="ltr" value="${esc(d.email)}"></div></div>
    <div class="field"><label>ملاحظات (المنح، مواعيد التقارير…)</label><textarea id="d_notes" rows="2">${esc(d.notes)}</textarea></div>`,
    async () => { const row = { name: fval('d_name'), kind: fval('d_kind'), contact: fval('d_contact'), phone: fval('d_phone'), email: fval('d_email'), notes: fval('d_notes') }; if (!row.name) return; try { if (id) await RDB.update('donors', id, row); else await RDB.insert('donors', row); closeModal(); renderFinance(); } catch (e) { rToast(e.message, 1); } },
    id && can('finance') ? async () => { if (!confirm('حذف الداعم؟')) return; await RDB.remove('donors', id); closeModal(); renderFinance(); } : null);
}

/* ── الموازنة ── */
function finBudget() {
  const B = FIN.budgets.filter(b => b.year == FIN.year);
  const spent = b => FIN.v.filter(v => v.kind === 'payment' && okV(v) && yr(v) && (b.program_id ? v.program_id === b.program_id : !v.program_id) && v.category === b.category).reduce((s, v) => s + Number(v.amount), 0);
  const total = B.reduce((s, b) => s + Number(b.amount), 0), totalSpent = B.reduce((s, b) => s + spent(b), 0);
  return `${yearPicker()}<div class="r-kpis"><div class="r-kpi static"><i data-lucide="target"></i><b class="sm">${sar(total)}</b><span>الموازنة المعتمدة ${FIN.year}</span></div><div class="r-kpi static"><i data-lucide="trending-down"></i><b class="sm">${sar(totalSpent)}</b><span>المصروف منها</span></div><div class="r-kpi static"><i data-lucide="percent"></i><b>${total ? Math.round(totalSpent / total * 100) : 0}%</b><span>نسبة التنفيذ</span></div></div>
  <div class="r-filters">${can('finance') ? `<button class="btn btn-gold btn-sm" onclick="budgetModal()"><i data-lucide="plus"></i> بند موازنة</button>` : ''}<span class="r-sub">لا صرف إلا في حدود الموازنة المعتمدة؛ المناقلة بين البنود حتى 25% بصلاحية ${TERMS.head}.</span></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>البرنامج</th><th>البند</th><th>المعتمد</th><th>المصروف</th><th>المتبقي</th><th>التنفيذ</th><th></th></tr></thead><tbody>
  ${B.map(b => { const s = spent(b), pct = b.amount ? Math.round(s / b.amount * 100) : 0; return `<tr><td>${esc(programName(b.program_id) || 'عام')}</td><td>${esc(finCat(b.category).name)}</td><td>${sar(b.amount)}</td><td>${sar(s)}</td><td style="color:${b.amount - s < 0 ? 'var(--bad)' : 'inherit'}">${sar(b.amount - s)}</td><td><div class="r-mini"><span style="width:${Math.min(pct, 100)}%;background:${pct > 100 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#41747F'}"></span></div> ${pct}%</td><td>${can('finance') ? `<button class="link-btn" onclick="budgetModal('${b.id}')">تعديل</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="7">${rEmpty('target', 'لا بنود موازنة لهذه السنة.')}</td></tr>`}</tbody></table></div>`;
}
function budgetModal(id) {
  const b = id ? FIN.budgets.find(x => x.id === id) : { year: FIN.year, program_id: '', category: 'prog_exp', amount: '', notes: '' };
  openModal(id ? 'تعديل بند موازنة' : 'بند موازنة جديد', `
    <div class="row3"><div class="field"><label>السنة</label><input type="number" id="b_year" value="${esc(b.year)}"></div><div class="field"><label>البرنامج</label><select id="b_prog">${programOptions(b.program_id, 'عام')}</select></div><div class="field"><label>المبلغ</label><input type="number" id="b_amount" value="${esc(b.amount)}"></div></div>
    <div class="field"><label>البند</label><select id="b_cat">${catOptions('payment', b.category)}</select></div><div class="field"><label>ملاحظات</label><input id="b_notes" value="${esc(b.notes)}"></div>`,
    async () => { const row = { year: +fval('b_year'), program_id: fval('b_prog') || null, category: fval('b_cat'), amount: Number(fval('b_amount') || 0), notes: fval('b_notes') }; try { if (id) await RDB.update('budgets', id, row); else await RDB.insert('budgets', row); closeModal(); renderFinance(); } catch (e) { rToast(e.message, 1); } },
    id ? async () => { await RDB.remove('budgets', id); closeModal(); renderFinance(); } : null);
}

/* ── قائمة الأنشطة (بنفس تبويب القوائم المالية المراجَعة) ── */
function finReport() {
  const V = FIN.v.filter(v => yr(v) && okV(v));
  const s = (f) => V.filter(f).reduce((a, v) => a + Number(v.amount), 0);
  const rev = FIN_REVENUE.map(c => ({ n: c.name, u: s(v => v.kind === 'receipt' && v.category === c.key && v.fund !== 'restricted'), r: s(v => v.kind === 'receipt' && v.category === c.key && v.fund === 'restricted') })).filter(x => x.u || x.r);
  const exp = Object.entries(FIN_EXP_GROUPS).map(([g, t]) => ({ t, items: FIN_EXPENSE.filter(c => c.group === g).map(c => ({ n: c.name, u: s(v => v.kind === 'payment' && v.category === c.key && v.fund !== 'restricted'), r: s(v => v.kind === 'payment' && v.category === c.key && v.fund === 'restricted') })).filter(x => x.u || x.r) })).filter(g => g.items.length);
  const tot = a => a.reduce((x, i) => ({ u: x.u + i.u, r: x.r + i.r }), { u: 0, r: 0 });
  const tr = tot(rev), te = tot(exp.flatMap(g => g.items));
  const row = (n, u, r, b) => `<tr${b ? ' class="tot"' : ''}><td>${n}</td><td>${sar(u)}</td><td>${sar(r)}</td><td><b>${sar(u + r)}</b></td></tr>`;
  return `${yearPicker()}<div class="card r-card" id="finReportBox"><div class="r-card-h"><h3>قائمة الأنشطة للسنة المنتهية في 31 ديسمبر ${FIN.year}</h3><button class="btn btn-ghost btn-sm" onclick="finPrintReport()"><i data-lucide="printer"></i> طباعة</button></div>
  <p class="r-sub">من السندات المعتمدة في النظام — للمتابعة الإدارية، وليست بديلاً عن القوائم المراجَعة.</p>
  <table class="r-table r-fs"><thead><tr><th></th><th>غير مقيدة</th><th>مقيدة</th><th>الإجمالي</th></tr></thead><tbody>
    <tr class="sec"><td colspan="4">الإيرادات والمكاسب</td></tr>${rev.map(x => row(x.n, x.u, x.r)).join('') || '<tr><td colspan="4" class="r-sub">لا إيرادات معتمدة</td></tr>'}${row('إجمالي الإيرادات والمكاسب', tr.u, tr.r, 1)}
    <tr class="sec"><td colspan="4">المصروفات والخسائر</td></tr>${exp.map(g => `<tr class="grp"><td colspan="4">${g.t}</td></tr>` + g.items.map(x => row('&nbsp;&nbsp;' + x.n, x.u, x.r)).join('')).join('') || '<tr><td colspan="4" class="r-sub">لا مصروفات معتمدة</td></tr>'}${row('إجمالي المصروفات والخسائر', te.u, te.r, 1)}
    ${row('التغير في صافي الأصول خلال السنة', tr.u - te.u, tr.r - te.r, 1)}
  </tbody></table></div>`;
}
function finPrintReport() {
  const h = document.getElementById('finReportBox').innerHTML;
  rPrintHTML(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>قائمة الأنشطة ${FIN.year}</title><style>body{font-family:Tahoma,sans-serif;padding:30px;color:#14292D}button{display:none}table{width:100%;border-collapse:collapse}td,th{padding:7px 10px;border-bottom:1px solid #dde5e6;text-align:right}.tot td{font-weight:700;border-top:2px solid #41747F}.sec td{background:#EEF4F4;font-weight:700}.grp td{font-weight:700;color:#41747F}</style></head><body><h2>${esc(CONFIG.companyName)}</h2>${h}</body></html>`);
}
