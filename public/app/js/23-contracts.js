/*
 * 23-contracts.js — «الشركات» ← العقود مع الشركات: اتفاقيّات عدم الإفصاح
 *   المتبادلة، ومذكّرات شروط التعاون (Term Sheet)، وصفحتان خاصّتان بك:
 *   «حدودي الدنيا» و«أسعار الترخيص للجهات».
 * ─────────────────────────────────────────────────────────────────────────
 * يُعرض داخل تطبيق «الشركات» (20-partners.js، القسم PK_SEC='contracts').
 * الحلقة: شركة جديدة + نوع الوثيقة → تعبئة المتغيّرات → طباعة على الورق
 *   الرسمي (توقيعك + الختم من قالب الشركاء) → إرسال → رفع النسخة الموقّعة
 *   (تُجمَّد البنود على ملفّها) → سارية / منتهية.
 *
 * البيانات في حالة اللوحة (app_state):
 *   S.contracts   = [{id,type,no,company:{…},date,status,v:{…},frozen,docs,log,notes}]
 *   S.contractKit = {nda:{title,subtitle,articles|null}, terms:{…}, counters:{nda,terms},
 *                    floor:[{t,b}]|null, prices:[{item,unit,price,floor,note}]|null}
 * بيانات الطرف الأول وتوقيعك والختم تُقرأ من قالب الشركاء pkInit().
 * الملفّات الموقّعة في حاوية partner-docs الخاصّة تحت contracts/<id>.
 *
 * ⚠️ نطاقٌ عامّ واحد + تعريفات فقط (انظر رأس 01-core.js). البادئة ct لكلّ شيء.
 * ⚠️ الصيغ مسوّدات قانونيّة تُراجَع لدى محامٍ قبل اعتمادها.
 */

