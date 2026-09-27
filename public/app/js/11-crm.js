/*
 * 11-crm.js — جهات الاتّصال والمنتجات والاشتراكات والمصروفات
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== CONTACTS ===== */
function clientAvatar(c,size){size=size||44;const fs=Math.round(size*0.42);
  if(c.logo)return `<img src="${esc(c.logo)}" style="width:${size}px;height:${size}px;border-radius:12px;object-fit:contain;background:transparent;border:1px solid var(--line)" onerror="this.style.display='none'">`;
  const initial=esc((c.name||'؟').trim().charAt(0));
  return `<div style="width:${size}px;height:${size}px;border-radius:12px;background:var(--goldsoft);color:var(--gold2);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${fs}px;border:1px solid var(--line)">${initial}</div>`;}
function clientCredits(contactId){return (S.credits||[]).filter(c=>c.contactId===contactId)}
function clientBalance(contactId){const it=clientItems(contactId);const invoiced=it.invoices.reduce((a,i)=>a+invTotal(i),0);const paid=it.invoices.reduce((a,i)=>a+invPaid(i),0);const credited=clientCredits(contactId).reduce((a,c)=>a+invTotal(c),0);const due=Math.max(0,invoiced-paid-credited);return {invoiced,paid,credited,due,count:it.invoices.length,it};}
function renderContacts(){
  const cs=S.contacts.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ar'));
  const view=uiPref('contactsView','cards');
  const sw=viewSwitch('contactsView',[{v:'cards',t:'بطاقات'},{v:'list',t:'قائمة'}],view);
  const typePill=c=>inPipeline(c)?stagePill(c):`<span class="pill contacted">${esc(c.type||'مورد')}</span>`;
  let body;
  if(!cs.length){body=emptyBox('user','لا يوجد عملاء بعد. أضف أول عميل ببياناته وشعاره.');}
  else if(view==='list'){
    body=`<table><thead><tr><th>العميل</th><th>الجهة</th><th>المرحلة</th><th>الفواتير</th><th>الرصيد</th></tr></thead><tbody>
    ${cs.map(c=>{const b=clientBalance(c.id);return `<tr style="cursor:pointer" onclick="openClient('${c.id}')">
      <td><span style="display:inline-flex;align-items:center;gap:10px">${clientAvatar(c,34)}<b>${esc(c.name)}</b></span></td>
      <td style="color:var(--muted)">${esc(c.company||'—')}</td><td>${typePill(c)}</td><td style="color:var(--muted)">${b.count}</td>
      <td>${b.due>0?`<span style="color:var(--warn);font-weight:700">مستحق ${money(b.due)}</span>`:`<span style="color:var(--good);font-weight:700">مسدّد بالكامل</span>`}</td></tr>`}).join('')}
    </tbody></table>`;
  } else {
    body=`<div class="grid">
    ${cs.map(c=>{const b=clientBalance(c.id);return `<div class="card" style="cursor:pointer;display:flex;flex-direction:column;gap:12px" onclick="openClient('${c.id}')">
      <div style="display:flex;align-items:center;gap:12px">${clientAvatar(c,48)}
        <div style="min-width:0;flex:1"><div style="font-weight:800;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</div>
        <div style="color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.company||c.type||'عميل')}</div></div>
        ${typePill(c)}</div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:10px;font-size:13px">
        <span style="color:var(--muted)">${b.count} فاتورة</span>
        ${b.due>0?`<span style="color:var(--warn);font-weight:700">مستحق ${money(b.due)}</span>`:`<span style="color:var(--good);font-weight:700">مسدّد بالكامل</span>`}</div>
    </div>`}).join('')}
    </div>`;
  }
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>العملاء وجهات الاتصال</h1><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${sw}<button class="btn btn-gold" onclick="contactModal(null,renderContacts)">+ عميل جديد</button></div></div>
    ${body}`;
  refreshIcons();
}
function openClient(id){
  const c=S.contacts.find(x=>x.id===id);if(!c){renderContacts();return}
  const b=clientBalance(id);const it=b.it;const apptUp=it.appts.slice().sort((a,b)=>(a.datetime||'').localeCompare(b.datetime||''));
  const info=(lbl,val,href)=>val?`<div style="padding:9px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px"><span style="color:var(--muted)">${lbl}</span>${href?`<a href="${href}" target="_blank" style="color:var(--gold2);font-weight:600">${esc(val)}</a>`:`<span style="font-weight:600">${esc(val)}</span>`}</div>`:'';
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><button class="link-btn" onclick="renderContacts()">← العملاء</button></h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="contactModal('${id}',()=>openClient('${id}'))"><i data-lucide="pencil"></i> تعديل البيانات</button>
        <button class="btn btn-ghost btn-sm" onclick="docModal('sale',null,'${esc(c.name).replace(/'/g,"\\'")}',()=>openClient('${id}'))">+ عرض سعر</button>
        <button class="btn btn-gold" onclick="docModal('invoice',null,'${esc(c.name).replace(/'/g,"\\'")}',()=>openClient('${id}'))">+ فاتورة</button></div></div>
    <div class="card" style="display:flex;align-items:center;gap:16px;margin-bottom:18px">
      ${clientAvatar(c,72)}
      <div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:900">${esc(c.name)}</div>
      <div style="color:var(--muted)">${esc(c.company||'')} ${c.company&&c.type?'·':''} ${esc(c.type||'عميل')}</div></div>
      ${inPipeline(c)?stagePill(c):''}</div>
    ${inPipeline(c)?stagePanel(c):''}
    <div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="receipt-text"></i></span><div class="v">${b.count}</div><div class="l">عدد الفواتير</div></div>
      <div class="stat"><span class="ic"><i data-lucide="layers"></i></span><div class="v">${money(b.invoiced)}</div><div class="l">إجمالي مفوتر</div></div>
      <div class="stat"><span class="ic"><i data-lucide="wallet"></i></span><div class="v">${money(b.paid)}</div><div class="l">المحصّل</div></div>
      <div class="stat"><span class="ic"><i data-lucide="hourglass"></i></span><div class="v" style="color:${b.due>0?'var(--warn)':'var(--good)'}">${money(b.due)}</div><div class="l">المستحق (Receivable)</div></div>
    </div>
    <div class="grid">
      <div class="card"><h3><i data-lucide="id-card"></i> بيانات العميل</h3>
        ${info('الجوال',c.phone,c.phone?'tel:'+esc(c.phone):'')}
        ${info('البريد',c.email,c.email?'mailto:'+esc(c.email):'')}
        ${info('الرقم الضريبي',c.vat)}
        ${info('الشركة/الجهة',c.company)}
        ${info('المدينة',c.city)}
        ${info('العنوان',c.address)}
        ${info('الموقع',c.website,c.website?(c.website.startsWith('http')?esc(c.website):'https://'+esc(c.website)):'')}
        ${c.notes?`<div style="padding-top:10px;color:var(--muted);font-size:13px"><i class="inl" data-lucide="sticky-note"></i> ${esc(c.notes)}</div>`:''}
        ${(!c.phone&&!c.email&&!c.vat&&!c.company&&!c.address)?'<p style="color:var(--muted)">لا توجد بيانات بعد — اضغط «تعديل البيانات».</p>':''}
      </div>
      <div class="card"><h3><i data-lucide="receipt-text"></i> الفواتير</h3>
        ${it.invoices.length?it.invoices.slice().reverse().map(d=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)">
          <span><button class="link-btn" onclick="printDoc('invoice','${d.id}')">طباعة</button> <button class="link-btn" onclick="docModal('invoice','${d.id}',null,()=>openClient('${id}'))">#${d.number}</button></span>
          <span>${money(invTotal(d))} ${pill(d.status)}</span></div>`).join(''):'<p style="color:var(--muted)">لا فواتير لهذا العميل بعد.</p>'}
      </div>
      <div class="card"><h3><i data-lucide="file-text"></i> عروض الأسعار</h3>
        ${it.invoices&&S.sales.filter(x=>x.contactId===id).length?S.sales.filter(x=>x.contactId===id).slice().reverse().map(d=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)">
          <span><button class="link-btn" onclick="toInvoice('${d.id}')">→ فاتورة</button> <button class="link-btn" onclick="docModal('sale','${d.id}',null,()=>openClient('${id}'))">#${d.number}</button></span>
          <span>${money(docTotal(d))} ${pill(d.status)}</span></div>`).join(''):'<p style="color:var(--muted)">لا عروض أسعار.</p>'}
      </div>
      <div class="card"><h3><i data-lucide="history"></i> سجل التواصل</h3>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          ${['call','whatsapp','meeting','note'].map(k=>`<button class="btn btn-ghost btn-sm" onclick="logModal('${id}','${k}')"><i data-lucide="${LOG_KINDS[k].icon}"></i> ${LOG_KINDS[k].label}</button>`).join('')}
        </div>
        ${(c.log||[]).length?(c.log||[]).slice().reverse().map(l=>`<div class="tl-row">
          <span class="tl-ic"><i data-lucide="${(LOG_KINDS[l.kind]||LOG_KINDS.note).icon}"></i></span>
          <div style="flex:1;min-width:0"><div style="font-weight:700">${esc((LOG_KINDS[l.kind]||LOG_KINDS.note).label)}</div>
          ${l.note?`<div style="color:var(--muted)">${esc(l.note)}</div>`:''}</div>
          <span style="color:var(--muted);font-size:12px;flex:none">${esc(l.date)}</span></div>`).join(''):'<p style="color:var(--muted)">لا يوجد تواصل مسجّل بعد — سجّل أول مكالمة أو رسالة.</p>'}
      </div>
      <div class="card"><h3><i data-lucide="clapperboard"></i> المشاريع والمواعيد</h3>
        ${it.projects.length?it.projects.map(p=>`<div style="padding:7px 0;border-bottom:1px solid var(--line)"><i class="inl" data-lucide="clapperboard"></i> ${esc(p.title)}</div>`).join(''):''}
        ${apptUp.length?apptUp.map(a=>`<div style="padding:7px 0;border-bottom:1px solid var(--line)"><i class="inl" data-lucide="calendar-days"></i> ${esc(a.title)} — ${esc((a.datetime||'').replace('T',' '))}</div>`).join(''):''}
        ${(!it.projects.length&&!apptUp.length)?'<p style="color:var(--muted)">لا مشاريع أو مواعيد مرتبطة.</p>':''}
      </div>
    </div>`;
  refreshIcons();
}
/* شارة المرحلة — تستخدم أصناف الـpill الموجودة أصلاً */
function stagePill(c){const st=clientStage(c);return `<span class="pill ${st.pill||'lead'}">${esc(st.label)}</span>`}
/* لوحة المرحلة والمتابعة أعلى بطاقة العميل */
function stagePanel(c){
  const st=clientStage(c),cur=stageIdx(c.stageKey);
  const path=S.clientStages.filter(s=>!s.lost);
  const nxt=path[path.findIndex(s=>s.key===c.stageKey)+1];
  const rot=isRotting(c);
  return `<div class="card" style="margin-bottom:18px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <h3 style="margin:0"><i data-lucide="git-branch"></i> المرحلة والمتابعة</h3>
      <span style="color:${rot?'var(--warn)':'var(--muted)'};font-size:13px;font-weight:700">${rot?`<i class="inl" data-lucide="alarm-clock"></i> راكد ${stageAge(c)} يوم في «${esc(st.label)}»`:`في هذه المرحلة منذ ${stageAge(c)} يوم`}</span>
    </div>
    <div class="stage-track">${path.map((s,i)=>`<button class="stage-step ${s.key===c.stageKey?'on':(i<cur?'done':'')}" onclick="moveClientStage('${c.id}','${s.key}','تعديل يدوي',1)" title="نقل إلى ${esc(s.label)}">${esc(s.label)}</button>`).join('')}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      ${nxt?`<button class="btn btn-gold btn-sm" onclick="moveClientStage('${c.id}','${nxt.key}','تعديل يدوي',1)"><i data-lucide="arrow-left"></i> نقل إلى: ${esc(nxt.label)}</button>`:''}
      ${!st.lost&&!st.final?`<button class="btn btn-ghost btn-sm" onclick="loseClient('${c.id}')"><i data-lucide="x"></i> لم يكتمل</button>`:''}
      <button class="btn btn-ghost btn-sm" onclick="nextActionModal('${c.id}')"><i data-lucide="bell"></i> ${c.nextAction?'تعديل الخطوة القادمة':'حدّد الخطوة القادمة'}</button>
    </div>
    <div style="margin-top:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:11px;font-size:13px">
      <span style="color:var(--muted)">القيمة المتوقّعة: <b style="color:var(--gold)">${Number(c.value||0)>0?money(c.value):'—'}</b></span>
      <span style="color:var(--muted)">الخطوة القادمة: ${c.nextAction?`${dueChip(c.nextDate)} <b>${esc(c.nextAction)}</b>`:'<b style="color:var(--warn)">غير محدّدة</b>'}</span>
    </div>
  </div>`;
}
function loseClient(id){
  const c=S.contacts.find(x=>x.id===id);if(!c)return;
  const why=prompt('ليش ما اكتمل؟ (يُسجَّل في سجل التواصل)','');if(why===null)return;
  setClientStage(c,'lost',why?('السبب: '+why):'');save();openClient(id);
}
function nextActionModal(id){
  const c=S.contacts.find(x=>x.id===id);if(!c)return;
  openModal('الخطوة القادمة',`
    <div class="field"><label>ما الإجراء القادم؟</label><input id="na_act" value="${esc(c.nextAction||'')}" placeholder="مثال: أتابع بالواتساب بخصوص العرض"></div>
    <div class="field"><label>متى؟</label><input type="date" id="na_date" value="${esc(c.nextDate||today())}"></div>`,
  ()=>{c.nextAction=document.getElementById('na_act').value;c.nextDate=document.getElementById('na_date').value;save();closeModal();openClient(id)});
}
function logModal(id,kind){
  const c=S.contacts.find(x=>x.id===id);if(!c)return;
  const k=LOG_KINDS[kind]||LOG_KINDS.note;
  openModal('تسجيل '+k.label,`
    <div class="field"><label>ماذا دار؟</label><textarea id="lg_note" rows="3" placeholder="خلاصة ${esc(k.label)}..."></textarea></div>
    <div class="field"><label>الخطوة القادمة (اختياري)</label><input id="lg_next" value="${esc(c.nextAction||'')}"></div>
    <div class="field"><label>تاريخها</label><input type="date" id="lg_date" value="${esc(c.nextDate||'')}"></div>`,
  ()=>{clientLog(c,kind,document.getElementById('lg_note').value);c.nextAction=document.getElementById('lg_next').value;c.nextDate=document.getElementById('lg_date').value;save();closeModal();openClient(id)});
}
function contactModal(id,cb){
  cb=cb||renderContacts;
  let c=id?{...S.contacts.find(x=>x.id===id)}:{id:'',name:'',type:'عميل',phone:'',email:'',company:'',vat:'',address:'',city:'',website:'',logo:'',notes:'',stageKey:S.clientStages[0].key,stageDate:today(),value:0,nextAction:'',nextDate:'',log:[]};
  window.cPickLogo=(e)=>{const f=e.target.files[0];if(!f)return;if(f.size>1500000){alert('حجم الصورة كبير (أقل من 1.5MB)');return}const r=new FileReader();r.onload=()=>{c.logo=r.result;const p=document.getElementById('c_logoPrev');if(p){p.src=r.result;p.style.display='block'}};r.readAsDataURL(f)};
  openModal(id?'تعديل بطاقة العميل':'عميل جديد',`
    <div class="logo-upload"><img id="c_logoPrev" src="${esc(c.logo)}" style="${c.logo?'':'display:none'}" onerror="this.style.display='none'"><div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('c_logoFile').click()"><i data-lucide="upload"></i> رفع شعار العميل</button>
      ${c.logo?`<button type="button" class="link-btn del" onclick="(function(){var x=document.getElementById('c_logoPrev');x.src='';x.style.display='none';})();window.__rmLogo&&window.__rmLogo()">إزالة</button>`:''}
      <div style="color:var(--muted);font-size:12px;margin-top:6px">يظهر في بطاقة العميل وفي الفاتورة</div></div></div>
    <input type="file" id="c_logoFile" accept="image/*" class="hidden" onchange="cPickLogo(event)">
    <div class="row2"><div class="field"><label>الاسم</label><input id="c_name" value="${esc(c.name)}"></div>
    <div class="field"><label>النوع</label><select id="c_type"><option ${c.type==='عميل'?'selected':''}>عميل</option><option ${c.type==='عميل محتمل'?'selected':''}>عميل محتمل</option><option ${c.type==='مورد'?'selected':''}>مورد</option></select></div></div>
    <div class="row2"><div class="field"><label>المرحلة</label><select id="c_stage">${S.clientStages.map(s=>`<option value="${s.key}" ${c.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('')}</select></div>
    <div class="field"><label>القيمة المتوقّعة (${esc(S.settings.currency)})</label><input type="number" id="c_value" value="${Number(c.value||0)}" min="0" step="any"></div></div>
    <div class="row2"><div class="field"><label>الإجراء القادم</label><input id="c_nextAction" value="${esc(c.nextAction||'')}" placeholder="مثال: أتابع على الواتساب بخصوص العرض"></div>
    <div class="field"><label>تاريخ الإجراء القادم</label><input type="date" id="c_nextDate" value="${esc(c.nextDate||'')}"></div></div>
    <div class="row2"><div class="field"><label>الجوال</label><input id="c_phone" value="${esc(c.phone)}"></div>
    <div class="field"><label>البريد</label><input id="c_email" value="${esc(c.email)}"></div></div>
    <div class="row2"><div class="field"><label>الشركة/الجهة</label><input id="c_company" value="${esc(c.company)}"></div>
    <div class="field"><label>الرقم الضريبي (VAT)</label><input id="c_vat" value="${esc(c.vat)}" inputmode="numeric" placeholder="3xxxxxxxxxxxxx3"></div></div>
    <div class="row2"><div class="field"><label>المدينة</label><input id="c_city" value="${esc(c.city)}"></div>
    <div class="field"><label>الموقع الإلكتروني</label><input id="c_website" value="${esc(c.website)}" placeholder="https://"></div></div>
    <div class="field"><label>العنوان</label><input id="c_address" value="${esc(c.address)}"></div>
    <div class="field"><label>ملاحظات</label><textarea id="c_notes" rows="2">${esc(c.notes)}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;c.name=g('c_name');c.type=g('c_type');c.phone=g('c_phone');c.email=g('c_email');c.company=g('c_company');c.vat=g('c_vat');c.city=g('c_city');c.website=g('c_website');c.address=g('c_address');c.notes=g('c_notes');c.value=Number(g('c_value')||0);c.nextAction=g('c_nextAction');c.nextDate=g('c_nextDate');if(!c.name.trim()){alert('أدخل الاسم');return}
    if(!Array.isArray(c.log))c.log=[];setClientStage(c,g('c_stage'));if(!c.stageDate)c.stageDate=today();if(id){const i=S.contacts.findIndex(x=>x.id===id);S.contacts[i]=c}else{c.id=uid();S.contacts.push(c)}save();closeModal();cb()},id?()=>delItem('contacts',id,renderContacts):null);
  window.__rmLogo=()=>{c.logo=''};
}

