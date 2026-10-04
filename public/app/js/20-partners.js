/*
 * 20-partners.js — الشركاء والعمولات: المسوّقون بالعمولة، اتفاقياتهم الرسمية،
 *                  المدارس المحالة عن طريقهم، وعمولاتهم.
 * ─────────────────────────────────────────────────────────────────────────
 * الحلقة كاملة داخل النظام:
 *   قالب الاتفاقية (يُحرَّر هنا) → بيانات الشريك → طباعة على الورق الرسمي
 *   → توقيع (إلكتروني أو ورقي + رفع النسخة الموقّعة) → اعتماد (تُجمَّد البنود)
 *   → تسجيل المدارس باسمه (حماية ٩٠ يوماً) → البيع → عمولة مستحقّة → صرف.
 *
 * البيانات في حالة اللوحة (app_state) تحت: S.partners · S.partnerLeads ·
 * S.partnerComms · S.partnerKit (القالب + بيانات المؤسسة + توقيع المالك).
 * الملفّات الموقّعة والختم في حاوية Supabase الخاصّة «partner-docs»
 * (غير عامّة، سياسة مالكٍ فقط) — تُفتح بروابط موقّتة.
 *
 * ⚠️ نطاقٌ عامّ واحد + تعريفات فقط (انظر رأس 01-core.js). البادئة pk لكلّ شيء.
 */

/* ===== ثوابت ===== */
const PK_BUCKET='partner-docs';
const PK_LETTERHEAD='./assets/huroof-letterhead.png';
const PK_STAGES=[
  {key:'registered',label:'مسجّلة',pill:'lead'},
  {key:'contacted',label:'تم التواصل',pill:'contacted'},
  {key:'demo',label:'عرض تجريبي',pill:'quoted'},
  {key:'offer',label:'عرض سعر',pill:'progress'},
  {key:'won',label:'تم البيع',pill:'won'},
  {key:'lost',label:'لم تتم',pill:'lost'},
];
const PK_STATUS={
  draft:{label:'مسودة',pill:'draft'},
  pending:{label:'بانتظار التوقيع',pill:'progress'},
  active:{label:'معتمد',pill:'won'},
  suspended:{label:'موقوف',pill:'lost'},
  ended:{label:'منتهٍ',pill:'lost'},
};
const PK_DEFAULT_ARTICLES=[
  {t:'المادة الأولى: التمهيد',b:'حيث إن الطرف الأول مؤسسة سعودية تملك وتشغّل منصة «حروف ودروس» التعليمية الموجّهة للمعلمين والطلاب والمدارس، وحيث إن الطرف الثاني لديه علاقات وقدرة على الوصول إلى المدارس والجهات التعليمية وتسويق المنصة لديها، فقد رغب الطرفان في التعاون وفق أحكام هذه الاتفاقية. ويُعد هذا التمهيد جزءًا لا يتجزأ من الاتفاقية ومفسِّرًا لها.'},
  {t:'المادة الثانية: التعريفات',b:'- **المنصة:** منصة «حروف ودروس» بجميع تطبيقاتها وباقاتها وخدماتها المملوكة للطرف الأول.\n- **العميل:** أي مدرسة أو مجمّع تعليمي أو جهة تعليمية حكومية أو أهلية يُحيلها الطرف الثاني وتُسجَّل باسمه وفق المادة الرابعة.\n- **البيعة:** كل اشتراك أو باقة أو ترخيص في المنصة يتعاقد عليه العميل مع الطرف الأول ويُسدَّد مقابله.\n- **صافي قيمة البيعة:** المبلغ المحصَّل فعليًا من العميل في حساب الطرف الأول، بعد استبعاد ضريبة القيمة المضافة وأي مبالغ مستردة أو ملغاة.'},
  {t:'المادة الثالثة: موضوع الاتفاقية',b:'يتولى الطرف الثاني تسويق المنصة وعرضها على المدارس والجهات التعليمية، والتواصل مع المسؤولين فيها، ومتابعتهم حتى إتمام التعاقد مع الطرف الأول، وذلك مقابل عمولة على كل بيعة تتم عن طريقه وفق المادة الخامسة. ويعمل الطرف الثاني بصفته مسوّقًا مستقلًا وغير حصري، ويحق للطرف الأول التعاقد مع مسوّقين آخرين أو البيع المباشر للعملاء غير المسجلين باسم الطرف الثاني.'},
  {t:'المادة الرابعة: تسجيل العملاء وإثبات الإحالة',b:'- يلتزم الطرف الثاني بتسجيل كل عميل محتمل لدى الطرف الأول كتابيًا (عبر البريد الإلكتروني أو الواتساب المعتمد) قبل التواصل الجدي معه أو فور أول تواصل، متضمنًا: اسم الجهة، والمدينة، واسم المسؤول ورقم التواصل.\n- يؤكد الطرف الأول قبول التسجيل كتابيًا خلال {CONFIRM_DAYS} أيام عمل، أو يُبلغ الطرف الثاني بأن الجهة عميل قائم، أو مسجّلة مسبقًا باسم مسوّق آخر، أو في تفاوض مباشر مع الطرف الأول.\n- يُحفظ حق الطرف الثاني في العميل المسجَّل لمدة {PROTECT_DAYS} من تاريخ تأكيد التسجيل، فإذا تمت البيعة خلالها استحق العمولة، ويجوز تمديد المدة باتفاق كتابي.\n- عند تعارض التسجيل بين أكثر من مسوّق، تكون الأولوية لمن سبق تسجيله وتأكيده لدى الطرف الأول.\n- يجوز للطرف الأول منح الطرف الثاني رمز إحالة أو رابطًا خاصًا لتوثيق المبيعات، ويُعد ما يُسجَّل عبره دليلًا على الإحالة.'},
  {t:'المادة الخامسة: العمولة وآلية صرفها',b:'- يستحق الطرف الثاني عمولة بنسبة **{COMMISSION}** من صافي قيمة كل بيعة تتم عن طريقه.\n- تشمل العمولة الاشتراك الأول للعميل، وأي ترقية أو اشتراك إضافي يبرمه العميل نفسه خلال {RENEW_MONTHS} من تاريخ البيعة الأولى.\n- لا تستحق العمولة إلا بعد تحصيل قيمة البيعة في حساب الطرف الأول، وفي حال السداد على دفعات تُصرف العمولة بنسبة ما يُحصَّل من كل دفعة.\n- تُصرف العمولة خلال {PAY_DAYS} أيام عمل من تاريخ التحصيل، بتحويل بنكي إلى حساب الطرف الثاني المذكور في هذه الاتفاقية، مع كشف يوضح البيعات وقيمتها والعمولة المستحقة.\n- إذا استُرد مبلغ البيعة أو جزء منه للعميل بعد صرف العمولة، تُخصم العمولة المقابلة له من المستحقات القادمة، أو يعيدها الطرف الثاني خلال (15) يومًا.\n- تُعد العمولة المقابل الوحيد للطرف الثاني عن خدماته، ولا يستحق راتبًا أو بدلات أو مصاريف (تنقل، طباعة، ضيافة وغيرها) ما لم يوافق عليها الطرف الأول كتابيًا ومسبقًا.\n- يتحمل الطرف الثاني أي التزامات زكوية أو ضريبية أو نظامية تخصه بصفته الشخصية فيما يتعلق بالعمولات التي يتقاضاها.\n\nمثال توضيحي: بيعة صافي قيمتها 10,000 ريال، تكون عمولة الطرف الثاني {EXAMPLE} ريال.'},
  {t:'المادة السادسة: الأسعار والتحصيل',b:'- يلتزم الطرف الثاني بالأسعار والباقات والعروض المعتمدة من الطرف الأول، ولا يحق له منح أي خصم أو ميزة أو فترة مجانية إلا بموافقة كتابية مسبقة.\n- **يُحظر على الطرف الثاني استلام أي مبالغ من العملاء نقدًا أو بتحويلها إلى حسابه الشخصي**؛ ويكون السداد مباشرة للطرف الأول عبر فاتورته الرسمية أو بوابة الدفع أو حسابه البنكي المعتمد.\n- إبرام التعاقد النهائي وإصدار الفواتير من صلاحية الطرف الأول وحده، وله الحق في قبول أي عميل أو الاعتذار عنه.'},
  {t:'المادة السابعة: التزامات الطرف الأول',b:'- تزويد الطرف الثاني بالمواد التعريفية والعروض التقديمية وقائمة الأسعار المعتمدة، وتحديثها عند تغييرها.\n- تقديم العروض التوضيحية (Demo) والدعم الفني للعملاء المحالين متى طلب الطرف الثاني ذلك.\n- الرد على طلبات تسجيل العملاء في المدة المحددة، وإطلاع الطرف الثاني على حالة عملائه المسجلين.\n- صرف العمولات المستحقة في مواعيدها، والتعامل بشفافية وحسن نية بما يحقق مصلحة الطرفين.'},
  {t:'المادة الثامنة: التزامات الطرف الثاني',b:'- تمثيل المنصة أمام العملاء بصورة مهنية ولائقة، وتقديم معلومات صحيحة عنها دون مبالغة.\n- عدم تقديم أي وعود أو التزامات للعملاء تتعلق بالمزايا أو الأسعار أو مواعيد التنفيذ إلا بعد موافقة الطرف الأول.\n- عدم إبرام أي عقد أو التوقيع نيابة عن الطرف الأول، أو تقديم نفسه بصفة موظف أو وكيل مفوَّض عنه.\n- عدم استخدام اسم الطرف الأول أو شعاره أو مواده التسويقية إلا في حدود تنفيذ هذه الاتفاقية وبالصورة المعتمدة.\n- الالتزام بنظام حماية البيانات الشخصية في المملكة العربية السعودية، وعدم استخدام بيانات المدارس والمعلمين والطلاب لأي غرض خارج هذه الاتفاقية.\n- تزويد الطرف الأول بتحديثات دورية عن العملاء المسجلين ومراحل التفاوض معهم.'},
  {t:'المادة التاسعة: السرية والملكية الفكرية',b:'يلتزم الطرف الثاني بالمحافظة على سرية جميع المعلومات التي يطّلع عليها بسبب هذه الاتفاقية، ومنها الأسعار والخطط والعملاء والبيانات التقنية، وعدم إفشائها لأي طرف ثالث، ويستمر هذا الالتزام بعد انتهاء الاتفاقية. وتبقى المنصة وعلامتها التجارية وشخصياتها ومحتواها ومواد التسويق ملكًا خالصًا للطرف الأول.'},
  {t:'المادة العاشرة: طبيعة العلاقة',b:'تنظم هذه الاتفاقية علاقة تعاون تسويقي مستقلة، ولا تُعد عقد عمل، ولا تُنشئ أي علاقة تبعية أو وكالة أو شراكة بين الطرفين، ولا يترتب عليها أي حقوق عمالية للطرف الثاني.'},
  {t:'المادة الحادية عشرة: مدة الاتفاقية وإنهاؤها',b:'- مدة هذه الاتفاقية {TERM} تبدأ من تاريخ توقيعها، وتتجدد تلقائيًا لمدة مماثلة ما لم يُخطر أحد الطرفين الآخر كتابيًا برغبته في عدم التجديد قبل انتهائها بـ (15) يومًا.\n- يحق لأي من الطرفين إنهاء الاتفاقية في أي وقت بإشعار كتابي قبل (15) يومًا من تاريخ الإنهاء.\n- يحق للطرف الأول إنهاء الاتفاقية فورًا إذا أخلّ الطرف الثاني بالمادة السادسة (التحصيل) أو المادة التاسعة (السرية) أو قدّم معلومات مضللة للعملاء.\n- عند انتهاء الاتفاقية لغير سبب الإخلال، يستحق الطرف الثاني عمولات البيعات المحصَّلة قبل الانتهاء، وعمولات العملاء المسجلين باسمه الذين يتم التعاقد معهم خلال (60) يومًا بعد الانتهاء.\n- يلتزم الطرف الثاني عند الانتهاء بالتوقف عن تقديم نفسه ممثلًا للمنصة، وإعادة أو إتلاف أي مواد أو بيانات تخص الطرف الأول.'},
  {t:'المادة الثانية عشرة: تسوية النزاعات',b:'تخضع هذه الاتفاقية لأنظمة المملكة العربية السعودية، وفي حال نشوء أي خلاف حول تفسيرها أو تنفيذها يسعى الطرفان إلى حله وديًا خلال (15) يومًا من تاريخ إخطار أحدهما للآخر، فإن تعذر ذلك يُحال النزاع إلى الجهة القضائية المختصة في مدينة الرياض.'},
  {t:'المادة الثالثة عشرة: أحكام عامة',b:'- تُعد المراسلات عبر البريد الإلكتروني ورقم الجوال المذكورين في هذه الاتفاقية وسيلة إخطار معتمدة بين الطرفين.\n- لا يجوز تعديل أي بند من بنود هذه الاتفاقية إلا بملحق مكتوب وموقّع من الطرفين.\n- لا يحق للطرف الثاني التنازل عن هذه الاتفاقية أو عن حقوقه فيها للغير دون موافقة كتابية من الطرف الأول.\n- حُررت هذه الاتفاقية من نسختين، تسلّم كل طرف نسخة للعمل بموجبها، وتُعد النسخ والتوقيعات الإلكترونية معتمدة وملزمة للطرفين.'},
];
const PK_DEFAULT_KIT={
  title:'اتفاقية تسويق ومبيعات بالعمولة',
  subtitle:'لتسويق وبيع منصة «حروف ودروس» التعليمية للمدارس والجهات التعليمية',
  org:{name:'مؤسسة حروف ودروس',unified:'7054189027',city:'الرياض، المملكة العربية السعودية',rep:'إبراهيم سعود بوحيمد',repTitle:'المالك',email:'huroofduroos@gmail.com'},
  defaults:{rate:10,protectDays:90,confirmDays:3,renewMonths:12,payDays:10,term:'سنة واحدة'},
  prefix:'HD-S-',counter:0,
  articles:null,     // null = البنود الافتراضيّة أعلاه
  ownerSig:'',       // توقيع المالك (dataURL) — اختياريّ
  stampPath:'',      // مسار الختم في حاوية partner-docs
};
const PK_RATE_WORDS={5:'خمسة',6:'ستة',7:'سبعة',8:'ثمانية',9:'تسعة',10:'عشرة',11:'أحد عشر',12:'اثنا عشر',13:'ثلاثة عشر',14:'أربعة عشر',15:'خمسة عشر',16:'ستة عشر',17:'سبعة عشر',18:'ثمانية عشر',19:'تسعة عشر',20:'عشرون',25:'خمسة وعشرون',30:'ثلاثون'};

