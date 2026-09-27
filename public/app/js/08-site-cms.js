/*
 * 08-site-cms.js — إدارة الموقع: الأعمال والخدمات ومحرّر المحتوى والرفع
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== معرض الأعمال + الشعارات + الخدمات + إعدادات الموقع (يُدار داخلياً ويُنشر على الموقع العام) ===== */
let SITEWORKS=null, SITEBRANDS=null, SITESERVICES=null, SITESETTINGS=null, SITEDRAFTS=null, SW_LOADING=false, SW_ERR=null, SW_TAB='content';
const SW_CATS=['أعمال سينمائية','تغطية فعاليات','إعلانات منتجات','مقابلات الشارع','تصميم جرافيك','هوية بصرية'];
const SW_AUD=[['companies','الشركات والجهات'],['stores','المتاجر الإلكترونية'],['','عمل خاص (بدون قسم)']];
const SEED_WORKS=[
 {id:'healthon-open',client:'جامعة الملك سعود — هاكاثون هيلثون',title:'هاكاثون هيلثون — الفيلم الافتتاحي',category:'تغطية فعاليات',audience:'companies',roles:['إخراج','تصوير','مونتاج','موشن'],description:'الفيلم الافتتاحي لهاكاثون هيلثون بجامعة الملك سعود، مع هوية بصرية متحركة تفتح الحدث — من الفكرة حتى التسليم.',video_url:'https://youtu.be/WL-GJ4ZT7Cg',videos:[],bts:null,logo:null,thumb:'https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/هيلثون.jpg',featured:true,sort:10},
 {id:'healthon-close',client:'جامعة الملك سعود — هاكاثون هيلثون',title:'هاكاثون هيلثون — الفيلم الختامي',category:'تغطية فعاليات',audience:'companies',roles:['إخراج','تصوير','مونتاج'],description:'الفيلم الختامي الذي يلخّص إنجاز الهاكاثون، إضافة لبوسترات وبرومو ولقطات مشاركين.',video_url:'https://youtu.be/7Vmq3eTWQwc',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:20},
 {id:'rinad-tasis',client:'ريناد المجد',title:'فيلم يوم التأسيس',category:'أعمال سينمائية',audience:'companies',roles:['كتابة النص','تصوير درون','تمثيل','تعليق صوتي','مونتاج'],description:'فيلم سينمائي ليوم التأسيس بلقطات درون وتعليق صوتي ونص كامل — صنعته من الفكرة حتى التسليم، وكنت فيه الممثل والمعلّق والكاتب والمنتج.',video_url:'https://www.youtube.com/watch?v=EOOlRJgeT6Y',videos:[],bts:null,logo:'/LOGO_RMG.png',thumb:'https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/يوم%20التأسيس.jpg',featured:true,sort:30},
 {id:'feeh-breaking-bad',client:'متجر فيه ستور (feeh store)',title:'إعلان تمثيلي — على طريقة بريكنج باد',category:'أعمال سينمائية',audience:'companies',roles:['فكرة','إخراج','تمثيل (بطولة)','مونتاج'],description:'إعلان درامي لمتجر تجميعات الكمبيوتر بأسلوب «بريكنج باد»: شخصية رئيسية تبيع الأجهزة من سيارتها وتُتمّ صفقاتها — كتبت الفكرة، وأخرجت، وكنت الممثل الأساسي.',video_url:'https://www.youtube.com/watch?v=HTojPu3baG8',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:40},
 {id:'wedding-film',client:'مناسبة خاصة',title:'فيلم زواج',category:'أعمال سينمائية',audience:null,roles:['تصوير','مونتاج'],description:'توثيق سينمائي لمناسبة زواج — تصوير ومونتاج يحفظ لحظات اليوم بأسلوب راقٍ.',video_url:'https://youtu.be/IIArrpuGomk',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:50},
 {id:'feeh-campaign',client:'متجر فيه ستور (feeh store)',title:'الفيديو الرئيسي لحملة الموقع الجديد',category:'إعلانات منتجات',audience:'companies',roles:['فكرة','إخراج','تصوير','مونتاج'],description:'الفيديو الرئيسي لإطلاق الموقع الجديد، يبرز ميزة «اجمع جهازك بنفسك» ضمن حملة متكاملة.',video_url:'https://www.youtube.com/watch?v=Bg_9L6TKduc',videos:[],bts:null,logo:null,thumb:null,featured:true,sort:60},
 {id:'tad-main',client:'متجر TAD',title:'حملة شاحن السفر — الفيديو الرئيسي',category:'إعلانات منتجات',audience:'stores',roles:['فكرة','نص','تصوير','مونتاج'],description:'الفيديو الرئيسي لحملة شاحن السفر — مقطع مصوّر من المغرب استُخدم في التسويق.',video_url:'https://youtu.be/GcA8sjlQduI',videos:[],bts:null,logo:null,thumb:'https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/TAD.jpg',featured:false,sort:70},
 {id:'tad-short-1',client:'متجر TAD',title:'شاحن السفر — مقطع قصير',category:'إعلانات منتجات',audience:'stores',roles:['فكرة','تصوير','مونتاج'],description:'مقطع قصير تعريفي بمنتج شاحن السفر، جاهز للنشر على المنصات.',video_url:'https://www.youtube.com/shorts/hzGpY3rvj0w',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:80},
 {id:'tad-short-2',client:'متجر TAD',title:'شاحن السفر — مقطع قصير ٢',category:'إعلانات منتجات',audience:'stores',roles:['فكرة','تصوير','مونتاج'],description:'مقطع قصير ثانٍ ضمن حملة شاحن السفر، بزاوية مختلفة.',video_url:'https://www.youtube.com/shorts/VG-Wk9eKcMo',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:90},
 {id:'tad-bts',client:'متجر TAD',title:'شاحن السفر — كواليس التصوير',category:'إعلانات منتجات',audience:'stores',roles:['تصوير','توثيق'],description:'كواليس تصوير حملة شاحن السفر من المغرب — لقطات من خلف الكاميرا.',video_url:'https://youtu.be/2Og0FzpWbX4',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:100},
 {id:'blvd-1',client:'متجر فيه ستور (feeh store)',title:'تغطية موسم الرياضات الإلكترونية (EWC)',category:'مقابلات الشارع',audience:'stores',roles:['فكرة','تقديم','تصوير','مونتاج'],description:'تغطية لموسم الرياضات الإلكترونية من بوليفارد الرياض — تقديم وتصوير ومونتاج.',video_url:'https://www.youtube.com/shorts/y9EnZUF3BH8',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:110},
 {id:'blvd-2',client:'متجر فيه ستور (feeh store)',title:'البوليفارد — مقابلات شارع',category:'مقابلات الشارع',audience:'stores',roles:['تقديم','تصوير','مونتاج'],description:'مقابلات شارع مع الزوّار في موسم الرياضات الإلكترونية.',video_url:'https://www.youtube.com/shorts/5g_2DYu7Gu8',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:120},
 {id:'blvd-3',client:'متجر فيه ستور (feeh store)',title:'البوليفارد — لقاء لينوفو',category:'مقابلات الشارع',audience:'stores',roles:['تقديم','تصوير','مونتاج'],description:'مقطع مع لينوفو ضمن تغطية البوليفارد.',video_url:'https://www.youtube.com/shorts/8I_ULf59_K8',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:130},
 {id:'blvd-4',client:'متجر فيه ستور (feeh store)',title:'البوليفارد — فلوق الجولة',category:'مقابلات الشارع',audience:'stores',roles:['تقديم','تصوير','مونتاج'],description:'فلوق جولة في الفعاليات، ولقاء مع صانع المحتوى التقني فيصل السيف.',video_url:'https://www.youtube.com/shorts/O-6Qm1vUET0',videos:[],bts:null,logo:null,thumb:null,featured:false,sort:140}
];
const SEED_BRANDS=[
 {id:'br_rmg',name:'ريناد المجد',logo:'/LOGO_RMG.png',sort:10},
 {id:'br_tga',name:'الهيئة العامة للنقل',logo:'/tga.png',sort:20},
 {id:'br_ejada',name:'إجادة التقنية',logo:'/ejada.png',sort:30},
 {id:'br_feeh',name:'فيه ستور',logo:'/feeh-store.webp',sort:40},
 {id:'br_kwentra',name:'وكونترا',logo:'/LOGO_kwentra.png',sort:50},
 {id:'br_khair',name:'جمعية خير لتحفيظ القرآن',logo:'/khair-quran.png',sort:60},
 {id:'br_drift',name:'درفت تايم',logo:'/LOGO_3_drift_time.png',sort:70}
];
async function swLoad(force){
  if(SW_LOADING)return;SW_LOADING=true;SW_ERR=null;if(force)renderSiteWorks();
  try{
    const w=await sb.from('site_works').select('*').order('sort',{ascending:true});if(w.error)throw w.error;SITEWORKS=w.data||[];
    const b=await sb.from('site_brands').select('*').order('sort',{ascending:true});if(b.error)throw b.error;SITEBRANDS=b.data||[];
    try{const s=await sb.from('site_services').select('*').order('sort',{ascending:true});SITESERVICES=s.error?[]:(s.data||[]);}catch(_){SITESERVICES=[]}
    try{const st=await sb.from('site_settings').select('*');SITESETTINGS={};SITEDRAFTS={};(st.data||[]).forEach(r=>{SITESETTINGS[r.key]=r.value;if(r.draft!=null)SITEDRAFTS[r.key]=r.draft});}catch(_){SITESETTINGS={};SITEDRAFTS={}}
  }catch(e){SW_ERR=(e&&e.message)||'تعذّر الاتصال';}
  SW_LOADING=false;if(CUR==='sitework')renderSiteWorks();
}
function swThumb(w){if(w.thumb)return w.thumb;if(w.images&&w.images.length)return w.images[0];const u=w.video_url||'';const m=u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);return m?('https://img.youtube.com/vi/'+m[1]+'/hqdefault.jpg'):''}
/* ═════════════════════════════════════════════════════════════════════════
   بانرات حروف ودروس — لافتات واجهة الموقع (huroofduroos.com)
   ─────────────────────────────────────────────────────────────────────────
   لا تمرّ ببيانات هذا الموقع: تُرفع مباشرةً إلى خادم حروف ودروس عبر ترويسة
   `x-system-token` (رمز جلسة Supabase نفسه، تتحقّق منه بوّابة المالك هناك).
   أربع خانات: لغتان × جهازان، كلٌّ بمقاس إطارها في فيغما.
   ═════════════════════════════════════════════════════════════════════════ */
const HUROOF_API_BASE='https://huroofduroos.com';
const BANNER_SLOTS=[
  {slot:'ar-windows',label:'عربي — ويندوز (كمبيوتر)',dims:'3168 × 1344',ar:2.357},
  {slot:'en-windows',label:'إنجليزي — ويندوز (كمبيوتر)',dims:'3168 × 1344',ar:2.357},
  {slot:'ar-phone',label:'عربي — جوال',dims:'1801 × 1352',ar:1.332},
  {slot:'en-phone',label:'إنجليزي — جوال',dims:'1801 × 1352',ar:1.332},
];
let BANNERS=null,BANNERS_ERR=null,BANNERS_LOADING=false;
const BANNER_PENDING={};

