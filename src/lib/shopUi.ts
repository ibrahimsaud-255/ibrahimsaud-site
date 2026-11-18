// نصوص واجهة المتجر بلغتين — العربيّة هي الأصل (نفس النصوص الحيّة حرفيّاً)، والروسيّة لنسخة روسيا
// (/ru/lessons-broadcast/). المنتج يحدّد لغته بـ`lang` في shop.ts، وصفحة الشكر تعرفها من sku الطلب.
export type ShopLang = "ar" | "ru";

const ar = {
  dir: "rtl" as "rtl" | "ltr",
  buyNow: "اشترِ الآن", reserve: "احجز مقعدك", whatsInside: "وش بالداخل؟",
  onDevices: "على أجهزتك.", inside: "بالداخل.", forWho: "لمين؟", after: "بعد الشراء",
  specs: "المتطلّبات.", faq: "أسئلة.",
  navOverview: "نظرة عامة", navInside: "بالداخل", navSpecs: "المتطلّبات", navFaq: "أسئلة", navBuy: "اطلب",
  terms: "منتج رقميّ يُسلَّم فور الدفع؛ لذلك لا يُسترجع المبلغ بعد تنزيل الملفّات، إلا إذا كان فيها عيب منعك من استخدامها — راسلني وأحلّها أو أعيد لك المبلغ.\n              الملفّات لاستخدامك أنت أو جهتك، ولا يجوز إعادة بيعها أو نشرها.",
  obs: " يعمل البرنامج بمحرّك OBS Studio المجّانيّ مفتوح المصدر (رخصة GPL).",
  availableNow: "متوفّر الآن — مع الشراء",
  // لوحة الشراء
  errName: "اكتب اسمك", errEmail: "البريد غير صحيح — عليه توصلك الملفّات", errStart: "تعذّر بدء الدفع، جرّب مرّة ثانية",
  oneTime: "دفعة واحدة وتملكه — بلا اشتراك شهريّ ولا سنويّ.",
  approxTail: "تقريباً — يُخصم بالريال من بطاقتك",
  saleEnds: (was: string) => `العرض ينتهي نهاية يوم ١ ديسمبر، وبعده يرجع السعر ${was}`,
  soonSeats: "المقاعد تُفتح قريباً.", soonNA: "غير متاح للشراء الآن.", soonTail: " سجّل اهتمامك وأبلغك أوّل ما يفتح.",
  soonWa: (name: string) => `السلام عليكم، أبي أحجز في «${name}» أوّل ما يفتح`, soonBtn: "بلّغني على واتساب",
  name: "الاسم", email: "البريد الإلكترونيّ", emailNote: "— توصلك عليه الملفّات", phone: "الجوال", optional: "(اختياريّ)", phonePh: "05xxxxxxxx",
  paying: "ننقلك للدفع…", pay: (p: string) => `ادفع ${p}`,
  trust: ["دفع آمن عبر Telr — مدى، فيزا، ماستركارد، Apple Pay", "تنزيل فوريّ بعد الدفع، ورابط طلبك يوصلك على بريدك", "الرابط خاصّ بك ويعمل على أجهزتك فقط"],
  // صفحة الطلب
  missingLink: "الرابط ناقص — افتح الرابط اللي وصلك على بريدك.",
  cantOpenTitle: "ما قدرنا نفتح الطلب", cantOpen: "تعذّر فتح الطلب", contact: "راسلني", waProblem: "السلام عليكم، عندي مشكلة في فتح طلبي من المتجر",
  opening: "نفتح طلبك…",
  notConfirmedTitle: "الدفع ما تأكّد للحين", notConfirmedText: "إذا خُصم المبلغ من بطاقتك فطلبك بيتفعّل تلقائيّاً خلال دقائق ويوصلك الرابط على بريدك. تقدر تحدّث الصفحة لاحقاً.", refresh: "حدّث الحالة",
  checking: "نتأكّد من الدفع…", checkingText: "ثوانٍ وتظهر ملفّاتك. لا تقفل الصفحة.",
  cancelled: "أُلغي الدفع", failed: "ما تمّ الدفع", notCharged: "ما خُصم شي. تقدر ترجع وتحاول مرّة ثانية.", tryAgain: "جرّب مرّة ثانية",
  holdTitle: (n: string) => `شكراً ${n}، وصلنا دفعك`,
  holdText: (ref: string) => `طلبك (${ref}) قيد مراجعة سريعة قبل فتح الملفّات — راسلني على واتساب وأفتحه لك خلال دقائق.`,
  holdWa: (ref: string) => `السلام عليكم، دفعت طلبي من المتجر (${ref}) وأبي أفتحه`, holdCta: "راسلني على واتساب",
  thanks: (n: string) => `شكراً ${n}.`, ready: (t: string) => `طلبك جاهز — ${t}.`,
  orderDetails: "تفاصيل الطلب", orderNo: "رقم الطلب", date: "التاريخ", amount: "المبلغ", mailLbl: "البريد",
  soonFor: "قريباً لنفس طلبك", soonNote: "— نبلغك على بريدك لمّا تنزل",
  note: "احفظ الإيميل اللي وصلك — هو مفتاحك للرجوع لملفّاتك. الرابط يعمل على أجهزتك فقط (حتى ٣ أجهزة)،\n        وأيّ جهاز جديد يحتاج رمزاً يوصل بريدك. ",
  productPage: "صفحة المنتج", chev: "‹",
  demoMsg: "هذه معاينة — في الطلب الحقيقيّ يبدأ التنزيل هنا مباشرة.", dlFail: "تعذّر التنزيل",
  preparing: "الملفّات تُجهَّز — بتوصلك على بريدك قريباً.", yourFiles: "ملفّاتك",
  left: (l: number, m: number) => `باقي ${l.toLocaleString("ar-SA")} من ${m.toLocaleString("ar-SA")} تنزيلات`,
  dlBusy: "يجهّز…", dlOut: "استُنفد", dl: "نزّل",
  recoverCompact: "أو استرجع رابط طلبك", recoverTitle: "استرجع طلبك",
  recoverText: "اكتب الإيميل اللي اشتريت به، ونرسل لك رابط طلبك من جديد — تنزّل منه البرنامج وتحديثاته متى ما بغيت.",
  recoverDone: "", sending: "نرسل…", sendLink: "أرسل الرابط", doneDefault: "تمّ",
  newDevice: "جهاز جديد", maxDevices: "طلبك مفتوح على ٣ أجهزة (الحدّ الأقصى). ", maxDevicesLink: "راسلني وأفتحه لك",
  waDevice: "السلام عليكم، أبي أفتح طلبي من المتجر على جهاز جديد",
  protect: "حمايةً لملفّاتك، نتأكّد إنّك صاحب الطلب: نرسل رمزاً لبريدك ", sendCode: "أرسل الرمز",
  enterCode: "اكتب الرمز اللي وصلك على ", verifying: "نتحقّق…", verify: "تحقّق", newCode: "رمز جديد",
  sendFail: "تعذّر الإرسال", badCode: "الرمز غير صحيح", codeLbl: "رمز التحقّق", mailAria: "البريد",
  dateLocale: "ar-SA-u-ca-gregory",
};
export type ShopT = typeof ar;

