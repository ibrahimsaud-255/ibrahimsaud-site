/*
 * 28-org-calendar.js — التقويم على نمط Apple Calendar (هندسة عكسية لتقويم macOS)
 * أيام/أسبوع/شهر/سنة/قائمة، شريط جانبي (تقويم مصغّر + التقاويم الملوّنة)، لوحة تفاصيل الحدث،
 * إنشاء حدث بالسحب على الساعات، نقل الحدث بالسحب، تغيير مدته من حافته، خط الوقت الحالي، اختصارات لوحة المفاتيح.
 * يجمع: مواعيدي الشخصية + أحداث الجمعية المشتركة (org_events) + مواعيد استحقاق المهام والاجتماعات والإجازات والالتزامات.
 * ⚠️ تعريفات فقط.
 */
const AC_CALS = {
  personal: { t: 'مواعيدي', c: '#CAB05F' }, org: { t: 'تقويم الجمعية', c: '#41A3B0' }, programs: { t: 'البرامج والفعاليات', c: '#FF9F43' },
  meetings: { t: 'الاجتماعات', c: '#A78BFA' }, tasks: { t: 'استحقاق المهام', c: '#579DFF' }, leaves: { t: 'الإجازات', c: '#FF7A9C' }, deadlines: { t: 'المواعيد النظامية', c: '#F87168' },
};
const CV = { view: localStorage.getItem('cv_view') || (innerWidth < 760 ? 'list' : 'week'), date: new Date(), hidden: JSON.parse(localStorage.getItem('cv_hidden') || '[]'), sel: null, events: [], org: [], extra: [], hour: 48, drag: null };
const CV_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const CV_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const cvD = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const cvKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const cvAdd = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const cvSame = (a, b) => cvKey(a) === cvKey(b);
const cvTime = d => d.toLocaleTimeString('ar-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
const cvWeekStart = d => cvAdd(cvD(d), -d.getDay());
const cvLocalISO = d => cvKey(d) + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
const cvSave = () => { try { localStorage.setItem('cv_view', CV.view); localStorage.setItem('cv_hidden', JSON.stringify(CV.hidden)); } catch (e) {} };

/* ═════════ جمع الأحداث من كل المصادر ═════════ */
async function cvLoad() {
  const L = t => RDB.list(t).catch(() => []);
  const [org, tasks, meetings, leaves, cmp, grants] = await Promise.all([L('org_events'), can('tasks') ? L('org_tasks') : [], L('meetings'), L('hr_requests'), L('compliance'), L('grants')]);
  CV.org = org; const E = [];
  (S.appointments || []).forEach(a => { const s = new Date(a.datetime); if (isNaN(s)) return; E.push({ id: 'p:' + a.id, src: 'personal', cal: 'personal', title: a.title || 'موعد', start: s, end: new Date(s.getTime() + (Number(a.duration) || 60) * 6e4), allDay: false, notes: a.notes || '', location: a.contact || '', edit: true, ref: a }); });
  org.forEach(o => cvExpand(o).forEach(e => E.push(e)));
  tasks.filter(t => t.due_date && !t.archived).forEach(t => E.push({ id: 't:' + t.id, src: 'task', cal: 'tasks', title: (t.status === 'done' ? '✓ ' : '') + t.title, start: new Date(t.due_date + 'T00:00'), end: new Date(t.due_date + 'T23:59'), allDay: true, late: t.status !== 'done' && t.due_date < today(), edit: t.status !== 'done', ref: t }));
  meetings.filter(m => m.date && m.status !== 'cancelled').forEach(m => E.push({ id: 'm:' + m.id, src: 'meeting', cal: 'meetings', title: 'اجتماع ' + (typeof MEET_BODY !== 'undefined' ? MEET_BODY[m.body] : '') + (m.number ? ' ' + m.number : ''), start: new Date(m.date + 'T19:00'), end: new Date(m.date + 'T21:00'), allDay: false, location: m.location, notes: m.agenda, ref: m }));
  leaves.filter(r => r.status === 'approved' && r.from_date && ['annual', 'sick', 'emergency', 'exam', 'unpaid', 'mission'].includes(r.kind)).forEach(r => E.push({ id: 'l:' + r.id, src: 'leave', cal: 'leaves', title: memberName(r.member_id) + ' — ' + ((typeof HR_KINDS !== 'undefined' && HR_KINDS[r.kind]) || 'إجازة'), start: new Date(r.from_date + 'T00:00'), end: new Date((r.to_date || r.from_date) + 'T23:59'), allDay: true, ref: r }));
  cmp.filter(c => c.status === 'open' && c.due).forEach(c => E.push({ id: 'c:' + c.id, src: 'deadline', cal: 'deadlines', title: c.title, start: new Date(c.due + 'T00:00'), end: new Date(c.due + 'T23:59'), allDay: true, notes: c.ref, ref: c }));
  grants.forEach(g => (g.reports || []).filter(r => r.due && !/^نعم|^y/i.test(r.done || '')).forEach((r, i) => E.push({ id: 'g:' + g.id + i, src: 'deadline', cal: 'deadlines', title: 'تقرير للمانح: ' + r.title, start: new Date(r.due + 'T00:00'), end: new Date(r.due + 'T23:59'), allDay: true, notes: g.title, ref: g })));
  CV.events = E;
}
/* التكرار: يومي/أسبوعي/شهري/سنوي ضمن نطاق ±18 شهراً */
function cvExpand(o) {
  const s0 = new Date(o.start), e0 = new Date(o.end || o.start), dur = e0 - s0, out = [], cal = AC_CALS[o.calendar] ? o.calendar : 'org';
  const mk = (s, k) => ({ id: 'o:' + o.id + (k ? ':' + k : ''), src: 'org', cal, title: o.title, start: s, end: new Date(s.getTime() + dur), allDay: !!o.all_day, location: o.location, notes: o.notes, url: o.url, edit: o.created_by === ME.id || isManager(), ref: o, occ: k });
  if (!o.repeat || o.repeat === 'none') return [mk(s0)];
  const lim = cvAdd(new Date(), 550); let s = new Date(s0), k = 0;
  while (s <= lim && k < 600) { out.push(mk(new Date(s), k)); k++; if (o.repeat === 'daily') s = cvAdd(s, 1); else if (o.repeat === 'weekly') s = cvAdd(s, 7); else if (o.repeat === 'monthly') { s = new Date(s); s.setMonth(s.getMonth() + 1); } else { s = new Date(s); s.setFullYear(s.getFullYear() + 1); } if (o.repeat_until && cvKey(s) > o.repeat_until) break; }
  return out;
}
const cvVisible = () => CV.events.filter(e => !CV.hidden.includes(e.cal));
const cvOn = (e, d) => { const a = cvD(e.start), b = cvD(new Date(e.end.getTime() - 1)); return cvD(d) >= a && cvD(d) <= (b < a ? a : b); };

/* ═════════ الواجهة ═════════ */
async function renderCalendar() {
  if (typeof FC !== 'undefined' && FC) { try { FC.destroy(); } catch (e) {} FC = null; }
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  await cvLoad(); cvPaint();
  if (!CV.keys) { CV.keys = true; document.addEventListener('keydown', cvKeys); }
}
function cvTitle() {
  const d = CV.date;
  if (CV.view === 'day') return `<b>${d.getDate()} ${CV_MONTHS[d.getMonth()]}</b> ${d.getFullYear()}`;
  if (CV.view === 'year') return `<b>${d.getFullYear()}</b>`;
  if (CV.view === 'week') { const a = cvWeekStart(d), b = cvAdd(a, 6); return a.getMonth() === b.getMonth() ? `<b>${CV_MONTHS[a.getMonth()]}</b> ${a.getFullYear()}` : `<b>${CV_MONTHS[a.getMonth()]} – ${CV_MONTHS[b.getMonth()]}</b> ${b.getFullYear()}`; }
  return `<b>${CV_MONTHS[d.getMonth()]}</b> ${d.getFullYear()}`;
}
function cvPaint() {
  const views = [['day', 'يوم'], ['week', 'أسبوع'], ['month', 'شهر'], ['year', 'سنة'], ['list', 'قائمة']];
  const body = { day: cvDayWeek, week: cvDayWeek, month: cvMonth, year: cvYear, list: cvList }[CV.view]();
  document.getElementById('main').innerHTML = `<div class="cv-app${CV.view === 'day' ? ' cv-has-insp' : ''}">
    <aside class="cv-side">${cvMini(CV.date)}<div class="cv-cals"><h4>التقاويم</h4>${Object.entries(AC_CALS).map(([k, c]) => `<label class="cv-cal"><input type="checkbox" ${CV.hidden.includes(k) ? '' : 'checked'} onchange="cvToggleCal('${k}')"><span class="cv-box" style="--c:${c.c}"></span>${c.t}</label>`).join('')}</div>
      <button class="cv-ics" onclick="cvICS()"><i data-lucide="download"></i> تصدير إلى تقويم الجوال (.ics)</button></aside>
    <section class="cv-main">
      <header class="cv-bar"><div class="cv-bar-a"><button class="cv-add" onclick="cvNew()" title="حدث جديد (N)"><i data-lucide="plus"></i></button>
          <div class="cv-seg">${views.map(([v, t]) => `<button class="${CV.view === v ? 'on' : ''}" onclick="cvSetView('${v}')">${t}</button>`).join('')}</div></div>
        <div class="cv-bar-b"><h1 class="cv-title">${cvTitle()}</h1><div class="cv-nav"><button onclick="cvMove(-1)" title="السابق"><i data-lucide="chevron-right"></i></button><button class="cv-today" onclick="CV.date=new Date();cvPaint()">اليوم</button><button onclick="cvMove(1)" title="التالي"><i data-lucide="chevron-left"></i></button></div></div></header>
      <div class="cv-body" id="cvBody">${body}</div></section>
    ${CV.view === 'day' ? `<aside class="cv-insp" id="cvInsp">${cvInspector()}</aside>` : ''}</div>`;
  refreshIcons(); cvAfter();
}
function cvSetView(v) { CV.view = v; cvSave(); cvPaint(); }
function cvMove(n) { const d = new Date(CV.date); if (CV.view === 'day') d.setDate(d.getDate() + n); else if (CV.view === 'week') d.setDate(d.getDate() + 7 * n); else if (CV.view === 'year') d.setFullYear(d.getFullYear() + n); else d.setMonth(d.getMonth() + n, 1); CV.date = d; cvPaint(); }
function cvToggleCal(k) { CV.hidden = CV.hidden.includes(k) ? CV.hidden.filter(x => x !== k) : CV.hidden.concat(k); cvSave(); cvPaint(); }
function cvKeys(e) {
  if (CUR !== 'calendar' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.querySelector('.modal-bg')) return;
  const k = e.key.toLowerCase();
  if (k === 't') { CV.date = new Date(); cvPaint(); } else if (k === 'n') cvNew(); else if (k === 'd') cvSetView('day'); else if (k === 'w') cvSetView('week'); else if (k === 'm') cvSetView('month'); else if (k === 'y') cvSetView('year');
  else if (e.key === 'ArrowLeft') cvMove(1); else if (e.key === 'ArrowRight') cvMove(-1); else if (e.key === 'Escape') { cvPopClose(); } else if ((e.key === 'Delete' || e.key === 'Backspace') && CV.sel) cvDelete(CV.sel);
}

/* ── التقويم المصغّر ── */
function cvMini(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1), start = cvAdd(first, -first.getDay()), has = new Set(cvVisible().map(e => cvKey(e.start)));
  let cells = ''; for (let i = 0; i < 42; i++) { const x = cvAdd(start, i); cells += `<button class="${x.getMonth() !== d.getMonth() ? 'out' : ''}${cvSame(x, new Date()) ? ' now' : ''}${cvSame(x, CV.date) ? ' sel' : ''}${has.has(cvKey(x)) ? ' dot' : ''}" onclick="CV.date=new Date(${x.getFullYear()},${x.getMonth()},${x.getDate()});if(CV.view==='year'||CV.view==='list')CV.view='day';cvPaint()">${x.getDate()}</button>`; }
  return `<div class="cv-mini"><div class="cv-mini-h"><button onclick="CV.date=new Date(${d.getFullYear()},${d.getMonth() - 1},1);cvPaint()"><i data-lucide="chevron-right"></i></button><b>${CV_MONTHS[d.getMonth()]} ${d.getFullYear()}</b><button onclick="CV.date=new Date(${d.getFullYear()},${d.getMonth() + 1},1);cvPaint()"><i data-lucide="chevron-left"></i></button></div>
    <div class="cv-mini-g">${CV_DAYS.map(n => `<span>${n[0] === 'ا' ? n[2] : n[0]}</span>`).join('')}${cells}</div></div>`;
}

