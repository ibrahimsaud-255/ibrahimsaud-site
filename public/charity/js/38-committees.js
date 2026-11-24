/* ═════════════════════════════════════════════════════════════════════════
 * «اللجان والماليّة» و«التسجيل» — حقيبة الموسم المرحلة ٣ (من «مدينة القيم»)
 *   اللجان بإداراتها وقادتها وأعضائها وميزانيّاتها، وخطّة تشغيليّة لكلّ لجنة (مهامّ، مؤشّرات، احتياجات)،
 *   والماليّة: إيرادات (منح، رسوم، أخرى) ← سُلَف لقادة اللجان ← مصروفات بفواتير مصوّرة ← إرجاع ← إقفال،
 *   وتنبيه عند ٨٠٪ و١٠٠٪ من الميزانيّة، واعتذارات المشرفين المسبقة.
 *   التسجيل: رابط عامّ لوليّ الأمر (season/register/?t=) برسوم وإيصال تحويل ← تأكيد الدفع ← اعتماد يصنع المشارك.
 * البيانات: season_committees · season_money · season_excuses · season_regs — db/season-committees.sql
 * ملفّ تعريفات فقط (القاعدة في CLAUDE.md).
 * ═════════════════════════════════════════════════════════════════════════ */

/* لجان «مدينة القيم» كما في خططها التشغيليّة (الموسم الأوّل) — مع مهامّ مختصرة لكلّ لجنة */
const SN_COM_TPL = [
  ['الإداريّة', 'الإدارة التنظيميّة', '#64748B', ['حجز المكان والعقد', 'كشوف المشاركين والمشرفين', 'محاضر الاجتماعات اليوميّة']],
  ['الخدمات المساندة', 'الإدارة التنظيميّة', '#78716C', ['الصوت والإضاءة والبروجكتر', 'النقل والمواصلات', 'الإسعافات الأوّليّة']],
  ['الهويّة والعلاقات العامّة', 'الإدارة التنظيميّة', '#DB2777', ['تصميم الهويّة والمطبوعات', 'التغطية والتصوير اليوميّ', 'التواصل مع الداعمين والضيوف']],
  ['المنطقة المهاريّة', 'إدارة المناطق', '#0A84FF', ['جدولة الورش والمدرّبين', 'تذكير الضيوف قبل يومين', 'تجهيز القاعات']],
  ['المنطقة التنافسيّة', 'إدارة المناطق', '#FF9F0A', ['إعداد المسابقات اليوميّة', 'تجهيز أدوات المسابقات', 'رصد النتائج']],
  ['المنطقة الترفيهيّة', 'إدارة المناطق', '#30D158', ['الدوري وجدول المباريات', 'حجز الملاعب والمسبح', 'الألعاب الإلكترونيّة واللوحيّة']],
  ['التموين', 'إدارة المناطق', '#F97316', ['الوجبات وفترة التموين', 'الماء والمشروبات', 'التعاقد مع المورّدين']],
  ['البرامج النوعيّة', 'إدارة الفعاليّات', '#AF52DE', ['برنامج الجمعة', 'حفل الختام والتكريم', 'استضافة الضيوف']],
  ['التحفيز', 'إدارة الفعاليّات', '#EAB308', ['قصّة العملة وتصميمها', 'شراء الجوائز اليوميّة والختاميّة', 'تكريم الأعلى كسباً']],
  ['الضبط', 'إدارة المشاركين', '#EF4444', ['ضبط الدخول والخروج', 'سجلّ المخالفات', 'متابعة الاستئذانات']],
  ['الإرشاد', 'إدارة المشاركين', '#14B8A6', ['المتابعة الفرديّة', 'التواصل مع أولياء الأمور', 'الحالات الخاصّة']],
  ['المتابعة والتقييم', 'المتابعة والتقييم', '#6366F1', ['المؤشّرات وبطاقاتها', 'تقييم الفعاليّات اليوميّ', 'الاستبيانات والتقرير الختاميّ']],
];
const SN_SRC = { grant: 'منحة داعم', fees: 'رسوم المشاركين', other: 'إيراد آخر' };
const snN = v => Math.round((+v || 0) * 100) / 100;
const snSAR = v => snN(v).toLocaleString('en-US', { maximumFractionDigits: 2 });
function snCom(c) {
  const M = (SN.money || []).filter(x => x.committee_id === c.id), sum = k => snN(M.filter(x => x.kind === k).reduce((a, x) => a + +x.amount, 0));
  const spent = sum('expense'), adv = sum('advance'), ret = sum('return'), budget = snN(c.budget);
  return { spent, adv, ret, budget, cash: snN(adv - spent - ret), left: snN(budget - spent), pct: budget ? Math.round(spent / budget * 100) : 0 };
}
function snFin() {
  const M = SN.money || [], inc = {}; M.filter(x => x.kind === 'income').forEach(x => inc[x.source || 'other'] = snN((inc[x.source || 'other'] || 0) + +x.amount));
  const income = snN(Object.values(inc).reduce((a, v) => a + v, 0)), spent = snN(M.filter(x => x.kind === 'expense').reduce((a, x) => a + (+x.amount || 0), 0));
  const budgets = snN((SN.coms || []).reduce((a, c) => a + (+c.budget || 0), 0));
  return { inc, income, spent, budgets, balance: snN(income - spent), unalloc: snN(income - budgets) };
}

