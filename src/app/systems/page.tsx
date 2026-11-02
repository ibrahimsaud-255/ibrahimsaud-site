import type { Metadata } from "next";
import "@/components/v2/v2.css";
import ProductPage from "@/components/v2/ProductPage";
import { products } from "@/lib/v2";

const p = products.systems;
export const metadata: Metadata = { ...p.meta, alternates: { canonical: "https://ibrahimsaud.com/systems/" } };

export default function Page() {
  return <ProductPage p={p} />;
}
