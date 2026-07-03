"use client";

import { useState } from "react";
import Reveal from "./Reveal";

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
    <section id="newsletter" className="border-t border-line/60 px-5 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink-card p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_50%_0%,var(--color-gold),transparent_55%)]" />
            <div className="relative">
              <p className="text-sm font-bold tracking-widest text-gold">
                القائمة البريدية
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                تابع الجديد مني أول بأول
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-cream/75">
                اشترك ليصلك جديد المدونة والمقالات والمحتوى — تقنية أعمال،
                بودكاست، وإنتاج — على بريدك مباشرة.
              </p>

              {done ? (
                <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gold/40 bg-gold/10 px-6 py-5 text-cream">
                  {state === "ok"
                    ? "🎉 تم اشتراكك! بيصلك كل جديد على بريدك."
                    : "✅ أنت مشترك معنا بالفعل — شكراً لك."}
                </div>
              ) : (
                <form
                  onSubmit={submit}
                  className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
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
                    className="flex-1 rounded-full border border-line bg-ink/60 px-6 py-4 text-center text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none sm:text-start"
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
        </Reveal>
      </div>
    </section>
  );
}
