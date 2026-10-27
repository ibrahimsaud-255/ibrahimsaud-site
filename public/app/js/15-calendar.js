/*
 * 15-calendar.js — التقويم (محرّك خاصّ على طراز تقويم Apple) + المواعيد + لوحات المعلومات
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 *
 * التقويم: عرض يوم/أسبوع/شهر/سنة/قائمة، سحب للإنشاء والنقل والتمديد، تكرار،
 * تنبيهات، تقويمات ملوّنة، ومزامنة ثنائيّة مع Google Calendar بلا خادم.
 * المخزن: S.appointments (يبقى datetime+duration متّسقين للقرّاء القدامى)،
 * وS.calendars، وS.settings.google={clientId,linked,pushTo,email,delQ}.
 * رمز Google يبقى في الذاكرة فقط (CALX.g.tok) — لا يُحفظ أبداً.
 */
/* ===== التقويم: ثوابت وحالة ===== */
// كلّ الحالة الحيّة في كائن خامل واحد يُملأ عند أوّل عرض
const CALX={gIn:null,v:null,d:null,mm:null,q:'',sel:null,occ:{},pop:null,draft:null,drag:null,sideM:false,st:null,init:false,needR:false,fired:null,undo:null,ask:null,tt:0,rzT:0,moreBtn:null,
  g:{tok:null,exp:0,cals:[],ev:[],st:'off',msg:'',rk:'',busy:false,tried:false}};
const CAL_DEF=[{id:'work',name:'العمل',color:'#E8C766'},{id:'personal',name:'شخصي',color:'#3b82f6'},{id:'clients',name:'مواعيد العملاء',color:'#22c55e'}];
const CAL_SW=['#E8C766','#f59e0b','#ef4444','#ec4899','#a855f7','#6366f1','#3b82f6','#2dd4bf','#22c55e','#a1a1aa'];
const CAL_DOW=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
const CAL_DW1=['س','ح','ن','ث','ر','خ','ج'];
const CAL_VIEWS=[['day','يوم'],['week','أسبوع'],['month','شهر'],['year','سنة'],['agenda','قائمة']];
const CAL_REP=[['none','لا يتكرّر'],['daily','يومياً'],['weekly','أسبوعياً'],['monthly','شهرياً'],['yearly','سنوياً']];
const CAL_RU={daily:'يوم',weekly:'أسبوع',monthly:'شهر',yearly:'سنة'};
const CAL_AL=[['','بلا تنبيه'],['0','وقت الحدث'],['5','قبل 5 دقائق'],['15','قبل 15 دقيقة'],['30','قبل 30 دقيقة'],['60','قبل ساعة'],['1440','قبل يوم']];
const CAL_STS=[['scheduled','مجدول'],['done','تم'],['cancelled','ملغى']];
const CAL_HH=48; // ارتفاع الساعة بالبكسل في شبكة اليوم/الأسبوع
const CAL_GAPI='https://www.googleapis.com/calendar/v3';

