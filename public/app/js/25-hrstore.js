/* ═══════════════════════════════════════════════════════════════════════════
 * 25-hrstore.js — حروف ودروس ← «المتجر»: إدارة طلبات huroofduroos.com/store
 * ───────────────────────────────────────────────────────────────────────────
 * تبويب داخل تطبيق حروف (HR_TABS في 03-huroof، HR_VIEWS في 99-boot).
 * كلّ البيانات من خادم حروف عبر hrApi (جسر x-system-token):
 *   admin/store/summary · admin/store/orders · admin/store/orders/:ref (+ events)
 *   PATCH admin/store/orders/:ref · POST …/shipment · …/track · …/recheck · …/resend-email
 * البادئة hst — تعريفات فقط (لا تنفيذ عند التحميل).
 * ═══════════════════════════════════════════════════════════════════════════ */

let HST={sum:null,orders:null,err:null,filter:'todo',q:''};

const HST_PAY={pending:['بانتظار الدفع','#f59e0b'],paid:['مدفوع','#22c55e'],failed:['فشل الدفع','#ef4444'],cancelled:['أُلغي الدفع','#64748b'],refunded:['مُسترجَع','#a78bfa']};
const HST_FUL={new:['جديد','#3b82f6'],preparing:['نجهّزه','#f59e0b'],shipped:['في الطريق','#6366f1'],delivered:['وصل','#22c55e'],cancelled:['أُلغي','#64748b']};
const HST_FILTERS=[
  ['todo','بانتظار التجهيز',o=>o.paymentStatus==='paid'&&(o.fulfillment==='new'||o.fulfillment==='preparing')],
  ['transit','في الطريق',o=>o.paymentStatus==='paid'&&o.fulfillment==='shipped'],
  ['done','مكتملة',o=>o.paymentStatus==='paid'&&o.fulfillment==='delivered'],
  ['paid','كلّ المدفوعة',o=>o.paymentStatus==='paid'],
  ['unpaid','غير مدفوعة',o=>o.paymentStatus==='pending'||o.paymentStatus==='failed'||o.paymentStatus==='cancelled'],
  ['refunded','مُسترجَعة',o=>o.paymentStatus==='refunded'],
  ['all','الكلّ',()=>true],
];

