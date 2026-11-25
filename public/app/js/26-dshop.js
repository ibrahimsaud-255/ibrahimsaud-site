/*
 * 26-dshop.js — «المتجر الرقميّ»: إدارة متجر ibrahimsaud.com/shop/ (برامج، ملفّات، دورات)
 * ─────────────────────────────────────────────────────────────────────────
 * يقرأ جداول shop_products / shop_orders / shop_downloads مباشرة (RLS: المالك فقط).
 * الإجراءات الحسّاسة (رابط الطلب للمشتري) عبر الدالّة الحافّة «shop» (action=recover).
 * البادئة dsh — تعريفات فقط (لا تنفيذ عند التحميل). الدليل: docs/المتجر-الرقمي.md
 */
let DSH={orders:null,products:null,dl:null,views:null,codes:null,kit:null,soon:null,err:null,loading:false,filter:'paid',q:''};
// «قريباً» في /shop/#soon — نفس مفاتيح shopSoon في src/lib/shop.ts (مفتاح غير معروف يظهر كما هو)
const DSH_SOON={'course-lessons-broadcast':'دورة بث وتصوير الدروس العلمية','lessons-publish':'نشر الدروس العلمية','ai-dev-course':'دورة التطوير بالذكاء الاصطناعي','tahsili-3d':'تحصيلي 3D (قائمة الانتظار)'};
const DSH_ST={paid:['مدفوع','#22c55e'],pending:['بانتظار الدفع','#f59e0b'],failed:['فشل','#ef4444'],cancelled:['أُلغي','#64748b']};
const DSH_FN='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop';

