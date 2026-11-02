/* نسخة عرض «نَسَق» — تُحمَّل بعد 99-boot.js: تعبّي بيانات تجريبيّة أوّل مرّة وتفتح النظام بلا تسجيل دخول.
   كلّ شي يُحفظ في متصفّح الزائر فقط (STATE_ID فاضي، فما في مزامنة مع أيّ خادم). */
(function () {
  function d(n) { var x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }
  function seed() {
    var people = [
      ['شركة أفق للتقنية', 'quoted', 18000], ['مكتب رؤية للاستشارات', 'won', 9500], ['متجر وردة الإلكترونيّ', 'delivery', 4200],
      ['عيادة ابتسامة', 'lead', 7000], ['أكاديميّة مهارة للتدريب', 'negotiation', 12000], ['مطعم سفرة', 'delivered', 3500],
    ];
    S.contacts = people.map(function (p, i) {
      var c = { id: uid(), name: p[0], type: 'company', phone: '96650000000' + i, email: '', company: p[0], vat: '', city: 'الرياض', website: '', address: '', notes: '', value: p[2], nextAction: i % 2 ? 'متابعة عرض السعر' : 'اتصال تعريفيّ', nextDate: d(i + 1), log: [] };
      setClientStage(c, p[1]); c.stageDate = d(-i * 2); return c;
    });
    var C = S.contacts;
    function quote(ci, items, status, ago) {
      var doc = { id: uid(), number: ++S.counters.sale, client: C[ci].name, contactId: C[ci].id, clientVat: '', date: d(-ago), expiry: d(14 - ago), items: items, discType: 'none', discVal: 0, vat: false, vatRate: 15, status: status, notes: '', templateId: quoteDef().defaultTemplateId, depositPct: 50, notesAuto: true, payments: [] };
      doc.notes = buildInitialQuoteNotes(doc); S.sales.push(doc); return doc;
    }
    quote(0, [{ desc: 'موقع تعريفيّ', qty: 1, price: 8000, discount: 0, details: 'تصميم وبرمجة وربط بالنطاق' }, { desc: 'تصميم هويّة بصريّة', qty: 1, price: 4500, discount: 0, details: '' }], 'sent', 3);
    quote(4, [{ desc: 'فيديو إعلانيّ قصير', qty: 4, price: 1500, discount: 0, details: 'سلسلة إعلانات للدورات' }], 'draft', 1);
    quote(1, [{ desc: 'إدارة حسابات التواصل', qty: 3, price: 3000, discount: 0, details: 'ثلاثة أشهر' }], 'sale', 12);
    function invoice(ci, desc, amount, status, ago) {
      var inv = { id: uid(), number: ++S.counters.invoice, client: C[ci].name, contactId: C[ci].id, clientVat: '', date: d(-ago), items: [{ desc: desc, qty: 1, price: amount, discount: 0, details: '' }], discType: 'none', discVal: 0, notes: '', status: status, vat: false, vatRate: 15, paidDate: status === 'paid' ? d(-ago + 2) : '', payments: [], brandId: 'brand' };
      if (status === 'paid') inv.payments.push({ id: uid(), date: inv.paidDate, amount: amount, method: 'تحويل بنكيّ' });
      if (status === 'partial') inv.payments.push({ id: uid(), date: d(-ago + 1), amount: amount / 2, method: 'تحويل بنكيّ' });
      S.invoices.push(inv);
    }
    invoice(5, 'فيديو إعلانيّ قصير', 3500, 'paid', 20);
    invoice(1, 'إدارة حسابات التواصل — الشهر الأوّل', 9000, 'partial', 10);
    invoice(2, 'متجر إلكترونيّ', 4200, 'unpaid', 4);
    S.projects = [
      { id: uid(), title: 'هويّة وموقع أفق', client: C[0].name, contactId: C[0].id, podcast: '', stageKey: 's2', emoji: 'globe', taskStages: JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES)), tasks: [] },
      { id: uid(), title: 'إعلانات متجر وردة', client: C[2].name, contactId: C[2].id, podcast: '', stageKey: 's3', emoji: 'clapperboard', taskStages: JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES)), tasks: [] },
    ];
    S.crm = [
      { id: uid(), title: 'إرسال عرض السعر لأكاديميّة مهارة', priority: 'high', stageKey: 'todo', due: d(1), notes: '' },
      { id: uid(), title: 'تصوير إعلان متجر وردة', priority: 'med', stageKey: 'doing', due: d(2), notes: '' },
      { id: uid(), title: 'مراجعة تصميم الصفحة الرئيسيّة', priority: 'none', stageKey: 'doing', due: d(3), notes: '' },
      { id: uid(), title: 'تسليم فيديو مطعم سفرة', priority: 'none', stageKey: 'done', due: d(-5), notes: '' },
    ];
    var t = new Date(); t.setHours(10, 0, 0, 0);
    [['اجتماع مع شركة أفق', 1, 10], ['مكالمة عيادة ابتسامة', 2, 13], ['تصوير متجر وردة', 3, 9]].forEach(function (e) {
      var s = new Date(t); s.setDate(s.getDate() + e[1]); s.setHours(e[2]); var en = new Date(s); en.setHours(e[2] + 1);
      var a = { id: uid(), title: e[0], allDay: false, contact: '', contactId: '', notes: '', alert: '' }; calSetSpan(a, s, en); S.appointments.push(a);
    });
    S.demoSeeded = true;
  }
  USER = { id: 'demo', email: ADMIN_EMAIL };
  if (!S.demoSeeded) { try { seed(); } catch (e) { console.warn('demo seed', e); } save(); }
  window.logout = function () { location.href = '/systems/#try'; };
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  renderNav(); initSidebarShell(); applyBranding();
  var dt = document.getElementById('ctDate'); if (dt) dt.textContent = new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' });
  go(/[?&]view=/.test(location.search) ? new URLSearchParams(location.search).get('view') : 'desktop');
  if (typeof calInit === 'function') try { calInit(); } catch (e) {}
})();
