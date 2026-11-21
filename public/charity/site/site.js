/*
 * site.js — موقع الجمعيّة العامّ (نظام الجمعيات). صفحة واحدة تبني الموقع كاملاً من بيانات الجمعيّة.
 * ─────────────────────────────────────────────────────────────────────────
 * الأوضاع:
 *   ?s=<slug>          ← الموقع الحقيقيّ (الدالّة api ‏GET /site) — أو نطاق الجمعيّة نفسه (host)
 *   ?preview=1         ← معاينة حيّة داخل «موقع الجمعيّة» في النظام (البيانات بـpostMessage من الأب)
 *   ?demo=1[&t=قالب]   ← جمعيّة نموذجيّة لعرض القوالب
 * القوالب: noor (نقاء) · athar (أثر) · waqar (وقار) — الأقسام نفسها، والشكل من site.css حسب body[data-t].
 * الأقسام وترتيبها وإظهارها من settings.site.sections، والفارغ منها يختفي تلقائياً.
 * ⚠️ كلّ نصّ من البيانات يمرّ بـesc، والروابط بـsafeUrl (https فقط).
 */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const OWN = LOCAL || /(^|\.)ibrahimsaud\.com$/.test(location.hostname);
  const API = LOCAL ? 'https://br-red-smoke-baq7yp0d-api.compute.c-8.eu-central-1.aws.neon.tech' : 'https://br-dark-band-bajth6rv-api.compute.c-8.eu-central-1.aws.neon.tech';
  const MODE = Q.get('preview') ? 'preview' : Q.get('demo') ? 'demo' : 'live';
  const KEY = OWN ? { s: (Q.get('s') || '').toLowerCase() } : { host: location.hostname };
  const $app = document.getElementById('app');

  /* القوالب: الثلاثة الأولى تعيد تلوين الهيكل الأساسيّ، والبقيّة لكلّ منها هيكله الخاصّ في t/<id>.js + t/<id>.css */
  const TEMPLATES = { noor: { n: 'نقاء', font: 'ts' }, athar: { n: 'أثر', font: 'ts' }, waqar: { n: 'وقار', font: 'ts' },
    sahifa: { n: 'صحيفة', font: 'amiri', own: 1 }, mashrabiya: { n: 'مشربيّة', font: 'reem', own: 1 }, arqam: { n: 'أرقام', font: 'alexandria', own: 1 } };
  /* الخطوط: كلّها من Google Fonts برخصة OFL (مجانيّة للاستخدام التجاريّ) عدا ثمانية (مستضافة هنا) */
  const FONTS = {
    ts: { n: 'ثمانية', h: 'TS', b: 'TS' },
    plex: { n: 'بلكس', h: '"IBM Plex Sans Arabic"', b: '"IBM Plex Sans Arabic"', g: ['IBM+Plex+Sans+Arabic:wght@400;500;700'] },
    tajawal: { n: 'تجوال', h: 'Tajawal', b: 'Tajawal', g: ['Tajawal:wght@400;500;700;800'] },
    almarai: { n: 'المراعي', h: 'Almarai', b: 'Almarai', g: ['Almarai:wght@400;700;800'] },
    kufi: { n: 'كوفيّ رسميّ', h: '"Noto Kufi Arabic"', b: '"IBM Plex Sans Arabic"', g: ['Noto+Kufi+Arabic:wght@500;700;800', 'IBM+Plex+Sans+Arabic:wght@400;500;700'] },
    amiri: { n: 'أميري', h: 'Amiri', b: '"Noto Naskh Arabic"', g: ['Amiri:wght@400;700', 'Noto+Naskh+Arabic:wght@400;500;700'] },
    reem: { n: 'ريم الكوفيّ', h: '"Reem Kufi"', b: '"Noto Naskh Arabic"', g: ['Reem+Kufi:wght@500;600;700', 'Noto+Naskh+Arabic:wght@400;500;700'] },
    messiri: { n: 'المسيري', h: '"El Messiri"', b: '"El Messiri"', g: ['El+Messiri:wght@400;500;700'] },
    alexandria: { n: 'ألكسندريا', h: 'Alexandria', b: '"Readex Pro"', g: ['Alexandria:wght@500;700;800;900', 'Readex+Pro:wght@300;400;500;700'] },
    readex: { n: 'ريدكس', h: '"Readex Pro"', b: '"Readex Pro"', g: ['Readex+Pro:wght@300;400;500;700'] },
  };
  const REG = {};   // تعريفات القوالب ذات الهيكل الخاصّ — تسجّل نفسها عبر window.SiteT
  const SECTIONS = { impact: 'أثرنا', about: 'من نحن', programs: 'برامجنا', stories: 'قصص وشهادات', news: 'الأخبار', join: 'تطوّع معنا', donate: 'ادعمنا', governance: 'الحوكمة والشفافية', partners: 'شركاؤنا', faq: 'الأسئلة الشائعة', contact: 'تواصل معنا' };
  const ORDER = ['impact', 'about', 'programs', 'stories', 'news', 'join', 'donate', 'governance', 'partners', 'faq', 'contact'];
  const DOC_CATS = { reports: 'التقارير السنويّة وتقارير البرامج', financials: 'القوائم الماليّة', policies: 'السياسات واللوائح', board: 'مجلس الإدارة والجمعيّة العموميّة', other: 'الهيكل والأدلّة التنظيميّة' };
  let D = null, CFG = null;

  /* ═════════ أدوات ═════════ */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => { u = String(u || '').trim(); return /^https:\/\//i.test(u) || /^mailto:|^tel:/i.test(u) ? u : ''; };
  const imgUrl = u => { u = String(u || '').trim(); return /^https:\/\//i.test(u) || /^data:image\//i.test(u) || (LOCAL && /^http:\/\//.test(u)) ? u : ''; };
  const paras = t => String(t || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  const lines = v => Array.isArray(v) ? v.filter(Boolean) : String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
  const fmtD = d => { try { return new Date(String(d).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return d || ''; } };
  const waLink = n => { const d = String(n || '').replace(/\D/g, '').replace(/^00/, '').replace(/^0(5\d{8})$/, '966$1'); return d.length >= 9 ? 'https://wa.me/' + d : ''; };
  /* الحرف الأوّل من الاسم بعد اللقب (أ. د. م. الشيخ…) */
  const initial = n => String(n || '').trim().replace(/^((أ|د|م|ا)\.\s*|(الأستاذ|الأستاذة|الدكتور|الدكتورة|المهندس|الشيخ)\s+)+/, '').charAt(0) || '؟';
  const P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const IC = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    back: '<path d="M5 12h14M12 5l7 7-7 7"/>', chev: '<path d="m15 18-6-6 6-6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 0-1 1.03V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
    wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8.5 9.5c.3 2.2 2.4 4.6 5 5.2l1.2-1.2 2 1-.4 1.6c-3.9.6-8.6-4-8.2-8l1.6-.4 1 2z"/>',
    grad: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0zM22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9ZM11 3 8 9l4 13 4-13-3-6M2 9h20"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    xlogo: '<path d="M4 4l11.73 16H20L8.27 4zM4 20l6.77-6.77M13.23 10.77 20 4"/>',
    insta: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>',
    yt: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    li: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
    hand: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
  };
  const ic = (n, c) => `<svg class="ic${c ? ' ' + c : ''}" viewBox="0 0 24 24" ${P} aria-hidden="true">${IC[n] || ''}</svg>`;

  /* اللون: نصّ أبيض أو داكن فوقه حسب الإضاءة */
  function inkOn(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#fff';
    const n = parseInt(m[1], 16), ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return (.2126 * ch[0] + .7152 * ch[1] + .0722 * ch[2]) > .45 ? '#14161A' : '#fff';
  }

  /* ═════════ الإعدادات الفعليّة (افتراضات ذكيّة فوق ما حفظته الجمعيّة) ═════════ */
  function config(d) {
    const st = d.settings || {}, site = st.site || {}, p = d.profile || {};
    const color = /^#[0-9a-f]{6}$/i.test(site.color || '') ? site.color : /^#[0-9a-f]{6}$/i.test(p.brandColor || '') ? p.brandColor : '#0B7F86';
    const list = Array.isArray(site.sections) && site.sections.length ? site.sections.filter(x => SECTIONS[x.id]) : ORDER.map(id => ({ id, on: true }));
    ORDER.forEach(id => { if (!list.find(x => x.id === id)) list.push({ id, on: true }); });
    const contact = Object.assign({ phone: p.phone, email: p.email, address: [p.city, p.address].filter(Boolean).join(' — ') }, clean(st.contact));
    const support = Object.assign({ bank: p.bankName, account_name: p.accName || d.name, iban: p.iban }, clean(st.support));
    const t = TEMPLATES[site.template] ? site.template : 'noor';
    return { t, font: FONTS[site.font] ? site.font : TEMPLATES[t].font, color, ink: inkOn(color), sections: list, hero: st.hero || {}, stats: Array.isArray(st.stats) ? st.stats.filter(x => x && x.value && x.label) : [],
      asof: st.stats_asof || '', contact, social: clean(st.social), support, about: st.about || {}, logo: imgUrl(site.logo || p.logo), short: p.shortName || d.name };
  }
  function clean(o) { const r = {}; Object.entries(o || {}).forEach(([k, v]) => { if (v != null && v !== '') r[k] = v; }); return r; }

  /* أيّ قسم فيه محتوى فعلاً؟ — الفارغ لا يظهر في الموقع ولا القائمة */
  function has(id) {
    const p = D.profile || {}, C = CFG;
    switch (id) {
      case 'impact': return C.stats.length > 0;
      case 'about': return !!(p.vision || p.mission || lines(p.values).length || lines(p.goals).length || C.about.text);
      case 'programs': return (D.programs || []).length > 0;
      case 'stories': return (D.testimonials || []).length > 0;
      case 'news': return (D.news || []).length > 0;
      case 'join': return true;
      case 'donate': return !!(C.support.iban || safeUrl(C.support.donate_url));
      case 'governance': return !!(p.license || (p.board || []).length || (D.documents || []).length);
      case 'partners': return (D.partners || []).length > 0;
      case 'faq': return (D.faqs || []).length > 0;
      case 'contact': return true;
    }
    return false;
  }
  const visible = () => CFG.sections.filter(x => x.on !== false && has(x.id)).map(x => x.id);

  /* ═════════ الهيكل ═════════ */
  function header() {
    const nav = visible().filter(id => !['impact', 'stories', 'partners'].includes(id)).slice(0, 7);
    const donate = visible().includes('donate');
    return `<header class="hd" id="hd"><div class="wrap hd-in">
      <a class="brand" href="#top" data-go="top">${CFG.logo ? `<img src="${esc(CFG.logo)}" alt="شعار ${esc(D.name)}">` : `<span class="brand-mark">${esc((CFG.short || D.name).trim().charAt(0))}</span>`}<span class="brand-n">${esc(CFG.short)}</span></a>
      <nav class="hd-nav" aria-label="أقسام الموقع">${nav.map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav>
      <div class="hd-act">${donate ? `<a class="btn btn-c sm" href="#donate" data-go="donate">${ic('heart')} ادعمنا</a>` : ''}
        <button class="hd-menu" type="button" aria-label="القائمة" aria-expanded="false" data-menu>${ic('menu')}</button></div></div>
      <div class="sheet" id="sheet" hidden><div class="sheet-in">${nav.map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}${ic('chev')}</a>`).join('')}</div></div></header>`;
  }
  function hero() {
    const h = CFG.hero, p = D.profile || {};
    const title = h.title_html ? sanitizeTitle(h.title_html) : esc(D.name);
    const lead = h.lead || p.mission || '';
    const img = imgUrl(h.image);
    const st = CFG.stats.slice(0, 2);
    const ctas = `${visible().includes('donate') ? `<a class="btn btn-c" href="#donate" data-go="donate">${ic('heart')} ادعم رسالتنا</a>` : ''}
      ${visible().includes('programs') ? `<a class="btn btn-ghost" href="#programs" data-go="programs">تعرّف على برامجنا</a>` : `<a class="btn btn-ghost" href="#contact" data-go="contact">تواصل معنا</a>`}`;
    return `<section class="hero${img ? ' has-img' : ''}" id="top">
      ${img ? `<div class="hero-bg"><img src="${esc(img)}" alt="" fetchpriority="high"></div>` : '<div class="hero-bg pattern" aria-hidden="true"></div>'}
      <div class="wrap hero-in"><div class="hero-txt">
        <span class="eyebrow">${esc(h.eyebrow || p.field || 'جمعيّة أهليّة مرخّصة')}</span>
        <h1>${title}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
        <div class="ctas">${ctas}</div>
        ${p.license ? `<div class="trust">${ic('shield')} مسجّلة لدى المركز الوطنيّ لتنمية القطاع غير الربحيّ برقم <b>${esc(p.license)}</b></div>` : ''}</div>
        ${img ? `<figure class="hero-fig"><img src="${esc(img)}" alt="">${st.length ? `<div class="hero-chips">${st.map(x => `<span><b>${esc(x.value)}</b>${esc(x.label)}</span>`).join('')}</div>` : ''}</figure>` : ''}
      </div></section>`;
  }
  function sanitizeTitle(h) { return esc(String(h).replace(/<em>(.*?)<\/em>/g, '\u0001$1\u0002').replace(/<[^>]+>/g, '')).replace(/\u0001(.*?)\u0002/g, '<em>$1</em>'); }
  const head = (id, sub) => `<div class="sec-h"><span class="kicker">${SECTIONS[id]}</span>${sub ? `<h2>${sub}</h2>` : ''}</div>`;

  const S = {
    impact() {
      return `<section class="sec impact" id="impact"><div class="wrap"><div class="stats">${CFG.stats.map(x => `<div class="stat"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>
        ${CFG.asof ? `<p class="asof">الأرقام حتى ${esc(CFG.asof)}</p>` : ''}</div></section>`;
    },
    about() {
      const p = D.profile || {}, vals = lines(p.values), goals = lines(p.goals);
      return `<section class="sec about" id="about"><div class="wrap">${head('about', esc(CFG.about.title || ('تعرّف على ' + (CFG.short || D.name))))}
        ${CFG.about.text ? `<div class="prose about-txt">${paras(CFG.about.text)}</div>` : ''}
        <div class="vm">${p.vision ? `<div class="card vm-c">${ic('eye', 'big')}<h3>رؤيتنا</h3><p>${esc(p.vision)}</p></div>` : ''}${p.mission ? `<div class="card vm-c">${ic('flag', 'big')}<h3>رسالتنا</h3><p>${esc(p.mission)}</p></div>` : ''}</div>
        ${vals.length ? `<div class="vals"><h3>${ic('gem')} قيمنا</h3><div class="chips">${vals.map(v => `<span class="chip">${esc(v)}</span>`).join('')}</div></div>` : ''}
        ${goals.length ? `<div class="goals"><h3>${ic('target')} أهدافنا</h3><ol>${goals.map(g => `<li>${esc(g)}</li>`).join('')}</ol></div>` : ''}
      </div></section>`;
    },
    programs() {
      const ps = D.programs || [];
      return `<section class="sec programs" id="programs"><div class="wrap">${head('programs', 'برامج تصنع الأثر')}
        <div class="grid cards">${ps.map(progCard).join('')}</div></div></section>`;
    },
    stories() {
      return `<section class="sec stories" id="stories"><div class="wrap">${head('stories', 'من قلب الميدان')}
        <div class="rail">${(D.testimonials || []).map(t => `<figure class="card story">${ic('quote', 'q')}<blockquote>${esc(t.quote)}</blockquote>
          <figcaption>${imgUrl(t.photo_url) ? `<img src="${esc(imgUrl(t.photo_url))}" alt="" loading="lazy">` : `<span class="av">${esc((t.name || '؟').charAt(0))}</span>`}<span><b>${esc(t.name)}</b><small>${esc([t.role, t.program].filter(Boolean).join(' · '))}</small></span></figcaption></figure>`).join('')}</div></div></section>`;
    },
    news() {
      const ns = (D.news || []).slice(0, 3);
      return `<section class="sec news" id="news"><div class="wrap">${head('news', 'آخر أخبارنا')}
        <div class="grid cards">${ns.map(newsCard).join('')}</div>
        ${(D.news || []).length > 3 ? `<div class="more"><a class="btn btn-ghost" href="#/news">كلّ الأخبار ${ic('chev')}</a></div>` : ''}</div></section>`;
    },
    join() {
      const ops = (D.opportunities || []).filter(o => o.is_open !== false);
      return `<section class="sec join" id="join"><div class="wrap">${head('join', 'كن جزءاً من الأثر')}
        <div class="join-g">${ops.length ? `<div class="ops">${ops.map(o => `<article class="card op"><span class="tag">${o.kind === 'job' ? 'وظيفة' : 'فرصة تطوّعيّة'}</span><h3>${esc(o.title)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}
          <div class="meta">${o.location ? `<span>${ic('pin')}${esc(o.location)}</span>` : ''}${o.commitment ? `<span>${ic('clock')}${esc(o.commitment)}</span>` : ''}${o.deadline ? `<span>${ic('cal')}حتى ${esc(fmtD(o.deadline))}</span>` : ''}</div>
          <button class="btn btn-ghost sm" type="button" data-apply="${esc(o.id)}">قدّم الآن</button></article>`).join('')}</div>` : ''}
          <div class="card form-card"><h3>${ic('hand')} سجّل اهتمامك بالتطوّع</h3><p class="muted">اترك بياناتك وسنتواصل معك عند توفّر فرصة تناسبك.</p>${form('volunteer')}</div></div></div></section>`;
    },
    donate() {
      const s = CFG.support, p = D.profile || {}, url = safeUrl(s.donate_url);
      return `<section class="sec donate" id="donate"><div class="wrap"><div class="donate-box">
        <div class="donate-txt"><span class="kicker">${SECTIONS.donate}</span><h2>عطاؤك يصنع الفرق</h2><p>كلّ ريال يصل إلى مستحقّه عبر قنوات رسميّة موثّقة، ونفصح عن أثره في تقاريرنا.</p>
          ${url ? `<a class="btn btn-light" href="${esc(url)}" target="_blank" rel="noopener">${ic('heart')} تبرّع إلكترونيّاً</a>` : ''}</div>
        <div class="donate-cards">${s.iban ? ibanCard('حساب التبرّعات', s.iban, s.bank, s.account_name) : ''}${p.zakat && p.zakatIban ? ibanCard('حساب الزكاة (مستقلّ)', p.zakatIban, s.bank, s.account_name) : ''}</div>
      </div></div></section>`;
    },
    governance() {
      const p = D.profile || {}, docs = D.documents || [], board = p.board || [], com = p.committees || [], bp = (D.settings || {}).board_photos || {};
      const cats = Object.keys(DOC_CATS).map(k => [k, docs.filter(d => (d.category || 'other') === k)]).filter(([, a]) => a.length);
      const facts = [['رقم الترخيص', p.license], ['تاريخ الترخيص', p.licenseDate && fmtD(p.licenseDate)], ['الجهة المشرفة فنّيّاً', p.supervisor], ['المنطقة', [p.region, p.city].filter(Boolean).join(' — ')],
        ['المراجع الخارجيّ', p.auditor], ['الدورة الحاليّة للمجلس', p.termStart && p.termEnd ? fmtD(p.termStart) + ' — ' + fmtD(p.termEnd) : ''], ['صفة النفع العام', p.publicBenefit ? 'حاصلة عليها' : '']].filter(x => x[1]);
      return `<section class="sec gov" id="governance"><div class="wrap">${head('governance', 'نعمل بشفافيّة')}
        ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        <div class="gov-g">${board.length ? `<div class="card"><h3>${ic('landmark')} مجلس الإدارة</h3><ul class="people${board.some(m => bp[m.n]) ? ' has-ph' : ''}">${board.map(m => `<li>${imgUrl(bp[m.n]) ? `<img class="av av-img" src="${esc(imgUrl(bp[m.n]))}" alt="${esc(m.n)}" loading="lazy">` : `<span class="av">${esc(initial(m.n))}</span>`}<span><b>${esc(m.n)}</b><small>${esc(m.r || 'عضو')}</small></span></li>`).join('')}</ul></div>` : ''}
          ${com.length || p.execName ? `<div class="card"><h3>${ic('users')} اللجان والإدارة التنفيذيّة</h3><ul class="plain">${p.execName ? `<li><b>${esc(p.execTitle || 'المدير التنفيذيّ')}:</b> ${esc(p.execName)}</li>` : ''}${p.financeName ? `<li><b>${esc(p.financeTitle || 'المدير الماليّ')}:</b> ${esc(p.financeName)}</li>` : ''}
            ${com.map(c => `<li><b>${esc(c.name)}</b>${c.chair ? ' — برئاسة ' + esc(c.chair) : ''}</li>`).join('')}</ul></div>` : ''}</div>
        ${cats.length ? `<div class="docs">${cats.map(([k, a]) => `<div class="doc-g"><h3>${DOC_CATS[k]}</h3>${a.map(d => { const u = safeUrl(d.url); return `<${u ? `a href="${esc(u)}" target="_blank" rel="noopener"` : 'div'} class="doc">${ic('file')}<span>${esc(d.title)}${d.year ? ` <small>${esc(d.year)}</small>` : ''}</span>${u ? ic('ext', 'end') : ''}</${u ? 'a' : 'div'}>`; }).join('')}</div>`).join('')}</div>` : ''}
        ${p.complaints || p.whistleEmail ? `<div class="card report"><h3>${ic('shield')} الشكاوى والبلاغات</h3><p>${p.complaints ? `للشكاوى والمقترحات: ${/^https:/.test(p.complaints) ? `<a href="${esc(safeUrl(p.complaints))}" target="_blank" rel="noopener">النموذج</a>` : esc(p.complaints)}` : ''}${p.complaints && p.whistleEmail ? ' · ' : ''}${p.whistleEmail ? `للإبلاغ عن مخالفة بسرّيّة: <a href="mailto:${esc(p.whistleEmail)}" dir="ltr">${esc(p.whistleEmail)}</a>` : ''}</p></div>` : ''}
      </div></section>`;
    },
    partners() {
      return `<section class="sec partners" id="partners"><div class="wrap">${head('partners', 'شركاء النجاح')}
        <div class="logos">${(D.partners || []).map(x => { const u = safeUrl(x.url), im = imgUrl(x.logo_url); const inner = im ? `<img src="${esc(im)}" alt="${esc(x.name)}" loading="lazy">` : `<span>${esc(x.name)}</span>`; return u ? `<a class="logo" href="${esc(u)}" target="_blank" rel="noopener" title="${esc(x.name)}">${inner}</a>` : `<div class="logo" title="${esc(x.name)}">${inner}</div>`; }).join('')}</div></div></section>`;
    },
    faq() {
      return `<section class="sec faq" id="faq"><div class="wrap narrow">${head('faq', 'لديك سؤال؟')}
        <div class="acc">${(D.faqs || []).map(f => `<details><summary>${esc(f.question)}${ic('chev')}</summary><div class="prose">${paras(f.answer)}</div></details>`).join('')}</div></div></section>`;
    },
    contact() {
      const c = CFG.contact, so = CFG.social, wa = waLink(c.whatsapp || so.whatsapp || ''), map = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(c.map_embed || '') ? c.map_embed : '';
      const soc = [['x', 'xlogo', 'إكس'], ['instagram', 'insta', 'إنستغرام'], ['youtube', 'yt', 'يوتيوب'], ['linkedin', 'li', 'لينكدإن'], ['snapchat', 'link', 'سناب شات']].filter(([k]) => safeUrl(so[k]));
      return `<section class="sec contact" id="contact"><div class="wrap">${head('contact', 'يسعدنا تواصلك')}
        <div class="contact-g"><div class="info">
          ${c.phone ? `<a class="card row" href="tel:${esc(String(c.phone).replace(/\s/g, ''))}">${ic('phone')}<span><small>الهاتف</small><b dir="ltr">${esc(c.phone)}</b></span></a>` : ''}
          ${wa ? `<a class="card row" href="${esc(wa)}" target="_blank" rel="noopener">${ic('wa')}<span><small>واتساب</small><b>راسلنا مباشرة</b></span></a>` : ''}
          ${c.email ? `<a class="card row" href="mailto:${esc(c.email)}">${ic('mail')}<span><small>البريد</small><b dir="ltr">${esc(c.email)}</b></span></a>` : ''}
          ${c.address ? `<div class="card row">${ic('pin')}<span><small>العنوان</small><b>${esc(c.address)}</b></span></div>` : ''}
          ${c.hours ? `<div class="card row">${ic('clock')}<span><small>أوقات العمل</small><b>${esc(c.hours)}</b></span></div>` : ''}
          ${soc.length ? `<div class="soc">${soc.map(([k, i, t]) => `<a href="${esc(safeUrl(so[k]))}" target="_blank" rel="noopener" aria-label="${t}">${ic(i)}</a>`).join('')}</div>` : ''}
          ${map ? `<iframe class="map" src="${esc(map)}" loading="lazy" title="الموقع على الخريطة" referrerpolicy="no-referrer-when-downgrade"></iframe>` : ''}
        </div><div class="card form-card"><h3>أرسل رسالتك</h3>${form('contact')}</div></div></div></section>`;
    },
  };

  function ibanCard(t, iban, bank, name) {
    const v = String(iban).replace(/\s/g, '').toUpperCase(), pretty = v.replace(/(.{4})/g, '$1 ').trim();
    return `<div class="iban"><small>${esc(t)}${bank ? ' — ' + esc(bank) : ''}</small><b dir="ltr">${esc(pretty)}</b>${name ? `<span>${esc(name)}</span>` : ''}<button class="btn btn-light sm" type="button" data-copy="${esc(v)}">${ic('copy')} نسخ الآيبان</button></div>`;
  }
  const cover = (u, icon) => imgUrl(u) ? `<img src="${esc(imgUrl(u))}" alt="" loading="lazy">` : `<span class="ph">${ic(icon, 'big')}</span>`;
  const pKey = p => p.slug || p.id;
  function progCard(p) {
    const chip = p.registration_open ? '<span class="tag on">التسجيل مفتوح</span>' : p.status_label ? `<span class="tag">${esc(p.status_label)}</span>` : '';
    return `<a class="card pc" href="#/p/${encodeURIComponent(pKey(p))}"><div class="cv">${cover(p.cover_url, 'grad')}${chip}</div><div class="pc-b"><h3>${esc(p.title)}</h3>
      ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}<div class="meta">${p.audience ? `<span>${ic('users')}${esc(p.audience)}</span>` : ''}${p.duration ? `<span>${ic('clock')}${esc(p.duration)}</span>` : ''}</div><span class="go">التفاصيل ${ic('chev')}</span></div></a>`;
  }
  function newsCard(n) {
    return `<a class="card pc" href="#/n/${encodeURIComponent(n.id)}"><div class="cv">${cover(n.cover_url, 'file')}</div><div class="pc-b"><small class="date">${esc(fmtD(n.date))}</small><h3>${esc(n.title)}</h3>${n.excerpt ? `<p>${esc(n.excerpt)}</p>` : ''}<span class="go">اقرأ ${ic('chev')}</span></div></a>`;
  }

  /* ═════════ النماذج — تصل إلى «الوارد» في النظام ═════════ */
  const FORMS = {
    contact: [['name', 'الاسم', 'text', 1], ['phone', 'الجوّال', 'tel'], ['email', 'البريد', 'email'], ['subject', 'الموضوع', 'text', 0, 1], ['message', 'رسالتك', 'textarea', 1]],
    volunteer: [['name', 'الاسم', 'text', 1], ['phone', 'الجوّال', 'tel', 1], ['email', 'البريد', 'email'], ['city', 'المدينة', 'text', 0, 1], ['skills', 'مهاراتك واهتماماتك', 'text', 0, 1], ['availability', 'الوقت المتاح لك', 'text', 0, 1]],
    registration: [['name', 'الاسم', 'text', 1], ['phone', 'الجوّال', 'tel', 1], ['email', 'البريد', 'email'], ['age', 'العمر', 'text', 0, 1], ['city', 'المدينة', 'text', 0, 1], ['message', 'ملاحظات', 'textarea']],
    job: [['name', 'الاسم', 'text', 1], ['phone', 'الجوّال', 'tel', 1], ['email', 'البريد', 'email', 1], ['cv_url', 'رابط السيرة الذاتيّة', 'url', 0, 1], ['message', 'نبذة عنك', 'textarea']],
  };
  function form(kind, extra) {
    const f = FORMS[kind] || FORMS.contact;
    return `<form class="frm" data-kind="${kind}"${extra ? ` data-ref="${esc(extra.ref || '')}" data-pid="${esc(extra.pid || '')}"` : ''} novalidate>
      ${f.map(([k, l, t, req]) => `<label class="fld${t === 'textarea' ? ' wide' : ''}"><span>${l}${req ? ' <i>*</i>' : ''}</span>${t === 'textarea' ? `<textarea name="${k}" rows="4"${req ? ' required' : ''}></textarea>` : `<input name="${k}" type="${t}"${t === 'tel' || t === 'email' || t === 'url' ? ' dir="ltr"' : ''}${req ? ' required' : ''} autocomplete="${{ name: 'name', phone: 'tel', email: 'email' }[k] || 'off'}">`}</label>`).join('')}
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-c wide" type="submit">إرسال</button><p class="frm-msg" role="status"></p></form>`;
  }
  async function submit(fm) {
    const kind = fm.dataset.kind, data = Object.fromEntries(new FormData(fm).entries()), msg = fm.querySelector('.frm-msg'), btn = fm.querySelector('button[type=submit]');
    const need = (FORMS[kind] || []).filter(x => x[3]).find(x => !String(data[x[0]] || '').trim());
    if (need) { msg.textContent = 'أكمل: ' + need[1]; msg.className = 'frm-msg err'; return; }
    if (!data.phone && !data.email) { msg.textContent = 'اكتب الجوّال أو البريد لنتواصل معك'; msg.className = 'frm-msg err'; return; }
    const payload = {}; (FORMS[kind] || []).filter(x => x[4]).forEach(([k]) => { if (data[k]) payload[k] = data[k]; });
    const body = Object.assign({}, KEY, { kind, name: data.name, phone: data.phone || '', email: data.email || '', message: data.message || '', website: data.website || '', payload, ref_title: fm.dataset.ref || '', program_id: fm.dataset.pid || '' });
    btn.disabled = true; msg.textContent = 'جارٍ الإرسال…'; msg.className = 'frm-msg';
    try {
      if (MODE !== 'live') await new Promise(r => setTimeout(r, 500));
      else { const r = await fetch(API + '/site/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'تعذّر الإرسال'); }
      fm.reset(); msg.textContent = MODE === 'live' ? 'وصلتنا رسالتك — شكراً لك، سنتواصل معك قريباً.' : 'معاينة: هكذا يرى الزائر التأكيد (لم يُرسل شيء).'; msg.className = 'frm-msg ok';
    } catch (e) { msg.textContent = e.message; msg.className = 'frm-msg err'; }
    btn.disabled = false;
  }

  function footer() {
    const p = D.profile || {}, so = CFG.social;
    return `<footer class="ft"><div class="wrap ft-in"><div class="ft-b">${CFG.logo ? `<img src="${esc(CFG.logo)}" alt="">` : ''}<b>${esc(D.name)}</b>
      ${p.license ? `<small>مسجّلة لدى المركز الوطنيّ لتنمية القطاع غير الربحيّ برقم ${esc(p.license)}</small>` : ''}</div>
      <nav class="ft-nav">${visible().filter(id => id !== 'impact').map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav>
      <div class="ft-c"><span>© ${new Date().getFullYear()} ${esc(CFG.short)}</span><a class="made" href="https://ibrahimsaud.com/systems/charities/" target="_blank" rel="noopener">صُنع بنظام الجمعيات</a></div></div></footer>`;
  }
  function fab() {
    const wa = waLink(CFG.contact.whatsapp || CFG.social.whatsapp || '');
    return wa ? `<a class="fab-wa" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="واتساب">${ic('wa')}</a>` : '';
  }

  /* ═════════ الصفحات الفرعيّة (#/p/… · #/n/… · #/news) ═════════ */
  function programPage(key) {
    const p = (D.programs || []).find(x => String(pKey(x)) === key || x.id === key); if (!p) return '';
    const meta = [['users', p.audience], ['clock', p.duration], ['cal', p.start_date && 'يبدأ ' + fmtD(p.start_date)], ['pin', p.location], ['users', p.seats && 'المقاعد: ' + p.seats], ['link', p.partner && 'بالشراكة مع ' + p.partner]].filter(x => x[1]);
    const out = (p.outcomes || []).filter(o => o && (o.title || o.text)), fq = (p.faqs || []).filter(f => f && f.q), gal = (p.gallery || []).map(imgUrl).filter(Boolean), ext = safeUrl(p.register_url);
    return `<article class="page"><div class="wrap narrow"><a class="back" href="#programs" data-go="programs">${ic('back')} كلّ البرامج</a>
      ${imgUrl(p.cover_url) ? `<img class="page-cv" src="${esc(imgUrl(p.cover_url))}" alt="">` : ''}
      ${p.registration_open ? '<span class="tag on">التسجيل مفتوح</span>' : p.status_label ? `<span class="tag">${esc(p.status_label)}</span>` : ''}
      <h1>${esc(p.title)}</h1>${p.summary ? `<p class="lead">${esc(p.summary)}</p>` : ''}
      ${meta.length ? `<div class="meta big">${meta.map(([i, t]) => `<span>${ic(i)}${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="prose">${paras(p.body)}</div>
      ${out.length ? `<h2>ماذا ستكتسب</h2><div class="grid outs">${out.map(o => `<div class="card out">${ic('check', 'big')}<b>${esc(o.title)}</b>${o.text ? `<p>${esc(o.text)}</p>` : ''}</div>`).join('')}</div>` : ''}
      ${gal.length ? `<div class="gal">${gal.map(u => `<img src="${esc(u)}" alt="" loading="lazy">`).join('')}</div>` : ''}
      ${fq.length ? `<h2>أسئلة عن البرنامج</h2><div class="acc">${fq.map(f => `<details><summary>${esc(f.q)}${ic('chev')}</summary><div class="prose">${paras(f.a)}</div></details>`).join('')}</div>` : ''}
      ${p.registration_open ? `<div class="card form-card reg" id="reg"><h2>سجّل في البرنامج</h2>${ext ? `<a class="btn btn-c" href="${esc(ext)}" target="_blank" rel="noopener">انتقل لنموذج التسجيل ${ic('ext')}</a>` : form('registration', { ref: p.title, pid: p.id })}</div>` : ''}
    </div></article>`;
  }
  function newsPage(id) {
    const n = (D.news || []).find(x => x.id === id || x.slug === id); if (!n) return '';
    return `<article class="page"><div class="wrap narrow"><a class="back" href="#/news">${ic('back')} كلّ الأخبار</a>
      <small class="date">${esc(fmtD(n.date))}</small><h1>${esc(n.title)}</h1>${imgUrl(n.cover_url) ? `<img class="page-cv" src="${esc(imgUrl(n.cover_url))}" alt="">` : ''}
      <div class="prose">${paras(n.body || n.excerpt)}</div></div></article>`;
  }
  function newsList() {
    return `<section class="page"><div class="wrap"><a class="back" href="#top" data-go="top">${ic('back')} الرئيسيّة</a><h1>الأخبار</h1><div class="grid cards">${(D.news || []).map(newsCard).join('')}</div></div></section>`;
  }
  function applyPage(id) {
    const o = (D.opportunities || []).find(x => x.id === id); if (!o) return '';
    return `<article class="page"><div class="wrap narrow"><a class="back" href="#join" data-go="join">${ic('back')} الفرص</a><span class="tag">${o.kind === 'job' ? 'وظيفة' : 'فرصة تطوّعيّة'}</span><h1>${esc(o.title)}</h1>
      <div class="prose">${paras(o.description)}</div><div class="card form-card"><h2>قدّم الآن</h2>${form(o.kind === 'job' ? 'job' : 'volunteer', { ref: o.title })}</div></div></article>`;
  }

  /* ═════════ الرسم ═════════ */
  /* يحمّل ملفّات القالب (إن كان له هيكل خاصّ) وخطّه، ثمّ يرسم — حتى لا يظهر الموقع بلا تنسيق لحظةً */
  function addLink(id, href) {
    let l = document.getElementById(id);
    if (!href) { if (l) l.remove(); return Promise.resolve(); }
    if (l && l.getAttribute('href') === href) return Promise.resolve();
    return new Promise(res => { const n = document.createElement('link'); n.rel = 'stylesheet'; n.href = href; n.onload = n.onerror = () => { if (l) l.remove(); n.id = id; res(); }; document.head.appendChild(n); setTimeout(res, 2500); });
  }
  function addScript(src) { return new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = s.onerror = res; document.head.appendChild(s); }); }
  const TV = 'v=4';
  async function prepare() {
    const c = config(D), F = FONTS[c.font];
    const jobs = [addLink('fcss', F.g ? 'https://fonts.googleapis.com/css2?' + F.g.map(x => 'family=' + x).join('&') + '&display=swap' : '')];
    if (TEMPLATES[c.t].own) { jobs.push(addLink('tcss', './t/' + c.t + '.css?' + TV)); if (!REG[c.t]) jobs.push(addScript('./t/' + c.t + '.js?' + TV)); } else jobs.push(addLink('tcss', ''));
    await Promise.all(jobs);
  }
  async function render() { await prepare(); paint(); }
  function paint() {
    CFG = config(D);
    document.body.dataset.t = CFG.t;
    const r = document.documentElement.style, F = FONTS[CFG.font];
    r.setProperty('--c', CFG.color); r.setProperty('--ci', CFG.ink);
    r.setProperty('--fh', F.h + ',TS,system-ui,sans-serif'); r.setProperty('--fb', F.b + ',TS,system-ui,sans-serif');
    const route = decodeURIComponent((location.hash.match(/^#\/(.*)$/) || [])[1] || '');
    let main;
    if (route.startsWith('p/')) main = programPage(route.slice(2));
    else if (route.startsWith('n/')) main = newsPage(route.slice(2));
    else if (route.startsWith('apply/')) main = applyPage(route.slice(6));
    else if (route === 'news') main = newsList();
    const T = REG[CFG.t] || {}, sec = id => ((T.S && T.S[id]) || S[id])();
    if (!main) main = (T.hero || hero)() + visible().map(sec).join('');
    $app.innerHTML = (T.header || header)() + `<main id="main">${main}</main>` + (T.footer || footer)() + fab();
    if (T.after) T.after($app);
    meta();
    if (route) window.scrollTo(0, 0);
  }
  function meta() {
    const p = D.profile || {}, desc = (CFG.hero.lead || p.mission || p.vision || D.name).slice(0, 160);
    document.title = D.name + (p.field ? ' — ' + p.field : '');
    const set = (sel, v) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', v); };
    set('meta[name=description]', desc); set('meta[property="og:title"]', D.name); set('meta[property="og:description"]', desc); set('meta[name=theme-color]', CFG.color);
    if (CFG.logo) { const l = document.querySelector('link[rel=icon]'); if (l) l.href = CFG.logo; }
    let ld = document.getElementById('ld'); if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'NGO', name: D.name, description: desc, url: location.origin + location.pathname + location.search, logo: CFG.logo || undefined,
      email: CFG.contact.email || undefined, telephone: CFG.contact.phone || undefined, address: CFG.contact.address ? { '@type': 'PostalAddress', streetAddress: CFG.contact.address, addressCountry: 'SA' } : undefined });
  }
  function message(t, s) {
    document.body.dataset.t = 'noor';
    $app.innerHTML = `<div class="msg"><div><span class="msg-i">${ic('landmark', 'big')}</span><h1>${esc(t)}</h1><p>${esc(s)}</p></div></div>`;
  }

  /* ═════════ التفاعل ═════════ */
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) {
      const id = g.dataset.go; e.preventDefault(); closeMenu();
      const go = () => { const el = id === 'top' ? document.body : document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      if (location.hash.startsWith('#/')) { history.pushState(null, '', location.pathname + location.search); paint(); setTimeout(go, 30); } else go();
      return;
    }
    if (e.target.closest('[data-menu]')) { const s = document.getElementById('sheet'), b = e.target.closest('[data-menu]'); const open = s.hidden; s.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.innerHTML = ic(open ? 'x' : 'menu'); document.body.classList.toggle('menu-open', open); return; }
    const ap = e.target.closest('[data-apply]'); if (ap) { location.hash = '#/apply/' + ap.dataset.apply; return; }
    const cp = e.target.closest('[data-copy]');
    if (cp) { const v = cp.dataset.copy; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => { const h = cp.innerHTML; cp.innerHTML = ic('check') + ' نُسخ'; setTimeout(() => cp.innerHTML = h, 1600); }).catch(() => prompt('انسخ الآيبان:', v)); }
  });
  function closeMenu() { const s = document.getElementById('sheet'); if (s && !s.hidden) { s.hidden = true; const b = document.querySelector('[data-menu]'); if (b) { b.innerHTML = ic('menu'); b.setAttribute('aria-expanded', 'false'); } document.body.classList.remove('menu-open'); } }
  document.addEventListener('submit', e => { const f = e.target.closest('.frm'); if (f) { e.preventDefault(); submit(f); } });
  window.addEventListener('hashchange', () => { if (D && (location.hash.startsWith('#/') || location.hash === '')) paint(); });
  window.addEventListener('scroll', () => { const h = document.getElementById('hd'); if (h) h.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

  /* ═════════ التحميل ═════════ */
  async function boot() {
    if (MODE === 'preview') {
      // المعاينة الحيّة: الأب (النظام، نفس الأصل) يرسل البيانات كلّما تغيّرت
      window.addEventListener('message', async ev => {
        if (ev.origin !== location.origin || !ev.data || ev.data.type !== 'ws:data') return;
        const keep = window.scrollY; D = ev.data.data; await render();
        if (ev.data.focus && document.getElementById(ev.data.focus)) document.getElementById(ev.data.focus).scrollIntoView({ block: 'start' }); else window.scrollTo(0, keep);
      });
      if (window.parent !== window) window.parent.postMessage({ type: 'ws:ready' }, location.origin);
      return;
    }
    if (MODE === 'demo') { D = sample(Q.get('t')); if (FONTS[Q.get('f')]) D.settings.site.font = Q.get('f'); await render(); return; }
    if (!KEY.s && !KEY.host) { message('موقع الجمعيّة', 'الرابط ناقص — تأكّد من رابط الموقع.'); return; }
    try {
      const r = await fetch(API + '/site?' + new URLSearchParams(KEY));
      const d = await r.json().catch(() => ({}));
      if (r.status === 404) { message('لا يوجد موقع بهذا الرابط', 'تأكّد من كتابة الرابط بشكل صحيح.'); return; }
      if (!r.ok) throw new Error(d.error || '');
      if (d.unpublished) { message(d.name || 'الموقع', 'الموقع قيد التجهيز — نراك قريباً.'); return; }
      D = d; await render();
    } catch (e) { message('تعذّر تحميل الموقع', 'تحقّق من الاتّصال ثمّ أعد المحاولة.'); }
  }

  /* جمعيّة نموذجيّة — لعرض القوالب (بيانات توضيحيّة غير حقيقيّة) */
  function sample(t) {
    return { name: 'جمعيّة غِراس للتنمية الأسريّة', slug: 'demo', profile: { shortName: 'غِراس', field: 'تنمويّ — تمكين الأسرة والشباب', vision: 'أسرة متماسكة ومجتمع منتج.', mission: 'نمكّن الأسر والشباب ببرامج نوعيّة مستدامة، بشراكات فاعلة وحوكمة رشيدة.',
      values: ['الأمانة', 'الإتقان', 'الشراكة', 'الأثر'], goals: ['رفع جودة الحياة للأسر المستفيدة', 'بناء مهارات الشباب للعمل والإنتاج', 'تعزيز الشراكة مع القطاعين العامّ والخاصّ'],
      license: '0000 (نموذج)', licenseDate: '2021-03-14', supervisor: 'وزارة الموارد البشريّة والتنمية الاجتماعيّة', region: 'الرياض', city: 'الرياض', auditor: 'مكتب مراجعة مرخّص (نموذج)', termStart: '2024-01-01', termEnd: '2027-12-31',
      board: [{ n: 'أ. عبدالله الأحمد', r: 'رئيس مجلس الإدارة' }, { n: 'أ. سارة العتيبي', r: 'نائب الرئيس' }, { n: 'أ. خالد القحطاني', r: 'المشرف الماليّ' }, { n: 'أ. نورة الشهري', r: 'أمين السرّ' }, { n: 'أ. فهد الدوسري', r: 'عضو' }],
      committees: [{ name: 'لجنة المراجعة', chair: 'أ. خالد القحطاني' }, { name: 'لجنة الترشيحات والمكافآت', chair: 'أ. سارة العتيبي' }], execTitle: 'المدير التنفيذيّ', execName: 'أ. محمّد الزهرانيّ',
      complaints: '920000000', whistleEmail: 'report@example.org', zakat: true, zakatIban: 'SA0000000000000000000002' },
      settings: { site: { published: true, template: TEMPLATES[t] ? t : 'noor', color: { athar: '#C2410C', waqar: '#1E3A5F', sahifa: '#9B1C1C', mashrabiya: '#0F5C4D', arqam: '#2F3BDB' }[t] || '#0B7F86' },
        hero: { eyebrow: 'جمعيّة أهليّة مرخّصة', title_html: 'نزرع اليوم <em>أثراً</em> يبقى للأجيال', lead: 'برامج تمكين للأسرة والشباب في الرياض منذ ٢٠٢١ — بشفافيّة كاملة في كلّ ريال.' },
        stats: [{ value: '+2,400', label: 'مستفيد ومستفيدة' }, { value: '18', label: 'برنامجاً منفّذاً' }, { value: '340', label: 'متطوّعاً' }, { value: '12', label: 'شريك نجاح' }], stats_asof: 'نهاية ٢٠٢٥',
        contact: { phone: '011 000 0000', whatsapp: '0500000000', email: 'info@example.org', address: 'الرياض — حيّ الملقا', hours: 'الأحد – الخميس، ٨ص – ٤م' },
        social: { x: 'https://x.com/', instagram: 'https://instagram.com/' }, support: { bank: 'مصرف الراجحي', account_name: 'جمعيّة غراس للتنمية الأسريّة', iban: 'SA0000000000000000000001', donate_url: 'https://ehsan.sa/' } },
      programs: [{ id: 'p1', slug: 'mahara', title: 'برنامج مهارة', summary: 'تدريب الشباب على مهارات سوق العمل والعمل الحرّ في ١٢ أسبوعاً.', body: 'برنامج تدريبيّ عمليّ يجمع ورش العمل والإرشاد الفرديّ.\n\nيتخرّج المشارك بملفّ أعمال ومشروع تطبيقيّ.', audience: 'الشباب ١٨–٢٥', duration: '١٢ أسبوعاً', location: 'مقرّ الجمعيّة', registration_open: true, outcomes: [{ title: 'مهارات رقميّة', text: 'أدوات العمل الحديثة' }, { title: 'ملفّ أعمال', text: 'مشروع حقيقيّ تعرضه' }] },
        { id: 'p2', slug: 'osra', title: 'أسرة مستقرّة', summary: 'استشارات أسريّة ودعم للأسر الأشدّ حاجة بسرّيّة تامّة.', audience: 'الأسر', duration: 'طوال العام', status_label: 'مستمرّ' },
        { id: 'p3', slug: 'qudwa', title: 'قدوة', summary: 'برنامج قيميّ لليافعين يبني الشخصيّة والمسؤوليّة.', audience: 'اليافعون ١٣–١٧', duration: 'فصل دراسيّ', status_label: 'قريباً' }],
      news: [{ id: 'n1', title: 'تخريج الدفعة الثالثة من برنامج مهارة', date: '2025-11-02', excerpt: '٤٥ شاباً وشابّة أكملوا البرنامج بمشاريع تطبيقيّة.' }, { id: 'n2', title: 'توقيع شراكة مع جهة مانحة لدعم الأسر', date: '2025-09-15', excerpt: 'شراكة لثلاث سنوات تخدم ٣٠٠ أسرة.' }],
      testimonials: [{ name: 'ريم', role: 'خرّيجة برنامج مهارة', quote: 'خرجت من البرنامج بأوّل عميل لي، وبثقة لم أكن أعرفها.' }, { name: 'أبو فيصل', role: 'وليّ أمر', quote: 'تعامل راقٍ وسرّيّة تامّة، وأثر واضح على أبنائي.' }],
      faqs: [{ question: 'هل تبرّعاتي موثّقة؟', answer: 'نعم، كلّ تبرّع يصله سند رسميّ، وتُعرض القوائم الماليّة المراجَعة في قسم الحوكمة.' }, { question: 'كيف أتطوّع معكم؟', answer: 'سجّل اهتمامك من قسم «تطوّع معنا» وسنتواصل معك.' }],
      documents: [{ title: 'التقرير السنويّ', category: 'reports', year: '2025' }, { title: 'القوائم الماليّة المراجَعة', category: 'financials', year: '2025' }, { title: 'سياسة تعارض المصالح', category: 'policies' }, { title: 'سياسة الإبلاغ عن المخالفات', category: 'policies' }],
      opportunities: [{ id: 'o1', kind: 'volunteer', title: 'متطوّع تنظيم فعاليّات', description: 'تنظيم فعاليّات البرامج في نهاية الأسبوع.', location: 'الرياض', commitment: '٤ ساعات أسبوعيّاً', is_open: true }],
      partners: [{ name: 'جهة مانحة' }, { name: 'شريك تقنيّ' }, { name: 'جامعة شريكة' }, { name: 'شركة راعية' }] };
  }

  /* أدوات مشتركة للقوالب ذات الهيكل الخاصّ (t/<id>.js) */
  window.SiteT = (id, def) => { REG[id] = def; };
  window.SiteKit = { esc, safeUrl, imgUrl, paras, lines, fmtD, waLink, ic, SECTIONS, DOC_CATS, head, sanitizeTitle, visible, has, S, hero, header, footer, form, ibanCard, cover, progCard, newsCard, pKey,
    get D() { return D; }, get C() { return CFG; } };
  boot();
})();
