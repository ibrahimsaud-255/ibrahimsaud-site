// المتجر الرقميّ (/shop/) — محتوى صفحات المنتجات.
// ─────────────────────────────────────────────────────────────────────────
// المحتوى (العناوين، ما بداخل الحزمة، الأسئلة) هنا في الكود مثل site.ts،
// أمّا **السعر الحقيقيّ والملفّات والتفعيل** ففي جدول shop_products بـSupabase:
// الصفحة تقرأ السعر حيّاً منه فيطابق ما يُخصم فعلاً، و`fallbackPrice` يظهر
// فقط لو تعذّرت القراءة. منتج جديد = صفّ في الجدول + مدخل هنا بنفس الـsku.
// الدليل: docs/المتجر-الرقمي.md

export const SHOP_FN = "https://rrerwhhxrjyzmnnjsfev.supabase.co/functions/v1/shop";
const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

export type ShopItem = {
  sku: string;
  slug: string;
  name: string;
  kicker: string;          // سطر صغير أزرق فوق الاسم
  tagline: string;         // العنوان الكبير
  sub: string;             // الفقرة تحت العنوان
  cover?: string;          // صورة الغلاف (اختياريّة)
  icon: string;            // رمز بسيط يظهر في البطاقة والواجهة بدل الصورة
  fallbackPrice: number;   // يظهر فقط لو تعذّرت قراءة السعر الحيّ
  lang?: import("./shopUi").ShopLang;   // لغة الصفحة (الافتراضيّ عربيّ) — «ru» لنسخة روسيا و«en» للإنجليزيّة
  sale?: { label: string; until: string; was: Record<number, number> };   // خصم مؤقّت: السعر الحيّ ← السعر قبل الخصم (يُشطب)، ويختفي بعد until
  format: string;          // «ملفّات رقميّة — تنزيل فوريّ»…
  inside: { title: string; text: string }[];
  forWho: string[];
  steps: string[];         // كيف يشتغل بعد الشراء
  faqs: { q: string; a: string }[];
  presale?: boolean;       // يُعرض «قريباً» بلا زرّ شراء ما لم يكن نشطاً في الجدول
  iconImg?: string;        // أيقونة صورة بدل الرمز (للبرامج)
  logo?: string;           // شعار كلمة (يظهر بدل الاسم المكتوب في رأس الصفحة)
  shots?: { src: string; alt: string }[];   // لقطات حقيقيّة من البرنامج
  platforms?: { key: "windows" | "mac" | "android" | "ios"; name: string; note: string; soon?: string }[];
  specs?: { title: string; rows: [string, string][] }[];
  promo?: { src: string; poster: string; title: string; text: string };   // مقطع قصير عموديّ
  hidden?: boolean;        // لا يظهر في قائمة /shop/ (الصفحة تفتح برابطها فقط)
  publicPath?: string;     // صفحة عامّة معلَنة ومفهرسة لنفس المنتج (مثل /lessons-broadcast/)
  seo?: { title: string; paras: string[] };   // فقرة تعريفيّة بكلمات البحث (تظهر في الصفحة)
};

