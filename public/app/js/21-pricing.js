/*
 * 21-pricing.js — مستشار التسعير: حاسبة + دليل أسعار + سجلّ نتائج
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 *
 * الفكرة: السعر تحسبه معادلة ثابتة (لا نموذج ذكاء) — سعر ساعتك الفعليّ من
 * «الأساس»، ودليل خدمات بحدّ أدنى ومستهدف، ومضاعفات (نوع العميل، الاستخدام،
 * الاستعجال، الموقع). الناتج ثلاثة أرقام + «ليش» + تحليل ميزانيّة العميل، ثم
 * عرض سعر جاهز في المبيعات. كلّ عرض يُسجَّل بنتيجته ليتعلّم الدليل من الواقع.
 * البيانات في S.pricing = {base, policy, rates[], log[]} (تتزامن مع الكتلة).
 */
/* ═══════════ الثوابت والبيانات الافتراضيّة ═══════════ */
const PRC_CATS={video:'فيديو وإعلانات',podcast:'بودكاست',photo:'تصوير',design:'تصميم',tech:'مواقع وأنظمة',other:'أخرى'};
// مضاعفات افتراضيّة — قابلة للتعديل من تبويب «الأساس»
const PRC_FACTORS={
  tier:[{k:'ind',l:'فرد',v:.85},{k:'small',l:'منشأة صغيرة',v:1},{k:'company',l:'شركة',v:1.25},{k:'gov',l:'جهة حكوميّة / كبيرة',v:1.5}],
  use:[{k:'organic',l:'نشر عضوي',v:1},{k:'paid',l:'إعلان مموّل',v:1.3},{k:'campaign',l:'حملة / تلفزيون',v:1.8}],
  urg:[{k:'normal',l:'عادي',v:1},{k:'rush',l:'مستعجل (٤٨ ساعة)',v:1.25},{k:'sameday',l:'نفس اليوم',v:1.5}],
  loc:[{k:'studio',l:'الاستديو',v:0},{k:'riyadh',l:'موقع العميل بالرياض',v:750},{k:'outside',l:'خارج الرياض',v:1500}],
  rel:[{k:'new',l:'عميل جديد',v:0},{k:'repeat',l:'عميل متكرّر',v:0},{k:'friend',l:'معرفة / صديق',v:10}],
};
// الدليل الأوّل: أسعارك الفعليّة من محادثات التسعير السابقة + باقات الموقع. الساعات تقديرٌ — عدّلها.
const PRC_SEED=[
  {id:'ad',name:'فيديو إعلاني قصير',cat:'video',unit:'مقطع',hours:8,std:1000,floor:750,tpl:'video_ad',shoot:true,rights:true,details:'كتابة الفكرة والسكربت، التصوير الاحترافي، والمونتاج النهائي جاهزاً للنشر.'},
  {id:'longedit',name:'مونتاج فيديو طويل (٣٠–٤٠ دقيقة) مع موشن جرافيك',cat:'video',unit:'فيديو',hours:12,std:500,floor:500,tpl:'video_ad',shoot:false,rights:false,details:'ترتيب المشاهد، معالجة الصوت، وإضافة عناصر الموشن جرافيك والمؤثرات.'},
  {id:'pod',name:'تصوير حلقة بودكاست (في الاستديو)',cat:'podcast',unit:'حلقة',hours:4,std:1000,floor:800,tpl:'podcast',shoot:true,rights:false,details:'تجهيز وتصوير الحلقة كاملة بعدّة كاميرات مع ضبط الإضاءة والصوت.'},
  {id:'podedit',name:'هندسة الصوت ومونتاج الحلقة',cat:'podcast',unit:'حلقة',hours:6,std:1000,floor:800,tpl:'podcast',shoot:false,rights:false,details:'معالجة الصوت، المونتاج الكامل، الفواصل وتبديل الزوايا.'},
  {id:'short',name:'مقطع قصير من الحلقة (ريلز / شورتس)',cat:'podcast',unit:'مقطع',hours:.5,std:55,floor:40,tpl:'podcast',shoot:false,rights:false,details:'اقتطاع أفضل اللحظات وتنسيقها عموديّاً مع الترجمة على الشاشة.'},
  {id:'thumb',name:'تصميم صورة مصغّرة (ثامبنيل)',cat:'design',unit:'تصميم',hours:1,std:200,floor:150,tpl:'design',shoot:false,rights:false,details:'تصميم صورة مصغّرة جذّابة تناسب يوتيوب ومنصّات النشر.'},
  {id:'session',name:'جلسة تصوير في الاستديو',cat:'photo',unit:'جلسة',hours:1.5,std:250,floor:250,tpl:'blank',shoot:true,rights:false,details:'جلسة تصوير شخصيّة أو منتجات مع إضاءة احترافيّة وتسليم الملفّات الأصليّة.'},
  {id:'hour',name:'ساعة تصوير (استديو)',cat:'photo',unit:'ساعة',hours:1,std:150,floor:150,tpl:'blank',shoot:true,rights:false,details:'حجز الاستديو بالإضاءة والصوت لمدّة ساعة.'},
  {id:'portrait',name:'تصوير بورتريه مع تعديل فوتوشوب',cat:'photo',unit:'صورة',hours:.75,std:50,floor:50,tpl:'blank',shoot:true,rights:false,details:'تصوير بورتريه بإضاءة مناسبة ومعالجة فوتوشوب احترافيّة.'},
  {id:'page',name:'تنسيق صفحة تصميم (الفكرة والمحتوى جاهزان)',cat:'design',unit:'صفحة',hours:.5,std:50,floor:50,tpl:'design',shoot:false,rights:false,details:'ترتيب العناصر وضبط الهوامش لتكون الصفحة جاهزة للطباعة.'},
  {id:'pagenew',name:'تصميم صفحة من الصفر',cat:'design',unit:'صفحة',hours:1.5,std:125,floor:100,tpl:'design',shoot:false,rights:false,details:'إعادة بناء الصفحة وتصميمها بصريّاً وتسليمها قابلة للتعديل.'},
  {id:'identity',name:'هويّة بصريّة بالذكاء الاصطناعي (مع البرومبت والملفّات)',cat:'design',unit:'هويّة',hours:3,std:250,floor:250,tpl:'design',shoot:false,rights:false,details:'إعداد البرومبت المخصّص، توليد العناصر، وتجهيز ملفّات الهويّة.'},
  {id:'questions',name:'إعداد وتنسيق أسئلة مقسّمة بالأقسام',cat:'other',unit:'ملف',hours:.5,std:50,floor:50,tpl:'blank',shoot:false,rights:false,details:'صياغة الأسئلة وترتيبها وتصنيفها في أقسام منظّمة.'},
];
const PRC_REASONS=['السعر','التوقيت','اختار غيري','بدون ردّ','ألغى المشروع','أخرى'];
let PRC_TAB='calc';
// مسودّة الحاسبة الحاليّة — عابرة (لا تُحفظ)
let PRC={client:'',tier:'small',use:'organic',urg:'normal',loc:'studio',rel:'new',budget:'',extra:'',lines:[],price:'',showDisc:true};

