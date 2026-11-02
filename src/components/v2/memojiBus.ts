// قناة صغيرة: أيّ زرّ يقدر يغيّر تعبير الإيموجي (يغمز عند الحجز مثلاً).
import type { Memoji } from "@/lib/v2";

export const MEMOJI_EVENT = "v2-memoji";
export function setMemoji(name: Memoji | null) {
  window.dispatchEvent(new CustomEvent(MEMOJI_EVENT, { detail: name }));
}
