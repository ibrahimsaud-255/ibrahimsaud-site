/*
 * قالب «مشربيّة» — هندسة إسلاميّة: نقش النجمة الثمانيّة بخطوط ذهبيّة، أقواس كمحراب للصور والبطاقات،
 * والأرقام داخل نجوم. لون الجمعيّة عميقاً في الواجهة والأحزمة، والعاجيّ للقراءة. الخطّ: ريم الكوفيّ + نسخ.
 */
(function () {
  const K = window.SiteKit, { esc, ic, SECTIONS } = K;
  /* النجمة الثمانيّة: مربّعان متراكبان (الثاني مُدار ٤٥°) */
  const star = (cls) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 9 91 50 50 91 9 50Z" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="21" y="21" width="58" height="58" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>`;
  const orn = () => `<span class="mb-orn" aria-hidden="true"><i></i>${star('mb-s')}<i></i></span>`;
  const mh = (id, t) => `<div class="mb-h">${orn()}<span>${SECTIONS[id]}</span><h2>${t}</h2></div>`;

  function hero() {
    const D = K.D, C = K.C, h = C.hero, p = D.profile || {}, v = K.visible();
    const title = h.title_html ? K.sanitizeTitle(h.title_html) : esc(D.name), lead = h.lead || p.mission || '', img = K.imgUrl(h.image);
    return `<section class="mb-hero" id="top"><div class="mb-pat" aria-hidden="true"></div>
      <div class="wrap mb-hero-in">
        <div class="mb-hero-t">${star('mb-big')}
          <span class="mb-eye">${esc(h.eyebrow || p.field || 'جمعيّة أهليّة مرخّصة')}</span>
          <h1>${title}</h1>${lead ? `<p class="mb-lead">${esc(lead)}</p>` : ''}
          <div class="ctas">${v.includes('donate') ? `<a class="btn mb-gold" href="#donate" data-go="donate">${ic('heart')} ادعم رسالتنا</a>` : ''}
            <a class="btn mb-line" href="#${v.includes('programs') ? 'programs' : 'contact'}" data-go="${v.includes('programs') ? 'programs' : 'contact'}">${v.includes('programs') ? 'برامجنا' : 'تواصل معنا'}</a></div>
          ${p.license ? `<p class="mb-trust">${ic('shield')} مسجّلة لدى المركز الوطنيّ لتنمية القطاع غير الربحيّ برقم ${esc(p.license)}</p>` : ''}</div>
        <div class="mb-arch">${img ? `<img src="${esc(img)}" alt="">` : `<div class="mb-arch-pat" aria-hidden="true">${star('mb-mid')}</div>`}</div>
      </div><div class="mb-arches" aria-hidden="true"></div></section>`;
  }

  const S = {
    impact() {
      const C = K.C;
      return `<section class="sec mb-impact" id="impact"><div class="wrap"><div class="mb-stats">${C.stats.map(x => `<div class="mb-stat">${star('mb-ss')}<b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>
        ${C.asof ? `<p class="asof">الأرقام حتى ${esc(C.asof)}</p>` : ''}</div></section>`;
    },
    about() {
      const D = K.D, C = K.C, p = D.profile || {}, vals = K.lines(p.values), goals = K.lines(p.goals);
      return `<section class="sec mb-sec" id="about"><div class="wrap">${mh('about', esc(C.about.title || 'من نحن'))}
        ${C.about.text ? `<div class="prose mb-txt">${K.paras(C.about.text)}</div>` : ''}
        <div class="mb-vm">${p.vision ? `<div class="mb-tile"><span>رؤيتنا</span><p>${esc(p.vision)}</p></div>` : ''}${p.mission ? `<div class="mb-tile"><span>رسالتنا</span><p>${esc(p.mission)}</p></div>` : ''}</div>
        ${vals.length ? `<div class="mb-vals">${vals.map(x => `<span>${star('mb-xs')}${esc(x)}</span>`).join('')}</div>` : ''}
        ${goals.length ? `<ol class="mb-goals">${goals.map(g => `<li>${esc(g)}</li>`).join('')}</ol>` : ''}
      </div></section>`;
    },
    programs() {
      return `<section class="sec mb-sec" id="programs"><div class="wrap">${mh('programs', 'برامج تصنع الأثر')}
        <div class="mb-progs">${(K.D.programs || []).map(p => `<a class="mb-prog" href="#/p/${encodeURIComponent(K.pKey(p))}">
          <div class="mb-pa">${K.imgUrl(p.cover_url) ? `<img src="${esc(K.imgUrl(p.cover_url))}" alt="" loading="lazy">` : `<div class="mb-arch-pat" aria-hidden="true">${star('mb-mid')}</div>`}</div>
          <div class="mb-pb">${p.registration_open ? '<span class="mb-open">التسجيل مفتوح</span>' : p.status_label ? `<span class="mb-st">${esc(p.status_label)}</span>` : ''}
            <h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ''}<small>${esc([p.audience, p.duration].filter(Boolean).join(' · '))}</small></div></a>`).join('')}</div></div></section>`;
    },
    stories() {
      return `<section class="sec mb-band" id="stories"><div class="mb-pat" aria-hidden="true"></div><div class="wrap">${mh('stories', 'من قلب الميدان')}
        <div class="mb-quotes">${(K.D.testimonials || []).map(t => `<figure><blockquote>${esc(t.quote)}</blockquote><figcaption><b>${esc(t.name)}</b>${t.role ? `<small>${esc(t.role)}</small>` : ''}</figcaption></figure>`).join('')}</div></div></section>`;
    },
    donate() {
      const s = K.C.support, p = K.D.profile || {}, url = K.safeUrl(s.donate_url);
      return `<section class="sec mb-band" id="donate"><div class="mb-pat" aria-hidden="true"></div><div class="wrap mb-donate">${mh('donate', 'عطاؤك يصنع الفرق')}
        <p class="mb-dp">كلّ ريال يصل إلى مستحقّه عبر قنوات رسميّة موثّقة، ونفصح عن أثره في تقاريرنا.</p>
        ${url ? `<a class="btn mb-gold" href="${esc(url)}" target="_blank" rel="noopener">${ic('heart')} تبرّع إلكترونيّاً</a>` : ''}
        <div class="donate-cards mb-ibans">${s.iban ? K.ibanCard('حساب التبرّعات', s.iban, s.bank, s.account_name) : ''}${p.zakat && p.zakatIban ? K.ibanCard('حساب الزكاة (مستقلّ)', p.zakatIban, s.bank, s.account_name) : ''}</div></div></section>`;
    },
  };
  ['news', 'join', 'governance', 'partners', 'faq', 'contact'].forEach(id => {
    S[id] = () => K.S[id]().replace(/<div class="sec-h">[\s\S]*?<\/div>/, m => mh(id, (m.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || SECTIONS[id])).replace('class="sec ', 'class="sec mb-sec ');
  });

  function footer() {
    const D = K.D, p = D.profile || {}, C = K.C;
    return `<footer class="mb-ft"><div class="mb-pat" aria-hidden="true"></div><div class="wrap">${star('mb-big')}
      <b>${esc(D.name)}</b>${p.license ? `<small>مسجّلة لدى المركز الوطنيّ لتنمية القطاع غير الربحيّ برقم ${esc(p.license)}</small>` : ''}
      <nav>${K.visible().filter(id => id !== 'impact').map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav>
      <p>© ${new Date().getFullYear()} ${esc(C.short)} · <a class="made" href="https://ibrahimsaud.com/systems/charities/" target="_blank" rel="noopener">صُنع بنظام الجمعيات الشبابية</a></p></div></footer>`;
  }
  window.SiteT('mashrabiya', { hero, S, footer });
})();
