/*
 * 29-saas.js — «نظام الجمعيات»: تعدّد الجمعيّات والاشتراك
 * ─────────────────────────────────────────────────────────────────────────
 * يُحمَّل بعد 20..28 ويعيد تعريف enterApp و showShell عمداً (آخر تعريف هو المعتمد).
 * - تسجيل جمعيّة جديدة ذاتيّاً (حساب المدير + صفّ في orgs عبر الدالّة create_org)
 * - بيانات الجمعيّة (الاسم والترخيص والبنك…) من orgs.profile تُدمج فوق CONFIG بعد الدخول
 * - شريط الاشتراك: تجربة مجانيّة ← اشتراك سنويّ ← منتهٍ = قراءة فقط (يفرضه RLS أيضاً)
 * ⚠️ تعريفات فقط — لا جمل تنفيذيّة عند التحميل (انظر 99-boot.js).
 */

let SAAS_ORG = null;   // صفّ الجمعيّة الحاليّة من جدول orgs

/* ═════════ بيانات الجمعيّة فوق الإعدادات الافتراضيّة ═════════ */
const SAAS_PROFILE_FIELDS = [
  ['license', 'رقم الترخيص (المركز الوطني)', 'text'], ['address', 'العنوان (المدينة، الحي)', 'text'],
  ['phone', 'جوال التواصل', 'tel'], ['email', 'البريد الرسمي', 'email'],
  ['bankName', 'البنك', 'text'], ['iban', 'الآيبان', 'text'], ['accName', 'اسم صاحب الحساب', 'text'],
  ['logo', 'رابط الشعار (اختياري)', 'url'],
];
function saasApplyProfile(o) {
  if (!o) return;
  const p = o.profile || {};
  CONFIG.companyName = o.name || CONFIG.companyName;
  CONFIG.license = p.license || ''; CONFIG.companyAddress = p.address || '';
  CONFIG.ownerPhone = p.phone || ''; CONFIG.ownerEmail = p.email || '';
  CONFIG.bankName = p.bankName || ''; CONFIG.bankIban = p.iban || ''; CONFIG.bankAccName = p.accName || o.name || '';
  CONFIG.brandLogo = (p.logo && /^https:\/\//.test(p.logo)) ? p.logo : './assets/logo-black.png?v=2';   // المطبوعات بشعار الجمعيّة
  if (Array.isArray(p.boardMembers)) ORG_CFG.boardMembers = p.boardMembers;
  if (typeof ofApplyProfile === 'function') ofApplyProfile(p);   // حدود الصلاحيّات ومسمّى المسؤول التنفيذيّ (30-compliance)
  if (S && S.settings) {
    S.settings.brand = CONFIG.companyName;
    S.settings.official = Object.assign({}, S.settings.official || {}, { brand: CONFIG.companyName, phone: CONFIG.ownerPhone, email: CONFIG.ownerEmail, iban: CONFIG.bankIban, address: CONFIG.companyAddress });
    S.settings.bankName = CONFIG.bankName; S.settings.iban = CONFIG.bankIban; S.settings.accName = CONFIG.bankAccName;
  }
}

/* ═════════ حالة الاشتراك ═════════ */
function saasStatus() {
  const o = SAAS_ORG; if (!o) return { state: 'none', days: 0 };
  const now = Date.now(), paid = o.paid_until ? new Date(o.paid_until).getTime() : 0, trial = o.trial_ends ? new Date(o.trial_ends).getTime() : 0;
  if (paid > now) return { state: 'active', days: Math.ceil((paid - now) / 864e5), until: o.paid_until };
  if (trial > now) return { state: 'trial', days: Math.ceil((trial - now) / 864e5), until: o.trial_ends };
  return { state: 'expired', days: 0 };
}
const saasPriceTxt = () => `${CONFIG.plan.price} ${CONFIG.plan.currency} / ${CONFIG.plan.period}`;
function saasBar() {
  let b = document.getElementById('saasBar');
  const st = saasStatus();
  if (st.state === 'active' && st.days > 30) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'saasBar'; b.className = 'saas-bar'; const top = document.querySelector('.content-top'); if (!top) return; top.after(b); }
  const admin = isAdmin(), payBtn = admin ? `<button class="btn btn-gold saas-btn" onclick="saasPay()">${st.state === 'trial' ? 'اشترك الآن' : 'جدّد الاشتراك'} · ${saasPriceTxt()}</button>` : '';
  if (RUSO_DEMO) { b.className = 'saas-bar'; b.innerHTML = `<span><i data-lucide="sparkles"></i> نسخة تجريبيّة — بيانات وهميّة في متصفّحك فقط</span><a class="btn btn-gold saas-btn" href="./?signup=1">سجّل جمعيّتك · ${CONFIG.plan.trialDays} يوماً مجاناً</a>`; refreshIcons(); return; }
  if (st.state === 'trial') { b.className = 'saas-bar'; b.innerHTML = `<span><i data-lucide="hourglass"></i> التجربة المجانيّة: باقي <b>${st.days}</b> ${st.days === 1 ? 'يوم' : 'أيام'}</span>${payBtn}`; }
  else if (st.state === 'active') { b.className = 'saas-bar'; b.innerHTML = `<span><i data-lucide="calendar-clock"></i> اشتراككم ينتهي بعد <b>${st.days}</b> يوماً</span>${payBtn}`; }
  else { b.className = 'saas-bar bad'; b.innerHTML = `<span><i data-lucide="lock"></i> انتهى الاشتراك — بياناتكم محفوظة وتقدرون تطّلعون عليها، والتعديل متوقّف حتى التجديد.</span>${payBtn || '<span class="r-sub">تواصل مع المدير التنفيذي للتجديد.</span>'}`; }
  refreshIcons();
}

