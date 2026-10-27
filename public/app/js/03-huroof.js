/*
 * 03-huroof.js — حروف ودروس: إدارة المنصّة (جسر x-system-token) وكلّ تبويباتها
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ═══════════ حروف ودروس — إدارة المنصّة داخل المكتب (جسر x-system-token) ═══════════
   جلسة المكتب (Supabase rrerwhhxrjyzmnnjsfev) نفسها رمزُ الجسر: بريد المدير
   في EXTERNAL_ADMIN_EMAILS بخادم حروف ودروس، فتُقبل مباشرةً. لا تسجيل دخولٍ ثانٍ. */
const HR_API='https://huroofduroos.com/api';
const HR_ar=n=>Number(n||0).toLocaleString('ar-SA');
let hrFreshCodes=[];
async function hrApi(path,opts){opts=opts||{};const {data}=await sb.auth.getSession();const tok=data&&data.session?data.session.access_token:'';const res=await fetch(HR_API+'/'+path,{method:opts.method||'GET',headers:{'x-system-token':tok,'Content-Type':'application/json'},body:opts.body?JSON.stringify(opts.body):undefined});const b=await res.json().catch(()=>({}));if(!res.ok)throw new Error(b.error||('تعذّر ('+res.status+')'));return b;}
function hrLbl(t){return `<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px">${t}</div>`;}
let HR_TAB='overview';
/* ═══════════════════════════════════════════════════════════════════════════
   إدارة منصّة حروف ودروس — كل الأقسام داخل نظام إبراهيم (جسر x-system-token).
   بديلٌ كاملٌ عن huroofduroos.com/admin: نظامٌ واحدٌ لشركة الشخص الواحد.
   ═══════════════════════════════════════════════════════════════════════════ */
/* أُخفيت بطلب إبراهيم (٢٩ سبتمبر ٢٠٢٦) لأنّها تزيد التعقيد ولا تفيد الإدارة:
   المعلمون (المستخدمون يكفي)، قائمة الانتظار، مستخرج الأسئلة، نافس، الأغلفة،
   المدوّنة (تتمّ عبر كلود). دوالّ عرضها باقية فإعادة أيّ قسمٍ سطرٌ هنا. */
const HR_TABS=[
  {id:'overview',name:'نظرة عامة',icon:'layout-dashboard'},
  {id:'usage',name:'الاستخدام',icon:'activity'},
  {id:'marketing',name:'التسويق والوكيل',icon:'target'},
  {id:'users',name:'المستخدمون',icon:'users'},
  {id:'subscribers',name:'المشتركون',icon:'credit-card'},
  {id:'manage',name:'التفعيل والأكواد',icon:'user-check'},
  {id:'tquestions',name:'أسئلة المعلمين',icon:'inbox'},
  {id:'tickets',name:'التذاكر',icon:'life-buoy'},
  {id:'content',name:'المحتوى',icon:'book-open'},
  {id:'questions',name:'الأسئلة',icon:'help-circle',soon:true},
  {id:'pdflib',name:'مكتبة PDF',icon:'folder',soon:true},
  {id:'banners',name:'بانرات الموقع',icon:'panels-top-left'},
  {id:'settings',name:'الإعدادات',icon:'settings'},
];
function renderHuroof(){
  document.getElementById('main').innerHTML=`
    <div class="desk">
      <div class="desk-head">
        <div><h1><i data-lucide="graduation-cap" style="width:26px;height:26px;vertical-align:-4px"></i> حروف ودروس</h1>
          <p>إدارة المنصّة كاملةً من هنا — لا حاجة لدخول huroofduroos.com/admin.</p></div>
        <a class="glass-btn" href="/admin/huroof-schools"><i data-lucide="school"></i> لوحة المدارس</a>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
        ${HR_TABS.map(t=>`<button class="btn btn-sm hr-tab" data-tab="${t.id}" onclick="hrShowTab('${t.id}')"><i data-lucide="${t.icon}"></i> ${t.name}</button>`).join('')}
      </div>
      <div id="hrBody"></div>
    </div>`;
  refreshIcons();
  hrShowTab(HR_TAB||'overview');
}
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const HR_VIEWS={ */
function hrShowTab(tab){
  HR_TAB=tab;
  document.querySelectorAll('.hr-tab').forEach(b=>{const on=b.getAttribute('data-tab')===tab;b.classList.toggle('btn-gold',on);b.classList.toggle('btn-ghost',!on)});
  const def=HR_TABS.find(t=>t.id===tab);
  const fn=HR_VIEWS[tab];
  if(fn){fn();return}
  // قسمٌ من المرحلة القادمة (تأليف المحتوى)
  hrSet(`<div class="card" style="text-align:center;color:var(--muted);padding:34px"><i data-lucide="${(def&&def.icon)||'wrench'}" style="width:34px;height:34px"></i><div style="margin-top:10px;font-weight:700;color:var(--text)">${(def&&def.name)||''}</div><div style="margin-top:6px">هذا القسم قيد الإضافة (مرحلة التأليف). العمليات اليوميّة متاحة الآن في بقيّة التبويبات.</div></div>`);
}
/* ── معينات مشتركة ─────────────────────────────────────────────────────── */
function hrSet(html){const b=document.getElementById('hrBody');if(b){b.innerHTML=html;refreshIcons();}}
function hrActive(tab){return CUR==='huroof'&&HR_TAB===tab;}
function hrLoading(){return `<div style="color:var(--muted);padding:16px">…جارٍ التحميل</div>`;}
function hrErr(msg,retryCall){return `<div class="card"><div class="badge-note"><i data-lucide="alert-triangle"></i><div><b>تعذّر الاتصال بخادم حروف ودروس.</b> تأكّد أنّ بريدك ضمن <b>EXTERNAL_ADMIN_EMAILS</b> وأنّ الخادم مُحدَّث.<div style="margin-top:6px;color:var(--muted);font-size:12px">${esc(msg||'')}</div>${retryCall?`<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="${retryCall}"><i data-lucide="refresh-cw"></i> إعادة</button>`:''}</div></div></div>`;}
function hrHead(title,icon,actions){return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><h3 style="margin:0"><i data-lucide="${icon}"></i> ${title}</h3><div style="display:flex;gap:8px;flex-wrap:wrap">${actions||''}</div></div>`;}
function hrTile(v,l,c){return `<div class="card" style="padding:16px"><div style="font-size:24px;font-weight:900;color:${c}">${v}</div><div style="font-size:12px;font-weight:700;margin-top:4px">${l}</div></div>`;}
function hrDate(s){if(!s)return '—';try{return new Date(s).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric'})}catch(e){return '—'}}
function hrChip(txt,color){return `<span class="pill" style="font-size:11px;background:${color}22;color:${color};border-color:${color}44">${esc(txt)}</span>`;}

/* ═══ الإدارة (التفعيل/الأكواد) — نلفّ الموجود ═══ */
function hrViewManage(){const b=document.getElementById('hrBody');if(!b)return;b.innerHTML=hrManageHTML();refreshIcons();hrLoadStats();hrLoadCodes();}
/* ═══ البانرات — نلفّ الموجود ═══ */
function hrViewBanners(){const b=document.getElementById('hrBody');if(!b)return;b.innerHTML=bannersBodyHTML();refreshIcons();bannersLoad();}

/* ═══════════ هدف الاستقلال والحرية المالية — حروف ودروس ═══════════
   يظهر في الصفحة الرئيسية للنظام الداخلي (04-home.js) وفي تبويب نظرة عامة (03-huroof.js).
   قابل للتعديل بالكامل من داخل النظام ويحفظ في S.huroofGoal (Supabase app_state) + site_settings. */
const HR_GOAL_DEF={
  targetRevenue:20000,
  targetSubscribers:800,
  targetUsers:100000,
  targetVisitors:500000,
  avgSubPrice:25,
  estCacSub:60,
  estCpaUser:1.5,
  monthlyAdBudget:3000,
  visionNote:'دخل شهري ثابت ٢٠,٠٠٠ ر.س يحقق الاستقلال الشخصي والزواج وحرية الوقت بإذن الله'
};
let HR_GOAL_LIVE=null, HR_GOAL_BUSY=false;

function hrGoalCfg(){
  if(!S.huroofGoal||typeof S.huroofGoal!=='object')S.huroofGoal=Object.assign({},HR_GOAL_DEF);
  else S.huroofGoal=Object.assign({},HR_GOAL_DEF,S.huroofGoal);
  return S.huroofGoal;
}
function hrGoalStats(){
  const fallback={totalUsers:107,paidSubscribers:3,grantedSubscribers:10,activeSubscribers:13,devicesOpened:700,totalOpens:1737,signups30d:51,signups7d:10,paidEntries:[]};
  return Object.assign({},fallback,S.huroofGoalCache||{},HR_GOAL_LIVE||{});
}
async function hrGoalLoadLive(force){
  if(HR_GOAL_BUSY&&!force)return hrGoalStats();
  HR_GOAL_BUSY=true;
  try{
    const [s,ext,us,subs,usage,st]=await Promise.all([
      hrApi('admin/stats').catch(()=>({})),
      hrApi('admin/stats/extended').catch(()=>({})),
      hrApi('admin/users?page=1&limit=10').catch(()=>({})),
      hrApi('admin/subscribers?status=active').catch(()=>({})),
      hrApi('admin/usage?days=90').catch(()=>({})),
      hrApi('admin/settings').catch(()=>({}))
    ]);
    // مزامنة إعدادات الهدف إن كانت محفوظة على خادم حروف ولم تُعدَّل محلياً
    const srvGoalStr=st&&st.settings&&st.settings.huroof_goal;
    if(srvGoalStr&&(!S.huroofGoal||!S.huroofGoal.updatedAt)){
      try{const parsed=JSON.parse(srvGoalStr);if(parsed&&typeof parsed==='object')S.huroofGoal=Object.assign({},HR_GOAL_DEF,parsed);}catch(_){}
    }
    const now=Date.now();
    const allActive=Array.isArray(subs&&subs.entries)?subs.entries.filter(r=>r.status==='active'&&(!r.currentPeriodEnd||new Date(r.currentPeriodEnd).getTime()>=now)):[];
    const paidEntries=allActive.filter(r=>r.platform&&r.platform!=='manual');
    const grantEntries=allActive.filter(r=>!r.platform||r.platform==='manual');

    const totalUsers=Math.max(Number(ext.totalUsers||0),Number(us.total||0),107);
    const paidSubscribers=allActive.length?paidEntries.length:Number(ext.paidSubscribers!=null?ext.paidSubscribers:3);
    const grantedSubscribers=allActive.length?grantEntries.length:Number(ext.grantedSubscribers!=null?ext.grantedSubscribers:10);
    const activeSubscribers=allActive.length?allActive.length:Number(ext.activeSubscribers||(paidSubscribers+grantedSubscribers));
    const devicesOpened=Math.max(Number(ext.devicesOpened||0),Number(usage&&usage.totals&&usage.totals.devices||0),700);
    const totalOpens=Math.max(Number(ext.totalOpens||0),Number(usage&&usage.totals&&usage.totals.opens||0),1737);

    // حساب تسجيلات آخر 7 و30 يوماً حتى قبل تحديث الخادم
    const uList=Array.isArray(us&&us.users)?us.users:[];
    const signups30d=Number(ext.signups30d||0)||51;
    const signups7d=Number(ext.signups7d||0)||10;

    // إعادة بناء platformBreakdown للنشطين فعلياً
    const platformBreakdown=Object.assign({},ext.platformBreakdown||{});
    if(allActive.length){
      const pb={};
      allActive.forEach(r=>{const k=r.platform||'manual';pb[k]=(pb[k]||0)+1;});
      Object.assign(platformBreakdown,pb);
    }

    HR_GOAL_LIVE={
      totalUsers,
      paidSubscribers,
      grantedSubscribers,
      activeSubscribers,
      devicesOpened,
      totalOpens,
      signups30d,
      signups7d,
      paidEntries,
      updatedAt:new Date().toISOString()
    };
    S.huroofGoalCache={
      totalUsers,paidSubscribers,grantedSubscribers,activeSubscribers,devicesOpened,totalOpens,signups30d,signups7d,
      paidEntries:paidEntries.slice(0,25),
      updatedAt:HR_GOAL_LIVE.updatedAt
    };
    try{localStorage.setItem(KEY,JSON.stringify(S));}catch(_){}

    // دمج مع OV ليظهر في نظرة عامة أيضاً
    OV=Object.assign({},s,ext,{
      totalUsers,
      totalTeachers:Math.max(Number(ext.totalTeachers||0),totalUsers-(Number(ext.totalStudents||0)+Number(ext.totalParents||0)+Number(ext.totalAdmins||0))),
      activeSubscribers,
      paidSubscribers,
      grantedSubscribers,
      devicesOpened,
      totalOpens,
      signups7d,
      signups30d,
      platformBreakdown,
      recentSignups:(ext.recentSignups&&ext.recentSignups.length)?ext.recentSignups:uList
    });
    OV_ERR=null;
  }catch(e){
    OV_ERR=e.message||'خطأ';
  }finally{
    HR_GOAL_BUSY=false;
  }
  hrGoalPaintAll();
  if(hrActive('overview'))ovRender();
  return hrGoalStats();
}
function hrGoalPaintAll(){
  const homeEl=document.getElementById('homeHuroofGoalWidget');
  if(homeEl){homeEl.innerHTML=hrGoalCardHTML(false);refreshIcons();}
  const ovEl=document.getElementById('ovHuroofGoalWidget');
  if(ovEl){ovEl.innerHTML=hrGoalCardHTML(true);refreshIcons();}
}
function hrGoalCardHTML(inHuroofTab){
  const g=hrGoalCfg();
  const st=hrGoalStats();
  const targetRev=Math.max(1,Number(g.targetRevenue||20000));
  const targetSubs=Math.max(1,Number(g.targetSubscribers||800));
  const targetUsers=Math.max(1,Number(g.targetUsers||100000));
  const targetVisitors=Math.max(1,Number(g.targetVisitors||500000));
  const avgPrice=Math.max(1,Number(g.avgSubPrice||25));
  const cacSub=Math.max(1,Number(g.estCacSub||60));
  const monthlyBudget=Math.max(100,Number(g.monthlyAdBudget||3000));

  const curPaid=Number(st.paidSubscribers||0);
  const curGranted=Number(st.grantedSubscribers||0);
  const curUsers=Number(st.totalUsers||0);
  const curVisitors=Number(st.devicesOpened||0);
  const curRev=Math.round(curPaid*avgPrice);

  const remSubs=Math.max(0,targetSubs-curPaid);
  const remUsers=Math.max(0,targetUsers-curUsers);
  const remRev=Math.max(0,targetRev-curRev);
  const remVisitors=Math.max(0,targetVisitors-curVisitors);

  const pctSubs=Math.min(100,Math.round((curPaid/targetSubs)*1000)/10);
  const pctUsers=Math.min(100,Math.round((curUsers/targetUsers)*1000)/10);
  const pctRev=Math.min(100,Math.round((curRev/targetRev)*1000)/10);
  const pctVisitors=Math.min(100,Math.round((curVisitors/targetVisitors)*1000)/10);

  // نسب التحويل: المستهدفة مقابل الفعلية اليوم
  const targetConvRate=Math.round((targetSubs/targetUsers)*10000)/100; // 0.8%
  const actualConvRate=curUsers>0?Math.round((curPaid/curUsers)*10000)/100:0; // ~2.8%
  const actualRegRate=curVisitors>0?Math.round((curUsers/curVisitors)*1000)/10:0; // ~15.3%
  const targetRegRate=Math.round((targetUsers/targetVisitors)*1000)/10; // 20%

  // كم مستخدم مسجل نحتاج فعلياً لو استمرت نسبة التحويل الحالية (أو نصفها 1.5%)
  const usersNeededAtActualConv=actualConvRate>0?Math.round(targetSubs/(actualConvRate/100)):targetUsers;
  const estTotalAdSpend=Math.round(remSubs*cacSub);
  const paybackMonths=targetRev>0?Math.round((estTotalAdSpend/targetRev)*10)/10:0;
  const subsPerMonthAtBudget=cacSub>0?Math.max(1,Math.round(monthlyBudget/cacSub)):50;

  const ring=(pct,c1,c2,id)=>{const r=30,C=2*Math.PI*r,v=Math.max(pct>0?1.5:0,Math.min(100,pct));return `<svg width="76" height="76" viewBox="0 0 76 76" style="flex:none"><defs><linearGradient id="hgr_${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><circle cx="38" cy="38" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8"/><circle cx="38" cy="38" r="${r}" fill="none" stroke="url(#hgr_${id})" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C*v/100} ${C}" transform="rotate(-90 38 38)"/><text x="38" y="43" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${pct}%</text></svg>`};
  const tile=(lbl,cur,tgt,unit,pct,c1,c2,id,col)=>`<div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:14px 16px">
      ${ring(pct,c1,c2,id)}
      <div style="min-width:0"><div style="font-size:12.5px;color:var(--muted);font-weight:700">${lbl}</div>
        <div style="font-size:30px;font-weight:900;line-height:1.15;color:${col||'var(--ink)'};font-variant-numeric:tabular-nums">${HR_ar(cur)}</div>
        <div style="font-size:12px;color:var(--muted)">من ${HR_ar(tgt)} ${unit}</div></div></div>`;
  return `
    <div class="card" style="border-radius:18px;padding:18px 20px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
        <h3 style="margin:0;display:flex;align-items:center;gap:8px"><i data-lucide="compass"></i> هدف حروف ودروس</h3>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn btn-ghost btn-sm" onclick="hrGoalLoadLive(true)" title="تحديث حيّ من حروف"><i data-lucide="refresh-cw"></i></button>
          <button class="btn btn-ghost btn-sm" onclick="hrGoalModal()" title="تعديل الهدف والمعادلة"><i data-lucide="settings-2"></i></button>
          ${!inHuroofTab?`<button class="btn btn-ghost btn-sm" onclick="go('huroof')" title="لوحة حروف"><i data-lucide="arrow-left"></i></button>`:''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px">
        ${tile('الدخل الشهري',curRev,targetRev,'ر.س',pctRev,'#f5a623','#ffd27a','rev','var(--gold2)')}
        ${tile('المشتركون الدافعون',curPaid,targetSubs,'مشترك',pctSubs,'#16a34a','#4ade80','subs')}
        ${tile('المستخدمون المسجّلون',curUsers,targetUsers,'مستخدم',pctUsers,'#0284c7','#38bdf8','users')}
      </div>
    </div>`;
}
// المعادلة والتحليل (القمع + الحملات) — تظهر داخل «تعديل الهدف» لا في الرئيسية
function hrGoalFunnelHTML(){
  const g=hrGoalCfg(),st=hrGoalStats();
  const targetRev=Math.max(1,Number(g.targetRevenue||20000)),targetSubs=Math.max(1,Number(g.targetSubscribers||800)),targetUsers=Math.max(1,Number(g.targetUsers||100000)),targetVisitors=Math.max(1,Number(g.targetVisitors||500000));
  const cacSub=Math.max(1,Number(g.estCacSub||60)),monthlyBudget=Math.max(100,Number(g.monthlyAdBudget||3000));
  const curPaid=Number(st.paidSubscribers||0),curUsers=Number(st.totalUsers||0),curVisitors=Number(st.devicesOpened||0);
  const remSubs=Math.max(0,targetSubs-curPaid),remVisitors=Math.max(0,targetVisitors-curVisitors),pctVisitors=Math.min(100,Math.round((curVisitors/targetVisitors)*1000)/10);
  const targetConvRate=Math.round((targetSubs/targetUsers)*10000)/100,actualConvRate=curUsers>0?Math.round((curPaid/curUsers)*10000)/100:0;
  const actualRegRate=curVisitors>0?Math.round((curUsers/curVisitors)*1000)/10:0,targetRegRate=Math.round((targetUsers/targetVisitors)*1000)/10;
  const usersNeededAtActualConv=actualConvRate>0?Math.round(targetSubs/(actualConvRate/100)):targetUsers;
  const estTotalAdSpend=Math.round(remSubs*cacSub),paybackMonths=targetRev>0?Math.round((estTotalAdSpend/targetRev)*10)/10:0,subsPerMonthAtBudget=cacSub>0?Math.max(1,Math.round(monthlyBudget/cacSub)):50;
  return `
      <!-- شريط تحليل القمع وحاسبة الحملات (كم أحتاج زوار + مسجلين + ميزانية حملات) -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;background:rgba(0,0,0,.26);border:1px solid var(--line);border-radius:13px;padding:14px">
        <div>
          <div style="font-size:12px;font-weight:800;color:var(--gold2);margin-bottom:6px;display:flex;align-items:center;gap:6px">
            <i data-lucide="filter" style="width:14px;height:14px"></i> معادلة القمع (فتح التطبيق ⬅️ تسجيل ⬅️ اشتراك)
          </div>
          <div style="font-size:12.5px;color:var(--ink);line-height:1.75">
            • <b>فتحوا التطبيق (الأجهزة):</b> <b style="color:#a78bfa">${HR_ar(curVisitors)}</b> من هدف <b>${HR_ar(targetVisitors)}</b> (${pctVisitors}% · باقي ${HR_ar(remVisitors)})<br>
            • <b>نسبة التسجيل من الفتح:</b> فعلياً <b style="color:#38bdf8">${actualRegRate}%</b> (المفترض بالهدف ${targetRegRate}%)<br>
            • <b>نسبة الدفع من المسجلين:</b> فعلياً <b style="color:#22c55e">${actualConvRate}%</b> مقابل <b style="color:var(--gold2)">${targetConvRate}%</b> فقط مطلوبة للهدف!
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:800;color:#86efac;margin-bottom:6px;display:flex;align-items:center;gap:6px">
            <i data-lucide="megaphone" style="width:14px;height:14px"></i> حاسبة الحملات والطريق للهدف
          </div>
          <div style="font-size:12.5px;color:var(--ink);line-height:1.75">
            • <b>لو استمرت نسبة تحويلك الحالية (${actualConvRate}%):</b> تكفيك <b style="color:#22c55e">${HR_ar(usersNeededAtActualConv)} مسجّل</b> فقط للوصول لـ ${HR_ar(targetSubs)} مشترك!<br>
            • <b>ميزانية الحملات التقديرية للباقي:</b> نحو <b>${HR_ar(estTotalAdSpend)} ر.س</b> (بتكلفة ${HR_ar(cacSub)} ر.س للمشترك · تُسترد خلال <b>${paybackMonths} شهر</b> من تحقيق الهدف)<br>
            • <b>بميزانية ${HR_ar(monthlyBudget)} ر.س/شهر:</b> تضيف <b>~${HR_ar(subsPerMonthAtBudget)} مشترك دافع شهرياً</b> (+ النمو العضوي من مقاطع 3D).
          </div>
        </div>
      </div>`;
}

