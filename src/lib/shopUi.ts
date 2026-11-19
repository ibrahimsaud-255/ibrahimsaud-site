// نصوص واجهة المتجر بثلاث لغات — العربيّة هي الأصل (نفس النصوص الحيّة حرفيّاً)، والروسيّة لنسخة روسيا
// (/ru/lessons-broadcast/) والإنجليزيّة للنسخة الإنجليزيّة (/en/lessons-broadcast/). المنتج يحدّد لغته بـ`lang` في shop.ts، وصفحة الشكر تعرفها من sku الطلب.
import { INTL, type IntlCode } from "./shopIntl";
export type ShopLang = "ar" | "ru" | "en" | IntlCode;

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

const en: ShopT = {
  dir: "ltr",
  buyNow: "Buy now", reserve: "Reserve", whatsInside: "What's inside?",
  onDevices: "On your devices.", inside: "Inside.", forWho: "Who is it for?", after: "After you buy",
  specs: "Requirements.", faq: "Questions.",
  navOverview: "Overview", navInside: "Inside", navSpecs: "Requirements", navFaq: "FAQ", navBuy: "Buy",
  terms: "A digital product delivered right after payment, so it can't be refunded once the files are downloaded — unless a defect stops you from using them: message me and I'll fix it or refund you. The files are for you or your organization only and may not be resold or redistributed.",
  obs: " The program runs on the free, open-source OBS Studio engine (GPL license).",
  availableNow: "Available now — included",
  errName: "Enter your name", errEmail: "Invalid email — your files are sent to it", errStart: "Couldn't start the payment, please try again",
  oneTime: "One-time payment — it's yours. No monthly or yearly subscription.",
  approxTail: "— charged to your card in Saudi riyals (SAR)",
  saleEnds: (was: string) => `Offer ends at the end of December 1, then the price returns to ${was}`,
  soonSeats: "Seats open soon.", soonNA: "Not available for purchase yet.", soonTail: " Message us and we'll let you know as soon as it opens.",
  soonWa: () => "Assalamu alaikum! I want to buy the Islamic Lessons Broadcast program (English edition).",
  soonBtn: "Message on WhatsApp",
  name: "Name", email: "Email", emailNote: "— your files are sent here", phone: "Phone", optional: "(optional)", phonePh: "+1 555 000 0000",
  paying: "Taking you to payment…", pay: (p: string) => `Pay ${p}`,
  trust: ["Secure payment via Telr — Visa, Mastercard, Apple Pay", "Instant download after payment, and your order link arrives by email", "The link is yours and works on your devices only"],
  missingLink: "The link is incomplete — open the link from your email.",
  cantOpenTitle: "We couldn't open your order", cantOpen: "Couldn't open the order", contact: "Message me",
  waProblem: "Assalamu alaikum! I can't open my order (English edition).",
  opening: "Opening your order…",
  notConfirmedTitle: "Payment not confirmed yet", notConfirmedText: "If your card was charged, your order activates automatically within minutes and the link arrives by email. You can refresh this page later.", refresh: "Refresh status",
  checking: "Confirming payment…", checkingText: "A few seconds and your files will appear. Don't close the page.",
  cancelled: "Payment cancelled", failed: "Payment didn't go through", notCharged: "Nothing was charged. You can go back and try again.", tryAgain: "Try again",
  holdTitle: (n: string) => `Thank you ${n}, we received your payment`,
  holdText: (ref: string) => `Your order (${ref}) is under a quick review before the files open — message me on WhatsApp and I'll open it within minutes.`,
  holdWa: (ref: string) => `Assalamu alaikum! I paid my order (${ref}) — English edition. Please open it.`, holdCta: "Message on WhatsApp",
  thanks: (n: string) => `Thank you ${n}.`, ready: (t: string) => `Your order is ready — ${t}.`,
  orderDetails: "Order details", orderNo: "Order number", date: "Date", amount: "Amount", mailLbl: "Email",
  soonFor: "Coming soon for your order", soonNote: "— we'll email you when it's out",
  note: "Keep the email you received — it's your key back to your files. The link works on your devices only (up to 3), and a new device needs a code sent to your email. ",
  productPage: "Product page", chev: "›",
  demoMsg: "This is a preview — in a real order the download starts here.", dlFail: "Download failed",
  preparing: "Your files are being prepared — they'll reach your email soon.", yourFiles: "Your files",
  left: (l: number, m: number) => `${l} of ${m} downloads left`,
  dlBusy: "Preparing…", dlOut: "Used up", dl: "Download",
  recoverCompact: "Or recover your order link", recoverTitle: "Recover your order",
  recoverText: "Enter the email you bought with and we'll resend your order link — download the program and its updates any time.",
  recoverDone: "If there's an order with this email, the link has been sent. Check your inbox (and spam folder).",
  sending: "Sending…", sendLink: "Send the link", doneDefault: "Done",
  newDevice: "New device", maxDevices: "Your order is open on 3 devices (the maximum). ", maxDevicesLink: "Message me and I'll open it",
  waDevice: "Assalamu alaikum! I need to open my order (English edition) on a new device.",
  protect: "To protect your files, we'll confirm the order is yours: we'll send a code to ", sendCode: "Send code",
  enterCode: "Enter the code sent to ", verifying: "Verifying…", verify: "Verify", newCode: "New code",
  sendFail: "Couldn't send", badCode: "Incorrect code", codeLbl: "Verification code", mailAria: "Email",
  dateLocale: "en-GB",
};

