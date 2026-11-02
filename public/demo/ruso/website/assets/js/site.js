/*
 * site.js — محرّك موقع جمعية رسو
 * ─────────────────────────────────────────────────────────────
 * • يبني الرأس والتذييل لكل الصفحات (من مكان واحد).
 * • يجلب المحتوى من قاعدة البيانات (Supabase REST) — ولو لم تُربط بعد
 *   يستخدم المحتوى الافتراضي في content.js.
 * • يرسم كل صفحة حسب <body data-page="...">.
 * • يرسل النماذج إلى جدول submissions / subscribers.
 */
(function () {
  'use strict';
  const CFG = window.RUSO_CONFIG || {};
  const DEF = window.RUSO_DEFAULT || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseKey);
  const PAGE = document.body.dataset.page || 'home';

  /* ═════════ أدوات ═════════ */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = k => new URLSearchParams(location.search).get(k);
  const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const fmtDate = d => { if (!d) return ''; d = String(d);
    if (/^\d{4}$/.test(d)) return 'عام ' + d;
    if (/^\d{4}-\d{2}$/.test(d)) return AR_MONTHS[+d.slice(5) - 1] + ' ' + d.slice(0, 4);
    const x = new Date(d); if (isNaN(x)) return esc(d); return x.getDate() + ' ' + AR_MONTHS[x.getMonth()] + ' ' + x.getFullYear(); };
  const paras = t => String(t || '').split(/\n{2,}|\r\n\r\n/).map(p => p.trim()).filter(Boolean).map(p => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  const progUrl = p => 'program.html?p=' + encodeURIComponent(p.slug || p.id);
  const newsUrl = n => 'article.html?n=' + encodeURIComponent(n.slug || n.id);
  const img = (src, alt, extra = '') => src ? `<img src="${esc(src)}" alt="${esc(alt || '')}" loading="lazy" decoding="async" ${extra}>` : '';

  const ICON = {
    skill: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    value: '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
    know: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    doc: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4M10 17h4"/>',
    arrow: '<path d="m15 18-6-6 6-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    x_social: '<path d="M4 4l16 16M20 4 4 20" />',
  };
  const ico = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;
  const SOCIAL = {
    x: { name: 'إكس', path: '<path fill="currentColor" stroke="none" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77zm-1.08 16.2h1.7L7.4 4.73H5.58z"/>' },
    instagram: { name: 'إنستغرام', path: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>' },
    snapchat: { name: 'سناب شات', path: '<path d="M12 3c3 0 5 2.2 5 5.2v2.3l1.7-.6c.5 0 .9.4.6.9-.4.6-1.6 1-2.2 1.2.4 1.7 2 3.2 3.4 3.6.3.1.3.5 0 .7-.7.4-1.7.5-2.2.7-.2.4-.2 1-.6 1.1-.8.2-1.6-.3-2.8.2-.9.4-1.6 1.6-2.9 1.6s-2-1.2-2.9-1.6c-1.2-.5-2-.1-2.8-.2-.4-.1-.4-.7-.6-1.1-.5-.2-1.5-.3-2.2-.7-.3-.2-.3-.6 0-.7 1.4-.4 3-1.9 3.4-3.6-.6-.2-1.8-.6-2.2-1.2-.3-.5.1-.9.6-.9l1.7.6V8.2C7 5.2 9 3 12 3z"/>' },
    youtube: { name: 'يوتيوب', path: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>' },
    linkedin: { name: 'لينكدإن', path: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>' },
    phone: { name: 'هاتف', path: ICON.phone },
    mail: { name: 'بريد', path: ICON.mail },
    pin: { name: 'عنوان', path: ICON.pin },
    whatsapp: { name: 'واتساب', path: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>' },
  };
  const socialIcon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(SOCIAL[k] || {}).path || ''}</svg>`;

  /* ═════════ طبقة البيانات ═════════ */
  async function rest(path) {
    const r = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + path, {
      headers: { apikey: CFG.supabaseKey, Authorization: 'Bearer ' + CFG.supabaseKey }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function restInsert(table, row) {
    const r = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + table, {
      method: 'POST',
      headers: { apikey: CFG.supabaseKey, Authorization: 'Bearer ' + CFG.supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    });
    if (!r.ok) { const t = await r.text(); throw new Error(t || ('HTTP ' + r.status)); }
  }

  let _data = null;
  async function data() {
    if (_data) return _data;
    const d = JSON.parse(JSON.stringify(DEF));
    if (LIVE) {
      try {
        const cacheKey = 'ruso_site_v1';
        let live = null;
        try { const c = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); if (c && Date.now() - c.t < 120000) live = c.d; } catch (e) {}
        if (!live) {
          const [settings, programs, news, partners, testimonials, faqs, documents, opportunities] = await Promise.all([
            rest('site_settings?select=key,value'),
            rest('programs?select=*&published=eq.true&order=sort.asc,created_at.desc'),
            rest('news?select=*&published=eq.true&order=date.desc'),
            rest('partners?select=*&published=eq.true&order=sort.asc'),
            rest('testimonials?select=*&published=eq.true&order=sort.asc'),
            rest('faqs?select=*&published=eq.true&order=sort.asc'),
            rest('documents?select=*&published=eq.true&order=sort.asc,year.desc'),
            rest('opportunities?select=*&published=eq.true&order=created_at.desc'),
          ]);
          live = { settings, programs, news, partners, testimonials, faqs, documents, opportunities };
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), d: live })); } catch (e) {}
        }
        (live.settings || []).forEach(s => { d.site[s.key] = (s.value && typeof s.value === 'object' && !Array.isArray(s.value)) ? Object.assign({}, d.site[s.key] || {}, s.value) : s.value; });
        ['programs', 'news', 'partners', 'testimonials', 'faqs', 'documents', 'opportunities'].forEach(k => { if (live[k] && live[k].length) d[k] = live[k]; });
      } catch (e) { console.warn('[رسو] تعذّر جلب المحتوى الحي — يُعرض المحتوى الافتراضي', e); }
    }
    ['programs', 'news', 'partners', 'testimonials', 'faqs', 'documents', 'opportunities'].forEach(k => { d[k] = (d[k] || []).filter(x => x.published !== false); });
    _data = d;
    return d;
  }

  /* ═════════ الرأس والتذييل ═════════ */
  const NAV = [
    { id: 'about', href: 'about.html', t: 'من نحن' },
    { id: 'programs', href: 'programs.html', t: 'برامجنا' },
    { id: 'involved', href: 'get-involved.html', t: 'شارك معنا' },
    { id: 'news', href: 'news.html', t: 'المركز الإعلامي' },
    { id: 'governance', href: 'governance.html', t: 'الحوكمة والشفافية' },
    { id: 'contact', href: 'contact.html', t: 'تواصل معنا' },
  ];
  const CUR = { program: 'programs', article: 'news' }[PAGE] || PAGE;

  function header() {
    const el = document.createElement('header');
    el.className = 'site-head';
    el.innerHTML = `<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
      <div class="wrap head-in">
        <a class="brand" href="index.html" aria-label="جمعية رسو لبناء الشخصية — الرئيسية"><img src="assets/brand/logo-horizontal-white.svg" alt="جمعية رسو لبناء الشخصية" width="200" height="46"></a>
        <nav class="nav" id="siteNav" aria-label="القائمة الرئيسية">
          ${NAV.map(n => `<a href="${n.href}"${n.id === CUR ? ' aria-current="page"' : ''}>${n.t}</a>`).join('')}
        </nav>
        <div class="head-cta">
          <a class="btn btn-gold btn-sm" href="support.html">ادعم رسو</a>
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="فتح القائمة">${ico('menu')}</button>
        </div>
      </div>`;
    document.body.prepend(el);
    const btn = $('.menu-btn', el), nav = $('#siteNav', el);
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.innerHTML = ico(open ? 'x' : 'menu');
    });
    const onScroll = () => el.classList.toggle('scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  function footer(d) {
    const s = d.site.contact || {};
    const soc = d.site.social || {};
    const el = document.createElement('footer');
    el.className = 'site-foot';
    el.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <img src="assets/brand/logo-horizontal-white.svg" alt="جمعية رسو لبناء الشخصية" width="220" height="52">
          <p>${esc(s.address || '')}</p>
          ${s.hours ? `<p>${esc(s.hours)}</p>` : ''}
          ${s.phone ? `<p><a href="tel:${esc(s.phone)}" dir="ltr" style="display:inline;color:#fff;font-weight:700">${esc(s.phone)}</a></p>` : ''}
          ${s.email ? `<p><a href="mailto:${esc(s.email)}" style="display:inline;color:#fff">${esc(s.email)}</a></p>` : ''}
          <div class="socials">${['x', 'instagram', 'snapchat', 'youtube', 'linkedin', 'whatsapp'].filter(k => soc[k]).map(k => `<a href="${esc(soc[k])}" target="_blank" rel="noopener" aria-label="${SOCIAL[k].name}">${socialIcon(k)}</a>`).join('')}</div>
        </div>
        <nav aria-label="روابط الجمعية"><h4>الجمعية</h4>
          <a href="about.html">من نحن</a><a href="programs.html">برامجنا</a><a href="news.html">المركز الإعلامي</a><a href="governance.html">الحوكمة والشفافية</a><a href="contact.html">تواصل معنا</a></nav>
        <nav aria-label="روابط المشاركة"><h4>شارك معنا</h4>
          <a href="get-involved.html#volunteer">الفرص التطوعية</a><a href="get-involved.html#jobs">الوظائف</a><a href="get-involved.html#partner">الشراكات</a><a href="support.html">ادعم رسو</a></nav>
        <div><h4><label for="nlEmail">النشرة البريدية</label></h4>
          <p style="margin:0;font-size:15px;color:#AFC2C5">أخبار البرامج والفرص الجديدة في بريدك.</p>
          <form class="nl-form" data-form="newsletter" novalidate>
            <input id="nlEmail" name="email" type="email" required placeholder="بريدك الإلكتروني" autocomplete="email">
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <button class="btn btn-gold" type="submit">اشترك</button>
          </form>
          <div class="form-msg" role="status" aria-live="polite"></div>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} جمعية رسو لبناء الشخصية. جمعية أهلية تحت إشراف المركز الوطني لتنمية القطاع غير الربحي، ترخيص رقم ${esc(d.site.org.license || '0000000000')}.</span>
        <span><a href="privacy.html">سياسة الخصوصية</a> · <a href="${esc(CFG.systemUrl || '#')}" rel="nofollow">دخول الموظفين</a></span>
      </div>
    </div>`;
    document.body.append(el);
  }

  /* ═════════ مكوّنات ═════════ */
  /* أسلوب «الدمج»: الصورة خلفية + تغبيش خفيف + تدرّج فيروزي غامق، والكلام أبيض فوقها */
  const bg = (src, blur, pos) => src ? `<div class="bg" style="background-image:url('${esc(src)}');${blur != null ? `--blur:${blur}px;` : ''}${pos ? `background-position:${pos};` : ''}"></div>` : '';
  const statusTag = p => p.registration_open ? `<span class="tag open">${esc(p.status_label || 'التسجيل مفتوح')}</span>`
    : (p.status_label ? `<span class="tag ghost">${esc(p.status_label)}</span>` : '');
  /* بطاقة صورة مدموجة (برنامج/خبر): الصورة كاملة والنص أبيض فوق تدرّج */
  const tile = (o) => `<a class="tile reveal${o.cls ? ' ' + o.cls : ''}" href="${o.href}">${bg(o.img || 'assets/img/group.webp', 0)}
      <div class="tile-in">${o.top ? `<div class="tags">${o.top}</div>` : ''}${o.meta ? `<span class="tile-meta">${o.meta}</span>` : ''}
        <h3>${esc(o.title)}</h3>${o.text ? `<p>${esc(o.text)}</p>` : ''}<span class="tile-go">${o.go || 'التفاصيل'} ${bi('arrowL', 18)}</span></div></a>`;
  const programTile = (p, cls) => tile({ href: progUrl(p), img: p.cover_url, cls, title: p.title, text: p.summary,
    top: `${p.axis ? `<span class="tag glass">${esc(p.axis)}</span>` : ''}${statusTag(p)}`, meta: esc(p.audience || ''), go: 'تفاصيل البرنامج' });
  const newsTile = (n, cls) => tile({ href: newsUrl(n), img: n.cover_url, cls, title: n.title, text: cls === 'lg' ? n.excerpt : '', meta: fmtDate(n.date), go: 'اقرأ الخبر' });
  const strokes = (style) => `<div class="strokes" style="${style}" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i style="right:${i * 70}px;top:${i % 2 ? 30 : 0}px"></i>`).join('')}</div>`;
  const faqHTML = list => `<div class="faq">${list.map(f => `<details><summary>${esc(f.question)}<span class="tog" aria-hidden="true"></span></summary><div class="ans">${paras(f.answer)}</div></details>`).join('')}</div>`;
  const partnerLogos = (list, hidden) => list.map(p => `<${p.url ? `a href="${esc(p.url)}" target="_blank" rel="noopener"` : 'span'} class="p-logo" title="${esc(p.name)}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ''}>${p.logo_url ? `<img src="${esc(p.logo_url)}" alt="${hidden ? '' : esc(p.name)}" loading="lazy">` : `<b>${esc(p.name)}</b>`}</${p.url ? 'a' : 'span'}>`).join('');
  const DOC_CATS = { reports: 'التقارير السنوية وتقارير البرامج', financials: 'القوائم المالية', policies: 'السياسات واللوائح', board: 'مجلس الإدارة والجمعية العمومية', other: 'الهيكل والأدلة التنظيمية' };
  const VALUE_ICONS = { 'المبادرة': 'initiative', 'الريادة': 'leadership', 'التأثير': 'impact', 'التواصل': 'communication', 'المواطنة': 'citizenship', 'التطوير': 'development' };
  const GOAL_ICONS = ['youth', 'workers', 'environment'];
  const GOAL_IMGS = ['assets/img/programs/afaq.webp', 'assets/img/programs/compass.webp', 'assets/img/programs/environment.webp'];

  let _pf = 0;
  function popFig(src, alt, cls) {
    const i = ++_pf;
    return `<svg class="pop ${cls || ''}" viewBox="0 0 300 340" role="img" aria-label="${esc(alt || '')}">
      <defs>
        <linearGradient id="pfg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#41747F"/><stop offset=".55" stop-color="#6E8F7E"/><stop offset="1" stop-color="#CAB05F"/></linearGradient>
        <radialGradient id="pfh${i}" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="pfr${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#CAB05F"/><stop offset="1" stop-color="#E9DDB4" stop-opacity=".2"/></linearGradient>
        <clipPath id="pfc${i}"><circle cx="150" cy="208" r="122"/><rect x="28" y="0" width="244" height="208"/></clipPath>
        <clipPath id="pfd${i}"><circle cx="150" cy="208" r="122"/></clipPath>
        <radialGradient id="pfy${i}"><stop offset="0" stop-color="#E9D38A" stop-opacity=".95"/><stop offset=".55" stop-color="#CAB05F" stop-opacity=".45"/><stop offset="1" stop-color="#CAB05F" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="pf-orbit"><circle cx="150" cy="208" r="136" fill="none" stroke="#CAB05F" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="330 600" transform="rotate(-140 150 208)"/></g>
      <circle cx="150" cy="208" r="122" fill="url(#pfg${i})"/><g clip-path="url(#pfd${i})"><circle class="pf-glow" cx="236" cy="290" r="120" fill="url(#pfy${i})"/></g><circle cx="150" cy="208" r="122" fill="url(#pfh${i})"/>
      <image href="${esc(src)}" x="14" y="4" width="272" height="326" preserveAspectRatio="xMidYMax meet" clip-path="url(#pfc${i})"/>
      <g class="pf-ring"><g class="pf-sway"><path d="M58 318 C18 282 16 212 58 160" fill="none" stroke="url(#pfr${i})" stroke-width="9" stroke-linecap="round"/></g></g>
    </svg>`;
  }
  /* عدّاد الأرقام: يتحرك من الصفر عند ظهوره */
  const countAttr = v => { const m = String(v).match(/^(\D*)([\d,.]+)(.*)$/); return m ? ` data-count="${esc(m[2].replace(/,/g, ''))}" data-pre="${esc(m[1])}" data-suf="${esc(m[3])}"` : ''; };

  /* رأس الصفحات الداخلية — صورة مدموجة */
  function pageHero(title, lead, crumbs, photo, extra) {
    return `<section class="page-hero blend">${bg(photo || 'assets/img/group.webp', 0)}
      <div class="wrap ph-in">
        <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a>${(crumbs || []).map(c => `<span aria-hidden="true">/</span>${c.href ? `<a href="${c.href}">${esc(c.t)}</a>` : `<span>${esc(c.t)}</span>`}`).join('')}</nav>
        <h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${extra || ''}
      </div></section><div class="zigzag" aria-hidden="true"></div>`;
  }
  /* قسم نموذج مدموج: لوحة صورة جانبية + النموذج */
  function formSplit(kind, panel, preset, d) {
    return `<div class="form-split reveal">
      <aside class="fs-panel blend">${bg(panel.img, 1)}
        <div class="fs-in">${panel.icon ? bi(panel.icon, panel.iconSize || 52, 'fs-ic' + (panel.iconSize ? ' fs-ic-lg' : '')) : ''}<h3>${esc(panel.title)}</h3><p>${esc(panel.text)}</p>
          ${(panel.points || []).length ? `<ol class="fs-steps">${panel.points.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
          ${(panel.stats || []).length ? `<div class="fs-stats">${panel.stats.map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>` : ''}
        </div>${panel.cut ? `<img class="fs-cut${panel.cutRow ? ' fs-row' : ''}" src="${esc(panel.cut)}" alt="فريق جمعية رسو" loading="lazy">` : ''}</aside>
      <div class="fs-form">${formHTML(kind, preset || {}, d)}</div></div>`;
  }

  /* ═════════ الصفحات ═════════ */
  const R = {};

  R.home = d => {
    const h = d.site.hero || {};
    const progs = d.programs.slice().sort((a, b) => (b.featured - a.featured) || (b.registration_open - a.registration_open)).slice(0, 4);
    const stats = d.site.stats || [];
    const quotes = d.testimonials.filter(t => t.kind !== 'story').slice(0, 2);
    const story = d.testimonials.find(t => t.kind === 'story');
    const news = d.news.slice(0, 4);
    return `
    <section class="hero blend">${bg(h.bg || 'assets/img/group.webp', 3)}
      <div class="wrap hero-grid">
        <div class="hero-text">
          <span class="eyebrow">${esc(h.eyebrow || 'جمعية أهلية في الأحساء')}</span>
          <h1>${(h.title_html || esc(h.title || '')).replace('<em>ترسو</em>', '<span class="logo-word">تـ<img src="assets/brand/mark.svg" alt="رسو"></span>')}</h1>
          <p class="lead">${esc(h.lead || '')}</p>
          <div class="hero-actions">
            <a class="btn btn-gold" href="programs.html">سجّل في برنامج</a>
            <a class="link-w" href="get-involved.html#volunteer">تطوّع معنا</a>
            <a class="link-w" href="support.html">ادعم برنامجاً</a>
          </div>
          ${stats.length ? `<div class="hero-stats">${stats.slice(0, 3).map(s => `<div><b${countAttr(s.value)}>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>` : ''}
        </div>
        <div class="hero-cut">${popFig(h.cutout || 'assets/img/people/kids-yellow.webp', 'من مستفيدي برامج رسو', 'pop-hero')}</div>
      </div>
    </section><div class="zigzag" aria-hidden="true"></div>

    ${d.partners.length ? `<section class="partners" aria-label="شركاؤنا"><div class="label">شركاء وداعمون صنعوا الأثر معنا</div>
      <div class="marquee"><div class="track">${partnerLogos(d.partners)}${partnerLogos(d.partners, true)}</div></div></section>` : ''}

    <section class="section axes-sec"><div class="wrap">
      <div class="sec-head center-head"><div><span class="eyebrow">منهجنا</span><h2>ثلاثة محاور نبني بها الشخصية</h2></div></div>
      <div class="axes">${(d.site.axes || []).map((a, i) => `<div class="axis reveal"><span class="ax-n">0${i + 1}</span>${bi(['skill', 'gem', 'book'][i % 3], 64, 'ax-ic')}<h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div>`).join('')}</div>
    </div></section>

    <section class="section alt"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">برامجنا</span><h2>برامج تصنع الفرق</h2></div><a class="btn btn-line btn-sm arrow" href="programs.html">كل البرامج </a></div>
      <div class="tiles tiles-home">${progs.map((p, i) => programTile(p, i === 0 ? 'lg' : '')).join('')}</div>
    </div></section>

    <section class="section impact blend">${bg('assets/img/programs/volunteering.webp', 4)}
      <div class="wrap">
        <div class="sec-head"><div><span class="eyebrow">الأثر</span><h2>أثر يستمر بعد البرامج</h2><p>أرقام من رحلة الجمعية، وقصص من شباب وعاملين معهم شاركوا في برامجها.</p></div></div>
        <div class="impact-stats">${stats.slice(0, 4).map(s => `<div class="istat reveal"><b${countAttr(s.value)}>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
        <div class="impact-grid">
          ${story ? `<a class="story reveal" href="${esc(story.url || 'news.html')}">${bg('assets/img/programs/environment-3.webp', 6)}<div class="story-wrap"><div class="story-fig">${popFig(story.photo_url, story.role, 'pop-story')}</div>
            <div class="story-in"><span class="tag gold">قصة نجاح</span><h3>${esc(story.name)}</h3><p>${esc(story.quote)}</p><small>${esc(story.role)}</small></div></div></a>` : ''}
          ${quotes.map(q => `<figure class="quote reveal">${bi('quote', 34, 'q-ic')}<blockquote>${esc(q.quote)}</blockquote><figcaption>${q.photo_url ? `<img class="q-av" src="${esc(q.photo_url)}" alt="" loading="lazy">` : ''}<span class="q-who"><b>${esc(q.name)}</b><span>${esc(q.role || q.program)}</span></span></figcaption></figure>`).join('')}
        </div>
        ${d.site.stats_asof ? `<p class="asof">الأرقام حتى ${esc(d.site.stats_asof)}</p>` : ''}
      </div></section>

    <section class="section"><div class="wrap join">
      <div class="join-fig reveal">${popFig('assets/img/people/volunteer-1.webp', 'متطوع في جمعية رسو', 'pop-join')}
        ${(() => { const v = stats.find(x => x.label.includes('متطوع')); return v ? `<div class="big-num"><b${countAttr(v.value)}>${esc(v.value)}</b><span>${esc(v.label)}</span></div>` : ''; })()}</div>
      <div>
        <span class="eyebrow">مكانك معنا</span><h2 style="font-size:clamp(28px,3.4vw,40px)">لك باب في رسو</h2>
        <p style="color:var(--ink-2);margin-bottom:22px">سواء كنت تملك وقتاً تتطوع به، أو تبحث عن برنامج تدعمه، أو جهة تريد شراكة تصنع أثراً.</p>
        <div class="paths">
          <a class="path" href="get-involved.html#volunteer">${bi('volunteer', 40, 'p-ic')}<span><h3>تطوّع معنا</h3><p>انضم إلى متطوعي الجمعية في برامجها وفعالياتها.</p></span>${bi('arrowL', 22, 'p-go')}</a>
          <a class="path" href="support.html">${bi('heart', 40, 'p-ic')}<span><h3>ادعم برنامجاً</h3><p>اختر برنامجاً وادعمه مباشرة، وتابع أثره في تقارير الجمعية.</p></span>${bi('arrowL', 22, 'p-go')}</a>
          <a class="path" href="get-involved.html#partner">${bi('handshake', 40, 'p-ic')}<span><h3>كن شريكاً</h3><p>شراكات مع الجهات المانحة والقطاع الخاص لتصميم برامج نوعية للشباب.</p></span>${bi('arrowL', 22, 'p-go')}</a>
        </div>
      </div></div></section>

    ${news.length ? `<section class="section alt"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">المركز الإعلامي</span><h2>آخر الأخبار</h2></div><a class="btn btn-line btn-sm arrow" href="news.html">كل الأخبار </a></div>
      <div class="news-home">${newsTile(news[0], 'lg')}<div class="news-list">${news.slice(1).map(n => `<a class="news-item reveal" href="${newsUrl(n)}"><span class="ni-img">${img(n.cover_url, n.title)}</span><span><time>${fmtDate(n.date)}</time><h3>${esc(n.title)}</h3></span></a>`).join('')}</div></div>
    </div></section>` : ''}

    ${d.faqs.length ? `<section class="section"><div class="wrap"><div class="sec-head center-head"><div><h2>الأسئلة الشائعة</h2><p>إجابات سريعة قبل أن تبدأ معنا.</p></div></div>${faqHTML(d.faqs.slice(0, 6))}</div></section>` : ''}

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="trust blend reveal">${bg('assets/img/headquarters.webp', 3)}
        <div><span class="eyebrow">الحوكمة والشفافية</span><h2>الشفافية جزء من عملنا</h2>
          <p>ننشر تقاريرنا وقوائمنا المالية وسياساتنا للجميع، تحت إشراف المركز الوطني لتنمية القطاع غير الربحي.</p>
          <a class="btn btn-gold arrow" href="governance.html">بوابة الحوكمة والشفافية </a></div>
        <div class="doc-links">${Object.entries({ reports: 'التقارير السنوية', financials: 'القوائم المالية', policies: 'السياسات واللوائح', board: 'مجلس الإدارة' }).map(([k, t]) => `<a class="doc-link" href="governance.html#${k}">${bi('doc', 26)}<span>${t}</span></a>`).join('')}</div>
      </div></div></section>`;
  };

  R.about = d => {
    const a = d.site.about || {};
    const person = p => `<figure class="person reveal">${p.photo ? popFig(p.photo, p.name) : `<span class="pp-ph">${bi('youth', 64)}</span>`}<figcaption><b>${esc(p.name)}</b><span>${esc(p.role)}</span></figcaption></figure>`;
    return pageHero('من نحن', a.lead || 'جمعية أهلية في الأحساء تبني شخصية الشباب، وتنمّي قدراتهم المعرفية والمهارية في بيئة آمنة.', [{ t: 'من نحن' }], 'assets/img/group.webp') + `
    <section class="section"><div class="wrap split">
      <div class="reveal"><span class="eyebrow">قصتنا</span><h2 class="h-xl">${esc(a.title || 'مع الشباب حتى ترسو شخصياتهم')}</h2><div class="prose">${paras(a.intro)}</div></div>
      <div class="story-comp reveal"><div class="sc-photo">${img('assets/img/team.webp', 'فريق جمعية رسو')}</div><div class="sc-pop">${popFig('assets/img/people/kids-blue.webp', 'من مستفيدي نادي رسو الصيفي')}</div>
        <div class="sc-badge"><img src="assets/brand/mark.svg" alt="" width="54" height="21"><span>الثبات والرسوخ</span></div></div>
    </div></section>

    <section class="section vm-band blend">${bg('assets/img/expo-talk.webp', 5)}
      <div class="wrap vm">
        <div class="vm-item reveal">${bi('vision', 56, 'vm-ic')}<span class="eyebrow">رؤيتنا</span><p>${esc(a.vision)}</p></div>
        <div class="vm-item reveal">${bi('mission', 56, 'vm-ic')}<span class="eyebrow">رسالتنا</span><p>${esc(a.mission)}</p></div>
      </div></section>

    ${(a.values || []).length ? `<section class="section"><div class="wrap"><div class="sec-head center-head"><div><span class="eyebrow">قيمنا</span><h2>ست قيم نعمل بها</h2></div></div>
      <div class="values">${a.values.map(v => `<div class="value reveal">${bi(VALUE_ICONS[v.title] || 'impact', 52, 'v-ic')}<h3>${esc(v.title)}</h3>${v.text ? `<p>${esc(v.text)}</p>` : ''}</div>`).join('')}</div></div></section>` : ''}

    ${(a.goals || []).length ? `<section class="section alt"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">أهدافنا الاستراتيجية</span><h2>إلى أين نمضي</h2></div></div>
      <div class="goals">${a.goals.map((g, i) => `<div class="goal blend reveal">${bg(GOAL_IMGS[i % 3], 1)}<div class="goal-in"><span class="g-n">0${i + 1}</span>${bi(GOAL_ICONS[i % 3], 44)}<h3>${esc(g)}</h3></div></div>`).join('')}</div></div></section>` : ''}

    <section class="section"><div class="wrap"><div class="sec-head center-head"><div><span class="eyebrow">الهيكل التنظيمي</span><h2>كيف نعمل</h2><p>جمعية عمومية ومجلس إدارة، ومدير تنفيذي تتبعه ثلاث إدارات ووحدتان.</p></div></div>
      <div class="orgchart">
        <div class="oc-chain"><span>الجمعية العمومية</span><span>مجلس الإدارة</span><span class="oc-head">المدير التنفيذي</span></div>
        <div class="oc-units"><span>وحدة التميز المؤسسي</span><span>وحدة التطوع</span></div>
        <div class="oc-depts">${(a.structure || []).filter(s => s.title !== 'الإدارة التنفيذية').map(s => `<div class="oc-dept reveal"><h3>${esc(s.title)}</h3><ul>${(s.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
      </div></div></section>

    ${(a.board || []).length ? `<section class="section people-sec"><div class="wrap"><div class="sec-head center-head"><div><span class="eyebrow">مجلس الإدارة</span><h2>الدورة الأولى 2024م – 2028م</h2></div></div>
      <div class="people board">${a.board.map(p => person(p)).join('')}</div></div></section>` : ''}
    ${(a.team || []).length ? `<section class="section alt"><div class="wrap"><div class="sec-head center-head"><div><span class="eyebrow">فريق العمل</span><h2>الفريق التنفيذي</h2></div></div>
      <div class="people team">${a.team.map(p => person(p)).join('')}</div></div></section>` : ''}

    <section class="section"><div class="wrap"><div class="cta-band blend">${bg('assets/img/programs/environment-5.webp', 3)}<div class="cta-in"><h2>كن جزءاً من الأثر</h2><p>تطوّع، أو ادعم برنامجاً، أو اقترح شراكة.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-gold" href="get-involved.html">شارك معنا</a><a class="btn btn-line-w" href="programs.html">استعرض البرامج</a></div></div></div></div></section>`;
  };

  R.programs = d => {
    const axes = Array.from(new Set(d.programs.map(p => p.axis).filter(Boolean)));
    const feat = d.programs.find(p => p.registration_open) || d.programs.find(p => p.featured) || d.programs[0];
    const paint = list => list.length ? list.map((p, i) => programTile(p, i < 2 ? 'wide' : '')).join('') : '<div class="empty">لا توجد برامج في هذا التصنيف حالياً.</div>';
    setTimeout(() => {
      const bar = $('#progFilter'); if (!bar) return;
      bar.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
        const f = b.dataset.f;
        $('#progGrid').innerHTML = paint(d.programs.filter(p => f === 'all' || (f === 'open' ? p.registration_open : p.axis === f)));
        reveal();
      });
    });
    return pageHero('برامجنا', 'برامج نوعية للشباب والعاملين معهم في المحاور المهارية والقيمية والمعرفية.', [{ t: 'برامجنا' }], 'assets/img/afaq-expo.webp',
      `<div class="ph-stats"><div><b${countAttr(d.programs.length)}>${d.programs.length}</b><span>برنامجاً ومشروعاً</span></div><div><b>3</b><span>محاور: مهاري، قيمي، معرفي</span></div></div>`) + `
    ${feat ? `<section class="section" style="padding-bottom:0"><div class="wrap"><a class="feature blend reveal" href="${progUrl(feat)}">${bg(feat.cover_url, 1, 'center 8%')}
      <div class="feature-in"><span class="eyebrow">${feat.registration_open ? 'التسجيل مفتوح الآن' : 'برنامج مميز'}</span><h2>${esc(feat.title)}</h2><p>${esc(feat.summary)}</p>
        <div class="tags">${feat.axis ? `<span class="tag glass">${esc(feat.axis)}</span>` : ''}${feat.audience ? `<span class="tag glass">${esc(feat.audience)}</span>` : ''}${feat.partner ? `<span class="tag glass">بالشراكة مع ${esc(feat.partner.split('،')[0])}</span>` : ''}</div>
        <span class="btn btn-gold">${feat.registration_open ? 'سجّل الآن' : 'اكتشف البرنامج'}</span></div></a></div></section>` : ''}
    <section class="section"><div class="wrap">
      <div class="tabs" id="progFilter" role="group" aria-label="تصفية البرامج">
        <button type="button" data-f="all" aria-pressed="true">كل البرامج</button>
        <button type="button" data-f="open" aria-pressed="false">التسجيل مفتوح</button>
        ${axes.map(a => `<button type="button" data-f="${esc(a)}" aria-pressed="false">${bi({ 'مهاري': 'skill', 'قيمي': 'gem', 'معرفي': 'book' }[a] || 'impact', 20)} ${esc(a)}</button>`).join('')}
      </div>
      <div class="tiles tiles-progs" id="progGrid">${paint(d.programs)}</div>
    </div></section>`;
  };

  R.program = d => {
    const key = qs('p');
    const p = d.programs.find(x => x.slug === key || x.id === key) || d.programs[0];
    if (!p) return pageHero('البرنامج غير موجود', '', [{ t: 'برامجنا', href: 'programs.html' }]);
    document.title = p.title + ' — جمعية رسو لبناء الشخصية';
    const facts = [['الفئة', p.audience], ['المدة', p.duration], ['المكان', p.location], ['المقاعد', p.seats]].filter(f => f[1]);
    const outcomes = p.outcomes || [];
    const regHref = p.register_url || '#register';
    return `<section class="page-hero blend prog-top">${bg(p.cover_url || 'assets/img/audience.webp', 0)}
      <div class="wrap ph-in">
        <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">/</span><a href="programs.html">برامجنا</a><span aria-hidden="true">/</span><span>${esc(p.title)}</span></nav>
        <div class="tags" style="margin-bottom:14px">${p.axis ? `<span class="tag glass">${esc(p.axis)}</span>` : ''}${statusTag(p)}</div>
        <h1>${esc(p.title)}</h1><p class="lead">${esc(p.summary)}</p>
        <div class="hero-actions" style="margin-top:26px">
          ${p.registration_open ? `<a class="btn btn-gold" href="${esc(regHref)}"${p.register_url ? ' target="_blank" rel="noopener"' : ''}>سجّل في البرنامج</a>` : ''}
          <a class="btn btn-line-w" href="support.html?program=${encodeURIComponent(p.slug || p.id)}">ادعم هذا البرنامج</a>
        </div>
        ${p.partner ? `<p class="ph-partner">بالشراكة مع <b>${esc(p.partner)}</b></p>` : ''}
      </div></section><div class="zigzag" aria-hidden="true"></div>
    ${facts.length ? `<div class="wrap"><div class="facts">${facts.map(f => `<div class="fact"><small>${f[0]}</small><b>${esc(f[1])}</b></div>`).join('')}</div></div>` : ''}
    <section class="section prog-body"><div class="wrap prog-split">
      <div class="prose">${paras(p.body || p.summary)}</div>
      ${p.cover_url ? `<figure class="main-photo reveal">${img(p.cover_url, p.title)}<figcaption>${esc(p.title)}</figcaption></figure>` : ''}
    </div></section>
    ${outcomes.length ? `<section class="section blend outcomes-band">${bg(p.cover_url, 6)}<div class="wrap"><div class="sec-head"><div><h2>ماذا ستكتسب من الرحلة</h2></div></div>
      <div class="outcomes">${outcomes.map((o, i) => `<div class="outcome reveal"><span class="g-n">0${i + 1}</span><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join('')}</div></div></section>` : ''}
    ${(p.gallery || []).length ? `<section class="section"><div class="wrap"><div class="sec-head"><h2>من البرنامج</h2></div><div class="gallery">${p.gallery.map(g => img(g, p.title)).join('')}</div></div></section>` : ''}
    ${(p.faqs || []).length ? `<section class="section alt"><div class="wrap"><div class="sec-head center-head"><h2>أسئلة عن البرنامج</h2></div>${faqHTML(p.faqs.map(f => ({ question: f.q, answer: f.a })))}</div></section>` : ''}
    ${p.registration_open && !p.register_url ? `<section class="section alt" id="register"><div class="wrap">
      ${formSplit('registration', { img: p.cover_url, icon: 'youth', title: 'سجّل في ' + p.title, text: 'عبّئ النموذج وسيتواصل معك فريق البرنامج لتأكيد التسجيل.', points: ['عبّئ بياناتك', 'يتواصل معك فريق البرنامج', 'تبدأ رحلتك معنا'] }, { program_id: p.id && /^[0-9a-f-]{36}$/.test(p.id) ? p.id : '', ref_title: p.title }, d)}</div></section>` : `
      <section class="section"><div class="wrap"><div class="cta-band blend">${bg(p.cover_url, 4)}<div class="cta-in"><h2>تابع البرامج القادمة</h2><p>اشترك في النشرة البريدية ليصلك إعلان التسجيل في البرامج الجديدة.</p><a class="btn btn-gold" href="#nlEmail">اشترك في النشرة</a></div></div></div></section>`}`;
  };

  R.news = d => {
    const n0 = d.news[0];
    if (!n0) return pageHero('المركز الإعلامي', 'أخبار الجمعية وبرامجها وفعالياتها.', [{ t: 'المركز الإعلامي' }]) + '<section class="section"><div class="wrap"><div class="empty">لا توجد أخبار بعد.</div></div></section>';
    return `<section class="news-hero blend">${bg(n0.cover_url, 0)}
      <div class="wrap ph-in">
        <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">/</span><span>المركز الإعلامي</span></nav>
        <span class="eyebrow">آخر خبر · ${fmtDate(n0.date)}</span>
        <h1>${esc(n0.title)}</h1><p class="lead">${esc(n0.excerpt)}</p>
        <a class="btn btn-gold" href="${newsUrl(n0)}">اقرأ الخبر</a>
      </div></section><div class="zigzag" aria-hidden="true"></div>
    <section class="section"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">المركز الإعلامي</span><h2>كل الأخبار</h2></div></div>
      <div class="tiles tiles-news">${d.news.slice(1).map((n, i) => newsTile(n, i % 5 === 0 ? 'wide' : '')).join('')}</div>
    </div></section>`;
  };

  R.article = d => {
    const key = qs('n');
    const n = d.news.find(x => x.slug === key || x.id === key) || d.news[0];
    if (!n) return pageHero('الخبر غير موجود', '', [{ t: 'المركز الإعلامي', href: 'news.html' }]);
    document.title = n.title + ' — جمعية رسو';
    const more = d.news.filter(x => x !== n).slice(0, 3);
    return pageHero(n.title, '', [{ t: 'المركز الإعلامي', href: 'news.html' }, { t: fmtDate(n.date) }], n.cover_url) + `
    <section class="section"><div class="wrap"><article class="article">
      ${n.cover_url ? `<figure class="main-photo art-photo">${img(n.cover_url, n.title)}</figure>` : ''}
      <time class="art-date">${bi('calendar', 20)} ${fmtDate(n.date)}</time>
      <div class="prose" style="margin-top:12px">${paras(n.body || n.excerpt)}</div>
    </article></div></section>
    ${more.length ? `<section class="section alt"><div class="wrap"><div class="sec-head"><h2>أخبار أخرى</h2></div><div class="tiles tiles-news">${more.map(x => newsTile(x)).join('')}</div></div></section>` : ''}`;
  };

  R.involved = d => {
    const vol = d.opportunities.filter(o => o.kind === 'volunteer' && o.is_open !== false);
    const jobs = d.opportunities.filter(o => o.kind === 'job' && o.is_open !== false);
    const stats = d.site.stats || [];
    const st = k => stats.find(s => s.label.includes(k));
    const opp = o => `<div class="opp reveal"><h3>${esc(o.title)}</h3><p>${esc(o.description)}</p><div class="meta">${o.location ? `<span>${esc(o.location)}</span>` : ''}${o.commitment ? `<span>${esc(o.commitment)}</span>` : ''}${o.deadline ? `<span>آخر موعد: ${fmtDate(o.deadline)}</span>` : ''}</div><a class="btn btn-line btn-sm" style="align-self:flex-start" href="#${o.kind === 'job' ? 'job' : 'volunteer'}-form" data-pick="${esc(o.title)}">قدّم الآن</a></div>`;
    setTimeout(() => document.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
      const f = $(b.getAttribute('href') + ' [name=ref_title]'); if (f) f.value = b.dataset.pick;
    })));
    return pageHero('شارك معنا', 'تطوّع، أو انضم لفريق العمل، أو كن شريكاً في صناعة الأثر.', [{ t: 'شارك معنا' }], 'assets/img/programs/volunteering.webp',
      `<div class="ph-stats">${[st('متطوع'), st('تطوعية'), st('شراكة')].filter(Boolean).map(s => `<div><b${countAttr(s.value)}>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
       <div class="ph-jump"><a href="#volunteer">التطوع</a><a href="#jobs">الوظائف</a><a href="#partner">الشراكات</a></div>`) + `
    <section class="section" id="volunteer"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">التطوع</span><h2>الفرص التطوعية</h2><p>نؤمن أن التطوع يبني شخصية المتطوع قبل أن يخدم غيره، وتُدار الفرص وفق لائحة العمل التطوعي في الجمعية.</p></div></div>
      ${vol.length ? `<div class="opps">${vol.map(opp).join('')}</div>` : ''}
      <div id="volunteer-form">${formSplit('volunteer', { img: 'assets/img/programs/volunteering.webp', icon: 'volunteer', title: 'سجّل اهتمامك بالتطوع', text: vol.length ? 'اختر الفرصة المناسبة أو سجّل اهتمامك العام.' : 'لا توجد فرص منشورة الآن — سجّل اهتمامك وسنتواصل معك عند توفر فرصة تناسبك.', points: ['سجّل بياناتك ومهاراتك', 'تتواصل معك وحدة التطوع', 'تشارك في برامج الجمعية وفعالياتها'], iconSize: 96, stats: (d.site.stats || []).filter(s => /متطوع|تطوعية/.test(s.label)).slice(0, 2) })}</div>
    </div></section>
    <section class="section alt" id="jobs"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">الوظائف</span><h2>الوظائف المتاحة</h2></div></div>
      ${jobs.length ? `<div class="opps">${jobs.map(opp).join('')}</div><div id="job-form" style="margin-top:32px">${formSplit('job', { img: 'assets/img/team.webp', icon: 'building', title: 'التقديم على وظيفة', text: 'أرفق رابط سيرتك الذاتية وسيتواصل معك فريق الموارد البشرية.' })}</div>` : '<div class="empty">لا توجد وظائف شاغرة حالياً. تابع حساباتنا لمعرفة الفرص القادمة.</div>'}
    </div></section>
    <section class="section" id="partner"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">الشراكات</span><h2>كن شريكاً</h2><p>نعمل مع الجهات المانحة والقطاع الخاص والجهات الحكومية لتصميم برامج نوعية للشباب، مع تقارير أثر دورية.</p></div></div>
      ${formSplit('partnership', { img: 'assets/img/certificate.webp', icon: 'handshake', title: 'لنصنع أثراً معاً', text: 'رعاية برنامج، منحة، شراكة تنفيذية، أو تطوع مؤسسي — مع تقارير أثر دورية لكل شراكة.', points: ['أرسل فكرة الشراكة', 'نجهّز معك تصوراً للبرنامج', 'ننفّذ ونرفع تقارير الأثر'] })}
      ${d.partners.length ? `<div class="partner-wall">${partnerLogos(d.partners)}</div>` : ''}
    </div></section>`;
  };

  R.support = d => {
    const s = d.site.support || {};
    const progKey = qs('program');
    const prog = d.programs.find(p => p.slug === progKey || p.id === progKey);
    return pageHero('ادعم رسو', 'دعمك يصنع برنامجاً، ويبني شخصية شاب، ويمتد أثره لمجتمع كامل.', [{ t: 'ادعم رسو' }], 'assets/img/certificate.webp') + `
    <section class="section"><div class="wrap">
      <div class="support-ways">
        <div class="way reveal">${bi('heart', 44, 'w-ic')}<h3>تبرّع مباشر</h3><p>حوّل دعمك مباشرة إلى حساب الجمعية الرسمي.</p>
          ${s.iban ? `<div><small style="color:var(--muted)">${esc(s.bank || '')} — ${esc(s.account_name || 'جمعية رسو لبناء الشخصية')}</small><div class="iban"><span>${esc(s.iban)}</span><button type="button" data-copy="${esc(s.iban)}">نسخ</button></div></div>` : '<p style="color:var(--muted);font-size:14.5px">يُضاف رقم الآيبان المعتمد قريباً.</p>'}
          ${s.donate_url ? `<a class="btn btn-gold" href="${esc(s.donate_url)}" target="_blank" rel="noopener">تبرّع إلكترونياً</a>` : ''}</div>
        <div class="way reveal">${bi('target', 44, 'w-ic')}<h3>ادعم برنامجاً بعينه</h3><p>وجّه دعمك لبرنامج محدد، ويُصرف في البرنامج نفسه وفق سياسة توجيه التبرع إلى مشروع، مع تقرير أثر.</p><a class="btn btn-line" href="#support-form">اطلب تفاصيل الدعم</a></div>
        <div class="way reveal">${bi('handshake', 44, 'w-ic')}<h3>شراكة ورعاية</h3><p>رعاية برنامج كامل أو تصميم برنامج جديد مع الجمعية لفئة تهمّ جهتكم.</p><a class="btn btn-line" href="get-involved.html#partner">تواصل للشراكة</a></div>
      </div>
    </div></section>
    <section class="section alt" id="support-form"><div class="wrap">
      ${formSplit('support', { img: prog ? prog.cover_url : 'assets/img/programs/summer.webp', icon: 'heart', title: prog ? 'ادعم ' + prog.title : 'طلب دعم برنامج', text: 'اترك بياناتك وسيتواصل معك فريق تنمية الموارد المالية بتفاصيل الاحتياج والأثر المتوقع.', points: ['تختار البرنامج', 'نرسل لك تفاصيل الاحتياج', 'تصلك تقارير الأثر'] }, { ref_title: prog ? prog.title : '' }, d)}</div></section>`;
  };

  R.governance = d => {
    const groups = {};
    d.documents.forEach(doc => { (groups[doc.category] = groups[doc.category] || []).push(doc); });
    const order = ['reports', 'financials', 'policies', 'board', 'other'];
    return pageHero('الحوكمة والشفافية', 'تقاريرنا وقوائمنا المالية وسياساتنا ولوائحنا متاحة للجميع.', [{ t: 'الحوكمة والشفافية' }], 'assets/img/headquarters.webp',
      `<div class="ph-jump">${order.filter(k => groups[k]).map(k => `<a href="#${k}">${DOC_CATS[k]}</a>`).join('')}</div>`) + `
    <section class="section"><div class="wrap">
      <div class="license-strip reveal">${bi('building', 44)}<div><b>جمعية أهلية مرخّصة</b><span>مسجّلة في المركز الوطني لتنمية القطاع غير الربحي برقم ${esc(d.site.org.license || '0000000000')}، وقوائمها المالية مراجَعة من مراجع قانوني مستقل.</span></div></div>
      <div class="docs-groups">${order.filter(k => groups[k]).map(k => `<div class="docs-group" id="${k}"><h2>${DOC_CATS[k]} <small>${groups[k].length}</small></h2><div class="doc-grid">
        ${groups[k].map(doc => `<a class="doc-row" href="${esc(doc.url)}" target="_blank" rel="noopener">${bi('doc', 30)}<span class="t">${esc(doc.title)}${doc.year ? `<small>${esc(doc.year)}</small>` : ''}</span><span class="dl">PDF</span></a>`).join('')}</div></div>`).join('') || '<div class="empty">تُنشر الوثائق قريباً.</div>'}</div>
    </div></section>`;
  };

  R.contact = d => {
    const c = d.site.contact || {};
    return pageHero('تواصل معنا', 'يسعدنا تواصلك — نرد خلال أيام العمل.', [{ t: 'تواصل معنا' }], 'assets/img/headquarters.webp') + `
    <section class="section"><div class="wrap">
      <div class="contact-cards">
        ${c.phone ? `<a class="cc reveal" href="tel:${esc(c.phone)}">${socialIcon('phone')}<small>الهاتف</small><b dir="ltr">${esc(c.phone)}</b></a>` : ''}
        ${c.whatsapp ? `<a class="cc reveal" href="https://wa.me/${esc(String(c.whatsapp).replace(/\D/g, '').replace(/^0/, '966'))}" target="_blank" rel="noopener">${socialIcon('whatsapp')}<small>واتساب</small><b dir="ltr">${esc(c.whatsapp)}</b></a>` : ''}
        ${c.email ? `<a class="cc reveal" href="mailto:${esc(c.email)}">${socialIcon('mail')}<small>البريد الإلكتروني</small><b>${esc(c.email)}</b></a>` : ''}
        <div class="cc reveal">${socialIcon('pin')}<small>العنوان</small><b>${esc(c.address)}</b>${c.hours ? `<span>${esc(c.hours)}</span>` : ''}</div>
      </div>
      ${c.map_embed ? `<div class="map"><iframe src="${esc(c.map_embed)}" loading="lazy" title="موقع الجمعية على الخريطة" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
      <div style="margin-top:40px">${formSplit('contact', { img: 'assets/img/question.webp', icon: 'communication', title: 'أرسل رسالتك', text: 'اكتب استفسارك أو اقتراحك أو ملاحظتك، وتصل مباشرة للفريق المختص.' })}</div>
    </div></section>`;
  };

  R.privacy = d => pageHero('سياسة الخصوصية', 'كيف نتعامل مع بياناتك.', [{ t: 'سياسة الخصوصية' }], 'assets/img/headquarters.webp') + `
    <section class="section"><div class="wrap"><div class="prose">${paras((d.site.privacy || {}).text || '')}</div></div></section>`;

  R.notfound = () => pageHero('الصفحة غير موجودة', 'ربما نُقلت الصفحة أو تغيّر رابطها.', []) + `<section class="section center"><div class="wrap"><a class="btn btn-teal" href="index.html">العودة للرئيسية</a></div></section>`;

  /* ═════════ النماذج ═════════ */
  const FORMS = {
    contact: { title: 'أرسل رسالة', btn: 'إرسال', fields: [['name', 'الاسم', 'text', 1], ['email', 'البريد الإلكتروني', 'email', 1], ['phone', 'رقم الجوال', 'tel', 0], ['subject', 'الموضوع', 'select:استفسار عام|البرامج والتسجيل|التطوع|الشراكات والدعم|اقتراح|شكوى', 0], ['message', 'رسالتك', 'textarea', 1]] },
    volunteer: { title: 'سجّل اهتمامك بالتطوع', btn: 'إرسال الطلب', fields: [['name', 'الاسم الكامل', 'text', 1], ['phone', 'رقم الجوال', 'tel', 1], ['email', 'البريد الإلكتروني', 'email', 0], ['ref_title', 'الفرصة المطلوبة', 'text', 0], ['gender', 'الجنس', 'select:ذكر|أنثى', 1], ['age', 'العمر', 'number', 0], ['skills', 'المهارات والخبرات', 'textarea', 0], ['availability', 'الوقت المتاح للتطوع', 'select:أيام الأسبوع مساءً|نهاية الأسبوع|حسب الفعالية', 0]] },
    job: { title: 'التقديم على وظيفة', btn: 'إرسال الطلب', fields: [['name', 'الاسم الكامل', 'text', 1], ['phone', 'رقم الجوال', 'tel', 1], ['email', 'البريد الإلكتروني', 'email', 1], ['ref_title', 'الوظيفة', 'text', 1], ['cv_url', 'رابط السيرة الذاتية (Google Drive أو LinkedIn)', 'url', 1], ['message', 'نبذة مختصرة', 'textarea', 0]] },
    registration: { title: '', btn: 'تأكيد التسجيل', fields: [['name', 'الاسم الكامل', 'text', 1], ['phone', 'رقم الجوال', 'tel', 1], ['email', 'البريد الإلكتروني', 'email', 0], ['gender', 'الجنس', 'select:ذكر|أنثى', 1], ['age', 'العمر', 'number', 1], ['city', 'المدينة', 'text', 0], ['occupation', 'الصفة', 'select:طالب ثانوي|طالب جامعي|خريج|عامل مع الشباب|أخرى', 0], ['message', 'لماذا تريد الانضمام؟', 'textarea', 0]] },
    partnership: { title: 'طلب شراكة', btn: 'إرسال', fields: [['org', 'اسم الجهة', 'text', 1], ['name', 'اسم المسؤول', 'text', 1], ['phone', 'رقم الجوال', 'tel', 1], ['email', 'البريد الإلكتروني', 'email', 1], ['type', 'نوع الشراكة', 'select:رعاية برنامج|تمويل منحة|شراكة تنفيذية|تطوع مؤسسي|أخرى', 0], ['message', 'تفاصيل مختصرة', 'textarea', 0]] },
    support: { title: '', btn: 'إرسال', fields: [['name', 'الاسم / الجهة', 'text', 1], ['phone', 'رقم الجوال', 'tel', 1], ['email', 'البريد الإلكتروني', 'email', 0], ['ref_title', 'البرنامج المراد دعمه', 'program', 0], ['amount', 'المبلغ المتوقع (اختياري)', 'text', 0], ['message', 'ملاحظات', 'textarea', 0]] },
  };
  const CORE = ['name', 'email', 'phone', 'message', 'ref_title', 'program_id'];
  function formHTML(kind, preset = {}, d = _data) {
    const F = FORMS[kind];
    const field = ([n, l, t, req]) => {
      const full = t === 'textarea' || n === 'message' ? ' full' : '';
      const r = req ? ' required' : '';
      const lab = `<label for="f_${kind}_${n}">${l}${req ? '' : ' <span class="opt">(اختياري)</span>'}</label>`;
      const v = preset[n] ? ` value="${esc(preset[n])}"` : '';
      if (t === 'textarea') return `<div class="field${full}">${lab}<textarea id="f_${kind}_${n}" name="${n}"${r}></textarea></div>`;
      if (t.startsWith('select:')) return `<div class="field">${lab}<select id="f_${kind}_${n}" name="${n}"${r}><option value="">اختر</option>${t.slice(7).split('|').map(o => `<option>${o}</option>`).join('')}</select></div>`;
      if (t === 'program') return `<div class="field">${lab}<select id="f_${kind}_${n}" name="${n}"><option value="">دعم عام للجمعية</option>${((d && d.programs) || []).map(p => `<option${preset.ref_title === p.title ? ' selected' : ''}>${esc(p.title)}</option>`).join('')}</select></div>`;
      const ac = { name: 'name', email: 'email', phone: 'tel' }[n];
      return `<div class="field">${lab}<input id="f_${kind}_${n}" name="${n}" type="${t}"${r}${v}${ac ? ` autocomplete="${ac}"` : ''}${t === 'tel' ? ' inputmode="tel" dir="ltr"' : ''}></div>`;
    };
    return `<form class="form-card" data-form="${kind}" novalidate>
      ${F.title ? `<h3 style="font-size:23px;margin-bottom:18px">${F.title}</h3>` : ''}
      <div class="form-grid">${F.fields.map(field).join('')}</div>
      ${preset.program_id ? `<input type="hidden" name="program_id" value="${esc(preset.program_id)}">` : ''}
      ${preset.ref_title && !F.fields.some(f => f[0] === 'ref_title') ? `<input type="hidden" name="ref_title" value="${esc(preset.ref_title)}">` : ''}
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div style="margin-top:20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn btn-teal" type="submit">${F.btn}</button></div>
      <p class="form-note">نستخدم بياناتك للتواصل معك بخصوص طلبك فقط، وفق <a href="privacy.html">سياسة الخصوصية</a>.</p>
      <div class="form-msg" role="status" aria-live="polite"></div>
    </form>`;
  }

  function bindForms() {
    document.addEventListener('submit', async e => {
      const form = e.target.closest('form[data-form]'); if (!form) return;
      e.preventDefault();
      const kind = form.dataset.form;
      const msg = form.querySelector('.form-msg') || form.nextElementSibling;
      const say = (t, ok) => { if (msg) { msg.textContent = t; msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); } };
      if (form.website && form.website.value) return; // فخ الروبوتات
      const bad = Array.from(form.querySelectorAll('[required]')).find(i => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
      if (bad) { bad.focus(); say('فضلاً أكمل الحقل: ' + ((form.querySelector(`label[for="${bad.id}"]`) || {}).textContent || bad.name || 'البريد').replace('(اختياري)', '').trim(), false); return; }
      if (!LIVE) { say('النماذج تُفعَّل عند ربط الموقع بقاعدة البيانات. للتواصل الآن استخدم الهاتف أو البريد.', false); return; }
      const btn = form.querySelector('[type=submit]'); btn.disabled = true;
      const fd = Object.fromEntries(new FormData(form).entries()); delete fd.website;
      try {
        if (kind === 'newsletter') {
          await restInsert('subscribers', { email: fd.email.trim().toLowerCase(), source: 'website' });
        } else {
          const row = { kind, name: fd.name || fd.org || '', email: fd.email || '', phone: fd.phone || '', message: fd.message || '', ref_title: fd.ref_title || '', payload: {} };
          if (fd.program_id) row.program_id = fd.program_id;
          Object.keys(fd).forEach(k => { if (!CORE.includes(k) && fd[k]) row.payload[k] = fd[k]; });
          await restInsert('submissions', row);
        }
        form.reset();
        say(kind === 'newsletter' ? 'تم اشتراكك — شكراً لك.' : 'وصلنا طلبك — شكراً لك، سنتواصل معك قريباً.', true);
      } catch (err) {
        say(/duplicate|23505/.test(String(err)) ? 'هذا البريد مشترك مسبقاً.' : 'تعذّر الإرسال، حاول مرة أخرى بعد قليل.', /duplicate|23505/.test(String(err)));
      } finally { btn.disabled = false; }
    });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-copy]'); if (!b) return;
      navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = 'تم النسخ'; setTimeout(() => b.textContent = 'نسخ', 1600); });
    });
  }

  /* ═════════ حركة ═════════ */
  function countUp() {
    const els = document.querySelectorAll('[data-count]:not([data-done])');
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = el => {
      el.setAttribute('data-done', '1');
      const to = parseFloat(el.dataset.count), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      if (reduce || !isFinite(to)) return;
      const dur = 1800, t0 = performance.now();
      const tick = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.textContent = pre + Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(tick); };
      el.textContent = pre + '0' + suf; requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }), { threshold: .4 });
    els.forEach(e => io.observe(e));
  }
  function reveal() {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ═════════ الإقلاع ═════════ */
  async function boot() {
    header();
    const main = document.getElementById('main');
    main.innerHTML = '<div class="wrap" style="padding:80px 24px"><div class="skeleton"></div></div>';
    const d = await data();
    main.innerHTML = (R[PAGE] || R.notfound)(d);
    footer(d);
    bindForms();
    reveal();
    countUp();
    if (location.hash) { const t = document.querySelector(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 60); }
  }
  boot();
})();
