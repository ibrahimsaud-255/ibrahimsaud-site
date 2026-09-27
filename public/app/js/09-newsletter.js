/*
 * 09-newsletter.js — القائمة البريديّة
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== القائمة البريدية (اشتراك + إرسال المدونة عبر Resend) ===== */
let NL={subs:null,campaigns:null,loading:false,err:null,editId:null,_posts:null};
async function nlLoad(force){
  if(NL.loading)return;NL.loading=true;NL.err=null;if(force&&CUR==='newsletter')renderNewsletter();
  try{const r=await sb.from('subscribers').select('*').order('created_at',{ascending:false});if(r.error)throw r.error;NL.subs=r.data||[];}
  catch(e){NL.err=(e&&e.message)||'تعذّر الاتصال';}
  // الحملات (قد لا يكون الجدول موجوداً قبل تشغيل newsletter.sql)
  try{const c=await sb.from('newsletter_campaigns').select('*').order('created_at',{ascending:false}).limit(50);NL.campaigns=c.error?null:(c.data||[]);}
  catch(_){NL.campaigns=null;}
  NL.loading=false;if(CUR==='newsletter')renderNewsletter();
}
async function nlSend(payload){
  const {data,error}=await sb.functions.invoke('newsletter-send',{body:payload});
  if(error){let m=error.message||'خطأ';try{const j=await error.context.json();if(j&&j.error)m=j.error}catch(_){}throw new Error(m)}
  if(data&&data.error)throw new Error(data.error);
  return data||{};
}
function nlToHtml(txt){if(/<[a-z][\s\S]*>/i.test(txt))return txt;const e=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));return txt.split(/\n{2,}/).map(p=>'<p>'+e(p).replace(/\n/g,'<br>')+'</p>').join('')}
async function nlSendPostRow(post){
  // ينشئ حملة من المقال ثم يرسلها الآن (لتُسجَّل في سجلّ الحملات)
  try{
    const row={subject:post.title||'مقال جديد',content_html:post.body_html||'',cover_url:post.cover_url||null,cta_url:post.slug?('https://ibrahimsaud.com/blog/'+post.slug):'https://ibrahimsaud.com/blog/',status:'scheduled',scheduled_at:new Date().toISOString()};
    const {data,error}=await sb.from('newsletter_campaigns').insert(row).select('id').single();
    if(error)throw error;
    const res=await nlSend({campaignId:data.id});
    alert(res.skipped?'الحملة أُرسلت مسبقاً':('تم إرسال المقال للمشتركين: '+(res.sent||0)+' ✓'+(res.failed?(' — فشل '+res.failed):'')));
    if(NL.subs!==null||NL.campaigns!==null)nlLoad(true);
  }catch(e){alert('تعذّر الإرسال للمشتركين: '+(e.message||e)+'\nتقدر ترسله لاحقاً من «القائمة البريدية».');}
}
function renderNewsletter(){
  const main=document.getElementById('main');
  if(NL.subs===null&&!NL.err){if(!NL.loading)nlLoad();main.innerHTML=`<div class="page-head"><h1><i data-lucide="mail"></i> القائمة البريدية</h1></div><p style="color:var(--muted)">…جارٍ التحميل</p>`;applyWallpaper();refreshIcons();return}
  if(NL.err){main.innerHTML=`<div class="page-head"><h1><i data-lucide="mail"></i> القائمة البريدية</h1><button class="btn btn-ghost" onclick="nlLoad(true)"><i data-lucide="refresh-cw"></i> إعادة المحاولة</button></div>
    <div class="card"><div class="badge-note"><i data-lucide="database"></i> <div><b>لتفعيل القائمة البريدية:</b><br>١) شغّل ملف <b>supabase/newsletter.sql</b> في Supabase ← SQL Editor.<br>٢) انشر دالتَي الإرسال: <code>supabase functions deploy newsletter-send</code> و<code>supabase functions deploy newsletter-unsub --no-verify-jwt</code> (تستخدمان مفتاح Resend المضبوط مسبقاً).<br>ثم اضغط «إعادة المحاولة».<div style="margin-top:6px;color:var(--muted);font-size:12px">التفاصيل: ${esc(NL.err)}</div></div></div></div>`;applyWallpaper();refreshIcons();return}
  const subs=NL.subs||[];const active=subs.filter(s=>!s.unsubscribed).length;const unsub=subs.length-active;
  const camps=NL.campaigns;const editing=NL.editId&&camps&&camps.find(c=>c.id===NL.editId);
  const setupBanner=camps===null?`<div class="badge-note" style="border-color:var(--bad);margin-bottom:16px"><i data-lucide="database"></i> <div><b>جدول الحملات غير موجود بعد.</b> شغّل <b>supabase/newsletter.sql</b> في Supabase ← SQL Editor لتفعيل الجدولة وسجلّ الحملات. (الإرسال الفوري يعمل، لكن لن تُحفظ الحملات.)</div></div>`:'';
  main.innerHTML=`
    <div class="page-head"><h1><i data-lucide="mail"></i> القائمة البريدية</h1>
      <button class="btn btn-ghost btn-sm" onclick="nlLoad(true)"><i data-lucide="refresh-cw"></i> تحديث</button></div>
    <div class="stats" style="margin-bottom:20px">
      <div class="stat"><span class="ic"><i data-lucide="users"></i></span><div class="v">${active}</div><div class="l">مشترك نشط</div></div>
      <div class="stat"><span class="ic"><i data-lucide="user-x"></i></span><div class="v">${unsub}</div><div class="l">ألغوا الاشتراك</div></div>
      <div class="stat"><span class="ic"><i data-lucide="calendar-clock"></i></span><div class="v">${camps?camps.filter(c=>c.status==='scheduled').length:0}</div><div class="l">حملة مجدولة</div></div>
      <div class="stat"><span class="ic"><i data-lucide="mailbox"></i></span><div class="v">${subs.length}</div><div class="l">إجمالي المشتركين</div></div>
    </div>
    ${setupBanner}
    <div class="grid">
      <div class="card" style="grid-column:1/-1"><h3><i data-lucide="pen-line"></i> ${editing?'تعديل حملة':'رسالة جديدة'}${editing?` <span style="color:var(--muted);font-size:13px;font-weight:normal">— ${esc(editing.subject||'')}</span>`:''}</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <button class="btn btn-ghost btn-sm" onclick="nlPickPost()"><i data-lucide="newspaper"></i> تحميل من تدوينة</button>
          ${editing?`<button class="btn btn-ghost btn-sm" onclick="nlClearCompose()"><i data-lucide="x"></i> إلغاء التعديل</button>`:''}</div>
        <div class="field"><label>العنوان (الموضوع)</label><input id="nl_subject" placeholder="عنوان الرسالة"></div>
        <div class="field"><label>المحتوى</label><textarea id="nl_html" rows="8" placeholder="اكتب المحتوى هنا… (يدعم HTML، أو نص عادي بأسطر)"></textarea></div>
        <div class="row2"><div class="field"><label>صورة غلاف (رابط — اختياري)</label><input id="nl_cover" placeholder="https://…"></div>
        <div class="field"><label>رابط «اقرأ على الموقع» (اختياري)</label><input id="nl_url" placeholder="https://ibrahimsaud.com/blog/"></div></div>
        <div class="row2" style="align-items:end">
          <div class="field"><label>موعد الجدولة</label><input type="datetime-local" id="nl_when" min="${nlLocalStr(1)}"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;padding-bottom:14px">
            <button class="btn btn-ghost btn-sm" onclick="nlDoSend(true)"><i data-lucide="flask-conical"></i> تجريبي لي</button>
            <button class="btn btn-ghost btn-sm" onclick="nlCompose('draft')"><i data-lucide="save"></i> حفظ مسودّة</button>
            <button class="btn btn-ghost btn-sm" onclick="nlCompose('schedule')"><i data-lucide="calendar-clock"></i> جدولة</button>
            <button class="btn btn-gold btn-sm" onclick="nlCompose('now')"><i data-lucide="send"></i> إرسال الآن (${active})</button>
          </div></div>
        <div id="nl_status" class="msg" style="margin-top:6px"></div>
        <div class="badge-note" style="margin-top:10px"><i data-lucide="info"></i> <div>«إرسال الآن» يرسل فوراً، و«جدولة» يرسل تلقائياً في الموعد المحدّد. الإرسال للخارجيين يتطلّب <b>دومين موثّق في Resend</b> — جرّب «تجريبي لي» أولاً. كل رسالة تحتوي رابط إلغاء اشتراك.</div></div>
      </div>
      <div class="card" style="grid-column:1/-1"><h3><i data-lucide="mails"></i> الحملات</h3>
        ${camps===null?'<p style="color:var(--muted)">— (فعّل الجدول لعرض الحملات)</p>':(camps.length?camps.map(nlCampRow).join(''):'<p style="color:var(--muted)">لا حملات بعد. اكتب رسالتك بالأعلى ثم أرسلها أو جدولها.</p>')}
      </div>
      <div class="card" style="grid-column:1/-1"><h3><i data-lucide="list"></i> المشتركون (${subs.length})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:2px 18px">
        ${subs.length?subs.slice(0,120).map(s=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)">
          <span style="flex:1;font-size:13px;direction:ltr;text-align:right;${s.unsubscribed?'text-decoration:line-through;color:var(--muted)':''}">${esc(s.email)}</span>
          <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="nlDelSub('${s.id}')"><i data-lucide="x"></i></button>
        </div>`).join(''):'<p style="color:var(--muted)">لا مشتركين بعد. النموذج في الموقع يجمعهم تلقائياً.</p>'}
        </div>
        ${subs.length>120?`<p style="color:var(--muted);font-size:12px;margin-top:8px">…و${subs.length-120} غيرهم</p>`:''}
      </div>
    </div>`;
  applyWallpaper();refreshIcons();
  // إن كنّا نعدّل حملة، عبّئ الحقول
  if(editing){const g=id=>document.getElementById(id);if(g('nl_subject'))g('nl_subject').value=editing.subject||'';if(g('nl_html'))g('nl_html').value=editing.content_html||'';if(g('nl_cover'))g('nl_cover').value=editing.cover_url||'';if(g('nl_url'))g('nl_url').value=editing.cta_url||'';if(editing.scheduled_at&&g('nl_when'))g('nl_when').value=nlIsoToLocal(editing.scheduled_at);}
}
// وقت محلّي بصيغة datetime-local (YYYY-MM-DDTHH:MM) بعد offset دقائق
function nlLocalStr(offsetMin){const d=new Date(Date.now()+(offsetMin||0)*60000);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;}
function nlIsoToLocal(iso){const d=new Date(iso);if(isNaN(d))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;}
function nlFmt(iso){if(!iso)return '';const d=new Date(iso);if(isNaN(d))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function nlStatusPill(c){const M={draft:['مسودّة','#8a8a92'],scheduled:['مجدولة','#3b82f6'],sending:['جارٍ الإرسال…','#f5a623'],sent:['تمّت','#22c55e'],canceled:['أُلغيت','#8a8a92'],failed:['فشلت','#ef4444']};const m=M[c.status]||[c.status,'#8a8a92'];return `<span style="display:inline-block;font-size:12px;font-weight:bold;color:${m[1]};background:${m[1]}22;padding:2px 10px;border-radius:20px">${m[0]}</span>`;}
function nlCampRow(c){
  let meta='';
  if(c.status==='scheduled')meta=`<i data-lucide="calendar-clock" style="width:13px"></i> ${nlFmt(c.scheduled_at)}`;
  else if(c.status==='sent')meta=`<i data-lucide="check" style="width:13px"></i> ${nlFmt(c.sent_at)} · وصلت ${c.sent_count||0}${c.failed_count?` · فشل ${c.failed_count}`:''}`;
  else if(c.status==='failed')meta=`<span style="color:var(--bad)">${esc(c.error||'خطأ')}</span>`;
  else if(c.status==='sending')meta='…جارٍ الإرسال، حدّث بعد قليل';
  else if(c.status==='draft')meta='مسودّة غير مُرسلة';
  else if(c.status==='canceled')meta='أُلغيت الجدولة';
  const A=[];
  if(c.status==='draft'||c.status==='scheduled'){A.push(`<button class="btn btn-ghost btn-sm" onclick="nlEditCamp('${c.id}')"><i data-lucide="pencil"></i> تعديل</button>`);A.push(`<button class="btn btn-gold btn-sm" onclick="nlSendNow('${c.id}')"><i data-lucide="send"></i> إرسال الآن</button>`);}
  if(c.status==='scheduled')A.push(`<button class="btn btn-ghost btn-sm" onclick="nlCancelCamp('${c.id}')"><i data-lucide="calendar-x"></i> إلغاء الجدولة</button>`);
  if(c.status==='sent'||c.status==='failed'||c.status==='canceled')A.push(`<button class="btn btn-ghost btn-sm" onclick="nlDupCamp('${c.id}')"><i data-lucide="copy"></i> تكرار</button>`);
  A.push(`<button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="nlDelCamp('${c.id}')"><i data-lucide="trash-2"></i></button>`);
  return `<div style="padding:12px 0;border-bottom:1px solid var(--line)">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
      ${nlStatusPill(c)}<b style="flex:1;min-width:160px">${esc(c.subject||'بدون عنوان')}</b></div>
    <div style="color:var(--muted);font-size:12.5px;display:flex;align-items:center;gap:6px;margin-bottom:8px">${meta}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${A.join('')}</div>
  </div>`;
}
async function nlPickPost(){
  let posts=[];try{const r=await sb.from('posts').select('id,title,body_html,cover_url,status,published_at').eq('status','published').order('published_at',{ascending:false});posts=r.data||[]}catch(e){alert('تعذّر جلب المقالات: '+(e.message||e));return}
  if(!posts.length){alert('لا مقالات منشورة بعد. انشر مقالاً من «المدونة» أولاً.');return}
  NL._posts=posts;
  openModal('اختر تدوينة',posts.map((p,i)=>`<button type="button" class="btn btn-ghost" style="display:block;width:100%;text-align:right;margin-bottom:6px" onclick="nlUsePost(${i})"><i data-lucide="file-text"></i> ${esc(p.title||'بدون عنوان')}</button>`).join(''),()=>closeModal());
}
function nlUsePost(i){const p=(NL._posts||[])[i];if(!p)return;const g=id=>document.getElementById(id);if(g('nl_subject'))g('nl_subject').value=p.title||'';if(g('nl_html'))g('nl_html').value=p.body_html||'';if(g('nl_cover'))g('nl_cover').value=p.cover_url||'';if(g('nl_url'))g('nl_url').value='https://ibrahimsaud.com/blog/';closeModal();}
async function nlDoSend(testOnly){
  const g=id=>(document.getElementById(id)||{}).value||'';
  const subject=g('nl_subject').trim();const raw=g('nl_html').trim();const cover=g('nl_cover').trim();const url=g('nl_url').trim();
  if(!subject||!raw){alert('اكتب العنوان والمحتوى، أو حمّل تدوينة');return}
  const active=(NL.subs||[]).filter(s=>!s.unsubscribed).length;
  if(!testOnly&&!confirm('إرسال «'+subject+'» إلى '+active+' مشترك؟'))return;
  const st=document.getElementById('nl_status');if(st){st.className='msg';st.textContent='…جارٍ الإرسال'}
  try{const res=await nlSend({subject,contentHtml:nlToHtml(raw),coverUrl:cover||undefined,url:url||undefined,testOnly});
    if(st){st.className='msg ok';st.textContent=testOnly?'تم إرسال نسخة تجريبية لبريدك ✓':('تم الإرسال بنجاح: '+(res.sent||0)+' ✓'+(res.failed?(' — فشل '+res.failed):''))}
    if(!testOnly)setTimeout(()=>nlLoad(true),800);
  }catch(e){if(st){st.className='msg err';st.textContent='تعذّر الإرسال: '+(e.message||e)}}
}
// حفظ/جدولة/إرسال حملة من المحرّر — action: 'draft' | 'schedule' | 'now'
async function nlCompose(action){
  const g=id=>(document.getElementById(id)||{}).value||'';
  const subject=g('nl_subject').trim();const raw=g('nl_html').trim();const cover=g('nl_cover').trim();const url=g('nl_url').trim();
  if(!subject||!raw){alert('اكتب العنوان والمحتوى، أو حمّل تدوينة');return}
  if(NL.campaigns===null){alert('جدول الحملات غير مفعّل. شغّل supabase/newsletter.sql في Supabase أولاً.');return}
  const st=document.getElementById('nl_status');
  const row={subject,content_html:nlToHtml(raw),cover_url:cover||null,cta_url:url||null};
  if(action==='schedule'){
    const w=g('nl_when').trim();if(!w){alert('اختر موعد الجدولة أولاً');return}
    const d=new Date(w);if(isNaN(d.getTime())){alert('موعد غير صالح');return}
    if(d.getTime()<Date.now()+30000){alert('اختر وقتاً في المستقبل');return}
    row.status='scheduled';row.scheduled_at=d.toISOString();
  }else if(action==='now'){
    const active=(NL.subs||[]).filter(s=>!s.unsubscribed).length;
    if(!confirm('إرسال «'+subject+'» الآن إلى '+active+' مشترك؟'))return;
    row.status='scheduled';row.scheduled_at=new Date().toISOString();
  }else{row.status='draft';row.scheduled_at=null;}
  if(st){st.className='msg';st.textContent='…جارٍ الحفظ'}
  try{
    let id=NL.editId;
    if(id){const {error}=await sb.from('newsletter_campaigns').update(row).eq('id',id);if(error)throw error;}
    else{const {data,error}=await sb.from('newsletter_campaigns').insert(row).select('id').single();if(error)throw error;id=data.id;}
    if(action==='now'){
      if(st){st.textContent='…جارٍ الإرسال'}
      const res=await nlSend({campaignId:id});
      if(st){st.className='msg ok';st.textContent=res.skipped?'الحملة أُرسلت مسبقاً':('تم الإرسال: '+(res.sent||0)+' ✓'+(res.failed?(' — فشل '+res.failed):''))}
    }else if(action==='schedule'){if(st){st.className='msg ok';st.textContent='تمت الجدولة ✓ ستُرسل تلقائياً في الموعد'}}
    else{if(st){st.className='msg ok';st.textContent='حُفظت كمسودّة ✓'}}
    nlClearCompose(true);
    setTimeout(()=>nlLoad(true),action==='now'?500:250);
  }catch(e){if(st){st.className='msg err';st.textContent='تعذّر: '+(e.message||e)}}
}
function nlClearCompose(keepStatus){NL.editId=null;const g=id=>document.getElementById(id);['nl_subject','nl_html','nl_cover','nl_url','nl_when'].forEach(k=>{if(g(k))g(k).value=''});if(!keepStatus)renderNewsletter();}
function nlEditCamp(id){NL.editId=id;renderNewsletter();try{document.getElementById('nl_subject').scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}}
async function nlSendNow(id){const active=(NL.subs||[]).filter(s=>!s.unsubscribed).length;if(!confirm('إرسال هذه الحملة الآن إلى '+active+' مشترك؟'))return;try{const res=await nlSend({campaignId:id});alert(res.skipped?'الحملة أُرسلت أو أُلغيت مسبقاً':('تم الإرسال: '+(res.sent||0)+' ✓'+(res.failed?(' — فشل '+res.failed):'')));}catch(e){alert('تعذّر الإرسال: '+(e.message||e));}nlLoad(true);}
async function nlCancelCamp(id){if(!confirm('إلغاء جدولة هذه الحملة؟'))return;const {error}=await sb.from('newsletter_campaigns').update({status:'canceled'}).eq('id',id).in('status',['scheduled','draft']);if(error){alert('تعذّر الإلغاء: '+error.message);return}nlLoad(true);}
function nlDupCamp(id){const c=(NL.campaigns||[]).find(x=>x.id===id);if(!c)return;NL.editId=null;renderNewsletter();const g=i=>document.getElementById(i);if(g('nl_subject'))g('nl_subject').value=c.subject||'';if(g('nl_html'))g('nl_html').value=c.content_html||'';if(g('nl_cover'))g('nl_cover').value=c.cover_url||'';if(g('nl_url'))g('nl_url').value=c.cta_url||'';try{g('nl_subject').scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}}
async function nlDelCamp(id){if(!confirm('حذف هذه الحملة نهائياً؟'))return;const {error}=await sb.from('newsletter_campaigns').delete().eq('id',id);if(error){alert('تعذّر الحذف: '+error.message);return}if(NL.editId===id)NL.editId=null;nlLoad(true);}
async function nlDelSub(id){if(!confirm('حذف هذا المشترك؟'))return;const {error}=await sb.from('subscribers').delete().eq('id',id);if(error){alert('تعذّر الحذف: '+error.message);return}await nlLoad(true);}
