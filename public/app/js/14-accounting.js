/*
 * 14-accounting.js — المحاسبة والاستيراد والإرسال والمرتجعات ونموذج المستند
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ═══════════════ المحاسبة — نظام مبسّط يوازن الميزانية تلقائياً ═══════════════
   النموذج: دفتر يومية واحد (tx) بأنواع مختلفة، ووحدات عمل (مشاريع)، وأصول ثابتة.
   المعادلة المحاسبية تتحقّق دائماً: الأصول = الالتزامات + حقوق الملكية. */
function acc(){
  if(!S.accounting)S.accounting={};
  const A=S.accounting;
  if(!Array.isArray(A.units)||!A.units.length)A.units=[
    {id:'prod',name:'الإنتاج (أعمال إبراهيم سعود)',color:'#f5a623'},
    {id:'minwal',name:'مِنوال (مواقع وأنظمة)',color:'#0ea5e9'},
    {id:'huroof',name:'منصّة حروف ودروس (SaaS)',color:'#8b5cf6'},
    {id:'general',name:'عام / مشترك',color:'#64748b'},
  ];
  if(!Array.isArray(A.tx))A.tx=[];
  if(!Array.isArray(A.assets))A.assets=[];
  if(!A.tab)A.tab='overview';
  return A;
}
const ACC_KINDS={
  income:{label:'إيراد',icon:'trending-up',color:'#22c55e',sign:+1},
  expense:{label:'مصروف تشغيلي',icon:'trending-down',color:'#ef4444',sign:-1},
  asset:{label:'شراء أصل ثابت',icon:'package',color:'#0ea5e9',sign:-1},
  drawing:{label:'مسحوبات شخصية',icon:'user-minus',color:'#f59e0b',sign:-1},
  capital:{label:'رأس مال / إيداع',icon:'plus-circle',color:'#14b8a6',sign:+1},
  loan:{label:'قرض/تمويل (وارد)',icon:'landmark',color:'#a855f7',sign:+1},
  loan_payment:{label:'سداد قسط/قرض',icon:'landmark',color:'#ec4899',sign:-1},
  transfer:{label:'تحويل بين الحسابات',icon:'arrow-left-right',color:'#94a3b8',sign:0},
};
const ACC_ACCOUNTS={cash:'نقد (كاش)',bank:'حساب المؤسسة البنكي'};
const ACC_EXP_CATS=['اشتراكات','إيجار','رواتب/أجور','معدات مستهلكة','تسويق وإعلان','رسوم حكومية','مواصلات','ضيافة','أخرى'];
function accUnit(id){return acc().units.find(u=>u.id===id)||{id:'general',name:'عام',color:'#64748b'}}
function accMoney(n){return money(n)}
/* حساب كل الأرصدة والقوائم — فترة اختيارية (from,to بصيغة YYYY-MM-DD) */
function accCompute(from,to){
  const A=acc();const inRange=d=>(!from||d>=from)&&(!to||d<=to);
  let cash=0,bank=0,fixedAssets=0,liabilities=0,capital=0,drawings=0;
  let incomeAll=0,expenseAll=0,incomePeriod=0,expensePeriod=0;
  const byUnitIncome={},byUnitExpense={},byExpCat={},byIncUnitP={},byExpCatP={};
  const addAcct=(a,v)=>{if(a==='cash')cash+=v;else bank+=v;};
  A.tx.slice().sort((x,y)=>String(x.date).localeCompare(String(y.date))).forEach(t=>{
    const a=Number(t.amount||0);const u=t.unit||'general';
    switch(t.kind){
      case 'capital':capital+=a;addAcct(t.account,a);break;
      case 'income':incomeAll+=a;addAcct(t.account,a);byUnitIncome[u]=(byUnitIncome[u]||0)+a;if(inRange(t.date)){incomePeriod+=a;byIncUnitP[u]=(byIncUnitP[u]||0)+a;}break;
      case 'expense':expenseAll+=a;addAcct(t.account,-a);byUnitExpense[u]=(byUnitExpense[u]||0)+a;byExpCat[t.category||'أخرى']=(byExpCat[t.category||'أخرى']||0)+a;if(inRange(t.date)){expensePeriod+=a;byExpCatP[t.category||'أخرى']=(byExpCatP[t.category||'أخرى']||0)+a;}break;
      case 'asset':fixedAssets+=a;addAcct(t.account,-a);break;
      case 'drawing':drawings+=a;addAcct(t.account,-a);break;
      case 'loan':liabilities+=a;addAcct(t.account,a);break;
      case 'loan_payment':liabilities-=a;addAcct(t.account,-a);break;
      case 'transfer':addAcct(t.account,-a);addAcct(t.toAccount||(t.account==='cash'?'bank':'cash'),a);break;
    }
  });
  const netAll=incomeAll-expenseAll;
  const totalCash=cash+bank;
  const totalAssets=totalCash+fixedAssets;
  const equity=capital+netAll-drawings;
  return {cash,bank,totalCash,fixedAssets,liabilities,capital,drawings,incomeAll,expenseAll,netAll,
    incomePeriod,expensePeriod,netPeriod:incomePeriod-expensePeriod,totalAssets,equity,
    byUnitIncome,byUnitExpense,byExpCat,byIncUnitP,byExpCatP,balanceOk:Math.abs(totalAssets-(liabilities+equity))<0.01};
}
function renderAccounting(){
  if(accSyncPayments())save();
  const A=acc();const tab=A.tab||'overview';
  const tabs=[['overview','نظرة عامة','layout-dashboard'],['journal','دفتر اليومية','book-open'],['assets','الأصول الثابتة','package'],['statements','القوائم المالية','file-bar-chart'],['setup','الوحدات والإعداد','settings']];
  document.getElementById('main').innerHTML=`
    <style>
      .acc-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 18px}
      .acc-tab{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--muted);font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit}
      .acc-tab svg{width:16px;height:16px}.acc-tab.on{background:rgba(16,185,129,.14);border-color:rgba(16,185,129,.45);color:#6ee7b7}
      .acc-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:12px;font-size:11.5px;font-weight:700}
    </style>
    <div class="page-head"><h1><i data-lucide="calculator"></i> المحاسبة</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="accPasteModal()"><i data-lucide="clipboard-paste"></i> استيراد بلصق</button>
        <button class="btn btn-gold btn-sm" onclick="accTxModal()"><i data-lucide="plus"></i> قيد جديد</button>
      </div></div>
    <div class="acc-tabs">${tabs.map(t=>`<button class="acc-tab${tab===t[0]?' on':''}" onclick="accGo('${t[0]}')"><i data-lucide="${t[2]}"></i>${t[1]}</button>`).join('')}</div>
    <div id="accBody"></div>`;
  document.getElementById('accBody').innerHTML=
    tab==='overview'?accOverviewHTML():
    tab==='journal'?accJournalHTML():
    tab==='assets'?accAssetsHTML():
    tab==='statements'?accStatementsHTML():
    accSetupHTML();
  applyWallpaper();refreshIcons();
}
function accGo(t){acc().tab=t;save();renderAccounting();}
function accOverviewHTML(){
  const c=accCompute();const ym=today().slice(0,7);
  const c2=accCompute(ym+'-01',ym+'-31');
  const stat=(v,l,ic,col)=>`<div class="stat"><span class="ic" style="color:${col||'var(--gold)'}"><i data-lucide="${ic}"></i></span><div class="v">${accMoney(v)}</div><div class="l">${l}</div></div>`;
  const units=acc().units;
  return `
    <div class="stats" style="margin-bottom:16px">
      ${stat(c.totalCash,'النقد + البنك','wallet','#22c55e')}
      ${stat(c.fixedAssets,'الأصول الثابتة','package','#0ea5e9')}
      ${stat(c.liabilities,'الالتزامات (قروض/أقساط)','landmark','#ef4444')}
      ${stat(c.equity,'حقوق الملكية','scale','#8b5cf6')}
    </div>
    ${!c.balanceOk?`<div class="badge-note" style="border-color:#ef444455;color:#fca5a5"><i data-lucide="alert-triangle"></i> <div>الميزانية غير متوازنة (فرق ${accMoney(c.totalAssets-(c.liabilities+c.equity))}) — راجع القيود.</div></div>`:''}
    <div class="grid">
      <div class="card"><h3><i data-lucide="calendar"></i> هذا الشهر (${esc(new Date().toLocaleDateString('ar-EG-u-nu-latn',{month:'long'}))})</h3>
        <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line)"><span style="color:#22c55e">الإيرادات</span><b>${accMoney(c2.incomePeriod)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line)"><span style="color:#ef4444">المصروفات</span><b>${accMoney(c2.expensePeriod)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:11px 0;font-weight:900;font-size:16px"><span>صافي الربح</span><b style="color:${c2.netPeriod>=0?'#22c55e':'#ef4444'}">${accMoney(c2.netPeriod)}</b></div>
      </div>
      <div class="card"><h3><i data-lucide="briefcase"></i> الربحية حسب الوحدة (تراكمي)</h3>
        ${units.map(u=>{const inc=c.byUnitIncome[u.id]||0,exp=c.byUnitExpense[u.id]||0;const net=inc-exp;if(!inc&&!exp)return '';return `<div style="margin:9px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:50%;background:${u.color}"></span>${esc(u.name)}</span><b style="color:${net>=0?'#22c55e':'#ef4444'}">${accMoney(net)}</b></div><div style="font-size:11px;color:var(--muted)">إيراد ${accMoney(inc)} · مصروف ${accMoney(exp)}</div></div>`}).join('')||'<p style="color:var(--muted)">لا حركات بعد.</p>'}
      </div>
      <div class="card"><h3><i data-lucide="pie-chart"></i> المصروفات حسب النوع (تراكمي)</h3>
        ${(function(){const e=Object.entries(c.byExpCat).sort((a,b)=>b[1]-a[1]);const mx=Math.max(1,...e.map(x=>x[1]));return e.length?e.map(([k,v])=>`<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px"><span>${esc(k)}</span><b>${accMoney(v)}</b></div><div style="height:8px;background:var(--panel3);border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(v/mx*100)}%;background:linear-gradient(90deg,#ef4444,#f59e0b)"></i></div></div>`).join(''):'<p style="color:var(--muted)">لا مصروفات بعد.</p>'})()}
      </div>
      <div class="card"><h3><i data-lucide="history"></i> آخر القيود</h3>
        ${acc().tx.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6).map(t=>{const k=ACC_KINDS[t.kind]||{};return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)"><span style="min-width:0"><span class="acc-chip" style="background:${k.color}22;color:${k.color}"><i data-lucide="${k.icon}" style="width:12px;height:12px"></i>${k.label}</span> <span style="color:var(--muted);font-size:12px">${esc(t.desc||accUnit(t.unit).name)}</span></span><b style="white-space:nowrap;color:${k.sign>0?'#22c55e':k.sign<0?'#ef4444':'var(--ink)'}">${k.sign<0?'−':k.sign>0?'+':''}${accMoney(t.amount)}</b></div>`}).join('')||'<p style="color:var(--muted)">لا قيود بعد — أضف أول قيد.</p>'}
      </div>
    </div>`;
}
function accJournalHTML(){
  const A=acc();const tx=A.tx.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if(!tx.length)return emptyBox('book-open','لا قيود بعد. دفعات الفواتير تُسجَّل هنا تلقائياً، وغيرها بزر «قيد جديد».');
  return `<table><thead><tr><th>التاريخ</th><th>النوع</th><th>البيان</th><th>الوحدة</th><th>الحساب</th><th>المبلغ</th><th></th></tr></thead><tbody>
    ${tx.map(t=>{const k=ACC_KINDS[t.kind]||{};return `<tr>
      <td dir="ltr" style="white-space:nowrap">${esc(t.date)}</td>
      <td><span class="acc-chip" style="background:${k.color}22;color:${k.color}"><i data-lucide="${k.icon}" style="width:12px;height:12px"></i>${k.label}</span></td>
      <td>${esc(t.desc||'')}${t.payId?` <span class="acc-chip" style="background:rgba(148,163,184,.15);color:var(--muted)" title="يتبع دفعة الفاتورة">تلقائي</span>`:''}${t.category?`<div style="font-size:11px;color:var(--muted)">${esc(t.category)}</div>`:''}</td>
      <td style="font-size:12px"><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:${accUnit(t.unit).color}"></span>${esc(accUnit(t.unit).name)}</span></td>
      <td style="font-size:12px">${esc(ACC_ACCOUNTS[t.account]||t.account||'—')}</td>
      <td style="white-space:nowrap;font-weight:800;color:${k.sign>0?'#22c55e':k.sign<0?'#ef4444':'var(--ink)'}">${k.sign<0?'−':k.sign>0?'+':''}${accMoney(t.amount)}${t.origCur==='USD'?`<div style="font-size:10.5px;color:var(--muted);font-weight:600" dir="ltr">$${t.origAmount} × ${t.rate||''}</div>`:''}</td>
      <td style="white-space:nowrap"><button class="link-btn" onclick="accTxModal('${t.id}')">تعديل</button>${t.payId&&S.invoices.some(i=>i.id===t.invoiceId)?`<button class="link-btn" onclick="openDoc('invoice','${t.invoiceId}')">الفاتورة</button>`:`<button class="link-btn del" onclick="accTxDel('${t.id}')">حذف</button>`}</td>
    </tr>`}).join('')}
  </tbody></table>`;
}
function accAssetsHTML(){
  const A=acc();const tot=A.assets.reduce((a,x)=>a+Number(x.cost||0),0);
  return `<div class="page-head"><h2 style="margin:0;font-size:19px"><i data-lucide="package"></i> الأصول الثابتة — إجمالي التكلفة ${accMoney(tot)}</h2>
      <button class="btn btn-gold btn-sm" onclick="accAssetModal()"><i data-lucide="plus"></i> أصل جديد</button></div>
    <div class="badge-note" style="margin-bottom:14px"><i data-lucide="info"></i> <div>سجّل هنا معدّاتك وأجهزتك (كاميرات، صوت، لابتوب…). كل أصل يُنشئ قيد «شراء أصل ثابت» تلقائياً فيظهر في الميزانية ويقلّل النقد.</div></div>
    ${!A.assets.length?emptyBox('package','لا أصول بعد. أضف معدّاتك وأجهزتك.'):
    `<table><thead><tr><th>الأصل</th><th>الفئة</th><th>الوحدة</th><th>تاريخ الشراء</th><th>التكلفة</th><th></th></tr></thead><tbody>
    ${A.assets.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<tr>
      <td><b>${esc(x.name)}</b>${x.note?`<div style="font-size:11px;color:var(--muted)">${esc(x.note)}</div>`:''}</td>
      <td>${esc(x.category||'—')}</td>
      <td style="font-size:12px"><span style="display:inline-flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:${accUnit(x.unit).color}"></span>${esc(accUnit(x.unit).name)}</span></td>
      <td dir="ltr">${esc(x.date||'—')}</td>
      <td style="font-weight:800">${accMoney(x.cost)}</td>
      <td style="white-space:nowrap"><button class="link-btn" onclick="accAssetModal('${x.id}')">تعديل</button><button class="link-btn del" onclick="accAssetDel('${x.id}')">حذف</button></td>
    </tr>`).join('')}
    </tbody></table>`}`;
}
function accStatementsHTML(){
  const c=accCompute();const units=acc().units;
  const row=(l,v,bold,col)=>`<div style="display:flex;justify-content:space-between;padding:${bold?'11px':'7px'} 0;${bold?'border-top:2px solid var(--line);font-weight:900;font-size:15px':'border-bottom:1px solid var(--line)'}"><span>${l}</span><b style="color:${col||'var(--ink)'}">${accMoney(v)}</b></div>`;
  const incUnits=units.map(u=>{const inc=c.byUnitIncome[u.id]||0;return inc?row('— '+esc(u.name),inc):''}).join('');
  const expCats=Object.entries(c.byExpCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>row('— '+esc(k),v)).join('');
  return `<div class="grid">
    <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="trending-up"></i> قائمة الدخل (تراكمي)</h3>
      <div style="font-weight:800;color:#22c55e;margin:6px 0">الإيرادات</div>${incUnits||'<div style="color:var(--muted);font-size:13px">لا إيرادات</div>'}
      ${row('إجمالي الإيرادات',c.incomeAll,false,'#22c55e')}
      <div style="font-weight:800;color:#ef4444;margin:12px 0 6px">المصروفات التشغيلية</div>${expCats||'<div style="color:var(--muted);font-size:13px">لا مصروفات</div>'}
      ${row('إجمالي المصروفات',c.expenseAll,false,'#ef4444')}
      ${row('صافي الربح / الخسارة',c.netAll,true,c.netAll>=0?'#22c55e':'#ef4444')}
    </div>
    <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="scale"></i> الميزانية العمومية</h3>
      <div style="font-weight:800;margin:6px 0">الأصول</div>
      ${row('النقد (كاش)',c.cash)}${row('حساب البنك',c.bank)}${row('الأصول الثابتة (بالتكلفة)',c.fixedAssets)}
      ${row('إجمالي الأصول',c.totalAssets,false,'#0ea5e9')}
      <div style="font-weight:800;margin:12px 0 6px">الالتزامات وحقوق الملكية</div>
      ${row('الالتزامات (قروض/أقساط)',c.liabilities,false,'#ef4444')}
      ${row('رأس المال المُودَع',c.capital)}
      ${row('الأرباح المحتجزة',c.netAll)}
      ${row('مسحوبات المالك',-c.drawings,false,'#f59e0b')}
      ${row('إجمالي حقوق الملكية',c.equity,false,'#8b5cf6')}
      ${row('الالتزامات + حقوق الملكية',c.liabilities+c.equity,true,'#0ea5e9')}
      <div style="margin-top:10px;font-size:12px;color:${c.balanceOk?'#22c55e':'#ef4444'}"><i class="inl" data-lucide="${c.balanceOk?'check-circle':'alert-triangle'}"></i> ${c.balanceOk?'الميزانية متوازنة ✓':'غير متوازنة — راجع القيود'}</div>
    </div>
    <div class="card" style="grid-column:span 4;min-width:300px"><h3><i data-lucide="list-checks"></i> ميزان المراجعة المبسّط</h3>
      <table><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>
        <tr><td>النقد + البنك</td><td>${accMoney(Math.max(0,c.totalCash))}</td><td>${c.totalCash<0?accMoney(-c.totalCash):'—'}</td></tr>
        <tr><td>الأصول الثابتة</td><td>${accMoney(c.fixedAssets)}</td><td>—</td></tr>
        <tr><td>الالتزامات</td><td>—</td><td>${accMoney(c.liabilities)}</td></tr>
        <tr><td>رأس المال</td><td>—</td><td>${accMoney(c.capital)}</td></tr>
        <tr><td>المسحوبات</td><td>${accMoney(c.drawings)}</td><td>—</td></tr>
        <tr><td>الإيرادات</td><td>—</td><td>${accMoney(c.incomeAll)}</td></tr>
        <tr><td>المصروفات</td><td>${accMoney(c.expenseAll)}</td><td>—</td></tr>
        <tr style="font-weight:900;background:rgba(16,185,129,.08)"><td>الإجمالي</td><td>${accMoney(c.fixedAssets+Math.max(0,c.totalCash)+c.drawings+c.expenseAll)}</td><td>${accMoney(c.liabilities+c.capital+c.incomeAll+(c.totalCash<0?-c.totalCash:0))}</td></tr>
      </tbody></table>
    </div>
  </div>`;
}
function accSetupHTML(){
  const A=acc();
  return `<div class="grid">
    <div class="card" style="grid-column:span 2"><h3><i data-lucide="coins"></i> سعر صرف الدولار</h3>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:10px">يُستخدم لتحويل المصاريف/الاشتراكات بالدولار (كلود، Adobe، Replit…) إلى ريال تلقائياً.</div>
      <div style="display:flex;align-items:center;gap:10px"><span>١ دولار =</span><input type="number" step="0.01" value="${Number(A.usdRate||USD_RATE||3.75)}" oninput="acc().usdRate=Number(this.value)||3.75;save()" style="width:110px"><span>ريال ﷼</span></div>
    </div>
    <div class="card" style="grid-column:span 2"><h3><i data-lucide="briefcase"></i> وحدات العمل (المشاريع)</h3>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:10px">صنّف كل قيد ضمن وحدة لتعرف ربحية كل نشاط على حدة.</div>
      ${A.units.map(u=>`<div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--line)">
        <input type="color" value="${esc(u.color)}" oninput="accUnitEdit('${u.id}','color',this.value)" style="width:34px;height:32px;padding:2px;border-radius:8px">
        <input value="${esc(u.name)}" oninput="accUnitEdit('${u.id}','name',this.value)" style="flex:1">
        <button class="link-btn del" onclick="accUnitDel('${u.id}')">حذف</button></div>`).join('')}
      <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="accUnitAdd()"><i data-lucide="plus"></i> وحدة جديدة</button>
    </div>
    <div class="card" style="grid-column:span 2"><h3><i data-lucide="book-open-check"></i> كيف يعمل النظام</h3>
      <div style="font-size:13px;line-height:1.9;color:var(--muted)">
        <p><b style="color:var(--ink)">١) رأس المال:</b> عند إيداع مبلغ لبدء المؤسسة سجّله قيد «رأس مال / إيداع».</p>
        <p><b style="color:var(--ink)">٢) الأصول الثابتة:</b> معدّاتك (كاميرا، صوت، لابتوب) في تبويب «الأصول» — تظهر بالميزانية وتخصم من النقد.</p>
        <p><b style="color:var(--ink)">٣) الإيرادات:</b> استورد مدفوعات الفواتير تلقائياً، أو سجّلها يدوياً.</p>
        <p><b style="color:var(--ink)">٤) المصروفات:</b> اشتراكات، إيجار، رسوم — صنّفها حسب الوحدة والنوع.</p>
        <p><b style="color:var(--ink)">٥) المسحوبات الشخصية:</b> ما تسحبه لحسابك الشخصي سجّله «مسحوبات» — يقلّل حقوق الملكية لا الأرباح.</p>
        <p style="color:#22c55e"><i class="inl" data-lucide="check-circle"></i> النظام يوازن الميزانية تلقائياً: الأصول = الالتزامات + حقوق الملكية.</p>
      </div>
    </div>
  </div>`;
}
function accUnitAdd(){acc().units.push({id:'u_'+uid(),name:'وحدة جديدة',color:'#64748b'});save();renderAccounting();}
function accUnitEdit(id,f,v){const u=acc().units.find(x=>x.id===id);if(u){u[f]=v;save();}}
function accUnitDel(id){if(acc().units.length<=1)return;if(!confirm('حذف الوحدة؟ القيود المرتبطة تبقى وتُنسب إلى «عام».'))return;acc().units=acc().units.filter(x=>x.id!==id);acc().tx.forEach(t=>{if(t.unit===id)t.unit='general'});save();renderAccounting();}
function accTxModal(id){
  const A=acc();let t=id?{...A.tx.find(x=>x.id===id)}:{id:'',date:today(),kind:'expense',category:'اشتراكات',amount:0,unit:'general',account:'bank',toAccount:'cash',desc:''};
  const kinds=Object.entries(ACC_KINDS).filter(([k])=>k!=='asset'); // الأصول تُضاف من تبويبها
  const rate=Number((S.accounting&&S.accounting.usdRate)||USD_RATE||3.75);
  const inUsd=t.origCur==='USD';const shownAmt=inUsd?(t.origAmount||''):(t.amount||'');const auto=!!t.payId;
  openModal(id?'تعديل قيد':'قيد جديد',`${auto?`<div class="badge-note" style="margin-bottom:14px"><i data-lucide="link"></i><div>قيد تلقائيّ من دفعة فاتورة — المبلغ والتاريخ والحساب تتبع الدفعة (عدّلها من الفاتورة). هنا تغيّر الوحدة والبيان فقط.</div></div>`:''}
    <div class="row2"><div class="field"><label>النوع</label><select id="ax_kind" onchange="accTxKindToggle()">${kinds.map(([k,v])=>`<option value="${k}" ${t.kind===k?'selected':''}>${v.label}</option>`).join('')}</select></div>
      <div class="field"><label>المبلغ</label>
        <div style="display:flex;gap:6px"><input id="ax_amt" type="number" inputmode="decimal" min="0" value="${shownAmt}" onfocus="this.select()" oninput="accAmtConv()" style="flex:1">
          <select id="ax_cur" onchange="accAmtConv()" style="width:auto"><option value="SAR" ${!inUsd?'selected':''}>ريال ﷼</option><option value="USD" ${inUsd?'selected':''}>دولار $</option></select></div>
        <div id="ax_conv" style="font-size:12px;color:var(--muted);margin-top:4px"></div>
      </div></div>
    <div class="row2"><div class="field"><label>التاريخ</label><input id="ax_date" type="date" value="${esc(t.date)}"></div>
      <div class="field"><label>الوحدة (المشروع)</label><select id="ax_unit">${A.units.map(u=>`<option value="${u.id}" ${t.unit===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
    <div class="row2"><div class="field" id="ax_catwrap"><label>فئة المصروف</label><select id="ax_cat">${ACC_EXP_CATS.map(x=>`<option ${t.category===x?'selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>الحساب</label><select id="ax_acct">${Object.entries(ACC_ACCOUNTS).map(([k,v])=>`<option value="${k}" ${t.account===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
    <div class="field" id="ax_towrap" style="display:none"><label>إلى الحساب</label><select id="ax_to">${Object.entries(ACC_ACCOUNTS).map(([k,v])=>`<option value="${k}" ${t.toAccount===k?'selected':''}>${v}</option>`).join('')}</select></div>
    <div class="field"><label>البيان / الوصف</label><input id="ax_desc" value="${esc(t.desc||'')}" placeholder="مثال: اشتراك Adobe الشهري"></div>`,
    ()=>{const g=i=>document.getElementById(i);const kind=g('ax_kind').value;const raw=Number(g('ax_amt').value||0);if(raw<=0){alert('أدخل مبلغاً صحيحاً');return}
      const cur=g('ax_cur').value;const r=Number((S.accounting&&S.accounting.usdRate)||USD_RATE||3.75);const amt=cur==='USD'?Number((raw*r).toFixed(2)):raw;
      if(auto){t.unit=g('ax_unit').value;t.desc=g('ax_desc').value;const i=A.tx.findIndex(x=>x.id===id);A.tx[i]=t;save();closeModal();renderAccounting();return}
      t.kind=kind;t.amount=amt;t.date=g('ax_date').value;t.unit=g('ax_unit').value;t.account=g('ax_acct').value;t.desc=g('ax_desc').value;
      if(cur==='USD'){t.origCur='USD';t.origAmount=raw;t.rate=r;}else{delete t.origCur;delete t.origAmount;delete t.rate;}
      t.category=(kind==='expense')?g('ax_cat').value:'';if(kind==='transfer')t.toAccount=g('ax_to').value;
      if(id){const i=A.tx.findIndex(x=>x.id===id);A.tx[i]=t}else{t.id='tx_'+uid();A.tx.push(t)}save();closeModal();renderAccounting();},
    id&&!auto?()=>{accTxDel(id);}:null);
  setTimeout(()=>{accTxKindToggle();accAmtConv();if(auto)['ax_kind','ax_amt','ax_cur','ax_date','ax_acct'].forEach(i=>{const el=document.getElementById(i);if(el)el.disabled=true});},0);
}
function accAmtConv(){const a=document.getElementById('ax_amt'),c=document.getElementById('ax_cur'),o=document.getElementById('ax_conv');if(!a||!c||!o)return;const v=Number(a.value||0);const r=Number((S.accounting&&S.accounting.usdRate)||USD_RATE||3.75);
  if(c.value==='USD')o.innerHTML=v>0?`= <b style="color:var(--gold2)">${money(v*r)}</b> <span style="opacity:.7">(بسعر ${r})</span>`:`سيُحفظ بالريال بسعر صرف ${r}`;
  else o.textContent='';}
function accTxKindToggle(){const k=document.getElementById('ax_kind');if(!k)return;const v=k.value;const cat=document.getElementById('ax_catwrap'),to=document.getElementById('ax_towrap');if(cat)cat.style.display=(v==='expense')?'':'none';if(to)to.style.display=(v==='transfer')?'':'none';}
function accTxDel(id){if(!confirm('حذف القيد؟'))return;acc().tx=acc().tx.filter(x=>x.id!==id);closeModal&&document.getElementById('modalRoot')&&(document.getElementById('modalRoot').innerHTML='');save();renderAccounting();}
function accAssetModal(id){
  const A=acc();let x=id?{...A.assets.find(a=>a.id===id)}:{id:'',name:'',category:'معدات تصوير',cost:0,date:today(),unit:'prod',note:'',account:'bank'};
  const cats=['معدات تصوير','معدات صوت','إضاءة','أجهزة/لابتوب','برمجيات','أثاث استوديو','أخرى'];
  openModal(id?'تعديل أصل':'أصل ثابت جديد',`
    <div class="field"><label>اسم الأصل</label><input id="as_name" value="${esc(x.name)}" placeholder="مثال: كاميرا Sony FX3"></div>
    <div class="row2"><div class="field"><label>الفئة</label><select id="as_cat">${cats.map(c=>`<option ${x.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="field"><label>التكلفة (${esc(S.settings.currency)})</label><input id="as_cost" type="number" inputmode="decimal" min="0" value="${x.cost||''}" onfocus="this.select()"></div></div>
    <div class="row2"><div class="field"><label>تاريخ الشراء</label><input id="as_date" type="date" value="${esc(x.date)}"></div>
      <div class="field"><label>الوحدة</label><select id="as_unit">${A.units.map(u=>`<option value="${u.id}" ${x.unit===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
    ${id?'':`<div class="field"><label>خُصم من حساب</label><select id="as_acct"><option value="bank">حساب المؤسسة البنكي</option><option value="cash">نقد (كاش)</option></select><div style="font-size:11px;color:var(--muted);margin-top:4px">يُنشئ قيد «شراء أصل» يخصم التكلفة من هذا الحساب. اتركه إن كان الأصل موجوداً مسبقاً بلا تأثير نقدي — عندها اختر «بلا تأثير».</div><select id="as_effect" style="margin-top:6px"><option value="1">خصم التكلفة من النقد</option><option value="0">تسجيل فقط (بلا تأثير نقدي — أصل قائم)</option></select></div>`}
    <div class="field"><label>ملاحظة</label><input id="as_note" value="${esc(x.note||'')}" placeholder="رقم تسلسلي، ملحقات…"></div>`,
    ()=>{const g=i=>document.getElementById(i);const name=g('as_name').value.trim();const cost=Number(g('as_cost').value||0);if(!name){alert('أدخل اسم الأصل');return}
      x.name=name;x.category=g('as_cat').value;x.cost=cost;x.date=g('as_date').value;x.unit=g('as_unit').value;x.note=g('as_note').value;
      if(id){const i=A.assets.findIndex(a=>a.id===id);A.assets[i]=x;
        // حدّث قيد الأصل المرتبط إن وُجد
        if(x.txId){const tt=A.tx.find(t=>t.id===x.txId);if(tt){tt.amount=cost;tt.date=x.date;tt.unit=x.unit;tt.desc='شراء أصل: '+name;}}
      }else{x.id='as_'+uid();
        const effect=g('as_effect')?g('as_effect').value:'1';
        if(effect==='1'&&cost>0){const tx={id:'tx_'+uid(),date:x.date,kind:'asset',amount:cost,unit:x.unit,account:(g('as_acct')?g('as_acct').value:'bank'),desc:'شراء أصل: '+name,assetId:x.id};A.tx.push(tx);x.txId=tx.id;}
        A.assets.push(x);
      }
      save();closeModal();renderAccounting();},
    id?()=>{accAssetDel(id);}:null);
}
function accAssetDel(id){if(!confirm('حذف الأصل؟ سيُحذف قيده المرتبط أيضاً.'))return;const A=acc();const x=A.assets.find(a=>a.id===id);if(x&&x.txId)A.tx=A.tx.filter(t=>t.id!==x.txId);A.assets=A.assets.filter(a=>a.id!==id);const mr=document.getElementById('modalRoot');if(mr)mr.innerHTML='';save();renderAccounting();}
/* ═══════════════ قيود تلقائيّة من دفعات الفواتير ═══════════════
   كلّ دفعة على فاتورة = قيد إيراد واحد مربوط بها (payId): تسجيل الدفعة ينشئ قيدها،
   وحذفها أو حذف فاتورتها يحذفه، وتعديلها يحدّثه. لا زرّ استيراد ولا عدٌّ مزدوج.
   الحساب من طريقة الدفع (نقداً ← الصندوق، وغيرها ← البنك)، والوحدة من تصميم الفاتورة،
   ويبقى للمستخدم تغيير الوحدة والبيان من دفتر اليومية.
   القيود القديمة التي استوردها الزرّ السابق تُتبنّى (تُربط بدفعتها) فلا تتكرّر. */
const ACC_BRAND_UNIT={ibrahim:'prod',minwal:'minwal',huroof:'huroof'};
function accPayAccount(method){return /نقد|كاش|cash/i.test(method||'')?'cash':'bank'}
function accSyncPayments(){
  const A=acc();let changed=false;const live=new Set();
  const legacy=A.tx.filter(t=>t.invoiceId&&!t.payId);
  (S.invoices||[]).forEach(inv=>{(inv.payments||[]).forEach(p=>{
    if(!p.id){p.id=uid();changed=true}
    live.add(p.id);
    let t=A.tx.find(x=>x.payId===p.id);
    if(!t){const i=legacy.findIndex(x=>x.invoiceId===inv.id);if(i>=0){t=legacy.splice(i,1)[0];t.payId=p.id;changed=true}}
    const want={kind:'income',date:p.date||inv.date,amount:r2(p.amount),account:accPayAccount(p.method)};
    if(!t){A.tx.push({id:'tx_'+uid(),unit:acc().units.some(u=>u.id===ACC_BRAND_UNIT[inv.brandId])?ACC_BRAND_UNIT[inv.brandId]:'general',
      desc:'تحصيل '+docNo('invoice',inv)+' — '+resolveClientName(inv),invoiceId:inv.id,payId:p.id,...want});changed=true;return}
    for(const k in want)if(t[k]!==want[k]){t[k]=want[k];changed=true}
  })});
  const n=A.tx.length;A.tx=A.tx.filter(t=>!t.payId||live.has(t.payId));if(A.tx.length!==n)changed=true;
  return changed;
}
/* ===== استيراد قيود بلصق كشف حساب (كلود، Adobe، استضافة…) ===== */
function accParseDate(s){s=String(s).trim();const d=new Date(s);if(!isNaN(d)&&/[0-9]{4}|,/.test(s)&&/[A-Za-z؀-ۿ]/.test(s.replace(/[0-9,\s\/.-]/g,'')+s))return d;
  // صيغ رقمية: 2026-08-22 / 22/08/2026
  const m=s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);if(m)return new Date(+m[1],+m[2]-1,+m[3]);
  const m2=s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);if(m2)return new Date(+m2[3],+m2[2]-1,+m2[1]);
  return isNaN(d)?null:d;}
function accIsoLocal(d){return d.getFullYear()+'-'+_pad2(d.getMonth()+1)+'-'+_pad2(d.getDate());}
function accParsePaste(text){
  const tokens=String(text).split(/[\n\t]|\s{2,}/).map(t=>t.trim()).filter(Boolean);
  const dates=[],amounts=[],statuses=[];
  const skipHdr=/^(date|total|amount|status|actions|invoice|التاريخ|المبلغ|الإجمالي|الحالة|الإجراءات|عرض|view|download|receipt|إيصال|فاتورة)$/i;
  tokens.forEach(t=>{
    if(skipHdr.test(t))return;
    const clean=t.replace(/[\sً-ْ]/g,'');
    const isMoney=/^[$€£¥﷼ر.س]*-?[0-9][0-9,]*\.?[0-9]*[$€£¥﷼ر.س]*$/.test(clean)&&/[0-9]/.test(clean);
    const st=t.match(/paid|refunded|failed|pending|declined|مدفوع|مسترد|فشل|قيد|ملغى|ناجح/i);
    if(isMoney){const n=parseFloat(clean.replace(/[^0-9.]/g,''));if(!isNaN(n))amounts.push(n);return;}
    if(st){statuses.push(st[0].toLowerCase());return;}
    const d=accParseDate(t);if(d)dates.push(accIsoLocal(d));
  });
  const n=Math.min(dates.length,amounts.length);const rows=[];
  for(let i=0;i<n;i++){const stt=(statuses[i]||'paid');const amt=amounts[i];const skip=/refund|fail|decline|مسترد|فشل|ملغى/i.test(stt)||!(amt>0);rows.push({date:dates[i],amount:amt,status:!(amt>0)?'صفري':stt,skip});}
  return rows;
}
function accPasteModal(){
  const A=acc();
  openModal('استيراد قيود بلصق كشف حساب',`
    <div class="badge-note"><i data-lucide="clipboard-paste"></i> <div>الصق كشف مدفوعات (من كلود، Adobe، الاستضافة، البنك…). يستخرج التاريخ والمبلغ والحالة تلقائياً، ويتجاهل المستردّ/الفاشل.</div></div>
    <div class="field"><label>الصق الكشف هنا</label><textarea id="ap_text" rows="6" placeholder="Aug 22, 2026	$115	Paid&#10;Jul 22, 2026	$115	Paid" oninput="accPastePreview()"></textarea></div>
    <div class="row2">
      <div class="field"><label>النوع</label><select id="ap_kind"><option value="expense" selected>مصروف</option><option value="income">إيراد</option></select></div>
      <div class="field"><label>الوحدة</label><select id="ap_unit">${A.units.map(u=>`<option value="${u.id}" ${u.id==='general'?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div>
    </div>
    <div class="row2">
      <div class="field"><label>الفئة</label><select id="ap_cat">${ACC_EXP_CATS.map(x=>`<option ${x==='اشتراكات'?'selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>الوصف/المصدر</label><input id="ap_desc" value="اشتراك Claude" placeholder="مثال: اشتراك Claude"></div>
    </div>
    <div class="row2">
      <div class="field"><label>العملة</label><select id="ap_cur" onchange="accPastePreview()"><option value="USD" selected>دولار $ (يُحوَّل لريال)</option><option value="SAR">ريال ﷼ (كما هو)</option></select></div>
      <div class="field"><label>سعر صرف الدولar</label><input id="ap_rate" type="number" step="0.01" value="3.75" oninput="accPastePreview()"></div>
    </div>
    <div id="ap_preview" style="margin-top:6px"></div>`,
    ()=>{accPasteConfirm();});
  setTimeout(accPastePreview,0);
}
function accPastePreview(){
  const el=document.getElementById('ap_preview');if(!el)return;
  const rows=accParsePaste((document.getElementById('ap_text')||{}).value||'');
  const cur=(document.getElementById('ap_cur')||{}).value||'USD';const rate=Number((document.getElementById('ap_rate')||{}).value||3.75);
  const conv=v=>cur==='USD'?v*rate:v;
  const use=rows.filter(r=>!r.skip);const tot=use.reduce((a,r)=>a+conv(r.amount),0);
  if(!rows.length){el.innerHTML='<div style="color:var(--muted);font-size:13px">…الصق كشفاً لعرض المعاينة</div>';return;}
  el.innerHTML=`<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden">
    <div style="background:rgba(16,185,129,.1);padding:9px 12px;font-weight:800;font-size:13px;display:flex;justify-content:space-between"><span>${use.length} قيد صالح${rows.length-use.length?` · ${rows.length-use.length} متجاهَل (مستردّ/فاشل)`:''}</span><span>الإجمالي ${money(tot)}</span></div>
    <div style="max-height:180px;overflow:auto">${rows.map(r=>`<div style="display:flex;justify-content:space-between;padding:6px 12px;border-top:1px solid var(--line);font-size:12.5px;${r.skip?'opacity:.45;text-decoration:line-through':''}"><span dir="ltr">${esc(r.date)}</span><span>${esc(r.status)}</span><span dir="ltr" style="font-weight:700">${money(conv(r.amount))}</span></div>`).join('')}</div>
  </div>`;
}
function accPasteConfirm(){
  const A=acc();const g=i=>document.getElementById(i);
  const rows=accParsePaste(g('ap_text').value||'').filter(r=>!r.skip);
  if(!rows.length){alert('لا توجد قيود صالحة في النص.');return;}
  const kind=g('ap_kind').value,unit=g('ap_unit').value,cat=g('ap_cat').value,desc=g('ap_desc').value.trim()||'قيد مستورد';
  const cur=g('ap_cur').value,rate=Number(g('ap_rate').value||3.75);const conv=v=>cur==='USD'?v*rate:v;
  rows.forEach(r=>{A.tx.push({id:'tx_'+uid(),date:r.date,kind,amount:Number(conv(r.amount).toFixed(2)),unit,account:'bank',category:kind==='expense'?cat:'',desc:desc+(cur==='USD'?` ($${r.amount})`:'')});});
  save();closeModal();renderAccounting();
  alert('أُضيف '+rows.length+' قيد ✓');
}

/* ===== SEND (WhatsApp / Email / Copy) ===== */
function _docFind(type,id){return (type==='invoice'?S.invoices:type==='credit'?S.credits:S.sales).find(x=>x.id===id)}
function docText(type,id){const isInv=type==='invoice';const d=_docFind(type,id);if(!d)return'';const s=S.settings;const lines=(d.items||[]).map(it=>`• ${it.desc} ×${it.qty} = ${money(lineTotal(it))}`).join('\n');const title=isInv?(d.vat?'فاتورة ضريبية':'فاتورة'):'عرض سعر';const notes=d.notes?(isInv?d.notes:resolveQuoteNotes(d,d.notes)):'';return `${title} ${isInv&&taxDraft(d)?'(مسودّة)':docNo(type,d)} — ${s.brand}\nالعميل: ${resolveClientName(d)}\nالتاريخ: ${d.date}\n${lines}\n${d.vat?'الإجمالي شامل الضريبة':'الإجمالي'}: ${money(invTotal(d))}${isInv&&invDue(d)>0?`\nالمتبقي: ${money(invDue(d))}`:''}\n\n${notes||(isInv?(s.terms||''):'بانتظار موافقتكم على العرض، وشاكرين لكم.')}`;}
function sendWhatsApp(type,id){const d=_docFind(type,id);const ct=S.contacts.find(c=>c.id===(d&&d.contactId));const phone=((ct&&ct.phone)||'').replace(/[^0-9]/g,'');window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(docText(type,id)),'_blank');}
function sendEmail(type,id){const d=_docFind(type,id);const ct=S.contacts.find(c=>c.id===(d&&d.contactId));const subj=encodeURIComponent((type==='invoice'?'فاتورة':'عرض سعر')+' من '+S.settings.brand);window.location.href='mailto:'+((ct&&ct.email)||'')+'?subject='+subj+'&body='+encodeURIComponent(docText(type,id));}
function copyDocText(type,id){const t=docText(type,id);if(navigator.clipboard){navigator.clipboard.writeText(t).then(()=>alert('تم نسخ نص المستند — الصقه أينما تريد'),()=>alert(t))}else alert(t);}

/* ===== CREDIT NOTES (إشعارات دائنة / مرتجعات) ===== */
function creditFromInvoice(invId){const inv=S.invoices.find(x=>x.id===invId);if(!inv)return;const reason=prompt('سبب إشعار الدائن / المرتجع:','مرتجع كامل للفاتورة');if(reason===null)return;
  if(invCredits(inv)>0){alert('على هذه الفاتورة إشعارٌ دائن سابق.');return}
  const cn={id:uid(),number:++S.counters.credit,invoiceId:invId,invNumber:inv.number,invNo:docNo('invoice',inv),client:inv.client,contactId:inv.contactId||'',clientVat:inv.clientVat||'',date:today(),items:JSON.parse(JSON.stringify(inv.items)),discType:inv.discType||'none',discVal:Number(inv.discVal||0),notes:reason,vat:inv.vat,vatRate:inv.vatRate,brandId:inv.brandId};
  if(inv.issued)cn.issued={no:cn.number,at:new Date().toISOString()};
  if(!S.credits)S.credits=[];S.credits.push(cn);syncInvStatus(inv);save();openCredit(cn.id);}
function openCredit(id){const cn=(S.credits||[]).find(x=>x.id===id);if(!cn){go('invoicing');return}const s=S.settings;const ct=S.contacts.find(c=>c.id===cn.contactId)||{};const total=invTotal(cn);
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><button class="link-btn" onclick="go('invoicing')">← الفوترة</button> إشعار دائن CN-${String(cn.number).padStart(5,'0')}</h1></div>
    <div class="doc-acts">
      <button class="btn btn-ghost" onclick="printDoc('credit','${id}')"><i data-lucide="printer"></i> طباعة / PDF</button>
      ${cn.issued?'':`<button class="btn btn-ghost" style="color:var(--bad)" onclick="delCredit('${id}')">حذف</button>`}</div>
    <div class="card">
      <div style="margin-bottom:10px;color:var(--muted)">مرتجع للفاتورة رقم <b>${esc(cn.invNo||((s.invPrefix||'INV-')+String(cn.invNumber).padStart(5,'0')))}</b> · العميل: <b>${esc(resolveClientName(cn))}</b>${ct.vat?` · الرقم الضريبي: ${esc(ct.vat)}`:''}</div>
      <table><thead><tr><th>الوصف</th><th>كمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>
      ${(cn.items||[]).map(it=>`<tr><td>${esc(it.desc)}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${money(lineTotal(it))}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals" style="margin-top:14px"><div class="line grand"><span>إجمالي الإشعار الدائن</span><span>${money(total)}</span></div></div>
      ${cn.notes?`<div style="margin-top:12px;color:var(--muted)"><i class="inl" data-lucide="sticky-note"></i> ${esc(cn.notes)}</div>`:''}
    </div>`;
  refreshIcons();
}

/* ===== DOCUMENT FORM (Odoo-style status flow) ===== */
function docStages(type){return type==='invoice'?[{k:'unpaid',l:'غير مدفوعة'},{k:'partial',l:'مدفوعة جزئياً'},{k:'paid',l:'مدفوعة'}]:[{k:'draft',l:'عرض سعر'},{k:'sent',l:'مُرسل'},{k:'sale',l:'أمر بيع'}];}
function setDocStatus(type,id,status){const k=type==='invoice'?'invoices':'sales';const d=S[k].find(x=>x.id===id);if(!d)return;d.status=status;save();openDoc(type,id);}
function openDoc(type,id){
  const isInv=type==='invoice';const k=isInv?'invoices':'sales';const d=S[k].find(x=>x.id===id);if(!d){renderDocs(type);return}
  const s=S.settings;const ct=S.contacts.find(c=>c.id===d.contactId)||{};
  const gross=docGross(d);const lineSub=docLineSubtotal(d);const sub=lineSub;const discTotal=gross-lineSub;const ovr=docOverallDisc(d);const tax=invVat(d);const total=invTotal(d);
  const paid=invPaid(d);const due=invDue(d);
  const stages=docStages(type);const curIdx=stages.findIndex(x=>x.k===d.status);const cancelled=d.status==='cancel';
  const prefix=isInv?(s.invPrefix||'INV-'):(s.salePrefix||'S');
  const bar=cancelled?`<div class="statusbar"><div class="st active" style="background:var(--bad);color:#fff">ملغى</div></div>`:
    `<div class="statusbar">${stages.map((st,i)=>`<div class="st ${i===curIdx?'active':(i<curIdx?'done':'')}">${st.l}</div>`).join('')}</div>`;
  let acts=[];
  if(!isInv){
    if(!cancelled){
      if(d.status==='draft')acts.push(`<button class="btn btn-gold" onclick="setDocStatus('sale','${id}','sent')"><i data-lucide="send"></i> إرسال للعميل</button>`);
      if(d.status==='draft'||d.status==='sent')acts.push(`<button class="btn btn-gold" onclick="setDocStatus('sale','${id}','sale')"><i data-lucide="check-check"></i> تأكيد أمر البيع</button>`);
      if(d.status==='sale'&&!d.invoiceId)acts.push(`<button class="btn btn-gold" onclick="toInvoice('${id}')"><i data-lucide="receipt-text"></i> إنشاء فاتورة</button>`);
    }
  }else{
    if(taxDraft(d))acts.push(`<button class="btn btn-gold" onclick="issueInvoice('${id}')"><i data-lucide="stamp"></i> إصدار الفاتورة</button>`);
    if(due>0)acts.push(`<button class="btn btn-gold" onclick="paymentModal('${id}')"><i data-lucide="wallet"></i> تسجيل دفعة</button>`);
  }
  acts.push(`<button class="btn btn-ghost" onclick="printDoc('${type}','${id}')"><i data-lucide="printer"></i> طباعة / PDF</button>`);
  if(!(isInv&&d.issued))acts.push(`<button class="btn btn-ghost" onclick="docModal('${type}','${id}',null,()=>openDoc('${type}','${id}'))"><i data-lucide="pencil"></i> تعديل</button>`);
  if(!isInv&&d.invoiceId&&S.invoices.some(x=>x.id===d.invoiceId))acts.push(`<button class="btn btn-ghost" onclick="openDoc('invoice','${d.invoiceId}')"><i data-lucide="receipt-text"></i> فتح الفاتورة</button>`);
  acts.push(`<button class="btn btn-ghost" onclick="sendWhatsApp('${type}','${id}')"><i data-lucide="message-circle"></i> واتساب</button>`);
  acts.push(`<button class="btn btn-ghost" onclick="sendEmail('${type}','${id}')"><i data-lucide="mail"></i> إيميل</button>`);
  acts.push(`<button class="btn btn-ghost" onclick="copyDocText('${type}','${id}')"><i data-lucide="copy"></i> نسخ النص</button>`);
  if(isInv&&!taxDraft(d))acts.push(`<button class="btn btn-ghost" onclick="creditFromInvoice('${id}')"><i data-lucide="rotate-ccw"></i> إشعار دائن</button>`);
  if(!isInv&&!cancelled)acts.push(`<button class="btn btn-ghost" style="color:var(--bad)" onclick="setDocStatus('${type}','${id}','cancel')">إلغاء</button>`);
  if(!isInv&&cancelled)acts.push(`<button class="btn btn-ghost" onclick="setDocStatus('${type}','${id}','draft')">↺ إرجاع لعرض سعر</button>`);
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><button class="link-btn" onclick="renderDocs('${type}')">← ${isInv?'الفواتير':'المبيعات'}</button> ${isInv&&taxDraft(d)?'مسودّة فاتورة':esc(docNo(type,d))}</h1></div>
    ${bar}
    ${isInv&&taxDraft(d)?`<div class="badge-note" style="margin-bottom:16px"><i data-lucide="file-pen"></i><div>مسودّة — عدّلها كما تشاء، ثم اضغط <b>«إصدار الفاتورة»</b>. بعد الإصدار تأخذ رقمها وتُقفل (لا تعديل ولا حذف).</div></div>`:''}
    ${isInv&&d.issued?`<div class="badge-note" style="margin-bottom:16px"><i data-lucide="lock"></i><div>فاتورة صادرة ${esc(riyadhStamp(d.issued.at).date)} — مقفلة. للتصحيح: «إشعار دائن».</div></div>`:''}
    <div class="doc-acts">${acts.join('')}</div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:14px">
        <div><div style="color:var(--muted);font-size:13px">${isInv?'فاتورة إلى':'عرض سعر إلى'}</div>
          <div style="font-weight:800;font-size:17px">${d.contactId?`<button class="link-btn" style="font-size:17px;padding:0" onclick="openClient('${d.contactId}')">${esc(resolveClientName(d))}</button>`:esc(resolveClientName(d))}</div>
          ${ct.vat?`<div style="color:var(--muted);font-size:13px">الرقم الضريبي: ${esc(ct.vat)}</div>`:''}</div>
        <div style="text-align:left;font-size:13px;color:var(--muted)">
          <div>التاريخ: ${d.date||'—'}</div>
          ${!isInv&&d.expiry?`<div>صالح حتى: ${esc(d.expiry)}</div>`:''}
          ${d.salesperson?`<div>مندوب المبيعات: ${esc(d.salesperson)}</div>`:''}</div>
      </div>
      <table><thead><tr><th>الوصف</th><th>كمية</th><th>السعر</th><th>خصم</th><th>المجموع</th></tr></thead><tbody>
      ${(d.items||[]).map(it=>`<tr><td><b>${esc(it.desc)}</b>${it.details?`<div style="font-size:12px;color:var(--muted)">${esc(it.details)}</div>`:''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.discount?it.discount+'%':'—'}</td><td>${money(lineTotal(it))}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals" style="margin-top:14px">
        <div class="line"><span>المجموع الفرعي</span><span>${money(sub)}</span></div>
        ${discTotal>0.001?`<div class="line" style="color:var(--good)"><span>خصم البنود</span><span>- ${money(discTotal)}</span></div>`:''}
        ${ovr>0.001?`<div class="line" style="color:var(--good)"><span>خصم إجمالي${d.discType==='percent'?' ('+Number(d.discVal||0)+'%)':''}</span><span>- ${money(ovr)}</span></div>`:''}
        ${d.vat?`<div class="line"><span>ضريبة القيمة المضافة ١٥٪</span><span>${money(tax)}</span></div>`:''}
        <div class="line grand"><span>${d.vat?'الإجمالي شامل الضريبة':'الإجمالي'}</span><span>${money(total)}</span></div>
        ${isInv&&invCredits(d)>0?`<div class="line"><span>إشعارات دائنة</span><span style="color:var(--good)">- ${money(invCredits(d))}</span></div>`:''}
        ${isInv&&paid>0?`<div class="line"><span>المدفوع</span><span style="color:var(--good)">${money(paid)}</span></div>`:''}
        ${isInv&&due>0?`<div class="line"><span>المتبقي</span><span style="color:var(--warn);font-weight:800">${money(due)}</span></div>`:''}
      </div>
      ${d.notes?`<div style="margin-top:14px;color:var(--muted);white-space:pre-wrap"><i class="inl" data-lucide="sticky-note"></i> ${esc(isInv?d.notes:resolveQuoteNotes(d,d.notes))}</div>`:''}
    </div>
    ${isInv&&d.payments&&d.payments.length?`<div class="card" style="margin-top:16px"><h3><i data-lucide="wallet"></i> سجل الدفعات</h3>
      ${d.payments.map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span>${esc(p.date)} · ${esc(p.method||'')}</span><span>${money(p.amount)} <button class="link-btn del" onclick="rmPayment('${id}',${i})">×</button></span></div>`).join('')}</div>`:''}
    ${isInv?(()=>{const cns=(S.credits||[]).filter(c=>c.invoiceId===id);return cns.length?`<div class="card" style="margin-top:16px"><h3><i data-lucide="rotate-ccw"></i> إشعارات دائنة مرتبطة</h3>${cns.map(c=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><button class="link-btn" onclick="openCredit('${c.id}')">CN-${String(c.number).padStart(5,'0')}</button><span>${money(invTotal(c))}</span></div>`).join('')}</div>`:''})():''}`;
  refreshIcons();
}
/* إصدار الفاتورة الضريبيّة: رقمٌ من تسلسلٍ خاصّ بلا فجوات (المسودّات لا تستهلكه)
   وطابعُ وقتٍ يدخل في رمز QR، ثم القفل. */
function issueInvoice(id){const d=S.invoices.find(x=>x.id===id);if(!d||d.issued)return;
  const miss=taxSettingsIssues();if(miss.length){alert('أكمل بيانات الفاتورة الضريبيّة في الإعدادات أوّلاً:\n• '+miss.join('\n• '));go('settings');return}
  if(!(d.items||[]).some(it=>Number(it.qty)>0&&String(it.desc||'').trim())){alert('أضف بنداً واحداً على الأقلّ');return}
  if(d.clientVat&&!/^3\d{13}3$/.test(d.clientVat)){alert('الرقم الضريبي للعميل غير صحيح (١٥ رقماً يبدأ وينتهي بـ3)');return}
  if(!confirm('إصدار الفاتورة؟ بعد الإصدار لا يمكن تعديلها ولا حذفها — التصحيح بإشعار دائن.'))return;
  S.counters.taxInvoice=(S.counters.taxInvoice||0)+1;d.issued={no:S.counters.taxInvoice,at:new Date().toISOString()};d.date=riyadhStamp(d.issued.at).date;
  save();openDoc('invoice',id);}
function delCredit(id){const cn=(S.credits||[]).find(x=>x.id===id);if(!cn||cn.issued)return;if(!confirm('حذف الإشعار الدائن؟'))return;S.credits=S.credits.filter(x=>x.id!==id);const inv=S.invoices.find(x=>x.id===cn.invoiceId);if(inv)syncInvStatus(inv);save();go('invoicing');}
function paymentModal(invId){
  const inv=S.invoices.find(x=>x.id===invId);if(!inv)return;const due=invDue(inv);const total=invTotal(inv);
  const half=r2(Math.min(total/2,due));
  openModal('تسجيل دفعة',`
    <div class="badge-note"><i data-lucide="wallet"></i> <div>الإجمالي: <b>${money(total)}</b> · المتبقي على الفاتورة: <b>${money(due)}</b></div></div>
    <div class="row2"><div class="field"><label>المبلغ</label><input id="pa_amt" type="number" inputmode="decimal" value="${Number(due.toFixed(2))}">
      <div class="amt-chips" style="margin-top:6px">
        <button type="button" class="btn btn-gold btn-sm" onclick="amtChip('pa_amt',${half},'set')" title="نصف الإجمالي — العربون المعتاد">٥٠٪ (${money(half)})</button>
        <button type="button" onclick="amtChip('pa_amt',${Number(due.toFixed(2))},'set')">كامل المتبقي</button>
        <button type="button" onclick="amtClear('pa_amt')">مسح</button>
      </div></div>
    <div class="field"><label>التاريخ</label><input id="pa_date" type="date" value="${today()}"></div></div>
    <div class="field"><label>طريقة الدفع</label><select id="pa_method"><option>تحويل بنكي</option><option>نقداً</option><option>مدى / بطاقة</option><option>STC Pay</option><option>أخرى</option></select></div>`,
  ()=>{const amt=r2(document.getElementById('pa_amt').value||0);if(amt<=0){alert('أدخل مبلغاً صحيحاً');return}if(amt>due+0.004){alert('المبلغ أكبر من المتبقي ('+money(due)+')');return}if(!inv.payments)inv.payments=[];inv.payments.push({id:uid(),date:document.getElementById('pa_date').value,amount:amt,method:document.getElementById('pa_method').value});syncInvStatus(inv);accSyncPayments();bumpStage(inv.contactId,'delivery','استلمنا دفعة على الفاتورة '+docNo('invoice',inv));save();closeModal();openDoc('invoice',invId)});
}
function rmPayment(invId,idx){const inv=S.invoices.find(x=>x.id===invId);if(!inv)return;if(!confirm('حذف هذه الدفعة؟'))return;inv.payments.splice(idx,1);syncInvStatus(inv);accSyncPayments();save();openDoc('invoice',invId)}
