/* ═════════════════════════════════════════════════════════════════════════
 * «المدينة» — حقيبة الموسم المرحلة ٢ (من «مدينة القيم»: ٣ مواسم في الأحساء)
 *   المناطق (مهاريّة، تنافسيّة، ترفيهيّة…) + الفترات (تحفيز، ٣ فترات، تموين) ← مولّد جدول التدوير:
 *   كلّ مرحلة تمرّ على كلّ منطقة مرّة في اليوم، ولا تلتقي مرحلتان في منطقة واحدة.
 *   الأحياء (الفرق) بلونها ومرحلتها وشعارها، ولوحات الطباعة، و«الآن»: من في أيّ منطقة، والمتأخّرون.
 * البيانات: seasons.settings.zones/periods/late · season_schedule (kind='zone'|'break', zone, period)
 *           season_period_att (حضور الفترة) · season_staff_att (حضور المشرفين) — db/season-city.sql
 * ملفّ تعريفات فقط (القاعدة في CLAUDE.md): لا شيء يُنفَّذ عند التحميل.
 * ═════════════════════════════════════════════════════════════════════════ */

/* قوالب جاهزة مأخوذة من ملفّات المواسم الثلاثة */
const SN_CITY_TPL = {
  zones: [{ id: 'skill', n: 'المنطقة المهاريّة', p: 'القاعات العلويّة', c: '#0A84FF', img: 'lib:city/skill' }, { id: 'comp', n: 'المنطقة التنافسيّة', p: 'القاعات السفليّة', c: '#FF9F0A', img: 'lib:city/comp' }, { id: 'fun', n: 'المنطقة الترفيهيّة', p: 'الملعب وغرفة الألعاب', c: '#30D158', img: 'lib:city/fun' }],
  periods: [{ id: 'mot', n: 'فترة التحفيز', f: '19:50', e: '20:50', t: 'all' }, { id: 'p1', n: 'الفترة الأولى', f: '21:00', e: '21:45', t: 'rot' }, { id: 'p2', n: 'الفترة الثانية', f: '22:00', e: '22:45', t: 'rot' },
    { id: 'cat', n: 'التموين', f: '22:50', e: '23:15', t: 'all' }, { id: 'p3', n: 'الفترة الثالثة', f: '23:25', e: '00:10', t: 'rot' }],
};
const SN_HOODS = [
  { n: 'أحياء مدينة القيم ٣', list: [['حي الخالدية', '#BFFE74', 'ابتدائي'], ['حي المزروع', '#D71110', 'ابتدائي'], ['حي النسيم', '#4CC2F6', 'ابتدائي'], ['حي الشهابية', '#FF5500', 'متوسط'], ['حي الصالحية', '#FFBE5A', 'متوسط'], ['حي الرقيقة', '#05744A', 'متوسط'], ['حي العزيزية', '#0464D5', 'ثانوي'], ['حي البندرية', '#5C0719', 'ثانوي']].map(([name, color, stage]) => ({ id: '', name, color, stage, motto: '' })) },
  { n: 'أحياء القيم ٤', list: [['الإبداع', '#2563EB', 'تعلّم . ابتكر . أبدع'], ['القيادة', '#16A34A', 'فكّر . قرّر . قُد'], ['الإنجاز', '#EA580C', 'خطّط . نفّذ . حقّق'], ['المبادرة', '#DB2777', 'بادر . تطوّع . أثّر'], ['التأثير', '#7C3AED', 'واصل . ألهم . غيّر'], ['التحدّي', '#DC2626', 'تحدَّ . تغلّب . توّج'], ['التميّز', '#CA8A04', 'تطوّر . ارتقِ . تميّز'], ['المستقبل', '#0891B2', 'نعلّم اليوم .. نصنع الغد']].map(([name, color, motto]) => ({ id: '', name, color, stage: '', motto })) },
];
function snTeamRow(t, i) {
  return `<div class="sn-trow sn-hood"><input type="color" value="${esc(t.color)}" aria-label="اللون" data-i="${i}" class="sn-tc"><input value="${esc(t.name)}" placeholder="اسم الفريق" class="sn-tn" data-id="${esc(t.id || '')}">
    <select class="sn-tg" aria-label="المرحلة"><option value="">كلّ المراحل</option>${SN_STAGES.map(g => `<option${g === t.stage ? ' selected' : ''}>${g}</option>`).join('')}</select>
    <input value="${esc(t.motto || '')}" placeholder="الشعار (اختياريّ)" class="sn-tm"><button type="button" class="x" onclick="this.parentElement.remove()" aria-label="حذف الفريق">×</button></div>`;
}
const snCitySet = () => (snSeason() || {}).settings || {};
const snZones = () => Array.isArray(snCitySet().zones) ? snCitySet().zones : [];
const snPeriods = () => Array.isArray(snCitySet().periods) ? snCitySet().periods : [];
const snZone = id => snZones().find(z => z.id === id);
/* دقائق «يوم البرنامج»: ما قبل ٤ فجراً بعد منتصف الليل (مثل season_hm في القاعدة) */
const snHM = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); if (!m) return null; const h = +m[1]; return h * 60 + +m[2] + (h < 4 ? 1440 : 0); };
const snNowHM = () => snHM(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' }));
const snPeriodNow = () => { const n = snNowHM(); return snPeriods().find(p => n >= snHM(p.f) - 10 && n <= snHM(p.e)) || null; };
const snStagesInSeason = () => { const st = SN_STAGES.filter(g => SN.members.some(m => m.stage === g)); return st.length ? st : ['متوسط', 'ثانوي']; };

/* ═════════ الشاشة ═════════ */
function snCityView() {
  const Z = snZones(), P = snPeriods(), today = snPday(Date.now()), per = snPeriodNow();
  if (!Z.length || !P.length) return `<div class="card">${rEmpty('map', 'المدينة: مناطق يتنقّل بينها الطلاب في فترات اليوم، وكلّ مرحلة تمرّ على كلّ منطقة. ابدأ بقالب «مدينة القيم» ثمّ عدّله.', `<button class="btn btn-gold" onclick="snCityTpl()"><i data-lucide="sparkles"></i> ابدأ بقالب مدينة القيم</button> <button class="btn btn-ghost" onclick="snCitySheet()"><i data-lucide="settings-2"></i> من الصفر</button>`)}</div>`;
  const rows = SN.sched.filter(x => x.kind === 'zone' && x.day === today), rot = SN.sched.filter(x => x.kind === 'zone');
  const att = (SN.patt || []).filter(a => a.day === today), sAtt = (SN.statt || []).filter(a => a.day === today);
  const activeStaff = SN.staff.filter(x => x.active && x.role !== 'guest');
  const nowGrid = per && per.t !== 'all' ? Z.map(z => { const ex = rows.filter(r => r.period === per.id && r.zone === z.id).map(r => r.stage), here = att.filter(a => a.period === per.id && a.zone === z.id), late = here.filter(a => a.late).length, st = activeStaff.filter(x => x.zone === z.id);
      const expN = SN.members.filter(m => ex.includes(m.stage)).length;
      return `<div class="sn-zone" style="--zc:${esc(z.c || '#0A84FF')}"><b>${esc(z.n)}</b><small>${esc(z.p || '')}</small><span class="sn-zst">${ex.length ? ex.map(esc).join('، ') : '—'}</span>
        <span class="sn-zn"><b>${here.length}</b>${expN ? ' / ' + expN : ''} سُجّلوا${late ? ` · <em>${late} متأخّر</em>` : ''}</span><small>${st.length ? st.map(x => esc(x.name.split(' ')[0]) + (sAtt.some(a => a.staff_id === x.id) ? ' ✓' : ' ✗')).join('، ') : 'لا مشرف مثبّت هنا'}</small></div>`; }).join('') : '';
  const lateStaff = sAtt.filter(a => a.late), absent = activeStaff.filter(x => !sAtt.some(a => a.staff_id === x.id));
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snRotSheet()"><i data-lucide="wand-2"></i> مولّد جدول التدوير</button><button class="btn btn-ghost" onclick="snCitySheet()"><i data-lucide="settings-2"></i> المناطق والفترات</button><button class="btn btn-ghost" onclick="snTeamsSheet()"><i data-lucide="home"></i> الأحياء</button><button class="btn btn-ghost" onclick="snBoardsPrint()"><i data-lucide="printer"></i> لوحات المدينة</button></div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="radio"></i> الآن</h3><span class="r-badge" style="--c:${per ? '#30D158' : '#8E8E93'}">${per ? esc(per.n) + ` · <span dir="ltr">${esc(per.f)}–${esc(per.e)}</span>` : 'خارج الفترات'}</span></div>
      ${per && per.t === 'all' ? `<p class="r-sub">${esc(per.n)} — لكلّ المراحل معاً.</p>` : per ? (rows.length ? `<div class="sn-zgrid">${nowGrid}</div>` : '<p class="r-sub">لا جدول تدوير لهذا اليوم — شغّل «مولّد جدول التدوير».</p>') : `<p class="r-sub">الفترات: ${P.map(p => esc(p.n) + ` <span dir="ltr">${esc(p.f)}</span>`).join(' · ')}</p>`}</div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="user-check"></i> المشرفون اليوم</h3><span class="r-sub">${sAtt.length} / ${activeStaff.length} وصلوا</span></div>
      <p class="r-sub">كلّ مشرف يضغط «وصلت» في جوّاله عند موقعه — يُحسب التأخّر من بداية أوّل فترة (سماح ${snCitySet().late || 10} دقائق). «مشرفون في غير مواقعهم» أوّل معيق في تقارير مدينة القيم.</p>
      ${lateStaff.length ? `<p><b>متأخّرون:</b> ${lateStaff.map(a => { const x = SN.staff.find(s => s.id === a.staff_id) || {}; return esc(x.name || '') + ` (${a.minutes} د)`; }).join('، ')}</p>` : ''}
      ${absent.length ? `<details><summary>لم يصلوا بعد (${absent.length})</summary><div class="sn-chips">${absent.map(x => `<span class="sn-chip">${esc(x.name)}${x.zone && snZone(x.zone) ? ' · ' + esc(snZone(x.zone).n) : ''}</span>`).join('')}</div></details>` : ''}</div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="map"></i> المدينة</h3><span class="r-sub">${rot.length ? new Set(rot.map(r => r.day)).size + ' يوم في جدول التدوير' : 'لا جدول تدوير بعد'}</span></div>
      <div class="r-list">${Z.map(z => `<div class="r-item">${z.img ? `<img class="sn-zimg" src="${esc(snImg(z.img))}" alt="">` : `<span class="sn-zdot" style="--zc:${esc(z.c || '#0A84FF')}"></span>`}<span class="r-item-t"><b>${esc(z.n)}</b><small>${esc(z.p || '')} · ${activeStaff.filter(x => x.zone === z.id).length} مشرف</small></span></div>`).join('')}</div>
      <p class="r-sub" style="margin-top:10px">${P.map(p => `${esc(p.n)} <span dir="ltr">${esc(p.f)}–${esc(p.e)}</span>`).join(' · ')}</p></div>
    ${snCityLateCard()}`;
}
/* المتأخّرون في الدخول للفترات اليوم (حسب المرحلة) — «ضبط دخول الفترات» */
function snCityLateCard() {
  const today = snPday(Date.now()), att = (SN.patt || []).filter(a => a.day === today); if (!att.length) return '';
  const by = {}; att.forEach(a => { const m = SN.members.find(x => x.id === a.member_id) || {}; const k = m.stage || 'أخرى'; by[k] = by[k] || { n: 0, l: 0 }; by[k].n++; if (a.late) by[k].l++; });
  return `<div class="card"><h3>دخول الفترات اليوم</h3><div class="r-list">${Object.entries(by).map(([g, v]) => `<div class="r-item"><span class="r-item-t"><b>${esc(g)}</b><small>${v.n} دخول مسجَّل</small></span><span class="sn-mp">${v.l ? Math.round(v.l / v.n * 100) + '٪ متأخّر' : 'في الوقت ✓'}</span></div>`).join('')}</div></div>`;
}

/* ═════════ إعداد المناطق والفترات ═════════ */
async function snCityTpl() {
  const st = snCitySet();
  await snSaveSeason({ settings: Object.assign({}, st, { zones: SN_CITY_TPL.zones, periods: SN_CITY_TPL.periods, late: st.late || 10 }) });
  snPaint(); rToast('أُضيفت مناطق مدينة القيم وفتراتها — عدّلها كما تحتاج');
}
function snCitySheet() {
  const Z = snZones().length ? snZones() : SN_CITY_TPL.zones, P = snPeriods().length ? snPeriods() : SN_CITY_TPL.periods;
  const zr = z => `<div class="sn-trow sn-zrow" data-id="${esc(z.id || '')}"><input type="color" value="${esc(z.c || '#0A84FF')}" class="sn-zc" aria-label="اللون"><select class="sn-zi" aria-label="الصورة"><option value="">بلا صورة</option>${Object.entries((window.JW_LIB || {}).city || {}).map(([k, n]) => `<option value="lib:city/${k}"${z.img === 'lib:city/' + k ? ' selected' : ''}>${n}</option>`).join('')}</select><input value="${esc(z.n || '')}" class="sn-zn2" placeholder="اسم المنطقة"><input value="${esc(z.p || '')}" class="sn-zp" placeholder="المكان"><button type="button" class="x" onclick="this.parentElement.remove()" aria-label="حذف">×</button></div>`;
  const pr = p => `<div class="sn-trow sn-prow" data-id="${esc(p.id || '')}"><input value="${esc(p.n || '')}" class="sn-pn" placeholder="اسم الفترة"><input type="time" value="${esc(p.f || '')}" class="sn-pf" aria-label="من"><input type="time" value="${esc(p.e || '')}" class="sn-pe" aria-label="إلى"><select class="sn-pt" aria-label="النوع"><option value="rot"${p.t !== 'all' ? ' selected' : ''}>تدوير على المناطق</option><option value="all"${p.t === 'all' ? ' selected' : ''}>للجميع معاً (تحفيز، تموين، صلاة)</option></select><button type="button" class="x" onclick="this.parentElement.remove()" aria-label="حذف">×</button></div>`;
  window._snZR = zr; window._snPR = pr;
  openModal('المناطق والفترات', `<h4 class="sn-h">المناطق</h4><p class="r-hint">كلّ مرحلة تمرّ على كلّ منطقة مرّة في اليوم — فاجعل عدد المناطق مثل عدد فترات التدوير أو أكثر، ولا يقلّ عن عدد المراحل.</p>
    <div id="snZR">${Z.map(zr).join('')}</div><button type="button" class="link-btn" onclick="document.getElementById('snZR').insertAdjacentHTML('beforeend',_snZR({}))">+ منطقة</button>
    <h4 class="sn-h">فترات اليوم</h4><div id="snPR">${P.map(pr).join('')}</div><button type="button" class="link-btn" onclick="document.getElementById('snPR').insertAdjacentHTML('beforeend',_snPR({t:'rot'}))">+ فترة</button>
    <div class="field"><label>دقائق السماح قبل أن يُحسب الدخول تأخّراً</label><input id="sn_late" type="number" inputmode="numeric" min="0" max="60" value="${esc(snCitySet().late || 10)}"></div>`, async () => {
      const slug = s => 'z' + Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 5);
      const zones = [...document.querySelectorAll('#snZR .sn-zrow')].map(r => ({ id: r.dataset.id || slug(r.querySelector('.sn-zn2').value + Date.now()), n: r.querySelector('.sn-zn2').value.trim(), p: r.querySelector('.sn-zp').value.trim(), c: r.querySelector('.sn-zc').value, img: r.querySelector('.sn-zi').value })).filter(z => z.n);
      const periods = [...document.querySelectorAll('#snPR .sn-prow')].map((r, i) => ({ id: r.dataset.id || 'p' + (i + 1) + Date.now().toString(36).slice(-3), n: r.querySelector('.sn-pn').value.trim(), f: r.querySelector('.sn-pf').value, e: r.querySelector('.sn-pe').value, t: r.querySelector('.sn-pt').value })).filter(p => p.n && p.f && p.e)
        .sort((a, b) => snHM(a.f) - snHM(b.f));
      if (!zones.length || !periods.length) { rToast('أضف منطقة وفترة على الأقلّ', 1); return; }
      try { await snSaveSeason({ settings: Object.assign({}, snCitySet(), { zones, periods, late: Math.max(0, Math.min(60, parseInt(fval('sn_late'), 10) || 10)) }) }); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}

/* ═════════ مولّد جدول التدوير ═════════
 * لليوم d والفترة p (من فترات التدوير): المرحلة g تذهب إلى المنطقة (g + p + d) mod عدد المناطق
 * ← مراحل مختلفة في مناطق مختلفة دائماً، وكلّ مرحلة تمرّ على كلّ منطقة، والترتيب يدور من يوم لآخر. */
function snRotPlan(o) {
  const Z = snZones(), P = snPeriods(), R = P.filter(p => p.t !== 'all'), out = [];
  const days = []; for (let d = new Date(o.from + 'T12:00:00'); d <= new Date(o.to + 'T12:00:00'); d.setDate(d.getDate() + 1)) { const iso = d.toISOString().slice(0, 10); if (!o.skip.includes(d.getDay())) days.push({ iso, dow: d.getDay() }); }
  days.forEach((dd, di) => {
    const last = o.closing && di === days.length - 1, special = o.special && dd.dow === 5 && !last;
    P.forEach(p => {
      if (p.t === 'all' || special || last) { if (p.t === 'all' || P.filter(x => x.t !== 'all')[0] === p) out.push({ day: dd.iso, starts: p.f, ends: p.e, title: p.t === 'all' ? p.n : last ? o.closingTitle : o.specialTitle, place: '', stage: '', kind: 'break', zone: '', period: p.id }); return; }
      const pi = R.indexOf(p);
      o.stages.forEach((g, gi) => { const z = Z[(gi + pi + di) % Z.length]; out.push({ day: dd.iso, starts: p.f, ends: p.e, title: z.n, place: z.p || '', stage: g, kind: 'zone', zone: z.id, period: p.id }); });
    });
  });
  return { rows: out, days: days.length };
}
function snRotSheet() {
  const s = snSeason(), Z = snZones(), P = snPeriods();
  if (!Z.length || !P.length) { snCitySheet(); return; }
  const st = snStagesInSeason();
  openModal('مولّد جدول التدوير', `<p class="r-hint">يولّد لكلّ يوم: الفترات المشتركة، وتدوير المراحل على المناطق — كلّ مرحلة تمرّ على كلّ منطقة، ولا تلتقي مرحلتان في منطقة. يظهر لكلّ طالب «أين أنا الآن» في جوّاله، ولكلّ مشرف المرحلة القادمة إليه.</p>
    <div class="field"><label>من</label><input id="rot_f" type="date" value="${esc(s.start_date || today())}"></div>
    <div class="field"><label>إلى</label><input id="rot_t" type="date" value="${esc(s.end_date || s.start_date || today())}"></div>
    <div class="field"><label>المراحل المشاركة</label><div class="sn-reasons">${SN_STAGES.slice(0, 4).map(g => `<label class="r-check"><input type="checkbox" class="rot_g" value="${g}"${st.includes(g) ? ' checked' : ''}> ${g}</label>`).join('')}</div></div>
    <div class="field"><label>أيّام الراحة</label><div class="sn-reasons">${SN_DAYS.map((d, i) => `<label class="r-check"><input type="checkbox" class="rot_s" value="${i}"> ${d}</label>`).join('')}</div></div>
    <label class="r-check"><input type="checkbox" id="rot_sp" checked> الجمعة برنامج نوعيّ للجميع</label><div class="field"><input id="rot_spt" value="البرنامج النوعيّ"></div>
    <label class="r-check"><input type="checkbox" id="rot_cl" checked> آخر يوم: التكريم والختام</label><div class="field"><input id="rot_clt" value="التكريم والختام"></div>
    <p class="r-sub">المناطق: ${Z.map(z => esc(z.n)).join('، ')} · فترات التدوير: ${P.filter(p => p.t !== 'all').length}</p>
    <div class="r-hint">يحذف التدوير السابق في هذه الأيّام فقط، وتبقى الأنشطة الأخرى والرحلات.</div>`, async () => {
      const o = { from: fval('rot_f'), to: fval('rot_t'), stages: [...document.querySelectorAll('.rot_g:checked')].map(i => i.value), skip: [...document.querySelectorAll('.rot_s:checked')].map(i => +i.value),
        special: !!fval('rot_sp'), specialTitle: fval('rot_spt') || 'البرنامج النوعيّ', closing: !!fval('rot_cl'), closingTitle: fval('rot_clt') || 'التكريم والختام' };
      if (!o.from || !o.to || o.to < o.from) { rToast('حدّد الأيّام', 1); return; }
      if (!o.stages.length) { rToast('اختر المراحل', 1); return; }
      if (o.stages.length > Z.length) { rToast(`المراحل (${o.stages.length}) أكثر من المناطق (${Z.length}) — أضف منطقة`, 1); return; }
      const plan = snRotPlan(o); if (!plan.rows.length) { rToast('لا أيّام في المدى', 1); return; }
      if (!await snAsk('توليد الجدول؟', `${plan.days} يوماً · ${plan.rows.length} فقرة. يُحذف التدوير السابق في هذه الأيّام.`, 'ولّد', false)) return;
      rToast('جارٍ التوليد…');
      try {
        const old = SN.sched.filter(x => (x.kind === 'zone' || x.kind === 'break') && x.day >= o.from && x.day <= o.to);
        for (const x of old) await RDB.remove('season_schedule', x.id);
        SN.sched = SN.sched.filter(x => !old.includes(x));
        for (const r of plan.rows) SN.sched.push(await RDB.insert('season_schedule', Object.assign({ season_id: SN.cur }, r)));
        closeModal(); snPaint(); rToast(`وُلّد جدول ${plan.days} يوماً ✓`);
      } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}

/* ═════════ لوحات المدينة للطباعة (A4 بالعرض): لوحة لكلّ حيّ ومنطقة ومرفق — كما صمّموها يدويّاً لكلّ موسم ═════════ */
function snBoardsPrint() {
  const s = snSeason(), C = snCur(), st = s.settings || {}, w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  const on = h => { const n = parseInt(String(h).slice(1), 16), L = [n >> 16, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * L[0] + .7152 * L[1] + .0722 * L[2] > .45 ? '#111' : '#fff'; };
  const page = (title, sub, color, small, img) => `<section style="background:${color};color:${on(color)}">${img ? `<img src="${esc(snImg(img))}" alt="">` : ''}<small>${esc(s.name)}</small><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}${small ? `<em>${esc(small)}</em>` : ''}</section>`;
  const pages = snTeams().map(t => page(t.name, t.motto || '', t.color, t.stage ? 'المرحلة ' + t.stage : ''))
    .concat(snZones().map(z => page(z.n, z.p || '', z.c || '#0A84FF', '', z.img)))
    .concat([page('البنك المركزيّ', C.name + ' ' + (C.icon || ''), '#1C1C1E', '', 'lib:city/bank'), st.customs && st.customs.amount ? page(st.customs.name || 'الجمارك', 'الرسم ' + st.customs.amount + ' ' + C.one, '#3A3A3C', '', 'lib:city/customs') : '', page('المتجر', st.preorder ? 'اطلب من جوّالي واستلم هنا' : 'امسح بطاقتك عند الكاونتر', '#0A84FF', '', 'lib:city/store')]).filter(Boolean);
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><title>لوحات المدينة — ${esc(s.name)}</title><style>@page{size:A4 landscape;margin:0}body{margin:0;font-family:system-ui,-apple-system,"SF Arabic",sans-serif}
    section{width:297mm;height:210mm;box-sizing:border-box;padding:24mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    section img{width:62mm;height:62mm;border-radius:14mm;object-fit:cover;margin-bottom:6mm}section small{font-size:20pt;opacity:.75}h1{font-size:96pt;margin:8mm 0;line-height:1.05}p{font-size:30pt;margin:0;font-weight:700}em{font-style:normal;font-size:22pt;margin-top:10mm;opacity:.85}</style>${pages.join('')}<script>onload=()=>print()<\/script>`);
  w.document.close();
}
