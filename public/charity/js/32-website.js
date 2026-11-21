/*
 * 32-website.js — «موقع الجمعيّة»: موقع جاهز من بيانات الجمعيّة، بسهولة سلّة (البادئة ws)
 * ─────────────────────────────────────────────────────────────────────────
 * • الشاشة: حالة الموقع ورابطه ← «جهّز موقعك» (٧ خطوات قصيرة) ← أقسام الموقع (إظهار/ترتيب) ← المحتوى.
 * • معاينة حيّة: إطار site/?preview=1 يستقبل البيانات بـpostMessage (نفس الأصل) — كلّ حفظ يظهر فوراً.
 * • مصدر واحد للحقيقة: الشعار واللون والرؤية والرسالة والقيم من «ملفّ الجمعيّة» (orgs.profile)؛
 *   الواجهة والأرقام والتواصل والتبرّع في site_settings؛ البرامج والأخبار… جداولها كما هي.
 * • الرابط: orgs.slug عبر set_site_address (المدير التنفيذيّ)؛ والنشر = site_settings.site.published.
 * يستبدل renderSite و paintSite و siteAutoSeed من 23-org-site (لا استيراد لمحتوى رسو).
 * ⚠️ تعريفات فقط.
 */
const WS = { view: 'home', tab: 'programs', data: null, addr: { slug: '', domain: '' }, rows: {}, settings: {}, frame: null, ready: false };
/* القوالب — كلّ منها هيكل مختلف لا تلوين فقط (site/t/<id>.js + .css)، وصورها المصغّرة في site/t/thumbs */
const WS_TPL = {
  noor: { name: 'نقاء', d: 'أبيض هادئ وصورة بجانب العنوان — يناسب أغلب الجمعيّات', font: 'ts' },
  sahifa: { name: 'صحيفة', d: 'صفحة أولى لجريدة: ترويسة وأعمدة وخبر رئيسيّ — لمن عنده أخبار وتقارير', font: 'amiri' },
  mashrabiya: { name: 'مشربيّة', d: 'نقوش إسلاميّة هندسيّة وأقواس — للجمعيّات القرآنيّة والدعويّة والخيريّة', font: 'reem' },
  arqam: { name: 'أرقام', d: 'أكبر رقم عندكم هو الواجهة، وشبكة جريئة — لمن يقيس أثره', font: 'alexandria' },
  athar: { name: 'أثر', d: 'صورة بعرض الشاشة وأرقام جريئة — للعمل الميدانيّ', font: 'ts' },
  waqar: { name: 'وقار', d: 'رسميّ مؤسّسيّ بخطّ مميّز — للجمعيّات المهنيّة', font: 'ts' },
};
/* الخطوط (نفس مفاتيح site/site.js) — العيّنة تُحمَّل بحروفها فقط (text=) فتبقى خفيفة */
const WS_FONTS = { ts: ['ثمانية', 'TS'], plex: ['بلكس', 'IBM Plex Sans Arabic'], tajawal: ['تجوال', 'Tajawal'], almarai: ['المراعي', 'Almarai'], kufi: ['كوفيّ رسميّ', 'Noto Kufi Arabic'],
  amiri: ['أميري', 'Amiri'], reem: ['ريم الكوفيّ', 'Reem Kufi'], messiri: ['المسيري', 'El Messiri'], alexandria: ['ألكسندريا', 'Alexandria'], readex: ['ريدكس', 'Readex Pro'] };
const WS_FONT_SAMPLE = 'نزرع أثراً يبقى';
function wsFontCss() {
  if (document.getElementById('wsFontCss')) return;
  const fams = Object.values(WS_FONTS).filter(f => f[1] !== 'TS').map(f => 'family=' + f[1].replace(/ /g, '+') + ':wght@700');
  const txt = encodeURIComponent(WS_FONT_SAMPLE + Object.values(WS_FONTS).map(f => f[0]).join(''));
  const l = document.createElement('link'); l.id = 'wsFontCss'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + fams.join('&') + '&text=' + txt + '&display=swap'; document.head.appendChild(l);
}
const WS_THUMB_V = 'v=1';
const WS_SITE_V = 'sv=8';   // يُرفع مع كلّ تعديل في site/ حتى لا تُعرض المعاينة من نسخة مخزّنة
const WS_SECTIONS = { impact: ['أثرنا', 'bar-chart-3'], about: ['من نحن', 'info'], programs: ['البرامج', 'graduation-cap'], stories: ['قصص وشهادات', 'quote'], news: ['الأخبار', 'newspaper'],
  join: ['تطوّع معنا', 'hand-heart'], donate: ['ادعمنا', 'heart'], governance: ['الحوكمة والشفافية', 'shield-check'], partners: ['الشركاء', 'handshake'], faq: ['الأسئلة الشائعة', 'circle-help'], contact: ['تواصل معنا', 'phone'] };
