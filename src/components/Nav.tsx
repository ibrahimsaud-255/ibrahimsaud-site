"use client";

import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/site";

const links = [
  { href: "#podcast", label: "البودكاست" },
  { href: "#studio", label: "الاستوديو" },
  { href: "#services", label: "الخدمات" },
  { href: "#works", label: "الأعمال" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/60 bg-ink/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://raw.githubusercontent.com/ibrahimsaud-255/ibrahimsaud-site/main/logo_ibrahimsaud.png"
            alt="إبراهيم سعود"
            className="h-9 w-auto"
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-cream/80 transition hover:text-gold"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={waLink("السلام عليكم، أبي أطلب فيديو إعلاني 🎬")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink transition hover:bg-gold-soft sm:inline-block"
          >
            اطلب فيديوك
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg border border-line text-cream md:hidden"
            aria-label="القائمة"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-cream/90"
              >
                {l.label}
              </a>
            ))}
            <a
              href={waLink("السلام عليكم، أبي أطلب فيديو إعلاني 🎬")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-5 py-2 text-center text-sm font-bold text-ink"
            >
              اطلب فيديوك عبر واتساب
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
