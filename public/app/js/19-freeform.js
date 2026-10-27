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
const BPEN={color:'#f5a623',size:5,kind:'pen'};
const BPAL=['#ffd43b','#69db7c','#4dabf7','#ff8787','#b197fc','#ffa94d','#ff85c0','#63e6be','#ffffff','#ced4da'];
const BCOLS=['#ffd43b','#ffa94d','#ff8787','#ff85c0','#b197fc','#4dabf7','#63e6be','#69db7c','#f5a623','#ffffff','#ced4da','#868e96','#343a40','#1a1205'];
const BGRID=26;
const BTXT=new Set(['note','text','shape','table','link']);
// حالة اللوحة الإضافيّة — كائن خامل، قيمه تتغيّر وقت التشغيل فقط
const BX={redo:[],clip:null,clipNew:false,clipFired:false,style:null,space:false,edge:null,guides:null,dot:null,q:'',nudgeAt:0,pasteN:0,scenes:false,sceneI:null,anim:0,liveSnap:0};
const BSHAPES={rect:{n:'مستطيل',css:'border-radius:8px'},round:{n:'مربع مدوّر',css:'border-radius:22px'},ellipse:{n:'دائرة',css:'border-radius:50%'},pill:{n:'كبسولة',css:'border-radius:999px'},diamond:{n:'معيّن',css:'clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)'},triangle:{n:'مثلث',css:'clip-path:polygon(50% 3%,100% 100%,0 100%)'},pentagon:{n:'خماسي',css:'clip-path:polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)'},hex:{n:'سداسي',css:'clip-path:polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)'},para:{n:'متوازي',css:'clip-path:polygon(22% 0,100% 0,78% 100%,0 100%)'},star:{n:'نجمة',css:'clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},arrow:{n:'سهم',css:'clip-path:polygon(0 32%,58% 32%,58% 8%,100% 50%,58% 92%,58% 68%,0 68%)'},cloud:{n:'سحابة',css:'border-radius:50% 50% 50% 50%/60% 60% 40% 40%'}};
const BLINES={line:{n:'خط',ic:'minus'},arrow:{n:'سهم',ic:'move-right'},curve:{n:'منحنى',ic:'spline'}};
const BN={t:[0,-1],b:[0,1],l:[-1,0],r:[1,0]};

function ensureBoardStyles(){if(document.getElementById('bdCSS'))return;const st=document.createElement('style');st.id='bdCSS';st.textContent=`
  .bd-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  #main:fullscreen{background:var(--bg);padding:16px;overflow:auto}
  #main:-webkit-full-screen{background:var(--bg);padding:16px;overflow:auto}
  #main:fullscreen .bd-canvas{height:calc(100vh - 92px)}
  .bd-title{flex:0 1 220px;min-width:140px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;color:var(--ink);font-weight:700;font-size:15px}
  .bd-tools,.bd-zoom{display:flex;gap:3px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:4px;align-items:center}
  .bd-zoom{margin-inline-start:auto}
  .bd-tool{min-width:38px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--ink);border-radius:9px;cursor:pointer;padding:0 8px}
  .bd-tool:hover{background:var(--panel2)}
  .bd-tool.on{background:var(--gold);color:#1a1205}
  .bd-tool:disabled{opacity:.3;cursor:default;background:transparent}
  .bd-tool i{width:18px;height:18px}
  .bd-canvas{position:relative;overflow:hidden;height:calc(100vh - 172px);min-height:420px;background-color:var(--bd-bg);border:1px solid var(--line);border-radius:16px;background-image:radial-gradient(circle,var(--bd-dot) 1.3px,transparent 1.4px);touch-action:none;cursor:default;--bd-bg:#15151c;--bd-dot:rgba(150,150,165,.30);--bd-glass:rgba(26,26,32,.72);--bd-glass-bd:rgba(255,255,255,.14);--bd-glass-ink:#f2f2f5;--bd-glass-btn:rgba(255,255,255,.08);--bd-glass-btnh:rgba(255,255,255,.17)}
  .bd-canvas.bd-light{--bd-bg:#f3f4f8;--bd-dot:rgba(60,60,85,.26);--bd-glass:rgba(255,255,255,.78);--bd-glass-bd:rgba(0,0,0,.10);--bd-glass-ink:#1b1b24;--bd-glass-btn:rgba(0,0,0,.05);--bd-glass-btnh:rgba(0,0,0,.11)}
  .bd-canvas.bd-nogrid{background-image:none}
  .bd-world{position:absolute;top:0;left:0;width:0;height:0;transform-origin:0 0;--iz:1}
  .bd-edges{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
  .bd-hit{fill:none;stroke:transparent;stroke-linecap:round;stroke-linejoin:round}
  .bd-lbls,.bd-lhs{position:absolute;left:0;top:0;width:0;height:0}
  .bd-item{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;cursor:move;box-shadow:0 2px 12px rgba(0,0,0,.20)}
  .bd-item.nosh{box-shadow:none}
  .bd-item.t-note{border-radius:7px;padding:12px}
  .bd-item.t-text{background:transparent;box-shadow:none;padding:4px;border-radius:6px}
  .bd-item.t-shape{background:transparent!important;box-shadow:none;padding:10px}
  .bd-shp{position:absolute;inset:0;filter:drop-shadow(0 2px 6px rgba(0,0,0,.28));pointer-events:none}
  .bd-item.nosh .bd-shp{filter:none}
  .bd-fill{position:absolute;inset:0}
  .bd-item.t-shape .bd-txt{position:relative}
  .bd-item.t-image,.bd-item.t-table,.bd-item.t-link{padding:0}
  .bd-item.t-image{background:transparent;box-shadow:0 4px 16px rgba(0,0,0,.28)}
  .bd-item.t-link{border-radius:12px}
  .bd-item.t-table{border-radius:6px}
  .bd-clip{position:absolute;inset:0;overflow:hidden;border-radius:inherit}
  .bd-clip img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
  .bd-item.sel{outline:calc(2.5px * var(--iz)) solid var(--gold);outline-offset:calc(3px * var(--iz))}
  .bd-item.locked{cursor:default}
  .bd-txt{width:100%;line-height:1.35;word-break:break-word;white-space:pre-wrap;outline:none;overflow:hidden}
  .bd-txt.editing{cursor:text;user-select:text;-webkit-user-select:text;overflow:visible}
  .bd-txt:empty:before{content:attr(data-ph);opacity:.5}
  .bd-handle{position:absolute;width:calc(13px * var(--iz));height:calc(13px * var(--iz));background:#fff;border:calc(2px * var(--iz)) solid var(--gold);border-radius:50%;display:none;z-index:3;box-sizing:border-box}
  .h-nw{left:calc(-9px * var(--iz));top:calc(-9px * var(--iz));cursor:nwse-resize}
  .h-ne{right:calc(-9px * var(--iz));top:calc(-9px * var(--iz));cursor:nesw-resize}
  .h-sw{left:calc(-9px * var(--iz));bottom:calc(-9px * var(--iz));cursor:nesw-resize}
  .h-se{right:calc(-9px * var(--iz));bottom:calc(-9px * var(--iz));cursor:nwse-resize}
  .bd-item.sel .bd-handle{display:block}
  .bd-canvas.multi .bd-item.sel .bd-handle{display:none}
  .bd-dot{position:absolute;width:calc(18px * var(--iz));height:calc(18px * var(--iz));border-radius:50%;background:var(--gold);color:#1a1205;border:calc(2px * var(--iz)) solid #fff;display:none;align-items:center;justify-content:center;z-index:4;cursor:crosshair;box-sizing:border-box;font:900 calc(13px * var(--iz))/1 system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.3)}
  .bd-dot:after{content:'+'}
  .d-t{left:50%;top:calc(-34px * var(--iz));transform:translateX(-50%)}
  .d-b{left:50%;bottom:calc(-34px * var(--iz));transform:translateX(-50%)}
  .d-l{top:50%;left:calc(-34px * var(--iz));transform:translateY(-50%)}
  .d-r{top:50%;right:calc(-34px * var(--iz));transform:translateY(-50%)}
  .bd-canvas.one .bd-item.sel .bd-dot,.bd-canvas.dots .bd-item:not(.locked):hover .bd-dot{display:flex}
  .bd-canvas.mode-draw .bd-dot,.bd-canvas.mode-erase .bd-dot,.bd-canvas.mode-connect .bd-dot{display:none!important}
  .bd-lock{position:absolute;top:calc(-11px * var(--iz));right:calc(-11px * var(--iz));font-size:calc(12px * var(--iz));background:var(--panel);border-radius:50%;width:calc(22px * var(--iz));height:calc(22px * var(--iz));display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.3)}
  .bd-lh{position:absolute;width:calc(14px * var(--iz));height:calc(14px * var(--iz));margin:calc(-7px * var(--iz)) 0 0 calc(-7px * var(--iz));border-radius:50%;background:#fff;border:calc(2px * var(--iz)) solid var(--gold);cursor:move;box-sizing:border-box;z-index:5}
  .bd-elabel{position:absolute;transform:translate(-50%,-50%);background:var(--bd-bg);color:var(--bd-glass-ink);border:1px solid var(--bd-glass-bd);padding:3px 9px;border-radius:7px;font-size:13px;font-weight:700;white-space:pre;pointer-events:none;line-height:1.4;outline:none}
  .bd-elabel.editing{pointer-events:auto;outline:2px solid var(--gold);min-width:30px;cursor:text;user-select:text;-webkit-user-select:text}
  .bd-tbl{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}
  .bd-tbl td{border:1px solid rgba(0,0,0,.16);padding:4px 6px;text-align:center;vertical-align:middle;overflow:hidden;word-break:break-word;white-space:pre-wrap;line-height:1.3;outline:none}
  .bd-tbl tr:first-child td{font-weight:800;background:rgba(0,0,0,.05)}
  .bd-tbl td.editing{outline:2px solid var(--gold);outline-offset:-2px;cursor:text;user-select:text;-webkit-user-select:text}
  .bd-link{position:absolute;inset:0;border-radius:inherit;display:flex;align-items:center;gap:12px;padding:12px 14px;overflow:hidden;text-align:start}
  .bd-link .ic{flex:0 0 40px;height:40px;border-radius:10px;background:rgba(77,171,247,.16);color:#1c7ed6;display:flex;align-items:center;justify-content:center}
  .bd-link .ic i{width:20px;height:20px}
  .bd-link .tx{min-width:0;flex:1}
  .bd-link b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bd-link small{display:block;font-size:11px;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:left}
  .bd-marq{position:absolute;border:1px solid var(--gold);background:rgba(245,166,35,.10);pointer-events:none;z-index:6;border-radius:3px}
  .bd-float{position:absolute;z-index:20;display:flex;align-items:center;gap:2px;background:var(--bd-glass);-webkit-backdrop-filter:blur(20px) saturate(1.5);backdrop-filter:blur(20px) saturate(1.5);border:1px solid var(--bd-glass-bd);border-radius:12px;padding:4px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
  .bd-float .bd-tool{color:var(--bd-glass-ink);min-width:32px;height:30px;padding:0 6px}
  .bd-float .bd-tool:hover{background:var(--bd-glass-btnh)}
  .bd-float .bd-tool.on{background:var(--gold);color:#1a1205}
  .bd-float .bd-tool i{width:16px;height:16px}
  .bd-zf{left:14px;bottom:14px}
  .bd-vf{right:14px;bottom:14px}
  #bd_zlbl{font-weight:700;font-size:12px;min-width:50px}
  .bd-scenes{position:absolute;left:14px;bottom:62px;z-index:21;width:236px;max-height:55%;display:none;flex-direction:column;gap:8px;background:var(--bd-glass);-webkit-backdrop-filter:blur(20px) saturate(1.5);backdrop-filter:blur(20px) saturate(1.5);border:1px solid var(--bd-glass-bd);border-radius:14px;padding:10px;color:var(--bd-glass-ink);box-shadow:0 12px 34px rgba(0,0,0,.34)}
  .bd-scenes.show{display:flex}
  .bd-scenes .hd{display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:13px}
  .bd-scenes .hd button{background:none;border:none;color:inherit;cursor:pointer;opacity:.6;font-size:18px;line-height:1}
  .bd-scenes .ls{overflow:auto;display:flex;flex-direction:column;gap:4px}
  .bd-sc{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:9px;background:var(--bd-glass-btn);cursor:pointer;font-size:13px;font-weight:700}
  .bd-sc:hover{background:var(--bd-glass-btnh)}
  .bd-sc.on{outline:1.5px solid var(--gold)}
  .bd-sc .n{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bd-sc .k{opacity:.5;font-size:11px;min-width:14px}
  .bd-sc button{background:none;border:none;color:inherit;opacity:.5;cursor:pointer;padding:0 2px;font-size:14px}
  .bd-sc button:hover{opacity:1}
  .bd-scenes .em{font-size:12px;opacity:.65;line-height:1.6}
  .bd-scenes .ft{display:flex;gap:4px}
  .bd-scenes .bd-act{flex:1;justify-content:center;height:30px;background:var(--bd-glass-btn);border:1px solid var(--bd-glass-bd);color:var(--bd-glass-ink)}
  .bd-style{display:none;position:absolute;z-index:30;left:50%;top:12px;transform:translateX(-50%);align-items:center;gap:5px;flex-wrap:nowrap;max-width:calc(100% - 20px);overflow-x:auto;background:var(--bd-glass);-webkit-backdrop-filter:blur(20px) saturate(1.5);backdrop-filter:blur(20px) saturate(1.5);border:1px solid var(--bd-glass-bd);border-radius:14px;padding:6px 8px;box-shadow:0 12px 34px rgba(0,0,0,.34),0 2px 8px rgba(0,0,0,.22);scrollbar-width:none}
  .bd-style::-webkit-scrollbar{display:none}
  .bd-style .bd-lbl{color:var(--bd-glass-ink);opacity:.6}
  .bd-style .bd-sep{background:var(--bd-glass-bd)}
  .bd-style .bd-act{background:var(--bd-glass-btn);border:1px solid var(--bd-glass-bd);color:var(--bd-glass-ink)}
  .bd-style .bd-act:hover{background:var(--bd-glass-btnh)}
  .bd-style .bd-act.on{background:var(--gold);color:#1a1205;border-color:var(--gold)}
  .bd-style .bd-act.del{color:#ff6b6b}
  .bd-style .bd-sw{border:2px solid var(--bd-glass-bd)}
  .bd-style .bd-size{background:var(--bd-glass-btn);border:1px solid var(--bd-glass-bd)}
  .bd-style .bd-size.on{border-color:var(--gold)}
  .bd-style .bd-size span{background:var(--bd-glass-ink)}
  .bd-lbl{font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap}
  .bd-sw{width:24px;height:24px;border-radius:7px;border:2px solid var(--line);cursor:pointer;padding:0;flex:0 0 auto}
  .bd-swb{width:26px;height:26px;border-radius:50%}
  .bd-none{background:repeating-conic-gradient(#c8c8c8 0 25%,#fff 0 50%) 0 0/8px 8px!important}
  .bd-sep{width:1px;height:22px;background:var(--line);margin:0 3px;flex:0 0 auto}
  .bd-act{display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 9px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);cursor:pointer;font-weight:700;font-size:13px;white-space:nowrap;flex:0 0 auto}
  .bd-act i{width:15px;height:15px}
  .bd-act.del{color:var(--bad)}
  .bd-act.on{background:var(--gold);color:#1a1205;border-color:var(--gold)}
  .bd-size{width:32px;height:32px;border:1px solid var(--line);background:var(--panel2);border-radius:9px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto}
  .bd-size.on{border-color:var(--gold)}
  .bd-size span{background:var(--ink);border-radius:50%;display:block}
  .bd-hint{position:absolute;left:50%;bottom:66px;transform:translateX(-50%);background:rgba(0,0,0,.76);color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;pointer-events:none;opacity:0;transition:.2s;z-index:25;white-space:nowrap;max-width:calc(100% - 30px);overflow:hidden;text-overflow:ellipsis}
  .bd-hint.show{opacity:1}
  .bd-pop{position:fixed;z-index:1300;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px;box-shadow:0 14px 40px rgba(0,0,0,.45);color:var(--ink);max-width:calc(100vw - 16px)}
  .bd-pop .g{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
  .bd-pop .g3{grid-template-columns:repeat(3,1fr)}
  .bd-pop .g7{grid-template-columns:repeat(7,1fr);gap:7px}
  .bd-pb{min-width:62px;height:54px;border:1px solid var(--line);background:var(--panel2);border-radius:10px;color:var(--ink);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10.5px;font-weight:700;padding:0 4px}
  .bd-pb:hover{border-color:var(--gold)}
  .bd-pb.on{border-color:var(--gold);background:rgba(245,166,35,.14)}
  .bd-pb i{width:18px;height:18px}
  .bd-pop .t{font-size:11px;font-weight:800;color:var(--muted);margin:10px 2px 6px}
  .bd-pop .t:first-child{margin-top:0}
  .bd-pop .sw{width:28px;height:28px;border-radius:50%;border:2px solid var(--line);cursor:pointer;padding:0}
  .bd-pop .sw:hover{transform:scale(1.1)}
  .bd-pop .row{display:flex;gap:6px;align-items:center;margin-top:10px}
  .bd-pop input[type=color]{width:100%;height:32px;border:1px solid var(--line);border-radius:8px;background:none;cursor:pointer;padding:2px}
  .bd-plist{display:flex;flex-direction:column;gap:2px;margin-top:8px;min-width:220px}
  .bd-plist button{display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--ink);padding:8px 10px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;text-align:start}
  .bd-plist button:hover{background:var(--panel2)}
  .bd-plist button i{width:16px;height:16px}
  .bd-plist kbd{margin-inline-start:auto;font:11px system-ui,sans-serif;color:var(--muted)}
  .bd-mini{width:22px;height:18px;background:var(--gold2);display:block}
  .bd-lb{position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:24px}
  .bd-lb img{max-width:100%;max-height:100%;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .bd-peers{display:flex;align-items:center}
  .bd-peer{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#1a1205;border:2px solid var(--bg);margin-inline-start:-6px;background:var(--panel2)}
  .bd-shst{font-size:12px;color:var(--muted);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
  .bd-shst:empty{display:none}
  .bd-peer-cur{position:absolute;pointer-events:none;z-index:40;transform:scale(var(--iz));transform-origin:0 0;transition:left .08s linear,top .08s linear}
  .bd-peer-cur span{position:absolute;left:14px;top:12px;white-space:nowrap;font:700 11px system-ui,sans-serif;color:#1a1205;padding:2px 7px;border-radius:7px}
  .bd-lhead{display:flex;gap:8px;margin:0 0 14px;flex-wrap:wrap}
  .bd-search{flex:1;min-width:180px;max-width:360px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;color:var(--ink)}
  .bd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
  .bd-card{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;transition:.15s}
  .bd-card:hover{border-color:var(--gold);transform:translateY(-2px)}
  .bd-thumb{height:118px;background:var(--panel2);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);overflow:hidden}
  .bd-thumb-empty{color:var(--muted)}
  .bd-card-ft{padding:10px 12px}
  .bd-card-nm{font-weight:800}
  .bd-card-meta{font-size:12px;color:var(--muted);margin-top:2px}
  .bd-card-x{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.55);border:none;color:#fff;width:30px;height:30px;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .bd-card-x i{width:15px;height:15px}
  .bd-card-x.dup{left:44px;opacity:0;transition:.15s}
  .bd-card:hover .bd-card-x.dup{opacity:1}
`;document.head.appendChild(st)}

/* ---------- قائمة اللوحات ---------- */
function boardWhen(b){return ageLabel(b.updated||b.created||today())}
function bBox(i){
  if(i.type==='line')return{x:Math.min(i.x1,i.x2),y:Math.min(i.y1,i.y2),w:Math.abs(i.x2-i.x1),h:Math.abs(i.y2-i.y1)};
  if(i.type==='draw'){let a=1/0,b=1/0,c=-1/0,d=-1/0;(i.points||[]).forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});return a===1/0?{x:0,y:0,w:0,h:0}:{x:a,y:b,w:c-a,h:d-b}}
  return{x:i.x,y:i.y,w:i.w,h:i.h}}
