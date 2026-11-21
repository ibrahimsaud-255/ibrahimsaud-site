/*
 * 36-season.js — «الموسم»: حقيبة البرامج الشبابيّة — البادئة sn
 * ─────────────────────────────────────────────────────────────────────────
 * مبنيّة على نمط برامج مثل «مدينة القيم»: موسم بمراحل، مشاركون بمراحل دراسيّة، فرق ملوّنة،
 * و«بنك نقاط» يمنح منه المشرف من جواله — والطالب لا يحتاج جوالاً — مع شاشة ترتيب للبروجكتر.
 * الجداول: seasons · season_members · season_points (services/charity/db/season.sql).
 * الصلاحيّة: تطبيق «البرامج». ⚠️ تعريفات فقط — التسجيل في 99-boot.js.
 */
const SN_PALETTE = [['الأخضر', '#16A34A'], ['الأحمر', '#DC2626'], ['الأزرق', '#2563EB'], ['البرتقاليّ', '#EA580C'], ['البنفسجيّ', '#7C3AED'], ['السماويّ', '#0891B2'], ['الذهبيّ', '#CA8A04'], ['العنّابيّ', '#9F1239']];
const SN_STAGES = ['ابتدائي', 'متوسط', 'ثانوي', 'جامعي', 'أخرى'];
const SN_PHASES = { plan: 'التخطيط', prep: 'الإعداد', run: 'التنفيذ', close: 'الإغلاق', done: 'منتهٍ' };
const SN_REASONS = ['حضور', 'مشاركة', 'فوز في مسابقة', 'انضباط', 'تعاون', 'إبداع', 'مخالفة'];
const SN = { att: [], attDay: '', surveys: [], svAns: {}, svOpen: null, seasons: [], cur: null, members: [], points: [], coins: [], items: [], sched: [], staff: [], posts: [], reacts: [], tab: 'teams', bank: { no: '', amt: 10, reason: 'مشاركة' }, award: { team: '', member: '', pts: 10, reason: 'مشاركة' }, boardTimer: null };

/* سؤال آبل بعنوان وشرح واسم للإجراء (apDialog في 34-apple) */
const snAsk = (title, msg, ok, danger) => apDialog({ title, msg, ok, danger: danger !== false });

async function renderSeason() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  SN.seasons = await RDB.list('seasons', { order: 'created_at' }).catch(() => []);
  if (!SN.cur || !SN.seasons.find(s => s.id === SN.cur)) SN.cur = (SN.seasons[0] || {}).id || null;
  await snLoad(); snPaint();
}
async function snLoad() {
  if (!SN.cur) { SN.members = []; SN.points = []; return; }
  const L = (t, o) => RDB.list(t, Object.assign({ eq: { season_id: SN.cur } }, o)).catch(() => []);
  const [m, p, c, it, sc, st, po, rx, at] = await Promise.all([L('season_members', { order: 'no', asc: true }), L('season_points', { order: 'created_at' }), L('season_coins', { order: 'created_at' }),
    L('season_items', { order: 'sort', asc: true }), L('season_schedule', { order: 'day', asc: true }), L('season_staff', { order: 'created_at', asc: true }), L('season_posts', { order: 'publish_at' }), L('season_reactions', {}), L('season_attendance', { order: 'day' })]);
  SN.members = m; SN.points = p; SN.coins = c; SN.items = it; SN.sched = sc; SN.staff = st; SN.posts = po.sort((x, y) => String(y.publish_at).localeCompare(String(x.publish_at))); SN.reacts = rx; SN.att = at;
}
const snSeason = () => SN.seasons.find(s => s.id === SN.cur) || null;
const snTeams = () => (snSeason() || {}).teams || [];
const snTeam = id => snTeams().find(t => t.id === id);
function snTotals() {
  const t = {}, m = {};
  SN.points.forEach(p => { if (p.team_id) t[p.team_id] = (t[p.team_id] || 0) + p.points; if (p.member_id) m[p.member_id] = (m[p.member_id] || 0) + p.points; });
  return { t, m };
}
function snRanked() { const { t } = snTotals(); return snTeams().map(x => Object.assign({}, x, { pts: t[x.id] || 0, n: SN.members.filter(m => m.team_id === x.id).length })).sort((a, b) => b.pts - a.pts); }

