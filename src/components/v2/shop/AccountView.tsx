"use client";

// «حسابي»: المشتري يرجع لمشترياته وآخر إصدار من ملفّاتها بلا رابط الإيميل ولا واتساب.
// بريد ← رمز ٦ أرقام ← جلسة تُحفظ على هذا الجهاز (٩٠ يوماً) ← المكتبة.
// الخادم: دالّة shop-account (منفصلة عن الدفع). ?demo=1 يعرض مكتبة وهميّة بلا اتّصال.
import { useCallback, useEffect, useState } from "react";
import { accountCall, fmtSize, shopItems } from "@/lib/shop";
import { waHref } from "@/lib/v2";
import { PlatformLogo, fileKey } from "./Platforms";

type FileView = { id: string; name: string; size: number; used: number; max: number };
type OrderView = { id: string; sku: string; title: string; amount: number; paidAt: string | null; hold: boolean; files: FileView[]; version?: string | null; changelog?: string | null };
type Library = { email: string; name: string; orders: OrderView[] };

const KEY = "is-account";
const DEMO: Library = {
  email: "ab••••@gmail.com", name: "عبدالله",
  orders: [{
    id: "demo", sku: "lessons-broadcast", title: "برنامج بث الدروس العلمية", amount: 299, paidAt: new Date().toISOString(), hold: false,
    version: "1.0.3", changelog: "تنقية صوت أوضح للمساجد الكبيرة\nتصدير فصول يوتيوب بضغطة",
    files: [
      { id: "win", name: "برنامج بث الدروس العلمية — ويندوز", size: 248_300_000, used: 1, max: 10 },
      { id: "mac", name: "برنامج بث الدروس العلمية — ماك", size: 262_200_000, used: 0, max: 10 },
      { id: "android", name: "برنامج بث الدروس العلمية — أندرويد", size: 92_000_000, used: 0, max: 10 },
    ],
  }],
};

const readSaved = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
const save = (s: string | null) => { try { if (s) localStorage.setItem(KEY, s); else localStorage.removeItem(KEY); } catch { /* تخزين مقفل */ } };
const dateFmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" }) : "";
const itemOf = (sku: string) => shopItems.find((i) => i.sku === sku) || shopItems.find((i) => sku.startsWith(i.sku));

export default function AccountView() {
  const [session, setSession] = useState<string | null>(null);
  const [lib, setLib] = useState<Library | null>(null);
  const [state, setState] = useState<"boot" | "login" | "loading" | "ready" | "error">("boot");
  const [err, setErr] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async (s: string) => {
    setState("loading");
    const r = await accountCall<Library>("library", { session: s });
    if (r.ok) { setLib(r.data); setState("ready"); return; }
    if (r.data.relogin) { save(null); setSession(null); setState("login"); return; }
    setErr(r.data.error || "تعذّر تحميل مشترياتك"); setState("error");
  }, []);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("demo") === "1") { setDemo(true); setLib(DEMO); setState("ready"); return; }
    const s = readSaved();
    if (s) { setSession(s); load(s); } else setState("login");
  }, [load]);

  function signedIn(s: string) { save(s); setSession(s); load(s); }
  function logout() { save(null); setSession(null); setLib(null); setState("login"); }

  if (state === "boot" || state === "loading") return <Card spin title="لحظة…" text="نجهّز مشترياتك" />;
  if (state === "login") return <Login onDone={signedIn} />;
  if (state === "error") return <Card icon="⚠︎" title="تعذّر التحميل" text={err || ""} cta={<button className="v2-btn v2-btn-primary" onClick={() => session && load(session)}>جرّب مرّة ثانية</button>} />;

  return (
    <div className="v2-account">
      <header className="v2-account-head">
        <p className="eyebrow">حسابي</p>
        <h1>{lib?.name ? `أهلاً ${lib.name}` : "مشترياتك"}</h1>
        <p className="sub">كلّ ما اشتريته من هنا، بآخر إصدار دائماً. <span dir="ltr">{lib?.email}</span></p>
      </header>

      {!lib?.orders.length ? (
        <Card icon="🗂" title="ما فيه مشتريات على هذا البريد" text="لو دفعت ببريد ثاني، اخرج وادخل به." cta={<button className="v2-btn v2-btn-ghost" onClick={logout}>الدخول ببريد ثاني</button>} />
      ) : lib.orders.map((o) => <OrderCard key={o.id} o={o} session={session} demo={demo} onRelogin={logout} onChange={() => session && load(session)} />)}

      <div className="v2-account-foot">
        <a className="v2-link" href={waHref("السلام عليكم، عندي استفسار عن مشترياتي من المتجر")} target="_blank" rel="noopener">تحتاج مساعدة؟ راسلني على واتساب <span className="chev">‹</span></a>
        {!demo && <button className="v2-btn v2-btn-ghost sm" onClick={logout}>تسجيل الخروج</button>}
      </div>
    </div>
  );
}

