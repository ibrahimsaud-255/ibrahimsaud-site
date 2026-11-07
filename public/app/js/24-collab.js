/*
 * 24-collab.js — تطبيق «المتعاونون» (المعرّف collab).
 * متعاونون من خارج المملكة (أوّلهم صهيب — المغرب) يبيعون خدماتهم لعملاء
 * السعوديّة والخليج عبر المؤسسة: العرض والفاتورة والتحصيل باسم المؤسسة، والمؤسسة
 * تأخذ نسبة (١٠٪ افتراضياً، لكلّ متعاون نسبته) وتحوّل له الباقي عبر STC Pay ← Western Union.
 * ─────────────────────────────────────────────────────────────────────────
 * الحلقة:
 *   المتعاون (بوابته collab.html#رمز + PIN) يجهّز عرضاً/طلب رابط دفع ← «إرسال»
 *   ← يظهر هنا في «المهام» ← clbApprove: عرض سعر رسميّ في المبيعات (S.sales) + رابط Telr
 *     + نسخة مطبوعة منشورة للبوابة ← العميل يدفع ← clbPaid: فاتورة رسميّة (S.invoices)
 *     + دفعة + نسخة منشورة ← clbPayout: حوالة واحدة لعدّة صفقات (MTCN + إيصال).
 *   كلّ خطوة تُسجَّل في collab_events (من/متى/ماذا) — سجلّ قانونيّ مع شواهد العمل.
 *
 * البيانات في جداول Supabase collab_* (supabase/collab.sql) — مالكٍ فقط، والبوابة
 * لا تلمسها إلا عبر دوالّ بالرمز+PIN. الحساب المشترك: collab-calc.js.
 * الضريبة: تُنشر للبوابة من taxOn() عند فتح التطبيق، فتتطابق مجاميع الطرفين.
 *
 * ⚠️ نطاقٌ عامّ واحد + تعريفات فقط (انظر رأس 01-core.js). البادئة cb لكلّ شيء.
 */

let CLB={members:[],deals:[],payouts:[],settings:{},loaded:false,err:''}, CLB_TAB='inbox', CLB_F={member:'',status:''}, CLB_SM={member:'',month:''};
const CLB_DEAL_COLS='id,member_id,kind,status,title,client,items,subtotal,vat,total,pay_method,rate,fee_bearer,partner_note,owner_note,pay_url,doc_no,sale_ref,invoice_ref,invoice_no,paid,payout_id,created_at,updated_at,submitted_at';
const CLB_PORTAL=()=>location.origin+'/app/collab.html#';

function clbFees(){return collabFees(CLB.settings.fees)}
function clbMember(id){return CLB.members.find(m=>m.id===id)||{name:'—',rate:0}}
function clbPill(st){const s=COLLAB_STATUS[st]||{label:st,tone:'mut'};const map={mut:'draft',warn:'progress',bad:'lost',info:'quoted',good:'won'};return `<span class="pill ${map[s.tone]||'draft'}">${esc(s.label)}</span>`}
function clbSar(n){return Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' ر.س'}
function clbToast(t){const e=document.createElement('div');e.textContent=t;e.style.cssText='position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--gold);color:#111;font-weight:800;border-radius:12px;padding:10px 16px;z-index:9999;font-size:14px';document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}
function clbDay(s){return s?String(s).slice(0,10):''}

async function clbLoad(){
  if(WS_DEMO){CLB.err='demo';CLB.loaded=true;return}
  try{
    const [m,d,p,s]=await Promise.all([
      sb.from('collab_members').select('id,name,email,phone,country,city,currency,rate,fee_bearer,perms,payout,status,portal_token,pin_hash,last_seen,notes,created_at').order('created_at'),
      sb.from('collab_deals').select(CLB_DEAL_COLS).order('created_at',{ascending:false}),
      sb.from('collab_payouts').select('id,member_id,sent_at,channel,sar_sent,fee,fx,received,ref,note,created_at').order('sent_at',{ascending:false}),
      sb.from('collab_settings').select('key,value')]);
    const e=m.error||d.error||p.error||s.error;if(e)throw e;
    CLB.members=(m.data||[]).map(x=>Object.assign(x,{has_pin:!!x.pin_hash,pin_hash:undefined}));
    CLB.deals=d.data||[];CLB.payouts=p.data||[];CLB.settings={};(s.data||[]).forEach(r=>CLB.settings[r.key]=r.value);
    CLB.err='';CLB.loaded=true;
    clbPublishVat();
  }catch(e){CLB.err=e.message||String(e);CLB.loaded=true}
}
/* الضريبة في البوابة تتبع مفتاح الفاتورة الضريبيّة في الإعدادات */
async function clbPublishVat(){const on=taxOn();if(CLB.settings.vat&&!!CLB.settings.vat.enabled===on)return;
  CLB.settings.vat={enabled:on};await sb.from('collab_settings').upsert({key:'vat',value:{enabled:on},updated_at:new Date().toISOString()})}
async function clbLog(dealId,memberId,action,data){try{await sb.from('collab_events').insert({deal_id:dealId,member_id:memberId,actor:'owner',action,data:data||null})}catch(e){}}
async function clbUpdDeal(id,patch){const {error}=await sb.from('collab_deals').update(Object.assign({updated_at:new Date().toISOString()},patch)).eq('id',id);if(error)throw error}

async function renderCollab(){
  const main=document.getElementById('main');
  if(!CLB.loaded){main.innerHTML='<div class="page-head"><h1>المتعاونون</h1></div><p style="color:var(--muted)">…جارٍ التحميل</p>';await clbLoad();if(CUR!=='collab')return}
  if(CLB.err==='demo'){main.innerHTML=`<div class="page-head"><h1>المتعاونون</h1></div>${emptyBox('handshake','هذا التطبيق يعمل على بيانات Supabase الحقيقيّة — افتحه بعد تسجيل الدخول (ليس في الوضع التجريبيّ).')}`;refreshIcons();return}
  if(CLB.err){main.innerHTML=`<div class="page-head"><h1>المتعاونون</h1></div><div class="card" style="color:var(--bad)">تعذّر التحميل: ${esc(CLB.err)} <button class="btn btn-ghost btn-sm" onclick="CLB.loaded=false;renderCollab()">إعادة</button></div>`;return}
  const inbox=CLB.deals.filter(d=>d.status==='submitted').length;
  const unpaid=CLB.deals.filter(d=>d.status==='paid').length;
  const TABS=[['inbox','المهام','inbox',inbox],['deals','الصفقات','file-text',0],['payouts','الحوالات','send',unpaid],['statement','الكشف الشهريّ','scroll-text',0],['members','المتعاونون','users',0],['fees','الرسوم والصرف','percent',0]];
  main.innerHTML=`<div class="page-head"><h1>المتعاونون</h1><div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="CLB.loaded=false;renderCollab()"><i data-lucide="refresh-cw"></i> تحديث</button>
      <button class="btn btn-gold" onclick="clbMemberModal()">+ متعاون</button></div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${TABS.map(([k,l,ic,n])=>`<button class="btn btn-sm ${CLB_TAB===k?'btn-gold':'btn-ghost'}" onclick="CLB_TAB='${k}';renderCollab()"><i data-lucide="${ic}"></i> ${l}${n?` <span style="background:var(--bad);color:#fff;border-radius:10px;padding:0 7px;font-size:11px;font-weight:800">${n}</span>`:''}</button>`).join('')}</div>
    <div id="clbView"></div>`;
  ({inbox:clbInbox,deals:clbDeals,payouts:clbPayouts,statement:clbStatement,members:clbMembers,fees:clbFeesView}[CLB_TAB]||clbInbox)();
  refreshIcons();
}

