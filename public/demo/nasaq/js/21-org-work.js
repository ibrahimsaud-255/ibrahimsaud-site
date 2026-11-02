/*
 * 21-org-work.js — الرئيسية (لوحة حسب الدور) والمهام ومكتبة المخرجات
 * ⚠️ تعريفات فقط.
 */
const TASK_ST = [
  { key: 'todo', label: 'جديدة', c: '#94a3b8' },
  { key: 'doing', label: 'قيد التنفيذ', c: '#41747F' },
  { key: 'review', label: 'بانتظار المراجعة', c: '#CAB05F' },
  { key: 'done', label: 'منجزة', c: '#22c55e' },
];
const T_PRIO = { low: { t: 'منخفضة', c: '#94a3b8' }, normal: { t: 'عادية', c: '#41747F' }, high: { t: 'عالية', c: '#f59e0b' }, urgent: { t: 'عاجلة', c: '#ef4444' } };
const RES_KINDS = { folder: { t: 'مجلد', i: 'folder' }, doc: { t: 'مستند', i: 'file-text' }, sheet: { t: 'جدول', i: 'sheet' }, slides: { t: 'عرض تقديمي', i: 'presentation' }, video: { t: 'فيديو', i: 'clapperboard' }, image: { t: 'صور', i: 'image' }, design: { t: 'تصاميم', i: 'palette' }, other: { t: 'أخرى', i: 'link' } };
const W = { tasks: [], filter: { dept: '', who: 'all', q: '', view: 'board', program: '' }, res: [], resFilter: { dept: '', kind: '', q: '' } };

