/*
 * 21-zatca.js — الفوترة الإلكترونيّة (زاتكا) + استوديو ما قبل الطباعة
 * ═══════════════════════════════════════════════════════════════════════════
 * المحرّك (التوقيع، XML، رمز QR، الإرسال للهيئة) يعيش في خادم حروف
 * (`artifacts/api-server/src/lib/zatca`) — المفتاح الخاصّ لا يدخل المتصفّح
 * أبداً. هذه اللوحة واجهتُه فقط، عبر جسر x-system-token نفسه (`hrApi`).
 *
 * قواعد الهيئة التي تفرضها هذه الواجهة:
 *  • الفاتورة المُصدرة إلكترونيّاً **لا تُعدَّل ولا تُحذف** — تُصحَّح بإشعار دائن.
 *  • تاريخها تاريخ إصدارها (اليوم)، ورقمها رقم الجهاز لا عدّاد اللوحة.
 *  • بياناتها الضريبيّة في الطباعة (البائع، الرقم الضريبيّ، المبالغ، QR) مقفلة؛
 *    وكلّ ما عداها يُخفى ويُعدَّل يدويّاً من استوديو الطباعة.
 *
 * ملفّ تعريفات فقط (القاعدة الحديديّة): لا جملة تنفّذ عند التحميل.
 */

const Z_LABEL={generated:'صدرت (مرحلة أولى)',pending:'بانتظار الإرسال',reported:'مُبلَّغة للهيئة',cleared:'مُجازة من الهيئة',rejected:'مرفوضة من الهيئة',failed:'تعذّر الإرسال'};
const Z_TONE={generated:'info',pending:'warn',reported:'good',cleared:'good',rejected:'del',failed:'del'};
const Z_MODE={off:'متوقّفة',phase1:'المرحلة الأولى — إصدار بلا إرسال',phase2:'المرحلة الثانية — توقيع وإرسال للهيئة'};
const Z_ENV={sandbox:'بيئة المطوّرين (تجريبيّة)',simulation:'المحاكاة (تجريبيّة)',production:'الإنتاج'};
const Z_SOURCE={telr_order:'اشتراك منصّة حروف',telr_renewal:'تجديد اشتراك',organization:'مدرسة/جهة',manual:'اللوحة',note:'إشعار'};
const Z_PAYMENT=[['30','تحويل بنكيّ'],['48','بطاقة'],['10','نقداً'],['42','دفع لحساب بنكيّ'],['1','غير محدّد']];
const Z_IDSCHEME=[['CRN','سجلّ تجاريّ'],['700','الرقم الموحّد (700)'],['MOM','ترخيص الموارد البشريّة'],['MLS','ترخيص البلديّة'],['SAG','ترخيص سجايا'],['NAT','هويّة وطنيّة'],['IQA','إقامة'],['GCC','هويّة خليجيّة'],['PAS','جواز سفر'],['TIN','الرقم المميّز (TIN)'],['OTH','أخرى']];
const Z_EXEMPT=[
  ['O','VATEX-SA-OOS','خارج نطاق الضريبة'],
  ['Z','VATEX-SA-33','تصدير خدمات لغير مقيم'],
  ['Z','VATEX-SA-32','تصدير سلع'],
  ['Z','VATEX-SA-EDU','تعليم خاصّ لمواطن'],
  ['Z','VATEX-SA-HEA','رعاية صحّيّة خاصّة لمواطن'],
  ['E','VATEX-SA-29','خدمات ماليّة'],
  ['E','VATEX-SA-30','عقار سكنيّ'],
];
let ZSTATUS=null;

/* ── الجسر ─────────────────────────────────────────────────────────────── */
/* كـhrApi لكنّه يُبقي قائمة أخطاء التحقّق (`issues`) — رسالةٌ واحدة لا تكفي
   لتصحيح فاتورة رفضها التحقّق بثلاثة أسباب. `window.Z_API` للاختبار المحلّيّ. */
async function zApi(path,opts){opts=opts||{};const {data}=await sb.auth.getSession();const tok=data&&data.session?data.session.access_token:'';
  const res=await fetch((window.Z_API||HR_API)+'/'+path,{method:opts.method||'GET',headers:{'x-system-token':tok,'Content-Type':'application/json'},body:opts.body?JSON.stringify(opts.body):undefined});
  const b=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(b.message||b.error||('تعذّر ('+res.status+')'));e.issues=Array.isArray(b.issues)?b.issues.map(i=>typeof i==='string'?i:((i.path||[]).join('.')+': '+i.message)):[];e.status=res.status;throw e}
  return b;}
