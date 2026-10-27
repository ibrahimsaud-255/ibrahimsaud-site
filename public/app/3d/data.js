/*
 * data.js — بيانات «العالم» (/app/3d/): قراءة فقط.
 * ─────────────────────────────────────────────────────────────────────────
 * يعيد استخدام تعريفات النظام نفسها (01-core للحالة الافتراضيّة، 05-helpers
 * لحساب الفواتير، 04-home لمحصّل الشهر) فتطابق الأرقامُ اللوحةَ حرفيّاً.
 * لا يكتب أبداً: أيّ عمل يتمّ في النظام الحقيقيّ داخل الإطار، فلا كاتب ثانٍ
 * على صفّ app_state.
 */
const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
let S=JSON.parse(JSON.stringify(def));

const W3D={
  demo:/[?&]demo=/.test(location.search),
  signed:false,
  // تحميل كامل: الجلسة ثمّ السحابة (مصدر الحقيقة)
  async load(){
    if(this.demo){this._local('ws_demo_v1');return w3dKpis()}
    try{const {data}=await sb.auth.getSession();const u=data&&data.session&&data.session.user;this.signed=!!(u&&u.email&&u.email.toLowerCase()===ADMIN_EMAIL)}catch(_){this.signed=false}
    if(!this.signed)return w3dKpis();
    this._local(KEY);
    try{const {data:rows,error}=await sb.from('app_state').select('data').limit(1);if(!error&&rows&&rows[0])S=deepMerge(JSON.parse(JSON.stringify(def)),rows[0].data||{})}catch(_){}
    return w3dKpis();
  },
  // بعد إغلاق النظام: الإطار كتب localStorage فوراً (والسحابة بتأخير)، فنقرأ المحلّيّ
  async reload(){
    if(this.demo){this._local('ws_demo_v1');return w3dKpis()}
    if(!this.signed)return this.load();
    this._local(KEY);return w3dKpis();
  },
  _local(k){try{const r=localStorage.getItem(k);if(r)S=deepMerge(JSON.parse(JSON.stringify(def)),JSON.parse(r))}catch(_){}}
};

function w3dKpis(){
  const K={months:[],clients:[],stages:[],habits:{total:0,done:0},yearCollected:0,subsCount:0,subsMonthly:0,contacts:0,signed:W3D.signed||W3D.demo,demo:W3D.demo,owner:'إبراهيم سعود',collected:0,due:0,quotes:0,taskCount:0,tasks:[],
    month:new Date().toLocaleDateString('ar-EG-u-nu-latn',{month:'long'}),cur:'ر.س'};
  if(!K.signed)return K;
  try{
    K.owner=S.settings.owner||K.owner;K.cur=S.settings.currency||K.cur;
    K.collected=homeMonthCollected(today().slice(0,7));
    K.due=(S.invoices||[]).filter(i=>i.status==='unpaid'||i.status==='partial').reduce((a,i)=>a+invDue(i),0);
    K.quotes=(S.sales||[]).filter(q=>q.status==='draft'||q.status==='sent').length;
    const tasks=[];(S.projects||[]).forEach(p=>{if(p.closed)return;(p.tasks||[]).forEach(t=>{if(!t.done&&!t.archived&&t.title)tasks.push({title:t.title,proj:p.title||''})})});
    K.taskCount=tasks.length;K.tasks=tasks.slice(0,12);
    K.months=w3dMonths();K.clients=w3dClients();K.stages=w3dStages();K.habits=w3dHabits();
    const y=String(new Date().getFullYear());K.yearCollected=K.months.filter(m=>m.key.startsWith(y)).reduce((a,m)=>a+m.collected,0);
    const subs=(S.subscriptions||[]).filter(x=>!x.cancelled&&!x.archived);K.subsCount=subs.length;
    K.subsMonthly=subs.reduce((a,x)=>a+(Number(x.sar)||0)/(x.cycle==='yearly'?12:1),0);
    K.contacts=(S.contacts||[]).length;
  }catch(e){console.warn('w3dKpis',e)}
  return K;
}
// آخر ١٢ شهراً: المحصّل (كما في الرئيسية) والمفوتر وعدد الفواتير — لأعمدة «وادي المبيعات»
function w3dMonths(){const out=[],now=new Date();for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),ym=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const inv=(S.invoices||[]).filter(x=>(x.date||'').slice(0,7)===ym);
  out.push({key:ym,label:d.toLocaleDateString('ar-EG-u-nu-latn',{month:'short'}),title:d.toLocaleDateString('ar-EG-u-nu-latn',{month:'long',year:'numeric'}),value:homeMonthCollected(ym),invoiced:inv.reduce((a,x)=>a+invTotal(x),0),count:inv.length,collected:homeMonthCollected(ym)})}return out}
// أكبر ١٢ عميلاً بإجماليّ الفواتير — وضع «لكلّ عميل»
function w3dClients(){const m={};(S.invoices||[]).forEach(x=>{const n=(x.contactId&&contactName(x.contactId))||x.client||'بلا اسم';const o=m[n]||(m[n]={label:n,title:n,value:0,invoiced:0,collected:0,count:0});const t=invTotal(x);o.value+=t;o.invoiced+=t;o.collected+=invPaid(x);o.count++});
  return Object.values(m).sort((a,b)=>b.value-a.value).slice(0,12)}
// مراحل العملاء: عددها وقيمتها — فوانيس «المجلس»
function w3dStages(){const cs=(S.contacts||[]).filter(c=>(c.type||'عميل')!=='مورد');return (S.clientStages||[]).map(st=>{const l=cs.filter(c=>(c.stageKey||S.clientStages[0].key)===st.key);return {label:st.label,count:l.length,value:l.reduce((a,c)=>a+Number(c.value||0),0),lost:!!st.lost,final:!!st.final}})}
function w3dHabits(){const h=S.habits||{};const list=Array.isArray(h.list)?h.list:[];const log=(h.log||{})[localDay()]||{};return {total:list.length,done:list.filter(x=>log[x.id]).length}}
window.W3D=W3D;
