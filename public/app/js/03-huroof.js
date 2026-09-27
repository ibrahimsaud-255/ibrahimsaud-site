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
const HR_TABS=[
  {id:'overview',name:'نظرة عامة',icon:'layout-dashboard'},
  {id:'users',name:'المستخدمون',icon:'users'},
  {id:'subscribers',name:'المشتركون',icon:'credit-card'},
  {id:'manage',name:'التفعيل والأكواد',icon:'user-check'},
  {id:'teachers',name:'المعلمون',icon:'graduation-cap'},
  {id:'tquestions',name:'أسئلة المعلمين',icon:'inbox'},
  {id:'tickets',name:'التذاكر',icon:'life-buoy'},
  {id:'waitlist',name:'قائمة الانتظار',icon:'clock'},
  {id:'content',name:'المحتوى',icon:'book-open'},
  {id:'questions',name:'الأسئلة',icon:'help-circle',soon:true},
  {id:'pdflib',name:'مكتبة PDF',icon:'folder',soon:true},
  {id:'extractor',name:'مستخرج الأسئلة',icon:'file-search',soon:true},
  {id:'nafs',name:'نافس',icon:'clipboard-list',soon:true},
  {id:'covers',name:'الأغلفة',icon:'image',soon:true},
  {id:'blog',name:'المدوّنة',icon:'newspaper',soon:true},
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

/* ═══════════ نظرة عامة (المؤشّرات) ═══════════ */
let OV=null,OV_ERR=null;
function hrViewOverview(){OV=null;OV_ERR=null;hrSet(hrLoading());ovLoad();}
async function ovLoad(){try{const [s,x]=await Promise.all([hrApi('admin/stats').catch(()=>({})),hrApi('admin/stats/extended').catch(()=>({}))]);OV=Object.assign({},s,x);OV_ERR=null;}catch(e){OV_ERR=e.message||'خطأ';}if(hrActive('overview'))ovRender();}

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
function ovPlatformLabel(k){return {manual:'منحة يدويّة',telr:'Telr (بطاقة)',apple:'متجر آبل',google:'متجر جوجل',organization:'مؤسّسة/مدرسة',stripe:'Stripe'}[k]||k}

function ovRender(){
  if(OV_ERR){hrSet(hrErr(OV_ERR,'ovLoad()'));return}
  const o=OV||{};
  const rb=o.roleBreakdown||{student:o.totalStudents||0,teacher:o.totalTeachers||0,parent:o.totalParents||0,admin:o.totalAdmins||0};
  const totalUsers=Number(o.totalUsers||((rb.student||0)+(rb.teacher||0)+(rb.parent||0)+(rb.admin||0)));
  const activeSubs=Number(o.activeSubscribers||0);
  const conv=totalUsers?Math.round(activeSubs/totalUsers*1000)/10:0;
  const reg7=Number(o.signups7d||0);
  const reg30=Number(o.signups30d||(o.recentRegistrations||[]).reduce((a,r)=>a+Number(r.count||0),0));

  /* أربعة مؤشّرات رئيسة يقود اتّخاذَ القرار: إجمالي، مشترك، معدّل التحويل، جديد ٧ يوم */
  const hero=[
    ovHero('users','المستخدمون المسجّلون',HR_ar(totalUsers),'#0ea5e9',`+${HR_ar(reg30)} خلال ٣٠ يوماً`,`hrShowTab('users')`),
    ovHero('badge-check','مشترك نشط',HR_ar(activeSubs),'#22c55e',`معدّل التحويل ${conv}%`,`hrShowTab('subscribers')`),
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
  const platColors={manual:'#94a3b8',telr:'#22c55e',apple:'#0f172a',google:'#3b82f6',organization:'#f59e0b',stripe:'#8b5cf6'};
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
let SUBS=null,SUBS_ERR=null,SUBS_F='all';
function hrViewSubscribers(){SUBS=null;SUBS_ERR=null;hrSet(hrLoading());subsLoad();}
function subsFilter(f){SUBS_F=f;SUBS=null;hrSet(hrLoading());subsLoad();}
async function subsLoad(){try{const r=await hrApi('admin/subscribers?status='+encodeURIComponent(SUBS_F));SUBS=r;SUBS_ERR=null;}catch(e){SUBS_ERR=e.message||'خطأ';}if(hrActive('subscribers'))subsRender();}
function subsStatusChip(st){const m={active:'#22c55e',expired:'#f59e0b',cancelled:'#ef4444'};const l={active:'نشط',expired:'منتهٍ',cancelled:'ملغى'};return hrChip(l[st]||st,m[st]||'#64748b');}
function subsRender(){
  if(SUBS_ERR){hrSet(hrErr(SUBS_ERR,'subsLoad()'));return}
  const st=(SUBS&&SUBS.stats)||{},rows=(SUBS&&SUBS.entries)||[];
  const tabs=[['all','الكل',st.total],['active','النشطون',st.active],['expired','المنتهون',st.expired],['cancelled','الملغاة',st.cancelled]]
    .map(([k,l,n])=>`<button class="btn btn-sm ${SUBS_F===k?'btn-gold':'btn-ghost'}" onclick="subsFilter('${k}')">${l}${n!=null?` (${HR_ar(n)})`:''}</button>`).join('');
  const body=rows.length?`<div style="overflow:auto"><table class="hr-table"><thead><tr><th>المشترك</th><th>المنصّة</th><th>الحالة</th><th>الخطة</th><th>ينتهي</th><th>إجراءات</th></tr></thead><tbody>
    ${rows.map(s=>`<tr>
      <td><b>${esc(s.displayName||'—')}</b><div style="font-size:11px;color:var(--muted)" dir="ltr">${esc(s.email||'')}</div></td>
      <td>${esc(s.platform||'—')}</td>
      <td>${subsStatusChip(s.status)}</td>
      <td>${esc(s.planId||'—')}</td>
      <td>${hrDate(s.currentPeriodEnd)}</td>
      <td><div style="display:flex;gap:6px;flex-wrap:wrap">
        <select class="field" style="width:auto;padding:5px 8px" onchange="subsSetStatus('${esc(s.id)}',this.value)">
          <option value="">تغيير…</option><option value="active">تفعيل</option><option value="expired">إنهاء</option><option value="cancelled">إلغاء</option></select>
        <button class="btn btn-ghost btn-sm" onclick="subsOrders('${esc(s.userId)}','${esc(s.displayName||s.email||'')}')"><i data-lucide="receipt"></i> الطلبات</button>
      </div></td></tr>`).join('')}</tbody></table></div>`
    :`<div class="card" style="text-align:center;color:var(--muted);padding:26px">لا مشتركين في هذا التصنيف.</div>`;
  hrSet(`${hrHead('المشتركون','credit-card',
    `<button class="btn btn-gold btn-sm" onclick="hrGrantOpen()"><i data-lucide="gift"></i> منح اشتراك مجاني</button>
     <button class="btn btn-ghost btn-sm" onclick="subsLoad()"><i data-lucide="refresh-cw"></i> تحديث</button>`)}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${tabs}</div>${body}`);
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
async function setLoad(){try{const r=await hrApi('admin/settings');SET=r.settings||r||{};SET_ERR=null;}catch(e){SET_ERR=e.message||'خطأ';}if(hrActive('settings'))setRender();}
function setRender(){
  if(SET_ERR){hrSet(hrErr(SET_ERR,'setLoad()'));return}
  const s=SET||{};
  hrSet(`${hrHead('إعدادات الموقع','settings','')}
    <div class="card" style="max-width:520px">
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">بيانات التواصل الظاهرة في تذييل الموقع وصفحة الدعم على huroofduroos.com.</div>
      ${hrLbl('البريد الإلكترونيّ')}<input class="field" id="setEmail" dir="ltr" value="${esc(s.contact_email||'')}" style="margin-bottom:12px">
      ${hrLbl('واتساب')}<input class="field" id="setWa" dir="ltr" value="${esc(s.contact_whatsapp||'')}" style="margin-bottom:12px">
      ${hrLbl('الهاتف')}<input class="field" id="setPhone" dir="ltr" value="${esc(s.contact_phone||'')}" style="margin-bottom:14px">
      <div style="display:flex;gap:10px;align-items:center"><button class="btn btn-gold" onclick="setSave()"><i data-lucide="save"></i> حفظ</button><span id="setMsg" style="font-size:13px;font-weight:700"></span></div>
    </div>`);
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