/* ═════════ الدفع (الدالّة الحافّة charity-pay → تلر) ═════════ */
async function saasPay() {
  if (RUSO_DEMO) { location.href = './?signup=1'; return; }
  rToast('جارٍ تجهيز صفحة الدفع…');
  try {
    const { data, error } = await sb.functions.invoke(CONFIG.plan.payFn, { body: { action: 'start', return_url: location.origin + location.pathname } });
    if (error) throw error;
    if (!data || !data.url) throw new Error((data && data.error) || 'تعذّر إنشاء رابط الدفع');
    location.href = data.url;
  } catch (e) { rToast('تعذّر فتح الدفع: ' + (e.message || e), true); }
}
/* العودة من تلر: ?paid=<ref> ← نتحقّق من الدفع عند الخادم (لا نصدّق الرابط) */
async function saasCheckReturn() {
  const p = new URLSearchParams(location.search), ref = p.get('paid'); if (!ref || RUSO_DEMO) return;
  history.replaceState(null, '', location.pathname);
  try {
    const { data, error } = await sb.functions.invoke(CONFIG.plan.payFn, { body: { action: 'check', ref } });
    if (error) throw error;
    if (data && data.ok) { await saasReloadOrg(); rToast('تم الدفع — شكراً لكم، اشتراككم فعّال حتى ' + fmtD(SAAS_ORG.paid_until)); }
    else rToast((data && data.message) || 'لم يكتمل الدفع', true);
  } catch (e) { rToast('تعذّر التحقّق من الدفع: ' + (e.message || e), true); }
  saasBar();
}
async function saasReloadOrg() {
  const { data, error } = await sb.from('orgs').select('*').eq('id', ME.org_id).single();
  if (error) throw error; SAAS_ORG = data; saasApplyProfile(data);
}