/* ── اليوم والأسبوع (شبكة الساعات) ── */
function cvDays() { return CV.view === 'day' ? [cvD(CV.date)] : Array.from({ length: 7 }, (_, i) => cvAdd(cvWeekStart(CV.date), i)); }
function cvDayWeek() {
  const days = cvDays(), H = CV.hour, V = cvVisible(), now = new Date();
  const allDay = days.map(d => V.filter(e => (e.allDay || (e.end - e.start) >= 864e5) && cvOn(e, d)));
  return `<div class="cv-grid ${CV.view}" style="--n:${days.length};--h:${H}px">
    <div class="cv-dh"><div class="cv-gutter"></div>${days.map(d => `<button class="cv-dhc${cvSame(d, now) ? ' now' : ''}${d.getDay() === 5 || d.getDay() === 6 ? ' we' : ''}" onclick="CV.date=new Date(${d.getFullYear()},${d.getMonth()},${d.getDate()});CV.view='day';cvPaint()"><span>${CV_DAYS[d.getDay()]}</span><b>${d.getDate()}</b></button>`).join('')}</div>
    <div class="cv-ad"><div class="cv-gutter">طوال اليوم</div>${allDay.map((L, i) => `<div class="cv-adc" data-day="${cvKey(days[i])}" ondblclick="cvNew('${cvKey(days[i])}',null,true)">${L.slice(0, 3).map(cvChip).join('')}${L.length > 3 ? `<button class="cv-more" onclick="CV.date=new Date('${cvKey(days[i])}T00:00');CV.view='day';cvPaint()">+${L.length - 3} أخرى</button>` : ''}</div>`).join('')}</div>
    <div class="cv-scroll" id="cvScroll"><div class="cv-tg">
      <div class="cv-hours">${Array.from({ length: 24 }, (_, h) => `<div style="height:${H}px"><span>${h === 0 ? '' : h === 12 ? 'الظهر' : (h % 12 || 12) + (h < 12 ? ' ص' : ' م')}</span></div>`).join('')}</div>
      ${days.map(d => { const evs = cvLayout(V.filter(e => !e.allDay && (e.end - e.start) < 864e5 && cvOn(e, d)), d); return `<div class="cv-col${d.getDay() === 5 || d.getDay() === 6 ? ' we' : ''}" data-day="${cvKey(d)}">${Array.from({ length: 24 }, () => `<div class="cv-slot" style="height:${H}px"></div>`).join('')}${evs.map(cvBlock).join('')}${cvSame(d, now) ? `<div class="cv-now" style="top:${(now.getHours() + now.getMinutes() / 60) * H}px"><i></i></div>` : ''}</div>`; }).join('')}
    </div></div></div>`;
}
/* توزيع الأحداث المتداخلة في أعمدة (كما في تقويم أبل) */
function cvLayout(evs, d) {
  const day0 = cvD(d).getTime(), list = evs.map(e => ({ e, s: Math.max(0, (e.start - day0) / 36e5), f: Math.min(24, (e.end - day0) / 36e5) })).sort((a, b) => a.s - b.s || b.f - a.f);
  let group = [], end = -1; const groups = [];
  list.forEach(x => { if (x.s >= end && group.length) { groups.push(group); group = []; } group.push(x); end = Math.max(end, x.f); }); if (group.length) groups.push(group);
  groups.forEach(g => { const cols = []; g.forEach(x => { let c = cols.findIndex(f => f <= x.s); if (c < 0) { c = cols.length; cols.push(0); } cols[c] = x.f; x.c = c; }); g.forEach(x => x.n = cols.length); });
  return list;
}
function cvBlock(x) {
  const e = x.e, c = AC_CALS[e.cal].c, top = x.s * CV.hour, h = Math.max(18, (x.f - x.s) * CV.hour - 2), w = 100 / x.n;
  return `<div class="cv-ev${CV.sel === e.id ? ' sel' : ''}${e.late ? ' late' : ''}" data-id="${e.id}" style="--c:${c};top:${top}px;height:${h}px;inset-inline-start:calc(${x.c * w}% + 1px);width:calc(${w}% - 3px)" title="${esc(e.title)}">
    <b>${esc(e.title)}</b>${h > 34 ? `<small><i data-lucide="clock-3"></i>${cvTime(e.start)} – ${cvTime(e.end)}</small>` : ''}${h > 56 && e.location ? `<small>${esc(e.location)}</small>` : ''}${e.ref && e.ref.repeat && e.ref.repeat !== 'none' ? '<i class="cv-rep" data-lucide="repeat"></i>' : ''}${e.edit ? '<span class="cv-rs"></span>' : ''}</div>`;
}
function cvChip(e) { return `<div class="cv-chip${CV.sel === e.id ? ' sel' : ''}${e.late ? ' late' : ''}" data-id="${e.id}" style="--c:${AC_CALS[e.cal].c}" title="${esc(e.title)}">${esc(e.title)}</div>`; }

