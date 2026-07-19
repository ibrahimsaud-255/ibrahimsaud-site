"use client";

import { useState } from "react";

// نموذج اشتراك القائمة البريدية → جدول subscribers في Supabase (مفتاح نشر عام، RLS).
const SUPA_URL = "https://rrerwhhxrjyzmnnjsfev.supabase.co";
const SUPA_KEY = "sb_publishable_T-ka4hy2LVRjUuf0wUH9yA_g4Emxm13";

export default function Newsletter({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "dup" | "err">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setState("err");
      return;
    }
    setState("loading");
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email: v, source }),
      });
      if (r.status === 409) setState("dup");
      else if (r.ok) setState("ok");
      else setState("err");
    } catch {
      setState("err");
    }
  }

  const done = state === "ok" || state === "dup";

  return (
    <section
      id="newsletter"
      className="relative flex min-h-[80vh] items-end overflow-hidden border-t border-line/60 bg-ink sm:items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/identity/newsletter-v1.jpg"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-[25%_50%] sm:object-center"
      />

      {/* تظليل — يعتّم جهة النص ويترك الصورة ظاهرة */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-ink via-ink/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent sm:h-1/3 sm:via-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-40 sm:pb-16 sm:pt-16">
        <div className="sm:max-w-lg">
          <p className="text-sm font-bold tracking-widest text-gold">
            القائمة البريدية
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight [text-shadow:0_2px_30px_rgba(0,0,0,.9)] sm:text-5xl">
            تابع الجديد مني أول بأول
          </h2>
          <p className="mt-4 max-w-md text-cream/80 [text-shadow:0_1px_18px_rgba(0,0,0,.9)]">
            اشترك ليصلك جديد المدونة والمقالات والمحتوى — تقنية أعمال، بودكاست،
            وإنتاج — على بريدك مباشرة.
          </p>

          {done ? (
            <div className="mt-8 max-w-md rounded-2xl border border-gold/40 bg-gold/10 px-6 py-5 text-cream backdrop-blur-sm">
              {state === "ok"
                ? "🎉 تم اشتراكك! بيصلك كل جديد على بريدك."
                : "✅ أنت مشترك معنا بالفعل — شكراً لك."}
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "err") setState("idle");
                }}
                placeholder="بريدك الإلكتروني"
                className="flex-1 rounded-full border border-cream/25 bg-black/40 px-6 py-4 text-center text-cream backdrop-blur-sm placeholder:text-cream/40 focus:border-gold focus:outline-none sm:text-start"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="rounded-full bg-gold px-8 py-4 text-base font-bold text-ink transition hover:bg-gold-soft disabled:opacity-60"
              >
                {state === "loading" ? "…جارٍ" : "اشترك"}
              </button>
            </form>
          )}
          {state === "err" && (
            <p className="mt-3 text-sm text-red-400">
              تأكد من صحة البريد وحاول مرة ثانية.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