/* ═════════ الرئيسية ═════════ */
async function renderHome() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  const [tasks, vouchers, subs] = await Promise.all([
    can('tasks') ? RDB.list('org_tasks').catch(() => []) : [],
    RDB.list('vouchers').catch(() => []),
    can('inbox') ? RDB.list('submissions').catch(() => []) : [],
  ]);
  const mine = tasks.filter(t => t.assignee === ME.id && t.status !== 'done');
  const overdue = mine.filter(t => t.due_date && daysTo(t.due_date) < 0);
  const newSubs = subs.filter(s => s.status === 'new');
  const needMe = [];
  if (isAdmin()) vouchers.filter(v => v.status === 'reviewed').forEach(v => needMe.push({ icon: 'stamp', t: `اعتماد ${v.kind === 'payment' ? 'سند صرف' : 'سند قبض'} رقم ${v.number} — ${sar(v.amount)} ر.س`, s: v.party, go: `finGo('payment')` }));
  if (canReviewFin()) vouchers.filter(v => v.status === 'pending').forEach(v => needMe.push({ icon: 'search-check', t: `مراجعة ${v.kind === 'payment' ? 'سند صرف' : 'سند قبض'} رقم ${v.number} — ${sar(v.amount)} ر.س`, s: v.party, go: `finGo('${v.kind}')` }));
  if (can('finance')) vouchers.filter(v => v.status === 'request').forEach(v => needMe.push({ icon: 'hand-coins', t: `طلب صرف من ${DEPTS[v.dept] ? DEPTS[v.dept].short : memberName(v.created_by)} — ${sar(v.amount)} ر.س`, s: v.description, go: `finGo('requests')` }));
  if (can('finance')) vouchers.filter(v => v.status === 'approved' && v.kind === 'payment').forEach(v => needMe.push({ icon: 'banknote', t: `صرف السند المعتمد رقم ${v.number} — ${sar(v.amount)} ر.س`, s: v.party, go: `finGo('payment')` }));
  if (can('finance')) vouchers.filter(v => v.kind === 'receipt' && !v.deposited && v.status !== 'void' && v.status !== 'rejected').forEach(v => needMe.push({ icon: 'landmark', t: `إيداع سند القبض رقم ${v.number} في البنك — ${sar(v.amount)} ر.س`, s: Number(v.amount) > CONFIG.finance.depositLimit ? 'يتجاوز 10,000: الإيداع خلال يوم عمل' : 'الإيداع قبل نهاية الأسبوع', go: `finGo('receipt')` }));
  if (isManager()) tasks.filter(t => t.status === 'review' && (isAdmin() || t.dept === ME.dept)).forEach(t => needMe.push({ icon: 'eye', t: 'مراجعة مهمة: ' + t.title, s: memberName(t.assignee), go: `go('tasks')` }));
  const myReq = vouchers.filter(v => v.created_by === ME.id && ['request', 'pending', 'reviewed', 'approved'].includes(v.status) && v.kind === 'payment');
  const h = new Date().getHours();
  const hello = h < 12 ? 'صباح الخير' : 'مساء الخير';

  const kpis = [
    { n: mine.length, t: 'مهامي المفتوحة', i: 'list-checks', go: "go('tasks')" },
    { n: overdue.length, t: 'متأخرة', i: 'alarm-clock', go: "go('tasks')", bad: overdue.length > 0 },
  ];
  if (can('inbox')) kpis.push({ n: newSubs.length, t: 'طلبات جديدة من الموقع', i: 'inbox', go: "go('inbox')" });
  if (can(['finance', 'reports'])) {
    const y = new Date().getFullYear() + '';
    const ok = vouchers.filter(v => ['approved', 'paid'].includes(v.status) && String(v.date).startsWith(y));
    const inc = ok.filter(v => v.kind === 'receipt').reduce((a, v) => a + Number(v.amount), 0);
    const exp = ok.filter(v => v.kind === 'payment').reduce((a, v) => a + Number(v.amount), 0);
    kpis.push({ n: sar(inc - exp), t: 'صافي حركة السنة (ر.س)', i: 'wallet', go: "go('finance')", small: true });
  } else kpis.push({ n: myReq.length, t: 'طلبات صرف قيد المعالجة', i: 'hand-coins', go: "go('requests')" });

  let deptBars = '';
  if (isAdmin() && tasks.length) {
    deptBars = `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="building-2"></i> سير العمل في الإدارات</h3><button class="link-btn" onclick="go('tasks')">كل المهام</button></div>
      ${Object.entries(DEPTS).map(([k, d]) => { const ts = tasks.filter(t => t.dept === k); if (!ts.length) return ''; const by = TASK_ST.map(s => ts.filter(t => t.status === s.key).length); const late = ts.filter(t => t.status !== 'done' && t.due_date && daysTo(t.due_date) < 0).length;
        return `<div class="r-dept-row"><div class="r-dept-n"><span class="r-dot" style="background:${d.color}"></span>${d.name}${late ? ` <span class="r-late">${late} متأخرة</span>` : ''}</div>
        <div class="r-bar">${TASK_ST.map((s, i) => by[i] ? `<span style="flex:${by[i]};background:${s.c}" title="${s.label}: ${by[i]}">${by[i]}</span>` : '').join('')}</div></div>`; }).join('')}
      <div class="r-legend">${TASK_ST.map(s => `<span><i style="background:${s.c}"></i>${s.label}</span>`).join('')}</div></div>`;
  }

  main.innerHTML = `<div class="r-page">
    <div class="r-hello"><div><h1>${hello}، ${esc(ME.name.split(' ')[0])}</h1><p>${esc(ME.title || ROLES[ME.role])} · ${esc(DEPTS[ME.dept].name)}</p></div>
      <div class="r-quick">
        ${can('tasks') ? `<button class="btn btn-gold btn-sm" onclick="taskModal()"><i data-lucide="plus"></i> مهمة</button>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="requestModal()"><i data-lucide="hand-coins"></i> طلب صرف</button>
        ${can('library') ? `<button class="btn btn-ghost btn-sm" onclick="resModal()"><i data-lucide="hard-drive"></i> رابط مخرجات</button>` : ''}
        ${can('site') ? `<button class="btn btn-ghost btn-sm" onclick="go('site');setTimeout(()=>siteGo('news'),50)"><i data-lucide="newspaper"></i> خبر</button>` : ''}
      </div></div>
    ${RUSO_DEMO ? `<div class="r-demo-note"><i data-lucide="flask-conical"></i><div><b>الوضع التجريبي.</b> النظام غير مربوط بقاعدة بيانات بعد؛ ما تضيفه يُحفظ في هذا المتصفح فقط. جرّب صلاحيات أي موظف من القائمة أسفل الشريط الجانبي. <button class="link-btn" onclick="demoReset()">إعادة البيانات التجريبية</button></div></div>` : ''}
    <div class="r-kpis">${kpis.map(k => `<button class="r-kpi${k.bad ? ' bad' : ''}" onclick="${k.go}"><i data-lucide="${k.i}"></i><b class="${k.small ? 'sm' : ''}">${k.n}</b><span>${k.t}</span></button>`).join('')}</div>
    <div class="r-grid2">
      <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="bell-ring"></i> يحتاج إجراءك</h3><span class="r-cnt">${needMe.length}</span></div>
        ${needMe.length ? needMe.slice(0, 8).map(n => `<button class="r-act" onclick="${n.go}"><i data-lucide="${n.icon}"></i><span><b>${esc(n.t)}</b>${n.s ? `<small>${esc(n.s)}</small>` : ''}</span><i data-lucide="chevron-left" class="r-chev"></i></button>`).join('') : rEmpty('check-check', 'لا شيء ينتظرك الآن.')}
      </div>
      <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="list-checks"></i> مهامي</h3><button class="link-btn" onclick="go('tasks')">الكل</button></div>
        ${mine.length ? mine.sort((a, b) => (a.due_date || '9') > (b.due_date || '9') ? 1 : -1).slice(0, 7).map(taskLine).join('') : rEmpty('coffee', 'لا مهام مسندة إليك حالياً.')}
      </div>
    </div>
    ${deptBars}
    ${myReq.length ? `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="hand-coins"></i> طلبات الصرف الخاصة بي</h3><button class="link-btn" onclick="go('requests')">الكل</button></div>${myReq.map(v => `<div class="r-row"><span>${esc(v.description || v.party)}</span><b>${sar(v.amount)} ر.س</b>${vBadge(v.status)}</div>`).join('')}</div>` : ''}
  </div>`;
  refreshIcons();
}
function taskLine(t) {
  const dd = daysTo(t.due_date), late = t.status !== 'done' && dd != null && dd < 0;
  return `<button class="r-task-line" onclick="taskModal('${t.id}')"><span class="r-prio" style="background:${T_PRIO[t.priority].c}"></span><span class="r-tl-t"><b>${esc(t.title)}</b><small>${esc(DEPTS[t.dept] ? DEPTS[t.dept].short : '')}${t.program_id ? ' · ' + esc(programName(t.program_id)) : ''}</small></span>${t.due_date ? `<span class="r-due${late ? ' late' : dd <= 2 ? ' soon' : ''}">${late ? 'متأخرة ' + (-dd) + ' يوم' : dd === 0 ? 'اليوم' : fmtD(t.due_date)}</span>` : ''}</button>`;
}

/* ═════════ المهام ═════════ */
async function renderTasks() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  W.tasks = await RDB.list('org_tasks', { order: 'created_at' }).catch(e => { rToast(e.message, 1); return []; });
  paintTasks();
}
function taskFiltered() {
  const f = W.filter, q = f.q.toLowerCase();
  return W.tasks.filter(t => (!f.dept || t.dept === f.dept) && (f.who === 'all' || (f.who === 'me' ? t.assignee === ME.id : f.who === 'created' ? t.created_by === ME.id : t.assignee === f.who))
    && (!f.program || t.program_id === f.program) && (!q || (t.title + ' ' + t.description).toLowerCase().includes(q)));
}
function paintTasks() {
  const f = W.filter, list = taskFiltered();
  const depts = isAdmin() ? Object.keys(DEPTS) : Array.from(new Set([ME.dept, ...W.tasks.map(t => t.dept)]));
  const col = s => { const ts = list.filter(t => t.status === s.key); return `<div class="r-col" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="taskDrop(event,'${s.key}');this.classList.remove('over')">
      <div class="r-col-h"><span class="r-dot" style="background:${s.c}"></span>${s.label}<span class="r-cnt">${ts.length}</span></div>
      ${ts.map(taskCard).join('') || '<div class="r-col-empty">—</div>'}
      ${s.key === 'todo' ? `<button class="r-add" onclick="taskModal(null,{status:'todo'})"><i data-lucide="plus"></i> إضافة مهمة</button>` : ''}</div>`; };
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><h1>المهام</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="r-seg"><button class="${f.view === 'board' ? 'on' : ''}" onclick="W.filter.view='board';paintTasks()"><i data-lucide="kanban"></i> لوحة</button><button class="${f.view === 'list' ? 'on' : ''}" onclick="W.filter.view='list';paintTasks()"><i data-lucide="list"></i> قائمة</button></div><button class="btn btn-gold" onclick="taskModal()"><i data-lucide="plus"></i> مهمة جديدة</button></div></div>
    <div class="r-filters">
      <input type="search" placeholder="بحث في المهام…" value="${esc(f.q)}" oninput="W.filter.q=this.value;clearTimeout(W._q);W._q=setTimeout(paintTasks,250)">
      <select onchange="W.filter.who=this.value;paintTasks()"><option value="all">كل المهام</option><option value="me"${f.who === 'me' ? ' selected' : ''}>المسندة إليّ</option><option value="created"${f.who === 'created' ? ' selected' : ''}>التي أنشأتها</option>${isManager() ? ORG.members.filter(m => isAdmin() || m.dept === ME.dept).map(m => `<option value="${m.id}"${f.who === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('') : ''}</select>
      <select onchange="W.filter.dept=this.value;paintTasks()"><option value="">كل الإدارات</option>${depts.map(k => `<option value="${k}"${f.dept === k ? ' selected' : ''}>${DEPTS[k].name}</option>`).join('')}</select>
      <select onchange="W.filter.program=this.value;paintTasks()">${programOptions(f.program, 'كل البرامج')}</select>
    </div>
    ${f.view === 'board' ? `<div class="r-board">${TASK_ST.map(col).join('')}</div>` :
      `<div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr><th>المهمة</th><th>الإدارة</th><th>المسؤول</th><th>الأولوية</th><th>الاستحقاق</th><th>الحالة</th><th>المخرجات</th></tr></thead><tbody>
      ${list.map(t => `<tr onclick="taskModal('${t.id}')" style="cursor:pointer"><td><b>${esc(t.title)}</b>${t.program_id ? `<div class="r-sub">${esc(programName(t.program_id))}</div>` : ''}</td><td>${esc(DEPTS[t.dept].short)}</td><td>${t.assignee ? avatar(ORG.members.find(m => m.id === t.assignee), 24) + ' ' + esc(memberName(t.assignee)) : '—'}</td><td><span class="r-badge" style="--c:${T_PRIO[t.priority].c}">${T_PRIO[t.priority].t}</span></td><td>${t.due_date ? fmtD(t.due_date) : '—'}</td><td><span class="r-badge" style="--c:${TASK_ST.find(s => s.key === t.status).c}">${TASK_ST.find(s => s.key === t.status).label}</span></td><td>${(t.links || []).length ? `<i data-lucide="hard-drive"></i> ${(t.links || []).length}` : ''}</td></tr>`).join('') || `<tr><td colspan="7">${rEmpty('list-checks', 'لا مهام مطابقة.')}</td></tr>`}</tbody></table></div>`}
  </div>`;
  refreshIcons();
}
function taskCard(t) {
  const m = ORG.members.find(x => x.id === t.assignee);
  const dd = daysTo(t.due_date), late = t.status !== 'done' && dd != null && dd < 0;
  return `<div class="r-tcard" draggable="true" ondragstart="event.dataTransfer.setData('text',this.dataset.id)" data-id="${t.id}" onclick="taskModal('${t.id}')">
    <div class="r-tcard-top"><span class="r-chip" style="--c:${DEPTS[t.dept].color}">${esc(DEPTS[t.dept].short)}</span>${t.priority !== 'normal' ? `<span class="r-chip" style="--c:${T_PRIO[t.priority].c}">${T_PRIO[t.priority].t}</span>` : ''}</div>
    <b>${esc(t.title)}</b>
    ${t.program_id ? `<small class="r-sub">${esc(programName(t.program_id))}</small>` : ''}
    <div class="r-tcard-foot">${m ? avatar(m, 24) : '<span class="r-sub">غير مسندة</span>'}${(t.links || []).length ? `<span class="r-sub"><i data-lucide="hard-drive" class="inl"></i> ${t.links.length}</span>` : ''}${t.due_date ? `<span class="r-due${late ? ' late' : dd <= 2 && t.status !== 'done' ? ' soon' : ''}">${fmtD(t.due_date)}</span>` : ''}</div>
  </div>`;
}
async function taskDrop(ev, status) {
  ev.preventDefault(); const id = ev.dataTransfer.getData('text'); const t = W.tasks.find(x => x.id === id); if (!t || t.status === status) return;
  try { const patch = { status, updated_at: new Date().toISOString(), done_at: status === 'done' ? new Date().toISOString() : null }; await RDB.update('org_tasks', id, patch); Object.assign(t, patch); paintTasks(); }
  catch (e) { rToast('لا تملك صلاحية تحريك هذه المهمة: ' + e.message, 1); }
}
async function taskModal(id, preset) {
  const t = id ? (W.tasks.find(x => x.id === id) || (await RDB.list('org_tasks')).find(x => x.id === id)) : Object.assign({ title: '', description: '', dept: ME.dept, assignee: ME.role === 'staff' ? ME.id : '', status: 'todo', priority: 'normal', due_date: '', program_id: '', links: [] }, preset || {});
  if (!t) return;
  const canEdit = !id || isAdmin() || t.created_by === ME.id || t.assignee === ME.id || (isManager() && t.dept === ME.dept);
  const comments = id ? await RDB.list('task_comments', { eq: { task_id: id }, order: 'created_at', asc: true }).catch(() => []) : [];
  const links = (t.links || []).slice(); if (!links.length) links.push({ title: '', url: '' });
  openModal(id ? 'تفاصيل المهمة' : 'مهمة جديدة', `
    <div class="field"><label>عنوان المهمة</label><input id="t_title" value="${esc(t.title)}" placeholder="مثال: تصميم إعلان التسجيل في برنامج آفاق"${canEdit ? '' : ' disabled'}></div>
    <div class="field"><label>التفاصيل</label><textarea id="t_desc" rows="3" placeholder="المطلوب بالضبط، المقاسات، المرجع…"${canEdit ? '' : ' disabled'}>${esc(t.description)}</textarea></div>
    <div class="row2"><div class="field"><label>الإدارة</label><select id="t_dept"${canEdit ? '' : ' disabled'}>${deptOptions(t.dept)}</select></div>
      <div class="field"><label>المسؤول</label><select id="t_assignee"${canEdit && isManager() ? '' : ' disabled'}>${memberOptions(t.assignee)}</select></div></div>
    <div class="row3"><div class="field"><label>الحالة</label><select id="t_status">${TASK_ST.map(s => `<option value="${s.key}"${s.key === t.status ? ' selected' : ''}>${s.label}</option>`).join('')}</select></div>
      <div class="field"><label>الأولوية</label><select id="t_prio"${canEdit ? '' : ' disabled'}>${Object.entries(T_PRIO).map(([k, p]) => `<option value="${k}"${k === t.priority ? ' selected' : ''}>${p.t}</option>`).join('')}</select></div>
      <div class="field"><label>تاريخ الاستحقاق</label><input type="date" id="t_due" value="${esc(t.due_date || '')}"${canEdit ? '' : ' disabled'}></div></div>
    <div class="field"><label>البرنامج المرتبط</label><select id="t_prog"${canEdit ? '' : ' disabled'}>${programOptions(t.program_id)}</select></div>
    <div class="field"><label><i data-lucide="hard-drive" class="inl"></i> المخرجات — روابط Google Drive</label>
      <div id="t_links">${links.map(linkRowHTML).join('')}</div>
      <button type="button" class="link-btn" onclick="document.getElementById('t_links').insertAdjacentHTML('beforeend',linkRowHTML({}));refreshIcons()"><i data-lucide="plus" class="inl"></i> رابط آخر</button>
      <div class="r-hint">ارفع الملفات الثقيلة (تصاميم، فيديو، صور) على Google Drive والصق الرابط هنا — لا تُرفع على النظام.</div></div>
    ${id ? `<div class="r-comments"><label>التعليقات والمتابعة</label>${comments.map(c => `<div class="r-cmt">${avatar(ORG.members.find(m => m.id === c.author), 26)}<div><b>${esc(memberName(c.author))}</b> <small>${fmtD(c.created_at)}</small><p>${esc(c.body)}</p></div></div>`).join('') || '<p class="r-sub">لا تعليقات بعد.</p>'}
      <div style="display:flex;gap:8px"><input id="t_cmt" placeholder="اكتب تحديثاً أو ملاحظة…" onkeydown="if(event.key==='Enter'){event.preventDefault();taskComment('${id}')}"><button type="button" class="btn btn-ghost btn-sm" onclick="taskComment('${id}')">إرسال</button></div></div>
      <div class="r-sub" style="margin-top:8px">أنشأها ${esc(memberName(t.created_by))} · ${fmtD(t.created_at)}</div>` : ''}
  `, async () => {
    const title = fval('t_title'); if (!title) { rToast('اكتب عنوان المهمة', 1); return; }
    const L = Array.from(document.querySelectorAll('#t_links .r-linkrow')).map(r => ({ title: r.querySelector('.lt').value.trim(), url: r.querySelector('.lu').value.trim() })).filter(l => l.url);
    if (L.some(l => !validUrl(l.url))) { rToast('الرابط يجب أن يبدأ بـ https://', 1); return; }
    const status = fval('t_status');
    const row = { title, description: fval('t_desc'), dept: fval('t_dept'), assignee: fval('t_assignee') || null, status, priority: fval('t_prio'), due_date: fval('t_due') || null, program_id: fval('t_prog') || null, links: L, updated_at: new Date().toISOString(), done_at: status === 'done' ? (t.done_at || new Date().toISOString()) : null };
    try {
      if (id) { await RDB.update('org_tasks', id, canEdit ? row : { status, links: L, updated_at: row.updated_at, done_at: row.done_at }); }
      else { row.created_by = ME.id; await RDB.insert('org_tasks', row); }
      closeModal(); rToast('تم الحفظ'); rerenderCur();
    } catch (e) { rToast('تعذّر الحفظ: ' + e.message, 1); }
  }, id && (isAdmin() || t.created_by === ME.id || (isManager() && t.dept === ME.dept)) ? async () => { if (!confirm('حذف المهمة؟')) return; try { await RDB.remove('org_tasks', id); closeModal(); rerenderCur(); } catch (e) { rToast(e.message, 1); } } : null);
}
function linkRowHTML(l) { return `<div class="r-linkrow"><input class="lt" placeholder="اسم المخرج (مثال: التصميم النهائي)" value="${esc(l.title || '')}"><input class="lu" dir="ltr" placeholder="https://drive.google.com/…" value="${esc(l.url || '')}"><button type="button" class="x" title="حذف" onclick="this.parentElement.remove()">×</button>${l.url ? `<a class="r-open" href="${esc(l.url)}" target="_blank" rel="noopener" title="فتح"><i data-lucide="external-link"></i></a>` : ''}</div>`; }
async function taskComment(id) {
  const body = fval('t_cmt'); if (!body) return;
  try { await RDB.insert('task_comments', { task_id: id, author: ME.id, body }); closeModal(); taskModal(id); } catch (e) { rToast(e.message, 1); }
}
function rerenderCur() { (RENDER[CUR] || renderHome)(); }

/* ═════════ مكتبة المخرجات (روابط Google Drive) ═════════ */
async function renderLibrary() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  W.res = await RDB.list('resources', { order: 'created_at' }).catch(() => []);
  paintLibrary();
}
function paintLibrary() {
  const f = W.resFilter, q = f.q.toLowerCase();
  const list = W.res.filter(r => (!f.dept || r.dept === f.dept) && (!f.kind || r.kind === f.kind) && (!q || (r.title + ' ' + (r.tags || []).join(' ') + ' ' + r.notes).toLowerCase().includes(q)))
    .sort((a, b) => (b.pinned - a.pinned));
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>مكتبة المخرجات</h1><p class="r-sub" style="margin:4px 0 0">كل الملفات الثقيلة مكانها Google Drive — هنا روابطها مرتبة حسب الإدارة والبرنامج.</p></div><button class="btn btn-gold" onclick="resModal()"><i data-lucide="plus"></i> إضافة رابط</button></div>
    <div class="r-filters"><input type="search" placeholder="بحث…" value="${esc(f.q)}" oninput="W.resFilter.q=this.value;clearTimeout(W._r);W._r=setTimeout(paintLibrary,250)">
      <select onchange="W.resFilter.dept=this.value;paintLibrary()"><option value="">كل الإدارات</option>${Object.entries(DEPTS).map(([k, d]) => `<option value="${k}"${f.dept === k ? ' selected' : ''}>${d.name}</option>`).join('')}</select>
      <select onchange="W.resFilter.kind=this.value;paintLibrary()"><option value="">كل الأنواع</option>${Object.entries(RES_KINDS).map(([k, d]) => `<option value="${k}"${f.kind === k ? ' selected' : ''}>${d.t}</option>`).join('')}</select></div>
    <div class="r-res-grid">${list.map(r => `<div class="r-res${r.pinned ? ' pin' : ''}">
        <a class="r-res-main" href="${esc(r.url)}" target="_blank" rel="noopener"><span class="r-res-ic" style="--c:${DEPTS[r.dept] ? DEPTS[r.dept].color : '#41747F'}"><i data-lucide="${(RES_KINDS[r.kind] || RES_KINDS.other).i}"></i></span>
          <span><b>${esc(r.title)}</b><small>${esc((RES_KINDS[r.kind] || RES_KINDS.other).t)} · ${esc(DEPTS[r.dept] ? DEPTS[r.dept].short : '')}${r.program_id ? ' · ' + esc(programName(r.program_id)) : ''}</small>${r.notes ? `<small>${esc(r.notes)}</small>` : ''}</span></a>
        <div class="r-res-foot">${(r.tags || []).map(t => `<span class="r-chip" style="--c:#41747F">${esc(t)}</span>`).join('')}${r.pinned ? '<i data-lucide="pin" class="r-pin"></i>' : ''}
          ${isAdmin() || r.created_by === ME.id ? `<button class="link-btn" onclick="resModal('${r.id}')">تعديل</button>` : ''}</div></div>`).join('') || rEmpty('folder-open', 'لا روابط بعد — أضف مجلدات Drive الخاصة بكل إدارة وبرنامج.')}</div></div>`;
  refreshIcons();
}
function resModal(id) {
  const r = id ? W.res.find(x => x.id === id) : { title: '', url: '', kind: 'folder', dept: ME.dept, program_id: '', tags: [], notes: '', pinned: false };
  openModal(id ? 'تعديل رابط' : 'إضافة رابط مخرجات', `
    <div class="field"><label>العنوان</label><input id="r_title" value="${esc(r.title)}" placeholder="مثال: صور معرض آفاق 2026"></div>
    <div class="field"><label>رابط Google Drive</label><input id="r_url" dir="ltr" value="${esc(r.url)}" placeholder="https://drive.google.com/…"></div>
    <div class="row3"><div class="field"><label>النوع</label><select id="r_kind">${Object.entries(RES_KINDS).map(([k, d]) => `<option value="${k}"${k === r.kind ? ' selected' : ''}>${d.t}</option>`).join('')}</select></div>
      <div class="field"><label>الإدارة</label><select id="r_dept">${deptOptions(r.dept)}</select></div>
      <div class="field"><label>البرنامج</label><select id="r_prog">${programOptions(r.program_id)}</select></div></div>
    <div class="field"><label>وسوم (مفصولة بفاصلة)</label><input id="r_tags" value="${esc((r.tags || []).join('، '))}" placeholder="صور، تقارير، فيديو"></div>
    <div class="field"><label>ملاحظة</label><input id="r_notes" value="${esc(r.notes)}"></div>
    ${isManager() ? `<label class="r-check"><input type="checkbox" id="r_pin"${r.pinned ? ' checked' : ''}> تثبيت في أعلى المكتبة (مجلدات رئيسية)</label>` : ''}
    <div class="r-hint">تأكد أن مشاركة الملف في Drive مضبوطة على «أي شخص في ${TERMS.org} لديه الرابط» حتى يفتحه زملاؤك.</div>`,
    async () => {
      const row = { title: fval('r_title'), url: fval('r_url'), kind: fval('r_kind'), dept: fval('r_dept'), program_id: fval('r_prog') || null, tags: fval('r_tags').split(/[,،]/).map(s => s.trim()).filter(Boolean), notes: fval('r_notes'), pinned: isManager() ? fval('r_pin') : !!r.pinned };
      if (!row.title || !row.url) { rToast('العنوان والرابط مطلوبان', 1); return; }
      if (!validUrl(row.url)) { rToast('الرابط يجب أن يبدأ بـ https://', 1); return; }
      try { if (id) await RDB.update('resources', id, row); else { row.created_by = ME.id; await RDB.insert('resources', row); } closeModal(); rToast('تم الحفظ'); if (CUR === 'library') renderLibrary(); }
      catch (e) { rToast(e.message, 1); }
    }, id ? async () => { if (!confirm('حذف الرابط؟')) return; await RDB.remove('resources', id); closeModal(); renderLibrary(); } : null);
}

