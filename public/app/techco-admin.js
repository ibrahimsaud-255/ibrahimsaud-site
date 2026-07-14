/* ============================================================
   الأنظمة المباعة — إدارة عملاء الشركة التقنية داخل النظام
   دمج أصلي مع قاعدة بيانات المنصة الموحّدة (Supabase + RLS)
   ============================================================ */
const TC_URL='https://hdzzulhszeemxfhtgqmd.supabase.co';
const TC_KEY='sb_publishable_GG7Gdn_GIvNXAtKF2hJLqQ_rznycnDM';
let _sbT=null;
function tcClient(){if(!_sbT)_sbT=window.supabase.createClient(TC_URL,TC_KEY,{auth:{storageKey:'sb-techco-admin'}});return _sbT}
let TC_TAB='tenants',TC_SEL=null;const TC_CACHE={};
function tcDate(d){return d?String(d).slice(0,10):'—'}
function tcPlanPill(p){const m={internal:['داخلي',''],client:['عميل','done'],trial:['تجريبي','unpaid']};const x=m[p]||[p||'—',''];return '<span class="pill '+x[1]+'">'+x[0]+'</span>'}
function tcGo(tab){TC_TAB=tab;TC_SEL=null;renderTechco()}
function tcRefresh(){Object.keys(TC_CACHE).forEach(k=>delete TC_CACHE[k]);renderTechco()}

