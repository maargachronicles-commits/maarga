"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LinkSetting } from "@/lib/types";

/* Header links per spec; routes prepared even where pages come later. */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Destinations", href: "/destinations" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Shop", href: "/shop" },
];

/**
 * Figma "Frame 254": 1512×104, padding 24px 50px, space-between, items centred.
 * Logo block 44.7×56 (mark + 10.2px "Maarga"), links Erode 16 with 56px gap,
 * Contact Us 149×44 red.
 *
 * `onRed` — About page hero: the bar sits on the red section, so the Contact
 * button is cream with red text (Figma Frame 255 on Frame 364). The link for
 * the current page is underlined, as in the Figma.
 *
 * On phones every link, including Contact Us, lives in the ☰ menu — there is
 * no separate Contact button next to the hamburger.
 */
/** `onCream` — pages whose header sits on the cream page itself (Gallery Bank, event detail): ink links, red logo + red button. */
export default function Navbar({ contact = { text: "Contact Us", href: "/contact" }, onRed = false, onCream = false }: { contact?: LinkSetting; onRed?: boolean; onCream?: boolean }) {
  const fg = onCream ? "text-ink" : "text-cream";
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`));

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="wrap flex h-[104px] items-center justify-between px-6 lg:px-[50px]">
        <Link href="/" className="flex flex-col items-center" aria-label="Maarga home">
          <img src={onCream ? "/figma/logo-red.svg" : "/figma/logo-cream.svg"} alt="" width={45} height={45} className="h-[44.7px] w-[44.7px]" />
          <span
            className={`mt-[0.3px] ${onCream ? "text-red" : "text-cream"}`}
            style={{ fontFamily: "var(--font-clash)", fontSize: "10.2px", lineHeight: "10.2px" }}
          >
            Maarga
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-[56px]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className={`t-body ${fg} transition-opacity duration-300 hover:opacity-80 ${isCurrent(l.href) ? "underline underline-offset-[3px]" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {/* wrapper carries the breakpoint: .btn-* set display themselves (unlayered CSS beats the `hidden` utility) */}
          <div className="hidden lg:block">
            <Link href={contact.href} className={onRed ? "btn-cream-solid" : "btn-red"}>
              {contact.text}
            </Link>
          </div>
          <button
            type="button"
            className={`grid h-11 w-11 place-items-center ${fg} lg:hidden`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[104px] max-h-[calc(100svh-104px)] overflow-y-auto bg-ink/95 px-6 pb-8 pt-4 lg:hidden">
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="t-foot-link text-cream" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={contact.href} className={`${onRed ? "btn-cream-solid" : "btn-red"} mt-2`} onClick={() => setOpen(false)}>
                {contact.text}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
