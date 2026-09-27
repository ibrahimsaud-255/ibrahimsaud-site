/*
 * 12-sales.js — المبيعات والفوترة والقوالب والطباعة وZATCA
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== SALES & INVOICING ===== */
function renderSales(){renderDocs('sale')}
function renderInvoicing(){renderDocs('invoice')}
const AR_MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function monthLabel(ym){const [y,m]=ym.split('-');const i=Math.max(0,Math.min(11,(+m||1)-1));return AR_MONTHS[i]+' '+y}
function renderDocs(type){
  const isInv=type==='invoice';const list=isInv?S.invoices:S.sales;const title=isInv?'الفوترة':'المبيعات';
  // ترتيب من الأحدث للأقدم مع تجميع بالشهر
  const sorted=list.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const groups=new Map();
  sorted.forEach(d=>{const ym=(d.date||'').slice(0,7)||'—';if(!groups.has(ym))groups.set(ym,[]);groups.get(ym).push(d);});
  const pfx=isInv?(S.settings.invPrefix||'INV-'):(S.settings.salePrefix||'S');

  const groupHTML=[...groups.entries()].map(([ym,rows])=>{
    // ملخّص الشهر
    let sumTotal=0,sumDue=0,cQuoted=0,cSent=0,cSale=0,cCancel=0,cPaid=0,cPartial=0,cUnpaid=0;
    rows.forEach(d=>{const t=isInv?invTotal(d):docTotal(d);sumTotal+=t;if(isInv){sumDue+=invDue(d);if(d.status==='paid')cPaid++;else if(d.status==='partial')cPartial++;else cUnpaid++;}else{if(d.status==='draft')cQuoted++;else if(d.status==='sent')cSent++;else if(d.status==='sale')cSale++;else if(d.status==='cancel')cCancel++;}});
    const chips=isInv
      ?`<span class="chip good">مدفوعة ${cPaid}</span><span class="chip warn">جزئية ${cPartial}</span><span class="chip">غير مدفوعة ${cUnpaid}</span>`
      :`<span class="chip">عرض ${cQuoted}</span><span class="chip info">مُرسل ${cSent}</span><span class="chip good">أمر بيع ${cSale}</span><span class="chip del">ملغى ${cCancel}</span>`;
    const rowsHTML=rows.map(d=>{const total=isInv?invTotal(d):docTotal(d);return `<tr><td><button class="link-btn" style="padding:0" onclick="openDoc('${type}','${d.id}')">${esc(pfx)}${String(d.number).padStart(5,'0')}</button></td><td>${esc(resolveClientName(d))}</td><td>${d.date}</td><td>${money(total)}</td>${isInv?`<td>${invDue(d)>0?`<span style="color:var(--warn)">${money(invDue(d))}</span>`:'—'}</td>`:''}<td>${pill(d.status)}</td>
      <td style="white-space:nowrap">${!isInv&&d.status==='sale'?`<button class="link-btn" onclick="toInvoice('${d.id}')">→ فاتورة</button>`:''}
        <button class="link-btn" onclick="printDoc('${type}','${d.id}')">طباعة</button>
        <button class="link-btn" onclick="openDoc('${type}','${d.id}')">عرض</button>
        <button class="link-btn del" onclick="delDoc('${type}','${d.id}')">حذف</button></td></tr>`}).join('');
    return `<div class="mo-block">
      <div class="mo-head">
        <div class="mo-title"><i data-lucide="calendar-days"></i> ${esc(monthLabel(ym))} <span class="mo-count">· ${rows.length}</span></div>
        <div class="mo-sum"><span class="mo-total">${money(sumTotal)}</span>${isInv&&sumDue>0?` <span class="mo-due">متبقي ${money(sumDue)}</span>`:''}</div>
        <div class="mo-chips">${chips}</div>
      </div>
      <table><thead><tr><th>الرقم</th><th>العميل</th><th>التاريخ</th><th>الإجمالي</th>${isInv?'<th>المتبقي</th>':''}<th>الحالة</th><th></th></tr></thead><tbody>${rowsHTML}</tbody></table>
    </div>`;
  }).join('');

  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>${title}</h1><button class="btn btn-gold" onclick="docModal('${type}')">+ ${isInv?'فاتورة':'عرض سعر'}</button></div>
    ${isInv?`<div class="badge-note"><i data-lucide="receipt-text"></i> <div>الفواتير مهيأة للتوافق مع <b>زاتكا</b>: عند الطباعة يُولَّد رمز QR وفق مواصفة TLV. فعّل الضريبة وأدخل رقمك الضريبي من الإعدادات.</div></div>`:''}
    ${!list.length?emptyBox(isInv?'receipt-text':'trending-up',`لا توجد ${title} بعد.`):groupHTML}`;
  refreshIcons();
}
function delDoc(type,id){if(!confirm('تأكيد الحذف؟'))return;const k=type==='invoice'?'invoices':'sales';S[k]=S[k].filter(d=>d.id!==id);save();renderDocs(type)}
function toInvoice(saleId){const s=S.sales.find(x=>x.id===saleId);const ct=S.contacts.find(c=>c.id===s.contactId);const inv={id:uid(),number:++S.counters.invoice,client:s.client,contactId:s.contactId||'',clientVat:(ct&&ct.vat)||'',date:today(),items:JSON.parse(JSON.stringify(s.items)),discType:s.discType||'none',discVal:Number(s.discVal||0),notes:s.notes,status:'unpaid',vat:S.settings.vat.enabled,vatRate:S.settings.vat.rate,paidDate:''};S.invoices.push(inv);bumpStage(inv.contactId,'won','تحويل عرض السعر إلى فاتورة #'+inv.number);save();go('invoicing');alert('تم إنشاء فاتورة من عرض السعر')}
/* ===== قوالب ملاحظات عرض السعر — عربون تلقائي وشروط بلاغة موحّدة ===== */
function quoteDef(){const q=(S.settings&&S.settings.quoteDefaults)||{};return {depositPct:Number(q.depositPct||50),deliveryDays:Number(q.deliveryDays||3),revisions:Number(q.revisions||2),validityDays:Number(q.validityDays||14),defaultTemplateId:q.defaultTemplateId||'video_ad'}}
function quoteTemplates(){if(!S.settings.quoteTemplates||!S.settings.quoteTemplates.length)S.settings.quoteTemplates=[{id:'blank',name:'مخصّص',depositPct:50,deliveryDays:3,revisions:2,validityDays:14,template:''}];return S.settings.quoteTemplates}
function quoteTemplateById(id){return quoteTemplates().find(t=>t.id===id)||quoteTemplates()[0]}
function docTotalFull(d){const net=docTotal(d);const tax=d.vat?net*(Number(d.vatRate||0)/100):0;return net+tax}
function resolveQuoteNotes(d,raw){
  const t=quoteTemplateById(d.templateId||quoteDef().defaultTemplateId);
  const total=docTotalFull(d);
  const pct=Number(d.depositPct!=null?d.depositPct:t.depositPct);
  const deposit=Math.max(0,total*pct/100);const remaining=Math.max(0,total-deposit);
  return String(raw||'')
    .replace(/\{DEPOSIT_PCT\}/g,String(pct))
    .replace(/\{DEPOSIT_AMOUNT\}/g,money(deposit))
    .replace(/\{REMAINING\}/g,money(remaining))
    .replace(/\{TOTAL\}/g,money(total))
    .replace(/\{DELIVERY_DAYS\}/g,String(t.deliveryDays||0))
    .replace(/\{REVISIONS\}/g,String(t.revisions||0))
    .replace(/\{VALIDITY_DAYS\}/g,String(t.validityDays||14))
    .replace(/\{BRAND\}/g,(S.settings&&S.settings.brand)||'');
}
function buildInitialQuoteNotes(d){
  const t=quoteTemplateById(d.templateId||quoteDef().defaultTemplateId);
  const perProduct=[];const seen=new Set();
  (d.items||[]).forEach(it=>{if(it.productId){const p=(S.products||[]).find(x=>x.id===it.productId);if(p&&p.notes&&!seen.has(p.id)){seen.add(p.id);perProduct.push('— '+(p.name||'')+':\n'+String(p.notes).trim())}}});
  return (perProduct.length?perProduct.join('\n\n')+'\n\n':'')+(t.template||'');
}
function pickTemplateFromProducts(d){
  // أول منتج له templateId يحدّد القالب — وإلا يبقى المختار الحالي
  for(const it of (d.items||[])){if(it.productId){const p=(S.products||[]).find(x=>x.id===it.productId);if(p&&p.templateId)return p.templateId;}}
  return null;
}

/* ===== ملفات هويّة الطباعة (Brand Profiles) — قوالب تصميم متعدّدة ===== */
function brandProfiles(){if(!S.settings.brandProfiles||!S.settings.brandProfiles.length)S.settings.brandProfiles=[{id:'default',name:S.settings.brand||'مؤسسة',logo:S.settings.logo||'',accent:'#f5a623',accent2:'#d97706',ink:'#0a0a0b',pattern:'sun',tagline:''}];return S.settings.brandProfiles}
function brandById(id){return brandProfiles().find(b=>b.id===id)||brandProfiles()[0]}
function defaultBrandId(){return S.settings.defaultBrandId||brandProfiles()[0].id}
function officialInfo(){const o=S.settings.official||{};const s=S.settings;return {brand:o.brand||s.brand||'',owner:o.owner||s.owner||'',email:o.email||s.email||'',phone:o.phone||s.phone||'',vat:o.vat||s.vat.number||'',cr:o.cr||s.vat.cr||'',iban:o.iban||s.iban||'',address:o.address||''}}
/* الحساب البنكي الأساسي للمؤسسة — يُعتمد افتراضياً في كل مستند بلا إدخال يدويّ */
const DEFAULT_BANK={name:'البنك الأهلي السعودي',iban:'SA8810000001400036240910',accName:'مؤسسة حروف و دروس',logo:'/app/snb-logo.png'};
function bankInfo(org){const s=S.settings;const ibn=(org&&org.iban)||s.iban||DEFAULT_BANK.iban;return {name:s.bankName||DEFAULT_BANK.name,iban:ibn,accName:s.accName||DEFAULT_BANK.accName,logo:s.bankLogo||DEFAULT_BANK.logo};}
/* كتلة الدفع في المستند: بيانات البنك + آيبان قابل للنسخ + باركود رابط الدفع السريع (قابل للنقر) */
function payBlockHTML(d,org,acc,ink){
  const bk=bankInfo(org);const payUrl=(d.payUrl||'').trim();
  const qrSrc=(d.payQr||'').trim();
  let qr='';
  if(qrSrc){qr=`<img src="${esc(qrSrc)}" style="width:96px;height:96px;object-fit:contain;display:block">`;}
  else if(payUrl){qr=qrImg(payUrl).replace('<img ','<img style="width:96px;height:96px" ');}
  const qrCell=qr?`<a href="${esc(payUrl||'#')}" target="_blank" style="flex:none;text-align:center;text-decoration:none">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:6px">${qr}</div>
        <div style="font-size:10px;color:${acc};font-weight:800;margin-top:4px">ادفع الآن — امسح أو اضغط</div></a>`:'';
  const logo=bk.logo?`<img src="${esc(bk.logo)}" style="height:30px;object-fit:contain;flex:none">`:'';
  const ibanClean=bk.iban.replace(/\s+/g,'');
  return `<div style="margin-top:14px;padding:14px 16px;background:#f8fafc;border-right:3px solid ${acc};border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:16px">
      <div style="flex:1;min-width:0;color:#334155;font-size:13px;line-height:1.9">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:1.5px;margin-bottom:6px">بيانات الدفع</div>
        <div style="display:flex;align-items:center;gap:10px">${logo}<div><div style="font-weight:800;color:${ink}">${esc(bk.name)}</div>${bk.accName?`<div style="color:#64748b;font-size:12px">${esc(bk.accName)}</div>`:''}</div></div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="color:#64748b">آيبان:</span>
          <b dir="ltr" style="letter-spacing:.5px">${esc(bk.iban)}</b>
          <button type="button" onclick="(function(b){navigator.clipboard&&navigator.clipboard.writeText('${esc(ibanClean)}');b.textContent='✔ نُسخ';setTimeout(()=>b.textContent='نسخ',1500)})(this)" style="cursor:pointer;border:1px solid ${acc};background:#fff;color:${acc};border-radius:6px;padding:2px 10px;font-size:11px;font-weight:800;font-family:inherit">نسخ</button>
        </div>
      </div>
      ${qrCell}
    </div>`;
}
/* بيانات المؤسسة الظاهرة على المستند: أولوية لبيانات التصميم نفسه، ثم العامة الرسمية */
function designOrg(b){const o=(b&&b.org)||{};const off=officialInfo();return {
  brand:o.brand||off.brand,owner:(o.owner!=null&&o.owner!=='')?o.owner:off.owner,email:o.email||off.email,
  phone:o.phone||off.phone,iban:o.iban||off.iban,cr:o.cr||off.cr,vat:o.vat||off.vat,address:o.address||off.address};}
/* أنماط زخرفية (SVG inline) — تظهر أسفل الغلاف وفوق ترويسة المستند */
/* موتيفات احترافية خفيفة — تُوضع كطبقة شفّافة فوق المنطقة الملوّنة (أبيض بشفافية منخفضة).
   بسيطة ورسمية تناسب الشركات — بلا حروف أو شموس. */
let _mid=0;
function brandMotif(b){
  const pat=b.pattern||'none';if(pat==='none')return '';
  const id='m'+(++_mid);
  if(pat==='lines')return `<svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="24" fill="#fff" fill-opacity=".05"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  if(pat==='dots')return `<svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><defs><pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#fff" fill-opacity=".14"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  if(pat==='grid')return `<svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><defs><pattern id="${id}" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  if(pat==='arcs')return `<svg width="100%" height="100%" viewBox="0 0 800 420" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><g fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="1.4"><circle cx="720" cy="80" r="90"/><circle cx="720" cy="80" r="150"/><circle cx="720" cy="80" r="210"/><circle cx="720" cy="80" r="270"/></g></svg>`;
  // glow — إضاءة قطرية ناعمة راقية
  return `<svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><defs><radialGradient id="${id}" cx="0.85" cy="0.2" r="0.9"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
}
function brandPatternTop(b){return brandMotif(b);}
/* مدير ملفات البراند */
let _BMGR={sel:''};
function brandProfilesManager(){
  _BMGR.sel=defaultBrandId();
  const body=()=>{const brs=brandProfiles();const b=brandById(_BMGR.sel)||brs[0];_BMGR.sel=b.id;const off=officialInfo();
    const list=brs.map(x=>{const on=x.id===_BMGR.sel;return `<button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:space-between;text-align:right" onclick="bmgrPick('${esc(x.id)}')">${esc(x.name)}<span style="width:16px;height:16px;border-radius:4px;background:linear-gradient(135deg,${x.accent},${x.accent2||x.accent})"></span></button>`}).join('');
    return `<div class="badge-note"><i data-lucide="palette"></i><div>كل براند = هويّة كاملة لعرض السعر/الفاتورة (شعار، لون، نقش). البيانات الرسمية أدناه تظهر أسفل كل مستند مهما كان البراند المختار.</div></div>
      <div class="row2" style="align-items:flex-start">
        <div class="field" style="min-width:210px">
          <label style="display:flex;justify-content:space-between;align-items:center"><span>البراندات</span>
            <button class="btn btn-ghost btn-sm" onclick="bmgrAdd()"><i data-lucide="plus"></i> جديد</button></label>
          <div style="display:flex;flex-direction:column;gap:6px;max-height:420px;overflow:auto">${list}</div>
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">
            <div style="font-weight:800;font-size:13px;margin-bottom:8px"><i class="inl" data-lucide="landmark"></i> البيانات الرسمية (تظهر أسفل كل مستند)</div>
            <div class="field"><label>الاسم الرسمي</label><input id="off_brand" value="${esc(off.brand)}"></div>
            <div class="row2"><div class="field"><label>س.ت</label><input id="off_cr" value="${esc(off.cr)}"></div><div class="field"><label>الرقم الضريبي</label><input id="off_vat" value="${esc(off.vat)}"></div></div>
            <div class="row2"><div class="field"><label>البريد</label><input id="off_email" value="${esc(off.email)}"></div><div class="field"><label>الجوّال/واتساب</label><input id="off_phone" value="${esc(off.phone)}"></div></div>
            <div class="field"><label>IBAN</label><input id="off_iban" value="${esc(off.iban)}" dir="ltr"></div>
            <div class="field"><label>العنوان</label><input id="off_addr" value="${esc(off.address)}"></div>
            <button class="btn btn-gold btn-sm" onclick="bmgrSaveOfficial()"><i data-lucide="save"></i> حفظ الرسمية</button>
          </div>
        </div>
        <div style="flex:1;min-width:260px">
          <div class="field"><label>اسم البراند</label><input id="bm_name" value="${esc(b.name||'')}"></div>
          <div class="field"><label>وسم (يظهر تحت الاسم على الغلاف)</label><input id="bm_tag" value="${esc(b.tagline||'')}"></div>
          <div class="field"><label>الشعار</label>
            <input type="file" accept="image/*" id="bm_logo_file" onchange="bmgrUploadLogo()">
            <input id="bm_logo" value="${esc(b.logo||'')}" placeholder="مسار / رابط الشعار — يقبل data URL">
            ${b.logo?`<img src="${esc(b.logo)}" style="max-height:60px;margin-top:8px;background:#fff;border-radius:8px;padding:6px">`:''}
          </div>
          <div class="row2">
            <div class="field"><label>اللون الرئيسي</label><input id="bm_c1" type="color" value="${esc(b.accent||'#f5a623')}"></div>
            <div class="field"><label>اللون الثانوي</label><input id="bm_c2" type="color" value="${esc(b.accent2||b.accent||'#d97706')}"></div>
          </div>
          <div class="field"><label>النقش الزخرفي</label>
            <select id="bm_pat">
              <option value="sun" ${b.pattern==='sun'?'selected':''}>دوائر شمسية</option>
              <option value="letters" ${b.pattern==='letters'?'selected':''}>حروف عربية</option>
              <option value="grid" ${b.pattern==='grid'?'selected':''}>شبكة هندسية</option>
            </select>
          </div>
          <div style="margin:10px 0;padding:12px;border:1px dashed var(--line);border-radius:10px">
            <div style="font-size:12px;color:var(--muted);margin-bottom:6px">معاينة</div>
            <div style="border-radius:10px;overflow:hidden">${brandPatternTop(b)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-gold btn-sm" onclick="bmgrSave()"><i data-lucide="save"></i> حفظ التعديلات</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="bmgrDel()"${brs.length<=1?' disabled':''}><i data-lucide="trash-2"></i> حذف</button>
            <button class="btn btn-ghost btn-sm" onclick="bmgrSetDefault()"${defaultBrandId()===b.id?' disabled':''}><i data-lucide="check-circle"></i> اجعله الافتراضي</button>
            <span style="align-self:center;color:var(--muted);font-size:12px">${defaultBrandId()===b.id?'★ افتراضي':''}</span>
          </div>
        </div>
      </div>`};
  openModal('إدارة ملفات البراند',body(),null);
  window.bmgrPick=id=>{bmgrPersist();_BMGR.sel=id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.bmgrAdd=()=>{bmgrPersist();const id='b_'+uid();const base=brandById(_BMGR.sel);brandProfiles().push({id,name:'براند جديد',tagline:'',logo:'',accent:base.accent,accent2:base.accent2,ink:base.ink,pattern:base.pattern});save();_BMGR.sel=id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.bmgrSave=()=>{bmgrPersist();alert('حُفظ ✓');document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.bmgrDel=()=>{const brs=brandProfiles();if(brs.length<=1)return;const b=brandById(_BMGR.sel);if(!confirm('حذف براند «'+b.name+'»؟'))return;S.settings.brandProfiles=brs.filter(x=>x.id!==_BMGR.sel);if(defaultBrandId()===_BMGR.sel)S.settings.defaultBrandId=brandProfiles()[0].id;save();_BMGR.sel=brandProfiles()[0].id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.bmgrSetDefault=()=>{bmgrPersist();S.settings.defaultBrandId=_BMGR.sel;save();document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.bmgrSaveOfficial=()=>{if(!S.settings.official)S.settings.official={};const g=i=>document.getElementById(i).value;S.settings.official={brand:g('off_brand'),cr:g('off_cr'),vat:g('off_vat'),email:g('off_email'),phone:g('off_phone'),iban:g('off_iban'),address:g('off_addr')};save();alert('حُفظت البيانات الرسمية ✓');};
  window.bmgrPersist=()=>{const b=brandById(_BMGR.sel);if(!b)return;const g=i=>document.getElementById(i);if(!g('bm_name'))return;b.name=g('bm_name').value.trim()||b.name;b.tagline=g('bm_tag').value;b.logo=g('bm_logo').value;b.accent=g('bm_c1').value;b.accent2=g('bm_c2').value;b.pattern=g('bm_pat').value;save();};
  window.bmgrUploadLogo=()=>{const f=document.getElementById('bm_logo_file').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const inp=document.getElementById('bm_logo');if(inp){inp.value=e.target.result;bmgrPersist();document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();}};r.readAsDataURL(f);};
}

/* شريط سفلي رفيع أنيق — بديل النقش السميك، لا يتداخل مع النصوص */
function footerBar(acc,acc2){return `<div style="height:7px;background:linear-gradient(90deg,${acc},${acc2});flex:none"></div>`;}
function brandPatternBottom(b){return footerBar(b.accent||'#f5a623',b.accent2||b.accent||'#d97706');}
/* ===== مكتبة قوالب الشروط — إدارة، إضافة، تحرير، حذف ===== */
let _QMGR={sel:''};
function quoteTemplateManager(currentId,onPick){
  _QMGR.sel=currentId||quoteDef().defaultTemplateId;_QMGR.onPick=onPick;
  const body=()=>{const tpls=quoteTemplates();const t=quoteTemplateById(_QMGR.sel)||tpls[0];_QMGR.sel=t.id;
    const list=tpls.map(x=>{const on=x.id===_QMGR.sel;return `<button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:space-between;text-align:right" onclick="qmgrPick('${esc(x.id)}')">${esc(x.name)}<span style="opacity:.55;font-size:11px">${x.deliveryDays||0}ي · ${x.depositPct||0}%</span></button>`}).join('');
    return `<div class="badge-note"><i data-lucide="info"></i><div>اختر قالباً لعرض السعر، أو أنشئ قالباً جديداً وأعد استعماله لاحقاً. الرموز: <code>{DEPOSIT_PCT}</code>، <code>{DEPOSIT_AMOUNT}</code>، <code>{REMAINING}</code>، <code>{TOTAL}</code>، <code>{DELIVERY_DAYS}</code>، <code>{REVISIONS}</code>، <code>{VALIDITY_DAYS}</code>، <code>{BRAND}</code>.</div></div>
      <div class="row2" style="align-items:flex-start">
        <div class="field" style="min-width:210px">
          <label style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap"><span>القوالب</span>
            <button class="btn btn-ghost btn-sm" onclick="qmgrAdd()"><i data-lucide="plus"></i> جديد</button></label>
          <div style="display:flex;flex-direction:column;gap:6px;max-height:420px;overflow:auto">${list}</div>
        </div>
        <div style="flex:1;min-width:260px">
          <div class="field"><label>اسم القالب</label><input id="qmName" value="${esc(t.name||'')}"></div>
          <div class="row2">
            <div class="field"><label>نسبة العربون %</label><input id="qmPct" type="number" min="0" max="100" value="${t.depositPct||50}"></div>
            <div class="field"><label>مدة التسليم (أيام)</label><input id="qmDays" type="number" min="0" value="${t.deliveryDays||0}"></div>
          </div>
          <div class="row2">
            <div class="field"><label>جولات التعديل</label><input id="qmRev" type="number" min="0" value="${t.revisions||0}"></div>
            <div class="field"><label>صلاحية العرض (أيام)</label><input id="qmVal" type="number" min="0" value="${t.validityDays||14}"></div>
          </div>
          <div class="field"><label>نصّ القالب</label><textarea id="qmTxt" rows="12" style="font-family:inherit;line-height:1.7">${esc(t.template||'')}</textarea></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-gold btn-sm" onclick="qmgrSave()"><i data-lucide="save"></i> حفظ التعديلات</button>
            ${t.id!=='blank'?`<button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="qmgrDel()"><i data-lucide="trash-2"></i> حذف</button>`:''}
            <button class="btn btn-ghost btn-sm" onclick="qmgrSetDefault()"${quoteDef().defaultTemplateId===t.id?' disabled':''}><i data-lucide="check-circle"></i> اجعله الافتراضي</button>
            <span style="align-self:center;color:var(--muted);font-size:12px">${quoteDef().defaultTemplateId===t.id?'★ افتراضي حالي':''}</span>
          </div>
        </div>
      </div>`};
  openModal('مكتبة قوالب الشروط',body(),()=>{ if(_QMGR.onPick)_QMGR.onPick(_QMGR.sel); });
  window.qmgrPick=id=>{qmgrPersistEdits();_QMGR.sel=id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.qmgrAdd=()=>{qmgrPersistEdits();const id='tpl_'+uid();const base=quoteTemplateById(_QMGR.sel)||quoteTemplates()[0];quoteTemplates().push({id,name:'قالب جديد',depositPct:base.depositPct||50,deliveryDays:base.deliveryDays||3,revisions:base.revisions||2,validityDays:base.validityDays||14,template:base.template||''});save();_QMGR.sel=id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.qmgrSave=()=>{qmgrPersistEdits();alert('حُفظت التعديلات ✓');document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.qmgrDel=()=>{const t=quoteTemplateById(_QMGR.sel);if(!t||t.id==='blank')return;if(!confirm('حذف قالب «'+t.name+'»؟'))return;S.settings.quoteTemplates=quoteTemplates().filter(x=>x.id!==_QMGR.sel);if(quoteDef().defaultTemplateId===_QMGR.sel)S.settings.quoteDefaults.defaultTemplateId=(quoteTemplates()[0]||{id:'blank'}).id;save();_QMGR.sel=(quoteTemplates()[0]||{id:'blank'}).id;document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.qmgrSetDefault=()=>{qmgrPersistEdits();if(!S.settings.quoteDefaults)S.settings.quoteDefaults={};S.settings.quoteDefaults.defaultTemplateId=_QMGR.sel;save();document.querySelector('#modalRoot .modal-body').innerHTML=body();refreshIcons();};
  window.qmgrPersistEdits=()=>{const t=quoteTemplateById(_QMGR.sel);if(!t)return;const g=i=>document.getElementById(i);if(!g('qmName'))return;t.name=g('qmName').value.trim()||t.name;t.depositPct=Number(g('qmPct').value||0);t.deliveryDays=Number(g('qmDays').value||0);t.revisions=Number(g('qmRev').value||0);t.validityDays=Number(g('qmVal').value||14);t.template=g('qmTxt').value;save();};
}
function docModal(type,id,presetName,cb){
  const isInv=type==='invoice';const k=isInv?'invoices':'sales';
  const _defTplId=quoteDef().defaultTemplateId;const _defTpl=quoteTemplateById(_defTplId);
  let d=id?JSON.parse(JSON.stringify(S[k].find(x=>x.id===id))):
    {id:'',number:S.counters[type]+1,client:'',clientVat:'',date:today(),expiry:isInv?'':(function(){const dd=new Date();dd.setDate(dd.getDate()+Number(_defTpl.validityDays||14));return dd.toISOString().slice(0,10)})(),salesperson:S.settings.salesperson||'',items:[{desc:'',qty:1,price:0,discount:0}],discType:'none',discVal:0,notes:'',notesAuto:!isInv,templateId:isInv?null:_defTplId,depositPct:isInv?null:Number(_defTpl.depositPct||50),brandId:defaultBrandId(),status:isInv?'unpaid':'draft',vat:S.settings.vat.enabled,vatRate:S.settings.vat.rate,paidDate:'',payments:[],payUrl:'',payQr:''};
  if(d.payUrl===undefined)d.payUrl='';if(d.payQr===undefined)d.payQr='';
  if(!id&&presetName){d.client=presetName;const pc=S.contacts.find(c=>(c.name||'').trim().toLowerCase()===presetName.trim().toLowerCase());if(pc){d.contactId=pc.id;if(pc.vat)d.clientVat=pc.vat}}
  if(d.vat===undefined)d.vat=false;
  // ملء تلقائي للملاحظات لعرض السعر الجديد فقط
  if(!id&&!isInv&&!d.notes){d.notes=buildInitialQuoteNotes(d);d.notesAuto=true;}
  const statuses=isInv?['unpaid','partial','paid']:['draft','sent','sale','cancel'];
  function body(){const sub=docTotal(d);const tax=d.vat?sub*(Number(d.vatRate||0)/100):0;
    return `<div class="row2"><div class="field"><label>العميل</label>${clientFieldHTML('d_client',resolveClientName(d))}</div>
    <div class="field"><label>التاريخ</label><input type="date" id="d_date" value="${d.date}"></div></div>
    <div class="row2"><div class="field"><label>مندوب المبيعات</label><input id="d_sp" value="${esc(d.salesperson||'')}"></div>
    <div class="field"><label>${isInv?'تاريخ الاستحقاق':'صلاحية العرض حتى'}</label><input type="date" id="d_expiry" value="${esc(d.expiry||'')}"></div></div>
    ${isInv?`<div class="field"><label>الرقم الضريبي للعميل (اختياري — B2B)</label><input id="d_cvat" value="${esc(d.clientVat)}"></div>`:''}
    <div class="field"><label>البنود</label>
    <table class="items-tbl"><thead><tr><th>الوصف</th><th style="width:54px">كمية</th><th style="width:88px">السعر</th><th style="width:56px">خصم%</th><th style="width:90px">المجموع</th><th></th></tr></thead><tbody id="itemsBody">
    ${d.items.map((it,i)=>`<tr><td><input data-i="${i}" data-f="desc" value="${esc(it.desc)}" placeholder="عنوان الخدمة"></td>
    <td><input data-i="${i}" data-f="qty" type="number" inputmode="decimal" min="0" value="${it.qty}" onfocus="this.select()"></td>
    <td><input data-i="${i}" data-f="price" type="number" inputmode="decimal" min="0" value="${it.price}" onfocus="this.select()"></td>
    <td><input data-i="${i}" data-f="discount" type="number" inputmode="decimal" min="0" max="100" value="${it.discount||0}" onfocus="this.select()"></td>
    <td style="white-space:nowrap" data-total="${i}">${money(lineTotal(it))}</td>
    <td><button class="link-btn del" onclick="rmItem(${i})">×</button></td></tr>
    <tr><td colspan="6" style="padding-top:0;padding-bottom:8px"><input data-i="${i}" data-f="details" value="${esc(it.details||'')}" placeholder="↳ تفاصيل تحت الخدمة (اختياري)…" style="font-size:13px;color:var(--muted);background:transparent;border:none;border-bottom:1px dashed var(--line);border-radius:0;padding:5px 4px"></td></tr>`).join('')}
    </tbody></table><button class="link-btn" onclick="addItem()">+ بند</button>
    ${(S.products&&S.products.length)?`<span style="color:var(--muted);font-size:12px;margin:0 8px">أضف من المنتجات:</span><select onchange="if(this.value){addProduct(this.value);this.value=''}" style="width:auto;display:inline-block;padding:7px 10px"><option value="">— اختر منتجاً —</option>${S.products.map(p=>`<option value="${p.id}">${esc(p.name)} (${money(p.price)})</option>`).join('')}</select>`:''}</div>
    <div class="row2"><div class="field"><label>الحالة</label><select id="d_status">${statuses.map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${ST[s]||s}</option>`).join('')}</select></div>
    <div class="field"><label>ضريبة القيمة المضافة</label><select id="d_vat" onchange="toggleVat(this.value)"><option value="0" ${!d.vat?'selected':''}>بدون ضريبة</option><option value="1" ${d.vat?'selected':''}>تطبيق ${d.vatRate}%</option></select></div></div>
    <div class="row2"><div class="field"><label>خصم إجمالي على العرض</label><select id="d_disctype" onchange="docDisc()"><option value="none" ${(d.discType||'none')==='none'?'selected':''}>بدون</option><option value="percent" ${d.discType==='percent'?'selected':''}>نسبة %</option><option value="amount" ${d.discType==='amount'?'selected':''}>مبلغ ثابت (${esc(S.settings.currency)})</option></select></div>
    <div class="field"><label>قيمة الخصم</label><input id="d_discval" type="number" inputmode="decimal" min="0" value="${d.discVal||0}" onfocus="this.select()" oninput="docDisc()" ${(d.discType||'none')==='none'?'disabled':''}></div></div>
    <div class="row2">
      <div class="field"><label>هويّة الطباعة (التصميم)</label>
        <select id="d_brand" class="field" onchange="qBrandChange(this.value)">${brandProfiles().map((b,i)=>`<option value="${esc(b.id)}" ${(d.brandId||defaultBrandId())===b.id?'selected':''}>${esc(b.name&&b.name.trim()?b.name:('تصميم '+(i+1)))}</option>`).join('')}</select>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">يحدّد شكل الغلاف والألوان والشعار عند الطباعة/الإرسال — البيانات الرسمية تظهر أسفل الغلاف مهما كان التصميم.</div>
      </div>
      <div class="field" style="display:flex;flex-direction:column;justify-content:flex-end">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal();go('quotedesign')"><i data-lucide="palette"></i> تصميم عروض الأسعار</button>
      </div>
    </div>
    <div class="field"><label style="display:flex;align-items:center;gap:6px"><i class="inl" data-lucide="qr-code"></i> رابط الدفع السريع + باركود <span style="font-weight:400;color:var(--muted);font-size:11px">(خاص بهذا العميل والمبلغ)</span></label>
      <input id="d_payurl" value="${esc(d.payUrl||'')}" dir="ltr" placeholder="https://secure.telr.com/gateway/ql/..." oninput="qPayUrl(this.value)">
      <div style="font-size:11px;color:var(--muted);margin-top:4px">الصق رابط الدفع من البوابة — يتحوّل تلقائياً إلى باركود قابل للمسح والنقر داخل ملف PDF. كل عرض له رابطه ومبلغه.</div>
      <div style="display:flex;align-items:center;gap:14px;margin-top:8px;flex-wrap:wrap">
        <div><input type="file" accept="image/*" id="d_payqr_file" onchange="qPayQrUpload(event)"><div style="font-size:11px;color:var(--muted);margin-top:2px">أو ارفع صورة الباركود (PNG من البوابة) بدل توليده</div></div>
        <div id="qPayQrPrev">${d.payQr?`<span style="display:inline-flex;align-items:center;gap:8px"><img src="${esc(d.payQr)}" style="width:64px;height:64px;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px"><button type="button" class="link-btn del" onclick="qPayQrClear()">حذف</button></span>`:''}</div>
      </div>
    </div>
    ${isInv?'':`
    <div class="row2">
      <div class="field"><label>قالب الشروط</label>
        <select id="d_tpl" onchange="qTplChange(this.value)">${quoteTemplates().map(t=>`<option value="${esc(t.id)}" ${d.templateId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>
      </div>
      <div class="field"><label>نسبة العربون %</label><input id="d_deppct" type="number" inputmode="decimal" min="0" max="100" value="${d.depositPct!=null?d.depositPct:quoteDef().depositPct}" oninput="qDepChange(this.value)"></div>
    </div>
    <div class="field"><label style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
      <span>الملاحظات — الشروط والأحكام</span>
      <span style="display:flex;gap:6px;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost btn-sm" onclick="qNotesReset()"><i data-lucide="rotate-ccw"></i> إعادة توليد</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="qMgrOpen()" title="مكتبة القوالب"><i data-lucide="library"></i> مكتبة القوالب</button>
      </span>
    </label></div>`}
    <div class="field">${isInv?'<label>ملاحظات</label>':''}<textarea id="d_notes" rows="${isInv?2:8}" oninput="qNotesLive()">${esc(d.notes)}</textarea>
      ${isInv?'':`<div id="qNotesPv" style="margin-top:8px;padding:10px 12px;background:rgba(245,166,35,.08);border:1px dashed rgba(245,166,35,.35);border-radius:10px;font-size:12.5px;color:var(--ink);white-space:pre-wrap;line-height:1.7"></div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px"><i class="inl" data-lucide="eye"></i> معاينة حيّة — القيم بين المعقوفات {} تتحوّل تلقائياً إلى أرقام حسب الإجمالي الحالي، وتظل كذلك عند الطباعة والإرسال.</div>`}
    </div>
    <div class="totals" id="docTotals">${totalsHTML()}</div>`;}
  function totalsHTML(){const gross=docGross(d),lineSub=docLineSubtotal(d),lineDisc=gross-lineSub,ovr=docOverallDisc(d),net=lineSub-ovr,tax=d.vat?net*(Number(d.vatRate||0)/100):0,total=net+tax;
    return `${lineDisc>0.001?`<div class="line"><span>إجمالي البنود قبل الخصم</span><span>${money(gross)}</span></div><div class="line" style="color:var(--good)"><span>خصم البنود</span><span>- ${money(lineDisc)}</span></div>`:''}
    <div class="line"><span>المجموع الفرعي</span><span>${money(lineSub)}</span></div>
    ${ovr>0.001?`<div class="line" style="color:var(--good)"><span>خصم إجمالي${d.discType==='percent'?' ('+Number(d.discVal||0)+'%)':''}</span><span>- ${money(ovr)}</span></div>`:''}
    <div class="line"><span>الضريبة (${d.vat?d.vatRate:0}%)</span><span>${money(tax)}</span></div>
    <div class="line grand"><span>الإجمالي</span><span>${money(total)}</span></div>`;}
  function updateTotals(){const el=document.getElementById('docTotals');if(el)el.innerHTML=totalsHTML();paintQNotesPreview();}
  function paintQNotesPreview(){if(isInv)return;const pv=document.getElementById('qNotesPv');if(!pv)return;const ta=document.getElementById('d_notes');const raw=ta?ta.value:(d.notes||'');pv.textContent=resolveQuoteNotes(d,raw)||'—';}
  window.docDisc=()=>{const t=document.getElementById('d_disctype'),v=document.getElementById('d_discval');if(t)d.discType=t.value;if(v){d.discVal=Number(v.value||0);v.disabled=(d.discType||'none')==='none'}updateTotals()};
  window.qNotesLive=()=>{const ta=document.getElementById('d_notes');if(ta){d.notes=ta.value;d.notesAuto=false}paintQNotesPreview();};
  window.qDepChange=v=>{d.depositPct=Number(v||0);paintQNotesPreview();};
  window.qTplChange=id=>{d.templateId=id;const t=quoteTemplateById(id);d.depositPct=Number(t.depositPct||50);const dep=document.getElementById('d_deppct');if(dep)dep.value=d.depositPct;if(d.notesAuto){d.notes=buildInitialQuoteNotes(d);const ta=document.getElementById('d_notes');if(ta)ta.value=d.notes;}paintQNotesPreview();};
  window.qNotesReset=()=>{if(!confirm('استبدال الملاحظات الحالية بالقالب المختار مع ملاحظات المنتجات؟'))return;collect();d.notes=buildInitialQuoteNotes(d);d.notesAuto=true;const ta=document.getElementById('d_notes');if(ta)ta.value=d.notes;paintQNotesPreview();};
  window.qMgrOpen=()=>quoteTemplateManager(d.templateId,newId=>{d.templateId=newId;const sel=document.getElementById('d_tpl');if(sel){/* أعِد بناء القائمة */sel.innerHTML=quoteTemplates().map(t=>`<option value="${esc(t.id)}" ${d.templateId===t.id?'selected':''}>${esc(t.name)}</option>`).join('');}qTplChange(newId);});
  window.qBrandChange=id=>{d.brandId=id;};
  window.qPayUrl=v=>{d.payUrl=v;};
  window.qPayQrUpload=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{d.payQr=r.result;const pv=document.getElementById('qPayQrPrev');if(pv)pv.innerHTML=`<span style="display:inline-flex;align-items:center;gap:8px"><img src="${d.payQr}" style="width:64px;height:64px;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px"><button type="button" class="link-btn del" onclick="qPayQrClear()">حذف</button></span>`;};r.readAsDataURL(f);};
  window.qPayQrClear=()=>{d.payQr='';const pv=document.getElementById('qPayQrPrev');if(pv)pv.innerHTML='';const f=document.getElementById('d_payqr_file');if(f)f.value='';};
  openModal(`${id?'تعديل':'جديد'} — ${isInv?'فاتورة':'عرض سعر'} #${d.number}`,body(),()=>{collect();d.contactId=findOrCreateContact(d.client);const ct=S.contacts.find(c=>c.id===d.contactId);if(ct&&ct.vat&&!d.clientVat)d.clientVat=ct.vat;if(d.status==='paid'&&!d.paidDate)d.paidDate=today();S.counters[type]=Math.max(S.counters[type],d.number);
    bumpStage(d.contactId,isInv?'won':'quoted',isInv?('فاتورة #'+d.number):('عرض سعر #'+d.number));if(id){const idx=S[k].findIndex(x=>x.id===id);S[k][idx]=d}else{d.id=uid();S[k].push(d)}save();closeModal();(cb||(()=>renderDocs(type)))()});
  window.addItem=()=>{collect();d.items.push({desc:'',qty:1,price:0,discount:0});refresh()};
  window.addProduct=pid=>{collect();const p=(S.products||[]).find(x=>x.id===pid);if(!p)return;const line={desc:p.name,qty:1,price:Number(p.price||0),discount:0,details:p.desc||'',productId:p.id};if(d.items.length===1&&!d.items[0].desc)d.items[0]=line;else d.items.push(line);if(!isInv){const auto=pickTemplateFromProducts(d);if(auto&&auto!==d.templateId){d.templateId=auto;const t=quoteTemplateById(auto);if(t)d.depositPct=Number(t.depositPct||50);}if(d.notesAuto)d.notes=buildInitialQuoteNotes(d);}refresh()};
  window.rmItem=i=>{collect();d.items.splice(i,1);if(!d.items.length)d.items.push({desc:'',qty:1,price:0,discount:0});if(!isInv&&d.notesAuto){d.notes=buildInitialQuoteNotes(d);}refresh()};
  window.toggleVat=v=>{collect();d.vat=v==='1';refresh()};
  function collect(){const g=i=>document.getElementById(i);if(g('d_client')){d.client=g('d_client').value;d.date=g('d_date').value;d.status=g('d_status').value;d.notes=g('d_notes').value;d.vat=g('d_vat').value==='1';if(g('d_cvat'))d.clientVat=g('d_cvat').value;if(g('d_sp'))d.salesperson=g('d_sp').value;if(g('d_expiry'))d.expiry=g('d_expiry').value;if(g('d_disctype'))d.discType=g('d_disctype').value;if(g('d_discval'))d.discVal=Number(g('d_discval').value||0);if(g('d_deppct'))d.depositPct=Number(g('d_deppct').value||0);if(g('d_brand'))d.brandId=g('d_brand').value;if(g('d_payurl'))d.payUrl=g('d_payurl').value;}document.querySelectorAll('#itemsBody input').forEach(inp=>{const i=+inp.dataset.i,f=inp.dataset.f;if(d.items[i])d.items[i][f]=inp.value})}
  function refresh(){document.querySelector('#modalRoot .modal-body').innerHTML=body();setTimeout(paintQNotesPreview,0);}
  setTimeout(()=>{paintQNotesPreview();const mb=document.querySelector('#modalRoot .modal-body');if(!mb)return;mb.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.f===undefined||!t.closest('#itemsBody'))return;const i=+t.dataset.i,f=t.dataset.f;if(d.items[i])d.items[i][f]=t.value;if(f==='qty'||f==='price'||f==='discount'){const cell=mb.querySelector('#itemsBody [data-total="'+i+'"]');if(cell)cell.textContent=money(lineTotal(d.items[i]));updateTotals();}});},0);
}

/* ===== ZATCA QR ===== */
function tlv(tag,val){const b=new TextEncoder().encode(val);return [tag,b.length,...b]}
function zatcaBase64(seller,vatNo,iso,total,vat){const bytes=[...tlv(1,seller),...tlv(2,vatNo),...tlv(3,iso),...tlv(4,total),...tlv(5,vat)];let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin)}
function qrImg(text){try{const q=qrcode(0,'M');q.addData(text);q.make();return q.createImgTag(4,8)}catch(e){return '<div style="font-size:9px;word-break:break-all;max-width:130px">'+esc(text)+'</div>'}}

/* ===== PRINT — صفحة غلاف بهويّة البراند + صفحة المستند (بلا أي ذكر للنظام) ===== */
function printDocHTML(type,id,previewBrand){
  const isInv=type==='invoice';const isCredit=type==='credit';const d=(isInv?S.invoices:isCredit?S.credits:S.sales).find(x=>x.id===id);
  const s=S.settings;const b=previewBrand||brandById(d.brandId||defaultBrandId());const org=designOrg(b);
  const acc=b.accent||'#f5a623',acc2=b.accent2||b.accent||'#d97706',ink=b.ink||'#0a0a0b';
  const coverStyle=b.coverStyle||'classic';const showPat=b.showPattern!==false;const showQR=b.showQR!==false;
  const gross=docGross(d);const lineSub=docLineSubtotal(d);const lineDisc=gross-lineSub;const ovr=docOverallDisc(d);const net=lineSub-ovr;const tax=d.vat?net*(Number(d.vatRate||0)/100):0;const total=net+tax;const disc=lineDisc;const paid=isInv?invPaid(d):0;const due=isInv?Math.max(0,total-paid):0;
  const kind=isInv?(d.vat?'فاتورة ضريبية':'فاتورة'):isCredit?'إشعار دائن':'عرض سعر';
  const titleText=(b.titleText&&String(b.titleText).trim())?String(b.titleText).trim():kind;
  const titleSize=Number(b.titleSize||82);
  const prefix=isInv?(s.invPrefix||'INV-'):isCredit?'CN-':(s.salePrefix||'S');
  const docNo=prefix+String(d.number).padStart(5,'0');
  const ct=S.contacts.find(c=>c.id===d.contactId)||{};const cname=resolveClientName(d);const cvat=d.clientVat||ct.vat||'';const caddr=[ct.company,ct.address,ct.city].filter(Boolean).join('، ');
  let qrBlock='';
  if(showQR&&(isInv||isCredit)){const iso=new Date(d.date+'T12:00:00').toISOString();const b64=zatcaBase64(org.brand||s.vat.sellerName||s.brand,org.vat||s.vat.number||'0000000000000',iso,total.toFixed(2),tax.toFixed(2));qrBlock=`<div style="text-align:center">${qrImg(b64)}<div style="font-size:10px;color:#64748b;margin-top:2px">رمز QR — زاتكا</div></div>`;}
  // ===== كتل مشتركة =====
  const logoTag=(h,onDark)=>b.logo?`<img src="${esc(b.logo)}" style="height:${h}px;max-width:230px;object-fit:contain${onDark?';filter:drop-shadow(0 3px 10px rgba(0,0,0,.22))':''}">`:`<div style="color:${onDark?'#fff':ink};font-weight:900;font-size:26px;letter-spacing:.5px${onDark?';text-shadow:0 2px 8px rgba(0,0,0,.28)':''}">${esc(b.name)}</div>`;
  const clientBlock=(dark)=>`<div style="font-size:11px;color:${dark?'rgba(255,255,255,.7)':'#94a3b8'};font-weight:800;letter-spacing:3px;margin-bottom:6px">مُقدَّم إلى</div>
      <div style="font-size:24px;font-weight:900;color:${dark?'#fff':ink};line-height:1.25">${esc(cname)}</div>
      ${caddr?`<div style="color:${dark?'rgba(255,255,255,.85)':'#475569'};font-size:13px;margin-top:6px;line-height:1.7">${esc(caddr)}</div>`:''}
      ${ct.email?`<div style="color:${dark?'rgba(255,255,255,.85)':'#475569'};font-size:13px;margin-top:2px">${esc(ct.email)}</div>`:''}
      ${ct.phone?`<div style="color:${dark?'rgba(255,255,255,.85)':'#475569'};font-size:13px;margin-top:2px" dir="ltr">${esc(ct.phone)}</div>`:''}`;
  const metaBlock=`<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:14px">
        <div><div style="font-size:10.5px;color:#94a3b8;font-weight:800;letter-spacing:2px">التاريخ</div><div style="font-size:15px;font-weight:800;margin-top:2px;white-space:nowrap" dir="ltr">${esc(d.date)}</div></div>
        ${d.expiry?`<div><div style="font-size:10.5px;color:#94a3b8;font-weight:800;letter-spacing:2px">صالح حتى</div><div style="font-size:15px;font-weight:800;margin-top:2px;white-space:nowrap" dir="ltr">${esc(d.expiry)}</div></div>`:''}
      </div>
      <div style="margin-top:14px;padding:14px 16px;background:linear-gradient(135deg,${acc}18,${acc}08);border:1px solid ${acc}44;border-radius:12px">
        <div style="font-size:10.5px;color:${acc2};font-weight:800;letter-spacing:2px">الإجمالي</div>
        <div style="font-size:26px;font-weight:900;color:${acc2};margin-top:2px;white-space:nowrap">${money(total)}</div>
      </div>`;
  const officialFooter=`<div style="height:1px;background:linear-gradient(90deg,transparent,${acc}66,transparent);margin-bottom:18px"></div>
      <div style="color:#64748b;font-size:12px;line-height:1.9">
        <div style="font-weight:800;color:${ink};font-size:13.5px;margin-bottom:4px">${esc(org.brand)}</div>
        ${org.owner?`${esc(org.owner)}`:''}${org.email?(org.owner?' · ':'')+esc(org.email):''}${org.phone?' · <span dir="ltr">'+esc(org.phone)+'</span>':''}
        ${org.address?`<br>${esc(org.address)}`:''}
        <br>آيبان: <span dir="ltr">${esc(bankInfo(org).iban)}</span> · ${esc(bankInfo(org).name)}
        ${org.cr||org.vat?`<br>${org.cr?'س.ت '+esc(org.cr):''}${org.cr&&org.vat?' · ':''}${org.vat?'الرقم الضريبي '+esc(org.vat):''}`:''}
      </div>`;
  const titleTag=(color,shadow)=>`<div class="headline" style="font-size:${titleSize}px;font-weight:900;line-height:1;margin:0;letter-spacing:-1px;color:${color}${shadow?';text-shadow:0 4px 14px rgba(0,0,0,.25)':''}">${esc(titleText)}</div>`;
  const docNoChip=(dark)=>`<div style="display:inline-block;margin-top:16px;padding:7px 22px;border:2px solid ${dark?'rgba(255,255,255,.6)':acc};border-radius:30px;font-size:15px;font-weight:700;letter-spacing:3px;color:${dark?'#fff':acc2}" dir="ltr">${esc(docNo)}</div>`;
  // ===== أنماط الغلاف (٦ أنماط رسمية) =====
  const infoRow=(pad)=>`<div style="padding:${pad};display:grid;grid-template-columns:1.4fr 1fr;gap:36px;color:${ink}"><div>${clientBlock(false)}</div><div style="border-right:2px solid ${acc}33;padding-right:24px">${metaBlock}</div></div>`;
  const brandName=(dark)=>`<div style="text-align:left;color:${dark?'#fff':ink}"><div style="font-weight:900;font-size:15px;letter-spacing:.3px">${esc(b.name)}</div>${b.tagline?`<div style="font-size:11.5px;${dark?'opacity:.9':'color:#64748b'};margin-top:3px;max-width:230px">${esc(b.tagline)}</div>`:''}</div>`;
  const footerBlock=(pad)=>`<div style="padding:${pad};margin-top:auto">${officialFooter}</div>`;
  const grad=`linear-gradient(120deg,${acc},${acc2})`;
  let cover;
  if(coverStyle==='minimal'){
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column">
      <div style="height:6px;background:${grad}"></div>
      <div style="padding:48px 52px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:20px">
        <div>${logoTag(60,false)}</div>${brandName(false)}
      </div>
      <div style="text-align:center;padding:78px 40px 64px">${titleTag(ink,false)}${docNoChip(false)}</div>
      ${infoRow('0 52px 10px')}
      ${footerBlock('22px 52px 34px')}
      ${footerBar(acc,acc2)}
    </div>`;
  } else if(coverStyle==='band'){
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column">
      <div style="padding:46px 52px 26px;display:flex;justify-content:space-between;align-items:center;gap:20px">
        <div>${logoTag(58,false)}</div>${brandName(false)}
      </div>
      <div style="position:relative;background:${grad};padding:48px 52px;text-align:center;overflow:hidden">
        ${showPat?brandMotif(b):''}
        <div style="position:relative">${titleTag('#fff',true)}${docNoChip(true)}</div>
      </div>
      ${infoRow('44px 52px 10px')}
      ${footerBlock('22px 52px 34px')}
      ${footerBar(acc,acc2)}
    </div>`;
  } else if(coverStyle==='sidebar'){
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column">
      <div style="display:flex;flex:1 1 auto;min-height:0">
        <div style="width:26px;flex:none;background:linear-gradient(180deg,${acc},${acc2})"></div>
        <div style="flex:1;display:flex;flex-direction:column">
          <div style="padding:46px 46px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:20px">
            <div>${logoTag(58,false)}</div>${brandName(false)}
          </div>
          <div style="padding:74px 46px 60px">
            <div style="width:54px;height:5px;background:${acc};border-radius:3px;margin-bottom:22px"></div>
            ${titleTag(ink,false)}${docNoChip(false)}
          </div>
          ${infoRow('0 46px 10px')}
          ${footerBlock('22px 46px 34px')}
        </div>
      </div>
      ${footerBar(acc,acc2)}
    </div>`;
  } else if(coverStyle==='frame'){
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column;position:relative">
      <div style="position:absolute;inset:14px;border:2px solid ${acc};border-radius:6px;pointer-events:none"></div>
      <div style="padding:52px 56px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:20px">
        <div>${logoTag(56,false)}</div>${brandName(false)}
      </div>
      <div style="text-align:center;padding:74px 40px 62px">
        <div style="width:58px;height:2px;background:${acc};margin:0 auto 24px"></div>
        ${titleTag(ink,false)}${docNoChip(false)}
        <div style="width:58px;height:2px;background:${acc};margin:24px auto 0"></div>
      </div>
      ${infoRow('0 56px 10px')}
      ${footerBlock('22px 56px 44px')}
    </div>`;
  } else if(coverStyle==='split'){
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:380px">
        <div style="position:absolute;inset:0;background:${grad};clip-path:polygon(0 0,100% 0,100% 58%,0 100%)"></div>
        ${showPat?`<div style="position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 58%,0 100%);overflow:hidden">${brandMotif(b)}</div>`:''}
      </div>
      <div style="position:relative;padding:42px 48px 0;display:flex;justify-content:space-between;align-items:center;gap:20px">
        <div>${logoTag(60,true)}</div>${brandName(true)}
      </div>
      <div style="position:relative;padding:76px 48px 44px">${titleTag('#fff',true)}${docNoChip(true)}</div>
      ${infoRow('30px 52px 10px')}
      ${footerBlock('22px 52px 34px')}
      ${footerBar(acc,acc2)}
    </div>`;
  } else { // classic
    cover=`<div class="page cover" style="background:#fff;display:flex;flex-direction:column">
      <div style="position:relative;height:400px;flex:0 0 400px;overflow:hidden;background:${grad}">
        ${showPat?brandMotif(b):''}
        <div style="position:absolute;inset:0;padding:40px 48px;display:flex;flex-direction:column;justify-content:space-between">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:20px">
            <div>${logoTag(64,true)}</div>${brandName(true)}
          </div>
          <div style="text-align:center;color:#fff">${titleTag('#fff',false)}${docNoChip(true)}</div>
          <div></div>
        </div>
      </div>
      ${infoRow('44px 52px 10px')}
      ${footerBlock('22px 52px 34px')}
      ${footerBar(acc,acc2)}
    </div>`;
  }
  // ===== صفحة التفاصيل (Page 2) — الجدول والإجمالي والشروط
  const details=`
   <div class="page details" style="padding:48px 48px 0;position:relative;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${acc};padding-bottom:14px;margin-bottom:20px">
      <div>${b.logo?`<img src="${esc(b.logo)}" style="height:44px;margin-bottom:6px">`:`<div style="font-size:20px;font-weight:900;color:${ink}">${esc(b.name)}</div>`}
        <div style="color:#475569;font-size:12px">${esc(b.tagline||'')}</div>
      </div>
      <div style="text-align:left">${qrBlock}
        <div style="margin-top:6px"><div style="font-size:20px;font-weight:800">${esc(kind)}</div><div style="color:#475569;font-size:13px">رقم: ${esc(docNo)} · التاريخ: ${d.date}</div></div>
      </div>
    </div>
    <div style="margin-bottom:14px;background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:1.5px">${isInv?'فاتورة إلى':'عرض إلى'}</div>
        <div style="font-weight:800;font-size:16px;margin-top:2px">${esc(cname)}</div>
        ${caddr?`<div style="color:#475569;font-size:13px">${esc(caddr)}</div>`:''}
        ${ct.email?`<div style="color:#475569;font-size:13px">${esc(ct.email)}${ct.phone?' | '+esc(ct.phone):''}</div>`:(ct.phone?`<div style="color:#475569;font-size:13px">${esc(ct.phone)}</div>`:'')}
        ${cvat?`<div style="color:#475569;font-size:13px"><b>الرقم الضريبي:</b> ${esc(cvat)}</div>`:''}</div>
      ${ct.logo?`<img src="${esc(ct.logo)}" style="height:46px;max-width:130px;object-fit:contain">`:''}
    </div>
    <div style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
    <table style="width:100%;border-collapse:collapse;table-layout:fixed">
      <thead><tr style="background:${acc};color:#fff">
        <th style="padding:11px 14px;text-align:right;font-size:13px">الوصف</th>
        <th style="padding:11px 8px;width:64px;font-size:13px">الكمية</th>
        <th style="padding:11px 8px;width:110px;font-size:13px">السعر</th>
        ${disc>0.001?'<th style="padding:11px 8px;width:70px;font-size:13px">خصم</th>':''}
        <th style="padding:11px 8px;width:130px;font-size:13px">المجموع</th>
      </tr></thead>
      <tbody>${d.items.map((it,i)=>`<tr style="background:${i%2?'#fafafa':'#fff'}">
        <td style="padding:11px 14px;word-wrap:break-word"><b>${esc(it.desc)}</b>${it.details?`<div style="font-size:12px;color:#64748b;margin-top:3px;line-height:1.7">${esc(it.details)}</div>`:''}</td>
        <td style="padding:11px 8px;text-align:center;white-space:nowrap">${it.qty}</td>
        <td style="padding:11px 8px;text-align:center;white-space:nowrap" dir="ltr">${Number(it.price).toFixed(2)}</td>
        ${disc>0.001?`<td style="padding:11px 8px;text-align:center;white-space:nowrap">${it.discount?it.discount+'%':'—'}</td>`:''}
        <td style="padding:11px 8px;text-align:center;font-weight:800;white-space:nowrap" dir="ltr">${lineTotal(it).toFixed(2)}</td>
      </tr>`).join('')}</tbody>
    </table>
    </div>
    <div style="display:flex;justify-content:space-between;gap:20px;margin-top:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">${d.notes?`<div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;color:#334155;white-space:pre-wrap;font-size:12.5px;line-height:1.9">${esc(isInv?d.notes:resolveQuoteNotes(d,d.notes))}</div>`:''}</div>
      <div style="width:330px;flex:0 0 330px">
        <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;gap:10px"><span>المجموع الفرعي</span><span style="white-space:nowrap" dir="ltr">${lineSub.toFixed(2)} ${esc(s.currency)}</span></div>
        ${disc>0.001?`<div style="display:flex;justify-content:space-between;padding:5px 0;color:#16a34a;font-size:13px;gap:10px"><span>خصم البنود</span><span style="white-space:nowrap" dir="ltr">- ${disc.toFixed(2)} ${esc(s.currency)}</span></div>`:''}
        ${ovr>0.001?`<div style="display:flex;justify-content:space-between;padding:5px 0;color:#16a34a;font-size:13px;gap:10px"><span>خصم إجمالي${d.discType==='percent'?' ('+Number(d.discVal||0)+'%)':''}</span><span style="white-space:nowrap" dir="ltr">- ${ovr.toFixed(2)} ${esc(s.currency)}</span></div>`:''}
        <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;gap:10px"><span>ضريبة القيمة المضافة (${d.vat?d.vatRate:0}%)</span><span style="white-space:nowrap" dir="ltr">${tax.toFixed(2)} ${esc(s.currency)}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;margin-top:8px;background:${acc};color:#fff;border-radius:10px;font-weight:900;font-size:16px;gap:12px"><span>الإجمالي</span><span style="white-space:nowrap;font-size:18px" dir="ltr">${total.toFixed(2)} ${esc(s.currency)}</span></div>
        ${isInv&&paid>0.001?`<div style="display:flex;justify-content:space-between;padding:5px 0;color:#16a34a;font-size:13px;gap:10px"><span>المدفوع</span><span style="white-space:nowrap" dir="ltr">${paid.toFixed(2)} ${esc(s.currency)}</span></div>`:''}
        ${isInv&&due>0.001?`<div style="display:flex;justify-content:space-between;padding:5px 0;font-weight:800;font-size:13px;gap:10px"><span>المتبقي</span><span style="white-space:nowrap" dir="ltr">${due.toFixed(2)} ${esc(s.currency)}</span></div>`:''}
      </div>
    </div>
    ${payBlockHTML(d,org,acc,ink)}
    <div style="margin-top:auto;padding-top:40px;padding-bottom:24px;text-align:center;color:#94a3b8;font-size:11.5px;line-height:1.7">
      <div style="width:100%;height:1px;background:linear-gradient(90deg,transparent,${acc}55,transparent);margin-bottom:14px"></div>
      <div style="font-weight:800;color:${ink};font-size:12.5px">${esc(org.brand)}</div>
      ${org.owner?esc(org.owner)+' · ':''}${org.email?esc(org.email):''}${org.phone?' · <span dir="ltr">'+esc(org.phone)+'</span>':''}
      ${org.cr||org.vat?`<br>${org.cr?'س.ت '+esc(org.cr):''}${org.cr&&org.vat?' · ':''}${org.vat?'الرقم الضريبي '+esc(org.vat):''}`:''}
    </div>
    <div style="height:7px;background:linear-gradient(90deg,${acc},${acc2});margin:0 -48px"></div>
   </div>`;
  const ORIGIN=location.origin;
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${esc(kind)} ${esc(docNo)}</title>
    <style>
      /* خط ثمانية — الخط الرسمي للنظام */
      @font-face{font-family:"Thmanyah Sans";src:url("${ORIGIN}/fonts/thmanyah/thmanyahsans-Regular.woff2") format("woff2");font-weight:400;font-display:swap}
      @font-face{font-family:"Thmanyah Sans";src:url("${ORIGIN}/fonts/thmanyah/thmanyahsans-Medium.woff2") format("woff2");font-weight:500;font-display:swap}
      @font-face{font-family:"Thmanyah Sans";src:url("${ORIGIN}/fonts/thmanyah/thmanyahsans-Bold.woff2") format("woff2");font-weight:700;font-display:swap}
      @font-face{font-family:"Thmanyah Sans";src:url("${ORIGIN}/fonts/thmanyah/thmanyahsans-Black.woff2") format("woff2");font-weight:900;font-display:swap}
      @font-face{font-family:"Thmanyah Serif";src:url("${ORIGIN}/fonts/thmanyah/thmanyahserifdisplay-Bold.woff2") format("woff2");font-weight:700;font-display:swap}
      @font-face{font-family:"Thmanyah Serif";src:url("${ORIGIN}/fonts/thmanyah/thmanyahserifdisplay-Black.woff2") format("woff2");font-weight:900;font-display:swap}
      /* صفحة A4 كاملة full-bleed — التصميم يصل حافة الورقة (بلا إطار أبيض) في معاينة الواتساب/PDF.
         النصوص والجداول بهامش داخلي آمن (المنطقة الآمنة) فلا يُقصّ محتوى. */
      @page{size:A4;margin:0}
      html,body{margin:0;padding:0;background:#e5e7eb;font-family:"Thmanyah Sans","Tajawal",Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased}
      *{box-sizing:border-box}
      .page{width:210mm;min-height:297mm;background:#fff;margin:0 auto;position:relative;page-break-after:always;overflow:hidden}
      .page:last-child{page-break-after:auto}
      .headline{font-family:"Thmanyah Serif","Thmanyah Sans","Tajawal",serif}
      @media screen{.page{margin:14px auto;box-shadow:0 8px 24px rgba(0,0,0,.15)}}
      @media print{.page{margin:0 auto;box-shadow:none}}
      table{font-family:inherit;max-width:100%}
      td,th{overflow:hidden;text-overflow:ellipsis}
    </style></head><body>${cover}${details}</body></html>`;
}
/* اسم ملف احترافي للطباعة/الإرسال: «عرض_سعر_اسم‑الشركة_رقم» — المتصفح يستعمله اسماً افتراضياً لـPDF */
function docFileName(type,id){
  const d=(type==='invoice'?S.invoices:type==='credit'?S.credits:S.sales).find(x=>x.id===id);if(!d)return 'مستند';
  const isInv=type==='invoice';const isCredit=type==='credit';
  const label=isInv?(d.vat?'فاتورة_ضريبية':'فاتورة'):isCredit?'إشعار_دائن':'عرض_سعر';
  const prefix=isInv?(S.settings.invPrefix||'INV-'):isCredit?'CN-':(S.settings.salePrefix||'S');
  const no=prefix+String(d.number).padStart(5,'0');
  const client=(resolveClientName(d)||'').replace(/[\\\/:*?"<>|]/g,'').trim().replace(/\s+/g,'_').slice(0,45);
  return [label,client,no].filter(Boolean).join('_');
}
function printDoc(type,id){
  const html=printDocHTML(type,id);
  const fname=docFileName(type,id);
  const f=document.createElement('iframe');f.style.position='fixed';f.style.right='-10000px';f.style.bottom='0';f.style.width='820px';f.style.height='1160px';f.style.border='0';
  document.body.appendChild(f);
  const doc=f.contentWindow.document;doc.open();doc.write(html);doc.close();
  // المتصفح يشتق اسم PDF من عنوان الصفحة الأصلية — نبدّله مؤقتاً لاسم المستند الاحترافي ثم نعيده
  const prevTitle=document.title;
  setTimeout(()=>{
    try{document.title=fname;if(f.contentWindow&&f.contentWindow.document)f.contentWindow.document.title=fname;}catch(e){}
    try{f.contentWindow.focus();f.contentWindow.print()}catch(e){alert('تعذّرت الطباعة: '+e.message)}
    setTimeout(()=>{document.title=prevTitle;f.remove()},1800);
  },700);
}
