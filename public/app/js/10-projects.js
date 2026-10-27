/*
 * 10-projects.js — المشاريع على طريقة Trello: لوحات ← قوائم ← بطاقات + غرفة المشروع ومحرّر المهام
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 *
 * النموذج: S.projects[] = لوحة {id,title,contactId,client,podcast,stageKey,emoji,tasks[],taskStages[]}
 *   إضافات اختياريّة (تُضاف عند الحاجة فقط): star, seen, closed, bg, bgImg, labels[{id,name,color}]
 *   القائمة = taskStages[i] {key,label} + closed (مؤرشفة) + collapsed (مطويّة)
 *   البطاقة = task {id,title,stageKey,done,assignee,blocks[]} + order, labels[], start, due, dueDone,
 *     checklists[{id,title,hide,items[{id,text,done}]}], atts[{id,k:'img'|'link',url,name,at}],
 *     comments[{id,at,text,sys}] (sys=نشاط آليّ), cover{c|u}, archived
 *   مرحلة «done» = منجز (t.done يتبعها) — كما كانت.
 */
let CUR_PROJ=null;
// حالة التشغيل (كائن خامل؛ يُعدَّل وقت التشغيل فقط)
const PJX={q:'',stg:'',closed:false,f:{q:'',lb:[],mb:[],due:''},fp:null,kfv:false,comp:null,addL:false,menu:false,mtab:'about',fc:null,hov:null,pd:null,jd:0,popFn:null,popR:null,kb:false,tmv:false,open:null,lbEdit:null,lbC:'',lbN:'',mv:null,cla:null,act:true,st:null,rid:null};
const PJ_BGS={ink:'linear-gradient(135deg,#26262b,#0c0c0e)',gold:'linear-gradient(135deg,#5a4614,#16110a)',ember:'linear-gradient(135deg,#6b2a16,#1a0d0a)',plum:'linear-gradient(135deg,#4a2560,#140c1c)',ocean:'linear-gradient(135deg,#164a73,#0a1420)',teal:'linear-gradient(135deg,#11564f,#08181a)',forest:'linear-gradient(135deg,#25502a,#0b150b)',rose:'linear-gradient(135deg,#6b2445,#1a0b12)',sand:'linear-gradient(135deg,#c8a33c,#5e4718)',sky:'linear-gradient(135deg,#3b82f6,#1e3a8a)',mint:'linear-gradient(135deg,#2dd4bf,#0f5f59)',sunset:'linear-gradient(135deg,#f59e0b,#be123c)',c1:'#0c66a8',c2:'#b7791f',c3:'#3f7d32',c4:'#a33a2a',c5:'#6e4b85',c6:'#3f434a'};
const PJ_DEFBG=['ink','gold','ember','plum','ocean','teal','forest','rose'];
const PJ_LC=['#4bce97','#f5cd47','#fea362','#f87168','#9f8fef','#579dff','#6cc3e0','#94c748','#e774bb','#8590a2'];

/* ===== أدوات صغيرة ===== */
function proj(){return S.projects.find(x=>x.id===CUR_PROJ)}
function taskDone(t){return t.stageKey==='done'}
function pjT(id){const p=proj();return p?(p.tasks||[]).find(t=>t.id===id):null}
function pjSL(p,k){return ((p.taskStages||[]).find(s=>s.key===k)||{}).label||''}
function pjCards(p,k){return (p.tasks||[]).map((t,i)=>[t,i]).filter(([t])=>t.stageKey===k&&!t.archived).sort((a,b)=>(a[0].order!=null?a[0].order:a[1])-(b[0].order!=null?b[0].order:b[1])).map(x=>x[0])}
function pjNextO(p,k){const c=pjCards(p,k);if(!c.length)return 0;const l=c[c.length-1];return (l.order!=null?l.order:(p.tasks||[]).indexOf(l))+1}
function pjAdd(d,n){const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}
function pjFD(d){if(!d)return '';try{return new Date(d+'T12:00').toLocaleDateString('ar',{day:'numeric',month:'short'})}catch(e){return d}}
function pjAgo(ts){const s=(Date.now()-ts)/1000;if(s<60)return 'الآن';if(s<3600)return 'قبل '+Math.round(s/60)+' د';if(s<86400)return 'قبل '+Math.round(s/3600)+' س';return new Date(ts).toLocaleString('ar',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}
function pjIni(n){n=(n||'').trim();if(!n)return '?';const w=n.split(/\s+/);return w[0][0]+(w[1]?w[1][0]:'')}
function pjTxt(t){return (t.blocks||[]).map(b=>(b.html||'').replace(/<[^>]*>|&nbsp;/g,' ')).join(' ')}
function pjHasDesc(t){return (t.blocks||[]).some(b=>b.type==='image'||(b.html&&b.html.replace(/<[^>]*>|&nbsp;/g,'').trim()))}
function pjCk(t){let n=0,m=0;(t.checklists||[]).forEach(c=>(c.items||[]).forEach(i=>{m++;if(i.done)n++}));return {n,m}}
function pjDueSt(t){if(!t.due)return '';if(t.dueDone||t.stageKey==='done')return 'ok';const td=today();if(t.due<td)return 'late';if(t.due<=pjAdd(td,1))return 'soon';return ''}
function pjDueLbl(st){return {ok:'منجز',late:'متأخر',soon:'قريب'}[st]||''}
function pjAct(t,txt){t.comments=t.comments||[];t.comments.push({id:uid(),at:Date.now(),text:txt,sys:1})}
function pjLabels(p){if(!Array.isArray(p.labels)||!p.labels.length)p.labels=PJ_LC.slice(0,6).map(c=>({id:uid(),name:'',color:c}));return p.labels}
function pjLab(p,id){return (p.labels||[]).find(l=>l.id===id)}
function pjBgCss(p){if(p.bgImg)return `background:#111 url('${esc(p.bgImg)}') center/cover`;let k=p.bg;if(!PJ_BGS[k]){let h=0;for(const c of String(p.id||p.title||''))h=(h*31+c.charCodeAt(0))>>>0;k=PJ_DEFBG[h%PJ_DEFBG.length]}return 'background:'+PJ_BGS[k]}
// حفظ + مزامنة مهامّ الفريلانسرز (مؤجّلة قليلاً لتجميع التعديلات المتتالية)
function pjSave(){save();clearTimeout(PJX.st);PJX.st=setTimeout(()=>syncTasks(),800)}
// إعادة رسم كلّ ما هو ظاهر: اللوحة + البطاقة المفتوحة + النافذة الصغيرة
function pjSync(noPop){if(CUR==='projects'&&CUR_PROJ&&document.getElementById('pjLists'))renderProjectDetail(CUR_PROJ);pjcRefresh();if(!noPop)pjPopRef()}

/* ===== الصفحة الرئيسيّة: شبكة اللوحات ===== */
function renderProjects(){
  CUR_PROJ=null;PJX.menu=false;pjCSS();pjKB();
  const chip=(k,l)=>`<button class="${PJX.stg===k&&!PJX.closed?'on':''}" onclick="PJX.closed=false;PJX.stg='${k}';renderProjects()">${esc(l)}</button>`;
  const nClosed=(S.projects||[]).filter(p=>p.closed).length;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>المشاريع</h1>
      <div class="pj-hact"><label class="pj-search"><i data-lucide="search"></i><input id="pjQ" value="${esc(PJX.q)}" placeholder="ابحث في اللوحات…" oninput="PJX.q=this.value;pjHomeGrid()"></label>
      <button class="btn btn-gold" onclick="projModal()">+ لوحة جديدة</button></div></div>
    <div class="pj-chips">${chip('','كل المراحل')}${(S.projectStages||[]).map(s=>chip(s.key,s.label)).join('')}
      ${nClosed?`<button class="${PJX.closed?'on':''}" onclick="PJX.closed=!PJX.closed;renderProjects()"><i class="inl" data-lucide="archive"></i> اللوحات المغلقة (${nClosed})</button>`:''}</div>
    <div id="pjHome"></div>`;
  pjHomeGrid();
}
function pjHomeGrid(){
  const el=document.getElementById('pjHome');if(!el)return;
  const q=PJX.q.trim().toLowerCase();const all=S.projects||[];
  const vis=all.filter(p=>!!p.closed===PJX.closed&&(PJX.closed||!PJX.stg||p.stageKey===PJX.stg)&&(!q||(p.title+' '+resolveClientName(p)+' '+(p.podcast||'')).toLowerCase().includes(q)));
  const grid=(arr,add)=>`<div class="pj-grid">${arr.map(pjTile).join('')}${add?`<div class="pj-tile pj-new" onclick="projModal()"><span><i class="inl" data-lucide="plus"></i> لوحة جديدة</span></div>`:''}</div>`;
  if(!all.length){el.innerHTML=emptyBox('clapperboard','لا توجد مشاريع بعد. أنشئ أوّل لوحة.')+grid([],1);refreshIcons();return}
  let h='';
  if(PJX.closed)h=`<div class="pj-sh"><i data-lucide="archive"></i> اللوحات المغلقة</div>`+(vis.length?grid(vis):'<p style="color:var(--muted)">لا شيء هنا.</p>');
  else{
    const star=vis.filter(p=>p.star),rec=q?[]:vis.filter(p=>p.seen).sort((a,b)=>b.seen-a.seen).slice(0,4);
    if(star.length)h+=`<div class="pj-sh"><i data-lucide="star"></i> المميّزة</div>`+grid(star);
    if(rec.length)h+=`<div class="pj-sh"><i data-lucide="clock"></i> زرتها مؤخراً</div>`+grid(rec);
    h+=`<div class="pj-sh"><i data-lucide="layout-grid"></i> كل اللوحات <span class="pj-n">${vis.length}</span></div>`+grid(vis,!q);
  }
  el.innerHTML=h;refreshIcons();
}
function pjTile(p){
  const ts=(p.tasks||[]).filter(t=>!t.archived),dn=ts.filter(t=>t.stageKey==='done').length;
  const stl=((S.projectStages||[]).find(s=>s.key===p.stageKey)||{}).label||'';
  return `<div class="pj-tile" style="${pjBgCss(p)}" onclick="openProject('${p.id}')">
    <div class="pj-tt"><span class="inl">${iconHTML(p.emoji,'clapperboard',16)}</span>${esc(p.title)}</div>
    <div class="pj-tm">${esc(resolveClientName(p))} · ${dn}/${ts.length} مهمة</div>
    ${p.podcast?`<div class="pj-tm"><i class="inl" data-lucide="mic"></i> ${esc(p.podcast)}</div>`:''}
    ${stl?`<span class="pj-tst">${esc(stl)}</span>`:''}
    ${p.closed?`<span class="pj-tbtns"><button onclick="event.stopPropagation();pjReopen('${p.id}')">إعادة فتح</button><button class="del" onclick="event.stopPropagation();pjDelBoard('${p.id}')">حذف</button></span>`
      :`<button class="pj-star${p.star?' on':''}" onclick="event.stopPropagation();pjStar('${p.id}')" title="تمييز"><i data-lucide="star"></i></button>`}
    <div class="pj-tprog"><i style="width:${ts.length?Math.round(dn/ts.length*100):0}%"></i></div>
  </div>`;
}
function pjStar(id){const p=S.projects.find(x=>x.id===id);if(!p)return;p.star=!p.star;save();if(CUR_PROJ)renderProjectDetail(CUR_PROJ);else pjHomeGrid()}
function pjReopen(id){const p=S.projects.find(x=>x.id===id);if(!p)return;delete p.closed;save();if(CUR_PROJ)renderProjectDetail(CUR_PROJ);else renderProjects()}
function pjCloseBoard(id){const p=S.projects.find(x=>x.id===id);if(!p||!confirm('إغلاق اللوحة؟ تجدها لاحقاً في «اللوحات المغلقة» ويمكن إعادة فتحها.'))return;p.closed=true;save();go('projects')}
function pjDelBoard(id){delItem('projects',id,()=>{syncTasks();renderProjects()})}
function projModal(id){
  let p=id?JSON.parse(JSON.stringify(S.projects.find(x=>x.id===id))):{id:'',title:'',contactId:'',client:'',podcast:'',stageKey:S.projectStages[0].key,emoji:'clapperboard',tasks:[],taskStages:JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES))};
  const sOpts=S.projectStages.map(s=>`<option value="${s.key}" ${p.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('');
  openModal(id?'تعديل المشروع':'لوحة مشروع جديدة',`
    <div class="row2"><div class="field"><label>اسم المشروع</label><input id="p_title" value="${esc(p.title)}" placeholder="مثال: حملة فيديو"></div>
    <div class="field"><label>العميل</label>${clientFieldHTML('p_client',resolveClientName(p))}</div></div>
    <div class="field"><label>اسم البودكاست/الوصف المختصر (اختياري)</label><input id="p_podcast" value="${esc(p.podcast||'')}" placeholder="مثال: بودكاست خزاما"></div>
    <div class="field"><label>مرحلة الإنتاج</label><select id="p_stage">${sOpts}</select></div>
    <div class="field"><label>الأيقونة</label><div style="display:flex;gap:6px;flex-wrap:wrap">${ICON_CHOICES.map(n=>`<button type="button" class="icon-pick" data-n="${n}" onclick="pickProjIcon('${n}')"><i data-lucide="${n}"></i></button>`).join('')}</div><input type="hidden" id="p_emoji" value="${esc(iconName(p.emoji,'clapperboard'))}"></div>
    <div class="field"><label>خلفية اللوحة</label><div class="pj-bgg pj-bgm">${Object.keys(PJ_BGS).map(k=>`<button type="button" data-k="${k}" class="${p.bg===k?'on':''}" style="background:${PJ_BGS[k]}" onclick="pjPickBg('${k}')"></button>`).join('')}</div><input type="hidden" id="p_bg" value="${esc(p.bg||'')}"></div>`,
  ()=>{const g=i=>document.getElementById(i).value;p.title=g('p_title').trim();const cn=g('p_client').trim();p.contactId=findOrCreateContact(cn);p.client=cn;p.podcast=g('p_podcast').trim();p.stageKey=g('p_stage');p.emoji=g('p_emoji')||'clapperboard';const bg=g('p_bg');if(bg){p.bg=bg;delete p.bgImg}if(!p.title){alert('أدخل اسم المشروع');return}if(!p.taskStages||!p.taskStages.length)p.taskStages=JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES));if(id){const i=S.projects.findIndex(x=>x.id===id);S.projects[i]=p}else{p.id=uid();S.projects.push(p)}save();syncTasks();closeModal();if(id&&CUR_PROJ===id)renderProjectDetail(id);else openProject(p.id)},id?()=>delItem('projects',id,()=>{CUR_PROJ=null;syncTasks();go('projects')}):null);
  pickProjIcon(iconName(p.emoji,'clapperboard'));pjCSS();
}
function pjPickBg(k){const h=document.getElementById('p_bg');if(h)h.value=k;document.querySelectorAll('.pj-bgm button').forEach(b=>b.classList.toggle('on',b.dataset.k===k))}