/* ===== PRODUCTS CATALOG ===== */
function renderProducts(){
  const ps=S.products||[];const cur=esc(S.settings.currency);
  const view=uiPref('productsView','table');
  const sw=viewSwitch('productsView',[{v:'table',t:'جدول'},{v:'cards',t:'مربعات'}],view);
  let body;
  if(!ps.length){body=emptyBox('package','لا توجد منتجات بعد.');}
  else if(view==='cards'){
    body=`<div class="grid">${ps.map(p=>`<div class="card prod-card">
      ${p.image?`<div class="prod-img" style="background-image:url('${esc(p.image)}')"></div>`:`<div class="prod-ic"><i data-lucide="package"></i></div>`}
      <div class="prod-name">${esc(p.name)}</div>
      ${p.desc?`<div class="prod-desc">${esc(p.desc)}</div>`:'<div class="prod-desc"></div>'}
      <div class="prod-foot"><span class="prod-price" style="white-space:nowrap">${money(p.price)}</span>${p.unit?`<span class="prod-unit">/ ${esc(p.unit)}</span>`:''}</div>
      <div class="prod-actions"><button onclick="productModal('${p.id}')">تعديل</button><button class="del" onclick="delItem('products','${p.id}',renderProducts)">حذف</button></div>
    </div>`).join('')}</div>`;
  } else {
    body=`<table><thead><tr><th>المنتج/الخدمة</th><th>الوحدة</th><th>السعر</th><th></th></tr></thead><tbody>
    ${ps.map(p=>`<tr><td><div style="display:flex;align-items:center;gap:10px">${p.image?`<img src="${esc(p.image)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex:none;border:1px solid var(--line)">`:''}<div><b>${esc(p.name)}</b>${p.desc?`<div style="font-size:12px;color:var(--muted)">${esc(p.desc)}</div>`:''}</div></div></td><td>${esc(p.unit||'—')}</td><td style="white-space:nowrap;font-weight:700">${money(p.price)}</td>
    <td style="white-space:nowrap"><button class="link-btn" onclick="productModal('${p.id}')">تعديل</button><button class="link-btn del" onclick="delItem('products','${p.id}',renderProducts)">حذف</button></td></tr>`).join('')}
    </tbody></table>`;
  }
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>المنتجات والخدمات</h1><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${sw}<button class="btn btn-gold" onclick="productModal()">+ منتج</button></div></div>
    <div class="badge-note"><i data-lucide="package"></i> <div>عرّف خدماتك ومنتجاتك بأسعارها مرة واحدة — ثم اخترها مباشرة في عروض الأسعار والفواتير بضغطة.</div></div>
    ${body}`;
  refreshIcons();
}
function productModal(id){
  let p=id?{...(S.products||[]).find(x=>x.id===id)}:{id:'',name:'',price:0,cost:0,unit:'',desc:'',barcode:'',stock:null,category:'',image:'',notes:'',templateId:''};
  const back=()=>{ (CUR==='pos')?posRenderGrid():renderProducts(); };
  openModal(id?'تعديل منتج':'منتج جديد',`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <img id="pimgPrev" src="${esc(p.image||'')}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;background:var(--panel2);border:1px solid var(--line);${p.image?'':'display:none'}">
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('p_imgfile').click()"><i data-lucide="image"></i> صورة المنتج</button>
      <button id="pimgRemove" class="btn btn-ghost btn-sm" onclick="prodRemoveImg()" style="color:var(--bad);${p.image?'':'display:none'}"><i data-lucide="trash-2"></i> حذف الصورة</button>
      <span id="pimgStatus" style="color:var(--muted);font-size:12px"></span>
      <input type="file" id="p_imgfile" accept="image/*" class="hidden" onchange="prodUpload(event)"><input type="hidden" id="p_image" value="${esc(p.image||'')}"></div>
    <div class="field"><label>اسم المنتج/الخدمة</label><input id="p_name" value="${esc(p.name)}"></div>
    <div class="row2"><div class="field"><label>سعر البيع (${esc(S.settings.currency)})</label><input id="p_price" type="number" inputmode="decimal" value="${p.price}"></div>
    <div class="field"><label>التكلفة (اختياري)</label><input id="p_cost" type="number" inputmode="decimal" value="${p.cost||0}"></div></div>
    <div class="row2"><div class="field"><label>الباركود</label><input id="p_barcode" value="${esc(p.barcode||'')}" placeholder="امسحه أو اكتبه"></div>
    <div class="field"><label>المخزون</label><input id="p_stock" type="number" inputmode="numeric" value="${p.stock==null?'':p.stock}" placeholder="اتركه فارغاً لخدمة"></div></div>
    <div class="row2"><div class="field"><label>الوحدة</label><input id="p_unit" value="${esc(p.unit)}" placeholder="حبة / علبة / حلقة"></div>
    <div class="field"><label>التصنيف</label><input id="p_cat" value="${esc(p.category||'')}" placeholder="مشروبات / إلكترونيات"></div></div>
    <div class="field"><label>وصف (اختياري) — يظهر تحت البند في عرض السعر</label><textarea id="p_desc" rows="2">${esc(p.desc)}</textarea></div>
    <div class="field"><label>قالب شروط عرض السعر لهذا المنتج</label>
      <select id="p_tpl"><option value="">— بلا قالب مرتبط (يستخدم الافتراضي) —</option>${quoteTemplates().map(t=>`<option value="${esc(t.id)}" ${p.templateId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">عند إضافة هذا المنتج لعرض سعر، يُختار القالب تلقائياً — لا حاجة لضبطه يدوياً كل مرة.</div>
    </div>
    <div class="field"><label>ملاحظات/شروط خاصة بهذا المنتج (تُضاف قبل القالب العام)</label>
      <textarea id="p_notes" rows="3" placeholder="مثال: يشمل تصوير في موقع واحد داخل الرياض. لا يشمل الممثلين.">${esc(p.notes||'')}</textarea>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">اترك فارغاً لو ما تحتاج شروطاً إضافية لهذا المنتج بالذات.</div>
    </div>`,
  ()=>{const g=i=>document.getElementById(i).value;p.name=g('p_name');p.price=Number(g('p_price')||0);p.cost=Number(g('p_cost')||0);p.barcode=g('p_barcode').trim();const stk=g('p_stock').trim();p.stock=stk===''?null:Number(stk);p.unit=g('p_unit');p.category=g('p_cat').trim();p.desc=g('p_desc');p.notes=g('p_notes');p.templateId=g('p_tpl');p.image=g('p_image');if(!p.name.trim()){alert('أدخل الاسم');return}if(!S.products)S.products=[];if(id){const i=S.products.findIndex(x=>x.id===id);S.products[i]=p}else{p.id=uid();S.products.push(p)}save();closeModal();back()},id?()=>delItem('products',id,back):null);
}
// ضغط الصورة في المتصفّح قبل الرفع (يصغّر الأبعاد ويحوّلها WebP) — يوفّر مساحة التخزين
function compressImage(file,maxDim,quality,cb){
  const rd=new FileReader();
  rd.onload=()=>{const img=new Image();img.onload=()=>{
    let w=img.width,h=img.height;const s=Math.min(1,maxDim/Math.max(w,h));w=Math.max(1,Math.round(w*s));h=Math.max(1,Math.round(h*s));
    const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
    c.toBlob(b=>{if(b)cb(b,'webp');else c.toBlob(b2=>cb(b2,'jpeg'),'image/jpeg',quality)},'image/webp',quality);
  };img.onerror=()=>cb(null);img.src=rd.result};
  rd.onerror=()=>cb(null);rd.readAsDataURL(file);
}
function prodRemoveImg(){const h=document.getElementById('p_image');if(h)h.value='';const pv=document.getElementById('pimgPrev');if(pv){pv.src='';pv.style.display='none'}const rm=document.getElementById('pimgRemove');if(rm)rm.style.display='none';const st=document.getElementById('pimgStatus');if(st)st.textContent='حُذفت الصورة — احفظ لتأكيد.'}
function prodUpload(ev){const f=ev.target.files[0];ev.target.value='';if(!f)return;const st=document.getElementById('pimgStatus');
  if(f.size>12*1024*1024){alert('الصورة كبيرة جداً (الحد ١٢MB). اختر صورة أصغر.');return}
  if(st)st.textContent='جارٍ الضغط…';
  compressImage(f,1000,0.82,(blob)=>{
    if(!blob){if(st)st.textContent='';alert('تعذّر معالجة الصورة');return}
    if(st)st.textContent='جارٍ الرفع…';
    const fmt=blob.type==='image/webp'?'webp':'jpg';const path=`${USER.id}/products/${uid()}.${fmt}`;
    sb.storage.from('product-images').upload(path,blob,{upsert:false,contentType:blob.type||'image/webp'}).then(({error})=>{
      if(error){if(st)st.textContent='';alert('تعذّر رفع الصورة: '+(error.message||error)+'\n\nأنشئ bucket عام باسم «product-images» في Supabase → Storage.');return}
      const {data}=sb.storage.from('product-images').getPublicUrl(path);const h=document.getElementById('p_image');if(h)h.value=data.publicUrl;const pv=document.getElementById('pimgPrev');if(pv){pv.src=data.publicUrl;pv.style.display='block'}const rm=document.getElementById('pimgRemove');if(rm)rm.style.display='inline-flex';if(st)st.textContent='تم ✓ ('+Math.round(blob.size/1024)+'KB)';});
  });
}

/* ===== SUBSCRIPTIONS & EXPENSES ===== */
function subCycleLabel(c){return c==='yearly'?'سنوي':c==='installment'?'قسط شهري':'شهري'}
function renderSubscriptions(){
  const subs=S.subscriptions||[];
  const monthly=subs.filter(s=>s.active!==false&&(s.cycle==='monthly'||s.cycle==='installment'));
  const yearly=subs.filter(s=>s.active!==false&&s.cycle==='yearly');
  const mSar=monthly.reduce((a,s)=>a+Number(s.sar||0),0);const mUsd=monthly.reduce((a,s)=>a+Number(s.usd||0),0);
  const ySar=yearly.reduce((a,s)=>a+Number(s.sar||0),0);const grandM=mSar+ySar/12;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الاشتراكات والمصروفات الشهرية</h1><button class="btn btn-gold" onclick="subModal()">+ اشتراك</button></div>
    <div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="calendar"></i></span><div class="v">${money(mSar)}</div><div class="l">المصروف الشهري (ريال)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="dollar-sign"></i></span><div class="v">${usdMoney(mUsd)}</div><div class="l">المصروف الشهري (دولار)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="calendar-range"></i></span><div class="v">${money(ySar)}</div><div class="l">اشتراكات سنوية (ريال/سنة)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="sigma"></i></span><div class="v">${money(grandM)}</div><div class="l">الإجمالي الشهري التقريبي</div></div>
    </div>
    ${!subs.length?emptyBox('credit-card','لا اشتراكات بعد.'):
    `<table><thead><tr><th>الاشتراك</th><th>النوع</th><th>$ دولار</th><th>ريال</th><th>التاريخ</th><th>ملاحظات</th><th></th></tr></thead><tbody>
    ${subs.map(s=>`<tr><td><b>${esc(s.name)}</b>${s.url?` <a href="${esc(s.url)}" target="_blank" style="color:var(--gold2)">↗</a>`:''}${s.cycle==='installment'&&s.remaining?`<div style="font-size:12px;color:var(--warn)">باقٍ ${s.remaining} أقساط</div>`:''}</td>
    <td>${subCycleLabel(s.cycle)}</td><td>${s.usd?usdMoney(s.usd):'—'}</td><td>${s.sar?money(s.sar):'—'}</td><td>${esc(s.date||'—')}</td><td style="max-width:240px;font-size:13px;color:var(--muted)">${esc(s.note||'')}</td>
    <td style="white-space:nowrap"><button class="link-btn" onclick="subModal('${s.id}')">تعديل</button><button class="link-btn del" onclick="delItem('subscriptions','${s.id}',renderSubscriptions)">حذف</button></td></tr>`).join('')}
    <tr style="background:var(--panel2);font-weight:800"><td>الإجمالي الشهري (شهري+أقساط)</td><td>—</td><td>${usdMoney(mUsd)}</td><td>${money(mSar)}</td><td colspan="3"></td></tr>
    </tbody></table>
    <div class="badge-note" style="margin-top:16px"><i data-lucide="lightbulb"></i> <div>«المصروف الشهري» يجمع الشهري والأقساط. الاشتراكات السنوية تُعرض منفصلة (وتعادل شهرياً ≈ ${money(ySar/12)} ريال). سعر الصرف المستخدم ≈ ${USD_RATE} ريال للدولار.</div></div>`}`;
  refreshIcons();
}
function subModal(id){
  let s=id?{...(S.subscriptions||[]).find(x=>x.id===id)}:{id:'',name:'',usd:0,sar:0,cycle:'monthly',date:'',url:'',note:'',remaining:0,active:true};
  openModal(id?'تعديل اشتراك':'اشتراك جديد',`
    <div class="field"><label>اسم الاشتراك</label><input id="su_name" value="${esc(s.name)}"></div>
    <div class="row2"><div class="field"><label>المبلغ بالدولار</label><input id="su_usd" type="number" inputmode="decimal" value="${s.usd||0}" oninput="var x=document.getElementById('su_sar');if(x)x.value=this.value===''?'':(Number(this.value||0)*USD_RATE).toFixed(2)"></div>
    <div class="field"><label>المبلغ بالريال</label><input id="su_sar" type="number" inputmode="decimal" value="${s.sar||0}" oninput="var x=document.getElementById('su_usd');if(x)x.value=this.value===''?'':(Number(this.value||0)/USD_RATE).toFixed(2)"></div></div>
    <div class="note" style="margin:-4px 2px 0;font-size:12px;color:var(--muted)">يتحوّل تلقائياً بين العملتين · سعر الصرف ≈ ${USD_RATE} ريال/دولار</div>
    <div class="row2"><div class="field"><label>النوع</label><select id="su_cycle"><option value="monthly" ${s.cycle==='monthly'?'selected':''}>شهري</option><option value="yearly" ${s.cycle==='yearly'?'selected':''}>سنوي</option><option value="installment" ${s.cycle==='installment'?'selected':''}>قسط شهري</option></select></div>
    <div class="field"><label>تاريخ الاشتراك / التجديد</label><input type="date" id="su_date" value="${esc(s.date)}"></div></div>
    <div class="field"><label>أقساط متبقية (للقروض — اختياري)</label><input id="su_rem" type="number" inputmode="numeric" value="${s.remaining||0}"></div>
    <div class="field"><label>الرابط</label><input id="su_url" value="${esc(s.url)}" placeholder="https://"></div>
    <div class="field"><label>ملاحظات / سبب الاشتراك</label><textarea id="su_note" rows="2">${esc(s.note)}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;s.name=g('su_name');s.usd=Number(g('su_usd')||0);s.sar=Number(g('su_sar')||0);s.cycle=g('su_cycle');s.date=g('su_date');s.remaining=Number(g('su_rem')||0);s.url=g('su_url');s.note=g('su_note');if(!s.name.trim()){alert('أدخل الاسم');return}if(!S.subscriptions)S.subscriptions=[];if(id){const i=S.subscriptions.findIndex(x=>x.id===id);S.subscriptions[i]=s}else{s.id=uid();s.active=true;S.subscriptions.push(s)}save();closeModal();renderSubscriptions()},id?()=>delItem('subscriptions',id,renderSubscriptions):null);
}
