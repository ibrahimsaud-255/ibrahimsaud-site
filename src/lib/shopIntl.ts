// صفحة «برنامج بث الدروس العلمية» بلغات الحملة العالميّة (غير العربيّة والروسيّة والإنجليزيّة المكتوبة في shop.ts/shopUi.ts).
// كل لغة ملفّ JSON في src/lib/shopIntl/<code>.json: { ui: نصوص واجهة المتجر, item: محتوى الصفحة } — مترجمة من en.
// القوالب في ui تستعمل {0} {1} بدل الدوالّ (تُحوَّل في shopUi.fromJson). كلها تبيع منتج lessons-broadcast-en (النسخة العالميّة).
import fr from "./shopIntl/fr.json";
import de from "./shopIntl/de.json";
import tr from "./shopIntl/tr.json";
import id from "./shopIntl/id.json";
import ur from "./shopIntl/ur.json";
import fa from "./shopIntl/fa.json";
import ps from "./shopIntl/ps.json";
import ckb from "./shopIntl/ckb.json";

export type IntlJson = {
  ui: Record<string, string>;
  item: {
    name: string; kicker: string; tagline: string; sub: string; format: string; saleLabel?: string;
    platforms: { key: "windows" | "mac" | "android" | "ios"; name: string; note: string }[];
    inside: { title: string; text: string }[]; forWho: string[]; steps: string[];
    specs: { title: string; rows: [string, string][] }[]; faqs: { q: string; a: string }[];
    promo: { title: string; text: string }; meta: { title: string; description: string };
  };
};

export const INTL = { fr, de, tr, id, ur, fa, ps, ckb } as unknown as Record<IntlCode, IntlJson>;
export type IntlCode = "fr" | "de" | "tr" | "id" | "ur" | "fa" | "ps" | "ckb";
export const INTL_CODES: IntlCode[] = ["fr", "de", "tr", "id", "ur", "fa", "ps", "ckb"];

/** أسماء اللغات بلغاتها — لمبدّل اللغة أسفل الصفحة. */
export const LANG_NAMES: Record<string, string> = {
  ar: "العربيّة", en: "English", ru: "Русский", fr: "Français", de: "Deutsch", tr: "Türkçe",
  id: "Bahasa Indonesia", ur: "اردو", fa: "دری", ps: "پښتو", ckb: "کوردی",
};
/** مسار صفحة كل لغة. */
export const langPath = (l: string) => (l === "ar" ? "/lessons-broadcast/?lang=ar" : `/${l}/lessons-broadcast/`);

/** روابط hreflang لكل لغات الصفحة. */
export const allLanguages = (site = "https://ibrahimsaud.com"): Record<string, string> => ({
  ar: `${site}/lessons-broadcast/`, en: `${site}/en/lessons-broadcast/`, ru: `${site}/ru/lessons-broadcast/`,
  ...Object.fromEntries(INTL_CODES.map((c) => [c, `${site}/${c}/lessons-broadcast/`])),
});
