/*
 * 24-org-boards.js — الخرائط الذهنية واللوحات الحرّة (على نمط Freeform)
 * ─────────────────────────────────────────────────────────────────────────
 * لوحة لانهائية: ملاحظات لاصقة، أشكال، نصوص، صور، روابط Drive، وخطوط ربط ذكية.
 * • أسهم سريعة حول العنصر: ضغطة = فكرة جديدة مربوطة، سحب = ربط بعنصر آخر.
 * • Tab فكرة فرعية · Enter فكرة شقيقة · اكتب مباشرة لتعديل النص · ترتيب تلقائي للخريطة.
 * • تحريك وتكبير بالفأرة ولوحة اللمس واللمس بإصبعين · تراجع/إعادة · نسخ/لصق · خطوط محاذاة.
 * اللوحات شخصية لكل موظف (S.mindboards) وتُزامَن مع حسابه.
 * يعيد تعريف renderBoards من نظام بزنس. البادئة ff لكل ما هنا.
 */
const FF = { b: null, sel: new Set(), link: null, grid: true, undo: [], redo: [], act: null, editing: null, clip: null, ptrs: new Map(), pinch: null, space: false, saveT: null };
const FF_COLORS = [
  { k: 'white', bg: '#FFFFFF', fg: '#14292D', bd: '#D5E0E2' }, { k: 'cream', bg: '#FFF6D6', fg: '#5B4A1A', bd: '#EAD9A0' },
  { k: 'gold', bg: '#CAB05F', fg: '#14292D', bd: '#B39845' }, { k: 'teal', bg: '#41747F', fg: '#FFFFFF', bd: '#356069' },
  { k: 'deep', bg: '#163A41', fg: '#FFFFFF', bd: '#0F2B31' }, { k: 'sky', bg: '#DDF1F3', fg: '#1D4A52', bd: '#B5DCE0' },
  { k: 'mint', bg: '#DCF1E2', fg: '#1E5A33', bd: '#B3DDBF' }, { k: 'rose', bg: '#FADFDC', fg: '#7A2B24', bd: '#F0BDB6' },
  { k: 'lilac', bg: '#E9E3F7', fg: '#44336E', bd: '#CDC1EC' }, { k: 'grey', bg: '#ECF0F1', fg: '#3C5459', bd: '#D5DDDF' },
];
const FF_LINK_COLORS = ['#41747F', '#CAB05F', '#14292D', '#8AA1A6', '#d64545', '#3E9B6E'];
const FF_SHAPES = [['round', 'مستطيل مستدير'], ['rect', 'مستطيل'], ['pill', 'كبسولة'], ['ellipse', 'بيضاوي'], ['diamond', 'معيّن'], ['sticky', 'ملاحظة لاصقة']];
const FF_SIZES = [14, 17, 21, 28, 40];
const ffc = k => FF_COLORS.find(c => c.k === k) || FF_COLORS[0];
const ffId = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ffBoards = () => { if (!Array.isArray(S.mindboards)) S.mindboards = []; return S.mindboards; };
const ffItem = id => FF.b.items.find(i => i.id === id);