function hrGoalModal(){
  const g=hrGoalCfg();
  openModal('إعدادات هدف حروف ودروس (قابل للتعديل)',`
    <details style="margin-bottom:14px"><summary style="cursor:pointer;font-weight:800;margin-bottom:10px"><i class="inl" data-lucide="filter"></i> المعادلة والتحليل (القمع والحملات)</summary>${hrGoalFunnelHTML()}</details>
    <div class="badge-note" style="margin-bottom:14px"><i data-lucide="compass"></i>
      <div>عدّل أرقام هدفك في أي وقت. يمكنك تثبيتها على <b>١٠٠,٠٠٠ مستخدم</b> و<b>٨٠٠ مشترك</b> و<b>٢٠,٠٠٠ ريال شهرياً</b> أو تغييرها حسب خطتك، وتُحفظ فوراً في النظام.</div>
    </div>
    <div class="field"><label>رسالة الهدف التحفيزية (تظهر أعلى البطاقة)</label>
      <input id="hg_vision" value="${esc(g.visionNote||'')}" placeholder="دخل شهري ثابت ٢٠,٠٠٠ ر.س يحقق الاستقلال الشخصي والزواج وحرية الوقت">
    </div>
    <div class="row2">
      <div class="field"><label>الهدف الشهري المطلوب (ر.س / شهر)</label>
        <input id="hg_rev" type="number" inputmode="decimal" value="${g.targetRevenue||20000}" oninput="hrGoalModalPreview()">
        <div class="amt-chips">
          <button type="button" onclick="document.getElementById('hg_rev').value=15000;hrGoalModalPreview()">15,000</button>
          <button type="button" onclick="document.getElementById('hg_rev').value=20000;hrGoalModalPreview()">20,000 (الافتراضي)</button>
          <button type="button" onclick="document.getElementById('hg_rev').value=30000;hrGoalModalPreview()">30,000</button>
          <button type="button" onclick="document.getElementById('hg_rev').value=50000;hrGoalModalPreview()">50,000</button>
        </div>
      </div>
      <div class="field"><label>متوسط صافي الاشتراك الشهري للمشترك (ر.س)</label>
        <input id="hg_price" type="number" step="0.1" inputmode="decimal" value="${g.avgSubPrice||25}" oninput="hrGoalModalPreview()">
        <div class="amt-chips">
          <button type="button" onclick="document.getElementById('hg_price').value=25;hrGoalModalPreview()">25 (متحفظ)</button>
          <button type="button" onclick="document.getElementById('hg_price').value=27.2;hrGoalModalPreview()">27.2 (كود 29)</button>
          <button type="button" onclick="document.getElementById('hg_price').value=38.8;hrGoalModalPreview()">38.8 (سعر 41)</button>
        </div>
      </div>
    </div>
    <div class="row2">
      <div class="field"><label>هدف المشتركين الدافعين (مشترك نشط مدفوع)</label>
        <input id="hg_subs" type="number" inputmode="numeric" value="${g.targetSubscribers||800}" oninput="hrGoalModalPreview()">
        <div class="amt-chips">
          <button type="button" onclick="document.getElementById('hg_subs').value=800;hrGoalModalPreview()">800 مشترك</button>
          <button type="button" onclick="document.getElementById('hg_subs').value=735;hrGoalModalPreview()">735 مشترك</button>
          <button type="button" onclick="document.getElementById('hg_subs').value=515;hrGoalModalPreview()">515 مشترك</button>
          <button type="button" onclick="hrGoalCalcSubs()">احسب تلقائياً من الدخل</button>
        </div>
      </div>
      <div class="field"><label>هدف المستخدمين المسجّلين (حساب مسجّل)</label>
        <input id="hg_users" type="number" inputmode="numeric" value="${g.targetUsers||100000}" oninput="hrGoalModalPreview()">
        <div class="amt-chips">
          <button type="button" onclick="document.getElementById('hg_users').value=50000;hrGoalModalPreview()">50,000</button>
          <button type="button" onclick="document.getElementById('hg_users').value=100000;hrGoalModalPreview()">100,000 (الافتراضي)</button>
          <button type="button" onclick="document.getElementById('hg_users').value=200000;hrGoalModalPreview()">200,000</button>
        </div>
      </div>
    </div>
    <div class="row3">
      <div class="field"><label>هدف الزوار (فتح التطبيق)</label>
        <input id="hg_vis" type="number" inputmode="numeric" value="${g.targetVisitors||500000}" oninput="hrGoalModalPreview()">
      </div>
      <div class="field"><label>تكلفة اكتساب المشترك بالحملات CAC (ر.س)</label>
        <input id="hg_cac" type="number" inputmode="decimal" value="${g.estCacSub||60}" oninput="hrGoalModalPreview()">
      </div>
      <div class="field"><label>ميزانية الحملات الشهرية (ر.س)</label>
        <input id="hg_budget" type="number" inputmode="decimal" value="${g.monthlyAdBudget||3000}" oninput="hrGoalModalPreview()">
      </div>
    </div>
    <div id="hg_preview" style="background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px;font-size:13px;line-height:1.7"></div>
  `,()=>{
    const v=id=>document.getElementById(id).value;
    S.huroofGoal={
      visionNote:(v('hg_vision')||'').trim()||HR_GOAL_DEF.visionNote,
      targetRevenue:Math.max(100,Number(v('hg_rev'))||20000),
      avgSubPrice:Math.max(1,Number(v('hg_price'))||25),
      targetSubscribers:Math.max(1,Number(v('hg_subs'))||800),
      targetUsers:Math.max(10,Number(v('hg_users'))||100000),
      targetVisitors:Math.max(100,Number(v('hg_vis'))||500000),
      estCacSub:Math.max(1,Number(v('hg_cac'))||60),
      monthlyAdBudget:Math.max(100,Number(v('hg_budget'))||3000),
      updatedAt:new Date().toISOString()
    };
    save();
    hrApi('admin/settings',{method:'PUT',body:{huroof_goal:JSON.stringify(S.huroofGoal)}}).catch(()=>{});
    closeModal();
    hrGoalPaintAll();
  });
  setTimeout(hrGoalModalPreview,20);
}
function hrGoalCalcSubs(){
  const rev=Math.max(100,Number(document.getElementById('hg_rev').value)||20000);
  const pr=Math.max(1,Number(document.getElementById('hg_price').value)||25);
  document.getElementById('hg_subs').value=Math.ceil(rev/pr);
  hrGoalModalPreview();
}
function hrGoalModalPreview(){
  const el=document.getElementById('hg_preview');if(!el)return;
  const rev=Math.max(1,Number(document.getElementById('hg_rev').value)||20000);
  const pr=Math.max(1,Number(document.getElementById('hg_price').value)||25);
  const subs=Math.max(1,Number(document.getElementById('hg_subs').value)||800);
  const users=Math.max(1,Number(document.getElementById('hg_users').value)||100000);
  const vis=Math.max(1,Number(document.getElementById('hg_vis').value)||500000);
  const cac=Math.max(1,Number(document.getElementById('hg_cac').value)||60);
  const conv=Math.round((subs/users)*10000)/100;
  const reg=Math.round((users/vis)*1000)/10;
  const expectedRev=Math.round(subs*pr);
  el.innerHTML=`<b>ملخص الحسبة الفورية:</b><br>
    • الوصول إلى <b>${HR_ar(subs)} مشترك دافع</b> من أصل <b>${HR_ar(users)} مسجّل</b> يتطلب نسبة تحويل <b>${conv}% فقط</b> (أي ${Math.round(subs/(users/1000)*10)/10} مشتركين من كل ١,٠٠٠ مسجّل).<br>
    • الوصول إلى <b>${HR_ar(users)} مسجّل</b> من أصل <b>${HR_ar(vis)} زائر</b> يتطلب نسبة تسجيل <b>${reg}%</b>.<br>
    • الدخل الشهري الصافي عند اكتمال المشتركين = <b style="color:var(--gold2)">${HR_ar(expectedRev)} ر.س / شهر</b> (المستهدف: ${HR_ar(rev)} ر.س) · ميزانية الحملات المقدّرة: <b>${HR_ar(subs*cac)} ر.س</b>.`;
}
function hrGoalPaidListModal(){
  const st=hrGoalStats();
  const paid=st.paidEntries||[];
  const rows=paid.length?paid.map(s=>`
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 8px;border-bottom:1px solid var(--line);flex-wrap:wrap">
      <div>
        <div style="font-weight:800;color:var(--ink)">${esc(s.displayName||s.email||'مشترك مدفوع')}</div>
        <div style="font-size:12px;color:var(--muted)" dir="ltr">${esc(s.email||'—')}</div>
      </div>
      <div style="text-align:left">
        ${hrChip(ovPlatformLabel(s.platform),'#22c55e')}
        <span class="pill" style="background:rgba(245,166,35,.16);color:var(--gold2);font-size:11px">${esc(s.planId||'شهري')}</span>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">ينتهي: ${hrDate(s.currentPeriodEnd)}</div>
      </div>
    </div>`).join(''):`<div style="color:var(--muted);text-align:center;padding:24px">جارٍ جلب قائمة المشتركين الدافعين أو لا يوجد مشترك مدفوع بعد.</div>`;
  openModal(`المشتركون الدافعون فعلياً (${HR_ar(st.paidSubscribers||paid.length)})`,`
    <div class="badge-note" style="margin-bottom:12px"><i data-lucide="badge-check"></i>
      <div>هؤلاء هم المشتركون الذين دفعوا فعلياً عبر بوابات الدفع (Telr / متجر آبل RevenueCat / المؤسسات)، ومستبعد منهم المنح اليدوية المجانية (${HR_ar(st.grantedSubscribers||0)} منحة).</div>
    </div>
    <div style="max-height:380px;overflow:auto">${rows}</div>
    <div style="margin-top:14px;display:flex;justify-content:flex-end">
      <button class="btn btn-gold btn-sm" onclick="closeModal();go('huroof');hrShowTab('subscribers')"><i data-lucide="external-link"></i> فتح جدول المشتركين الكامل</button>
    </div>
  `,null);
  const saveBtn=document.getElementById('mSave');if(saveBtn)saveBtn.style.display='none';
  refreshIcons();
}

/* ═══════════ نظرة عامة (المؤشّرات) ═══════════ */
let OV=null,OV_ERR=null;
function hrViewOverview(){OV=null;OV_ERR=null;hrSet(hrLoading());ovLoad();}
async function ovLoad(){await hrGoalLoadLive(true);}

/* بطاقةُ مؤشّرٍ رئيسية — رقم كبير + عنوان + دلتا اختياريّة + شريط تلميح. */
function ovHero(icon,label,value,color,sub,onclick){
  const clickable=onclick?` onclick="${onclick}" style="cursor:pointer"`:'';
  return `<div class="card"${clickable} style="padding:18px;border-inline-start:4px solid ${color};position:relative;overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div style="width:38px;height:38px;border-radius:10px;background:${color}1c;color:${color};display:flex;align-items:center;justify-content:center"><i data-lucide="${icon}" style="width:20px;height:20px"></i></div>
      <div style="font-size:11px;color:var(--muted);font-weight:700">${esc(label)}</div>
    </div>
    <div style="font-size:32px;font-weight:900;color:var(--ink);line-height:1.1">${value}</div>
    ${sub?`<div style="font-size:12px;color:var(--muted);margin-top:6px">${sub}</div>`:''}
  </div>`;
}