/* ===== ثوابت ===== */
const CT_STATUS={
  draft:{label:'مسودة',pill:'draft'},
  sent:{label:'أُرسلت للطرف الثاني',pill:'progress'},
  signed:{label:'موقّعة وسارية',pill:'won'},
  ended:{label:'منتهية / ملغاة',pill:'lost'},
};
const CT_NDA_ARTICLES=[
  {t:'المادة الأولى: التمهيد',b:'حيث إن الطرف الأول مؤسسة سعودية تملك وتشغّل منصة «حروف ودروس» التعليمية، وحيث إن الطرفين يرغبان في بحث فرصة تعاون محتملة بينهما تتعلق بـ{PURPOSE} (ويُشار إليها بـ«الغرض»)، وحيث إن ذلك يقتضي أن يُفصح كل طرف للآخر عن معلومات سرية، فقد اتفق الطرفان على حماية هذه المعلومات وفق أحكام هذه الاتفاقية. ويُعد هذا التمهيد جزءًا لا يتجزأ من الاتفاقية.'},
  {t:'المادة الثانية: التعريفات',b:'- **المعلومات السرية:** كل معلومة أو بيان يُفصح عنه أحد الطرفين للآخر، أو يطّلع عليه الطرف الآخر، بأي وسيلة كانت (شفهيًا أو كتابيًا أو إلكترونيًا أو بالعرض الحي أو بإتاحة حساب تجريبي)، قبل توقيع هذه الاتفاقية أو بعده، ويشمل ذلك على سبيل المثال لا الحصر: المحتوى التعليمي، وبنوك الأسئلة، والمجسمات ثلاثية الأبعاد، والتصاميم والشخصيات، والشيفرة المصدرية، وأساليب الإنتاج والجودة، والمنهجيات، والخطط، والمقترحات المقدمة للجهات الحكومية، والأسعار، والعملاء، والشركاء، والبيانات والإحصاءات، وأي معلومات عن متطلبات الجهات الحكومية وفرصها.\n- **الطرف المُفصِح:** الطرف الذي يُفصح عن المعلومات السرية.\n- **الطرف المتلقي:** الطرف الذي يتلقى المعلومات السرية أو يطّلع عليها.\n- **الممثلون:** موظفو الطرف المتلقي ومديروه ومستشاروه المهنيون الذين تقتضي طبيعة عملهم الاطلاع على المعلومات السرية لتحقيق الغرض.'},
  {t:'المادة الثالثة: الاستثناءات',b:'لا تُعد من المعلومات السرية المعلوماتُ التي يُثبت الطرف المتلقي كتابيًا أنها:\n- كانت متاحة للعموم وقت الإفصاح، أو أصبحت كذلك لاحقًا دون إخلال منه بهذه الاتفاقية.\n- كانت في حوزته بصورة مشروعة وموثقة قبل الإفصاح عنها، دون التزام بالسرية.\n- طوّرها بصورة مستقلة دون الاستعانة بأي من المعلومات السرية.\n- تلقاها بصورة مشروعة من طرف ثالث غير ملتزم بالسرية تجاه الطرف المُفصِح.\n\nوإذا أُلزم الطرف المتلقي بالإفصاح بموجب نظام أو أمر من جهة قضائية أو رسمية مختصة، فعليه إخطار الطرف المُفصِح فورًا وقبل الإفصاح متى سمح النظام بذلك، والاقتصار على القدر الواجب الإفصاح عنه نظامًا.'},
  {t:'المادة الرابعة: التزامات الطرف المتلقي',b:'- استخدام المعلومات السرية لتحقيق الغرض وحده، وعدم استخدامها لأي غرض آخر لمصلحته أو لمصلحة الغير.\n- عدم الإفصاح عنها لأي طرف ثالث، وقصر الاطلاع عليها على الممثلين الذين يحتاجون إليها لتحقيق الغرض، بعد إبلاغهم بسريتها والتزامهم بمثل ما في هذه الاتفاقية، ويكون الطرف المتلقي مسؤولًا عن أي إخلال يقع منهم.\n- حماية المعلومات السرية بدرجة عناية لا تقل عما يبذله لحماية معلوماته السرية، وفي جميع الأحوال لا تقل عن العناية المعقولة.\n- عدم نسخ المعلومات السرية أو تصويرها أو تسجيلها إلا بالقدر اللازم لتحقيق الغرض.\n- إخطار الطرف المُفصِح كتابيًا وفور علمه بأي إفصاح أو استخدام غير مصرح به، والتعاون معه للحد من آثاره.'},
  {t:'المادة الخامسة: حظر الاستخدام المنافس والهندسة العكسية',b:'يلتزم الطرف المتلقي، بنفسه أو عن طريق غيره، بما يلي:\n- عدم إجراء هندسة عكسية لأي منتج أو منصة أو محتوى للطرف المُفصِح، وعدم محاولة استخراج شيفرتها أو بياناتها أو محتواها.\n- عدم تسجيل العروض الحية أو تصويرها، وعدم استخراج المحتوى أو الأسئلة أو المجسمات أو نسخها آليًا أو يدويًا من الحسابات التجريبية.\n- عدم استخدام المعلومات السرية في تطوير منتج أو خدمة منافسة أو مشابهة، أو في تقديم حل مماثل لأي جهة.\n- عدم استخدام المحتوى أو الأسئلة أو المجسمات أو البيانات في تدريب نماذج الذكاء الاصطناعي أو تغذيتها.'},
  {t:'المادة السادسة: الملكية الفكرية',b:'تبقى المعلومات السرية وجميع حقوق الملكية الفكرية المتعلقة بها ملكًا خالصًا للطرف المُفصِح، ولا يُعد الإفصاح عنها منحًا لأي ترخيص أو حق استخدام أو ملكية للطرف المتلقي، صراحةً أو ضمنًا، فيما عدا الاطلاع اللازم لتحقيق الغرض خلال مدة هذه الاتفاقية. وتبقى منصة «حروف ودروس» وعلامتها التجارية وشخصياتها ومحتواها ملكًا للطرف الأول.'},
  {t:'المادة السابعة: عدم التجاوز وعدم الاستقطاب',b:'- لا يجوز لأي من الطرفين، طوال مدة هذه الاتفاقية ولمدة {NONCIRC} بعد انتهائها، التواصل مع أي جهة أو عميل أو شريك عرّفه به الطرف الآخر أو اطّلع عليه بسبب هذه الاتفاقية، بقصد تجاوز الطرف الآخر أو التعاقد بمعزل عنه في موضوع الغرض، إلا بموافقته الكتابية.\n- لا يجوز لأي من الطرفين خلال المدة ذاتها استقطاب موظفي الطرف الآخر أو متعاقديه المشاركين في الغرض للعمل لديه.'},
  {t:'المادة الثامنة: عدم الالتزام بالتعاقد',b:'لا تُلزم هذه الاتفاقية أيًا من الطرفين بإبرام أي اتفاق أو تعاون أو صفقة، ولا تُنشئ أي حصرية أو شراكة أو وكالة بينهما. ويبقى كل طرف حرًا في التعامل مع الغير، بشرط عدم استخدام المعلومات السرية للطرف الآخر أو الإخلال بالمادة السابعة. ولا يُعد أي إفصاح ضمانًا لدقة المعلومات أو اكتمالها إلا بما يُتفق عليه في عقد نهائي.'},
  {t:'المادة التاسعة: البيانات الشخصية',b:'لا يتبادل الطرفان بموجب هذه الاتفاقية بيانات شخصية للطلاب أو المعلمين أو غيرهم إلا عند الضرورة وفي أضيق الحدود، وبصورة مجمّعة أو مجهولة الهوية متى أمكن، ويلتزم كل طرف بنظام حماية البيانات الشخصية في المملكة العربية السعودية ولوائحه.'},
  {t:'المادة العاشرة: إعادة المعلومات أو إتلافها',b:'يلتزم الطرف المتلقي، عند طلب الطرف المُفصِح أو عند انتهاء هذه الاتفاقية أو انتهاء المباحثات، بإعادة المعلومات السرية وجميع نسخها أو إتلافها خلال (10) أيام عمل، وتأكيد ذلك كتابيًا. وما يُحتفظ به نظامًا لأغراض الأرشفة يبقى خاضعًا لأحكام السرية.'},
  {t:'المادة الحادية عشرة: المدة',b:'- تسري هذه الاتفاقية من تاريخ توقيعها لمدة {TERM}، ويجوز تمديدها باتفاق كتابي.\n- تستمر التزامات السرية وحظر الاستخدام المنافس لمدة {SURVIVE} بعد انتهاء الاتفاقية أو إنهائها لأي سبب، وتستمر بلا مدة محددة بالنسبة للأسرار التجارية والشيفرة المصدرية وأساليب الإنتاج ما دامت محتفظة بسريتها.'},
  {t:'المادة الثانية عشرة: الإخلال والتعويض',b:'يُقر الطرفان بأن الإخلال بهذه الاتفاقية قد يُلحق بالطرف المُفصِح ضررًا جسيمًا يصعب تداركه، ويحق للطرف المتضرر، دون الإخلال بأي حق آخر، اتخاذ ما يلزم من إجراءات نظامية لوقف الإخلال، والمطالبة بالتعويض عن كامل الأضرار المادية والمعنوية وما فاته من كسب نتيجة الإخلال.'},
  {t:'المادة الثالثة عشرة: النظام الواجب التطبيق وتسوية النزاعات',b:'تخضع هذه الاتفاقية لأنظمة المملكة العربية السعودية وتُفسر وفقًا لها. وفي حال نشوء أي خلاف حول تفسيرها أو تنفيذها، يسعى الطرفان إلى حله وديًا خلال (15) يومًا من تاريخ إخطار أحدهما للآخر، فإن تعذر ذلك يُحال النزاع إلى الجهة القضائية المختصة في مدينة الرياض.'},
  {t:'المادة الرابعة عشرة: أحكام عامة',b:'- تمثل هذه الاتفاقية كامل الاتفاق بين الطرفين بشأن موضوعها، وتحل محل أي تفاهم سابق عليه.\n- لا يجوز تعديلها إلا بملحق مكتوب وموقّع من الطرفين، ولا يجوز لأي طرف التنازل عنها للغير دون موافقة الطرف الآخر الكتابية.\n- يُعد البريد الإلكتروني المذكور لكل طرف وسيلة إخطار معتمدة.\n- إذا بطل أي حكم من أحكامها بقيت الأحكام الأخرى سارية.\n- حُررت باللغة العربية من نسختين أصليتين، بيد كل طرف نسخة، وتُعد التوقيعات والنسخ الإلكترونية معتمدة وملزمة.'},
];
const CT_TERMS_ARTICLES=[
  {t:'أولًا: الغرض',b:'تحدد هذه المذكرة الشروط الرئيسية لتعاون محتمل بين الطرفين في: {MODEL}، تمهيدًا لإبرام اتفاقية نهائية تفصيلية.'},
  {t:'ثانيًا: الطبيعة غير الملزمة',b:'هذه المذكرة غير ملزمة للطرفين بإبرام الاتفاقية النهائية، ولا تُنشئ أي التزام تعاقدي، **باستثناء** البنود: (الملكية الفكرية، وعدم التجاوز، والسرية، والتكاليف، والنظام الواجب التطبيق)، فإنها ملزمة للطرفين من تاريخ التوقيع.'},
  {t:'ثالثًا: نطاق التعاون',b:'{SCOPE}'},
  {t:'رابعًا: طبيعة الحق الممنوح',b:'- يمنح الطرف الأول الطرف الثاني **ترخيص استخدام** لمنصة «حروف ودروس» ومحتواها في حدود النطاق المتفق عليه وخلال المدة، ولا يُعد ذلك بيعًا أو نقلًا لملكية أي جزء منها.\n- لا يتضمن الترخيص تسليم الشيفرة المصدرية أو الملفات الخام للمحتوى أو الأسئلة أو المجسمات، ويكون الوصول عبر المنصة وتكاملاتها المعتمدة.'},
  {t:'خامسًا: الملكية الفكرية',b:'تبقى المنصة وعلامتها التجارية وشخصياتها ومحتواها وبنوك أسئلتها ومجسماتها وتصاميمها وشيفرتها، وكل تطوير أو تحسين يجريه الطرف الأول عليها أثناء التعاون أو بسببه، ملكًا خالصًا للطرف الأول. ولا يكتسب الطرف الثاني أي حق فيها خارج حدود الترخيص.'},
  {t:'سادسًا: الاسم والعلامة',b:'يُقدَّم الحل للجهات باسم: {COBRAND}. وأي تقديم للحل بغير اسم «حروف ودروس» يتطلب موافقة كتابية مسبقة ومقابلًا إضافيًا ومدة محددة.'},
  {t:'سابعًا: المقابل المالي وشروط الدفع',b:'- المقابل المالي: {PRICE}\n- شروط الدفع: {PAYMENT}\n- لا تشمل المبالغ ضريبة القيمة المضافة، وتُضاف وفق النظام.'},
  {t:'ثامنًا: الحصرية',b:'{EXCLUSIVITY}'},
  {t:'تاسعًا: المدة',b:'مدة الاتفاقية النهائية: {TERM}، قابلة للتجديد باتفاق الطرفين كتابيًا.'},
  {t:'عاشرًا: التزامات الطرف الأول',b:'- تشغيل المنصة وإتاحتها للجهات المستفيدة وفق مستوى خدمة يُتفق عليه.\n- تحديث المحتوى بما يواكب المنهج الوطني، وتقديم الدعم الفني.\n- تدريب المعلمين المستفيدين وتقديم تقارير الاستخدام الدورية.'},
  {t:'حادي عشر: التزامات الطرف الثاني',b:'- إدارة العلاقة والتعاقد مع الجهات المستفيدة ضمن النطاق، وإطلاع الطرف الأول على مراحلها.\n- عدم تعديل المحتوى أو إعادة تسميته أو تقديمه بصورة تخالف هذه المذكرة.\n- الالتزام بالأسعار والشروط المتفق عليها وعدم تقديم التزامات للجهات نيابة عن الطرف الأول دون موافقته.'},
  {t:'ثاني عشر: البيانات وقياس الأثر',b:'تُقاس نتائج التعاون ببيانات استخدام مجمّعة ومجهولة الهوية، وتكون بيانات المستفيدين ملكًا للجهة المستفيدة، ويلتزم الطرفان بنظام حماية البيانات الشخصية.'},
  {t:'ثالث عشر: عدم التجاوز',b:'لا يجوز لأي من الطرفين التواصل مع الجهات أو العملاء الذين عرّفه بهم الآخر بقصد تجاوزه في موضوع هذه المذكرة، طوال مدتها ولمدة {NONCIRC} بعد انتهائها.'},
  {t:'رابع عشر: السرية',b:'تخضع هذه المذكرة ومباحثاتها لاتفاقية عدم الإفصاح المبرمة بين الطرفين، وفي حال عدم وجودها يلتزم كل طرف بسرية المعلومات التي يطّلع عليها بسببها.'},
  {t:'خامس عشر: التكاليف',b:'يتحمل كل طرف تكاليفه الخاصة المتعلقة بالتفاوض وإعداد الاتفاقية النهائية.'},
  {t:'سادس عشر: صلاحية المذكرة',b:'تنتهي هذه المذكرة تلقائيًا إذا لم تُوقّع الاتفاقية النهائية خلال ({VALID_DAYS}) يومًا من تاريخها، ما لم يتفق الطرفان كتابيًا على تمديدها.'},
  {t:'سابع عشر: النظام الواجب التطبيق',b:'تخضع هذه المذكرة لأنظمة المملكة العربية السعودية، ويُحال أي نزاع بشأن بنودها الملزمة إلى الجهة القضائية المختصة في مدينة الرياض بعد تعذر الحل الودي خلال (15) يومًا.'},
];
const CT_TYPES={
  nda:{label:'اتفاقية عدم إفصاح متبادلة',short:'عدم إفصاح',icon:'shield-check',prefix:'HD-NDA-',
    title:'اتفاقية عدم إفصاح متبادلة',subtitle:'لحماية المعلومات السرية أثناء بحث فرص التعاون بين الطرفين',articles:CT_NDA_ARTICLES,
    fields:[
      {k:'PURPOSE',l:'الغرض من تبادل المعلومات',d:'دراسة فرص التعاون في تقديم المحتوى التعليمي التفاعلي والحلول الابتكارية القائمة على الألعاب لقطاع التعليم في المملكة العربية السعودية',area:true},
      {k:'TERM',l:'مدة الاتفاقية',d:'سنتين (2) ميلاديتين'},
      {k:'SURVIVE',l:'استمرار السرية بعد الانتهاء',d:'ثلاث (3) سنوات'},
      {k:'NONCIRC',l:'عدم التجاوز بعد الانتهاء',d:'اثني عشر (12) شهرًا'},
    ]},
  terms:{label:'مذكرة شروط التعاون',short:'شروط التعاون',icon:'file-text',prefix:'HD-TS-',
    title:'مذكرة شروط التعاون',subtitle:'الشروط الرئيسية لتعاون محتمل حول منصة «حروف ودروس» التعليمية (Term Sheet)',articles:CT_TERMS_ARTICLES,
    fields:[
      {k:'MODEL',l:'نموذج التعاون',d:'ترخيص منصة «حروف ودروس» التعليمية للجهات التعليمية عبر الطرف الثاني'},
      {k:'SCOPE',l:'نطاق التعاون',d:'- الجهات المستفيدة: [تُحدَّد: وزارة التعليم / إدارات تعليم / مدارس / جهات أخرى].\n- المحتوى: الألعاب الصفية، والدروس التفاعلية ثلاثية الأبعاد، وبنك الأسئلة على المنهج الوطني.\n- المرحلة الأولى: تجربة تشغيل في [عدد] مدرسة لمدة [عدد] أشهر، ثم التوسع حسب النتائج.',area:true},
      {k:'PRICE',l:'المقابل المالي',d:'[المبلغ] ريال سعودي سنويًا لكل مدرسة، وفق قائمة أسعار الطرف الأول المرفقة، أو بحسب عرض السعر المعتمد لكل جهة',area:true},
      {k:'PAYMENT',l:'شروط الدفع',d:'(50%) خمسون بالمائة مقدمًا عند توقيع كل أمر شراء، والباقي عند التشغيل الفعلي، خلال (30) يومًا من تاريخ الفاتورة'},
      {k:'COBRAND',l:'الاسم الذي يُقدَّم به الحل',d:'«حروف ودروس» بالشراكة مع [اسم الطرف الثاني]'},
      {k:'EXCLUSIVITY',l:'الحصرية',d:'التعاون غير حصري، ويحق للطرف الأول التعامل مع جهات وشركاء آخرين. وتجوز حصرية لاحقة محددة بقطاع ومدة لا تتجاوز (12) شهرًا، مشروطة بحد أدنى من الإيرادات يُتفق عليه كتابيًا، وتسقط تلقائيًا إذا لم يتحقق.',area:true},
      {k:'TERM',l:'مدة الاتفاقية النهائية',d:'سنة واحدة (12) شهرًا'},
      {k:'NONCIRC',l:'عدم التجاوز بعد الانتهاء',d:'اثني عشر (12) شهرًا'},
      {k:'VALID_DAYS',l:'صلاحية المذكرة (يوم)',d:'60'},
    ]},
};
const CT_DEFAULT_FLOOR=[
  {t:'الملكية الفكرية',b:'لا أتنازل عن ملكية أي جزء من المنصة أو محتواها أبدًا. ترخيص استخدام فقط.'},
  {t:'الملفات الخام والمصدر',b:'لا أسلّم الشيفرة ولا ملفات المجسمات ولا بنك الأسئلة خامًا. الوصول عبر المنصة. أقصى حد لجهة حكومية: إيداع لدى طرف ثالث (Escrow).'},
  {t:'الحصرية',b:'لا حصرية مفتوحة. أقصاها: قطاع واحد + 12 شهرًا + حد أدنى مكتوب للإيرادات، وتسقط إن لم يتحقق.'},
  {t:'الاسم',b:'اسم مشترك على الأقل («حروف ودروس» بالشراكة مع…). الاسم الأبيض فقط بزيادة 50% ولمدة لا تتجاوز سنتين.'},
  {t:'الدفع',b:'50% مقدمًا على الأقل في أول عقد مع أي شريك. لا عمل قبل أمر شراء أو عقد موقّع.'},
  {t:'المجاني',b:'التجربة المجانية لا تتجاوز 5 مدارس و3 أشهر. ما زاد = تجربة تشغيل مدفوعة.'},
  {t:'أقل سعر',b:'لا أنزل عن أرقام عمود «حدّي» في صفحة الأسعار. ما تحته = أعتذر بلطف.'},
  {t:'هامش الشريك',b:'هامش الشريك البائع لا يزيد عن 30% من قيمة الترخيص.'},
  {t:'المدة',b:'أول عقد سنة إلى سنتين كحد أقصى، والتجديد بشروط جديدة.'},
  {t:'البيانات',b:'بيانات الطلاب والمعلمين لا تُشارك إلا مجمّعة ومجهولة الهوية.'},
  {t:'عدم التجاوز',b:'شرط إلزامي في أي اتفاق: لا يتواصلون مع جهاتي من خلفي.'},
  {t:'بيع المنصة',b:'لا أناقش بيع المنصة كاملة الآن. أي عرض شراء: «أرسلوه مكتوبًا وأرد خلال أسبوعين»، ثم محامٍ ومستشار. أقل قيمة أقبلها: [اكتبها هنا].'},
  {t:'القرار',b:'لا توقيع ولا موافقة داخل الاجتماع. 48 ساعة على الأقل + مراجعة محامٍ لأي ورقة.'},
];
const CT_DEFAULT_PRICES=[
  {item:'ترخيص مدرسة',unit:'مدرسة / سنة (حتى 30 معلمًا)',price:'3,900',floor:'2,900',note:'الألعاب + الدروس ثلاثية الأبعاد + بنك الأسئلة + الدعم'},
  {item:'ترخيص مدارس بالجملة',unit:'مدرسة / سنة (50–499 مدرسة)',price:'2,900',floor:'1,900',note:''},
  {item:'ترخيص إدارة تعليم أو قطاع',unit:'مدرسة / سنة (500 مدرسة فأكثر)',price:'1,900',floor:'1,200',note:'يُتفاوض عليه بحسب العدد'},
  {item:'مقاعد المعلمين (المدارس الأهلية)',unit:'معلم / سنة',price:'149 / 129 / 99',floor:'99',note:'10+ / 25+ / 50+ معلمًا'},
  {item:'تجربة تشغيل مدفوعة (6 أشهر)',unit:'حتى 30 مدرسة',price:'90,000',floor:'45,000',note:'تدريب + قياس أثر قبلي وبعدي + تقرير ختامي'},
  {item:'تكامل مع منصة الجهة',unit:'رسوم لمرة واحدة',price:'150,000',floor:'80,000',note:'ربط الدخول والتقارير حسب متطلبات الجهة'},
  {item:'تدريب المعلمين',unit:'ورشة (حتى 40 معلمًا)',price:'6,000',floor:'4,000',note:''},
  {item:'تقديم الحل باسم الشريك',unit:'زيادة على السعر',price:'+50%',floor:'+35%',note:'مدة لا تتجاوز سنتين'},
  {item:'هامش الشريك البائع',unit:'من قيمة الترخيص',price:'20%',floor:'30% حد أعلى',note:''},
];