/* ===== التقويم: أدوات التاريخ (كلّها بالتوقيت المحلّي) ===== */
function cP(n){return String(n).padStart(2,'0')}
function cKey(d){return d.getFullYear()+'-'+cP(d.getMonth()+1)+'-'+cP(d.getDate())}
function cDT(d){return cKey(d)+'T'+cP(d.getHours())+':'+cP(d.getMinutes())}
function fcFmt(d){return cDT(d)}
function cParse(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);return m?new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):null}
function cDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function cAdd(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,d.getHours(),d.getMinutes())}
function cDiff(a,b){return Math.round((cDay(a)-cDay(b))/864e5)}
function cWkStart(d){const x=cDay(d);return cAdd(x,-((x.getDay()+1)%7))} // السبت أوّل الأسبوع
function cMin(d){return d.getHours()*60+d.getMinutes()}
function cAtMin(day,min){return new Date(day.getFullYear(),day.getMonth(),day.getDate(),0,min)}
function cSnapD(t){return new Date(Math.round(t/9e5)*9e5)} // ١٥ دقيقة
function cTime(d){let h=d.getHours();const m=d.getMinutes(),ap=h<12?'ص':'م';h=h%12||12;return h+(m?':'+cP(m):'')+' '+ap}
function cFmt(d,o){return d.toLocaleDateString('ar-EG-u-nu-latn',o)}
function calInk(c){const m=/^#?([0-9a-f]{6})$/i.exec(c||'');if(!m)return '#fff';const n=parseInt(m[1],16),l=(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255;return l>.6?'#1a1205':'#fff'}

/* ===== التقويم: البيانات ===== */
function calCals(){if(!Array.isArray(S.calendars)||!S.calendars.length)S.calendars=CAL_DEF.map(c=>({...c}));return S.calendars}
function calHide(){return uiPref('calHide',{})}
function calShown(id){return !calHide()[id]}
function calToggle(id){const h={...calHide()};if(h[id])delete h[id];else h[id]=1;setUiPref('calHide',h);calRender()}
function calInfo(id){
  if(id&&id.startsWith('g:')){const g=CALX.g.cals.find(c=>'g:'+c.id===id);return g?{id,name:g.summaryOverride||g.summary,color:g.backgroundColor||'#3b82f6',g:1,ro:!/owner|writer/.test(g.accessRole)}:{id,name:'Google',color:'#3b82f6',g:1}}
  const L=calCals();return L.find(c=>c.id===id)||L.find(c=>c.id==='clients')||L[0]}
function calGCfg(){S.settings=S.settings||{};S.settings.google=S.settings.google||{};return S.settings.google}
function calNewCal(){const g=calGCfg();if(g.pushTo&&g.linked)return 'g:'+g.pushTo;const d=uiPref('calDefault','work');return calCals().some(c=>c.id===d)?d:calCals()[0].id}
// يكمل الحقول الجديدة ويُبقي datetime+duration متّسقين للقرّاء القدامى (end حصريّ دائماً)
function calNorm(a){
  if(!a.calId)a.calId='clients';
  const s=cParse(a.datetime);if(!s)return a;
  let e=cParse(a.end);if(!e||e<=s)e=new Date(s.getTime()+(Number(a.duration)||60)*6e4);
  if(a.allDay){const s0=cDay(s);let e0=cDay(e);if(e0<e)e0=cAdd(e0,1);if(e0<=s0)e0=cAdd(s0,1);calSetSpan(a,s0,e0)}else calSetSpan(a,s,e);
  return a}
function calSetSpan(a,s,e){a.datetime=cDT(s);a.end=cDT(e);a.duration=Math.round((e-s)/6e4)}
// يوسّع التكرار: يستدعي push لكلّ بداية ضمن [from,to)
function calRepeat(a,s0,dur,from,to,push){
  const r=a.repeat;if(!r||!r.f||r.f==='none'){push(s0);return}
  const n=Math.max(1,+r.n||1),until=r.until?cAdd(cParse(r.until),1):null,ex=new Set(r.ex||[]),D=s0.getDate();
  let i0=0;const back=new Date(from.getTime()-dur);
  if(back>s0){if(r.f==='daily'||r.f==='weekly')i0=Math.floor(cDiff(back,s0)/(r.f==='daily'?n:7*n))-1;
    else if(r.f==='monthly')i0=Math.floor(((back.getFullYear()-s0.getFullYear())*12+back.getMonth()-s0.getMonth())/n)-1;
    else i0=Math.floor((back.getFullYear()-s0.getFullYear())/n)-1}
  i0=Math.max(0,i0);
  for(let i=i0;i<i0+3000;i++){let s;
    if(r.f==='daily')s=cAdd(s0,i*n);else if(r.f==='weekly')s=cAdd(s0,i*7*n);
    else if(r.f==='monthly'){s=new Date(s0.getFullYear(),s0.getMonth()+i*n,D,s0.getHours(),s0.getMinutes());if(s.getDate()!==D)continue}
    else{s=new Date(s0.getFullYear()+i*n,s0.getMonth(),D,s0.getHours(),s0.getMinutes());if(s.getMonth()!==s0.getMonth())continue}
    if(s>=to||(until&&s>=until))break;
    if(s.getTime()+dur<=from.getTime()||ex.has(cKey(s)))continue;
    push(s)}}
// كلّ ما يظهر بين from وto: محلّي (مع التكرار) + Google (ذاكرة) + فواتير مستحقّة. all=تجاهل الإخفاء
function calOccs(from,to,all){
  const out=[],gIds=new Set(),vis=id=>all||calShown(id),L=(S.appointments||[]).slice();if(CALX.draft)L.push(CALX.draft);
  L.forEach(a=>{if(!a||!a.datetime)return;calNorm(a);if(a.googleId)gIds.add(a.googleId);const dr=a===CALX.draft;if(!dr&&!vis(a.calId))return;
    const c=calInfo(a.calId),s0=cParse(a.datetime),dur=cParse(a.end)-s0;
    calRepeat(a,s0,dur,from,to,s=>{const e=new Date(s.getTime()+dur);if(e>from&&s<to)out.push({k:dr?'draft':a.id+'|'+cKey(s),id:a.id,a,s,e,all:!!a.allDay,c:c.color,ro:false,src:dr?'draft':'l'})})});
  CALX.g.ev.forEach(x=>{if(gIds.has(x.googleId)||(x.recurringEventId&&gIds.has(x.recurringEventId))||!vis(x.calId))return;
    const s=cParse(x.datetime),e=cParse(x.end);if(!s||!e)return;const c=calInfo(x.calId);if(e>from&&s<to)out.push({k:x.id,id:x.id,a:x,s,e,all:!!x.allDay,c:c.color,ro:!!c.ro,src:'g'})});
  if(vis('inv'))(S.invoices||[]).forEach(i=>{if(!i.date||!(invDue(i)>0))return;const s=cParse(i.date);if(!s)return;const e=cAdd(s,1);
    if(e>from&&s<to)out.push({k:'inv_'+i.id,id:'inv_'+i.id,inv:i.id,a:{title:'فاتورة #'+(i.number||'')+' · '+resolveClientName(i),calId:'inv'},s,e,all:true,c:'#ef4444',ro:true,src:'inv'})});
  return out.sort((x,y)=>x.s-y.s||(y.e-y.s)-(x.e-x.s))}
function calIsAll(o){return o.all||(o.e-o.s)>=864e5}

/* ===== التقويم: الهيكل والتنقّل ===== */
function renderAppointments(){renderCalendar()} // «المواعيد» اندمجت في التقويم
function renderCalendar(){
  calCSS();calInit();
  document.getElementById('main').innerHTML=`<div class="cx${uiPref('calSide',true)?'':' side-off'}${CALX.sideM?' side-open':''}" id="cx">
   <div class="cx-bar">
    <button class="cx-ib" onclick="calSideToggle()" title="التقويمات"><i data-lucide="panel-right"></i></button>
    <button class="cx-ib" onclick="calNew()" title="حدث جديد (N)"><i data-lucide="plus"></i></button>
    <h2 class="cx-title" id="cxTitle"></h2>
    <div class="cx-seg" id="cxSeg">${CAL_VIEWS.map(([k,t],i)=>`<button data-v="${k}" onclick="calView('${k}')" title="${t}${i<4?' (⌘'+(i+1)+')':''}">${t}</button>`).join('')}</div>
    <div class="cx-nav"><button class="cx-ib" onclick="calStep(-1)" title="السابق"><i data-lucide="chevron-right"></i></button><button class="cx-tb" onclick="calToday()" title="اليوم (T)">اليوم</button><button class="cx-ib" onclick="calStep(1)" title="التالي"><i data-lucide="chevron-left"></i></button></div>
    <div class="cx-search"><i data-lucide="search"></i><input id="cxQ" placeholder="بحث (⌘F)" value="${esc(CALX.q)}" oninput="calSearch(this.value)" onkeydown="if(event.key==='Escape'){this.value='';calSearch('');this.blur()}"></div>
    <button class="cx-pill" id="cxGPill" onclick="calSettings()"></button>
    <button class="cx-ib" onclick="calSettings()" title="الإعدادات وربط Google"><i data-lucide="settings"></i></button>
   </div>
   <div class="cx-body"><aside class="cx-side" id="cxSide"></aside><div class="cx-scrim" onclick="calSideToggle()"></div><section class="cx-view" id="cxView"></section></div></div>`;
  const v=document.getElementById('cxView');v.onpointerdown=calPD;v.ondblclick=calDbl;
  CALX.st=null;calRender();calGAuto();
}
function calInit(){
  if(!CALX.d)CALX.d=cDay(new Date());if(!CALX.v)CALX.v=uiPref('calView','week');if(!CALX.mm)CALX.mm=new Date(CALX.d.getFullYear(),CALX.d.getMonth(),1);
  if(CALX.init)return;CALX.init=true;
  calCals();let ch=false;(S.appointments||[]).forEach(a=>{const b=JSON.stringify(a);calNorm(a);if(JSON.stringify(a)!==b)ch=true});if(ch)save();
  document.addEventListener('keydown',calKey);document.addEventListener('pointerdown',calDocPD,true);window.addEventListener('resize',calOnResize);
  try{CALX.fired=new Set(JSON.parse(localStorage.getItem('calFired')||'[]'))}catch(_){CALX.fired=new Set()}
  setInterval(calTick,30000);calTick();
}
function calRange(){const d=CALX.d;switch(CALX.v){
  case 'day':return [cDay(d),cAdd(cDay(d),1)];
  case 'week':{const s=cWkStart(d);return [s,cAdd(s,7)]}
  case 'month':{const s=cWkStart(new Date(d.getFullYear(),d.getMonth(),1));return [s,cAdd(s,42)]}
  case 'year':return [new Date(d.getFullYear(),0,1),new Date(d.getFullYear()+1,0,1)];
  default:return [cDay(d),cAdd(cDay(d),30)]}}
function calTitle(f,t){const d=CALX.d,l=cAdd(t,-1);switch(CALX.v){
  case 'day':return cFmt(d,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  case 'week':return f.getMonth()===l.getMonth()?cFmt(f,{month:'long',year:'numeric'}):cFmt(f,{month:'long'})+' – '+cFmt(l,{month:'long',year:'numeric'});
  case 'month':return cFmt(d,{month:'long',year:'numeric'});
  case 'year':return String(d.getFullYear());
  default:return cFmt(f,{day:'numeric',month:'short'})+' – '+cFmt(l,{day:'numeric',month:'short',year:'numeric'})}}
function calRender(){
  const v=document.getElementById('cxView');if(!v)return;
  if(CALX.pop&&CALX.pop.modal&&!document.getElementById('ce_title')){if(CALX.draft===CALX.pop.a)CALX.draft=null;CALX.pop=null}
  if(CALX.pop&&!CALX.pop.modal)calPopClose(true,true);
  calMoreClose();CALX.needR=false;
  const [f,t]=calRange(),days=CALX.v==='day'?[cDay(CALX.d)]:CALX.v==='week'?Array.from({length:7},(_,i)=>cAdd(f,i)):null;
  document.getElementById('cxTitle').textContent=CALX.q?'نتائج البحث':calTitle(f,t);
  document.querySelectorAll('#cxSeg button').forEach(b=>b.classList.toggle('on',!CALX.q&&b.dataset.v===CALX.v));
  document.getElementById('cxSide').innerHTML=calSideHTML();
  const sc=document.getElementById('cxScroll');if(sc&&CALX.st!==null)CALX.st=sc.scrollTop;
  CALX.occ={};
  v.className='cx-view v-'+(CALX.q?'search':CALX.v);
  v.innerHTML=CALX.q?calSearchHTML():days?calWeekHTML(days):CALX.v==='month'?calMonthHTML():CALX.v==='year'?calYearHTML():calAgendaHTML();
  const s2=document.getElementById('cxScroll');
  if(s2){if(CALX.st===null){const n=new Date(),inR=n>=f&&n<t;s2.scrollTop=Math.max(0,(inR?cMin(n)-90:450)*CAL_HH/60)}else s2.scrollTop=CALX.st;CALX.st=s2.scrollTop}
  calMarkSel();calGPill();refreshIcons();
  if(CALX.g.tok)calGSync();
}
function calView(v){CALX.v=v;CALX.q='';const q=document.getElementById('cxQ');if(q)q.value='';setUiPref('calView',v);CALX.st=null;calRender()}
function calSyncMM(){CALX.mm=new Date(CALX.d.getFullYear(),CALX.d.getMonth(),1)}
function calStep(n){const d=CALX.d;
  CALX.d=CALX.v==='day'?cAdd(d,n):CALX.v==='week'?cAdd(d,7*n):CALX.v==='month'?new Date(d.getFullYear(),d.getMonth()+n,1):CALX.v==='year'?new Date(d.getFullYear()+n,0,1):cAdd(d,30*n);
  calSyncMM();calRender()}
function calToday(){CALX.d=cDay(new Date());calSyncMM();CALX.st=null;calRender()}
function calGoDay(k){CALX.d=cParse(k);CALX.v='day';CALX.q='';const q=document.getElementById('cxQ');if(q)q.value='';setUiPref('calView','day');calSyncMM();CALX.st=null;calRender()}
function calGoMonth(y,m){CALX.d=new Date(y,m,1);CALX.v='month';setUiPref('calView','month');calSyncMM();calRender()}
function calMini(k){CALX.d=cParse(k);if(CALX.sideM){CALX.sideM=false;document.getElementById('cx').classList.remove('side-open')}calRender()}
function calMiniStep(n){CALX.mm=new Date(CALX.mm.getFullYear(),CALX.mm.getMonth()+n,1);document.getElementById('cxSide').innerHTML=calSideHTML();refreshIcons()}
function calSideToggle(){const cx=document.getElementById('cx');if(!cx)return;
  if(innerWidth<=760){CALX.sideM=!CALX.sideM;cx.classList.toggle('side-open',CALX.sideM);return}
  setUiPref('calSide',!uiPref('calSide',true));cx.classList.toggle('side-off',!uiPref('calSide',true));if(CALX.v==='month')calRender()}
function calSearch(v){CALX.q=v;calRender()}
function calNew(){const n=new Date(),[f,t]=calRange();let s;
  if(n>=f&&n<t&&CALX.v!=='year'){s=new Date(n);s.setMinutes(0,0,0);s.setHours(s.getHours()+1)}else s=cAtMin(CALX.d,540);
  calOpenDraft(s,new Date(s.getTime()+36e5))}
function calOnResize(){clearTimeout(CALX.rzT);CALX.rzT=setTimeout(()=>{if(document.getElementById('cxView')&&!CALX.pop&&!CALX.drag&&CALX.v==='month')calRender()},180)}

/* ===== التقويم: الشريط الجانبيّ ===== */
function calSideHTML(){
  const mm=CALX.mm,st=cWkStart(mm),[f,t]=calRange(),tk=today(),rng=CALX.v==='day'||CALX.v==='week',has={};
  calOccs(st,cAdd(st,42)).forEach(o=>{has[cKey(o.s)]=1});
  let cells=CAL_DW1.map(x=>`<span>${x}</span>`).join('');
  for(let i=0;i<42;i++){const d=cAdd(st,i),k=cKey(d);cells+=`<button class="${d.getMonth()!==mm.getMonth()?'o ':''}${k===tk?'t ':''}${rng&&d>=f&&d<t?'r ':''}${has[k]?'e':''}" onclick="calMini('${k}')">${d.getDate()}</button>`}
  const row=(id,name,color,ed,sub)=>`<label class="cx-cal"><input type="checkbox" ${calShown(id)?'checked':''} onchange="calToggle('${esc(id)}')" style="accent-color:${color}"><span class="cx-cn">${esc(name)}</span>${sub?`<small>${sub}</small>`:''}${ed?`<button class="cx-cal-ed" onclick="event.preventDefault();calCalEdit('${ed}')" title="تعديل"><i data-lucide="pencil"></i></button>`:''}</label>`;
  const G=CALX.g,cfg=calGCfg();
  const gh=G.cals.length?G.cals.map(c=>row('g:'+c.id,c.summaryOverride||c.summary,c.backgroundColor||'#3b82f6','',/owner|writer/.test(c.accessRole)?'':'قراءة')).join('')
    :cfg.clientId?`<button class="cx-side-btn" onclick="calGConnect()"><i data-lucide="link"></i> ${cfg.linked?'إعادة الاتصال':'اتصال بـ Google'}</button>`
    :`<button class="cx-side-btn" onclick="calSettings()"><i data-lucide="settings"></i> إعداد ربط Google</button>`;
  return `<div class="cx-mini-h"><button class="cx-ib sm" onclick="calMiniStep(-1)"><i data-lucide="chevron-right"></i></button><b>${cFmt(mm,{month:'long',year:'numeric'})}</b><button class="cx-ib sm" onclick="calMiniStep(1)"><i data-lucide="chevron-left"></i></button></div>
   <div class="cx-mini">${cells}</div>
   <div class="cx-grp"><h5>على هذا الجهاز</h5>${calCals().map(c=>row(c.id,c.name,c.color,c.id)).join('')}${row('inv','فواتير مستحقّة','#ef4444','')}
    <button class="cx-side-btn" onclick="calCalEdit()"><i data-lucide="plus"></i> تقويم جديد</button></div>
   <div class="cx-grp"><h5>Google</h5>${gh}</div>
   <div class="cx-grp"><button class="cx-side-btn" onclick="exportICS()"><i data-lucide="download"></i> تصدير الكلّ ‎.ics</button></div>`}
function calCalEdit(id){const L=calCals(),c=id?L.find(x=>x.id===id):{id:'',name:'',color:CAL_SW[L.length%CAL_SW.length]};if(!c)return;
  openModal(id?'تعديل التقويم':'تقويم جديد',`<div class="field"><label>الاسم</label><input id="cc_n" value="${esc(c.name)}" placeholder="مثال: التصوير"></div>
   <div class="field"><label>اللون</label><div class="cx-sw">${CAL_SW.map(s=>`<button type="button" class="${s===c.color?'on':''}" style="background:${s}" onclick="calSwPick(this,'${s}')"></button>`).join('')}<input type="color" id="cc_c" value="${c.color}"></div></div>`,
  ()=>{const n=document.getElementById('cc_n').value.trim();if(!n){alert('أدخل الاسم');return}c.name=n;c.color=document.getElementById('cc_c').value;if(!id){c.id=uid();L.push(c)}save();closeModal();calRender()},
  id&&L.length>1?()=>{if(!confirm('حذف التقويم؟ تنتقل أحداثه إلى تقويم آخر.'))return;S.calendars=L.filter(x=>x.id!==id);const to=S.calendars.find(x=>x.id==='clients')||S.calendars[0];(S.appointments||[]).forEach(a=>{if(a.calId===id)a.calId=to.id});save();closeModal();calRender()}:null)}
function calSwPick(b,s){document.querySelectorAll('.cx-sw button').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.getElementById('cc_c').value=s}

/* ===== التقويم: عرض يوم/أسبوع ===== */
function calWeekHTML(days){
  const n=days.length,f=days[0],t=cAdd(days[n-1],1),occ=calOccs(f,t),tk=today(),nowM=cMin(new Date());
  occ.forEach(o=>CALX.occ[o.k]=o);
  const ad=calLanes(occ.filter(calIsAll),f,n);
  const head=days.map(d=>{const k=cKey(d),w=(d.getDay()+1)%7;return `<div class="cx-dh${k===tk?' today':''}" onclick="calGoDay('${k}')"><span class="l">${CAL_DOW[w]}</span><span class="s">${CAL_DW1[w]}</span> <b>${d.getDate()}</b></div>`}).join('');
  const hrs=Array.from({length:24},(_,h)=>`<div class="cx-hl"><span>${h?cTime(new Date(2000,0,1,h)):''}</span></div>`).join('');
  const cols=days.map(d=>{const k=cKey(d),d0=d.getTime(),d1=cAdd(d,1).getTime();
    const segs=calCols(occ.filter(o=>!calIsAll(o)&&o.s<d1&&o.e>d0).map(o=>({o,a:Math.max(0,(o.s-d0)/6e4),b:Math.min(1440,(o.e-d0)/6e4)})));
    return `<div class="cx-col${k===tk?' today':''}${[5,6].includes(d.getDay())?' wk':''}" data-d="${k}">${segs.map(calEvHTML).join('')}${k===tk?`<div class="cx-now" style="top:${nowM*CAL_HH/60}px"></div>`:''}</div>`}).join('');
  const vw=(document.getElementById('cxView')||{}).clientWidth||900,nar=(vw-54)/n<92;
  return `<div class="cx-wk${nar?' nar':''}"><div class="cx-whead"><div class="cx-gut"></div>${head}</div>
   <div class="cx-wad"><div class="cx-gut">طوال اليوم</div><div class="cx-adrow" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${ad.items.map(x=>calBarHTML(x,'a')).join('')}</div></div>
   <div class="cx-wscroll" id="cxScroll"><div class="cx-wgrid" style="height:${24*CAL_HH}px"><div class="cx-gut cx-hrs">${hrs}</div><div class="cx-cols">${cols}</div></div></div></div>`}
// تخطيط المتداخلات جنباً إلى جنب: عناقيد متداخلة، وكلّ حدث في أوّل عمود فارغ
function calCols(segs){segs.sort((x,y)=>x.a-y.a||y.b-x.b);let cl=[],ends=[],mx=-1;
  const fl=()=>{cl.forEach(x=>x.n=ends.length);cl=[];ends=[]};
  segs.forEach(x=>{const b=Math.max(x.b,x.a+20);if(cl.length&&x.a>=mx){fl();mx=-1}let c=ends.findIndex(e=>e<=x.a);if(c<0){c=ends.length;ends.push(b)}else ends[c]=b;x.c=c;cl.push(x);mx=Math.max(mx,b)});
  fl();return segs}
// مسارات الأشرطة الممتدّة (طوال اليوم/الشهر) داخل صفّ من n أيّام
function calLanes(items,f,n){const lanes=[],res=[];
  items.forEach(o=>{const c0=Math.max(0,cDiff(o.s,f)),c1=Math.min(n-1,cDiff(new Date(o.e-1),f));if(c1<c0)return;
    let l=lanes.findIndex(e=>e<c0);if(l<0){l=lanes.length;lanes.push(c1)}else lanes[l]=c1;res.push({o,c0,c1,l})});
  return {items:res,n:lanes.length}}
function calCls(o){const a=o.a;return (a.status==='done'?' st-done':a.status==='cancelled'?' st-cancelled':'')+(o.ro?' ro':'')+(o.src==='draft'?' draft':'')}
function calTT(o){return (o.a.status==='done'?'✓ ':'')+esc(o.a.title||'حدث جديد')}
function calEvHTML(x){const o=x.o,a=o.a,top=x.a*CAL_HH/60,h=Math.max(18,(x.b-x.a)*CAL_HH/60-2),w=100/x.n;
  return `<div class="cx-e cx-ev${calCls(o)}" data-k="${esc(o.k)}" data-m="g" style="--c:${o.c};--ci:${calInk(o.c)};top:${top}px;height:${h}px;inset-inline-start:calc(${x.c*w}% + 1px);width:calc(${w}% - 3px)"><b>${calTT(o)}</b>${h>30?`<span class="tl">${cTime(o.s)}${a.location?' · '+esc(a.location):''}</span>`:''}${o.ro?'':'<i class="cx-rz"></i>'}</div>`}
function calBarHTML(x,m){const o=x.o,all=calIsAll(o);
  return `<div class="cx-e cx-mb ${all?'all':'tmd'}${calCls(o)}" data-k="${esc(o.k)}" data-m="${m}" style="--c:${o.c};--ci:${calInk(o.c)};grid-column:${x.c0+1}/${x.c1+2};grid-row:${x.l+1}">${all?'':'<i class="dt"></i>'}<span class="tt">${calTT(o)}</span>${all?'':`<span class="tm">${cTime(o.s)}</span>`}</div>`}

/* ===== التقويم: عرض الشهر والسنة والقائمة والبحث ===== */
function calMonthHTML(){
  const d=CALX.d,f0=new Date(d.getFullYear(),d.getMonth(),1),st=cWkStart(f0),occ=calOccs(st,cAdd(st,42)),tk=today();
  occ.forEach(o=>CALX.occ[o.k]=o);
  const vh=(document.getElementById('cxView')||{}).clientHeight||600,rowH=Math.max(64,(vh-30)/6),cap=Math.max(1,Math.floor((rowH-30)/21));
  let rows='';
  for(let w=0;w<6;w++){const ws=cAdd(st,w*7),we=cAdd(ws,7),L=calLanes(occ.filter(o=>o.s<we&&o.e>ws),ws,7);let bars;
    if(L.n<=cap)bars=L.items.map(x=>calBarHTML(x,'m')).join('');
    else{const vis=cap-1,hid=[0,0,0,0,0,0,0];bars=L.items.filter(x=>x.l<vis).map(x=>calBarHTML(x,'m')).join('');
      L.items.filter(x=>x.l>=vis).forEach(x=>{for(let c=x.c0;c<=x.c1;c++)hid[c]++});
      bars+=hid.map((h,c)=>h?`<button class="cx-more" style="grid-column:${c+1};grid-row:${vis+1}" onclick="calMore('${cKey(cAdd(ws,c))}',this)">+${h} أخرى</button>`:'').join('')}
    const cells=Array.from({length:7},(_,c)=>{const dd=cAdd(ws,c),k=cKey(dd);return `<div class="cx-mcell${dd.getMonth()!==f0.getMonth()?' other':''}${k===tk?' today':''}${[5,6].includes(dd.getDay())?' wk':''}" data-d="${k}">${dd.getDate()===1?`<span class="cx-mlb">${cFmt(dd,{month:'short'})}</span>`:''}<span class="cx-mnum" onclick="calGoDay('${k}')">${dd.getDate()}</span></div>`}).join('');
    rows+=`<div class="cx-mrow"><div class="cx-mcells">${cells}</div><div class="cx-mev">${bars}</div></div>`}
  const nar=((document.getElementById('cxView')||{}).clientWidth||900)/7<84;
  return `<div class="cx-mon${nar?' nar':''}"><div class="cx-mdow">${CAL_DOW.map((x,i)=>`<div><span class="l">${x}</span><span class="s">${CAL_DW1[i]}</span></div>`).join('')}</div><div class="cx-mrows">${rows}</div></div>`}
function calMore(k,btn){calMoreClose();const d=cParse(k),occ=calOccs(d,cAdd(d,1));occ.forEach(o=>CALX.occ[o.k]=o);CALX.moreBtn=btn;
  const p=document.createElement('div');p.id='cxMore';p.className='cx-pop cx-morep';
  p.innerHTML=`<div class="cx-more-h">${cFmt(d,{weekday:'long',day:'numeric',month:'long'})}</div>${occ.map(o=>`<div class="cx-e cx-mb ${calIsAll(o)?'all':'tmd'}${calCls(o)}" style="--c:${o.c};--ci:${calInk(o.c)}" onclick="calMoreOpen('${esc(o.k)}')">${calIsAll(o)?'':'<i class="dt"></i>'}<span class="tt">${calTT(o)}</span>${calIsAll(o)?'':`<span class="tm">${cTime(o.s)}</span>`}</div>`).join('')}`;
  document.body.appendChild(p);const r=btn.getBoundingClientRect(),W=p.offsetWidth,H=p.offsetHeight;
  p.style.left=Math.max(8,Math.min(innerWidth-W-8,r.left+r.width/2-W/2))+'px';p.style.top=Math.max(8,Math.min(innerHeight-H-8,r.top-H/2))+'px'}
function calMoreOpen(k){const o=CALX.occ[k],b=CALX.moreBtn;calMoreClose();if(o)calClickOcc(o,b&&b.isConnected?b:null)}
function calMoreClose(){const p=document.getElementById('cxMore');if(p)p.remove()}
function calYearHTML(){const y=CALX.d.getFullYear(),f=new Date(y,0,1),cnt={},tk=today(),cm=new Date();
  calOccs(f,new Date(y+1,0,1)).forEach(o=>{let d=cDay(o.s<f?f:o.s);for(let i=0;i<62&&d<o.e;i++,d=cAdd(d,1)){const k=cKey(d);cnt[k]=(cnt[k]||0)+1}});
  let h='';for(let m=0;m<12;m++){const f0=new Date(y,m,1),st=cWkStart(f0);let cells='';
    for(let i=0;i<42;i++){const d=cAdd(st,i),k=cKey(d);if(i%7===0&&i>=28&&d.getMonth()!==m)break;if(d.getMonth()!==m){cells+='<span></span>';continue}
      const c=cnt[k]||0;cells+=`<button class="cx-yd${k===tk?' t':''}${c?' l'+(c>=4?3:c>=2?2:1):''}" onclick="calGoDay('${k}')"${c?` title="${c} أحداث"`:''}>${d.getDate()}</button>`}
    h+=`<div class="cx-ym"><h4 class="${y===cm.getFullYear()&&m===cm.getMonth()?'cur':''}" onclick="calGoMonth(${y},${m})">${cFmt(f0,{month:'long'})}</h4><div class="cx-ydw">${CAL_DW1.map(x=>`<span>${x}</span>`).join('')}</div><div class="cx-ygrid">${cells}</div></div>`}
  return `<div class="cx-year">${h}</div>`}
function calRowHTML(o){const a=o.a;return `<div class="cx-e cx-li${calCls(o)}" data-k="${esc(o.k)}" data-m="l" style="--c:${o.c};--ci:${calInk(o.c)}"><span class="tm">${calIsAll(o)?'طوال اليوم':cTime(o.s)+' – '+cTime(o.e)}</span><i class="bar"></i><span class="tt">${calTT(o)}${a.location?`<small>${esc(a.location)}</small>`:''}${a.contact?`<small>${esc(a.contact)}</small>`:''}</span></div>`}
function calAgendaHTML(){const [f,t]=calRange(),occ=calOccs(f,t),by={},tk=today();occ.forEach(o=>{CALX.occ[o.k]=o;const k=cKey(o.s<f?f:o.s);(by[k]=by[k]||[]).push(o)});
  if(!occ.length)return `<div class="cx-agenda">${emptyBox('calendar-x','لا أحداث في هذه الفترة. اضغط N لإضافة حدث.')}</div>`;
  return `<div class="cx-agenda">${Object.keys(by).sort().map(k=>{const d=cParse(k);return `<div class="cx-ag-day${k===tk?' t':''}"><div class="cx-ag-h"><b>${d.getDate()}</b><span>${cFmt(d,{weekday:'long'})}<small>${cFmt(d,{month:'long',year:'numeric'})}</small></span></div><div class="cx-ag-list">${by[k].map(calRowHTML).join('')}</div></div>`}).join('')}</div>`}
function calSearchHTML(){const q=CALX.q.trim().toLowerCase(),L=S.appointments||[];
  const pool=[...L.map(a=>({a,src:'l'})),...CALX.g.ev.filter(x=>!L.some(a=>a.googleId&&a.googleId===x.googleId)).map(a=>({a,src:'g'}))];
  const hits=pool.filter(({a})=>[a.title,a.location,a.notes,a.contact,a.invitees].some(v=>String(v||'').toLowerCase().includes(q))).map(({a,src})=>{if(src==='l')calNorm(a);const c=calInfo(a.calId),s=cParse(a.datetime),e=cParse(a.end)||s;
    return s&&{k:src==='g'?a.id:a.id+'|'+cKey(s),id:a.id,a,s,e,all:!!a.allDay,c:c.color,ro:src==='g'&&!!c.ro,src}}).filter(Boolean).sort((x,y)=>x.s-y.s);
  hits.forEach(o=>CALX.occ[o.k]=o);
  if(!hits.length)return `<div class="cx-agenda">${emptyBox('search-x','لا نتائج لـ «'+esc(CALX.q)+'»')}</div>`;
  return `<div class="cx-agenda"><div class="cx-sr-h">${hits.length} نتيجة</div>${hits.map(o=>`<div class="cx-sr"><span class="dd">${cFmt(o.s,{day:'numeric',month:'short',year:'numeric'})}${o.a.repeat&&o.a.repeat.f&&o.a.repeat.f!=='none'?' · يتكرّر':''}</span>${calRowHTML(o)}</div>`).join('')}</div>`}
function calMarkSel(){document.querySelectorAll('#cxView .cx-e.sel').forEach(x=>x.classList.remove('sel'));if(CALX.sel)document.querySelectorAll('#cxView .cx-e[data-k="'+CSS.escape(CALX.sel)+'"]').forEach(x=>x.classList.add('sel'))}

/* ===== التقويم: السحب (إنشاء/نقل/تمديد) والنقر ===== */
function calColMin(col,y){const r=col.getBoundingClientRect();return Math.max(0,Math.min(1440,(y-r.top)*60/CAL_HH))}
function calPtTime(col,y){return cAtMin(cParse(col.dataset.d),calColMin(col,y))}
function calColAt(x){return [...document.querySelectorAll('#cxView .cx-col')].find(c=>{const r=c.getBoundingClientRect();return x>=r.left&&x<r.right})}
function calDayAt(x,y,m){if(m==='a'){const c=calColAt(x);return c?cParse(c.dataset.d):null}
  const c=[...document.querySelectorAll('#cxView .cx-mcell')].find(c=>{const r=c.getBoundingClientRect();return x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom});return c?cParse(c.dataset.d):null}
function calPD(e){
  if(e.button)return;const el=e.target.closest('.cx-e');let D;
  if(el){const o=CALX.occ[el.dataset.k];if(!o)return;D={t:e.target.classList.contains('cx-rz')?'rz':'mv',o,el,m:el.dataset.m};
    if(D.m==='g')D.grab=(calPtTime(el.closest('.cx-col'),e.clientY)-o.s)/6e4;
    if(D.m==='m'||D.m==='a')D.d0=calDayAt(e.clientX,e.clientY,D.m)}
  else{const col=e.target.closest('.cx-col');if(!col)return;D={t:e.pointerType==='touch'?'tap':'new',col,m0:Math.floor(calColMin(col,e.clientY)/15)*15}}
  Object.assign(D,{x:e.clientX,y:e.clientY,moved:false});CALX.drag=D;
  addEventListener('pointermove',calPM);addEventListener('pointerup',calPU);addEventListener('pointercancel',calPC)}
function calPM(e){const D=CALX.drag;if(!D)return;
  if(!D.moved){if(Math.abs(e.clientX-D.x)+Math.abs(e.clientY-D.y)<5||D.t==='tap'||(D.o&&(D.o.ro||D.m==='l')))return;
    D.moved=true;if(CALX.pop)calPopClose(true,true);calMoreClose();if(D.el)D.el.classList.add('drag');document.body.classList.add('cx-dragging')}
  e.preventDefault();
  if(D.t==='new'){const m=calColMin(D.col,e.clientY),lo=Math.min(D.m0,Math.floor(m/15)*15),hi=Math.max(D.m0+15,Math.ceil(m/15)*15);D.s=lo;D.e=hi;
    let g=D.g;if(!g){g=D.g=document.createElement('div');g.className='cx-ghost';D.col.appendChild(g)}
    g.style.top=lo*CAL_HH/60+'px';g.style.height=(hi-lo)*CAL_HH/60+'px';g.textContent=cTime(cAtMin(CALX.d,lo))+' – '+cTime(cAtMin(CALX.d,hi));return}
  const o=D.o;
  if(D.m==='g'){
    if(D.t==='rz'){const col=D.el.closest('.cx-col'),m=Math.round(calColMin(col,e.clientY)/15)*15,top=parseFloat(D.el.style.top)*60/CAL_HH,end=Math.max(top+15,m);
      D.el.style.height=(end-top)*CAL_HH/60-2+'px';D.ne=cAtMin(cParse(col.dataset.d),end);if(D.ne-o.s<9e5)D.ne=new Date(o.s.getTime()+9e5);return}
    const col=calColAt(e.clientX)||D.el.closest('.cx-col'),ns=cSnapD(calPtTime(col,e.clientY).getTime()-D.grab*6e4);D.ns=ns;
    if(D.el.parentElement!==col)col.appendChild(D.el);
    Object.assign(D.el.style,{top:(ns-cParse(col.dataset.d))/6e4*CAL_HH/60+'px',insetInlineStart:'1px',width:'calc(100% - 3px)'});
    const tl=D.el.querySelector('.tl');if(tl)tl.textContent=cTime(ns)+' – '+cTime(new Date(ns.getTime()+(o.e-o.s)));return}
  document.querySelectorAll('#cxView .drop').forEach(x=>x.classList.remove('drop'));
  const d=calDayAt(e.clientX,e.clientY,D.m);if(!d||!D.d0)return;D.dd=cDiff(d,D.d0);
  for(let x=cAdd(cDay(o.s),D.dd),z=cAdd(cDay(new Date(o.e-1)),D.dd),i=0;x<=z&&i<62;x=cAdd(x,1),i++)document.querySelectorAll(`#cxView [data-d="${cKey(x)}"]`).forEach(c=>c.classList.add('drop'))}
function calDragEnd(){CALX.drag=null;removeEventListener('pointermove',calPM);removeEventListener('pointerup',calPU);removeEventListener('pointercancel',calPC);document.body.classList.remove('cx-dragging')}
function calPC(){const D=CALX.drag;calDragEnd();if(D&&D.moved)calRender()}
function calPU(){const D=CALX.drag;calDragEnd();if(!D)return;
  if(!D.moved){
    if(D.t==='tap'){const s=cAtMin(cParse(D.col.dataset.d),Math.floor(calColMin(D.col,D.y)/30)*30);calOpenDraft(s,new Date(s.getTime()+36e5));return}
    if(D.t==='new'){CALX.sel=null;calMarkSel();if(CALX.needR&&!CALX.pop)calRender();return}
    calClickOcc(D.o,D.el);return}
  if(D.t==='new'){const day=cParse(D.col.dataset.d);calOpenDraft(cAtMin(day,D.s),cAtMin(day,D.e));return}
  const o=D.o;
  const n0=S.appointments.length;let ns=o.s;
  if(D.t==='rz'&&D.ne)calResize(o,D.ne);else if(D.m==='g'&&D.ns){ns=D.ns;calShift(o,D.ns-o.s,0)}else if(D.dd){ns=cAdd(o.s,D.dd);calShift(o,0,D.dd)}
  const a=o.src==='g'&&S.appointments.length>n0?S.appointments[S.appointments.length-1]:o.a;
  CALX.sel=o.src==='draft'||o.ro?null:a.id+'|'+cKey(ns);calRender()}
function calDbl(e){if(e.target.closest('.cx-e,.cx-more,.cx-mnum'))return;
  const col=e.target.closest('.cx-col');if(col){const s=cAtMin(cParse(col.dataset.d),Math.floor(calColMin(col,e.clientY)/30)*30);return calOpenDraft(s,new Date(s.getTime()+36e5))}
  if(e.target.closest('.cx-adrow')){const c=calColAt(e.clientX);if(c){const s=cParse(c.dataset.d);return calOpenDraft(s,cAdd(s,1),true)}}
  const cell=e.target.closest('.cx-mcell');if(cell){const s=cAtMin(cParse(cell.dataset.d),600);calOpenDraft(s,new Date(s.getTime()+36e5))}}
function calClickOcc(o,el){
  if(o.src==='inv'){docModal('invoice',o.inv,null,()=>go('calendar'));return}
  if(CALX.q){CALX.d=cDay(o.s);calSyncMM()}
  if(CALX.needR){calRender();o=CALX.occ[o.k]||o;el=document.querySelector('#cxView [data-k="'+CSS.escape(o.k)+'"]')}
  CALX.sel=o.k;calMarkSel();calPopOpen(o,el)}
// يحرّك حدثاً (أو سلسلته كاملة) بفارق ms أو بعدد أيّام
function calShift(o,ms,days){if(o.ro||o.src==='inv')return;let a=o.a;if(o.src==='g')a=calAdopt(a);
  const s=cParse(a.datetime),e=cParse(a.end),ns=days?cAdd(s,days):new Date(s.getTime()+ms),ne=days?cAdd(e,days):new Date(e.getTime()+ms),dd=cDiff(ns,s);
  calSetSpan(a,ns,ne);if(dd&&a.repeat&&a.repeat.ex)a.repeat.ex=a.repeat.ex.map(k=>cKey(cAdd(cParse(k),dd)));
  if(CALX.draft===a)return;save();calGPushEv(a,a.calId)}
function calResize(o,ne){if(o.ro)return;let a=o.a;if(o.src==='g')a=calAdopt(a);const s=cParse(a.datetime);calSetSpan(a,s,new Date(s.getTime()+(ne-o.s)));if(CALX.draft===a)return;save();calGPushEv(a,a.calId)}
function calAdopt(x){const a={...x,id:uid()};delete a.ro;delete a.cancelled;CALX.g.ev=CALX.g.ev.filter(y=>y!==x);(S.appointments=S.appointments||[]).push(a);return a}
function calOpenDraft(s,e,all,cal){
  if(CALX.pop&&!CALX.pop.modal)calPopClose(true,true);calInit();
  CALX.draft={id:'draft',title:'',calId:cal||calNewCal(),allDay:!!all,status:'scheduled',alert:'',datetime:cDT(s),end:cDT(e),duration:Math.round((e-s)/6e4)};
  const [f,t]=calRange();if(s<f||s>=t||CALX.q){CALX.d=cDay(s);calSyncMM()}
  if(CALX.q){CALX.q='';const q=document.getElementById('cxQ');if(q)q.value=''}
  calRender();CALX.sel='draft';calMarkSel();
  calPopOpen(CALX.occ.draft||{k:'draft',id:'draft',a:CALX.draft,s,e,all:!!all,c:calInfo(CALX.draft.calId).color,ro:false,src:'draft'},document.querySelector('#cxView [data-k="draft"]'))}

/* ===== التقويم: المحرّر (لوحة جانبيّة على المكتب، نافذة على الجوال) ===== */
function apptModal(id,presetDate){calCSS();calInit();
  if(id){const a=(S.appointments||[]).find(x=>x.id===id);if(!a)return;calNorm(a);const s=cParse(a.datetime);
    if(document.getElementById('cxView')){CALX.d=cDay(s);calSyncMM();CALX.st=null;calRender()}
    const o=Object.values(CALX.occ).find(x=>x.id===id)||{k:id+'|'+cKey(s),id,a,s,e:cParse(a.end),all:!!a.allDay,c:calInfo(a.calId).color,ro:false,src:'l'};
    CALX.sel=o.k;calMarkSel();calPopOpen(o,document.querySelector('#cxView [data-k="'+CSS.escape(o.k)+'"]'));return}
  let s;if(presetDate)s=cAtMin(cParse(presetDate),600);else{s=new Date();s.setMinutes(0,0,0);s.setHours(s.getHours()+1)}
  calOpenDraft(s,new Date(s.getTime()+36e5),false,'clients')}
function calCalOpts(cur){const G=CALX.g.cals.filter(c=>/owner|writer/.test(c.accessRole));let h=calCals().map(c=>`<option value="${c.id}"${c.id===cur?' selected':''}>${esc(c.name)}</option>`).join('');
  if(G.length||(cur||'').startsWith('g:'))h+=`<optgroup label="Google">${G.map(c=>`<option value="g:${esc(c.id)}"${'g:'+c.id===cur?' selected':''}>${esc(c.summaryOverride||c.summary)}</option>`).join('')}${(cur||'').startsWith('g:')&&!G.some(c=>'g:'+c.id===cur)?`<option value="${esc(cur)}" selected>${esc(calInfo(cur).name)}</option>`:''}</optgroup>`;
  return h}
function calFormHTML(o){
  const a=o.a,dis=o.ro?' disabled':'',all=!!a.allDay,eD=all?cAdd(o.e,-1):o.e,r=a.repeat||{},rf=r.f||'none',al=a.alert==null?'':String(a.alert);
  return `<div class="cx-f" onkeydown="calFormKey(event)">
   <input id="ce_title" class="cx-f-t" value="${esc(a.title||'')}" placeholder="حدث جديد"${dis}>
   <input id="ce_loc" class="cx-f-s" value="${esc(a.location||'')}" placeholder="أضف موقعاً أو رابط مكالمة"${dis}>
   <div class="cx-f-sec">
    <label class="cx-f-ck"><input type="checkbox" id="ce_all" ${all?'checked':''} onchange="calFormSync()"${dis}> طوال اليوم</label>
    <div class="cx-f-r"><span>يبدأ</span><input type="date" id="ce_sd" value="${cKey(o.s)}"${dis}><input type="time" id="ce_st" class="tm" step="900" value="${cDT(o.s).slice(11)}"${dis}></div>
    <div class="cx-f-r"><span>ينتهي</span><input type="date" id="ce_ed" value="${cKey(eD)}"${dis}><input type="time" id="ce_et" class="tm" step="900" value="${cDT(o.e).slice(11)}"${dis}></div>
    <div class="cx-f-r"><span>التكرار</span><select id="ce_rep" onchange="calFormSync()"${o.ro||o.src==='g'?' disabled':''}>${CAL_REP.map(([k,t])=>`<option value="${k}"${k===rf?' selected':''}>${t}</option>`).join('')}</select></div>
    <div class="cx-f-r" id="ce_repx"><span>كلّ</span><input type="number" id="ce_rn" class="n" min="1" value="${r.n||1}"><em id="ce_ru"></em><span class="u">حتى</span><input type="date" id="ce_until" value="${r.until||''}" title="اتركه فارغاً للتكرار بلا نهاية"></div>
    <div class="cx-f-r"><span>التنبيه</span><select id="ce_alert"${dis}>${CAL_AL.map(([k,t])=>`<option value="${k}"${al===k?' selected':''}>${t}</option>`).join('')}</select></div>
   </div>
   <div class="cx-f-sec">
    <div class="cx-f-r"><span>التقويم</span><i class="cx-dot" id="ce_dot"></i><select id="ce_cal" onchange="calFormSync()"${dis}>${calCalOpts(a.calId)}</select></div>
    <div class="cx-f-r"><span>المدعوّون</span><input id="ce_inv" value="${esc(a.invitees||'')}" placeholder="بريد أو اسم، مفصولة بفاصلة"${dis}></div>
    <div class="cx-f-r"><span>العميل</span>${clientFieldHTML('ce_contact',a.contact||a.contactId?resolveClientName(a):'')}</div>
    <div class="cx-f-r" id="ce_strow"><span>الحالة</span><select id="ce_status"${dis}>${CAL_STS.map(([k,t])=>`<option value="${k}"${(a.status||'scheduled')===k?' selected':''}>${t}</option>`).join('')}</select></div>
    <div class="cx-f-r"><span>الرابط</span><input id="ce_url" dir="ltr" value="${esc(a.url||'')}" placeholder="https://"${dis}>${a.url?`<a class="cx-ib sm" href="${esc(a.url)}" target="_blank" rel="noopener" title="فتح"><i data-lucide="external-link"></i></a>`:''}</div>
    <textarea id="ce_notes" rows="2" placeholder="ملاحظات"${dis}>${esc(a.notes||'')}</textarea>
   </div></div>`}
function calFormActs(o){const a=o.a,isL=o.src==='l',out=[];
  if(!o.ro&&o.src!=='draft')out.push(`<button class="cx-ib" title="نسخة مكرّرة" onclick="calDup()"><i data-lucide="copy"></i></button>`);
  if(isL&&CALX.g.tok&&!(a.calId||'').startsWith('g:'))out.push(`<button class="cx-tb" onclick="calGCopy()" title="نسخ هذا الحدث إلى Google Calendar"><i data-lucide="cloud-upload"></i> نسخ إلى Google</button>`);
  if(isL)out.push(`<a class="cx-ib" href="${gcal(a)}" target="_blank" rel="noopener" title="أضف إلى Google (رابط)"><i data-lucide="calendar-plus"></i></a><button class="cx-ib" title="تصدير .ics" onclick="exportICS('${a.id}')"><i data-lucide="download"></i></button>`);
  if(a.gLink)out.push(`<a class="cx-ib" href="${esc(a.gLink)}" target="_blank" rel="noopener" title="فتح في Google"><i data-lucide="external-link"></i></a>`);
  if(!o.ro)out.push(`<button class="cx-ib del" title="حذف" onclick="calDelPop()"><i data-lucide="trash-2"></i></button>`);
  return out.join('')}
function calPopOpen(o,anchor){calMoreClose();const P=CALX.pop;if(P){if(P.modal)closeModal();else{const x=document.getElementById('cxPop');if(x)x.remove()}}
  const narrow=innerWidth<=760,isNew=o.src==='draft',ttl=isNew?'حدث جديد':o.ro?'تفاصيل الحدث':'تعديل الحدث';
  CALX.pop={k:o.k,a:o.a,src:o.src,occS:o.s,isNew,ro:o.ro,modal:narrow};
  if(narrow){openModal(ttl,calFormHTML(o)+`<div class="cx-f-acts">${calFormActs(o)}</div>`,()=>calPopClose(true));if(o.ro){const b=document.getElementById('mSave');if(b)b.style.display='none'}
    // الإلغاء/× /النقر خارجاً = تجاهل التعديل وإزالة المسودّة
    const R=document.getElementById('modalRoot'),bg=R.querySelector('.modal-bg'),x=R.querySelector('.modal-head .x'),cn=R.querySelector('.modal-foot .btn-ghost');
    if(bg)bg.onclick=e=>{if(e.target===bg)calPopClose(false)};if(x)x.onclick=()=>calPopClose(false);if(cn)cn.onclick=()=>calPopClose(false);
    calFormSync();return}
  const p=document.createElement('div');p.id='cxPop';p.className='cx-pop';
  p.innerHTML=calFormHTML(o)+`<div class="cx-f-foot">${calFormActs(o)}<span class="sp"></span><button class="btn btn-ghost btn-sm" onclick="calPopClose(false)">${o.ro?'إغلاق':'إلغاء'}</button>${o.ro?'':'<button class="btn btn-gold btn-sm" onclick="calPopClose(true)">حفظ</button>'}</div>`;
  document.body.appendChild(p);calFormSync();refreshIcons();
  const W=p.offsetWidth,H=p.offsetHeight;let x,y;
  if(anchor&&anchor.isConnected){const r=anchor.getBoundingClientRect();x=r.left-W-10;if(x<8)x=r.right+10;if(x+W>innerWidth-8)x=Math.max(8,Math.min(innerWidth-W-8,r.left+r.width/2-W/2));y=r.top-20}
  else{const v=(document.getElementById('cxView')||document.body).getBoundingClientRect();x=v.left+v.width/2-W/2;y=v.top+40}
  p.style.left=Math.max(8,Math.min(innerWidth-W-8,x))+'px';p.style.top=Math.max(8,Math.min(innerHeight-H-8,y))+'px';
  if(isNew){const t=document.getElementById('ce_title');t.focus();t.select()}}
function calFormSync(){const $=id=>document.getElementById(id);if(!$('ce_all'))return;const all=$('ce_all').checked,rf=$('ce_rep').value,cid=$('ce_cal').value;
  $('ce_st').style.display=$('ce_et').style.display=all?'none':'';$('ce_repx').style.display=rf==='none'?'none':'';$('ce_ru').textContent=CAL_RU[rf]||'';
  $('ce_dot').style.background=calInfo(cid).color;$('ce_strow').style.display=(cid==='clients'||$('ce_contact').value.trim()||$('ce_status').value!=='scheduled')?'':'none'}
function calFormKey(e){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();calPopClose(false)}else if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='checkbox'&&!e.target.list){e.preventDefault();calPopClose(true)}}
// يغلق المحرّر؛ save=يحفظ الحقول. noRender يؤجّل إعادة الرسم (حتى لا يُستبدل عنصرٌ تحت المؤشّر)
function calPopClose(save,noRender){const P=CALX.pop;if(!P)return;CALX.pop=null;
  if(save&&!P.ro&&document.getElementById('ce_title'))calCommit(P);
  if(CALX.draft&&CALX.draft===P.a)CALX.draft=null;
  if(P.modal)closeModal();else{const p=document.getElementById('cxPop');if(p)p.remove()}
  if(noRender){CALX.needR=true;return}
  if(document.getElementById('cxView'))calRender();else rerender()}
