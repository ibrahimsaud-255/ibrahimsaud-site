"use client";

// صفحة الشكر/الطلب: تقرأ ?o=&t= ، تحفظ معرّف هذا الجهاز، وتسأل الدالّة «shop» عن الطلب.
// الحالات: تأكيد الدفع (فحص متكرّر) ← مدفوع (الملفّات) | جهاز جديد (رمز على البريد) | فشل/إلغاء.
// ?demo=1 يعرض طلباً مدفوعاً وهميّاً بلا أيّ اتّصال — للمعاينة.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fmtSize, shopCall, itemBySlug, shopItems } from "@/lib/shop";
import { isShopLang, langOfSku, money, shopT, type ShopLang, type ShopT } from "@/lib/shopUi";
import { PlatformLogo, fileKey } from "./Platforms";
import { waHref } from "@/lib/v2";

type FileView = { id: string; name: string; size: number; used: number; max: number };
type OrderView = {
  id: string; status: "pending" | "paid" | "failed" | "cancelled"; title: string; sku: string; amount: number;
  name: string; email: string; createdAt: string; paidAt: string | null; trusted: boolean; needsVerify: boolean;
  devicesLeft: number; files: FileView[]; hold?: boolean; error?: string;
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

const dateFmt = (iso: string | null, T: ShopT) =>
  iso ? new Date(iso).toLocaleDateString(T.dateLocale, { day: "numeric", month: "long", year: "numeric" }) : "";

/** لغة الصفحة قبل وصول الطلب: ‎?l=ru|en (رابط الإيميل) أو آخر شراء من صفحة روسيّة/إنجليزيّة. */
const asLang = (v: string | null): ShopLang | null => (v !== "ar" && isShopLang(v) ? v : null);
/** منتج الطلب بلغة الصفحة (النسخة العالميّة لها صفحة لكل لغة بنفس الـsku). */
const itemFor = (sku: string, lang: ShopLang) =>
  shopItems.find((i) => i.sku === sku.split("@")[0] && i.lang === lang) || itemBySlug(sku.split("@")[0]);

function hintLang(search: string | null): ShopLang {
  const q = search ? asLang(new URLSearchParams(search).get("l")) : null;
  if (q) return q;
  try { return asLang(localStorage.getItem("shop-lang")) || "ar"; } catch { return "ar"; }
}

const noSub = () => () => {};

export default function ThanksView() {
  const search = useSyncExternalStore(noSub, () => location.search, () => null);
  const [lang, setLang] = useState<ShopLang>("ar");
  useEffect(() => { setLang(hintLang(search)); }, [search]);
  const T = shopT(lang);
  return (
    <div dir={T.dir} lang={lang}>
      <ThanksInner T={T} lang={lang} onLang={setLang} />
    </div>
  );
}

function ThanksInner({ T, lang, onLang }: { T: ShopT; lang: ShopLang; onLang: (l: ShopLang) => void }) {
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
  const err = q && !q.demo && (!q.o || !q.t) ? T.missingLink : fetchErr;

  // `tick` يعيد السؤال (فحص متكرّر، أو بعد توثيق جهاز أو تنزيل).
  const [tick, setTick] = useState(0);
  const load = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    if (!q || q.demo || !q.o || !q.t) return;
    let on = true;
    shopCall<OrderView>("order", { o: q.o, t: q.t, device: dev }).then((r) => {
      if (!on) return;
      if (!r.ok) setErr((lang === "ar" && r.data.error) || T.cantOpen);
      else {
        setOrder(r.data);
        // النسخة العالميّة (sku ‎-en) تُباع بعدّة لغات: نبقي لغة صفحة المشتري إن لم تكن عربيّة/روسيّة
        const s = langOfSku(r.data.sku);
        onLang(s === "en" && lang !== "ar" && lang !== "ru" ? lang : s);
      }
    });
    return () => { on = false; };
  }, [q, dev, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // الدفع قيد التأكيد: نعيد السؤال كلّ ٣ ثوانٍ حتى ٢٠ مرّة (الخادم يفحص لدى تلر بنفسه).
  useEffect(() => {
    if (order?.status !== "pending" || checks >= 20) return;
    const id = setTimeout(() => { setChecks((c) => c + 1); load(); }, 3000);
    return () => clearTimeout(id);
  }, [order, checks, load]);

  // بلا رابط (أو رابط خربان): استرجاع الطلب بالإيميل — المشتري ما يضيع طلبه أبداً
  if (q && !q.demo && (!q.o || !q.t)) return <Recover T={T} lang={lang} />;
  if (err) return (
    <>
      <Card icon="⚠︎" title={T.cantOpenTitle} text={err} cta={<a className="v2-btn v2-btn-ghost" href={waHref(T.waProblem)} target="_blank" rel="noopener">{T.contact}</a>} />
      <Recover compact T={T} lang={lang} />
    </>
  );
  if (!order) return <Card spin title={T.opening} />;

  if (order.status === "pending") {
    return checks >= 20
      ? <Card icon="⏳" title={T.notConfirmedTitle} text={T.notConfirmedText}
          cta={<button className="v2-btn v2-btn-primary" onClick={() => { setChecks(0); load(); }}>{T.refresh}</button>} />
      : <Card spin title={T.checking} text={T.checkingText} />;
  }

  if (order.status === "failed" || order.status === "cancelled") {
    const item = shopItems.find((i) => i.sku === order.sku);
    return <Card icon="✕" title={order.status === "cancelled" ? T.cancelled : T.failed} text={T.notCharged}
      cta={<a className="v2-btn v2-btn-primary" href={item ? `${item.publicPath || `/shop/${item.slug}/`}#buy` : "/shop/"}>{T.tryAgain}</a>} />;
  }

  if (order.hold) {
    const ref = order.id.slice(0, 8).toUpperCase();
    return <Card icon="⏳" title={T.holdTitle(order.name)} text={T.holdText(ref)}
      cta={<a className="v2-btn v2-btn-primary" href={waHref(T.holdWa(ref))} target="_blank" rel="noopener">{T.holdCta}</a>} />;
  }

  return (
    <div className="v2-shop-thanks">
      <div className="v2-shop-done">
        <span className="check" aria-hidden>✓</span>
        <h1>{T.thanks(order.name)}</h1>
        <p className="lead">{T.ready(order.title)}</p>
      </div>

      <section className="v2-shop-order" aria-label={T.orderDetails}>
        <dl>
          <div><dt>{T.orderNo}</dt><dd dir="ltr">{order.id.slice(0, 8).toUpperCase()}</dd></div>
          <div><dt>{T.date}</dt><dd>{dateFmt(order.paidAt || order.createdAt, T)}</dd></div>
          <div><dt>{T.amount}</dt><dd>{money(order.amount, lang)}</dd></div>
          <div><dt>{T.mailLbl}</dt><dd dir="ltr">{order.email}</dd></div>
        </dl>
      </section>

      {order.needsVerify
        ? <Verify T={T} q={q!} dev={dev} email={order.email} devicesLeft={order.devicesLeft} onDone={load} />
        : <Files T={T} q={q!} dev={dev} files={order.files} demo={!!q?.demo} onChange={load} />}

      {/* منصّات قادمة (أندرويد / آيفون): تصل لنفس الطلب لمّا تنزل — بلا شراء جديد */}
      {(() => {
        const soon = (itemFor(order.sku, lang)?.platforms || []).filter((p) => p.soon);
        if (!soon.length) return null;
        return (
          <section className="v2-shop-files" aria-label={T.soonFor}>
            <h2>{T.soonFor}</h2>
            <ul>
              {soon.map((p) => (
                <li key={p.key}>
                  <span className="ic plat"><PlatformLogo k={p.key} /></span>
                  <span className="meta"><b>{p.name}</b><small>{p.soon} {T.soonNote}</small></span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      <p className="v2-shop-note">
        {T.note}{(() => { const it = itemFor(order.sku, lang); return it ? <a className="v2-link" href={it.publicPath || `/shop/${it.slug}/`}>{T.productPage} <span className="chev">{T.chev}</span></a> : null; })()}
      </p>
    </div>
  );
}

function Files({ T, q, dev, files, demo, onChange }: { T: ShopT; q: { o: string; t: string }; dev: string; files: FileView[]; demo: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function get(f: FileView) {
    setMsg(null);
    if (demo) { setMsg(T.demoMsg); return; }
    setBusy(f.id);
    const r = await shopCall<{ url?: string }>("download", { o: q.o, t: q.t, device: dev, fileId: f.id });
    setBusy(null);
    if (r.ok && r.data.url) { window.location.assign(r.data.url); setTimeout(onChange, 1500); return; }
    setMsg((T.dir === "rtl" && r.data.error) || T.dlFail);
  }

  if (!files.length) return <p className="v2-shop-note">{T.preparing}</p>;
  return (
    <section className="v2-shop-files" aria-label={T.yourFiles}>
      <h2>{T.yourFiles}</h2>
      <ul>
        {files.map((f) => {
          const left = Math.max(0, f.max - f.used);
          return (
            <li key={f.id}>
              {fileKey(f.id) ? <span className="ic plat"><PlatformLogo k={fileKey(f.id)!} /></span> : <span className="ic" aria-hidden>⬇︎</span>}
              <span className="meta">
                <b>{f.name}</b>
                <small>{[fmtSize(f.size), T.left(left, f.max)].filter(Boolean).join(" · ")}</small>
              </span>
              <button className="v2-btn v2-btn-primary sm" onClick={() => get(f)} disabled={!!busy || left === 0}>
                {busy === f.id ? T.dlBusy : left === 0 ? T.dlOut : T.dl}
              </button>
            </li>
          );
        })}
      </ul>
      {msg && <p className="msg" role="status">{msg}</p>}
    </section>
  );
}

function Recover({ compact = false, T, lang }: { compact?: boolean; T: ShopT; lang: ShopLang }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await shopCall<{ message?: string }>("recover", { email });
    setBusy(false);
    setDone(lang !== "ar" ? (r.ok ? T.recoverDone : T.sendFail) : (r.data.message || r.data.error || T.doneDefault));
  }
  return (
    <section className="v2-shop-verify" style={compact ? { marginTop: 24 } : undefined}>
      <h2>{compact ? T.recoverCompact : T.recoverTitle}</h2>
      {done ? <p>{done}</p> : (
        <form onSubmit={send}>
          <p>{T.recoverText}</p>
          <input className="code" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" aria-label={T.mailAria} style={{ letterSpacing: 0 }} />
          <div className="row"><button className="v2-btn v2-btn-primary" type="submit" disabled={busy || !email}>{busy ? T.sending : T.sendLink}</button></div>
        </form>
      )}
    </section>
  );
}

function Verify({ T, q, dev, email, devicesLeft, onDone }: { T: ShopT; q: { o: string; t: string }; dev: string; email: string; devicesLeft: number; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function send() {
    setBusy(true); setMsg(null);
    const r = await shopCall<{ to?: string; already?: boolean }>("otp-send", { o: q.o, t: q.t, device: dev });
    setBusy(false);
    if (r.data.already) return onDone();
    if (!r.ok) return setMsg((T.dir === "rtl" && r.data.error) || T.sendFail);
    setSent(true);
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await shopCall("otp-verify", { o: q.o, t: q.t, device: dev, code });
    setBusy(false);
    if (!r.ok) return setMsg((T.dir === "rtl" && r.data.error) || T.badCode);
    onDone();
  }

  return (
    <section className="v2-shop-verify">
      <h2>{T.newDevice}</h2>
      {devicesLeft === 0 ? (
        <p>{T.maxDevices}<a className="v2-link" href={waHref(T.waDevice)} target="_blank" rel="noopener">{T.maxDevicesLink} <span className="chev">{T.chev}</span></a></p>
      ) : !sent ? (
        <>
          <p>{T.protect}<b dir="ltr">{email}</b>.</p>
          <button className="v2-btn v2-btn-primary" onClick={send} disabled={busy}>{busy ? T.sending : T.sendCode}</button>
        </>
      ) : (
        <form onSubmit={verify}>
          <p>{T.enterCode}<b dir="ltr">{email}</b>.</p>
          <input className="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" dir="ltr" placeholder="••••••" aria-label={T.codeLbl} />
          <div className="row">
            <button className="v2-btn v2-btn-primary" type="submit" disabled={busy || code.length !== 6}>{busy ? T.verifying : T.verify}</button>
            <button className="v2-btn v2-btn-ghost" type="button" onClick={send} disabled={busy}>{T.newCode}</button>
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