/* ── الشهر ── */
function cvMonth() {
  const d = CV.date, first = new Date(d.getFullYear(), d.getMonth(), 1), start = cvAdd(first, -first.getDay()), weeks = Math.ceil((first.getDay() + new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()) / 7), V = cvVisible(), now = new Date(), max = innerWidth < 760 ? 2 : 4;
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const x = cvAdd(start, i), L = V.filter(e => cvOn(e, x)).sort((a, b) => (b.allDay - a.allDay) || (a.start - b.start));
    cells += `<div class="cv-mc${x.getMonth() !== d.getMonth() ? ' out' : ''}${x.getDay() === 5 || x.getDay() === 6 ? ' we' : ''}" data-day="${cvKey(x)}" ondblclick="cvNew('${cvKey(x)}')">
      <button class="cv-mn${cvSame(x, now) ? ' now' : ''}" onclick="CV.date=new Date(${x.getFullYear()},${x.getMonth()},${x.getDate()});CV.view='day';cvPaint()">${x.getDate() === 1 ? x.getDate() + ' ' + CV_MONTHS[x.getMonth()] : x.getDate()}</button>
      ${L.slice(0, max).map(e => e.allDay ? cvChip(e) : `<div class="cv-ml${CV.sel === e.id ? ' sel' : ''}" data-id="${e.id}" style="--c:${AC_CALS[e.cal].c}"><i></i><span>${esc(e.title)}</span><small>${cvTime(e.start)}</small></div>`).join('')}
      ${L.length > max ? `<button class="cv-more" onclick="CV.date=new Date(${x.getFullYear()},${x.getMonth()},${x.getDate()});CV.view='day';cvPaint()">+${L.length - max} أخرى</button>` : ''}</div>`;
  }
  return `<div class="cv-month" style="--w:${weeks}"><div class="cv-mh">${CV_DAYS.map((n, i) => `<span class="${i >= 5 ? 'we' : ''}">${n}</span>`).join('')}</div><div class="cv-mg">${cells}</div></div>`;
}
/* ── السنة ── */
function cvYear() {
  const y = CV.date.getFullYear(), V = cvVisible(), now = new Date(), cnt = {};
  V.forEach(e => { const k = cvKey(e.start); cnt[k] = (cnt[k] || 0) + 1; });
  return `<div class="cv-year">${CV_MONTHS.map((m, mi) => { const first = new Date(y, mi, 1), start = cvAdd(first, -first.getDay()); let c = ''; for (let i = 0; i < 42; i++) { const x = cvAdd(start, i), n = cnt[cvKey(x)] || 0; c += x.getMonth() !== mi ? '<span></span>' : `<button class="${cvSame(x, now) ? 'now' : ''}${n ? ' has' : ''}" style="--a:${Math.min(1, n / 4)}" onclick="CV.date=new Date(${y},${mi},${x.getDate()});CV.view='day';cvPaint()">${x.getDate()}</button>`; }
    return `<div class="cv-ym"><button class="cv-ymt${mi === now.getMonth() && y === now.getFullYear() ? ' now' : ''}" onclick="CV.date=new Date(${y},${mi},1);CV.view='month';cvPaint()">${m}</button><div class="cv-ymg">${CV_DAYS.map(n => `<i>${n[0] === 'ا' ? n[2] : n[0]}</i>`).join('')}${c}</div></div>`; }).join('')}</div>`;
}
/* ── القائمة (أجندة — مناسبة للجوال) ── */
function cvList() {
  const from = cvD(CV.date), V = cvVisible().filter(e => e.end >= from).sort((a, b) => a.start - b.start).slice(0, 120), by = {};
  V.forEach(e => { const k = cvKey(e.start < from ? from : e.start); (by[k] = by[k] || []).push(e); });
  return `<div class="cv-list">${Object.entries(by).map(([k, L]) => { const d = new Date(k + 'T00:00'); return `<div class="cv-lday"><h3 class="${cvSame(d, new Date()) ? 'now' : ''}">${CV_DAYS[d.getDay()]}، ${d.getDate()} ${CV_MONTHS[d.getMonth()]}</h3>${L.map(e => `<div class="cv-li" data-id="${e.id}" style="--c:${AC_CALS[e.cal].c}"><i></i><span class="cv-lt">${e.allDay ? 'طوال اليوم' : cvTime(e.start)}</span><b>${esc(e.title)}</b><small>${AC_CALS[e.cal].t}${e.location ? ' · ' + esc(e.location) : ''}</small></div>`).join('')}</div>`; }).join('') || rEmpty('calendar', 'لا أحداث قادمة.')}</div>`;
}