/* ===== حالة الوحدة ===== */
let PK_TAB='overview', PK_PID=null, PK_LF={partner:'',stage:'open',q:''}, PK_CF={partner:'',status:''}, PK_ORGS=null;

function pkInit(){
  if(!Array.isArray(S.partners))S.partners=[];
  if(!Array.isArray(S.partnerLeads))S.partnerLeads=[];
  if(!Array.isArray(S.partnerComms))S.partnerComms=[];
  if(!S.partnerKit||typeof S.partnerKit!=='object')S.partnerKit=JSON.parse(JSON.stringify(PK_DEFAULT_KIT));
  const k=S.partnerKit;
  for(const key in PK_DEFAULT_KIT){if(k[key]===undefined)k[key]=JSON.parse(JSON.stringify(PK_DEFAULT_KIT[key]))}
  k.org=Object.assign({},PK_DEFAULT_KIT.org,k.org||{});
  k.defaults=Object.assign({},PK_DEFAULT_KIT.defaults,k.defaults||{});
  return k;
}
function pkArticles(){const k=pkInit();return (Array.isArray(k.articles)&&k.articles.length)?k.articles:PK_DEFAULT_ARTICLES}
function pkP(id){return S.partners.find(p=>p.id===id)}
function pkL(id){return S.partnerLeads.find(l=>l.id===id)}
function pkNow(){return new Date().toISOString()}
function pkLog(p,text){if(!p)return;if(!Array.isArray(p.log))p.log=[];p.log.unshift({at:pkNow(),text})}
function pkAddDays(ymd,n){if(!ymd)return '';const d=new Date(ymd+'T12:00:00');d.setDate(d.getDate()+Number(n||0));return d.getFullYear()+'-'+_pad2(d.getMonth()+1)+'-'+_pad2(d.getDate())}
function pkDaysTo(ymd){if(!ymd)return null;const a=new Date(today()+'T12:00:00'),b=new Date(ymd+'T12:00:00');return Math.round((b-a)/864e5)}
function pkFmt(ymd){if(!ymd)return '—';const [y,m,d]=ymd.split('-');return `${d}/${m}/${y}`}
function pkHijri(ymd){if(!ymd)return '';try{const d=new Date(ymd+'T12:00:00');const parts=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(d);const g=t=>(parts.find(x=>x.type===t)||{}).value||'';return `${g('day')}/${g('month')}/${g('year').replace(/\D/g,'')}هـ`}catch(e){return ''}}
function pkDay(ymd){if(!ymd)return '';try{return new Date(ymd+'T12:00:00').toLocaleDateString('ar-SA',{weekday:'long'})}catch(e){return ''}}
function pkSar(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})+' ر.س'}
function pkNorm(s){return String(s||'').replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim().toLowerCase()}
function pkStage(key){return PK_STAGES.find(s=>s.key===key)||PK_STAGES[0]}
function pkWa(phone){let p=String(phone||'').replace(/\D/g,'');if(p.startsWith('05'))p='966'+p.slice(1);else if(p.startsWith('5')&&p.length===9)p='966'+p;return p?'https://wa.me/'+p:''}
function pkLeadExpiry(l){const p=pkP(l.partnerId);const days=(p&&p.protectDays)||pkInit().defaults.protectDays;return pkAddDays(l.confirmedAt||l.registeredAt,days)}
function pkVal(id){const el=document.getElementById(id);return el?el.value.trim():''}
function pkRender(){if(CUR==='partners')renderPartners()}

/* ===== المتغيّرات داخل البنود ===== */
function pkVars(p){
  const d=pkInit().defaults;const rate=Number((p&&p.rate)||d.rate);
  const w=PK_RATE_WORDS[rate];
  return {
    COMMISSION:`(${rate}%)${w?' '+w+' بالمائة':''}`,
    PROTECT_DAYS:`(${(p&&p.protectDays)||d.protectDays}) يومًا`,
    CONFIRM_DAYS:`(${d.confirmDays})`,
    RENEW_MONTHS:`(${(p&&p.renewMonths)||d.renewMonths}) شهرًا`,
    PAY_DAYS:`(${(p&&p.payDays)||d.payDays})`,
    TERM:(p&&p.term)||d.term,
    EXAMPLE:(10000*rate/100).toLocaleString('en-US'),
  };
}
function pkFill(text,vars){return String(text||'').replace(/\{([A-Z_]+)\}/g,(m,k)=>vars[k]!=null?vars[k]:m)}
/* نصّ البند → HTML: السطور التي تبدأ بـ«- » بنودٌ مرقّمة، و**…** عريض */
function pkBodyHTML(text){
  const inl=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  const lines=String(text||'').split('\n');let out='',n=0,inList=false;
  lines.forEach(raw=>{const ln=raw.trim();
    if(/^-\s+/.test(ln)){if(!inList){out+='<ol>';inList=true;n=0}n++;out+=`<li>${inl(ln.replace(/^-\s+/,''))}</li>`;}
    else{if(inList){out+='</ol>';inList=false}
      if(ln)out+=/^مثال/.test(ln)?`<p class="ex">${inl(ln)}</p>`:`<p>${inl(ln)}</p>`;}
  });
  if(inList)out+='</ol>';return out;
}

/* ===== الواجهة الرئيسية ===== */
const PK_TABS=[
  {id:'overview',name:'نظرة عامة',icon:'layout-dashboard'},
  {id:'partners',name:'الشركاء',icon:'users'},
  {id:'leads',name:'المدارس المحالة',icon:'school'},
  {id:'comms',name:'العمولات',icon:'wallet'},
  {id:'template',name:'قالب الاتفاقية',icon:'file-signature'},
];
function renderPartners(){
  pkInit();
  const main=document.getElementById('main');
  if(PK_PID&&pkP(PK_PID)){main.innerHTML=pkPartnerPage(pkP(PK_PID));refreshIcons();return}
  PK_PID=null;
  const bodies={overview:pkViewOverview,partners:pkViewPartners,leads:pkViewLeads,comms:pkViewComms,template:pkViewTemplate};
  main.innerHTML=`
    <div class="page-head"><h1><i data-lucide="handshake" style="width:26px;height:26px;vertical-align:-4px"></i> الشركاء والعمولات</h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost" onclick="pkLeadForm()"><i data-lucide="school"></i> تسجيل مدرسة</button>
        <button class="btn btn-gold" onclick="pkPartnerForm()"><i data-lucide="user-plus"></i> شريك جديد</button></div></div>
    <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
      ${PK_TABS.map(t=>`<button class="btn btn-sm ${PK_TAB===t.id?'btn-gold':'btn-ghost'}" onclick="PK_TAB='${t.id}';renderPartners()"><i data-lucide="${t.icon}"></i> ${t.name}</button>`).join('')}
    </div>
    <div id="pkBody">${(bodies[PK_TAB]||pkViewOverview)()}</div>`;
  refreshIcons();
}
function pkOpen(id){PK_PID=id;renderPartners();window.scrollTo(0,0)}
function pkBack(){PK_PID=null;renderPartners()}

