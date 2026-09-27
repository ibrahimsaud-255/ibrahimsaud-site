/*
 * 19-freeform.js — الخرائط الذهنيّة واللوحة الحرّة
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== الخرائط الذهنية / اللوحة الحرة (Freeform) ===== */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: let BRD=null,BSEL=new Set(),BMODE='select',BFROM=null,BTMP=null,BGEST= */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const BPTRS=new Map(); */
const BPEN={color:'#f5a623',size:5};
const BPAL=['#ffd43b','#69db7c','#4dabf7','#ff8787','#b197fc','#ffa94d','#ff85c0','#63e6be','#ffffff','#ced4da'];
const BSHAPES={rect:{n:'مستطيل',css:'border-radius:8px'},round:{n:'مربع مدوّر',css:'border-radius:22px'},ellipse:{n:'دائرة',css:'border-radius:50%'},diamond:{n:'معيّن',css:'clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)'},triangle:{n:'مثلث',css:'clip-path:polygon(50% 3%,100% 100%,0 100%)'},star:{n:'نجمة',css:'clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},arrow:{n:'سهم',css:'clip-path:polygon(0 32%,58% 32%,58% 8%,100% 50%,58% 92%,58% 68%,0 68%)'},hex:{n:'سداسي',css:'clip-path:polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)'},pill:{n:'كبسولة',css:'border-radius:999px'},cloud:{n:'سحابة',css:'border-radius:50% 50% 50% 50%/60% 60% 40% 40%'}};

function ensureBoardStyles(){if(document.getElementById('bdCSS'))return;const st=document.createElement('style');st.id='bdCSS';st.textContent=`
  .bd-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  #main:fullscreen{background:var(--bg);padding:16px;overflow:auto}
  #main:-webkit-full-screen{background:var(--bg);padding:16px;overflow:auto}
  #main:fullscreen .bd-canvas{height:calc(100vh - 92px)}
  .bd-title{flex:0 1 220px;min-width:140px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;color:var(--ink);font-weight:700;font-size:15px}
  .bd-tools,.bd-zoom{display:flex;gap:3px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:4px}
  .bd-zoom{margin-inline-start:auto}
  .bd-tool{min-width:38px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--ink);border-radius:9px;cursor:pointer;padding:0 8px}
  .bd-tool:hover{background:var(--panel2)}
  .bd-tool.on{background:var(--gold);color:#1a1205}
  .bd-tool i{width:18px;height:18px}
  #bd_zlbl{font-weight:700;font-size:13px}
  .bd-canvas{position:relative;overflow:hidden;height:calc(100vh - 172px);min-height:420px;background-color:var(--bd-bg);border:1px solid var(--line);border-radius:16px;background-image:radial-gradient(circle,var(--bd-dot) 1.3px,transparent 1.4px);touch-action:none;cursor:grab;--bd-bg:#15151c;--bd-dot:rgba(150,150,165,.30);--bd-glass:rgba(26,26,32,.66);--bd-glass-bd:rgba(255,255,255,.14);--bd-glass-ink:#f2f2f5;--bd-glass-btn:rgba(255,255,255,.08);--bd-glass-btnh:rgba(255,255,255,.17)}
  .bd-canvas.bd-light{--bd-bg:#f3f4f8;--bd-dot:rgba(60,60,85,.26);--bd-glass:rgba(255,255,255,.7);--bd-glass-bd:rgba(0,0,0,.10);--bd-glass-ink:#1b1b24;--bd-glass-btn:rgba(0,0,0,.05);--bd-glass-btnh:rgba(0,0,0,.11)}
  .bd-world{position:absolute;top:0;left:0;width:0;height:0;transform-origin:0 0}
  .bd-edges{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
  .bd-item{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;user-select:none;cursor:move;box-shadow:0 2px 12px rgba(0,0,0,.20)}
  .bd-item.t-note{border-radius:7px;padding:12px}
  .bd-item.t-text{background:transparent!important;box-shadow:none;padding:4px}
  .bd-item.t-image{padding:0;overflow:hidden;background:transparent;box-shadow:0 4px 16px rgba(0,0,0,.28)}
  .bd-item.sel{outline:2.5px solid var(--gold);outline-offset:2px}
  .bd-txt{width:100%;text-align:center;line-height:1.35;word-break:break-word;white-space:pre-wrap;outline:none;overflow:hidden}
  .bd-txt.editing{cursor:text;user-select:text;overflow:visible}
  .bd-txt:empty:before{content:attr(data-ph);opacity:.5}
  .bd-handle{position:absolute;width:15px;height:15px;background:var(--gold);border:2px solid #1a1205;border-radius:50%;right:-8px;bottom:-8px;cursor:nwse-resize;display:none;z-index:3}
  .bd-item.sel .bd-handle{display:block}
  .bd-knob{position:absolute;right:-13px;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:var(--gold);color:#1a1205;font-weight:900;display:none;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--panel);font-size:16px;line-height:1;z-index:3}
  .bd-item.sel .bd-knob{display:flex}
  .bd-style{display:none;position:absolute;z-index:30;left:50%;bottom:16px;transform:translateX(-50%);align-items:center;gap:6px;flex-wrap:nowrap;max-width:calc(100% - 20px);overflow-x:auto;background:var(--bd-glass);-webkit-backdrop-filter:blur(20px) saturate(1.5);backdrop-filter:blur(20px) saturate(1.5);border:1px solid var(--bd-glass-bd);border-radius:14px;padding:7px 9px;box-shadow:0 12px 34px rgba(0,0,0,.34),0 2px 8px rgba(0,0,0,.22);scrollbar-width:none}
  .bd-style::-webkit-scrollbar{display:none}
  .bd-style .bd-lbl{color:var(--bd-glass-ink);opacity:.55}
  .bd-style .bd-sep{background:var(--bd-glass-bd)}
  .bd-style .bd-act{background:var(--bd-glass-btn);border:1px solid var(--bd-glass-bd);color:var(--bd-glass-ink)}
  .bd-style .bd-act:hover{background:var(--bd-glass-btnh)}
  .bd-style .bd-act.on{background:var(--gold);color:#1a1205;border-color:var(--gold)}
  .bd-style .bd-act.del{color:#ff6b6b}
  .bd-style .bd-sw{border:2px solid var(--bd-glass-bd)}
  .bd-style .bd-sw.on{border-color:var(--bd-glass-ink);transform:scale(1.08)}
  .bd-style .bd-size{background:var(--bd-glass-btn);border:1px solid var(--bd-glass-bd)}
  .bd-style .bd-size span{background:var(--bd-glass-ink)}
  .bd-lbl{font-size:12px;color:var(--muted);font-weight:700}
  .bd-sw{width:24px;height:24px;border-radius:7px;border:2px solid var(--line);cursor:pointer;padding:0}
  .bd-sw.on{border-color:var(--ink);transform:scale(1.08)}
  .bd-sep{width:1px;height:22px;background:var(--line);margin:0 3px}
  .bd-act{display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);cursor:pointer;font-weight:700;font-size:13px}
  .bd-act i{width:15px;height:15px}
  .bd-act.del{color:var(--bad)}
  .bd-act.on{background:var(--gold);color:#1a1205;border-color:var(--gold)}
  .bd-size{width:34px;height:32px;border:1px solid var(--line);background:var(--panel2);border-radius:9px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
  .bd-size.on{border-color:var(--gold)}
  .bd-size span{background:var(--ink);border-radius:50%;display:block}
  .bd-hint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(0,0,0,.72);color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;pointer-events:none;opacity:0;transition:.2s;z-index:5}
  .bd-hint.show{opacity:1}
  .bd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
  .bd-card{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;transition:.15s}
  .bd-card:hover{border-color:var(--gold);transform:translateY(-2px)}
  .bd-thumb{height:118px;background:var(--panel2);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);overflow:hidden}
  .bd-thumb-empty{color:var(--muted)}
  .bd-card-ft{padding:10px 12px}
  .bd-card-nm{font-weight:800}
  .bd-card-meta{font-size:12px;color:var(--muted);margin-top:2px}
  .bd-card-x{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.55);border:none;color:#fff;width:30px;height:30px;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .bd-menu{position:fixed;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:6px;display:grid;grid-template-columns:repeat(3,1fr);gap:5px;z-index:1200;box-shadow:0 12px 34px rgba(0,0,0,.45)}
  .bd-menu button{width:56px;height:50px;border:1px solid var(--line);background:var(--panel2);border-radius:9px;color:var(--ink);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px}
  .bd-menu button:hover{border-color:var(--gold)}
  .bd-mini{width:22px;height:18px;background:var(--gold2);display:block}
`;document.head.appendChild(st)}

function boardWhen(b){return ageLabel(b.updated||b.created||today())}
function boardThumb(b){
  const items=(b.items||[]).filter(i=>i.type!=='draw'&&i.w);
  if(!items.length)return '<div class="bd-thumb-empty"><i data-lucide="shapes"></i></div>';
  let mnX=1/0,mnY=1/0,mxX=-1/0,mxY=-1/0;
  items.forEach(i=>{mnX=Math.min(mnX,i.x);mnY=Math.min(mnY,i.y);mxX=Math.max(mxX,i.x+i.w);mxY=Math.max(mxY,i.y+i.h)});
  const w=Math.max(1,mxX-mnX),h=Math.max(1,mxY-mnY),sw=Math.max(w,h)/90;
  return `<svg viewBox="${mnX-20} ${mnY-20} ${w+40} ${h+40}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">
    ${(b.edges||[]).map(e=>{const a=items.find(i=>i.id===e.from),c=items.find(i=>i.id===e.to);if(!a||!c)return '';return `<line x1="${a.x+a.w/2}" y1="${a.y+a.h/2}" x2="${c.x+c.w/2}" y2="${c.y+c.h/2}" stroke="#8a8a99" stroke-width="${sw}"/>`}).join('')}
    ${items.map(i=>`<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="${sw*2}" fill="${i.type==='text'?'#8a8a99':(i.fill||'#4dabf7')}" opacity=".92"/>`).join('')}
  </svg>`;
}
function renderBoards(){
  ensureBoardStyles();if(!Array.isArray(S.boards))S.boards=[];
  const list=S.boards.slice().sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
  const cards=!list.length?emptyBox('git-fork','لا توجد خرائط بعد. أنشئ لوحتك الأولى.'):
   `<div class="bd-cards">${list.map(b=>`
     <div class="bd-card" onclick="openBoard('${b.id}')">
       <div class="bd-thumb">${boardThumb(b)}</div>
       <div class="bd-card-ft"><div class="bd-card-nm">${esc(b.name||'بدون عنوان')}</div>
         <div class="bd-card-meta">${(b.items||[]).length} عنصر · ${boardWhen(b)}</div></div>
       <button class="bd-card-x" title="حذف" onclick="event.stopPropagation();delBoard('${b.id}')"><i data-lucide="trash-2"></i></button>
     </div>`).join('')}</div>`;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الخرائط الذهنية واللوحات</h1><button class="btn btn-gold" onclick="newBoard()"><i data-lucide="plus"></i> لوحة جديدة</button></div>
    <div class="badge-note"><i data-lucide="git-fork"></i> <div>لوحة حرّة لا نهائية على طريقة <b>Freeform</b>: ملاحظات لاصقة، أشكال، نصوص، صور، رسم حرّ، وروابط بين العناصر لبناء الخرائط الذهنية. تعمل باللمس والفأرة (سحب للتحريك، قرص للتكبير)، وتُحفظ تلقائياً في السحابة.</div></div>
    ${cards}`;
  refreshIcons();
}
function newBoard(){if(!Array.isArray(S.boards))S.boards=[];const b={id:uid(),name:'لوحة جديدة',created:today(),updated:today(),items:[],edges:[],view:{x:0,y:0,zoom:1}};S.boards.push(b);save();openBoard(b.id)}
function delBoard(id){if(!confirm('حذف هذه اللوحة نهائياً؟'))return;S.boards=(S.boards||[]).filter(b=>b.id!==id);save();renderBoards()}

function openBoard(id){
  ensureBoardStyles();BRD=(S.boards||[]).find(b=>b.id===id);if(!BRD){renderBoards();return}
  if(!BRD.view)BRD.view={x:0,y:0,zoom:1};if(!BRD.items)BRD.items=[];if(!BRD.edges)BRD.edges=[];
  BSEL=new Set();BMODE='select';BFROM=null;BTMP=null;BGEST=null;BEDIT=false;BCUR=null;BUNDO=[];BPTRS.clear();
  document.getElementById('main').innerHTML=`
    <div class="bd-top">
      <button class="btn btn-ghost btn-sm" onclick="renderBoards()"><i data-lucide="arrow-right"></i> اللوحات</button>
      <input class="bd-title" id="bd_title" value="${esc(BRD.name||'')}" oninput="boardRename(this.value)" placeholder="اسم اللوحة">
      <div class="bd-tools">
        <button class="bd-tool" title="ملاحظة لاصقة" onclick="addNote()"><i data-lucide="sticky-note"></i></button>
        <button class="bd-tool" title="نص" onclick="addText()"><i data-lucide="type"></i></button>
        <button class="bd-tool" title="شكل" onclick="boardShapeMenu(this)"><i data-lucide="shapes"></i></button>
        <button class="bd-tool" title="صورة" onclick="document.getElementById('bd_img').click()"><i data-lucide="image"></i></button>
        <button class="bd-tool" id="bd_pen" title="رسم حرّ" onclick="boardMode('draw')"><i data-lucide="pencil"></i></button>
        <button class="bd-tool" id="bd_conn" title="ربط العناصر" onclick="boardMode('connect')"><i data-lucide="spline"></i></button>
        <input type="file" id="bd_img" accept="image/*" class="hidden" onchange="boardUpload(event)">
      </div>
      <div class="bd-zoom">
        <button class="bd-tool" id="bd_theme" title="الوضع الفاتح/الداكن" onclick="boardToggleTheme()"><i data-lucide="sun-moon"></i></button>
        <button class="bd-tool" id="bd_full" title="ملء الشاشة" onclick="boardFullscreen()"><i data-lucide="maximize"></i></button>
        <span class="bd-sep" style="margin:0 3px"></span>
        <button class="bd-tool" title="تصغير" onclick="boardZoom(-1)"><i data-lucide="minus"></i></button>
        <button class="bd-tool" id="bd_zlbl" title="ملء الشاشة" onclick="boardFit()">100%</button>
        <button class="bd-tool" title="تكبير" onclick="boardZoom(1)"><i data-lucide="plus"></i></button>
      </div>
    </div>
    <div class="bd-canvas" id="bd_canvas" dir="ltr">
      <div class="bd-world" id="bd_world"><svg class="bd-edges" id="bd_svg"></svg></div>
      <div class="bd-style" id="bd_style"></div>
      <div class="bd-hint" id="bd_hint"></div>
    </div>`;
  const cv=document.getElementById('bd_canvas');
  try{if(localStorage.getItem('bd_theme')==='light')cv.classList.add('bd-light')}catch(_){}
  cv.addEventListener('wheel',boardWheel,{passive:false});
  cv.addEventListener('pointerdown',boardPtrDown);
  cv.addEventListener('pointermove',boardPtrMove);
  cv.addEventListener('pointerup',boardPtrUp);
  cv.addEventListener('pointercancel',boardPtrUp);
  cv.addEventListener('dblclick',boardCanvasDbl);
  if(!window.__bdInit){window.__bdInit=1;document.addEventListener('keydown',boardKeys);document.addEventListener('paste',boardPaste)}
  if(!window.__bdFs){window.__bdFs=1;document.addEventListener('fullscreenchange',()=>{const ic=document.querySelector('#bd_full i');if(ic){ic.setAttribute('data-lucide',document.fullscreenElement?'minimize':'maximize');refreshIcons()}});}
  boardPaint();boardHint('انقر مزدوجاً على أي مكان فارغ لإضافة ملاحظة');
}
/* helpers */
function bItem(id){return (BRD.items||[]).find(i=>i.id===id)}
function bItemEl(id){return document.querySelector('.bd-item[data-id="'+CSS.escape(id)+'"]')}
function bCenter(i){return{x:i.x+i.w/2,y:i.y+i.h/2}}
function bDist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function bMid(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function bCurve(a,b){const mx=(a.x+b.x)/2;return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
function bBorder(i,to){const cx=i.x+i.w/2,cy=i.y+i.h/2,dx=to.x-cx,dy=to.y-cy;if(!dx&&!dy)return{x:cx,y:cy};const sx=dx?(i.w/2)/Math.abs(dx):1/0,sy=dy?(i.h/2)/Math.abs(dy):1/0,t=Math.min(sx,sy);return{x:cx+dx*t,y:cy+dy*t}}
function bAutoText(f){if(!f||f==='transparent'||String(f).startsWith('var'))return 'var(--ink)';const h=f.replace('#','');if(h.length<6)return '#111';const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (r*299+g*587+b*114)/1000>150?'#1a1205':'#fff'}
function bNextZ(){return (BRD.items.length?Math.max.apply(null,BRD.items.map(i=>i.z||0)):0)+1}
function bTouch(){if(BRD)BRD.updated=today()}
function saveBoard(){bTouch();save()}
function saveBoardView(){clearTimeout(BVT);BVT=setTimeout(save,400)}
function bSnap(){try{BUNDO.push(JSON.stringify({items:BRD.items,edges:BRD.edges}));if(BUNDO.length>50)BUNDO.shift()}catch(_){}}
function boardUndo(){if(!BUNDO.length)return;const s=JSON.parse(BUNDO.pop());BRD.items=s.items;BRD.edges=s.edges;BSEL.clear();saveBoard();boardPaint()}
function boardRename(v){if(BRD){BRD.name=v;saveBoardView()}}
/* view / transform */
function applyView(){const w=document.getElementById('bd_world'),cv=document.getElementById('bd_canvas');if(!w)return;const v=BRD.view;w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.zoom})`;const l=document.getElementById('bd_zlbl');if(l)l.textContent=Math.round(v.zoom*100)+'%';if(cv){cv.style.backgroundSize=(26*v.zoom)+'px '+(26*v.zoom)+'px';cv.style.backgroundPosition=v.x+'px '+v.y+'px'}positionStyleBar()}
function bWorldFromScreen(sx,sy){return{x:(sx-BRD.view.x)/BRD.view.zoom,y:(sy-BRD.view.y)/BRD.view.zoom}}
function bWorldPt(e){const r=document.getElementById('bd_canvas').getBoundingClientRect();return bWorldFromScreen(e.clientX-r.left,e.clientY-r.top)}
function bViewCenter(){const r=document.getElementById('bd_canvas').getBoundingClientRect();return bWorldFromScreen(r.width/2,r.height/2)}
function zoomAt(sx,sy,nz){nz=Math.min(3,Math.max(0.2,nz));const v=BRD.view;const wx=(sx-v.x)/v.zoom,wy=(sy-v.y)/v.zoom;v.zoom=nz;v.x=sx-wx*nz;v.y=sy-wy*nz;applyView()}
function boardZoom(d){const r=document.getElementById('bd_canvas').getBoundingClientRect();zoomAt(r.width/2,r.height/2,BRD.view.zoom*(d>0?1.2:1/1.2));saveBoardView()}
function boardFit(){const ns=(BRD.items||[]).filter(i=>i.type!=='draw'&&i.w);const r=document.getElementById('bd_canvas').getBoundingClientRect();if(!ns.length){BRD.view={x:r.width/2,y:r.height/2,zoom:1};applyView();saveBoardView();return}let mnX=1/0,mnY=1/0,mxX=-1/0,mxY=-1/0;ns.forEach(i=>{mnX=Math.min(mnX,i.x);mnY=Math.min(mnY,i.y);mxX=Math.max(mxX,i.x+i.w);mxY=Math.max(mxY,i.y+i.h)});const pad=70,bw=mxX-mnX+pad*2,bh=mxY-mnY+pad*2,z=Math.min(1.6,Math.max(0.2,Math.min(r.width/bw,r.height/bh)));const v=BRD.view;v.zoom=z;v.x=(r.width-(mxX+mnX)*z)/2;v.y=(r.height-(mxY+mnY)*z)/2;applyView();saveBoardView()}
/* paint */
function bHandles(){return '<div class="bd-handle"></div><div class="bd-knob" title="أضف فرعاً مرتبطاً" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();spawnChild(this.parentNode.dataset.id)">+</div>'}
function bBuild(it){
  const d=document.createElement('div');d.className='bd-item t-'+it.type+(BSEL.has(it.id)?' sel':'');d.dataset.id=it.id;
  d.style.left=it.x+'px';d.style.top=it.y+'px';d.style.width=it.w+'px';d.style.height=it.h+'px';
  if(it.type==='image'){d.style.borderRadius=(it.radius||10)+'px';d.innerHTML=`<img src="${esc(it.url)}" draggable="false" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;pointer-events:none">`+bHandles();}
  else{
    const fill=it.type==='text'?'transparent':(it.fill||'#ffd43b');d.style.background=fill;
    if(it.type==='shape')d.style.cssText+=';'+((BSHAPES[it.shape]||BSHAPES.rect).css);
    const col=it.color||(it.type==='text'?'var(--ink)':bAutoText(fill));
    d.innerHTML=`<div class="bd-txt" data-ph="${it.type==='text'?'نص':'…'}" style="color:${col};font-size:${it.fontSize||16}px;${it.type==='text'?'font-weight:700;':''}">${esc(it.text||'')}</div>`+bHandles();
  }
  d.addEventListener('dblclick',ev=>{ev.stopPropagation();bStartEdit(it.id)});
  return d;
}
function boardPaint(){const w=document.getElementById('bd_world');if(!w)return;w.querySelectorAll('.bd-item').forEach(n=>n.remove());(BRD.items||[]).filter(i=>i.type!=='draw').slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(it=>w.appendChild(bBuild(it)));boardDrawEdges();applyView();refreshSelUI();refreshIcons()}
function boardDrawEdges(){const svg=document.getElementById('bd_svg');if(!svg)return;let s='';
  (BRD.edges||[]).forEach(e=>{const a=bItem(e.from),b=bItem(e.to);if(!a||!b||!a.w||!b.w)return;const q1=bBorder(a,bCenter(b)),q2=bBorder(b,bCenter(a));s+=`<path d="${bCurve(q1,q2)}" fill="none" stroke="${e.color||'#f5a623'}" stroke-width="2.5" stroke-linecap="round"/>`;});
  (BRD.items||[]).filter(i=>i.type==='draw').forEach(i=>{s+=`<polyline points="${i.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${i.stroke}" stroke-width="${i.sw}" stroke-linecap="round" stroke-linejoin="round"/>`;});
  if(BMODE==='connect'&&BFROM&&BTMP){const a=bItem(BFROM);if(a&&a.w)s=`<path d="${bCurve(bCenter(a),BTMP)}" fill="none" stroke="#f5a623" stroke-width="2" stroke-dasharray="7 6"/>`+s}
  svg.innerHTML=s;
}
/* selection */
function boardToggleTheme(){const cv=document.getElementById('bd_canvas');if(!cv)return;const light=!cv.classList.contains('bd-light');cv.classList.toggle('bd-light',light);try{localStorage.setItem('bd_theme',light?'light':'dark')}catch(_){}}
function boardFullscreen(){const el=document.getElementById('main');if(!el)return;const fe=document.fullscreenElement||document.webkitFullscreenElement;if(fe){(document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document)}else{(el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el)}}
// يضع تولبار التعديل عائماً فوق العنصر المحدّد (يتبع التحديد/السحب/التكبير)
function positionStyleBar(){
  // تولبار ثابت مرسّى أسفل الكانفس، في المنتصف — واضح ومريح للاستخدام
  const bar=document.getElementById('bd_style');if(!bar||bar.style.display==='none')return;
  bar.style.top='';bar.style.left='50%';bar.style.bottom='16px';bar.style.transform='translateX(-50%)';
}
function bMarkSel(){document.querySelectorAll('.bd-item').forEach(el=>el.classList.toggle('sel',BSEL.has(el.dataset.id)));refreshSelUI();boardDrawEdges()}
function bSelectOnly(id){BSEL=new Set([id]);bMarkSel()}
function bToggleSel(id){BSEL.has(id)?BSEL.delete(id):BSEL.add(id);bMarkSel()}
function bDeselect(){BSEL.clear();bMarkSel()}
function refreshSelUI(){
  const bar=document.getElementById('bd_style');if(!bar)return;
  const pen=document.getElementById('bd_pen'),con=document.getElementById('bd_conn');
  if(pen)pen.classList.toggle('on',BMODE==='draw');if(con)con.classList.toggle('on',BMODE==='connect');
  const cv=document.getElementById('bd_canvas');if(cv)cv.style.cursor=BMODE==='draw'?'crosshair':'';
  if(BMODE==='draw'){bar.style.display='flex';bar.innerHTML=`<span class="bd-lbl">قلم</span>${BPAL.slice(0,8).map(c=>`<button class="bd-sw${BPEN.color===c?' on':''}" style="background:${c}" onclick="penColor('${c}')"></button>`).join('')}<span class="bd-sep"></span>${[3,6,10,16].map(s=>`<button class="bd-size${BPEN.size===s?' on':''}" onclick="penSize(${s})"><span style="width:${Math.min(s,14)}px;height:${Math.min(s,14)}px"></span></button>`).join('')}<span class="bd-sep"></span><button class="bd-act" onclick="clearDraw()"><i data-lucide="eraser"></i> مسح الرسم</button><button class="bd-act on" onclick="boardMode('select')"><i data-lucide="check"></i> تم</button>`;refreshIcons();positionStyleBar();return}
  const ids=[...BSEL];if(!ids.length){bar.style.display='none';bar.innerHTML='';return}
  const single=ids.length===1?bItem(ids[0]):null,isImg=single&&single.type==='image';
  bar.style.display='flex';
  bar.innerHTML=`${!isImg?`<span class="bd-lbl">تعبئة</span>${BPAL.map(c=>`<button class="bd-sw" style="background:${c}" onclick="setFill('${c}')"></button>`).join('')}<span class="bd-sep"></span><span class="bd-lbl">نص</span>${['#ffffff','#1a1205','#f5a623','#4dabf7','#ff6b6b'].map(c=>`<button class="bd-sw" style="background:${c}" onclick="setTextColor('${c}')"></button>`).join('')}<button class="bd-act" title="أصغر" onclick="fontStep(-2)">أ−</button><button class="bd-act" title="أكبر" onclick="fontStep(2)">أ+</button><span class="bd-sep"></span>`:''}${single&&!isImg?`<button class="bd-act" onclick="spawnChild('${single.id}')"><i data-lucide="git-fork"></i> فرع</button>`:''}<button class="bd-act" title="تكرار" onclick="dupSel()"><i data-lucide="copy"></i></button><button class="bd-act" title="للأمام" onclick="zOrder(1)"><i data-lucide="bring-to-front"></i></button><button class="bd-act" title="للخلف" onclick="zOrder(-1)"><i data-lucide="send-to-back"></i></button><button class="bd-act del" title="حذف" onclick="delSel()"><i data-lucide="trash-2"></i></button>`;
  refreshIcons();positionStyleBar();
}
/* create */
function bMk(type,x,y,shape){const b={id:uid(),type,x:Math.round(x),y:Math.round(y),z:bNextZ(),text:''};if(type==='note'){b.w=170;b.h=150;b.fill='#ffd43b';b.fontSize=17}else if(type==='text'){b.w=210;b.h=56;b.fontSize=22;b.color='var(--ink)'}else if(type==='shape'){b.w=150;b.h=120;b.fill='#4dabf7';b.shape=shape||'rect';b.fontSize=16;b.color='#fff'}return b}
function addNote(){const c=bViewCenter();bSnap();const it=bMk('note',c.x-85,c.y-75);BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),20)}
function addText(){const c=bViewCenter();bSnap();const it=bMk('text',c.x-105,c.y-28);BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),20)}
function addShape(shape){closeShapeMenu();const c=bViewCenter();bSnap();const it=bMk('shape',c.x-75,c.y-60,shape);BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),20)}
function spawnChild(id){const p=bItem(id);if(!p||!p.w)return;bSnap();const it=bMk('note',p.x+p.w+80,p.y);it.fill=p.type!=='text'?(p.fill||'#ffd43b'):'#ffd43b';it.color=bAutoText(it.fill);BRD.items.push(it);if(!BRD.edges)BRD.edges=[];BRD.edges.push({id:uid(),from:id,to:it.id,color:'#f5a623'});bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),30)}
function boardShapeMenu(btn){closeShapeMenu();const m=document.createElement('div');m.className='bd-menu';m.id='bd_shapemenu';m.innerHTML=Object.keys(BSHAPES).map(k=>`<button onclick="addShape('${k}')"><span class="bd-mini" style="${BSHAPES[k].css}"></span>${BSHAPES[k].n}</button>`).join('');document.body.appendChild(m);const r=btn.getBoundingClientRect();m.style.left=Math.max(8,Math.min(r.left,window.innerWidth-m.offsetWidth-10))+'px';m.style.top=(r.bottom+6)+'px';setTimeout(()=>document.addEventListener('pointerdown',closeShapeMenu,{once:true}),10)}
function closeShapeMenu(){const m=document.getElementById('bd_shapemenu');if(m)m.remove()}
function boardUpload(ev){const f=ev.target.files[0];ev.target.value='';if(f)boardUploadFile(f)}
function boardUploadFile(f){boardHint('جارٍ رفع الصورة…');const ext=(f.name&&f.name.split('.').pop()||'png').toLowerCase();const path=`${USER.id}/boards/${uid()}.${ext}`;
  sb.storage.from('task-images').upload(path,f,{upsert:false,contentType:f.type||'image/png'}).then(({error})=>{
    if(error){boardHint('');alert('تعذّر رفع الصورة: '+(error.message||error)+'\n\nتأكد من وجود حاوية عامة باسم «task-images» في Supabase → Storage.');return}
    const url=sb.storage.from('task-images').getPublicUrl(path).data.publicUrl;const img=new Image();
    img.onload=()=>{const c=bViewCenter();let w=img.naturalWidth||240,h=img.naturalHeight||180;const m=Math.max(w,h);if(m>320){const k=320/m;w*=k;h*=k}bSnap();const it=bMk('image',c.x-w/2,c.y-h/2);it.w=Math.round(w);it.h=Math.round(h);it.url=url;it.radius=10;BRD.items.push(it);bSelectOnly(it.id);boardHint('');saveBoard();boardPaint()};
    img.onerror=()=>boardHint('');img.src=url;});
}
/* mutate */
function setFill(c){if(!BSEL.size)return;bSnap();BSEL.forEach(id=>{const it=bItem(id);if(it&&it.type!=='image'){it.fill=c;if(it.type!=='text')it.color=bAutoText(c)}});saveBoard();boardPaint()}
function setTextColor(c){if(!BSEL.size)return;bSnap();BSEL.forEach(id=>{const it=bItem(id);if(it)it.color=c});saveBoard();boardPaint()}
function fontStep(d){if(!BSEL.size)return;bSnap();BSEL.forEach(id=>{const it=bItem(id);if(it)it.fontSize=Math.max(10,Math.min(72,(it.fontSize||16)+d))});saveBoard();boardPaint()}
function dupSel(){if(!BSEL.size)return;bSnap();const map={},cl=[];[...BSEL].forEach(id=>{const it=bItem(id);if(!it)return;const c=JSON.parse(JSON.stringify(it));c.id=uid();c.x+=28;c.y+=28;c.z=bNextZ();map[id]=c.id;cl.push(c)});BRD.items.push.apply(BRD.items,cl);(BRD.edges||[]).slice().forEach(e=>{if(map[e.from]&&map[e.to])BRD.edges.push({id:uid(),from:map[e.from],to:map[e.to],color:e.color})});BSEL=new Set(cl.map(c=>c.id));saveBoard();boardPaint()}
function zOrder(d){if(!BSEL.size)return;bSnap();const zs=BRD.items.map(i=>i.z||0),top=Math.max.apply(null,zs.concat(0)),bot=Math.min.apply(null,zs.concat(0));BSEL.forEach(id=>{const it=bItem(id);if(it)it.z=d>0?top+1:bot-1});saveBoard();boardPaint()}
function delSel(){if(!BSEL.size)return;bSnap();const del=new Set(BSEL);BRD.items=BRD.items.filter(i=>!del.has(i.id));BRD.edges=(BRD.edges||[]).filter(e=>!del.has(e.from)&&!del.has(e.to));BSEL.clear();saveBoard();boardPaint()}
function penColor(c){BPEN.color=c;refreshSelUI()}
function penSize(s){BPEN.size=s;refreshSelUI()}
function clearDraw(){if(!(BRD.items||[]).some(i=>i.type==='draw'))return;if(!confirm('مسح كل الرسم الحرّ في هذه اللوحة؟'))return;bSnap();BRD.items=BRD.items.filter(i=>i.type!=='draw');saveBoard();boardPaint()}
/* edit text */
function bStartEdit(id){const it=bItem(id);if(!it||it.type==='image')return;bSelectOnly(id);const el=bItemEl(id);const t=el&&el.querySelector('.bd-txt');if(!t)return;BEDIT=true;t.contentEditable='true';t.classList.add('editing');t.focus();
  try{const rng=document.createRange();rng.selectNodeContents(t);rng.collapse(false);const sel=getSelection();sel.removeAllRanges();sel.addRange(rng)}catch(_){}
  const done=()=>{BEDIT=false;t.contentEditable='false';t.classList.remove('editing');it.text=t.innerText.replace(/\n{3,}/g,'\n\n').trim();saveBoard();t.removeEventListener('blur',done)};
  t.addEventListener('blur',done);
  t.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();t.blur()}ev.stopPropagation()});
}
/* mode */
function boardMode(m){BMODE=(BMODE===m)?'select':m;BFROM=null;BTMP=null;boardHint(BMODE==='draw'?'وضع الرسم: ارسم بالفأرة أو الإصبع':BMODE==='connect'?'وضع الربط: اضغط عنصرين لربطهما':'');refreshSelUI();boardDrawEdges()}
function handleConnect(it){if(!BFROM){BFROM=it.id;bSelectOnly(it.id);boardHint('اختر العنصر الثاني للربط')}else if(BFROM!==it.id){if(!BRD.edges)BRD.edges=[];if(!BRD.edges.some(e=>(e.from===BFROM&&e.to===it.id)||(e.from===it.id&&e.to===BFROM))){bSnap();BRD.edges.push({id:uid(),from:BFROM,to:it.id,color:'#f5a623'})}BFROM=null;BTMP=null;saveBoard();boardPaint();boardHint('تم الربط — اضغط عنصراً لربط جديد أو أوقف الوضع')}}
/* pointer gestures */
function bStartPinch(){const p=[...BPTRS.values()];BGEST={type:'pinch',d0:bDist(p[0],p[1])||1,z0:BRD.view.zoom,mid:bMid(p[0],p[1]),vx:BRD.view.x,vy:BRD.view.y}}
function boardPtrDown(e){
  if(BEDIT)return;
  // لا تُعامل الضغط على تولبار التعديل كضغط على اللوحة (يمنع إلغاء التحديد وإخفاء الأزرار)
  if(e.target&&e.target.closest&&e.target.closest('.bd-style'))return;
  const cv=document.getElementById('bd_canvas');BPTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(BPTRS.size===2){bStartPinch();return}
  if(BMODE==='draw'){const p=bWorldPt(e);bSnap();BCUR={id:uid(),type:'draw',stroke:BPEN.color,sw:BPEN.size,points:[[Math.round(p.x),Math.round(p.y)]]};BRD.items.push(BCUR);BGEST={type:'draw'};boardDrawEdges();return}
  const handle=e.target.closest?e.target.closest('.bd-handle'):null;
  const el=e.target.closest?e.target.closest('.bd-item'):null;
  if(handle&&el){const it=bItem(el.dataset.id);if(it){bSelectOnly(it.id);bSnap();BGEST={type:'resize',id:it.id,x:e.clientX,y:e.clientY,w0:it.w,h0:it.h,moved:true}}return}
  if(el){const it=bItem(el.dataset.id);if(!it)return;
    if(BMODE==='connect'){handleConnect(it);BGEST={type:'tap'};return}
    if(e.shiftKey)bToggleSel(it.id);else if(!BSEL.has(it.id))bSelectOnly(it.id);
    if(BSEL.has(it.id)){bSnap();BGEST={type:'drag',x:e.clientX,y:e.clientY,moved:false,items:[...BSEL].map(id=>({id,x:bItem(id).x,y:bItem(id).y}))}}
    return;
  }
  if(BMODE==='connect'){BFROM=null;BTMP=null;boardDrawEdges()}
  bDeselect();
  BGEST={type:'pan',x:e.clientX,y:e.clientY,vx:BRD.view.x,vy:BRD.view.y};
}
function boardPtrMove(e){
  if(BPTRS.has(e.pointerId))BPTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(BMODE==='connect'&&BFROM){BTMP=bWorldPt(e);boardDrawEdges()}
  if(!BGEST)return;const z=BRD.view.zoom;
  if(BGEST.type==='pinch'){const p=[...BPTRS.values()];if(p.length<2)return;const r=document.getElementById('bd_canvas').getBoundingClientRect();const nz=Math.min(3,Math.max(0.2,BGEST.z0*bDist(p[0],p[1])/BGEST.d0));const m=bMid(p[0],p[1]);const wx=(BGEST.mid.x-r.left-BGEST.vx)/BGEST.z0,wy=(BGEST.mid.y-r.top-BGEST.vy)/BGEST.z0;const v=BRD.view;v.zoom=nz;v.x=(m.x-r.left)-wx*nz;v.y=(m.y-r.top)-wy*nz;applyView();return}
  if(BGEST.type==='draw'){if(!BCUR)return;const p=bWorldPt(e);BCUR.points.push([Math.round(p.x),Math.round(p.y)]);boardDrawEdges();return}
  if(BGEST.type==='pan'){BRD.view.x=BGEST.vx+(e.clientX-BGEST.x);BRD.view.y=BGEST.vy+(e.clientY-BGEST.y);applyView();return}
  if(BGEST.type==='drag'){const dx=(e.clientX-BGEST.x)/z,dy=(e.clientY-BGEST.y)/z;if(Math.abs(e.clientX-BGEST.x)+Math.abs(e.clientY-BGEST.y)>3)BGEST.moved=true;BGEST.items.forEach(sn=>{const it=bItem(sn.id);if(!it)return;it.x=Math.round(sn.x+dx);it.y=Math.round(sn.y+dy);const el=bItemEl(it.id);if(el){el.style.left=it.x+'px';el.style.top=it.y+'px'}});boardDrawEdges();positionStyleBar();return}
  if(BGEST.type==='resize'){const dx=(e.clientX-BGEST.x)/z,dy=(e.clientY-BGEST.y)/z;const it=bItem(BGEST.id);if(!it)return;it.w=Math.max(40,Math.round(BGEST.w0+dx));it.h=Math.max(30,Math.round(BGEST.h0+dy));const el=bItemEl(it.id);if(el){el.style.width=it.w+'px';el.style.height=it.h+'px'}boardDrawEdges();positionStyleBar();return}
}
function boardPtrUp(e){
  BPTRS.delete(e.pointerId);
  if(BGEST){
    if(BGEST.type==='draw'){if(BCUR&&BCUR.points.length<2){BRD.items.pop()}BCUR=null;saveBoard()}
    else if((BGEST.type==='drag'&&BGEST.moved)||BGEST.type==='resize'){saveBoard()}
    else if(BGEST.type==='pan'){saveBoardView()}
  }
  if(BPTRS.size<2)BGEST=null;
}
function boardWheel(e){e.preventDefault();const r=document.getElementById('bd_canvas').getBoundingClientRect();const sx=e.clientX-r.left,sy=e.clientY-r.top,v=BRD.view;if(e.ctrlKey||e.metaKey){zoomAt(sx,sy,v.zoom*Math.exp(-e.deltaY*0.0016))}else{v.x-=e.deltaX;v.y-=e.deltaY;applyView()}saveBoardView()}
function boardCanvasDbl(e){if(BEDIT)return;if(e.target.closest('.bd-item'))return;if(BMODE!=='select')return;const p=bWorldPt(e);bSnap();const it=bMk('note',p.x-85,p.y-75);BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),20)}
function boardHint(t){const h=document.getElementById('bd_hint');if(!h)return;if(!t){h.classList.remove('show');return}h.textContent=t;h.classList.add('show');clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove('show'),2800)}
function boardKeys(e){if(CUR!=='boards'||!BRD||BEDIT)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA)$/.test(t.tagName))return;
  if(e.key==='Delete'||e.key==='Backspace'){if(BSEL.size){e.preventDefault();delSel()}}
  else if(e.key==='Escape'){if(BMODE!=='select')boardMode('select');else{bDeselect()}}
  else if((e.ctrlKey||e.metaKey)&&(e.key==='d'||e.key==='D')){e.preventDefault();if(BSEL.size)dupSel()}
  else if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')){e.preventDefault();boardUndo()}
  else if(e.key==='Tab'){if(BSEL.size===1){e.preventDefault();spawnChild([...BSEL][0])}}
}
function boardPaste(e){if(CUR!=='boards'||!BRD||BEDIT)return;const items=e.clipboardData&&e.clipboardData.items;if(!items)return;for(const it of items){if(it.type&&it.type.indexOf('image')===0){const f=it.getAsFile();if(f){e.preventDefault();boardUploadFile(f);return}}}}

