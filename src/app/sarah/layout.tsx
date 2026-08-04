import type { Metadata } from "next";
import { Footer, Notice, Nav, WhatsAppFab } from "@/components/sarah/Shell";
import { sarah } from "@/lib/sarah";

export const metadata: Metadata = {
  title: {
    default: `${sarah.name} — ${sarah.tagline}`,
    template: `%s | ${sarah.name}`,
  },
  description:
    "متجر إبرة سارة للخياطة والتفصيل النسائي: عبايات وفساتين وجلابيات مفصّلة بمقاسات عالمية معتمدة أو على مقاسك، خامات مختارة، وشحن لجميع مناطق المملكة. الطلب عبر واتساب والدفع بتحويل بنكي.",
  keywords: [
    "إبرة سارة",
    "خياطة نسائية",
    "تفصيل عبايات",
    "فساتين تفصيل",
    "خياطة الرياض",
    "مقاسات عالمية",
    "جلابيات",
    "قفطان",
  ],
  openGraph: {
    title: `${sarah.name} — ${sarah.tagline}`,
    description:
      "عبايات وفساتين وجلابيات مفصّلة على مقاسك بمقاسات عالمية معتمدة — شحن لكل مناطق المملكة.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function SarahLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sarah-scope">
      <Notice />
      <Nav />
      {children}
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