function calCommit(P){const v=id=>{const x=document.getElementById(id);return x?x.value:''};
  const all=document.getElementById('ce_all').checked,sd=v('ce_sd');if(!sd)return;let s,e;
  if(all){s=cParse(sd);e=cAdd(cParse(v('ce_ed')||sd),1);if(e<=s)e=cAdd(s,1)}
  else{s=cParse(sd+'T'+(v('ce_st')||'09:00'));e=cParse((v('ce_ed')||sd)+'T'+(v('ce_et')||v('ce_st')||'10:00'));if(!e||e<=s)e=new Date(s.getTime()+36e5)}
  let a=P.a;const rf=v('ce_rep')||'none',cn=v('ce_contact').trim(),prev=P.isNew?'':(a.calId||''),or=a.repeat;
  // تعديل موعد من سلسلة = إزاحة السلسلة كلّها بالفارق نفسه
  if(!P.isNew&&or&&or.f&&or.f!=='none'&&P.occS){const ns=new Date(cParse(a.datetime).getTime()+(s-P.occS));e=new Date(ns.getTime()+(e-s));s=ns}
  const nv={title:v('ce_title').trim()||'حدث جديد',location:v('ce_loc').trim(),allDay:all,calId:v('ce_cal')||a.calId||'work',invitees:v('ce_inv').trim(),url:v('ce_url').trim(),notes:v('ce_notes'),status:v('ce_status')||'scheduled',alert:v('ce_alert'),
    repeat:rf==='none'?null:{f:rf,n:Math.max(1,+v('ce_rn')||1),until:v('ce_until')||'',ex:(or&&or.f===rf&&or.ex)||[]}};
  const tmp={...a,...nv};calSetSpan(tmp,s,e);tmp.contact=cn;tmp.contactId=cn?((S.contacts||[]).find(c=>(c.name||'').trim().toLowerCase()===cn.toLowerCase())||{}).id||'?':'';
  if(!P.isNew&&JSON.stringify(tmp)===JSON.stringify(a))return; // لا تغيير
  if(P.src==='g')a=calAdopt(a);
  Object.assign(a,nv);calSetSpan(a,s,e);a.contact=cn;a.contactId=cn?findOrCreateContact(cn):'';
  if(P.isNew){a.id=uid();(S.appointments=S.appointments||[]).push(a);CALX.sel=null}
  if(nv.alert!==''&&window.Notification&&Notification.permission==='default')try{Notification.requestPermission()}catch(_){}
  save();calGPushEv(a,prev)}
