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
  const K={signed:W3D.signed||W3D.demo,demo:W3D.demo,owner:'إبراهيم سعود',collected:0,due:0,quotes:0,taskCount:0,tasks:[],
    month:new Date().toLocaleDateString('ar-EG-u-nu-latn',{month:'long'}),cur:'ر.س'};
  if(!K.signed)return K;
  try{
    K.owner=S.settings.owner||K.owner;K.cur=S.settings.currency||K.cur;
    K.collected=homeMonthCollected(today().slice(0,7));
    K.due=(S.invoices||[]).filter(i=>i.status==='unpaid'||i.status==='partial').reduce((a,i)=>a+invDue(i),0);
    K.quotes=(S.sales||[]).filter(q=>q.status==='draft'||q.status==='sent').length;
    const tasks=[];(S.projects||[]).forEach(p=>{if(p.closed)return;(p.tasks||[]).forEach(t=>{if(!t.done&&!t.archived&&t.title)tasks.push({title:t.title,proj:p.title||''})})});
    K.taskCount=tasks.length;K.tasks=tasks.slice(0,12);
  }catch(e){console.warn('w3dKpis',e)}
  return K;
}
window.W3D=W3D;
