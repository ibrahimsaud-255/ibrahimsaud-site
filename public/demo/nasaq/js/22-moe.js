/*
 * 22-moe.js — «الشركات» ← شراكة وزارة التعليم: مقترح شراكة رسميّ لمنصّة
 *             «حروف ودروس»، يُحرَّر هنا ويُطبع/يُحفظ PDF للعرض على الوزارة.
 * ─────────────────────────────────────────────────────────────────────────
 * يُعرض داخل تطبيق «الشركات» (20-partners.js، القسم PK_SEC='moe').
 * البيانات في حالة اللوحة (app_state) تحت S.moeProposal — نفس نمط S.partnerKit:
 *   { meta:{title,subtitle,to,from,ref,version,date,note},
 *     stats:[{v,l,n}] | null,  sections:[{t,b}] | null }   (null = الافتراضيّ أدناه)
 * بيانات المؤسسة (الاسم، الموحّد، الممثّل، البريد) تُقرأ من قالب الشركاء pkInit().org.
 *
 * صيغة نصّ الأقسام:
 *   «- » بند نقطيّ · **نص** عريض · سطرٌ كلّه **عنوان:** عنوان فرعيّ
 *   [[…]] حقل ينتظر التعبئة (يُطبع مظلَّلاً أصفر حتى يُستبدل)
 *   سطور تبدأ بـ «|» جدول، السطر الأوّل رأسه (مثال: | العمود ١ | العمود ٢ |)
 *
 * ⚠️ نطاقٌ عامّ واحد + تعريفات فقط (انظر رأس 01-core.js). البادئة moe لكلّ شيء.
 */

