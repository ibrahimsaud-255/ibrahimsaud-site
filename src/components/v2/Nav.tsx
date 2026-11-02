"use client";

// الشريط العلويّ بأسلوب apple.com: روابط صغيرة، وقائمة منسدلة لكلّ منتج على الكمبيوتر،
// وقائمة بعرض الشاشة بخطّ كبير على الجوال.
import { useEffect, useState } from "react";
import { bookHref, navItems } from "@/lib/v2";

export default function Nav({ sticky = true }: { sticky?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("v2-menu-open", open);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className={`v2-gnav ${sticky ? "sticky" : ""} ${open ? "open" : ""}`}>
      <div className="v2-gnav-in">
        <a href="/" className="logo" aria-label="إبراهيم سعود — الرئيسيّة">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/ibrahim-saud-logo-black-tight.png" alt="إبراهيم سعود" />
        </a>
        <ul className="items">
          {navItems.map((it) => (
            <li key={it.label} className={it.menu ? "has-menu" : ""}>
              <a href={it.href}>{it.label}</a>
              {it.menu && (
                <div className="fly">
                  <div className="fly-in">
                    {it.menu.map((col) => (
                      <div key={col.title} className={col.big ? "col big" : "col"}>
                        <span className="h">{col.title}</span>
                        {col.links.map((l) => <a key={l.label + l.href} href={l.href}>{l.label}</a>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <a className="book" href={bookHref} target="_blank" rel="noopener">احجز مكالمة</a>
        <button type="button" className="burger" aria-label={open ? "إغلاق القائمة" : "القائمة"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
      <nav className="v2-mmenu" aria-label="القائمة" hidden={!open}>
        {navItems.map((it) => <a key={it.label} href={it.href} onClick={() => setOpen(false)}>{it.label}</a>)}
        <a href={bookHref} target="_blank" rel="noopener" className="small">احجز مكالمة ٢٠ دقيقة</a>
      </nav>
    </header>
  );
}