async function dshLoad(force){
  if(DSH.loading)return;DSH.loading=true;try{extAutoSync(!!force)}catch(e){}DSH.err=null;if(force&&CUR==='dshop')renderDShop();
  try{
    const [o,p,d,k,v,ic,st,si]=await Promise.all([
      sb.from('shop_orders').select('id,sku,title,amount,buyer_name,buyer_email,buyer_phone,status,trusted_devices,created_at,paid_at,buyer_country,ip_country,card_country,hold,pay_method,email_sent_at,remind1_at,remind2_at').order('created_at',{ascending:false}).limit(1000),
      sb.from('shop_products').select('*').order('sort'),
      sb.from('shop_downloads').select('order_id,file_id,at').order('at',{ascending:false}).limit(2000),
      sb.from('subscribers').select('email,name,phone,created_at').eq('source','lb-kit').order('created_at',{ascending:false}).limit(1000),
      sb.from('site_views').select('path,utm,ref,vid,at').gte('at',new Date(Date.now()-30*864e5).toISOString()).order('at',{ascending:false}).limit(20000),
      sb.from('ios_promo_codes').select('*').order('created_at',{ascending:true}),
      sb.from('shop_settings').select('key,value').in('key',['cart_reminders','kit_sequence','update_mail']),
      sb.from('shop_interest').select('product,email,name,source,created_at').order('created_at',{ascending:false}).limit(3000),
    ]);
    if(o.error)throw o.error;if(p.error)throw p.error;
    DSH.orders=o.data||[];DSH.products=p.data||[];DSH.dl=d.error?[]:(d.data||[]);DSH.views=v&&!v.error?(v.data||[]):null;DSH.kit=k&&!k.error?(k.data||[]):null;DSH.codes=ic&&!ic.error?(ic.data||[]):null;const SS={};(st&&!st.error?st.data||[]:[]).forEach(r=>SS[r.key]=r.value);DSH.remind=SS.cart_reminders||null;DSH.seq=SS.kit_sequence||null;DSH.upd=SS.update_mail||null;DSH.soon=si&&!si.error?(si.data||[]):null;
  }catch(e){DSH.err=(e&&e.message)||'تعذّر الاتصال'}
  DSH.loading=false;if(CUR==='dshop')renderDShop();
}
function dshMoney(n){return Number(n||0).toLocaleString('ar-SA',{maximumFractionDigits:2})+' ر.س'}
function dshDate(s){if(!s)return '—';try{return new Date(s).toLocaleDateString('ar-SA-u-ca-gregory',{day:'numeric',month:'short',year:'numeric'})+' · '+new Date(s).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'})}catch(_){return s}}
const DSH_DIAL={SA:'966',AE:'971',KW:'965',QA:'974',BH:'973',OM:'968',EG:'20',MA:'212',DZ:'213',TN:'216',LY:'218',JO:'962',LB:'961',IQ:'964',PS:'970',SY:'963',YE:'967',SD:'249',TD:'235',TR:'90',PK:'92',IN:'91',ID:'62',MY:'60',AF:'93',NG:'234',KE:'254',ET:'251',SN:'221',ML:'223',NE:'227',BF:'226',UG:'256',MW:'265',FR:'33',FI:'358',CA:'1',US:'1',GB:'44',DE:'49'};
// رقم الجوال ← رابط واتساب: الرقم الدوليّ كما هو، والمحلّيّ (يبدأ بصفر) بمفتاح بلد المشتري
function dshPhoneWa(p,cc,text){let d=String(p||'').replace(/\D/g,'');if(!d)return '';
  if(d.startsWith('00'))d=d.slice(2);
  else if(d.startsWith('0')){const k=DSH_DIAL[String(cc||'SA').toUpperCase()]||'966';d=k+d.replace(/^0+/,'')}
  else if(d.length===9&&d.startsWith('5'))d='966'+d;
  return 'https://wa.me/'+d+(text?'?text='+encodeURIComponent(text):'')}
// رسالة متابعة لمن بدأ الدفع ولم يكمل — يرسلها إبراهيم بنفسه من واتساب
function dshFollowText(o){const first=String(o.buyer_name||'').trim().split(/\s+/)[0]||'';
  return `السلام عليكم ${first} 👋\nمعك إبراهيم سعود. شفت إنك بدأت تطلب «${o.title}» وما اكتمل الدفع.\nلو واجهتك مشكلة في الدفع أو عندك أيّ سؤال قبل الشراء، أنا موجود وأساعدك.\nرابط الطلب: https://ibrahimsaud.com/lessons-broadcast/#buy`}

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
  // القمع: الأشخاص (بالإيميل) اللي فتحوا الدفع ← دفعوا. والمتروكة: من بدأ ولم يدفع أبداً بنفس الإيميل.
  const byEmail={};O.forEach(o=>{const e=String(o.buyer_email||'').toLowerCase();(byEmail[e]=byEmail[e]||[]).push(o)});
  const people=Object.keys(byEmail).length,buyers=Object.values(byEmail).filter(a=>a.some(o=>o.status==='paid')).length;
  const abandoned=Object.values(byEmail).filter(a=>!a.some(o=>o.status==='paid')).map(a=>a.slice().sort((x,y)=>new Date(y.created_at)-new Date(x.created_at))[0]).sort((x,y)=>new Date(y.created_at)-new Date(x.created_at));
  const noMail=paid.filter(o=>!o.email_sent_at).length;
  const followed=dshFollowed();
  const abRows=abandoned.slice(0,DSH.abAll?500:12).map(o=>{const wa=dshPhoneWa(o.buyer_phone,o.buyer_country||o.ip_country,dshFollowText(o));const done=followed[o.buyer_email];
    return `<tr style="${done?'opacity:.55':''}"><td><b>${esc(o.buyer_name)}</b><div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(o.buyer_email)}</div></td>
      <td>${dshMoney(o.amount)}<div style="font-size:12px;color:var(--muted)">${dshFlag(o.buyer_country||o.ip_country)}</div></td>
      <td style="font-size:12px;white-space:nowrap">${dshDate(o.created_at)}<div style="color:var(--muted)">${(DSH_ST[o.status]||[o.status])[0]}</div></td>
      <td style="white-space:nowrap">${wa?`<a class="btn btn-primary btn-sm" href="${wa}" target="_blank" rel="noopener" onclick="dshMarkFollowed('${esc(o.buyer_email)}')" title="يفتح واتساب برسالة جاهزة — أنت ترسلها"><i data-lucide="message-circle"></i> تابِع</a>`:'<span style="font-size:12px;color:var(--muted)">بلا جوال</span>'}
        <a class="btn btn-ghost btn-sm" href="mailto:${esc(o.buyer_email)}?subject=${encodeURIComponent('طلبك: '+o.title)}&body=${encodeURIComponent(dshFollowText(o))}" onclick="dshMarkFollowed('${esc(o.buyer_email)}')" title="إيميل جاهز"><i data-lucide="mail"></i></a>
        ${done?`<span style="font-size:11px;color:var(--muted)">تابعته ${dshDate(done).split(' · ')[0]}</span>`:''}</td></tr>`}).join('');
  // الزيارات (آخر ٣٠ يوماً) لصفحات البرنامج بكل لغاته ← فتحوا الدفع ← اشتروا، ومن وين جوا
  let traffic='';
  if(DSH.views){
    const since=Date.now()-30*864e5;const isLB=x=>/lessons-broadcast/.test(x.path);
    const lb=DSH.views.filter(isLB),uv=new Set(lb.map(x=>x.vid||x.at)).size;
    const o30=O.filter(o=>new Date(o.created_at).getTime()>=since&&/^lessons-broadcast/.test(o.sku||''));
    const e30={};o30.forEach(o=>{const e=String(o.buyer_email||'').toLowerCase();(e30[e]=e30[e]||[]).push(o)});
    const st30=Object.keys(e30).length,b30=Object.values(e30).filter(a=>a.some(o=>o.status==='paid')).length;
    const src={};lb.forEach(x=>{const k=x.utm||(x.ref?x.ref.replace(/^www\./,''):'مباشر / بلا مصدر');src[k]=(src[k]||0)+1});
    const top=Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const pct=(a,b)=>b?Math.round(a*1000/b)/10+'٪':'—';
    const allPages={};DSH.views.forEach(x=>{allPages[x.path]=(allPages[x.path]||0)+1});
    const topPages=Object.entries(allPages).sort((a,b)=>b[1]-a[1]).slice(0,5);
    traffic=`<div class="card" style="margin-bottom:20px">
      <h2 style="margin:0 0 10px;font-size:17px"><i data-lucide="activity"></i> صفحة بث الدروس — آخر ٣٠ يوماً</h2>
      ${lb.length?`<div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-end">
        <div><div style="font-size:24px;font-weight:800">${uv}</div><div style="font-size:12px;color:var(--muted)">زائر</div></div>
        <div style="color:var(--muted)">←</div>
        <div><div style="font-size:24px;font-weight:800">${st30}</div><div style="font-size:12px;color:var(--muted)">فتحوا الدفع (${pct(st30,uv)})</div></div>
        <div style="color:var(--muted)">←</div>
        <div><div style="font-size:24px;font-weight:800">${b30}</div><div style="font-size:12px;color:var(--muted)">اشتروا (${pct(b30,uv)} من الزوّار)</div></div>
        ${DSH.kit?`<div style="border-inline-start:1px solid var(--line);padding-inline-start:18px"><div style="font-size:24px;font-weight:800">${DSH.kit.length}</div><div style="font-size:12px;color:var(--muted)">أخذوا القائمة المجّانيّة</div></div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px">
        <div><div style="font-size:12px;color:var(--muted);margin-bottom:6px">من وين جوا</div>${top.map(([k,n])=>`<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0"><span dir="auto">${esc(k)}</span><b>${n}</b></div>`).join('')}</div>
        <div><div style="font-size:12px;color:var(--muted);margin-bottom:6px">أكثر صفحات الموقع زيارة</div>${topPages.map(([k,n])=>`<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0"><span dir="ltr">${esc(k)}</span><b>${n}</b></div>`).join('')}</div>
      </div>`:`<p style="color:var(--muted);font-size:14px;margin:0">العدّ بدأ ٢٣ نوفمبر ٢٠٢٦ — الأرقام تظهر هنا مع أوّل الزيارات.</p>`}
      ${DSH.kit&&DSH.kit.length?`<details style="margin-top:12px"><summary style="cursor:pointer;font-size:13px;font-weight:700">أخذوا «قائمة تجهيز المسجد» (${DSH.kit.length})</summary>
        <table class="hr-table" style="width:100%;margin-top:6px"><tbody>${DSH.kit.slice(0,100).map(x=>{const wa=dshPhoneWa(x.phone);return `<tr><td>${esc(x.name||'—')}</td><td dir="ltr" style="font-size:12px">${esc(x.email)}</td><td style="font-size:12px">${dshDate(x.created_at)}</td><td>${wa?`<a class="btn btn-ghost btn-sm" href="${wa}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i></a>`:''}</td></tr>`}).join('')}</tbody></table></details>`:''}
      ${dshSeqHTML()}
      <p style="font-size:12px;color:var(--muted);margin:10px 0 0">صفحة الهديّة المجّانيّة: <code dir="ltr">ibrahimsaud.com/lessons-broadcast/kit/</code> · رابط البايو في تيك توك: <code dir="ltr">ibrahimsaud.com/lessons-broadcast/?utm_source=tiktok</code> — عشان تنحسب زيارات تيك توك باسمها (متصفّح تيك توك يخفي المصدر).</p></div>`;
  }
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
      </div>
      <div style="display:grid;grid-template-columns:120px 1fr;gap:10px;margin:0 0 10px">
        <div class="field" style="margin:0"><label>الإصدار</label><input value="${esc(p.version||'')}" placeholder="1.0.3" dir="ltr" onchange="dshProd('${esc(p.sku)}',{version:this.value.trim()||null})"></div>
        <div class="field" style="margin:0"><label>وش الجديد <small style="color:var(--muted)">(يظهر للمشترين في «حسابي»)</small></label><textarea rows="2" placeholder="سطر لكل تحسين" onchange="dshProd('${esc(p.sku)}',{changelog:this.value.trim()||null})">${esc(p.changelog||'')}</textarea></div>
      </div>
      ${dshUpdHTML(p,paid)}${tierHtml}${files}</div>`;
  }).join('');

  const rows=list.map(o=>{
    const [l,c]=DSH_ST[o.status]||[o.status,'#888'];const wa=dshPhoneWa(o.buyer_phone,o.buyer_country||o.ip_country);
    return `<tr>
      <td><b>${esc(o.buyer_name)}</b><div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(o.buyer_email)}</div>${o.buyer_phone?`<div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(o.buyer_phone)}</div>`:''}</td>
      <td>${esc(o.title)}</td><td style="white-space:nowrap">${dshMoney(o.amount)}${o.buyer_country?`<div style="font-size:12px;color:var(--muted)" title="بلد المشتري (من ساعة جهازه أو اختياره) · بلد الاتّصال (IP) لو اختلف · بلد البطاقة">${dshFlag(o.buyer_country)}${o.ip_country&&o.ip_country!==o.buyer_country?' · اتّصال '+dshFlag(o.ip_country):''}${o.card_country&&o.card_country!==o.buyer_country?' · بطاقة '+dshFlag(o.card_country):''}</div>`:''}</td>
      <td><span class="badge" style="background:${c}22;color:${c}">${l}</span>${o.pay_method==='transfer'?`<div style="margin-top:4px"><span class="badge" style="background:#2F66FF22;color:#2F66FF" title="رقم الطلب اللي يرسله المشتري على واتساب">تحويل · <span dir="ltr">${o.id.slice(0,8).toUpperCase()}</span></span>${o.status==='pending'?` <button class="btn btn-primary btn-sm" onclick="dshTransferPaid('${o.id}')" title="وصل المبلغ — يتحوّل مدفوعاً ويوصله رابط التنزيل على إيميله">وصل التحويل ✓</button>`:''}</div>`:''}${o.hold?`<div><span class="badge" style="background:#f59e0b22;color:#b45309;margin-top:4px" title="سعر خاصّ ببطاقة من بلد آخر — التنزيل موقوف">مراجعة</span> <button class="btn btn-ghost btn-sm" onclick="dshApprove('${o.id}')" title="افتح التنزيل لهذا الطلب">اعتمد</button></div>`:''}</td>
      <td style="white-space:nowrap;font-size:12px">${dshDate(o.paid_at||o.created_at)}${o.status==='paid'?(o.email_sent_at?'<div style="color:#16a34a" title="وصله إيميل «طلبك جاهز»">✉︎ وصله الإيميل</div>':'<div style="color:#b45309" title="ما وصله إيميل الطلب — زرّ الإرسال يرسل له رابطه">✉︎ ما وصله إيميل</div>'):''}</td>
      <td style="text-align:center">${dlBy[o.id]||0}</td><td style="text-align:center">${(o.trusted_devices||[]).length}/5</td>
      <td style="white-space:nowrap">
        ${o.status==='paid'?`<button class="btn btn-ghost btn-sm" title="يرسل للمشتري رابط طلبه من جديد" onclick="dshResend('${esc(o.buyer_email)}')"><i data-lucide="send"></i></button>
        <button class="btn btn-ghost btn-sm" title="يمسح الأجهزة الموثّقة — أوّل جهاز يفتح الطلب يُوثَّق" onclick="dshResetDevices('${o.id}')"><i data-lucide="smartphone"></i></button>
        ${(DSH.codes||[]).some(c=>c.given_email===String(o.buyer_email).toLowerCase())?`<span class="badge" style="background:#2F66FF22;color:#2F66FF" title="أُعطي كود آيفون">🎁</span>`:`<button class="btn btn-ghost btn-sm" title="أهدِه كود تطبيق الآيفون (هديّة — لا يُربط بالشراء)" onclick="dshGiftCode('${o.id}')">🎁</button>`}`:''}
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
    <div class="stats" style="margin-bottom:20px">
      <div class="stat"><span class="ic"><i data-lucide="users"></i></span><div class="v">${people}</div><div class="l">فتحوا صفحة الدفع</div></div>
      <div class="stat"><span class="ic"><i data-lucide="user-check"></i></span><div class="v">${buyers}</div><div class="l">اشتروا (${people?Math.round(buyers*100/people):0}٪)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="shopping-cart"></i></span><div class="v">${abandoned.length}</div><div class="l">ما كمّلوا الدفع</div></div>
      <div class="stat"><span class="ic"><i data-lucide="mail-warning"></i></span><div class="v" style="${noMail?'color:#b45309':''}">${noMail}</div><div class="l">مشترٍ ما وصله إيميل الطلب</div></div>
    </div>
    ${traffic}
    ${dshCodesHTML()}
    ${dshSoonHTML()}
    ${abandoned.length?`<div class="card" style="margin-bottom:20px;overflow:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
        <h2 style="margin:0;font-size:17px"><i data-lucide="shopping-cart"></i> بدأوا الدفع وما كمّلوا</h2>
        <span style="font-size:12px;color:var(--muted)">«تابِع» يفتح واتساب برسالة جاهزة باسمه — أنت تقرأها وترسلها. واتساب للي دخل الدفع فقط.</span></div>
      ${dshRemindHTML()}
      <table class="hr-table" style="width:100%"><thead><tr><th>الشخص</th><th>المبلغ</th><th>آخر محاولة</th><th></th></tr></thead><tbody>${abRows}</tbody></table>
      ${abandoned.length>12?`<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="DSH.abAll=!DSH.abAll;renderDShop()">${DSH.abAll?'أقلّ':'الكلّ ('+abandoned.length+')'}</button>`:''}</div>`:''}
    <h2 style="margin:6px 0 10px;font-size:17px">المنتجات</h2>
    <div class="grid">${prodCards||'<div class="card">ما فيه منتجات — أضفها في supabase/shop.sql</div>'}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:24px 0 10px;flex-wrap:wrap">
      <h2 style="margin:0;font-size:17px">الطلبات والمشترون</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${trWait.length||DSH.filter==='transfer'?pill('transfer','تحويل بانتظار',trWait.length):''}${pill('paid','مدفوع',paid.length)}${pill('pending','بانتظار',O.filter(o=>o.status==='pending').length)}${pill('failed','فشل',O.filter(o=>o.status==='failed'||o.status==='cancelled').length)}${pill('all','الكل',O.length)}
        <input placeholder="بحث بالاسم أو الإيميل…" value="${esc(DSH.q)}" oninput="DSH.q=this.value;clearTimeout(window.__dshT);window.__dshT=setTimeout(renderDShop,250)" style="max-width:200px">
        <button class="btn btn-ghost btn-sm" onclick="dshCsv()"><i data-lucide="file-down"></i> تصدير CSV</button></div></div>
    <div class="card" style="overflow:auto"><table class="hr-table" style="width:100%"><thead><tr><th>المشتري</th><th>المنتج</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>تنزيلات</th><th>أجهزة</th><th></th></tr></thead>
      <tbody>${rows||'<tr><td colspan="8" style="color:var(--muted);text-align:center;padding:24px">ما فيه طلبات هنا بعد</td></tr>'}</tbody></table></div>
    <p style="color:var(--muted);font-size:12px;margin-top:10px">«إرسال الرابط» يرسل للمشتري رابط طلبه من جديد (نفس «استرجع طلبك» في الموقع). «الأجهزة» يمسحها فيقدر يفتح طلبه من جهاز جديد. والمشتري يقدر يرجع لكلّ مشترياته من «حسابي» (ibrahimsaud.com/account) برمز على بريده.</p>`;
  applyWallpaper();refreshIcons();
}
const DSH_CC={SA:'السعودية',AE:'الإمارات',KW:'الكويت',QA:'قطر',BH:'البحرين',OM:'عُمان',EG:'مصر',MA:'المغرب',DZ:'الجزائر',TN:'تونس',LY:'ليبيا',JO:'الأردن',LB:'لبنان',IQ:'العراق',PS:'فلسطين',SY:'سوريا',YE:'اليمن',SD:'السودان',MR:'موريتانيا',SO:'الصومال',DJ:'جيبوتي',KM:'جزر القمر',TD:'تشاد',SS:'جنوب السودان',ER:'إريتريا',NE:'النيجر',ML:'مالي',SN:'السنغال',GM:'غامبيا',GN:'غينيا',BF:'بوركينا فاسو',ET:'إثيوبيا',KE:'كينيا',TZ:'تنزانيا',NG:'نيجيريا',AF:'أفغانستان',PK:'باكستان',BD:'بنغلاديش',IN:'الهند',ID:'إندونيسيا',MY:'ماليزيا',TR:'تركيا',MV:'المالديف',KZ:'كازاخستان',UZ:'أوزبكستان',KG:'قرغيزستان',TJ:'طاجيكستان',TM:'تركمانستان',AZ:'أذربيجان',BA:'البوسنة',AL:'ألبانيا',XK:'كوسوفو'};
function dshFlag(c){c=String(c||'').toUpperCase();if(!/^[A-Z]{2}$/.test(c))return '';return String.fromCodePoint(...[...c].map(x=>0x1F1A5+x.charCodeAt(0)))+' '+(DSH_CC[c]||c)}
/* ═══════════ أكواد الآيفون (App Store Promo Codes) ═══════════
 * هديّة فقط: شروط آبل تمنع بيعها أو أخذ أيّ مقابل عنها — لا تُكتب «مع الشراء» في أيّ مكان.
 * الكود ينتهي ١١:٥٩ م بتوقيت المحيط الهادئ بعد ٢٨ يوماً من طلبه (أقصى مدّة عند آبل)، ١٠٠ كود لكل إصدار.
 * الجدول ios_promo_codes للمالك فقط. توليد جديد: App Store Connect ← Promo Codes، ثمّ الصقها هنا. */
// «قريباً»: من سجّل إيميله لكلّ منتج قادم — عدد لكلّ منتج، والقائمة تنفتح بالضغط، ونسخ الإيميلات لرسالة الإطلاق.
function dshSoonHTML(){
  if(!DSH.soon)return '';
  const by={};Object.keys(DSH_SOON).forEach(k=>by[k]=[]);DSH.soon.forEach(x=>{(by[x.product]=by[x.product]||[]).push(x)});
  const blocks=Object.entries(by).map(([k,list])=>`<details style="border-top:1px solid var(--line);padding:8px 0"><summary style="cursor:pointer;display:flex;justify-content:space-between;gap:10px;align-items:center"><b style="font-size:14px">${esc(DSH_SOON[k]||k)}</b><span class="badge" style="background:#2F66FF22;color:#2F66FF">${list.length}</span></summary>
    ${list.length?`<div style="margin:6px 0"><button class="btn btn-ghost btn-sm" onclick="dshCopy(${esc(JSON.stringify(list.map(x=>x.email).join(', ')))},this)"><i data-lucide="copy"></i> نسخ الإيميلات</button></div>
    <table class="hr-table" style="width:100%"><tbody>${list.slice(0,200).map(x=>`<tr><td>${esc(x.name||'—')}</td><td dir="ltr" style="font-size:12px">${esc(x.email)}</td><td style="font-size:12px;color:var(--muted)">${esc(x.source||'')}</td><td style="font-size:12px">${dshDate(x.created_at)}</td></tr>`).join('')}</tbody></table>`:'<p style="font-size:12px;color:var(--muted);margin:6px 0">ما سجّل أحد بعد</p>'}</details>`).join('');
  return `<div class="card" style="margin-bottom:20px;overflow:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
      <h2 style="margin:0;font-size:17px"><i data-lucide="bell"></i> «قريباً» — مهتمّون ينتظرون (${DSH.soon.length})</h2>
      <a class="btn btn-ghost btn-sm" href="https://ibrahimsaud.com/shop/#soon" target="_blank" rel="noopener"><i data-lucide="external-link"></i> الصفحة</a></div>
    ${blocks}
    <p style="font-size:12px;color:var(--muted);margin:8px 0 0">من سجّل إيميله في بطاقات «قريباً» بالمتجر. المنتجات والنصوص في <code dir="ltr">src/lib/shop.ts</code> (shopSoon)، والجدول <code dir="ltr">shop_interest</code>.</p></div>`;
}
const DSH_ASC_PROMO='https://appstoreconnect.apple.com/apps/6836200953/distribution/promo_codes/generate';
function dshCodeFree(c){return !c.given_at&&new Date(c.expires_at).getTime()>Date.now()}
function dshCodeMsg(name,code,exp){const first=String(name||'').trim().split(/\s+/)[0]||'';
  return `السلام عليكم ${first} 🎁\nهديّة منّي: كود تطبيق «بث الدروس العلمية» على الآيفون والآيباد:\n${code}\n\nطريقة الاستخدام: افتح App Store ← صورتك أعلى الشاشة ← «استرداد بطاقة هدايا أو رمز» ← الصق الكود.\nأو اضغط هنا: https://apps.apple.com/redeem?code=${code}\n\nالكود صالح حتى ${new Date(exp).toLocaleDateString('ar-SA-u-ca-gregory',{day:'numeric',month:'long'})}.`}
function dshCodesHTML(){
  if(!DSH.codes)return '';
  const C=DSH.codes,free=C.filter(dshCodeFree),given=C.filter(c=>c.given_at),expired=C.filter(c=>!c.given_at&&!dshCodeFree(c));
  const nextExp=free.length?free.map(c=>c.expires_at).sort()[0]:null;
  const days=nextExp?Math.max(0,Math.ceil((new Date(nextExp)-Date.now())/864e5)):0;
  return `<div class="card" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <h2 style="margin:0;font-size:17px">🎁 أكواد تطبيق الآيفون</h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><a class="btn btn-ghost btn-sm" href="${DSH_ASC_PROMO}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> ولّد أكواد جديدة</a>
      <button class="btn btn-ghost btn-sm" onclick="dshImportCodes()"><i data-lucide="clipboard-paste"></i> الصق أكواداً</button></div></div>
    <div style="display:flex;gap:22px;margin:12px 0;flex-wrap:wrap">
      <div><div style="font-size:24px;font-weight:800">${free.length}</div><div style="font-size:12px;color:var(--muted)">متاح</div></div>
      <div><div style="font-size:24px;font-weight:800">${given.length}</div><div style="font-size:12px;color:var(--muted)">أُهدي</div></div>
      ${nextExp?`<div><div style="font-size:24px;font-weight:800;${days<=5?'color:#b45309':''}">${days} يوم</div><div style="font-size:12px;color:var(--muted)">باقي على انتهاء المتاح</div></div>`:''}
      ${expired.length?`<div><div style="font-size:24px;font-weight:800;color:var(--muted)">${expired.length}</div><div style="font-size:12px;color:var(--muted)">انتهى بلا استخدام</div></div>`:''}
    </div>
    ${free.length?`<div style="display:flex;flex-wrap:wrap;gap:8px">${free.map(c=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 8px 6px 12px;border:1px solid var(--line);border-radius:12px;font-family:ui-monospace,Menlo,monospace;font-size:13px" dir="ltr">${esc(c.code)}
      <button class="btn btn-ghost btn-sm" style="padding:2px 6px" title="انسخ الكود" onclick="dshCopy('${esc(c.code)}',this)"><i data-lucide="copy"></i></button>
      <button class="btn btn-ghost btn-sm" style="padding:2px 6px" title="سجّل لمين أعطيته" onclick="dshGiveManual('${esc(c.code)}')"><i data-lucide="user-plus"></i></button></span>`).join('')}</div>`:'<p style="color:var(--muted);font-size:14px;margin:0">ما فيه أكواد متاحة — ولّد أكواداً من App Store Connect والصقها هنا.</p>'}
    ${given.length?`<details style="margin-top:12px"><summary style="cursor:pointer;font-size:13px;font-weight:700">أُهديت (${given.length})</summary>
      <table class="hr-table" style="width:100%;margin-top:6px"><tbody>${given.slice().sort((a,b)=>new Date(b.given_at)-new Date(a.given_at)).map(c=>`<tr><td dir="ltr" style="font-family:ui-monospace,Menlo,monospace;font-size:12px">${esc(c.code)}</td><td>${esc(c.given_to||'—')}<div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(c.given_email||'')}</div></td><td style="font-size:12px">${dshDate(c.given_at)}</td></tr>`).join('')}</tbody></table></details>`:''}
    <p style="font-size:12px;color:var(--muted);margin:10px 0 0">هديّة فقط — شروط آبل تمنع بيع الأكواد أو ربطها بالشراء. الكود ينتهي بعد ٢٨ يوماً من توليده (أقصى مدّة عند آبل). زرّ 🎁 بجانب أيّ مشترٍ تحت يعطيه كوداً ويفتح واتساب برسالة جاهزة.</p></div>`;
}
function dshCopy(t,btn){try{navigator.clipboard.writeText(t);if(btn){const h=btn.innerHTML;btn.textContent='✓';setTimeout(()=>{btn.innerHTML=h;refreshIcons()},1200)}}catch(e){prompt('انسخ:',t)}}
async function dshMarkGiven(code,name,email,note){
  const now=new Date().toISOString();
  const {data,error}=await sb.from('ios_promo_codes').update({given_to:name||null,given_email:(email||'').toLowerCase()||null,given_at:now,note:note||null}).eq('code',code).is('given_at',null).select('code');
  if(error){alert('تعذّر: '+error.message);return false}
  if(!data||!data.length){alert('الكود هذا أُعطي من قبل — حدّث الصفحة');return false}
  const c=DSH.codes.find(x=>x.code===code);if(c)Object.assign(c,{given_to:name,given_email:(email||'').toLowerCase(),given_at:now});return true;
}
async function dshGiftCode(orderId){
  const o=(DSH.orders||[]).find(x=>x.id===orderId);if(!o)return;
  const c=(DSH.codes||[]).filter(dshCodeFree).sort((a,b)=>a.expires_at<b.expires_at?-1:1)[0];
  if(!c){alert('ما فيه أكواد متاحة — ولّد أكواداً من App Store Connect والصقها في «أكواد تطبيق الآيفون».');return}
  if(!confirm('نهدي '+o.buyer_name+' كود تطبيق الآيفون '+c.code+'؟\n(هديّة — لا تكتب إنّه جزء من الشراء)'))return;
  if(!await dshMarkGiven(c.code,o.buyer_name,o.buyer_email,'order '+o.id.slice(0,8)))return;
  const msg=dshCodeMsg(o.buyer_name,c.code,c.expires_at);dshCopy(msg);
  const wa=dshPhoneWa(o.buyer_phone,o.buyer_country||o.ip_country,msg);
  if(wa)window.open(wa,'_blank','noopener');else alert('نُسخت الرسالة — ما عنده جوال، أرسلها له على '+o.buyer_email);
  renderDShop();
}
async function dshGiveManual(code){
  const name=prompt('لمين أعطيت الكود '+code+'؟ (الاسم)');if(name===null)return;
  const email=prompt('بريده (اختياريّ):','')||'';
  const c=DSH.codes.find(x=>x.code===code);
  if(await dshMarkGiven(code,name.trim(),email.trim(),'manual')){dshCopy(dshCodeMsg(name,code,c?c.expires_at:Date.now()+28*864e5));alert('سُجّل ✓ ونُسخت رسالة جاهزة فيها الكود');renderDShop()}
}
async function dshImportCodes(){
  const t=prompt('الصق الأكواد الجديدة من App Store Connect (كلّ كود في سطر أو بينها مسافات):','');if(!t)return;
  const codes=[...new Set((t.toUpperCase().match(/\b[A-Z0-9]{10,14}\b/g)||[]))];if(!codes.length){alert('ما لقيت أكواداً');return}
  const ver=prompt('إصدار التطبيق اللي ولّدت له الأكواد:','1.0')||null;
  // آبل: ١١:٥٩ م بتوقيت المحيط الهادئ بعد ٢٨ يوماً ≈ ٠٧:٥٩ UTC من اليوم التالي
  const e=new Date();e.setUTCDate(e.getUTCDate()+29);e.setUTCHours(7,59,0,0);
  const {error}=await sb.from('ios_promo_codes').upsert(codes.map(code=>({code,version:ver,expires_at:e.toISOString()})),{onConflict:'code',ignoreDuplicates:true});
  if(error){alert('تعذّر الحفظ: '+error.message);return}
  alert('أُضيف '+codes.length+' كود ✓');dshLoad(true);
}

/* ═══════════ تذكير السلّة المتروكة (دالّة shop-remind + مهمّة shop-remind-hourly) ═══════════
 * مطفأ افتراضاً. التشغيل يكتب enabled_at = الآن: يُذكَّر فقط من يفتح الدفع بعد التشغيل (لا رسائل للقديم).
 * تذكيران كحدّ أقصى بالإيميل (بعد first_hours ساعات، وبعد second_days أيّام)، ولا واتساب آليّ. */
const DSH_REMIND_FN='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop-remind';
function dshRemindHTML(){
  const r=DSH.remind;if(!r)return '';
  const O=DSH.orders||[];const r1=O.filter(o=>o.remind1_at),r2=O.filter(o=>o.remind2_at);
  const remE=new Set([...r1,...r2].map(o=>String(o.buyer_email).toLowerCase()));
  const back=new Set(O.filter(o=>o.status==='paid'&&remE.has(String(o.buyer_email).toLowerCase())).map(o=>String(o.buyer_email).toLowerCase())).size;
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0 12px;padding:12px 14px;border-radius:14px;background:${r.enabled?'#E6F5EC':'var(--surface2,rgba(0,0,0,.04))'}">
    <div><b>تذكير تلقائيّ بالإيميل: ${r.enabled?'<span style="color:#146C3A">مفعّل</span>':'<span style="color:var(--muted)">مطفأ</span>'}</b>
      <div style="font-size:12px;color:var(--muted);margin-top:3px">إيميل بعد ${r.first_hours||3} ساعات، وآخر بعد ${r.second_days||3} أيّام — لمن فتح الدفع ولم يدفع${r.enabled&&r.enabled_at?' بعد '+dshDate(r.enabled_at):''}. بلا واتساب آليّ.${r1.length||r2.length?` · أُرسل: ${r1.length} أوّل، ${r2.length} أخير · رجعوا واشتروا: ${back}`:''}</div></div>
    <div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="dshRemindPreview()" title="يرسل الإيميلين لبريدك أنت فقط"><i data-lucide="eye"></i> معاينة على بريدي</button>
      <button class="btn ${r.enabled?'btn-ghost':'btn-primary'} btn-sm" onclick="dshRemindToggle()">${r.enabled?'أطفئه':'شغّله'}</button></div></div>`;
}
async function dshRemindToggle(){
  const r=DSH.remind||{};const on=!r.enabled;
  if(on&&!confirm('تشغيل التذكير التلقائيّ؟\nمن يفتح صفحة الدفع من الآن ولا يدفع يوصله إيميل بعد '+(r.first_hours||3)+' ساعات وآخر بعد '+(r.second_days||3)+' أيّام.\nاللي قبل الآن ما يوصلهم شيء.'))return;
  if(!on&&!confirm('إطفاء التذكير التلقائيّ؟'))return;
  const v={...r,enabled:on,enabled_at:on?new Date().toISOString():r.enabled_at};
  const {error}=await sb.from('shop_settings').update({value:v,updated_at:new Date().toISOString()}).eq('key','cart_reminders');
  if(error){alert('تعذّر: '+error.message);return}
  DSH.remind=v;renderDShop();
}
async function dshRemindPreview(){
  try{const r=await fetch(DSH_REMIND_FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY},body:JSON.stringify({action:'preview'})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('HTTP '+r.status));alert('أُرسل الإيميلان لبريدك ✓ ('+d.to+')');}
  catch(e){alert('تعذّر: '+(e.message||e))}
}

/* ═══════════ سلسلة «قائمة تجهيز المسجد» + إعلان التحديث (دالّة shop-mail) ═══════════
 * السلسلة: ٧ إيميلات يوماً بيوم لمن يأخذ الهديّة — مطفأة افتراضاً، وللمشتركين بعد التشغيل فقط، وتتوقّف لمن اشترى أو ألغى.
 * إعلان التحديث: يُرسل بضغطتك فقط لكلّ مشتري المنتج (مرّة لكل إصدار)، والدالّة تتحقّق أنّ الجلسة جلسة المالك. */
const DSH_MAIL_FN='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop-mail';
async function dshMailCall(body){
  const {data}=await sb.auth.getSession();const tok=data&&data.session?data.session.access_token:'';
  const r=await fetch(DSH_MAIL_FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY,'x-user-token':tok},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('HTTP '+r.status));return d;
}
function dshSeqHTML(){
  const q=DSH.seq;if(!q)return '';
  const kit=DSH.kit||[];
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:12px 14px;border-radius:14px;background:${q.enabled?'#E6F5EC':'var(--surface2,rgba(0,0,0,.04))'}">
    <div><b>سلسلة إيميلات الهديّة (٧ أيّام): ${q.enabled?'<span style="color:#146C3A">مفعّلة</span>':'<span style="color:var(--muted)">مطفأة</span>'}</b>
      <div style="font-size:12px;color:var(--muted);margin-top:3px">إيميل كلّ يوم لمن يأخذ «قائمة تجهيز المسجد»${q.enabled&&q.enabled_at?' من '+dshDate(q.enabled_at):''}: القائمة ← ٣ أخطاء ← القصّة ← الكتاب في الشاشة ← الصوت ← الأسئلة ← دعوة للشراء. تتوقّف لمن اشترى أو ألغى.</div></div>
    <div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="dshSeqPreview()" title="يرسل الإيميلات السبعة لبريدك أنت فقط"><i data-lucide="eye"></i> معاينة على بريدي</button>
      <button class="btn ${q.enabled?'btn-ghost':'btn-primary'} btn-sm" onclick="dshSeqToggle()">${q.enabled?'أطفئها':'شغّلها'}</button></div></div>`;
}
async function dshSeqToggle(){
  const q=DSH.seq||{};const on=!q.enabled;
  if(on&&!confirm('تشغيل سلسلة إيميلات الهديّة؟\nمن يأخذ «قائمة تجهيز المسجد» من الآن يوصله إيميل كلّ يوم لسبعة أيّام.\nاللي أخذوها قبل الآن ما يوصلهم شيء.'))return;
  if(!on&&!confirm('إطفاء السلسلة؟'))return;
  const v={...q,enabled:on,enabled_at:on?new Date().toISOString():q.enabled_at};
  const {error}=await sb.from('shop_settings').update({value:v,updated_at:new Date().toISOString()}).eq('key','kit_sequence');
  if(error){alert('تعذّر: '+error.message);return}DSH.seq=v;renderDShop();
}
async function dshSeqPreview(){try{const d=await dshMailCall({action:'seq-preview'});alert('أُرسلت '+d.count+' إيميلات لبريدك ✓')}catch(e){alert('تعذّر: '+(e.message||e))}}
function dshUpdHTML(p,paid){
  const base=s=>String(s||'').split('@')[0];
  const n=new Set(paid.filter(o=>base(o.sku)===p.sku&&!o.hold).map(o=>String(o.buyer_email).toLowerCase())).size;
  const last=((DSH.upd&&DSH.upd.sent)||[]).filter(x=>x.sku===p.sku).slice(-1)[0];
  const done=last&&last.version===p.version;
  return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px">
    <button class="btn btn-ghost btn-sm" ${p.version?'':'disabled'} onclick="dshUpdPreview('${esc(p.sku)}')" title="يرسل إعلان التحديث لبريدك أنت فقط"><i data-lucide="eye"></i> معاينة الإعلان</button>
    <button class="btn ${done?'btn-ghost':'btn-primary'} btn-sm" ${p.version&&n?'':'disabled'} onclick="dshUpdSend('${esc(p.sku)}',${n})"><i data-lucide="megaphone"></i> أعلن التحديث للمشترين (${n})</button>
    <span style="font-size:12px;color:var(--muted)">${last?`آخر إعلان: ${esc(last.version)} لـ${last.count} · ${dshDate(last.at)}`:(p.version?'':'اكتب رقم الإصدار أوّلاً')}</span></div>`;
}
async function dshUpdPreview(sku){try{await dshMailCall({action:'update-preview',sku});alert('أُرسلت المعاينة لبريدك ✓')}catch(e){alert('تعذّر: '+(e.message||e))}}
async function dshUpdSend(sku,n){
  const p=(DSH.products||[]).find(x=>x.sku===sku);if(!p)return;
  if(!confirm('نرسل إعلان التحديث '+p.version+' لـ'+n+' مشترٍ؟\nفيه «وش الجديد» ورابط «حسابي». لا يمكن التراجع بعد الإرسال.'))return;
  try{const d=await dshMailCall({action:'update-send',sku});alert('أُرسل لـ'+d.count+' ✓'+(d.failed?' — تعذّر '+d.failed:''));dshLoad(true)}
  catch(e){if(/من قبل/.test(e.message||'')){if(confirm((e.message||'')+'\nترسله مرّة ثانية؟')){try{const d=await dshMailCall({action:'update-send',sku,force:true});alert('أُرسل لـ'+d.count+' ✓');dshLoad(true)}catch(e2){alert('تعذّر: '+(e2.message||e2))}}}else alert('تعذّر: '+(e.message||e))}
}

// من تابعتهم (محلّيّاً في هذا المتصفّح — تذكير لك فقط، لا يُرسل شيئاً)
function dshFollowed(){try{return JSON.parse(localStorage.getItem('dsh-followed')||'{}')}catch(_){return {}}}
function dshMarkFollowed(email){try{const f=dshFollowed();f[email]=new Date().toISOString();localStorage.setItem('dsh-followed',JSON.stringify(f))}catch(_){}setTimeout(renderDShop,400)}
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
