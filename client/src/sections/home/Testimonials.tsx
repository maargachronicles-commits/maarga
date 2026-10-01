"use client";

import { useEffect, useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/lib/types";

const CARD_W = 844;
const GAP = 24;
const SPEED = 28; // px / second

/**
 * "What Our Travellers Say" (Figma Frame 311). Cards 844×313, white, 1px red
 * border, content inset 70/50, quote mark 30×31 → 8px → quote (Erode 16) →
 * 25px → name (Clash 22) + role (Erode 16). Red pattern (847×85) along the
 * bottom, clipped.
 *
 * Continuous left→right marquee (requestAnimationFrame, transform-only).
 * Every frame each card's centre is compared with window.innerWidth/2; the
 * closest card gets data-active → prominent/glowing border + full-strength
 * pattern; the others stay light. No card is hardcoded as active.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // duplicate so the loop is seamless (min 3 copies for narrow lists)
  const copies = Math.max(3, Math.ceil(12 / Math.max(items.length, 1)));
  const list = Array.from({ length: copies }, () => items).flat();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = Array.from(track.children) as HTMLElement[];
    const setW = () => (cards[0].getBoundingClientRect().width + GAP) * items.length; // width of one copy
    let loopW = setW();
    // start with a full copy already to the left so cards keep entering from the left while moving right
    let x = -loopW;
    let last = performance.now();
    let raf = 0;

    const centre = () => {
      const mid = window.innerWidth / 2;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        if (r.right < 0 || r.left > window.innerWidth) continue;
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) { bestD = d; best = c; }
      }
      for (const c of cards) {
        const on = c === best;
        if ((c.dataset.active === "true") !== on) c.dataset.active = on ? "true" : "false";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) {
        x += SPEED * dt; // move left → right
        if (x >= 0) x -= loopW;
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
      centre();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => { loopW = setW(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  return (
    <section id="testimonials" className="w-full overflow-hidden bg-white pt-[80px] md:pt-[130px]">
      <div className="container">
        <SectionHeading label="Testimonial" title="What Our Travellers Say" />
      </div>

      <div className="mt-6 w-full overflow-hidden">
        <div ref={trackRef} className="flex will-change-transform" style={{ gap: GAP }}>
          {list.map((t, i) => (
            <figure
              key={`${t.id}-${i}`}
              data-active="false"
              className="testimonial-card relative min-h-[313px] flex-none overflow-hidden border border-red/35 bg-white transition-[border-color,box-shadow] duration-500"
              style={{ width: `min(${CARD_W}px, calc(100vw - 48px))` }}
            >
              <div className="relative px-6 pb-[72px] pt-[50px] md:px-[70px]">
                <img src="/figma/quote.svg" alt="" aria-hidden width={30} height={31} />
                <blockquote className="t-body mt-2 text-ink">{t.quote}</blockquote>
                <figcaption className="mt-[25px]">
                  <p className="t-h4 text-ink">{t.travellerName}</p>
                  {t.role && <p className="t-body mt-[2px] text-ink">{t.role}</p>}
                  {t.ctaText?.trim() && t.ctaUrl?.trim() && (
                    <a href={t.ctaUrl} className="arrow-link mt-3 text-red">{t.ctaText}</a>
                  )}
                </figcaption>
              </div>
              <img
                src="/figma/pattern-testimonial.svg"
                alt=""
                aria-hidden
                width={847}
                height={85}
                className="testimonial-pattern pointer-events-none absolute bottom-[-42px] left-[-1px] w-[847px] max-w-none opacity-25 transition-opacity duration-500"
              />
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        .testimonial-card[data-active="true"] { border-color: #a62f20; box-shadow: 0 0 0 1px #a62f20, 0 0 24px rgba(166,47,32,.25); }
        .testimonial-card[data-active="true"] .testimonial-pattern { opacity: 1; }
      `}</style>
    </section>
  );
}
