/*
 * 27-org-trello.js — المهام على نمط Trello (هندسة عكسية لواجهة Trello 2025)
 * لوحة بقوائم ملوّنة، بطاقات بغلاف وتسميات وشارات، إضافة سريعة أسفل القائمة، سحب وإفلات بالماوس واللمس،
 * قائمة تعديل سريع للبطاقة، ونافذة البطاقة (قوائم تحقق بشريط تقدم، تسميات، تواريخ، أعضاء، مرفقات Drive، تعليقات ونشاط).
 * يستبدل شاشة المهام في 21-org-work.js ويحافظ على البيانات نفسها (org_tasks).
 * ⚠️ تعريفات فقط.
 */
const TR_LABELS = Object.assign({ green: { c: '#4BCE97', d: '#216E4E', t: 'برامج' }, yellow: { c: '#F5CD47', d: '#7F5F01', t: 'تصميم' }, orange: { c: '#FEA362', d: '#A54800', t: 'محتوى' }, red: { c: '#F87168', d: '#AE2E24', t: 'عاجل' }, purple: { c: '#9F8FEF', d: '#5E4DB2', t: 'شراكات' }, blue: { c: '#579DFF', d: '#0055CC', t: 'إداري' } }, ORG_CFG.taskLabels || {});
const TR_LIST_COLORS = { todo: '#1D2125', doing: '#164B35', review: '#533F04', done: '#1C2B41' };
const TR_COVERS = ['', '#216E4E', '#7F5F01', '#A54800', '#AE2E24', '#5E4DB2', '#0055CC', '#41747F', '#CAB05F'];
const TR = { comments: {}, collapsed: JSON.parse(localStorage.getItem('tr_collapsed') || '[]'), drag: null, labelsShown: localStorage.getItem('tr_lbl') === '1' };
const trSaveUI = () => { try { localStorage.setItem('tr_collapsed', JSON.stringify(TR.collapsed)); localStorage.setItem('tr_lbl', TR.labelsShown ? '1' : '0'); } catch (e) {} };
const trPos = t => Number(t.pos != null ? t.pos : Date.parse(t.created_at || 0) / 1e6);
const trChecks = t => { const items = (t.checklists || []).flatMap(c => c.items || []); return { n: items.length, d: items.filter(i => i.done).length }; };
const trId = () => Math.random().toString(36).slice(2, 9);

