"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { getToken, signIn, signOut } from "@/lib/huroofAdmin";
import { C, field, label, primaryBtn, ghostBtn } from "./theme";

/**
 * بوّابةُ دخول موحّدة لموديولات حروف ودروس داخل نظام إبراهيم.
 * ═══════════════════════════════════════════════════════════════════════════
 * تغلّف محتوى الموديول: إن لم يوجد رمزُ جلسة تعرض نموذج الدخول، وإلا تعرض
 * المحتوى مع شريطٍ علويّ فيه العنوان والخروج. وتوفّر `onExpired` عبر سياقٍ
 * كي يُعيد أيُّ نداءٍ فشل بـ‎401‎ عرضَ الدخول بدل رسالة خطأ.
 */

const ExpiredContext = createContext<() => void>(() => {});
/** يستدعيه الموديول عند التقاط `AuthExpired` من نداءٍ للـAPI. */
export function useHuroofExpired() {
  return useContext(ExpiredContext);
}

export function HuroofGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setAuthed(Boolean(getToken())), []);

  const onExpired = useCallback(() => setAuthed(false), []);

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

  if (authed === null) return null;

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
            {title}
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

  return (
    <ExpiredContext.Provider value={onExpired}>
      <div
        dir="rtl"
        style={{
          minHeight: "100dvh",
          background: C.bg,
          padding: "28px 5vw 48px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/admin" style={{ ...ghostBtn, textDecoration: "none", padding: "8px 14px" }}>
                ← الرئيسية
              </Link>
              <h1 style={{ color: C.text, fontSize: 22, fontWeight: 900 }}>{title}</h1>
            </div>
            <button
              style={ghostBtn}
              onClick={() => {
                signOut();
                setAuthed(false);
              }}
            >
              خروج
            </button>
          </div>
          {children}
        </div>
      </div>
    </ExpiredContext.Provider>
  );
}