function calDup(){const P=CALX.pop;if(!P)return;calPopClose(true,true);const b=JSON.parse(JSON.stringify(P.a));
  ['googleId','googleCal','etag','gLink','recurringEventId','ro','cancelled','gDirty','orig'].forEach(k=>delete b[k]);b.id=uid();if(P.src==='g')b.calId=(P.a.calId&&!calInfo(P.a.calId).ro)?P.a.calId:calNewCal();
  S.appointments.push(b);save();calGPushEv(b,'');calRender();calToast('أُنشئت نسخة من «'+esc(b.title||'')+'»')}
function calDelPop(){const P=CALX.pop;if(!P)return;const o=CALX.occ[P.k]||{k:P.k,a:P.a,src:P.src,s:P.occS,ro:P.ro};calPopClose(false,true);calDelOcc(o)}
function calDelOcc(o){if(!o||o.ro||o.src==='inv')return;
  if(o.src==='draft'){CALX.draft=null;calRender();return}
  if(o.src==='g'){calGDelRemote(o.a);return}
  const a=o.a;if(a.repeat&&a.repeat.f&&a.repeat.f!=='none')return calAsk('حذف حدث متكرّر','هل تريد حذف هذا الموعد فقط، أم كلّ تكراراته؟',[['هذا الموعد فقط',()=>calDelOne(a,o.s)],['كلّ التكرارات',()=>calDelAll(a)]]);
  calDelAll(a)}
