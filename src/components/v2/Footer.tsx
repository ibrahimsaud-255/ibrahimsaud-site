import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="v2-foot">
      <div className="v2-wrap">
        <div className="v2-foot-grid">
          <nav aria-label="الخدمات">
            <a href="/brand/">البراند الشخصيّ</a>
            <a href="/systems/">نظام منوال</a>
            <a href="/video/">الفيديو</a>
            <a href="/ad-packages/">إعلانات المتاجر</a>
            <a href="/#studio">تأجير الاستوديو</a>
          </nav>
          <nav aria-label="روابط">
            <a href={site.podcast.youtube} target="_blank" rel="noopener">بودكاست سَعي</a>
            <a href="https://huroofduroos.com" target="_blank" rel="noopener">حروف ودروس</a>
            <a href="/blog/">المدوّنة</a>
            <a href={site.social.tiktok} target="_blank" rel="noopener">تيك توك</a>
          </nav>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear()} إبراهيم سعود · الرياض</span>
          <a href={`mailto:${site.email}`} style={{ direction: "ltr" }}>{site.email}</a>
        </div>
      </div>
    </footer>
  );
}