function hstSar(n){return HR_ar(n)+' ر.س';}
function hstPhone(p){p=String(p||'');return /^9665\d{8}$/.test(p)?'0'+p.slice(3):p;}
function hstAddr(a){a=a||{};return [a.city,a.district&&('حيّ '+a.district),a.street,a.buildingNo&&('مبنى '+a.buildingNo),a.additionalNo&&('إضافيّ '+a.additionalNo),a.postalCode&&('ص.ب '+a.postalCode),a.shortAddress].filter(Boolean).join(' — ');}
function hstWhen(s){if(!s)return '—';try{return new Date(s).toLocaleString('ar-SA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return '—'}}

function hrViewStore(){HST.orders=null;HST.err=null;hrSet(hrLoading());hstLoad();}

async function hstLoad(){
  try{
    const [sum,list]=await Promise.all([hrApi('admin/store/summary'),hrApi('admin/store/orders')]);
    HST.sum=sum;HST.orders=list.orders||[];HST.err=null;
  }catch(e){HST.err=e.message||'خطأ';}
  if(hrActive('store'))hstRender();
}

function hstSetFilter(f){HST.filter=f;hstRender();}
function hstSearch(v){HST.q=v;hstRenderTable();}

function hstFiltered(){
  const f=(HST_FILTERS.find(x=>x[0]===HST.filter)||HST_FILTERS[0])[2];
  const q=(HST.q||'').trim().toLowerCase();
  return (HST.orders||[]).filter(f).filter(o=>!q||[o.no,o.customer&&o.customer.name,o.customer&&o.customer.phone,hstPhone(o.customer&&o.customer.phone),o.customer&&o.customer.email,o.address&&o.address.city,o.trackingNo,o.tracking&&o.tracking.number].join(' ').toLowerCase().includes(q));
}

function hstRender(){
  if(HST.err){hrSet(hrErr(HST.err,'hstLoad()'));return}
  const s=HST.sum||{},car=s.carriers||{};
  const counts=Object.fromEntries(HST_FILTERS.map(([k,,fn])=>[k,(HST.orders||[]).filter(fn).length]));
  hrSet(`${hrHead('المتجر — الطلبات','shopping-bag',`
      <a class="btn btn-ghost btn-sm" href="https://huroofduroos.com/store" target="_blank" rel="noopener"><i data-lucide="external-link"></i> فتح المتجر</a>
      <button class="btn btn-ghost btn-sm" onclick="hstExportCsv()"><i data-lucide="download"></i> تصدير للشحن (CSV)</button>
      <button class="btn btn-ghost btn-sm" onclick="hstLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">
      ${hrTile(HR_ar(s.toShip||0),'بانتظار التجهيز','#f59e0b')}
      ${hrTile(HR_ar(s.inTransit||0),'في الطريق','#6366f1')}
      ${hrTile(HR_ar(s.paid||0),'طلبات مدفوعة','#22c55e')}
      ${hrTile(hstSar(s.revenue||0),'الإيراد','var(--gold)')}
    </div>
    <div class="card" style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;padding:12px 16px;margin-bottom:14px;font-size:13px">
      <span>${s.open?hrChip('البيع مفتوح','#22c55e'):hrChip('وضع المعاينة (STORE_OPEN مقفل)','#f59e0b')}${s.test?' '+hrChip('وضع التجربة — بطاقات تلر التجريبيّة','#ef4444'):''}</span>
      <span>سمسا: ${car.smsa?hrChip('مربوطة','#22c55e'):hrChip('يدويّ','#64748b')}</span>
      <span>أرامكس: ${car.aramex?hrChip('مربوطة','#22c55e'):hrChip('يدويّ','#64748b')}</span>
      <span style="color:var(--muted)">المنتجات: ${(s.products||[]).map(p=>esc(p.name)+' '+HR_ar(p.price)).join(' · ')}</span>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      ${HST_FILTERS.map(([k,l])=>`<button class="btn btn-sm ${HST.filter===k?'btn-gold':'btn-ghost'}" onclick="hstSetFilter('${k}')">${l} (${HR_ar(counts[k])})</button>`).join('')}
    </div>
    <input class="field" placeholder="بحث: رقم الطلب، الاسم، الجوال، المدينة، رقم الشحنة…" value="${esc(HST.q)}" oninput="hstSearch(this.value)" style="margin-bottom:12px">
    <div id="hstTable"></div>`);
  hstRenderTable();
}

function hstRenderTable(){
  const el=document.getElementById('hstTable');if(!el)return;
  const rows=hstFiltered();
  if(!rows.length){el.innerHTML=`<div class="card" style="text-align:center;color:var(--muted);padding:26px">${(HST.orders||[]).length?'لا طلبات في هذا التصنيف.':'لا طلبات بعد — أوّل طلب يظهر هنا لحظة الدفع.'}</div>`;return}
  el.innerHTML=`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>الطلب</th><th>العميل</th><th>المدينة</th><th>المنتجات</th><th>المبلغ</th><th>الدفع</th><th>التنفيذ</th><th></th></tr></thead><tbody>
    ${rows.map(o=>{const p=HST_PAY[o.paymentStatus]||[o.paymentStatus,'#64748b'],f=HST_FUL[o.fulfillment]||[o.fulfillment,'#64748b'];
      return `<tr style="cursor:pointer" onclick="hstOpen('${esc(o.ref)}')">
        <td><b dir="ltr">#${esc(o.no)}</b><div style="font-size:11px;color:var(--muted)">${hstWhen(o.createdAt)}</div></td>
        <td><b>${esc(o.customer&&o.customer.name||'—')}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(hstPhone(o.customer&&o.customer.phone))}</div></td>
        <td>${esc(o.address&&o.address.city||'—')}<div style="font-size:11px;color:var(--muted)">${esc(o.shipping&&o.shipping.label||'')}</div></td>
        <td>${(o.items||[]).map(l=>esc(l.sku)+' ×'+HR_ar(l.qty)).join('<br>')}</td>
        <td><b>${hstSar(o.total)}</b></td>
        <td>${hrChip(p[0],p[1])}</td>
        <td>${hrChip(f[0],f[1])}${o.tracking?`<div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(o.tracking.number)}</div>`:''}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();hstOpen('${esc(o.ref)}')"><i data-lucide="chevron-left"></i></button></td>
      </tr>`}).join('')}</tbody></table></div>`;
  refreshIcons();
}

/* ─── تفاصيل الطلب ─── */
let HST_CUR=null;

async function hstOpen(ref){
  openModal('الطلب','<div id="hstDetail" style="color:var(--muted)">…جارٍ التحميل</div>',null,null);
  const sv=document.getElementById('mSave');if(sv)sv.style.display='none';
  const m=document.querySelector('#modalRoot .modal');if(m)m.style.maxWidth='860px';
  try{const r=await hrApi('admin/store/orders/'+encodeURIComponent(ref));HST_CUR=r;hstRenderDetail();}
  catch(e){const d=document.getElementById('hstDetail');if(d)d.innerHTML=`<div class="badge-note">${esc(e.message)}</div>`}
}

function hstCopyBtn(txt,label){return `<button class="btn btn-ghost btn-sm" onclick="hstCopy(${esc(JSON.stringify(String(txt||'')))})" title="نسخ"><i data-lucide="copy"></i>${label?' '+label:''}</button>`;}
async function hstCopy(t){try{await navigator.clipboard.writeText(t)}catch(e){prompt('انسخ:',t)}}

function hstRenderDetail(){
  const d=document.getElementById('hstDetail');if(!d||!HST_CUR)return;
  const o=HST_CUR.order,ev=HST_CUR.events||[],a=o.address||{},c=o.customer||{},pc=o.parcel||{};
  const h3=document.querySelector('#modalRoot .modal-head h3');if(h3)h3.innerHTML=`الطلب <span dir="ltr">#${esc(o.no)}</span> ${hrChip((HST_PAY[o.paymentStatus]||[o.paymentStatus])[0],(HST_PAY[o.paymentStatus]||[,'#64748b'])[1])}`;
  const paid=o.paymentStatus==='paid';
  const map=(a.lat&&a.lng)?`https://www.google.com/maps?q=${a.lat},${a.lng}`:'';
  const shipText=hstShipText(o);
  const ful=['new','preparing','shipped','delivered','cancelled'];
  d.style.color='var(--ink)';
  d.innerHTML=`
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
    <div class="card" style="margin:0">
      <div style="font-weight:800;margin-bottom:8px"><i data-lucide="truck"></i> الشحن إلى</div>
      <div style="line-height:1.9;font-size:14px">
        <b>${esc(a.recipientName||c.name)}</b> · <span dir="ltr">${esc(hstPhone(a.recipientPhone||c.phone))}</span><br>
        ${esc(hstAddr(a))}
        ${a.landmark?`<br><span style="color:var(--muted)">معلم:</span> ${esc(a.landmark)}`:''}
        ${a.notes?`<br><span style="color:var(--muted)">ملاحظة:</span> ${esc(a.notes)}`:''}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        ${hstCopyBtn(shipText,'نسخ بيانات الشحن')}
        ${map?`<a class="btn btn-ghost btn-sm" href="${map}" target="_blank" rel="noopener"><i data-lucide="map-pin"></i> الموقع</a>`:''}
        <a class="btn btn-ghost btn-sm" href="https://wa.me/${esc(a.recipientPhone||c.phone)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> واتساب</a>
        <button class="btn btn-ghost btn-sm" onclick="hstPrintSlip()"><i data-lucide="printer"></i> بوليصة/ورقة تغليف</button>
      </div>
    </div>
    <div class="card" style="margin:0">
      <div style="font-weight:800;margin-bottom:8px"><i data-lucide="user"></i> المشتري</div>
      <div style="line-height:1.9;font-size:14px">${esc(c.name)} · <span dir="ltr">${esc(hstPhone(c.phone))}</span><br><span dir="ltr">${esc(c.email)}</span><br>
      <span style="color:var(--muted)">التوصيل:</span> ${esc(o.shipping&&o.shipping.label)}<br>
      <span style="color:var(--muted)">الطرد:</span> ${HR_ar(pc.pieces)} قطعة · ${pc.weightKg} كجم · ${(pc.dimsCm||[]).join('×')} سم${o.source?`<br><span style="color:var(--muted)">المصدر:</span> ${esc(o.source)}`:''}</div>
      ${o.customerLink?`<div style="margin-top:10px">${hstCopyBtn(o.customerLink,'رابط العميل')}</div>`:''}
    </div>
  </div>

  <div class="card" style="margin:12px 0 0">
    <table class="hr-table"><tbody>
      ${(o.items||[]).map(l=>`<tr><td>${esc(l.name)}<div style="font-size:11px;color:var(--muted)">${esc(l.sku)}${l.bundleMonths?' · + اشتراك '+HR_ar(l.bundleMonths)+' شهراً':''}</div></td><td style="white-space:nowrap">الكمّيّة ${HR_ar(l.qty)}</td><td style="text-align:left">${hstSar(l.lineTotal)}</td></tr>`).join('')}
      <tr><td style="color:var(--muted)">التوصيل</td><td></td><td style="text-align:left">${o.shippingFee?hstSar(o.shippingFee):'مجّاناً'}</td></tr>
      <tr><td><b>الإجماليّ</b></td><td></td><td style="text-align:left"><b>${hstSar(o.total)}</b></td></tr>
    </tbody></table>
    ${(o.activationCodes||[]).length?`<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="color:var(--muted);font-size:13px">أكواد الاشتراك:</span>${o.activationCodes.map(k=>`<code dir="ltr" style="font-weight:800">${esc(k)}</code>`).join(' ')}</div>`:''}
    <div style="font-size:12px;color:var(--muted);margin-top:8px" dir="ltr">Telr order: ${esc(o.telrOrderRef||'—')} · tran: ${esc(o.telrTranRef||'—')}</div>
  </div>

  ${paid?`<div class="card" style="margin:12px 0 0">
    <div style="font-weight:800;margin-bottom:10px"><i data-lucide="package-check"></i> التنفيذ</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      ${ful.map(k=>`<button class="btn btn-sm ${o.fulfillment===k?'btn-gold':'btn-ghost'}" onclick="hstSetFul('${k}')">${HST_FUL[k][0]}</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:140px 1fr auto;gap:8px;align-items:end">
      <div>${hrLbl('شركة الشحن')}<select class="field" id="hstCarrier">
        ${[['','—'],['smsa','سمسا'],['aramex','أرامكس'],['spl','سبل (البريد)'],['jt','J&T'],['redbox','ريدبوكس'],['self','توصيل بنفسي'],['other','أخرى']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
      </select></div>
      <div>${hrLbl('رقم البوليصة / الشحنة')}<input class="field" id="hstTrack" dir="ltr" value="${esc(o.tracking&&o.tracking.number||'')}"></div>
      <button class="btn btn-gold btn-sm" onclick="hstSaveTracking()"><i data-lucide="save"></i> حفظ</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
      ${!o.tracking&&HST.sum&&HST.sum.carriers&&HST.sum.carriers.smsa?`<button class="btn btn-ghost btn-sm" onclick="hstShip('smsa')"><i data-lucide="send"></i> بوليصة سمسا تلقائيّة</button>`:''}
      ${!o.tracking&&HST.sum&&HST.sum.carriers&&HST.sum.carriers.aramex?`<button class="btn btn-ghost btn-sm" onclick="hstShip('aramex')"><i data-lucide="send"></i> بوليصة أرامكس تلقائيّة</button>`:''}
      ${o.tracking&&(o.tracking.carrier==='smsa'||o.tracking.carrier==='aramex')&&HST.sum&&HST.sum.carriers&&HST.sum.carriers[o.tracking.carrier]?`<button class="btn btn-ghost btn-sm" onclick="hstTrackNow()"><i data-lucide="radar"></i> تحديث التتبّع</button>`:''}
      ${o.tracking&&o.tracking.url?`<a class="btn btn-ghost btn-sm" href="${esc(o.tracking.url)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> صفحة التتبّع</a>`:''}
      <button class="btn btn-ghost btn-sm" onclick="hstResend()"><i data-lucide="mail"></i> أعد إرسال بريد الطلب</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="hstRefund()"><i data-lucide="undo-2"></i> علّمه مُسترجَعاً</button>
    </div>
    ${o.tracking&&o.tracking.status?`<div style="font-size:13px;color:var(--muted);margin-top:8px">آخر تتبّع: ${esc(o.tracking.status)}</div>`:''}
  </div>`:`<div class="card" style="margin:12px 0 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span style="color:var(--muted)">الطلب غير مدفوع — لو العميل يقول دفع، اسأل تلر مباشرة:</span>
    <button class="btn btn-gold btn-sm" onclick="hstRecheck()"><i data-lucide="refresh-cw"></i> أعد فحص الدفع</button>
  </div>`}

  <div class="card" style="margin:12px 0 0">
    ${hrLbl('ملاحظات داخليّة (لا يراها العميل)')}
    <textarea class="field" id="hstNotes" rows="2">${esc(o.internalNotes||'')}</textarea>
    <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="hstSaveNotes()"><i data-lucide="save"></i> حفظ الملاحظة</button>
  </div>

  <details style="margin-top:12px"><summary style="cursor:pointer;color:var(--muted);font-size:13px">سجلّ الطلب (${HR_ar(ev.length)})</summary>
    <div style="font-size:12px;line-height:1.9;margin-top:6px">${ev.map(e=>`<div><span dir="ltr" style="color:var(--muted)">${hstWhen(e.createdAt)}</span> · <b>${esc(e.type)}</b> ${e.by&&e.by!=='system'?'('+esc(e.by)+')':''} <span style="color:var(--muted)" dir="ltr">${e.data?esc(JSON.stringify(e.data)).slice(0,160):''}</span></div>`).join('')}</div>
  </details>`;
  const sel=document.getElementById('hstCarrier');if(sel&&o.tracking&&o.tracking.carrier)sel.value=o.tracking.carrier;
  refreshIcons();
}

/** نصّ الشحن كاملاً — يُلصق في أيّ منصّة بوالص. */
function hstShipText(o){
  const a=o.address||{},c=o.customer||{},pc=o.parcel||{};
  return [
    'طلب #'+o.no,
    'المستلم: '+(a.recipientName||c.name),
    'الجوال: '+hstPhone(a.recipientPhone||c.phone),
    'المدينة: '+(a.city||''),
    a.district?'الحيّ: '+a.district:'',
    a.street?'الشارع: '+a.street:'',
    a.buildingNo?'رقم المبنى: '+a.buildingNo:'',
    a.additionalNo?'الرقم الإضافيّ: '+a.additionalNo:'',
    a.postalCode?'الرمز البريديّ: '+a.postalCode:'',
    a.shortAddress?'العنوان المختصر: '+a.shortAddress:'',
    a.landmark?'معلم: '+a.landmark:'',
    (a.lat&&a.lng)?'الموقع: https://www.google.com/maps?q='+a.lat+','+a.lng:'',
    'المحتوى: '+(pc.description||''),
    'الوزن: '+pc.weightKg+' كجم · القطع: '+pc.pieces+' · الأبعاد: '+(pc.dimsCm||[]).join('×')+' سم',
    'القيمة: '+o.subtotal+' ر.س (مدفوع مسبقاً — بلا تحصيل)',
    a.notes?'ملاحظة: '+a.notes:'',
  ].filter(Boolean).join('\n');
}

async function hstPatch(body,okMsg){
  if(!HST_CUR)return;
  try{const r=await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref),{method:'PATCH',body});HST_CUR.order=r.order;
    const fresh=await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref));HST_CUR=fresh;hstRenderDetail();hstLoadQuiet();}
  catch(e){alert('تعذّر: '+e.message)}
}
async function hstLoadQuiet(){try{const [sum,list]=await Promise.all([hrApi('admin/store/summary'),hrApi('admin/store/orders')]);HST.sum=sum;HST.orders=list.orders||[];if(hrActive('store'))hstRender();}catch(e){}}

function hstSetFul(k){
  const lbl=HST_FUL[k][0];
  if(k==='cancelled'&&!confirm('إلغاء تنفيذ الطلب؟ (المبلغ لا يُسترجع تلقائيّاً — استرجعه من لوحة تلر ثم «علّمه مُسترجَعاً»)'))return;
  if((k==='shipped'||k==='delivered')&&!confirm('تغيير الحالة إلى «'+lbl+'»؟ يصل العميل بريد بذلك.'))return;
  hstPatch({fulfillment:k});
}
function hstSaveTracking(){
  const carrier=document.getElementById('hstCarrier').value||null,trackingNo=(document.getElementById('hstTrack').value||'').trim()||null;
  const body={carrier,trackingNo};
  if(trackingNo&&HST_CUR.order.fulfillment!=='shipped'&&HST_CUR.order.fulfillment!=='delivered'&&confirm('علّم الطلب «في الطريق» ويصل العميل بريد برقم الشحنة؟'))body.fulfillment='shipped';
  hstPatch(body);
}
function hstSaveNotes(){hstPatch({internalNotes:document.getElementById('hstNotes').value||null});}
function hstRefund(){if(!confirm('تأكّدت أنّك استرجعت المبلغ من لوحة تلر؟ هذا يعلّم الطلب «مُسترجَع» فقط.'))return;hstPatch({paymentStatus:'refunded',fulfillment:'cancelled'});}

async function hstShip(carrier){
  if(!HST_CUR||!confirm('إنشاء بوليصة '+(carrier==='smsa'?'سمسا':'أرامكس')+' الآن؟ (تُحتسب عليك)'))return;
  try{const r=await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref)+'/shipment',{method:'POST',body:{carrier}});
    if(r.labelUrl)window.open(r.labelUrl,'_blank');
    else if(r.labelPdfBase64){const w=window.open();if(w)w.document.write('<iframe style="border:0;width:100%;height:100vh" src="data:application/pdf;base64,'+r.labelPdfBase64+'"></iframe>');}
    hstOpen(HST_CUR.order.ref);hstLoadQuiet();}
  catch(e){alert('تعذّر: '+e.message)}
}
async function hstTrackNow(){try{const r=await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref)+'/track',{method:'POST'});alert('آخر حالة: '+(r.status||'—'));hstOpen(HST_CUR.order.ref);}catch(e){alert('تعذّر: '+e.message)}}
async function hstRecheck(){try{const r=await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref)+'/recheck',{method:'POST'});alert(r.ok?('الحالة لدى تلر: '+((HST_PAY[r.status]||[r.status])[0])):('تعذّر: '+r.reason));hstOpen(HST_CUR.order.ref);hstLoadQuiet();}catch(e){alert('تعذّر: '+e.message)}}
async function hstResend(){try{await hrApi('admin/store/orders/'+encodeURIComponent(HST_CUR.order.ref)+'/resend-email',{method:'POST'});alert('أُرسل البريد للعميل.');}catch(e){alert('تعذّر: '+e.message)}}