function zIssued(d){return !!(d&&d.zatca&&d.zatca.uuid)}
function zMode(){return (S.settings&&S.settings.zatcaMode)||'off'}
function zViewUrl(z){return z&&z.viewUrl?((window.Z_API||HR_API).replace(/\/api$/,'')+z.viewUrl):''}
function zDate(iso){if(!iso)return '';const t=new Date(new Date(iso).getTime()+3*3600000).toISOString();return t.slice(0,10)}
function zDateTime(iso){if(!iso)return '';const t=new Date(new Date(iso).getTime()+3*3600000).toISOString();return t.slice(0,10)+' '+t.slice(11,16)}
function zChip(st){return `<span class="chip ${Z_TONE[st]||''}">${esc(Z_LABEL[st]||st)}</span>`}
function zErrHTML(e){return `<div style="color:var(--bad);font-weight:700">${esc(e.message==='validation'?'بياناتٌ ناقصة أو غير صالحة:':e.message)}</div>${(e.issues||[]).length?`<ul style="margin:6px 0 0;padding-inline-start:18px;color:var(--bad);font-size:13px;line-height:1.8">${e.issues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}`}
/* ما يُحفظ من ردّ الخادم على الفاتورة في حالة اللوحة. */
function zPick(r){return {uuid:r.uuid,number:r.number,status:r.status,profile:r.profile,kind:r.kind,taxable:r.taxable,vat:r.vat,total:r.total,allowance:r.allowance||'0.00',issuedAt:r.issuedAt,displayQr:r.displayQr||r.qr,viewUrl:r.viewUrl,seller:r.seller||null,buyer:r.buyer||null,lines:r.lines||null,lastError:r.lastError||'',warnings:r.zatcaWarnings||[],errors:r.zatcaErrors||[]}}

/* ── بطاقة الحالة في صفحة الفوترة ─────────────────────────────────────── */
async function zRenderCard(){
  const el=document.getElementById('zCard');if(!el)return;
  el.innerHTML=`<div class="card" style="margin-bottom:16px"><h3 style="margin:0 0 6px"><i data-lucide="shield-check"></i> الفوترة الإلكترونيّة (زاتكا)</h3><div style="color:var(--muted);font-size:13px">جارٍ الاتصال بخادم حروف…</div></div>`;refreshIcons();
  try{ZSTATUS=await zApi('admin/zatca/status')}catch(e){ZSTATUS=null;
    el.innerHTML=`<div class="card" style="margin-bottom:16px"><h3 style="margin:0 0 6px"><i data-lucide="shield-off"></i> الفوترة الإلكترونيّة (زاتكا)</h3>
      <div style="color:var(--muted);font-size:13px;line-height:1.9">تعذّر جلب الحالة من خادم حروف: ${esc(e.message)}<br>الفواتير هنا تبقى عاديّة حتى تُفعَّل الوحدة على الخادم (‏<span dir="ltr">ZATCA_MODE</span>) وتُطبَّق هجرتها.</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="zRenderCard()"><i data-lucide="refresh-cw"></i> إعادة المحاولة</button></div>`;refreshIcons();return}
  const s=ZSTATUS;if(S.settings.zatcaMode!==s.mode){S.settings.zatcaMode=s.mode;save()}
  const egs=s.egs||{};const exp=egs.certExpiresAt?new Date(egs.certExpiresAt):null;const daysLeft=exp?Math.floor((exp-Date.now())/864e5):null;
  const counts=Object.entries(s.documents||{}).map(([k,n])=>`${zChip(k)} <b>${n}</b>`).join(' &nbsp; ')||'<span style="color:var(--muted)">لا مستندات بعد</span>';
  el.innerHTML=`<div class="card" style="margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
      <div><h3 style="margin:0 0 4px"><i data-lucide="shield-check"></i> الفوترة الإلكترونيّة (زاتكا)</h3>
        <div style="font-size:13px;color:var(--muted)">الوضع: <b style="color:var(--ink)">${esc(Z_MODE[s.mode]||s.mode)}</b> · البيئة: <b style="color:var(--ink)">${esc(Z_ENV[s.env]||s.env)}</b>${s.seller&&s.seller.vatNumber?` · الرقم الضريبيّ: <b dir="ltr">${esc(s.seller.vatNumber)}</b>`:''}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="zDocsLog()"><i data-lucide="list"></i> سجلّ المستندات</button>
        ${s.mode==='phase2'?`<button class="btn btn-ghost btn-sm" onclick="zOtpModal('${egs.status==='production'?'renew':'onboard'}')"><i data-lucide="key-round"></i> ${egs.status==='production'?'تجديد الشهادة':'تهيئة الجهاز (OTP)'}</button>`:''}
        ${s.mode==='phase2'&&egs.status==='production'?`<button class="btn btn-ghost btn-sm" onclick="zOtpModal('onboard')" title="شهادة جديدة كلّياً"><i data-lucide="rotate-cw"></i> إعادة التهيئة</button>`:''}
        <button class="btn btn-ghost btn-sm" onclick="zRenderCard()"><i data-lucide="refresh-cw"></i></button>
      </div>
    </div>
    ${s.mode==='off'?`<div style="margin-top:10px;font-size:13px;color:var(--muted);line-height:1.9">متوقّفة حتى تسجيل المؤسسة في ضريبة القيمة المضافة. الفواتير هنا عاديّة، ولا يُطبع عليها رمز QR ضريبيّ.</div>`:''}
    ${(s.readinessIssues||[]).length?`<div class="badge-note" style="margin-top:12px;color:var(--warn)"><i data-lucide="alert-triangle"></i><div><b>إعداد ناقص على الخادم:</b><ul style="margin:4px 0 0;padding-inline-start:18px">${s.readinessIssues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div></div>`:''}
    ${s.mode==='phase2'?`<div style="margin-top:12px;font-size:13px;line-height:1.9">الجهاز: ${egs.status==='production'?'<span class="chip good">مُهيّأ وجاهز للإرسال</span>':egs.status==='compliance'?'<span class="chip warn">اجتاز جزءاً من الامتثال</span>':'<span class="chip del">غير مُهيّأ — نفّذ التهيئة برمز OTP</span>'}
      ${exp?` · الشهادة تنتهي ${esc(zDate(exp.toISOString()))} ${daysLeft<30?`<span class="chip del">بعد ${daysLeft} يوماً — جدّدها</span>`:''}`:''}${egs.lastIcv!=null?` · عدّاد السلسلة: <b>${egs.lastIcv}</b>`:''}</div>`:''}
    ${s.mode!=='off'?`<div style="margin-top:10px;font-size:13px">${counts}${s.oldestPending?` · أقدم معلّق: <b>${esc(s.oldestPending.number)}</b>`:''}</div>`:''}
  </div>`;
  refreshIcons();
}

/* ── التهيئة / التجديد برمز OTP ───────────────────────────────────────── */
function zOtpModal(kind){
  const renew=kind==='renew';
  openModal(renew?'تجديد شهادة الجهاز':'تهيئة جهاز الفوترة لدى الهيئة',`
    <div style="font-size:13px;line-height:1.9;color:var(--muted);margin-bottom:12px">
      ١) ادخل بوّابة «فاتورة» (${esc(Z_ENV[(ZSTATUS||{}).env]||'')}) ← <b>تسجيل جهاز جديد</b> ← ولّد رمز OTP (صالح ساعة).<br>
      ٢) الصقه هنا. ${renew?'يُبنى مفتاحٌ وطلب شهادة جديدان وتُستبدل الشهادة؛ السلسلة لا تتأثّر.':'يبني الخادم طلب الشهادة، يأخذ شهادة الامتثال، يجتاز الفحوص الستّة، ثم يأخذ شهادة الإنتاج.'}</div>
    <div class="field"><label>رمز OTP</label><input id="z_otp" inputmode="numeric" maxlength="6" dir="ltr" placeholder="123456" style="font-size:20px;letter-spacing:6px;text-align:center"></div>
    <div id="z_out"></div>`,async()=>{
      const otp=document.getElementById('z_otp').value.trim();const out=document.getElementById('z_out');
      if(!/^\d{6}$/.test(otp)){out.innerHTML=zErrHTML(new Error('رمز OTP ستّة أرقام'));return}
      const btn=document.getElementById('mSave');btn.disabled=true;btn.textContent='جارٍ…';
      try{const r=await zApi('admin/zatca/'+(renew?'renew':'onboard'),{method:'POST',body:{otp}});
        out.innerHTML=renew?`<div class="chip good">جُدّدت الشهادة — تنتهي ${esc(zDate(r.expiresAt))}</div>`:
          `<div style="font-size:13px;line-height:1.9">${(r.steps||[]).map(st=>`<div>${st.ok?'✔':'✘'} ${esc(st.step)}</div>`).join('')}</div><div class="chip ${r.ok?'good':'del'}" style="margin-top:8px">${r.ok?'الجهاز جاهز للإرسال':'لم تجتز كلّ الفحوص'}</div>`;
        btn.textContent='تم';zRenderCard();
      }catch(e){out.innerHTML=zErrHTML(e);btn.disabled=false;btn.textContent='حفظ'}
    });
  document.getElementById('mSave').textContent=renew?'تجديد':'بدء التهيئة';
}

/* ── سجلّ كلّ المستندات الإلكترونيّة (اللوحة + منصّة حروف) ────────────── */
async function zDocsLog(filter){
  openModal('سجلّ المستندات الإلكترونيّة',`<div id="z_log" style="color:var(--muted)">جارٍ التحميل…</div>`,()=>closeModal());
  document.getElementById('mSave').textContent='إغلاق';
  const box=document.getElementById('z_log');
  try{const r=await zApi('admin/zatca/documents?limit=200'+(filter?'&status='+filter:''));const docs=r.documents||[];
    const statuses=['','pending','reported','cleared','rejected','failed','generated'];
    box.innerHTML=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${statuses.map(st=>`<button class="btn btn-sm ${(filter||'')===st?'btn-gold':'btn-ghost'}" onclick="zDocsLog('${st}')">${st?esc(Z_LABEL[st]):'الكلّ'}</button>`).join('')}</div>
    ${docs.length?`<div style="overflow-x:auto"><table><thead><tr><th>الرقم</th><th>المصدر</th><th>النوع</th><th>الإجمالي</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead><tbody>
    ${docs.map(d=>`<tr><td dir="ltr" style="white-space:nowrap">${esc(d.number)}</td><td>${esc(Z_SOURCE[d.sourceType]||d.sourceType)}</td><td>${d.kind==='credit'?'إشعار دائن':d.kind==='debit'?'إشعار مدين':d.profile==='standard'?'ضريبيّة':'مبسّطة'}</td>
      <td style="white-space:nowrap">${esc(d.total)}</td><td style="white-space:nowrap">${esc(zDateTime(d.issuedAt))}</td><td>${zChip(d.status)}${d.lastError?`<div style="font-size:11px;color:var(--bad);max-width:260px">${esc(d.lastError.slice(0,160))}</div>`:''}</td>
      <td style="white-space:nowrap"><a class="link-btn" target="_blank" rel="noopener" href="${esc(zViewUrl(d))}">عرض</a>${['pending','failed'].includes(d.status)?` <button class="link-btn" onclick="zResubmitUuid('${d.uuid}')">إرسال</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`:emptyBox('receipt-text','لا مستندات بعد.')}`;refreshIcons();
  }catch(e){box.innerHTML=zErrHTML(e)}
}
async function zResubmitUuid(uuid){try{const r=await zApi('admin/zatca/documents/'+uuid+'/submit',{method:'POST'});zSyncLocal(r);alert('الحالة: '+(Z_LABEL[r.status]||r.status)+(r.lastError?'\n'+r.lastError:''));zDocsLog()}catch(e){alert(e.message+(e.issues&&e.issues.length?'\n'+e.issues.join('\n'):''))}}
/* إن كان المستند مرتبطاً بفاتورة/إشعار في اللوحة نحدّث نسخته المحفوظة. */
function zSyncLocal(r){let hit=false;[...(S.invoices||[]),...(S.credits||[])].forEach(d=>{if(d.zatca&&d.zatca.uuid===r.uuid){d.zatca=Object.assign(d.zatca,zPick(r));hit=true}});if(hit)save()}

