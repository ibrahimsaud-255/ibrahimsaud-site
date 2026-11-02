import { bookHref } from "@/lib/v2";
import FaceOn from "./FaceOn";

export default function Nav() {
  return (
    <header className="v2-nav">
      <div className="v2-wrap v2-nav-in">
        <a href="/" aria-label="إبراهيم سعود — الرئيسيّة">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/ibrahim-saud-logo-black-tight.png" alt="إبراهيم سعود" style={{ height: 30, width: "auto", display: "block" }} />
        </a>
        <nav className="v2-nav-links" aria-label="الأقسام">
          <a href="/brand/">البراند الشخصيّ</a>
          <a href="/systems/">نظام منوال</a>
          <a href="/video/">الفيديو</a>
          <a href="/#works">الأعمال</a>
          <a href="/#studio">الاستوديو</a>
        </nav>
        <FaceOn face="wink"><a className="v2-btn v2-btn-primary" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a></FaceOn>
      </div>
    </header>
  );
}
