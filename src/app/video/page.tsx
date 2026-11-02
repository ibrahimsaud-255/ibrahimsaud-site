import type { Metadata } from "next";
import "@/components/v2/v2.css";
import LandingPage from "@/components/v2/LandingPage";
import { landings } from "@/lib/v2";

const d = landings.video;
export const metadata: Metadata = { ...d.meta, alternates: { canonical: "https://ibrahimsaud.com/video/" } };

export default function Page() {
  return <LandingPage d={d} />;
}
