/* admin.js — لوحة إدارة المسابقة على غلاف «نظام الجمعيات الشبابية» نفسه
 * ─────────────────────────────────────────────────────────────────────────
 * الشكل كلّه من ui/charity.css (منسوخ من النظام): القائمة الجانبيّة، الشريط العلويّ، الشريط السفليّ (Dock)،
 * الخلفيّة، والمكوّنات بأصنافها الأصليّة: r-page، page-head، r-kpis، card r-card، r-act، r-table، r-tabs،
 * r-seg، r-list، r-item، r-member، r-dept-row، modal… — هنا المنطق والمحتوى فقط.
 */
window.adminMain = () => {
  let S = DB.load();
  const ROLES = {
    admin:   { name: 'مدير المسابقة',    role: 'الإدارة',            c: '#0E5A4A', pages: ['home', 'desktop', 'people', 'tracks', 'groups', 'exams', 'judging', 'results', 'reports', 'setup'] },
    sci:     { name: 'اللجنة العلميّة',  role: 'الإشراف العلميّ',    c: '#A47B2C', pages: ['home', 'desktop', 'people', 'tracks', 'exams', 'judging', 'results', 'reports'] },
    judge:   { name: 'محكّم',            role: 'لجان التحكيم',       c: '#5E5CE6', pages: ['judging', 'results'] },
    teacher: { name: 'محفّظ',            role: 'التحفيظ والمتابعة',  c: '#0A84FF', pages: ['groups', 'exams'] },
  };
  const PAGES = {
    home:    { t: 'الرئيسية',         i: 'home',            g: '',         app: 'home' },
    desktop: { t: 'المكتب',           i: 'layout-grid',     g: '',         app: 'desktop' },
    people:  { t: 'المشاركون',        i: 'users',           g: 'المسابقة', app: 'beneficiaries' },
    tracks:  { t: 'المسارات',         i: 'route',           g: 'المسابقة', app: 'orgfile' },
    groups:  { t: 'المجموعات',        i: 'shapes',          g: 'المسابقة', app: 'team' },
    exams:   { t: 'الاختبارات',       i: 'clipboard-check', g: 'التقييم',  app: 'tasks' },
    judging: { t: 'التحكيم',          i: 'scale',           g: 'التقييم',  app: 'governance' },
    results: { t: 'النتائج والترشيح', i: 'trophy',          g: 'التقييم',  app: 'season' },
    reports: { t: 'التقارير',         i: 'bar-chart-3',     g: 'التوثيق',  app: 'library' },
    setup:   { t: 'الإعدادات',        i: 'settings',        g: 'foot',     app: 'comply' },
  };
  const DOCK = ['people', 'groups', 'exams', 'judging', 'results'];
  let role = SS.get('ms_role') || 'admin';
  const pageOf = h => PAGES[h] ? h : 'home';
  let page = pageOf(location.hash.slice(1));
  const ui = { q: '', track: '', gender: '', status: '', sel: new Set(), exam: 'e1', exTrack: '', exGroup: '', jGender: 'm', jTrack: '', rTrack: 1 };
  const M = () => $('#main');
  const cardify = () => $$('#main table.r-table').forEach(tb => { const hs = $$('thead th', tb).map(th => th.textContent.trim()); $$('tbody tr', tb).forEach(tr => [...tr.children].forEach((td, i) => td.hasAttribute('data-label') || td.setAttribute('data-label', hs[i] || ''))); });
  const icons = () => { try { window.lucide && lucide.createIcons(); } catch (e) {} cardify(); };

  /* ═════════ أدوات النظام (نفس سلوك نظام الجمعيات) ═════════ */
  function rToast(msg, bad) {
    let t = document.getElementById('rToast'); if (!t) { t = document.createElement('div'); t.id = 'rToast'; document.body.appendChild(t); }
    t.className = 'r-toast' + (bad ? ' bad' : ''); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200);
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }
  function openSheet({ title, body, foot = '', onMount }) {
    $('#modalRoot').innerHTML = `<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(String(title).replace(/<[^>]+>/g, ''))}">
      <div class="ap-grab" aria-hidden="true"></div>
      <div class="modal-head"><h3>${title}</h3><button class="x" type="button" data-x aria-label="إغلاق">×</button></div>
      <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div></div>`;
    const bg = $('#modalRoot .modal-bg');
    bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-x]')) closeModal(); });
    icons(); onMount && onMount(bg, closeModal);
    return closeModal;
  }
  window.UI_ADMIN = { active: true, toast: (m, i) => rToast(m, i === 'x'), sheet: openSheet };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modalRoot .modal-bg')) closeModal(); });

  // المظهر: «تلقائيّ» يتبع إعداد الجهاز (فاتح/داكن) — نفس apApplyDisplay
  const applyLook = () => document.documentElement.classList.toggle('ap-dark', matchMedia('(prefers-color-scheme: dark)').matches);
  applyLook(); try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyLook); } catch (e) {}

  /* ═════════ الدخول ═════════ */
  const enter = () => { $('#loginView').classList.add('hidden'); $('#appShell').classList.remove('hidden'); SS.set('ms_in', '1'); render(); };
  $('#btnDemo').onclick = enter;
  $('#btnLogin').onclick = () => CONFIG.demo ? enter() : ($('#loginErr').textContent = 'يُفعَّل الدخول بالحسابات عند ربط قاعدة البيانات');
  $('#logout').onclick = () => { SS.del('ms_in'); $('#appShell').classList.add('hidden'); $('#loginView').classList.remove('hidden'); };
  $('#navSetup').onclick = () => go('setup');
  if (IN_ARTIFACT) { const a = $('#toSite'); a.href = '#top'; a.removeAttribute('target'); }
  $('#ctDate').textContent = new Date().toLocaleDateString('ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#menuToggle').onclick = () => {
    const sb = $('#sidebar'), open = sb.classList.toggle('open');
    if (open) setTimeout(() => { const f = e => { if (!sb.contains(e.target) && !e.target.closest('.menu-toggle')) { sb.classList.remove('open'); document.removeEventListener('click', f, true); } }; document.addEventListener('click', f, true); }, 0);
  };
  $('#sbToggle').onclick = () => $('.shell').classList.toggle('sb-collapsed');
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (!PAGES[h] && h !== 'admin') return; page = pageOf(h); if (!$('#appShell').classList.contains('hidden')) render(); });
  function go(p) { if (location.hash.slice(1) === p) { page = p; render(); } else location.hash = p; }

  /* ═════════ أدوات العرض ═════════ */
  const live = () => S.participants.filter(p => p.status !== 'withdrawn');
  const active = () => S.participants.filter(p => p.status === 'active');
  const grpName = id => { const g = S.groups.find(x => x.id === id); return g ? `${g.gender === 'm' ? 'بنين' : 'بنات'} ${AR(g.n)}` : '—'; };
  const ST = { pending: ['بانتظار الاعتماد', '#FF9F0A'], active: ['معتمد', '#22c55e'], withdrawn: ['منسحب', '#94a3b8'] };
  const chip = (t, c) => `<span class="r-chip" style="--c:${c};flex:none">${t}</span>`;
  const av = (name, c, s = 38) => `<span class="r-av" style="width:${s}px;height:${s}px;font-size:${Math.round(s * .45)}px;--avc:${c};background:${c}22;color:${c}" title="${esc(name)}">${esc(initials(name))}</span>`;
  const gc = p => p.gender === 'm' ? '#0E5A4A' : '#A47B2C';
  const who = p => `<span style="display:flex;align-items:center;gap:10px">${av(p.name, gc(p), 34)}<span><b style="display:block;white-space:nowrap">${esc(p.name)}</b><small class="r-sub num">#${p.no}، ${AR(p.age)} سنة</small></span></span>`;
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 60 ? `قبل ${AR(Math.max(1, m))} د` : m < 1440 ? `قبل ${AR(Math.round(m / 60))} س` : `قبل ${AR(Math.round(m / 1440))} يوم`; };
  const trackOpts = (v, all = 'كلّ المسارات') => `<option value="">${all}</option>` + TRACKS.map(t => `<option value="${t.id}" ${+v === t.id ? 'selected' : ''}>${t.name}</option>`).join('');
  const kpi = (icon, v, t, goTo, sm = false) => `<button class="r-kpi" ${goTo ? `data-go="${goTo}"` : ''}><i data-lucide="${icon}"></i><b class="${sm ? 'sm' : ''} num">${v}</b><span>${t}</span></button>`;
  const head = (t, sub, acts = '') => `<div class="page-head"><div><h1>${t}</h1><p class="r-sub" style="margin:4px 0 0">${sub}</p></div>${acts ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${acts}</div>` : ''}</div>`;
  const empty = (icon, t) => `<div class="r-empty"><i data-lucide="${icon}"></i><p>${t}</p></div>`;
  const save = msg => { DB.save(); if (msg) rToast(msg); };
  const finalists = () => active().filter(p => { const a = stageAvg(S, p); return a != null && a >= S.settings.passMark; });
  const scoreChip = v => v == null ? chip('لم يُختبر', '#94a3b8') : v >= S.settings.passMark ? chip('متقدّم', '#22c55e') : chip('يحتاج دعماً', '#FF9F0A');
  const appImg = k => `<span class="lp-ic ai ai-img"><img src="${window.ASSETS?.[PAGES[k].app] || `ui/apps/${PAGES[k].app}.webp`}" alt="" draggable="false" decoding="async"></span>`;

  /* ═════════ الغلاف: الحساب + القائمة + الشريط السفليّ ═════════ */
  function render() {
    S = DB.load();
    const R = ROLES[role]; if (!R.pages.includes(page)) page = R.pages[0];
    const pend = S.participants.filter(p => p.status === 'pending').length;
    $('#rMe').innerHTML = `<button type="button" class="nv-me" id="meBtn">${av(R.name, R.c, 36)}<span class="nv-me-t"><b>${R.name}</b><small>${R.role}</small></span><i data-lucide="chevron-down"></i></button>`;
    $('#meBtn').onclick = roleSheet;
    let g0 = null, out = '';
    R.pages.filter(k => PAGES[k].g !== 'foot').forEach(k => {
      const P = PAGES[k];
      if (P.g !== g0) { if (g0 !== null) out += '</div>'; if (P.g) out += `<button type="button" class="nv-h" aria-expanded="true">${P.g}<i data-lucide="chevron-down"></i></button>`; out += '<div class="nv-g">'; g0 = P.g; }
      const cnt = k === 'people' && pend ? ` <span class="r-cnt num">${AR(pend)}</span>` : '';
      out += `<a data-v="${k}" class="${k === page ? 'active' : ''}"><span class="nic"><i data-lucide="${P.i}"></i></span><span class="nv-t">${P.t}${cnt}</span></a>`;
    });
    $('#nav').innerHTML = out + '</div>';
    $$('#nav a[data-v]').forEach(a => a.onclick = () => go(a.dataset.v));
    $$('#nav .nv-h').forEach(b => b.onclick = () => { const g = b.nextElementSibling, off = !g.classList.contains('off'); g.classList.toggle('off', off); b.classList.toggle('off', off); b.setAttribute('aria-expanded', String(!off)); });
    $('#navSetup').classList.toggle('hidden', !R.pages.includes('setup'));
    $('#navSetup').classList.toggle('active', page === 'setup');
    $('#ctTitle').textContent = PAGES[page].t;
    const dock = DOCK.filter(k => R.pages.includes(k));
    $('#dkBar').innerHTML = `<div class="dk-dock">${R.pages.includes('desktop') ? `<div class="dk-tile dk-home" role="button" tabindex="0" data-go="desktop" aria-label="المكتب — كلّ التطبيقات"><span class="dk-icw">${appImg('desktop')}</span><span class="dk-name">المكتب</span><span class="dk-tip" aria-hidden="true">المكتب</span></div><span class="dk-sep" aria-hidden="true"></span>` : ''}<div class="dk-dock-apps">${dock.map(k =>
      `<div class="dk-tile" role="button" tabindex="0" data-go="${k}" aria-label="${PAGES[k].t}"><span class="dk-icw">${appImg(k)}${k === 'people' && pend ? `<span class="dk-badge num">${AR(pend)}</span>` : ''}</span><span class="dk-name">${PAGES[k].t}</span><span class="dk-tip" aria-hidden="true">${PAGES[k].t}</span></div>`).join('')}</div></div>`;
    $('#sidebar').classList.remove('open');
    VIEWS[page]();
    bindGo();
    icons();
    window.scrollTo(0, 0);
  }
  const FX = { pending: () => { ui.status = 'pending'; ui.q = ''; }, age: () => { ui.q = '١٠–١٢'; ui.status = ''; } };
  const bindGo = () => $$('#main [data-go], #dkBar [data-go]').forEach(b => b.onclick = () => { const f = b.dataset.fx && FX[b.dataset.fx]; f && f(); go(b.dataset.go); });
  const repaint = v => { VIEWS[v](); bindGo(); icons(); };

  function roleSheet() {
    openSheet({ title: 'تبديل الدور', body: `<p class="r-sub" style="margin-bottom:12px">كلّ دور يرى ما يخصّه فقط. (للتجربة في الوضع التجريبيّ)</p><div class="r-list">${Object.entries(ROLES).map(([k, r]) =>
      `<button class="r-item" data-r="${k}">${av(r.name, r.c, 38)}<span class="r-item-t"><b>${r.name}</b><small>${r.pages.map(p => PAGES[p].t).join('، ')}</small></span>${k === role ? chip('الحاليّ', '#22c55e') : ''}<i data-lucide="chevron-left"></i></button>`).join('')}</div>`,
      onMount: (el, close) => $$('[data-r]', el).forEach(b => b.onclick = () => { role = b.dataset.r; SS.set('ms_role', role); close(); page = ROLES[role].pages[0]; go(page); }) });
  }

  /* ═════════ الصفحات ═════════ */
  const VIEWS = {
    home() {
      const all = live(), pend = S.participants.filter(p => p.status === 'pending'), wd = S.participants.filter(p => p.status === 'withdrawn').length;
      const target = TRACKS.reduce((a, t) => a + t.target, 0), stage = S.exams.filter(e => e.kind === 'stage');
      const done = stage.filter(e => Object.keys(S.scores[e.id] || {}).length).length, noT = S.groups.filter(g => !g.teacher).length, ageQ = S.participants.filter(p => p.note).length;
      const h = new Date().getHours(), R = ROLES[role];
      const act = (n, icon, t, s, goTo, fx) => n ? `<button class="r-act" data-go="${goTo}" ${fx ? `data-fx="${fx}"` : ''}><i data-lucide="${icon}"></i><span><b>${t}</b><small>${s}</small></span><i data-lucide="chevron-left"></i></button>` : '';
      const acts = [act(pend.length, 'stamp', `اعتماد ${AR(pend.length)} تسجيلاً جديداً`, 'تسجيلات من صفحة المسابقة بانتظار المراجعة', 'people', 'pending'),
        act(noT, 'user-plus', `تعيين محفّظين لـ${AR(noT)} مجموعة`, 'مجموعات بلا محفّظ مسؤول', 'groups'),
        act(ageQ, 'help-circle', `قرار مسار ${AR(ageQ)} مشاركاً بعمر ١٠–١٢`, 'الوثيقة لا تحدّد مساراً لهذه الأعمار — للّجنة العلميّة', 'people', 'age'),
        act(stage.length - done, 'clipboard-check', `${AR(stage.length - done)} اختبار مرحليّ لم تُرصد درجاته`, 'المؤشّر: ٣ اختبارات إلكترونيّة على الأقلّ', 'exams')].filter(Boolean);
      const latest = [...S.participants].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
      M().innerHTML = `<div class="r-page">
        <div class="r-hello"><div><h1>${h < 12 ? 'صباح الخير' : 'مساء الخير'}</h1><p>${R.name}، ${CONFIG.short}: ${CONFIG.phases[1].name}</p></div>
          <div class="r-quick"><button class="btn btn-gold btn-sm" id="qAdd"><i data-lucide="user-plus"></i> مشارك</button><button class="btn btn-ghost btn-sm" data-go="exams"><i data-lucide="clipboard-check"></i> رصد درجات</button><button class="btn btn-ghost btn-sm" data-go="judging"><i data-lucide="scale"></i> تحكيم</button><button class="btn btn-ghost btn-sm" data-go="reports"><i data-lucide="bar-chart-3"></i> تقرير</button></div></div>
        ${CONFIG.demo ? `<div class="r-demo-note"><i data-lucide="flask-conical"></i><div><b>الوضع التجريبي.</b> المنصّة غير مربوطة بقاعدة بيانات بعد؛ البيانات وهميّة وما تضيفه يُحفظ في هذا المتصفح فقط. جرّب الأدوار من الحساب أعلى الشريط الجانبي. <button class="link-btn" id="demoReset">إعادة البيانات التجريبية</button></div></div>` : ''}
        <div class="r-kpis">${kpi('users', AR(all.length), `مسجّلاً من ${AR(target)} مستهدف`, 'people')}${kpi('stamp', AR(pend.length), 'بانتظار الاعتماد', 'people')}${kpi('flag', `${AR(pct(all.length, all.length + wd))}٪`, 'نسبة الاستمرار (المستهدف ٧٠٪)', 'reports')}${kpi('clipboard-check', `${AR(done)} / ${AR(stage.length)}`, 'اختبارات مرحليّة منفّذة', 'exams')}</div>
        <div class="r-grid2">
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="bell-ring"></i> يحتاج إجراءك</h3><span class="r-cnt">${AR(acts.length)}</span></div>${acts.join('') || empty('check-circle', 'لا شيء بانتظارك الآن')}</div>
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="user-plus"></i> آخر التسجيلات</h3><button class="link-btn" data-go="people">الكل</button></div>
            ${latest.map(p => `<button class="r-task-line" data-pid="${p.id}"><span class="r-prio" style="background:${TRACK(p.track).color}"></span><span class="r-tl-t"><b>${esc(p.name)}</b><small>${TRACK(p.track).name}</small></span><span class="r-due">${ago(p.createdAt)}</span></button>`).join('')}</div>
        </div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="route"></i> التسجيل في المسارات</h3><button class="link-btn" data-go="tracks">كلّ المسارات</button></div>
          ${TRACKS.map(t => { const m = all.filter(p => p.track === t.id && p.gender === 'm').length, f = all.filter(p => p.track === t.id && p.gender === 'f').length, rest = Math.max(0, t.target - m - f);
            return `<div class="r-dept-row"><div class="r-dept-n"><span class="r-dot" style="background:${t.color}"></span>${t.name} <span class="r-sub num">${AR(m + f)} / ${AR(t.target)}</span></div>
              <div class="r-bar">${m ? `<span style="flex:${m};background:#0E5A4A" title="ذكور: ${m}">${AR(m)}</span>` : ''}${f ? `<span style="flex:${f};background:#C79A45" title="إناث: ${f}">${AR(f)}</span>` : ''}${rest ? `<span style="flex:${rest};background:#94a3b833" title="المتبقّي: ${rest}"></span>` : ''}</div></div>`; }).join('')}
          <div class="r-legend"><span><i style="background:#0E5A4A"></i>ذكور</span><span><i style="background:#C79A45"></i>إناث</span><span><i style="background:#94a3b8"></i>المتبقّي للمستهدف</span></div></div>
      </div>`;
      $('#qAdd').onclick = () => personSheet(null);
      $('#demoReset') && ($('#demoReset').onclick = () => { S = DB.reset(); rToast('أُعيدت البيانات التجريبيّة'); render(); });
      $$('[data-pid]').forEach(b => b.onclick = () => personSheet(b.dataset.pid));
    },

    desktop() {
      const R = ROLES[role];
      M().innerHTML = `<div class="desk"><div class="desk-head"><div><h1>المكتب</h1><p>كلّ تطبيقات المسابقة في مكان واحد — اختر تطبيقاً للدخول إليه.</p></div></div>
        <div class="lp-grid desk-grid">${R.pages.filter(k => k !== 'desktop').map(k => `<button class="lp-tile" type="button" data-go="${k}">${appImg(k)}<span class="lp-name">${PAGES[k].t}</span></button>`).join('')}</div></div>`;
    },

    people() {
      const rows = S.participants.filter(p => (!ui.track || p.track === +ui.track) && (!ui.gender || p.gender === ui.gender) && (!ui.status || p.status === ui.status) &&
        (!ui.q || (ui.q === '١٠–١٢' ? !!p.note : (p.name + p.phone + p.email + p.no).includes(ui.q)))).sort((a, b) => b.createdAt - a.createdAt);
      const cnt = s => S.participants.filter(p => p.status === s).length;
      M().innerHTML = `<div class="r-page">${head('المشاركون', `${AR(S.participants.length)} مسجّلاً — التسجيلات تصل من صفحة المسابقة وتُعتمد هنا`,
        `<button class="btn btn-ghost" id="waAll"><i data-lucide="message-circle"></i> واتساب</button><button class="btn btn-ghost" id="exp"><i data-lucide="download"></i> ${IN_ARTIFACT ? 'نسخ الجدول' : 'تصدير Excel'}</button><button class="btn btn-gold" id="add"><i data-lucide="user-plus"></i> إضافة مشارك</button>`)}
        <div class="r-tabs">${[['', 'الكل', S.participants.length], ['pending', 'بانتظار الاعتماد', cnt('pending')], ['active', 'معتمد', cnt('active')], ['withdrawn', 'منسحب', cnt('withdrawn')]].map(([k, t, n]) =>
          `<button class="${ui.status === k ? 'on' : ''}" data-st="${k}">${t} <span class="r-cnt num">${AR(n)}</span></button>`).join('')}</div>
        <div class="r-filters" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input id="q" placeholder="بحث بالاسم أو الجوّال أو الرقم" value="${esc(ui.q)}" style="flex:1;min-width:200px">
          <select id="ft" style="width:auto">${trackOpts(ui.track)}</select>
          <div class="r-seg"><button class="${!ui.gender ? 'on' : ''}" data-g="">الجنسين</button><button class="${ui.gender === 'm' ? 'on' : ''}" data-g="m">ذكور</button><button class="${ui.gender === 'f' ? 'on' : ''}" data-g="f">إناث</button></div></div>
        ${ui.sel.size ? `<div class="r-demo-note" style="align-items:center"><i data-lucide="check-check"></i><div><b class="num">${AR(ui.sel.size)} محدّد.</b> <button class="btn btn-gold btn-sm" id="bulkOk"><i data-lucide="stamp"></i> اعتماد</button> <button class="btn btn-ghost btn-sm" id="bulkWa"><i data-lucide="message-circle"></i> واتساب</button> <button class="link-btn" id="bulkClr">إلغاء التحديد</button></div></div>` : ''}
        <div class="card" style="padding:0;overflow:auto">${rows.length ? `<table class="r-table"><thead><tr><th style="width:36px"><input type="checkbox" id="all" style="width:18px;height:18px"></th><th>المشارك</th><th>المسار</th><th>المجموعة</th><th>الجوّال</th><th>الحالة</th><th>المعدّل</th></tr></thead><tbody>
          ${rows.slice(0, 300).map(p => { const t = TRACK(p.track), a = stageAvg(S, p); return `<tr data-id="${p.id}" style="cursor:pointer">
            <td><input type="checkbox" data-sel="${p.id}" ${ui.sel.has(p.id) ? 'checked' : ''} style="width:18px;height:18px"></td><td>${who(p)}</td>
            <td>${chip(t.name, t.color)}${p.note ? ' ' + chip('قرار اللجنة', '#A47B2C') : ''}</td><td>${grpName(p.group)}</td><td class="num" dir="ltr" style="text-align:right">${esc(p.phone)}</td>
            <td>${chip(...ST[p.status])}</td><td class="num">${a == null ? '—' : AR(a)}</td></tr>`; }).join('')}</tbody></table>` : empty('users', 'لا نتائج — غيّر البحث أو الفلتر')}</div></div>`;
      const re = () => repaint('people');
      $('#q').oninput = e => { ui.q = e.target.value; clearTimeout(re.t); re.t = setTimeout(() => { re(); const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 300); };
      $('#ft').onchange = e => { ui.track = e.target.value; re(); };
      $$('[data-st]').forEach(b => b.onclick = () => { ui.status = b.dataset.st; re(); });
      $$('[data-g]').forEach(b => b.onclick = () => { ui.gender = b.dataset.g; re(); });
      $('#all') && ($('#all').onchange = e => { rows.forEach(p => e.target.checked ? ui.sel.add(p.id) : ui.sel.delete(p.id)); re(); });
      $$('[data-sel]').forEach(c => { c.onclick = e => e.stopPropagation(); c.onchange = () => { c.checked ? ui.sel.add(c.dataset.sel) : ui.sel.delete(c.dataset.sel); re(); }; });
      $('#bulkOk') && ($('#bulkOk').onclick = () => { let n = 0; ui.sel.forEach(id => { const p = S.participants.find(x => x.id === id); if (p && p.status === 'pending') { p.status = 'active'; n++; } }); ui.sel.clear(); DB.addLog(`اعتماد ${n} تسجيلاً`); save(`اعتُمد ${AR(n)} مشاركاً`); render(); });
      $('#bulkWa') && ($('#bulkWa').onclick = () => waSheet([...ui.sel]));
      $('#waAll').onclick = () => waSheet(rows.map(p => p.id));
      $('#bulkClr') && ($('#bulkClr').onclick = () => { ui.sel.clear(); re(); });
      $$('tr[data-id]').forEach(tr => tr.onclick = () => personSheet(tr.dataset.id));
      $('#exp').onclick = exportPeople; $('#add').onclick = () => personSheet(null);
    },

    tracks() {
      const all = live();
      M().innerHTML = `<div class="r-page">${head('المسارات', 'ستّة مسارات حسب العمر والقدرة اللغويّة ومستوى الحفظ — يشارك كلّ متسابق في مسار واحد')}
        <div class="r-org">${TRACKS.map(t => { const list = all.filter(p => p.track === t.id), m = list.filter(p => p.gender === 'm').length;
          return `<div class="card r-card"><div class="r-card-h"><h3><span class="r-dot" style="background:${t.color}"></span>${t.name}</h3><span class="r-sub">${t.who}</span></div>
            <div class="r-dept-row"><div class="r-dept-n">${t.plan}</div><div class="r-bar"><span style="flex:${Math.max(1, list.length)};background:${t.color}">${AR(list.length)}</span>${t.target > list.length ? `<span style="flex:${t.target - list.length};background:#94a3b833"></span>` : ''}</div></div>
            <button class="r-member" data-t="${t.id}"><span class="r-thumb"><i data-lucide="users"></i></span><span><b class="num">${AR(list.length)} من ${AR(t.target)} مستهدف</b><small>${AR(m)} ذكور، ${AR(list.length - m)} إناث، ${AR(S.groups.filter(g => g.track === t.id).length)} مجموعات</small><small>التقييم: ${t.exam}</small></span>${chip(AR(t.amount) + ' حديثاً', t.color)}</button></div>`; }).join('')}</div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="shield-check"></i> ضوابط تنظيم المسارات</h3><span class="r-sub">من ملحق وثيقة المسابقة</span></div>
          ${['المستهدف لكلّ مسار عدد تقريبيّ إجماليّ من الجنسين، والأعمار تقديريّة للتخطيط.', 'يحدّد المسار بحسب العمر والقدرة اللغويّة ومستوى الحفظ، ويشارك كلّ متسابق في مسار واحد.', 'يجوز للمؤهّلين من كبار السنّ والجاليات الالتحاق بمساري الحفظ الكامل أو المتميّزين.', 'تعتمد اللجنة العلميّة الأحاديث المختارة ونسخة موحّدة لمقرّرات الحفظ قبل الإعلان.', `التحفيظ في مجموعات بمتوسّط ${AR(S.settings.groupSize)} مشاركاً، بتنظيم مستقلّ للذكور والإناث.`]
            .map(x => `<div class="r-act" style="cursor:default"><i data-lucide="check"></i><span><b style="font-weight:500">${x}</b></span></div>`).join('')}
          <div class="r-act" style="cursor:default"><i data-lucide="triangle-alert" style="color:var(--warn)"></i><span><b>أعمار ١٠–١٢ غير مذكورة في الوثيقة</b><small>تُفرز مؤقّتاً على «الأطفال والناشئة» بانتظار قرار اللجنة العلميّة.</small></span></div></div></div>`;
      $$('[data-t]').forEach(b => b.onclick = () => { ui.track = b.dataset.t; ui.status = ''; ui.q = ''; go('people'); });
    },

    groups() {
      const gs = S.groups.filter(g => !ui.track || g.track === +ui.track);
      M().innerHTML = `<div class="r-page">${head('المجموعات', `${AR(S.groups.length)} مجموعة بمتوسّط ${AR(S.settings.groupSize)} مشاركاً — الذكور والإناث منفصلون`,
        role === 'admin' ? `<button class="btn btn-ghost" id="redo"><i data-lucide="wand-2"></i> إعادة التوزيع الآليّ</button>` : '')}
        <div class="r-filters"><select id="gt" style="width:auto">${trackOpts(ui.track)}</select></div>
        <div class="r-org">${gs.map(g => { const mem = S.participants.filter(p => p.group === g.id && p.status !== 'withdrawn'), t = TRACK(g.track);
          return `<div class="card r-card"><div class="r-card-h"><h3><span class="r-dot" style="background:${t.color}"></span>${t.name}، المجموعة ${AR(g.n)}</h3>${chip(g.gender === 'm' ? 'بنين/رجال' : 'بنات/نساء', g.gender === 'm' ? '#0E5A4A' : '#A47B2C')}</div>
            <button class="r-member" data-g="${g.id}">${g.teacher ? av(g.teacher, t.color) : '<span class="r-thumb"><i data-lucide="user-plus"></i></span>'}<span><b>${g.teacher ? esc(g.teacher) : 'بلا محفّظ'}</b><small class="num">${AR(mem.length)} مشاركاً</small></span>${g.teacher ? chip('مُسند', '#22c55e') : chip('عيّن محفّظاً', '#FF9F0A')}</button></div>`; }).join('')}</div></div>`;
      $('#gt').onchange = e => { ui.track = e.target.value; repaint('groups'); };
      $('#redo') && ($('#redo').onclick = () => { autoGroups(S); DB.addLog('أُعيد توزيع المجموعات آلياً'); save('أُعيد التوزيع'); render(); });
      $$('[data-g]').forEach(c => c.onclick = () => groupSheet(c.dataset.g));
    },

    exams() {
      const ex = S.exams.filter(e => e.kind === 'stage'); if (!ex.find(e => e.id === ui.exam)) ui.exam = ex[0].id;
      const e = S.exams.find(x => x.id === ui.exam), sc = S.scores[e.id] ||= {};
      const pool = active().filter(p => (!ui.exTrack || p.track === +ui.exTrack) && (!ui.exGroup || p.group === ui.exGroup));
      const filled = pool.filter(p => sc[p.id] != null).length, groupsOf = S.groups.filter(g => !ui.exTrack || g.track === +ui.exTrack);
      M().innerHTML = `<div class="r-page">${head('الاختبارات المرحليّة', `رصد درجات الاختبارات (من ١٠٠) ومتابعة التقدّم — درجة التأهّل للتصفيات ${AR(S.settings.passMark)}`,
        `<button class="btn btn-ghost" id="exExp"><i data-lucide="download"></i> ${IN_ARTIFACT ? 'نسخ الدرجات' : 'تصدير الدرجات'}</button>`)}
        <div class="r-tabs">${ex.map(x => `<button class="${x.id === e.id ? 'on' : ''}" data-ex="${x.id}"><i data-lucide="clipboard-check"></i>${x.name} <span class="r-cnt num">${AR(Object.keys(S.scores[x.id] || {}).length)}</span></button>`).join('')}</div>
        <div class="r-filters" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select id="et" style="width:auto">${trackOpts(ui.exTrack)}</select>
          <select id="eg" style="width:auto"><option value="">كلّ المجموعات</option>${groupsOf.map(g => `<option value="${g.id}" ${g.id === ui.exGroup ? 'selected' : ''}>${TRACK(g.track).name}، ${grpName(g.id)}</option>`).join('')}</select>
          <span class="r-sub num" style="margin-inline-start:auto">الأسبوع ${AR(e.week)}، رُصد ${AR(filled)} من ${AR(pool.length)}</span></div>
        <div class="card" style="padding:0;overflow:auto">${pool.length ? `<table class="r-table"><thead><tr><th>المشارك</th><th>المسار</th><th>المجموعة</th><th>الدرجة</th><th>الحالة</th></tr></thead><tbody>
          ${pool.map(p => `<tr><td>${who(p)}</td><td>${TRACK(p.track).name}</td><td>${grpName(p.group)}</td>
            <td><input class="num" inputmode="numeric" data-s="${p.id}" value="${sc[p.id] ?? ''}" placeholder="—" aria-label="درجة ${esc(p.name)}" style="width:76px;text-align:center"></td><td data-stc="${p.id}">${scoreChip(sc[p.id])}</td></tr>`).join('')}
          </tbody></table>` : empty('users', 'لا مشاركين معتمدين في هذا الاختيار')}</div></div>`;
      const re = () => repaint('exams');
      $$('[data-ex]').forEach(b => b.onclick = () => { ui.exam = b.dataset.ex; re(); });
      $('#et').onchange = ev => { ui.exTrack = ev.target.value; ui.exGroup = ''; re(); };
      $('#eg').onchange = ev => { ui.exGroup = ev.target.value; re(); };
      $$('[data-s]').forEach(inp => {
        inp.onchange = () => {
          const raw = inp.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
          if (raw === '') delete sc[inp.dataset.s];
          else { const n = Math.round(+raw); if (isNaN(n)) return rToast('اكتب رقماً من ٠ إلى ١٠٠', true); sc[inp.dataset.s] = Math.max(0, Math.min(100, n)); inp.value = sc[inp.dataset.s]; }
          $(`[data-stc="${inp.dataset.s}"]`).innerHTML = scoreChip(sc[inp.dataset.s]); DB.save();
        };
        inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); const all = $$('[data-s]'); all[all.indexOf(inp) + 1]?.focus(); } };
      });
      $('#exExp').onclick = () => exportTable(`درجات-${e.name}.csv`, [['الرقم', 'الاسم', 'المسار', 'المجموعة', 'الدرجة'], ...pool.map(p => [p.no, p.name, TRACK(p.track).name, grpName(p.group), sc[p.id] ?? ''])]);
    },

    judging() {
      const fin = finalists().filter(p => p.gender === ui.jGender && (!ui.jTrack || p.track === +ui.jTrack));
      const coms = S.committees.filter(c => c.gender === ui.jGender), canEdit = role === 'admin' || role === 'sci';
      M().innerHTML = `<div class="r-page">${head('التحكيم والتصفيات النهائيّة', `${AR(S.committees.length)} لجان تحكيم، محكّمان لكلّ لجنة — يتأهّل من يبلغ معدّله ${AR(S.settings.passMark)} في المرحليّات`)}
        <div class="r-filters" style="display:flex;gap:8px;flex-wrap:wrap"><div class="r-seg"><button class="${ui.jGender === 'm' ? 'on' : ''}" data-jg="m">لجان الرجال</button><button class="${ui.jGender === 'f' ? 'on' : ''}" data-jg="f">لجان النساء</button></div><select id="jt" style="width:auto">${trackOpts(ui.jTrack)}</select></div>
        <div class="r-org">${coms.map(c => `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="scale"></i> ${c.name}</h3></div>
          ${c.judges.map((j, k) => `<div class="field" style="margin:0 0 8px"><label>المحكّم ${k ? 'الثاني' : 'الأوّل'}</label><input data-jd="${c.id}:${k}" value="${esc(j)}" placeholder="اسم المحكّم" ${canEdit ? '' : 'disabled'}></div>`).join('')}</div>`).join('')}</div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="trophy"></i> المتأهّلون للتصفية النهائيّة</h3><span class="r-cnt">${AR(fin.length)}</span></div>
          ${fin.length ? `<div style="overflow:auto"><table class="r-table"><thead><tr><th>المتسابق</th><th>المسار</th><th>معدّل المرحليّات</th>${CONFIG.criteria.map(c => `<th>${c.name} /${AR(c.max)}</th>`).join('')}<th>المجموع</th><th></th></tr></thead><tbody>
          ${fin.map(p => { const f = S.finals[p.id] || {}, tot = finalScore(S, p); return `<tr><td>${who(p)}</td><td>${TRACK(p.track).name}</td><td class="num">${AR(stageAvg(S, p))}</td>
            ${CONFIG.criteria.map(c => `<td class="num">${f[c.key] != null ? AR(f[c.key]) : '—'}</td>`).join('')}<td><b class="num">${tot == null ? '—' : AR(tot)}</b></td>
            <td><button class="btn ${tot == null ? 'btn-gold' : 'btn-ghost'} btn-sm" data-judge="${p.id}">${tot == null ? 'تحكيم' : 'تعديل'}</button></td></tr>`; }).join('')}</tbody></table></div>` : empty('trophy', 'لا متأهّلين بعد في هذا الاختيار')}</div></div>`;
      $$('[data-jg]').forEach(b => b.onclick = () => { ui.jGender = b.dataset.jg; repaint('judging'); });
      $('#jt').onchange = e => { ui.jTrack = e.target.value; repaint('judging'); };
      $$('[data-jd]').forEach(i => i.onchange = () => { const [cid, k] = i.dataset.jd.split(':'); S.committees.find(c => c.id === cid).judges[+k] = i.value.trim(); save('حُفظ'); });
      $$('[data-judge]').forEach(b => b.onclick = () => judgeSheet(b.dataset.judge));
    },

    results() {
      const t = +ui.rTrack;
      const list = finalists().filter(p => p.track === t).map(p => ({ p, f: finalScore(S, p), a: stageAvg(S, p) })).sort((x, y) => (y.f ?? -1) - (x.f ?? -1) || (y.a ?? 0) - (x.a ?? 0));
      const medal = ['#E9C46A', '#B4B4BA', '#C8875A'];
      M().innerHTML = `<div class="r-page">${head('النتائج والترشيح', 'الترتيب حسب درجة التصفية النهائيّة، ثمّ معدّل الاختبارات المرحليّة',
        `<button class="btn btn-ghost" id="resExp"><i data-lucide="download"></i> ${IN_ARTIFACT ? 'نسخ النتائج' : 'تصدير'}</button>${IN_ARTIFACT ? '' : '<button class="btn btn-ghost" onclick="print()"><i data-lucide="printer"></i> طباعة</button>'}`)}
        <div class="r-tabs">${TRACKS.map(x => `<button class="${x.id === t ? 'on' : ''}" data-rt="${x.id}">${x.name}</button>`).join('')}</div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="trophy"></i> ${TRACK(t).name}</h3><span class="r-cnt">${AR(list.length)}</span></div>
          ${list.length ? `<div class="r-list">${list.map((x, k) => `<button class="r-item" data-pid="${x.p.id}"><span class="r-thumb" style="${x.f != null && k < 3 ? `background:${medal[k]};color:#fff` : ''}"><b class="num">${AR(k + 1)}</b></span>
            <span class="r-item-t"><b>${esc(x.p.name)}</b><small>${x.p.gender === 'm' ? 'بنين/رجال' : 'بنات/نساء'}، معدّل المرحليّات ${AR(x.a)}</small></span>
            ${x.f == null ? `<span class="r-badge" style="--c:#94a3b8">بانتظار التحكيم</span>` : `<span class="r-badge" style="--c:${k < 3 ? '#A47B2C' : '#22c55e'}">${AR(x.f)} — ${k < 3 ? 'فائز' : 'مجتاز'}</span>`}<i data-lucide="chevron-left"></i></button>`).join('')}</div>` : empty('trophy', 'لا متأهّلين في هذا المسار بعد')}</div></div>`;
      $$('[data-rt]').forEach(b => b.onclick = () => { ui.rTrack = +b.dataset.rt; repaint('results'); });
      $$('[data-pid]').forEach(b => b.onclick = () => (role === 'judge' ? judgeSheet : personSheet)(b.dataset.pid));
      $('#resExp').onclick = () => exportTable(`نتائج-${TRACK(t).name}.csv`, [['الترتيب', 'الرقم', 'الاسم', 'الجنس', 'معدّل المرحليّات', 'التصفية النهائيّة'], ...list.map((x, k) => [k + 1, x.p.no, x.p.name, x.p.gender === 'm' ? 'ذكر' : 'أنثى', x.a ?? '', x.f ?? ''])]);
    },

    reports() {
      const all = live(), wd = S.participants.filter(p => p.status === 'withdrawn').length, stage = S.exams.filter(e => e.kind === 'stage');
      const done = stage.filter(e => Object.keys(S.scores[e.id] || {}).length).length, fin = finalists(), judged = fin.filter(p => finalScore(S, p) != null);
      const passed = judged.filter(p => finalScore(S, p) >= S.settings.passMark).length, ret = pct(all.length, all.length + wd);
      const ind = (icon, t, v, tgt, ok) => `<div class="r-act" style="cursor:default"><i data-lucide="${icon}"></i><span><b>${t}</b><small>المستهدف: ${tgt}</small></span>${chip(v, ok == null ? '#94a3b8' : ok ? '#22c55e' : '#FF9F0A')}</div>`;
      const bars = (rows, max) => rows.map(([n, v, c]) => `<div class="r-dept-row"><div class="r-dept-n"><span class="r-dot" style="background:${c}"></span>${n}</div><div class="r-bar"><span style="flex:${Math.max(v, .001)};background:${c}">${AR(v)}</span>${max > v ? `<span style="flex:${max - v};background:#94a3b822"></span>` : ''}</div></div>`).join('');
      const maxT = Math.max(...TRACKS.map(t => all.filter(p => p.track === t.id).length));
      M().innerHTML = `<div class="r-page">${head('التقارير ومؤشّرات الأداء', 'تُبنى منها التقارير الختاميّة للشريك الاستراتيجيّ (مؤسسة الماجد الأهلية)',
        `<button class="btn btn-gold" id="repExp"><i data-lucide="download"></i> ${IN_ARTIFACT ? 'نسخ كامل البيانات' : 'تصدير كامل البيانات'}</button>`)}
        <div class="r-kpis">${kpi('users', AR(all.length), 'مسجّلاً')}${kpi('flag', `${AR(ret)}٪`, 'نسبة الاستمرار')}${kpi('trophy', AR(fin.length), 'متأهّلاً للتصفيات')}${kpi('award', judged.length ? `${AR(pct(passed, judged.length))}٪` : '—', 'نسبة المجتازين للنهائيّ')}</div>
        <div class="r-grid2">
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="gauge"></i> مؤشّرات الأداء وقياس الأثر</h3><span class="r-sub">من وثيقة المشروع</span></div>
            ${ind('users', 'عدد المسجّلين', AR(all.length), '٤٥٠ مشاركاً ومشاركة', all.length >= 450)}
            ${ind('flag', 'نسبة الاستمرار حتى نهاية المشروع', `${AR(ret)}٪`, 'أكثر من ٧٠٪', ret >= 70)}
            ${ind('clipboard-check', 'الاختبارات الإلكترونيّة المنفّذة', AR(done), '٣ اختبارات مرحليّة على الأقلّ', done >= 3)}
            ${ind('award', 'نسبة المجتازين للاختبار النهائيّ', judged.length ? `${AR(pct(passed, judged.length))}٪` : '—', '٧٥٪ من المشاركين المستمرّين', judged.length ? pct(passed, judged.length) >= 75 : null)}</div>
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="history"></i> سجلّ النشاط</h3></div>
            ${S.log.slice(0, 7).map(l => `<div class="r-task-line" style="cursor:default"><span class="r-prio" style="background:var(--accent)"></span><span class="r-tl-t"><b>${esc(l.t)}</b></span><span class="r-due">${ago(l.at)}</span></div>`).join('')}</div></div>
        <div class="r-grid2">
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="route"></i> حسب المسار</h3></div>${bars(TRACKS.map(t => [t.name, all.filter(p => p.track === t.id).length, t.color]), maxT)}</div>
          <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="users"></i> حسب الجنس والعمر</h3></div>${bars([['ذكور', all.filter(p => p.gender === 'm').length, '#0E5A4A'], ['إناث', all.filter(p => p.gender === 'f').length, '#C79A45'],
            ['أقلّ من ١٣', all.filter(p => p.age < 13).length, '#0A84FF'], ['١٣–٥٩', all.filter(p => p.age >= 13 && p.age < 60).length, '#5E5CE6'], ['٦٠ فأكثر', all.filter(p => p.age >= 60).length, '#AC7F5E'],
            ['غير الناطقين بالعربية', all.filter(p => p.arabic === 'no').length, '#30B0C7']], all.length)}</div></div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="chart-line"></i> متوسّط الاختبارات المرحليّة</h3></div>${bars(stage.map(e => { const v = Object.values(S.scores[e.id] || {}); return [e.name, v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0, '#0E5A4A']; }), 100)}</div></div>`;
      $('#repExp').onclick = exportPeople;
    },

    setup() {
      M().innerHTML = `<div class="r-page">${head('الإعدادات', 'إعدادات المسابقة العامّة')}
        <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3><i data-lucide="sliders-horizontal"></i> المسابقة</h3></div>
          <div class="r-act" style="cursor:default"><i data-lucide="door-open"></i><span><b>التسجيل مفتوح</b><small>إيقافه يغلق صفحة التسجيل العامّة</small></span><input type="checkbox" id="sOpen" ${S.settings.regOpen ? 'checked' : ''} style="width:22px;height:22px"></div>
          <div class="field"><label>درجة التأهّل للتصفيات (من ١٠٠)</label><input id="sPass" type="number" value="${S.settings.passMark}"></div>
          <div class="field"><label>متوسّط حجم المجموعة</label><input id="sSize" type="number" value="${S.settings.groupSize}"></div></div>
        <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="map-pin"></i> المراكز</h3><span class="r-sub">تظهر في نموذج التسجيل</span></div>
          <div class="field"><label>مركز في كلّ سطر</label><textarea id="sCenters" rows="6">${esc(S.settings.centers.join('\n'))}</textarea></div>
          <p class="r-sub">تُضاف أسماء مراكز محافظة ثادق من الجمعيّة.</p></div></div>
        <button class="btn btn-gold" id="sSave"><i data-lucide="save"></i> حفظ الإعدادات</button></div>`;
      $('#sSave').onclick = () => {
        S.settings.regOpen = $('#sOpen').checked; S.settings.passMark = Math.max(1, Math.min(100, +$('#sPass').value || 70));
        S.settings.groupSize = Math.max(5, Math.min(60, +$('#sSize').value || 25));
        S.settings.centers = $('#sCenters').value.split('\n').map(s => s.trim()).filter(Boolean); if (!S.settings.centers.length) S.settings.centers = ['ثادق'];
        DB.addLog('تحديث الإعدادات'); save('حُفظت الإعدادات');
      };
    },
  };

  /* ═════════ النوافذ ═════════ */
  function personSheet(id) {
    const isNew = !id;
    const p = isNew ? { id: uid(), no: null, name: '', gender: 'm', age: '', arabic: 'yes', nationality: 'سعودي', phone: '', email: '', center: S.settings.centers[0], track: 4, status: 'active', group: null, createdAt: Date.now(), verified: false, memorized: 0, goal: '42' } : S.participants.find(x => x.id === id);
    const opt = (v, cur, t) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${t}</option>`;
    const row2 = (a, b) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${a}${b}</div>`;
    openSheet({
      title: isNew ? 'إضافة مشارك' : esc(p.name),
      body: `<div class="field"><label>الاسم</label><input id="pName" value="${esc(p.name)}"></div>
        ${row2(`<div class="field"><label>الجنس</label><select id="pG">${opt('m', p.gender, 'ذكر')}${opt('f', p.gender, 'أنثى')}</select></div>`, `<div class="field"><label>العمر</label><input id="pAge" type="number" value="${esc(p.age)}"></div>`)}
        ${row2(`<div class="field"><label>الجوّال</label><input id="pPh" dir="ltr" style="text-align:right" value="${esc(p.phone)}"></div>`, `<div class="field"><label>البريد</label><input id="pEm" dir="ltr" style="text-align:right" value="${esc(p.email)}"></div>`)}
        <div class="field"><label>الجنسيّة</label><input id="pNat" value="${esc(p.nationality)}"></div>
        ${row2(`<div class="field"><label>المسار</label><select id="pT">${TRACKS.map(t => opt(t.id, p.track, t.name)).join('')}</select></div>`, `<div class="field"><label>الحالة</label><select id="pS">${Object.entries(ST).map(([k, [t]]) => opt(k, p.status, t)).join('')}</select></div>`)}
        ${p.note ? `<div class="r-demo-note"><i data-lucide="triangle-alert"></i><div>${esc(p.note)}</div></div>` : ''}
        ${isNew ? '' : `<p class="r-sub" style="margin:6px 0">المجموعة: ${grpName(p.group)}، مسجّل ${fmtDate(p.createdAt)}${p.guardian ? '، وليّ الأمر: ' + esc(p.guardian) : ''}</p>
          ${S.exams.filter(e => e.kind === 'stage').map(e => { const v = S.scores[e.id]?.[p.id]; return `<div class="r-act" style="cursor:default"><i data-lucide="clipboard-check"></i><span><b>${e.name}</b><small class="num">${v == null ? 'لم يُختبر' : 'الدرجة ' + AR(v)}</small></span>${scoreChip(v)}</div>`; }).join('')}`}`,
      foot: `${isNew ? '' : '<button class="btn btn-ghost" id="mDel" type="button">حذف</button><button class="btn btn-ghost" id="mWa" type="button"><i data-lucide="message-circle"></i> واتساب</button>'}<button class="btn btn-gold" id="mSave" type="button">حفظ</button>`,
      onMount: (el, close) => {
        $('#mSave').onclick = () => {
          const v = s => $(s, el).value.trim();
          if (v('#pName').split(/\s+/).length < 2) return rToast('اكتب الاسم', true);
          const oldT = p.track, oldG = p.gender;
          Object.assign(p, { name: v('#pName'), gender: v('#pG'), age: +v('#pAge') || 0, nationality: v('#pNat'), phone: v('#pPh'), email: v('#pEm'), track: +v('#pT'), status: v('#pS') });
          if (p.track !== oldT) p.note = '';
          if (isNew) { p.no = DB.nextNo(); S.participants.push(p); }
          if (isNew || p.track !== oldT || p.gender !== oldG) assignGroup(S, p);
          DB.addLog(`${isNew ? 'إضافة' : 'تعديل'}: ${p.name}`); save('حُفظ'); close(); render();
        };
        $('#mWa') && ($('#mWa').onclick = () => waSheet([p.id]));
        $('#mDel') && ($('#mDel').onclick = () => openSheet({ title: 'حذف المشارك', body: `<p>حذف ${esc(p.name)} نهائياً؟ لا يمكن التراجع.</p>`, foot: '<button class="btn btn-ghost" data-x type="button">إلغاء</button><button class="btn btn-gold" id="mYes" type="button" style="background:var(--bad)">حذف</button>',
          onMount: (e2, c2) => $('#mYes').onclick = () => { S.participants = S.participants.filter(x => x.id !== p.id); DB.addLog(`حذف: ${p.name}`); save('حُذف'); c2(); render(); } }));
      },
    });
  }

  function groupSheet(gid) {
    const g = S.groups.find(x => x.id === gid), t = TRACK(g.track), mem = S.participants.filter(p => p.group === gid && p.status !== 'withdrawn');
    openSheet({
      title: `${t.name}، المجموعة ${AR(g.n)}`,
      body: `<div class="field"><label>المحفّظ${g.gender === 'f' ? 'ة' : ''}</label><input id="gT" value="${esc(g.teacher)}" placeholder="اسم المحفّظ المسؤول" ${role === 'admin' ? '' : 'disabled'}></div>
        <div class="r-list">${mem.map(p => `<div class="r-item" style="cursor:default">${av(p.name, gc(p), 34)}<span class="r-item-t"><b>${esc(p.name)}</b><small class="num" dir="ltr" style="text-align:right">${esc(p.phone)}</small></span><span class="r-badge num" style="--c:#0E5A4A">${AR(stageAvg(S, p)) || '—'}</span></div>`).join('')}</div>`,
      foot: `<button class="btn btn-ghost" id="gWa" type="button"><i data-lucide="message-circle"></i> واتساب للمجموعة</button><button class="btn btn-ghost" id="gCsv" type="button"><i data-lucide="download"></i> كشف المجموعة</button>${role === 'admin' ? '<button class="btn btn-gold" id="mSave" type="button">حفظ</button>' : ''}`,
      onMount: (el, close) => {
        $('#mSave') && ($('#mSave').onclick = () => { g.teacher = $('#gT').value.trim(); save('حُفظ'); close(); render(); });
        $('#gWa').onclick = () => waSheet(mem.map(p => p.id));
        $('#gCsv').onclick = () => exportTable(`كشف-${t.name}-${g.n}.csv`, [['الرقم', 'الاسم', 'العمر', 'الجوّال'], ...mem.map(p => [p.no, p.name, p.age, p.phone])]);
      },
    });
  }

  function judgeSheet(pid) {
    const p = S.participants.find(x => x.id === pid), f = { ...(S.finals[pid] || {}) };
    const tot = () => CONFIG.criteria.reduce((a, c) => a + (+f[c.key] || 0), 0);
    openSheet({
      title: 'استمارة التحكيم الشفهيّ',
      body: `<div class="r-item" style="cursor:default;margin-bottom:10px">${av(p.name, gc(p), 38)}<span class="r-item-t"><b>${esc(p.name)}</b><small>${TRACK(p.track).name}، معدّل المرحليّات ${AR(stageAvg(S, p))}</small></span></div>
        ${CONFIG.criteria.map(c => `<div class="field"><label>${c.name} (من ${AR(c.max)})</label><input type="number" inputmode="numeric" min="0" max="${c.max}" data-c="${c.key}" value="${f[c.key] ?? ''}"></div>`).join('')}
        <div class="r-kpis" style="margin:6px 0 0;grid-template-columns:1fr"><div class="r-kpi" style="cursor:default"><i data-lucide="sigma"></i><b class="num" id="jTot">${AR(tot())}</b><span>المجموع من ١٠٠</span></div></div>`,
      foot: '<button class="btn btn-gold" id="mSave" type="button">اعتماد الدرجة</button>',
      onMount: (el, close) => {
        $$('[data-c]', el).forEach(i => i.oninput = () => { const c = CONFIG.criteria.find(x => x.key === i.dataset.c); f[c.key] = i.value === '' ? '' : Math.max(0, Math.min(c.max, +i.value || 0)); $('#jTot').textContent = AR(tot()); });
        $('#mSave').onclick = () => {
          if (CONFIG.criteria.some(c => f[c.key] == null || f[c.key] === '')) return rToast('أكمل كلّ المعايير', true);
          S.finals[pid] = f; DB.addLog(`تحكيم: ${p.name} — ${tot()}`); save('اعتُمدت الدرجة'); close(); render();
        };
      },
    });
  }


  /* ═════════ رسائل واتساب (المرحلة المجّانيّة: بلا ربط) ═════════
   * كلّ زرّ «إرسال» يفتح واتساب الموظّف على رقم المشارك والرسالة مكتوبة جاهزة، والموظّف يضغط إرسال.
   * عند ربط واتساب الرسميّ (Cloud API) تُرسل نفس القوالب آلياً من الخادم بدل الزرّ.
   */
  const WA_TPL = {
    accept: { t: 'اعتماد التسجيل', x: 'السلام عليكم ورحمة الله\nتم اعتماد تسجيل {الاسم} في {المسابقة}.\nرقم المشارك: {الرقم}\nالمسار: {المسار}\nالمقرّر: {المقرر}\nالمجموعة: {المجموعة}\nنسأل الله لكم التوفيق والسداد.\n{الجمعية}' },
    remind: { t: 'تذكير باختبار', x: 'السلام عليكم ورحمة الله\nتذكير لـ{الاسم}: {الاختبار} في الأسبوع {الأسبوع} من المسابقة.\nراجع مقرّرك ({المقرر}) واستعن بالله.\n{الجمعية}', exam: true },
    score: { t: 'نتيجة اختبار', x: 'السلام عليكم ورحمة الله\nدرجة {الاسم} في {الاختبار}: {الدرجة} من ١٠٠.\nبارك الله في جهدكم، ونسأل الله لكم المزيد.\n{الجمعية}', exam: true },
    final: { t: 'التأهّل للتصفيات', x: 'السلام عليكم ورحمة الله\nمبارك! تأهّل {الاسم} للتصفيات النهائيّة في مسار {المسار}.\nسيصلكم موعد الاختبار الشفهيّ ومكانه قريباً.\n{الجمعية}' },
    free: { t: 'رسالة حرّة', x: 'السلام عليكم ورحمة الله\n{الاسم}، \n\n{الجمعية}' },
  };
  const waPhone = ph => { const d = String(ph || '').replace(/\D/g, ''); return d.startsWith('05') ? '966' + d.slice(1) : (d.startsWith('5') && d.length === 9 ? '966' + d : d); };
  function waFill(txt, p, exam) {
    const t = TRACK(p.track), g = S.groups.find(x => x.id === p.group), v = exam ? S.scores[exam.id]?.[p.id] : null;
    const map = { 'الاسم': p.name, 'الرقم': p.no, 'المسار': t.name, 'المقرر': t.amount + ' حديثاً', 'المجموعة': g ? (g.gender === 'm' ? 'بنين ' : 'بنات ') + g.n : 'تُعلن قريباً',
      'المحفظ': (g && g.teacher) || '', 'الاختبار': exam ? exam.name : '', 'الأسبوع': exam ? exam.week : '', 'الدرجة': v == null ? '—' : v, 'المسابقة': CONFIG.name + ' ' + CONFIG.sub, 'الجمعية': CONFIG.org };
    return txt.replace(/\{([^}]+)\}/g, (m, k) => (k in map ? map[k] : m));
  }
  function waSheet(ids) {
    const people = ids.map(id => S.participants.find(p => p.id === id)).filter(Boolean);
    if (!people.length) return rToast('لا مشاركين في هذا الاختيار', true);
    const st = { tpl: 'accept', exam: (S.exams.find(e => e.kind === 'stage') || {}).id };
    S.wa = S.wa || {};
    openSheet({
      title: `رسالة واتساب — ${AR(people.length)} ${people.length === 1 ? 'مشارك' : 'مشاركاً'}`,
      body: `<div class="r-tabs">${Object.entries(WA_TPL).map(([k, v]) => `<button data-tpl="${k}" class="${k === st.tpl ? 'on' : ''}">${v.t}</button>`).join('')}</div>
        <div class="field hidden" id="waExW"><label>الاختبار</label><select id="waEx">${S.exams.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
        <div class="field"><label>نصّ الرسالة</label><textarea id="waTx" rows="7"></textarea>
          <p class="r-sub" style="margin-top:6px">يتعبّأ تلقائياً لكلّ مشارك: {الاسم} {الرقم} {المسار} {المقرر} {المجموعة} {الاختبار} {الدرجة}</p></div>
        <div class="r-demo-note"><i data-lucide="info"></i><div>اضغط «إرسال» عند كلّ مشارك: يفتح واتساب برقمه والرسالة جاهزة، وأنت تضغط إرسال. تنحفظ علامة «أُرسلت» عند من أرسلت له.</div></div>
        <div class="r-list" id="waL"></div>`,
      foot: '<button class="btn btn-gold" data-x type="button">تمّ</button>',
      onMount: el => {
        const tx = $('#waTx', el); tx.value = WA_TPL[st.tpl].x;
        const paint = () => {
          const ex = S.exams.find(e => e.id === st.exam), needEx = !!WA_TPL[st.tpl].exam;
          $('#waExW', el).classList.toggle('hidden', !needEx);
          $('#waL', el).innerHTML = people.map(p => {
            const ph = waPhone(p.phone), sent = (S.wa[p.id] || []).find(x => x.tpl === st.tpl && (!needEx || x.exam === st.exam));
            const href = `https://wa.me/${ph}?text=${encodeURIComponent(waFill(tx.value, p, needEx ? ex : null))}`;
            return `<div class="r-item" style="cursor:default">${av(p.name, gc(p), 34)}<span class="r-item-t"><b>${esc(p.name)}</b><small class="num" dir="ltr" style="text-align:right">+${esc(ph)}</small></span>
              ${sent ? chip('أُرسلت', '#22c55e') : ''}<a class="btn ${sent ? 'btn-ghost' : 'btn-gold'} btn-sm" href="${href}" target="_blank" rel="noopener" data-wa="${p.id}" style="flex:none"><i data-lucide="message-circle"></i> ${sent ? 'إعادة' : 'إرسال'}</a></div>`;
          }).join('');
          $$('[data-wa]', el).forEach(a => a.addEventListener('click', () => {
            (S.wa[a.dataset.wa] = S.wa[a.dataset.wa] || []).push({ tpl: st.tpl, exam: needEx ? st.exam : null, at: Date.now() });
            DB.save(); setTimeout(paint, 300);
          }));
          icons();
        };
        $$('[data-tpl]', el).forEach(b => b.onclick = () => { st.tpl = b.dataset.tpl; tx.value = WA_TPL[st.tpl].x; $$('[data-tpl]', el).forEach(x => x.classList.toggle('on', x === b)); paint(); });
        $('#waEx', el).value = st.exam; $('#waEx', el).onchange = e => { st.exam = e.target.value; paint(); };
        tx.oninput = () => { clearTimeout(tx._t); tx._t = setTimeout(paint, 250); };
        paint();
      },
    });
  }

  function exportPeople() {
    const ex = S.exams;
    exportTable('المشاركون.csv', [['الرقم', 'الاسم', 'الجنس', 'العمر', 'الجنسيّة', 'العربيّة لغة أمّ', 'المركز', 'الجوّال', 'البريد', 'وليّ الأمر', 'المسار', 'المجموعة', 'الحالة', ...ex.map(e => e.name), 'تاريخ التسجيل'],
      ...S.participants.map(p => [p.no, p.name, p.gender === 'm' ? 'ذكر' : 'أنثى', p.age, p.nationality, p.arabic === 'yes' ? 'نعم' : 'لا', p.center, p.phone, p.email, p.guardian || '', TRACK(p.track).name, grpName(p.group),
        ST[p.status][0], ...ex.map(e => e.kind === 'final' ? finalScore(S, p) ?? '' : S.scores[e.id]?.[p.id] ?? ''), new Date(p.createdAt).toISOString().slice(0, 10)])]);
  }

  window.UI_ADMIN.render = () => { if (!$('#appShell').classList.contains('hidden')) render(); };
  if (SS.get('ms_in')) enter();
};