/* ===== المهام ===== */
function clbDealRow(d){const m=clbMember(d.member_id);const c=collabCalc(d,clbFees(),{noTransfer:true});
  return `<tr><td><button class="link-btn" style="padding:0" onclick="clbDeal('${d.id}')">${esc(d.client&&d.client.name||'—')}</button>${d.title?`<div style="font-size:11px;color:var(--muted)">${esc(d.title)}</div>`:''}</td>
    <td>${esc(m.name)}</td><td>${d.kind==='paylink'?'رابط دفع':'عرض سعر'}${d.doc_no?` <span style="color:var(--muted)">#${esc(d.doc_no)}</span>`:''}</td>
    <td>${clbSar(d.total)}</td><td style="color:var(--gold)">${clbSar(c.foundationNet)}</td><td>${clbSar(c.share)}</td><td>${clbPill(d.status)}</td>
    <td>${clbDay(d.submitted_at||d.created_at)}</td></tr>`}
function clbTable(rows){return rows.length?`<div class="card" style="overflow-x:auto"><table><thead><tr><th>العميل</th><th>المتعاون</th><th>النوع</th><th>الإجمالي</th><th>للمؤسسة</th><th>حصّته</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>${rows.map(clbDealRow).join('')}</tbody></table></div>`:''}
function clbInbox(){
  const sub=CLB.deals.filter(d=>d.status==='submitted');
  const appr=CLB.deals.filter(d=>d.status==='approved');
  const paid=CLB.deals.filter(d=>d.status==='paid');
  const month=today().slice(0,7);
  const mPaid=CLB.deals.filter(d=>d.paid&&String(d.paid.at||'').slice(0,7)===month);
  const sum=k=>mPaid.reduce((a,d)=>a+collabCalc(d,clbFees(),{noTransfer:true})[k],0);
  document.getElementById('clbView').innerHTML=`
    <div class="grid4" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:14px">
      <div class="card"><div style="color:var(--muted);font-size:12px">تحصيل هذا الشهر</div><div style="font-size:20px;font-weight:900">${clbSar(sum('total'))}</div></div>
      <div class="card"><div style="color:var(--muted);font-size:12px">دخل المؤسسة هذا الشهر</div><div style="font-size:20px;font-weight:900;color:var(--gold)">${clbSar(sum('foundationNet'))}</div></div>
      <div class="card"><div style="color:var(--muted);font-size:12px">مستحقّ للمتعاونين (لم يُحوَّل)</div><div style="font-size:20px;font-weight:900">${clbSar(paid.reduce((a,d)=>a+collabCalc(d,clbFees(),{noTransfer:true}).share,0))}</div></div>
      <div class="card"><div style="color:var(--muted);font-size:12px">بانتظار دفع العميل</div><div style="font-size:20px;font-weight:900">${appr.length}</div></div>
    </div>
    <h3 style="margin:6px 0 8px">بانتظار مراجعتك ${sub.length?`(${sub.length})`:''}</h3>
    ${sub.length?clbTable(sub):`<div class="card" style="color:var(--muted)">لا طلبات جديدة. ✓</div>`}
    ${appr.length?`<h3 style="margin:16px 0 8px">أُرسل رابط الدفع — تابع الدفع</h3>${clbTable(appr)}`:''}
    ${paid.length?`<h3 style="margin:16px 0 8px">مدفوعة — جاهزة للحوالة</h3>${clbTable(paid)}<button class="btn btn-gold" onclick="clbPayoutModal()"><i data-lucide="send"></i> تسجيل حوالة</button>`:''}`;
}
function clbDeals(){
  let rows=CLB.deals;if(CLB_F.member)rows=rows.filter(d=>d.member_id===CLB_F.member);if(CLB_F.status)rows=rows.filter(d=>d.status===CLB_F.status);
  document.getElementById('clbView').innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <select onchange="CLB_F.member=this.value;clbDeals()" style="max-width:220px"><option value="">كلّ المتعاونين</option>${CLB.members.map(m=>`<option value="${m.id}" ${CLB_F.member===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select>
    <select onchange="CLB_F.status=this.value;clbDeals()" style="max-width:220px"><option value="">كلّ الحالات</option>${Object.entries(COLLAB_STATUS).map(([k,v])=>`<option value="${k}" ${CLB_F.status===k?'selected':''}>${v.label}</option>`).join('')}</select></div>
    ${clbTable(rows)||emptyBox('file-text','لا صفقات.')}`;refreshIcons();
}

/* ===== الصفقة ===== */
function clbSplitHTML(d){const c=collabCalc(d,clbFees());
  const ln=(a,b,st)=>`<div style="display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line);${st||''}"><span>${a}</span><b>${b}</b></div>`;
  return ln('يدفع العميل',clbSar(c.total))+(c.vat?ln('منها الضريبة (للهيئة)','− '+clbSar(c.vat)):'')
    +ln(`نسبة المؤسسة (${c.rate}٪)`,clbSar(c.commission),'color:var(--gold)')
    +ln(`رسوم Telr — ${collabMethodLabel(c.method)}${c.gwActual?' (فعليّة)':' (تقديريّة)'}`,(c.onFoundation?'على المؤسسة ':'على المتعاون ')+clbSar(c.gw))
    +ln('صافي المؤسسة',clbSar(c.foundationNet),'color:var(--gold)')
    +ln('حصّة المتعاون قبل الحوالة',clbSar(c.share))
    +ln('رسوم الحوالة (لو حُوّلت وحدها)','− '+clbSar(c.wu))
    +ln('يصله تقريباً',`${Number(c.local).toLocaleString('en-US',{maximumFractionDigits:2})} ${esc(c.cur)}`,'border:0');
}
async function clbDeal(id){
  const d=CLB.deals.find(x=>x.id===id);if(!d)return;const m=clbMember(d.member_id);
  const [ev,lg]=await Promise.all([sb.from('collab_evidence').select('id,kind,url,caption,data,created_at').eq('deal_id',id).order('created_at'),
    sb.from('collab_events').select('actor,action,at').eq('deal_id',id).order('at')]);
  const evs=ev.data||[];const sale=d.sale_ref&&S.sales.find(x=>x.id===d.sale_ref);const inv=d.invoice_ref&&S.invoices.find(x=>x.id===d.invoice_ref);
  const st=d.status;
  const body=`
    <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px"><div><b>${esc(m.name)}</b> · ${d.kind==='paylink'?'رابط دفع سريع':'عرض سعر'} ${clbPill(st)}</div>
      <div style="color:var(--muted);font-size:12px">${[d.client.phone,d.client.email,d.client.city,d.client.vat?'ضريبيّ '+d.client.vat:''].filter(Boolean).map(esc).join(' · ')}</div></div>
    ${d.partner_note?`<div class="badge-note"><i data-lucide="message-square"></i><div><b>ملاحظة المتعاون:</b> ${esc(d.partner_note)}</div></div>`:''}
    <table class="items-tbl" style="margin:8px 0"><thead><tr><th>البند</th><th>كمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>
      ${(d.items||[]).map(it=>`<tr><td>${esc(it.desc)}</td><td>${it.qty}</td><td>${clbSar(it.price)}</td><td>${clbSar(it.qty*it.price)}</td></tr>`).join('')}</tbody></table>
    <div class="card" style="margin:10px 0;font-size:13.5px">${clbSplitHTML(d)}</div>
    <div class="field"><label>رابط الدفع (Telr)</label><input id="cb_pay" dir="ltr" value="${esc(d.pay_url||'')}" placeholder="https://secure.telr.com/gateway/ql/..."></div>
    <div class="field"><label>ملاحظة للمتعاون (تظهر له)</label><textarea id="cb_note" rows="2">${esc(d.owner_note||'')}</textarea></div>
    ${['submitted','draft','changes'].includes(st)?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <button class="btn btn-gold" onclick="clbApprove('${id}')"><i data-lucide="badge-check"></i> اعتماد${d.kind==='quote'?' وإنشاء عرض السعر':''}</button>
        <button class="btn btn-ghost" onclick="clbChanges('${id}')">طلب تعديل</button>
        <button class="btn btn-ghost" style="color:var(--bad)" onclick="clbCancel('${id}')">رفض</button></div>`:''}
    ${st==='approved'?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <button class="btn btn-gold" onclick="clbPaidModal('${id}')"><i data-lucide="wallet"></i> تسجيل الدفع وإصدار الفاتورة</button>
        <button class="btn btn-ghost" onclick="clbSaveLink('${id}')">حفظ الرابط والملاحظة</button>
        <button class="btn btn-ghost" onclick="clbReopen('${id}')">إعادة للمتعاون</button></div>`:''}
    ${['paid','settled'].includes(st)?`<div class="badge-note"><i data-lucide="wallet"></i><div>دُفعت ${esc(clbDay(d.paid&&d.paid.at))} — ${clbSar(d.paid&&d.paid.amount)} · ${esc(collabMethodLabel(d.paid&&d.paid.method))}${d.paid&&d.paid.ref?' · مرجع '+esc(d.paid.ref):''}${d.payout_id?' · حُوّلت ✓':''}</div></div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px">
      ${sale?`<button class="btn btn-ghost btn-sm" onclick="closeModal();openDoc('sale','${sale.id}')">فتح عرض السعر ${esc(docNo('sale',sale))}</button>`:''}
      ${inv?`<button class="btn btn-ghost btn-sm" onclick="closeModal();openDoc('invoice','${inv.id}')">فتح الفاتورة</button>`:''}
      ${sale||inv?`<button class="btn btn-ghost btn-sm" onclick="clbRepublish('${id}')"><i data-lucide="upload"></i> تحديث النسخ في بوابته</button>`:''}</div>
    <h4 style="margin:12px 0 6px">شواهد العمل (${evs.length})</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">${evs.map(e=>e.kind==='link'
      ?`<a class="card" style="padding:8px;font-size:12px;word-break:break-all;margin:0" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">🔗 ${esc(e.caption||e.url)}</a>`
      :`<div class="card" style="padding:6px;margin:0;font-size:11px"><img src="${esc(e.data)}" style="width:100%;height:84px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="clbImg(this.src)"><div>${esc(e.caption||'')}</div></div>`).join('')||'<span style="color:var(--muted);font-size:13px">لم يُرفق شيء بعد.</span>'}</div>
    <h4 style="margin:12px 0 6px">السجلّ</h4>
    <div style="font-size:12px;color:var(--muted);line-height:1.8">${(lg.data||[]).map(x=>`• ${esc(String(x.at).slice(0,16).replace('T',' '))} — ${esc(COLLAB_ACTIONS[x.action]||x.action)} (${x.actor==='owner'?'إبراهيم':esc(m.name)})`).join('<br>')}</div>`;
  openModal(esc(d.client.name||'صفقة')+(d.title?' — '+esc(d.title):''),body,()=>clbSaveLink(id));
  const sv=document.getElementById('mSave');if(sv)sv.textContent='حفظ الرابط والملاحظة';
}
function clbImg(src){const w=window.open('');if(w)w.document.write(`<body style="margin:0;background:#000;display:grid;place-items:center;min-height:100vh"><img src="${src}" style="max-width:100%;max-height:100vh">`)}
function clbVal(id){const e=document.getElementById(id);return e?e.value.trim():''}
async function clbSaveLink(id){const d=CLB.deals.find(x=>x.id===id);const pay=clbVal('cb_pay'),note=clbVal('cb_note');
  try{await clbUpdDeal(id,{pay_url:pay||null,owner_note:note||null});if(pay!==(d.pay_url||''))await clbLog(id,d.member_id,'link');
    const sale=d.sale_ref&&S.sales.find(x=>x.id===d.sale_ref);if(sale&&sale.payUrl!==pay){sale.payUrl=pay;save();await clbRepublish(id,true)}
    closeModal();CLB.loaded=false;renderCollab()}catch(e){alert('تعذّر: '+e.message)}}

/* نسخة المستند المطبوعة للبوابة — نفس printDocHTML، بقاعدة روابط مطلقة لأصول الصفحة */
function clbSnap(type,id){let h=printDocHTML(type,id);const base=`<base href="${location.origin}/app/">`;
  return /<head[^>]*>/i.test(h)?h.replace(/<head[^>]*>/i,m=>m+base):base+h}
function clbSaleFromDeal(d,payUrl){
  const tplId=quoteDef().defaultTemplateId;const tpl=quoteTemplateById(tplId);
  const exp=new Date();exp.setDate(exp.getDate()+Number(tpl.validityDays||14));
  const number=(S.counters.sale||0)+1;S.counters.sale=number;
  const s={id:uid(),number,client:(d.client.name||'').trim(),contactId:'',clientVat:d.client.vat||'',date:today(),
    expiry:exp.getFullYear()+'-'+_pad2(exp.getMonth()+1)+'-'+_pad2(exp.getDate()),salesperson:S.settings.salesperson||'',
    items:(d.items||[]).map(it=>({desc:it.desc,qty:Number(it.qty)||0,price:Number(it.price)||0,discount:0})),discType:'none',discVal:0,
    notes:'',notesAuto:true,templateId:tplId,depositPct:100,brandId:defaultBrandId(),status:'sent',vat:taxOn(),vatRate:15,
    paidDate:'',payments:[],payUrl:payUrl||'',payQr:'',collabDealId:d.id,collabMemberId:d.member_id};
  s.contactId=findOrCreateContact(s.client);const ct=S.contacts.find(x=>x.id===s.contactId);
  if(ct){if(!ct.phone&&d.client.phone)ct.phone=d.client.phone;if(!ct.email&&d.client.email)ct.email=d.client.email;if(!ct.city&&d.client.city)ct.city=d.client.city;if(d.client.vat&&!ct.vat)ct.vat=d.client.vat}
  s.notes=buildInitialQuoteNotes(s);
  S.sales.push(s);bumpStage(s.contactId,'quoted','عرض سعر #'+number+' عبر المتعاون '+clbMember(d.member_id).name);
  return s;
}
async function clbApprove(id){
  const d=CLB.deals.find(x=>x.id===id);const pay=clbVal('cb_pay'),note=clbVal('cb_note');
  if(!pay&&!confirm('لم تُضف رابط Telr بعد — تعتمد بدونه وتضيفه لاحقاً؟'))return;
  /* المجموع هنا يجب أن يطابق ما رآه المتعاون (الضريبة من نفس المفتاح) */
  const vatNow=taxOn();if(!!(Number(d.vat)>0)!==vatNow&&!confirm('مفتاح الضريبة تغيّر منذ أنشأ المتعاون الصفقة — المبلغ في العرض سيختلف عمّا رآه. متابعة؟'))return;
  try{
    const patch={status:'approved',pay_url:pay||null,owner_note:note||null};
    if(d.kind==='quote'){const s=clbSaleFromDeal(d,pay);save();Object.assign(patch,{sale_ref:s.id,doc_no:docNo('sale',s),quote_html:clbSnap('sale',s.id)})}
    await clbUpdDeal(id,patch);await clbLog(id,d.member_id,'approve',{doc_no:patch.doc_no||null});
    closeModal();CLB.loaded=false;await renderCollab();
  }catch(e){alert('تعذّر الاعتماد: '+e.message)}
}
async function clbChanges(id){const d=CLB.deals.find(x=>x.id===id);const note=clbVal('cb_note');if(!note){alert('اكتب له ما المطلوب تعديله في خانة الملاحظة.');return}
  try{await clbUpdDeal(id,{status:'changes',owner_note:note});await clbLog(id,d.member_id,'changes');closeModal();CLB.loaded=false;renderCollab()}catch(e){alert(e.message)}}
async function clbCancel(id){const d=CLB.deals.find(x=>x.id===id);if(!confirm('رفض الصفقة وإلغاؤها؟'))return;
  try{await clbUpdDeal(id,{status:'cancelled',owner_note:clbVal('cb_note')||d.owner_note});await clbLog(id,d.member_id,'cancel');closeModal();CLB.loaded=false;renderCollab()}catch(e){alert(e.message)}}
async function clbReopen(id){const d=CLB.deals.find(x=>x.id===id);if(!confirm('إعادتها للمتعاون ليعدّلها؟ (عرض السعر المُنشأ يبقى في المبيعات — ألغِه يدوياً إن لزم)'))return;
  try{await clbUpdDeal(id,{status:'changes',owner_note:clbVal('cb_note')||d.owner_note});await clbLog(id,d.member_id,'reopen');closeModal();CLB.loaded=false;renderCollab()}catch(e){alert(e.message)}}
async function clbRepublish(id,silent){const d=CLB.deals.find(x=>x.id===id);const patch={};
  if(d.sale_ref&&S.sales.find(x=>x.id===d.sale_ref)){patch.quote_html=clbSnap('sale',d.sale_ref);patch.doc_no=docNo('sale',S.sales.find(x=>x.id===d.sale_ref))}
  const inv=d.invoice_ref&&S.invoices.find(x=>x.id===d.invoice_ref);
  if(inv&&!taxDraft(inv)){patch.invoice_html=clbSnap('invoice',inv.id);patch.invoice_no=docNo('invoice',inv)}
  try{await clbUpdDeal(id,patch);if(!silent)clbToast('حُدّثت النسخ في بوابته ✓')}catch(e){alert(e.message)}}

/* ===== تسجيل الدفع ← فاتورة رسميّة ===== */
function clbPaidModal(id){const d=CLB.deals.find(x=>x.id===id);const est=collabGateway(d.total,d.pay_method,clbFees());
  openModal('تسجيل دفع العميل — '+esc(d.client.name),`
    <div class="row2"><div class="field"><label>تاريخ الدفع</label><input type="date" id="pd_date" value="${today()}"></div>
      <div class="field"><label>المبلغ المستلم</label><input type="number" step="any" id="pd_amt" value="${d.total}"></div></div>
    <div class="row2"><div class="field"><label>طريقة الدفع الفعليّة</label><select id="pd_m"><option value="mada" ${d.pay_method==='mada'?'selected':''}>مدى / Apple Pay بمدى</option><option value="card" ${d.pay_method!=='mada'?'selected':''}>بطاقة ائتمانيّة / Apple Pay بها</option></select></div>
      <div class="field"><label>رسوم Telr الفعليّة شاملة الضريبة <span style="color:var(--muted);font-weight:400">(التقدير ${clbSar(est)})</span></label><input type="number" step="any" id="pd_fee" value="${est}"></div></div>
    <div class="field"><label>مرجع العمليّة في Telr</label><input id="pd_ref" dir="ltr"></div>
    <div class="badge-note"><i data-lucide="receipt-text"></i><div>تُنشأ الفاتورة الرسميّة في «الفوترة» بدفعتها${taxOn()?'، وتُصدَر فاتورة ضريبيّة (تأكيد الإصدار)':''}، ثمّ تُنشر نسختها في بوابة المتعاون.</div></div>`,
    ()=>clbPaid(id));
}
async function clbPaid(id){
  const d=CLB.deals.find(x=>x.id===id);
  const paid={at:clbVal('pd_date')||today(),amount:r2(clbVal('pd_amt')),method:clbVal('pd_m')==='mada'?'mada':'card',gateway_fee:r2(clbVal('pd_fee')),ref:clbVal('pd_ref')};
  if(!(paid.amount>0)){alert('المبلغ؟');return}
  try{
    let sale=d.sale_ref&&S.sales.find(x=>x.id===d.sale_ref);
    if(!sale){sale=clbSaleFromDeal(d,d.pay_url);}  // رابط الدفع السريع: يُنشأ أمر البيع خلف الكواليس ليتّسق الترقيم والمحاسبة
    sale.status='sale';
    let inv=sale.invoiceId&&S.invoices.find(x=>x.id===sale.invoiceId);
    if(!inv){inv={id:uid(),number:++S.counters.invoice,client:sale.client,contactId:sale.contactId||'',clientVat:sale.clientVat||'',date:paid.at,
      items:JSON.parse(JSON.stringify(sale.items)),discType:'none',discVal:0,notes:S.settings.terms||'',status:'unpaid',vat:taxOn()?true:!!sale.vat,vatRate:15,
      paidDate:'',payments:[],brandId:sale.brandId||defaultBrandId(),payUrl:sale.payUrl||'',payQr:'',fromSaleId:sale.id,collabDealId:d.id,collabMemberId:d.member_id};
      S.invoices.push(inv);sale.invoiceId=inv.id}
    if(!(inv.payments||[]).some(p=>p.collabDealId===d.id)){inv.payments=inv.payments||[];
      inv.payments.push({id:uid(),date:paid.at,amount:Math.min(paid.amount,invDue(inv)||paid.amount),method:paid.method==='mada'?'مدى (Telr)':'بطاقة (Telr)',collabDealId:d.id})}
    syncInvStatus(inv);try{accSyncPayments()}catch(e){}
    bumpStage(inv.contactId,'won','دفع عبر المتعاون '+clbMember(d.member_id).name);save();
    closeModal();
    if(taxOn()&&!inv.issued)issueInvoice(inv.id);   // تأكيد الإصدار (يُقفل الفاتورة ويأخذ رقمها الضريبيّ)
    const patch={status:'paid',paid,sale_ref:sale.id,invoice_ref:inv.id,doc_no:d.doc_no||docNo('sale',sale)};
    if(!taxDraft(inv)){patch.invoice_html=clbSnap('invoice',inv.id);patch.invoice_no=docNo('invoice',inv)}
    await clbUpdDeal(id,patch);await clbLog(id,d.member_id,'paid',{amount:paid.amount,invoice:patch.invoice_no||null});
    CLB.loaded=false;CLB_TAB='inbox';go('collab');
    if(!patch.invoice_html)clbToast('سُجّل الدفع — الفاتورة مسودّة؛ بعد إصدارها اضغط «تحديث النسخ في بوابته».');
  }catch(e){alert('تعذّر: '+e.message)}
}

/* ===== الحوالات (STC Pay ← Western Union) ===== */
function clbPayouts(){
  const due=CLB.members.map(m=>({m,ds:CLB.deals.filter(d=>d.member_id===m.id&&d.status==='paid')})).filter(x=>x.ds.length);
  document.getElementById('clbView').innerHTML=`
    ${due.map(({m,ds})=>{const s=ds.reduce((a,d)=>a+collabCalc(d,clbFees(),{noTransfer:true}).share,0);return `<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <div><b>${esc(m.name)}</b> — ${ds.length} صفقة مدفوعة لم تُحوَّل<div style="color:var(--muted);font-size:12px">مستحقّ ${clbSar(s)} · يُرسَل بعد رسوم الحوالة ≈ ${clbSar(s-collabWu(clbFees()))}</div></div>
      <button class="btn btn-gold" onclick="clbPayoutModal('${m.id}')"><i data-lucide="send"></i> تسجيل حوالة</button></div>`}).join('')}
    <h3 style="margin:14px 0 8px">سجلّ الحوالات</h3>
    ${CLB.payouts.length?`<div class="card" style="overflow-x:auto"><table><thead><tr><th>التاريخ</th><th>المتعاون</th><th>MTCN</th><th>أُرسل</th><th>الرسوم</th><th>الصرف</th><th>استلم</th><th>صفقات</th><th></th></tr></thead><tbody>
      ${CLB.payouts.map(p=>`<tr><td>${esc(clbDay(p.sent_at))}</td><td>${esc(clbMember(p.member_id).name)}</td><td dir="ltr">${esc(p.ref||'—')}</td><td>${clbSar(p.sar_sent)}</td><td>${clbSar(p.fee)}</td><td>${p.fx||'—'}</td><td>${p.received?Number(p.received).toLocaleString('en-US')+' '+esc(clbMember(p.member_id).currency||''):'—'}</td><td>${CLB.deals.filter(d=>d.payout_id===p.id).length}</td>
        <td><button class="link-btn" onclick="clbReceipt('${p.id}')">الإيصال</button></td></tr>`).join('')}</tbody></table></div>`:emptyBox('send','لا حوالات بعد.')}`;
  refreshIcons();
}
async function clbReceipt(id){const {data}=await sb.from('collab_payouts').select('receipt').eq('id',id).single();if(data&&data.receipt)clbImg(data.receipt);else clbToast('لا إيصال مرفق')}
function clbPayoutModal(mid){
  mid=mid||(CLB.deals.find(d=>d.status==='paid')||{}).member_id;if(!mid){clbToast('لا صفقات مدفوعة');return}
  const m=clbMember(mid);const ds=CLB.deals.filter(d=>d.member_id===mid&&d.status==='paid');const f=clbFees();
  openModal('حوالة إلى '+esc(m.name)+' — STC Pay ← Western Union',`
    <div class="field"><label>الصفقات المشمولة</label>${ds.map(d=>{const c=collabCalc(d,f,{noTransfer:true});return `<label style="display:flex;gap:8px;align-items:center;font-weight:500;margin:4px 0"><input type="checkbox" class="po_d" value="${d.id}" data-share="${c.share}" checked onchange="clbPoCalc()" style="width:auto"> ${esc(d.client.name)} — ${esc(clbDay(d.paid&&d.paid.at))} — حصّته ${clbSar(c.share)}</label>`}).join('')}</div>
    <div class="row2"><div class="field"><label>تاريخ الحوالة</label><input type="date" id="po_date" value="${today()}"></div>
      <div class="field"><label>رسوم الحوالة شاملة الضريبة</label><input type="number" step="any" id="po_fee" value="${collabWu(f)}" oninput="clbPoCalc()"></div></div>
    <div class="row2"><div class="field"><label>المبلغ المرسَل (ر.س) <span style="color:var(--muted);font-weight:400">= المستحقّ − الرسوم</span></label><input type="number" step="any" id="po_sar" oninput="clbPoCalc(true)"></div>
      <div class="field"><label>سعر الصرف الفعليّ (${esc(m.currency||'MAD')} لكلّ ريال)</label><input type="number" step="any" id="po_fx" value="${f.fx}" oninput="clbPoCalc(true)"></div></div>
    <div class="row2"><div class="field"><label>ما استلمه بعملته</label><input type="number" step="any" id="po_rcv"></div>
      <div class="field"><label>رقم الحوالة MTCN</label><input id="po_ref" dir="ltr"></div></div>
    <div class="field"><label>صورة إيصال الحوالة (من تطبيق STC Pay)</label><input type="file" id="po_img" accept="image/*"></div>
    <div class="field"><label>ملاحظة</label><input id="po_note"></div>
    <div id="po_sum" class="badge-note"></div>`,()=>clbPayoutSave(mid));
  clbPoCalc();
}
function clbPoCalc(keepSar){const ids=[...document.querySelectorAll('.po_d:checked')];const due=r2(ids.reduce((a,e)=>a+Number(e.dataset.share||0),0));
  const fee=Number(document.getElementById('po_fee').value)||0;const sarEl=document.getElementById('po_sar');if(!keepSar)sarEl.value=r2(due-fee);
  const fx=Number(document.getElementById('po_fx').value)||0;document.getElementById('po_rcv').value=r2((Number(sarEl.value)||0)*fx);
  const diff=r2(due-fee-(Number(sarEl.value)||0));
  document.getElementById('po_sum').innerHTML=`<div>مستحقّ ${clbSar(due)} · رسوم ${clbSar(fee)} · يُرسل ${clbSar(sarEl.value)}${diff?` · <b style="color:var(--warn)">فرق ${clbSar(diff)}</b>`:''}</div>`}
function clbShrink(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{let max=1600,q=.82,out='';
  for(let i=0;i<6;i++){const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);out=c.toDataURL('image/jpeg',q);if(out.length<850000)break;max*=.8;q-=.08}res(out)};im.src=fr.result};fr.readAsDataURL(file)})}
async function clbPayoutSave(mid){
  const ids=[...document.querySelectorAll('.po_d:checked')].map(e=>e.value);if(!ids.length){alert('اختر صفقة واحدة على الأقلّ');return}
  const f=document.getElementById('po_img').files[0];
  const row={member_id:mid,sent_at:clbVal('po_date')||today(),channel:'stcpay_wu',sar_sent:r2(clbVal('po_sar')),fee:r2(clbVal('po_fee')),fx:Number(clbVal('po_fx'))||null,
    received:Number(clbVal('po_rcv'))||null,ref:clbVal('po_ref')||null,note:clbVal('po_note')||null,receipt:f?await clbShrink(f):null};
  try{const {data,error}=await sb.from('collab_payouts').insert(row).select('id').single();if(error)throw error;
    const {error:e2}=await sb.from('collab_deals').update({payout_id:data.id,status:'settled',updated_at:new Date().toISOString()}).in('id',ids);if(e2)throw e2;
    for(const id of ids)await clbLog(id,mid,'settle',{payout:data.id,ref:row.ref});
    closeModal();CLB.loaded=false;CLB_TAB='payouts';renderCollab();clbToast('سُجّلت الحوالة ✓');
  }catch(e){alert('تعذّر: '+e.message)}
}

/* ===== الكشف الشهريّ (التوثيق) ===== */
function clbStatement(){
  if(!CLB_SM.month)CLB_SM.month=today().slice(0,7);if(!CLB_SM.member&&CLB.members[0])CLB_SM.member=CLB.members[0].id;
  const rows=CLB.deals.filter(d=>d.member_id===CLB_SM.member&&d.paid&&String(d.paid.at||'').slice(0,7)===CLB_SM.month);
  const t=k=>rows.reduce((a,d)=>a+collabCalc(d,clbFees(),{noTransfer:true})[k],0);
  const pays=CLB.payouts.filter(p=>p.member_id===CLB_SM.member&&String(p.sent_at).slice(0,7)===CLB_SM.month);
  document.getElementById('clbView').innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
    <select onchange="CLB_SM.member=this.value;clbStatement()" style="max-width:220px">${CLB.members.map(m=>`<option value="${m.id}" ${CLB_SM.member===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select>
    <input type="month" value="${CLB_SM.month}" onchange="CLB_SM.month=this.value;clbStatement()" style="max-width:180px">
    <button class="btn btn-gold btn-sm" onclick="clbPrintStatement()"><i data-lucide="printer"></i> طباعة الكشف مع الشواهد</button></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">
      ${[['حُصّل من العملاء',t('total')],['الضريبة',t('vat')],['نسبة المؤسسة',t('commission')],['رسوم Telr',t('gw')],['صافي المؤسسة',t('foundationNet')],['حصّة المتعاون',t('share')],['حُوّل هذا الشهر',pays.reduce((a,p)=>a+Number(p.sar_sent||0),0)]].map(([l,v])=>`<div class="card" style="margin:0"><div style="color:var(--muted);font-size:12px">${l}</div><div style="font-weight:900;font-size:17px">${clbSar(v)}</div></div>`).join('')}</div>
    ${clbTable(rows)||emptyBox('scroll-text','لا مدفوعات لهذا المتعاون في هذا الشهر.')}`;refreshIcons();
}
async function clbPrintStatement(){
  const m=clbMember(CLB_SM.member);const mo=CLB_SM.month;const f=clbFees();
  const rows=CLB.deals.filter(d=>d.member_id===m.id&&d.paid&&String(d.paid.at||'').slice(0,7)===mo).sort((a,b)=>String(a.paid.at).localeCompare(String(b.paid.at)));
  const pays=CLB.payouts.filter(p=>p.member_id===m.id&&String(p.sent_at).slice(0,7)===mo);
  const w=window.open('','_blank');if(!w)return;w.document.write('<p style="font-family:sans-serif">…جارٍ تجهيز الكشف</p>');
  const evs=rows.length?((await sb.from('collab_evidence').select('deal_id,kind,url,caption,data').in('deal_id',rows.map(d=>d.id)).order('created_at')).data||[]):[];
  const o=officialInfo();const sum=k=>rows.reduce((a,d)=>a+collabCalc(d,f,{noTransfer:true})[k],0);
  const tr=rows.map((d,i)=>{const c=collabCalc(d,f,{noTransfer:true});return `<tr><td>${i+1}</td><td>${esc(clbDay(d.paid.at))}</td><td>${esc(d.client.name)}${d.title?'<br><small>'+esc(d.title)+'</small>':''}</td><td>${(d.items||[]).map(it=>esc(it.desc)).join('، ')}</td><td>${esc(d.doc_no||'—')}<br>${esc(d.invoice_no||'')}</td><td>${clbSar(c.total)}</td><td>${clbSar(c.commission)}</td><td>${clbSar(c.gw)}</td><td>${clbSar(c.share)}</td></tr>`}).join('');
  const evHTML=rows.map(d=>{const es=evs.filter(e=>e.deal_id===d.id);if(!es.length)return '';return `<div class="evd"><h4>${esc(d.client.name)} — ${esc(d.title||'')} (${esc(d.invoice_no||d.doc_no||'')})</h4><div class="evg">${es.map(e=>e.kind==='link'?`<div class="lk">🔗 ${esc(e.caption||'')}<br><span dir="ltr">${esc(e.url)}</span></div>`:`<figure><img src="${e.data}"><figcaption>${esc(e.caption||'')}</figcaption></figure>`).join('')}</div></div>`}).join('');
  w.document.open();w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>كشف_${esc(m.name)}_${mo}</title><style>
    body{font-family:"Thmanyah Sans",Tahoma,sans-serif;color:#111;margin:28px;font-size:12.5px}h1{font-size:19px;margin:0}h2{font-size:15px;margin:22px 0 8px}h4{margin:10px 0 6px;font-size:13px}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px 6px;text-align:right;vertical-align:top}th{background:#f3f4f6}
    .hd{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:12px}.tot td{font-weight:800;background:#fafafa}
    .evg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}figure{margin:0}img{width:100%;height:120px;object-fit:cover;border:1px solid #ddd}figcaption{font-size:10px}.lk{border:1px solid #ddd;padding:6px;font-size:10.5px;word-break:break-all}
    .evd{page-break-inside:avoid}.sig{display:flex;justify-content:space-between;margin-top:40px}.sig div{width:40%;border-top:1px solid #999;padding-top:6px;text-align:center}
    @media print{body{margin:12mm}}</style></head><body>
    <div class="hd"><div><h1>كشف حساب متعاون — ${esc(mo)}</h1><div>${esc(o.brand||'مؤسسة حروف ودروس')}${o.cr?' · س.ت '+esc(o.cr):''}${o.vat?' · ضريبيّ '+esc(o.vat):''}</div></div>
      <div style="text-align:left">المتعاون: <b>${esc(m.name)}</b><br>${esc([m.country,m.city].filter(Boolean).join(' — '))}<br>${esc(m.email||'')}<br>نسبة المؤسسة ${m.rate}٪</div></div>
    <p>يوثّق هذا الكشف الخدمات التي نفّذها المتعاون لعملاء المؤسسة خلال الشهر، والمبالغ المحصّلة عبر بوابة الدفع (Telr) باسم المؤسسة، ونسبة المؤسسة، والمبالغ المحوَّلة للمتعاون عبر STC Pay ← Western Union، مع شواهد العمل المرفقة.</p>
    <h2>الخدمات والمبالغ المحصّلة</h2>
    <table><thead><tr><th>#</th><th>تاريخ الدفع</th><th>العميل</th><th>الخدمة</th><th>العرض / الفاتورة</th><th>المحصّل</th><th>نسبة المؤسسة</th><th>رسوم Telr</th><th>حصّة المتعاون</th></tr></thead>
    <tbody>${tr||'<tr><td colspan="9">لا مدفوعات.</td></tr>'}<tr class="tot"><td colspan="5">المجموع</td><td>${clbSar(sum('total'))}</td><td>${clbSar(sum('commission'))}</td><td>${clbSar(sum('gw'))}</td><td>${clbSar(sum('share'))}</td></tr></tbody></table>
    <h2>الحوالات</h2>
    <table><thead><tr><th>التاريخ</th><th>القناة</th><th>MTCN</th><th>المرسَل</th><th>الرسوم</th><th>الصرف</th><th>المستلَم</th></tr></thead><tbody>
    ${pays.map(p=>`<tr><td>${esc(clbDay(p.sent_at))}</td><td>STC Pay ← Western Union</td><td dir="ltr">${esc(p.ref||'—')}</td><td>${clbSar(p.sar_sent)}</td><td>${clbSar(p.fee)}</td><td>${p.fx||'—'}</td><td>${p.received?Number(p.received).toLocaleString('en-US')+' '+esc(m.currency||''):'—'}</td></tr>`).join('')||'<tr><td colspan="7">لا حوالات في هذا الشهر.</td></tr>'}</tbody></table>
    ${evHTML?`<h2>شواهد العمل</h2>${evHTML}`:''}
    <div class="sig"><div>${esc(o.owner||'إبراهيم سعود')} — عن المؤسسة</div><div>${esc(m.name)} — المتعاون</div></div>
    <p style="color:#888;font-size:10px;margin-top:20px">أُنشئ من نظام المؤسسة في ${new Date().toISOString().slice(0,16).replace('T',' ')}.</p></body></html>`);
  w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch(e){}},600);
}

