"use client";

import Image from "next/image";
import { useState } from "react";
import type { AboutCard } from "@/lib/types";

/**
 * "A New Paradigm of Living Wisdom" (Figma "Frame 347"): heading block
 * (label → 4 → Clash 40 → 16 → Erode 16 body, 856px) → 45px → three
 * 424×583 cards, 40px padding, 1px red rule between them. Heading (Clash 28,
 * red) at the top, body (Clash 22, ink) pinned to the bottom.
 *
 * Hover (mouse) or tap (touch) reveals the card's photo behind the text and
 * turns the text cream — INSTANTLY, no fade, exactly like the client's
 * reference video (ww.mp4). Nothing is shown until the pointer is on the card.
 * On touch screens the first tap opens a card, tapping again (or another
 * card) closes it. Cards + photos are CMS-driven (about-cards).
 */
export default function Manifesto({ cards }: { cards: AboutCard[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="manifesto" className="w-full bg-cream pb-[90px] pt-[110px] md:pb-[130px] md:pt-[205px]">
      <div className="container flex flex-col items-center text-center">
        <p className="t-body text-red">Manifesto</p>
        <h2 className="t-h1 mt-1 text-ink">A New Paradigm of Living Wisdom</h2>
        <p className="t-body mt-4 max-w-[856px] text-ink">
          We use travel, scholar-led sessions, and curated knowledge experiences to unlock the philosophy, spatial
          intelligence, and living wisdom embedded in India&apos;s heritage landscapes. The scholar is the product. The
          transformation is the outcome.
        </p>
      </div>

      <div className="container mt-[45px]">
        <ul className="manifesto-grid grid grid-cols-1 md:grid-cols-3">
          {cards.map((c) => {
            const on = active === c.id;
            return (
              <li
                key={c.id}
                className={`mf-card relative flex min-h-[420px] flex-col justify-between overflow-hidden border border-red bg-cream p-8 text-center md:min-h-[583px] md:p-10 ${on ? "is-active" : ""}`}
                onClick={(e) => {
                  // mouse users get hover; clicks only toggle on touch/coarse pointers
                  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
                  e.preventDefault();
                  setActive((v) => (v === c.id ? null : c.id));
                }}
              >
                {c.image && (
                  <div className="mf-card__photo pointer-events-none absolute inset-0" aria-hidden>
                    <Image src={c.image} alt="" fill sizes="(min-width:1024px) 424px, 100vw" className="object-cover" />
                  </div>
                )}
                <h3 className="t-h2 relative">{c.title}</h3>
                <p className="t-h4 relative">{c.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
