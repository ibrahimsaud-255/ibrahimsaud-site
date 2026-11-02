/* نسخة عرض «نَسَق» من نظام إبراهيم (/app) — تُحمَّل قبل 99-boot.js.
   تستبدل البيانات الافتراضيّة الخاصّة ببيانات عامّة، وتخفي التطبيقات اللي تعتمد على خوادم إبراهيم. */
(function () {
  // لوحة حروف ودروس وموقع إبراهيم ومدوّنته وقائمته البريديّة مربوطة بخوادمه — ما تظهر في العرض
  var HIDE = ['huroof', 'sitework', 'blog', 'newsletter'];
  // وبطاقة «هدف حروف ودروس» في الرئيسيّة خاصّة بإبراهيم
  for (var w = HOME_WIDGETS.length - 1; w >= 0; w--) if (HOME_WIDGETS[w].key === 'huroof_goal') HOME_WIDGETS.splice(w, 1);
  [APPS, LAUNCH].forEach(function (arr) { for (var i = arr.length - 1; i >= 0; i--) if (HIDE.indexOf(arr[i].id) >= 0) arr.splice(i, 1); });

  var st = def.settings;
  Object.assign(st, { brand: 'شركتك', owner: 'مدير النظام', email: 'demo@ibrahimsaud.com', phone: '966500000000', salesperson: 'فريق المبيعات', bankName: 'البنك', iban: 'SA0000000000000000000000', accName: 'شركتك' });
  st.official = { brand: 'شركتك', owner: 'مدير النظام', email: 'demo@ibrahimsaud.com', phone: '966500000000', vat: '', cr: '', iban: '', address: 'الرياض' };
  st.brandProfiles = [Object.assign({}, st.brandProfiles[0], { id: 'brand', name: 'شركتك', tagline: 'نسخة عرض من نَسَق', logo: '' })];
  st.defaultBrandId = 'brand';
  def.products = [
    { id: 'p1', name: 'تصميم هويّة بصريّة', price: 4500, unit: 'مشروع', desc: 'شعار وألوان وخطوط ودليل استخدام' },
    { id: 'p2', name: 'موقع تعريفيّ', price: 8000, unit: 'مشروع', desc: 'تصميم وبرمجة وربط بالنطاق' },
    { id: 'p3', name: 'فيديو إعلانيّ قصير', price: 1500, unit: 'فيديو', desc: 'فكرة وسكربت وتصوير ومونتاج' },
    { id: 'p4', name: 'إدارة حسابات التواصل', price: 3000, unit: 'شهر', desc: 'خطّة محتوى ونشر وتقرير شهريّ' },
    { id: 'p5', name: 'جلسة استشارة', price: 500, unit: 'ساعة', desc: '' },
  ];
  def.subscriptions = [
    { id: 's1', name: 'استضافة الموقع', usd: 0, sar: 120, cycle: 'monthly', date: '', url: '', note: '', active: true },
    { id: 's2', name: 'برامج التصميم', usd: 0, sar: 89, cycle: 'monthly', date: '', url: '', note: '', active: true },
    { id: 's3', name: 'Claude', usd: 20, sar: 75, cycle: 'monthly', date: '', url: 'https://claude.ai', note: 'تعديل النظام والموقع بكلام عاديّ', active: true },
    { id: 's4', name: 'إيجار المكتب', usd: 0, sar: 2500, cycle: 'monthly', date: '', url: '', note: '', active: true },
  ];
  def.workspace.team = [
    { id: 'm1', name: 'المدير', role: 'المالك', color: '#2F66FF' },
    { id: 'm2', name: 'سارة', role: 'مديرة المشاريع', color: '#a855f7' },
    { id: 'm3', name: 'خالد', role: 'مصمّم', color: '#22c55e' },
  ];
  def.habits.list.forEach(function (h) { delete h.link; });
  def.huroofGoal.visionNote = '';
})();
