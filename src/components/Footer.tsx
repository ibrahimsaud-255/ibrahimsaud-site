import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-lg font-extrabold">
          إبراهيم <span className="gold-text">سعود</span>
        </p>
        <p className="text-sm text-cream/50">{site.bio}</p>
        <p className="text-sm text-cream/40">
          © {site.domain} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
