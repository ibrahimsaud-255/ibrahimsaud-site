/* ═════════════════════════════════════════════════════════════════════════
 * «التقييم والإغلاق» — حقيبة الموسم المرحلة ٤ (من «مدينة القيم»)
 *   تقييم الفعاليّات بأسئلة سلوكيّة (لا ٩٦٪ «ممتاز جدّاً»): بدأت في وقتها؟ كم تأخّرت؟ المشرف حاضر؟ التجهيز جاهز؟ الحضور والتفاعل
 *   الملاحظات اليوميّة (إيجابيّة · مشكلة · فكرة) من جوّال أيّ مشرف
 *   الدروس المستفادة (settings.lessons) تُورَّث للموسم التالي — «عدم الاستفادة من توصيات النسخ السابقة»
 *   وثيقة الإغلاق: الأرقام، الحضور، المدينة، الاقتصاد، اللجان والماليّة، المؤشّرات (المستهدف مقابل المتحقّق)،
 *   الاستبيانات والقياس القبليّ/البعديّ، التقييم، الملاحظات، الدروس — للمجلس والداعم
 * البيانات: season_evals (db/season-eval.sql) + ما تحمّله بقيّة التبويبات. ملفّ تعريفات فقط.
 * ═════════════════════════════════════════════════════════════════════════ */

const SN_NOTE_CAT = { good: ['إيجابيّة', '#30D158'], issue: ['مشكلة', '#FF453A'], idea: ['فكرة', '#0A84FF'] };
function snEvalStats(E) {
  const ev = (E || SN.evals || []).filter(x => x.kind === 'event'), n = ev.length, pc = f => { const a = ev.filter(x => x[f] != null); return a.length ? Math.round(a.filter(x => x[f]).length / a.length * 100) : null; };
  const late = ev.filter(x => x.on_time === false && x.late_min), eng = ev.filter(x => x.engage), cnt = ev.filter(x => x.count != null);
  return { n, onTime: pc('on_time'), staffOk: pc('staff_ok'), ready: pc('ready'), lateAvg: late.length ? Math.round(late.reduce((a, x) => a + x.late_min, 0) / late.length) : null,
    engage: eng.length ? Math.round(eng.reduce((a, x) => a + x.engage, 0) / eng.length * 10) / 10 : null, count: cnt.length ? Math.round(cnt.reduce((a, x) => a + x.count, 0) / cnt.length) : null };
}
const snLessons = s => { const l = ((s || snSeason() || {}).settings || {}).lessons; return Array.isArray(l) ? l : []; };
const snPrevSeason = () => { const s = snSeason(); return s ? SN.seasons.filter(x => x.id !== s.id && String(x.created_at) < String(s.created_at)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] : null; };