/* ===== المحتوى الافتراضيّ ===== */
const MOE_DEFAULT_META={
  title:'مقترح شراكة استراتيجيّة',
  subtitle:'بين مؤسسة حروف ودروس ووزارة التعليم في المملكة العربية السعودية',
  to:'وزارة التعليم — [[الجهة المعنيّة: وكالة / إدارة عامّة]]',
  from:'مؤسسة حروف ودروس — منصّة «حروف ودروس» التعليميّة',
  ref:'HD-MOE-001',
  version:'مسوّدة للنقاش — الإصدار 1.0',
  date:'',
  note:'وثيقة للنقاش، ولا تُنشئ أيّ التزامٍ على أيٍّ من الطرفين قبل توقيع اتفاقيّةٍ رسميّة.',
};
const MOE_DEFAULT_STATS=[
  {v:'230+',l:'درساً تفاعليّاً ثلاثيّ الأبعاد',n:'مبنيّة على موضوعات الكتب المدرسيّة'},
  {v:'12',l:'صفّاً دراسيّاً',n:'من الأول الابتدائيّ حتى الثالث الثانويّ'},
  {v:'3',l:'ألعاب صفّيّة تنافسيّة',n:'حروف · من سيربح المليون · الكرسي الساخن'},
  {v:'[[ ]]',l:'سؤالاً منهجيّاً في بنك الأسئلة',n:'تمرّ بمعايير جودة قبل النشر'},
  {v:'[[ ]]',l:'معلّماً ومعلّمة مسجّلين',n:'حتى [[تاريخ]]'},
  {v:'[[ ]]',l:'مدرسةً تستخدم المنصّة',n:'بتراخيص مقاعد أو حسابات فرديّة'},
  {v:'[[ ]]',l:'جلسةً صفّيّة منفّذة',n:'ألعاب ودروس ثلاثيّة الأبعاد'},
  {v:'الويب وiOS',l:'منصّات التشغيل',n:'المتصفّح والسبّورات الذكيّة وأجهزة آبل'},
];
const MOE_DEFAULT_SECTIONS=[
  {t:'الملخّص التنفيذيّ',b:`«حروف ودروس» منصّة تعليميّة سعوديّة تحوّل دروس المنهج الوطنيّ إلى تجارب صفّيّة تفاعليّة: ألعاب تنافسيّة يديرها المعلّم على السبّورة الذكيّة، ودروس ثلاثيّة الأبعاد مبنيّة على موضوعات الكتب المدرسيّة من الصفّ الأول الابتدائيّ حتى الصفّ الثالث الثانويّ، وأدوات تعين المعلّم على إدارة الحصّة.
وتتقدّم مؤسسة حروف ودروس بهذا المقترح لبناء شراكة مع وزارة التعليم تهدف إلى:
- إتاحة المحتوى التفاعليّ للمعلّمين والطلاب من داخل المنظومة الرقميّة للوزارة، وفي مقدّمتها منصّة «مدرستي».
- ربط كلّ درس ثلاثيّ الأبعاد بصفحته في الكتاب المدرسيّ الرسميّ، بترخيص من الوزارة.
- إخضاع المحتوى لمراجعة المواءمة مع المناهج من قِبل المختصّين في الوزارة.
- قياس الأثر عبر تجربة تشغيليّة في مدارس مختارة قبل أيّ توسّع.
ويعرض هذا الملفّ نطاق الشراكة المقترح ومراحلها ونماذج الترخيص ومؤشّرات قياس الأداء، تمهيداً لمناقشتها والاتّفاق على صيغتها النهائيّة.`},
  {t:'التعريف بالمنصّة',b:`- **الألعاب الصفّيّة:** ثلاث ألعاب تنافسيّة مبنيّة على أسئلة المنهج: «حروف» (لوحة الخلايا السداسيّة بين فريقين)، و«من سيربح المليون» (جولة من خمسة عشر سؤالاً بثلاث وسائل مساعدة)، و«الكرسي الساخن». يختار المعلّم الصفّ والمادّة والوحدات والدروس، ويتولّى التحكيم بنفسه.
- **مختبر حروف ثلاثيّ الأبعاد:** أكثر من 230 درساً تفاعليّاً ثلاثيّ الأبعاد في العلوم والرياضيّات والأحياء والجغرافيا وغيرها، مصمّمة للعرض على السبّورات الذكيّة، ويتحكّم فيها المعلّم بالتدوير والتكبير والتنقّل بين مراحل الشرح.
- **مختبر حروف البرمجيّ:** دروس برمجة بالكتل لمقرّر المهارات الرقميّة في الصفوف الرابع والخامس والسادس الابتدائيّ.
- **أدوات المعلّم:** عجلة الأسماء، والمؤقّت، وتقسيم المجموعات، وجلسات الحصّة، وبنك أسئلة خاصّ بالمعلّم، وتقارير قابلة للطباعة.
- **ترخيص المدارس:** نظام مقاعد تديره المدرسة من لوحة خاصّة، يتيح توزيع الحسابات على المعلّمين وإعادة توزيعها ومتابعة الاستخدام.
- **منصّات التشغيل:** تطبيق ويب يعمل في المتصفّح وعلى السبّورات الذكيّة، وتطبيق على متجر آبل لأجهزة iPhone وiPad.`},
  {t:'القيمة المضافة',b:`**لوزارة التعليم:**
- محتوى رقميّ تفاعليّ سعوديّ مبنيّ على المنهج الوطنيّ، يدعم مستهدفات برنامج تنمية القدرات البشريّة ضمن رؤية المملكة 2030.
- استثمار أفضل للسبّورات الذكيّة والبنية الرقميّة القائمة في المدارس.
- تقارير استخدام مجمّعة، دون بيانات شخصيّة للطلاب، تساعد على متابعة تبنّي المحتوى الرقميّ.
- توسّع تدريجيّ مبنيّ على نتائج تجربة مقيسة.
**للمعلّم:**
- حصّة جاهزة للعرض خلال دقائق، مرتبطة بالدرس نفسه في الكتاب المدرسيّ.
- أدوات لإدارة الصفّ وتحفيز المشاركة دون إعداد مسبق طويل.
- تدريب ودعم فنّيّ باللغة العربيّة.
**للطالب:**
- فهم أعمق للمفاهيم المجرّدة عبر نماذج ثلاثيّة الأبعاد يمكن تدويرها واستكشافها.
- مشاركة نشطة وتعلّم تعاونيّ من خلال المنافسة بين الفرق.
- مراجعة محفّزة للدروس تعزّز ترسيخ المعلومة قبل الاختبارات.`},
  {t:'نطاق الشراكة (1): التكامل مع منصّة «مدرستي»',b:`نقترح تكاملاً تدريجيّاً مع منصّة «مدرستي» وفق المعايير والواجهات التقنيّة التي تعتمدها الوزارة:
- **الدخول الموحّد (SSO):** دخول المعلّمين والطلاب إلى «حروف ودروس» بحساباتهم في «مدرستي» دون إنشاء حسابات جديدة، عبر بروتوكول تعتمده الوزارة (مثل OpenID Connect أو SAML 2.0)، مع الاقتصار على الحدّ الأدنى من البيانات اللازمة (المعرّف، والدور، والمدرسة، والصفّ).
- **الروابط العميقة للدروس:** رابط مباشر من كلّ درس في «مدرستي» إلى الدرس ثلاثيّ الأبعاد أو اللعبة المرتبطة به، وفق ترميز موحّد (الصفّ / المادّة / الفصل الدراسيّ / الدرس).
- **الفصول والواجبات:** إسناد درس تفاعليّ أو جولة أسئلة نشاطاً صفّيّاً أو واجباً من داخل «مدرستي»، وإعادة حالة الإنجاز إليها [[إن أتاحت الوزارة واجهة لذلك]].
- **التضمين:** عرض الدروس ثلاثيّة الأبعاد داخل «مدرستي» عبر التضمين المباشر، أو عبر معيار LTI 1.3 إن كان مدعوماً.
وتلتزم المؤسسة بتنفيذ المتطلّبات التقنيّة والأمنيّة للتكامل، وتُحدَّد تفاصيله في وثيقة تكامل مشتركة بعد الاطّلاع على [[وثائق واجهات «مدرستي» وإجراءات الربط المعتمدة]].`},
  {t:'نطاق الشراكة (2): ترخيص عرض صفحات الكتب المدرسيّة',b:`بُني كلّ درس ثلاثيّ الأبعاد انطلاقاً من موضوع محدّد في الكتاب المدرسيّ. ونطلب ترخيص عرض الصفحة الرسميّة المرتبطة بالدرس داخل النموذج نفسه، ليتنقّل المعلّم والطالب بين الشرح المجسّم والنصّ المعتمد بلمسة واحدة.
- **الحالة الحاليّة:** الميزة مبنيّة ومجرّبة داخليّاً على [[عدد]] دروس، وهي مقفلة؛ فلا تُعرض أيّ صفحة من الكتب المدرسيّة للمستخدمين احتراماً لحقوق النشر.
- **عند الترخيص:** تُستكمل صفحات بقيّة الدروس، وتُفعَّل الميزة مركزيّاً من لوحة الإدارة بمفتاح تشغيل واحد.
- **الضوابط المقترحة:** عرض للقراءة فقط داخل الدرس، دون إتاحة تنزيل الكتاب كاملاً، مع الإشارة إلى مصدر الصفحة وحقوق الوزارة، والتحديث مع كلّ طبعة جديدة.
- **نطاق الترخيص المطلوب:** [[المواد والصفوف المشمولة، ومدّة الترخيص، وأيّ اشتراطات للعرض]].`},
  {t:'نطاق الشراكة (3): مراجعة المواءمة مع المناهج',b:`- تشكيل فريق مراجعة من [[الإدارة العامّة للمناهج / جهة تحدّدها الوزارة]] لمراجعة الدروس ثلاثيّة الأبعاد وبنك الأسئلة من حيث الدقّة العلميّة والمواءمة مع نواتج التعلّم.
- تلتزم المؤسسة بإجراء التعديلات المطلوبة خلال [[مدّة]] يوم عمل من استلام الملاحظات.
- اعتماد آليّة دوريّة لتحديث المحتوى مع كلّ تعديل على المناهج أو طبعة جديدة للكتب.
- تمرّ الأسئلة الجديدة حاليّاً بمعايير جودة داخليّة قبل نشرها، ويمكن مواءمة هذه المعايير مع معايير الوزارة وهيئة تقويم التعليم والتدريب.`},
  {t:'نطاق الشراكة (4): التجربة التشغيليّة',b:`نقترح البدء بتجربة تشغيليّة محدودة قبل أيّ توسّع:
- **النطاق:** [[عدد]] مدرسة في [[المنطقة / إدارة التعليم]]، تشمل المراحل [[الابتدائيّة / المتوسّطة / الثانويّة]].
- **المدّة:** [[فصل دراسيّ واحد]].
- **المخرجات:** تقرير استخدام دوريّ، واستبانة رضا للمعلّمين، وقياس قبليّ وبعديّ في [[مواد مختارة]] بالتنسيق مع الوزارة.
- **التكلفة:** [[دون مقابل / بتكلفة رمزيّة]] خلال فترة التجربة.
- **قرار التوسّع:** يُبنى على مؤشّرات الأداء المتّفق عليها في هذا الملفّ.`},
  {t:'نطاق الشراكة (5): تدريب المعلّمين',b:`- ورش تدريب حضوريّة أو عن بُعد للمعلّمين في مدارس التجربة، مدّة الورشة [[ ]] ساعة.
- أدلّة استخدام مختصرة ومقاطع فيديو قصيرة باللغة العربيّة لكلّ أداة.
- إعداد «معلّمين سفراء» في كلّ مدرسة لدعم زملائهم.
- [[إمكانيّة اعتماد ساعات التدريب ضمن التطوير المهنيّ بالتنسيق مع الجهة المختصّة]].`},
  {t:'حماية البيانات والأمن السيبرانيّ',b:`- **الامتثال النظاميّ:** تلتزم المؤسسة بنظام حماية البيانات الشخصيّة ولوائحه التنفيذيّة، وبضوابط إدارة البيانات الوطنيّة الصادرة عن مكتب إدارة البيانات الوطنيّة في الهيئة السعوديّة للبيانات والذكاء الاصطناعيّ (سدايا)، وبالضوابط الأساسيّة للأمن السيبرانيّ الصادرة عن الهيئة الوطنيّة للأمن السيبرانيّ بحسب انطباقها، وتستعدّ لأيّ تقييم تطلبه الوزارة.
- **تقليل البيانات:** تُجمع البيانات اللازمة لتقديم الخدمة فقط، ولا تتطلّب أغلب الاستخدامات الصفّيّة إنشاء حسابات للطلاب؛ إذ تُدار الألعاب والدروس من حساب المعلّم.
- **عدم الاستخدام التجاريّ:** لا تُباع البيانات ولا تُستخدم لأغراض إعلانيّة.
- **التأمين التقنيّ:** تشفير الاتّصال (TLS)، وصلاحيّات وصول مقيّدة على قاعدة البيانات، وسجلّات للعمليّات الإداريّة.
- **موقع الاستضافة:** [[موقع استضافة البيانات الحاليّ]]؛ والمؤسسة مستعدّة لنقل الاستضافة إلى مزوّد سحابيّ داخل المملكة إن اشترطت الوزارة ذلك.
- **المعالجون الخارجيّون:** تُرفق قائمة بمزوّدي الخدمات الذين يعالجون البيانات وأماكن المعالجة [[ملحق]]، ويمكن تعطيل المزايا المعتمدة على مزوّدين خارجيّين لحسابات الوزارة.
- **الحوادث:** إبلاغ الوزارة والجهات المختصّة بأيّ حادثة تسرّب وفق المدد النظاميّة.
- **انتهاء الشراكة:** حذف بيانات الحسابات المرتبطة بالشراكة أو تسليمها للوزارة وفق ما تقرّره.`},
  {t:'الدعم الفنّيّ ومستويات الخدمة المقترحة',b:`| مستوى البلاغ | المثال | زمن الاستجابة | زمن المعالجة المستهدف |
| حرج | تعطّل المنصّة أو الدخول لجميع المستخدمين | [[ساعتان]] | [[24 ساعة]] |
| مرتفع | تعطّل ميزة رئيسيّة في عدد من المدارس | [[4 ساعات عمل]] | [[يوما عمل]] |
| متوسّط | خلل في درس أو سؤال محدّد | [[يوم عمل]] | [[5 أيّام عمل]] |
| منخفض | استفسار أو طلب تحسين | [[يوما عمل]] | حسب خطّة التطوير |
- **قنوات الدعم:** البريد الإلكترونيّ، وواتساب الأعمال، ونظام التذاكر داخل المنصّة.
- **ساعات الدعم:** [[الأحد – الخميس، من 7 صباحاً حتى 3 عصراً]].
- **نسبة التوفّر المستهدفة:** [[99%]] شهريّاً، باستثناء الصيانة المجدولة المُعلن عنها مسبقاً.
تُعدّ هذه المستويات مقترحة وقابلة للتفاوض، وتُثبَّت في اتفاقيّة مستوى الخدمة عند التعاقد.`},
  {t:'نماذج التسعير المقترحة',b:`| النموذج | النطاق | السعر الاسترشاديّ |
| ترخيص مدرسة بالمقاعد | من 10 إلى 24 مقعداً | 149 ريالاً للمقعد سنويّاً |
| ترخيص مدرسة بالمقاعد | من 25 إلى 49 مقعداً | 129 ريالاً للمقعد سنويّاً |
| ترخيص مدرسة بالمقاعد | 50 مقعداً فأكثر | 99 ريالاً للمقعد سنويّاً |
| ترخيص إدارة تعليم / منطقة | جميع مدارس الإدارة أو مراحل محدّدة | [[يُحدَّد بالتفاوض حسب العدد]] |
| ترخيص وطنيّ | جميع مدارس التعليم العامّ | [[يُحدَّد بالتفاوض]] |
| التجربة التشغيليّة | [[عدد]] مدرسة لمدّة [[فصل دراسيّ]] | [[دون مقابل / تكلفة رمزيّة]] |
- الأسعار استرشاديّة وفق قائمة أسعار المدارس الحاليّة، و[[شاملة / غير شاملة]] ضريبة القيمة المضافة.
- المقعد يمنح معلّماً واحداً وصولاً كاملاً لمدّة سنة، ويمكن للمدرسة إعادة توزيعه.
- تخضع الأسعار للتفاوض بحسب الحجم ومدّة التعاقد ونطاق التكامل.`},
  {t:'مؤشّرات الأداء والتقارير',b:`| المؤشّر | طريقة القياس | المستهدف |
| نسبة المعلّمين النشطين | المعلّمون الذين استخدموا المنصّة أسبوعيّاً ÷ المرخَّصين | [[ ]]% |
| الحصص المنفّذة | عدد الجلسات الصفّيّة لكلّ معلّم شهريّاً | [[ ]] |
| تغطية المنهج | نسبة الدروس المستخدمة من دروس الصفّ | [[ ]]% |
| رضا المعلّمين | استبانة في منتصف التجربة ونهايتها | [[ ]] من 5 |
| أثر التعلّم | قياس قبليّ وبعديّ في مواد مختارة | [[ ]] |
| استقرار الخدمة | نسبة التوفّر الشهريّة | [[99%]] |
- تُقدَّم تقارير [[شهريّة]] للوزارة بلوحة مؤشّرات مجمّعة على مستوى المدرسة والإدارة، دون بيانات شخصيّة للطلاب.`},
  {t:'الجدول الزمنيّ والمراحل',b:`| المرحلة | الأنشطة الرئيسة | المدّة التقديريّة |
| 1. التأسيس | توقيع مذكّرة التفاهم، تشكيل فريق مشترك، اعتماد نطاق التجربة | [[4 أسابيع]] |
| 2. الإعداد | مراجعة المواءمة، تجهيز التكامل الأوّليّ، تدريب معلّمي التجربة | [[6 أسابيع]] |
| 3. التجربة التشغيليّة | التشغيل في المدارس المختارة مع تقارير دوريّة | [[فصل دراسيّ]] |
| 4. التقييم | تحليل النتائج، وتقرير مشترك، وتوصية التوسّع | [[4 أسابيع]] |
| 5. التوسّع | التكامل الكامل مع «مدرستي» والتعميم التدريجيّ | [[بحسب القرار]] |`},
  {t:'التزامات الطرفين المقترحة',b:`**تلتزم مؤسسة حروف ودروس بـ:**
- إتاحة المنصّة للمدارس المشمولة وفق النطاق المتّفق عليه.
- تنفيذ التعديلات الناتجة عن مراجعة المواءمة في المدد المتّفق عليها.
- الالتزام بمتطلّبات حماية البيانات والأمن السيبرانيّ.
- التدريب والدعم الفنّيّ ورفع التقارير الدوريّة.
**تتولّى وزارة التعليم:**
- تسمية جهة اتّصال وفريق مختصّ لمراجعة المحتوى.
- إتاحة وثائق التكامل الفنّيّة مع «مدرستي» وفق إجراءاتها.
- تحديد مدارس التجربة وتسهيل التواصل معها.
- النظر في ترخيص عرض صفحات الكتب المدرسيّة داخل الدروس.`},
  {t:'الخطوات التالية المقترحة',b:`- اجتماع تعريفيّ مع الجهة المعنيّة وعرض مباشر للمنصّة على السبّورة الذكيّة.
- الاتّفاق على نطاق التجربة التشغيليّة ومؤشّراتها.
- توقيع مذكّرة تفاهم تمهيديّة.
- البدء بالمرحلة الأولى وفق الجدول الزمنيّ.`},
  {t:'جهات التواصل',b:`| الطرف | الاسم | الصفة | التواصل |
| مؤسسة حروف ودروس | إبراهيم سعود بوحيمد | المالك والمؤسّس | huroofduroos@gmail.com · [[رقم الجوال]] |
| وزارة التعليم | [[ ]] | [[ ]] | [[ ]] |
الموقع الإلكترونيّ: huroofduroos.com`},
];

