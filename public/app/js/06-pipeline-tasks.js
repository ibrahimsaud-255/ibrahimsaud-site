/*
 * 06-pipeline-tasks.js — مسار العملاء والكانبان والمهام
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== مسار العميل (Pipeline) ===== */
const LOG_KINDS={call:{label:'مكالمة',icon:'phone'},whatsapp:{label:'واتساب',icon:'message-circle'},meeting:{label:'اجتماع',icon:'users'},note:{label:'ملاحظة',icon:'sticky-note'},stage:{label:'انتقال مرحلة',icon:'move-right'}};
function inPipeline(c){return (c.type||'عميل')!=='مورد'}
function stageIdx(key){return S.clientStages.findIndex(s=>s.key===key)}
function clientStage(c){return S.clientStages.find(s=>s.key===c.stageKey)||S.clientStages[0]}
function daysSince(d){if(!d)return 0;const ms=Date.parse(d+'T00:00:00')-Date.parse(today()+'T00:00:00');return Math.max(0,Math.round(-ms/86400000))}
function stageAge(c){return daysSince(c.stageDate)}
function isRotting(c){const st=clientStage(c);if(!st||st.final||!st.rot)return false;return stageAge(c)>Number(st.rot)}
function clientLog(c,kind,note){if(!Array.isArray(c.log))c.log=[];c.log.push({id:uid(),kind,note:note||'',date:today()})}
// نقل مرحلة العميل — للأمام فقط، حتى لا يرجع عميل مسلَّم للخلف بسبب مستند قديم
function bumpStage(contactId,targetKey,reason){
  const c=(S.contacts||[]).find(x=>x.id===contactId);if(!c)return;
  const cur=stageIdx(c.stageKey),to=stageIdx(targetKey);
  if(to<0||cur>=to)return;
  setClientStage(c,targetKey,reason);
}
function setClientStage(c,key,reason){
  const st=S.clientStages.find(s=>s.key===key);if(!st||c.stageKey===key)return;
  c.stageKey=key;c.stageDate=today();
  clientLog(c,'stage',(reason?reason+' — ':'')+'انتقل إلى: '+st.label);
}
function moveClientStage(id,key,reason,stay){const c=(S.contacts||[]).find(x=>x.id===id);if(!c)return;setClientStage(c,key,reason);save();if(stay)openClient(id);else rerender()}
// عملاء تحتاج متابعتهم اليوم أو تأخّرت خطوتهم القادمة
function dueFollowUps(){const tk=today();return (S.contacts||[]).filter(c=>inPipeline(c)&&!clientStage(c).final&&c.nextDate&&c.nextDate<=tk).sort((a,b)=>(a.nextDate||'').localeCompare(b.nextDate||''))}
function rottingClients(){return (S.contacts||[]).filter(c=>inPipeline(c)&&isRotting(c))}