function snCloseView() {
  const S = snEvalStats(), notes = (SN.evals || []).filter(x => x.kind === 'note').sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const ev = (SN.evals || []).filter(x => x.kind === 'event').sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const prev = snPrevSeason(), pl = prev ? snLessons(prev) : [], K = (v, l) => `<span><small>${l}</small><b>${v == null ? '—' : v}</b></span>`;
  return `<div class="sn-acts"><button class="btn btn-gold" onclick="snExpert()"><i data-lucide="sparkles"></i> خبير الموسم</button><button class="btn btn-ghost" onclick="snClosePrint()"><i data-lucide="file-text"></i> وثيقة الإغلاق</button><button class="btn btn-ghost" onclick="snLessonsSheet()"><i data-lucide="lightbulb"></i> الدروس المستفادة</button><button class="btn btn-ghost" onclick="SN.tab='surveys';snPaint()"><i data-lucide="clipboard-list"></i> الاستبيانات</button></div>
    ${pl.length ? `<div class="card sn-prevl"><h3><i data-lucide="history"></i> دروس «${esc(prev.name)}»</h3><p class="r-sub">كتبتموها عند إغلاق الموسم السابق — راجعوها قبل التخطيط:</p><ol>${pl.map(l => `<li>${esc(l)}</li>`).join('')}</ol></div>` : ''}
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="clipboard-check"></i> تقييم الفعاليّات</h3><span class="r-sub">${S.n} تقييم</span></div>
      <p class="r-sub">يسجّله أعضاء «المتابعة والتقييم» من جوّالهم بأسئلة سلوكيّة — رقم يقيس، لا انطباع.</p>
      <div class="sn-fin">${K(S.onTime == null ? null : S.onTime + '٪', 'بدأت في وقتها')}${K(S.lateAvg == null ? null : S.lateAvg + ' د', 'متوسّط التأخّر')}${K(S.staffOk == null ? null : S.staffOk + '٪', 'المشرف حاضر')}${K(S.ready == null ? null : S.ready + '٪', 'التجهيز جاهز')}${K(S.engage == null ? null : S.engage + ' / ٥', 'التفاعل')}${K(S.count, 'متوسّط الحضور')}</div>
      <div class="r-list">${ev.slice(0, 30).map(x => { const st = SN.staff.find(y => y.id === x.staff_id) || {}; return `<div class="r-item"><span class="r-item-t"><b>${esc(x.title)}${x.stage ? ' · ' + esc(x.stage) : ''}</b><small>${esc(fmtD(x.day))} · ${x.on_time === false ? `تأخّرت ${x.late_min || '؟'} د` : x.on_time ? 'في وقتها' : ''}${x.staff_ok === false ? ' · المشرف غائب' : ''}${x.ready === false ? ' · التجهيز ناقص' : ''}${x.engage ? ' · تفاعل ' + x.engage + '/٥' : ''}${x.count != null ? ' · ' + x.count + ' حاضر' : ''}</small>${x.body ? `<small>${esc(x.body)}</small>` : ''}<small>${esc(st.name || '')}</small></span>${x.photo ? `<a class="btn btn-ghost btn-sm" href="${esc(snImg(x.photo))}" target="_blank" rel="noopener">صورة</a>` : ''}</div>`; }).join('') || '<p class="r-sub">لا تقييمات بعد. أعطِ صلاحيّة «تقييم الفعاليّات» لأعضاء المتابعة من «المشرفون»، أو أنشئ لجنة «المتابعة والتقييم».</p>'}</div></div>
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="notebook-pen"></i> الملاحظات اليوميّة</h3><span class="r-sub">${notes.length}</span></div>
      <div class="sn-notecats">${Object.entries(SN_NOTE_CAT).map(([k, [n, c]]) => `<span class="r-badge" style="--c:${c}">${n} ${notes.filter(x => x.cat === k).length}</span>`).join('')}</div>
      <div class="r-list">${notes.slice(0, 40).map(x => { const st = SN.staff.find(y => y.id === x.staff_id) || {}, c = SN_NOTE_CAT[x.cat] || SN_NOTE_CAT.issue; return `<div class="r-item"><span class="sn-zdot" style="--zc:${c[1]}"></span><span class="r-item-t"><b>${esc(x.body)}</b><small>${c[0]} · ${esc(fmtD(x.day))} · ${esc(st.name || '')}</small></span><button type="button" class="btn btn-ghost btn-sm" title="أضفها للدروس المستفادة" onclick="snLessonAdd('${x.id}')"><i data-lucide="lightbulb"></i></button></div>`; }).join('') || '<p class="r-sub">كلّ مشرف يكتب ملاحظته من «المتابعة» في جوّاله — تتجمّع هنا يوماً بيوم.</p>'}</div></div>
    ${snCertCard()}
    <div class="card"><div class="sn-sal-h"><h3><i data-lucide="lightbulb"></i> الدروس المستفادة لهذا الموسم</h3><span class="r-sub">${snLessons().length}</span></div>
      ${snLessons().length ? `<ol class="sn-lessons">${snLessons().map(l => `<li>${esc(l)}</li>`).join('')}</ol>` : '<p class="r-sub">اكتبها قبل إغلاق الموسم — تظهر لمن يجهّز الموسم القادم، فلا تضيع التجربة مع تغيّر المتطوّعين.</p>'}</div>`;
}
function snLessonsSheet() {
  openModal('الدروس المستفادة', `<p class="r-sub">درس في كلّ سطر — ماذا نكرّر؟ ماذا نغيّر؟ (مثل: «فترة التحفيز منفصلة عن التنفيذ»، «تذكير الضيف قبل يومين»).</p>
    <div class="field"><textarea id="ls_t" rows="10">${esc(snLessons().join('\n'))}</textarea></div>`, async () => {
      const lessons = String(fval('ls_t') || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40);
      try { await snSaveSeason({ settings: Object.assign({}, snSeason().settings || {}, { lessons }) }); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
async function snLessonAdd(id) {
  const x = (SN.evals || []).find(e => e.id === id); if (!x) return; const L = snLessons(); if (L.includes(x.body)) { rToast('موجودة في الدروس'); return; }
  try { await snSaveSeason({ settings: Object.assign({}, snSeason().settings || {}, { lessons: L.concat([x.body]).slice(0, 40) }) }); snPaint(); rToast('أُضيفت للدروس المستفادة'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
}

/* ═════════ وثيقة الإغلاق (PDF للطباعة) ═════════ */
async function snClosePrint() {
  const w = window.open('', '_blank'); if (!w) { rToast('اسمح بالنوافذ المنبثقة للطباعة', 1); return; }
  w.document.write('<p style="font-family:system-ui;padding:40px">جارٍ إعداد الوثيقة…</p>');
  if (SN._svLoaded !== SN.cur) { SN._svLoaded = SN.cur; await snSvLoad(); }
  const s = snSeason(), st = s.settings || {}, org = (typeof SAAS_ORG !== 'undefined' && SAAS_ORG && SAAS_ORG.name) || CONFIG.companyName || '', C = snCur(), F = snFin(), E = snEvalStats();
  const regs = SN.regs || [], days = [...new Set(SN.att.map(a => a.day))], avgAtt = days.length && SN.members.length ? Math.round(SN.att.length / days.length / SN.members.length * 100) : null;
  const byStage = {}; SN.members.forEach(m => { const g = m.stage || 'غير محدّد'; byStage[g] = (byStage[g] || 0) + 1; });
  const acts = SN.sched.filter(x => x.kind !== 'break').length, given = SN.coins.filter(c => c.amount > 0 && !/^حوالة/.test(c.reason || '')).reduce((a, c) => a + c.amount, 0);
  const fines = SN.coins.filter(c => c.kind === 'fine').length, bought = SN.coins.filter(c => c.item_id && c.amount < 0).length;
  const lateStaff = (SN.statt || []).filter(a => a.late).length, staffDays = (SN.statt || []).length;
  // المؤشّرات من خطط اللجان: «مؤشّر = المستهدف | المتحقّق»
  const kpis = (SN.coms || []).flatMap(c => ((c.plan || {}).kpis || []).map(k => { const [t, a] = String(k.v || '').split('|').map(x => x.trim()); return { c: c.name, n: k.n, t, a }; }));
  // الاستبيانات + القياس القبليّ/البعديّ بنفس عناوين الأسئلة
  const sv = SN.surveys.map(v => ({ v, st: snSvStats(v, SN.svAns[v.id] || []), n: (SN.svAns[v.id] || []).length })).filter(x => x.n);
  const pre = sv.find(x => /قبليّ/.test(x.v.title)), post = sv.find(x => /بعديّ/.test(x.v.title));
  const avgBy = x => { const o = {}; (x.v.questions || []).forEach(q => { if (q.t === 'stars' && x.st[q.id] && x.st[q.id].n) o[q.l] = x.st[q.id].avg; }); return o; };
  const pp = pre && post ? (() => { const a = avgBy(pre), b = avgBy(post); return Object.keys(a).filter(k => k in b).map(k => ({ k, a: a[k], b: b[k] })); })() : [];
  const notes = (SN.evals || []).filter(x => x.kind === 'note'), issues = notes.filter(x => x.cat === 'issue'), ideas = notes.filter(x => x.cat === 'idea');
  const f1 = v => v == null ? '—' : (Math.round(v * 10) / 10).toLocaleString('en-US');
  const K = (v, l) => `<div class="k"><b>${v == null ? '—' : v}</b><span>${l}</span></div>`;
  const T = (h, rows) => rows.length ? `<table><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => `<td${i ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table>` : '<p class="m">لا بيانات.</p>';
  w.document.open();
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><title>وثيقة إغلاق — ${esc(s.name)}</title><style>
    body{font-family:system-ui,-apple-system,"SF Arabic",sans-serif;padding:30px;color:#111;max-width:920px;margin:auto}h1{margin:0}h2{margin:28px 0 10px;font-size:19px;border-bottom:2px solid #111;padding-bottom:4px}
    .m{color:#555;margin:2px 0}.ks{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.k{border:1px solid #ddd;border-radius:12px;padding:10px 12px}.k b{display:block;font-size:22px}.k span{color:#555;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:13.5px;margin:6px 0}th,td{padding:7px;border-bottom:1px solid #e5e5e5;text-align:right}th{background:#f4f4f5}td.n{font-variant-numeric:tabular-nums}
    ol li{margin:4px 0}@media print{h2{break-after:avoid}}</style>
    <h1>وثيقة إغلاق ${esc(s.name)}</h1><p class="m">${esc(org)}${s.start_date ? ' · من ' + esc(fmtD(s.start_date)) + ' إلى ' + esc(fmtD(s.end_date || s.start_date)) : ''} · أُعدّت ${esc(fmtD(new Date().toISOString().slice(0, 10)))}</p>
    <h2>الأرقام</h2><div class="ks">${K(regs.length || null, 'طلبات التسجيل')}${K(SN.members.length, 'المشاركون')}${K(avgAtt == null ? null : avgAtt + '٪', 'متوسّط الحضور اليوميّ')}${K(days.length, 'أيّام حضور مسجّلة')}${K(acts, 'فقرات وأنشطة في الجدول')}${K(SN.staff.filter(x => x.role !== 'guest').length, 'المشرفون')}${K((SN.coms || []).length, 'اللجان')}${K(E.n, 'فعاليّات مُقيَّمة')}</div>
    <p class="m">حسب المرحلة: ${Object.entries(byStage).map(([g, n]) => esc(g) + ' ' + n).join(' · ')}</p>
    <h2>الاقتصاد والتحفيز</h2><div class="ks">${K(given.toLocaleString('en-US'), 'مُنح من ' + esc(C.name))}${K(bought, 'عمليّة شراء')}${K(fines, 'مخالفة')}${K(staffDays ? Math.round(lateStaff / staffDays * 100) + '٪' : null, 'تأخّر المشرفين')}</div>
    <h2>الماليّة</h2><div class="ks">${K(snSAR(F.income), 'الإيرادات')}${K(snSAR(F.spent), 'المصروف')}${K(snSAR(F.balance), 'الرصيد')}${K(SN.members.length ? snSAR(F.spent / SN.members.length) : null, 'تكلفة المشارك')}</div>
    ${T(['اللجنة', 'الميزانيّة', 'المصروف', 'النسبة'], (SN.coms || []).map(c => { const k = snCom(c); return [esc(c.name), snSAR(k.budget), snSAR(k.spent), k.budget ? k.pct + '٪' : '—']; }))}
    <h2>المؤشّرات</h2>${T(['اللجنة', 'المؤشّر', 'المستهدف', 'المتحقّق'], kpis.map(k => [esc(k.c), esc(k.n), esc(k.t || '—'), esc(k.a || '—')]))}
    <h2>رضا المستفيدين</h2>${T(['الاستبيان', 'الإجابات', 'الرضا'], sv.map(x => [esc(x.v.title), x.n, x.st.sat != null ? x.st.sat + '٪' : '—']))}
    ${pp.length ? `<h2>القياس القبليّ والبعديّ للمهارات</h2>${T(['المهارة', 'قبل', 'بعد', 'الفرق'], pp.map(r => [esc(r.k), f1(r.a), f1(r.b), (r.b - r.a >= 0 ? '+' : '') + f1(r.b - r.a)]))}` : ''}
    <h2>تقييم الفعاليّات</h2><div class="ks">${K(E.onTime == null ? null : E.onTime + '٪', 'بدأت في وقتها')}${K(E.lateAvg == null ? null : E.lateAvg + ' د', 'متوسّط التأخّر')}${K(E.ready == null ? null : E.ready + '٪', 'التجهيز جاهز')}${K(E.engage, 'التفاعل من ٥')}</div>
    ${issues.length ? `<h2>أبرز المشكلات المرصودة</h2><ol>${issues.slice(0, 15).map(x => `<li>${esc(x.body)}</li>`).join('')}</ol>` : ''}
    ${ideas.length ? `<h2>أفكار وتوصيات الفريق</h2><ol>${ideas.slice(0, 15).map(x => `<li>${esc(x.body)}</li>`).join('')}</ol>` : ''}
    <h2>الدروس المستفادة</h2>${snLessons().length ? `<ol>${snLessons().map(l => `<li>${esc(l)}</li>`).join('')}</ol>` : '<p class="m">لم تُكتب بعد.</p>'}
    <script>onload=()=>print()<\/script>`);
  w.document.close();
}

/* ═════════ الشهادات: تُصدر برقم تحقّق، والصفحة نفسها للطباعة والتحقّق (season/cert/?id=) ═════════ */
const SN_CERT_K = { thanks: 'شكر وتقدير', merit: 'تميّز', participation: 'مشاركة' };
const snCertUrl = id => location.origin + location.pathname.replace(/[^/]*$/, '') + 'season/cert/?id=' + id;
function snCertCard() {
  const C = (SN.certs || []).slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))), cs = ((snSeason() || {}).settings || {}).cert || {};
  return `<div class="card"><div class="sn-sal-h"><h3><i data-lucide="award"></i> الشهادات</h3><span class="r-sub">${C.length}</span></div>
    <p class="r-sub">شكر لمقدّمي الورش والمتطوّعين، وتميّز ومشاركة للطلاب — برقم تحقّق ورمز QR. تصدرها لجنة البرامج من جوّالها أيضاً.</p>
    <div class="sn-acts"><button class="btn btn-gold" onclick="snCertSheet()"><i data-lucide="plus"></i> شهادة</button><button class="btn btn-ghost" onclick="snCertSet()"><i data-lucide="settings-2"></i> الموقّع واللون${cs.signer ? ' (' + esc(cs.signer) + ')' : ''}</button></div>
    <div class="r-list">${C.slice(0, 30).map(c => `<div class="r-item"><span class="r-item-t"><b>${esc(c.name)}</b><small>${SN_CERT_K[c.kind] || ''}${c.reason ? ' · ' + esc(c.reason) : ''} · ${esc(fmtD(String(c.created_at).slice(0, 10)))}</small></span><a class="btn btn-ghost btn-sm" href="${esc(snCertUrl(c.id))}" target="_blank" rel="noopener">اعرض</a></div>`).join('')}</div></div>`;
}
function snCertSheet() {
  openModal('شهادة جديدة', `<div class="field"><label>النوع</label><select id="ct_k">${Object.entries(SN_CERT_K).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
    <div class="field"><label>الاسم</label><input id="ct_n" list="ct_nl" maxlength="80"><datalist id="ct_nl">${SN.members.concat(SN.staff).map(m => `<option value="${esc(m.name)}">`).join('')}</datalist></div>
    <div class="field"><label>السبب</label><textarea id="ct_r" rows="3" maxlength="160"></textarea></div>`, async () => {
      const row = { season_id: SN.cur, kind: fval('ct_k'), name: fval('ct_n').trim(), reason: fval('ct_r').trim(), signer: (((snSeason() || {}).settings || {}).cert || {}).signer || '' };
      if (row.name.length < 3) { rToast('اكتب الاسم', 1); return; }
      try { const c = await RDB.insert('season_certs', row); SN.certs.push(c); closeModal(); snPaint(); window.open(snCertUrl(c.id), '_blank'); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}
function snCertSet() {
  const cs = ((snSeason() || {}).settings || {}).cert || {};
  openModal('إعداد الشهادات', `<div class="field"><label>اسم الموقّع وصفته</label><input id="cs_s" value="${esc(cs.signer || '')}" placeholder="مثلاً: مدير البرنامج — عبدالرحمن السلطان"></div>
    <div class="field"><label>عنوان مخصّص (اختياريّ)</label><input id="cs_t" value="${esc(cs.title || '')}" placeholder="شهادة شكر وتقدير"></div>
    <div class="field"><label>لون الشهادة</label><input id="cs_c" type="color" value="${esc(cs.color || '#1003BD')}"></div>`, async () => {
      try { await snSaveSeason({ settings: Object.assign({}, snSeason().settings || {}, { cert: { signer: fval('cs_s').trim(), title: fval('cs_t').trim(), color: fval('cs_c') } }) }); closeModal(); snPaint(); } catch (e) { rToast('تعذّر: ' + (e.message || e), 1); }
    });
}

/* ═════════ «خبير الموسم» — نسخة عرض بلا ذكاء اصطناعيّ ولا تكلفة: يجيب من بيانات الموسم مباشرة ═════════
 * أسئلة جاهزة + سؤال حرّ يُطابَق بكلمات مفتاحيّة. لاحقاً يُربط بنموذج لغويّ يقرأ الوثائق نفسها. */
const SN_XQ = [
  ['members', 'كم مشاركاً عندنا، وكيف توزيعهم؟', /مشارك|طالب|طلاب|عدد|توزيع|مرحل/],
  ['zero', 'من لم يكسب شيئاً اليوم؟', /كسب|اليوم|منسي|ما اخذ|ما أخذ|لم يكسب/],
  ['money', 'كيف ماليّة الموسم؟', /مال|ميزاني|صرف|مصروف|إيراد|ايراد|رصيد الموسم|فلوس/],
  ['issues', 'ما أكثر المشكلات تكراراً؟', /مشكل|مشاكل|شكو|ملاحظ|تأخ/],
  ['staff', 'كيف التزام المشرفين؟', /مشرف|التزام|حضور المشرف|اعتذار|متأخ/],
  ['lessons', 'ما الدروس المستفادة؟', /درس|دروس|توصي|نكرر|نغير|السابق/],
  ['rich', 'من الأعلى رصيداً؟', /أعلى|اعلى|أغنى|اغنى|رصيد|ترتيب الطلاب/],
  ['league', 'كيف وضع الدوري؟', /دوري|مباراة|فريق|هداف|هدّاف|كرة/],
];
const snPl = (n, one, two, few, many) => n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? n + ' ' + few : n + ' ' + many;
function snExpertAns(k) {
  const L = s => `<p>${s}</p>`, li = a => a.length ? `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
  if (k === 'members') { const by = {}; SN.members.forEach(m => by[m.stage || 'غير محدّد'] = (by[m.stage || 'غير محدّد'] || 0) + 1); const regs = (SN.regs || []).filter(r => r.status === 'new' || r.status === 'paid').length;
    return L(`عندكم <b>${snPl(SN.members.length, 'مشارك واحد', 'مشاركان', 'مشاركين', 'مشاركاً')}</b>.`) + li(Object.entries(by).map(([g, n]) => `${esc(g)}: ${n}`)) + (regs ? L(`وفي التسجيل ${regs} طلباً ينتظر الاعتماد.`) : ''); }
  if (k === 'zero') { const today = snPday(Date.now()), earn = new Set(SN.coins.filter(c => c.amount > 0 && snPday(c.created_at) === today).map(c => c.member_id)), z = SN.members.filter(m => !earn.has(m.id));
    return L(`<b>${z.length}</b> من ${SN.members.length} لم يكسبوا شيئاً اليوم.`) + li(z.slice(0, 12).map(m => `#${m.no || ''} ${esc(m.name)} — ${esc(m.stage || '')}`)) + (z.length ? L('أرسل القائمة لمشرفي المراحل قبل الختام.') : ''); }
  if (k === 'money') { const F = snFin(), hot = (SN.coms || []).map(c => ({ c, k: snCom(c) })).filter(x => x.k.budget && x.k.pct >= 80);
    return L(`الإيرادات <b>${snSAR(F.income)}</b> ر.س، والمصروف <b>${snSAR(F.spent)}</b>، والرصيد <b>${snSAR(F.balance)}</b>.`) + (SN.members.length && F.spent ? L(`تكلفة المشارك حتى الآن ${snSAR(F.spent / SN.members.length)} ر.س.`) : '') + (hot.length ? L('لجان تجاوزت ٨٠٪ من ميزانيّتها:') + li(hot.map(x => `${esc(x.c.name)}: ${x.k.pct}٪`)) : L('لا لجنة تجاوزت ٨٠٪ من ميزانيّتها.')); }
  if (k === 'issues') { const N = (SN.evals || []).filter(x => x.kind === 'note' && x.cat === 'issue'), E = (SN.evals || []).filter(x => x.kind === 'event'), S = snEvalStats();
    const words = {}; N.forEach(n => String(n.body).split(/[\s،.]+/).filter(w => w.length > 3).forEach(w => words[w] = (words[w] || 0) + 1)); const top = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 5).filter(x => x[1] > 1);
    return L(N.length ? `سُجّلت <b>${snPl(N.length, 'مشكلة واحدة', 'مشكلتان', 'مشكلات', 'مشكلة')}</b> في الملاحظات اليوميّة.` : 'لا مشكلات مسجّلة في الملاحظات اليوميّة بعد.') + (top.length ? L('أكثر الكلمات تكراراً: ' + top.map(([w, n]) => `«${esc(w)}» (${n})`).join('، ')) : '') + li(N.slice(-5).reverse().map(n => esc(n.body)))
      + (S.n ? L(`ومن تقييم ${S.n} فعاليّة: بدأت في وقتها ${S.onTime ?? '—'}٪، والتجهيز جاهز ${S.ready ?? '—'}٪${S.lateAvg ? `، ومتوسّط التأخّر ${S.lateAvg} دقيقة` : ''}.`) : ''); }
  if (k === 'staff') { const A = SN.statt || [], late = A.filter(a => a.late), by = {}; late.forEach(a => by[a.staff_id] = (by[a.staff_id] || 0) + 1);
    const worst = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => `${esc((SN.staff.find(x => x.id === id) || {}).name || '')}: ${n} مرّات`);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' }), ex = (SN.excuses || []).filter(e => e.day >= today);
    return L(A.length ? `سُجّل وصول المشرفين <b>${A.length}</b> مرّة، تأخّروا في <b>${Math.round(late.length / A.length * 100)}٪</b> منها.` : 'لم يُسجّل المشرفون «وصلت» بعد — فعّلوا المناطق والفترات من «المدينة».') + (worst.length ? L('الأكثر تأخّراً:') + li(worst) : '') + (ex.length ? L(`و${ex.length} اعتذاراً مسبقاً في الأيّام القادمة.`) : ''); }
  if (k === 'lessons') { const prev = snPrevSeason(), pl = prev ? snLessons(prev) : [], cur = snLessons();
    return (pl.length ? L(`من «${esc(prev.name)}»:`) + li(pl.map(esc)) : L('لا دروس محفوظة من موسم سابق.')) + (cur.length ? L('ومن هذا الموسم:') + li(cur.map(esc)) : L('اكتبوا دروس هذا الموسم من «الدروس المستفادة» قبل الإغلاق.')); }
  if (k === 'rich') { const r = SN.members.map(m => ({ m, b: snBal(m.id) })).sort((a, b) => b.b - a.b).slice(0, 5);
    return L(`الأعلى رصيداً من ${esc(snCur().name)}:`) + li(r.map(x => `${esc(x.m.name)} — ${x.b}`)); }
  if (k === 'league') { const lg = (SN.leagues || [])[0]; if (!lg) return L('لا دوري بعد — أنشئه من تبويب «الدوري».'); const G = snLg(lg), S = LGE.standings(G), sc = LGE.scorers(G);
    return L(`${esc(lg.name)}: لُعبت ${G.matches.filter(m => m.s === 'done').length} من ${G.matches.length} مباراة.`) + li(S.slice(0, 4).map((r, i) => `${i + 1}. ${esc(r.name)} — ${r.pts} نقطة`)) + (sc.length ? L('الهدّاف: ' + esc(sc[0].n) + ' (' + sc[0].g + ')') : ''); }
  return L('لم أفهم السؤال — جرّب أحد الأسئلة الجاهزة.');
}
function snExpert() {
  openModal('خبير الموسم', `<p class="r-sub">نسخة عرض: يجيب من بيانات موسمك مباشرة — بلا ذكاء اصطناعيّ ولا تكلفة.</p>
    <div class="sn-xq">${SN_XQ.map(([k, q]) => `<button type="button" class="sn-rs" onclick="snExpertAsk('${k}')">${q}</button>`).join('')}</div>
    <div id="snXL" class="sn-xl"></div>
    <div class="sn-xin"><input id="snXI" placeholder="اسأل عن موسمك…" onkeydown="if(event.key==='Enter')snExpertFree()"><button type="button" class="btn btn-gold btn-sm" onclick="snExpertFree()">اسأل</button></div>`);
}
function snExpertAsk(k, q) {
  const box = document.getElementById('snXL'); if (!box) return; const Q = q || (SN_XQ.find(x => x[0] === k) || [])[1] || '';
  box.insertAdjacentHTML('beforeend', `<div class="sn-xm q">${esc(Q)}</div><div class="sn-xm a">${snExpertAns(k)}</div>`); box.lastElementChild.scrollIntoView({ block: 'nearest' });
}
function snExpertFree() {
  const i = document.getElementById('snXI'), q = (i.value || '').trim(); if (!q) return; i.value = '';
  const hit = SN_XQ.find(x => x[2].test(q)); snExpertAsk(hit ? hit[0] : '', q);
}