function pr(){
  if(!S.pricing)S.pricing={};const P=S.pricing;
  if(!P.base)P.base={monthly:15000,fixed:1500,days:18,hpd:6,set:false};
  if(!P.policy)P.policy={minOrder:300,fullUpTo:1000,depositPct:50,openPct:15,extrasMarkup:15,enforceCost:true,factors:JSON.parse(JSON.stringify(PRC_FACTORS))};
  if(!P.policy.factors)P.policy.factors=JSON.parse(JSON.stringify(PRC_FACTORS));
  if(!Array.isArray(P.rates)||!P.rates.length)P.rates=JSON.parse(JSON.stringify(PRC_SEED));
  if(!Array.isArray(P.log))P.log=[];
  return P;
}
function prcHourly(){const b=pr().base;const h=Number(b.days||0)*Number(b.hpd||0);return h>0?(Number(b.monthly||0)+Number(b.fixed||0))/h:0}
function prcFactor(group,k){const f=(pr().policy.factors[group]||[]).find(x=>x.k===k);return f||{k,l:k,v:group==='loc'||group==='rel'?0:1}}
function prcSvc(id){return pr().rates.find(r=>r.id===id)}
function prcInt(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0})}
// تقريب «لطيف» للأسعار: ٥٠ فوق الألف، ١٠ فوق المئة، وإلا ٥
function prcStep(n){return n>=1000?50:n>=100?10:5}
function prcNice(n){n=Number(n)||0;const st=prcStep(n);return Math.round(n/st)*st}
// الحدود تُقرَّب للأعلى دائماً — وإلا نزل «الحدّ الأدنى» تحت التكلفة نفسها
function prcNiceUp(n){n=Number(n)||0;const st=prcStep(n);return Math.ceil(n/st-1e-9)*st}
// توزيع مبلغ على البنود بنسبها (السعر المخصّص بلا خصم ظاهر، أو رفع الطلب للحدّ الأدنى)
function prcDistribute(items,total){
  const sum=items.reduce((a,it)=>a+it.qty*it.price,0);if(sum<=0||!items.length)return items;
  const k=total/sum;const out=items.map(it=>({...it,price:Math.floor(it.price*k)}));
  const res=total-out.reduce((a,it)=>a+it.qty*it.price,0);const one=out.find(it=>it.qty===1);
  if(one&&res)one.price+=res;
  return out;
}

