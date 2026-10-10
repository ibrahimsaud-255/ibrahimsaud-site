/*
 * 02-shell.js — الغلاف: التطبيقات والموجِّه وشبكة الإطلاق وسطح المكتب
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== APPS / ROUTER ===== */
const APPS=[
  {id:'huroof',name:'حروف ودروس',icon:'graduation-cap'},
  {id:'dashboards',name:'لوحات البيانات',icon:'layout-dashboard'},
  {id:'sales',name:'المبيعات',icon:'trending-up'},
  {id:'partners',name:'الشركات',icon:'building-2'},  // كان «الشركاء والعمولات» — صار قسماً داخل «الشركات» (المعرّف partners باقٍ للبيانات)
  {id:'invoicing',name:'الفوترة',icon:'receipt-text'},
  {id:'quotedesign',name:'تصميم عروض الأسعار',icon:'palette'},
  {id:'products',name:'المنتجات',icon:'package'},
  {id:'pos',name:'الكاشير',icon:'scan-barcode'},
  {id:'subs',name:'الاشتراكات والمصروفات',icon:'credit-card'},
  {id:'accounting',name:'المحاسبة',icon:'calculator'},
  {id:'habits',name:'العادات',icon:'repeat'},
  {id:'pipeline',name:'مسار العملاء',icon:'git-branch'},
  {id:'contacts',name:'العملاء',icon:'contact'},
  {id:'suppliers',name:'الموردون',icon:'truck'},
  {id:'appointments',name:'المواعيد',icon:'calendar-clock'},
  {id:'calendar',name:'التقويم',icon:'calendar-days'},
  {id:'projects',name:'المشروع',icon:'clapperboard'},
  {id:'boards',name:'الخرائط الذهنية',icon:'git-fork'},
  {id:'sitework',name:'الموقع الإلكتروني',icon:'globe'},
  {id:'blog',name:'المدونة',icon:'newspaper'},
  {id:'newsletter',name:'القائمة البريدية',icon:'mail'},
  {id:'ideas',name:'بنك الأفكار',icon:'lightbulb'},
];
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const RENDER={home:renderHome,huroof:renderHuroof,desktop:renderDeskto */
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const NAV=[{id:'home',name:'الرئيسية',icon:'home'},{id:'desktop',name: */

/* ===== LAUNCHPAD (شبكة التطبيقات + خلفية لكل أيقونة) ===== */
const LAUNCH=[
  {id:'huroof',name:'حروف ودروس',icon:'graduation-cap',c:'#f5a623,#d97706'},
  {id:'dashboards',name:'لوحات البيانات',icon:'layout-dashboard',c:'#3b82f6,#2563eb'},
  {id:'sales',name:'المبيعات',icon:'trending-up',c:'#22c55e,#16a34a'},
  {id:'partners',name:'الشركات',icon:'building-2',c:'#0ea5e9,#1e3a8a'},
  {id:'invoicing',name:'الفوترة',icon:'receipt-text',c:'#f5a623,#d97706'},
  {id:'quotedesign',name:'تصميم عروض الأسعار',icon:'palette',c:'#d946ef,#a21caf'},
  {id:'products',name:'المنتجات',icon:'package',c:'#14b8a6,#0d9488'},
  {id:'pos',name:'الكاشير',icon:'scan-barcode',c:'#22c55e,#15803d'},
  {id:'subs',name:'الاشتراكات',icon:'credit-card',c:'#ec4899,#db2777'},
  {id:'accounting',name:'المحاسبة',icon:'calculator',c:'#10b981,#047857'},
  {id:'habits',name:'العادات',icon:'repeat',c:'#f59e0b,#b45309'},
  {id:'pipeline',name:'مسار العملاء',icon:'git-branch',c:'#14b8a6,#0d9488'},
  {id:'contacts',name:'العملاء',icon:'contact',c:'#0ea5e9,#0284c7'},
  {id:'suppliers',name:'الموردون',icon:'truck',c:'#f59e0b,#b45309'},
  {id:'appointments',name:'المواعيد',icon:'calendar-clock',c:'#a855f7,#7c3aed'},
  {id:'calendar',name:'التقويم',icon:'calendar-days',c:'#ef4444,#dc2626'},
  {id:'projects',name:'المشروع',icon:'clapperboard',c:'#f43f5e,#e11d48'},
  {id:'boards',name:'الخرائط الذهنية',icon:'git-fork',c:'#6366f1,#4338ca'},
  {id:'sitework',name:'الموقع الإلكتروني',icon:'globe',c:'#e11d48,#9f1239'},
  {id:'blog',name:'المدونة',icon:'newspaper',c:'#0ea5e9,#0369a1'},
  {id:'newsletter',name:'القائمة البريدية',icon:'mail',c:'#f59e0b,#d97706'},
  {id:'ideas',name:'بنك الأفكار',icon:'lightbulb',c:'#f59e0b,#b45309'},
  {id:'team',name:'الفريق',icon:'users',c:'#64748b,#475569'},
];
function hexA(h,al){h=String(h).trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${al})`}
function gGrad(c,al){return c.split(',').map(x=>hexA(x,al)).join(',')}
function lpTile(a){
  const inner=`<span class="lp-ic" style="background:linear-gradient(140deg,${gGrad(a.c,.82)})"><i data-lucide="${a.icon}"></i></span><span class="lp-name">${esc(a.name)}</span>`;
  return a.href?`<a class="lp-tile" href="${a.href}"${a.href.startsWith('http')?' target="_blank" rel="noopener"':''}>${inner}</a>`
              :`<button class="lp-tile" type="button" onclick="go('${a.id}')">${inner}</button>`;
}
/* ===== «تحت التجربة» — حاوية التطبيقات قيد التجربة/غير الشخصية ===== */
const LAB_DEFAULT=[];  // «تحت التجربة» و«مساحة العمل» أُزيلا من الواجهة (الكود محفوظ أرشيفاً)
function labApps(){if(!Array.isArray(S.labApps))S.labApps=LAB_DEFAULT.slice();return S.labApps}
function inLab(id){return labApps().includes(id)}
function looseLaunch(){return LAUNCH.filter(a=>!inLab(a.id))}

function launchpadHTML(){
  return `<div class="lp-wrap">
    <div class="lp-head"><h2><i data-lucide="layout-grid"></i> التطبيقات</h2>
      <button class="btn btn-ghost btn-sm" onclick="wallpaperModal()"><i data-lucide="image"></i> تخصيص الخلفية</button></div>
    <div class="lp-grid">${looseLaunch().map(lpTile).join('')}</div>
  </div>`;
}
/* ===== سطح المكتب: صفحة التطبيقات المستقلة (هوية Liquid Glass) ===== */
function renderDesktop(){
  document.getElementById('main').innerHTML=`
    <div class="desk">
      <div class="desk-head">
        <div><h1>المكتب</h1><p>كل تطبيقات النظام في مكان واحد — اختر تطبيقاً للدخول إليه.</p></div>
        <button class="glass-btn" onclick="wallpaperModal()"><i data-lucide="image"></i> تخصيص الخلفية</button>
      </div>
      <div class="lp-grid desk-grid">${looseLaunch().map(lpTile).join('')}</div>
    </div>`;
  applyWallpaper();refreshIcons();
}
/* ===== صفحة «تحت التجربة» — تُفتح بلا تسجيل دخول جديد ===== */
function renderLab(){
  const ids=labApps();
  const meta=id=>LAUNCH.find(a=>a.id===id)||{id,name:id,icon:'box',c:'#64748b,#475569'};
  const tiles=ids.map(id=>lpTile(meta(id))).join('')||'<p style="color:var(--muted)">لا توجد تطبيقات هنا بعد — أضِف من الإدارة بالأسفل.</p>';
  // إدارة العضوية: كل تطبيق يمكن نقله بين «تحت التجربة» و«المكتب»
  const manageable=LAUNCH.filter(a=>a.id!=='lab');
  const rows=manageable.map(a=>{const on=inLab(a.id);return `
    <button class="btn ${on?'btn-gold':'btn-ghost'} btn-sm" style="justify-content:flex-start" onclick="labToggle('${a.id}')">
      <i data-lucide="${on?'check-circle':'circle'}"></i> ${esc(a.name)}
    </button>`}).join('');
  document.getElementById('main').innerHTML=`
    <div class="desk">
      <div class="desk-head">
        <div><h1><i data-lucide="flask-conical" style="width:26px;height:26px;vertical-align:-4px"></i> تحت التجربة</h1>
          <p>نماذج وتطبيقات ما زالت قيد التجربة، أو لأعمال غير شخصية — مجمّعة هنا. الوصول متاح مباشرةً دون تسجيل دخول جديد.</p></div>
        <button class="glass-btn" onclick="go('desktop')"><i data-lucide="layout-grid"></i> المكتب</button>
      </div>
      <div class="lp-grid desk-grid" style="margin-bottom:26px">${tiles}</div>
      <div class="card" style="max-width:760px;margin-inline:auto">
        <h3><i data-lucide="sliders-horizontal"></i> إدارة التطبيقات — فعّل ما تريد إظهاره داخل «تحت التجربة»</h3>
        <div style="opacity:.7;font-size:13px;margin-bottom:10px">الذهبي = داخل «تحت التجربة». الرمادي = يظهر كتطبيق مستقل في المكتب.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px">${rows}</div>
      </div>
    </div>`;
  applyWallpaper();refreshIcons();
}
function labToggle(id){const l=labApps();const i=l.indexOf(id);if(i>-1)l.splice(i,1);else l.push(id);save();renderNav();renderLab()}
