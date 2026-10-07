/*
 * 01-core.js — النواة: Supabase والحالة والمصادقة والفريق وعرض المستقلّ
 * ─────────────────────────────────────────────────────────────────────────
 * جزء من لوحة ibrahimsaud.com/app بعد تفكيك الملفّ الواحد (index.html) إلى
 * سكربتات كلاسيكيّة تُحمَّل بالترتيب الرقميّ من index.html.
 * ⚠️ نطاقٌ عامّ واحد: الدوالّ هنا عامّة عمداً (مئات onclick="..." تناديها
 *    بالاسم) — لا تحوّلها إلى وحدات ES ولا تغلّفها بدالّة.
 * ⚠️ هذا الملفّ تعريفات فقط: أيّ جملة تنفّذ شيئاً عند التحميل مكانها
 *    99-boot.js (بترتيبها الأصليّ) — وإلا نادت دالّةً في ملفّ لم يُحمَّل بعد.
 */
/* ===== SUPABASE (cloud) ===== */
const SUPA_URL='https://rrerwhhxrjyzmnnjsfev.supabase.co';
const SUPA_KEY='sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13';
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY); */
let STATE_ID=null, USER=null, saveTimer=null;

/* ===== STATE ===== */
const KEY='ibsaud_erp_v1';
const def={
  settings:{brand:'مؤسسة حروف ودروس',owner:'إبراهيم سعود',email:'ibrahimsaud25@gmail.com',phone:'966504895213',
    currency:'ر.س',password:'admin',logo:'',invPrefix:'INV-',salePrefix:'S',salesperson:'إبراهيم سعود',terms:'شكراً لتعاملكم. تُسدَّد الفاتورة خلال 14 يوماً.',
    // الحساب البنكي الأساسي للمؤسسة (افتراضي — يظهر في كل عروض الأسعار والفواتير)
    bankName:'البنك الأهلي السعودي',iban:'SA8810000001400036240910',accName:'مؤسسة حروف و دروس',bankLogo:'',
    // مكتبة قوالب شروط عرض السعر — تُختار بضغطة داخل نموذج العرض، وتُلصَق مع أرقام محدَّثة تلقائياً.
    // الرموز المتاحة داخل النص:
    //   {DEPOSIT_PCT}     نسبة العربون %
    //   {DEPOSIT_AMOUNT}  قيمة العربون (تُعاد الحسبة لحظياً عند تغيّر الإجمالي)
    //   {REMAINING}       المتبقي بعد العربون
    //   {TOTAL}           إجمالي عرض السعر
    //   {DELIVERY_DAYS}   مدة التسليم بالأيام (من إعدادات القالب)
    //   {REVISIONS}       عدد جولات التعديل المجانية
    //   {VALIDITY_DAYS}   صلاحية العرض بالأيام
    //   {BRAND}           اسم المؤسسة
    quoteDefaults:{depositPct:50,deliveryDays:3,revisions:2,validityDays:14,defaultTemplateId:'video_ad'},
    // ملفات هويّة الطباعة — كل عرض/فاتورة يختار براند فيتغيّر التصميم الكامل (غلاف، ألوان، نقش، توقيع)
    // official = البيانات الرسمية للمؤسسة الأم التي تظهر أسفل الغلاف مهما كان البراند المختار
    brandProfiles:[
      {id:'ibrahim',name:'إبراهيم سعود',tagline:'تقنية أعمال · بودكاست · فيديو إعلاني',logo:'/logo_ibrahimsaud.png',accent:'#f5a623',accent2:'#d97706',ink:'#0a0a0b',pattern:'glow',coverStyle:'classic',showPattern:true,showQR:true,titleSize:82,org:{}},
      {id:'huroof',name:'مؤسسة حروف ودروس',tagline:'منصّة تعليمية · معلّم · أسئلة عالية الجودة',logo:'',accent:'#f5a623',accent2:'#d97706',ink:'#111827',pattern:'dots',coverStyle:'minimal',showPattern:true,showQR:true,titleSize:82,org:{}},
      {id:'minwal',name:'مِنوال',tagline:'مواقع وأنظمة تقنية للأعمال',logo:'',accent:'#0ea5e9',accent2:'#0369a1',ink:'#0f172a',pattern:'lines',coverStyle:'sidebar',showPattern:true,showQR:true,titleSize:82,org:{}},
    ],
    defaultBrandId:'ibrahim',
    official:{brand:'مؤسسة حروف ودروس',owner:'إبراهيم سعود',email:'ibrahimsaud25@gmail.com',phone:'966504895213',vat:'',cr:'',iban:'',address:''},
    quoteTemplates:[
      {id:'video_ad',name:'فيديو إعلاني قصير',depositPct:50,deliveryDays:3,revisions:2,validityDays:14,
        template:'📜 الشروط والأحكام:\n\n1) آلية الدفع: يُسدَّد {DEPOSIT_PCT}% ({DEPOSIT_AMOUNT}) مقدَّماً عند التعميد لبدء العمل، والمتبقي {REMAINING} فور تسليم الفيديو النهائي وقبل نقل الملفات.\n\n2) مدة التنفيذ: {DELIVERY_DAYS} أيام عمل من تاريخ استلام العربون واعتماد السكربت.\n\n3) نطاق العمل: يشمل ابتكار الفكرة، كتابة السكربت، التصوير الاحترافي، والمونتاج (مؤثرات بصرية وصوتية وضبط ألوان)، وتسليم الفيديو بالطول والمقاس المناسب للمنصة المتفق عليها (تيك توك / ريلز / سناب / يوتيوب شورتس).\n\n4) جولات التعديل: {REVISIONS} جولتان مجانيتان بعد التسليم — أي تعديل إضافي يُحتسب بسعر مستقل.\n\n5) لا يشمل العرض: أجور ممثلين خارجيين، حقوق موسيقى مدفوعة الترخيص، مواقع تصوير خاصة، أو رسوم تراخيص طرف ثالث — تُضاف على العميل عند طلبها.\n\n6) الملكية الفكرية: الملفات المصدرية (المشاريع الخام) تبقى لدى {BRAND}. يستلم العميل النسخة النهائية بجودتها الأصلية، وتنتقل حقوق النشر والاستخدام كاملةً للعميل بعد سداد كامل المبلغ.\n\n7) صلاحية العرض: {VALIDITY_DAYS} يوماً من تاريخ إصداره.'},
      {id:'podcast',name:'حلقة بودكاست',depositPct:50,deliveryDays:10,revisions:2,validityDays:14,
        template:'📜 الشروط والأحكام:\n\n1) آلية الدفع: يُسدَّد {DEPOSIT_PCT}% ({DEPOSIT_AMOUNT}) مقدَّماً عند التعميد لاعتماد موعد التصوير، والمتبقي {REMAINING} فور تسليم الحلقة النهائية وجميع المقاطع.\n\n2) مدة التسليم: تُسلَّم الحلقة الرئيسية والمقاطع القصيرة خلال {DELIVERY_DAYS} أيام عمل من تاريخ الانتهاء من جلسة التصوير.\n\n3) نطاق العمل: تصوير احترافي بكاميرات متعدّدة، مونتاج الحلقة الكاملة، إنتاج (١٠) مقاطع قصيرة عمودية جاهزة للنشر، بالإضافة إلى تصاميم Cover وThumbnails.\n\n4) جولات التعديل: {REVISIONS} جولتان مجانيتان على مونتاج الحلقة والمقاطع القصيرة قبل الاعتماد النهائي.\n\n5) تسليم الملفات: تُسلَّم الملفات النهائية عبر رابط سحابي آمن بجودتها الأصلية، وحقوق النشر كاملةً للعميل بعد سداد كامل المبلغ.\n\n6) لا يشمل العرض: استوديو خارجي أو تصوير خارج الرياض، ضيوف الحلقة أو أجورهم، حقوق موسيقى مدفوعة الترخيص.\n\n7) صلاحية العرض: {VALIDITY_DAYS} يوماً من تاريخ إصداره.'},
      {id:'website',name:'موقع / منصّة إلكترونية',depositPct:50,deliveryDays:21,revisions:2,validityDays:14,
        template:'📜 الشروط والأحكام:\n\n1) آلية الدفع: يُسدَّد {DEPOSIT_PCT}% ({DEPOSIT_AMOUNT}) مقدَّماً عند التعميد للبدء في تصميم الواجهات، والمتبقي {REMAINING} عند تسليم المنصّة بالشكل النهائي وقبل نقل ملكية الكود والاستضافة.\n\n2) مدة التنفيذ: {DELIVERY_DAYS} يوم عمل تقريبياً — تتفاوت بحسب سرعة اعتماد الواجهات من الجهة.\n\n3) الاستضافة والنطاق: يشمل هذا العرض تكلفة حجز الاستضافة واسم النطاق (Domain) للسنة الأولى فقط، وتتحمّل الجهة رسوم التجديد السنوية للسنوات القادمة.\n\n4) الصلاحيات وإدارة النظام: يتضمّن العمل بناء لوحة التحكم وتوزيع الصلاحيات الأساسية المتفق عليها. أي أدوار أو صلاحيات معقّدة تُطلب لاحقاً تُسعَّر بشكل منفصل.\n\n5) الملكية الفكرية ونقل الكود: بمجرّد سداد الدفعة الأخيرة تنتقل ملكية الكود المصدري رسمياً إلى حساب الجهة على GitHub مع تسليم كافة بيانات الوصول لضمان الاستقلالية التامّة.\n\n6) جولات التعديل: {REVISIONS} جولتان مجانيتان على تصميم الواجهات قبل بدء التطوير، وجولة تعديلات وظيفية بعد التسليم.\n\n7) لا يشمل العرض: التسويق، إدارة المحتوى بعد الإطلاق، أو التطوير الإضافي بعد الاستلام — إلا باتفاق مستقل.\n\n8) صلاحية العرض: {VALIDITY_DAYS} يوماً من تاريخ إصداره.'},
      {id:'design',name:'تصميم / هوية بصرية',depositPct:50,deliveryDays:7,revisions:3,validityDays:14,
        template:'📜 الشروط والأحكام:\n\n1) آلية الدفع: يُسدَّد {DEPOSIT_PCT}% ({DEPOSIT_AMOUNT}) مقدَّماً عند التعميد، والمتبقي {REMAINING} عند تسليم الملفات النهائية.\n\n2) مدة التسليم: {DELIVERY_DAYS} أيام عمل من تاريخ اعتماد الاتجاه الإبداعي (Direction).\n\n3) جولات التعديل: {REVISIONS} جولات تعديل مجانية على الاتجاه المعتمَد.\n\n4) الملفات المسلَّمة: تُسلَّم بصيغ (AI, PDF, PNG, SVG) عبر رابط سحابي آمن.\n\n5) الملكية الفكرية: تنتقل حقوق الاستخدام كاملةً للعميل بعد سداد كامل المبلغ. المقترحات المرفوضة تبقى ملكاً للمصمّم.\n\n6) صلاحية العرض: {VALIDITY_DAYS} يوماً من تاريخ إصداره.'},
      {id:'blank',name:'مخصّص (بدون قالب)',depositPct:50,deliveryDays:0,revisions:0,validityDays:14,
        template:''},
    ],
    vat:{enabled:false,rate:15,number:'',cr:'',street:'',building:'',district:'',city:'الرياض',postal:'',address:''},
    wallpaper:{type:'url',key:'tahoe-dark',url:'./wallpapers/tahoe-dark.jpg'},wallpapers:[]},
  products:[
    {id:'p_pod',name:'إنتاج حلقة بودكاست',price:2000,unit:'حلقة',desc:'تصوير + مونتاج + ١٠ مقاطع قصيرة + تصاميم'},
    {id:'p_studio',name:'Studio Video Production – Filming & Editing',price:1500,unit:'فيديو',desc:''},
    {id:'p_model',name:'Model',price:1300,unit:'',desc:''},
    {id:'p_clips',name:'١٠ مقاطع قصيرة (مقتطفات)',price:200,unit:'باقة',desc:''},
    {id:'p_book',name:'رسوم الحجز',price:50,unit:'',desc:''},
    {id:'p_design',name:'تصاميم منشورات التواصل الاجتماعي',price:0,unit:'',desc:''}
  ],
  contacts:[],crm:[],sales:[],invoices:[],credits:[],projects:[],appointments:[],freelancers:[],boards:[],
  subscriptions:[
    {id:'sub_apple',name:'حساب مطوّر آبل',usd:99,sar:371,cycle:'yearly',date:'',url:'https://developer.apple.com/account',note:'لنشر تطبيق حروف ودروس على آب ستور',active:true},
    {id:'sub_opus',name:'Opus Clip',usd:29,sar:109,cycle:'monthly',date:'',url:'https://www.opus.pro',note:'قص اللقطات القصيرة من حلقات البودكاست',active:true},
    {id:'sub_claude',name:'Claude Max',usd:100,sar:375,cycle:'monthly',date:'',url:'https://claude.ai',note:'برمجة وتطوير الموقع والنظام والاستخدام في الكود',active:true},
    {id:'sub_gcloud',name:'Google Cloud',usd:0,sar:0,cycle:'monthly',date:'',url:'https://console.cloud.google.com',note:'تخزين بيانات العملاء وملفات الأعمال (حسب الاستهلاك)',active:true},
    {id:'sub_envato',name:'Envato Elements',usd:16.5,sar:62,cycle:'monthly',date:'',url:'https://elements.envato.com',note:'أصول وقوالب تصميم',active:true},
    {id:'sub_icloud',name:'iCloud (آبل)',usd:2.99,sar:11,cycle:'monthly',date:'',url:'https://www.icloud.com',note:'مساحة تخزين وربط الملفات على أجهزة آبل',active:true},
    {id:'sub_adobe',name:'Adobe',usd:23.7,sar:89,cycle:'monthly',date:'',url:'https://www.adobe.com',note:'اشتراك سنوي بدفع شهري — برامج التصميم والمونتاج',active:true},
    {id:'sub_power',name:'كهرباء الاستوديو',usd:0,sar:200,cycle:'monthly',date:'',url:'',note:'فاتورة الكهرباء الشهرية (تقريبية)',active:true},
    {id:'sub_rent',name:'إيجار الاستوديو',usd:0,sar:640,cycle:'monthly',date:'',url:'',note:'الإيجار الشهري',active:true},
    {id:'sub_tamam',name:'قرض تمام (الاستوديو)',usd:0,sar:1078,cycle:'installment',date:'',url:'https://www.tamam.sa',note:'قسط شهري لمدة ٩ أشهر',remaining:9,active:true},
    {id:'sub_tabby_laptop',name:'قرض تابي (اللابتوب)',usd:0,sar:1640,cycle:'installment',date:'',url:'https://tabby.ai',note:'آخر قسط للابتوب',remaining:1,active:true},
    {id:'sub_tabby_cam',name:'قرض تابي (الكاميرا)',usd:0,sar:756,cycle:'installment',date:'',url:'https://tabby.ai',note:'الكاميرا الجديدة — ٤ دفعات، دُفعت الأولى وباقٍ ٣',remaining:3,active:true}
  ],
  crmStages:[{key:'todo',label:'مهام'},{key:'doing',label:'جاري العمل عليها'},{key:'done',label:'تم بحمد الله'}],
  projectStages:[{key:'s1',label:'نفهم منتجك'},{key:'s2',label:'نكتب القصة'},{key:'s3',label:'نصوّر وننتج'},{key:'s4',label:'نسلّم ونطلق'},{key:'done',label:'منجز'}],
  // مسار العميل — مراحل البيع ثم التنفيذ (rot = عدد الأيام قبل اعتبار العميل «راكداً»)
  clientStages:[
    {key:'lead',label:'عميل جديد',rot:3,pill:'lead'},
    {key:'qualified',label:'مؤهّل',rot:5,pill:'contacted'},
    {key:'quoted',label:'أُرسل عرض السعر',rot:7,pill:'quoted'},
    {key:'negotiation',label:'تفاوض ومراجعة',rot:7,pill:'progress'},
    {key:'won',label:'تم الاعتماد',rot:3,pill:'won'},
    {key:'delivery',label:'قيد التنفيذ',rot:14,pill:'progress'},
    {key:'delivered',label:'تم التسليم',rot:0,final:true,pill:'done'},
    {key:'lost',label:'لم يكتمل',rot:0,final:true,lost:true,pill:'lost'}
  ],
  counters:{sale:1000,invoice:1000,credit:1000,taxInvoice:0},
  focus:{goalMin:180,breakEveryMin:50,breakLenMin:10,soundOn:true,log:{}},
  prayer:{city:'الرياض',country:'Saudi Arabia',method:4},
  habits:{
    list:[
      {id:'h_article',name:'كتابة مقال',desc:'مقال جديد للمدونة/الحساب',icon:'pen-line',color:'#3b82f6',reminder:'09:00',builtin:true},
      {id:'h_reel',name:'فكرة مقطع (معادلة الانتشار)',desc:'اكتب فكرة مقطع بنموذج معادلة الانتشار',icon:'clapperboard',color:'#8b5cf6',reminder:'11:00',builtin:true,link:'./studio.html'},
      {id:'h_idea',name:'كتابة فكرة',desc:'سجّل فكرة واحدة في بنك الأفكار — تُحتسب تلقائياً',icon:'lightbulb',color:'#f59e0b',reminder:'',builtin:true,linkedApp:'ideas'}
    ],
    log:{},      // {'YYYY-MM-DD':{habitId:true}}
    prayer:{},   // {'YYYY-MM-DD':{Fajr:'mosque'|'ontime'|'late', ...}}
    reminded:{}  // {'YYYY-MM-DD':{habitId:true}} — منع تكرار التنبيه
  },
  suppliers:[],
  aiData:{folders:[],chats:[]},
  workspace:{
    team:[
      {id:'ib',name:'إبراهيم',role:'المالك',color:'#f5a623'},
      {id:'hala',name:'هالا',role:'مدير إبداعي',color:'#a855f7'},
      {id:'saad',name:'سعد',role:'ماركيتنج أوفيسر',color:'#3b82f6'},
      {id:'ahmed',name:'أحمد',role:'مصمم',color:'#22c55e'},
      {id:'rawd',name:'رود',role:'محلل بيانات',color:'#ef4444'}
    ],
    tasks:[],   // {id,title,assignee,type,status,due,priority,notes,date}
    events:[],  // التقويم التسويقي {id,title,date,channel,notes}
    files:[],   // {id,name,url,cat,note}
    brand:{colors:['#f5a623','#0a0a0b','#ffffff'],fonts:['Thmanyah','Tajawal'],notes:''},
    growth:{journey:[],resources:[]}  // journey:[{id,title,done,note}] · resources:[{id,title,url,tag}]
  }
};
;/* ⤷ جملة تنفيذيّة نُقلت إلى 99-boot.js بترتيبها: let S=load(); */
function load(){let s;try{const r=localStorage.getItem(KEY);s=r?deepMerge(JSON.parse(JSON.stringify(def)),JSON.parse(r)):JSON.parse(JSON.stringify(def))}catch(e){s=JSON.parse(JSON.stringify(def))}
  if(!s.crmStages||!s.crmStages.length)s.crmStages=JSON.parse(JSON.stringify(def.crmStages));
  if(!s.projectStages||!s.projectStages.length)s.projectStages=JSON.parse(JSON.stringify(def.projectStages));
  if(!s.clientStages||!s.clientStages.length)s.clientStages=JSON.parse(JSON.stringify(def.clientStages));
  (s.crm||[]).forEach(o=>{if(!o.stageKey)o.stageKey=o.stage||s.crmStages[0].key;if(!o.priority)o.priority='none';if(o.due==null)o.due=''});
  (s.projects||[]).forEach(p=>{if(!p.stageKey){const m=s.projectStages.find(x=>x.label===p.stage);p.stageKey=p.status==='done'?'done':(m?m.key:s.projectStages[0].key)}});
  if(!s.habits||typeof s.habits!=='object')s.habits=JSON.parse(JSON.stringify(def.habits));
  if(!Array.isArray(s.habits.list))s.habits.list=JSON.parse(JSON.stringify(def.habits.list));
  if(!s.habits.log)s.habits.log={};if(!s.habits.prayer)s.habits.prayer={};if(!s.habits.reminded)s.habits.reminded={};
  // بذر العادات المدمجة الجديدة للمستخدمين الحاليين (مرة واحدة — يحترم الحذف اليدوي لاحقاً)
  if(!s.habits.seededIdea){if(!s.habits.list.some(h=>h.id==='h_idea'))s.habits.list.push({id:'h_idea',name:'كتابة فكرة',desc:'سجّل فكرة واحدة في بنك الأفكار — تُحتسب تلقائياً',icon:'lightbulb',color:'#f59e0b',reminder:'',builtin:true,linkedApp:'ideas'});s.habits.seededIdea=true}
  migrateCompanyData(s);
  return s;}