/* ===== حالة الوحدة ===== */
let CT_TAB='list', CT_ID=null;

function ctInit(){
  if(!Array.isArray(S.contracts))S.contracts=[];
  if(!S.contractKit||typeof S.contractKit!=='object')S.contractKit={};
  const k=S.contractKit;
  ['nda','terms'].forEach(t=>{if(!k[t]||typeof k[t]!=='object')k[t]={title:CT_TYPES[t].title,subtitle:CT_TYPES[t].subtitle,articles:null}});
  if(!k.counters)k.counters={nda:0,terms:0};
  if(k.floor===undefined)k.floor=null;
  if(k.prices===undefined)k.prices=null;
  return k;
}
function ctC(id){return S.contracts.find(c=>c.id===id)}
function ctArticles(type){const t=ctInit()[type];return (t&&Array.isArray(t.articles)&&t.articles.length)?t.articles:CT_TYPES[type].articles}
function ctFloor(){const k=ctInit();return Array.isArray(k.floor)&&k.floor.length?k.floor:CT_DEFAULT_FLOOR}
function ctPrices(){const k=ctInit();return Array.isArray(k.prices)&&k.prices.length?k.prices:CT_DEFAULT_PRICES}
function ctVars(c){const o={};CT_TYPES[c.type].fields.forEach(f=>{const v=c.v&&c.v[f.k];o[f.k]=(v!=null&&v!=='')?v:f.d});return o}
function ctRender(){if(CUR==='partners'&&PK_SEC==='contracts')renderPartners()}
function ctOpen(id){PK_SEC='contracts';CT_ID=id;renderPartners();window.scrollTo(0,0)}
function ctBack(){CT_ID=null;renderPartners()}