// ترحيل آمن: يحوّل الأسماء النصية القديمة لجهات اتصال مربوطة (idempotent)
function migrateData(){
  // ترحيل لمرّة واحدة: تحديث الاسم القديم إلى اسم المؤسسة المسجّل (قابل للتغيير من الإعدادات لاحقاً)
  if(S.settings && !S.settings.brandMigrated){
    if((S.settings.brand||'')==='إبراهيم سعود')S.settings.brand='مؤسسة حروف ودروس';
    if(S.settings.vat && (S.settings.vat.sellerName||'')==='إبراهيم سعود')S.settings.vat.sellerName='مؤسسة حروف ودروس';
    S.settings.brandMigrated=true;
  }
  (S.projects||[]).forEach(p=>{
    if(!p.taskStages||!p.taskStages.length)p.taskStages=JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES));
    if(!p.contactId&&p.client)p.contactId=findOrCreateContact(p.client);
    (p.tasks||[]).forEach(t=>{if(!t.stageKey)t.stageKey=t.done?'done':p.taskStages[0].key;if(!Array.isArray(t.blocks))t.blocks=[]});
  });
  (S.appointments||[]).forEach(a=>{if(!a.contactId&&a.contact)a.contactId=findOrCreateContact(a.contact)});
  (S.invoices||[]).forEach(d=>{if(!d.contactId&&d.client)d.contactId=findOrCreateContact(d.client)});
  (S.sales||[]).forEach(d=>{if(!d.contactId&&d.client)d.contactId=findOrCreateContact(d.client)});
  (S.crm||[]).forEach(o=>{if(!o.contactId&&(o.clientName||o.client))o.contactId=findOrCreateContact(o.clientName||o.client)});
  // مسار العميل: استنتاج مرحلة العملاء القدامى من مستنداتهم بدل وضعهم كلهم في «عميل جديد»
  (S.contacts||[]).forEach(c=>{
    if(!Array.isArray(c.log))c.log=[];
    if(c.value==null)c.value=0;
    if(c.nextAction==null)c.nextAction='';
    if(c.nextDate==null)c.nextDate='';
    if(!c.stageKey){
      const invs=(S.invoices||[]).filter(d=>d.contactId===c.id);
      const quotes=(S.sales||[]).filter(d=>d.contactId===c.id);
      if(!inPipeline(c))c.stageKey='lead';
      else if(invs.length&&invs.every(d=>d.status==='paid'))c.stageKey='delivered';
      else if(invs.length)c.stageKey='delivery';
      else if(quotes.length)c.stageKey='quoted';
      else if((c.type||'')==='عميل محتمل')c.stageKey='lead';
      else c.stageKey='qualified';
    }
    if(stageIdx(c.stageKey)<0)c.stageKey=S.clientStages[0].key;
    if(!c.stageDate)c.stageDate=today();
  });
}
function emptyBox(ic,txt){const isName=/^[a-z][a-z0-9-]*$/.test(ic||'');const inner=isName?`<i data-lucide="${ic}"></i>`:ic;return `<div class="empty"><div class="big">${inner}</div>${txt}</div>`}
function delItem(coll,id,cb){if(!confirm('تأكيد الحذف؟'))return;S[coll]=S[coll].filter(x=>x.id!==id);save();closeModal();cb&&cb()}

