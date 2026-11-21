/*
 * ألعاب القاعة — تُشغَّل من لابتوب القاعة على البروجكتر (الميسّر برمزه من «جوّال الميسّر»).
 * الأسئلة من بنك «حروف ودروس» عبر POST /season/questions (لا يُحمَّل البنك كاملاً أبداً).
 *   • خلية الحروف: لوحة سداسيّة ٥×٥ — الفريق الأوّل يصل أعلى↔أسفل، والثاني يمين↔يسار (كما في حروف).
 *   • من سيربح المليون: ١٥ سؤالاً متدرّجة، محطّتا أمان (١٬٠٠٠ و٣٢٬٠٠٠)، ٥٠:٥٠ والجمهور والتبديل.
 * ?demo=1 بأسئلة توضيحيّة قليلة.
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search), LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname), DEMO = Q.get('demo') === '1';
  const API = LOCAL ? 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech' : 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech';
  const $ = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TOPICS = { '': 'كلّ المواضيع', general: 'عامّة', religion: 'دينيّة', history: 'تاريخ', geography: 'جغرافيا', science: 'علوم', language: 'لغة وأدب', art_culture: 'فنون وثقافة' };
  const GRADES = { 1: 'الأوّل الابتدائيّ', 2: 'الثاني الابتدائيّ', 3: 'الثالث الابتدائيّ', 4: 'الرابع الابتدائيّ', 5: 'الخامس الابتدائيّ', 6: 'السادس الابتدائيّ', 7: 'الأوّل المتوسّط', 8: 'الثاني المتوسّط', 9: 'الثالث المتوسّط', 10: 'الأوّل الثانويّ', 11: 'الثاني الثانويّ', 12: 'الثالث الثانويّ' };
  let auth = null, CAT = null;
  try { const s = JSON.parse(localStorage.getItem('jawwali2') || 'null'); if (s && s.mode === 'staff' && s.pin) auth = { code: s.code, pin: s.pin }; } catch (e) {}
  async function api(body) {
    if (DEMO) return demo(body);
    const r = await fetch(API + '/season/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, auth, body)) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر الاتّصال'); return d;
  }

  /* ═════════ الدخول والقائمة ═════════ */
  function login(msg) {
    $.innerHTML = `<div class="wrap"><div class="top"><div><h1>ألعاب القاعة</h1><div class="sub">ادخل برمز الموسم ورمزك كميسّر</div></div></div>
      <div class="card" style="max-width:520px"><div class="fld">رمز الموسم<input id="c" maxlength="6" dir="ltr" autocapitalize="characters"></div><br>
      <div class="fld">رمز الميسّر<input id="p" maxlength="6" dir="ltr" inputmode="numeric"></div><br>
      <p class="err" role="alert">${esc(msg || '')}</p><button class="btn" id="go">دخول</button></div></div>`;
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
    $.innerHTML = `<div class="wrap"><div class="top"><div><h1>ألعاب القاعة</h1><div class="sub">${DEMO ? 'نسخة تجريبيّة بأسئلة قليلة' : 'أسئلة «حروف ودروس»: المنهج والثقافة العامّة'}</div></div>
      ${DEMO ? '' : '<button class="btn sec" id="out">خروج</button>'}</div>
      <div class="games"><button class="game" data-g="letters"><img src="../assets/apps/default/letters.webp?v=1" alt=""><span><b>خلية الحروف</b><small>فريقان على لوحة الحروف — من يصل طرفَيه أوّلاً يفوز.</small></span></button>
        <button class="game" data-g="mm"><img src="../assets/apps/default/million.webp?v=1" alt=""><span><b>من سيربح المليون</b><small>١٥ سؤالاً متدرّجة ووسائل مساعدة — لمتسابق أو فريق.</small></span></button></div></div>`;
    const o = document.getElementById('out'); if (o) o.onclick = () => { auth = null; login(); };
  }
  /* اختيار مصدر الأسئلة: الثقافة العامّة (بموضوعها) أو المنهج (بالصفّ والمادّة) */
  function sourcePicker() {
    const grades = [...new Set((CAT.curriculum || []).map(x => x.grade))].filter(g => g > 0).sort((a, b) => a - b);
    return `<div class="row"><div class="fld">المصدر<div class="seg" id="srcSeg"><button class="on" data-src="cultural">ثقافة عامّة</button><button data-src="curriculum">المنهج الدراسيّ</button></div></div>
      <div class="fld" id="fTopic">الموضوع<select id="topic">${(CAT.cultural || []).map(t => `<option value="${esc(t.topic)}">${esc(TOPICS[t.topic] || t.topic)} (${t.n})</option>`).join('')}<option value="" selected>كلّ المواضيع</option></select></div>
      <div class="fld" id="fGrade" hidden>الصفّ<select id="grade">${grades.map(g => `<option value="${g}">${esc(GRADES[g] || g)}</option>`).join('')}</select></div>
      <div class="fld" id="fSubj" hidden>المادّة<select id="subj"></select></div></div>`;
  }
  function wireSource(root) {
    const fill = () => { const g = +root.querySelector('#grade').value; root.querySelector('#subj').innerHTML = (CAT.curriculum || []).filter(x => x.grade === g).map(x => `<option value="${esc(x.subject)}">${esc(x.ar || x.subject)} (${x.n})</option>`).join(''); };
    root.querySelector('#grade').onchange = fill; fill();
    root.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { root.querySelectorAll('[data-src]').forEach(x => x.classList.toggle('on', x === b)); const cur = b.dataset.src === 'curriculum'; root.querySelector('#fTopic').hidden = cur; root.querySelector('#fGrade').hidden = !cur; root.querySelector('#fSubj').hidden = !cur; });
  }
  function readSource(root) {
    const cur = root.querySelector('[data-src="curriculum"]').classList.contains('on');
    return cur ? { src: 'curriculum', grade: +root.querySelector('#grade').value, subject: root.querySelector('#subj').value } : { src: 'cultural', topic: root.querySelector('#topic').value };
  }

  /* ═════════ خلية الحروف ═════════ */
  const AR = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
  const LN = l => { l = String(l || '').trim(); if (/^(ا|أ|إ|آ|ألف)/.test(l)) return 'أ'; if (l === 'هـ') return 'ه'; return l.length === 1 ? l : ''; };
  const HX = { teams: [{ n: 'الفريق الأخضر', c: '#16A34A' }, { n: 'الفريق الأحمر', c: '#DC2626' }], cells: [], pool: [], used: new Set(), src: null };
  function lettersSetup() {
    $.innerHTML = `<div class="wrap"><div class="top"><h1>خلية الحروف</h1><button class="btn sec" id="back">رجوع</button></div>
      <div class="card" id="setup">${sourcePicker()}<br><div class="row">${HX.teams.map((t, i) => `<div class="fld">${i ? 'الفريق الثاني (يمين ↔ يسار)' : 'الفريق الأوّل (أعلى ↔ أسفل)'}<div class="tm"><input type="color" id="tc${i}" value="${t.c}"><input id="tn${i}" value="${esc(t.n)}"></div></div>`).join('')}</div><br>
      <button class="btn" id="go">ابدأ اللعبة</button> <span class="err" id="e"></span></div></div>`;
    const root = document.getElementById('setup'); wireSource(root);
    document.getElementById('back').onclick = menu;
    document.getElementById('go').onclick = async () => {
      HX.teams = [0, 1].map(i => ({ n: document.getElementById('tn' + i).value.trim() || 'فريق', c: document.getElementById('tc' + i).value }));
      HX.src = readSource(root); document.getElementById('go').disabled = true;
      try { HX.pool = (await api(Object.assign({ mode: 'letters' }, HX.src))).q || []; } catch (e) { document.getElementById('e').textContent = e.message; document.getElementById('go').disabled = false; return; }
      if (HX.pool.length < 25) { document.getElementById('e').textContent = 'الأسئلة قليلة لهذا الاختيار — اختر غيره'; document.getElementById('go').disabled = false; return; }
      newBoard(); paintBoard();
    };
  }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function newBoard() {
    HX.used = new Set();
    const byL = {}; HX.pool.forEach(q => { const l = LN(q.letter); if (l) (byL[l] = byL[l] || []).push(q); });
    /* الحروف التي لها أسئلة أوّلاً، ثمّ تكمل اللوحة بقيّة الحروف (أسئلتها من المجموعة العامّة) */
    const have = shuffle(AR.filter(l => (byL[l] || []).length)), rest = shuffle(AR.filter(l => !(byL[l] || []).length));
    const letters = have.concat(rest).slice(0, 25);
    HX.cells = letters.map((l, i) => ({ r: Math.floor(i / 5), c: i % 5, l, owner: -1 }));
    HX.byL = byL;
  }
  /* هندسة سداسيّة odd-r (الصفوف الفرديّة مزاحة نصف خليّة) */
  const NB = (r, c) => (r % 2 === 0 ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]).map(([dr, dc]) => [r + dr, c + dc]).filter(([a, b]) => a >= 0 && a < 5 && b >= 0 && b < 5);
  function won(t) {
    const own = (r, c) => HX.cells[r * 5 + c].owner === t;
    const start = t === 0 ? [0, 1, 2, 3, 4].map(c => [0, c]) : [0, 1, 2, 3, 4].map(r => [r, 0]);
    const seen = new Set(), st = start.filter(([r, c]) => own(r, c));
    while (st.length) { const [r, c] = st.pop(), k = r * 5 + c; if (seen.has(k)) continue; seen.add(k); if ((t === 0 && r === 4) || (t === 1 && c === 4)) return true; NB(r, c).forEach(([a, b]) => { if (own(a, b) && !seen.has(a * 5 + b)) st.push([a, b]); }); }
    return false;
  }
  function paintBoard() {
    const s = 100, w = Math.sqrt(3) * s / 2 * 2, h = s * 2, pad = 30;
    const cx = (r, c) => pad + w / 2 + c * w + (r % 2 ? w / 2 : 0), cy = (r) => pad + s + r * h * .75;
    const W = pad * 2 + w * 5.5, H = pad * 2 + h * .75 * 4 + h;
    const hex = (x, y) => [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 180 * (60 * i - 30); return (x + s * .96 * Math.cos(a)).toFixed(1) + ',' + (y + s * .96 * Math.sin(a)).toFixed(1); }).join(' ');
    const score = t => HX.cells.filter(x => x.owner === t).length;
    $.innerHTML = `<div class="wrap"><div class="top"><h1>خلية الحروف</h1><div style="display:flex;gap:10px"><button class="btn sec" id="nb">لوحة جديدة</button><button class="btn sec" id="back">القائمة</button></div></div>
      <div class="hx-stage"><div class="team" style="--c:${HX.teams[0].c}"><b>${esc(HX.teams[0].n)}</b><span class="s">${score(0)}</span><small>أعلى ↔ أسفل</small></div>
      <div class="board"><svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" role="img" aria-label="لوحة الحروف">
        <rect class="edge" x="${pad}" y="0" width="${W - pad * 2}" height="14" rx="7" fill="${HX.teams[0].c}"/><rect class="edge" x="${pad}" y="${H - 14}" width="${W - pad * 2}" height="14" rx="7" fill="${HX.teams[0].c}"/>
        <rect class="edge" x="0" y="${pad}" width="14" height="${H - pad * 2}" rx="7" fill="${HX.teams[1].c}"/><rect class="edge" x="${W - 14}" y="${pad}" width="14" height="${H - pad * 2}" rx="7" fill="${HX.teams[1].c}"/>
        ${HX.cells.map((x, i) => `<g class="cell" data-i="${i}" tabindex="0" role="button" aria-label="حرف ${x.l}"><polygon points="${hex(cx(x.r, x.c), cy(x.r))}" fill="${x.owner < 0 ? '#2A2C52' : HX.teams[x.owner].c}"/><text x="${cx(x.r, x.c)}" y="${cy(x.r) + 26}" text-anchor="middle" font-size="78">${x.l}</text></g>`).join('')}
      </svg></div>
      <div class="team" style="--c:${HX.teams[1].c}"><b>${esc(HX.teams[1].n)}</b><span class="s">${score(1)}</span><small>يمين ↔ يسار</small></div></div></div>`;
    document.getElementById('back').onclick = menu;
    document.getElementById('nb').onclick = () => { newBoard(); paintBoard(); };
    document.querySelectorAll('.cell').forEach(g => { const open = () => ask(+g.dataset.i); g.onclick = open; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') open(); }; });
  }
  function pickQ(letter) {
    const list = (HX.byL[letter] || []).filter(q => !HX.used.has(q.id));
    const q = list[Math.floor(Math.random() * list.length)] || HX.pool.find(x => !HX.used.has(x.id)); if (q) HX.used.add(q.id); return q;
  }
  let timerH = null;
  function ask(i) {
    const cell = HX.cells[i]; let q = pickQ(cell.l); if (!q) return;
    const box = document.createElement('div'); box.className = 'qbox'; box.setAttribute('role', 'dialog');
    const render = () => {
      box.innerHTML = `<div style="display:flex;gap:22px;align-items:center"><span class="lt">${cell.l}</span><span class="timer" id="tm">30</span></div>
        <div class="q">${esc(q.q)}</div>${q.opts && q.opts.length === 4 ? `<div class="q" style="font-size:clamp(18px,2vw,28px);font-weight:700">${q.opts.map((o, k) => `${'أبجد'[k]}) ${esc(o)}`).join('&nbsp;&nbsp; · &nbsp;&nbsp;')}</div>` : ''}
        <div class="ans" id="an"></div>
        <div class="acts"><button class="btn sec" id="show">أظهر الإجابة</button>${HX.teams.map((t, k) => `<button class="btn" style="background:${t.c};color:#fff" data-t="${k}">لـ${esc(t.n)}</button>`).join('')}<button class="btn sec" id="none">لا أحد</button><button class="btn sec" id="swap">سؤال آخر</button></div>`;
      let n = 30; clearInterval(timerH);
      timerH = setInterval(() => { n--; const el = box.querySelector('#tm'); if (!el) return clearInterval(timerH); el.textContent = Math.max(0, n); el.classList.toggle('low', n <= 10); if (n <= 0) clearInterval(timerH); }, 1000);
      box.querySelector('#show').onclick = () => { box.querySelector('#an').textContent = q.ans; };
      box.querySelector('#none').onclick = () => { clearInterval(timerH); box.remove(); };
      box.querySelector('#swap').onclick = () => { const n2 = pickQ(cell.l); if (n2) { q = n2; render(); } };
      box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { clearInterval(timerH); cell.owner = +b.dataset.t; box.remove(); paintBoard(); if (won(cell.owner)) celebrate(HX.teams[cell.owner]); });
    };
    render(); document.body.appendChild(box);
  }
  function celebrate(t) {
    const w = document.createElement('div'); w.className = 'win'; w.style.setProperty('--c', t.c);
    w.innerHTML = `<div style="font-size:90px">🏆</div><h2>${esc(t.n)}</h2><p>أكمل الطريق وفاز بالجولة!</p><div style="display:flex;gap:12px"><button class="btn" id="again">لوحة جديدة</button><button class="btn sec" id="close">إغلاق</button></div>`;
    document.body.appendChild(w);
    w.querySelector('#again').onclick = () => { w.remove(); newBoard(); paintBoard(); }; w.querySelector('#close').onclick = () => w.remove();
  }

  /* ═════════ من سيربح المليون ═════════ */
  const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000], SAFE = new Set([4, 9]);
  const fmt = n => n === 1000000 ? 'مليون' : n.toLocaleString('ar-SA-u-nu-latn');
  const MM = { round: [], spare: [], i: 0, sel: -1, life: { half: true, aud: true, swap: true }, gone: [], src: null, player: '' };
  function mmSetup() {
    $.innerHTML = `<div class="wrap"><div class="top"><h1>من سيربح المليون</h1><button class="btn sec" id="back">رجوع</button></div>
      <div class="card" id="setup">${sourcePicker()}<br><div class="row"><div class="fld">اسم المتسابق أو الفريق<input id="pl" placeholder="مثلاً: الفريق الأزرق"></div></div><br>
      <button class="btn" id="go">ابدأ</button> <span class="err" id="e"></span></div></div>`;
    const root = document.getElementById('setup'); wireSource(root);
    document.getElementById('back').onclick = menu;
    document.getElementById('go').onclick = async () => {
      MM.src = readSource(root); MM.player = document.getElementById('pl').value.trim(); document.getElementById('go').disabled = true;
      try { const [a, b] = await Promise.all([api(Object.assign({ mode: 'mcq' }, MM.src)), api(Object.assign({ mode: 'mcq' }, MM.src)).catch(() => ({ q: [] }))]); MM.round = a.q || []; MM.spare = b.q || []; }
      catch (e) { document.getElementById('e').textContent = e.message; document.getElementById('go').disabled = false; return; }
      if (MM.round.length < 15) { document.getElementById('e').textContent = 'لم تكفِ الأسئلة لهذا الاختيار — اختر غيره'; document.getElementById('go').disabled = false; return; }
      MM.i = 0; MM.sel = -1; MM.gone = []; MM.life = { half: true, aud: true, swap: true }; mmPaint();
    };
  }
  function safePrize(i) { for (let k = i - 1; k >= 0; k--) if (SAFE.has(k)) return LADDER[k]; return 0; }
  function mmPaint(extra) {
    const q = MM.round[MM.i];
    $.innerHTML = `<div class="wrap"><div class="top"><h1>${esc(MM.player || 'من سيربح المليون')}</h1><div style="display:flex;gap:10px">${MM.i ? `<button class="btn sec" id="quit">انسحب بـ${fmt(LADDER[MM.i - 1])}</button>` : ''}<button class="btn sec" id="back">القائمة</button></div></div>
      <div class="mm"><div class="mq"><div class="life"><button id="lh" ${MM.life.half ? '' : 'disabled'}>٥٠:٥٠</button><button id="la" ${MM.life.aud ? '' : 'disabled'}>الجمهور</button><button id="ls" ${MM.life.swap ? '' : 'disabled'}>تبديل</button></div>
        <div class="q">${esc(q.q)}</div>
        <div class="opts">${q.o.map((o, k) => `<button class="opt${MM.gone.includes(k) ? ' gone' : ''}${MM.sel === k ? ' sel' : ''}" data-o="${k}"><i>${'أبجد'[k]}:</i> ${esc(o)}</button>`).join('')}</div>${extra || ''}</div>
      <div class="ladder card">${LADDER.map((p, k) => `<div class="${SAFE.has(k) ? 'safe' : ''}${k === MM.i ? ' cur' : ''}${k < MM.i ? ' done' : ''}"><span>${k + 1}</span><span>${fmt(p)}</span></div>`).join('')}</div></div></div>`;
    document.getElementById('back').onclick = menu;
    const qt = document.getElementById('quit'); if (qt) qt.onclick = () => mmEnd(LADDER[MM.i - 1], 'انسحب');
    document.querySelectorAll('[data-o]').forEach(b => b.onclick = () => mmPick(+b.dataset.o, b));
    document.getElementById('lh').onclick = () => { if (!MM.life.half) return; MM.life.half = false; const wrong = [0, 1, 2, 3].filter(k => k !== q.c); MM.gone = shuffle(wrong).slice(0, 2); mmPaint(); };
    document.getElementById('la').onclick = () => {
      if (!MM.life.aud) return; MM.life.aud = false; const live = [0, 1, 2, 3].filter(k => !MM.gone.includes(k)); const p = {}; let left = 100;
      const sure = MM.i < 5 ? .7 : MM.i < 10 ? .5 : .35; p[q.c] = Math.round(30 + sure * 50); left -= p[q.c];
      live.filter(k => k !== q.c).forEach((k, n, arr) => { p[k] = n === arr.length - 1 ? left : Math.round(Math.random() * left * .7); left -= p[k]; });
      mmPaint(`<div class="aud">${[0, 1, 2, 3].map(k => `<span><div style="height:${(p[k] || 0) * 1.5}px">${p[k] || 0}%</div><span>${'أبجد'[k]}</span></span>`).join('')}</div>`);
    };
    document.getElementById('ls').onclick = () => { if (!MM.life.swap) return; const d = MM.round[MM.i].d, k = MM.spare.findIndex(x => x.d === d); if (k < 0) return; MM.life.swap = false; MM.round[MM.i] = MM.spare.splice(k, 1)[0]; MM.gone = []; mmPaint(); };
  }
  function mmPick(k, btn) {
    if (MM.sel === k) { // تأكيد «إجابة نهائيّة»
      const q = MM.round[MM.i], ok = k === q.c;
      document.querySelectorAll('[data-o]').forEach(b => { b.onclick = null; if (+b.dataset.o === q.c) b.classList.add('ok'); });
      if (!ok) btn.classList.add('bad');
      setTimeout(() => { if (!ok) return mmEnd(safePrize(MM.i), 'أخطأ'); if (MM.i === 14) return mmEnd(LADDER[14], 'فاز بالمليون'); MM.i++; MM.sel = -1; MM.gone = []; mmPaint(); }, 1800);
      return;
    }
    MM.sel = k; document.querySelectorAll('[data-o]').forEach(b => b.classList.toggle('sel', +b.dataset.o === k));
    btn.setAttribute('aria-label', 'اضغط مرّة أخرى للتأكيد');
  }
  function mmEnd(prize, why) {
    const w = document.createElement('div'); w.className = 'win'; w.style.setProperty('--c', prize >= 32000 ? '#C77700' : '#2a1f9e');
    w.innerHTML = `<div style="font-size:90px">${prize ? '💰' : '🙂'}</div><h2>${fmt(prize)}</h2><p>${esc(MM.player || 'المتسابق')} — ${esc(why)}</p><div style="display:flex;gap:12px"><button class="btn" id="again">جولة جديدة</button><button class="btn sec" id="close">القائمة</button></div>`;
    document.body.appendChild(w);
    w.querySelector('#again').onclick = () => { w.remove(); mmSetup(); }; w.querySelector('#close').onclick = () => { w.remove(); menu(); };
  }

  document.addEventListener('click', e => { const g = e.target.closest('[data-g]'); if (g) (g.dataset.g === 'letters' ? lettersSetup : mmSetup)(); });

  /* ═════════ تجريبيّ ═════════ */
  function demo(b) {
    if (b.mode === 'catalog') return { curriculum: [{ grade: 8, subject: 'science', ar: 'العلوم', n: 12 }], cultural: [{ topic: 'general', n: 30 }] };
    const C = [['أ', 'أكبر قارّات العالم؟', 'آسيا'], ['ب', 'ما اسم البحر الذي يقع غرب المملكة؟', 'البحر الأحمر'], ['ت', 'ثمرة النخلة إذا جفّت؟', 'التمر'], ['ج', 'عاصمة إندونيسيا؟', 'جاكرتا'], ['ح', 'الطائر الذي يرمز للسلام؟', 'الحمامة'],
      ['خ', 'أوّل زوجات النبيّ ﷺ؟', 'خديجة'], ['د', 'عاصمة الإمارات الاقتصاديّة الأشهر؟', 'دبي'], ['ر', 'أكبر مدن المملكة؟', 'الرياض'], ['ز', 'الشجرة المباركة التي يُعصر منها الزيت؟', 'الزيتون'], ['س', 'أطول سورة في القرآن؟', 'سورة البقرة'], ['ش', 'النجم الذي تدور حوله الأرض؟', 'الشمس'], ['ص', 'طائر جارح يُستعمل في الصيد؟', 'الصقر'], ['ط', 'من يعالج المرضى؟', 'الطبيب'],
      ['ع', 'عاصمة الأردن؟', 'عمّان'], ['غ', 'الطائر الذي علّم ابن آدم دفن أخيه؟', 'الغراب'], ['ف', 'أوّل سورة في المصحف؟', 'الفاتحة'], ['ق', 'كتاب المسلمين المقدّس؟', 'القرآن'], ['ك', 'عاصمة الكويت؟', 'الكويت'], ['ل', 'دولة عاصمتها بيروت؟', 'لبنان'], ['م', 'أقدس مدينة عند المسلمين؟', 'مكة المكرمة'], ['ن', 'أطول نهر في العالم؟', 'النيل'],
      ['ه', 'جهاز يتّصل به الناس عن بعد؟', 'الهاتف'], ['و', 'عاصمة أمريكا؟', 'واشنطن'], ['ي', 'الدولة التي عاصمتها صنعاء؟', 'اليمن'], ['ث', 'الحيوان الماكر في القصص؟', 'الثعلب'], ['ذ', 'المعدن الأصفر الثمين؟', 'الذهب'], ['ض', 'عكس الظلام؟', 'الضوء'], ['ظ', 'ما يتركه الجسم تحت الشمس؟', 'الظلّ']];
    if (b.mode === 'letters') return { q: C.map(([l, q, a], i) => ({ id: 'd' + i, letter: l, q, ans: a })) };
    const mk = (q, o, c, d) => ({ q, o, c, d });
    return { q: [mk('عاصمة المملكة؟', ['جدة', 'الرياض', 'الدمام', 'مكة'], 1, 'easy'), mk('أكبر قارّة؟', ['أفريقيا', 'أوروبا', 'آسيا', 'أستراليا'], 2, 'easy'), mk('عدد أركان الإسلام؟', ['٣', '٤', '٥', '٦'], 2, 'easy'), mk('ثمرة النخلة؟', ['التمر', 'التين', 'العنب', 'الزيتون'], 0, 'easy'), mk('لون علم المملكة؟', ['أحمر', 'أخضر', 'أزرق', 'أسود'], 1, 'easy'),
      mk('أطول نهر؟', ['الأمازون', 'النيل', 'الفرات', 'الدانوب'], 1, 'medium'), mk('عدد سور القرآن؟', ['١١٠', '١١٢', '١١٤', '١٢٠'], 2, 'medium'), mk('أقرب كوكب للشمس؟', ['عطارد', 'الزهرة', 'المرّيخ', 'الأرض'], 0, 'medium'), mk('عاصمة اليابان؟', ['بكين', 'سيول', 'طوكيو', 'بانكوك'], 2, 'medium'), mk('موحّد المملكة؟', ['الملك سعود', 'الملك عبدالعزيز', 'الملك فيصل', 'الملك خالد'], 1, 'medium'),
      mk('رمز الذهب الكيميائيّ؟', ['Ag', 'Au', 'Fe', 'Gd'], 1, 'hard'), mk('سنة توحيد المملكة؟', ['١٩٠٢', '١٩٢٦', '١٩٣٢', '١٩٤٥'], 2, 'hard'), mk('أعلى قمّة في العالم؟', ['كليمنجارو', 'إيفرست', 'الألب', 'طويق'], 1, 'hard'), mk('مؤلّف «صحيح البخاري»؟', ['مسلم', 'البخاري', 'الترمذي', 'أبو داود'], 1, 'hard'), mk('أصغر عظمة في جسم الإنسان؟', ['الركاب', 'الفخذ', 'الترقوة', 'الضلع'], 0, 'hard')] };
  }
  start();
})();
