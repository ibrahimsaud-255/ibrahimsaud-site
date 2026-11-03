"use client";

// «اطلب عرض سعر» بشكل مؤسّسيّ: نموذج قصير يرتّب الطلب ويفتحه في واتساب جاهزاً،
// عشان الموظّف يرفع طلباً واضحاً لمديره بدل رسالة «السلام عليكم، كم السعر؟».
import { useState } from "react";
import { waHref } from "@/lib/v2";

type Field = { id: string; label: string; type?: "select" | "text" | "textarea"; options?: string[]; placeholder?: string };

export default function QuoteForm({ subject, fields, cta = "أرسل الطلب" }: { subject: string; fields: Field[]; cta?: string }) {
  const [v, setV] = useState<Record<string, string>>({});
  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));
  const send = () => {
    const lines = [`السلام عليكم، طلب ${subject}:`, ...fields.filter((f) => v[f.id]?.trim()).map((f) => `• ${f.label}: ${v[f.id].trim()}`)];
    window.open(waHref(lines.join("\n")), "_blank", "noopener");
  };
  return (
    <form className="v2-quote" onSubmit={(e) => { e.preventDefault(); send(); }}>
      {fields.map((f) => (
        <label key={f.id} className={f.type === "textarea" ? "full" : ""}>
          <span>{f.label}</span>
          {f.type === "select" ? (
            <select value={v[f.id] || ""} onChange={(e) => set(f.id, e.target.value)}>
              <option value="">اختر</option>
              {f.options!.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : f.type === "textarea" ? (
            <textarea rows={3} placeholder={f.placeholder} value={v[f.id] || ""} onChange={(e) => set(f.id, e.target.value)} />
          ) : (
            <input type="text" placeholder={f.placeholder} value={v[f.id] || ""} onChange={(e) => set(f.id, e.target.value)} />
          )}
        </label>
      ))}
      <div className="full act">
        <button className="v2-btn v2-btn-primary" type="submit">{cta}</button>
        <small>يفتح واتساب والطلب مكتوب، وأرد عليك بعرض سعر رسميّ.</small>
      </div>
    </form>
  );
}