/* ===== الواجهة ===== */
const CT_TABS=[
  {id:'list',name:'الاتفاقيات',icon:'folder-lock'},
  {id:'tpl_nda',name:'قالب عدم الإفصاح',icon:'shield-check'},
  {id:'tpl_terms',name:'قالب مذكرة الشروط',icon:'file-text'},
  {id:'floor',name:'حدودي الدنيا (خاص)',icon:'lock'},
  {id:'prices',name:'أسعار الترخيص',icon:'tags'},
];
function ctHead(){
  return `<div class="page-head"><h1><i data-lucide="building-2" style="width:26px;height:26px;vertical-align:-4px"></i> الشركات</h1>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="ctForm(null,'terms')"><i data-lucide="file-plus"></i> مذكرة شروط</button>
      <button class="btn btn-gold" onclick="ctForm(null,'nda')"><i data-lucide="shield-plus"></i> اتفاقية عدم إفصاح</button></div></div>`;
}
function ctView(){
  ctInit();
  if(CT_ID&&ctC(CT_ID))return ctPage(ctC(CT_ID));
  CT_ID=null;
  const bodies={list:ctViewList,tpl_nda:()=>ctViewTpl('nda'),tpl_terms:()=>ctViewTpl('terms'),floor:ctViewFloor,prices:ctViewPrices};
  return `<div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
      ${CT_TABS.map(t=>`<button class="btn btn-sm ${CT_TAB===t.id?'btn-gold':'btn-ghost'}" onclick="ctSaveOpenTab();CT_TAB='${t.id}';renderPartners()"><i data-lucide="${t.icon}"></i> ${t.name}</button>`).join('')}
    </div>${(bodies[CT_TAB]||ctViewList)()}`;
}
/* يحفظ ما في التبويب المفتوح قبل الانتقال (القوالب والحدود والأسعار) */
function ctSaveOpenTab(){
  if(document.getElementById('ctArts'))ctTplSave(CT_TAB==='tpl_terms'?'terms':'nda',true);
  if(document.getElementById('ctFloor'))ctFloorSave(true);
  if(document.getElementById('ctPrices'))ctPricesSave(true);
}

/* ── قائمة الاتفاقيات ── */
function ctViewList(){
  const list=S.contracts.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const signed=list.filter(c=>c.status==='signed').length,open=list.filter(c=>c.status==='draft'||c.status==='sent').length;
  return `
    <div class="badge-note" style="margin-bottom:14px"><i data-lucide="scale"></i><div>الصيغ هنا <b>مسوّدات قانونية</b> — راجعها مع محامٍ مرة واحدة، ثم عدّل القالب وتصير جاهزة لكل الشركات. قبل أي تفاصيل مع شركة: <b>عدم إفصاح أولاً</b>.</div></div>
    <div class="stats">
      <div class="stat"><div class="ic"><i data-lucide="file-signature"></i></div><div class="v">${list.length}</div><div class="l">كل الاتفاقيات</div></div>
      <div class="stat"><div class="ic"><i data-lucide="hourglass"></i></div><div class="v">${open}</div><div class="l">مسودة أو بانتظار التوقيع</div></div>
      <div class="stat"><div class="ic"><i data-lucide="badge-check"></i></div><div class="v">${signed}</div><div class="l">موقّعة وسارية</div></div>
    </div>
    ${!list.length?emptyBox('folder-lock','لا اتفاقيات بعد — ابدأ بـ«اتفاقية عدم إفصاح» لأي شركة تقابلها.'):
    `<div style="overflow:auto"><table><thead><tr><th>الشركة</th><th>النوع</th><th>الرقم</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>
      ${list.map(c=>{const s=CT_STATUS[c.status]||CT_STATUS.draft;return `<tr style="cursor:pointer" onclick="ctOpen('${c.id}')">
        <td><b>${esc(c.company.name)}</b><div style="font-size:12px;color:var(--muted)">${esc([c.company.rep,c.company.city].filter(Boolean).join(' · '))}</div></td>
        <td><i class="inl" data-lucide="${CT_TYPES[c.type].icon}"></i> ${CT_TYPES[c.type].short}</td><td dir="ltr" style="text-align:right">${esc(c.no)}</td>
        <td style="white-space:nowrap">${pkFmt(c.date)}</td><td><span class="pill ${s.pill}">${s.label}</span></td></tr>`}).join('')}
    </tbody></table></div>`}`;
}