/* ── إصدار فاتورة إلكترونيّاً ─────────────────────────────────────────── */
function zLineName(it){const n=String(it.desc||'').trim();const dt=String(it.details||'').trim();return (dt?n+' — '+dt:n).slice(0,200)}
function zBuyerFromContact(d,ct){const n=ct.nat||{};return {name:resolveClientName(d),vatNumber:(d.clientVat||ct.vat||'').trim(),idScheme:n.idScheme||'CRN',idValue:n.idValue||ct.cr||'',street:n.street||'',building:n.building||'',district:n.district||'',city:n.city||ct.city||'',postalCode:n.postalCode||'',additionalNumber:n.additionalNumber||''}}

async function zIssueModal(invId){
  const d=S.invoices.find(x=>x.id===invId);if(!d)return;
  if(zIssued(d)){openDoc('invoice',invId);return}
  if(!ZSTATUS){try{ZSTATUS=await zApi('admin/zatca/status')}catch(e){alert('تعذّر الوصول لخادم حروف: '+e.message);return}}
  if(ZSTATUS.mode==='off'){alert('الفوترة الإلكترونيّة متوقّفة على الخادم (ZATCA_MODE=off) — تُفعَّل بعد التسجيل في الضريبة.');return}
  const items=(d.items||[]).filter(it=>Number(it.qty)>0&&String(it.desc||'').trim());
  if(!items.length){alert('لا بنود صالحة في الفاتورة');return}
  const ct=S.contacts.find(c=>c.id===d.contactId)||{};const B=zBuyerFromContact(d,ct);
  const profile0=(B.vatNumber||ct.company)?'standard':'simplified';
  const inp=(id,label,val,extra)=>`<div class="field"><label>${label}</label><input id="${id}" value="${esc(val||'')}" ${extra||''}></div>`;
  openModal('إصدار إلكترونيّ — زاتكا',`
    <div class="badge-note" style="margin-bottom:14px"><i data-lucide="info"></i><div style="line-height:1.8">بعد الإصدار <b>لا تُعدَّل الفاتورة ولا تُحذف</b> (التصحيح بإشعار دائن)، وتاريخها <b>اليوم</b>، ورقمها رقم جهاز الفوترة. ${ZSTATUS.env!=='production'?`<br><b style="color:var(--warn)">البيئة الحاليّة ${esc(Z_ENV[ZSTATUS.env])} — المستند تجريبيّ.</b>`:''}</div></div>
    <div class="field"><label>نوع الفاتورة</label><select id="z_prof" onchange="zToggleBuyer()">
      <option value="standard" ${profile0==='standard'?'selected':''}>ضريبيّة — لمنشأة/جهة (تُجاز من الهيئة قبل التسليم)</option>
      <option value="simplified" ${profile0==='simplified'?'selected':''}>مبسّطة — لفرد (تُبلَّغ خلال ٢٤ ساعة)</option></select></div>
    ${inp('z_bname','اسم المشتري',B.name)}
    <div id="z_bfull">
      <div class="row2">${inp('z_bvat','الرقم الضريبيّ للمشتري',B.vatNumber,'dir="ltr" placeholder="3xxxxxxxxxxxxx3"')}
        <div class="field"><label>أو معرّفٌ آخر (لمن لا رقم ضريبيّاً له)</label><div style="display:flex;gap:6px"><select id="z_bscheme" style="width:46%">${Z_IDSCHEME.map(([k,l])=>`<option value="${k}" ${B.idScheme===k?'selected':''}>${l}</option>`).join('')}</select><input id="z_bid" value="${esc(B.idValue)}" dir="ltr"></div></div></div>
      <div style="font-size:12px;font-weight:700;color:var(--muted);margin:2px 0 8px">العنوان الوطنيّ للمشتري (إلزاميّ في الضريبيّة)</div>
      <div class="row2">${inp('z_street','الشارع',B.street)}${inp('z_building','رقم المبنى (٤ أرقام)',B.building,'dir="ltr" inputmode="numeric" maxlength="4"')}</div>
      <div class="row2">${inp('z_district','الحيّ',B.district)}${inp('z_city','المدينة',B.city)}</div>
      <div class="row2">${inp('z_postal','الرمز البريديّ (٥ أرقام)',B.postalCode,'dir="ltr" inputmode="numeric" maxlength="5"')}${inp('z_addl','الرقم الإضافيّ (اختياريّ)',B.additionalNumber,'dir="ltr" inputmode="numeric" maxlength="4"')}</div>
    </div>
    <div class="row2"><div class="field"><label>وسيلة الدفع</label><select id="z_pay">${Z_PAYMENT.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></div>
    ${d.vat?`<div class="field"><label>الضريبة</label><input value="${esc(d.vatRate)}٪ — قياسيّة" disabled></div>`:
      `<div class="field"><label>الفاتورة بلا ضريبة — سبب ذلك</label><select id="z_ex">${Z_EXEMPT.map(([c,k,l],i)=>`<option value="${i}">${l} (${c} · ${k})</option>`).join('')}</select></div>`}</div>
    ${!d.vat?`<div class="field"><label>نصّ السبب كما يظهر في الفاتورة</label><input id="z_exr" placeholder="مثال: خدمة مقدّمة لعميل خارج المملكة"></div>`:''}
    <div style="font-size:13px;color:var(--muted);margin:4px 0 10px">${items.length} بنود · الإجمالي المتوقَّع ${money(invTotal(d))}${docOverallDisc(d)>0.001?` · خصم إجماليّ ${money(docOverallDisc(d))}`:''}</div>
    <div id="z_err"></div>`,()=>zIssueSubmit(invId));
  document.getElementById('mSave').textContent='إصدار وإرسال';zToggleBuyer();
}
function zToggleBuyer(){const p=document.getElementById('z_prof');const f=document.getElementById('z_bfull');if(p&&f)f.style.display=p.value==='standard'?'':'none'}

