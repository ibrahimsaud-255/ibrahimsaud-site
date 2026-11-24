// الفوتر بأسلوب apple.com: ملاحظات صغيرة، ثمّ دليل الموقع بأعمدة، ثمّ الحقوق.
import { site } from "@/lib/site";
import { bookHref, waHref } from "@/lib/v2";

const cols: { title: string; links: { label: string; href: string; ext?: boolean }[] }[] = [
  { title: "استكشف", links: [{ label: "صناعة المحتوى", href: "/content/" }, { label: "برنامج بث الدروس العلمية", href: "/lessons-broadcast/" }, { label: "نظام الجمعيات الشبابية", href: "/systems/charities/" }, { label: "التطبيق للطلاب", href: "/systems/charities/#jawwali" }, { label: "جرّب نظام الجمعيات", href: "/systems/charities/#try" }, { label: "الذكاء الاصطناعي", href: "/ai/" }, { label: "الاستوديو", href: "/video/" }] },
  { title: "اطلب", links: [{ label: "مكالمة تعارف مجّانيّة", href: bookHref, ext: true }, { label: "إعلانات المتاجر", href: "/ad-packages/" }, { label: "المتجر", href: "/shop/" }, { label: "حسابي — حمّل مشترياتك", href: "/account/" }] },
  { title: "عن إبراهيم", links: [{ label: "حروف ودروس", href: "https://huroofduroos.com", ext: true }, { label: "بودكاست سَعي", href: site.podcast.youtube, ext: true }, { label: "المدوّنة", href: "/blog/" }, { label: "تيك توك", href: site.social.tiktok, ext: true }] },
  { title: "تواصل", links: [{ label: "احجز مكالمة", href: bookHref, ext: true }, { label: "واتساب", href: waHref(), ext: true }, { label: "البريد", href: `mailto:${site.email}` }] },
];

export default function Footer() {
  return (
    <footer className="v2-foot">
      <div className="v2-wrap">
        <div className="notes">
          <p>١. المكالمة الأولى مجّانيّة ومدّتها ٢٠ دقيقة، أونلاين أو في الاستوديو بالرياض.</p>
          <p>٢. الأسعار بالريال السعوديّ. نرسل عرض سعر أوّلاً، ثمّ يُدفع نصف المبلغ عند البداية والنصف الثاني عند التسليم، بفاتورة رسميّة.</p>
          <p>٣. الفيديو والتصاميم تُسلَّم على Google Drive. المواقع والأنظمة تُبنى على حساب GitHub وقاعدة بيانات باسم الجهة، والكود ملكها.</p>
          <p>٤. نسخ العرض تحفظ ما تكتبه فيها داخل متصفّحك فقط، ولا ترسل شيئاً لأيّ خادم.</p>
        </div>
        <div className="dir">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <span className="h">{c.title}</span>
              {c.links.map((l) => <a key={l.label} href={l.href} {...(l.ext ? { target: "_blank", rel: "noopener" } : {})}>{l.label}</a>)}
            </nav>
          ))}
        </div>
        <div className="copy">
          <span>حقوق النشر © {new Date().getFullYear()} إبراهيم سعود. جميع الحقوق محفوظة.</span>
          <span className="loc">الرياض، المملكة العربيّة السعوديّة</span>
        </div>
      </div>
    </footer>
  );
}