export const shopItems: ShopItem[] = [
  {
    sku: "lessons-broadcast",
    slug: "lessons-broadcast",
    name: "برنامج بث الدروس العلمية",
    kicker: "للجمعيّات والمساجد وطلّاب العلم والمعلّمين",
    tagline: "درسك على الهواء باحتراف. بضغطة زر.",
    publicPath: "/lessons-broadcast/",
    sub: "برنامج عربيّ سهل يبثّ الدرس ويسجّله: المتحدّث والكتاب في الشاشة، المكتبة الشاملة داخله، وشعارات جهتك — على يوتيوب وفيسبوك وتيليجرام في نفس الوقت.",
    icon: "📡",
    iconImg: "/shop/lessons-broadcast/icon.png",
    logo: "/shop/lessons-broadcast/logo-black.png",
    shots: [
      { src: "/shop/lessons-broadcast/shot-book.jpg", alt: "مشهد الكتاب مع المتحدّث: الكتاب مفتوح وشريط القراءة الذهبيّ" },
      { src: "/shop/lessons-broadcast/shot-page.jpg", alt: "مشهد الصفحة مع المتحدّث والاسم من اليمين" },
      { src: "/shop/lessons-broadcast/shot-speaker.jpg", alt: "مشهد المتحدّث: تغبيش ناعم وتدرّج خلف الاسم" },
    ],
    promo: {
      src: "/shop/lessons-broadcast/promo.mp4",
      poster: "/shop/lessons-broadcast/promo-poster.jpg",
      title: "طلبتوه… فسوّيته.",
      text: "مقطع بثّ الدروس جاب أكثر من ١٠٠ تعليق بنفس الطلب — فبدل ما أعقّدكم في الربط والتقنية، سوّيت لكم برنامجاً جاهزاً: تختار الكتاب، تكتب اسم الشيخ، وتضغط «بثّ مباشر». من الكمبيوتر أو الجوّال.",
    },
    fallbackPrice: 399,
    // عرض الإطلاق: الأسعار الفعليّة في shop_products (١٤٩/٩٩/٧٩/٤٩)، وترجع ٣٩٩/١٩٩/١٢٩/٦٩ بمهمّة pg_cron
    // «lb-launch-offer-end» فجر ٢ ديسمبر ٢٠٢٦ بتوقيت الرياض. العرض هنا يختفي وحده بعد until.
    sale: { label: "عرض الإطلاق", until: "2026-12-01T21:00:00Z", was: { 149: 399, 99: 199, 79: 129, 49: 69 } },
    format: "ويندوز · ماك · أندرويد — تنزيل فوريّ بعد الدفع",
    platforms: [
      { key: "windows", name: "ويندوز", note: "ويندوز ١٠ و١١" },
      { key: "mac", name: "ماك", note: "macOS 12 فما فوق" },
      { key: "android", name: "أندرويد", note: "ملفّ APK للجوّال والتابلت — وقريباً على Google Play" },
      { key: "ios", name: "آيفون وآيباد", note: "iPhone و iPad", soon: "قريباً على App Store" },
    ],
    inside: [
      { title: "المكتبة الشاملة داخل البرنامج", text: "أكثر من ٨٥٠٠ كتاب تتصفّحها بسهولة وتعرضها بصفحات الطبعة المصوّرة، أو نصّاً مرتّباً بترقيم المطبوع — وأيّ كتاب PDF من جهازك." },
      { title: "المتحدّث والكتاب في الشاشة", text: "ثمانية مشاهد جاهزة: المتحدّث، الكتاب مع المتحدّث، صفحة كاملة، كتاب مفتوح يتقلّب، القارئ، قبل البثّ، الاستراحة، والختام." },
      { title: "شريط القراءة", text: "شريط ذهبيّ يمشي مع القارئ سطراً سطراً، والتكبير على الصفحة بضغطة." },
      { title: "تصاميم عربيّة إسلاميّة", text: "ألوان ونقوش هندسيّة وإطار محراب، أو ألوان جهتك — والاسم يكتب نفسه من اليمين." },
      { title: "كل المنصّات معاً", text: "يوتيوب وفيسبوك وتيليجرام في نفس الوقت، مع تسجيل الدرس كاملاً على جهازك بجودة Full HD أو 4K." },
      { title: "صوت نقيّ تلقائيّاً", text: "تنقية الضوضاء وتسوية الصوت جاهزة بدون إعدادات، ومايك مستقلّ للقارئ." },
      { title: "شعارات الجهة والرعاة", text: "حتى ستّة شعارات تظهر وتختفي بضغطة، بألوانها الأصليّة." },
      { title: "فصول يوتيوب تلقائيّة", text: "أوقات الأبواب اللي مرّ عليها الشيخ تُكتب لك جاهزة للصقها في وصف المقطع." },
    ],
    forWho: [
      "جمعيّة أو مسجد يبي ينشر الدروس بصورة تليق بها",
      "طالب علم يصوّر دروس شيخه ويرفعها",
      "معلّم يشرح كتاباً أو متناً لطلّابه عن بعد",
      "مسؤول إعلام يبي بثّاً ثابت الجودة كلّ أسبوع",
    ],
    steps: [
      "تدفع بالبطاقة أو مدى أو Apple Pay",
      "تنزّل نسخة ويندوز أو ماك أو أندرويد من صفحة طلبك",
      "تختار الكتاب، تكتب اسم الشيخ، وتضغط «بثّ مباشر»",
    ],
    specs: [
      { title: "الكمبيوتر — Full HD", rows: [
        ["النظام", "ويندوز ١٠ أو ١١ (٦٤ بت) — أو ماك macOS 12 فما فوق"],
        ["المعالج", "Intel Core i5 الجيل الثامن، Ryzen 5، أو Apple M1 فما فوق"],
        ["الذاكرة", "٨ جيجا (١٦ أفضل)"],
        ["الإنترنت", "سرعة رفع ٦ ميغابت على الأقلّ (لكل منصّة إضافيّة نفس السرعة تقريباً)"],
        ["المساحة", "٢ جيجا للبرنامج + نحو ٣ جيجا لكل ساعة تسجيل"],
        ["الكاميرا والصوت", "أيّ كاميرا USB أو كاميرا عبر كرت التقاط، ومايك لاسلكيّ أو USB"],
      ] },
      { title: "الكمبيوتر — 4K", rows: [
        ["المعالج", "Apple M1 Pro / M2 فما فوق، أو Intel Core i7 / Ryzen 7 مع كرت NVIDIA GTX 1660 فما فوق"],
        ["الذاكرة", "١٦ جيجا"],
        ["الإنترنت", "سرعة رفع ٢٠ ميغابت"],
        ["الكاميرا", "كاميرا تدعم 4K"],
      ] },
      { title: "الجوّال — أندرويد", rows: [
        ["النظام", "أندرويد ٨ فما فوق"],
        ["الذاكرة", "٣ جيجا على الأقلّ (٤ جيجا مستحسن)"],
        ["المعالج", "Snapdragon 665 أو Helio G85 أو Exynos 9611 فما فوق (أغلب جوّالات ٢٠٢٠ وما بعد)"],
        ["الإنترنت", "سرعة رفع ٤ ميغابت (واي فاي أو 4G مستقرّ)"],
        ["نصيحة", "شغّل الجوّال على الشاحن وعلى حامل ثابت في الدروس الطويلة"],
      ] },
    ],
    faqs: [
      { q: "هل أحتاج خبرة تقنيّة؟", a: "لا. البرنامج عربيّ وأزراره كبيرة وواضحة: تختار الكتاب، تكتب اسم الشيخ، وتضغط «بثّ مباشر». وإذا احتجت أحد يضبطه معك راسلني." },
      { q: "على أيّ جهاز يشتغل؟", a: "ويندوز وماك وأندرويد الآن (ملفّ APK تنزّله من صفحة طلبك، وقريباً على Google Play)، ونسخة آيفون وآيباد قريباً على App Store وتوصلك على نفس طلبك بدون شراء جديد. شوف «المتطلّبات» تحت." },
      { q: "كيف أثبّت نسخة الأندرويد؟", a: "نزّل ملفّ APK من صفحة طلبك على الجوّال وافتحه. أوّل مرّة يطلب الجوّال السماح بالتثبيت من المتصفّح: اضغط «الإعدادات» ثمّ فعّل «السماح من هذا المصدر» وارجع اضغط «تثبيت»." },
      { q: "كيف أبثّ درساً علميّاً مباشراً من المسجد؟", a: "تحتاج كمبيوتر أو جوّال، وكاميرا (أو كاميرا الجوّال)، ومايك لاسلكيّ للشيخ، وإنترنت ثابت. في البرنامج تختار الكتاب، تكتب اسم الشيخ وعنوان الدرس، تلصق مفتاح البثّ من يوتيوب أو فيسبوك أو تيليجرام مرّة وحدة، وتضغط «بثّ مباشر»." },
      { q: "يصلح للمحاضرات والدورات العلميّة؟", a: "نعم: الدروس والمحاضرات والدورات العلميّة وحلقات التحفيظ والخطب — أيّ مجلس فيه متحدّث، مع كتاب أو بدونه." },
      { q: "هل يحتاج برنامج OBS؟", a: "البرنامج يستخدم محرّك OBS المجّانيّ مفتوح المصدر في الخلفيّة — ما تحتاج تفتحه ولا تفهمه أبداً. على ويندوز المحرّك داخل ملفّ التثبيت نفسه، وعلى ماك تثبّته مرّة وحدة بزرّ من داخل البرنامج." },
      { q: "تطلع رسالة تحذير أوّل ما أفتحه؟", a: "طبيعيّ في أوّل تشغيل: على ويندوز اضغط «مزيد من المعلومات» ثمّ «تشغيل على أيّ حال»، وعلى ماك اضغط على البرنامج بالزرّ الأيمن ثمّ «فتح». مرّة وحدة فقط." },
      { q: "هل الطريقة مجّانيّة؟", a: "نعم، شرحت الطريقة كاملة مجّاناً على يوتيوب مع حقيبة أوامر لكلود لمن يحبّ يسوّيها بنفسه. البرنامج للي يبي الاختصار: كل شي جاهز من أوّل يوم." },
      { q: "على كم جهاز أقدر أستخدمه؟", a: "رابط طلبك يفتح على أجهزتك (حتى ٣ أجهزة)، وتنزّل النسخ اللي تحتاجها منه. للجمعيّات بأكثر من مقرّ راسلني." },
      { q: "ضيّعت رابط التحميل؟", a: "ولا يهمّك: افتح «استرجع طلبك» واكتب إيميلك، ويوصلك رابط طلبك من جديد. الطلب لك دائماً وتنزّل منه البرنامج وتحديثاته متى ما بغيت." },
      { q: "إذا نزل تحديث؟", a: "التحديثات مجّانيّة لنسختك، وتنزّلها من نفس صفحة طلبك." },
    ],
    seo: {
      title: "بثّ الدروس العلميّة وتصويرها — بدون فريق.",
      paras: [
        "أغلب الدروس العلميّة في المساجد تُصوَّر بجوّال على حامل: صورة بعيدة، وصوت فيه صدى، والكتاب اللي يشرحه الشيخ ما يظهر للمشاهد. والحلّ المعتاد فريق تصوير ومونتير وبرامج بثّ معقّدة — وهذا ما يتوفّر لكلّ مسجد أو جمعيّة.",
        "«برنامج بث الدروس العلمية» يختصر هذا كلّه: كاميرا ومايك وجهاز واحد. البرنامج يرتّب الشاشة لحاله — الشيخ في جهة، وصفحات الكتاب من المكتبة الشاملة في الجهة الثانية، واسم المتحدّث وعنوان الدرس وشعار الجهة — ويبثّ مباشرة على يوتيوب أو فيسبوك أو تيليجرام، ويسجّل الدرس كاملاً على الجهاز.",
        "يناسب البثوث العلميّة الأسبوعيّة في الجوامع، وتصوير الدروس العلميّة والمحاضرات والدورات لرفعها لاحقاً، ودروس المعلّمين وطلّاب العلم عن بعد. عربيّ بالكامل، وأزراره كبيرة وواضحة لأيّ أحد — حتى لو أوّل مرّة يبثّ.",
      ],
    },
  },
  // نسخة روسيا: صفحة /ru/lessons-broadcast/ وبرنامج روسيّ مستقلّ (فيه العربيّة أيضاً) — يُحوَّل لها زائر روسيا تلقائيّاً.
  // السعر في shop_products (sku lessons-broadcast-ru)، وملفّاتها نسخ «-ru» منفصلة عن النسخة العربيّة.
  {
    hidden: true,
    lang: "ru",
    sku: "lessons-broadcast-ru",
    slug: "lessons-broadcast-ru",
    name: "Трансляция исламских уроков",
    kicker: "Для мечетей, исламских организаций, преподавателей и студентов",
    tagline: "Ваш урок в прямом эфире. Профессионально. Одной кнопкой.",
    publicPath: "/ru/lessons-broadcast/",
    sub: "Простая программа, которая транслирует и записывает урок: лектор и книга на экране, библиотека «Шамиля» внутри и логотипы вашей организации — на YouTube, Facebook и Telegram одновременно. Интерфейс на русском и арабском.",
    icon: "📡",
    iconImg: "/shop/lessons-broadcast/icon.png",
    shots: [
      { src: "/shop/lessons-broadcast/shot-book.jpg", alt: "Сцена «книга и лектор»: раскрытая книга и золотая строка чтения" },
      { src: "/shop/lessons-broadcast/shot-page.jpg", alt: "Сцена «страница и лектор» с именем лектора" },
      { src: "/shop/lessons-broadcast/shot-speaker.jpg", alt: "Сцена «лектор»: мягкое размытие и градиент за именем" },
    ],
    fallbackPrice: 375,
    format: "Windows · Mac · Android — скачивание сразу после оплаты",
    platforms: [
      { key: "windows", name: "Windows", note: "Windows 10 и 11" },
      { key: "mac", name: "Mac", note: "macOS 12 и новее" },
      { key: "android", name: "Android", note: "APK-файл для телефона и планшета" },
    ],
    inside: [
      { title: "Библиотека «Шамиля» внутри", text: "Более 8500 книг на арабском: удобный просмотр, страницы печатного издания или аккуратный текст с нумерацией издания — а также любая PDF-книга с вашего компьютера, в том числе на русском." },
      { title: "Лектор и книга на экране", text: "Восемь готовых сцен: лектор, книга с лектором, страница целиком, раскрытая книга с перелистыванием, чтец, перед эфиром, перерыв и завершение." },
      { title: "Строка чтения", text: "Золотая полоса движется за чтецом строка за строкой, увеличение страницы — одним нажатием." },
      { title: "Исламский дизайн", text: "Цвета и геометрические орнаменты, рамка-михраб или цвета вашей организации; имя лектора появляется с анимацией." },
      { title: "Все платформы сразу", text: "YouTube, Facebook и Telegram одновременно, плюс полная запись урока на компьютер в Full HD или 4K." },
      { title: "Чистый звук автоматически", text: "Шумоподавление и выравнивание громкости без настроек, отдельный микрофон для чтеца." },
      { title: "Логотипы организации и спонсоров", text: "До шести логотипов в оригинальных цветах — появляются и скрываются одним нажатием." },
      { title: "Главы YouTube автоматически", text: "Тайм-коды разделов, которые прошёл лектор, готовы для вставки в описание видео." },
    ],
    forWho: [
      "Мечеть или исламская организация, которая хочет достойно публиковать уроки",
      "Студент, который снимает уроки своего шейха и выкладывает их",
      "Преподаватель, который объясняет книгу или матн ученикам дистанционно",
      "Медиа-ответственный, которому нужен стабильный эфир каждую неделю",
    ],
    steps: [
      "Оплачиваете картой или Apple Pay",
      "Скачиваете версию для Windows, Mac или Android со страницы заказа",
      "Выбираете книгу, пишете имя шейха и нажимаете «Прямой эфир»",
    ],
    specs: [
      { title: "Компьютер — Full HD", rows: [
        ["Система", "Windows 10 или 11 (64-бит) — или macOS 12 и новее"],
        ["Процессор", "Intel Core i5 8-го поколения, Ryzen 5 или Apple M1 и выше"],
        ["Память", "8 ГБ (лучше 16)"],
        ["Интернет", "Скорость отдачи от 6 Мбит/с (примерно столько же на каждую дополнительную платформу)"],
        ["Место на диске", "2 ГБ для программы + около 3 ГБ на каждый час записи"],
        ["Камера и звук", "Любая USB-камера или камера через карту захвата, беспроводной или USB-микрофон"],
      ] },
      { title: "Компьютер — 4K", rows: [
        ["Процессор", "Apple M1 Pro / M2 и выше, или Intel Core i7 / Ryzen 7 с видеокартой NVIDIA GTX 1660 и выше"],
        ["Память", "16 ГБ"],
        ["Интернет", "Скорость отдачи 20 Мбит/с"],
        ["Камера", "Камера с поддержкой 4K"],
      ] },
      { title: "Телефон — Android", rows: [
        ["Система", "Android 8 и новее"],
        ["Память", "Не менее 3 ГБ (рекомендуется 4 ГБ)"],
        ["Процессор", "Snapdragon 665, Helio G85 или Exynos 9611 и выше (большинство телефонов 2020 года и новее)"],
        ["Интернет", "Скорость отдачи 4 Мбит/с (Wi-Fi или стабильный 4G)"],
        ["Совет", "В длинных уроках держите телефон на зарядке и на устойчивом штативе"],
      ] },
    ],
    faqs: [
      { q: "Нужен ли технический опыт?", a: "Нет. Кнопки крупные и понятные: выбираете книгу, пишете имя шейха и нажимаете «Прямой эфир». Интерфейс на русском, с переключением на арабский." },
      { q: "Книги на русском есть?", a: "Библиотека «Шамиля» — это книги на арабском. Любую книгу в PDF, в том числе на русском, можно открыть со своего компьютера и показать в эфире." },
      { q: "На каких устройствах работает?", a: "Windows, Mac и Android (APK-файл со страницы заказа). Смотрите «Системные требования» выше." },
      { q: "Как установить версию для Android?", a: "Скачайте APK со страницы заказа на телефоне и откройте его. В первый раз телефон попросит разрешить установку из браузера: нажмите «Настройки», включите «Разрешить из этого источника» и вернитесь к «Установить»." },
      { q: "Как провести прямую трансляцию урока из мечети?", a: "Нужны компьютер или телефон, камера, беспроводной микрофон для шейха и стабильный интернет. В программе выберите книгу, впишите имя шейха и тему урока, один раз вставьте ключ трансляции YouTube, Facebook или Telegram и нажмите «Прямой эфир»." },
      { q: "Нужна ли программа OBS?", a: "Программа использует бесплатный движок OBS с открытым исходным кодом в фоне — открывать его не нужно. В Windows движок уже внутри установщика, на Mac он устанавливается один раз кнопкой из программы." },
      { q: "При первом запуске появляется предупреждение?", a: "Это нормально: в Windows нажмите «Подробнее» → «Выполнить в любом случае», на Mac — правый клик по программе → «Открыть». Только один раз." },
      { q: "На скольких устройствах можно использовать?", a: "Ссылка на заказ открывается на ваших устройствах (до 3). Для организаций с несколькими филиалами — напишите мне." },
      { q: "Потеряли ссылку на скачивание?", a: "Откройте ibrahimsaud.com/shop/thanks/, введите email — и ссылка на заказ придёт снова. Заказ ваш навсегда: программа и обновления скачиваются оттуда в любое время." },
      { q: "А обновления?", a: "Обновления для вашей версии бесплатны и скачиваются с той же страницы заказа." },
    ],
  },
  // النسخة الإنجليزيّة: صفحة /en/lessons-broadcast/ وبرنامج إنجليزيّ مستقلّ (فيه العربيّة أيضاً) — لزائر خارج الدول العربيّة
  // متصفّحه بلا عربيّة. السعر في shop_products (lessons-broadcast-en + فئات الدول @t2/@t3/@t4 بأسعار العربيّة نفسها).
  {
    hidden: true,
    lang: "en",
    sku: "lessons-broadcast-en",
    slug: "lessons-broadcast-en",
    name: "Islamic Lessons Broadcast",
    kicker: "For mosques, Islamic centers, teachers and students of knowledge",
    tagline: "Your lesson, live. Professional. One button.",
    publicPath: "/en/lessons-broadcast/",
    sub: "Simple software that streams and records the lesson: the teacher and the book on screen, the Shamela library built in, and your organization's logos — on YouTube, Facebook and Telegram at once. Interface in English and Arabic.",
    icon: "📡",
    iconImg: "/shop/lessons-broadcast/icon.png",
    shots: [
      { src: "/shop/lessons-broadcast/shot-book.jpg", alt: "\"Book and teacher\" scene: an open book with a golden reading line" },
      { src: "/shop/lessons-broadcast/shot-page.jpg", alt: "\"Page and teacher\" scene with the teacher's name" },
      { src: "/shop/lessons-broadcast/shot-speaker.jpg", alt: "\"Teacher\" scene: soft blur and a gradient behind the name" },
    ],
    fallbackPrice: 149,
    sale: { label: "Launch offer", until: "2026-12-01T21:00:00Z", was: { 149: 399, 99: 199, 79: 129, 49: 69 } },
    format: "Windows · Mac · Android — download right after payment",
    platforms: [
      { key: "windows", name: "Windows", note: "Windows 10 and 11" },
      { key: "mac", name: "Mac", note: "macOS 12 and later" },
      { key: "android", name: "Android", note: "APK file for phones and tablets" },
    ],
    inside: [
      { title: "The Shamela library built in", text: "More than 8,500 Arabic books: a clean reader, the printed edition's pages or neat text with the edition's page numbers — plus any PDF book from your computer, in any language." },
      { title: "The teacher and the book on screen", text: "Eight ready scenes: teacher, book with teacher, full page, an open book that turns its pages, reciter, before the lesson, break, and closing." },
      { title: "Reading line", text: "A golden bar follows the reader line by line, and zooms into the page with one tap." },
      { title: "Islamic design", text: "Islamic colors and geometric patterns, a mihrab frame or your organization's colors; the teacher's name appears with a smooth animation." },
      { title: "Every platform at once", text: "YouTube, Facebook and Telegram together, plus a full recording of the lesson on your computer in Full HD or 4K." },
      { title: "Clean sound automatically", text: "Noise removal and level balancing with no settings, and a separate microphone for the reciter." },
      { title: "Organization and sponsor logos", text: "Up to six logos in their original colors — shown and hidden with one tap." },
      { title: "YouTube chapters automatically", text: "Timestamps for the sections the teacher covered, ready to paste into the video description." },
    ],
    forWho: [
      "A mosque or Islamic center that wants to publish its lessons properly",
      "A student who films his shaykh's lessons and shares them",
      "A teacher explaining a book or a matn to students remotely",
      "A media volunteer who needs a reliable stream every week",
    ],
    steps: [
      "Pay by card or Apple Pay",
      "Download the Windows, Mac or Android version from your order page",
      "Choose the book, type the shaykh's name and press \"Go live\"",
    ],
    specs: [
      { title: "Computer — Full HD", rows: [
        ["System", "Windows 10 or 11 (64-bit) — or macOS 12 and later"],
        ["Processor", "8th-gen Intel Core i5, Ryzen 5 or Apple M1 and above"],
        ["Memory", "8 GB (16 is better)"],
        ["Internet", "Upload speed of 6 Mbps or more (about the same again for each extra platform)"],
        ["Storage", "2 GB for the program + about 3 GB per hour of recording"],
        ["Camera & sound", "Any USB camera or a camera through a capture card, and a wireless or USB microphone"],
      ] },
      { title: "Computer — 4K", rows: [
        ["Processor", "Apple M1 Pro / M2 and above, or Intel Core i7 / Ryzen 7 with an NVIDIA GTX 1660 or better"],
        ["Memory", "16 GB"],
        ["Internet", "Upload speed of 20 Mbps"],
        ["Camera", "A 4K-capable camera"],
      ] },
      { title: "Phone — Android", rows: [
        ["System", "Android 8 and later"],
        ["Memory", "At least 3 GB (4 GB recommended)"],
        ["Processor", "Snapdragon 665, Helio G85 or Exynos 9611 and above (most phones from 2020 onward)"],
        ["Internet", "Upload speed of 4 Mbps (Wi-Fi or a stable 4G connection)"],
        ["Tip", "For long lessons keep the phone charging and on a steady tripod"],
      ] },
    ],
    faqs: [
      { q: "Do I need technical experience?", a: "No. The buttons are large and clear: choose the book, type the shaykh's name and press \"Go live\". The interface is in English, with a switch to Arabic." },
      { q: "Are there books in English?", a: "The Shamela library is Arabic books. Any PDF book, including English ones, can be opened from your computer and shown on the stream." },
      { q: "Which devices does it run on?", a: "Windows, Mac and Android (an APK file from your order page). See \"Requirements\" above." },
      { q: "How do I install the Android version?", a: "Download the APK from your order page on the phone and open it. The first time, the phone asks you to allow installs from the browser: tap \"Settings\", turn on \"Allow from this source\" and go back to \"Install\"." },
      { q: "How do I stream a lesson live from the mosque?", a: "You need a computer or phone, a camera, a wireless microphone for the shaykh and a stable internet connection. In the program choose the book, enter the shaykh's name and the lesson title, paste your YouTube, Facebook or Telegram stream key once, and press \"Go live\"." },
      { q: "Do I need OBS?", a: "The program uses the free, open-source OBS engine in the background — you never need to open it. On Windows the engine is inside the installer; on Mac it installs once with a button in the program." },
      { q: "I get a warning the first time I open it?", a: "That's normal: on Windows click \"More info\" → \"Run anyway\"; on Mac right-click the program → \"Open\". Only once." },
      { q: "On how many devices can I use it?", a: "Your order link opens on your own devices (up to 3). For organizations with several branches — message me." },
      { q: "Lost your download link?", a: "Open ibrahimsaud.com/shop/thanks/, enter your email and the order link is sent again. The order is yours for good: the program and its updates download from there any time." },
      { q: "Is it a subscription?", a: "No. One payment and it's yours — no monthly or yearly fees. Updates for your version are free from the same order page." },
    ],
  },
  {
    hidden: true,
    sku: "ai-idea-to-launch",
    slug: "ai-idea-to-launch",
    name: "من الفكرة للنشر",
    kicker: "دورة مباشرة — دفعة التأسيس",
    tagline: "اطلع بموقعك منشوراً باسمك. بالذكاء الاصطناعي.",
    sub: "دورة عمليّة مباشرة: من فكرة في راسك إلى موقع شغّال على دومينك، بالأدوات اللي أشتغل فيها كلّ يوم.",
    icon: "🚀",
    fallbackPrice: 399,
    format: "جلسات مباشرة + تسجيلاتها",
    inside: [
      { title: "جلسات مباشرة", text: "نبني مع بعض خطوة خطوة، وأجاوب أسئلتك على شغلك أنت." },
      { title: "التسجيلات كاملة", text: "كلّ جلسة مسجّلة ترجع لها وقت ما تبي." },
      { title: "قوالب وأوامر جاهزة", text: "البرومبتات والقوالب اللي أستخدمها فعلاً." },
    ],
    forWho: ["صاحب مشروع يبي موقعه بنفسه", "مستقلّ يبي يضيف خدمة جديدة", "أيّ أحد عنده فكرة ويبي يطلقها"],
    steps: ["تحجز مقعدك", "يوصلك موعد الدفعة ورابط الجلسات", "تطلع بموقعك منشوراً"],
    faqs: [{ q: "متى تبدأ؟", a: "يُعلن الموعد لمّا تكتمل مقاعد دفعة التأسيس." }],
    presale: true,
  },
];

export const itemBySlug = (slug: string) => shopItems.find((i) => i.slug === slug);

export type LiveProduct = { sku: string; price_sar: number; active: boolean };

let liveCache: Promise<Record<string, LiveProduct>> | null = null;

/** السعر الحيّ والتفعيل من shop_products (قراءة علنيّة للنشط فقط). */
export function fetchLive(): Promise<Record<string, LiveProduct>> {
  if (!liveCache) {
    liveCache = fetch(`${SUPA_URL}/rest/v1/shop_products?select=sku,price_sar,active`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: LiveProduct[]) => Object.fromEntries(rows.map((r) => [r.sku, { ...r, price_sar: Number(r.price_sar) }])))
      .catch(() => ({}));
  }
  return liveCache;
}

export const sar = (n: number) => `${n.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س`;

export function fmtSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** نداء الدالّة الحافّة «shop». */
export async function shopCall<T = Record<string, unknown>>(action: string, body: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  try {
    const r = await fetch(SHOP_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await r.json().catch(() => ({ error: "ردّ غير متوقّع" }));
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "تعذّر الاتصال — تأكّد من الإنترنت وجرّب مرّة ثانية" } as T & { error?: string } };
  }
}