/* ── نموذج الإنشاء/التعديل ── */
function ctForm(id,type){
  const k=ctInit();const c=id?ctC(id):null;type=c?c.type:(type||'nda');const T=CT_TYPES[type];
  const co=(c&&c.company)||{};const v=(o,f,dv)=>esc(o&&o[f]!=null&&o[f]!==''?o[f]:(dv==null?'':dv));
  const locked=c&&c.status==='signed';
  /* اقتراح بيانات شركة سبق إدخالها */
  const known=[...new Map(S.contracts.map(x=>[x.company.name,x.company])).values()];
  openModal((c?'تعديل — ':'')+T.label,`
    ${locked?`<div class="badge-note" style="margin-bottom:12px"><i data-lucide="lock"></i><div>الوثيقة <b>موقّعة</b> — بنودها مجمّدة على ملفها. تعديل البيانات هنا لا يغيّر النسخة الموقّعة. لتغيير جوهري: وثيقة جديدة أو ملحق.</div></div>`:''}
    ${!c&&known.length?`<div class="field"><label>شركة سبق إدخالها (اختياري)</label><select onchange="ctFillKnown(this.value)"><option value="">— شركة جديدة —</option>${known.map((x,i)=>`<option value="${i}">${esc(x.name)}</option>`).join('')}</select></div>`:''}
    <div style="font-weight:800;margin-bottom:8px">الطرف الثاني (الشركة)</div>
    <div class="row2"><div class="field"><label>اسم الشركة كما في السجل *</label><input id="ct_name" value="${v(co,'name')}"></div>
      <div class="field"><label>السجل التجاري / الرقم الموحد</label><input id="ct_cr" dir="ltr" value="${v(co,'cr')}"></div></div>
    <div class="row2"><div class="field"><label>المقر</label><input id="ct_city" value="${v(co,'city','الرياض، المملكة العربية السعودية')}"></div>
      <div class="field"><label>البريد الإلكتروني</label><input id="ct_email" type="email" dir="ltr" value="${v(co,'email')}"></div></div>
    <div class="row3"><div class="field"><label>يمثلها</label><input id="ct_rep" value="${v(co,'rep')}"></div>
      <div class="field"><label>الصفة</label><input id="ct_title" value="${v(co,'repTitle')}"></div>
      <div class="field"><label>الجوال</label><input id="ct_phone" inputmode="tel" dir="ltr" value="${v(co,'phone')}"></div></div>
    <div style="font-weight:800;margin:6px 0 8px">بنود هذه الوثيقة</div>
    ${T.fields.map(f=>`<div class="field"><label>${f.l}</label>${f.area?`<textarea id="ctv_${f.k}" rows="${Math.min(6,String(v(c&&c.v,f.k,f.d)).split('\n').length+1)}" style="line-height:1.8">${v(c&&c.v,f.k,f.d)}</textarea>`:`<input id="ctv_${f.k}" value="${v(c&&c.v,f.k,f.d)}">`}</div>`).join('')}
    <div class="row2"><div class="field"><label>تاريخ الوثيقة</label><input id="ct_date" type="date" value="${v(c,'date',today())}"></div>
      <div class="field"><label>الحالة</label><select id="ct_status">${Object.entries(CT_STATUS).map(([key,s])=>`<option value="${key}" ${(c?c.status:'draft')===key?'selected':''}>${s.label}</option>`).join('')}</select></div></div>
    <div class="field"><label>ملاحظات داخلية (لا تُطبع)</label><textarea id="ct_notes" rows="2">${v(c,'notes')}</textarea></div>`,
  ()=>{
    const name=pkVal('ct_name');if(!name){alert('اكتب اسم الشركة.');return}
    const isNew=!c;const o=c||{id:uid(),type,createdAt:pkNow(),log:[],docs:[],status:'draft'};
    o.company={name,cr:pkVal('ct_cr'),city:pkVal('ct_city'),email:pkVal('ct_email'),rep:pkVal('ct_rep'),repTitle:pkVal('ct_title'),phone:pkVal('ct_phone')};
    o.v={};T.fields.forEach(f=>{o.v[f.k]=pkVal('ctv_'+f.k)});
    o.date=pkVal('ct_date')||today();o.notes=pkVal('ct_notes');
    const ns=pkVal('ct_status')||'draft';
    if(isNew){k.counters[type]=Number(k.counters[type]||0)+1;o.no=T.prefix+String(k.counters[type]).padStart(4,'0');ctLog(o,'أُنشئت '+T.label+' برقم '+o.no);S.contracts.push(o);CT_ID=o.id}
    else ctLog(o,'عُدّلت البيانات');
    if(ns!==o.status){ctSetStatusRaw(o,ns)}
    save();closeModal();PK_SEC='contracts';renderPartners();
  },c&&c.status!=='signed'?()=>{if(!confirm('حذف هذه الوثيقة نهائياً؟'))return;S.contracts=S.contracts.filter(x=>x.id!==c.id);CT_ID=null;save();closeModal();renderPartners()}:null);
}
function ctFillKnown(i){const known=[...new Map(S.contracts.map(x=>[x.company.name,x.company])).values()];const co=known[Number(i)];if(!co)return;
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||''};
  set('ct_name',co.name);set('ct_cr',co.cr);set('ct_city',co.city);set('ct_email',co.email);set('ct_rep',co.rep);set('ct_title',co.repTitle);set('ct_phone',co.phone)}
function ctLog(c,text){if(!Array.isArray(c.log))c.log=[];c.log.unshift({at:pkNow(),text})}
function ctSetStatusRaw(c,ns){
  if(ns==='signed'&&!c.frozen)ctFreeze(c);
  if(ns!=='signed'&&ns!=='ended')c.frozen=null;
  ctLog(c,'الحالة ← «'+CT_STATUS[ns].label+'»');c.status=ns;
}
function ctFreeze(c){const t=ctInit()[c.type];const vars=ctVars(c);
  c.frozen={title:t.title,subtitle:t.subtitle,articles:ctArticles(c.type).map(a=>({t:a.t,b:pkFill(a.b,vars)})),org:JSON.parse(JSON.stringify(pkInit().org)),at:pkNow()}}

