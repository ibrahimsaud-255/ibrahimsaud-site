import Link from "next/link";
import { C, cardBox } from "@/components/huroof/theme";

/**
 * برج تحكّم إبراهيم سعود — مشغّل الموديولات.
 * ═══════════════════════════════════════════════════════════════════════════
 * مكانٌ واحد لإدارة كلّ الأعمال. كلّ شركةٍ «موديول» يفتح لوحته، وبياناته تبقى
 * في مصدرها (حروف ودروس تُنادى عبر جسر `x-system-token`). تُضاف الشركات
 * الأخرى هنا حين تجهز لوحاتها.
 */

type Module = {
  href: string;
  name: string;
  desc: string;
  emoji: string;
  accent: string;
  ready: boolean;
};

const MODULES: Module[] = [
  {
    href: "/admin/huroof",
    name: "حروف دروس",
    desc: "المشتركون، الزيارات، تفعيل الحسابات، أكواد التفعيل، والمدارس.",
    emoji: "📚",
    accent: C.gold,
    ready: true,
  },
  {
    href: "#",
    name: "إنتاج الإعلانات",
    desc: "المشاريع، الدخل، والعملاء — قريباً.",
    emoji: "🎬",
    accent: C.orange,
    ready: false,
  },
  {
    href: "#",
    name: "تطوير وتصميم المواقع",
    desc: "المشاريع والعقود — قريباً.",
    emoji: "🌐",
    accent: C.blue,
    ready: false,
  },
];

export default function AdminHub() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background: C.bg,
        padding: "48px 5vw",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
          نظام إبراهيم سعود
        </h1>
        <p style={{ color: C.muted, fontSize: 14, fontWeight: 600, marginBottom: 32 }}>
          كلّ أعمالك من مكانٍ واحد.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {MODULES.map((m) => {
            const inner = (
              <div
                style={{
                  ...cardBox,
                  height: "100%",
                  opacity: m.ready ? 1 : 0.55,
                  borderTop: `3px solid ${m.accent}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 32 }}>{m.emoji}</div>
                <div style={{ color: C.text, fontSize: 18, fontWeight: 900 }}>{m.name}</div>
                <div style={{ color: C.muted, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
                  {m.desc}
                </div>
                {!m.ready && (
                  <span style={{ color: C.faint, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                    قريباً
                  </span>
                )}
              </div>
            );
            return m.ready ? (
              <Link key={m.name} href={m.href} style={{ textDecoration: "none" }}>
                {inner}
              </Link>
            ) : (
              <div key={m.name}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