const WS_ORDER = ['impact', 'about', 'programs', 'stories', 'news', 'join', 'donate', 'governance', 'partners', 'faq', 'contact'];
const WS_COLORS = ['#0B7F86', '#1003BD', '#137A3D', '#0F766E', '#1E3A5F', '#6D28D9', '#B45309', '#C2410C', '#BE123C', '#374151'];
const WS_TABLES = ['programs', 'news', 'testimonials', 'partners', 'faqs', 'documents', 'opportunities'];
const WS_SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const wsBase = () => location.origin + location.pathname.replace(/[^/]*$/, '') + 'site/';
const wsUrl = () => WS.addr.slug ? wsBase() + '?s=' + WS.addr.slug : '';
const wsPretty = u => String(u || '').replace(/^https?:\/\//, '');

/* ═════════ البيانات ═════════ */
async function wsLoad() {
  const [st, ...lists] = await Promise.all([RDB.list('site_settings').catch(() => [])].concat(WS_TABLES.map(t => RDB.list(t).catch(() => []))));
  WS.settings = {}; st.forEach(r => WS.settings[r.key] = r.value);
  WS_TABLES.forEach((t, i) => WS.rows[t] = lists[i] || []);
  WS.addr = await wsGetAddr();
}
async function wsGetAddr() {
  if (RUSO_LIVE && !RUSO_DEMO) { try { const { data } = await sb.rpc('my_site_address'); return data || { slug: '', domain: '' }; } catch (e) { return { slug: '', domain: '' }; } }
  try { return JSON.parse(localStorage.getItem(DEMO_KEY + '_siteaddr') || 'null') || { slug: '', domain: '' }; } catch (e) { return { slug: '', domain: '' }; }
}
const wsSite = () => Object.assign({ published: false, template: 'noor', sections: [] }, WS.settings.site || {});
function wsSections() {
  const l = (wsSite().sections || []).filter(x => WS_SECTIONS[x.id]);
  WS_ORDER.forEach(id => { if (!l.find(x => x.id === id)) l.push({ id, on: true }); });
  return l;
}
/* نفس شكل ما تُرجعه site_public — حتى تطابق المعاينةُ الموقعَ المنشور */
function wsPayload() {
  const p = typeof ofProfile === 'function' ? ofProfile() : {}, pub = r => r.published !== false;
  const prof = Object.assign({}, p, { board: (p.boardMembers || []).filter(m => m && m.n).map(m => ({ n: m.n, r: m.r })), committees: (p.committees || []).filter(c => c && c.name && (c.chair || c.members)) });
  return { name: p._name || CONFIG.companyName, slug: WS.addr.slug, profile: prof, settings: Object.assign({}, WS.settings, { site: Object.assign(wsSite(), { published: true }) }),
    programs: WS.rows.programs.filter(pub).sort((a, b) => (a.sort || 0) - (b.sort || 0)), news: WS.rows.news.filter(pub).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    partners: WS.rows.partners.filter(pub), testimonials: WS.rows.testimonials.filter(pub), faqs: WS.rows.faqs.filter(pub), documents: WS.rows.documents.filter(pub), opportunities: WS.rows.opportunities.filter(pub) };
}
function wsSend(focus) {
  const f = document.getElementById('wsFrame'); if (!f || !f.contentWindow || !WS.ready) return;
  f.contentWindow.postMessage({ type: 'ws:data', data: wsPayload(), focus: focus || '' }, location.origin);
}
function wsOnMsg(ev) { if (ev.origin === location.origin && ev.data && ev.data.type === 'ws:ready') { WS.ready = true; wsSend(); } }

/* ═════════ خطوات الإطلاق ═════════ */
function wsSteps() {
  const p = typeof ofProfile === 'function' ? ofProfile() : {}, s = WS.settings, h = s.hero || {}, sp = s.support || {}, c = s.contact || {};
  return [
    { id: 'look', t: 'القالب والهويّة', d: 'اختر شكل موقعك ولونه وشعارك', icon: 'palette', done: !!(WS.settings.site && WS.settings.site.template) && !!p.logo },
    { id: 'hero', t: 'الواجهة', d: 'أوّل ما يراه الزائر: عنوان وجملة وصورة', icon: 'panel-top', done: !!(h.title_html && h.lead) },
    { id: 'about', t: 'من نحن', d: 'الرؤية والرسالة والقيم', icon: 'info', done: !!(p.vision && p.mission) },
    { id: 'board', t: 'صور مجلس الإدارة', d: 'صورة رسميّة لكلّ عضو — نعلّمك كيف تصوّرها بجوالك', icon: 'users', done: (() => { const b = typeof ofBoard === 'function' ? ofBoard(p) : [], ph = s.board_photos || {}; return b.length > 0 && b.every(m => ph[m.n]); })() },
    { id: 'impact', t: 'أرقام الأثر', d: '٤ أرقام تحكي إنجازكم', icon: 'bar-chart-3', done: (s.stats || []).filter(x => x && x.value).length >= 2 },
    { id: 'donate', t: 'التبرّع', d: 'الآيبان ورابط التبرّع الإلكترونيّ', icon: 'heart', done: !!(sp.iban || p.iban || sp.donate_url) },
    { id: 'contact', t: 'التواصل', d: 'الجوّال والواتساب والعنوان والحسابات', icon: 'phone', done: !!((c.phone || p.phone) && (c.email || p.email)) },
    { id: 'address', t: 'رابط الموقع', d: 'العنوان الذي تشاركه مع الناس', icon: 'link', done: !!WS.addr.slug },
  ];
}

/* ═════════ الشاشة ═════════ */
async function renderSite() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  window.removeEventListener('message', wsOnMsg); window.addEventListener('message', wsOnMsg);
  try { await wsLoad(); } catch (e) { rToast(e.message, 1); }
  WS.view = 'home'; WS.ready = false; paintSite();
}
async function siteAutoSeed() {}            // نظام الاشتراك: لا استيراد لمحتوى جمعيّة أخرى — الموقع يبدأ من بيانات جمعيّتك
function paintSite() {
  if (WS.view === 'content') { wsPaintContent(); return; }
  const site = wsSite(), steps = wsSteps(), done = steps.filter(x => x.done).length, url = wsUrl(), live = site.published && url;
  const pct = Math.round(done / steps.length * 100), next = steps.find(x => !x.done);
  const cnt = t => (WS.rows[t] || []).filter(r => r.published !== false).length;
  const col = `
      <section class="ws-status ${live ? 'live' : ''}">
        <div class="ws-st-top"><span class="ws-pill ${live ? 'on' : ''}"><i></i>${live ? 'منشور — يراه الجميع' : 'مسودّة — لا يراه الزوّار بعد'}</span>
          ${live ? `<button class="ws-link-btn" onclick="wsPublish(false)">إيقاف النشر</button>` : ''}</div>
        <h1>موقع ${esc(CONFIG.companyName)}</h1>
        ${url ? `<div class="ws-url"><i data-lucide="globe"></i><a href="${esc(url)}" target="_blank" rel="noopener" dir="ltr">${esc(wsPretty(url))}</a></div>` : `<p class="ws-sub">اختر رابطاً لموقعك ثمّ انشره بضغطة.</p>`}
        <div class="ws-acts">
          <button class="ws-btn ghost" onclick="wsPreview()"><i data-lucide="smartphone"></i> معاينة</button>
          ${live ? `<button class="ws-btn" onclick="wsShare()"><i data-lucide="share"></i> مشاركة الرابط</button>`
            : `<button class="ws-btn" onclick="wsPublish(true)"><i data-lucide="rocket"></i> انشر الموقع</button>`}
        </div>
      </section>

      <section class="ws-card">
        <div class="ws-h"><div><h2>جهّز موقعك</h2><p>${done === steps.length ? 'اكتملت الخطوات — موقعك جاهز 🎉' : `${done} من ${steps.length} — ${next ? 'التالي: ' + next.t : ''}`}</p></div>
          <span class="ws-ring" style="--p:${pct}"><b>${pct}٪</b></span></div>
        <div class="ws-steps">${steps.map((x, i) => `<button class="ws-step ${x.done ? 'done' : ''}" onclick="wsStep('${x.id}')">
          <span class="ws-n">${x.done ? '<i data-lucide="check"></i>' : i + 1}</span><span class="ws-t"><b>${x.t}</b><small>${x.d}</small></span><i data-lucide="chevron-left" class="ws-chev"></i></button>`).join('')}</div>
      </section>

      <section class="ws-card">
        <div class="ws-h"><div><h2>المحتوى</h2><p>أضف برامجكم وأخباركم — تظهر في الموقع مباشرة</p></div></div>
        <div class="ws-tiles">${[['programs', 'البرامج', 'graduation-cap', '#3EDB86,#0C9650'], ['news', 'الأخبار', 'newspaper', '#5AC8FA,#0A84FF'], ['testimonials', 'القصص والشهادات', 'quote', '#FF9F0A,#C2410C'],
          ['partners', 'الشركاء', 'handshake', '#BF5AF2,#6D28D9'], ['faqs', 'الأسئلة الشائعة', 'circle-help', '#64D2FF,#0F766E'], ['documents', 'وثائق الحوكمة', 'file-check', '#8E9BB0,#3A4558'], ['opportunities', 'الفرص والوظائف', 'briefcase', '#FF6482,#BE123C']]
          .map(([t, n, ic, c]) => `<button class="ws-tile" onclick="wsContent('${t}')">${appIcon({ id: 'w-' + t, icon: ic, c })}<b>${n}</b><small>${cnt(t) ? cnt(t) + ' منشور' : 'لا شيء بعد'}</small></button>`).join('')}</div>
      </section>

      <section class="ws-card">
        <div class="ws-h"><div><h2>أقسام الموقع</h2><p>أظهر ما تريد ورتّبه — القسم الفارغ لا يظهر حتى تضيف محتواه</p></div></div>
        <div class="ws-secs">${wsSections().map((x, i, a) => { const [n, ic] = WS_SECTIONS[x.id], empty = !wsHas(x.id); return `<div class="ws-sec${x.on === false ? ' off' : ''}">
          <i data-lucide="${ic}" class="ws-sec-i"></i><span class="ws-t"><b>${n}</b>${empty && x.on !== false ? '<small>فارغ — لن يظهر بعد</small>' : ''}</span>
          <span class="ws-ord"><button aria-label="أعلى" ${i ? '' : 'disabled'} onclick="wsMove('${x.id}',-1)"><i data-lucide="chevron-up"></i></button><button aria-label="أسفل" ${i < a.length - 1 ? '' : 'disabled'} onclick="wsMove('${x.id}',1)"><i data-lucide="chevron-down"></i></button></span>
          <label class="ws-sw"><input type="checkbox" ${x.on !== false ? 'checked' : ''} onchange="wsToggle('${x.id}',this.checked)" aria-label="إظهار ${n}"><span></span></label></div>`; }).join('')}</div>
      </section>`;
  // المعاينة الجانبيّة لا يُعاد بناؤها مع كلّ حفظ (إعادة الإطار = وميض وانتظار) — نحدّث العمود ونرسل البيانات
  const cur = document.querySelector('#main .ws-col');
  if (cur && document.getElementById('wsFrame')) { cur.innerHTML = col; refreshIcons(); wsSend(); return; }
  document.getElementById('main').innerHTML = `<div class="r-page ws"><div class="ws-grid"><div class="ws-col">${col}</div>
    <aside class="ws-side"><div class="ws-phone"><div class="ws-notch"></div><iframe id="wsFrame" src="./site/?preview=1&${WS_SITE_V}" title="معاينة الموقع"></iframe></div>
      <p class="ws-side-h">معاينة حيّة — كلّ حفظ يظهر هنا فوراً</p></aside></div></div>`;
  WS.ready = false; refreshIcons();
}
function wsHas(id) {
  const p = typeof ofProfile === 'function' ? ofProfile() : {}, s = WS.settings, n = t => (WS.rows[t] || []).filter(r => r.published !== false).length;
  return ({ impact: (s.stats || []).some(x => x && x.value), about: !!(p.vision || p.mission), programs: n('programs'), stories: n('testimonials'), news: n('news'), join: 1,
    donate: !!((s.support || {}).iban || p.iban || (s.support || {}).donate_url), governance: !!(p.license || n('documents')), partners: n('partners'), faq: n('faqs'), contact: 1 })[id] ? true : false;
}