/* ===== اللوحة: قوائم أفقيّة + بطاقات ===== */
function openProject(id){
  const p=S.projects.find(x=>x.id===id);if(!p)return;
  if(PJX.fp!==id){PJX.f={q:'',lb:[],mb:[],due:''};PJX.fp=id;PJX.menu=false;PJX.comp=null;PJX.fc=null;PJX.addL=false}
  p.seen=Date.now();save();CUR_PROJ=id;renderProjectDetail(id);
}
function pjFN(){const f=PJX.f;return (f.q?1:0)+f.lb.length+f.mb.length+(f.due?1:0)}
function pjMatch(t){const f=PJX.f;
  if(f.q&&!(t.title+' '+pjTxt(t)).toLowerCase().includes(f.q.toLowerCase()))return false;
  if(f.lb.length){const L=t.labels||[];if(!f.lb.some(x=>x==='-'?!L.length:L.includes(x)))return false}
  if(f.mb.length&&!f.mb.some(x=>x==='-'?!t.assignee:t.assignee===x))return false;
  if(f.due){const st=pjDueSt(t),td=today();
    if(f.due==='late'&&st!=='late')return false;
    if(f.due==='week'&&!(t.due&&t.due>=td&&t.due<=pjAdd(td,7)&&st!=='ok'))return false;
    if(f.due==='none'&&t.due)return false;
    if(f.due==='done'&&st!=='ok')return false}
  return true}
function renderProjectDetail(id){
  const p=S.projects.find(x=>x.id===id);if(!p){go('projects');return}
  CUR_PROJ=id;pjCSS();pjKB();
  if(!p.taskStages||!p.taskStages.length)p.taskStages=JSON.parse(JSON.stringify(DEFAULT_TASK_STAGES));
  // نحفظ موضع التمرير ليبقى ثابتاً بعد إعادة الرسم
  const old=document.getElementById('pjLists'),same=PJX.rid===id,sx=old&&same?old.scrollLeft:0,sy={};
  if(old&&same)old.querySelectorAll('.pj-cards').forEach(c=>sy[c.dataset.k]=c.scrollTop);
  const drs=document.querySelector('.pj-drb');const dry=drs&&same?drs.scrollTop:0;
  PJX.rid=id;
  const fn=pjFN(),stl=((S.projectStages||[]).find(s=>s.key===p.stageKey)||{}).label||'';
  document.getElementById('main').innerHTML=`<div class="pj-board" style="${pjBgCss(p)}">
    <div class="pj-bar">
      <button class="pj-ib" onclick="go('projects')" title="كل اللوحات"><i data-lucide="layout-grid"></i></button>
      <span class="pj-bi">${iconHTML(p.emoji,'clapperboard',18)}</span>
      <input class="pj-bt" value="${esc(p.title)}" size="${Math.max(4,Math.min(40,p.title.length+1))}" onchange="pjRenameBoard(this.value)" onkeydown="if(event.key==='Enter'||event.key==='Escape')this.blur()" title="إعادة تسمية">
      <button class="pj-ib${p.star?' on':''}" onclick="pjStar('${p.id}')" title="تمييز اللوحة"><i data-lucide="star"></i></button>
      ${stl?`<span class="pj-chip" title="مرحلة الإنتاج"><i class="inl" data-lucide="package"></i> ${esc(stl)}</span>`:''}
      <span class="pj-chip pj-hide-sm" title="العميل"><i class="inl" data-lucide="user"></i> ${esc(resolveClientName(p))}</span>
      <span class="pj-sp"></span>
      <button class="pj-btn${fn?' on':''}" id="pjFBtn" onclick="pjFilterPop(this)" title="تصفية (F)"><i data-lucide="list-filter"></i> <span class="pj-hide-sm">تصفية</span>${fn?` <b>${fn}</b>`:''}</button>
      ${fn?`<button class="pj-ib" onclick="pjFClear()" title="مسح التصفية (X)"><i data-lucide="x"></i></button>`:''}
      <button class="pj-ib" onclick="pjBgPop(this)" title="خلفية اللوحة"><i data-lucide="palette"></i></button>
      <button class="pj-ib" onclick="pjMenu('room')" title="غرفة العميل"><i data-lucide="door-open"></i></button>
      <button class="pj-ib" onclick="pjMenu(PJX.menu?false:'about')" title="قائمة اللوحة"><i data-lucide="ellipsis"></i></button>
    </div>
    ${p.closed?`<div class="pj-archb"><i data-lucide="archive"></i> هذه اللوحة مغلقة. <button class="pj-btn" onclick="pjReopen('${p.id}')">إعادة فتح</button></div>`:''}
    <div class="pj-lists" id="pjLists">${p.taskStages.filter(s=>!s.closed).map(st=>pjListHTML(p,st,fn)).join('')}
      <div class="pj-addl">${PJX.addL?`<div class="pj-comp" style="padding:8px"><input id="pjAddL" placeholder="عنوان القائمة…" onkeydown="if(event.key==='Enter')pjAddList();else if(event.key==='Escape'){PJX.addL=false;renderProjectDetail(CUR_PROJ)}"><div class="pj-row"><button class="btn btn-gold btn-sm" onclick="pjAddList()">أضف قائمة</button><button class="pj-ib" onclick="PJX.addL=false;renderProjectDetail(CUR_PROJ)"><i data-lucide="x"></i></button></div></div>`
        :`<button class="pj-addlb" onclick="PJX.addL=true;renderProjectDetail(CUR_PROJ);setTimeout(()=>{const i=document.getElementById('pjAddL');if(i)i.focus()},20)"><i data-lucide="plus"></i> أضف قائمة أخرى</button>`}</div>
    </div>
    ${PJX.menu?pjMenuHTML(p):''}
  </div>`;
  const nl=document.getElementById('pjLists');if(nl){nl.scrollLeft=sx;nl.querySelectorAll('.pj-cards').forEach(c=>{if(sy[c.dataset.k])c.scrollTop=sy[c.dataset.k]})}
  const nd=document.querySelector('.pj-drb');if(nd&&dry)nd.scrollTop=dry;
  refreshIcons();
  if(PJX.menu&&PJX.mtab==='about')pjRoomLoad(p);
}
function pjListHTML(p,st,fn){
  const all=pjCards(p,st.key),cards=fn?all.filter(pjMatch):all;
  if(st.collapsed)return `<div class="pj-list col" data-k="${st.key}" onclick="pjCollapse('${st.key}')" title="فرد القائمة"><div class="pj-lcol"><i data-lucide="chevrons-left-right"></i><span>${esc(st.label)}</span><span class="pj-n">${all.length}</span></div></div>`;
  return `<div class="pj-list${st.key==='done'?' dn':''}" data-k="${st.key}" onmouseenter="PJX.hov='${st.key}'">
    <div class="pj-lh" onpointerdown="pjDown(event,'list','${st.key}')">
      <div class="pj-lt" onclick="pjListRename(event,'${st.key}')">${esc(st.label)}</div>
      <span class="pj-n">${fn?cards.length+'/':''}${all.length}</span>
      <button class="pj-ib sm" onclick="pjListMenu(this,'${st.key}')" title="إجراءات القائمة"><i data-lucide="ellipsis"></i></button>
    </div>
    <div class="pj-cards" data-k="${st.key}">${cards.map(t=>pjCardHTML(p,t)).join('')}</div>
    ${PJX.comp===st.key?`<div class="pj-comp"><textarea id="pjCompIn" rows="2" placeholder="أدخل عنواناً لهذه البطاقة…" onkeydown="pjCompKey(event,'${st.key}')"></textarea>
      <div class="pj-row"><button class="btn btn-gold btn-sm" onclick="pjCompAdd('${st.key}')">أضف بطاقة</button><button class="pj-ib" onclick="pjComp(null)" title="إغلاق (Esc)"><i data-lucide="x"></i></button></div></div>`
      :`<button class="pj-add" onclick="pjComp('${st.key}')"><i data-lucide="plus"></i> أضف بطاقة</button>`}
  </div>`;
}
function pjCardHTML(p,t){
  const lb=(t.labels||[]).map(id=>pjLab(p,id)).filter(Boolean),ds=pjDueSt(t),ck=pjCk(t),nc=(t.comments||[]).filter(c=>!c.sys).length,na=(t.atts||[]).length,cv=t.cover;
  const as=t.assignee?flName(t.assignee):'';
  const bd=[
    t.due?`<span class="pj-du ${ds}" title="الاستحقاق"><i data-lucide="clock"></i> ${pjFD(t.due)}</span>`:'',
    pjHasDesc(t)?`<span title="فيها وصف/ملاحظات"><i data-lucide="align-right"></i></span>`:'',
    nc?`<span title="تعليقات"><i data-lucide="message-square"></i> ${nc}</span>`:'',
    na?`<span title="مرفقات"><i data-lucide="paperclip"></i> ${na}</span>`:'',
    ck.m?`<span class="pj-ck${ck.n===ck.m?' full':''}" title="قائمة التحقق"><i data-lucide="square-check"></i> ${ck.n}/${ck.m}</span>`:'',
    t.assignee?`<span class="pj-av" title="${esc(as)}">${esc(pjIni(as))}</span>`:''].join('');
  return `<div class="pj-card${PJX.kfv&&PJX.fc===t.id?' kf':''}${t.stageKey==='done'?' dn':''}" data-id="${t.id}" onpointerdown="pjDown(event,'card','${t.id}')" onclick="pjCardClick(event,'${t.id}')" onmouseenter="pjHov('${t.id}')">
    ${cv&&cv.u?`<div class="pj-cv img" style="background-image:url('${esc(cv.u)}')"></div>`:cv&&cv.c?`<div class="pj-cv" style="background:${esc(cv.c)}"></div>`:''}
    <div class="pj-cb">
      ${lb.length?`<div class="pj-lbs">${lb.map(l=>`<span class="pj-lb" style="background:${esc(l.color)}" title="${esc(l.name)}">${esc(l.name)}</span>`).join('')}</div>`:''}
      <div class="pj-ct">${esc(t.title)}</div>
      ${bd?`<div class="pj-bdg">${bd}</div>`:''}
    </div>
    <button class="pj-qeb" onclick="event.stopPropagation();pjQuick('${t.id}',this)" title="تعديل سريع (E)"><i data-lucide="pencil"></i></button>
  </div>`;
}
function pjCardClick(e,id){if(Date.now()-PJX.jd<350)return;openTask(id)}
function pjRenameBoard(v){const p=proj();v=(v||'').trim();if(!p||!v||v===p.title)return;p.title=v;pjSave();renderProjectDetail(p.id)}

/* ===== المنشئ السريع للبطاقة والقائمة ===== */
function pjComp(k){PJX.comp=k;renderProjectDetail(CUR_PROJ);if(k){const i=document.getElementById('pjCompIn');if(i){i.focus();const c=i.closest('.pj-list').querySelector('.pj-cards');if(c)c.scrollTop=c.scrollHeight;i.scrollIntoView({block:'nearest',inline:'nearest'})}}}
function pjCompKey(e,k){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();pjCompAdd(k)}else if(e.key==='Escape'){e.preventDefault();pjComp(null)}}
function pjCompAdd(k){const p=proj();const i=document.getElementById('pjCompIn');if(!p||!i)return;const v=i.value.replace(/\s+/g,' ').trim();if(!v){i.focus();return}
  p.tasks=p.tasks||[];p.tasks.push({id:uid(),title:v,stageKey:k,done:k==='done',assignee:'',blocks:[],order:pjNextO(p,k)});pjSave();pjComp(k)}
function quickAddTask(stageKey){pjComp(stageKey)}
function pjAddList(){const p=proj();const i=document.getElementById('pjAddL');if(!p||!i)return;const v=i.value.trim();if(!v){i.focus();return}
  p.taskStages.push({key:uid(),label:v});save();renderProjectDetail(p.id);const n=document.getElementById('pjAddL');if(n)n.focus();const l=document.getElementById('pjLists');if(l)l.scrollLeft=l.scrollWidth*(getComputedStyle(l).direction==='rtl'?-1:1)}
function pjListRename(e,k){if(Date.now()-PJX.jd<350)return;const p=proj();const st=p&&p.taskStages.find(s=>s.key===k);if(!st)return;const el=e.currentTarget;
  el.outerHTML=`<input class="pj-lti" id="pjLti" value="${esc(st.label)}" onkeydown="if(event.key==='Enter')this.blur();else if(event.key==='Escape'){this.value='';this.blur()}" onblur="pjListRenameSave('${k}',this.value)">`;
  const i=document.getElementById('pjLti');if(i){i.focus();i.select()}}
function pjListRenameSave(k,v){const p=proj();const st=p&&p.taskStages.find(s=>s.key===k);if(st&&v.trim()&&v.trim()!==st.label){st.label=v.trim();save()}if(p)renderProjectDetail(p.id)}
function pjCollapse(k){const p=proj();const st=p&&p.taskStages.find(s=>s.key===k);if(!st)return;if(st.collapsed)delete st.collapsed;else st.collapsed=true;pjPopClose();save();renderProjectDetail(p.id)}
function pjListMenu(btn,k){const p=proj();if(!p)return;
  pjPop(btn,()=>{const others=p.taskStages.filter(s=>!s.closed&&s.key!==k);return `<div class="pj-pt">إجراءات القائمة<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <button class="pj-mi" onclick="pjPopClose();pjComp('${k}')"><i data-lucide="plus"></i> أضف بطاقة</button>
    <button class="pj-mi" onclick="pjCollapse('${k}')"><i data-lucide="chevrons-right-left"></i> طيّ القائمة</button>
    <h5>ترتيب البطاقات حسب</h5>
    <button class="pj-mi" onclick="pjSortList('${k}','due')"><i data-lucide="calendar-clock"></i> تاريخ الاستحقاق</button>
    <button class="pj-mi" onclick="pjSortList('${k}','name')"><i data-lucide="arrow-up-down"></i> الاسم (أ ← ي)</button>
    <button class="pj-mi" onclick="pjSortList('${k}','new')"><i data-lucide="clock"></i> الأحدث أولاً</button>
    ${others.length?`<h5>نقل كل البطاقات إلى</h5>${others.map(s=>`<button class="pj-mi" onclick="pjMoveAll('${k}','${s.key}')"><i data-lucide="arrow-left-right"></i> ${esc(s.label)}</button>`).join('')}`:''}
    <h5>أرشفة</h5>
    <button class="pj-mi" onclick="pjArchAll('${k}')"><i data-lucide="archive"></i> أرشفة كل بطاقات القائمة</button>
    <button class="pj-mi" onclick="pjArchList('${k}')"><i data-lucide="archive"></i> أرشفة هذه القائمة</button>`})}
function pjSortList(k,by){const p=proj();if(!p)return;const c=pjCards(p,k);
  if(by==='due')c.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));else if(by==='name')c.sort((a,b)=>a.title.localeCompare(b.title,'ar'));else c.sort((a,b)=>b.id.localeCompare(a.id));
  c.forEach((t,i)=>t.order=i);pjPopClose();save();renderProjectDetail(p.id)}
