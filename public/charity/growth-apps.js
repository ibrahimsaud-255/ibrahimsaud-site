/* ============================================================
   بنك الأفكار — يعمل على نفس مخزن النظام (S + save)
   ============================================================ */

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