/* ── صفحة الوثيقة ── */
function ctPage(c){
  const T=CT_TYPES[c.type];const s=CT_STATUS[c.status]||CT_STATUS.draft;const co=c.company;const docs=c.docs||[];
  const signedDoc=docs.find(x=>x.kind==='signed');const wa=pkWa(co.phone);
  const kv=(kk,vv)=>`<div><div style="font-size:12px;color:var(--muted)">${kk}</div><div style="font-weight:700">${vv||'—'}</div></div>`;
  const step=(ok,txt)=>`<div style="display:flex;gap:8px;align-items:center;padding:6px 0"><i data-lucide="${ok?'check-circle-2':'circle'}" style="width:18px;height:18px;color:${ok?'var(--good)':'var(--muted)'}"></i><span style="${ok?'':'color:var(--muted)'}">${txt}</span></div>`;
  const vars=ctVars(c);
  return `
    <div class="page-head"><h1 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="ctBack()"><i data-lucide="arrow-right"></i></button> ${esc(co.name)} <span class="pill ${s.pill}" style="font-size:13px">${s.label}</span></h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${wa?`<a class="btn btn-ghost" href="${wa}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i> واتساب</a>`:''}
        <button class="btn btn-ghost" onclick="ctForm('${c.id}')"><i data-lucide="pencil"></i> البيانات والبنود</button>
        <button class="btn btn-gold" onclick="ctPrint('${c.id}')"><i data-lucide="printer"></i> طباعة / PDF</button></div></div>
    <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:16px">
      <div class="card"><h3><i data-lucide="${T.icon}"></i> ${T.label}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${kv('الرقم',`<span dir="ltr">${esc(c.no)}</span>`)}${kv('التاريخ',pkFmt(c.date)+' · '+pkHijri(c.date))}
          ${kv('السجل / الموحد',`<span dir="ltr">${esc(co.cr)}</span>`)}${kv('المقر',esc(co.city))}
          ${kv('يمثلها',esc(co.rep)+(co.repTitle?' — '+esc(co.repTitle):''))}${kv('الجوال',`<span dir="ltr">${esc(co.phone)}</span>`)}
          <div style="grid-column:1/-1">${kv('البريد',esc(co.email))}</div>
        </div>
        <div style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px;display:grid;gap:8px">
          ${CT_TYPES[c.type].fields.map(f=>`<div><div style="font-size:12px;color:var(--muted)">${f.l}</div><div style="white-space:pre-wrap;font-size:13.5px">${esc(vars[f.k])}</div></div>`).join('')}
        </div>
        ${c.notes?`<div style="margin-top:12px;color:var(--muted);font-size:13px;white-space:pre-wrap">${esc(c.notes)}</div>`:''}
      </div>
      <div class="card"><h3><i data-lucide="list-checks"></i> المراحل</h3>
        ${step(!!c.printedAt,'طُبعت من النظام'+(c.printedAt?` <span style="color:var(--muted);font-size:12px">(${pkFmt(c.printedAt.slice(0,10))})</span>`:''))}
        ${step(c.status==='sent'||c.status==='signed'||c.status==='ended','أُرسلت للشركة')}
        ${step(!!signedDoc,'رُفعت النسخة الموقّعة من الطرفين'+(signedDoc?` <span style="color:var(--muted);font-size:12px">(${pkFmt(signedDoc.at.slice(0,10))})</span>`:''))}
        ${step(c.status==='signed','سارية — البنود مجمّدة')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          ${c.status==='draft'?`<button class="btn btn-ghost btn-sm" onclick="ctMark('${c.id}','sent')"><i data-lucide="send"></i> أُرسلت</button>`:''}
          <button class="btn btn-gold btn-sm" onclick="ctUploadDoc('${c.id}','signed')"><i data-lucide="upload"></i> رفع النسخة الموقّعة</button>
          <button class="btn btn-ghost btn-sm" onclick="ctUploadDoc('${c.id}','other')"><i data-lucide="paperclip"></i> مرفق آخر</button>
          ${c.status==='signed'?`<button class="btn btn-ghost btn-sm" onclick="ctMark('${c.id}','ended')"><i data-lucide="archive"></i> إنهاء</button>`:''}
          ${c.type==='nda'?`<button class="btn btn-ghost btn-sm" onclick="ctNewTermsFor('${c.id}')"><i data-lucide="file-plus"></i> مذكرة شروط لنفس الشركة</button>`:''}
        </div>
        ${c.status==='signed'&&c.frozen?`<div style="font-size:12px;color:var(--muted);margin-top:10px"><i class="inl" data-lucide="lock"></i> البنود مجمّدة على نسخة ${pkFmt(c.frozen.at.slice(0,10))} — تعديل القالب لا يغيّرها.</div>`:''}
        ${docs.length?`<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:10px">${docs.map((x,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0"><span><i class="inl" data-lucide="${x.kind==='signed'?'file-check':'file'}"></i> ${esc(x.name)}${x.kind==='signed'?' <span class="pill won">موقّعة</span>':''}</span><span style="white-space:nowrap"><button class="link-btn" onclick="ctOpenDoc('${c.id}',${i})">فتح</button> <button class="link-btn del" onclick="ctDelDoc('${c.id}',${i})">حذف</button></span></div>`).join('')}</div>`:''}
      </div>
    </div>
    <div class="card"><h3><i data-lucide="history"></i> السجل</h3>
      ${(c.log||[]).slice(0,40).map(e=>`<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--line);font-size:13px"><span style="color:var(--muted);white-space:nowrap" dir="ltr">${esc(e.at.slice(0,16).replace('T',' '))}</span><span>${esc(e.text)}</span></div>`).join('')||'<div style="color:var(--muted)">—</div>'}</div>`;
}
function ctMark(id,ns){const c=ctC(id);if(!c)return;
  if(ns==='ended'&&!confirm('إنهاء الاتفاقية؟ تبقى النسخة الموقّعة محفوظة.'))return;
  ctSetStatusRaw(c,ns);save();renderPartners()}
function ctNewTermsFor(id){const src=ctC(id);if(!src)return;ctForm(null,'terms');setTimeout(()=>{const set=(i,v)=>{const el=document.getElementById(i);if(el)el.value=v||''};const co=src.company;
  set('ct_name',co.name);set('ct_cr',co.cr);set('ct_city',co.city);set('ct_email',co.email);set('ct_rep',co.rep);set('ct_title',co.repTitle);set('ct_phone',co.phone);
  const cb=document.getElementById('ctv_COBRAND');if(cb)cb.value='«حروف ودروس» بالشراكة مع '+co.name},60)}

/* ── الملفّات ── */
function ctUploadDoc(id,kind){const c=ctC(id);if(!c)return;pkPickFile('application/pdf,image/*',async f=>{
  try{const path=await pkUpload(f,'contracts/'+c.id);if(!Array.isArray(c.docs))c.docs=[];
    c.docs.unshift({kind,name:(kind==='signed'?'النسخة الموقّعة — ':'')+f.name,path,at:pkNow()});
    ctLog(c,kind==='signed'?'رُفعت النسخة الموقّعة: '+f.name:'رُفع مرفق: '+f.name);
    if(kind==='signed'&&c.status!=='signed'&&confirm('تعليم الوثيقة «موقّعة وسارية»؟ تُجمَّد بنودها على ملفها.'))ctSetStatusRaw(c,'signed');
    save();renderPartners();
  }catch(e){alert('تعذّر الرفع: '+(e.message||e))}})}
async function ctOpenDoc(id,i){const c=ctC(id);const d=c&&c.docs&&c.docs[i];if(!d)return;const w=window.open('about:blank','_blank');try{const u=await pkSignedUrl(d.path,300);if(w)w.location=u;else location.href=u}catch(e){if(w)w.close();alert('تعذّر فتح الملف: '+(e.message||e))}}
async function ctDelDoc(id,i){const c=ctC(id);const d=c&&c.docs&&c.docs[i];if(!d||!confirm('حذف «'+d.name+'» نهائياً؟'))return;try{await sb.storage.from(PK_BUCKET).remove([d.path])}catch(e){}c.docs.splice(i,1);ctLog(c,'حُذف ملف: '+d.name);save();renderPartners()}

