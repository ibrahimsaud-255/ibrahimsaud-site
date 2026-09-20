"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AuthExpired,
  type TeacherLookup,
  type TelrOrderRow,
  type SubscriptionRow,
  deleteGrant,
  getToken,
  grantByEmail,
  lookupTeacher,
  signIn,
  signOut,
  verifyTelrOrder,
} from "@/lib/huroofAdmin";

/**
 * اشتراكات «حروف ودروس» — تفعيلٌ يدويّ وتشخيصُ Telr.
 *
 * ─── لماذا لوحةٌ منفصلة عن «مدارس حروف ودروس» ──────────────────────────
 * تلك للحزم المؤسّسيّة (مدرسةٌ تشتري ٥٠ مقعداً)، وهذه لمشترِكٍ فردٍ دفع
 * لكنّه لم يُفعَّل — أو يستحقّ تعويضاً بشهرٍ إضافيّ. الحالتان مختلفتان في
 * النموذج والسير: المدرسة تحمل مقاعدَ وحدَّ إعادةٍ ومسؤولاً، والفرد يحمل
 * تاريخَ انتهاءٍ فقط.
 *
 * ─── سير الإصلاح الفوريّ لمشترِكٍ سُحب منه ولم يُفعَّل ──────────────────
 *   ١) ابحث ببريده → ترى طلباتِه في Telr واشتراكاتِه الحيّة.
 *   ٢) إن رأيت طلباً `pending` — اضغط «أعد التحقّق مع Telr».
 *   ٣) إن لم يظهر طلبٌ أو استمرّ pending — امنحه اشتراكاً يدويّاً.
 */

const C = {
  bg: "#0D0D2B",
  card: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.11)",
  gold: "#FFD700",
  orange: "#FF6D00",
  green: "#00C853",
  amber: "#FFB300",
  red: "#FF5252",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.38)",
};

const field: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 12px",
  color: C.text,
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: C.muted,
  marginBottom: 6,
};

const primaryBtn: React.CSSProperties = {
  background: C.gold,
  color: C.bg,
  border: "none",
  borderRadius: 10,
  padding: "11px 22px",
  fontWeight: 900,
  fontSize: 14,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "9px 18px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  background: "rgba(255,82,82,0.14)",
  color: C.red,
  border: `1px solid rgba(255,82,82,0.4)`,
  borderRadius: 10,
  padding: "9px 18px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
};

const cardWrap: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function statusChip(status: string, kind: "order" | "sub"): React.ReactElement {
  const map: Record<string, { bg: string; fg: string; text: string }> = {
    paid:      { bg: "rgba(0,200,83,0.14)", fg: C.green, text: "مدفوع" },
    active:    { bg: "rgba(0,200,83,0.14)", fg: C.green, text: "نشط" },
    pending:   { bg: "rgba(255,179,0,0.14)", fg: C.amber, text: "قيد الانتظار" },
    failed:    { bg: "rgba(255,82,82,0.14)", fg: C.red, text: "فشل" },
    cancelled: { bg: "rgba(255,255,255,0.06)", fg: C.faint, text: "ملغى" },
    expired:   { bg: "rgba(255,255,255,0.06)", fg: C.faint, text: "منتهٍ" },
  };
  const s = map[status] ?? { bg: "rgba(255,255,255,0.06)", fg: C.muted, text: status };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: s.bg,
        color: s.fg,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 900,
      }}
    >
      {s.text}
    </span>
  );
}

function platformChip(platform: string): React.ReactElement {
  const map: Record<string, { bg: string; text: string }> = {
    telr:         { bg: "rgba(0,198,255,0.14)", text: "Telr" },
    revenuecat:   { bg: "rgba(139,92,246,0.14)", text: "App Store" },
    manual:       { bg: "rgba(255,215,0,0.16)", text: "منحة يدويّة" },
    organization: { bg: "rgba(255,109,0,0.14)", text: "مدرسة" },
  };
  const s = map[platform] ?? { bg: "rgba(255,255,255,0.06)", text: platform };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: s.bg,
        color: C.text,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {s.text}
    </span>
  );
}

