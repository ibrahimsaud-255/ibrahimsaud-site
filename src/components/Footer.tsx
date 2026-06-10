import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png"
          alt="إبراهيم سعود"
          className="h-10 w-auto"
        />
        <p className="text-sm text-cream/50">{site.bio}</p>
        <p className="text-sm text-cream/40">
          © {site.domain} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
