/*
 * قالب «صحيفة» — الموقع كصفحة أولى لجريدة: ترويسة باسم الجمعيّة بين خطّين، سطر التاريخ (هجريّ وميلاديّ)،
 * خبر رئيسيّ وعمود «بالأرقام»، وأقسام بأعمدة وفواصل رفيعة. الخطّ الافتراضيّ: أميري + نسخ.
 * يعتمد على SiteKit من site.js (التهريب esc والروابط safeUrl كما هي هناك).
 */
(function () {
  const K = window.SiteKit, { esc, ic, SECTIONS } = K;
  const today = () => { const d = new Date(), o = { day: 'numeric', month: 'long', year: 'numeric' };
    try { return d.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', Object.assign({ weekday: 'long' }, o)) + ' · ' + d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', o); } catch (e) { return ''; } };
  const sh = (id, title) => `<div class="sh-h"><h2>${title}</h2><span>${SECTIONS[id]}</span></div>`;
  const num = i => String(i + 1).padStart(2, '0');

  function header() {
    const D = K.D, C = K.C, p = D.profile || {}, nav = K.visible().filter(id => !['impact', 'stories', 'partners'].includes(id)).slice(0, 7);
    return `<div class="sh-strip"><div class="wrap"><span>${esc(today())}</span>${p.license ? `<span>ترخيص رقم ${esc(p.license)}</span>` : ''}</div></div>
      <div class="sh-mast"><div class="wrap">
        ${C.logo ? `<img class="sh-logo" src="${esc(C.logo)}" alt="شعار ${esc(D.name)}">` : ''}
        <a class="sh-name" href="#top" data-go="top">${esc(D.name)}</a>
        <div class="sh-tag"><span>${esc(p.field || 'جمعيّة أهليّة')}</span><span>${esc([p.city, 'المملكة العربيّة السعوديّة'].filter(Boolean).join(' — '))}</span></div>
      </div></div>
      <header class="hd sh-bar" id="hd"><div class="wrap hd-in">
        <a class="sh-mini" href="#top" data-go="top">${esc(C.short)}</a>
        <nav class="hd-nav" aria-label="أقسام الموقع">${nav.map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav>
        <div class="hd-act">${K.visible().includes('donate') ? `<a class="btn btn-c sm" href="#donate" data-go="donate">ادعمنا</a>` : ''}
          <button class="hd-menu" type="button" aria-label="القائمة" aria-expanded="false" data-menu>${ic('menu')}</button></div></div>
        <div class="sheet" id="sheet" hidden><div class="sheet-in">${nav.map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}${ic('chev')}</a>`).join('')}</div></div></header>`;
  }

  function hero() {
    const D = K.D, C = K.C, h = C.hero, p = D.profile || {};
    const title = h.title_html ? K.sanitizeTitle(h.title_html) : esc(D.name), lead = h.lead || p.mission || '', img = K.imgUrl(h.image);
    const v = K.visible();
    return `<section class="sh-front" id="top"><div class="wrap sh-front-g">
      <article class="sh-story">
        <span class="sh-kick">${esc(h.eyebrow || 'الخبر الرئيسيّ')}</span>
        <h1>${title}</h1>${lead ? `<p class="sh-dek">${esc(lead)}</p>` : ''}
        <div class="ctas">${v.includes('donate') ? `<a class="btn btn-c" href="#donate" data-go="donate">ادعم رسالتنا</a>` : ''}
          <a class="btn btn-ghost" href="#${v.includes('programs') ? 'programs' : 'contact'}" data-go="${v.includes('programs') ? 'programs' : 'contact'}">${v.includes('programs') ? 'اقرأ عن برامجنا' : 'تواصل معنا'}</a></div>
      </article>
      <figure class="sh-photo">${img ? `<img src="${esc(img)}" alt="">` : `<div class="sh-ph" aria-hidden="true"><b>${esc((C.short || D.name).trim())}</b></div>`}
        <figcaption>${esc(p.vision || ('من أعمال ' + (C.short || D.name)))}</figcaption></figure>
      ${C.stats.length ? `<aside class="sh-side"><h3>بالأرقام</h3>${C.stats.slice(0, 4).map(x => `<div class="sh-fig"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}${C.asof ? `<small>حتى ${esc(C.asof)}</small>` : ''}</aside>` : ''}
    </div></section>`;
  }

  const S = {
    impact() { return ''; },   // الأرقام في عمود الصفحة الأولى
    about() {
      const D = K.D, C = K.C, p = D.profile || {}, vals = K.lines(p.values), goals = K.lines(p.goals);
      return `<section class="sec sh-sec" id="about"><div class="wrap">${sh('about', esc(C.about.title || 'من نحن'))}
        <div class="sh-about">${C.about.text ? `<div class="sh-cols prose">${K.paras(C.about.text)}</div>` : ''}
          <div class="sh-pulls">${p.vision ? `<blockquote class="sh-pull"><small>رؤيتنا</small>${esc(p.vision)}</blockquote>` : ''}${p.mission ? `<blockquote class="sh-pull"><small>رسالتنا</small>${esc(p.mission)}</blockquote>` : ''}</div></div>
        ${vals.length || goals.length ? `<div class="sh-two">${vals.length ? `<div><h3>قيمنا</h3><p class="sh-inline">${vals.map(esc).join(' · ')}</p></div>` : ''}${goals.length ? `<div><h3>أهدافنا</h3><ol class="sh-ol">${goals.map(g => `<li>${esc(g)}</li>`).join('')}</ol></div>` : ''}</div>` : ''}
      </div></section>`;
    },
    programs() {
      return `<section class="sec sh-sec" id="programs"><div class="wrap">${sh('programs', 'برامجنا')}
        <div class="sh-arts">${(K.D.programs || []).map((p, i) => `<a class="sh-art" href="#/p/${encodeURIComponent(K.pKey(p))}">
          ${K.imgUrl(p.cover_url) ? `<img src="${esc(K.imgUrl(p.cover_url))}" alt="" loading="lazy">` : ''}
          <span class="sh-n">${num(i)}</span><h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
          <small>${esc([p.audience, p.duration].filter(Boolean).join(' · '))}${p.registration_open ? ' · <em>التسجيل مفتوح</em>' : ''}</small></a>`).join('')}</div></div></section>`;
    },
    stories() {
      return `<section class="sec sh-sec" id="stories"><div class="wrap">${sh('stories', 'قالوا عنّا')}
        <div class="sh-quotes">${(K.D.testimonials || []).map(t => `<figure><blockquote>${esc(t.quote)}</blockquote><figcaption>— ${esc(t.name)}${t.role ? '، ' + esc(t.role) : ''}</figcaption></figure>`).join('')}</div></div></section>`;
    },
    news() {
      const ns = (K.D.news || []).slice(0, 4);
      return `<section class="sec sh-sec" id="news"><div class="wrap">${sh('news', 'آخر الأخبار')}
        <div class="sh-news">${ns.map(n => `<a href="#/n/${encodeURIComponent(n.id)}"><time>${esc(K.fmtD(n.date))}</time><span><b>${esc(n.title)}</b>${n.excerpt ? `<p>${esc(n.excerpt)}</p>` : ''}</span></a>`).join('')}</div>
        ${(K.D.news || []).length > 4 ? `<a class="sh-more" href="#/news">كلّ الأخبار ←</a>` : ''}</div></section>`;
    },
    donate() {
      const s = K.C.support, p = K.D.profile || {}, url = K.safeUrl(s.donate_url);
      return `<section class="sec sh-sec" id="donate"><div class="wrap"><div class="sh-notice">
        <span class="sh-kick">إعلان</span><h2>عطاؤك يصنع الفرق</h2><p>كلّ ريال يصل إلى مستحقّه عبر قنوات رسميّة موثّقة، ونفصح عن أثره في تقاريرنا السنويّة.</p>
        ${url ? `<a class="btn btn-c" href="${esc(url)}" target="_blank" rel="noopener">تبرّع إلكترونيّاً</a>` : ''}
        <div class="sh-ibans">${s.iban ? K.ibanCard('حساب التبرّعات', s.iban, s.bank, s.account_name) : ''}${p.zakat && p.zakatIban ? K.ibanCard('حساب الزكاة (مستقلّ)', p.zakatIban, s.bank, s.account_name) : ''}</div>
      </div></div></section>`;
    },
  };
  ['join', 'governance', 'partners', 'faq', 'contact'].forEach(id => {
    S[id] = () => K.S[id]().replace(/<div class="sec-h">[\s\S]*?<\/div>/, m => { const t = (m.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || SECTIONS[id]; return sh(id, t); }).replace('class="sec ', 'class="sec sh-sec ');
  });

  function footer() {
    const D = K.D, p = D.profile || {};
    return `<footer class="sh-ft"><div class="wrap"><b class="sh-ft-n">${esc(D.name)}</b>
      <p>${p.license ? `مسجّلة لدى المركز الوطنيّ لتنمية القطاع غير الربحيّ برقم ${esc(p.license)} · ` : ''}© ${new Date().getFullYear()}</p>
      <nav>${K.visible().filter(id => id !== 'impact').map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav>
      <a class="made" href="https://ibrahimsaud.com/systems/charities/" target="_blank" rel="noopener">صُنع بنظام الجمعيات</a></div></footer>`;
  }
  window.SiteT('sahifa', { header, hero, S, footer });
})();