function renderTechco(){
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1><i data-lucide="building-2"></i> الأنظمة المباعة — الشركة التقنية</h1>
      <button class="btn btn-ghost btn-sm" onclick="tcRefresh()"><i data-lucide="refresh-cw"></i> تحديث</button></div>
    <div id="tcBody"><div class="card" style="text-align:center;padding:30px;opacity:.7">جارٍ التحميل…</div></div>`;
  refreshIcons();
  tcInit();
}
function tcEl(){return document.getElementById('tcBody')}
async function tcInit(){
  try{
    const {data:{session}}=await tcClient().auth.getSession();
    if(!session){tcUnlock();return}
    const {data:isAdmin}=await tcClient().rpc('is_platform_admin');
    if(!isAdmin){tcUnlock('حسابك ليس من مدراء المنصة. ادخل بحساب مدير منصة.');return}
    if(TC_SEL)await tcTenantDetail(TC_SEL);
    else if(TC_TAB==='leads')await tcLeads();
    else await tcTenants();
    refreshIcons();
  }catch(e){if(tcEl())tcEl().innerHTML=`<div class="card"><h3><i data-lucide="shield-alert"></i> خطأ</h3><div style="opacity:.85">${esc(e.message)}</div></div>`;refreshIcons()}
}
/* ── قفل الدخول (مرة واحدة — تُحفظ الجلسة داخل نظامك) ── */
function tcUnlock(err){
  tcEl().innerHTML=`
    <div class="card" style="max-width:430px;margin:30px auto;text-align:center">
      <h3 style="justify-content:center"><i data-lucide="key-round"></i> فتح إدارة الأنظمة المباعة</h3>
      <div style="opacity:.7;margin:6px 0 14px">مرة واحدة فقط — تُحفظ الجلسة داخل نظامك وتبقى مفتوحة.</div>
      ${err?`<div style="color:#f87171;margin-bottom:10px">${esc(err)}</div>`:''}
      <input id="tcEm" type="email" value="ibrahimsaud25@gmail.com" placeholder="البريد الإلكتروني" style="width:100%;margin-bottom:8px">
      <input id="tcPw" type="password" placeholder="كلمة المرور" style="width:100%;margin-bottom:12px" onkeydown="if(event.key==='Enter')tcLogin()">
      <button class="btn btn-gold" style="width:100%" onclick="tcLogin()"><i data-lucide="unlock"></i> فتح الإدارة</button>
    </div>`;
  refreshIcons();
}
async function tcLogin(){
  const em=document.getElementById('tcEm').value.trim(),pw=document.getElementById('tcPw').value;
  if(!em||!pw)return;
  const {error}=await tcClient().auth.signInWithPassword({email:em,password:pw});
  if(error){tcUnlock('تعذّر الدخول: '+error.message);return}
  tcInit();
}
/* ── العملاء (Tenants) ────────────────────────────────── */
async function tcTenants(){
  if(!TC_CACHE.tenants){
    const [{data:tenants,error},{data:apps}]=await Promise.all([
      tcClient().from('tenants').select('*').order('created_at',{ascending:false}),
      tcClient().from('tenant_apps').select('tenant_id,enabled')
    ]);
    if(error)throw new Error(error.message);
    TC_CACHE.tenants=tenants||[];TC_CACHE.appCounts={};
    (apps||[]).forEach(a=>{if(a.enabled)TC_CACHE.appCounts[a.tenant_id]=(TC_CACHE.appCounts[a.tenant_id]||0)+1});
  }
  const rows=TC_CACHE.tenants;
  const byPlan=p=>rows.filter(t=>t.plan===p).length;
  tcEl().innerHTML=`
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn btn-gold btn-sm" onclick="tcGo('tenants')"><i data-lucide="building-2"></i> العملاء</button>
      <button class="btn btn-ghost btn-sm" onclick="tcGo('leads')"><i data-lucide="inbox"></i> الطلبات والتجارب</button>
    </div>
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#06b6d4"><i data-lucide="building-2"></i></span><div class="v">${rows.length}</div><div class="l">إجمالي العملاء</div></div>
      <div class="stat"><span class="ic" style="color:#22c55e"><i data-lucide="briefcase"></i></span><div class="v">${byPlan('client')}</div><div class="l">عملاء مدفوعون</div></div>
      <div class="stat"><span class="ic" style="color:#f59e0b"><i data-lucide="flask-conical"></i></span><div class="v">${byPlan('trial')}</div><div class="l">تجريبي</div></div>
      <div class="stat"><span class="ic"><i data-lucide="home"></i></span><div class="v">${byPlan('internal')}</div><div class="l">داخلي</div></div>
    </div>
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="plus"></i> إضافة عميل جديد</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="tcNewName" placeholder="اسم العميل" style="flex:1;min-width:150px">
        <input id="tcNewSlug" placeholder="المعرّف (slug) بالإنجليزية" style="width:180px">
        <select id="tcNewPlan"><option value="trial">تجريبي</option><option value="client">عميل</option><option value="internal">داخلي</option></select>
        <button class="btn btn-gold btn-sm" onclick="tcCreateTenant()"><i data-lucide="plus"></i> إنشاء</button>
      </div></div>
    <div class="card"><h3><i data-lucide="building-2"></i> العملاء (${rows.length})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>الاسم</th><th>المعرّف</th><th>الخطة</th><th>الدومين</th><th>تطبيقات مفعّلة</th><th>أنشئ</th><th></th></tr></thead><tbody>
    ${rows.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td style="direction:ltr">${esc(t.slug)}</td><td>${tcPlanPill(t.plan)}</td><td style="direction:ltr">${esc(t.domain||'—')}</td><td>${TC_CACHE.appCounts[t.id]||0}</td><td>${tcDate(t.created_at)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-gold btn-sm" onclick="TC_SEL='${t.id}';tcInit()"><i data-lucide="settings-2"></i> إدارة</button>
        <button class="btn btn-ghost btn-sm" title="حذف" onclick="tcDeleteTenant('${t.id}','${esc(t.name)}')"><i data-lucide="trash-2"></i></button>
      </td></tr>`).join('')||'<tr><td colspan="7" style="opacity:.6">لا يوجد عملاء بعد.</td></tr>'}
    </tbody></table></div></div>`;
}
async function tcCreateTenant(){
  const name=document.getElementById('tcNewName').value.trim();
  const slug=document.getElementById('tcNewSlug').value.trim().toLowerCase();
  const plan=document.getElementById('tcNewPlan').value;
  if(!name||!slug){alert('الاسم والمعرّف مطلوبان');return}
  const {error}=await tcClient().from('tenants').insert({name,slug,plan});
  if(error){alert('خطأ: '+error.message);return}
  delete TC_CACHE.tenants;tcInit();
}
async function tcDeleteTenant(id,name){
  if(!confirm('حذف العميل «'+name+'» وكل بياناته نهائياً؟'))return;
  if(!confirm('تأكيد أخير: هذا الإجراء لا يمكن التراجع عنه!'))return;
  const {data,error}=await tcClient().rpc('admin_delete_tenant',{p_tenant:id});
  if(error){alert('خطأ: '+error.message);return}
  delete TC_CACHE.tenants;TC_SEL=null;tcInit();
}
/* ── تفاصيل عميل: التطبيقات + الأعضاء + الدعوات ─────── */
async function tcTenantDetail(id){
  const t=(TC_CACHE.tenants||[]).find(x=>x.id===id);
  const [{data:catalog},{data:tapps},{data:members},{data:invites}]=await Promise.all([
    tcClient().from('app_catalog').select('*').order('category').order('name'),
    tcClient().from('tenant_apps').select('*').eq('tenant_id',id),
    tcClient().rpc('tenant_members',{p_tenant:id}),
    tcClient().rpc('list_invites',{p_tenant:id}).then(r=>r,()=>({data:[]}))
  ]);
  const enabled={};(tapps||[]).forEach(a=>enabled[a.app_key]=a.enabled);
  tcEl().innerHTML=`
    <button class="btn btn-ghost btn-sm" style="margin-bottom:12px" onclick="TC_SEL=null;tcInit()"><i data-lucide="arrow-right"></i> رجوع للعملاء</button>
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="building-2"></i> ${esc(t?t.name:'عميل')} ${t?tcPlanPill(t.plan):''}</h3>
      <div style="opacity:.7">المعرّف: <span style="direction:ltr;display:inline-block">${esc(t?t.slug:id)}</span> ${t&&t.domain?' · الدومين: '+esc(t.domain):''}</div>
      <div style="margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="tcSeedDemo('${id}')"><i data-lucide="database"></i> تعبئة بيانات تجريبية</button></div>
    </div>
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="layout-grid"></i> تطبيقات العميل — فعّل ما يحتاجه فقط</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-top:8px">
      ${(catalog||[]).map(a=>{const on=enabled[a.app_key]===true;return `
        <button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:flex-start" onclick="tcToggleApp('${id}','${a.app_key}',${!on})">
          <i data-lucide="${on?'check-circle':'circle'}"></i> ${esc(a.name)}${a.is_core?' ★':''}
        </button>`}).join('')||'<div style="opacity:.6">الكتالوج فارغ.</div>'}
      </div></div>
    <div class="card" style="margin-bottom:14px"><h3><i data-lucide="users"></i> الأعضاء (${(members||[]).length})</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>البريد</th><th>الدور</th><th></th></tr></thead><tbody>
    ${(members||[]).map(m=>`<tr><td style="direction:ltr">${esc(m.email||m.user_email||m.user_id)}</td>
      <td><select onchange="tcSetRole('${id}','${m.user_id}',this.value)">
        ${[['member','عضو'],['tenant_admin','مدير العميل'],['platform_admin','مدير المنصة']].map(r=>`<option value="${r[0]}" ${m.role===r[0]?'selected':''}>${r[1]}</option>`).join('')}
      </select></td>
      <td><button class="btn btn-ghost btn-sm" onclick="tcRemoveMember('${id}','${m.user_id}')"><i data-lucide="user-minus"></i> إزالة</button></td></tr>`).join('')||'<tr><td colspan="3" style="opacity:.6">لا يوجد أعضاء.</td></tr>'}
    </tbody></table></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      <input id="tcInvEmail" type="email" placeholder="بريد العضو الجديد" style="flex:1;min-width:170px">
      <select id="tcInvRole"><option value="member">عضو</option><option value="tenant_admin">مدير العميل</option></select>
      <button class="btn btn-gold btn-sm" onclick="tcInvite('${id}')"><i data-lucide="user-plus"></i> دعوة</button>
    </div>
    ${(invites||[]).length?`<div style="margin-top:10px;opacity:.85"><b>دعوات معلّقة:</b> ${(invites||[]).map(i=>`<span class="pill" style="margin:2px">${esc(i.email)} <a href="#" onclick="tcRevoke('${id}','${esc(i.email)}');return false" style="color:#f87171">×</a></span>`).join(' ')}</div>`:''}
    </div>`;
}
async function tcToggleApp(tenantId,appKey,on){
  const {error}=await tcClient().from('tenant_apps').upsert({tenant_id:tenantId,app_key:appKey,enabled:on},{onConflict:'tenant_id,app_key'});
  if(error){alert('خطأ: '+error.message);return}
  tcInit();
}
async function tcSetRole(tenantId,userId,role){
  const {error}=await tcClient().rpc('set_member_role',{p_tenant:tenantId,p_user:userId,p_role:role});
  if(error){alert('خطأ: '+error.message)}tcInit();
}
async function tcRemoveMember(tenantId,userId){
  if(!confirm('إزالة هذا العضو من العميل؟'))return;
  const {error}=await tcClient().rpc('remove_member',{p_tenant:tenantId,p_user:userId});
  if(error){alert('خطأ: '+error.message)}tcInit();
}
async function tcInvite(tenantId){
  const em=document.getElementById('tcInvEmail').value.trim();const role=document.getElementById('tcInvRole').value;
  if(!em)return;
  const {data,error}=await tcClient().rpc('invite_member',{p_tenant:tenantId,p_email:em,p_role:role});
  if(error){alert('خطأ: '+error.message);return}
  alert('أُرسلت الدعوة ✓');tcInit();
}
async function tcRevoke(tenantId,email){
  const {error}=await tcClient().rpc('revoke_invite',{p_tenant:tenantId,p_email:email});
  if(error){alert('خطأ: '+error.message)}tcInit();
}
async function tcSeedDemo(tenantId){
  if(!confirm('تعبئة هذا العميل ببيانات تجريبية جاهزة؟'))return;
  const {data,error}=await tcClient().rpc('admin_seed_demo',{p_tenant:tenantId});
  if(error){alert('خطأ: '+error.message);return}
  alert('تمت التعبئة ✓');tcInit();
}
/* ── الطلبات والتجارب (Leads) ─────────────────────────── */
async function tcLeads(){
  const {data:rows,error}=await tcClient().from('leads').select('*').order('created_at',{ascending:false});
  if(error)throw new Error(error.message);
  const st={new:['جديد','unpaid'],contacted:['تم التواصل',''],converted:['تحوّل لعميل','done'],closed:['مغلق','']};
  tcEl().innerHTML=`
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn btn-ghost btn-sm" onclick="tcGo('tenants')"><i data-lucide="building-2"></i> العملاء</button>
      <button class="btn btn-gold btn-sm" onclick="tcGo('leads')"><i data-lucide="inbox"></i> الطلبات والتجارب</button>
    </div>
    <div class="stats">
      <div class="stat"><span class="ic" style="color:#f5c542"><i data-lucide="inbox"></i></span><div class="v">${(rows||[]).length}</div><div class="l">إجمالي الطلبات</div></div>
      <div class="stat"><span class="ic" style="color:#ef4444"><i data-lucide="bell"></i></span><div class="v">${(rows||[]).filter(l=>l.status==='new').length}</div><div class="l">جديدة</div></div>
    </div>
    <div class="card"><h3><i data-lucide="inbox"></i> طلبات التجربة والتواصل</h3>
    <div style="overflow-x:auto"><table><thead><tr><th>الاسم</th><th>الشركة</th><th>البريد</th><th>الجوال</th><th>الاحتياج</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
    ${(rows||[]).map(l=>`<tr><td>${esc(l.full_name||'—')}</td><td>${esc(l.company||'—')}</td><td style="direction:ltr">${esc(l.email||'—')}</td><td style="direction:ltr">${esc(l.phone||'—')}</td><td style="max-width:260px">${esc(l.needs||'—')}</td>
      <td><select onchange="tcLeadStatus('${l.id}',this.value)">${Object.keys(st).map(k=>`<option value="${k}" ${l.status===k?'selected':''}>${st[k][0]}</option>`).join('')}</select></td>
      <td>${tcDate(l.created_at)}</td></tr>`).join('')||'<tr><td colspan="7" style="opacity:.6">لا توجد طلبات بعد.</td></tr>'}
    </tbody></table></div></div>`;
}
async function tcLeadStatus(id,status){
  const {error}=await tcClient().from('leads').update({status}).eq('id',id);
  if(error)alert('خطأ: '+error.message);
}