/* ═══════════ المحرّك: يحسب كل شيء من المسودّة ═══════════ */
function prcCompute(st){
  const P=pr(),pol=P.policy,hr=prcHourly();
  const tierF=prcFactor('tier',st.tier),useF=prcFactor('use',st.use),urgF=prcFactor('urg',st.urg),locF=prcFactor('loc',st.loc),relF=prcFactor('rel',st.rel);
  const reasons=[],warns=[];
  const lines=st.lines.map(l=>{
    const s=prcSvc(l.sid);if(!s)return null;const qty=Math.max(1,Number(l.qty)||1);
    const unitCost=Number(s.hours||0)*hr;
    let unitFloor=Number(s.floor||0);
    const underCost=unitCost>unitFloor;
    if(pol.enforceCost&&underCost){unitFloor=unitCost}
    // المضاعفات تُطبَّق على الأساس المصحَّح (لا يقلّ عن الحدّ) — وإلا ابتلعها رفعُ التكلفة
    let unit=Math.max(Number(s.std||0),unitFloor)*tierF.v*urgF.v*(s.rights?useF.v:1);
    unit=Math.max(prcNice(unit),prcNiceUp(unitFloor));
    return {s,qty,unit,unitFloor:prcNiceUp(unitFloor),unitCost,underCost,stdBelowCost:unitCost>Number(s.std||0)};
  }).filter(Boolean);
  const shoots=lines.some(l=>l.s.shoot);
  const locFee=shoots?Number(locF.v||0):0;
  const extraCost=Math.max(0,Number(st.extra)||0);
  const extraFee=extraCost?prcNice(extraCost*(1+Number(pol.extrasMarkup||0)/100)):0;
  const cost=lines.reduce((a,l)=>a+l.unitCost*l.qty,0)+locFee+extraCost;
  let floor=lines.reduce((a,l)=>a+l.unitFloor*l.qty,0)+locFee+extraCost;
  let target=lines.reduce((a,l)=>a+l.unit*l.qty,0)+locFee+extraFee;
  const minOrder=Number(pol.minOrder||0);
  if(lines.length&&target<minOrder){warns.push(`الطلب أصغر من حدّك الأدنى للطلب (${money(minOrder)}) — رُفع المستهدف إليه. الطلبات الصغيرة تأكل وقت التواصل أكثر مما تدفع.`);target=minOrder}
  if(lines.length&&floor<minOrder)floor=minOrder;
  const opening=prcNice(target*(1+Number(pol.openPct||0)/100));
  // «ليش» — كل سطر يشرح عاملاً واحداً
  if(hr)reasons.push(`سعر ساعتك الفعليّ <b>${money(hr)}</b> (هدفك الشهري + مصاريفك ÷ ساعات العمل المفوترة). هذا العمل يأخذ تقريباً <b>${r2(lines.reduce((a,l)=>a+Number(l.s.hours||0)*l.qty,0))} ساعة</b> = تكلفة ${money(cost)}.`);
  if(tierF.v!==1)reasons.push(tierF.k==='gov'?`جهة حكوميّة أو كبيرة <b>×${tierF.v}</b>: الدفع من ميزانيّة معتمدة لا من جيب الموظّف، والعمل يُنشر أو يُطبع رسميّاً. لا تخفّض قبل أن يعترض.`:`${esc(tierF.l)} <b>×${tierF.v}</b>.`);
  if(lines.some(l=>l.s.rights)&&useF.v!==1)reasons.push(`الاستخدام «${esc(useF.l)}» <b>×${useF.v}</b>: المقطع سيُدفع عليه إعلانياً ويجلب له مبيعات — قيمته عنده أعلى من النشر العضوي.`);
  if(urgF.v!==1)reasons.push(`«${esc(urgF.l)}» <b>×${urgF.v}</b>: سرعتك ميزة تُباع، لا خصم تعطيه.`);
  if(locFee)reasons.push(`التصوير في «${esc(locF.l)}» يضيف <b>${money(locFee)}</b> لنقل المعدات وفكّها وتركيبها.`);
  if(extraFee)reasons.push(`مصاريف خارجيّة ${money(extraCost)} + هامش إدارة ${pol.extrasMarkup}% = <b>${money(extraFee)}</b>.`);
  if(lines.length)reasons.push(`الافتتاحي أعلى من المستهدف بـ${pol.openPct}% — مساحة تفاوض تنزل فيها دون أن تمسّ المستهدف.`);
  lines.forEach(l=>{if(l.stdBelowCost)warns.push(`«${esc(l.s.name)}»: سعر الدليل (${money(l.s.std)}) أقل من تكلفة وقتك (${money(l.unitCost)})${pol.enforceCost?' — رُفع للتكلفة':''}. إذا كانت ساعاتك فعلاً أقل، عدّلها في دليل الأسعار.`)});
  if(relF.k==='repeat')reasons.push('عميل متكرّر: حافظ على نفس سعره السابق أو أعلى قليلاً — الاستقرار يبني الثقة.');
  // الدفع حسب السياسة
  const relDisc=Number(relF.v||0);
  let pay;
  if(tierF.k==='gov')pay={mode:'po',pct:0,label:'حسب أمر الشراء / التعميد الرسمي من الجهة — يبدأ العمل بعد استلامه'};
  else if(target<=Number(pol.fullUpTo||0))pay={mode:'full',pct:100,label:'كامل المبلغ قبل بدء العمل'};
  else pay={mode:'deposit',pct:Number(pol.depositPct||50),label:`${pol.depositPct}% عند التعميد، والباقي قبل تسليم الملفّات النهائيّة`};
  return {lines,locF,locFee,extraCost,extraFee,cost:r2(cost),floor:prcNiceUp(floor),target:prcNice(target),opening,reasons,warns,pay,relDisc,hr};
}
// تحليل ميزانيّة العميل مقابل الأرقام الثلاثة + اقتراح نطاق أصغر
function prcBudget(st,c){
  const b=Number(st.budget)||0;if(!b||!c.lines.length)return '';
  if(b>=c.opening)return `<div class="prc-verdict good">ميزانيّته (${money(b)}) تغطّي الافتتاحي — قدّم الافتتاحي ولا تنزل.</div>`;
  if(b>=c.target)return `<div class="prc-verdict good">ميزانيّته فوق المستهدف — قدّم سعراً قريباً منها: <b>${money(prcNice(b))}</b>.</div>`;
  if(b>=c.floor)return `<div class="prc-verdict warn">ميزانيّته بين حدّك الأدنى والمستهدف. تقدر تقبل، لكن اعرض الفرق <b>خصماً ظاهراً</b> (${money(c.target-b)}) حتى يبقى سعرك الأصلي مرئيّاً — أو قلّل النطاق.</div>`;
  // تحت الحدّ: قلّل النطاق تدريجيّاً حتى يدخل الحدّ الأدنى في ميزانيّته
  let lines=st.lines.map(l=>({...l,qty:Math.max(1,Number(l.qty)||1)}));let guard=200;
  const fl=ls=>prcCompute({...st,lines:ls}).floor;
  while(fl(lines)>b&&guard--){
    const multi=lines.filter(l=>l.qty>1);
    if(multi.length){multi.sort((a,z)=>z.qty-a.qty)[0].qty--;continue}
    if(lines.length>1){const cc=prcCompute({...st,lines});const small=cc.lines.slice().sort((a,z)=>a.unit*a.qty-z.unit*z.qty)[0];lines=lines.filter(l=>l.sid!==small.s.id);continue}
    break;
  }
  if(fl(lines)<=b){
    window._prcScope=lines;
    const desc=lines.map(l=>`${l.qty} × ${esc((prcSvc(l.sid)||{}).name||'')}`).join('، ');
    return `<div class="prc-verdict bad">ميزانيّته (${money(b)}) تحت حدّك الأدنى. <b>لا تنزل السعر — قلّل النطاق:</b><br>${desc} — حدّه الأدنى ${money(fl(lines))} · مستهدفه ${money(prcCompute({...st,lines}).target)}
      <div style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="prcApplyScope()"><i data-lucide="scissors"></i> طبّق هذا النطاق</button></div></div>`;
  }
  return `<div class="prc-verdict bad">حتى أصغر نطاق أعلى من ميزانيّته (${money(b)}). اعتذر بلطف، أو اقترح موعداً لاحقاً حين تتوفّر ميزانيّة.</div>`;
}
function prcApplyScope(){if(window._prcScope){PRC.lines=window._prcScope.map(l=>({...l}));PRC.price='';renderPricing()}}

