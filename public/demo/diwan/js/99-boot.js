/*
 * 99-boot.js — الإقلاع: كلّ جملة تنفيذيّة في اللوحة، بترتيبها الأصليّ
 * ─────────────────────────────────────────────────────────────────────────
 * يُحمَّل أخيراً، بعد أن تكون كلّ الدوالّ في 01..19 معرّفة — وهو بالضبط ما
 * كان الرفع (hoisting) يضمنه حين كانت اللوحة سكربتاً واحداً. فالتنفيذ هنا:
 * كلّ الدوالّ موجودة، ثمّ هذه الجمل بالترتيب نفسه الذي كُتبت به.
 * كلّ جملة موسومة بملفّ قسمها الأصليّ وسطرها في index.html القديم.
 * ⚠️ لا تنقل جملة من هنا إلى ملفّ نطاق إلا إن كانت خاملة (لا نداء ولا قراءة
 *    اسم عند التهيئة) — وإلا عادت مشكلة الترتيب.
 */
/* ⤶ 01-core.js · سطر الأصل 764 */
const sb=(SUPA_URL&&SUPA_KEY)?window.supabase.createClient(SUPA_URL,SUPA_KEY):null;
;

/* ⤶ 01-core.js · سطر الأصل 874 */
let S=load();
;

/* ⤶ 02-shell.js · سطر الأصل 1001 */
const RENDER={home:renderHome,desktop:renderDesktop,workspace:renderWorkspace,dashboards:renderDashboards,sales:renderSales,crm:renderCRM,habits:renderHabits,pipeline:renderPipeline,contacts:renderContacts,products:renderProducts,subs:renderSubscriptions,appointments:renderAppointments,calendar:renderCalendar,projects:renderProjects,blog:renderBlog,newsletter:renderNewsletter,invoicing:renderInvoicing,quotedesign:renderQuoteDesign,accounting:renderAccounting,pos:renderPOS,suppliers:renderSuppliers,boards:renderBoards,lab:renderLab,ideas:renderIdeas,team:renderTeam,settings:renderSettings};
/* حزمة المنظمات (js/20..23-org-*.js) — تُسجَّل فقط إن كانت محمّلة (orgSuite:true) */
if(typeof renderTasks==='function')Object.assign(RENDER,{tasks:renderTasks,library:renderLibrary,inbox:renderInbox,site:renderSite,finance:renderFinance,requests:renderRequests});
if(typeof renderLedgerApp==='function')RENDER.ledger=renderLedgerApp;
if(typeof ERP_MODS==='object')Object.keys(ERP_MODS).forEach(k=>{RENDER[k]=window['renderErp_'+k];});
;

/* ⤶ 02-shell.js · سطر الأصل 1002 */
const NAV=[{id:'home',name:'الرئيسية',icon:'home'},{id:'desktop',name:'المكتب',icon:'layout-grid'},...APPS,{id:'team',name:'الفريق',icon:'users'}];
;

/* ⤶ 04-home.js */
document.addEventListener('click',(e)=>{
  const link=e.target.closest('.sidebar .nav a, .sidebar .nav-foot a');
  if(link){document.getElementById('sidebar')?.classList.remove('open');}
});
;

/* ⤶ 06-pipeline-tasks.js · سطر الأصل 2574 */
window.pickPrio=function(p){const h=document.getElementById('o_prio');if(h)h.value=p;document.querySelectorAll('#o_prio_pick button').forEach(b=>{const on=b.dataset.p===p,c=PRIO[b.dataset.p].c;b.style.borderColor=on?c:'var(--line)';b.style.background=on?c+'22':'transparent';b.style.color=on?'#fff':'var(--ink)'})};
;

/* ⤶ 10-projects.js · سطر الأصل 3745 */
const RBASE=location.origin+location.pathname.replace(/index\.html$/,'')+'r.html';
;

/* ⤶ 15-calendar.js · سطر الأصل 5470 */
let calRef=new Date();
;

/* ⤶ 18-workspace.js · سطر الأصل 5958 */
let WS_DEMO=/[?&]demo=/.test(location.search);
;

/* ⤶ 19-freeform.js · سطر الأصل 6222 */
let BRD=null,BSEL=new Set(),BMODE='select',BFROM=null,BTMP=null,BGEST=null,BEDIT=false,BCUR=null,BUNDO=[],BVT=null;
;

/* ⤶ 19-freeform.js · سطر الأصل 6223 */
const BPTRS=new Map();
;

/* ⤶ 19-freeform.js · سطر الأصل 6548 */
if(sb)sb.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){RECOVERY_MODE=true;showReset();return}
  if(event==='SIGNED_OUT'){USER=null;STATE_ID=null}
});
;

/* ⤶ 19-freeform.js · سطر الأصل 6577 */
document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.matches&&t.matches('input[type=number]')){try{t.select()}catch(_){}}});
;

/* ⤶ 19-freeform.js · سطر الأصل 6582 */
bootstrap();
;
