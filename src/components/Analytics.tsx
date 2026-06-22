"use client";

import { useEffect } from "react";

// منارة زيارات خفيفة → جدول pageviews في Supabase (مفتاح نشر عام، محمي بـ RLS).
// تُسجّل زيارة واحدة لكل جلسة/صفحة. تفشل بصمت لو لم يُفعَّل الجدول بعد.
const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

export default function Analytics() {
  useEffect(() => {
    try {
      const path = window.location.pathname;
      const key = "pv:" + path;
      if (sessionStorage.getItem(key)) return; // تفادي العدّ المكرر في نفس الجلسة
      sessionStorage.setItem(key, "1");
      fetch(`${SUPA_URL}/rest/v1/pageviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ path, ref: document.referrer || null }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* تجاهل بصمت */
    }
  }, []);

  return null;
}