/* ── نظرة عامة ── */
function pkViewOverview(){
  const act=S.partners.filter(p=>p.status==='active');
  const open=S.partnerLeads.filter(l=>!['won','lost'].includes(l.stage));
  const won=S.partnerLeads.filter(l=>l.stage==='won');
  const due=S.partnerComms.filter(c=>c.status!=='paid').reduce((a,c)=>a+Number(c.amount||0),0);
  const paid=S.partnerComms.filter(c=>c.status==='paid').reduce((a,c)=>a+Number(c.amount||0),0);
  const fu=open.filter(l=>l.nextDate).sort((a,b)=>a.nextDate.localeCompare(b.nextDate));
  const overdue=fu.filter(l=>pkDaysTo(l.nextDate)<0), todayL=fu.filter(l=>pkDaysTo(l.nextDate)===0), soon=fu.filter(l=>{const d=pkDaysTo(l.nextDate);return d>0&&d<=7});
  const noNext=open.filter(l=>!l.nextDate);
  const expiring=open.filter(l=>{const d=pkDaysTo(pkLeadExpiry(l));return d!=null&&d<=10});
  const pending=S.partners.filter(p=>p.status==='draft'||p.status==='pending');
  const row=(l,tag)=>{const p=pkP(l.partnerId);return `<tr style="cursor:pointer" onclick="pkLeadForm('${l.id}')"><td><b>${esc(l.school)}</b><div style="font-size:12px;color:var(--muted)">${esc(l.city||'')}</div></td><td>${esc(p?p.name:'—')}</td><td>${esc(l.nextAction||'—')}</td><td style="white-space:nowrap">${tag}</td></tr>`};
  const tbl=(list,tagFn)=>list.length?`<div style="overflow:auto"><table><thead><tr><th>المدرسة</th><th>الشريك</th><th>الخطوة الجاية</th><th>الموعد</th></tr></thead><tbody>${list.map(l=>row(l,tagFn(l))).join('')}</tbody></table></div>`:'';
  return `
    <div class="stats">
      <div class="stat"><div class="ic"><i data-lucide="user-check"></i></div><div class="v">${act.length}</div><div class="l">شركاء معتمدون</div></div>
      <div class="stat"><div class="ic"><i data-lucide="school"></i></div><div class="v">${open.length}</div><div class="l">مدارس قيد المتابعة</div></div>
      <div class="stat"><div class="ic"><i data-lucide="badge-check"></i></div><div class="v">${won.length}</div><div class="l">مدارس تم البيع لها</div></div>
      <div class="stat"><div class="ic"><i data-lucide="wallet"></i></div><div class="v">${pkSar(due)}</div><div class="l">عمولات مستحقّة (لم تُصرف)</div></div>
      <div class="stat"><div class="ic"><i data-lucide="check-check"></i></div><div class="v">${pkSar(paid)}</div><div class="l">عمولات مصروفة</div></div>
    </div>
    ${pending.length?`<div class="badge-note" style="margin-bottom:16px"><i data-lucide="file-clock"></i><div><b>اتفاقيات لم تُعتمد بعد:</b> ${pending.map(p=>`<a class="link-btn" onclick="pkOpen('${p.id}')">${esc(p.name)}</a>`).join(' · ')}</div></div>`:''}
    <div class="card" style="margin-bottom:16px"><h3><i data-lucide="alarm-clock"></i> متابعاتك</h3>
      ${!fu.length&&!noNext.length?emptyBox('calendar-check','لا متابعات — سجّل مدرسة وحدّد «الخطوة الجاية».'):''}
      ${overdue.length?`<div style="margin:6px 0;color:var(--bad);font-weight:700">متأخرة (${overdue.length})</div>${tbl(overdue,l=>`<span class="pill lost">${pkFmt(l.nextDate)}</span>`)}`:''}
      ${todayL.length?`<div style="margin:12px 0 6px;color:var(--gold);font-weight:700">اليوم (${todayL.length})</div>${tbl(todayL,()=>`<span class="pill progress">اليوم</span>`)}`:''}
      ${soon.length?`<div style="margin:12px 0 6px;font-weight:700">خلال ٧ أيام (${soon.length})</div>${tbl(soon,l=>`<span class="pill quoted">${pkFmt(l.nextDate)}</span>`)}`:''}
      ${noNext.length?`<div style="margin:12px 0 6px;color:var(--muted);font-weight:700">بدون خطوة جاية (${noNext.length})</div>${tbl(noNext,()=>`<span class="pill draft">حدّد موعد</span>`)}`:''}
    </div>
    ${expiring.length?`<div class="card"><h3><i data-lucide="shield-alert"></i> حماية تنتهي قريباً (أقل من ١٠ أيام)</h3>
      <div style="color:var(--muted);font-size:13px;margin-bottom:8px">بعد انتهاء المدة يسقط حق الشريك في المدرسة إن لم تُمدَّد كتابياً.</div>
      ${tbl(expiring,l=>{const d=pkDaysTo(pkLeadExpiry(l));return `<span class="pill ${d<0?'lost':'progress'}">${d<0?'انتهت':'باقي '+d+' يوم'}</span>`})}</div>`:''}`;
}

/* ── الشركاء ── */
function pkPartnerStats(pid){
  const leads=S.partnerLeads.filter(l=>l.partnerId===pid);const comms=S.partnerComms.filter(c=>c.partnerId===pid);
  return {leads:leads.length,open:leads.filter(l=>!['won','lost'].includes(l.stage)).length,won:leads.filter(l=>l.stage==='won').length,
    due:comms.filter(c=>c.status!=='paid').reduce((a,c)=>a+Number(c.amount||0),0),paid:comms.filter(c=>c.status==='paid').reduce((a,c)=>a+Number(c.amount||0),0)};
}
function pkViewPartners(){
  if(!S.partners.length)return emptyBox('handshake','لا يوجد شركاء بعد — اضغط «شريك جديد» واكتب بياناته، ثم اطبع اتفاقيته من النظام.');
  return `<div style="overflow:auto"><table><thead><tr><th>الشريك</th><th>رقم الاتفاقية</th><th>الحالة</th><th>العمولة</th><th>المدارس</th><th>مستحق</th><th>مصروف</th></tr></thead><tbody>
    ${S.partners.map(p=>{const st=pkPartnerStats(p.id);const s=PK_STATUS[p.status]||PK_STATUS.draft;return `<tr style="cursor:pointer" onclick="pkOpen('${p.id}')">
      <td><b>${esc(p.name)}</b><div style="font-size:12px;color:var(--muted)">${esc(p.phone||'')}${p.city?' · '+esc(p.city):''}</div></td>
      <td>${esc(p.no||'—')}</td><td><span class="pill ${s.pill}">${s.label}</span></td><td>${Number(p.rate||0)}%</td>
      <td>${st.open} قيد المتابعة · ${st.won} مباعة</td><td>${pkSar(st.due)}</td><td>${pkSar(st.paid)}</td></tr>`}).join('')}
  </tbody></table></div>`;
}
function pkPartnerForm(id){
  const k=pkInit();const p=id?pkP(id):null;const d=k.defaults;const v=(f,dv)=>esc(p&&p[f]!=null&&p[f]!==''?p[f]:(dv==null?'':dv));
  const locked=p&&p.status==='active';
  openModal(p?'بيانات الشريك':'شريك جديد',`
    ${locked?`<div class="badge-note" style="margin-bottom:12px"><i data-lucide="lock"></i><div>الاتفاقية <b>معتمدة</b> — تعديل البيانات هنا لا يغيّر البنود المجمّدة، لكنه يغيّر ما يُطبع في الصفحة الأولى. لتغيير جوهريّ: أصدر ملحقاً.</div></div>`:''}
    <div style="font-weight:800;margin-bottom:8px">البيانات الشخصية</div>
    <div class="row2"><div class="field"><label>الاسم الرباعي *</label><input id="pk_name" value="${v('name')}"></div>
      <div class="field"><label>الجنسية</label><input id="pk_nat" value="${v('nationality','سعودي')}"></div></div>
    <div class="row2"><div class="field"><label>رقم الهوية / الإقامة</label><input id="pk_idno" inputmode="numeric" value="${v('idNo')}"></div>
      <div class="field"><label>المدينة / العنوان</label><input id="pk_city" value="${v('city')}"></div></div>
    <div class="row2"><div class="field"><label>الجوال *</label><input id="pk_phone" inputmode="tel" value="${v('phone')}" placeholder="05xxxxxxxx"></div>
      <div class="field"><label>البريد الإلكتروني</label><input id="pk_email" type="email" value="${v('email')}"></div></div>
    <div class="row2"><div class="field"><label>البنك</label><input id="pk_bank" value="${v('bank')}"></div>
      <div class="field"><label>رقم الآيبان</label><input id="pk_iban" dir="ltr" value="${v('iban')}" placeholder="SA…"></div></div>
    <div style="font-weight:800;margin:6px 0 8px">شروط الاتفاقية</div>
    <div class="row3"><div class="field"><label>نسبة العمولة %</label><input id="pk_rate" type="number" min="0" step="0.5" value="${v('rate',d.rate)}"></div>
      <div class="field"><label>حماية المدرسة (يوم)</label><input id="pk_protect" type="number" min="1" value="${v('protectDays',d.protectDays)}"></div>
      <div class="field"><label>شمول الترقيات (شهر)</label><input id="pk_renew" type="number" min="0" value="${v('renewMonths',d.renewMonths)}"></div></div>
    <div class="row3"><div class="field"><label>صرف العمولة خلال (يوم عمل)</label><input id="pk_pay" type="number" min="1" value="${v('payDays',d.payDays)}"></div>
      <div class="field"><label>مدة الاتفاقية</label><input id="pk_term" value="${v('term',d.term)}"></div>
      <div class="field"><label>تاريخ الإبرام</label><input id="pk_date" type="date" value="${v('agreementDate',today())}"></div></div>
    <div class="field"><label>ملاحظات داخلية (لا تُطبع)</label><textarea id="pk_notes" rows="2">${v('notes')}</textarea></div>`,
  ()=>{
    const name=pkVal('pk_name'),phone=pkVal('pk_phone');
    if(!name){alert('اكتب اسم الشريك.');return}
    if(!phone){alert('اكتب رقم الجوال.');return}
    const isNew=!p;const o=p||{id:uid(),status:'draft',createdAt:pkNow(),log:[],docs:[]};
    Object.assign(o,{name,nationality:pkVal('pk_nat'),idNo:pkVal('pk_idno'),city:pkVal('pk_city'),phone,email:pkVal('pk_email'),
      bank:pkVal('pk_bank'),iban:pkVal('pk_iban').replace(/\s+/g,'').toUpperCase(),rate:Number(pkVal('pk_rate')||d.rate),
      protectDays:Number(pkVal('pk_protect')||d.protectDays),renewMonths:Number(pkVal('pk_renew')||d.renewMonths),
      payDays:Number(pkVal('pk_pay')||d.payDays),term:pkVal('pk_term')||d.term,agreementDate:pkVal('pk_date')||today(),notes:pkVal('pk_notes')});
    if(isNew){k.counter=Number(k.counter||0)+1;o.no=(k.prefix||'HD-S-')+String(k.counter).padStart(4,'0');pkLog(o,'أُنشئ الشريك ورقم الاتفاقية '+o.no);S.partners.push(o);PK_PID=o.id}
    else pkLog(o,'عُدّلت البيانات');
    save();closeModal();renderPartners();
  },p&&!S.partnerLeads.some(l=>l.partnerId===p.id)&&!S.partnerComms.some(c=>c.partnerId===p.id)?()=>{if(!confirm('حذف الشريك نهائياً؟'))return;S.partners=S.partners.filter(x=>x.id!==p.id);PK_PID=null;save();closeModal();renderPartners()}:null);
}

