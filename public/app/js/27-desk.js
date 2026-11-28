/*
 * 27-desk.js — «المكتب» على نمط الآيفون فوق خلفيّة النظام + Dock زجاجيّ ثابت أسفل كلّ صفحة (البادئة dk)
 * ─────────────────────────────────────────────────────────────────────────
 * منقول من نظام الجمعيات الشبابية (public/charity/js/31-desk.js) ومكيَّف لتطبيقات نظام إبراهيم (LAUNCH في 02-shell).
 * • ودجت الوقت والتاريخ (ميلاديّ + هجريّ) · شبكة الأيقونات · Dock بأربعة تطبيقات أوّله «المكتب».
 * • ضغطة مطوّلة (أو «تعديل») ← الأيقونات تهتزّ: اسحب للترتيب (بين الشبكة والـDock)، و«−» يخفي من المكتب فقط.
 * • الترتيب يُحفظ في S.settings.desk = { order, dock, hidden, look, tint } ويُزامَن.
 * • الأيقونات: رسوم Icon Composer في assets/apps/<مظهر>/<id>.webp لما له رسمة (DK_ART)، والباقي تدرّج بلون التطبيق.
 * يستبدل renderDesktop و lpTile (02-shell) و go (04-home) — آخر تعريف هو المعتمد. ⚠️ تعريفات فقط.
 */