/* ===== المتعاونون ===== */
function clbMembers(){
  document.getElementById('clbView').innerHTML=CLB.members.length?CLB.members.map(m=>{const ds=CLB.deals.filter(d=>d.member_id===m.id);
    const paid=ds.filter(d=>d.paid);const inc=paid.reduce((a,d)=>a+collabCalc(d,clbFees(),{noTransfer:true}).foundationNet,0);
    return `<div class="card" style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
      <div><b style="font-size:16px">${esc(m.name)}</b> ${m.status==='active'?'<span class="pill won">نشط</span>':'<span class="pill lost">موقوف</span>'} ${m.has_pin?'':'<span class="pill progress">بلا رمز دخول</span>'}
        <div style="color:var(--muted);font-size:12px;margin-top:4px">${esc([m.email,m.country,m.city].filter(Boolean).join(' · '))} · نسبة ${m.rate}٪ · ${ds.length} صفقة · دخل المؤسسة منه ${clbSar(inc)}${m.last_seen?' · آخر دخول '+esc(clbDay(m.last_seen)):''}</div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="clbCopyLink('${m.id}')"><i data-lucide="link"></i> رابط بوابته</button>
        <button class="btn btn-ghost btn-sm" onclick="clbSetPin('${m.id}')"><i data-lucide="key-round"></i> ${m.has_pin?'رمز جديد':'تعيين رمز الدخول'}</button>
        <button class="btn btn-ghost btn-sm" onclick="clbMemberModal('${m.id}')"><i data-lucide="pencil"></i> تعديل</button></div></div>`}).join('')
    :emptyBox('users','لا متعاونين بعد.');refreshIcons();
}
function clbCopyLink(id){const m=clbMember(id);const url=CLB_PORTAL()+m.portal_token;navigator.clipboard&&navigator.clipboard.writeText(url);
  const msg=`أهلاً ${m.name}، هذه بوابتك في نظام مؤسسة حروف ودروس — منها تجهّز عروض الأسعار وتطلب روابط الدفع وتتابع حوالاتك:\n${url}\nرمز الدخول أرسله لك في رسالة منفصلة.`;
  openModal('رابط بوابة '+esc(m.name),`<p style="color:var(--muted);font-size:13px">نُسخ الرابط. أرسله له، وأرسل رمز الدخول في رسالة منفصلة (لا تجمعهما).</p>
    <div class="field"><input dir="ltr" value="${esc(url)}" onclick="this.select()" readonly></div>
    <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/${esc((m.phone||'').replace(/[^\d]/g,''))}?text=${encodeURIComponent(msg)}">إرسال الرابط واتساب</a>`,closeModal)}