async function zIssueSubmit(invId){
  const d=S.invoices.find(x=>x.id===invId);if(!d)return;
  const g=i=>{const el=document.getElementById(i);return el?el.value.trim():''};
  const err=document.getElementById('z_err');const btn=document.getElementById('mSave');
  const profile=g('z_prof');const vatNo=g('z_bvat');
  const address={street:g('z_street'),building:g('z_building'),district:g('z_district'),city:g('z_city'),postalCode:g('z_postal'),additionalNumber:g('z_addl')||undefined};
  const buyer=profile==='standard'?{name:g('z_bname')||undefined,vatNumber:vatNo||undefined,idScheme:vatNo?undefined:g('z_bscheme'),idValue:vatNo?undefined:(g('z_bid')||undefined),address}:(g('z_bname')?{name:g('z_bname')}:undefined);
  /* فحوص الهيئة نفسها بالعربيّة قبل الإرسال (الخادم يعيدها لكن برسائل تقنيّة). */
  const miss=[];
  if(profile==='standard'){
    if(!g('z_bname'))miss.push('اسم المشتري مطلوب في الفاتورة الضريبيّة');
    if(vatNo&&!/^3\d{13}3$/.test(vatNo))miss.push('الرقم الضريبيّ للمشتري ١٥ رقماً يبدأ وينتهي بـ3');
    if(!vatNo&&!g('z_bid'))miss.push('مشترٍ بلا رقم ضريبيّ: أدخل معرّفاً آخر (سجلّ تجاريّ…)');
    if(!address.street)miss.push('الشارع');if(!/^\d{4}$/.test(address.building))miss.push('رقم المبنى: ٤ أرقام');
    if(!address.district)miss.push('الحيّ');if(!address.city)miss.push('المدينة');if(!/^\d{5}$/.test(address.postalCode))miss.push('الرمز البريديّ: ٥ أرقام');
    if(address.additionalNumber&&!/^\d{4}$/.test(address.additionalNumber))miss.push('الرقم الإضافيّ: ٤ أرقام');
  }
  if(miss.length){const e=new Error('أكمل بيانات المشتري:');e.issues=miss;err.innerHTML=zErrHTML(e);return}
  let cat=null;if(!d.vat){const ex=Z_EXEMPT[Number(g('z_ex'))]||Z_EXEMPT[0];cat={vatCategory:ex[0],exemptionCode:ex[1],exemptionReason:g('z_exr')||ex[2]}}
  const lines=(d.items||[]).filter(it=>Number(it.qty)>0&&String(it.desc||'').trim()).map(it=>Object.assign({
    name:zLineName(it),quantity:Number(it.qty),unitPrice:Number(it.price||0).toFixed(2),
    discountPercent:Number(it.discount||0)||undefined,vatPercent:d.vat?Number(d.vatRate||15):undefined},cat||{}));
  const ovr=docOverallDisc(d);
  const body={key:'panel-inv-'+d.id,profile,buyer,lines,pricesIncludeVat:false,paymentMeansCode:g('z_pay')||'30',
    documentDiscount:ovr>0.001?ovr.toFixed(2):undefined,note:(d.notes||'').slice(0,500)||undefined};
  btn.disabled=true;btn.textContent='جارٍ الإصدار…';err.innerHTML='';
  try{const r=await zApi('admin/zatca/documents',{method:'POST',body});
    d.zatca=zPick(r);d.date=zDate(r.issuedAt)||d.date;
    /* العنوان الوطنيّ يُحفظ على العميل — الفاتورة القادمة له تمتلئ وحدها. */
    const ct=S.contacts.find(c=>c.id===d.contactId);
    if(ct&&profile==='standard'){ct.nat=Object.assign({},ct.nat||{},address,{idScheme:g('z_bscheme'),idValue:g('z_bid')});if(vatNo&&!ct.vat)ct.vat=vatNo}
    if(vatNo)d.clientVat=vatNo;
    save();closeModal();openDoc('invoice',invId);
    if(['rejected','failed','pending'].includes(r.status))alert('صدرت الفاتورة بالرقم '+r.number+' لكن حالتها: '+(Z_LABEL[r.status]||r.status)+(r.lastError?'\n'+r.lastError:''));
  }catch(e){err.innerHTML=zErrHTML(e);btn.disabled=false;btn.textContent='إصدار وإرسال'}
}