const DK = { edit: false, drag: null, timer: null, badges: {} };
const DK_DOCK_MAX = 4;
const DK_DOCK_DEF = ['huroof', 'sales', 'projects', 'calendar'];
const DK_ORDER_DEF = ['home', 'dashboards', 'invoicing', 'accounting', 'contacts', 'pipeline', 'partners', 'collab', 'quotedesign', 'pricing', 'products', 'subs', 'suppliers', 'habits', 'boards', 'sitework', 'blog', 'newsletter', 'dshop', '_3d', 'settings', '_wall'];
const DK_EXTRA = [
  { id: 'settings', name: 'الإعدادات', icon: 'settings', c: '#AEAEB2,#636366' },
  { id: '_3d', name: 'الاستوديو 3D', icon: 'box', c: '#64D2FF,#0A60D6', href: './3d/' },
  { id: '_wall', name: 'الخلفيّة', icon: 'image', c: '#B9C2D0,#5F6B7E', act: 'wallpaperModal()' },
];
const DK_HOME = { id: 'desktop', name: 'المكتب', icon: 'layout-grid', c: '#7FA2FF,#2F66FF' };
const DK_ART = new Set(['home', 'desktop', '_wall', 'huroof', 'partners', 'collab', 'invoicing', 'quotedesign', 'subs', 'accounting', 'contacts', 'calendar', 'projects', 'boards', 'sitework', 'blog', 'newsletter', 'dshop']);
const DK_LOOKS = { default: 'افتراضيّ', dark: 'داكن', clear: 'زجاجيّ', tinted: 'ملوّن' };
const DK_TINTS = { blue: '#0A84FF', cyan: '#32ADE6', green: '#30D158', yellow: '#FFD60A', orange: '#FF9F0A', red: '#FF453A', pink: '#FF375F', purple: '#BF5AF2' };
const DK_ICON_V = 'v=1';
function dkLook() { const d = (S.settings && S.settings.desk) || {}; return { look: DK_LOOKS[d.look] ? d.look : 'default', tint: DK_TINTS[d.tint] ? d.tint : 'blue' }; }
function appIcon(a, look, tint) {
  const L = dkLook(), lk = look || L.look, tn = tint || L.tint;
  if (!DK_ART.has(a.id)) { const [c1, c2] = String(a.c || '#7FA2FF,#2F66FF').split(','); return `<span class="lp-ic r-ic" style="--c1:${c1};--c2:${c2 || c1}"><i data-lucide="${a.icon}"></i></span>`; }
  const dir = lk === 'tinted' ? 'tint-' + tn : lk;
  return `<span class="lp-ic ai ai-img${lk === 'clear' ? ' ai-clear' : ''}"><img src="./assets/apps/${dir}/${a.id}.webp?${DK_ICON_V}" alt="" draggable="false" decoding="async"></span>`;
}
function lpTile(a) {
  const inner = `${appIcon(a)}<span class="lp-name">${esc(a.name)}</span>`;
  return a.href ? `<a class="lp-tile" href="${a.href}"${a.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
    : `<button class="lp-tile" type="button" onclick="go('${a.id}')">${inner}</button>`;
}

/* «تخصيص» — افتراضيّ / داكن / زجاجيّ / ملوّن */
const DK_CZ_SAMPLE = ['huroof', 'calendar', 'accounting', 'projects'];
function dkCzPreview(k, tn) { return DK_CZ_SAMPLE.map(id => dkApps().find(a => a.id === id)).filter(Boolean).map(a => appIcon(a, k, tn)).join(''); }
function dkCustomize() {
  const L = dkLook();
  openModal('تخصيص الأيقونات', `<div class="dk-cz">${Object.entries(DK_LOOKS).map(([k, n]) => `<label class="dk-cz-o"><input type="radio" name="dk_look" value="${k}"${L.look === k ? ' checked' : ''} onchange="dkCzPick()">
      <span class="dk-cz-pv" data-look="${k}">${dkCzPreview(k, L.tint)}</span><b>${n}</b></label>`).join('')}</div>
    <div class="dk-cz-tint" id="dkTint"${L.look === 'tinted' ? '' : ' hidden'}><b>لون الأيقونات</b><div>${Object.entries(DK_TINTS).map(([n, c]) => `<button type="button" class="dk-tc${n === L.tint ? ' on' : ''}" data-t="${n}" style="--c:${c}" onclick="dkCzTint('${n}')" aria-label="${n}"></button>`).join('')}</div></div>
    <p class="r-hint">مثل الآيفون — الأيقونات المرسومة مصيَّرة بمحرّك آبل نفسه في كلّ مظهر.</p>`, () => {
      const look = (document.querySelector('[name=dk_look]:checked') || {}).value || 'default', t = document.querySelector('.dk-tc.on');
      dkSave({ look, tint: t ? t.dataset.t : L.tint }); closeModal(); renderDesktop(); rToast('تغيّر شكل الأيقونات');
    });
  const m = document.querySelector('.modal'); if (m) m.classList.add('dk-cz-modal'); refreshIcons();
}
function dkCzPick() { const k = (document.querySelector('[name=dk_look]:checked') || {}).value; const t = document.getElementById('dkTint'); if (t) t.hidden = k !== 'tinted'; }
function dkCzTint(n) { document.querySelectorAll('.dk-tc').forEach(b => b.classList.toggle('on', b.dataset.t === n)); const pv = document.querySelector('.dk-cz-pv[data-look=tinted]'); if (pv) pv.innerHTML = dkCzPreview('tinted', n); const r = document.querySelector('[name=dk_look][value=tinted]'); if (r) { r.checked = true; dkCzPick(); } }

/* ═════════ التخطيط ═════════ */
function dkApps() { return [{ id: 'home', name: 'الرئيسية', icon: 'home', c: '#7FA2FF,#2F66FF' }].concat(looseLaunch(), DK_EXTRA); }
function dkLayout() {
  const all = dkApps(), byId = Object.fromEntries(all.map(a => [a.id, a])), st = (S.settings && S.settings.desk) || {};
  const hidden = (st.hidden || []).filter(id => byId[id]);
  const dock = (Array.isArray(st.dock) ? st.dock : DK_DOCK_DEF).filter(id => byId[id] && !hidden.includes(id)).slice(0, DK_DOCK_MAX);
  const taken = new Set(dock.concat(hidden));
  const grid = (st.order || DK_ORDER_DEF).filter(id => byId[id] && !taken.has(id));
  all.forEach(a => { if (!taken.has(a.id) && !grid.includes(a.id)) grid.push(a.id); });
  return { byId, grid, dock, hidden };
}
function dkSave(next) { S.settings.desk = Object.assign({}, S.settings.desk || {}, next); save(); }

/* ═════════ الرسم ═════════ */
function renderDesktop() {
  clearInterval(DK.timer);
  const L = dkLayout(), tile = (id, where) => dkTile(L.byId[id], where);
  document.getElementById('main').innerHTML = `<div class="dk${DK.edit ? ' edit' : ''}" id="dk">
    <div class="dk-top">
      <div class="dk-clock" aria-live="off"><b id="dkTime"></b><span id="dkDate"></span></div>
      <div class="dk-acts">${DK.edit
        ? `<button class="dk-pill" onclick="dkReset()"><i data-lucide="rotate-ccw"></i> الترتيب الافتراضيّ</button><button class="dk-pill" onclick="dkCustomize()"><i data-lucide="paintbrush"></i> تخصيص</button><button class="dk-pill on" onclick="dkEdit(false)">تم</button>`
        : `<button class="dk-pill" onclick="wallpaperModal()"><i data-lucide="image"></i> الخلفيّة</button><button class="dk-pill" onclick="dkEdit(true)"><i data-lucide="grip"></i> تعديل</button>`}</div>
    </div>
    ${DK.edit ? '<p class="dk-hint">اسحب الأيقونات لترتيبها — أو إلى الشريط السفليّ. «−» يخفي التطبيق من المكتب ويبقى في القائمة الجانبيّة.</p>' : ''}
    <div class="dk-grid" id="dkGrid" data-list="grid">${L.grid.map(id => tile(id, 'grid')).join('')}</div>
    ${DK.edit && L.hidden.length ? `<div class="dk-tray"><div class="dk-tray-h"><i data-lucide="eye-off"></i> مخفيّة من المكتب <small>(موجودة في القائمة الجانبيّة)</small></div><div class="dk-grid dk-hidden">${L.hidden.map(id => tile(id, 'hidden')).join('')}</div></div>` : ''}
    <div class="dk-dock-wrap">${dkDockHTML(L, true)}</div>
  </div>`;
  dkClock(); DK.timer = setInterval(() => { if (CUR !== 'desktop') { clearInterval(DK.timer); return; } dkClock(); }, 20000);
  dkBind(); refreshIcons(); dkApplyBadges();
}
function dkDockHTML(L, inDesk) {
  const home = `<div class="dk-tile dk-home${CUR === 'desktop' ? ' on' : ''}" role="button" tabindex="0" data-id="desktop" aria-label="المكتب — كلّ التطبيقات" onpointerdown="dkTipHold(this,event)"${inDesk ? '' : ` onclick="go('desktop')"`}>
    <span class="dk-icw">${appIcon(DK_HOME)}</span><span class="dk-name">المكتب</span><span class="dk-tip" aria-hidden="true">المكتب</span></div>`;
  const apps = L.dock.map(id => dkTile(L.byId[id], inDesk ? 'dock' : 'bar')).join('')
    + (inDesk && DK.edit && L.dock.length < DK_DOCK_MAX ? '<span class="dk-dock-slot" aria-hidden="true"></span>' : '');
  return `<div class="dk-dock">${home}<span class="dk-sep" aria-hidden="true"></span><div class="dk-dock-apps"${inDesk ? ' id="dkDock" data-list="dock"' : ''}>${apps}</div></div>`;
}
/* الـDock الثابت في بقيّة الصفحات (#dkBar) — لا يظهر في التضمين (embed) */
function dkBar() {
  const host = document.querySelector('#appShell .content'), shell = document.getElementById('appShell');
  let bar = document.getElementById('dkBar');
  if (!host || !shell || shell.classList.contains('hidden') || document.documentElement.classList.contains('embed') || CUR === 'desktop') { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('nav'); bar.id = 'dkBar'; bar.className = 'dk-bar'; bar.setAttribute('aria-label', 'الشريط السفليّ'); host.appendChild(bar); }
  bar.innerHTML = dkDockHTML(dkLayout(), false);
  try { if (window.lucide) lucide.createIcons({ nodes: [bar] }); } catch (e) { refreshIcons(); }
  dkApplyBadges();
}
function dkTile(a, where) {
  if (!a) return '';
  const x = !DK.edit ? '' : where === 'hidden' ? `<button class="dk-x add" type="button" aria-label="إظهار ${esc(a.name)}" onclick="dkShow('${a.id}')">+</button>`
    : `<button class="dk-x" type="button" aria-label="إخفاء ${esc(a.name)} من المكتب" onclick="dkHide('${a.id}')">−</button>`;
  const tip = where === 'dock' || where === 'bar';
  return `<div class="dk-tile${where === 'bar' && CUR === a.id ? ' on' : ''}" role="button" tabindex="0" data-id="${a.id}" aria-label="${esc(a.name)}"${tip ? ' onpointerdown="dkTipHold(this,event)"' : ''}${where === 'bar' ? ` onclick="dkOpen('${a.id}')"` : ''}>
    <span class="dk-icw">${appIcon(a)}<span class="dk-badge" data-b="${a.id}" hidden></span>${x}</span>
    <span class="dk-name">${esc(a.name)}</span>${tip ? `<span class="dk-tip" aria-hidden="true">${esc(a.name)}</span>` : ''}</div>`;
}
function dkTipHold(el, e) {
  if (e.pointerType !== 'touch' || DK.edit) return;
  const t = setTimeout(() => el.classList.add('tip-on'), 260);
  const end = () => { clearTimeout(t); setTimeout(() => el.classList.remove('tip-on'), 700); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.removeEventListener(n, end)); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, end));
}
function dkClock() {
  const t = document.getElementById('dkTime'), d = document.getElementById('dkDate'); if (!t) return;
  const now = new Date();
  t.textContent = now.toLocaleTimeString('ar', { hour: 'numeric', minute: '2-digit' });
  let h = ''; try { h = now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
  d.textContent = now.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' }) + (h ? ' · ' + h : '');
}
function dkOpen(id) {
  const a = dkApps().find(x => x.id === id); if (!a) return;
  if (a.act) { (new Function(a.act))(); return; }
  if (a.href) { window.open(a.href, a.href.startsWith('http') ? '_blank' : '_self'); return; }
  go(id);
}
function dkEdit(on) { DK.edit = !!on; renderDesktop(); if (on && navigator.vibrate) try { navigator.vibrate(12); } catch (e) {} }
function dkHide(id) { const L = dkLayout(); dkSave({ hidden: L.hidden.concat(id), dock: L.dock.filter(x => x !== id), order: L.grid.filter(x => x !== id) }); renderDesktop(); }
function dkShow(id) { const L = dkLayout(); dkSave({ hidden: L.hidden.filter(x => x !== id), order: L.grid.concat(id) }); renderDesktop(); }
function dkReset() { const L = dkLook(); S.settings.desk = { look: L.look, tint: L.tint }; save(); renderDesktop(); rToast('عاد المكتب للترتيب الافتراضيّ'); }

/* الشارات الحمراء: فواتير غير مدفوعة أو مدفوعة جزئيّاً (من بيانات S نفسها — بلا طلبات شبكة) */
function dkCountBadges() {
  const b = {};
  try { b.invoicing = (S.invoices || []).filter(i => i && (i.status === 'unpaid' || i.status === 'partial')).length; } catch (e) {}
  DK.badges = b;
}
function dkApplyBadges() {
  dkCountBadges();
  Object.entries(DK.badges || {}).forEach(([id, n]) => document.querySelectorAll(`.dk-badge[data-b="${id}"]`).forEach(el => { el.hidden = !n; el.textContent = n > 99 ? '99+' : n; }));
}

/* ═════════ اللمس والسحب: نقرة = فتح · ضغطة مطوّلة = تعديل · سحب في التعديل = ترتيب ═════════ */
function dkBind() {
  const root = document.getElementById('dk'); if (!root) return;
  root.addEventListener('pointerdown', dkDown);
  root.addEventListener('keydown', e => {
    const t = e.target.closest && e.target.closest('.dk-tile');
    if (e.key === 'Escape' && DK.edit) { dkEdit(false); return; }
    if (t && (e.key === 'Enter' || e.key === ' ') && !DK.edit) { e.preventDefault(); dkOpen(t.dataset.id); }
  });
  root.addEventListener('contextmenu', e => { if (e.target.closest('.dk-tile')) e.preventDefault(); });
  root.addEventListener('touchmove', e => { if (DK.drag && DK.edit) e.preventDefault(); }, { passive: false });
}
function dkDown(e) {
  if (e.button && e.button !== 0) return;
  if (e.target.closest('.dk-x, .dk-pill')) return;
  const tile = e.target.closest('.dk-tile');
  if (!tile) { if (DK.edit && !e.target.closest('.dk-tray')) dkEdit(false); return; }
  if (tile.dataset.id === 'desktop') { if (DK.edit) dkEdit(false); else try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (x) {} return; }
  if (tile.closest('.dk-hidden')) return;
  const P = DK.drag = { tile, id: tile.dataset.id, x: e.clientX, y: e.clientY, pid: e.pointerId, moved: false, dragging: false, long: false };
  if (!DK.edit) P.lt = setTimeout(() => { P.long = true; DK.edit = true; document.getElementById('dk').classList.add('edit'); if (navigator.vibrate) try { navigator.vibrate(12); } catch (x) {} dkDecorate(); }, 480);
  document.addEventListener('pointermove', dkMove);
  document.addEventListener('pointerup', dkUp);
  document.addEventListener('pointercancel', dkCancel);
}
function dkDecorate() {
  document.querySelectorAll('#dk .dk-tile').forEach(t => { if (t.querySelector('.dk-x')) return; const a = dkApps().find(x => x.id === t.dataset.id); if (!a) return;
    t.querySelector('.dk-icw').insertAdjacentHTML('beforeend', `<button class="dk-x" type="button" aria-label="إخفاء ${esc(a.name)} من المكتب" onclick="dkHide('${a.id}')">−</button>`); });
  const acts = document.querySelector('#dk .dk-acts'); if (acts) acts.innerHTML = `<button class="dk-pill" onclick="dkReset()"><i data-lucide="rotate-ccw"></i> الترتيب الافتراضيّ</button><button class="dk-pill" onclick="dkCustomize()"><i data-lucide="paintbrush"></i> تخصيص</button><button class="dk-pill on" onclick="dkEdit(false)">تم</button>`;
  refreshIcons();
}
function dkMove(e) {
  const P = DK.drag; if (!P || e.pointerId !== P.pid) return;
  const dx = e.clientX - P.x, dy = e.clientY - P.y;
  if (!P.moved && Math.hypot(dx, dy) > 7) { P.moved = true; if (!P.long) clearTimeout(P.lt); }
  if (!DK.edit) return;
  if (!P.dragging && P.moved) dkStartDrag(e);
  if (!P.dragging) return;
  e.preventDefault();
  P.ghost.style.transform = `translate(${e.clientX - P.ox}px, ${e.clientY - P.oy}px) scale(1.12)`;
  dkPlace(e.clientX, e.clientY);
}
function dkStartDrag(e) {
  const P = DK.drag, r = P.tile.getBoundingClientRect();
  P.dragging = true; P.ox = e.clientX - r.left; P.oy = e.clientY - r.top;
  const g = P.ghost = P.tile.cloneNode(true); g.classList.add('dk-ghost'); g.style.width = r.width + 'px';
  g.style.transform = `translate(${r.left}px, ${r.top}px) scale(1.12)`; document.body.appendChild(g);
  P.tile.classList.add('dk-ph');
  document.getElementById('dk').classList.add('dragging');
  try { P.tile.releasePointerCapture && P.tile.releasePointerCapture(P.pid); } catch (x) {}
}
function dkPlace(x, y) {
  const P = DK.drag, ph = P.tile;
  const el = document.elementFromPoint(x, y); if (!el) return;
  const list = el.closest('[data-list]'); if (!list) return;
  const target = el.closest('.dk-tile');
  const dock = document.getElementById('dkDock'), inDock = list === dock;
  if (inDock && ph.parentElement !== dock && dock.querySelectorAll('.dk-tile').length >= DK_DOCK_MAX) return;
  const flip = dkFlipStart();
  if (target && target !== ph && target.parentElement === list) {
    const sib = Array.from(list.querySelectorAll('.dk-tile')), ti = sib.indexOf(target), pi = sib.indexOf(ph);
    if (pi >= 0 && pi < ti) target.after(ph); else target.before(ph);
  } else if (!target && ph.parentElement !== list) {
    const slot = list.querySelector('.dk-dock-slot'); slot ? slot.before(ph) : list.appendChild(ph);
  } else return;
  const slot = dock.querySelector('.dk-dock-slot'); if (slot) slot.hidden = dock.querySelectorAll('.dk-tile').length >= DK_DOCK_MAX;
  dkFlipEnd(flip);
}
function dkFlipStart() { const m = new Map(); document.querySelectorAll('#dk .dk-tile:not(.dk-ph)').forEach(t => m.set(t, t.getBoundingClientRect())); return m; }
function dkFlipEnd(m) {
  m.forEach((r, t) => { const n = t.getBoundingClientRect(), dx = r.left - n.left, dy = r.top - n.top; if (!dx && !dy) return;
    t.style.transition = 'none'; t.style.translate = `${dx}px ${dy}px`;
    requestAnimationFrame(() => { t.style.transition = 'translate .22s cubic-bezier(.2,.8,.2,1)'; t.style.translate = '0 0'; }); });
}
function dkUp(e) {
  const P = DK.drag; if (!P || e.pointerId !== P.pid) return;
  dkUnbind(); clearTimeout(P.lt);
  if (P.dragging) {
    P.ghost.remove(); P.tile.classList.remove('dk-ph'); document.getElementById('dk').classList.remove('dragging');
    const ids = sel => Array.from(document.querySelectorAll(sel + ' .dk-tile')).map(t => t.dataset.id);
    dkSave({ order: ids('#dkGrid'), dock: ids('#dkDock'), hidden: dkLayout().hidden });
    renderDesktop();
  } else if (!P.moved && !P.long && !DK.edit) dkOpen(P.id);
  DK.drag = null;
}
function dkCancel() { const P = DK.drag; if (!P) return; dkUnbind(); clearTimeout(P.lt); if (P.ghost) { P.ghost.remove(); P.tile.classList.remove('dk-ph'); } DK.drag = null; if (P.dragging) renderDesktop(); }
function dkUnbind() { document.removeEventListener('pointermove', dkMove); document.removeEventListener('pointerup', dkUp); document.removeEventListener('pointercancel', dkCancel); }

/* التنقّل: كما في 04-home، ثمّ الـDock الثابت والعنوان الكبير والرجوع لأعلى الصفحة */
function go(view) {
  CUR = view;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.v === view));
  const t = document.getElementById('ctTitle'); if (t) t.textContent = view === 'desktop' ? 'المكتب' : navName(view);
  (RENDER[view] || renderHome)();
  refreshIcons();
  const sbar = document.getElementById('sidebar'); if (sbar) sbar.classList.remove('open');
  dkBar();
  if (typeof apTitle === 'function') setTimeout(apTitle, 0);
  try { window.scrollTo({ top: 0 }); } catch (e) {}
}