/* ===== DRAG & DROP (kanban) ===== */
let DRAG=null;
function dstart(e,coll,id){DRAG={coll,id};e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move'}
function dend(e){e.currentTarget.classList.remove('dragging')}
function dover(e){e.preventDefault();e.currentTarget.classList.add('dragover')}
function dleave(e){e.currentTarget.classList.remove('dragover')}
function ddrop(e,coll,stageKey){e.preventDefault();e.currentTarget.classList.remove('dragover');if(DRAG&&DRAG.coll===coll){const it=S[coll].find(x=>x.id===DRAG.id);if(it&&it.stageKey!==stageKey){if(coll==='contacts')setClientStage(it,stageKey);else it.stageKey=stageKey;save();if(coll==='projects')syncTasks();rerender()}}DRAG=null}

/* ===== STAGE EDITOR ===== */
function stageEditor(stagesKey,coll){
  let stages=JSON.parse(JSON.stringify(S[stagesKey]));
  function body(){return `<p style="color:var(--muted);font-size:13px;margin-top:0">أضف أو احذف أو رتّب المراحل. البطاقات في المرحلة المحذوفة تنتقل لأول مرحلة.</p>`+
    stages.map((s,i)=>`<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
      <input value="${esc(s.label)}" oninput="stEdit(${i},this.value)" style="flex:1">
      <button class="link-btn" onclick="stMove(${i},-1)">▲</button><button class="link-btn" onclick="stMove(${i},1)">▼</button>
      <button class="link-btn del" onclick="stDel(${i})">حذف</button></div>`).join('')+
    `<button class="btn btn-ghost btn-sm" onclick="stAdd()">+ مرحلة جديدة</button>`}
  openModal('تعديل المراحل',body(),()=>{if(!stages.length){alert('أضف مرحلة واحدة على الأقل');return}const keys=stages.map(s=>s.key);S[coll].forEach(it=>{if(!keys.includes(it.stageKey))it.stageKey=keys[0]});S[stagesKey]=stages;save();closeModal();rerender()});
  window.stEdit=(i,v)=>{stages[i].label=v};
  window.stAdd=()=>{stages.push({key:uid(),label:'مرحلة جديدة'});refresh()};
  window.stDel=(i)=>{stages.splice(i,1);refresh()};
  window.stMove=(i,d)=>{const j=i+d;if(j<0||j>=stages.length)return;[stages[i],stages[j]]=[stages[j],stages[i]];refresh()};
  function refresh(){document.querySelector('#modalRoot .modal-body').innerHTML=body()}
}

/* ===== GENERIC KANBAN ===== */
function renderKanban(cfg){
  const stages=S[cfg.stagesKey];
  const pool=cfg.filter?S[cfg.coll].filter(cfg.filter):S[cfg.coll];
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>${cfg.title}</h1><div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="stageEditor('${cfg.stagesKey}','${cfg.coll}')"><i data-lucide="settings"></i> تعديل المراحل</button>
      <button class="btn btn-gold" onclick="${cfg.onAdd}">+ ${cfg.addLabel}</button></div></div>
    ${cfg.note||''}
    ${!pool.length?emptyBox(cfg.emptyIcon,cfg.emptyText):
    `<div class="kanban">${stages.map(st=>{
      let items=pool.filter(it=>it.stageKey===st.key);
      if(cfg.sort)items=items.slice().sort(cfg.sort);
      const sum=cfg.valueField?items.reduce((a,it)=>a+Number(it[cfg.valueField]||0),0):null;
      return `<div class="kcol" ondragover="dover(event)" ondragleave="dleave(event)" ondrop="ddrop(event,'${cfg.coll}','${st.key}')">
        <h4><span>${esc(st.label)}</span><span class="kbadge">${items.length}</span></h4>
        ${sum!=null?`<div style="font-size:12px;color:var(--gold);margin-bottom:8px">${money(sum)}</div>`:''}
        ${items.map(it=>`<div class="kitem ${cfg.itemClass?cfg.itemClass(it):''}" draggable="true" ondragstart="dstart(event,'${cfg.coll}','${it.id}')" ondragend="dend(event)" onclick="${cfg.onOpen}('${it.id}')">${cfg.card(it)}</div>`).join('')||'<p style="color:var(--muted);font-size:12px">اسحب بطاقة هنا</p>'}
      </div>`}).join('')}</div>`}`;
}

/* ===== مسار العملاء (لوحة المراحل — مطوّرة) ===== */
function pipePrefs(){if(!S.pipeline)S.pipeline={};const p=S.pipeline;
  if(p.hideFinal==null)p.hideFinal=true;               // إخفاء «تم التسليم/لم يكتمل» افتراضياً
  if(!p.collapsed)p.collapsed={};                       // {stageKey:true}
  if(!p.filter)p.filter='all';                          // all | overdue | stale | thisMonth
  if(!p.wipLimits)p.wipLimits={};                       // {stageKey:number}
  return p}
function pipeSetFilter(f){pipePrefs().filter=f;save();renderPipeline()}
function pipeToggleCollapse(k){const p=pipePrefs();p.collapsed[k]=!p.collapsed[k];save();renderPipeline()}
function pipeToggleFinal(){const p=pipePrefs();p.hideFinal=!p.hideFinal;save();renderPipeline()}
function pipeSetWIP(k){const cur=pipePrefs().wipLimits[k]||'';const v=prompt('حدّ WIP لهذه المرحلة (اتركه فارغاً لإلغائه):',cur);if(v===null)return;const n=parseInt(v||'',10);if(!n||n<=0)delete pipePrefs().wipLimits[k];else pipePrefs().wipLimits[k]=n;save();renderPipeline()}
function pipeMatch(c,filter){
  if(filter==='overdue')return !!(c.nextDate&&c.nextDate<today());
  if(filter==='stale')return isRotting(c);
  if(filter==='noNext')return !c.nextAction;
  if(filter==='thisMonth'){const ym=today().slice(0,7);return (c.stageDate||'').slice(0,7)===ym;}
  return true;
}
function humanDate(d){if(!d)return '—';const dt=new Date(d+'T00:00:00');const now=new Date();const diff=Math.round((dt-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);if(diff===0)return 'اليوم';if(diff===-1)return 'أمس';if(diff===1)return 'غداً';if(diff<-1&&diff>=-6)return 'قبل '+(-diff)+' أيام';if(diff>1&&diff<=6)return 'بعد '+diff+' أيام';return d;}
function pipelineCardHTML(c){
  const st=clientStage(c);const age=stageAge(c);const rot=isRotting(c);
  const overdue=!!(c.nextDate&&c.nextDate<today());
  return `<div class="t" style="display:flex;align-items:center;gap:8px">${clientAvatar(c,30)}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.name)}</span>${Number(c.value||0)>0?`<span class="val" style="margin:0">${money(c.value)}</span>`:''}</div>
    ${c.company?`<div class="m">${esc(c.company)}</div>`:''}
    <div class="m pipe-meta">
      <span title="عمر العميل في هذه المرحلة" class="pipe-chip ${rot?'warn':''}"><i data-lucide="clock"></i> ${age} يوم في «${esc(st.label)}»</span>
      ${c.stageDate?`<span title="دخل المرحلة في" class="pipe-chip"><i data-lucide="log-in"></i> ${humanDate(c.stageDate)}</span>`:''}
      ${c.nextDate?`<span title="الخطوة القادمة" class="pipe-chip ${overdue?'bad':''}"><i data-lucide="calendar-clock"></i> ${humanDate(c.nextDate)}</span>`:''}
    </div>
    ${c.nextAction?`<div class="m" style="margin-top:6px;color:${overdue?'var(--bad)':'var(--ink)'}"><i class="inl" data-lucide="target"></i> ${esc(c.nextAction)}</div>`:'<div class="m" style="margin-top:6px;color:var(--warn)"><i class="inl" data-lucide="alert-triangle"></i> بلا خطوة قادمة</div>'}`;
}
function renderPipeline(){
  const prefs=pipePrefs();
  const allStages=S.clientStages;
  const stages=prefs.hideFinal?allStages.filter(s=>!s.final):allStages;
  const finalStages=allStages.filter(s=>s.final);
  const poolAll=(S.contacts||[]).filter(inPipeline);
  const pool=poolAll.filter(c=>pipeMatch(c,prefs.filter));
  const live=poolAll.filter(c=>!clientStage(c).final);
  const openVal=live.reduce((a,c)=>a+Number(c.value||0),0);
  const rot=rottingClients().length,due=dueFollowUps().length;
  const monthlyClosed=poolAll.filter(c=>c.stageKey==='delivered'&&(c.stageDate||'').slice(0,7)===today().slice(0,7)).length;
  const filters=[
    ['all','الكل',poolAll.length],
    ['overdue','متأخّرو المتابعة',poolAll.filter(c=>pipeMatch(c,'overdue')).length],
    ['stale','راكد',poolAll.filter(c=>pipeMatch(c,'stale')).length],
    ['noNext','بلا خطوة',poolAll.filter(c=>pipeMatch(c,'noNext')).length],
    ['thisMonth','هذا الشهر',poolAll.filter(c=>pipeMatch(c,'thisMonth')).length],
  ];
  const finalPill=finalStages.map(s=>{const n=poolAll.filter(c=>c.stageKey===s.key).length;return `<span class="chip ${s.lost?'del':'good'}" title="${esc(s.label)}">${esc(s.label)} · ${n}</span>`}).join(' ');
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="git-branch"></i> مسار العملاء</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="pipeToggleFinal()"><i data-lucide="${prefs.hideFinal?'eye':'eye-off'}"></i> ${prefs.hideFinal?'أظهر المغلقة':'أخفِ المغلقة'}</button>
        <button class="btn btn-ghost btn-sm" onclick="stageEditor('clientStages','contacts')"><i data-lucide="settings"></i> تعديل المراحل</button>
        <button class="btn btn-gold" onclick="contactModal(null,renderPipeline)">+ عميل جديد</button>
      </div>
    </div>
    <div class="badge-note"><i data-lucide="lightbulb"></i>
      <div>اسحب العميل بين المراحل — يُسجَّل الانتقال تلقائياً وتُحدَّث ساعة عمره في المرحلة. <b style="color:var(--warn)">حدّ برتقالي</b> = ركود. اضغط رأس أي عمود لطيّه. اضغط الأيقونة ⚙ لضبط حدّ WIP.
        <br><b>مفتوح:</b> ${money(openVal)} · <b>متابعات مستحقّة:</b> ${due} · <b>راكد:</b> ${rot} · <b>مُسلَّم هذا الشهر:</b> ${monthlyClosed}${finalPill?' · '+finalPill:''}</div>
    </div>
    <div class="pipe-filters">${filters.map(f=>`<button class="chip ${prefs.filter===f[0]?'good':''}" onclick="pipeSetFilter('${f[0]}')">${esc(f[1])} <b>${f[2]}</b></button>`).join('')}</div>
    ${!pool.length?emptyBox('git-branch','لا يوجد عملاء يطابقون هذا الفلتر.'):`<div class="kanban">${stages.map(st=>{
      const items=pool.filter(c=>c.stageKey===st.key).sort((a,b)=>Number(b.value||0)-Number(a.value||0));
      const sum=items.reduce((a,c)=>a+Number(c.value||0),0);
      const collapsed=!!prefs.collapsed[st.key];
      const wip=prefs.wipLimits[st.key]||0;
      const wipCls=wip?(items.length>wip?'wip-over':(items.length>=wip?'wip-warn':'')):'';
      if(collapsed){return `<div class="kcol kcol-collapsed" onclick="pipeToggleCollapse('${st.key}')" title="اضغط لفتح ${esc(st.label)}" ondragover="dover(event)" ondragleave="dleave(event)" ondrop="ddrop(event,'contacts','${st.key}')">
        <div class="kcol-col-title">${esc(st.label)} <span class="kbadge">${items.length}</span></div>
      </div>`}
      return `<div class="kcol ${wipCls}" ondragover="dover(event)" ondragleave="dleave(event)" ondrop="ddrop(event,'contacts','${st.key}')">
        <h4 class="kcol-head">
          <button class="link-btn" onclick="pipeToggleCollapse('${st.key}')" title="طيّ العمود" style="padding:0"><i data-lucide="chevrons-right"></i></button>
          <span style="flex:1;cursor:pointer" onclick="pipeToggleCollapse('${st.key}')">${esc(st.label)}</span>
          <span class="kbadge ${wipCls}">${items.length}${wip?'/'+wip:''}</span>
          <button class="link-btn" onclick="pipeSetWIP('${st.key}')" title="حدّ WIP" style="padding:0"><i data-lucide="gauge"></i></button>
        </h4>
        ${sum?`<div style="font-size:12px;color:var(--gold);margin-bottom:8px">${money(sum)}</div>`:''}
        ${items.map(it=>`<div class="kitem ${isRotting(it)?'rot':''}" draggable="true" ondragstart="dstart(event,'contacts','${it.id}')" ondragend="dend(event)" onclick="openClient('${it.id}')">${pipelineCardHTML(it)}</div>`).join('')||'<p style="color:var(--muted);font-size:12px">اسحب بطاقة هنا</p>'}
      </div>`}).join('')}</div>`}`;
  applyWallpaper();refreshIcons();
}