/* ═════════ قائمة اللوحات ═════════ */
function renderBoards() {
  ffClose();
  const list = ffBoards().slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>الخرائط الذهنية</h1><p class="r-sub" style="margin:4px 0 0">لوحات حرّة لترتيب الأفكار وتخطيط البرامج والحملات — خاصة بك وتُحفظ تلقائياً.</p></div></div>
    <div class="ff-templates">${[['blank', 'لوحة فارغة', 'square-dashed'], ['mind', 'خريطة ذهنية', 'git-fork'], ['brain', 'عصف ذهني', 'sticky-note'], ['plan', 'خطة برنامج', 'kanban-square']].map(([k, t, i]) =>
      `<button class="ff-tpl" onclick="ffNew('${k}')"><span class="ff-tpl-art ff-art-${k}"><i data-lucide="${i}"></i></span><b>${t}</b></button>`).join('')}</div>
    ${list.length ? `<h3 class="ff-h3">لوحاتي</h3><div class="ff-grid">${list.map(b => `<div class="ff-card" onclick="ffOpen('${b.id}')">
        <div class="ff-thumb">${ffThumb(b)}</div>
        <div class="ff-card-b"><b>${esc(b.title || 'بدون عنوان')}</b><small>${b.items.length} عنصر · ${ffAgo(b.updated)}</small></div>
        <div class="ff-card-acts" onclick="event.stopPropagation()"><button title="نسخة" onclick="ffDupBoard('${b.id}')"><i data-lucide="copy"></i></button><button title="حذف" onclick="ffDelBoard('${b.id}')"><i data-lucide="trash-2"></i></button></div>
      </div>`).join('')}</div>` : ''}
  </div>`;
  refreshIcons();
}
function ffAgo(t) { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'الآن' : m < 60 ? 'قبل ' + m + ' د' : m < 1440 ? 'قبل ' + Math.round(m / 60) + ' س' : new Date(t).toLocaleDateString('ar-u-ca-gregory-nu-latn', { day: 'numeric', month: 'short' }); }
function ffThumb(b) {
  if (!b.items.length) return '<span class="ff-thumb-empty"><i data-lucide="square-dashed"></i></span>';
  const bb = ffBounds(b.items), pad = 40, w = bb.x2 - bb.x1 + pad * 2, h = bb.y2 - bb.y1 + pad * 2;
  const c = it => [it.x + it.w / 2, it.y + it.h / 2];
  return `<svg viewBox="${bb.x1 - pad} ${bb.y1 - pad} ${w} ${h}" preserveAspectRatio="xMidYMid meet">${(b.links || []).map(l => { const a = b.items.find(i => i.id === l.from), z = b.items.find(i => i.id === l.to); if (!a || !z) return ''; const [x1, y1] = c(a), [x2, y2] = c(z); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${l.color || '#41747F'}" stroke-width="${Math.max(3, w / 160)}"/>`; }).join('')}
    ${b.items.map(i => i.t === 'image' ? `<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="12" fill="#cfdcde"/>` : `<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="${i.shape === 'ellipse' || i.shape === 'pill' ? i.h / 2 : 12}" fill="${ffc(i.color).bg}" stroke="${ffc(i.color).bd}" stroke-width="${Math.max(2, w / 300)}"/>`).join('')}</svg>`;
}
function ffNew(tpl) {
  const b = { id: ffId(), title: { blank: 'لوحة جديدة', mind: 'خريطة ذهنية', brain: 'عصف ذهني', plan: 'خطة برنامج' }[tpl], created: Date.now(), updated: Date.now(), view: { x: 0, y: 0, z: 1 }, items: [], links: [], dark: false };
  const N = (text, x, y, o) => Object.assign({ id: ffId(), t: 'node', shape: 'round', x, y, w: 200, h: 72, text, color: 'white', fs: 17, bold: false, align: 'center' }, o || {});
  if (tpl === 'mind') {
    const root = N('الفكرة الرئيسية', -120, -45, { w: 240, h: 90, color: 'deep', fs: 21, bold: true, shape: 'pill' });
    const kids = [['الهدف', -420, -170, 'gold'], ['الفئة المستهدفة', -420, -40, 'sky'], ['الأنشطة', -420, 90, 'mint'], ['الشركاء', 220, -110, 'cream'], ['المخرجات', 220, 30, 'lilac']]
      .map(([t, x, y, c]) => N(t, x, y, { color: c }));
    b.items = [root, ...kids]; b.links = kids.map(k => ({ id: ffId(), from: root.id, to: k.id, style: 'curve', arrow: 'none', color: '#41747F', width: 3 }));
  } else if (tpl === 'brain') {
    const cols = ['cream', 'sky', 'mint', 'rose', 'lilac', 'cream'];
    b.items = [N('ما المشكلة التي نحلها؟', -340, -260, { w: 680, h: 70, color: 'deep', fs: 21, bold: true, shape: 'rect' }),
      ...cols.map((c, i) => N('فكرة ' + (i + 1), -340 + (i % 3) * 240, -150 + Math.floor(i / 3) * 230, { shape: 'sticky', color: c, w: 200, h: 200, fs: 17, align: 'right' }))];
  } else if (tpl === 'plan') {
    const heads = [['الأهداف', 'gold'], ['الأنشطة', 'teal'], ['المسؤول والموعد', 'deep'], ['المخرجات والمؤشرات', 'gold']];
    heads.forEach(([t, c], i) => { const x = 460 - i * 300; b.items.push(N(t, x, -260, { w: 260, h: 64, color: c, bold: true, shape: 'rect' })); [0, 1, 2].forEach(r => b.items.push(N('', x, -170 + r * 130, { w: 260, h: 110, shape: 'sticky', color: ['cream', 'sky', 'mint', 'cream'][i], align: 'right' }))); });
  }
  ffBoards().push(b); save(); ffOpen(b.id, true);
}
function ffDupBoard(id) { const b = ffBoards().find(x => x.id === id); if (!b) return; const c = JSON.parse(JSON.stringify(b)); c.id = ffId(); c.title = (b.title || '') + ' (نسخة)'; c.updated = Date.now(); ffBoards().push(c); save(); renderBoards(); }
function ffDelBoard(id) { if (!confirm('حذف اللوحة نهائياً؟')) return; S.mindboards = ffBoards().filter(x => x.id !== id); save(); renderBoards(); }

/* ═════════ فتح اللوحة ═════════ */
function ffOpen(id, fresh) {
  const b = ffBoards().find(x => x.id === id); if (!b) return;
  FF.b = b; b.links = b.links || []; FF.sel.clear(); FF.link = null; FF.undo = []; FF.redo = []; FF.grid = b.grid !== false;
  document.getElementById('main').innerHTML = `<div class="ff-app${b.dark ? ' dark' : ''}" id="ffApp">
    <div class="ff-top">
      <div class="ff-top-r"><button class="ff-ib" onclick="renderBoards()" title="كل اللوحات"><i data-lucide="chevron-right"></i></button>
        <input class="ff-title" value="${esc(b.title || '')}" placeholder="عنوان اللوحة" oninput="FF.b.title=this.value;ffSave()" onkeydown="if(event.key==='Enter')this.blur()"><span class="ff-saved" id="ffSaved"></span></div>
      <div class="ff-tools" role="toolbar" aria-label="أدوات اللوحة">
        <button class="ff-ib" onclick="ffAdd('sticky')" title="ملاحظة لاصقة (N)"><i data-lucide="sticky-note"></i></button>
        <div class="ff-pop-wrap"><button class="ff-ib" onclick="ffToggleMenu('ffShapes')" title="الأشكال"><i data-lucide="shapes"></i></button>
          <div class="ff-pop" id="ffShapes">${FF_SHAPES.filter(s => s[0] !== 'sticky').map(([k, t]) => `<button onclick="ffAdd('node','${k}');ffToggleMenu()"><span class="ff-shp ff-shp-${k}"></span>${t}</button>`).join('')}</div></div>
        <button class="ff-ib" onclick="ffAdd('text')" title="نص (T)"><i data-lucide="type"></i></button>
        <label class="ff-ib" title="صورة"><i data-lucide="image"></i><input type="file" accept="image/*" hidden onchange="ffImage(this)"></label>
        <button class="ff-ib" onclick="ffAddLink()" title="رابط Google Drive أو موقع"><i data-lucide="link"></i></button>
        <span class="ff-sep"></span>
        <button class="ff-ib" onclick="ffLayout()" title="ترتيب الخريطة تلقائياً"><i data-lucide="network"></i></button>
        <button class="ff-ib" onclick="ffUndo()" title="تراجع ⌘Z"><i data-lucide="undo-2"></i></button>
        <button class="ff-ib" onclick="ffRedo()" title="إعادة ⇧⌘Z"><i data-lucide="redo-2"></i></button>
      </div>
      <div class="ff-top-l"><button class="ff-ib" onclick="ffHelp()" title="الاختصارات"><i data-lucide="keyboard"></i></button>
        <button class="ff-ib" id="ffFullBtn" onclick="ffFull()" title="ملء الشاشة"><i data-lucide="maximize-2"></i></button></div>
    </div>
    <div class="ff-vp${FF.grid ? ' grid' : ''}" id="ffVp" tabindex="0">
      <div class="ff-world" id="ffWorld"><svg class="ff-links" id="ffLinks"></svg><div id="ffItems"></div><svg class="ff-guides" id="ffGuides"></svg><div id="ffSelUI"></div></div>
      <div class="ff-marq" id="ffMarq"></div>
      <div class="ff-empty" id="ffEmpty">انقر مرتين في أي مكان لإضافة فكرة — أو اختر أداة من الأعلى</div>
    </div>
    <div class="ff-insp" id="ffInsp"></div>
    <div class="ff-zoom"><button onclick="ffZoomBy(1/1.2)" title="تصغير"><i data-lucide="minus"></i></button><button id="ffZ" onclick="ffFit()" title="ملاءمة الشاشة">100%</button><button onclick="ffZoomBy(1.2)" title="تكبير"><i data-lucide="plus"></i></button></div>
    <div class="ff-corner"><button class="${FF.grid ? 'on' : ''}" id="ffGridBtn" onclick="ffGrid()" title="الشبكة والالتقاط"><i data-lucide="grid-3x3"></i></button><button onclick="ffDark()" title="خلفية فاتحة/داكنة"><i data-lucide="sun-moon"></i></button></div>
  </div>`;
  ffBind(); ffRender();
  if (fresh || !b.view || (b.view.x === 0 && b.view.y === 0)) setTimeout(ffFit, 30); else ffApplyView();
  refreshIcons();
}
function ffClose() { document.removeEventListener('keydown', ffKey); FF.b = null; }

/* ═════════ العرض ═════════ */
function ffApplyView() {
  const v = FF.b.view, w = document.getElementById('ffWorld'), vp = document.getElementById('ffVp'); if (!w) return;
  w.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.z})`;
  vp.style.backgroundSize = `${24 * v.z}px ${24 * v.z}px`; vp.style.backgroundPosition = `${v.x}px ${v.y}px`;
  const z = document.getElementById('ffZ'); if (z) z.textContent = Math.round(v.z * 100) + '%';
  document.getElementById('ffApp').style.setProperty('--iz', 1 / v.z);
  ffPlaceInsp();
}
function ffRender() {
  const box = document.getElementById('ffItems'); if (!box) return;
  box.innerHTML = FF.b.items.map(ffItemHTML).join('');
  document.getElementById('ffEmpty').style.display = FF.b.items.length ? 'none' : '';
  ffDrawLinks(); ffDrawSel(); ffInsp();
}
function ffItemHTML(i) {
  const c = ffc(i.color), sel = FF.sel.has(i.id) ? ' sel' : '';
  const base = `class="ff-it ff-${i.t}${i.t === 'node' ? ' shp-' + i.shape : ''}${sel}" data-id="${i.id}" style="left:${i.x}px;top:${i.y}px;width:${i.w}px;height:${i.h}px;--bg:${c.bg};--fg:${c.fg};--bd:${c.bd};--fs:${i.fs || 17}px;--al:${i.align || 'center'}"`;
  if (i.t === 'image') return `<div ${base}><img src="${i.img}" alt="" draggable="false"></div>`;
  if (i.t === 'link') { const host = (i.url || '').replace(/^https?:\/\//, '').split('/')[0]; const drive = /google\.com/.test(host);
    return `<div ${base}><span class="ff-lk-ic"><i data-lucide="${drive ? 'hard-drive' : /youtu/.test(host) ? 'youtube' : 'globe'}"></i></span><span class="ff-lk-t"><b>${esc(i.text || host)}</b><small dir="ltr">${esc(host)}</small></span></div>`; }
  return `<div ${base}><div class="ff-txt${i.bold ? ' b' : ''}" dir="auto">${esc(i.text || '')}</div></div>`;
}
function ffAnchor(it, tx, ty) {
  const cx = it.x + it.w / 2, cy = it.y + it.h / 2, dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) * it.h > Math.abs(dy) * it.w) return { x: dx > 0 ? it.x + it.w : it.x, y: cy, nx: dx > 0 ? 1 : -1, ny: 0 };
  return { x: cx, y: dy > 0 ? it.y + it.h : it.y, nx: 0, ny: dy > 0 ? 1 : -1 };
}
function ffPath(a, b, style) {
  if (style === 'straight') return { d: `M${a.x} ${a.y}L${b.x} ${b.y}`, t: [a.x, a.y] };
  if (style === 'elbow') {
    if (a.nx) { const mx = (a.x + b.x) / 2; return { d: `M${a.x} ${a.y}H${mx}V${b.y}H${b.x}`, t: [mx, b.y] }; }
    const my = (a.y + b.y) / 2; return { d: `M${a.x} ${a.y}V${my}H${b.x}V${b.y}`, t: [b.x, my] };
  }
  const k = Math.max(40, Math.hypot(b.x - a.x, b.y - a.y) * .45);
  const c1 = [a.x + a.nx * k, a.y + a.ny * k], c2 = [b.x + b.nx * k, b.y + b.ny * k];
  return { d: `M${a.x} ${a.y}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b.x} ${b.y}`, t: c2 };
}
function ffArrow(tip, from, color, w) {
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]), L = 9 + w * 2, W = 5 + w;
  const p = (r, o) => [tip[0] - Math.cos(ang) * r + Math.cos(ang + Math.PI / 2) * o, tip[1] - Math.sin(ang) * r + Math.sin(ang + Math.PI / 2) * o];
  const a = p(L, W), b = p(L, -W);
  return `<path d="M${tip[0]} ${tip[1]}L${a[0]} ${a[1]}L${b[0]} ${b[1]}Z" fill="${color}"/>`;
}
function ffDrawLinks(extra) {
  const svg = document.getElementById('ffLinks'); if (!svg) return;
  let out = '';
  for (const l of FF.b.links) {
    const A = ffItem(l.from), B = ffItem(l.to); if (!A || !B) continue;
    const a = ffAnchor(A, B.x + B.w / 2, B.y + B.h / 2), b = ffAnchor(B, A.x + A.w / 2, A.y + A.h / 2);
    const p = ffPath(a, b, l.style || 'curve'), col = l.color || '#41747F', w = l.width || 3, on = FF.link === l.id;
    out += `<g class="ff-ln${on ? ' on' : ''}" data-link="${l.id}"><path class="hit" d="${p.d}"/>${on ? `<path d="${p.d}" stroke="#CAB05F" stroke-width="${w + 6}" opacity=".35" fill="none"/>` : ''}<path d="${p.d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" ${l.dash ? 'stroke-dasharray="8 7"' : ''}/>`
      + (l.arrow === 'end' || l.arrow === 'both' ? ffArrow([b.x, b.y], p.t, col, w) : '')
      + (l.arrow === 'both' ? ffArrow([a.x, a.y], ffPath(b, a, l.style || 'curve').t, col, w) : '')
      + (l.label ? `<foreignObject x="${(a.x + b.x) / 2 - 80}" y="${(a.y + b.y) / 2 - 16}" width="160" height="32"><div class="ff-lbl">${esc(l.label)}</div></foreignObject>` : '') + `</g>`;
  }
  if (extra) out += extra;
  svg.innerHTML = out;
}
function ffBounds(items) {
  const xs = items.flatMap(i => [i.x, i.x + i.w]), ys = items.flatMap(i => [i.y, i.y + i.h]);
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}
function ffDrawSel() {
  const ui = document.getElementById('ffSelUI'); if (!ui) return;
  document.querySelectorAll('#ffItems .ff-it').forEach(e => e.classList.toggle('sel', FF.sel.has(e.dataset.id)));
  const items = [...FF.sel].map(ffItem).filter(Boolean);
  if (!items.length || FF.editing) { ui.innerHTML = ''; return; }
  const bb = ffBounds(items), one = items.length === 1;
  const h = (k, x, y) => `<span class="ff-h ff-h-${k}" data-h="${k}" style="left:${x}px;top:${y}px"></span>`;
  // أسهم مرسومة (لا حروف ‹ › لأن اتجاه النص العربي يقلبها)
  const Q_PATH = { e: 'M9 5l7 7-7 7', w: 'M15 5l-7 7 7 7', n: 'M5 15l7-7 7 7', s: 'M5 9l7 7 7-7' };
  const q = (k, x, y) => `<span class="ff-q ff-q-${k}" data-q="${k}" style="left:${x}px;top:${y}px" title="اضغط لفكرة جديدة مربوطة، أو اسحب للربط"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${Q_PATH[k]}"/></svg></span>`;
  const { x1, y1, x2, y2 } = bb, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  ui.innerHTML = `<div class="ff-selbox" style="left:${x1}px;top:${y1}px;width:${x2 - x1}px;height:${y2 - y1}px"></div>`
    + (one && !items[0].lock ? h('nw', x1, y1) + h('n', mx, y1) + h('ne', x2, y1) + h('e', x2, my) + h('se', x2, y2) + h('s', mx, y2) + h('sw', x1, y2) + h('w', x1, my)
      + (items[0].t === 'node' ? q('e', x2, my) + q('w', x1, my) + q('n', mx, y1) + q('s', mx, y2) : '') : '');
}

