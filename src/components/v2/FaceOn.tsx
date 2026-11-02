"use client";

// غلاف يغيّر تعبير الإيموجي لمّا الزائر يمرّ على العنصر أو يركّز عليه.
import type { Memoji } from "@/lib/v2";
import { setMemoji } from "./memojiBus";

export default function FaceOn({ face, children }: { face: Memoji; children: React.ReactNode }) {
  return (
    <span style={{ display: "contents" }}
      onMouseEnter={() => setMemoji(face)} onMouseLeave={() => setMemoji(null)}
      onFocus={() => setMemoji(face)} onBlur={() => setMemoji(null)}>
      {children}
    </span>
  );
}