async function clbSetPin(id){const m=clbMember(id);const pin=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');
  if(!confirm(`تعيين رمز دخول جديد لـ${m.name}؟ (الرمز القديم يتوقّف)`))return;
  const {data,error}=await sb.rpc('collab_set_pin',{p_member:id,p_pin:pin});if(error||(data&&data.error)){alert('تعذّر: '+((error&&error.message)||data.error));return}
  m.has_pin=true;openModal('رمز دخول '+esc(m.name),`<p>الرمز الجديد (يظهر مرّة واحدة فقط — النظام يحفظه مشفّراً):</p>
    <div style="font-size:34px;font-weight:900;letter-spacing:8px;text-align:center;margin:14px 0" dir="ltr">${pin}</div>
    <p style="color:var(--muted);font-size:13px">أرسله له في رسالة منفصلة عن الرابط. يقدر يغيّره من «حسابي» في بوابته.</p>`,()=>{closeModal();renderCollab()})}
function clbMemberModal(id){const m=id?clbMember(id):{name:'',email:'',phone:'',country:'المغرب',city:'',currency:'MAD',rate:10,fee_bearer:'partner',perms:{quote:true,paylink:true,invoice:true,statement:true},payout:{},status:'active',notes:''};
  const p=m.perms||{};const po=m.payout||{};const ck=(k,l)=>`<label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" id="mp_${k}" ${p[k]!==false?'checked':''} style="width:auto"> ${l}</label>`;
  openModal(id?'تعديل '+esc(m.name):'متعاون جديد',`
    <div class="row2"><div class="field"><label>الاسم</label><input id="mm_name" value="${esc(m.name)}"></div><div class="field"><label>البريد</label><input id="mm_email" dir="ltr" value="${esc(m.email||'')}"></div></div>
    <div class="row2"><div class="field"><label>الجوال (واتساب)</label><input id="mm_phone" dir="ltr" value="${esc(m.phone||'')}"></div><div class="field"><label>الدولة / المدينة</label><div style="display:flex;gap:6px"><input id="mm_country" value="${esc(m.country||'')}"><input id="mm_city" value="${esc(m.city||'')}"></div></div></div>
    <div class="row2"><div class="field"><label>نسبة المؤسسة ٪</label><input id="mm_rate" type="number" step="0.5" min="0" max="100" value="${m.rate}"></div>
      <div class="field"><label>عملة الاستلام</label><input id="mm_cur" dir="ltr" value="${esc(m.currency||'MAD')}"></div></div>
    <div class="field"><label>رسوم بوابة الدفع على</label><select id="mm_fb"><option value="partner" ${m.fee_bearer!=='foundation'?'selected':''}>المتعاون (تُخصم من حصّته)</option><option value="foundation" ${m.fee_bearer==='foundation'?'selected':''}>المؤسسة (من نسبتها)</option></select></div>
    <div class="field"><label>الصلاحيّات</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${ck('quote','عروض الأسعار الرسميّة')}${ck('paylink','روابط الدفع السريعة')}${ck('invoice','تحميل الفواتير')}${ck('statement','كشف الحساب')}</div></div>
    <div class="row2"><div class="field"><label>اسم مستلم Western Union (كما في الهويّة)</label><input id="mm_rcv" value="${esc(po.receiver||'')}"></div><div class="field"><label>مدينة الاستلام</label><input id="mm_rcity" value="${esc(po.city||'')}"></div></div>
    <div class="row2"><div class="field"><label>الحالة</label><select id="mm_st"><option value="active" ${m.status==='active'?'selected':''}>نشط</option><option value="suspended" ${m.status!=='active'?'selected':''}>موقوف (لا يدخل)</option></select></div><div class="field"><label>ملاحظات داخليّة</label><input id="mm_notes" value="${esc(m.notes||'')}"></div></div>
    ${id?'<p style="color:var(--muted);font-size:12px">تغيير النسبة يسري على الصفقات الجديدة فقط — القديمة محفوظة بنسبتها.</p>':''}`,()=>clbMemberSave(id));
}
async function clbMemberSave(id){
  const row={name:clbVal('mm_name'),email:clbVal('mm_email').toLowerCase()||null,phone:clbVal('mm_phone')||null,country:clbVal('mm_country')||null,city:clbVal('mm_city')||null,
    currency:(clbVal('mm_cur')||'MAD').toUpperCase(),rate:Number(clbVal('mm_rate'))||0,fee_bearer:clbVal('mm_fb'),status:clbVal('mm_st'),notes:clbVal('mm_notes')||null,
    perms:{quote:document.getElementById('mp_quote').checked,paylink:document.getElementById('mp_paylink').checked,invoice:document.getElementById('mp_invoice').checked,statement:document.getElementById('mp_statement').checked},
    payout:{method:'stcpay_wu',receiver:clbVal('mm_rcv'),city:clbVal('mm_rcity')}};
  if(!row.name){alert('الاسم؟');return}
  try{if(id){const {error}=await sb.from('collab_members').update(row).eq('id',id);if(error)throw error}
    else{row.portal_token=[...crypto.getRandomValues(new Uint8Array(24))].map(b=>b.toString(16).padStart(2,'0')).join('');const {error}=await sb.from('collab_members').insert(row);if(error)throw error}
    closeModal();CLB.loaded=false;CLB_TAB='members';renderCollab()}catch(e){alert('تعذّر: '+e.message)}}

