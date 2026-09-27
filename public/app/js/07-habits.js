/*
 * 07-habits.js — العادات
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== العادات (تتبّع + ستريك + تذكيرات) ===== */
const PRAYERS=[['Fajr','الفجر'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
const PLEVELS=[
  {k:'mosque',label:'في وقتها وفي المسجد',short:'مسجد',score:3,c:'#22c55e'},
  {k:'ontime',label:'في وقتها في البيت',short:'وقتها',score:2,c:'#eab308'},
  {k:'late',label:'متأخرة',short:'متأخرة',score:1,c:'#ef4444'}
];
const HABIT_ICONS=['pen-line','clapperboard','book-open','dumbbell','droplets','moon','sun-medium','heart-pulse','brain','languages','code','mic','camera','graduation-cap','wallet','footprints'];
const HABIT_COLORS=['#3b82f6','#8b5cf6','#22c55e','#f59e0b','#ec4899','#14b8a6','#ef4444','#0ea5e9'];
function dayKey(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function hb(){if(!S.habits)S.habits={list:[],log:{},prayer:{},reminded:{}};const h=S.habits;if(!h.log)h.log={};if(!h.prayer)h.prayer={};if(!h.reminded)h.reminded={};if(!Array.isArray(h.list))h.list=[];return h}
function habitDone(id,day){day=day||localDay();const l=hb().log[day];return !!(l&&l[id])}
function toggleHabit(id){const d=localDay();const l=hb().log;if(!l[d])l[d]={};if(l[d][id])delete l[d][id];else l[d][id]=true;save();if(CUR==='habits')renderHabits();else if(CUR==='home')renderHome()}
// إنجاز تلقائي: تُستدعى من التطبيقات المرتبطة (مثل بنك الأفكار) لاحتساب العادة المرتبطة يوم اليوم
function autoHabitByApp(app){const H=hb();const d=localDay();if(!H.log[d])H.log[d]={};let ch=false,name='';H.list.forEach(h=>{if(h.linkedApp===app&&!H.log[d][h.id]){H.log[d][h.id]=true;ch=true;name=h.name}});if(ch){save();if(CUR==='habits')renderHabits();else if(CUR==='home')renderHome();try{notifyMe('عادة أُنجزت ✓',name+' — احتُسبت تلقائياً')}catch(e){}}return ch}
function habitStreak(id){const l=hb().log;const d=new Date();if(!habitDone(id,dayKey(d)))d.setDate(d.getDate()-1);let s=0;while(l[dayKey(d)]&&l[dayKey(d)][id]){s++;d.setDate(d.getDate()-1)}return s}
function prayerGet(p,day){day=day||localDay();const r=hb().prayer[day];return (r&&r[p])||''}
function setPrayer(p,lvl){const d=localDay();const pr=hb().prayer;if(!pr[d])pr[d]={};if(pr[d][p]===lvl)delete pr[d][p];else pr[d][p]=lvl;save();if(CUR==='habits')renderHabits();else if(CUR==='home')renderHome()}
function prayerDayScore(day){let sc=0;PRAYERS.forEach(pr=>{const lv=PLEVELS.find(x=>x.k===prayerGet(pr[0],day));if(lv)sc+=lv.score});return sc}
function prayerDayCount(day){let n=0;PRAYERS.forEach(pr=>{if(prayerGet(pr[0],day))n++});return n}
function prayerStreak(){const d=new Date();if(prayerDayCount(dayKey(d))<5)d.setDate(d.getDate()-1);let s=0;while(prayerDayCount(dayKey(d))>=5){s++;d.setDate(d.getDate()-1)}return s}

function renderHabits(){
  const H=hb();const list=H.list;
  const doneToday=list.filter(h=>habitDone(h.id)).length;
  const maxStreak=Math.max(0,...list.map(h=>habitStreak(h.id)));
  const pCount=prayerDayCount(localDay());const pScore=prayerDayScore(localDay());const pPct=Math.round(pScore/15*100);
  const pStreak=prayerStreak();
  // آخر ٧ أيام: نسبة إنجاز العادات
  const week=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=dayKey(d);const done=list.filter(h=>habitDone(h.id,k)).length;week.push({k,lbl:d.toLocaleDateString('ar-EG-u-nu-latn',{weekday:'short'}),n:done,pct:list.length?Math.round(done/list.length*100):0})}
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="repeat"></i> العادات</h1>
      <button class="btn btn-gold" onclick="habitModal()"><i data-lucide="plus"></i> عادة جديدة</button></div>
    <div class="stats" style="margin-bottom:20px">
      <div class="stat"><span class="ic"><i data-lucide="check-check"></i></span><div class="v">${doneToday}/${list.length}</div><div class="l">عادات اليوم</div></div>
      <div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="flame"></i></span><div class="v">${maxStreak}</div><div class="l">أطول ستريك (يوم)</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="moon-star"></i></span><div class="v">${pCount}/5</div><div class="l">صلوات اليوم${pStreak>0?` · ستريك ${pStreak}`:''}</div></div>
      <div class="stat"><span class="ic" style="color:#eab308"><i data-lucide="gauge"></i></span><div class="v">${pPct}%</div><div class="l">جودة الصلاة اليوم</div></div>
    </div>
    <div class="grid">
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="list-checks"></i> عادات اليوم — ${localDay()}</h3>
        ${list.length?list.map(h=>{const done=habitDone(h.id);const st=habitStreak(h.id);return `
          <div style="display:flex;align-items:center;gap:12px;padding:11px;border:1px solid ${done?hexA(h.color,.5):'var(--line)'};border-radius:14px;background:${done?hexA(h.color,.12):'rgba(255,255,255,.03)'};margin-bottom:9px">
            <button onclick="toggleHabit('${h.id}')" title="اضغط لتسجيل الإنجاز" style="flex:none;width:36px;height:36px;border-radius:50%;border:2px solid ${done?h.color:'var(--line)'};background:${done?h.color:'transparent'};color:#fff;cursor:pointer;display:grid;place-items:center">${done?'<i data-lucide=\'check\' style=\'width:18px;height:18px\'></i>':''}</button>
            <span class="inl" style="color:${h.color}">${iconHTML(h.icon,'circle',19)}</span>
            <div style="flex:1;min-width:0"><div style="font-weight:700">${esc(h.name)}</div><div style="font-size:12px;color:var(--muted)">${h.desc?esc(h.desc):''}${h.reminder?`${h.desc?' · ':''}<i class='inl' data-lucide='bell'></i> ${h.reminder}`:''}</div></div>
            ${st>0?`<span style="display:inline-flex;align-items:center;gap:3px;color:#f59e0b;font-weight:800;font-size:14px" title="أيام متتالية"><i data-lucide="flame" style="width:16px;height:16px"></i>${st}</span>`:''}
            ${h.linkedApp?`<button class="btn btn-ghost btn-sm" onclick="go('${h.linkedApp}')" title="افتح الأداة"><i data-lucide="external-link"></i></button>`:h.link?`<a class="btn btn-ghost btn-sm" href="${h.link}" title="افتح الأداة"><i data-lucide="external-link"></i></a>`:''}
            <button class="btn btn-ghost btn-sm" onclick="habitModal('${h.id}')" title="تعديل"><i data-lucide="settings"></i></button>
          </div>`}).join(''):'<p style="color:var(--muted)">لا عادات بعد. أضف أول عادة تلتزم بها.</p>'}
        <button class="btn btn-ghost btn-sm" onclick="habitModal()" style="margin-top:4px"><i data-lucide="plus"></i> أضف عادة</button>
      </div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="moon-star"></i> الصلاة اليوم</h3>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="flex:1;height:12px;background:var(--panel3);border-radius:7px;overflow:hidden"><i style="display:block;height:100%;width:${pPct}%;background:linear-gradient(90deg,#22c55e,#eab308);transition:width .3s"></i></div>
          <b style="font-size:13px;color:var(--gold2)">${pScore}/15</b></div>
        ${PRAYERS.map(pr=>{const cur=prayerGet(pr[0]);return `
          <div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--line)">
            <div style="width:52px;font-weight:700;font-size:13px">${pr[1]}</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;flex:1">
              ${PLEVELS.map(lv=>{const on=cur===lv.k;return `<button onclick="setPrayer('${pr[0]}','${lv.k}')" style="padding:6px 10px;border-radius:9px;font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;border:1px solid ${on?lv.c:'var(--line)'};background:${on?lv.c:'transparent'};color:${on?'#fff':'var(--muted)'}">${lv.label}</button>`}).join('')}
            </div></div>`}).join('')}
        <div class="badge-note" style="margin-top:12px"><i data-lucide="info"></i> <div>الأفضل: <b style="color:#22c55e">في وقتها وفي المسجد</b>، ثم <b style="color:#eab308">في وقتها في البيت</b>، ثم <b style="color:#ef4444">متأخرة</b>. سجّل كل صلاة يومياً لترى تقدّمك.</div></div>
      </div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="bar-chart-3"></i> إنجاز العادات — آخر ٧ أيام</h3>
        <div style="display:flex;align-items:flex-end;gap:12px;height:150px;padding-top:8px">
        ${week.map(m=>`<div style="flex:1;text-align:center"><div style="font-size:11px;margin-bottom:4px">${m.n}</div><div style="height:${Math.round(m.pct/100*110)}px;background:linear-gradient(180deg,var(--gold2),var(--gold));border-radius:7px 7px 0 0;min-height:3px" title="${m.pct}%"></div><div style="font-size:11px;color:var(--muted);margin-top:6px">${m.lbl}</div></div>`).join('')}</div></div>
      <div class="card" style="grid-column:span 2;min-width:300px"><h3><i data-lucide="calendar-check"></i> جودة الصلاة — آخر ٧ أيام</h3>
        ${prayerWeekGrid()}
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:var(--muted)">
          ${PLEVELS.map(lv=>`<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:3px;background:${lv.c};display:inline-block"></span>${lv.label}</span>`).join('')}
          <span style="display:inline-flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:3px;background:rgba(255,255,255,.08);display:inline-block"></span>لم تُسجَّل</span>
        </div></div>
      <div class="card" style="grid-column:span 4;min-width:300px"><h3><i data-lucide="grid-3x3"></i> خريطة الالتزام — آخر ٣٠ يوم</h3>
        ${list.length?list.map(h=>`<div style="margin:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><span style="font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px"><span style="color:${h.color}">${iconHTML(h.icon,'circle',15)}</span>${esc(h.name)}</span><span style="font-size:12px;color:var(--muted)">${habitMonthCount(h.id)}/30 يوم${habitStreak(h.id)>0?` · <span style="color:#f59e0b;display:inline-flex;align-items:center;gap:2px"><i data-lucide="flame" style="width:12px;height:12px"></i>${habitStreak(h.id)}</span>`:''}</span></div>
          <div style="display:grid;grid-template-columns:repeat(30,1fr);gap:3px">${habitHeatRow(h)}</div></div>`).join(''):'<p style="color:var(--muted)">أضف عادات لعرض خريطة الالتزام.</p>'}
      </div>
    </div>`;
  applyWallpaper();refreshIcons();
}
function habitMonthCount(id){let n=0;for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);if(habitDone(id,dayKey(d)))n++}return n}
function habitHeatRow(h){let c='';for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const done=habitDone(h.id,dayKey(d));c+=`<span title="${dayKey(d)}" style="aspect-ratio:1;border-radius:3px;background:${done?h.color:'rgba(255,255,255,.06)'};border:1px solid rgba(255,255,255,.04)"></span>`}return c}
function prayerWeekGrid(){
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d)}
  const head=`<div></div>`+days.map(d=>`<div style="text-align:center;font-size:10px;color:var(--muted)">${d.getDate()}</div>`).join('');
  const rows=PRAYERS.map(pr=>{const cells=days.map(d=>{const lv=PLEVELS.find(x=>x.k===prayerGet(pr[0],dayKey(d)));const col=lv?lv.c:'rgba(255,255,255,.08)';return `<span title="${pr[1]} ${dayKey(d)}${lv?' — '+lv.label:''}" style="aspect-ratio:1;border-radius:4px;background:${col};border:1px solid rgba(255,255,255,.04)"></span>`}).join('');return `<div style="font-size:12px;font-weight:700;display:flex;align-items:center">${pr[1]}</div>${cells}`}).join('');
  return `<div style="display:grid;grid-template-columns:52px repeat(7,1fr);gap:4px;align-items:center">${head}${rows}</div>`;
}
function habitModal(id){
  const H=hb();let h=id?{...H.list.find(x=>x.id===id)}:{id:'',name:'',desc:'',icon:'circle-check-big',color:HABIT_COLORS[0],reminder:''};
  const icons=HABIT_ICONS.map(n=>`<button type="button" class="icon-pick${h.icon===n?' on':''}" data-n="${n}" onclick="pickHabitIcon('${n}')" style="width:40px;height:40px;border-radius:11px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;display:grid;place-items:center"><i data-lucide="${n}"></i></button>`).join('');
  const colors=HABIT_COLORS.map(c=>`<button type="button" data-c="${c}" onclick="pickHabitColor('${c}')" class="hcolor${h.color===c?' on':''}" style="width:30px;height:30px;border-radius:50%;border:2px solid ${h.color===c?'#fff':'transparent'};background:${c};cursor:pointer"></button>`).join('');
  openModal(id?'تعديل عادة':'عادة جديدة',`
    <div class="field"><label>اسم العادة</label><input id="h_name" value="${esc(h.name)}" placeholder="مثال: قراءة ٢٠ دقيقة"></div>
    <div class="field"><label>وصف مختصر (اختياري)</label><input id="h_desc" value="${esc(h.desc||'')}" placeholder="تفاصيل تذكّرك بالهدف"></div>
    <div class="field"><label>الأيقونة</label><div style="display:flex;gap:7px;flex-wrap:wrap">${icons}</div><input type="hidden" id="h_icon" value="${esc(h.icon)}"></div>
    <div class="field"><label>اللون</label><div style="display:flex;gap:9px;flex-wrap:wrap">${colors}</div><input type="hidden" id="h_color" value="${esc(h.color)}"></div>
    <div class="field"><label>تذكير يومي (اختياري)</label><input type="time" id="h_rem" value="${esc(h.reminder||'')}"><div class="badge-note" style="margin-top:8px"><i data-lucide="bell"></i> <div>سيصلك تنبيه في هذا الوقت إن لم تكن أنجزت العادة (يتطلب السماح بالإشعارات وأن يكون النظام مفتوحاً).</div></div></div>`,
  ()=>{const g=i=>document.getElementById(i).value;h.name=g('h_name').trim();h.desc=g('h_desc').trim();h.icon=g('h_icon');h.color=g('h_color');h.reminder=g('h_rem');if(!h.name){alert('أدخل اسم العادة');return}if(id){const i=H.list.findIndex(x=>x.id===id);H.list[i]={...H.list[i],...h}}else{h.id='h_'+uid();H.list.push(h)}save();closeModal();renderHabits()},
  id?()=>{if(!confirm('حذف هذه العادة؟ (سيبقى سجلّها محفوظاً)'))return;H.list=H.list.filter(x=>x.id!==id);save();closeModal();renderHabits()}:null);
  if(window.Notification&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}
}
function pickHabitIcon(n){const el=document.getElementById('h_icon');if(el)el.value=n;document.querySelectorAll('.icon-pick').forEach(b=>b.classList.toggle('on',b.dataset.n===n))}
function pickHabitColor(c){const el=document.getElementById('h_color');if(el)el.value=c;document.querySelectorAll('.hcolor').forEach(b=>{const on=b.dataset.c===c;b.style.borderColor=on?'#fff':'transparent';b.classList.toggle('on',on)})}
function checkHabitReminders(){
  const H=hb();const day=localDay();if(!H.reminded[day])H.reminded[day]={};
  const now=new Date();const hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  let changed=false;
  H.list.forEach(h=>{if(!h.reminder)return;if(H.reminded[day][h.id])return;if(hm>=h.reminder&&!habitDone(h.id,day)){H.reminded[day][h.id]=true;changed=true;beep(2);notifyMe('تذكير عادة: '+h.name,h.desc||'حان وقت إنجاز هذه العادة اليوم');}});
  if(changed)save();
}
