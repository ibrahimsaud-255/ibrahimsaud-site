import type { Metadata } from "next";
import { share } from "@/lib/share";
import "@/components/v2/v2.css";
import ProductPage from "@/components/v2/ProductPage";
import { products } from "@/lib/v2";

const p = products.video;
export const metadata: Metadata = { ...p.meta, ...share(p.meta, "/video/"), alternates: { canonical: "https://ibrahimsaud.com/video/" } };

export default function Page() {
  return <ProductPage p={p} />;
}
