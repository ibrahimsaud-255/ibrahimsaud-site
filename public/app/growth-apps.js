/* ============================================================
   تطبيقات النمو — خطة المشروع التنفيذية + بنك الأفكار
   تعمل على نفس مخزن النظام (S + save) وتتزامن سحابياً
   ============================================================ */

/* ── خطة المشروع: نموذج تنفيذي بشريط إنجاز ─────────────── */
/* كل عنصر: [النص, منجز؟, الهدف/التكلفة المتوقعة بالريال, المصروف الفعلي, مؤجّل؟] */
const PLAN_DEFAULT = [
  { phase: "التجهيز التقني", items: [
    ["إصلاح المنصة وتشغيلها بالكامل", true, 0, 0, false],
    ["ربط بوابة الدفع Telr واختبارها", true, 0, 0, false],
    ["تسجيل الدخول: Google + Apple + بريد", true, 0, 0, false],
    ["الفترة المجانية حتى 15 سبتمبر", true, 0, 0, false],
    ["رخصة مدى الحياة 99 ريال (500 مقعد)", true, 0, 0, false],
    ["رفع أغلفة كل المواد", false, 0, 0, false],
    ["مفاتيح Clerk للإنتاج", false, 0, 0, false],
  ]},
  { phase: "المحل والشاشة التفاعلية", items: [
    ["تجهيز الشاشة (ستاند + كفرات) في المحل", false, 0, 0, false],
    ["تشغيل المنصة على الشاشة بوضع العرض", false, 0, 0, false],
    ["تجربة: زائر يختار أسئلة ويطبع عينة", false, 0, 0, false],
    ["تسعير طباعة الكميات وإعلانها بالمحل", false, 0, 0, false],
    ["لافتة/عرض يشرح التجربة للزوار", false, 0, 0, false],
  ]},
  { phase: "الإطلاق والتسويق", items: [
    ["محتوى تسويقي: المنصة مجانية شهرين", false, 0, 0, false],
    ["حملات قبل بداية الدراسة", false, 0, 0, false],
    ["استهداف المعلمين والمعلمات", false, 0, 0, false],
    ["إطلاق المحل مع بداية الدراسة", false, 0, 0, false],
  ]},
  { phase: "ما بعد الإطلاق", items: [
    ["متابعة التسجيلات يومياً", false, 0, 0, false],
    ["جمع ملاحظات أول 100 معلم", false, 0, 0, false],
    ["تفعيل رخص المدارس والمؤسسات", false, 0, 0, false],
  ]},
];