/* ── صفحة الشريك ── */
function pkPartnerPage(p){
  const st=pkPartnerStats(p.id);const s=PK_STATUS[p.status]||PK_STATUS.draft;
  const leads=S.partnerLeads.filter(l=>l.partnerId===p.id).sort((a,b)=>(b.registeredAt||'').localeCompare(a.registeredAt||''));
  const comms=S.partnerComms.filter(c=>c.partnerId===p.id).sort((a,b)=>(b.collectedAt||'').localeCompare(a.collectedAt||''));
  const docs=p.docs||[];const signedDoc=docs.find(x=>x.kind==='signed');
  const wa=pkWa(p.phone);
  const step=(ok,txt)=>`<div style="display:flex;gap:8px;align-items:center;padding:6px 0"><i data-lucide="${ok?'check-circle-2':'circle'}" style="width:18px;height:18px;color:${ok?'var(--good)':'var(--muted)'}"></i><span style="${ok?'':'color:var(--muted)'}">${txt}</span></div>`;
  const kv=(k,v)=>`<div><div style="font-size:12px;color:var(--muted)">${k}</div><div style="font-weight:700">${v||'—'}</div></div>`;
  return `
    <div class="page-head"><h1 style="display:flex;align-items:center;gap:10px"><button class="btn btn-ghost btn-sm" onclick="pkBack()"><i data-lucide="arrow-right"></i></button> ${esc(p.name)} <span class="pill ${s.pill}" style="font-size:13px">${s.label}</span></h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${wa?`<a class="btn btn-ghost" href="${wa}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> واتساب</a>`:''}
        <button class="btn btn-ghost" onclick="pkPartnerForm('${p.id}')"><i data-lucide="pencil"></i> البيانات</button>
        <button class="btn btn-gold" onclick="pkPrintAgreement('${p.id}')"><i data-lucide="printer"></i> طباعة الاتفاقية</button></div></div>
    <div class="stats">
      <div class="stat"><div class="v">${Number(p.rate||0)}%</div><div class="l">نسبة العمولة</div></div>
      <div class="stat"><div class="v">${st.open}</div><div class="l">مدارس قيد المتابعة</div></div>
      <div class="stat"><div class="v">${st.won}</div><div class="l">مدارس مباعة</div></div>
      <div class="stat"><div class="v">${pkSar(st.due)}</div><div class="l">مستحق له</div></div>
      <div class="stat"><div class="v">${pkSar(st.paid)}</div><div class="l">صُرف له</div></div>
    </div>
    <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:16px">
      <div class="card"><h3><i data-lucide="id-card"></i> البيانات</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${kv('رقم الاتفاقية',esc(p.no))}${kv('تاريخ الإبرام',pkFmt(p.agreementDate)+' · '+pkHijri(p.agreementDate))}
          ${kv('رقم الهوية',esc(p.idNo))}${kv('الجنسية',esc(p.nationality))}
          ${kv('الجوال',`<span dir="ltr">${esc(p.phone)}</span>`)}${kv('المدينة',esc(p.city))}
          ${kv('البريد',esc(p.email))}${kv('البنك',esc(p.bank))}
          <div style="grid-column:1/-1">${kv('الآيبان',`<span dir="ltr">${esc(p.iban)}</span>`)}</div>
          ${kv('حماية المدرسة',(p.protectDays||'')+' يوم')}${kv('مدة الاتفاقية',esc(p.term))}
        </div>
        ${p.notes?`<div style="margin-top:12px;color:var(--muted);font-size:13px;white-space:pre-wrap">${esc(p.notes)}</div>`:''}
      </div>
      <div class="card"><h3><i data-lucide="file-signature"></i> الاتفاقية والاعتماد</h3>
        ${step(!!p.printedAt,'طُبعت الاتفاقية من النظام'+(p.printedAt?` <span style="color:var(--muted);font-size:12px">(${pkFmt(p.printedAt.slice(0,10))})</span>`:''))}
        ${step(!!p.sig,'توقيع الطرف الثاني الإلكتروني'+(p.sig?' ✓':' (اختياري)'))}
        ${step(!!signedDoc,'رُفعت النسخة الموقّعة'+(signedDoc?` <span style="color:var(--muted);font-size:12px">(${pkFmt(signedDoc.at.slice(0,10))})</span>`:''))}
        ${step(p.status==='active','اعتُمد الشريك'+(p.approvedAt?` <span style="color:var(--muted);font-size:12px">(${pkFmt(p.approvedAt.slice(0,10))})</span>`:''))}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <button class="btn btn-ghost btn-sm" onclick="pkSignPartner('${p.id}')"><i data-lucide="pen-tool"></i> ${p.sig?'إعادة التوقيع':'توقيع إلكتروني'}</button>
          <button class="btn btn-ghost btn-sm" onclick="pkUploadDoc('${p.id}','signed')"><i data-lucide="upload"></i> رفع النسخة الموقّعة</button>
          <button class="btn btn-ghost btn-sm" onclick="pkUploadDoc('${p.id}','other')"><i data-lucide="paperclip"></i> مرفق آخر</button>
          ${p.status!=='active'?`<button class="btn btn-gold btn-sm" onclick="pkApprove('${p.id}')"><i data-lucide="badge-check"></i> اعتماد الشريك</button>`:
            `<button class="btn btn-ghost btn-sm" onclick="pkSetStatus('${p.id}')"><i data-lucide="settings-2"></i> تغيير الحالة</button>`}
        </div>
        ${p.status==='active'&&p.agreement?`<div style="font-size:12px;color:var(--muted);margin-top:10px"><i class="inl" data-lucide="lock"></i> البنود مجمّدة على نسخة يوم الاعتماد — تعديل القالب لا يغيّرها.</div>`:''}
        ${docs.length?`<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:10px">${docs.map((x,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0"><span><i class="inl" data-lucide="${x.kind==='signed'?'file-check':'file'}"></i> ${esc(x.name)}${x.kind==='signed'?' <span class="pill won">موقّعة</span>':''}</span><span style="white-space:nowrap"><button class="link-btn" onclick="pkOpenDoc('${p.id}',${i})">فتح</button> <button class="link-btn del" onclick="pkDelDoc('${p.id}',${i})">حذف</button></span></div>`).join('')}</div>`:''}
      </div>
    </div>
    <div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="school"></i> المدارس المسجّلة باسمه</h3>
      <button class="btn btn-gold btn-sm" onclick="pkLeadForm(null,'${p.id}')"><i data-lucide="plus"></i> تسجيل مدرسة</button></div>
      <div style="margin-top:12px">${leads.length?pkLeadsTable(leads,true):emptyBox('school','لا مدارس مسجّلة بعد.')}</div></div>
    <div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="wallet"></i> العمولات</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="pkStatementForm('${p.id}')"><i data-lucide="file-text"></i> كشف حساب</button>
      <button class="btn btn-ghost btn-sm" onclick="pkCommForm(null,'${p.id}')"><i data-lucide="plus"></i> عمولة يدوية</button></div></div>
      <div style="margin-top:12px">${comms.length?pkCommsTable(comms,true):emptyBox('wallet','لا عمولات بعد — تنشأ تلقائياً عند تسجيل بيعة.')}</div></div>
    <div class="card"><h3><i data-lucide="history"></i> السجل</h3>
      ${(p.log||[]).slice(0,40).map(e=>`<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--line);font-size:13px"><span style="color:var(--muted);white-space:nowrap" dir="ltr">${esc(e.at.slice(0,16).replace('T',' '))}</span><span>${esc(e.text)}</span></div>`).join('')||'<div style="color:var(--muted)">—</div>'}</div>`;
}
function pkApprove(id){
  const p=pkP(id);if(!p)return;
  const hasSigned=(p.docs||[]).some(x=>x.kind==='signed');
  if(!hasSigned&&!p.sig){if(!confirm('لم تُرفع نسخة موقّعة ولا يوجد توقيع إلكتروني للشريك.\nالاعتماد بدون إثبات توقيع يضعف حفظ الحقوق للطرفين.\n\nاعتماد على أي حال؟'))return}
  else if(!confirm('اعتماد '+p.name+'؟\nستُجمَّد بنود الاتفاقية الحالية على ملفه.'))return;
  p.agreement={articles:JSON.parse(JSON.stringify(pkArticles())),title:pkInit().title,subtitle:pkInit().subtitle,org:JSON.parse(JSON.stringify(pkInit().org)),frozenAt:pkNow()};
  p.status='active';p.approvedAt=pkNow();pkLog(p,'اعتُمد الشريك وجُمّدت بنود الاتفاقية');save();renderPartners();
}
function pkSetStatus(id){
  const p=pkP(id);if(!p)return;
  openModal('حالة الشريك',`<div class="field"><label>الحالة</label><select id="pk_st">${Object.entries(PK_STATUS).map(([k,s])=>`<option value="${k}" ${p.status===k?'selected':''}>${s.label}</option>`).join('')}</select></div>
    <div class="field"><label>سبب / ملاحظة (تُحفظ في السجل)</label><input id="pk_st_note"></div>`,()=>{
    const ns=pkVal('pk_st');if(ns!==p.status){pkLog(p,'تغيّرت الحالة إلى «'+PK_STATUS[ns].label+'»'+(pkVal('pk_st_note')?' — '+pkVal('pk_st_note'):''));p.status=ns;if(ns!=='active'&&ns!=='suspended'&&ns!=='ended'){p.agreement=null;p.approvedAt=null}}
    save();closeModal();renderPartners();});
}