/* بيانات المنشأة كانت في ٣ أماكن (الإعدادات، «البيانات الرسميّة»، الضريبة) والطباعة
   تفضّل «الرسميّة» التي لم يعد لها محرّر. تُنقل مرّةً إلى الإعدادات — المصدر الوحيد
   الآن — بالقيم التي كانت تُطبع فعلاً، فلا يتغيّر شكل أيّ مستند. */
function migrateCompanyData(s){const st=s.settings;if(!st||st.companyV2)return;const off=st.official||{};const v=st.vat=st.vat||{};
  if(off.vat)v.number=off.vat;if(off.cr)v.cr=off.cr;if(off.iban)st.iban=off.iban;if(off.address&&!v.address)v.address=off.address;
  ['brand','owner','email','phone'].forEach(k=>{if(off[k]&&!(st[k]||'').trim())st[k]=off[k]});
  if(v.sellerName&&!(st.brand||'').trim())st.brand=v.sellerName;
  if(v.rate==null)v.rate=15;st.companyV2=true;}
function deepMerge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])){a[k]=deepMerge(a[k]||{},b[k])}else a[k]=b[k]}return a}
function save(){localStorage.setItem(KEY,JSON.stringify(S));scheduleCloudSave();scheduleHomeRefresh()}
/* تحديث فوري للرئيسية عقب أي حركة بيانات (بدون كسر النوافذ المنبثقة) */
let __homeTimer=null;
function scheduleHomeRefresh(){if(CUR!=='home')return;clearTimeout(__homeTimer);__homeTimer=setTimeout(()=>{const mr=document.getElementById('modalRoot');if(mr&&mr.innerHTML.trim())return;if(CUR==='home')renderHome();},220);}
function scheduleCloudSave(){if(!USER)return;clearTimeout(saveTimer);saveTimer=setTimeout(saveCloud,800)}
async function saveCloud(){if(!USER||!STATE_ID)return;try{const{freelancers,...rest}=S;await sb.from('app_state').update({data:rest,updated_at:new Date().toISOString()}).eq('id',STATE_ID);const d=document.getElementById('syncDot');if(d){d.style.color='var(--good)';d.title='تمت المزامنة';}}catch(e){const d=document.getElementById('syncDot');if(d){d.style.color='var(--bad)';d.title='تعذّرت المزامنة'}}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const money=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' '+S.settings.currency;
const USD_RATE=3.75; // ريال لكل دولار
const num2=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usdMoney=n=>'$'+num2(n);            // دولار فقط — بدون رمز الريال
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* today() و ymKey() يعتمدان التوقيت المحلي — تفادياً لخطأ نقل الشهر ليلاً في التوقيتات الشرقية */
const _pad2=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+_pad2(d.getMonth()+1)+'-'+_pad2(d.getDate())};
const ymKey=d=>d.getFullYear()+'-'+_pad2(d.getMonth()+1);

