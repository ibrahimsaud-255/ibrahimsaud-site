/*
 * 26-dshop.js — «المتجر الرقميّ»: إدارة متجر ibrahimsaud.com/shop/ (برامج، ملفّات، دورات)
 * ─────────────────────────────────────────────────────────────────────────
 * يقرأ جداول shop_products / shop_orders / shop_downloads مباشرة (RLS: المالك فقط).
 * الإجراءات الحسّاسة (رابط الطلب للمشتري) عبر الدالّة الحافّة «shop» (action=recover).
 * البادئة dsh — تعريفات فقط (لا تنفيذ عند التحميل). الدليل: docs/المتجر-الرقمي.md
 */
let DSH={orders:null,products:null,dl:null,err:null,loading:false,filter:'paid',q:''};
const DSH_ST={paid:['مدفوع','#22c55e'],pending:['بانتظار الدفع','#f59e0b'],failed:['فشل','#ef4444'],cancelled:['أُلغي','#64748b']};
const DSH_FN='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop';

async function dshLoad(force){
  if(DSH.loading)return;DSH.loading=true;try{extAutoSync(!!force)}catch(e){}DSH.err=null;if(force&&CUR==='dshop')renderDShop();
  try{
    const [o,p,d]=await Promise.all([
      sb.from('shop_orders').select('id,sku,title,amount,buyer_name,buyer_email,buyer_phone,status,trusted_devices,created_at,paid_at,buyer_country,card_country,hold,pay_method').order('created_at',{ascending:false}).limit(500),
      sb.from('shop_products').select('*').order('sort'),
      sb.from('shop_downloads').select('order_id,file_id,at').order('at',{ascending:false}).limit(2000),
    ]);
    if(o.error)throw o.error;if(p.error)throw p.error;
    DSH.orders=o.data||[];DSH.products=p.data||[];DSH.dl=d.error?[]:(d.data||[]);
  }catch(e){DSH.err=(e&&e.message)||'تعذّر الاتصال'}
  DSH.loading=false;if(CUR==='dshop')renderDShop();
}
function dshMoney(n){return Number(n||0).toLocaleString('ar-SA',{maximumFractionDigits:2})+' ر.س'}
function dshDate(s){if(!s)return '—';try{return new Date(s).toLocaleDateString('ar-SA-u-ca-gregory',{day:'numeric',month:'short',year:'numeric'})+' · '+new Date(s).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'})}catch(_){return s}}
function dshPhoneWa(p){const d=String(p||'').replace(/\D/g,'');if(!d)return '';return 'https://wa.me/'+(d.startsWith('05')?'966'+d.slice(1):d.startsWith('5')&&d.length===9?'966'+d:d)}

function renderDShop(){
  const main=document.getElementById('main');
  const head=`<div class="page-head"><h1><i data-lucide="shopping-bag"></i> المتجر الرقميّ</h1>
    <div style="display:flex;gap:8px"><a class="btn btn-ghost btn-sm" href="https://ibrahimsaud.com/shop/" target="_blank" rel="noopener"><i data-lucide="external-link"></i> المتجر</a>
    <button class="btn btn-ghost btn-sm" onclick="dshLoad(true)"><i data-lucide="refresh-cw"></i> تحديث</button></div></div>`;
  if(DSH.orders===null&&!DSH.err){if(!DSH.loading)dshLoad();main.innerHTML=head+`<p style="color:var(--muted)">…جارٍ التحميل</p>`;applyWallpaper();refreshIcons();return}
  if(DSH.err){main.innerHTML=head+`<div class="card"><div class="badge-note"><i data-lucide="database"></i><div><b>المتجر غير مفعّل بعد.</b><br>١) شغّل <b>supabase/shop.sql</b> في Supabase ← SQL Editor.<br>٢) انشر الدالّة: <code>supabase functions deploy shop --no-verify-jwt</code><br><small style="color:var(--muted)">${esc(DSH.err)}</small></div></div></div>`;applyWallpaper();refreshIcons();return}

  const O=DSH.orders,paid=O.filter(o=>o.status==='paid');
  const revenue=paid.reduce((a,o)=>a+Number(o.amount||0),0);
  const month=new Date();month.setDate(1);month.setHours(0,0,0,0);
  const mRev=paid.filter(o=>new Date(o.paid_at||o.created_at)>=month).reduce((a,o)=>a+Number(o.amount||0),0);
  const dlBy={};(DSH.dl||[]).forEach(d=>{dlBy[d.order_id]=(dlBy[d.order_id]||0)+1});
  const q=DSH.q.trim().toLowerCase();
  const trWait=O.filter(o=>o.pay_method==='transfer'&&o.status==='pending');
  const list=O.filter(o=>(DSH.filter==='all'||(DSH.filter==='transfer'?(o.pay_method==='transfer'&&o.status==='pending'):o.status===DSH.filter))&&(!q||[o.buyer_name,o.buyer_email,o.buyer_phone,o.title].join(' ').toLowerCase().includes(q)));
  const pill=(k,l,n)=>`<button class="btn btn-sm ${DSH.filter===k?'btn-primary':'btn-ghost'}" onclick="DSH.filter='${k}';renderDShop()">${l} <span style="opacity:.7">${n}</span></button>`;

  const base=s=>String(s||'').split('@')[0];
  const prodCards=(DSH.products||[]).filter(p=>!p.sku.includes('@')).map(p=>{
    const sold=paid.filter(o=>base(o.sku)===p.sku);
    // أسعار خاصّة غير معلنة: الموقع يعرضها تلقائيّاً لزوّار هذه الدول (حسب IP)، وبطاقة من بلد آخر ← «مراجعة».
    const reg=p.regional||{};const tiers=(DSH.products||[]).filter(t=>t.sku.startsWith(p.sku+'@'));
    const tierHtml=tiers.length?`<div style="margin:4px 0 10px;padding:10px 12px;border-radius:12px;background:var(--surface2,rgba(0,0,0,.04))">
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px">أسعار خاصّة (غير معلنة — تظهر تلقائيّاً لزوّار هذه الدول)</div>
      ${tiers.map(t=>{const cs=Object.keys(reg).filter(c=>reg[c]===t.sku);const n=sold.filter(o=>o.sku===t.sku).length;
        return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:4px 0"><input type="number" min="1" value="${Number(t.price_sar)}" style="max-width:90px" onchange="dshProd('${esc(t.sku)}',{price_sar:Number(this.value)})"> ر.س
          <span style="font-size:13px">${cs.map(dshFlag).join(' ')||'—'}</span><span style="font-size:12px;color:var(--muted)">${n} مبيع</span></div>`}).join('')}</div>`:'';
    const files=(p.files||[]).map(f=>`<div style="font-size:12px;color:var(--muted);display:flex;gap:6px;align-items:center"><i data-lucide="${f.url?'server':'hard-drive'}" style="width:14px"></i>${esc(f.name)} ${f.size_bytes?'· '+(f.size_bytes/1048576).toFixed(0)+' MB':''} ${f.url||f.path?'':'<b style="color:var(--bad)">— بلا ملفّ!</b>'}</div>`).join('');
    return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <h3 style="margin:0">${esc(p.title)}</h3>
        <label style="display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer" title="${p.active?'ظاهر للبيع':'موقوف'}"><input type="checkbox" ${p.active?'checked':''} onchange="dshProd('${esc(p.sku)}',{active:this.checked})"> ${p.active?'معروض للبيع':'موقوف'}</label></div>
      <div style="display:flex;gap:16px;margin:10px 0;align-items:center;flex-wrap:wrap">
        <div class="field" style="margin:0;max-width:150px"><label>السعر (ر.س)</label><input type="number" min="1" value="${Number(p.price_sar)}" onchange="dshProd('${esc(p.sku)}',{price_sar:Number(this.value)})"></div>
        <div><div style="font-size:22px;font-weight:800">${sold.length}</div><div style="font-size:12px;color:var(--muted)">مبيع</div></div>
        <div><div style="font-size:22px;font-weight:800">${dshMoney(sold.reduce((a,o)=>a+Number(o.amount||0),0))}</div><div style="font-size:12px;color:var(--muted)">الإيراد</div></div>
        <a class="btn btn-ghost btn-sm" href="https://ibrahimsaud.com/shop/${encodeURIComponent(p.slug)}/" target="_blank" rel="noopener"><i data-lucide="external-link"></i> الصفحة</a>
      </div>${tierHtml}${files}</div>`;
  }).join('');

  const rows=list.map(o=>{
    const [l,c]=DSH_ST[o.status]||[o.status,'#888'];const wa=dshPhoneWa(o.buyer_phone);
    return `<tr>
      <td><b>${esc(o.buyer_name)}</b><div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(o.buyer_email)}</div>${o.buyer_phone?`<div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(o.buyer_phone)}</div>`:''}</td>
      <td>${esc(o.title)}</td><td style="white-space:nowrap">${dshMoney(o.amount)}${o.buyer_country?`<div style="font-size:12px;color:var(--muted)" title="بلد الزائر${o.card_country?' · بلد البطاقة':''}">${dshFlag(o.buyer_country)}${o.card_country&&o.card_country!==o.buyer_country?' · بطاقة '+dshFlag(o.card_country):''}</div>`:''}</td>
      <td><span class="badge" style="background:${c}22;color:${c}">${l}</span>${o.pay_method==='transfer'?`<div style="margin-top:4px"><span class="badge" style="background:#2F66FF22;color:#2F66FF" title="رقم الطلب اللي يرسله المشتري على واتساب">تحويل · <span dir="ltr">${o.id.slice(0,8).toUpperCase()}</span></span>${o.status==='pending'?` <button class="btn btn-primary btn-sm" onclick="dshTransferPaid('${o.id}')" title="وصل المبلغ — يتحوّل مدفوعاً ويوصله رابط التنزيل على إيميله">وصل التحويل ✓</button>`:''}</div>`:''}${o.hold?`<div><span class="badge" style="background:#f59e0b22;color:#b45309;margin-top:4px" title="سعر خاصّ ببطاقة من بلد آخر — التنزيل موقوف">مراجعة</span> <button class="btn btn-ghost btn-sm" onclick="dshApprove('${o.id}')" title="افتح التنزيل لهذا الطلب">اعتمد</button></div>`:''}</td>
      <td style="white-space:nowrap;font-size:12px">${dshDate(o.paid_at||o.created_at)}</td>
      <td style="text-align:center">${dlBy[o.id]||0}</td><td style="text-align:center">${(o.trusted_devices||[]).length}/3</td>
      <td style="white-space:nowrap">
        ${o.status==='paid'?`<button class="btn btn-ghost btn-sm" title="يرسل للمشتري رابط طلبه من جديد" onclick="dshResend('${esc(o.buyer_email)}')"><i data-lucide="send"></i></button>
        <button class="btn btn-ghost btn-sm" title="يمسح الأجهزة الموثّقة — أوّل جهاز يفتح الطلب يُوثَّق" onclick="dshResetDevices('${o.id}')"><i data-lucide="smartphone"></i></button>`:''}
        ${wa?`<a class="btn btn-ghost btn-sm" href="${wa}" target="_blank" rel="noopener" title="واتساب"><i data-lucide="message-circle"></i></a>`:''}
        <a class="btn btn-ghost btn-sm" href="mailto:${esc(o.buyer_email)}" title="إيميل"><i data-lucide="mail"></i></a></td></tr>`;
  }).join('');

  main.innerHTML=head+`
    <div class="stats" style="margin-bottom:20px">
      <div class="stat"><span class="ic"><i data-lucide="badge-check"></i></span><div class="v">${paid.length}</div><div class="l">طلب مدفوع</div></div>
      <div class="stat"><span class="ic"><i data-lucide="wallet"></i></span><div class="v">${dshMoney(revenue)}</div><div class="l">إجمالي الإيراد</div></div>
      <div class="stat"><span class="ic"><i data-lucide="calendar"></i></span><div class="v">${dshMoney(mRev)}</div><div class="l">إيراد هذا الشهر</div></div>
      <div class="stat"><span class="ic"><i data-lucide="download"></i></span><div class="v">${(DSH.dl||[]).length}</div><div class="l">تنزيل</div></div>
    </div>
    <h2 style="margin:6px 0 10px;font-size:17px">المنتجات</h2>
    <div class="grid">${prodCards||'<div class="card">ما فيه منتجات — أضفها في supabase/shop.sql</div>'}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:24px 0 10px;flex-wrap:wrap">
      <h2 style="margin:0;font-size:17px">الطلبات والمشترون</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${trWait.length||DSH.filter==='transfer'?pill('transfer','تحويل بانتظار',trWait.length):''}${pill('paid','مدفوع',paid.length)}${pill('pending','بانتظار',O.filter(o=>o.status==='pending').length)}${pill('failed','فشل',O.filter(o=>o.status==='failed'||o.status==='cancelled').length)}${pill('all','الكل',O.length)}
        <input placeholder="بحث بالاسم أو الإيميل…" value="${esc(DSH.q)}" oninput="DSH.q=this.value;clearTimeout(window.__dshT);window.__dshT=setTimeout(renderDShop,250)" style="max-width:200px">
        <button class="btn btn-ghost btn-sm" onclick="dshCsv()"><i data-lucide="file-down"></i> تصدير CSV</button></div></div>
    <div class="card" style="overflow:auto"><table class="hr-table" style="width:100%"><thead><tr><th>المشتري</th><th>المنتج</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>تنزيلات</th><th>أجهزة</th><th></th></tr></thead>
      <tbody>${rows||'<tr><td colspan="8" style="color:var(--muted);text-align:center;padding:24px">ما فيه طلبات هنا بعد</td></tr>'}</tbody></table></div>
    <p style="color:var(--muted);font-size:12px;margin-top:10px">«إرسال الرابط» يرسل للمشتري رابط طلبه من جديد (نفس «استرجع طلبك» في الموقع). «الأجهزة» يمسحها فيقدر يفتح طلبه من جهاز جديد.</p>`;
  applyWallpaper();refreshIcons();
}
const DSH_CC={SA:'السعودية',AE:'الإمارات',KW:'الكويت',QA:'قطر',BH:'البحرين',OM:'عُمان',EG:'مصر',MA:'المغرب',DZ:'الجزائر',TN:'تونس',LY:'ليبيا',JO:'الأردن',LB:'لبنان',IQ:'العراق',PS:'فلسطين',SY:'سوريا',YE:'اليمن',SD:'السودان',MR:'موريتانيا',SO:'الصومال',DJ:'جيبوتي',KM:'جزر القمر',TD:'تشاد',SS:'جنوب السودان',ER:'إريتريا',NE:'النيجر',ML:'مالي',SN:'السنغال',GM:'غامبيا',GN:'غينيا',BF:'بوركينا فاسو',ET:'إثيوبيا',KE:'كينيا',TZ:'تنزانيا',NG:'نيجيريا',AF:'أفغانستان',PK:'باكستان',BD:'بنغلاديش',IN:'الهند',ID:'إندونيسيا',MY:'ماليزيا',TR:'تركيا',MV:'المالديف',KZ:'كازاخستان',UZ:'أوزبكستان',KG:'قرغيزستان',TJ:'طاجيكستان',TM:'تركمانستان',AZ:'أذربيجان',BA:'البوسنة',AL:'ألبانيا',XK:'كوسوفو'};
function dshFlag(c){c=String(c||'').toUpperCase();if(!/^[A-Z]{2}$/.test(c))return '';return String.fromCodePoint(...[...c].map(x=>0x1F1A5+x.charCodeAt(0)))+' '+(DSH_CC[c]||c)}
async function dshApprove(id){
  if(!confirm('اعتماد الطلب وفتح التنزيل للمشتري؟'))return;
  const {error}=await sb.from('shop_orders').update({hold:null,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('تعذّر: '+error.message);return}
  const o=DSH.orders.find(x=>x.id===id);if(o)o.hold=null;renderDShop();
}
// طلب «بالتحويل»: بعد ما يوصل المبلغ — يتحوّل مدفوعاً (RLS المالك) ثمّ الدالّة ترسل للمشتري رابط التنزيل.
async function dshTransferPaid(id){
  const o=(DSH.orders||[]).find(x=>x.id===id);if(!o)return;
  const v=prompt('وصلك التحويل من '+o.buyer_name+'؟\nالمبلغ المستلم بالريال (عدّله لو اختلف):',String(Number(o.amount)));
  if(v===null)return;const amt=Number(String(v).replace(/[^\d.]/g,''));if(!(amt>0)){alert('مبلغ غير صحيح');return}
  const now=new Date().toISOString();
  const {data,error}=await sb.from('shop_orders').update({status:'paid',paid_at:now,paid_amount:amt,hold:null,updated_at:now}).eq('id',id).eq('pay_method','transfer').eq('status','pending').select('id');
  if(error){alert('تعذّر: '+error.message);return}
  if(!data||!data.length){alert('الطلب ما عاد بانتظار — حدّث الصفحة');return}
  Object.assign(o,{status:'paid',paid_at:now});renderDShop();
  try{const r=await fetch(DSH_FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY},body:JSON.stringify({action:'transfer-notify',id})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
    alert('تم ✓ أُرسل لـ'+o.buyer_name+' رابط التنزيل على '+o.buyer_email);}
  catch(e){alert('اعتُمد الطلب، لكن تعذّر إرسال الإيميل: '+(e.message||e)+'\nاستخدم زرّ «إرسال الرابط» بعد دقيقتين.')}
  try{extAutoSync(true)}catch(e){}
}
async function dshProd(sku,patch){
  const {error}=await sb.from('shop_products').update({...patch,updated_at:new Date().toISOString()}).eq('sku',sku);
  if(error){alert('تعذّر الحفظ: '+error.message);return}
  const p=(DSH.products||[]).find(x=>x.sku===sku);if(p)Object.assign(p,patch);renderDShop();
}
async function dshResend(email){
  if(!confirm('نرسل للمشتري رابط طلبه من جديد على '+email+'؟'))return;
  try{const r=await fetch(DSH_FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY},body:JSON.stringify({action:'recover',email})});
    if(!r.ok)throw new Error('HTTP '+r.status);alert('أُرسل ✓ (لو أُرسل له رابط خلال الدقيقتين الماضيتين ينتظر قليلاً)');}
  catch(e){alert('تعذّر الإرسال: '+(e.message||e))}
}
async function dshResetDevices(id){
  if(!confirm('مسح الأجهزة الموثّقة لهذا الطلب؟ أوّل جهاز يفتح الرابط بعدها يُوثَّق تلقائيّاً.'))return;
  const {error}=await sb.from('shop_orders').update({trusted_devices:[],updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('تعذّر: '+error.message);return}
  const o=DSH.orders.find(x=>x.id===id);if(o)o.trusted_devices=[];renderDShop();
}
function dshCsv(){
  const head=['الاسم','الإيميل','الجوال','المنتج','المبلغ','الحالة','التاريخ'];
  const rows=(DSH.orders||[]).map(o=>[o.buyer_name,o.buyer_email,o.buyer_phone||'',o.title,o.amount,(DSH_ST[o.status]||[o.status])[0],o.paid_at||o.created_at]);
  const csv='﻿'+[head,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='طلبات-المتجر.csv';a.click();
}

/* ═══════════ ربط المتاجر بالمبيعات والمحاسبة (مكان واحد لكل الدخل) ═══════════
 * كل طلب مدفوع — من المتجر الرقميّ أو متجر حروف — يصير «أمر بيع» + «فاتورة» بدفعتها،
 * فيدخل صفحة المبيعات والفوترة، و accSyncPayments يحوّل الدفعة لقيد دخل في المحاسبة
 * (وحدة «الإنتاج» للمتجر الرقميّ، و«حروف ودروس» لمتجر حروف). كل طلب يُستورد مرّة وحدة (extKey). */
function extBrand(pref){const b=brandProfiles().find(x=>x.id===pref);return b?b.id:defaultBrandId()}
function extSaleImport(o){
  if(!S.sales)S.sales=[];if(!S.invoices)S.invoices=[];if(!S.counters)S.counters={};
  if(S.sales.some(s=>s.extKey===o.key)||S.invoices.some(i=>i.extKey===o.key))return false;
  const vat=taxOn(),k=vat?1.15:1;   // أسعار المتاجر شاملة الضريبة
  const items=o.items.map(it=>({desc:it.desc,qty:it.qty||1,price:Number(it.price)/k,discount:0}));
  const note=o.source+' — طلب '+o.ref;
  const sale={id:uid(),number:(S.counters.sale=(S.counters.sale||0)+1),client:o.client||'عميل المتجر',contactId:'',date:o.date,items,discType:'none',discVal:0,
    notes:note,status:'sale',vat,vatRate:15,brandId:o.brandId,extKey:o.key,source:o.source};
  const inv={id:uid(),number:++S.counters.invoice,client:sale.client,contactId:'',clientVat:'',date:o.date,items:JSON.parse(JSON.stringify(items)),discType:'none',discVal:0,
    notes:note,status:'unpaid',vat,vatRate:15,paidDate:o.date,payments:[{id:uid(),date:o.date,amount:r2(o.total),method:o.method}],
    brandId:o.brandId,fromSaleId:sale.id,extKey:o.key,source:o.source,extUnit:o.unit};
  sale.invoiceId=inv.id;S.sales.push(sale);S.invoices.push(inv);try{syncInvStatus(inv)}catch(e){}
  return true;
}
// يضبط وحدة المحاسبة لقيود فواتير المتاجر (المتجر الرقميّ ← الإنتاج، حروف ← حروف)
function extFixUnits(){const A=acc();(S.invoices||[]).forEach(inv=>{if(!inv.extUnit)return;A.tx.forEach(t=>{if(t.invoiceId===inv.id&&t.unit!==inv.extUnit&&A.units.some(u=>u.id===inv.extUnit))t.unit=inv.extUnit})})}
function extIsoDate(s){try{const d=new Date(s);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}catch(_){return today()}}

async function extSyncStores(){
  if(/[?&]demo=/.test(location.search)||typeof USER==='undefined'||!USER)return 0;   // التجربة لا تكتب في المبيعات
  let n=0;
  // المتجر الرقميّ (Supabase)
  try{
    const r=await sb.from('shop_orders').select('id,title,amount,buyer_name,status,paid_at,created_at,pay_method').eq('status','paid').order('paid_at',{ascending:true}).limit(1000);
    if(!r.error)(r.data||[]).forEach(o=>{if(extSaleImport({key:'shop:'+o.id,source:'المتجر الرقميّ',ref:o.id.slice(0,8).toUpperCase(),client:o.buyer_name,
      date:extIsoDate(o.paid_at||o.created_at),items:[{desc:o.title,qty:1,price:o.amount}],total:o.amount,method:o.pay_method==='transfer'?'تحويل (المتجر الرقميّ)':'Telr (المتجر الرقميّ)',brandId:extBrand('ibrahim'),unit:'prod'}))n++});
  }catch(e){console.warn('extSync shop',e)}
  // متجر حروف (خادم حروف)
  try{
    const list=await hrApi('admin/store/orders');
    (list.orders||[]).filter(o=>o.paymentStatus==='paid').forEach(o=>{
      const items=(o.items||[]).map(l=>({desc:l.name||l.sku,qty:l.qty||1,price:Number(l.unitPrice??l.price??0)})).filter(x=>x.price>0);
      if(extSaleImport({key:'hr:'+(o.ref||o.no),source:'متجر حروف ودروس',ref:'#'+o.no,client:o.customer&&o.customer.name,date:extIsoDate(o.paidAt||o.createdAt),
        items:items.length?items:[{desc:'طلب متجر حروف ودروس',qty:1,price:o.total}],total:o.total,method:'Telr (متجر حروف)',brandId:extBrand('huroof'),unit:'huroof'}))n++;
    });
  }catch(e){/* خادم حروف غير متاح الآن — نحاول المرّة الجاية */}
  if(n){try{accSyncPayments();extFixUnits()}catch(e){}save()}
  return n;
}
// مرّة كل جلسة (وعند الضغط على «تحديث» في المتجر): يستورد الجديد ويعيد رسم الصفحة الحاليّة
let EXT_SYNCED=0;
function extAutoSync(force){
  if(!force&&Date.now()-EXT_SYNCED<10*60000)return;EXT_SYNCED=Date.now();
  extSyncStores().then(n=>{if(n){console.info('أُضيف '+n+' طلب من المتاجر للمبيعات');rerender()}});
}
