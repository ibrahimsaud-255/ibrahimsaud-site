"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthExpired,
  MIN_SEATS,
  type OrgRow,
  api,
  getToken,
  quote,
  signIn,
  signOut,
  suggestSlug,
} from "@/lib/huroofAdmin";

/**
 * مدارس «حروف ودروس» — إنشاء الحزم وبيعها.
 *
 * تعيش هنا لا في لوحة حروف ودروس: العمل كلُّه يُدار من هذه اللوحة — النظام
 * المحاسبيّ وتفاصيلُ المؤسّسة — وفصلُ إدارة المنصّة عنها يعني لوحتين لعملٍ
 * واحد. والزبائن يرون `huroofduroos.com` وحدها، ولوحةُ مديري المدارس هناك.
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

export default function HuroofSchools() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  /* تعديل مدرسةٍ قائمة — الحالة، وتمديد العقد، وحدّ الإعادة، والملاحظات. */
  const [editing, setEditing] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<OrgRow["status"]>("active");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editMaxReassigns, setEditMaxReassigns] = useState(3);
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [seats, setSeats] = useState(10);
  const [adminEmail, setAdminEmail] = useState("");
  const [city, setCity] = useState("");
  const [contractDays, setContractDays] = useState(365);
  const [seatDurationDays, setSeatDurationDays] = useState(365);
  const [maxReassigns, setMaxReassigns] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  const load = useCallback(async () => {
    try {
      const body = await api<{ organizations: OrgRow[] }>("admin/organizations");
      setOrgs(body.organizations ?? []);
      setError(null);
    } catch (e) {
      if (e instanceof AuthExpired) {
        setAuthed(false);
        return;
      }
      setError(e instanceof Error ? e.message : "تعذّر التحميل");
    }
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  const q = useMemo(() => quote(seats), [seats]);

  const canSubmit =
    name.trim().length >= 2 &&
    /^[a-z0-9-]+$/.test(slug) &&
    seats >= MIN_SEATS &&
    /.+@.+\..+/.test(adminEmail) &&
    !busy;

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

  async function create() {
    setBusy(true);
    setError(null);
    try {
      await api("admin/organizations", {
        method: "POST",
        body: {
          name: name.trim(),
          slug,
          seatsTotal: seats,
          adminEmails: [adminEmail.trim()],
          contractDays,
          seatDurationDays,
          maxReassignsPerSeat: maxReassigns,
          pricePerSeat: q.perSeat.toFixed(2),
          city: city.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      setCreating(false);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setSeats(10);
      setAdminEmail("");
      setCity("");
      setContractDays(365);
      setSeatDurationDays(365);
      setMaxReassigns(3);
      setNotes("");
      await load();
    } catch (e) {
      if (e instanceof AuthExpired) setAuthed(false);
      else setError(e instanceof Error ? e.message : "تعذّر الإنشاء");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(o: OrgRow) {
    setEditing(o.id);
    setEditStatus(o.status);
    setEditEndsAt(new Date(o.endsAt).toISOString().slice(0, 10));
    setEditMaxReassigns(o.maxReassignsPerSeat);
    setEditNotes(o.notes ?? "");
    setError(null);
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    setError(null);
    try {
      await api(`admin/organizations/${id}`, {
        method: "PATCH",
        body: {
          status: editStatus,
          endsAt: new Date(`${editEndsAt}T00:00:00Z`).toISOString(),
          maxReassignsPerSeat: editMaxReassigns,
          notes: editNotes.trim(),
        },
      });
      setEditing(null);
      await load();
    } catch (e) {
      if (e instanceof AuthExpired) setAuthed(false);
      else setError(e instanceof Error ? e.message : "تعذّر الحفظ");
    } finally {
      setSavingEdit(false);
    }
  }

  function copyLink(s: string) {
    void navigator.clipboard.writeText(`https://huroofduroos.com/school/${s}`).then(() => {
      setCopied(s);
      setTimeout(() => setCopied(null), 1800);
    });
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
            مدارس حروف ودروس
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
        padding: "36px 5vw",
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
            marginBottom: 26,
          }}
        >
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 900 }}>مدارس حروف ودروس</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={primaryBtn} onClick={() => setCreating((v) => !v)}>
              + حزمة جديدة
            </button>
            <button
              style={{
                background: "transparent",
                color: C.muted,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "11px 16px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
              onClick={() => {
                signOut();
                setAuthed(false);
              }}
            >
              خروج
            </button>
          </div>
        </div>

        {creating && (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 22,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label style={label}>اسم المدرسة</label>
                <input
                  style={field}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugTouched) setSlug(suggestSlug(e.target.value));
                  }}
                  placeholder="مدارس الرواد الأهلية"
                />
              </div>
              <div>
                <label style={label}>الرابط — huroofduroos.com/school/…</label>
                <input
                  style={field}
                  dir="ltr"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(suggestSlug(e.target.value));
                  }}
                  placeholder="alrowad-riyadh"
                />
              </div>
              <div>
                <label style={label}>عدد المقاعد (أقلّها {MIN_SEATS})</label>
                <input
                  style={field}
                  type="number"
                  dir="ltr"
                  min={MIN_SEATS}
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>
              <div>
                <label style={label}>بريد مدير المدرسة</label>
                <input
                  style={field}
                  dir="ltr"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="manager@school.edu.sa"
                />
              </div>
              <div>
                <label style={label}>المدينة</label>
                <input style={field} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label style={label}>مدّة العقد بالأيام</label>
                <input
                  style={field}
                  type="number"
                  dir="ltr"
                  value={contractDays}
                  onChange={(e) => setContractDays(Number(e.target.value) || 365)}
                />
              </div>
              <div>
                <label style={label}>مدّة اشتراك المقعد بالأيام</label>
                <input
                  style={field}
                  type="number"
                  dir="ltr"
                  min={30}
                  max={1095}
                  value={seatDurationDays}
                  onChange={(e) => setSeatDurationDays(Number(e.target.value) || 365)}
                />
                <p style={{ color: C.faint, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                  مدّة المعلّم الواحد — لا تتجاوز العقد.
                </p>
              </div>
              <div>
                <label style={label}>حدّ إعادة إسناد المقعد</label>
                <input
                  style={field}
                  type="number"
                  dir="ltr"
                  min={0}
                  max={50}
                  value={maxReassigns}
                  onChange={(e) => setMaxReassigns(Math.max(0, Number(e.target.value) || 0))}
                />
                <p style={{ color: C.faint, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                  كم مرّة يُعاد المقعد لمعلّمٍ جديد (منعُ الاستغلال).
                </p>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={label}>ملاحظات (لك وحدك)</label>
              <textarea
                style={{ ...field, minHeight: 64 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "14px 18px",
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.25)",
                borderRadius: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>
                {seats} مقعداً × {q.perSeat} ر.س
                <span style={{ color: C.gold, fontWeight: 900, marginInlineStart: 10, fontSize: 12 }}>
                  {q.label}
                </span>
              </span>
              <span style={{ color: C.text, fontWeight: 900, fontSize: 20 }}>
                {q.total.toLocaleString("ar-SA")} ر.س
              </span>
            </div>

            {seats < MIN_SEATS && (
              <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginTop: 10 }}>
                أقلّ حزمة {MIN_SEATS} مقاعد.
              </p>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                style={{ ...primaryBtn, opacity: canSubmit ? 1 : 0.45 }}
                disabled={!canSubmit}
                onClick={() => void create()}
              >
                إنشاء الحزمة
              </button>
              <button
                style={{
                  background: "transparent",
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "11px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => setCreating(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{error}</p>
        )}

        {orgs.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${C.border}`,
              borderRadius: 16,
              padding: 44,
              textAlign: "center",
              color: C.muted,
              fontWeight: 700,
            }}
          >
            لا مدارس بعد. أنشئ أوّل حزمة من الزرّ أعلاه.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orgs.map((o) => {
              const assigned = o.seatsTotal - o.emptySeats;
              const pct = o.seatsTotal > 0 ? Math.round((assigned / o.seatsTotal) * 100) : 0;
              return (
                <div
                  key={o.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ color: C.text, fontSize: 17, fontWeight: 900 }}>{o.name}</div>
                      <div style={{ color: C.faint, fontSize: 12.5, fontWeight: 700, marginTop: 3 }}>
                        {o.city ? `${o.city} · ` : ""}
                        ينتهي {new Date(o.endsAt).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 900,
                        padding: "5px 11px",
                        borderRadius: 8,
                        color: o.status === "active" ? C.green : C.red,
                        background:
                          o.status === "active" ? "rgba(0,200,83,0.12)" : "rgba(255,82,82,0.12)",
                      }}
                    >
                      {o.status === "active" ? "نشط" : o.status === "suspended" ? "موقوف" : "منتهٍ"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 15,
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      flexWrap: "wrap",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: C.text }}>
                      {o.activeSeats} نشط من {o.seatsTotal}
                    </span>
                    {o.emptySeats > 0 && (
                      <span style={{ color: C.amber, fontSize: 13 }}>
                        {o.emptySeats} لم تُسلَّم بعد
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      height: 6,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.09)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${C.gold}, ${C.orange})`,
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={`https://huroofduroos.com/school/${o.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      فتح لوحة المدرسة
                    </a>
                    <button
                      onClick={() => copyLink(o.slug)}
                      style={{
                        background: "transparent",
                        color: copied === o.slug ? C.green : C.muted,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copied === o.slug ? "نُسخ ✓" : "نسخ الرابط للمدير"}
                    </button>
                    <button
                      onClick={() => (editing === o.id ? setEditing(null) : startEdit(o))}
                      style={{
                        background: "transparent",
                        color: editing === o.id ? C.gold : C.muted,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {editing === o.id ? "إغلاق التعديل" : "تعديل"}
                    </button>
                  </div>

                  {editing === o.id && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: `1px solid ${C.border}`,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 14,
                      }}
                    >
                      <div>
                        <label style={label}>الحالة</label>
                        <select
                          style={field}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as OrgRow["status"])}
                        >
                          <option value="active">نشط</option>
                          <option value="suspended">موقوف</option>
                          <option value="expired">منتهٍ</option>
                        </select>
                      </div>
                      <div>
                        <label style={label}>ينتهي العقد في</label>
                        <input
                          style={field}
                          type="date"
                          dir="ltr"
                          value={editEndsAt}
                          onChange={(e) => setEditEndsAt(e.target.value)}
                        />
                        <p style={{ color: C.faint, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                          مدّده بعد سداد التجديد للسنة الجديدة.
                        </p>
                      </div>
                      <div>
                        <label style={label}>حدّ إعادة الإسناد</label>
                        <input
                          style={field}
                          type="number"
                          dir="ltr"
                          min={0}
                          max={50}
                          value={editMaxReassigns}
                          onChange={(e) =>
                            setEditMaxReassigns(Math.max(0, Number(e.target.value) || 0))
                          }
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={label}>ملاحظات (لك وحدك)</label>
                        <textarea
                          style={{ ...field, minHeight: 52 }}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
                        <button
                          style={{ ...primaryBtn, opacity: savingEdit ? 0.5 : 1 }}
                          disabled={savingEdit}
                          onClick={() => void saveEdit(o.id)}
                        >
                          {savingEdit ? "جارٍ الحفظ…" : "حفظ التعديل"}
                        </button>
                        <button
                          style={{
                            background: "transparent",
                            color: C.muted,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: "11px 18px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          onClick={() => setEditing(null)}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