/* ── لوحة الحالة داخل صفحة الفاتورة/الإشعار ───────────────────────────── */
function zDocPanel(type,d){
  if(type!=='invoice'&&type!=='credit')return '';
  if(!zIssued(d)){
    if(type!=='invoice'||zMode()==='off')return '';
    return `<div class="badge-note" style="margin-bottom:16px"><i data-lucide="shield-alert"></i><div>هذه الفاتورة <b>لم تُصدر إلكترونيّاً</b> بعد — لا تُعدّ فاتورة ضريبيّة نظاميّة حتى تُصدرها. <button class="link-btn" onclick="zIssueModal('${d.id}')">إصدار الآن</button></div></div>`;
  }
  const z=d.zatca;
  return `<div class="card" style="margin-bottom:16px;border-color:${z.status==='rejected'||z.status==='failed'?'var(--bad)':'var(--line)'}">
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
      <div><b><i class="inl" data-lucide="shield-check"></i> ${z.kind==='credit'?'إشعار دائن إلكترونيّ':z.profile==='standard'?'فاتورة ضريبيّة إلكترونيّة':'فاتورة ضريبيّة مبسّطة إلكترونيّة'}</b>
        <span dir="ltr" style="margin:0 8px;font-weight:800">${esc(z.number)}</span>${zChip(z.status)}
        <div style="font-size:12px;color:var(--muted);margin-top:4px">صدرت ${esc(zDateTime(z.issuedAt))} · الإجمالي ${esc(z.total)} (الضريبة ${esc(z.vat)}) · مقفلة: لا تعديل ولا حذف</div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${esc(zViewUrl(z))}"><i data-lucide="external-link"></i> نسخة الهيئة</a>
        <button class="btn btn-ghost btn-sm" onclick="zRefresh('${type}','${d.id}')"><i data-lucide="refresh-cw"></i> تحديث الحالة</button>
        ${['pending','failed'].includes(z.status)?`<button class="btn btn-gold btn-sm" onclick="zResubmit('${type}','${d.id}')"><i data-lucide="send"></i> إرسال الآن</button>`:''}
      </div></div>
    ${z.status==='rejected'?`<div style="margin-top:10px;font-size:13px;color:var(--bad);line-height:1.8">رفضتها الهيئة — تبقى برقمها في السلسلة ولا تُعدَّل. أصدر فاتورة جديدة مصحّحة (انسخ هذه بـ«تكرار») ${z.lastError?'<br>'+esc(z.lastError):''}</div>`:''}
    ${(z.warnings||[]).length?`<div style="margin-top:8px;font-size:12px;color:var(--warn)">${z.warnings.map(w=>esc((w.code||'')+': '+(w.message||''))).join('<br>')}</div>`:''}
  </div>`;
}
function zDocColl(type){return type==='credit'?S.credits:S.invoices}
async function zRefresh(type,id){const d=zDocColl(type).find(x=>x.id===id);if(!zIssued(d))return;try{const r=await zApi('admin/zatca/documents/'+d.zatca.uuid);d.zatca=Object.assign(d.zatca,zPick(r));save()}catch(e){alert(e.message)}type==='credit'?openCredit(id):openDoc(type,id)}
async function zResubmit(type,id){const d=zDocColl(type).find(x=>x.id===id);if(!zIssued(d))return;try{const r=await zApi('admin/zatca/documents/'+d.zatca.uuid+'/submit',{method:'POST'});d.zatca=Object.assign(d.zatca,zPick(r));save()}catch(e){alert(e.message)}type==='credit'?openCredit(id):openDoc(type,id)}
/* فاتورة مرفوضة لا تُعدَّل: تُكرَّر مسودّةً جديدة تُصحَّح ثم تُصدر. */
function zDuplicate(invId){const s=S.invoices.find(x=>x.id===invId);if(!s)return;const n=JSON.parse(JSON.stringify(s));n.id=uid();n.number=++S.counters.invoice;n.date=today();n.status='unpaid';n.payments=[];n.paidDate='';delete n.zatca;delete n.printHide;delete n.printEdits;S.invoices.push(n);save();openDoc('invoice',n.id)}