function bUnion(bs){let a=1/0,b=1/0,c=-1/0,d=-1/0;bs.forEach(r=>{a=Math.min(a,r.x);b=Math.min(b,r.y);c=Math.max(c,r.x+r.w);d=Math.max(d,r.y+r.h)});return{x:a,y:b,w:c-a,h:d-b}}
function bVisible(i){return i.type==='draw'?(i.points||[]).length>1:i.type==='line'?true:!!i.w}
function boardThumb(b){
  const items=(b.items||[]).filter(bVisible);
  if(!items.length)return '<div class="bd-thumb-empty"><i data-lucide="shapes"></i></div>';
  const bb=bUnion(items.map(bBox)),w=Math.max(1,bb.w),h=Math.max(1,bb.h),sw=Math.max(w,h)/90,by={};items.forEach(i=>by[i.id]=i);
  return `<svg viewBox="${bb.x-20} ${bb.y-20} ${w+40} ${h+40}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">
    ${(b.edges||[]).map(e=>{const a=by[e.from],c=by[e.to];if(!a||!c||!a.w||!c.w)return '';return `<line x1="${a.x+a.w/2}" y1="${a.y+a.h/2}" x2="${c.x+c.w/2}" y2="${c.y+c.h/2}" stroke="${e.color||'#8a8a99'}" stroke-width="${sw}"/>`}).join('')}
    ${items.map(i=>i.type==='draw'?`<polyline points="${i.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${i.stroke}" stroke-width="${Math.max(i.sw,sw)}" opacity="${i.op||1}"/>`:i.type==='line'?`<line x1="${i.x1}" y1="${i.y1}" x2="${i.x2}" y2="${i.y2}" stroke="${i.stroke}" stroke-width="${Math.max(i.sw,sw)}"/>`:`<rect x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}" rx="${i.shape==='ellipse'||i.shape==='pill'?Math.min(i.w,i.h)/2:sw*2}" fill="${i.type==='image'?'#6c757d':i.type==='text'?(i.fill&&i.fill!=='transparent'?i.fill:'#8a8a99'):(i.fill||'#4dabf7')}" opacity=".92"/>`).join('')}
  </svg>`;
}
function bBoardCards(){
  const q=(BX.q||'').trim().toLowerCase();
  const list=S.boards.filter(b=>!q||(b.name||'').toLowerCase().includes(q)).sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
  if(!S.boards.length)return emptyBox('git-fork','لا توجد خرائط بعد. أنشئ لوحتك الأولى.');
  if(!list.length)return `<div class="bd-card-meta">لا توجد لوحة باسم «${esc(BX.q)}»</div>`;
  return `<div class="bd-cards">${list.map(b=>`
     <div class="bd-card" onclick="openBoard('${b.id}')">
       <div class="bd-thumb">${boardThumb(b)}</div>
       <div class="bd-card-ft"><div class="bd-card-nm">${esc(b.name||'بدون عنوان')}</div>
         <div class="bd-card-meta">${b.share?'<i class="inl" data-lucide="users"></i> مشتركة · ':''}${(b.items||[]).length} عنصر${(b.scenes||[]).length?' · '+b.scenes.length+' مشهد':''} · ${boardWhen(b)}</div></div>
       <button class="bd-card-x" title="حذف" onclick="event.stopPropagation();delBoard('${b.id}')"><i data-lucide="trash-2"></i></button>
       <button class="bd-card-x dup" title="تكرار اللوحة" onclick="event.stopPropagation();dupBoard('${b.id}')"><i data-lucide="copy"></i></button>
     </div>`).join('')}</div>`;
}
function renderBoards(){
  ensureBoardStyles();if(!Array.isArray(S.boards))S.boards=[];bShStop();BRD=null;bClosePop();
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الخرائط الذهنية واللوحات</h1><div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" title="استيراد لوحات (ملف من محوّل Freeform أو نسخة احتياطيّة)" onclick="document.getElementById('bd_imp').click()"><i data-lucide="upload"></i> استيراد</button>
      <input type="file" id="bd_imp" accept=".json,application/json" multiple class="hidden" onchange="boardImportFiles(event)">
      <button class="btn btn-ghost" onclick="newBoard()"><i data-lucide="square-dashed"></i> لوحة فارغة</button>
      <button class="btn btn-gold" onclick="newBoard('mind')"><i data-lucide="git-fork"></i> خريطة ذهنية</button></div></div>
    <div class="badge-note"><i data-lucide="git-fork"></i> <div>لوحة حرّة لا نهائية على طريقة <b>Freeform</b>: ملاحظات وأشكال ونصوص وجداول وروابط وصور ورسم حرّ، وخطوط ربط بأسهم وتسميات، ومحاذاة ذكية، ومشاهد للعرض. للخرائط الذهنية: <b>Tab</b> فرع جديد، <b>Shift+Tab</b> فرع شقيق، و«ترتيب» يرتّب الخريطة تلقائياً.</div></div>
    ${S.boards.length>3?`<div class="bd-lhead"><input class="bd-search" placeholder="ابحث في اللوحات…" value="${esc(BX.q||'')}" oninput="BX.q=this.value;document.getElementById('bd_list').innerHTML=bBoardCards();refreshIcons()"></div>`:''}
    <div id="bd_imp_st" class="bd-card-meta" style="margin:-4px 0 12px"></div>
    <div id="bd_list">${bBoardCards()}</div>`;
  refreshIcons();
}
function newBoard(kind){
  if(!Array.isArray(S.boards))S.boards=[];
  const b={id:uid(),name:kind==='mind'?'خريطة ذهنية':'لوحة جديدة',created:today(),updated:today(),items:[],edges:[],view:{x:0,y:0,zoom:1}};
  if(kind==='mind')b.items.push({id:uid(),type:'shape',shape:'pill',x:-120,y:-42,w:240,h:84,z:1,text:'الفكرة الرئيسية',fill:'#f5a623',color:'#1a1205',fontSize:22,bold:true});
  S.boards.push(b);save();openBoard(b.id);
  const r=document.getElementById('bd_canvas').getBoundingClientRect();b.view={x:r.width/2,y:r.height/2,zoom:1};applyView();
  if(kind==='mind'){bSelectOnly(b.items[0].id);boardHint('Tab لفرع جديد · Shift+Tab لفرع شقيق · انقر مزدوجاً للكتابة')}
}
/* ---------- الاستيراد (من Freeform عبر المحوّل، أو نسخة احتياطيّة) ---------- */
// الملف: {format:'ibrahimsaud-boards',boards:[…]} — اللوحة المستوردة سابقاً (نفس src.hash) تُتخطّى،
// فإعادة الاستيراد آمنة. صور data: تُرفع للتخزين عند الدخول الفعلي بدل حشوها في بيانات النظام.
const BIMP_TYPES=new Set(['note','text','shape','image','table','link','line','draw']);
function bImpClean(b){const str=v=>typeof v==='string'?v.slice(0,5000):'';const num=v=>Number.isFinite(+v)?Math.round(+v):0;const col=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:undefined;
  const items=(Array.isArray(b.items)?b.items:[]).filter(i=>i&&BIMP_TYPES.has(i.type)).map(i=>{const o={id:str(i.id)||uid(),type:i.type,z:num(i.z)};
    if(i.type==='draw'){o.stroke=col(i.stroke)||'#f5a623';o.sw=Math.max(1,num(i.sw));o.points=(Array.isArray(i.points)?i.points:[]).slice(0,5000).map(p=>[num(p[0]),num(p[1])]);if(i.op)o.op=+i.op||1;return o}
    if(i.type==='line'){['x1','y1','x2','y2','sw'].forEach(k=>o[k]=num(i[k]));o.stroke=col(i.stroke)||'#f5a623';return o}
    ['x','y','w','h'].forEach(k=>o[k]=num(i[k]));o.w=Math.max(20,o.w);o.h=Math.max(16,o.h);
    if(i.type==='image'){const u=str(i.url).length?i.url:'';o.url=/^(data:image\/(png|jpe?g|webp|gif);base64,|https:\/\/)/i.test(u)?u:'';o.radius=num(i.radius);return o.url?o:null}
    if(i.type==='link'){o.url=/^https?:\/\//i.test(i.url||'')?str(i.url):'';o.title=str(i.title);return o}
    o.text=str(i.text);if(i.type==='shape')o.shape=BSHAPES[i.shape]?i.shape:'rect';if(col(i.fill))o.fill=i.fill;if(col(i.color))o.color=i.color;if(i.fontSize)o.fontSize=Math.max(10,Math.min(96,num(i.fontSize)));if(i.bold!=null)o.bold=!!i.bold;
    if(i.type==='table')o.rows=(Array.isArray(i.rows)?i.rows:[['']]).map(r=>(Array.isArray(r)?r:['']).map(str));return o}).filter(Boolean);
  const ids=new Set(items.map(i=>i.id));
  const edges=(Array.isArray(b.edges)?b.edges:[]).filter(e=>e&&ids.has(e.from)&&ids.has(e.to)).map(e=>({id:str(e.id)||uid(),from:e.from,to:e.to,color:col(e.color)||'#f5a623'}));
  return {id:uid(),name:str(b.name)||'لوحة مستوردة',created:today(),updated:today(),items,edges,view:{x:0,y:0,zoom:1},src:b.src&&typeof b.src==='object'?{app:str(b.src.app),name:str(b.src.name),hash:str(b.src.hash)}:undefined}}
async function bImpUploadImages(b,st){if(WS_DEMO||!USER)return;const imgs=b.items.filter(i=>i.type==='image'&&i.url.startsWith('data:'));let k=0;
  for(const it of imgs){k++;st(`«${b.name}»: رفع الصور ${k}/${imgs.length}…`);try{const bl=await (await fetch(it.url)).blob();const ext=bl.type==='image/png'?'png':'jpg';const path=`${USER.id}/boards/${uid()}.${ext}`;
    const {error}=await sb.storage.from('task-images').upload(path,bl,{upsert:false,contentType:bl.type});if(!error)it.url=sb.storage.from('task-images').getPublicUrl(path).data.publicUrl}catch(_){}}}
async function boardImportFiles(ev){const fs=[...(ev.target.files||[])];ev.target.value='';if(!fs.length)return;if(!Array.isArray(S.boards))S.boards=[];
  const el=document.getElementById('bd_imp_st'),st=t=>{if(el)el.textContent=t};let added=0,skipped=0,bad=0;
  for(const f of fs){let d;try{d=JSON.parse(await f.text())}catch(_){bad++;continue}
    const list=Array.isArray(d&&d.boards)?d.boards:(d&&Array.isArray(d.items)?[d]:null);if(!list){bad++;continue}
    for(const raw of list){const b=bImpClean(raw);if(b.src&&b.src.hash&&S.boards.some(x=>x.src&&x.src.hash===b.src.hash)){skipped++;continue}
      st(`استيراد «${b.name}»…`);await bImpUploadImages(b,st);if(!b.src)delete b.src;S.boards.push(b);added++;save()}}
  renderBoards();const e2=document.getElementById('bd_imp_st');if(e2)e2.textContent=`اكتمل الاستيراد: ${added} لوحة جديدة${skipped?` · ${skipped} مستوردة سابقاً (تُركت كما هي)`:''}${bad?` · ${bad} ملف غير صالح`:''}`}
function dupBoard(id){const s=(S.boards||[]).find(b=>b.id===id);if(!s)return;const b=JSON.parse(JSON.stringify(s));delete b.share;b.id=uid();b.name=(s.name||'لوحة')+' (نسخة)';b.created=b.updated=today();S.boards.push(b);save();renderBoards()}
function delBoard(id){const sb0=(S.boards||[]).find(b=>b.id===id);if(!confirm(sb0&&sb0.share?'حذف هذه اللوحة نهائياً؟ رابط مشاركتها يتوقّف أيضاً.':'حذف هذه اللوحة نهائياً؟'))return;if(sb0&&sb0.share&&USER)sb.from('shared_boards').delete().eq('id',sb0.share.id).then(()=>{});S.boards=(S.boards||[]).filter(b=>b.id!==id);save();renderBoards()}

/* ---------- فتح اللوحة ---------- */
function openBoard(id){
  ensureBoardStyles();BRD=(S.boards||[]).find(b=>b.id===id);if(!BRD){renderBoards();return}
  if(!BRD.view)BRD.view={x:0,y:0,zoom:1};if(!BRD.items)BRD.items=[];if(!BRD.edges)BRD.edges=[];
  BSEL=new Set();BMODE='select';BFROM=null;BTMP=null;BGEST=null;BEDIT=false;BCUR=null;BUNDO=[];BPTRS.clear();
  BX.redo=[];BX.edge=null;BX.guides=null;BX.dot=null;BX.scenes=false;BX.sceneI=null;if(!BSH.guest)bShStop();
  document.getElementById('main').innerHTML=`
    <div class="bd-top">
      ${BSH.guest?'':`<button class="btn btn-ghost btn-sm" onclick="renderBoards()"><i data-lucide="arrow-right"></i> اللوحات</button>`}
      <input class="bd-title" id="bd_title" value="${esc(BRD.name||'')}" ${BSH.guest?'readonly':'oninput="boardRename(this.value)"'} placeholder="اسم اللوحة">
      ${BSH.ro?'':`<div class="bd-tools">
        <button class="bd-tool" id="bd_sel" title="تحديد (V)" onclick="boardMode('select')"><i data-lucide="mouse-pointer-2"></i></button>
        <span class="bd-sep"></span>
        <button class="bd-tool" title="ملاحظة لاصقة (N)" onclick="addNote()"><i data-lucide="sticky-note"></i></button>
        <button class="bd-tool" title="نص (T)" onclick="addText()"><i data-lucide="type"></i></button>
        <button class="bd-tool" title="أشكال وخطوط" onclick="boardShapeMenu(this)"><i data-lucide="shapes"></i></button>
        <button class="bd-tool" title="جدول" onclick="addTable()"><i data-lucide="table"></i></button>
        <button class="bd-tool" title="صورة" onclick="document.getElementById('bd_img').click()"><i data-lucide="image"></i></button>
        <button class="bd-tool" title="رابط" onclick="addLink()"><i data-lucide="link"></i></button>
        <span class="bd-sep"></span>
        <button class="bd-tool" id="bd_pen" title="رسم حرّ (P)" onclick="boardMode('draw')"><i data-lucide="pencil"></i></button>
        <button class="bd-tool" id="bd_conn" title="ربط العناصر (C)" onclick="boardMode('connect')"><i data-lucide="spline"></i></button>
        <input type="file" id="bd_img" accept="image/*" multiple class="hidden" onchange="boardUpload(event)">
      </div>`}
      <div class="bd-peers" id="bd_peers"></div><span class="bd-shst" id="bd_shst"></span>
      <div class="bd-zoom">
        ${BSH.guest?'':`<button class="bd-tool${BRD.share?' on':''}" title="مشاركة الخريطة برابط" onclick="boardShareMenu()"><i data-lucide="users"></i></button><span class="bd-sep"></span>`}
        <button class="bd-tool" id="bd_undo" title="تراجع (⌘Z)" onclick="boardUndo()"><i data-lucide="undo-2"></i></button>
        <button class="bd-tool" id="bd_redo" title="إعادة (⇧⌘Z)" onclick="boardRedo()"><i data-lucide="redo-2"></i></button>
        <span class="bd-sep"></span>
        <button class="bd-tool" id="bd_theme" title="الوضع الفاتح/الداكن" onclick="boardToggleTheme()"><i data-lucide="sun-moon"></i></button>
        <button class="bd-tool" id="bd_full" title="ملء الشاشة" onclick="boardFullscreen()"><i data-lucide="maximize"></i></button>
      </div>
    </div>
    <div class="bd-canvas" id="bd_canvas" dir="ltr">
      <div class="bd-world" id="bd_world"><svg class="bd-edges" id="bd_svg"></svg><div class="bd-lbls" id="bd_lbls"></div><div class="bd-lhs" id="bd_lhs"></div></div>
      <div class="bd-style" id="bd_style" dir="rtl"></div>
      <div class="bd-float bd-zf">
        <button class="bd-tool" title="تصغير" onclick="boardZoom(-1)"><i data-lucide="minus"></i></button>
        <button class="bd-tool" id="bd_zlbl" title="خيارات التكبير" onclick="boardZoomMenu(this)">100%</button>
        <button class="bd-tool" title="تكبير" onclick="boardZoom(1)"><i data-lucide="plus"></i></button>
        <span class="bd-sep"></span>
        <button class="bd-tool" id="bd_scbtn" title="المشاهد" onclick="boardScenesToggle()"><i data-lucide="clapperboard"></i></button>
      </div>
      <div class="bd-float bd-vf">
        <button class="bd-tool" id="bd_fdots" title="إظهار نقاط الربط عند المرور" onclick="boardFlag('dots')"><i data-lucide="workflow"></i></button>
        <button class="bd-tool" id="bd_fsnap" title="الالتقاط للشبكة" onclick="boardFlag('snap')"><i data-lucide="magnet"></i></button>
        <button class="bd-tool" id="bd_fgrid" title="الشبكة" onclick="boardFlag('grid')"><i data-lucide="grid-3x3"></i></button>
      </div>
      <div class="bd-scenes" id="bd_scenes" dir="rtl"></div>
      <div class="bd-hint" id="bd_hint" dir="rtl"></div>
    </div>`;
  const cv=document.getElementById('bd_canvas');
  try{if(localStorage.getItem('bd_theme')==='light')cv.classList.add('bd-light')}catch(_){}
  cv.addEventListener('wheel',boardWheel,{passive:false});
  cv.addEventListener('pointerdown',boardPtrDown);
  cv.addEventListener('pointermove',boardPtrMove);
  cv.addEventListener('pointerup',boardPtrUp);
  cv.addEventListener('pointercancel',boardPtrUp);
  cv.addEventListener('dblclick',boardCanvasDbl);
  cv.addEventListener('dragover',boardDragOver);
  cv.addEventListener('drop',boardDrop);
  if(!window.__bdInit){window.__bdInit=1;document.addEventListener('keydown',boardKeys);document.addEventListener('keyup',boardKeyUp);document.addEventListener('paste',boardPaste);document.addEventListener('copy',boardCopyEvt);document.addEventListener('cut',boardCopyEvt);window.addEventListener('blur',()=>{BX.space=false;if(BX.clip&&!BX.clipFired)BX.clip=null})}
  if(!window.__bdFs){window.__bdFs=1;document.addEventListener('fullscreenchange',()=>{const ic=document.querySelector('#bd_full i,#bd_full svg');if(ic){const n=document.createElement('i');n.setAttribute('data-lucide',document.fullscreenElement?'minimize':'maximize');ic.replaceWith(n);refreshIcons()}});}
  bApplyFlags();boardPaint();boardHint(BSH.ro?'مشاهدة فقط — اسحب للتنقّل وقرّب بالعجلة':'انقر مزدوجاً لإضافة ملاحظة · اسحب لتحديد عدّة عناصر · مسافة+سحب للتنقّل');
  if(!BSH.guest&&BRD.share)bShOpenOwner();
}

/* ---------- أدوات مساعدة ---------- */
function bItem(id){return (BRD.items||[]).find(i=>i.id===id)}
function bItemEl(id){return document.querySelector('.bd-item[data-id="'+CSS.escape(id)+'"]')}
function bEdge(id){return (BRD.edges||[]).find(e=>e.id===id)}
function bCenter(i){return{x:i.x+i.w/2,y:i.y+i.h/2}}
function bDist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function bMid(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function bAutoText(f){if(!f||f==='transparent'||String(f).startsWith('var'))return 'var(--bd-glass-ink)';const h=f.replace('#','');if(h.length<6)return '#111';const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (r*299+g*587+b*114)/1000>150?'#1a1205':'#fff'}
function bInk(it){const f=it.type==='text'?(it.fill||'transparent'):(it.fill||'#ffd43b');const c=it.color;return !c||c==='var(--ink)'?bAutoText(f):c}
function bNextZ(){return (BRD.items.length?Math.max.apply(null,BRD.items.map(i=>i.z||0)):0)+1}
function bSelItems(){return [...BSEL].map(bItem).filter(Boolean)}
function bShift(i,dx,dy){if(i.type==='line'){i.x1=Math.round(i.x1+dx);i.x2=Math.round(i.x2+dx);i.y1=Math.round(i.y1+dy);i.y2=Math.round(i.y2+dy)}else if(i.type==='draw'){i.points=i.points.map(p=>[Math.round(p[0]+dx),Math.round(p[1]+dy)])}else{i.x=Math.round(i.x+dx);i.y=Math.round(i.y+dy)}}
function bTouch(){if(BRD)BRD.updated=today()}
function saveBoard(){bTouch();save();if(BSH.token)bShQueue()}
function saveBoardView(){clearTimeout(BVT);BVT=setTimeout(save,400)}
function bState(){return JSON.stringify({items:BRD.items,edges:BRD.edges})}
function bPushPre(pre){BUNDO.push(pre);if(BUNDO.length>60)BUNDO.shift();BX.redo=[];bUndoUI()}
function bSnap(){try{bPushPre(bState())}catch(_){}}
function bUndoUI(){const u=document.getElementById('bd_undo'),r=document.getElementById('bd_redo');if(u)u.disabled=!BUNDO.length;if(r)r.disabled=!BX.redo.length}
function bRestore(s){const o=JSON.parse(s);BRD.items=o.items;BRD.edges=o.edges;BSEL=new Set([...BSEL].filter(id=>BRD.items.some(i=>i.id===id)));BX.edge=null;saveBoard();boardPaint()}
function boardUndo(){if(!BUNDO.length)return;BX.redo.push(bState());bRestore(BUNDO.pop())}
function boardRedo(){if(!BX.redo.length)return;BUNDO.push(bState());bRestore(BX.redo.pop())}
function boardRename(v){if(BRD){BRD.name=v;bTouch();saveBoardView();if(BSH.token)bShQueue()}}

/* ---------- العرض والتكبير ---------- */
function applyView(){const w=document.getElementById('bd_world'),cv=document.getElementById('bd_canvas');if(!w||!BRD)return;const v=BRD.view;w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.zoom})`;w.style.setProperty('--iz',(1/v.zoom).toFixed(4));const l=document.getElementById('bd_zlbl');if(l)l.textContent=Math.round(v.zoom*100)+'%';if(cv){cv.style.backgroundSize=(BGRID*v.zoom)+'px '+(BGRID*v.zoom)+'px';cv.style.backgroundPosition=v.x+'px '+v.y+'px'}}
function bWorldFromScreen(sx,sy){return{x:(sx-BRD.view.x)/BRD.view.zoom,y:(sy-BRD.view.y)/BRD.view.zoom}}
function bWorldPt(e){const r=document.getElementById('bd_canvas').getBoundingClientRect();return bWorldFromScreen(e.clientX-r.left,e.clientY-r.top)}
function bCanvasRect(){return document.getElementById('bd_canvas').getBoundingClientRect()}
function bViewCenter(){const r=bCanvasRect();return bWorldFromScreen(r.width/2,r.height/2)}
function zoomAt(sx,sy,nz){nz=Math.min(4,Math.max(0.1,nz));const v=BRD.view;const wx=(sx-v.x)/v.zoom,wy=(sy-v.y)/v.zoom;v.zoom=nz;v.x=sx-wx*nz;v.y=sy-wy*nz;applyView()}
function boardZoom(d){const r=bCanvasRect();zoomAt(r.width/2,r.height/2,BRD.view.zoom*(d>0?1.2:1/1.2));saveBoardView()}
function bZoomTo(z){const r=bCanvasRect(),c=bViewCenter();bAnimView({zoom:z,x:r.width/2-c.x*z,y:r.height/2-c.y*z})}
function bAnimView(t,ms){ms=ms||380;const v=BRD.view,s={x:v.x,y:v.y,zoom:v.zoom},t0=performance.now(),id=++BX.anim,b=BRD;
  const step=now=>{if(id!==BX.anim||BRD!==b)return;const k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);v.x=s.x+(t.x-s.x)*e;v.y=s.y+(t.y-s.y)*e;v.zoom=s.zoom+(t.zoom-s.zoom)*e;applyView();if(k<1)requestAnimationFrame(step);else saveBoardView()};requestAnimationFrame(step)}
function bFitBox(bb,maxZ){const r=bCanvasRect(),pad=70,z=Math.min(maxZ||1.6,Math.max(0.1,Math.min(r.width/(bb.w+pad*2),r.height/(bb.h+pad*2))));return{zoom:z,x:r.width/2-(bb.x+bb.w/2)*z,y:r.height/2-(bb.y+bb.h/2)*z}}
function boardFit(){const its=(BRD.items||[]).filter(bVisible),r=bCanvasRect();if(!its.length){bAnimView({x:r.width/2,y:r.height/2,zoom:1});return}bAnimView(bFitBox(bUnion(its.map(bBox))))}
function boardZoomSel(){const its=bSelItems();if(!its.length)return boardFit();bAnimView(bFitBox(bUnion(its.map(bBox)),2.5))}
function boardActual(){bZoomTo(1)}
function boardZoomMenu(btn){bPop(btn,`<div class="g g3">${[.5,1,2].map(z=>`<button class="bd-pb" onclick="bClosePop();bZoomTo(${z})"><b style="font-size:14px">${z*100}%</b></button>`).join('')}</div>
  <div class="bd-plist"><button onclick="bClosePop();boardFit()"><i data-lucide="maximize-2"></i> ملاءمة المحتوى <kbd>⌘1</kbd></button>
  <button onclick="bClosePop();boardActual()"><i data-lucide="scan"></i> الحجم الفعلي <kbd>⌘0</kbd></button>
  <button onclick="bClosePop();boardZoomSel()"><i data-lucide="scan-search"></i> تكبير التحديد <kbd>⌘2</kbd></button></div>`)}
function boardFlag(k){if(!BRD)return;BRD[k]=k==='grid'?BRD.grid===false:!BRD[k];bTouch();saveBoardView();bApplyFlags();
  boardHint(k==='grid'?(BRD.grid===false?'أُخفيت الشبكة':'أُظهرت الشبكة'):k==='snap'?(BRD.snap?'الالتقاط للشبكة مفعّل':'الالتقاط للشبكة متوقّف'):(BRD.dots?'نقاط الربط تظهر عند المرور على أيّ عنصر':'نقاط الربط تظهر للعنصر المحدّد فقط'))}
function bApplyFlags(){const cv=document.getElementById('bd_canvas');if(!cv||!BRD)return;cv.classList.toggle('bd-nogrid',BRD.grid===false);cv.classList.toggle('dots',!!BRD.dots);
  const on=(id,v)=>{const b=document.getElementById(id);if(b)b.classList.toggle('on',v)};on('bd_fgrid',BRD.grid!==false);on('bd_fsnap',!!BRD.snap);on('bd_fdots',!!BRD.dots)}

/* ---------- الروابط بين العناصر ---------- */
function bSidePt(i,s){const cx=i.x+i.w/2,cy=i.y+i.h/2;return s==='t'?{x:cx,y:i.y}:s==='b'?{x:cx,y:i.y+i.h}:s==='l'?{x:i.x,y:cy}:{x:i.x+i.w,y:cy}}
function bAutoSide(a,b){const ca=bCenter(a),cb=bCenter(b),dx=cb.x-ca.x,dy=cb.y-ca.y;return Math.abs(dx)/(a.w+b.w)>=Math.abs(dy)/(a.h+b.h)?(dx>=0?'r':'l'):(dy>=0?'b':'t')}
function bPath(p,ps,q,qs,route){
  if(route==='straight')return{d:`M${p.x},${p.y} L${q.x},${q.y}`,m:bMid(p,q)};
  if(route==='elbow'){const hz=s=>s==='l'||s==='r';
    if(hz(ps)&&(!qs||hz(qs))){const mx=(p.x+q.x)/2;return{d:`M${p.x},${p.y} H${mx} V${q.y} H${q.x}`,m:{x:mx,y:(p.y+q.y)/2}}}
    if(!hz(ps)&&(!qs||!hz(qs))){const my=(p.y+q.y)/2;return{d:`M${p.x},${p.y} V${my} H${q.x} V${q.y}`,m:{x:(p.x+q.x)/2,y:my}}}
    return hz(ps)?{d:`M${p.x},${p.y} H${q.x} V${q.y}`,m:{x:q.x,y:p.y}}:{d:`M${p.x},${p.y} V${q.y} H${q.x}`,m:{x:p.x,y:q.y}}}
  const k=Math.max(30,Math.min(160,Math.hypot(q.x-p.x,q.y-p.y)*.45)),a=BN[ps]||[0,0],b=BN[qs]||[0,0];
  const c1={x:p.x+a[0]*k,y:p.y+a[1]*k},c2={x:q.x+b[0]*k,y:q.y+b[1]*k};
  return{d:`M${p.x},${p.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${q.x},${q.y}`,m:{x:(p.x+3*c1.x+3*c2.x+q.x)/8,y:(p.y+3*c1.y+3*c2.y+q.y)/8}}}
function bEdgeGeom(e){const a=bItem(e.from),b=bItem(e.to);if(!a||!b||!a.w||!b.w)return null;const fs=e.fs||bAutoSide(a,b),ts=e.ts||bAutoSide(b,a);return bPath(bSidePt(a,fs),fs,bSidePt(b,ts),ts,e.route)}
function bLineD(i){if(!i.bend)return `M${i.x1},${i.y1} L${i.x2},${i.y2}`;const mx=(i.x1+i.x2)/2,my=(i.y1+i.y2)/2,dx=i.x2-i.x1,dy=i.y2-i.y1;return `M${i.x1},${i.y1} Q${mx-dy*i.bend},${my+dx*i.bend} ${i.x2},${i.y2}`}
function bSmooth(pts){if(!pts.length)return '';if(pts.length<3)return 'M'+pts.map(p=>p.join(',')).join(' L');let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=1;i<pts.length-1;i++){d+=` Q${pts[i][0]},${pts[i][1]} ${(pts[i][0]+pts[i+1][0])/2},${(pts[i][1]+pts[i+1][1])/2}`}const l=pts[pts.length-1];return d+` L${l[0]},${l[1]}`}
function bMarker(c){return 'bdm_'+String(c).replace(/[^a-z0-9]/gi,'')}
function bArrowAttrs(arrow,col,mk){if(!arrow||arrow==='none')return '';mk.add(col);const u=`url(#${bMarker(col)})`;return (arrow==='end'||arrow==='both'?` marker-end="${u}"`:'')+(arrow==='start'||arrow==='both'?` marker-start="${u}"`:'')}
function boardDrawEdges(){const svg=document.getElementById('bd_svg');if(!svg||!BRD)return;const z=BRD.view.zoom,mk=new Set();let s='',hit='',lb='';
  (BRD.edges||[]).forEach(e=>{const g=bEdgeGeom(e);if(!g)return;const col=e.color||'#f5a623',w=e.w||2.5;
    if(BX.edge===e.id)s+=`<path d="${g.d}" fill="none" stroke="#f5a623" stroke-opacity=".35" stroke-width="${w+9/z}" stroke-linecap="round"/>`;
    s+=`<path d="${g.d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${e.dash?` stroke-dasharray="${w*3} ${w*2.4}"`:''}${bArrowAttrs(e.arrow,col,mk)}/>`;
    hit+=`<path class="bd-hit" data-k="edge" data-e="${e.id}" data-w="${w}" d="${g.d}"/>`;
    if(e.label)lb+=`<div class="bd-elabel" dir="auto" data-e="${e.id}" style="left:${g.m.x}px;top:${g.m.y}px">${esc(e.label)}</div>`});
  (BRD.items||[]).filter(i=>i.type==='line'||i.type==='draw').sort((a,b)=>(a.z||0)-(b.z||0)).forEach(i=>{
    if(i.type==='line'){const d=bLineD(i);s+=`<path d="${d}" fill="none" stroke="${i.stroke}" stroke-width="${i.sw}" stroke-linecap="round"${i.dash?` stroke-dasharray="${i.sw*3} ${i.sw*2.4}"`:''}${i.op!=null&&i.op<1?` opacity="${i.op}"`:''}${bArrowAttrs(i.arrow,i.stroke,mk)}/>`;hit+=`<path class="bd-hit" data-k="line" data-id="${i.id}" data-w="${i.sw}" d="${d}"/>`}
    else{const d=bSmooth(i.points||[]);s+=`<path d="${d}" fill="none" stroke="${i.stroke}" stroke-width="${i.sw}" stroke-linecap="round" stroke-linejoin="round"${i.op?` opacity="${i.op}"`:''}/>`;hit+=`<path class="bd-hit" data-k="draw" data-id="${i.id}" data-w="${i.sw}" d="${d}"/>`}
    if(BSEL.has(i.id)&&i.type==='draw'){const b=bBox(i),p=6/z;s+=`<rect x="${b.x-p}" y="${b.y-p}" width="${b.w+p*2}" height="${b.h+p*2}" fill="none" stroke="#f5a623" stroke-width="${1.5/z}" stroke-dasharray="${5/z} ${4/z}" rx="${4/z}"/>`}
    if(BSEL.has(i.id)&&i.type==='line')s+=`<path d="${bLineD(i)}" fill="none" stroke="#f5a623" stroke-opacity=".35" stroke-width="${i.sw+9/z}" stroke-linecap="round"/>`});
  if(BMODE==='connect'&&BFROM&&BTMP){const a=bItem(BFROM);if(a&&a.w)s+=`<path d="M${a.x+a.w/2},${a.y+a.h/2} L${BTMP.x},${BTMP.y}" fill="none" stroke="#f5a623" stroke-width="${2/z}" stroke-dasharray="${7/z} ${6/z}"/>`}
  if(BX.dot&&BTMP){const a=bItem(BX.dot.id);if(a)s+=`<path d="${bPath(bSidePt(a,BX.dot.side),BX.dot.side,BTMP,null,'curve').d}" fill="none" stroke="#f5a623" stroke-width="2.5" stroke-dasharray="7 6"/>`}
  if(BX.guides)BX.guides.forEach(g=>{s+=`<line x1="${g[0]}" y1="${g[1]}" x2="${g[2]}" y2="${g[3]}" stroke="#ff4d8d" stroke-width="${1/z}"/>`});
  svg.innerHTML=(mk.size?`<defs>${[...mk].map(c=>`<marker id="${bMarker(c)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`).join('')}</defs>`:'')+s+hit;
  const L=document.getElementById('bd_lbls');if(L&&!L.querySelector('.editing'))L.innerHTML=lb;
  bLineHandles();
}
function bLineHandles(){const H=document.getElementById('bd_lhs');if(!H)return;const it=BSEL.size===1?bItem([...BSEL][0]):null;H.innerHTML=it&&it.type==='line'&&!it.lock?`<div class="bd-lh" data-end="1" style="left:${it.x1}px;top:${it.y1}px"></div><div class="bd-lh" data-end="2" style="left:${it.x2}px;top:${it.y2}px"></div>`:''}
// اختبار إصابة الخطوط والروابط والرسم (هندسيّاً، بلا الاعتماد على أحداث SVG)
function bHit(p,only){const svg=document.getElementById('bd_svg');if(!svg)return null;const z=BRD.view.zoom;let pt;try{pt=svg.createSVGPoint();pt.x=p.x;pt.y=p.y}catch(_){pt=new DOMPoint(p.x,p.y)}
  const hs=[...svg.querySelectorAll('.bd-hit')].reverse();
  for(const h of hs){if(only&&h.dataset.k!==only)continue;h.setAttribute('stroke-width',(+h.dataset.w||0)+14/z);try{if(h.isPointInStroke(pt))return{kind:h.dataset.e?'edge':'item',id:h.dataset.e||h.dataset.id}}catch(_){}}return null}

/* ---------- الرسم ---------- */
function bHandles(it){if(it.lock)return '<div class="bd-lock">🔒</div>';return ['nw','ne','sw','se'].map(k=>`<div class="bd-handle h-${k}" data-h="${k}"></div>`).join('')+['t','r','b','l'].map(s=>`<div class="bd-dot d-${s}" data-s="${s}" title="انقر لفرع جديد، أو اسحب للربط"></div>`).join('')}
function bBuild(it){
  const d=document.createElement('div');d.className='bd-item t-'+it.type+(BSEL.has(it.id)?' sel':'')+(it.lock?' locked':'')+(it.shadow===false?' nosh':'');d.dataset.id=it.id;
  d.style.cssText=`left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px`+(it.op!=null&&it.op<1?`;opacity:${it.op}`:'');
  const fz=`font-size:${it.fontSize||16}px;`,fw=(it.bold||(it.type==='text'&&it.bold!==false))?'font-weight:800;':'';
  let h='';
  if(it.type==='image'){d.style.borderRadius=(it.radius!=null?it.radius:10)+'px';h=`<div class="bd-clip"><img src="${esc(it.url)}" draggable="false" alt=""></div>`}
  else if(it.type==='table'){d.style.background=it.fill||'#ffffff';h=`<div class="bd-clip"><table class="bd-tbl" style="color:${bInk(it)};${fz}">${(it.rows||[]).map((r,ri)=>`<tr>${r.map((c,ci)=>`<td dir="auto" data-r="${ri}" data-c="${ci}">${esc(c||'')}</td>`).join('')}</tr>`).join('')}</table></div>`}
  else if(it.type==='link'){d.style.background=it.fill||'#ffffff';let host='';try{host=new URL(it.url).hostname.replace(/^www\./,'')}catch(_){host=it.url||''}h=`<div class="bd-link" style="color:${bInk(it)}"><span class="ic"><i data-lucide="link"></i></span><span class="tx"><b dir="auto">${esc(it.title||host||'رابط')}</b><small>${esc(it.url||'')}</small></span></div>`}
  else{const fill=it.type==='text'?(it.fill||'transparent'):(it.fill||'#ffd43b');
    if(it.type==='shape')h=`<div class="bd-shp"><div class="bd-fill" style="background:${fill};${(BSHAPES[it.shape]||BSHAPES.rect).css}"></div></div>`;else d.style.background=fill;
    h+=`<div class="bd-txt" dir="auto" data-ph="${it.type==='text'?'نص':'…'}" style="color:${bInk(it)};${fz}${fw}text-align:${it.align||'center'}">${esc(it.text||'')}</div>`}
  d.innerHTML=h+bHandles(it);
  d.addEventListener('dblclick',ev=>{ev.stopPropagation();bItemDbl(it.id,ev)});
  return d;
}
function boardPaint(){const w=document.getElementById('bd_world');if(!w||!BRD)return;w.querySelectorAll('.bd-item').forEach(n=>n.remove());(BRD.items||[]).filter(i=>i.type!=='draw'&&i.type!=='line').slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(it=>w.appendChild(bBuild(it)));const lh=document.getElementById('bd_lhs');if(lh)w.appendChild(lh);boardDrawEdges();applyView();refreshSelUI();bUndoUI();if(BX.scenes)bRenderScenes();refreshIcons()}

/* ---------- التحديد ---------- */
function boardToggleTheme(){const cv=document.getElementById('bd_canvas');if(!cv)return;const light=!cv.classList.contains('bd-light');cv.classList.toggle('bd-light',light);try{localStorage.setItem('bd_theme',light?'light':'dark')}catch(_){}}
function boardFullscreen(){const el=document.getElementById('main');if(!el)return;const fe=document.fullscreenElement||document.webkitFullscreenElement;if(fe){(document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document)}else{(el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el)}}
function bExpand(set){const gs=new Set();set.forEach(id=>{const it=bItem(id);if(it&&it.g)gs.add(it.g)});if(gs.size)BRD.items.forEach(i=>{if(i.g&&gs.has(i.g))set.add(i.id)});return set}
function bMarkSel(){document.querySelectorAll('.bd-item').forEach(el=>el.classList.toggle('sel',BSEL.has(el.dataset.id)));refreshSelUI();boardDrawEdges()}
function bSelectOnly(id){BX.edge=null;BSEL=bExpand(new Set([id]));bMarkSel()}
function bToggleSel(id){BX.edge=null;const grp=bExpand(new Set([id]));const had=BSEL.has(id);grp.forEach(x=>had?BSEL.delete(x):BSEL.add(x));bMarkSel()}
function bDeselect(){BSEL.clear();BX.edge=null;bMarkSel()}
function bSelectEdge(id){BSEL.clear();BX.edge=id;bMarkSel()}
function boardSelectAll(){BX.edge=null;BSEL=new Set(BRD.items.map(i=>i.id));bMarkSel()}
function bB(ic,t,fn,cls,lbl){return `<button class="bd-act${cls?' '+cls:''}" title="${t}" onclick="${fn}"><i data-lucide="${ic}"></i>${lbl?lbl:''}</button>`}
function bSw(c,t,fn){return `<button class="bd-sw bd-swb${c==='transparent'?' bd-none':''}" title="${t}" style="background:${c}" onclick="${fn}"></button>`}
const BSEP='<span class="bd-sep"></span>';
function refreshSelUI(){
  const bar=document.getElementById('bd_style'),cv=document.getElementById('bd_canvas');if(!bar||!cv||!BRD)return;
  const items=bSelItems(),single=items.length===1?items[0]:null;
  cv.classList.toggle('one',!!single&&!!single.w&&!single.lock);cv.classList.toggle('multi',items.length>1);
  ['draw','erase','connect'].forEach(m=>cv.classList.toggle('mode-'+m,BMODE===m));
  cv.style.cursor=BMODE==='draw'?'crosshair':BMODE==='erase'?'cell':BX.space?'grab':'';
  const on=(id,v)=>{const b=document.getElementById(id);if(b)b.classList.toggle('on',v)};
  on('bd_sel',BMODE==='select');on('bd_pen',BMODE==='draw'||BMODE==='erase');on('bd_conn',BMODE==='connect');
  let h='';
  if(BMODE==='draw'||BMODE==='erase'){
    h=`${bB('pencil','قلم',"penKind('pen')",BMODE==='draw'&&BPEN.kind==='pen'?'on':'')}${bB('highlighter','قلم تمييز',"penKind('marker')",BMODE==='draw'&&BPEN.kind==='marker'?'on':'')}${bB('eraser','ممحاة: اسحب فوق الخطوط لحذفها',"boardMode('erase')",BMODE==='erase'?'on':'')}${BSEP}${bSw(BPEN.color,'لون القلم',"bColorPop(this,'pen')")}${[3,6,10,16].map(s=>`<button class="bd-size${BPEN.size===s?' on':''}" onclick="penSize(${s})"><span style="width:${Math.min(s,14)}px;height:${Math.min(s,14)}px"></span></button>`).join('')}${BSEP}<button class="bd-act" onclick="clearDraw()">مسح الرسم</button><button class="bd-act on" onclick="boardMode('select')"><i data-lucide="check"></i> تم</button>`;
  }else if(BX.edge&&bEdge(BX.edge)){const e=bEdge(BX.edge),ar=e.arrow||'none',ro=e.route||'curve';
    h=`<span class="bd-lbl">رابط</span>${bSw(e.color||'#f5a623','لون الرابط',"bColorPop(this,'edge')")}${[1.5,2.5,4].map(w=>`<button class="bd-size${(e.w||2.5)===w?' on':''}" title="السماكة" onclick="bEdgeSet('w',${w})"><span style="width:${w*2+2}px;height:${w*2+2}px"></span></button>`).join('')}${BSEP}${bB('ellipsis','خط متقطّع',"bEdgeSet('dash')",e.dash?'on':'')}${bB(ar==='none'?'minus':ar==='both'?'move-horizontal':'move-right','رأس السهم: بلا ← نهاية ← الطرفين',"bEdgeSet('arrow')")}<button class="bd-act" title="شكل المسار" onclick="bEdgeSet('route')">${ro==='curve'?'منحنٍ':ro==='straight'?'مستقيم':'زاوية'}</button>${bB('arrow-left-right','عكس الاتجاه',"bEdgeSet('rev')")}${bB('type','تسمية الرابط','bEditEdgeLabel(BX.edge)','',' تسمية')}${BSEP}${bB('trash-2','حذف الرابط','delEdge()','del')}`;
  }else if(items.length&&items.every(i=>i.lock)){
    h=`<span class="bd-lbl">🔒 مقفل</span>${bB('lock-open','فكّ القفل (⌘L)','bLockToggle()','',' فكّ القفل')}${bB('copy','تكرار (⌘D)','dupSel()')}`;
  }else if(items.length){
    const tx=items.filter(i=>BTXT.has(i.type)),st=items.filter(i=>i.type==='line'||i.type==='draw'),ln=st.filter(i=>i.type==='line'),P=[];
    if(tx.length){const f=tx[0];P.push(`${bSw(f.type==='text'?(f.fill||'transparent'):(f.fill||'#ffd43b'),'لون التعبئة',"bColorPop(this,'fill')")}<button class="bd-act" title="لون النص" onclick="bColorPop(this,'text')"><b style="border-bottom:3px solid ${bInk(f).startsWith('var')?'currentColor':bInk(f)};line-height:1.1;padding:0 2px">أ</b></button><button class="bd-act" title="أصغر" onclick="fontStep(-2)">أ−</button><span class="bd-lbl">${f.fontSize||16}</span><button class="bd-act" title="أكبر" onclick="fontStep(2)">أ+</button>${bB('bold','عريض',"bBold()",(f.bold||(f.type==='text'&&f.bold!==false))?'on':'')}${bB(f.align==='start'?'align-right':f.align==='end'?'align-left':'align-center','محاذاة النص',"bAlignText()")}`)}
    if(st.length){const s0=st[0];P.push(`${bSw(s0.stroke,'لون الخط',"bColorPop(this,'stroke')")}${[2,4,7].map(w=>`<button class="bd-size${s0.sw===w?' on':''}" title="السماكة" onclick="bStrokeW(${w})"><span style="width:${w+3}px;height:${w+3}px"></span></button>`).join('')}${ln.length?`${bB('ellipsis','متقطّع',"bLineToggle('dash')",ln[0].dash?'on':'')}${bB((ln[0].arrow||'none')==='none'?'minus':ln[0].arrow==='both'?'move-horizontal':'move-right','رأس السهم',"bLineToggle('arrow')")}${bB('spline','منحنٍ',"bLineToggle('bend')",ln[0].bend?'on':'')}`:''}`)}
    if(single){const id=single.id;let x='';
      if(['note','text','shape'].includes(single.type)){x+=bB('git-fork','فرع جديد (Tab)',`spawnChild('${id}')`,'',' فرع');if((BRD.edges||[]).some(e=>e.from===id||e.to===id))x+=bB('network','ترتيب الخريطة الذهنيّة تلقائياً من هذا العنصر',`bTreeLayout('${id}')`,'',' ترتيب')}
      if(single.type==='shape')x+=bB('shapes','تغيير الشكل','boardShapeMenu(this,1)');
      if(single.type==='table')x+=`<button class="bd-act" onclick="bTable('r+')">+ صف</button><button class="bd-act" onclick="bTable('c+')">+ عمود</button><button class="bd-act" onclick="bTable('r-')">− صف</button><button class="bd-act" onclick="bTable('c-')">− عمود</button>`;
      if(single.type==='link')x+=bB('external-link','فتح الرابط',`bOpenLink('${id}')`,'',' فتح')+bB('pencil','تعديل الرابط',`bEditLink('${id}')`);
      if(single.type==='image')x+=bB('expand','معاينة',`bPreviewImg('${id}')`);
      if(x)P.push(x)}
    P.push(`${bB('blend','النمط: ظلّ، شفافية، نسخ النمط','bStylePop(this)')}${bB('layers','ترتيب ومحاذاة وتجميع','bArrangePop(this)')}${bB('copy','تكرار (⌘D)','dupSel()')}${bB('lock','قفل (⌘L)','bLockToggle()')}${bB('trash-2','حذف','delSel()','del')}`);
    h=P.join(BSEP);
  }
  bar.style.display=h?'flex':'none';bar.innerHTML=h;if(h)refreshIcons();
}

/* ---------- القوائم المنبثقة ---------- */
function bPop(btn,html){bClosePop();const m=document.createElement('div');m.className='bd-pop';m.id='bd_pop';m.dir='rtl';m.innerHTML=html;(document.getElementById('main')||document.body).appendChild(m);refreshIcons();BX.liveSnap=0;
  const r=btn.getBoundingClientRect(),W=m.offsetWidth,H=m.offsetHeight;m.style.left=Math.max(8,Math.min(r.left+r.width/2-W/2,innerWidth-W-8))+'px';m.style.top=(r.bottom+8+H>innerHeight-8?Math.max(8,r.top-H-8):r.bottom+8)+'px';
  setTimeout(()=>document.addEventListener('pointerdown',bPopOut,true),0)}
function bPopOut(e){const m=document.getElementById('bd_pop');if(m&&m.contains(e.target))return;bClosePop()}
function bClosePop(){const m=document.getElementById('bd_pop');if(m)m.remove();document.removeEventListener('pointerdown',bPopOut,true)}
function closeShapeMenu(){bClosePop()}
function boardShapeMenu(btn,change){bPop(btn,`<div class="t">${change?'تغيير الشكل':'الأشكال'}</div><div class="g">${Object.keys(BSHAPES).map(k=>`<button class="bd-pb" onclick="${change?`bSetShape('${k}')`:`addShape('${k}')`}"><span class="bd-mini" style="${BSHAPES[k].css}"></span>${BSHAPES[k].n}</button>`).join('')}</div>${change?'':`<div class="t">الخطوط</div><div class="g">${Object.keys(BLINES).map(k=>`<button class="bd-pb" onclick="addLine('${k}')"><i data-lucide="${BLINES[k].ic}"></i>${BLINES[k].n}</button>`).join('')}<button class="bd-pb" onclick="bClosePop();boardMode('draw')"><i data-lucide="pencil"></i>رسم حرّ</button></div>`}`)}
function bCurColor(kind){let c;const it=bSelItems()[0];if(kind==='pen')c=BPEN.color;else if(kind==='edge'){const e=bEdge(BX.edge);c=e&&e.color}else if(it)c=kind==='fill'?it.fill:kind==='text'?it.color:it.stroke;return /^#[0-9a-f]{6}$/i.test(c||'')?c:'#f5a623'}
function bColorPop(btn,kind){bPop(btn,`<div class="g g7">${BCOLS.map(c=>`<button class="sw" style="background:${c}" onclick="bApplyColor('${kind}','${c}');bClosePop()"></button>`).join('')}${kind==='fill'?`<button class="sw bd-none" title="بلا تعبئة" onclick="bApplyColor('fill','transparent');bClosePop()"></button>`:''}</div><div class="row"><input type="color" value="${bCurColor(kind)}" oninput="bApplyColor('${kind}',this.value,true)" onchange="BX.liveSnap=0;saveBoard()"></div>`)}
function bApplyColor(kind,c,live){
  if(kind==='pen'){BPEN.color=c;refreshSelUI();return}
  if(!live||!BX.liveSnap){bSnap();if(live)BX.liveSnap=1}
  if(kind==='edge'){const e=bEdge(BX.edge);if(e)e.color=c}
  else bSelItems().forEach(i=>{if(kind==='fill'&&BTXT.has(i.type)){i.fill=c;i.color=bAutoText(c)}else if(kind==='text'&&BTXT.has(i.type))i.color=c;else if(kind==='stroke'&&(i.type==='line'||i.type==='draw'))i.stroke=c});
  if(live){bTouch();saveBoardView()}else saveBoard();
  if(kind==='edge'){boardDrawEdges();refreshSelUI()}else boardPaint()}
function bArrangePop(btn){const n=bSelItems().filter(i=>!i.lock).length;const pb=(ic,t,fn)=>`<button class="bd-pb" onclick="${fn};bClosePop()"><i data-lucide="${ic}"></i>${t}</button>`;
  bPop(btn,`<div class="t">الطبقات والتجميع</div><div class="g">${pb('bring-to-front','للأمام','zOrder(1)')}${pb('send-to-back','للخلف','zOrder(-1)')}${pb('group','تجميع ⌘G','bGroup()')}${pb('ungroup','فكّ التجميع','bUngroup()')}</div>
  ${n>1?`<div class="t">محاذاة</div><div class="g g3">${pb('align-start-vertical','يسار',"bAlign('l')")}${pb('align-center-vertical','وسط',"bAlign('c')")}${pb('align-end-vertical','يمين',"bAlign('r')")}${pb('align-start-horizontal','أعلى',"bAlign('t')")}${pb('align-center-horizontal','منتصف',"bAlign('m')")}${pb('align-end-horizontal','أسفل',"bAlign('b')")}</div>`:''}
  ${n>2?`<div class="t">توزيع بمسافات متساوية</div><div class="g">${pb('align-horizontal-distribute-center','أفقيّاً',"bDistribute('x')")}${pb('align-vertical-distribute-center','عموديّاً',"bDistribute('y')")}</div>`:''}`)}
function bStylePop(btn){const its=bSelItems(),i0=its[0]||{},op=i0.op==null?1:i0.op;const pb=(t,fn,on)=>`<button class="bd-pb${on?' on':''}" onclick="${fn};bClosePop()">${t}</button>`;
  bPop(btn,`<div class="t">الظلّ</div><div class="g">${pb('<i data-lucide="sun"></i>بظلّ','bShadow(true)',i0.shadow!==false)}${pb('<i data-lucide="square"></i>بلا ظلّ','bShadow(false)',i0.shadow===false)}</div>
  <div class="t">الشفافية</div><div class="g">${[1,.75,.5,.25].map(v=>pb(`<b style="font-size:13px">${v*100}%</b>`,`bOpacity(${v})`,Math.abs(op-v)<.01)).join('')}</div>
  ${its.some(i=>i.type==='image')?`<div class="t">زوايا الصورة</div><div class="g">${[[0,'حادّة'],[10,'ناعمة'],[28,'مدوّرة'],[9999,'دائرة']].map(([v,t])=>pb(t,`bRadius(${v})`,(i0.radius!=null?i0.radius:10)===v)).join('')}</div>`:''}
  <div class="t">النمط</div><div class="g">${pb('<i data-lucide="paintbrush"></i>نسخ النمط','bCopyStyle()')}${pb('<i data-lucide="paint-bucket"></i>لصق النمط','bPasteStyle()',false)}</div>`)}

/* ---------- الإنشاء ---------- */
function bMk(type,x,y,shape){const b={id:uid(),type,x:Math.round(x),y:Math.round(y),z:bNextZ(),text:''};
  if(type==='note'){b.w=170;b.h=150;b.fill='#ffd43b';b.fontSize=17}
  else if(type==='text'){b.w=210;b.h=56;b.fontSize=22}
  else if(type==='shape'){b.w=150;b.h=120;b.fill='#4dabf7';b.shape=shape||'rect';b.fontSize=16;b.color='#fff'}
  else if(type==='table'){b.w=300;b.h=132;b.fill='#ffffff';b.fontSize=14;b.rows=[['','',''],['','',''],['','','']];delete b.text}
  else if(type==='link'){b.w=260;b.h=84;b.fill='#ffffff';delete b.text}
  return b}
function bAddAt(it,edit){BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint();if(edit)setTimeout(()=>bStartEdit(it.id),20)}
function addNote(){const c=bViewCenter();bSnap();bAddAt(bMk('note',c.x-85,c.y-75),1)}
function addText(){const c=bViewCenter();bSnap();bAddAt(bMk('text',c.x-105,c.y-28),1)}
function addShape(shape){bClosePop();const c=bViewCenter();bSnap();bAddAt(bMk('shape',c.x-75,c.y-60,shape),1)}
function addTable(){const c=bViewCenter();bSnap();bAddAt(bMk('table',c.x-150,c.y-66))}
function addLine(kind){bClosePop();const c=bViewCenter();bSnap();const it={id:uid(),type:'line',x1:Math.round(c.x-100),y1:Math.round(c.y),x2:Math.round(c.x+100),y2:Math.round(c.y),stroke:'#f5a623',sw:4,arrow:kind==='arrow'?'end':'none',bend:kind==='curve'?.35:0,z:bNextZ()};BRD.items.push(it);bSelectOnly(it.id);saveBoard();boardPaint()}
function addLink(){const u=prompt('ألصق الرابط','https://');if(!u||!/^https?:\/\/\S+/i.test(u.trim()))return;bAddLinkAt(u.trim())}
function bAddLinkAt(u,p){p=p||bViewCenter();bSnap();const it=bMk('link',p.x-130,p.y-42);it.url=u;bAddAt(it)}
function bEditLink(id){const it=bItem(id);if(!it)return;const u=prompt('الرابط',it.url||'');if(u==null||!/^https?:\/\/\S+/i.test(u.trim()))return;const t=prompt('العنوان (اختياري)',it.title||'');bSnap();it.url=u.trim();it.title=(t||'').trim();saveBoard();boardPaint()}
function bOpenLink(id){const it=bItem(id);if(it&&/^https?:\/\//i.test(it.url||''))window.open(it.url,'_blank','noopener')}
function bPreviewImg(id){const it=bItem(id);if(!it||!it.url)return;const d=document.createElement('div');d.className='bd-lb';d.innerHTML=`<img src="${esc(it.url)}" alt="">`;d.onclick=()=>d.remove();(document.getElementById('main')||document.body).appendChild(d)}
function bHasParent(id){return (BRD.edges||[]).some(e=>e.to===id)}
function bFree(x,y,w,h){return !BRD.items.some(o=>o.w&&o.type!=='draw'&&o.type!=='line'&&x<o.x+o.w+14&&x+w>o.x-14&&y<o.y+o.h+14&&y+h>o.y-14)}
// فرع جديد مرتبط: يرث نمط الأصل، وفروع الجذر تأخذ ألواناً متتالية كالخرائط الذهنيّة
function spawnChild(id,side,at,near){const p=bItem(id);if(!p||!p.w)return;side=side||'r';bSnap();
  const isRoot=!bHasParent(id),txt=['note','shape','text'].includes(p.type),it=bMk(txt?p.type:'note',0,0,p.shape);
  if(txt){it.w=Math.max(120,Math.round(p.w*(isRoot?.8:1)));it.h=Math.max(44,Math.round(p.h*(isRoot?.8:1)));it.fontSize=Math.max(13,(p.fontSize||16)-(isRoot?3:0));if(p.bold!=null)it.bold=p.bold;if(p.shadow===false)it.shadow=false;
    if(p.type!=='text'){const n=(BRD.edges||[]).filter(e=>e.from===id).length;it.fill=isRoot?BPAL[n%8]:(p.fill||'#ffd43b');it.color=bAutoText(it.fill)}else if(p.color)it.color=p.color}
  let x,y;const G=70;
  if(at){x=at.x-it.w/2;y=at.y-it.h/2}
  else{
    if(near){x=side==='l'?near.x+near.w-it.w:near.x;y=near.y+near.h+18}
    else if(side==='r'){x=p.x+p.w+G;y=p.y+p.h/2-it.h/2}else if(side==='l'){x=p.x-G-it.w;y=p.y+p.h/2-it.h/2}
    else if(side==='b'){x=p.x+p.w/2-it.w/2;y=p.y+p.h+G}else{x=p.x+p.w/2-it.w/2;y=p.y-G-it.h}
    const vert=side==='r'||side==='l',x0=x,y0=y;
    for(let k=1;k<60&&!bFree(x,y,it.w,it.h);k++){const step=(vert?it.h:it.w)+18;const off=near?k*step:Math.ceil(k/2)*step*(k%2?1:-1);if(vert)y=y0+off;else x=x0+off}}
  it.x=Math.round(x);it.y=Math.round(y);BRD.items.push(it);
  const pe=(BRD.edges||[]).find(e=>e.to===id);
  BRD.edges.push({id:uid(),from:id,to:it.id,color:isRoot&&txt&&p.type!=='text'?it.fill:(pe&&pe.color)||'#f5a623'});
  bSelectOnly(it.id);saveBoard();boardPaint();setTimeout(()=>bStartEdit(it.id),30)}
function spawnSibling(id){const pe=(BRD.edges||[]).find(e=>e.to===id),s=bItem(id);if(!pe||!s){spawnChild(id);return}const p=bItem(pe.from);if(!p)return spawnChild(id);spawnChild(pe.from,bCenter(s).x>=bCenter(p).x?'r':'l',null,s)}
function bConnect(a,b,fs){if(!BRD.edges)BRD.edges=[];if(BRD.edges.some(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a)))return;bSnap();const e={id:uid(),from:a,to:b,color:'#f5a623'};if(fs)e.fs=fs;BRD.edges.push(e);saveBoard();boardDrawEdges()}
// ترتيب الخريطة الذهنيّة تلقائياً: شجرة أفقيّة من العنصر المحدّد، تتوزّع فروع الجذر على الجانبين
function bTreeLayout(rootId){const root=bItem(rootId);if(!root||!root.w)return;
  const adj=new Map(),add=(a,b)=>{if(!adj.has(a))adj.set(a,[]);adj.get(a).push(b)};
  (BRD.edges||[]).forEach(e=>{const a=bItem(e.from),b=bItem(e.to);if(a&&b&&a.w&&b.w){add(e.from,e.to);add(e.to,e.from)}});
  const kids=new Map(),seen=new Set([rootId]),q=[rootId];
  while(q.length){const id=q.shift();const ch=(adj.get(id)||[]).filter(c=>!seen.has(c));ch.forEach(c=>seen.add(c));ch.sort((a,b)=>bItem(a).y-bItem(b).y);kids.set(id,ch);q.push(...ch)}
  if(seen.size<2){boardHint('لا فروع مرتبطة بهذا العنصر');return}
  bSnap();const HG=80,VG=22,H=new Map();
  const hgt=id=>{const it=bItem(id),ch=kids.get(id)||[];const s=ch.length?ch.reduce((t,c)=>t+hgt(c),0)+VG*(ch.length-1):0;const v=Math.max(it.h,s);H.set(id,v);return v};
  const place=(id,dir,ch)=>{const it=bItem(id);ch=ch||kids.get(id)||[];if(!ch.length)return;const tot=ch.reduce((t,c)=>t+H.get(c),0)+VG*(ch.length-1);let y=it.y+it.h/2-tot/2;
    ch.forEach(c=>{const ci=bItem(c),h=H.get(c);if(!ci.lock){ci.y=Math.round(y+h/2-ci.h/2);ci.x=Math.round(dir>0?it.x+it.w+HG:it.x-HG-ci.w)}y+=h+VG;place(c,dir)})};
  const rc=kids.get(rootId)||[];rc.forEach(hgt);
  if(rc.length>=4&&!bHasParent(rootId)){const half=Math.ceil(rc.length/2);place(rootId,1,rc.slice(0,half));place(rootId,-1,rc.slice(half))}
  else{const dir=bHasParent(rootId)?(bCenter(root).x>=bCenter(bItem((BRD.edges.find(e=>e.to===rootId)||{}).from)||root).x?1:-1):1;place(rootId,dir,rc)}
  (BRD.edges||[]).forEach(e=>{if(seen.has(e.from)&&seen.has(e.to)){delete e.fs;delete e.ts}});
  saveBoard();boardPaint();boardHint('رُتّبت الخريطة ('+(seen.size-1)+' فرعاً)')}
function boardUpload(ev){const fs=[...(ev.target.files||[])];ev.target.value='';const c=bViewCenter();fs.slice(0,10).forEach((f,k)=>boardUploadFile(f,{x:c.x+k*30,y:c.y+k*30}))}
function boardUploadFile(f,at){
  if(BSH.guest){if(!BSH.ro)bShUpload(f,at);return}
  if(WS_DEMO||!USER){bEmbedImage(f,at);return}
  boardHint('جارٍ رفع الصورة…');const ext=(f.name&&f.name.split('.').pop()||'png').toLowerCase();const path=`${USER.id}/boards/${uid()}.${ext}`;
  sb.storage.from('task-images').upload(path,f,{upsert:false,contentType:f.type||'image/png'}).then(({error})=>{
    if(error){boardHint('');alert('تعذّر رفع الصورة: '+(error.message||error)+'\n\nتأكد من وجود حاوية عامة باسم «task-images» في Supabase → Storage.');return}
    bPlaceImage(sb.storage.from('task-images').getPublicUrl(path).data.publicUrl,at)});
}
// في النسخة التجريبيّة: تُضمَّن الصورة مصغّرةً داخل اللوحة بدل رفعها
function bEmbedImage(f,at){const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const m=Math.max(img.naturalWidth,img.naturalHeight)||1,k=Math.min(1,1400/m),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);bPlaceImage(c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.85),at)};img.src=rd.result};rd.readAsDataURL(f)}
function bPlaceImage(url,at){const b=BRD,img=new Image();
  img.onload=()=>{if(!b)return;const prev=BRD;BRD=b;const c=at||bViewCenter();let w=img.naturalWidth||240,h=img.naturalHeight||180;const m=Math.max(w,h);if(m>320){const k=320/m;w*=k;h*=k}
    if(prev===b)bSnap();const it=bMk('image',c.x-w/2,c.y-h/2);it.w=Math.round(w);it.h=Math.round(h);it.url=url;it.radius=10;b.items.push(it);BRD=prev;boardHint('');
    if(prev===b){bSelectOnly(it.id);saveBoard();boardPaint()}else{b.updated=today();save()}};
  img.onerror=()=>boardHint('تعذّر تحميل الصورة');img.src=url}

/* ---------- التعديل ---------- */
function setFill(c){bApplyColor('fill',c)}
function setTextColor(c){bApplyColor('text',c)}
function bMutate(fn,filter){const its=bSelItems().filter(i=>!i.lock&&(!filter||filter(i)));if(!its.length)return;bSnap();its.forEach(fn);saveBoard();boardPaint()}
function fontStep(d){bMutate(it=>it.fontSize=Math.max(10,Math.min(96,(it.fontSize||16)+d)),i=>BTXT.has(i.type))}
function bBold(){const f=bSelItems().find(i=>BTXT.has(i.type));if(!f)return;const v=!(f.bold||(f.type==='text'&&f.bold!==false));bMutate(it=>it.bold=v,i=>BTXT.has(i.type))}
function bAlignText(){const f=bSelItems().find(i=>BTXT.has(i.type));if(!f)return;const v={center:'start',start:'end',end:'center'}[f.align||'center'];bMutate(it=>it.align=v,i=>BTXT.has(i.type))}
function bSetShape(k){bClosePop();bMutate(it=>it.shape=k,i=>i.type==='shape')}
function bStrokeW(w){bMutate(it=>it.sw=it.type==='draw'&&it.op?w*3:w,i=>i.type==='line'||i.type==='draw')}
function bLineToggle(k){const l=bSelItems().find(i=>i.type==='line');if(!l)return;const v=k==='dash'?!l.dash:k==='bend'?(l.bend?0:.35):({none:'end',end:'both',both:'none'})[l.arrow||'none'];bMutate(it=>it[k==='arrow'?'arrow':k]=v,i=>i.type==='line')}
function bShadow(v){bMutate(it=>{if(v)delete it.shadow;else it.shadow=false})}
function bOpacity(v){bMutate(it=>{if(v>=1)delete it.op;else it.op=v})}
function bRadius(v){bMutate(it=>it.radius=v,i=>i.type==='image')}
function bCopyStyle(){const it=bSelItems()[0];if(!it)return;const s={};['fill','color','fontSize','bold','align','shadow','op','stroke','sw','dash','arrow','radius','shape'].forEach(k=>{if(it[k]!==undefined)s[k]=it[k]});s._t=it.type;BX.style=s;boardHint('نُسخ النمط — حدّد عناصر أخرى ثم «لصق النمط»')}
function bPasteStyle(){const s=BX.style;if(!s){boardHint('انسخ نمط عنصر أوّلاً');return}
  bMutate(i=>{const ks=BTXT.has(i.type)?['fill','color','fontSize','bold','align']:(i.type==='line'||i.type==='draw')?['stroke','sw','dash','arrow']:i.type==='image'?['radius']:[];ks.forEach(k=>{if(s[k]!==undefined)i[k]=s[k]});if(i.type==='shape'&&s._t==='shape'&&s.shape)i.shape=s.shape;if(s.shadow===false)i.shadow=false;else delete i.shadow;if(s.op!=null)i.op=s.op;else delete i.op})}
function bTable(op){const it=bSelItems()[0];if(!it||it.type!=='table')return;const R=it.rows,rc=R.length,cc=R[0].length;if((op==='r-'&&rc<2)||(op==='c-'&&cc<2))return;bSnap();
  if(op==='r+'){R.push(Array(cc).fill(''));it.h=Math.round(it.h*(rc+1)/rc)}else if(op==='r-'){R.pop();it.h=Math.round(it.h*(rc-1)/rc)}
  else if(op==='c+'){R.forEach(r=>r.push(''));it.w=Math.round(it.w*(cc+1)/cc)}else{R.forEach(r=>r.pop());it.w=Math.round(it.w*(cc-1)/cc)}
  saveBoard();boardPaint()}
function bCloneItems(src,edges,off){const map={},gm={},cl=[];let z=bNextZ();
  src.forEach(it=>{const c=JSON.parse(JSON.stringify(it));c.id=uid();map[it.id]=c.id;c.z=z++;if(c.g)c.g=gm[c.g]||(gm[c.g]=uid());bShift(c,off,off);cl.push(c)});
  BRD.items.push.apply(BRD.items,cl);(edges||[]).forEach(e=>{if(map[e.from]&&map[e.to])BRD.edges.push(Object.assign({},e,{id:uid(),from:map[e.from],to:map[e.to]}))});return cl}
function bInnerEdges(set){return (BRD.edges||[]).filter(e=>set.has(e.from)&&set.has(e.to))}
function dupSel(){const its=bSelItems();if(!its.length)return;bSnap();const cl=bCloneItems(its,bInnerEdges(BSEL),28);BSEL=new Set(cl.map(c=>c.id));saveBoard();boardPaint()}
function zOrder(d){if(!BSEL.size)return;bSnap();const zs=BRD.items.map(i=>i.z||0),top=Math.max.apply(null,zs.concat(0)),bot=Math.min.apply(null,zs.concat(0));let k=0;BSEL.forEach(id=>{const it=bItem(id);if(it)it.z=d>0?top+1+k++:bot-1-k++});saveBoard();boardPaint()}
function delSel(){const del=new Set([...BSEL].filter(id=>{const i=bItem(id);return i&&!i.lock}));if(!del.size){if(BSEL.size)boardHint('العناصر المقفلة لا تُحذف — فكّ قفلها أوّلاً');return}bSnap();BRD.items=BRD.items.filter(i=>!del.has(i.id));BRD.edges=(BRD.edges||[]).filter(e=>!del.has(e.from)&&!del.has(e.to));BSEL.clear();saveBoard();boardPaint()}
function delEdge(){if(!BX.edge)return;bSnap();BRD.edges=(BRD.edges||[]).filter(e=>e.id!==BX.edge);BX.edge=null;saveBoard();boardPaint()}
function bEdgeSet(k,v){const e=bEdge(BX.edge);if(!e)return;bSnap();
  if(k==='arrow')e.arrow=({none:'end',end:'both',both:'none'})[e.arrow||'none'];else if(k==='route')e.route=({curve:'straight',straight:'elbow',elbow:'curve'})[e.route||'curve'];
  else if(k==='dash')e.dash=!e.dash;else if(k==='rev'){const t=e.from;e.from=e.to;e.to=t;const s=e.fs;e.fs=e.ts;e.ts=s;if(!e.fs)delete e.fs;if(!e.ts)delete e.ts}else e[k]=v;
  saveBoard();boardDrawEdges();refreshSelUI()}
function bEditEdgeLabel(id){const e=bEdge(id),g=e&&bEdgeGeom(e),L=document.getElementById('bd_lbls');if(!g||!L)return;bSelectEdge(id);L.querySelectorAll('.bd-elabel').forEach(n=>{if(n.dataset.e===id)n.remove()});
  const d=document.createElement('div');d.className='bd-elabel editing';d.dir='auto';d.dataset.e=id;d.style.left=g.m.x+'px';d.style.top=g.m.y+'px';d.contentEditable='true';d.textContent=e.label||'';L.appendChild(d);BEDIT=true;d.focus();
  try{const r=document.createRange();r.selectNodeContents(d);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(_){}
  const done=()=>{d.removeEventListener('blur',done);BEDIT=false;const v=d.innerText.trim();if(v!==(e.label||'')){bSnap();if(v)e.label=v;else delete e.label}d.remove();saveBoard();boardDrawEdges()};
  d.addEventListener('blur',done);d.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key==='Escape'){ev.preventDefault();d.blur()}ev.stopPropagation()})}