/* ===== AUTH (Supabase) ===== */
const LOGO='https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/%D8%B4%D8%B9%D8%A7%D8%B1_%D8%A7%D9%95%D8%A8%D8%B1%D8%A7%D9%87%D9%8A%D9%85_%D8%B3%D8%B9%D9%88%D8%AF.png';
let RECOVERY_MODE=false;
function lerr(m){document.getElementById('loginErr').textContent=m||''}
function lmsg(m){document.getElementById('loginMsg').textContent=m||''}
function rerr(m){document.getElementById('resetErr').textContent=m||''}
function rmsg(m){document.getElementById('resetMsg').textContent=m||''}
function busy(id,on){const b=document.getElementById(id);if(b)b.disabled=!!on}
function togglePw(id,btn){const el=document.getElementById(id);if(!el)return;const show=el.type==='password';el.type=show?'text':'password';btn.textContent=show?'إخفاء':'إظهار'}
function authMsg(m){return /invalid login/i.test(m)?'البريد أو كلمة المرور غير صحيحة. إن كنت تستخدم التعبئة التلقائية في الجوال فقد تكون كلمة مرور قديمة — امسح الحقل واكتبها يدويًا، أو اضغط «نسيت كلمة المرور؟».':/email not confirmed/i.test(m)?'لم تُؤكَّد بريدك بعد — افتح رسالة التأكيد التي وصلتك واضغط الرابط ثم عُد للدخول.':/rate|too many|seconds/i.test(m)?'محاولات كثيرة — انتظر قليلًا ثم أعد المحاولة.':m}
async function doLogin(){const em=document.getElementById('em').value.trim().toLowerCase();const pw=document.getElementById('pw').value.trim();if(!em||!pw){lerr('اكتب البريد وكلمة المرور.');return}lerr('');busy('btnLogin',true);lmsg('جارٍ الدخول...');const {data,error}=await sb.auth.signInWithPassword({email:em,password:pw});busy('btnLogin',false);if(error){lmsg('');lerr('تعذّر الدخول: '+authMsg(error.message));return}lmsg('');await enterApp(data.user)}
async function doSignup(){const em=document.getElementById('em').value.trim().toLowerCase();const pw=document.getElementById('pw').value.trim();if(!em){lerr('اكتب بريدك الإلكتروني.');return}if(pw.length<8){lerr('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');return}lerr('');busy('btnSignup',true);lmsg('جارٍ إنشاء الحساب...');const {data,error}=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:location.origin+location.pathname}});busy('btnSignup',false);if(error){lmsg('');lerr('تعذّر الإنشاء: '+authMsg(error.message));return}if(data.session){lmsg('');await enterApp(data.user)}else{lmsg('تم الإنشاء تحقّق من بريدك لتأكيد الحساب ثم اضغط دخول.')}}
async function doForgot(){const em=document.getElementById('em').value.trim().toLowerCase();if(!em){lerr('اكتب بريدك في الخانة أعلاه أولًا ثم اضغط «نسيت كلمة المرور؟».');return}lerr('');busy('btnLogin',true);lmsg('جارٍ إرسال رابط الاستعادة...');const {error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});busy('btnLogin',false);if(error&&/rate|too many|seconds/i.test(error.message)){lmsg('');lerr('محاولات كثيرة — انتظر دقيقة ثم أعد المحاولة.');return}lmsg('إن كان هذا البريد مسجّلًا فستصلك رسالة فيها رابط لإعادة تعيين كلمة المرور. افتح الرابط من نفس الجهاز، وتحقّق من صندوق «الرسائل غير المرغوبة» أيضًا.')}
function showReset(){document.getElementById('loginView').classList.add('hidden');document.getElementById('appShell').classList.add('hidden');document.getElementById('resetView').classList.remove('hidden');const f=document.getElementById('np1');if(f)f.focus()}
function pwStrength(){const v=document.getElementById('np1').value;let s=0;if(v.length>=8)s++;if(v.length>=12)s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++;const bar=document.getElementById('pwBar');const col=s<=1?'var(--bad)':s<=2?'var(--warn)':s<=3?'var(--gold)':'var(--good)';bar.style.width=Math.min(100,s*22)+'%';bar.style.background=col;document.getElementById('pwHint').textContent=v.length<8?'قصيرة جدًا — 8 أحرف على الأقل.':s<=2?'ضعيفة — أضف أرقامًا ورموزًا وحروفًا كبيرة.':s<=3?'متوسطة — يمكن تقويتها أكثر.':'قوية'}
async function doSetNewPassword(){const p1=document.getElementById('np1').value;const p2=document.getElementById('np2').value;rerr('');if(p1.length<8){rerr('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');return}if(p1!==p2){rerr('كلمتا المرور غير متطابقتين.');return}busy('btnReset',true);rmsg('جارٍ الحفظ...');const {data,error}=await sb.auth.updateUser({password:p1});busy('btnReset',false);if(error){rmsg('');rerr('تعذّر الحفظ: '+authMsg(error.message)+' — قد يكون الرابط منتهيًا، اطلب رابطًا جديدًا.');return}rmsg('تم تحديث كلمة المرور');RECOVERY_MODE=false;history.replaceState(null,'',location.origin+location.pathname);document.getElementById('resetView').classList.add('hidden');await enterApp(data.user)}
const ADMIN_EMAIL='ibrahimsaud25@gmail.com';
async function enterApp(user){if(USER&&user&&USER.id===user.id)return;if(!user.email||user.email.toLowerCase()!==ADMIN_EMAIL){await sb.auth.signOut();lmsg('');lerr('هذا النظام مخصّص لحساب المدير فقط ('+ADMIN_EMAIL+'). الفريلانسرز يدخلون عبر روابطهم الخاصة.');return}USER=user;lmsg('جارٍ تحميل بياناتك...');try{await loadCloud();await loadFreelancers();migrateData();save()}catch(e){lerr('تعذّر تحميل البيانات: '+e.message);lmsg('');return}lmsg('');document.getElementById('loginView').classList.add('hidden');document.getElementById('appShell').classList.remove('hidden');renderNav();initSidebarShell();applyBranding();const dt=document.getElementById('ctDate');if(dt)dt.textContent=new Date().toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long'});go('home')}
async function logout(){await sb.auth.signOut();USER=null;STATE_ID=null;document.getElementById('appShell').classList.add('hidden');document.getElementById('loginView').classList.remove('hidden')}
async function oauth(provider){lerr('');lmsg('جارٍ التحويل إلى '+(provider==='google'?'Google':'Apple')+'…');const {error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});if(error){lmsg('');lerr('تعذّر: '+error.message+' — تأكد من تفعيل المزوّد في Supabase.')}}
async function loadCloud(){const {data:rows,error}=await sb.from('app_state').select('*').limit(1);if(error)throw error;if(rows&&rows.length){STATE_ID=rows[0].id;const d=rows[0].data||{};S=deepMerge(JSON.parse(JSON.stringify(def)),d);migrateCompanyData(S);if(!S.crmStages||!S.crmStages.length)S.crmStages=JSON.parse(JSON.stringify(def.crmStages));if(!S.projectStages||!S.projectStages.length)S.projectStages=JSON.parse(JSON.stringify(def.projectStages));if(!S.clientStages||!S.clientStages.length)S.clientStages=JSON.parse(JSON.stringify(def.clientStages));(S.crm||[]).forEach(o=>{if(!o.stageKey)o.stageKey=o.stage||S.crmStages[0].key});(S.projects||[]).forEach(p=>{if(!p.stageKey)p.stageKey=S.projectStages[0].key})}else{const {freelancers,...rest}=S;const {data:ins,error:e2}=await sb.from('app_state').insert({data:rest,owner:USER.id}).select('id').single();if(e2)throw e2;STATE_ID=ins.id}}
async function loadFreelancers(){const {data}=await sb.from('freelancers').select('*').order('created_at');S.freelancers=data||[]}
function flName(id){const f=(S.freelancers||[]).find(x=>x.id===id);return f?f.name:''}
function flLink(token){return location.origin+location.pathname+'?ft='+token}