/* ── المدارس المحالة ── */
function pkLeadsTable(list,inPartner){
  return `<div style="overflow:auto"><table><thead><tr><th>المدرسة</th>${inPartner?'':'<th>الشريك</th>'}<th>المرحلة</th><th>الخطوة الجاية</th><th>سُجّلت</th><th>الحماية</th><th>القيمة</th></tr></thead><tbody>
  ${list.map(l=>{const p=pkP(l.partnerId);const st=pkStage(l.stage);const exp=pkLeadExpiry(l);const dl=pkDaysTo(exp);const closed=['won','lost'].includes(l.stage);
    const nd=l.nextDate?pkDaysTo(l.nextDate):null;
    return `<tr><td style="cursor:pointer" onclick="pkLeadForm('${l.id}')"><b>${esc(l.school)}</b><div style="font-size:12px;color:var(--muted)">${esc([l.city,l.contact].filter(Boolean).join(' · '))}</div></td>
      ${inPartner?'':`<td>${p?`<a class="link-btn" onclick="pkOpen('${p.id}')">${esc(p.name)}</a>`:'—'}</td>`}
      <td><select class="status-select" style="min-width:120px;padding:6px 8px;font-size:13px" onchange="pkSetStage('${l.id}',this.value)">${PK_STAGES.map(s=>`<option value="${s.key}" ${l.stage===s.key?'selected':''}>${s.label}</option>`).join('')}</select></td>
      <td style="cursor:pointer" onclick="pkLeadForm('${l.id}')">${closed?'—':`${esc(l.nextAction||'—')}${l.nextDate?`<div style="font-size:12px;color:${nd<0?'var(--bad)':nd===0?'var(--gold)':'var(--muted)'}">${pkFmt(l.nextDate)}</div>`:''}`}</td>
      <td style="white-space:nowrap">${pkFmt(l.registeredAt)}</td>
      <td style="white-space:nowrap">${closed?'<span style="color:var(--muted)">—</span>':`<span class="pill ${dl<0?'lost':dl<=10?'progress':'done'}">${dl<0?'انتهت':'حتى '+pkFmt(exp)}</span>`}</td>
      <td style="white-space:nowrap">${l.stage==='won'?pkSar(l.value):'—'}${l.orgName?`<div style="font-size:12px;color:var(--muted)">${esc(l.orgName)}</div>`:''}</td></tr>`}).join('')}
  </tbody></table></div>`;
}
function pkViewLeads(){
  const f=PK_LF;let list=S.partnerLeads.slice();
  if(f.partner)list=list.filter(l=>l.partnerId===f.partner);
  if(f.stage==='open')list=list.filter(l=>!['won','lost'].includes(l.stage));else if(f.stage)list=list.filter(l=>l.stage===f.stage);
  if(f.q){const q=pkNorm(f.q);list=list.filter(l=>pkNorm(l.school+' '+l.city+' '+l.contact).includes(q))}
  list.sort((a,b)=>(a.nextDate||'9999').localeCompare(b.nextDate||'9999'));
  return `<div class="toolbar">
      <input style="max-width:240px" placeholder="بحث باسم المدرسة…" value="${esc(f.q)}" oninput="PK_LF.q=this.value;clearTimeout(window.__pkq);window.__pkq=setTimeout(()=>{renderPartners();const i=document.querySelector('#pkBody input');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)">
      <select style="max-width:200px" onchange="PK_LF.partner=this.value;renderPartners()"><option value="">كل الشركاء</option>${S.partners.map(p=>`<option value="${p.id}" ${f.partner===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>
      <select style="max-width:180px" onchange="PK_LF.stage=this.value;renderPartners()"><option value="open" ${f.stage==='open'?'selected':''}>قيد المتابعة</option><option value="" ${f.stage===''?'selected':''}>الكل</option>${PK_STAGES.map(s=>`<option value="${s.key}" ${f.stage===s.key?'selected':''}>${s.label}</option>`).join('')}</select>
    </div>${list.length?pkLeadsTable(list,false):emptyBox('school','لا مدارس بهذا الفلتر.')}`;
}
function pkLeadForm(id,partnerId){
  if(!S.partners.length){alert('أضف شريكاً أولاً — كل مدرسة تُسجَّل باسم شريك.');return}
  const l=id?pkL(id):null;const v=(f,dv)=>esc(l&&l[f]!=null?l[f]:(dv==null?'':dv));const pid=l?l.partnerId:(partnerId||PK_LF.partner||'');
  openModal(l?'المدرسة':'تسجيل مدرسة باسم شريك',`
    <div class="row2"><div class="field"><label>الشريك *</label><select id="pl_p">${S.partners.map(p=>`<option value="${p.id}" ${pid===p.id?'selected':''}>${esc(p.name)}${p.status!=='active'?' ('+PK_STATUS[p.status].label+')':''}</option>`).join('')}</select></div>
      <div class="field"><label>المرحلة</label><select id="pl_stage">${PK_STAGES.map(s=>`<option value="${s.key}" ${(l?l.stage:'registered')===s.key?'selected':''}>${s.label}</option>`).join('')}</select></div></div>
    <div class="row2"><div class="field"><label>اسم المدرسة / الجهة *</label><input id="pl_school" value="${v('school')}"></div>
      <div class="field"><label>المدينة</label><input id="pl_city" value="${v('city')}"></div></div>
    <div class="row2"><div class="field"><label>اسم المسؤول</label><input id="pl_contact" value="${v('contact')}"></div>
      <div class="field"><label>جوال المسؤول</label><input id="pl_phone" inputmode="tel" value="${v('phone')}"></div></div>
    <div class="row2"><div class="field"><label>تاريخ التسجيل (يبدأ منه حق الشريك)</label><input id="pl_reg" type="date" value="${v('registeredAt',today())}"></div>
      <div class="field"><label>عدد الطلاب / المعلمين المتوقع</label><input id="pl_size" value="${v('size')}"></div></div>
    <div class="row2"><div class="field"><label>الخطوة الجاية</label><input id="pl_next" value="${v('nextAction')}" placeholder="مثلاً: عرض تجريبي للمدير"></div>
      <div class="field"><label>موعدها</label><input id="pl_nextd" type="date" value="${v('nextDate')}"></div></div>
    <div class="field"><label>ملاحظات</label><textarea id="pl_notes" rows="2">${v('notes')}</textarea></div>
    <div id="pl_dup" style="color:var(--warn);font-size:13px"></div>
    ${l&&l.stage==='won'?`<div class="badge-note"><i data-lucide="badge-check"></i><div>تم البيع بقيمة <b>${pkSar(l.value)}</b>${l.orgName?' — مربوطة بحزمة «'+esc(l.orgName)+'»':''}. لإضافة دفعة أو ترقية: من صفحة الشريك ← «عمولة يدوية».</div></div>`:''}`,
  ()=>{
    const school=pkVal('pl_school');const partnerId2=pkVal('pl_p');if(!school){alert('اكتب اسم المدرسة.');return}
    const n=pkNorm(school);const dup=S.partnerLeads.find(x=>x.id!==(l&&l.id)&&pkNorm(x.school)===n&&x.stage!=='lost'&&pkDaysTo(pkLeadExpiry(x))>=0);
    if(dup&&dup.partnerId!==partnerId2){const dp=pkP(dup.partnerId);if(!confirm(`تنبيه: «${dup.school}» مسجّلة مسبقاً باسم ${dp?dp.name:'شريك آخر'} بتاريخ ${pkFmt(dup.registeredAt)} وحمايتها سارية.\nالأولوية لمن سجّل أولاً.\n\nتسجيلها رغم ذلك؟`))return}
    const isNew=!l;const o=l||{id:uid(),createdAt:pkNow(),log:[]};const prevStage=o.stage;
    Object.assign(o,{partnerId:partnerId2,school,city:pkVal('pl_city'),contact:pkVal('pl_contact'),phone:pkVal('pl_phone'),registeredAt:pkVal('pl_reg')||today(),
      size:pkVal('pl_size'),nextAction:pkVal('pl_next'),nextDate:pkVal('pl_nextd'),notes:pkVal('pl_notes'),stage:pkVal('pl_stage')||'registered'});
    if(isNew){S.partnerLeads.push(o);pkLog(pkP(partnerId2),'سُجّلت مدرسة باسمه: '+school+' ('+pkFmt(o.registeredAt)+')')}
    save();closeModal();
    if(o.stage==='won'&&prevStage!=='won'){o.stage=prevStage||'offer';save();pkWinForm(o.id);return}
    renderPartners();
  },l?()=>{if(S.partnerComms.some(c=>c.leadId===l.id)){alert('عليها عمولات مسجّلة — احذف العمولات أولاً أو غيّر المرحلة إلى «لم تتم».');return}if(!confirm('حذف المدرسة؟'))return;S.partnerLeads=S.partnerLeads.filter(x=>x.id!==l.id);save();closeModal();renderPartners()}:null);
}
function pkSetStage(id,stage){
  const l=pkL(id);if(!l)return;
  if(stage==='won'&&l.stage!=='won'){pkWinForm(id);renderPartners();return}
  if(l.stage==='won'&&stage!=='won'&&S.partnerComms.some(c=>c.leadId===id&&c.status==='paid')){alert('صُرفت عمولة على هذه البيعة — لا يمكن إرجاع المرحلة. سجّل استرداداً كعمولة سالبة إن لزم.');renderPartners();return}
  l.stage=stage;if(['won','lost'].includes(stage)){l.nextDate='';}
  pkLog(pkP(l.partnerId),'«'+l.school+'» ← '+pkStage(stage).label);save();renderPartners();
}
async function pkLoadOrgs(){if(PK_ORGS)return PK_ORGS;try{const b=await hrApi('admin/organizations');PK_ORGS=b.organizations||[]}catch(e){PK_ORGS=[]}return PK_ORGS}
function pkWinForm(id){
  const l=pkL(id);if(!l)return;const p=pkP(l.partnerId);const rate=Number((p&&p.rate)||pkInit().defaults.rate);
  const exp=pkLeadExpiry(l);const expired=pkDaysTo(exp)<0;
  openModal('تم البيع — '+esc(l.school),`
    ${expired?`<div class="badge-note" style="margin-bottom:12px"><i data-lucide="shield-alert"></i><div>انتهت مدة حماية الشريك في ${pkFmt(exp)}. حسب الاتفاقية لا يستحق عمولة إلا إذا مُدّدت كتابياً. يمكنك إلغاء «إنشاء عمولة» بالأسفل.</div></div>`:''}
    <div class="row2"><div class="field"><label>صافي المبلغ المحصَّل (بدون الضريبة) *</label><input id="pw_amt" type="number" min="0" step="0.01" oninput="document.getElementById('pw_c').textContent=(Number(this.value||0)*${rate}/100).toLocaleString('en-US',{maximumFractionDigits:2})"></div>
      <div class="field"><label>تاريخ التحصيل</label><input id="pw_date" type="date" value="${today()}"></div></div>
    <div class="field"><label>ربط بحزمة المدرسة في حروف ودروس (اختياري)</label><select id="pw_org"><option value="">…جارٍ تحميل الحزم</option></select></div>
    <div class="field"><label>وصف</label><input id="pw_desc" value="الاشتراك الأول — ${esc(l.school)}"></div>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><input type="checkbox" id="pw_mk" style="width:auto" ${expired?'':'checked'}> إنشاء عمولة مستحقّة للشريك (${rate}%) = <b id="pw_c">0</b> ر.س</label>`,
  ()=>{
    const amt=Number(pkVal('pw_amt'));if(!(amt>0)){alert('اكتب المبلغ المحصَّل.');return}
    const sel=document.getElementById('pw_org');const orgId=sel.value;const orgName=orgId?sel.options[sel.selectedIndex].text:'';
    l.stage='won';l.value=Number(l.value||0)+amt;l.wonAt=pkVal('pw_date')||today();l.nextDate='';if(orgId){l.orgId=orgId;l.orgName=orgName}
    if(document.getElementById('pw_mk').checked){S.partnerComms.push({id:uid(),partnerId:l.partnerId,leadId:l.id,desc:pkVal('pw_desc')||l.school,base:amt,rate,amount:Math.round(amt*rate)/100,collectedAt:l.wonAt,status:'due',createdAt:pkNow()})}
    pkLog(p,'تم البيع لـ«'+l.school+'» بصافي '+pkSar(amt)+(document.getElementById('pw_mk').checked?' — عمولة مستحقة '+pkSar(amt*rate/100):''));
    save();closeModal();renderPartners();
  });
  pkLoadOrgs().then(orgs=>{const sel=document.getElementById('pw_org');if(!sel)return;const n=pkNorm(l.school);
    sel.innerHTML='<option value="">— بدون ربط —</option>'+orgs.map(o=>`<option value="${esc(o.id)}" ${pkNorm(o.name)===n?'selected':''}>${esc(o.name)}${o.city?' · '+esc(o.city):''}</option>`).join('');});
}

/* ── العمولات ── */
function pkCommsTable(list,inPartner){
  return `<div style="overflow:auto"><table><thead><tr><th>البيان</th>${inPartner?'':'<th>الشريك</th>'}<th>التحصيل</th><th>المبلغ الصافي</th><th>العمولة</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${list.map(c=>{const p=pkP(c.partnerId);return `<tr><td>${esc(c.desc||'')}</td>${inPartner?'':`<td>${p?`<a class="link-btn" onclick="pkOpen('${p.id}')">${esc(p.name)}</a>`:'—'}</td>`}
    <td style="white-space:nowrap">${pkFmt(c.collectedAt)}</td><td style="white-space:nowrap">${pkSar(c.base)}</td><td style="white-space:nowrap"><b>${pkSar(c.amount)}</b> <span style="color:var(--muted);font-size:12px">${c.rate}%</span></td>
    <td>${c.status==='paid'?`<span class="pill paid">صُرفت ${pkFmt(c.paidAt)}</span>${c.ref?`<div style="font-size:11px;color:var(--muted)">${esc(c.ref)}</div>`:''}`:'<span class="pill unpaid">مستحقة</span>'}</td>
    <td style="white-space:nowrap">${c.status!=='paid'?`<button class="btn btn-gold btn-sm" onclick="pkPayForm('${c.id}')">صرف</button> `:''}<button class="link-btn" onclick="pkCommForm('${c.id}')">تعديل</button></td></tr>`}).join('')}
  </tbody></table></div>`;
}
function pkViewComms(){
  const f=PK_CF;let list=S.partnerComms.slice();if(f.partner)list=list.filter(c=>c.partnerId===f.partner);if(f.status)list=list.filter(c=>(c.status||'due')===f.status);
  list.sort((a,b)=>(b.collectedAt||'').localeCompare(a.collectedAt||''));
  const due=list.filter(c=>c.status!=='paid').reduce((a,c)=>a+Number(c.amount||0),0);
  return `<div class="toolbar">
      <select style="max-width:200px" onchange="PK_CF.partner=this.value;renderPartners()"><option value="">كل الشركاء</option>${S.partners.map(p=>`<option value="${p.id}" ${f.partner===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>
      <select style="max-width:160px" onchange="PK_CF.status=this.value;renderPartners()"><option value="">الكل</option><option value="due" ${f.status==='due'?'selected':''}>مستحقة</option><option value="paid" ${f.status==='paid'?'selected':''}>مصروفة</option></select>
      <span style="margin-inline-start:auto;font-weight:700">المستحق في القائمة: ${pkSar(due)}</span>
    </div>${list.length?pkCommsTable(list,false):emptyBox('wallet','لا عمولات — تنشأ تلقائياً عند تحويل مدرسة إلى «تم البيع».')}`;
}
function pkCommForm(id,partnerId){
  const c=id?S.partnerComms.find(x=>x.id===id):null;const pid=c?c.partnerId:partnerId;const p=pkP(pid);if(!p){alert('اختر شريكاً.');return}
  const leads=S.partnerLeads.filter(l=>l.partnerId===pid);const rate=c?c.rate:Number(p.rate||10);
  openModal(c?'تعديل عمولة':'عمولة يدوية — '+esc(p.name),`
    <div class="field"><label>المدرسة</label><select id="pc_lead"><option value="">— بدون —</option>${leads.map(l=>`<option value="${l.id}" ${c&&c.leadId===l.id?'selected':''}>${esc(l.school)}</option>`).join('')}</select></div>
    <div class="field"><label>البيان</label><input id="pc_desc" value="${esc(c?c.desc:'دفعة / ترقية')}"></div>
    <div class="row3"><div class="field"><label>المبلغ الصافي المحصَّل</label><input id="pc_base" type="number" step="0.01" value="${c?c.base:''}"></div>
      <div class="field"><label>النسبة %</label><input id="pc_rate" type="number" step="0.5" value="${rate}"></div>
      <div class="field"><label>تاريخ التحصيل</label><input id="pc_date" type="date" value="${c?c.collectedAt:today()}"></div></div>
    <div style="color:var(--muted);font-size:12px">للاسترداد: اكتب المبلغ بالسالب فتُخصم من المستحق.</div>`,
  ()=>{const base=Number(pkVal('pc_base'));if(!base){alert('اكتب المبلغ.');return}const r=Number(pkVal('pc_rate')||rate);
    const o=c||{id:uid(),partnerId:pid,status:'due',createdAt:pkNow()};
    Object.assign(o,{leadId:pkVal('pc_lead'),desc:pkVal('pc_desc'),base,rate:r,amount:Math.round(base*r)/100,collectedAt:pkVal('pc_date')||today()});
    if(!c){S.partnerComms.push(o);pkLog(p,'عمولة يدوية: '+o.desc+' — '+pkSar(o.amount))}else pkLog(p,'عُدّلت عمولة: '+o.desc);
    save();closeModal();renderPartners();},
  c?()=>{if(c.status==='paid'&&!confirm('هذه العمولة مصروفة — حذفها يمحو أثر الصرف. متأكد؟'))return;else if(c.status!=='paid'&&!confirm('حذف العمولة؟'))return;S.partnerComms=S.partnerComms.filter(x=>x.id!==c.id);pkLog(p,'حُذفت عمولة: '+(c.desc||''));save();closeModal();renderPartners()}:null);
}
function pkPayForm(id){
  const c=S.partnerComms.find(x=>x.id===id);if(!c)return;const p=pkP(c.partnerId);
  openModal('صرف عمولة — '+pkSar(c.amount),`
    <div class="badge-note" style="margin-bottom:12px"><i data-lucide="landmark"></i><div>حوّل إلى: <b>${esc(p&&p.name)}</b><br>${esc((p&&p.bank)||'')} — <span dir="ltr">${esc((p&&p.iban)||'لا يوجد آيبان')}</span></div></div>
    <div class="row2"><div class="field"><label>تاريخ التحويل</label><input id="pp_date" type="date" value="${today()}"></div>
      <div class="field"><label>رقم مرجع التحويل</label><input id="pp_ref"></div></div>`,
  ()=>{c.status='paid';c.paidAt=pkVal('pp_date')||today();c.ref=pkVal('pp_ref');pkLog(p,'صُرفت عمولة '+pkSar(c.amount)+' ('+(c.desc||'')+')'+(c.ref?' مرجع '+c.ref:''));save();closeModal();renderPartners();});
}

/* ── قالب الاتفاقية ── */
function pkViewTemplate(){
  const k=pkInit();const arts=pkArticles();const o=k.org,d=k.defaults;
  return `
    <div class="card" style="margin-bottom:16px"><h3><i data-lucide="settings"></i> الإعداد (مرة واحدة)</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">
        <div><div style="font-weight:700;margin-bottom:6px">ختم المؤسسة</div>
          <div style="color:var(--muted);font-size:13px;margin-bottom:8px">${k.stampPath?'✓ مرفوع — يُطبع أسفل كل صفحة كما في الورق الرسمي.':'لم يُرفع بعد. ارفع ملف الختم PNG (موجود في: حروف ودروس ← 04_الهوية_البصرية ← الختم). يُحفظ في تخزين خاص غير عام.'}</div>
          <button class="btn btn-ghost btn-sm" onclick="pkUploadStamp()"><i data-lucide="stamp"></i> ${k.stampPath?'استبدال الختم':'رفع الختم'}</button></div>
        <div><div style="font-weight:700;margin-bottom:6px">توقيعك (الطرف الأول)</div>
          ${k.ownerSig?`<img src="${k.ownerSig}" style="height:54px;background:#fff;border-radius:8px;padding:4px;display:block;margin-bottom:8px">`:'<div style="color:var(--muted);font-size:13px;margin-bottom:8px">اختياري — إن رسمته يُطبع في خانة توقيعك. وإلا توقّع بالقلم.</div>'}
          <button class="btn btn-ghost btn-sm" onclick="pkSignOwner()"><i data-lucide="pen-tool"></i> ${k.ownerSig?'إعادة الرسم':'ارسم توقيعك'}</button>
          <button class="btn btn-ghost btn-sm" onclick="pkSigUpload()"><i data-lucide="image-up"></i> رفع صورة التوقيع</button>
          ${k.ownerSig?`<button class="link-btn del" onclick="S.partnerKit.ownerSig='';save();renderPartners()">حذف</button>`:''}</div>
      </div></div>
    <div class="card" style="margin-bottom:16px"><h3><i data-lucide="building-2"></i> بيانات الطرف الأول والقيم الافتراضية</h3>
      <div class="row2"><div class="field"><label>عنوان الاتفاقية</label><input id="pt_title" value="${esc(k.title)}"></div><div class="field"><label>العنوان الفرعي</label><input id="pt_sub" value="${esc(k.subtitle)}"></div></div>
      <div class="row3"><div class="field"><label>اسم المؤسسة</label><input id="pt_on" value="${esc(o.name)}"></div><div class="field"><label>الرقم الوطني الموحد</label><input id="pt_ou" value="${esc(o.unified)}"></div><div class="field"><label>المقر</label><input id="pt_oc" value="${esc(o.city)}"></div></div>
      <div class="row3"><div class="field"><label>يمثلها</label><input id="pt_or" value="${esc(o.rep)}"></div><div class="field"><label>الصفة</label><input id="pt_ot" value="${esc(o.repTitle)}"></div><div class="field"><label>البريد</label><input id="pt_oe" value="${esc(o.email)}"></div></div>
      <div class="row3"><div class="field"><label>العمولة الافتراضية %</label><input id="pt_dr" type="number" value="${d.rate}"></div><div class="field"><label>حماية المدرسة (يوم)</label><input id="pt_dp" type="number" value="${d.protectDays}"></div><div class="field"><label>تأكيد التسجيل خلال (يوم عمل)</label><input id="pt_dc" type="number" value="${d.confirmDays}"></div></div>
      <div class="row3"><div class="field"><label>شمول الترقيات (شهر)</label><input id="pt_dm" type="number" value="${d.renewMonths}"></div><div class="field"><label>صرف العمولة خلال (يوم عمل)</label><input id="pt_dy" type="number" value="${d.payDays}"></div><div class="field"><label>مدة الاتفاقية</label><input id="pt_dt" value="${esc(d.term)}"></div></div>
      <div class="field" style="max-width:220px"><label>بادئة رقم الاتفاقية</label><input id="pt_px" dir="ltr" value="${esc(k.prefix)}"></div>
    </div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="list-ordered"></i> بنود الاتفاقية</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="pkTplSave(true);pkPrintAgreement(null)"><i data-lucide="eye"></i> معاينة الطباعة</button>
      <button class="btn btn-ghost btn-sm" onclick="pkTplReset()"><i data-lucide="rotate-ccw"></i> استعادة البنود الأصلية</button>
      <button class="btn btn-gold btn-sm" onclick="pkTplSave()"><i data-lucide="save"></i> حفظ القالب</button></div></div>
      <div class="badge-note" style="margin:12px 0"><i data-lucide="info"></i><div>السطر الذي يبدأ بـ<b>«- »</b> يصير بنداً مرقّماً، و<b>**نص**</b> يصير عريضاً. المتغيّرات تُستبدل تلقائياً من بيانات كل شريك:
        <code>{COMMISSION}</code> <code>{PROTECT_DAYS}</code> <code>{CONFIRM_DAYS}</code> <code>{RENEW_MONTHS}</code> <code>{PAY_DAYS}</code> <code>{TERM}</code> <code>{EXAMPLE}</code>.
        الاتفاقيات <b>المعتمدة</b> لا تتأثر بتعديل القالب.</div></div>
      <div id="pkArts">${arts.map((a,i)=>pkArtRow(a,i,arts.length)).join('')}</div>
      <button class="btn btn-ghost btn-sm" onclick="pkArtAdd()"><i data-lucide="plus"></i> إضافة مادة</button>
    </div>`;
}
function pkArtRow(a,i,n){return `<div class="pk-art" style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px">
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><input class="pk-at" value="${esc(a.t)}" style="font-weight:700">
    <button class="btn btn-ghost btn-sm" title="أعلى" onclick="pkArtMove(${i},-1)" ${i===0?'disabled':''}><i data-lucide="arrow-up"></i></button>
    <button class="btn btn-ghost btn-sm" title="أسفل" onclick="pkArtMove(${i},1)" ${i===n-1?'disabled':''}><i data-lucide="arrow-down"></i></button>
    <button class="btn btn-ghost btn-sm" title="حذف" style="color:var(--bad)" onclick="pkArtDel(${i})"><i data-lucide="trash-2"></i></button></div>
  <textarea class="pk-ab" rows="${Math.min(14,Math.max(3,String(a.b).split('\n').length+2))}" style="line-height:1.8">${esc(a.b)}</textarea></div>`}
function pkCollectArts(){return [...document.querySelectorAll('#pkArts .pk-art')].map(el=>({t:el.querySelector('.pk-at').value.trim(),b:el.querySelector('.pk-ab').value.trim()})).filter(a=>a.t||a.b)}
function pkTplSave(silent){
  const k=pkInit();if(!document.getElementById('pkArts'))return;
  k.articles=pkCollectArts();k.title=pkVal('pt_title')||k.title;k.subtitle=pkVal('pt_sub');
  Object.assign(k.org,{name:pkVal('pt_on'),unified:pkVal('pt_ou'),city:pkVal('pt_oc'),rep:pkVal('pt_or'),repTitle:pkVal('pt_ot'),email:pkVal('pt_oe')});
  Object.assign(k.defaults,{rate:Number(pkVal('pt_dr')||10),protectDays:Number(pkVal('pt_dp')||90),confirmDays:Number(pkVal('pt_dc')||3),renewMonths:Number(pkVal('pt_dm')||12),payDays:Number(pkVal('pt_dy')||10),term:pkVal('pt_dt')||'سنة واحدة'});
  k.prefix=pkVal('pt_px')||'HD-S-';save();if(!silent){renderPartners();alert('تم حفظ القالب ✓')}
}
function pkArtMove(i,dir){const a=pkCollectArts();const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];pkInit().articles=a;pkTplSave(true);renderPartners()}
function pkArtDel(i){if(!confirm('حذف هذه المادة؟'))return;const a=pkCollectArts();a.splice(i,1);pkInit().articles=a;pkTplSave(true);renderPartners()}
function pkArtAdd(){const a=pkCollectArts();a.push({t:'المادة '+(a.length+1)+': ',b:''});pkInit().articles=a;pkTplSave(true);renderPartners();setTimeout(()=>{const els=document.querySelectorAll('#pkArts .pk-at');const el=els[els.length-1];if(el){el.focus();el.scrollIntoView({block:'center'})}},50)}
function pkTplReset(){if(!confirm('استعادة البنود الأصلية؟ تعديلاتك على البنود ستُمحى (الاتفاقيات المعتمدة لا تتأثر).'))return;pkInit().articles=null;save();renderPartners()}

/* ===== التوقيع الإلكتروني (لوحة رسم) ===== */
function pkSigPad(title,note,cb){
  openModal(title,`<div style="color:var(--muted);font-size:13px;margin-bottom:8px">${note}</div>
    <div style="background:#fff;border-radius:12px;touch-action:none"><canvas id="pkSig" style="width:100%;height:220px;display:block;border-radius:12px;cursor:crosshair"></canvas></div>
    <div style="display:flex;justify-content:space-between;margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="pkSigClear()"><i data-lucide="eraser"></i> مسح</button><span style="color:var(--muted);font-size:12px">ارسم بإصبعك أو بالماوس</span></div>`,
  ()=>{const c=document.getElementById('pkSig');if(!c.__dirty){alert('ارسم التوقيع أولاً.');return}cb(pkSigTrim(c));closeModal();});
  setTimeout(()=>{const c=document.getElementById('pkSig');if(!c)return;const r=c.getBoundingClientRect();const dpr=window.devicePixelRatio||1;c.width=r.width*dpr;c.height=r.height*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);x.lineWidth=2.6;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#0b1b4a';
    let down=false,last=null;const pos=e=>{const b=c.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top}};
    c.onpointerdown=e=>{down=true;last=pos(e);c.setPointerCapture(e.pointerId);x.beginPath();x.arc(last.x,last.y,1.2,0,7);x.fillStyle='#0b1b4a';x.fill();c.__dirty=true};
    c.onpointermove=e=>{if(!down)return;const p=pos(e);x.beginPath();x.moveTo(last.x,last.y);x.lineTo(p.x,p.y);x.stroke();last=p};
    c.onpointerup=c.onpointercancel=()=>{down=false};},60);
}
function pkSigClear(){const c=document.getElementById('pkSig');if(!c)return;c.getContext('2d').clearRect(0,0,c.width,c.height);c.__dirty=false}
function pkSigTrim(c){const x=c.getContext('2d');const {width:w,height:h}=c;const d=x.getImageData(0,0,w,h).data;let t=h,l=w,r=0,b=0;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){if(d[(y*w+i)*4+3]>10){if(y<t)t=y;if(y>b)b=y;if(i<l)l=i;if(i>r)r=i}}
  if(r<=l||b<=t)return c.toDataURL('image/png');const pad=8;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(w,r+pad);b=Math.min(h,b+pad);
  const o=document.createElement('canvas');const sc=Math.min(1,320/(r-l));o.width=Math.round((r-l)*sc);o.height=Math.round((b-t)*sc);o.getContext('2d').drawImage(c,l,t,r-l,b-t,0,0,o.width,o.height);return o.toDataURL('image/png')}
