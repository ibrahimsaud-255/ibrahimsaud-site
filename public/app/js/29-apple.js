/*
 * 29-apple.js — سلوكيّات آبل في النظام كلّه (البادئة ap) — الشكل في assets/apple.css + dark.css
 * ─────────────────────────────────────────────────────────────────────────
 * منقول كما هو من نظام الجمعيات الشبابية (public/charity/js/34-apple.js)، ومعه في آخره ما يخصّ نظام إبراهيم:
 * applyTheme/setTheme (الأساس فاتح دائماً، والداكن طبقة html.ap-dark)، rToast، وطبقة الخلفيّة #orgWall
 * (تستبدل applyWallpaper و wpRenderBody من 04-home). ⚠️ تعريفات فقط؛ apInit() يناديها 99-boot مرّة واحدة.
 */
function openModal(title, bodyHtml, onSave, onDelete) {
  document.getElementById('modalRoot').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-modal="true" aria-label="${String(title).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}">
    <div class="ap-grab" aria-hidden="true"></div>
    <div class="modal-head"><h3>${title}</h3><button class="x" type="button" onclick="closeModal()" aria-label="إغلاق">×</button></div>
    <div class="modal-body">${bodyHtml}</div>
    <div class="modal-foot">${onDelete ? '<button class="btn btn-ghost" id="mDel" type="button">حذف</button>' : ''}<button class="btn btn-gold" id="mSave" type="button">حفظ</button></div></div></div>`;
  const s = document.getElementById('mSave'); s.onclick = typeof onSave === 'function' ? onSave : closeModal;
  if (onDelete) document.getElementById('mDel').onclick = onDelete;
  refreshIcons();
  // التركيز على أوّل حقل على الكمبيوتر فقط (على الجوال يفتح لوحة المفاتيح فجأة)
  if (matchMedia('(pointer:fine)').matches) { const f = document.querySelector('#modalRoot .modal-body :is(input:not([type=hidden]):not([type=checkbox]):not([type=file]),textarea,select)'); if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) {} }, 60); }
}

/* السحب للأسفل لإغلاق النافذة (الجوال) — من المقبض أو رأس النافذة */
function apSheetDrag(e) {
  if (!matchMedia('(max-width:820px)').matches) return;
  const h = e.target.closest('.ap-grab, .modal-head'); if (!h || e.target.closest('button, input, select, textarea, a')) return;
  const m = h.closest('.modal'); if (!m) return;
  const y0 = e.clientY, t0 = Date.now(); let dy = 0;
  m.classList.add('ap-dragging');
  const mv = ev => { dy = Math.max(0, ev.clientY - y0); m.style.transform = `translateY(${dy}px)`; };
  const up = () => {
    document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    m.classList.remove('ap-dragging');
    const fast = dy > 40 && Date.now() - t0 < 250;
    if (dy > 130 || fast) { m.style.transition = 'transform .22s ease-in'; m.style.transform = 'translateY(105%)'; setTimeout(closeModal, 200); }
    else { m.style.transition = 'transform .25s cubic-bezier(.25,.8,.25,1)'; m.style.transform = ''; setTimeout(() => { m.style.transition = ''; }, 260); }
  };
  document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}

/* العنوان الكبير ↔ عنوان الشريط العلويّ */
let AP_IO = null;
function apTitle() {
  if (AP_IO) { AP_IO.disconnect(); AP_IO = null; }
  document.body.classList.remove('ap-lt');
  const h = document.querySelector('#main .r-page > .page-head h1, #main .ws-status h1');
  if (!h || !('IntersectionObserver' in window)) return;
  AP_IO = new IntersectionObserver(([en]) => document.body.classList.toggle('ap-lt', en.isIntersecting), { rootMargin: '-64px 0px 0px 0px' });
  AP_IO.observe(h);
}

function apInit() {
  document.addEventListener('pointerdown', apSheetDrag);
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (apPrefs().look === 'auto') apApplyDisplay(); }); } catch (e) {}
  apApplyDisplay();
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector('#modalRoot .modal-bg') && !document.querySelector('.dk.edit') && !document.querySelector('.ap-al-bg')) closeModal(); });
}

/* ═════════ التنبيهات (Alerts) بأسلوب آبل بدل نوافذ المتصفّح الرماديّة ═════════
   apConfirm(نصّ) ← Promise<boolean> · apPrompt(نصّ، قيمة) ← Promise<string|null> · apAlert(نصّ)
   العنوان = الجملة الأولى حتى «؟» أو «—»، والباقي شرح صغير. الإجراء الهدّام (حذف/إيقاف/إقفال…) بالأحمر واسمه الفعل نفسه
   لا «موافق» (HIG › Alerts: «Avoid using OK… use the destructive style»). */
function apSplit(msg) {
  const s = String(msg || '').trim(), m = s.match(/^(.+?[؟?])\s*([\s\S]*)$/) || s.match(/^(.+?)\s+—\s+([\s\S]*)$/);
  return m ? [m[1], m[2].replace(/^\(|\)$/g, '')] : [s, ''];
}
function apVerb(t) {
  const v = [['حذف', 'حذف'], ['إيقاف', 'إيقاف'], ['أرشفة', 'أرشفة'], ['إقفال', 'إقفال'], ['إعادة فتح', 'إعادة الفتح'], ['إعادة البيانات', 'إعادة'], ['تصفير', 'تصفير'], ['ترحيل', 'ترحيل'], ['تحويل', 'تحويل'], ['إضافة', 'إضافة'], ['استيراد', 'استيراد'], ['اعتماد', 'اعتماد']].find(([k]) => t.includes(k));
  return { label: v ? v[1] : 'متابعة', danger: /حذف|إيقاف|إقفال|تصفير|إعادة البيانات/.test(t) };
}
function apDialog({ title, msg, field, ok, danger, cancel = true }) {
  return new Promise(res => {
    const prev = document.activeElement;
    const root = document.createElement('div'); root.className = 'ap-al-bg'; root.setAttribute('role', 'presentation');
    root.innerHTML = `<div class="ap-al" role="alertdialog" aria-modal="true" aria-labelledby="apAlT"${msg ? ' aria-describedby="apAlM"' : ''}>
      <b id="apAlT">${esc(title)}</b>${msg ? `<p id="apAlM">${esc(msg).replace(/\n/g, '<br>')}</p>` : ''}
      ${field ? `<input class="ap-al-in" type="text" value="${esc(field.value || '')}" placeholder="${esc(field.ph || '')}" dir="auto">` : ''}
      <div class="ap-al-btns${cancel ? '' : ' one'}">${cancel ? '<button type="button" data-r="0">إلغاء</button>' : ''}<button type="button" data-r="1" class="${danger ? 'danger' : 'main'}">${esc(ok)}</button></div></div>`;
    document.body.appendChild(root);
    const inp = root.querySelector('input'), done = v => { root.classList.add('out'); document.removeEventListener('keydown', key, true); setTimeout(() => root.remove(), 160); try { prev && prev.focus && prev.focus({ preventScroll: true }); } catch (e) {} res(v); };
    const val = r => field ? (r ? inp.value : null) : !!r;
    root.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) done(val(+b.dataset.r)); else if (e.target === root && cancel) done(val(0)); });
    const key = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); done(val(cancel ? 0 : 1)); } else if (e.key === 'Enter' && (!field || e.target === inp)) { e.stopPropagation(); e.preventDefault(); done(val(1)); } };
    document.addEventListener('keydown', key, true);
    setTimeout(() => { if (inp) { inp.focus(); inp.select(); } else (root.querySelector('.main, .danger') || root).focus(); }, 30);
  });
}
function apConfirm(msg) { const [t, m] = apSplit(msg), v = apVerb(t); return apDialog({ title: t, msg: m, ok: v.label, danger: v.danger }); }
function apPrompt(msg, value) { const [t, m] = apSplit(msg); return apDialog({ title: t.replace(/:$/, ''), msg: m, field: { value: value == null ? '' : String(value) }, ok: 'تم' }); }
function apAlert(msg) { const [t, m] = apSplit(msg); return apDialog({ title: t, msg: m, ok: 'حسناً', cancel: false }); }

/* ═════════ «المظهر والنص» — مثل «شاشة العرض والإضاءة» في الآيفون ═════════
   المظهر: تلقائيّ (يتبع الجهاز) / فاتح / داكن ← html.ap-dark (assets/dark.css)
   حجم النص: يتبع حجم نصّ الجهاز تلقائيّاً على أجهزة آبل (Dynamic Type)، أو تختاره (٥ درجات) — يكبّر النصّ والرموز معاً. */
const AP_SIZES = [0.9, 1, 1.1, 1.22, 1.36];
function apPrefs() { const s = (typeof S !== 'undefined' && S && S.settings && S.settings.display) || {}; return { look: ['auto', 'light', 'dark'].includes(s.look) ? s.look : 'auto', size: Number.isInteger(s.size) ? s.size : -1 }; }
function apSystemSize() {
  // حجم النصّ في إعدادات الجهاز (iOS/macOS): ‎-apple-system-body‎ = ١٧ نقطة في الحجم الافتراضيّ
  try { if (!CSS.supports('font', '-apple-system-body')) return 1; const t = document.createElement('span'); t.style.font = '-apple-system-body'; t.style.position = 'absolute'; t.style.visibility = 'hidden'; document.body.appendChild(t); const px = parseFloat(getComputedStyle(t).fontSize); t.remove(); return px ? Math.min(1.5, Math.max(.88, px / 17)) : 1; } catch (e) { return 1; }
}
function apApplyDisplay() {
  const P = apPrefs(), dark = P.look === 'dark' || (P.look === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('ap-dark', dark);
  const z = P.size < 0 ? apSystemSize() : AP_SIZES[P.size] || 1;
  document.documentElement.style.setProperty('--ap-z', String(Math.round(z * 100) / 100));
  document.documentElement.classList.toggle('ap-zoomed', Math.abs(z - 1) > .01);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#000000' : '#F5F5F7');
}
/* يستبدل applyTheme (20-org-core) — تناديه applyBranding عند كلّ دخول */
function applyTheme() { document.documentElement.setAttribute('data-theme', 'light'); apApplyDisplay(); }
function apDisplaySheet() {
  const P = apPrefs(), look = (k, n) => `<label class="ap-look"><input type="radio" name="ap_look" value="${k}"${P.look === k ? ' checked' : ''} onchange="apSetDisplay({look:this.value})"><span class="ap-look-pv ${k}"><i></i><i></i><i></i></span><b>${n}</b></label>`;
  openModal('المظهر والنص', `<div class="ap-sec-h">المظهر</div><div class="ap-looks">${look('light', 'فاتح')}${look('dark', 'داكن')}${look('auto', 'تلقائيّ')}</div>
    <p class="r-hint" style="text-align:center;margin:8px 0 18px">«تلقائيّ» يتبع إعداد جهازك — فاتح نهاراً وداكن ليلاً إن ضبطته كذلك.</p>
    <div class="ap-sec-h">حجم النصّ</div>
    <label class="r-check"><input type="checkbox" id="ap_sys"${P.size < 0 ? ' checked' : ''} onchange="apSetDisplay({size:this.checked?-1:1})"> اتّباع حجم النصّ في الجهاز</label>
    <div class="ap-size${P.size < 0 ? ' dis' : ''}"><span style="font-size:13px">ع</span><input type="range" min="0" max="4" step="1" value="${P.size < 0 ? 1 : P.size}" oninput="apSetDisplay({size:+this.value})" aria-label="حجم النصّ"><span style="font-size:22px">ع</span></div>`, () => closeModal());
  const b = document.getElementById('mSave'); if (b) b.textContent = 'تم';
}
function apSetDisplay(patch) {
  S.settings.display = Object.assign({}, S.settings.display || {}, patch); save(); apApplyDisplay();
  const sys = document.getElementById('ap_sys'), sz = document.querySelector('.ap-size');
  if (sys) sys.checked = apPrefs().size < 0; if (sz) sz.classList.toggle('dis', apPrefs().size < 0);
}


/* ═════════ خاصّ بنظام إبراهيم ═════════ */
/* المظهر القديم (S.settings.theme = dark|light) يصير «المظهر والنص» — بلا إعداد = تلقائيّ */
function setTheme(t) { apSetDisplay({ look: t === 'dark' || t === 'light' ? t : 'auto' }); if (document.getElementById('wpBody')) wpRenderBody(); if (CUR === 'settings') renderSettings(); }

function rToast(msg, bad) { let t = document.getElementById('rToast'); if (!t) { t = document.createElement('div'); t.id = 'rToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.className = 'r-toast' + (bad ? ' bad' : ''); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200); }

/* الخلفيّة: طبقة ثابتة #orgWall خلف كلّ شيء (لا تُلغَ — جوهر التصميم). بلا اختيار سابق ← Tahoe أزرق. */
const AP_WALL_DEF = 'tahoe-blue';
function wpCurrent() {
  const w = S.settings && S.settings.wallpaper;
  if (!w || (w.type === 'preset' && !WALLS.some(x => x.key === w.key))) { const d = WALL_IMAGES.find(x => x.key === AP_WALL_DEF); return { type: 'url', key: d.key, url: d.url }; }
  return w;
}
function applyWallpaper() {
  let el = document.getElementById('orgWall');
  if (!el) { el = document.createElement('div'); el.id = 'orgWall'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el); }
  const sh = document.querySelector('.shell'); if (sh) { sh.style.background = ''; sh.style.backgroundAttachment = ''; }
  const w = wpCurrent(); let url = '', css = '';
  if (w.type === 'url') url = w.url || '';
  else if (w.type === 'image') { url = w.value || ((wpList().find(x => x.id === w.id) || {}).value) || ''; }
  else if (w.type === 'preset' && w.key !== 'none') css = (WALLS.find(x => x.key === w.key) || {}).css || '';
  el.style.background = css || '';
  el.style.backgroundImage = url ? 'url("' + url.replace(/"/g, '%22') + '")' : (css ? '' : '');
  if (url) { el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; }
  document.documentElement.classList.toggle('has-wp', !!(url || css));
  if (css) { const p = WALLS.find(x => x.key === w.key); wpToneSet(p && p.light ? 'light' : 'dark'); } else wpTone(url);
}
function wpToneSet(t) { const H = document.documentElement; H.classList.toggle('wp-dark', t === 'dark'); H.classList.toggle('wp-light', t === 'light'); }
/* سطوع الخلفيّة يُقاس تلقائيّاً ← نصّ أبيض فوق الداكنة وداكن فوق الفاتحة */
function wpTone(url) {
  if (!url) { wpToneSet(''); return; }
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('wp_tone') || '{}'); } catch (e) {}
  const k = url.length > 200 ? url.slice(0, 60) + url.length + url.slice(-60) : url;
  if (cache[k]) { wpToneSet(cache[k]); return; }
  wpToneSet('dark');
  const img = new Image(); img.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = 48; c.height = 27; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 48, 27);
      const d = x.getImageData(0, 0, 48, 27).data; let L = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { const row = Math.floor(i / 4 / 48), w = row < 9 ? 2 : 1; L += w * (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]); n += w; }
      const t = L / n / 255 > .56 ? 'light' : 'dark'; cache[k] = t; try { localStorage.setItem('wp_tone', JSON.stringify(cache)); } catch (e) {} wpToneSet(t);
    } catch (e) { wpToneSet('dark'); }
  };
  img.src = url;
}
function wpRenderBody() {
  const body = document.getElementById('wpBody'); if (!body) return;
  const cur = wpCurrent(), mine = wpList();
  const chip = (on, style, label, click, del) => `<div class="wp-chip img${on ? ' on' : ''}" role="button" tabindex="0" onclick="${click}" onkeydown="if(event.key==='Enter')${click}" style="${style}" title="${esc(label)}">${del || ''}<span>${on ? '<i class="inl" data-lucide="check"></i> مُفعّلة' : esc(label)}</span></div>`;
  body.innerHTML = `
    <div class="wp-sec-title"><i data-lucide="mountain"></i> خلفيات آبل</div>
    <div class="wp-grid">${WALL_IMAGES.map(im => chip(cur.type === 'url' && cur.key === im.key, `background-image:url('${im.url}')`, im.name, `wpPickUrl('${im.key}')`)).join('')}
      <div class="wp-chip none${cur.type === 'preset' && cur.key === 'none' ? ' on' : ''}" role="button" tabindex="0" onclick="wpPick('none')"><span>بدون خلفية</span></div></div>
    <div class="wp-sec-title"><i data-lucide="palette"></i> ألوان متدرّجة</div>
    <div class="wp-grid">${WALLS.filter(w => w.key !== 'none').map(w => chip(cur.type === 'preset' && cur.key === w.key, `background:${w.css}`, w.name, `wpPick('${w.key}')`)).join('')}</div>
    <div class="wp-sec-title"><i data-lucide="upload"></i> صوري ${mine.length ? `<span class="r-sub">(${mine.length})</span>` : ''}</div>
    ${mine.length ? `<div class="wp-grid">${mine.map(im => chip(cur.type === 'image' && cur.id === im.id, `background-image:url('${im.value}')`, im.name || 'صورتي', `wpPickImage('${im.id}')`, `<button class="wp-del" onclick="event.stopPropagation();wpDelImage('${im.id}')" title="حذف" aria-label="حذف">×</button>`)).join('')}</div>`
      : '<p class="r-sub" style="margin:0 0 14px">ارفع صورة من جهازك أو جوالك لتصبح خلفيتك — تُضغط تلقائياً وتُزامَن مع حسابك.</p>'}`;
  refreshIcons();
}
