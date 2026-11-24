import "./app-store.css";

/** تطبيقات إبراهيم المنشورة على App Store — رابط بلا رمز دولة فيفتح متجر بلد الزائر */
export const APPS = {
  jawwali: { id: "6837889245", name: "جوّالي — الجمعيات الشبابية" },
  huroof: { id: "6765640731", name: "حروف ودروس" },
  lessons: { id: "6836200953", name: "بث الدروس العلمية" },
} as const;
export type AppKey = keyof typeof APPS;
export const appStoreUrl = (k: AppKey) => `https://apps.apple.com/app/id${APPS[k].id}`;

/** زرّ التحميل الرسميّ «Download on the App Store» (الشارة كما هي من ملفّ الهويّة) */
export default function AppStoreBadge({ app, large }: { app: AppKey; large?: boolean }) {
  return (
    <a className={"v2-appstore" + (large ? " lg" : "")} href={appStoreUrl(app)} target="_blank" rel="noopener" aria-label={`حمّل تطبيق ${APPS[app].name} من App Store`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v2/badges/app-store.webp" alt="Download on the App Store" width={674} height={210} />
    </a>
  );
}