function pjMoveAll(k,to){const p=proj();if(!p)return;let o=pjNextO(p,to);pjCards(p,k).forEach(t=>{t.stageKey=to;t.done=to==='done';t.order=o++;pjAct(t,`نُقلت إلى «${pjSL(p,to)}»`)});pjPopClose();pjSave();renderProjectDetail(p.id)}
function pjArchAll(k){const p=proj();if(!p)return;const c=pjCards(p,k);if(!c.length){pjPopClose();return}if(!confirm('أرشفة '+c.length+' بطاقة من هذه القائمة؟'))return;c.forEach(t=>{t.archived=true;pjAct(t,'أُرشفت البطاقة')});pjPopClose();pjSave();renderProjectDetail(p.id)}
function pjArchList(k){const p=proj();const st=p&&p.taskStages.find(s=>s.key===k);if(!st)return;if(p.taskStages.filter(s=>!s.closed).length<2){alert('لا بدّ من قائمة مفتوحة واحدة على الأقل');return}st.closed=true;if(PJX.comp===k)PJX.comp=null;pjPopClose();save();renderProjectDetail(p.id)}
function pjRestoreList(k){const p=proj();const st=p&&p.taskStages.find(s=>s.key===k);if(!st)return;delete st.closed;save();renderProjectDetail(p.id)}

/* ===== السحب والإفلات (مؤشّر موحّد: فأرة + لمس بضغطة مطوّلة) ===== */
function pjDown(e,kind,id){
  if(e.button)return;if(e.target.closest('button,input,textarea,select,a,[contenteditable]'))return;
  if(PJX.pd)pjEnd();
  const el=e.currentTarget.closest(kind==='card'?'.pj-card':'.pj-list');if(!el)return;
  PJX.pd={kind,id,el,x:e.clientX,y:e.clientY,cx:e.clientX,cy:e.clientY,touch:e.pointerType==='touch',on:false};
  if(PJX.pd.touch)PJX.pd.tm=setTimeout(()=>{if(PJX.pd&&!PJX.pd.on)pjDragStart()},300);
  window.addEventListener('pointermove',pjMove);window.addEventListener('pointerup',pjUp);window.addEventListener('pointercancel',pjUp);
  if(!PJX.tmv){PJX.tmv=true;document.addEventListener('touchmove',pjTM,{passive:false});document.addEventListener('contextmenu',ev=>{if(PJX.pd)ev.preventDefault()})}
}
function pjTM(e){if(PJX.pd&&PJX.pd.on)e.preventDefault()}
function pjEnd(){const d=PJX.pd;if(d){clearTimeout(d.tm);cancelAnimationFrame(d.raf)}window.removeEventListener('pointermove',pjMove);window.removeEventListener('pointerup',pjUp);window.removeEventListener('pointercancel',pjUp);PJX.pd=null}
function pjDragStart(){const d=PJX.pd;if(!d||!d.el.isConnected)return;d.on=true;pjPopClose();
  const r=d.el.getBoundingClientRect();d.ox=d.x-r.left;d.oy=d.y-r.top;
  const g=d.el.cloneNode(true);g.classList.add('pj-ghost');g.style.width=r.width+'px';g.style.height=Math.min(r.height,d.kind==='list'?440:r.height)+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';document.body.appendChild(g);d.g=g;
  const ph=document.createElement('div');ph.className=d.kind==='card'?'pj-ph':'pj-ph pj-lph';ph.style.height=r.height+'px';if(d.kind==='list')ph.style.width=r.width+'px';d.el.after(ph);d.ph=ph;d.el.style.display='none';
  document.body.classList.add('pj-dragging');if(d.touch&&navigator.vibrate)try{navigator.vibrate(12)}catch(_){}
  const loop=()=>{if(!PJX.pd||!PJX.pd.on)return;pjAuto();PJX.pd.raf=requestAnimationFrame(loop)};d.raf=requestAnimationFrame(loop);
}
function pjMove(e){const d=PJX.pd;if(!d)return;const dist=Math.hypot(e.clientX-d.x,e.clientY-d.y);
  if(!d.on){if(d.touch){if(dist>8)pjEnd();return}if(dist<5)return;pjDragStart();if(!d.on)return}
  e.preventDefault();d.cx=e.clientX;d.cy=e.clientY;d.g.style.left=(d.cx-d.ox)+'px';d.g.style.top=(d.cy-d.oy)+'px';pjPlace()}
// يحدّد موضع العنصر النائب تحت المؤشّر
function pjPlace(){const d=PJX.pd;if(!d||!d.on)return;const x=d.cx,y=d.cy;
  if(d.kind==='card'){
    const ls=[...document.querySelectorAll('#pjLists .pj-list:not(.col)')];if(!ls.length)return;
    let L=ls.find(l=>{const r=l.getBoundingClientRect();return x>=r.left&&x<=r.right});
    if(!L)L=ls.reduce((b,l)=>{const r=l.getBoundingClientRect(),dd=Math.min(Math.abs(x-r.left),Math.abs(x-r.right));return !b||dd<b.d?{l,d:dd}:b},null).l;
    const box=L.querySelector('.pj-cards');const cs=[...box.children].filter(c=>c.classList.contains('pj-card')&&c!==d.el);
    const nx=cs.find(c=>{const r=c.getBoundingClientRect();return y<r.top+r.height/2})||null;
    if(d.ph.parentNode!==box||d.ph.nextSibling!==nx)box.insertBefore(d.ph,nx);
  }else{
    const cont=document.getElementById('pjLists');if(!cont)return;const rtl=getComputedStyle(cont).direction==='rtl';
    const ls=[...cont.children].filter(c=>c.classList.contains('pj-list')&&c!==d.el);
    const nx=ls.find(l=>{const r=l.getBoundingClientRect(),m=r.left+r.width/2;return rtl?x>m:x<m})||cont.querySelector('.pj-addl');
    if(d.ph.nextSibling!==nx)cont.insertBefore(d.ph,nx);
  }}
// تمرير تلقائيّ قرب الحواف أثناء السحب
function pjAuto(){const d=PJX.pd;if(!d)return;const c=document.getElementById('pjLists');if(!c)return;const r=c.getBoundingClientRect(),E=70;let m=false;
  if(d.cx<r.left+E){c.scrollLeft-=Math.ceil((r.left+E-d.cx)/4);m=true}else if(d.cx>r.right-E){c.scrollLeft+=Math.ceil((d.cx-(r.right-E))/4);m=true}
  if(d.kind==='card'&&d.ph&&d.ph.parentNode){const b=d.ph.parentNode,br=b.getBoundingClientRect();if(d.cy<br.top+40){b.scrollTop-=8;m=true}else if(d.cy>br.bottom-40){b.scrollTop+=8;m=true}}
  if(m)pjPlace()}
function pjUp(){const d=PJX.pd;if(!d)return;pjEnd();if(!d.on)return;PJX.jd=Date.now();
  if(d.g)d.g.remove();document.body.classList.remove('pj-dragging');const p=proj();
  if(p&&d.ph&&d.ph.parentNode){
    if(d.kind==='card'){const box=d.ph.parentNode,k=box.dataset.k,t=pjT(d.id);
      if(t&&k){const sib=(el,dir)=>{let s=el[dir];while(s&&!(s.classList&&s.classList.contains('pj-card')&&s!==d.el))s=s[dir];return s&&s.dataset.id};
        const prev=sib(d.ph,'previousSibling'),next=sib(d.ph,'nextSibling');
        const full=pjCards(p,k).filter(x=>x.id!==t.id);let i=prev?full.findIndex(x=>x.id===prev)+1:next?full.findIndex(x=>x.id===next):full.length;if(i<0)i=full.length;
        full.splice(i,0,t);const from=t.stageKey;
        if(from!==k){t.stageKey=k;t.done=k==='done';pjAct(t,`نُقلت من «${pjSL(p,from)}» إلى «${pjSL(p,k)}»`)}
        full.forEach((x,j)=>x.order=j);pjSave()}
    }else{const seq=[...d.ph.parentNode.children].map(c=>c===d.ph?d.id:(c.classList.contains('pj-list')&&c!==d.el?c.dataset.k:null)).filter(Boolean);
      const q=seq.slice(),old=p.taskStages;p.taskStages=old.map(s=>{if(!seq.includes(s.key))return s;const k2=q.shift();return old.find(x=>x.key===k2)||s});save()}
  }
  if(d.ph)d.ph.remove();if(p)renderProjectDetail(p.id)}

/* ===== النافذة الصغيرة (popover) ===== */
function pjPop(anchor,fn,w){pjPopClose();const m=document.createElement('div');m.className='pj-pop';m.id='pjPop';m.dir='rtl';if(w)m.style.width=w+'px';
  m.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(m);PJX.popFn=fn;PJX.popR=anchor.getBoundingClientRect();pjPopRef();
  setTimeout(()=>document.addEventListener('pointerdown',pjPopOut),0)}
function pjPopRef(){const m=document.getElementById('pjPop');if(!m||!PJX.popFn)return;m.innerHTML=PJX.popFn();refreshIcons();pjPopPos()}
function pjPopPos(){const m=document.getElementById('pjPop'),r=PJX.popR;if(!m||!r)return;const W=innerWidth,H=innerHeight,mw=m.offsetWidth,mh=m.offsetHeight;
  let l=r.right-mw;l=Math.max(8,Math.min(l,W-mw-8));let t=r.bottom+6;if(t+mh>H-8)t=r.top-mh-6;if(t<8)t=Math.max(8,H-mh-8);m.style.left=l+'px';m.style.top=t+'px'}
function pjPopOut(e){if(!e.target.closest||!e.target.closest('#pjPop'))pjPopClose()}
function pjPopClose(){const m=document.getElementById('pjPop');if(m)m.remove();PJX.popFn=null;document.removeEventListener('pointerdown',pjPopOut)}
function pjAnchor(id,sel){const c=document.querySelector(`#pjLists .pj-card[data-id="${id}"]`);return document.querySelector(sel)||c||document.getElementById('pjLists')||document.body}

/* ===== التصفية ===== */
function pjFilterPop(btn){const p=proj();if(!p)return;
  pjPop(btn,()=>{const f=PJX.f,L=p.labels||[];const used=[...new Set((p.tasks||[]).map(t=>t.assignee).filter(Boolean))];const fl=(S.freelancers||[]).filter(x=>used.includes(x.id));
    const ck=(arr,v,lbl,sw)=>`<label class="pj-fck"><input type="checkbox" ${arr.includes(v)?'checked':''} onchange="pjFTog('${arr===f.lb?'lb':'mb'}','${v}')">${sw||''}<span>${lbl}</span></label>`;
    const dr=(v,l)=>`<button class="${f.due===v?'on':''}" onclick="PJX.f.due='${v}';pjFApply(1)">${l}</button>`;
    return `<div class="pj-pt">تصفية البطاقات<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>كلمة مفتاحية</h5><input id="pjFq" value="${esc(f.q)}" placeholder="ابحث في العناوين والملاحظات…" oninput="PJX.f.q=this.value;pjFApply()">
    <h5>المسؤول</h5>${ck(f.mb,'-','بلا مسؤول','<span class="pj-av sm">؟</span>')}${fl.map(x=>ck(f.mb,x.id,esc(x.name),`<span class="pj-av sm">${esc(pjIni(x.name))}</span>`)).join('')}
    <h5>الاستحقاق</h5><div class="pj-seg">${dr('','الكل')}${dr('late','متأخرة')}${dr('week','هذا الأسبوع')}${dr('none','بلا تاريخ')}${dr('done','منجزة')}</div>
    <h5>التسميات</h5>${ck(f.lb,'-','بلا تسميات')}${L.map(l=>ck(f.lb,l.id,esc(l.name||' '),`<span class="pj-lsq" style="background:${esc(l.color)}"></span>`)).join('')}
    ${pjFN()?`<button class="pj-mi del" style="margin-top:8px" onclick="pjFClear()"><i data-lucide="x"></i> مسح التصفية</button>`:''}`},300);
  setTimeout(()=>{const i=document.getElementById('pjFq');if(i)i.focus()},30)}
function pjFTog(k,v){const a=PJX.f[k],i=a.indexOf(v);if(i<0)a.push(v);else a.splice(i,1);pjFApply(1)}
function pjFApply(ref){renderProjectDetail(CUR_PROJ);if(ref)pjPopRef()}
function pjFClear(){PJX.f={q:'',lb:[],mb:[],due:''};pjPopClose();renderProjectDetail(CUR_PROJ)}

/* ===== خلفيّة اللوحة ===== */
function pjBgPop(btn){const p=proj();if(!p)return;
  pjPop(btn,()=>`<div class="pj-pt">خلفيّة اللوحة<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>ألوان وتدرّجات</h5><div class="pj-bgg">${Object.keys(PJ_BGS).map(k=>`<button class="${!p.bgImg&&p.bg===k?'on':''}" style="background:${PJ_BGS[k]}" onclick="pjSetBg('${k}')"></button>`).join('')}</div>
    <h5>صورة</h5><button class="pj-mi" onclick="pjBgUp()"><i data-lucide="image-up"></i> رفع صورة من جهازك</button>
    <div class="pj-row"><input id="pjBgU" placeholder="أو الصق رابط صورة https://…" value="${esc(p.bgImg||'')}"><button class="btn btn-gold btn-sm" onclick="pjSetBgImg(document.getElementById('pjBgU').value)">تطبيق</button></div>
    ${p.bgImg?`<button class="pj-mi del" onclick="pjSetBgImg('')"><i data-lucide="x"></i> إزالة الصورة</button>`:''}`,290)}
function pjSetBg(k){const p=proj();if(!p)return;p.bg=k;delete p.bgImg;save();pjSync()}
function pjSetBgImg(u){const p=proj();if(!p)return;u=(u||'').trim();if(u)p.bgImg=u;else delete p.bgImg;save();pjSync()}
function pjBgUp(){pjPickFile(async f=>{try{const u=await pjUpload(f);pjSetBgImg(u)}catch(err){pjUpErr(err)}})}

/* ===== الرفع (نفس مسار صور المهامّ: bucket task-images؛ ووضع التجربة يحفظ محلّيّاً) ===== */
function pjPickFile(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(f)cb(f)};i.click()}
async function pjUpload(f){
  if(!USER){if(typeof WS_DEMO!=='undefined'&&WS_DEMO){if(f.size>1.5e6)throw new Error('في وضع التجربة: الصورة أكبر من 1.5MB');return await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})}throw new Error('سجّل الدخول أولاً')}
  const ext=(f.name.split('.').pop()||'png').toLowerCase();const path=`${USER.id}/${uid()}.${ext}`;
  const {error}=await sb.storage.from('task-images').upload(path,f,{upsert:false,contentType:f.type||'image/png'});if(error)throw error;
  return sb.storage.from('task-images').getPublicUrl(path).data.publicUrl}
function pjUpErr(err){alert('تعذّر رفع الصورة: '+(err.message||err)+'\n\nتأكد من إنشاء bucket عام باسم «task-images» في Supabase → Storage.')}