async function hbToken(){try{const {data}=await sb.auth.getSession();return (data&&data.session&&data.session.access_token)||null}catch(_){return null}}
async function hbApi(path,init){
  const token=await hbToken();
  if(!token)throw new Error('انتهت الجلسة — سجّل الدخول من جديد');
  const res=await fetch(HUROOF_API_BASE+'/api/'+path,{
    method:(init&&init.method)||'GET',
    headers:{'x-system-token':token,'Content-Type':'application/json'},
    body:(init&&init.body!==undefined)?JSON.stringify(init.body):undefined,
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(body.error||('تعذّر التنفيذ ('+res.status+')'));
  return body;
}
async function bannersLoad(force){
  if(BANNERS_LOADING)return;BANNERS_LOADING=true;BANNERS_ERR=null;if(force)bannersRefreshBody();
  try{const r=await hbApi('admin/banners');BANNERS=r.banners||[];}
  catch(e){BANNERS_ERR=(e&&e.message)||'تعذّر الاتصال';}
  BANNERS_LOADING=false;bannersRefreshBody();
}
function bannersRefreshBody(){
  const body=document.getElementById('hrBody');
  if(body&&CUR==='huroof'&&HR_TAB==='banners'){body.innerHTML=bannersBodyHTML();refreshIcons();}
}
function bannersBodyHTML(){
  if(BANNERS===null&&!BANNERS_ERR)return `<p style="color:var(--muted)">…جارٍ التحميل</p>`;
  if(BANNERS_ERR)return `<div class="card"><div class="badge-note"><i data-lucide="alert-triangle"></i> <div><b>تعذّر الاتصال بخادم حروف ودروس.</b> تأكّد أنّ الخادم مُحدَّث وأنّ بريدك ضمن <b>EXTERNAL_ADMIN_EMAILS</b>.<div style="margin-top:6px;color:var(--muted);font-size:12px">التفاصيل: ${esc(BANNERS_ERR)}</div></div></div><div style="margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="bannersLoad(true)"><i data-lucide="refresh-cw"></i> إعادة المحاولة</button></div></div>`;
  const list=BANNERS||[];
  const head=`<div class="badge-note" style="margin-bottom:16px"><i data-lucide="globe"></i> <div>تظهر هذه البانرات <b>أوّل الموقع بعرض الصفحة كاملاً</b>، وتتبدّل تلقائياً إن كانت أكثر من واحدة. <b>البانر الواحد = رابطٌ واحد + أربع صور</b> (عربي/إنجليزي × كمبيوتر/جوال) صمّمها بنفس المقاسات لتظهر باحترافٍ في كل حجم. رتّبها بالأسهم، وفعّل «إظهار» كي تظهر. يبين الأثر خلال دقيقة.</div></div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn btn-gold" onclick="bannerAdd()"><i data-lucide="plus"></i> بانر جديد</button>
      <button class="btn btn-ghost" onclick="bannersLoad(true)"><i data-lucide="refresh-cw"></i> تحديث</button>
    </div>`;
  if(!list.length)return head+`<div class="card" style="text-align:center;color:var(--muted);padding:34px"><i data-lucide="image-off" style="width:34px;height:34px"></i><div style="margin-top:10px">لا توجد بانرات بعد. اضغط «بانر جديد» لإضافة أوّل بانر.</div></div>`;
  return head+list.map((b,i)=>bannerCardHTML(b,i,list.length)).join('');
}
function bannerCardHTML(b,i,total){
  const activeCount=BANNER_SLOTS.filter(d=>b.images&&b.images[d.slot]).length;
  return `<div class="card" style="margin-bottom:18px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-weight:900;font-size:16px"><i data-lucide="image" style="width:18px;height:18px;vertical-align:-3px"></i> بانر ${i+1}</div>
        <span class="pill${b.active?' done':''}" style="font-size:11px">${b.active?'ظاهر':'مخفي'}</span>
        <span style="font-size:11px;color:var(--muted)">${activeCount}/4 صور</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="bannerMove('${b.id}',-1)" ${i===0?'disabled':''} title="تحريك لأعلى"><i data-lucide="arrow-up"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="bannerMove('${b.id}',1)" ${i===total-1?'disabled':''} title="تحريك لأسفل"><i data-lucide="arrow-down"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="bannerDelete('${b.id}')" title="حذف البانر"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
    <label style="font-size:12px;color:var(--muted)">الرابط عند الضغط — واحدٌ لكامل البانر (اختياري)</label>
    <input id="bl_${b.id}" value="${esc(b.linkUrl||'')}" placeholder="https://…" dir="ltr" class="field" style="text-align:left;margin-bottom:10px">
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:14px"><input type="checkbox" id="ba_${b.id}" ${b.active?'checked':''} style="width:auto"> إظهار هذا البانر في الموقع</label>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px">${BANNER_SLOTS.map(d=>bannerSlotCellHTML(b,d)).join('')}</div>
    <div id="bs_${b.id}" style="font-size:12px;color:var(--muted);min-height:16px;margin-top:10px"></div>
    <button class="btn btn-gold" style="margin-top:8px" onclick="bannerCardSave('${b.id}')"><i data-lucide="save"></i> حفظ البانر</button>
  </div>`;
}
function bannerSlotCellHTML(b,def){
  const url=b.images&&b.images[def.slot]?(HUROOF_API_BASE+b.images[def.slot]):'';
  return `<div style="display:flex;flex-direction:column;gap:6px">
    <div style="font-weight:700;font-size:13px">${esc(def.label)}</div>
    <div style="font-size:11px;color:var(--muted)">${def.dims} بكسل</div>
    <div style="position:relative;width:100%;aspect-ratio:${def.ar};background:#0006;border-radius:10px;overflow:hidden;border:1px solid #ffffff14">
      <img id="bp_${b.id}_${def.slot}" src="${esc(url)}" style="width:100%;height:100%;object-fit:cover;display:${url?'block':'none'}">
      <div id="bph_${b.id}_${def.slot}" style="display:${url?'none':'grid'};place-items:center;height:100%;color:var(--muted);font-size:12px;gap:4px"><i data-lucide="image-off"></i> لا صورة</div>
    </div>
    <input type="file" accept="image/png,image/jpeg,image/webp" id="bf_${b.id}_${def.slot}" style="display:none" onchange="bannerImgPick('${b.id}','${def.slot}',event)">
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('bf_${b.id}_${def.slot}').click()"><i data-lucide="upload"></i> اختيار</button>
      ${url?`<button class="btn btn-ghost btn-sm" onclick="bannerRemoveImg('${b.id}','${def.slot}')"><i data-lucide="x"></i> إزالة</button>`:''}
    </div>
  </div>`;
}
async function bannerAdd(){
  try{await hbApi('admin/banners',{method:'POST'});bannersLoad(true);}
  catch(e){alert('تعذّر إنشاء البانر: '+((e&&e.message)||e))}
}
function bannerImgPick(id,slot,ev){
  const f=ev.target.files[0];ev.target.value='';if(!f)return;
  const st=document.getElementById('bs_'+id);
  if(f.size>15*1024*1024){alert('الصورة كبيرة جداً (الحد ١٥MB). صدّرها بجودةٍ أخفّ.');return}
  if(st)st.textContent='جارٍ معالجة الصورة…';
  compressImage(f,3200,0.86,(blob)=>{
    if(!blob){if(st)st.textContent='';alert('تعذّر معالجة الصورة');return}
    const rd=new FileReader();
    rd.onload=()=>{
      const b64=String(rd.result).split(',')[1]||'';
      BANNER_PENDING[id+':'+slot]={base64:b64,contentType:blob.type||'image/webp'};
      const pv=document.getElementById('bp_'+id+'_'+slot);if(pv){pv.src=rd.result;pv.style.display='block'}
      const ph=document.getElementById('bph_'+id+'_'+slot);if(ph)ph.style.display='none';
      if(st)st.textContent='صورة جاهزة ('+Math.round(blob.size/1024)+'KB) — اضغط «حفظ البانر» لنشرها.';
    };
    rd.onerror=()=>{if(st)st.textContent='';alert('تعذّر قراءة الصورة')};
    rd.readAsDataURL(blob);
  });
}
async function bannerRemoveImg(id,slot){
  const key=id+':'+slot;
  if(BANNER_PENDING[key]){delete BANNER_PENDING[key];const pv=document.getElementById('bp_'+id+'_'+slot);if(pv){pv.src='';pv.style.display='none'}const ph=document.getElementById('bph_'+id+'_'+slot);if(ph)ph.style.display='grid';const st=document.getElementById('bs_'+id);if(st)st.textContent='';return}
  if(!confirm('إزالة هذه الصورة من البانر؟'))return;
  try{await hbApi('admin/banners/'+id,{method:'POST',body:{removeSlot:slot}});bannersLoad(true);}
  catch(e){alert('تعذّر الإزالة: '+((e&&e.message)||e))}
}
async function bannerCardSave(id){
  const st=document.getElementById('bs_'+id);
  const le=document.getElementById('bl_'+id),ae=document.getElementById('ba_'+id);
  const linkUrl=le?le.value.trim():'';const active=ae?ae.checked:false;
  if(st)st.textContent='جارٍ الحفظ…';
  try{
    for(const def of BANNER_SLOTS){
      const pend=BANNER_PENDING[id+':'+def.slot];
      if(pend){await hbApi('admin/banners/'+id,{method:'POST',body:{slot:def.slot,dataBase64:pend.base64,contentType:pend.contentType}});delete BANNER_PENDING[id+':'+def.slot];}
    }
    await hbApi('admin/banners/'+id,{method:'POST',body:{linkUrl,active}});
    if(st)st.textContent='تم الحفظ ✓';
    bannersLoad(true);
  }catch(e){if(st)st.textContent='';alert('تعذّر الحفظ: '+((e&&e.message)||e))}
}
async function bannerMove(id,dir){
  const list=BANNERS||[];const i=list.findIndex(x=>x.id===id);if(i<0)return;
  const j=i+dir;if(j<0||j>=list.length)return;
  const ids=list.map(x=>x.id);const t=ids[i];ids[i]=ids[j];ids[j]=t;
  const tmp=list[i];list[i]=list[j];list[j]=tmp;bannersRefreshBody();
  try{await hbApi('admin/banners/reorder',{method:'POST',body:{ids}});}
  catch(e){alert('تعذّر إعادة الترتيب: '+((e&&e.message)||e));bannersLoad(true)}
}
async function bannerDelete(id){
  if(!confirm('حذف هذا البانر بالكامل (صوره الأربع)؟ لا يمكن التراجع.'))return;
  try{await hbApi('admin/banners/'+id,{method:'DELETE'});Object.keys(BANNER_PENDING).forEach(k=>{if(k.indexOf(id+':')===0)delete BANNER_PENDING[k]});bannersLoad(true)}
  catch(e){alert('تعذّر الحذف: '+((e&&e.message)||e))}
}

function renderSiteWorks(){
  const main=document.getElementById('main');
  if(SITEWORKS===null){if(!SW_LOADING&&!SW_ERR)swLoad();if(!SW_ERR){main.innerHTML=`<div class="page-head"><h1><i data-lucide="film"></i> الأعمال (الموقع)</h1></div><p style="color:var(--muted)">…جارٍ التحميل</p>`;applyWallpaper();refreshIcons();return}}
  if(SW_ERR){main.innerHTML=`<div class="page-head"><h1><i data-lucide="film"></i> الأعمال (الموقع)</h1><button class="btn btn-ghost" onclick="swLoad(true)"><i data-lucide="refresh-cw"></i> إعادة المحاولة</button></div>
    <div class="card"><div class="badge-note"><i data-lucide="database"></i> <div><b>لتفعيل إدارة الأعمال:</b> افتح Supabase ← SQL Editor ← New query، وشغّل ملف <b>supabase/site_works.sql</b> مرة واحدة (ينشئ جدولَي الأعمال والشعارات). ثم اضغط «إعادة المحاولة».<div style="margin-top:6px;color:var(--muted);font-size:12px">التفاصيل: ${esc(SW_ERR)}</div></div></div></div>`;applyWallpaper();refreshIcons();return}
  const works=SITEWORKS||[],brands=SITEBRANDS||[];
  main.innerHTML=`
    ${swCssHTML()}
    <div class="page-head"><h1><i data-lucide="globe"></i> الموقع الإلكتروني</h1></div>
    ${swBarHTML()}
    <div class="sw-tabs">${SW_TABS.map(t=>`<button class="sw-tab${SW_TAB===t[0]?' on':''}" onclick="swGo('${t[0]}')"><i data-lucide="${t[2]}"></i>${t[1]}</button>`).join('')}</div>
    ${SW_TAB==='content'?cmsTabHTML():''}
    ${SW_TAB==='preview'?swPreviewHTML():''}
    ${SW_TAB!=='works'?'':`
    <div class="page-head"><h2 style="margin:0;font-size:19px"><i data-lucide="film"></i> الأعمال — تظهر في قسم «الأعمال» بالموقع مع فلتر تصنيف تلقائي</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="swLoad(true)" title="إعادة تحميل من قاعدة البيانات"><i data-lucide="refresh-cw"></i> تحديث</button>
        ${works.length?'':`<button class="btn btn-ghost" onclick="swImport('works')"><i data-lucide="download"></i> استيراد الأعمال الحالية</button>`}
        <button class="btn btn-gold" onclick="swWorkModal()"><i data-lucide="plus"></i> عمل جديد</button></div></div>
    <div class="badge-note" style="margin-bottom:16px"><i data-lucide="globe"></i> <div>الموقع الجديد يعرض <b>كل الأعمال</b> مع فلتر تصنيف مشتقّ تلقائياً من التصنيفات المسجّلة هنا، ويقدّم الأعمال المميّزة (<i class="inl" data-lucide="star"></i>) أولاً. الصورة المصغّرة تُشتق من رابط يوتيوب ما لم ترفع صورة. حقل «القسم» (شركات/متاجر) صار اختياري ولا يؤثّر على مكان الظهور.</div></div>
    ${(function(){
      // مجموعات بالتصنيف حسب ترتيب أوّل ظهور
      const cats=[];const byCat={};works.forEach(w=>{const c=w.category||'بدون تصنيف';if(!(c in byCat)){byCat[c]=[];cats.push(c)}byCat[c].push(w);});
      const featCount=works.filter(w=>w.featured).length;
      const kpis=`<div class="stats" style="margin-bottom:16px">
        <div class="stat"><span class="ic"><i data-lucide="film"></i></span><div class="v">${works.length}</div><div class="l">إجمالي الأعمال</div></div>
        <div class="stat"><span class="ic"><i data-lucide="star"></i></span><div class="v">${featCount}</div><div class="l">مميّز (يظهر أولاً)</div></div>
        <div class="stat"><span class="ic"><i data-lucide="tag"></i></span><div class="v">${cats.length}</div><div class="l">تصنيفات ظاهرة كفلاتر</div></div>
      </div>`;
      if(!works.length)return kpis+`<div class="card"><p style="color:var(--muted)">لا أعمال بعد. أضف عملاً جديداً أو استورد الأعمال الحالية.</p></div>`;
      const catBlocks=cats.map(c=>{const items=byCat[c].slice().sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));return `
        <div class="mo-block">
          <div class="mo-head"><div class="mo-title"><i data-lucide="tag"></i> ${esc(c)} <span class="mo-count">· ${items.length}</span></div><div class="mo-sum"><span class="chip">${items.filter(x=>x.featured).length} مميّز</span></div></div>
          <div class="grid" style="padding:14px;border:1px solid var(--line);border-top:none;border-radius:0 0 12px 12px">
          ${items.map(w=>{const th=swThumb(w);return `
            <div class="card" style="padding:0;overflow:hidden">
              <div style="position:relative;aspect-ratio:16/9;background:#0006">${th?`<img src="${esc(th)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`:`<div style="display:grid;place-items:center;height:100%;color:var(--muted)"><i data-lucide="video-off"></i></div>`}
                ${w.featured?`<span class="pill done" style="position:absolute;top:8px;inset-inline-start:8px"><i class="inl" data-lucide="star"></i> مميّز</span>`:''}
                ${w.logo?`<img src="${esc(w.logo)}" style="position:absolute;bottom:8px;inset-inline-end:8px;height:32px;background:#fff;border-radius:7px;padding:3px">`:''}
              </div>
              <div style="padding:13px">
                <div style="font-weight:800">${esc(w.title||'')}</div>
                <div style="font-size:12px;color:var(--muted);margin:3px 0 9px">${esc(w.client||'')}${w.kind==='gallery'?' · <span style="color:var(--gold2)">معرض</span>':''}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button class="btn btn-ghost btn-sm" onclick="swWorkModal('${w.id}')"><i data-lucide="pencil"></i> تعديل</button>
                  <button class="btn btn-ghost btn-sm" onclick="swToggleFeatured('${w.id}')" title="${w.featured?'إلغاء التمييز':'اجعله مميّزاً'}"><i data-lucide="star"></i></button>
                  ${w.video_url?`<a class="btn btn-ghost btn-sm" href="${esc(w.video_url)}" target="_blank" rel="noopener"><i data-lucide="play"></i> معاينة</a>`:''}
                  <a class="btn btn-ghost btn-sm" href="/works/${esc(w.id)}" target="_blank" rel="noopener" title="اذهب لصفحة العمل على الموقع"><i data-lucide="external-link"></i></a>
                  <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="swDelWork('${w.id}')"><i data-lucide="trash-2"></i></button>
                </div>
              </div></div>`}).join('')}
          </div>
        </div>`}).join('');
      return kpis+catBlocks;
    })()}
    <div class="page-head" style="margin-top:30px"><h2 style="margin:0;font-size:19px"><i data-lucide="badge-check"></i> شعارات الشركات (شريط «موثوق من»)</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${brands.length?'':`<button class="btn btn-ghost" onclick="swImport('brands')"><i data-lucide="download"></i> استيراد الشعارات الحالية</button>`}
        <button class="btn btn-gold" onclick="swBrandModal()"><i data-lucide="plus"></i> شعار جديد</button></div></div>
    <div class="grid">
    ${brands.length?brands.map(b=>`<div class="card" style="display:flex;align-items:center;gap:12px">
      <img src="${esc(b.logo)}" loading="lazy" style="height:40px;max-width:110px;object-fit:contain;background:#fff;border-radius:7px;padding:4px">
      <div style="flex:1;font-weight:700">${esc(b.name||'')}</div>
      <button class="btn btn-ghost btn-sm" onclick="swBrandModal('${b.id}')"><i data-lucide="pencil"></i></button>
      <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="swDelBrand('${b.id}')"><i data-lucide="trash-2"></i></button>
    </div>`).join(''):`<div class="card"><p style="color:var(--muted)">لا شعارات بعد.</p></div>`}
    </div>`}
    ${SW_TAB!=='services'?'':`
    <div class="page-head"><h2 style="margin:0;font-size:19px"><i data-lucide="layout-grid"></i> خدمات الموقع (تبويبات قسم «خدماتي»)</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(SITESERVICES&&SITESERVICES.length)?'':`<button class="btn btn-ghost" onclick="swImportServices()"><i data-lucide="download"></i> استيراد الخدمات الافتراضية</button>`}
        <button class="btn btn-gold" onclick="swServiceModal()"><i data-lucide="plus"></i> خدمة جديدة</button></div></div>
    <div class="badge-note" style="margin-bottom:16px"><i data-lucide="info"></i> <div>هذه التبويبات تظهر في قسم «خدماتي» بالموقع: اسم التبويب، عنوان كبير، وصف، وصورة مربعة. لو القائمة فارغة يستخدم الموقع النسخة الافتراضية المدمجة.</div></div>
    <div class="grid">
    ${(SITESERVICES||[]).length?(SITESERVICES||[]).map(s=>`<div class="card" style="display:flex;align-items:center;gap:12px">
      ${s.image?`<img src="${esc(s.image)}" loading="lazy" style="width:52px;height:52px;object-fit:cover;border-radius:10px">`:`<div style="width:52px;height:52px;border-radius:10px;background:#0006;display:grid;place-items:center;color:var(--muted)"><i data-lucide="image"></i></div>`}
      <div style="flex:1;min-width:0"><div style="font-weight:800">${esc(s.title||'')}</div><div style="font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.headline||'')}</div></div>
      <button class="btn btn-ghost btn-sm" onclick="swServiceModal('${s.id}')"><i data-lucide="pencil"></i></button>
      <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="swDelService('${s.id}')"><i data-lucide="trash-2"></i></button>
    </div>`).join(''):`<div class="card"><p style="color:var(--muted)">لا خدمات مخصّصة بعد — الموقع يعرض الافتراضية.</p></div>`}
    </div>`}
    ${SW_TAB!=='look'?'':`
    <div class="page-head"><h2 style="margin:0;font-size:19px"><i data-lucide="settings-2"></i> إعدادات واجهة الموقع</h2></div>
    <div class="badge-note" style="margin-bottom:16px"><i data-lucide="zap"></i> <div>هذا التبويب يُحفظ <b>وينشر مباشرة</b> على الموقع (صور الواجهة وروابط التواصل) — بدون مسودة.</div></div>
    <div class="card">
      <div class="row2">
        <div class="field"><label>صورة الوجه الدائرية (واجهة الموقع)</label>
          <input type="file" accept="image/*" id="st_photo_file" onchange="swUploadSetting('st_photo_file','hero_photo','st_photo_pv')">
          <img id="st_photo_pv" src="${esc((SITESETTINGS&&SITESETTINGS.hero_photo&&SITESETTINGS.hero_photo.url)||'')}" style="${(SITESETTINGS&&SITESETTINGS.hero_photo&&SITESETTINGS.hero_photo.url)?'':'display:none;'}width:72px;height:72px;object-fit:cover;border-radius:50%;margin-top:8px;border:2px solid var(--gold,#e7b24c)">
          <div style="font-size:12px;color:var(--muted);margin-top:4px">فارغة = يستخدم الموقع الصورة الافتراضية المدمجة.</div>
        </div>
        <div class="field"><label>صورة خلفية الواجهة (Artboard)</label>
          <input type="file" accept="image/*" id="st_bg_file" onchange="swUploadSetting('st_bg_file','hero_bg','st_bg_pv')">
          <img id="st_bg_pv" src="${esc((SITESETTINGS&&SITESETTINGS.hero_bg&&SITESETTINGS.hero_bg.url)||'')}" style="${(SITESETTINGS&&SITESETTINGS.hero_bg&&SITESETTINGS.hero_bg.url)?'':'display:none;'}max-height:72px;border-radius:10px;margin-top:8px">
          <div style="font-size:12px;color:var(--muted);margin-top:4px">تظهر خلف الواجهة بشفافية أنيقة.</div>
        </div>
      </div>
      <div style="font-weight:800;margin:14px 0 8px"><i class="inl" data-lucide="share-2"></i> روابط مواقع التواصل (تظهر كأيقونات رسمية في الموقع)</div>
      <div class="row2">
        <div class="field"><label>تيك توك</label><input id="st_tiktok" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.tiktok)||'')}" placeholder="https://www.tiktok.com/@..."></div>
        <div class="field"><label>يوتيوب</label><input id="st_youtube" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.youtube)||'')}" placeholder="https://www.youtube.com/@..."></div>
      </div>
      <div class="row2">
        <div class="field"><label>إنستقرام</label><input id="st_instagram" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.instagram)||'')}" placeholder="https://www.instagram.com/..."></div>
        <div class="field"><label>إكس (تويتر)</label><input id="st_x" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.x)||'')}" placeholder="https://x.com/..."></div>
      </div>
      <div class="row2">
        <div class="field"><label>لينكدإن</label><input id="st_linkedin" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.linkedin)||'')}" placeholder="https://www.linkedin.com/in/..."></div>
        <div class="field"><label>سناب شات</label><input id="st_snapchat" value="${esc((SITESETTINGS&&SITESETTINGS.socials&&SITESETTINGS.socials.snapchat)||'')}" placeholder="https://www.snapchat.com/add/..."></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <button class="btn btn-gold" onclick="swSaveSocials()"><i data-lucide="save"></i> حفظ روابط التواصل</button>
        <span id="st_soc_status" style="color:var(--muted);font-size:12px"></span>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:10px">ملاحظة: الحقل الفارغ يرجع للقيمة الافتراضية المدمجة في الموقع. واتساب يظهر تلقائياً من رقمك.</div>
    </div>`}`;
  applyWallpaper();refreshIcons();
}

