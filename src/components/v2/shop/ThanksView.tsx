"use client";

// صفحة الشكر/الطلب: تقرأ ?o=&t= ، تحفظ معرّف هذا الجهاز، وتسأل الدالّة «shop» عن الطلب.
// الحالات: تأكيد الدفع (فحص متكرّر) ← مدفوع (الملفّات) | جهاز جديد (رمز على البريد) | فشل/إلغاء.
// ?demo=1 يعرض طلباً مدفوعاً وهميّاً بلا أيّ اتّصال — للمعاينة.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fmtSize, sar, shopCall, itemBySlug, shopItems } from "@/lib/shop";
import { PlatformLogo, fileKey } from "./Platforms";
import { waHref } from "@/lib/v2";

type FileView = { id: string; name: string; size: number; used: number; max: number };
type OrderView = {
  id: string; status: "pending" | "paid" | "failed" | "cancelled"; title: string; sku: string; amount: number;
  name: string; email: string; createdAt: string; paidAt: string | null; trusted: boolean; needsVerify: boolean;
  devicesLeft: number; files: FileView[]; error?: string;
};

const DEMO: OrderView = {
  id: "8f2c1d7e-0000-4000-8000-demo00000001", status: "paid", title: "برنامج بث الدروس العلمية", sku: "lessons-broadcast",
  amount: 299, name: "عبدالله", email: "ab••••@gmail.com", createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
  trusted: true, needsVerify: false, devicesLeft: 2,
  files: [
    { id: "win", name: "برنامج بث الدروس العلمية — ويندوز", size: 148_300_000, used: 1, max: 10 },
    { id: "mac", name: "برنامج بث الدروس العلمية — ماك", size: 162_200_000, used: 0, max: 10 },
  ],
};

function deviceId(): string {
  const K = "is-shop-device";
  try {
    let d = localStorage.getItem(K);
    if (!d) {
      const a = crypto.getRandomValues(new Uint8Array(18));
      d = Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(K, d);
    }
    return d;
  } catch {
    return "";
  }
}

const dateAr = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" }) : "";

const noSub = () => () => {};