/* ═══════════ الواجهة ═══════════ */
function renderPricing(){
  pr();
  const tabs=[['calc','calculator','الحاسبة'],['rates','book-open','دليل الأسعار'],['log','history','السجلّ والنتائج'],['base','sliders-horizontal','الأساس والسياسة']];
  const body={calc:prcCalcHTML,rates:prcRatesHTML,log:prcLogHTML,base:prcBaseHTML}[PRC_TAB]||prcCalcHTML;
  document.getElementById('main').innerHTML=`
    <style>
      .prc-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
      .prc-wrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}
      .prc-f2{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
      .prc-line{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin-bottom:8px;background:rgba(255,255,255,.03)}
      .prc-line .nm{flex:1;min-width:0;font-weight:700;font-size:14px}
      .prc-line .sub{font-size:12px;color:var(--muted);font-weight:500}
      .prc-line input{width:70px;text-align:center}
      .prc-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
      .prc-num{border:1px solid var(--line);border-radius:14px;padding:12px 8px;text-align:center;min-width:0}
      .prc-num .l{font-size:12px;color:var(--muted);font-weight:700}
      .prc-num .v{font-size:clamp(16px,1.6vw,22px);font-weight:800;margin-top:4px;white-space:nowrap}
      .prc-num .cur{font-size:11px;color:var(--muted);font-weight:600}
      .prc-num.t{border-color:var(--gold);background:var(--goldsoft)}
      .prc-verdict{border-radius:12px;padding:11px 14px;font-size:13.5px;margin:10px 0;line-height:1.8;border:1px solid var(--line)}
      .prc-verdict.good{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3)}
      .prc-verdict.warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3)}
      .prc-verdict.bad{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3)}
      .prc-why{margin:0;padding-inline-start:18px;font-size:13.5px;line-height:1.9;color:var(--ink)}
      .prc-why li{margin-bottom:4px}
      .prc-tbl input,.prc-tbl select{padding:6px 8px;font-size:13px}
      .prc-tbl td{vertical-align:middle}
      @media(max-width:900px){.prc-wrap{grid-template-columns:1fr}.prc-f2{grid-template-columns:1fr}.prc-three{gap:6px}.prc-num{padding:10px 4px}}
    </style>
    <div class="page-head"><h1><i data-lucide="scale"></i> مستشار التسعير</h1>
      <button class="btn btn-ghost" onclick="go('sales')"><i data-lucide="trending-up"></i> المبيعات</button></div>
    <div class="prc-tabs">${tabs.map(t=>`<button class="btn ${PRC_TAB===t[0]?'btn-gold':'btn-ghost'} btn-sm" onclick="PRC_TAB='${t[0]}';renderPricing()"><i data-lucide="${t[1]}"></i> ${t[2]}</button>`).join('')}</div>
    ${body()}`;
  if(PRC_TAB==='calc')prcPaint();
  refreshIcons();
}
function prcOpts(group,cur){return pr().policy.factors[group].map(f=>`<option value="${f.k}"${f.k===cur?' selected':''}>${esc(f.l)}</option>`).join('')}
function prcCalcHTML(){
  const P=pr();
  const byCat={};P.rates.forEach(r=>{(byCat[r.cat]=byCat[r.cat]||[]).push(r)});
  const addOpts=Object.keys(byCat).map(c=>`<optgroup label="${esc(PRC_CATS[c]||c)}">${byCat[c].map(r=>`<option value="${r.id}">${esc(r.name)} — ${money(r.std)} / ${esc(r.unit)}</option>`).join('')}</optgroup>`).join('');
  const names=[...new Set((S.contacts||[]).map(c=>c.name).filter(Boolean))];
  return `${P.base.set?'':`<div class="badge-note"><i data-lucide="info"></i><div>الأرقام الآن على أساس افتراضي. اضبط <b>هدفك الشهري ومصاريفك وأيام عملك</b> من تبويب «الأساس والسياسة» حتى تُحسب تكلفة وقتك الحقيقيّة. <button class="link-btn" onclick="PRC_TAB='base';renderPricing()">اضبطه الآن</button></div></div>`}
  <div class="prc-wrap">
    <div class="card">
      <h3><i data-lucide="user-round"></i> العميل والعمل</h3>
      <div class="field"><label>العميل</label><input list="prcClients" value="${esc(PRC.client)}" oninput="prcClient(this.value)" placeholder="اسم العميل أو الجهة"><datalist id="prcClients">${names.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
      <div class="prc-f2">
        <div class="field"><label>نوع العميل</label><select onchange="prcSet('tier',this.value)">${prcOpts('tier',PRC.tier)}</select></div>
        <div class="field"><label>العلاقة</label><select onchange="prcSet('rel',this.value)">${prcOpts('rel',PRC.rel)}</select></div>
        <div class="field"><label>استخدام المقطع</label><select onchange="prcSet('use',this.value)">${prcOpts('use',PRC.use)}</select></div>
        <div class="field"><label>الاستعجال</label><select onchange="prcSet('urg',this.value)">${prcOpts('urg',PRC.urg)}</select></div>
        <div class="field"><label>مكان التصوير</label><select onchange="prcSet('loc',this.value)">${prcOpts('loc',PRC.loc)}</select></div>
        <div class="field"><label>ميزانيّة العميل المعلنة (اختياري)</label><input type="number" min="0" value="${esc(PRC.budget)}" oninput="prcSet('budget',this.value)" placeholder="مثلاً 1500"></div>
      </div>
      <div class="field"><label>مصاريف خارجيّة (ممثّلون، معدّات مستأجرة، تراخيص)</label><input type="number" min="0" value="${esc(PRC.extra)}" oninput="prcSet('extra',this.value)" placeholder="0"></div>
      <h3 style="margin-top:6px"><i data-lucide="list-plus"></i> الخدمات</h3>
      <div id="prcLines">${prcLinesHTML()}</div>
      <select onchange="if(this.value){prcAdd(this.value);this.value=''}"><option value="">+ أضف خدمة من الدليل…</option>${addOpts}</select>
    </div>
    <div class="card" id="prcResult"></div>
  </div>`;
}
function prcLinesHTML(){
  if(!PRC.lines.length)return '<p style="color:var(--muted);font-size:13px">لم تُضف خدمات بعد — اختر من القائمة بالأسفل.</p>';
  return PRC.lines.map((l,i)=>{const s=prcSvc(l.sid);if(!s)return '';return `<div class="prc-line">
    <div class="nm">${esc(s.name)}<div class="sub">${money(s.std)} / ${esc(s.unit)} · ${s.hours} ساعة</div></div>
    <input type="number" min="1" value="${l.qty}" oninput="prcQty(${i},this.value)" title="الكمية">
    <button class="btn btn-ghost btn-sm" onclick="prcRm(${i})" title="حذف"><i data-lucide="x"></i></button></div>`}).join('');
}
function prcPaint(){
  const el=document.getElementById('prcResult');if(!el)return;
  const c=prcCompute(PRC);
  if(!c.lines.length){el.innerHTML=`<h3><i data-lucide="scale"></i> النتيجة</h3>${emptyBox('scale','أضف خدمة لتظهر الأرقام الثلاثة.')}`;refreshIcons();return}
  const price=PRC.price===''?c.target:Number(PRC.price)||0;
  let verdict;
  if(price<c.cost)verdict=`<div class="prc-verdict bad"><b>تحت تكلفتك.</b> بهذا السعر تدفع من وقتك — ${money(c.cost-price)} خسارة على سعر ساعتك.</div>`;
  else if(price<c.floor)verdict=`<div class="prc-verdict bad"><b>تحت حدّك الأدنى</b> (${money(c.floor)}). هل اعترض العميل فعلاً، أم أنك تخفّض مسبقاً؟ قلّل النطاق بدل السعر.</div>`;
  else if(price<c.target)verdict=`<div class="prc-verdict warn">تخفيض ${Math.round((1-price/c.target)*100)}% عن المستهدف. مقبول — ${PRC.showDisc?'سيظهر في العرض خصماً مستقلاً.':'فعّل «الخصم الظاهر» ليبقى سعرك الأصلي مرئيّاً.'}</div>`;
  else verdict=`<div class="prc-verdict good">سعر سليم${price>=c.opening?' — في مستوى الافتتاحي':''}.</div>`;
  el.innerHTML=`<h3><i data-lucide="scale"></i> النتيجة</h3>
    <div class="prc-three">
      <div class="prc-num"><div class="l">الحدّ الأدنى</div><div class="v">${prcInt(c.floor)}</div><div class="cur">${esc(S.settings.currency)}</div></div>
      <div class="prc-num t"><div class="l">المستهدف</div><div class="v">${prcInt(c.target)}</div><div class="cur">${esc(S.settings.currency)}</div></div>
      <div class="prc-num"><div class="l">الافتتاحي</div><div class="v">${prcInt(c.opening)}</div><div class="cur">${esc(S.settings.currency)}</div></div>
    </div>
    ${prcBudget(PRC,c)}
    <div class="field" style="margin-top:12px"><label>السعر الذي ستقدّمه</label>
      <input type="number" min="0" id="prcPrice" value="${PRC.price===''?c.target:esc(PRC.price)}" oninput="PRC.price=this.value;prcPaintVerdict()"></div>
    <div id="prcVerdict">${verdict}</div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:6px 0 12px;cursor:pointer"><input type="checkbox" style="width:auto" ${PRC.showDisc?'checked':''} onchange="PRC.showDisc=this.checked;prcPaintVerdict()"> اعرض أي تخفيض كخصم ظاهر في العرض (يبقى سعرك الأصلي مرئيّاً)</label>
    ${c.relDisc?`<div class="prc-verdict warn">خصم «معرفة / صديق» ${c.relDisc}% يظهر سطراً مستقلاً في العرض — لا يُخصم من سعرك الأساسي.</div>`:''}
    <div class="prc-verdict"><b>الدفع:</b> ${esc(c.pay.label)}</div>
    ${c.warns.length?c.warns.map(w=>`<div class="prc-verdict warn">${w}</div>`).join(''):''}
    <h3 style="margin-top:14px"><i data-lucide="message-circle-question"></i> ليش هذا السعر</h3>
    <ul class="prc-why">${c.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <button class="btn btn-gold" onclick="prcCreateQuote()"><i data-lucide="file-plus-2"></i> أنشئ عرض السعر</button>
      <button class="btn btn-ghost" onclick="prcReset()"><i data-lucide="rotate-ccw"></i> مسودّة جديدة</button>
    </div>`;
  refreshIcons();
}
// تحديث الحكم فقط دون إعادة رسم الحقل (حتى لا يضيع المؤشّر أثناء الكتابة)
function prcPaintVerdict(){const f=document.getElementById('prcPrice');const pos=f&&f.selectionStart;prcPaint();const g=document.getElementById('prcPrice');if(g&&f){g.focus();try{g.setSelectionRange(pos,pos)}catch(e){}}}
function prcSet(k,v){PRC[k]=v;if(k!=='budget')PRC.price='';prcPaint()}
function prcClient(v){PRC.client=v;const last=pr().log.slice().reverse().find(x=>(x.client||'').trim()===v.trim());if(last){PRC.tier=last.tier||PRC.tier;PRC.rel=PRC.rel==='new'?'repeat':PRC.rel;renderPricing();const inp=document.querySelector('#main input[list=prcClients]');if(inp){inp.focus();inp.setSelectionRange(v.length,v.length)}}}
function prcAdd(sid){const ex=PRC.lines.find(l=>l.sid===sid);if(ex)ex.qty=Number(ex.qty)+1;else PRC.lines.push({sid,qty:1});PRC.price='';document.getElementById('prcLines').innerHTML=prcLinesHTML();prcPaint();refreshIcons()}
function prcQty(i,v){if(PRC.lines[i])PRC.lines[i].qty=Math.max(1,Number(v)||1);PRC.price='';prcPaint()}
function prcRm(i){PRC.lines.splice(i,1);PRC.price='';document.getElementById('prcLines').innerHTML=prcLinesHTML();prcPaint();refreshIcons()}
function prcReset(){PRC={client:'',tier:'small',use:'organic',urg:'normal',loc:'studio',rel:'new',budget:'',extra:'',lines:[],price:'',showDisc:true};renderPricing()}