/* ═════════ لوحة التفاصيل (عرض اليوم) والنافذة المنبثقة ═════════ */
function cvInspector() {
  const e = CV.events.find(x => x.id === CV.sel);
  return `${cvMini(CV.date)}${e ? cvDetail(e) : `<p class="cv-hint">اختر حدثاً لعرض تفاصيله، أو اسحب على الساعات لإنشاء حدث.</p>`}`;
}
function cvDetail(e) {
  const c = AC_CALS[e.cal], R = { none: '', daily: 'يتكرر يومياً', weekly: 'يتكرر أسبوعياً', monthly: 'يتكرر شهرياً', yearly: 'يتكرر سنوياً' };
  const when = e.allDay ? (cvSame(e.start, new Date(e.end.getTime() - 1)) ? fmtD(e.start) : fmtD(e.start) + ' — ' + fmtD(e.end)) + ' · طوال اليوم' : `${CV_DAYS[e.start.getDay()]}، ${fmtD(e.start)}<br>${cvTime(e.start)} – ${cvTime(e.end)}`;
  const open = { task: `taskModal('${e.ref.id}')`, meeting: `go('governance')`, leave: `go('hr')`, deadline: `go('${e.id.startsWith('g:') ? 'grants' : 'governance'}')` }[e.src];
  return `<div class="cv-det" style="--c:${c.c}"><div class="cv-det-t"><i></i><h3>${esc(e.title)}</h3></div>
    <div class="cv-det-r">${when}</div>${e.ref && R[e.ref.repeat] ? `<div class="cv-det-r"><i data-lucide="repeat"></i> ${R[e.ref.repeat]}</div>` : ''}
    ${e.location ? `<div class="cv-det-r"><i data-lucide="map-pin"></i> ${esc(e.location)}</div>` : ''}
    <div class="cv-det-r"><span class="cv-box" style="--c:${c.c}"></span> ${c.t}</div>
    ${e.notes ? `<div class="cv-det-n">${esc(e.notes).replace(/\n/g, '<br>')}</div>` : ''}${e.url ? `<div class="cv-det-r">${linkChip({ url: e.url, title: 'الرابط' })}</div>` : ''}
    <div class="cv-det-a">${e.edit && (e.src === 'personal' || e.src === 'org') ? `<button class="tr-sbtn" onclick="cvEdit('${e.id}')">تعديل</button><button class="tr-sbtn" style="color:var(--bad)" onclick="cvDelete('${e.id}')">حذف</button>` : ''}${open ? `<button class="tr-sbtn" onclick="cvPopClose();${open}">فتح المصدر</button>` : ''}</div></div>`;
}
function cvPop(e, anchor) {
  cvPopClose(); const r = anchor.getBoundingClientRect(), p = document.createElement('div'); p.className = 'cv-pop'; p.id = 'cvPop'; p.innerHTML = cvDetail(e); document.body.appendChild(p);
  const w = p.offsetWidth, left = r.left - w - 10 > 8 ? r.left - w - 10 : Math.min(r.right + 10, innerWidth - w - 8);
  p.style.left = left + 'px'; p.style.top = Math.max(8, Math.min(r.top, innerHeight - p.offsetHeight - 8)) + 'px'; refreshIcons();
  setTimeout(() => document.addEventListener('pointerdown', cvPopOutside), 0);
}
function cvPopOutside(ev) { const p = document.getElementById('cvPop'); if (p && !p.contains(ev.target) && !ev.target.closest('.cv-ev,.cv-chip,.cv-ml,.cv-li')) cvPopClose(); }
function cvPopClose() { const p = document.getElementById('cvPop'); if (p) p.remove(); document.removeEventListener('pointerdown', cvPopOutside); }
function cvSelect(id, el) {
  CV.sel = id; document.querySelectorAll('.cv-ev.sel,.cv-chip.sel,.cv-ml.sel').forEach(x => x.classList.remove('sel')); document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach(x => x.classList.add('sel'));
  const e = CV.events.find(x => x.id === id); if (!e) return;
  if (CV.view === 'day') { document.getElementById('cvInsp').innerHTML = cvInspector(); refreshIcons(); } else cvPop(e, el);
}

