/*
 * 23-org-site.js — إدارة الموقع (CMS) والوارد من الموقع والفريق والصلاحيات
 * كل ما يُحفظ هنا يظهر فوراً في ruso.org.sa (الموقع يقرأ نفس الجداول).
 * ⚠️ تعريفات فقط.
 */
const SITE = { tab: '', rows: {}, settings: {} };
const AXES = { 'مهاري': 'مهاري', 'قيمي': 'قيمي', 'معرفي': 'معرفي', '': 'بدون' };
const DOC_CATS = { reports: 'التقارير السنوية وتقارير البرامج', financials: 'القوائم المالية', policies: 'السياسات واللوائح', board: 'مجلس الإدارة والجمعية العمومية', other: 'الهيكل والأدلة التنظيمية' };
/* تعريف كل جدول: الحقول وطريقة عرضه — محرّر عام واحد يخدم الكل */
const SITE_TABLES = {
  programs: { name: 'البرامج', icon: 'graduation-cap', app: ['site', 'programs'], order: 'sort', asc: true, title: 'title', sub: r => [r.axis, r.audience, r.registration_open ? 'التسجيل مفتوح' : r.status_label].filter(Boolean).join(' · '), img: 'cover_url',
    fields: [['title', 'اسم البرنامج', 'text'], ['slug', 'المعرّف في الرابط (إنجليزي)', 'text', 'مثال: afaq — يظهر في رابط الصفحة'], ['axis', 'المحور', 'select', AXES], ['audience', 'الفئة المستهدفة', 'text'],
      ['summary', 'وصف مختصر (يظهر في البطاقة)', 'textarea'], ['body', 'الوصف الكامل (افصل الفقرات بسطر فارغ)', 'textarea-lg'], ['cover_url', 'صورة الغلاف', 'img'],
      ['registration_open', 'التسجيل مفتوح الآن', 'bool'], ['status_label', 'نص الحالة', 'text', 'مثال: التسجيل مفتوح حتى 30 أكتوبر / قريباً / نُفّذ في 2025'], ['register_url', 'رابط تسجيل خارجي (اختياري)', 'url', 'اتركه فارغاً لاستخدام نموذج الموقع — تصل التسجيلات إلى «الوارد»'],
      ['start_date', 'تاريخ البدء', 'date'], ['duration', 'المدة', 'text'], ['location', 'المكان', 'text'], ['seats', 'المقاعد', 'text'], ['partner', 'بالشراكة مع', 'text'],
      ['outcomes', 'ماذا سيكتسب المشارك', 'list-obj', [['title', 'العنوان'], ['text', 'الوصف']]], ['faqs', 'أسئلة عن البرنامج', 'list-obj', [['q', 'السؤال'], ['a', 'الإجابة']]], ['gallery', 'معرض الصور', 'list-img'],
      ['featured', 'إبرازه في الرئيسية', 'bool'], ['published', 'منشور في الموقع', 'bool'], ['sort', 'الترتيب', 'num']] },
  news: { name: 'الأخبار', icon: 'newspaper', app: 'site', order: 'date', title: 'title', sub: r => fmtD(r.date), img: 'cover_url',
    fields: [['title', 'عنوان الخبر', 'text'], ['date', 'التاريخ', 'date'], ['excerpt', 'مقتطف', 'textarea'], ['body', 'نص الخبر (افصل الفقرات بسطر فارغ)', 'textarea-lg'], ['cover_url', 'صورة الخبر', 'img'], ['slug', 'المعرّف في الرابط (إنجليزي، اختياري)', 'text'], ['program_id', 'البرنامج المرتبط', 'program'], ['published', 'منشور', 'bool']] },
  partners: { name: 'الشركاء', icon: 'handshake', app: 'site', order: 'sort', asc: true, title: 'name', sub: r => r.url || '', img: 'logo_url',
    fields: [['name', 'اسم الجهة', 'text'], ['logo_url', 'الشعار (PNG شفاف)', 'img'], ['url', 'رابط موقعهم', 'url'], ['sort', 'الترتيب', 'num'], ['published', 'يظهر في الموقع', 'bool']] },
  testimonials: { name: 'الشهادات والقصص', icon: 'quote', app: 'site', order: 'sort', asc: true, title: 'name', sub: r => (r.kind === 'story' ? 'قصة نجاح · ' : '') + (r.program || ''), img: 'photo_url',
    fields: [['kind', 'النوع', 'select', { quote: 'شهادة', story: 'قصة نجاح' }], ['name', 'الاسم / عنوان القصة', 'text'], ['role', 'الصفة', 'text'], ['quote', 'النص', 'textarea'], ['program', 'البرنامج', 'text'], ['photo_url', 'الصورة (تظهر بجانب الاسم أو خلف القصة)', 'img'], ['sort', 'الترتيب', 'num'], ['published', 'منشور', 'bool']] },
  faqs: { name: 'الأسئلة الشائعة', icon: 'circle-help', app: 'site', order: 'sort', asc: true, title: 'question', sub: r => r.answer.slice(0, 80),
    fields: [['question', 'السؤال', 'text'], ['answer', 'الإجابة', 'textarea'], ['sort', 'الترتيب', 'num'], ['published', 'منشور', 'bool']] },
  documents: { name: 'الحوكمة والوثائق', icon: 'file-check', app: 'site', order: 'sort', asc: true, title: 'title', sub: r => DOC_CATS[r.category] + (r.year ? ' · ' + r.year : ''),
    fields: [['title', 'اسم الوثيقة', 'text'], ['category', 'التصنيف', 'select', DOC_CATS], ['year', 'السنة', 'text'], ['url', 'رابط الملف (PDF على Drive أو في الموقع)', 'url', 'في Drive: اجعل المشاركة «أي شخص لديه الرابط»'], ['sort', 'الترتيب', 'num'], ['published', 'منشور', 'bool']] },
  opportunities: { name: 'الفرص والوظائف', icon: 'briefcase', app: 'site', order: 'created_at', title: 'title', sub: r => (r.kind === 'job' ? 'وظيفة' : 'فرصة تطوعية') + (r.is_open ? ' · مفتوحة' : ' · مغلقة'),
    fields: [['kind', 'النوع', 'select', { volunteer: 'فرصة تطوعية', job: 'وظيفة' }], ['title', 'المسمى', 'text'], ['description', 'الوصف', 'textarea'], ['location', 'المكان', 'text'], ['commitment', 'الالتزام (ساعات/دوام)', 'text'], ['deadline', 'آخر موعد', 'date'], ['is_open', 'التقديم مفتوح', 'bool'], ['published', 'منشور', 'bool']] },
};
const webBase = () => RUSO_DEMO ? '../website/' : (CONFIG.websiteUrl.replace(/\/$/, '') + '/');
const absImg = u => !u ? '' : /^(https?:|data:)/.test(u) ? u : webBase() + u.replace(/^\//, '');

function siteTabs() {
  const t = Object.entries(SITE_TABLES).filter(([k, d]) => can(d.app)).map(([k, d]) => ({ id: k, name: d.name, icon: d.icon }));
  if (can('site')) { t.push({ id: 'settings', name: 'الواجهة والتواصل', icon: 'settings-2' }); }
  return t;
}
async function renderSite() {
  const tabs = siteTabs(); if (!tabs.find(t => t.id === SITE.tab)) SITE.tab = tabs[0].id;
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  await siteAutoSeed();
  await siteLoad(SITE.tab); paintSite();
}
/* أول فتح للوحة: تُعبّأ تلقائياً بمحتوى الموقع الحالي (من تقارير الجمعية) ليراه المدير جاهزاً وقابلاً للتعديل */
async function siteAutoSeed() {
  if (!can('site')) return;
  const st = await RDB.list('site_settings').catch(() => null); if (!st || st.some(r => r.key === 'seeded')) return;
  await siteImport(true);
}
async function siteLoad(tab) {
  if (tab === 'settings') { const rows = await RDB.list('site_settings').catch(() => []); SITE.settings = {}; rows.forEach(r => SITE.settings[r.key] = r.value); return; }
  const d = SITE_TABLES[tab]; SITE.rows[tab] = await RDB.list(tab, { order: d.order, asc: !!d.asc }).catch(e => { rToast(e.message, 1); return []; });
}
async function siteGo(tab) { SITE.tab = tab; if (CUR !== 'site') { go('site'); return; } await siteLoad(tab); paintSite(); }
function paintSite() {
  const tab = SITE.tab, d = SITE_TABLES[tab];
  let body;
  if (tab === 'settings') body = siteSettingsHTML();
  else {
    const rows = SITE.rows[tab] || [];
    body = `<div class="r-filters"><button class="btn btn-gold btn-sm" onclick="siteEdit('${tab}')"><i data-lucide="plus"></i> إضافة</button>
      ${!rows.length ? `<button class="btn btn-ghost btn-sm" onclick="siteImport()"><i data-lucide="download"></i> استيراد المحتوى الحالي للموقع</button>` : ''}
      <a class="btn btn-ghost btn-sm" href="${webBase()}${{ programs: 'programs.html', news: 'news.html', documents: 'governance.html', opportunities: 'get-involved.html' }[tab] || 'index.html'}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> عرض في الموقع</a></div>
      <div class="r-list">${rows.map(r => `<button class="r-item" onclick="siteEdit('${tab}','${r.id}')">${d.img ? `<span class="r-thumb">${r[d.img] ? `<img src="${esc(absImg(r[d.img]))}" alt="" loading="lazy">` : `<i data-lucide="${d.icon}"></i>`}</span>` : `<span class="r-thumb"><i data-lucide="${d.icon}"></i></span>`}
        <span class="r-item-t"><b>${esc(r[d.title] || '—')}</b><small>${esc(d.sub(r) || '')}</small></span>${r.published === false ? '<span class="r-chip" style="--c:#94a3b8">مخفي</span>' : ''}${r.featured ? '<span class="r-chip" style="--c:#CAB05F">مُبرز</span>' : ''}<i data-lucide="chevron-left" class="r-chev"></i></button>`).join('') || rEmpty(d.icon, 'لا عناصر بعد. الموقع يعرض حالياً المحتوى الافتراضي المستخرج من تقارير الجمعية — اضغط «استيراد» لتحريره من هنا.')}</div>`;
  }
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>إدارة الموقع</h1><p class="r-sub" style="margin:4px 0 0">ما تحفظه هنا يظهر مباشرة في <a href="${webBase()}" target="_blank" rel="noopener">ruso.org.sa</a></p></div></div>
    ${rTabs('site', siteTabs(), tab, 'siteGo')}<div>${body}</div></div>`;
  refreshIcons();
}
/* ── المحرّر العام ── */
function fieldHTML(f, v) {
  const [k, label, type, opt, hint] = f; const id = 'sf_' + k;
  const h = (typeof opt === 'string' ? opt : hint) ? `<div class="r-hint">${esc(typeof opt === 'string' ? opt : hint)}</div>` : '';
  if (type === 'bool') return `<label class="r-check"><input type="checkbox" id="${id}"${v ? ' checked' : ''}> ${label}</label>`;
  if (type === 'textarea' || type === 'textarea-lg') return `<div class="field"><label>${label}</label><textarea id="${id}" rows="${type === 'textarea-lg' ? 8 : 3}">${esc(v || '')}</textarea>${h}</div>`;
  if (type === 'select') return `<div class="field"><label>${label}</label><select id="${id}">${Object.entries(opt).map(([a, b]) => `<option value="${esc(a)}"${a === (v || '') ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`;
  if (type === 'program') return `<div class="field"><label>${label}</label><select id="${id}">${programOptions(v)}</select></div>`;
  if (type === 'img') return `<div class="field"><label>${label}</label><div class="r-imgfield"><span class="r-thumb lg" id="${id}_pv">${v ? `<img src="${esc(absImg(v))}" alt="">` : '<i data-lucide="image"></i>'}</span><div style="flex:1"><input id="${id}" dir="ltr" value="${esc(v || '')}" placeholder="رابط الصورة أو ارفع ملفاً" oninput="document.getElementById('${id}_pv').innerHTML=this.value?'<img src=&quot;'+absImg(this.value)+'&quot;>':''"><label class="btn btn-ghost btn-sm" style="margin-top:6px"><i data-lucide="upload"></i> رفع صورة (تُضغط تلقائياً)<input type="file" accept="image/*" hidden onchange="siteUpload(this,'${id}')"></label></div></div>${h}</div>`;
  if (type === 'list-obj') { const rows = (v && v.length ? v : [{}]); return `<div class="field"><label>${label}</label><div id="${id}" class="r-objlist">${rows.map(r => objRow(opt, r)).join('')}</div><button type="button" class="link-btn" onclick="document.getElementById('${id}').insertAdjacentHTML('beforeend',objRow(SITE_TABLES[SITE.tab].fields.find(f=>f[0]==='${k}')[3],{}))">+ إضافة</button></div>`; }
  if (type === 'list-img') return `<div class="field"><label>${label}</label><textarea id="${id}" rows="3" dir="ltr" placeholder="رابط صورة في كل سطر">${esc((v || []).join('\n'))}</textarea><label class="btn btn-ghost btn-sm" style="margin-top:6px"><i data-lucide="upload"></i> رفع صورة للمعرض<input type="file" accept="image/*" hidden onchange="siteUpload(this,'${id}',true)"></label></div>`;
  return `<div class="field"><label>${label}</label><input id="${id}" type="${type === 'num' ? 'number' : type === 'date' ? 'date' : 'text'}"${type === 'url' ? ' dir="ltr" placeholder="https://"' : ''} value="${esc(v == null ? '' : v)}">${h}</div>`;
}
function objRow(cols, r) { return `<div class="r-objrow">${cols.map(([k, l]) => `<input data-k="${k}" placeholder="${l}" value="${esc(r[k] || '')}">`).join('')}<button type="button" class="x" onclick="this.parentElement.remove()">×</button></div>`; }
function readField(f) {
  const [k, , type] = f, el = document.getElementById('sf_' + k); if (!el) return undefined;
  if (type === 'bool') return el.checked;
  if (type === 'num') return Number(el.value || 0);
  if (type === 'date' || type === 'program') return el.value || null;
  if (type === 'list-obj') return Array.from(el.querySelectorAll('.r-objrow')).map(r => { const o = {}; r.querySelectorAll('input').forEach(i => o[i.dataset.k] = i.value.trim()); return o; }).filter(o => Object.values(o).some(Boolean));
  if (type === 'list-img') return el.value.split('\n').map(s => s.trim()).filter(Boolean);
  return el.value.trim();
}
async function siteUpload(inp, target, append) {
  const f = inp.files[0]; if (!f) return; rToast('جارٍ ضغط الصورة ورفعها…');
  try { const url = await RDB.uploadImage(f); const el = document.getElementById(target); if (append) el.value = (el.value ? el.value + '\n' : '') + url; else { el.value = url; el.dispatchEvent(new Event('input')); } rToast('تم رفع الصورة'); }
  catch (e) { rToast('تعذّر الرفع: ' + e.message, 1); }
}
function siteEdit(tab, id) {
  const d = SITE_TABLES[tab], r = id ? SITE.rows[tab].find(x => x.id === id) : { published: true, is_open: true, kind: tab === 'opportunities' ? 'volunteer' : tab === 'testimonials' ? 'quote' : undefined, category: 'policies', date: today(), sort: (SITE.rows[tab] || []).length };
  openModal((id ? 'تعديل — ' : 'إضافة — ') + d.name, d.fields.map(f => fieldHTML(f, r[f[0]])).join(''), async () => {
    const row = {}; d.fields.forEach(f => { const v = readField(f); if (v !== undefined) row[f[0]] = v; });
    if (!row[d.title]) { rToast('الحقل الأول مطلوب', 1); return; }
    if (row.slug === '') row.slug = null;
    if (row.slug) row.slug = row.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    const badUrl = d.fields.filter(f => f[2] === 'url').map(f => row[f[0]]).find(u => !validUrl(u)); if (badUrl) { rToast('الروابط يجب أن تبدأ بـ https://', 1); return; }
    if (tab === 'programs') row.updated_at = new Date().toISOString();
    try { if (id) await RDB.update(tab, id, row); else await RDB.insert(tab, row); closeModal(); rToast('تم الحفظ — ظهر في الموقع'); await siteLoad(tab); if (tab === 'programs') await loadOrg(); paintSite(); }
    catch (e) { rToast('تعذّر الحفظ: ' + (/duplicate|unique/i.test(e.message) ? 'المعرّف (slug) مستخدم مسبقاً' : e.message), 1); }
  }, id ? async () => { if (!confirm('حذف نهائي من الموقع؟ (لإخفائه مؤقتاً ألغِ «منشور»)')) return; try { await RDB.remove(tab, id); closeModal(); await siteLoad(tab); paintSite(); } catch (e) { rToast(e.message, 1); } } : null);
  document.querySelector('.modal').style.maxWidth = '760px';
}
/* ── الواجهة والتواصل (site_settings) ── */
function siteSettingsHTML() {
  const s = SITE.settings, hero = s.hero || {}, c = s.contact || {}, so = s.social || {}, sp = s.support || {}, stats = s.stats || [];
  const titlePlain = (hero.title_html || '').replace(/<em>(.*?)<\/em>/g, '**$1**').replace(/<[^>]+>/g, '');
  const inp = (id, l, v, ltr) => `<div class="field"><label>${l}</label><input id="${id}" value="${esc(v || '')}"${ltr ? ' dir="ltr"' : ''}></div>`;
  return `<div class="r-grid2">
    <div class="card r-card"><h3><i data-lucide="panel-top"></i> الواجهة الرئيسية</h3>
      ${inp('ss_eyebrow', 'السطر الصغير فوق العنوان', hero.eyebrow)}
      ${inp('ss_title', 'العنوان الرئيسي — ضع الكلمة الذهبية بين ** **', titlePlain || '')}
      <div class="field"><label>النص التعريفي</label><textarea id="ss_lead" rows="2">${esc(hero.lead || '')}</textarea></div>
      ${fieldHTML(['hero_image', 'صورة الواجهة', 'img'], hero.image).replace(/sf_hero_image/g, 'ss_image')}
    </div>
    <div class="card r-card"><h3><i data-lucide="bar-chart-3"></i> أرقام الأثر</h3>
      <div id="ss_stats" class="r-objlist">${(stats.length ? stats : [{}, {}, {}, {}]).map(x => `<div class="r-objrow"><input data-k="value" placeholder="الرقم (مثال: 2100)" value="${esc(x.value || '')}"><input data-k="label" placeholder="الوصف (مستفيد ومستفيدة)" value="${esc(x.label || '')}"><button type="button" class="x" onclick="this.parentElement.remove()">×</button></div>`).join('')}</div>
      <button type="button" class="link-btn" onclick="document.getElementById('ss_stats').insertAdjacentHTML('beforeend',objRow([['value','الرقم'],['label','الوصف']],{}))">+ رقم</button>
      ${inp('ss_asof', 'الأرقام حتى (تاريخ آخر تحديث)', s.stats_asof)}
      <div class="r-hint">أول رقمين يظهران أيضاً على صورة الواجهة.</div></div>
    <div class="card r-card"><h3><i data-lucide="phone"></i> التواصل</h3>
      <div class="row2">${inp('ss_phone', 'الهاتف', c.phone, 1)}${inp('ss_wa', 'واتساب', c.whatsapp, 1)}</div>
      ${inp('ss_email', 'البريد الرسمي', c.email, 1)}${inp('ss_addr', 'العنوان', c.address)}${inp('ss_hours', 'أوقات العمل', c.hours)}
      ${inp('ss_map', 'رابط تضمين خرائط Google (اختياري)', c.map_embed, 1)}</div>
    <div class="card r-card"><h3><i data-lucide="share-2"></i> الحسابات والدعم</h3>
      <div class="row2">${inp('so_x', 'إكس', so.x, 1)}${inp('so_ig', 'إنستغرام', so.instagram, 1)}</div>
      <div class="row2">${inp('so_sc', 'سناب شات', so.snapchat, 1)}${inp('so_yt', 'يوتيوب', so.youtube, 1)}</div>
      <div class="row2">${inp('so_li', 'لينكدإن', so.linkedin, 1)}${inp('so_wa', 'رابط واتساب', so.whatsapp, 1)}</div>
      <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
      <div class="row2">${inp('sp_bank', 'البنك', sp.bank)}${inp('sp_name', 'اسم الحساب', sp.account_name)}</div>
      ${inp('sp_iban', 'الآيبان الرسمي للتبرعات', sp.iban, 1)}${inp('sp_url', 'رابط التبرع الإلكتروني (منصة إحسان / متجر)', sp.donate_url, 1)}</div>
  </div><div style="margin-top:14px"><button class="btn btn-gold" onclick="siteSaveSettings()"><i data-lucide="save"></i> حفظ إعدادات الموقع</button></div>`;
}
async function siteSaveSettings() {
  const t = fval('ss_title'); const title_html = esc(t).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');
  const stats = Array.from(document.querySelectorAll('#ss_stats .r-objrow')).map(r => ({ value: r.querySelector('[data-k=value]').value.trim(), label: r.querySelector('[data-k=label]').value.trim() })).filter(x => x.value && x.label);
  const urls = ['ss_map', 'so_x', 'so_ig', 'so_sc', 'so_yt', 'so_li', 'so_wa', 'sp_url'].map(fval); if (urls.some(u => !validUrl(u))) { rToast('الروابط يجب أن تبدأ بـ https://', 1); return; }
  try {
    await RDB.upsertSetting('hero', { eyebrow: fval('ss_eyebrow'), title_html, lead: fval('ss_lead'), image: fval('ss_image') });
    await RDB.upsertSetting('stats', stats);
    await RDB.upsertSetting('stats_asof', fval('ss_asof'));
    await RDB.upsertSetting('contact', { phone: fval('ss_phone'), whatsapp: fval('ss_wa'), email: fval('ss_email'), address: fval('ss_addr'), hours: fval('ss_hours'), map_embed: fval('ss_map') });
    await RDB.upsertSetting('social', { x: fval('so_x'), instagram: fval('so_ig'), snapchat: fval('so_sc'), youtube: fval('so_yt'), linkedin: fval('so_li'), whatsapp: fval('so_wa') });
    await RDB.upsertSetting('support', { bank: fval('sp_bank'), account_name: fval('sp_name'), iban: fval('sp_iban'), donate_url: fval('sp_url') });
    rToast('تم الحفظ — تحدّث الموقع');
  } catch (e) { rToast(e.message, 1); }
}
/* ── استيراد المحتوى الافتراضي للموقع (من content.js) إلى قاعدة البيانات ── */
async function siteImport(silent) {
  if (!silent && !confirm('استيراد كل محتوى الموقع الحالي (البرامج، الأخبار، الشركاء، الشهادات، الأسئلة، الوثائق، الإعدادات) إلى النظام لتحريره من هنا؟')) return;
  rToast(silent ? 'جارٍ تجهيز محتوى الموقع لأول مرة…' : 'جارٍ الاستيراد…');
  try {
    if (!window.RUSO_DEFAULT) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = webBase() + 'assets/js/content.js'; s.onload = res; s.onerror = () => rej(new Error('تعذّر تحميل محتوى الموقع من ' + webBase())); document.head.appendChild(s); });
    const D = window.RUSO_DEFAULT; let n = 0;
    for (const tab of Object.keys(SITE_TABLES)) {
      const existing = await RDB.list(tab).catch(() => []);
      for (const r0 of (D[tab] || [])) {
        const r = Object.assign({}, r0); delete r.id; if (tab === 'testimonials') delete r.url;
        const allowed = SITE_TABLES[tab].fields.map(f => f[0]); Object.keys(r).forEach(k => { if (!allowed.includes(k)) delete r[k]; });
        if (r.published === undefined) r.published = true;
        const dup = existing.find(e => (r.slug && e.slug === r.slug) || (e[SITE_TABLES[tab].title] && e[SITE_TABLES[tab].title] === r[SITE_TABLES[tab].title]));
        if (dup) {
          // التعبئة التلقائية تكمل الحقول الفارغة فقط ولا تمسّ ما عدّله الفريق
          const patch = silent ? Object.fromEntries(Object.entries(r).filter(([k, v]) => { const o = dup[k]; return v != null && v !== '' && (o == null || o === '' || (Array.isArray(o) && !o.length)); })) : r;
          if (Object.keys(patch).length) await RDB.update(tab, dup.id, patch);
        } else await RDB.insert(tab, r); n++;
      }
    }
    const st = D.site || {};
    const cur = {}; (await RDB.list('site_settings').catch(() => [])).forEach(r => cur[r.key] = r.value);
    for (const k of ['hero', 'stats', 'stats_asof', 'contact', 'social', 'support']) if (st[k] !== undefined && (!silent || cur[k] === undefined)) await RDB.upsertSetting(k, st[k]);
    await RDB.upsertSetting('seeded', new Date().toISOString());
    await loadOrg(); if (silent) { rToast('لوحة الموقع جاهزة — كل محتوى الموقع الحالي أصبح قابلاً للتعديل من هنا'); return; }
    await siteLoad(SITE.tab); paintSite(); rToast('تم استيراد ' + n + ' عنصراً');
  } catch (e) { rToast(e.message, 1); }
}

/* ═════════ الوارد من الموقع ═════════ */
const SUB_KINDS = { registration: { t: 'تسجيل في برنامج', i: 'graduation-cap' }, volunteer: { t: 'تطوع', i: 'hand-heart' }, job: { t: 'توظيف', i: 'briefcase' }, partnership: { t: 'شراكة', i: 'handshake' }, support: { t: 'دعم برنامج', i: 'heart' }, contact: { t: 'تواصل', i: 'mail' } };
const INBOX_ROUTING = ORG_CFG.inboxRouting || {};
const subDepts = k => INBOX_ROUTING[k] || [];
const SUB_ST = { new: { t: 'جديد', c: '#6C8EBF' }, in_progress: { t: 'قيد المتابعة', c: '#f59e0b' }, done: { t: 'تمت', c: '#22c55e' }, archived: { t: 'مؤرشف', c: '#94a3b8' } };
const INB = { rows: [], kind: '', st: 'open', subs: null, tab: 'subs' };
const PAYLOAD_L = { gender: 'الجنس', age: 'العمر', city: 'المدينة', occupation: 'الصفة', skills: 'المهارات', availability: 'الوقت المتاح', org: 'الجهة', type: 'نوع الشراكة', subject: 'الموضوع', amount: 'المبلغ المتوقع', cv_url: 'السيرة الذاتية' };
function inboxKinds() { if (isAdmin()) return Object.keys(SUB_KINDS); const k = Object.keys(SUB_KINDS).filter(x => subDepts(x).includes(ME.dept)); return k.length ? k : Object.keys(SUB_KINDS); }
async function renderInbox() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  INB.rows = await RDB.list('submissions', { order: 'created_at' }).catch(e => { rToast(e.message, 1); return []; });
  paintInbox();
}
function paintInbox() {
  const kinds = inboxKinds();
  const rows = INB.rows.filter(r => kinds.includes(r.kind) && (!INB.kind || r.kind === INB.kind) && (INB.st === 'all' || (INB.st === 'open' ? ['new', 'in_progress'].includes(r.status) : r.status === INB.st)));
  const cnt = k => INB.rows.filter(r => r.kind === k && r.status === 'new').length;
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>الوارد من الموقع</h1><p class="r-sub" style="margin:4px 0 0">التسجيلات وطلبات التطوع والشراكة والتواصل التي تصل من نماذج ruso.org.sa</p></div>
      <div style="display:flex;gap:8px"><button class="btn btn-ghost" onclick="inboxExport()"><i data-lucide="download"></i> تصدير CSV</button>${can(['site', 'newsletter']) ? `<button class="btn btn-ghost" onclick="inboxSubscribers()"><i data-lucide="mail"></i> مشتركو النشرة</button>` : ''}</div></div>
    <div class="r-tabs">${[''].concat(kinds).map(k => `<button class="${INB.kind === k ? 'on' : ''}" onclick="INB.kind='${k}';paintInbox()">${k ? `<i data-lucide="${SUB_KINDS[k].i}"></i>${SUB_KINDS[k].t}${cnt(k) ? ` <span class="r-cnt">${cnt(k)}</span>` : ''}` : 'الكل'}</button>`).join('')}</div>
    <div class="r-filters"><div class="r-seg">${[['open', 'المفتوحة'], ['new', 'الجديدة'], ['done', 'المنجزة'], ['archived', 'المؤرشفة'], ['all', 'الكل']].map(([k, t]) => `<button class="${INB.st === k ? 'on' : ''}" onclick="INB.st='${k}';paintInbox()">${t}</button>`).join('')}</div></div>
    <div class="r-list">${rows.map(r => `<button class="r-item" onclick="inboxView('${r.id}')"><span class="r-thumb"><i data-lucide="${SUB_KINDS[r.kind].i}"></i></span>
      <span class="r-item-t"><b>${esc(r.name || '—')}${r.ref_title ? ' — ' + esc(r.ref_title) : ''}</b><small>${SUB_KINDS[r.kind].t} · ${fmtD(r.created_at)}${r.phone ? ' · ' + esc(r.phone) : ''}${r.assigned_to ? ' · مع ' + esc(memberName(r.assigned_to)) : ''}</small></span>
      <span class="r-badge" style="--c:${SUB_ST[r.status].c}">${SUB_ST[r.status].t}</span><i data-lucide="chevron-left" class="r-chev"></i></button>`).join('') || rEmpty('inbox', 'لا طلبات هنا.')}</div></div>`;
  refreshIcons();
}
function inboxView(id) {
  const r = INB.rows.find(x => x.id === id); const p = r.payload || {};
  const wa = r.phone ? 'https://wa.me/' + String(r.phone).replace(/\D/g, '').replace(/^0/, '966') : '';
  openModal(SUB_KINDS[r.kind].t + (r.ref_title ? ' — ' + esc(r.ref_title) : ''), `
    <dl class="r-dl"><dt>الاسم</dt><dd>${esc(r.name)}</dd>${r.phone ? `<dt>الجوال</dt><dd dir="ltr" style="text-align:right">${esc(r.phone)}</dd>` : ''}${r.email ? `<dt>البريد</dt><dd>${esc(r.email)}</dd>` : ''}
      ${Object.entries(p).map(([k, v]) => `<dt>${esc(PAYLOAD_L[k] || k)}</dt><dd>${/^https?:/.test(v) ? linkChip({ url: v, title: 'فتح' }) : esc(v)}</dd>`).join('')}
      ${r.message ? `<dt>الرسالة</dt><dd>${esc(r.message)}</dd>` : ''}<dt>وصل في</dt><dd>${new Date(r.created_at).toLocaleString('ar-u-ca-gregory-nu-latn')}</dd></dl>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 16px">${wa ? `<a class="btn btn-ghost btn-sm" href="${wa}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> واتساب</a>` : ''}${r.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(r.email)}"><i data-lucide="mail"></i> بريد</a>` : ''}${can('tasks') ? `<button type="button" class="btn btn-ghost btn-sm" onclick="inboxToTask('${id}')"><i data-lucide="list-plus"></i> تحويل لمهمة</button>` : ''}</div>
    <div class="row2"><div class="field"><label>الحالة</label><select id="i_st">${Object.entries(SUB_ST).map(([k, s]) => `<option value="${k}"${k === r.status ? ' selected' : ''}>${s.t}</option>`).join('')}</select></div>
      <div class="field"><label>المسؤول عن المتابعة</label><select id="i_as">${memberOptions(r.assigned_to)}</select></div></div>
    <div class="field"><label>ملاحظات المتابعة (داخلية)</label><textarea id="i_notes" rows="3">${esc(r.notes)}</textarea></div>`,
    async () => { try { const patch = { status: fval('i_st'), assigned_to: fval('i_as') || null, notes: fval('i_notes') }; await RDB.update('submissions', id, patch); Object.assign(r, patch); closeModal(); paintInbox(); rToast('تم الحفظ'); } catch (e) { rToast(e.message, 1); } },
    isAdmin() ? async () => { if (!confirm('حذف الطلب نهائياً؟')) return; await RDB.remove('submissions', id); closeModal(); renderInbox(); } : null);
}
function inboxToTask(id) {
  const r = INB.rows.find(x => x.id === id); closeModal();
  const prog = ORG.programs.find(p => p.id === r.program_id);
  taskModal(null, { title: 'متابعة ' + SUB_KINDS[r.kind].t + ': ' + r.name, description: [r.ref_title, r.phone, r.email, r.message].filter(Boolean).join('\n'), dept: subDepts(r.kind)[0] || ME.dept, program_id: prog ? prog.id : '' });
}
function inboxExport() {
  const kinds = inboxKinds(); const rows = INB.rows.filter(r => kinds.includes(r.kind) && (!INB.kind || r.kind === INB.kind));
  const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r.payload || {}))));
  const head = ['النوع', 'البرنامج/الفرصة', 'الاسم', 'الجوال', 'البريد', ...keys.map(k => PAYLOAD_L[k] || k), 'الرسالة', 'الحالة', 'التاريخ'];
  const data = rows.map(r => [SUB_KINDS[r.kind].t, r.ref_title, r.name, r.phone, r.email, ...keys.map(k => (r.payload || {})[k] || ''), r.message, SUB_ST[r.status].t, r.created_at.slice(0, 10)]);
  const csv = '﻿' + [head].concat(data).map(x => x.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'الوارد-' + (INB.kind || 'الكل') + '-' + today() + '.csv'; a.click();
}
async function inboxSubscribers() {
  const subs = await RDB.list('subscribers', { order: 'created_at' }).catch(e => { rToast(e.message, 1); return []; });
  openModal('مشتركو النشرة البريدية (' + subs.length + ')', `<p class="r-sub">صدّر القائمة واستخدمها في أداة البريد (مثل Brevo المجانية) لإرسال النشرة.</p>
    <div style="max-height:340px;overflow:auto">${subs.map(s => `<div class="r-row"><span dir="ltr">${esc(s.email)}</span><small class="r-sub">${fmtD(s.created_at)}</small></div>`).join('') || rEmpty('mail', 'لا مشتركين بعد.')}</div>`,
    () => { const csv = '﻿' + 'email,created_at\n' + subs.map(s => s.email + ',' + s.created_at.slice(0, 10)).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'subscribers-' + today() + '.csv'; a.click(); });
  const b = document.getElementById('mSave'); if (b) b.textContent = 'تصدير CSV';
}

/* ═════════ الفريق والصلاحيات ═════════ */
/* JOB_TITLES — من CONFIG.org.jobTitles (انظر 20-org-core.js) */
async function renderTeam() {
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  await loadOrg();
  const by = k => ORG.members.filter(m => m.dept === k);
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>الفريق والصلاحيات</h1><p class="r-sub" style="margin:4px 0 0">أضف بريد الموظف هنا، ثم أرسل له رابط النظام ليسجّل بنفس البريد — يُربط حسابه تلقائياً وتظهر له تطبيقات قسمه فقط.</p></div><button class="btn btn-gold" onclick="memberModal()"><i data-lucide="user-plus"></i> إضافة موظف</button></div>
    <div class="r-org">${Object.entries(DEPTS).map(([k, d]) => `<div class="card r-card"><div class="r-card-h"><h3><span class="r-dot" style="background:${d.color}"></span>${d.name}</h3><span class="r-sub">${(DEPT_APPS[k] || []).map(a => APP_LABELS[a]).join('، ')}</span></div>
      ${by(k).map(m => `<button class="r-member${m.active === false ? ' off' : ''}" onclick="memberModal('${m.id}')">${avatar(m, 38)}<span><b>${esc(m.name)}</b><small>${esc(m.title)} · ${ROLES[m.role]}</small><small dir="ltr" style="text-align:right">${esc(m.email)}</small></span>${m.user_id || RUSO_DEMO ? '<span class="r-chip" style="--c:#22c55e">فعّال</span>' : '<span class="r-chip" style="--c:#f59e0b">بانتظار التسجيل</span>'}${m.role !== 'admin' && isCustomApps(m) ? '<span class="r-chip" style="--c:#7B5EA7">صلاحيات مخصصة</span>' : ''}</button>`).join('') || '<p class="r-sub">لا موظفين بعد.</p>'}</div>`).join('')}</div>
    <div class="card r-card r-login-link"><h3><i data-lucide="link"></i> رابط دخول الموظفين</h3><div class="r-row"><code dir="ltr">${esc(location.origin + location.pathname)}</code><button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${esc(location.origin + location.pathname)}');rToast('تم النسخ')">نسخ</button></div></div></div>`;
  refreshIcons();
}
function memberModal(id) {
  const m = id ? ORG.members.find(x => x.id === id) : { email: '', name: '', title: '', dept: 'projects', role: 'staff', apps: [], phone: '', active: true };
  const def = DEPT_APPS[m.dept] || [];
  openModal(id ? 'بيانات الموظف' : 'إضافة موظف', `
    <div class="row2"><div class="field"><label>الاسم</label><input id="m_name" value="${esc(m.name)}"></div><div class="field"><label>البريد (للدخول)</label><input id="m_email" dir="ltr" value="${esc(m.email)}"${id && m.user_id ? ' disabled' : ''}></div></div>
    <div class="row2"><div class="field"><label>المسمى الوظيفي</label><input id="m_title" list="m_titles" value="${esc(m.title)}"><datalist id="m_titles">${JOB_TITLES.map(t => `<option value="${t}">`).join('')}</datalist></div><div class="field"><label>الجوال</label><input id="m_phone" dir="ltr" value="${esc(m.phone)}"></div></div>
    <div class="row2"><div class="field"><label>الإدارة / الوحدة</label><select id="m_dept" onchange="memberAppsDefault()">${deptOptions(m.dept)}</select></div>
      <div class="field"><label>الدور</label><select id="m_role">${Object.entries(ROLES).map(([k, t]) => `<option value="${k}"${k === m.role ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="field"><label>التطبيقات المتاحة له</label><label class="r-check"><input type="checkbox" id="m_custom"${isCustomApps(m) ? ' checked' : ''} onchange="document.getElementById('m_apps').classList.toggle('dis',!this.checked)"> تخصيص يدوي (وإلا فحسب قسمه)</label>
      <div id="m_apps" class="r-apps${isCustomApps(m) ? '' : ' dis'}">${Object.entries(APP_LABELS).map(([k, t]) => `<label class="r-check"><input type="checkbox" value="${k}"${(m.apps && m.apps.length ? m.apps : def).includes(k) ? ' checked' : ''}> ${t}</label>`).join('')}</div>
      <div class="r-hint">مثال: موظف في الإعلام تعطيه «إدارة الموقع» فقط. ${TERMS.head} يرى كل شيء دائماً.</div></div>
    <label class="r-check"><input type="checkbox" id="m_active"${m.active !== false ? ' checked' : ''}> الحساب فعّال (إلغاؤه يمنع الدخول دون حذف بياناته)</label>`,
    async () => {
      const row = { name: fval('m_name'), title: fval('m_title'), phone: fval('m_phone'), dept: fval('m_dept'), role: fval('m_role'), active: fval('m_active'), apps: fval('m_custom') ? Array.from(document.querySelectorAll('#m_apps input:checked')).map(i => i.value) : (DEPT_APPS[fval('m_dept')] || ['tasks', 'library']).slice(), apps_custom: !!fval('m_custom') };
      if (!id || !m.user_id) row.email = fval('m_email').toLowerCase();
      if (!row.name || (row.email !== undefined && !/^\S+@\S+\.\S+$/.test(row.email))) { rToast('الاسم والبريد الصحيح مطلوبان', 1); return; }
      try { if (id) await RDB.update('members', id, row); else await RDB.insert('members', row); closeModal(); rToast(id ? 'تم الحفظ' : 'أُضيف — أرسل له رابط النظام ليسجّل بنفس البريد'); if (id === ME.id) Object.assign(ME, row); renderTeam(); }
      catch (e) { rToast(/duplicate|unique/i.test(e.message) ? 'هذا البريد مضاف مسبقاً' : e.message, 1); }
    }, id && id !== ME.id ? async () => { if (!confirm('حذف الموظف؟ يفضّل إلغاء التفعيل للحفاظ على سجل مهامه وسنداته.')) return; await RDB.remove('members', id); closeModal(); renderTeam(); } : null);
}
function isCustomApps(m) { if (typeof m.apps_custom === 'boolean') return m.apps_custom; const d = (DEPT_APPS[m.dept] || []).slice().sort().join(); return !!(m.apps && m.apps.length) && m.apps.slice().sort().join() !== d; }
function memberAppsDefault() { if (fval('m_custom')) return; const def = DEPT_APPS[fval('m_dept')] || []; document.querySelectorAll('#m_apps input').forEach(i => i.checked = def.includes(i.value)); }