function snPaint() {
  const s = snSeason(), main = document.getElementById('main');
  if (!s) {
    main.innerHTML = `<div class="r-page"><div class="page-head"><div><h1>الموسم</h1><p class="r-sub">فرق ملوّنة، بنك نقاط، وشاشة ترتيب — لبرامجكم الصيفيّة والأسبوعيّة.</p></div></div>
      <div class="card sn-start">${rEmpty('trophy', 'ابدأ موسمك الأوّل: اكتب اسمه وتاريخه، ثمّ أضف المشاركين ووزّعهم على الفرق بضغطة.', `<button class="btn btn-gold" onclick="snNewSeason()"><i data-lucide="plus"></i> موسم جديد</button>`)}</div></div>`;
    refreshIcons(); return;
  }
  const tabs = [{ id: 'teams', name: 'الفرق' }, { id: 'members', name: 'المشاركون' }, { id: 'att', name: 'الحضور' }, { id: 'points', name: 'النقاط' }, { id: 'bank', name: 'البنك' }, { id: 'store', name: 'المتجر' }, { id: 'sched', name: 'الجدول' }, { id: 'staff', name: 'الميسّرون' }, { id: 'news', name: 'الأخبار' }, { id: 'surveys', name: 'الاستبيانات' }];
  main.innerHTML = `<div class="r-page sn">
    <div class="page-head"><div><h1>${esc(s.name)}</h1><p class="r-sub">${SN_PHASES[s.phase] || ''}${s.start_date ? ' · ' + fmtD(s.start_date) + (s.end_date ? ' — ' + fmtD(s.end_date) : '') : ''}</p>
      ${s.code ? `<button type="button" class="sn-code" onclick="snShareCode()"><i data-lucide="smartphone"></i> «جوّالي» للمشاركين — رمز الموسم <b dir="ltr">${esc(s.code)}</b></button>` : ''}</div>
      <div class="sn-head-act">${SN.seasons.length > 1 ? `<select class="sn-pick" onchange="snPick(this.value)" aria-label="الموسم">${SN.seasons.map(x => `<option value="${x.id}"${x.id === s.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : ''}
        <button class="btn btn-ghost" onclick="snImpact()"><i data-lucide="file-bar-chart"></i> تقرير الأثر</button><button class="btn btn-ghost" onclick="snEditSeason()"><i data-lucide="settings-2"></i> الموسم</button><button class="btn btn-ghost" onclick="snNewSeason()"><i data-lucide="plus"></i> موسم جديد</button></div></div>
    ${rTabs('sn', tabs, SN.tab, 'snGo')}<div id="snBody">${snBody()}</div></div>`;
  refreshIcons();
}
function snGo(t) { SN.tab = t; snPaint(); }
async function snPick(id) { SN.cur = id; await snLoad(); snPaint(); }
function snBody() { return ({ att: snAttView, surveys: snSvView, news: snNewsView, staff: snStaffView, members: snMembersView, points: snPointsView, bank: snBankView, store: snStoreView, sched: snSchedView }[SN.tab] || snTeamsView)(); }

/* ═════════ الفرق ═════════ */
function snTeamsView() {
  const teams = snRanked(), unassigned = SN.members.filter(m => !m.team_id || !snTeam(m.team_id)).length, max = Math.max(1, ...teams.map(t => t.pts));
  if (!teams.length) return `<div class="card">${rEmpty('palette', 'لا فرق بعد. اختر عدد الفرق وألوانها.', `<button class="btn btn-gold" onclick="snTeamsSheet()"><i data-lucide="palette"></i> تجهيز الفرق</button>`)}</div>`;
  return `<div class="sn-acts">
      <button class="btn btn-gold" onclick="snBoard()"><i data-lucide="presentation"></i> شاشة الترتيب</button>
      <a class="btn btn-ghost" href="./games/" target="_blank" rel="noopener"><i data-lucide="gamepad-2"></i> ألعاب القاعة</a>
      <button class="btn btn-ghost" onclick="snDistribute()"><i data-lucide="shuffle"></i> توزيع تلقائيّ${unassigned ? ` (${unassigned})` : ''}</button>
      <button class="btn btn-ghost" onclick="snTeamsSheet()"><i data-lucide="palette"></i> الفرق</button>
      <button class="btn btn-ghost" onclick="snPrint()"><i data-lucide="printer"></i> طباعة القوائم</button></div>
    ${unassigned && SN.members.length ? `<p class="ws-note"><i data-lucide="info"></i> ${unassigned} مشاركاً بلا فريق — اضغط «توزيع تلقائيّ» ليُوزَّعوا بالتساوي حسب المرحلة.</p>` : ''}
    <div class="sn-teams">${teams.map((t, i) => `<button type="button" class="sn-team" style="--tc:${esc(t.color)}" onclick="snTeamOpen('${t.id}')">
      <span class="sn-rank">${i + 1}</span><span class="sn-team-t"><b>${esc(t.name)}</b><small>${t.n} مشاركاً</small></span>
      <span class="sn-pts">${t.pts}<small>نقطة</small></span><span class="sn-bar"><i style="width:${Math.max(4, Math.round(t.pts / max * 100))}%"></i></span></button>`).join('')}</div>`;
}
function snTeamOpen(id) {
  const t = snTeam(id); if (!t) return; const { m } = snTotals();
  const ms = SN.members.filter(x => x.team_id === id).sort((a, b) => (m[b.id] || 0) - (m[a.id] || 0));
  openModal(`<span class="sn-dot" style="--tc:${esc(t.color)}"></span> ${esc(t.name)}`, `<div class="sn-quick">${[5, 10, 20].map(p => `<button class="btn btn-ghost" onclick="snGive({team:'${id}',pts:${p},reason:'مشاركة'})">+${p}</button>`).join('')}<button class="btn btn-ghost" onclick="snGive({team:'${id}',pts:-5,reason:'مخالفة'})">−5</button></div>
    <div class="r-list">${ms.map(x => `<div class="r-item"><span class="r-item-t"><b>${esc(x.name)}</b><small>${esc(x.stage || '')}</small></span><span class="sn-mp">${m[x.id] || 0}</span></div>`).join('') || '<p class="r-sub">لا مشاركين في هذا الفريق.</p>'}</div>`);
}
function snTeamsSheet() {
  const cur = snTeams().length ? snTeams() : SN_PALETTE.slice(0, 4).map(([n, c]) => ({ id: '', name: n, color: c }));
  const row = (t, i) => `<div class="sn-trow"><input type="color" value="${esc(t.color)}" aria-label="اللون" data-i="${i}" class="sn-tc"><input value="${esc(t.name)}" placeholder="اسم الفريق" class="sn-tn" data-id="${esc(t.id || '')}"><button type="button" class="x" onclick="this.parentElement.remove()" aria-label="حذف الفريق">×</button></div>`;
  openModal('الفرق', `<p class="r-hint">سمّوها كما تحبّون — أحياء، قبائل، ألوان… واختاروا لون كلّ فريق.</p>
    <div id="snTRows">${cur.map(row).join('')}</div>
    <button type="button" class="link-btn" onclick="snAddTeamRow()">+ فريق</button>`, async () => {
      const rows = [...document.querySelectorAll('#snTRows .sn-trow')].map(r => ({ id: r.querySelector('.sn-tn').dataset.id || rid().slice(0, 8), name: r.querySelector('.sn-tn').value.trim(), color: r.querySelector('.sn-tc').value })).filter(t => t.name);
      if (rows.length < 2) { rToast('فريقان على الأقلّ', 1); return; }
      await snSaveSeason({ teams: rows }); closeModal(); snPaint();
    });
}
function snAddTeamRow() {
  const box = document.getElementById('snTRows'), n = box.children.length, p = SN_PALETTE[n % SN_PALETTE.length];
  box.insertAdjacentHTML('beforeend', `<div class="sn-trow"><input type="color" value="${p[1]}" class="sn-tc" aria-label="اللون"><input value="${p[0]}" class="sn-tn" data-id="" placeholder="اسم الفريق"><button type="button" class="x" onclick="this.parentElement.remove()" aria-label="حذف الفريق">×</button></div>`);
}
/* توزيع متوازن: لكلّ مرحلة على حدة بالدور (الأقلّ عدداً أوّلاً)، والإخوة يتفرّقون ما أمكن */
async function snDistribute() {
  const teams = snTeams(); if (teams.length < 2) { snTeamsSheet(); return; }
  const all = SN.members.slice(); if (!all.length) { rToast('أضف المشاركين أوّلاً', 1); SN.tab = 'members'; snPaint(); return; }
  const left = all.filter(m => !m.team_id || !snTeam(m.team_id)).length;
  const redo = !left; if (redo && !await snAsk('إعادة توزيع الجميع؟', 'كلّ المشاركين موزَّعون. سيُعاد توزيعهم بالتساوي من جديد (النقاط تبقى لفرقها).', 'إعادة التوزيع', false)) return;
  const pool = all.filter(m => redo || !m.team_id || !snTeam(m.team_id));
  const count = {}; teams.forEach(t => count[t.id] = 0);
  all.filter(m => !pool.includes(m)).forEach(m => count[m.team_id]++);
  const byStage = {}; pool.forEach(m => (byStage[m.stage || 'أخرى'] = byStage[m.stage || 'أخرى'] || []).push(m));
  const changes = [];
  Object.values(byStage).forEach(list => {
    list.sort(() => Math.random() - .5);
    list.forEach(m => {
      const sibs = m.sibling ? new Set(changes.filter(c => c.m.sibling === m.sibling).map(c => c.t)) : new Set();
      const cand = teams.slice().sort((a, b) => (sibs.has(a.id) - sibs.has(b.id)) || (count[a.id] - count[b.id]));
      const t = cand[0].id; count[t]++; changes.push({ m, t });
    });
  });
  rToast('جارٍ التوزيع…');
  try { for (const c of changes) if (c.m.team_id !== c.t) { await RDB.update('season_members', c.m.id, { team_id: c.t }); c.m.team_id = c.t; } rToast('وُزِّع ' + changes.length + ' مشاركاً بالتساوي'); }
  catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
  snPaint();
}
function snPrint() {
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  const s = snSeason();
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${esc(s.name)} — الفرق</title><style>body{font-family:system-ui,Tahoma;margin:24px}h1{font-size:22px}section{break-inside:avoid;margin:0 0 22px;border:2px solid var(--c);border-radius:14px;padding:12px 16px}h2{margin:0 0 8px;color:var(--c)}ol{columns:2;margin:0;padding-inline-start:22px}li{padding:3px 0}small{color:#666}@media print{section{page-break-inside:avoid}}</style></head><body>
    <h1>${esc(s.name)} — قوائم الفرق</h1>${snTeams().map(t => `<section style="--c:${esc(t.color)}"><h2>${esc(t.name)}</h2><ol>${SN.members.filter(m => m.team_id === t.id).map(m => `<li>${esc(m.name)} <small>${esc(m.stage || '')}</small></li>`).join('')}</ol></section>`).join('')}
    <script>onload=()=>print()<\/script></body></html>`);
  w.document.close();
}

/* ═════════ المشاركون ═════════ */
function snMembersView() {
  const q = (SN.q || '').trim();
  const list = SN.members.filter(m => !q || m.name.includes(q));
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snMemberSheet()"><i data-lucide="user-plus"></i> مشارك</button>
      <button class="btn btn-ghost" onclick="snImportSheet()"><i data-lucide="clipboard-paste"></i> لصق قائمة</button>
      ${SN.members.length ? `<button class="btn btn-ghost" onclick="snCards()"><i data-lucide="id-card"></i> بطاقات المشاركين</button>` : ''}</div>
    ${SN.members.length > 8 ? `<div class="field sn-search"><input type="search" placeholder="ابحث بالاسم" value="${esc(q)}" oninput="SN.q=this.value;document.getElementById('snML').innerHTML=snMemberRows()"></div>` : ''}
    <div class="r-list" id="snML">${list.length ? snMemberRows() : `<div class="r-empty"><p>لا مشاركين بعد. أضفهم واحداً واحداً أو الصق قائمتكم من الإكسل أو واتساب.</p></div>`}</div>`;
}
function snMemberRows() {
  const q = (SN.q || '').trim(), { m } = snTotals();
  return SN.members.filter(x => !q || x.name.includes(q)).map(x => { const t = snTeam(x.team_id);
    return `<button type="button" class="r-item" onclick="snMemberSheet('${x.id}')"><span class="sn-av sm">${snAv(x)}</span><span class="sn-no">${x.no || ''}</span><span class="r-item-t"><b>${esc(x.name)}</b><small>${esc([x.stage, x.grade, x.school].filter(Boolean).join(' · '))}</small></span>
      ${t ? `<span class="sn-chip" style="--tc:${esc(t.color)}">${esc(t.name)}</span>` : '<span class="r-sub">بلا فريق</span>'}<span class="sn-mp">${m[x.id] || 0}</span></button>`; }).join('');
}
function snMemberSheet(id) {
  const r = SN.members.find(x => x.id === id) || {};
  const opt = (arr, v) => arr.map(a => `<option${a === v ? ' selected' : ''}>${esc(a)}</option>`).join('');
  openModal(id ? 'المشارك' : 'مشارك جديد', `${id ? `<div class="sn-idcard"><span>رقم المشارك <b>${r.no || '—'}</b></span><span>رمز «جوّالي» <b dir="ltr">${esc(r.pin || '—')}</b></span><span>الرصيد <b>${snBal(r.id)}</b></span></div>` : ''}<div class="field"><label>الاسم</label><input id="snm_name" value="${esc(r.name || '')}" autocomplete="off"></div>
    ${id ? `<div class="field"><label>شخصيّته</label><div class="sn-avrow"><span class="sn-av">${snAv(r)}</span><span class="r-hint">يصمّمها المشارك بنفسه من «بطاقتي» في جوّالي — بدل الصورة، فلا نجمع صور القاصرين.</span></div></div>` : ''}
    <div class="field"><label>المرحلة</label><select id="snm_stage"><option value="">—</option>${opt(SN_STAGES, r.stage)}</select></div>
    <div class="field"><label>الصفّ / السنة (اختياريّ)</label><input id="snm_grade" value="${esc(r.grade || '')}"></div>
    <div class="field"><label>الفريق</label><select id="snm_team"><option value="">بلا فريق</option>${snTeams().map(t => `<option value="${t.id}"${t.id === r.team_id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
    <div class="field"><label>جوال وليّ الأمر (اختياريّ)</label><input id="snm_gp" dir="ltr" inputmode="tel" value="${esc(r.guardian_phone || '')}"></div>
    <div class="field"><label>رمز الإخوة (اختياريّ)</label><input id="snm_sib" value="${esc(r.sibling || '')}" placeholder="مثلاً: عائلة الأحمد"><div class="r-hint">الإخوة بنفس الرمز يُوزَّعون على فرق مختلفة.</div></div>`, async () => {
      const row = { name: fval('snm_name'), stage: fval('snm_stage'), grade: fval('snm_grade'), team_id: fval('snm_team'), guardian_phone: fval('snm_gp'), sibling: fval('snm_sib') };
      if (row.name.length < 2) { rToast('اكتب الاسم', 1); return; }
      try { if (id) Object.assign(r, await RDB.update('season_members', id, row)); else SN.members.push(await RDB.insert('season_members', snNew(row))); closeModal(); snPaint(); }
      catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف المشارك؟', 'تُحذف نقاطه الفرديّة معه.', 'حذف')) return; await RDB.remove('season_members', id); SN.members = SN.members.filter(x => x.id !== id); closeModal(); snPaint(); } : null);
}
const snAv = m => typeof AV === 'undefined' ? '' : AV.of(m.avatar, m.name);
/* رابط الدخول المباشر (يُطبع رمز QR على البطاقة): يفتح «جوّالي» ويدخل بلا كتابة */
function snLoginUrl(code, pin, staff) { const u = new URL(snPortalUrl(), location.href); u.searchParams.set('c', code || ''); u.searchParams.set('p', pin || ''); if (staff) u.searchParams.set('as', 'staff'); return u.href; }
function snQR(text) { try { const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`; return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`; } catch (e) { return ''; } }
async function snPhoto(inp) {
  const f = inp.files[0]; if (!f) return;
  try { const b = await rCompressImage(f, 360, .78); const u = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
    if (u.length > 150000) { rToast('الصورة كبيرة — جرّب صورة أصغر', 1); return; }
    document.getElementById('snm_photo').value = u; document.getElementById('snm_ph_pv').innerHTML = `<img src="${u}" alt="">`; }
  catch (e) { rToast('تعذّرت قراءة الصورة', 1); }
}
/* لصق قائمة: سطر لكلّ مشارك — «الاسم، المرحلة» أو الاسم وحده (من إكسل أو واتساب) */
function snImportSheet() {
  openModal('لصق قائمة المشاركين', `<p class="r-hint">سطر لكلّ مشارك. يمكن كتابة المرحلة بعد فاصلة أو علامة تبويب: <b>محمد أحمد، متوسط</b></p>
    <div class="field"><textarea id="sn_paste" rows="10" placeholder="محمد أحمد، متوسط&#10;عبدالله سعد، ثانوي"></textarea></div>
    <div class="field"><label>المرحلة لمن لم تُكتب مرحلته</label><select id="sn_defstage"><option value="">—</option>${SN_STAGES.map(s => `<option>${s}</option>`).join('')}</select></div>`, async () => {
      const def = fval('sn_defstage'), have = new Set(SN.members.map(m => m.name.replace(/\s+/g, ' ')));
      const rows = fval('sn_paste').split('\n').map(l => l.split(/[,،\t]/).map(x => x.trim())).filter(p => p[0] && p[0].length >= 2)
        .map(([name, st]) => ({ name: name.replace(/\s+/g, ' '), stage: SN_STAGES.find(s => st && st.includes(s.slice(0, 3))) || def }));
      const fresh = rows.filter(r => !have.has(r.name) && (have.add(r.name), true));
      if (!fresh.length) { rToast(rows.length ? 'كلّهم مضافون من قبل' : 'الصق القائمة أوّلاً', 1); return; }
      const b = document.getElementById('mSave'); if (b) { b.disabled = true; b.textContent = 'جارٍ الإضافة…'; }
      try { for (const r of fresh) SN.members.push(await RDB.insert('season_members', snNew(r))); closeModal(); rToast('أُضيف ' + fresh.length + (rows.length > fresh.length ? ' (وتُجوهل ' + (rows.length - fresh.length) + ' مكرّر)' : '')); snPaint(); }
      catch (e) { rToast('تعذّر: ' + (e.message || e), 1); if (b) { b.disabled = false; b.textContent = 'حفظ'; } }
    });
}

/* ═════════ بنك النقاط ═════════ */
function snPointsView() {
  const A = SN.award, teams = snTeams();
  if (!teams.length) return `<div class="card">${rEmpty('palette', 'جهّز الفرق أوّلاً.', `<button class="btn btn-gold" onclick="snTeamsSheet()">تجهيز الفرق</button>`)}</div>`;
  const recent = SN.points.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 25);
  return `<div class="card sn-award"><h3>امنح نقاطاً</h3>
      <div class="sn-tpick">${teams.map(t => `<button type="button" class="sn-tbtn${A.team === t.id ? ' on' : ''}" style="--tc:${esc(t.color)}" onclick="SN.award.team='${t.id}';SN.award.member='';document.getElementById('snBody').innerHTML=snBody();refreshIcons()" aria-pressed="${A.team === t.id}">${esc(t.name)}</button>`).join('')}</div>
      ${A.team ? `<div class="field"><label>لمشارك بعينه؟ (اختياريّ — وإلا فللفريق كلّه)</label><select onchange="SN.award.member=this.value"><option value="">الفريق كلّه</option>${SN.members.filter(m => m.team_id === A.team).map(m => `<option value="${m.id}"${A.member === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>` : ''}
      <div class="r-seg sn-amt" role="radiogroup">${[5, 10, 20, 50, -5, -10].map(p => `<button type="button" class="${A.pts === p ? 'on' : ''}" onclick="SN.award.pts=${p};this.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">${p > 0 ? '+' + p : '−' + Math.abs(p)}</button>`).join('')}</div>
      <div class="sn-reasons">${SN_REASONS.map(r => `<button type="button" class="sn-rs${A.reason === r ? ' on' : ''}" onclick="SN.award.reason='${r}';this.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">${r}</button>`).join('')}</div>
      <button class="btn btn-gold sn-give" onclick="snGive()"${A.team ? '' : ' disabled'}><i data-lucide="sparkles"></i> امنح</button></div>
    <h3 class="sn-h">آخر الحركات</h3>
    <div class="r-list">${recent.map(p => { const t = snTeam(p.team_id), m = SN.members.find(x => x.id === p.member_id);
      return `<div class="r-item"><span class="sn-dot" style="--tc:${esc(t ? t.color : '#999')}"></span><span class="r-item-t"><b>${p.points > 0 ? '+' : ''}${p.points} · ${esc(m ? m.name : t ? t.name : '—')}</b><small>${esc(p.reason || '')} · ${esc(memberName(p.by_member))}</small></span>
        <button class="btn btn-ghost btn-sm" onclick="snUndo('${p.id}')" aria-label="تراجع"><i data-lucide="undo-2"></i></button></div>`; }).join('') || '<div class="r-empty"><p>لا نقاط بعد.</p></div>'}</div>`;
}
async function snGive(o) {
  const A = Object.assign({}, SN.award, o || {}); if (!A.team) return;
  try {
    const row = await RDB.insert('season_points', { season_id: SN.cur, team_id: A.team, member_id: A.member || null, points: A.pts, reason: A.reason, by_member: ME.id });
    SN.points.push(row); const t = snTeam(A.team);
    rToast(`${A.pts > 0 ? '+' : ''}${A.pts} لـ${t ? t.name : ''}`);
    if (document.querySelector('.modal-bg')) closeModal();
    snPaint();
  } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
async function snUndo(id) {
  if (!await snAsk('التراجع عن هذه النقاط؟', '', 'تراجع')) return;
  try { await RDB.remove('season_points', id); SN.points = SN.points.filter(p => p.id !== id); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}

/* ═════════ شاشة الترتيب (بروجكتر) — تتحدّث كلّ ١٠ ثوانٍ ═════════ */
function snBoard() {
  const root = document.createElement('div'); root.id = 'snBoard'; root.className = 'sn-board'; root.tabIndex = -1;
  root.innerHTML = `<button class="sn-bx" onclick="snBoardClose()" aria-label="إغلاق">×</button><div id="snBoardIn"></div>`;
  document.body.appendChild(root); snBoardPaint(); root.focus();
  root.addEventListener('keydown', e => { if (e.key === 'Escape') snBoardClose(); });
  try { root.requestFullscreen && root.requestFullscreen().catch(() => {}); } catch (e) {}
  SN.boardTimer = setInterval(async () => { SN.points = await RDB.list('season_points', { eq: { season_id: SN.cur }, order: 'created_at' }).catch(() => SN.points); snBoardPaint(); }, 10000);
}
function snBoardPaint() {
  const el = document.getElementById('snBoardIn'); if (!el) return;
  const teams = snRanked(), max = Math.max(1, ...teams.map(t => t.pts)), s = snSeason(), { m } = snTotals();
  const stars = SN.members.filter(x => m[x.id]).sort((a, b) => m[b.id] - m[a.id]).slice(0, 5);
  el.innerHTML = `<header><h1>${esc(s.name)}</h1><p>ترتيب الفرق</p></header>
    <div class="sn-bars">${teams.map((t, i) => `<div class="sn-br" style="--tc:${esc(t.color)};--w:${Math.max(6, Math.round(t.pts / max * 100))}%"><span class="sn-bn">${i + 1}</span><b>${esc(t.name)}</b><span class="sn-bt"><i></i></span><span class="sn-bp">${t.pts}</span></div>`).join('')}</div>
    ${stars.length ? `<footer><span>نجوم الموسم</span>${stars.map(x => { const t = snTeam(x.team_id); return `<em style="--tc:${esc(t ? t.color : '#fff')}">${esc(x.name)} · ${m[x.id]}</em>`; }).join('')}</footer>` : ''}`;
}
function snBoardClose() { clearInterval(SN.boardTimer); const r = document.getElementById('snBoard'); if (r) r.remove(); try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {} }

/* ═════════ الموسم نفسه ═════════ */
function snNewSeason() { snEditSeason(true); }
function snEditSeason(isNew) {
  const s = isNew ? { phase: 'prep' } : snSeason() || {};
  openModal(isNew ? 'موسم جديد' : 'الموسم', `<div class="field"><label>اسم الموسم</label><input id="sns_name" value="${esc(s.name || '')}" placeholder="مثلاً: النادي الصيفيّ ١٤٤٨"></div>
    <div class="field"><label>يبدأ</label><input id="sns_start" type="date" value="${esc(s.start_date || '')}"></div>
    <div class="field"><label>ينتهي</label><input id="sns_end" type="date" value="${esc(s.end_date || '')}"></div>
    <div class="field"><label>المرحلة</label><select id="sns_phase">${Object.entries(SN_PHASES).map(([k, v]) => `<option value="${k}"${k === s.phase ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="field"><label>المدينة (لمواقيت الصلاة في «جوّالي»)</label><select id="sns_city">${Object.keys(SN_CITIES).map(c => `<option${c === ((s.settings || {}).city || 'الرياض') ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label>لون كلّ مرحلة</label><div class="sn-stcol">${SN_STAGES.slice(0, 4).map(g => `<label><input type="color" data-stage="${g}" value="${esc(snStageColor(g, s))}"><span>${g}</span></label>`).join('')}</div><div class="r-hint">يظهر في «جوّالي» وعلى البطاقات — والميسّرون بالأسود.</div></div>
    <div class="field"><label>عملات الحضور (تُمنح تلقائياً عند تسجيل حضور الطالب)</label><input id="sns_attc" type="number" min="0" max="50" inputmode="numeric" value="${esc((s.settings || {}).attend_coins || 0)}"><div class="r-hint">٠ = بلا عملات. الحضور يُسجَّل مرّة في اليوم.</div></div>
    <label class="r-check"><input type="checkbox" id="sns_xfer"${(s.settings || {}).transfers === false ? '' : ' checked'}> السماح بالحوالات بين المشاركين في «البنك» (١–١٠٠ عملة، ٥ في اليوم)</label>
    ${isNew && SN.seasons.length ? `<div class="field"><label>تسليم الموسم — انسخ من «${esc((snSeason() || {}).name || '')}»</label>
      ${[['sns_copy', 'الفرق (الأسماء والألوان)'], ['sns_c_items', 'أصناف المتجر وأسعارها'], ['sns_c_sched', 'الجدول (يُزاح لتاريخ البداية الجديد)'], ['sns_c_surv', 'الاستبيانات (مسوّدات)'], ['sns_c_staff', 'الميسّرون وصلاحيّاتهم (برموز جديدة)']].map(([k, n]) => `<label class="r-check"><input type="checkbox" id="${k}" checked> ${n}</label>`).join('')}
      <div class="r-hint">الدفعة الجديدة تبدأ من حيث انتهت السابقة — لا يضيع شيء مع تغيّر المتطوّعين.</div></div>` : ''}`, async () => {
      const stages = {}; document.querySelectorAll('.sn-stcol input[data-stage]').forEach(i => stages[i.dataset.stage] = i.value);
      const row = { name: fval('sns_name'), start_date: fval('sns_start') || null, end_date: fval('sns_end') || null, phase: fval('sns_phase'), settings: Object.assign({}, s.settings || {}, { city: fval('sns_city'), stages, transfers: !!fval('sns_xfer'), attend_coins: Math.max(0, Math.min(50, parseInt(fval('sns_attc'), 10) || 0)) }) };
      if (row.name.length < 2) { rToast('اكتب اسم الموسم', 1); return; }
      try {
        if (isNew) { const prev = snSeason(), cp = { items: fval('sns_c_items'), sched: fval('sns_c_sched'), surv: fval('sns_c_surv'), staff: fval('sns_c_staff') }, old = { items: SN.items.slice(), sched: SN.sched.slice(), staff: SN.staff.slice() };
          if (fval('sns_copy') && prev) row.teams = snTeams(); if (RUSO_DEMO || !RUSO_LIVE) row.code = snCode(); const n = await RDB.insert('seasons', row); SN.seasons.unshift(n); SN.cur = n.id; SN.tab = 'members';
          if (prev) await snHandover(prev, n, old, cp); await snLoad(); }
        else await snSaveSeason(row);
        closeModal(); snPaint();
      } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, !isNew ? async () => { if (!await snAsk('حذف الموسم كاملاً؟', 'يُحذف مشاركوه ونقاطه ولا يمكن التراجع.', 'حذف')) return; await RDB.remove('seasons', SN.cur); SN.seasons = SN.seasons.filter(x => x.id !== SN.cur); SN.cur = (SN.seasons[0] || {}).id || null; await snLoad(); closeModal(); snPaint(); } : null);
}
async function snSaveSeason(patch) { const s = snSeason(); Object.assign(s, await RDB.update('seasons', s.id, patch)); }

/* ═════════ المرحلة ٢: البنك والمتجر والجدول ═════════ */
/* في الوضع التجريبيّ نقلّد ما تفعله القاعدة (الرقم التسلسليّ، الرمز السرّيّ، رمز الموسم) */
const snLocal = () => RUSO_DEMO || !RUSO_LIVE;
function snCode() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 6; i++) c += a[Math.floor(Math.random() * a.length)]; return c; }
function snNew(row) {
  const r = Object.assign({ season_id: SN.cur }, row);
  if (snLocal()) { r.no = Math.max(0, ...SN.members.map(m => m.no || 0)) + 1; do { r.pin = String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); } while (SN.members.some(m => m.pin === r.pin)); }
  return r;
}
const snBal = id => SN.coins.filter(c => c.member_id === id).reduce((a, c) => a + c.amount, 0);
const snByNo = v => { v = String(v || '').trim(); if (!v) return null; return SN.members.find(m => String(m.no) === v.replace(/^#/, '')) || SN.members.find(m => m.name.includes(v)); };
function snPortalUrl() { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'season/' + (snLocal() ? '?demo=1' : ''); }
async function snShareCode() {
  const s = snSeason(), url = snPortalUrl(), text = `«جوّالي» في ${s.name}\nادخل: ${url}\nرمز الموسم: ${s.code}\nورمزك السرّيّ على بطاقتك.`;
  if (navigator.share) { try { await navigator.share({ title: s.name, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); rToast('نُسخت الرسالة — ألصقها في قروب واتساب المشاركين'); } catch (e) { await apPrompt('انسخ الرسالة:', text); }
}
function snCards() {
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  const s = snSeason(), url = snPortalUrl();
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>بطاقات ${esc(s.name)}</title><style>
    body{font-family:system-ui,Tahoma;margin:12px}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
    .c{border:2px solid var(--c);border-radius:16px;padding:12px 14px;break-inside:avoid;display:grid;grid-template-columns:1fr auto 96px;gap:2px 10px;align-items:center}.q{grid-row:span 3;width:96px}.q svg{width:96px;height:96px;display:block}
    .c b{font-size:18px}.c .n{grid-row:span 2;font-size:34px;font-weight:900;color:var(--c)}.t{font-size:13px;color:var(--c);font-weight:700}
    .f{grid-column:1/-1;border-top:1px dashed #bbb;margin-top:8px;padding-top:6px;font-size:12px;color:#444}.f code{font-size:14px;font-weight:800;color:#000}</style></head><body>
    <div class="g">${SN.members.map(m => { const t = snTeam(m.team_id) || { name: '', color: '#888' }; return `<div class="c" style="--c:${esc(t.color)}"><b>${esc(m.name)}</b><span class="n">${m.no || ''}</span><span class="q">${snQR(snLoginUrl(s.code, m.pin))}</span><span class="t">${esc(t.name)}</span>
      <div class="f">امسح الرمز بكاميرا الجوال لتدخل «جوّالي» مباشرة — أو: رمز الموسم <code dir="ltr">${esc(s.code || '')}</code> · رمزك <code dir="ltr">${esc(m.pin || '')}</code> · احتفظ بالبطاقة لنفسك</div></div>`; }).join('')}</div>
    <script>onload=()=>print()<\/script></body></html>`);
  w.document.close();
}

/* ═════════ الحضور: يسجّله الميسّر بمسح البطاقة في «تحقّق»، أو من هنا يدوياً — والغائبون برسالة لوليّ الأمر ═════════ */
const snToday = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function snAttView() {
  const days = [...new Set(SN.att.map(a => a.day))].sort(), day = SN.attDay || (days.includes(snToday()) ? snToday() : days[days.length - 1] || snToday());
  const here = new Map(SN.att.filter(a => a.day === day).map(a => [a.member_id, a])), tot = SN.members.length, n = here.size, pct = tot ? Math.round(n / tot * 100) : 0;
  const absent = SN.members.filter(m => !here.has(m.id)), present = SN.members.filter(m => here.has(m.id)), max = Math.max(1, ...days.map(d => SN.att.filter(a => a.day === d).length));
  const s = snSeason(), wa = m => { const ph = String(m.guardian_phone || '').replace(/\D/g, '').replace(/^0/, '966'); return ph ? `https://wa.me/${ph}?text=${encodeURIComponent(`السلام عليكم، نفيدكم بغياب ابنكم ${m.name.split(' ')[0]} عن «${s.name}» اليوم. نتمنّى له التوفيق ونسعد بحضوره غداً.`)}` : ''; };
  return `<div class="sn-acts"><input type="date" class="sn-pick" value="${day}" onchange="SN.attDay=this.value;snPaint()" aria-label="اليوم"></div>
    <div class="card sv-head"><div><h2>${fmtD(day)}</h2><p class="r-sub">يسجّله الميسّر بمسح بطاقة الطالب في «تحقّق» — مرّة في اليوم${(s.settings || {}).attend_coins ? ` · +${s.settings.attend_coins} عملة للحاضر` : ''}.</p></div>
      <div class="sv-kpis"><div><b>${n}</b><small>حاضر</small></div><div><b>${tot - n}</b><small>غائب</small></div><div><b style="color:${pct >= 80 ? '#34C759' : pct >= 60 ? '#FF9500' : '#FF3B30'}">${pct}٪</b><small>نسبة الحضور</small></div></div>
      ${days.length > 1 ? `<div class="sn-attbars" aria-label="الحضور لكلّ يوم">${days.map(d => { const k = SN.att.filter(a => a.day === d).length; return `<button type="button" class="${d === day ? 'on' : ''}" onclick="SN.attDay='${d}';snPaint()" title="${fmtD(d)}: ${k}"><i style="height:${Math.round(k / max * 100)}%"></i></button>`; }).join('')}</div>` : ''}</div>
    <div class="sv-res"><div class="card"><h3>الغائبون (${absent.length})</h3><div class="r-list">${absent.map(m => `<div class="r-item"><span class="sn-av sm">${snAv(m)}</span><span class="r-item-t"><b>${esc(m.name)}</b><small>#${m.no} · ${esc(m.stage || '')}</small></span>
        ${wa(m) ? `<a class="btn btn-ghost btn-sm" href="${wa(m)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> وليّ الأمر</a>` : ''}<button class="btn btn-ghost btn-sm" onclick="snMark('${m.id}','${day}')">حاضر</button></div>`).join('') || '<p class="r-sub">لا غياب — ما شاء الله.</p>'}</div></div>
      <div class="card"><h3>الحاضرون (${present.length})</h3><div class="r-list">${present.map(m => `<div class="r-item"><span class="sn-av sm">${snAv(m)}</span><span class="r-item-t"><b>${esc(m.name)}</b><small>#${m.no} · ${new Date(here.get(m.id).at || Date.now()).toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' })}</small></span></div>`).join('') || '<p class="r-sub">لم يُسجَّل أحد بعد.</p>'}</div></div></div>`;
}
async function snMark(mid, day) {
  try { SN.att.push(await RDB.insert('season_attendance', { season_id: SN.cur, member_id: mid, day, at: new Date().toISOString() })); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
/* تسليم الموسم: الدفعة الجديدة ترث الأصناف والجدول والاستبيانات والميسّرين */
async function snHandover(prev, n, old, cp) {
  const shift = prev.start_date && n.start_date ? Math.round((new Date(n.start_date) - new Date(prev.start_date)) / 864e5) : 0;
  const mv = d => { if (!shift || !d) return d; const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + shift); return x.toISOString().slice(0, 10); };
  const pick = (o, ks) => Object.fromEntries(ks.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
  try {
    if (cp.items) for (const it of old.items) await RDB.insert('season_items', Object.assign({ season_id: n.id }, pick(it, ['name', 'price', 'stock', 'image_url', 'emoji', 'description', 'active', 'sort'])));
    if (cp.sched) for (const x of old.sched) await RDB.insert('season_schedule', Object.assign({ season_id: n.id }, pick(x, ['title', 'place', 'starts', 'ends', 'stage']), { day: mv(x.day) }));
    if (cp.surv) { const sv = await RDB.list('season_surveys', { eq: { season_id: prev.id } }).catch(() => []); for (const v of sv) { const r = Object.assign({ season_id: n.id, status: 'draft' }, pick(v, ['title', 'intro', 'audience', 'questions'])); if (snLocal()) r.token = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''); await RDB.insert('season_surveys', r); } }
    if (cp.staff) for (const x of old.staff) { const r = Object.assign({ season_id: n.id }, pick(x, ['name', 'role', 'stage', 'perms', 'active', 'phone'])); if (snLocal()) r.pin = String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); await RDB.insert('season_staff', r); }
    rToast('سُلِّم الموسم — راجع الجدول والأسعار');
  } catch (e) { rToast('نُسخ جزء فقط: ' + (e.message || e), 1); }
}
/* ═════════ تقرير الأثر: صفحة للطباعة (PDF) للمجلس والرعاة وجهات الدعم ═════════ */
async function snImpact() {
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  w.document.write('<p style="font-family:system-ui;padding:40px">جارٍ إعداد التقرير…</p>');
  if (SN._svLoaded !== SN.cur) { SN._svLoaded = SN.cur; await snSvLoad(); }
  const s = snSeason(), org = (typeof SAAS_ORG !== 'undefined' && SAAS_ORG && SAAS_ORG.name) || CONFIG.companyName || '';
  const prevS = SN.seasons.filter(x => x.id !== s.id && String(x.created_at) < String(s.created_at)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
  const prevN = prevS ? (await RDB.list('season_members', { eq: { season_id: prevS.id } }).catch(() => [])).length : null;
  const byStage = {}; SN.members.forEach(m => { const g = m.stage || 'غير محدّد'; byStage[g] = (byStage[g] || 0) + 1; });
  const days = [...new Set(SN.att.map(a => a.day))], avgAtt = days.length && SN.members.length ? Math.round(SN.att.length / days.length / SN.members.length * 100) : null;
  const given = SN.coins.filter(c => c.amount > 0 && !/^حوالة/.test(c.reason || '')).reduce((a, c) => a + c.amount, 0), sold = SN.coins.filter(c => c.item_id).length, spent = -SN.coins.filter(c => c.item_id).reduce((a, c) => a + c.amount, 0);
  const sv = SN.surveys.map(v => ({ v, st: snSvStats(v, SN.svAns[v.id] || []), n: (SN.svAns[v.id] || []).length })).filter(x => x.n);
  const sat = sv.filter(x => x.st.sat != null), satAvg = sat.length ? Math.round(sat.reduce((a, x) => a + x.st.sat, 0) / sat.length) : null;
  const teams = snRanked(), K = (v, l, sub) => `<div class="k"><b>${v}</b><span>${l}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  w.document.open();
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الأثر — ${esc(s.name)}</title><style>
    body{font-family:system-ui,-apple-system,Tahoma;margin:36px;color:#1d1d1f}h1{margin:0;font-size:30px}h2{font-size:18px;margin:28px 0 10px;border-bottom:2px solid #eee;padding-bottom:6px}.sub{color:#555;margin:4px 0 0}
    .g{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.k{border:1px solid #e5e5ea;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:2px}.k b{font-size:28px}.k span{font-weight:700}.k small{color:#666}
    table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #eee;padding:8px;text-align:start}.dot{display:inline-block;width:12px;height:12px;border-radius:50%;vertical-align:middle;margin-inline-end:6px}
    @media print{body{margin:14mm}.k{break-inside:avoid}}</style></head><body>
    <h1>تقرير الأثر — ${esc(s.name)}</h1><p class="sub">${esc(org)}${s.start_date ? ' · ' + fmtD(s.start_date) + (s.end_date ? ' — ' + fmtD(s.end_date) : '') : ''} · أُعدّ ${fmtD(snToday())}</p>
    <h2>المشاركة</h2><div class="g">${K(SN.members.length, 'مشاركاً', prevN != null ? `${SN.members.length >= prevN ? '+' : ''}${SN.members.length - prevN} عن «${esc(prevS.name)}»` : '')}${K(avgAtt == null ? '—' : avgAtt + '٪', 'متوسّط الحضور', days.length ? days.length + ' أيّام مسجّلة' : 'لم يُسجَّل حضور')}${K(SN.staff.length, 'ميسّراً متطوّعاً')}${K(SN.sched.length, 'نشاطاً في الجدول')}</div>
    <p class="sub">بالمراحل: ${Object.entries(byStage).map(([g, n]) => `${esc(g)} ${n}`).join(' · ') || '—'}</p>
    <h2>التفاعل والتحفيز</h2><div class="g">${K(given.toLocaleString('en'), 'عملة مُنحت', 'على الحضور والمشاركة والإنجاز')}${K(sold, 'عمليّة شراء', spent ? spent.toLocaleString('en') + ' عملة صُرفت في المتجر' : '')}${K(SN.posts.length, 'منشوراً في الأخبار')}${K(SN.reacts.length, 'تفاعلاً')}</div>
    <h2>الفرق</h2><table><tr><th>#</th><th>الفريق</th><th>المشاركون</th><th>النقاط</th></tr>${teams.map((t, i) => `<tr><td>${i + 1}</td><td><span class="dot" style="background:${esc(t.color)}"></span>${esc(t.name)}</td><td>${t.n}</td><td>${t.pts}</td></tr>`).join('')}</table>
    <h2>الرضا</h2>${sv.length ? `<div class="g">${K(satAvg == null ? '—' : satAvg + '٪', 'متوسّط الرضا العامّ')}${K(sv.reduce((a, x) => a + x.n, 0), 'إجابة على الاستبيانات')}</div><table><tr><th>الاستبيان</th><th>الجمهور</th><th>الإجابات</th><th>الرضا</th><th>صافي التوصية</th></tr>${sv.map(x => `<tr><td>${esc(x.v.title)}</td><td>${SN_SV_AUD[x.v.audience] || ''}</td><td>${x.n}</td><td>${x.st.sat == null ? '—' : x.st.sat + '٪'}</td><td>${x.st.nps == null ? '—' : x.st.nps}</td></tr>`).join('')}</table>` : '<p class="sub">لم تُجمع استبيانات بعد — تبويب «الاستبيانات».</p>'}
    <p class="sub" style="margin-top:30px;font-size:12px">الأرقام من «نظام الجمعيّات الشبابيّة» مباشرة. الرضا العامّ = متوسّط أسئلة النجوم ÷ ٥؛ صافي التوصية = نسبة ٩–١٠ ناقص نسبة ٠–٦. الإجابات بلا أسماء.</p>
    <script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}
/* البنك: المشرف يكتب رقم المشارك (من بطاقته) ويمنح — أسرع من البحث بالاسم */
function snBankView() {
  const B = SN.bank, m = snByNo(B.no), rich = SN.members.map(x => ({ x, b: snBal(x.id) })).filter(r => r.b > 0).sort((a, b) => b.b - a.b).slice(0, 10);
  const total = SN.coins.filter(c => c.amount > 0).reduce((a, c) => a + c.amount, 0);
  return `<div class="card sn-award"><h3>امنح عملات</h3>
      <div class="field"><label>رقم المشارك أو اسمه</label><input id="snNo" inputmode="numeric" autocomplete="off" value="${esc(B.no)}" placeholder="مثلاً: 12" oninput="SN.bank.no=this.value;snBankWho()"></div>
      <div id="snWho" class="sn-who">${snWhoHTML(m)}</div>
      <div class="r-seg sn-amt" role="radiogroup">${[5, 10, 25, 50, 100, -10].map(p => `<button type="button" class="${B.amt === p ? 'on' : ''}" onclick="SN.bank.amt=${p};this.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">${p > 0 ? '+' + p : '−' + Math.abs(p)}</button>`).join('')}</div>
      <div class="sn-reasons">${SN_REASONS.map(r => `<button type="button" class="sn-rs${B.reason === r ? ' on' : ''}" onclick="SN.bank.reason='${r}';this.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">${r}</button>`).join('')}</div>
      <button class="btn btn-gold sn-give" onclick="snCoin()"><i data-lucide="coins"></i> امنح العملات</button></div>
    <div class="sn-stat"><span><b>${total}</b> عملة مُنحت</span><span><b>${SN.coins.filter(c => c.amount < 0 && c.item_id).length}</b> عمليّة شراء</span></div>
    <h3 class="sn-h">الأغنى في الموسم</h3>
    <div class="r-list">${rich.map((r, i) => { const t = snTeam(r.x.team_id); return `<div class="r-item"><span class="sn-no">${i + 1}</span><span class="r-item-t"><b>${esc(r.x.name)}</b><small>${t ? esc(t.name) : ''} · رقم ${r.x.no || ''}</small></span><span class="sn-mp">${r.b}</span></div>`; }).join('') || '<div class="r-empty"><p>لا عملات بعد.</p></div>'}</div>`;
}
function snWhoHTML(m) { if (!m) return '<span class="r-sub">اكتب الرقم المطبوع على بطاقة المشارك.</span>'; const t = snTeam(m.team_id); return `<span class="sn-dot" style="--tc:${esc(t ? t.color : '#999')}"></span><b>${esc(m.name)}</b><span class="r-sub">${t ? esc(t.name) + ' · ' : ''}الرصيد ${snBal(m.id)}</span>`; }
function snBankWho() { const el = document.getElementById('snWho'); if (el) { el.innerHTML = snWhoHTML(snByNo(SN.bank.no)); } }
async function snCoin(o) {
  const B = Object.assign({}, SN.bank, o || {}), m = o && o.member ? SN.members.find(x => x.id === o.member) : snByNo(B.no);
  if (!m) { rToast('لم أجد المشارك — تأكّد من الرقم', 1); return; }
  if (B.amt < 0 && snBal(m.id) + B.amt < 0) { rToast('الرصيد لا يكفي للخصم', 1); return; }
  try {
    SN.coins.push(await RDB.insert('season_coins', { season_id: SN.cur, member_id: m.id, amount: B.amt, reason: B.reason, by_member: ME.id }));
    rToast(`${B.amt > 0 ? '+' : ''}${B.amt} عملة لـ${m.name.split(' ')[0]} — رصيده ${snBal(m.id)}`);
    SN.bank.no = ''; snPaint(); const i = document.getElementById('snNo'); if (i && !o) i.focus();
  } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}

/* المتجر: أصناف بأسعار، والشراء عند الكاونتر برقم المشارك (يتحقّق من الرصيد والكمّيّة) */
function snStoreView() {
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snItemSheet()"><i data-lucide="plus"></i> صنف</button></div>
    ${SN.items.length ? `<div class="sn-items">${SN.items.map(it => `<div class="sn-item${it.active ? '' : ' off'}">
      <button type="button" class="sn-item-b" onclick="snItemSheet('${it.id}')">${it.image_url ? `<img src="${esc(snImg(it.image_url))}" alt="">` : `<span class="sn-emo">${esc(it.emoji || '🎁')}</span>`}<b>${esc(it.name)}</b><span>${it.price} عملة${it.stock != null ? ` · بقي ${it.stock}` : ''}</span></button>
      <button class="btn btn-ghost btn-sm" onclick="snSell('${it.id}')"${it.active && (it.stock == null || it.stock > 0) ? '' : ' disabled'}><i data-lucide="shopping-bag"></i> بيع</button></div>`).join('')}</div>`
      : `<div class="card">${rEmpty('gift', 'أضف ما يشتريه المشاركون بعملاتهم: جوائز، وجبات، امتيازات (اختيار النشاط، الصفّ الأوّل…).', '')}</div>`}`;
}
function snItemSheet(id) {
  const it = SN.items.find(x => x.id === id) || { active: true };
  openModal(id ? 'الصنف' : 'صنف جديد', `<div class="field"><label>الاسم</label><input id="sni_name" value="${esc(it.name || '')}" placeholder="مثلاً: كرة قدم، وجبة، اختيار النشاط"></div>
    <div class="field"><label>الصورة</label><div class="ws-img"><span class="ws-img-pv" id="sni_img_pv">${it.image_url ? `<img src="${esc(snImg(it.image_url))}" alt="">` : `<span class="sn-emo">${esc(it.emoji || '🎁')}</span>`}</span>
      <label class="btn btn-ghost btn-sm"><i data-lucide="upload"></i> صورة المنتج<input type="file" accept="image/*" hidden onchange="snItemImg(this)"></label><input type="hidden" id="sni_img" value="${esc(it.image_url || '')}"></div>
      <div class="r-hint">صورة مربّعة على خلفيّة نظيفة تبدو أجمل في المتجر. بلا صورة؟ يظهر الرمز أدناه على خلفيّة ملوّنة.</div></div>
    <div class="field"><label>رمز تعبيريّ (اختياريّ)</label><input id="sni_emoji" maxlength="4" value="${esc(it.emoji || '')}" placeholder="🍔 ⚽ 🧢 🎁"></div>
    <div class="field"><label>الوصف</label><textarea id="sni_desc" rows="2" maxlength="300" placeholder="مثلاً: كرة مقاس ٥ — لك أن تأخذها للبيت.">${esc(it.description || '')}</textarea></div>
    <div class="field"><label>السعر بالعملات</label><input id="sni_price" type="number" inputmode="numeric" min="1" value="${esc(it.price || '')}"></div>
    <div class="field"><label>الكمّيّة (اتركها فارغة إن كانت بلا حدّ)</label><input id="sni_stock" type="number" inputmode="numeric" min="0" value="${it.stock == null ? '' : esc(it.stock)}"></div>
    <label class="r-check"><input type="checkbox" id="sni_on"${it.active ? ' checked' : ''}> معروض في المتجر</label>`, async () => {
      const row = { name: fval('sni_name'), image_url: fval('sni_img'), emoji: fval('sni_emoji'), description: fval('sni_desc'), price: parseInt(fval('sni_price'), 10), stock: fval('sni_stock') === '' ? null : parseInt(fval('sni_stock'), 10), active: !!fval('sni_on') };
      if (row.name.length < 2 || !(row.price > 0)) { rToast('اكتب الاسم والسعر', 1); return; }
      try { if (id) Object.assign(it, await RDB.update('season_items', id, row)); else SN.items.push(await RDB.insert('season_items', Object.assign({ season_id: SN.cur, sort: SN.items.length }, row))); closeModal(); snPaint(); }
      catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف الصنف؟', '', 'حذف')) return; await RDB.remove('season_items', id); SN.items = SN.items.filter(x => x.id !== id); closeModal(); snPaint(); } : null);
}
async function snItemImg(inp) {
  const f = inp.files[0]; if (!f) return; rToast('جارٍ رفع الصورة…');
  try { const u = await RDB.uploadImage(f); document.getElementById('sni_img').value = u; document.getElementById('sni_img_pv').innerHTML = `<img src="${esc(u)}" alt="">`; rToast('رُفعت'); }
  catch (e) { rToast('تعذّر الرفع: ' + (e.message || e), 1); }
}
async function snSell(itemId) {
  const it = SN.items.find(x => x.id === itemId); if (!it) return;
  const v = await apPrompt('بيع «' + it.name + '» (' + it.price + ' عملة) — رقم المشارك:', ''); if (v == null) return;
  const m = snByNo(v); if (!m) { rToast('لم أجد المشارك', 1); return; }
  try {
    if (snLocal()) {
      const bal = snBal(m.id); if (bal < it.price) throw new Error('الرصيد لا يكفي (' + bal + ')'); if (it.stock != null && it.stock < 1) throw new Error('نفدت الكمّيّة');
      SN.coins.push(await RDB.insert('season_coins', { season_id: SN.cur, member_id: m.id, amount: -it.price, reason: 'شراء: ' + it.name, item_id: it.id, by_member: ME.id }));
      if (it.stock != null) Object.assign(it, await RDB.update('season_items', it.id, { stock: it.stock - 1 }));
    } else {
      const { error } = await sb.rpc('season_buy', { p_member: m.id, p_item: it.id }); if (error) throw error;
      await snLoad();
    }
    rToast(`بِيع «${it.name}» لـ${m.name.split(' ')[0]} — رصيده ${snBal(m.id)}`); snPaint();
  } catch (e) { rToast(String(e.message || e).replace(/^.*?:\s*/, ''), 1); }
}

/* الجدول: أيّام الموسم وأنشطتها (يظهر للمشارك في «جوّالي» حسب مرحلته) */
function snSchedView() {
  const days = {}; SN.sched.forEach(x => (days[x.day] = days[x.day] || []).push(x));
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snSchedSheet()"><i data-lucide="plus"></i> نشاط</button></div>
    ${Object.keys(days).sort().map(d => `<h3 class="sn-h">${fmtD(d)}</h3><div class="r-list">${days[d].sort((a, b) => String(a.starts).localeCompare(String(b.starts))).map(x => `<button type="button" class="r-item" onclick="snSchedSheet('${x.id}')">
      <span class="sn-time" dir="ltr">${esc(x.starts || '')}${x.ends ? '–' + esc(x.ends) : ''}</span><span class="r-item-t"><b>${esc(x.title)}</b><small>${esc([x.place, x.stage].filter(Boolean).join(' · '))}</small></span></button>`).join('')}</div>`).join('')
      || `<div class="card">${rEmpty('calendar-days', 'أضف أنشطة الموسم — تظهر لكلّ مشارك في «جوّالي» حسب مرحلته.', '')}</div>`}`;
}
function snSchedSheet(id) {
  const x = SN.sched.find(r => r.id === id) || { day: (snSeason() || {}).start_date || today() };
  openModal(id ? 'النشاط' : 'نشاط جديد', `<div class="field"><label>النشاط</label><input id="snc_t" value="${esc(x.title || '')}" placeholder="مثلاً: دوري كرة القدم"></div>
    <div class="field"><label>اليوم</label><input id="snc_d" type="date" value="${esc(x.day || '')}"></div>
    <div class="field"><label>من</label><input id="snc_f" type="time" value="${esc(x.starts || '')}"></div>
    <div class="field"><label>إلى</label><input id="snc_e" type="time" value="${esc(x.ends || '')}"></div>
    <div class="field"><label>المكان (اختياريّ)</label><input id="snc_p" value="${esc(x.place || '')}"></div>
    <div class="field"><label>للمرحلة</label><select id="snc_g"><option value="">الجميع</option>${SN_STAGES.map(g => `<option${g === x.stage ? ' selected' : ''}>${g}</option>`).join('')}</select></div>`, async () => {
      const row = { title: fval('snc_t'), day: fval('snc_d'), starts: fval('snc_f'), ends: fval('snc_e'), place: fval('snc_p'), stage: fval('snc_g') };
      if (row.title.length < 2 || !row.day) { rToast('اكتب النشاط واليوم', 1); return; }
      try { if (id) Object.assign(x, await RDB.update('season_schedule', id, row)); else SN.sched.push(await RDB.insert('season_schedule', Object.assign({ season_id: SN.cur }, row))); closeModal(); snPaint(); }
      catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف النشاط؟', '', 'حذف')) return; await RDB.remove('season_schedule', id); SN.sched = SN.sched.filter(r => r.id !== id); closeModal(); snPaint(); } : null);
}

/* ═════════ المرحلة ٣: الميسّرون وألوان المراحل ═════════ */
// ألوان المراحل المعتمدة في «حروف ودروس» (watch.css) — والجامعيّ/الميسّرون بالأسود
const SN_STAGE_COLORS = { 'ابتدائي': '#00C6FF', 'متوسط': '#FF9000', 'ثانوي': '#1A3365', 'جامعي': '#1C1C1E' };
function snStageColor(g, s) { return (((s || snSeason() || {}).settings || {}).stages || {})[g] || SN_STAGE_COLORS[g] || '#8E8E93'; }
/* مدن المواقيت (أم القرى) — تُستعمل في «جوّالي» */
const SN_CITIES = { 'الرياض': [24.7136, 46.6753], 'جدة': [21.4858, 39.1925], 'مكة المكرمة': [21.3891, 39.8579], 'المدينة المنورة': [24.5247, 39.5692], 'الدمام': [26.4207, 50.0888], 'الخبر': [26.2794, 50.2083],
  'الأحساء': [25.3833, 49.5867], 'القطيف': [26.5196, 50.0115], 'الجبيل': [27.0046, 49.646], 'الطائف': [21.2703, 40.4158], 'أبها': [18.2164, 42.5053], 'خميس مشيط': [18.3, 42.7333], 'تبوك': [28.3838, 36.555],
  'حائل': [27.5114, 41.69], 'بريدة': [26.326, 43.975], 'عنيزة': [26.0844, 43.9935], 'جازان': [16.8892, 42.5511], 'نجران': [17.5656, 44.2289], 'الباحة': [20.0129, 41.4677], 'سكاكا': [29.9697, 40.2064], 'عرعر': [30.9753, 41.0381], 'ينبع': [24.0895, 38.0618] };
const SN_ROLE = { lead: 'قائد', staff: 'ميسّر' };
function snStaffView() {
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snStaffSheet()"><i data-lucide="user-plus"></i> ميسّر</button></div>
    <p class="ws-note"><i data-lucide="info"></i> <span>الميسّرون يدخلون «جوّال الميسّر» برمز الموسم ورمزهم، ويمنحون العملات ونقاط الفرق ويبيعون من المتجر — كلٌّ في حدود صلاحيّاته، وكلّ حركة تُسجَّل باسمه.</span></p>
    <div class="r-list">${SN.staff.map(x => { const given = SN.coins.filter(c => c.staff_id === x.id && c.amount > 0).reduce((a, c) => a + c.amount, 0);
      return `<button type="button" class="r-item" onclick="snStaffSheet('${x.id}')"><span class="sn-staff-av">${esc(initials(x.name))}</span><span class="r-item-t"><b>${esc(x.name)}${x.active ? '' : ' <small>(موقوف)</small>'}</b><small>${SN_ROLE[x.role] || ''}${x.stage ? ' · ' + esc(x.stage) : ' · كلّ المراحل'} · منح ${given} عملة</small></span><i data-lucide="chevron-left"></i></button>`; }).join('')
      || '<div class="r-empty"><p>أضف ميسّري الموسم — كلّ واحد يأخذ رمزاً خاصّاً يدخل به من جواله.</p></div>'}</div>`;
}
function snStaffSheet(id) {
  const x = SN.staff.find(r => r.id === id) || { role: 'staff', active: true, perms: { coins: 50, points: true, sell: true } }, P = x.perms || {};
  openModal(id ? 'الميسّر' : 'ميسّر جديد', `${id ? `<div class="sn-idcard"><span>رمز الدخول <b dir="ltr">${esc(x.pin || '—')}</b></span><span>رمز الموسم <b dir="ltr">${esc((snSeason() || {}).code || '')}</b></span><span>الدور <b>${SN_ROLE[x.role]}</b></span></div>
      <button type="button" class="btn btn-ghost sn-wide" onclick="snStaffShare('${x.id}')"><i data-lucide="send"></i> أرسل له رابط الدخول</button><button type="button" class="btn btn-ghost sn-wide" onclick="closeModal();setTimeout(()=>snStaffQR('${x.id}'),250)"><i data-lucide="qr-code"></i> رمز الدخول (QR)</button>` : ''}
    <div class="field"><label>الاسم</label><input id="sst_n" value="${esc(x.name || '')}"></div>
    <div class="field"><label>الجوال (اختياريّ)</label><input id="sst_p" dir="ltr" inputmode="tel" value="${esc(x.phone || '')}"></div>
    <div class="field"><label>الدور</label><select id="sst_r"><option value="staff"${x.role === 'staff' ? ' selected' : ''}>ميسّر — يرى طلاب مرحلته</option><option value="lead"${x.role === 'lead' ? ' selected' : ''}>قائد — يرى الجميع</option></select></div>
    <div class="field"><label>المرحلة</label><select id="sst_g"><option value="">كلّ المراحل</option>${SN_STAGES.map(g => `<option${g === x.stage ? ' selected' : ''}>${g}</option>`).join('')}</select></div>
    <div class="field"><label>أقصى عملات في المرّة</label><input id="sst_c" type="number" inputmode="numeric" min="1" max="1000" value="${esc(P.coins || 50)}"></div>
    <label class="r-check"><input type="checkbox" id="sst_pt"${P.points ? ' checked' : ''}> يمنح نقاط الفرق</label>
    <label class="r-check"><input type="checkbox" id="sst_s"${P.sell ? ' checked' : ''}> يبيع من المتجر</label>
    <label class="r-check"><input type="checkbox" id="sst_a"${x.active ? ' checked' : ''}> مفعّل</label>`, async () => {
      const row = { name: fval('sst_n'), phone: fval('sst_p'), role: fval('sst_r'), stage: fval('sst_g'), active: !!fval('sst_a'), perms: { coins: Math.max(1, Math.min(1000, parseInt(fval('sst_c'), 10) || 50)), points: !!fval('sst_pt'), sell: !!fval('sst_s') } };
      if (row.name.length < 2) { rToast('اكتب الاسم', 1); return; }
      try {
        if (id) Object.assign(x, await RDB.update('season_staff', id, row));
        else { const r = Object.assign({ season_id: SN.cur }, row); if (snLocal()) do { r.pin = String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); } while (SN.staff.some(m => m.pin === r.pin) || SN.members.some(m => m.pin === r.pin)); SN.staff.push(await RDB.insert('season_staff', r)); }
        closeModal(); snPaint();
      } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف الميسّر؟', 'تبقى حركاته مسجّلة.', 'حذف')) return; await RDB.remove('season_staff', id); SN.staff = SN.staff.filter(r => r.id !== id); closeModal(); snPaint(); } : null);
}
function snStaffQR(id) {
  const x = SN.staff.find(r => r.id === id), s = snSeason(); if (!x) return;
  openModal('دخول ' + x.name.split(' ')[0], `<div class="sn-qr">${snQR(snLoginUrl(s.code, x.pin, true))}</div><p class="r-sub" style="text-align:center">يمسحه الميسّر بكاميرا جواله فيدخل «جوّال الميسّر» مباشرة. الرمز خاصّ به.</p>`);
}
async function snStaffShare(id) {
  const x = SN.staff.find(r => r.id === id), s = snSeason(); if (!x) return;
  const url = snLoginUrl(s.code, x.pin, true);
  const text = `أهلاً ${x.name.split(' ')[0]} — «جوّال الميسّر» في ${s.name}\nافتح الرابط وتدخل مباشرة:\n${url}\n(رابطك خاصّ بك — لا تشاركه مع أحد)`;
  if (navigator.share) { try { await navigator.share({ title: s.name, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); rToast('نُسخت الرسالة — أرسلها له على واتساب'); } catch (e) { await apPrompt('انسخ الرسالة:', text); }
}

/* ═════════ المرحلة ٤: «الأخبار» من الإدارة — خبر، تكريم، إعلان برنامج، تشويق، وموعد نشر ═════════ */
const SN_PK = { news: 'خبر', honor: 'تكريم', program: 'إعلان برنامج', teaser: 'تشويق' };
function snNewsView() {
  const now = new Date().toISOString();
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snPostSheet()"><i data-lucide="plus"></i> منشور</button></div>
    <p class="ws-note"><i data-lucide="info"></i> <span>يظهر في «الأخبار» داخل جوّالي للطلاب والميسّرين. التفاعل بقلب فقط، ويُلوَّن بمرحلة كلّ متفاعل.</span></p>
    <div class="sn-posts">${SN.posts.map(p => { const r = {}; SN.reacts.filter(x => x.post_id === p.id).forEach(x => { const g = x.stage || 'جامعي'; r[g] = (r[g] || 0) + 1; });
      const by = p.staff_id ? ((SN.staff.find(x => x.id === p.staff_id) || {}).name || 'ميسّر') : 'الإدارة', hon = SN.members.find(x => x.id === p.member_id), later = String(p.publish_at) > now;
      return `<button type="button" class="sn-post" onclick="snPostSheet('${p.id}')">${p.image_url ? `<img src="${esc(snImg(p.image_url))}" alt="">` : `<span class="sn-post-ph">${p.kind === 'honor' ? '🏅' : '📰'}</span>`}
        <span class="sn-post-t"><small>${SN_PK[p.kind] || ''} · ${esc(by)}${later ? ' · <b>يُنشر ' + fmtD(String(p.publish_at).slice(0, 10)) + '</b>' : ''}</small><b>${esc(p.title)}</b>${hon ? `<small>🏅 ${esc(hon.name)}</small>` : ''}
        <span class="sn-rx">${Object.entries(r).map(([g, n]) => `<i style="--tc:${snStageColor(g)}"></i>${n}`).join(' ') || '<small>لا تفاعل بعد</small>'}</span></span></button>`; }).join('') || `<div class="card">${rEmpty('newspaper', 'انشر أوّل خبر للموسم: إعلان برنامج بصورته وموعده، أو تكريم طالب.', '')}</div>`}</div>`;
}
const snImg = u => !u ? '' : /^(https?:|data:)/.test(u) ? u : (((CONFIG.neonBranches || {})[RUSO_LIVE && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1' ? 'production' : 'staging'] || {}).mediaUrl || '') + '/' + String(u).split('/').map(encodeURIComponent).join('/');
function snPostSheet(id) {
  const p = SN.posts.find(x => x.id === id) || { kind: 'program' }, dt = p.publish_at ? new Date(p.publish_at) : new Date();
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  openModal(id ? 'المنشور' : 'منشور جديد', `<div class="field"><label>النوع</label><select id="snp_k" onchange="document.getElementById('snp_honF').hidden=this.value!=='honor'">${Object.entries(SN_PK).map(([k, v]) => `<option value="${k}"${k === p.kind ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="field" id="snp_honF"${p.kind === 'honor' ? '' : ' hidden'}><label>الطالب المكرَّم</label><select id="snp_m"><option value="">—</option>${SN.members.map(m => `<option value="${m.id}"${m.id === p.member_id ? ' selected' : ''}>${m.no} · ${esc(m.name)}</option>`).join('')}</select></div>
    <div class="field"><label>العنوان</label><input id="snp_t" maxlength="120" value="${esc(p.title || '')}" placeholder="مثلاً: غداً رحلة البحر"></div>
    <div class="field"><label>النصّ</label><textarea id="snp_b" rows="4" maxlength="1500">${esc(p.body || '')}</textarea></div>
    <div class="field"><label>الصورة</label><div class="ws-img"><span class="ws-img-pv" id="snp_img_pv">${p.image_url ? `<img src="${esc(snImg(p.image_url))}" alt="">` : '<i data-lucide="image-plus"></i>'}</span>
      <label class="btn btn-ghost btn-sm"><i data-lucide="upload"></i> اختر صورة<input type="file" accept="image/*" hidden onchange="snPostImg(this)"></label><input type="hidden" id="snp_img" value="${esc(p.image_url || '')}"></div>
      <div class="r-hint">نفس الصورة تصلح لحسابات الجمعيّة في إنستغرام — اضغط عليها بعد النشر لحفظها.</div></div>
    <div class="field"><label>موعد النشر</label><input id="snp_at" type="datetime-local" value="${local}"><div class="r-hint">للتشويق: انشر صورة «قريباً» الآن، وتفاصيل البرنامج في الغد.</div></div>`, async () => {
      const row = { kind: fval('snp_k'), title: fval('snp_t'), body: fval('snp_b'), image_url: fval('snp_img'), member_id: fval('snp_k') === 'honor' ? (fval('snp_m') || null) : null, publish_at: new Date(fval('snp_at') || Date.now()).toISOString() };
      if (row.title.length < 2) { rToast('اكتب العنوان', 1); return; }
      try { if (id) Object.assign(p, await RDB.update('season_posts', id, row)); else SN.posts.unshift(await RDB.insert('season_posts', Object.assign({ season_id: SN.cur, by_member: ME.id }, row))); closeModal(); snPaint(); }
      catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    }, id ? async () => { if (!await snAsk('حذف المنشور؟', 'يُحذف معه تفاعله.', 'حذف')) return; await RDB.remove('season_posts', id); SN.posts = SN.posts.filter(x => x.id !== id); closeModal(); snPaint(); } : null);
}
async function snPostImg(inp) {
  const f = inp.files[0]; if (!f) return; rToast('جارٍ رفع الصورة…');
  try { const u = await RDB.uploadImage(f); document.getElementById('snp_img').value = u; document.getElementById('snp_img_pv').innerHTML = `<img src="${esc(u)}" alt="">`; rToast('رُفعت'); }
  catch (e) { rToast('تعذّر الرفع: ' + (e.message || e), 1); }
}


/* ═════════ الاستبيانات — رضا المشاركين والميسّرين وأولياء الأمور (معيار الشفافية: مؤشّر ٣) ═════════
 * الجداول season_surveys · season_survey_answers (services/charity/db/surveys.sql)
 * يجيب الطالب والميسّر من «جوّالي»، ووليّ الأمر برابط عامّ ‎/charity/survey/?t=…  — والأسماء لا تظهر في النتائج.
 * الأسئلة: {id, t: stars|nps|choice|text, l, o} */
const SN_SV_AUD = { students: 'المشاركون', staff: 'الميسّرون', parents: 'أولياء الأمور' };
const SN_SV_T = { stars: 'تقييم بالنجوم', nps: 'هل تنصح؟ (٠–١٠)', choice: 'اختيار', text: 'نصّ حرّ' };
const SN_SV_ST = { draft: ['مسودّة', '#8E8E93'], open: ['مفتوح', '#34C759'], closed: ['مغلق', '#FF9500'] };
const snQ = (t, l, o) => Object.assign({ id: 'q' + Math.random().toString(36).slice(2, 7), t, l }, o ? { o } : {});
const SN_SV_TPL = [
  { k: 'season', icon: 'sparkles', title: 'رضا المستفيدين عن الموسم', audience: 'students', intro: 'رأيك يصنع الموسم القادم — دقيقتان فقط.',
    q: () => [snQ('stars', 'البرامج والأنشطة'), snQ('stars', 'الميسّرون وتعاملهم'), snQ('stars', 'المكان والتنظيم'), snQ('stars', 'الضيافة والوجبات'),
      snQ('choice', 'أكثر شيء أعجبك', ['الرحلات', 'المسابقات', 'الدورات والمهارات', 'الرياضة']), snQ('nps', 'هل تنصح صديقك بالتسجيل معنا؟'), snQ('text', 'ماذا تتمنّى في الموسم القادم؟')] },
  { k: 'activity', icon: 'calendar-check', title: 'تقييم برنامج أو نشاط', audience: 'students', intro: 'قيّم نشاط اليوم.',
    q: () => [snQ('stars', 'استمتعت بالنشاط'), snQ('stars', 'تعلّمت شيئاً جديداً'), snQ('choice', 'مدّة النشاط', ['قصيرة', 'مناسبة', 'طويلة']), snQ('text', 'ملاحظة أو اقتراح')] },
  { k: 'parents', icon: 'users', title: 'رضا أولياء الأمور', audience: 'parents', intro: 'شكراً لثقتكم. رأيكم يساعدنا على خدمة أبنائكم أفضل.',
    q: () => [snQ('stars', 'التواصل وإبلاغكم بالبرامج والمواعيد'), snQ('stars', 'سلامة الأبناء والإشراف عليهم'), snQ('stars', 'الأثر التربويّ والقيميّ'), snQ('stars', 'التنظيم والالتزام بالمواعيد'),
      snQ('choice', 'هل لاحظتم أثراً إيجابيّاً على ابنكم؟', ['كبير', 'متوسّط', 'قليل', 'لم ألاحظ']), snQ('nps', 'هل تنصحون غيركم بتسجيل أبنائهم معنا؟'), snQ('text', 'اقتراحاتكم')] },
  { k: 'staff', icon: 'hand-heart', title: 'رضا الميسّرين', audience: 'staff', intro: 'أنتم قلب الموسم — نريد أن نسمعكم.',
    q: () => [snQ('stars', 'وضوح المهامّ والأدوار'), snQ('stars', 'دعم الإدارة'), snQ('stars', 'التدريب والتهيئة'), snQ('stars', 'روح الفريق وبيئة العمل'),
      snQ('choice', 'هل ترغب بالمشاركة في الموسم القادم؟', ['نعم بالتأكيد', 'ربّما', 'لا']), snQ('text', 'ما الذي يجعل تجربتك أفضل؟')] },
  { k: 'needs', icon: 'compass', title: 'اهتمامات المشاركين (قبل الموسم)', audience: 'students', intro: 'ساعدنا نصمّم موسماً على ذوقك.',
    q: () => [snQ('choice', 'أيّ الأنشطة تفضّل؟', ['رياضيّة', 'ثقافيّة ومسابقات', 'مهارات وتقنية', 'رحلات وكشافة', 'تطوّع وخدمة مجتمع']), snQ('choice', 'أنسب وقت للبرامج', ['العصر', 'المغرب', 'بعد العشاء']), snQ('text', 'مهارة تتمنّى تتعلّمها')] },
  { k: 'blank', icon: 'file-plus', title: 'استبيان فارغ', audience: 'students', intro: '', q: () => [snQ('stars', 'سؤالك الأوّل')] }];

async function snSvLoad() {
  SN.surveys = await RDB.list('season_surveys', { eq: { season_id: SN.cur }, order: 'created_at' }).catch(() => []);
  const all = await Promise.all(SN.surveys.map(v => RDB.list('season_survey_answers', { eq: { survey_id: v.id } }).catch(() => [])));
  SN.svAns = {}; SN.surveys.forEach((v, i) => { SN.svAns[v.id] = all[i]; });
}
function snSvView() {
  if (!SN._svLoaded || SN._svLoaded !== SN.cur) { SN._svLoaded = SN.cur; snSvLoad().then(() => { if (SN.tab === 'surveys') snPaint(); }); return `<div class="r-skel"></div>`; }
  if (SN.svOpen && SN.surveys.find(v => v.id === SN.svOpen)) return snSvResults(SN.svOpen);
  const n = id => (SN.svAns[id] || []).length;
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snSvNew()"><i data-lucide="plus"></i> استبيان</button></div>
    <p class="ws-note"><i data-lucide="info"></i> <span>يظهر الاستبيان المفتوح في «جوّالي» للمشاركين أو الميسّرين، ولأولياء الأمور برابط تشاركه. الأسماء لا تظهر في النتائج — وقياس الرضا ونشر نتائجه من معايير الشفافية.</span></p>
    <div class="sv-list">${SN.surveys.slice().reverse().map(v => { const st = SN_SV_ST[v.status] || SN_SV_ST.draft;
      return `<button type="button" class="sv-row" onclick="snSvGo('${v.id}')"><span class="sv-n"><b>${n(v.id)}</b><small>إجابة</small></span>
        <span class="sv-t"><b>${esc(v.title)}</b><small>${SN_SV_AUD[v.audience] || ''} · ${(v.questions || []).length} أسئلة</small></span><span class="r-badge" style="--c:${st[1]}">${st[0]}</span></button>`; }).join('')
      || `<div class="card">${rEmpty('clipboard-list', 'ابدأ بقالب جاهز: رضا المشاركين، أولياء الأمور، الميسّرين، أو تقييم نشاط.', `<button class="btn btn-gold" onclick="snSvNew()"><i data-lucide="plus"></i> استبيان من قالب</button>`)}</div>`}</div>`;
}
function snSvGo(id) { SN.svOpen = id; snPaint(); }
function snSvNew() {
  openModal('استبيان جديد', `<p class="r-sub">اختر قالباً — تعدّل أسئلته بعدها كما تشاء.</p><div class="sv-tpls">${SN_SV_TPL.map(t => `<button type="button" class="sv-tpl" onclick="snSvFromTpl('${t.k}')"><i data-lucide="${t.icon}"></i><span><b>${esc(t.title)}</b><small>${SN_SV_AUD[t.audience]}${t.k === 'blank' ? '' : ' · ' + t.q().length + ' أسئلة'}</small></span></button>`).join('')}</div>`);
  refreshIcons();
}
async function snSvFromTpl(k) {
  const t = SN_SV_TPL.find(x => x.k === k);
  const row = { season_id: SN.cur, title: t.k === 'blank' ? 'استبيان جديد' : t.title, intro: t.intro, audience: t.audience, questions: t.q(), status: 'draft' };
  if (snLocal()) row.token = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  try { const v = await RDB.insert('season_surveys', row); SN.surveys.push(v); SN.svAns[v.id] = []; closeModal(); SN.svOpen = v.id; snPaint(); snSvEdit(v.id); }
  catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
function snSvQRow(q) {
  return `<div class="sv-qe" data-id="${esc(q.id)}"><div class="sv-qe-h"><select class="sv-qt" aria-label="نوع السؤال" onchange="this.closest('.sv-qe').querySelector('.sv-qo').hidden=this.value!=='choice'">${Object.entries(SN_SV_T).map(([k, v]) => `<option value="${k}"${k === q.t ? ' selected' : ''}>${v}</option>`).join('')}</select>
    <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.sv-qe').remove()" aria-label="حذف السؤال"><i data-lucide="trash-2"></i></button></div>
    <input class="sv-ql" maxlength="200" value="${esc(q.l || '')}" placeholder="نصّ السؤال">
    <textarea class="sv-qo" rows="${Math.max(3, (q.o || []).length)}" maxlength="600" placeholder="خيار في كلّ سطر — أنت تحدّدها"${q.t === 'choice' ? '' : ' hidden'}>${esc((q.o || []).join('\n'))}</textarea></div>`;
}
function snSvEdit(id) {
  const v = SN.surveys.find(x => x.id === id), locked = (SN.svAns[id] || []).length > 0;
  openModal('تعديل الاستبيان', `<div class="field"><label>العنوان</label><input id="sv_t" maxlength="120" value="${esc(v.title)}"></div>
    <div class="field"><label>المقدّمة</label><input id="sv_i" maxlength="300" value="${esc(v.intro || '')}" placeholder="سطر يظهر أعلى الاستبيان"></div>
    <div class="field"><label>الجمهور</label><select id="sv_a"${locked ? ' disabled' : ''}>${Object.entries(SN_SV_AUD).map(([k, n]) => `<option value="${k}"${k === v.audience ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
    ${locked ? '<p class="ws-note"><i data-lucide="lock"></i> <span>وصلت إجابات — الأسئلة مقفلة حتى لا تختلط النتائج. أنشئ استبياناً جديداً لأسئلة أخرى.</span></p>' : ''}
    <div class="field"><label>الأسئلة</label><div id="sv_qs"${locked ? ' class="sv-locked"' : ''}>${(v.questions || []).map(snSvQRow).join('')}</div>
      ${locked ? '' : `<div class="sv-add"><span class="r-sub">أضف سؤالاً:</span>${[['stars', 'star', 'نجوم'], ['choice', 'list-checks', 'اختيارات'], ['nps', 'gauge', 'أرقام ٠–١٠'], ['text', 'text', 'كتابة']].map(([t, ic, n]) => `<button type="button" class="btn btn-ghost btn-sm" onclick="snSvAddQ('${t}')"><i data-lucide="${ic}"></i> ${n}</button>`).join('')}</div>`}</div>`, async () => {
    const patch = { title: fval('sv_t'), intro: fval('sv_i') };
    if (patch.title.length < 2) { rToast('اكتب العنوان', 1); return; }
    if (!locked) {
      patch.audience = fval('sv_a');
      patch.questions = [...document.querySelectorAll('#sv_qs .sv-qe')].map(r => { const t = r.querySelector('.sv-qt').value, q = { id: r.dataset.id, t, l: r.querySelector('.sv-ql').value.trim() };
        if (t === 'choice') q.o = r.querySelector('.sv-qo').value.split(/[,،\n]/).map(x => x.trim()).filter(Boolean).slice(0, 12); return q; }).filter(q => q.l);
      const bad = patch.questions.find(q => q.t === 'choice' && q.o.length < 2); if (bad) { rToast(`اكتب خيارين على الأقلّ لسؤال «${bad.l}»`, 1); return; }
      if (!patch.questions.length) { rToast('أضف سؤالاً واحداً على الأقلّ (والاختيار يحتاج خيارين)', 1); return; }
    }
    try { Object.assign(v, await RDB.update('season_surveys', id, patch)); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
  }, async () => { if (!await snAsk('حذف الاستبيان؟', 'تُحذف معه كلّ إجاباته.', 'حذف')) return; await RDB.remove('season_surveys', id); SN.surveys = SN.surveys.filter(x => x.id !== id); SN.svOpen = null; closeModal(); snPaint(); });
  refreshIcons();
}
function snSvAddQ(t) { document.getElementById('sv_qs').insertAdjacentHTML('beforeend', snSvQRow(snQ(t, '', t === 'choice' ? [] : null))); const rows = document.querySelectorAll('#sv_qs .sv-qe'); const r = rows[rows.length - 1]; r.scrollIntoView({ block: 'center', behavior: 'smooth' }); r.querySelector('.sv-ql').focus(); refreshIcons(); }
async function snSvStatus(id, st) {
  const v = SN.surveys.find(x => x.id === id);
  if (st === 'closed' && !await snAsk('إغلاق الاستبيان؟', 'لن تُقبل إجابات جديدة، وتبقى النتائج.', 'إغلاق', false)) return;
  try { Object.assign(v, await RDB.update('season_surveys', id, { status: st })); snPaint(); rToast(st === 'open' ? 'فُتح — يظهر الآن في جوّالي' : 'أُغلق'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
function snSvLink(v) { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'survey/?t=' + v.token + (snLocal() ? '&demo=1' : ''); }
async function snSvShare(id) {
  const v = SN.surveys.find(x => x.id === id), url = snSvLink(v), txt = `${v.title}\n${v.intro ? v.intro + '\n' : ''}${url}`;
  try { if (navigator.share) { await navigator.share({ title: v.title, text: txt }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(txt); rToast('نُسخ الرابط — أرسله في مجموعة أولياء الأمور'); } catch (e) { apAlert({ title: 'رابط الاستبيان', msg: url }); }
}
/* التحليل: رضا عامّ = متوسّط النجوم ÷ ٥، وصافي التوصية = نسبة ٩–١٠ ناقص نسبة ٠–٦ */
function snSvStats(v, rows) {
  const Q = v.questions || [], out = {}, stars = [];
  Q.forEach(q => {
    const vals = rows.map(r => (r.answers || {})[q.id]).filter(x => x !== undefined && x !== null && x !== '');
    if (q.t === 'stars') { const a = vals.map(Number).filter(n => n >= 1 && n <= 5), avg = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; if (a.length) stars.push(avg); out[q.id] = { n: a.length, avg, dist: [1, 2, 3, 4, 5].map(k => a.filter(x => x === k).length) }; }
    else if (q.t === 'nps') { const a = vals.map(Number).filter(n => n >= 0 && n <= 10), pro = a.filter(x => x >= 9).length, det = a.filter(x => x <= 6).length; out[q.id] = { n: a.length, nps: a.length ? Math.round((pro - det) / a.length * 100) : null, pro, det, pas: a.length - pro - det }; }
    else if (q.t === 'choice') { const c = {}; (q.o || []).forEach(o => { c[o] = 0; }); vals.forEach(x => { if (x in c) c[x]++; }); out[q.id] = { n: vals.length, c }; }
    else out[q.id] = { n: vals.length, texts: vals.map(String) };
  });
  const sat = stars.length ? Math.round(stars.reduce((a, b) => a + b, 0) / stars.length / 5 * 100) : null;
  const nq = Q.find(q => q.t === 'nps'), byStage = {}; rows.forEach(r => { const g = r.stage || '—'; byStage[g] = (byStage[g] || 0) + 1; });
  return { out, sat, nps: nq ? out[nq.id].nps : null, byStage };
}
function snSvResults(id) {
  const v = SN.surveys.find(x => x.id === id), rows = SN.svAns[id] || [], S2 = snSvStats(v, rows), st = SN_SV_ST[v.status] || SN_SV_ST.draft;
  const pool = v.audience === 'students' ? SN.members.length : v.audience === 'staff' ? SN.staff.length : 0;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0, tone = x => x == null ? '#8E8E93' : x >= 80 ? '#34C759' : x >= 60 ? '#FF9500' : '#FF3B30';
  const acts = v.status === 'draft' ? `<button class="btn btn-gold" onclick="snSvStatus('${id}','open')"><i data-lucide="send"></i> افتح الاستبيان</button>`
    : v.status === 'open' ? `<button class="btn btn-ghost" onclick="snSvStatus('${id}','closed')"><i data-lucide="lock"></i> أغلق</button>` : `<button class="btn btn-ghost" onclick="snSvStatus('${id}','open')"><i data-lucide="unlock"></i> أعد فتحه</button>`;
  return `<div class="sn-acts"><button class="btn btn-ghost" onclick="snSvGo(null)"><i data-lucide="chevron-right"></i> الاستبيانات</button>${acts}
      ${v.audience === 'parents' && v.status !== 'draft' ? `<button class="btn btn-ghost" onclick="snSvShare('${id}')"><i data-lucide="share"></i> رابط أولياء الأمور</button>` : ''}
      <button class="btn btn-ghost" onclick="snSvEdit('${id}')"><i data-lucide="pencil"></i> تعديل</button>
      ${rows.length ? `<button class="btn btn-ghost" onclick="snSvPrint('${id}')"><i data-lucide="printer"></i> تقرير النتائج</button>` : ''}
      ${snLocal() && !rows.length ? `<button class="btn btn-ghost" onclick="snSvDemo('${id}')"><i data-lucide="wand-2"></i> إجابات تجريبيّة</button>` : ''}</div>
    <div class="card sv-head"><div><h2>${esc(v.title)}</h2><p class="r-sub">${SN_SV_AUD[v.audience]} · <span class="r-badge" style="--c:${st[1]}">${st[0]}</span>${v.status === 'draft' ? ' — لا يراه أحد حتى تفتحه' : ''}</p></div>
      <div class="sv-kpis"><div><b>${rows.length}</b><small>إجابة${pool ? ` · ${Math.min(100, pct(rows.length, pool))}٪ من ${pool}` : ''}</small></div>
        <div><b style="color:${tone(S2.sat)}">${S2.sat == null ? '—' : S2.sat + '٪'}</b><small>الرضا العامّ</small></div>
        <div><b style="color:${S2.nps == null ? '#8E8E93' : S2.nps >= 30 ? '#34C759' : S2.nps >= 0 ? '#FF9500' : '#FF3B30'}">${S2.nps == null ? '—' : (S2.nps > 0 ? '+' : '') + S2.nps}</b><small>صافي التوصية</small></div></div>
      ${v.audience === 'students' && rows.length ? `<div class="sv-stages">${Object.entries(S2.byStage).map(([g, n]) => `<span style="--tc:${snStageColor(g)}"><i></i>${esc(g)} ${n}</span>`).join('')}</div>` : ''}</div>
    ${rows.length ? `<div class="sv-res">${(v.questions || []).map(q => snSvQRes(q, S2.out[q.id] || { n: 0 })).join('')}</div>
      <p class="ws-note"><i data-lucide="badge-check"></i> <span>قياس الرضا ونشر نتائجه سنويّاً بند في معيار الشفافية (٧ درجات). اطبع التقرير وانشره في «وثائق الحوكمة» بموقع الجمعيّة، ثمّ <button type="button" class="r-linkbtn" onclick="snSvComply()">سجّله في الامتثال</button>.</span></p>`
      : `<div class="card">${rEmpty('inbox', v.status === 'draft' ? 'راجع الأسئلة ثمّ اضغط «افتح الاستبيان».' : v.audience === 'parents' ? 'أرسل الرابط لأولياء الأمور — تظهر النتائج هنا فور وصولها.' : 'يظهر الآن في «جوّالي». تظهر النتائج هنا فور وصولها.', '')}</div>`}`;
}
function snSvQRes(q, r) {
  const bar = (label, n, tot, c) => `<div class="sv-bar"><span>${esc(label)}</span><i><u style="width:${tot ? Math.round(n / tot * 100) : 0}%;${c ? 'background:' + c : ''}"></u></i><b>${n}</b></div>`;
  let body = '';
  if (q.t === 'stars') body = `<div class="sv-big">${r.n ? r.avg.toFixed(1) : '—'}<small> / ٥</small> <span class="sv-stars" aria-hidden="true">${'★'.repeat(Math.round(r.avg || 0))}${'☆'.repeat(5 - Math.round(r.avg || 0))}</span></div>${[5, 4, 3, 2, 1].map(k => bar(k + ' ★', r.dist ? r.dist[k - 1] : 0, r.n, '#FFCC00')).join('')}`;
  else if (q.t === 'nps') body = `<div class="sv-big">${r.nps == null ? '—' : (r.nps > 0 ? '+' : '') + r.nps}<small> صافي التوصية</small></div>${bar('ينصحون (٩–١٠)', r.pro || 0, r.n, '#34C759')}${bar('محايدون (٧–٨)', r.pas || 0, r.n, '#C7C7CC')}${bar('لا ينصحون (٠–٦)', r.det || 0, r.n, '#FF3B30')}`;
  else if (q.t === 'choice') body = Object.entries(r.c || {}).sort((a, b) => b[1] - a[1]).map(([o, n]) => bar(o, n, r.n)).join('');
  else body = (r.texts || []).length ? `<ul class="sv-texts">${r.texts.slice(-60).reverse().map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="r-sub">لا ردود نصّيّة.</p>';
  return `<div class="card sv-q"><h3>${esc(q.l)}</h3><small class="r-sub">${SN_SV_T[q.t]} · ${r.n} ردّ</small>${body}</div>`;
}
function snSvPrint(id) {
  const v = SN.surveys.find(x => x.id === id), rows = SN.svAns[id] || [], S2 = snSvStats(v, rows), s = snSeason();
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  const org = (typeof SAAS_ORG !== 'undefined' && SAAS_ORG && SAAS_ORG.name) || CONFIG.companyName || '';
  const q = (v.questions || []).map(x => { const r = S2.out[x.id] || {};
    const val = x.t === 'stars' ? `${r.n ? r.avg.toFixed(1) : '—'} من ٥ (${r.n} ردّ)` : x.t === 'nps' ? `${r.nps == null ? '—' : r.nps} — ينصحون ${r.pro || 0}، محايدون ${r.pas || 0}، لا ينصحون ${r.det || 0}`
      : x.t === 'choice' ? Object.entries(r.c || {}).sort((a, b) => b[1] - a[1]).map(([o, n]) => `${esc(o)}: ${n}`).join(' · ') : `${(r.texts || []).length} ردّاً نصّيّاً`;
    return `<tr><td>${esc(x.l)}</td><td>${val}</td></tr>`; }).join('');
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(v.title)}</title><style>body{font-family:system-ui,-apple-system,sans-serif;margin:40px;color:#1d1d1f}h1{margin:0 0 4px}p{color:#555}table{width:100%;border-collapse:collapse;margin-top:20px}td{border-bottom:1px solid #ddd;padding:10px;vertical-align:top}td:first-child{width:45%;font-weight:600}.k{display:flex;gap:30px;margin:20px 0}.k b{font-size:28px;display:block}</style></head><body>
    <h1>${esc(v.title)}</h1><p>${esc(org)} · ${esc(s ? s.name : '')} · ${SN_SV_AUD[v.audience]} · ${fmtD(today())}</p>
    <div class="k"><div><b>${rows.length}</b>إجابة</div><div><b>${S2.sat == null ? '—' : S2.sat + '٪'}</b>الرضا العامّ</div><div><b>${S2.nps == null ? '—' : S2.nps}</b>صافي التوصية</div></div>
    <table>${q}</table><p style="margin-top:30px;font-size:12px">الرضا العامّ = متوسّط أسئلة النجوم ÷ ٥. صافي التوصية = نسبة من أعطوا ٩–١٠ ناقص نسبة من أعطوا ٠–٦. الإجابات بلا أسماء.</p></body></html>`);
  w.document.close(); setTimeout(() => w.print(), 300);
}
async function snSvComply() {
  const d = (((typeof SAAS_ORG !== 'undefined' && SAAS_ORG) || {}).profile || {}).disclosure || {};
  if (d.surveys && d.surveys.done) { rToast('مسجّل في الامتثال لهذا العام'); return; }
  if (typeof cxToggle === 'function') await cxToggle('surveys');
}
/* نسخة تجريبيّة: إجابات معقولة (أغلبها راضٍ) لترى شكل النتائج */
async function snSvDemo(id) {
  const v = SN.surveys.find(x => x.id === id), stages = ['ابتدائي', 'متوسط', 'ثانوي'], pool = v.audience === 'students' ? SN.members.length : v.audience === 'staff' ? SN.staff.length : 0, n = pool ? Math.max(3, Math.round(pool * .8)) : 24;
  const texts = ['رحلات أكثر', 'مسابقة حروف كلّ أسبوع', 'وقت أطول للرياضة', 'الميسّرون رائعون', 'وجبات أفضل', 'دورة تصوير', 'أكثر شيء حبّيته الأجواء'];
  const pick = a => a[Math.floor(Math.random() * a.length)], w = () => { const r = Math.random(); return r < .55 ? 5 : r < .85 ? 4 : r < .95 ? 3 : 2; };
  for (let i = 0; i < n; i++) {
    const a = {}; (v.questions || []).forEach(q => { if (q.t === 'stars') a[q.id] = w(); else if (q.t === 'nps') a[q.id] = Math.min(10, w() * 2 - Math.floor(Math.random() * 2)); else if (q.t === 'choice') a[q.id] = pick(q.o || ['']); else if (Math.random() < .5) a[q.id] = pick(texts); });
    const mem = v.audience === 'students' ? SN.members[i] : null;
    SN.svAns[id].push(await RDB.insert('season_survey_answers', { survey_id: id, stage: v.audience === 'students' ? ((mem && mem.stage) || pick(stages)) : v.audience === 'staff' ? 'جامعي' : 'وليّ أمر', answers: a }));
  }
  snPaint();
}