/* ── الطباعة على الورق الرسمي ── */
function ctDocHTML(c,type){
  const k=pkInit();const isPrev=!c;type=c?c.type:type;const T=CT_TYPES[type];const t=ctInit()[type];
  const fr=c&&c.status!=='draft'&&c.status!=='sent'&&c.frozen;
  const org=fr?c.frozen.org:k.org;const title=fr?c.frozen.title:t.title;const sub=fr?c.frozen.subtitle:t.subtitle;
  const vars=c?ctVars(c):Object.fromEntries(T.fields.map(f=>[f.k,f.d]));
  const arts=fr?c.frozen.articles:ctArticles(type).map(a=>({t:a.t,b:pkFill(a.b,vars)}));
  const blank='<span class="hl">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
  const f=v=>v?esc(v):blank;const co=(c&&c.company)||{};const dt=c&&c.date;
  const row=(kk,v)=>`<tr><td class="k">${kk}</td><td>${v}</td></tr>`;
  return `
    <h1>${esc(title)}</h1><div class="sub">${esc(sub||'')}</div>
    <div class="meta"><span><b>الرقم:</b> <span dir="ltr">${c?esc(c.no):blank}</span></span><span><b>التاريخ:</b> ${dt?pkHijri(dt)+' الموافق '+pkFmt(dt)+'م':blank}</span></div>
    <p>إنه في يوم ${dt?pkDay(dt):blank} الموافق للتاريخ المذكور أعلاه، ${type==='nda'?'تم الاتفاق':'حُررت هذه المذكرة'} بين كلٍّ من:</p>
    <table class="kv"><tr><th colspan="2">الطرف الأول</th></tr>
      ${row('الاسم','<b>'+esc(org.name)+'</b>')}${row('الرقم الوطني الموحد',esc(org.unified))}${row('المقر',esc(org.city))}${row('يمثلها',esc(org.rep)+' — بصفته '+esc(org.repTitle))}${row('البريد الإلكتروني',esc(org.email))}</table>
    <div class="note">ويُشار إليها فيما بعد بـ «الطرف الأول».</div>
    <table class="kv"><tr><th colspan="2">الطرف الثاني</th></tr>
      ${row('الاسم','<b>'+f(co.name)+'</b>')}${row('السجل التجاري / الرقم الموحد',`<span dir="ltr">${f(co.cr)}</span>`)}${row('المقر',f(co.city))}
      ${row('يمثلها',f(co.rep)+(co.repTitle?' — بصفته '+esc(co.repTitle):''))}${row('البريد الإلكتروني',f(co.email))}${row('الجوال',`<span dir="ltr">${f(co.phone)}</span>`)}</table>
    <div class="note">ويُشار إليها فيما بعد بـ «الطرف الثاني»، ويُشار إليهما معًا بـ «الطرفين».</div>
    <p>${type==='nda'?'وقد اتفق الطرفان، وهما بكامل أهليتهما المعتبرة شرعًا ونظامًا، على إبرام هذه الاتفاقية وفقًا للبنود الآتية:':'وقد توافق الطرفان على الشروط الرئيسية الآتية:'}</p>
    ${arts.map(a=>`<h2>${esc(a.t)}</h2>${pkBodyHTML(a.b)}`).join('')}
    <div class="end">والله ولي التوفيق،،،</div>
    <table class="sig"><tr><th>الطرف الأول</th><th>الطرف الثاني</th></tr>
      <tr><td><span class="k">الجهة:</span> ${esc(org.name)}</td><td><span class="k">الجهة:</span> ${f(co.name)}</td></tr>
      <tr><td><span class="k">يمثلها:</span> ${esc(org.rep)}</td><td><span class="k">يمثلها:</span> ${f(co.rep)}</td></tr>
      <tr><td><span class="k">الصفة:</span> ${esc(org.repTitle)}</td><td><span class="k">الصفة:</span> ${f(co.repTitle)}</td></tr>
      <tr><td class="s"><span class="k">التوقيع:</span>${k.ownerSig?`<img src="${k.ownerSig}">`:''}</td><td class="s"><span class="k">التوقيع والختم:</span></td></tr>
      <tr><td><span class="k">التاريخ:</span> ${dt?pkFmt(dt)+'م':blank}</td><td><span class="k">التاريخ:</span> ${blank}</td></tr></table>
    ${isPrev?'<div class="esign">معاينة القالب — البيانات المظلّلة تُعبّأ من ملف كل شركة.</div>':''}`;
}
async function ctPrint(id,type){
  const c=id?ctC(id):null;const assets=await pkAssets();
  if(!assets.lh){alert('تعذّر تحميل الورق الرسمي — تأكد من الاتصال.');return}
  const T=CT_TYPES[c?c.type:type];const k=pkInit();
  const fname=c?(T.short.replace(/\s+/g,'_')+'_'+c.company.name.replace(/\s+/g,'_')+'_'+c.no):('معاينة_'+T.short.replace(/\s+/g,'_'));
  const html=pkDocShell(fname,ctDocHTML(c,type),assets,(c?c.no+' · ':'')+T.label+' · '+k.org.name);
  if(c){c.printedAt=pkNow();ctLog(c,'طُبعت'+(c.status==='signed'?' (النسخة المجمّدة)':''));save();ctRender()}
  pkPrintHTML(html,fname);
}

/* ── تحرير القالب ── */
function ctViewTpl(type){
  const t=ctInit()[type];const T=CT_TYPES[type];const arts=ctArticles(type);
  return `
    <div class="card" style="margin-bottom:16px"><h3><i data-lucide="${T.icon}"></i> ${T.label}</h3>
      <div class="row2"><div class="field"><label>العنوان</label><input id="ctt_title" value="${esc(t.title)}"></div><div class="field"><label>العنوان الفرعي</label><input id="ctt_sub" value="${esc(t.subtitle)}"></div></div>
      <div class="badge-note"><i data-lucide="info"></i><div>بيانات الطرف الأول وتوقيعك والختم من «الشركاء والعمولات ← قالب الاتفاقية». السطر الذي يبدأ بـ<b>«- »</b> يصير بنداً مرقّماً، و<b>**نص**</b> عريض. المتغيّرات تُعبّأ من ملف كل شركة:
        ${T.fields.map(f=>`<code>{${f.k}}</code>`).join(' ')}. الوثائق <b>الموقّعة</b> لا تتأثر بتعديل القالب.</div></div></div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="list-ordered"></i> البنود</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="ctTplSave('${type}',true);ctPrint(null,'${type}')"><i data-lucide="eye"></i> معاينة الطباعة</button>
      <button class="btn btn-ghost btn-sm" onclick="ctTplReset('${type}')"><i data-lucide="rotate-ccw"></i> استعادة الصيغة الأصلية</button>
      <button class="btn btn-gold btn-sm" onclick="ctTplSave('${type}')"><i data-lucide="save"></i> حفظ القالب</button></div></div>
      <div id="ctArts" style="margin-top:12px">${arts.map((a,i)=>ctArtRow(type,a,i,arts.length)).join('')}</div>
      <button class="btn btn-ghost btn-sm" onclick="ctArtAdd('${type}')"><i data-lucide="plus"></i> إضافة مادة</button></div>`;
}
function ctArtRow(type,a,i,n){return `<div class="ct-art" style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px">
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><input class="ct-at" value="${esc(a.t)}" style="font-weight:700">
    <button class="btn btn-ghost btn-sm" title="أعلى" onclick="ctArtMove('${type}',${i},-1)" ${i===0?'disabled':''}><i data-lucide="arrow-up"></i></button>
    <button class="btn btn-ghost btn-sm" title="أسفل" onclick="ctArtMove('${type}',${i},1)" ${i===n-1?'disabled':''}><i data-lucide="arrow-down"></i></button>
    <button class="btn btn-ghost btn-sm" title="حذف" style="color:var(--bad)" onclick="ctArtDel('${type}',${i})"><i data-lucide="trash-2"></i></button></div>
  <textarea class="ct-ab" rows="${Math.min(14,Math.max(3,String(a.b).split('\n').length+2))}" style="line-height:1.8">${esc(a.b)}</textarea></div>`}
function ctCollectArts(){return [...document.querySelectorAll('#ctArts .ct-art')].map(el=>({t:el.querySelector('.ct-at').value.trim(),b:el.querySelector('.ct-ab').value.trim()})).filter(a=>a.t||a.b)}
function ctTplSave(type,silent){const t=ctInit()[type];if(!document.getElementById('ctArts'))return;
  t.articles=ctCollectArts();t.title=pkVal('ctt_title')||t.title;t.subtitle=pkVal('ctt_sub');save();if(!silent){renderPartners();alert('تم حفظ القالب ✓')}}
function ctArtMove(type,i,dir){const a=ctCollectArts();const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];ctInit()[type].articles=a;ctTplSave(type,true);renderPartners()}
function ctArtDel(type,i){if(!confirm('حذف هذه المادة؟'))return;const a=ctCollectArts();a.splice(i,1);ctInit()[type].articles=a;ctTplSave(type,true);renderPartners()}
function ctArtAdd(type){const a=ctCollectArts();a.push({t:'المادة '+(a.length+1)+': ',b:''});ctInit()[type].articles=a;ctTplSave(type,true);renderPartners();setTimeout(()=>{const els=document.querySelectorAll('#ctArts .ct-at');const el=els[els.length-1];if(el){el.focus();el.scrollIntoView({block:'center'})}},50)}
function ctTplReset(type){if(!confirm('استعادة الصيغة الأصلية؟ تعديلاتك على البنود ستُمحى (الوثائق الموقّعة لا تتأثر).'))return;const t=ctInit()[type];t.articles=null;t.title=CT_TYPES[type].title;t.subtitle=CT_TYPES[type].subtitle;save();renderPartners()}