function pkSignPartner(id){const p=pkP(id);if(!p)return;pkSigPad('توقيع '+esc(p.name),'يوقّع الشريك بنفسه على هذا الجهاز بعد قراءة الاتفاقية. يُطبع التوقيع في خانته ويُحفظ مع وقت التوقيع.',sig=>{p.sig=sig;p.sigAt=pkNow();if(p.status==='draft')p.status='pending';pkLog(p,'وقّع الشريك إلكترونياً');save();renderPartners()})}
/* صورة توقيع (ورقة بيضاء/صورة جوال) → إزالة الخلفية الفاتحة + قصّ + تصغير → يُحفظ في حالة اللوحة (خاصّة) */
function pkSigUpload(){pkPickFile('image/*',f=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{
  const sc=Math.min(1,1400/img.width);const c=document.createElement('canvas');c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
  const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);const id=x.getImageData(0,0,c.width,c.height);const d=id.data;
  for(let i=0;i<d.length;i+=4){const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];if(lum>200)d[i+3]=0;else if(lum>150)d[i+3]=Math.min(d[i+3],Math.round((200-lum)/50*255));}
  x.putImageData(id,0,0);const out=pkSigTrim(c);pkInit().ownerSig=out;save();renderPartners();alert('تم حفظ توقيعك ✓ — سيُطبع تلقائياً في كل اتفاقية.')};img.src=fr.result};fr.readAsDataURL(f)})}