/* ═══════════ تحويل المسودّة إلى عرض سعر في المبيعات ═══════════ */
function prcCreateQuote(){
  const c=prcCompute(PRC);if(!c.lines.length)return;
  if(!PRC.client.trim()){alert('اكتب اسم العميل أولاً');return}
  const price=PRC.price===''?c.target:Number(PRC.price)||0;
  if(price<c.floor&&!confirm(`السعر ${money(price)} تحت حدّك الأدنى (${money(c.floor)}). متأكّد أنك تريد إرساله؟`))return;
  let items=c.lines.map(l=>({desc:l.s.name,qty:l.qty,price:l.unit,discount:0,details:l.s.details||''}));
  if(c.locFee)items.push({desc:'نقل وتجهيز المعدات — تصوير خارجي',qty:1,price:c.locFee,discount:0,details:'فكّ ونقل وتركيب معدات التصوير والصوت في موقع العميل.'});
  if(c.extraFee)items.push({desc:'مصاريف تشغيل خارجيّة',qty:1,price:c.extraFee,discount:0,details:'ممثّلون، معدات مستأجرة، أو تراخيص حسب الطلب.'});
  const sum=items.reduce((a,it)=>a+it.qty*it.price,0);
  let discType='none',discVal=0;
  if(price>sum||(!PRC.showDisc&&price<sum))items=prcDistribute(items,price);
  else if(price<sum){discType='amount';discVal=r2(sum-price)}
  if(c.relDisc&&discType==='none'){discType='percent';discVal=c.relDisc}
  const tplId=(c.lines[0].s.tpl&&quoteTemplates().some(t=>t.id===c.lines[0].s.tpl))?c.lines[0].s.tpl:quoteDef().defaultTemplateId;
  const tpl=quoteTemplateById(tplId);
  const exp=new Date();exp.setDate(exp.getDate()+Number(tpl.validityDays||14));
  const number=(S.counters.sale||0)+1;S.counters.sale=number;
  const d={id:uid(),number,client:PRC.client.trim(),contactId:'',clientVat:'',date:today(),expiry:exp.getFullYear()+'-'+_pad2(exp.getMonth()+1)+'-'+_pad2(exp.getDate()),
    salesperson:S.settings.salesperson||'',items,discType,discVal,notes:'',notesAuto:true,templateId:tplId,depositPct:c.pay.mode==='deposit'?c.pay.pct:(c.pay.mode==='full'?100:0),
    brandId:defaultBrandId(),status:'draft',vat:taxOn(),vatRate:15,paidDate:'',payments:[],payUrl:'',payQr:'',pricingRef:''};
  d.contactId=findOrCreateContact(d.client);const ct=S.contacts.find(x=>x.id===d.contactId);if(ct&&ct.vat)d.clientVat=ct.vat;
  // الشروط: قالب الخدمة، ثمّ نستبدل بند الدفع إن كانت السياسة «كامل مقدّماً» أو «أمر شراء»، ونضيف بند الاستعجال
  let notes=buildInitialQuoteNotes(d);
  const payLine=c.pay.mode==='full'?'1) آلية الدفع: يُسدَّد كامل المبلغ ({TOTAL}) قبل بدء العمل.':c.pay.mode==='po'?'1) آلية الدفع: يُسدَّد المبلغ وفق أمر الشراء / التعميد الرسمي من الجهة، ويبدأ العمل فور استلامه.':'';
  if(payLine){notes=/1\) آلية الدفع:[^\n]*/.test(notes)?notes.replace(/1\) آلية الدفع:[^\n]*/,payLine):payLine+'\n\n'+notes;d.notesAuto=false}
  if(PRC.urg!=='normal'){notes+=`\n\n— التسليم المستعجل: ${PRC.urg==='sameday'?'خلال نفس اليوم':'خلال ٤٨ ساعة'} من استلام المواد واعتماد المطلوب.`;d.notesAuto=false}
  d.notes=notes;
  S.sales.push(d);
  bumpStage(d.contactId,'quoted','عرض سعر #'+d.number+' (مستشار التسعير)');
  pr().log.push({id:uid(),date:today(),client:d.client,tier:PRC.tier,rel:PRC.rel,use:PRC.use,urg:PRC.urg,loc:PRC.loc,budget:Number(PRC.budget)||0,
    lines:c.lines.map(l=>({sid:l.s.id,name:l.s.name,qty:l.qty,unit:l.unit})),cost:c.cost,floor:c.floor,target:c.target,opening:c.opening,quoted:price,saleId:d.id,outcome:'',reason:''});
  save();
  prcReset();PRC_TAB='calc';
  openDoc('sale',d.id);
}