/* ═════════ السحب: إنشاء/نقل/تغيير المدة ═════════ */
function cvAfter() {
  const sc = document.getElementById('cvScroll'); if (sc) sc.scrollTop = (CV.scrollH != null ? CV.scrollH : 7.5) * CV.hour;
  if (sc) sc.addEventListener('scroll', () => { CV.scrollH = sc.scrollTop / CV.hour; }, { passive: true });
  const body = document.getElementById('cvBody'); if (!body) return;
  body.addEventListener('pointerdown', cvDown);
  body.addEventListener('click', ev => { const el = ev.target.closest('.cv-ev,.cv-chip,.cv-ml,.cv-li'); if (el && !CV.moved) cvSelect(el.dataset.id, el); });
  body.addEventListener('dblclick', ev => { const el = ev.target.closest('.cv-ev,.cv-chip,.cv-ml,.cv-li'); if (el) { const e = CV.events.find(x => x.id === el.dataset.id); if (e && e.edit && (e.src === 'personal' || e.src === 'org')) cvEdit(e.id); else if (e && e.src === 'task') taskModal(e.ref.id); } });
  clearInterval(CV.tick); CV.tick = setInterval(() => { const n = document.querySelector('.cv-now'); if (n) { const t = new Date(); n.style.top = (t.getHours() + t.getMinutes() / 60) * CV.hour + 'px'; } }, 60000);
}
const cvSnap = h => Math.round(h * 4) / 4;   // ربع ساعة
function cvHourAt(col, y) { const r = col.getBoundingClientRect(); return Math.max(0, Math.min(24, (y - r.top) / CV.hour)); }
function cvDown(ev) {
  if (ev.button !== 0) return; CV.moved = false;
  const evEl = ev.target.closest('.cv-ev'), col = ev.target.closest('.cv-col'), cell = ev.target.closest('.cv-mc,.cv-adc');
  if (evEl) { const e = CV.events.find(x => x.id === evEl.dataset.id); if (!e || !e.edit || e.src === 'task' && false) return; CV.drag = { k: ev.target.classList.contains('cv-rs') ? 'resize' : 'move', e, el: evEl, y0: ev.clientY, x0: ev.clientX, col, h0: cvHourAt(col, ev.clientY) }; }
  else if (col) { const h = cvSnap(cvHourAt(col, ev.clientY)); CV.drag = { k: 'new', col, h0: h, h1: h + .5, y0: ev.clientY }; }
  else if (cell && ev.target.closest('.cv-chip,.cv-ml')) { const id = ev.target.closest('.cv-chip,.cv-ml').dataset.id, e = CV.events.find(x => x.id === id); if (e && e.edit) CV.drag = { k: 'day', e, el: ev.target.closest('.cv-chip,.cv-ml'), y0: ev.clientY, x0: ev.clientX }; }
  if (!CV.drag) return;
  document.addEventListener('pointermove', cvDragMove); document.addEventListener('pointerup', cvDragUp, { once: true });
}
function cvDragMove(ev) {
  const D = CV.drag; if (!D) return; if (Math.hypot(ev.clientX - D.x0 || 0, ev.clientY - D.y0) > 4) CV.moved = true; if (!CV.moved) return; ev.preventDefault();
  if (D.k === 'new') {
    const col = document.elementsFromPoint(ev.clientX, ev.clientY).map(x => x.closest && x.closest('.cv-col')).find(Boolean) || D.col, h = cvSnap(cvHourAt(D.col, ev.clientY));
    D.h1 = Math.max(D.h0 + .25, h); let g = D.col.querySelector('.cv-ghost'); if (!g) { g = document.createElement('div'); g.className = 'cv-ev cv-ghost'; g.style.setProperty('--c', AC_CALS.personal.c); D.col.appendChild(g); }
    g.style.top = D.h0 * CV.hour + 'px'; g.style.height = (D.h1 - D.h0) * CV.hour + 'px'; g.innerHTML = `<b>حدث جديد</b><small>${cvFmtH(D.h0)} – ${cvFmtH(D.h1)}</small>`;
  } else if (D.k === 'move' || D.k === 'resize') {
    const dh = cvSnap((ev.clientY - D.y0) / CV.hour);
    if (D.k === 'resize') { D.el.style.height = Math.max(18, ((D.e.end - D.e.start) / 36e5 + dh) * CV.hour - 2) + 'px'; D.dh = dh; }
    else { const col = document.elementsFromPoint(ev.clientX, ev.clientY).map(x => x.closest && x.closest('.cv-col')).find(Boolean); if (col && col !== D.el.parentElement) col.appendChild(D.el); D.el.style.transform = `translateY(${dh * CV.hour}px)`; D.el.classList.add('dragging'); D.dh = dh; D.day = (col || D.col).dataset.day; }
  } else if (D.k === 'day') {
    const cell = document.elementsFromPoint(ev.clientX, ev.clientY).map(x => x.closest && x.closest('.cv-mc,.cv-adc')).find(Boolean); document.querySelectorAll('.cv-drop').forEach(x => x.classList.remove('cv-drop')); if (cell) { cell.classList.add('cv-drop'); D.day = cell.dataset.day; }
  }
}
const cvFmtH = h => { const d = new Date(); d.setHours(Math.floor(h), Math.round((h % 1) * 60), 0); return cvTime(d); };
async function cvDragUp() {
  document.removeEventListener('pointermove', cvDragMove); const D = CV.drag; CV.drag = null; if (!D) return;
  document.querySelectorAll('.cv-drop').forEach(x => x.classList.remove('cv-drop'));
  if (!CV.moved) { if (D.k === 'new') return; return; }
  setTimeout(() => CV.moved = false, 30);
  if (D.k === 'new') { const day = D.col.dataset.day, s = new Date(day + 'T00:00'); s.setMinutes(D.h0 * 60); const e = new Date(day + 'T00:00'); e.setMinutes(D.h1 * 60); cvNew(day, { start: s, end: e }); return; }
  const e = D.e; let s = new Date(e.start), en = new Date(e.end);
  if (D.k === 'resize') en = new Date(en.getTime() + (D.dh || 0) * 36e5);
  else if (D.k === 'move') { const shift = (D.dh || 0) * 36e5, dd = D.day ? (new Date(D.day + 'T00:00') - cvD(e.start)) : 0; s = new Date(s.getTime() + shift + dd); en = new Date(en.getTime() + shift + dd); }
  else if (D.k === 'day' && D.day) { const dd = new Date(D.day + 'T00:00') - cvD(e.start); s = new Date(s.getTime() + dd); en = new Date(en.getTime() + dd); }
  if (en <= s) en = new Date(s.getTime() + 15 * 6e4);
  await cvSaveTimes(e, s, en); await cvLoad(); cvPaint();
}
async function cvSaveTimes(e, s, en) {
  try {
    if (e.src === 'personal') { const a = (S.appointments || []).find(x => x.id === e.ref.id); a.datetime = cvLocalISO(s); a.duration = Math.round((en - s) / 6e4); save(); }
    else if (e.src === 'org') { const o = e.ref, sh = s - e.start; await RDB.update('org_events', o.id, { start: new Date(new Date(o.start).getTime() + sh).toISOString(), end: new Date(new Date(o.end || o.start).getTime() + sh + ((en - s) - (e.end - e.start))).toISOString() }); }
    else if (e.src === 'task') await RDB.update('org_tasks', e.ref.id, { due_date: cvKey(s), updated_at: new Date().toISOString() });
    rToast('تم تحديث الموعد');
  } catch (er) { rToast('تعذّر التحديث: ' + er.message, 1); }
}

