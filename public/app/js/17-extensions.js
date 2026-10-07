/*
 * 17-extensions.js — إضافات: الموردون والكاشير
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ============================================================
   ===== إضافات: الموردون + الكاشير + المساعد الذكي =====
   ============================================================ */
function ensureExtStyles(){if(document.getElementById('extCSS'))return;const st=document.createElement('style');st.id='extCSS';st.textContent=`
  .pos-wrap{display:grid;grid-template-columns:1fr 360px;gap:16px;align-items:start}
  @media(max-width:900px){.pos-wrap{grid-template-columns:1fr}}
  .pos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px}
  .pos-tile{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:10px;cursor:pointer;text-align:center;transition:.15s}
  .pos-tile:hover{border-color:var(--gold);transform:translateY(-2px)}
  .pos-tile img{width:100%;height:78px;object-fit:cover;border-radius:8px;background:var(--panel3)}
  .pos-tile .nm{font-weight:700;font-size:13px;margin-top:6px;min-height:34px;line-height:1.3}
  .pos-tile .pr{color:var(--gold2);font-weight:800;font-size:13px}
  .pos-tile .stk{font-size:11px;color:var(--muted)}
  .pos-cart{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;position:sticky;top:12px}
  .pos-line{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)}
  .pos-line .qtybtn{width:26px;height:26px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);cursor:pointer;font-weight:800;font-size:15px}
  .ai-wrap{display:grid;grid-template-columns:230px 1fr;gap:14px;height:calc(100vh - 160px);min-height:440px}
  @media(max-width:900px){.ai-wrap{grid-template-columns:1fr;height:auto}}
  .ai-side{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px;overflow:auto}
  .ai-chatitem{padding:8px 10px;border-radius:10px;cursor:pointer;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ai-chatitem:hover{background:var(--panel2)}
  .ai-chatitem.on{background:var(--goldsoft);color:var(--ink)}
  .ai-main{display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;min-height:440px}
  .ai-msgs{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
  .ai-msg{max-width:82%;padding:10px 14px;border-radius:14px;line-height:1.75;white-space:pre-wrap;font-size:14px;word-break:break-word}
  .ai-msg.user{align-self:flex-start;background:var(--goldsoft);border:1px solid var(--line)}
  .ai-msg.assistant{align-self:flex-end;background:var(--panel2);border:1px solid var(--line)}
  .ai-inbar{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
  .ai-inbar textarea{flex:1;resize:none;min-height:46px;max-height:150px}
`;document.head.appendChild(st)}
function waLink(phone,text){return 'https://wa.me/'+String(phone||'').replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(text||'')}
/* كانت باسم daysSince فتطغى على daysSince الأولى (سطر ~2373) في النطاق
   العامّ الواحد — تلك تُرجع 0 عند الخطأ وهذه null، فاختلّ سلوك ما كُتب على
   الأولى. الاسم المميّز يفكّ التصادم. */
function daysAgoOrNull(dateStr){if(!dateStr)return null;const d=new Date(dateStr+'T12:00:00');if(isNaN(d))return null;return Math.floor((Date.now()-d.getTime())/86400000)}
function ageLabel(dateStr){const n=daysAgoOrNull(dateStr);if(n==null)return '—';if(n<=0)return 'اليوم';if(n===1)return 'أمس';if(n<30)return 'منذ '+n+' يوم';const m=Math.floor(n/30);if(m<12)return 'منذ '+m+' شهر';return 'منذ '+Math.floor(m/12)+' سنة'}
function ageColor(dateStr){const n=daysAgoOrNull(dateStr);if(n==null)return 'var(--muted)';if(n>=90)return 'var(--bad)';if(n>=45)return 'var(--warn)';return 'var(--good)'}