/* ═══════════ دليل الأسعار ═══════════ */
function prcRatesHTML(){
  const P=pr(),hr=prcHourly();
  const tplOpts=cur=>quoteTemplates().map(t=>`<option value="${t.id}"${t.id===cur?' selected':''}>${esc(t.name)}</option>`).join('');
  const catOpts=cur=>Object.keys(PRC_CATS).map(k=>`<option value="${k}"${k===cur?' selected':''}>${PRC_CATS[k]}</option>`).join('');
  const learn=prcLearn();
  const rows=P.rates.map((r,i)=>{const cost=Number(r.hours||0)*hr;const st=cost>Number(r.std||0)?'<span class="chip del">تحت التكلفة</span>':cost>Number(r.floor||0)?'<span class="chip warn">الحدّ تحت التكلفة</span>':'<span class="chip good">سليم</span>';
    const L=learn[r.id];
    return `<tr>
      <td style="min-width:220px"><input value="${esc(r.name)}" onchange="prcRate(${i},'name',this.value)"><div style="display:flex;gap:6px;margin-top:5px"><select onchange="prcRate(${i},'cat',this.value)">${catOpts(r.cat)}</select><input value="${esc(r.unit)}" onchange="prcRate(${i},'unit',this.value)" style="width:80px" title="الوحدة"></div></td>
      <td><input type="number" step=".25" min="0" value="${r.hours}" onchange="prcRate(${i},'hours',+this.value)" style="width:70px"></td>
      <td><input type="number" min="0" value="${r.floor}" onchange="prcRate(${i},'floor',+this.value)" style="width:90px"></td>
      <td><input type="number" min="0" value="${r.std}" onchange="prcRate(${i},'std',+this.value)" style="width:90px"></td>
      <td style="white-space:nowrap">${money(cost)}<div style="margin-top:4px">${st}</div>${L?`<div style="font-size:11px;color:var(--muted);margin-top:4px">مقبول: متوسط ${money(L.avg)} (${L.n})</div>`:''}</td>
      <td><select onchange="prcRate(${i},'tpl',this.value)">${tplOpts(r.tpl)}</select>
        <label style="display:flex;gap:6px;align-items:center;font-size:12px;margin-top:5px"><input type="checkbox" style="width:auto" ${r.shoot?'checked':''} onchange="prcRate(${i},'shoot',this.checked)"> فيه تصوير</label>
        <label style="display:flex;gap:6px;align-items:center;font-size:12px"><input type="checkbox" style="width:auto" ${r.rights?'checked':''} onchange="prcRate(${i},'rights',this.checked)"> يتأثّر بالاستخدام</label></td>
      <td><textarea rows="2" onchange="prcRate(${i},'details',this.value)" style="min-width:200px;font-size:12.5px">${esc(r.details||'')}</textarea></td>
      <td><button class="link-btn del" onclick="prcRateDel(${i})">حذف</button></td></tr>`}).join('');
  return `<div class="badge-note"><i data-lucide="info"></i><div>سعر ساعتك الحالي <b>${money(hr)}</b>. «التكلفة» = ساعات الخدمة × سعر ساعتك. الحدّ الأدنى = أقل ما تقبله، والمستهدف = سعرك الطبيعي قبل المضاعفات. بعد ٣ عروض مقبولة لخدمة يظهر متوسط ما قُبل فعلاً.</div></div>
    <div class="card" style="overflow-x:auto">
      <table class="prc-tbl"><thead><tr><th>الخدمة</th><th>ساعات</th><th>الحدّ الأدنى</th><th>المستهدف</th><th>تكلفة وقتك</th><th>القالب</th><th>الوصف في العرض</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn-gold btn-sm" onclick="prcRateAdd()"><i data-lucide="plus"></i> خدمة جديدة</button>
        <button class="btn btn-ghost btn-sm" onclick="prcRateSeed()"><i data-lucide="rotate-ccw"></i> أضف الخدمات الافتراضيّة الناقصة</button>
      </div>
    </div>`;
}
function prcRate(i,k,v){const r=pr().rates[i];if(!r)return;r[k]=v;save();if(['hours','std','floor'].includes(k))renderPricing()}
function prcRateAdd(){pr().rates.push({id:'s_'+uid(),name:'خدمة جديدة',cat:'other',unit:'وحدة',hours:1,std:300,floor:250,tpl:'blank',shoot:false,rights:false,details:''});save();renderPricing()}
function prcRateDel(i){const r=pr().rates[i];if(!r||!confirm('حذف «'+r.name+'» من الدليل؟'))return;pr().rates.splice(i,1);PRC.lines=PRC.lines.filter(l=>l.sid!==r.id);save();renderPricing()}
function prcRateSeed(){const P=pr();let n=0;PRC_SEED.forEach(s=>{if(!P.rates.some(r=>r.id===s.id)){P.rates.push(JSON.parse(JSON.stringify(s)));n++}});save();renderPricing();if(!n)alert('كل الخدمات الافتراضيّة موجودة.')}