/* ═════════ اللوحة ═════════ */
async function renderTasks() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  const [tasks, cmts] = await Promise.all([RDB.list('org_tasks', { order: 'created_at' }).catch(e => { rToast(e.message, 1); return []; }), RDB.list('task_comments').catch(() => [])]);
  W.tasks = tasks; TR.comments = {}; cmts.forEach(c => { TR.comments[c.task_id] = (TR.comments[c.task_id] || 0) + 1; });
  paintTasks();
}
function taskFiltered() {
  const f = W.filter, q = (f.q || '').toLowerCase();
  return W.tasks.filter(t => !t.archived && (!f.dept || t.dept === f.dept) && (f.who === 'all' || (f.who === 'me' ? (t.assignee === ME.id || (t.members || []).includes(ME.id)) : f.who === 'created' ? t.created_by === ME.id : t.assignee === f.who))
    && (!f.program || t.program_id === f.program) && (!f.label || (t.labels || []).includes(f.label))
    && (!f.due || (f.due === 'late' ? t.status !== 'done' && t.due_date && t.due_date < today() : f.due === 'week' ? t.due_date && t.due_date >= today() && t.due_date <= addDays(today(), 7) : !t.due_date))
    && (!q || (t.title + ' ' + t.description).toLowerCase().includes(q)));
}
function paintTasks() {
  const f = W.filter, list = taskFiltered(), boardName = f.dept ? DEPTS[f.dept].name : 'كل المهام';
  const depts = isAdmin() ? Object.keys(DEPTS) : Array.from(new Set([ME.dept, ...W.tasks.map(t => t.dept)]));
  const active = [f.who !== 'all', f.dept, f.program, f.label, f.due, f.q].filter(Boolean).length;
  const col = s => {
    const ts = list.filter(t => t.status === s.key).sort((a, b) => trPos(a) - trPos(b)), shut = TR.collapsed.includes(s.key);
    if (shut) return `<div class="tr-list tr-shut" style="--lc:${TR_LIST_COLORS[s.key]}" onclick="trCollapse('${s.key}')" title="توسيع القائمة"><i data-lucide="chevrons-left-right"></i><b>${s.label}</b><span>${ts.length}</span></div>`;
    return `<section class="tr-list" style="--lc:${TR_LIST_COLORS[s.key]}" data-list="${s.key}">
      <header class="tr-lh"><h3>${s.label}</h3><span class="tr-cnt">${ts.length}</span><button class="tr-ib" onclick="trCollapse('${s.key}')" title="طي القائمة"><i data-lucide="chevrons-left-right"></i></button><button class="tr-ib" onclick="trListMenu(event,'${s.key}')" title="إجراءات القائمة"><i data-lucide="ellipsis"></i></button></header>
      <div class="tr-cards" data-list="${s.key}">${ts.map(taskCard).join('')}</div>
      <footer class="tr-lf" id="trAdd_${s.key}"><button class="tr-addbtn" onclick="trComposer('${s.key}')"><i data-lucide="plus"></i> إضافة بطاقة</button><button class="tr-ib" onclick="taskModal(null,{status:'${s.key}'})" title="بطاقة بتفاصيل كاملة"><i data-lucide="square-pen"></i></button></footer></section>`;
  };
  document.getElementById('main').innerHTML = `<div class="tr-app">
    <div class="tr-bar"><div class="tr-bar-r"><h1 class="tr-title">${esc(boardName)}</h1>
        <div class="tr-view"><button class="${f.view !== 'list' ? 'on' : ''}" onclick="W.filter.view='board';paintTasks()" title="لوحة"><i data-lucide="kanban"></i></button><button class="${f.view === 'list' ? 'on' : ''}" onclick="W.filter.view='list';paintTasks()" title="جدول"><i data-lucide="table-2"></i></button></div>
        <select class="tr-boards" onchange="W.filter.dept=this.value;paintTasks()" title="تبديل اللوحة"><option value="">كل المهام</option>${depts.map(k => `<option value="${k}"${f.dept === k ? ' selected' : ''}>${DEPTS[k].name}</option>`).join('')}</select></div>
      <div class="tr-bar-l"><div class="tr-avs">${ORG.members.filter(m => m.active !== false && (!f.dept || m.dept === f.dept)).slice(0, 6).map(m => `<button onclick="W.filter.who=W.filter.who==='${m.id}'?'all':'${m.id}';paintTasks()" class="${f.who === m.id ? 'on' : ''}" title="${esc(m.name)}">${avatar(m, 28)}</button>`).join('')}</div>
        <button class="tr-btn${active ? ' on' : ''}" onclick="trFilterMenu(event)"><i data-lucide="list-filter"></i> تصفية${active ? ` <b>${active}</b>` : ''}</button>
        <input class="tr-search" type="search" placeholder="بحث…" value="${esc(f.q || '')}" oninput="W.filter.q=this.value;clearTimeout(W._q);W._q=setTimeout(paintTasks,250)"></div></div>
    ${f.view === 'list' ? trTable(list) : `<div class="tr-board" id="trBoard">${TASK_ST.map(col).join('')}</div>`}</div>`;
  refreshIcons(); trBindDrag();
}
function trTable(list) {
  return `<div class="tr-tablewrap"><table class="r-table"><thead><tr><th>البطاقة</th><th>القائمة</th><th>التسميات</th><th>الأعضاء</th><th>الاستحقاق</th><th>قائمة التحقق</th></tr></thead><tbody>
  ${list.map(t => { const c = trChecks(t), st = TASK_ST.find(s => s.key === t.status); return `<tr onclick="taskModal('${t.id}')" style="cursor:pointer"><td><b>${esc(t.title)}</b>${t.program_id ? `<div class="r-sub">${esc(programName(t.program_id))}</div>` : ''}</td><td><span class="r-badge" style="--c:${st.c}">${st.label}</span></td><td>${(t.labels || []).map(l => `<span class="tr-lbl" style="--l:${TR_LABELS[l].c}">${TR_LABELS[l].t}</span>`).join('')}</td><td>${trMembers(t).map(m => avatar(m, 24)).join('')}</td><td>${trDue(t)}</td><td>${c.n ? c.d + '/' + c.n : '—'}</td></tr>`; }).join('') || `<tr><td colspan="6">${rEmpty('list-checks', 'لا بطاقات مطابقة.')}</td></tr>`}</tbody></table></div>`;
}
const trMembers = t => Array.from(new Set([t.assignee].concat(t.members || []).filter(Boolean))).map(id => ORG.members.find(m => m.id === id)).filter(Boolean);
function trDue(t, chip) {
  if (!t.due_date) return chip ? '' : '—';
  const dd = daysTo(t.due_date), done = t.status === 'done', cls = done ? 'ok' : dd < 0 ? 'late' : dd <= 1 ? 'soon' : '';
  return `<span class="tr-due ${cls}"><i data-lucide="${done ? 'square-check' : 'clock'}"></i>${fmtD(t.due_date).replace(/\s\d{4}$/, '')}</span>`;
}
function taskCard(t) {
  const c = trChecks(t), nc = TR.comments[t.id] || 0, ms = trMembers(t), done = t.status === 'done';
  const cover = t.cover ? `<div class="tr-cover" style="background:${esc(t.cover)}"></div>` : '';
  return `<article class="tr-card${done ? ' done' : ''}" data-id="${t.id}" tabindex="0" onkeydown="if(event.key==='Enter')taskModal('${t.id}')">${cover}
    ${(t.labels || []).length ? `<div class="tr-lbls${TR.labelsShown ? ' open' : ''}" onclick="event.stopPropagation();TR.labelsShown=!TR.labelsShown;trSaveUI();paintTasks()">${t.labels.map(l => `<span style="--l:${TR_LABELS[l].c}">${TR.labelsShown ? TR_LABELS[l].t : ''}</span>`).join('')}</div>` : ''}
    <div class="tr-ct"><button class="tr-done" onclick="event.stopPropagation();trToggleDone('${t.id}')" title="${done ? 'إلغاء الإكمال' : 'وضع علامة مكتمل'}">${done ? '<i data-lucide="circle-check"></i>' : '<i data-lucide="circle"></i>'}</button><span>${esc(t.title)}</span></div>
    <div class="tr-badges">${trDue(t, 1)}${t.description ? '<i data-lucide="text" title="لها وصف"></i>' : ''}${nc ? `<span title="تعليقات"><i data-lucide="message-square"></i>${nc}</span>` : ''}${(t.links || []).length ? `<span title="مرفقات Drive"><i data-lucide="paperclip"></i>${t.links.length}</span>` : ''}${c.n ? `<span class="${c.d === c.n ? 'ok' : ''}" title="قائمة التحقق"><i data-lucide="square-check"></i>${c.d}/${c.n}</span>` : ''}
      <span class="tr-ms">${ms.slice(0, 3).map(m => avatar(m, 24)).join('')}</span></div>
    <button class="tr-edit" onclick="event.stopPropagation();trQuick(event,'${t.id}')" title="تعديل سريع"><i data-lucide="pencil"></i></button></article>`;
}
function trCollapse(k) { TR.collapsed = TR.collapsed.includes(k) ? TR.collapsed.filter(x => x !== k) : TR.collapsed.concat(k); trSaveUI(); paintTasks(); }

/* ── تحديث البطاقة وتسجيل النشاط ── */
async function trPatch(id, patch, logText) {
  const t = W.tasks.find(x => x.id === id); if (!t) return;
  patch.updated_at = new Date().toISOString();
  if (logText) patch.log = (t.log || []).concat([{ t: logText, by: ME.id, at: patch.updated_at }]).slice(-60);
  try { await RDB.update('org_tasks', id, patch); Object.assign(t, patch); return true; } catch (e) { rToast('لا تملك صلاحية تعديل هذه البطاقة: ' + e.message, 1); return false; }
}
async function trToggleDone(id) {
  const t = W.tasks.find(x => x.id === id), done = t.status !== 'done';
  if (await trPatch(id, { status: done ? 'done' : 'doing', done_at: done ? new Date().toISOString() : null, pos: trEndPos(done ? 'done' : 'doing') }, done ? 'وضع علامة «مكتملة»' : 'أعاد فتح البطاقة')) paintTasks();
}
const trEndPos = st => 1024 + Math.max(0, ...W.tasks.filter(t => t.status === st && !t.archived).map(trPos));