/* ═════════ بيانات الجمعيّة (للمدير التنفيذي) ═════════ */
function saasProfileModal() {
  if (!isAdmin()) { rToast('بيانات الجمعيّة يعدّلها المدير التنفيذي', true); return; }
  const o = SAAS_ORG || { name: CONFIG.companyName, profile: {} }, p = o.profile || {};
  const st = saasStatus();
  const stTxt = RUSO_DEMO ? 'نسخة تجريبيّة' : st.state === 'active' ? `مشترك حتى ${fmtD(st.until)}` : st.state === 'trial' ? `تجربة مجانيّة حتى ${fmtD(st.until)}` : 'منتهٍ';
  openModal('بيانات الجمعيّة', `
    <p class="r-sub" style="margin:0 0 12px">تظهر في السندات والتقارير المطبوعة. الاشتراك: <b>${stTxt}</b></p>
    <div class="field"><label>اسم الجمعيّة</label><input id="sp_name" value="${esc(o.name || '')}"></div>
    ${SAAS_PROFILE_FIELDS.map(([k, l, t]) => `<div class="field"><label>${l}</label><input id="sp_${k}" type="${t}" dir="${['phone', 'email', 'iban', 'logo'].includes(k) ? 'ltr' : 'rtl'}" value="${esc(p[k] || '')}"></div>`).join('')}
    <div class="field"><label>أعضاء مجلس الإدارة <span class="r-sub">(سطر لكل عضو: الاسم - الصفة)</span></label><textarea id="sp_board" rows="4">${esc((p.boardMembers || []).map(x => x.join(' - ')).join('\n'))}</textarea></div>`,
  async () => {
    const name = fval('sp_name'); if (!name) { rToast('اكتب اسم الجمعيّة', true); return; }
    const profile = Object.assign({}, p);
    SAAS_PROFILE_FIELDS.forEach(([k]) => profile[k] = fval('sp_' + k));
    if (profile.logo && !/^https:\/\//.test(profile.logo)) { rToast('رابط الشعار يبدأ بـ https://', true); return; }
    profile.boardMembers = fval('sp_board').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [n, ...r] = l.split(/\s+-\s+/); return [n.trim(), (r.join(' - ') || 'عضو مجلس الإدارة').trim()]; });
    try {
      if (RUSO_LIVE && !RUSO_DEMO) { const { error } = await sb.rpc('update_org_profile', { org_name: name, org_profile: profile }); if (error) throw error; await saasReloadOrg(); }
      else { SAAS_ORG = Object.assign({}, o, { name, profile }); saasApplyProfile(SAAS_ORG); try { localStorage.setItem(DEMO_KEY + '_org', JSON.stringify(SAAS_ORG)); } catch (e) {} }
      save(); closeModal(); rToast('حُفظت بيانات الجمعيّة');
    } catch (e) { rToast('تعذّر الحفظ: ' + (e.message || e), true); }
  });
}
function saasNavLink() {
  const f = document.querySelector('.nav-foot'); if (!f || document.getElementById('saasOrgLink') || !isAdmin()) return;
  const a = document.createElement('a'); a.id = 'saasOrgLink'; a.onclick = saasProfileModal;
  a.innerHTML = '<span class="nic"><i data-lucide="building-2"></i></span> بيانات الجمعيّة';
  const s = f.querySelector('a'); f.insertBefore(a, s || null); refreshIcons();
}

/* ═════════ شاشة الدخول: دخول | تسجيل جمعيّة جديدة ═════════ */
function saasShowSignup(on) {
  document.getElementById('loginBox').classList.toggle('hidden', !!on);
  document.getElementById('signupBox').classList.toggle('hidden', !on);
  lerr(''); lmsg(''); const e = document.getElementById(on ? 'su_org' : 'em'); if (e) e.focus();
}
function suErr(m) { document.getElementById('suErr').textContent = m || ''; }
function suMsg(m) { document.getElementById('suMsg').textContent = m || ''; }
async function saasSignup() {
  const org = fval('su_org'), name = fval('su_name'), em = fval('su_em').toLowerCase(), pw = document.getElementById('su_pw').value;
  if (!org || !name) { suErr('اكتب اسم الجمعيّة واسمك.'); return; }
  if (!/^\S+@\S+\.\S+$/.test(em)) { suErr('اكتب بريداً صحيحاً.'); return; }
  if (pw.length < 8) { suErr('كلمة المرور ٨ أحرف على الأقل.'); return; }
  if (!sb) { suErr('التسجيل غير متاح في النسخة التجريبيّة.'); return; }
  suErr(''); busy('btnSu', true); suMsg('جارٍ إنشاء الحساب…');
  // اسم الجمعيّة يُحفظ محلّيّاً حتى تُنشأ بعد الدخول (Neon Auth لا يحمل بيانات إضافيّة مع التسجيل)
  try { localStorage.setItem(SAAS_PENDING, JSON.stringify({ org, name, email: em })); } catch (e) {}
  const { data, error } = await sb.auth.signUp({ email: em, password: pw, options: { data: { displayName: name } } });
  busy('btnSu', false);
  if (error) { suMsg(''); suErr('تعذّر التسجيل: ' + authMsg(error.message)); return; }
  if (data.session) { suMsg(''); await enterApp(data.user); }
  else suMsg('أنشأنا حسابك — سجّل الدخول ببريدك وكلمة المرور لتبدأ تجربتكم.');
}
const SAAS_PENDING = 'charity_pending_org';
function saasPending(email) {
  try { const p = JSON.parse(localStorage.getItem(SAAS_PENDING) || 'null'); return p && p.email === String(email || '').toLowerCase() ? p : null; } catch (e) { return null; }
}