/* ═════════ المفتش العائم ═════════ */
function ffInsp() {
  const el = document.getElementById('ffInsp'); if (!el) return;
  const items = [...FF.sel].map(ffItem).filter(Boolean);
  const L = FF.link ? FF.b.links.find(l => l.id === FF.link) : null;
  if (FF.editing || (!items.length && !L)) { el.classList.remove('show'); el.innerHTML = ''; return; }
  const sw = (cur, fn) => FF_COLORS.map(c => `<button class="ff-sw${cur === c.k ? ' on' : ''}" style="--c:${c.bg};--b:${c.bd}" onclick="${fn}('${c.k}')" title="${c.k}"></button>`).join('');
  if (L) {
    el.innerHTML = `<div class="ff-ig">${[['curve', 'spline'], ['straight', 'minus'], ['elbow', 'corner-down-left']].map(([s, ic]) => `<button class="${(L.style || 'curve') === s ? 'on' : ''}" onclick="ffLinkSet('style','${s}')" title="${{ curve: 'منحني', straight: 'مستقيم', elbow: 'بزوايا' }[s]}"><i data-lucide="${ic}"></i></button>`).join('')}</div>
      <div class="ff-ig">${[['none', 'minus'], ['end', 'arrow-left'], ['both', 'arrow-left-right']].map(([s, ic]) => `<button class="${(L.arrow || 'none') === s ? 'on' : ''}" onclick="ffLinkSet('arrow','${s}')"><i data-lucide="${ic}"></i></button>`).join('')}</div>
      <div class="ff-ig">${FF_LINK_COLORS.map(c => `<button class="ff-sw${L.color === c ? ' on' : ''}" style="--c:${c};--b:${c}" onclick="ffLinkSet('color','${c}')"></button>`).join('')}</div>
      <div class="ff-ig"><button class="${L.dash ? 'on' : ''}" onclick="ffLinkSet('dash',${!L.dash})" title="متقطع"><i data-lucide="more-horizontal"></i></button><button onclick="ffLinkSet('width',${(L.width || 3) >= 6 ? 2 : (L.width || 3) + 2})" title="السماكة"><i data-lucide="baseline"></i></button><button onclick="ffLinkLabel()" title="عنوان على الخط"><i data-lucide="tag"></i></button><button class="del" onclick="ffDelete()" title="حذف"><i data-lucide="trash-2"></i></button></div>`;
  } else {
    const it = items[0], node = items.every(i => i.t === 'node' || i.t === 'text');
    el.innerHTML = (node ? `<div class="ff-ig ff-colors">${sw(it.color, 'ffSetColor')}</div>
      ${items.every(i => i.t === 'node') ? `<div class="ff-ig ff-pop-wrap"><button onclick="ffToggleMenu('ffShp2')" title="الشكل"><span class="ff-shp ff-shp-${it.shape}"></span></button><div class="ff-pop up" id="ffShp2">${FF_SHAPES.map(([k, t]) => `<button onclick="ffSet('shape','${k}');ffToggleMenu()"><span class="ff-shp ff-shp-${k}"></span>${t}</button>`).join('')}</div></div>` : ''}
      <div class="ff-ig"><button onclick="ffFont(-1)" title="تصغير الخط"><i data-lucide="a-arrow-down"></i></button><button onclick="ffFont(1)" title="تكبير الخط"><i data-lucide="a-arrow-up"></i></button><button class="${it.bold ? 'on' : ''}" onclick="ffSet('bold',${!it.bold})" title="عريض"><i data-lucide="bold"></i></button>
        <button onclick="ffSet('align','${{ right: 'center', center: 'left', left: 'right' }[it.align || 'center']}')" title="المحاذاة"><i data-lucide="${{ right: 'align-right', center: 'align-center', left: 'align-left' }[it.align || 'center']}"></i></button></div>` : '')
      + `<div class="ff-ig">${items.length === 1 && it.t === 'link' ? `<button onclick="window.open(${JSON.stringify(it.url || '')},'_blank','noopener')" title="فتح الرابط"><i data-lucide="external-link"></i></button>` : ''}
        <button onclick="ffArrange(1)" title="للأمام"><i data-lucide="bring-to-front"></i></button><button onclick="ffArrange(-1)" title="للخلف"><i data-lucide="send-to-back"></i></button>
        <button onclick="ffDuplicate()" title="تكرار ⌘D"><i data-lucide="copy-plus"></i></button><button class="${it.lock ? 'on' : ''}" onclick="ffSet('lock',${!it.lock})" title="قفل"><i data-lucide="${it.lock ? 'lock' : 'lock-open'}"></i></button>
        <button class="del" onclick="ffDelete()" title="حذف"><i data-lucide="trash-2"></i></button></div>`;
  }
  el.classList.add('show'); refreshIcons(); ffPlaceInsp();
}
function ffPlaceInsp() {
  const el = document.getElementById('ffInsp'); if (!el || !el.classList.contains('show') || !FF.b) return;
  const app = document.getElementById('ffApp').getBoundingClientRect(), vp = document.getElementById('ffVp').getBoundingClientRect(), v = FF.b.view;
  let bx, by;
  if (FF.link) { const L = FF.b.links.find(l => l.id === FF.link), A = L && ffItem(L.from), B = L && ffItem(L.to); if (!A || !B) return; bx = ((A.x + A.w / 2 + B.x + B.w / 2) / 2); by = Math.min(A.y, B.y); }
  else { const items = [...FF.sel].map(ffItem).filter(Boolean); if (!items.length) return; const bb = ffBounds(items); bx = (bb.x1 + bb.x2) / 2; by = bb.y1; }
  const sx = vp.left - app.left + bx * v.z + v.x, sy = vp.top - app.top + by * v.z + v.y;
  const w = el.offsetWidth, h = el.offsetHeight;
  let left = Math.min(Math.max(8, sx - w / 2), app.width - w - 8), top = sy - h - 30;
  if (top < vp.top - app.top + 8) top = sy + 40 + (FF.sel.size ? ([...FF.sel].map(ffItem).filter(Boolean).reduce((m, i) => Math.max(m, i.h), 0) * v.z) : 0);
  el.style.left = left + 'px'; el.style.top = Math.min(top, app.height - h - 70) + 'px';
}