/* ── الإشعار الدائن الإلكترونيّ ───────────────────────────────────────── */
function zCreditModal(invId){
  const inv=S.invoices.find(x=>x.id===invId);if(!zIssued(inv))return;
  const lines=inv.zatca.lines||[];const items=(inv.items||[]).filter(it=>Number(it.qty)>0&&String(it.desc||'').trim());
  openModal('إشعار دائن إلكترونيّ — على '+esc(inv.zatca.number),`
    <div class="field"><label>سبب الإشعار (يُرسل للهيئة ويظهر في المستند)</label><input id="zc_reason" value="استرداد"></div>
    <div class="field"><label>النطاق</label><select id="zc_scope" onchange="document.getElementById('zc_items').style.display=this.value==='part'?'':'none'">
      <option value="full">كامل الفاتورة (${esc(inv.zatca.total)})</option><option value="part">بنود/كمّيّات محدّدة</option></select></div>
    <div id="zc_items" style="display:none"><table class="items-tbl"><thead><tr><th>البند</th><th style="width:80px">الكمّيّة المرتجعة</th><th style="width:70px">من</th></tr></thead><tbody>
      ${items.map((it,i)=>`<tr><td>${esc(zLineName(it))}</td><td><input type="number" min="0" max="${Number(it.qty)}" step="any" value="0" data-zq="${i}"></td><td>${Number(it.qty)}</td></tr>`).join('')}
    </tbody></table><div style="font-size:12px;color:var(--muted)">الخصم الإجماليّ (إن وُجد) يُوزَّع بنسبة البنود المرتجعة. الخادم يرفض ما يتجاوز الرصيد المفتوح للفاتورة.</div></div>
    <div id="zc_err"></div>`,()=>zCreditSubmit(invId));
  document.getElementById('mSave').textContent='إصدار الإشعار';
}
async function zCreditSubmit(invId){
  const inv=S.invoices.find(x=>x.id===invId);const err=document.getElementById('zc_err');const btn=document.getElementById('mSave');
  const reason=document.getElementById('zc_reason').value.trim();if(reason.length<2){err.innerHTML=zErrHTML(new Error('اكتب سبب الإشعار'));return}
  const items=(inv.items||[]).filter(it=>Number(it.qty)>0&&String(it.desc||'').trim());
  const full=document.getElementById('zc_scope').value==='full';const body={kind:'credit',reason};let cnItems=JSON.parse(JSON.stringify(inv.items||[]));
  if(!full){
    const picked=[];document.querySelectorAll('[data-zq]').forEach(el=>{const q=Number(el.value||0);const it=items[Number(el.dataset.zq)];if(q>0&&it)picked.push({it,q:Math.min(q,Number(it.qty))})});
    if(!picked.length){err.innerHTML=zErrHTML(new Error('حدّد كمّيّة مرتجعة لبندٍ واحدٍ على الأقلّ'));return}
    let cat={};if(!inv.vat&&inv.zatca.lines&&inv.zatca.lines[0]){const l=inv.zatca.lines[0];cat={vatCategory:l.vatCategory,exemptionCode:l.exemptionCode,exemptionReason:l.exemptionReason}}
    body.lines=picked.map(p=>Object.assign({name:zLineName(p.it),quantity:p.q,unitPrice:Number(p.it.price||0).toFixed(2),discountPercent:Number(p.it.discount||0)||undefined,vatPercent:inv.vat?Number(inv.vatRate||15):undefined},cat));
    body.pricesIncludeVat=false;
    const ovr=docOverallDisc(inv);if(ovr>0.001){const part=picked.reduce((a,p)=>a+lineTotal(Object.assign({},p.it,{qty:p.q})),0);const share=ovr*part/Math.max(docLineSubtotal(inv),0.01);if(share>=0.005)body.documentDiscount=share.toFixed(2)}
    cnItems=picked.map(p=>Object.assign({},p.it,{qty:p.q}));
  }
  btn.disabled=true;btn.textContent='جارٍ…';err.innerHTML='';
  try{const r=await zApi('admin/zatca/documents/'+inv.zatca.uuid+'/note',{method:'POST',body});
    const cn={id:uid(),number:++S.counters.credit,invoiceId:invId,invNumber:inv.number,client:inv.client,contactId:inv.contactId||'',clientVat:inv.clientVat||'',date:zDate(r.issuedAt)||today(),items:cnItems,notes:reason,vat:inv.vat,vatRate:inv.vatRate,discType:full?inv.discType:'none',discVal:full?inv.discVal:0,brandId:inv.brandId,zatca:zPick(r)};
    if(!S.credits)S.credits=[];S.credits.push(cn);save();closeModal();openCredit(cn.id);
  }catch(e){err.innerHTML=zErrHTML(e);btn.disabled=false;btn.textContent='إصدار الإشعار'}
}