/* ═════════ تأكيد البريد برمز (لربط الموظّف بجمعيّته) ═════════ */
let SAAS_VERIFY_EMAIL = '';
function saasVerifyShow(email) {
  SAAS_VERIFY_EMAIL = email;
  ['loginBox', 'signupBox'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('verifyBox').classList.remove('hidden');
  document.getElementById('vfEmail').textContent = email;
  saasVerifySend();
}
async function saasVerifySend() {
  const m = document.getElementById('vfMsg'), e = document.getElementById('vfErr'); e.textContent = ''; m.textContent = 'جارٍ إرسال الرمز…';
  const { error } = await sb.auth.sendEmailCode(SAAS_VERIFY_EMAIL);
  if (error) { m.textContent = ''; e.textContent = 'تعذّر إرسال الرمز: ' + authMsg(error.message); return; }
  m.textContent = 'أرسلنا رمزاً من ٦ أرقام إلى بريدك (افحص «غير المرغوب» أيضاً).';
  const f = document.getElementById('vfCode'); if (f) f.focus();
}
async function saasVerifyCode() {
  const code = (document.getElementById('vfCode').value || '').replace(/\D/g, '');
  const e = document.getElementById('vfErr'), m = document.getElementById('vfMsg');
  if (code.length < 6) { e.textContent = 'اكتب الرمز كاملاً.'; return; }
  e.textContent = ''; busy('btnVf', true); m.textContent = 'جارٍ التحقّق…';
  const { data, error } = await sb.auth.verifyOtp({ email: SAAS_VERIFY_EMAIL, token: code, type: 'signup' });
  busy('btnVf', false);
  if (error) { m.textContent = ''; e.textContent = 'الرمز غير صحيح أو انتهى — اطلب رمزاً جديداً.'; return; }
  m.textContent = '';
  document.getElementById('verifyBox').classList.add('hidden'); document.getElementById('loginBox').classList.remove('hidden');
  const u = (data && data.user) || USER; USER = null; await enterApp(u);
}

/* ═════════ الدخول (يستبدل enterApp في 20-org-core) ═════════ */
async function enterApp(user) {
  if (USER && user && USER.id === user.id) return;
  USER = user; lmsg('جارٍ التحقق من حسابك...');
  const fail = (m) => { lerr(m); lmsg(''); suMsg(''); };
  try {
    let { data: m, error } = await sb.from('members').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!m) {
      // ١) موظّف أضافه مديره ببريده ← يُربط (بشرط بريد مؤكَّد)
      const pend = saasPending(user.email);
      if (!pend) {
        const c = await sb.rpc('claim_membership');
        if (c.error && /أكّد بريدك/.test(c.error.message || '')) { lmsg(''); return saasVerifyShow(user.email); }
        if (c.error) throw c.error;
        if (c.data) ({ data: m, error } = await sb.from('members').select('*').eq('user_id', user.id).maybeSingle());
        if (!m) {
          await sb.auth.signOut(); USER = null; saasShowSignup(false);
          return fail('هذا البريد غير مرتبط بأيّ جمعيّة. سجّل جمعيّتك من «سجّل جمعيّتك»، أو اطلب من المدير التنفيذي إضافة بريدك من «الفريق والصلاحيات».');
        }
      } else {
        // ٢) تسجيل جمعيّة جديدة ← تُنشأ ويصير صاحب الحساب مديرها التنفيذي
        lmsg('جارٍ تجهيز جمعيّتك…'); suMsg('جارٍ تجهيز جمعيّتك…');
        const r = await sb.rpc('create_org', { org_name: pend.org, admin_name: pend.name || '' });
        if (r.error) throw r.error;
        try { localStorage.removeItem(SAAS_PENDING); } catch (e) {}
        ({ data: m, error } = await sb.from('members').select('*').eq('user_id', user.id).maybeSingle());
        if (error) throw error;
      }
    }
    if (!m || m.active === false) { await sb.auth.signOut(); USER = null; return fail('حسابك موقوف في فريق الجمعيّة — راجع المدير التنفيذي.'); }
    ME = m;
    await saasReloadOrg();
    await loadCloud(); migrateData(); saasApplyProfile(SAAS_ORG); save();
    await loadOrg();
  } catch (e) { return fail('تعذّر تحميل البيانات: ' + (e.message || e)); }
  lmsg(''); suMsg(''); showShell(); saasCheckReturn();
}

