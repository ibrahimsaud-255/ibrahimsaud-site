/*
 * 18-workspace.js — النوافذ ومساحة العمل
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== MODAL ===== */
/* ===== مساحة العمل (بديل Notion — لوحة + مهام الفريق + قوالب + ملفات + تطوّر) ===== */
let WS_TAB='board', WS_ASSIGNEE='all', WS_CAL={y:null,m:null};
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: let WS_DEMO=/[?&]demo=/.test(location.search); */
const WS_TYPES={campaign:{label:'حملة إعلانية',icon:'megaphone',color:'#f5a623'},design:{label:'تصميم',icon:'palette',color:'#a855f7'},event:{label:'فعالية',icon:'calendar-heart',color:'#ec4899'},post:{label:'منشور',icon:'image',color:'#3b82f6'},task:{label:'مهمة',icon:'check-square',color:'#64748b'}};
const WS_STATUS=[{key:'todo',label:'قيد الانتظار'},{key:'doing',label:'قيد التنفيذ'},{key:'review',label:'مراجعة'},{key:'done',label:'منجز'}];
const WS_CHAN={instagram:{label:'إنستقرام',color:'#e1306c'},tiktok:{label:'تيك توك',color:'#111'},snapchat:{label:'سناب',color:'#e6b800'},x:{label:'إكس',color:'#1d9bf0'},youtube:{label:'يوتيوب',color:'#ff0000'},general:{label:'عام',color:'#8a8a92'}};
const WS_TEMPLATES=[
  {type:'campaign',title:'حملة إعلانية جديدة',notes:'الهدف:\nالجمهور المستهدف:\nالميزانية:\nالقنوات:\nمؤشر النجاح (KPI):'},
  {type:'design',title:'طلب تصميم',notes:'المقاس:\nالنص المطلوب:\nالمرجع/الستايل:\nالموعد النهائي:'},
  {type:'event',title:'تجهيز فعالية',notes:'التاريخ:\nالمكان:\nالمتطلبات:\nالمسؤول:'},
  {type:'post',title:'منشور جديد',notes:'المنصّة:\nالفكرة:\nالكابشن:\nالهاشتاقات:\nموعد النشر:'}
];
function ws(){if(!S.workspace||typeof S.workspace!=='object')S.workspace=JSON.parse(JSON.stringify(def.workspace));const w=S.workspace;if(!Array.isArray(w.team))w.team=JSON.parse(JSON.stringify(def.workspace.team));['tasks','events','files'].forEach(k=>{if(!Array.isArray(w[k]))w[k]=[]});if(!w.brand)w.brand=JSON.parse(JSON.stringify(def.workspace.brand));if(!w.growth)w.growth={journey:[],resources:[]};if(!Array.isArray(w.growth.journey))w.growth.journey=[];if(!Array.isArray(w.growth.resources))w.growth.resources=[];w.events.forEach(e=>{if(!e.start)e.start=e.date||today();if(!e.end)e.end=e.start});return w}
function wsMember(id){return ws().team.find(m=>m.id===id)}
function gcalUrl(t){const base=(t.due||today());const s=base.replace(/-/g,'');const e=new Date(base+'T00:00:00');e.setDate(e.getDate()+1);const ee=`${e.getFullYear()}${String(e.getMonth()+1).padStart(2,'0')}${String(e.getDate()).padStart(2,'0')}`;return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.title||'مهمة')}&dates=${s}/${ee}&details=${encodeURIComponent(t.notes||'')}`}
function chatgptUrl(t){return `https://chatgpt.com/?q=${encodeURIComponent('ساعدني في هذه المهمة: '+(t.title||'')+(t.notes?'\n'+t.notes:''))}`}
function ensureWorkspaceStyles(){if(document.getElementById('wsCSS'))return;const st=document.createElement('style');st.id='wsCSS';st.textContent=`
  .ws-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px;border-bottom:1px solid var(--line)}
  .ws-tab{display:inline-flex;align-items:center;gap:6px;padding:10px 15px;border:none;background:transparent;color:var(--muted);font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;border-bottom:2.5px solid transparent;margin-bottom:-1px}
  .ws-tab:hover{color:var(--ink)}
  .ws-tab.on{color:var(--ink);border-bottom-color:var(--gold)}
  .ws-tab i{width:16px;height:16px}
  .ws-cal-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
  .ws-grid7{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .ws-dow{text-align:center;font-size:11.5px;color:var(--muted);font-weight:700;padding:2px 0}
  .ws-day{min-height:84px;border:1px solid var(--line);border-radius:10px;padding:5px 6px;cursor:pointer;background:var(--panel);transition:.12s;overflow:hidden}
  .ws-day:hover{border-color:var(--gold)}
  .ws-day.empty{background:transparent;border-color:transparent;cursor:default}
  .ws-day.today .ws-day-n{background:var(--gold);color:#1a1205;border-radius:6px;padding:0 6px}
  .ws-day-n{font-size:12px;color:var(--muted);font-weight:700;display:inline-block}
  .ws-ev{font-size:10.5px;color:#fff;border-radius:5px;padding:1px 5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;font-weight:600}
  .ws-mini{display:inline-flex;align-items:center;justify-content:center;width:28px;height:26px;border:1px solid var(--line);border-radius:7px;background:var(--panel2);color:var(--ink);cursor:pointer;text-decoration:none}
  .ws-mini:hover{border-color:var(--gold)}
  .ws-mini i{width:14px;height:14px}
  .ws-mem{display:flex;align-items:center;gap:11px;padding:12px 14px;border:1px solid var(--line);border-radius:13px;background:var(--panel)}
  .ws-dot{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;flex:none}
  .ws-sw{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);cursor:pointer;position:relative}
  .ws-sw .x{position:absolute;top:-6px;right:-6px;background:var(--bad);color:#fff;width:16px;height:16px;border-radius:50%;font-size:11px;line-height:16px;text-align:center;display:none}
  .ws-sw:hover .x{display:block}
  .ws-tagchip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:var(--panel2);border:1px solid var(--line);font-size:13px;font-weight:700}
  .ws-res{display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--panel);margin-bottom:8px}
  .ws-jrow{display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--panel);margin-bottom:8px}
  .ws-check{width:22px;height:22px;border-radius:7px;border:2px solid var(--line);cursor:pointer;flex:none;display:grid;place-items:center}
  .ws-check.on{background:var(--good);border-color:var(--good);color:#fff}
  /* Liquid Glass */
  .ws-wrap{--fc-border-color:rgba(150,150,170,.16);--fc-page-bg-color:transparent;--fc-neutral-bg-color:rgba(150,150,170,.05);--fc-today-bg-color:rgba(245,166,35,.14);--fc-button-bg-color:rgba(150,150,170,.12);--fc-button-border-color:rgba(150,150,170,.18);--fc-button-hover-bg-color:rgba(150,150,170,.22);--fc-button-hover-border-color:rgba(150,150,170,.26);--fc-button-active-bg-color:var(--gold);--fc-button-active-border-color:var(--gold);--fc-button-text-color:var(--ink)}
  .ws-wrap .card{background:rgba(16,16,22,.5);-webkit-backdrop-filter:blur(24px) saturate(1.5);backdrop-filter:blur(24px) saturate(1.5);border:1px solid rgba(255,255,255,.1);box-shadow:0 10px 34px rgba(0,0,0,.24)}
  .ws-wrap .ws-tabs{border-bottom-color:rgba(150,150,170,.16)}
  .ws-wrap .ws-mem,.ws-wrap .ws-res,.ws-wrap .ws-jrow{background:rgba(150,150,170,.06);border-color:rgba(255,255,255,.08)}
  .ws-wrap .fc{color:var(--ink);font-family:inherit}
  .ws-wrap .fc a{color:inherit;text-decoration:none}
  .ws-wrap .fc .fc-toolbar-title{font-size:17px;font-weight:800}
  .ws-wrap .fc .fc-button{font-weight:700;border-radius:10px;text-transform:none;box-shadow:none;padding:6px 12px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  .ws-wrap .fc .fc-button-primary:not(:disabled).fc-button-active{color:#1a1205}
  .ws-wrap .fc .fc-daygrid-day-number{color:var(--ink);opacity:.7;font-weight:700;font-size:12.5px;padding:6px 8px}
  .ws-wrap .fc .fc-col-header-cell-cushion{color:var(--muted);font-weight:700;font-size:12.5px;padding:9px 4px}
  .ws-wrap .fc .fc-daygrid-day{transition:background .12s}
  .ws-wrap .fc .fc-daygrid-day:hover{background:rgba(150,150,170,.06)}
  .ws-wrap .fc-daygrid-event{border-radius:7px;padding:0;margin:1px 3px;box-shadow:0 2px 9px rgba(0,0,0,.2);overflow:hidden;min-height:22px;display:flex;align-items:center}
  .ws-wrap .fc .fc-scrollgrid{border-radius:14px;overflow:hidden}
  .ws-wrap .fc-theme-standard td,.ws-wrap .fc-theme-standard th{border-color:var(--fc-border-color)}
  .ws-wrap .fc .fc-daygrid-day.fc-day-today{border-radius:0}
  :root[data-theme="light"] .ws-wrap .card{background:rgba(255,255,255,.62);border-color:rgba(0,0,0,.08)}
  :root[data-theme="light"] .ws-wrap .ws-mem,:root[data-theme="light"] .ws-wrap .ws-res,:root[data-theme="light"] .ws-wrap .ws-jrow{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.08)}
  :root[data-theme="light"] .ws-wrap{--fc-border-color:rgba(0,0,0,.1);--fc-neutral-bg-color:rgba(0,0,0,.03);--fc-today-bg-color:rgba(245,166,35,.16);--fc-button-bg-color:rgba(0,0,0,.06);--fc-button-border-color:rgba(0,0,0,.12);--fc-button-hover-bg-color:rgba(0,0,0,.12);--fc-button-hover-border-color:rgba(0,0,0,.16);--fc-button-text-color:var(--ink)}
  :root[data-theme="light"] .ws-wrap .fc .fc-daygrid-day:hover{background:rgba(0,0,0,.04)}
`;document.head.appendChild(st)}
function renderWorkspace(){
  ensureWorkspaceStyles();ws();
  const TABS=[['board','لوحة المساحة','layout-dashboard'],['tasks','المهام','list-checks'],['templates','القوالب','copy'],['files','الملفات والهوية','folder'],['growth','التطوّر المهني','graduation-cap']];
  document.getElementById('main').innerHTML=`
    <div class="ws-wrap">
    <div class="page-head"><h1><i data-lucide="layout-dashboard"></i> مساحة العمل</h1>${WS_DEMO?'':`<button class="btn btn-ghost btn-sm" onclick="wsShare()"><i data-lucide="share-2"></i> مشاركة مع العميل</button>`}</div>
    <div class="ws-tabs">${TABS.map(t=>`<button class="ws-tab${WS_TAB===t[0]?' on':''}" onclick="wsTab('${t[0]}')"><i data-lucide="${t[2]}"></i> ${t[1]}</button>`).join('')}</div>
    <div id="ws_body"></div>
    </div>`;
  wsBody();refreshIcons();
}
function wsShare(){const url=location.origin+location.pathname+'?demo=1';const box=`<p style="color:var(--muted);margin:0 0 14px;font-size:13.5px">رابط تجريبي لمساحة العمل — يفتحه العميل ويحوس فيه بحرية (نسخة تجريبية ببياناتها الخاصة على جهازه، لا تؤثّر على بياناتك).</p>
    <div class="field"><label>الرابط</label><input id="ws_share_url" value="${esc(url)}" readonly dir="ltr" onclick="this.select()"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-gold" onclick="navigator.clipboard.writeText('${esc(url)}').then(()=>{this.innerHTML='✓ تم النسخ'})"><i data-lucide="copy"></i> نسخ الرابط</button><a class="btn btn-ghost" href="${esc(url)}" target="_blank"><i data-lucide="external-link"></i> فتح التجربة</a></div>`;
  openModal('مشاركة مساحة العمل',box,null,null);
}
function wsTab(t){WS_TAB=t;wsBody();refreshIcons()}
function wsBody(){const b=document.getElementById('ws_body');if(!b)return;
  b.innerHTML=({board:wsBoardHtml,tasks:wsTasksHtml,templates:wsTemplatesHtml,files:wsFilesHtml,growth:wsGrowthHtml}[WS_TAB]||wsBoardHtml)();
  refreshIcons();if(WS_TAB==='board')wsMountCal();}