function bGroup(){const its=bSelItems();if(its.length<2){boardHint('حدّد عنصرين أو أكثر للتجميع');return}bSnap();const g=uid();its.forEach(i=>i.g=g);saveBoard();boardPaint();boardHint('جُمّعت '+its.length+' عناصر — تتحرّك معاً')}
function bUngroup(){const its=bSelItems().filter(i=>i.g);if(!its.length)return;bSnap();its.forEach(i=>delete i.g);saveBoard();boardPaint()}
function bLockToggle(){const its=bSelItems();if(!its.length)return;bSnap();const v=!its.every(i=>i.lock);its.forEach(i=>{if(v)i.lock=true;else delete i.lock});saveBoard();boardPaint()}
function bAlign(k){const its=bSelItems().filter(i=>!i.lock);if(its.length<2)return;bSnap();const U=bUnion(its.map(bBox));
  its.forEach(i=>{const b=bBox(i);let dx=0,dy=0;if(k==='l')dx=U.x-b.x;else if(k==='c')dx=U.x+U.w/2-b.x-b.w/2;else if(k==='r')dx=U.x+U.w-b.x-b.w;else if(k==='t')dy=U.y-b.y;else if(k==='m')dy=U.y+U.h/2-b.y-b.h/2;else dy=U.y+U.h-b.y-b.h;bShift(i,dx,dy)});saveBoard();boardPaint()}
