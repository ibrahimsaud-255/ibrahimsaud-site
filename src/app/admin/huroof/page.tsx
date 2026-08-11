"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AuthExpired,
  type ExtendedStats,
  type GrantResult,
  type ActivationCode,
  getExtendedStats,
  grantByEmail,
  generateCodes,
  listCodes,
} from "@/lib/huroofAdmin";
import { HuroofGate, useHuroofExpired } from "@/components/huroof/HuroofGate";
import { C, field, label, primaryBtn, cardBox } from "@/components/huroof/theme";

const HUROOF = "https://huroofduroos.com";
const ar = (n: number) => n.toLocaleString("ar-SA");

/* أقسام لوحة حروف ودروس الكاملة — تُفتح في نطاقها (لم تُنقل كلّها بعد). */
const SECTIONS: { path: string; label: string }[] = [
  { path: "/admin", label: "النظرة العامة" },
  { path: "/admin/questions", label: "إدارة الأسئلة" },
  { path: "/admin/subscribers", label: "المشتركون" },
  { path: "/admin/teacher-questions", label: "أسئلة المعلمين" },
  { path: "/admin/pdf-library", label: "مكتبة PDF" },
  { path: "/admin/content", label: "المحتوى" },
  { path: "/admin/teachers", label: "المعلمون" },
  { path: "/admin/tickets", label: "خدمة العملاء" },
  { path: "/admin/settings", label: "الإعدادات" },
];