/* ── الإضافة السريعة أسفل القائمة ── */
function trComposer(st) {
  const box = document.getElementById('trAdd_' + st); if (!box) return;
  box.outerHTML = `<div class="tr-composer" id="trAdd_${st}"><textarea id="trNew_${st}" placeholder="أدخل عنواناً لهذه البطاقة…" rows="2" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();trQuickAdd('${st}')}else if(event.key==='Escape'){paintTasks()}"></textarea>
    <div><button class="tr-primary" onclick="trQuickAdd('${st}')">إضافة بطاقة</button><button class="tr-ib" onclick="paintTasks()" title="إلغاء"><i data-lucide="x"></i></button></div></div>`;
  refreshIcons(); const ta = document.getElementById('trNew_' + st); ta.focus(); ta.closest('.tr-cards, .tr-list').querySelector('.tr-cards').scrollTop = 1e6;
}
async function trQuickAdd(st) {
  const ta = document.getElementById('trNew_' + st), title = (ta.value || '').trim(); if (!title) { ta.focus(); return; }
  const row = { title, description: '', dept: W.filter.dept || ME.dept, assignee: ME.role === 'staff' ? ME.id : null, status: st, priority: 'normal', program_id: W.filter.program || null, links: [], labels: [], checklists: [], members: [], pos: trEndPos(st), created_by: ME.id, log: [{ t: 'أضاف البطاقة إلى «' + TASK_ST.find(s => s.key === st).label + '»', by: ME.id, at: new Date().toISOString() }] };
  try { const r = await RDB.insert('org_tasks', row); W.tasks.push(r); paintTasks(); trComposer(st); } catch (e) { rToast(e.message, 1); }
}

/* ── القوائم المنبثقة (إجراءات القائمة، التعديل السريع، التصفية) ── */
function trPop(ev, html, w) {
  trPopClose(); const r = (ev.currentTarget || ev.target).getBoundingClientRect(), p = document.createElement('div');
  p.className = 'tr-pop'; p.id = 'trPop'; p.innerHTML = html; p.style.width = (w || 300) + 'px'; document.body.appendChild(p);
  const left = Math.min(Math.max(8, r.right - (w || 300)), innerWidth - (w || 300) - 8); p.style.left = left + 'px'; p.style.top = Math.min(r.bottom + 6, innerHeight - p.offsetHeight - 8) + 'px';
  refreshIcons(); setTimeout(() => document.addEventListener('pointerdown', trPopOutside, { once: false }), 0);
}
function trPopOutside(e) { const p = document.getElementById('trPop'); if (p && !p.contains(e.target)) trPopClose(); }
function trPopClose() { const p = document.getElementById('trPop'); if (p) p.remove(); document.removeEventListener('pointerdown', trPopOutside); }
const trPopHead = t => `<div class="tr-pop-h"><b>${t}</b><button class="tr-ib" onclick="trPopClose()"><i data-lucide="x"></i></button></div>`;
function trListMenu(ev, st) {
  const others = TASK_ST.filter(s => s.key !== st);
  trPop(ev, trPopHead('إجراءات القائمة') + `<button onclick="trPopClose();trComposer('${st}')">إضافة بطاقة</button><button onclick="trPopClose();trCollapse('${st}')">طي القائمة</button><hr>
    <div class="tr-pop-s">ترتيب القائمة حسب</div><button onclick="trSort('${st}','due')">تاريخ الاستحقاق</button><button onclick="trSort('${st}','new')">الأحدث أولاً</button><button onclick="trSort('${st}','title')">اسم البطاقة (أبجدي)</button><hr>
    <div class="tr-pop-s">نقل كل بطاقات القائمة إلى</div>${others.map(s => `<button onclick="trMoveAll('${st}','${s.key}')">${s.label}</button>`).join('')}<hr>
    ${st === 'done' ? `<button onclick="trArchiveAll('${st}')">أرشفة كل البطاقات المكتملة</button>` : ''}`);
}
async function trSort(st, by) {
  trPopClose(); const ts = W.tasks.filter(t => t.status === st && !t.archived).sort((a, b) => by === 'due' ? String(a.due_date || '9').localeCompare(String(b.due_date || '9')) : by === 'new' ? String(b.created_at).localeCompare(String(a.created_at)) : a.title.localeCompare(b.title, 'ar'));
  for (let i = 0; i < ts.length; i++) await trPatch(ts[i].id, { pos: (i + 1) * 1024 });
  paintTasks();
}
async function trMoveAll(from, to) { trPopClose(); let p = trEndPos(to); for (const t of W.tasks.filter(x => x.status === from && !x.archived)) { await trPatch(t.id, { status: to, pos: p, done_at: to === 'done' ? new Date().toISOString() : null }, 'نقل البطاقة إلى «' + TASK_ST.find(s => s.key === to).label + '»'); p += 1024; } paintTasks(); }
async function trArchiveAll(st) { trPopClose(); if (!confirm('أرشفة كل البطاقات المكتملة؟ (تبقى محفوظة ويمكن استرجاعها من التصفية)')) return; for (const t of W.tasks.filter(x => x.status === st && !x.archived)) await trPatch(t.id, { archived: true }, 'أرشف البطاقة'); paintTasks(); }
function trQuick(ev, id) {
  const t = W.tasks.find(x => x.id === id);
  trPop(ev, `<div class="tr-quick"><button onclick="trPopClose();taskModal('${id}')"><i data-lucide="credit-card"></i> فتح البطاقة</button><button onclick="trLabelsPop(event,'${id}')"><i data-lucide="tag"></i> تعديل التسميات</button><button onclick="trMembersPop(event,'${id}')"><i data-lucide="user-round"></i> تغيير الأعضاء</button><button onclick="trCoverPop(event,'${id}')"><i data-lucide="panel-top"></i> تغيير الغلاف</button><button onclick="trDatesPop(event,'${id}')"><i data-lucide="clock"></i> تعديل التواريخ</button><button onclick="trMovePop(event,'${id}')"><i data-lucide="arrow-left-right"></i> نقل</button><button onclick="trCopy('${id}')"><i data-lucide="copy"></i> نسخ البطاقة</button><button onclick="trArchive('${id}')"><i data-lucide="archive"></i> أرشفة</button></div>`, 220);
}
function trFilterMenu(ev) {
  const f = W.filter;
  trPop(ev, trPopHead('تصفية') + `<div class="tr-pop-s">الأعضاء</div>
    <label class="tr-opt"><input type="radio" name="trw" ${f.who === 'all' ? 'checked' : ''} onchange="W.filter.who='all';paintTasks()"> كل البطاقات</label><label class="tr-opt"><input type="radio" name="trw" ${f.who === 'me' ? 'checked' : ''} onchange="W.filter.who='me';paintTasks()"> البطاقات المسندة إليّ</label><label class="tr-opt"><input type="radio" name="trw" ${f.who === 'created' ? 'checked' : ''} onchange="W.filter.who='created';paintTasks()"> التي أنشأتها</label>
    <div class="tr-pop-s">الاستحقاق</div>${[['', 'الكل'], ['late', 'متأخرة'], ['week', 'تستحق خلال أسبوع'], ['none', 'بلا تاريخ']].map(([k, t]) => `<label class="tr-opt"><input type="radio" name="trd" ${(f.due || '') === k ? 'checked' : ''} onchange="W.filter.due='${k}';paintTasks()"> ${t}</label>`).join('')}
    <div class="tr-pop-s">التسميات</div>${Object.entries(TR_LABELS).map(([k, l]) => `<label class="tr-opt"><input type="radio" name="trl" ${f.label === k ? 'checked' : ''} onchange="W.filter.label='${k}';paintTasks()"> <span class="tr-lbl" style="--l:${l.c}">${l.t}</span></label>`).join('')}<label class="tr-opt"><input type="radio" name="trl" ${!f.label ? 'checked' : ''} onchange="W.filter.label='';paintTasks()"> كل التسميات</label>
    <div class="tr-pop-s">البرنامج</div><select onchange="W.filter.program=this.value;paintTasks()">${programOptions(f.program, 'كل البرامج')}</select>
    <hr><button onclick="trPopClose();W.filter=Object.assign(W.filter,{who:'all',program:'',label:'',due:'',q:''});paintTasks()">مسح التصفية</button><button onclick="trPopClose();trArchived()"><i data-lucide="archive"></i> العناصر المؤرشفة</button>`, 300);
}
function trArchived() {
  const A = W.tasks.filter(t => t.archived);
  openModal('العناصر المؤرشفة', A.map(t => `<div class="r-row"><span>${esc(t.title)}</span><button class="link-btn" onclick="trPatch('${t.id}',{archived:false},'استرجع البطاقة').then(()=>{closeModal();paintTasks()})">استرجاع</button></div>`).join('') || '<p class="r-sub">لا شيء مؤرشف.</p>', () => closeModal());
}

