/* ============================================================
   حروف ودروس — إدارة المنصة كاملة داخل نظام إبراهيم سعود
   دمج أصلي عبر جسر آمن (x-system-token) — بدون iframe
   ============================================================ */
const HD_API='https://huroofduroos.com/api';
let HD_TAB='overview';const HD_CACHE={};
const HD_STATE={qPage:1,qSearch:'',qGrade:'',qSubject:'',qDiff:'',tqStatus:'pending_review',ticketOpen:null};

async function hdApi(path,opts){opts=opts||{};
  const {data:{session}}=await sb.auth.getSession();
  const headers=Object.assign({'x-system-token':(session&&session.access_token)||''},opts.headers||{});
  if(!(opts.body instanceof FormData))headers['Content-Type']=headers['Content-Type']||'application/json';
  const r=await fetch(HD_API+path,Object.assign({},opts,{headers}));
  if(!r.ok){let m='تعذّر الاتصال بمنصة حروف ودروس';try{const j=await r.json();if(j&&j.error)m=j.error}catch(_){}
    if(r.status===403)m='حسابك ('+((session&&session.user&&session.user.email)||'غير معروف')+') غير مصرّح له بإدارة منصة حروف ودروس.';
    throw new Error(m)}
  return r.json()}
function hdRows(j){if(Array.isArray(j))return j;return j.entries||j.rows||j.questions||j.tickets||j.books||[]}
function hdGo(tab){HD_TAB=tab;renderHuroof()}
function hdRefresh(){delete HD_CACHE[HD_TAB];renderHuroof()}
function hdDate(d){return d?String(d).slice(0,10):'—'}
function hdPill(txt,cls){return '<span class="pill '+(cls||'')+'">'+txt+'</span>'}
function hdStatusPill(s){const m={active:['نشط','done'],expired:['منتهي','unpaid'],cancelled:['ملغي','unpaid'],open:['مفتوحة','unpaid'],closed:['مغلقة','done'],replied:['تم الرد','done'],pending_review:['بانتظار المراجعة','unpaid'],approved:['مقبول','done'],rejected:['مرفوض','unpaid']};const x=m[s]||[s||'—',''];return hdPill(x[0],x[1])}
const HD_GRADES={1:'الأول',2:'الثاني',3:'الثالث',4:'الرابع',5:'الخامس',6:'السادس',7:'السابع',8:'الثامن',9:'التاسع',10:'العاشر',11:'الحادي عشر',12:'الثاني عشر'};
const HD_SUBJECTS={arabic:'اللغة العربية',math:'الرياضيات',science:'العلوم',social:'الدراسات الاجتماعية',english:'اللغة الإنجليزية',islamic:'التربية الإسلامية',quran:'القرآن الكريم',art:'التربية الفنية',digital:'المهارات الرقمية',lifeskills:'المهارات الحياتية',hadith:'الحديث',finance:'المعرفة المالية',critical:'التفكير الناقد',ai:'الذكاء الاصطناعي',geo:'الجغرافيا',sustainability:'التنمية المستدامة',stats:'الإحصاء',rhetoric:'الدراسات البلاغية',marketing:'الحملات التسويقية',writing:'الكتابة الوظيفية',law:'مبادئ القانون',health:'الرعاية الصحية',chemistry:'الكيمياء',biology:'الأحياء',physics:'الفيزياء'};
function hdSubj(id){return HD_SUBJECTS[id]||id||'—'}
const HD_TABS=[
 ['overview','النظرة العامة','layout-dashboard'],
 ['questions','إدارة الأسئلة','circle-help'],
 ['tq','أسئلة المعلمين','message-square'],
 ['pdf','مكتبة PDF','file-text'],
 ['extract','استخراج أسئلة AI','sparkles'],
 ['nafs','أوراق نافس','trophy'],
 ['teachers','المعلمون','users'],
 ['subs','المشتركون','credit-card'],
 ['waitlist','قائمة الانتظار','user-plus'],
 ['content','المحتوى','book-open'],
 ['tickets','خدمة العملاء','life-buoy'],
];
function renderHuroof(){
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="graduation-cap"></i> حروف ودروس — إدارة المنصة</h1>
      <button class="btn btn-ghost btn-sm" onclick="hdRefresh()"><i data-lucide="refresh-cw"></i> تحديث</button></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      ${HD_TABS.map(t=>`<button class="btn ${HD_TAB===t[0]?'btn-gold':'btn-ghost'} btn-sm" onclick="hdGo('${t[0]}')"><i data-lucide="${t[2]}"></i> ${t[1]}</button>`).join('')}
    </div>
    <div id="hdBody"><div class="card" style="text-align:center;padding:30px;opacity:.7">جارٍ تحميل بيانات المنصة…</div></div>`;
  refreshIcons();
  hdLoad(HD_TAB);
}
function hdEl(){return document.getElementById('hdBody')}
async function hdLoad(tab){
  try{
    if(tab==='overview')await hdTabOverview();
    else if(tab==='questions')await hdTabQuestions();
    else if(tab==='tq')await hdTabTQ();
    else if(tab==='pdf')await hdTabPdf();
    else if(tab==='extract')hdTabExtract();
    else if(tab==='nafs')await hdTabNafs();
    else if(tab==='teachers')await hdTabTeachers();
    else if(tab==='subs')await hdTabSubs();
    else if(tab==='waitlist')await hdTabWaitlist();
    else if(tab==='content')await hdTabContent();
    else if(tab==='tickets')await hdTabTickets();
    refreshIcons();
  }catch(e){
    if(hdEl())hdEl().innerHTML=`<div class="card"><h3><i data-lucide="shield-alert"></i> تعذّر الوصول</h3><div style="opacity:.85;line-height:1.8">${esc(e.message)}</div></div>`;
    refreshIcons();
  }
}
/* ── النظرة العامة ─────────────────────────────────────── */
async function hdTabOverview(){
  if(!HD_CACHE.overview){const [ext,base]=await Promise.all([hdApi('/admin/stats/extended'),hdApi('/admin/stats')]);HD_CACHE.overview={ext,base}}
  if(HD_TAB!=='overview'||!hdEl())return;
  const {ext,base}=HD_CACHE.overview;
  const days=ext.recentRegistrations||[];const tot=days.reduce((a,b)=>a+(b.count||0),0);
  const mx=days.length?Math.max(...days.map(x=>x.count)):0;
  hdEl().innerHTML=`
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#f5c542"><i data-lucide="users"></i></span><div class="v">${ext.totalTeachers}</div><div class="l">إجمالي المعلمين</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="credit-card"></i></span><div class="v">${ext.activeSubscribers}</div><div class="l">اشتراكات نشطة</div></div>
      <div class="stat"><span class="ic" style="color:#a855f7"><i data-lucide="user-plus"></i></span><div class="v">${tot}</div><div class="l">تسجيلات آخر 30 يوم</div></div>
      <div class="stat"><span class="ic" style="color:#0ea5e9"><i data-lucide="mail"></i></span><div class="v">${base.waitlistCount}</div><div class="l">قائمة الانتظار</div></div>
      <div class="stat"><span class="ic" style="color:#14b8a6"><i data-lucide="book-open"></i></span><div class="v">${base.bookCount}</div><div class="l">الكتب في البنك</div></div>
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="life-buoy"></i></span><div class="v">${base.openTicketsCount}</div><div class="l">تذاكر مفتوحة</div></div>
      <div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="clock"></i></span><div class="v">${ext.pendingTeacherQuestions}</div><div class="l">أسئلة معلمين معلّقة</div></div>
      <div class="stat"><span class="ic" style="color:#6366f1"><i data-lucide="file-text"></i></span><div class="v">${ext.pdfCount}</div><div class="l">ملفات PDF فعّالة</div></div>
    </div>
    <div class="card"><h3><i data-lucide="trending-up"></i> التسجيلات اليومية — آخر 30 يوم</h3>
      ${days.length?`<div style="display:flex;align-items:flex-end;gap:3px;height:120px;padding-top:10px">${days.map(r=>`<div title="${r.date}: ${r.count}" style="flex:1;height:${mx?Math.max(6,Math.round(r.count/mx*100)):6}%;background:linear-gradient(180deg,#f5c542,#b8860b);border-radius:4px 4px 0 0;min-width:6px"></div>`).join('')}</div>`:'<div style="opacity:.6;padding:14px">لا توجد تسجيلات خلال الفترة.</div>'}
    </div>`;
}
/* ── إدارة الأسئلة ─────────────────────────────────────── */
function hdQParams(){const p=new URLSearchParams();p.set('page',HD_STATE.qPage);p.set('limit','50');
  if(HD_STATE.qSearch)p.set('search',HD_STATE.qSearch);if(HD_STATE.qGrade)p.set('grade',HD_STATE.qGrade);
  if(HD_STATE.qSubject)p.set('subject',HD_STATE.qSubject);if(HD_STATE.qDiff)p.set('difficulty',HD_STATE.qDiff);return p.toString()}
async function hdTabQuestions(){
  const d=await hdApi('/admin/questions?'+hdQParams());
  if(HD_TAB!=='questions'||!hdEl())return;
  const rows=hdRows(d);const pages=Math.max(1,Math.ceil((d.total||rows.length)/(d.limit||50)));
  const diffL={easy:['سهل','done'],medium:['متوسط',''],hard:['صعب','unpaid']};
  hdEl().innerHTML=`
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#f5c542"><i data-lucide="circle-help"></i></span><div class="v">${(d.total||0).toLocaleString('en')}</div><div class="l">إجمالي الأسئلة</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="check-circle"></i></span><div class="v">${(d.activeCount||0).toLocaleString('en')}</div><div class="l">مفعّلة</div></div>
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="pause-circle"></i></span><div class="v">${(d.inactiveCount||0).toLocaleString('en')}</div><div class="l">معطّلة</div></div>
    </div>
    <div class="card" style="margin-bottom:14px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input id="hdQSearch" placeholder="ابحث في الأسئلة…" value="${esc(HD_STATE.qSearch)}" onkeydown="if(event.key==='Enter')hdQFilter()" style="flex:1;min-width:170px">
      <select id="hdQGrade"><option value="">كل الصفوف</option>${Object.keys(HD_GRADES).map(g=>`<option value="${g}" ${HD_STATE.qGrade===g?'selected':''}>الصف ${HD_GRADES[g]}</option>`).join('')}</select>
      <select id="hdQSubject"><option value="">كل المواد</option>${Object.keys(HD_SUBJECTS).map(s=>`<option value="${s}" ${HD_STATE.qSubject===s?'selected':''}>${HD_SUBJECTS[s]}</option>`).join('')}</select>
      <select id="hdQDiff"><option value="">كل المستويات</option><option value="easy" ${HD_STATE.qDiff==='easy'?'selected':''}>سهل</option><option value="medium" ${HD_STATE.qDiff==='medium'?'selected':''}>متوسط</option><option value="hard" ${HD_STATE.qDiff==='hard'?'selected':''}>صعب</option></select>
      <button class="btn btn-gold btn-sm" onclick="hdQFilter()"><i data-lucide="filter"></i> تطبيق</button>
    </div></div>
    <div class="card"><h3><i data-lucide="circle-help"></i> الأسئلة — صفحة ${d.page||1} من ${pages}</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>السؤال</th><th>الصف</th><th>المادة</th><th>الصعوبة</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(q=>{const dl=diffL[q.difficulty]||[q.difficulty||'—','']; return `<tr>
      <td style="max-width:420px">${esc(q.question||'')}${q.options?`<div style="opacity:.55;font-size:.85em;margin-top:4px">${(q.options||[]).map((o,i)=>(i===q.correctIndex?'✓ ':'')+esc(o)).join(' · ')}</div>`:''}</td>
      <td>${HD_GRADES[q.gradeNumber]?'ال'+HD_GRADES[q.gradeNumber]:q.gradeNumber||'—'}</td><td>${hdSubj(q.subjectId)}</td>
      <td>${hdPill(dl[0],dl[1])}</td><td>${q.isActive?hdPill('مفعّل','done'):hdPill('معطّل','unpaid')}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" title="تعديل نص السؤال" onclick="hdQEdit('${q.id}')"><i data-lucide="pencil"></i></button>
        <button class="btn btn-ghost btn-sm" title="${q.isActive?'تعطيل':'تفعيل'}" onclick="hdQToggle('${q.id}')"><i data-lucide="${q.isActive?'pause':'play'}"></i></button>
        <button class="btn btn-ghost btn-sm" title="حذف" onclick="hdQDelete('${q.id}')"><i data-lucide="trash-2"></i></button>
      </td></tr>`}).join('')||'<tr><td colspan="6" style="opacity:.6">لا توجد نتائج.</td></tr>'}
    </tbody></table></div>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
      <button class="btn btn-ghost btn-sm" ${(d.page||1)<=1?'disabled':''} onclick="HD_STATE.qPage--;hdLoad('questions')"><i data-lucide="chevron-right"></i> السابق</button>
      <button class="btn btn-ghost btn-sm" ${(d.page||1)>=pages?'disabled':''} onclick="HD_STATE.qPage++;hdLoad('questions')">التالي <i data-lucide="chevron-left"></i></button>
    </div></div>`;
}
function hdQFilter(){HD_STATE.qSearch=document.getElementById('hdQSearch').value.trim();HD_STATE.qGrade=document.getElementById('hdQGrade').value;HD_STATE.qSubject=document.getElementById('hdQSubject').value;HD_STATE.qDiff=document.getElementById('hdQDiff').value;HD_STATE.qPage=1;hdLoad('questions')}
async function hdQToggle(id){try{await hdApi('/admin/questions/'+encodeURIComponent(id)+'/toggle',{method:'PATCH'});hdLoad('questions')}catch(e){alert(e.message)}}
async function hdQDelete(id){if(!confirm('حذف هذا السؤال نهائياً؟'))return;try{await hdApi('/admin/questions/'+encodeURIComponent(id),{method:'DELETE'});hdLoad('questions')}catch(e){alert(e.message)}}
async function hdQEdit(id){const t=prompt('نص السؤال الجديد:');if(!t)return;try{await hdApi('/admin/questions/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({question:t})});hdLoad('questions')}catch(e){alert(e.message)}}
/* ── أسئلة المعلمين ───────────────────────────────────── */
async function hdTabTQ(){
  const d=await hdApi('/admin/teacher-questions?status='+HD_STATE.tqStatus);
  if(HD_TAB!=='tq'||!hdEl())return;
  const rows=hdRows(d);
  hdEl().innerHTML=`
    <div class="card" style="margin-bottom:14px"><div style="display:flex;gap:6px;flex-wrap:wrap">
      ${[['pending_review','بانتظار المراجعة'],['approved','مقبولة'],['rejected','مرفوضة'],['all','الكل']].map(s=>`<button class="btn ${HD_STATE.tqStatus===s[0]?'btn-gold':'btn-ghost'} btn-sm" onclick="HD_STATE.tqStatus='${s[0]}';hdLoad('tq')">${s[1]}</button>`).join('')}
    </div></div>
    <div class="card"><h3><i data-lucide="message-square"></i> أسئلة المعلمين (${rows.length})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>السؤال</th><th>الصف/المادة</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(q=>`<tr><td style="max-width:420px">${esc(q.question||'')}${q.options?`<div style="opacity:.55;font-size:.85em;margin-top:4px">${(q.options||[]).map((o,i)=>(i===q.correctIndex?'✓ ':'')+esc(o)).join(' · ')}</div>`:''}</td>
      <td>${q.gradeNumber?'الصف '+(HD_GRADES[q.gradeNumber]||q.gradeNumber):'—'} · ${hdSubj(q.subjectId)}</td>
      <td>${hdStatusPill(q.status)}</td><td>${hdDate(q.createdAt)}</td>
      <td style="white-space:nowrap">${q.status==='pending_review'?`
        <button class="btn btn-gold btn-sm" onclick="hdTQReview(${q.id},'approve')"><i data-lucide="check"></i> قبول</button>
        <button class="btn btn-ghost btn-sm" onclick="hdTQReview(${q.id},'reject')"><i data-lucide="x"></i> رفض</button>`:'—'}
      </td></tr>`).join('')||'<tr><td colspan="5" style="opacity:.6">لا توجد أسئلة.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdTQReview(id,action){const note=prompt(action==='approve'?'ملاحظة القبول (اختياري):':'سبب الرفض (اختياري):')||'';
  try{await hdApi('/admin/teacher-questions/'+id+'/'+action,{method:'POST',body:JSON.stringify({reviewNote:note})});hdLoad('tq')}catch(e){alert(e.message)}}