function bDistribute(ax){const its=bSelItems().filter(i=>!i.lock);if(its.length<3)return;bSnap();const P=ax==='x'?['x','w']:['y','h'];
  const bs=its.map(i=>({i,b:bBox(i)})).sort((a,c)=>a.b[P[0]]-c.b[P[0]]),f=bs[0].b,l=bs[bs.length-1].b,tot=bs.reduce((s,o)=>s+o.b[P[1]],0),gap=(l[P[0]]+l[P[1]]-f[P[0]]-tot)/(bs.length-1);
  let cur=f[P[0]]+f[P[1]]+gap;bs.slice(1,-1).forEach(o=>{const d=cur-o.b[P[0]];bShift(o.i,ax==='x'?d:0,ax==='y'?d:0);cur+=o.b[P[1]]+gap});saveBoard();boardPaint()}
function bNudge(dx,dy){const its=bSelItems().filter(i=>!i.lock);if(!its.length)return;const now=Date.now();if(now-BX.nudgeAt>700)bSnap();BX.nudgeAt=now;its.forEach(i=>{bShift(i,dx,dy);const el=bItemEl(i.id);if(el){el.style.left=i.x+'px';el.style.top=i.y+'px'}});bTouch();saveBoardView();if(BSH.token)bShQueue();boardDrawEdges()}
function penColor(c){BPEN.color=c;refreshSelUI()}
function penSize(s){BPEN.size=s;refreshSelUI()}
function penKind(k){BPEN.kind=k;if(BMODE!=='draw')boardMode('draw');else refreshSelUI()}
function clearDraw(){if(!(BRD.items||[]).some(i=>i.type==='draw'))return;if(!confirm('مسح كل الرسم الحرّ في هذه اللوحة؟'))return;bSnap();BRD.items=BRD.items.filter(i=>i.type!=='draw');saveBoard();boardPaint()}