/* ── منبثقات الحقول (تُستخدم في التعديل السريع وفي نافذة البطاقة) ── */
function trAfter() { if (document.getElementById('trCardModal')) trCardPaint(); else paintTasks(); }
function trLabelsPop(ev, id) {
  const t = W.tasks.find(x => x.id === id), on = t.labels || [];
  trPop(ev, trPopHead('التسميات') + Object.entries(TR_LABELS).map(([k, l]) => `<label class="tr-lrow"><input type="checkbox" ${on.includes(k) ? 'checked' : ''} onchange="trLabel('${id}','${k}',this.checked)"><span style="background:${l.c}">${l.t}</span></label>`).join(''), 280);
}
async function trLabel(id, k, on) { const t = W.tasks.find(x => x.id === id), L = (t.labels || []).filter(x => x !== k).concat(on ? [k] : []); await trPatch(id, { labels: L }); trAfter(); }
function trMembersPop(ev, id) {
  const t = W.tasks.find(x => x.id === id), cur = trMembers(t).map(m => m.id);
  trPop(ev, trPopHead('الأعضاء') + `<input class="tr-pop-q" placeholder="ابحث عن عضو…" oninput="document.querySelectorAll('#trPop .tr-mrow').forEach(r=>r.style.display=r.textContent.includes(this.value)?'':'none')">` + ORG.members.filter(m => m.active !== false).map(m => `<button class="tr-mrow${cur.includes(m.id) ? ' on' : ''}" onclick="trMember('${id}','${m.id}')">${avatar(m, 28)}<span>${esc(m.name)}</span>${cur.includes(m.id) ? '<i data-lucide="check"></i>' : ''}</button>`).join(''), 300);
}
async function trMember(id, mid) {
  const t = W.tasks.find(x => x.id === id), cur = trMembers(t).map(m => m.id), on = !cur.includes(mid), next = on ? cur.concat(mid) : cur.filter(x => x !== mid);
  if (await trPatch(id, { assignee: next[0] || null, members: next.slice(1) }, (on ? 'أضاف ' : 'أزال ') + memberName(mid))) { trPopClose(); trAfter(); }
}
function trCoverPop(ev, id) {
  trPop(ev, trPopHead('الغلاف') + `<div class="tr-covers">${TR_COVERS.map(c => `<button style="background:${c || 'transparent'}" class="${c ? '' : 'none'}" onclick="trPatch('${id}',{cover:'${c}'}).then(()=>{trPopClose();trAfter()})">${c ? '' : 'بلا'}</button>`).join('')}</div>`, 260);
}
function trDatesPop(ev, id) {
  const t = W.tasks.find(x => x.id === id);
  trPop(ev, trPopHead('التواريخ') + `<label class="tr-pop-s">تاريخ البدء</label><input type="date" id="trSd" value="${esc(t.start_date || '')}"><label class="tr-pop-s">تاريخ الاستحقاق</label><input type="date" id="trDd" value="${esc(t.due_date || '')}">
    <label class="tr-pop-s">الأولوية</label><select id="trPr">${Object.entries(T_PRIO).map(([k, p]) => `<option value="${k}"${k === t.priority ? ' selected' : ''}>${p.t}</option>`).join('')}</select>
    <button class="tr-primary" style="width:100%;margin-top:10px" onclick="trPatch('${id}',{start_date:document.getElementById('trSd').value||null,due_date:document.getElementById('trDd').value||null,priority:document.getElementById('trPr').value},'عدّل التواريخ').then(()=>{trPopClose();trAfter()})">حفظ</button>
    <button style="width:100%" onclick="trPatch('${id}',{start_date:null,due_date:null},'أزال التواريخ').then(()=>{trPopClose();trAfter()})">إزالة</button>`, 280);
}
function trMovePop(ev, id) {
  const t = W.tasks.find(x => x.id === id);
  trPop(ev, trPopHead('نقل البطاقة') + `<label class="tr-pop-s">القائمة</label><select id="trMv">${TASK_ST.map(s => `<option value="${s.key}"${s.key === t.status ? ' selected' : ''}>${s.label}</option>`).join('')}</select>
    <label class="tr-pop-s">الإدارة (اللوحة)</label><select id="trMd">${deptOptions(t.dept)}</select>
    <button class="tr-primary" style="width:100%;margin-top:10px" onclick="trMoveTo('${id}',document.getElementById('trMv').value,document.getElementById('trMd').value)">نقل</button>`, 280);
}
async function trMoveTo(id, st, dept) { const t = W.tasks.find(x => x.id === id), lbl = TASK_ST.find(s => s.key === st).label; if (await trPatch(id, { status: st, dept, pos: st === t.status ? t.pos : trEndPos(st), done_at: st === 'done' ? new Date().toISOString() : null }, st !== t.status ? 'نقل البطاقة إلى «' + lbl + '»' : 'نقل البطاقة')) { trPopClose(); trAfter(); } }
async function trCopy(id) { trPopClose(); const t = W.tasks.find(x => x.id === id), c = Object.assign({}, t); ['id', 'created_at', 'done_at'].forEach(k => delete c[k]); Object.assign(c, { title: t.title + ' (نسخة)', pos: trPos(t) + 1, created_by: ME.id, log: [{ t: 'نسخ البطاقة من «' + t.title + '»', by: ME.id, at: new Date().toISOString() }] }); try { const r = await RDB.insert('org_tasks', c); W.tasks.push(r); paintTasks(); } catch (e) { rToast(e.message, 1); } }
async function trArchive(id) { trPopClose(); if (await trPatch(id, { archived: true }, 'أرشف البطاقة')) { closeModal(); paintTasks(); rToast('أُرشفت البطاقة — تجدها في التصفية ← العناصر المؤرشفة'); } }