/* ---- تبويب اللوحة: تقويم FullCalendar (أحداث ممتدّة + سحب + تمديد + صور) ---- */
let WSFC=null;
function wsAddDay(ds,n){const d=new Date(ds+'T00:00:00');d.setDate(d.getDate()+n);return wsDStr(d)}
function wsDStr(d){const z=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`}
function wsMountCal(){
  const el=document.getElementById('ws_fcal');if(!el)return;
  if(WSFC){try{WSFC.destroy()}catch(_){}WSFC=null}
  if(!window.FullCalendar){el.innerHTML='<p style="color:var(--muted)">التقويم غير متاح حالياً</p>';return}
  const events=ws().events.map(e=>{const ch=WS_CHAN[e.channel]||WS_CHAN.general;return{id:e.id,title:e.title,start:e.start,end:wsAddDay(e.end||e.start,1),allDay:true,backgroundColor:ch.color,borderColor:'transparent',textColor:bAutoText(ch.color),extendedProps:{image:e.image||''}}});
  WSFC=new FullCalendar.Calendar(el,{
    initialView:'dayGridMonth',direction:'rtl',locale:'ar',height:'auto',firstDay:6,
    headerToolbar:{start:'prev,next today',center:'title',end:'dayGridMonth,dayGridWeek'},
    buttonText:{today:'اليوم',month:'شهر',week:'أسبوع'},
    editable:true,eventStartEditable:true,eventDurationEditable:true,eventResizableFromStart:true,selectable:true,eventDisplay:'block',dayMaxEvents:3,
    views:{dayGridWeek:{dayMaxEvents:false}},
    events,
    eventContent:arg=>{const im=arg.event.extendedProps.image;const week=arg.view.type==='dayGridWeek';const box=document.createElement('div');
      if(week&&im){box.style.cssText='width:100%;border-radius:9px;overflow:hidden;position:relative;line-height:0';const g=document.createElement('img');g.src=im;g.style.cssText='width:100%;aspect-ratio:1/1;object-fit:cover;display:block';box.appendChild(g);const s=document.createElement('span');s.textContent=arg.event.title;s.style.cssText='position:absolute;left:0;right:0;bottom:0;padding:6px 8px;font-size:13px;font-weight:800;color:#fff;line-height:1.3;background:linear-gradient(transparent,rgba(0,0,0,.78))';box.appendChild(s);}
      else{box.style.cssText='display:flex;align-items:center;gap:5px;padding:'+(week?'4px 7px':'1px 5px')+';overflow:hidden;width:100%';if(im){const g=document.createElement('img');g.src=im;g.style.cssText='width:20px;height:20px;border-radius:5px;object-fit:cover;flex:none';box.appendChild(g)}const s=document.createElement('span');s.textContent=arg.event.title;s.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:'+(week?'13px':'12px')+'';box.appendChild(s);}
      return{domNodes:[box]}},
    dateClick:info=>wsEventModal('',info.dateStr.slice(0,10)),
    eventClick:info=>wsEventModal(info.event.id),
    eventDrop:info=>wsSaveEvDates(info.event),
    eventResize:info=>wsSaveEvDates(info.event)
  });
  WSFC.render();
}
function wsSaveEvDates(ev){const e=ws().events.find(x=>x.id===ev.id);if(!e||!ev.start)return;e.start=wsDStr(ev.start);const end=ev.end?new Date(ev.end.getTime()-86400000):new Date(ev.start);e.end=wsDStr(end);save()}
function wsBoardHtml(){
  const w=ws();const tk=today();
  const soon=w.tasks.filter(t=>t.status!=='done'&&t.due).sort((a,b)=>(a.due||'').localeCompare(b.due||'')).slice(0,6);
  return `<div class="grid">
    <div class="card" style="grid-column:1/-1"><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px"><h3 style="margin:0"><i data-lucide="calendar-range"></i> التقويم التسويقي</h3><button class="btn btn-gold btn-sm" onclick="wsEventModal('','${tk}')"><i data-lucide="plus"></i> حدث</button></div><div id="ws_fcal" style="margin-top:4px"></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:var(--muted)">${Object.keys(WS_CHAN).map(k=>`<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:${WS_CHAN[k].color};display:inline-block"></span>${WS_CHAN[k].label}</span>`).join('')}</div>
    </div>
    <div class="card" style="grid-column:span 2;min-width:280px"><h3><i data-lucide="alarm-clock"></i> مهام قادمة</h3>
      ${soon.length?soon.map(t=>{const m=wsMember(t.assignee),ty=WS_TYPES[t.type]||WS_TYPES.task;return `<div style="display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="wsTaskModal('${t.id}')"><span style="width:9px;height:9px;border-radius:50%;background:${ty.color};flex:none"></span><span style="flex:1;font-size:13.5px">${esc(t.title)}</span>${m?`<span class="ws-dot" style="width:22px;height:22px;font-size:10px;background:${m.color}">${esc((m.name||'?')[0])}</span>`:''}${dueChip(t.due)}</div>`}).join(''):'<p style="color:var(--muted)">لا مهام قادمة. أضف مهمة من تبويب «المهام».</p>'}
    </div>
    <div class="card" style="min-width:240px"><h3><i data-lucide="zap"></i> روابط سريعة</h3>
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="https://calendar.google.com" target="_blank" class="btn btn-ghost btn-sm" style="justify-content:flex-start"><i data-lucide="calendar"></i> Google Calendar</a>
        <a href="https://chatgpt.com" target="_blank" class="btn btn-ghost btn-sm" style="justify-content:flex-start"><i data-lucide="message-square"></i> ChatGPT</a>
        <button class="btn btn-ghost btn-sm" style="justify-content:flex-start" onclick="go('newsletter')"><i data-lucide="mail"></i> البريد</button>
      </div>
    </div>
    <div class="card" style="grid-column:1/-1"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><h3 style="margin:0"><i data-lucide="users"></i> الفريق</h3><button class="btn btn-ghost btn-sm" onclick="wsMemberModal('')"><i data-lucide="user-plus"></i> إضافة عضو</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">
      ${w.team.map(m=>{const open=w.tasks.filter(t=>t.assignee===m.id&&t.status!=='done').length;return `<div class="ws-mem"><span class="ws-dot" style="background:${m.color}">${esc((m.name||'?')[0])}</span><div style="flex:1"><div style="font-weight:700">${esc(m.name)}</div><div style="font-size:12px;color:var(--muted)">${esc(m.role||'')}</div></div><div style="text-align:center"><div style="font-weight:800;color:var(--gold)">${open}</div><div style="font-size:10px;color:var(--muted)">مهمة</div></div><button class="btn btn-ghost btn-sm" onclick="wsMemberModal('${m.id}')"><i data-lucide="pencil"></i></button></div>`}).join('')}
      </div>
    </div>
  </div>`;
}
/* ---- تبويب المهام ---- */
function wsTasksHtml(){
  const w=ws();const chips=[['all','الكل']].concat(w.team.map(m=>[m.id,m.name]));
  const list=w.tasks.filter(t=>WS_ASSIGNEE==='all'||t.assignee===WS_ASSIGNEE);
  return `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
      <div style="display:flex;gap:7px;flex-wrap:wrap">${chips.map(c=>`<button class="ws-chip${WS_ASSIGNEE===c[0]?' on':''}" onclick="wsFilter('${c[0]}')">${esc(c[1])}</button>`).join('')}</div>
      <button class="btn btn-gold" onclick="wsTaskModal('')"><i data-lucide="plus"></i> مهمة جديدة</button></div>
    ${!list.length?emptyBox('list-checks','لا مهام هنا بعد. أضف مهمة أو ابدأ من «القوالب».'):
    `<div class="kanban">${WS_STATUS.map(st=>{const items=list.filter(t=>(t.status||'todo')===st.key);return `<div class="kcol" ondragover="dover(event)" ondragleave="dleave(event)" ondrop="wsDrop(event,'${st.key}')">
      <h4><span>${st.label}</span><span class="kbadge">${items.length}</span></h4>
      ${items.map(wsTaskCard).join('')||'<p style="color:var(--muted);font-size:12px">اسحب هنا</p>'}
    </div>`}).join('')}</div>`}`;
}
function wsTaskCard(t){const m=wsMember(t.assignee),ty=WS_TYPES[t.type]||WS_TYPES.task;
  return `<div class="kitem" draggable="true" ondragstart="wsDrag(event,'${t.id}')" onclick="wsTaskModal('${t.id}')">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><span style="font-size:10.5px;font-weight:700;color:#fff;background:${ty.color};border-radius:6px;padding:1px 7px">${ty.label}</span>${t.priority==='high'?'<span style="color:#ef4444;font-size:11px">● عاجل</span>':''}</div>
    <div style="font-weight:600;font-size:13.5px;line-height:1.4">${esc(t.title)}</div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:7px;flex-wrap:wrap">${m?`<span class="ws-dot" style="width:20px;height:20px;font-size:10px;background:${m.color}">${esc((m.name||'?')[0])}</span><span style="font-size:11px;color:var(--muted)">${esc(m.name)}</span>`:''}${t.due?dueChip(t.due):''}</div>
    <div style="display:flex;gap:5px;margin-top:9px" onclick="event.stopPropagation()"><a href="${gcalUrl(t)}" target="_blank" class="ws-mini" title="أضف لتقويم Google"><i data-lucide="calendar-plus"></i></a><a href="${chatgptUrl(t)}" target="_blank" class="ws-mini" title="افتح في ChatGPT"><i data-lucide="bot"></i></a></div>
  </div>`;
}
function wsFilter(a){WS_ASSIGNEE=a;wsBody()}
function wsDrag(ev,id){ev.dataTransfer.setData('wsid',id);ev.dataTransfer.effectAllowed='move'}
function wsDrop(ev,status){ev.preventDefault();ev.currentTarget.classList.remove('dragover');const id=ev.dataTransfer.getData('wsid');const t=ws().tasks.find(x=>x.id===id);if(t&&t.status!==status){t.status=status;save();wsBody()}}
function wsTaskModal(id,presetType){
  const w=ws();const t=id?{...w.tasks.find(x=>x.id===id)}:{id:'',title:'',assignee:w.team[0]?.id||'',type:presetType||'task',status:'todo',due:'',priority:'none',notes:'',date:today()};
  const memOpts=w.team.map(m=>`<option value="${m.id}" ${t.assignee===m.id?'selected':''}>${esc(m.name)} — ${esc(m.role||'')}</option>`).join('');
  const typeOpts=Object.keys(WS_TYPES).map(k=>`<option value="${k}" ${t.type===k?'selected':''}>${WS_TYPES[k].label}</option>`).join('');
  const stOpts=WS_STATUS.map(s=>`<option value="${s.key}" ${(t.status||'todo')===s.key?'selected':''}>${s.label}</option>`).join('');
  openModal(id?'تعديل مهمة':'مهمة جديدة',`
    <div class="field"><label>العنوان</label><input id="wt_title" value="${esc(t.title)}" placeholder="مثال: تصميم غلاف حملة رمضان"></div>
    <div class="row2"><div class="field"><label>المسؤول</label><select id="wt_asg">${memOpts}</select></div>
    <div class="field"><label>النوع</label><select id="wt_type">${typeOpts}</select></div></div>
    <div class="row2"><div class="field"><label>الحالة</label><select id="wt_status">${stOpts}</select></div>
    <div class="field"><label>الاستحقاق</label><input type="date" id="wt_due" value="${esc(t.due||'')}"></div></div>
    <div class="field"><label>الأهمية</label><select id="wt_prio"><option value="none" ${t.priority!=='high'?'selected':''}>عادية</option><option value="high" ${t.priority==='high'?'selected':''}>عاجلة</option></select></div>
    <div class="field"><label>تفاصيل / تشيك ليست</label><textarea id="wt_notes" rows="4">${esc(t.notes||'')}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;t.title=g('wt_title').trim();if(!t.title){alert('أدخل عنوان المهمة');return}t.assignee=g('wt_asg');t.type=g('wt_type');t.status=g('wt_status');t.due=g('wt_due');t.priority=g('wt_prio');t.notes=g('wt_notes');if(id){const i=w.tasks.findIndex(x=>x.id===id);w.tasks[i]=t}else{t.id=uid();w.tasks.push(t)}save();closeModal();wsBody()},
  id?()=>{if(confirm('حذف المهمة؟')){w.tasks=w.tasks.filter(x=>x.id!==id);save();closeModal();wsBody()}}:null);
}
/* ---- تبويب القوالب ---- */
function wsTemplatesHtml(){
  return `<p style="color:var(--muted);margin:0 0 16px">اختر قالباً لبدء مهمة جاهزة بحقولها. عدّلها ثم احفظها في «المهام».</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
    ${WS_TEMPLATES.map((tp,i)=>{const ty=WS_TYPES[tp.type];return `<div class="card" style="cursor:pointer" onclick="wsUseTemplate(${i})"><h3 style="margin:0 0 6px"><i data-lucide="${ty.icon}" style="color:${ty.color}"></i> ${ty.label}</h3><p style="color:var(--muted);font-size:12.5px;white-space:pre-line;margin:0">${esc(tp.notes)}</p><div style="margin-top:12px"><span class="btn btn-ghost btn-sm"><i data-lucide="plus"></i> بدء مهمة</span></div></div>`}).join('')}
    </div>`;
}
function wsUseTemplate(i){const tp=WS_TEMPLATES[i];if(!tp)return;wsTaskModal('',tp.type);setTimeout(()=>{const ti=document.getElementById('wt_title'),no=document.getElementById('wt_notes');if(ti&&!ti.value)ti.value=tp.title;if(no&&!no.value)no.value=tp.notes},30)}
/* ---- تبويب الملفات والهوية ---- */
function wsFilesHtml(){
  const w=ws();const CATS={logo:'شعارات',content:'محتوى',brand:'هوية',other:'أخرى'};
  return `<div class="grid">
    <div class="card" style="grid-column:1/-1"><h3><i data-lucide="palette"></i> الهوية البصرية</h3>
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px">الألوان</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px">${w.brand.colors.map((c,i)=>`<div class="ws-sw" style="background:${c}" title="${c}"><span class="x" onclick="wsDelColor(${i})">×</span></div>`).join('')}<label class="ws-mini" style="width:34px;height:34px" title="أضف لوناً"><i data-lucide="plus"></i><input type="color" style="opacity:0;width:0;height:0;position:absolute" onchange="wsAddColor(this.value)"></label></div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px">الخطوط</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px">${w.brand.fonts.map((f,i)=>`<span class="ws-tagchip">${esc(f)}<span onclick="wsDelFont(${i})" style="cursor:pointer;color:var(--bad)">×</span></span>`).join('')}<button class="ws-mini" style="width:auto;padding:0 10px" onclick="wsAddFont()"><i data-lucide="plus"></i></button></div>
      <div class="field"><label>ملاحظات الهوية (نبرة الصوت، إرشادات…)</label><textarea rows="3" onchange="ws().brand.notes=this.value;save()">${esc(w.brand.notes||'')}</textarea></div>
    </div>
    <div class="card" style="grid-column:1/-1"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><h3 style="margin:0"><i data-lucide="folder"></i> ملفات ومراجع</h3><button class="btn btn-gold btn-sm" onclick="wsFileModal('')"><i data-lucide="plus"></i> ملف/رابط</button></div>
      ${!w.files.length?'<p style="color:var(--muted)">لا ملفات بعد. أضف روابط (Drive / Figma / صور الهوية…).</p>':
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">${w.files.map(f=>`<div class="ws-res"><span style="width:34px;height:34px;border-radius:8px;background:var(--panel2);display:grid;place-items:center;flex:none"><i data-lucide="file"></i></span><div style="flex:1;min-width:0"><a href="${esc(f.url)}" target="_blank" style="font-weight:700;color:var(--ink);text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.name)}</a><div style="font-size:11px;color:var(--muted)">${CATS[f.cat]||'أخرى'}</div></div><button class="ws-mini" onclick="wsDelFile('${f.id}')"><i data-lucide="trash-2"></i></button></div>`).join('')}</div>`}
    </div>
  </div>`;
}
function wsAddColor(c){ws().brand.colors.push(c);save();wsBody()}
function wsDelColor(i){ws().brand.colors.splice(i,1);save();wsBody()}
function wsAddFont(){const f=prompt('اسم الخط:');if(f&&f.trim()){ws().brand.fonts.push(f.trim());save();wsBody()}}
function wsDelFont(i){ws().brand.fonts.splice(i,1);save();wsBody()}
function wsDelFile(id){if(!confirm('حذف الملف؟'))return;const w=ws();w.files=w.files.filter(f=>f.id!==id);save();wsBody()}
function wsFileModal(id){const w=ws();const f=id?{...w.files.find(x=>x.id===id)}:{id:'',name:'',url:'',cat:'other'};
  openModal(id?'تعديل ملف':'إضافة ملف/رابط',`
    <div class="field"><label>الاسم</label><input id="wf_name" value="${esc(f.name)}" placeholder="مثال: دليل الهوية"></div>
    <div class="field"><label>الرابط (URL)</label><input id="wf_url" value="${esc(f.url)}" placeholder="https://…" dir="ltr"></div>
    <div class="field"><label>التصنيف</label><select id="wf_cat">${['logo:شعارات','content:محتوى','brand:هوية','other:أخرى'].map(o=>{const[k,l]=o.split(':');return `<option value="${k}" ${f.cat===k?'selected':''}>${l}</option>`}).join('')}</select></div>`,
  ()=>{const g=i=>document.getElementById(i).value;f.name=g('wf_name').trim();f.url=g('wf_url').trim();f.cat=g('wf_cat');if(!f.name||!f.url){alert('أدخل الاسم والرابط');return}if(id){const i=w.files.findIndex(x=>x.id===id);w.files[i]=f}else{f.id=uid();w.files.push(f)}save();closeModal();wsBody()},
  id?()=>{w.files=w.files.filter(x=>x.id!==id);save();closeModal();wsBody()}:null);
}
/* ---- تبويب التطوّر المهني ---- */
function wsGrowthHtml(){
  const g=ws().growth;
  return `<div class="grid">
    <div class="card" style="grid-column:span 2;min-width:280px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><h3 style="margin:0"><i data-lucide="route"></i> رحلة التطوّر</h3><button class="btn btn-ghost btn-sm" onclick="wsAddJourney()"><i data-lucide="plus"></i> مرحلة</button></div>
      ${!g.journey.length?'<p style="color:var(--muted)">أضف مراحل رحلتك المهنية وتتبّع إنجازها.</p>':g.journey.map(j=>`<div class="ws-jrow"><div class="ws-check${j.done?' on':''}" onclick="wsToggleJourney('${j.id}')">${j.done?'<i data-lucide=\'check\' style=\'width:14px\'></i>':''}</div><div style="flex:1"><div style="font-weight:700;${j.done?'text-decoration:line-through;color:var(--muted)':''}">${esc(j.title)}</div>${j.note?`<div style="font-size:12px;color:var(--muted)">${esc(j.note)}</div>`:''}</div><button class="ws-mini" onclick="wsDelJourney('${j.id}')"><i data-lucide="x"></i></button></div>`).join('')}
    </div>
    <div class="card" style="min-width:260px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><h3 style="margin:0"><i data-lucide="book-open"></i> مصادر التعلّم</h3><button class="btn btn-ghost btn-sm" onclick="wsResModal('')"><i data-lucide="plus"></i></button></div>
      ${!g.resources.length?'<p style="color:var(--muted)">أضف روابط دورات ومقالات ومصادر.</p>':g.resources.map(r=>`<div class="ws-res"><span style="width:30px;height:30px;border-radius:7px;background:var(--panel2);display:grid;place-items:center;flex:none"><i data-lucide="link"></i></span><div style="flex:1;min-width:0"><a href="${esc(r.url)}" target="_blank" style="font-weight:700;color:var(--ink);text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.title)}</a>${r.tag?`<div style="font-size:11px;color:var(--muted)">${esc(r.tag)}</div>`:''}</div><button class="ws-mini" onclick="wsDelRes('${r.id}')"><i data-lucide="trash-2"></i></button></div>`).join('')}
    </div>
  </div>`;
}
function wsAddJourney(){const t=prompt('عنوان المرحلة:');if(t&&t.trim()){ws().growth.journey.push({id:uid(),title:t.trim(),done:false,note:''});save();wsBody()}}
function wsToggleJourney(id){const j=ws().growth.journey.find(x=>x.id===id);if(j){j.done=!j.done;save();wsBody()}}
function wsDelJourney(id){const g=ws().growth;g.journey=g.journey.filter(x=>x.id!==id);save();wsBody()}
function wsDelRes(id){if(!confirm('حذف المصدر؟'))return;const g=ws().growth;g.resources=g.resources.filter(x=>x.id!==id);save();wsBody()}
function wsResModal(id){const g=ws().growth;const r=id?{...g.resources.find(x=>x.id===id)}:{id:'',title:'',url:'',tag:''};
  openModal(id?'تعديل مصدر':'إضافة مصدر',`
    <div class="field"><label>العنوان</label><input id="wr_title" value="${esc(r.title)}" placeholder="مثال: دورة تسويق الأداء"></div>
    <div class="field"><label>الرابط</label><input id="wr_url" value="${esc(r.url)}" placeholder="https://…" dir="ltr"></div>
    <div class="field"><label>وسم (اختياري)</label><input id="wr_tag" value="${esc(r.tag||'')}" placeholder="تسويق / تصميم / تحليل"></div>`,
  ()=>{const gg=i=>document.getElementById(i).value;r.title=gg('wr_title').trim();r.url=gg('wr_url').trim();r.tag=gg('wr_tag').trim();if(!r.title||!r.url){alert('أدخل العنوان والرابط');return}if(id){const i=g.resources.findIndex(x=>x.id===id);g.resources[i]=r}else{r.id=uid();g.resources.push(r)}save();closeModal();wsBody()},
  id?()=>{g.resources=g.resources.filter(x=>x.id!==id);save();closeModal();wsBody()}:null);
}
/* ---- الأحداث والأعضاء ---- */
function wsImgResize(file,cb){const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const max=680,s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));c.getContext('2d').drawImage(img,0,0,c.width,c.height);let url;try{url=c.toDataURL('image/webp',0.75)}catch(_){url=c.toDataURL('image/jpeg',0.82)}cb(url)};img.src=rd.result};rd.readAsDataURL(file)}
function wsEvImg(input){const f=input.files[0];if(!f)return;if(f.size>8000000){alert('الصورة كبيرة (أقل من 8MB)');return}wsImgResize(f,url=>{const h=document.getElementById('we_img');if(h)h.value=url;const p=document.getElementById('we_img_prev');if(p){p.src=url;p.style.display='block'}})}
function wsEventModal(id,presetDate){const w=ws();const e=id?{...w.events.find(x=>x.id===id)}:{id:'',title:'',start:presetDate||today(),end:presetDate||today(),channel:'general',notes:'',image:''};if(!e.start)e.start=e.date||today();if(!e.end)e.end=e.start;
  const chOpts=Object.keys(WS_CHAN).map(k=>`<option value="${k}" ${e.channel===k?'selected':''}>${WS_CHAN[k].label}</option>`).join('');
  openModal(id?'تعديل حدث':'حدث تسويقي',`
    <div class="field"><label>العنوان</label><input id="we_title" value="${esc(e.title)}" placeholder="مثال: إطلاق حملة الصيف"></div>
    <div class="row2"><div class="field"><label>من تاريخ</label><input type="date" id="we_start" value="${esc(e.start)}"></div>
    <div class="field"><label>إلى تاريخ</label><input type="date" id="we_end" value="${esc(e.end)}"></div></div>
    <div class="field"><label>القناة</label><select id="we_chan">${chOpts}</select></div>
    <div class="field"><label>صورة (اختياري)</label><input type="file" accept="image/*" onchange="wsEvImg(this)"><input type="hidden" id="we_img" value="${esc(e.image||'')}"><img id="we_img_prev" src="${esc(e.image||'')}" style="${e.image?'display:block':'display:none'};max-width:100%;max-height:170px;border-radius:10px;margin-top:8px;object-fit:cover"></div>
    <div class="field"><label>ملاحظات</label><textarea id="we_notes" rows="2">${esc(e.notes||'')}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;e.title=g('we_title').trim();e.start=g('we_start');e.end=g('we_end')||e.start;if(e.end<e.start)e.end=e.start;e.channel=g('we_chan');e.notes=g('we_notes');e.image=g('we_img');if('date' in e)delete e.date;if(!e.title||!e.start){alert('أدخل العنوان وتاريخ البداية');return}if(id){const i=w.events.findIndex(x=>x.id===id);w.events[i]=e}else{e.id=uid();w.events.push(e)}save();closeModal();wsBody()},
  id?()=>{w.events=w.events.filter(x=>x.id!==id);save();closeModal();wsBody()}:null);
}
function wsMemberModal(id){const w=ws();const m=id?{...w.team.find(x=>x.id===id)}:{id:'',name:'',role:'',color:'#3b82f6'};
  openModal(id?'تعديل عضو':'عضو جديد',`
    <div class="field"><label>الاسم</label><input id="wm_name" value="${esc(m.name)}"></div>
    <div class="field"><label>الدور</label><input id="wm_role" value="${esc(m.role||'')}" placeholder="مثال: مصمم"></div>
    <div class="field"><label>اللون</label><input type="color" id="wm_color" value="${esc(m.color||'#3b82f6')}" style="width:60px;height:38px;padding:2px"></div>`,
  ()=>{const g=i=>document.getElementById(i).value;m.name=g('wm_name').trim();m.role=g('wm_role').trim();m.color=g('wm_color');if(!m.name){alert('أدخل الاسم');return}if(id){const i=w.team.findIndex(x=>x.id===id);w.team[i]=m}else{m.id=uid();w.team.push(m)}save();closeModal();wsBody()},
  id&&w.team.length>1?()=>{if(confirm('حذف العضو؟ (لن تُحذف مهامه)')){w.team=w.team.filter(x=>x.id!==id);save();closeModal();wsBody()}}:null);
}
