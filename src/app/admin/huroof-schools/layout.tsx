import type { Metadata } from "next";

/**
 * غلافٌ لأجل العنوان وحده.
 *
 * الصفحة `"use client"`، وصفحةُ عميلٍ لا تُصدّر `metadata` — فكانت ترث
 * عنوان الموقع «إبراهيم سعود — فيديوهات إعلانية تبيع»، وهو عنوانٌ تسويقيّ
 * على لوحةِ عقود. والغلاف مكوّنُ خادمٍ فيجوز له ما لا يجوز لها.
 *
 * و`robots` ليست تجميلاً: اللوحة يصلها أيّ زائرٍ يعرف الرابط — يحرسها
 * الدخول لا الخفاء — لكنّ ظهورها في نتائج البحث يدلّ عليها من لم يكن
 * يبحث عنها. فتُمنع الفهرسة والأرشفة معاً.
 */
export const metadata: Metadata = {
  title: "مدارس حروف ودروس — لوحة الإدارة",
  description: "إنشاء حزم المقاعد للمدارس ومتابعتها.",
  robots: { index: false, follow: false, nocache: true },
};

export default function HuroofSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
