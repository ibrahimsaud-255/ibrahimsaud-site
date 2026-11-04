// بطاقة الرابط لمّا ينرسل في واتساب وإكس ولينكدإن: عنوان الصفحة ووصفها وصورة الموقع الجديدة.
import type { Metadata } from "next";

export const SITE_URL = "https://ibrahimsaud.com";
export const OG_IMAGE = { url: `${SITE_URL}/og/home.jpg`, width: 1200, height: 630, alt: "إبراهيم سعود — بين التقنية والأعمال" };

export function share(m: { title?: unknown; description?: unknown }, path = "/"): Pick<Metadata, "openGraph" | "twitter"> {
  const title = String(m.title ?? "إبراهيم سعود — بين التقنية والأعمال");
  const description = m.description ? String(m.description) : undefined;
  return {
    openGraph: { title, description, url: `${SITE_URL}${path}`, siteName: "إبراهيم سعود", locale: "ar_SA", type: "website", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