/* ===== TASK SYNC (for freelancer links) ===== */
async function syncTasks(){if(!USER)return;try{const rows=[];S.projects.forEach(p=>{(p.tasks||[]).forEach(t=>{if(t.assignee&&t.id){rows.push({owner:USER.id,client_id:t.id,project_id:p.id,project_title:p.title,title:t.title,stage:(S.projectStages.find(s=>s.key===p.stageKey)||{}).label||'',freelancer_id:t.assignee})}})});if(rows.length)await sb.from('tasks').upsert(rows,{onConflict:'owner,client_id'});const keep=rows.map(r=>r.client_id);const {data:ex}=await sb.from('tasks').select('id,client_id');const toDel=(ex||[]).filter(r=>!keep.includes(r.client_id)).map(r=>r.id);if(toDel.length)await sb.from('tasks').delete().in('id',toDel)}catch(e){console.warn('syncTasks',e)}}

/* ===== TEAM (freelancers) ===== */
function renderTeam(){
  document.getElementById('main').innerHTML=`
    <div class="page-head"><h1>الفريق (الفريلانسرز)</h1><button class="btn btn-gold" onclick="flAdd()">+ فريلانسر</button></div>
    <div class="badge-note"><i data-lucide="link"></i> <div>أضف فريلانسر ثم انسخ رابطه الخاص وأرسله له. يفتح الرابط ويرى <b>مهامه فقط</b> دون أي بيانات أخرى، ويقدر يضيفه كاختصار في جواله. أسند المهام له من «المشروع».</div></div>
    ${!S.freelancers.length?emptyBox('users','لا يوجد فريلانسرز بعد. أضف أول عضو.'):
    `<table><thead><tr><th>الاسم</th><th>البريد</th><th>الرابط الخاص</th><th></th></tr></thead><tbody>
    ${S.freelancers.map(f=>`<tr><td><span class="fl-ic">${iconHTML(f.icon,'clapperboard',17)}</span> ${esc(f.name)}</td><td>${esc(f.email||'—')}</td>
    <td style="white-space:nowrap"><button class="link-btn" onclick="flCopy('${f.token}')"><i class="inl" data-lucide="copy"></i> نسخ الرابط</button> <a class="link-btn" href="${flLink(f.token)}" target="_blank">فتح</a></td>
    <td><button class="link-btn del" onclick="flDel('${f.id}')">حذف</button></td></tr>`).join('')}
    </tbody></table>`}`;
}
function flCopy(token){const u=flLink(token);navigator.clipboard.writeText(u).then(()=>alert('تم نسخ الرابط:\n'+u)).catch(()=>prompt('انسخ الرابط:',u))}
function flAdd(){openModal('فريلانسر جديد',`
  <div class="row2"><div class="field"><label>الاسم</label><input id="f_name" placeholder="مثلاً: محمد"></div>
  <div class="field"><label>الأيقونة (تصير أيقونة تطبيقه)</label><input id="f_icon" value="clapperboard" readonly style="text-align:center"></div></div>
  <div style="margin:-4px 0 12px;display:flex;gap:6px;flex-wrap:wrap">${ICON_CHOICES.map(n=>`<button type="button" class="icon-pick" data-n="${n}" onclick="pickFlIcon('${n}')"><i data-lucide="${n}"></i></button>`).join('')}</div>
  <div class="field"><label>البريد (للإشعارات لاحقاً)</label><input id="f_email" type="email"></div>`,
  async()=>{const name=document.getElementById('f_name').value.trim();const icon=document.getElementById('f_icon').value.trim()||'clapperboard';const email=document.getElementById('f_email').value.trim();if(!name){alert('أدخل الاسم');return}const {data,error}=await sb.from('freelancers').insert({name,icon,email,owner:USER.id}).select().single();if(error){alert('خطأ: '+error.message);return}S.freelancers.push(data);closeModal();renderTeam()});pickFlIcon('clapperboard')}
