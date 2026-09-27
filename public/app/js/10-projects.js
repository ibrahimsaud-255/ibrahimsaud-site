/*
 * 10-projects.js — المشاريع وغرفة المشروع ومحرّر المهام
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== PROJECTS (board of projects) ===== */
let CUR_PROJ=null;
function renderProjects(){
  CUR_PROJ=null;
  renderKanban({title:'المشاريع',onAdd:'projModal()',addLabel:'مشروع',stagesKey:'projectStages',coll:'projects',
    emptyIcon:'clapperboard',emptyText:'لا توجد مشاريع بعد. أنشئ أول مشروع.',onOpen:'openProject',
    note:'<div class="badge-note"><i data-lucide="clapperboard"></i> <div>اضغط على المشروع لفتح صفحته (المهام على مراحل + التفاصيل والعميل). اسحب البطاقات بين مراحل الإنتاج.</div></div>',
    card:p=>{const dn=(p.tasks||[]).filter(t=>t.stageKey==='done').length;const tot=(p.tasks||[]).length;return `<div class="t" style="display:flex;align-items:center;gap:7px"><span class="inl" style="color:var(--gold2)">${iconHTML(p.emoji,'clapperboard',16)}</span>${esc(p.title)}</div><div class="m">${esc(resolveClientName(p))} · ${dn}/${tot} مهمة</div>${p.podcast?`<div class="m" style="color:var(--gold)"><i class="inl" data-lucide="mic"></i> ${esc(p.podcast)}</div>`:''}`}});
}
function projModal(id){
  let p=id?JSON.parse(JSON.stringify(S.projects.find(x=>x.id===id))):{id:'',title:'',contactId:'',client:'',podcast:'',stageKey:S.projectStages[0].key,emoji:'clapperboard',tasks:[],taskStages:JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES))};
  const sOpts=S.projectStages.map(s=>`<option value="${s.key}" ${p.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('');
  openModal(id?'تعديل المشروع':'مشروع جديد',`
    <div class="row2"><div class="field"><label>اسم المشروع</label><input id="p_title" value="${esc(p.title)}" placeholder="مثال: حملة فيديو"></div>
    <div class="field"><label>العميل</label>${clientFieldHTML('p_client',resolveClientName(p))}</div></div>
    <div class="field"><label>اسم البودكاست/الوصف المختصر (اختياري)</label><input id="p_podcast" value="${esc(p.podcast||'')}" placeholder="مثال: بودكاست خزاما"></div>
    <div class="field"><label>مرحلة الإنتاج</label><select id="p_stage">${sOpts}</select></div>
    <div class="field"><label>الأيقونة</label><div style="display:flex;gap:6px;flex-wrap:wrap">${ICON_CHOICES.map(n=>`<button type="button" class="icon-pick" data-n="${n}" onclick="pickProjIcon('${n}')"><i data-lucide="${n}"></i></button>`).join('')}</div><input type="hidden" id="p_emoji" value="${esc(iconName(p.emoji,'clapperboard'))}"></div>`,
  ()=>{const g=i=>document.getElementById(i).value;p.title=g('p_title').trim();const cn=g('p_client').trim();p.contactId=findOrCreateContact(cn);p.client=cn;p.podcast=g('p_podcast').trim();p.stageKey=g('p_stage');p.emoji=g('p_emoji')||'clapperboard';if(!p.title){alert('أدخل اسم المشروع');return}if(!p.taskStages||!p.taskStages.length)p.taskStages=JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES));if(id){const i=S.projects.findIndex(x=>x.id===id);S.projects[i]=p}else{p.id=uid();S.projects.push(p)}save();syncTasks();closeModal();if(id&&CUR_PROJ===id)renderProjectDetail(id);else openProject(p.id)},id?()=>delItem('projects',id,()=>{CUR_PROJ=null;go('projects')}):null);
  pickProjIcon(iconName(p.emoji,'clapperboard'));
}

/* ===== PROJECT DETAIL (tasks on stages + linked client) ===== */
function openProject(id){CUR_PROJ=id;renderProjectDetail(id)}
function proj(){return S.projects.find(x=>x.id===CUR_PROJ)}
function taskDone(t){return t.stageKey==='done'}
function renderProjectDetail(id){
  const p=S.projects.find(x=>x.id===id);if(!p){go('projects');return}
  CUR_PROJ=id;
  if(!p.taskStages||!p.taskStages.length)p.taskStages=JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES));
  const li=clientItems(p.contactId);
  const stageLbl=(S.projectStages.find(s=>s.key===p.stageKey)||{}).label||'';
  document.getElementById('main').innerHTML=`
    <button class="btn btn-ghost btn-sm" onclick="go('projects')" style="margin-bottom:14px">‹ كل المشاريع</button>
    <div class="pd-head">
      <div>
        <div class="pd-title"><span class="inl" style="color:var(--gold2)">${iconHTML(p.emoji,'clapperboard',24)}</span> ${esc(p.title)}</div>
        <div class="pd-meta">
          <span><i class="inl" data-lucide="user"></i> العميل: <b>${esc(resolveClientName(p))}</b></span>
          ${p.podcast?`<span><i class="inl" data-lucide="mic"></i> <b>${esc(p.podcast)}</b></span>`:''}
          <span><i class="inl" data-lucide="package"></i> مرحلة الإنتاج: <b>${esc(stageLbl)}</b></span>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="taskStageEditor('${id}')"><i data-lucide="settings"></i> مراحل المهام</button>
        <button class="btn btn-ghost btn-sm" onclick="projModal('${id}')"><i data-lucide="pencil"></i> تعديل المشروع</button>
      </div>
    </div>
    ${p.contactId?`<div class="card" style="margin-bottom:18px"><h3 style="margin-top:0"><i data-lucide="link"></i> ملف العميل المرتبط</h3>
      <div class="pd-meta" style="margin-top:0">
        <span><i class="inl" data-lucide="calendar-days"></i> مواعيد: <b>${li.appts.length}</b></span>
        <span><i class="inl" data-lucide="receipt-text"></i> فواتير: <b>${li.invoices.length}</b></span>
        <span><i class="inl" data-lucide="clapperboard"></i> مشاريع: <b>${li.projects.length}</b></span>
      </div>
      ${li.appts.length?`<div class="linkrow">${li.appts.slice(0,6).map(a=>`<button class="link-btn" onclick="go('appointments');setTimeout(()=>apptModal('${a.id}'),60)"><i class="inl" data-lucide="calendar-days"></i> ${esc(a.title)} · ${(a.datetime||'').replace('T',' ')}</button>`).join('')}</div>`:''}
      ${li.invoices.length?`<div class="linkrow">${li.invoices.slice(0,6).map(i=>`<button class="link-btn" onclick="go('invoicing');setTimeout(()=>docModal('invoice','${i.id}'),60)"><i class="inl" data-lucide="receipt-text"></i> #${i.number} · ${money(invTotal(i))}</button>`).join('')}</div>`:''}
    </div>`:''}
    <div id="roomPanel" class="card" style="margin-bottom:18px"><div style="color:var(--muted);font-size:13px">جارٍ تحميل غرفة المشروع…</div></div>
    <div class="page-head" style="margin-bottom:12px"><h2 style="margin:0;font-size:18px">المهام</h2></div>
    <div class="kanban" id="taskBoard">
    ${p.taskStages.map(st=>{
      const items=(p.tasks||[]).filter(t=>t.stageKey===st.key);
      return `<div class="kcol" ondragover="tdover(event)" ondragleave="tdleave(event)" ondrop="tddrop(event,'${st.key}')">
        <h4><span>${esc(st.label)}</span><span class="kbadge">${items.length}</span></h4>
        ${items.map(t=>`<div class="ktask" draggable="true" ondragstart="tdstart(event,'${t.id}')" ondragend="tdend(event)" onclick="openTask('${t.id}')">
          <div class="tt">${esc(t.title)}</div>
          <div class="meta">${(t.blocks&&t.blocks.length)?`<span class="kbadge"><i class="inl" data-lucide="file-text"></i> ${t.blocks.length}</span>`:''}${t.assignee?`<span class="kbadge" style="color:var(--gold);background:var(--goldsoft)"><i class="inl" data-lucide="user"></i> ${esc(flName(t.assignee))}</span>`:''}</div>
        </div>`).join('')}
        <button class="addtask" onclick="quickAddTask('${st.key}')">+ مهمة</button>
      </div>`}).join('')}
    </div>`;
  refreshIcons();loadRoomPanel(p);
}

/* ===== غرفة المشروع (لوحة المالك) ===== */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const RBASE=location.origin+location.pathname.replace(/index\.html$/,' */
function roomLink(kind,token){return RBASE+'?'+(kind==='client'?'c':'ft')+'='+token}
function copyTxt(t){navigator.clipboard.writeText(t).then(()=>alert('تم النسخ:\n'+t)).catch(()=>prompt('انسخ:',t))}
async function loadRoomPanel(p){
  const el=document.getElementById('roomPanel');if(!el)return;
  const {data:rooms}=await sb.from('project_rooms').select('*').eq('project_id',p.id).limit(1);
  const room=rooms&&rooms[0];
  const {data:tasks}=await sb.from('tasks').select('*').eq('project_id',p.id);
  const ids=(tasks||[]).map(t=>t.id);let revs=[];
  if(ids.length){const {data:rv}=await sb.from('revisions').select('task_id,num,billable,status').in('task_id',ids);revs=rv||[]}
  if(document.getElementById('roomPanel')){document.getElementById('roomPanel').innerHTML=roomPanelHTML(p,room,tasks||[],revs);refreshIcons();}
}
function roomPanelHTML(p,room,tasks,revs){
  if(!room) return `<h3 style="margin-top:0"><i data-lucide="door-open"></i> غرفة المشروع</h3>
    <p style="color:var(--muted);font-size:13px">فعّل غرفة العميل: تشارك التسليمات وتستقبل الاعتمادات والتعديلات بعدّاد تكلفة، وتعطي الفريلانسر رابطاً يسلّم فيه نسخه وينفّذ التعديلات.</p>
    <button class="btn btn-gold" onclick="roomEnable('${p.id}')">تفعيل غرفة العميل</button>`;
  const cl=roomLink('client',room.client_token);
  const wa=room.client_phone?('https://wa.me/'+room.client_phone.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent('غرفة مشروع «'+p.title+'» — تابع التسليمات واعتمدها من هنا:\n'+cl)):'';
  return `<h3 style="margin-top:0"><i data-lucide="door-open"></i> غرفة المشروع <button class="link-btn" onclick="roomSettings('${p.id}')"><i class="inl" data-lucide="settings"></i> إعدادات</button></h3>
    <div class="pd-meta" style="margin-top:0"><span><i class="inl" data-lucide="user"></i> ${esc(room.client_name||'—')}</span><span><i class="inl" data-lucide="package"></i> تعديلات مجانية: <b>${room.revisions_included}</b></span></div>
    <div class="linkrow" style="margin-top:10px">
      <button class="link-btn" onclick="copyTxt('${cl}')"><i class="inl" data-lucide="copy"></i> نسخ رابط العميل</button>
      <a class="link-btn" href="${cl}" target="_blank">فتح</a>
      ${wa?`<a class="link-btn" href="${wa}" target="_blank"><i class="inl" data-lucide="message-circle"></i> واتساب العميل</a>`:''}
      <button class="link-btn" onclick="addPodcastDeliverables('${p.id}')"><i class="inl" data-lucide="mic"></i> أضف مخرجات حلقة بودكاست</button>
    </div>
    <div style="margin-top:12px">
    ${tasks.length?tasks.map(t=>{
      const rs=revs.filter(r=>r.task_id===t.id);const used=rs.length;const pend=rs.filter(r=>r.status==='pending').length;
      const fl=(S.freelancers||[]).find(f=>f.id===t.freelancer_id);const flink=fl?roomLink('ft',fl.token):'';
      const cnt=used<=room.revisions_included?`<span class="kbadge">تعديلات ${used}/${room.revisions_included}</span>`:`<span class="kbadge" style="color:#fca5a5"><i class="inl" data-lucide="alert-triangle"></i> ${used} (${used-room.revisions_included} مدفوع)</span>`;
      return `<div style="border-top:1px solid var(--line);padding:9px 0">
        <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">
          <b><i class="inl" data-lucide="film"></i> ${esc(t.title)}</b>
          <span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${t.approved?'<span class="kbadge" style="color:#86efac"><i class="inl" data-lucide="check"></i> معتمد</span>':''}${pend?`<span class="kbadge" style="color:#fcd34d">${pend} تعديل معلّق</span>`:''}${cnt}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">
          ${t.version_url?`<a href="${esc(t.version_url)}" target="_blank"><i class="inl" data-lucide="play"></i> المخرَج الحالي</a>`:'لا مخرَج بعد'}
          <button class="link-btn" onclick="setDeliverable('${p.id}','${t.id}')"><i class="inl" data-lucide="link"></i> ${t.version_url?'تعديل':'إضافة'} رابط المخرَج</button>
          ${fl?` · <i class="inl" data-lucide="user"></i> ${esc(fl.name)} <button class="link-btn" onclick="copyTxt('${flink}')"><i class="inl" data-lucide="copy"></i> رابط الفريلانسر</button>`:' · <i class="inl" data-lucide="alert-triangle"></i> بلا مسؤول (أسنده من المهمة)'}
        </div>
      </div>`;
    }).join(''):'<p style="color:var(--muted);font-size:13px">أضف مهاماً وأسندها لفريلانسرز، ثم تظهر هنا كتسليمات.</p>'}
    </div>`;
}
// مخرجات حلقة البودكاست القياسية — تُضاف كمهام/تسليمات للمشروع بضغطة
const PODCAST_DELIVERABLES=['الحلقة الكاملة (مونتاج)','١٠ مقاطع قصيرة','تصاميم إنستقرام','ثمبنيل يوتيوب','إعلان الضيف + صورته'];
async function addPodcastDeliverables(pid){const p=S.projects.find(x=>x.id===pid);if(!p)return;
  if(!confirm('إضافة ٥ مخرجات حلقة بودكاست كتسليمات للمشروع؟ (الحلقة · الشورتس · تصاميم إنستقرام · الثمبنيل · إعلان الضيف)'))return;
  p.tasks=p.tasks||[];const st=(p.taskStages&&p.taskStages[0]?p.taskStages[0].key:'todo');
  PODCAST_DELIVERABLES.forEach(t=>p.tasks.push({id:uid(),title:t,stageKey:st,done:false,assignee:'',blocks:[]}));
  save();renderProjectDetail(p.id);await syncTasks();loadRoomPanel(p);
}
// المالك يضيف/يعدّل رابط المخرَج (Drive/يوتيوب) وعنوانه مباشرة — يظهر فوراً في رابط العميل
function setDeliverable(pid,taskId){
  const p=S.projects.find(x=>x.id===pid);const lt=p&&(p.tasks||[]).find(t=>t.id===taskId);
  sb.from('tasks').select('*').eq('id',taskId).limit(1).then(({data})=>{const dt=(data&&data[0])||{};
    openModal('مخرَج المشروع — رابط التسليم',`
      <div class="field"><label>عنوان المخرَج</label><input id="dl_title" value="${esc((lt&&lt.title)||dt.title||'')}"></div>
      <div class="field"><label>رابط المخرَج (Google Drive / يوتيوب / WeTransfer)</label><input id="dl_url" value="${esc(dt.version_url||'')}" placeholder="https://drive.google.com/..."></div>
      <div class="field"><label>ملاحظة مع التسليم (اختياري)</label><input id="dl_note" value="${esc(dt.version_note||'')}"></div>
      <div class="badge-note" style="margin-top:4px"><i data-lucide="link"></i> <div>هذا الرابط يظهر للعميل مباشرة في رابط الغرفة ليعتمده أو يطلب تعديلاً.</div></div>`,
    async()=>{const g=i=>document.getElementById(i).value;const title=g('dl_title').trim();const url=g('dl_url').trim();const note=g('dl_note').trim();
      if(lt&&title&&title!==lt.title){lt.title=title;save();await syncTasks();}
      const {error}=await sb.from('tasks').update({version_url:url,version_note:note,title:title||dt.title}).eq('id',taskId);
      if(error){alert('تعذّر الحفظ: '+error.message);return}
      closeModal();const pp=S.projects.find(x=>x.id===pid);if(pp)loadRoomPanel(pp);});
  });
}
async function roomEnable(pid){const p=S.projects.find(x=>x.id===pid);if(!p)return;
  await syncTasks();
  const {error}=await sb.from('project_rooms').insert({project_id:p.id,project_title:p.title,client_name:resolveClientName(p),revisions_included:2,owner:USER.id});
  if(error){alert('تعذّر التفعيل: '+error.message);return}
  loadRoomPanel(p);
}
function roomSettings(pid){const p=S.projects.find(x=>x.id===pid);if(!p)return;
  sb.from('project_rooms').select('*').eq('project_id',p.id).limit(1).then(({data})=>{const r=data&&data[0];if(!r)return;
    openModal('إعدادات غرفة العميل',`
      <div class="field"><label>اسم العميل</label><input id="rs_name" value="${esc(r.client_name||'')}"></div>
      <div class="row2"><div class="field"><label>جوال العميل (واتساب)</label><input id="rs_phone" value="${esc(r.client_phone||'')}" placeholder="9665xxxxxxxx"></div>
      <div class="field"><label>بريد العميل</label><input id="rs_email" type="email" value="${esc(r.client_email||'')}"></div></div>
      <div class="field"><label>عدد التعديلات المجانية ضمن الباقة</label><input id="rs_inc" type="number" value="${r.revisions_included}"></div>`,
      async()=>{const g=i=>document.getElementById(i).value;
        const {error}=await sb.from('project_rooms').update({client_name:g('rs_name').trim(),client_phone:g('rs_phone').trim(),client_email:g('rs_email').trim(),revisions_included:Number(g('rs_inc'))||0}).eq('id',r.id);
        if(error){alert('تعذّر الحفظ: '+error.message);return}closeModal();loadRoomPanel(p)});
  });
}

/* task drag & drop within project */
let TDRAG=null;
function tdstart(e,id){TDRAG=id;e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.stopPropagation()}
function tdend(e){e.currentTarget.classList.remove('dragging')}
function tdover(e){e.preventDefault();e.currentTarget.classList.add('dragover')}
function tdleave(e){e.currentTarget.classList.remove('dragover')}
function tddrop(e,stageKey){e.preventDefault();e.currentTarget.classList.remove('dragover');const p=proj();if(p&&TDRAG){const t=(p.tasks||[]).find(x=>x.id===TDRAG);if(t&&t.stageKey!==stageKey){t.stageKey=stageKey;t.done=(stageKey==='done');save();syncTasks();renderProjectDetail(p.id)}}TDRAG=null}
function quickAddTask(stageKey){const p=proj();if(!p)return;openModal('مهمة جديدة',`
  <div class="field"><label>عنوان المهمة</label><input id="nt_title" placeholder="مثال: كتابة سكربت الحلقة" onkeydown="if(event.key==='Enter')document.getElementById('mSave').click()"></div>
  <div class="field"><label>المسؤول (اختياري)</label><select id="nt_as"><option value="">— لا أحد —</option>${(S.freelancers||[]).map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select></div>`,
  ()=>{const v=document.getElementById('nt_title').value.trim();if(!v){alert('أدخل عنوان المهمة');return}const as=document.getElementById('nt_as').value;p.tasks=p.tasks||[];p.tasks.push({id:uid(),title:v,stageKey,done:stageKey==='done',assignee:as,blocks:[]});save();syncTasks();closeModal();renderProjectDetail(p.id)});
  setTimeout(()=>{const n=document.getElementById('nt_title');if(n)n.focus()},50);
}
function taskStageEditor(id){const p=S.projects.find(x=>x.id===id);if(!p)return;
  let stages=JSON.parse(JSON.stringify(p.taskStages||DEFAULT_TASK_STAGES));
  function body(){return `<p style="color:var(--muted);font-size:13px;margin-top:0">مراحل المهام لهذا المشروع. المهام في مرحلة محذوفة تنتقل لأول مرحلة.</p>`+
    stages.map((s,i)=>`<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
      <input value="${esc(s.label)}" oninput="tsEdit(${i},this.value)" style="flex:1">
      <button class="link-btn" onclick="tsMove(${i},-1)">▲</button><button class="link-btn" onclick="tsMove(${i},1)">▼</button>
      <button class="link-btn del" onclick="tsDel(${i})">حذف</button></div>`).join('')+
    `<button class="btn btn-ghost btn-sm" onclick="tsAdd()">+ مرحلة جديدة</button>`}
  openModal('مراحل المهام',body(),()=>{if(!stages.length){alert('أضف مرحلة واحدة على الأقل');return}const keys=stages.map(s=>s.key);(p.tasks||[]).forEach(t=>{if(!keys.includes(t.stageKey))t.stageKey=keys[0]});p.taskStages=stages;save();closeModal();renderProjectDetail(id)});
  window.tsEdit=(i,v)=>{stages[i].label=v};
  window.tsAdd=()=>{stages.push({key:uid(),label:'مرحلة جديدة'});refresh()};
  window.tsDel=(i)=>{stages.splice(i,1);refresh()};
  window.tsMove=(i,d)=>{const j=i+d;if(j<0||j>=stages.length)return;[stages[i],stages[j]]=[stages[j],stages[i]];refresh()};
  function refresh(){document.querySelector('#modalRoot .modal-body').innerHTML=body()}
}

/* ===== NOTION-LITE TASK EDITOR ===== */
let CUR_TASK=null;
function curTask(){const p=proj();return p?(p.tasks||[]).find(x=>x.id===CUR_TASK):null}
function findBlock(id){const t=curTask();return t?(t.blocks||[]).find(b=>b.id===id):null}
function openTask(taskId){const p=proj();if(!p)return;const t=(p.tasks||[]).find(x=>x.id===taskId);if(!t)return;CUR_TASK=taskId;if(!Array.isArray(t.blocks))t.blocks=[];
  const asOpts=`<option value="">— لا مسؤول —</option>`+(S.freelancers||[]).map(f=>`<option value="${f.id}" ${t.assignee===f.id?'selected':''}>${esc(f.name)}</option>`).join('');
  const stOpts=(p.taskStages||DEFAULT_TASK_STAGES).map(s=>`<option value="${s.key}" ${t.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('');
  document.getElementById('modalRoot').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeTask()"><div class="modal task-modal">
    <div class="modal-head"><input id="t_title" value="${esc(t.title)}" style="font-size:18px;font-weight:800;border:none;background:transparent;padding:4px;width:auto;flex:1" oninput="taskTitle(this.value)"><button class="x" onclick="closeTask()">×</button></div>
    <div class="modal-body">
      <div class="row2" style="margin-bottom:14px">
        <div class="field"><label>المرحلة</label><select id="t_stage" onchange="taskStage(this.value)">${stOpts}</select></div>
        <div class="field"><label>المسؤول</label><select id="t_as" onchange="taskAssignee(this.value)">${asOpts}</select></div>
      </div>
      <div class="ed-toolbar">
        <button class="btn btn-ghost btn-sm" onclick="addBlock('text')"><i data-lucide="pilcrow"></i> نص</button>
        <button class="btn btn-ghost btn-sm" onclick="addBlock('heading')"><i data-lucide="heading"></i> عنوان</button>
        <button class="btn btn-ghost btn-sm" onclick="addBlock('script')"><i data-lucide="film"></i> سكربت</button>
        <button class="btn btn-ghost btn-sm" onclick="addBlock('todo')"><i data-lucide="square-check"></i> مهمة فرعية</button>
        <button class="btn btn-ghost btn-sm" onclick="pickImage()"><i data-lucide="image"></i> صورة</button>
        <button class="btn btn-ghost btn-sm" onclick="addBlock('divider')"><i data-lucide="minus"></i> فاصل</button>
        <span style="align-self:center;color:var(--muted);font-size:12px">أو اكتب «/» داخل أي سطر · للعريض Ctrl/⌘+B</span>
        <span id="upStatus" class="upbar"></span>
      </div>
      <div id="blocks">${t.blocks.map(b=>blockHTML(b)).join('')}</div>
      <button class="addtask" style="margin-top:10px" onclick="addBlock('text')">+ أضف سطراً</button>
      <input type="file" id="imgFile" accept="image/*" class="hidden" onchange="onImagePicked(event)">
      <div style="margin-top:18px;border-top:1px solid var(--line);padding-top:12px"><button class="link-btn del" onclick="deleteTask()"><i class="inl" data-lucide="trash-2"></i> حذف المهمة</button></div>
    </div></div></div>`;
  refreshIcons();
}
function blockHTML(b){
  if(b.type==='heading')return blkWrap(b,`<div class="ce h" contenteditable data-bid="${b.id}" data-ph="عنوان" onkeydown="blockKey(event,'${b.id}')" oninput="onCe('${b.id}')">${b.html||''}</div>`);
  if(b.type==='script')return blkWrap(b,`<div class="lbl"><i class="inl" data-lucide="film"></i> سكربت الفيديو</div><div class="ce" contenteditable data-bid="${b.id}" data-ph="اكتب نص الفيديو…" onkeydown="blockKey(event,'${b.id}')" oninput="onCe('${b.id}')">${b.html||''}</div>`,'script');
  if(b.type==='todo')return blkWrap(b,`<input type="checkbox" ${b.done?'checked':''} onchange="todoToggle('${b.id}',this.checked)"><div class="ce txt ${b.done?'dn':''}" contenteditable data-bid="${b.id}" data-ph="مهمة فرعية…" onkeydown="blockKey(event,'${b.id}')" oninput="onCe('${b.id}')">${b.html||''}</div>`,'todo');
  if(b.type==='image')return blkWrap(b,`<img src="${esc(b.url)}" alt="">`,'img');
  if(b.type==='divider')return blkWrap(b,`<hr>`,'divider');
  return blkWrap(b,`<div class="ce txt" contenteditable data-bid="${b.id}" data-ph="اكتب… (أو «/» لأمر)" onkeydown="blockKey(event,'${b.id}')" oninput="onCe('${b.id}')">${b.html||''}</div>`);
}
function blkWrap(b,inner,cls){return `<div class="nb ${cls||''}" data-id="${b.id}"><button class="handle" onclick="blockMenu(event,'${b.id}')" title="خيارات">⋮</button><div class="bc">${inner}</div></div>`}
function onCe(id){const el=document.querySelector(`[data-bid="${id}"]`);const b=findBlock(id);if(el&&b){b.html=el.innerHTML;scheduleTaskSave()}}
function scheduleTaskSave(){clearTimeout(window.__tsv);window.__tsv=setTimeout(()=>{save();syncTasks()},700)}
function taskTitle(v){const t=curTask();if(t){t.title=v;scheduleTaskSave()}}
function taskStage(v){const t=curTask();if(t){t.stageKey=v;t.done=(v==='done');scheduleTaskSave()}}
function taskAssignee(v){const t=curTask();if(t){t.assignee=v;scheduleTaskSave()}}
function todoToggle(id,c){const b=findBlock(id);if(b){b.done=c;const el=document.querySelector(`[data-bid="${id}"]`);if(el)el.classList.toggle('dn',c);scheduleTaskSave()}}
function addBlock(type,afterId){const t=curTask();if(!t)return;const b={id:uid(),type};if(type==='todo')b.done=false;if(type!=='divider'&&type!=='image')b.html='';let idx=t.blocks.length;if(afterId){const i=t.blocks.findIndex(x=>x.id===afterId);if(i>=0)idx=i+1}t.blocks.splice(idx,0,b);scheduleTaskSave();rerenderBlocks((type==='divider'||type==='image')?null:b.id)}
function removeBlock(id){const t=curTask();if(!t)return;const i=t.blocks.findIndex(b=>b.id===id);if(i<0)return;t.blocks.splice(i,1);scheduleTaskSave();const prev=t.blocks[i-1];rerenderBlocks(prev&&prev.type!=='divider'&&prev.type!=='image'?prev.id:null)}
function rerenderBlocks(focusId){const t=curTask();const c=document.getElementById('blocks');if(!t||!c)return;c.innerHTML=t.blocks.map(b=>blockHTML(b)).join('');refreshIcons();if(focusId){const el=document.querySelector(`[data-bid="${focusId}"]`);if(el)placeCaretEnd(el)}}
function blockKey(e,id){
  if(e.key==='Enter'&&!e.shiftKey){const b=findBlock(id);if(b&&b.type!=='script'){e.preventDefault();closeSlash();addBlock('text',id)}}
  else if(e.key==='Backspace'){if(e.target&&e.target.textContent===''){e.preventDefault();removeBlock(id)}}
  else if(e.key==='Escape'){closeSlash()}
  else if(e.key==='/'){setTimeout(()=>{const el=document.querySelector(`[data-bid="${id}"]`);if(el&&el.textContent==='/')openSlash(id,el,false)},0)}
}
function placeCaretEnd(el){try{el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
const SLASH=[{t:'text',i:'pilcrow',n:'نص',d:'فقرة عادية'},{t:'heading',i:'heading',n:'عنوان',d:'عنوان عريض'},{t:'script',i:'film',n:'سكربت',d:'نص الفيديو'},{t:'todo',i:'square-check',n:'مهمة فرعية',d:'بوكس تحقق'},{t:'image',i:'image',n:'صورة',d:'رفع صورة'},{t:'divider',i:'minus',n:'فاصل',d:'خط فاصل'}];
function openSlash(id,el,withDel){closeSlash();const r=el.getBoundingClientRect();const m=document.createElement('div');m.className='slash';m.id='slashMenu';m.style.top=(r.bottom+window.scrollY+4)+'px';m.style.right=Math.max(8,window.innerWidth-r.right)+'px';
  m.innerHTML=SLASH.map(s=>`<button onclick="applySlash('${id}','${s.t}')"><span class="si"><i data-lucide="${s.i}"></i></span><span>${s.n}<div class="sd">${esc(s.d)}</div></span></button>`).join('')+(withDel?`<button onclick="removeBlock('${id}');closeSlash()"><span class="si"><i data-lucide="trash-2"></i></span><span style="color:var(--bad)">حذف البلوك</span></button>`:'');
  document.body.appendChild(m);refreshIcons();setTimeout(()=>document.addEventListener('click',slashOutside),0)}
function slashOutside(e){if(!e.target.closest('#slashMenu')){closeSlash()}}
function closeSlash(){const m=document.getElementById('slashMenu');if(m)m.remove();document.removeEventListener('click',slashOutside)}
function blockMenu(e,id){e.stopPropagation();const el=e.currentTarget;openSlash(id,el,true)}
function applySlash(id,type){closeSlash();const t=curTask();const b=findBlock(id);if(!b||!t)return;
  if(type==='image'){b.type='text';b.html='';pickImageFor(id);return}
  if(type==='divider'){b.type='divider';delete b.html;scheduleTaskSave();rerenderBlocks(null);return}
  if(type==='todo'){b.type='todo';b.html='';b.done=false}else{b.type=type;b.html=''}
  scheduleTaskSave();rerenderBlocks(id);
}
function pickImage(){window.__imgTarget=null;document.getElementById('imgFile').click()}
function pickImageFor(id){window.__imgTarget=id;document.getElementById('imgFile').click()}
async function onImagePicked(e){const f=e.target.files[0];e.target.value='';if(!f)return;const t=curTask();if(!t)return;const st=document.getElementById('upStatus');if(st)st.textContent='جارٍ رفع الصورة…';
  try{const ext=(f.name.split('.').pop()||'png').toLowerCase();const path=`${USER.id}/${uid()}.${ext}`;
    const {error}=await sb.storage.from('task-images').upload(path,f,{upsert:false,contentType:f.type||'image/png'});if(error)throw error;
    const {data}=sb.storage.from('task-images').getPublicUrl(path);const url=data.publicUrl;
    const tgt=window.__imgTarget;if(tgt){const b=findBlock(tgt);if(b){b.type='image';b.url=url;delete b.html}}else{t.blocks.push({id:uid(),type:'image',url})}
    window.__imgTarget=null;if(st)st.textContent='تم';setTimeout(()=>{if(st)st.textContent=''},1500);save();rerenderBlocks(null);
  }catch(err){if(st)st.textContent='';alert('تعذّر رفع الصورة: '+(err.message||err)+'\n\nتأكد من إنشاء bucket عام باسم «task-images» في Supabase → Storage.')}
}
function deleteTask(){const p=proj();const t=curTask();if(!p||!t)return;if(!confirm('حذف هذه المهمة؟'))return;p.tasks=p.tasks.filter(x=>x.id!==t.id);save();syncTasks();document.getElementById('modalRoot').innerHTML='';CUR_TASK=null;renderProjectDetail(p.id)}
function closeTask(){closeSlash();const t=curTask();if(t){document.querySelectorAll('#blocks [data-bid]').forEach(el=>{const b=(t.blocks||[]).find(x=>x.id===el.dataset.bid);if(b)b.html=el.innerHTML});const tt=document.getElementById('t_title');if(tt)t.title=tt.value}save();syncTasks();document.getElementById('modalRoot').innerHTML='';CUR_TASK=null;if(CUR_PROJ)renderProjectDetail(CUR_PROJ)}
