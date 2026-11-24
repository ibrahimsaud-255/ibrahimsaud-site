"use client";

// بطاقات «قريباً» في المتجر: لا سعر ولا موعد — زرّ «بلّغني» يفتح حقل الإيميل (والاسم اختياريّ)
// ← الدالّة shop_interest_add (SECURITY DEFINER، لا سياسة إدراج للزائر) ← جدول shop_interest.
// يُعرض العدد والقائمة لكلّ منتج في لوحة «المتجر الرقميّ» بالنظام الداخليّ.
import { useEffect, useState } from "react";
import { shopSoon, SOON_KEY, SOON_RPC, type SoonItem } from "@/lib/shop";

const ICONS: Record<SoonItem["icon"], string> = {
  course: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M10 8l4 2-4 2z"/><path d="M8 20h8M12 16v4"/>',
  clips: '<rect x="3" y="3" width="7" height="12" rx="1.6"/><rect x="14" y="3" width="7" height="12" rx="1.6"/><path d="M3 19h18M6 22h12"/>',
  ai: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
};
const DONE = (k: string) => `soon-${k}`;

export default function ShopSoon({ source }: { source: string }) {
  return (
    <div className="v2-soon-grid">
      {shopSoon.map((s) => <SoonCard key={s.key} s={s} source={source} />)}
    </div>
  );
}

function SoonCard({ s, source }: { s: SoonItem; source: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try { const d = localStorage.getItem(DONE(s.key)); if (d) setDone(d); } catch { /* تخزين مقفل */ }
  }, [s.key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return setErr("اكتب إيميلاً صحيحاً");
    setBusy(true);
    let src = source;
    try { const u = new URLSearchParams(location.search).get("utm_source"); if (u) src += `|${u.slice(0, 20)}`; } catch { /* */ }
    try {
      const r = await fetch(SOON_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SOON_KEY, Authorization: `Bearer ${SOON_KEY}` },
        body: JSON.stringify({ p_product: s.key, p_email: em, p_name: name.trim().slice(0, 80) || null, p_source: src }),
      });
      if (!r.ok) throw new Error(String(r.status));
      try { localStorage.setItem(DONE(s.key), em); } catch { /* تخزين مقفل */ }
      setDone(em);
    } catch {
      setErr("تعذّر التسجيل — تأكّد من الإنترنت وجرّب مرّة ثانية");
    }
    setBusy(false);
  }

  return (
    <article className="v2-soon-card" id={`soon-${s.key}`}>
      <div className="top">
        <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: ICONS[s.icon] }} />
        <span className="badge">قريباً</span>
      </div>
      <span className="kicker">{s.kind}</span>
      <h3>{s.name}</h3>
      <p>{s.tagline}</p>
      <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <div className="act">
        {done ? (
          <p className="ok" role="status">سجّلناك — بنبلّغك على <span dir="ltr">{done}</span> أوّل ما ينزل.</p>
        ) : !open ? (
          <>
            <p className="hint">مهتمّ؟ سجّل إيميلك ونبلّغك أوّل ما ينزل.</p>
            <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setOpen(true)}>بلّغني أوّل ما ينزل</button>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" inputMode="email" aria-label="الإيميل" autoFocus />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك (اختياريّ)" autoComplete="name" aria-label="الاسم — اختياريّ" />
            {err && <p className="msg" role="alert">{err}</p>}
            <button className="v2-btn v2-btn-primary" type="submit" disabled={busy}>{busy ? "لحظة…" : "سجّلني"}</button>
            <p className="fine">رسالة وحدة لمّا ينزل — بدون إزعاج.</p>
          </form>
        )}
      </div>
    </article>
  );
}