/* ═════════ التعديل ═════════ */
function ffSnap() { const s = JSON.stringify({ items: FF.b.items, links: FF.b.links }); if (FF.undo[FF.undo.length - 1] !== s) { FF.undo.push(s); if (FF.undo.length > 80) FF.undo.shift(); FF.redo = []; } }
function ffUndo() { if (!FF.undo.length) return; FF.redo.push(JSON.stringify({ items: FF.b.items, links: FF.b.links })); const s = JSON.parse(FF.undo.pop()); FF.b.items = s.items; FF.b.links = s.links; ffAfter(); }
function ffRedo() { if (!FF.redo.length) return; FF.undo.push(JSON.stringify({ items: FF.b.items, links: FF.b.links })); const s = JSON.parse(FF.redo.pop()); FF.b.items = s.items; FF.b.links = s.links; ffAfter(); }
function ffAfter() { [...FF.sel].forEach(id => { if (!ffItem(id)) FF.sel.delete(id); }); if (FF.link && !FF.b.links.find(l => l.id === FF.link)) FF.link = null; ffRender(); ffSave(); }
function ffSave() {
  if (!FF.b) return; FF.b.updated = Date.now(); FF.b.grid = FF.grid;
  const s = document.getElementById('ffSaved'); if (s) s.textContent = 'جارٍ الحفظ…';
  clearTimeout(FF.saveT); FF.saveT = setTimeout(() => { save(); const s2 = document.getElementById('ffSaved'); if (s2) s2.textContent = 'محفوظ'; }, 450);
}
function ffCenterWorld() { const vp = document.getElementById('ffVp').getBoundingClientRect(), v = FF.b.view; return [(vp.width / 2 - v.x) / v.z, (vp.height / 2 - v.y) / v.z]; }
function ffMake(t, shape, x, y, extra) {
  const it = Object.assign({ id: ffId(), t, shape: shape || 'round', text: '', color: 'white', fs: 17, bold: false, align: 'center' }, extra || {});
  if (t === 'node' && shape === 'sticky') Object.assign(it, { w: 200, h: 200, color: extra && extra.color || 'cream', align: 'right' });
  else if (t === 'text') Object.assign(it, { w: 260, h: 52, color: 'white', fs: 21, align: 'right', clear: true });
  else if (!it.w) Object.assign(it, { w: shape === 'diamond' ? 170 : 200, h: shape === 'diamond' ? 120 : 72 });
  it.x = Math.round(x - it.w / 2); it.y = Math.round(y - it.h / 2);
  return it;
}
function ffAdd(t, shape) {
  ffSnap(); const [cx, cy] = ffCenterWorld();
  const it = ffMake(t === 'sticky' ? 'node' : t, t === 'sticky' ? 'sticky' : shape, cx + (Math.random() * 40 - 20), cy + (Math.random() * 40 - 20));
  FF.b.items.push(it); FF.sel = new Set([it.id]); FF.link = null; ffRender(); ffSave(); ffEdit(it.id, true);
}
function ffAddLink() {
  const url = prompt('الصق الرابط (Google Drive أو أي موقع):', 'https://'); if (!url || !/^https?:\/\/\S+$/.test(url.trim())) return;
  const title = prompt('عنوان يظهر على البطاقة:', '') || '';
  ffSnap(); const [cx, cy] = ffCenterWorld();
  const it = Object.assign(ffMake('link', null, cx, cy, { w: 280, h: 76 }), { url: url.trim(), text: title });
  it.x = Math.round(cx - 140); it.y = Math.round(cy - 38);
  FF.b.items.push(it); FF.sel = new Set([it.id]); ffRender(); ffSave();
}
async function ffImage(inp) {
  const f = inp.files[0]; inp.value = ''; if (!f) return;
  try {
    const blob = await rCompressImage(f, 1400, .8);
    const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    const im = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = url; });
    ffSnap(); const [cx, cy] = ffCenterWorld(); const w = Math.min(420, im.width), h = Math.round(w * im.height / im.width);
    const it = { id: ffId(), t: 'image', img: url, x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, color: 'white' };
    FF.b.items.push(it); FF.sel = new Set([it.id]); ffRender(); ffSave();
    if (url.length > 600000) rToast('صورة كبيرة — يفضّل رفع الصور الثقيلة على Drive وإضافة رابطها');
  } catch (e) { rToast('تعذّر إدراج الصورة', 1); }
}
function ffSetColor(k) { ffSnap(); [...FF.sel].forEach(id => { const i = ffItem(id); if (i) { i.color = k; if (i.t === 'text') i.clear = false; } }); ffRender(); ffSave(); }
function ffSet(k, v) { ffSnap(); [...FF.sel].forEach(id => { const i = ffItem(id); if (i) { i[k] = v; if (k === 'shape') { if (v === 'sticky') { i.w = Math.max(i.w, 180); i.h = Math.max(i.h, 180); } } } }); ffRender(); ffSave(); }
function ffFont(d) { ffSnap(); [...FF.sel].forEach(id => { const i = ffItem(id); if (!i) return; const k = FF_SIZES.findIndex(s => s >= (i.fs || 17)); i.fs = FF_SIZES[Math.min(FF_SIZES.length - 1, Math.max(0, (k < 0 ? 1 : k) + d))]; ffAutoH(i); }); ffRender(); ffSave(); }
function ffArrange(d) { ffSnap(); const ids = [...FF.sel], moving = FF.b.items.filter(i => ids.includes(i.id)), rest = FF.b.items.filter(i => !ids.includes(i.id)); FF.b.items = d > 0 ? rest.concat(moving) : moving.concat(rest); ffRender(); ffSave(); }
function ffDuplicate() {
  if (!FF.sel.size) return; ffSnap(); const map = {}, add = [];
  [...FF.sel].map(ffItem).filter(Boolean).forEach(i => { const c = JSON.parse(JSON.stringify(i)); c.id = ffId(); c.x += 30; c.y += 30; map[i.id] = c.id; add.push(c); });
  FF.b.links.filter(l => map[l.from] && map[l.to]).forEach(l => FF.b.links.push(Object.assign({}, l, { id: ffId(), from: map[l.from], to: map[l.to] })));
  FF.b.items.push(...add); FF.sel = new Set(add.map(i => i.id)); ffRender(); ffSave();
}
function ffDelete() {
  ffSnap();
  if (FF.link) { FF.b.links = FF.b.links.filter(l => l.id !== FF.link); FF.link = null; }
  else { const ids = new Set([...FF.sel].filter(id => !(ffItem(id) || {}).lock)); FF.b.items = FF.b.items.filter(i => !ids.has(i.id)); FF.b.links = FF.b.links.filter(l => !ids.has(l.from) && !ids.has(l.to)); FF.sel.clear(); }
  ffRender(); ffSave();
}
function ffLinkSet(k, v) { const L = FF.b.links.find(l => l.id === FF.link); if (!L) return; ffSnap(); L[k] = v; ffDrawLinks(); ffInsp(); ffSave(); }
function ffLinkLabel() { const L = FF.b.links.find(l => l.id === FF.link); if (!L) return; const t = prompt('عنوان على الخط:', L.label || ''); if (t === null) return; ffSnap(); L.label = t.trim(); ffDrawLinks(); ffSave(); }
function ffAutoH(i) {
  if (i.t !== 'node' && i.t !== 'text') return;
  const el = document.querySelector(`.ff-it[data-id="${i.id}"] .ff-txt`); if (!el) return;
  const need = el.scrollHeight + (i.shape === 'diamond' ? 60 : i.shape === 'ellipse' ? 36 : 24);
  if (i.shape !== 'sticky' && need > i.h) i.h = Math.round(need);
}