/* ---------- الحافظة ---------- */
function bCopy(cut){const its=bSelItems();if(!its.length)return;BX.clip=JSON.stringify({items:its,edges:bInnerEdges(BSEL)});BX.clipNew=true;BX.clipFired=false;BX.pasteN=0;if(cut)delSel()}
function boardCopyEvt(e){if(CUR!=='boards'||!BRD||BEDIT||!BX.clip||!BX.clipNew)return;const t=e.target;if(t&&(/^(INPUT|TEXTAREA)$/.test(t.tagName)||t.isContentEditable))return;BX.clipNew=false;try{e.clipboardData.setData('text/plain','bd-clip:'+BX.clip);e.preventDefault();BX.clipFired=true}catch(_){}}
function bPasteData(json){let d;try{d=JSON.parse(json)}catch(_){return}if(!d||!Array.isArray(d.items)||!d.items.length)return;bSnap();BX.pasteN=(BX.pasteN||0)+1;const cl=bCloneItems(d.items,d.edges||[],24*BX.pasteN);BSEL=new Set(cl.map(c=>c.id));BX.edge=null;saveBoard();boardPaint()}
function boardPaste(e){if(CUR!=='boards'||!BRD||BSH.ro||bEditing())return;const t=e.target;if(t&&(/^(INPUT|TEXTAREA)$/.test(t.tagName)||t.isContentEditable))return;const cd=e.clipboardData;if(!cd)return;
  for(const it of (cd.items||[])){if(it.type&&it.type.indexOf('image')===0){const f=it.getAsFile();if(f){e.preventDefault();boardUploadFile(f);return}}}
  const tx=(cd.getData('text/plain')||'').trim();
  if(tx.startsWith('bd-clip:')){e.preventDefault();bPasteData(tx.slice(8));return}
  if(BX.clip&&!BX.clipFired){e.preventDefault();bPasteData(BX.clip);return}
  if(/^https?:\/\/\S+$/i.test(tx)){e.preventDefault();bAddLinkAt(tx);return}
  if(tx){e.preventDefault();const c=bViewCenter();bSnap();const it=bMk('text',c.x-140,c.y-30);it.text=tx.slice(0,3000);it.w=280;it.h=Math.min(480,44+Math.ceil(tx.length/26)*30);it.fontSize=18;it.bold=false;bAddAt(it);return}
  if(BX.clip){e.preventDefault();bPasteData(BX.clip)}}
