import { site } from "@/lib/site";
import SocialIcons from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png"
          alt="إبراهيم سعود"
          className="h-12 w-auto"
        />

        {/* أيقونات التواصل الرسمية */}
        <SocialIcons />

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm text-cream/50">{site.bio}</p>
          <p className="text-sm text-cream/40">
            © {site.domain} — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
