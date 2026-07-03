"use client";

// يقرأ الأعمال والشعارات من Supabase (جدول عام) وقت التشغيل، ويرجع للبيانات
// الثابتة في site.ts كنسخة احتياطية إن لم يُفعَّل الجدول أو كان فارغاً.
// يُدار المحتوى من لوحة التحكم الداخلية (public/app/index.html → «الأعمال»).

import { useEffect, useState } from "react";
import { works as staticWorks, brands as staticBrands, type Work } from "./site";

const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

type Brand = { name: string; logo: string };

async function rest<T>(query: string): Promise<T[]> {
  const r = await fetch(`${SUPA_URL}/rest/v1/${query}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!r.ok) throw new Error("rest " + r.status);
  return (await r.json()) as T[];
}

type WorkRow = {
  id: string;
  client: string | null;
  title: string | null;
  category: string | null;
  audience: string | null;
  roles: string[] | null;
  description: string | null;
  video_url: string | null;
  videos: string[] | null;
  bts: string | null;
  logo: string | null;
  thumb: string | null;
  featured: boolean | null;
};

function rowToWork(r: WorkRow): Work {
  return {
    id: r.id,
    client: r.client || "",
    title: r.title || "",
    category: r.category || "",
    audience: (r.audience as Work["audience"]) || undefined,
    roles: Array.isArray(r.roles) ? r.roles : [],
    desc: r.description || "",
    videoUrl: r.video_url || undefined,
    videos: Array.isArray(r.videos) && r.videos.length ? r.videos : undefined,
    bts: r.bts || undefined,
    logo: r.logo || undefined,
    thumb: r.thumb || undefined,
    featured: !!r.featured,
  };
}

// كاش على مستوى الوحدة حتى لا نكرّر الطلب لكل مكوّن.
let worksCache: Promise<Work[] | null> | null = null;
let brandsCache: Promise<Brand[] | null> | null = null;

function fetchWorks(): Promise<Work[] | null> {
  if (!worksCache) {
    worksCache = rest<WorkRow>("site_works?select=*&order=sort.asc")
      .then((rows) => (rows && rows.length ? rows.map(rowToWork) : null))
      .catch(() => null);
  }
  return worksCache;
}

function fetchBrands(): Promise<Brand[] | null> {
  if (!brandsCache) {
    brandsCache = rest<{ name: string | null; logo: string | null }>(
      "site_brands?select=name,logo&order=sort.asc",
    )
      .then((rows) =>
        rows && rows.length
          ? rows
              .filter((b) => b.logo)
              .map((b) => ({ name: b.name || "", logo: b.logo as string }))
          : null,
      )
      .catch(() => null);
  }
  return brandsCache;
}

// خطاف: يبدأ بالبيانات الثابتة ثم يستبدلها ببيانات القاعدة إن وُجدت.
export function useWorks(): Work[] {
  const [data, setData] = useState<Work[]>(staticWorks);
  useEffect(() => {
    let alive = true;
    fetchWorks().then((r) => {
      if (alive && r) setData(r);
    });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useBrands(): Brand[] {
  const [data, setData] = useState<Brand[]>(staticBrands);
  useEffect(() => {
    let alive = true;
    fetchBrands().then((r) => {
      if (alive && r) setData(r);
    });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
