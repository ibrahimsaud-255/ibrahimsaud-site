/*
 * 26-dshop.js — «المتجر الرقميّ»: إدارة متجر ibrahimsaud.com/shop/ (برامج، ملفّات، دورات)
 * ─────────────────────────────────────────────────────────────────────────
 * يقرأ جداول shop_products / shop_orders / shop_downloads مباشرة (RLS: المالك فقط).
 * الإجراءات الحسّاسة (رابط الطلب للمشتري) عبر الدالّة الحافّة «shop» (action=recover).
 * البادئة dsh — تعريفات فقط (لا تنفيذ عند التحميل). الدليل: docs/المتجر-الرقمي.md
 */
let DSH={orders:null,products:null,dl:null,views:null,err:null,loading:false,filter:'paid',q:''};
const DSH_ST={paid:['مدفوع','#22c55e'],pending:['بانتظار الدفع','#f59e0b'],failed:['فشل','#ef4444'],cancelled:['أُلغي','#64748b']};
const DSH_FN='https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop';

async function dshLoad(force){
  if(DSH.loading)return;DSH.loading=true;try{extAutoSync(!!force)}catch(e){}DSH.err=null;if(force&&CUR==='dshop')renderDShop();
  try{
    const [o,p,d,k,v]=await Promise.all([
      sb.from('shop_orders').select('id,sku,title,amount,buyer_name,buyer_email,buyer_phone,status,trusted_devices,created_at,paid_at,buyer_country,ip_country,card_country,hold,pay_method,email_sent_at').order('created_at',{ascending:false}).limit(1000),
      sb.from('shop_products').select('*').order('sort'),
      sb.from('shop_downloads').select('order_id,file_id,at').order('at',{ascending:false}).limit(2000),
      sb.from('subscribers').select('email,name,phone,created_at').eq('source','lb-kit').order('created_at',{ascending:false}).limit(1000),
      sb.from('site_views').select('path,utm,ref,vid,at').gte('at',new Date(Date.now()-30*864e5).toISOString()).order('at',{ascending:false}).limit(20000),
    ]);
    if(o.error)throw o.error;if(p.error)throw p.error;
    DSH.orders=o.data||[];DSH.products=p.data||[];DSH.dl=d.error?[]:(d.data||[]);DSH.views=v&&!v.error?(v.data||[]):null;DSH.kit=k&&!k.error?(k.data||[]):null;
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
      </div>${tierHtml}${files}</div>`;
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
    <div class="stats" style="margin-bottom:20px">
      <div class="stat"><span class="ic"><i data-lucide="users"></i></span><div class="v">${people}</div><div class="l">فتحوا صفحة الدفع</div></div>
      <div class="stat"><span class="ic"><i data-lucide="user-check"></i></span><div class="v">${buyers}</div><div class="l">اشتروا (${people?Math.round(buyers*100/people):0}٪)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="shopping-cart"></i></span><div class="v">${abandoned.length}</div><div class="l">ما كمّلوا الدفع</div></div>
      <div class="stat"><span class="ic"><i data-lucide="mail-warning"></i></span><div class="v" style="${noMail?'color:#b45309':''}">${noMail}</div><div class="l">مشترٍ ما وصله إيميل الطلب</div></div>
    </div>
    ${traffic}
    ${abandoned.length?`<div class="card" style="margin-bottom:20px;overflow:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
        <h2 style="margin:0;font-size:17px"><i data-lucide="shopping-cart"></i> بدأوا الدفع وما كمّلوا</h2>
        <span style="font-size:12px;color:var(--muted)">«تابِع» يفتح واتساب برسالة جاهزة باسمه — أنت تقرأها وترسلها. واتساب للي دخل الدفع فقط.</span></div>
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