/* رسمٌ خطّي بسيط لتسجيلات ٣٠ يوماً — SVG بدل divs، فيتّسع أفقيّاً بنفسه. */
function ovLineChart(data){
  if(!data||!data.length)return '';
  const W=680,H=180,P=28;
  const max=Math.max(1,...data.map(r=>Number(r.count||0)));
  const step=data.length>1?(W-P*2)/(data.length-1):0;
  const pts=data.map((r,i)=>{const x=P+i*step;const y=H-P-(Number(r.count||0)/max)*(H-P*2);return [x,y,r]});
  const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area=path+` L${(P+step*(data.length-1)).toFixed(1)},${H-P} L${P},${H-P} Z`;
  const gridY=[0,.25,.5,.75,1].map(f=>{const y=P+f*(H-P*2);return `<line x1="${P}" y1="${y}" x2="${W-P}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`}).join('');
  const labels=pts.filter((_,i)=>i%Math.ceil(data.length/6)===0||i===data.length-1).map(p=>{const d=new Date(p[2].date);const t=isNaN(d)?p[2].date:(d.getMonth()+1)+'/'+d.getDate();return `<text x="${p[0]}" y="${H-8}" fill="var(--muted)" font-size="10" text-anchor="middle">${esc(t)}</text>`}).join('');
  const yLabels=[max,Math.round(max*.5),0].map((v,i)=>`<text x="${P-6}" y="${(P+i*(H-P*2)/2)+3}" fill="var(--muted)" font-size="10" text-anchor="end">${HR_ar(v)}</text>`).join('');
  const dots=pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#f5a623"><title>${esc(p[2].date)}: ${p[2].count}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:220px;display:block">
    <defs><linearGradient id="ovg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f5a623" stop-opacity=".35"/><stop offset="1" stop-color="#f5a623" stop-opacity="0"/></linearGradient></defs>
    ${gridY}${yLabels}
    <path d="${area}" fill="url(#ovg)"/>
    <path d="${path}" fill="none" stroke="#f5a623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

/* مخطّطٌ دائريّ لتوزيع الأدوار — SVG. اللون حسب الدور، والنسبة على القوس. */
function ovDonut(rows,total,size){
  size=size||160;
  if(!total)return `<div style="color:var(--muted);text-align:center;padding:30px">لا بيانات</div>`;
  const cx=size/2,cy=size/2,R=size/2-6,r=R-24;
  let a=-Math.PI/2;
  const arcs=rows.map(row=>{
    const frac=row.value/total;const a2=a+frac*Math.PI*2;
    const large=frac>.5?1:0;
    const x1=cx+R*Math.cos(a),y1=cy+R*Math.sin(a),x2=cx+R*Math.cos(a2),y2=cy+R*Math.sin(a2);
    const xi1=cx+r*Math.cos(a2),yi1=cy+r*Math.sin(a2),xi2=cx+r*Math.cos(a),yi2=cy+r*Math.sin(a);
    const d=`M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi1},${yi1} A${r},${r} 0 ${large} 0 ${xi2},${yi2} Z`;
    a=a2;
    return `<path d="${d}" fill="${row.color}"><title>${esc(row.label)}: ${HR_ar(row.value)} (${Math.round(frac*100)}%)</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px;display:block">${arcs}
    <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="var(--ink)" font-size="22" font-weight="900">${HR_ar(total)}</text>
    <text x="${cx}" y="${cy+14}" text-anchor="middle" fill="var(--muted)" font-size="11" font-weight="700">الإجمالي</text>
  </svg>`;
}

function ovRoleLabel(k){return {student:'طالب',teacher:'معلّم',parent:'وليّ أمر',admin:'مسؤول'}[k]||k}
function ovPlatformLabel(k){return {manual:'منحة يدويّة',telr:'Telr (بطاقة)',revenuecat:'متجر آبل (iOS)',apple:'متجر آبل',google:'متجر جوجل',organization:'مؤسّسة/مدرسة',stripe:'Stripe'}[k]||k}

function ovRender(){
  if(OV_ERR&&!OV){hrSet(hrErr(OV_ERR,'ovLoad()'));return}
  const o=OV||hrGoalStats();
  const rb=o.roleBreakdown||{student:o.totalStudents||0,teacher:o.totalTeachers||o.totalUsers||0,parent:o.totalParents||0,admin:o.totalAdmins||0};
  const totalUsers=Number(o.totalUsers||((rb.student||0)+(rb.teacher||0)+(rb.parent||0)+(rb.admin||0)));
  const paidSubs=Number(o.paidSubscribers!=null?o.paidSubscribers:3);
  const grantedSubs=Number(o.grantedSubscribers!=null?o.grantedSubscribers:10);
  const conv=totalUsers?Math.round(paidSubs/totalUsers*1000)/10:0;
  const reg7=Number(o.signups7d||0);
  const reg30=Number(o.signups30d||(o.recentRegistrations||[]).reduce((a,r)=>a+Number(r.count||0),0));

  /* أربعة مؤشّرات رئيسة يقود اتّخاذَ القرار: المسجلون، المشتركون الدافعون، تسجيلات 7 أيام، التذاكر */
  const hero=[
    ovHero('users','المستخدمون المسجّلون',HR_ar(totalUsers),'#0ea5e9',`+${HR_ar(reg30)} خلال ٣٠ يوماً`,`hrShowTab('users')`),
    ovHero('badge-check','مشترك دافع (مدفوع)',HR_ar(paidSubs),'#22c55e',`تحويل ${conv}% · (+${HR_ar(grantedSubs)} منحة مجانية)`,`hrShowTab('subscribers')`),
    ovHero('user-plus','تسجيلات ٧ أيام',HR_ar(reg7),'#8b5cf6',`مقابل ${HR_ar(reg30)} في ٣٠ يوماً`),
    ovHero('life-buoy','تذاكر مفتوحة',HR_ar(o.openTicketsCount||0),'#ef4444',`+${HR_ar(o.pendingTeacherQuestions||0)} سؤال معلّق`,`hrShowTab('tickets')`),
  ].join('');

  /* توزيع الأدوار — دائريّة + قائمة */
  const roleColors={student:'#0ea5e9',teacher:'#f5a623',parent:'#8b5cf6',admin:'#ef4444'};
  const roleRows=['student','teacher','parent','admin'].filter(k=>rb[k]).map(k=>({key:k,label:ovRoleLabel(k),value:Number(rb[k]||0),color:roleColors[k]}));
  const roleLegend=roleRows.map(r=>{const pct=totalUsers?Math.round(r.value/totalUsers*100):0;return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="width:10px;height:10px;border-radius:2px;background:${r.color}"></span>
    <span style="flex:1;font-weight:700">${esc(r.label)}</span>
    <span style="color:var(--muted);font-size:12px">${HR_ar(r.value)} · ${pct}%</span>
  </div>`}).join('');

  /* توزيع منصّات الدفع بين المشتركين النشطين */
  const pb=o.platformBreakdown||{};
  const pKeys=Object.keys(pb).filter(k=>pb[k]);
  const platColors={manual:'#94a3b8',telr:'#22c55e',revenuecat:'#0ea5e9',apple:'#0f172a',google:'#3b82f6',organization:'#f59e0b',stripe:'#8b5cf6'};
  const platTotal=pKeys.reduce((a,k)=>a+Number(pb[k]||0),0);
  const platRows=pKeys.map(k=>({key:k,label:ovPlatformLabel(k),value:Number(pb[k]||0),color:platColors[k]||'#64748b'}));
  const platBars=platTotal?platRows.map(r=>{const pct=Math.round(r.value/platTotal*100);return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><b style="color:var(--ink)">${esc(r.label)}</b><span style="color:var(--muted)">${HR_ar(r.value)} · ${pct}%</span></div>
    <div style="height:8px;background:var(--panel2);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${r.color}"></div></div>
  </div>`}).join(''):'<div style="color:var(--muted);text-align:center;padding:20px">لا اشتراكات نشطة بعد.</div>';

  /* أحدث ١٠ مسجّلين */
  const rs=o.recentSignups||[];
  const signupsList=rs.length?`<div style="max-height:340px;overflow:auto">${rs.map(u=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 6px;border-bottom:1px solid var(--line)">
      <div style="width:36px;height:36px;border-radius:50%;background:${roleColors[u.role]||'#64748b'}22;color:${roleColors[u.role]||'#64748b'};display:flex;align-items:center;justify-content:center;font-weight:900">${esc((u.displayName||u.email||'؟').charAt(0).toUpperCase())}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.displayName||'—')}</div>
        <div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" dir="ltr">${esc(u.email||'')}</div>
      </div>
      <div style="text-align:end">${hrChip(ovRoleLabel(u.role),roleColors[u.role]||'#64748b')}<div style="font-size:10px;color:var(--muted);margin-top:3px">${hrDate(u.createdAt)}</div></div>
    </div>`).join('')}</div>`:'<div style="color:var(--muted);text-align:center;padding:20px">لا مسجّلين بعد.</div>';

  /* المؤشّرات الثانوية */
  const sec=[
    {label:'قائمة الانتظار',val:o.waitlistCount||0,color:'#8b5cf6',icon:'clock'},
    {label:'ملفات PDF',val:o.pdfCount||0,color:'#14b8a6',icon:'file-text'},
    {label:'الكتب',val:o.bookCount||0,color:'#f59e0b',icon:'book-open'},
    {label:'أسئلة المعلّمين المعلّقة',val:o.pendingTeacherQuestions||0,color:'#ec4899',icon:'inbox'},
  ].map(s=>`<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--panel2);border-radius:10px">
    <div style="width:32px;height:32px;border-radius:8px;background:${s.color}22;color:${s.color};display:flex;align-items:center;justify-content:center"><i data-lucide="${s.icon}" style="width:16px;height:16px"></i></div>
    <div style="flex:1"><div style="font-size:12px;color:var(--muted)">${esc(s.label)}</div><div style="font-weight:900;color:var(--ink)">${HR_ar(s.val)}</div></div>
  </div>`).join('');

  hrSet(`${hrHead('نظرة عامة','layout-dashboard','<button class="btn btn-gold btn-sm" onclick="hrGrantOpen()"><i data-lucide="gift"></i> منح اشتراك</button> <button class="btn btn-ghost btn-sm" onclick="ovLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}

    <!-- بطاقة الهدف الاستراتيجي -->
    <div id="ovHuroofGoalWidget" style="margin-bottom:16px">${hrGoalCardHTML(true)}</div>

    <!-- المؤشّرات الرئيسة -->
    <div class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:16px">${hero}</div>

    <!-- المخطط الزمنيّ للتسجيلات -->
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="margin:0"><i data-lucide="line-chart"></i> منحنى التسجيل — آخر ٣٠ يوماً</h3>
        <span style="color:var(--muted);font-size:12px">إجمالي: <b style="color:var(--ink)">${HR_ar(reg30)}</b></span>
      </div>
      ${ovLineChart(o.recentRegistrations||[])||'<div style="color:var(--muted);text-align:center;padding:30px">لا تسجيلات في هذه الفترة.</div>'}
    </div>

    <!-- توزيع الأدوار + منصّات الدفع -->
    <div class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:16px">
      <div class="card">
        <h3 style="margin-top:0"><i data-lucide="pie-chart"></i> توزيع الأدوار</h3>
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
          <div style="flex:0 0 auto">${ovDonut(roleRows.map(r=>({label:r.label,value:r.value,color:r.color})),totalUsers,150)}</div>
          <div style="flex:1;min-width:150px">${roleLegend||'<div style="color:var(--muted)">لا بيانات</div>'}</div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-top:0"><i data-lucide="credit-card"></i> منصّات الاشتراك النشط</h3>
        ${platBars}
      </div>
    </div>

    <!-- أحدث المسجّلين + مؤشرات ثانوية -->
    <div class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0"><i data-lucide="user-plus"></i> أحدث المسجّلين</h3>
          <button class="btn btn-ghost btn-sm" onclick="hrShowTab('users')">عرض الكل <i data-lucide="arrow-left"></i></button>
        </div>
        ${signupsList}
      </div>
      <div class="card">
        <h3 style="margin-top:0"><i data-lucide="activity"></i> مؤشّرات ثانويّة</h3>
        <div style="display:flex;flex-direction:column;gap:10px">${sec}</div>
      </div>
    </div>`);
}

/* modal سريع لمنح اشتراكٍ يدويّاً — يُستدعى من زرّ نظرة عامة أو من صفوف المستخدمين.
   openModal(title,body,onSave,onDelete): زرّ الحفظ ثابت النصّ «حفظ»، ونعيد تسميته بعد. */
function hrGrantOpen(email){
  const preset=email?esc(email):'';
  openModal('منح اشتراك مجانيّ',
    `<div style="color:var(--muted);font-size:13px;margin-bottom:14px;padding:10px;background:var(--panel2);border-radius:8px">
       <b style="color:var(--ink)">شرط أساسيّ:</b> يجب أن يكون المستخدم قد سجّل دخوله في التطبيق مرّةً واحدةً على الأقلّ حتى نجدَ بريده.
     </div>
     <div class="field"><label>البريد الإلكترونيّ للمستخدم</label><input id="grEmail" type="email" dir="ltr" value="${preset}" placeholder="user@example.com"></div>
     <div class="field"><label>المدّة بالأشهر (اترك فارغاً لاشتراكٍ دائم)</label><input id="grMonths" type="number" min="1" max="120" placeholder="١٢"></div>
     <div class="field"><label>ملاحظة (اختياريّ)</label><input id="grNote" type="text" maxlength="200" placeholder="سببُ المنح…"></div>
     <div id="grMsg" style="font-size:13px;color:var(--muted);margin-top:6px;min-height:18px"></div>`,
    async ()=>{
      const em=(document.getElementById('grEmail').value||'').trim();
      const m=(document.getElementById('grMonths').value||'').trim();
      const note=(document.getElementById('grNote').value||'').trim();
      const msg=document.getElementById('grMsg');
      if(!/.+@.+\..+/.test(em)){msg.style.color='var(--bad)';msg.textContent='بريد غير صالح';return}
      msg.style.color='var(--muted)';msg.textContent='جارٍ المنح…';
      try{const body=Object.assign({email:em},m?{months:+m}:{},note?{note}:{});
        const r=await hrApi('admin/grants',{method:'POST',body});
        msg.style.color='var(--good)';msg.textContent='✓ فُعّل حساب '+(r.name||r.email)+(r.currentPeriodEnd?(' حتى '+new Date(r.currentPeriodEnd).toLocaleDateString('ar-SA')):' (دائم)');
        setTimeout(()=>{closeModal();if(hrActive('overview'))ovLoad();if(hrActive('users'))usLoad();if(hrActive('subscribers'))subsLoad();},1100);
      }catch(e){msg.style.color='var(--bad)';msg.textContent=e.message;}
    });
  /* أعِد تسمية زرّ الحفظ ليصير «منح» بدلَ «حفظ» — أوضح للإدارة */
  const btn=document.getElementById('mSave');if(btn){btn.innerHTML='<i data-lucide="gift"></i> منح';refreshIcons();}
}

/* ═══════════ المستخدمون (كل المسجّلين — مع حالة الاشتراك) ═══════════ */
let US=null,US_ERR=null,US_Q='',US_ROLE='',US_SUB='all',US_PAGE=1;
const US_LIMIT=50;
function hrViewUsers(){US=null;US_ERR=null;US_PAGE=1;hrSet(hrLoading());usLoad();}
function usSetRole(r){US_ROLE=r;US_PAGE=1;US=null;hrSet(hrLoading());usLoad();}
function usSetSub(s){US_SUB=s;US_PAGE=1;US=null;hrSet(hrLoading());usLoad();}
function usSetPage(p){US_PAGE=Math.max(1,p);US=null;hrSet(hrLoading());usLoad();}
let usSearchTimer=null;
function usSearch(v){US_Q=(v||'').trim();clearTimeout(usSearchTimer);usSearchTimer=setTimeout(()=>{US_PAGE=1;US=null;usLoad();},280);}
async function usLoad(){try{
  const p=new URLSearchParams({page:String(US_PAGE),limit:String(US_LIMIT)});
  if(US_ROLE)p.set('role',US_ROLE);
  if(US_Q)p.set('search',US_Q);
  if(US_SUB&&US_SUB!=='all')p.set('subscription',US_SUB);
  const r=await hrApi('admin/users?'+p.toString());
  US=r;US_ERR=null;
}catch(e){US_ERR=e.message||'خطأ';}if(hrActive('users'))usRender();}

function usRoleLabel(k){return {student:'طالب',teacher:'معلّم',parent:'وليّ أمر',admin:'مسؤول'}[k]||k}
function usSubBadge(u){
  if(!u.subscription)return `<span class="pill" style="background:rgba(148,163,184,.16);color:#94a3b8">مجانيّ</span>`;
  const s=u.subscription;const isManual=s.isManual;
  const color=isManual?'#8b5cf6':'#22c55e';const label=isManual?'منحة':'مدفوع';
  const platform={manual:'يدويّ',telr:'Telr',apple:'آبل',google:'جوجل',organization:'مؤسّسة',stripe:'Stripe'}[s.platform]||s.platform;
  const end=s.currentPeriodEnd?(' · حتى '+new Date(s.currentPeriodEnd).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric'})):' · دائم';
  return `<span class="pill" style="background:${color}22;color:${color}">${label} · ${esc(platform)}${end}</span>`;
}

function usRender(){
  if(US_ERR){hrSet(hrErr(US_ERR,'usLoad()'));return}
  const d=US||{};const rows=d.users||[];const total=Number(d.total||0);
  const pages=Math.max(1,Math.ceil(total/US_LIMIT));
  const roleTabs=[['','الكل'],['student','الطلاب'],['teacher','المعلّمون'],['parent','أولياء الأمور'],['admin','المسؤولون']]
    .map(([k,l])=>`<button class="btn btn-sm ${US_ROLE===k?'btn-gold':'btn-ghost'}" onclick="usSetRole('${k}')">${l}</button>`).join('');
  const subTabs=[['all','كل حالات الاشتراك'],['subscribed','المشتركون فقط'],['free','بلا اشتراك']]
    .map(([k,l])=>`<button class="btn btn-sm ${US_SUB===k?'btn-gold':'btn-ghost'}" onclick="usSetSub('${k}')">${l}</button>`).join('');

  const tbody=rows.length?rows.map(u=>`<tr>
    <td>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--goldsoft);color:var(--gold2);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px">${esc((u.displayName||u.email||'؟').charAt(0).toUpperCase())}</div>
        <div style="min-width:0"><b style="color:var(--ink)">${esc(u.displayName||'—')}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(u.email||'')}</div></div>
      </div>
    </td>
    <td>${hrChip(usRoleLabel(u.role),{student:'#0ea5e9',teacher:'#f5a623',parent:'#8b5cf6',admin:'#ef4444'}[u.role]||'#64748b')}${u.gradeNumber?`<div style="font-size:11px;color:var(--muted);margin-top:3px">صف ${HR_ar(u.gradeNumber)}${u.schoolName?' · '+esc(u.schoolName):''}</div>`:''}</td>
    <td>${usSubBadge(u)}</td>
    <td style="font-size:12px;color:var(--muted)">${hrDate(u.createdAt)}</td>
    <td><div style="display:flex;gap:6px;flex-wrap:wrap">
      ${u.subscription&&u.subscription.isManual?
        `<button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="usRevoke('${esc(u.subscription.id)}','${esc(u.displayName||u.email||'')}')"><i data-lucide="x-circle"></i> إلغاء المنحة</button>`:
        (u.subscription?`<span style="font-size:11px;color:var(--muted)">اشتراكٌ مدفوع</span>`:
          `<button class="btn btn-gold btn-sm" onclick="hrGrantOpen('${esc(u.email)}')"><i data-lucide="gift"></i> منح اشتراك</button>`)
      }
      <button class="btn btn-ghost btn-sm" title="نسخ البريد" onclick="usCopyEmail('${esc(u.email)}',this)"><i data-lucide="mail"></i></button>
    </div></td>
  </tr>`).join(''):`<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:26px">لا مستخدمين في هذا التصنيف.</td></tr>`;

  /* شريط ترقيم بسيط */
  const pager=pages>1?`<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-top:14px;flex-wrap:wrap">
    <button class="btn btn-ghost btn-sm" ${US_PAGE<=1?'disabled':''} onclick="usSetPage(${US_PAGE-1})"><i data-lucide="chevron-right"></i> السابق</button>
    <span style="color:var(--muted);font-size:13px;padding:0 10px">صفحة <b style="color:var(--ink)">${HR_ar(US_PAGE)}</b> من ${HR_ar(pages)} — إجمالي ${HR_ar(total)}</span>
    <button class="btn btn-ghost btn-sm" ${US_PAGE>=pages?'disabled':''} onclick="usSetPage(${US_PAGE+1})">التالي <i data-lucide="chevron-left"></i></button>
  </div>`:'';

  hrSet(`${hrHead('المستخدمون','users',
    `<button class="btn btn-gold btn-sm" onclick="hrGrantOpen()"><i data-lucide="gift"></i> منح اشتراك بالبريد</button>
     <button class="btn btn-ghost btn-sm" onclick="usLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <div class="card" style="margin-bottom:12px;padding:12px">
      <input class="field" placeholder="بحث بالاسم أو البريد…" value="${esc(US_Q)}" oninput="usSearch(this.value)" style="margin-bottom:10px">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${roleTabs}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${subTabs}</div>
    </div>
    <div class="card" style="padding:0">
      <div style="overflow:auto"><table class="hr-table"><thead><tr><th>المستخدم</th><th>الدور</th><th>الاشتراك</th><th>تاريخ التسجيل</th><th>إجراءات</th></tr></thead><tbody>${tbody}</tbody></table></div>
    </div>${pager}`);
}

async function usRevoke(id,name){
  if(!confirm('إلغاء منحة الاشتراك لِ«'+name+'»؟'))return;
  try{await hrApi('admin/grants/'+id,{method:'DELETE'});usLoad();}catch(e){alert('تعذّر الإلغاء: '+e.message)}
}
function usCopyEmail(em,btn){if(!em)return;try{navigator.clipboard.writeText(em);const old=btn.innerHTML;btn.innerHTML='<i data-lucide="check"></i>';refreshIcons();setTimeout(()=>{btn.innerHTML=old;refreshIcons();},900);}catch(e){alert(em)}}

/* ═══════════ المشتركون ═══════════ */
let SUBS=null,SUBS_ERR=null,SUBS_F='all',SUBS_TYPE='all';
function hrViewSubscribers(){SUBS=null;SUBS_ERR=null;hrSet(hrLoading());subsLoad();}
function subsFilter(f){SUBS_F=f;SUBS=null;hrSet(hrLoading());subsLoad();}
function subsTypeFilter(t){SUBS_TYPE=t;subsRender();}
async function subsLoad(){try{const r=await hrApi('admin/subscribers?status='+encodeURIComponent(SUBS_F));SUBS=r;SUBS_ERR=null;}catch(e){SUBS_ERR=e.message||'خطأ';}if(hrActive('subscribers'))subsRender();}
function subsStatusChip(st){const m={active:'#22c55e',expired:'#f59e0b',cancelled:'#ef4444'};const l={active:'نشط',expired:'منتهٍ',cancelled:'ملغى'};return hrChip(l[st]||st,m[st]||'#64748b');}
function subsRender(){
  if(SUBS_ERR){hrSet(hrErr(SUBS_ERR,'subsLoad()'));return}
  const st=(SUBS&&SUBS.stats)||{},allRows=(SUBS&&SUBS.entries)||[];
  const paidRows=allRows.filter(s=>s.platform!=='manual');
  const manualRows=allRows.filter(s=>s.platform==='manual');
  const rows=SUBS_TYPE==='paid'?paidRows:SUBS_TYPE==='manual'?manualRows:allRows;
  const tabs=[['all','الكل',st.total],['active','النشطون',st.active],['expired','المنتهون',st.expired],['cancelled','الملغاة',st.cancelled]]
    .map(([k,l,n])=>`<button class="btn btn-sm ${SUBS_F===k?'btn-gold':'btn-ghost'}" onclick="subsFilter('${k}')">${l}${n!=null?` (${HR_ar(n)})`:''}</button>`).join('');
  const typeTabs=[
    ['all','كل الأنواع',allRows.length],
    ['paid','💳 الدافعون فعلياً (مدفوع)',paidRows.length],
    ['manual','🎁 المنح المجانية (يدوي)',manualRows.length]
  ].map(([k,l,n])=>`<button class="btn btn-sm ${SUBS_TYPE===k?'btn-gold':'btn-ghost'}" onclick="subsTypeFilter('${k}')">${l} (${HR_ar(n)})</button>`).join('');
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>المشترك</th><th>النوع والمنصّة</th><th>الحالة</th><th>الخطة</th><th>ينتهي</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(s=>{
      const isManual=s.platform==='manual';
      const platBadge=isManual
        ?`<span class="pill" style="background:rgba(139,92,246,.18);color:#a78bfa">منحة مجانية · يدوي</span>`
        :`<span class="pill" style="background:rgba(34,197,94,.18);color:#22c55e">مدفوع · ${esc(s.platform||'—')}</span>`;
      return `<tr>
      <td><b>${esc(s.displayName||'—')}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(s.email||'')}</div></td>
      <td>${platBadge}</td>
      <td>${subsStatusChip(s.status)}</td>
      <td>${esc(s.planId||'—')}</td>
      <td>${hrDate(s.currentPeriodEnd)}</td>
      <td><div style="display:flex;gap:6px;flex-wrap:wrap">
        <select class="field" style="width:auto;padding:5px 8px" onchange="subsSetStatus('${esc(s.id)}',this.value)">
          <option value="">تغيير…</option><option value="active">تفعيل</option><option value="expired">إنهاء</option><option value="cancelled">إلغاء</option></select>
        <button class="btn btn-ghost btn-sm" onclick="subsOrders('${esc(s.userId)}','${esc(s.displayName||s.email||'')}')"><i data-lucide="receipt"></i> الطلبات</button>
      </div></td></tr>`;
    }).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا مشتركين في هذا التصنيف.</div>`;
  hrSet(`${hrHead('المشتركون','credit-card',
    `<button class="btn btn-gold btn-sm" onclick="hrGrantOpen()"><i data-lucide="gift"></i> منح اشتراك مجاني</button>
     <button class="btn btn-ghost btn-sm" onclick="subsLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${tabs}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${typeTabs}</div>${body}`);
}
async function subsSetStatus(id,status){if(!status)return;if(!confirm('تغيير حالة الاشتراك إلى «'+status+'»؟')){subsRender();return}try{await hrApi('admin/subscribers/'+id+'/status',{method:'PATCH',body:{status}});subsLoad();}catch(e){alert('تعذّر: '+e.message)}}
async function subsOrders(userId,name){
  openModal('طلبات Telr — '+esc(name),'<div id="telrOrders" style="color:var(--muted)">…جارٍ التحميل</div>',null,null);
  document.getElementById('mSave').style.display='none';
  try{const r=await hrApi('admin/telr/orders?userId='+encodeURIComponent(userId));const orders=r.orders||r.entries||[];
    const el=document.getElementById('telrOrders');if(!el)return;
    el.innerHTML=orders.length?orders.map(o=>`<div class="card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><b dir="ltr">${esc(o.cartRef||'')}</b><div style="font-size:11px;color:var(--muted)">${esc(o.planId||'')} · ${hrDate(o.createdAt)} · ${esc(o.status||'')}</div></div><button class="btn btn-gold btn-sm" onclick="telrVerify('${esc(o.cartRef)}',this)"><i data-lucide="badge-check"></i> تحقّق</button></div></div>`).join(''):'<div style="color:var(--muted)">لا طلبات لهذا المستخدم.</div>';
    refreshIcons();
  }catch(e){const el=document.getElementById('telrOrders');if(el)el.innerHTML='<div style="color:var(--bad)">تعذّر: '+esc(e.message)+'</div>';}
}
async function telrVerify(cartRef,btn){btn.disabled=true;btn.textContent='…';try{const r=await hrApi('admin/telr/verify-payment',{method:'POST',body:{cartRef}});btn.textContent=(r&&r.status)?('✓ '+r.status):'✓ تمّ';subsLoad();}catch(e){btn.disabled=false;btn.textContent='إعادة';alert('تعذّر التحقّق: '+e.message)}}

/* ═══════════ المعلمون ═══════════ */
let TCH=null,TCH_ERR=null,TCH_Q='';
function hrViewTeachers(){TCH=null;TCH_ERR=null;hrSet(hrLoading());tchLoad();}
async function tchLoad(){try{const r=await hrApi('admin/teachers');TCH=r.entries||[];TCH_ERR=null;}catch(e){TCH_ERR=e.message||'خطأ';}if(hrActive('teachers'))tchRender();}
function tchSearch(v){TCH_Q=(v||'').trim();tchRender();}
function tchRender(){
  if(TCH_ERR){hrSet(hrErr(TCH_ERR,'tchLoad()'));return}
  const all=TCH||[];const q=TCH_Q.toLowerCase();
  const rows=q?all.filter(t=>((t.displayName||'')+(t.schoolName||'')).toLowerCase().includes(q)):all;
  const verified=all.filter(t=>t.isVerified).length;
  const cards=rows.length?`<div class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${rows.map(t=>`<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>${esc(t.displayName||'—')}</b>${t.isVerified?hrChip('موثّق','#0ea5e9'):''}${t.isActive?'':hrChip('معطّل','#ef4444')}</div>
    <div style="font-size:12px;color:var(--muted);margin:4px 0 10px">${esc(t.schoolName||'—')} · ${HR_ar(t.questionCount)} سؤال · ${hrDate(t.createdAt)}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="tchPatch('${esc(t.id)}','isVerified',${!t.isVerified})"><i data-lucide="badge-check"></i> ${t.isVerified?'إلغاء التوثيق':'توثيق'}</button>
      <button class="btn btn-ghost btn-sm" onclick="tchPatch('${esc(t.id)}','isActive',${!t.isActive})"><i data-lucide="power"></i> ${t.isActive?'تعطيل':'تفعيل'}</button>
      <button class="btn btn-ghost btn-sm" onclick="tchQuestions('${esc(t.id)}','${esc(t.displayName||'')}')"><i data-lucide="list"></i> أسئلته</button>
    </div></div>`).join('')}</div>`:`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا معلمين.</div>`;
  hrSet(`${hrHead('المعلمون','users',`<span style="font-size:12px;color:var(--muted)">${HR_ar(all.length)} معلّم · ${HR_ar(verified)} موثّق</span> <button class="btn btn-ghost btn-sm" onclick="tchLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <input class="field" placeholder="بحث بالاسم أو المدرسة…" value="${esc(TCH_Q)}" oninput="tchSearch(this.value)" style="margin-bottom:14px">${cards}`);
}
async function tchPatch(id,field,val){try{const body={};body[field]=val;await hrApi('admin/teachers/'+id,{method:'PATCH',body});tchLoad();}catch(e){alert('تعذّر: '+e.message)}}
async function tchQuestions(id,name){
  openModal('أسئلة المعلّم — '+esc(name),'<div id="tchQs" style="color:var(--muted)">…جارٍ التحميل</div>',null,null);
  document.getElementById('mSave').style.display='none';
  try{const r=await hrApi('admin/teachers/'+id+'/questions');const qs=r.entries||[];const el=document.getElementById('tchQs');if(!el)return;
    el.innerHTML=qs.length?qs.map(q=>`<div class="card" style="margin-bottom:8px"><b>${esc(q.question)}</b><div style="font-size:12px;color:var(--muted);margin-top:6px">${(q.options||[]).map((o,i)=>`${i===q.correctIndex?'✓ ':''}${esc(o)}`).join(' · ')}</div><div style="font-size:11px;color:var(--muted);margin-top:4px">${esc(q.subject||'')} · صف ${esc(String(q.grade||''))} · ${esc(q.status||'')}</div></div>`).join(''):'<div style="color:var(--muted)">لا أسئلة لهذا المعلّم.</div>';
    refreshIcons();
  }catch(e){const el=document.getElementById('tchQs');if(el)el.innerHTML='<div style="color:var(--bad)">تعذّر: '+esc(e.message)+'</div>';}
}

/* ═══════════ أسئلة المعلمين (مراجعة) ═══════════ */
let TQ=null,TQ_ERR=null,TQ_F='pending_review';
function hrViewTQuestions(){TQ=null;TQ_ERR=null;hrSet(hrLoading());tqLoad();}
function tqFilter(f){TQ_F=f;TQ=null;hrSet(hrLoading());tqLoad();}
async function tqLoad(){try{const r=await hrApi('admin/teacher-questions?status='+encodeURIComponent(TQ_F));TQ=r.entries||[];TQ_ERR=null;}catch(e){TQ_ERR=e.message||'خطأ';}if(hrActive('tquestions'))tqRender();}
function tqRender(){
  if(TQ_ERR){hrSet(hrErr(TQ_ERR,'tqLoad()'));return}
  const rows=TQ||[];
  const tabs=[['pending_review','بانتظار المراجعة'],['approved','مقبول'],['rejected','مرفوض'],['all','الكل']]
    .map(([k,l])=>`<button class="btn btn-sm ${TQ_F===k?'btn-gold':'btn-ghost'}" onclick="tqFilter('${k}')">${l}</button>`).join('');
  const cards=rows.length?rows.map(q=>`<div class="card" style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>${esc(q.question)}</b>${q.status==='approved'?hrChip('مقبول','#22c55e'):q.status==='rejected'?hrChip('مرفوض','#ef4444'):hrChip('معلّق','#f59e0b')}</div>
    <div style="font-size:12px;color:var(--muted);margin:8px 0">${(q.options||[]).map((o,i)=>`${i===q.correctIndex?'<b style=\"color:#22c55e\">✓ </b>':''}${esc(o)}`).join(' · ')}</div>
    ${q.explanation?`<div style="font-size:12px;color:var(--muted)">الشرح: ${esc(q.explanation)}</div>`:''}
    <div style="font-size:11px;color:var(--muted);margin-top:6px">${esc(q.teacherName||'')} · ${esc(q.subject||'')} · صف ${esc(String(q.grade||''))}${q.reviewNote?` · ملاحظة: ${esc(q.reviewNote)}`:''}</div>
    ${q.status==='pending_review'?`<div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-gold btn-sm" onclick="tqReview('${esc(String(q.id))}','approve')"><i data-lucide="check"></i> قبول</button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="tqReview('${esc(String(q.id))}','reject')"><i data-lucide="x"></i> رفض</button></div>`:''}
  </div>`).join(''):`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا أسئلة في هذا التصنيف.</div>`;
  hrSet(`${hrHead('أسئلة المعلمين','inbox','<button class="btn btn-ghost btn-sm" onclick="tqLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${tabs}</div>${cards}`);
}
async function tqReview(id,action){const note=prompt(action==='approve'?'ملاحظة (اختياري):':'سبب الرفض (اختياري):')||'';try{await hrApi('admin/teacher-questions/'+id+'/'+action,{method:'POST',body:{reviewNote:note}});tqLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══════════ التذاكر (الدعم) ═══════════ */
let TK=null,TK_ERR=null,TK_OPEN={};
function hrViewTickets(){TK=null;TK_ERR=null;hrSet(hrLoading());tkLoad();}
async function tkLoad(){try{const r=await hrApi('admin/tickets');TK=r.entries||[];TK_ERR=null;}catch(e){TK_ERR=e.message||'خطأ';}if(hrActive('tickets'))tkRender();}
function tkStatusChip(st){const m={open:'#f59e0b',replied:'#0ea5e9',resolved:'#22c55e',closed:'#64748b'};const l={open:'مفتوحة',replied:'رُدّ عليها',resolved:'محلولة',closed:'مغلقة'};return hrChip(l[st]||st,m[st]||'#64748b');}
function tkToggle(id){TK_OPEN[id]=!TK_OPEN[id];tkRender();if(TK_OPEN[id])tkLoadReplies(id);}
function tkRender(){
  if(TK_ERR){hrSet(hrErr(TK_ERR,'tkLoad()'));return}
  const rows=TK||[];
  const cards=rows.length?rows.map(t=>`<div class="card" style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;cursor:pointer" onclick="tkToggle('${esc(String(t.id))}')">
      <div><b>${esc(t.subject||'(بلا عنوان)')}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(t.email||'')} · ${hrDate(t.createdAt)}</div></div>
      <div style="display:flex;gap:8px;align-items:center">${tkStatusChip(t.status)}<i data-lucide="chevron-down"></i></div>
    </div>
    ${TK_OPEN[t.id]?`<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">
      <div style="font-size:13px;white-space:pre-wrap;margin-bottom:10px">${esc(t.message||'')}</div>
      <div id="tkReplies_${t.id}" style="color:var(--muted);font-size:12px">…جارٍ تحميل الردود</div>
      <textarea class="field" id="tkReply_${t.id}" placeholder="اكتب رداً (يُرسَل بريداً للمستخدم)…" style="margin-top:10px;min-height:70px"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="btn btn-gold btn-sm" onclick="tkReply('${esc(String(t.id))}')"><i data-lucide="send"></i> إرسال الرد</button>
        <button class="btn btn-ghost btn-sm" onclick="tkStatus('${esc(String(t.id))}','${t.status==='closed'?'open':'closed'}')"><i data-lucide="${t.status==='closed'?'unlock':'lock'}"></i> ${t.status==='closed'?'إعادة فتح':'إغلاق'}</button>
        <button class="btn btn-ghost btn-sm" onclick="tkStatus('${esc(String(t.id))}','resolved')"><i data-lucide="check-circle"></i> محلولة</button>
      </div></div>`:''}
  </div>`).join(''):`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا تذاكر.</div>`;
  hrSet(`${hrHead('تذاكر الدعم','life-buoy','<button class="btn btn-ghost btn-sm" onclick="tkLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}${cards}`);
}
async function tkLoadReplies(id){try{const r=await hrApi('admin/tickets/'+id+'/replies');const reps=r.entries||r.replies||[];const el=document.getElementById('tkReplies_'+id);if(!el)return;el.innerHTML=reps.length?reps.map(x=>`<div style="border-right:2px solid #0ea5e9;padding:4px 10px;margin:6px 0"><div style="white-space:pre-wrap">${esc(x.replyText||'')}</div><div style="font-size:10px;color:var(--muted)">${hrDate(x.sentAt)}</div></div>`).join(''):'<div style="color:var(--muted)">لا ردود بعد.</div>';}catch(e){}}
async function tkReply(id){const ta=document.getElementById('tkReply_'+id);const replyText=(ta&&ta.value||'').trim();if(!replyText){alert('اكتب رداً أولاً');return}try{await hrApi('admin/tickets/'+id+'/reply',{method:'POST',body:{replyText}});if(ta)ta.value='';tkLoad();}catch(e){alert('تعذّر الإرسال: '+e.message)}}
async function tkStatus(id,status){try{await hrApi('admin/tickets/'+id+'/status',{method:'PATCH',body:{status}});tkLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══════════ قائمة الانتظار ═══════════ */
let WL=null,WL_ERR=null,WL_UNSENT=false;
function hrViewWaitlist(){WL=null;WL_ERR=null;hrSet(hrLoading());wlLoad();}
async function wlLoad(){try{const r=await hrApi('admin/waitlist');WL=r.entries||[];WL_ERR=null;}catch(e){WL_ERR=e.message||'خطأ';}if(hrActive('waitlist'))wlRender();}
function wlToggleUnsent(){WL_UNSENT=!WL_UNSENT;wlRender();}
function wlRender(){
  if(WL_ERR){hrSet(hrErr(WL_ERR,'wlLoad()'));return}
  let rows=WL||[];if(WL_UNSENT)rows=rows.filter(e=>!e.emailSentAt);
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>البريد</th><th>المصدر</th><th>التسجيل</th><th>البريد المُرسَل</th><th></th></tr></thead><tbody>
    ${rows.map(e=>`<tr><td dir="ltr">${esc(e.email)}</td><td>${esc(e.source||'—')}</td><td>${hrDate(e.createdAt)}</td><td>${e.emailSentAt?hrChip('أُرسل','#22c55e'):hrChip('لم يُرسل','#f59e0b')}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="wlResend('${esc(String(e.id))}',this)"><i data-lucide="mail"></i> إرسال</button></td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا سجلّات.</div>`;
  hrSet(`${hrHead('قائمة الانتظار','clock',`<button class="btn btn-ghost btn-sm" onclick="wlExport()"><i data-lucide="download"></i> CSV</button><button class="btn btn-ghost btn-sm" onclick="wlLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:12px"><input type="checkbox" ${WL_UNSENT?'checked':''} onchange="wlToggleUnsent()" style="width:auto"> «لم يُرسل» فقط</label>${body}`);
}
async function wlResend(id,btn){btn.disabled=true;btn.textContent='…';try{await hrApi('admin/waitlist/'+id+'/resend-email',{method:'POST'});btn.textContent='✓ أُرسل';wlLoad();}catch(e){btn.disabled=false;btn.textContent='إعادة';alert('تعذّر: '+e.message)}}
function wlExport(){const rows=WL||[];const csv=['email,source,createdAt,emailSentAt'].concat(rows.map(e=>[e.email,e.source||'',e.createdAt||'',e.emailSentAt||''].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(','))).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='waitlist.csv';a.click();}

/* ═══════════ المحتوى (الكتب) ═══════════ */
let CB=null,CB_ERR=null,CB_Q='';
function hrViewContent(){CB=null;CB_ERR=null;hrSet(hrLoading());cbLoad();}
async function cbLoad(){try{const r=await hrApi('admin/books');CB=r.books||r.entries||[];CB_ERR=null;}catch(e){CB_ERR=e.message||'خطأ';}if(hrActive('content'))cbRender();}
function cbSearch(v){CB_Q=(v||'').trim();cbRender();}
function cbRender(){
  if(CB_ERR){hrSet(hrErr(CB_ERR,'cbLoad()'));return}
  const all=CB||[];const q=CB_Q.toLowerCase();
  const rows=q?all.filter(b=>((b.subject||'')+(b.grade||'')+(b.semester||'')).toLowerCase().includes(q)):all;
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>المادة</th><th>الصف</th><th>الفصل</th><th>عدد الأسئلة</th></tr></thead><tbody>
    ${rows.map(b=>`<tr><td><b>${esc(b.subject)}</b></td><td>${esc(String(b.grade))}</td><td>${esc(String(b.semester))}</td><td>${HR_ar(b.questionCount)}</td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا كتب.</div>`;
  hrSet(`${hrHead('المحتوى — الكتب','book-open',`<span style="font-size:12px;color:var(--muted)">${HR_ar(all.length)} كتاب</span> <button class="btn btn-ghost btn-sm" onclick="cbLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <input class="field" placeholder="بحث بالمادة/الصف/الفصل…" value="${esc(CB_Q)}" oninput="cbSearch(this.value)" style="margin-bottom:14px">${body}`);
}

/* ═══════════ الإعدادات ═══════════ */
let SET=null,SET_ERR=null;
function hrViewSettings(){SET=null;SET_ERR=null;hrSet(hrLoading());setLoad();}
async function setLoad(){BOOK_LIVE=null;try{const r=await hrApi('admin/settings');SET=r.settings||r||{};SET_ERR=null;}catch(e){SET_ERR=e.message||'خطأ';}if(hrActive('settings')){setRender();if(!SET_ERR)bookLive();}}
function setRender(){
  if(SET_ERR){hrSet(hrErr(SET_ERR,'setLoad()'));return}
  const s=SET||{};
  hrSet(`${hrHead('إعدادات الموقع','settings','')}
    ${bookCardHTML()}
    <div class="card" style="max-width:520px">
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">بيانات التواصل الظاهرة في تذييل الموقع وصفحة الدعم على huroofduroos.com.</div>
      ${hrLbl('البريد الإلكترونيّ')}<input class="field" id="setEmail" dir="ltr" value="${esc(s.contact_email||'')}" style="margin-bottom:12px">
      ${hrLbl('واتساب')}<input class="field" id="setWa" dir="ltr" value="${esc(s.contact_whatsapp||'')}" style="margin-bottom:12px">
      ${hrLbl('الهاتف')}<input class="field" id="setPhone" dir="ltr" value="${esc(s.contact_phone||'')}" style="margin-bottom:14px">
      <div style="display:flex;gap:10px;align-items:center"><button class="btn btn-gold" onclick="setSave()"><i data-lucide="save"></i> حفظ</button><span id="setMsg" style="font-size:13px;font-weight:700"></span></div>
    </div>`);
}
/* ── مفتاح «صفحة الكتاب» في دروس 3D ─────────────────────────────────────────
   site_settings.lab3d_book_pages = "1" | "0" (مسموحٌ في SETTINGS_KEYS بخادم حروف).
   مقفلٌ افتراضيّاً حتى الشراكة الرسميّة مع وزارة التعليم (حقوق النشر).
   القراءة/الكتابة: GET/PUT admin/settings عبر hrApi (ترويسة x-system-token = جلسة المكتب).
   الحالة الحيّة: GET /api/app-config العامّة → lab3dBookPages (التطبيقات تخزّنها ≤ ٥ دقائق). */
let BOOK_LIVE=null;   // null لم يُفحص بعد · true/false · 'err'
function bookOn(){return String((SET||{}).lab3d_book_pages||'')==='1'}
function bookCardHTML(){
  const on=bookOn();
  const live=BOOK_LIVE===null?'<span style="color:var(--muted)">…جارٍ الفحص</span>'
    :BOOK_LIVE==='err'?'<span style="color:var(--bad)">تعذّر الفحص</span>'
    :BOOK_LIVE?hrChip('ظاهر للمستخدمين','#22c55e'):hrChip('مخفيّ عن المستخدمين','#a1a1aa');
  const lag=BOOK_LIVE!==null&&BOOK_LIVE!=='err'&&BOOK_LIVE!==on;
  return `<div class="card" id="bookCard" style="max-width:520px;margin-bottom:16px;border-color:${on?'rgba(34,197,94,.45)':'var(--line)'}">
    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start">
      <div style="min-width:0">
        <div style="font-weight:800;font-size:15px;display:flex;gap:8px;align-items:center"><i data-lucide="book-open" style="width:18px;height:18px;color:var(--gold)"></i> صفحات كتب وزارة التعليم داخل دروس 3D</div>
        <div style="font-size:13px;color:var(--muted);margin-top:6px;line-height:1.85">مقفلة حتى إتمام الشراكة الرسمية مع وزارة التعليم (حقوق النشر). عند التفعيل يظهر زرّ «صفحة الكتاب» في كلّ درس ثلاثيّ الأبعاد.</div>
      </div>
      <button type="button" role="switch" aria-checked="${on}" aria-label="تشغيل صفحات كتب الوزارة" onclick="bookToggle()" id="bookSw"
        style="flex:none;position:relative;width:54px;height:30px;border-radius:99px;border:1px solid ${on?'#22c55e':'rgba(255,255,255,.2)'};background:${on?'#22c55e':'rgba(255,255,255,.1)'};transition:background .2s;padding:0;margin-top:2px">
        <span style="position:absolute;top:3px;${on?'left:3px':'right:3px'};width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span></button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--line);font-size:13px">
      <span>الإعداد المحفوظ: <b style="color:${on?'#22c55e':'var(--ink)'}">${on?'مفعّل':'مطفأ'}</b></span>
      <span>الحالة الحيّة: ${live}</span>
      <button class="link-btn" onclick="bookLive()" title="إعادة فحص /api/app-config"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:-2px"></i> فحص</button>
    </div>
    ${lag?`<div style="font-size:12px;color:var(--warn);margin-top:8px">الخادم لم يعكس الإعداد بعد — أعد الفحص بعد لحظات.</div>`:''}
    <div style="font-size:12px;color:var(--muted);margin-top:8px">التطبيقات المفتوحة تلتقط التغيير خلال ٥ دقائق كحدٍّ أقصى.</div>
    <div id="bookMsg" style="font-size:13px;font-weight:700;margin-top:6px"></div>
  </div>`;
}
function bookPaint(){const el=document.getElementById('bookCard');if(!el)return;el.outerHTML=bookCardHTML();refreshIcons();}
async function bookLive(){
  if(BOOK_LIVE!==null){BOOK_LIVE=null;bookPaint();}
  try{const r=await fetch(HR_API+'/app-config',{cache:'no-store'});if(!r.ok)throw 0;const c=await r.json();BOOK_LIVE=c&&c.lab3dBookPages===true;}catch(e){BOOK_LIVE='err';}
  if(hrActive('settings'))bookPaint();
}
function bookToggle(){
  if(bookOn()){bookWrite('0');return}
  openModal('تفعيل صفحات كتب وزارة التعليم؟',`
    <div class="badge-note" style="margin-bottom:12px"><i data-lucide="alert-triangle"></i><div>
      <b>فعّل فقط بعد إتمام الشراكة الرسمية مع وزارة التعليم.</b><br>
      سيظهر زرّ «صفحة الكتاب» لكلّ المستخدمين في كلّ درس ثلاثيّ الأبعاد، ويعرض صفحات من كتب الوزارة (محتوى محميّ بحقوق النشر).</div></div>
    <div style="font-size:13px;color:var(--muted)">يمكنك الإطفاء في أيّ وقت من هنا، ويختفي الزرّ من التطبيقات خلال ٥ دقائق.</div>`,
  ()=>{closeModal();bookWrite('1');});
  const b=document.getElementById('mSave');if(b)b.textContent='نعم، فعّل الآن';
}
async function bookWrite(v){
  const msg=document.getElementById('bookMsg');const sw=document.getElementById('bookSw');
  if(sw)sw.disabled=true;if(msg){msg.style.color='var(--muted)';msg.textContent='جارٍ الحفظ…';}
  try{
    await hrApi('admin/settings',{method:'PUT',body:{lab3d_book_pages:v}});
    SET=Object.assign({},SET||{},{lab3d_book_pages:v});bookPaint();
    const m=document.getElementById('bookMsg');if(m){m.style.color='#22c55e';m.textContent=v==='1'?'فُعِّلت ✓':'أُطفئت ✓';}
    bookLive();
  }catch(e){bookPaint();const m=document.getElementById('bookMsg');if(m){m.style.color='#ef4444';m.textContent='تعذّر الحفظ: '+e.message;}}
}
async function setSave(){const body={contact_email:(document.getElementById('setEmail').value||'').trim(),contact_whatsapp:(document.getElementById('setWa').value||'').trim(),contact_phone:(document.getElementById('setPhone').value||'').trim()};const msg=document.getElementById('setMsg');msg.style.color='var(--muted)';msg.textContent='جارٍ…';try{await hrApi('admin/settings',{method:'PUT',body});msg.style.color='#22c55e';msg.textContent='حُفظ ✓';}catch(e){msg.style.color='#ef4444';msg.textContent=e.message;}}
/* ═══════════════════════════════════════════════════════════════════════════
   إدارة منصّة حروف — المرحلة ٢ (التأليف): الأسئلة، مكتبة PDF، المستخرج،
   نافس، الأغلفة، المدوّنة. تُضاف إلى HR_VIEWS في آخر الملفّ.
   ═══════════════════════════════════════════════════════════════════════════ */
const HR_GRADES={1:'الأول الابتدائي',2:'الثاني الابتدائي',3:'الثالث الابتدائي',4:'الرابع الابتدائي',5:'الخامس الابتدائي',6:'السادس الابتدائي',7:'الأول المتوسط',8:'الثاني المتوسط',9:'الثالث المتوسط',10:'الأول الثانوي',11:'الثاني الثانوي',12:'الثالث الثانوي'};
const HR_SUBJECTS={arabic:'اللغة العربية',math:'الرياضيات',science:'العلوم',social:'الدراسات الاجتماعية',english:'اللغة الإنجليزية',islamic:'الدراسات الإسلامية',quran:'القرآن الكريم وتفسيره',art:'التربية الفنية',digital:'المهارات الرقمية',lifeskills:'المهارات الحياتية والأسرية',pe:'التربية البدنية',history:'التاريخ',hadith:'الحديث',finance:'المعرفة المالية',critical:'التفكير الناقد',ai:'الذكاء الاصطناعي',geo:'الجغرافيا',stats:'الإحصاء والاحتمالات',chemistry:'الكيمياء',biology:'الأحياء',physics:'الفيزياء'};
const HR_DIFF={easy:'سهل',medium:'متوسط',hard:'صعب'};
function hrSubjName(s){return HR_SUBJECTS[s]||s||'—';}
function hrGradeOpts(sel){return '<option value="">كل الصفوف</option>'+Object.keys(HR_GRADES).map(g=>`<option value="${g}" ${String(sel)===g?'selected':''}>${HR_GRADES[g]}</option>`).join('');}
function hrGradeOptsReq(sel){return Object.keys(HR_GRADES).map(g=>`<option value="${g}" ${String(sel)===g?'selected':''}>${HR_GRADES[g]}</option>`).join('');}
function hrSubjOpts(sel,withAll){return (withAll?'<option value="">كل المواد</option>':'')+Object.keys(HR_SUBJECTS).map(s=>`<option value="${s}" ${sel===s?'selected':''}>${HR_SUBJECTS[s]}</option>`).join('');}
/* fetch متعدّد الأجزاء (FormData) بتوكن النظام — للمستخرج */
async function hrApiForm(path,formData){const {data}=await sb.auth.getSession();const tok=data&&data.session?data.session.access_token:'';const res=await fetch(HR_API+'/'+path,{method:'POST',headers:{'x-system-token':tok},body:formData});const b=await res.json().catch(()=>({}));if(!res.ok)throw new Error(b.error||('تعذّر ('+res.status+')'));return b;}

/* ═══════════ الأسئلة (بنك الأسئلة) ═══════════ */
let Q=null,Q_ERR=null;const QF={page:1,search:'',grade:'',subject:'',book:'',difficulty:'',stars:''};
function hrViewQuestions(){Q=null;Q_ERR=null;hrSet(hrLoading());qLoad();}
async function qLoad(){try{const p=new URLSearchParams();p.set('page',String(QF.page));p.set('limit','20');if(QF.search)p.set('search',QF.search);if(QF.grade)p.set('grade',QF.grade);if(QF.subject)p.set('subject',QF.subject);if(QF.book)p.set('book',QF.book);if(QF.difficulty)p.set('difficulty',QF.difficulty);if(QF.stars)p.set('stars',QF.stars);const r=await hrApi('admin/questions?'+p.toString());Q=r;Q_ERR=null;}catch(e){Q_ERR=e.message||'خطأ';}if(hrActive('questions'))qRender();}
function qSetFilter(k,v){QF[k]=v;QF.page=1;qLoad();}
function qGoPage(p){QF.page=p;qLoad();}
function qDiffChip(d){const c={easy:'#22c55e',medium:'#f59e0b',hard:'#ef4444'};return hrChip(HR_DIFF[d]||d,c[d]||'#64748b');}
function qStars(n){n=Number(n||0);return n?('★'.repeat(n)+'☆'.repeat(Math.max(0,5-n))):'—';}
function qRender(){
  if(Q_ERR){hrSet(hrErr(Q_ERR,'qLoad()'));return}
  const d=Q||{},qs=d.questions||[];const pages=Math.max(1,Math.ceil((d.total||0)/(d.limit||20)));
  const filters=`<div class="card" style="margin-bottom:14px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input class="field" style="flex:2;min-width:180px;margin:0" placeholder="بحث في نصّ السؤال…" value="${esc(QF.search)}" onchange="qSetFilter('search',this.value)">
    <select class="field" style="width:auto;margin:0" onchange="qSetFilter('grade',this.value)">${hrGradeOpts(QF.grade)}</select>
    <select class="field" style="width:auto;margin:0" onchange="qSetFilter('subject',this.value)">${hrSubjOpts(QF.subject,true)}</select>
    <select class="field" style="width:auto;margin:0" onchange="qSetFilter('difficulty',this.value)"><option value="">كل الصعوبات</option><option value="easy" ${QF.difficulty==='easy'?'selected':''}>سهل</option><option value="medium" ${QF.difficulty==='medium'?'selected':''}>متوسط</option><option value="hard" ${QF.difficulty==='hard'?'selected':''}>صعب</option></select>
    <select class="field" style="width:auto;margin:0" onchange="qSetFilter('stars',this.value)"><option value="">كل الجودة</option>${[5,4,3,2,1].map(s=>`<option value="${s}" ${QF.stars===String(s)?'selected':''}>${s} نجوم</option>`).join('')}</select>
    <input class="field" style="width:140px;margin:0" placeholder="معرّف كتاب" value="${esc(QF.book)}" onchange="qSetFilter('book',this.value)">
  </div></div>`;
  const tiles=`<div class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin-bottom:14px">${hrTile(HR_ar(d.total),'إجمالي','#f5a623')}${hrTile(HR_ar(d.activeCount),'مفعّل','#22c55e')}${hrTile(HR_ar(d.inactiveCount),'معطّل','#ef4444')}</div>`;
  const rows=qs.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>السؤال</th><th>المادة/الصف</th><th>الصعوبة</th><th>الجودة</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
    ${qs.map(q=>`<tr>
      <td style="max-width:340px"><div style="font-weight:600">${esc(q.question)}</div><div style="font-size:11px;color:var(--muted)">${(q.options||[]).map((o,i)=>`${i===q.correctIndex?'✓':''}${esc(o)}`).join(' · ')}</div></td>
      <td style="font-size:12px">${esc(q.subjectLabel||q.subjectId||'')}<div style="color:var(--muted)">${esc(q.gradeLabel||('صف '+q.gradeNumber))}</div></td>
      <td>${qDiffChip(q.difficulty)}</td>
      <td title="${q.qualityScore!=null?('score '+q.qualityScore):''}" style="color:#f5a623;white-space:nowrap">${qStars(q.qualityStars)}</td>
      <td>${q.isActive?hrChip('مفعّل','#22c55e'):hrChip('معطّل','#64748b')}</td>
      <td><div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="qEdit('${esc(q.id)}')"><i data-lucide="pencil"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="qToggle('${esc(q.id)}',${!q.isActive})"><i data-lucide="power"></i></button>
        <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="qDelete('${esc(q.id)}')"><i data-lucide="trash-2"></i></button>
      </div></td></tr>`).join('')}</tbody></table></div>`:`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا أسئلة مطابقة.</div>`;
  const pager=pages>1?`<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:14px">
    <button class="btn btn-ghost btn-sm" ${d.page<=1?'disabled':''} onclick="qGoPage(${(d.page||1)-1})"><i data-lucide="chevron-right"></i></button>
    <span style="font-size:13px;color:var(--muted)">${HR_ar(d.page)} / ${HR_ar(pages)}</span>
    <button class="btn btn-ghost btn-sm" ${d.page>=pages?'disabled':''} onclick="qGoPage(${(d.page||1)+1})"><i data-lucide="chevron-left"></i></button></div>`:'';
  hrSet(`${hrHead('بنك الأسئلة','help-circle','<button class="btn btn-ghost btn-sm" onclick="qLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}${filters}${tiles}${rows}${pager}`);
}
function qFindLocal(id){return (Q&&Q.questions||[]).find(x=>x.id===id);}
function qEdit(id){const q=qFindLocal(id);if(!q)return;
  const body=`
    ${hrLbl('نصّ السؤال')}<textarea class="field" id="qeQ" style="min-height:70px">${esc(q.question)}</textarea>
    ${hrLbl('الخيارات (سطر لكلّ خيار)')}<textarea class="field" id="qeOpts" style="min-height:90px">${esc((q.options||[]).join('\n'))}</textarea>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('رقم الإجابة الصحيحة (يبدأ من 0)')}<input class="field" id="qeCorrect" type="number" value="${q.correctIndex}"></div>
      <div style="flex:1;min-width:120px">${hrLbl('الصعوبة')}<select class="field" id="qeDiff"><option value="easy" ${q.difficulty==='easy'?'selected':''}>سهل</option><option value="medium" ${q.difficulty==='medium'?'selected':''}>متوسط</option><option value="hard" ${q.difficulty==='hard'?'selected':''}>صعب</option></select></div>
      <div style="flex:1;min-width:100px">${hrLbl('النقاط')}<input class="field" id="qePoints" type="number" value="${q.points||10}"></div>
    </div>
    ${hrLbl('الشرح')}<textarea class="field" id="qeExp" style="min-height:60px">${esc(q.explanation||'')}</textarea>`;
  openModal('تعديل سؤال',body,async()=>{
    const upd={question:document.getElementById('qeQ').value.trim(),options:document.getElementById('qeOpts').value.split('\n').map(s=>s.trim()).filter(Boolean),correctIndex:parseInt(document.getElementById('qeCorrect').value)||0,difficulty:document.getElementById('qeDiff').value,points:parseInt(document.getElementById('qePoints').value)||10,explanation:document.getElementById('qeExp').value.trim()};
    try{await hrApi('admin/questions/'+id,{method:'PATCH',body:upd});closeModal();qLoad();}catch(e){alert('تعذّر: '+e.message)}
  },null);
}
async function qToggle(id,isActive){try{await hrApi('admin/questions/'+id+'/toggle',{method:'PATCH',body:{isActive}});qLoad();}catch(e){alert('تعذّر: '+e.message)}}
async function qDelete(id){if(!confirm('حذف هذا السؤال نهائيّاً؟'))return;try{await hrApi('admin/questions/'+id,{method:'DELETE'});qLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══════════ مكتبة PDF ═══════════ */
let PL=null,PL_ERR=null,PL_F='all';
function hrViewPdflib(){PL=null;PL_ERR=null;hrSet(hrLoading());plLoad();}
function plFilter(f){PL_F=f;plRender();}
async function plLoad(){try{const r=await hrApi('admin/pdf-library');PL=r.entries||[];PL_ERR=null;}catch(e){PL_ERR=e.message||'خطأ';}if(hrActive('pdflib'))plRender();}
function plRender(){
  if(PL_ERR){hrSet(hrErr(PL_ERR,'plLoad()'));return}
  const all=PL||[];const rows=PL_F==='all'?all:all.filter(e=>e.type===PL_F);
  const tabs=[['all','الكل'],['nafs','تهيئة نافس'],['worksheet','أوراق عمل'],['test','اختبارات'],['summary','ملخّصات'],['other','أخرى']]
    .map(([k,l])=>`<button class="btn btn-sm ${PL_F===k?'btn-gold':'btn-ghost'}" onclick="plFilter('${k}')">${l} (${HR_ar((k==='all'?all:all.filter(e=>e.type===k)).length)})</button>`).join('');
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>الملف</th><th>المادة/الصف</th><th>النوع</th><th>تحميلات</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(e=>`<tr><td><b>${esc(e.fileName)}</b></td><td style="font-size:12px">${esc(e.subject||'')} · ${esc(String(e.grade||''))}</td><td>${esc(e.type)}</td><td>${HR_ar(e.downloadCount)}</td>
      <td><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="plDownload('${esc(String(e.id))}')"><i data-lucide="download"></i></button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="plDelete('${esc(String(e.id))}')"><i data-lucide="trash-2"></i></button></div></td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا ملفّات.</div>`;
  hrSet(`${hrHead('مكتبة PDF','folder','<button class="btn btn-gold btn-sm" onclick="plUploadModal()"><i data-lucide="upload"></i> رفع ملف</button><button class="btn btn-ghost btn-sm" onclick="plLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${tabs}</div>${body}`);
}
function plUploadModal(){
  const body=`
    ${hrLbl('الملف (PDF)')}<input type="file" accept="application/pdf" id="plFile" class="field">
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('الصف')}<select class="field" id="plGrade">${hrGradeOptsReq('1')}</select></div>
      <div style="flex:1;min-width:120px">${hrLbl('المادة')}<select class="field" id="plSubject">${hrSubjOpts('arabic',false)}</select></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('معرّف الكتاب')}<input class="field" id="plBook" placeholder="arabic-g1-s1"></div>
      <div style="flex:1;min-width:120px">${hrLbl('النوع')}<select class="field" id="plType"><option value="worksheet">أوراق عمل</option><option value="test">اختبار</option><option value="summary">ملخّص</option><option value="nafs">تهيئة نافس</option><option value="other">أخرى</option></select></div>
    </div>
    <div id="plMsg" style="font-size:12px;color:var(--muted);min-height:16px"></div>`;
  openModal('رفع ملف PDF',body,plDoUpload,null);
}
async function plDoUpload(){
  const f=document.getElementById('plFile').files[0];const msg=document.getElementById('plMsg');
  if(!f){alert('اختر ملفاً');return}
  const grade=document.getElementById('plGrade').value,subject=document.getElementById('plSubject').value,bookId=document.getElementById('plBook').value.trim(),type=document.getElementById('plType').value;
  msg.textContent='جارٍ الرفع…';
  try{
    const u=await hrApi('admin/pdf-library/upload-url',{method:'POST',body:{fileName:f.name,contentType:f.type||'application/pdf'}});
    const put=await fetch(u.uploadURL,{method:'PUT',headers:{'Content-Type':f.type||'application/pdf'},body:f});
    if(!put.ok)throw new Error('تعذّر رفع الملف للتخزين');
    await hrApi('admin/pdf-library',{method:'POST',body:{fileName:f.name,objectPath:u.objectPath,grade,subject,bookId,type}});
    closeModal();plLoad();
  }catch(e){msg.textContent='';alert('تعذّر: '+e.message)}
}
async function plDownload(id){try{const r=await hrApi('admin/pdf-library/'+id+'/download');if(r.url)window.open(r.url,'_blank');}catch(e){alert('تعذّر: '+e.message)}}
async function plDelete(id){if(!confirm('حذف هذا الملف؟'))return;try{await hrApi('admin/pdf-library/'+id,{method:'DELETE'});plLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══════════ مستخرج الأسئلة (AI) ═══════════ */
let EX_Q=null;const EXF={gradeNumber:'1',subjectId:'arabic',bookId:'',chapterId:'',lessonId:'',difficulty:'easy'};
function hrViewExtractor(){EX_Q=null;exRender();}
function exRender(){
  const form=`<div class="card" style="margin-bottom:14px">
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:130px">${hrLbl('الصف')}<select class="field" id="exGrade">${hrGradeOptsReq(EXF.gradeNumber)}</select></div>
      <div style="flex:1;min-width:130px">${hrLbl('المادة')}<select class="field" id="exSubject">${hrSubjOpts(EXF.subjectId,false)}</select></div>
      <div style="flex:1;min-width:130px">${hrLbl('الصعوبة الافتراضية')}<select class="field" id="exDiff"><option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option></select></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:130px">${hrLbl('معرّف الكتاب *')}<input class="field" id="exBook" placeholder="arabic-g1-s1" value="${esc(EXF.bookId)}"></div>
      <div style="flex:1;min-width:130px">${hrLbl('معرّف الفصل *')}<input class="field" id="exChapter" placeholder="ch1" value="${esc(EXF.chapterId)}"></div>
      <div style="flex:1;min-width:130px">${hrLbl('معرّف الدرس (اختياري)')}<input class="field" id="exLesson" value="${esc(EXF.lessonId)}"></div>
    </div>
    ${hrLbl('ملف PDF (حدّ 20MB)')}<input type="file" accept="application/pdf" id="exFile" class="field">
    <div style="display:flex;gap:10px;align-items:center"><button class="btn btn-gold" onclick="exExtract()"><i data-lucide="sparkles"></i> استخراج بالذكاء الاصطناعي</button><span id="exMsg" style="font-size:13px;color:var(--muted)"></span></div>
  </div>`;
  let review='';
  if(EX_Q&&EX_Q.length){
    review=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0">مراجعة ${HR_ar(EX_Q.length)} سؤالاً مستخرجاً</h3><button class="btn btn-gold" onclick="exSave()"><i data-lucide="save"></i> حفظ الكل في قاعدة البيانات</button></div>
      ${EX_Q.map((q,i)=>`<div class="card" style="margin-bottom:10px">
        ${hrLbl('السؤال '+(i+1))}<textarea class="field" oninput="EX_Q[${i}].question=this.value" style="min-height:56px">${esc(q.question)}</textarea>
        ${hrLbl('الخيارات (سطر لكلّ خيار)')}<textarea class="field" oninput="EX_Q[${i}].options=this.value.split('\\n').map(s=>s.trim()).filter(Boolean)" style="min-height:80px">${esc((q.options||[]).join('\n'))}</textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:110px">${hrLbl('الإجابة الصحيحة (0-based)')}<input class="field" type="number" value="${q.correctIndex||0}" oninput="EX_Q[${i}].correctIndex=parseInt(this.value)||0"></div>
          <div style="flex:1;min-width:110px">${hrLbl('الصعوبة')}<select class="field" oninput="EX_Q[${i}].difficulty=this.value" onchange="EX_Q[${i}].difficulty=this.value"><option value="easy" ${q.difficulty==='easy'?'selected':''}>سهل</option><option value="medium" ${q.difficulty==='medium'?'selected':''}>متوسط</option><option value="hard" ${q.difficulty==='hard'?'selected':''}>صعب</option></select></div>
          <div style="flex:2;min-width:130px">${hrLbl('الشرح')}<input class="field" value="${esc(q.explanation||'')}" oninput="EX_Q[${i}].explanation=this.value"></div>
        </div>
        <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="EX_Q.splice(${i},1);exRender()"><i data-lucide="trash-2"></i> حذف</button>
      </div>`).join('')}</div>`;
  }
  hrSet(`${hrHead('مستخرج الأسئلة (AI)','file-search','')}${form}${review}`);
}
async function exExtract(){
  const f=document.getElementById('exFile').files[0];const msg=document.getElementById('exMsg');
  EXF.gradeNumber=document.getElementById('exGrade').value;EXF.subjectId=document.getElementById('exSubject').value;EXF.difficulty=document.getElementById('exDiff').value;EXF.bookId=document.getElementById('exBook').value.trim();EXF.chapterId=document.getElementById('exChapter').value.trim();EXF.lessonId=document.getElementById('exLesson').value.trim();
  if(!f){alert('اختر ملف PDF');return}
  if(!EXF.bookId||!EXF.chapterId){alert('معرّف الكتاب والفصل مطلوبان');return}
  msg.textContent='جارٍ الاستخراج (قد يأخذ دقيقة)…';
  try{const fd=new FormData();fd.append('pdf',f);fd.append('gradeNumber',EXF.gradeNumber);fd.append('subjectId',EXF.subjectId);fd.append('bookId',EXF.bookId);fd.append('chapterId',EXF.chapterId);
    const r=await hrApiForm('admin/pdf-extractor/extract',fd);
    EX_Q=(r.questions||[]).map(q=>Object.assign({difficulty:EXF.difficulty,points:q.points||10},q));
    exRender();
  }catch(e){msg.textContent='';alert('تعذّر الاستخراج: '+e.message)}
}
async function exSave(){
  if(!EX_Q||!EX_Q.length)return;
  try{const body={gradeNumber:parseInt(EXF.gradeNumber),subjectId:EXF.subjectId,bookId:EXF.bookId,chapterId:EXF.chapterId,questions:EX_Q};if(EXF.lessonId)body.lessonId=EXF.lessonId;
    const r=await hrApi('admin/pdf-extractor/save',{method:'POST',body});
    alert('✓ حُفظ '+HR_ar((r&&r.saved)||EX_Q.length)+' سؤالاً');EX_Q=null;exRender();
  }catch(e){alert('تعذّر الحفظ: '+e.message)}
}

/* ═══════════ نافس ═══════════ */
let NF=null,NF_ERR=null,NF_SEL=null;const NFF={skillIds:[],questionCount:15,teacherName:'',schoolName:'',showAnswers:false};
function hrViewNafs(){NF=null;NF_ERR=null;NF_SEL=null;hrSet(hrLoading());nfLoad();}
async function nfLoad(){try{const r=await hrApi('worksheets/nafs/catalog');NF=r.catalog||[];NF_ERR=null;}catch(e){NF_ERR=e.message||'خطأ';}if(hrActive('nafs'))nfRender();}
function nfSelect(key){NF_SEL=key;NFF.skillIds=[];nfRender();}
function nfToggleSkill(id){const i=NFF.skillIds.indexOf(id);if(i<0)NFF.skillIds.push(id);else NFF.skillIds.splice(i,1);}
function nfRender(){
  if(NF_ERR){hrSet(hrErr(NF_ERR,'nfLoad()'));return}
  const cat=NF||[];const sel=cat.find(c=>c.key===NF_SEL);
  const list=`<div class="card" style="max-height:520px;overflow:auto"><h3 style="margin:0 0 10px"><i data-lucide="list"></i> الكتالوج</h3>
    ${cat.map(c=>`<div onclick="nfSelect('${esc(c.key)}')" style="padding:9px 10px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${NF_SEL===c.key?'var(--goldsoft)':'transparent'};border:1px solid ${NF_SEL===c.key?'var(--gold2)':'var(--line)'}">
      <b>${esc(c.subject)}</b> — ${esc(c.grade)}<div style="font-size:11px;color:var(--muted)">${HR_ar(c.skillCount)} مهارة · ${HR_ar(c.questionCount)} سؤال</div></div>`).join('')||'<div style="color:var(--muted)">لا كتالوج.</div>'}</div>`;
  const gen=sel?`<div class="card">
    <h3 style="margin:0 0 10px">توليد ورقة — ${esc(sel.subject)} (${esc(sel.grade)})</h3>
    ${hrLbl('المهارات (فارغ = الكل)')}<div style="max-height:180px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:8px;margin-bottom:12px">
      ${(sel.skills||[]).map(s=>`<label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:3px 0;cursor:pointer"><input type="checkbox" style="width:auto" onchange="nfToggleSkill('${esc(s.skillId)}')"> ${esc(s.skillName)} <span style="color:var(--muted);font-size:11px">(${HR_ar(s.questionCount)})</span></label>`).join('')}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('عدد الأسئلة')}<select class="field" id="nfCount"><option value="10">10</option><option value="15" selected>15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option></select></div>
      <div style="flex:1;min-width:120px">${hrLbl('النوع')}<select class="field" id="nfType"><option value="false">ورقة الطالب</option><option value="true">مفتاح التصحيح</option></select></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('اسم المعلّم')}<input class="field" id="nfTeacher"></div>
      <div style="flex:1;min-width:120px">${hrLbl('اسم المدرسة')}<input class="field" id="nfSchool"></div>
    </div>
    <div style="display:flex;gap:10px;align-items:center"><button class="btn btn-gold" onclick="nfGenerate()"><i data-lucide="file-output"></i> توليد وفتح</button><span id="nfMsg" style="font-size:13px;color:var(--muted)"></span></div>
  </div>`:`<div class="card" style="text-align:center;color:var(--muted);padding:40px"><i data-lucide="clipboard-list" style="width:32px;height:32px"></i><div style="margin-top:10px">اختر مادةً من الكتالوج لتوليد ورقة نافس.</div></div>`;
  hrSet(`${hrHead('أوراق نافس','clipboard-list','<button class="btn btn-ghost btn-sm" onclick="nfLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>')}
    <div style="display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:16px;align-items:start">${list}${gen}</div>`);
}
async function nfGenerate(){
  const msg=document.getElementById('nfMsg');
  const body={key:NF_SEL,questionCount:parseInt(document.getElementById('nfCount').value)||15,showAnswers:document.getElementById('nfType').value==='true',teacherName:document.getElementById('nfTeacher').value.trim(),schoolName:document.getElementById('nfSchool').value.trim()};
  if(NFF.skillIds.length)body.skillIds=NFF.skillIds;
  msg.textContent='جارٍ التوليد…';
  try{const r=await hrApi('worksheets/nafs/generate',{method:'POST',body});if(r.shareUrl){msg.textContent='✓ فُتحت الورقة';window.open(r.shareUrl.startsWith('http')?r.shareUrl:(HUROOF_API_BASE+r.shareUrl),'_blank');}else{msg.textContent='تمّ لكن بلا رابط';}}catch(e){msg.textContent='';alert('تعذّر: '+e.message)}
}

/* ═══════════ الأغلفة ═══════════ */
let CV_HAVE=null,CV_ERR=null,CV_SUBJ=[],CV_GBOOKS={},CV_BUST=0;let cvPending=null;
function hrViewCovers(){CV_HAVE=null;CV_ERR=null;hrSet(hrLoading());cvLoad();}
async function cvLoad(){try{const [bk,cv]=await Promise.all([hrApi('admin/books'),hrApi('admin/covers')]);
    CV_HAVE=new Set((cv.entries||[]).map(f=>String(f).replace(/\.png$/,'')));
    const books=bk.books||bk.entries||bk||[];const subjSet=new Set();const grades={};
    (Array.isArray(books)?books:[]).forEach(b=>{const id=b.bookId||b.id||'';const m=id.match(/^([a-z][a-z-]*)-g(\d+)-s(\d)$/);if(!m)return;const[,subj,g]=m;subjSet.add(subj);(grades[g]=grades[g]||[]).push({id,subj,title:b.title||b.name||''})});
    CV_SUBJ=[...subjSet].sort();CV_GBOOKS=grades;CV_BUST=new Date().getTime();CV_ERR=null;
  }catch(e){CV_ERR=e.message||'خطأ';}if(hrActive('covers'))cvRender();}
function cvHas(name){return CV_HAVE&&CV_HAVE.has(name);}
function cvSlot(name,label){const url='https://huroofduroos.com/covers/'+name+'.png?t='+CV_BUST;const has=cvHas(name);
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">
    <div style="width:52px;height:52px;border-radius:10px;overflow:hidden;background:#0006;border:1px solid ${has?'#22c55e':'#ffffff14'};flex-shrink:0;display:grid;place-items:center">
      ${has?`<img src="${url}" style="width:100%;height:100%;object-fit:cover">`:`<i data-lucide="image-off" style="color:var(--muted);width:18px;height:18px"></i>`}</div>
    <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">${esc(label)}</div><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(name)}</div></div>
    <div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="cvPick('${esc(name)}')"><i data-lucide="upload"></i></button>${has?`<button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="cvDel('${esc(name)}')"><i data-lucide="trash-2"></i></button>`:''}</div>
  </div>`;
}
function cvRender(){
  if(CV_ERR){hrSet(hrErr(CV_ERR,'cvLoad()'));return}
  const home=[['home-game','بطاقة: لعبة حروف ودروس'],['home-worksheets','بطاقة: أوراق العمل'],['home-tools','بطاقة: أدوات المعلم']];
  const grades=Array.from({length:12},(_,i)=>['grade-'+(i+1),'صورة الصف '+HR_GRADES[i+1]]);
  const subj=CV_SUBJ.map(s=>['subject-'+s,'صورة مادة '+hrSubjName(s)]);
  const total=home.length+grades.length+subj.length+Object.values(CV_GBOOKS).reduce((a,l)=>a+l.length,0);
  const haveN=CV_HAVE?CV_HAVE.size:0;
  const sect=(title,slots)=>`<div class="card" style="margin-bottom:14px"><h3 style="margin:0 0 6px">${title}</h3>${slots.map(([n,l])=>cvSlot(n,l)).join('')}</div>`;
  const bookSect=Object.keys(CV_GBOOKS).sort((a,b)=>a-b).map(g=>`<details class="card" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800">أغلفة كتب ${HR_GRADES[g]||('الصف '+g)} (${HR_ar(CV_GBOOKS[g].length)})</summary><div style="margin-top:8px">${CV_GBOOKS[g].map(b=>cvSlot('book-'+b.id,'غلاف '+hrSubjName(b.subj)+' — '+b.id)).join('')}</div></details>`).join('');
  hrSet(`${hrHead('الأغلفة والصور','image',`<span style="font-size:12px;color:var(--muted)">${HR_ar(haveN)}/${HR_ar(total)} مرفوعة</span> <button class="btn btn-ghost btn-sm" onclick="cvLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <input type="file" accept="image/png,image/jpeg,image/webp" id="cvFile" style="display:none" onchange="cvOnFile(event)">
    <div class="badge-note" style="margin-bottom:14px"><i data-lucide="info"></i><div>الصور تظهر على منصّة huroofduroos.com. حذف الصورة يعيد التصميم الافتراضي (أيقونة ولون). صدّر بمقاسٍ مناسب (PNG).</div></div>
    ${sect('بطاقات الرئيسية',home)}${sect('صور الصفوف',grades)}${subj.length?sect('صور المواد',subj):''}
    ${bookSect?`<h3 style="margin:18px 0 10px">أغلفة الكتب</h3>${bookSect}`:''}`);
}
function cvPick(name){cvPending=name;const f=document.getElementById('cvFile');if(f)f.click();}
function cvOnFile(ev){const f=ev.target.files[0];ev.target.value='';if(!f||!cvPending)return;const name=cvPending;
  const rd=new FileReader();rd.onload=async()=>{const b64=String(rd.result).split(',')[1]||'';try{await hrApi('admin/covers/'+encodeURIComponent(name),{method:'POST',body:{dataBase64:b64}});cvLoad();}catch(e){alert('تعذّر الرفع: '+e.message)}};rd.readAsDataURL(f);}
async function cvDel(name){if(!confirm('حذف هذه الصورة؟ يعود التصميم الافتراضي.'))return;try{await hrApi('admin/covers/'+encodeURIComponent(name),{method:'DELETE'});cvLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══════════ المدوّنة ═══════════ */
let BG=null,BG_ERR=null;
function hrViewBlog(){BG=null;BG_ERR=null;hrSet(hrLoading());bgLoad();}
async function bgLoad(){try{const r=await hrApi('admin/articles');BG=r.articles||r.entries||r||[];if(!Array.isArray(BG))BG=[];BG_ERR=null;}catch(e){BG_ERR=e.message||'خطأ';}if(hrActive('blog'))bgRender();}
function bgRender(){
  if(BG_ERR){hrSet(hrErr(BG_ERR,'bgLoad()'));return}
  const rows=BG||[];const pub=rows.filter(a=>a.published).length;
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>العنوان</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(a=>`<tr><td><b>${esc(a.title)}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(a.slug)}</div></td><td>${esc(a.date||'—')}</td><td>${a.published?hrChip('منشور','#22c55e'):hrChip('مسودّة','#f59e0b')}</td>
      <td><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="bgEdit('${esc(a.slug)}')"><i data-lucide="pencil"></i></button><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="bgDelete('${esc(a.slug)}')"><i data-lucide="trash-2"></i></button></div></td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا مقالات.</div>`;
  hrSet(`${hrHead('المدوّنة','newspaper',`<span style="font-size:12px;color:var(--muted)">${HR_ar(rows.length)} مقال · ${HR_ar(pub)} منشور</span> <button class="btn btn-gold btn-sm" onclick="bgEdit(null)"><i data-lucide="plus"></i> مقال جديد</button> <button class="btn btn-ghost btn-sm" onclick="bgLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}${body}`);
}
function bgEdit(slug){const a=slug?((BG||[]).find(x=>x.slug===slug)||{}):{};
  const body=`
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:2;min-width:180px">${hrLbl('العنوان')}<input class="field" id="bgTitle" value="${esc(a.title||'')}"></div>
      <div style="flex:1;min-width:140px">${hrLbl('المعرّف (slug)')}<input class="field" id="bgSlug" dir="ltr" value="${esc(a.slug||'')}" ${slug?'readonly':''}></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:120px">${hrLbl('التاريخ')}<input class="field" id="bgDate" dir="ltr" placeholder="2026-08-18" value="${esc(a.date||'')}"></div>
      <div style="flex:1;min-width:120px">${hrLbl('دقائق القراءة')}<input class="field" id="bgRead" type="number" value="${a.readTime||5}"></div>
      <div style="flex:2;min-width:160px">${hrLbl('رابط الصورة')}<input class="field" id="bgImg" dir="ltr" value="${esc(a.image||'')}"></div>
    </div>
    ${hrLbl('الوصف')}<textarea class="field" id="bgDesc" style="min-height:50px">${esc(a.description||'')}</textarea>
    ${hrLbl('المحتوى (HTML)')}<textarea class="field" id="bgContent" style="min-height:160px;font-family:monospace;direction:ltr;text-align:left">${esc(a.content||'')}</textarea>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" id="bgPub" ${a.published?'checked':''} style="width:auto"> منشور</label>`;
  openModal(slug?'تعديل مقال':'مقال جديد',body,async()=>{
    const art={slug:document.getElementById('bgSlug').value.trim(),title:document.getElementById('bgTitle').value.trim(),description:document.getElementById('bgDesc').value.trim(),date:document.getElementById('bgDate').value.trim(),readTime:parseInt(document.getElementById('bgRead').value)||5,image:document.getElementById('bgImg').value.trim(),content:document.getElementById('bgContent').value,published:document.getElementById('bgPub').checked};
    if(!art.slug||!art.title){alert('العنوان والمعرّف مطلوبان');return}
    try{await hrApi('admin/articles',{method:'POST',body:art});closeModal();bgLoad();}catch(e){alert('تعذّر الحفظ: '+e.message)}
  },slug?async()=>{if(!confirm('حذف المقال؟'))return;try{await hrApi('admin/articles/'+encodeURIComponent(slug),{method:'DELETE'});closeModal();bgLoad();}catch(e){alert('تعذّر: '+e.message)}}:null);
}
async function bgDelete(slug){if(!confirm('حذف هذا المقال؟'))return;try{await hrApi('admin/articles/'+encodeURIComponent(slug),{method:'DELETE'});bgLoad();}catch(e){alert('تعذّر: '+e.message)}}

/* ═══ ربط أقسام المرحلة ٢ بالتبويبات ═══ */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: Object.assign(HR_VIEWS,{questions:hrViewQuestions,pdflib:hrViewPdflib, */

function hrManageHTML(){
  return `
      <div id="hrKpis" class="lp-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:20px"></div>
      <div class="card" style="margin-bottom:16px">
        <h3><i data-lucide="user-check"></i> تفعيل حساب بالبريد</h3>
        <div style="opacity:.7;font-size:13px;margin:6px 0 12px">يمنح المنصّة لبريدٍ سجّل دخوله مسبقاً. لمن لم يسجّل بعد، استعمل الأكواد أدناه.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
          <div style="flex:2;min-width:200px">${hrLbl('البريد')}<input id="hrEmail" class="field" dir="ltr" placeholder="teacher@example.com"></div>
          <div style="width:130px">${hrLbl('أشهر (فارغ=دائم)')}<input id="hrMonths" class="field" type="number" dir="ltr" placeholder="∞"></div>
          <button class="btn btn-gold" onclick="hrGrant()"><i data-lucide="check"></i> تفعيل</button>
        </div>
        <div id="hrGrantMsg" style="margin-top:10px;font-weight:700;font-size:13px"></div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <h3 style="margin:0"><i data-lucide="ticket"></i> أكواد التفعيل — مرّة واحدة</h3>
          <span id="hrCodesCount" style="opacity:.7;font-size:12px"></span>
        </div>
        <div style="opacity:.7;font-size:13px;margin:6px 0 12px">كودٌ يفعّله المستخدم مرّةً واحدة على المنصّة (يفتحه في huroofduroos.com/activate). مناسبٌ لمن لم يسجّل بعد.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
          <div style="width:90px">${hrLbl('العدد')}<input id="hrCount" class="field" type="number" dir="ltr" value="10"></div>
          <div style="width:110px">${hrLbl('أشهر')}<input id="hrCMonths" class="field" type="number" dir="ltr" value="12"></div>
          <div style="flex:1;min-width:150px">${hrLbl('ملاحظة (اختياري)')}<input id="hrNote" class="field" placeholder="مثال: معرض التعليم"></div>
          <button class="btn btn-gold" onclick="hrGen()"><i data-lucide="plus"></i> توليد</button>
        </div>
        <div id="hrFresh" style="margin-top:12px"></div>
        <div id="hrList" style="margin-top:12px;max-height:220px;overflow:auto"></div>
      </div>`;
}
async function hrLoadStats(){const el=document.getElementById('hrKpis');if(!el)return;el.innerHTML='<div class="card" style="opacity:.6">جارٍ تحميل المؤشرات…</div>';try{const s=await hrApi('admin/stats/extended');const reg=(s.recentRegistrations||[]).reduce((a,r)=>a+Number(r.count||0),0);const tile=(v,l,c)=>`<div class="card" style="padding:16px"><div style="font-size:24px;font-weight:900;color:${c}">${v}</div><div style="font-size:12px;font-weight:700;margin-top:4px">${l}</div></div>`;el.innerHTML=tile(HR_ar(s.activeSubscribers),'مشترك نشط','#22c55e')+tile(HR_ar(s.totalTeachers),'معلّم مسجّل','#f5a623')+tile(HR_ar(reg),'تسجيل (٣٠ يوم)','#0ea5e9')+tile(HR_ar(s.pendingTeacherQuestions),'سؤال معلّق','#ec4899')+`<a href="https://analytics.google.com/" target="_blank" rel="noopener" style="text-decoration:none">${tile('<i data-lucide="bar-chart-3" style="width:26px;height:26px"></i>','زيارات — GA','#64748b')}</a>`;refreshIcons();}catch(e){el.innerHTML=`<div class="card" style="color:#ef4444;font-weight:700">${esc(e.message)}</div>`;}}
async function hrGrant(){const email=(document.getElementById('hrEmail').value||'').trim();const m=(document.getElementById('hrMonths').value||'').trim();const msg=document.getElementById('hrGrantMsg');if(!/.+@.+\..+/.test(email)){msg.style.color='#ef4444';msg.textContent='بريد غير صالح';return}msg.style.color='var(--muted)';msg.textContent='جارٍ…';try{const r=await hrApi('admin/grants',{method:'POST',body:Object.assign({email},m?{months:+m}:{})});msg.style.color='#22c55e';msg.textContent='✓ فُعّل حساب '+(r.name||r.email)+(r.currentPeriodEnd?(' حتى '+new Date(r.currentPeriodEnd).toLocaleDateString('ar-SA')):' (دائم)');document.getElementById('hrEmail').value='';document.getElementById('hrMonths').value='';hrLoadStats();}catch(e){msg.style.color='#ef4444';msg.textContent=e.message;}}
async function hrGen(){const count=Math.max(1,Math.min(100,parseInt(document.getElementById('hrCount').value)||0));const m=(document.getElementById('hrCMonths').value||'').trim();const note=(document.getElementById('hrNote').value||'').trim();const fresh=document.getElementById('hrFresh');if(!count)return;fresh.innerHTML='جارٍ التوليد…';try{const r=await hrApi('admin/activation-codes',{method:'POST',body:Object.assign({count},m?{months:+m}:{},note?{note}:{})});hrFreshCodes=r.codes||[];fresh.innerHTML=`<div class="card" style="border-color:#22c55e55;background:#22c55e11"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="color:#22c55e">✓ تولّد ${HR_ar(hrFreshCodes.length)} كوداً — انسخها الآن</b><button class="btn btn-sm btn-gold" onclick="hrCopy(this)">نسخ الكل</button></div><div style="font-family:monospace;direction:ltr;text-align:left;font-size:13px;line-height:1.9;max-height:150px;overflow:auto">${hrFreshCodes.map(esc).join('<br>')}</div></div>`;hrLoadCodes();}catch(e){fresh.innerHTML=`<div style="color:#ef4444;font-weight:700">${esc(e.message)}</div>`;}}
function hrCopy(btn){navigator.clipboard.writeText(hrFreshCodes.join('\n'));btn.textContent='نُسخ ✓';}
async function hrLoadCodes(){const list=document.getElementById('hrList');const cnt=document.getElementById('hrCodesCount');if(!list)return;try{const r=await hrApi('admin/activation-codes');const codes=r.codes||[];const unused=codes.filter(c=>c.status==='unused').length;if(cnt)cnt.textContent=HR_ar(unused)+' متاح · '+HR_ar(codes.length)+' إجمالاً';list.innerHTML=codes.slice(0,100).map(c=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);gap:10px"><span style="font-family:monospace;direction:ltr;${c.status==='redeemed'?'text-decoration:line-through;opacity:.5':''}">${esc(c.code)}</span><span style="display:flex;gap:8px;align-items:center;font-size:11px"><span style="opacity:.6">${c.months?HR_ar(c.months)+' شهر':'دائم'}${c.note?' · '+esc(c.note):''}</span><span style="font-weight:900;color:${c.status==='unused'?'#22c55e':'#94a3b8'}">${c.status==='unused'?'متاح':'مستخدَم'}</span></span></div>`).join('')||'<div style="opacity:.6">لا أكواد بعد.</div>';}catch(e){list.innerHTML=`<div style="color:#ef4444">${esc(e.message)}</div>`;}}


/* ═══════════ الاستخدام — /api/admin/usage ═══════════
   ما يفتحه المعلّمون من ألعاب وأدوات ودروس 3D (usage_events): مؤشّرات كبيرة
   بمقارنة بالمدّة السابقة، جُملٌ تشرح الأرقام، منصّة الأوائل وقوائم مرتّبة
   بأيقونات المنصّة ثلاثيّة الأبعاد (img/hr3d/<target>.png)، الرسم اليوميّ،
   خريطة يوم×ساعة بتوقيت الرياض، المنصّات، والعودة.
   أُزيل جدول حملة الكود من العرض بطلب إبراهيم (٢٠ أكتوبر ٢٠٢٦) — الحقل
   `campaign` باقٍ في الـAPI للتوافق. تعريفات فقط؛ التسجيل في HR_VIEWS داخل 99-boot.js. */
let HRU_DAYS=30,HRU_DATA=null,HRU_OPEN={};
const HRU_NAMES={
  huroof:'لعبة الحروف','quick-game':'اللعبة العامة',millionaire:'من سيربح المليون','numbered-heads':'الرؤوس المرقّمة',
  'hot-seat':'الكرسي الساخن',brainstorming:'العصف الذهني','role-play':'لعب الأدوار',challenge:'التحدّي الذاتي',
  'two-groups':'تحدّي المجموعتين','live-session':'الجلسة التفاعليّة',event:'وضع الفعاليّة','code-lab':'مختبر البرمجة',
  wheel:'العجلة الدوّارة',picker:'اختيار الطالب',teams:'توزيع الفرق',dice:'النرد والأرقام',timer:'المؤقّت العملاق',
  scoreboard:'لوحة النقاط','question-bank':'أسئلتي',worksheet:'أوراق العمل','back-to-school':'استقبال الطلاب',
  certificates:'شهادات شكر','worksheet-history':'سجلّ الأوراق',letterhead:'كليشة الأوراق','periodic-table':'الجدول الدوري',
  'typing-practice':'تدريب الكتابة',generate:'مولّد الأسئلة',remediation:'الخطّة العلاجيّة',
  lab3d:'مختبر حروف 3D',classes:'فصولي وطلابي','qr-code':'باركود الروابط'
};
/* الأيقونات المنسوخة من المنصّة (tools3d + games3d/menus) — غيرها يأخذ النجمة */
const HRU_ICONS=new Set(['back-to-school','certificates','challenge','classes','code-lab','dice','event','hot-seat','huroof','lab3d','letterhead','live-session','millionaire','picker','qr-code','question-bank','scoreboard','teams','timer','two-groups','typing-practice','wheel','worksheet-history','worksheet']);
const HRU_ICON_ALIAS={'quick-game':'huroof',generate:'question-bank',remediation:'challenge','numbered-heads':'teams','periodic-table':'lab3d'};
/* ما يُتوقَّع أن يُفتح — لجملة «لم يُفتح في هذه المدّة» (classes لا يُقاس بمساره فلا يُذكر) */
const HRU_EXPECTED=['huroof','millionaire','hot-seat','picker','wheel','teams','timer','scoreboard','dice','question-bank','worksheet','certificates','back-to-school','qr-code','lab3d'];
const HRU_KIND={game:{name:'الألعاب',one:'لعبة',color:'#f5a623',icon:'gamepad-2'},tool:{name:'أدوات المعلّم',one:'أداة',color:'#38bdf8',icon:'wrench'},lesson:{name:'دروس 3D',one:'درس',color:'#a78bfa',icon:'box'}};
const HRU_PLAT={web:{name:'الويب',color:'#38bdf8',icon:'globe'},ios:{name:'آيفون وآيباد',color:'#94a3b8',icon:'smartphone'},android:{name:'أندرويد',color:'#22c55e',icon:'smartphone'},unknown:{name:'غير معروف',color:'#52525b',icon:'help-circle'}};
const HRU_DOW=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const HRU_LOC='ar-SA-u-ca-gregory';
const HRU_CSS=`
.hru{--hu-card:linear-gradient(160deg,rgba(255,255,255,.075),rgba(255,255,255,.02));--hu-bd:rgba(255,255,255,.10);--hu-soft:rgba(255,255,255,.055);--hu-up:#22c55e;--hu-dn:#f87171}
:root[data-theme="light"] .hru{--hu-card:linear-gradient(160deg,#fff,#fafafa);--hu-bd:#e4e4e7;--hu-soft:rgba(0,0,0,.05)}
.hru *{box-sizing:border-box}
.hru .hu-card{background:var(--hu-card);border:1px solid var(--hu-bd);border-radius:22px;padding:22px;backdrop-filter:blur(16px) saturate(150%);-webkit-backdrop-filter:blur(16px) saturate(150%);box-shadow:0 12px 34px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.08);min-width:0}
.hru .hu-h{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 16px}
.hru .hu-h h4{margin:0;font-size:18px;font-weight:900;display:flex;align-items:center;gap:9px}
.hru .hu-h h4 img{width:34px;height:34px;object-fit:contain}
.hru .hu-h h4 svg{width:20px;height:20px}
.hru .hu-sub{font-size:12.5px;color:var(--muted);font-weight:600}
.hru .hu-top{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.hru .hu-top h3{margin:0;font-size:26px;font-weight:900;display:flex;align-items:center;gap:10px}
.hru .hu-top h3 img{width:46px;height:46px}
.hru .hu-top p{margin:4px 0 0;color:var(--muted);font-size:13.5px}
.hru .hu-seg{display:inline-flex;background:var(--hu-soft);border:1px solid var(--hu-bd);border-radius:14px;padding:4px;gap:2px}
.hru .hu-seg button{border:0;background:transparent;color:var(--muted);font:inherit;font-weight:800;font-size:13.5px;padding:8px 16px;border-radius:10px;cursor:pointer}
.hru .hu-seg button.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1205;box-shadow:0 4px 14px rgba(232,199,102,.25)}
.hru .hu-kpis{display:grid;grid-template-columns:1.35fr 1fr 1fr;grid-template-rows:auto auto;gap:16px;margin-bottom:16px}
.hru .hu-hero{grid-row:span 2;position:relative;overflow:hidden;display:flex;flex-direction:column;background:radial-gradient(120% 90% at 100% 0%,rgba(245,166,35,.24),transparent 60%),var(--hu-card)}
.hru .hu-hero .hu-lbl{font-size:15px}
.hru .hu-hero .hu-big{font-size:76px;line-height:1;margin:12px 0 10px;letter-spacing:-1px}
.hru .hu-spark{margin-top:auto;height:86px;position:relative}
.hru .hu-spark svg{position:absolute;inset:0;width:100%;height:100%}
.hru .hu-lbl{font-size:13.5px;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:7px}
.hru .hu-lbl svg{width:16px;height:16px}
.hru .hu-big{font-size:44px;font-weight:900;line-height:1.05;margin:8px 0 6px;font-variant-numeric:tabular-nums}
.hru .hu-big small{font-size:.5em;font-weight:800;color:var(--muted);margin-inline-start:4px}
.hru .hu-note{font-size:12.5px;color:var(--muted);font-weight:600;line-height:1.6}
.hru .hu-note b{color:var(--ink)}
.hru .hu-d{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:900;padding:3px 9px;border-radius:999px;white-space:nowrap;vertical-align:middle}
.hru .hu-up{background:rgba(34,197,94,.15);color:var(--hu-up)}
.hru .hu-dn{background:rgba(248,113,113,.15);color:var(--hu-dn)}
.hru .hu-eq{background:var(--hu-soft);color:var(--muted)}
.hru .hu-new{background:rgba(167,139,250,.16);color:#c4b5fd}
.hru .hu-row2{display:grid;grid-template-columns:1.25fr 1fr;gap:16px;margin-bottom:16px}
.hru .hu-ins{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.hru .hu-in{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--hu-soft);border:1px solid var(--hu-bd);font-size:14px;line-height:1.65;font-weight:600}
.hru .hu-in b{font-weight:900;color:var(--ink)}
.hru .hu-in .hu-ii{flex:0 0 44px;height:44px;border-radius:13px;display:grid;place-items:center}
.hru .hu-in .hu-ii img{width:44px;height:44px;object-fit:contain}
.hru .hu-in .hu-ii svg{width:21px;height:21px}
.hru .hu-podc{display:flex;flex-direction:column}
.hru .hu-pod{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:12px;min-height:300px;padding-top:6px}
.hru .hu-next{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
.hru .hu-next div{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:10px 6px;border-radius:14px;background:var(--hu-soft);border:1px solid var(--hu-bd);min-width:0}
.hru .hu-next img{width:42px;height:42px;object-fit:contain}
.hru .hu-next img.th{border-radius:10px;object-fit:cover}
.hru .hu-next .nm{font-size:12px;font-weight:800;line-height:1.35;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hru .hu-next .v{font-size:11px;color:var(--muted);font-weight:700}
.hru .hu-pi{flex:1;max-width:190px;display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0}
.hru .hu-pi .hu-pimg{position:relative;width:112px;height:112px;margin-bottom:8px}
.hru .hu-pi.p1 .hu-pimg{width:150px;height:150px}
.hru .hu-pi .hu-pimg img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 14px 18px rgba(0,0,0,.45));animation:huFloat 4s ease-in-out infinite}
.hru .hu-pi.p2 .hu-pimg img{animation-delay:-1.3s}.hru .hu-pi.p3 .hu-pimg img{animation-delay:-2.6s}
.hru .hu-pi .hu-pimg img.th{border-radius:16px;object-fit:cover;aspect-ratio:1}
.hru .hu-pi .hu-pimg:after{content:"";position:absolute;inset:auto 14% -4px;height:14px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%)}
.hru .hu-pn{font-weight:900;font-size:15px;line-height:1.35;min-height:2.7em;display:flex;align-items:center;justify-content:center}
.hru .hu-pv{font-size:13px;color:var(--muted);font-weight:700;margin:2px 0 8px}
.hru .hu-pv b{font-size:20px;color:var(--ink)}
.hru .hu-base{width:100%;border-radius:16px 16px 6px 6px;display:flex;align-items:flex-start;justify-content:center;padding-top:12px;border:1px solid var(--hu-bd);border-bottom:0}
.hru .hu-hex{width:40px;height:44px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);display:grid;place-items:center;font-weight:900;font-size:18px;color:#1a1205}
.hru .hu-lists{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:16px}
.hru .hu-r{display:grid;grid-template-columns:22px 52px minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--hu-bd)}
.hru .hu-r:last-child{border-bottom:0}
.hru .hu-r .hu-n{font-weight:900;color:var(--muted);font-size:13px;text-align:center}
.hru .hu-r .hu-ic{width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35))}
.hru .hu-r .hu-ic.th{width:52px;height:52px;border-radius:12px;object-fit:cover}
.hru .hu-r .hu-nm{font-weight:900;font-size:14.5px;line-height:1.4;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.hru .hu-r .hu-nm span.t{min-width:0;overflow:hidden;text-overflow:ellipsis}
.hru .hu-bar{height:8px;border-radius:6px;background:var(--hu-soft);margin:7px 0 5px;overflow:hidden}
.hru .hu-bar i{display:block;height:100%;border-radius:6px}
.hru .hu-meta{font-size:11.5px;color:var(--muted);font-weight:600;line-height:1.5}
.hru .hu-val{text-align:left;white-space:nowrap}
.hru .hu-val b{display:block;font-size:20px;font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums}
.hru .hu-val span{display:block;font-size:11.5px;color:var(--muted);font-weight:700}
.hru .hu-val .hu-d{display:inline-flex;margin:3px 0 2px;font-size:11px;padding:2px 7px}
.hru .hu-more{margin-top:10px;width:100%;border:1px dashed var(--hu-bd);background:transparent;color:var(--muted);font:inherit;font-weight:800;font-size:13px;padding:9px;border-radius:12px;cursor:pointer}
.hru .hu-more:hover{color:var(--ink);border-color:var(--gold)}
.hru .hu-empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:18px 8px;color:var(--muted);font-weight:600;font-size:13.5px;line-height:1.7}
.hru .hu-empty img{width:96px;height:96px;object-fit:contain;opacity:.95}
.hru .hu-empty b{color:var(--ink);font-size:15px}
.hru .hu-leg{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;font-weight:700;color:var(--muted)}
.hru .hu-leg i{display:inline-block;width:11px;height:11px;border-radius:4px;margin-inline-end:6px;vertical-align:-1px}
.hru .hu-leg b{color:var(--ink)}
.hru .hu-chart{position:relative;height:260px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:1fr 26px;gap:0 8px}
.hru .hu-yax{display:flex;flex-direction:column;justify-content:space-between;font-size:11px;color:var(--muted);font-weight:700;text-align:left;padding-bottom:0}
.hru .hu-plot{position:relative;border-bottom:1px solid var(--hu-bd);background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),var(--hu-bd) calc(25% - 1px),var(--hu-bd) 25%)}
.hru .hu-cols{position:absolute;inset:0;display:flex;align-items:stretch;gap:3px}
.hru .hu-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;border-radius:6px 6px 0 0;min-width:0;position:relative}
.hru .hu-col.we{background:repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 6px,rgba(255,255,255,.015) 6px 12px)}
:root[data-theme="light"] .hru .hu-col.we{background:rgba(0,0,0,.03)}
.hru .hu-col i{display:block;width:100%}
.hru .hu-col i:first-child{border-radius:5px 5px 0 0}
.hru .hu-col:hover{background:rgba(232,199,102,.10)}
.hru .hu-line{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.hru .hu-xax{grid-column:2;position:relative;font-size:11px;color:var(--muted);font-weight:700}
.hru .hu-xax span{position:absolute;top:6px;transform:translateX(50%);white-space:nowrap}
.hru .hu-row3{display:grid;grid-template-columns:1.55fr 1fr;gap:16px;margin-bottom:16px}
.hru .hu-hm{display:grid;gap:4px;align-items:center}
.hru .hu-hm .c{aspect-ratio:1/1;border-radius:5px;background:var(--hu-soft);min-width:0}
.hru .hu-hm .dl{font-size:12px;font-weight:800;color:var(--muted);white-space:nowrap;padding-inline-end:4px}
.hru .hu-hm .hl{font-size:10.5px;font-weight:700;color:var(--muted);text-align:center;white-space:nowrap}
.hru .hu-hm .tot{font-size:12px;font-weight:900;text-align:left;padding-inline-start:6px;white-space:nowrap}
.hru .hu-hm .hb{height:84px;display:flex;align-items:flex-end;min-width:0;margin-top:8px;border-bottom:1px solid var(--hu-bd)}
.hru .hu-hm .hb i{display:block;width:100%;border-radius:5px 5px 1px 1px}
.hru .hu-stack{display:flex;height:16px;border-radius:9px;overflow:hidden;background:var(--hu-soft);gap:2px}
.hru .hu-stack i{display:block;height:100%}
.hru .hu-pl{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--hu-bd)}
.hru .hu-pl:last-child{border-bottom:0}
.hru .hu-pl .pi{width:34px;height:34px;border-radius:10px;display:grid;place-items:center}
.hru .hu-pl .pi svg{width:17px;height:17px}
.hru .hu-pl b{font-size:16px}
.hru .hu-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.hru .hu-mini div{background:var(--hu-soft);border:1px solid var(--hu-bd);border-radius:14px;padding:11px 10px;text-align:center}
.hru .hu-mini b{display:block;font-size:22px;font-weight:900;line-height:1.2}
.hru .hu-mini span{font-size:11.5px;color:var(--muted);font-weight:700}
.hru .hu-phone{display:none}
.hru .hu-side{display:flex;flex-direction:column;gap:16px;min-width:0}
@keyframes huFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@media (prefers-reduced-motion:reduce){.hru .hu-pi .hu-pimg img{animation:none}}
@media (max-width:1280px){.hru .hu-lists{grid-template-columns:1fr 1fr}.hru .hu-lists>.hu-card:last-child{grid-column:1/-1}}
@media (max-width:1100px){.hru .hu-row2,.hru .hu-row3{grid-template-columns:1fr}.hru .hu-ins{grid-template-columns:1fr 1fr}}
@media (max-width:860px){.hru .hu-kpis{grid-template-columns:1fr 1fr}.hru .hu-hero{grid-row:auto;grid-column:1/-1}.hru .hu-lists{grid-template-columns:1fr}.hru .hu-ins{grid-template-columns:1fr}}
@media (max-width:560px){.hru .hu-card{padding:16px;border-radius:18px}.hru .hu-kpis{gap:10px}.hru .hu-big{font-size:32px}.hru .hu-hero .hu-big{font-size:58px}.hru .hu-top h3{font-size:22px}.hru .hu-top h3 img{width:38px;height:38px}
  .hru .hu-pod{gap:6px;min-height:250px}.hru .hu-pi .hu-pimg{width:74px;height:74px}.hru .hu-pi.p1 .hu-pimg{width:98px;height:98px}.hru .hu-pn{font-size:13px}.hru .hu-pv b{font-size:17px}
  .hru .hu-r{grid-template-columns:18px 44px minmax(0,1fr) auto;gap:9px}.hru .hu-r .hu-ic,.hru .hu-r .hu-ic.th{width:44px;height:44px}
  .hru .hu-chart{height:210px;grid-template-columns:30px 1fr}.hru .hu-cols{gap:1px}.hru .hu-hm{gap:2px}.hru .hu-hm .c{border-radius:3px}.hru .hu-hm .dl{font-size:11px}.hru .hu-hm .hl{font-size:9px}
  .hru .hu-ins:not(.open) .hu-x{display:none}.hru .hu-phone{display:block}.hru .hu-xax span.alt{display:none}
  .hru .hu-seg button{padding:7px 12px}.hru .hu-in{font-size:13.5px}}
`;
function hrViewUsage(){hrSet(hrLoading());hruLoad();}
function hruSetDays(d){HRU_DAYS=d;HRU_OPEN={};hrViewUsage();}
async function hruLoad(){try{const u=await hrApi('admin/usage?days='+HRU_DAYS);HRU_DATA=u;if(hrActive('usage'))hruRender(u);}catch(e){if(hrActive('usage'))hrSet(hrErr(e.message,'hrViewUsage()'));}}
function hruToggle(k){HRU_OPEN[k]=!HRU_OPEN[k];if(HRU_DATA)hruRender(HRU_DATA);}
/* ── معينات ── */
const hruN=(n,d)=>Number(n||0).toLocaleString('ar-SA',{maximumFractionDigits:d||0});
const hruP=(a,b)=>b?Math.round(a/b*100):0;
function hruName(r,meta){if(r.kind==='lesson'){const m=meta&&meta[r.target];return m?m.title:r.target;}return HRU_NAMES[r.target]||r.target;}
function hruImgErr(el){const l=(el.getAttribute('data-fb')||'').split('|').filter(Boolean);if(!l.length){el.onerror=null;return}el.src=l.shift();el.setAttribute('data-fb',l.join('|'));if(!l.length)el.classList.remove('th');}
function hruIconSrc(t){const k=HRU_ICON_ALIAS[t]||t;return './img/hr3d/'+(HRU_ICONS.has(k)?k:'_fallback')+'.png';}
/* أيقونة العنصر: درس 3D = صورة الدرس (نسخة البطاقة ثم الأصل ثم أيقونة المختبر)، وغيره أيقونة المنصّة */
function hruIcon(r,meta,cls){
  if(r.kind==='lesson'){const m=meta&&meta[r.target];const jpg='https://huroofduroos.com/app/3d/'+((m&&m.thumb)||(r.target+'/thumb.jpg'));
    return `<img class="${cls} th" loading="lazy" alt="" src="${esc(jpg.replace(/\.jpg$/,'.card.webp'))}" data-fb="${esc(jpg)}|./img/hr3d/lab3d.png" onerror="hruImgErr(this)">`;}
  return `<img class="${cls}" loading="lazy" alt="" src="${hruIconSrc(r.target)}" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'">`;
}
function hruDelta(cur,prev,cmp){if(!cmp)return '';if(!prev&&!cur)return '';if(!prev)return `<span class="hu-d hu-new">جديد</span>`;const p=Math.round((cur-prev)/prev*100);if(p===0)return `<span class="hu-d hu-eq">= ثابت</span>`;return `<span class="hu-d ${p>0?'hu-up':'hu-dn'}">${p>0?'▲':'▼'} ${hruN(Math.abs(p))}٪</span>`;}
/* خطوة محور «لطيفة»: ١، ٢، ٥ × ١٠ⁿ */
function hruNice(x){if(x<=1)return 1;const m=Math.pow(10,Math.floor(Math.log10(x)));for(const f of [1,1.5,2,2.5,3,4,5,6,8,10]){if(f*m>=x)return f*m}return 10*m;}
function hruHour(h){h=((h%24)+24)%24;const x=h%12||12;return hruN(x)+(h<12?'ص':'م');}
function hruDay(s){return new Date(s+'T12:00:00Z');}
function hruFmt(s,o){try{return hruDay(s).toLocaleDateString(HRU_LOC,Object.assign({timeZone:'UTC'},o||{day:'numeric',month:'short'}));}catch(e){return s;}}
/* كلّ أيّام المدّة بتوقيت الرياض (UTC+3 بلا توقيتٍ صيفيّ) — الأيّام الخالية أصفار لا فجوات */
function hruFill(rows,days){const m={};(rows||[]).forEach(r=>{m[r.day]=r});const out=[];const now=Date.now();
  for(let i=days;i>=0;i--){const d=new Date(now-i*864e5+3*36e5).toISOString().slice(0,10);if(out.length&&out[out.length-1].day===d)continue;const r=m[d]||{};out.push({day:d,tools:+r.tools||0,games:+r.games||0,lessons:+r.lessons||0,devices:+r.devices||0});}
  if(out.length>days)out.shift();return out;}
function hruSpark(vals,color,id){
  if(!vals.length)return '';const max=Math.max(...vals,1),n=vals.length;
  const pts=vals.map((v,i)=>`${n===1?50:(100-i/(n-1)*100).toFixed(2)},${(38-v/max*34).toFixed(2)}`);
  return `<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${pts.join(' ')} 0,40 100,40" fill="url(#${id})"/><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
}
/* ── السياق المحسوب مرّةً لكلّ عرض ── */
function hruCtx(u){
  const T=u.totals||{},P=u.prevTotals||{},E=u.engagement||{},meta=u.lessonsMeta||{};
  const rows=(u.byTarget||[]).map(r=>Object.assign({},r,{opens:+r.opens||0,devices:+r.devices||0,users:+r.users||0,prevOpens:+r.prevOpens||0,repeatDevices:+r.repeatDevices||0}));
  const total=+T.opens||0;
  /* المقارنة ممكنة إن وُجدت فتحاتٌ في المدّة السابقة؛ وجزئيّة إن بدأ القياس داخلها */
  const prevStart=Date.now()-2*HRU_DAYS*864e5;const first=u.firstEventAt?new Date(u.firstEventAt).getTime():null;
  const cmp=(+P.opens||0)>0;const partial=cmp&&first&&first>prevStart;
  const byKind={game:0,tool:0,lesson:0};rows.forEach(r=>{if(byKind[r.kind]!=null)byKind[r.kind]+=r.opens});
  const hm={};let hmMax=0;(u.heatmap||[]).forEach(c=>{const k=c.dow+'-'+c.hour;hm[k]=(hm[k]||0)+(+c.opens||0);hmMax=Math.max(hmMax,hm[k])});
  return {T,P,E,meta,rows,total,cmp,partial,first,byKind,hm,hmMax,daily:hruFill(u.daily,HRU_DAYS)};
}
/* ── جُملٌ تقرأ الأرقام بدلاً منك ── */
function hruInsights(u,c){
  const out=[],add=(icon,html,color)=>out.push({icon,html,color}),img=src=>({img:src});
  const {rows,total,E,meta,byKind}=c;if(!total)return out;
  const top=rows[0];if(top)add(img(top.kind==='lesson'?'./img/hr3d/lab3d.png':hruIconSrc(top.target)),`<b>${esc(hruName(top,meta))}</b> وحدها = <b>${hruN(hruP(top.opens,total))}٪</b> من كلّ الفتحات (${hruN(top.opens)} فتح من ${hruN(total)})`);
  /* الذروة: أعلى خانة يوم×ساعة + أنشط يوم */
  if(c.hmMax){let best=null;for(const k in c.hm){if(!best||c.hm[k]>c.hm[best])best=k}const [d,h]=best.split('-').map(Number);
    const dayTot=[0,0,0,0,0,0,0];let school=0;const hs=Object.values(c.hm).reduce((a,v)=>a+v,0)||1;for(const k in c.hm){const [dd,hh]=k.split('-').map(Number);dayTot[dd]+=c.hm[k];if(dd<=4&&hh>=7&&hh<14)school+=c.hm[k]}
    const bd=dayTot.indexOf(Math.max(...dayTot));
    add({lucide:'clock',bg:'rgba(232,199,102,.16)',fg:'var(--gold)'},`ذروة الاستخدام: <b style="white-space:nowrap">${HRU_DOW[d]} ${hruHour(h)}–${hruHour(h+1)}</b>، وأنشط الأيّام <b>${HRU_DOW[bd]}</b> (${hruN(hruP(dayTot[bd],hs))}٪ من الأسبوع)`);
    const sp=hruP(school,hs);
    add({lucide:'school',bg:'rgba(56,189,248,.16)',fg:'#38bdf8'},sp>=50?`<b>${hruN(sp)}٪</b> من الفتحات داخل وقت الدوام (الأحد–الخميس ٧ص–٢م) — المنصّة تُستعمل <b>داخل الحصّة</b> فعلاً`:`<b>${hruN(100-sp)}٪</b> من الفتحات خارج وقت الدوام — تحضيرٌ في البيت أكثر منه داخل الحصّة`);
  }
  if(+E.devices>0){const rp=hruP(+E.returning,+E.devices);add({lucide:'repeat',bg:'rgba(34,197,94,.15)',fg:'#22c55e'},`<b>${hruN(rp)}٪</b> من الأجهزة رجعت في أكثر من يوم${+E.loyal?`، و<b>${hruN(E.loyal)}</b> جهاز استعملها ٥ أيّام أو أكثر`:''}`);}
  const parts=['game','tool','lesson'].filter(k=>byKind[k]).map(k=>`${HRU_KIND[k].name} <b>${hruN(hruP(byKind[k],total))}٪</b>`);
  if(parts.length>1)add({lucide:'pie-chart',bg:'rgba(167,139,250,.16)',fg:'#a78bfa'},'توزيع الاستخدام: '+parts.join(' · '));
  if(c.cmp){const g=rows.filter(r=>r.opens>=5&&r.prevOpens>=3).map(r=>Object.assign({g:(r.opens-r.prevOpens)/r.prevOpens},r));
    const up=g.filter(r=>r.g>0).sort((a,b)=>b.g-a.g)[0],dn=g.filter(r=>r.g<0).sort((a,b)=>a.g-b.g)[0];
    const fresh=rows.filter(r=>r.opens>=5&&!r.prevOpens).sort((a,b)=>b.opens-a.opens)[0];
    if(up)add(img(up.kind==='lesson'?'./img/hr3d/lab3d.png':hruIconSrc(up.target)),`الأسرع نموّاً: <b>${esc(hruName(up,meta))}</b> <span class="hu-d hu-up">▲ ${hruN(Math.round(up.g*100))}٪</span> عن الفترة السابقة`);
    else if(fresh)add(img(fresh.kind==='lesson'?'./img/hr3d/lab3d.png':hruIconSrc(fresh.target)),`جديدٌ لافت: <b>${esc(hruName(fresh,meta))}</b> — ${hruN(fresh.opens)} فتح ولم يُفتح في الفترة السابقة`);
    if(dn)add(img(dn.kind==='lesson'?'./img/hr3d/lab3d.png':hruIconSrc(dn.target)),`تراجع: <b>${esc(hruName(dn,meta))}</b> <span class="hu-d hu-dn">▼ ${hruN(Math.round(-dn.g*100))}٪</span> — يستحقّ تذكيراً في المحتوى`);}
  const sticky=rows.filter(r=>r.devices>=4&&r.repeatDevices>0).map(r=>Object.assign({s:r.repeatDevices/r.devices},r)).sort((a,b)=>b.s-a.s)[0];
  if(sticky)add(img(sticky.kind==='lesson'?'./img/hr3d/lab3d.png':hruIconSrc(sticky.target)),`الأكثر عودةً: <b>${esc(hruName(sticky,meta))}</b> — <b>${hruN(Math.round(sticky.s*100))}٪</b> من أجهزته رجعت له في يومٍ آخر (عادةٌ لا تجربة)`);
  if(+E.devices>0)add({lucide:'mouse-pointer-click',bg:'rgba(245,166,35,.15)',fg:'#f5a623'},`كلّ جهاز يفتح <b>${hruN(E.avgOpens,1)}</b> مرّة في المتوسّط ويجرّب <b>${hruN(E.avgTargets,1)}</b> عنصراً مختلفاً`);
  const pl=(u.platforms||[]).map(p=>({k:p.platform,o:+p.opens||0})).sort((a,b)=>b.o-a.o)[0];
  if(pl&&pl.o)add({lucide:(HRU_PLAT[pl.k]||HRU_PLAT.unknown).icon,bg:'rgba(56,189,248,.14)',fg:'#38bdf8'},`<b>${hruN(hruP(pl.o,total))}٪</b> من الفتحات من <b>${(HRU_PLAT[pl.k]||HRU_PLAT.unknown).name}</b>`);
  const seen=new Set(rows.map(r=>r.target));const miss=HRU_EXPECTED.filter(t=>!seen.has(t));
  if(miss.length&&miss.length<HRU_EXPECTED.length)add({lucide:'eye-off',bg:'rgba(248,113,113,.14)',fg:'#f87171'},`لم يُفتح في هذه المدّة: ${miss.slice(0,5).map(t=>`<b>${esc(HRU_NAMES[t]||t)}</b>`).join('، ')}${miss.length>5?` و${hruN(miss.length-5)} غيرها`:''}`);
  const tl=rows.find(r=>r.kind==='lesson');
  if(tl){const m=meta[tl.target];add(img('./img/hr3d/lab3d.png'),`أكثر درس 3D فتحاً: <b>${esc(hruName(tl,meta))}</b>${m&&m.subject?` (${esc(m.subject)}${m.grade?' · '+esc(m.grade):''})`:''} — ${hruN(tl.opens)} فتح`);}
  else add(img('./img/hr3d/lab3d.png'),`دروس 3D: بدأ القياس من <b>٢٠ أكتوبر</b> — تظهر هنا بعد أوّل فتح`);
  return out;
}
function hruInsightsHTML(list){
  if(!list.length)return `<div class="hu-empty"><img src="./img/hr3d/_fallback.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"><b>لا فتحات بعد في هذه المدّة</b>جرّب مدّةً أطول.</div>`;
  const L=list.slice(0,12);
  return `<div class="hu-ins${HRU_OPEN.ins?' open':''}">${L.map((i,ix)=>`<div class="hu-in${ix>=6?' hu-x':''}"><div class="hu-ii" style="${i.icon.bg?`background:${i.icon.bg};color:${i.icon.fg}`:''}">${i.icon.img?`<img src="${i.icon.img}" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'">`:`<i data-lucide="${i.icon.lucide}"></i>`}</div><div>${i.html}</div></div>`).join('')}</div>${L.length>6?`<button class="hu-more hu-phone" onclick="hruToggle('ins')">${HRU_OPEN.ins?'إخفاء':'المزيد ('+hruN(L.length-6)+')'}</button>`:''}`;
}
/* ── منصّة الأوائل: الثلاثة الأكثر فتحاً من كلّ الأنواع ── */
function hruPodium(c){
  const top=c.rows.slice(0,3);
  if(!top.length)return `<div class="hu-empty"><img src="./img/hr3d/scoreboard.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"><b>لا ترتيب بعد</b>تظهر هنا الأكثر فتحاً.</div>`;
  const h=[150,104,74],medal=['linear-gradient(135deg,#FFD66B,#F5A623)','linear-gradient(135deg,#F1F5F9,#94A3B8)','linear-gradient(135deg,#F7B58A,#C2703D)'];
  const order=top.length===3?[1,0,2]:top.length===2?[1,0]:[0];
  return `<div class="hu-pod">${order.map(i=>{const r=top[i],k=HRU_KIND[r.kind]||HRU_KIND.tool;return `<div class="hu-pi p${i+1}">
    <div class="hu-pimg">${hruIcon(r,c.meta,'')}</div>
    <div class="hu-pn">${esc(hruName(r,c.meta))}</div>
    <div class="hu-pv"><b>${hruN(r.opens)}</b> فتح · ${hruN(hruP(r.opens,c.total))}٪</div>
    <div class="hu-base" style="height:${h[i]}px;background:linear-gradient(180deg,${k.color}40,${k.color}08)"><div class="hu-hex" style="background:${medal[i]}">${hruN(i+1)}</div></div>
  </div>`}).join('')}</div>${hruNext(c)}`;
}
/* الأربعة التالون بعد المنصّة */
function hruNext(c){const r=c.rows.slice(3,7);if(!r.length)return '';
  return `<div class="hu-next">${r.map((x,i)=>`<div title="${esc(hruName(x,c.meta))}">${hruIcon(x,c.meta,'')}<span class="nm">${hruN(i+4)}. ${esc(hruName(x,c.meta))}</span><span class="v">${hruN(x.opens)} فتح</span></div>`).join('')}</div>`;}
/* ── قائمة نوعٍ واحد مرتّبة ── */
function hruList(kind,c){
  const K=HRU_KIND[kind],rows=c.rows.filter(r=>r.kind===kind),sum=rows.reduce((a,r)=>a+r.opens,0);
  const head=`<div class="hu-h"><h4><img src="${kind==='game'?'./img/hr3d/huroof.png':kind==='tool'?'./img/hr3d/timer.png':'./img/hr3d/lab3d.png'}" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'">${K.name}</h4><span class="hu-sub">${hruN(sum)} فتح · ${hruN(hruP(sum,c.total))}٪</span></div>`;
  if(!rows.length){
    if(kind==='lesson')return `<div class="hu-card">${head}<div class="hu-empty"><img src="./img/hr3d/lab3d.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"><b>بدأ القياس من ٢٠ أكتوبر ٢٠٢٦</b>كلّ درسٍ يُفتح من مختبر حروف 3D يُعدّ باسمه — تظهر هنا الدروس الأكثر فتحاً بعد أوّل استخدام (بعد نشر تحديث الويب).</div></div>`;
    return `<div class="hu-card">${head}<div class="hu-empty"><b>لا بيانات بعد في هذه المدّة</b></div></div>`;
  }
  const max=rows[0].opens||1,lim=HRU_OPEN[kind]?rows.length:6;
  const body=rows.slice(0,lim).map((r,i)=>{const m=kind==='lesson'?c.meta[r.target]:null;
    const sub=[m&&m.subject?esc(m.subject)+(m.grade?' · '+esc(m.grade):''):'',`${hruN(r.devices)} جهاز`,r.users?`${hruN(r.users)} مسجّل`:'',r.repeatDevices?`يعود له ${hruN(r.repeatDevices)}`:''].filter(Boolean).join(' · ');
    return `<div class="hu-r" title="${esc(hruName(r,c.meta))}${c.cmp?` — الفترة السابقة: ${hruN(r.prevOpens)} فتح`:''}">
      <div class="hu-n">${hruN(i+1)}</div>${hruIcon(r,c.meta,'hu-ic')}
      <div style="min-width:0"><div class="hu-nm"><span class="t">${esc(hruName(r,c.meta))}</span></div>
        <div class="hu-bar"><i style="width:${Math.max(3,Math.round(r.opens/max*100))}%;background:linear-gradient(90deg,${K.color}aa,${K.color})"></i></div>
        <div class="hu-meta">${sub}</div></div>
      <div class="hu-val"><b>${hruN(r.opens)}</b>${(kind==='lesson'&&!r.prevOpens)?'':hruDelta(r.opens,r.prevOpens,c.cmp)}<span>${hruN(hruP(r.opens,c.total))}٪ من الكلّ</span></div></div>`}).join('');
  const more=rows.length>6?`<button class="hu-more" onclick="hruToggle('${kind}')">${HRU_OPEN[kind]?'إخفاء':'عرض الكلّ ('+hruN(rows.length)+')'}</button>`:'';
  return `<div class="hu-card">${head}${body}${more}</div>`;
}
/* ── الرسم اليوميّ: أعمدة مكدّسة (أدوات/ألعاب/دروس) + خطّ الأجهزة النشطة ── */
function hruDailyHTML(c){
  const d=c.daily,n=d.length;if(!n)return '';
  const tot=r=>r.tools+r.games+r.lessons,max=Math.max(...d.map(tot),1);
  const step=hruNice(max/4),top=step*4;
  const cols=d.map(r=>{const t=tot(r),dow=hruDay(r.day).getUTCDay(),we=dow===5||dow===6;
    return `<div class="hu-col${we?' we':''}" title="${HRU_DOW[dow]} ${hruFmt(r.day)} — ${hruN(t)} فتح: ألعاب ${hruN(r.games)} · أدوات ${hruN(r.tools)} · دروس ${hruN(r.lessons)} · ${hruN(r.devices)} جهاز">
      ${r.lessons?`<i style="height:${r.lessons/top*100}%;background:${HRU_KIND.lesson.color}"></i>`:''}${r.games?`<i style="height:${r.games/top*100}%;background:${HRU_KIND.game.color}"></i>`:''}${r.tools?`<i style="height:${r.tools/top*100}%;background:${HRU_KIND.tool.color}"></i>`:''}</div>`}).join('');
  /* خطّ الأجهزة على المقياس نفسه (الأجهزة ≤ الفتحات دائماً) — RTL: اليوم الأوّل يميناً */
  const pts=d.map((r,i)=>`${(100-(i+.5)/n*100).toFixed(2)},${(100-r.devices/top*100).toFixed(2)}`).join(' ');
  const every=n<=8?1:n<=31?Math.ceil(n/6):Math.ceil(n/7);
  let li=0;const xl=d.map((r,i)=>(i%every===0||i===n-1)&&!(i!==n-1&&n-1-i<every*.6)?`<span class="${n>8&&(li++)%2?'alt':''}" style="right:${((i+.5)/n*100).toFixed(2)}%">${n<=8?HRU_DOW[hruDay(r.day).getUTCDay()]:hruFmt(r.day)}</span>`:'').join('');
  const yl=[4,3,2,1,0].map(i=>`<span>${hruN(step*i)}</span>`).join('');
  const sumK=k=>d.reduce((a,r)=>a+r[k],0);
  const leg=`<div class="hu-leg"><span><i style="background:${HRU_KIND.game.color}"></i>ألعاب <b>${hruN(sumK('games'))}</b></span><span><i style="background:${HRU_KIND.tool.color}"></i>أدوات <b>${hruN(sumK('tools'))}</b></span><span><i style="background:${HRU_KIND.lesson.color}"></i>دروس 3D <b>${hruN(sumK('lessons'))}</b></span><span><i style="background:transparent;border:2px solid var(--ink);border-radius:50%;width:10px;height:10px"></i>أجهزة نشطة يوميّاً</span><span><i style="background:rgba(255,255,255,.08);border:1px solid var(--hu-bd)"></i>الجمعة والسبت</span></div>`;
  return `<div class="hu-card" style="margin-bottom:16px"><div class="hu-h"><h4><i data-lucide="bar-chart-3"></i> يوماً بيوم</h4>${leg}</div>
    <div class="hu-chart"><div class="hu-yax">${yl}</div><div class="hu-plot"><div class="hu-cols">${cols}</div>
      <svg class="hu-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-opacity=".85" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></div>
      <div class="hu-xax">${xl}</div></div></div>`;
}
/* ── خريطة يوم×ساعة بتوقيت الرياض ── */
function hruHeatHTML(c){
  let lo=7,hi=21;for(const k in c.hm){const h=+k.split('-')[1];if(c.hm[k]){lo=Math.min(lo,h);hi=Math.max(hi,h)}}
  const hours=[];for(let h=lo;h<=hi;h++)hours.push(h);
  const tot=[0,0,0,0,0,0,0];for(const k in c.hm){tot[+k.split('-')[0]]+=c.hm[k]}
  const color=v=>{if(!v)return '';const a=.10+.90*Math.pow(v/c.hmMax,1.15);return `background:rgba(245,166,35,${a.toFixed(3)});box-shadow:${v===c.hmMax?'0 0 0 2px #fff6, 0 0 14px rgba(245,166,35,.6)':'none'}`;};
  const lblEvery=hours.length>14?3:2;
  let g=`<div></div>${hours.map(h=>`<div class="hl">${(h-lo)%lblEvery===0?hruHour(h):''}</div>`).join('')}<div class="hl">المجموع</div>`;
  for(let d=0;d<7;d++){g+=`<div class="dl">${HRU_DOW[d]}</div>${hours.map(h=>{const v=c.hm[d+'-'+h]||0;return `<div class="c" style="${color(v)}" title="${HRU_DOW[d]} ${hruHour(h)}–${hruHour(h+1)}: ${hruN(v)} فتح"></div>`}).join('')}<div class="tot" style="color:${tot[d]?'var(--ink)':'var(--muted)'}">${hruN(tot[d])}</div>`;}
  const hsum=Object.values(c.hm).reduce((a,v)=>a+v,0)||1,hr=hruHours(c,hours,hsum);
  const school=Object.keys(c.hm).reduce((a,k)=>{const [d,h]=k.split('-').map(Number);return a+(d<=4&&h>=7&&h<14?c.hm[k]:0)},0);
  return `<div class="hu-card"><div class="hu-h"><h4><i data-lucide="calendar-clock"></i> متى يستخدمون المنصّة؟</h4><span class="hu-sub">بتوقيت الرياض · كلّما اشتدّ اللون زادت الفتحات</span></div>
    ${c.hmMax?`<div class="hu-hm" style="grid-template-columns:auto repeat(${hours.length},minmax(0,1fr)) auto">${g}${hr.cells}</div>
    <div class="hu-note" style="margin-top:14px;display:flex;gap:18px;flex-wrap:wrap"><span><b>${hruN(hruP(school,hsum))}٪</b> من الفتحات داخل وقت الدوام المدرسيّ (الأحد–الخميس، ٧ص–٢م)</span><span>${hr.peak}</span></div>`:`<div class="hu-empty"><b>لا بيانات بعد</b></div>`}</div>`;
}
/* صفّ «كلّ الأيّام» داخل شبكة الخريطة نفسها فتتطابق أعمدة الساعات — أيّ حصّةٍ تُستعمل فيها المنصّة */
function hruHours(c,hours,hsum){const by=hours.map(h=>{let v=0;for(let d=0;d<7;d++)v+=c.hm[d+'-'+h]||0;return v});const mx=Math.max(...by,1),bi=by.indexOf(mx);
  return {cells:`<div class="dl" style="align-self:end">كلّ الأيّام</div>${by.map((v,i)=>`<div class="hb" title="${hruHour(hours[i])}: ${hruN(v)} فتح"><i style="height:${Math.max(v?4:0,v/mx*100)}%;background:${i===bi?'linear-gradient(180deg,#FFD66B,#F5A623)':'rgba(245,166,35,.42)'}"></i></div>`).join('')}<div></div>`,
    peak:`أكثر ساعةٍ استخداماً: <b>${hruHour(hours[bi])}–${hruHour(hours[bi]+1)}</b> (${hruN(hruP(mx,hsum))}٪ من الفتحات)`};}
/* ── المنصّات + العودة ── */
function hruPlatHTML(u,c){
  const ps=(u.platforms||[]).map(p=>({k:HRU_PLAT[p.platform]?p.platform:'unknown',o:+p.opens||0,d:+p.devices||0})).sort((a,b)=>b.o-a.o);
  const sum=ps.reduce((a,p)=>a+p.o,0)||1;
  return `<div class="hu-card"><div class="hu-h"><h4><i data-lucide="monitor-smartphone"></i> من أين يدخلون؟</h4></div>
    ${ps.length?`<div class="hu-stack">${ps.map(p=>`<i style="width:${p.o/sum*100}%;background:${HRU_PLAT[p.k].color}" title="${HRU_PLAT[p.k].name}"></i>`).join('')}</div>
    <div style="margin-top:8px">${ps.map(p=>{const P=HRU_PLAT[p.k];return `<div class="hu-pl"><div class="pi" style="background:${P.color}22;color:${P.color}"><i data-lucide="${P.icon}"></i></div><div><div style="font-weight:900">${P.name}</div><div class="hu-meta">${hruN(p.d)} جهاز</div></div><div class="hu-val"><b>${hruN(hruP(p.o,sum))}٪</b><span>${hruN(p.o)} فتح</span></div></div>`}).join('')}</div>`:`<div class="hu-empty"><b>لا بيانات بعد</b></div>`}</div>`;
}
function hruEngHTML(c){
  const E=c.E,dv=+E.devices||0,once=+E.once||0,loyal=+E.loyal||0,mid=Math.max(0,(+E.returning||0)-loyal);
  const seg=[{n:'مرّة واحدة',v:once,c:'#71717a'},{n:'٢–٤ أيّام',v:mid,c:'#38bdf8'},{n:'٥ أيّام فأكثر',v:loyal,c:'#22c55e'}];
  return `<div class="hu-card"><div class="hu-h"><h4><i data-lucide="repeat"></i> هل يرجعون؟</h4><span class="hu-sub">أيّام نشاط كلّ جهاز في المدّة</span></div>
    ${dv?`<div class="hu-stack" style="height:22px">${seg.filter(s=>s.v).map(s=>`<i style="width:${s.v/dv*100}%;background:${s.c}" title="${s.n}: ${hruN(s.v)}"></i>`).join('')}</div>
    <div class="hu-leg" style="margin-top:10px">${seg.map(s=>`<span><i style="background:${s.c}"></i>${s.n} <b>${hruN(s.v)}</b> (${hruN(hruP(s.v,dv))}٪)</span>`).join('')}</div>
    <div class="hu-mini"><div><b>${hruN(E.avgDays,1)}</b><span>يوم نشاط / جهاز</span></div><div><b>${hruN(E.avgTargets,1)}</b><span>عنصر مختلف / جهاز</span></div><div><b>${hruN(E.newDevices)}</b><span>جهاز جديد</span></div></div>`:`<div class="hu-empty"><b>لا بيانات بعد</b></div>`}</div>`;
}
/* ── المؤشّرات الكبيرة ── */
function hruKpis(c){
  const {T,P,E,cmp}=c,dv=+E.devices||0,per='عن الفترة السابقة';
  const avgDay=c.daily.length?c.total/c.daily.length:0;
  const sp=hruSpark(c.daily.map(r=>r.tools+r.games+r.lessons),'#f5a623','huSpk');
  const k=(icon,lbl,big,note,delta)=>`<div class="hu-card"><div class="hu-lbl"><i data-lucide="${icon}"></i>${lbl}</div><div class="hu-big">${big}</div>${delta?`<div style="margin-bottom:6px">${delta}</div>`:''}<div class="hu-note">${note}</div></div>`;
  const dl=(a,b)=>cmp?`${hruDelta(+a||0,+b||0,true)} <span class="hu-note">${per}</span>`:'';
  return `<div class="hu-kpis">
    <div class="hu-card hu-hero"><div class="hu-lbl"><i data-lucide="mouse-pointer-click"></i>فتحات الألعاب والأدوات والدروس</div>
      <div class="hu-big">${hruN(c.total)}</div>
      <div>${cmp?`${hruDelta(c.total,+P.opens||0,true)} <span class="hu-note">${per} (${hruN(P.opens)})</span>`:`<span class="hu-note">لا بيانات في الفترة السابقة للمقارنة</span>`}</div>
      <div class="hu-note" style="margin-top:8px">≈ <b>${hruN(avgDay,1)}</b> فتح يوميّاً في المتوسّط</div>
      <div class="hu-spark">${sp}</div></div>
    ${k('smartphone','أجهزة مختلفة',hruN(T.devices),`منها <b>${hruN(E.newDevices)}</b> جهاز يظهر لأوّل مرّة`,dl(T.devices,P.devices))}
    ${k('repeat','رجعوا أكثر من يوم',`${hruN(hruP(+E.returning,dv))}<small>٪</small>`,`<b>${hruN(E.returning)}</b> من ${hruN(dv)} جهاز · <b>${hruN(E.loyal)}</b> استعملها ٥ أيّام+`)}
    ${k('layers','فتحات لكلّ جهاز',hruN(E.avgOpens,1),`ويجرّب <b>${hruN(E.avgTargets,1)}</b> عنصراً مختلفاً في <b>${hruN(E.avgDays,1)}</b> يوم`)}
    ${k('user-check','مستخدمون مسجّلون',hruN(T.users),`<b>${hruN(hruP(+T.users,+T.devices))}٪</b> قياساً بعدد الأجهزة — الباقي زوّار بلا حساب`,dl(T.users,P.users))}
  </div>`;
}
function hruRender(u){
  const c=hruCtx(u);
  const seg=`<div class="hu-seg">${[7,30,90].map(d=>`<button class="${HRU_DAYS===d?'on':''}" onclick="hruSetDays(${d})">${hruN(d)} يوم</button>`).join('')}</div>`;
  const note=c.partial?`<div class="hu-note" style="margin:-8px 0 16px"><i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px"></i> المقارنة بالفترة السابقة جزئيّة: القياس بدأ في ${esc(new Date(c.first).toLocaleDateString(HRU_LOC,{day:'numeric',month:'long',year:'numeric'}))}.</div>`:'';
  hrSet(`<style>${HRU_CSS}</style><div class="hru">
    <div class="hu-top"><div><h3><img src="./img/hr3d/scoreboard.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"> الاستخدام</h3><p>ما يفتحه المعلّمون فعلاً — آخر ${hruN(HRU_DAYS)} يوماً، بتوقيت الرياض.</p></div>${seg}</div>
    ${note}${hruKpis(c)}
    <div class="hu-row2">
      <div class="hu-card"><div class="hu-h"><h4><img src="./img/hr3d/_fallback.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"> ماذا تقول الأرقام؟</h4><span class="hu-sub">تُكتب تلقائيّاً من بيانات المدّة</span></div>${hruInsightsHTML(hruInsights(u,c))}</div>
      <div class="hu-card hu-podc"><div class="hu-h"><h4><img src="./img/hr3d/scoreboard.png" alt="" onerror="this.onerror=null;this.src='./img/hr3d/_fallback.png'"> الأكثر تفاعلاً</h4><span class="hu-sub">من كلّ الألعاب والأدوات والدروس</span></div>${hruPodium(c)}</div>
    </div>
    <div class="hu-lists">${hruList('game',c)}${hruList('tool',c)}${hruList('lesson',c)}</div>
    ${hruDailyHTML(c)}
    <div class="hu-row3">${hruHeatHTML(c)}<div class="hu-side">${hruPlatHTML(u,c)}${hruEngHTML(c)}</div></div>
  </div>`);
}

/* ═══════════ التسويق والوكيل — من الإعلان إلى الاشتراك، وتقرير الوكيل الأسبوعيّ ═══════════
   الخادم: artifacts/api-server/src/routes/admin/marketing.ts + lib/marketingAgent.ts (ريبو حروف).
   الأرقام كلّها من القاعدة ومن لقطة سكربت Google Ads — لا أرقام ثابتة هنا.
   مفتاح الذكاء الاصطناعيّ في بيئة الخادم وحدها (ANTHROPIC_API_KEY أو GEMINI_API_KEY)؛ اللوحة تختبره ولا تستقبله. */
let HR_MKT_DAYS=30;
let HR_MKT_DATA=null;     // ردّ /admin/marketing/overview
let HR_MKT_REPORT=null;   // التقرير المعروض (الأحدث أو المختار من السجلّ)
let HR_MKT_HISTORY=null;  // آخر ٢٠ تقريراً
let HR_MKT_PING=null;     // نتيجة «اختبر الاتصال»
let HR_MKT_POLL=null;
const HR_MKT_PERSONA={P1:'أ. نورة المعلّمة',P2:'أ. عبدالله المعلّم',P3:'سلطان الطالب',P4:'أم فيصل',P5:'أبو خالد',P6:'قائد المدرسة',P7:'ريم طالبة الثانوي'};
const HR_MKT_SEV={high:['#f87171','عالٍ'],medium:['#f5a623','متوسّط'],low:['#94a3b8','منخفض']};
const HR_MKT_DOW={SUNDAY:'الأحد',MONDAY:'الاثنين',TUESDAY:'الثلاثاء',WEDNESDAY:'الأربعاء',THURSDAY:'الخميس',FRIDAY:'الجمعة',SATURDAY:'السبت'};
const HR_MKT_CSS=`
.hru .mk-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:16px}
.hru .mk-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.hru .mk-status{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.hru .mk-st{padding:12px 14px;border-radius:16px;background:var(--hu-soft);border:1px solid var(--hu-bd);font-size:13px;line-height:1.7;font-weight:600}
.hru .mk-st b{display:block;font-size:14px;font-weight:900;margin-bottom:2px}
.hru .mk-ok{color:#22c55e}.hru .mk-bad{color:#f87171}.hru .mk-warn{color:#f5a623}
.hru table.mk-t{width:100%;border-collapse:collapse;font-size:13px}
.hru .mk-t th{font-size:12px;color:var(--muted);font-weight:800;text-align:start;padding:8px 6px;border-bottom:1px solid var(--hu-bd)}
.hru .mk-t td{padding:9px 6px;border-bottom:1px solid var(--hu-soft);font-weight:600;font-variant-numeric:tabular-nums}
.hru .mk-t th:not(:first-child),.hru .mk-t td:not(:first-child){text-align:center}
.hru .mk-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.hru .mk-list li{padding:12px 14px;border-radius:16px;background:var(--hu-soft);border:1px solid var(--hu-bd);font-size:14px;line-height:1.7}
.hru .mk-list li .mk-m{font-size:12.5px;color:var(--muted);font-weight:600;margin-top:4px}
.hru .mk-ads{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.hru .mk-ad{padding:14px;border-radius:16px;background:var(--hu-soft);border:1px solid var(--hu-bd);display:flex;flex-direction:column;gap:6px}
.hru .mk-ad .h{font-weight:900;font-size:15px}.hru .mk-ad .d{font-size:13px;line-height:1.7}
.hru .mk-ad .f{font-size:12px;color:var(--muted);font-weight:700}
.hru .mk-words{font-size:14px;line-height:2;font-weight:600}
.hru .mk-hist button{all:unset;cursor:pointer;display:block;width:100%;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.6}
.hru .mk-hist button:hover,.hru .mk-hist button.on{background:var(--hu-soft)}
.hru .mk-json{direction:ltr;text-align:left;max-height:420px;overflow:auto;font-size:12px;background:var(--hu-soft);border-radius:14px;padding:14px;white-space:pre-wrap}
@media (max-width:900px){.hru .mk-grid,.hru .mk-status{grid-template-columns:1fr 1fr}.hru .mk-2{grid-template-columns:1fr}}
@media (max-width:560px){.hru .mk-grid,.hru .mk-status{grid-template-columns:1fr}}
`;

function hrViewMarketing(){hrSet(hrLoading());hrMktLoad();}
function hrMktSetDays(d){HR_MKT_DAYS=d;hrViewMarketing();}

async function hrMktLoad(){
  try{
    const [data,hist]=await Promise.all([
      hrApi('admin/marketing/overview?days='+HR_MKT_DAYS),
      hrApi('admin/marketing/reports').catch(()=>({reports:[]})),
    ]);
    HR_MKT_DATA=data;HR_MKT_HISTORY=hist.reports||[];
    if(!HR_MKT_REPORT||HR_MKT_REPORT.id===(data.latestReport&&data.latestReport.id))HR_MKT_REPORT=data.latestReport;
    if(hrActive('marketing'))hrMktRender();
    hrMktWatch();
  }catch(e){if(hrActive('marketing'))hrSet(hrErr(e.message,'hrViewMarketing()'));}
}

/* تقرير قيد التشغيل: نسأل كلّ ٦ ثوانٍ حتى يكتمل (التشغيل دقيقة إلى دقائق) */
function hrMktWatch(){
  clearTimeout(HR_MKT_POLL);
  const r=HR_MKT_REPORT;
  if(!r||r.status!=='running')return;
  HR_MKT_POLL=setTimeout(async()=>{
    if(!hrActive('marketing'))return;
    try{HR_MKT_REPORT=await hrApi('admin/marketing/reports/'+r.id);}catch(e){}
    if(HR_MKT_REPORT&&HR_MKT_REPORT.status!=='running'){hrMktLoad();return;}
    hrMktRender();hrMktWatch();
  },6000);
}

async function hrMktRun(){
  const btn=document.getElementById('mkRun');
  if(btn){btn.disabled=true;btn.innerHTML='<i data-lucide="loader-2"></i> يبدأ…';refreshIcons();}
  try{
    const {id}=await hrApi('admin/marketing/run',{method:'POST',body:{days:HR_MKT_DAYS}});
    HR_MKT_REPORT=await hrApi('admin/marketing/reports/'+id);
    hrMktRender();hrMktWatch();
  }catch(e){alert(e.message);if(btn){btn.disabled=false;btn.innerHTML='<i data-lucide="sparkles"></i> شغّل الوكيل الآن';refreshIcons();}}
}

async function hrMktPing(){
  HR_MKT_PING={pending:true};hrMktRender();
  try{HR_MKT_PING=await hrApi('admin/marketing/ping',{method:'POST'});}catch(e){HR_MKT_PING={ok:false,error:e.message};}
  hrMktRender();
}

async function hrMktOpen(id){
  try{HR_MKT_REPORT=await hrApi('admin/marketing/reports/'+id);hrMktRender();hrMktWatch();
    const el=document.getElementById('mkReport');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){alert(e.message);}
}

function hrMktCopy(btn,text){
  navigator.clipboard.writeText(text).then(()=>{const o=btn.innerHTML;btn.innerHTML='✓ نُسخ';setTimeout(()=>{btn.innerHTML=o;refreshIcons();},1600);});
}
/** نصٌّ آمن داخل onclick='…' (JSON ثمّ تهريب HTML، والفاصلة العليا تُكتب \u0027). */
const hrMktArg=s=>esc(JSON.stringify(s).replace(/'/g,'\\u0027'));
function hrMktCopyJson(btn){if(HR_MKT_DATA)hrMktCopy(btn,JSON.stringify(HR_MKT_DATA.input,null,2));}
function hrMktToggleJson(){const el=document.getElementById('mkJson');if(el)el.hidden=!el.hidden;}

const hrMktN=v=>v==null?'—':HR_ar(v);
const hrMktSar=v=>v==null?'—':Number(v).toLocaleString('ar-SA',{maximumFractionDigits:2})+' ر.س';
function hrMktAge(ts){
  if(!ts)return null;
  const h=Math.round((Date.now()-new Date(ts).getTime())/3600000);
  return h<1?'قبل أقلّ من ساعة':h<48?`قبل ${HR_ar(h)} ساعة`:`قبل ${HR_ar(Math.round(h/24))} يوماً`;
}
function hrMktDelta(cur,prev){
  if(prev==null||!prev)return '';
  const d=Math.round(((cur-prev)/prev)*100);
  return `<span class="hu-d ${d>0?'hu-up':d<0?'hu-dn':'hu-eq'}">${d>0?'▲':d<0?'▼':''} ${HR_ar(Math.abs(d))}٪</span>`;
}

function hrMktStatus(d){
  const c=d.config||{},ads=d.adsSnapshot,p=HR_MKT_PING;
  const visits=(d.input.attribution_funnel||[]).reduce((s,r)=>s+Number(r.visits||0),0);
  const funnelMissing=d.input.attribution_funnel==null;
  const ai=c.ready
    ?`<span class="mk-ok">مربوط</span> — ${esc(c.provider==='claude'?'Claude':'Gemini')} · <span style="direction:ltr;display:inline-block">${esc(c.model)}</span>`
    :`<span class="mk-bad">غير مربوط</span> — يوضع المفتاح في بيئة الخادم: <code>ANTHROPIC_API_KEY</code>`;
  const ping=!p?`<button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="hrMktPing()"><i data-lucide="plug-zap"></i> اختبر الاتصال</button>`
    :p.pending?'<div class="hu-note">…جارٍ الاختبار</div>'
    :p.ok?`<div class="mk-ok" style="font-size:12.5px">استجاب خلال ${HR_ar(p.ms)} ملّي‌ثانية</div>`
    :`<div class="mk-bad" style="font-size:12.5px">${esc(p.error||'فشل')}</div>`;
  const adsTxt=ads?(()=>{const age=hrMktAge(ads.receivedAt),old=(Date.now()-new Date(ads.receivedAt))>72*3600000;
      return `<span class="${old?'mk-warn':'mk-ok'}">وصلت ${esc(age)}</span>${old?' — هل توقّف السكربت المجدول؟':''}`;})()
    :`<span class="mk-bad">لم تصل بعد</span> — ${c.adsIngestEnabled?'ألصق السكربت في حساب Google Ads وجدوله':'ينقص <code>MARKETING_ADS_INGEST_SECRET</code> في الخادم'}`;
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="cable"></i> حالة الربط</h4><span class="hu-sub">ما يحتاجه الوكيل كي يرى الصورة كاملة</span></div>
    <div class="mk-status">
      <div class="mk-st"><b>الذكاء الاصطناعيّ</b>${ai}${c.ready?ping:''}</div>
      <div class="mk-st"><b>لقطة Google Ads</b>${adsTxt}</div>
      <div class="mk-st"><b>تتبّع الإعلان ← التسجيل</b>${funnelMissing?'<span class="mk-bad">الجدول غير موجود</span> — طبّق الهجرة 0021':visits?`<span class="mk-ok">${HR_ar(visits)} زيارة بروابط حملات</span> في المدّة`:'<span class="mk-warn">لا زيارات بروابط حملات بعد</span>'}</div>
      <div class="mk-st"><b>التقرير الأسبوعيّ</b>${c.weekly?'<span class="mk-ok">مفعّل</span> — كلّ أحد ٦ص بتوقيت الرياض':'<span class="mk-warn">يدويّ فقط</span> — فعّله بـ<code>MARKETING_AGENT_WEEKLY=1</code>'}</div>
    </div></div>`;
}

function hrMktKpis(i){
  const u=i.platform_usage||{},s=i.signups||{},rv=i.revenue||{},subs=i.subscriptions_by_platform||[];
  const active=subs.filter(x=>x.platform==='telr'||x.platform==='revenuecat').reduce((a,x)=>a+Number(x.active_now||0),0);
  const card=(icon,lbl,big,note)=>`<div class="hu-card"><div class="hu-lbl"><i data-lucide="${icon}"></i> ${lbl}</div><div class="hu-big">${big}</div><div class="hu-note">${note}</div></div>`;
  return `<div class="mk-grid">
    ${card('monitor-smartphone','الأجهزة',hrMktN(u.devices),`${hrMktDelta(u.devices,u.prev_period_devices)} رجع منها ${hrMktN(u.returning_devices)} في يومٍ آخر`)}
    ${card('user-plus','التسجيلات الجديدة',hrMktN(s.total),`${hrMktDelta(s.total,s.prev_period_total)} ${i.activation?`استعمل أداةً ${hrMktN(i.activation.used_a_tool)}، ورجع ${hrMktN(i.activation.came_back_another_day)}`:''}`)}
    ${card('banknote','دخل الويب (تلر)',rv.web_revenue_sar!=null?HR_ar(rv.web_revenue_sar)+'<small>ر.س</small>':'—',`${hrMktN(rv.web_paid_orders)} طلباً مدفوعاً · اشتراكات آبل خارج هذا الرقم`)}
    ${card('crown','المشتركون الدافعون الآن',hrMktN(active),subs.map(x=>`${esc(x.platform)}: <b>${HR_ar(x.active_now)}</b>`).join(' · ')||'—')}
  </div>`;
}

function hrMktFunnel(i){
  const rows=i.attribution_funnel;
  if(rows==null)return '';
  const body=rows.length?rows.map(r=>`<tr><td>${esc(r.source)}</td><td>${esc(r.campaign)}</td><td>${esc(r.content||'—')}</td><td class="n">${HR_ar(r.visits)}</td><td class="n">${HR_ar(r.devices)}</td><td class="n">${HR_ar(r.signups)}</td><td class="n">${HR_ar(r.paying)}</td></tr>`).join('')
    :`<tr><td colspan="7" class="hu-note" style="padding:14px 6px">لا زيارات بروابط حملات في المدّة. تأكّد أنّ «الوسم التلقائيّ» (auto-tagging) مفعّل في Google Ads، وأنّ روابط سناب/تيك توك تحمل utm_source.</td></tr>`;
  const ad=i.ad_landed_devices_opened;
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="filter"></i> من الإعلان إلى الاشتراك</h4><span class="hu-sub">أوّل لمسة لكلّ جهاز · التسجيل يُربط بجهازه · «يدفع» = اشتراك تلر أو آبل</span></div>
    <div style="overflow-x:auto"><table class="mk-t"><thead><tr><th>المصدر</th><th>الحملة</th><th>المحتوى</th><th>زيارات</th><th>أجهزة</th><th>سجّلوا</th><th>يدفعون</th></tr></thead><tbody>${body}</tbody></table></div>
    ${ad&&ad.items.length?`<div class="hu-note" style="margin-top:12px">ما فتحه القادمون من الحملات (${HR_ar(ad.ad_devices_total)} جهازاً): ${ad.items.slice(0,6).map(x=>`<b>${esc(x.name)}</b> ${HR_ar(x.devices)}`).join('، ')}</div>`:''}
  </div>`;
}

function hrMktAds(i){
  const g=i.google_ads;
  if(!g)return '';
  const camps=(g.campaigns||[]).map(c=>`<tr><td>${esc(c.name)}<div class="hu-note">${esc(c.type||'')} · ${esc(c.status||'')}</div></td><td class="n">${hrMktSar(c.cost)}</td><td class="n">${hrMktN(c.clicks)}</td><td class="n">${c.ctrPct!=null?HR_ar(c.ctrPct)+'٪':'—'}</td><td class="n">${hrMktN(c.conversions)}</td></tr>`).join('');
  const acts=(g.conversion_actions||[]).sort((a,b)=>(b.primary?1:0)-(a.primary?1:0)||b.conversions-a.conversions).map(a=>{
    const real=/sign_?up|purchase/i.test(a.name||'');
    const flag=a.primary?(real?'<span class="mk-ok">أساسيّ ✓</span>':'<span class="mk-bad">أساسيّ — يضلّل الخوارزمية</span>'):'<span class="hu-note">ثانويّ</span>';
    return `<tr><td>${esc(a.name)}</td><td>${flag}</td><td class="n">${hrMktN(a.conversions)}</td></tr>`;}).join('');
  const terms=(g.search_terms||[]).slice(0,12).map(t=>`<tr><td>${esc(t.term)}</td><td class="n">${hrMktN(t.clicks)}</td><td class="n">${hrMktSar(t.cost)}</td><td class="n">${hrMktN(t.conversions)}</td></tr>`).join('');
  const cats=(g.pmax_search_categories||[]).slice(0,12).map(t=>`<tr><td>${esc(t.category)}</td><td class="n">${hrMktN(t.clicks)}</td><td class="n">—</td><td class="n">${hrMktN(t.conversions)}</td></tr>`).join('');
  return `<div class="hu-card" style="margin-bottom:16px">
    <div class="hu-h"><h4><i data-lucide="megaphone"></i> Google Ads — آخر ${HR_ar(g.range_days)} يوماً</h4><span class="hu-sub">لقطة ${esc(hrMktAge(Date.now()-g.snapshot_age_hours*3600000))} · الحساب ${esc(g.account_id||'')}</span></div>
    <div class="mk-2" style="margin-bottom:0">
      <div style="overflow-x:auto"><table class="mk-t"><thead><tr><th>الحملة</th><th>الصرف</th><th>نقرات</th><th>CTR</th><th>تحويلات</th></tr></thead><tbody>${camps||'<tr><td colspan="5">—</td></tr>'}</tbody></table></div>
      <div style="overflow-x:auto"><table class="mk-t"><thead><tr><th>هدف التحويل</th><th>النوع</th><th>العدد</th></tr></thead><tbody>${acts||'<tr><td colspan="3">—</td></tr>'}</tbody></table></div>
    </div>
    ${terms||cats?`<div style="overflow-x:auto;margin-top:16px"><table class="mk-t"><thead><tr><th>${terms?'عبارات البحث الفعليّة':'فئات البحث (الأداء الأقصى)'}</th><th>نقرات</th><th>الصرف</th><th>تحويلات</th></tr></thead><tbody>${terms||cats}</tbody></table></div>`:''}
    ${(g.script_errors||[]).length?`<div class="hu-note mk-warn" style="margin-top:10px">أجزاء لم يقرأها السكربت: ${esc(g.script_errors.join(' · '))}</div>`:''}
  </div>`;
}

function hrMktReport(){
  const r=HR_MKT_REPORT,c=(HR_MKT_DATA&&HR_MKT_DATA.config)||{};
  const runBtn=`<button id="mkRun" class="btn btn-gold btn-sm" onclick="hrMktRun()" ${!c.ready||c.running||(r&&r.status==='running')?'disabled':''}><i data-lucide="sparkles"></i> شغّل الوكيل الآن</button>`;
  const head=`<div class="hu-h"><h4><i data-lucide="brain"></i> تقرير الوكيل</h4>${runBtn}</div>`;
  if(!r)return `<div class="hu-card" id="mkReport" style="margin-bottom:16px">${head}<div class="hu-note">${c.ready?'لا تقارير بعد. شغّل الوكيل لأوّل تقرير (دقيقة إلى ثلاث دقائق).':'اربط مفتاح الذكاء الاصطناعيّ في الخادم أوّلاً، ثمّ شغّله من هنا.'}</div></div>`;
  const meta=`<div class="hu-note" style="margin-bottom:14px">${esc(new Date(r.createdAt).toLocaleString('ar-SA-u-ca-gregory',{dateStyle:'medium',timeStyle:'short'}))} · ${r.trigger==='weekly'?'أسبوعيّ تلقائيّ':'يدويّ'} · آخر ${HR_ar(r.periodDays)} يوماً · <span style="direction:ltr;display:inline-block">${esc(r.model)}</span>${r.durationMs?` · ${HR_ar(Math.round(r.durationMs/1000))} ث`:''}${r.inputTokens?` · ${HR_ar(r.inputTokens)}+${HR_ar(r.outputTokens||0)} رمز`:''}</div>`;
  if(r.status==='running')return `<div class="hu-card" id="mkReport" style="margin-bottom:16px">${head}${meta}<div class="hu-note"><i data-lucide="loader-2"></i> الوكيل يحلّل البيانات الآن… تتحدّث الصفحة وحدها عند الانتهاء.</div></div>`;
  if(r.status==='error')return `<div class="hu-card" id="mkReport" style="margin-bottom:16px">${head}${meta}<div class="mk-bad" style="font-weight:700">فشل التشغيل: ${esc(r.error||'')}</div></div>`;
  const o=r.output||{};
  const sev=s=>{const v=HR_MKT_SEV[s]||HR_MKT_SEV.low;return `<span style="color:${v[0]};font-weight:900">${v[1]}</span>`;};
  const pName=p=>`${esc(p)} · ${esc(HR_MKT_PERSONA[p]||'')}`;
  const diag=(o.diagnosis||[]).map(d=>`<li>${sev(d.severity)} — <b>${esc(d.finding)}</b><div class="mk-m">${esc(d.evidence)}</div></li>`).join('');
  const acts=(o.google_ads_actions||[]).slice().sort((a,b)=>a.priority-b.priority).map(a=>`<li><b>${a.priority===1?'اليوم':a.priority===2?'هذا الأسبوع':'لاحقاً'}: ${esc(a.action)}</b><div class="mk-m">أين: ${esc(a.where)}</div><div class="mk-m">لماذا: ${esc(a.why)}</div><div class="mk-m">الأثر: ${esc(a.expected_effect)}</div></li>`).join('');
  const ads=(o.ad_copy||[]).map(a=>`<div class="mk-ad"><div class="f">${pName(a.persona)}</div><div class="h">${esc(a.headline)}</div><div class="d">${esc(a.long_headline)}</div><div class="d">${esc(a.description)}</div><div class="f" style="direction:ltr;text-align:right">${esc(a.landing_path)}</div><div class="f">${esc(a.rationale)}</div><button class="btn btn-ghost btn-sm" onclick='hrMktCopy(this,${hrMktArg([a.headline,a.long_headline,a.description].join("\n"))})'><i data-lucide="copy"></i> نسخ</button></div>`).join('');
  const themes=(o.search_themes||[]).map(t=>t.theme);
  const themesHtml=(o.search_themes||[]).map(t=>`<li><b>${esc(t.theme)}</b> <span class="hu-note">— ${pName(t.persona)}</span><div class="mk-m">${esc(t.rationale)}</div></li>`).join('');
  const neg=o.negative_keywords||[];
  const sb=o.schedule_and_budget||{};
  const bids=(sb.bid_adjustments||[]).map(b=>`<tr><td>${esc(b.when)}</td><td class="n" style="color:${b.change_pct>=0?'#22c55e':'#f87171'};font-weight:900"><span dir="ltr">${b.change_pct>0?'+':''}${HR_ar(b.change_pct)}٪</span></td><td>${esc(b.why)}</td></tr>`).join('');
  const tweaks=(o.product_tweaks||[]).map(t=>`<li><b>${esc(t.tool)}</b>: ${esc(t.change)}<div class="mk-m">المشكلة: ${esc(t.problem)}</div><div class="mk-m">نقيسه بـ: ${esc(t.metric_to_watch)}</div></li>`).join('');
  const kpis=(o.next_week_kpis||[]).map(k=>`<tr><td>${esc(k.metric)}</td><td>${esc(k.current)}</td><td style="font-weight:900">${esc(k.target)}</td></tr>`).join('');
  const gaps=(o.measurement_gaps||[]).map(g=>`<li>${esc(g)}</li>`).join('');
  return `<div class="hu-card" id="mkReport" style="margin-bottom:16px">${head}${meta}
    <div style="font-size:15.5px;line-height:1.9;font-weight:700;margin-bottom:18px">${esc(o.summary||'')}</div>
    <div class="mk-2">
      <div><div class="hu-lbl" style="margin-bottom:10px"><i data-lucide="list-checks"></i> ماذا تفعل في Google Ads</div><ol class="mk-list">${acts||'<li>—</li>'}</ol></div>
      <div><div class="hu-lbl" style="margin-bottom:10px"><i data-lucide="stethoscope"></i> التشخيص</div><ul class="mk-list">${diag||'<li>—</li>'}</ul></div>
    </div>
    ${ads?`<div class="hu-lbl" style="margin:6px 0 10px"><i data-lucide="pen-line"></i> نصوص إعلانيّة (كلّ نصّ لشخصيّة واحدة)</div><div class="mk-ads" style="margin-bottom:16px">${ads}</div>`:''}
    <div class="mk-2">
      <div><div class="hu-h" style="margin-bottom:10px"><div class="hu-lbl"><i data-lucide="search"></i> موضوعات البحث</div>${themes.length?`<button class="btn btn-ghost btn-sm" onclick='hrMktCopy(this,${hrMktArg(themes.join("\n"))})'><i data-lucide="copy"></i> نسخ الكلّ</button>`:''}</div><ul class="mk-list">${themesHtml||'<li>—</li>'}</ul></div>
      <div><div class="hu-h" style="margin-bottom:10px"><div class="hu-lbl"><i data-lucide="ban"></i> كلمات سلبيّة</div>${neg.length?`<button class="btn btn-ghost btn-sm" onclick='hrMktCopy(this,${hrMktArg(neg.join("\n"))})'><i data-lucide="copy"></i> نسخ الكلّ</button>`:''}</div><div class="mk-words">${neg.length?neg.map(esc).join('، '):'—'}</div>
        <div class="hu-lbl" style="margin:18px 0 8px"><i data-lucide="clock"></i> الجدولة والميزانيّة</div><div class="hu-note" style="font-size:13.5px">${esc(sb.advice||'')}</div>
        ${bids?`<table class="mk-t" style="margin-top:10px"><tbody>${bids}</tbody></table>`:''}</div>
    </div>
    <div class="mk-2" style="margin-bottom:0">
      <div><div class="hu-lbl" style="margin-bottom:10px"><i data-lucide="wrench"></i> تعديلات في المنتج</div><ul class="mk-list">${tweaks||'<li>—</li>'}</ul>
        ${gaps?`<div class="hu-lbl" style="margin:18px 0 10px"><i data-lucide="eye-off"></i> نواقص القياس</div><ul class="mk-list">${gaps}</ul>`:''}</div>
      <div><div class="hu-lbl" style="margin-bottom:10px"><i data-lucide="target"></i> مؤشّرات الأسبوع القادم</div>${kpis?`<table class="mk-t"><thead><tr><th>المقياس</th><th>الآن</th><th>الهدف</th></tr></thead><tbody>${kpis}</tbody></table>`:'—'}</div>
    </div>
  </div>`;
}

function hrMktHistory(){
  const h=HR_MKT_HISTORY||[];
  if(h.length<2)return '';
  const cur=HR_MKT_REPORT&&HR_MKT_REPORT.id;
  return `<div class="hu-card mk-hist" style="margin-bottom:16px"><div class="hu-h"><h4><i data-lucide="history"></i> التقارير السابقة</h4></div>
    ${h.map(r=>`<button class="${r.id===cur?'on':''}" onclick="hrMktOpen(${Number(r.id)})"><b>${esc(new Date(r.createdAt).toLocaleDateString('ar-SA-u-ca-gregory',{dateStyle:'medium'}))}</b> · ${r.trigger==='weekly'?'أسبوعيّ':'يدويّ'} · ${r.status==='ok'?'':r.status==='running'?'<span class="mk-warn">قيد التشغيل</span> · ':'<span class="mk-bad">فشل</span> · '}<span class="hu-note">${esc((r.summary||r.error||'').slice(0,140))}</span></button>`).join('')}
  </div>`;
}

function hrMktRender(){
  const d=HR_MKT_DATA;if(!d)return;
  const i=d.input||{};
  const seg=`<div class="hu-seg">${[7,14,30,90].map(x=>`<button class="${HR_MKT_DAYS===x?'on':''}" onclick="hrMktSetDays(${x})">${hruN(x)} يوم</button>`).join('')}</div>`;
  const gaps=(i.data_gaps||[]);
  hrSet(`<style>${HRU_CSS}${HR_MKT_CSS}</style><div class="hru">
    <div class="hu-top"><div><h3><i data-lucide="target" style="width:30px;height:30px"></i> التسويق والوكيل</h3>
      <p>من نقرة الإعلان إلى التسجيل والاشتراك، وتقرير الوكيل بما تغيّره في Google Ads والمنتج.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${seg}
        <button class="btn btn-ghost btn-sm" onclick="hrMktToggleJson()"><i data-lucide="braces"></i> مدخل الوكيل</button></div></div>
    <div id="mkJson" class="hu-card" style="margin-bottom:16px" hidden><div class="hu-h"><h4>ما يراه الوكيل (أرقام مجمّعة، بلا أسماء ولا بريد)</h4><button class="btn btn-ghost btn-sm" onclick="hrMktCopyJson(this)"><i data-lucide="copy"></i> نسخ</button></div><pre class="mk-json">${esc(JSON.stringify(i,null,2))}</pre></div>
    ${hrMktStatus(d)}
    ${gaps.length?`<div class="badge-note" style="margin-bottom:16px"><i data-lucide="alert-triangle"></i><div><b>نواقص في البيانات:</b><ul style="margin:6px 0 0;padding-inline-start:18px">${gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div></div>`:''}
    ${hrMktKpis(i)}
    ${hrMktReport()}
    ${hrMktFunnel(i)}
    ${hrMktAds(i)}
    ${hrMktHistory()}
  </div>`);
}