/* ═════════ المحتوى (البرامج، الأخبار…) — نفس محرّر 23-org-site بشاشة أبسط ═════════ */
function wsContent(t) { WS.view = 'content'; WS.tab = t; SITE.tab = t; SITE.rows[t] = WS.rows[t]; paintSite(); window.scrollTo({ top: 0 }); }
function wsPaintContent() {
  const t = WS.tab, d = SITE_TABLES[t], rows = WS.rows[t] = SITE.rows[t] || WS.rows[t] || [];
  document.getElementById('main').innerHTML = `<div class="r-page ws"><button class="ws-back" onclick="WS.view='home';paintSite()"><i data-lucide="chevron-right"></i> موقع الجمعيّة</button>
    <div class="page-head"><div><h1>${d.name}</h1><p class="r-sub" style="margin:4px 0 0">${rows.length ? 'اضغط أيّ عنصر لتعديله.' : 'ابدأ بإضافة أوّل عنصر — يظهر في موقعك فور الحفظ.'}</p></div>
      <button class="btn btn-gold" onclick="siteEdit('${t}')"><i data-lucide="plus"></i> إضافة</button></div>
    <div class="r-list">${rows.map(r => `<button class="r-item" onclick="siteEdit('${t}','${r.id}')"><span class="r-thumb">${d.img && r[d.img] ? `<img src="${esc(r[d.img])}" alt="" loading="lazy">` : `<i data-lucide="${d.icon}"></i>`}</span>
      <span class="r-item-t"><b>${esc(r[d.title] || '—')}</b><small>${esc(d.sub(r) || '')}</small></span>${r.published === false ? '<span class="r-chip" style="--c:#94a3b8">مخفي</span>' : ''}${r.featured ? '<span class="r-chip" style="--c:#FF9F0A">مُبرز</span>' : ''}<i data-lucide="chevron-left" class="r-chev"></i></button>`).join('')
      || rEmpty(d.icon, 'لا شيء هنا بعد.', `<button class="btn btn-gold" onclick="siteEdit('${t}')"><i data-lucide="plus"></i> أضف الأوّل</button>`)}</div></div>`;
  refreshIcons();
}
/* بعد حفظ عنصر في محرّر 23: يعيد التحميل إلى شاشتنا */
async function siteLoad(tab) {
  if (tab === 'settings') return;
  const d = SITE_TABLES[tab]; SITE.rows[tab] = WS.rows[tab] = await RDB.list(tab, { order: d.order, asc: !!d.asc }).catch(e => { rToast(e.message, 1); return []; });
}
async function siteGo(tab) { if (CUR !== 'site') { go('site'); return; } wsContent(tab); }