export default function HuroofSubscriptions() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  /* البحث والنتائج */
  const [searchEmail, setSearchEmail] = useState("");
  const [lookup, setLookup] = useState<TeacherLookup | null>(null);
  const [searching, setSearching] = useState(false);

  /* منحةٌ يدويّة */
  const [grantEmail, setGrantEmail] = useState("");
  const [grantMonths, setGrantMonths] = useState<number | "">(12);
  const [grantNote, setGrantNote] = useState("");
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  const showToast = useCallback((text: string, isError = false) => {
    if (isError) {
      setError(text);
      setMsg(null);
    } else {
      setMsg(text);
      setError(null);
    }
    setTimeout(() => {
      setMsg(null);
      setError(null);
    }, 5000);
  }, []);

  async function doSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      setPassword("");
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  async function doLookup(e?: React.FormEvent) {
    e?.preventDefault();
    const q = searchEmail.trim().toLowerCase();
    if (!q) return;
    setSearching(true);
    setError(null);
    try {
      const result = await lookupTeacher(q);
      setLookup(result);
    } catch (err) {
      if (err instanceof AuthExpired) setAuthed(false);
      else {
        setLookup(null);
        showToast(err instanceof Error ? err.message : "تعذّر البحث", true);
      }
    } finally {
      setSearching(false);
    }
  }

  async function doVerify(cartRef: string) {
    setBusy(true);
    try {
      const result = await verifyTelrOrder(cartRef);
      showToast(
        `النتيجة: ${result.status === "paid" ? "تمّ التفعيل ✓" : `الحالة ${result.status}`}`,
      );
      if (lookup) await doRefreshLookup();
    } catch (err) {
      if (err instanceof AuthExpired) setAuthed(false);
      else showToast(err instanceof Error ? err.message : "فشل التحقّق", true);
    } finally {
      setBusy(false);
    }
  }

  async function doRefreshLookup() {
    if (!lookup) return;
    try {
      const result = await lookupTeacher(lookup.email);
      setLookup(result);
    } catch {
      /* التحديث فشل — نبقي القديم */
    }
  }

  async function doGrant(e?: React.FormEvent) {
    e?.preventDefault();
    const emailV = grantEmail.trim().toLowerCase();
    if (!emailV) {
      showToast("أدخل بريد المشترِك", true);
      return;
    }
    const months = grantMonths === "" ? undefined : Number(grantMonths);
    const note = grantNote.trim();
    if (!note) {
      showToast("سبب المنحة مطلوب — يُخزَّن للمراجعة", true);
      return;
    }
    setGranting(true);
    setError(null);
    try {
      const result = await grantByEmail(emailV, months, note);
      showToast(
        `تمّ ✓ فُعِّل حساب ${result.email}${result.currentPeriodEnd ? ` حتى ${fmtDate(result.currentPeriodEnd)}` : " (مدى الحياة)"}`,
      );
      setGrantEmail("");
      setGrantNote("");
      /* إن كان يبحث في الشخص نفسه — حدّث. */
      if (lookup && lookup.email === emailV) await doRefreshLookup();
    } catch (err) {
      if (err instanceof AuthExpired) setAuthed(false);
      else showToast(err instanceof Error ? err.message : "فشل المنح", true);
    } finally {
      setGranting(false);
    }
  }

  async function doDeleteGrant(id: string, note: string) {
    if (!confirm(`إلغاء المنحة «${note}»؟`)) return;
    setBusy(true);
    try {
      await deleteGrant(id);
      showToast("تمّ إلغاء المنحة");
      await doRefreshLookup();
    } catch (err) {
      if (err instanceof AuthExpired) setAuthed(false);
      else showToast(err instanceof Error ? err.message : "فشل الإلغاء", true);
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) return null;

  /* ─── الدخول ─── */
  if (!authed) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100dvh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 28,
          }}
        >
          <h1 style={{ color: C.text, fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
            اشتراكات حروف ودروس
          </h1>
          <p style={{ color: C.muted, fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
            ادخل ببريدك المأذون له.
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={label}>البريد</label>
            <input
              style={field}
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={label}>كلمة المرور</label>
            <input
              style={field}
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void doSignIn()}
            />
          </div>

          <button
            style={{ ...primaryBtn, width: "100%", opacity: busy ? 0.5 : 1 }}
            disabled={busy}
            onClick={() => void doSignIn()}
          >
            دخول
          </button>

          {error && (
            <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginTop: 14 }}>{error}</p>
          )}
        </div>
      </div>
    );
  }

  /* ─── اللوحة ─── */
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background: C.bg,
        padding: "24px 16px 60px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ── الترويسة ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ color: C.text, fontSize: 22, fontWeight: 900, margin: 0 }}>
              اشتراكات حروف ودروس
            </h1>
            <p style={{ color: C.muted, fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>
              تفعيلٌ يدويّ لمن دفع ولم يُفعَّل + تشخيص طلبات Telr.
            </p>
          </div>
          <button
            style={secondaryBtn}
            onClick={() => {
              signOut();
              setAuthed(false);
            }}
          >
            خروج
          </button>
        </div>

        {/* ── التنبيهات ── */}
        {msg && (
          <div
            style={{
              ...cardWrap,
              padding: "12px 18px",
              marginBottom: 16,
              background: "rgba(0,200,83,0.10)",
              borderColor: "rgba(0,200,83,0.35)",
            }}
          >
            <span style={{ color: C.green, fontSize: 13, fontWeight: 800 }}>{msg}</span>
          </div>
        )}
        {error && (
          <div
            style={{
              ...cardWrap,
              padding: "12px 18px",
              marginBottom: 16,
              background: "rgba(255,82,82,0.10)",
              borderColor: "rgba(255,82,82,0.35)",
            }}
          >
            <span style={{ color: C.red, fontSize: 13, fontWeight: 800 }}>{error}</span>
          </div>
        )}

        {/* ── ١) منحةٌ يدويّة سريعة ── */}
        <div style={cardWrap}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🎁</span>
            <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>
              منحُ اشتراكٍ يدويّ
            </h2>
          </div>
          <p style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
            للمشترِك الّذي دفع ولم يُفعَّل، أو تعويضاً بأشهرٍ إضافيّة.
            يشترط أن يكون قد سجّل دخولَه مرّةً على الأقلّ.
          </p>

          <form
            onSubmit={doGrant}
            style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 130px 1fr auto" }}
          >
            <div>
              <label style={label}>بريد المشترِك</label>
              <input
                style={field}
                dir="ltr"
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="teacher@example.com"
                required
              />
            </div>
            <div>
              <label style={label}>الأشهر</label>
              <input
                style={field}
                type="number"
                min={1}
                max={120}
                value={grantMonths}
                onChange={(e) => {
                  const v = e.target.value;
                  setGrantMonths(v === "" ? "" : Number(v));
                }}
                placeholder="12"
              />
              <div style={{ color: C.faint, fontSize: 10.5, fontWeight: 700, marginTop: 4 }}>
                فارغ = مدى الحياة
              </div>
            </div>
            <div>
              <label style={label}>السبب *</label>
              <input
                style={field}
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder="دفعت Telr ولم يُفعَّل webhook"
                required
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                disabled={granting}
                style={{ ...primaryBtn, opacity: granting ? 0.5 : 1, whiteSpace: "nowrap" }}
              >
                {granting ? "..." : "امنح"}
              </button>
            </div>
          </form>
        </div>

        {/* ── ٢) بحثٌ عن معلّم ── */}
        <div style={cardWrap}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <h2 style={{ color: C.text, fontSize: 16, fontWeight: 900, margin: 0 }}>
              بحثٌ عن معلّمٍ وطلباتِه
            </h2>
          </div>

          <form onSubmit={doLookup} style={{ display: "flex", gap: 10 }}>
            <input
              style={{ ...field, flex: 1 }}
              dir="ltr"
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="teacher@example.com"
              required
            />
            <button
              type="submit"
              disabled={searching}
              style={{ ...primaryBtn, opacity: searching ? 0.5 : 1 }}
            >
              {searching ? "..." : "بحث"}
            </button>
          </form>

          {lookup && (
            <div style={{ marginTop: 20 }}>
              {/* معلومات المستخدم */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 16,
                }}
              >
                <div style={{ color: C.muted, fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                  البريد
                </div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 900 }} dir="ltr">
                  {lookup.email}
                </div>
                <div style={{ color: C.faint, fontSize: 10.5, marginTop: 6, fontFamily: "monospace" }} dir="ltr">
                  {lookup.userId}
                </div>
              </div>

              {/* الاشتراكات النشطة */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ color: C.gold, fontSize: 13, fontWeight: 900, marginBottom: 10 }}>
                  الاشتراكات ({lookup.subscriptions.length})
                </h3>
                {lookup.subscriptions.length === 0 ? (
                  <div
                    style={{
                      color: C.faint,
                      fontSize: 13,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 10,
                    }}
                  >
                    لا يوجد اشتراكٌ سابق.
                  </div>
                ) : (
                  <SubscriptionList
                    rows={lookup.subscriptions}
                    onDelete={(id, note) => void doDeleteGrant(id, note)}
                    busy={busy}
                  />
                )}
              </div>

              {/* طلبات Telr */}
              <div>
                <h3 style={{ color: C.gold, fontSize: 13, fontWeight: 900, marginBottom: 10 }}>
                  طلبات Telr ({lookup.orders.length})
                </h3>
                {lookup.orders.length === 0 ? (
                  <div
                    style={{
                      color: C.faint,
                      fontSize: 13,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 10,
                    }}
                  >
                    لم يُنشأ أيّ طلبٍ عبر Telr — ربّما فشل create-order قبل الوصول للبوّابة.
                  </div>
                ) : (
                  <OrderList rows={lookup.orders} onVerify={(ref) => void doVerify(ref)} busy={busy} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionList({
  rows,
  onDelete,
  busy,
}: {
  rows: SubscriptionRow[];
  onDelete: (id: string, note: string) => void;
  busy: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {rows.map((s) => {
        const isManual = s.platform === "manual";
        const reason = s.externalSubscriptionId ?? s.planId ?? "—";
        return (
          <div
            key={s.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 14,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {platformChip(s.platform)}
                {statusChip(s.status, "sub")}
                {s.planId && (
                  <span
                    style={{
                      padding: "3px 10px",
                      background: "rgba(255,255,255,0.06)",
                      color: C.muted,
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {s.planId}
                  </span>
                )}
              </div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                ينتهي: {fmtDate(s.currentPeriodEnd)}
              </div>
              {isManual && (
                <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>
                  السبب: {reason.replace(/^manual:/, "")}
                </div>
              )}
            </div>
            {isManual && s.status === "active" && (
              <button
                style={dangerBtn}
                disabled={busy}
                onClick={() => onDelete(s.id, reason)}
              >
                إلغاء المنحة
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderList({
  rows,
  onVerify,
  busy,
}: {
  rows: TelrOrderRow[];
  onVerify: (cartRef: string) => void;
  busy: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {rows.map((o) => (
        <div
          key={o.cartRef}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 14,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {statusChip(o.status, "order")}
              <span
                style={{
                  padding: "3px 10px",
                  background: "rgba(255,255,255,0.06)",
                  color: C.muted,
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {o.planId}
              </span>
            </div>
            <div
              style={{
                color: C.text,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "monospace",
                marginBottom: 3,
                wordBreak: "break-all",
              }}
              dir="ltr"
            >
              {o.cartRef}
            </div>
            <div style={{ color: C.faint, fontSize: 11 }}>أُنشئ: {fmtDate(o.createdAt)}</div>
            {o.telrTranRef && (
              <div
                style={{ color: C.faint, fontSize: 10.5, fontFamily: "monospace", marginTop: 3 }}
                dir="ltr"
              >
                Telr Ref: {o.telrTranRef}
              </div>
            )}
          </div>
          {(o.status === "pending" || o.status === "failed") && (
            <button
              style={secondaryBtn}
              disabled={busy}
              onClick={() => onVerify(o.cartRef)}
            >
              أعد التحقّق مع Telr
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