/* ===== المهام (نظام أهمية بثلاث مستويات — مثل TickTick) ===== */
const PRIO={high:{c:'#ef4444',label:'عالية'},med:{c:'#f5a623',label:'متوسطة'},none:{c:'#8a8a92',label:'بدون'}};
const PRIO_ORDER={high:0,med:1,none:2};
function flagSvg(c,filled){return `<svg width="15" height="15" viewBox="0 0 24 24" fill="${filled?c:'none'}" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;flex:none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`}
function prioFlag(p){p=p||'none';const x=PRIO[p]||PRIO.none;return flagSvg(x.c,p!=='none')}
function dueChip(d){if(!d)return '';const tk=today();const cls=d<tk?'unpaid':(d===tk?'progress':'scheduled');const lbl=d===tk?'اليوم':(d<tk?'متأخر · '+d:d);return `<span class="pill ${cls}">${lbl}</span>`}
const taskDoneKey=()=>S.crmStages[S.crmStages.length-1].key;
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: window.pickPrio=function(p){const h=document.getElementById('o_prio'); */

function renderCRM(){
  renderKanban({title:'إدارة المهام',onAdd:'crmModal()',addLabel:'مهمة جديدة',stagesKey:'crmStages',coll:'crm',onOpen:'crmModal',
    sort:(a,b)=>(PRIO_ORDER[a.priority||'none'])-(PRIO_ORDER[b.priority||'none']),
    emptyIcon:'list-checks',emptyText:'لا توجد مهام بعد. أضف أول مهمة، أو اكتبها في «عنتر».',
    note:'<div class="badge-note"><i data-lucide="lightbulb"></i> <div>اسحب المهام بين المراحل، وحدّد الأهمية بالعَلَم (<b style="color:#ef4444">أحمر</b>/<b style="color:#f5a623">أصفر</b>/رمادي). أي شيء تكتبه في «عنتر» يُضاف هنا تلقائياً.</div></div>',
    card:o=>`<div class="t" style="display:flex;align-items:flex-start;gap:7px">${prioFlag(o.priority)}<span style="flex:1">${esc(o.title)}</span></div>${(o.due||o.clientName||o.value>0)?`<div class="m">${dueChip(o.due)}${o.clientName?(o.due?' · ':'')+esc(o.clientName):''}${o.value>0?(o.due||o.clientName?' · ':'')+money(o.value):''}</div>`:''}`});
}
function crmModal(id){
  let o=id?{...S.crm.find(x=>x.id===id)}:{id:'',title:'',contactId:'',clientName:'',value:0,priority:'none',due:'',stageKey:S.crmStages[0].key,notes:'',date:today()};
  const sOpts=S.crmStages.map(s=>`<option value="${s.key}" ${o.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('');
  const prioBtns=['high','med','none'].map(p=>`<button type="button" data-p="${p}" onclick="pickPrio('${p}')" style="display:inline-flex;align-items:center;gap:6px;padding:9px 13px;border-radius:11px;border:1px solid var(--line);background:transparent;color:var(--ink);font-family:inherit;font-weight:700;font-size:13px;cursor:pointer">${flagSvg(PRIO[p].c,p!=='none')} ${PRIO[p].label}</button>`).join('');
  openModal(id?'تعديل مهمة':'مهمة جديدة',`
    <div class="field"><label>عنوان المهمة</label><input id="o_title" value="${esc(o.title)}" placeholder="مثال: تجهيز سكربت إعلان..."></div>
    <div class="field"><label>الأهمية</label><div id="o_prio_pick" style="display:flex;gap:8px;flex-wrap:wrap">${prioBtns}</div><input type="hidden" id="o_prio" value="${esc(o.priority||'none')}"></div>
    <div class="row2"><div class="field"><label>المرحلة</label><select id="o_stage">${sOpts}</select></div>
    <div class="field"><label>تاريخ الاستحقاق (اختياري)</label><input type="date" id="o_due" value="${esc(o.due||'')}"></div></div>
    <div class="field"><label>ملاحظات</label><textarea id="o_notes" rows="2">${esc(o.notes)}</textarea></div>`,
  ()=>{const g=i=>document.getElementById(i).value;o.title=g('o_title');o.priority=g('o_prio');o.stageKey=g('o_stage');o.due=g('o_due');o.notes=g('o_notes');if(!o.title.trim()){alert('أدخل عنوان المهمة');return}if(id){const i=S.crm.findIndex(x=>x.id===id);S.crm[i]=o}else{o.id=uid();S.crm.push(o)}save();closeModal();renderCRM()},id?()=>delItem('crm',id,renderCRM):null);
  pickPrio(o.priority||'none');
}