const ru: ShopT = {
  dir: "ltr",
  buyNow: "Купить", reserve: "Записаться", whatsInside: "Что внутри?",
  onDevices: "На ваших устройствах.", inside: "Возможности.", forWho: "Для кого?", after: "После покупки",
  specs: "Системные требования.", faq: "Вопросы.",
  navOverview: "Обзор", navInside: "Возможности", navSpecs: "Требования", navFaq: "Вопросы", navBuy: "Купить",
  terms: "Цифровой товар выдаётся сразу после оплаты, поэтому после скачивания файлов деньги не возвращаются — кроме случаев, когда из-за дефекта файлами невозможно пользоваться: напишите мне, и я решу проблему или верну деньги. Файлы предназначены для вас или вашей организации; перепродавать и распространять их нельзя.",
  obs: " Программа работает на бесплатном движке с открытым исходным кодом OBS Studio (лицензия GPL).",
  availableNow: "Доступно сразу после покупки",
  errName: "Введите имя", errEmail: "Неверный email — на него придут файлы", errStart: "Не удалось начать оплату, попробуйте ещё раз",
  oneTime: "Разовая оплата — программа ваша навсегда, без ежемесячной или годовой подписки.",
  approxTail: "— списывается с карты в саудовских риялах (SAR)",
  saleEnds: (was: string) => `Акция до конца 1 декабря, затем цена ${was}`,
  soonSeats: "Скоро откроется.", soonNA: "Продажи откроются в ближайшее время.", soonTail: " Напишите нам — сообщим, как только откроются.",
  soonWa: () => "Assalamu alaikum! I want to buy the lessons broadcast program (Russian edition). / Хочу купить программу (русская версия).",
  soonBtn: "Написать в WhatsApp",
  name: "Имя", email: "Email", emailNote: "— на него придут файлы", phone: "Телефон", optional: "(необязательно)", phonePh: "+7 9xx xxx-xx-xx",
  paying: "Переходим к оплате…", pay: (p: string) => `Оплатить ${p}`,
  trust: ["Безопасная оплата через Telr — Visa, Mastercard, Apple Pay", "Скачивание сразу после оплаты, ссылка на заказ придёт на email", "Ссылка личная и работает только на ваших устройствах"],
  missingLink: "Ссылка неполная — откройте ссылку из письма.",
  cantOpenTitle: "Не удалось открыть заказ", cantOpen: "Не удалось открыть заказ", contact: "Написать мне",
  waProblem: "Assalamu alaikum! I can't open my order (Russian edition).",
  opening: "Открываем заказ…",
  notConfirmedTitle: "Оплата пока не подтверждена", notConfirmedText: "Если деньги списаны с карты, заказ активируется автоматически в течение нескольких минут, и ссылка придёт на email. Можно обновить страницу позже.", refresh: "Обновить статус",
  checking: "Проверяем оплату…", checkingText: "Ещё несколько секунд — и появятся ваши файлы. Не закрывайте страницу.",
  cancelled: "Оплата отменена", failed: "Оплата не прошла", notCharged: "Деньги не списаны. Можно вернуться и попробовать ещё раз.", tryAgain: "Попробовать снова",
  holdTitle: (n: string) => `Спасибо, ${n}, оплата получена`,
  holdText: (ref: string) => `Заказ (${ref}) проходит быструю проверку перед открытием файлов — напишите мне в WhatsApp, и я открою его в течение нескольких минут.`,
  holdWa: (ref: string) => `Assalamu alaikum! I paid my order (${ref}) — Russian edition. Please open it.`, holdCta: "Написать в WhatsApp",
  thanks: (n: string) => `Спасибо, ${n}.`, ready: (t: string) => `Ваш заказ готов — ${t}.`,
  orderDetails: "Детали заказа", orderNo: "Номер заказа", date: "Дата", amount: "Сумма", mailLbl: "Email",
  soonFor: "Скоро для вашего заказа", soonNote: "— сообщим на email, когда выйдет",
  note: "Сохраните это письмо — это ваш ключ к файлам. Ссылка работает только на ваших устройствах (до 3), а для нового устройства нужен код, который придёт на email. ",
  productPage: "Страница программы", chev: "›",
  demoMsg: "Это предпросмотр — в настоящем заказе скачивание начнётся здесь.", dlFail: "Не удалось скачать",
  preparing: "Файлы готовятся — скоро придут на email.", yourFiles: "Ваши файлы",
  left: (l: number, m: number) => `Осталось ${l} из ${m} скачиваний`,
  dlBusy: "Готовим…", dlOut: "Исчерпано", dl: "Скачать",
  recoverCompact: "Или восстановите ссылку на заказ", recoverTitle: "Восстановить заказ",
  recoverText: "Введите email, с которого покупали, — мы заново отправим ссылку на заказ. Оттуда можно скачать программу и обновления в любое время.",
  recoverDone: "Если есть заказ с этим email, ссылка уже отправлена. Проверьте почту (и папку «Спам»).",
  sending: "Отправляем…", sendLink: "Отправить ссылку", doneDefault: "Готово",
  newDevice: "Новое устройство", maxDevices: "Заказ уже открыт на 3 устройствах (максимум). ", maxDevicesLink: "Напишите мне, и я открою его",
  waDevice: "Assalamu alaikum! I need to open my order (Russian edition) on a new device.",
  protect: "Для защиты файлов убедимся, что заказ ваш: отправим код на ", sendCode: "Отправить код",
  enterCode: "Введите код, отправленный на ", verifying: "Проверяем…", verify: "Подтвердить", newCode: "Новый код",
  sendFail: "Не удалось отправить", badCode: "Неверный код", codeLbl: "Код подтверждения", mailAria: "Email",
  dateLocale: "ru-RU",
};