function boardDragOver(e){const ty=e.dataTransfer&&[...(e.dataTransfer.types||[])];if(ty&&(ty.includes('Files')||ty.includes('text/uri-list')))e.preventDefault()}
function boardDrop(e){const dt=e.dataTransfer;if(!dt||!BRD||BSH.ro)return;const p=bWorldPt(e),fs=[...(dt.files||[])].filter(f=>/^image\//.test(f.type));
  if(fs.length){e.preventDefault();fs.slice(0,10).forEach((f,k)=>boardUploadFile(f,{x:p.x+k*30,y:p.y+k*30}));return}
  const u=(dt.getData('text/uri-list')||dt.getData('text/plain')||'').trim().split('\n')[0];if(/^https?:\/\/\S+$/i.test(u)){e.preventDefault();bAddLinkAt(u,p)}}

/* ---------- تحرير النصوص ---------- */
function bCaretEnd(t){try{const r=document.createRange();r.selectNodeContents(t);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(_){}}
function bItemDbl(id,ev){const it=bItem(id);if(!it||it.lock)return;if(BSH.ro){if(it.type==='image')bPreviewImg(id);else if(it.type==='link')bOpenLink(id);return}
  if(it.type==='table'){const td=ev&&ev.target&&ev.target.closest?ev.target.closest('td'):null;const el=bItemEl(id);bEditCell(id,td||(el&&el.querySelector('td')))}
  else if(it.type==='link')bEditLink(id);else if(it.type==='image')bPreviewImg(id);else if(BTXT.has(it.type))bStartEdit(id)}
function bStartEdit(id){const it=bItem(id);if(!it||it.lock||!['note','text','shape'].includes(it.type))return;bSelectOnly(id);const el=bItemEl(id);const t=el&&el.querySelector('.bd-txt');if(!t)return;
  BEDIT=true;t.contentEditable='true';t.classList.add('editing');t.focus();bCaretEnd(t);let next=null;
  const done=()=>{t.removeEventListener('blur',done);t.removeEventListener('keydown',kd);BEDIT=false;t.contentEditable='false';t.classList.remove('editing');const nv=t.innerText.replace(/\n{3,}/g,'\n\n').trim();if(nv!==(it.text||'')){bSnap();it.text=nv}saveBoard();if(next)next()};
  const kd=ev=>{if(ev.key==='Escape'||(ev.key==='Enter'&&(ev.metaKey||ev.ctrlKey))){ev.preventDefault();t.blur()}else if(ev.key==='Tab'){ev.preventDefault();next=ev.shiftKey?()=>spawnSibling(id):()=>spawnChild(id);t.blur()}ev.stopPropagation()};
  t.addEventListener('blur',done);t.addEventListener('keydown',kd)}
function bEditCell(id,td){const it=bItem(id);if(!it||it.lock||!td)return;bSelectOnly(id);BEDIT=true;td.contentEditable='true';td.classList.add('editing');td.focus();bCaretEnd(td);let nx=null;
  const r=+td.dataset.r,c=+td.dataset.c;
  const done=()=>{td.removeEventListener('blur',done);td.removeEventListener('keydown',kd);BEDIT=false;td.contentEditable='false';td.classList.remove('editing');const v=td.innerText.trim();if(v!==(it.rows[r][c]||'')){bSnap();it.rows[r][c]=v;saveBoard()}if(nx)nx()};
  const kd=ev=>{if(ev.key==='Escape'||(ev.key==='Enter'&&!ev.shiftKey)){ev.preventDefault();td.blur()}else if(ev.key==='Tab'){ev.preventDefault();const cols=it.rows[0].length,n=it.rows.length*cols;const k=((r*cols+c+(ev.shiftKey?-1:1))%n+n)%n;nx=()=>{const e2=bItemEl(id),t2=e2&&e2.querySelector(`td[data-r="${Math.floor(k/cols)}"][data-c="${k%cols}"]`);if(t2)bEditCell(id,t2)};td.blur()}ev.stopPropagation()};
  td.addEventListener('blur',done);td.addEventListener('keydown',kd)}

/* ---------- الأوضاع ---------- */
function boardMode(m){BMODE=(BMODE===m&&m!=='select')?'select':m;BFROM=null;BTMP=null;bClosePop();
  boardHint(BMODE==='draw'?'وضع الرسم: ارسم بالفأرة أو الإصبع':BMODE==='erase'?'الممحاة: اسحب فوق الخطوط لحذفها':BMODE==='connect'?'وضع الربط: اضغط عنصرين لربطهما':'');
  if(BMODE!=='select'){BSEL.clear();BX.edge=null;bMarkSel()}else{refreshSelUI();boardDrawEdges()}}
function handleConnect(it){if(!BFROM){BFROM=it.id;bSelectOnly(it.id);boardHint('اختر العنصر الثاني للربط')}else if(BFROM!==it.id){bConnect(BFROM,it.id);BFROM=null;BTMP=null;boardPaint();boardHint('تم الربط — اضغط عنصراً لربط جديد أو أوقف الوضع')}}

/* ---------- المشاهد ---------- */
function bScenes(){if(!Array.isArray(BRD.scenes))BRD.scenes=[];return BRD.scenes}
function boardScenesToggle(){BX.scenes=!BX.scenes;bRenderScenes()}
function bRenderScenes(){const P=document.getElementById('bd_scenes'),btn=document.getElementById('bd_scbtn');if(!P||!BRD)return;P.classList.toggle('show',!!BX.scenes);if(btn)btn.classList.toggle('on',!!BX.scenes);if(!BX.scenes)return;const sc=bScenes();
  P.innerHTML=`<div class="hd"><span>المشاهد</span><button title="إغلاق" onclick="boardScenesToggle()">×</button></div>
   <div class="ls">${sc.length?sc.map((s,i)=>`<div class="bd-sc${BX.sceneI===i?' on':''}" onclick="bGoScene(${i})"><span class="k">${i+1}</span><span class="n">${esc(s.name)}</span><button title="تحديث بالعرض الحالي" onclick="event.stopPropagation();bUpdScene(${i})">⟳</button><button title="إعادة تسمية" onclick="event.stopPropagation();bRenameScene(${i})">✎</button><button title="حذف" onclick="event.stopPropagation();bDelScene(${i})">×</button></div>`).join(''):'<div class="em">احفظ زوايا عرض من اللوحة كمشاهد، ثم تنقّل بينها كعرض تقديميّ (← و→ أو PageUp/PageDown).</div>'}</div>
   <div class="ft"><button class="bd-act" onclick="bAddScene()"><i data-lucide="plus"></i> أضف المشهد الحالي</button>${sc.length>1?`<button class="bd-act" style="flex:0 0 36px" title="السابق" onclick="bStepScene(-1)"><i data-lucide="chevron-right"></i></button><button class="bd-act" style="flex:0 0 36px" title="التالي" onclick="bStepScene(1)"><i data-lucide="chevron-left"></i></button>`:''}</div>`;refreshIcons()}
function bSceneOf(){const c=bViewCenter();return{cx:Math.round(c.x),cy:Math.round(c.y),zoom:+BRD.view.zoom.toFixed(3)}}
function bAddScene(){const sc=bScenes();sc.push(Object.assign({id:uid(),name:'مشهد '+(sc.length+1)},bSceneOf()));BX.sceneI=sc.length-1;saveBoard();bRenderScenes();boardHint('حُفظ المشهد')}
function bUpdScene(i){const s=bScenes()[i];if(!s)return;Object.assign(s,bSceneOf());saveBoard();boardHint('حُدّث «'+s.name+'»')}
function bGoScene(i){const s=bScenes()[i];if(!s)return;BX.sceneI=i;const r=bCanvasRect();bAnimView({zoom:s.zoom,x:r.width/2-s.cx*s.zoom,y:r.height/2-s.cy*s.zoom},520);bRenderScenes()}
function bStepScene(d){const n=bScenes().length;if(!n)return;bGoScene(((BX.sceneI==null?-1:BX.sceneI)+d+n)%n)}
function bRenameScene(i){const s=bScenes()[i];const v=prompt('اسم المشهد',s.name);if(v&&v.trim()){s.name=v.trim();saveBoard();bRenderScenes()}}
function bDelScene(i){bScenes().splice(i,1);if(BX.sceneI>=bScenes().length)BX.sceneI=null;saveBoard();bRenderScenes()}

/* ---------- الإيماءات ---------- */
function bStartPinch(){const p=[...BPTRS.values()];BGEST={type:'pinch',d0:bDist(p[0],p[1])||1,z0:BRD.view.zoom,mid:bMid(p[0],p[1]),vx:BRD.view.x,vy:BRD.view.y}}
function bStartPan(e){BGEST={type:'pan',x:e.clientX,y:e.clientY,vx:BRD.view.x,vy:BRD.view.y};document.getElementById('bd_canvas').style.cursor='grabbing'}
function bStartDrag(e){let its=bSelItems().filter(i=>!i.lock);if(!its.length){BGEST={type:'tap'};return}const pre=bState(),orig=[...BSEL];let alt=false;
  if(e.altKey){const cl=bCloneItems(its,bInnerEdges(new Set(its.map(i=>i.id))),0);BSEL=new Set(cl.map(c=>c.id));boardPaint();its=cl;alt=true}
  const bx=its.filter(i=>i.type!=='draw');
  BGEST={type:'drag',x:e.clientX,y:e.clientY,moved:false,pre,alt,orig,skip:new Set(its.map(i=>i.id)),bb:bx.length?bUnion(bx.map(bBox)):null,
    items:its.map(i=>({id:i.id,x:i.x,y:i.y,x1:i.x1,y1:i.y1,x2:i.x2,y2:i.y2,pts:i.type==='draw'?i.points.map(p=>p.slice()):null}))}}
// محاذاة ذكية أثناء السحب: أطراف ومراكز العناصر الأخرى، ثم الشبكة إن فُعّل الالتقاط
function bSnapDelta(bb,dx,dy,skip){if(!bb)return{dx,dy,g:null};const z=BRD.view.zoom,th=7/z,x=bb.x+dx,y=bb.y+dy,xs=[x,x+bb.w/2,x+bb.w],ys=[y,y+bb.h/2,y+bb.h];let bx=null,by=null;
  (BRD.items||[]).forEach(o=>{if(skip.has(o.id)||o.type==='draw')return;const b=bBox(o);
    [b.x,b.x+b.w/2,b.x+b.w].forEach(v=>xs.forEach(s=>{const d=v-s;if(Math.abs(d)<th&&(!bx||Math.abs(d)<Math.abs(bx.d)))bx={d,v,b}}));
    [b.y,b.y+b.h/2,b.y+b.h].forEach(v=>ys.forEach(s=>{const d=v-s;if(Math.abs(d)<th&&(!by||Math.abs(d)<Math.abs(by.d)))by={d,v,b}}))});
  if(bx)dx+=bx.d;else if(BRD.snap)dx+=Math.round(x/BGRID)*BGRID-x;
  if(by)dy+=by.d;else if(BRD.snap)dy+=Math.round(y/BGRID)*BGRID-y;
  const g=[],ny=bb.y+dy,nx=bb.x+dx,pad=16/z;
  if(bx)g.push([bx.v,Math.min(ny,bx.b.y)-pad,bx.v,Math.max(ny+bb.h,bx.b.y+bx.b.h)+pad]);
  if(by)g.push([Math.min(nx,by.b.x)-pad,by.v,Math.max(nx+bb.w,by.b.x+by.b.w)+pad,by.v]);
  return{dx,dy,g:g.length?g:null}}
function bEraseAt(p){const h=bHit(p,'draw');if(!h)return;if(!BGEST.hit){bPushPre(BGEST.pre);BGEST.hit=true}BRD.items=BRD.items.filter(i=>i.id!==h.id);boardDrawEdges()}
// يتعافى من تحرير انقطع بإعادة رسم اللوحة (لم يعد العنصر المحرَّر موجوداً)
function bEditing(){if(BEDIT&&!document.querySelector('#bd_canvas .editing'))BEDIT=false;return BEDIT}
function boardPtrDown(e){
  if(bEditing())return;
  // لا تُعامل الضغط على الأشرطة العائمة كضغط على اللوحة
  if(e.target&&e.target.closest&&e.target.closest('.bd-style,.bd-float,.bd-scenes,.bd-elabel.editing'))return;
  bClosePop();BX.anim++;if(e.pointerType==='mouse'){e.preventDefault();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
  const cv=document.getElementById('bd_canvas');BPTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(BPTRS.size===2){if(BCUR){BRD.items=BRD.items.filter(i=>i!==BCUR);BCUR=null;boardDrawEdges()}const m=document.getElementById('bd_marq');if(m)m.remove();bStartPinch();return}
  if(e.button===1||BX.space||BSH.ro){bStartPan(e);return}
  const p=bWorldPt(e);
  if(BMODE==='draw'){BCUR={id:uid(),type:'draw',stroke:BPEN.color,sw:BPEN.kind==='marker'?BPEN.size*3:BPEN.size,points:[[Math.round(p.x),Math.round(p.y)]],z:bNextZ()};if(BPEN.kind==='marker')BCUR.op=.38;BGEST={type:'draw',pre:bState()};BRD.items.push(BCUR);boardDrawEdges();return}
  if(BMODE==='erase'){BGEST={type:'erase',pre:bState(),hit:false};bEraseAt(p);return}
  const t=e.target&&e.target.closest?e.target:null;
  const lh=t&&t.closest('.bd-lh');
  if(lh){const it=bItem([...BSEL][0]);if(it)BGEST={type:'lend',id:it.id,end:lh.dataset.end,pre:bState(),moved:false};return}
  const el=t&&t.closest('.bd-item'),dot=t&&t.closest('.bd-dot'),handle=t&&t.closest('.bd-handle');
  if(dot&&el&&BMODE==='select'){BGEST={type:'dot',id:el.dataset.id,side:dot.dataset.s,x:e.clientX,y:e.clientY,moved:false};return}
  if(handle&&el){const it=bItem(el.dataset.id);if(it&&!it.lock)BGEST={type:'resize',id:it.id,h:handle.dataset.h,x:e.clientX,y:e.clientY,o:{x:it.x,y:it.y,w:it.w,h:it.h},pre:bState(),moved:false};return}
  let hid=el?el.dataset.id:null;
  if(!hid&&BMODE!=='connect'){const h=bHit(p);if(h&&h.kind==='edge'){bSelectEdge(h.id);BGEST={type:'tap'};return}if(h)hid=h.id}
  if(hid){const it=bItem(hid);if(!it)return;
    if(BMODE==='connect'){if(it.w)handleConnect(it);BGEST={type:'tap'};return}
    if(e.shiftKey||e.metaKey||e.ctrlKey){bToggleSel(it.id);if(!BSEL.has(it.id)){BGEST={type:'tap'};return}}
    else if(!BSEL.has(it.id))bSelectOnly(it.id);
    bStartDrag(e);return}
  if(BMODE==='connect'){BFROM=null;BTMP=null;boardDrawEdges()}
  if(e.pointerType==='touch'){bDeselect();bStartPan(e);return}
  const r=cv.getBoundingClientRect();
  BGEST={type:'marq',sx:e.clientX-r.left,sy:e.clientY-r.top,x:e.clientX,y:e.clientY,base:e.shiftKey?new Set(BSEL):new Set(),moved:false};
  if(!e.shiftKey&&(BSEL.size||BX.edge))bDeselect();
}
function boardPtrMove(e){
  bShMoveCursor(e);
  if(BPTRS.has(e.pointerId))BPTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(BMODE==='connect'&&BFROM){BTMP=bWorldPt(e);boardDrawEdges()}
  if(!BGEST||!BRD)return;const z=BRD.view.zoom,g=BGEST,far=Math.abs(e.clientX-g.x)+Math.abs(e.clientY-g.y);
  if(g.type==='pinch'){const p=[...BPTRS.values()];if(p.length<2)return;const r=bCanvasRect();const nz=Math.min(4,Math.max(0.1,g.z0*bDist(p[0],p[1])/g.d0));const m=bMid(p[0],p[1]);const wx=(g.mid.x-r.left-g.vx)/g.z0,wy=(g.mid.y-r.top-g.vy)/g.z0;const v=BRD.view;v.zoom=nz;v.x=(m.x-r.left)-wx*nz;v.y=(m.y-r.top)-wy*nz;applyView();return}
  if(g.type==='draw'){if(!BCUR)return;const p=bWorldPt(e),l=BCUR.points[BCUR.points.length-1];if(Math.hypot(p.x-l[0],p.y-l[1])<2/z)return;BCUR.points.push([Math.round(p.x),Math.round(p.y)]);boardDrawEdges();return}
  if(g.type==='erase'){bEraseAt(bWorldPt(e));return}
  if(g.type==='pan'){BRD.view.x=g.vx+(e.clientX-g.x);BRD.view.y=g.vy+(e.clientY-g.y);applyView();return}
  if(g.type==='drag'){if(!g.moved){if(far<=3)return;g.moved=true;bPushPre(g.pre)}
    let dx=(e.clientX-g.x)/z,dy=(e.clientY-g.y)/z;if(!e.metaKey&&!e.ctrlKey){const sn=bSnapDelta(g.bb,dx,dy,g.skip);dx=sn.dx;dy=sn.dy;BX.guides=sn.g}else BX.guides=null;
    g.items.forEach(sn=>{const it=bItem(sn.id);if(!it)return;
      if(it.type==='line'){it.x1=Math.round(sn.x1+dx);it.y1=Math.round(sn.y1+dy);it.x2=Math.round(sn.x2+dx);it.y2=Math.round(sn.y2+dy)}
      else if(it.type==='draw'){it.points=sn.pts.map(p=>[Math.round(p[0]+dx),Math.round(p[1]+dy)])}
      else{it.x=Math.round(sn.x+dx);it.y=Math.round(sn.y+dy);const el=bItemEl(it.id);if(el){el.style.left=it.x+'px';el.style.top=it.y+'px'}}});
    boardDrawEdges();return}
  if(g.type==='resize'){const it=bItem(g.id);if(!it)return;if(!g.moved){g.moved=true;bPushPre(g.pre)}const o=g.o,k=g.h,dx=(e.clientX-g.x)/z,dy=(e.clientY-g.y)/z;
    let w=o.w+(k.includes('e')?dx:-dx),h=o.h+(k.includes('s')?dy:-dy);if(e.shiftKey!==(it.type==='image')){const f=Math.max(w/o.w,h/o.h);w=o.w*f;h=o.h*f}
    it.w=Math.round(Math.max(40,w));it.h=Math.round(Math.max(30,h));it.x=Math.round(k.includes('w')?o.x+o.w-it.w:o.x);it.y=Math.round(k.includes('n')?o.y+o.h-it.h:o.y);
    const el=bItemEl(it.id);if(el){el.style.left=it.x+'px';el.style.top=it.y+'px';el.style.width=it.w+'px';el.style.height=it.h+'px'}boardDrawEdges();return}
  if(g.type==='lend'){const it=bItem(g.id);if(!it)return;if(!g.moved){g.moved=true;bPushPre(g.pre)}let p=bWorldPt(e);const o=g.end==='1'?'2':'1';
    if(e.shiftKey){const ox=it['x'+o],oy=it['y'+o],a=Math.round(Math.atan2(p.y-oy,p.x-ox)/(Math.PI/4))*(Math.PI/4),L=Math.hypot(p.x-ox,p.y-oy);p={x:ox+Math.cos(a)*L,y:oy+Math.sin(a)*L}}
    it['x'+g.end]=Math.round(p.x);it['y'+g.end]=Math.round(p.y);boardDrawEdges();return}
  if(g.type==='dot'){if(!g.moved&&far>5){g.moved=true;BX.dot={id:g.id,side:g.side}}if(g.moved){BTMP=bWorldPt(e);boardDrawEdges()}return}
  if(g.type==='marq'){if(!g.moved&&far<4)return;g.moved=true;const cv=document.getElementById('bd_canvas'),r=cv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
    const x0=Math.min(sx,g.sx),y0=Math.min(sy,g.sy),w=Math.abs(sx-g.sx),h=Math.abs(sy-g.sy);let m=document.getElementById('bd_marq');if(!m){m=document.createElement('div');m.className='bd-marq';m.id='bd_marq';cv.appendChild(m)}
    m.style.cssText=`left:${x0}px;top:${y0}px;width:${w}px;height:${h}px`;const a=bWorldFromScreen(x0,y0),b=bWorldFromScreen(x0+w,y0+h),sel=new Set(g.base);
    BRD.items.forEach(i=>{const bb=bBox(i);if(bb.x<=b.x&&bb.x+bb.w>=a.x&&bb.y<=b.y&&bb.y+bb.h>=a.y)sel.add(i.id)});BSEL=bExpand(sel);BX.edge=null;
    document.querySelectorAll('.bd-item').forEach(el=>el.classList.toggle('sel',BSEL.has(el.dataset.id)));boardDrawEdges();return}
}
function boardPtrUp(e){
  BPTRS.delete(e.pointerId);const g=BGEST;
  if(g&&BRD){
    if(g.type==='draw'){if(BCUR){if(BCUR.points.length<2)BRD.items=BRD.items.filter(i=>i!==BCUR);else{bPushPre(g.pre);saveBoard()}}BCUR=null;boardDrawEdges()}
    else if(g.type==='erase'){if(g.hit)saveBoard()}
    else if(g.type==='drag'){BX.guides=null;if(g.moved){saveBoard();boardDrawEdges()}else if(g.alt){const o=JSON.parse(g.pre);BRD.items=o.items;BRD.edges=o.edges;BSEL=new Set(g.orig);boardPaint()}else boardDrawEdges()}
    else if(g.type==='resize'||g.type==='lend'){if(g.moved)saveBoard()}
    else if(g.type==='dot'){BX.dot=null;BTMP=null;
      if(!g.moved)spawnChild(g.id,g.side);
      else{const te=document.elementFromPoint(e.clientX,e.clientY),tg=te&&te.closest&&te.closest('.bd-item'),tid=tg&&tg.dataset.id;if(tid&&tid!==g.id)bConnect(g.id,tid,g.side);else spawnChild(g.id,g.side,bWorldPt(e))}
      boardDrawEdges()}
    else if(g.type==='marq'){const m=document.getElementById('bd_marq');if(m)m.remove();if(g.moved)refreshSelUI()}
    else if(g.type==='pan'){saveBoardView();refreshSelUI()}
  }
  if(BPTRS.size<2)BGEST=null;
}
function boardWheel(e){e.preventDefault();BX.anim++;const r=bCanvasRect();const sx=e.clientX-r.left,sy=e.clientY-r.top,v=BRD.view;if(e.ctrlKey||e.metaKey){zoomAt(sx,sy,v.zoom*Math.exp(-e.deltaY*0.0016))}else{v.x-=e.deltaX;v.y-=e.deltaY;applyView()}saveBoardView()}
function boardCanvasDbl(e){if(BSH.ro||bEditing()||BMODE!=='select'||!BRD)return;if(e.target.closest('.bd-item,.bd-style,.bd-float,.bd-scenes'))return;const p=bWorldPt(e),h=bHit(p);if(h){if(h.kind==='edge')bEditEdgeLabel(h.id);return}bSnap();bAddAt(bMk('note',p.x-85,p.y-75),1)}
function boardHint(t){const h=document.getElementById('bd_hint');if(!h)return;if(!t){h.classList.remove('show');return}h.textContent=t;h.classList.add('show');clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove('show'),3200)}
function boardKeys(e){if(CUR!=='boards'||!BRD||bEditing()||!document.getElementById('bd_canvas'))return;const t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
  const mod=e.metaKey||e.ctrlKey,k=(e.key||'').toLowerCase(),one=BSEL.size===1?[...BSEL][0]:null;
  if(BSH.ro&&!(mod&&(k==='0'||k==='1'||k==='='||k==='-')))return;
  if(e.key===' '){e.preventDefault();if(!BX.space){BX.space=true;refreshSelUI()}return}
  if(e.key==='Delete'||e.key==='Backspace'){if(BX.edge){e.preventDefault();delEdge()}else if(BSEL.size){e.preventDefault();delSel()}}
  else if(e.key==='Escape'){const lb=document.querySelector('.bd-lb');if(lb){lb.remove();return}bClosePop();if(BMODE!=='select')boardMode('select');else bDeselect()}
  else if(mod&&k==='z'){e.preventDefault();e.shiftKey?boardRedo():boardUndo()}
  else if(mod&&k==='y'){e.preventDefault();boardRedo()}
  else if(mod&&k==='d'){e.preventDefault();dupSel()}
  else if(mod&&k==='a'){e.preventDefault();boardSelectAll()}
  else if(mod&&k==='g'){e.preventDefault();e.shiftKey?bUngroup():bGroup()}
  else if(mod&&k==='l'){e.preventDefault();bLockToggle()}
  else if(mod&&k==='c'){bCopy(false)}
  else if(mod&&k==='x'){bCopy(true)}
  else if(mod&&(k==='0'||k==='1'||k==='2')){e.preventDefault();k==='0'?boardActual():k==='1'?boardFit():boardZoomSel()}
  else if(mod&&(k==='='||k==='+'||k==='-')){e.preventDefault();boardZoom(k==='-'?-1:1)}
  else if(e.key==='Tab'){if(one){e.preventDefault();e.shiftKey?spawnSibling(one):spawnChild(one)}}
  else if(e.key==='Enter'){if(one){e.preventDefault();bItemDbl(one)}}
  else if(e.key==='PageDown'||e.key==='PageUp'){if(bScenes().length){e.preventDefault();bStepScene(e.key==='PageDown'?1:-1)}}
  else if(e.key.startsWith('Arrow')){if(BSEL.size){e.preventDefault();const s=e.shiftKey?10:1;bNudge(e.key==='ArrowLeft'?-s:e.key==='ArrowRight'?s:0,e.key==='ArrowUp'?-s:e.key==='ArrowDown'?s:0)}else if(BX.scenes&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();bStepScene(e.key==='ArrowLeft'?1:-1)}}
  else if(!mod&&!e.altKey){if(k==='n')addNote();else if(k==='t')addText();else if(k==='p')boardMode('draw');else if(k==='c')boardMode('connect');else if(k==='v')boardMode('select')}
}
function boardKeyUp(e){if(e.key===' '&&BX.space){BX.space=false;refreshSelUI()}}

/* ---------- المشاركة برابط والتعاون الحيّ ----------
   اللوحة المشتركة لها صفّ في shared_boards (supabase/shared_boards.sql) وتوكن.
   المالك والشريك كلاهما يحفظان عبر board_share_save (قارن rev ثم بدّل).
   الدمج على مستوى العنصر: نحسب ما تغيّر محلّياً منذ آخر نسخة متزامنة (base)
   ونطبّقه فوق أحدث نسخة بعيدة — فلا يضيع تعديل طرفٍ على عناصر أخرى. */
const BSH={token:null,rev:0,baseData:null,base:null,canEdit:true,guest:false,ro:false,chan:null,live:false,pushT:null,busy:false,again:false,poll:null,me:null,peers:{},curT:0,needPaint:false};
const BSH_COLS=['#f5a623','#4dabf7','#69db7c','#ff8787','#b197fc','#63e6be','#ff85c0','#ffa94d'];
function bShLink(token){return location.origin+location.pathname.replace(/[^/]*$/,'')+'b.html?t='+token}
function bShData(b){return{name:b.name||'',items:b.items||[],edges:b.edges||[],scenes:b.scenes||[]}}
function bShIdx(d){const m=a=>new Map((a||[]).map(x=>[x.id,JSON.stringify(x)]));return{items:m(d.items),edges:m(d.edges),scenes:JSON.stringify(d.scenes||[]),name:d.name||''}}
function bShDiff(d,base){const one=(arr,bm)=>{const up=[],seen=new Set();(arr||[]).forEach(x=>{seen.add(x.id);if(bm.get(x.id)!==JSON.stringify(x))up.push(x)});return{up,del:[...bm.keys()].filter(id=>!seen.has(id))}};
  const i=one(d.items,base.items),e=one(d.edges,base.edges),sc=JSON.stringify(d.scenes||[]);
  return{i,e,scenes:sc!==base.scenes?d.scenes:undefined,name:(d.name||'')!==base.name?d.name:undefined,empty:!i.up.length&&!i.del.length&&!e.up.length&&!e.del.length&&sc===base.scenes&&(d.name||'')===base.name}}
function bShApply(r,df){const one=(arr,o)=>{const kill=new Set(o.del.concat(o.up.map(x=>x.id)));return (arr||[]).filter(x=>!kill.has(x.id)).concat(JSON.parse(JSON.stringify(o.up)))};
  const items=one(r.items,df.i),ids=new Set(items.map(x=>x.id));
  return{name:df.name!==undefined?df.name:(r.name||''),items,edges:one(r.edges,df.e).filter(e=>ids.has(e.from)&&ids.has(e.to)),scenes:df.scenes!==undefined?df.scenes:(r.scenes||[])}}
function bShSetLocal(d){if(!BRD)return;BRD.items=JSON.parse(JSON.stringify(d.items||[]));BRD.edges=JSON.parse(JSON.stringify(d.edges||[]));BRD.scenes=JSON.parse(JSON.stringify(d.scenes||[]));if(d.name)BRD.name=d.name;
  BSEL=new Set([...BSEL].filter(id=>BRD.items.some(i=>i.id===id)));if(BX.edge&&!bEdge(BX.edge))BX.edge=null;bShRepaint()}
// لا نعيد الرسم وسط كتابة أو سحب — نؤجّل حتى تنتهي
function bShRepaint(){if(bEditing()||BGEST){BSH.needPaint=true;setTimeout(bShRepaint,500);return}BSH.needPaint=false;boardPaint();const t=document.getElementById('bd_title');if(t&&document.activeElement!==t)t.value=BRD.name||''}
function bShOwnerCache(){if(BSH.guest||!BRD||!BRD.share)return;BRD.share.rev=BSH.rev;bTouch();save()}
function bShQueue(){if(!BSH.token||BSH.ro)return;clearTimeout(BSH.pushT);BSH.pushT=setTimeout(bShPush,500)}
async function bShPush(){if(!BSH.token||BSH.ro||!BRD)return;if(BSH.busy){BSH.again=true;return}
  const local=JSON.parse(JSON.stringify(bShData(BRD))),df=bShDiff(local,BSH.base);if(df.empty)return;
  BSH.busy=true;bShStatus('saving');let data=bShApply(BSH.baseData,df),rev=BSH.rev,ok=false;
  try{for(let k=0;k<4&&!ok;k++){const {data:r,error}=await sb.rpc('board_share_save',{p_token:BSH.token,p_data:data,p_rev:rev});if(error)throw error;
      if(r&&r.ok){ok=true;rev=r.rev}else if(r&&r.err==='conflict'){rev=r.rev;data=bShApply(r.data||{},df)}else{bShStatus(r&&r.err==='read_only'?'ro':'err');break}}}
  catch(e){bShStatus('err')}
  BSH.busy=false;
  if(ok){const remoteAdded=JSON.stringify(data)!==JSON.stringify(local);BSH.rev=rev;BSH.baseData=data;BSH.base=bShIdx(data);
    if(remoteAdded){const pend=bShDiff(bShData(BRD),bShIdx(local));bShSetLocal(pend.empty?data:bShApply(data,pend));if(!pend.empty)BSH.again=true}
    bShStatus('ok');bShOwnerCache();if(BSH.chan&&BSH.live)BSH.chan.send({type:'broadcast',event:'rev',payload:{rev}})}
  if(BSH.again){BSH.again=false;bShQueue()}}
async function bShPull(){if(!BSH.token||BSH.busy)return;if(!BSH.guest&&(CUR!=='boards'||!BRD||!BRD.share)){bShStop();return}try{const {data:r}=await sb.rpc('board_share_get',{p_token:BSH.token});if(!r||!r.ok){bShStatus('gone');return}
  BSH.ro=!r.can_edit;if(r.rev<=BSH.rev)return;const pend=BSH.base&&BRD?bShDiff(bShData(BRD),BSH.base):{empty:true};const d=Object.assign({items:[],edges:[],scenes:[]},r.data||{});
  BSH.rev=r.rev;BSH.baseData=d;BSH.base=bShIdx(d);bShSetLocal(pend.empty?d:bShApply(d,pend));if(!pend.empty)bShQueue();bShOwnerCache();bShStatus('ok')}catch(_){bShStatus('err')}}
function bShStatus(s){const el=document.getElementById('bd_shst');if(!el)return;const M={ok:['متزامن','#22c55e'],saving:['يحفظ…','#f5a623'],err:['غير متصل — سيُعاد المحاولة','#ef4444'],ro:['مشاهدة فقط','#9b9ba3'],gone:['الرابط موقوف','#ef4444']};const m=M[s]||M.ok;el.innerHTML=`<span style="width:7px;height:7px;border-radius:50%;background:${m[1]};display:inline-block"></span> ${m[0]}`;if(s==='err'){clearTimeout(BSH.retryT);BSH.retryT=setTimeout(bShQueue,4000)}}
function bShMe(){if(BSH.me)return BSH.me;let n='';try{n=localStorage.getItem('bd_guest_name')||''}catch(_){}
  if(!BSH.guest&&!n)n=(typeof S!=='undefined'&&S.settings&&S.settings.owner)||'إبراهيم';
  let id='';try{id=localStorage.getItem('bd_peer_id')||'';if(!id){id=uid();localStorage.setItem('bd_peer_id',id)}}catch(_){id=uid()}
  BSH.me={id,name:n||'ضيف',color:BSH_COLS[[...id].reduce((a,c)=>a+c.charCodeAt(0),0)%BSH_COLS.length]};return BSH.me}
// قناة Realtime: إشعار «نسخة جديدة» + الحاضرون + مؤشّرات الفأرة
function bShConnect(){bShDisconnect();BSH.peers={};const me=bShMe();
  try{const ch=sb.channel('board-'+BSH.token,{config:{broadcast:{self:false},presence:{key:me.id}}});
    ch.on('broadcast',{event:'rev'},p=>{if((p.payload||{}).rev>BSH.rev)bShPull()})
      .on('broadcast',{event:'cur'},p=>bShCursor(p.payload||{}))
      .on('presence',{event:'sync'},()=>{const st=ch.presenceState();BSH.peers={};Object.keys(st).forEach(k=>{if(k!==me.id&&st[k][0])BSH.peers[k]=st[k][0]});bShPeersUI()})
      .subscribe(s=>{BSH.live=s==='SUBSCRIBED';if(BSH.live)ch.track({name:me.name,color:me.color})});
    BSH.chan=ch}catch(_){BSH.live=false}
  clearInterval(BSH.poll);BSH.poll=setInterval(()=>{if(!BSH.live||document.visibilityState==='visible')bShPull()},BSH.live?20000:6000)}
function bShDisconnect(){clearInterval(BSH.poll);try{if(BSH.chan)sb.removeChannel(BSH.chan)}catch(_){}BSH.chan=null;BSH.live=false;document.querySelectorAll('.bd-peer-cur').forEach(n=>n.remove())}
function bShStop(){clearTimeout(BSH.pushT);bShDisconnect();BSH.token=null;BSH.rev=0;BSH.base=null;BSH.baseData=null;BSH.ro=false}
function bShPeersUI(){const el=document.getElementById('bd_peers');if(!el)return;const ps=Object.values(BSH.peers);
  el.innerHTML=ps.slice(0,5).map(p=>`<span class="bd-peer" title="${esc(p.name)}" style="background:${p.color}">${esc((p.name||'؟').trim().slice(0,1))}</span>`).join('')+(ps.length>5?`<span class="bd-peer">+${ps.length-5}</span>`:'');
  document.querySelectorAll('.bd-peer-cur').forEach(n=>{if(!BSH.peers[n.dataset.p])n.remove()})}
function bShCursor(c){if(!c.id||!BSH.peers[c.id])return;const w=document.getElementById('bd_world');if(!w)return;let n=w.querySelector('.bd-peer-cur[data-p="'+CSS.escape(c.id)+'"]');
  if(!n){const p=BSH.peers[c.id];n=document.createElement('div');n.className='bd-peer-cur';n.dataset.p=c.id;n.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l5 14 2-6 6-2z" fill="${p.color}" stroke="#fff" stroke-width="1"/></svg><span style="background:${p.color}">${esc(p.name)}</span>`;w.appendChild(n)}
  n.style.left=c.x+'px';n.style.top=c.y+'px';clearTimeout(n._t);n._t=setTimeout(()=>n.remove(),8000)}
function bShMoveCursor(e){if(!BSH.chan||!BSH.live||!BRD)return;const now=Date.now();if(now-BSH.curT<70)return;BSH.curT=now;const p=bWorldPt(e);BSH.chan.send({type:'broadcast',event:'cur',payload:{id:bShMe().id,x:Math.round(p.x),y:Math.round(p.y)}})}
// المالك: يبدأ المزامنة عند فتح لوحة مشتركة. النسخة البعيدة هي المرجع؛ وإن لم
// تتغيّر منذ آخر مزامنة (rev نفسه) تُرفع تعديلات المالك المحلّيّة فوقها.
async function bShOpenOwner(){const sh=BRD&&BRD.share;if(!sh||!sh.token||WS_DEMO||!USER)return;BSH.guest=false;BSH.token=sh.token;BSH.rev=0;
  const {data:r}=await Promise.resolve(sb.rpc('board_share_get',{p_token:sh.token})).catch(()=>({data:null}));if(!r||!r.ok){bShStatus('gone');BSH.token=null;return}
  const d=Object.assign({items:[],edges:[],scenes:[]},r.data||{});BSH.rev=r.rev;BSH.baseData=d;BSH.base=bShIdx(d);
  if(r.rev!==sh.rev)bShSetLocal(d);else bShQueue();bShOwnerCache();bShConnect();bShStatus('ok')}
async function boardShareMenu(){if(!BRD)return;const sh=BRD.share;
  if(WS_DEMO||!USER){alert('المشاركة تحتاج تسجيل الدخول بحسابك (لا تعمل في النسخة التجريبيّة).');return}
  if(!sh){openModal('مشاركة الخريطة',`<div class="badge-note" style="margin-bottom:12px"><i data-lucide="users"></i><div>تُنشئ رابطاً يفتح <b>هذه الخريطة وحدها</b> — من يملكه يرى اللوحة ويعدّل معك مباشرة (يضيف ملاحظات وصوراً ويرتّب)، بلا حساب، ولا يرى أيّ شيء آخر من نظامك.</div></div>
      <div class="field"><label>صلاحيّة الرابط</label><select id="sh_edit"><option value="1">يقدر يعدّل ويضيف</option><option value="0">مشاهدة فقط</option></select></div>`,async()=>{
      const edit=document.getElementById('sh_edit').value==='1';const {data,error}=await sb.from('shared_boards').upsert({board_id:BRD.id,name:BRD.name,data:bShData(BRD),can_edit:edit},{onConflict:'owner,board_id'}).select('id,token,rev').single();
      if(error){alert('تعذّر إنشاء الرابط: '+error.message+'\n\nتأكّد أنّ ملف supabase/shared_boards.sql مُشغَّل في Supabase.');return}
      BRD.share={id:data.id,token:data.token,rev:data.rev,edit};saveBoard();closeModal();await bShOpenOwner();boardShareMenu()});refreshIcons();return}
  const url=bShLink(sh.token);
  openModal('مشاركة الخريطة',`<div class="field"><label>رابط الخريطة</label><div style="display:flex;gap:6px"><input id="sh_url" value="${esc(url)}" readonly dir="ltr" onclick="this.select()"><button type="button" class="btn btn-gold btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('sh_url').value).then(()=>boardHint('نُسخ الرابط'))"><i data-lucide="copy"></i></button></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('خريطة «'+(BRD.name||'')+'» — افتحها ونعدّل عليها سوا:\n'+url)}"><i data-lucide="message-circle"></i> إرسال واتساب</a></div>
    <div class="field"><label>الصلاحيّة</label><select id="sh_edit"><option value="1" ${sh.edit!==false?'selected':''}>يقدر يعدّل ويضيف</option><option value="0" ${sh.edit===false?'selected':''}>مشاهدة فقط</option></select></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn btn-ghost btn-sm" onclick="bShRotate()"><i data-lucide="refresh-cw"></i> رابط جديد (يلغي القديم)</button><button type="button" class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="bShUnshare()"><i data-lucide="link-2-off"></i> إيقاف المشاركة</button></div>`,
  async()=>{const edit=document.getElementById('sh_edit').value==='1';const {error}=await sb.from('shared_boards').update({can_edit:edit}).eq('id',sh.id);if(error){alert(error.message);return}sh.edit=edit;saveBoard();closeModal()});refreshIcons()}
async function bShRotate(){const sh=BRD&&BRD.share;if(!sh||!confirm('إنشاء رابط جديد؟ الرابط القديم يتوقّف فوراً.'))return;const a=new Uint8Array(18);crypto.getRandomValues(a);const tok=[...a].map(b=>b.toString(16).padStart(2,'0')).join('');
  const {error}=await sb.from('shared_boards').update({token:tok}).eq('id',sh.id);if(error){alert(error.message);return}sh.token=tok;saveBoard();closeModal();await bShOpenOwner();boardShareMenu()}
async function bShUnshare(){const sh=BRD&&BRD.share;if(!sh||!confirm('إيقاف المشاركة؟ الرابط يتوقّف، واللوحة تبقى عندك كما هي.'))return;const {error}=await sb.from('shared_boards').delete().eq('id',sh.id);if(error){alert(error.message);return}
  bShStop();delete BRD.share;saveBoard();closeModal();boardPaint();boardHint('أُوقفت المشاركة')}
// رفع صورة الشريك عبر الدالّة الحافّة (تتحقّق من التوكن) بعد تصغيرها
function bShUpload(f,at){boardHint('جارٍ رفع الصورة…');const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const m=Math.max(img.naturalWidth,img.naturalHeight)||1,k=Math.min(1,1800/m),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const png=f.type==='image/png';c.toBlob(async bl=>{try{const fd=new FormData();fd.append('token',BSH.token);fd.append('file',new File([bl],'img.'+(png?'png':'jpg'),{type:bl.type}));
      const r=await fetch(SUPA_URL+'/functions/v1/board-upload',{method:'POST',headers:{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY},body:fd});const j=await r.json();if(!j.ok)throw new Error(j.err);bPlaceImage(j.url,at)}catch(e){boardHint('');alert('تعذّر رفع الصورة: '+(e.message||e))}},png?'image/png':'image/jpeg',.86)};img.src=rd.result};rd.readAsDataURL(f)}
// صفحة الشريك (b.html): تفتح اللوحة وحدها
async function openSharedBoard(token){BSH.guest=true;BSH.token=token;const main=document.getElementById('main');
  const {data:r}=await Promise.resolve(sb.rpc('board_share_get',{p_token:token})).catch(()=>({data:null}));
  if(!r||!r.ok){main.innerHTML=`<div style="max-width:420px;margin:18vh auto;text-align:center"><h2>الرابط غير متاح</h2><p style="color:var(--muted)">ربما أوقف صاحب الخريطة المشاركة أو أنشأ رابطاً جديداً.</p></div>`;return}
  let n='';try{n=localStorage.getItem('bd_guest_name')||''}catch(_){}
  if(!n){n=(prompt('اسمك (يظهر لشريكك على اللوحة):','')||'').trim().slice(0,30);try{if(n)localStorage.setItem('bd_guest_name',n)}catch(_){}}
  const d=Object.assign({items:[],edges:[],scenes:[]},r.data||{});
  S.boards=[{id:'shared',name:r.name||d.name||'خريطة مشتركة',items:JSON.parse(JSON.stringify(d.items)),edges:JSON.parse(JSON.stringify(d.edges)),scenes:JSON.parse(JSON.stringify(d.scenes||[])),view:{x:0,y:0,zoom:1}}];
  BSH.rev=r.rev;BSH.baseData=d;BSH.base=bShIdx(d);BSH.ro=!r.can_edit;document.title=S.boards[0].name+' — خريطة مشتركة';
  openBoard('shared');setTimeout(()=>boardFit(),60);bShConnect();bShStatus(BSH.ro?'ro':'ok')}

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
  migrateCompanyData(S);
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
  go('workspace');if(typeof calInit==='function')calInit();
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
