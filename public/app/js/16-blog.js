/*
 * 16-blog.js — المدوّنة داخل النظام
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== المدونة (داخل النظام) — كتابة + تنسيق بالذكاء + نشر ===== */
let BLOG={settings:{author_name:'إبراهيم سعود',author_title:'مخرج ومنتج ومدير إبداعي',author_avatar_url:''},posts:[],cover:'',formatted:null,form:{id:null,title:'',body:'',status:''}};
const BLOG_AV_FALLBACK='https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/my_photo.jpg';
function blogAvatar(){return BLOG.settings.author_avatar_url||S.settings.authorPhoto||BLOG_AV_FALLBACK}
function blogDates(){const now=new Date();let greg='',hijri='';try{greg=now.toLocaleDateString('ar',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}catch(_){greg=now.toISOString().slice(0,10)}try{hijri=now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'})}catch(_){try{hijri=now.toLocaleDateString('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'})}catch(__){hijri=''}}hijri=hijri.replace(/\s*هـ\s*$/,'').trim();return {greg,hijri}}
function blogReadingMin(html){const t=(html||'').replace(/<[^>]+>/g,' ');const w=t.split(/\s+/).filter(Boolean).length;return Math.max(1,Math.round(w/200))}
function blogLocalFormat(text){const blocks=text.replace(/\r/g,'').split(/\n{2,}/).map(b=>b.trim()).filter(Boolean);let html='';for(const b of blocks){const lines=b.split('\n').map(l=>l.trim()).filter(Boolean);if(lines.length>1&&lines.every(l=>/^[-•*]\s+/.test(l))){html+='<ul>'+lines.map(l=>'<li>'+esc(l.replace(/^[-•*]\s+/,''))+'</li>').join('')+'</ul>';continue}if(lines.length>1&&lines.every(l=>/^\d+[.\-)]\s+/.test(l))){html+='<ol>'+lines.map(l=>'<li>'+esc(l.replace(/^\d+[.\-)]\s+/,''))+'</li>').join('')+'</ol>';continue}if(lines.length===1){const l=lines[0];if(/^#{1,3}\s+/.test(l)){html+='<h2>'+esc(l.replace(/^#{1,3}\s+/,''))+'</h2>';continue}if(l.length<=48&&!/[.!؟،:]$/.test(l)){html+='<h2>'+esc(l)+'</h2>';continue}}html+='<p>'+lines.map(esc).join('<br>')+'</p>'}const firstLine=(text.trim().split('\n')[0]||'').replace(/^#{1,3}\s+/,'').trim();return {html,title:firstLine.slice(0,80),excerpt:text.trim().replace(/\s+/g,' ').slice(0,160)}}
async function blogUpload(file,prefix){const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=prefix+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;const{error}=await sb.storage.from('blog-images').upload(path,file,{upsert:false,contentType:file.type||'image/jpeg'});if(error)throw error;return sb.storage.from('blog-images').getPublicUrl(path).data.publicUrl}
async function renderBlog(){
  document.getElementById('main').innerHTML='<div class="page-head"><h1>المدونة</h1></div><p style="color:var(--muted)">جارٍ التحميل…</p>';
  try{const{data}=await sb.from('blog_settings').select('*').eq('id',1).single();if(data)BLOG.settings=data}catch(_){}
  try{const{data}=await sb.from('posts').select('*').order('published_at',{ascending:false});BLOG.posts=data||[]}catch(_){BLOG.posts=[]}
  blogRender();
}
function blogPostsList(){if(!BLOG.posts.length)return '<p style="color:var(--muted)">لا مقالات بعد.</p>';
  return '<table><thead><tr><th>العنوان</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead><tbody>'+BLOG.posts.map(p=>{const draft=p.status==='draft';const badge=draft?'<span class="pill scheduled">مسودة</span>':'<span class="pill done">منشور</span>';return `<tr><td><b>${esc(p.title||'بدون عنوان')}</b></td><td>${badge}</td><td style="color:var(--muted)">${esc(p.greg_date||'—')}</td><td style="white-space:nowrap"><button class="link-btn" onclick="blogEditPost('${p.id}')">تعديل</button>${draft?`<button class="link-btn" onclick="blogPublishDraft('${p.id}')">نشر</button>`:`<a class="link-btn" href="../blog/" target="_blank">فتح</a>`}<button class="link-btn del" onclick="blogDeletePost('${p.id}')">حذف</button></td></tr>`}).join('')+'</tbody></table>';}
async function blogPublishDraft(id){const p=BLOG.posts.find(x=>x.id===id);if(!p)return;if(!confirm('نشر هذه المسودة الآن؟'))return;
  const d=blogDates();const{data:saved,error}=await sb.from('posts').update({status:'published',greg_date:d.greg,hijri_date:d.hijri,published_at:new Date().toISOString()}).eq('id',id).select().single();
  if(error){alert('تعذّر النشر: '+error.message);return}
  try{const{data}=await sb.from('posts').select('*').order('published_at',{ascending:false});BLOG.posts=data||[]}catch(_){}
  if(saved&&confirm('تم نشر المقال. هل ترسله الآن للمشتركين في القائمة البريدية؟')){nlSendPostRow(saved);}
  blogRender();}
function blogRender(){
  const d=blogDates();
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>المدونة</h1><a class="btn btn-ghost btn-sm" href="../blog/" target="_blank"><i data-lucide="external-link"></i> عرض المدونة</a></div>
    <div class="badge-note"><i data-lucide="pen-line"></i> <div>اكتب مقالك بحرية وارفع صورته — يُنسَّق الشكل تلقائياً (فقرات وعناوين وقوائم). عاين المقال ثم احفظه كمسودة أو انشره. يُؤرّخ تلقائياً (ميلادي + هجري).</div></div>
    <div class="row2" style="align-items:start">
      <div class="card">
        <h3 style="margin-top:0"><i data-lucide="pen-line"></i> ${BLOG.form.id?('تعديل مقال'+(BLOG.form.status==='draft'?' (مسودة)':'')):'مقال جديد'}
          ${BLOG.form.id?`<button class="btn btn-ghost btn-sm" style="float:left" onclick="blogResetEditor()"><i data-lucide="x"></i> إلغاء التعديل / مقال جديد</button>`:''}</h3>
        <div class="field"><label>عنوان المقال</label><input id="b_title" value="${esc(BLOG.form.title)}" oninput="blogPreview()" placeholder="عنوان واضح وجذّاب"></div>
        <div class="field"><label>صورة المقال (الغلاف)</label>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="document.getElementById('b_cover').click()"><i data-lucide="image-plus"></i> رفع صورة الغلاف</button><span id="b_coverStatus" style="color:var(--muted);font-size:12px"></span></div>
          <input type="file" id="b_cover" accept="image/*" class="hidden" onchange="blogUploadCover(event)">
          <img id="b_coverPrev" class="${BLOG.cover?'':'hidden'}" src="${esc(BLOG.cover)}" style="margin-top:10px;max-height:200px;width:100%;object-fit:cover;border-radius:12px;border:1px solid var(--line)">
        </div>
        <div class="field"><label>نص المقال (اكتبه كما يحلو لك — الذكاء يرتّب الشكل فقط)</label><textarea id="b_body" rows="12" oninput="blogBodyChanged()" placeholder="الصق أو اكتب مقالك هنا. افصل الفقرات بسطر فارغ، وابدأ القوائم بـ - أو ١. والعناوين بـ #">${esc(BLOG.form.body)}</textarea></div>
        <div class="badge-note" style="font-size:12.5px;margin-bottom:12px"><i data-lucide="calendar-days"></i> <div>يُؤرّخ عند النشر: <b>${esc(d.greg)}</b> · <b>${esc(d.hijri)} هـ</b></div></div>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="b_draft" onclick="blogSave('draft')"><i data-lucide="save"></i> حفظ كمسودة</button>
          <button class="btn-publish" id="b_publish" onclick="blogSave('published')" style="flex:1"><i data-lucide="rocket"></i> ${BLOG.form.status==='published'?'حفظ ونشر التعديل':'نشر المقال'}</button>
        </div>
        <div class="msg" id="b_pubMsg"></div>
      </div>
      <div class="card"><h3 style="margin-top:0"><i data-lucide="eye"></i> معاينة المقال</h3><div id="b_pv" class="blog-pv"><p style="color:var(--muted)">ابدأ الكتابة لتظهر المعاينة هنا…</p></div></div>
    </div>
    <div class="card" style="margin-top:18px"><h3 style="margin-top:0"><i data-lucide="newspaper"></i> مقالاتي (${BLOG.posts.length})</h3>${blogPostsList()}</div>`;
  refreshIcons();blogPreview();
}
function blogBodyChanged(){BLOG.formatted=null;blogPreview();}
function blogPreview(){
  const pv=document.getElementById('b_pv');if(!pv)return;
  const title=(document.getElementById('b_title')||{}).value||'';
  const body=(document.getElementById('b_body')||{}).value||'';
  const fm=BLOG.formatted||(body.trim()?blogLocalFormat(body):null);
  if(!title.trim()&&!body.trim()){pv.innerHTML='<p style="color:var(--muted)">ابدأ الكتابة لتظهر المعاينة هنا…</p>';return}
  const d=blogDates();const html=fm?fm.html:'';const rm=blogReadingMin(html);
  pv.innerHTML=`${BLOG.cover?`<img src="${esc(BLOG.cover)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:14px;margin-bottom:14px">`:''}
    <h1 style="font-size:24px;font-weight:900;line-height:1.45;margin:0 0 12px">${esc(title||(fm&&fm.title)||'بدون عنوان')}</h1>
    <div style="display:flex;align-items:center;gap:11px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:16px">
      <img src="${esc(blogAvatar())}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;background:var(--line)" onerror="this.style.display='none'">
      <div><div style="font-weight:800;font-size:14px">${esc(BLOG.settings.author_name||'إبراهيم سعود')}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:2px">${esc(d.greg)} · ${esc(d.hijri)} هـ · ${rm} د قراءة</div></div>
    </div>
    <div class="blog-body">${html}</div>`;
}
async function blogUploadCover(e){const f=e.target.files[0];if(!f)return;const st=document.getElementById('b_coverStatus');if(st)st.textContent='جارٍ الرفع…';try{const url=await blogUpload(f,'covers');BLOG.cover=url;const im=document.getElementById('b_coverPrev');if(im){im.src=url;im.classList.remove('hidden')}if(st)st.textContent='تم رفع الغلاف';blogPreview()}catch(err){if(st)st.textContent='تعذّر الرفع: '+(err.message||err)+' — تأكد من وجود bucket عام «blog-images» في Supabase.'}}
async function blogFormat(){
  const text=(document.getElementById('b_body')||{}).value.trim();const msg=document.getElementById('b_fmtMsg');
  if(text.length<10){if(msg){msg.className='msg err';msg.textContent='اكتب نص المقال أولاً.'}return}
  const btn=document.getElementById('b_fmt');if(btn)btn.disabled=true;if(msg){msg.className='msg';msg.innerHTML='جارٍ الترتيب بالذكاء…'}
  let res=null,serverErr='';
  try{const r=await fetch(SUPA_URL+'/functions/v1/blog-format',{method:'POST',headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify({text})});const dd=await r.json().catch(()=>({}));if(r.ok&&dd&&dd.html)res=dd;else serverErr=(dd&&dd.error)||('HTTP '+r.status);}catch(e){serverErr=(e&&e.message)||'تعذّر الاتصال بدالة الذكاء';}
  if(res){if(msg){msg.className='msg ok';msg.textContent='تم الترتيب بالذكاء الاصطناعي (DeepSeek)'}}
  else{res=blogLocalFormat(text);if(msg){msg.className='msg err';msg.innerHTML='تعذّر الترتيب بالذكاء ('+esc(serverErr)+') — استُخدم تنسيق محلّي بديل. تأكد من نشر دالة <b>blog-format</b> وضبط <b>DEEPSEEK_API_KEY</b>.'}}
  BLOG.formatted=res;const ti=document.getElementById('b_title');if(ti&&!ti.value.trim()&&res.title)ti.value=res.title;
  if(btn)btn.disabled=false;blogPreview();
}
function blogResetEditor(){BLOG.form={id:null,title:'',body:'',status:''};BLOG.cover='';BLOG.formatted=null;blogRender();}
function blogEditPost(id){const p=BLOG.posts.find(x=>x.id===id);if(!p)return;
  BLOG.form={id:p.id,title:p.title||'',body:blogStripHtml(p.body_html||''),status:p.status||'published'};
  BLOG.cover=p.cover_url||'';BLOG.formatted={html:p.body_html||'',title:p.title||'',excerpt:p.excerpt||''};
  blogRender();document.getElementById('main').scrollIntoView({behavior:'smooth',block:'start'});}
function blogStripHtml(html){const t=document.createElement('div');t.innerHTML=html||'';t.querySelectorAll('h2,h3,p,li,blockquote,br').forEach(el=>{if(el.tagName==='BR')el.replaceWith('\n');else el.append('\n')});return (t.textContent||'').replace(/\n{3,}/g,'\n\n').trim();}
async function blogSave(status){
  const title=(document.getElementById('b_title')||{}).value.trim();const body=(document.getElementById('b_body')||{}).value.trim();const msg=document.getElementById('b_pubMsg');
  if(!body){if(msg){msg.className='msg err';msg.textContent='اكتب نص المقال أولاً.'}return}
  const fm=BLOG.formatted||blogLocalFormat(body);const finalTitle=title||fm.title||'بدون عنوان';
  const isPub=status==='published';const wasNew=!BLOG.form.id;const wasDraft=BLOG.form.status==='draft';
  const btns=['b_publish','b_draft'].map(i=>document.getElementById(i));btns.forEach(b=>b&&(b.disabled=true));
  if(msg){msg.className='msg';msg.innerHTML=isPub?'جارٍ النشر…':'جارٍ حفظ المسودة…'}
  const row={title:finalTitle,excerpt:fm.excerpt||'',body_html:fm.html,cover_url:BLOG.cover||'',reading_min:blogReadingMin(fm.html),status};
  if(isPub){const d=blogDates();row.greg_date=d.greg;row.hijri_date=d.hijri;row.published_at=new Date().toISOString();}
  let res;
  if(BLOG.form.id){res=await sb.from('posts').update(row).eq('id',BLOG.form.id).select().single();}
  else{res=await sb.from('posts').insert(row).select().single();}
  const{data:saved,error}=res;
  if(error){btns.forEach(b=>b&&(b.disabled=false));if(msg){msg.className='msg err';msg.textContent='تعذّر الحفظ: '+error.message}return}
  if(msg){msg.className='msg ok';msg.textContent=isPub?'تم نشر المقال':'تم حفظ المسودة — تقدر ترجع تعدّلها لاحقاً'}
  BLOG.form={id:null,title:'',body:'',status:''};BLOG.cover='';BLOG.formatted=null;
  try{const{data}=await sb.from('posts').select('*').order('published_at',{ascending:false});BLOG.posts=data||[]}catch(_){}
  if(isPub&&saved&&(wasNew||wasDraft)&&confirm('تم نشر المقال. هل ترسله الآن لكل المشتركين في القائمة البريدية؟')){nlSendPostRow(saved);}
  setTimeout(()=>blogRender(),700);
}
async function blogDeletePost(id){if(!confirm('حذف المقال نهائياً؟'))return;await sb.from('posts').delete().eq('id',id);BLOG.posts=BLOG.posts.filter(p=>p.id!==id);blogRender();}
async function blogUploadAvatar(e){const f=e.target.files[0];if(!f)return;const st=document.getElementById('authPhotoStatus');if(st)st.textContent='جارٍ الرفع…';try{const url=await blogUpload(f,'avatar');S.settings.authorPhoto=url;BLOG.settings.author_avatar_url=url;save();const p=document.getElementById('authPhotoPrev');if(p){p.src=url;p.style.display='block'}try{await sb.from('blog_settings').update({author_avatar_url:url,updated_at:new Date().toISOString()}).eq('id',1)}catch(_){}if(st)st.textContent='تم — ستظهر في كل المقالات'}catch(err){if(st)st.textContent='تعذّر الرفع: '+(err.message||err)}}