function pkSignOwner(){pkSigPad('توقيعك','يُطبع في خانة توقيع الطرف الأول في كل اتفاقية.',sig=>{pkInit().ownerSig=sig;save();renderPartners()})}

/* ===== الملفّات (حاوية partner-docs الخاصّة) ===== */
function pkPickFile(accept,cb){const i=document.createElement('input');i.type='file';i.accept=accept;i.onchange=()=>{if(i.files&&i.files[0])cb(i.files[0])};i.click()}
async function pkUpload(file,folder){
  if(!USER)throw new Error('رفع الملفات متاح بعد تسجيل الدخول فقط (لا يعمل في وضع التجربة).');
  if(file.size>20*1024*1024)throw new Error('الملف أكبر من 20MB.');
  const ext=(file.name.split('.').pop()||'pdf').toLowerCase().replace(/[^a-z0-9]/g,'')||'bin';
  const path=`${folder}/${Date.now()}_${uid()}.${ext}`;
  const {error}=await sb.storage.from(PK_BUCKET).upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
  if(error)throw error;return path;
}
async function pkSignedUrl(path,sec){const {data,error}=await sb.storage.from(PK_BUCKET).createSignedUrl(path,sec||600);if(error)throw error;return data.signedUrl}
function pkUploadDoc(id,kind){const p=pkP(id);if(!p)return;pkPickFile('application/pdf,image/*',async f=>{
  try{const path=await pkUpload(f,'partners/'+p.id);if(!Array.isArray(p.docs))p.docs=[];
    p.docs.unshift({kind,name:(kind==='signed'?'الاتفاقية الموقّعة — ':'')+f.name,path,at:pkNow()});
    if(kind==='signed'&&p.status==='draft')p.status='pending';
    pkLog(p,kind==='signed'?'رُفعت النسخة الموقّعة: '+f.name:'رُفع مرفق: '+f.name);save();renderPartners();
  }catch(e){alert('تعذّر الرفع: '+(e.message||e))}})}
async function pkOpenDoc(id,i){const p=pkP(id);const d=p&&p.docs&&p.docs[i];if(!d)return;const w=window.open('about:blank','_blank');try{const u=await pkSignedUrl(d.path,300);if(w)w.location=u;else location.href=u}catch(e){if(w)w.close();alert('تعذّر فتح الملف: '+(e.message||e))}}
async function pkDelDoc(id,i){const p=pkP(id);const d=p&&p.docs&&p.docs[i];if(!d||!confirm('حذف «'+d.name+'» نهائياً؟'))return;try{await sb.storage.from(PK_BUCKET).remove([d.path])}catch(e){}p.docs.splice(i,1);pkLog(p,'حُذف ملف: '+d.name);save();renderPartners()}
function pkUploadStamp(){pkPickFile('image/png,image/*',async f=>{try{const path=await pkUpload(f,'kit');const k=pkInit();if(k.stampPath){try{await sb.storage.from(PK_BUCKET).remove([k.stampPath])}catch(e){}}k.stampPath=path;save();renderPartners();alert('تم رفع الختم ✓')}catch(e){alert('تعذّر الرفع: '+(e.message||e))}})}