export default function ThanksView() {
  // الرابط ومعرّف الجهاز من المتصفّح (فارغان وقت البناء الثابت).
  const search = useSyncExternalStore(noSub, () => location.search, () => null);
  const dev = useSyncExternalStore(noSub, deviceId, () => "");
  const q = useMemo(() => {
    if (search === null) return null;
    const p = new URLSearchParams(search);
    return { o: p.get("o") || "", t: p.get("t") || "", s: p.get("s") || "", demo: p.get("demo") === "1" };
  }, [search]);
  const [fetched, setOrder] = useState<OrderView | null>(null);
  const [fetchErr, setErr] = useState<string | null>(null);
  const [checks, setChecks] = useState(0);

  const order = q?.demo ? DEMO : fetched;
  const err = q && !q.demo && (!q.o || !q.t) ? "الرابط ناقص — افتح الرابط اللي وصلك على بريدك." : fetchErr;

  // `tick` يعيد السؤال (فحص متكرّر، أو بعد توثيق جهاز أو تنزيل).
  const [tick, setTick] = useState(0);
  const load = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    if (!q || q.demo || !q.o || !q.t) return;
    let on = true;
    shopCall<OrderView>("order", { o: q.o, t: q.t, device: dev }).then((r) => {
      if (!on) return;
      if (!r.ok) setErr(r.data.error || "تعذّر فتح الطلب");
      else setOrder(r.data);
    });
    return () => { on = false; };
  }, [q, dev, tick]);

  // الدفع قيد التأكيد: نعيد السؤال كلّ ٣ ثوانٍ حتى ٢٠ مرّة (الخادم يفحص لدى تلر بنفسه).
  useEffect(() => {
    if (order?.status !== "pending" || checks >= 20) return;
    const id = setTimeout(() => { setChecks((c) => c + 1); load(); }, 3000);
    return () => clearTimeout(id);
  }, [order, checks, load]);

  // بلا رابط (أو رابط خربان): استرجاع الطلب بالإيميل — المشتري ما يضيع طلبه أبداً
  if (q && !q.demo && (!q.o || !q.t)) return <Recover />;
  if (err) return (
    <>
      <Card icon="⚠︎" title="ما قدرنا نفتح الطلب" text={err} cta={<a className="v2-btn v2-btn-ghost" href={waHref("السلام عليكم، عندي مشكلة في فتح طلبي من المتجر")} target="_blank" rel="noopener">راسلني</a>} />
      <Recover compact />
    </>
  );
  if (!order) return <Card spin title="نفتح طلبك…" />;

  if (order.status === "pending") {
    return checks >= 20
      ? <Card icon="⏳" title="الدفع ما تأكّد للحين" text="إذا خُصم المبلغ من بطاقتك فطلبك بيتفعّل تلقائيّاً خلال دقائق ويوصلك الرابط على بريدك. تقدر تحدّث الصفحة لاحقاً."
          cta={<button className="v2-btn v2-btn-primary" onClick={() => { setChecks(0); load(); }}>حدّث الحالة</button>} />
      : <Card spin title="نتأكّد من الدفع…" text="ثوانٍ وتظهر ملفّاتك. لا تقفل الصفحة." />;
  }

  if (order.status === "failed" || order.status === "cancelled") {
    const item = shopItems.find((i) => i.sku === order.sku);
    return <Card icon="✕" title={order.status === "cancelled" ? "أُلغي الدفع" : "ما تمّ الدفع"} text="ما خُصم شي. تقدر ترجع وتحاول مرّة ثانية."
      cta={<a className="v2-btn v2-btn-primary" href={item ? `/shop/${item.slug}/#buy` : "/shop/"}>جرّب مرّة ثانية</a>} />;
  }

  return (
    <div className="v2-shop-thanks">
      <div className="v2-shop-done">
        <span className="check" aria-hidden>✓</span>
        <h1>شكراً {order.name}.</h1>
        <p className="lead">طلبك جاهز — {order.title}.</p>
      </div>

      <section className="v2-shop-order" aria-label="تفاصيل الطلب">
        <dl>
          <div><dt>رقم الطلب</dt><dd dir="ltr">{order.id.slice(0, 8).toUpperCase()}</dd></div>
          <div><dt>التاريخ</dt><dd>{dateAr(order.paidAt || order.createdAt)}</dd></div>
          <div><dt>المبلغ</dt><dd>{sar(order.amount)}</dd></div>
          <div><dt>البريد</dt><dd dir="ltr">{order.email}</dd></div>
        </dl>
      </section>

      {order.needsVerify
        ? <Verify q={q!} dev={dev} email={order.email} devicesLeft={order.devicesLeft} onDone={load} />
        : <Files q={q!} dev={dev} files={order.files} demo={!!q?.demo} onChange={load} />}

      {/* منصّات قادمة (أندرويد / آيفون): تصل لنفس الطلب لمّا تنزل — بلا شراء جديد */}
      {(() => {
        const soon = (itemBySlug(order.sku)?.platforms || []).filter((p) => p.soon);
        if (!soon.length) return null;
        return (
          <section className="v2-shop-files" aria-label="قريباً">
            <h2>قريباً لنفس طلبك</h2>
            <ul>
              {soon.map((p) => (
                <li key={p.key}>
                  <span className="ic plat"><PlatformLogo k={p.key} /></span>
                  <span className="meta"><b>{p.name}</b><small>{p.soon} — نبلغك على بريدك لمّا تنزل</small></span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      <p className="v2-shop-note">
        احفظ الإيميل اللي وصلك — هو مفتاحك للرجوع لملفّاتك. الرابط يعمل على أجهزتك فقط (حتى ٣ أجهزة)،
        وأيّ جهاز جديد يحتاج رمزاً يوصل بريدك. {itemBySlug(order.sku) ? <a className="v2-link" href={`/shop/${order.sku}/`}>صفحة المنتج <span className="chev">‹</span></a> : null}
      </p>
    </div>
  );
}

function Files({ q, dev, files, demo, onChange }: { q: { o: string; t: string }; dev: string; files: FileView[]; demo: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function get(f: FileView) {
    setMsg(null);
    if (demo) { setMsg("هذه معاينة — في الطلب الحقيقيّ يبدأ التنزيل هنا مباشرة."); return; }
    setBusy(f.id);
    const r = await shopCall<{ url?: string }>("download", { o: q.o, t: q.t, device: dev, fileId: f.id });
    setBusy(null);
    if (r.ok && r.data.url) { window.location.assign(r.data.url); setTimeout(onChange, 1500); return; }
    setMsg(r.data.error || "تعذّر التنزيل");
  }

  if (!files.length) return <p className="v2-shop-note">الملفّات تُجهَّز — بتوصلك على بريدك قريباً.</p>;
  return (
    <section className="v2-shop-files" aria-label="ملفّاتك">
      <h2>ملفّاتك</h2>
      <ul>
        {files.map((f) => {
          const left = Math.max(0, f.max - f.used);
          return (
            <li key={f.id}>
              {fileKey(f.id) ? <span className="ic plat"><PlatformLogo k={fileKey(f.id)!} /></span> : <span className="ic" aria-hidden>⬇︎</span>}
              <span className="meta">
                <b>{f.name}</b>
                <small>{[fmtSize(f.size), `باقي ${left.toLocaleString("ar-SA")} من ${f.max.toLocaleString("ar-SA")} تنزيلات`].filter(Boolean).join(" · ")}</small>
              </span>
              <button className="v2-btn v2-btn-primary sm" onClick={() => get(f)} disabled={!!busy || left === 0}>
                {busy === f.id ? "يجهّز…" : left === 0 ? "استُنفد" : "نزّل"}
              </button>
            </li>
          );
        })}
      </ul>
      {msg && <p className="msg" role="status">{msg}</p>}
    </section>
  );
}

function Recover({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await shopCall<{ message?: string }>("recover", { email });
    setBusy(false);
    setDone(r.data.message || r.data.error || "تمّ");
  }
  return (
    <section className="v2-shop-verify" style={compact ? { marginTop: 24 } : undefined}>
      <h2>{compact ? "أو استرجع رابط طلبك" : "استرجع طلبك"}</h2>
      {done ? <p>{done}</p> : (
        <form onSubmit={send}>
          <p>اكتب الإيميل اللي اشتريت به، ونرسل لك رابط طلبك من جديد — تنزّل منه البرنامج وتحديثاته متى ما بغيت.</p>
          <input className="code" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" aria-label="البريد" style={{ letterSpacing: 0 }} />
          <div className="row"><button className="v2-btn v2-btn-primary" type="submit" disabled={busy || !email}>{busy ? "نرسل…" : "أرسل الرابط"}</button></div>
        </form>
      )}
    </section>
  );
}

function Verify({ q, dev, email, devicesLeft, onDone }: { q: { o: string; t: string }; dev: string; email: string; devicesLeft: number; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function send() {
    setBusy(true); setMsg(null);
    const r = await shopCall<{ to?: string; already?: boolean }>("otp-send", { o: q.o, t: q.t, device: dev });
    setBusy(false);
    if (r.data.already) return onDone();
    if (!r.ok) return setMsg(r.data.error || "تعذّر الإرسال");
    setSent(true);
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await shopCall("otp-verify", { o: q.o, t: q.t, device: dev, code });
    setBusy(false);
    if (!r.ok) return setMsg(r.data.error || "الرمز غير صحيح");
    onDone();
  }

  return (
    <section className="v2-shop-verify">
      <h2>جهاز جديد</h2>
      {devicesLeft === 0 ? (
        <p>طلبك مفتوح على ٣ أجهزة (الحدّ الأقصى). <a className="v2-link" href={waHref("السلام عليكم، أبي أفتح طلبي من المتجر على جهاز جديد")} target="_blank" rel="noopener">راسلني وأفتحه لك <span className="chev">‹</span></a></p>
      ) : !sent ? (
        <>
          <p>حمايةً لملفّاتك، نتأكّد إنّك صاحب الطلب: نرسل رمزاً لبريدك <b dir="ltr">{email}</b>.</p>
          <button className="v2-btn v2-btn-primary" onClick={send} disabled={busy}>{busy ? "نرسل…" : "أرسل الرمز"}</button>
        </>
      ) : (
        <form onSubmit={verify}>
          <p>اكتب الرمز اللي وصلك على <b dir="ltr">{email}</b>.</p>
          <input className="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" dir="ltr" placeholder="••••••" aria-label="رمز التحقّق" />
          <div className="row">
            <button className="v2-btn v2-btn-primary" type="submit" disabled={busy || code.length !== 6}>{busy ? "نتحقّق…" : "تحقّق"}</button>
            <button className="v2-btn v2-btn-ghost" type="button" onClick={send} disabled={busy}>رمز جديد</button>
          </div>
        </form>
      )}
      {msg && <p className="msg" role="alert">{msg}</p>}
    </section>
  );
}

function Card({ title, text, icon, spin, cta }: { title: string; text?: string; icon?: string; spin?: boolean; cta?: React.ReactNode }) {
  return (
    <div className="v2-shop-state">
      {spin ? <span className="spin" aria-hidden /> : <span className="ic" aria-hidden>{icon}</span>}
      <h1>{title}</h1>
      {text && <p>{text}</p>}
      {cta}
    </div>
  );
}