/* ── حدودي الدنيا (خاصّ) ── */
function ctViewFloor(){
  const fl=ctFloor();
  return `<div class="badge-note" style="margin-bottom:14px"><i data-lucide="lock"></i><div><b>صفحة خاصة بك — لا تُرسل لأي شركة.</b> اقرأها قبل كل اجتماع. أي عرض يخالف بنداً هنا: «نحتاج ندرسه ونرد عليكم كتابياً».</div></div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="shield"></i> حدودي الدنيا في التفاوض</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="ctFloorSave(true);ctPrintFloor()"><i data-lucide="printer"></i> نسخة لي</button>
      <button class="btn btn-ghost btn-sm" onclick="if(confirm('استعادة البنود الأصلية؟')){ctInit().floor=null;save();renderPartners()}"><i data-lucide="rotate-ccw"></i> الأصلية</button>
      <button class="btn btn-gold btn-sm" onclick="ctFloorSave()"><i data-lucide="save"></i> حفظ</button></div></div>
      <div id="ctFloor" style="margin-top:12px">${fl.map((a,i)=>`<div class="ct-fl" style="display:grid;grid-template-columns:minmax(120px,190px) 1fr auto;gap:8px;align-items:start;margin-bottom:8px">
        <input class="ct-ft" value="${esc(a.t)}" style="font-weight:700"><textarea class="ct-fb" rows="2" style="line-height:1.7">${esc(a.b)}</textarea>
        <button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="ctFloorDel(${i})"><i data-lucide="trash-2"></i></button></div>`).join('')}</div>
      <button class="btn btn-ghost btn-sm" onclick="ctFloorAdd()"><i data-lucide="plus"></i> بند</button></div>`;
}
function ctCollectFloor(){return [...document.querySelectorAll('#ctFloor .ct-fl')].map(el=>({t:el.querySelector('.ct-ft').value.trim(),b:el.querySelector('.ct-fb').value.trim()})).filter(a=>a.t||a.b)}
function ctFloorSave(silent){if(!document.getElementById('ctFloor'))return;ctInit().floor=ctCollectFloor();save();if(!silent){renderPartners();alert('تم الحفظ ✓')}}
function ctFloorDel(i){const a=ctCollectFloor();a.splice(i,1);ctInit().floor=a;save();renderPartners()}
function ctFloorAdd(){const a=ctCollectFloor();a.push({t:'',b:''});ctInit().floor=a;save();renderPartners()}
async function ctPrintFloor(){const assets=await pkAssets();
  const inner=`<h1>حدودي الدنيا في التفاوض</h1><div class="sub">نسخة خاصة — لا تُسلَّم لأي طرف</div>
    <table class="list"><tr><th style="width:24%">البند</th><th>الحد</th></tr>${ctFloor().map(a=>`<tr><td><b>${esc(a.t)}</b></td><td>${esc(a.b)}</td></tr>`).join('')}</table>
    <h2>أسعاري وحدّي الأدنى</h2>${ctPriceTable(true)}`;
  pkPrintHTML(pkDocShell('حدودي_الدنيا',inner,{lh:assets.lh,stamp:''},'خاص — '+pkFmt(today())),'حدودي_الدنيا_'+today())}

/* ── أسعار الترخيص للجهات ── */
function ctViewPrices(){
  const pr=ctPrices();
  return `<div class="badge-note" style="margin-bottom:14px"><i data-lucide="info"></i><div>أرقام <b>مقترحة أولية</b> مبنية على سعر المقعد الحالي (149/129/99) — عدّلها قبل أي اجتماع. عمود <b>«حدّي»</b> خاص بك ولا يظهر في قائمة الأسعار المطبوعة للجهات.</div></div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="tags"></i> أسعار الترخيص للجهات (ريال، بدون الضريبة)</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="ctPricesSave(true);ctPrintPrices()"><i data-lucide="printer"></i> قائمة أسعار للجهات</button>
      <button class="btn btn-ghost btn-sm" onclick="if(confirm('استعادة الأسعار المقترحة الأصلية؟')){ctInit().prices=null;save();renderPartners()}"><i data-lucide="rotate-ccw"></i> الأصلية</button>
      <button class="btn btn-gold btn-sm" onclick="ctPricesSave()"><i data-lucide="save"></i> حفظ</button></div></div>
      <div style="overflow:auto;margin-top:12px"><table id="ctPrices"><thead><tr><th>البند</th><th>الوحدة</th><th>السعر المعلن</th><th>حدّي (خاص)</th><th>ملاحظة</th><th></th></tr></thead><tbody>
        ${pr.map((r,i)=>`<tr class="ct-pr"><td><input class="ct-pi" value="${esc(r.item)}" style="min-width:170px;font-weight:700"></td><td><input class="ct-pu" value="${esc(r.unit)}" style="min-width:170px"></td>
          <td><input class="ct-pp" value="${esc(r.price)}" dir="ltr" style="width:120px"></td><td><input class="ct-pf" value="${esc(r.floor)}" dir="ltr" style="width:110px;border-color:var(--gold)"></td>
          <td><input class="ct-pn" value="${esc(r.note)}" style="min-width:200px"></td><td><button class="btn btn-ghost btn-sm" style="color:var(--bad)" onclick="ctPriceDel(${i})"><i data-lucide="trash-2"></i></button></td></tr>`).join('')}
      </tbody></table></div>
      <button class="btn btn-ghost btn-sm" onclick="ctPriceAdd()"><i data-lucide="plus"></i> بند</button></div>`;
}
function ctCollectPrices(){return [...document.querySelectorAll('#ctPrices .ct-pr')].map(el=>({item:el.querySelector('.ct-pi').value.trim(),unit:el.querySelector('.ct-pu').value.trim(),price:el.querySelector('.ct-pp').value.trim(),floor:el.querySelector('.ct-pf').value.trim(),note:el.querySelector('.ct-pn').value.trim()})).filter(r=>r.item||r.price)}
function ctPricesSave(silent){if(!document.getElementById('ctPrices'))return;ctInit().prices=ctCollectPrices();save();if(!silent){renderPartners();alert('تم الحفظ ✓')}}
function ctPriceDel(i){const a=ctCollectPrices();a.splice(i,1);ctInit().prices=a;save();renderPartners()}
function ctPriceAdd(){const a=ctCollectPrices();a.push({item:'',unit:'',price:'',floor:'',note:''});ctInit().prices=a;save();renderPartners()}
function ctPriceTable(withFloor){
  return `<table class="list"><tr><th>البند</th><th>الوحدة</th><th>السعر (ريال)</th>${withFloor?'<th>حدّي</th>':''}<th>ملاحظات</th></tr>
    ${ctPrices().map(r=>`<tr><td><b>${esc(r.item)}</b></td><td>${esc(r.unit)}</td><td dir="ltr" style="text-align:right;white-space:nowrap">${esc(r.price)}</td>${withFloor?`<td dir="ltr" style="text-align:right;white-space:nowrap">${esc(r.floor)}</td>`:''}<td>${esc(r.note)}</td></tr>`).join('')}</table>`;
}
async function ctPrintPrices(){const assets=await pkAssets();const k=pkInit();
  const inner=`<h1>قائمة أسعار الترخيص للجهات</h1><div class="sub">منصة «حروف ودروس» التعليمية — أسعار مبدئية قابلة للتفاوض حسب النطاق</div>
    <div class="meta"><span><b>تاريخ الإصدار:</b> ${pkFmt(today())}م</span><span><b>صلاحية الأسعار:</b> (60) يومًا</span></div>
    ${ctPriceTable(false)}
    <p class="ex">- الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة.</p>
    <p class="ex">- الترخيص حق استخدام للمنصة ومحتواها خلال المدة، وتبقى ملكيتها الفكرية لمؤسسة حروف ودروس.</p>
    <p class="ex">- يُصدر عرض سعر نهائي لكل جهة بعد تحديد عدد المدارس والمواد ونموذج التشغيل.</p>`;
  pkPrintHTML(pkDocShell('قائمة_أسعار_الترخيص',inner,assets,'قائمة أسعار الترخيص · '+k.org.name),'قائمة_أسعار_الترخيص_'+today())}