/* ===== الطباعة على الورق الرسمي ===== */
async function pkToDataUrl(url){try{const r=await fetch(url);if(!r.ok)return '';const b=await r.blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=()=>res('');fr.readAsDataURL(b)})}catch(e){return ''}}
async function pkAssets(){
  const k=pkInit();const lh=await pkToDataUrl(new URL(PK_LETTERHEAD,location.href).href);
  let stamp='';if(k.stampPath&&USER){try{stamp=await pkToDataUrl(await pkSignedUrl(k.stampPath,120))}catch(e){}}
  return {lh,stamp};
}
function pkDocShell(title,inner,assets,footer){
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html{margin:0;padding:0;background:#fff}
    body{margin:0;padding:0;background:transparent}
    body{font-family:'Rubik',Tahoma,sans-serif;color:#1d2433;font-size:10.4pt;line-height:1.75}
    .lh{position:fixed;top:0;left:0;width:210mm;height:297mm;z-index:-2}
    .stamp{position:fixed;left:10.2mm;top:262mm;width:27.1mm;height:26.2mm;z-index:-1;object-fit:contain}
    table.pg{width:210mm;border-collapse:collapse}
    table.pg>thead td{height:44mm;padding:0}
    table.pg>tfoot td{height:40mm;padding:0;vertical-align:bottom}
    table.pg>tbody>tr>td{padding:0 17mm}
    .foot{text-align:center;font-size:7.5pt;color:#8a90a0;padding-bottom:9mm}
    h1{font-size:19pt;color:#173264;text-align:center;margin:0}
    .sub{text-align:center;color:#5b6274;margin:2px 0 10px}
    .meta{display:flex;justify-content:space-between;font-size:10pt;margin:8px 0 10px}
    .meta b{color:#173264}
    table.kv{width:100%;border-collapse:collapse;margin:4px 0 2px;font-size:9.8pt;page-break-inside:avoid}
    table.kv th{background:#173264;color:#fff;text-align:right;padding:5px 9px;font-weight:700}
    table.kv td{border:1px solid #d5dae5;padding:4px 9px}
    table.kv td.k{background:#f3f5f9;color:#173264;font-weight:700;width:26%}
    .note{color:#6b7280;font-size:9pt;margin:2px 0 8px}
    h2{font-size:11.5pt;color:#173264;margin:12px 0 4px;padding-bottom:3px;border-bottom:1.5px solid #FF9000;page-break-after:avoid}
    p{margin:0 0 5px;text-align:justify}
    p.ex{color:#5b6274;font-size:9.5pt}
    ol{margin:0 0 5px;padding-inline-start:20px}
    ol li{margin-bottom:3px;text-align:justify}
    ol li::marker{color:#173264;font-weight:700}
    .end{text-align:center;color:#173264;font-weight:700;margin:12px 0 10px}
    table.sig{width:100%;border-collapse:collapse;page-break-inside:avoid;font-size:10pt}
    table.sig th{background:#173264;color:#fff;padding:6px;width:50%}
    table.sig td{border:1px solid #d5dae5;padding:6px 10px;vertical-align:top;height:9mm}
    table.sig td.s{height:24mm}
    table.sig img{max-height:21mm;max-width:60mm;display:block;margin-top:2px}
    table.sig .k{color:#173264;font-weight:700}
    table.list{width:100%;border-collapse:collapse;font-size:9.6pt;margin:6px 0}
    table.list th{background:#173264;color:#fff;padding:5px 7px;text-align:right}
    table.list td{border:1px solid #d5dae5;padding:5px 7px}
    table.list tr.tot td{background:#f3f5f9;font-weight:700;color:#173264}
    .hl{background:#fff3b0}
  </style></head><body>
  ${assets.lh?`<img class="lh" src="${assets.lh}">`:''}${assets.stamp?`<img class="stamp" src="${assets.stamp}">`:''}
  <table class="pg"><thead><tr><td></td></tr></thead><tfoot><tr><td><div class="foot">${esc(footer||'')}</div></td></tr></tfoot>
  <tbody><tr><td>${inner}</td></tr></tbody></table></body></html>`;
}
function pkAgreementHTML(p){
  const k=pkInit();const frozen=p&&p.status==='active'&&p.agreement;
  const arts=frozen?p.agreement.articles:pkArticles();const org=frozen?p.agreement.org:k.org;
  const title=frozen?p.agreement.title:k.title;const sub=frozen?p.agreement.subtitle:k.subtitle;
  const vars=pkVars(p);const blank='<span class="hl">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
  const f=v=>v?esc(v):blank;const dt=p&&p.agreementDate;
  const row=(kk,v)=>`<tr><td class="k">${kk}</td><td>${v}</td></tr>`;
  return `
    <h1>${esc(title)}</h1><div class="sub">${esc(sub||'')}</div>
    <div class="meta"><span><b>رقم الاتفاقية:</b> ${p?esc(p.no):blank}</span><span><b>تاريخ الإبرام:</b> ${dt?pkHijri(dt)+' الموافق '+pkFmt(dt)+'م':blank}</span></div>
    <p>إنه في يوم ${dt?pkDay(dt):blank} الموافق للتاريخ المذكور أعلاه، تم الاتفاق بين كلٍّ من:</p>
    <table class="kv"><tr><th colspan="2">الطرف الأول</th></tr>
      ${row('الاسم','<b>'+esc(org.name)+'</b>')}${row('الرقم الوطني الموحد',esc(org.unified))}${row('المقر',esc(org.city))}${row('يمثلها',esc(org.rep)+' — بصفته '+esc(org.repTitle))}${row('البريد الإلكتروني',esc(org.email))}</table>
    <div class="note">ويُشار إليها فيما بعد بـ «الطرف الأول» أو «المؤسسة».</div>
    <table class="kv"><tr><th colspan="2">الطرف الثاني</th></tr>
      ${row('الاسم','<b>'+f(p&&p.name)+'</b>')}${row('الجنسية',f(p&&p.nationality))}${row('رقم الهوية / الإقامة',f(p&&p.idNo))}${row('المدينة / العنوان',f(p&&p.city))}
      ${row('رقم الجوال',`<span dir="ltr">${f(p&&p.phone)}</span>`)}${row('البريد الإلكتروني',f(p&&p.email))}${row('البنك / رقم الآيبان',`${f(p&&p.bank)} — <span dir="ltr">${f(p&&p.iban)}</span>`)}</table>
    <div class="note">ويُشار إليه فيما بعد بـ «الطرف الثاني» أو «المسوّق».</div>
    <p>وقد اتفق الطرفان، وهما بكامل أهليتهما المعتبرة شرعًا ونظامًا، على إبرام هذه الاتفاقية وفقًا للبنود الآتية:</p>
    ${arts.map(a=>`<h2>${esc(a.t)}</h2>${pkBodyHTML(pkFill(a.b,vars))}`).join('')}
    <div class="end">والله ولي التوفيق،،،</div>
    <table class="sig"><tr><th>الطرف الأول</th><th>الطرف الثاني</th></tr>
      <tr><td><span class="k">الجهة:</span> ${esc(org.name)}</td><td><span class="k">الاسم:</span> ${f(p&&p.name)}</td></tr>
      <tr><td><span class="k">يمثلها:</span> ${esc(org.rep)}</td><td><span class="k">رقم الهوية:</span> ${f(p&&p.idNo)}</td></tr>
      <tr><td><span class="k">الصفة:</span> ${esc(org.repTitle)}</td><td><span class="k">الجوال:</span> <span dir="ltr">${f(p&&p.phone)}</span></td></tr>
      <tr><td class="s"><span class="k">التوقيع:</span>${k.ownerSig?`<img src="${k.ownerSig}">`:''}</td><td class="s"><span class="k">التوقيع:</span>${p&&p.sig?`<img src="${p.sig}">`:''}</td></tr>
      <tr><td><span class="k">التاريخ:</span> ${dt?pkFmt(dt)+'م':blank}</td><td><span class="k">التاريخ:</span> ${p&&p.sigAt?pkFmt(p.sigAt.slice(0,10))+'م':(dt?pkFmt(dt)+'م':blank)}</td></tr></table>`;
}
async function pkPrintHTML(html,fname){
  const f=document.createElement('iframe');f.style.cssText='position:fixed;right:-10000px;bottom:0;width:820px;height:1160px;border:0';
  document.body.appendChild(f);const d=f.contentWindow.document;d.open();d.write(html);d.close();
  const prev=document.title;
  try{await new Promise(r=>{if(d.readyState==='complete')r();else f.onload=r;setTimeout(r,2500)});if(d.fonts&&d.fonts.ready)await Promise.race([d.fonts.ready,new Promise(r=>setTimeout(r,2500))])}catch(e){}
  await Promise.all([...d.images].map(im=>im.complete?0:new Promise(r=>{im.onload=im.onerror=r;setTimeout(r,2500)})));
  try{document.title=fname;d.title=fname;f.contentWindow.focus();f.contentWindow.print()}catch(e){alert('تعذّرت الطباعة: '+e.message)}
  setTimeout(()=>{document.title=prev;f.remove()},2000);
}
async function pkPrintAgreement(id){
  const p=id?pkP(id):null;const assets=await pkAssets();
  if(!assets.lh){alert('تعذّر تحميل الورق الرسمي — تأكد من الاتصال.');return}
  const k=pkInit();const fname=p?('اتفاقية_مبيعات_'+p.name.replace(/\s+/g,'_')+'_'+p.no):'معاينة_اتفاقية_المبيعات';
  const html=pkDocShell(fname,pkAgreementHTML(p),assets,(p?p.no+' · ':'')+k.title+' · '+k.org.name);
  if(p){p.printedAt=pkNow();if(p.status==='draft')p.status='pending';pkLog(p,'طُبعت الاتفاقية'+(p.status==='active'?' (النسخة المعتمدة)':''));save();if(CUR==='partners')renderPartners()}
  pkPrintHTML(html,fname);
}
/* كشف حساب عمولات الشريك — على الورق الرسمي */
function pkStatementForm(id){const p=pkP(id);if(!p)return;const d=new Date();const first=d.getFullYear()+'-'+_pad2(d.getMonth()+1)+'-01';
  openModal('كشف حساب — '+esc(p.name),`<div class="row2"><div class="field"><label>من</label><input id="ps_from" type="date" value="${first}"></div><div class="field"><label>إلى</label><input id="ps_to" type="date" value="${today()}"></div></div>
    <div style="color:var(--muted);font-size:13px">يشمل العمولات التي تاريخ تحصيلها ضمن الفترة، مع إجمالي المصروف والمستحق.</div>`,
  ()=>{pkPrintStatement(id,pkVal('ps_from'),pkVal('ps_to'));closeModal()});
  setTimeout(()=>{const b=document.getElementById('mSave');if(b)b.textContent='طباعة الكشف'},0);
}
async function pkPrintStatement(id,from,to){
  const p=pkP(id);if(!p)return;const k=pkInit();const assets=await pkAssets();
  const list=S.partnerComms.filter(c=>c.partnerId===id&&(!from||c.collectedAt>=from)&&(!to||c.collectedAt<=to)).sort((a,b)=>a.collectedAt.localeCompare(b.collectedAt));
  const sum=(arr,f)=>arr.reduce((a,c)=>a+Number(c[f]||0),0);const paid=list.filter(c=>c.status==='paid'),due=list.filter(c=>c.status!=='paid');
  const leadName=c=>{const l=c.leadId&&pkL(c.leadId);return l?l.school:''};
  const inner=`<h1>كشف حساب عمولات</h1><div class="sub">${esc(p.name)} — اتفاقية رقم ${esc(p.no)}</div>
    <div class="meta"><span><b>الفترة:</b> من ${pkFmt(from)} إلى ${pkFmt(to)}</span><span><b>تاريخ الإصدار:</b> ${pkFmt(today())}م</span></div>
    <table class="list"><tr><th>#</th><th>التاريخ</th><th>المدرسة / البيان</th><th>صافي المحصَّل</th><th>النسبة</th><th>العمولة</th><th>الحالة</th></tr>
      ${list.map((c,i)=>`<tr><td>${i+1}</td><td>${pkFmt(c.collectedAt)}</td><td>${esc([leadName(c),c.desc].filter(Boolean).join(' — '))}</td><td>${pkSar(c.base)}</td><td>${c.rate}%</td><td><b>${pkSar(c.amount)}</b></td><td>${c.status==='paid'?'صُرفت '+pkFmt(c.paidAt)+(c.ref?' ('+esc(c.ref)+')':''):'مستحقة'}</td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:#888">لا عمولات في هذه الفترة</td></tr>'}
      <tr class="tot"><td colspan="3">الإجمالي</td><td>${pkSar(sum(list,'base'))}</td><td></td><td>${pkSar(sum(list,'amount'))}</td><td></td></tr></table>
    <table class="kv" style="width:60%"><tr><td class="k">المصروف في الفترة</td><td>${pkSar(sum(paid,'amount'))}</td></tr><tr><td class="k">المستحق (لم يُصرف)</td><td><b>${pkSar(sum(due,'amount'))}</b></td></tr>
      <tr><td class="k">حساب التحويل</td><td>${esc(p.bank||'')} — <span dir="ltr">${esc(p.iban||'')}</span></td></tr></table>
    <p style="margin-top:14px">صدر هذا الكشف وفقًا للمادة الخامسة من اتفاقية التسويق والمبيعات بالعمولة المبرمة بين الطرفين.</p>
    <table class="sig" style="width:50%;margin-top:10px"><tr><th>${esc(k.org.name)}</th></tr><tr><td class="s"><span class="k">التوقيع:</span>${k.ownerSig?`<img src="${k.ownerSig}">`:''}</td></tr></table>`;
  pkLog(p,'طُبع كشف حساب '+pkFmt(from)+' → '+pkFmt(to));save();
  pkPrintHTML(pkDocShell('كشف_عمولات_'+p.name.replace(/\s+/g,'_'),inner,assets,'كشف حساب عمولات · '+p.no+' · '+k.org.name),'كشف_عمولات_'+p.name.replace(/\s+/g,'_')+'_'+to);
}