function calDelOne(a,s){a.repeat.ex=[...(a.repeat.ex||[]),cKey(s)];save();calGPushEv(a,a.calId);CALX.sel=null;calRender();calToast('حُذف هذا الموعد من السلسلة')}
function calDelAll(a){const i=(S.appointments||[]).indexOf(a);if(i<0)return;S.appointments.splice(i,1);CALX.sel=null;save();
  if(a.googleId)calGDel(a.googleCal,a.googleId);CALX.undo={a,i};calRender();calToast('حُذف «'+esc(a.title||'حدث')+'»','تراجع',calUndo)}
function calUndo(){const u=CALX.undo;if(!u)return;CALX.undo=null;const a=u.a;S.appointments.splice(Math.min(u.i,S.appointments.length),0,a);
  if(a.googleId){a.googleId='';a.etag=''}save();calGPushEv(a,'');if(document.getElementById('cxView'))calRender()}
function calAsk(t,m,btns){CALX.ask=btns.map(b=>b[1]);
  document.getElementById('modalRoot').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px"><div class="modal-head"><h3>${t}</h3><button class="x" onclick="closeModal()">×</button></div><div class="modal-body"><p style="margin:0;color:var(--muted)">${m}</p></div><div class="modal-foot">${btns.map((b,i)=>`<button class="btn ${i?'btn-ghost':'btn-gold'}" onclick="calAskDo(${i})">${b[0]}</button>`).join('')}<button class="btn btn-ghost" onclick="closeModal()">إلغاء</button></div></div></div>`}
function calAskDo(i){const f=CALX.ask&&CALX.ask[i];CALX.ask=null;closeModal();if(f)f()}
// نقرة خارج المحرّر = حفظ وإغلاق (كما في Apple)
function calDocPD(e){const t=e.target;if(!t||!t.closest)return;
  if(document.getElementById('cxMore')&&!t.closest('#cxMore')&&!t.closest('.cx-more'))calMoreClose();
  if(CALX.pop&&!CALX.pop.modal&&!t.closest('#cxPop')&&!t.closest('.modal-bg')&&!t.closest('#cxToast')){calPopClose(true,true);setTimeout(()=>{if(!CALX.drag&&!CALX.pop&&CALX.needR)calRender()},0)}}
function calKey(e){
  if((CUR!=='calendar'&&CUR!=='appointments')||!document.getElementById('cx')||document.querySelector('#modalRoot .modal-bg'))return;
  const t=e.target,typing=t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)),mod=e.metaKey||e.ctrlKey,c=e.code||'';
  if(e.key==='Escape'){if(CALX.pop){e.preventDefault();calPopClose(false)}else if(document.getElementById('cxMore'))calMoreClose();else if(CALX.sel){CALX.sel=null;calMarkSel()}return}
  if(typing)return;
  if(mod&&!e.altKey&&c==='KeyF'){e.preventDefault();const q=document.getElementById('cxQ');if(q){q.focus();q.select()}return}
  if(mod&&!e.altKey&&!e.shiftKey&&/^Digit[1-4]$/.test(c)){e.preventDefault();calView(['day','week','month','year'][+c.slice(5)-1]);return}
  if(mod||e.altKey)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();calStep(e.key==='ArrowLeft'?1:-1)} // RTL: اليسار = التالي
  else if(c==='KeyT'){e.preventDefault();calToday()}
  else if(c==='KeyN'){e.preventDefault();calNew()}
  else if((e.key==='Delete'||e.key==='Backspace')&&CALX.sel){e.preventDefault();calDelOcc(CALX.occ[CALX.sel])}}

/* ===== التقويم: التنبيهات والخطّ الأحمر ===== */
function calTick(){
  if(!document.getElementById('cx')){const p=document.getElementById('cxPop');if(p){p.remove();CALX.pop=null}calMoreClose()}
  const n=document.querySelector('#cxView .cx-now');if(n){if(n.parentElement.dataset.d!==today()&&!CALX.pop&&!CALX.drag)calRender();else n.style.top=cMin(new Date())*CAL_HH/60+'px'}
  if(!CALX.fired)return;const now=Date.now();let occ;try{occ=calOccs(new Date(now-6e5),new Date(now+1442*6e4),true)}catch(_){return}
  let ch=false;occ.forEach(o=>{const a=o.a;if(o.src!=='l'||a.alert===''||a.alert==null||a.status==='cancelled')return;const at=o.s.getTime()-(+a.alert)*6e4,key=o.k+'|'+a.alert;
    if(now<at||now>at+6e5||CALX.fired.has(key))return;CALX.fired.add(key);ch=true;
    const body=(o.all?'طوال اليوم':cTime(o.s))+(a.location?' · '+a.location:'');notifyMe(a.title||'حدث',body);calToast('<i data-lucide="bell"></i> '+esc(a.title||'حدث')+' — '+esc(body))});
  if(ch)try{localStorage.setItem('calFired',JSON.stringify([...CALX.fired].slice(-300)))}catch(_){}}
function calToast(m,act,fn){calCSS();let t=document.getElementById('cxToast');if(t)t.remove();t=document.createElement('div');t.id='cxToast';t.className='cx-toast';t.innerHTML=`<span>${m}</span>`;
  if(act){const b=document.createElement('button');b.textContent=act;b.onclick=()=>{t.remove();fn()};t.appendChild(b)}
  document.body.appendChild(t);refreshIcons();clearTimeout(CALX.tt);CALX.tt=setTimeout(()=>t.remove(),act?7000:4500)}

/* ===== التقويم: ربط Google Calendar (بلا خادم — GIS token client) ===== */
function calGLoad(){return new Promise((ok,no)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return ok();
  let s=document.getElementById('gsiJS');if(!s){s=document.createElement('script');s.id='gsiJS';s.src='https://accounts.google.com/gsi/client';s.async=true;document.head.appendChild(s)}
  s.addEventListener('load',()=>ok());s.addEventListener('error',()=>{s.remove();no(new Error('تعذّر تحميل مكتبة Google'))})})}
// prompt:'' = تجديد صامت، 'consent' = أوّل ربط. الرمز في الذاكرة فقط
function calGAuth(prompt){const g=calGCfg(),id=(g.clientId||'').trim();if(!id)return Promise.reject(new Error('أدخل Client ID أولاً'));
  return calGLoad().then(()=>new Promise((ok,no)=>{
    const tc=google.accounts.oauth2.initTokenClient({client_id:id,scope:'https://www.googleapis.com/auth/calendar',prompt,login_hint:g.email||undefined,
      callback:r=>{if(r&&r.access_token){CALX.g.tok=r.access_token;CALX.g.exp=Date.now()+((+r.expires_in||3600)-60)*1000;ok(r.access_token)}else no(new Error((r&&(r.error_description||r.error))||'رُفض الإذن'))},
      error_callback:er=>no(new Error(er&&er.type==='popup_failed_to_open'?'المتصفّح منع النافذة المنبثقة':er&&er.type==='popup_closed'?'أُغلقت نافذة Google':(er&&er.message)||'تعذّر الاتصال'))});
    if(!prompt)setTimeout(()=>no(new Error('انتهت مهلة التجديد الصامت')),20000);tc.requestAccessToken({prompt})}))}
function calGTok(){const G=CALX.g;return G.tok&&Date.now()<G.exp?Promise.resolve(G.tok):calGAuth('')}
async function calGApi(path,opt,retried){opt=opt||{};const tok=await calGTok();
  const r=await fetch(CAL_GAPI+path,{...opt,headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'}});
  if(r.status===401&&!retried){CALX.g.tok=null;return calGApi(path,opt,true)}
  if(r.status===204||(opt.method==='DELETE'&&r.status===410))return null;
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));return j}
function calGEnc(s){return encodeURIComponent(s)}
function calGPillTxt(){const G=CALX.g;return G.st==='busy'?['busy','Google · مزامنة…']:G.st==='err'?['err','Google · خطأ']:G.tok?['on','Google · متصل']:['off','Google · غير متصل']}
function calGPill(){const p=document.getElementById('cxGPill');if(!p)return;const [c,t]=calGPillTxt();p.className='cx-pill '+c;p.textContent=t;p.title=CALX.g.msg||t}
function calGAuto(){const g=calGCfg(),G=CALX.g;if(!g.clientId||!g.linked||G.tok||G.tried)return;G.tried=true;G.st='busy';calGPill();
  calGAuth('').then(()=>calGSync(true)).catch(()=>{G.st='off';G.msg='انتهت الجلسة — اضغط «اتصال» للتجديد';calGPill()})}
async function calGConnect(){const g=calGCfg(),G=CALX.g;if(!g.clientId){calSettings();return}G.st='busy';G.msg='';calGPill();
  try{await calGAuth(g.linked?'':'consent');g.linked=true;save();await calGSync(true);if(G.st==='on')calToast('تمّ الربط مع Google Calendar')}
  catch(e){G.st='err';G.msg=e.message;calGPill();calToast('تعذّر الاتصال: '+esc(e.message))}}
function calGDisconnect(){const G=CALX.g,g=calGCfg();try{if(G.tok&&window.google&&google.accounts)google.accounts.oauth2.revoke(G.tok,()=>{})}catch(_){}
  Object.assign(G,{tok:null,exp:0,cals:[],ev:[],st:'off',msg:'',rk:''});g.linked=false;save();closeModal();calRender();calToast('قُطع الاتصال بـ Google')}
function calGFrom(x,cal){const all=!!(x.start&&x.start.date),p=t=>t?(t.date?cParse(t.date):t.dateTime?new Date(t.dateTime):null):null,s=p(x.start),e=p(x.end),os=p(x.originalStartTime);
  return {id:'g~'+x.id,googleId:x.id,googleCal:cal,calId:'g:'+cal,etag:x.etag,recurringEventId:x.recurringEventId||'',cancelled:x.status==='cancelled',orig:os?cKey(os):'',
    title:x.summary||'(بلا عنوان)',location:x.location||'',notes:x.description||'',url:(x.source&&x.source.url)||'',gLink:x.htmlLink||'',invitees:(x.attendees||[]).map(t=>t.email).join(', '),
    allDay:all,datetime:s?cDT(s):'',end:e?cDT(e):'',duration:s&&e?Math.round((e-s)/6e4):60,status:'scheduled'}}
// سحب: قائمة التقويمات + أحداث النطاق الظاهر (مع هامش أسبوع)
async function calGSync(force){const G=CALX.g,g=calGCfg();if(!G.tok)return;if(G.busy){if(force)G.rk='';return} // طلب أثناء مزامنة جارية = أعِد بعدها
  const [f,t]=calRange(),from=cAdd(f,-7),to=cAdd(t,7),rk=cKey(from)+'_'+cKey(to)+'_'+JSON.stringify(calHide());if(!force&&rk===G.rk)return;
  G.busy=true;G.rk=rk;G.st='busy';calGPill();
  try{const L=await calGApi('/users/me/calendarList?minAccessRole=reader');G.cals=(L.items||[]).filter(c=>!c.deleted&&!c.hidden);
    const pr=G.cals.find(c=>c.primary);if(pr&&g.email!==pr.id){g.email=pr.id;save()}
    await calGFlush();
    const ev=[];for(const c of G.cals){if(!calShown('g:'+c.id))continue;let pt='';
      do{const q=new URLSearchParams({singleEvents:'true',showDeleted:'true',maxResults:'2500',timeMin:from.toISOString(),timeMax:to.toISOString()});if(pt)q.set('pageToken',pt);
        const r=await calGApi('/calendars/'+calGEnc(c.id)+'/events?'+q);(r.items||[]).forEach(x=>ev.push(calGFrom(x,c.id)));pt=r.nextPageToken||''}while(pt)}
    calGMerge(ev);G.ev=ev.filter(x=>!x.cancelled&&x.datetime);G.st='on';G.msg=''}
  catch(e){G.st='err';G.msg=e.message}
  G.busy=false;if(document.getElementById('cxView')&&!CALX.pop&&!CALX.drag)calRender();else calGPill()}