/* ═══════════════════════════════════════════════════════════════════════════
   استوديو ما قبل الطباعة — معاينة حيّة + إخفاء الأقسام + تعديل النصوص يدويّاً
   ═══════════════════════════════════════════════════════════════════════════
   الإخفاء: أقسام المستند تحمل data-part، والإخفاء قاعدة CSS داخل المعاينة —
   فلا تُعاد كتابة الصفحة ولا تضيع التعديلات اليدويّة عند التبديل.
   التعديل: الصفحة كلّها قابلة للكتابة إلّا ما يحمل data-locked (البيانات
   الضريبيّة للمستند المُصدر). وتُحفظ التعديلات مع «بصمة» المستند: إن تغيّر
   المستند بعدها لا تُستعاد نسخةٌ قديمة فوق بياناتٍ جديدة. */
const PRINT_PARTS=[
  {k:'cover',l:'صفحة الغلاف'},
  {k:'tagline',l:'وصف البراند'},
  {k:'caddr',l:'عنوان العميل'},
  {k:'ccontact',l:'بريد العميل وجواله'},
  {k:'cvat',l:'الرقم الضريبيّ للعميل',lock:'standard'},
  {k:'clogo',l:'شعار العميل'},
  {k:'idetails',l:'تفاصيل تحت البنود'},
  {k:'disc',l:'سطور الخصم'},
  {k:'notes',l:'الملاحظات والشروط'},
  {k:'paid',l:'المدفوع والمتبقّي'},
  {k:'pay',l:'رابط/باركود الدفع'},
  {k:'qr',l:'رمز QR',lock:'all'},
  {k:'footer',l:'تذييل البيانات الرسميّة'},
];
function printPartLocked(p,d){if(!zIssued(d)||!p.lock)return false;return p.lock==='all'||(p.lock==='standard'&&d.zatca.profile==='standard')}
function printDocColl(type){return type==='invoice'?S.invoices:type==='credit'?S.credits:S.sales}
function printHideCss(hide){return (hide||[]).map(k=>`[data-part="${k}"]{display:none!important}`).join('\n')}
/* بصمة **بيانات** المستند (لا نصّ HTML — التصميم يولّد معرّفات زخرفةٍ جديدة كلّ مرّة). */
function printFingerprint(d){const ct=S.contacts.find(c=>c.id===d.contactId)||{};const z=d.zatca||{};
  const str=JSON.stringify([d.items,d.client,d.clientVat,d.date,d.notes,d.vat,d.vatRate,d.discType,d.discVal,d.brandId,d.payUrl,d.payQr,d.status,(d.payments||[]).length,z.number,z.total,ct.name,ct.email,ct.phone,ct.address,ct.city]);
  let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h+str.charCodeAt(i))|0}return String(h)}
let PSTUDIO=null;
function printStudio(type,id){
  const d=printDocColl(type).find(x=>x.id===id);if(!d)return;
  const parts=PRINT_PARTS.filter(p=>!(p.k==='paid'&&type!=='invoice'));
  const hide=(d.printHide||S.settings.printHide||[]).filter(k=>{const p=parts.find(x=>x.k===k);return p&&!printPartLocked(p,d)});
  const html=printDocHTML(type,id);const fp=printFingerprint(d);
  PSTUDIO={type,id,hide:[...hide],fp,editing:false};
  if(!window.__psResize){window.__psResize=true;window.addEventListener('resize',()=>{if(PSTUDIO)printStudioFit()})}
  let root=document.getElementById('pStudio');if(!root){root=document.createElement('div');root.id='pStudio';document.body.appendChild(root)}
  root.innerHTML=`<div style="position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:row;direction:rtl">
    <aside style="width:290px;flex:none;border-left:1px solid var(--line);background:var(--panel);overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px" class="ps-side">
      <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px"><i class="inl" data-lucide="printer"></i> قبل الطباعة</b><button class="link-btn" onclick="printStudioClose()" style="font-size:20px">×</button></div>
      ${zIssued(d)?`<div class="badge-note" style="font-size:12px;padding:10px 12px"><i data-lucide="lock"></i><div>مستندٌ مُصدر إلكترونيّاً: البائع والرقم والتاريخ والمبالغ ورمز QR <b>مقفلة</b> كما وصلت للهيئة. ما عداها لك.</div></div>`:''}
      <div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px">إظهار / إخفاء</div>
        ${parts.map(p=>{const locked=printPartLocked(p,d);return `<label class="ps-opt" style="${locked?'opacity:.55':''}"><input type="checkbox" data-pk="${p.k}" ${hide.includes(p.k)?'':'checked'} ${locked?'disabled':''} onchange="printStudioToggle('${p.k}',this.checked)"><span>${esc(p.l)}</span>${locked?'<i class="inl" data-lucide="lock" style="width:13px;height:13px"></i>':''}</label>`}).join('')}</div>
      <div style="border-top:1px solid var(--line);padding-top:12px">
        <label class="ps-opt" style="font-weight:700"><input type="checkbox" id="psEdit" onchange="printStudioEdit(this.checked)"><span>تعديل النصوص يدويّاً</span></label>
        <div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.7">اضغط أيّ نصّ في المعاينة وعدّله مباشرة — للطباعة الحاليّة، أو احفظه لهذا المستند.</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:auto">
        <button class="btn btn-gold" onclick="printStudioPrint()"><i data-lucide="printer"></i> طباعة / حفظ PDF</button>
        <button class="btn btn-ghost btn-sm" onclick="printStudioSave(false)"><i data-lucide="save"></i> حفظ الإخفاء والتعديلات لهذا المستند</button>
        <button class="btn btn-ghost btn-sm" onclick="printStudioSave(true)"><i data-lucide="bookmark"></i> اجعل الإخفاء افتراضيّاً لكلّ المستندات</button>
        <button class="btn btn-ghost btn-sm" onclick="printStudioReset()"><i data-lucide="rotate-ccw"></i> إعادة الضبط</button>
      </div>
    </aside>
    <main id="psMain" style="flex:1;overflow:auto;background:#d4d7dd;padding:20px">
      <div id="psBox" style="margin:0 auto;width:820px;overflow:hidden"><iframe id="psFrame" style="width:820px;border:0;background:#e5e7eb;box-shadow:0 8px 30px rgba(0,0,0,.25);transform-origin:top right;display:block"></iframe></div>
    </main></div>
    <style>#pStudio .ps-opt{display:flex!important;align-items:center;gap:10px;padding:6px 0;font-size:14px;cursor:pointer;margin:0}
      #pStudio .ps-opt input{width:16px!important;height:16px;flex:none;margin:0;padding:0}
      #pStudio .ps-opt span{flex:1}@media(max-width:760px){#pStudio>div{flex-direction:column!important}#pStudio .ps-side{width:auto!important;max-height:42vh;border-left:0!important;border-bottom:1px solid var(--line)}}</style>`;
  refreshIcons();
  /* نسخةٌ محفوظة تُستعاد فقط إن طابقت بصمتُها المستندَ كما هو الآن. */
  const restored=d.printEdits&&d.printEdits.fp===fp?d.printEdits.body:null;
  if(d.printEdits&&!restored)setTimeout(()=>alert('تغيّر المستند منذ آخر تعديل يدويّ محفوظ — فُتحت النسخة الحاليّة بدلاً منه.'),50);
  printStudioLoad(html,restored);
}
function printStudioLoad(html,restoredBody){
  const f=document.getElementById('psFrame');if(!f)return;
  f.onload=()=>{const doc=f.contentDocument;if(restoredBody)doc.body.innerHTML=restoredBody;
    let st=doc.getElementById('psHide');if(!st){st=doc.createElement('style');st.id='psHide';doc.head.appendChild(st)}st.textContent=printHideCss(PSTUDIO.hide);
    const ed=doc.createElement('style');ed.textContent='body.ps-editing [contenteditable="true"]:hover{outline:2px dashed #f5a62388;outline-offset:2px} body.ps-editing [data-locked]{cursor:not-allowed} @media print{body.ps-editing *{outline:none!important}}';doc.head.appendChild(ed);
    const fit=()=>printStudioFit();fit();setTimeout(fit,600);
    if(PSTUDIO.editing)printStudioEdit(true);};
  f.srcdoc=html;
}
/* المعاينة بعرض A4 (‏820px) تُصغَّر لتسع الشاشة — الطباعة نفسها بحجمها الكامل. */
function printStudioFit(){const f=document.getElementById('psFrame'),box=document.getElementById('psBox'),main=document.getElementById('psMain');if(!f||!box||!main||!f.contentDocument)return;
  const h=f.contentDocument.documentElement.scrollHeight+20;f.style.height=h+'px';
  const sc=Math.min(1,(main.clientWidth-40)/820);f.style.transform=sc<1?`scale(${sc})`:'';box.style.width=(820*sc)+'px';box.style.height=(h*sc)+'px';}