/* تحرير النص */
function ffEdit(id, selectAll, initial) {
  const i = ffItem(id); if (!i || i.lock || !(i.t === 'node' || i.t === 'text' || i.t === 'link')) return;
  if (i.t === 'link') { const t = prompt('عنوان البطاقة:', i.text || ''); if (t !== null) { ffSnap(); i.text = t; ffRender(); ffSave(); } return; }
  ffSnap(); FF.editing = id;
  // عند الكتابة بتكبير صغير (خاصة الجوال) نقرّب الفكرة لتصبح مقروءة
  const v = FF.b.view, vpEl = document.getElementById('ffVp');
  if (v.z < .7 && vpEl) { const r = vpEl.getBoundingClientRect(), z = Math.min(1, (r.width - 40) / Math.max(i.w, 1)); if (z > v.z) { v.z = z; v.x = r.width / 2 - (i.x + i.w / 2) * z; v.y = r.height * .4 - (i.y + i.h / 2) * z; ffApplyView(); ffSave(); } }
  ffDrawSel(); ffInsp();
  const el = document.querySelector(`.ff-it[data-id="${id}"] .ff-txt`); if (!el) return;
  el.contentEditable = 'true'; el.closest('.ff-it').classList.add('editing'); el.focus({ preventScroll: true });
  if (initial != null) el.textContent = initial;
  const r = document.createRange(); r.selectNodeContents(el); if (!selectAll || initial != null) r.collapse(false);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  el.oninput = () => { i.text = el.innerText.replace(/\n$/, ''); ffAutoH(i); el.closest('.ff-it').style.height = i.h + 'px'; ffDrawLinks(); };
  el.onblur = () => ffEndEdit();
  el.onkeydown = e => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); el.blur(); } e.stopPropagation(); };
}
function ffEndEdit() {
  const id = FF.editing; if (!id) return; FF.editing = null;
  const el = document.querySelector(`.ff-it[data-id="${id}"] .ff-txt`), i = ffItem(id);
  if (el && i) { i.text = el.innerText.replace(/\n$/, '').trim(); el.contentEditable = 'false'; el.closest('.ff-it').classList.remove('editing'); }
  ffDrawSel(); ffInsp(); ffSave();
}

