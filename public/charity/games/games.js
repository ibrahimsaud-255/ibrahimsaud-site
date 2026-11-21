/*
 * ألعاب القاعة بهويّة «حروف ودروس» — تُشغَّل من لابتوب القاعة على البروجكتر (الميسّر برمزه من «جوّال الميسّر»).
 * الرسوم من تطبيق حروف ودروس نفسه (assets/hex و assets/mil — صورٌ مُصيَّرة في بلندر) وأصواته وخطّه (Baloo Bhaijaan 2).
 *   • حروف: لوحة ٥×٥ ثلاثيّة الأبعاد بهندسة hexArt.ts نفسها — الفريق الأوّل أعلى↔أسفل، والثاني يمين↔يسار؛
 *     السؤال ملء الشاشة والميسّر يحكم «من أجاب صحّاً؟»، والفوز بكأس بلون الفريق ← يُضاف لنقاط فريقه في الموسم.
 *   • من سيربح المليون: سلّم ألواح، أجوبة بجواهر أ ب ج د، مؤقّت ٦٠ث، ٥٠:٥٠ والجمهور والاستبدال ← الجائزة نقاطاً لفريقه.
 * الأسئلة من بنك «حروف ودروس» عبر POST /season/questions (لا يُحمَّل البنك كاملاً). ?demo=1 بأسئلة توضيحيّة.
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search), LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname), DEMO = Q.get('demo') === '1';
  const API = LOCAL ? 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech' : 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech';
  const A = './assets/', $ = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  /* «لـ» + اسم الفريق: «الأخضر» ← «للأخضر»، وغيره ← «لـفهد» */
  /* المعدود: ١ نقطة واحدة، ٢ نقطتان، ٣–١٠ نقاط، ١١+ نقطة */
  const cnt = (n, one, two, few, many) => n === 1 ? one + ' واحدة' : n === 2 ? two : n >= 3 && n <= 10 ? ar(n) + ' ' + few : ar(n) + ' ' + many;
  const pts$ = n => cnt(n, 'نقطة', 'نقطتان', 'نقاط', 'نقطة');
  const li = n => /^ال/.test(String(n)) ? 'ل' + String(n).slice(1) : 'لـ' + n;
  const TOPICS = { general: 'عامّة', religion: 'دينيّة', history: 'تاريخ', geography: 'جغرافيا', science: 'علوم', language: 'لغة وأدب', art_culture: 'فنون وثقافة' };
  const GRADES = { 1: 'الأوّل الابتدائيّ', 2: 'الثاني الابتدائيّ', 3: 'الثالث الابتدائيّ', 4: 'الرابع الابتدائيّ', 5: 'الخامس الابتدائيّ', 6: 'السادس الابتدائيّ', 7: 'الأوّل المتوسّط', 8: 'الثاني المتوسّط', 9: 'الثالث المتوسّط', 10: 'الأوّل الثانويّ', 11: 'الثاني الثانويّ', 12: 'الثالث الثانويّ' };
  const I = { x: '<path d="M18 6 6 18M6 6l12 12"/>', vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>', mute: '<path d="M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>', ref: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', eyeoff: '<path d="M17.9 17.9A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.2 3.2M1 1l22 22"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>', play: '<path d="M5 3l14 9-14 9V3z"/>', undo: '<path d="M1 4v6h6"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>', next: '<path d="M19 12H5M12 19l-7-7 7-7"/>', again: '<path d="M23 4v6h-6"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/>' };
  const ic = (k, st) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"${st ? ` style="${st}"` : ''}>${I[k]}</svg>`;
  let auth = null, CAT = null, TEAMS = null;
  try { const s = JSON.parse(localStorage.getItem('jawwali2') || 'null'); if (s && s.mode === 'staff' && s.pin) auth = { code: s.code, pin: s.pin }; } catch (e) {}

  /* ═════════ الصوت (أصوات حروف ودروس) ═════════ */
  let SOUND = true; try { SOUND = localStorage.getItem('hg_snd') !== '0'; } catch (e) {}
  const SFX = {};
  function snd(name, vol) { if (!SOUND) return; try { const a = (SFX[name] = SFX[name] || new Audio(A + 'snd/' + name + '.m4a')); a.volume = vol == null ? .8 : vol; a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) {} }
  function toggleSound() { SOUND = !SOUND; try { localStorage.setItem('hg_snd', SOUND ? '1' : '0'); } catch (e) {} return SOUND; }

  /* ═════════ الخادم ═════════ */
  async function req(path, body) {
    const r = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, auth, body)) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر الاتّصال'); return d;
  }
  const api = body => DEMO ? Promise.resolve(demo(body)) : req('/season/questions', body);
  async function seasonTeams() {
    if (TEAMS) return TEAMS;
    if (DEMO) return (TEAMS = [{ id: 'g', name: 'الأخضر', color: '#16A34A' }, { id: 'r', name: 'الأحمر', color: '#DC2626' }, { id: 'b', name: 'الأزرق', color: '#2563EB' }, { id: 'o', name: 'البرتقاليّ', color: '#EA580C' }]);
    try { const d = await req('/season/staff', {}); TEAMS = ((d.season || {}).teams || []).filter(t => t && t.id); } catch (e) { TEAMS = []; }
    return TEAMS;
  }
  /* نقاط الفوز لفريقٍ في الموسم — بصلاحيّة الميسّر نفسه (الخادم يتحقّق من صلاحيّة النقاط) */
  async function awardPoints(teamId, pts, reason) {
    if (DEMO) return { ok: true };
    return req('/season/staff/act', { act: { kind: 'point', team: teamId, points: pts, reason } });
  }
  function toast(m, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = m; t.setAttribute('role', 'status'); document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }

  /* ═════════ ألوان حروف ودروس ═════════ */
  const HEX_COLORS = ['#00C6FF', '#FF9000', '#1FBF75', '#1A3365', '#FF4343', '#8B5CF6', '#EC4899', '#FFBB00'];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const readableOn = bg => contrast('#FFFFFF', bg) >= contrast('#1A3365', bg) ? '#FFFFFF' : '#1A3365';
  const darken = (h, p) => '#' + rgb(h).map(v => Math.round(v * (1 - p / 100)).toString(16).padStart(2, '0')).join('');
  const tint = (h, p) => '#' + rgb(h).map(v => Math.round(v + (255 - v) * p / 100).toString(16).padStart(2, '0')).join('');
  const inkOn = (c, s, min) => { let o = c; for (let k = 1; k <= 20 && contrast(o, s) < (min || 4.5); k++) o = darken(c, k * 5); return o; };
  /* لون فريق الموسم ← أقرب لون من ألوان بلاطات حروف الثمانية (بلا تكرار بين الفريقين) */
  function hexIdx(color, used) {
    const [r, g, b] = rgb(/^#[0-9a-f]{6}$/i.test(color || '') ? color : '#1A3365');
    return HEX_COLORS.map((c, i) => { const [x, y, z] = rgb(c); return [i, (x - r) ** 2 + (y - g) ** 2 + (z - b) ** 2]; }).filter(([i]) => !(used || []).includes(i)).sort((a, b) => a[1] - b[1])[0][0];
  }

  /* ═════════ الدخول والقائمة ═════════ */
  function login(msg) {
    $.innerHTML = `<div class="wrap"><div class="top"><div class="brandline"><img src="${A}logo.webp" alt="حروف ودروس"><div><h1>ألعاب القاعة</h1><div class="sub">ادخل برمز الموسم ورمزك كميسّر</div></div></div></div>
      <div class="card" style="max-width:520px"><div class="fld">رمز الموسم<input id="c" maxlength="6" dir="ltr" autocapitalize="characters"></div><br>
      <div class="fld">رمز الميسّر<input id="p" maxlength="6" dir="ltr" inputmode="numeric"></div><br>
      <p class="err" role="alert">${esc(msg || '')}</p><button class="xb go" id="go">دخول</button></div></div>`;
    document.getElementById('go').onclick = async () => {
      auth = { code: document.getElementById('c').value.trim().toUpperCase(), pin: document.getElementById('p').value.trim() };
      try { CAT = await api({ mode: 'catalog' }); menu(); } catch (e) { login(e.message); }
    };
  }
  async function start() {
    if (!DEMO && !auth) { login(); return; }
    try { CAT = await api({ mode: 'catalog' }); menu(); } catch (e) { auth = null; login(e.message); }
  }
  function menu() {
    clearTimers();
    $.innerHTML = `<div class="wrap"><div class="top"><div class="brandline"><img src="${A}logo.webp" alt="حروف ودروس"><div><h1>ألعاب القاعة</h1><div class="sub">${DEMO ? 'نسخة تجريبيّة بأسئلة قليلة' : 'أسئلة «حروف ودروس»: المنهج والثقافة العامّة'}</div></div></div>
      ${DEMO ? '' : `<button class="xb sec" id="out">${ic('out')} خروج</button>`}</div>
      <div class="games"><button class="game" data-g="letters"><span class="art">${flowerHTML(62, false)}</span><span><b>حروف</b><small>فريقان على لوحة الحروف — من يصل ضلعيه أوّلاً يفوز، والفوز نقاطٌ لفريقه في الموسم.</small></span></button>
        <button class="game" data-g="mm"><span class="art"><img src="${A}mil/hero.png" alt=""></span><span><b>من سيربح المليون</b><small>١٥ سؤالاً متدرّجة ومحطّتا أمان وثلاث مساعدات — لمتسابق أو فريق.</small></span></button></div></div>`;
    const o = document.getElementById('out'); if (o) o.onclick = () => { auth = null; login(); };
  }
  /* اختيار مصدر الأسئلة: الثقافة العامّة (بموضوعها) أو المنهج (بالصفّ والمادّة) */
  function sourcePicker() {
    const grades = [...new Set((CAT.curriculum || []).map(x => x.grade))].filter(g => g > 0).sort((a, b) => a - b);
    return `<div class="row"><div class="fld">المصدر<div class="seg" id="srcSeg"><button class="on" data-src="cultural">ثقافة عامّة</button><button data-src="curriculum">المنهج الدراسيّ</button></div></div>
      <div class="fld" id="fTopic">الموضوع<select id="topic"><option value="" selected>كلّ المواضيع</option>${(CAT.cultural || []).map(t => `<option value="${esc(t.topic)}">${esc(TOPICS[t.topic] || t.topic)} (${ar(t.n)})</option>`).join('')}</select></div>
      <div class="fld" id="fGrade" hidden>الصفّ<select id="grade">${grades.map(g => `<option value="${g}">${esc(GRADES[g] || g)}</option>`).join('')}</select></div>
      <div class="fld" id="fSubj" hidden>المادّة<select id="subj"></select></div></div>`;
  }
  function wireSource(root) {
    const fill = () => { const g = +root.querySelector('#grade').value; root.querySelector('#subj').innerHTML = (CAT.curriculum || []).filter(x => x.grade === g).map(x => `<option value="${esc(x.subject)}">${esc(x.ar || x.subject)} (${ar(x.n)})</option>`).join(''); };
    root.querySelector('#grade').onchange = fill; fill();
    root.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { root.querySelectorAll('[data-src]').forEach(x => x.classList.toggle('on', x === b)); const cur = b.dataset.src === 'curriculum'; root.querySelector('#fTopic').hidden = cur; root.querySelector('#fGrade').hidden = !cur; root.querySelector('#fSubj').hidden = !cur; });
  }
  function readSource(root) {
    const cur = root.querySelector('[data-src="curriculum"]').classList.contains('on');
    return cur ? { src: 'curriculum', grade: +root.querySelector('#grade').value, subject: root.querySelector('#subj').value } : { src: 'cultural', topic: root.querySelector('#topic').value };
  }

  /* ═════════ هندسة لوحة حروف (من lib/games3d/hexArt.ts و hexArtGoals.ts — بالبكسل عند K=140) ═════════ */
  const G = { K: 140, sin: .6691306063588582, cos: .7431448254773942, hexW: 1.7320508075688772, rowP: 1.5, topZ: .4, tw: 280, th: 269, ax: 140, ay: 115.18 };
  const BD = { w: 1474, h: 868, ox: 70.14, oy: 164.51, gridPad: 49, haloPad: 30.8,
    goals: { top: [73.96, 0, 1326, 73], bottom: [73.96, 795.33, 1326, 73], left: [0, 49.29, 70, 770], right: [1403.97, 49.29, 70, 770] } };
  const NAVY = '#1A3365', DIM = 'rgba(26,51,101,0.36)';
  /* بلاطة واحدة: ظلّ + هالة + وجه مُصيَّر + الحرف مائلاً على الوجه (scaleY = sin الميل) */
  function tileHTML(o) {
    const s = o.s, R = G.K * s, w = G.tw * s, h = G.th * s, fs = Math.max(14, R * 1.12);
    const lt = `left:${G.ax * s - R * .85}px;top:${G.ay * s - fs * .74}px;width:${R * 1.7}px;height:${fs * 1.48}px;font-size:${fs}px;line-height:${fs * 1.45}px;color:${o.color || NAVY}`;
    return `<div class="tile ${o.cls || ''}" ${o.i != null ? `data-i="${o.i}"` : ''} style="left:${o.left}px;top:${o.top}px;width:${w}px;height:${h}px;z-index:${o.z || 0};${o.style || ''}">
      <img class="sh" src="${A}hex/tile-shadow.png" alt=""><div class="hl"></div>
      <div class="face"><img src="${A}hex/tile-${o.key}.png" alt=""><div class="lt" style="${lt}"><span>${esc(o.letter || '')}</span></div></div>
      ${o.hit ? `<button class="hit" aria-label="${esc(o.hit)}" style="left:${G.ax * s - R * .86}px;top:${G.ay * s - R * .66}px;width:${R * 1.72}px;height:${R * 1.32}px"></button>` : ''}</div>`;
  }
  /* زهرة «حروف درس» (مقدّمة حروف ودروس) */
  const FLOWER = [[-.5, 1.5, 't0', 'ر', 1], [.5, 1.5, 't1', 'و', 2], [-1, 0, 't2', 'ف', 3], [0, 0, 't7', 'ح', 0], [1, 0, 't4', 'د', 4], [-.5, -1.5, 't5', 'ر', 5], [.5, -1.5, 't6', 'س', 6]];
  function flowerHTML(tileW, anim) {
    const s = tileW / G.tw, lat = G.K * s, spanX = G.hexW * 2 * lat + tileW, spanY = 3 * G.sin * lat + G.th * s;
    return `<div class="fl" style="position:relative;width:${spanX}px;height:${spanY}px">${FLOWER.map(([dx, dy, key, letter, order]) => {
      const cx = spanX / 2 + dx * G.hexW * lat, cy = spanY / 2 - dy * G.sin * lat;
      return tileHTML({ s, key, letter, left: cx - tileW / 2, top: cy - G.ay * s, z: 10 - Math.round(dy), color: key === 't7' ? NAVY : readableOn(HEX_COLORS[+key.slice(1)]), cls: anim ? 'drop' : '', style: `--dd:${order * 85}ms;--dh:${tileW * .7}px` });
    }).join('')}</div>`;
  }
  function intro(done) {
    const tileW = Math.max(64, Math.min(innerWidth * .22, innerHeight * .2, 170));
    const d = document.createElement('div'); d.className = 'intro'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = flowerHTML(tileW, true) + `<img class="logo" src="${A}logo.webp" alt="">`;
    document.body.appendChild(d); snd('correct', .6);
    setTimeout(() => { d.remove(); done(); }, 2030);
  }

  /* ═════════ حروف ═════════ */
  const AR = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
  const LN = l => { l = String(l || '').trim(); if (/^(ا|أ|إ|آ|ألف)/.test(l)) return 'أ'; if (l === 'هـ') return 'ه'; return l.length === 1 ? l : ''; };
  const HX = { teams: [], cells: [], pool: [], byL: {}, used: new Set(), src: null, turn: 0, sel: null, winPath: null, fresh: false, awarded: 0, pick: null };
  const tpickHTML = (list, sel) => list.map(t => `<button data-tid="${esc(t.id)}" style="--c:${esc(t.color)}" class="${sel.includes(t.id) ? 'on' : ''}"><i></i>${esc(t.name)}${sel.includes(t.id) ? `<em>${sel[0] === t.id ? 'أعلى ↔ أسفل' : 'يمين ↔ يسار'}</em>` : ''}</button>`).join('');
  async function lettersSetup() {
    const ts = await seasonTeams();
    let sel = HX.pick && HX.pick.length === 2 ? HX.pick.slice() : ts.slice(0, 2).map(t => t.id);
    $.innerHTML = `<div class="wrap"><div class="top"><div class="brandline"><img src="${A}logo.webp" alt=""><h1>حروف</h1></div><button class="xb sec" id="back">رجوع</button></div>
      <div class="card" id="setup">${sourcePicker()}
        <h3 class="sec">الفريقان</h3>${ts.length >= 2 ? `<div class="tpick" id="tp">${tpickHTML(ts, sel)}</div><p class="hint">اختر فريقين من فرق الموسم — فوز الجولة يُضاف لنقاط الفريق الفائز.</p>`
        : `<div class="row">${[0, 1].map(i => `<div class="fld">${i ? 'الفريق الثاني (يمين ↔ يسار)' : 'الفريق الأوّل (أعلى ↔ أسفل)'}<input id="tn${i}" value="${i ? 'الفريق البرتقاليّ' : 'الفريق السماويّ'}"></div>`).join('')}</div><p class="hint">لا فرق في الموسم بعد — تُلعب بلا نقاط.</p>`}
        <br><button class="xb go" id="go">${ic('play')} ابدأ اللعبة</button> <span class="err" id="e"></span></div></div>`;
    const root = document.getElementById('setup'); wireSource(root);
    document.getElementById('back').onclick = menu;
    const tp = document.getElementById('tp');
    if (tp) tp.onclick = e => { const b = e.target.closest('[data-tid]'); if (!b) return; const id = b.dataset.tid; sel = sel.includes(id) ? sel.filter(x => x !== id) : sel.concat(id).slice(-2); HX.pick = sel.slice(); tp.innerHTML = tpickHTML(ts, sel); };
    document.getElementById('go').onclick = async () => {
      const err = document.getElementById('e'), go = document.getElementById('go');
      let chosen;
      if (ts.length >= 2) { if (sel.length !== 2) { err.textContent = 'اختر فريقين'; return; } chosen = sel.map(id => ts.find(t => t.id === id)); }
      else chosen = [{ id: '', name: document.getElementById('tn0').value.trim() || 'الفريق الأوّل', color: '#00C6FF' }, { id: '', name: document.getElementById('tn1').value.trim() || 'الفريق الثاني', color: '#FF9000' }];
      const i0 = hexIdx(chosen[0].color), i1 = hexIdx(chosen[1].color, [i0]);
      HX.teams = chosen.map((t, k) => ({ id: t.id, name: t.name, idx: k ? i1 : i0, color: HEX_COLORS[k ? i1 : i0] }));
      HX.src = readSource(root); go.disabled = true;
      try { HX.pool = (await api(Object.assign({ mode: 'letters' }, HX.src))).q || []; } catch (e) { err.textContent = e.message; go.disabled = false; return; }
      if (HX.pool.length < 25) { err.textContent = 'الأسئلة قليلة لهذا الاختيار — اختر غيره'; go.disabled = false; return; }
      newBoard(); intro(paintBoard);
    };
  }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function newBoard() {
    HX.used = new Set(); HX.turn = 0; HX.sel = null; HX.winPath = null; HX.fresh = true; HX.awarded = 0;
    const byL = {}; HX.pool.forEach(q => { const l = LN(q.letter); if (l) (byL[l] = byL[l] || []).push(q); });
    const have = shuffle(AR.filter(l => (byL[l] || []).length)), rest = shuffle(AR.filter(l => !(byL[l] || []).length));
    HX.cells = have.concat(rest).slice(0, 25).map((l, i) => ({ r: Math.floor(i / 5), c: i % 5, l, owner: -1, done: false }));
    HX.byL = byL;
  }
  /* odd-r: الصفوف الفرديّة مُزاحة نصف خليّة (كما lib/hexBoard) */
  const NB = (r, c) => (r % 2 === 0 ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]).map(([dr, dc]) => [r + dr, c + dc]).filter(([a, b]) => a >= 0 && a < 5 && b >= 0 && b < 5);
  /* مسار الفوز: الأوّل من الصفّ الأعلى إلى الأسفل، والثاني من العمود ٠ إلى ٤ — يُعاد المسار نفسه لموجته الذهبيّة */
  function winPath(t) {
    const own = (r, c) => HX.cells[r * 5 + c].owner === t, prev = new Map(), q = [];
    (t === 0 ? [0, 1, 2, 3, 4].map(c => [0, c]) : [0, 1, 2, 3, 4].map(r => [r, 0])).filter(([r, c]) => own(r, c)).forEach(([r, c]) => { prev.set(r * 5 + c, -1); q.push([r, c]); });
    while (q.length) {
      const [r, c] = q.shift(), k = r * 5 + c;
      if ((t === 0 && r === 4) || (t === 1 && c === 4)) { const p = []; let x = k; while (x !== -1) { p.unshift(x); x = prev.get(x); } return p; }
      NB(r, c).forEach(([a, b]) => { const n = a * 5 + b; if (own(a, b) && !prev.has(n)) { prev.set(n, k); q.push([a, b]); } });
    }
    return null;
  }
  const score = t => HX.cells.filter(x => x.owner === t).length;
  function paintBoard(capIdx) {
    clearTimers();
    const round = HX.cells.filter(c => c.done).length + 1;
    $.innerHTML = `<div class="hx"><div class="hx-bar"><button class="puck" id="bx" aria-label="خروج"><img src="${A}mil/puck-safe.png" alt="">${ic('x')}</button>
        <div class="hx-round">${HX.winPath ? 'انتهت المسابقة' : `الجولة ${ar(round)}`}<small>${HX.winPath ? '' : `الدور: ${esc(HX.teams[HX.turn].name)} — اختر حرفاً`}</small></div>
        <div class="hx-tools"><button class="puck" id="snd" aria-label="الصوت"><img src="${A}mil/puck-future.png" alt="">${ic(SOUND ? 'vol' : 'mute')}</button><button class="puck" id="nb" aria-label="لوحة جديدة"><img src="${A}mil/puck-future.png" alt="">${ic('ref')}</button></div></div>
      <div class="hx-side">${HX.teams.map((t, k) => `<div class="tcard${k === HX.turn && !HX.winPath ? ' on' : ''}" style="--c:${t.color};--ce:${darken(t.color, 22)};--on:${readableOn(t.color)};--ink2:${inkOn(t.color, '#F6F8FC', 3)}"><div class="m"><i></i><b>${esc(t.name)}</b><span class="sc">${ar(score(k))}</span></div><small>${k ? 'يمين ↔ يسار' : 'أعلى ↔ أسفل'}<span class="turn"> · دوره</span></small></div>`).join('')}</div>
      <div class="hx-main" id="hm"></div></div>`;
    document.getElementById('bx').onclick = menu;
    document.getElementById('nb').onclick = () => { newBoard(); paintBoard(); };
    document.getElementById('snd').onclick = () => { toggleSound(); paintBoard(); };
    drawBoard(capIdx);
    HX.fresh = false;
  }
  function drawBoard(capIdx) {
    const m = document.getElementById('hm'); if (!m) return;
    const s = Math.max(.12, Math.min(m.clientWidth / BD.w, m.clientHeight / BD.h, 190 / G.K)), R = G.K * s;
    const gp = BD.gridPad * s, hp = BD.haloPad * s, active = HX.winPath ? -1 : HX.turn;
    const rail = side => { const [l, t, w, h] = BD.goals[side], team = side === 'top' || side === 'bottom' ? 0 : 1, hz = team === 0, tm = HX.teams[team], z = side === 'bottom' ? 45 : 0;
      return `${active === team ? `<div class="rh ${hz ? 'h' : 'v'}" style="--c:${tm.color};left:${l * s - hp}px;top:${t * s - hp}px;width:${w * s + 2 * hp}px;height:${h * s + 2 * hp}px;z-index:${z}"></div>` : ''}<img src="${A}hex/goal-${hz ? 'h' : 'v'}-${tm.idx}.png" alt="" style="left:${l * s}px;top:${t * s}px;width:${w * s}px;height:${h * s}px;z-index:${z};opacity:${active === team ? 1 : .85}">`; };
    const ripple = new Map(); if (capIdx != null) NB(HX.cells[capIdx].r, HX.cells[capIdx].c).forEach(([a, b], k) => ripple.set(a * 5 + b, k));
    const wr = new Map((HX.winPath || []).map((c, k) => [c, k]));
    const tiles = HX.cells.map((c, i) => {
      const X = G.hexW * (c.c + .5 + .5 * (c.r % 2)), Y = -G.rowP * c.r;
      const x = (BD.ox + X * G.K) * s, y = (BD.oy - (Y * G.sin + G.topZ * G.cos) * G.K) * s;
      const owner = c.owner >= 0 ? HX.teams[c.owner] : null, key = owner ? 't' + owner.idx : c.done ? 'dim' : 'neutral', open = !c.done && !HX.winPath;
      const cls = [HX.fresh ? 'drop' : '', HX.sel === i ? 'sel' : '', capIdx === i ? 'cap' : '', ripple.has(i) ? 'rip' : '', wr.has(i) ? 'win' : '', open ? 'can' : 'off'].filter(Boolean).join(' ');
      return tileHTML({ s, i, key, letter: c.l, left: x - G.ax * s, top: y - G.ay * s, z: c.r * 10 + c.c, cls, color: owner ? readableOn(owner.color) : c.done ? DIM : NAVY,
        style: `--dd:${c.r * 110 + (4 - c.c) * 30}ms;--dh:${R * .55}px;--rd:${(ripple.get(i) || 0) * 45}ms;--wd:${(wr.get(i) || 0) * 90}ms`, hit: open ? `الحرف ${c.l}` : '' });
    }).join('');
    m.innerHTML = `<div class="board" style="width:${BD.w * s}px;height:${BD.h * s}px"><img src="${A}hex/grid-shadow.png" alt="" style="left:${-gp}px;top:${-gp}px;width:${BD.w * s + 2 * gp}px;height:${BD.h * s + 2 * gp}px">${rail('top')}${rail('left')}${rail('right')}${tiles}${rail('bottom')}</div>`;
    m.querySelectorAll('.tile .hit').forEach(b => { b.onclick = () => pickCell(+b.closest('.tile').dataset.i); b.onmouseenter = () => snd('hex-tap', .2); });
  }
  addEventListener('resize', () => { if (document.getElementById('hm')) drawBoard(); });
  function pickQ(letter) {
    const list = (HX.byL[letter] || []).filter(q => !HX.used.has(q.id));
    const q = list[Math.floor(Math.random() * list.length)] || HX.pool.find(x => !HX.used.has(x.id)); if (q) HX.used.add(q.id); return q;
  }
  let TM = [];
  function clearTimers() { TM.forEach(t => { clearInterval(t); clearTimeout(t); }); TM = []; }
  function pickCell(i) {
    const cell = HX.cells[i]; if (!cell || cell.done || HX.winPath || document.querySelector('.qs')) return;
    HX.sel = i; snd('hex-tap', .7); drawBoard();
    TM.push(setTimeout(() => ask(i), 380));
  }
  const OPT_COLORS = ['#2979FF', '#FF9000', '#8B5CF6', '#00B8A9'], OPT_TILES = ['t0', 't1', 't5', 't2'];
  const barColor = f => f > .5 ? '#1FBF75' : f > .25 ? '#FFBB00' : '#FF3D3D';
  function mhex(key, text, size, color, k) { return `<span class="mhex" style="width:${size}px;height:${size * G.th / G.tw}px"><img src="${A}hex/tile-${key}.png" alt=""><span style="font-size:${size * (k || .42)}px;color:${color || '#fff'}">${esc(text || '')}</span></span>`; }
  /* شاشة السؤال ملء الشاشة (QuestionStage في حروف ودروس): شريط وقت ٣٠ث، سؤال كبير، والميسّر يحكم «من أجاب صحّاً؟» */
  function ask(i) {
    const cell = HX.cells[i]; let q = pickQ(cell.l); if (!q) { HX.sel = null; drawBoard(); toast('نفدت الأسئلة لهذا الحرف', 1); return; }
    const team = HX.teams[HX.turn];
    const box = document.createElement('div'); box.className = 'qs'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'سؤال الحرف ' + cell.l);
    let show = false, left = 30, T = null;
    const render = () => {
      const mcq = q.opts && q.opts.length === 4;
      box.innerHTML = `<div class="qs-corners"><button class="cbtn" data-q="close" aria-label="إغلاق">${ic('x')}</button><div><button class="cbtn" data-q="swap" aria-label="سؤال آخر" title="سؤال آخر">${ic('ref')}</button><button class="cbtn" data-q="snd" aria-label="الصوت">${ic(SOUND ? 'vol' : 'mute')}</button></div></div>
        <div class="qs-head">${mhex('t' + team.idx, '', 40)}<span class="qs-team" style="color:${inkOn(team.color, '#FFFFFF', 3)}">${esc(team.name)}</span>${mhex('selected', cell.l, 62, NAVY)}</div>
        <div class="tbar" role="progressbar" aria-label="الوقت المتبقّي"><u id="tb"></u><span id="tn"></span></div>
        <div class="qs-mid"><p class="qs-q">${esc(q.q)}</p>
          ${mcq ? `<div class="qs-opts">${q.opts.map((o, k) => { const ok = show && k === q.ci; return `<div class="qopt${ok ? ' ok' : show ? ' dim' : ''}" style="--t:${tint(OPT_COLORS[k], 91)}">${mhex(ok ? 't2' : OPT_TILES[k], ar(k + 1), 56)}<b>${esc(o)}</b>${ok ? ic('check', 'width:34px;height:34px') : ''}</div>`; }).join('')}</div>` : ''}
          ${show && !mcq ? `<div class="qs-ans">${esc(q.ans)}</div>` : ''}</div>
        <div class="judge"><b>من أجاب صحّاً؟</b><div class="jbtns">${HX.teams.map((t, k) => `<button class="jbtn" data-j="${k}" style="--c:${t.color};--on:${readableOn(t.color)}">${ic('check')}${esc(t.name)}</button>`).join('')}
          <button class="jbtn none" data-j="-1">${ic('x')}لا أحد</button><button class="jbtn rev" data-q="rev">${ic(show ? 'eyeoff' : 'eye')}${show ? 'إخفاء الإجابة' : 'إظهار الإجابة'}</button></div></div>`;
      tick();
    };
    const tick = () => { const f = Math.max(0, left / 30), u = box.querySelector('#tb'), n = box.querySelector('#tn'); if (!u) return; u.style.width = f * 100 + '%'; u.style.background = barColor(f); n.textContent = ar(Math.max(0, Math.ceil(left))); };
    const startTimer = () => { clearInterval(T); left = 30; tick(); T = setInterval(() => { left--; tick(); if (left <= 10 && left > 0) snd(left <= 5 ? 'urgentTick' : 'tick', .5); if (left <= 0) { clearInterval(T); snd('timeUp', .8); if (!show) { show = true; render(); } } }, 1000); TM.push(T); };
    const close = () => { clearInterval(T); box.remove(); };
    box.onclick = e => {
      const b = e.target.closest('[data-q],[data-j]'); if (!b) return;
      if (b.dataset.q === 'close') { close(); HX.sel = null; drawBoard(); return; }
      if (b.dataset.q === 'swap') { const n = pickQ(cell.l); if (n) { q = n; show = false; render(); startTimer(); } else toast('لا سؤال آخر لهذا الحرف', 1); return; }
      if (b.dataset.q === 'snd') { toggleSound(); render(); return; }
      if (b.dataset.q === 'rev') { show = !show; render(); return; }
      if (b.dataset.j != null) { close(); judge(i, +b.dataset.j); }
    };
    render(); document.body.appendChild(box); startTimer();
  }
  function judge(i, t) {
    const cell = HX.cells[i]; cell.done = true; HX.sel = null;
    if (t >= 0) { cell.owner = t; HX.turn = t; snd('correct'); } else { HX.turn = 1 - HX.turn; snd('wrong', .7); }
    const wp = t >= 0 ? winPath(t) : null;
    if (wp) { HX.winPath = wp; paintBoard(i); snd('decisive'); TM.push(setTimeout(() => winOverlay(t), 2000)); return; }
    paintBoard(t >= 0 ? i : null);
    if (HX.cells.every(c => c.done)) { const a = score(0), b = score(1); TM.push(setTimeout(() => winOverlay(a === b ? 'draw' : a > b ? 0 : 1, true), 900)); }
  }
  function confetti(colors) {
    const c = document.createElement('div'); c.className = 'confetti';
    c.innerHTML = Array.from({ length: 70 }, () => `<i style="left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-duration:${2.2 + Math.random() * 2}s;animation-delay:${Math.random() * .8}s;--r:${Math.random() * 900 - 450}deg"></i>`).join('');
    document.body.appendChild(c); setTimeout(() => c.remove(), 5200);
  }
  /* الفوز (WinOverlay): كأسٌ على منصّة بلون الفريق، ورموز الفرق بنتائجها، ونقاط الفوز للفريق في الموسم */
  function winOverlay(w, byScore) {
    snd('win');
    const team = typeof w === 'number' ? HX.teams[w] : null, trophy = team ? team.idx : 8;
    confetti(team ? [team.color, '#FFBB00', '#FFFFFF', darken(team.color, 20)] : HEX_COLORS);
    const o = document.createElement('div'); o.className = 'win'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'النتيجة');
    const ranked = HX.teams.map((t, k) => Object.assign({ k, sc: score(k) }, t)).sort((a, b) => b.sc - a.sc || a.k - b.k);
    let pts = 20;
    const paint = () => {
      o.innerHTML = `<img class="tro" src="${A}hex/trophy-t${trophy}.png" alt="كأس الفوز">
        ${team ? `<h2 style="color:${inkOn(team.color, '#EEF5FD', 3.2)}">${esc(team.name)}</h2><p>${byScore ? 'يفوز بأعلى نقاط' : 'وصل بين الضلعين وفاز'}</p>` : `<h2 style="color:${NAVY}">تعادل!</h2><p>لعبة رائعة من الفريقين</p>`}
        <div class="tokens">${ranked.map(t => `<div class="token">${mhex('t' + t.idx, ar(t.sc), typeof w === 'number' && w === t.k ? 110 : 92, readableOn(t.color), .66)}<small>${esc(t.name)}</small></div>`).join('')}</div>
        ${team && team.id ? `<div class="ptsbox">${HX.awarded ? `<span class="done-ok">✓ أُضيفت ${pts$(HX.awarded)} ${esc(li(team.name))}</span>` : `<b>نقاط الفوز لفريق ${esc(team.name)} في الموسم</b>
          <div class="chips">${[10, 20, 30, 50].map(n => `<button data-p="${n}" class="${n === pts ? 'on' : ''}">${ar(n)}</button>`).join('')}</div>
          <button class="xb go" id="aw">${ic('check')} أضف ${pts$(pts)} ${esc(li(team.name))}</button>`}</div>` : ''}
        <div class="btnrow"><button class="xb" id="again">${ic('again')} العب مجدداً</button><button class="xb sec" id="home">القائمة</button></div>`;
    };
    paint();
    o.onclick = async e => {
      const p = e.target.closest('[data-p]'); if (p) { pts = +p.dataset.p; paint(); return; }
      const aw = e.target.closest('#aw');
      if (aw && team && team.id && !HX.awarded) {
        aw.disabled = true;
        try { await awardPoints(team.id, pts, 'فوز في خلية الحروف'); HX.awarded = pts; snd('tool-point'); toast(`أُضيفت ${pts$(pts)} ${li(team.name)}`); paint(); }
        catch (er) { toast(er.message, 1); aw.disabled = false; }
        return;
      }
      if (e.target.closest('#again')) { o.remove(); newBoard(); intro(paintBoard); return; }
      if (e.target.closest('#home')) { o.remove(); menu(); }
    };
    document.body.appendChild(o);
  }

  /* ═════════ من سيربح المليون (بهويّة حروف ودروس) ═════════ */
  const fmt = n => n === 1000000 ? 'مليون' : n.toLocaleString('ar-SA');
  const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000].map((p, i) => ({ level: i + 1, prize: p, safe: i === 4 || i === 9, label: fmt(p) }));
  const fallback = lvl => { for (let i = lvl - 2; i >= 0; i--) if (LADDER[i].safe) return LADDER[i].prize; return 0; };
  const PF = { cap: 190 / 242, top: 17 / 242, bot: 137 / 242, x0: 67 / 242 };
  const LETTERS = ['a', 'b', 'c', 'd'], GEMC = { a: '#00C6FF', b: '#FF9000', c: '#8B5CF6', d: '#EC4899' };
  /* لوحٌ سداسيّ الطرفين (Plate3D): قبّة + شريحة تُمطّ + القبّة مقلوبة؛ المحتوى في الوجه الأبيض العلويّ */
  function plateLayers(v, h) { const cap = Math.round(h * PF.cap); return `<span class="mid" style="left:${cap - 1}px;right:${cap - 1}px;background-image:url(${A}mil/plate-${v}-mid.png)"></span><img class="cap a" src="${A}mil/plate-${v}-cap.png" alt="" style="width:${cap}px"><img class="cap b" src="${A}mil/plate-${v}-cap.png" alt="" style="width:${cap}px">`; }
  function plate(v, w, h, inner, padX) {
    const t = h * PF.top, fh = h * (PF.bot - PF.top), ins = h * PF.x0 + (padX == null ? 6 : padX);
    return `<span class="plate" style="width:${w}px;height:${h}px"><span class="pl">${plateLayers(v, h)}</span><span class="fc" style="top:${t}px;height:${fh}px;left:${ins}px;right:${ins}px">${inner}</span></span>`;
  }
  function plateBtn(v, label, icon, w, h, id, after) {
    const light = ['orange', 'navy', 'ok', 'bad'].includes(v), fs = Math.max(14, Math.round(h * .3)), ii = icon ? ic(icon, `width:${fs * 1.1}px;height:${fs * 1.1}px`) : '';
    return `<button class="pbtn${light ? ' lt' : ''}" id="${id}" aria-label="${esc(label)}">${plate(v, w, h, `${after ? '' : ii}<span style="font-size:${fs}px">${esc(label)}</span>${after ? ii : ''}`)}</button>`;
  }
  const raysSVG = color => `<svg class="rays" viewBox="0 0 200 200" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => { const st = Math.PI * 2 / 18, a0 = i * st, a1 = a0 + st * .42; return `<path d="M100 100L${100 + 100 * Math.cos(a0)} ${100 + 100 * Math.sin(a0)}L${100 + 100 * Math.cos(a1)} ${100 + 100 * Math.sin(a1)}Z" fill="${color || '#FFBB00'}" fill-opacity=".11"/>`; }).join('')}</svg>`;
  const exitPuck = id => `<button class="puck" id="${id}" aria-label="خروج"><img src="${A}mil/puck-safe.png" alt="">${ic('x')}</button>`;
  const MM = { round: [], spare: [], i: 0, sel: null, phase: 'start', hidden: [], audience: null, life: { fifty: true, audience: true, swap: true }, src: null, player: '', team: null, awarded: false, left: 60, qid: null };
  async function mmSetup() {
    clearTimers();
    const ts = await seasonTeams();
    $.innerHTML = `<div class="wrap"><div class="top"><div class="brandline"><img src="${A}mil/hero.png" alt="" style="height:76px"><h1>من سيربح المليون</h1></div><button class="xb sec" id="back">رجوع</button></div>
      <div class="card" id="setup">${sourcePicker()}<br><div class="row"><div class="fld">اسم المتسابق أو الفريق<input id="pl" placeholder="مثلاً: سعد أو الفريق الأزرق"></div>
        ${ts.length ? `<div class="fld">فريقه في الموسم<select id="tm"><option value="">بلا فريق</option>${ts.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select></div>` : ''}</div>
        <p class="hint">إن اخترت فريقه تتحوّل جائزته في النهاية نقاطاً لفريقه (كلّ درجة = ٥ نقاط).</p>
        <br><button class="xb or" id="go">${ic('play')} التالي</button> <span class="err" id="e"></span></div></div>`;
    const root = document.getElementById('setup'); wireSource(root);
    document.getElementById('back').onclick = menu;
    document.getElementById('go').onclick = async () => {
      const err = document.getElementById('e'), go = document.getElementById('go');
      MM.src = readSource(root); MM.player = document.getElementById('pl').value.trim(); const tm = document.getElementById('tm'); MM.team = tm && tm.value ? ts.find(t => t.id === tm.value) : null;
      go.disabled = true;
      try { const [a, b] = await Promise.all([api(Object.assign({ mode: 'mcq' }, MM.src)), api(Object.assign({ mode: 'mcq' }, MM.src)).catch(() => ({ q: [] }))]); MM.round = a.q || []; MM.spare = b.q || []; }
      catch (e) { err.textContent = e.message; go.disabled = false; return; }
      if (MM.round.length < 15) { err.textContent = 'لم تكفِ الأسئلة لهذا الاختيار — اختر غيره'; go.disabled = false; return; }
      mmStart();
    };
  }
  /* شاشة البداية: شعارٌ ثلاثيّ يطفو على أشعّة */
  function mmStart() {
    clearTimers(); MM.phase = 'start';
    const hs = Math.max(220, Math.min(innerHeight * .62, innerWidth * .34, 440)), bh = Math.round(Math.max(62, Math.min(80, innerHeight * .085)));
    $.innerHTML = `<div class="mstart">${exitPuck('sx')}<div class="hero" style="--h:${hs}px">${raysSVG()}<img class="fl" src="${A}mil/hero.png" alt=""></div>
      <div class="mtext"><span class="t1">من سيربح</span><span class="t2">المليون؟</span><p>${MM.player ? `${esc(MM.player)} · ` : ''}١٥ سؤالاً · محطّتان أمان · ثلاث مساعدات</p>
        <div class="llrow">${['fifty', 'audience', 'swap'].map(k => `<img src="${A}mil/ll-${k}.png" alt="">`).join('')}</div>${plateBtn('orange', 'ابدأ اللعب', 'play', Math.round(bh * 3.7), bh, 'go')}</div></div>`;
    document.getElementById('sx').onclick = menu;
    document.getElementById('go').onclick = () => { MM.i = 0; MM.sel = null; MM.hidden = []; MM.audience = null; MM.qid = null; MM.life = { fifty: true, audience: true, swap: true }; MM.awarded = false; MM.phase = 'playing'; mmPlay(); };
  }
  function mmPlay() {
    clearTimers();
    const q = MM.round[MM.i], step = LADDER[MM.i], W = innerWidth, H = innerHeight, wide = W > 900;
    const k = Math.max(.85, Math.min(1.5, Math.min(W / 1280, H / 800))), sS = Math.round(52 * Math.min(k, 1.3));
    $.innerHTML = `<div class="mm"><div class="mm-bar"><div>${exitPuck('mx')}<div class="stage"><span class="pk" style="--s:${sS}px"><img src="${A}mil/puck-current.png" alt=""><b>${ar(MM.i + 1)}</b></span><span><small>السؤال ${ar(MM.i + 1)} من ١٥</small><strong>${step.label} ريال</strong></span></div></div>
        ${MM.i > 0 ? plateBtn('gold', 'انسحاب', 'out', Math.round(150 * Math.min(k, 1.3)), Math.round(58 * Math.min(k, 1.3)), 'walk') : '<span></span>'}</div>
      <div class="mm-body">${wide ? `<div class="lls" id="lls">${llHTML()}</div>` : ''}<div class="play" id="play"></div>${wide ? '<div class="tower" id="tower"></div>' : ''}</div></div>`;
    document.getElementById('mx').onclick = menu;
    const wk = document.getElementById('walk'); if (wk) wk.onclick = () => { if (MM.phase === 'playing' || MM.phase === 'selected') mmEnd('won', LADDER[MM.i - 1].prize, true); };
    wireLL(); paintTower(); paintPlay(q);
  }
  function llHTML() { return [['fifty', '٥٠:٥٠'], ['audience', 'الجمهور'], ['swap', 'استبدال']].map(([key, n]) => `<button class="ll" data-ll="${key}" ${MM.life[key] && MM.phase === 'playing' ? '' : 'disabled'} aria-label="${n}"><img src="${A}mil/ll-${key}${MM.life[key] ? '' : '-used'}.png" alt=""><b>${n}</b></button>`).join(''); }
  function wireLL() { document.querySelectorAll('[data-ll]').forEach(b => b.onclick = () => useLL(b.dataset.ll, b)); }
  /* السلّم: برجٌ من ألواحٍ سداسيّة — المجتازة ذهبيّة، الحاليّة برتقاليّة تنبض، والأمان كحليّة بدرع، وعملةٌ تتسلّق */
  function paintTower() {
    const box = document.getElementById('tower'); if (!box) return;
    const boxH = box.clientHeight, w = box.clientWidth, stride = (boxH - 6) / 15.2, himg = Math.max(30, Math.min(64, stride / .8)), rs = himg * .8;
    const ft = himg * PF.top, fh = himg * (PF.bot - PF.top), coin = Math.round(himg * .62), cur = MM.i + 1, total = rs * 14 + himg + 4;
    box.innerHTML = `<div style="position:relative;width:${w}px;height:${total}px;margin-top:${Math.max(0, (boxH - total) / 2)}px">${[...LADDER].reverse().map((s, idx) => {
      const isCur = s.level === cur, past = s.level < cur, v = isCur ? 'orange' : past ? 'gold' : s.safe ? 'navy' : 'idle', light = isCur || (s.safe && !past);
      return `<div class="stp${isCur ? ' cur' : ''}${light ? ' lt' : ''}" style="top:${idx * rs}px;height:${himg}px;z-index:${isCur ? 40 : idx}">${plate(v, w, himg, `<span style="width:22px;text-align:center;opacity:.8;font-size:${Math.max(11, himg * .24)}px">${ar(s.level)}</span><span style="flex:1;text-align:center;font-size:${Math.max(13, himg * .34)}px;line-height:${himg * .5}px;white-space:nowrap">${s.label}</span><span style="width:22px;display:grid;place-items:center">${s.safe ? `<img src="${A}mil/shield.png" alt="" style="width:${Math.max(18, himg * .38)}px">` : s.level === 15 ? `<img src="${A}mil/trophy.png" alt="" style="width:${himg * .9}px;margin-top:${-himg * .15}px">` : ''}</span>`, 2)}</div>`;
    }).join('')}<img class="coin" src="${A}mil/piece-coin.png" alt="" style="width:${coin}px;right:${-coin * .45}px;top:${ft + fh / 2 - coin / 2 + 2 + (15 - cur) * rs}px"></div>`;
  }
  /* منطقة اللعب: السؤال والمؤقّت، والأجوبة ألواح بجواهر، والتأكيد النهائيّ */
  function paintPlay(q) {
    const play = document.getElementById('play'); if (!play) return;
    const W = play.clientWidth, H = innerHeight, k = Math.max(.85, Math.min(1.5, Math.min(innerWidth / 1280, H / 800))), kk = Math.min(k, 1.4);
    const gap = Math.round(12 * kk), plateW = Math.floor((W - gap) / 2), plateH = Math.round(Math.max(92, Math.min(H * .15, 150 * kk)));
    const fH = plateH * (PF.bot - PF.top), ft = plateH * PF.top, ins = plateH * PF.x0, cap = Math.round(plateH * PF.cap), gem = Math.round(fH * 1.22);
    const longest = Math.max(...q.o.map(s => String(s).length)), fs = Math.max(16, Math.min(fH * .42, (plateW - ins * 2 - gem) / Math.max(6, longest * .52)));
    const d = Math.round(Math.min(96 * kk, H * .12)), bh = Math.round(Math.min(64 * Math.min(kk, 1.3), H * .075));
    const ansHTML = i => {
      const hid = MM.hidden.includes(i), sel = MM.sel === i, rev = MM.phase === 'revealed', ok = rev && i === q.c, bad = rev && sel && i !== q.c, L = LETTERS[i];
      const st = ok ? 'ok' : bad ? 'bad' : hid ? 'off' : sel ? 'sel' : 'idle';
      const over = ok ? plateLayers('ok', plateH) : bad ? plateLayers('bad', plateH) : hid ? plateLayers('off', plateH) : sel ? plateLayers('sel', plateH) + `<span class="hi" style="position:absolute;inset:0">${plateLayers('selhi', plateH)}</span>` : '';
      const pct = MM.audience && !hid && !ok && !bad ? ` <em>${ar(MM.audience[i])}٪</em>` : '';
      return `<button class="ans ${st === 'idle' ? '' : st}" data-a="${i}" style="height:${plateH}px;--ad:${160 + i * 80}ms" ${MM.phase !== 'playing' || hid ? 'disabled' : ''} aria-label="خيار ${'أبجد'[i]}: ${esc(hid ? 'محذوف' : q.o[i])}">
        <span class="plate" style="width:${plateW}px;height:${plateH}px"><span class="pl">${plateLayers('idle', plateH)}</span>${over ? `<span class="pl">${over}</span>` : ''}
        <img class="gem" src="${A}mil/gem-${L}-${st}.png" alt="" style="width:${gem}px;height:${gem}px;right:${cap * .2}px;top:${ft + fH / 2 - gem / 2 - 2}px">
        <span class="fc" style="top:${ft + plateH * .015}px;height:${fH}px;right:${ins + gem * .78 + 4}px;left:${ins + 8}px;font-size:${fs}px">${esc(q.o[i])}${pct}</span></span></button>`;
    };
    const r = d * .31, C = 2 * Math.PI * r;
    const ring = `<svg viewBox="0 0 ${d} ${d}" aria-hidden="true"><circle cx="${d * .485}" cy="${d * .5}" r="${r}" stroke="#E3E9F2" stroke-width="${d * .085}" fill="none"/><circle id="ring" cx="${d * .485}" cy="${d * .5}" r="${r}" stroke="#1FBF75" stroke-width="${d * .085}" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0" transform="rotate(-90 ${d * .485} ${d * .5})" style="transition:stroke-dashoffset .1s linear,stroke .4s"/></svg>`;
    play.innerHTML = `<div class="qrow"><div class="dial" id="dial" style="--d:${d}px" role="progressbar" aria-label="الوقت المتبقّي"><img src="${A}mil/dial.png" alt="">${ring}<b id="dsec">٦٠</b></div><h2>${esc(q.q)}</h2></div>
      <div class="answers" style="--g:${gap}px">${[[0, 1], [2, 3]].map(rr => `<div class="arow" style="margin-bottom:${gap - plateH * .1}px">${rr.map(ansHTML).join('')}</div>`).join('')}</div>
      ${MM.phase === 'selected' ? `<div class="confirm"><b>هل هذه إجابتك النهائيّة؟</b><div class="btnrow">${plateBtn('orange', 'تأكيد نهائي', 'check', Math.round(bh * 3.3), bh, 'cf')}${plateBtn('idle', 'تراجع', 'undo', Math.round(bh * 2.6), bh, 'cn')}</div></div>` : ''}
      ${MM.phase === 'revealed' ? `<div class="confirm">${plateBtn('orange', MM.sel === q.c ? (MM.i >= 14 ? 'مبروك — المليون!' : `المتابعة إلى السؤال ${ar(MM.i + 2)}`) : 'متابعة', 'next', Math.round(bh * (MM.sel === q.c ? 5.4 : 3.4)), bh, 'nx', true)}</div>` : ''}
      ${innerWidth <= 900 ? `<div class="btnrow">${llHTML()}</div>` : ''}`;
    play.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { if (MM.phase !== 'playing') return; MM.sel = +b.dataset.a; MM.phase = 'selected'; snd('mil-select', .7); paintPlay(q); syncLL(); });
    const cf = document.getElementById('cf'); if (cf) cf.onclick = () => confirmAns(q);
    const cn = document.getElementById('cn'); if (cn) cn.onclick = () => { MM.sel = null; MM.phase = 'playing'; paintPlay(q); syncLL(); };
    const nx = document.getElementById('nx'); if (nx) nx.onclick = () => nextQ(q);
    if (innerWidth <= 900) wireLL();
    runDial(q, d);
  }
  const syncLL = () => { const l = document.getElementById('lls'); if (l) { l.innerHTML = llHTML(); wireLL(); } };
  function setDial(left, d) {
    const r = d * .31, C = 2 * Math.PI * r, f = Math.max(0, Math.min(1, left / 60)), ring = document.getElementById('ring'), s = document.getElementById('dsec'), dial = document.getElementById('dial');
    if (!ring) return; ring.setAttribute('stroke-dashoffset', C * (1 - f)); ring.setAttribute('stroke', f > .5 ? '#1FBF75' : f > .25 ? '#FFBB00' : '#FF3D3D'); s.textContent = ar(Math.ceil(left));
    dial.classList.toggle('urg', MM.phase === 'playing' && left <= 10 && left > 0);
  }
  let DT = null;
  /* مؤقّت ٦٠ث يتوقّف عند الاختيار ويستأنف إن تراجع — وانتهاؤه خسارةٌ بجائزة محطّة الأمان */
  function runDial(q, d) {
    clearInterval(DT);
    if (MM.qid !== MM.i + ':' + q.q) { MM.qid = MM.i + ':' + q.q; MM.left = 60; }
    setDial(MM.left, d);
    if (MM.phase !== 'playing') return;
    let last = Math.ceil(MM.left);
    DT = setInterval(() => {
      MM.left = Math.max(0, MM.left - .1); setDial(MM.left, d);
      const sec = Math.ceil(MM.left); if (sec !== last) { last = sec; if (sec <= 10 && sec > 0) snd(sec <= 5 ? 'urgentTick' : 'tick', .45); }
      if (MM.left <= 0) { clearInterval(DT); snd('timeUp'); mmEnd('lost', fallback(MM.i + 1)); }
    }, 100); TM.push(DT);
  }
  function confirmAns(q) {
    clearInterval(DT); snd('mil-lock'); MM.phase = 'locked';
    document.querySelectorAll('.pbtn,.ll').forEach(b => b.disabled = true);
    TM.push(setTimeout(() => {
      MM.phase = 'revealed'; const ok = MM.sel === q.c;
      snd(ok ? (LADDER[MM.i].safe ? 'mil-safe' : 'mil-correct') : 'mil-wrong');
      if (ok) MM.passed = MM.i + 1;
      paintPlay(q); if (ok) { MM.i++; paintTower(); MM.i--; }
    }, 1600));
  }
  function nextQ(q) {
    if (MM.sel !== q.c) { mmEnd('lost', fallback(MM.i + 1)); return; }
    if (MM.i >= 14) { mmEnd('won', 1000000); return; }
    MM.i++; MM.sel = null; MM.hidden = []; MM.audience = null; MM.phase = 'playing'; mmPlay();
  }
  function useLL(kind, btn) {
    if (!MM.life[kind] || MM.phase !== 'playing') return;
    const q = MM.round[MM.i];
    if (kind === 'fifty') { MM.life.fifty = false; MM.hidden = shuffle([0, 1, 2, 3].filter(i => i !== q.c)).slice(0, 2); snd('mil-fifty'); }
    if (kind === 'audience') {
      MM.life.audience = false; snd('mil-audience');
      const live = [0, 1, 2, 3].filter(i => !MM.hidden.includes(i)), sure = MM.i < 5 ? .72 : MM.i < 10 ? .52 : .36, v = [0, 0, 0, 0], others = live.filter(i => i !== q.c);
      v[q.c] = others.length ? Math.round(25 + sure * 60) : 100; let rest = 100 - v[q.c];
      others.forEach((i, n) => { v[i] = n === others.length - 1 ? rest : Math.round(Math.random() * rest * .65); rest -= v[i]; });
      MM.audience = v; showAudience(v);
    }
    if (kind === 'swap') {
      const k = MM.spare.findIndex(x => x.d === q.d), n = k >= 0 ? MM.spare.splice(k, 1)[0] : MM.spare.shift();
      if (!n) { toast('لا سؤال بديل', 1); return; }
      MM.life.swap = false; MM.round[MM.i] = n; MM.hidden = []; MM.audience = null; MM.qid = null; snd('mil-swap');
    }
    if (btn) btn.classList.add('spin');
    TM.push(setTimeout(() => { syncLL(); paintPlay(MM.round[MM.i]); }, 320));
  }
  /* تصويت الجمهور: أعمدةٌ ثلاثيّة بألوان الجواهر تتصاعد */
  function showAudience(v) {
    const maxH = Math.round(Math.min(300, innerHeight * .34)), o = document.createElement('div'); o.className = 'aud'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'تصويت الجمهور');
    o.innerHTML = `<div class="box"><b>تصويت الجمهور</b><div class="cols" style="height:${maxH + 120}px">${LETTERS.map((L, i) => `<div class="colx"><em>${ar(v[i])}٪</em><img class="top" src="${A}mil/col-${L}-top.png" alt=""><div class="body" data-h="${Math.round(v[i] / 100 * maxH)}" style="background-image:url(${A}mil/col-${L}-body.png)"></div><strong style="color:${GEMC[L]}">${'أبجد'[i]}</strong></div>`).join('')}</div>${plateBtn('idle', 'إغلاق', 'x', 170, 54, 'ac')}</div>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => requestAnimationFrame(() => o.querySelectorAll('.body').forEach(b => { b.style.height = b.dataset.h + 'px'; })));
    o.querySelector('#ac').onclick = () => o.remove();
  }
  /* النهاية: كأس/عملات/عملةٌ مشروخة مع أشعّة وقطعٍ متساقطة — والجائزة نقاطاً لفريق المتسابق */
  function mmEnd(phase, prize, walked) {
    clearTimers(); clearInterval(DT); MM.phase = phase;
    if (walked) snd('mil-walk'); else if (phase === 'won') snd('mil-win'); else snd('mil-wrong');
    const step = LADDER.findIndex(s => s.prize === prize) + 1, pts = step * 5, team = MM.team;
    const art = phase === 'won' ? (prize >= 1000000 ? 'trophy' : 'coins') : prize > 0 ? 'coins' : 'lose', celebrate = phase === 'won' || prize > 0;
    const hs = Math.max(200, Math.min(innerHeight * .5, innerWidth * .3, 360)), bh = Math.round(Math.max(56, Math.min(70, innerHeight * .08)));
    const rain = celebrate ? `<div class="rain">${Array.from({ length: 22 }, (_, i) => `<img src="${A}mil/piece-${['coin', 'gem', 'gem2'][i % 3]}.png" alt="" style="left:${Math.random() * 96}%;width:${26 + Math.random() * 30}px;animation-duration:${3.2 + Math.random() * 2.4}s;animation-delay:${Math.random() * 2.6}s;--dx:${(Math.random() - .5) * 80}px;--sp:${(Math.random() > .5 ? 1 : -1) * (180 + Math.random() * 360)}deg">`).join('')}</div>` : '';
    const paint = () => {
      $.innerHTML = `<div class="mend">${rain}<div class="hero" style="--h:${hs}px">${celebrate ? raysSVG(phase === 'won' ? '#FFBB00' : '#00C6FF') : ''}<img class="fl" src="${A}mil/${art}.png" alt=""></div>
        <div class="mtext"><span class="t1">${phase === 'won' ? 'مبروك!' : 'انتهت الجولة'}</span><p>${MM.player ? esc(MM.player) + ' — ' : ''}${phase === 'won' ? 'ربحت' : prize > 0 ? 'احتفظت بجائزة محطّة الأمان' : 'لم تحصل على جائزة هذه المرّة'}</p>
          ${prize > 0 ? `<span class="prize">${fmt(prize)} ريال</span>` : ''}
          ${team && pts > 0 ? `<div class="ptsbox" style="margin:10px 0">${MM.awarded ? `<span class="done-ok">✓ أُضيفت ${pts$(pts)} ${esc(li(team.name))}</span>` : `<b>الجائزة نقاطاً لفريق ${esc(team.name)}: ${cnt(step, 'درجة', 'درجتان', 'درجات', 'درجة')} × ٥</b><button class="xb go" id="aw">${ic('check')} أضف ${pts$(pts)} ${esc(li(team.name))}</button>`}</div>` : ''}
          <div class="btnrow" style="margin-top:12px">${plateBtn('orange', 'جولة جديدة', 'again', Math.round(bh * 3.5), bh, 'again')}${plateBtn('idle', 'خروج', 'out', Math.round(bh * 2.8), bh, 'home')}</div></div></div>`;
      document.getElementById('again').onclick = mmSetup; document.getElementById('home').onclick = menu;
      const aw = document.getElementById('aw');
      if (aw) aw.onclick = async () => { aw.disabled = true; try { await awardPoints(team.id, pts, 'من سيربح المليون'); MM.awarded = true; snd('tool-point'); toast(`أُضيفت ${pts$(pts)} ${li(team.name)}`); paint(); } catch (e) { toast(e.message, 1); aw.disabled = false; } };
    };
    paint();
  }
  addEventListener('resize', () => { if (document.getElementById('play') && MM.round[MM.i]) { paintTower(); paintPlay(MM.round[MM.i]); } });

  document.addEventListener('click', e => { const g = e.target.closest('[data-g]'); if (g) (g.dataset.g === 'letters' ? lettersSetup : mmSetup)(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const a = document.querySelector('.aud'); if (a) a.remove(); } });

  /* ═════════ تجريبيّ (الحرف = أوّل حرف الجواب بعد «ال») ═════════ */
  function demo(b) {
    if (b.mode === 'catalog') return { curriculum: [{ grade: 8, subject: 'science', ar: 'العلوم', n: 12 }], cultural: [{ topic: 'general', n: 30 }] };
    const C = [['أ', 'أكبر قارّات العالم؟', 'آسيا'], ['ب', 'ما اسم البحر الذي يقع غرب المملكة؟', 'البحر الأحمر'], ['ت', 'ثمرة النخلة إذا جفّت؟', 'التمر'], ['ج', 'عاصمة إندونيسيا؟', 'جاكرتا'], ['ح', 'الطائر الذي يرمز للسلام؟', 'الحمامة'],
      ['خ', 'أوّل زوجات النبيّ ﷺ؟', 'خديجة'], ['د', 'مدينة إماراتيّة فيها برج خليفة؟', 'دبي'], ['ر', 'أكبر مدن المملكة؟', 'الرياض'], ['ز', 'الشجرة المباركة التي يُعصر منها الزيت؟', 'الزيتون'], ['س', 'أطول سورة في القرآن؟', 'سورة البقرة'], ['ش', 'النجم الذي تدور حوله الأرض؟', 'الشمس'], ['ص', 'طائر جارح يُستعمل في الصيد؟', 'الصقر'], ['ط', 'من يعالج المرضى؟', 'الطبيب'],
      ['ع', 'عاصمة الأردن؟', 'عمّان'], ['غ', 'الطائر الذي علّم ابن آدم دفن أخيه؟', 'الغراب'], ['ف', 'أوّل سورة في المصحف؟', 'الفاتحة'], ['ق', 'كتاب المسلمين المقدّس؟', 'القرآن'], ['ك', 'دولة خليجيّة عاصمتها تحمل اسمها؟', 'الكويت'], ['ل', 'دولة عاصمتها بيروت؟', 'لبنان'], ['م', 'أقدس مدينة عند المسلمين؟', 'مكة المكرمة'], ['ن', 'أطول نهر في العالم؟', 'النيل'],
      ['ه', 'جهاز يتّصل به الناس عن بعد؟', 'الهاتف'], ['و', 'عاصمة أمريكا؟', 'واشنطن'], ['ي', 'الدولة التي عاصمتها صنعاء؟', 'اليمن'], ['ث', 'الحيوان الماكر في القصص؟', 'الثعلب'], ['ذ', 'المعدن الأصفر الثمين؟', 'الذهب'], ['ض', 'عكس الظلام؟', 'الضوء'], ['ظ', 'ما يتركه الجسم تحت الشمس؟', 'الظلّ']];
    if (b.mode === 'letters') return { q: C.map(([l, q, a], i) => ({ id: 'd' + i, letter: l, q, ans: a })).concat([{ id: 'm1', letter: 'س', q: 'كم عدد أيّام الأسبوع؟', ans: 'سبعة', opts: ['خمسة', 'ستّة', 'سبعة', 'ثمانية'], ci: 2 }]) };
    const mk = (q, o, c, d) => ({ q, o, c, d });
    return { q: [mk('عاصمة المملكة العربيّة السعوديّة؟', ['جدة', 'الرياض', 'الدمام', 'مكة المكرمة'], 1, 'easy'), mk('أكبر قارّة في العالم؟', ['أفريقيا', 'أوروبا', 'آسيا', 'أستراليا'], 2, 'easy'), mk('كم عدد أركان الإسلام؟', ['ثلاثة', 'أربعة', 'خمسة', 'ستّة'], 2, 'easy'), mk('ثمرة النخلة؟', ['التمر', 'التين', 'العنب', 'الزيتون'], 0, 'easy'), mk('ما لون علم المملكة؟', ['أحمر', 'أخضر', 'أزرق', 'أسود'], 1, 'easy'),
      mk('ما أطول نهر في العالم؟', ['الأمازون', 'النيل', 'الفرات', 'الدانوب'], 1, 'medium'), mk('كم عدد سور القرآن الكريم؟', ['١١٠', '١١٢', '١١٤', '١٢٠'], 2, 'medium'), mk('أقرب كوكب إلى الشمس؟', ['عطارد', 'الزهرة', 'المرّيخ', 'الأرض'], 0, 'medium'), mk('عاصمة اليابان؟', ['بكين', 'سيول', 'طوكيو', 'بانكوك'], 2, 'medium'), mk('من موحّد المملكة العربيّة السعوديّة؟', ['الملك سعود', 'الملك عبدالعزيز', 'الملك فيصل', 'الملك خالد'], 1, 'medium'),
      mk('ما الرمز الكيميائيّ للذهب؟', ['Ag', 'Au', 'Fe', 'Gd'], 1, 'hard'), mk('في أيّ عام وُحّدت المملكة العربيّة السعوديّة؟', ['١٩٠٢', '١٩٢٦', '١٩٣٢', '١٩٤٥'], 2, 'hard'), mk('ما أعلى قمّة جبليّة في العالم؟', ['كليمنجارو', 'إيفرست', 'مون بلان', 'طويق'], 1, 'hard'), mk('من مؤلّف «صحيح البخاري»؟', ['مسلم بن الحجّاج', 'محمّد بن إسماعيل البخاري', 'الترمذي', 'أبو داود'], 1, 'hard'), mk('ما أصغر عظمة في جسم الإنسان؟', ['الركاب', 'الفخذ', 'الترقوة', 'الضلع'], 0, 'hard')] };
  }
  start();
})();