export const shopT = (lang?: ShopLang): ShopT => (lang === "ru" ? ru : ar);

/** السعر بلغة الصفحة: «١٤٩ ر.س» للعربيّة، و«375 SAR» للروسيّة. */
export function money(n: number, lang?: ShopLang): string {
  if (lang === "ru") return `${n.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} SAR`;
  return `${n.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س`;
}

/** لغة طلب من sku المنتج (نسخة روسيا تنتهي بـ -ru). */
export const langOfSku = (sku?: string | null): ShopLang => (sku && /-ru(@|$)/.test(sku) ? "ru" : "ar");

/** المناطق الزمنيّة لروسيا — يُحوَّل زائرها لصفحة روسيا تلقائيّاً. */
export const RU_TZ = new Set([
  "Europe/Moscow", "Europe/Kaliningrad", "Europe/Samara", "Europe/Volgograd", "Europe/Saratov", "Europe/Ulyanovsk",
  "Europe/Astrakhan", "Europe/Kirov", "Asia/Yekaterinburg", "Asia/Omsk", "Asia/Novosibirsk", "Asia/Barnaul",
  "Asia/Tomsk", "Asia/Novokuznetsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Chita", "Asia/Yakutsk",
  "Asia/Khandyga", "Asia/Vladivostok", "Asia/Ust-Nera", "Asia/Magadan", "Asia/Sakhalin", "Asia/Srednekolymsk",
  "Asia/Kamchatka", "Asia/Anadyr",
]);
