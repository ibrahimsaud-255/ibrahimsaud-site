"use client";

// الهيكل العام لمتجر «إبرة سارة»: الإشعار المؤقت + شريط التنقّل + التذييل + زر واتساب.

import Link from "next/link";
import { useState } from "react";
import { sarah, waLink } from "@/lib/sarah";
import { IconClose, IconMenu, IconNeedle, IconWhatsApp } from "./icons";

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
        <IconClose className="size-4" />
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
          <span className="flex size-9 items-center justify-center rounded-full bg-clay text-white">
            <IconNeedle className="size-5" />
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
          {open ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}
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
                href={waLink(`السلام عليكم ${sarah.name}،`)}
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
      href={waLink(`السلام عليكم ${sarah.name}،\nأبغى أستفسر عن:`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-espresso/25 transition hover:scale-110"
    >
      <IconWhatsApp className="size-7 text-white" />
    </a>
  );
}
