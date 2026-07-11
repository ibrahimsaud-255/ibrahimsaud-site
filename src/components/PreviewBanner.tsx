"use client";

// شريط «وضع المعاينة» — يظهر فقط عند فتح الموقع بـ ?preview=1 (من زر المعاينة في النظام الداخلي).
// يعرض المسودة غير المنشورة، مع زر خروج يرجع للنسخة المنشورة.
// يطبّق أيضاً لون الهوية (الذهبي) لو عُدّل من محرر «الألوان» في اللوحة.

import { useEffect, useState } from "react";
import { isPreview, exitPreview, useContent } from "@/lib/cms";

const themeFallback = { gold: "", goldSoft: "" };

export default function PreviewBanner() {
  const [on, setOn] = useState(false);
  const theme = useContent("theme", themeFallback);

  useEffect(() => setOn(isPreview()), []);

  // تطبيق لون الهوية (في المعاينة يطبّق المسودة، وفي الموقع الحي المنشور)
  useEffect(() => {
    const root = document.documentElement;
    if (theme.gold) root.style.setProperty("--color-gold", theme.gold);
    if (theme.goldSoft) root.style.setProperty("--color-gold-soft", theme.goldSoft);
  }, [theme]);

  if (!on) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-[#3a2d08] px-4 py-2 text-sm font-bold text-[#f3cd83] shadow-lg">
      <span className="size-2 animate-pulse rounded-full bg-[#e7b24c]" />
      وضع المعاينة — تشاهد المسودة غير المنشورة
      <button
        onClick={exitPreview}
        className="rounded-full border border-[#e7b24c]/50 px-3 py-0.5 text-xs transition hover:bg-[#e7b24c] hover:text-black"
      >
        خروج
      </button>
    </div>
  );
}
