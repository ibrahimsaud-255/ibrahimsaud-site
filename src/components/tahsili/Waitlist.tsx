"use client";

// «سجّل اهتمامك» — نفس آليّة «قريباً» في المتجر: الدالّة shop_interest_add (جدول shop_interest)
// بالمفتاح tahsili-3d، فيظهر العدد والقائمة في «المتجر الرقميّ» باللوحة بدون أيّ هجرة.
// الصفّ والمسار يُحفظان في source (مثل: tahsili-preview|ثالث ثانوي) لأنّ الجدول ما فيه حقل لهما.
import { useState } from "react";
import { SOON_KEY, SOON_RPC } from "@/lib/shop";

const GRADE_OPTS = ["ثالث ثانوي", "ثاني ثانوي", "أوّل ثانوي", "وليّ أمر", "معلّم"];

export default function Waitlist({ source = "tahsili-preview" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(GRADE_OPTS[0]);
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { setState("err"); return; }
    setState("busy");
    try {
      const r = await fetch(SOON_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SOON_KEY, Authorization: `Bearer ${SOON_KEY}` },
        body: JSON.stringify({ p_product: "tahsili-3d", p_email: em, p_name: name.trim().slice(0, 80) || null, p_source: `${source}|${grade}` }),
      });
      setState(r.ok ? "done" : "err");
    } catch {
      setState("err");
    }
  }

  if (state === "done") {
    return (
      <div className="th-wait done" aria-live="polite">
        <p className="h">سجّلناك.</p>
        <p>أوّل ما يفتح، توصلك رسالة على بريدك ومعها أسبوع مجّانيّ.</p>
      </div>
    );
  }

  return (
    <form className="th-wait" onSubmit={submit}>
      <label className="sr" htmlFor="th-email">البريد الإلكترونيّ</label>
      <input id="th-email" type="email" inputMode="email" autoComplete="email" dir="ltr" placeholder="بريدك الإلكترونيّ" value={email} onChange={(e) => { setEmail(e.target.value); if (state === "err") setState("idle"); }} required />
      <div className="row">
        <label className="sr" htmlFor="th-name">اسمك</label>
        <input id="th-name" type="text" autoComplete="given-name" placeholder="اسمك (اختياريّ)" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="sr" htmlFor="th-grade">أنت</label>
        <select id="th-grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
          {GRADE_OPTS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>
      <button className="v2-btn v2-btn-primary" disabled={state === "busy"}>{state === "busy" ? "لحظة…" : "سجّلني"}</button>
      {state === "err" && <p className="err" role="alert">تأكّد من البريد وجرّب مرّة ثانية.</p>}
      <p className="fine">ما نرسل لك إلّا خبر الإطلاق. وتقدر تطلب حذف بريدك متى ما بغيت.</p>
    </form>
  );
}