/** ورقة تغليف/بوليصة مبدئيّة بمقاس A6 — تُطبع وتُلصق على الطرد حين يوصَّل باليد أو كمرجع. */
function hstPrintSlip(){
  if(!HST_CUR)return;
  const o=HST_CUR.order,a=o.address||{},c=o.customer||{},pc=o.parcel||{};
  const w=window.open('','_blank');if(!w)return;
  const e=s=>String(s==null?'':s).replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
  w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>طلب ${e(o.no)}</title>
  <style>@page{size:A6;margin:6mm}body{font-family:-apple-system,Tahoma,Arial,sans-serif;margin:0;color:#000}
  .b{border:2px solid #000;border-radius:8px;padding:10px;margin-bottom:8px}h1{font-size:15px;margin:0 0 6px}
  .big{font-size:20px;font-weight:800}.row{display:flex;justify-content:space-between;gap:8px;font-size:12px}
  .muted{color:#444;font-size:11px}.no{font-family:monospace;font-size:18px;font-weight:800;letter-spacing:1px;direction:ltr}</style></head><body>
  <div class="row"><b>حروف و دروس — المتجر</b><span class="no">#${e(o.no)}</span></div>
  <div class="b"><div class="muted">إلى</div><div class="big">${e(a.recipientName||c.name)}</div>
    <div class="big" dir="ltr" style="text-align:right">${e(hstPhone(a.recipientPhone||c.phone))}</div>
    <div style="font-size:13px;line-height:1.6;margin-top:4px">${e(hstAddr(a))}${a.landmark?'<br>'+e(a.landmark):''}</div></div>
  <div class="b"><div class="muted">من</div><div style="font-size:12px">حروف و دروس — الرياض · huroofduroos.com</div></div>
  <div class="row"><span>${e(pc.pieces)} قطعة · ${e(pc.weightKg)} كجم · ${e((pc.dimsCm||[]).join('×'))} سم</span><span>مدفوع مسبقاً</span></div>
  <div class="muted" style="margin-top:6px">${(o.items||[]).map(l=>e(l.sku)+' ×'+e(l.qty)).join(' · ')}</div>
  ${a.notes?'<div class="muted">ملاحظة: '+e(a.notes)+'</div>':''}
  <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

/** CSV بكلّ بيانات الشحن للطلبات الظاهرة — يُرفع لأيّ منصّة بوالص (بترميز UTF‑8 مع BOM لإكسل). */
function hstExportCsv(){
  const rows=hstFiltered().filter(o=>o.paymentStatus==='paid');
  if(!rows.length){alert('لا طلبات مدفوعة في التصنيف الحاليّ.');return}
  const head=['order_no','created_at','recipient_name','recipient_phone','city','district','street','building_no','additional_no','postal_code','short_address','landmark','notes','lat','lng','buyer_email','pieces','weight_kg','length_cm','width_cm','height_cm','contents','declared_value_sar','cod_amount','shipping_method','fulfillment','carrier','tracking_no'];
  const q=v=>{const s=String(v==null?'':v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
  const lines=rows.map(o=>{const a=o.address||{},c=o.customer||{},pc=o.parcel||{},d=pc.dimsCm||[];
    return [o.no,o.createdAt,a.recipientName||c.name,hstPhone(a.recipientPhone||c.phone),a.city,a.district,a.street,a.buildingNo,a.additionalNo,a.postalCode,a.shortAddress,a.landmark,a.notes,a.lat,a.lng,c.email,pc.pieces,pc.weightKg,d[0],d[1],d[2],pc.description,o.subtotal,0,o.shipping&&o.shipping.id,o.fulfillment,o.tracking&&o.tracking.carrier,o.tracking&&o.tracking.number].map(q).join(',')});
  const blob=new Blob(['﻿'+[head.join(','),...lines].join('\n')],{type:'text/csv;charset=utf-8'});
  const u=URL.createObjectURL(blob),el=document.createElement('a');el.href=u;el.download='huroof-store-'+new Date().toISOString().slice(0,10)+'.csv';el.click();setTimeout(()=>URL.revokeObjectURL(u),2000);
}