function Tile({
  value,
  label: lbl,
  accent = C.gold,
  hint,
}: {
  value: string;
  label: string;
  accent?: string;
  hint?: string;
}) {
  return (
    <div style={{ ...cardBox, padding: 18 }}>
      <div style={{ color: accent, fontSize: 26, fontWeight: 900 }}>{value}</div>
      <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{lbl}</div>
      {hint && (
        <div style={{ color: C.faint, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{hint}</div>
      )}
    </div>
  );
}

function ModuleBody() {
  const onExpired = useHuroofExpired();

  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);

  /* تفعيل بالإيميل */
  const [email, setEmail] = useState("");
  const [months, setMonths] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* أكواد التفعيل */
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [genCount, setGenCount] = useState("10");
  const [genMonths, setGenMonths] = useState("12");
  const [genNote, setGenNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [freshCodes, setFreshCodes] = useState<string[]>([]);
  const [codesErr, setCodesErr] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getExtendedStats());
      setStatsErr(null);
    } catch (e) {
      if (e instanceof AuthExpired) return onExpired();
      setStatsErr(e instanceof Error ? e.message : "تعذّر تحميل المؤشرات");
    }
  }, [onExpired]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const canGrant = /.+@.+\..+/.test(email) && !granting;

  async function doGrant() {
    setGranting(true);
    setGrantMsg(null);
    try {
      const m = months.trim() ? Math.max(1, Number(months)) : undefined;
      const r: GrantResult = await grantByEmail(email, m);
      setGrantMsg({
        ok: true,
        text: `✓ فُعّل حساب ${r.name ?? r.email}${
          r.currentPeriodEnd
            ? ` حتى ${new Date(r.currentPeriodEnd).toLocaleDateString("ar-SA")}`
            : " (دائم حتى الإلغاء)"
        }`,
      });
      setEmail("");
      setMonths("");
      void loadStats();
    } catch (e) {
      if (e instanceof AuthExpired) return onExpired();
      setGrantMsg({ ok: false, text: e instanceof Error ? e.message : "تعذّر التفعيل" });
    } finally {
      setGranting(false);
    }
  }

  const loadCodes = useCallback(async () => {
    try {
      const r = await listCodes();
      setCodes(r.codes);
      setCodesErr(null);
    } catch (e) {
      if (e instanceof AuthExpired) return onExpired();
      setCodesErr(e instanceof Error ? e.message : "تعذّر تحميل الأكواد");
    }
  }, [onExpired]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  async function doGenerate() {
    const count = Math.max(1, Math.min(100, Number(genCount) || 0));
    if (!count) return;
    setGenerating(true);
    setFreshCodes([]);
    try {
      const m = genMonths.trim() ? Math.max(1, Number(genMonths)) : undefined;
      const r = await generateCodes(count, m, genNote.trim() || undefined);
      setFreshCodes(r.codes);
      void loadCodes();
    } catch (e) {
      if (e instanceof AuthExpired) return onExpired();
      setCodesErr(e instanceof Error ? e.message : "تعذّر التوليد");
    } finally {
      setGenerating(false);
    }
  }

  const unusedCount = codes.filter((c) => c.status === "unused").length;
  const newThisMonth = stats?.recentRegistrations.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ─── المؤشّرات ─── */}
      <section>
        <h2 style={{ color: C.muted, fontSize: 13, fontWeight: 900, marginBottom: 12 }}>
          مؤشّرات المنصّة
        </h2>
        {statsErr ? (
          <div style={{ ...cardBox, color: C.red, fontWeight: 700, fontSize: 13 }}>{statsErr}</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <Tile
              value={stats ? ar(stats.activeSubscribers) : "…"}
              label="مشترك نشط"
              accent={C.green}
            />
            <Tile value={stats ? ar(stats.totalTeachers) : "…"} label="معلّم مسجّل" />
            <Tile
              value={stats ? ar(newThisMonth) : "…"}
              label="تسجيل جديد"
              hint="آخر ٣٠ يوماً"
              accent={C.blue}
            />
            <Tile
              value={stats ? ar(stats.pendingTeacherQuestions) : "…"}
              label="سؤال معلّم بانتظار المراجعة"
              accent={stats && stats.pendingTeacherQuestions > 0 ? C.amber : C.gold}
            />
            <Tile value="—" label="زيارات الموقع" hint="قريباً — تحليلات" accent={C.faint} />
          </div>
        )}
      </section>

      {/* ─── تفعيل بالإيميل ─── */}
      <section style={cardBox}>
        <h2 style={{ color: C.text, fontSize: 15, fontWeight: 900, marginBottom: 4 }}>
          تفعيل حساب بالبريد
        </h2>
        <p style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          يمنح المنصّة لبريدٍ <strong>سجّل دخوله مسبقاً</strong>. لمن لم يسجّل بعد،
          استعمل أكواد التفعيل أدناه.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr auto",
            gap: 12,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={label}>بريد المستخدم</label>
            <input
              style={field}
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              onKeyDown={(e) => e.key === "Enter" && canGrant && void doGrant()}
            />
          </div>
          <div>
            <label style={label}>الأشهر (فارغ = دائم)</label>
            <input
              style={field}
              type="number"
              dir="ltr"
              min={1}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="∞"
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: canGrant ? 1 : 0.45 }}
            disabled={!canGrant}
            onClick={() => void doGrant()}
          >
            {granting ? "جارٍ…" : "تفعيل"}
          </button>
        </div>
        {grantMsg && (
          <p
            style={{
              color: grantMsg.ok ? C.green : C.red,
              fontSize: 13,
              fontWeight: 700,
              marginTop: 14,
            }}
          >
            {grantMsg.text}
          </p>
        )}
      </section>

      {/* ─── أكواد التفعيل ─── */}
      <section style={cardBox}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2 style={{ color: C.text, fontSize: 15, fontWeight: 900 }}>
            أكواد التفعيل — مرّة واحدة
          </h2>
          <span style={{ color: C.muted, fontSize: 12, fontWeight: 700 }}>
            {ar(unusedCount)} متاح · {ar(codes.length)} إجمالاً
          </span>
        </div>
        <p style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, margin: "4px 0 16px" }}>
          كودٌ يفعّله المستخدم مرّةً واحدة على المنصّة. مناسبٌ لمن لم يسجّل بعد.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto 1.5fr auto",
            gap: 12,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 90 }}>
            <label style={label}>العدد</label>
            <input
              style={field}
              type="number"
              dir="ltr"
              min={1}
              max={100}
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={label}>الأشهر (فارغ=دائم)</label>
            <input
              style={field}
              type="number"
              dir="ltr"
              min={1}
              value={genMonths}
              onChange={(e) => setGenMonths(e.target.value)}
              placeholder="∞"
            />
          </div>
          <div>
            <label style={label}>ملاحظة (اختياري)</label>
            <input
              style={field}
              value={genNote}
              onChange={(e) => setGenNote(e.target.value)}
              placeholder="مثال: معرض التعليم"
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: generating ? 0.5 : 1 }}
            disabled={generating}
            onClick={() => void doGenerate()}
          >
            {generating ? "جارٍ…" : "توليد"}
          </button>
        </div>

        {codesErr && (
          <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginTop: 12 }}>{codesErr}</p>
        )}

        {freshCodes.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "rgba(0,200,83,0.08)",
              border: "1px solid rgba(0,200,83,0.25)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ color: C.green, fontWeight: 800, fontSize: 13 }}>
                ✓ تولّد {ar(freshCodes.length)} كوداً — انسخها الآن
              </span>
              <button
                style={{ ...primaryBtn, padding: "6px 14px", fontSize: 12 }}
                onClick={() => void navigator.clipboard.writeText(freshCodes.join("\n"))}
              >
                نسخ الكل
              </button>
            </div>
            <div
              style={{
                fontFamily: "monospace",
                color: C.text,
                fontSize: 13,
                lineHeight: 1.9,
                direction: "ltr",
                textAlign: "left",
                maxHeight: 160,
                overflowY: "auto",
              }}
            >
              {freshCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
          </div>
        )}

        {codes.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 220, overflowY: "auto" }}>
            {codes.slice(0, 100).map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    color: c.status === "unused" ? C.text : C.faint,
                    fontSize: 13,
                    direction: "ltr",
                    textDecoration: c.status === "redeemed" ? "line-through" : "none",
                  }}
                >
                  {c.code}
                </span>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: C.faint, fontSize: 11.5, fontWeight: 700 }}>
                    {c.months ? `${ar(c.months)} شهر` : "دائم"}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      padding: "3px 9px",
                      borderRadius: 7,
                      color: c.status === "unused" ? C.green : C.faint,
                      background:
                        c.status === "unused" ? "rgba(0,200,83,0.12)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {c.status === "unused" ? "متاح" : "مستخدَم"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── إدارة حروف ودروس ─── */}
      <section>
        <h2 style={{ color: C.muted, fontSize: 13, fontWeight: 900, marginBottom: 12 }}>
          إدارة حروف ودروس
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/admin/huroof-schools"
            style={{
              ...cardBox,
              padding: "12px 18px",
              color: C.text,
              fontWeight: 800,
              fontSize: 13.5,
              textDecoration: "none",
            }}
          >
            🏫 لوحة المدارس (المقاعد)
          </Link>
          {SECTIONS.map((s) => (
            <a
              key={s.path}
              href={`${HUROOF}${s.path}`}
              target="_blank"
              rel="noreferrer"
              style={{
                ...cardBox,
                padding: "12px 18px",
                color: C.muted,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              {s.label} ↗
            </a>
          ))}
        </div>
        <p style={{ color: C.faint, fontSize: 11.5, fontWeight: 600, marginTop: 10 }}>
          الأقسام المعلَّمة بـ↗ تُفتح في لوحة حروف ودروس؛ تُنقل الأكثر استعمالاً إلى هنا تدريجياً.
        </p>
      </section>
    </div>
  );
}

export default function HuroofModule() {
  return (
    <HuroofGate title="حروف دروس">
      <ModuleBody />
    </HuroofGate>
  );
}