function openModal(title,bodyHtml,onSave,onDelete){
  document.getElementById('modalRoot').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${title}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">${bodyHtml}</div>
    <div class="modal-foot"><button class="btn btn-gold" id="mSave">حفظ</button><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
    ${onDelete?'<button class="btn btn-ghost" style="color:var(--bad);margin-right:auto" id="mDel">حذف</button>':''}</div></div></div>`;
  document.getElementById('mSave').onclick=onSave;if(onDelete)document.getElementById('mDel').onclick=onDelete;refreshIcons();
}
function closeModal(){document.getElementById('modalRoot').innerHTML=''}
function applyBranding(){const sl=document.querySelector('.logo-area img');if(sl)sl.src=S.settings.logo||LOGO;applyTheme()}
function applyTheme(){const t=(S.settings&&S.settings.theme)||'dark';document.documentElement.setAttribute('data-theme',t)}
function setTheme(t){if(!S.settings)S.settings={};S.settings.theme=t;
  // لو الخلفية الحالية لا تناسب النظام الجديد، ارجع لـ«بدون» ليظهر لون النظام
  const w=S.settings.wallpaper;if(w&&w.type==='preset'){const p=WALLS.find(x=>x.key===w.key);if(p&&!!p.light!==(t==='light'))S.settings.wallpaper={type:'preset',key:'none'}}
  save();applyTheme();applyWallpaper();if(document.getElementById('wpBody'))wpRenderBody();if(CUR==='settings')renderSettings()}

;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: sb.auth.onAuthStateChange((event,session)=>{ */
function enterDemo(){
  WS_DEMO=true;const DK='ws_demo_v1';
  try{const r=localStorage.getItem(DK);S=r?deepMerge(JSON.parse(JSON.stringify(def)),JSON.parse(r)):JSON.parse(JSON.stringify(def))}catch(_){S=JSON.parse(JSON.stringify(def))}
  ws();
  if(!S.workspace.events.length){const t=today();S.workspace.events.push({id:uid(),title:'حملة الصيف',start:t,end:t,channel:'instagram',notes:'',image:''})}
  save=function(){try{localStorage.setItem(DK,JSON.stringify(S))}catch(_){}};
  const foot=document.querySelector('.nav-foot');if(foot)foot.style.display='none';
  const fab=document.querySelector('.fab-desk');if(fab)fab.style.display='none';
  const tg=document.querySelector('.logo-area .tagline');if(tg)tg.textContent='نسخة تجريبية — مساحة العمل';
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  renderNav();initSidebarShell();applyBranding();
  const dt=document.getElementById('ctDate');if(dt)dt.textContent=new Date().toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long'});
  go('workspace');
}
async function bootstrap(){
  const params=new URLSearchParams(location.search);
  if(params.get('demo')){return enterDemo()}
  const ft=params.get('ft');
  if(ft){return renderFreelancer(ft)}
  if(RECOVERY_MODE||/[#?&]type=recovery/.test(location.hash)||/[?&]type=recovery/.test(location.search)){RECOVERY_MODE=true;showReset();return}
  try{const {data}=await sb.auth.getSession();if(data&&data.session&&!RECOVERY_MODE){await enterApp(data.session.user);return}}catch(e){}
  const em=document.getElementById('em');if(em)em.focus();
}
// تحديد الرقم كاملاً عند التركيز ليُستبدل بالكتابة مباشرة (بدل المسح يدوياً)
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.match */
// شرائح سريعة لإضافة/تعيين المبالغ
function amtChip(inputId,val,mode){const el=document.getElementById(inputId);if(!el)return;const cur=Number(el.value||0);el.value=mode==='set'?val:(cur+val);el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}
function amtClear(inputId){const el=document.getElementById(inputId);if(el){el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}}
function amtChipsHTML(inputId,vals){return `<div class="amt-chips">${vals.map(v=>`<button type="button" onclick="amtChip('${inputId}',${v},'add')">+${v>=1000?(v/1000)+'k':v}</button>`).join('')}<button type="button" onclick="amtClear('${inputId}')">مسح</button></div>`}
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: bootstrap(); */
