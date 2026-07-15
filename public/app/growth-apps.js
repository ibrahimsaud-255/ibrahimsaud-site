/* ============================================================
   تطبيقات النمو — خطة المشروع التنفيذية + بنك الأفكار
   تعمل على نفس مخزن النظام (S + save) وتتزامن سحابياً
   ============================================================ */

/* ── خطة المشروع: نموذج تنفيذي بشريط إنجاز ─────────────── */
const PLAN_DEFAULT = [
  { phase: "التجهيز التقني", items: [
    ["إصلاح المنصة وتشغيلها بالكامل", true],
    ["ربط بوابة الدفع Telr واختبارها", true],
    ["تسجيل الدخول: Google + Apple + بريد", true],
    ["الفترة المجانية حتى 15 سبتمبر", true],
    ["رخصة مدى الحياة 99 ريال (500 مقعد)", true],
    ["رفع أغلفة كل المواد", false],
    ["مفاتيح Clerk للإنتاج", false],
  ]},
  { phase: "المحل والشاشة التفاعلية", items: [
    ["تجهيز الشاشة (ستاند + كفرات) في المحل", false],
    ["تشغيل المنصة على الشاشة بوضع العرض", false],
    ["تجربة: زائر يختار أسئلة ويطبع عينة", false],
    ["تسعير طباعة الكميات وإعلانها بالمحل", false],
    ["لافتة/عرض يشرح التجربة للزوار", false],
  ]},
  { phase: "الإطلاق والتسويق", items: [
    ["محتوى تسويقي: المنصة مجانية شهرين", false],
    ["حملات قبل بداية الدراسة", false],
    ["استهداف المعلمين والمعلمات", false],
    ["إطلاق المحل مع بداية الدراسة", false],
  ]},
  { phase: "ما بعد الإطلاق", items: [
    ["متابعة التسجيلات يومياً", false],
    ["جمع ملاحظات أول 100 معلم", false],
    ["تفعيل رخص المدارس والمؤسسات", false],
  ]},
];

function planData(){
  if(!S.projPlanV2){
    S.projPlanV2 = PLAN_DEFAULT.map(p=>({phase:p.phase, items:p.items.map(([t,d])=>({id:'t'+Math.random().toString(36).slice(2,9), t, done:d}))}));
    save();
  }
  return S.projPlanV2;
}
function renderPlan(){
  const data=planData();
  const all=data.flatMap(p=>p.items); const done=all.filter(i=>i.done).length;
  const pct=all.length?Math.round(done/all.length*100):0;
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
    ${data.map((p,pi)=>{
      const pd=p.items.filter(i=>i.done).length;
      const ppct=p.items.length?Math.round(pd/p.items.length*100):0;
      return `<div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <h3 style="margin:0"><i data-lucide="${ppct===100?'check-circle':'circle-dashed'}"></i> ${esc(p.phase)} <span style="opacity:.5;font-size:.8em">(${pd}/${p.items.length})</span></h3>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" onclick="planAddItem(${pi})"><i data-lucide="plus"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="planDelPhase(${pi})"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div style="height:6px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;margin:8px 0 12px">
          <div style="height:100%;width:${ppct}%;background:${ppct===100?'#22c55e':'#f5c542'};transition:width .4s"></div>
        </div>
        ${p.items.map((it,ii)=>`
          <div style="display:flex;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.05)">
            <button onclick="planToggle(${pi},${ii})" class="btn ${it.done?'btn-gold':'btn-ghost'} btn-sm" style="min-width:34px;padding:6px"><i data-lucide="${it.done?'check':'circle'}"></i></button>
            <span style="flex:1;${it.done?'text-decoration:line-through;opacity:.5':''}">${esc(it.t)}</span>
            <button class="btn btn-ghost btn-sm" onclick="planEdit(${pi},${ii})" style="opacity:.5"><i data-lucide="pencil"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="planDel(${pi},${ii})" style="opacity:.5"><i data-lucide="x"></i></button>
          </div>`).join('')}
      </div>`}).join('')}`;
  refreshIcons();
}
function planToggle(pi,ii){const d=planData();d[pi].items[ii].done=!d[pi].items[ii].done;save();renderPlan()}
function planAddItem(pi){const t=prompt('المهمة الجديدة:');if(!t)return;planData()[pi].items.push({id:'t'+Date.now(),t,done:false});save();renderPlan()}
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
}
function ideaStar(id){const i=ideasData().find(x=>x.id===id);if(i){i.star=!i.star;save();renderIdeas()}}
function ideaEdit(id){const i=ideasData().find(x=>x.id===id);if(!i)return;const t=prompt('العنوان:',i.title);if(t===null)return;const b=prompt('التفاصيل:',i.body||'');i.title=t||i.title;if(b!==null)i.body=b;save();renderIdeas()}
function ideaDel(id){if(!confirm('حذف الفكرة نهائياً؟'))return;const d=ideasData();const ix=d.findIndex(x=>x.id===id);if(ix>-1){d.splice(ix,1);save();renderIdeas()}}