/* ===== الحالة ===== */
function moeInit(){
  if(!S.moeProposal||typeof S.moeProposal!=='object')S.moeProposal={meta:{},stats:null,sections:null};
  const m=S.moeProposal;
  m.meta=Object.assign({},MOE_DEFAULT_META,m.meta||{});
  return m;
}
function moeStats(){const m=moeInit();return Array.isArray(m.stats)?m.stats:MOE_DEFAULT_STATS}
function moeSections(){const m=moeInit();return (Array.isArray(m.sections)&&m.sections.length)?m.sections:MOE_DEFAULT_SECTIONS}
/* كم حقلاً [[…]] ينتظر التعبئة في الملفّ كلّه */
function moeBlanks(){const m=moeInit();const all=JSON.stringify([m.meta,moeStats(),moeSections()]);return (all.match(/\[\[/g)||[]).length+(m.meta.date?0:1)}

/* ===== التحرير ===== */
function moeView(){
  const m=moeInit();const mt=m.meta;const st=moeStats();const secs=moeSections();const n=moeBlanks();
  const inp=(id,label,val,extra)=>`<div class="field"><label>${label}</label><input id="${id}" value="${esc(val||'')}" ${extra||''}></div>`;
  return `
    <div class="badge-note" style="margin-bottom:16px"><i data-lucide="landmark"></i><div>
      <b>مقترح شراكة مع وزارة التعليم</b> — جاهز للعرض والنقاش. عدّل أيّ نصّ هنا، ثمّ «معاينة» أو «طباعة / حفظ PDF».
      ${n?`<br><span style="color:var(--warn);font-weight:700">${n} حقلاً ينتظر التعبئة</span> — كلّ <code>[[…]]</code> يُطبع مظلَّلاً أصفر حتى تستبدله بالقيمة الصحيحة.`:'<br><span style="color:var(--good);font-weight:700">✓ لا حقول ناقصة</span>'}
    </div></div>
    <style>@media(max-width:640px){#moeStats .moe-st{grid-template-columns:84px 1fr auto!important}#moeStats .ms-n{grid-column:1/-1;grid-row:2}}</style>
    <div id="moeEd" onchange="moeSave(true)">
    <div class="card" style="margin-bottom:16px"><h3><i data-lucide="file-text"></i> الغلاف</h3>
      <div class="row2">${inp('mo_title','العنوان',mt.title)}${inp('mo_sub','العنوان الفرعيّ',mt.subtitle)}</div>
      <div class="row2">${inp('mo_to','مقدَّم إلى',mt.to)}${inp('mo_from','مقدَّم من',mt.from)}</div>
      <div class="row3">${inp('mo_ref','الرقم المرجعيّ',mt.ref,'dir="ltr"')}${inp('mo_ver','الإصدار',mt.version)}${inp('mo_date','التاريخ',mt.date,'type="date"')}</div>
      ${inp('mo_note','ملاحظة السرّيّة (أسفل الغلاف)',mt.note)}
      <div style="color:var(--muted);font-size:12px">بيانات المؤسسة (الاسم، الرقم الموحّد، الممثّل، البريد) تُؤخذ من «قالب الاتفاقية» في قسم الشركاء والعمولات.</div>
    </div>
    <div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="bar-chart-3"></i> المنصّة بالأرقام</h3>
      <button class="btn btn-ghost btn-sm" onclick="moeStatAdd()"><i data-lucide="plus"></i> رقم</button></div>
      <div style="color:var(--muted);font-size:12px;margin:8px 0 10px">اترك <code>[[ ]]</code> لأيّ رقم غير مؤكَّد — لا تُكتب أرقام تقديريّة في ملفّ رسميّ.</div>
      <div id="moeStats">${st.map((x,i)=>`<div class="moe-st" style="display:grid;grid-template-columns:110px 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center">
        <input class="ms-v" value="${esc(x.v)}" placeholder="الرقم" style="font-weight:800;text-align:center">
        <input class="ms-l" value="${esc(x.l)}" placeholder="الوصف">
        <input class="ms-n" value="${esc(x.n||'')}" placeholder="ملاحظة صغيرة (اختياريّ)">
        <button class="btn btn-ghost btn-sm" title="حذف" style="color:var(--bad)" onclick="moeStatDel(${i})"><i data-lucide="trash-2"></i></button></div>`).join('')}</div>
    </div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0"><i data-lucide="list-ordered"></i> أقسام المقترح والبنود</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="moeReset()"><i data-lucide="rotate-ccw"></i> استعادة النصّ الأصليّ</button>
        <button class="btn btn-gold btn-sm" onclick="moeSave()"><i data-lucide="save"></i> حفظ</button></div></div>
      <div class="badge-note" style="margin:12px 0"><i data-lucide="info"></i><div>
        <b>«- »</b> في أوّل السطر بندٌ نقطيّ · <b>**نص**</b> عريض · سطرٌ كلّه <b>**عنوان:**</b> عنوان فرعيّ · <code>[[…]]</code> حقل للتعبئة ·
        السطور التي تبدأ بـ<b>«|»</b> جدول (السطر الأوّل رأسه). الترقيم يُضاف تلقائيّاً عند الطباعة.</div></div>
      <div id="moeSecs">${secs.map((a,i)=>moeSecRow(a,i,secs.length)).join('')}</div>
      <button class="btn btn-ghost btn-sm" onclick="moeSecAdd()"><i data-lucide="plus"></i> إضافة قسم</button>
    </div>
    </div>`;
}
function moeSecRow(a,i,n){return `<div class="moe-sec" style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px">
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><span style="color:var(--gold);font-weight:800;min-width:22px;text-align:center">${i+1}</span><input class="ms-t" value="${esc(a.t)}" style="font-weight:700">
    <button class="btn btn-ghost btn-sm" title="أعلى" onclick="moeSecMove(${i},-1)" ${i===0?'disabled':''}><i data-lucide="arrow-up"></i></button>
    <button class="btn btn-ghost btn-sm" title="أسفل" onclick="moeSecMove(${i},1)" ${i===n-1?'disabled':''}><i data-lucide="arrow-down"></i></button>
    <button class="btn btn-ghost btn-sm" title="حذف" style="color:var(--bad)" onclick="moeSecDel(${i})"><i data-lucide="trash-2"></i></button></div>
  <textarea class="ms-b" rows="${Math.min(16,Math.max(3,String(a.b).split('\n').length+2))}" style="line-height:1.8">${esc(a.b)}</textarea></div>`}
function moeCollectSecs(){return [...document.querySelectorAll('#moeSecs .moe-sec')].map(el=>({t:el.querySelector('.ms-t').value.trim(),b:el.querySelector('.ms-b').value.trim()})).filter(a=>a.t||a.b)}
function moeCollectStats(){return [...document.querySelectorAll('#moeStats .moe-st')].map(el=>({v:el.querySelector('.ms-v').value.trim(),l:el.querySelector('.ms-l').value.trim(),n:el.querySelector('.ms-n').value.trim()})).filter(x=>x.v||x.l)}
function moeSave(silent){
  const m=moeInit();if(!document.getElementById('moeEd'))return;
  m.sections=moeCollectSecs();m.stats=moeCollectStats();
  Object.assign(m.meta,{title:pkVal('mo_title')||MOE_DEFAULT_META.title,subtitle:pkVal('mo_sub'),to:pkVal('mo_to'),from:pkVal('mo_from'),ref:pkVal('mo_ref'),version:pkVal('mo_ver'),date:pkVal('mo_date'),note:pkVal('mo_note')});
  save();if(!silent){renderPartners();alert('حُفظ ملفّ الشراكة ✓')}
}
function moeSecMove(i,dir){moeSave(true);const a=moeSections().slice();const j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];moeInit().sections=a;save();renderPartners()}
function moeSecDel(i){if(!confirm('حذف هذا القسم؟'))return;moeSave(true);const a=moeSections().slice();a.splice(i,1);moeInit().sections=a;save();renderPartners()}
function moeSecAdd(){moeSave(true);const a=moeSections().slice();a.push({t:'قسم جديد',b:''});moeInit().sections=a;save();renderPartners();setTimeout(()=>{const els=document.querySelectorAll('#moeSecs .ms-t');const el=els[els.length-1];if(el){el.focus();el.select();el.scrollIntoView({block:'center'})}},50)}
function moeStatAdd(){moeSave(true);const a=moeStats().slice();a.push({v:'[[ ]]',l:'',n:''});moeInit().stats=a;save();renderPartners()}
function moeStatDel(i){moeSave(true);const a=moeStats().slice();a.splice(i,1);moeInit().stats=a;save();renderPartners()}
function moeReset(){if(!confirm('استعادة النصّ الأصليّ للأقسام والأرقام؟ تعديلاتك عليها ستُمحى (بيانات الغلاف تبقى).'))return;const m=moeInit();m.sections=null;m.stats=null;save();renderPartners()}

/* ===== التحويل إلى HTML للطباعة ===== */
function moeInline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\[\[(.*?)\]\]/g,(x,t)=>`<span class="ph">${t.trim()||'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</span>`)}
function moeBodyHTML(text){
  const lines=String(text||'').split('\n');let out='',mode='',rows=[];
  const flush=()=>{
    if(mode==='ul')out+='</ul>';
    if(mode==='tb'&&rows.length){const [h,...b]=rows;out+=`<table class="tb"><thead><tr>${h.map(c=>`<th>${moeInline(c)}</th>`).join('')}</tr></thead><tbody>${b.map(r=>`<tr>${r.map(c=>`<td>${moeInline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
    mode='';rows=[];
  };
  lines.forEach(raw=>{const ln=raw.trim();
    if(/^\|/.test(ln)){if(mode!=='tb'){flush();mode='tb'}const cells=ln.replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());if(!cells.every(c=>/^:?-{2,}:?$/.test(c)))rows.push(cells);return}
    if(/^-\s+/.test(ln)){if(mode!=='ul'){flush();out+='<ul>';mode='ul'}out+=`<li>${moeInline(ln.replace(/^-\s+/,''))}</li>`;return}
    flush();
    if(!ln)return;
    if(/^\*\*[^*]+\*\*$/.test(ln)){out+=`<h4>${moeInline(ln.replace(/^\*\*|\*\*$/g,''))}</h4>`;return}
    out+=`<p>${moeInline(ln)}</p>`;
  });
  flush();return out;
}
function moeDocHTML(forScreen){
  const m=moeInit();const mt=m.meta;const org=pkInit().org;const st=moeStats();const secs=moeSections();
  const F=location.origin+'/fonts/thmanyah/';const logo=new URL('./assets/huroof-logo.png',location.href).href;
  const dt=mt.date;const dateTxt=dt?`${pkHijri(dt)} — ${pkFmt(dt)}م`:'<span class="ph">التاريخ</span>';
  const head=`<div class="rh"><img src="${logo}" alt=""><span>${esc(mt.title)} · ${esc(org.name)}</span><span dir="ltr">${esc(mt.ref||'')}</span></div>`;
  const foot=`<div class="rf"><span>${esc(mt.version||'')}</span><span>huroofduroos.com · ${esc(org.email||'')}</span></div>`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(mt.title)} — ${esc(org.name)}</title>
  <style>
    @font-face{font-family:TS;src:url("${F}thmanyahsans-Regular.woff2") format("woff2");font-weight:400}
    @font-face{font-family:TS;src:url("${F}thmanyahsans-Medium.woff2") format("woff2");font-weight:500}
    @font-face{font-family:TS;src:url("${F}thmanyahsans-Bold.woff2") format("woff2");font-weight:700}
    @font-face{font-family:TS;src:url("${F}thmanyahsans-Black.woff2") format("woff2");font-weight:900}
    @font-face{font-family:TSe;src:url("${F}thmanyahserifdisplay-Bold.woff2") format("woff2");font-weight:700}
    @font-face{font-family:TSe;src:url("${F}thmanyahserifdisplay-Black.woff2") format("woff2");font-weight:900}
    @page{size:A4;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    :root{--navy:#173264;--ink:#1d2433;--mut:#5b6274;--line:#dfe3ec;--soft:#f4f6fa;--org:#FF9000}
    html,body{margin:0;padding:0;background:#fff}
    body{font-family:TS,Tahoma,sans-serif;color:var(--ink);font-size:10.6pt;line-height:1.85}
    ${forScreen?`body{background:#e9ecf2}.sheet{background:#fff;width:210mm;margin:18px auto;box-shadow:0 6px 30px rgba(20,30,60,.18)}
      .bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;justify-content:center;align-items:center;padding:10px;background:#173264;color:#fff;font-size:13px}
      .bar button{font:700 14px TS,sans-serif;background:#FF9000;color:#111;border:0;border-radius:10px;padding:9px 18px;cursor:pointer}
      @media print{.bar{display:none}body{background:#fff}.sheet{margin:0;box-shadow:none}}`:'.sheet{width:210mm}'}
    /* الغلاف */
    .cover{height:297mm;position:relative;overflow:hidden;page-break-after:always;padding:30mm 22mm 24mm;display:flex;flex-direction:column}
    .cover .band{position:absolute;inset:0 0 auto 0;height:9mm;background:var(--navy)}
    .cover .band i{position:absolute;inset:0 auto 0 0;width:38%;background:var(--org)}
    .cover .hex{position:absolute;left:-26mm;top:92mm;width:92mm;opacity:.05}
    .cover .logo{width:62mm;margin-bottom:22mm}
    .cover .kick{color:var(--org);font-weight:700;font-size:12pt;letter-spacing:.2px}
    .cover h1{font-family:TSe,TS,serif;font-weight:900;color:var(--navy);font-size:34pt;line-height:1.25;margin:4mm 0 3mm}
    .cover .sub{font-size:14pt;color:var(--mut);max-width:150mm}
    .cover .meta{margin-top:auto;border-top:2px solid var(--navy);padding-top:6mm;display:grid;grid-template-columns:1fr 1fr;gap:4mm 10mm;font-size:10.4pt}
    .cover .meta b{display:block;color:var(--navy);font-size:9pt;font-weight:700;opacity:.8}
    .cover .conf{margin-top:7mm;font-size:8.8pt;color:var(--mut);background:var(--soft);border-right:3px solid var(--org);padding:3mm 4mm}
    /* الصفحات الداخليّة */
    table.pg{width:210mm;border-collapse:collapse}
    table.pg>thead td{height:24mm;padding:0 17mm;vertical-align:middle}
    table.pg>tfoot td{height:17mm;padding:0 17mm;vertical-align:middle}
    table.pg>tbody>tr>td{padding:0 17mm}
    .rh{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:5mm 0 3mm;font-size:8.6pt;color:var(--mut)}
    .rh img{height:9mm}.rh span:nth-child(2){flex:1}
    .rf{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:3mm;font-size:8pt;color:#8a90a0}
    h2{font-family:TSe,TS,serif;font-weight:900;color:var(--navy);font-size:16pt;margin:9mm 0 3mm;page-break-after:avoid;display:flex;align-items:center;gap:8px}
    h2 .n{display:inline-grid;place-items:center;min-width:9mm;height:9mm;padding:0 2mm;border-radius:2.4mm;background:var(--navy);color:#fff;font:700 11pt TS,sans-serif}
    h3.toc-h{font-family:TSe,TS,serif;color:var(--navy);font-size:16pt;margin:8mm 0 3mm}
    h4{color:var(--navy);font-size:11pt;margin:4mm 0 1.5mm;page-break-after:avoid}
    p{margin:0 0 2.4mm;text-align:justify}
    ul{margin:0 0 3mm;padding-inline-start:6mm}
    li{margin-bottom:1.6mm;text-align:justify}
    li::marker{color:var(--org)}
    b{color:#0f1f44}
    .ph{background:#fff1a8;border-bottom:1px dashed #c9a400;padding:0 3px;border-radius:2px;color:#5a4a00}
    table.tb{width:100%;border-collapse:collapse;margin:2mm 0 4mm;font-size:9.4pt;page-break-inside:auto}
    table.tb th{background:var(--navy);color:#fff;text-align:right;padding:2.2mm 3mm;font-weight:700}
    table.tb td{border-bottom:1px solid var(--line);padding:2.2mm 3mm;vertical-align:top}
    table.tb tr:nth-child(even) td{background:var(--soft)}
    table.tb tr{page-break-inside:avoid}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:3mm 0 4mm;page-break-inside:avoid}
    .stat{border:1px solid var(--line);border-top:3px solid var(--org);border-radius:2.5mm;padding:3.5mm 3mm;background:#fff}
    .stat .v{font:900 19pt TS,sans-serif;color:var(--navy);line-height:1.2}
    .stat .l{font-weight:700;font-size:9.4pt;margin-top:1mm;line-height:1.5}
    .stat .nn{font-size:8pt;color:var(--mut);line-height:1.5;margin-top:1mm}
    ol.toc{list-style:none;margin:0 0 4mm;padding:0;columns:2;column-gap:10mm}
    ol.toc li{display:flex;gap:3mm;padding:1.6mm 0;border-bottom:1px dotted var(--line);font-size:10pt;break-inside:avoid}
    ol.toc li span{color:var(--org);font-weight:700;min-width:6mm}
  </style></head><body>
  ${forScreen?`<div class="bar"><span>معاينة — ${esc(mt.title)}</span><button onclick="window.print()">طباعة / حفظ PDF</button></div>`:''}
  <div class="sheet">
  <section class="cover">
    <div class="band"><i></i></div>
    <svg class="hex" viewBox="0 0 100 100"><polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#173264"/></svg>
    <img class="logo" src="${logo}" alt="حروف ودروس">
    <div class="kick">${moeInline(mt.version||'')}</div>
    <h1>${moeInline(mt.title)}</h1>
    <div class="sub">${moeInline(mt.subtitle||'')}</div>
    <div class="meta">
      <div><b>مقدَّم إلى</b>${moeInline(mt.to||'')}</div>
      <div><b>مقدَّم من</b>${moeInline(mt.from||'')}</div>
      <div><b>التاريخ</b>${dateTxt}</div>
      <div><b>الرقم المرجعيّ</b><span dir="ltr">${esc(mt.ref||'')}</span></div>
      <div><b>الجهة</b>${esc(org.name)}${org.unified?' — الرقم الوطنيّ الموحّد '+esc(org.unified):''}</div>
      <div><b>المفوَّض بالتواصل</b>${esc(org.rep)} — ${esc(org.repTitle)} · <span dir="ltr">${esc(org.email)}</span></div>
    </div>
    ${mt.note?`<div class="conf">${moeInline(mt.note)}</div>`:''}
  </section>
  <table class="pg"><thead><tr><td>${head}</td></tr></thead><tfoot><tr><td>${foot}</td></tr></tfoot><tbody><tr><td>
    <h3 class="toc-h">المحتويات</h3>
    <ol class="toc">${['المنصّة بالأرقام',...secs.map(s=>s.t)].map((t,i)=>`<li><span>${i+1}</span>${moeInline(t)}</li>`).join('')}</ol>
    <h2><span class="n">1</span>المنصّة بالأرقام</h2>
    <div class="stats">${st.map(x=>`<div class="stat"><div class="v">${moeInline(x.v)}</div><div class="l">${moeInline(x.l)}</div>${x.n?`<div class="nn">${moeInline(x.n)}</div>`:''}</div>`).join('')}</div>
    ${secs.map((s,i)=>`<h2><span class="n">${i+2}</span>${moeInline(s.t)}</h2>${moeBodyHTML(s.b)}`).join('')}
  </td></tr></tbody></table>
  </div></body></html>`;
}
function moeFileName(){const m=moeInit();return 'مقترح_شراكة_وزارة_التعليم_حروف_ودروس'+(m.meta.ref?'_'+m.meta.ref:'')}
function moePreview(){moeSave(true);const w=window.open('','_blank');if(!w){alert('اسمح بالنوافذ المنبثقة لعرض المعاينة.');return}w.document.open();w.document.write(moeDocHTML(true));w.document.close();try{w.document.title=moeFileName()}catch(e){}}
function moePrint(){moeSave(true);pkPrintHTML(moeDocHTML(false),moeFileName())}