/* ===== الرسوم والصرف ===== */
function clbFeesView(){const f=clbFees();const n=(id,l,v,h)=>`<div class="field"><label>${l}${h?` <span style="color:var(--muted);font-weight:400">${h}</span>`:''}</label><input id="${id}" type="number" step="any" value="${v}"></div>`;
  document.getElementById('clbView').innerHTML=`<div class="card">
    <h3 style="margin-top:0">Telr — بوابة الدفع</h3>
    <div class="row2">${n('fe_mp','مدى ٪',f.madaPct)}${n('fe_mf','مدى ثابت (ر.س)',f.madaFixed)}</div>
    <div class="row2">${n('fe_cp','بطاقة ائتمانيّة / Apple Pay ٪',f.cardPct)}${n('fe_cf','بطاقة ثابت (ر.س)',f.cardFixed)}</div>
    ${n('fe_fv','ضريبة على الرسوم ٪',f.feeVat)}
    <h3>STC Pay ← Western Union</h3>
    <div class="row2">${n('fe_wf','رسم الحوالة (ر.س)',f.wuFee,'المغرب: ٢٠ ر.س حسب جدول STC Bank')}${n('fe_wv','ضريبة على الرسم ٪',f.wuVat)}</div>
    <div class="row2">${n('fe_fx','سعر الصرف التقريبيّ',f.fx,'كم درهم لكلّ ريال — بعد هامش Western Union')}<div class="field"><label>العملة</label><input id="fe_cur" dir="ltr" value="${esc(f.fxCur)}"></div></div>
    <div class="badge-note"><i data-lucide="info"></i><div>هذه القيم تظهر للمتعاون في حاسبته وفي توزيع كلّ صفقة. الرسوم الفعليّة تُسجَّل عند الدفع والحوالة وتحلّ محلّ التقدير. ضريبة القيمة المضافة على المبيعات تتبع مفتاح «نوع الفاتورة» في الإعدادات (حاليّاً: ${taxOn()?'ضريبيّة ١٥٪':'عاديّة بلا ضريبة'}).</div></div>
    <button class="btn btn-gold" onclick="clbFeesSave()">حفظ ونشر للبوابة</button></div>`;refreshIcons();
}
async function clbFeesSave(){const g=id=>Number(clbVal(id))||0;
  const v={madaPct:g('fe_mp'),madaFixed:g('fe_mf'),cardPct:g('fe_cp'),cardFixed:g('fe_cf'),feeVat:g('fe_fv'),wuFee:g('fe_wf'),wuVat:g('fe_wv'),fx:g('fe_fx'),fxCur:(clbVal('fe_cur')||'MAD').toUpperCase(),fxAt:today()};
  const {error}=await sb.from('collab_settings').upsert({key:'fees',value:v,updated_at:new Date().toISOString()});if(error){alert(error.message);return}
  CLB.settings.fees=v;clbToast('حُفظت ونُشرت ✓');}