/* ═════════ السحب والإفلات (ماوس ولمس) ═════════ */
function trBindDrag() {
  const board = document.getElementById('trBoard'); if (!board) return;
  board.querySelectorAll('.tr-card').forEach(c => {
    c.addEventListener('pointerdown', e => { if (e.button !== 0 || e.target.closest('button,.tr-lbls')) return; TR.drag = { id: c.dataset.id, el: c, sx: e.clientX, sy: e.clientY, on: false, pid: e.pointerId, touch: e.pointerType === 'touch', t0: Date.now() }; });
    c.addEventListener('click', e => { if (TR.justDragged) { e.preventDefault(); return; } if (!e.target.closest('button')) taskModal(c.dataset.id); });
  });
  if (!TR.bound) { TR.bound = true; document.addEventListener('pointermove', trDragMove, { passive: false }); document.addEventListener('pointerup', trDragEnd); document.addEventListener('pointercancel', trDragEnd); }
}
function trDragMove(e) {
  const D = TR.drag; if (!D || e.pointerId !== D.pid) return;
  if (!D.on) {
    const dist = Math.hypot(e.clientX - D.sx, e.clientY - D.sy);
    if (D.touch && Date.now() - D.t0 < 220) { if (dist > 10) TR.drag = null; return; }   // باللمس: ضغطة قصيرة ثم سحب (حتى لا يتعارض مع التمرير)
    if (dist < 6) return;
    const r = D.el.getBoundingClientRect(); D.on = true; D.dx = e.clientX - r.left; D.dy = e.clientY - r.top;
    D.ghost = D.el.cloneNode(true); D.ghost.className += ' tr-ghost'; D.ghost.style.width = r.width + 'px'; document.body.appendChild(D.ghost);
    D.ph = document.createElement('div'); D.ph.className = 'tr-ph'; D.ph.style.height = r.height + 'px'; D.el.after(D.ph); D.el.style.display = 'none';
    document.body.classList.add('tr-dragging');
  }
  e.preventDefault();
  D.ghost.style.transform = `translate(${e.clientX - D.dx}px,${e.clientY - D.dy}px) rotate(-4deg)`;
  const under = document.elementsFromPoint(e.clientX, e.clientY), list = under.map(x => x.closest && x.closest('.tr-cards')).find(Boolean) || (under.map(x => x.closest && x.closest('.tr-list')).find(Boolean) || {}).querySelector?.('.tr-cards');
  if (list) {
    const cards = Array.from(list.querySelectorAll('.tr-card')).filter(x => x !== D.el && x.style.display !== 'none');
    const before = cards.find(x => { const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    if (before) list.insertBefore(D.ph, before); else list.appendChild(D.ph);
  }
  const b = document.getElementById('trBoard'); if (b) { const br = b.getBoundingClientRect(); if (e.clientX < br.left + 60) b.scrollLeft -= 18; else if (e.clientX > br.right - 60) b.scrollLeft += 18; }
}
async function trDragEnd(e) {
  const D = TR.drag; TR.drag = null; if (!D || !D.on) return;
  document.body.classList.remove('tr-dragging'); D.ghost.remove();
  const list = D.ph.parentElement, st = list && list.dataset.list;
  const sibs = list ? Array.from(list.children).filter(x => x.classList.contains('tr-card') && x !== D.el) : [];
  const idx = list ? Array.from(list.children).filter(x => x === D.ph || (x.classList.contains('tr-card') && x !== D.el)).indexOf(D.ph) : -1;
  D.ph.remove(); D.el.style.display = '';
  TR.justDragged = true; setTimeout(() => TR.justDragged = false, 50);
  if (!st) return;
  const T = id => W.tasks.find(x => x.id === id), prev = sibs[idx - 1] && T(sibs[idx - 1].dataset.id), next = sibs[idx] && T(sibs[idx].dataset.id);
  const pos = prev && next ? (trPos(prev) + trPos(next)) / 2 : prev ? trPos(prev) + 1024 : next ? trPos(next) - 1024 : 1024;
  const t = T(D.id), moved = t.status !== st;
  await trPatch(D.id, Object.assign({ pos }, moved ? { status: st, done_at: st === 'done' ? new Date().toISOString() : null } : {}), moved ? 'نقل البطاقة من «' + TASK_ST.find(s => s.key === t.status).label + '» إلى «' + TASK_ST.find(s => s.key === st).label + '»' : null);
  paintTasks();
}
async function taskDrop() {}   // متوافق مع الواجهة القديمة

/* ═════════ نافذة البطاقة ═════════ */
let TRC = null;
async function taskModal(id, preset) {
  if (!id) {   // بطاقة جديدة بتفاصيل: نُنشئها ثم نفتحها
    const st = (preset || {}).status || 'todo', row = Object.assign({ title: 'بطاقة جديدة', description: '', dept: W.filter.dept || ME.dept, assignee: ME.role === 'staff' ? ME.id : null, status: st, priority: 'normal', links: [], labels: [], checklists: [], members: [], pos: trEndPos(st), created_by: ME.id, log: [{ t: 'أنشأ البطاقة', by: ME.id, at: new Date().toISOString() }] }, preset || {});
    try { const r = await RDB.insert('org_tasks', row); W.tasks.push(r); id = r.id; TRC = { id, fresh: true }; } catch (e) { rToast(e.message, 1); return; }
  } else TRC = { id };
  if (!W.tasks.find(x => x.id === id)) { const all = await RDB.list('org_tasks').catch(() => []); const t = all.find(x => x.id === id); if (!t) return; W.tasks.push(t); }
  TRC.comments = await RDB.list('task_comments', { eq: { task_id: id }, order: 'created_at', asc: true }).catch(() => []);
  document.getElementById('modalRoot').innerHTML = `<div class="modal-bg tr-mbg" onclick="if(event.target===this)trCardClose()"><div class="tr-modal" id="trCardModal" role="dialog" aria-modal="true"></div></div>`;
  trCardPaint();
  if (TRC.fresh) setTimeout(() => { const i = document.getElementById('trTitle'); if (i) { i.focus(); i.select(); } }, 50);
  document.addEventListener('keydown', trEsc);
}
function trEsc(e) { if (e.key === 'Escape' && !document.getElementById('trPop') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) trCardClose(); }
function trCardClose() { document.removeEventListener('keydown', trEsc); trPopClose(); closeModal(); if (CUR === 'tasks') paintTasks(); else rerenderCur(); }
function trCanEdit(t) { return isAdmin() || t.created_by === ME.id || t.assignee === ME.id || (t.members || []).includes(ME.id) || (isManager() && t.dept === ME.dept); }
function trCardPaint() {
  const t = W.tasks.find(x => x.id === TRC.id), el = document.getElementById('trCardModal'); if (!t || !el) return;
  const st = TASK_ST.find(s => s.key === t.status), ed = trCanEdit(t), ms = trMembers(t), c = trChecks(t), done = t.status === 'done';
  const act = (t.log || []).map(l => ({ at: l.at, h: `${avatar(ORG.members.find(m => m.id === l.by), 28)}<div><b>${esc(memberName(l.by))}</b> ${esc(l.t)}<small>${fmtD(l.at)}</small></div>` }))
    .concat(TRC.comments.map(x => ({ at: x.created_at, h: `${avatar(ORG.members.find(m => m.id === x.author), 28)}<div><b>${esc(memberName(x.author))}</b> <small>${fmtD(x.created_at)}</small><p class="tr-cbody">${esc(x.body)}</p></div>` }))).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  el.innerHTML = `
    <div class="tr-mtop"${t.cover ? ` style="background:${esc(t.cover)}"` : ''}><button class="tr-listchip" onclick="${ed ? `trMovePop(event,'${t.id}')` : ''}" style="--lc:${st.c}">${st.label} <i data-lucide="chevron-down"></i></button>
      <div class="tr-mtop-a">${ed ? `<button class="tr-cib" onclick="trCoverPop(event,'${t.id}')" title="الغلاف"><i data-lucide="panel-top"></i></button><button class="tr-cib" onclick="trCardMenu(event)" title="المزيد"><i data-lucide="ellipsis"></i></button>` : ''}<button class="tr-cib" onclick="trCardClose()" title="إغلاق"><i data-lucide="x"></i></button></div></div>
    <div class="tr-mbody"><div class="tr-main">
      <div class="tr-mtitle"><button class="tr-done big" onclick="trToggleDone('${t.id}').then(trCardPaint)">${done ? '<i data-lucide="circle-check"></i>' : '<i data-lucide="circle"></i>'}</button><textarea id="trTitle" rows="1" ${ed ? '' : 'disabled'} onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}" onblur="if(this.value.trim()&&this.value.trim()!==${esc(JSON.stringify(t.title))})trPatch('${t.id}',{title:this.value.trim()},'غيّر العنوان')">${esc(t.title)}</textarea></div>
      ${ed ? `<div class="tr-chips"><button onclick="trAddPop(event)"><i data-lucide="plus"></i> إضافة</button><button onclick="trLabelsPop(event,'${t.id}')"><i data-lucide="tag"></i> التسميات</button><button onclick="trDatesPop(event,'${t.id}')"><i data-lucide="clock"></i> التواريخ</button><button onclick="trAddChecklist()"><i data-lucide="square-check"></i> قائمة تحقق</button><button onclick="trMembersPop(event,'${t.id}')"><i data-lucide="user-round"></i> الأعضاء</button></div>` : ''}
      <div class="tr-meta">
        ${ms.length ? `<div><label>الأعضاء</label><div class="tr-mavs">${ms.map(m => avatar(m, 32)).join('')}${ed ? `<button class="tr-plus" onclick="trMembersPop(event,'${t.id}')"><i data-lucide="plus"></i></button>` : ''}</div></div>` : ''}
        ${(t.labels || []).length ? `<div><label>التسميات</label><div class="tr-mlbls">${t.labels.map(l => `<span style="background:${TR_LABELS[l].c}">${TR_LABELS[l].t}</span>`).join('')}${ed ? `<button class="tr-plus" onclick="trLabelsPop(event,'${t.id}')"><i data-lucide="plus"></i></button>` : ''}</div></div>` : ''}
        ${t.due_date || t.start_date ? `<div><label>${t.start_date ? 'التواريخ' : 'تاريخ الاستحقاق'}</label><button class="tr-datechip" onclick="${ed ? `trDatesPop(event,'${t.id}')` : ''}">${t.start_date ? fmtD(t.start_date) + ' — ' : ''}${t.due_date ? fmtD(t.due_date) : ''} ${trDue(t, 1).replace(/<i[^>]*><\/i>/, '').replace(/>[^<]*</, '>' + (done ? 'مكتملة' : daysTo(t.due_date) < 0 ? 'متأخرة' : daysTo(t.due_date) <= 1 ? 'تستحق قريباً' : '') + '<')}</button></div>` : ''}
        ${t.priority !== 'normal' ? `<div><label>الأولوية</label><span class="r-badge" style="--c:${T_PRIO[t.priority].c}">${T_PRIO[t.priority].t}</span></div>` : ''}
        <div><label>الإدارة / البرنامج</label><span class="tr-meta-v">${esc(DEPTS[t.dept] ? DEPTS[t.dept].short : '')}${t.program_id ? ' · ' + esc(programName(t.program_id)) : ''}${ed ? ` <button class="link-btn" onclick="trProgPop(event)">تغيير</button>` : ''}</span></div>
      </div>
      <section class="tr-sec"><div class="tr-sec-h"><i data-lucide="text"></i><h4>الوصف</h4>${ed && t.description ? `<button class="tr-sbtn" onclick="trDescEdit()">تعديل</button>` : ''}</div>
        <div id="trDesc">${t.description ? `<div class="tr-desc" onclick="${ed ? 'trDescEdit()' : ''}">${esc(t.description).replace(/\n/g, '<br>')}</div>` : ed ? `<button class="tr-descph" onclick="trDescEdit()">أضف وصفاً أكثر تفصيلاً…</button>` : '<p class="r-sub">لا وصف.</p>'}</div></section>
      <section class="tr-sec"><div class="tr-sec-h"><i data-lucide="paperclip"></i><h4>المرفقات والمخرجات (Google Drive)</h4>${ed ? `<button class="tr-sbtn" onclick="trLinkAdd()">إضافة</button>` : ''}</div>
        ${(t.links || []).map((l, i) => `<div class="tr-att"><span class="tr-att-ic"><i data-lucide="${/drive|docs\.google/.test(l.url) ? 'hard-drive' : 'link'}"></i></span><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title || l.url)}</a>${ed ? `<button class="tr-ib" onclick="trLinkDel(${i})" title="حذف"><i data-lucide="trash-2"></i></button>` : ''}</div>`).join('') || '<p class="r-sub">ارفع الملفات على Google Drive وأضف روابطها هنا.</p>'}</section>
      ${(t.checklists || []).map(cl => { const n = (cl.items || []).length, d = (cl.items || []).filter(i => i.done).length, pct = n ? Math.round(d / n * 100) : 0; return `<section class="tr-sec"><div class="tr-sec-h"><i data-lucide="square-check"></i><h4>${esc(cl.title)}</h4>${ed ? `<button class="tr-sbtn" onclick="trClDel('${cl.id}')">حذف</button>` : ''}</div>
        <div class="tr-prog"><span>${pct}%</span><div><i style="width:${pct}%;background:${pct === 100 ? '#4BCE97' : '#579DFF'}"></i></div></div>
        ${(cl.items || []).map(it => `<div class="tr-item${it.done ? ' done' : ''}"><input type="checkbox" ${it.done ? 'checked' : ''} ${ed ? '' : 'disabled'} onchange="trItem('${cl.id}','${it.id}',this.checked)"><span>${esc(it.t)}</span>${ed ? `<button class="tr-ib" onclick="trItemDel('${cl.id}','${it.id}')"><i data-lucide="x"></i></button>` : ''}</div>`).join('')}
        ${ed ? `<div class="tr-itemadd" id="trIA_${cl.id}"><button class="tr-sbtn" onclick="trItemComposer('${cl.id}')">إضافة عنصر</button></div>` : ''}</section>`; }).join('')}
    </div>
    <aside class="tr-side"><div class="tr-sec-h"><i data-lucide="message-square"></i><h4>التعليقات والنشاط</h4></div>
      <div class="tr-cmtbox">${avatar(ME, 28)}<textarea id="trCmt" rows="1" placeholder="اكتب تعليقاً…" onfocus="this.rows=3" onkeydown="if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){trComment()}"></textarea></div>
      <div class="tr-cmtact"><button class="tr-primary" onclick="trComment()">حفظ</button></div>
      <div class="tr-act">${act.map(a => `<div class="tr-actrow">${a.h}</div>`).join('') || '<p class="r-sub">لا نشاط بعد.</p>'}</div>
      <p class="r-sub tr-created">أنشأها ${esc(memberName(t.created_by))} · ${fmtD(t.created_at)}</p></aside></div>`;
  refreshIcons();
  const ta = document.getElementById('trTitle'); if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
}
function trAddPop(ev) { const id = TRC.id; trPop(ev, trPopHead('إضافة إلى البطاقة') + `<button class="tr-addrow" onclick="trLabelsPop(event,'${id}')"><i data-lucide="tag"></i><span><b>التسميات</b><small>تنظيم وتصنيف وأولويات</small></span></button><button class="tr-addrow" onclick="trDatesPop(event,'${id}')"><i data-lucide="clock"></i><span><b>التواريخ</b><small>تاريخ البدء والاستحقاق</small></span></button><button class="tr-addrow" onclick="trPopClose();trAddChecklist()"><i data-lucide="square-check"></i><span><b>قائمة تحقق</b><small>مهام فرعية</small></span></button><button class="tr-addrow" onclick="trMembersPop(event,'${id}')"><i data-lucide="user-round"></i><span><b>الأعضاء</b><small>إسناد الأعضاء</small></span></button><button class="tr-addrow" onclick="trPopClose();trLinkAdd()"><i data-lucide="paperclip"></i><span><b>مرفق</b><small>رابط Google Drive أو أي صفحة</small></span></button>`, 290); }
function trCardMenu(ev) { const id = TRC.id; trPop(ev, `<div class="tr-quick"><button onclick="trMovePop(event,'${id}')"><i data-lucide="arrow-left-right"></i> نقل</button><button onclick="trCopy('${id}');trCardClose()"><i data-lucide="copy"></i> نسخ</button><button onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href.split('#')[0]+'#task-${id}');rToast('نُسخ الرابط')"><i data-lucide="link"></i> نسخ الرابط</button><button onclick="trArchive('${id}')"><i data-lucide="archive"></i> أرشفة</button>${isAdmin() || W.tasks.find(x => x.id === id).created_by === ME.id ? `<button style="color:var(--bad)" onclick="trDelete('${id}')"><i data-lucide="trash-2"></i> حذف نهائي</button>` : ''}</div>`, 210); }
async function trDelete(id) { trPopClose(); if (!confirm('حذف البطاقة نهائياً؟ (الأرشفة تكفي غالباً)')) return; try { await RDB.remove('org_tasks', id); W.tasks = W.tasks.filter(x => x.id !== id); trCardClose(); } catch (e) { rToast(e.message, 1); } }
function trProgPop(ev) { const t = W.tasks.find(x => x.id === TRC.id); trPop(ev, trPopHead('الإدارة والبرنامج') + `<label class="tr-pop-s">الإدارة</label><select id="trPd">${deptOptions(t.dept)}</select><label class="tr-pop-s">البرنامج</label><select id="trPp">${programOptions(t.program_id)}</select><button class="tr-primary" style="width:100%;margin-top:10px" onclick="trPatch('${t.id}',{dept:document.getElementById('trPd').value,program_id:document.getElementById('trPp').value||null}).then(()=>{trPopClose();trCardPaint()})">حفظ</button>`, 280); }
function trDescEdit() {
  const t = W.tasks.find(x => x.id === TRC.id), box = document.getElementById('trDesc');
  box.innerHTML = `<textarea id="trDescIn" rows="6" placeholder="المطلوب بالضبط، المقاسات، المرجع…">${esc(t.description || '')}</textarea><div class="tr-row"><button class="tr-primary" onclick="trPatch('${t.id}',{description:document.getElementById('trDescIn').value.trim()},'عدّل الوصف').then(trCardPaint)">حفظ</button><button class="tr-sbtn" onclick="trCardPaint()">إلغاء</button></div>`;
  document.getElementById('trDescIn').focus();
}
async function trComment() { const v = (document.getElementById('trCmt') || {}).value; if (!v || !v.trim()) return; try { const c = await RDB.insert('task_comments', { task_id: TRC.id, author: ME.id, body: v.trim() }); TRC.comments.push(c); TR.comments[TRC.id] = (TR.comments[TRC.id] || 0) + 1; trCardPaint(); } catch (e) { rToast(e.message, 1); } }
async function trLinkAdd() {
  const url = prompt('الصق رابط الملف (Google Drive أو أي صفحة):', 'https://'); if (!url || url === 'https://') return; if (!validUrl(url)) { rToast('الرابط يجب أن يبدأ بـ https://', 1); return; }
  const title = prompt('اسم المرفق (مثال: التصميم النهائي):', '') || '';
  const t = W.tasks.find(x => x.id === TRC.id); await trPatch(t.id, { links: (t.links || []).concat([{ title, url }]) }, 'أرفق ' + (title || 'رابطاً')); trCardPaint();
}
async function trLinkDel(i) { const t = W.tasks.find(x => x.id === TRC.id), L = (t.links || []).slice(); L.splice(i, 1); await trPatch(t.id, { links: L }); trCardPaint(); }
async function trAddChecklist() { const title = prompt('عنوان قائمة التحقق:', 'قائمة تحقق'); if (!title) return; const t = W.tasks.find(x => x.id === TRC.id), id = trId(); await trPatch(t.id, { checklists: (t.checklists || []).concat([{ id, title, items: [] }]) }, 'أضاف قائمة التحقق «' + title + '»'); trCardPaint(); trItemComposer(id); }
async function trClDel(cid) { if (!confirm('حذف قائمة التحقق؟')) return; const t = W.tasks.find(x => x.id === TRC.id); await trPatch(t.id, { checklists: (t.checklists || []).filter(c => c.id !== cid) }); trCardPaint(); }
function trItemComposer(cid) { const b = document.getElementById('trIA_' + cid); if (!b) return; b.innerHTML = `<textarea id="trIn_${cid}" rows="2" placeholder="أضف عنصراً…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();trItemAdd('${cid}')}else if(event.key==='Escape')trCardPaint()"></textarea><div class="tr-row"><button class="tr-primary" onclick="trItemAdd('${cid}')">إضافة</button><button class="tr-sbtn" onclick="trCardPaint()">إلغاء</button></div>`; document.getElementById('trIn_' + cid).focus(); }
async function trItemAdd(cid) { const v = document.getElementById('trIn_' + cid).value.trim(); if (!v) return; const t = W.tasks.find(x => x.id === TRC.id); await trPatch(t.id, { checklists: (t.checklists || []).map(c => c.id === cid ? Object.assign({}, c, { items: (c.items || []).concat([{ id: trId(), t: v, done: false }]) }) : c) }); trCardPaint(); trItemComposer(cid); }
async function trItem(cid, iid, done) { const t = W.tasks.find(x => x.id === TRC.id), it = ((t.checklists || []).find(c => c.id === cid).items || []).find(i => i.id === iid); await trPatch(t.id, { checklists: (t.checklists || []).map(c => c.id === cid ? Object.assign({}, c, { items: c.items.map(i => i.id === iid ? Object.assign({}, i, { done }) : i) }) : c) }, done ? 'أكمل «' + it.t + '»' : null); trCardPaint(); }
async function trItemDel(cid, iid) { const t = W.tasks.find(x => x.id === TRC.id); await trPatch(t.id, { checklists: (t.checklists || []).map(c => c.id === cid ? Object.assign({}, c, { items: c.items.filter(i => i.id !== iid) }) : c) }); trCardPaint(); }
