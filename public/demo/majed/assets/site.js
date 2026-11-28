/* site.js — الصفحة العامّة: المسارات + التسجيل بخطوات + صفحة المشارك */
window.siteMain = () => {
  const S = DB.load();

  // شريط الوضع التجريبيّ
  if (CONFIG.demo) {
    const b = $('#demoBar'); b.classList.remove('hidden');
    b.innerHTML = `${ic('info')} <span>نسخة تجريبيّة: البيانات وهميّة وتُحفظ في متصفّحك فقط.</span> <a href="${IN_ARTIFACT ? '#admin' : 'admin.html'}"><button>لوحة الإدارة ›</button></a>`;
    $('svg', b).style.cssText = 'width:16px;height:16px';
  }

  // المسارات
  const countIn = id => S.participants.filter(p => p.track === id && p.status !== 'withdrawn').length;
  $('#trackGrid').innerHTML = TRACKS.map((t, i) => {
    const c = countIn(t.id);
    return `<article class="track" style="--tc:${t.color};animation-delay:${i * 60}ms">
      <span class="tn">المسار ${AR(t.id)}</span>
      <h3>${t.name}</h3>
      <p class="who">${t.who}</p>
      <div class="big num">${AR(t.amount)}<small>حديثاً</small></div>
      <p class="plan">${t.plan}</p>
      <div><div class="meter"><span style="width:${Math.min(100, pct(c, t.target))}%"></span></div>
      <div class="seat"><span>${AR(c)} مسجّل</span><span>المستهدف ${AR(t.target)}</span></div></div>
    </article>`;
  }).join('');
  $('#stSeats').textContent = AR(TRACKS.reduce((a, t) => a + t.target, 0));
  $('#phaseList').innerHTML = CONFIG.phases.map((p, i) => `<li><span class="n">${AR(i + 1)}</span><div><h3>${p.name}</h3><p>${p.weeks}</p></div></li>`).join('');

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (!g) return;
    e.preventDefault(); g.dataset.go === 'reg' ? openReg() : openMe();
  });
  if (location.hash === '#register') openReg();
  if (location.hash === '#me') openMe();

  /* ═════════ هيكل الشاشة الكاملة ═════════ */
  function flow(title) {
    const f = document.createElement('div'); f.className = 'flow';
    f.innerHTML = `<div class="flow-top"><button class="icon-btn" data-back aria-label="رجوع">${ic('chevR')}</button><div class="ttl">${title}</div><button class="icon-btn" data-close aria-label="إغلاق">${ic('x')}</button></div>
      <div class="flow-prog"><span style="width:0"></span></div><div class="flow-body"></div><div class="flow-foot hidden"><div class="in"></div></div>`;
    document.body.appendChild(f); document.body.style.overflow = 'hidden';
    const api = {
      el: f, body: $('.flow-body', f),
      close() { f.remove(); document.body.style.overflow = ''; history.replaceState(null, '', location.pathname); },
      prog(v) { $('.flow-prog span', f).style.width = v + '%'; },
      foot(html) { const ft = $('.flow-foot', f); ft.classList.toggle('hidden', !html); $('.in', ft).innerHTML = html || ''; },
      render(html) { api.body.innerHTML = `<div class="flow-in">${html}</div>`; api.body.scrollTop = 0; },
      onBack: null,
    };
    $('[data-close]', f).onclick = () => api.close();
    $('[data-back]', f).onclick = () => api.onBack ? api.onBack() : api.close();
    return api;
  }

  /* ═════════ التسجيل ═════════ */
  function openReg() {
    if (!S.settings.regOpen) { toast('التسجيل مغلق حالياً', 'info'); return; }
    history.replaceState(null, '', '#register');
    const F = flow('التسجيل في المسابقة');
    const d = { forWho: 'self', name: '', gender: '', age: '', arabic: 'yes', nationality: 'سعودي', center: S.settings.centers[0], phone: '', email: '', guardian: '', memorized: '0', goal: '', track: null };
    const steps = [who, info, level, verify];
    let i = 0;
    const go = n => { i = n; F.prog(((i + 1) / (steps.length + 1)) * 100); steps[i](); };
    F.onBack = () => i ? go(i - 1) : F.close();
    go(0);

    function who() {
      F.render(`<h2>أهلاً بك</h2><p class="muted">من سيشارك في المسابقة؟</p>
        <div class="choices">
          <button class="choice ${d.forWho === 'self' ? 'on' : ''}" data-v="self"><span class="dot"></span><span><b>أسجّل لنفسي</b><small>عمري ١٣ سنة فأكثر</small></span></button>
          <button class="choice ${d.forWho === 'child' ? 'on' : ''}" data-v="child"><span class="dot"></span><span><b>أسجّل لابني أو ابنتي</b><small>بيانات التواصل تكون لوليّ الأمر</small></span></button>
        </div>`);
      $$('.choice', F.body).forEach(c => c.onclick = () => { d.forWho = c.dataset.v; go(1); });
      F.foot('');
    }

    function info() {
      const child = d.forWho === 'child';
      F.render(`<h2>${child ? 'بيانات المشارك' : 'بياناتك'}</h2><p class="muted">تظهر في الشهادة كما تكتبها.</p>
        <div class="field"><label for="f-name">الاسم الرباعيّ${child ? ' للمشارك' : ''}</label><input class="input" id="f-name" autocomplete="name" value="${esc(d.name)}" placeholder="مثال: عبدالله محمد سعد العتيبي"></div>
        <div class="field"><span class="label">الجنس</span><div class="seg block" id="f-gender"><button data-v="m" class="${d.gender === 'm' ? 'on' : ''}">ذكر</button><button data-v="f" class="${d.gender === 'f' ? 'on' : ''}">أنثى</button></div></div>
        <div class="row">
          <div class="field"><label for="f-age">العمر</label><input class="input num" id="f-age" type="number" inputmode="numeric" min="4" max="99" value="${esc(d.age)}" placeholder="بالسنوات"></div>
          <div class="field"><label for="f-center">المركز</label><select class="input" id="f-center">${S.settings.centers.map(c => `<option ${c === d.center ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><span class="label">هل العربية لغتك الأمّ؟</span><div class="seg block" id="f-ar"><button data-v="yes" class="${d.arabic === 'yes' ? 'on' : ''}">نعم</button><button data-v="no" class="${d.arabic === 'no' ? 'on' : ''}">لا</button></div></div>
        <div class="field"><label for="f-nat">الجنسيّة</label><input class="input" id="f-nat" value="${esc(d.nationality)}"></div>
        ${child ? `<div class="field"><label for="f-g">اسم وليّ الأمر</label><input class="input" id="f-g" value="${esc(d.guardian)}"></div>` : ''}
        <div class="field"><label for="f-phone">رقم الجوّال${child ? ' (وليّ الأمر)' : ''}</label><input class="input num" id="f-phone" type="tel" inputmode="tel" dir="ltr" style="text-align:right" value="${esc(d.phone)}" placeholder="05XXXXXXXX"></div>
        <div class="field"><label for="f-email">البريد الإلكترونيّ${child ? ' (وليّ الأمر)' : ''}</label><input class="input" id="f-email" type="email" inputmode="email" dir="ltr" style="text-align:right" value="${esc(d.email)}" placeholder="name@example.com"><span class="hint">نرسل عليه رمز التحقّق ونتائجك.</span></div>`);
      $$('#f-gender button,#f-ar button', F.body).forEach(b => b.onclick = () => { $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); });
      F.foot(`<button class="btn btn-lg btn-primary" id="next">التالي</button>`);
      $('#next').onclick = () => {
        d.name = $('#f-name').value.trim(); d.gender = $('#f-gender .on')?.dataset.v || ''; d.age = $('#f-age').value;
        d.center = $('#f-center').value; d.arabic = $('#f-ar .on')?.dataset.v || 'yes'; d.nationality = $('#f-nat').value.trim();
        d.guardian = $('#f-g')?.value.trim() || ''; d.phone = $('#f-phone').value.replace(/\D/g, ''); d.email = $('#f-email').value.trim();
        const err = d.name.split(/\s+/).length < 3 ? 'اكتب الاسم ثلاثياً على الأقلّ' : !d.gender ? 'اختر الجنس' : !(+d.age >= 4 && +d.age <= 99) ? 'اكتب عمراً صحيحاً'
          : !/^05\d{8}$/.test(d.phone) ? 'رقم الجوّال يبدأ بـ05 ومن ١٠ أرقام' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email) ? 'البريد الإلكترونيّ غير صحيح'
          : S.participants.some(p => p.email.toLowerCase() === d.email.toLowerCase() && p.name === d.name) ? 'هذا المشارك مسجّل مسبقاً' : '';
        if (err) return toast(err, 'info');
        go(2);
      };
    }

    function level() {
      const opts = [['0', 'لم أحفظ شيئاً بعد'], ['10', 'أقلّ من ١٠ أحاديث'], ['20', 'من ١٠ إلى ٢٠ حديثاً'], ['42', 'أحفظ الأربعين كاملة']];
      const goals = [['10', 'أحاديث مختارة', '١٠–١٥ حديثاً بمقرّر مبسّط'], ['42', 'الأربعون النووية كاملة', '٤٢ حديثاً'], ['50', 'الأربعون + زيادة ابن رجب', '٥٠ حديثاً — مسار المتميّزين'], ['100', 'مئة حديث', 'تحدّدها اللجنة العلميّة — مسار الحفّاظ']];
      const draw = () => {
        const sug = d.goal ? suggestTrack(d) : null;
        const elig = eligibleTracks(d);
        if (sug && !d.trackTouched) d.track = sug.id;
        F.render(`<h2>مستواك وطموحك</h2><p class="muted">نقترح لك المسار المناسب، ولك الاختيار.</p>
          <div class="field"><label for="f-mem">كم تحفظ من الأربعين النووية؟</label><select class="input" id="f-mem">${opts.map(([v, t]) => `<option value="${v}" ${v === d.memorized ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <span class="label">ماذا تطمح أن تحفظ؟</span>
          <div class="choices" style="margin:8px 0 22px">${goals.map(([v, t, s]) => `<button class="choice ${d.goal === v ? 'on' : ''}" data-goal="${v}"><span class="dot"></span><span><b>${t}</b><small>${s}</small></span></button>`).join('')}</div>
          ${sug ? `<div class="suggest"><div class="k">${ic('sparkle')} المسار المقترح لك</div><h3>${TRACK(d.track).name}</h3><p>${TRACK(d.track).plan}</p>
            ${sug.note ? `<div class="note">${ic('info')}<span>${sug.note}</span></div>` : ''}</div>
            ${elig.length > 1 ? `<span class="label">أو اختر مساراً آخر متاحاً لك</span><div class="choices" style="margin-top:8px">${elig.filter(x => x !== d.track).map(id => `<button class="choice" data-track="${id}"><span class="dot"></span><span><b>${TRACK(id).name}</b><small>${TRACK(id).plan}</small></span></button>`).join('')}</div>` : ''}` : ''}`);
        $('#f-mem').onchange = e => d.memorized = e.target.value;
        $$('[data-goal]', F.body).forEach(b => b.onclick = () => { d.goal = b.dataset.goal; d.trackTouched = false; draw(); });
        $$('[data-track]', F.body).forEach(b => b.onclick = () => { d.track = +b.dataset.track; d.trackTouched = true; draw(); toast('تم اختيار ' + TRACK(d.track).name); });
        F.foot(`<button class="btn btn-lg btn-primary" id="next" ${d.goal ? '' : 'disabled'}>التالي</button>`);
        $('#next').onclick = () => go(3);
      };
      draw();
    }

    async function verify() {
      const r = await DB.sendOtp(d.email);
      F.render(`<div style="text-align:center"><div class="done-ic" style="background:var(--accent-soft);color:var(--accent)">${ic('mail')}</div>
        <h2>تحقّق من بريدك</h2><p class="muted">أرسلنا رمزاً من ٤ أرقام إلى<br><b dir="ltr" style="color:var(--ink)">${esc(d.email)}</b></p></div>
        <div class="otp">${[0, 1, 2, 3].map(() => `<input inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="رقم">`).join('')}</div>
        ${r.demoCode ? `<p class="demo-code">الوضع التجريبيّ: الرمز هو <b class="num" dir="ltr">${r.demoCode}</b></p>` : ''}
        <p style="text-align:center;margin-top:16px"><button class="btn btn-ghost btn-sm" id="resend">إعادة إرسال الرمز</button></p>`);
      const ins = $$('.otp input', F.body); ins[0].focus();
      ins.forEach((el, k) => {
        el.oninput = () => { el.value = el.value.replace(/\D/g, '').slice(-1); if (el.value && ins[k + 1]) ins[k + 1].focus(); if (ins.every(x => x.value)) submit(); };
        el.onkeydown = e => { if (e.key === 'Backspace' && !el.value && ins[k - 1]) ins[k - 1].focus(); };
        el.onpaste = e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4); if (t.length === 4) { e.preventDefault(); t.split('').forEach((c, j) => ins[j].value = c); submit(); } };
      });
      $('#resend').onclick = () => { verify(); toast('أُرسل رمز جديد', 'mail'); };
      F.foot(`<button class="btn btn-lg btn-primary" id="next">تأكيد التسجيل</button>`);
      $('#next').onclick = submit;
      async function submit() {
        const code = ins.map(x => x.value).join('');
        if (code.length < 4) return toast('اكتب الرمز كاملاً', 'info');
        if (!(await DB.verifyOtp(d.email, code))) { ins.forEach(x => x.value = ''); ins[0].focus(); return toast('الرمز غير صحيح', 'x'); }
        finish();
      }
    }

    function finish() {
      const p = { id: uid(), no: DB.nextNo(), name: d.name, gender: d.gender, age: +d.age, arabic: d.arabic, nationality: d.nationality, phone: d.phone, email: d.email,
        center: d.center, guardian: d.guardian, memorized: +d.memorized, goal: d.goal, track: d.track, status: 'pending', verified: true, createdAt: Date.now(), group: null,
        note: suggestTrack(d).note || '' };
      S.participants.push(p); assignGroup(S, p); DB.addLog(`تسجيل جديد: ${p.name} — ${TRACK(p.track).name}`); DB.save();
      F.prog(100); F.onBack = () => F.close();
      F.render(`<div style="text-align:center"><div class="done-ic">${ic('check')}</div><h2>تمّ تسجيلك</h2><p class="muted" style="margin-bottom:22px">احفظ رقمك. ستصلك رسالة على بريدك عند اعتماد التسجيل.</p></div>
        ${passCard(p)}
        <div class="card"><div class="list-row"><div class="l"><b>الخطوة التالية</b><small>تعتمد الإدارة تسجيلك وتُعلن قوائم المجموعات، ثمّ تبدأ فترة الحفظ.</small></div></div></div>`);
      F.foot(`<button class="btn btn-lg btn-primary" id="toMe">صفحتي</button><button class="btn btn-lg" id="again">تسجيل آخر</button>`);
      $('#toMe').onclick = () => { F.close(); SS.set('ms_me', p.email); openMe(); };
      $('#again').onclick = () => { F.close(); openReg(); };
    }
  }

  function passCard(p) {
    const t = TRACK(p.track), g = S.groups.find(x => x.id === p.group);
    const st = { pending: 'بانتظار الاعتماد', active: 'معتمد', withdrawn: 'منسحب' }[p.status];
    return `<div class="pass"><span class="pno num">#${p.no}</span><div class="pk">بطاقة المشارك</div><div class="pname">${esc(p.name)}</div>
      <div class="pgrid"><div><span class="pk">المسار</span><b>${t.name}</b></div><div><span class="pk">المقرّر</span><b>${AR(t.amount)} حديثاً</b></div>
      <div><span class="pk">المجموعة</span><b>${g ? (g.n ? 'المجموعة ' + AR(g.n) : '—') : 'تُعلن قريباً'}</b></div><div><span class="pk">الحالة</span><b>${st}</b></div></div></div>`;
  }

  /* ═════════ صفحة المشارك ═════════ */
  function openMe() {
    history.replaceState(null, '', '#me');
    const F = flow('صفحتي'); F.prog(100);
    const remembered = SS.get('ms_me');
    if (remembered) return show(remembered);
    F.render(`<h2>دخول المشارك</h2><p class="muted">اكتب البريد الذي سجّلت به، ونرسل لك رمز دخول.</p>
      <div class="field"><label for="m-email">البريد الإلكترونيّ</label><input class="input" id="m-email" type="email" dir="ltr" style="text-align:right" placeholder="name@example.com"></div>
      ${CONFIG.demo ? `<p class="demo-code">للتجربة: جرّب <b dir="ltr">${esc(S.participants[60]?.email || '')}</b></p>` : ''}
      <div id="m-otp"></div>`);
    F.foot(`<button class="btn btn-lg btn-primary" id="send">أرسل الرمز</button>`);
    $('#send').onclick = async () => {
      const email = $('#m-email').value.trim();
      if (!S.participants.some(p => p.email.toLowerCase() === email.toLowerCase())) return toast('لا يوجد تسجيل بهذا البريد', 'info');
      const r = await DB.sendOtp(email);
      $('#m-otp').innerHTML = `<div class="field"><label for="m-code">رمز الدخول</label><input class="input num" id="m-code" inputmode="numeric" maxlength="4" dir="ltr" style="text-align:center;font-size:22px;letter-spacing:8px"></div>
        ${r.demoCode ? `<p class="demo-code">الوضع التجريبيّ: الرمز <b dir="ltr">${r.demoCode}</b></p>` : ''}`;
      $('#m-code').focus();
      F.foot(`<button class="btn btn-lg btn-primary" id="enter">دخول</button>`);
      $('#enter').onclick = async () => {
        if (!(await DB.verifyOtp(email, $('#m-code').value))) return toast('الرمز غير صحيح', 'x');
        SS.set('ms_me', email); show(email);
      };
    };

    function show(email) {
      const mine = S.participants.filter(p => p.email.toLowerCase() === email.toLowerCase());
      if (!mine.length) { SS.del('ms_me'); F.close(); return openMe(); }
      const nowPhase = 1;
      F.render(mine.map(p => {
        const t = TRACK(p.track), avg = stageAvg(S, p);
        const exams = S.exams.map(e => {
          const v = e.kind === 'final' ? finalScore(S, p) : S.scores[e.id]?.[p.id];
          return `<div class="list-row"><div class="l"><b>${e.name}</b><small>الأسبوع ${AR(e.week)}</small></div><div class="v num" style="color:${v == null ? 'var(--muted)' : v >= S.settings.passMark ? 'var(--good)' : 'var(--warn)'}">${v == null ? '—' : AR(v)}</div></div>`;
        }).join('');
        return `${passCard(p)}
          <div class="card card-pad" style="margin-bottom:14px"><span class="label">أين وصلت المسابقة؟</span>
            <div class="tl">${CONFIG.phases.map((x, k) => `<span class="${k < nowPhase ? 'on' : k === nowPhase ? 'now' : ''}"></span>`).join('')}</div>
            <b>${CONFIG.phases[nowPhase].name}</b> <span class="muted">· ${CONFIG.phases[nowPhase].weeks}</span></div>
          <div class="card" style="margin-bottom:14px"><div class="card-head"><h3>مقرّرك</h3><span class="badge accent">${AR(t.amount)} حديثاً</span></div>
            <div class="card-pad" style="padding-top:12px"><p>${t.plan}</p><p class="muted" style="margin-top:6px;font-size:13px">أسلوب التقييم: ${t.exam}</p></div></div>
          <div class="card" style="margin-bottom:22px"><div class="card-head"><h3>الاختبارات والدرجات</h3>${avg != null ? `<span class="badge ${avg >= S.settings.passMark ? 'good' : 'warn'}">المعدّل ${AR(avg)}</span>` : ''}</div>${exams}</div>`;
      }).join('') + `<p style="text-align:center"><button class="btn btn-ghost" id="out">${ic('logout')} خروج</button></p>`);
      F.foot('');
      $('#out').onclick = () => { SS.del('ms_me'); F.close(); };
    }
  }
};
