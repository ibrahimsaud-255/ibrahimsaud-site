/*
 * 26-org-erp.js — تطبيقات تشغيل الجمعية (ERP): المستفيدون، التطوع، الموارد البشرية، طلباتي الإدارية،
 * المشتريات والموردون، الحوكمة، المنح والشراكات، الصادر والوارد.
 * مبنية على محرّك سجلات واحد (ERP_T): تعريف الجدول = قائمة + نموذج + بحث + فلاتر + دورة اعتماد + طباعة.
 * القواعد مأخوذة من لوائح الجمعية: لائحة العمل التطوعي، لائحة الموارد البشرية، سياسة الشراء، لائحة الصلاحيات،
 * سياسة تعارض المصالح، ومواعيد اللائحة المالية.
 * ⚠️ تعريفات فقط.
 */
const ERP = { mod: '', tab: '', rows: {}, q: '', f: '', year: new Date().getFullYear() };
const EST = (t, c) => ({ t, c });
const erpBadge = (map, k) => { const s = map[k] || { t: k || '—', c: '#94a3b8' }; return `<span class="r-badge" style="--c:${s.c}">${s.t}</span>`; };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5) + 1;
const addDays = (d, n) => { const x = new Date((d || today()) + 'T00:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const memName = id => id ? memberName(id) : '—';
const myMgrOf = m => ORG.members.find(x => x.role === 'manager' && x.dept === (m || {}).dept && x.active !== false);

/* ═════════ الحالات ═════════ */
const BEN_CAT = { secondary: 'طلاب المرحلة الثانوية', university: 'طلاب جامعيون', graduates: 'خريجون', youth: 'شباب', workers: 'عاملون مع الشباب', kids: 'أطفال ويافعون', other: 'أخرى' };
const ENR_ST = { registered: EST('مسجّل', '#6C8EBF'), accepted: EST('مقبول', '#41747F'), attending: EST('منتظم', '#CAB05F'), completed: EST('أتمّ البرنامج', '#22c55e'), dropped: EST('منسحب', '#94a3b8') };
const VOL_ST = { candidate: EST('مرشّح', '#6C8EBF'), active: EST('نشط', '#22c55e'), paused: EST('متوقف', '#94a3b8') };
const HRS_ST = { pending: EST('بانتظار الاعتماد', '#f59e0b'), approved: EST('معتمدة', '#22c55e'), rejected: EST('مرفوضة', '#ef4444') };
const HR_KINDS = { annual: 'إجازة سنوية', sick: 'إجازة مرضية', emergency: 'إجازة اضطرارية', exam: 'إجازة امتحانات', unpaid: 'إجازة بدون راتب', permission: 'استئذان (ساعات)', mission: 'انتداب / مهمة عمل', letter: 'خطاب تعريف', advance: 'سلفة شخصية', other: 'طلب آخر' };
const HR_ST = { pending_manager: EST('بانتظار المدير المباشر', '#f59e0b'), pending_hr: EST('بانتظار الموارد البشرية', '#CAB05F'), approved: EST('معتمد', '#22c55e'), rejected: EST('مرفوض', '#ef4444'), cancelled: EST('ملغى', '#94a3b8') };
const DOC_KINDS = { contract: 'عقد العمل', id: 'الهوية الوطنية / الإقامة', passport: 'جواز السفر', certificate: 'المؤهل العلمي', medical: 'التأمين الطبي', gosi: 'شهادة التأمينات', other: 'مستند آخر' };
const CONTRACT = { full: 'دوام كامل', part: 'دوام جزئي', temp: 'عقد مؤقت / مشروع', consult: 'متعاون / استشاري' };
const REV_ST = { draft: EST('مسودة', '#94a3b8'), submitted: EST('أُرسل للموظف', '#f59e0b'), acknowledged: EST('اطّلع الموظف', '#22c55e') };
const CASE_ST = { open: EST('قيد الإجراء', '#f59e0b'), done: EST('مكتمل', '#22c55e') };
const REV_CRITERIA = ['جودة العمل وإتقانه', 'الإنجاز في الوقت المحدد', 'المبادرة وحل المشكلات', 'العمل بروح الفريق والتواصل', 'الالتزام بقيم الجمعية ولوائحها', 'تطوير الذات والتعلم'];
const CASE_STEPS = {
  on: ['توقيع عقد العمل وتوثيقه في منصة قوى', 'التسجيل في التأمينات الاجتماعية', 'استكمال ملف الموظف ورفع الوثائق (الهوية، المؤهل، الآيبان)', 'إنشاء حساب النظام والبريد الرسمي وتحديد الصلاحيات', 'تسليم العهد العينية وتسجيلها في سجل الأصول', 'الاطلاع على لائحة الموارد البشرية والميثاق الأخلاقي والإقرار بهما', 'تعبئة إقرار تعارض المصالح', 'تحديد المدير المباشر وأهداف فترة التجربة', 'جولة تعريفية بالإدارات والبرامج', 'تقييم نهاية فترة التجربة (قبل اليوم 90)'],
  off: ['استلام طلب الاستقالة أو قرار إنهاء الخدمة واعتماده', 'تسليم المهام والملفات والمخرجات للبديل', 'استرداد العهد العينية (أجهزة، مفاتيح، بطاقات)', 'تسوية العهد النقدية والسلف', 'إيقاف حساب النظام والبريد والصلاحيات', 'احتساب مكافأة نهاية الخدمة والمستحقات', 'إنهاء العقد في قوى وإيقاف التأمينات', 'إصدار شهادة الخبرة', 'المخالصة النهائية وتوقيعها'],
};
const revScore = r => { const S = (r.scores || []).map(x => +x.s).filter(Boolean); if (!S.length) return '—'; const a = S.reduce((s, v) => s + v, 0) / S.length; return `<b>${a.toFixed(1)}</b>/5 <span class="r-sub">${a >= 4.5 ? 'ممتاز' : a >= 3.5 ? 'جيد جداً' : a >= 2.5 ? 'جيد' : a >= 1.5 ? 'مقبول' : 'ضعيف'}</span>`; };
const PR_ST = { request: EST('طلب شراء', '#6C8EBF'), budget_ok: EST('الاعتماد متوفر — جمع العروض', '#41747F'), pending_approval: EST('بانتظار اعتماد ' + TERMS.head, '#f59e0b'), approved: EST('معتمد', '#CAB05F'), ordered: EST('صدر أمر الشراء', '#8b5cf6'), received: EST('استُلم — بانتظار الصرف', '#0ea5e9'), invoiced: EST('حُوّل لسند صرف', '#22c55e'), rejected: EST('مرفوض', '#ef4444') };
const MEET_BODY = { board: 'مجلس الإدارة', assembly: 'الجمعية العمومية', executive: 'اللجنة التنفيذية', audit: 'لجنة المراجعة', other: 'لجنة أخرى' };
const MEET_ST = { planned: EST('مجدول', '#6C8EBF'), held: EST('عُقد', '#41747F'), minutes: EST('اعتُمد المحضر', '#22c55e'), cancelled: EST('ملغى', '#94a3b8') };
const DEC_ST = { open: EST('قيد التنفيذ', '#f59e0b'), done: EST('منفّذ', '#22c55e'), late: EST('متأخر', '#ef4444'), cancelled: EST('ملغى', '#94a3b8') };
const CMP_ST = { open: EST('قادم', '#6C8EBF'), done: EST('مُنجز', '#22c55e') };
const GRANT_ST = { idea: EST('فكرة', '#94a3b8'), drafting: EST('قيد الإعداد', '#6C8EBF'), submitted: EST('مقدّم', '#f59e0b'), approved: EST('معتمد', '#22c55e'), active: EST('قيد التنفيذ', '#41747F'), closed: EST('مغلق', '#64748b'), rejected: EST('غير مقبول', '#ef4444') };
const PART_ST = { active: EST('سارية', '#22c55e'), renewal: EST('بحاجة لتجديد', '#f59e0b'), ended: EST('منتهية', '#94a3b8') };
const MAIL_ST = { open: EST('قيد المتابعة', '#f59e0b'), replied: EST('تم الرد', '#22c55e'), closed: EST('مغلق', '#94a3b8') };

/* ═════════ تعريف السجلات ═════════
 * fields: [مفتاح, عنوان, نوع, خيارات, تلميح]  — الأنواع: text textarea select date num money bool url phone member program donor supplier list-obj
 */
const ERP_T = {
  beneficiaries: { name: 'سجل المستفيدين', single: 'مستفيد', icon: 'users-round', title: 'name', search: ['name', 'phone', 'school', 'city'], filter: ['category', BEN_CAT],
    cols: [['الاسم', r => `<b>${esc(r.name)}</b>${r.school ? `<div class="r-sub">${esc(r.school)}</div>` : ''}`], ['الفئة', r => BEN_CAT[r.category] || '—'], ['الجنس', r => r.gender === 'f' ? 'أنثى' : 'ذكر'], ['الجوال', r => `<span dir="ltr">${esc(r.phone)}</span>`], ['البرامج', r => (ERP.rows.enrollments || []).filter(e => e.beneficiary_id === r.id).map(e => esc(programName(e.program_id))).join('، ') || '—']],
    fields: [['name', 'الاسم الرباعي', 'text'], ['gender', 'الجنس', 'select', { m: 'ذكر', f: 'أنثى' }], ['birth_year', 'سنة الميلاد', 'num'], ['category', 'الفئة', 'select', BEN_CAT], ['phone', 'الجوال', 'phone'], ['guardian_phone', 'جوال ولي الأمر (لمن هم دون 18)', 'phone'], ['city', 'المدينة / الحي', 'text'], ['school', 'المدرسة / الجامعة / جهة العمل', 'text'], ['consent', 'موافقة على استخدام البيانات والصور (سياسة الخصوصية)', 'bool'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ gender: 'm', category: 'secondary', city: 'الأحساء', consent: true }),
    view: r => `<h4>البرامج المسجّل فيها</h4>${erpMini('enrollments', e => e.beneficiary_id === r.id)}<button class="link-btn" onclick="closeModal();erpEdit('enrollments',null,{beneficiary_id:'${r.id}'})">+ تسجيل في برنامج</button>` },
  enrollments: { name: 'التسجيل والحضور', single: 'تسجيل', icon: 'clipboard-check', title: r => benName(r.beneficiary_id), search: ['cohort'], filter: ['status', ENR_ST], status: ['status', ENR_ST],
    cols: [['المستفيد', r => `<b>${esc(benName(r.beneficiary_id))}</b>`], ['البرنامج', r => esc(programName(r.program_id))], ['الدفعة', r => esc(r.cohort || '—')], ['الحضور', r => attPct(r)], ['ساعات', r => sar0(r.hours)], ['الحالة', r => erpBadge(ENR_ST, r.status)]],
    fields: [['beneficiary_id', 'المستفيد', 'ref', 'beneficiaries'], ['program_id', 'البرنامج', 'program'], ['cohort', 'الدفعة / النسخة', 'text', '', 'مثال: نسخة 2026'], ['status', 'الحالة', 'select', Object.fromEntries(Object.entries(ENR_ST).map(([k, v]) => [k, v.t]))], ['hours', 'ساعات التدريب المحققة', 'num'], ['pre_score', 'التقييم القبلي (من 100)', 'num'], ['post_score', 'التقييم البعدي (من 100)', 'num'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ status: 'registered', cohort: 'نسخة ' + new Date().getFullYear(), hours: 0 }),
    acts: r => r.status === 'completed' ? `<button class="btn btn-ghost" onclick="erpCertificate('enrollments','${r.id}')"><i data-lucide="award"></i> شهادة إتمام</button>` : '' },
  volunteers: { name: 'سجل المتطوعين', single: 'متطوع', icon: 'hand-heart', title: 'name', search: ['name', 'phone', 'skills'], filter: ['status', VOL_ST], status: ['status', VOL_ST],
    cols: [['المتطوع', r => `<b>${esc(r.name)}</b><div class="r-sub">${esc(r.skills || '')}</div>`], ['الجوال', r => `<span dir="ltr">${esc(r.phone)}</span>`], ['الساعات المعتمدة', r => `<b>${sar0(volHours(r.id))}</b>`], ['منذ', r => fmtD(r.joined_at)], ['الحالة', r => erpBadge(VOL_ST, r.status)]],
    fields: [['name', 'الاسم', 'text'], ['gender', 'الجنس', 'select', { m: 'ذكر', f: 'أنثى' }], ['phone', 'الجوال', 'phone'], ['email', 'البريد', 'phone'], ['skills', 'المهارات والخبرات', 'textarea'], ['availability', 'الوقت المتاح', 'text'], ['platform_id', 'رقم المتطوع في المنصة الوطنية للعمل التطوعي', 'text'], ['joined_at', 'تاريخ الانضمام', 'date'], ['status', 'الحالة', 'select', Object.fromEntries(Object.entries(VOL_ST).map(([k, v]) => [k, v.t]))], ['notes', 'ملاحظات وتقييم', 'textarea']],
    defaults: () => ({ status: 'active', gender: 'm', joined_at: today() }),
    view: r => `<h4>الساعات التطوعية</h4>${erpMini('volunteer_hours', h => h.volunteer_id === r.id)}<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="link-btn" onclick="closeModal();erpEdit('volunteer_hours',null,{volunteer_id:'${r.id}'})">+ تسجيل ساعات</button><button class="link-btn" onclick="erpCertificate('volunteers','${r.id}')">شهادة الساعات التطوعية</button></div>` },
  volunteer_hours: { name: 'الساعات التطوعية', single: 'ساعات تطوع', icon: 'timer', title: r => volName(r.volunteer_id), search: ['task'], filter: ['status', HRS_ST], status: ['status', HRS_ST], order: 'date',
    cols: [['المتطوع', r => `<b>${esc(volName(r.volunteer_id))}</b>`], ['التاريخ', r => fmtD(r.date)], ['البرنامج / الفعالية', r => esc(programName(r.program_id) || r.event || '—')], ['المهمة', r => esc(r.task)], ['الساعات', r => `<b>${sar0(r.hours)}</b>`], ['الحالة', r => erpBadge(HRS_ST, r.status)]],
    fields: [['volunteer_id', 'المتطوع', 'ref', 'volunteers'], ['date', 'التاريخ', 'date'], ['program_id', 'البرنامج', 'program'], ['event', 'الفعالية (إن لم تكن برنامجاً)', 'text'], ['task', 'المهمة المنفذة', 'text'], ['hours', 'عدد الساعات', 'num'], ['supervisor', 'المشرف', 'member']],
    defaults: () => ({ date: today(), status: 'pending', hours: 4 }),
    flow: r => r.status === 'pending' && can('volunteers') && isManager() ? [{ to: 'approved', label: 'اعتماد الساعات', patch: () => ({ approved_by: ME.id }) }, { to: 'rejected', label: 'رفض', ghost: 1 }] : [] },
  hr_requests: { name: 'طلبات الموظفين', single: 'طلب', icon: 'file-user', title: r => (HR_KINDS[r.kind] || 'طلب') + ' — ' + memName(r.member_id), search: ['reason'], filter: ['status', HR_ST], status: ['status', HR_ST],
    cols: [['الموظف', r => `<b>${esc(memName(r.member_id))}</b>`], ['الطلب', r => HR_KINDS[r.kind] || r.kind], ['الفترة', r => r.from_date ? fmtD(r.from_date) + (r.to_date && r.to_date !== r.from_date ? ' — ' + fmtD(r.to_date) : '') : '—'], ['الأيام', r => r.days || '—'], ['الحالة', r => erpBadge(HR_ST, r.status)]],
    fields: [['member_id', 'الموظف', 'member'], ['kind', 'نوع الطلب', 'select', HR_KINDS], ['from_date', 'من تاريخ', 'date'], ['to_date', 'إلى تاريخ', 'date'], ['amount', 'المبلغ (للسلفة)', 'money'], ['reason', 'التفاصيل / السبب', 'textarea'], ['attachment_url', 'مرفق (تقرير طبي / مستند) — رابط Drive', 'url']],
    defaults: () => ({ member_id: ME.id, kind: 'annual', from_date: today(), to_date: today(), status: 'pending_manager' }),
    flow: r => hrFlow(r), acts: r => r.status === 'approved' ? `<button class="btn btn-ghost" onclick="hrPrint('${r.id}')"><i data-lucide="printer"></i> طباعة القرار</button>` : '' },
  hr_docs: { name: 'وثائق الموظفين', single: 'وثيقة', icon: 'id-card', title: r => (DOC_KINDS[r.kind] || '') + ' — ' + memName(r.member_id), search: ['number'], order: 'expiry', asc: 1,
    cols: [['الموظف', r => `<b>${esc(memName(r.member_id))}</b>`], ['الوثيقة', r => DOC_KINDS[r.kind] || r.kind], ['الرقم', r => esc(r.number)], ['تنتهي', r => expiryChip(r.expiry)], ['', r => r.url ? linkChip({ url: r.url, title: 'الملف' }) : '']],
    fields: [['member_id', 'الموظف', 'member'], ['kind', 'الوثيقة', 'select', DOC_KINDS], ['number', 'الرقم', 'text'], ['issued', 'تاريخ الإصدار', 'date'], ['expiry', 'تاريخ الانتهاء', 'date'], ['url', 'نسخة الملف (Google Drive)', 'url'], ['notes', 'ملاحظات', 'text']],
    defaults: () => ({ kind: 'contract' }) },
  hr_profiles: { name: 'ملفات الموظفين', single: 'ملف موظف', icon: 'id-card', title: r => memName(r.member_id), search: ['national_id', 'qualification'],
    cols: [['الموظف', r => `<b>${esc(memName(r.member_id))}</b>`], ['العقد', r => CONTRACT[r.contract_type] || '—'], ['المباشرة', r => fmtD(r.hire_date)], ['نهاية التجربة', r => r.probation_end && r.probation_end >= today() ? expiryChip(r.probation_end) : '—'], ['نهاية العقد', r => expiryChip(r.contract_end)]],
    fields: [['member_id', 'الموظف', 'member'], ['national_id', 'رقم الهوية / الإقامة', 'text'], ['nationality', 'الجنسية', 'text'], ['birth_date', 'تاريخ الميلاد', 'date'], ['hire_date', 'تاريخ المباشرة', 'date'], ['contract_type', 'نوع العقد', 'select', CONTRACT], ['contract_end', 'تاريخ نهاية العقد', 'date'], ['probation_end', 'نهاية فترة التجربة (90 يوماً)', 'date'],
      ['qualification', 'المؤهل والتخصص', 'text'], ['phone2', 'جوال للطوارئ (الاسم والرقم)', 'text'], ['address', 'العنوان الوطني', 'text'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ contract_type: 'full', nationality: 'سعودي', hire_date: today(), probation_end: addDays(today(), 89) }) },
  hr_reviews: { name: 'التقييم السنوي', single: 'تقييم أداء', icon: 'star', title: r => 'تقييم ' + r.period + ' — ' + memName(r.member_id), search: ['strengths', 'improve'], status: ['status', REV_ST], filter: ['status', REV_ST],
    cols: [['الموظف', r => `<b>${esc(memName(r.member_id))}</b>`], ['الفترة', r => esc(r.period)], ['المقيّم', r => esc(memName(r.reviewer))], ['النتيجة', r => revScore(r)], ['الحالة', r => erpBadge(REV_ST, r.status)]],
    fields: [['member_id', 'الموظف', 'member'], ['period', 'الفترة', 'text'], ['reviewer', 'المقيّم (المدير المباشر)', 'member'], ['scores', 'معايير التقييم (من 5)', 'list-obj', [['c', 'المعيار'], ['s', 'الدرجة 1-5']]], ['strengths', 'نقاط القوة', 'textarea'], ['improve', 'فرص التحسين وخطة التطوير', 'textarea'], ['goals', 'أهداف الفترة القادمة', 'textarea']],
    defaults: () => ({ period: String(new Date().getFullYear()), reviewer: ME.id, status: 'draft', scores: REV_CRITERIA.map(c => ({ c, s: '' })) }),
    flow: r => r.status === 'draft' && (r.reviewer === ME.id || can('hr')) ? [{ to: 'submitted', label: 'اعتماد التقييم وإرساله للموظف' }] : r.status === 'submitted' && r.member_id === ME.id ? [{ to: 'acknowledged', label: 'اطلعت على التقييم', ask: 'ملاحظاتك على التقييم (اختياري):' }] : [] },
  hr_cases: { name: 'التهيئة وإنهاء الخدمة', single: 'إجراء', icon: 'route', title: r => (r.kind === 'off' ? 'إنهاء خدمة' : 'تهيئة') + ' — ' + memName(r.member_id), search: ['notes'], filter: ['kind', { on: 'تهيئة موظف جديد', off: 'إنهاء خدمة ومخالصة' }], status: ['status', CASE_ST],
    cols: [['الموظف', r => `<b>${esc(memName(r.member_id))}</b>`], ['الإجراء', r => r.kind === 'off' ? 'إنهاء خدمة ومخالصة' : 'تهيئة موظف جديد'], ['التقدم', r => { const n = (r.items || []).length, d = (r.items || []).filter(i => /^(نعم|✓|y)/i.test(i.done || '')).length; return `<div class="r-mini"><span style="width:${n ? d / n * 100 : 0}%;background:#41747F"></span></div> ${d}/${n}`; }], ['التاريخ', r => fmtD(r.date)], ['الحالة', r => erpBadge(CASE_ST, r.status)]],
    fields: [['member_id', 'الموظف', 'member'], ['kind', 'الإجراء', 'select', { on: 'تهيئة موظف جديد', off: 'إنهاء خدمة ومخالصة' }], ['date', 'تاريخ المباشرة / آخر يوم عمل', 'date'], ['items', 'خطوات الإجراء (اكتب «نعم» عند الإنجاز)', 'list-obj', [['t', 'الخطوة'], ['done', 'تم؟'], ['note', 'ملاحظة']]], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ kind: 'on', date: today(), status: 'open', items: CASE_STEPS.on.map(t => ({ t, done: '', note: '' })) }),
    view: r => r.kind === 'off' ? offboardChecks(r) : '',
    flow: r => r.status === 'open' && can('hr') ? [{ to: 'done', label: r.kind === 'off' ? 'إتمام المخالصة النهائية' : 'إتمام التهيئة', check: x => { const left = (x.items || []).filter(i => !/^(نعم|✓|y)/i.test(i.done || '')); return left.length ? 'باقي ' + left.length + ' خطوة لم تُنجز' + (x.kind === 'off' ? ' — لا مخالصة قبل تسليم العهد (اللائحة المالية)' : '') : ''; } }] : [] },
  suppliers: { name: 'سجل الموردين', single: 'مورد', icon: 'store', title: 'name', search: ['name', 'category', 'contact'], filter: ['approved', { true: 'معتمد', false: 'غير معتمد' }],
    cols: [['المورد', r => `<b>${esc(r.name)}</b><div class="r-sub">${esc(r.category || '')}</div>`], ['التواصل', r => esc(r.contact || '') + (r.phone ? `<div class="r-sub" dir="ltr" style="text-align:right">${esc(r.phone)}</div>` : '')], ['السجل / الضريبي', r => `<span class="r-sub">${esc(r.cr || '—')} · ${esc(r.vat || '—')}</span>`], ['التقييم', r => '★'.repeat(+r.rating || 0) || '—'], ['', r => r.approved ? '<span class="r-badge" style="--c:#22c55e">معتمد ' + esc(r.approved_year || '') + '</span>' : '']],
    fields: [['name', 'اسم المورد', 'text'], ['category', 'التصنيف (طباعة، ضيافة، تجهيزات…)', 'text'], ['contact', 'مسؤول التواصل', 'text'], ['phone', 'الجوال', 'phone'], ['email', 'البريد', 'phone'], ['cr', 'السجل التجاري', 'text'], ['vat', 'الرقم الضريبي', 'text'], ['iban', 'الآيبان', 'phone'], ['rating', 'التقييم (1-5)', 'num'], ['approved', 'مورد معتمد', 'bool'], ['approved_year', 'سنة الاعتماد (يُحدّث سنوياً)', 'text'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ approved: true, approved_year: String(new Date().getFullYear()), rating: 4 }) },
  purchase_requests: { name: 'طلبات الشراء', single: 'طلب شراء', icon: 'shopping-cart', title: r => (r.number ? 'PR-' + r.number + ' — ' : '') + r.title, search: ['title', 'po_number'], filter: ['status', PR_ST], status: ['status', PR_ST], number: 'number',
    cols: [['رقم', r => `<b>${r.number ? 'PR-' + r.number : '—'}</b>`], ['الطلب', r => `<b>${esc(r.title)}</b><div class="r-sub">${esc((DEPTS[r.dept] || {}).short || '')} · ${esc(programName(r.program_id) || 'عام')}</div>`], ['التقدير', r => sar(r.est_total)], ['العروض', r => (r.quotes || []).length + ((+r.est_total > (CONFIG.finance || {}).quotesLimit && (r.quotes || []).length < 3) ? ' <span class="r-chip" style="--c:#ef4444">يلزم 3</span>' : '')], ['الحالة', r => erpBadge(PR_ST, r.status) + (+r.est_total > (CONFIG.finance || {}).boardLimit ? ' <span class="r-chip" style="--c:#ef4444">مجلس</span>' : '')]],
    fields: [['title', 'ماذا تريد أن تشتري؟', 'text'], ['dept', 'الإدارة الطالبة', 'dept'], ['program_id', 'البرنامج', 'program'], ['needed_by', 'مطلوب قبل', 'date'], ['items', 'الأصناف والمواصفات', 'list-obj', [['item', 'الصنف والمواصفات'], ['qty', 'الكمية'], ['price', 'السعر التقديري للوحدة']]], ['est_total', 'الإجمالي التقديري', 'money'], ['category', 'بند الصرف', 'expcat'],
      ['quotes', 'عروض الأسعار', 'list-obj', [['supplier', 'المورد'], ['amount', 'المبلغ'], ['url', 'رابط العرض']]], ['supplier', 'المورد المختار', 'text'], ['award_amount', 'مبلغ الترسية', 'money'], ['receipt_url', 'محضر الفحص والاستلام + الفاتورة (رابط)', 'url'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ dept: ME.dept, status: 'request', items: [{}], quotes: [], category: 'prog_exp', requested_by: ME.id }),
    flow: r => prFlow(r), acts: r => ['ordered', 'received', 'invoiced'].includes(r.status) ? `<button class="btn btn-ghost" onclick="prPrintPO('${r.id}')"><i data-lucide="printer"></i> أمر الشراء</button>` : '' },
  meetings: { name: 'الاجتماعات', single: 'اجتماع', icon: 'presentation', title: r => MEET_BODY[r.body] + ' — اجتماع ' + (r.number || ''), search: ['agenda', 'location'], filter: ['body', MEET_BODY], status: ['status', MEET_ST], order: 'date',
    cols: [['الجهة', r => `<b>${MEET_BODY[r.body] || r.body}</b>`], ['رقم', r => r.number || '—'], ['التاريخ', r => fmtD(r.date)], ['المكان', r => esc(r.location || '—')], ['النصاب', r => r.status === 'planned' ? '—' : (r.quorum ? '✓ مكتمل' : '<span style="color:var(--bad)">غير مكتمل</span>')], ['الحالة', r => erpBadge(MEET_ST, r.status)]],
    fields: [['body', 'الجهة', 'select', MEET_BODY], ['number', 'رقم الاجتماع', 'text'], ['date', 'التاريخ', 'date'], ['location', 'المكان / رابط الاجتماع', 'text'], ['attendees', 'الحضور', 'list-obj', [['name', 'الاسم'], ['role', 'الصفة'], ['present', 'حضر؟ (نعم/لا)']]], ['quorum', 'اكتمل النصاب', 'bool'], ['agenda', 'جدول الأعمال', 'textarea'], ['minutes_url', 'المحضر الموقّع (رابط)', 'url'], ['status', 'الحالة', 'select', Object.fromEntries(Object.entries(MEET_ST).map(([k, v]) => [k, v.t]))]],
    defaults: () => ({ body: 'board', status: 'planned', date: today(), attendees: (ORG_CFG.boardMembers || []).map(n => ({ name: n[0], role: n[1], present: '' })) }),
    view: r => `<h4>القرارات</h4>${erpMini('decisions', d => d.meeting_id === r.id)}<button class="link-btn" onclick="closeModal();erpEdit('decisions',null,{meeting_id:'${r.id}'})">+ قرار</button>`, acts: r => `<button class="btn btn-ghost" onclick="meetPrint('${r.id}')"><i data-lucide="printer"></i> دعوة / محضر</button>` },
  decisions: { name: 'القرارات والمتابعة', single: 'قرار', icon: 'gavel', title: r => 'قرار ' + (r.number || '') + ' — ' + String(r.text || '').slice(0, 50), search: ['text'], filter: ['status', DEC_ST], status: ['status', DEC_ST], order: 'due', asc: 1,
    cols: [['القرار', r => `<b>${esc(r.number || '')}</b> ${esc(String(r.text || '').slice(0, 110))}`], ['الاجتماع', r => esc(meetTitle(r.meeting_id))], ['المسؤول', r => esc(memName(r.owner))], ['الموعد', r => r.status === 'open' && r.due && r.due < today() ? `<span style="color:var(--bad)">${fmtD(r.due)}</span>` : fmtD(r.due)], ['الحالة', r => erpBadge(DEC_ST, r.status === 'open' && r.due && r.due < today() ? 'late' : r.status)]],
    fields: [['meeting_id', 'الاجتماع', 'ref', 'meetings'], ['number', 'رقم القرار', 'text'], ['text', 'نص القرار', 'textarea'], ['owner', 'المسؤول عن التنفيذ', 'member'], ['due', 'موعد التنفيذ', 'date'], ['status', 'الحالة', 'select', { open: 'قيد التنفيذ', done: 'منفّذ', cancelled: 'ملغى' }], ['followup', 'المتابعة / الأثر', 'textarea']],
    defaults: () => ({ status: 'open' }) },
  compliance: { name: 'تقويم الالتزامات', single: 'التزام', icon: 'calendar-check-2', title: 'title', search: ['title', 'ref'], filter: ['status', CMP_ST], status: ['status', CMP_ST], order: 'due', asc: 1,
    cols: [['الالتزام', r => `<b>${esc(r.title)}</b><div class="r-sub">${esc(r.ref || '')}</div>`], ['الموعد', r => r.status === 'open' && r.due < today() ? `<span style="color:var(--bad)">${fmtD(r.due)} — متأخر</span>` : fmtD(r.due)], ['التكرار', r => ({ yearly: 'سنوي', quarterly: 'ربع سنوي', monthly: 'شهري', once: 'مرة' })[r.recur] || '—'], ['المسؤول', r => esc(memName(r.owner))], ['الحالة', r => erpBadge(CMP_ST, r.status)]],
    fields: [['title', 'الالتزام', 'text'], ['ref', 'المرجع (اللائحة / الجهة)', 'text'], ['due', 'الموعد', 'date'], ['recur', 'التكرار', 'select', { yearly: 'سنوي', quarterly: 'ربع سنوي', monthly: 'شهري', once: 'مرة واحدة' }], ['owner', 'المسؤول', 'member'], ['evidence_url', 'الإثبات (رابط)', 'url'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ status: 'open', recur: 'yearly', due: today() }),
    flow: r => r.status === 'open' ? [{ to: 'done', label: 'تم الإنجاز', after: cmpNext }] : [] },
  disclosures: { name: 'إقرارات تعارض المصالح', single: 'إقرار', icon: 'shield-check', title: r => 'إقرار ' + r.year + ' — ' + (r.name || memName(r.member_id)), search: ['name', 'details'], order: 'year',
    cols: [['المقرّ', r => `<b>${esc(r.name || memName(r.member_id))}</b><div class="r-sub">${esc(r.capacity || '')}</div>`], ['السنة', r => r.year], ['يوجد تعارض؟', r => r.has_conflict ? '<span class="r-badge" style="--c:#f59e0b">نعم — مُفصح</span>' : '<span class="r-badge" style="--c:#22c55e">لا يوجد</span>'], ['التوقيع', r => fmtD(r.signed_at)]],
    fields: [['member_id', 'الموظف (إن كان من الفريق)', 'member'], ['name', 'الاسم (لأعضاء المجلس)', 'text'], ['capacity', 'الصفة', 'text'], ['year', 'السنة', 'num'], ['has_conflict', 'لدي مصلحة قد تتعارض مع مصلحة الجمعية', 'bool'], ['details', 'تفاصيل الإفصاح', 'textarea'], ['signed_at', 'تاريخ التوقيع', 'date']],
    defaults: () => ({ member_id: ME.id, year: new Date().getFullYear(), signed_at: today(), has_conflict: false }) },
  grants: { name: 'المنح وطلبات الدعم', single: 'منحة', icon: 'hand-coins', title: 'title', search: ['title'], filter: ['status', GRANT_ST], status: ['status', GRANT_ST],
    cols: [['المنحة', r => `<b>${esc(r.title)}</b><div class="r-sub">${esc(donorName(r.donor_id))}</div>`], ['البرنامج', r => esc(programName(r.program_id) || '—')], ['المطلوب', r => sar(r.amount_requested)], ['المعتمد', r => r.amount_approved ? `<b>${sar(r.amount_approved)}</b>` : '—'], ['أقرب تقرير', r => nextReport(r)], ['الحالة', r => erpBadge(GRANT_ST, r.status)]],
    fields: [['title', 'عنوان المشروع / المنحة', 'text'], ['donor_id', 'الجهة المانحة', 'donor'], ['program_id', 'البرنامج', 'program'], ['amount_requested', 'المبلغ المطلوب', 'money'], ['amount_approved', 'المبلغ المعتمد', 'money'], ['status', 'المرحلة', 'select', Object.fromEntries(Object.entries(GRANT_ST).map(([k, v]) => [k, v.t]))], ['submitted_at', 'تاريخ التقديم', 'date'], ['start_date', 'بداية التنفيذ', 'date'], ['end_date', 'نهاية التنفيذ', 'date'], ['restricted', 'منحة مقيدة بالمشروع (تُصرف في الغرض المحدد وخلال المدة)', 'bool'], ['reports', 'التقارير المطلوبة للمانح', 'list-obj', [['title', 'التقرير'], ['due', 'الموعد (YYYY-MM-DD)'], ['done', 'سُلّم؟ (نعم/لا)']]], ['agreement_url', 'الاتفاقية / خطاب الاعتماد (رابط)', 'url'], ['owner', 'المسؤول', 'member'], ['notes', 'ملاحظات', 'textarea']],
    defaults: () => ({ status: 'drafting', restricted: true, reports: [], owner: ME.id }) },
  partnerships: { name: 'الشراكات والاتفاقيات', single: 'شراكة', icon: 'handshake', title: 'partner', search: ['partner', 'scope'], filter: ['status', PART_ST], status: ['status', PART_ST], order: 'expiry', asc: 1,
    cols: [['الشريك', r => `<b>${esc(r.partner)}</b><div class="r-sub">${esc(r.kind || '')}</div>`], ['النطاق', r => esc(String(r.scope || '').slice(0, 80))], ['التوقيع', r => fmtD(r.signed_at)], ['الانتهاء', r => expiryChip(r.expiry)], ['الحالة', r => erpBadge(PART_ST, r.status)]],
    fields: [['partner', 'الجهة الشريكة', 'text'], ['kind', 'نوع الشراكة (تنفيذية، داعمة، معرفية…)', 'text'], ['scope', 'نطاق الشراكة والتزامات الطرفين', 'textarea'], ['signed_at', 'تاريخ التوقيع', 'date'], ['expiry', 'تاريخ الانتهاء', 'date'], ['owner', 'مسؤول العلاقة', 'member'], ['url', 'مذكرة التفاهم (رابط)', 'url'], ['status', 'الحالة', 'select', Object.fromEntries(Object.entries(PART_ST).map(([k, v]) => [k, v.t]))]],
    defaults: () => ({ status: 'active', signed_at: today() }) },
  correspondence: { name: 'الصادر والوارد', single: 'معاملة', icon: 'mails', title: r => mailNo(r) + ' — ' + r.subject, search: ['subject', 'party', 'ref_number'], filter: ['direction', { out: 'صادر', in: 'وارد' }], status: ['status', MAIL_ST], order: 'date',
    cols: [['الرقم', r => `<b>${mailNo(r)}</b>`], ['التاريخ', r => fmtD(r.date)], ['الجهة', r => esc(r.party)], ['الموضوع', r => esc(r.subject)], ['الحالة', r => erpBadge(MAIL_ST, r.status)]],
    fields: [['direction', 'النوع', 'select', { out: 'صادر', in: 'وارد' }], ['date', 'التاريخ', 'date'], ['party', 'الجهة (المرسل إليها / منها)', 'text'], ['subject', 'الموضوع', 'text'], ['body', 'نص الخطاب (للصادر يُطبع على الورق الرسمي)', 'textarea-lg'], ['ref_number', 'رقم الجهة / المرجع', 'text'], ['dept', 'الإدارة المختصة', 'dept'], ['assigned_to', 'المسؤول عن المتابعة', 'member'], ['url', 'نسخة الخطاب (رابط)', 'url'], ['status', 'الحالة', 'select', Object.fromEntries(Object.entries(MAIL_ST).map(([k, v]) => [k, v.t]))]],
    defaults: () => ({ direction: 'out', date: today(), status: 'open', dept: ME.dept }), number: 'number',
    acts: r => r.direction === 'out' ? `<button class="btn btn-ghost" onclick="mailPrint('${r.id}')"><i data-lucide="printer"></i> طباعة الخطاب</button>` : '' },
};

/* ═════════ التطبيقات (كل تطبيق = لوحة + سجلات) ═════════ */
const ERP_MODS = {
  beneficiaries: { name: 'المستفيدون', icon: 'users-round', c: '#FFB547,#E5791A', app: 'beneficiaries', tabs: ['dash', 'beneficiaries', 'enrollments', 'attendance'], need: ['beneficiaries', 'enrollments'] },
  volunteers: { name: 'التطوع', icon: 'hand-heart', c: '#FF7A9C,#C9306A', app: 'volunteers', tabs: ['dash', 'volunteers', 'volunteer_hours'], need: ['volunteers', 'volunteer_hours'] },
  hr: { name: 'الموارد البشرية', icon: 'contact-round', c: '#5AA9FF,#2457C9', app: 'hr', tabs: ['dash', 'people', 'hr_requests', 'hr_profiles', 'hr_docs', 'hr_reviews', 'hr_cases'], need: ['hr_requests', 'hr_docs', 'hr_profiles', 'hr_reviews', 'hr_cases'] },
  myhr: { name: 'طلباتي الإدارية', icon: 'file-user', c: '#7BC6FF,#2F7FD0', app: null, tabs: ['mine', 'myfile'], need: ['hr_requests', 'hr_profiles', 'hr_docs', 'hr_reviews'] },
  procurement: { name: 'المشتريات', icon: 'shopping-cart', c: '#3DD6A0,#0B8F66', app: 'procurement', tabs: ['dash', 'purchase_requests', 'suppliers'], need: ['purchase_requests', 'suppliers'] },
  governance: { name: 'الحوكمة', icon: 'landmark', c: '#B08CFF,#6A3FD6', app: 'governance', tabs: ['dash', 'meetings', 'decisions', 'compliance', 'disclosures'], need: ['meetings', 'decisions', 'compliance', 'disclosures'] },
  grants: { name: 'المنح والشراكات', icon: 'gem', c: '#E8C45E,#A8801A', app: 'grants', tabs: ['dash', 'grants', 'partnerships'], need: ['grants', 'partnerships'] },
  mail: { name: 'الصادر والوارد', icon: 'mails', c: '#8EA4C8,#45597F', app: 'mail', tabs: ['correspondence'], need: ['correspondence'] },
};
const ERP_TAB_NAMES = { dash: ['لوحة التطبيق', 'layout-dashboard'], attendance: ['تسجيل الحضور', 'list-checks'], mine: ['طلباتي', 'file-user'], people: ['دليل الموظفين', 'users'], myfile: ['ملفي', 'id-card'] };

/* ═════════ المساعدات ═════════ */
const sar0 = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
const benName = id => ((ERP.rows.beneficiaries || []).find(b => b.id === id) || {}).name || '—';
const volName = id => ((ERP.rows.volunteers || []).find(b => b.id === id) || {}).name || '—';
const volHours = id => (ERP.rows.volunteer_hours || []).filter(h => h.volunteer_id === id && h.status === 'approved').reduce((s, h) => s + Number(h.hours || 0), 0);
const donorName = id => ((ERP.rows.donors || []).find(d => d.id === id) || {}).name || '—';
const meetTitle = id => { const m = (ERP.rows.meetings || []).find(x => x.id === id); return m ? MEET_BODY[m.body] + ' ' + (m.number || '') + ' (' + (m.date || '') + ')' : '—'; };
const mailNo = r => (r.direction === 'in' ? 'و' : 'ص') + '-' + String(r.date || '').slice(0, 4) + '-' + String(r.number || 0).padStart(4, '0');
const attPct = r => { const a = r.attendance || []; if (!a.length) return '—'; const p = a.filter(x => x.p).length; return Math.round(p / a.length * 100) + '% <span class="r-sub">(' + p + '/' + a.length + ')</span>'; };
function expiryChip(d) { if (!d) return '—'; const left = daysBetween(today(), d) - 1; return left < 0 ? `<span class="r-badge" style="--c:#ef4444">منتهية ${fmtD(d)}</span>` : left <= 60 ? `<span class="r-badge" style="--c:#f59e0b">${fmtD(d)} — بعد ${left} يوماً</span>` : fmtD(d); }
function nextReport(g) { const r = (g.reports || []).filter(x => x.due && !/^نعم|^y/i.test(x.done || '')).sort((a, b) => a.due.localeCompare(b.due))[0]; return r ? (r.due < today() ? `<span style="color:var(--bad)">${esc(r.title)} — ${fmtD(r.due)}</span>` : `${esc(r.title)} — ${fmtD(r.due)}`) : '—'; }

/* ═════════ الحقول ═════════ */
function erpField(f, v, t) {
  const [k, label, type, opt, hint] = f, id = 'ef_' + k, h = (typeof opt === 'string' && type !== 'ref' ? opt : hint) ? `<div class="r-hint">${esc(type !== 'ref' && typeof opt === 'string' ? opt : hint)}</div>` : '';
  const sel = (pairs) => `<div class="field"><label>${label}</label><select id="${id}">${pairs}</select>${h}</div>`;
  if (type === 'bool') return `<label class="r-check"><input type="checkbox" id="${id}"${v ? ' checked' : ''}> ${label}</label>`;
  if (type === 'textarea' || type === 'textarea-lg') return `<div class="field"><label>${label}</label><textarea id="${id}" rows="${type === 'textarea-lg' ? 9 : 3}">${esc(v || '')}</textarea>${h}</div>`;
  if (type === 'select') return sel(Object.entries(opt).map(([a, b]) => `<option value="${esc(a)}"${String(a) === String(v ?? '') ? ' selected' : ''}>${esc(b)}</option>`).join(''));
  if (type === 'program') return sel(programOptions(v, 'عام / بلا برنامج'));
  if (type === 'member') return sel(memberOptions(v, '—'));
  if (type === 'dept') return sel(deptOptions(v));
  if (type === 'donor') return sel(`<option value="">—</option>` + (ERP.rows.donors || []).map(d => `<option value="${d.id}"${d.id === v ? ' selected' : ''}>${esc(d.name)}</option>`).join(''));
  if (type === 'expcat') return sel(catOptions('payment', v));
  if (type === 'ref') { const T = ERP_T[opt]; return sel(`<option value="">—</option>` + (ERP.rows[opt] || []).map(r => `<option value="${r.id}"${r.id === v ? ' selected' : ''}>${esc(typeof T.title === 'function' ? T.title(r) : r[T.title])}</option>`).join('')); }
  if (type === 'list-obj') { const rows = v && v.length ? v : [{}]; return `<div class="field"><label>${label}</label><div id="${id}" class="r-objlist">${rows.map(r => objRow(opt, r)).join('')}</div><button type="button" class="link-btn" onclick="document.getElementById('${id}').insertAdjacentHTML('beforeend',objRow(ERP_T['${t}'].fields.find(x=>x[0]==='${k}')[3],{}))">+ إضافة</button>${h}</div>`; }
  const ltr = ['phone', 'url', 'money', 'num'].includes(type);
  return `<div class="field"><label>${label}</label><input id="${id}" type="${type === 'num' || type === 'money' ? 'number' : type === 'date' ? 'date' : 'text'}"${type === 'money' ? ' step="0.01"' : ''}${ltr ? ' dir="ltr"' : ''}${type === 'url' ? ' placeholder="https://"' : ''} value="${esc(v == null ? '' : v)}">${h}</div>`;
}
function erpRead(f) {
  const [k, , type] = f, el = document.getElementById('ef_' + k); if (!el) return undefined;
  if (type === 'bool') return el.checked;
  if (type === 'num' || type === 'money') return el.value === '' ? null : Number(el.value);
  if (['date', 'program', 'member', 'donor', 'ref'].includes(type)) return el.value || null;
  if (type === 'list-obj') return Array.from(el.querySelectorAll('.r-objrow')).map(r => { const o = {}; r.querySelectorAll('input').forEach(i => o[i.dataset.k] = i.value.trim()); return o; }).filter(o => Object.values(o).some(Boolean));
  return el.value.trim();
}

/* ═════════ المحرّك: تحميل، قائمة، نموذج، عرض، دورة ═════════ */
async function erpLoad(t) { const T = ERP_T[t] || {}; ERP.rows[t] = await RDB.list(t, { order: T.order || 'created_at', asc: !!T.asc }).catch(e => { console.warn(t, e); return []; }); }
async function renderErp(mod) {
  ERP.mod = mod; const M = ERP_MODS[mod];
  if ((!M.tabs.includes(ERP.tab) && ERP.tab !== 'emp') || ERP._mod !== mod) { ERP.tab = M.tabs[0]; ERP.q = ''; ERP.f = ''; ERP._mod = mod; }
  document.getElementById('main').innerHTML = `<div class="r-page"><div class="r-skel"></div></div>`;
  const extra = { beneficiaries: [], volunteers: [], hr: can('finance') ? ['custodies', 'fixed_assets'] : [], procurement: [], governance: [], grants: ['donors'], mail: [], myhr: [] }[mod] || [];
  await Promise.all(M.need.concat(extra).map(erpLoad));
  if (mod === 'governance') await erpSeedCompliance();
  if (mod === 'grants') await erpSeedPartners();
  erpPaint();
}
function erpGo(tab) { ERP.tab = tab; ERP.q = ''; ERP.f = ''; erpPaint(); }
function erpPaint() {
  const M = ERP_MODS[ERP.mod], tabs = M.tabs.filter(k => k !== 'emp').map(k => ERP_T[k] ? { id: k, name: ERP_T[k].name, icon: ERP_T[k].icon } : { id: k, name: ERP_TAB_NAMES[k][0], icon: ERP_TAB_NAMES[k][1] });
  const body = ERP.tab === 'dash' ? (ERP_DASH[ERP.mod] || (() => ''))() : ERP.tab === 'attendance' ? attendanceUI() : ERP.tab === 'mine' ? myHrUI() : ERP.tab === 'people' ? peopleUI() : ERP.tab === 'emp' ? `<button class="link-btn" onclick="erpGo('people')">← دليل الموظفين</button>` + empFile(ERP._emp) : ERP.tab === 'myfile' ? empFile(ME.id, true) : erpList(ERP.tab);
  const T = ERP_T[ERP.tab];
  document.getElementById('main').innerHTML = `<div class="r-page">
    <div class="page-head"><div><h1>${M.name}</h1></div><div style="display:flex;gap:8px;flex-wrap:wrap">${T && erpCanAdd(ERP.tab) ? `<button class="btn btn-gold" onclick="erpEdit('${ERP.tab}')"><i data-lucide="plus"></i> ${T.single}</button>` : ''}${(ERP_TOOLS[ERP.mod] || (() => ''))()}</div></div>
    ${tabs.length > 1 ? rTabs('erp', tabs, ERP.tab, 'erpGo') : ''}<div>${body}</div></div>`;
  refreshIcons();
}
const erpCanAdd = t => t === 'hr_requests' ? can('hr') : t === 'disclosures' ? true : can(ERP_MODS[ERP.mod].app || 'tasks');
function erpList(t, rowsOverride) {
  const T = ERP_T[t], q = ERP.q.trim();
  let rows = (rowsOverride || ERP.rows[t] || []).filter(r => (!q || (T.search || []).concat(typeof T.title === 'string' ? [T.title] : []).some(k => String(r[k] || '').includes(q))) && (!ERP.f || !T.filter || String(r[T.filter[0]]) === ERP.f));
  const filt = T.filter ? `<div class="r-seg">${[['', 'الكل']].concat(Object.entries(T.filter[1]).map(([k, v]) => [k, v.t || v])).map(([k, v]) => `<button class="${ERP.f === k ? 'on' : ''}" onclick="ERP.f='${k}';erpPaint()">${v}</button>`).join('')}</div>` : '';
  return `<div class="r-filters">${filt}<input placeholder="بحث…" value="${esc(ERP.q)}" onchange="ERP.q=this.value;erpPaint()" style="max-width:220px"><button class="btn btn-ghost btn-sm" onclick="erpExport('${t}')"><i data-lucide="download"></i> تصدير</button><span class="r-sub">${rows.length} سجل</span></div>
  <div class="card" style="padding:0;overflow:auto"><table class="r-table"><thead><tr>${T.cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>
  ${rows.map(r => `<tr onclick="erpView('${t}','${r.id}')" style="cursor:pointer">${T.cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${T.cols.length}">${rEmpty(T.icon, 'لا سجلات بعد.')}</td></tr>`}</tbody></table></div>`;
}
function erpMini(t, f) { const T = ERP_T[t], rows = (ERP.rows[t] || []).filter(f); return rows.length ? `<table class="r-table r-fs" style="margin-bottom:8px"><tbody>${rows.map(r => `<tr onclick="erpView('${t}','${r.id}')" style="cursor:pointer">${T.cols.slice(0, 5).map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<p class="r-sub">لا شيء بعد.</p>'; }
function erpExport(t) { const T = ERP_T[t]; acCSV([T.fields.map(f => f[1])].concat((ERP.rows[t] || []).map(r => T.fields.map(f => { const v = r[f[0]]; return Array.isArray(v) ? v.map(o => Object.values(o).join(' / ')).join(' | ') : f[2] === 'member' ? memName(v) : f[2] === 'program' ? programName(v) : f[2] === 'select' ? (f[3][v] || v) : v; }))), T.name + '-' + today()); }
function erpEdit(t, id, preset) {
  const T = ERP_T[t], r = id ? (ERP.rows[t] || []).find(x => x.id === id) : Object.assign({}, T.defaults ? T.defaults() : {}, preset || {});
  openModal((id ? 'تعديل ' : '') + T.single, `<div class="erp-form">${T.fields.map(f => erpField(f, r[f[0]], t)).join('')}</div>`, async () => {
    const row = {}; T.fields.forEach(f => { const v = erpRead(f); if (v !== undefined) row[f[0]] = v; });
    const tk = typeof T.title === 'string' ? T.title : T.fields[0][0]; if (!row[tk]) { rToast('الحقل «' + T.fields.find(f => f[0] === tk)[1] + '» مطلوب', 1); return; }
    if (T.fields.some(f => f[2] === 'url' && row[f[0]] && !validUrl(row[f[0]]))) { rToast('الروابط يجب أن تبدأ بـ https://', 1); return; }
    const err = erpValidate(t, row, r); if (err) { rToast(err, 1); return; }
    try {
      if (!id) { Object.keys(r).forEach(k => { if (row[k] === undefined) row[k] = r[k]; }); if (T.number) row[T.number] = 1 + Math.max(0, ...(ERP.rows[t] || []).filter(x => t !== 'correspondence' || (x.direction === row.direction && String(x.date).slice(0, 4) === String(row.date).slice(0, 4))).map(x => +x[T.number] || 0)); row.created_by = row.created_by || ME.id; }
      if (id) await RDB.update(t, id, row); else await RDB.insert(t, row);
      closeModal(); await erpLoad(t); rToast('تم الحفظ'); rerenderCur();
    } catch (e) { rToast(e.message, 1); }
  }, id && (isAdmin() || can(ERP_MODS[ERP.mod] && ERP_MODS[ERP.mod].app || 'tasks')) ? async () => { if (!confirm('حذف السجل؟')) return; try { await RDB.remove(t, id); closeModal(); await erpLoad(t); rerenderCur(); } catch (e) { rToast(e.message, 1); } } : null);
  const m = document.querySelector('.modal'); if (m) m.style.maxWidth = '780px';
}
function erpValidate(t, row, old) {
  const F = CONFIG.finance || {};
  if (t === 'hr_requests' && row.from_date && row.to_date && row.to_date < row.from_date) return 'تاريخ النهاية قبل البداية';
  if (t === 'hr_requests' && row.kind === 'annual') { const bal = leaveBalance(row.member_id) + (old && old.status === 'approved' ? +old.days || 0 : 0), d = daysBetween(row.from_date, row.to_date); if (d > bal) return `الرصيد المتاح من الإجازة السنوية ${bal} يوماً فقط`; }
  if (t === 'hr_cases' && !old.id && row.kind === 'off' && (row.items || []).every(i => CASE_STEPS.on.includes(i.t))) row.items = CASE_STEPS.off.map(t => ({ t, done: '', note: '' }));
  if (t === 'hr_requests') row.days = row.from_date && row.to_date ? daysBetween(row.from_date, row.to_date) : null;
  if (t === 'purchase_requests') { const it = (row.items || []).reduce((s, x) => s + (Number(x.qty) || 0) * (Number(x.price) || 0), 0); if (it && !row.est_total) row.est_total = it; }
  if (t === 'volunteer_hours' && (!row.hours || row.hours > 12)) return 'الساعات بين 1 و12 لليوم الواحد';
  return '';
}
function erpView(t, id) {
  const T = ERP_T[t], r = (ERP.rows[t] || []).find(x => x.id === id); if (!r) return;
  const show = f => { const v = r[f[0]], ty = f[2]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return ''; let h;
    if (ty === 'bool') h = v ? 'نعم' : 'لا'; else if (ty === 'select') h = esc(f[3][v] || v); else if (ty === 'member') h = esc(memName(v)); else if (ty === 'program') h = esc(programName(v)); else if (ty === 'dept') h = esc((DEPTS[v] || {}).name || v);
    else if (ty === 'donor') h = esc(donorName(v)); else if (ty === 'expcat') h = esc(finCat(v).name); else if (ty === 'ref') { const R = ERP_T[f[3]], x = (ERP.rows[f[3]] || []).find(z => z.id === v); h = x ? esc(typeof R.title === 'function' ? R.title(x) : x[R.title]) : '—'; }
    else if (ty === 'date') h = fmtD(v); else if (ty === 'money') h = sar(v) + ' ر.س'; else if (ty === 'url') h = linkChip({ url: v, title: 'فتح' }); else if (ty === 'list-obj') h = `<table class="r-table r-fs"><tbody>${v.map(o => `<tr>${f[3].map(c => `<td>${/^https?:/.test(o[c[0]] || '') ? linkChip({ url: o[c[0]], title: 'رابط' }) : esc(o[c[0]] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    else h = esc(v).replace(/\n/g, '<br>');
    return `<dt>${f[1]}</dt><dd>${h}</dd>`; };
  const flow = (T.flow ? T.flow(r) : []).map((a, i) => `<button class="btn ${a.ghost ? 'btn-ghost' : 'btn-gold'}" onclick="erpMove('${t}','${id}',${i})">${a.label}</button>`).join('');
  const canEd = t === 'hr_requests' ? (can('hr') || (r.member_id === ME.id && r.status === 'pending_manager')) : t === 'disclosures' ? (r.member_id === ME.id || can('governance')) : can(ERP_MODS[ERP.mod] && ERP_MODS[ERP.mod].app || 'tasks');
  document.getElementById('modalRoot').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:780px">
    <div class="modal-head"><h3>${esc(typeof T.title === 'function' ? T.title(r) : r[T.title])}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">${T.status ? `<div style="margin-bottom:10px">${erpBadge(T.status[1], r[T.status[0]])}</div>` : ''}<dl class="r-dl">${T.fields.map(show).join('')}${r.created_by ? `<dt>أنشأه</dt><dd>${esc(memName(r.created_by))} · ${fmtD(r.created_at)}</dd>` : ''}</dl>${T.view ? T.view(r) : ''}${(r.log || []).length ? `<h4>سجل الإجراءات</h4><ul class="r-sub erp-log">${r.log.map(l => `<li>${esc(l.t)} — ${esc(memName(l.by))} · ${fmtD(l.at)}${l.note ? ' — ' + esc(l.note) : ''}</li>`).join('')}</ul>` : ''}</div>
    <div class="modal-foot" style="flex-wrap:wrap">${flow}${T.acts ? T.acts(r) : ''}${canEd ? `<button class="btn btn-ghost" style="margin-right:auto" onclick="closeModal();erpEdit('${t}','${id}')">تعديل</button>` : ''}</div></div></div>`;
  refreshIcons();
}
async function erpMove(t, id, i) {
  const T = ERP_T[t], r = ERP.rows[t].find(x => x.id === id), a = T.flow(r)[i]; if (!a) return;
  if (a.check) { const e = a.check(r); if (e) { rToast(e, 1); return; } }
  let note = ''; if (a.ask) { note = prompt(a.ask, ''); if (note === null) return; }
  if (a.confirm && !confirm(a.confirm)) return;
  const st = T.status ? T.status[0] : 'status', patch = Object.assign({ [st]: a.to }, a.patch ? await a.patch(r, note) : {});
  patch.log = (r.log || []).concat([{ t: (T.status ? T.status[1][a.to] || {} : {}).t || a.label, by: ME.id, at: new Date().toISOString(), note }]);
  try { await RDB.update(t, id, patch); if (a.after) await a.after(Object.assign({}, r, patch)); closeModal(); await erpLoad(t); rToast(a.label + ' ✓'); rerenderCur(); } catch (e) { rToast(e.message, 1); }
}

/* ═════════ المستفيدون: الحضور والشهادات والاستيراد من الموقع ═════════ */
function attendanceUI() {
  const pid = ERP._attP || (ORG.programs[0] || {}).id, d = ERP._attD || today();
  const list = (ERP.rows.enrollments || []).filter(e => e.program_id === pid && ['accepted', 'attending', 'registered'].includes(e.status));
  return `<div class="card r-card"><div class="r-filters"><select onchange="ERP._attP=this.value;erpPaint()">${programOptions(pid, '—').replace('<option value="">—</option>', '')}</select><input type="date" value="${d}" onchange="ERP._attD=this.value;erpPaint()">
    <label class="r-sub">ساعات الجلسة <input type="number" id="attH" value="${ERP._attH || 2}" style="width:70px" onchange="ERP._attH=+this.value"></label></div>
    ${list.length ? `<div class="erp-att">${list.map(e => { const rec = (e.attendance || []).find(x => x.d === d); return `<label class="r-check"><input type="checkbox" class="att-k" value="${e.id}"${!rec || rec.p ? ' checked' : ''}> ${esc(benName(e.beneficiary_id))} <span class="r-sub">${attPct(e)}</span></label>`; }).join('')}</div>
    <button class="btn btn-gold" onclick="attSave()"><i data-lucide="check-check"></i> حفظ حضور ${fmtD(d)}</button>` : rEmpty('list-checks', 'لا مسجّلين مقبولين في هذا البرنامج.')}</div>`;
}
async function attSave() {
  const pid = ERP._attP || (ORG.programs[0] || {}).id, d = ERP._attD || today(), h = Number((document.getElementById('attH') || {}).value || 2), on = new Set(Array.from(document.querySelectorAll('.att-k:checked')).map(x => x.value));
  const list = (ERP.rows.enrollments || []).filter(e => e.program_id === pid && ['accepted', 'attending', 'registered'].includes(e.status));
  try {
    for (const e of list) { const att = (e.attendance || []).filter(x => x.d !== d).concat([{ d, p: on.has(e.id), h }]); const hours = att.filter(x => x.p).reduce((s, x) => s + (x.h || 0), 0); await RDB.update('enrollments', e.id, { attendance: att, hours, status: e.status === 'registered' || e.status === 'accepted' ? 'attending' : e.status }); }
    await erpLoad('enrollments'); rToast('حُفظ الحضور (' + on.size + ' من ' + list.length + ')'); erpPaint();
  } catch (e) { rToast(e.message, 1); }
}
async function benImport() {
  const subs = await RDB.list('submissions', { order: 'created_at' }).catch(() => []), reg = subs.filter(s => s.kind === 'registration' && !s.converted);
  if (!reg.length) { rToast('لا تسجيلات جديدة من الموقع'); return; }
  if (!confirm(`تحويل ${reg.length} تسجيلاً من الموقع إلى سجل المستفيدين وتسجيلهم في برامجهم؟`)) return;
  for (const s of reg) {
    const p = s.payload || {}, ex = (ERP.rows.beneficiaries || []).find(b => b.phone && b.phone === s.phone);
    const b = ex || await RDB.insert('beneficiaries', { name: s.name, phone: s.phone || '', gender: p.gender === 'أنثى' ? 'f' : 'm', city: p.city || '', school: p.occupation || '', category: 'secondary', consent: true, source: 'website', created_by: ME.id });
    if (!ex) ERP.rows.beneficiaries.push(b);
    const prog = ORG.programs.find(x => x.id === s.program_id || x.title === s.ref_title);
    if (prog) await RDB.insert('enrollments', { beneficiary_id: b.id, program_id: prog.id, cohort: 'نسخة ' + new Date().getFullYear(), status: 'registered', hours: 0, attendance: [], created_by: ME.id });
    await RDB.update('submissions', s.id, { converted: true, status: s.status === 'new' ? 'in_progress' : s.status });
  }
  await Promise.all(['beneficiaries', 'enrollments'].map(erpLoad)); rToast('تم تحويل ' + reg.length + ' تسجيلاً'); erpPaint();
}
async function volImport() {
  const subs = await RDB.list('submissions', { order: 'created_at' }).catch(() => []), reg = subs.filter(s => s.kind === 'volunteer' && !s.converted);
  if (!reg.length) { rToast('لا طلبات تطوع جديدة من الموقع'); return; }
  if (!confirm(`إضافة ${reg.length} متطوعاً من طلبات الموقع (بحالة «مرشّح»)؟`)) return;
  for (const s of reg) { const p = s.payload || {}; await RDB.insert('volunteers', { name: s.name, phone: s.phone || '', email: s.email || '', gender: p.gender === 'أنثى' ? 'f' : 'm', skills: p.skills || '', availability: p.availability || '', status: 'candidate', joined_at: today(), created_by: ME.id }); await RDB.update('submissions', s.id, { converted: true, status: s.status === 'new' ? 'in_progress' : s.status }); }
  await erpLoad('volunteers'); rToast('أُضيف ' + reg.length + ' متطوعاً'); erpPaint();
}
/* شهادة بهوية الجمعية (أفقية A4) — إتمام برنامج أو ساعات تطوعية */
function erpCertificate(t, id) {
  let name, line1, line2;
  if (t === 'enrollments') { const e = ERP.rows.enrollments.find(x => x.id === id); name = benName(e.beneficiary_id); line1 = 'لإتمامه بنجاح برنامج'; line2 = `«${programName(e.program_id)}»${e.hours ? ` بواقع ${sar0(e.hours)} ساعة تدريبية` : ''} — ${esc(e.cohort || '')}`; }
  else { const v = ERP.rows.volunteers.find(x => x.id === id); name = v.name; line1 = 'تقديراً لعطائه التطوعي في برامج الجمعية وفعالياتها'; line2 = `بإجمالي ${sar0(volHours(v.id))} ساعة تطوعية معتمدة`; }
  rPrintHTML(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>شهادة — ${esc(name)}</title><base href="${location.href.replace(/[^/]*$/, '')}"><style>${CONFIG.printFonts || ''}
  @page{size:A4 landscape;margin:0}body{margin:0;font-family:${CONFIG.printFontFamily || 'Tahoma'},Tahoma,sans-serif;color:#14292D;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .c{width:297mm;height:210mm;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#fff}
  .c:before{content:"";position:absolute;inset:10mm;border:1.5px solid #CAB05F;border-radius:6mm}.c:after{content:"";position:absolute;inset:13mm;border:.6px solid #41747F;border-radius:4mm}
  .lg{height:26mm;margin-bottom:6mm}h1{font-size:44px;margin:0 0 4mm;color:#41747F}p{font-size:19px;margin:2mm 0}.nm{font-size:38px;font-weight:700;margin:5mm 0;color:#14292D}.l2{font-size:22px;font-weight:700;color:#8A6D3B}
  .sg{position:absolute;bottom:24mm;inset-inline:40mm;display:flex;justify-content:space-between;font-size:15px}.sg div{border-top:1px solid #9fb6ba;padding-top:2mm;min-width:60mm}
  .zz{position:absolute;bottom:0;left:0;right:0;height:9mm;background:linear-gradient(135deg,#41747F 25%,transparent 25%) 0 0/20mm 9mm,linear-gradient(225deg,#41747F 25%,transparent 25%) 0 0/20mm 9mm,linear-gradient(135deg,#CAB05F 25%,transparent 25%) 10mm 0/20mm 9mm,linear-gradient(225deg,#CAB05F 25%,transparent 25%) 10mm 0/20mm 9mm}</style></head><body>
  <div class="c"><img class="lg" src="${esc(CONFIG.brandLogo)}" alt=""><h1>شهادة ${t === 'enrollments' ? 'إتمام' : 'شكر وتقدير'}</h1><p>تشهد ${esc(CONFIG.companyName)} بأن</p><div class="nm">${esc(name)}</div><p>${line1}</p><div class="l2">${line2}</div><p style="font-size:15px;color:#5d7378;margin-top:5mm">وتتمنى له دوام التوفيق والنجاح — ${new Date().toLocaleDateString('ar-u-ca-gregory-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <div class="sg"><div>${esc(TERMS.head)}</div><div>ختم الجمعية</div></div><div class="zz"></div></div></body></html>`);
}

/* ═════════ الموارد البشرية ═════════ */
const LEAVE_DAYS = ((ORG_CFG.hr || {}).annualLeave) || 21;   // نظام العمل: 21 يوماً، و30 بعد خمس سنوات خدمة (leaveEntitle)
function leaveEntitle(mid) { const p = (ERP.rows.hr_profiles || []).find(x => x.member_id === mid); const yrs = p && p.hire_date ? (Date.now() - new Date(p.hire_date)) / 3.156e10 : 0; return yrs >= 5 ? 30 : LEAVE_DAYS; }
function leaveBalance(mid) { const y = String(new Date().getFullYear()); const used = (ERP.rows.hr_requests || []).filter(r => r.member_id === mid && r.kind === 'annual' && r.status === 'approved' && String(r.from_date).startsWith(y)).reduce((s, r) => s + (+r.days || 0), 0); return leaveEntitle(mid) - used; }
/* ── ملف الموظف الموحّد (على نمط جسر): البيانات، العقد، الوثائق، الإجازات، الطلبات، التقييمات ── */
function empFile(mid, self) {
  const m = ORG.members.find(x => x.id === mid) || {}, p = (ERP.rows.hr_profiles || []).find(x => x.member_id === mid), docs = (ERP.rows.hr_docs || []).filter(d => d.member_id === mid), reqs = (ERP.rows.hr_requests || []).filter(r => r.member_id === mid), revs = (ERP.rows.hr_reviews || []).filter(r => r.member_id === mid && (!self || r.status !== 'draft'));
  const yrs = p && p.hire_date ? ((Date.now() - new Date(p.hire_date)) / 3.156e10) : null;
  const row = (l, v) => v ? `<dt>${l}</dt><dd>${v}</dd>` : '';
  return `<div class="emp-head card r-card">${avatar(m, 84)}<div><h2 style="margin:0">${esc(m.name || '')}</h2><div class="r-sub">${esc(m.title || '')} · ${esc((DEPTS[m.dept] || {}).name || '')}</div>
      <div class="emp-kpis"><span><b>${leaveBalance(mid)}</b> يوم رصيد إجازة</span>${yrs != null ? `<span><b>${yrs.toFixed(1)}</b> سنة خدمة</span>` : ''}<span><b>${reqs.filter(r => r.status.startsWith('pending')).length}</b> طلب قيد الاعتماد</span></div></div>
      ${!self && can('hr') ? `<button class="btn btn-ghost btn-sm" style="margin-inline-start:auto" onclick="erpEdit('hr_profiles',${p ? `'${p.id}'` : 'null'},{member_id:'${mid}'})">${p ? 'تعديل الملف' : 'إنشاء الملف'}</button>` : ''}</div>
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3><i data-lucide="file-badge"></i> بيانات التوظيف</h3></div>${p ? `<dl class="r-dl">${row('نوع العقد', CONTRACT[p.contract_type])}${row('تاريخ المباشرة', fmtD(p.hire_date))}${row('نهاية التجربة', p.probation_end ? (p.probation_end < today() ? 'انتهت ' + fmtD(p.probation_end) : expiryChip(p.probation_end)) : '')}${row('نهاية العقد', p.contract_end ? expiryChip(p.contract_end) : '')}${row('المؤهل', esc(p.qualification || ''))}${row('الجنسية', esc(p.nationality || ''))}${row('الطوارئ', esc(p.phone2 || ''))}${row('البريد', esc(m.email || ''))}</dl>` : '<p class="r-sub">لم يُنشأ ملف التوظيف بعد.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="folder-lock"></i> الوثائق</h3></div>${docs.map(d => `<div class="r-row"><span>${DOC_KINDS[d.kind] || d.kind}${d.number ? ' — ' + esc(d.number) : ''}</span><span>${expiryChip(d.expiry)}</span>${d.url ? linkChip({ url: d.url, title: 'فتح' }) : ''}</div>`).join('') || '<p class="r-sub">لا وثائق.</p>'}</div></div>
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3><i data-lucide="calendar-range"></i> الطلبات والإجازات</h3></div>${erpListRows('hr_requests', reqs.slice(-8).reverse())}</div>
    <div class="card r-card"><div class="r-card-h"><h3><i data-lucide="star"></i> تقييمات الأداء</h3></div>${revs.map(r => `<button class="r-row ac-alert" onclick="erpView('hr_reviews','${r.id}')"><span>${esc(r.period)}</span><span>${revScore(r)}</span>${erpBadge(REV_ST, r.status)}</button>`).join('') || '<p class="r-sub">لا تقييمات بعد.</p>'}</div></div>`;
}
function peopleUI() {
  const P = ERP.rows.hr_profiles || [];
  return `<div class="emp-grid">${ORG.members.filter(m => m.active !== false).map(m => { const p = P.find(x => x.member_id === m.id), alerts = hrAlerts(m.id); return `<button class="card emp-card" onclick="ERP._emp='${m.id}';erpGo('emp')">${avatar(m, 64)}<b>${esc(m.name)}</b><span class="r-sub">${esc(m.title || '')}</span><span class="r-sub">${p ? CONTRACT[p.contract_type] + ' · منذ ' + fmtD(p.hire_date) : 'لا ملف توظيف'}</span>${alerts.length ? `<span class="r-badge" style="--c:#f59e0b">${alerts.length} تنبيه</span>` : ''}</button>`; }).join('')}</div>`;
}
/* تنبيهات الامتثال لنظام العمل لكل موظف */
function hrAlerts(mid) {
  const p = (ERP.rows.hr_profiles || []).find(x => x.member_id === mid), A = [], soon = d => d && daysBetween(today(), d) - 1 <= 30;
  if (p && p.probation_end && p.probation_end >= today() && soon(p.probation_end)) A.push('تنتهي فترة التجربة ' + fmtD(p.probation_end) + ' — قيّم الموظف قبلها');
  if (p && p.contract_end && soon(p.contract_end)) A.push('ينتهي العقد ' + fmtD(p.contract_end) + ' — جدّد أو أبلغ قبل انتهائه');
  (ERP.rows.hr_docs || []).filter(d => d.member_id === mid && d.expiry && daysBetween(today(), d.expiry) - 1 <= 60).forEach(d => A.push((DOC_KINDS[d.kind] || 'وثيقة') + ' تنتهي ' + fmtD(d.expiry)));
  if (!p) A.push('لم يُنشأ ملف التوظيف');
  return A;
}
/* مخالصة إنهاء الخدمة: تُظهر العهد المفتوحة والأصول في عهدة الموظف (لا مخالصة قبل تسليمها) */
function offboardChecks(r) {
  const D = (typeof demoDB === 'function' && !(RUSO_LIVE && !RUSO_DEMO)) ? demoDB() || {} : {}, cust = (ERP.rows.custodies || D.custodies || []).filter(c => c.member_id === r.member_id && c.status === 'open'), assets = (ERP.rows.fixed_assets || D.fixed_assets || []).filter(a => a.custodian === r.member_id && a.status === 'active');
  if (RUSO_LIVE && !RUSO_DEMO && !can('finance')) return `<div class="r-warn info"><i data-lucide="info"></i> تأكد من الشؤون المالية أن العهد النقدية والأصول في عهدة الموظف سُلّمت قبل المخالصة.</div>`;
  return `<h4>فحص المخالصة</h4>${cust.length ? `<div class="r-warn bad"><i data-lucide="wallet-cards"></i> ${cust.length} عهدة نقدية مفتوحة — تُسوّى قبل المخالصة</div>` : '<div class="r-warn info"><i data-lucide="check"></i> لا عهد نقدية مفتوحة</div>'}${assets.length ? `<div class="r-warn warn"><i data-lucide="armchair"></i> في عهدته: ${assets.map(a => esc(a.name)).join('، ')}</div>` : '<div class="r-warn info"><i data-lucide="check"></i> لا أصول في عهدته</div>'}`;
}
function hrFlow(r) {
  const req = ORG.members.find(m => m.id === r.member_id) || {}, isMgr = isAdmin() || (ME.role === 'manager' && ME.dept === req.dept && ME.id !== r.member_id);
  const A = [];
  if (r.status === 'pending_manager' && isMgr) A.push({ to: 'pending_hr', label: 'موافقة المدير المباشر' }, { to: 'rejected', label: 'رفض', ghost: 1, ask: 'سبب الرفض:' });
  if (r.status === 'pending_hr' && (can('hr') || isAdmin())) A.push({ to: 'approved', label: 'اعتماد نهائي', check: x => x.kind === 'annual' && (+x.days || 0) > leaveBalance(x.member_id) ? 'الرصيد لا يكفي' : '' }, { to: 'rejected', label: 'رفض', ghost: 1, ask: 'سبب الرفض:' });
  if (['pending_manager', 'pending_hr'].includes(r.status) && r.member_id === ME.id) A.push({ to: 'cancelled', label: 'إلغاء طلبي', ghost: 1 });
  return A;
}
function myHrUI() {
  const mine = (ERP.rows.hr_requests || []).filter(r => r.member_id === ME.id), toApprove = (ERP.rows.hr_requests || []).filter(r => r.member_id !== ME.id && hrFlow(r).length);
  return `<div class="r-kpis"><div class="r-kpi static"><i data-lucide="plane"></i><b>${leaveBalance(ME.id)}</b><span>رصيد الإجازة السنوية المتبقي ${new Date().getFullYear()}</span></div><div class="r-kpi static"><i data-lucide="hourglass"></i><b>${mine.filter(r => r.status.startsWith('pending')).length}</b><span>طلبات قيد الاعتماد</span></div></div>
  <div class="r-filters"><button class="btn btn-gold" onclick="erpEdit('hr_requests',null,{member_id:ME.id,status:'pending_manager'})"><i data-lucide="plus"></i> طلب جديد (إجازة، استئذان، خطاب، سلفة…)</button></div>
  ${toApprove.length ? `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="stamp"></i> بانتظار موافقتك</h3></div>${erpListRows('hr_requests', toApprove)}</div>` : ''}
  <div class="card r-card"><div class="r-card-h"><h3>طلباتي</h3></div>${erpListRows('hr_requests', mine)}</div>`;
}
function erpListRows(t, rows) { const T = ERP_T[t]; return `<div style="overflow:auto"><table class="r-table"><thead><tr>${T.cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr onclick="erpView('${t}','${r.id}')" style="cursor:pointer">${T.cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${T.cols.length}" class="r-sub">لا شيء.</td></tr>`}</tbody></table></div>`; }
function hrPrint(id) {
  const r = ERP.rows.hr_requests.find(x => x.id === id), m = ORG.members.find(x => x.id === r.member_id) || {};
  const body = r.kind === 'letter' ? `<p>تشهد ${esc(CONFIG.companyName)} بأن الأستاذ/ ${esc(m.name)} يعمل لديها بوظيفة «${esc(m.title || '')}» ولا يزال على رأس العمل حتى تاريخه، وقد أُعطي هذا الخطاب بناءً على طلبه دون أدنى مسؤولية على الجمعية.</p>`
    : `<p>بناءً على طلب الموظف/ <b>${esc(m.name)}</b> (${esc(m.title || '')})، تمت الموافقة على <b>${HR_KINDS[r.kind]}</b>${r.from_date ? ` من ${fmtD(r.from_date)} إلى ${fmtD(r.to_date)} (${r.days || 1} يوماً)` : ''}${r.amount ? ` بمبلغ ${sar(r.amount)} ريال` : ''}.</p>${r.reason ? `<p>التفاصيل: ${esc(r.reason)}</p>` : ''}`;
  acPrintDoc(r.kind === 'letter' ? 'خطاب تعريف' : 'قرار ' + HR_KINDS[r.kind], `<div style="font-size:15px;line-height:2.1">${body}<p class="r-sub">مسار الاعتماد: ${(r.log || []).map(l => esc(l.t) + ' (' + esc(memName(l.by)) + ')').join(' ← ')}</p></div>`);
}

/* ═════════ المشتريات (سياسة الشراء ولائحة الصلاحيات) ═════════ */
function prFlow(r) {
  const F = CONFIG.finance || {}, amt = +(r.award_amount || r.est_total || 0), A = [];
  if (r.status === 'request' && can('finance')) A.push({ to: 'budget_ok', label: 'تأكيد توفر الاعتماد في الموازنة' }, { to: 'rejected', label: 'رفض', ghost: 1, ask: 'السبب:' });
  if (r.status === 'budget_ok' && can('procurement')) A.push({ to: 'pending_approval', label: 'رفع للاعتماد', check: x => { const n = (x.quotes || []).length, need = +(x.est_total || 0) > F.quotesLimit ? 3 : 1; return n < need ? `يلزم ${need === 3 ? '3 عروض أسعار' : 'عرض سعر'} على الأقل (المشتريات فوق ${sar0(F.quotesLimit)} ريال)` : !x.supplier ? 'اختر المورد ومبلغ الترسية من «تعديل»' : ''; } });
  if (r.status === 'pending_approval' && isAdmin()) A.push({ to: 'approved', label: amt > F.boardLimit ? 'اعتماد (بعد قرار المجلس)' : 'اعتماد الشراء', confirm: amt > F.boardLimit ? 'المبلغ يتجاوز ' + sar0(F.boardLimit) + ' ريال — هل صدر قرار مجلس الإدارة؟' : '' }, { to: 'rejected', label: 'رفض', ghost: 1, ask: 'السبب:' });
  if (r.status === 'approved' && can('procurement')) A.push({ to: 'ordered', label: 'إصدار أمر الشراء', patch: x => ({ po_number: 'PO-' + new Date().getFullYear() + '-' + String(x.number || 0).padStart(4, '0'), ordered_at: today() }) });
  if (r.status === 'ordered' && can('procurement')) A.push({ to: 'received', label: 'تأكيد الاستلام والفحص', check: x => amt > F.inspectLimit && !x.receipt_url ? 'أرفق محضر الفحص والاستلام والفاتورة (للأصناف فوق ' + sar0(F.inspectLimit) + ' ريال)' : '' });
  if (r.status === 'received' && can('finance')) A.push({ to: 'invoiced', label: 'إنشاء سند صرف', patch: async x => { const v = await RDB.insert('vouchers', { kind: 'payment', date: today(), amount: amt, party: x.supplier, category: x.category || 'prog_exp', program_id: x.program_id || null, dept: x.dept, fund: 'unrestricted', method: 'transfer', reference: x.po_number || '', description: x.title + ' — ' + (x.po_number || ''), attachment_url: x.receipt_url || '', quotes_count: (x.quotes || []).length, status: 'pending', created_by: ME.id }); return { voucher_id: v.id }; } });
  return A;
}
function prPrintPO(id) {
  const r = ERP.rows.purchase_requests.find(x => x.id === id), items = (r.items || []).filter(i => i.item);
  acPrintDoc('أمر شراء ' + (r.po_number || ''), `<p><b>إلى المورد:</b> ${esc(r.supplier || '')} &nbsp; · &nbsp; <b>التاريخ:</b> ${fmtD(r.ordered_at || today())} &nbsp; · &nbsp; <b>طلب الشراء:</b> PR-${r.number}</p>
    <table><thead><tr><th>#</th><th>الصنف والمواصفات</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${items.map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.item)}</td><td>${esc(i.qty)}</td><td>${esc(i.price)}</td><td>${sar((+i.qty || 0) * (+i.price || 0))}</td></tr>`).join('')}
    <tr class="tot"><td colspan="4">مبلغ الترسية</td><td>${sar(r.award_amount || r.est_total)} ريال</td></tr></tbody></table>
    <p>${tafqeet(r.award_amount || r.est_total)}</p><p class="r-sub">الفاتورة باسم ${esc(CONFIG.companyName)} — التسليم بمحضر فحص واستلام — البرنامج: ${esc(programName(r.program_id) || 'عام')}</p>`);
}

/* ═════════ الحوكمة ═════════ */
function meetPrint(id) {
  const m = ERP.rows.meetings.find(x => x.id === id), decs = (ERP.rows.decisions || []).filter(d => d.meeting_id === id);
  acPrintDoc((m.status === 'planned' ? 'دعوة اجتماع ' : 'محضر اجتماع ') + MEET_BODY[m.body] + ' رقم ' + (m.number || ''), `<p><b>التاريخ:</b> ${fmtD(m.date)} · <b>المكان:</b> ${esc(m.location || '')}</p>
    <h3>جدول الأعمال</h3><p style="white-space:pre-line">${esc(m.agenda || '')}</p>
    ${(m.attendees || []).length ? `<h3>الحضور</h3><table><thead><tr><th>الاسم</th><th>الصفة</th><th>الحضور</th><th>التوقيع</th></tr></thead><tbody>${m.attendees.map(a => `<tr><td>${esc(a.name)}</td><td>${esc(a.role)}</td><td>${esc(a.present || '')}</td><td></td></tr>`).join('')}</tbody></table>` : ''}
    ${decs.length ? `<h3>القرارات</h3><table><thead><tr><th>الرقم</th><th>القرار</th><th>المسؤول</th><th>الموعد</th></tr></thead><tbody>${decs.map(d => `<tr><td>${esc(d.number || '')}</td><td>${esc(d.text)}</td><td>${esc(memName(d.owner))}</td><td>${fmtD(d.due)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${m.status !== 'planned' ? `<p>النصاب: ${m.quorum ? 'مكتمل' : 'غير مكتمل'}</p>` : ''}`);
}
/* تقويم الالتزامات: يُعبّأ تلقائياً من مواعيد اللوائح أول مرة، والإنجاز يولّد الموعد القادم للالتزامات الدورية */
async function erpSeedCompliance() {
  if ((ERP.rows.compliance || []).length || !can('governance')) return;
  const y = new Date().getFullYear(), Y = m => y + '-' + m;
  const items = [
    ['رفع ميزان المراجعة للسنة المنتهية', 'اللائحة المالية — خلال شهر من نهاية السنة', Y('01-31'), 'yearly'],
    ['إقرارات تعارض المصالح السنوية (المجلس والموظفون)', 'سياسة تعارض المصالح', Y('01-31'), 'yearly'],
    ['رفع الحساب الختامي للمراجع الخارجي', 'اللائحة المالية — خلال شهرين', Y('02-28'), 'yearly'],
    ['اعتماد القوائم المالية من مجلس الإدارة', 'اللائحة المالية — خلال 3 أشهر', Y('03-31'), 'yearly'],
    ['تقرير ربع سنوي للرئيس والجهة المشرفة', 'اللائحة المالية', Y('03-31'), 'quarterly'],
    ['مراجعة سقف العهد المستديمة', 'اللائحة المالية — كل 3 أشهر', Y('03-31'), 'quarterly'],
    ['اجتماع الجمعية العمومية العادي', 'اللائحة الأساسية', Y('04-30'), 'yearly'],
    ['إعداد مشروع الموازنة للسنة القادمة', 'اللائحة المالية — قبل نهاية السنة بثلاثة أشهر', Y('09-30'), 'yearly'],
    ['خطة الشراء السنوية', 'سياسة الشراء', Y('11-30'), 'yearly'],
    ['تعليمات إقفال السنة المالية', 'اللائحة المالية — قبل 30 يوماً من نهاية السنة', Y('12-01'), 'yearly'],
    ['تحديث سجل الموردين المعتمدين', 'سياسة الشراء — سنوياً', Y('12-31'), 'yearly'],
    ['جرد الأصول الثابتة والصندوق وتسوية العهد', 'اللائحة المالية', Y('12-31'), 'yearly'],
  ];
  const next = (due, recur) => { const d = new Date(due + 'T00:00:00'), t = today(); while (d.toISOString().slice(0, 10) < t) { if (recur === 'quarterly') d.setMonth(d.getMonth() + 3); else d.setFullYear(d.getFullYear() + 1); } return d.toISOString().slice(0, 10); };
  for (const [title, ref, due, recur] of items) await RDB.insert('compliance', { title, ref, due: next(due, recur), recur, status: 'open', created_by: ME.id });
  await erpLoad('compliance');
}
/* الشراكات: تُعبّأ أول مرة من شركاء الجمعية المنشورين في الموقع (بيانات حقيقية) */
async function erpSeedPartners() {
  if ((ERP.rows.partnerships || []).length || !can('grants')) return;
  const P = await RDB.list('partners', { order: 'sort', asc: true }).catch(() => []);
  for (const p of P) await RDB.insert('partnerships', { partner: p.name, kind: /وزارة|المجلس|صندوق/.test(p.name) ? 'جهة حكومية / إشرافية' : /مؤسسة|أوقاف|الراجحي/.test(p.name) ? 'جهة مانحة' : 'شريك تنفيذي', scope: 'شريك معلن في موقع ' + TERMS.org + ' — أضف نطاق الاتفاقية وتاريخها', status: 'active', url: p.url || '', created_by: ME.id });
  if (P.length) await erpLoad('partnerships');
}
async function cmpNext(r) {
  if (!r.recur || r.recur === 'once') return;
  const d = new Date(r.due + 'T00:00:00'); if (r.recur === 'yearly') d.setFullYear(d.getFullYear() + 1); else if (r.recur === 'quarterly') d.setMonth(d.getMonth() + 3); else d.setMonth(d.getMonth() + 1);
  await RDB.insert('compliance', { title: r.title, ref: r.ref, due: d.toISOString().slice(0, 10), recur: r.recur, owner: r.owner || null, status: 'open', created_by: ME.id });
}

/* ═════════ الصادر: خطاب رسمي بهوية الجمعية ═════════ */
function mailPrint(id) {
  const r = ERP.rows.correspondence.find(x => x.id === id);
  rPrintHTML(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${esc(mailNo(r))}</title><base href="${location.href.replace(/[^/]*$/, '')}"><style>${CONFIG.printFonts || ''}
  @page{size:A4;margin:0}body{margin:0;font-family:${CONFIG.printFontFamily || 'Tahoma'},Tahoma,sans-serif;color:#14292D;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pg{width:210mm;min-height:297mm;position:relative;padding:16mm 20mm 34mm}.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #41747F;padding-bottom:6mm}.hd img{height:20mm}.meta{font-size:13px;line-height:1.9;text-align:left}
  .to{margin:12mm 0 6mm;font-size:16px;line-height:2}.sub{font-weight:700;font-size:16px;margin-bottom:6mm}.bd{font-size:15.5px;line-height:2.2;white-space:pre-line;text-align:justify}.sg{margin-top:18mm;text-align:left;font-size:15px;line-height:2}
  .ft{position:absolute;bottom:14mm;inset-inline:20mm;display:flex;justify-content:space-between;font-size:11px;color:#41747F;border-top:1px solid #cfdcde;padding-top:3mm}
  .zz{position:absolute;bottom:0;left:0;right:0;height:7mm;background:linear-gradient(135deg,#41747F 25%,transparent 25%) 0 0/18mm 7mm,linear-gradient(225deg,#41747F 25%,transparent 25%) 0 0/18mm 7mm,linear-gradient(135deg,#CAB05F 25%,transparent 25%) 9mm 0/18mm 7mm,linear-gradient(225deg,#CAB05F 25%,transparent 25%) 9mm 0/18mm 7mm}</style></head><body>
  <div class="pg"><div class="hd"><img src="${esc(CONFIG.brandLogo)}" alt=""><div class="meta">الرقم: ${esc(mailNo(r))}<br>التاريخ: ${esc(r.date)}<br>المرفقات: —</div></div>
  <div class="to">المكرمين/ ${esc(r.party)} &nbsp;&nbsp; المحترمين<br>السلام عليكم ورحمة الله وبركاته،</div><div class="sub">الموضوع: ${esc(r.subject)}</div><div class="bd">${esc(r.body || '')}</div>
  <div class="sg">وتقبلوا خالص التحية والتقدير،<br><b>${esc(TERMS.head)}</b><br>${esc(memName((ORG.members.find(m => m.role === 'admin') || {}).id))}</div>
  <div class="ft"><span>${esc(CONFIG.companyName)} — ترخيص ${esc(CONFIG.license || '')}</span><span>${esc(CONFIG.companyAddress || '')}</span><span dir="ltr">${esc((CONFIG.websiteUrl || '').replace(/^https?:\/\//, ''))}</span></div><div class="zz"></div></div></body></html>`);
}

/* ═════════ لوحات التطبيقات ═════════ */
const kpi = (ic, v, t) => `<div class="r-kpi static"><i data-lucide="${ic}"></i><b class="sm">${v}</b><span>${t}</span></div>`;
const bars = (rows, total) => rows.map(([n, v]) => `<div class="r-dept-row"><div class="r-dept-n">${esc(n)}</div><div class="r-bar"><span style="flex:${v || .0001};background:#41747F">${v || ''}</span><span style="flex:${Math.max((total || 1) - v, .0001)};background:#E8EEEF"></span></div></div>`).join('');
const ERP_DASH = {
  beneficiaries: () => {
    const B = ERP.rows.beneficiaries || [], E = ERP.rows.enrollments || [], y = String(ERP.year);
    const done = E.filter(e => e.status === 'completed').length, hrs = E.reduce((s, e) => s + (+e.hours || 0), 0), withPost = E.filter(e => e.pre_score != null && e.post_score != null);
    const gain = withPost.length ? Math.round(withPost.reduce((s, e) => s + (e.post_score - e.pre_score), 0) / withPost.length) : null;
    const byProg = ORG.programs.map(p => [p.title, E.filter(e => e.program_id === p.id).length]).filter(x => x[1]);
    return `<div class="r-kpis">${kpi('users-round', B.length, 'مستفيد ومستفيدة')}${kpi('clipboard-check', E.length, 'تسجيل في البرامج')}${kpi('award', E.length ? Math.round(done / E.length * 100) + '%' : '—', 'نسبة الإتمام')}${kpi('timer', sar0(hrs), 'ساعة تدريبية محققة')}</div>
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3>التسجيل حسب البرنامج</h3></div>${bars(byProg, Math.max(1, ...byProg.map(x => x[1])))||'<p class="r-sub">لا تسجيلات.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3>الفئات والأثر</h3></div>${bars(Object.entries(BEN_CAT).map(([k, t]) => [t, B.filter(b => b.category === k).length]).filter(x => x[1]), B.length)}
      <div class="r-row"><span>ذكور / إناث</span><b>${B.filter(b => b.gender !== 'f').length} / ${B.filter(b => b.gender === 'f').length}</b></div>${gain != null ? `<div class="r-row"><span>متوسط التحسن (قبلي ← بعدي)</span><b>${gain > 0 ? '+' : ''}${gain} نقطة</b></div>` : ''}</div></div>
    <p class="r-sub">هذه الأرقام تغذّي التقرير السنوي ولوحة الأثر في الموقع.</p>`;
  },
  volunteers: () => {
    const V = ERP.rows.volunteers || [], H = ERP.rows.volunteer_hours || [], ok = H.filter(h => h.status === 'approved');
    const top = V.map(v => [v.name, volHours(v.id)]).sort((a, b) => b[1] - a[1]).slice(0, 6).filter(x => x[1]);
    return `<div class="r-kpis">${kpi('hand-heart', V.filter(v => v.status === 'active').length, 'متطوع نشط')}${kpi('timer', sar0(ok.reduce((s, h) => s + (+h.hours || 0), 0)), 'ساعة تطوعية معتمدة')}${kpi('hourglass', H.filter(h => h.status === 'pending').length, 'ساعات بانتظار الاعتماد')}${kpi('user-plus', V.filter(v => v.status === 'candidate').length, 'مرشّح جديد')}</div>
    <div class="card r-card"><div class="r-card-h"><h3>الأكثر عطاءً</h3></div>${bars(top, Math.max(1, ...top.map(x => x[1])))||'<p class="r-sub">لا ساعات معتمدة بعد.</p>'}</div>
    <p class="r-sub">لائحة العمل التطوعي: تُوثّق الساعات وتُعتمد من المشرف، ويُكرَّم المتطوع بشهادة ساعات معتمدة.</p>`;
  },
  hr: () => {
    const R = ERP.rows.hr_requests || [], D = ERP.rows.hr_docs || [], soon = D.filter(d => d.expiry && daysBetween(today(), d.expiry) <= 61), out = R.filter(r => r.status === 'approved' && ['annual', 'sick', 'emergency', 'exam', 'unpaid', 'mission'].includes(r.kind) && r.from_date <= today() && r.to_date >= today());
    return `<div class="r-kpis">${kpi('hourglass', R.filter(r => r.status.startsWith('pending')).length, 'طلبات قيد الاعتماد')}${kpi('plane', out.length, 'في إجازة / مهمة اليوم')}${kpi('id-card', soon.length, 'وثائق تنتهي خلال شهرين')}${kpi('users', ORG.members.filter(m => m.active !== false).length, 'موظف')}</div>
    ${(() => { const al = ORG.members.filter(m => m.active !== false).flatMap(m => hrAlerts(m.id).map(t => [m, t])); return al.length ? `<div class="card r-card"><div class="r-card-h"><h3><i data-lucide="shield-alert"></i> تنبيهات الامتثال لنظام العمل</h3></div>${al.map(([m, t]) => `<button class="r-row ac-alert" onclick="ERP._emp='${m.id}';erpGo('emp')">${avatar(m, 26)}<span>${esc(m.name)}</span><span class="r-sub">${esc(t)}</span></button>`).join('')}</div>` : ''; })()}
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3>خارج المكتب اليوم</h3></div>${out.map(r => `<div class="r-row">${avatar(ORG.members.find(m => m.id === r.member_id), 26)}<span>${esc(memName(r.member_id))}</span><span class="r-sub">${HR_KINDS[r.kind]} حتى ${fmtD(r.to_date)}</span></div>`).join('') || '<p class="r-sub">الجميع على رأس العمل.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3>أرصدة الإجازة السنوية</h3></div>${ORG.members.filter(m => m.active !== false).map(m => `<div class="r-row">${avatar(m, 26)}<span>${esc(m.name)}</span><b>${leaveBalance(m.id)} يوماً</b></div>`).join('')}</div></div>`;
  },
  procurement: () => {
    const P = ERP.rows.purchase_requests || [], S = ERP.rows.suppliers || [], open = P.filter(p => !['invoiced', 'rejected'].includes(p.status));
    return `<div class="r-kpis">${kpi('shopping-cart', open.length, 'طلب شراء مفتوح')}${kpi('wallet', sar(open.reduce((s, p) => s + +(p.award_amount || p.est_total || 0), 0)), 'قيمة الطلبات المفتوحة')}${kpi('store', S.filter(s => s.approved).length, 'مورد معتمد')}${kpi('badge-alert', S.filter(s => s.approved && s.approved_year && +s.approved_year < new Date().getFullYear()).length, 'مورد يحتاج تجديد اعتماد')}</div>
    <div class="card r-card"><div class="r-card-h"><h3>الدورة</h3></div><p class="r-sub" style="line-height:2">طلب الإدارة ← تأكيد المالية لتوفر الاعتماد ← جمع العروض (3 عروض فوق ${sar((CONFIG.finance || {}).quotesLimit)} ريال) ← اعتماد ${TERMS.head} (والمجلس فوق ${sar((CONFIG.finance || {}).boardLimit)}) ← أمر الشراء ← الاستلام بمحضر فحص ← سند صرف آلي ← قيد محاسبي آلي. يُحظر تجزئة المشتريات.</p>
    ${Object.entries(PR_ST).map(([k, s]) => `<div class="r-row"><span>${erpBadge(PR_ST, k)}</span><b>${P.filter(p => p.status === k).length}</b></div>`).join('')}</div>`;
  },
  governance: () => {
    const M = ERP.rows.meetings || [], D = ERP.rows.decisions || [], C = ERP.rows.compliance || [], X = ERP.rows.disclosures || [], y = new Date().getFullYear();
    const late = C.filter(c => c.status === 'open' && c.due < today()), next = C.filter(c => c.status === 'open' && c.due >= today()).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
    return `<div class="r-kpis">${kpi('presentation', M.filter(m => String(m.date).startsWith(y) && m.body === 'board' && m.status !== 'cancelled').length, 'اجتماع مجلس ' + y)}${kpi('gavel', D.filter(d => d.status === 'open').length, 'قرار قيد التنفيذ')}${kpi('alarm-clock', late.length, 'التزام متأخر')}${kpi('shield-check', X.filter(x => +x.year === y).length, 'إقرار تعارض مصالح ' + y)}</div>
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3>الالتزامات القادمة</h3><button class="link-btn" onclick="erpGo('compliance')">التقويم</button></div>${late.concat(next).map(c => `<button class="r-row ac-alert" onclick="erpView('compliance','${c.id}')"><span>${esc(c.title)}</span><span class="r-sub" style="color:${c.due < today() ? 'var(--bad)' : ''}">${fmtD(c.due)}</span></button>`).join('') || '<p class="r-sub">لا التزامات.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3>قرارات تحتاج متابعة</h3><button class="link-btn" onclick="erpGo('decisions')">كل القرارات</button></div>${D.filter(d => d.status === 'open').slice(0, 6).map(d => `<button class="r-row ac-alert" onclick="erpView('decisions','${d.id}')"><span>${esc(String(d.text).slice(0, 70))}</span><span class="r-sub">${esc(memName(d.owner))}</span></button>`).join('') || '<p class="r-sub">لا قرارات مفتوحة.</p>'}</div></div>`;
  },
  grants: () => {
    const G = ERP.rows.grants || [], P = ERP.rows.partnerships || [], due = G.flatMap(g => (g.reports || []).filter(r => r.due && !/^نعم|^y/i.test(r.done || '')).map(r => ({ g, r }))).sort((a, b) => a.r.due.localeCompare(b.r.due)).slice(0, 6);
    return `<div class="r-kpis">${kpi('send', G.filter(g => g.status === 'submitted').length, 'طلب مقدّم بانتظار الرد')}${kpi('badge-check', sar(G.filter(g => ['approved', 'active', 'closed'].includes(g.status)).reduce((s, g) => s + +(g.amount_approved || 0), 0)), 'إجمالي المنح المعتمدة')}${kpi('percent', (() => { const d = G.filter(g => ['approved', 'active', 'closed', 'rejected'].includes(g.status)); return d.length ? Math.round(d.filter(g => g.status !== 'rejected').length / d.length * 100) + '%' : '—'; })(), 'نسبة القبول')}${kpi('handshake', P.filter(p => p.status === 'active').length, 'شراكة سارية')}</div>
    <div class="r-grid2"><div class="card r-card"><div class="r-card-h"><h3>تقارير المانحين القادمة</h3></div>${due.map(x => `<button class="r-row ac-alert" onclick="erpView('grants','${x.g.id}')"><span>${esc(x.r.title)} — ${esc(x.g.title)}</span><span class="r-sub" style="color:${x.r.due < today() ? 'var(--bad)' : ''}">${fmtD(x.r.due)}</span></button>`).join('') || '<p class="r-sub">لا تقارير مستحقة.</p>'}</div>
    <div class="card r-card"><div class="r-card-h"><h3>مراحل المنح</h3></div>${Object.keys(GRANT_ST).map(k => `<div class="r-row"><span>${erpBadge(GRANT_ST, k)}</span><b>${G.filter(g => g.status === k).length}</b></div>`).join('')}</div></div>`;
  },
};
const ERP_TOOLS = {
  beneficiaries: () => can('beneficiaries') ? `<button class="btn btn-ghost" onclick="benImport()"><i data-lucide="download"></i> تحويل تسجيلات الموقع</button>` : '',
  volunteers: () => can('volunteers') ? `<button class="btn btn-ghost" onclick="volImport()"><i data-lucide="download"></i> طلبات التطوع من الموقع</button>` : '',
};
Object.keys(ERP_MODS).forEach(k => { window['renderErp_' + k] = () => renderErp(k); });