/* ═════════ الخريطة الذهنية: فرعية/شقيقة/ترتيب ═════════ */
function ffParent(id) { const l = FF.b.links.find(x => x.to === id); return l ? l.from : null; }
function ffKids(id) { return FF.b.links.filter(l => l.from === id).map(l => ffItem(l.to)).filter(Boolean); }
function ffDir(it) { const p = ffItem(ffParent(it.id) || ''); if (!p) return -1; return (it.x + it.w / 2) < (p.x + p.w / 2) ? -1 : 1; }
function ffChild(fromId, dir) {
  const P = ffItem(fromId); if (!P) return;
  ffSnap();
  const d = dir || ffDir(P), kids = ffKids(P.id).filter(k => Math.sign((k.x + k.w / 2) - (P.x + P.w / 2)) === d);
  const tpl = kids[0] || (P.shape === 'sticky' ? P : null);
  const it = ffMake('node', tpl ? tpl.shape : (P.shape === 'pill' ? 'round' : P.shape), 0, 0, { color: tpl ? tpl.color : (['deep', 'teal'].includes(P.color) ? 'white' : P.color), fs: tpl ? tpl.fs : Math.min(P.fs || 17, 17) });
  it.x = Math.round(d < 0 ? P.x - 110 - it.w : P.x + P.w + 110);
  it.y = kids.length ? Math.round(Math.max(...kids.map(k => k.y + k.h)) + 28) : Math.round(P.y + P.h / 2 - it.h / 2);
  FF.b.items.push(it); FF.b.links.push({ id: ffId(), from: P.id, to: it.id, style: 'curve', arrow: 'none', color: '#41747F', width: 3 });
  FF.sel = new Set([it.id]); FF.link = null; ffRender(); ffSave(); ffEdit(it.id, true);
}
function ffSibling(id) { const p = ffParent(id); if (p) ffChild(p, ffDir(ffItem(id))); else ffChild(id); }
function ffQuick(side, fromId) {
  const P = ffItem(fromId); if (!P) return;
  if (side === 'e' || side === 'w') return ffChild(fromId, side === 'e' ? 1 : -1);
  ffSnap();
  const it = ffMake('node', P.shape, 0, 0, { color: P.color, fs: P.fs, w: P.w, h: P.h });
  it.x = P.x; it.y = side === 's' ? P.y + P.h + 90 : P.y - 90 - P.h;
  FF.b.items.push(it); FF.b.links.push({ id: ffId(), from: P.id, to: it.id, style: 'curve', arrow: 'none', color: '#41747F', width: 3 });
  FF.sel = new Set([it.id]); ffRender(); ffSave(); ffEdit(it.id, true);
}
function ffLayout() {
  if (!FF.b.items.length) return;
  let roots = [...FF.sel].map(ffItem).filter(i => i && i.t === 'node');
  if (!roots.length) roots = FF.b.items.filter(i => i.t === 'node' && !ffParent(i.id) && ffKids(i.id).length);
  if (!roots.length) { rToast('اربط الأفكار بخطوط أولاً، ثم رتّبها'); return; }
  ffSnap();
  const GX = 110, GY = 26, seen = new Set();
  const height = n => { if (seen.has(n.id)) return n.h; seen.add(n.id); const ks = ffKids(n.id); const s = ks.reduce((a, k) => a + height(k) + GY, -GY); return Math.max(n.h, ks.length ? s : n.h); };
  const place = (n, dir, cx, cy, vis) => {
    vis.add(n.id); n.x = Math.round(dir < 0 ? cx - n.w : cx); n.y = Math.round(cy - n.h / 2);
    const ks = ffKids(n.id).filter(k => !vis.has(k.id)); if (!ks.length) return;
    seen.clear(); const hs = ks.map(height), tot = hs.reduce((a, b) => a + b + GY, -GY); let y = cy - tot / 2;
    const nx = dir < 0 ? n.x - GX : n.x + n.w + GX;
    ks.forEach((k, i) => { place(k, dir, nx, y + hs[i] / 2, vis); y += hs[i] + GY; });
  };
  roots.forEach(r => {
    const vis = new Set([r.id]), ks = ffKids(r.id), left = ks.filter((_, i) => i % 2 === 0), right = ks.filter((_, i) => i % 2 === 1);
    const cy = r.y + r.h / 2;
    [[left, -1], [right, 1]].forEach(([grp, dir]) => {
      seen.clear(); const hs = grp.map(height), tot = hs.reduce((a, b) => a + b + GY, -GY); let y = cy - tot / 2;
      grp.forEach((k, i) => { place(k, dir, dir < 0 ? r.x - GX : r.x + r.w + GX, y + hs[i] / 2, vis); y += hs[i] + GY; });
    });
  });
  ffRender(); ffSave(); rToast('تم ترتيب الخريطة');
}