/* ═══════════ السجلّ: النتائج تعلّم الدليل ═══════════ */
function prcOutcome(e){
  if(e.outcome)return e.outcome;
  const s=S.sales.find(x=>x.id===e.saleId);if(!s)return 'pending';
  if(s.status==='sale'||s.invoiceId)return 'won';if(s.status==='cancel')return 'lost';return 'pending';
}
// متوسط سعر الوحدة في العروض المقبولة لكل خدمة (≥٣ عروض)
function prcLearn(){
  const acc={};
  pr().log.filter(e=>prcOutcome(e)==='won').forEach(e=>{const k=e.quoted&&e.target?e.quoted/e.target:1;(e.lines||[]).forEach(l=>{(acc[l.sid]=acc[l.sid]||[]).push(l.unit*k)})});
  const out={};Object.keys(acc).forEach(k=>{if(acc[k].length>=3)out[k]={n:acc[k].length,avg:r2(acc[k].reduce((a,b)=>a+b,0)/acc[k].length)}});
  return out;
}
function prcLogHTML(){
  const L=pr().log.slice().reverse();
  if(!L.length)return emptyBox('history','لا عروض مسعّرة بعد. كل عرض تنشئه من الحاسبة يُسجَّل هنا بنتيجته.');
  const won=L.filter(e=>prcOutcome(e)==='won'),lost=L.filter(e=>prcOutcome(e)==='lost');
  const decided=won.length+lost.length;
  const ratio=L.filter(e=>e.target).map(e=>e.quoted/e.target);const avgR=ratio.length?Math.round(ratio.reduce((a,b)=>a+b,0)/ratio.length*100):0;
  const under=L.filter(e=>e.quoted<e.floor).length;
  const rc={};lost.forEach(e=>{if(e.reason)rc[e.reason]=(rc[e.reason]||0)+1});const topR=Object.entries(rc).sort((a,b)=>b[1]-a[1])[0];
  const tierL=k=>prcFactor('tier',k).l;
  const oc={won:'<span class="chip good">انقبل</span>',lost:'<span class="chip del">انرفض</span>',pending:'<span class="chip">بانتظار</span>'};
  const rows=L.map(e=>{const o=prcOutcome(e);const s=S.sales.find(x=>x.id===e.saleId);return `<tr>
    <td>${e.date}</td><td>${esc(e.client)}<div style="font-size:11px;color:var(--muted)">${esc(tierL(e.tier))}</div></td>
    <td style="font-size:12.5px">${(e.lines||[]).map(l=>`${l.qty} × ${esc(l.name)}`).join('<br>')}</td>
    <td style="white-space:nowrap">${money(e.quoted)}<div style="font-size:11px;color:${e.quoted<e.floor?'var(--bad)':e.quoted<e.target?'var(--warn)':'var(--good)'}">${e.target?Math.round(e.quoted/e.target*100):0}% من المستهدف</div></td>
    <td>${oc[o]}${o==='lost'&&e.reason?`<div style="font-size:11px;color:var(--muted);margin-top:3px">${esc(e.reason)}</div>`:''}</td>
    <td style="white-space:nowrap">
      <button class="link-btn" onclick="prcMark('${e.id}','won')">انقبل</button>
      <button class="link-btn del" onclick="prcMark('${e.id}','lost')">انرفض</button>
      ${s?`<button class="link-btn" onclick="openDoc('sale','${s.id}')">العرض</button>`:''}</td></tr>`}).join('');
  return `<div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="file-text"></i></span><div class="v">${L.length}</div><div class="l">عروض مسعّرة</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="badge-check"></i></span><div class="v">${decided?Math.round(won.length/decided*100):0}%</div><div class="l">نسبة القبول (${won.length} من ${decided})</div></div>
      <div class="stat"><span class="ic" style="color:#eab308"><i data-lucide="gauge"></i></span><div class="v">${avgR}%</div><div class="l">متوسط سعرك من المستهدف</div></div>
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="trending-down"></i></span><div class="v">${under}</div><div class="l">عروض تحت حدّك الأدنى</div></div>
    </div>
    ${decided>=5&&won.length/decided>.85?`<div class="prc-verdict warn">تقريباً كل عروضك تُقبل — هذه علامة أن أسعارك منخفضة. جرّب رفع المستهدف ١٠–١٥٪ في العروض القادمة.</div>`:''}
    ${topR?`<div class="prc-verdict">أكثر سبب للرفض: <b>${esc(topR[0])}</b> (${topR[1]})</div>`:''}
    <div class="card" style="overflow-x:auto"><table><thead><tr><th>التاريخ</th><th>العميل</th><th>الخدمات</th><th>السعر المقدَّم</th><th>النتيجة</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function prcMark(id,o){
  const e=pr().log.find(x=>x.id===id);if(!e)return;
  if(o==='lost'){
    const pick=prompt('ليش انرفض؟ اكتب رقم السبب:\n'+PRC_REASONS.map((r,i)=>(i+1)+') '+r).join('\n'),'1');
    if(pick===null)return;e.reason=PRC_REASONS[(Number(pick)||6)-1]||String(pick);
  }else e.reason='';
  e.outcome=o;save();renderPricing();
}

/* ═══════════ الأساس والسياسة ═══════════ */
function prcBaseHTML(){
  const P=pr(),b=P.base,pol=P.policy,hr=prcHourly();
  const num=(path,val,lbl,hint)=>`<div class="field"><label>${lbl}</label><input type="number" min="0" value="${val}" onchange="prcBase('${path}',this.value)">${hint?`<div style="font-size:12px;color:var(--muted);margin-top:4px">${hint}</div>`:''}</div>`;
  const fac=g=>pol.factors[g].map((f,i)=>`<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><span style="flex:1;font-size:13.5px">${esc(f.l)}</span><input type="number" step=".05" value="${f.v}" onchange="prcFac('${g}',${i},this.value)" style="width:90px"></div>`).join('');
  return `<div class="grid">
    <div class="card"><h3><i data-lucide="wallet"></i> سعر وقتك</h3>
      ${num('base.monthly',b.monthly,'الدخل الشهري الذي تريده (صافي لك)')}
      ${num('base.fixed',b.fixed,'المصاريف الثابتة شهرياً','اشتراكات، إيجار استديو، صيانة معدات، اتصالات…')}
      ${num('base.days',b.days,'أيام العمل المفوترة في الشهر','الأيام التي تشتغل فيها على عملاء فعلاً — لا التواصل والتسويق.')}
      ${num('base.hpd',b.hpd,'ساعات الإنتاج الفعلي في اليوم')}
      <div class="prc-verdict good">سعر يومك <b>${money(hr*Number(b.hpd||0))}</b> · سعر ساعتك <b>${money(hr)}</b></div></div>
    <div class="card"><h3><i data-lucide="shield-check"></i> السياسة الموحّدة</h3>
      ${num('policy.minOrder',pol.minOrder,'الحدّ الأدنى لأي طلب')}
      ${num('policy.fullUpTo',pol.fullUpTo,'حتى هذا المبلغ: الدفع كاملاً قبل البدء')}
      ${num('policy.depositPct',pol.depositPct,'العربون % لما فوقه')}
      ${num('policy.openPct',pol.openPct,'هامش الافتتاحي فوق المستهدف %')}
      ${num('policy.extrasMarkup',pol.extrasMarkup,'هامش إدارة المصاريف الخارجيّة %')}
      <label style="display:flex;gap:8px;align-items:center;font-size:13px;cursor:pointer"><input type="checkbox" style="width:auto" ${pol.enforceCost?'checked':''} onchange="prcBase('policy.enforceCost',this.checked)"> ارفع الحدّ الأدنى تلقائياً إذا كان أقل من تكلفة وقتي</label>
      <div style="font-size:12px;color:var(--muted);margin-top:10px">الجهات الحكوميّة دائماً: حسب أمر الشراء. التعديلات ومدّة التسليم من قالب الشروط (جولتان، ٣ أيام).</div></div>
    <div class="card"><h3><i data-lucide="building-2"></i> نوع العميل (مضاعف)</h3>${fac('tier')}</div>
    <div class="card"><h3><i data-lucide="megaphone"></i> الاستخدام (مضاعف)</h3>${fac('use')}<h3 style="margin-top:12px"><i data-lucide="timer"></i> الاستعجال (مضاعف)</h3>${fac('urg')}</div>
    <div class="card"><h3><i data-lucide="map-pin"></i> مكان التصوير (ريال يُضاف)</h3>${fac('loc')}<h3 style="margin-top:12px"><i data-lucide="heart-handshake"></i> العلاقة (خصم ظاهر %)</h3>${fac('rel')}</div>
  </div>`;
}
function prcBase(path,v){const [a,k]=path.split('.');const P=pr();P[a][k]=typeof v==='boolean'?v:Number(v)||0;if(a==='base')P.base.set=true;save();renderPricing()}
function prcFac(g,i,v){const f=pr().policy.factors[g][i];if(f){f.v=Number(v)||0;save();renderPricing()}}