function OrderCard({ o, session, demo, onRelogin, onChange }: { o: OrderView; session: string | null; demo: boolean; onRelogin: () => void; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const item = itemOf(o.sku);

  async function get(f: FileView) {
    setMsg(null);
    if (demo) { setMsg("هذي معاينة — التنزيل يشتغل في حسابك الحقيقيّ."); return; }
    setBusy(f.id);
    const r = await accountCall<{ url?: string }>("download", { session, o: o.id, fileId: f.id });
    setBusy(null);
    if (r.ok && r.data.url) { window.location.assign(r.data.url); setTimeout(onChange, 1500); return; }
    if (r.data.relogin) return onRelogin();
    setMsg(r.data.error || "تعذّر التنزيل، جرّب مرّة ثانية");
  }

  return (
    <section className="v2-shop-files v2-account-order" aria-label={o.title}>
      <div className="v2-account-order-head">
        {item?.iconImg ? <img src={item.iconImg} alt="" width={52} height={52} /> : <span className="ic" aria-hidden>{item?.icon || "📦"}</span>}
        <div>
          <h2>{o.title}</h2>
          <small>{o.version ? <>الإصدار <b dir="ltr">{o.version}</b> · </> : null}اشتريته {dateFmt(o.paidAt)}{item?.publicPath ? <> · <a className="v2-link" href={item.publicPath}>صفحة البرنامج</a></> : null}</small>
        </div>
      </div>
      {o.changelog && !o.hold && (
        <details className="v2-account-new">
          <summary>وش الجديد{o.version ? ` في ${o.version}` : ""}</summary>
          <ul>{o.changelog.split(/\n+/).filter(Boolean).map((t) => <li key={t}>{t.replace(/^[-•*]\s*/, "")}</li>)}</ul>
        </details>
      )}
      {o.hold ? (
        <p className="v2-shop-note">طلبك قيد المراجعة — <a className="v2-link" href={waHref("السلام عليكم، طلبي في المتجر قيد المراجعة")} target="_blank" rel="noopener">راسلني ونرتّبه لك</a>.</p>
      ) : !o.files.length ? (
        <p className="v2-shop-note">الملفّات تتجهّز — بيوصلك إيميل أوّل ما تجهز.</p>
      ) : (
        <ul>
          {o.files.map((f) => {
            const left = Math.max(0, f.max - f.used);
            return (
              <li key={f.id}>
                {fileKey(f.id) ? <span className="ic plat"><PlatformLogo k={fileKey(f.id)!} /></span> : <span className="ic" aria-hidden>⬇︎</span>}
                <span className="meta">
                  <b>{f.name}</b>
                  <small>{[fmtSize(f.size), `باقي ${left} من ${f.max} تنزيلات`].filter(Boolean).join(" · ")}</small>
                </span>
                <button className="v2-btn v2-btn-primary sm" onClick={() => get(f)} disabled={!!busy || left === 0}>
                  {busy === f.id ? "يجهّز…" : left === 0 ? "انتهت" : "نزّل"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {o.sku.startsWith("lessons-broadcast") && !o.hold && (
        <p className="v2-account-ios">الآيفون والآيباد غير مشمولة في هذا الطلب — تطبيقها يُشترى منفصلاً من <a className="v2-link" href="https://apps.apple.com/app/id6836200953" target="_blank" rel="noopener" style={{ fontSize: 14 }}>App Store ↗</a></p>
      )}
      {msg && <p className="msg" role="status">{msg}</p>}
    </section>
  );
}

function Login({ onDone }: { onDone: (session: string) => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setMsg("اكتب بريدك اللي دفعت به"); return; }
    setBusy(true); setMsg(null);
    const r = await accountCall("login-send", { email: email.trim() });
    setBusy(false);
    if (!r.ok) { setMsg(r.data.error || "تعذّر الإرسال، جرّب بعد قليل"); return; }
    setSent(true); setCode("");
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await accountCall<{ session?: string }>("login-verify", { email: email.trim(), code });
    setBusy(false);
    if (r.ok && r.data.session) return onDone(r.data.session);
    setMsg(r.data.error || "الرمز غير صحيح");
  }

  return (
    <section className="v2-shop-verify v2-account-login">
      <p className="eyebrow">حسابي</p>
      <h1>مشترياتك وتحديثاتها في مكان واحد</h1>
      {!sent ? (
        <form onSubmit={send}>
          <p>اكتب البريد اللي دفعت به، ويوصلك رمز دخول — بلا كلمة مرور.</p>
          <input className="code" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com" autoComplete="email" inputMode="email" aria-label="البريد" style={{ letterSpacing: 0, fontSize: 18, fontWeight: 500, maxWidth: 360 }} />
          <div className="row"><button className="v2-btn v2-btn-primary" type="submit" disabled={busy || !email}>{busy ? "يرسل…" : "أرسل رمز الدخول"}</button></div>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>لو عندك مشتريات على <b dir="ltr">{email.trim()}</b> وصلك رمز من ٦ أرقام (شيّك على البريد المزعج كذلك).</p>
          <input className="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" dir="ltr" placeholder="••••••" aria-label="رمز الدخول" />
          <div className="row">
            <button className="v2-btn v2-btn-primary" type="submit" disabled={busy || code.length !== 6}>{busy ? "يتحقّق…" : "دخول"}</button>
            <button className="v2-btn v2-btn-ghost" type="button" onClick={() => send()} disabled={busy}>رمز جديد</button>
            <button className="v2-btn v2-btn-ghost" type="button" onClick={() => { setSent(false); setMsg(null); }} disabled={busy}>بريد ثاني</button>
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
