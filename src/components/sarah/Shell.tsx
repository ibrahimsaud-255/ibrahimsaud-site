"use client";

// الهيكل العام لمتجر «إبرة سارة»: الإشعار المؤقت + شريط التنقّل + التذييل + زر واتساب.

import Link from "next/link";
import { useState } from "react";
import { sarah, waLink } from "@/lib/sarah";

const navLinks = [
  { href: "/sarah", label: "الرئيسية" },
  { href: "/sarah#products", label: "المنتجات" },
  { href: "/sarah/sizes", label: "المقاسات" },
  { href: "/sarah#fabrics", label: "الخامات" },
  { href: "/sarah#shipping", label: "الشحن" },
  { href: "/sarah/order", label: "اطلبي الآن" },
];

export function Notice() {
  const [open, setOpen] = useState(true);
  if (!sarah.notice || !open) return null;
  return (
    <div className="relative z-50 bg-espresso px-4 py-2 text-center text-[13px] leading-relaxed text-sand">
      <span className="font-bold text-blush">{sarah.name}:</span> {sarah.notice}
      <button
        onClick={() => setOpen(false)}
        aria-label="إغلاق الإشعار"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sand/60 transition hover:text-sand"
      >
        ✕
      </button>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ecru/80 bg-sand/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/sarah" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-clay text-base text-white">
            🪡
          </span>
          <span className="leading-tight">
            <span className="block text-base font-black text-espresso">{sarah.name}</span>
            <span className="block text-[11px] text-cocoa">{sarah.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.slice(0, -1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-cocoa transition hover:bg-sand-deep hover:text-espresso"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/sarah/order"
            className="mr-2 rounded-full bg-clay px-5 py-2.5 text-sm font-bold text-white transition hover:bg-clay-deep"
          >
            اطلبي الآن
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
          className="rounded-full border border-ecru p-2 text-espresso md:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open ? (
        <nav className="border-t border-ecru bg-sand px-5 py-3 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-espresso transition hover:bg-sand-deep"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ecru bg-sand-deep/60 px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="text-lg font-black text-espresso">{sarah.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-cocoa">{sarah.intro}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-espresso">روابط</p>
          <ul className="mt-3 space-y-2 text-sm text-cocoa">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-clay">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-espresso">التواصل</p>
          <ul className="mt-3 space-y-2 text-sm text-cocoa">
            <li>
              <a
                href={waLink(`السلام عليكم ${sarah.name} 🌸`)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-clay"
              >
                واتساب المتجر
              </a>
            </li>
            <li>أوقات العمل: {sarah.workHours}</li>
            <li>المقر: {sarah.city} — والشحن لكل مناطق المملكة</li>
            {sarah.instagram ? (
              <li>
                <a
                  href={sarah.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-clay"
                >
                  إنستقرام
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-ecru pt-6 text-center text-xs text-cocoa/70">
        © {new Date().getFullYear()} {sarah.name} — جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={waLink(`السلام عليكم ${sarah.name} 🌸\nأبغى أستفسر عن:`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-espresso/25 transition hover:scale-110"
    >
      <svg viewBox="0 0 32 32" className="size-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 .004 7.17.004 16c0 3.49 1.12 6.73 3.03 9.36L1.05 31.5l6.31-2.02A15.9 15.9 0 0 0 16.004 32C24.83 32 32 24.83 32 16S24.83 0 16.004 0zm9.32 22.6c-.39 1.1-1.94 2.01-3.17 2.28-.84.18-1.94.32-5.64-1.21-4.73-1.96-7.78-6.77-8.02-7.08-.23-.31-1.92-2.56-1.92-4.88s1.22-3.46 1.65-3.93c.36-.39.94-.57 1.5-.57.18 0 .35.01.5.02.43.02.65.04.94.73.36.85 1.23 2.96 1.34 3.18.11.22.18.48.04.79-.13.31-.2.5-.4.77-.2.27-.42.6-.6.8-.2.22-.4.46-.18.86.23.39 1.02 1.68 2.19 2.72 1.51 1.34 2.78 1.76 3.22 1.94.33.14.72.11.96-.15.31-.33.69-.88 1.08-1.42.27-.39.62-.44.99-.31.38.13 2.4 1.13 2.81 1.34.41.2.69.31.79.48.1.18.1 1.02-.29 2.12z" />
      </svg>
    </a>
  );
}