/* يستبدل showShell في 20-org-core — نفسه + شريط الاشتراك ورابط بيانات الجمعيّة */
function showShell() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  if (RUSO_DEMO && !SAAS_ORG) {
    try { SAAS_ORG = JSON.parse(localStorage.getItem(DEMO_KEY + '_org') || 'null'); } catch (e) {}
    SAAS_ORG = SAAS_ORG || { name: 'جمعيّة تجريبيّة', profile: {}, trial_ends: new Date(Date.now() + CONFIG.plan.trialDays * 864e5).toISOString() };
    saasApplyProfile(SAAS_ORG);
  }
  rDefaultWall();
  renderNav(); initSidebarShell(); applyBranding(); applyWallpaper(); rUserChip();
  const dt = document.getElementById('ctDate'); if (dt) dt.textContent = new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' });
  saasNavLink(); saasBar();
  go(typeof dkLanding === 'function' ? dkLanding() : 'home');
}

/* يستبدل bootstrap في 20-org-core — ?signup=1 يفتح تسجيل جمعيّة جديدة مباشرة */
async function bootstrap() {
  const params = new URLSearchParams(location.search);
  if (!RUSO_LIVE || params.get('demo')) { await enterRusoDemo(); return; }
  if (RECOVERY_MODE || params.get('token')) { RECOVERY_MODE = true; showReset(); return; }   // رابط استعادة كلمة المرور من Neon Auth
  try { const { data } = await sb.auth.getSession(); if (data && data.session && !RECOVERY_MODE) { await enterApp(data.session.user); return; } } catch (e) {}
  saasShowSignup(params.has('signup'));
}

/* يستبدل doSetNewPassword في 01-core — Neon Auth يغيّر كلمة المرور برمز الرابط (?token=) */
async function doSetNewPassword() {
  const p1 = document.getElementById('np1').value, p2 = document.getElementById('np2').value; rerr('');
  if (p1.length < 8) { rerr('كلمة المرور يجب أن تكون 8 أحرف على الأقل.'); return; }
  if (p1 !== p2) { rerr('كلمتا المرور غير متطابقتين.'); return; }
  const token = new URLSearchParams(location.search).get('token') || '';
  busy('btnReset', true); rmsg('جارٍ الحفظ...');
  const { error } = await sb.auth.resetPasswordWithToken(token, p1);
  busy('btnReset', false);
  if (error) { rmsg(''); rerr('تعذّر الحفظ — قد يكون الرابط منتهياً، اطلب رابطاً جديداً.'); return; }
  RECOVERY_MODE = false; history.replaceState(null, '', location.origin + location.pathname);
  document.getElementById('resetView').classList.add('hidden'); document.getElementById('loginView').classList.remove('hidden');
  lmsg('تم تحديث كلمة المرور — ادخل بها الآن.');
}