/* ═════════ التقويم (يستبدل تقويم نظام بزنس): مواعيدي + مهام الفريق بتواريخ استحقاقها ═════════ */
const CALV = { view: 'dayGridMonth' };
const CAL_VIEWS = [['dayGridMonth', 'شهر'], ['timeGridWeek', 'أسبوع'], ['timeGridDay', 'يوم'], ['listMonth', 'قائمة']];
async function renderCalendar() {
  if (!window.FullCalendar) return renderCalendarGrid();
  if (FC) { try { FC.destroy(); } catch (e) {} FC = null; }
  const tasks = can('tasks') ? await RDB.list('org_tasks').catch(() => []) : [];
  document.getElementById('main').innerHTML = `<div class="r-page cal-page">
    <div class="cal-head">
      <div class="cal-title">
        <button class="cal-nav" onclick="FC.prev();calSync()" aria-label="السابق"><i data-lucide="chevron-right"></i></button>
        <h1 id="calTitle"></h1>
        <button class="cal-nav" onclick="FC.next();calSync()" aria-label="التالي"><i data-lucide="chevron-left"></i></button>
        <button class="cal-today" onclick="FC.today();calSync()">اليوم</button>
      </div>
      <div class="cal-tools">
        <div class="r-seg" id="calViews">${CAL_VIEWS.map(([v, t]) => `<button class="${CALV.view === v ? 'on' : ''}" onclick="calView('${v}')">${t}</button>`).join('')}</div>
        <button class="btn btn-ghost btn-sm" onclick="exportICS()" title="تصدير إلى تقويم الجوال"><i data-lucide="download"></i></button>
        <button class="btn btn-gold btn-sm" onclick="apptModal()"><i data-lucide="plus"></i> موعد</button>
      </div>
    </div>
    <div class="cal-legend"><span><i style="background:#CAB05F"></i>مواعيدي</span>${can('tasks') ? '<span><i style="background:#41747F"></i>مهام الفريق</span><span><i style="background:#d64545"></i>متأخرة</span>' : ''}<span class="r-sub">اضغط على يوم لإضافة موعد، واسحب الموعد لتغيير وقته.</span></div>
    <div class="cal-card"><div id="fcal"></div></div></div>`;
  const events = [];
  (S.appointments || []).forEach(a => {
    const st = new Date(a.datetime); if (isNaN(st)) return;
    const en = new Date(st.getTime() + (Number(a.duration) || 60) * 60000);
    events.push({ id: a.id, title: a.title || 'موعد', start: fcFmt(st), end: fcFmt(en), classNames: ['ev-appt', a.status === 'done' ? 'ev-done' : a.status === 'cancelled' ? 'ev-cancel' : ''] });
  });
  tasks.filter(t => t.due_date).forEach(t => {
    const late = t.status !== 'done' && daysTo(t.due_date) < 0;
    events.push({ id: 'task_' + t.id, title: t.title, start: t.due_date, allDay: true, editable: t.status !== 'done', classNames: ['ev-task', late ? 'ev-late' : '', t.status === 'done' ? 'ev-done' : ''], extendedProps: { task: t.id } });
  });
  FC = new FullCalendar.Calendar(document.getElementById('fcal'), {
    initialView: CALV.view, direction: 'rtl', locale: 'ar', height: 'auto', firstDay: 6, nowIndicator: true, headerToolbar: false,
    fixedWeekCount: false, dayMaxEvents: 3, moreLinkText: n => '+' + n + ' أخرى', noEventsText: 'لا مواعيد ولا مهام في هذه الفترة',
    editable: true, eventDurationEditable: true, eventDisplay: 'block', selectable: true, slotMinTime: '06:00:00', slotMaxTime: '24:00:00',
    dayHeaderFormat: { weekday: 'short' }, events,
    dateClick: info => apptModal(null, info.dateStr.slice(0, 10)),
    eventClick: info => { const p = info.event.extendedProps; if (p && p.task) taskModal(p.task); else apptModal(info.event.id); },
    eventDrop: async info => {
      const p = info.event.extendedProps;
      if (p && p.task) { try { await RDB.update('org_tasks', p.task, { due_date: info.event.startStr.slice(0, 10), updated_at: new Date().toISOString() }); rToast('تم تغيير تاريخ الاستحقاق'); } catch (e) { info.revert(); rToast('لا تملك صلاحية تعديل هذه المهمة', 1); } }
      else updateApptTime(info.event);
    },
    eventResize: info => updateApptTime(info.event),
  });
  FC.render(); calSync(); refreshIcons();
}
function calSync() { const t = document.getElementById('calTitle'); if (t && FC) t.textContent = FC.view.title; }
function calView(v) { CALV.view = v; if (FC) { FC.changeView(v); calSync(); } document.querySelectorAll('#calViews button').forEach(b => b.classList.toggle('on', b.getAttribute('onclick').includes("'" + v + "'"))); }