/* ═════════ الخطوات (نوافذ قصيرة — كلّ واحدة شاشة جوّال) ═════════ */
function wsStep(id) {
  const p = ofProfile(), s = WS.settings, admin = isAdmin();
  const lock = admin ? '' : '<p class="ws-note"><i data-lucide="lock"></i> هذه البيانات من «ملفّ الجمعيّة» ويعدّلها المدير التنفيذيّ.</p>';
  const dis = admin ? '' : ' disabled';
  const inp = (id, l, v, o) => `<div class="field"><label>${l}</label><input id="${id}" value="${esc(v || '')}"${o && o.ltr ? ' dir="ltr"' : ''}${o && o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o && o.dis ? dis : ''}>${o && o.hint ? `<div class="r-hint">${o.hint}</div>` : ''}</div>`;
  const img = (id, l, v, o) => `<div class="field"><label>${l}${o && o.noGuide ? '' : phBtn(phKind(id))}</label><div class="ws-img"><span class="ws-img-pv" id="${id}_pv">${v ? `<img src="${esc(v)}" alt="">` : '<i data-lucide="image-plus"></i>'}</span>
    <label class="btn btn-ghost btn-sm${o && o.dis && !admin ? ' dis' : ''}"><i data-lucide="upload"></i> ${v ? 'تغيير' : 'اختر صورة'}<input type="file" accept="image/*" hidden onchange="wsUpload(this,'${id}')"${o && o.dis ? dis : ''}></label>
    ${v ? `<button type="button" class="link-btn" onclick="wsClearImg('${id}')"${o && o.dis ? dis : ''}>إزالة</button>` : ''}<input type="hidden" id="${id}" value="${esc(v || '')}"></div>${o && o.hint ? `<div class="r-hint">${o.hint}</div>` : ''}</div>`;
  const F = {
    look: ['القالب والهويّة', `${(() => { const k = WS_TPL[wsSite().template] ? wsSite().template : 'noor', t = WS_TPL[k]; wsFontCss(); return `<div class="ws-cur">
        <img src="./site/t/thumbs/${k}.webp?${WS_THUMB_V}" alt="" class="ws-cur-img"><div class="ws-cur-t"><small>القالب الحاليّ</small><b>${t.name}</b><span>${t.d}</span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="wsGallery()"><i data-lucide="layout-template"></i> تغيير القالب</button></div></div>
      <div class="field"><label>الخطّ</label><div class="ws-fonts" role="radiogroup">${[['', 'خطّ القالب', WS_FONTS[t.font][1]]].concat(Object.entries(WS_FONTS).map(([f, v]) => [f, v[0], v[1]])).map(([f, n, fam]) => `<label class="ws-font"><input type="radio" name="ws_font" value="${f}"${(wsSite().font || '') === f ? ' checked' : ''}>
        <span style="font-family:'${fam}',TS,sans-serif">${WS_FONT_SAMPLE}</span><small>${n}${f === '' ? ' · ' + WS_FONTS[t.font][0] : ''}</small></label>`).join('')}</div></div>`; })()}
      <div class="field"><label>لون الجمعيّة</label><div class="ws-colors">${WS_COLORS.map(c => `<button type="button" class="ws-c${(p.brandColor || '').toLowerCase() === c.toLowerCase() ? ' on' : ''}" style="--c:${c}" onclick="wsPickColor('${c}')"${dis} aria-label="${c}"></button>`).join('')}
        <label class="ws-c custom" title="لون آخر"><input type="color" id="ws_color" value="${esc(/^#[0-9a-f]{6}$/i.test(p.brandColor || '') ? p.brandColor : '#0B7F86')}" oninput="wsPickColor(this.value,1)"${dis}><i data-lucide="pipette"></i></label></div></div>
      ${img('ws_logo', 'الشعار', p.logo, { dis: 1, hint: 'PNG بخلفيّة شفّافة إن أمكن — يظهر في الموقع والوثائق' })}${lock}`, async () => {
        const font = (document.querySelector('[name=ws_font]:checked') || {}).value || '';
        await wsSaveSetting('site', Object.assign(wsSite(), { font }));
        if (admin) await wsSaveProfile({ brandColor: fval('ws_color'), logo: fval('ws_logo') });
      }],
    board: ['صور مجلس الإدارة', (() => { const b = typeof ofBoard === 'function' ? ofBoard(p) : [], ph = s.board_photos || {};
      if (!b.length) return `<div class="ws-empty-step"><p>لم تُضف أعضاء المجلس بعد. أضفهم مرّة واحدة في «ملفّ الجمعيّة» وستظهر أسماؤهم هنا لتضيف صورهم.</p><button type="button" class="btn btn-gold" onclick="closeModal();go('orgfile')"><i data-lucide="building-2"></i> افتح ملفّ الجمعيّة</button></div>`;
      return `<div class="ws-note"><i data-lucide="camera"></i> <span>صورة رسميّة لكلّ عضو تزيد ثقة المتبرّعين. لا تحتاج مصوّراً: ${phBtn('board')}</span></div>`
        + b.map((m, i) => img('ws_board_' + i, `${esc(m.n)} <small class="ws-role">${esc(m.r || 'عضو')}</small>`, ph[m.n] || '', { noGuide: 1 })).join('')
        + '<p class="r-hint">من لا يرغب بنشر صورته اتركها فارغة — يظهر الحرف الأوّل من اسمه.</p>'; })(), async () => {
        const b = typeof ofBoard === 'function' ? ofBoard(p) : []; if (!b.length) return;
        const ph = {}; b.forEach((m, i) => { const v = fval('ws_board_' + i); if (v) ph[m.n] = v; });
        await wsSaveSetting('board_photos', ph);
      }],
    hero: ['الواجهة', `<p class="ws-note"><i data-lucide="sparkles"></i> عنوان قصير يلخّص أثركم. ضع الكلمة المميّزة بين ** ** لتظهر بلون الجمعيّة.</p>
      ${inp('ws_eyebrow', 'سطر صغير فوق العنوان', (s.hero || {}).eyebrow, { ph: p.field || 'جمعيّة أهليّة مرخّصة' })}
      ${inp('ws_title', 'العنوان الرئيسيّ', ((s.hero || {}).title_html || '').replace(/<em>(.*?)<\/em>/g, '**$1**').replace(/<[^>]+>/g, ''), { ph: 'نزرع اليوم **أثراً** يبقى' })}
      <div class="field"><label>جملة تعريفيّة</label><textarea id="ws_lead" rows="3" placeholder="${esc(p.mission || 'من نحن وماذا نقدّم في سطرين')}">${esc((s.hero || {}).lead || '')}</textarea></div>
      ${img('ws_hero_img', 'صورة الواجهة (اختياريّة)', (s.hero || {}).image, { hint: 'صورة حقيقيّة من برامجكم أفضل من أيّ صورة جاهزة' })}`, async () => {
        const t = fval('ws_title'); if (!t) { rToast('اكتب العنوان', 1); return false; }
        await wsSaveSetting('hero', { eyebrow: fval('ws_eyebrow'), title_html: esc(t).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>'), lead: fval('ws_lead'), image: fval('ws_hero_img') });
      }],
    about: ['من نحن', `${lock}<div class="field"><label>الرؤية</label><textarea id="ws_vision" rows="2"${dis}>${esc(p.vision || '')}</textarea></div>
      <div class="field"><label>الرسالة</label><textarea id="ws_mission" rows="3"${dis}>${esc(p.mission || '')}</textarea></div>
      <div class="field"><label>القيم — قيمة في كلّ سطر</label><textarea id="ws_values" rows="4"${dis}>${esc((Array.isArray(p.values) ? p.values : String(p.values || '').split('\n')).join('\n'))}</textarea></div>
      <div class="field"><label>نبذة إضافيّة للموقع (اختياريّة)</label><textarea id="ws_about" rows="4" placeholder="قصّة التأسيس، ما يميّزكم…">${esc((s.about || {}).text || '')}</textarea></div>
      <p class="r-hint">الرؤية والرسالة والقيم نفسها في «ملفّ الجمعيّة» والوثائق — تعديلها هنا يعدّلها هناك.</p>`, async () => {
        await wsSaveSetting('about', { text: fval('ws_about') });
        if (admin) await wsSaveProfile({ vision: fval('ws_vision'), mission: fval('ws_mission'), values: fval('ws_values').split('\n').map(x => x.trim()).filter(Boolean) });
      }],
    impact: ['أرقام الأثر', `<p class="ws-note"><i data-lucide="bar-chart-3"></i> أرقام حقيقيّة موثّقة — يراها المانحون أوّلاً. اترك الفارغ فارغاً.</p>
      <div class="ws-stats">${[0, 1, 2, 3].map(i => { const x = (s.stats || [])[i] || {}; return `<div class="ws-stat"><input id="ws_sv${i}" value="${esc(x.value || '')}" placeholder="${['+2,400', '18', '340', '12'][i]}" inputmode="text"><input id="ws_sl${i}" value="${esc(x.label || '')}" placeholder="${['مستفيد ومستفيدة', 'برنامجاً منفّذاً', 'متطوّعاً', 'شريك نجاح'][i]}"></div>`; }).join('')}</div>
      ${inp('ws_asof', 'الأرقام حتى', s.stats_asof, { ph: 'نهاية ٢٠٢٥' })}`, async () => {
        const stats = [0, 1, 2, 3].map(i => ({ value: fval('ws_sv' + i), label: fval('ws_sl' + i) })).filter(x => x.value && x.label);
        await wsSaveSetting('stats', stats); await wsSaveSetting('stats_asof', fval('ws_asof'));
      }],
    donate: ['التبرّع', (() => { const sp = s.support || {}; return `<p class="ws-note"><i data-lucide="shield-check"></i> يظهر للزائر مع زرّ «نسخ الآيبان». حساب الزكاة المستقلّ يُسحب من «ملفّ الجمعيّة» إن وُجد.</p>
      ${inp('ws_iban', 'الآيبان الرسميّ للتبرّعات', sp.iban || p.iban, { ltr: 1, ph: 'SA00 0000 0000 0000 0000 0000' })}
      <div class="row2">${inp('ws_bank', 'البنك', sp.bank || p.bankName)}${inp('ws_accn', 'اسم الحساب', sp.account_name || p.accName || p._name)}</div>
      ${inp('ws_donate', 'رابط التبرّع الإلكترونيّ (اختياريّ)', sp.donate_url, { ltr: 1, ph: 'https://ehsan.sa/…', hint: 'منصّة إحسان أو متجر التبرّعات — يظهر زرّاً «تبرّع إلكترونيّاً»' })}`; })(), async () => {
        const iban = fval('ws_iban').replace(/\s/g, '').toUpperCase();
        if (iban && !/^SA\d{22}$/.test(iban)) { rToast('الآيبان السعوديّ: SA ثمّ ٢٢ رقماً', 1); return false; }
        if (!wsHttps(fval('ws_donate'))) { rToast('رابط التبرّع يبدأ بـ https://', 1); return false; }
        await wsSaveSetting('support', { iban, bank: fval('ws_bank'), account_name: fval('ws_accn'), donate_url: fval('ws_donate') });
      }],
    contact: ['التواصل', (() => { const c = s.contact || {}, so = s.social || {}; return `<div class="row2">${inp('ws_phone', 'الهاتف', c.phone || p.phone, { ltr: 1 })}${inp('ws_wa', 'واتساب', c.whatsapp, { ltr: 1, ph: '05xxxxxxxx' })}</div>
      ${inp('ws_email', 'البريد', c.email || p.email, { ltr: 1 })}${inp('ws_addr', 'العنوان', c.address || [p.city, p.address].filter(Boolean).join(' — '))}
      ${inp('ws_hours', 'أوقات العمل', c.hours, { ph: 'الأحد – الخميس، ٨ص – ٤م' })}
      ${inp('ws_map', 'رابط تضمين خرائط Google (اختياريّ)', c.map_embed, { ltr: 1, hint: 'من خرائط Google: مشاركة ← تضمين خريطة ← انسخ الرابط داخل src فقط' })}
      <h4 class="ws-sub-h">حسابات التواصل</h4><div class="row2">${inp('ws_x', 'إكس', so.x, { ltr: 1, ph: 'https://x.com/…' })}${inp('ws_ig', 'إنستغرام', so.instagram, { ltr: 1, ph: 'https://instagram.com/…' })}</div>
      <div class="row2">${inp('ws_yt', 'يوتيوب', so.youtube, { ltr: 1 })}${inp('ws_li', 'لينكدإن', so.linkedin, { ltr: 1 })}</div>${inp('ws_sc', 'سناب شات', so.snapchat, { ltr: 1 })}`; })(), async () => {
        const urls = ['ws_x', 'ws_ig', 'ws_yt', 'ws_li', 'ws_sc'].map(fval); if (urls.some(u => !wsHttps(u))) { rToast('روابط الحسابات تبدأ بـ https://', 1); return false; }
        const map = fval('ws_map'); if (map && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(map)) { rToast('رابط الخريطة يجب أن يكون رابط «تضمين» من خرائط Google', 1); return false; }
        await wsSaveSetting('contact', { phone: fval('ws_phone'), whatsapp: fval('ws_wa'), email: fval('ws_email'), address: fval('ws_addr'), hours: fval('ws_hours'), map_embed: map });
        await wsSaveSetting('social', { x: urls[0], instagram: urls[1], youtube: urls[2], linkedin: urls[3], snapchat: urls[4] });
      }],
    address: ['رابط الموقع', `${admin ? '' : '<p class="ws-note"><i data-lucide="lock"></i> الرابط يختاره المدير التنفيذيّ.</p>'}
      <div class="field"><label>اختر رابطاً قصيراً بالإنجليزيّة</label><div class="ws-slug"><span dir="ltr">${esc(wsPretty(wsBase()))}?s=</span><input id="ws_slug" dir="ltr" value="${esc(WS.addr.slug || wsSuggest(p))}" maxlength="40" autocapitalize="none" autocomplete="off" spellcheck="false" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'')"${dis}></div>
        <div class="r-hint">حروف إنجليزيّة صغيرة وأرقام وشرطة — مثال: ghiras</div></div>
      <div class="ws-domain"><h4 class="ws-sub-h"><i data-lucide="globe"></i> عندكم نطاق خاصّ؟ (اختياريّ)</h4>
        <button type="button" class="ws-buy" onclick="dmGuide(fval('ws_slug'))"><i data-lucide="shopping-bag"></i><span><b>ما عندنا نطاق — كيف نشتريه؟</b><small>أيّ نهاية نختار، ومن أين نشتري، خطوة بخطوة</small></span><i data-lucide="chevron-left"></i></button>
        ${inp('ws_domain', 'النطاق', WS.addr.domain, { ltr: 1, ph: 'example.org.sa', dis: 1 })}
        ${wsDomainGuide()}</div>`, async () => {
        if (!admin) return;
        const slug = fval('ws_slug'), dom = fval('ws_domain').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\.|\/.*$/g, '');
        if (!WS_SLUG.test(slug)) { rToast('الرابط: من ٣ إلى ٤٠ حرفاً إنجليزيّاً صغيراً أو رقماً أو شرطة', 1); return false; }
        if (RUSO_LIVE && !RUSO_DEMO) { const { data, error } = await sb.rpc('set_site_address', { p_slug: slug, p_domain: dom || null }); if (error) throw error; WS.addr = data; }
        else { WS.addr = { slug, domain: dom }; localStorage.setItem(DEMO_KEY + '_siteaddr', JSON.stringify(WS.addr)); }
      }],
  };
  const f = F[id]; if (!f) return;
  openModal(f[0], `<div class="ws-form">${f[1]}</div>`, async () => {
    const b = document.getElementById('mSave'); if (b) { b.disabled = true; b.textContent = 'جارٍ الحفظ…'; }
    try { const r = await f[2](); if (r === false) { if (b) { b.disabled = false; b.textContent = 'حفظ'; } return; } closeModal(); rToast('حُفظ — ظهر في المعاينة'); paintSite(); }
    catch (e) { rToast('تعذّر الحفظ: ' + (e.message || e), 1); if (b) { b.disabled = false; b.textContent = 'حفظ'; } }
  });
  const m = document.querySelector('.modal'); if (m) m.classList.add('ws-modal');
}
const wsHttps = u => !u || /^https:\/\//i.test(u);
function wsSuggest(p) { const s = String(p.nameEn || '').toLowerCase().replace(/^(the\s+)?/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); return WS_SLUG.test(s) ? s : ''; }
function wsPickColor(c, fromInput) {
  document.querySelectorAll('.ws-c').forEach(b => b.classList.toggle('on', !b.classList.contains('custom') && b.style.getPropertyValue('--c').toLowerCase() === c.toLowerCase()));
  const i = document.getElementById('ws_color'); if (i && !fromInput) i.value = c;
  document.querySelectorAll('.ws-mock').forEach(m => m.style.setProperty('--mc', c));
}
async function wsUpload(inp, id) {
  const f = inp.files[0]; if (!f) return; rToast('جارٍ رفع الصورة…');
  try { const url = await RDB.uploadImage(f); document.getElementById(id).value = url; document.getElementById(id + '_pv').innerHTML = `<img src="${esc(url)}" alt="">`; rToast('رُفعت — اضغط «حفظ»'); }
  catch (e) { rToast('تعذّر الرفع: ' + e.message, 1); }
}
function wsClearImg(id) { document.getElementById(id).value = ''; document.getElementById(id + '_pv').innerHTML = '<i data-lucide="image-plus"></i>'; refreshIcons(); }
async function wsSaveSetting(key, value) { await RDB.upsertSetting(key, value); WS.settings[key] = value; }
async function wsSaveProfile(patch) {
  const o = SAAS_ORG || { name: CONFIG.companyName, profile: {} }, prof = Object.assign({}, o.profile || {}, patch);
  Object.keys(prof).forEach(k => { if (prof[k] === '' && !(k in (o.profile || {}))) delete prof[k]; });
  await ofPersist(o.name || CONFIG.companyName, prof);
}
/* ربط النطاق: سجلّ واحد (CNAME لـ www) ← «تحقّق» يفحص الـDNS من المتصفّح ثمّ يسجّل النطاق لدى كلاودفلير فتصدر الشهادة */
function wsDomainGuide() {
  const T = CONFIG.siteDomainTarget, d = WS.addr.domain || '';
  if (!T) return '<p class="r-hint">احفظ نطاقكم الآن، وسيُفعَّل ربطه تلقائياً حين تُفتح خدمة النطاقات — رابط الموقع أعلاه يعمل دائماً.</p>';
  const rec = (k, v) => `<div class="ws-rec"><small>${k}</small><code dir="ltr">${esc(v)}</code><button type="button" class="ws-copy" onclick="wsCopy('${esc(v)}')" aria-label="نسخ ${k}"><i data-lucide="copy"></i></button></div>`;
  return `<div class="ws-dom-g">
    <p class="ws-dom-s"><b>١</b> عند شركة النطاق أضف سجلّاً واحداً:</p>
    <div class="ws-recs">${rec('النوع', 'CNAME')}${rec('الاسم', 'www')}${rec('يشير إلى', T)}</div>
    <details class="ws-how"><summary>أين أضيفه؟</summary><ul>
      <li><b>حلول stc / نورنت / صحارى نت:</b> لوحة النطاق ← إدارة DNS ← إضافة سجلّ</li>
      <li><b>Namecheap:</b> Domain List ← Manage ← Advanced DNS ← Add New Record</li>
      <li><b>Hostinger:</b> Domains ← DNS / Nameservers ← Add Record</li>
      <li><b>نطاقات ‎.sa:</b> من لوحة الشركة التي سجّلتم النطاق عندها</li></ul>
      <p>إن وُجد سجلّ قديم باسم www فاحذفه أوّلاً. وليفتح النطاق بلا www أيضاً، فعّل «Forwarding» عند الشركة إلى <span dir="ltr">https://www.${esc(d || 'example.org.sa')}</span></p></details>
    <p class="ws-dom-s"><b>٢</b> احفظ ثمّ اضغط «تحقّق» — نتولّى الباقي، ومنه شهادة الأمان (القفل).</p>
    <button type="button" class="btn btn-ghost btn-sm" onclick="wsCheckDns()"><i data-lucide="radar"></i> تحقّق من الربط</button>
    <ol class="ws-dom-st" id="ws_dns" hidden></ol></div>`;
}
function wsCopy(v) { (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => rToast('نُسخ')).catch(() => apPrompt('انسخ:', v)); }
function wsDomState(rows, link) {
  const o = document.getElementById('ws_dns'); if (!o) return;
  o.hidden = false;
  o.innerHTML = rows.map(([t, st, sub]) => `<li class="${st}"><i data-lucide="${{ ok: 'check-circle-2', wait: 'loader', bad: 'alert-circle' }[st]}"></i><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span></li>`).join('')
    + (link ? `<li class="ok"><a class="btn btn-gold btn-sm" href="${esc(link)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> افتح موقعكم على نطاقكم</a></li>` : '');
  refreshIcons();
}
async function wsCheckDns() {
  const d = (fval('ws_domain') || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\.|\/.*$/g, '');
  if (!d) { rToast('اكتب النطاق أولاً', 1); return; }
  if (d !== (WS.addr.domain || '')) { rToast('احفظ النطاق أولاً ثمّ تحقّق', 1); return; }
  const T = CONFIG.siteDomainTarget, host = 'www.' + d;
  wsDomState([['السجلّ عند شركة النطاق', 'wait', 'جارٍ الفحص…']]);
  let rec = false;
  try {
    const r = await fetch('https://cloudflare-dns.com/dns-query?type=CNAME&name=' + encodeURIComponent(host), { headers: { accept: 'application/dns-json' } }).then(x => x.json());
    rec = (r.Answer || []).some(a => String(a.data).replace(/\.$/, '').toLowerCase() === T.toLowerCase());
  } catch (e) {}
  if (!rec) { wsDomState([['السجلّ عند شركة النطاق', 'bad', 'لم يظهر بعد — تأكّد أنّ الاسم www ويشير إلى ' + T + '. قد يستغرق ظهوره حتى ساعة.']]); return; }
  const recRow = ['السجلّ عند شركة النطاق', 'ok', 'صحيح'];
  if (RUSO_DEMO || !RUSO_LIVE) { wsDomState([recRow, ['شهادة الأمان', 'wait', 'تجربة: في النسخة الحقيقيّة تصدر خلال دقائق'], ['الموقع على نطاقكم', 'wait', '']]); return; }
  wsDomState([recRow, ['شهادة الأمان', 'wait', 'جارٍ الطلب…']]);
  try {
    const { data, error } = await sb.functions.invoke('site-domain', { body: { action: 'connect' } });
    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
    if (!data || data.configured === false) { wsDomState([recRow, ['شهادة الأمان', 'wait', 'خدمة النطاقات تُفعَّل قريباً — سجلّكم جاهز ولن تحتاجوا فعل شيء آخر']]); return; }
    const live = data.stage === 'live', ssl = data.stage === 'ssl' || live;
    wsDomState([recRow, ['شهادة الأمان', ssl ? 'ok' : 'wait', ssl ? 'صادرة' : 'تصدر خلال دقائق — اضغط «تحقّق» بعد قليل'],
      ['الموقع على نطاقكم', live ? 'ok' : 'wait', live ? host : (data.errors || [])[0] || '']], live ? 'https://' + host : '');
  } catch (e) { wsDomState([recRow, ['شهادة الأمان', 'bad', 'تعذّر الطلب: ' + (e.message || e)]]); }
}

/* ═════════ الأقسام ═════════ */
async function wsToggle(id, on) { const l = wsSections(); l.find(x => x.id === id).on = on; await wsSaveSections(l, on ? id : ''); }
async function wsMove(id, dir) {
  const l = wsSections(), i = l.findIndex(x => x.id === id), j = i + dir; if (j < 0 || j >= l.length) return;
  [l[i], l[j]] = [l[j], l[i]]; await wsSaveSections(l, id);
}
async function wsSaveSections(l, focus) {
  try { await wsSaveSetting('site', Object.assign(wsSite(), { sections: l })); paintSite(); wsSend(focus); }
  catch (e) { rToast(e.message, 1); }
}

/* ═════════ النشر والمشاركة والمعاينة ═════════ */
async function wsPublish(on) {
  if (on && !WS.addr.slug) { rToast('اختر رابط الموقع أوّلاً'); wsStep('address'); return; }
  if (on) { const p = ofProfile(); if (!(WS.settings.hero || {}).title_html && !p.mission) { rToast('أكمل «الواجهة» أوّلاً حتى لا يظهر الموقع فارغاً', 1); wsStep('hero'); return; } }
  if (!on && !await apConfirm('إيقاف النشر؟ سيظهر للزوّار «الموقع قيد التجهيز» حتى تنشره من جديد.')) return;
  try {
    await wsSaveSetting('site', Object.assign(wsSite(), { published: !!on }));
    paintSite();
    if (on) { rToast('🎉 موقعك منشور الآن'); setTimeout(wsShare, 400); } else rToast('أُوقف النشر');
  } catch (e) { rToast('تعذّر: ' + e.message, 1); }
}
async function wsShare() {
  const url = wsUrl(); if (!url) return;
  if (navigator.share) { try { await navigator.share({ title: CONFIG.companyName, text: 'موقع ' + CONFIG.companyName, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(url); rToast('نُسخ الرابط — ألصقه في واتساب أو حساباتكم'); } catch (e) { await apPrompt('انسخ الرابط:', url); }
}
/* معاينة بملء الشاشة (الجوال أساساً) مع تبديل مقاس الجوّال/الكمبيوتر */
function wsPreview() {
  const root = document.createElement('div'); root.className = 'ws-full'; root.id = 'wsFull';
  root.innerHTML = `<div class="ws-full-bar"><button class="ws-btn ghost sm" onclick="document.getElementById('wsFull').remove()"><i data-lucide="x"></i> إغلاق</button>
    <span class="ws-seg"><button class="on" onclick="wsDev(this,'m')"><i data-lucide="smartphone"></i></button><button onclick="wsDev(this,'d')"><i data-lucide="monitor"></i></button></span>
    ${wsUrl() && wsSite().published ? `<a class="ws-btn sm" href="${esc(wsUrl())}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> فتح</a>` : '<span></span>'}</div>
    <div class="ws-full-stage m"><iframe id="wsFrameFull" src="./site/?preview=1&${WS_SITE_V}" title="معاينة الموقع"></iframe></div>`;
  document.body.appendChild(root); refreshIcons();
  const fr = root.querySelector('iframe');
  const onReady = ev => { if (ev.origin === location.origin && ev.data && ev.data.type === 'ws:ready' && ev.source === fr.contentWindow) { fr.contentWindow.postMessage({ type: 'ws:data', data: wsPayload() }, location.origin); } };
  window.addEventListener('message', onReady);
  const obs = new MutationObserver(() => { if (!document.body.contains(root)) { window.removeEventListener('message', onReady); obs.disconnect(); } }); obs.observe(document.body, { childList: true });
}
/* معرض القوالب (مثل متجر سلّة/آبل): شبكة صور حقيقيّة ← لمسة تعرض القالب ببيانات جمعيّتك ← «استخدام» */
function wsGallery() {
  wsFontCss();
  const cur = WS_TPL[wsSite().template] ? wsSite().template : 'noor';
  const root = document.createElement('div'); root.className = 'ws-full ws-gal'; root.id = 'wsGal';
  root.innerHTML = `<div class="ws-full-bar"><button class="ws-btn ghost sm" onclick="wsGalClose()"><i data-lucide="x"></i> إغلاق</button><b class="ws-gal-h">القوالب</b><span></span></div>
    <div class="ws-gal-grid">${Object.entries(WS_TPL).map(([k, t]) => `<button type="button" class="ws-gal-c${k === cur ? ' cur' : ''}" onclick="wsGalOpen('${k}')">
      <span class="ws-gal-img"><img src="./site/t/thumbs/${k}-m.webp?${WS_THUMB_V}" alt="" loading="lazy"></span>
      <b>${t.name}${k === cur ? ' <em>الحاليّ</em>' : ''}</b><small>${t.d}</small></button>`).join('')}</div>`;
  document.body.appendChild(root); refreshIcons();
  root.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); wsGalClose(); } });
}
function wsGalClose() { const g = document.getElementById('wsGal'); if (g) g.remove(); window.removeEventListener('message', wsGalReady); }
let WS_GAL = null;
function wsGalOpen(k) {
  const g = document.getElementById('wsGal'); if (!g) return;
  const t = WS_TPL[k], font = (wsSite().template === k && wsSite().font) || '';
  WS_GAL = { k, font };
  const opts = [['', 'خطّ القالب — ' + WS_FONTS[t.font][0]]].concat(Object.entries(WS_FONTS).map(([f, v]) => [f, v[0]]));
  g.innerHTML = `<div class="ws-full-bar"><button class="ws-btn ghost sm" onclick="wsGalClose();wsGallery()"><i data-lucide="chevron-right"></i> القوالب</button>
      <span class="ws-seg"><button class="on" onclick="wsDev(this,'m')" aria-label="جوال"><i data-lucide="smartphone"></i></button><button onclick="wsDev(this,'d')" aria-label="كمبيوتر"><i data-lucide="monitor"></i></button></span><span></span></div>
    <div class="ws-full-stage m"><iframe id="wsGalFrame" src="./site/?preview=1&${WS_SITE_V}" title="معاينة قالب ${esc(t.name)}"></iframe></div>
    <div class="ws-gal-foot"><div class="ws-gal-n"><b>${t.name}</b><small>${t.d}</small></div>
      <label class="ws-gal-font"><span>الخطّ</span><select onchange="WS_GAL.font=this.value;wsGalSend()">${opts.map(([f, n]) => `<option value="${f}"${f === font ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <button type="button" class="btn btn-gold" onclick="wsGalUse()"><i data-lucide="check"></i> استخدام هذا القالب</button></div>`;
  refreshIcons();
  window.removeEventListener('message', wsGalReady); window.addEventListener('message', wsGalReady);
}
function wsGalPayload() { const d = wsPayload(); d.settings.site = Object.assign({}, d.settings.site, { template: WS_GAL.k, font: WS_GAL.font }); return d; }
function wsGalSend() { const f = document.getElementById('wsGalFrame'); if (f && f.contentWindow && WS_GAL) f.contentWindow.postMessage({ type: 'ws:data', data: wsGalPayload() }, location.origin); }
function wsGalReady(ev) { const f = document.getElementById('wsGalFrame'); if (f && ev.origin === location.origin && ev.data && ev.data.type === 'ws:ready' && ev.source === f.contentWindow) wsGalSend(); }
async function wsGalUse() {
  if (!WS_GAL) return;
  try {
    await wsSaveSetting('site', Object.assign(wsSite(), { template: WS_GAL.k, font: WS_GAL.font }));
    wsGalClose(); closeModal(); paintSite(); wsSend(); rToast('صار موقعك بقالب «' + WS_TPL[WS_GAL.k].name + '»');
  } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}
function wsDev(b, d) { b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); document.querySelector('.ws-full-stage').className = 'ws-full-stage ' + d; }