/* ===== الموردون ===== */
function renderSuppliers(){
  ensureExtStyles();const list=S.suppliers||[];
  const body=!list.length?emptyBox('truck','لا يوجد موردون بعد. أضف مورّدك الأول.'):`<div class="grid">${list.map(s=>{
    const files=s.files||[];const latest=files.map(f=>f.received).filter(Boolean).sort().slice(-1)[0];
    const stale=files.some(f=>{const n=daysAgoOrNull(f.received);return n!=null&&n>=90});
    return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div><div style="font-weight:800;font-size:16px">${esc(s.name)}</div>${s.category?`<div style="color:var(--muted);font-size:13px">${esc(s.category)}</div>`:''}</div>
        ${stale?`<span class="pill" style="background:rgba(239,68,68,.15);color:var(--bad)">ملف قديم</span>`:''}</div>
      <div style="color:var(--muted);font-size:13px;margin:8px 0"><i class="inl" data-lucide="file"></i> ${files.length} ملف${latest?` · آخر تحديث <span style="color:${ageColor(latest)}">${ageLabel(latest)}</span>`:''}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="openSupplier('${s.id}')"><i data-lucide="folder-open"></i> الملفات</button>
        <button class="btn btn-ghost btn-sm" onclick="supRequestWA('${s.id}')"><i data-lucide="message-circle"></i> طلب تحديث</button>
        <button class="btn btn-ghost btn-sm" onclick="supplierModal('${s.id}')"><i data-lucide="pencil"></i></button></div>
    </div>`}).join('')}</div>`;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الموردون</h1><button class="btn btn-gold" onclick="supplierModal()">+ مورّد</button></div>
    <div class="badge-note"><i data-lucide="truck"></i> <div>احفظ ملفات كل مورّد (PDF/Excel) مع تاريخ استلامها تلقائياً، وتابع عمر كل ملف. اضغط «طلب تحديث» لإرسال رسالة واتساب جاهزة لطلب أحدث ملف.</div></div>
    ${body}`;
  refreshIcons();
}
function supplierModal(id){
  let s=id?{...(S.suppliers||[]).find(x=>x.id===id)}:{id:'',name:'',phone:'',category:'',notes:'',active:true,files:[]};
  openModal(id?'تعديل مورّد':'مورّد جديد',`
    <div class="field"><label>اسم المورّد</label><input id="sp_name" value="${esc(s.name)}"></div>
    <div class="row2"><div class="field"><label>الجوال (واتساب)</label><input id="sp_phone" value="${esc(s.phone)}" placeholder="9665..." dir="ltr"></div>
    <div class="field"><label>التصنيف</label><input id="sp_cat" value="${esc(s.category)}" placeholder="مواد غذائية / إلكترونيات"></div></div>
    <div class="field"><label>ملاحظات</label><textarea id="sp_notes" rows="2">${esc(s.notes)}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;const name=g('sp_name').trim();if(!name){alert('أدخل الاسم');return}s.name=name;s.phone=g('sp_phone').trim();s.category=g('sp_cat').trim();s.notes=g('sp_notes').trim();if(!S.suppliers)S.suppliers=[];if(id){const i=S.suppliers.findIndex(x=>x.id===id);S.suppliers[i]=s}else{s.id=uid();s.files=[];S.suppliers.push(s)}save();closeModal();id?openSupplier(id):renderSuppliers()},
  id?()=>{if(confirm('حذف المورّد وكل ملفاته؟')){S.suppliers=S.suppliers.filter(x=>x.id!==id);save();closeModal();renderSuppliers()}}:null);
}
function openSupplier(id){
  ensureExtStyles();const s=(S.suppliers||[]).find(x=>x.id===id);if(!s){renderSuppliers();return}
  const files=(s.files||[]).slice().sort((a,b)=>(b.received||'').localeCompare(a.received||''));
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><button class="link-btn" onclick="renderSuppliers()">← الموردون</button> ${esc(s.name)}</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" onclick="supRequestWA('${s.id}')"><i data-lucide="message-circle"></i> طلب تحديث واتساب</button><button class="btn btn-gold" onclick="supAddFileModal('${s.id}')">+ ملف</button></div></div>
    ${(s.phone||s.category)?`<div class="badge-note"><i data-lucide="info"></i> <div>${s.phone?`الجوال: ${esc(s.phone)}`:''}${s.phone&&s.category?' · ':''}${s.category?`التصنيف: ${esc(s.category)}`:''}${s.notes?`<br>${esc(s.notes)}`:''}</div></div>`:''}
    ${!files.length?emptyBox('file-x','لا ملفات بعد لهذا المورّد. اضغط «+ ملف».'):`<table><thead><tr><th>الملف</th><th>النوع</th><th>تاريخ الاستلام</th><th>العمر</th><th></th></tr></thead><tbody>
      ${files.map(f=>`<tr><td><a href="${esc(f.url)}" target="_blank" rel="noopener" style="color:var(--gold2)"><i class="inl" data-lucide="${f.type==='excel'?'sheet':f.type==='pdf'?'file-text':'file'}"></i> ${esc(f.name)}</a>${f.note?`<div style="font-size:12px;color:var(--muted)">${esc(f.note)}</div>`:''}</td>
      <td>${f.type==='excel'?'Excel':f.type==='pdf'?'PDF':'ملف'}${f.source==='drive'?' · Drive':''}</td><td>${esc(f.received||'—')}</td>
      <td style="color:${ageColor(f.received)};font-weight:700">${ageLabel(f.received)}</td>
      <td style="white-space:nowrap"><button class="link-btn del" onclick="supDelFile('${s.id}','${f.id}')">حذف</button></td></tr>`).join('')}
    </tbody></table>`}`;
  refreshIcons();
}
function supAddFileModal(supId){
  openModal('إضافة ملف مورّد',`
    <div class="badge-note"><i data-lucide="info"></i><div>ارفع الملف مباشرة أو الصق رابط Google Drive. تاريخ الاستلام يُسجَّل تلقائياً (يمكن تعديله).</div></div>
    <div class="field"><label>اسم الملف</label><input id="sf_name" placeholder="قائمة أسعار مارس / جرد المخزون"></div>
    <div class="row2"><div class="field"><label>النوع</label><select id="sf_type"><option value="pdf">PDF</option><option value="excel">Excel</option><option value="other">آخر</option></select></div>
    <div class="field"><label>تاريخ الاستلام</label><input type="date" id="sf_date" value="${today()}"></div></div>
    <div class="field"><label>رفع الملف (اختياري)</label><input type="file" id="sf_file" accept=".pdf,.xls,.xlsx,.csv,application/pdf"> <span id="sf_status" style="color:var(--muted);font-size:12px"></span></div>
    <div class="field"><label>أو رابط Google Drive</label><input id="sf_url" placeholder="https://drive.google.com/..." dir="ltr"></div>
    <div class="field"><label>ملاحظة (اختياري)</label><input id="sf_note"></div>`,
  async ()=>{const s=(S.suppliers||[]).find(x=>x.id===supId);if(!s)return;const g=i=>document.getElementById(i);
    const name=g('sf_name').value.trim();const type=g('sf_type').value;const date=g('sf_date').value||today();const url0=g('sf_url').value.trim();const note=g('sf_note').value.trim();const file=g('sf_file').files[0];
    if(!name){alert('أدخل اسم الملف');return}
    let url=url0,source=url0?'drive':'';
    if(file){const st=g('sf_status');if(st)st.textContent='جارٍ الرفع…';try{const ext=(file.name.split('.').pop()||'pdf').toLowerCase();const path=`${USER.id}/suppliers/${uid()}.${ext}`;const {error}=await sb.storage.from('supplier-files').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(error)throw error;url=sb.storage.from('supplier-files').getPublicUrl(path).data.publicUrl;source='upload';}catch(err){if(st)st.textContent='';alert('تعذّر رفع الملف: '+(err.message||err)+'\n\nأنشئ bucket عام باسم «supplier-files» في Supabase → Storage.');return}}
    if(!url){alert('ارفع ملفاً أو الصق رابط Drive');return}
    if(!s.files)s.files=[];s.files.push({id:uid(),name,type,url,source,received:date,note});save();closeModal();openSupplier(supId);
  });
}
function supDelFile(supId,fileId){const s=(S.suppliers||[]).find(x=>x.id===supId);if(!s)return;if(!confirm('حذف هذا الملف من السجل؟'))return;s.files=(s.files||[]).filter(f=>f.id!==fileId);save();openSupplier(supId)}
function supRequestWA(supId){const s=(S.suppliers||[]).find(x=>x.id===supId);if(!s)return;if(!s.phone){alert('لا يوجد رقم جوال لهذا المورّد. أضِفه أولاً من «تعديل».');return}
  const msg=`السلام عليكم ${s.name}\nنأمل تزويدنا بأحدث ملف (قائمة الأسعار / جرد المخزون) لطلب المنتجات.\nوشكراً لتعاونكم.\n${S.settings.brand||''}`;
  window.open(waLink(s.phone,msg),'_blank');
}

/* ===== الكاشير (POS) ===== */
let POS_CART=[];let POS_FILTER='';let POS_STREAM=null;let POS_PAY='نقداً';
function posProducts(){return (S.products||[]).filter(p=>{if(!POS_FILTER)return true;const q=POS_FILTER.toLowerCase();return (p.name||'').toLowerCase().includes(q)||(p.barcode||'').includes(POS_FILTER)||(p.category||'').toLowerCase().includes(q)})}
function renderPOS(){
  ensureExtStyles();
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الكاشير</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" onclick="posCameraScan()"><i data-lucide="camera"></i> مسح بالكاميرا</button><button class="btn btn-ghost" onclick="productModal()"><i data-lucide="plus"></i> منتج</button></div></div>
    <div class="pos-wrap">
      <div>
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
          <input id="posScan" placeholder="امسح الباركود (قارئ USB) ثم Enter" onkeydown="if(event.key==='Enter'){posScanEnter(this)}" style="flex:1;min-width:200px">
          <input id="posSearch" placeholder="بحث بالاسم/التصنيف" value="${esc(POS_FILTER)}" oninput="POS_FILTER=this.value;posRenderGrid()" style="flex:1;min-width:150px"></div>
        <div id="posGrid" class="pos-grid"></div>
      </div>
      <div id="posCart" class="pos-cart"></div>
    </div>`;
  posRenderGrid();posRenderCart();refreshIcons();
  setTimeout(()=>{const el=document.getElementById('posScan');if(el)el.focus()},60);
}
function posRenderGrid(){const g=document.getElementById('posGrid');if(!g)return;const ps=posProducts();
  g.innerHTML=ps.length?ps.map(p=>`<div class="pos-tile" onclick="posAdd('${p.id}')">
    ${p.image?`<img src="${esc(p.image)}">`:`<div style="height:78px;border-radius:8px;background:var(--panel3);display:flex;align-items:center;justify-content:center"><i data-lucide="package"></i></div>`}
    <div class="nm">${esc(p.name)}</div><div class="pr">${money(p.price)}</div>
    ${p.stock!=null?`<div class="stk" style="${Number(p.stock)<=0?'color:var(--bad)':''}">متوفر: ${p.stock}</div>`:''}
  </div>`).join(''):emptyBox('package','لا منتجات مطابقة. أضف منتجاً بزر «منتج».');
  refreshIcons();
}
function posAdd(pid){const p=(S.products||[]).find(x=>x.id===pid);if(!p)return;const line=POS_CART.find(c=>c.pid===pid);if(line)line.qty++;else POS_CART.push({pid,name:p.name,price:Number(p.price||0),qty:1});posRenderCart()}
function posScanEnter(inp){const code=(inp.value||'').trim();inp.value='';if(!code)return;const p=(S.products||[]).find(x=>(x.barcode||'')===code);if(p){posAdd(p.id)}else if(confirm('لا يوجد منتج بالباركود «'+code+'». تسجيله كمنتج جديد؟')){productModal();setTimeout(()=>{const b=document.getElementById('p_barcode');if(b)b.value=code;const n=document.getElementById('p_name');if(n)n.focus()},80)}}
function posQty(pid,d){const c=POS_CART.find(x=>x.pid===pid);if(!c)return;c.qty+=d;if(c.qty<=0)POS_CART=POS_CART.filter(x=>x.pid!==pid);posRenderCart()}
function posRemove(pid){POS_CART=POS_CART.filter(x=>x.pid!==pid);posRenderCart()}
function posClear(){if(POS_CART.length&&!confirm('تفريغ السلة؟'))return;POS_CART=[];posRenderCart()}
function posRenderCart(){const el=document.getElementById('posCart');if(!el)return;
  const sub=POS_CART.reduce((a,c)=>a+c.price*c.qty,0);const vatOn=S.settings.vat.enabled;const rate=Number(S.settings.vat.rate||0);const vat=vatOn?sub*rate/100:0;const total=sub+vat;
  el.innerHTML=`<div style="font-weight:800;font-size:16px;margin-bottom:8px"><i class="inl" data-lucide="shopping-cart"></i> السلة (${POS_CART.length})</div>
    ${!POS_CART.length?`<div style="color:var(--muted);padding:20px 0;text-align:center">امسح أو اختر منتجاً لبدء البيع</div>`:POS_CART.map(c=>`<div class="pos-line">
      <div style="flex:1"><div style="font-weight:700;font-size:13px">${esc(c.name)}</div><div style="color:var(--muted);font-size:12px">${money(c.price)} × ${c.qty} = ${money(c.price*c.qty)}</div></div>
      <button class="qtybtn" onclick="posQty('${c.pid}',-1)">−</button><span style="min-width:20px;text-align:center;font-weight:700">${c.qty}</span><button class="qtybtn" onclick="posQty('${c.pid}',1)">+</button>
      <button class="link-btn del" onclick="posRemove('${c.pid}')">×</button></div>`).join('')}
    <div style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px">
      <div style="display:flex;justify-content:space-between;padding:3px 0"><span>المجموع</span><span>${money(sub)}</span></div>
      ${vatOn?`<div style="display:flex;justify-content:space-between;padding:3px 0"><span>الضريبة (${rate}%)</span><span>${money(vat)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:800;font-size:17px"><span>الإجمالي</span><span>${money(total)}</span></div></div>
    <div class="field" style="margin-top:8px"><label>طريقة الدفع</label><select id="posPay"><option ${POS_PAY==='نقداً'?'selected':''}>نقداً</option><option ${POS_PAY==='مدى / بطاقة'?'selected':''}>مدى / بطاقة</option><option ${POS_PAY==='STC Pay'?'selected':''}>STC Pay</option></select></div>
    <button class="btn btn-gold" style="width:100%;margin-top:8px" ${POS_CART.length?'':'disabled'} onclick="posCheckout()"><i data-lucide="check-circle"></i> إتمام البيع (${money(total)})</button>
    ${POS_CART.length?`<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:6px" onclick="posClear()">تفريغ السلة</button>`:''}`;
  refreshIcons();
}
function posCheckout(){if(!POS_CART.length)return;const paySel=document.getElementById('posPay');const method=paySel?paySel.value:POS_PAY;POS_PAY=method;
  const items=POS_CART.map(c=>({desc:c.name,qty:c.qty,price:c.price,discount:0}));
  const inv={id:uid(),number:++S.counters.invoice,client:'عميل نقدي',contactId:'',clientVat:'',date:today(),items,discType:'none',discVal:0,notes:'بيع كاشير',status:'paid',vat:taxOn(),vatRate:15,paidDate:today(),payments:[],pos:true};
  if(taxOn()){S.counters.taxInvoice=(S.counters.taxInvoice||0)+1;inv.issued={no:S.counters.taxInvoice,at:new Date().toISOString()}}
  const total=invTotal(inv);inv.payments.push({id:uid(),date:today(),amount:total,method});
  if(!S.invoices)S.invoices=[];S.invoices.push(inv);
  POS_CART.forEach(c=>{const p=(S.products||[]).find(x=>x.id===c.pid);if(p&&p.stock!=null)p.stock=Math.max(0,Number(p.stock||0)-c.qty)});
  save();POS_CART=[];posRenderGrid();posRenderCart();posReceipt(inv.id);
}
function posReceipt(invId){const d=S.invoices.find(x=>x.id===invId);if(!d)return;const s=S.settings;const sub=docLineSubtotal(d);const tax=invVat(d);const total=invTotal(d);
  const si=sellerInfo();let qr='';if(d.vat&&/^3\d{13}3$/.test(si.vat)){const st=riyadhStamp(d.issued?d.issued.at:new Date().toISOString());qr=`<div style="text-align:center;margin:8px 0">${qrImg(zatcaBase64(si.name,si.vat,st.date+'T'+st.time,total.toFixed(2),tax.toFixed(2)))}</div>`}
  const html=`<html dir="rtl"><head><meta charset="utf-8"><style>*{font-family:Tahoma,Arial,sans-serif}body{width:76mm;margin:0 auto;color:#000;font-size:12px}h2{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse}td{padding:2px 0}.r{text-align:left}hr{border:none;border-top:1px dashed #000;margin:6px 0}</style></head><body>
    ${s.logo?`<div style="text-align:center"><img src="${s.logo}" style="height:40px"></div>`:''}
    <h2>${esc(s.brand||'')}</h2>
    <div style="text-align:center">${d.vat?'فاتورة ضريبية مبسّطة':'إيصال بيع'}</div>
    ${s.vat.number?`<div style="text-align:center">الرقم الضريبي: ${esc(s.vat.number)}</div>`:''}
    <div style="text-align:center">${esc(s.invPrefix||'INV-')}${String(d.number).padStart(5,'0')} · ${d.date}</div><hr>
    <table>${d.items.map(it=>`<tr><td>${esc(it.desc)} ×${it.qty}</td><td class="r">${lineTotal(it).toFixed(2)}</td></tr>`).join('')}</table><hr>
    <table><tr><td>المجموع</td><td class="r">${sub.toFixed(2)}</td></tr>${d.vat?`<tr><td>الضريبة (${d.vatRate}%)</td><td class="r">${tax.toFixed(2)}</td></tr>`:''}<tr><td><b>الإجمالي</b></td><td class="r"><b>${total.toFixed(2)} ${esc(s.currency)}</b></td></tr><tr><td>الدفع</td><td class="r">${esc((d.payments[0]||{}).method||'')}</td></tr></table>
    ${qr}<div style="text-align:center;margin-top:8px">شكراً لزيارتكم 🌿</div></body></html>`;
  const f=document.createElement('iframe');f.style.position='fixed';f.style.right='-9999px';document.body.appendChild(f);const doc=f.contentWindow.document;doc.open();doc.write(html);doc.close();
  setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){}setTimeout(()=>f.remove(),1500)},400);
}
async function posCameraScan(){
  if(!('BarcodeDetector' in window)){alert('المسح بالكاميرا غير مدعوم في هذا المتصفح. استخدم قارئ باركود USB أو متصفح Chrome حديث.');return}
  let formats=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'];
  try{const sup=await BarcodeDetector.getSupportedFormats();formats=formats.filter(f=>sup.includes(f));if(!formats.length)formats=undefined}catch(e){}
  let detector;try{detector=new BarcodeDetector(formats?{formats}:undefined)}catch(e){alert('تعذّر تشغيل قارئ الباركود: '+(e.message||e));return}
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){alert('تعذّر فتح الكاميرا: '+(e.message||e));return}
  POS_STREAM=stream;
  document.getElementById('modalRoot').innerHTML=`<div class="modal-bg"><div class="modal" style="max-width:420px"><div class="modal-head"><h3>مسح الباركود</h3><button class="x" onclick="posStopCamera()">×</button></div><div class="modal-body"><video id="posVid" autoplay playsinline muted style="width:100%;border-radius:12px;background:#000"></video><div style="text-align:center;color:var(--muted);margin-top:8px">وجّه الكاميرا نحو الباركود…</div></div></div></div>`;
  const vid=document.getElementById('posVid');vid.srcObject=stream;
  const tick=async()=>{if(!POS_STREAM)return;try{const codes=await detector.detect(vid);if(codes&&codes.length){const code=codes[0].rawValue;const p=(S.products||[]).find(x=>(x.barcode||'')===code);posStopCamera();if(p){posAdd(p.id)}else if(confirm('لا يوجد منتج بالباركود «'+code+'». تسجيله كمنتج جديد؟')){productModal();setTimeout(()=>{const b=document.getElementById('p_barcode');if(b)b.value=code},80)}return}}catch(e){}requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
function posStopCamera(){if(POS_STREAM){POS_STREAM.getTracks().forEach(t=>t.stop());POS_STREAM=null}closeModal()}

function renderSettings(){
  const s=S.settings;const v=s.vat;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الإعدادات</h1><button class="btn btn-gold" onclick="saveSettings()"><i data-lucide="save"></i> حفظ الإعدادات</button></div>
    <div class="set-grid">

      <div class="card"><h3 style="margin-top:0"><i data-lucide="sun-moon"></i> المظهر (النظام)</h3>
        <p style="color:var(--muted);font-size:13px;margin:0 0 12px">اختر النظام الداكن أو الفاتح — وتتبدّل الخلفيات المتاحة تلقائياً حسب اختيارك.</p>
        <div style="display:flex;gap:10px">
          <button class="btn ${((s.theme||'dark')==='dark')?'btn-gold':'btn-ghost'}" onclick="setTheme('dark')" style="flex:1"><i data-lucide="moon"></i> داكن</button>
          <button class="btn ${(s.theme==='light')?'btn-gold':'btn-ghost'}" onclick="setTheme('light')" style="flex:1"><i data-lucide="sun"></i> فاتح</button>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="wallpaperModal()" style="margin-top:12px;width:100%"><i data-lucide="image"></i> تخصيص الخلفية</button>
      </div>

      <div class="card"><h3 style="margin-top:0"><i data-lucide="building-2"></i> هوية المؤسسة</h3>
        <div class="logo-upload" style="margin-bottom:16px"><img id="logoPrev" src="${s.logo||LOGO}" onerror="this.style.display='none'"><div><button class="btn btn-ghost btn-sm" onclick="document.getElementById('logoFile').click()"><i data-lucide="upload"></i> رفع شعار</button><div style="color:var(--muted);font-size:12px;margin-top:6px">يظهر في القائمة والفواتير</div></div></div>
        <input type="file" id="logoFile" accept="image/*" class="hidden" onchange="uploadLogo(event)">
        <div class="field"><label>صورتي الشخصية (تظهر في كل مقالات المدونة)</label>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><img id="authPhotoPrev" src="${esc(s.authorPhoto||(BLOG.settings&&BLOG.settings.author_avatar_url)||'')}" style="width:54px;height:54px;border-radius:50%;object-fit:cover;background:var(--panel2);border:1px solid var(--line);${(s.authorPhoto||(BLOG.settings&&BLOG.settings.author_avatar_url))?'':'display:none'}" onerror="this.style.display='none'">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('authPhotoFile').click()"><i data-lucide="upload"></i> رفع صورتي</button><span id="authPhotoStatus" style="color:var(--muted);font-size:12px"></span></div>
          <input type="file" id="authPhotoFile" accept="image/*" class="hidden" onchange="blogUploadAvatar(event)">
        </div>
        <div class="row2"><div class="field"><label>اسم المؤسسة</label><input id="s_brand" value="${esc(s.brand)}"></div><div class="field"><label>اسم المالك</label><input id="s_owner" value="${esc(s.owner)}"></div></div>
        <div class="row2"><div class="field"><label>البريد</label><input id="s_email" value="${esc(s.email)}"></div><div class="field"><label>الجوال</label><input id="s_phone" value="${esc(s.phone)}"></div></div>
        <div class="field"><label>العملة</label><input id="s_curr" value="${esc(s.currency)}"></div>
      </div>

      <div class="card"><h3 style="margin-top:0"><i data-lucide="badge-percent"></i> نوع الفاتورة</h3>
        <div style="display:flex;gap:10px" id="taxModeBtns" data-on="${v.enabled?1:0}">
          <button type="button" class="btn ${!v.enabled?'btn-gold':'btn-ghost'}" onclick="setTaxMode(false)" style="flex:1">فاتورة عاديّة</button>
          <button type="button" class="btn ${v.enabled?'btn-gold':'btn-ghost'}" onclick="setTaxMode(true)" style="flex:1">فاتورة ضريبيّة</button>
        </div>
        <p style="color:var(--muted);font-size:13px;margin:10px 0 0;line-height:1.8">فعّل «الضريبيّة» يوم يصدر رقمك الضريبي: كلّ فاتورة بعدها بضريبة ١٥٪ ورمز QR وبيانات منشأتك، وتُقفل بعد إصدارها.</p>
        <div id="taxFields" style="margin-top:14px;${v.enabled?'':'display:none'}">
          <div class="row2"><div class="field"><label>الرقم الضريبي</label><input id="v_num" value="${esc(v.number||'')}" dir="ltr" inputmode="numeric" maxlength="15" placeholder="3xxxxxxxxxxxxx3"></div><div class="field"><label>السجل التجاري</label><input id="v_cr" value="${esc(v.cr||'')}" dir="ltr"></div></div>
          <div style="font-size:12px;font-weight:700;color:var(--muted);margin:2px 0 8px">العنوان الوطني</div>
          <div class="row2"><div class="field"><label>الشارع</label><input id="v_street" value="${esc(v.street||'')}"></div><div class="field"><label>رقم المبنى</label><input id="v_building" value="${esc(v.building||'')}" dir="ltr" inputmode="numeric" maxlength="4"></div></div>
          <div class="row2"><div class="field"><label>الحيّ</label><input id="v_district" value="${esc(v.district||'')}"></div><div class="field"><label>المدينة</label><input id="v_city" value="${esc(v.city||'')}"></div></div>
          <div class="row2"><div class="field"><label>الرمز البريدي</label><input id="v_postal" value="${esc(v.postal||'')}" dir="ltr" inputmode="numeric" maxlength="5"></div><div></div></div>
        </div>
      </div>

      <div class="card"><h3 style="margin-top:0"><i data-lucide="landmark"></i> بيانات الدفع</h3>
        <div class="row2"><div class="field"><label>بادئة رقم الفاتورة</label><input id="s_prefix" value="${esc(s.invPrefix)}" placeholder="INV-"></div><div class="field"><label>الآيبان (IBAN) — الحساب الأساسي</label><input id="s_iban" value="${esc(s.iban||DEFAULT_BANK.iban)}" dir="ltr"></div></div>
        <div class="row2"><div class="field"><label>اسم البنك</label><input id="s_bank" value="${esc(s.bankName||DEFAULT_BANK.name)}"></div><div class="field"><label>اسم صاحب الحساب</label><input id="s_accname" value="${esc(s.accName||DEFAULT_BANK.accName)}"></div></div>
        <div class="field"><label>شعار البنك (يظهر تلقائياً بجانب بيانات الدفع في كل مستند)</label>
          <div id="s_banklogo_prev" style="margin:6px 0 8px"><span style="display:inline-flex;align-items:center;gap:10px"><img src="${esc(s.bankLogo||DEFAULT_BANK.logo)}" style="height:36px;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:8px;padding:5px 10px">${s.bankLogo?'<button type="button" class="link-btn del" onclick="clearBankLogo()">استعادة الافتراضي</button>':'<span style="font-size:12px;color:var(--muted)">الافتراضي: شعار البنك الأهلي — قابل للاستبدال</span>'}</span></div>
          <input type="file" accept="image/*" id="s_banklogo_file" onchange="uploadBankLogo(event)">
          <div style="font-size:11px;color:var(--muted);margin-top:4px">ارفع صورة لاستبدال الشعار الافتراضي (اختياري).</div>
        </div>
        <div class="field"><label>ملاحظة تُكتب تلقائياً في كلّ فاتورة جديدة</label><textarea id="s_terms" rows="2">${esc(s.terms)}</textarea></div>
      </div>

      <div class="card"><h3 style="margin-top:0"><i data-lucide="shield-check"></i> الحساب والنسخ الاحتياطي</h3>
        <div class="field"><label>الحساب الحالي</label><input value="${esc((USER&&USER.email)||'')}" disabled></div>
        <div class="badge-note"><i data-lucide="cloud-check"></i> <div>بياناتك تُحفظ وتُزامن تلقائياً في السحابة (Supabase) لحظياً — لا حاجة لنسخ يدوي. تقدر أيضاً تنزّل نسخة JSON احتياطية.</div></div>
        <div class="toolbar"><button class="btn btn-ghost btn-sm" onclick="exportData()"><i data-lucide="download"></i> تنزيل نسخة JSON</button>
        <button class="btn btn-ghost btn-sm" onclick="logout()"><i data-lucide="log-out"></i> تسجيل الخروج</button></div>
      </div>

    </div>`;
  refreshIcons();
}
function uploadLogo(e){const f=e.target.files[0];if(!f)return;if(f.size>1500000){alert('حجم الصورة كبير (أقل من 1.5MB)');return}const r=new FileReader();r.onload=()=>{S.settings.logo=r.result;save();applyBranding();const p=document.getElementById('logoPrev');if(p){p.src=r.result;p.style.display='block'}alert('تم تحديث الشعار')};r.readAsDataURL(f)}
function uploadBankLogo(e){const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{S.settings.bankLogo=r.result;save();const pv=document.getElementById('s_banklogo_prev');if(pv)pv.innerHTML=`<span style="display:inline-flex;align-items:center;gap:8px"><img src="${S.settings.bankLogo}" style="height:34px;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px 8px"><button type="button" class="link-btn del" onclick="clearBankLogo()">حذف</button></span>`;};r.readAsDataURL(f);}
function clearBankLogo(){S.settings.bankLogo='';save();const pv=document.getElementById('s_banklogo_prev');if(pv)pv.innerHTML=`<span style="display:inline-flex;align-items:center;gap:10px"><img src="${DEFAULT_BANK.logo}" style="height:36px;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:8px;padding:5px 10px"><span style="font-size:12px;color:var(--muted)">الافتراضي: شعار البنك الأهلي — قابل للاستبدال</span></span>`;const f=document.getElementById('s_banklogo_file');if(f)f.value='';}
function saveSettings(){const g=i=>document.getElementById(i).value;Object.assign(S.settings,{brand:g('s_brand'),owner:g('s_owner'),email:g('s_email'),phone:g('s_phone'),currency:g('s_curr'),invPrefix:g('s_prefix'),iban:g('s_iban'),bankName:g('s_bank'),accName:g('s_accname'),terms:g('s_terms')});const on=document.getElementById('taxModeBtns').dataset.on==='1';
  S.settings.vat=Object.assign(S.settings.vat||{},{rate:15,number:g('v_num').trim(),cr:g('v_cr').trim(),street:g('v_street').trim(),building:g('v_building').trim(),district:g('v_district').trim(),city:g('v_city').trim(),postal:g('v_postal').trim()});
  /* لا تُفعَّل الضريبيّة ببياناتٍ ناقصة — فاتورةٌ ضريبيّة بلا رقمٍ صحيح أسوأ من لا شيء. */
  if(on){const miss=taxSettingsIssues();if(miss.length){save();alert('حُفظت البيانات، لكنّ الفاتورة الضريبيّة لم تُفعَّل — ينقص:\n• '+miss.join('\n• '));return}}
  S.settings.vat.enabled=on;save();applyBranding();alert('تم الحفظ')}
function setTaxMode(on){const w=document.getElementById('taxModeBtns');if(!w)return;w.dataset.on=on?'1':'0';const [a,b]=w.querySelectorAll('button');a.className='btn '+(on?'btn-ghost':'btn-gold');b.className='btn '+(on?'btn-gold':'btn-ghost');const f=document.getElementById('taxFields');if(f)f.style.display=on?'':'none'}
function exportData(){const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='backup-'+today()+'.json';a.click()}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{localStorage.setItem(KEY,r.result);S=load();save();alert('تم الاستيراد');go('settings')}catch(x){alert('ملف غير صالح')}};r.readAsText(f)}
function resetData(){if(confirm('مسح جميع البيانات نهائياً؟')){localStorage.removeItem(KEY);S=load();save();go('home')}}