/* ── مكتبة PDF ────────────────────────────────────────── */
async function hdTabPdf(){
  const d=await hdApi('/admin/pdf-library');
  if(HD_TAB!=='pdf'||!hdEl())return;
  const rows=hdRows(d);
  const typeL={worksheet:'ورقة عمل',test:'اختبار',summary:'ملخص',nafs:'نافس',other:'أخرى'};
  hdEl().innerHTML=`
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="upload"></i> رفع ملف جديد</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="file" id="hdPdfFile" accept="application/pdf" style="flex:1;min-width:180px">
        <select id="hdPdfGrade"><option value="">الصف (اختياري)</option>${Object.keys(HD_GRADES).map(g=>`<option value="${g}">الصف ${HD_GRADES[g]}</option>`).join('')}</select>
        <select id="hdPdfSubject"><option value="">المادة (اختياري)</option>${Object.keys(HD_SUBJECTS).map(s=>`<option value="${s}">${HD_SUBJECTS[s]}</option>`).join('')}</select>
        <select id="hdPdfType">${Object.keys(typeL).map(t=>`<option value="${t}">${typeL[t]}</option>`).join('')}</select>
        <button class="btn btn-gold btn-sm" onclick="hdPdfUpload()"><i data-lucide="upload"></i> رفع</button>
      </div><div id="hdPdfMsg" style="margin-top:8px;opacity:.8"></div></div>
    <div class="card"><h3><i data-lucide="file-text"></i> الملفات (${rows.length})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>الملف</th><th>الصف</th><th>المادة</th><th>النوع</th><th>أضيف</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(f=>`<tr><td>${esc(f.fileName||'—')}</td><td>${f.grade?('الصف '+(HD_GRADES[f.grade]||f.grade)):'—'}</td><td>${hdSubj(f.subject)}</td><td>${typeL[f.type]||f.type||'—'}</td><td>${hdDate(f.createdAt)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="hdPdfDownload('${f.id}')"><i data-lucide="download"></i> تحميل</button>
        <button class="btn btn-ghost btn-sm" onclick="hdPdfDelete('${f.id}')"><i data-lucide="trash-2"></i></button>
      </td></tr>`).join('')||'<tr><td colspan="6" style="opacity:.6">المكتبة فارغة.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdPdfUpload(){
  const inp=document.getElementById('hdPdfFile');const msg=document.getElementById('hdPdfMsg');
  const file=inp.files&&inp.files[0];if(!file){msg.textContent='اختر ملف PDF أولاً.';return}
  try{
    msg.textContent='جارٍ تجهيز الرفع…';
    const {uploadURL,objectPath}=await hdApi('/admin/pdf-library/upload-url',{method:'POST',body:JSON.stringify({fileName:file.name,contentType:'application/pdf'})});
    msg.textContent='جارٍ رفع الملف…';
    const up=await fetch(uploadURL,{method:'PUT',headers:{'Content-Type':'application/pdf'},body:file});
    if(!up.ok)throw new Error('فشل رفع الملف للتخزين');
    await hdApi('/admin/pdf-library',{method:'POST',body:JSON.stringify({fileName:file.name,objectPath,grade:document.getElementById('hdPdfGrade').value,subject:document.getElementById('hdPdfSubject').value,bookId:'',type:document.getElementById('hdPdfType').value})});
    msg.textContent='✓ تم الرفع بنجاح';hdLoad('pdf');
  }catch(e){msg.textContent='خطأ: '+e.message}
}
async function hdPdfDownload(id){try{const j=await hdApi('/admin/pdf-library/'+id+'/download');const u=j.url||j.downloadURL||j.signedUrl;if(u)window.open(u,'_blank');else alert('تعذّر إنشاء رابط التحميل')}catch(e){alert(e.message)}}
async function hdPdfDelete(id){if(!confirm('حذف هذا الملف من المكتبة؟'))return;try{await hdApi('/admin/pdf-library/'+id,{method:'DELETE'});hdLoad('pdf')}catch(e){alert(e.message)}}
/* ── استخراج أسئلة AI ─────────────────────────────────── */
function hdTabExtract(){
  if(!hdEl())return;
  hdEl().innerHTML=`
    <div class="card"><h3><i data-lucide="sparkles"></i> استخراج أسئلة من PDF بالذكاء الاصطناعي</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px">
        <input type="file" id="hdExFile" accept="application/pdf" style="flex:1;min-width:180px">
        <select id="hdExGrade">${Object.keys(HD_GRADES).map(g=>`<option value="${g}">الصف ${HD_GRADES[g]}</option>`).join('')}</select>
        <select id="hdExSubject">${Object.keys(HD_SUBJECTS).map(s=>`<option value="${s}">${HD_SUBJECTS[s]}</option>`).join('')}</select>
        <input id="hdExBook" placeholder="معرّف الكتاب (bookId)" style="width:170px">
        <input id="hdExChapter" placeholder="معرّف الفصل (chapterId)" style="width:170px">
        <button class="btn btn-gold btn-sm" onclick="hdExtract()"><i data-lucide="sparkles"></i> استخراج</button>
      </div>
      <div id="hdExMsg" style="margin-top:10px;opacity:.85"></div>
      <div id="hdExResult" style="margin-top:10px"></div>
    </div>`;
}
let HD_EX_RESULT=null,HD_EX_META=null;
async function hdExtract(){
  const f=document.getElementById('hdExFile').files[0];const msg=document.getElementById('hdExMsg');
  const meta={gradeNumber:document.getElementById('hdExGrade').value,subjectId:document.getElementById('hdExSubject').value,bookId:document.getElementById('hdExBook').value.trim(),chapterId:document.getElementById('hdExChapter').value.trim()};
  if(!f){msg.textContent='اختر ملف PDF.';return}
  if(!meta.bookId||!meta.chapterId){msg.textContent='معرّف الكتاب والفصل مطلوبان.';return}
  const fd=new FormData();fd.append('pdf',f);Object.keys(meta).forEach(k=>fd.append(k,meta[k]));
  msg.textContent='جارٍ الاستخراج بالذكاء الاصطناعي — قد يستغرق دقيقة…';
  try{
    const j=await hdApi('/admin/pdf-extractor/extract',{method:'POST',body:fd});
    HD_EX_RESULT=j.questions||j.entries||j;HD_EX_META=meta;
    const qs=Array.isArray(HD_EX_RESULT)?HD_EX_RESULT:[];
    msg.textContent='✓ استُخرج '+qs.length+' سؤال';
    document.getElementById('hdExResult').innerHTML=`
      ${qs.slice(0,20).map((q,i)=>`<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,.06)"><b>${i+1}.</b> ${esc(q.question||JSON.stringify(q).slice(0,120))}</div>`).join('')}
      ${qs.length?`<button class="btn btn-gold btn-sm" style="margin-top:10px" onclick="hdExSave()"><i data-lucide="save"></i> حفظ الأسئلة (${qs.length})</button>`:''}`;
    refreshIcons();
  }catch(e){msg.textContent='خطأ: '+e.message}
}
async function hdExSave(){
  const msg=document.getElementById('hdExMsg');msg.textContent='جارٍ الحفظ…';
  try{const j=await hdApi('/admin/pdf-extractor/save',{method:'POST',body:JSON.stringify(Object.assign({questions:HD_EX_RESULT},HD_EX_META))});
    msg.textContent='✓ '+(j.message||('تم حفظ '+(j.saved||j.count||'')+' سؤال'))}catch(e){msg.textContent='خطأ في الحفظ: '+e.message}
}
/* ── أوراق نافس ───────────────────────────────────────── */
async function hdTabNafs(){
  const j=await fetch(HD_API+'/worksheets/nafs/catalog').then(r=>r.json());
  if(HD_TAB!=='nafs'||!hdEl())return;
  const items=j.catalog||j.entries||j.items||(Array.isArray(j)?j:[]);
  hdEl().innerHTML=`
    <div class="badge-note"><i data-lucide="info"></i><div>كتالوج <b>أوراق نافس</b> المتاح في المنصة. توليد الأوراق يتم من حسابات المعلمين داخل المنصة، وهنا تستعرض المتاح.</div></div>
    <div class="card"><h3><i data-lucide="trophy"></i> الكتالوج (${items.length})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>#</th><th>العنوان</th><th>التفاصيل</th></tr></thead><tbody>
    ${items.map((it,i)=>`<tr><td>${i+1}</td><td>${esc(it.title||it.name||it.id||'—')}</td><td style="opacity:.7">${esc(it.description||[it.grade,it.subject].filter(Boolean).join(' · ')||'—')}</td></tr>`).join('')||'<tr><td colspan="3" style="opacity:.6">الكتالوج فارغ.</td></tr>'}
    </tbody></table></div></div>`;
}
/* ── المعلمون ─────────────────────────────────────────── */
async function hdTabTeachers(){
  const d=HD_CACHE.teachers||(HD_CACHE.teachers=await hdApi('/admin/teachers'));
  if(HD_TAB!=='teachers'||!hdEl())return;
  const verified=d.entries.filter(t=>t.isVerified).length;
  hdEl().innerHTML=`
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#f5c542"><i data-lucide="users"></i></span><div class="v">${d.count}</div><div class="l">إجمالي المعلمين</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="badge-check"></i></span><div class="v">${verified}</div><div class="l">موثّق</div></div>
      <div class="stat"><span class="ic" style="color:#0ea5e9"><i data-lucide="message-circle-question"></i></span><div class="v">${d.entries.reduce((a,t)=>a+(t.questionCount||0),0)}</div><div class="l">أسئلة مقترحة</div></div>
    </div>
    <div class="card"><h3><i data-lucide="users"></i> المعلمون (${d.count})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>الاسم</th><th>المدرسة</th><th>الأسئلة</th><th>موثّق</th><th>نشط</th><th>سُجّل في</th></tr></thead><tbody>
    ${d.entries.map(t=>`<tr><td>${esc(t.displayName||'—')}</td><td>${esc(t.schoolName||'—')}</td><td>${t.questionCount}</td>
      <td><button class="btn ${t.isVerified?'btn-gold':'btn-ghost'} btn-sm" onclick="hdToggleTeacher('${t.id}','isVerified',${!t.isVerified})">${t.isVerified?'موثّق ✓':'توثيق'}</button></td>
      <td><button class="btn ${t.isActive?'btn-gold':'btn-ghost'} btn-sm" onclick="hdToggleTeacher('${t.id}','isActive',${!t.isActive})">${t.isActive?'نشط':'موقوف'}</button></td>
      <td>${hdDate(t.createdAt)}</td></tr>`).join('')||'<tr><td colspan="6" style="opacity:.6">لا يوجد معلمون بعد.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdToggleTeacher(id,field,val){try{const b={};b[field]=val;await hdApi('/admin/teachers/'+id,{method:'PATCH',body:JSON.stringify(b)});delete HD_CACHE.teachers;hdLoad('teachers')}catch(e){alert(e.message)}}
/* ── المشتركون ───────────────────────────────────────── */
async function hdTabSubs(){
  const d=HD_CACHE.subs||(HD_CACHE.subs=await hdApi('/admin/subscribers'));
  if(HD_TAB!=='subs'||!hdEl())return;
  hdEl().innerHTML=`
    <div class="stats">
      <div class="stat"><span class="ic"><i data-lucide="layers"></i></span><div class="v">${d.stats.total}</div><div class="l">إجمالي الاشتراكات</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="check-circle"></i></span><div class="v">${d.stats.active}</div><div class="l">نشط</div></div>
      <div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="hourglass"></i></span><div class="v">${d.stats.expired}</div><div class="l">منتهي</div></div>
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="x-circle"></i></span><div class="v">${d.stats.cancelled}</div><div class="l">ملغي</div></div>
    </div>
    <div class="card"><h3><i data-lucide="credit-card"></i> المشتركون (${d.count})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>المشترك</th><th>البريد</th><th>المنصة</th><th>الخطة</th><th>الحالة</th><th>تنتهي</th><th>تغيير الحالة</th></tr></thead><tbody>
    ${d.entries.map(s=>`<tr><td>${esc(s.displayName||'—')}</td><td>${esc(s.email||'—')}</td><td>${esc(s.platform||'—')}</td><td>${esc(s.planId||'—')}</td><td>${hdStatusPill(s.status)}</td><td>${hdDate(s.currentPeriodEnd)}</td>
      <td><select onchange="hdSetSubStatus('${s.id}',this.value)"><option value="">اختر…</option><option value="active">نشط</option><option value="expired">منتهي</option><option value="cancelled">ملغي</option></select></td></tr>`).join('')||'<tr><td colspan="7" style="opacity:.6">لا توجد اشتراكات بعد.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdSetSubStatus(id,val){if(!val)return;try{await hdApi('/admin/subscribers/'+id+'/status',{method:'PATCH',body:JSON.stringify({status:val})});delete HD_CACHE.subs;hdLoad('subs')}catch(e){alert(e.message)}}
/* ── قائمة الانتظار ──────────────────────────────────── */
async function hdTabWaitlist(){
  const d=await hdApi('/admin/waitlist');
  if(HD_TAB!=='waitlist'||!hdEl())return;
  const rows=hdRows(d);
  hdEl().innerHTML=`
    <div class="stats"><div class="stat"><span class="ic" style="color:#f5c542"><i data-lucide="mail"></i></span><div class="v">${rows.length}</div><div class="l">مسجّل في قائمة الانتظار</div></div></div>
    <div class="card"><h3><i data-lucide="user-plus"></i> قائمة الانتظار</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>البريد</th><th>المصدر</th><th>سُجّل في</th><th>آخر إرسال</th><th></th></tr></thead><tbody>
    ${rows.map(w=>`<tr><td>${esc(w.email)}</td><td>${esc(w.source||'—')}</td><td>${hdDate(w.createdAt)}</td><td>${w.emailSentAt?hdDate(w.emailSentAt):hdPill('لم يُرسل','unpaid')}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="hdWlResend(${w.id})"><i data-lucide="send"></i> إعادة إرسال</button></td></tr>`).join('')||'<tr><td colspan="5" style="opacity:.6">القائمة فارغة.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdWlResend(id){try{await hdApi('/admin/waitlist/'+id+'/resend-email',{method:'POST'});alert('تم الإرسال ✓');hdLoad('waitlist')}catch(e){alert(e.message)}}
/* ── المحتوى (الكتب) ─────────────────────────────────── */
async function hdTabContent(){
  const j=await hdApi('/admin/books');
  if(HD_TAB!=='content'||!hdEl())return;
  const rows=hdRows(j).length?hdRows(j):(j.books||[]);
  hdEl().innerHTML=`
    <div class="stats"><div class="stat"><span class="ic" style="color:#14b8a6"><i data-lucide="book-open"></i></span><div class="v">${rows.length}</div><div class="l">كتاب في بنك الأسئلة</div></div></div>
    <div class="card"><h3><i data-lucide="book-open"></i> الكتب والمحتوى</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>الكتاب</th><th>الصف</th><th>المادة</th><th>عدد الأسئلة</th></tr></thead><tbody>
    ${rows.map(b=>`<tr><td>${esc(b.name||b.title||b.bookId||b.id||'—')}</td><td>${b.grade||b.gradeNumber?('الصف '+(HD_GRADES[b.grade||b.gradeNumber]||b.grade||b.gradeNumber)):'—'}</td><td>${esc(b.subjectLabel||hdSubj(b.subject||b.subjectId))}</td><td>${(b.questionCount||b.questions||0).toLocaleString('en')}</td></tr>`).join('')||'<tr><td colspan="4" style="opacity:.6">لا يوجد محتوى.</td></tr>'}
    </tbody></table></div></div>`;
}
/* ── خدمة العملاء (التذاكر) ──────────────────────────── */
async function hdTabTickets(){
  const d=await hdApi('/admin/tickets');
  if(HD_TAB!=='tickets'||!hdEl())return;
  const rows=hdRows(d);
  const open=rows.filter(t=>t.status==='open').length;
  hdEl().innerHTML=`
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="life-buoy"></i></span><div class="v">${open}</div><div class="l">تذاكر مفتوحة</div></div>
      <div class="stat"><span class="ic"><i data-lucide="layers"></i></span><div class="v">${rows.length}</div><div class="l">إجمالي التذاكر</div></div>
    </div>
    <div class="card"><h3><i data-lucide="life-buoy"></i> التذاكر</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>#</th><th>البريد</th><th>الموضوع</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(t=>`<tr><td>${t.id}</td><td>${esc(t.email||'—')}</td><td style="max-width:300px">${esc(t.subject||'—')}</td><td>${hdStatusPill(t.status)}</td><td>${hdDate(t.createdAt)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="hdTicketOpen(${t.id})"><i data-lucide="eye"></i> عرض</button>
        ${t.status==='open'?`<button class="btn btn-ghost btn-sm" onclick="hdTicketStatus(${t.id},'closed')"><i data-lucide="check"></i> إغلاق</button>`:`<button class="btn btn-ghost btn-sm" onclick="hdTicketStatus(${t.id},'open')"><i data-lucide="rotate-ccw"></i> فتح</button>`}
      </td></tr>
      <tr id="hdTk${t.id}" style="display:none"><td colspan="6" style="background:rgba(255,255,255,.02)">
        <div style="padding:8px"><b>الرسالة:</b> ${esc(t.message||'')}</div>
        <div id="hdTkReplies${t.id}" style="padding:8px;opacity:.85"></div>
        <div style="display:flex;gap:8px;padding:8px"><input id="hdTkInput${t.id}" placeholder="اكتب ردك — يُرسل للعميل بالبريد…" style="flex:1"><button class="btn btn-gold btn-sm" onclick="hdTicketReply(${t.id})"><i data-lucide="send"></i> إرسال الرد</button></div>
      </td></tr>`).join('')||'<tr><td colspan="6" style="opacity:.6">لا توجد تذاكر.</td></tr>'}
    </tbody></table></div></div>`;
}
async function hdTicketOpen(id){
  const row=document.getElementById('hdTk'+id);if(!row)return;
  const show=row.style.display==='none';row.style.display=show?'':'none';
  if(show){const box=document.getElementById('hdTkReplies'+id);box.textContent='جارٍ تحميل الردود…';
    try{const j=await hdApi('/admin/tickets/'+id+'/replies');const reps=hdRows(j);
      box.innerHTML=reps.length?reps.map(r=>`<div style="border-right:2px solid #f5c542;padding:4px 8px;margin:4px 0">${esc(r.message||r.reply||'')} <span style="opacity:.5;font-size:.8em">${hdDate(r.createdAt)}</span></div>`).join(''):'<span style="opacity:.6">لا توجد ردود سابقة.</span>'}
    catch(e){box.textContent=e.message}}
  refreshIcons();
}
async function hdTicketReply(id){const inp=document.getElementById('hdTkInput'+id);const m=inp.value.trim();if(!m)return;
  try{await hdApi('/admin/tickets/'+id+'/reply',{method:'POST',body:JSON.stringify({message:m})});inp.value='';alert('أُرسل الرد ✓');hdTicketOpen(id);hdTicketOpen(id)}catch(e){alert(e.message)}}
async function hdTicketStatus(id,status){try{await hdApi('/admin/tickets/'+id+'/status',{method:'PATCH',body:JSON.stringify({status})});hdLoad('tickets')}catch(e){alert(e.message)}}
