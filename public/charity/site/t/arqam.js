/*
 * قالب «أرقام» — مدرسة سويسريّة: شبكة ظاهرة بخطوط رفيعة، زوايا حادّة، أقسام مرقّمة (٠١، ٠٢…)،
 * وأكبر رقم عند الجمعيّة هو الواجهة نفسها. أسود وأبيض ولون الجمعيّة كتلاً كاملة. الخطّ: ألكسندريا + ريدكس.
 */
(function () {
  const K = window.SiteKit, { esc, ic, SECTIONS } = K;
  const n2 = i => String(i).padStart(2, '0');
  const idx = id => K.visible().filter(x => x !== 'impact').indexOf(id) + 1;   // رقم القسم حسب ترتيبه الظاهر
  const ah = (id, t) => `<div class="aq-h"><span class="aq-i">${n2(idx(id))}</span><div><small>${SECTIONS[id]}</small><h2>${t}</h2></div></div>`;

  function header() {
    const D = K.D, C = K.C, v = K.visible();
    const nav = v.filter(id => !['impact', 'stories', 'partners'].includes(id)).slice(0, 6);
    return `<header class="hd aq-hd" id="hd"><div class="wrap hd-in">
      <a class="aq-brand" href="#top" data-go="top">${C.logo ? `<img src="${esc(C.logo)}" alt="شعار ${esc(D.name)}">` : ''}<b>${esc(C.short)}</b></a>
      <nav class="hd-nav" aria-label="أقسام الموقع">${nav.map(id => `<a href="#${id}" data-go="${id}"><i>${n2(idx(id))}</i>${SECTIONS[id]}</a>`).join('')}</nav>
      <div class="hd-act">${v.includes('donate') ? `<a class="btn btn-c sm" href="#donate" data-go="donate">ادعمنا</a>` : ''}
        <button class="hd-menu" type="button" aria-label="القائمة" aria-expanded="false" data-menu>${ic('menu')}</button></div></div>
      <div class="sheet" id="sheet" hidden><div class="sheet-in">${nav.map(id => `<a href="#${id}" data-go="${id}"><span><i>${n2(idx(id))}</i> ${SECTIONS[id]}</span>${ic('chev')}</a>`).join('')}</div></div></header>`;
  }

  function hero() {
    const D = K.D, C = K.C, h = C.hero, p = D.profile || {}, v = K.visible(), big = C.stats[0];
    const title = h.title_html ? K.sanitizeTitle(h.title_html) : esc(D.name), lead = h.lead || p.mission || '', img = K.imgUrl(h.image);
    return `<section class="aq-hero${big ? '' : ' no-num'}" id="top"><div class="aq-grid" aria-hidden="true"></div><div class="wrap aq-hero-in">
      ${big ? `<div class="aq-num"><b>${esc(big.value)}</b><span>${esc(big.label)}</span></div>` : ''}
      <div class="aq-say"><small>${esc(h.eyebrow || p.field || 'جمعيّة أهليّة مرخّصة')}</small><h1>${title}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}
        <div class="ctas">${v.includes('donate') ? `<a class="btn btn-c" href="#donate" data-go="donate">ادعم رسالتنا ${ic('back', 'flip')}</a>` : ''}
          <a class="btn btn-ghost" href="#${v.includes('programs') ? 'programs' : 'contact'}" data-go="${v.includes('programs') ? 'programs' : 'contact'}">${v.includes('programs') ? 'البرامج' : 'تواصل معنا'}</a></div></div>
      ${img ? `<figure class="aq-img"><img src="${esc(img)}" alt=""></figure>` : ''}
    </div>
    ${C.stats.length > 1 ? `<div class="wrap aq-row">${C.stats.slice(1, 4).map((x, i) => `<div><i>${n2(i + 2)}</i><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>` : ''}</section>`;
  }

  const S = {
    impact() { return ''; },   // الأرقام هي الواجهة
    about() {
      const D = K.D, C = K.C, p = D.profile || {}, vals = K.lines(p.values), goals = K.lines(p.goals);
      return `<section class="sec aq-sec" id="about"><div class="wrap">${ah('about', esc(C.about.title || 'من نحن'))}
        ${C.about.text ? `<div class="prose aq-txt">${K.paras(C.about.text)}</div>` : ''}
        <div class="aq-vm">${p.vision ? `<div class="aq-blk dark"><small>الرؤية</small><p>${esc(p.vision)}</p></div>` : ''}${p.mission ? `<div class="aq-blk col"><small>الرسالة</small><p>${esc(p.mission)}</p></div>` : ''}</div>
        ${vals.length || goals.length ? `<div class="aq-lists">${vals.length ? `<div><h3>القيم</h3><ul>${vals.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}${goals.length ? `<div><h3>الأهداف</h3><ol>${goals.map(g => `<li>${esc(g)}</li>`).join('')}</ol></div>` : ''}</div>` : ''}
      </div></section>`;
    },
    programs() {
      return `<section class="sec aq-sec" id="programs"><div class="wrap">${ah('programs', 'البرامج')}
        <div class="aq-rows">${(K.D.programs || []).map((p, i) => `<a class="aq-r" href="#/p/${encodeURIComponent(K.pKey(p))}"><i>${n2(i + 1)}</i>
          <span class="aq-rt"><b>${esc(p.title)}</b>${p.summary ? `<small>${esc(p.summary)}</small>` : ''}</span>
          <span class="aq-rm">${esc(p.audience || '')}</span><span class="aq-rm">${esc(p.duration || '')}</span>
          <span class="aq-rs">${p.registration_open ? '<em>التسجيل مفتوح</em>' : esc(p.status_label || '')}</span>${ic('back', 'flip aq-go')}</a>`).join('')}</div></div></section>`;
    },
    stories() {
      const ts = K.D.testimonials || [];
      return `<section class="sec aq-sec aq-col" id="stories"><div class="wrap">${ah('stories', 'بكلماتهم')}
        <div class="aq-qs">${ts.map(t => `<figure><blockquote>${esc(t.quote)}</blockquote><figcaption>${esc(t.name)}${t.role ? ` — ${esc(t.role)}` : ''}</figcaption></figure>`).join('')}</div></div></section>`;
    },
    news() {
      return `<section class="sec aq-sec" id="news"><div class="wrap">${ah('news', 'الأخبار')}
        <div class="aq-rows">${(K.D.news || []).slice(0, 5).map(n => `<a class="aq-r aq-n" href="#/n/${encodeURIComponent(n.id)}"><time>${esc(K.fmtD(n.date))}</time><span class="aq-rt"><b>${esc(n.title)}</b>${n.excerpt ? `<small>${esc(n.excerpt)}</small>` : ''}</span>${ic('back', 'flip aq-go')}</a>`).join('')}</div>
        ${(K.D.news || []).length > 5 ? `<a class="btn btn-ghost aq-more" href="#/news">كلّ الأخبار</a>` : ''}</div></section>`;
    },
    donate() {
      const s = K.C.support, p = K.D.profile || {}, url = K.safeUrl(s.donate_url);
      return `<section class="sec aq-sec aq-dark" id="donate"><div class="wrap">${ah('donate', 'ادعم الأثر')}
        <div class="aq-don"><p>كلّ ريال يصل إلى مستحقّه عبر قنوات رسميّة موثّقة، ونفصح عن أثره في تقاريرنا.</p>${url ? `<a class="btn btn-c" href="${esc(url)}" target="_blank" rel="noopener">تبرّع إلكترونيّاً ${ic('ext')}</a>` : ''}</div>
        <div class="donate-cards aq-ibans">${s.iban ? K.ibanCard('حساب التبرّعات', s.iban, s.bank, s.account_name) : ''}${p.zakat && p.zakatIban ? K.ibanCard('حساب الزكاة (مستقلّ)', p.zakatIban, s.bank, s.account_name) : ''}</div></div></section>`;
    },
  };
  ['join', 'governance', 'partners', 'faq', 'contact'].forEach(id => {
    S[id] = () => K.S[id]().replace(/<div class="sec-h">[\s\S]*?<\/div>/, m => ah(id, (m.match(/<h2>([\s\S]*?)<\/h2>/) || [])[1] || SECTIONS[id])).replace('class="sec ', 'class="sec aq-sec ');
  });

  function footer() {
    const D = K.D, p = D.profile || {}, C = K.C;
    return `<footer class="aq-ft"><div class="wrap"><b class="aq-ft-n">${esc(C.short)}</b>
      <div class="aq-ft-g"><p>${esc(D.name)}${p.license ? `<br>ترخيص المركز الوطنيّ لتنمية القطاع غير الربحيّ رقم ${esc(p.license)}` : ''}</p>
        <nav>${K.visible().filter(id => id !== 'impact').map(id => `<a href="#${id}" data-go="${id}">${SECTIONS[id]}</a>`).join('')}</nav></div>
      <div class="aq-ft-c"><span>© ${new Date().getFullYear()}</span><a class="made" href="https://ibrahimsaud.com/systems/charities/" target="_blank" rel="noopener">صُنع بنظام الجمعيات الشبابية</a></div></div></footer>`;
  }
  window.SiteT('arqam', { header, hero, S, footer });
})();