async function flDel(id){if(!confirm('حذف الفريلانسر؟'))return;await sb.from('freelancers').delete().eq('id',id);S.freelancers=S.freelancers.filter(f=>f.id!==id);renderTeam()}

/* ===== FREELANCER VIEW (?ft=token) ===== */
async function renderFreelancer(token){
  document.getElementById('loginView').classList.add('hidden');document.getElementById('appShell').classList.add('hidden');
  const v=document.getElementById('flView');v.classList.remove('hidden');
  v.innerHTML='<div style="padding:50px;text-align:center;color:var(--muted)">جارٍ التحميل…</div>';
  const {data:fl,error:e1}=await sb.rpc('get_freelancer',{p_token:token});
  if(e1||!fl||!fl.length){v.innerHTML='<div style="padding:60px 20px;text-align:center"><div><i data-lucide="lock" style="width:42px;height:42px;color:var(--muted)"></i></div><p>رابط غير صالح أو منتهٍ.</p></div>';refreshIcons();return}
  const name=fl[0].name||''; const ic=fl[0].icon||'clapperboard';
  setFreelancerAppIcon(ic,name);
  const {data:tasks}=await sb.rpc('get_freelancer_tasks',{p_token:token});
  const list=tasks||[];const pending=list.filter(t=>!t.done),done=list.filter(t=>t.done);
  v.innerHTML=`<div style="max-width:680px;margin:0 auto;padding:22px 16px">
    <div style="text-align:center;margin-bottom:18px"><div style="display:flex;justify-content:center;color:var(--gold2)">${iconHTML(ic,'clapperboard',54)}</div><div style="color:var(--muted);margin-top:6px">مهام: <b style="color:var(--ink)">${esc(name)}</b></div></div>
    <div class="card"><h3 style="margin-top:0">مهامي الحالية (${pending.length})</h3>${pending.length?pending.map(t=>flTaskRow(token,t)).join(''):'<p style="color:var(--muted)"><i class="inl" data-lucide="circle-check"></i> لا مهام حالية</p>'}</div>
    ${done.length?`<div class="card" style="margin-top:14px;opacity:.65"><h3 style="margin-top:0">منجزة (${done.length})</h3>${done.map(t=>flTaskRow(token,t)).join('')}</div>`:''}
    <p style="text-align:center;color:var(--muted);font-size:12px;margin-top:18px"><i class="inl" data-lucide="lightbulb"></i> أضف هذا الرابط لشاشة جوالك الرئيسية لمتابعة مهامك كتطبيق.</p>
  </div>`;
  refreshIcons();
}
function flTaskRow(token,t){return `<div class="task-line"><input type="checkbox" ${t.done?'checked':''} onchange="flToggle('${token}','${t.id}',this.checked)"><span class="${t.done?'done':''}" style="flex:1"><b>${esc(t.title)}</b><div style="font-size:12px;color:var(--muted)">${esc(t.project_title||'')}${t.stage?' · '+esc(t.stage):''}</div></span></div>`}
async function flToggle(token,id,done){await sb.rpc('set_task_done',{p_token:token,p_task:id,p_done:done});renderFreelancer(token)}
function setFreelancerAppIcon(emoji,name){try{const c=document.createElement('canvas');c.width=c.height=180;const x=c.getContext('2d');x.fillStyle='#0a0a0b';x.fillRect(0,0,180,180);x.fillStyle='#f5a623';x.font='900 104px "Thmanyah Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText((name||'م').trim().charAt(0),90,98);const url=c.toDataURL('image/png');let l=document.querySelector('link[rel="apple-touch-icon"]');if(!l){l=document.createElement('link');l.rel='apple-touch-icon';document.head.appendChild(l)}l.href=url;let t=document.querySelector('meta[name="apple-mobile-web-app-title"]');if(t)t.content=name||'مهامي';document.title=name?('مهام '+name):'مهامي'}catch(e){}}