function printStudioToggle(k,show){if(!PSTUDIO)return;PSTUDIO.hide=PSTUDIO.hide.filter(x=>x!==k);if(!show)PSTUDIO.hide.push(k);
  const doc=document.getElementById('psFrame').contentDocument;const st=doc&&doc.getElementById('psHide');if(st)st.textContent=printHideCss(PSTUDIO.hide);setTimeout(printStudioFit,50);}
function printStudioEdit(on){if(!PSTUDIO)return;PSTUDIO.editing=on;const doc=document.getElementById('psFrame').contentDocument;if(!doc)return;
  doc.body.classList.toggle('ps-editing',on);
  doc.querySelectorAll('.page').forEach(p=>{if(on)p.setAttribute('contenteditable','true');else p.removeAttribute('contenteditable')});
  doc.querySelectorAll('[data-locked]').forEach(el=>{if(on)el.setAttribute('contenteditable','false');else el.removeAttribute('contenteditable')});}
function printStudioClean(doc){const b=doc.body.cloneNode(true);b.classList.remove('ps-editing');b.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));return b.innerHTML}
function printStudioSave(asDefault){if(!PSTUDIO)return;const d=printDocColl(PSTUDIO.type).find(x=>x.id===PSTUDIO.id);if(!d)return;
  if(asDefault){S.settings.printHide=[...PSTUDIO.hide];save();alert('صار هذا الإخفاء افتراضيّاً لكلّ مستندٍ جديد (الأقسام الضريبيّة للمستندات المُصدرة تبقى ظاهرة).');return}
  const doc=document.getElementById('psFrame').contentDocument;d.printHide=[...PSTUDIO.hide];
  if(PSTUDIO.editing||d.printEdits)d.printEdits={fp:PSTUDIO.fp,body:printStudioClean(doc),at:new Date().toISOString()};
  save();alert('حُفظ لهذا المستند.');}
function printStudioReset(){if(!PSTUDIO)return;const d=printDocColl(PSTUDIO.type).find(x=>x.id===PSTUDIO.id);if(d&&(d.printHide||d.printEdits)&&confirm('حذف الإخفاء والتعديلات المحفوظة لهذا المستند؟')){delete d.printHide;delete d.printEdits;save()}
  printStudio(PSTUDIO.type,PSTUDIO.id);}
function printStudioClose(){const r=document.getElementById('pStudio');if(r)r.innerHTML='';PSTUDIO=null}
function printStudioPrint(){if(!PSTUDIO)return;const f=document.getElementById('psFrame');const doc=f.contentDocument;
  const wasEditing=PSTUDIO.editing;if(wasEditing)printStudioEdit(false);
  const fname=docFileName(PSTUDIO.type,PSTUDIO.id);const prevTitle=document.title;
  try{document.title=fname;doc.title=fname}catch(e){}
  try{f.contentWindow.focus();f.contentWindow.print()}catch(e){alert('تعذّرت الطباعة: '+e.message)}
  setTimeout(()=>{document.title=prevTitle;if(wasEditing&&PSTUDIO){printStudioEdit(true);document.getElementById('psEdit').checked=true}},1200);}