function planData(){
  if(!S.projPlanV2){
    S.projPlanV2 = PLAN_DEFAULT.map(p=>({phase:p.phase, items:p.items.map(([t,d,c,s,df])=>({id:'t'+Math.random().toString(36).slice(2,9), t, done:d, cost:c||0, spent:s||0, deferred:!!df}))}));
    save();
  }
  // ترقية العناصر القديمة التي لا تحمل حقول الميزانية
  S.projPlanV2.forEach(p=>p.items.forEach(it=>{
    if(it.cost==null) it.cost=0;
    if(it.spent==null) it.spent=0;
    if(it.deferred==null) it.deferred=false;
  }));
  return S.projPlanV2;
}
function planMoney(n){ n=Number(n)||0; return n.toLocaleString('en-US')+' ر.س'; }
function renderPlan(){
  const data=planData();
  const all=data.flatMap(p=>p.items); const done=all.filter(i=>i.done).length;
  const pct=all.length?Math.round(done/all.length*100):0;
  // حسابات الميزانية — النشط = غير المؤجّل، والمؤجّل يُعرض منفصلاً
  const active=all.filter(i=>!i.deferred);
  const budget=active.reduce((s,i)=>s+(Number(i.cost)||0),0);
  const spent=active.reduce((s,i)=>s+(Number(i.spent)||0),0);
  const remain=budget-spent;
  const deferredCost=all.filter(i=>i.deferred).reduce((s,i)=>s+(Number(i.cost)||0),0);
  const bpct=budget?Math.min(Math.round(spent/budget*100),100):0;
  const over=spent>budget;
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="target"></i> خطة المشروع</h1>
      <button class="btn btn-ghost btn-sm" onclick="planAddPhase()"><i data-lucide="plus"></i> مرحلة جديدة</button></div>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b style="font-size:1.1em">الإنجاز الكلي</b>
        <span style="font-weight:900;font-size:1.5em" class="gradient-text-gold">${pct}%</span>
      </div>
      <div style="height:14px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden">
        <div style="height:100%;width:${pct}%;border-radius:99px;background:linear-gradient(90deg,#f5c542,#22c55e);transition:width .6s ease"></div>
      </div>
      <div style="opacity:.6;font-size:.85em;margin-top:8px">${done} من ${all.length} مهمة منجزة</div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <b style="font-size:1.1em"><i data-lucide="wallet"></i> ميزانية الإطلاق</b>
        <span style="font-weight:900;font-size:1.15em;color:${over?'#ef4444':'#22c55e'}">${over?'تجاوز':'متبقٍّ'} ${planMoney(Math.abs(remain))}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:10px;text-align:center">
          <div style="opacity:.55;font-size:.78em;margin-bottom:4px">المتوقع</div>
          <div style="font-weight:800;font-size:1.05em">${planMoney(budget)}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:10px;text-align:center">
          <div style="opacity:.55;font-size:.78em;margin-bottom:4px">المصروف</div>
          <div style="font-weight:800;font-size:1.05em;color:#f5c542">${planMoney(spent)}</div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:10px;text-align:center">
          <div style="opacity:.55;font-size:.78em;margin-bottom:4px">${over?'التجاوز':'المتبقي'}</div>
          <div style="font-weight:800;font-size:1.05em;color:${over?'#ef4444':'#22c55e'}">${planMoney(Math.abs(remain))}</div>
        </div>
      </div>
      <div style="height:12px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden">
        <div style="height:100%;width:${bpct}%;border-radius:99px;background:${over?'#ef4444':'linear-gradient(90deg,#f5c542,#22c55e)'};transition:width .6s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;opacity:.6;font-size:.82em;margin-top:8px">
        <span>صُرف ${bpct}% من الميزانية المتوقعة</span>
        ${deferredCost?`<span><i data-lucide="clock"></i> مؤجّل: ${planMoney(deferredCost)}</span>`:''}
      </div>
    </div>

    ${data.map((p,pi)=>{
      const pd=p.items.filter(i=>i.done).length;
      const ppct=p.items.length?Math.round(pd/p.items.length*100):0;
      const pBudget=p.items.filter(i=>!i.deferred).reduce((s,i)=>s+(Number(i.cost)||0),0);
      const pSpent=p.items.filter(i=>!i.deferred).reduce((s,i)=>s+(Number(i.spent)||0),0);
      return `<div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <h3 style="margin:0"><i data-lucide="${ppct===100?'check-circle':'circle-dashed'}"></i> ${esc(p.phase)} <span style="opacity:.5;font-size:.8em">(${pd}/${p.items.length})</span></h3>
          <div style="display:flex;gap:6px;align-items:center">
            ${pBudget?`<span style="font-size:.82em;opacity:.7">${planMoney(pSpent)} / ${planMoney(pBudget)}</span>`:''}
            <button class="btn btn-ghost btn-sm" onclick="planAddItem(${pi})"><i data-lucide="plus"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="planDelPhase(${pi})"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div style="height:6px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;margin:8px 0 12px">
          <div style="height:100%;width:${ppct}%;background:${ppct===100?'#22c55e':'#f5c542'};transition:width .4s"></div>
        </div>
        ${p.items.map((it,ii)=>{
          const cost=Number(it.cost)||0, sp=Number(it.spent)||0;
          const ipct=cost?Math.min(Math.round(sp/cost*100),100):0;
          const iover=sp>cost && cost>0;
          return `
          <div style="padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.05);${it.deferred?'opacity:.55':''}">
            <div style="display:flex;align-items:center;gap:10px">
              <button onclick="planToggle(${pi},${ii})" class="btn ${it.done?'btn-gold':'btn-ghost'} btn-sm" style="min-width:34px;padding:6px"><i data-lucide="${it.done?'check':'circle'}"></i></button>
              <span style="flex:1;${it.done?'text-decoration:line-through;opacity:.5':''}">${esc(it.t)}${it.deferred?' <span style="font-size:.72em;background:rgba(148,163,184,.2);color:#94a3b8;padding:1px 7px;border-radius:99px;margin-inline-start:4px">لاحقاً</span>':''}</span>
              <button class="btn btn-ghost btn-sm" title="${it.deferred?'إرجاع للخطة الحالية':'تأجيل لاحقاً'}" onclick="planDefer(${pi},${ii})" style="opacity:.6"><i data-lucide="${it.deferred?'rotate-ccw':'clock'}"></i></button>
              <button class="btn btn-ghost btn-sm" title="التكلفة والمصروف" onclick="planEditCost(${pi},${ii})" style="opacity:.6"><i data-lucide="banknote"></i></button>
              <button class="btn btn-ghost btn-sm" onclick="planEdit(${pi},${ii})" style="opacity:.5"><i data-lucide="pencil"></i></button>
              <button class="btn btn-ghost btn-sm" onclick="planDel(${pi},${ii})" style="opacity:.5"><i data-lucide="x"></i></button>
            </div>
            ${cost>0?`
            <div style="display:flex;align-items:center;gap:10px;margin:6px 0 0 44px;padding-inline-start:44px">
              <div style="flex:1;height:5px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden">
                <div style="height:100%;width:${ipct}%;background:${iover?'#ef4444':(ipct>=100?'#22c55e':'#f5c542')};transition:width .4s"></div>
              </div>
              <span style="font-size:.78em;white-space:nowrap;color:${iover?'#ef4444':'inherit'};opacity:.85">صُرف ${planMoney(sp)} من ${planMoney(cost)}</span>
            </div>`:`
            <div style="margin:4px 0 0 44px;padding-inline-start:44px">
              <button class="btn btn-ghost btn-sm" onclick="planEditCost(${pi},${ii})" style="opacity:.45;font-size:.78em;padding:2px 8px"><i data-lucide="plus"></i> إضافة تكلفة</button>
            </div>`}
          </div>`}).join('')}
      </div>`}).join('')}`;
  refreshIcons();
}
function planToggle(pi,ii){const d=planData();d[pi].items[ii].done=!d[pi].items[ii].done;save();renderPlan()}
function planDefer(pi,ii){const it=planData()[pi].items[ii];it.deferred=!it.deferred;save();renderPlan()}
function planEditCost(pi,ii){
  const it=planData()[pi].items[ii];
  const c=prompt('التكلفة المتوقعة للمهمة (بالريال):',it.cost||0);
  if(c===null)return;
  const s=prompt('المصروف الفعلي حتى الآن (بالريال):',it.spent||0);
  if(s===null)return;
  it.cost=Math.max(0,Number(c)||0);
  it.spent=Math.max(0,Number(s)||0);
  save();renderPlan();
}
function planAddItem(pi){const t=prompt('المهمة الجديدة:');if(!t)return;planData()[pi].items.push({id:'t'+Date.now(),t,done:false,cost:0,spent:0,deferred:false});save();renderPlan()}
function planEdit(pi,ii){const it=planData()[pi].items[ii];const t=prompt('تعديل المهمة:',it.t);if(!t)return;it.t=t;save();renderPlan()}
function planDel(pi,ii){if(!confirm('حذف المهمة؟'))return;planData()[pi].items.splice(ii,1);save();renderPlan()}
function planAddPhase(){const t=prompt('اسم المرحلة الجديدة:');if(!t)return;planData().push({phase:t,items:[]});save();renderPlan()}
function planDelPhase(pi){if(!confirm('حذف المرحلة وكل مهامها؟'))return;planData().splice(pi,1);save();renderPlan()}

/* ── بنك الأفكار ─────────────────────────────────────── */
const IDEA_CATS=[['idea','فكرة','lightbulb'],['script','نص فيديو','clapperboard'],['marketing','تسويق','megaphone'],['product','منتج','package'],['other','أخرى','archive']];
let IDEA_FILTER='all';
function ideasData(){if(!S.ideaBank){S.ideaBank=[];save()}return S.ideaBank}
function renderIdeas(){
  const list=ideasData();
  const shown=IDEA_FILTER==='all'?list:list.filter(i=>i.cat===IDEA_FILTER);
  const catName=c=>(IDEA_CATS.find(x=>x[0]===c)||['','أخرى'])[1];
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="lightbulb"></i> بنك الأفكار</h1>
      <span style="opacity:.6;font-size:.85em">${list.length} فكرة محفوظة</span></div>
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="plus"></i> فكرة جديدة</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <input id="ideaTitle" placeholder="عنوان الفكرة…" style="flex:1;min-width:180px" onkeydown="if(event.key==='Enter')ideaAdd()">
        <select id="ideaCat">${IDEA_CATS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select>
      </div>
      <textarea id="ideaBody" placeholder="التفاصيل / النص الكامل / الملاحظات… (اختياري)" style="width:100%;margin-top:8px;min-height:70px"></textarea>
      <button class="btn btn-gold btn-sm" style="margin-top:8px" onclick="ideaAdd()"><i data-lucide="save"></i> حفظ الفكرة</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn ${IDEA_FILTER==='all'?'btn-gold':'btn-ghost'} btn-sm" onclick="IDEA_FILTER='all';renderIdeas()">الكل (${list.length})</button>
      ${IDEA_CATS.map(c=>`<button class="btn ${IDEA_FILTER===c[0]?'btn-gold':'btn-ghost'} btn-sm" onclick="IDEA_FILTER='${c[0]}';renderIdeas()"><i data-lucide="${c[2]}"></i> ${c[1]} (${list.filter(i=>i.cat===c[0]).length})</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
      ${shown.slice().reverse().map(i=>`
        <div class="card" style="margin:0;${i.star?'border-color:rgba(245,197,66,.5)':''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <b style="flex:1">${esc(i.title)}</b>
            <button class="btn btn-ghost btn-sm" onclick="ideaStar('${i.id}')" style="padding:4px;color:${i.star?'#f5c542':'inherit'}"><i data-lucide="star"></i></button>
          </div>
          ${i.body?`<div style="opacity:.75;font-size:.88em;line-height:1.7;margin:6px 0;white-space:pre-wrap">${esc(i.body)}</div>`:''}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <span class="pill">${catName(i.cat)}</span>
            <div>
              <button class="btn btn-ghost btn-sm" onclick="ideaEdit('${i.id}')" style="opacity:.6"><i data-lucide="pencil"></i></button>
              <button class="btn btn-ghost btn-sm" onclick="ideaDel('${i.id}')" style="opacity:.6"><i data-lucide="trash-2"></i></button>
            </div>
          </div>
        </div>`).join('')||'<div class="card" style="opacity:.6;text-align:center">لا توجد أفكار في هذا التصنيف بعد — سجّل أول فكرة فوق ⬆</div>'}
    </div>`;
  refreshIcons();
}
function ideaAdd(){
  const t=document.getElementById('ideaTitle').value.trim();
  if(!t)return;
  ideasData().push({id:'i'+Date.now(),title:t,body:document.getElementById('ideaBody').value.trim(),cat:document.getElementById('ideaCat').value,star:false,at:Date.now()});
  save();renderIdeas();
  // احتساب عادة «كتابة فكرة» تلقائياً عند تسجيل فكرة اليوم
  if(typeof autoHabitByApp==='function')autoHabitByApp('ideas');
}
function ideaStar(id){const i=ideasData().find(x=>x.id===id);if(i){i.star=!i.star;save();renderIdeas()}}
function ideaEdit(id){const i=ideasData().find(x=>x.id===id);if(!i)return;const t=prompt('العنوان:',i.title);if(t===null)return;const b=prompt('التفاصيل:',i.body||'');i.title=t||i.title;if(b!==null)i.body=b;save();renderIdeas()}
function ideaDel(id){if(!confirm('حذف الفكرة نهائياً؟'))return;const d=ideasData();const ix=d.findIndex(x=>x.id===id);if(ix>-1){d.splice(ix,1);save();renderIdeas()}}
