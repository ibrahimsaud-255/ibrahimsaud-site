/*
 * 04-home.js — الرئيسيّة: الخلفيّة والكروت ومؤقّت التركيز والصلاة
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== WALLPAPER (خلفية الشاشة) ===== */
const WALLS=[
  {key:'none',name:'بدون',css:'var(--panel2)'},
  {key:'aurora',name:'شفق ذهبي',css:'radial-gradient(1200px 620px at 82% -12%, rgba(245,166,35,.22), transparent 60%), radial-gradient(900px 520px at 0% 100%, rgba(99,102,241,.14), transparent 55%), #0a0a0b'},
  {key:'noir',name:'نوار',css:'radial-gradient(1000px 720px at 50% -5%, #18181c, #0a0a0b 72%)'},
  {key:'sand',name:'رمل دافئ',css:'linear-gradient(160deg, #15110a 0%, #0a0a0b 60%)'},
  {key:'mesh',name:'شبكة',css:'radial-gradient(620px 420px at 14% 18%, rgba(245,166,35,.13), transparent 60%), radial-gradient(720px 520px at 86% 82%, rgba(45,212,191,.11), transparent 60%), #0a0a0b'},
  {key:'royal',name:'ملكي',css:'radial-gradient(900px 600px at 100% 0%, rgba(168,85,247,.18), transparent 55%), #0a0a0b'},
  {key:'ocean',name:'محيط',css:'radial-gradient(1100px 640px at 80% -10%, rgba(14,165,233,.20), transparent 58%), radial-gradient(800px 520px at 8% 100%, rgba(20,184,166,.13), transparent 55%), #0a0c10'},
  {key:'ember',name:'جمر',css:'radial-gradient(1000px 620px at 85% -8%, rgba(239,68,68,.16), transparent 58%), radial-gradient(760px 480px at 4% 105%, rgba(245,166,35,.13), transparent 55%), #0c0908'},
  {key:'forest',name:'غابة',css:'radial-gradient(1000px 640px at 20% -10%, rgba(34,197,94,.15), transparent 60%), linear-gradient(180deg,#0a0f0b,#0a0a0b 72%)'},
  {key:'plum',name:'برقوق',css:'radial-gradient(1000px 640px at 100% 0%, rgba(217,70,239,.17), transparent 55%), radial-gradient(700px 500px at 0% 100%, rgba(99,102,241,.13), transparent 55%), #0b0910'},
  {key:'slate',name:'رمادي',css:'linear-gradient(160deg,#12141a,#0a0a0b 66%)'},
  {key:'twilight',name:'شفق أزرق',css:'radial-gradient(1100px 640px at 80% -12%, rgba(59,130,246,.16), transparent 58%), radial-gradient(760px 480px at 6% 104%, rgba(168,85,247,.12), transparent 55%), #0a0b10'},
  {key:'rose',name:'وردي داكن',css:'radial-gradient(1000px 620px at 84% -8%, rgba(244,63,94,.14), transparent 58%), linear-gradient(180deg,#100a0c,#0a0a0b 70%)'},
  {key:'teal',name:'زمرّدي',css:'radial-gradient(1000px 640px at 18% -10%, rgba(20,184,166,.15), transparent 60%), linear-gradient(180deg,#0a0f0f,#0a0a0b 72%)'},
  // خلفيات فاتحة (تظهر فقط في النظام الفاتح)
  {key:'dawn',name:'فجر',light:true,css:'radial-gradient(1100px 640px at 85% -10%, #ffdcc6, transparent 60%), radial-gradient(900px 560px at 0% 100%, #ffe6f0, transparent 55%), #fdf6f1'},
  {key:'sky',name:'سماء',light:true,css:'radial-gradient(1100px 640px at 82% -12%, #d3e8ff, transparent 60%), linear-gradient(180deg,#eef6ff,#e6f0fb)'},
  {key:'mist',name:'ضباب',light:true,css:'radial-gradient(1000px 620px at 80% -8%, #dfe9f4, transparent 60%), linear-gradient(180deg,#eff2f7,#e8edf3)'},
  {key:'linen',name:'كتّان',light:true,css:'linear-gradient(160deg,#f8f2e9,#efe7db)'},
  {key:'meadow',name:'مروج',light:true,css:'radial-gradient(1000px 620px at 18% -10%, #d9f1e0, transparent 60%), linear-gradient(180deg,#eff7f1,#e7f2eb)'},
  {key:'lavender',name:'خزامى',light:true,css:'radial-gradient(1000px 620px at 84% -10%, #e7ddff, transparent 60%), linear-gradient(180deg,#f3eefb,#ece6f6)'},
];
/* خلفيات النظام الجاهزة (آبل macOS) — قابلة للاختيار افتراضياً */
const WALL_IMAGES=[
  {key:'tahoe-dark',name:'Tahoe داكن',url:'./wallpapers/tahoe-dark.jpg'},
  {key:'tahoe-flow',name:'Tahoe تدفّق',url:'./wallpapers/tahoe-flow.jpg'},
  {key:'tahoe-blue',name:'Tahoe أزرق',url:'./wallpapers/tahoe-blue.jpg'},
  {key:'tahoe-sunset',name:'Tahoe غروب',url:'./wallpapers/tahoe-sunset.jpg'},
  {key:'sequoia-forest',name:'Sequoia غابة',url:'./wallpapers/sequoia-forest.jpg'},
  {key:'monterey-dark',name:'Monterey داكن',url:'./wallpapers/monterey-dark.jpg'},
  {key:'monterey-black',name:'Monterey أسود',url:'./wallpapers/monterey-black.jpg'},
  {key:'bigsur-color',name:'Big Sur ألوان',url:'./wallpapers/bigsur-color.jpg'},
];
function wpList(){return (S.settings&&S.settings.wallpapers)||[]}
function wpActiveImg(){const w=S.settings&&S.settings.wallpaper;return w&&w.type==='image'?(w.id||'__legacy'):null}
function applyWallpaper(){
  const el=document.querySelector('.shell');if(!el)return;
  const c=document.querySelector('.content');if(c){c.style.background='';c.style.backgroundAttachment=''}
  const w=(S.settings&&S.settings.wallpaper)||null;
  if(!w||w.type==='none'||(w.type==='preset'&&w.key==='none')){el.style.background='';el.style.backgroundAttachment='';return}
  if(w.type==='url'){
    el.style.background=`linear-gradient(rgba(10,10,11,.58),rgba(10,10,11,.80)), url("${w.url}") center/cover no-repeat`;
    el.style.backgroundAttachment='fixed';
  }else if(w.type==='image'){
    let val=w.value;
    if(!val&&w.id){const f=wpList().find(x=>x.id===w.id);val=f&&f.value}
    if(val){
      el.style.background=`linear-gradient(rgba(10,10,11,.62),rgba(10,10,11,.82)), url("${val}") center/cover no-repeat`;
      el.style.backgroundAttachment='fixed';
    }
  }else if(w.type==='preset'){
    const p=WALLS.find(x=>x.key===w.key);el.style.background=p?p.css:'';el.style.backgroundAttachment='fixed';
  }
}
function wpPickUrl(key){const im=WALL_IMAGES.find(x=>x.key===key);if(!im)return;S.settings.wallpaper={type:'url',key:im.key,url:im.url};save();applyWallpaper();wpRenderBody();wpMsg('تم تطبيق الخلفية');}
function wpPick(key){S.settings.wallpaper={type:'preset',key};save();applyWallpaper();wpRenderBody();wpMsg('تم تطبيق الخلفية');}
function wpPickImage(id){const f=wpList().find(x=>x.id===id);if(!f)return;S.settings.wallpaper={type:'image',id:f.id,value:f.value};save();applyWallpaper();wpRenderBody();wpMsg('تم تطبيق الخلفية');}
function wpDelImage(id){
  if(!confirm('حذف هذه الخلفية من خياراتك؟'))return;
  S.settings.wallpapers=wpList().filter(x=>x.id!==id);
  if(wpActiveImg()===id){S.settings.wallpaper={type:'preset',key:'none'};applyWallpaper();}
  save();wpRenderBody();wpMsg('تم حذف الخلفية');
}
function wpMsg(t,bad){const m=document.getElementById('wpMsg');if(m){m.style.color=bad?'var(--bad)':'var(--muted)';m.textContent=t}}
/* ضغط الصورة وتصغيرها قبل الحفظ (حتى لا تتضخم بيانات الحساب) */
function wpCompress(file){return new Promise((res,rej)=>{
  const r=new FileReader();
  r.onload=()=>{const img=new Image();img.onload=()=>{
    const MAX=1920;let{width:w,height:h}=img;if(w>MAX||h>MAX){const k=Math.min(MAX/w,MAX/h);w=Math.round(w*k);h=Math.round(h*k)}
    const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
    try{res(c.toDataURL('image/jpeg',0.82))}catch(e){res(r.result)}
  };img.onerror=rej;img.src=r.result};
  r.onerror=rej;r.readAsDataURL(file);
})}
async function wpUpload(input){
  const files=Array.from(input.files||[]);input.value='';if(!files.length)return;
  if(!S.settings.wallpapers)S.settings.wallpapers=[];
  wpMsg('جارٍ رفع ومعالجة الصور…');
  let lastId=null,ok=0;
  for(const f of files){
    if(!/^image\//.test(f.type))continue;
    if(f.size>12*1024*1024){wpMsg('تم تجاوز صورة كبيرة جداً (أكثر من 12MB).',true);continue}
    try{const data=await wpCompress(f);const id=uid();S.settings.wallpapers.push({id,name:(f.name||'خلفية').replace(/\.[^.]+$/,'').slice(0,28),value:data});lastId=id;ok++;}
    catch(e){wpMsg('تعذّرت معالجة إحدى الصور.',true)}
  }
  if(lastId){S.settings.wallpaper={type:'image',id:lastId,value:S.settings.wallpapers.find(x=>x.id===lastId).value};applyWallpaper();}
  save();wpRenderBody();wpMsg(ok?`تمت إضافة ${ok} خلفية وتطبيق الأخيرة`:'لم تُضَف أي صورة.',!ok);
}
function wpRenderBody(){
  const body=document.getElementById('wpBody');if(!body)return;
  const cur=(S.settings&&S.settings.wallpaper)||{type:'preset',key:'none'};
  const mine=wpList();
  const theme=(S.settings&&S.settings.theme)||'dark';
  const gradients=WALLS.filter(w=>w.key==='none'||(theme==='light'?w.light:!w.light));
  body.innerHTML=`
    <div class="wp-sec-title"><i data-lucide="sun-moon"></i> النظام (يحدّد الخلفيات المتاحة)</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button type="button" class="wp-chip" onclick="setTheme('dark')" style="flex:1;background:linear-gradient(160deg,#1d1d20,#0a0a0b);color:#fff;border:2px solid ${theme==='dark'?'var(--gold)':'var(--line)'}"><i class="inl" data-lucide="moon"></i> داكن</button>
      <button type="button" class="wp-chip" onclick="setTheme('light')" style="flex:1;background:linear-gradient(160deg,#ffffff,#e9eaef);color:#1b1c24;border:2px solid ${theme==='light'?'var(--gold)':'var(--line)'}"><i class="inl" data-lucide="sun"></i> فاتح</button>
    </div>
    <div class="wp-sec-title"><i data-lucide="apple"></i> خلفيات النظام (آبل)</div>
    <div class="wp-grid">
      ${WALL_IMAGES.map(im=>{const active=cur.type==='url'&&cur.key===im.key;return `<div class="wp-chip img" onclick="wpPickUrl('${im.key}')" style="background-image:url('${im.url}');border:2px solid ${active?'var(--gold)':'var(--line)'}" title="${esc(im.name)}"><span>${active?'<i class="inl" data-lucide="check"></i> مُفعّلة':esc(im.name)}</span></div>`}).join('')}
    </div>
    <div class="wp-sec-title"><i data-lucide="palette"></i> خلفيات متدرّجة (${theme==='light'?'فاتحة':'داكنة'})</div>
    <div class="wp-grid">
      ${gradients.map(w=>`<button type="button" class="wp-chip" onclick="wpPick('${w.key}')" style="background:${w.css};color:${w.light?'#1b1c24':'#fff'};border:2px solid ${cur.type==='preset'&&cur.key===w.key?'var(--gold)':'var(--line)'}">${w.name}</button>`).join('')}
    </div>
    <div class="wp-sec-title"><i data-lucide="images"></i> صوري المرفوعة ${mine.length?`<span style="color:var(--muted);font-weight:600">(${mine.length})</span>`:''}</div>
    ${mine.length?`<div class="wp-grid">
      ${mine.map(im=>{const active=cur.type==='image'&&cur.id===im.id;return `<div class="wp-chip img" onclick="wpPickImage('${im.id}')" style="background-image:url('${im.value}');border:2px solid ${active?'var(--gold)':'var(--line)'}" title="${esc(im.name)}"><button class="wp-del" onclick="event.stopPropagation();wpDelImage('${im.id}')" title="حذف">×</button><span>${active?'<i class="inl" data-lucide="check"></i> مُفعّلة':esc(im.name)}</span></div>`}).join('')}
    </div>`:`<p style="color:var(--muted);font-size:13px;margin:0 0 14px">لا توجد صور بعد — ارفع صورك أدناه لتظهر هنا كخيارات دائمة.</p>`}`;
  refreshIcons();
}
function wallpaperModal(){
  openModal('خلفية الشاشة',`
    <p style="color:var(--muted);margin:0 0 16px;font-size:13px">اختر خلفية جاهزة بالهوية، أو ارفع صورك الخاصة لتُحفَظ كخيارات دائمة تختار منها وقتما شئت. كل شيء يُحفظ في حسابك ويُزامَن.</p>
    <div id="wpBody"></div>
    <div class="field" style="margin-top:6px"><label>رفع صور خلفية (يمكن اختيار أكثر من صورة)</label><input type="file" id="wpFile" accept="image/*" multiple onchange="wpUpload(this)"></div>
    <div id="wpMsg" style="font-size:12px;color:var(--muted);margin-top:6px"></div>`,
    ()=>closeModal());
  wpRenderBody();
}
function navName(id){const n=NAV.find(x=>x.id===id)||LAUNCH.find(x=>x.id===id);return n?n.name:(id==='settings'?'الإعدادات':id)}
/* تطبيقات «تحت التجربة» تُخفى من الشريط الجانبي — تظل داخل صفحة «تحت التجربة» فقط */
function navItems(){
  if(WS_DEMO)return NAV.filter(n=>n.id==='workspace');
  const lab=new Set(labApps());
  return NAV.filter(n=>n.id==='lab'||!lab.has(n.id));
}
function renderNav(){const items=navItems();document.getElementById('nav').innerHTML=items.map(n=>n.href?`<a href="${n.href}"><span class="nic"><i data-lucide="${n.icon}"></i></span> ${esc(n.name)}</a>`:`<a data-v="${n.id}" onclick="go('${n.id}')"><span class="nic"><i data-lucide="${n.icon}"></i></span> ${esc(n.name)}</a>`).join('');refreshIcons()}
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  const open=sb.classList.toggle('open');
  // على الجوال: اقفل الدرَج عند الضغط خارجه (خلف الغطاء)
  if(open){
    setTimeout(()=>{
      const closeOnOutside=(e)=>{
        if(!sb.contains(e.target) && !e.target.closest('.menu-toggle')){
          sb.classList.remove('open');
          document.removeEventListener('click',closeOnOutside,true);
        }
      };
      document.addEventListener('click',closeOnOutside,true);
    },0);
  }
}
// اقفل الدرَج تلقائياً عند اختيار عنصر من القائمة (تنقّل)
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: document.addEventListener('click',(e)=>{ */
/* طي/فتح القائمة على سطح المكتب */
function toggleSidebarCollapse(){
  const sh=document.querySelector('.shell');if(!sh)return;
  const c=sh.classList.toggle('sb-collapsed');
  try{localStorage.setItem('sb_collapsed',c?'1':'0')}catch(e){}
  const ic=document.querySelector('#sbToggle i');
  if(ic){ic.setAttribute('data-lucide',c?'panel-right-open':'panel-right-close')}
  refreshIcons();
}
/* قائمة مرنة: سحب الحافة لتكبير/تصغير العرض (محفوظ) */
function initSidebarShell(){
  const sb=document.getElementById('sidebar');const sh=document.querySelector('.shell');
  if(!sb||!sh)return;
  // استعادة العرض والحالة المحفوظة
  const savedW=parseInt(localStorage.getItem('sb_w')||'',10);
  if(savedW>=200&&savedW<=460)document.documentElement.style.setProperty('--sb-w',savedW+'px');
  if(localStorage.getItem('sb_collapsed')==='1'){sh.classList.add('sb-collapsed');const ic=document.querySelector('#sbToggle i');if(ic)ic.setAttribute('data-lucide','panel-right-open')}
  if(sb.__rz)return;sb.__rz=1;
  const h=document.createElement('div');h.className='sb-resizer';h.title='اسحب لتغيير عرض القائمة';sb.appendChild(h);
  let drag=false,startX=0,startW=0;
  h.addEventListener('pointerdown',e=>{drag=true;startX=e.clientX;startW=sb.getBoundingClientRect().width;sh.classList.add('sb-resizing');h.setPointerCapture(e.pointerId);e.preventDefault()});
  h.addEventListener('pointermove',e=>{if(!drag)return;const w=Math.max(200,Math.min(460,startW+(startX-e.clientX)));document.documentElement.style.setProperty('--sb-w',w+'px')});
  const end=()=>{if(!drag)return;drag=false;sh.classList.remove('sb-resizing');const w=Math.round(sb.getBoundingClientRect().width);try{localStorage.setItem('sb_w',w)}catch(e){}};
  h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
}
function refreshIcons(){try{if(window.lucide)lucide.createIcons()}catch(e){}}
let CUR='home';
function go(view){CUR=view;document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active',a.dataset.v===view));const t=document.getElementById('ctTitle');if(t)t.textContent=navName(view);(RENDER[view]||renderHome)();refreshIcons();const sb=document.getElementById('sidebar');if(sb)sb.classList.remove('open')}
function rerender(){(RENDER[CUR]||renderHome)()}

/* ===== HOME (branded) — كروت مركّبة قابلة للتخصيص ===== */
const HOME_WIDGETS=[
  {key:'focus',label:'تركيز اليوم الواعي',size:'wide',default:true},
  {key:'prayer',label:'مواقيت الصلاة',size:'wide',default:true},
  {key:'kpi_collected',label:'محصّل الشهر حتى الآن',size:'stat',default:true},
  {key:'kpi_due',label:'مستحقات غير مدفوعة',size:'stat',default:true},
  {key:'kpi_habits',label:'عادات اليوم (عدد)',size:'stat',default:true},
  {key:'kpi_visits',label:'زيارات اليوم',size:'stat',default:true},
  {key:'kpi_month_vs_last',label:'شهر جاري مقارنةً بالماضي',size:'stat',default:false},
  {key:'kpi_open_quotes',label:'عروض أسعار مفتوحة',size:'stat',default:false},
  {key:'kpi_pipeline_open',label:'خط المبيعات المفتوح',size:'stat',default:false},
  {key:'kpi_month_sales_count',label:'مبيعات هذا الشهر (عدد)',size:'stat',default:false},
  {key:'revenue_6m',label:'الإيرادات المحصّلة — آخر ٦ أشهر',size:'wide',default:true},
  {key:'habits_list',label:'قائمة عادات اليوم',size:'card',default:true},
  {key:'followups',label:'متابعات العملاء',size:'card',default:true},
  {key:'recent_invoices',label:'آخر الفواتير',size:'card',default:true},
  {key:'upcoming_appts',label:'مواعيد قادمة',size:'card',default:true},
  {key:'pipeline_mini',label:'مسار العملاء — مختصر',size:'card',default:false},
];
function homeCfg(){if(!S.home)S.home={};if(!Array.isArray(S.home.widgets))S.home.widgets=HOME_WIDGETS.filter(w=>w.default).map(w=>w.key);return S.home}
function homeHasWidget(k){return homeCfg().widgets.includes(k)}
function homeToggleWidget(k){const c=homeCfg();const i=c.widgets.indexOf(k);if(i>-1)c.widgets.splice(i,1);else c.widgets.push(k);save();renderHome();}
function homeResetWidgets(){S.home={widgets:HOME_WIDGETS.filter(w=>w.default).map(w=>w.key)};save();renderHome();}
function homeCustomizeModal(){const rows=HOME_WIDGETS.map(w=>{const on=homeHasWidget(w.key);return `<button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:flex-start;text-align:right" onclick="homeToggleWidget('${w.key}')"><i data-lucide="${on?'check-circle':'circle'}"></i> ${esc(w.label)} <span style="opacity:.55;font-size:11px;margin-inline-start:auto">${w.size==='stat'?'مؤشّر':w.size==='wide'?'عريض':'كارت'}</span></button>`}).join('');
  openModal('تخصيص الرئيسية',`
    <div style="opacity:.7;font-size:13px;margin-bottom:12px">اختر ما تريد ظهوره في صفحتك الرئيسية. التعديل يُحفظ فوراً.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">${rows}</div>
    <div style="margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="homeResetWidgets()"><i data-lucide="rotate-ccw"></i> إعادة للافتراضي</button></div>
  `,null);setTimeout(refreshIcons,0);}

/* — بيانات مشتركة تستخدمها كروت الرئيسية — */
function homeMonthCollected(ymKey){const ym=ymKey||today().slice(0,7);return S.invoices.reduce((a,inv)=>{const pays=(inv.payments&&inv.payments.length)?inv.payments:(inv.status==='paid'?[{date:inv.paidDate||inv.date,amount:invTotal(inv)}]:[]);return a+pays.filter(p=>(p.date||'').slice(0,7)===ym).reduce((s,p)=>s+Number(p.amount||0),0)},0)}
function homeRevenueMonths(count){const months=[];const now=new Date();for(let i=(count||6)-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k=ymKey(d);months.push({k,lbl:d.toLocaleDateString('ar',{month:'short'}),v:homeMonthCollected(k)})}return months}

/* — كل كارت مستقل — يعيد HTML — */
function widgetHTML(k){
  const H=hb();
  switch(k){
    case 'focus':return `<div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="brain"></i> تركيز اليوم الواعي</h3><div id="focusWidget"></div></div>`;
    case 'prayer':return `<div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="moon-star"></i> مواقيت الصلاة</h3><div id="prayerWidget"></div></div>`;
    case 'revenue_6m':{const ms=homeRevenueMonths(6);const maxM=Math.max(1,...ms.map(m=>m.v));return `<div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="trending-up"></i> الإيرادات المحصّلة — آخر ٦ أشهر <span style="color:var(--muted);font-weight:400;font-size:12px">· حيّ · حسب تواريخ المدفوعات المسجّلة على الفواتير فقط</span></h3>
      <div style="display:flex;align-items:flex-end;gap:14px;height:170px;padding-top:10px">${ms.map(m=>`<div style="flex:1;text-align:center;cursor:help" title="${esc(m.lbl)} · ${esc(m.k)} — ${money(m.v)}\n(يُحتسب من مدفوعات الفواتير المسجّلة في هذا الشهر — السجل لا يشمل عروض الأسعار قبل تحويلها لفاتورة)"><div style="height:${Math.round(m.v/maxM*130)}px;background:linear-gradient(180deg,var(--gold2),var(--gold));border-radius:7px 7px 0 0;min-height:3px"></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${m.lbl}</div><div style="font-size:11px">${m.v?Math.round(m.v):''}</div></div>`).join('')}</div></div>`;}
    case 'habits_list':{const habTotal=H.list.length;const habDone=H.list.filter(h=>habitDone(h.id)).length;const pendingHabits=H.list.filter(h=>!habitDone(h.id));const pendingPrayers=PRAYERS.filter(pr=>!prayerGet(pr[0]));return `<div class="card"><h3><i data-lucide="repeat"></i> عادات اليوم <span style="color:var(--muted);font-weight:400;font-size:13px">${habDone}/${habTotal}</span></h3>
      ${pendingHabits.length?pendingHabits.map(h=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)"><button onclick="toggleHabit('${h.id}')" title="تم" style="flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--line);background:transparent;cursor:pointer"></button><span class="inl" style="color:${h.color}">${iconHTML(h.icon,'circle',16)}</span><span style="flex:1">${esc(h.name)}</span>${habitStreak(h.id)>0?`<span style="display:inline-flex;align-items:center;gap:2px;color:#f59e0b;font-size:12px;font-weight:700"><i data-lucide="flame" style="width:13px;height:13px"></i>${habitStreak(h.id)}</span>`:''}</div>`).join(''):(habTotal?'<p style="color:var(--good)"><i class="inl" data-lucide="check-check"></i> أنجزت كل عاداتك اليوم، أحسنت!</p>':'<p style="color:var(--muted)">لا عادات بعد.</p>')}
      <div style="margin-top:10px;font-size:13px;color:${pendingPrayers.length?'var(--muted)':'var(--good)'}"><i class="inl" data-lucide="moon-star"></i> ${pendingPrayers.length?'صلوات لم تُسجَّل: '+pendingPrayers.map(p=>p[1]).join('، '):'سجّلت كل صلوات اليوم'}</div>
      <button class="btn btn-ghost btn-sm" onclick="go('habits')" style="margin-top:10px"><i data-lucide="arrow-left-to-line"></i> إدارة العادات والتتبّع</button></div>`;}
    case 'followups':{const followUps=dueFollowUps();const rotting=rottingClients();return `<div class="card"><h3><i data-lucide="bell"></i> متابعات العملاء ${rotting.length?`<span class="rot-tag">· ${rotting.length} راكد</span>`:''}</h3>
      ${followUps.length?followUps.slice(0,6).map(c=>`<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="go('contacts');openClient('${c.id}')">
        ${clientAvatar(c,28)}<div style="flex:1;min-width:0"><div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</div>
        <div style="color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.nextAction)}</div></div>
        ${dueChip(c.nextDate)}</div>`).join(''):'<p style="color:var(--good)"><i class="inl" data-lucide="check-check"></i> ما فيه متابعات مستحقّة اليوم.</p>'}
      <button class="btn btn-ghost btn-sm" onclick="go('pipeline')" style="margin-top:10px"><i data-lucide="git-branch"></i> افتح مسار العملاء</button></div>`;}
    case 'recent_invoices':return `<div class="card"><h3>آخر الفواتير</h3>${miniList(S.invoices.slice(-5).reverse(),i=>`${esc(i.client)} — ${money(invTotal(i))} ${pill(i.status)}`,'لا فواتير')}</div>`;
    case 'upcoming_appts':{const upcoming=S.appointments.filter(a=>a.datetime>=new Date().toISOString()).sort((a,b)=>a.datetime.localeCompare(b.datetime));return `<div class="card"><h3>مواعيد قادمة</h3>${miniList(upcoming.slice(0,5),a=>`${esc(a.title)} — ${a.datetime.replace('T',' ')}`,'لا مواعيد')}</div>`;}
    case 'pipeline_mini':{const pipeAll=(S.contacts||[]).filter(inPipeline);const pipeRows=S.clientStages.filter(st=>!st.final).map(st=>({label:st.label,n:pipeAll.filter(c=>c.stageKey===st.key).length}));const mx=Math.max(1,...pipeRows.map(r=>r.n));const openVal=pipeAll.filter(c=>!clientStage(c).final).reduce((a,c)=>a+Number(c.value||0),0);return `<div class="card"><h3><i data-lucide="git-branch"></i> مسار العملاء <span style="color:var(--muted);font-weight:400;font-size:12px">· مفتوح ${money(openVal)}</span></h3>
      ${pipeRows.map(r=>`<div style="margin:7px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${esc(r.label)}</span><b>${r.n}</b></div><div style="height:8px;background:var(--panel3);border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(r.n/mx*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></i></div></div>`).join('')}
      <button class="btn btn-ghost btn-sm" onclick="go('pipeline')" style="margin-top:8px"><i data-lucide="arrow-left-to-line"></i> افتح اللوحة</button></div>`;}
  }
  return '';
}

function statHTML(k){
  const H=hb();const ym=today().slice(0,7);const monthLbl=new Date().toLocaleDateString('ar-EG-u-nu-latn',{month:'long'});
  switch(k){
    case 'kpi_collected':return `<div class="stat"><span class="ic"><i data-lucide="wallet"></i></span><div class="v">${money(homeMonthCollected(ym))}</div><div class="l">محصّل ${esc(monthLbl)} حتى الآن</div></div>`;
    case 'kpi_due':{const due=S.invoices.filter(i=>i.status==='unpaid'||i.status==='partial').reduce((a,i)=>a+invDue(i),0);return `<div class="stat"><span class="ic"><i data-lucide="hourglass"></i></span><div class="v">${money(due)}</div><div class="l">مستحقات غير مدفوعة</div></div>`;}
    case 'kpi_habits':{const habTotal=H.list.length;const habDone=H.list.filter(h=>habitDone(h.id)).length;return `<div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="repeat"></i></span><div class="v">${habDone}/${habTotal}</div><div class="l">عادات اليوم</div></div>`;}
    case 'kpi_visits':return `<div class="stat"><span class="ic"><i data-lucide="eye"></i></span><div class="v" id="homeVisits">…</div><div class="l">زيارات اليوم</div></div>`;
    case 'kpi_month_vs_last':{const now=new Date();const cur=homeMonthCollected(now.toISOString().slice(0,7));const prev=new Date(now.getFullYear(),now.getMonth()-1,1);const prevV=homeMonthCollected(prev.toISOString().slice(0,7));const delta=prevV?Math.round((cur-prevV)/prevV*100):(cur?100:0);const col=delta>=0?'#22c55e':'#ef4444';return `<div class="stat"><span class="ic"><i data-lucide="chart-line"></i></span><div class="v">${money(cur)}<span style="font-size:12px;color:${col};margin-inline-start:6px">${delta>=0?'▲':'▼'} ${Math.abs(delta)}%</span></div><div class="l">مقابل ${money(prevV)} الشهر الماضي</div></div>`;}
    case 'kpi_open_quotes':{const oq=(S.sales||[]).filter(q=>q.status==='draft'||q.status==='sent').length;return `<div class="stat"><span class="ic"><i data-lucide="file-text"></i></span><div class="v">${oq}</div><div class="l">عروض أسعار مفتوحة</div></div>`;}
    case 'kpi_pipeline_open':{const pipeOpen=(S.contacts||[]).filter(inPipeline).filter(c=>!clientStage(c).final).reduce((a,c)=>a+Number(c.value||0),0);return `<div class="stat"><span class="ic"><i data-lucide="git-branch"></i></span><div class="v">${money(pipeOpen)}</div><div class="l">قيمة خط المبيعات المفتوح</div></div>`;}
    case 'kpi_month_sales_count':{const n=(S.sales||[]).filter(s=>(s.date||'').slice(0,7)===ym).length;return `<div class="stat"><span class="ic"><i data-lucide="trending-up"></i></span><div class="v">${n}</div><div class="l">عروض/مبيعات هذا الشهر</div></div>`;}
  }
  return '';
}

function renderHome(){
  const cfg=homeCfg();
  const active=cfg.widgets;
  const stats=HOME_WIDGETS.filter(w=>w.size==='stat'&&active.includes(w.key)).map(w=>statHTML(w.key)).join('');
  const wide=HOME_WIDGETS.filter(w=>w.size==='wide'&&active.includes(w.key)).map(w=>widgetHTML(w.key)).join('');
  const cards=HOME_WIDGETS.filter(w=>w.size==='card'&&active.includes(w.key)).map(w=>widgetHTML(w.key)).join('');
  document.getElementById('main').innerHTML=`
    <div class="hero-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><h1>أهلاً ${esc(S.settings.owner)}</h1><p>نظرة سريعة على أعمالك — أدِر كل شيء من مكان واحد.</p></div>
      <button class="glass-btn" onclick="homeCustomizeModal()" title="تخصيص الرئيسية"><i data-lucide="sliders-horizontal"></i> تخصيص</button></div>
      <div class="quick">
        <button onclick="go('invoicing');docModal('invoice')"><i data-lucide="receipt-text"></i> فاتورة</button>
        <button onclick="go('sales');docModal('sale')"><i data-lucide="file-text"></i> عرض سعر</button>
        <button onclick="go('projects');projModal()"><i data-lucide="clapperboard"></i> مشروع</button>
        <button onclick="go('appointments');apptModal()"><i data-lucide="calendar-plus"></i> موعد</button>
        <button onclick="go('habits')"><i data-lucide="repeat"></i> عادة</button>
      </div></div>
    ${wide?`<div class="grid" style="margin-bottom:24px">${wide}</div>`:''}
    ${stats?`<div class="stats">${stats}</div>`:''}
    ${cards?`<div class="grid">${cards}</div>`:''}`;
  applyWallpaper();if(active.includes('focus'))paintFocus();if(active.includes('prayer')){loadPrayer();startPrayerTicker();}if(active.includes('kpi_visits'))loadHomeVisits();refreshIcons();
}
async function loadHomeVisits(){const el=document.getElementById('homeVisits');if(!el)return;try{
  const since1=new Date(Date.now()-864e5).toISOString();
  const day=await sb.from('pageviews').select('*',{count:'exact',head:true}).gte('created_at',since1);
  if(day.error)throw day.error;el.textContent=Number(day.count||0).toLocaleString('en-US');
}catch(e){el.textContent='—';el.title='لتفعيل العدّاد شغّل supabase/analytics.sql'}}

/* ===== FOCUS TIMER + PRAYER (نظام تركيز إسلامي) ===== */
let FOCUS={running:false,sinceBreak:0,breakUntil:0,iv:null,lastPrayer:''};
let PRAYER={date:'',timings:null,loading:false};
let AC=null;
function localDay(){const d=new Date();const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function focusSec(){return (S.focus&&S.focus.log&&S.focus.log[localDay()])||0}
function fmtMS(s){return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')}
function beep(times){if(S.focus&&S.focus.soundOn===false)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();let t=AC.currentTime;for(let i=0;i<(times||2);i++){const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.3,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);o.start(t);o.stop(t+0.37);t+=0.45;}}catch(e){}}
function notifyMe(title,body){try{if(window.Notification){if(Notification.permission==='granted'){new Notification(title,{body})}else if(Notification.permission!=='denied'){Notification.requestPermission().then(p=>{if(p==='granted')new Notification(title,{body})})}}}catch(e){}}
function startFocus(){if(FOCUS.running)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){}if(window.Notification&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}FOCUS.running=true;FOCUS.breakUntil=0;if(FOCUS.iv)clearInterval(FOCUS.iv);FOCUS.iv=setInterval(focusTick,1000);paintFocus();}
function pauseFocus(){FOCUS.running=false;if(FOCUS.iv){clearInterval(FOCUS.iv);FOCUS.iv=null}save();paintFocus();}
function resetFocusToday(){if(!confirm('تصفير ساعات تركيز اليوم؟'))return;if(!S.focus.log)S.focus.log={};S.focus.log[localDay()]=0;FOCUS.sinceBreak=0;FOCUS.breakUntil=0;save();paintFocus();}
function focusTick(){
  if(!S.focus.log)S.focus.log={};const k=localDay();
  if(FOCUS.breakUntil){if(Date.now()>=FOCUS.breakUntil){FOCUS.breakUntil=0;FOCUS.sinceBreak=0;beep(2);notifyMe('انتهى البريك','يلا نكمّل تركيز');}paintFocus();return;}
  S.focus.log[k]=(S.focus.log[k]||0)+1;FOCUS.sinceBreak++;
  if(S.focus.log[k]%15===0)save();
  const everySec=(S.focus.breakEveryMin||50)*60;
  if(FOCUS.sinceBreak>=everySec){FOCUS.breakUntil=Date.now()+(S.focus.breakLenMin||10)*60000;beep(3);notifyMe('وقت البريك',`خذ راحة ${S.focus.breakLenMin||10} دقائق ثم نكمّل.`);}
  checkPrayerAlert();paintFocus();
}
function paintFocus(){const el=document.getElementById('focusWidget');if(!el)return;el.innerHTML=focusInner();refreshIcons();}
function focusInner(){
  const sec=focusSec();const goal=(S.focus.goalMin||180)*60;const pct=Math.min(100,Math.round(sec/goal*100));
  const hh=Math.floor(sec/3600),mm=Math.floor(sec%3600/60),ss=sec%60;const fmt=hh+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
  const goalH=Math.round(((S.focus.goalMin||180)/60)*10)/10;
  const inBreak=FOCUS.breakUntil&&Date.now()<FOCUS.breakUntil;const breakLeft=inBreak?Math.ceil((FOCUS.breakUntil-Date.now())/1000):0;
  const everySec=(S.focus.breakEveryMin||50)*60;const toBreak=Math.max(0,everySec-FOCUS.sinceBreak);
  const done=sec>=goal;
  return `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
    <div style="width:118px;height:118px;border-radius:50%;background:conic-gradient(${done?'var(--good)':'var(--gold)'} ${pct}%, rgba(255,255,255,.10) 0);display:grid;place-items:center;flex:0 0 auto;box-shadow:0 6px 18px rgba(0,0,0,.3)">
      <div style="width:94px;height:94px;border-radius:50%;background:rgba(20,20,24,.42);backdrop-filter:blur(12px) saturate(150%);-webkit-backdrop-filter:blur(12px) saturate(150%);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.14);display:grid;place-items:center;text-align:center">
        <div><div style="font-size:21px;font-weight:900">${pct}%</div><div style="font-size:11px;color:var(--muted)">من ${goalH} ساعات</div></div></div></div>
    <div style="flex:1;min-width:200px">
      <div style="font-size:13px;color:var(--muted)">${inBreak?'<i class="inl" data-lucide="coffee"></i> وقت البريك':(done?'<i class="inl" data-lucide="party-popper"></i> أكملت هدف اليوم':'<i class="inl" data-lucide="timer"></i> تركيز اليوم')}</div>
      <div style="font-size:33px;font-weight:900;letter-spacing:1px">${inBreak?fmtMS(breakLeft):fmt}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:2px">${inBreak?'استرح ثم نكمّل':(FOCUS.running?`البريك القادم بعد ${fmtMS(toBreak)}`:'اضغط «ابدأ» لتشغيل العدّاد الواعي')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${FOCUS.running?`<button class="btn btn-ghost btn-sm" onclick="pauseFocus()"><i data-lucide="pause"></i> إيقاف مؤقت</button>`:`<button class="btn btn-gold btn-sm" onclick="startFocus()"><i data-lucide="play"></i> ابدأ التركيز</button>`}
        <button class="btn btn-ghost btn-sm" onclick="focusSettings()"><i data-lucide="settings"></i> إعدادات</button>
        <button class="btn btn-ghost btn-sm" onclick="resetFocusToday()">تصفير</button>
      </div></div></div>`;
}
function focusSettings(){const f=S.focus;openModal('إعدادات التركيز',`
  <div class="row2"><div class="field"><label>هدف التركيز اليومي (دقائق)</label><input id="f_goal" type="number" inputmode="decimal" value="${f.goalMin||180}">${amtChipsHTML('f_goal',[30,60,120])}</div>
  <div class="field"><label>بريك كل (دقائق)</label><input id="f_be" type="number" inputmode="decimal" value="${f.breakEveryMin||50}"></div></div>
  <div class="row2"><div class="field"><label>مدة البريك (دقائق)</label><input id="f_bl" type="number" inputmode="decimal" value="${f.breakLenMin||10}"></div>
  <div class="field"><label>التنبيه الصوتي</label><select id="f_snd"><option value="1" ${f.soundOn!==false?'selected':''}>مفعّل</option><option value="0" ${f.soundOn===false?'selected':''}>صامت</option></select></div></div>
  <div class="badge-note"><i data-lucide="target"></i> <div>الهدف الافتراضي ٣ ساعات تركيز واعٍ يومياً. عند بلوغ مدة البريك يصدر تنبيه صوتي وإشعار.</div></div>`,
  ()=>{const g=i=>document.getElementById(i).value;f.goalMin=Number(g('f_goal'))||180;f.breakEveryMin=Number(g('f_be'))||50;f.breakLenMin=Number(g('f_bl'))||10;f.soundOn=g('f_snd')==='1';save();closeModal();paintFocus();});}
/* ----- مواقيت الصلاة (Aladhan API) ----- */
function loadPrayer(force){const day=localDay();if(!force&&PRAYER.date===day&&PRAYER.timings){paintPrayer();return;}if(PRAYER.loading)return;PRAYER.loading=true;paintPrayer();
  const p=S.prayer||{};const url='https://api.aladhan.com/v1/timingsByCity?city='+encodeURIComponent(p.city||'الرياض')+'&country='+encodeURIComponent(p.country||'Saudi Arabia')+'&method='+(p.method||4);
  fetch(url).then(r=>r.json()).then(j=>{if(j&&j.data&&j.data.timings){PRAYER.timings=j.data.timings;PRAYER.date=day;}PRAYER.loading=false;paintPrayer();}).catch(()=>{PRAYER.loading=false;paintPrayer();});}
function nextPrayerInfo(){const t=PRAYER.timings;if(!t)return null;const order=[['Fajr','الفجر'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];const now=new Date();
  for(const it of order){const hm=(t[it[0]]||'').slice(0,5).split(':');const d=new Date();d.setHours(+hm[0]||0,+hm[1]||0,0,0);if(d>now)return {name:it[1],at:d};}
  const fj=(t.Fajr||'05:00').slice(0,5).split(':');const d=new Date();d.setDate(d.getDate()+1);d.setHours(+fj[0]||5,+fj[1]||0,0,0);return {name:'الفجر',at:d};}
function fmt12(hhmm){if(!hhmm)return '—';const a=hhmm.slice(0,5).split(':');let h=+a[0];const m=a[1];const ap=h<12?'ص':'م';h=h%12;if(h===0)h=12;return h+':'+m+' '+ap;}
function paintPrayer(){const el=document.getElementById('prayerWidget');if(!el)return;el.innerHTML=prayerInner();refreshIcons();}
function prayerInner(){
  if(PRAYER.loading&&!PRAYER.timings)return '<p style="color:var(--muted)">…جارٍ تحميل مواقيت الصلاة</p>';
  const t=PRAYER.timings;if(!t)return '<p style="color:var(--muted)">تعذّر تحميل المواقيت. <button class="link-btn" onclick="loadPrayer(true)">إعادة المحاولة</button></p>';
  const order=[['Fajr','الفجر'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
  const np=nextPrayerInfo();const now=new Date();const cd=np?Math.max(0,Math.floor((np.at-now)/1000)):0;const ch=Math.floor(cd/3600),cm=Math.floor(cd%3600/60);
  const adOn=adhanEnabled();
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px">
      <div style="font-size:13px;color:var(--muted);display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="inl"><i data-lucide="map-pin"></i></span> ${esc((S.prayer&&S.prayer.city)||'الرياض')} <button class="link-btn" onclick="prayerSettings()"><i class="inl" data-lucide="settings-2"></i> تغيير</button>
        <button class="link-btn" title="${adOn?'إيقاف الأذان':'تفعيل الأذان'}" onclick="toggleAdhan()"><i class="inl" data-lucide="${adOn?'volume-2':'volume-x'}"></i> ${adOn?'الأذان مفعّل':'الأذان مُعطّل'}</button>
        <button class="link-btn" title="تجربة الأذان" onclick="playAdhan()"><i class="inl" data-lucide="play"></i> تجربة</button></div>
      ${np?`<div style="font-size:13px">القادمة: <b style="color:var(--gold2)">${np.name}</b> بعد ${ch>0?ch+'س ':''}${cm}د</div>`:''}</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;text-align:center">
      ${order.map(it=>{const isNext=np&&np.name===it[1];return `<div style="background:${isNext?'rgba(245,166,35,.18)':'rgba(255,255,255,.05)'};backdrop-filter:blur(8px) saturate(140%);-webkit-backdrop-filter:blur(8px) saturate(140%);border:1px solid ${isNext?'var(--gold)':'rgba(255,255,255,.10)'};border-radius:10px;padding:8px 3px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)"><div style="font-size:12px;color:var(--muted)">${it[1]}</div><div style="font-weight:800;font-size:13px">${fmt12(t[it[0]])}</div></div>`}).join('')}
    </div>`;
}
/* ----- الأذان: تشغيل صوت عمر هشام العربي عند دخول الوقت (يمكن تعطيله) ----- */
let ADHAN_AUDIO=null;
function adhanEnabled(){return (S.prayer&&S.prayer.adhan!==false)}
function playAdhan(){
  if(!adhanEnabled())return;
  try{
    if(!ADHAN_AUDIO){ADHAN_AUDIO=new Audio('/media/adhan.m4a');ADHAN_AUDIO.preload='auto';}
    ADHAN_AUDIO.currentTime=0;
    const p=ADHAN_AUDIO.play();if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
function stopAdhan(){try{if(ADHAN_AUDIO){ADHAN_AUDIO.pause();ADHAN_AUDIO.currentTime=0;}}catch(e){}}
function toggleAdhan(){if(!S.prayer)S.prayer={};S.prayer.adhan=!(S.prayer.adhan!==false);if(!S.prayer.adhan)stopAdhan();save();paintPrayer();}
function checkPrayerAlert(){const t=PRAYER.timings;if(!t)return;const now=new Date();const hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const names={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
  for(const k in names){if((t[k]||'').slice(0,5)===hm){const tag=localDay()+k;if(FOCUS.lastPrayer!==tag){FOCUS.lastPrayer=tag;playAdhan();notifyMe('حان وقت '+names[k],'الصلاة خير من العمل');if(FOCUS.running)pauseFocus();}}}}
function prayerSettings(){const p=S.prayer||{};openModal('مواقيت الصلاة — الموقع',`
  <div class="field"><label>المدينة</label><input id="pr_city" value="${esc(p.city||'الرياض')}"></div>
  <div class="field"><label>الدولة (بالإنجليزية)</label><input id="pr_country" value="${esc(p.country||'Saudi Arabia')}" placeholder="Saudi Arabia"></div>
  <div class="field"><label>طريقة الحساب</label><select id="pr_method"><option value="4" ${(p.method||4)==4?'selected':''}>أم القرى (السعودية)</option><option value="3" ${p.method==3?'selected':''}>رابطة العالم الإسلامي</option><option value="2" ${p.method==2?'selected':''}>ISNA (أمريكا)</option><option value="5" ${p.method==5?'selected':''}>الهيئة المصرية</option></select></div>
  <button type="button" class="btn btn-ghost btn-sm" onclick="prayerGeo()"><i data-lucide="map-pin"></i> استخدم موقعي تلقائياً</button>`,
  ()=>{const g=i=>document.getElementById(i).value;S.prayer={city:g('pr_city').trim()||'الرياض',country:g('pr_country').trim()||'Saudi Arabia',method:Number(g('pr_method'))||4};save();closeModal();loadPrayer(true);});}
function prayerGeo(){if(!navigator.geolocation){alert('الموقع غير متاح في متصفحك');return}navigator.geolocation.getCurrentPosition(pos=>{const la=pos.coords.latitude,lo=pos.coords.longitude;PRAYER.loading=true;
  fetch('https://api.aladhan.com/v1/timings?latitude='+la+'&longitude='+lo+'&method='+((S.prayer&&S.prayer.method)||4)).then(r=>r.json()).then(j=>{if(j&&j.data&&j.data.timings){PRAYER.timings=j.data.timings;PRAYER.date=localDay();S.prayer=Object.assign(S.prayer||{},{city:'موقعي',latlng:[la,lo]});save();}PRAYER.loading=false;closeModal();paintPrayer();}).catch(()=>{PRAYER.loading=false;alert('تعذّر تحديد الموقع')});},()=>alert('تعذّر الوصول للموقع'));}
function startPrayerTicker(){if(window.__ptick)return;window.__ptick=setInterval(()=>{try{checkPrayerAlert();paintPrayer();checkHabitReminders()}catch(e){}},15000);}
