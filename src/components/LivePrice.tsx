"use client";

// رقم سعر حي — يقرأ من «الأسعار والباقات» في النظام الداخلي (مفتاح prices)
// ويرجع للسعر الثابت في site.ts كاحتياطي. يُستخدم داخل صفحات server عادية.

import { useContent } from "@/lib/cms";

export default function LivePrice({
  fallback,
  k = "podcastPrice",
}: {
  fallback: number;
  k?: string;
}) {
  const c = useContent("prices", { [k]: fallback } as Record<string, number>);
  return <>{Number(c[k] ?? fallback).toLocaleString("ar-EG")}</>;
}