// البعيد يغلب على النسخة المحلّية ما لم يكن فيها تعديل لم يُرفع (gDirty)
function calGMerge(ev){let ch=false;const L=S.appointments||[];
  ev.forEach(x=>{const a=L.find(y=>y.googleId&&y.googleId===x.googleId);
    if(a){if(a.gDirty)return;if(x.cancelled){L.splice(L.indexOf(a),1);ch=true;return}
      if(x.etag!==a.etag&&x.datetime){['title','location','notes','allDay','datetime','end','duration','invitees','gLink','etag','googleCal','calId'].forEach(k=>a[k]=x[k]);ch=true}return}
    if(x.cancelled&&x.recurringEventId&&x.orig){const b=L.find(y=>y.googleId===x.recurringEventId);if(b&&b.repeat&&!(b.repeat.ex||[]).includes(x.orig)){b.repeat.ex=[...(b.repeat.ex||[]),x.orig];ch=true}}});
  if(ch)save()}
function calGBody(a){const s=cParse(a.datetime),e=cParse(a.end),tz=Intl.DateTimeFormat().resolvedOptions().timeZone,b={summary:a.title||'',location:a.location||'',description:a.notes||''};
  if(a.allDay){b.start={date:cKey(s)};b.end={date:cKey(e)}}else{b.start={dateTime:s.toISOString(),timeZone:tz};b.end={dateTime:e.toISOString(),timeZone:tz}}
  const r=a.repeat;
  if(r&&r.f&&r.f!=='none'){b.recurrence=['RRULE:FREQ='+r.f.toUpperCase()+(r.n>1?';INTERVAL='+r.n:'')+(r.until?';UNTIL='+r.until.replace(/-/g,'')+(a.allDay?'':'T235959Z'):'')];
    (r.ex||[]).forEach(k=>b.recurrence.push(a.allDay?'EXDATE;VALUE=DATE:'+k.replace(/-/g,''):'EXDATE:'+cParse(k+'T'+a.datetime.slice(11,16)).toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'))}
  else if(!a.recurringEventId)b.recurrence=[];
  b.reminders=a.alert!==''&&a.alert!=null?{useDefault:false,overrides:[{method:'popup',minutes:+a.alert}]}:{useDefault:true};
  const em=(a.invitees||'').split(/[,،\s]+/).filter(x=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));if(em.length)b.attendees=em.map(email=>({email}));
  return b}
// دفع: إدراج/تعديل/نقل بين تقويمات/حذف عند الخروج من Google. بلا اتصال = يُعلَّم gDirty ويُرفع لاحقاً
async function calGPushEv(a,prev){const G=CALX.g,cur=a.calId||'',wasG=(prev||'').startsWith('g:')||!!a.googleId,isG=cur.startsWith('g:');
  if(!wasG&&!isG)return;
  if(!G.tok){if(!isG&&a.googleId){calGDel(a.googleCal,a.googleId);a.googleId=a.googleCal=a.etag=''}else if(isG)a.gDirty=true;save();return}
  // دفعٌ واحد لكلّ حدث في آنٍ واحد (يمنع إدراجاً مكرّراً)؛ تعديلٌ أثناءه يُرفع بعده
  const F=CALX.gIn=CALX.gIn||new Map();if(F.has(a)){F.set(a,1);return}F.set(a,0);
  try{await calGPush1(a,isG)}finally{const again=F.get(a);F.delete(a);if(again)calGPushEv(a,a.calId)}}
async function calGPush1(a,isG){const G=CALX.g,cur=a.calId||'';
  try{
    if(!isG){if(a.googleId)await calGApi(`/calendars/${calGEnc(a.googleCal)}/events/${calGEnc(a.googleId)}`,{method:'DELETE'});a.googleId=a.googleCal=a.etag=a.gLink='';delete a.gDirty;save();return}
    const cal=cur.slice(2);
    if(a.googleId&&a.googleCal&&a.googleCal!==cal){const m=await calGApi(`/calendars/${calGEnc(a.googleCal)}/events/${calGEnc(a.googleId)}/move?destination=${calGEnc(cal)}`,{method:'POST'});a.googleCal=cal;if(m)a.etag=m.etag}
    const body=JSON.stringify(calGBody(a)),r=a.googleId?await calGApi(`/calendars/${calGEnc(cal)}/events/${calGEnc(a.googleId)}`,{method:'PATCH',body}):await calGApi(`/calendars/${calGEnc(cal)}/events`,{method:'POST',body});
    a.googleId=r.id;a.googleCal=cal;a.etag=r.etag;if(r.htmlLink)a.gLink=r.htmlLink;delete a.gDirty;save();G.st='on';G.msg='';calGPill()}
  catch(e){a.gDirty=true;save();G.st='err';G.msg=e.message;calGPill();calToast('تعذّرت المزامنة مع Google: '+esc(e.message))}}
function calGDel(cal,id){if(!cal||!id)return;const g=calGCfg();
  if(!CALX.g.tok){g.delQ=[...(g.delQ||[]),{cal,id}];save();return}
  calGApi(`/calendars/${calGEnc(cal)}/events/${calGEnc(id)}`,{method:'DELETE'}).catch(e=>calToast('تعذّر الحذف من Google: '+esc(e.message)))}
async function calGFlush(){const g=calGCfg(),q=g.delQ||[];if(q.length){g.delQ=[];save()}
  for(const d of q){try{await calGApi(`/calendars/${calGEnc(d.cal)}/events/${calGEnc(d.id)}`,{method:'DELETE'})}catch(_){}}
  for(const a of (S.appointments||[]).filter(a=>(a.calId||'').startsWith('g:')&&(!a.googleId||a.gDirty)))await calGPushEv(a,a.calId)}
async function calGDelRemote(x){if(!confirm('حذف «'+(x.title||'')+'» من Google Calendar؟'))return;
  try{await calGApi(`/calendars/${calGEnc(x.googleCal)}/events/${calGEnc(x.googleId)}`,{method:'DELETE'});CALX.g.ev=CALX.g.ev.filter(y=>y!==x);CALX.sel=null;calRender();calToast('حُذف من Google')}
  catch(e){calToast('تعذّر الحذف: '+esc(e.message))}}
async function calGCopy(){const P=CALX.pop;if(!P)return;calPopClose(true,true);const cal=calGCfg().pushTo||'primary';
  try{await calGApi(`/calendars/${calGEnc(cal)}/events`,{method:'POST',body:JSON.stringify(calGBody(P.a))});CALX.g.rk='';calRender();calToast('نُسخ «'+esc(P.a.title||'')+'» إلى Google')}
  catch(e){calToast('تعذّر النسخ: '+esc(e.message))}}
function calSettings(){const g=calGCfg(),G=CALX.g,con=!!G.tok,[pc,pt]=calGPillTxt(),wr=G.cals.filter(c=>/owner|writer/.test(c.accessRole));
  const st=G.msg||(con?'متصل'+(g.email?' بحساب '+g.email:''):g.clientId?(g.linked?'مربوط — الجلسة غير نشطة':'غير متصل'):'لم يُضبط Client ID — التقويم يعمل محلّياً بالكامل.');
  openModal('التقويم وربط Google',`<div class="cx-set">
   <div class="cx-set-st"><span class="cx-pill ${pc}">${pt}</span><span>${esc(st)}</span></div>
   <div class="field"><label>OAuth Client ID (نوع Web application)</label><input id="cg_id" dir="ltr" value="${esc(g.clientId||'')}" placeholder="1234-abc.apps.googleusercontent.com" autocomplete="off"></div>
   <div class="cx-set-btns">${con?`<button class="btn btn-ghost btn-sm" onclick="calGSync(true).then(()=>{closeModal();calSettings()})"><i data-lucide="refresh-cw"></i> مزامنة الآن</button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="calGDisconnect()"><i data-lucide="unlink"></i> قطع الاتصال</button>`
     :`<button class="btn btn-gold btn-sm" onclick="calGConnectSet()"><i data-lucide="link"></i> ${g.linked?'إعادة الاتصال':'اتصال بـ Google'}</button>${g.linked?`<button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="calGDisconnect()">إلغاء الربط</button>`:''}`}</div>
   ${con?`<div class="field"><label>تقويمات Google الظاهرة</label><div class="cx-set-cals">${G.cals.map(c=>`<label class="cx-cal"><input type="checkbox" ${calShown('g:'+c.id)?'checked':''} onchange="calToggle('g:${esc(c.id)}')" style="accent-color:${c.backgroundColor||'#3b82f6'}"><span class="cx-cn">${esc(c.summaryOverride||c.summary)}</span>${/owner|writer/.test(c.accessRole)?'':'<small>قراءة فقط</small>'}</label>`).join('')||'<small>لا تقويمات</small>'}</div></div>
    <div class="field"><label>الأحداث الجديدة تُنشأ في</label><select id="cg_push"><option value="">تقويم محلّي (لا تُرفع)</option>${wr.map(c=>`<option value="${esc(c.id)}"${g.pushTo===c.id?' selected':''}>Google · ${esc(c.summaryOverride||c.summary)}</option>`).join('')}</select></div>`:''}
   <div class="field"><label>التقويم المحلّي الافتراضي</label><select id="cg_def">${calCals().map(c=>`<option value="${c.id}"${uiPref('calDefault','work')===c.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
   <details class="cx-steps"${g.clientId?'':' open'}><summary>كيف أنشئ Client ID؟ (مرّة واحدة)</summary><ol>
    <li>افتح <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a> بحساب Gmail، وأنشئ مشروعاً جديداً.</li>
    <li>APIs &amp; Services ← Library ← ابحث عن <b>Google Calendar API</b> واضغط Enable.</li>
    <li>OAuth consent screen: النوع External، اكتب اسم التطبيق وبريدك، ثم أضف بريدك في <b>Test users</b>.</li>
    <li>Credentials ← Create credentials ← <b>OAuth client ID</b> ← النوع <b>Web application</b>.</li>
    <li>في Authorized JavaScript origins أضف: <code>https://ibrahimsaud.com</code> و<code>http://localhost:8765</code> (بلا مسار ولا شرطة في الآخر).</li>
    <li>انسخ Client ID (ينتهي بـ apps.googleusercontent.com) والصقه أعلاه ثم «اتصال». لا تلصق Client secret — لا نحتاجه.</li></ol>
    <small>الصلاحية تُمنح للمتصفّح فقط ولا تُحفظ في النظام؛ بعد إعادة تحميل الصفحة تتجدّد بصمت.</small></details></div>`,calSettingsSave)}
function calSettingsRead(){const g=calGCfg(),v=id=>{const x=document.getElementById(id);return x?x.value:null},id=v('cg_id'),p=v('cg_push'),d=v('cg_def');
  if(id!==null&&id.trim()!==(g.clientId||'')){g.clientId=id.trim();CALX.g.tok=null;CALX.g.tried=false;g.linked=false}
  if(p!==null)g.pushTo=p;if(d){S.settings.ui=S.settings.ui||{};S.settings.ui.calDefault=d}save()}
function calSettingsSave(){calSettingsRead();closeModal();calRender()}
function calGConnectSet(){calSettingsRead();closeModal();calGConnect()}

/* ===== المواعيد: روابط خارجيّة وتصدير ===== */
function gcal(a){calNorm(a);const st=cParse(a.datetime),en=cParse(a.end),f=d=>d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',dk=d=>cKey(d).replace(/-/g,'');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.title||'')}&dates=${a.allDay?dk(st)+'/'+dk(en):f(st)+'/'+f(en)}&details=${encodeURIComponent(a.notes||'')}${a.location?'&location='+encodeURIComponent(a.location):''}`}
function icsLocal(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+'00'}
function icsEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\n/g,'\\n')}
function exportICS(id){
  const arr=id?(S.appointments||[]).filter(a=>a.id===id):(S.appointments||[]);
  if(!arr.length){alert('لا توجد مواعيد للتصدير');return}
  let L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IbrahimSaud//Cowork//AR','CALSCALE:GREGORIAN'];
  arr.forEach(a=>{calNorm(a);const st=cParse(a.datetime),en=cParse(a.end);if(!st)return;const dk=d=>cKey(d).replace(/-/g,''),r=a.repeat;
    L.push('BEGIN:VEVENT','UID:'+a.id+'@ibrahimsaud','DTSTAMP:'+icsLocal(new Date()));
    if(a.allDay)L.push('DTSTART;VALUE=DATE:'+dk(st),'DTEND;VALUE=DATE:'+dk(en));else L.push('DTSTART:'+icsLocal(st),'DTEND:'+icsLocal(en));
    L.push('SUMMARY:'+icsEsc(a.title||'موعد'));
    if(r&&r.f&&r.f!=='none'){L.push('RRULE:FREQ='+r.f.toUpperCase()+(r.n>1?';INTERVAL='+r.n:'')+(r.until?';UNTIL='+r.until.replace(/-/g,'')+(a.allDay?'':'T235959'):''));(r.ex||[]).forEach(k=>L.push(a.allDay?'EXDATE;VALUE=DATE:'+k.replace(/-/g,''):'EXDATE:'+icsLocal(cParse(k+'T'+a.datetime.slice(11,16)))))}
    if(a.notes)L.push('DESCRIPTION:'+icsEsc(a.notes));if(a.location||a.contact)L.push('LOCATION:'+icsEsc(a.location||a.contact));if(a.url)L.push('URL:'+a.url);
    if(a.alert!==''&&a.alert!=null)L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(a.title||'موعد'),'TRIGGER:-PT'+(+a.alert)+'M','END:VALARM');
    L.push('END:VEVENT')});
  L.push('END:VCALENDAR');
  const b=new Blob([L.join('\r\n')],{type:'text/calendar'});const aa=document.createElement('a');aa.href=URL.createObjectURL(b);aa.download=(id?'موعد':'مواعيد')+'-'+today()+'.ics';aa.click();
}

/* ===== التقويم: التنسيق (يُحقن مرّة واحدة) ===== */
function calCSS(){if(document.getElementById('cxCSS'))return;const st=document.createElement('style');st.id='cxCSS';st.textContent=`
  .cx{display:flex;flex-direction:column;gap:10px;height:calc(100vh - 118px);height:calc(100dvh - 118px);min-height:520px;user-select:none;-webkit-user-select:none}
  .cx input,.cx textarea{user-select:text;-webkit-user-select:text}
  .cx-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--panel) 78%,transparent);-webkit-backdrop-filter:blur(20px) saturate(1.5);backdrop-filter:blur(20px) saturate(1.5);box-shadow:0 6px 20px rgba(0,0,0,.18)}
  .cx-ib{min-width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--ink);border-radius:9px;cursor:pointer;padding:0 7px;text-decoration:none;flex:none}
  .cx-ib:hover{background:var(--panel2)}
  .cx-ib svg{width:17px;height:17px}
  .cx-ib.sm{min-width:26px;height:26px;padding:0 4px}.cx-ib.sm svg{width:15px;height:15px}
  .cx-ib.del{color:var(--bad)}
  .cx-tb{height:32px;padding:0 12px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);border-radius:9px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .cx-tb:hover{border-color:var(--gold)}.cx-tb svg{width:15px;height:15px}
  .cx-title{font-size:19px;font-weight:800;margin:0 6px;flex:1;min-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cx-seg{display:flex;gap:2px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:3px}
  .cx-seg button{border:none;background:transparent;color:var(--muted);font-weight:700;font-size:13px;padding:5px 12px;border-radius:7px;cursor:pointer;white-space:nowrap}
  .cx-seg button:hover{color:var(--ink)}
  .cx-seg button.on{background:var(--gold);color:#1a1205}
  .cx-nav{display:flex;align-items:center;gap:2px}
  .cx-search{position:relative;width:180px}
  .cx-search svg{position:absolute;inset-inline-start:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--muted);pointer-events:none}
  .cx-search input{height:34px;padding:6px 10px;padding-inline-start:30px;font-size:13px;border-radius:9px}
  .cx-pill{border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:99px;font-size:11.5px;font-weight:700;padding:4px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .cx-pill:before{content:'';width:7px;height:7px;border-radius:50%;background:var(--muted)}
  .cx-pill.on{color:var(--good)}.cx-pill.on:before{background:var(--good)}
  .cx-pill.err{color:var(--bad)}.cx-pill.err:before{background:var(--bad)}
  .cx-pill.busy:before{background:var(--gold);animation:cxp 1s infinite}
  @keyframes cxp{50%{opacity:.25}}
  .cx-body{flex:1;min-height:0;display:flex;gap:10px;position:relative}
  .cx-side{flex:0 0 228px;overflow:auto;border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:12px;box-sizing:border-box}
  .cx.side-off .cx-side{display:none}
  .cx-scrim{display:none}
  .cx-view{flex:1;min-width:0;border:1px solid var(--line);border-radius:14px;background:var(--panel);overflow:hidden;position:relative}
  .cx-mini-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.cx-mini-h b{font-size:13.5px}
  .cx-mini{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center}
  .cx-mini span{font-size:10.5px;color:var(--muted);padding:2px 0}
  .cx-mini button{border:none;background:transparent;color:var(--ink);font-size:12px;height:26px;border-radius:7px;cursor:pointer;position:relative;padding:0}
  .cx-mini button:hover{background:var(--panel2)}
  .cx-mini button.o{color:var(--muted);opacity:.55}
  .cx-mini button.r{background:var(--goldsoft)}
  .cx-mini button.t{color:#fff;background:var(--bad);font-weight:800}
  .cx-mini button.e:after{content:'';position:absolute;bottom:2px;left:50%;width:3px;height:3px;margin-left:-1.5px;border-radius:50%;background:var(--gold)}
  .cx-grp{margin-top:16px}.cx-grp h5{margin:0 0 6px;font-size:11px;color:var(--muted);font-weight:800}
  .cx-cal{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:8px;cursor:pointer;font-size:13.5px}
  .cx-cal:hover{background:var(--panel2)}
  .cx-cal input{width:16px;height:16px;margin:0;flex:none;padding:0}
  .cx-cal small{color:var(--muted);font-size:11px}
  .cx-cn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cx-cal-ed{opacity:0;border:none;background:none;color:var(--muted);padding:2px;cursor:pointer;display:inline-flex}
  .cx-cal:hover .cx-cal-ed{opacity:1}.cx-cal-ed svg{width:13px;height:13px}
  .cx-side-btn{display:flex;align-items:center;gap:7px;width:100%;border:1px dashed var(--line);background:none;color:var(--muted);border-radius:9px;padding:7px 9px;font-size:12.5px;cursor:pointer;margin-top:6px;font-family:inherit}
  .cx-side-btn:hover{color:var(--ink);border-color:var(--gold)}.cx-side-btn svg{width:14px;height:14px}
  .cx-wk{display:flex;flex-direction:column;height:100%}
  .cx-whead,.cx-wad{display:flex;border-bottom:1px solid var(--line);overflow-y:hidden;scrollbar-gutter:stable;flex:none}
  .cx-gut{flex:0 0 54px;font-size:10.5px;color:var(--muted);display:flex;align-items:center;justify-content:center;text-align:center}
  .cx-dh{flex:1;min-width:0;text-align:center;padding:8px 2px;font-size:12px;color:var(--muted);cursor:pointer;white-space:nowrap;overflow:hidden;border-inline-start:1px solid transparent}
  .cx-dh b{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 4px;border-radius:13px;font-size:15px;color:var(--ink);box-sizing:border-box}
  .cx-dh:hover b{background:var(--panel2)}
  .cx-dh.today{color:var(--bad)}.cx-dh.today b{background:var(--bad);color:#fff}
  .cx .s{display:none}
  .cx .nar .l{display:none}.cx .nar .s{display:inline}
  .cx-adrow{flex:1;min-width:0;display:grid;grid-auto-rows:20px;row-gap:2px;padding:3px 0;min-height:26px;max-height:96px;overflow-y:auto;align-content:start}
  .cx-wscroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable}
  .cx-wgrid{display:flex;position:relative}
  .cx-hrs{flex-direction:column;align-items:stretch;justify-content:flex-start}
  .cx-hl{height:${CAL_HH}px;position:relative;flex:none}
  .cx-hl span{position:absolute;top:-7px;inset-inline:0;text-align:center;font-size:10.5px;color:var(--muted)}
  .cx-cols{flex:1;min-width:0;display:flex;position:relative;background-image:linear-gradient(to bottom,var(--line) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in srgb,var(--line) 45%,transparent) 1px,transparent 1px);background-size:100% ${CAL_HH}px,100% ${CAL_HH/2}px}
  .cx-col{flex:1;min-width:0;position:relative;border-inline-start:1px solid var(--line);touch-action:pan-y}
  .cx-col.wk{background:color-mix(in srgb,var(--ink) 2.5%,transparent)}
  .cx-col.today{background:color-mix(in srgb,var(--gold) 5%,transparent)}
  .cx-col.drop{background:var(--goldsoft)}
  .cx-ev{position:absolute;box-sizing:border-box;border-radius:6px;padding:2px 6px;overflow:hidden;font-size:11.5px;line-height:1.3;background:color-mix(in srgb,var(--c) 26%,var(--panel));border-inline-start:3px solid var(--c);color:var(--ink);cursor:default;z-index:1;box-shadow:0 0 0 1px var(--panel)}
  .cx-ev b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cx-ev .tl{display:block;opacity:.75;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cx-ev:hover{filter:brightness(1.12)}
  .cx-e.sel{background:var(--c)!important;color:var(--ci)!important;z-index:3}
  .cx-e.sel .tm,.cx-e.sel small{color:inherit!important;opacity:.85}
  .cx-e.drag{opacity:.88;z-index:6;box-shadow:0 8px 24px rgba(0,0,0,.4);pointer-events:none}
  .cx-e.st-done{opacity:.6}.cx-e.st-cancelled{opacity:.45;text-decoration:line-through}
  .cx-e.draft{outline:2px dashed var(--c);outline-offset:-2px}
  .cx-rz{position:absolute;bottom:0;left:0;right:0;height:7px;cursor:ns-resize}
  .cx-now{position:absolute;inset-inline:0;height:2px;background:var(--bad);z-index:4;pointer-events:none}
  .cx-now:before{content:'';position:absolute;inset-inline-start:-5px;top:-4px;width:10px;height:10px;border-radius:50%;background:var(--bad)}
  .cx-ghost{position:absolute;inset-inline:2px;border-radius:6px;background:color-mix(in srgb,var(--gold) 30%,transparent);border:1px solid var(--gold);font-size:11px;padding:2px 6px;color:var(--ink);pointer-events:none;z-index:5;box-sizing:border-box}
  body.cx-dragging,body.cx-dragging *{cursor:grabbing!important}
  .cx-mb{pointer-events:auto;margin:0 3px;border-radius:5px;font-size:11.5px;line-height:19px;height:19px;padding:0 6px;display:flex;align-items:center;gap:5px;overflow:hidden;white-space:nowrap;cursor:default;min-width:0;color:var(--ink);box-sizing:border-box}
  .cx-mb.all{background:color-mix(in srgb,var(--c) 32%,var(--panel))}
  .cx-mb:hover{background:color-mix(in srgb,var(--c) 20%,var(--panel))}
  .cx-mb.all:hover{background:color-mix(in srgb,var(--c) 42%,var(--panel))}
  .cx-mb .tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
  .cx-mb .tm{font-size:10.5px;color:var(--muted);flex:none}
  .cx-mb .dt{width:7px;height:7px;border-radius:50%;background:var(--c);flex:none}
  .cx-mb.sel .dt{background:var(--ci)}
  .cx-mon{display:flex;flex-direction:column;height:100%}
  .cx-mdow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-bottom:1px solid var(--line);flex:none}
  .cx-mdow div{padding:7px 8px;font-size:12px;color:var(--muted);font-weight:700}
  .cx-mrows{flex:1;display:flex;flex-direction:column;min-height:0}
  .cx-mrow{flex:1;position:relative;min-height:0;border-bottom:1px solid var(--line)}
  .cx-mrow:last-child{border-bottom:none}
  .cx-mcells{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));height:100%}
  .cx-mcell{border-inline-start:1px solid var(--line);padding:4px 6px;display:flex;align-items:flex-start;gap:4px;min-width:0}
  .cx-mcell:first-child{border-inline-start:none}
  .cx-mcell.wk{background:color-mix(in srgb,var(--ink) 2.5%,transparent)}
  .cx-mcell.other .cx-mnum,.cx-mcell.other .cx-mlb{opacity:.4}
  .cx-mcell.drop{background:var(--goldsoft)}
  .cx-mnum{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 3px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;box-sizing:border-box}
  .cx-mnum:hover{background:var(--panel2)}
  .cx-mlb{font-size:12px;font-weight:800;color:var(--gold);line-height:24px}
  .cx-mcell.today .cx-mnum{background:var(--bad);color:#fff}
  .cx-mev{position:absolute;top:31px;left:0;right:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:19px;row-gap:2px;pointer-events:none}
  .cx-more{pointer-events:auto;border:none;background:none;font-size:11px;font-weight:700;color:var(--muted);padding:0 8px;cursor:pointer;text-align:start;font-family:inherit;white-space:nowrap;overflow:hidden}
  .cx-more:hover{color:var(--ink)}
  .cx-year{height:100%;overflow:auto;padding:16px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px 26px;align-content:start;box-sizing:border-box}
  .cx-ym h4{margin:0 0 6px;font-size:15px;font-weight:800;cursor:pointer;color:var(--ink)}
  .cx-ym h4.cur,.cx-ym h4:hover{color:var(--gold)}
  .cx-ydw,.cx-ygrid{display:grid;grid-template-columns:repeat(7,1fr);text-align:center}
  .cx-ydw span{font-size:10px;color:var(--muted);padding-bottom:2px}
  .cx-yd{border:none;background:none;color:var(--ink);font-size:11.5px;height:24px;border-radius:12px;cursor:pointer;padding:0;font-family:inherit}
  .cx-yd:hover{outline:1px solid var(--gold)}
  .cx-yd.l1{background:color-mix(in srgb,var(--gold) 16%,transparent)}
  .cx-yd.l2{background:color-mix(in srgb,var(--gold) 34%,transparent)}
  .cx-yd.l3{background:color-mix(in srgb,var(--gold) 58%,transparent);font-weight:700}
  .cx-yd.t{background:var(--bad);color:#fff;font-weight:800}
  .cx-agenda{height:100%;overflow:auto;padding:6px 16px 16px;box-sizing:border-box}
  .cx-ag-day{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--line)}
  .cx-ag-h{flex:0 0 130px;display:flex;gap:8px;align-items:flex-start}
  .cx-ag-h b{font-size:26px;line-height:1;font-weight:800}
  .cx-ag-h span{font-size:13px;font-weight:700;display:flex;flex-direction:column;gap:2px}
  .cx-ag-h small{color:var(--muted);font-weight:500;font-size:11.5px}
  .cx-ag-day.t .cx-ag-h b{color:var(--bad)}
  .cx-ag-list{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
  .cx-li{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;cursor:pointer;font-size:13.5px;min-width:0}
  .cx-li:hover{background:var(--panel2)}
  .cx-li .tm{flex:0 0 118px;color:var(--muted);font-size:12px}
  .cx-li .bar{width:4px;align-self:stretch;border-radius:2px;background:var(--c);flex:none}
  .cx-li .tt{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;font-weight:600}
  .cx-li small{color:var(--muted);font-size:12px;font-weight:400}
  .cx-li.sel{background:color-mix(in srgb,var(--c) 22%,transparent)!important;color:var(--ink)!important}
  .cx-sr-h{font-size:12px;color:var(--muted);padding:8px 0;font-weight:700}
  .cx-sr{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line)}
  .cx-sr .dd{flex:0 0 120px;font-size:12px;color:var(--muted)}.cx-sr .cx-li{flex:1}
  .cx-pop{position:fixed;z-index:58;width:360px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background:color-mix(in srgb,var(--panel) 90%,transparent);-webkit-backdrop-filter:blur(24px) saturate(1.6);backdrop-filter:blur(24px) saturate(1.6);border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.5);padding:14px;color:var(--ink);box-sizing:border-box}
  .cx-morep{width:250px;padding:10px;display:flex;flex-direction:column;gap:3px}
  .cx-morep .cx-mb{margin:0;cursor:pointer;height:22px;line-height:22px}
  .cx-more-h{font-size:12.5px;font-weight:800;color:var(--muted);margin:0 2px 6px}
  .cx-f input,.cx-f select,.cx-f textarea{padding:6px 9px;font-size:13px;border-radius:8px;min-width:0}
  .cx-f .cx-f-t{font-size:17px;font-weight:800;border-color:transparent;background:transparent;padding:4px 6px}
  .cx-f .cx-f-s{border-color:transparent;background:transparent;padding:2px 6px;font-size:13px}
  .cx-f .cx-f-t:focus,.cx-f .cx-f-s:focus{border-color:var(--gold);background:rgba(255,255,255,.05)}
  .cx-f-sec{border-top:1px solid var(--line);margin-top:8px;padding-top:8px;display:flex;flex-direction:column;gap:6px}
  .cx-f-r{display:flex;align-items:center;gap:6px}
  .cx-f-r>span{flex:0 0 64px;font-size:12px;color:var(--muted)}
  .cx-f-r>span.u{flex:none}
  .cx-f-r input[type=date]{flex:1.3}.cx-f-r .tm{flex:1}.cx-f-r .n{width:52px;flex:none}
  .cx-f-r em{font-style:normal;font-size:12px;color:var(--muted)}
  .cx-f-ck{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}
  .cx-f-ck input{width:16px;height:16px;padding:0;margin:0;accent-color:var(--gold)}
  .cx-dot{width:10px;height:10px;border-radius:50%;flex:none}
  .cx-f textarea{resize:vertical;min-height:44px}
  .cx-f-acts,.cx-f-foot{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:10px}
  .cx-f-foot .sp{flex:1}
  .cx-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:2000;display:flex;align-items:center;gap:12px;background:color-mix(in srgb,var(--panel) 92%,transparent);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid var(--line);border-radius:12px;padding:10px 14px;box-shadow:0 12px 34px rgba(0,0,0,.45);font-size:13.5px;max-width:calc(100vw - 24px);color:var(--ink)}
  .cx-toast span{display:flex;align-items:center;gap:6px}.cx-toast svg{width:16px;height:16px;color:var(--gold)}
  .cx-toast button{border:none;background:none;color:var(--gold);font-weight:800;cursor:pointer;font-family:inherit}
  .cx-set-st{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:13px;color:var(--muted);flex-wrap:wrap}
  .cx-set-btns{display:flex;gap:8px;flex-wrap:wrap;margin:-6px 0 16px}
  .cx-set-cals{max-height:180px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px}
  .cx-steps{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.7}
  .cx-steps summary{cursor:pointer;font-weight:700}
  .cx-steps ol{margin:8px 0;padding-inline-start:20px}
  .cx-steps a{color:var(--gold)}.cx-steps small{color:var(--muted)}
  .cx-steps code{direction:ltr;unicode-bidi:embed;background:var(--panel3);padding:1px 5px;border-radius:5px;font-size:12px}
  .cx-sw{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .cx-sw button{width:26px;height:26px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:0 0 0 1px var(--line)}
  .cx-sw button.on{border-color:var(--ink)}
  .cx-sw input{width:46px;height:30px;padding:2px}
  @media(max-width:760px){
    .cx{height:calc(100vh - 100px);height:calc(100dvh - 100px);min-height:440px;gap:8px}
    .cx-bar{gap:4px;padding:5px}
    .cx-title{order:-1;flex:1 1 100%;font-size:17px;margin:2px 4px}
    .cx-seg{flex:1 1 100%;order:3}.cx-seg button{flex:1;padding:6px 2px;font-size:12.5px}
    .cx-search{flex:1 1 100px;width:auto}
    .cx-pill{font-size:10.5px;padding:3px 8px}
    .cx-side{position:absolute;top:0;bottom:0;inset-inline-start:0;width:262px;z-index:30;transform:translateX(calc(100% + 16px));transition:transform .2s;display:block!important;box-shadow:0 12px 40px rgba(0,0,0,.5)}
    .cx.side-open .cx-side{transform:none}
    .cx.side-open .cx-scrim{display:block;position:absolute;inset:0;z-index:29;background:rgba(0,0,0,.4);border-radius:14px}
    .cx .l{display:none}.cx .s{display:inline}
    .cx-gut{flex-basis:40px;font-size:9.5px}
    .cx-dh{font-size:10.5px;padding:6px 0}.cx-dh b{font-size:13px;min-width:22px;height:22px}
    .cx-hl span{font-size:9.5px}
    .v-week .cx-ev{padding:1px 3px;font-size:10.5px}.v-week .cx-ev .tl{display:none}
    .cx-mdow div{text-align:center;padding:5px 0}
    .cx-mcell{padding:3px 2px;justify-content:center}.cx-mlb{display:none}
    .cx-mb{margin:0 1px;padding:0 3px;font-size:10px}.cx-mb .tm,.cx-mb .dt{display:none}
    .cx-more{padding:0 3px;font-size:10px}
    .cx-ag-day{flex-direction:column;gap:6px}.cx-li .tm{flex-basis:92px}
    .cx-sr{flex-direction:column;align-items:stretch;gap:0}.cx-sr .dd{padding-top:6px}
    .cx-f input,.cx-f select,.cx-f textarea{font-size:16px}
    .cx-f-r>span{flex-basis:50px}.cx-f input[type=date],.cx-f input[type=time]{padding:6px 4px}.cx-f-r .tm{flex:1 0 104px}
  }
`;document.head.appendChild(st)}

/* ===== DASHBOARDS ===== */
function renderDashboards(){
  const allInv=S.invoices||[];
  const collected=allInv.reduce((a,i)=>a+invPaid(i),0);
  const due=allInv.reduce((a,i)=>a+invDue(i),0);
  const invoicedTotal=allInv.reduce((a,i)=>a+invTotal(i),0);
  const quotes=S.sales||[];const openQuotes=quotes.filter(q=>q.status==='draft'||q.status==='sent').length;
  const months=[];const now=new Date();
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({k:ymKey(d),lbl:d.toLocaleDateString('ar',{month:'short'}),v:0})}
  allInv.forEach(inv=>{const pays=(inv.payments&&inv.payments.length)?inv.payments:(inv.status==='paid'?[{date:inv.paidDate||inv.date,amount:invTotal(inv)}]:[]);pays.forEach(p=>{const k=(p.date||'').slice(0,7);const mm=months.find(x=>x.k===k);if(mm)mm.v+=Number(p.amount||0)})});
  const maxM=Math.max(1,...months.map(m=>m.v));
  const byC={};allInv.forEach(i=>{const n=resolveClientName(i);byC[n]=(byC[n]||0)+invTotal(i)});
  const top=Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,6);const maxC=Math.max(1,...top.map(t=>t[1]));
  const qStages=[{k:'draft',l:'عرض سعر'},{k:'sent',l:'مُرسل'},{k:'sale',l:'أمر بيع'},{k:'cancel',l:'ملغى'}];
  // ملخّص مسار العملاء: عدد وقيمة كل مرحلة + نسبة التحويل إلى «تم الاعتماد»
  const pipeAll=(S.contacts||[]).filter(inPipeline);
  const pipeRows=S.clientStages.map(st=>{const g=pipeAll.filter(c=>c.stageKey===st.key);return {label:st.label,n:g.length,v:g.reduce((a,c)=>a+Number(c.value||0),0)}});
  const pipeMax=Math.max(1,...pipeRows.map(r=>r.n));
  const pipeOpen=pipeAll.filter(c=>!clientStage(c).final).reduce((a,c)=>a+Number(c.value||0),0);
  const wonIdx=stageIdx('won');
  const pipeConv=pipeAll.length?Math.round(pipeAll.filter(c=>wonIdx>=0&&stageIdx(c.stageKey)>=wonIdx&&!clientStage(c).lost).length/pipeAll.length*100):0;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>لوحة البيانات والتحليلات</h1><span style="color:var(--muted)">${today()}</span></div>
    <div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="wallet"></i></span><div class="v">${money(collected)}</div><div class="l">إجمالي المحصّل</div></div>
      <div class="stat"><span class="ic"><i data-lucide="hourglass"></i></span><div class="v">${money(due)}</div><div class="l">المستحقات (المتبقّي)</div></div>
      <div class="stat"><span class="ic"><i data-lucide="receipt-text"></i></span><div class="v">${money(invoicedTotal)}</div><div class="l">إجمالي مفوتر</div></div>
      <div class="stat"><span class="ic"><i data-lucide="file-text"></i></span><div class="v">${openQuotes}</div><div class="l">عروض أسعار مفتوحة</div></div>
    </div>
    <div class="grid">
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="trending-up"></i> الإيرادات المحصّلة — آخر 6 أشهر</h3>
        <div style="display:flex;align-items:flex-end;gap:14px;height:170px;padding-top:10px">
        ${months.map(m=>`<div style="flex:1;text-align:center"><div style="height:${Math.round(m.v/maxM*130)}px;background:linear-gradient(180deg,var(--gold2),var(--gold));border-radius:7px 7px 0 0;min-height:3px"></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${m.lbl}</div><div style="font-size:11px">${m.v?Math.round(m.v):''}</div></div>`).join('')}</div></div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="users"></i> المبيعات حسب العميل</h3>
        ${top.length?top.map(([n,v])=>`<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${esc(n)}</span><span style="font-weight:700">${money(v)}</span></div><div style="height:11px;background:var(--panel3);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(v/maxC*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></i></div></div>`).join(''):'<p style="color:var(--muted)">لا مبيعات بعد.</p>'}</div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="git-branch"></i> مسار العملاء
        <span style="color:var(--muted);font-weight:400;font-size:13px">· خط مفتوح ${money(pipeOpen)} · تحويل ${pipeConv}%</span></h3>
        ${pipeRows.map(r=>`<div style="margin:9px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${esc(r.label)} <span style="color:var(--muted)">(${r.n})</span></span><span style="font-weight:700">${r.v?money(r.v):'—'}</span></div>
          <div style="height:11px;background:var(--panel3);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(r.n/pipeMax*100)}%;background:linear-gradient(90deg,var(--gold),var(--gold2))"></i></div></div>`).join('')}
        <button class="btn btn-ghost btn-sm" onclick="go('pipeline')" style="margin-top:8px"><i data-lucide="arrow-left-to-line"></i> افتح اللوحة</button></div>
      <div class="card"><h3><i data-lucide="eye"></i> زيارات الموقع</h3><div id="visitsBox"><p style="color:var(--muted)">…جارٍ التحميل</p></div></div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="file-text"></i> عروض الأسعار — تفصيل شهري</h3>
        ${(function(){
          // آخر ٦ أشهر
          const ms=[];const nn=new Date();for(let i=5;i>=0;i--){const d=new Date(nn.getFullYear(),nn.getMonth()-i,1);ms.push({k:ymKey(d),lbl:d.toLocaleDateString('ar',{month:'long',year:'numeric'})})}
          const rows=ms.map(m=>{const g=quotes.filter(q=>(q.date||'').slice(0,7)===m.k);const c={draft:0,sent:0,sale:0,cancel:0};g.forEach(q=>{if(c[q.status]!==undefined)c[q.status]++});const sum=g.reduce((a,q)=>a+docTotal(q),0);return {m,g,c,sum}}).reverse();
          const tot={draft:0,sent:0,sale:0,cancel:0,sum:0,n:0};rows.forEach(r=>{tot.draft+=r.c.draft;tot.sent+=r.c.sent;tot.sale+=r.c.sale;tot.cancel+=r.c.cancel;tot.sum+=r.sum;tot.n+=r.g.length});
          return `<table style="margin-top:8px"><thead><tr><th>الشهر</th><th>عرض</th><th>مُرسل</th><th>أمر بيع</th><th>ملغى</th><th>إجمالي القيمة</th></tr></thead><tbody>
            ${rows.map(r=>`<tr><td><b>${esc(r.m.lbl)}</b></td><td>${r.c.draft||'—'}</td><td>${r.c.sent||'—'}</td><td style="color:#86efac">${r.c.sale||'—'}</td><td style="color:#fca5a5">${r.c.cancel||'—'}</td><td><b>${r.sum?money(r.sum):'—'}</b></td></tr>`).join('')}
            <tr style="background:rgba(245,166,35,.08);font-weight:800"><td>الإجمالي (٦ أشهر)</td><td>${tot.draft}</td><td>${tot.sent}</td><td>${tot.sale}</td><td>${tot.cancel}</td><td>${money(tot.sum)}</td></tr>
          </tbody></table>`;
        })()}
      </div>
      <div class="card"><h3><i data-lucide="receipt-text"></i> آخر الفواتير</h3>${miniList(allInv.slice(-5).reverse(),i=>`${esc(resolveClientName(i))} — ${money(invTotal(i))} ${pill(i.status)}`,'لا فواتير')}</div>
      <div class="card"><h3><i data-lucide="calendar-clock"></i> مواعيد قادمة</h3>${miniList(S.appointments.filter(a=>a.datetime>=new Date().toISOString()).sort((a,b)=>a.datetime.localeCompare(b.datetime)).slice(0,5),a=>`${esc(a.title)} — ${a.datetime.replace('T',' ')}`,'لا مواعيد')}</div>
    </div>`;
  loadVisits();refreshIcons();
}
async function loadVisits(){const box=document.getElementById('visitsBox');if(!box)return;try{
  const since30=new Date(Date.now()-30*864e5).toISOString();const since1=new Date(Date.now()-864e5).toISOString();
  const t=await sb.from('pageviews').select('*',{count:'exact',head:true});if(t.error)throw t.error;
  const m=await sb.from('pageviews').select('*',{count:'exact',head:true}).gte('created_at',since30);
  const day=await sb.from('pageviews').select('*',{count:'exact',head:true}).gte('created_at',since1);
  const fmt=n=>Number(n||0).toLocaleString('en-US');
  box.innerHTML=`<div style="display:flex;gap:22px;flex-wrap:wrap">
    <div><div style="font-size:26px;font-weight:800">${fmt(t.count)}</div><div style="color:var(--muted);font-size:13px">إجمالي الزيارات</div></div>
    <div><div style="font-size:26px;font-weight:800">${fmt(m.count)}</div><div style="color:var(--muted);font-size:13px">آخر ٣٠ يوم</div></div>
    <div><div style="font-size:26px;font-weight:800">${fmt(day.count)}</div><div style="color:var(--muted);font-size:13px">آخر ٢٤ ساعة</div></div></div>`;
}catch(e){box.innerHTML='<p style="color:var(--muted);font-size:13px">لتفعيل العدّاد: شغّل ملف <b>supabase/analytics.sql</b> في Supabase (جدول ziyarat/pageviews). يبدأ العدّ بعدها تلقائياً.</p>'}}