// لغات الحملة من JSON: القوالب «{0}» تصير دوالّ مثل نظيرتها الإنجليزيّة، وأيّ مفتاح ناقص يأخذ الإنجليزيّ.
const fill = (s: string, a: unknown[]) => s.replace(/\{(\d)\}/g, (_, i) => String(a[+i] ?? ""));
function fromJson(ui: Record<string, string>): ShopT {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(en)) {
    const s = ui[k];
    out[k] = typeof v === "function" ? (typeof s === "string" ? (...a: unknown[]) => fill(s, a) : v) : (s ?? v);
  }
  return out as ShopT;
}
const intlT: Partial<Record<IntlCode, ShopT>> = {};
export const shopT = (lang?: ShopLang): ShopT => {
  if (!lang || lang === "ar") return ar;
  if (lang === "ru") return ru;
  if (lang === "en") return en;
  return (intlT[lang] ??= fromJson(INTL[lang].ui));
};
/** كل لغات المتجر غير العربيّة (لـ?l= في رابط صفحة الطلب). */
export const isShopLang = (v: unknown): v is ShopLang =>
  typeof v === "string" && (v === "ar" || v === "ru" || v === "en" || v in INTL);

/** السعر بلغة الصفحة: «١٤٩ ر.س» للعربيّة، و«375 SAR» للروسيّة والإنجليزيّة. */
export function money(n: number, lang?: ShopLang): string {
  if (lang && lang !== "ar") return `${n.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 })} SAR`;
  return `${n.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س`;
}

/** تقريب بالدولار للنسخ غير العربيّة (الريال مربوط: ٣٫٧٥). */
export const usdApprox = (n: number) => `≈ $${Math.round(n / 3.75)}`;

/** لغة طلب من sku المنتج (نسخة روسيا تنتهي بـ -ru، والإنجليزيّة بـ -en). */
export const langOfSku = (sku?: string | null): ShopLang => {
  const m = sku && /-(ru|en)(@|$)/.exec(sku);
  return m ? (m[1] as ShopLang) : "ar";
};

/** الدول العربيّة — زائرها يبقى على الصفحة العربيّة مهما كانت لغة متصفّحه. */
export const ARAB_CC = new Set(["SA", "AE", "KW", "QA", "BH", "OM", "JO", "IQ", "PS", "LB", "SY", "YE", "EG", "SD", "LY", "TN", "DZ", "MA", "MR", "SO", "DJ", "KM"]);

/** المناطق الزمنيّة لروسيا — يُحوَّل زائرها لصفحة روسيا تلقائيّاً. */
export const RU_TZ = new Set([
  "Europe/Moscow", "Europe/Kaliningrad", "Europe/Samara", "Europe/Volgograd", "Europe/Saratov", "Europe/Ulyanovsk",
  "Europe/Astrakhan", "Europe/Kirov", "Asia/Yekaterinburg", "Asia/Omsk", "Asia/Novosibirsk", "Asia/Barnaul",
  "Asia/Tomsk", "Asia/Novokuznetsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Chita", "Asia/Yakutsk",
  "Asia/Khandyga", "Asia/Vladivostok", "Asia/Ust-Nera", "Asia/Magadan", "Asia/Sakhalin", "Asia/Srednekolymsk",
  "Asia/Kamchatka", "Asia/Anadyr",
]);