/* ═════════ التكبير والتحريك ═════════ */
function ffZoomAt(sx, sy, k) {
  const v = FF.b.view, nz = Math.min(4, Math.max(.15, v.z * k)); k = nz / v.z;
  v.x = sx - (sx - v.x) * k; v.y = sy - (sy - v.y) * k; v.z = nz; ffApplyView();
}
function ffZoomBy(k) { const vp = document.getElementById('ffVp').getBoundingClientRect(); ffZoomAt(vp.width / 2, vp.height / 2, k); ffSave(); }
function ffFit() {
  const vp = document.getElementById('ffVp'); if (!vp) return; const r = vp.getBoundingClientRect(), v = FF.b.view;
  if (!FF.b.items.length) { v.z = 1; v.x = r.width / 2; v.y = r.height / 2; ffApplyView(); return; }
  const bb = ffBounds(FF.b.items), pad = Math.min(80, r.width * .05), z = Math.min(1.2, Math.max(.15, Math.min((r.width - pad * 2) / (bb.x2 - bb.x1), (r.height - pad * 2) / (bb.y2 - bb.y1))));
  v.z = z; v.x = r.width / 2 - (bb.x1 + bb.x2) / 2 * z; v.y = r.height / 2 - (bb.y1 + bb.y2) / 2 * z; ffApplyView(); ffSave();
}
function ffGrid() { FF.grid = !FF.grid; document.getElementById('ffVp').classList.toggle('grid', FF.grid); document.getElementById('ffGridBtn').classList.toggle('on', FF.grid); ffSave(); }
function ffDark() { FF.b.dark = !FF.b.dark; document.getElementById('ffApp').classList.toggle('dark', FF.b.dark); ffSave(); }
/* ملء الشاشة: الصفحة كلها تدخل وضع الشاشة الكاملة واللوحة تغطيها — لتبقى النوافذ والتنبيهات ظاهرة (مناسب لشاشات العرض الكبيرة) */
function ffFull() {
  const a = document.getElementById('ffApp'); if (!a) return; const de = document.documentElement;
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if (fsEl || a.classList.contains('max')) { a.classList.remove('max'); if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document); ffFullSync(); return; }
  a.classList.add('max'); const req = de.requestFullscreen || de.webkitRequestFullscreen;
  if (req) { try { const p = req.call(de); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
  ffFullSync();
}
function ffFullSync() {
  const a = document.getElementById('ffApp'); if (!a) return;
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if (!fsEl && a.dataset.fs === '1') a.classList.remove('max'); // خرج بـ Esc
  a.dataset.fs = fsEl ? '1' : ''; const on = a.classList.contains('max');
  const b = document.getElementById('ffFullBtn'); if (b) { b.title = on ? 'خروج من ملء الشاشة (Esc)' : 'ملء الشاشة'; b.innerHTML = `<i data-lucide="${on ? 'minimize-2' : 'maximize-2'}"></i>`; refreshIcons(); }
  setTimeout(ffApplyView, 120);
}
function ffToggleMenu(id) { document.querySelectorAll('.ff-pop.show').forEach(p => { if (p.id !== id) p.classList.remove('show'); }); if (id) document.getElementById(id).classList.toggle('show'); }
function ffHelp() {
  openModal('اختصارات اللوحة', `<div class="ff-help">${[
    ['انقر مرتين على اللوحة', 'فكرة جديدة'], ['Tab', 'فكرة فرعية مربوطة'], ['Enter', 'فكرة شقيقة'], ['اكتب مباشرة / انقر مرتين', 'تعديل النص'],
    ['الأسهم حول العنصر', 'ضغطة = فكرة مربوطة · سحب = ربط بعنصر'], ['⌘Z / ⇧⌘Z', 'تراجع / إعادة'], ['⌘D', 'تكرار'], ['⌘C / ⌘V', 'نسخ / لصق'], ['⌘A', 'تحديد الكل'],
    ['Delete', 'حذف'], ['الأسهم (⇧ للخطوة الكبيرة)', 'تحريك دقيق'], ['مسافة + سحب، أو سحب بإصبعين', 'تحريك اللوحة'], ['⌘ + عجلة، أو قرص بإصبعين', 'تكبير وتصغير'], ['Esc', 'إلغاء التحديد']]
    .map(([k, t]) => `<div><kbd>${k}</kbd><span>${t}</span></div>`).join('')}</div>`, () => closeModal());
  const b = document.getElementById('mSave'); if (b) b.textContent = 'تم';
}

/* ═════════ الأحداث ═════════ */
function ffW(e) { const vp = document.getElementById('ffVp').getBoundingClientRect(), v = FF.b.view; return [(e.clientX - vp.left - v.x) / v.z, (e.clientY - vp.top - v.y) / v.z]; }
function ffBind() {
  const vp = document.getElementById('ffVp');
  document.removeEventListener('keydown', ffKey); document.addEventListener('keydown', ffKey);
  if (!FF.docBound) {
    FF.docBound = true;
    document.addEventListener('keyup', e => { if (e.code === 'Space') { FF.space = false; const v = document.getElementById('ffVp'); if (v) v.classList.remove('panning'); } });
    window.addEventListener('resize', () => FF.b && ffPlaceInsp());
    document.addEventListener('fullscreenchange', () => FF.b && ffFullSync()); document.addEventListener('webkitfullscreenchange', () => FF.b && ffFullSync());
  }
  vp.addEventListener('wheel', e => {
    e.preventDefault(); const r = vp.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) ffZoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * .0105));
    else { FF.b.view.x -= e.deltaX; FF.b.view.y -= e.deltaY; ffApplyView(); }
    clearTimeout(FF.vT); FF.vT = setTimeout(ffSave, 400);
  }, { passive: false });
  vp.addEventListener('scroll', () => { if (vp.scrollLeft || vp.scrollTop) { vp.scrollLeft = 0; vp.scrollTop = 0; } });
  vp.addEventListener('pointerdown', ffDown);
  vp.addEventListener('pointermove', ffMove);
  vp.addEventListener('pointerup', ffUp); vp.addEventListener('pointercancel', ffUp);
  vp.addEventListener('dblclick', e => {
    const itEl = e.target.closest('.ff-it');
    if (itEl) { ffEdit(itEl.dataset.id, true); return; }
    const ln = e.target.closest('[data-link]'); if (ln) { FF.link = ln.dataset.link; ffLinkLabel(); return; }
    const [x, y] = ffW(e); ffSnap(); const it = ffMake('node', 'round', x, y); FF.b.items.push(it); FF.sel = new Set([it.id]); FF.link = null; ffRender(); ffSave(); ffEdit(it.id, true);
  });
}
function ffDown(e) {
  if (!FF.b) return; ffToggleMenu();
  const vp = document.getElementById('ffVp'); vp.focus({ preventScroll: true });
  if (e.isPrimary) { FF.ptrs.clear(); FF.pinch = null; }
  FF.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (FF.ptrs.size === 2) { const [a, b] = [...FF.ptrs.values()]; FF.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; FF.act = null; return; }
  if (FF.editing && !e.target.closest('.ff-it.editing')) ffEndEdit();
  if (e.target.closest('.ff-it.editing')) return;
  const [wx, wy] = ffW(e), touch = e.pointerType === 'touch';
  const h = e.target.closest('[data-h]'), q = e.target.closest('[data-q]'), itEl = e.target.closest('.ff-it'), ln = e.target.closest('[data-link]');
  try { vp.setPointerCapture(e.pointerId); } catch (_) {}
  if (e.button === 1 || FF.space) { FF.act = { k: 'pan', sx: e.clientX, sy: e.clientY, vx: FF.b.view.x, vy: FF.b.view.y }; vp.classList.add('panning'); return; }
  if (h) { const it = ffItem([...FF.sel][0]); ffSnap(); FF.act = { k: 'resize', h: h.dataset.h, it, o: { x: it.x, y: it.y, w: it.w, h: it.h }, sx: wx, sy: wy }; return; }
  if (q) { FF.act = { k: 'qa', side: q.dataset.q, from: [...FF.sel][0], sx: wx, sy: wy, moved: false }; return; }
  if (itEl) {
    const id = itEl.dataset.id; FF.link = null;
    if (e.shiftKey || e.metaKey) { FF.sel.has(id) ? FF.sel.delete(id) : FF.sel.add(id); }
    else if (!FF.sel.has(id)) FF.sel = new Set([id]);
    ffDrawSel(); ffInsp();
    const items = [...FF.sel].map(ffItem).filter(i => i && !i.lock);
    FF.act = { k: 'move', sx: wx, sy: wy, items, o: items.map(i => [i.x, i.y]), moved: false };
    return;
  }
  if (ln) { FF.sel.clear(); FF.link = ln.dataset.link; ffDrawLinks(); ffDrawSel(); ffInsp(); return; }
  FF.link = null;
  if (touch) { FF.act = { k: 'pan', sx: e.clientX, sy: e.clientY, vx: FF.b.view.x, vy: FF.b.view.y }; FF.sel.clear(); ffDrawLinks(); ffDrawSel(); ffInsp(); return; }
  if (!e.shiftKey) FF.sel.clear();
  FF.act = { k: 'marq', sx: wx, sy: wy, base: new Set(FF.sel) }; ffDrawLinks(); ffDrawSel(); ffInsp();
}
function ffMove(e) {
  if (!FF.b) return;
  if (FF.ptrs.has(e.pointerId)) FF.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (FF.pinch && FF.ptrs.size === 2) {
    const [a, b] = [...FF.ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const r = document.getElementById('ffVp').getBoundingClientRect();
    FF.b.view.x += cx - FF.pinch.cx; FF.b.view.y += cy - FF.pinch.cy; ffZoomAt(cx - r.left, cy - r.top, d / FF.pinch.d);
    FF.pinch = { d, cx, cy }; return;
  }
  const A = FF.act; if (!A) return;
  const [wx, wy] = ffW(e), dx = wx - A.sx, dy = wy - A.sy;
  if (A.k === 'pan') { FF.b.view.x = A.vx + e.clientX - A.sx; FF.b.view.y = A.vy + e.clientY - A.sy; ffApplyView(); return; }
  if (A.k === 'move') {
    if (!A.moved && Math.hypot(dx, dy) * FF.b.view.z < 3) return;
    if (!A.moved) { ffSnap(); A.moved = true; document.getElementById('ffInsp').classList.remove('show'); }
    let ox = dx, oy = dy; const guides = ffGuides(A, dx, dy); ox = guides.dx; oy = guides.dy;
    A.items.forEach((it, k) => { it.x = Math.round(A.o[k][0] + ox); it.y = Math.round(A.o[k][1] + oy); const el = document.querySelector(`.ff-it[data-id="${it.id}"]`); if (el) { el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; } });
    ffDrawLinks(); ffDrawSel(); return;
  }
  if (A.k === 'resize') {
    const it = A.it, o = A.o, h = A.h, min = 40; let { x, y, w, h: hh } = o;
    if (h.includes('e')) w = Math.max(min, o.w + dx);
    if (h.includes('s')) hh = Math.max(min, o.h + dy);
    if (h.includes('w')) { w = Math.max(min, o.w - dx); x = o.x + o.w - w; }
    if (h.includes('n')) { hh = Math.max(min, o.h - dy); y = o.y + o.h - hh; }
    if (it.t === 'image' && h.length === 2) { const r = o.h / o.w; hh = Math.round(w * r); if (h.includes('n')) y = o.y + o.h - hh; }
    if (FF.grid && !e.altKey) { w = Math.round(w / 8) * 8; hh = Math.round(hh / 8) * 8; }
    Object.assign(it, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(hh) });
    const el = document.querySelector(`.ff-it[data-id="${it.id}"]`); if (el) Object.assign(el.style, { left: it.x + 'px', top: it.y + 'px', width: it.w + 'px', height: it.h + 'px' });
    ffDrawLinks(); ffDrawSel(); return;
  }
  if (A.k === 'qa') {
    if (Math.hypot(dx, dy) * FF.b.view.z > 6) A.moved = true;
    if (!A.moved) return;
    const P = ffItem(A.from), a = ffAnchor(P, wx, wy), tgt = ffHit(wx, wy, A.from);
    document.querySelectorAll('.ff-it.drop').forEach(x => x.classList.remove('drop'));
    if (tgt) document.querySelector(`.ff-it[data-id="${tgt.id}"]`).classList.add('drop');
    const b = tgt ? ffAnchor(tgt, a.x, a.y) : { x: wx, y: wy, nx: -a.nx, ny: -a.ny };
    ffDrawLinks(`<path d="${ffPath(a, b, 'curve').d}" stroke="#CAB05F" stroke-width="3" fill="none" stroke-dasharray="7 6"/>`); return;
  }
  if (A.k === 'marq') {
    const m = document.getElementById('ffMarq'), v = FF.b.view, x1 = Math.min(A.sx, wx), y1 = Math.min(A.sy, wy), x2 = Math.max(A.sx, wx), y2 = Math.max(A.sy, wy);
    Object.assign(m.style, { display: 'block', left: x1 * v.z + v.x + 'px', top: y1 * v.z + v.y + 'px', width: (x2 - x1) * v.z + 'px', height: (y2 - y1) * v.z + 'px' });
    FF.sel = new Set(A.base); FF.b.items.forEach(i => { if (i.x < x2 && i.x + i.w > x1 && i.y < y2 && i.y + i.h > y1) FF.sel.add(i.id); });
    ffDrawSel();
  }
}
function ffUp(e) {
  FF.ptrs.delete(e.pointerId); if (FF.ptrs.size < 2) FF.pinch = null;
  const A = FF.act; FF.act = null; if (!A || !FF.b) return;
  document.getElementById('ffVp').classList.remove('panning');
  document.getElementById('ffGuides').innerHTML = '';
  if (A.k === 'pan') { ffSave(); return; }
  if (A.k === 'move') { if (A.moved) ffSave(); ffInsp(); return; }
  if (A.k === 'resize') { ffSave(); ffInsp(); return; }
  if (A.k === 'marq') { document.getElementById('ffMarq').style.display = 'none'; ffInsp(); return; }
  if (A.k === 'qa') {
    document.querySelectorAll('.ff-it.drop').forEach(x => x.classList.remove('drop'));
    if (!A.moved) { ffQuick(A.side, A.from); return; }
    const [wx, wy] = ffW(e), tgt = ffHit(wx, wy, A.from);
    ffSnap();
    if (tgt) { if (!FF.b.links.some(l => (l.from === A.from && l.to === tgt.id) || (l.to === A.from && l.from === tgt.id))) FF.b.links.push({ id: ffId(), from: A.from, to: tgt.id, style: 'curve', arrow: 'end', color: '#41747F', width: 3 }); ffRender(); ffSave(); return; }
    const P = ffItem(A.from), it = ffMake('node', P.shape === 'pill' ? 'round' : P.shape, wx, wy, { color: ['deep', 'teal'].includes(P.color) ? 'white' : P.color });
    FF.b.items.push(it); FF.b.links.push({ id: ffId(), from: A.from, to: it.id, style: 'curve', arrow: 'none', color: '#41747F', width: 3 });
    FF.sel = new Set([it.id]); ffRender(); ffSave(); ffEdit(it.id, true);
  }
}
function ffHit(x, y, not) { for (let k = FF.b.items.length - 1; k >= 0; k--) { const i = FF.b.items[k]; if (i.id !== not && x >= i.x && x <= i.x + i.w && y >= i.y && y <= i.y + i.h) return i; } return null; }
/* خطوط المحاذاة + الالتقاط */
function ffGuides(A, dx, dy) {
  const g = document.getElementById('ffGuides'), moving = new Set(A.items.map(i => i.id));
  if (!A.items.length) return { dx, dy };
  const ob = ffBounds(A.items.map((i, k) => ({ x: A.o[k][0], y: A.o[k][1], w: i.w, h: i.h })));
  const bx = [ob.x1 + dx, (ob.x1 + ob.x2) / 2 + dx, ob.x2 + dx], by = [ob.y1 + dy, (ob.y1 + ob.y2) / 2 + dy, ob.y2 + dy];
  const th = 6 / FF.b.view.z; let sx = null, sy = null, lines = '';
  for (const o of FF.b.items) {
    if (moving.has(o.id)) continue;
    const ox = [o.x, o.x + o.w / 2, o.x + o.w], oy = [o.y, o.y + o.h / 2, o.y + o.h];
    for (const a of bx) for (const b of ox) if (Math.abs(a - b) < th && (sx === null || Math.abs(a - b) < Math.abs(sx.d))) sx = { d: b - a, at: b, o };
    for (const a of by) for (const b of oy) if (Math.abs(a - b) < th && (sy === null || Math.abs(a - b) < Math.abs(sy.d))) sy = { d: b - a, at: b, o };
  }
  if (sx) { dx += sx.d; lines += `<line x1="${sx.at}" y1="${Math.min(ob.y1 + dy, sx.o.y) - 30}" x2="${sx.at}" y2="${Math.max(ob.y2 + dy, sx.o.y + sx.o.h) + 30}"/>`; }
  else if (FF.grid) { dx = Math.round((ob.x1 + dx) / 8) * 8 - ob.x1; }
  if (sy) { dy += sy.d; lines += `<line x1="${Math.min(ob.x1 + dx, sy.o.x) - 30}" y1="${sy.at}" x2="${Math.max(ob.x2 + dx, sy.o.x + sy.o.w) + 30}" y2="${sy.at}"/>`; }
  else if (FF.grid) { dy = Math.round((ob.y1 + dy) / 8) * 8 - ob.y1; }
  g.innerHTML = lines; return { dx, dy };
}
function ffKey(e) {
  if (!FF.b || !document.getElementById('ffApp')) { document.removeEventListener('keydown', ffKey); return; }
  if (FF.editing || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || document.getElementById('modalRoot').innerHTML.trim()) return;
  const mod = e.metaKey || e.ctrlKey, one = FF.sel.size === 1 ? [...FF.sel][0] : null;
  if (e.code === 'Space') { FF.space = true; document.getElementById('ffVp').classList.add('panning'); e.preventDefault(); return; }
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? ffRedo() : ffUndo(); return; }
  if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); ffRedo(); return; }
  if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); ffDuplicate(); return; }
  if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); FF.sel = new Set(FF.b.items.map(i => i.id)); ffDrawSel(); ffInsp(); return; }
  if (mod && e.key.toLowerCase() === 'c') { if (FF.sel.size) { const ids = new Set(FF.sel); FF.clip = JSON.stringify({ items: FF.b.items.filter(i => ids.has(i.id)), links: FF.b.links.filter(l => ids.has(l.from) && ids.has(l.to)) }); } return; }
  if (mod && e.key.toLowerCase() === 'v') { if (!FF.clip) return; e.preventDefault(); ffSnap(); const c = JSON.parse(FF.clip), map = {}; c.items.forEach(i => { map[i.id] = ffId(); i.id = map[i.id]; i.x += 40; i.y += 40; }); c.links.forEach(l => { l.id = ffId(); l.from = map[l.from]; l.to = map[l.to]; }); FF.b.items.push(...c.items); FF.b.links.push(...c.links); FF.sel = new Set(c.items.map(i => i.id)); FF.clip = JSON.stringify({ items: c.items, links: c.links }); ffRender(); ffSave(); return; }
  if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); ffZoomBy(1.2); return; }
  if (mod && e.key === '-') { e.preventDefault(); ffZoomBy(1 / 1.2); return; }
  if (mod && e.key === '0') { e.preventDefault(); ffFit(); return; }
  if (e.key === 'Escape') { FF.sel.clear(); FF.link = null; ffDrawLinks(); ffDrawSel(); ffInsp(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') { if (FF.sel.size || FF.link) { e.preventDefault(); ffDelete(); } return; }
  if (e.key === 'Tab' && one) { e.preventDefault(); ffChild(one); return; }
  if (e.key === 'Enter' && one) { e.preventDefault(); e.shiftKey ? ffEdit(one, true) : ffSibling(one); return; }
  if (e.key === 'F2' && one) { e.preventDefault(); ffEdit(one, true); return; }
  if (e.key.startsWith('Arrow') && FF.sel.size) {
    e.preventDefault(); ffSnap(); const s = e.shiftKey ? 24 : 2, d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
    [...FF.sel].map(ffItem).forEach(i => { if (i && !i.lock) { i.x += d[0]; i.y += d[1]; } }); ffRender(); ffSave(); return;
  }
  if (!mod && !e.altKey) {
    if (e.key.toLowerCase() === 'n' && !one) { ffAdd('sticky'); e.preventDefault(); return; }
    if (e.key.toLowerCase() === 't' && !one) { ffAdd('text'); e.preventDefault(); return; }
    if (one && e.key.length === 1) { const i = ffItem(one); if (i && (i.t === 'node' || i.t === 'text')) { e.preventDefault(); ffEdit(one, false, e.key); } }
  }
}