/* ===== محرر محتوى الموقع (مسودة → معاينة → نشر) =====
   كل قسم يُحفظ في site_settings.draft (مسودة لا يراها الزوار)،
   المعاينة تفتح الموقع بـ ?preview=1 فيعرض المسودة،
   وزر «نشر» ينسخ draft → value فيظهر للزوار فوراً بلا إعادة بناء.
   يتطلب تشغيل supabase/site_cms.sql مرة واحدة (يضيف عمود draft). */
const SW_TABS=[['content','محتوى الموقع','type'],['works','الأعمال والشعارات','film'],['services','الخدمات','layout-grid'],['look','واجهة الموقع','image'],['preview','المعاينة','eye']];
function swGo(t){SW_TAB=t;renderSiteWorks()}
function swCssHTML(){return `<style>
  .sw-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 18px}
  .sw-tab{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--muted);font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit}
  .sw-tab svg{width:16px;height:16px}
  .sw-tab.on{background:rgba(231,178,76,.14);border-color:rgba(231,178,76,.45);color:var(--gold2,#f3cd83)}
  .cms-card{display:flex;flex-direction:column;gap:8px}
  .cms-card .t{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .cms-card .t b{font-size:15px}
  .cms-card .d{color:var(--muted);font-size:12.5px;min-height:32px}
  .cms-card .a{display:flex;gap:6px;flex-wrap:wrap}
</style>`}
const CMS_DEF={
 site:{whatsapp:'966504895213',email:'ibrahimsaud25@gmail.com',bio:'إبراهيم سعود — فيديوهات إعلانية تبيع',fabMsg:'السلام عليكم إبراهيم، أبي إعلان لمنتجي 🎬\nالمنتج: '},
 hero:{title:'فيديو إعلاني *يبيع* — تستلمه خلال ٣ أيام.',sub:'أنا إبراهيم سعود. أكتب الفكرة والسكربت، وأصوّر، وأمنتج — وتستلم إعلاناً طولياً (٩:١٦) بهوك يوقف التمرير في أول ثانيتين، جاهزاً للنشر على تيك توك وسناب وريلز وشورتس.',cta1:{label:'اطلب إعلانك الآن',waMsg:'السلام عليكم إبراهيم، أبي إعلان لمنتجي 🎬\nالمنتج: \nجمهوري: \nهدفي من الإعلان: '},cta2:{label:'شوف الإعلانات أولاً',href:'#works'},note:'٣ أيام تسليم · جولتا تعديل مجانية · تصوير في موقعك بالرياض أو في استوديو مجهّز'},
 reels:{label:'الأعمال',title:'شوف الإعلانات قبل ما تقرّر.',sub:'عقار · قهوة · أقفال ذكية · زيوت سيارات · متاجر إلكترونية · تطبيقات — قطاعات ما تشبه بعض، ونفس المعيار في كلها: هوك سريع، رسالة واحدة، ودعوة واضحة في النهاية.',hint:'اضغط أي مقطع وشغّله'},
 packages:{label:'الأسعار',title:'سعر واضح — بلا مفاجآت.',sub:'كل باقة تشمل الفكرة والسكربت والتصوير والمونتاج، وتسليماً خلال ٣ أيام مع جولتَي تعديل مجانية.'},
 faq:{label:'قبل ما تطلب',title:'أسئلة تجي في بالك — والجواب عليها هنا.',items:[{q:'كم ياخذ الإعلان وقت؟',a:'٣ أيام عمل من الاتفاق حتى تستلم الفيديو جاهزاً للنشر. لو عندك موعد إطلاق، قل لي وأرتّب الجدول عليه.'},{q:'لازم أجهّز فكرة أو سكربت؟',a:'لا. الفكرة والسكربت جزء من الخدمة — تعطيني منتجك وجمهورك، وأرجع لك بسكربت تعتمده قبل التصوير.'},{q:'لازم أظهر بنفسي أمام الكاميرا؟',a:'لا. تبي تظهر؟ نصوّرك ونخرجك بأفضل صورة. ما تبي؟ أظهر أنا، أو نصوّر المنتج بتعليق صوتي — عندي أعمال بالطريقتين.'},{q:'وين يصير التصوير؟',a:'في موقعك أو متجرك داخل الرياض، أو في استوديو مجهّز بالإضاءة والصوت — تختار الأنسب لمنتجك.'},{q:'وش لو ما عجبني الناتج؟',a:'عندك جولتا تعديل مجانية بعد التسليم. وقبلها تعتمد السكربت بنفسك، فالنتيجة ما تفاجئك.'},{q:'كم السعر؟',a:'يعتمد على عدد الإعلانات وطبيعة التصوير. أرسل لي منتجك وأرجع لك بعرض واضح ومكتوب — بلا التزام.'}],ctaLabel:'سؤالك مو هنا؟ اسألني مباشرة',ctaMsg:'السلام عليكم إبراهيم، عندي سؤال عن خدمة الفيديو الإعلاني: '},
 about:{label:'عني',title:'إبراهيم سعود',paragraphs:['تقنية أعمال وبودكاست — أوظّف التقنية في تطوير الأعمال والأنظمة، وأنتج البودكاست والمحتوى المرئي الذي يبني الحضور.','مقدّم ومنتج بودكاست *سَعي*، وأبني أنظمة وأدوات تقنية تخدم الأعمال (منها منصة *حروف ودروس*). اشتغلت مع جامعة الملك سعود في هاكاثون *هيلثون*، ومع علامات تجارية في السعودية والخليج بأكثر من ٣٠ عملاً مرئياً.','فلسفتي بسيطة: التقنية والمحتوى الناجح وراهما قصة وتجهيز ونظام — وهذا ما أصنعه لك.'],photo:'/profile.jpg',ventures:[{title:'منصة حروف ودروس',desc:'منصة تعليمية تساعد المعلّم وتولّد له أسئلة عالية الجودة — منتج تقني قيد الإطلاق.',href:'https://ibrahimsaud.com/app/',tag:'منتج تقني'}]},
 process:{label:'كيف نشتغل',title:'من رسالة واتساب إلى إعلان جاهز — في ٣ أيام.',sub:'ما تحتاج وكالة ولا فريق ولا اجتماعات: شخص واحد يمسك الفكرة والسكربت والتصوير والمونتاج، وأنت تعتمد وتستلم.',steps:[{n:'01',title:'ترسل لي منتجك',desc:'رسالة واتساب تكفي: وش تبيع، مين جمهورك، ووش تبي الإعلان يحقّق.'},{n:'02',title:'أكتب الهوك والسكربت',desc:'فكرة مبنية على منتجك، أول ثانيتين توقف التمرير — وتعتمدها أنت قبل أي كاميرا.'},{n:'03',title:'نصوّر طولي ٩:١٦',desc:'في موقعك بالرياض أو في استوديو مجهّز — إضاءة وصوت احترافي، وكادر مبني للجوال لا مقصوص من فيديو أفقي.'},{n:'04',title:'تستلم خلال ٣ أيام',desc:'مونتاج وموسيقى ونص على الشاشة، وجولتا تعديل مجانية — ثم انشره وأنت مطمئن.'}]},
 contact:{title:'جاهز؟ *أرسل منتجك الحين.*',sub:'رسالة واحدة تكفي: وش المنتج ومين جمهورك — وأرجع لك بفكرة الإعلان وعرض السعر، وبعدها بـ٣ أيام يكون إعلانك جاهز للنشر.',cta1:{label:'أرسل منتجك عبر واتساب',waMsg:'السلام عليكم إبراهيم، أبي إعلان لمنتجي 🎬\nالمنتج: \nجمهوري: \nهدفي من الإعلان: '},cta2:{label:'عندي سؤال قبل ما أطلب',waMsg:'السلام عليكم إبراهيم، عندي سؤال عن خدمة الفيديو الإعلاني: '}},
 layout:{sections:[{id:'works',on:true},{id:'brands',on:true},{id:'process',on:true},{id:'faq',on:true},{id:'packages',on:false},{id:'newsletter',on:false},{id:'contact',on:true}]},
 theme:{gold:'#e7b24c',goldSoft:'#f3cd83'},
 prices:{podcastPrice:2499,
  ads:{
   single:{name:'باقة الإعلان الواحد',price:750,tagline:'إعلان واحد احترافي من الفكرة حتى التسليم',badge:''},
   review:{name:'باقة المراجعة الكاملة',price:1000,tagline:'مراجعة كاملة لمنتجك أو خدمتك تبني الثقة وتبيع',badge:''},
   triple:{name:'باقة الـ٣ إعلانات',price:1500,tagline:'ثلاثة إعلانات بسعر موفّر — لحملة متكاملة',badge:'الأوفر'}},
  rental:{
   'hour':{name:'ساعة تصوير',price:150,unit:'للساعة',tagline:'ابدأ بأقل تكلفة — ادفع بالساعة',badge:''},
   'half-day':{name:'نصف يوم — ٤ ساعات',price:500,unit:'للجلسة',tagline:'وقت مريح لتصوير محتوى متعدّد',badge:'الأنسب'},
   'full-day':{name:'يوم كامل — ٨ ساعات',price:900,unit:'لليوم',tagline:'للإنتاج المكثّف وتصوير حلقات/إعلانات متعدّدة',badge:''}},
  rentalNote:'تصوّر في الاستوديو المجهّز وتستلم اللقطات الخام كاملة، وتكمل المونتاج بنفسك. مناسب لصنّاع المحتوى والبودكاست والإعلانات.',
  showRentalPrices:false}
};
const CMS_SECTIONS=[
 {key:'hero',name:'الواجهة الرئيسية (الهيرو)',icon:'sparkles',desc:'الشارة، العنوان الكبير، النبذة، وزرَّي الطلب والمشاهدة'},
 {key:'reels',name:'قسم الإعلانات الطولية',icon:'clapperboard',desc:'عناوين قسم الأعمال (المقاطع نفسها من ملف src/lib/reels.ts)'},
 {key:'packages',name:'قسم الباقات في الرئيسية',icon:'tag',desc:'عناوين قسم الأسعار (الباقات والأسعار من «الأسعار والباقات»)'},
 {key:'faq',name:'قسم الأسئلة (قبل ما تطلب)',icon:'help-circle',desc:'الأسئلة والأجوبة التي تزيل تردّد العميل قبل الطلب'},
 {key:'layout',name:'أقسام الصفحة الرئيسية',icon:'layout-list',desc:'أظهر/أخفِ أي قسم من أقسام الصفحة'},
 {key:'about',name:'قسم «عني»',icon:'user-round',desc:'محفوظ للاستخدام لاحقاً — غير معروض في الموقع حالياً'},
 {key:'process',name:'قسم «كيف نشتغل»',icon:'list-ordered',desc:'العناوين وخطوات العمل (فعّله من «أقسام الصفحة»)'},
 {key:'contact',name:'قسم «تواصل معي»',icon:'message-circle',desc:'عنوان الدعوة، النص، ونصوص أزرار الواتساب'},
 {key:'site',name:'الهوية والتواصل',icon:'id-card',desc:'رقم الواتساب، الإيميل، النبذة (الفوتر)، ورسالة الزر العائم'},
 {key:'prices',name:'الأسعار والباقات',icon:'banknote',desc:'سعر تسجيل الحلقة، باقات الإعلانات الثلاث، وباقات تأجير الاستوديو'},
 {key:'theme',name:'ألوان الهوية',icon:'palette',desc:'اللون الذهبي الأساسي والفاتح لكل الموقع'},
];
const CMS_SEC_NAMES={works:'الإعلانات الطولية (الأعمال)',brands:'شريط الشعارات (موثوق من)',process:'كيف نشتغل',faq:'الأسئلة قبل الطلب',packages:'الباقات والأسعار',newsletter:'النشرة البريدية',contact:'تواصل معي'};
function cmsMerge(d,s){if(s==null)return d;if(Array.isArray(s)||typeof s!=='object')return s;const o={...(d||{})};for(const k in s){o[k]=(d&&d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k])&&s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))?cmsMerge(d[k],s[k]):s[k]}return o}
function cmsVal(k){return cmsMerge(cmsMerge(CMS_DEF[k],(SITESETTINGS||{})[k]),(SITEDRAFTS||{})[k])}
function cmsDraftKeys(){return CMS_SECTIONS.map(s=>s.key).filter(k=>SITEDRAFTS&&SITEDRAFTS[k]!=null)}
function cmsStatus(k){
  if(SITEDRAFTS&&SITEDRAFTS[k]!=null)return '<span class="pill unpaid" style="background:rgba(245,158,11,.16);color:#fcd34d">مسودة غير منشورة</span>';
  if(SITESETTINGS&&SITESETTINGS[k]!=null)return '<span class="pill done">منشور</span>';
  return '<span class="pill" style="background:rgba(155,155,163,.16);color:var(--muted)">النص الافتراضي</span>';
}
function swPreviewUrl(){return location.origin+'/?preview=1'}
function swBarHTML(){
  const n=cmsDraftKeys().length;
  return `<div class="card" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:12px 16px">
    ${n?`<span style="display:flex;align-items:center;gap:8px;font-weight:800;color:#fcd34d"><i data-lucide="pencil-line"></i> ${n} ${n===1?'قسم معدّل':'أقسام معدّلة'} بانتظار النشر</span>`
       :`<span style="display:flex;align-items:center;gap:8px;color:var(--muted)"><i data-lucide="check-circle-2"></i> لا تعديلات معلّقة — الموقع مطابق لآخر نشر</span>`}
    <div style="margin-inline-start:auto;display:flex;gap:8px;flex-wrap:wrap">
      <a class="btn btn-ghost" href="${swPreviewUrl()}" target="_blank" rel="noopener"><i data-lucide="eye"></i> معاينة الموقع</a>
      ${n?`<button class="btn btn-ghost" style="color:var(--bad)" onclick="cmsDiscardAll()"><i data-lucide="undo-2"></i> تجاهل المسودات</button>
      <button class="btn btn-gold" onclick="cmsPublishAll()"><i data-lucide="rocket"></i> نشر التعديلات (${n})</button>`:''}
    </div></div>`;
}
function cmsTabHTML(){
  return `<div class="badge-note" style="margin-bottom:16px"><i data-lucide="workflow"></i> <div><b>دورة العمل:</b> عدّل أي قسم واحفظه ← يُحفظ <b>كمسودة</b> لا يراها الزوار ← افتح <b>«المعاينة»</b> لتشوف الشكل النهائي ← اضغط <b>«نشر التعديلات»</b> فتظهر للزوار فوراً. لو ظهر خطأ عند الحفظ أول مرة، شغّل ملف <b>supabase/site_cms.sql</b> في Supabase (يضيف عمود المسودة).</div></div>
  <div class="grid">
  ${CMS_SECTIONS.map(s=>`<div class="card cms-card">
    <div class="t"><b><i class="inl" data-lucide="${s.icon}"></i> ${s.name}</b>${cmsStatus(s.key)}</div>
    <div class="d">${s.desc}</div>
    <div class="a">
      <button class="btn btn-gold btn-sm" onclick="cmsModal('${s.key}')"><i data-lucide="pencil"></i> تعديل</button>
      ${(SITEDRAFTS&&SITEDRAFTS[s.key]!=null)?`<button class="btn btn-ghost btn-sm" onclick="cmsPublishOne('${s.key}')"><i data-lucide="rocket"></i> نشر</button>
      <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="cmsDiscardOne('${s.key}')"><i data-lucide="undo-2"></i> تراجع</button>`:''}
    </div>
  </div>`).join('')}
  </div>`;
}
/* — الحفظ والنشر — */
async function cmsSaveDraft(key,obj){
  const {error}=await sb.from('site_settings').upsert({key,draft:obj,updated_at:new Date().toISOString()});
  if(error){
    const hint=/draft/.test(String(error.message))?'\n\n⚠️ عمود المسودة غير موجود بعد — شغّل ملف supabase/site_cms.sql في Supabase (SQL Editor) مرة واحدة ثم أعد المحاولة.':'';
    alert('تعذّر حفظ المسودة: '+error.message+hint);return false;
  }
  SITEDRAFTS=SITEDRAFTS||{};SITEDRAFTS[key]=obj;return true;
}
async function cmsPublishOne(key){
  if(!SITEDRAFTS||SITEDRAFTS[key]==null)return;
  const {error}=await sb.from('site_settings').update({value:SITEDRAFTS[key],draft:null,published_at:new Date().toISOString()}).eq('key',key);
  if(error){alert('تعذّر النشر: '+error.message);return}
  SITESETTINGS[key]=SITEDRAFTS[key];delete SITEDRAFTS[key];renderSiteWorks();
}
async function cmsPublishAll(){
  const keys=cmsDraftKeys();if(!keys.length)return;
  if(!confirm('نشر تعديلات '+keys.length+' قسم على الموقع الحي الآن؟'))return;
  for(const k of keys){
    const {error}=await sb.from('site_settings').update({value:SITEDRAFTS[k],draft:null,published_at:new Date().toISOString()}).eq('key',k);
    if(error){alert('تعذّر نشر «'+k+'»: '+error.message);renderSiteWorks();return}
    SITESETTINGS[k]=SITEDRAFTS[k];delete SITEDRAFTS[k];
  }
  renderSiteWorks();alert('تم النشر ✓ — التعديلات ظاهرة الآن على الموقع (حدّث الصفحة عند الزائر)');
}
async function cmsDiscardOne(key){
  if(!confirm('تجاهل مسودة هذا القسم والرجوع للمنشور؟'))return;
  const {error}=await sb.from('site_settings').update({draft:null}).eq('key',key);
  if(error){alert('تعذّر: '+error.message);return}
  delete SITEDRAFTS[key];renderSiteWorks();
}
async function cmsDiscardAll(){
  const keys=cmsDraftKeys();if(!keys.length)return;
  if(!confirm('تجاهل كل المسودات ('+keys.length+') والرجوع للمنشور؟'))return;
  for(const k of keys){await sb.from('site_settings').update({draft:null}).eq('key',k);delete SITEDRAFTS[k]}
  renderSiteWorks();
}
/* — المحررات — */
const cmsG=i=>document.getElementById(i).value;
const cmsLines=t=>t.split('\n').map(x=>x.trim()).filter(Boolean);
function cmsField(id,label,val,ph){return `<div class="field"><label>${label}</label><input id="${id}" value="${esc(val||'')}" placeholder="${esc(ph||'')}"></div>`}
function cmsArea(id,label,val,rows,hint){return `<div class="field"><label>${label}</label><textarea id="${id}" rows="${rows||3}">${esc(val||'')}</textarea>${hint?`<div style="font-size:12px;color:var(--muted);margin-top:3px">${hint}</div>`:''}</div>`}
function cmsModal(key){
  const v=cmsVal(key);
  if(key==='hero'){
    openModal('الواجهة الرئيسية (الهيرو)',`
      ${cmsField('cm_title','العنوان الكبير — ضع النجمتين حول الكلمة الذهبية: *تبيع*',v.title)}
      ${cmsArea('cm_sub','النبذة تحت العنوان',v.sub,3)}
      <div class="row2">${cmsField('cm_c1l','نص الزر الذهبي (واتساب)',v.cta1.label)}${cmsField('cm_c1m','رسالة الواتساب عند الضغط',v.cta1.waMsg)}</div>
      <div class="row2">${cmsField('cm_c2l','نص الزر الثاني',v.cta2.label)}${cmsField('cm_c2h','رابطه (مثل #works)',v.cta2.href)}</div>
      ${cmsField('cm_note','السطر الصغير أسفل الأزرار',v.note)}`,
    async()=>{
      const obj={title:cmsG('cm_title'),sub:cmsG('cm_sub'),
        cta1:{label:cmsG('cm_c1l'),waMsg:cmsG('cm_c1m')},cta2:{label:cmsG('cm_c2l'),href:cmsG('cm_c2h')},note:cmsG('cm_note')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='reels'){
    openModal('قسم الإعلانات الطولية',`
      <div class="badge-note" style="margin-bottom:10px"><i data-lucide="info"></i> <div>المقاطع نفسها (الروابط والصور والأسماء) تُدار من ملف <b>src/lib/reels.ts</b> في المشروع — هنا تعدّل عناوين القسم فقط.</div></div>
      <div class="row2">${cmsField('cm_label','التسمية الصغيرة',v.label)}${cmsField('cm_hint','سطر التلميح (يسار العنوان)',v.hint)}</div>
      ${cmsField('cm_title','العنوان',v.title)}
      ${cmsArea('cm_sub','النص التوضيحي',v.sub,2)}`,
    async()=>{
      const obj={label:cmsG('cm_label'),title:cmsG('cm_title'),sub:cmsG('cm_sub'),hint:cmsG('cm_hint')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='packages'){
    openModal('قسم الباقات في الرئيسية',`
      ${cmsField('cm_label','التسمية الصغيرة',v.label)}
      ${cmsField('cm_title','العنوان',v.title)}
      ${cmsArea('cm_sub','النص التوضيحي',v.sub,2)}`,
    async()=>{
      const obj={label:cmsG('cm_label'),title:cmsG('cm_title'),sub:cmsG('cm_sub')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='faq'){
    openModal('قسم الأسئلة (قبل ما تطلب)',`
      <div class="row2">${cmsField('cm_label','التسمية الصغيرة',v.label)}${cmsField('cm_cta','نص الرابط أسفل القسم',v.ctaLabel)}</div>
      ${cmsField('cm_title','العنوان',v.title)}
      ${cmsField('cm_ctam','رسالة واتساب لهذا الرابط',v.ctaMsg)}
      ${cmsArea('cm_items','الأسئلة (سطر لكل سؤال: السؤال | الجواب)',v.items.map(x=>x.q+' | '+x.a).join('\n'),8,'مثال: كم ياخذ الإعلان وقت؟ | ٣ أيام عمل من الاتفاق حتى التسليم.')}`,
    async()=>{
      const items=cmsLines(cmsG('cm_items')).map(l=>{const p=l.split('|');return{q:(p[0]||'').trim(),a:(p.slice(1).join('|')||'').trim()}}).filter(x=>x.q);
      const obj={label:cmsG('cm_label'),title:cmsG('cm_title'),items,ctaLabel:cmsG('cm_cta'),ctaMsg:cmsG('cm_ctam')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='about'){
    openModal('قسم «عني»',`
      <div class="row2">${cmsField('cm_label','التسمية الصغيرة',v.label)}${cmsField('cm_title','العنوان',v.title)}</div>
      ${cmsArea('cm_paras','الفقرات (افصل بين كل فقرة بسطر فارغ) — *كذا* يلوّنها ذهبياً',v.paragraphs.join('\n\n'),7)}
      ${cmsField('cm_photo','رابط الصورة الجانبية',v.photo,'/profile.jpg')}
      ${cmsArea('cm_vent','المشاريع (سطر لكل مشروع: الوسم | الاسم | الوصف | الرابط)',v.ventures.map(x=>[x.tag,x.title,x.desc,x.href].join(' | ')).join('\n'),3)}`,
    async()=>{
      const vent=cmsLines(cmsG('cm_vent')).map(l=>{const p=l.split('|').map(x=>x.trim());return{tag:p[0]||'',title:p[1]||'',desc:p[2]||'',href:p[3]||'#'}}).filter(x=>x.title);
      const obj={label:cmsG('cm_label'),title:cmsG('cm_title'),paragraphs:cmsG('cm_paras').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean),photo:cmsG('cm_photo'),ventures:vent};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='process'){
    openModal('قسم «كيف نشتغل»',`
      ${cmsField('cm_label','التسمية الصغيرة',v.label)}
      ${cmsField('cm_title','العنوان',v.title)}
      ${cmsArea('cm_sub','النص التوضيحي',v.sub,2)}
      ${cmsArea('cm_steps','الخطوات (سطر لكل خطوة: الرقم | العنوان | الوصف)',v.steps.map(s=>[s.n,s.title,s.desc].join(' | ')).join('\n'),5)}`,
    async()=>{
      const steps=cmsLines(cmsG('cm_steps')).map(l=>{const p=l.split('|').map(x=>x.trim());return{n:p[0]||'',title:p[1]||'',desc:p[2]||''}}).filter(s=>s.title);
      const obj={label:cmsG('cm_label'),title:cmsG('cm_title'),sub:cmsG('cm_sub'),steps};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='contact'){
    openModal('قسم «تواصل معي»',`
      ${cmsField('cm_title','العنوان — *كذا* للجزء الذهبي',v.title)}
      ${cmsArea('cm_sub','النص',v.sub,2)}
      <div class="row2">${cmsField('cm_c1l','نص الزر الأول',v.cta1.label)}${cmsField('cm_c1m','رسالة واتساب الزر الأول',v.cta1.waMsg)}</div>
      <div class="row2">${cmsField('cm_c2l','نص الزر الثاني',v.cta2.label)}${cmsField('cm_c2m','رسالة واتساب الزر الثاني',v.cta2.waMsg)}</div>`,
    async()=>{
      const obj={title:cmsG('cm_title'),sub:cmsG('cm_sub'),cta1:{label:cmsG('cm_c1l'),waMsg:cmsG('cm_c1m')},cta2:{label:cmsG('cm_c2l'),waMsg:cmsG('cm_c2m')}};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='site'){
    openModal('الهوية والتواصل',`
      <div class="row2">${cmsField('cm_wa','رقم الواتساب (صيغة دولية بلا +)',v.whatsapp,'9665xxxxxxxx')}${cmsField('cm_em','الإيميل',v.email)}</div>
      ${cmsField('cm_bio','النبذة (تظهر في الفوتر)',v.bio)}
      ${cmsField('cm_fab','رسالة زر الواتساب العائم',v.fabMsg)}`,
    async()=>{
      const obj={whatsapp:cmsG('cm_wa').replace(/\D/g,''),email:cmsG('cm_em'),bio:cmsG('cm_bio'),fabMsg:cmsG('cm_fab')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='prices'){
    const grp=(pfx,id,p,unit)=>`
      <div style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px">
        <div class="row2">${cmsField(pfx+id+'_name','اسم الباقة',p.name)}${cmsField(pfx+id+'_price','السعر (ريال)',p.price)}</div>
        ${unit?`<div class="row2">${cmsField(pfx+id+'_unit','وحدة السعر (للساعة/للجلسة…)',p.unit)}${cmsField(pfx+id+'_badge','شارة (مثل: الأنسب — فارغة = بدون)',p.badge)}</div>`
              :cmsField(pfx+id+'_badge','شارة (مثل: الأوفر — فارغة = بدون)',p.badge)}
        ${cmsField(pfx+id+'_tag','السطر التعريفي',p.tagline)}
      </div>`;
    openModal('الأسعار والباقات',`
      <div style="font-weight:800;margin:2px 0 8px"><i class="inl" data-lucide="mic"></i> تسجيل حلقة البودكاست</div>
      ${cmsField('cm_pod_price','سعر تسجيل الحلقة الكاملة (ريال)',v.podcastPrice)}
      <div style="font-weight:800;margin:16px 0 8px"><i class="inl" data-lucide="clapperboard"></i> باقات الفيديوهات الإعلانية</div>
      ${['single','review','triple'].map(id=>grp('cm_ad_',id,v.ads[id]||{},false)).join('')}
      <div style="font-weight:800;margin:16px 0 8px"><i class="inl" data-lucide="video"></i> باقات تأجير الاستوديو</div>
      <label style="display:flex;align-items:center;gap:8px;margin:0 0 10px;cursor:pointer;font-size:13.5px">
        <input type="checkbox" id="cm_show_rp" ${v.showRentalPrices?'checked':''}> إظهار أسعار التأجير في الموقع (بدون تعليم: تظهر «السعر عند الطلب»)</label>
      ${['hour','half-day','full-day'].map(id=>grp('cm_rn_',id,v.rental[id]||{},true)).join('')}
      ${cmsArea('cm_rn_note','النص التعريفي لقسم التأجير',v.rentalNote,2)}`,
    async()=>{
      const pick=(pfx,id,unit)=>{const o={name:cmsG(pfx+id+'_name'),price:Number(cmsG(pfx+id+'_price')||0),tagline:cmsG(pfx+id+'_tag'),badge:cmsG(pfx+id+'_badge').trim()};if(unit)o.unit=cmsG(pfx+id+'_unit');return o};
      const obj={podcastPrice:Number(cmsG('cm_pod_price')||0),
        ads:{single:pick('cm_ad_','single'),review:pick('cm_ad_','review'),triple:pick('cm_ad_','triple')},
        rental:{'hour':pick('cm_rn_','hour',true),'half-day':pick('cm_rn_','half-day',true),'full-day':pick('cm_rn_','full-day',true)},
        rentalNote:cmsG('cm_rn_note'),showRentalPrices:document.getElementById('cm_show_rp').checked};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }else if(key==='layout'){
    window.CMS_LAY=JSON.parse(JSON.stringify(cmsVal('layout').sections));
    cmsLayoutModal();
  }else if(key==='theme'){
    openModal('ألوان الهوية',`
      <div class="row2">
        <div class="field"><label>الذهبي الأساسي</label><input type="color" id="cm_gold" value="${esc(v.gold)}" style="height:44px;padding:4px"></div>
        <div class="field"><label>الذهبي الفاتح (التدرجات)</label><input type="color" id="cm_golds" value="${esc(v.goldSoft)}" style="height:44px;padding:4px"></div>
      </div>
      <div class="badge-note"><i data-lucide="info"></i> <div>اللون يطبَّق على كل عناصر الموقع الذهبية (الأزرار، العناوين، التوهّج). جرّبه في المعاينة قبل النشر.</div></div>`,
    async()=>{
      const obj={gold:cmsG('cm_gold'),goldSoft:cmsG('cm_golds')};
      if(await cmsSaveDraft(key,obj)){closeModal();renderSiteWorks()}
    });
  }
}
function cmsLayoutModal(){
  const L=window.CMS_LAY;
  openModal('أقسام الصفحة الرئيسية',`
    <div class="badge-note" style="margin-bottom:10px"><i data-lucide="info"></i> <div>الهيرو ثابت في الأعلى، وترتيب بقية الأقسام مصمَّم ليقود الزائر (أعمال ← ثقة ← طريقة العمل ← الأسعار ← الطلب). علّم القسم لإظهاره وأزل العلامة لإخفائه.</div></div>
    ${L.map((s,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px dashed var(--line)">
      <label style="display:flex;align-items:center;gap:9px;flex:1;cursor:pointer;font-weight:700">
        <input type="checkbox" ${s.on!==false?'checked':''} onchange="window.CMS_LAY[${i}].on=this.checked">
        ${CMS_SEC_NAMES[s.id]||s.id}</label>
    </div>`).join('')}`,
  async()=>{
    if(await cmsSaveDraft('layout',{sections:window.CMS_LAY})){closeModal();renderSiteWorks()}
  });
}
function cmsLayMove(i,d){const L=window.CMS_LAY;const j=i+d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];cmsLayoutModal()}
/* — تبويب المعاينة — */
function swPreviewHTML(){
  const url=swPreviewUrl();
  return `<div class="card" style="padding:14px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-ghost btn-sm" onclick="swPvSize(390)"><i data-lucide="smartphone"></i> جوال</button>
      <button class="btn btn-ghost btn-sm" onclick="swPvSize(820)"><i data-lucide="tablet"></i> تابلت</button>
      <button class="btn btn-ghost btn-sm" onclick="swPvSize(0)"><i data-lucide="monitor"></i> كمبيوتر</button>
      <button class="btn btn-ghost btn-sm" onclick="swPvReload()"><i data-lucide="refresh-cw"></i> تحديث</button>
      <a class="btn btn-ghost btn-sm" href="${url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> فتح في تبويب</a>
      <span style="color:var(--muted);font-size:12px;margin-inline-start:auto">تعرض <b style="color:#fcd34d">المسودة</b> — الزوار لا يرونها حتى تنشر</span>
    </div>
    <div style="display:flex;justify-content:center;background:#000;border-radius:12px;padding:8px;overflow:auto">
      <iframe id="swPvFrame" src="${url}" style="width:100%;height:72vh;border:0;border-radius:8px;background:#0a0a0c;transition:width .25s"></iframe>
    </div></div>`;
}
function swPvSize(w){const f=document.getElementById('swPvFrame');if(f)f.style.width=w?w+'px':'100%'}
function swPvReload(){const f=document.getElementById('swPvFrame');if(f)f.src=f.src}

/* ===== رفع ملف إلى التخزين العام (bucket: blog-images) ===== */
async function swStorageUpload(file,prefix){return await blogUpload(file,prefix)}
async function swUploadSetting(inputId,key,pvId){
  const inp=document.getElementById(inputId),f=inp&&inp.files&&inp.files[0];if(!f)return;
  try{
    const url=await swStorageUpload(f,'site/'+key);
    const {error}=await sb.from('site_settings').upsert({key,value:{url},updated_at:new Date().toISOString()});
    if(error)throw error;
    SITESETTINGS=SITESETTINGS||{};SITESETTINGS[key]={url};
    const pv=document.getElementById(pvId);if(pv){pv.src=url;pv.style.display='block'}
    alert('تم الحفظ — ينعكس على الموقع مباشرة');
  }catch(e){alert('تعذّر الرفع: '+(e.message||e))}
}
async function swSaveSocials(){
  const g=i=>document.getElementById(i).value.trim();
  const socials={tiktok:g('st_tiktok'),youtube:g('st_youtube'),instagram:g('st_instagram'),x:g('st_x'),linkedin:g('st_linkedin'),snapchat:g('st_snapchat')};
  Object.keys(socials).forEach(k=>{if(!socials[k])delete socials[k]});
  const st=document.getElementById('st_soc_status');if(st)st.textContent='…جارٍ الحفظ';
  const {error}=await sb.from('site_settings').upsert({key:'socials',value:socials,updated_at:new Date().toISOString()});
  if(error){if(st)st.textContent='تعذّر الحفظ: '+error.message;return}
  SITESETTINGS=SITESETTINGS||{};SITESETTINGS.socials=socials;
  if(st)st.textContent='تم الحفظ ✓';
}

/* ===== خدمات الموقع ===== */
const SEED_SERVICES=[
 {id:'filming',title:'التصوير',headline:'نلتقط ونُخرج',description:'تصوير احترافي في موقعك أو في الاستوديو — إضاءة سينمائية، لقطات B-Roll، وتصوير درون جوي يرفع مستوى أي عمل.',image:null,accent:'#f87171',sort:10},
 {id:'editing',title:'المونتاج',headline:'نقصّ ونحرّر',description:'قص وإيقاع وموسيقى تناسب الفكرة والسياق — نسخة رئيسية ونسخ قصيرة جاهزة للنشر على كل المنصات.',image:null,accent:'#38bdf8',sort:20},
 {id:'motion',title:'الموشن',headline:'حركة وانسيابية',description:'موشن جرافيك وهوية بصرية متحركة — الحركة عنصر أساسي في أي منتج مرئي، ونجيد توظيفها في مكانها الصحيح.',image:null,accent:'#e7b24c',sort:30},
 {id:'podcast',title:'البودكاست',headline:'نسجّل وننشر',description:'استوديو مجهّز بالكامل لتسجيل حلقاتك: تصوير متعدد الكاميرات، هندسة صوت، مونتاج كامل، ومقاطع قصيرة للمنصات.',image:null,accent:'#a78bfa',sort:40},
 {id:'script',title:'كتابة النص',headline:'نكتب ما يبيع',description:'سكربت إعلاني مبني على منتجك وجمهورك بلهجة تناسب السوق السعودي والخليجي — مع تعليق صوتي احترافي يوصّل رسالتك.',image:null,accent:'#4ade80',sort:50},
 {id:'tech',title:'تقنية الأعمال',headline:'أنظمة تخدم عملك',description:'أوظّف التقنية والذكاء الاصطناعي في تطوير أعمالك: أنظمة إدارة، أتمتة، ومواقع تعكس هويتك وتشتغل لك.',image:null,accent:'#22d3ee',sort:60}
];
async function swImportServices(){
  if(!confirm('استيراد الخدمات الافتراضية الست؟ تقدر تعدّلها بعدين.'))return;
  const {error}=await sb.from('site_services').upsert(SEED_SERVICES);
  if(error){alert('تعذّر الاستيراد: '+error.message);return}
  await swLoad(true);
}
function swServiceModal(id){
  const s=id?{...(SITESERVICES||[]).find(x=>x.id===id)}:{id:'',title:'',headline:'',description:'',image:'',accent:'#e7b24c',sort:((SITESERVICES||[]).length+1)*10};
  openModal(id?'تعديل خدمة':'خدمة جديدة',`
    <div class="row2"><div class="field"><label>اسم التبويب</label><input id="sv_title" value="${esc(s.title||'')}" placeholder="مثال: التصوير"></div>
    <div class="field"><label>العنوان الكبير</label><input id="sv_head" value="${esc(s.headline||'')}" placeholder="مثال: نلتقط ونُخرج"></div></div>
    <div class="field"><label>الوصف</label><textarea id="sv_desc" rows="3">${esc(s.description||'')}</textarea></div>
    <div class="row2">
      <div class="field"><label>الصورة المربعة</label>
        <input type="file" accept="image/*" id="sv_img_file" onchange="swSvcPickImage()">
        <input type="hidden" id="sv_img_val" value="${esc(s.image||'')}">
        <img id="sv_img_pv" src="${esc(s.image||'')}" style="${s.image?'':'display:none;'}width:72px;height:72px;object-fit:cover;border-radius:10px;margin-top:8px">
        <span id="sv_img_st" style="font-size:12px;color:var(--muted)"></span>
      </div>
      <div class="field"><label>اللون المميز (hex)</label><input id="sv_accent" value="${esc(s.accent||'#e7b24c')}" placeholder="#e7b24c">
        <label style="margin-top:10px">الترتيب</label><input type="number" id="sv_sort" value="${Number(s.sort||0)}"></div>
    </div>`,
  ()=>swSaveService(id), id?()=>swDelService(id):null);
}
async function swSvcPickImage(){
  const inp=document.getElementById('sv_img_file'),f=inp&&inp.files&&inp.files[0];if(!f)return;
  const st=document.getElementById('sv_img_st');if(st)st.textContent='…جارٍ الرفع';
  try{const url=await swStorageUpload(f,'site/services');document.getElementById('sv_img_val').value=url;const pv=document.getElementById('sv_img_pv');pv.src=url;pv.style.display='block';if(st)st.textContent='تم الرفع ✓'}
  catch(e){if(st)st.textContent='تعذّر الرفع: '+(e.message||e)}
}
async function swSaveService(id){
  const g=i=>document.getElementById(i);const title=g('sv_title').value.trim();if(!title){alert('أدخل اسم التبويب');return}
  const row={id:id||('sv_'+uid()),title,headline:g('sv_head').value.trim(),description:g('sv_desc').value.trim(),image:g('sv_img_val').value||null,accent:g('sv_accent').value.trim()||null,sort:Number(g('sv_sort').value||0)};
  const {error}=await sb.from('site_services').upsert(row);
  if(error){alert('تعذّر الحفظ: '+error.message);return}
  closeModal();await swLoad(true);
}
async function swDelService(id){if(!confirm('حذف هذه الخدمة؟'))return;const {error}=await sb.from('site_services').delete().eq('id',id);if(error){alert('تعذّر الحذف: '+error.message);return}closeModal();await swLoad(true);}
function swPickImage(inputId,pvId,fmt,maxW){
  const inp=document.getElementById(inputId),f=inp&&inp.files&&inp.files[0];if(!f)return;
  const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const s=Math.min(1,(maxW||400)/img.width);const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));c.getContext('2d').drawImage(img,0,0,c.width,c.height);let url;try{url=c.toDataURL(fmt==='webp'?'image/webp':'image/png',0.85)}catch(e){url=c.toDataURL('image/png')}const v=document.getElementById(pvId+'_val');if(v)v.value=url;const pv=document.getElementById(pvId);if(pv){pv.src=url;pv.style.display='block'}};img.src=rd.result};rd.readAsDataURL(f);
}
function swClearImg(pvId){const v=document.getElementById(pvId+'_val');if(v)v.value='';const pv=document.getElementById(pvId);if(pv){pv.src='';pv.style.display='none'}}
function swWorkModal(id){
  const w=id?{...(SITEWORKS||[]).find(x=>x.id===id)}:{id:'',client:'',title:'',category:SW_CATS[0],audience:'companies',roles:[],description:'',kind:'video',images:[],tags:[],link:'',video_url:'',videos:[],logo:'',thumb:'',featured:false,sort:((SITEWORKS||[]).length+1)*10};
  const allCats=[...new Set([...SW_CATS,...(SITEWORKS||[]).map(x=>x.category).filter(Boolean)])];
  const catList=allCats.map(c=>`<option value="${esc(c)}">`).join('');
  const audOpts=SW_AUD.map(a=>`<option value="${a[0]}" ${(w.audience||'')===a[0]?'selected':''}>${esc(a[1])}</option>`).join('');
  const kind=w.kind==='gallery'?'gallery':'video';
  openModal(id?'تعديل عمل':'عمل جديد',`
    <div class="row2"><div class="field"><label>عنوان العمل</label><input id="sw_title" value="${esc(w.title)}" placeholder="مثال: فيلم يوم التأسيس"></div>
    <div class="field"><label>العميل/الجهة</label><input id="sw_client" value="${esc(w.client)}" placeholder="اسم الشركة أو المتجر"></div></div>
    <div class="row2">
      <div class="field"><label>نوع العمل</label><select id="sw_kind" onchange="swKindToggle()"><option value="video" ${kind==='video'?'selected':''}>فيديو</option><option value="gallery" ${kind==='gallery'?'selected':''}>معرض صور (تصميم/جرافيك)</option></select></div>
      <div class="field"><label>التصنيف (اكتب تصنيفاً جديداً أو اختر)</label><input id="sw_cat" list="sw_cats_dl" value="${esc(w.category||'')}" placeholder="مثال: تصميم جرافيك"><datalist id="sw_cats_dl">${catList}</datalist></div>
    </div>
    <div class="row2"><div class="field"><label>القسم (أين يظهر)</label><select id="sw_aud">${audOpts}</select></div>
    <div class="field"><label>تاجات (افصلها بفاصلة — تظهر على البطاقة)</label><input id="sw_tags" value="${esc((w.tags||[]).join('، '))}" placeholder="موشن، هوية بصرية"></div></div>
    <div class="field"><label>الأدوار (افصلها بفاصلة)</label><input id="sw_roles" value="${esc((w.roles||[]).join('، '))}" placeholder="إخراج، تصوير، مونتاج"></div>
    <div class="field"><label>الوصف</label><textarea id="sw_desc" rows="3">${esc(w.description||'')}</textarea></div>
    <div id="sw_video_wrap" style="${kind==='gallery'?'display:none':''}">
      <div class="field"><label>رابط الفيديو الأساسي</label><input id="sw_video" value="${esc(w.video_url||'')}" placeholder="https://youtu.be/... أو رابط تيك توك/فيميو"></div>
      <div class="field"><label>روابط فيديو إضافية (سطر لكل رابط — اختياري)</label><textarea id="sw_videos" rows="2" placeholder="رابط لكل سطر">${esc((w.videos||[]).join('\n'))}</textarea></div>
    </div>
    <div id="sw_gallery_wrap" style="${kind==='gallery'?'':'display:none'}">
      <div class="field"><label>صور العمل (ترفع عدة صور — تظهر كمعرض في صفحة العمل)</label>
        <input type="file" accept="image/*" multiple id="sw_imgs_file" onchange="swPickWorkImages()">
        <span id="sw_imgs_st" style="font-size:12px;color:var(--muted)"></span>
        <div id="sw_imgs_list" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>
      </div>
    </div>
    <div class="field"><label>رابط خارجي للعمل (اختياري)</label><input id="sw_link" value="${esc(w.link||'')}" placeholder="https://..."></div>
    <div class="row2">
      <div class="field"><label>شعار العميل (اختياري)</label>
        <input type="file" accept="image/*" id="sw_logo_file" onchange="swPickImage('sw_logo_file','sw_logo_pv','png',300)">
        <input type="hidden" id="sw_logo_pv_val" value="${esc(w.logo||'')}">
        <img id="sw_logo_pv" src="${esc(w.logo||'')}" style="${w.logo?'':'display:none;'}max-height:56px;margin-top:8px;background:#fff;border-radius:8px;padding:4px">
        <div><button type="button" class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="swClearImg('sw_logo_pv')">إزالة الشعار</button></div>
      </div>
      <div class="field"><label>صورة مصغّرة مخصّصة (اختياري)</label>
        <input type="file" accept="image/*" id="sw_thumb_file" onchange="swPickImage('sw_thumb_file','sw_thumb_pv','webp',800)">
        <input type="hidden" id="sw_thumb_pv_val" value="${esc(w.thumb||'')}">
        <img id="sw_thumb_pv" src="${esc(w.thumb||'')}" style="${w.thumb?'':'display:none;'}max-height:64px;margin-top:8px;border-radius:8px">
        <div style="font-size:12px;color:var(--muted);margin-top:4px">فارغة = تُستخدم صورة يوتيوب تلقائياً.</div>
      </div>
    </div>
    <div class="row2"><div class="field"><label>مميّز</label><select id="sw_feat"><option value="0" ${!w.featured?'selected':''}>عادي</option><option value="1" ${w.featured?'selected':''}>مميّز (بشارة)</option></select></div>
    <div class="field"><label>الترتيب (الأصغر أولاً)</label><input type="number" id="sw_sort" value="${Number(w.sort||0)}"></div></div>`,
  ()=>swSaveWork(id), id?()=>swDelWork(id):null);
  SW_IMGS=[...(w.images||[])];swRenderWorkImgs();
}
let SW_IMGS=[];
function swKindToggle(){
  const k=document.getElementById('sw_kind').value;
  document.getElementById('sw_video_wrap').style.display=k==='gallery'?'none':'';
  document.getElementById('sw_gallery_wrap').style.display=k==='gallery'?'':'none';
}
function swRenderWorkImgs(){
  const box=document.getElementById('sw_imgs_list');if(!box)return;
  box.innerHTML=SW_IMGS.map((u,i)=>`<div style="position:relative">
    <img src="${esc(u)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
    <button type="button" onclick="SW_IMGS.splice(${i},1);swRenderWorkImgs()" style="position:absolute;top:-6px;inset-inline-start:-6px;width:20px;height:20px;border-radius:50%;border:none;background:var(--bad,#e11d48);color:#fff;cursor:pointer;font-size:11px;line-height:1">✕</button>
  </div>`).join('');
}
async function swPickWorkImages(){
  const inp=document.getElementById('sw_imgs_file'),files=[...(inp&&inp.files||[])];if(!files.length)return;
  const st=document.getElementById('sw_imgs_st');
  for(let i=0;i<files.length;i++){
    if(st)st.textContent=`…رفع ${i+1} من ${files.length}`;
    try{const url=await swStorageUpload(files[i],'works');SW_IMGS.push(url);swRenderWorkImgs();}
    catch(e){if(st)st.textContent='تعذّر الرفع: '+(e.message||e);return}
  }
  if(st)st.textContent='تم رفع الصور ✓';inp.value='';
}
async function swSaveWork(id){
  const g=i=>document.getElementById(i);const title=g('sw_title').value.trim();if(!title){alert('أدخل عنوان العمل');return}
  const kind=g('sw_kind').value==='gallery'?'gallery':'video';
  const cat=g('sw_cat').value.trim();if(!cat){alert('أدخل التصنيف');return}
  const row={id:id||('w_'+uid()),client:g('sw_client').value.trim(),title,category:cat,audience:g('sw_aud').value||null,
    roles:g('sw_roles').value.split(/[،,]/).map(s=>s.trim()).filter(Boolean),description:g('sw_desc').value.trim(),
    kind,images:SW_IMGS,tags:g('sw_tags').value.split(/[،,]/).map(s=>s.trim()).filter(Boolean),link:g('sw_link').value.trim()||null,
    video_url:kind==='gallery'?null:(g('sw_video').value.trim()||null),
    videos:kind==='gallery'?[]:g('sw_videos').value.split('\n').map(s=>s.trim()).filter(Boolean),
    logo:g('sw_logo_pv_val').value||null,thumb:g('sw_thumb_pv_val').value||null,featured:g('sw_feat').value==='1',sort:Number(g('sw_sort').value||0)};
  const btn=document.getElementById('mSave');if(btn){btn.disabled=true;btn.textContent='…جارٍ الحفظ'}
  const {error}=await sb.from('site_works').upsert(row);
  if(error){alert('تعذّر الحفظ: '+error.message);if(btn){btn.disabled=false;btn.textContent='حفظ'}return}
  closeModal();await swLoad(true);
}
async function swDelWork(id){if(!confirm('حذف هذا العمل من الموقع نهائياً؟'))return;const {error}=await sb.from('site_works').delete().eq('id',id);if(error){alert('تعذّر الحذف: '+error.message);return}closeModal();await swLoad(true);}
async function swToggleFeatured(id){const w=(SITEWORKS||[]).find(x=>x.id===id);if(!w)return;const {error}=await sb.from('site_works').update({featured:!w.featured}).eq('id',id);if(error){alert('تعذّر التحديث: '+error.message);return}w.featured=!w.featured;renderSiteWorks();}
function swBrandModal(id){
  const b=id?{...(SITEBRANDS||[]).find(x=>x.id===id)}:{id:'',name:'',logo:'',sort:((SITEBRANDS||[]).length+1)*10};
  openModal(id?'تعديل شعار':'شعار جديد',`
    <div class="field"><label>اسم الشركة/الجهة</label><input id="sbr_name" value="${esc(b.name||'')}"></div>
    <div class="field"><label>الشعار (PNG بخلفية شفافة أفضل)</label>
      <input type="file" accept="image/*" id="sbr_logo_file" onchange="swPickImage('sbr_logo_file','sbr_logo_pv','png',320)">
      <input type="hidden" id="sbr_logo_pv_val" value="${esc(b.logo||'')}">
      <img id="sbr_logo_pv" src="${esc(b.logo||'')}" style="${b.logo?'':'display:none;'}max-height:56px;margin-top:8px;background:#fff;border-radius:8px;padding:4px"></div>
    <div class="field"><label>الترتيب</label><input type="number" id="sbr_sort" value="${Number(b.sort||0)}"></div>`,
  ()=>swSaveBrand(id), id?()=>swDelBrand(id):null);
}
async function swSaveBrand(id){
  const g=i=>document.getElementById(i);const logo=g('sbr_logo_pv_val').value;if(!logo){alert('ارفع الشعار أولاً');return}
  const row={id:id||('b_'+uid()),name:g('sbr_name').value.trim(),logo,sort:Number(g('sbr_sort').value||0)};
  const {error}=await sb.from('site_brands').upsert(row);
  if(error){alert('تعذّر الحفظ: '+error.message);return}
  closeModal();await swLoad(true);
}
async function swDelBrand(id){if(!confirm('حذف هذا الشعار؟'))return;const {error}=await sb.from('site_brands').delete().eq('id',id);if(error){alert('تعذّر الحذف: '+error.message);return}closeModal();await swLoad(true);}
async function swImport(kind){
  if(!confirm('استيراد البيانات الحالية من الموقع؟ (آمن — لن تُكرَّر إن استوردتها سابقاً)'))return;
  const tbl=kind==='works'?'site_works':'site_brands',data=kind==='works'?SEED_WORKS:SEED_BRANDS;
  const {error}=await sb.from(tbl).upsert(data);
  if(error){alert('تعذّر الاستيراد: '+error.message);return}
  await swLoad(true);
}