/* ===== قائمة اللوحة الجانبيّة: عن اللوحة + غرفة العميل + الأرشيف + التسميات ===== */
function pjMenu(tab){if(tab===false){PJX.menu=false}else{PJX.menu=true;PJX.mtab=tab==='room'?'about':(tab||'about')}pjPopClose();renderProjectDetail(CUR_PROJ);
  if(tab==='room')setTimeout(()=>{const r=document.getElementById('roomPanel');if(r)r.scrollIntoView({block:'start'})},40)}
function pjRoomLoad(p){const el=document.getElementById('roomPanel');if(!el)return;
  Promise.resolve().then(()=>loadRoomPanel(p)).catch(err=>{const e2=document.getElementById('roomPanel');if(e2)e2.innerHTML=`<h3 style="margin-top:0"><i data-lucide="door-open"></i> غرفة المشروع</h3><p style="color:var(--muted);font-size:13px">تعذّر تحميل غرفة المشروع: ${esc(err.message||err)}</p>`;refreshIcons()})}
function pjMenuHTML(p){
  const tab=(k,l,ic)=>`<button class="pj-tab${PJX.mtab===k?' on':''}" onclick="pjMenu('${k}')"><i data-lucide="${ic}"></i> ${l}</button>`;
  let b='';
  if(PJX.mtab==='about'){const li=clientItems(p.contactId);
    b=`<div class="pj-dsec"><div class="pd-meta" style="margin:0 0 10px"><span><i class="inl" data-lucide="user"></i> العميل: <b>${esc(resolveClientName(p))}</b></span>${p.podcast?`<span><i class="inl" data-lucide="mic"></i> <b>${esc(p.podcast)}</b></span>`:''}</div>
      <div class="field" style="margin-bottom:10px"><label>مرحلة الإنتاج</label><select onchange="pjSetStage(this.value)">${(S.projectStages||[]).map(s=>`<option value="${s.key}" ${p.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('')}</select></div>
      <button class="pj-mi" onclick="projModal('${p.id}')"><i data-lucide="pencil"></i> تعديل المشروع</button>
      <button class="pj-mi" onclick="taskStageEditor('${p.id}')"><i data-lucide="settings"></i> مراحل المهام (القوائم)</button>
      <button class="pj-mi" onclick="addPodcastDeliverables('${p.id}')"><i data-lucide="mic"></i> أضف مخرجات حلقة بودكاست</button>
      <button class="pj-mi" onclick="pjBgPop(this)"><i data-lucide="palette"></i> تغيير الخلفيّة</button>
      ${p.closed?`<button class="pj-mi" onclick="pjReopen('${p.id}')"><i data-lucide="archive-restore"></i> إعادة فتح اللوحة</button>`:`<button class="pj-mi del" onclick="pjCloseBoard('${p.id}')"><i data-lucide="archive"></i> إغلاق اللوحة</button>`}</div>
    ${p.contactId?`<div class="pj-dsec"><h4><i data-lucide="link"></i> ملف العميل المرتبط</h4>
      <div class="pd-meta" style="margin-top:0"><span><i class="inl" data-lucide="calendar-days"></i> مواعيد: <b>${li.appts.length}</b></span><span><i class="inl" data-lucide="receipt-text"></i> فواتير: <b>${li.invoices.length}</b></span><span><i class="inl" data-lucide="clapperboard"></i> مشاريع: <b>${li.projects.length}</b></span></div>
      ${li.appts.length?`<div class="linkrow">${li.appts.slice(0,6).map(a=>`<button class="link-btn" onclick="go('appointments');setTimeout(()=>apptModal('${a.id}'),60)"><i class="inl" data-lucide="calendar-days"></i> ${esc(a.title)} · ${(a.datetime||'').replace('T',' ')}</button>`).join('')}</div>`:''}
      ${li.invoices.length?`<div class="linkrow">${li.invoices.slice(0,6).map(i=>`<button class="link-btn" onclick="go('invoicing');setTimeout(()=>docModal('invoice','${i.id}'),60)"><i class="inl" data-lucide="receipt-text"></i> #${i.number} · ${money(invTotal(i))}</button>`).join('')}</div>`:''}</div>`:''}
    <div id="roomPanel" class="card pj-room"><div style="color:var(--muted);font-size:13px">جارٍ تحميل غرفة المشروع…</div></div>`;
  }else if(PJX.mtab==='arch'){const ac=(p.tasks||[]).filter(t=>t.archived),al=p.taskStages.filter(s=>s.closed);
    b=`<div class="pj-dsec"><h4><i data-lucide="square-kanban"></i> بطاقات مؤرشفة (${ac.length})</h4>${ac.length?ac.map(t=>`<div class="pj-arow"><button class="pj-arl" onclick="openTask('${t.id}')">${esc(t.title)}<small>${esc(pjSL(p,t.stageKey))}</small></button><button class="link-btn" onclick="pjRestore('${t.id}')">استعادة</button><button class="link-btn del" onclick="pjDelCard('${t.id}')">حذف</button></div>`).join(''):'<p class="pj-mut">لا بطاقات مؤرشفة.</p>'}</div>
      <div class="pj-dsec"><h4><i data-lucide="list"></i> قوائم مؤرشفة (${al.length})</h4>${al.length?al.map(s=>`<div class="pj-arow"><span class="pj-arl">${esc(s.label)}<small>${pjCards(p,s.key).length} بطاقة</small></span><button class="link-btn" onclick="pjRestoreList('${s.key}')">استعادة</button></div>`).join(''):'<p class="pj-mut">لا قوائم مؤرشفة.</p>'}</div>`;
  }else{const L=pjLabels(p);
    b=`<div class="pj-dsec"><h4><i data-lucide="tag"></i> تسميات اللوحة</h4>${L.map(l=>`<div class="pj-lrow"><span class="pj-lsw" style="background:${esc(l.color)}">${esc(l.name)}</span><span class="pj-mut">${(p.tasks||[]).filter(t=>(t.labels||[]).includes(l.id)).length}</span><button class="pj-ib sm" onclick="PJX.lbEdit='${l.id}';pjLabelPop(this,null)"><i data-lucide="pencil"></i></button></div>`).join('')}
      <button class="pj-mi" onclick="PJX.lbEdit='new';pjLabelPop(this,null)"><i data-lucide="plus"></i> إنشاء تسمية جديدة</button></div>`;
  }
  return `<aside class="pj-dr"><div class="pj-drh"><b>القائمة</b><span class="pj-sp"></span><button class="pj-ib" onclick="pjMenu(false)"><i data-lucide="x"></i></button></div>
    <div class="pj-tabs">${tab('about','عن اللوحة','info')}${tab('arch','الأرشيف','archive')}${tab('labels','التسميات','tag')}</div>
    <div class="pj-drb">${b}</div></aside>`;
}
function pjSetStage(k){const p=proj();if(!p)return;p.stageKey=k;pjSave();renderProjectDetail(p.id)}

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
  p.tasks=p.tasks||[];const st=((p.taskStages||[]).find(s=>!s.closed)||{key:'todo'}).key;let o=pjNextO(p,st);
  PODCAST_DELIVERABLES.forEach(t=>p.tasks.push({id:uid(),title:t,stageKey:st,done:false,assignee:'',blocks:[],order:o++}));
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
function taskStageEditor(id){const p=S.projects.find(x=>x.id===id);if(!p)return;
  let stages=JSON.parse(JSON.stringify(p.taskStages||DEFAULT_TASK_STAGES));
  function body(){return `<p style="color:var(--muted);font-size:13px;margin-top:0">مراحل المهام (قوائم اللوحة) لهذا المشروع. المهام في مرحلة محذوفة تنتقل لأول مرحلة.</p>`+
    stages.map((s,i)=>`<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
      <input value="${esc(s.label)}" oninput="tsEdit(${i},this.value)" style="flex:1">${s.closed?'<span class="kbadge">مؤرشفة</span>':''}
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

/* ===== التعديل السريع (قلم البطاقة) ===== */
function pjQuick(id,btn){const t=pjT(id);if(!t)return;pjPopClose();pjQEClose();const card=btn.closest('.pj-card');if(!card)return;const r=card.getBoundingClientRect();
  const w=Math.max(r.width,230),W=innerWidth,aw=W<640?w:w+178;let right=Math.max(8,Math.min(W-r.right,W-8-aw));let top=Math.max(8,Math.min(r.top,innerHeight-360));
  const o=document.createElement('div');o.id='pjQE';o.className='pj-qe';o.dir='rtl';o.onclick=e=>{if(e.target===o)pjQEClose()};
  const a=(fn,ic,l,cls)=>`<button class="${cls||''}" onclick="${fn}"><i data-lucide="${ic}"></i> ${l}</button>`;
  o.innerHTML=`<div class="pj-qeb2" style="top:${top}px;right:${right}px;max-width:${aw}px">
    <div style="width:${w}px;max-width:100%"><textarea id="pjQEt" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();pjQESave('${id}')}else if(event.key==='Escape')pjQEClose()">${esc(t.title)}</textarea>
    <button class="btn btn-gold btn-sm" style="margin-top:6px" onclick="pjQESave('${id}')">حفظ</button></div>
    <div class="pj-qea">${a(`pjQEClose();openTask('${id}')`,'square-kanban','فتح البطاقة')}${a(`pjLabelPop(this,'${id}')`,'tag','التسميات')}${a(`pjMemberPop(this,'${id}')`,'user','المسؤول')}${a(`pjDatePop(this,'${id}')`,'clock','التواريخ')}${a(`pjCoverPop(this,'${id}')`,'panel-top','الغلاف')}${a(`pjMovePop(this,'${id}')`,'arrow-left-right','نقل')}${a(`pjCopyPop(this,'${id}')`,'copy','نسخ')}${a(`pjQEClose();pjArchive('${id}')`,'archive','أرشفة')}</div></div>`;
  document.body.appendChild(o);refreshIcons();const ta=document.getElementById('pjQEt');if(ta){ta.focus();ta.select()}}
function pjQESave(id){const t=pjT(id);const ta=document.getElementById('pjQEt');if(t&&ta&&ta.value.trim()){t.title=ta.value.replace(/\s+/g,' ').trim();pjSave()}pjQEClose();pjSync()}
function pjQEClose(){const o=document.getElementById('pjQE');if(o)o.remove();pjPopClose()}

/* ===== التسميات ===== */
function pjLabelPop(btn,tid){const p=proj();if(!p)return;pjLabels(p);if(PJX.lbEdit==null||tid)PJX.lbEdit=PJX.lbEdit&&!tid?PJX.lbEdit:null;
  if(PJX.lbEdit){const l=pjLab(p,PJX.lbEdit);PJX.lbC=l?l.color:PJ_LC[0];PJX.lbN=l?l.name:''}
  pjPop(btn,()=>pjLabelBody(tid),290)}
function pjLabelBody(tid){const p=proj();if(!p)return '';const t=tid?pjT(tid):null;
  if(PJX.lbEdit){const isNew=PJX.lbEdit==='new';
    return `<div class="pj-pt">${isNew?'إنشاء تسمية':'تعديل التسمية'}<button class="pj-px" onclick="PJX.lbEdit=null;pjPopRef()">‹</button></div>
      <div class="pj-lprev" style="background:${esc(PJX.lbC)}">${esc(PJX.lbN)}</div>
      <h5>الاسم</h5><input id="pjLbN" value="${esc(PJX.lbN)}" oninput="PJX.lbN=this.value;document.querySelector('.pj-lprev').textContent=this.value" onkeydown="if(event.key==='Enter')pjLbSave('${tid||''}')">
      <h5>اللون</h5><div class="pj-cg">${PJ_LC.map(c=>`<button class="${PJX.lbC===c?'on':''}" style="background:${c}" onclick="PJX.lbC='${c}';pjPopRef()"></button>`).join('')}</div>
      <div class="pj-row" style="margin-top:12px"><button class="btn btn-gold btn-sm" onclick="pjLbSave('${tid||''}')">${isNew?'إنشاء':'حفظ'}</button>${isNew?'':`<button class="btn btn-ghost btn-sm" style="color:var(--bad);margin-inline-start:auto" onclick="pjLbDel('${PJX.lbEdit}')">حذف</button>`}</div>`}
  return `<div class="pj-pt">التسميات<button class="pj-px" onclick="pjPopClose()">×</button></div>
    ${p.labels.map(l=>{const on=t&&(t.labels||[]).includes(l.id);return `<div class="pj-lrow">${t?`<input type="checkbox" ${on?'checked':''} onchange="pjLbTog('${tid}','${l.id}')">`:''}<button class="pj-lsw" style="background:${esc(l.color)}" onclick="${t?`pjLbTog('${tid}','${l.id}')`:`PJX.lbEdit='${l.id}';PJX.lbC='${l.color}';PJX.lbN=${esc(JSON.stringify(l.name))};pjPopRef()`}">${esc(l.name)}</button><button class="pj-ib sm" onclick="PJX.lbEdit='${l.id}';PJX.lbC='${l.color}';PJX.lbN=${esc(JSON.stringify(l.name))};pjPopRef()" title="تعديل"><i data-lucide="pencil"></i></button></div>`}).join('')}
    <button class="pj-mi" onclick="PJX.lbEdit='new';PJX.lbC='${PJ_LC[5]}';PJX.lbN='';pjPopRef();setTimeout(()=>{const i=document.getElementById('pjLbN');if(i)i.focus()},20)"><i data-lucide="plus"></i> إنشاء تسمية جديدة</button>`}
function pjLbTog(tid,lid){const t=pjT(tid);if(!t)return;t.labels=t.labels||[];const i=t.labels.indexOf(lid);if(i<0)t.labels.push(lid);else t.labels.splice(i,1);save();pjSync()}
function pjLbSave(tid){const p=proj();if(!p)return;const n=(document.getElementById('pjLbN')||{}).value;const name=(n!=null?n:PJX.lbN).trim();
  if(PJX.lbEdit==='new'){const l={id:uid(),name,color:PJX.lbC};p.labels.push(l);const t=tid?pjT(tid):null;if(t){t.labels=t.labels||[];t.labels.push(l.id)}}
  else{const l=pjLab(p,PJX.lbEdit);if(l){l.name=name;l.color=PJX.lbC}}
  PJX.lbEdit=null;save();pjSync()}
function pjLbDel(lid){const p=proj();if(!p||!confirm('حذف التسمية من اللوحة ومن كل البطاقات؟'))return;p.labels=p.labels.filter(l=>l.id!==lid);(p.tasks||[]).forEach(t=>{if(t.labels)t.labels=t.labels.filter(x=>x!==lid)});PJX.f.lb=PJX.f.lb.filter(x=>x!==lid);PJX.lbEdit=null;save();pjSync()}

/* ===== المسؤول (فريلانسر — نفس حقل assignee الذي يزامنه syncTasks) ===== */
function pjMemberPop(btn,tid){pjPop(btn,()=>{const t=pjT(tid);if(!t)return '';const fl=S.freelancers||[];
  return `<div class="pj-pt">المسؤول<button class="pj-px" onclick="pjPopClose()">×</button></div>
    ${fl.length?fl.map(f=>`<button class="pj-mi${t.assignee===f.id?' on':''}" onclick="pjSetAs('${tid}','${f.id}')"><span class="pj-av sm">${esc(pjIni(f.name))}</span> ${esc(f.name)}${t.assignee===f.id?' <i data-lucide="check" style="margin-inline-start:auto"></i>':''}</button>`).join('')
      :`<p class="pj-mut">لا فريلانسرز بعد. أضفهم من «الفريق» ثم أسند لهم البطاقات.</p><button class="pj-mi" onclick="pjPopClose();closeTask();go('team')"><i data-lucide="users"></i> فتح الفريق</button>`}
    ${t.assignee?`<button class="pj-mi del" onclick="pjSetAs('${tid}','')"><i data-lucide="x"></i> إزالة المسؤول</button>`:''}`},260)}
function pjSetAs(tid,fid){const t=pjT(tid);if(!t)return;if(t.assignee===fid&&fid)fid='';t.assignee=fid;pjAct(t,fid?'أُسندت إلى '+flName(fid):'أُزيل المسؤول');pjSave();pjSync()}

/* ===== التواريخ ===== */
function pjDatePop(btn,tid){pjPop(btn,()=>{const t=pjT(tid);if(!t)return '';
  return `<div class="pj-pt">التواريخ<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>تاريخ البدء</h5><input type="date" id="pjDs" value="${esc(t.start||'')}">
    <h5>تاريخ الاستحقاق</h5><input type="date" id="pjDd" value="${esc(t.due||'')}">
    <div class="pj-seg" style="margin-top:8px"><button onclick="document.getElementById('pjDd').value=today()">اليوم</button><button onclick="document.getElementById('pjDd').value=pjAdd(today(),1)">غداً</button><button onclick="document.getElementById('pjDd').value=pjAdd(today(),7)">بعد أسبوع</button></div>
    <div class="pj-row" style="margin-top:12px"><button class="btn btn-gold btn-sm" onclick="pjDateSave('${tid}')">حفظ</button><button class="btn btn-ghost btn-sm" onclick="pjDateSave('${tid}',1)">إزالة</button></div>`},270)}
function pjDateSave(tid,clear){const t=pjT(tid);if(!t)return;const s=clear?'':document.getElementById('pjDs').value,d=clear?'':document.getElementById('pjDd').value;
  if(s)t.start=s;else delete t.start;if(d){if(d!==t.due)pjAct(t,'الاستحقاق: '+pjFD(d));t.due=d}else{if(t.due)pjAct(t,'أُزيل تاريخ الاستحقاق');delete t.due;delete t.dueDone}
  pjPopClose();pjSave();pjSync()}
function pjDueDone(tid,v){const t=pjT(tid);if(!t)return;if(v)t.dueDone=true;else delete t.dueDone;pjAct(t,v?'عُلّم الاستحقاق منجزاً':'أُلغي إنجاز الاستحقاق');pjSave();pjSync()}

/* ===== نقل / نسخ / أرشفة / حذف ===== */
function pjMovePop(btn,tid){const p=proj();const t=pjT(tid);if(!p||!t)return;const cs=pjCards(p,t.stageKey);PJX.mv={pid:p.id,k:t.stageKey,pos:Math.max(0,cs.findIndex(x=>x.id===tid))};
  pjPop(btn,()=>{const mv=PJX.mv,tp=S.projects.find(x=>x.id===mv.pid)||p,ls=(tp.taskStages||[]).filter(s=>!s.closed);if(!ls.some(s=>s.key===mv.k))mv.k=(ls[0]||{}).key;
    const n=pjCards(tp,mv.k).filter(x=>x.id!==tid).length;
    return `<div class="pj-pt">نقل البطاقة<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>اللوحة</h5><select onchange="PJX.mv.pid=this.value;pjPopRef()">${S.projects.filter(x=>!x.closed||x.id===p.id).map(x=>`<option value="${x.id}" ${x.id===mv.pid?'selected':''}>${esc(x.title)}</option>`).join('')}</select>
    <div class="row2" style="gap:8px"><div><h5>القائمة</h5><select onchange="PJX.mv.k=this.value;PJX.mv.pos=0;pjPopRef()">${ls.map(s=>`<option value="${s.key}" ${s.key===mv.k?'selected':''}>${esc(s.label)}</option>`).join('')}</select></div>
    <div><h5>الموضع</h5><select onchange="PJX.mv.pos=+this.value">${Array.from({length:n+1},(_,i)=>`<option value="${i}" ${i===Math.min(mv.pos,n)?'selected':''}>${i+1}</option>`).join('')}</select></div></div>
    <button class="btn btn-gold btn-sm" style="margin-top:12px" onclick="pjMoveDo('${tid}')">نقل</button>`},290)}
function pjMoveDo(tid){const p=proj(),t=pjT(tid),mv=PJX.mv;if(!p||!t||!mv)return;const tp=S.projects.find(x=>x.id===mv.pid)||p;
  if(tp!==p){p.tasks=p.tasks.filter(x=>x.id!==tid);tp.tasks=tp.tasks||[];tp.tasks.push(t);if(t.labels){const nl=[];t.labels.forEach(id=>{const l=pjLab(p,id);if(!l)return;pjLabels(tp);let m=tp.labels.find(x=>x.color===l.color&&x.name===l.name);if(!m){m={id:uid(),name:l.name,color:l.color};tp.labels.push(m)}nl.push(m.id)});t.labels=nl}}
  const from=t.stageKey;t.stageKey=mv.k;t.done=mv.k==='done';const full=pjCards(tp,mv.k).filter(x=>x.id!==tid);full.splice(Math.min(mv.pos,full.length),0,t);full.forEach((x,j)=>x.order=j);
  pjAct(t,tp!==p?`نُقلت إلى لوحة «${tp.title}»`:(from!==mv.k?`نُقلت إلى «${pjSL(tp,mv.k)}»`:'تغيّر موضعها'));pjPopClose();pjQEClose();pjSave();
  if(tp!==p&&PJX.open===tid){document.getElementById('modalRoot').innerHTML='';CUR_TASK=null;PJX.open=null}pjSync()}
function pjCopyPop(btn,tid){const p=proj(),t=pjT(tid);if(!p||!t)return;
  pjPop(btn,()=>`<div class="pj-pt">نسخ البطاقة<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>العنوان</h5><textarea id="pjCpT" rows="2">${esc(t.title)}</textarea>
    <h5>الاحتفاظ بـ</h5><label class="pj-fck"><input type="checkbox" id="pjCpC" checked><span>قوائم التحقق (${(t.checklists||[]).length})</span></label><label class="pj-fck"><input type="checkbox" id="pjCpL" checked><span>التسميات والتواريخ والمسؤول</span></label>
    <h5>إلى القائمة</h5><select id="pjCpK">${p.taskStages.filter(s=>!s.closed).map(s=>`<option value="${s.key}" ${s.key===t.stageKey?'selected':''}>${esc(s.label)}</option>`).join('')}</select>
    <button class="btn btn-gold btn-sm" style="margin-top:12px" onclick="pjCopyDo('${tid}')">إنشاء بطاقة</button>`,290)}
function pjCopyDo(tid){const p=proj(),t=pjT(tid);if(!p||!t)return;const g=i=>document.getElementById(i);const k=g('pjCpK').value;
  const c=JSON.parse(JSON.stringify(t));c.id=uid();c.title=(g('pjCpT').value||t.title).trim();c.stageKey=k;c.done=k==='done';delete c.archived;c.comments=[];pjAct(c,'نُسخت من «'+t.title+'»');
  (c.blocks||[]).forEach(b=>b.id=uid());
  if(!g('pjCpC').checked)delete c.checklists;else (c.checklists||[]).forEach(cl=>{cl.id=uid();(cl.items||[]).forEach(i=>i.id=uid())});
  if(!g('pjCpL').checked){delete c.labels;delete c.due;delete c.start;delete c.dueDone;c.assignee=''}
  c.order=pjNextO(p,k);p.tasks.push(c);pjPopClose();pjQEClose();pjSave();pjSync()}
function pjArchive(tid){const t=pjT(tid);if(!t)return;t.archived=true;pjAct(t,'أُرشفت البطاقة');if(PJX.fc===tid)PJX.fc=null;pjSave();pjSync()}
function pjRestore(tid){const p=proj(),t=pjT(tid);if(!p||!t)return;delete t.archived;const st=p.taskStages.find(s=>s.key===t.stageKey);if(!st||st.closed){const o=p.taskStages.find(s=>!s.closed);if(o){t.stageKey=o.key;t.done=o.key==='done'}}t.order=pjNextO(p,t.stageKey);pjAct(t,'استُعيدت البطاقة');pjSave();pjSync()}
function pjDelCard(tid){const p=proj();if(!p||!confirm('حذف هذه البطاقة نهائياً؟'))return;p.tasks=p.tasks.filter(x=>x.id!==tid);if(PJX.open===tid){document.getElementById('modalRoot').innerHTML='';CUR_TASK=null;PJX.open=null}pjSave();pjSync()}
function deleteTask(){const t=curTask();if(t)pjDelCard(t.id)}

/* ===== الغلاف والمرفقات ===== */
function pjCoverPop(btn,tid){pjPop(btn,()=>{const t=pjT(tid);if(!t)return '';const imgs=(t.atts||[]).filter(a=>a.k==='img');
  return `<div class="pj-pt">الغلاف<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>الألوان</h5><div class="pj-cg">${PJ_LC.map(c=>`<button class="${t.cover&&t.cover.c===c?'on':''}" style="background:${c}" onclick="pjSetCover('${tid}',{c:'${c}'})"></button>`).join('')}</div>
    ${imgs.length?`<h5>من المرفقات</h5><div class="pj-bgg">${imgs.map(a=>`<button class="${t.cover&&t.cover.u===a.url?'on':''}" style="background:#111 url('${esc(a.url)}') center/cover" onclick="pjSetCover('${tid}',{u:PJX.cvU['${a.id}']})"></button>`).join('')}</div>`:''}
    <button class="pj-mi" onclick="pjAttFile('${tid}',1)"><i data-lucide="image-up"></i> رفع صورة غلاف</button>
    ${t.cover?`<button class="pj-mi del" onclick="pjSetCover('${tid}',null)"><i data-lucide="x"></i> إزالة الغلاف</button>`:''}`},280);
  const t=pjT(tid);PJX.cvU={};(t&&t.atts||[]).forEach(a=>PJX.cvU[a.id]=a.url)}
function pjSetCover(tid,cv){const t=pjT(tid);if(!t)return;if(cv&&(cv.c||cv.u))t.cover=cv;else delete t.cover;save();pjSync()}
function pjAttPop(btn,tid){pjPop(btn,()=>`<div class="pj-pt">إرفاق<button class="pj-px" onclick="pjPopClose()">×</button></div>
    <h5>من جهازك</h5><button class="pj-mi" onclick="pjAttFile('${tid}')"><i data-lucide="image-up"></i> رفع صورة</button>
    <h5>رابط (Drive / يوتيوب / أي ملف)</h5><input id="pjAtU" placeholder="https://…" dir="ltr"><input id="pjAtN" placeholder="اسم العرض (اختياري)" style="margin-top:6px">
    <button class="btn btn-gold btn-sm" style="margin-top:10px" onclick="pjAttLink('${tid}')">إدراج</button>`,290);setTimeout(()=>{const i=document.getElementById('pjAtU');if(i)i.focus()},30)}
function pjAttLink(tid){const t=pjT(tid);if(!t)return;let u=(document.getElementById('pjAtU').value||'').trim();const n=(document.getElementById('pjAtN').value||'').trim();if(!u){alert('أدخل الرابط');return}if(!/^https?:\/\//i.test(u))u='https://'+u;
  t.atts=t.atts||[];t.atts.push({id:uid(),k:'link',url:u,name:n||u.replace(/^https?:\/\//,'').slice(0,60),at:Date.now()});pjAct(t,'أُرفق رابط: '+(n||u));pjPopClose();pjSave();pjSync()}
function pjAttFile(tid,asCover){pjPickFile(async f=>{const t=pjT(tid);if(!t)return;const st=document.getElementById('upStatus');if(st)st.textContent='جارٍ رفع الصورة…';
  try{const url=await pjUpload(f);t.atts=t.atts||[];t.atts.push({id:uid(),k:'img',url,name:f.name,at:Date.now()});if(asCover||!t.cover)t.cover={u:url};pjAct(t,'أُرفقت صورة: '+f.name);if(st)st.textContent='';pjPopClose();pjSave();pjSync()}
  catch(err){if(st)st.textContent='';pjUpErr(err)}})}
function pjAttDel(tid,aid){const t=pjT(tid);if(!t||!confirm('حذف المرفق؟'))return;const a=(t.atts||[]).find(x=>x.id===aid);t.atts=t.atts.filter(x=>x.id!==aid);if(a&&t.cover&&t.cover.u===a.url)delete t.cover;save();pjSync()}
function pjAttCover(tid,aid){const t=pjT(tid);const a=t&&(t.atts||[]).find(x=>x.id===aid);if(!a)return;if(t.cover&&t.cover.u===a.url)delete t.cover;else t.cover={u:a.url};save();pjSync()}

/* ===== قوائم التحقق ===== */
function pjClAddPop(btn,tid){pjPop(btn,()=>`<div class="pj-pt">إضافة قائمة تحقق<button class="pj-px" onclick="pjPopClose()">×</button></div>
  <h5>العنوان</h5><input id="pjClT" value="قائمة تحقق" onkeydown="if(event.key==='Enter')pjClAdd('${tid}')"><button class="btn btn-gold btn-sm" style="margin-top:10px" onclick="pjClAdd('${tid}')">إضافة</button>`,260);
  setTimeout(()=>{const i=document.getElementById('pjClT');if(i){i.focus();i.select()}},30)}
function pjClAdd(tid){const t=pjT(tid);if(!t)return;const v=(document.getElementById('pjClT').value||'').trim()||'قائمة تحقق';t.checklists=t.checklists||[];const c={id:uid(),title:v,items:[]};t.checklists.push(c);PJX.cla=c.id;pjAct(t,'أُضيفت قائمة تحقق «'+v+'»');pjPopClose();pjSave();pjSync();pjCliFocus()}
function pjCl(tid,cid){const t=pjT(tid);return t&&(t.checklists||[]).find(c=>c.id===cid)}
function pjClTitle(tid,cid,v){const c=pjCl(tid,cid);if(c&&v.trim()){c.title=v.trim();save();pjSync()}}
function pjClDel(tid,cid){const t=pjT(tid);if(!t||!confirm('حذف قائمة التحقق؟'))return;t.checklists=t.checklists.filter(c=>c.id!==cid);if(!t.checklists.length)delete t.checklists;pjSave();pjSync()}
function pjClHide(tid,cid){const c=pjCl(tid,cid);if(!c)return;c.hide=!c.hide;save();pjSync()}
function pjCliTog(tid,cid,iid,v){const c=pjCl(tid,cid);const it=c&&c.items.find(i=>i.id===iid);if(!it)return;it.done=v;if(v&&c.items.every(i=>i.done))pjAct(pjT(tid),'اكتملت «'+c.title+'»');pjSave();pjSync()}
function pjCliEdit(tid,cid,iid,v){const c=pjCl(tid,cid);const it=c&&c.items.find(i=>i.id===iid);if(!it)return;v=v.trim();if(!v){c.items=c.items.filter(i=>i.id!==iid)}else it.text=v;pjSave();pjSync()}
function pjCliDel(tid,cid,iid){const c=pjCl(tid,cid);if(!c)return;c.items=c.items.filter(i=>i.id!==iid);pjPopClose();pjSave();pjSync()}
function pjCliKey(e,tid,cid){if(e.key==='Enter'){e.preventDefault();const v=e.target.value.trim();if(!v)return;e.target.value='';const c=pjCl(tid,cid);if(!c)return;c.items.push({id:uid(),text:v,done:false});PJX.cla=cid;pjSave();pjSync();pjCliFocus()}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();PJX.cla=null;pjcRefresh()}}
function pjCliFocus(){setTimeout(()=>{const i=document.getElementById('pjCliIn');if(i)i.focus()},20)}
function pjCliMenu(btn,tid,cid,iid){pjPop(btn,()=>`<div class="pj-pt">عنصر القائمة<button class="pj-px" onclick="pjPopClose()">×</button></div>
  <button class="pj-mi" onclick="pjCliToCard('${tid}','${cid}','${iid}')"><i data-lucide="square-kanban"></i> تحويل إلى بطاقة</button>
  <button class="pj-mi del" onclick="pjCliDel('${tid}','${cid}','${iid}')"><i data-lucide="trash-2"></i> حذف</button>`,230)}
function pjCliToCard(tid,cid,iid){const p=proj(),t=pjT(tid),c=pjCl(tid,cid);const it=c&&c.items.find(i=>i.id===iid);if(!p||!it)return;
  c.items=c.items.filter(i=>i.id!==iid);const n={id:uid(),title:it.text,stageKey:t.stageKey,done:t.stageKey==='done',assignee:'',blocks:[],order:pjNextO(p,t.stageKey)};pjAct(n,'حُوّلت من قائمة تحقق في «'+t.title+'»');p.tasks.push(n);pjPopClose();pjSave();pjSync()}

/* ===== التعليقات والنشاط ===== */
function pjComment(tid){const t=pjT(tid);const i=document.getElementById('pjCmt');if(!t||!i)return;const v=i.value.trim();if(!v)return;t.comments=t.comments||[];t.comments.push({id:uid(),at:Date.now(),text:v});i.value='';pjSave();pjSync()}
function pjCmtDel(tid,cid){const t=pjT(tid);if(!t||!confirm('حذف التعليق؟'))return;t.comments=t.comments.filter(c=>c.id!==cid);save();pjSync()}

/* ===== ظهر البطاقة (نافذة التفاصيل) — يضمّ محرّر الملاحظات (blocks) كما هو ===== */
let CUR_TASK=null;
function curTask(){const p=proj();return p?(p.tasks||[]).find(x=>x.id===CUR_TASK):null}
function findBlock(id){const t=curTask();return t?(t.blocks||[]).find(b=>b.id===id):null}
function openTask(taskId){const p=proj();if(!p)return;const t=(p.tasks||[]).find(x=>x.id===taskId);if(!t)return;CUR_TASK=taskId;PJX.open=taskId;PJX.cla=null;pjCSS();pjKB();pjQEClose();if(!Array.isArray(t.blocks))t.blocks=[];
  const stOpts=p.taskStages.filter(s=>!s.closed||s.key===t.stageKey).map(s=>`<option value="${s.key}" ${t.stageKey===s.key?'selected':''}>${esc(s.label)}</option>`).join('');
  document.getElementById('modalRoot').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeTask()"><div class="modal task-modal pj-cm" id="pjCM">
    <div id="pjcCover">${pjcCoverHTML(t)}</div>
    <div class="modal-head pj-cmh"><i data-lucide="square-kanban" class="pj-cmi"></i>
      <div style="flex:1;min-width:0"><textarea id="t_title" rows="1" class="pj-cmt" oninput="taskTitle(this.value);pjGrow(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}" onblur="pjSync(1)">${esc(t.title)}</textarea>
      <div class="pj-cml">في القائمة <select id="t_stage" onchange="pjCardList(this.value)">${stOpts}</select> · ${esc(p.title)}</div></div>
      <button class="x" onclick="closeTask()">×</button></div>
    <div id="pjcArch">${pjcArchHTML(t)}</div>
    <div class="modal-body pj-cmb">
      <div class="pj-cmm">
        <div id="pjcMeta">${pjcMetaHTML(p,t)}</div>
        <section class="pj-sec"><h4><i data-lucide="align-right"></i> الوصف والملاحظات</h4>
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
        </section>
        <div id="pjcAtt">${pjcAttHTML(t)}</div>
        <div id="pjcChk">${pjcChkHTML(t)}</div>
        <div id="pjcLog">${pjcLogHTML(t)}</div>
      </div>
      <aside class="pj-cms" id="pjcSide">${pjcSideHTML(t)}</aside>
    </div></div></div>`;
  refreshIcons();pjGrow(document.getElementById('t_title'));
}
function pjGrow(el){if(!el)return;el.style.height='auto';el.style.height=el.scrollHeight+'px'}
function pjcCoverHTML(t){const cv=t.cover;if(!cv)return '';return `<div class="pj-mcv${cv.u?' img':''}" style="${cv.u?`background-image:url('${esc(cv.u)}')`:`background:${esc(cv.c)}`}"><button class="pj-btn" onclick="pjCoverPop(this,'${t.id}')"><i data-lucide="panel-top"></i> الغلاف</button></div>`}
function pjcArchHTML(t){return t.archived?`<div class="pj-archb"><i data-lucide="archive"></i> هذه البطاقة مؤرشفة. <button class="pj-btn" onclick="pjRestore('${t.id}')">استعادة</button><button class="pj-btn del" onclick="pjDelCard('${t.id}')">حذف</button></div>`:''}
function pjcMetaHTML(p,t){const lb=(t.labels||[]).map(id=>pjLab(p,id)).filter(Boolean),ds=pjDueSt(t),as=t.assignee?flName(t.assignee):'';
  return `<div class="pj-meta">
    <div><h5>المسؤول</h5><div class="pj-mrow">${t.assignee?`<button class="pj-mav" onclick="pjMemberPop(this,'${t.id}')" title="${esc(as)}"><span class="pj-av">${esc(pjIni(as))}</span> ${esc(as)}</button>`:''}<button class="pj-addc" onclick="pjMemberPop(this,'${t.id}')" title="المسؤول"><i data-lucide="${t.assignee?'pencil':'user-plus'}"></i></button></div></div>
    <div><h5>التسميات</h5><div class="pj-mrow">${lb.map(l=>`<button class="pj-mlb" style="background:${esc(l.color)}" onclick="pjLabelPop(this,'${t.id}')">${esc(l.name)}</button>`).join('')}<button class="pj-addc" onclick="pjLabelPop(this,'${t.id}')" title="التسميات"><i data-lucide="plus"></i></button></div></div>
    ${t.start||t.due?`<div><h5>${t.due?'الاستحقاق':'البدء'}</h5><div class="pj-due">${t.due?`<input type="checkbox" ${t.dueDone?'checked':''} onchange="pjDueDone('${t.id}',this.checked)" title="منجز">`:''}<button class="pj-dbtn" onclick="pjDatePop(this,'${t.id}')">${t.start?pjFD(t.start)+(t.due?' – ':''):''}${t.due?pjFD(t.due):''}${ds?` <span class="pj-du ${ds}">${pjDueLbl(ds)}</span>`:''} <i data-lucide="chevron-down"></i></button></div></div>`:''}
  </div>`}
function pjcAttHTML(t){const a=t.atts||[];if(!a.length)return '';
  return `<section class="pj-sec"><h4><i data-lucide="paperclip"></i> المرفقات <button class="pj-btn2 pj-r" onclick="pjAttPop(this,'${t.id}')">أضف</button></h4>
    ${a.map(x=>`<div class="pj-att">${x.k==='img'?`<a class="pj-ath" href="${esc(x.url)}" target="_blank" style="background-image:url('${esc(x.url)}')"></a>`:`<a class="pj-ath" href="${esc(x.url)}" target="_blank"><i data-lucide="link"></i></a>`}
      <div class="pj-ati"><b><a href="${esc(x.url)}" target="_blank">${esc(x.name||x.url)}</a></b><span>${pjAgo(x.at||Date.now())}</span>
      <div>${x.k==='img'?`<button class="link-btn" onclick="pjAttCover('${t.id}','${x.id}')">${t.cover&&t.cover.u===x.url?'إزالة الغلاف':'اجعلها غلافاً'}</button>`:''}<button class="link-btn del" onclick="pjAttDel('${t.id}','${x.id}')">حذف</button></div></div></div>`).join('')}</section>`}
function pjcChkHTML(t){return (t.checklists||[]).map(c=>{const n=c.items.filter(i=>i.done).length,m=c.items.length,pc=m?Math.round(n/m*100):0;const its=c.hide?c.items.filter(i=>!i.done):c.items;
  return `<section class="pj-sec"><h4><i data-lucide="square-check"></i><input class="pj-clt" value="${esc(c.title)}" onchange="pjClTitle('${t.id}','${c.id}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">
    ${n?`<button class="pj-btn2" onclick="pjClHide('${t.id}','${c.id}')">${c.hide?'إظهار المنجز ('+n+')':'إخفاء المنجز'}</button>`:''}<button class="pj-btn2" onclick="pjClDel('${t.id}','${c.id}')">حذف</button></h4>
    <div class="pj-prog"><span>${pc}%</span><div class="pj-bar2${pc===100?' full':''}"><i style="width:${pc}%"></i></div></div>
    ${its.map(i=>`<div class="pj-cli${i.done?' dn':''}"><input type="checkbox" ${i.done?'checked':''} onchange="pjCliTog('${t.id}','${c.id}','${i.id}',this.checked)"><input class="pj-clx" value="${esc(i.text)}" onchange="pjCliEdit('${t.id}','${c.id}','${i.id}',this.value)" onkeydown="if(event.key==='Enter')this.blur()"><button class="pj-ib sm" onclick="pjCliMenu(this,'${t.id}','${c.id}','${i.id}')"><i data-lucide="ellipsis"></i></button></div>`).join('')}
    ${PJX.cla===c.id?`<div class="pj-comp" style="padding:4px 0 0 0"><input id="pjCliIn" placeholder="أضف عنصراً… (Enter)" onkeydown="pjCliKey(event,'${t.id}','${c.id}')"><div class="pj-row"><button class="btn btn-gold btn-sm" onclick="pjCliKey({key:'Enter',preventDefault(){},target:document.getElementById('pjCliIn')},'${t.id}','${c.id}')">أضف</button><button class="pj-ib" onclick="PJX.cla=null;pjcRefresh()"><i data-lucide="x"></i></button></div></div>`
      :`<button class="pj-btn2" style="margin-top:6px" onclick="PJX.cla='${c.id}';pjcRefresh();pjCliFocus()">أضف عنصراً</button>`}
  </section>`}).join('')}
function pjcLogHTML(t){const L=(t.comments||[]).filter(c=>PJX.act||!c.sys).slice().sort((a,b)=>b.at-a.at);
  return `<section class="pj-sec"><h4><i data-lucide="activity"></i> التعليقات والنشاط <button class="pj-btn2 pj-r" onclick="PJX.act=!PJX.act;pjcRefresh()">${PJX.act?'إخفاء التفاصيل':'إظهار التفاصيل'}</button></h4>
    <div class="pj-ent"><span class="pj-av">أنا</span><div style="flex:1"><textarea id="pjCmt" rows="2" placeholder="اكتب تعليقاً… (⌘/Ctrl+Enter للحفظ)" onkeydown="if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();pjComment('${t.id}')}"></textarea><button class="btn btn-gold btn-sm" style="margin-top:6px" onclick="pjComment('${t.id}')">حفظ</button></div></div>
    ${L.map(c=>c.sys?`<div class="pj-ent pj-sys"><span class="pj-dot"></span><div>${esc(c.text)} <span class="when">${pjAgo(c.at)}</span></div></div>`
      :`<div class="pj-ent"><span class="pj-av">أنا</span><div style="flex:1;min-width:0"><div class="who">أنت <span class="when">${pjAgo(c.at)}</span></div><div class="pj-bub">${esc(c.text)}</div><button class="link-btn del" style="font-size:12px" onclick="pjCmtDel('${t.id}','${c.id}')">حذف</button></div></div>`).join('')}
  </section>`}
function pjcSideHTML(t){const b=(a,fn,ic,l,cls)=>`<button class="pj-sb ${cls||''}" data-a="${a}" onclick="${fn}"><i data-lucide="${ic}"></i> ${l}</button>`;
  return `<h5>أضف إلى البطاقة</h5>${b('mem',`pjMemberPop(this,'${t.id}')`,'user','المسؤول')}${b('lab',`pjLabelPop(this,'${t.id}')`,'tag','التسميات')}${b('chk',`pjClAddPop(this,'${t.id}')`,'square-check','قائمة تحقق')}${b('date',`pjDatePop(this,'${t.id}')`,'clock','التواريخ')}${b('att',`pjAttPop(this,'${t.id}')`,'paperclip','مرفق')}${b('cov',`pjCoverPop(this,'${t.id}')`,'panel-top','الغلاف')}
    <h5>إجراءات</h5>${b('mv',`pjMovePop(this,'${t.id}')`,'arrow-left-right','نقل')}${b('cp',`pjCopyPop(this,'${t.id}')`,'copy','نسخ')}
    ${t.archived?b('rs',`pjRestore('${t.id}')`,'archive-restore','استعادة')+b('del',`pjDelCard('${t.id}')`,'trash-2','حذف','del'):b('ar',`pjArchive('${t.id}')`,'archive','أرشفة')+b('del',`pjDelCard('${t.id}')`,'trash-2','حذف','del')}`}
// يعيد رسم أقسام البطاقة المفتوحة دون لمس محرّر الملاحظات (حتى لا يضيع المؤشّر)
function pjcRefresh(){if(!PJX.open||!document.getElementById('pjCM'))return;const p=proj(),t=pjT(PJX.open);if(!p||!t)return;
  const cm=document.getElementById('pjCmt'),cv=cm?cm.value:'',cf=document.activeElement===cm,ci=document.getElementById('pjCliIn'),civ=ci?ci.value:'',cif=document.activeElement===ci;
  const set=(id,h)=>{const e=document.getElementById(id);if(e)e.innerHTML=h};
  set('pjcCover',pjcCoverHTML(t));set('pjcArch',pjcArchHTML(t));set('pjcMeta',pjcMetaHTML(p,t));set('pjcAtt',pjcAttHTML(t));set('pjcChk',pjcChkHTML(t));set('pjcLog',pjcLogHTML(t));set('pjcSide',pjcSideHTML(t));
  const s=document.getElementById('t_stage');if(s&&s.value!==t.stageKey)s.value=t.stageKey;const tt=document.getElementById('t_title');if(tt&&document.activeElement!==tt&&tt.value!==t.title){tt.value=t.title;pjGrow(tt)}
  const cm2=document.getElementById('pjCmt');if(cm2){cm2.value=cv;if(cf)cm2.focus()}const ci2=document.getElementById('pjCliIn');if(ci2&&civ)ci2.value=civ;if(ci2&&cif)ci2.focus();
  refreshIcons()}
function pjCardList(k){const p=proj(),t=curTask();if(!p||!t||t.stageKey===k)return;const from=t.stageKey;t.stageKey=k;t.done=k==='done';t.order=pjNextO(p,k);pjAct(t,`نُقلت من «${pjSL(p,from)}» إلى «${pjSL(p,k)}»`);pjSave();pjSync()}

/* ===== محرّر الملاحظات (Notion-lite) — كما هو ===== */
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
function taskStage(v){pjCardList(v)}
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
  try{const url=await pjUpload(f);
    const tgt=window.__imgTarget;if(tgt){const b=findBlock(tgt);if(b){b.type='image';b.url=url;delete b.html}}else{t.blocks.push({id:uid(),type:'image',url})}
    window.__imgTarget=null;if(st)st.textContent='تم';setTimeout(()=>{if(st)st.textContent=''},1500);save();rerenderBlocks(null);
  }catch(err){if(st)st.textContent='';pjUpErr(err)}
}
function closeTask(){closeSlash();pjPopClose();const t=curTask();if(t){document.querySelectorAll('#blocks [data-bid]').forEach(el=>{const b=(t.blocks||[]).find(x=>x.id===el.dataset.bid);if(b)b.html=el.innerHTML});const tt=document.getElementById('t_title');if(tt&&tt.value.trim())t.title=tt.value.replace(/\s+/g,' ').trim()}save();syncTasks();document.getElementById('modalRoot').innerHTML='';CUR_TASK=null;PJX.open=null;if(CUR_PROJ&&CUR==='projects')renderProjectDetail(CUR_PROJ)}

/* ===== لوحة المفاتيح (داخل «المشاريع» فقط وخارج حقول الكتابة) ===== */
function pjKB(){if(PJX.kb)return;PJX.kb=true;document.addEventListener('keydown',pjKey)}
function pjHov(id){PJX.fc=id;if(PJX.kfv){PJX.kfv=false;document.querySelectorAll('#pjLists .pj-card.kf').forEach(c=>c.classList.remove('kf'))}}
function pjFocus(id){PJX.fc=id;PJX.kfv=!!id;document.querySelectorAll('#pjLists .pj-card.kf').forEach(c=>c.classList.remove('kf'));const el=id&&document.querySelector(`#pjLists .pj-card[data-id="${id}"]`);if(el){el.classList.add('kf');el.scrollIntoView({block:'nearest',inline:'nearest'})}}
function pjMoveTo(tid,k){const p=proj(),t=pjT(tid);if(!p||!t||t.stageKey===k)return;const from=t.stageKey;t.stageKey=k;t.done=k==='done';t.order=pjNextO(p,k);pjAct(t,`نُقلت من «${pjSL(p,from)}» إلى «${pjSL(p,k)}»`);pjSave();renderProjectDetail(p.id);pjFocus(tid)}
function pjKey(e){if(CUR!=='projects')return;const tg=e.target;const typing=tg&&(tg.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName));
  if(e.key==='Escape'){
    if(document.getElementById('pjPop')){e.preventDefault();pjPopClose();return}
    if(document.getElementById('pjQE')){pjQEClose();return}
    if(document.getElementById('slashMenu'))return;
    if(typing){if(tg.closest('#pjCM'))tg.blur();return}
    if(document.getElementById('pjCM')){closeTask();return}
    if(PJX.menu){pjMenu(false);return}
    if(PJX.comp){pjComp(null);return}
    if(PJX.fc){pjFocus(null);return}
    return}
  if(typing||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(document.getElementById('pjQE'))return;
  if(document.getElementById('pjCM')){const sb=a=>document.querySelector(`#pjcSide [data-a="${a}"]`);const id=PJX.open;
    if(k==='d'){e.preventDefault();pjDatePop(sb('date'),id)}else if(k==='l'){e.preventDefault();pjLabelPop(sb('lab'),id)}else if(k===' '){e.preventDefault();pjMemberPop(sb('mem'),id)}return}
  if(document.getElementById('modalRoot').innerHTML.trim())return;
  if(!CUR_PROJ){if(k==='n'){e.preventDefault();projModal()}else if(k==='/'||k==='f'){const q=document.getElementById('pjQ');if(q){e.preventDefault();q.focus()}}return}
  if(!document.getElementById('pjLists'))return;const p=proj();if(!p)return;
  const fcEl=PJX.fc&&document.querySelector(`#pjLists .pj-card[data-id="${PJX.fc}"]`);
  if(k==='n'){e.preventDefault();const lk=PJX.hov&&p.taskStages.some(s=>s.key===PJX.hov&&!s.closed&&!s.collapsed)?PJX.hov:fcEl?fcEl.closest('.pj-list').dataset.k:(p.taskStages.find(s=>!s.closed&&!s.collapsed)||{}).key;if(lk)pjComp(lk);return}
  if(k==='f'){e.preventDefault();const b=document.getElementById('pjFBtn');if(b)pjFilterPop(b);return}
  if(k==='x'&&pjFN()){e.preventDefault();pjFClear();return}
  const cols=[...document.querySelectorAll('#pjLists .pj-list:not(.col)')].map(l=>({k:l.dataset.k,ids:[...l.querySelectorAll('.pj-card')].map(c=>c.dataset.id)}));
  if(/^Arrow/.test(e.key)||k===','||k==='.'){e.preventDefault();
    let li=-1,ci=-1;if(fcEl)cols.forEach((c,i)=>{const j=c.ids.indexOf(PJX.fc);if(j>=0){li=i;ci=j}});
    if(li<0){const f=cols.find(c=>c.ids.length);if(f)pjFocus(f.ids[0]);return}
    const dir=(e.key==='ArrowLeft'||k==='.')?1:(e.key==='ArrowRight'||k===',')?-1:0;
    if((e.shiftKey&&dir)||k===','||k==='.'){const to=cols[li+dir];if(to)pjMoveTo(PJX.fc,to.k);return}
    if(e.key==='ArrowDown'){const id=cols[li].ids[ci+1];if(id)pjFocus(id);return}
    if(e.key==='ArrowUp'){const id=cols[li].ids[ci-1];if(id)pjFocus(id);return}
    let j=li+dir;while(cols[j]&&!cols[j].ids.length)j+=dir;if(cols[j])pjFocus(cols[j].ids[Math.min(ci,cols[j].ids.length-1)]);return}
  if(!fcEl)return;
  if(e.key==='Enter'){e.preventDefault();openTask(PJX.fc)}
  else if(k==='d'){e.preventDefault();pjDatePop(fcEl,PJX.fc)}
  else if(k==='l'){e.preventDefault();pjLabelPop(fcEl,PJX.fc)}
  else if(k===' '){e.preventDefault();pjMemberPop(fcEl,PJX.fc)}
  else if(k==='e'){e.preventDefault();const b=fcEl.querySelector('.pj-qeb');if(b)pjQuick(PJX.fc,b)}
  else if(k==='c'){e.preventDefault();pjArchive(PJX.fc)}
}

/* ===== التنسيق (يُحقن مرّة واحدة) ===== */
function pjCSS(){if(document.getElementById('pjCSS'))return;const st=document.createElement('style');st.id='pjCSS';st.textContent=`
  .pj-hact{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  :is(.pj-tile,.pj-chip,.pj-chips,.pj-dr) svg.inl{width:14px;height:14px;vertical-align:-2px}
  .pj-search{display:flex;align-items:center;gap:6px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:0 10px;color:var(--muted)}
  .pj-search svg{width:16px;height:16px}
  .pj-search input{border:none;background:none;backdrop-filter:none;-webkit-backdrop-filter:none;padding:9px 2px;width:200px;font-size:14px}
  .pj-chips{display:flex;gap:6px;flex-wrap:wrap;margin:-8px 0 20px}
  .pj-chips button{border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:20px;padding:5px 12px;font-size:13px;font-weight:700;cursor:pointer}
  .pj-chips button.on{background:var(--goldsoft);color:var(--gold2);border-color:transparent}
  .pj-sh{font-size:15px;font-weight:800;margin:4px 0 12px;display:flex;align-items:center;gap:8px}
  .pj-sh svg{width:18px;height:18px;color:var(--gold2)}
  .pj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin-bottom:28px}
  .pj-tile{position:relative;height:122px;border-radius:14px;padding:12px 14px;color:#fff;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 14px rgba(0,0,0,.25);transition:transform .15s,box-shadow .15s}
  .pj-tile:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))}
  .pj-tile>*{position:relative}
  .pj-tile:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.35)}
  .pj-tt{font-weight:800;font-size:16px;display:flex;gap:7px;align-items:center;line-height:1.3}
  .pj-tm{font-size:12px;opacity:.85;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pj-tst{position:absolute !important;bottom:12px;right:12px;font-size:11px;font-weight:700;background:rgba(0,0,0,.45);padding:2px 9px;border-radius:20px}
  .pj-star{position:absolute !important;bottom:6px;left:8px;opacity:0;border:none;background:none;color:#fff;padding:4px;cursor:pointer;transition:opacity .15s}
  .pj-star svg{width:18px;height:18px}
  .pj-tile:hover .pj-star,.pj-star.on{opacity:1}
  .pj-star.on svg,.pj-ib.on svg{fill:var(--gold);color:var(--gold)}
  .pj-tprog{position:absolute !important;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.15)}
  .pj-tprog i{display:block;height:100%;background:var(--gold);margin-inline-start:0}
  .pj-tbtns{position:absolute !important;bottom:8px;left:8px;display:flex;gap:4px}
  .pj-tbtns button{border:none;border-radius:7px;padding:4px 9px;font-size:12px;font-weight:700;background:rgba(255,255,255,.2);color:#fff;cursor:pointer}
  .pj-tbtns button.del{background:rgba(239,68,68,.75)}
  .pj-new{background:var(--panel2) !important;border:1px dashed var(--line);color:var(--muted);display:grid;place-items:center;font-weight:700;box-shadow:none}
  .pj-new:before{display:none}
  .pj-n{font-size:12px;color:var(--muted);background:var(--panel3);border-radius:20px;padding:1px 8px;font-weight:700}
  .pj-mut{color:var(--muted);font-size:13px}

  .pj-board{position:relative;border-radius:18px;overflow:hidden;height:calc(100dvh - 112px);min-height:460px;display:flex;flex-direction:column;margin-top:-6px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
  .pj-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:9px 12px;background:rgba(0,0,0,.34);-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);color:#fff;border-bottom:1px solid rgba(255,255,255,.08)}
  .pj-bi{display:inline-grid;place-items:center;color:var(--gold2)}
  .pj-bt{width:auto;max-width:46vw;background:transparent;border:1px solid transparent;color:#fff;font-size:18px;font-weight:800;padding:4px 8px;border-radius:8px;backdrop-filter:none;-webkit-backdrop-filter:none;font-family:'Thmanyah Serif','Thmanyah Sans',serif}
  .pj-bt:hover{background:rgba(255,255,255,.12)}
  .pj-bt:focus{background:rgba(0,0,0,.45);border-color:var(--gold)}
  .pj-ib{width:34px;height:34px;display:inline-grid;place-items:center;border:none;border-radius:9px;background:transparent;color:inherit;cursor:pointer;padding:0;flex:0 0 auto}
  .pj-ib:hover{background:rgba(127,127,127,.22)}
  .pj-ib svg{width:18px;height:18px}
  .pj-ib.sm{width:28px;height:28px}.pj-ib.sm svg{width:15px;height:15px}
  .pj-btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:none;border-radius:9px;background:rgba(255,255,255,.16);color:#fff;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap}
  .pj-btn:hover{background:rgba(255,255,255,.26)}
  .pj-btn svg{width:16px;height:16px}
  .pj-btn.on{background:var(--gold);color:#1a1205}
  .pj-btn b{background:rgba(0,0,0,.2);border-radius:10px;padding:0 6px}
  .pj-btn.del{background:rgba(239,68,68,.8)}
  .pj-chip{font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.14);white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis}
  .pj-sp{flex:1}
  .pj-archb{display:flex;align-items:center;gap:8px;padding:9px 16px;font-weight:700;color:#fcd34d;background:repeating-linear-gradient(-45deg,rgba(245,205,71,.2) 0 10px,rgba(245,205,71,.1) 10px 20px)}
  .pj-archb svg{width:18px;height:18px}

  .pj-lists{flex:1;display:flex;gap:12px;align-items:flex-start;overflow-x:auto;overflow-y:hidden;padding:12px 12px 16px}
  .pj-lists::-webkit-scrollbar{height:10px}.pj-lists::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:10px}
  .pj-list{flex:0 0 272px;width:272px;max-height:100%;display:flex;flex-direction:column;background:var(--panel);border-radius:14px;border:1px solid var(--line);box-shadow:0 2px 8px rgba(0,0,0,.25)}
  .pj-list.col{flex:0 0 44px;width:44px;cursor:pointer;padding:12px 0;align-items:center}
  .pj-lcol{writing-mode:vertical-rl;display:flex;gap:8px;align-items:center;font-weight:800;font-size:13px}
  .pj-lcol svg{width:15px;height:15px;color:var(--muted)}
  .pj-lh{display:flex;align-items:center;gap:6px;padding:8px 8px 6px 8px;cursor:grab;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  .pj-lt{flex:1;font-weight:800;font-size:14px;padding:5px 7px;border-radius:7px;cursor:pointer;word-break:break-word}
  .pj-lt:hover{background:var(--panel2)}
  .pj-lti{flex:1;padding:5px 7px;font-weight:800;font-size:14px}
  .pj-list .pj-ib{color:var(--muted)}
  .pj-list.dn .pj-lt:before{content:'✓ ';color:var(--good)}
  .pj-cards{flex:0 1 auto;overflow-y:auto;overflow-x:hidden;padding:2px 8px;min-height:4px}
  .pj-card{position:relative;background:var(--panel2);border-radius:10px;margin-bottom:8px;box-shadow:0 1px 0 rgba(0,0,0,.35);border:1px solid var(--line);cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overflow:hidden}
  .pj-card:hover{border-color:var(--gold)}
  .pj-card.kf{outline:2px solid var(--gold);outline-offset:1px}
  .pj-card.dn .pj-ct{color:var(--muted)}
  .pj-cv{height:32px}
  .pj-cv.img{height:130px;background-size:cover;background-position:center;background-color:#111}
  .pj-cb{padding:8px 10px}
  .pj-lbs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
  .pj-lb{min-width:40px;height:16px;border-radius:4px;font-size:11px;font-weight:800;color:#1d1d1f;padding:0 7px;line-height:16px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pj-ct{font-size:14px;line-height:1.55;word-break:break-word}
  .pj-bdg{display:flex;flex-wrap:wrap;gap:4px 9px;align-items:center;margin-top:6px;font-size:12px;color:var(--muted)}
  .pj-bdg>span{display:inline-flex;align-items:center;gap:3px}
  .pj-bdg svg{width:14px;height:14px}
  .pj-du{padding:1px 6px;border-radius:5px;display:inline-flex;align-items:center;gap:3px}
  .pj-du.ok{background:#1f845a;color:#fff}.pj-du.late{background:#c9372c;color:#fff}.pj-du.soon{background:#f5cd47;color:#1a1205}
  .pj-ck.full{background:#1f845a;color:#fff;border-radius:5px;padding:1px 6px}
  .pj-av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1205;font-weight:800;font-size:11px;display:inline-grid !important;place-items:center;flex:0 0 auto}
  .pj-bdg .pj-av{margin-inline-start:auto}
  .pj-av.sm{width:22px;height:22px;font-size:10px}
  .pj-qeb{position:absolute;top:5px;left:5px;opacity:0;width:28px;height:28px;border-radius:8px;border:none;background:var(--panel3);color:var(--ink);display:grid;place-items:center;cursor:pointer;transition:opacity .12s}
  .pj-qeb svg{width:14px;height:14px}
  .pj-card:hover .pj-qeb,.pj-card.kf .pj-qeb{opacity:1}
  @media(hover:none){.pj-qeb{display:none}}
  .pj-add{margin:4px 8px 8px;display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--muted);padding:8px;border-radius:9px;font-size:14px;font-weight:600;text-align:right;cursor:pointer;flex:0 0 auto}
  .pj-add:hover{background:var(--panel2);color:var(--ink)}
  .pj-add svg{width:16px;height:16px}
  .pj-comp{padding:0 8px 8px;flex:0 0 auto}
  .pj-comp textarea{resize:none;font-size:14px;padding:9px 10px;background:var(--panel2);box-shadow:0 1px 0 rgba(0,0,0,.3)}
  .pj-row{display:flex;gap:6px;align-items:center;margin-top:6px}
  .pj-addl{flex:0 0 272px;width:272px;border-radius:14px;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
  .pj-addl:has(.pj-comp){background:var(--panel)}
  .pj-addlb{width:100%;display:flex;align-items:center;gap:6px;border:none;background:none;color:#fff;font-weight:700;font-size:14px;padding:12px 14px;cursor:pointer;text-align:right}
  .pj-addlb svg{width:16px;height:16px}
  .pj-ghost{position:fixed !important;z-index:1400;pointer-events:none;transform:rotate(3deg);box-shadow:0 18px 40px rgba(0,0,0,.55);opacity:.96;margin:0 !important;overflow:hidden}
  .pj-ph{background:rgba(127,127,127,.22);border-radius:10px;margin-bottom:8px}
  .pj-lph{flex:0 0 auto;border-radius:14px;background:rgba(0,0,0,.25)}
  body.pj-dragging,body.pj-dragging *{cursor:grabbing !important;-webkit-user-select:none;user-select:none}

  .pj-pop{position:fixed;z-index:1300;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px;box-shadow:0 14px 40px rgba(0,0,0,.45);color:var(--ink);width:300px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto}
  .pj-pop h5{margin:12px 2px 6px;font-size:11px;font-weight:800;color:var(--muted)}
  .pj-pt{text-align:center;font-weight:800;font-size:14px;margin:0 0 8px;position:relative;padding:2px 26px}
  .pj-px{position:absolute;left:0;top:-4px;border:none;background:none;color:var(--muted);font-size:20px;cursor:pointer;width:28px;height:28px;border-radius:7px}
  .pj-px:hover{background:var(--panel2)}
  .pj-mi{display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;color:var(--ink);padding:8px 10px;border-radius:8px;font-size:14px;text-align:right;cursor:pointer}
  .pj-mi:hover,.pj-mi.on{background:var(--panel2)}
  .pj-mi svg{width:16px;height:16px;flex:0 0 auto}
  .pj-mi.del{color:var(--bad)}
  .pj-pop input,.pj-pop select,.pj-pop textarea{padding:8px 10px;font-size:14px}
  .pj-pop .row2{grid-template-columns:1fr 90px}
  .pj-fck{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:8px;cursor:pointer;font-size:14px}
  .pj-fck:hover{background:var(--panel2)}
  .pj-fck input{width:16px;height:16px;flex:0 0 auto;accent-color:var(--gold)}
  .pj-lsq{width:30px;height:16px;border-radius:4px;flex:0 0 auto}
  .pj-seg{display:flex;flex-wrap:wrap;gap:4px}
  .pj-seg button{border:1px solid var(--line);background:var(--panel2);color:var(--ink);border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer}
  .pj-seg button.on{background:var(--gold);color:#1a1205;border-color:transparent}
  .pj-lrow{display:flex;gap:6px;align-items:center;margin-bottom:5px}
  .pj-lrow input{width:16px;height:16px;flex:0 0 auto;accent-color:var(--gold)}
  .pj-lsw{flex:1;min-height:32px;border-radius:6px;color:#1d1d1f;font-weight:700;font-size:13px;padding:0 10px;display:flex;align-items:center;border:none;cursor:pointer;text-align:right}
  .pj-lsw:hover{filter:brightness(1.08)}
  .pj-lprev{height:36px;border-radius:8px;display:flex;align-items:center;padding:0 12px;font-weight:800;color:#1d1d1f;margin-bottom:4px}
  .pj-cg{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
  .pj-cg button{height:30px;border-radius:6px;border:2px solid transparent;cursor:pointer}
  .pj-cg button.on{border-color:var(--ink);box-shadow:0 0 0 2px var(--panel) inset}
  .pj-bgg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  .pj-bgg button{height:52px;border-radius:8px;border:2px solid transparent;cursor:pointer}
  .pj-bgg button.on{border-color:var(--gold)}
  .pj-bgm{grid-template-columns:repeat(9,1fr)}.pj-bgm button{height:34px}

  .pj-dr{position:absolute;top:0;bottom:0;left:0;width:370px;max-width:100%;background:var(--panel);border-right:1px solid var(--line);z-index:30;display:flex;flex-direction:column;box-shadow:0 0 40px rgba(0,0,0,.5);color:var(--ink)}
  .pj-dr .pj-ib{color:var(--ink)}
  .pj-drh{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid var(--line)}
  .pj-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--line)}
  .pj-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;border:none;background:none;color:var(--muted);font-weight:700;font-size:13px;padding:7px;border-radius:8px;cursor:pointer}
  .pj-tab svg{width:15px;height:15px}
  .pj-tab.on{background:var(--goldsoft);color:var(--gold2)}
  .pj-drb{flex:1;overflow:auto;padding:14px}
  .pj-dsec{margin-bottom:18px}
  .pj-dsec h4{display:flex;align-items:center;gap:7px;margin:0 0 10px;font-size:14px}
  .pj-dsec h4 svg{width:16px;height:16px;color:var(--gold2)}
  .pj-room{margin:0}
  .pj-arow{display:flex;align-items:center;gap:4px;padding:6px 0;border-top:1px solid var(--line)}
  .pj-arl{flex:1;min-width:0;text-align:right;background:none;border:none;color:var(--ink);font-size:14px;font-weight:600;cursor:pointer;padding:4px}
  .pj-arl small{display:block;color:var(--muted);font-weight:400;font-size:11px}

  .pj-qe{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.6)}
  .pj-qeb2{position:fixed;display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}
  .pj-qe textarea{background:var(--panel2);border-radius:10px;min-height:96px;resize:none;font-size:14px;color:var(--ink)}
  .pj-qea{display:flex;flex-direction:column;gap:5px;width:170px}
  .pj-qea button{display:flex;align-items:center;gap:7px;border:none;border-radius:8px;background:rgba(20,20,22,.88);color:#fff;padding:8px 11px;font-size:13px;font-weight:600;cursor:pointer;text-align:right;transition:transform .1s}
  .pj-qea button:hover{transform:translateX(-3px);background:rgba(40,40,44,.95)}
  .pj-qea svg{width:15px;height:15px}

  .pj-cm{max-width:840px}
  .pj-cm .ed-toolbar{position:static}
  .pj-cm .addtask{width:100%;background:transparent;border:1px dashed var(--line);color:var(--muted);border-radius:8px;padding:8px;font-size:13px;cursor:pointer}
  .pj-cm .addtask:hover{border-color:var(--gold);color:var(--gold2)}
  .pj-cmh{align-items:flex-start;gap:10px}
  .pj-cmi{width:20px;height:20px;margin-top:9px;color:var(--muted);flex:0 0 auto}
  .pj-cmt{font-size:20px;font-weight:800;border:1px solid transparent;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;padding:4px 6px;resize:none;overflow:hidden;line-height:1.4}
  .pj-cmt:focus{background:var(--panel2)}
  .pj-cml{font-size:13px;color:var(--muted);margin:2px 6px 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .pj-cml select{width:auto;padding:3px 8px;font-size:13px;font-weight:700;backdrop-filter:none}
  .pj-cmb{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:22px}
  .pj-cms{display:flex;flex-direction:column;gap:6px}
  .pj-cms h5{margin:8px 0 2px;font-size:11px;color:var(--muted);font-weight:800}
  .pj-cms h5:first-child{margin-top:0}
  .pj-sb{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:7px 10px;font-size:13px;font-weight:600;text-align:right;cursor:pointer}
  .pj-sb:hover{background:var(--panel3)}
  .pj-sb.del{color:var(--bad)}
  .pj-sb svg{width:15px;height:15px;flex:0 0 auto}
  .pj-mcv{height:110px;position:relative;background-size:cover;background-position:center}
  .pj-mcv.img{height:170px;background-color:#111;background-size:contain;background-repeat:no-repeat}
  .pj-mcv .pj-btn{position:absolute;bottom:10px;left:12px;background:rgba(0,0,0,.55)}
  .pj-sec{margin-bottom:24px}
  .pj-sec h4{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:15px}
  .pj-sec h4>svg{width:18px;height:18px;color:var(--muted);flex:0 0 auto}
  .pj-r{margin-inline-start:auto}
  .pj-btn2{border:none;background:var(--panel2);color:var(--ink);border-radius:8px;padding:6px 11px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
  .pj-btn2:hover{background:var(--panel3)}
  .pj-meta{display:flex;flex-wrap:wrap;gap:18px;margin-bottom:22px}
  .pj-meta h5{margin:0 0 6px;font-size:11px;color:var(--muted);font-weight:800}
  .pj-mrow{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
  .pj-addc{width:32px;height:32px;border-radius:8px;border:none;background:var(--panel2);color:var(--ink);display:grid;place-items:center;cursor:pointer}
  .pj-addc:hover{background:var(--panel3)}.pj-addc svg{width:16px;height:16px}
  .pj-mav{display:flex;align-items:center;gap:6px;border:none;background:var(--panel2);color:var(--ink);border-radius:20px;padding:3px 3px 3px 12px;font-size:13px;font-weight:600;cursor:pointer}
  .pj-mlb{height:32px;border-radius:6px;padding:0 12px;font-size:13px;font-weight:700;color:#1d1d1f;min-width:46px;border:none;cursor:pointer}
  .pj-due{display:flex;align-items:center;gap:6px}
  .pj-due input{width:18px;height:18px;accent-color:var(--good)}
  .pj-dbtn{background:var(--panel2);border:none;border-radius:8px;padding:6px 10px;color:var(--ink);font-size:13px;font-weight:600;display:flex;gap:6px;align-items:center;cursor:pointer}
  .pj-dbtn svg{width:14px;height:14px}
  .pj-clt{background:transparent;border:1px solid transparent;font-weight:800;font-size:15px;padding:4px 6px;flex:1;min-width:0;backdrop-filter:none;-webkit-backdrop-filter:none}
  .pj-clt:focus,.pj-clx:focus{background:var(--panel2)}
  .pj-prog{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:12px;color:var(--muted)}
  .pj-prog span{width:34px}
  .pj-bar2{flex:1;height:8px;border-radius:4px;background:var(--panel3);overflow:hidden}
  .pj-bar2 i{display:block;height:100%;background:var(--gold);transition:width .25s}
  .pj-bar2.full i{background:var(--good)}
  .pj-cli{display:flex;align-items:center;gap:8px;padding:1px 4px;border-radius:8px}
  .pj-cli:hover{background:var(--panel2)}
  .pj-cli input[type=checkbox]{width:16px;height:16px;flex:0 0 auto;accent-color:var(--gold)}
  .pj-clx{flex:1;min-width:0;background:transparent;border:1px solid transparent;padding:6px;font-size:14px;backdrop-filter:none;-webkit-backdrop-filter:none}
  .pj-cli.dn .pj-clx{text-decoration:line-through;color:var(--muted)}
  .pj-cli .pj-ib{opacity:0;color:var(--muted)}.pj-cli:hover .pj-ib{opacity:1}
  .pj-att{display:flex;gap:12px;align-items:center;padding:6px;border-radius:10px}
  .pj-att:hover{background:var(--panel2)}
  .pj-ath{width:96px;height:64px;border-radius:8px;background:var(--panel3) center/cover;display:grid;place-items:center;flex:0 0 auto;color:var(--muted)}
  .pj-ath svg{width:22px;height:22px}
  .pj-ati{flex:1;min-width:0;font-size:12px;color:var(--muted)}
  .pj-ati b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}
  .pj-ati b a{color:var(--ink)}
  .pj-ent{display:flex;gap:10px;margin-bottom:12px;align-items:flex-start}
  .pj-ent>.pj-av{width:32px;height:32px}
  .pj-ent .who{font-size:13px;font-weight:700}
  .pj-ent .when{font-size:11px;color:var(--muted);margin-inline-start:6px;font-weight:400}
  .pj-bub{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:14px;white-space:pre-wrap;word-break:break-word;margin-top:4px}
  .pj-sys{font-size:13px;color:var(--muted);margin-bottom:8px}
  .pj-dot{width:8px;height:8px;border-radius:50%;background:var(--panel3);margin:6px 12px 0;flex:0 0 auto}

  @media(max-width:700px){
    .pj-board{height:calc(100dvh - 86px);border-radius:12px;margin-top:-4px}
    .pj-bt{font-size:16px;max-width:52vw}
    .pj-hide-sm{display:none}
    .pj-chip{max-width:120px}
    .pj-list,.pj-addl{flex-basis:84vw;width:84vw}
    .pj-lists{scroll-snap-type:x proximity;padding:10px}
    .pj-list,.pj-addl{scroll-snap-align:center}
    .pj-dr{width:100%}
    .pj-search input{width:130px}
    .pj-cmb{grid-template-columns:1fr;gap:14px}
    .pj-cms{order:-1;display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
    .pj-cms h5{grid-column:1/-1}
    .pj-sb{padding:7px 8px;font-size:12px}
    .pj-bgm{grid-template-columns:repeat(6,1fr)}
    .pj-qea{width:100%;display:grid;grid-template-columns:1fr 1fr}
  }
  `;document.head.appendChild(st)}