/* ═════════ إنشاء/تعديل حدث (على نمط نافذة أبل) ═════════ */
function cvNew(day, range, allDay) {
  const base = day ? new Date(day + 'T00:00') : cvD(CV.date), s = range ? range.start : new Date(base.getTime() + 9 * 36e5), en = range ? range.end : new Date(s.getTime() + 36e5);
  cvForm({ title: '', cal: 'personal', start: s, end: en, allDay: !!allDay, location: '', notes: '', url: '', repeat: 'none' });
}
function cvEdit(id) { cvPopClose(); const e = CV.events.find(x => x.id === id); if (!e) return; const o = e.src === 'org' ? e.ref : null; cvForm({ id, src: e.src, title: e.title, cal: e.cal, start: o ? new Date(o.start) : e.start, end: o ? new Date(o.end || o.start) : e.end, allDay: e.allDay, location: e.location || '', notes: e.notes || '', url: e.url || '', repeat: o ? o.repeat || 'none' : 'none', until: o ? o.repeat_until || '' : '' }); }
function cvForm(v) {
  const cals = Object.entries(AC_CALS).filter(([k]) => k === 'personal' || (['org', 'programs', 'meetings'].includes(k) && (isManager() || can('site') || can('governance'))));
  openModal(v.id ? 'تعديل الحدث' : 'حدث جديد', `<div class="cv-form">
    <input id="cvT" class="cv-ft" placeholder="عنوان الحدث" value="${esc(v.title)}">
    <div class="cv-frow"><label class="r-check"><input type="checkbox" id="cvAll" ${v.allDay ? 'checked' : ''} onchange="document.querySelectorAll('.cv-tm').forEach(x=>x.style.display=this.checked?'none':'')"> طوال اليوم</label></div>
    <div class="row2"><div class="field"><label>يبدأ</label><div class="cv-dt"><input type="date" id="cvSD" value="${cvKey(v.start)}"><input type="time" class="cv-tm" id="cvST" value="${cvLocalISO(v.start).slice(11)}"${v.allDay ? ' style="display:none"' : ''}></div></div>
      <div class="field"><label>ينتهي</label><div class="cv-dt"><input type="date" id="cvED" value="${cvKey(v.end)}"><input type="time" class="cv-tm" id="cvET" value="${cvLocalISO(v.end).slice(11)}"${v.allDay ? ' style="display:none"' : ''}></div></div></div>
    <div class="row2"><div class="field"><label>التقويم</label><select id="cvC"${v.id ? ' disabled' : ''}>${cals.map(([k, c]) => `<option value="${k}"${k === v.cal ? ' selected' : ''}>${c.t}${k === 'personal' ? ' (خاص بي)' : ' (يراه الفريق)'}</option>`).join('')}</select></div>
      <div class="field"><label>التكرار</label><select id="cvR"${v.src === 'personal' ? ' disabled' : ''}>${[['none', 'بلا تكرار'], ['daily', 'يومياً'], ['weekly', 'أسبوعياً'], ['monthly', 'شهرياً'], ['yearly', 'سنوياً']].map(([k, t]) => `<option value="${k}"${k === v.repeat ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="field"><label>الموقع أو رابط الاجتماع</label><input id="cvL" value="${esc(v.location)}" placeholder="مقر الجمعية / رابط Zoom أو Meet"></div>
    <div class="field"><label>ملاحظات</label><textarea id="cvN" rows="3">${esc(v.notes)}</textarea></div>
    <div class="field"><label>رابط (اختياري)</label><input id="cvU" dir="ltr" value="${esc(v.url)}" placeholder="https://"></div></div>`,
    async () => {
      const title = fval('cvT'), all = fval('cvAll'), cal = v.id ? v.cal : fval('cvC');
      const s = new Date(fval('cvSD') + 'T' + (all ? '00:00' : fval('cvST') || '09:00')), en = new Date(fval('cvED') + 'T' + (all ? '23:59' : fval('cvET') || '10:00'));
      if (!title) { rToast('اكتب عنوان الحدث', 1); return; } if (en < s) { rToast('النهاية قبل البداية', 1); return; } if (!validUrl(fval('cvU'))) { rToast('الرابط يجب أن يبدأ بـ https://', 1); return; }
      try {
        if (cal === 'personal') {
          S.appointments = S.appointments || [];
          const row = { title, datetime: cvLocalISO(s), duration: Math.max(15, Math.round((en - s) / 6e4)), contact: fval('cvL'), notes: fval('cvN'), status: 'scheduled' };
          if (v.id) Object.assign(S.appointments.find(x => 'p:' + x.id === v.id), row); else S.appointments.push(Object.assign({ id: rid() }, row));
          save();
        } else {
          const row = { title, start: s.toISOString(), end: en.toISOString(), all_day: all, calendar: cal, location: fval('cvL'), notes: fval('cvN'), url: fval('cvU'), repeat: fval('cvR') || 'none', dept: ME.dept };
          const oid = v.id && v.id.split(':')[1];
          if (oid) await RDB.update('org_events', oid, row); else await RDB.insert('org_events', Object.assign(row, { created_by: ME.id }));
        }
        closeModal(); await cvLoad(); cvPaint(); rToast('تم حفظ الحدث');
      } catch (er) { rToast(er.message, 1); }
    }, v.id ? () => cvDelete(v.id) : null);
  setTimeout(() => { const t = document.getElementById('cvT'); if (t) t.focus(); }, 30);
}
async function cvDelete(id) {
  const e = CV.events.find(x => x.id === id); if (!e || !e.edit || !['personal', 'org'].includes(e.src)) return;
  if (!confirm(e.ref && e.ref.repeat && e.ref.repeat !== 'none' ? 'حذف الحدث وكل تكراراته؟' : 'حذف الحدث؟')) return;
  try { if (e.src === 'personal') { S.appointments = S.appointments.filter(x => x.id !== e.ref.id); save(); } else await RDB.remove('org_events', e.ref.id); closeModal(); cvPopClose(); CV.sel = null; await cvLoad(); cvPaint(); } catch (er) { rToast(er.message, 1); }
}
/* تصدير ‎.ics‎ لاستيراده في تقويم الجوال (أبل/جوجل) */
function cvICS() {
  const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), V = cvVisible().filter(e => e.end >= cvAdd(new Date(), -30));
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + (CONFIG.companyName || 'Org') + '//AR', 'CALSCALE:GREGORIAN'].concat(V.flatMap(e => ['BEGIN:VEVENT', 'UID:' + e.id + '@' + (location.hostname || 'org'), 'DTSTAMP:' + f(new Date()), e.allDay ? 'DTSTART;VALUE=DATE:' + cvKey(e.start).replace(/-/g, '') : 'DTSTART:' + f(e.start), e.allDay ? 'DTEND;VALUE=DATE:' + cvKey(cvAdd(e.end, 1)).replace(/-/g, '') : 'DTEND:' + f(e.end), 'SUMMARY:' + String(e.title).replace(/[,;]/g, ' '), e.location ? 'LOCATION:' + String(e.location).replace(/[,;]/g, ' ') : '', 'END:VEVENT'].filter(Boolean)), ['END:VCALENDAR']).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'تقويم-' + today() + '.ics'; a.click();
}
