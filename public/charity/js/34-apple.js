/*
 * 34-apple.js — سلوكيّات آبل في النظام كلّه (البادئة ap) — الشكل في assets/apple.css
 * ─────────────────────────────────────────────────────────────────────────
 * • النافذة (Sheet): زرّ إغلاق دائريّ أعلاها، والأساسيّ كبسولة أسفلها، و«حذف» أحمر — بلا «إلغاء» مكرّر
 *   (البدائل: ✕، النقر خارجها، Esc، والسحب للأسفل على الجوال) — HIG › Sheets.
 * • العنوان الكبير: يختفي عنوان الشريط العلويّ ما دام عنوان الصفحة الكبير ظاهراً، ويظهر عند التمرير — HIG › Toolbars.
 * يستبدل openModal (19-freeform) بنفس التوقيع والمعرّفات (mSave / mDel) فلا تتأثّر الشاشات.
 * ⚠️ تعريفات فقط؛ apInit() يناديها 99-boot مرّة واحدة.
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