/* ═════════ تبويب «اللجان» ═════════ */
function snComView() {
  const C = SN.coms || [], F = snFin(), today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  if (!C.length) return `<div class="card">${rEmpty('users', 'اللجان: لكلّ لجنة قائد وأعضاء وميزانيّة وخطّة. ابدأ بلجان «مدينة القيم» الاثنتي عشرة ثمّ احذف ما لا تحتاجه.', `<button class="btn btn-gold" onclick="snComTpl()"><i data-lucide="sparkles"></i> لجان مدينة القيم</button> <button class="btn btn-ghost" onclick="snComSheet()"><i data-lucide="plus"></i> لجنة</button>`)}</div>`;
  const depts = [...new Set(C.map(c => c.dept || 'أخرى'))];
  const alerts = C.map(c => ({ c, k: snCom(c) })).filter(x => x.k.budget && x.k.pct >= 80 && x.c.status !== 'closed');
  const exc = (SN.excuses || []).filter(e => e.day >= today).sort((a, b) => a.day.localeCompare(b.day));
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snComSheet()"><i data-lucide="plus"></i> لجنة</button><button class="btn btn-ghost" onclick="snMoneySheet('income')"><i data-lucide="landmark"></i> إيراد</button><button class="btn btn-ghost" onclick="snMoneySheet('advance')"><i data-lucide="hand-coins"></i> سلفة</button><button class="btn btn-ghost" onclick="snMoneySheet('expense')"><i data-lucide="receipt"></i> مصروف</button><button class="btn btn-ghost" onclick="snFinPrint()"><i data-lucide="printer"></i> التقرير الماليّ</button></div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="wallet"></i> ماليّة الموسم</h3><span class="r-badge" style="--c:${F.balance >= 0 ? '#30D158' : '#FF453A'}">الرصيد ${snSAR(F.balance)} ر.س</span></div>
      <div class="sn-fin"><span><small>الإيرادات</small><b>${snSAR(F.income)}</b></span><span><small>الميزانيّات الموزّعة</small><b>${snSAR(F.budgets)}</b></span><span><small>المصروف</small><b>${snSAR(F.spent)}</b></span><span><small>غير موزّع</small><b>${snSAR(F.unalloc)}</b></span></div>
      <p class="r-sub">${Object.entries(F.inc).map(([k, v]) => `${SN_SRC[k] || k}: ${snSAR(v)}`).join(' · ') || 'لا إيرادات بعد — سجّل المنح ورسوم المشاركين (رسوم التسجيل المعتمدة تُسجَّل تلقائياً).'}</p>
      ${alerts.length ? `<div class="sn-alerts">${alerts.map(x => `<p class="${x.k.pct >= 100 ? 'red' : ''}"><b>${esc(x.c.name)}</b> صرفت ${x.k.pct}٪ من ميزانيّتها</p>`).join('')}</div>` : ''}</div>
    ${depts.map(d => `<h3 class="sn-h">${esc(d)}</h3><div class="sn-coms">${C.filter(c => (c.dept || 'أخرى') === d).map(snComCard).join('')}</div>`).join('')}
    ${exc.length ? `<div class="card"><h3><i data-lucide="calendar-x"></i> اعتذارات المشرفين القادمة</h3><div class="r-list">${exc.map(e => { const x = SN.staff.find(s => s.id === e.staff_id) || {}; return `<div class="r-item"><span class="r-item-t"><b>${esc(x.name || '')}</b><small>${esc(fmtD(e.day))}${e.reason ? ' · ' + esc(e.reason) : ''}</small></span></div>`; }).join('')}</div><p class="r-sub">قائمة الاحتياط: المشرفون غير المسجّلين في لجنة (${SN.staff.filter(x => x.active && x.role !== 'guest' && !x.committee_id).length}).</p></div>` : ''}
    <div class="card"><h3>دفتر الحركات</h3><div class="r-list">${(SN.money || []).slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 40).map(snMoneyRow).join('') || '<p class="r-sub">لا حركات بعد.</p>'}</div></div>`;
}
function snComCard(c) {
  const k = snCom(c), lead = SN.staff.find(x => x.id === c.lead_staff), mem = SN.staff.filter(x => x.committee_id === c.id).length, t = (c.plan && c.plan.tasks) || [], done = t.filter(x => x.done).length;
  const bar = k.budget ? `<i class="sn-bar ${k.pct >= 100 ? 'red' : k.pct >= 80 ? 'amb' : ''}"><u style="width:${Math.min(100, k.pct)}%"></u></i>` : '';
  return `<button type="button" class="sn-com" style="--cc:${esc(c.color || '#0A84FF')}" onclick="snComOpen('${c.id}')"><b>${esc(c.name)}${c.status === 'closed' ? ' <small>(مُقفلة)</small>' : c.status === 'approved' ? ' <small>(خطّة معتمدة)</small>' : ''}</b>
    <small>${lead ? 'القائد: ' + esc(lead.name) : 'بلا قائد'} · ${mem} ${mem === 1 ? 'عضو' : mem === 2 ? 'عضوان' : mem <= 10 ? 'أعضاء' : 'عضواً'}${t.length ? ` · المهامّ ${done}/${t.length}` : ''}</small>
    ${k.budget ? `<small>صُرف ${snSAR(k.spent)} من ${snSAR(k.budget)}${k.cash ? ` · مع القائد ${snSAR(k.cash)}` : ''}</small>${bar}` : '<small>بلا ميزانيّة</small>'}</button>`;
}
function snMoneyRow(x) {
  const c = (SN.coms || []).find(y => y.id === x.committee_id), L = { income: 'إيراد', advance: 'سلفة', expense: 'مصروف', return: 'إرجاع' }[x.kind];
  return `<div class="r-item"><span class="r-item-t"><b>${L}${x.kind === 'income' ? ' · ' + (SN_SRC[x.source] || '') : c ? ' · ' + esc(c.name) : ''}</b><small>${esc([x.party, x.note, fmtD(x.day)].filter(Boolean).join(' · '))}</small></span>${x.receipt ? `<a class="btn btn-ghost btn-sm" href="${esc(snImg(x.receipt))}" target="_blank" rel="noopener">الفاتورة</a>` : ''}<span class="sn-mp ${x.kind === 'income' ? 'pos' : ''}">${x.kind === 'income' ? '+' : x.kind === 'expense' ? '−' : ''}${snSAR(x.amount)}</span><button type="button" class="x" aria-label="حذف" onclick="snMoneyDel('${x.id}')">×</button></div>`;
}
async function snComTpl() {
  try { for (const [i, [name, dept, color, tasks]] of SN_COM_TPL.entries()) SN.coms.push(await RDB.insert('season_committees', { season_id: SN.cur, name, dept, color, sort: i, plan: { tasks: tasks.map(t => ({ t })), kpis: [], needs: [] } }));
    snPaint(); rToast('أُضيفت ١٢ لجنة — عيّن قادتها وميزانيّاتها'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
function snComOpen(id) {
  const c = SN.coms.find(x => x.id === id); if (!c) return; const k = snCom(c), P = c.plan || {}, mem = SN.staff.filter(x => x.committee_id === c.id);
  const needs = (P.needs || []), nt = snN(needs.reduce((a, n) => a + (+n.q || 1) * (+n.c || 0), 0));
  openModal(c.name, `<div class="sn-fin"><span><small>الميزانيّة</small><b>${snSAR(k.budget)}</b></span><span><small>صُرف</small><b>${snSAR(k.spent)}</b></span><span><small>سُلَف</small><b>${snSAR(k.adv)}</b></span><span><small>مع القائد</small><b>${snSAR(k.cash)}</b></span></div>
    <div class="sn-acts"><button class="btn btn-ghost" onclick="closeModal();setTimeout(()=>snComSheet('${c.id}'),250)"><i data-lucide="settings-2"></i> اللجنة</button><button class="btn btn-ghost" onclick="closeModal();setTimeout(()=>snPlanSheet('${c.id}'),250)"><i data-lucide="list-checks"></i> الخطّة التشغيليّة</button><button class="btn btn-ghost" onclick="closeModal();setTimeout(()=>snMoneySheet('advance','${c.id}'),250)"><i data-lucide="hand-coins"></i> سلفة</button><button class="btn btn-ghost" onclick="closeModal();setTimeout(()=>snMoneySheet('expense','${c.id}'),250)"><i data-lucide="receipt"></i> مصروف</button>${c.status !== 'closed' ? `<button class="btn btn-ghost" onclick="snComClose('${c.id}')"><i data-lucide="lock"></i> إقفال</button>` : ''}</div>
    <h4 class="sn-h">الأعضاء (${mem.length})</h4><p class="r-sub">${mem.map(x => esc(x.name) + (x.id === c.lead_staff ? ' (القائد)' : '')).join('، ') || 'لا أعضاء — عيّنهم من «اللجنة».'}</p>
    ${(P.tasks || []).length ? `<h4 class="sn-h">المهامّ</h4><div class="r-list">${P.tasks.map(t => `<div class="r-item"><span class="r-item-t"><b>${t.done ? '✓ ' : ''}${esc(t.t)}</b></span></div>`).join('')}</div>` : ''}
    ${(P.kpis || []).length ? `<h4 class="sn-h">المؤشّرات</h4><p class="r-sub">${P.kpis.map(x => esc(x.n) + ': ' + esc(x.v)).join(' · ')}</p>` : ''}
    ${needs.length ? `<h4 class="sn-h">الاحتياجات — ${snSAR(nt)} ر.س</h4><p class="r-sub">${needs.map(n => esc(n.i) + ' × ' + (n.q || 1)).join(' · ')}</p>` : ''}
    <h4 class="sn-h">الحركات</h4><div class="r-list">${(SN.money || []).filter(x => x.committee_id === c.id).map(snMoneyRow).join('') || '<p class="r-sub">لا حركات.</p>'}</div>`);
}
function snComSheet(id) {
  const c = (SN.coms || []).find(x => x.id === id) || { color: '#0A84FF', budget: 0, dept: '' }, st = SN.staff.filter(x => x.role !== 'guest');
  openModal(id ? 'اللجنة' : 'لجنة جديدة', `<div class="field"><label>الاسم</label><input id="cm_n" value="${esc(c.name || '')}" placeholder="مثلاً: لجنة التحفيز"></div>
    <div class="field"><label>الإدارة</label><input id="cm_d" value="${esc(c.dept || '')}" list="cm_dl" placeholder="مثلاً: إدارة الفعاليّات"><datalist id="cm_dl">${[...new Set(SN_COM_TPL.map(x => x[1]))].map(d => `<option value="${esc(d)}">`).join('')}</datalist></div>
    <div class="field"><label>اللون</label><input id="cm_c" type="color" value="${esc(c.color || '#0A84FF')}"></div>
    <div class="field"><label>القائد (يحمل السلفة ويسجّل الفواتير من جوّاله)</label><select id="cm_l"><option value="">—</option>${st.map(x => `<option value="${x.id}"${x.id === c.lead_staff ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
    <div class="field"><label>الميزانيّة (ر.س)</label><input id="cm_b" type="number" inputmode="decimal" min="0" value="${esc(c.budget || '')}"></div>
    <div class="field"><label>الأعضاء</label><div class="sn-chk">${st.map(x => `<label class="r-check"><input type="checkbox" class="cm_m" value="${x.id}"${x.committee_id && x.committee_id === c.id ? ' checked' : ''}> ${esc(x.name)}${x.committee_id && x.committee_id !== c.id ? ` <small>(${esc(((SN.coms || []).find(y => y.id === x.committee_id) || {}).name || '')})</small>` : ''}</label>`).join('') || '<p class="r-sub">أضف المشرفين أوّلاً.</p>'}</div></div>`, async () => {
      const row = { name: fval('cm_n').trim(), dept: fval('cm_d').trim(), color: fval('cm_c'), lead_staff: fval('cm_l') || null, budget: Math.max(0, snN(fval('cm_b'))) };
      if (row.name.length < 2) { rToast('اكتب اسم اللجنة', 1); return; }
      try {
        let cid = id; if (id) Object.assign(c, await RDB.update('season_committees', id, row)); else { const n = await RDB.insert('season_committees', Object.assign({ season_id: SN.cur, sort: SN.coms.length, plan: { tasks: [], kpis: [], needs: [] } }, row)); SN.coms.push(n); cid = n.id; }
        const on = new Set([...document.querySelectorAll('.cm_m:checked')].map(i => i.value)); if (row.lead_staff) on.add(row.lead_staff);
        for (const x of SN.staff) { const want = on.has(x.id) ? cid : (x.committee_id === cid ? null : x.committee_id); if ((x.committee_id || null) !== (want || null)) { await RDB.update('season_staff', x.id, { committee_id: want }); x.committee_id = want; } }
        closeModal(); snPaint();
      } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف اللجنة؟', 'تبقى حركاتها الماليّة بلا لجنة.', 'حذف')) return; await RDB.remove('season_committees', id); SN.coms = SN.coms.filter(x => x.id !== id); SN.staff.forEach(x => { if (x.committee_id === id) x.committee_id = null; }); closeModal(); snPaint(); } : null);
}
/* الخطّة التشغيليّة بقالب «مدينة القيم»: المهامّ، المؤشّرات (اسم = مستهدف)، الاحتياجات (بند = كمّيّة × سعر) ← اعتماد */
function snPlanSheet(id) {
  const c = SN.coms.find(x => x.id === id); if (!c) return; const P = c.plan || {};
  openModal('الخطّة التشغيليّة — ' + c.name, `<div class="field"><label>المهامّ (سطر لكلّ مهمّة)</label><textarea id="pl_t" rows="6">${esc((P.tasks || []).map(t => t.t).join('\n'))}</textarea><div class="r-hint">يشطبها القائد من جوّاله عند إنجازها.</div></div>
    <div class="field"><label>المؤشّرات (مؤشّر = المستهدف)</label><textarea id="pl_k" rows="4" placeholder="عدد الورش = ١٥&#10;الانضباط = ٩٥٪">${esc((P.kpis || []).map(k => k.n + ' = ' + k.v).join('\n'))}</textarea></div>
    <div class="field"><label>الاحتياجات (بند = الكمّيّة × سعر الوحدة)</label><textarea id="pl_n" rows="5" placeholder="جوائز يوميّة = 12 × 15&#10;كأس الختام = 1 × 250">${esc((P.needs || []).map(n => n.i + ' = ' + (n.q || 1) + ' × ' + (n.c || 0)).join('\n'))}</textarea><div class="r-hint">مجموع الاحتياجات يقترح الميزانيّة — «جدول الاحتياجات» يتجمّع من كلّ اللجان في التقرير الماليّ.</div></div>
    <label class="r-check"><input type="checkbox" id="pl_a"${c.status === 'approved' ? ' checked' : ''}${c.status === 'closed' ? ' disabled' : ''}> <b>اعتماد الخطّة</b></label>`, async () => {
      const done = new Set((P.tasks || []).filter(t => t.done).map(t => t.t));
      const tasks = String(fval('pl_t') || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 60).map(t => done.has(t) ? { t, done: true } : { t });
      const kpis = String(fval('pl_k') || '').split('\n').map(l => l.split('=')).filter(x => x[0].trim()).map(x => ({ n: x[0].trim(), v: (x[1] || '').trim() }));
      const needs = String(fval('pl_n') || '').split('\n').map(l => l.split('=')).filter(x => x[0].trim()).map(x => { const m = /([\d.]+)\s*[×x*]\s*([\d.]+)/.exec(x[1] || ''); return { i: x[0].trim(), q: m ? +m[1] : 1, c: m ? +m[2] : snN((x[1] || '').replace(/[^\d.]/g, '')) }; });
      const nt = snN(needs.reduce((a, n) => a + n.q * n.c, 0)), status = c.status === 'closed' ? 'closed' : fval('pl_a') ? 'approved' : 'draft';
      const patch = { plan: { tasks, kpis, needs }, status }; if (!+c.budget && nt) patch.budget = nt;
      try { Object.assign(c, await RDB.update('season_committees', id, patch)); closeModal(); snPaint(); rToast(patch.budget ? 'حُفظت — الميزانيّة من مجموع الاحتياجات ' + snSAR(nt) : 'حُفظت الخطّة'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
/* الحركات: إيراد · سلفة لقائد · مصروف بفاتورة · إرجاع ما تبقّى مع القائد */
function snMoneySheet(kind, cid) {
  const C = (SN.coms || []).filter(c => c.status !== 'closed'), T = { income: 'إيراد', advance: 'سلفة لقائد لجنة', expense: 'مصروف', return: 'إرجاع من لجنة' }[kind];
  openModal(T, `${kind === 'income' ? `<div class="field"><label>المصدر</label><select id="mn_s">${Object.entries(SN_SRC).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>` : `<div class="field"><label>اللجنة</label><select id="mn_c">${C.map(c => `<option value="${c.id}"${c.id === cid ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>`}
    <div class="field"><label>المبلغ (ر.س)</label><input id="mn_a" type="number" inputmode="decimal" min="0.01" step="0.01"></div>
    <div class="field"><label>${kind === 'income' ? 'الداعم أو الجهة' : kind === 'expense' ? 'المورّد' : 'المستلم'}</label><input id="mn_p" maxlength="80"></div>
    <div class="field"><label>ملاحظة</label><input id="mn_n" maxlength="160"></div>
    <div class="field"><label>التاريخ</label><input id="mn_d" type="date" value="${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' })}"></div>
    ${kind === 'expense' || kind === 'income' ? `<div class="field"><label>${kind === 'expense' ? 'صورة الفاتورة' : 'المستند (اختياريّ)'}</label><div class="ws-img"><span class="ws-img-pv" id="mn_rpv"></span><label class="btn btn-ghost btn-sm"><i data-lucide="camera"></i> صوّر أو ارفع<input type="file" accept="image/*" capture="environment" hidden onchange="snMoneyImg(this)"></label><input type="hidden" id="mn_r"></div></div>` : ''}`, async () => {
      const row = { season_id: SN.cur, kind, amount: snN(fval('mn_a')), party: fval('mn_p').trim(), note: fval('mn_n').trim(), day: fval('mn_d') || undefined, receipt: fval('mn_r') || '', source: kind === 'income' ? fval('mn_s') : '', committee_id: kind === 'income' ? null : fval('mn_c') || null };
      if (!(row.amount > 0)) { rToast('اكتب المبلغ', 1); return; }
      if (kind !== 'income' && !row.committee_id) { rToast('اختر اللجنة', 1); return; }
      if (kind === 'expense') { const c = SN.coms.find(x => x.id === row.committee_id), k = snCom(c); if (k.budget && k.spent + row.amount > k.budget && !await snAsk('يتجاوز الميزانيّة', `المصروف يجعل «${c.name}» تتجاوز ميزانيّتها (${snSAR(k.budget)}).`, 'سجّله', false)) return; }
      try { SN.money.push(await RDB.insert('season_money', row)); closeModal(); snPaint(); rToast('سُجّل'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
async function snMoneyImg(inp) {
  const f = inp.files[0]; if (!f) return; rToast('جارٍ رفع الصورة…');
  try { const u = await RDB.uploadImage(f); document.getElementById('mn_r').value = u; document.getElementById('mn_rpv').innerHTML = `<img src="${esc(snImg(u))}" alt="">`; rToast('رُفعت'); } catch (e) { rToast('تعذّر الرفع: ' + (e.message || e), 1); }
}
async function snMoneyDel(id) {
  if (!await snAsk('حذف الحركة؟', 'لا يمكن التراجع.', 'حذف')) return;
  try { await RDB.remove('season_money', id); SN.money = SN.money.filter(x => x.id !== id); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
/* الإقفال: ما بقي مع القائد يُسجَّل «إرجاعاً» ثمّ تُقفل ماليّة اللجنة */
async function snComClose(id) {
  const c = SN.coms.find(x => x.id === id), k = snCom(c);
  if (!await snAsk('إقفال ماليّة «' + c.name + '»؟', k.cash > 0 ? `مع القائد ${snSAR(k.cash)} ر.س — تُسجَّل إرجاعاً ثمّ تُقفل اللجنة.` : 'لا يُسجَّل بعدها صرف من جوّال القائد.', 'إقفال', false)) return;
  try { if (k.cash > 0) SN.money.push(await RDB.insert('season_money', { season_id: SN.cur, committee_id: id, kind: 'return', amount: k.cash, note: 'إرجاع عند الإقفال' }));
    Object.assign(c, await RDB.update('season_committees', id, { status: 'closed' })); closeModal(); snPaint(); rToast('أُقفلت'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
/* التقرير الماليّ للطباعة (وللداعم): الإيرادات بمصادرها، كلّ لجنة بميزانيّتها وصرفها ونسبتها، وجدول الاحتياجات */
function snFinPrint() {
  const s = snSeason(), F = snFin(), w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  const rows = (SN.coms || []).map(c => ({ c, k: snCom(c) })), org = ((window.S || {}).settings || {}).orgName || '';
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><title>التقرير الماليّ — ${esc(s.name)}</title><style>body{font-family:system-ui,-apple-system,"SF Arabic",sans-serif;padding:28px;color:#111}h1{margin:0 0 4px}h2{margin:26px 0 8px;font-size:18px}p{color:#555;margin:0}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:right}th{background:#f4f4f5}td.n{text-align:left;font-variant-numeric:tabular-nums}.k{display:flex;gap:24px;margin:14px 0}.k b{display:block;font-size:22px}</style>
    <h1>التقرير الماليّ — ${esc(s.name)}</h1><p>${esc(org)} · ${esc(fmtD(new Date().toISOString().slice(0, 10)))}</p>
    <div class="k"><span>الإيرادات<b>${snSAR(F.income)}</b></span><span>المصروف<b>${snSAR(F.spent)}</b></span><span>الرصيد<b>${snSAR(F.balance)}</b></span><span>تكلفة المشارك<b>${SN.members.length ? snSAR(F.spent / SN.members.length) : '—'}</b></span></div>
    <h2>الإيرادات</h2><table><tr><th>المصدر</th><th>الجهة</th><th>التاريخ</th><th>المبلغ</th></tr>${(SN.money || []).filter(x => x.kind === 'income').map(x => `<tr><td>${SN_SRC[x.source] || ''}</td><td>${esc(x.party || '')}</td><td>${esc(x.day || '')}</td><td class="n">${snSAR(x.amount)}</td></tr>`).join('')}</table>
    <h2>اللجان</h2><table><tr><th>اللجنة</th><th>الإدارة</th><th>الميزانيّة</th><th>المصروف</th><th>النسبة</th><th>من الإجماليّ</th></tr>${rows.map(r => `<tr><td>${esc(r.c.name)}</td><td>${esc(r.c.dept || '')}</td><td class="n">${snSAR(r.k.budget)}</td><td class="n">${snSAR(r.k.spent)}</td><td class="n">${r.k.budget ? r.k.pct + '٪' : '—'}</td><td class="n">${F.spent ? Math.round(r.k.spent / F.spent * 100) + '٪' : '—'}</td></tr>`).join('')}</table>
    <h2>جدول الاحتياجات</h2><table><tr><th>اللجنة</th><th>البند</th><th>الكمّيّة</th><th>سعر الوحدة</th><th>الإجماليّ</th></tr>${rows.flatMap(r => ((r.c.plan || {}).needs || []).map(n => `<tr><td>${esc(r.c.name)}</td><td>${esc(n.i)}</td><td class="n">${n.q || 1}</td><td class="n">${snSAR(n.c)}</td><td class="n">${snSAR((n.q || 1) * (n.c || 0))}</td></tr>`)).join('')}</table>
    <h2>المصروفات</h2><table><tr><th>التاريخ</th><th>اللجنة</th><th>المورّد</th><th>البيان</th><th>المبلغ</th></tr>${(SN.money || []).filter(x => x.kind === 'expense').sort((a, b) => String(a.day).localeCompare(String(b.day))).map(x => `<tr><td>${esc(x.day || '')}</td><td>${esc(((SN.coms || []).find(c => c.id === x.committee_id) || {}).name || '')}</td><td>${esc(x.party || '')}</td><td>${esc(x.note || '')}</td><td class="n">${snSAR(x.amount)}</td></tr>`).join('')}</table>
    <script>onload=()=>print()<\/script>`);
  w.document.close();
}

/* ═════════ تبويب «التسجيل»: رابط عامّ برسوم وإيصال ← تأكيد الدفع ← اعتماد يصنع المشارك ═════════ */
const snRegSet = () => Object.assign({ open: false, fee: 0, bank: '', iban: '', note: '', token: '' }, ((snSeason() || {}).settings || {}).reg || {});
const snRegUrl = () => location.origin + location.pathname.replace(/[^/]*$/, '') + 'season/register/?t=' + snRegSet().token;
function snRegView() {
  const R = snRegSet(), L = SN.regs || [], by = k => L.filter(x => x.status === k);
  const head = `<div class="card"><div class="sn-sal-h"><h3><i data-lucide="clipboard-signature"></i> التسجيل في الموسم</h3><span class="r-badge" style="--c:${R.open ? '#30D158' : '#8E8E93'}">${R.open ? 'مفتوح' : 'مغلق'}</span></div>
    <p class="r-sub">${R.token ? `رابط واحد ترسله لأولياء الأمور: يسجّلون أبناءهم${R.fee ? `، ويحوّلون ${snSAR(R.fee)} ر.س ويرفعون الإيصال` : ''} — بدل صور الحوالات في واتساب. تؤكّد الدفع ثمّ تعتمد فيصير مشاركاً برقمه ورمزه.` : 'أنشئ رابط التسجيل ورسومه وحساب التحويل.'}</p>
    <div class="sn-acts"><button class="btn btn-gold" onclick="snRegSheet()"><i data-lucide="settings-2"></i> إعداد التسجيل</button>${R.token ? `<button class="btn btn-ghost" onclick="snRegShare()"><i data-lucide="send"></i> أرسل الرابط</button><a class="btn btn-ghost" href="${esc(snRegUrl())}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> افتح الصفحة</a>` : ''}<button class="btn btn-ghost" onclick="snGuideSheet()"><i data-lucide="book-open"></i> دليل وليّ الأمر</button>${R.token ? `<button class="btn btn-ghost" onclick="snGuideShare()"><i data-lucide="send"></i> أرسل الدليل</button><a class="btn btn-ghost" href="${esc(snRegUrl().replace('/register/', '/guide/'))}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> الدليل</a>` : ''}</div>
    <div class="sn-fin"><span><small>جديد</small><b>${by('new').length}</b></span><span><small>دفع</small><b>${by('paid').length}</b></span><span><small>معتمد</small><b>${by('approved').length}</b></span><span><small>رسوم مُحصّلة</small><b>${snSAR((SN.money || []).filter(x => x.kind === 'income' && x.source === 'fees' && x.reg_id).reduce((a, x) => a + +x.amount, 0))}</b></span></div></div>`;
  const row = x => `<div class="r-item sn-reg"><span class="r-item-t"><b>${esc(x.name)}</b><small>${esc([x.stage, x.grade, x.school].filter(Boolean).join(' · '))}</small><small dir="ltr">${esc(x.guardian_phone)}${x.guardian_name ? ' · ' + esc(x.guardian_name) : ''}</small>${x.sibling ? `<small>أخوه: ${esc(x.sibling)}</small>` : ''}${x.notes ? `<small>${esc(x.notes)}</small>` : ''}</span>
    ${x.receipt ? `<a class="btn btn-ghost btn-sm" href="${esc(snImg(x.receipt))}" target="_blank" rel="noopener">الإيصال</a>` : '<small class="sn-noreceipt">بلا إيصال</small>'}
    ${x.status === 'new' ? `<button class="btn btn-ghost btn-sm" onclick="snRegPaid('${x.id}')">تأكيد الدفع</button>` : ''}${x.status !== 'approved' && x.status !== 'rejected' ? `<button class="btn btn-gold btn-sm" onclick="snRegApprove('${x.id}')">اعتماد</button><button type="button" class="x" aria-label="رفض" onclick="snRegReject('${x.id}')">×</button>` : ''}</div>`;
  return head + ['new', 'paid', 'approved', 'rejected'].map(k => by(k).length ? `<h3 class="sn-h">${{ new: 'طلبات جديدة', paid: 'دفعوا — بانتظار الاعتماد', approved: 'معتمدون', rejected: 'مرفوضة' }[k]} (${by(k).length})</h3><div class="r-list">${by(k).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(row).join('')}</div>` : '').join('')
    + (L.length ? '' : `<div class="card">${rEmpty('inbox', 'لا طلبات بعد.', '')}</div>`);
}
function snRegSheet() {
  const R = snRegSet();
  openModal('إعداد التسجيل', `<label class="r-check"><input type="checkbox" id="rg_o"${R.open ? ' checked' : ''}> <b>التسجيل مفتوح</b></label>
    <div class="field"><label>الرسوم (ر.س — ٠ = مجّاناً)</label><input id="rg_f" type="number" inputmode="decimal" min="0" value="${esc(R.fee || '')}"></div>
    <div class="field"><label>البنك</label><input id="rg_b" value="${esc(R.bank)}" placeholder="مثلاً: مصرف الراجحي"></div>
    <div class="field"><label>الآيبان (حساب الجمعيّة)</label><input id="rg_i" dir="ltr" value="${esc(R.iban)}" placeholder="SA00 0000 0000 0000 0000 0000"></div>
    <div class="field"><label>ملاحظة لوليّ الأمر</label><textarea id="rg_n" rows="3" maxlength="400" placeholder="مثلاً: البرنامج من ٨ إلى ١٢ مساءً، والحافلات بسعر رمزيّ.">${esc(R.note)}</textarea></div>`, async () => {
      const tok = R.token || Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 56]).join('');
      const reg = { open: !!fval('rg_o'), fee: Math.max(0, snN(fval('rg_f'))), bank: fval('rg_b').trim(), iban: fval('rg_i').trim().toUpperCase(), note: fval('rg_n').trim(), token: tok };
      try { await snSaveSeason({ settings: Object.assign({}, snSeason().settings || {}, { reg }) }); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
async function snRegShare() {
  const s = snSeason(), R = snRegSet(), text = `التسجيل في ${s.name}\n${snRegUrl()}${R.fee ? `\nالرسوم ${snSAR(R.fee)} ريال` : ''}`;
  if (navigator.share) { try { await navigator.share({ title: s.name, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); rToast('نُسخ الرابط — ألصقه في قروب أولياء الأمور'); } catch (e) { await apPrompt('انسخ الرابط:', text); }
}
async function snRegPaid(id) {
  const x = SN.regs.find(r => r.id === id), fee = snN(snRegSet().fee); if (!x) return;
  try { Object.assign(x, await RDB.update('season_regs', id, { status: 'paid' }));
    if (fee && !(SN.money || []).some(m => m.reg_id === id)) SN.money.push(await RDB.insert('season_money', { season_id: SN.cur, kind: 'income', source: 'fees', amount: fee, party: x.guardian_name || x.name, note: 'رسوم: ' + x.name, receipt: x.receipt || '', reg_id: id }));
    snPaint(); rToast('أُكّد الدفع وسُجّل في الإيرادات'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
async function snRegApprove(id) {
  const x = SN.regs.find(r => r.id === id); if (!x) return;
  if (x.status === 'new' && snN(snRegSet().fee) && !await snAsk('اعتماد بلا تأكيد دفع؟', 'لم يُؤكَّد دفع الرسوم بعد.', 'اعتمد', false)) return;
  try {
    const m = await RDB.insert('season_members', snNew({ name: x.name, stage: x.stage, grade: x.grade, school: x.school, age: x.age, guardian_phone: x.guardian_phone, sibling: x.sibling }));
    SN.members.push(m); Object.assign(x, await RDB.update('season_regs', id, { status: 'approved', member_id: m.id })); snPaint(); rToast(`اعتُمد — رقمه ${m.no || ''}، ووزّعه على فريق من «الفرق»`);
  } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
async function snRegReject(id) {
  if (!await snAsk('رفض الطلب؟', 'يبقى في قائمة المرفوضة.', 'رفض')) return;
  const x = SN.regs.find(r => r.id === id); try { Object.assign(x, await RDB.update('season_regs', id, { status: 'rejected' })); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}

/* دليل وليّ الأمر (season/guide/?t= بنفس رمز التسجيل): الضوابط، اللباس، النقل، التواصل — والفترات والأخبار تأتي من الموسم */
function snGuideSheet() {
  const g = ((snSeason() || {}).settings || {}).guide || {};
  openModal('دليل وليّ الأمر', `<p class="r-sub">صفحة واحدة يقرؤها وليّ الأمر قبل البرنامج وأثناءه: مواعيد الفترات وآخر الأخبار تظهر فيها تلقائياً — أكمل الباقي:</p>
    <div class="field"><label>الضوابط والدخول والخروج</label><textarea id="gd_r" rows="4" maxlength="800" placeholder="الحضور قبل صلاة العشاء.&#10;الخروج قبل النهاية بإذن من وليّ الأمر.">${esc(g.rules || '')}</textarea></div>
    <div class="field"><label>اللباس</label><input id="gd_d" maxlength="200" value="${esc(g.dress || '')}"></div>
    <div class="field"><label>النقل والحافلات</label><input id="gd_b" maxlength="200" value="${esc(g.bus || '')}"></div>
    <div class="field"><label>جوال التواصل (واتساب)</label><input id="gd_p" dir="ltr" inputmode="tel" value="${esc(g.phone || '')}" placeholder="9665xxxxxxxx"></div>
    <div class="field"><label>مسؤول التواصل</label><input id="gd_c" maxlength="80" value="${esc(g.contact || '')}" placeholder="مثلاً: مشرف أولياء الأمور — أ. فهد"></div>`, async () => {
      const guide = { rules: fval('gd_r').trim(), dress: fval('gd_d').trim(), bus: fval('gd_b').trim(), phone: fval('gd_p').replace(/[^\d+]/g, ''), contact: fval('gd_c').trim() };
      const st = Object.assign({}, snSeason().settings || {}); st.guide = guide;
      if (!(st.reg || {}).token) st.reg = Object.assign({}, st.reg || {}, { token: Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 56]).join('') });
      try { await snSaveSeason({ settings: st }); closeModal(); snPaint(); rToast('حُفظ الدليل'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
async function snGuideShare() {
  const s = snSeason(), url = snRegUrl().replace('/register/', '/guide/'), text = `دليل وليّ الأمر — ${s.name}\n${url}\nالمواعيد والضوابط وآخر الأخبار في صفحة واحدة.`;
  if (navigator.share) { try { await navigator.share({ title: s.name, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); rToast('نُسخ — ألصقه في قروب أولياء الأمور'); } catch (e) { await apPrompt('انسخ:', text); }
}
