import type React from "react";

/**
 * سِمة لوحة حروف ودروس داخل نظام إبراهيم — لونٌ واحد لكلّ الموديولات.
 * مطابقة للألوان المستعملة في لوحة المدارس، فتبدو الأقسام نظاماً واحداً.
 */
export const C = {
  bg: "#0D0D2B",
  card: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.11)",
  gold: "#FFD700",
  orange: "#FF6D00",
  green: "#00C853",
  amber: "#FFB300",
  red: "#FF5252",
  blue: "#1CB0F6",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.38)",
} as const;

export const field: React.CSSProperties = {
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

export const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: C.muted,
  marginBottom: 6,
};

export const primaryBtn: React.CSSProperties = {
  background: C.gold,
  color: C.bg,
  border: "none",
  borderRadius: 10,
  padding: "11px 22px",
  fontWeight: 900,
  fontSize: 14,
  cursor: "pointer",
};

export const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: C.muted,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "11px 16px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

export const cardBox: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: 20,
};
