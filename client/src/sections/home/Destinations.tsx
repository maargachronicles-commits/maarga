"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Destination } from "@/lib/types";

const GAP = 16;
const SPEED = 26; // px / second

/**
 * "Where all we take you" (Figma Frame 292). Row of 417×596 items (image
 * 417×542 → 27px → name, Clash 22), 16px gap, overflowing the page.
 *
 * Continuous left → right marquee (requestAnimationFrame, transform-only) —
 * exactly like the testimonials row; NOT tied to scroll. The list is repeated
 * so the loop is seamless. Pauses while the section is off-screen and under
 * prefers-reduced-motion. CMS-driven via /api/destinations; each item links
 * to /destinations/[id].
 */
export default function Destinations({ items }: { items: Destination[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // enough copies to always cover the viewport
  const copies = Math.max(3, Math.ceil(10 / Math.max(items.length, 1)));
  const list = Array.from({ length: copies }, () => items).flat();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || items.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const cards = Array.from(track.children) as HTMLElement[];
    const loopW = () => (cards[0].getBoundingClientRect().width + GAP) * items.length;
    let w = loopW();
    let x = -w; // start one copy to the left so cards keep entering from the left
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(section);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        x += SPEED * dt;
        if (x >= 0) x -= w;
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => { w = loopW(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  return (
    <section ref={sectionRef} id="destinations" className="w-full bg-white pb-[40px] pt-[80px] md:pt-[130px]">
      <div className="container">
        <SectionHeading label="Our destinations" title="Where all we take you" />
      </div>
      <div className="mt-10 w-full overflow-hidden">
        <div ref={trackRef} className="flex will-change-transform" style={{ gap: GAP }}>
            {list.map((d, i) => (
              <Link
                key={`${d.id}-${i}`}
                href={d.ctaUrl?.trim() || `/destinations/${d.id}`}
                className="group flex w-[min(417px,78vw)] flex-none flex-col"
                aria-label={`Destination: ${d.name}`}
              >
                <div className="relative aspect-[417/542] w-full overflow-hidden bg-ink/5">
                  {d.heroImage && (
                    <Image src={d.heroImage} alt={d.heroImageAltText || d.name} fill sizes="417px" className="object-cover" />
                  )}
                </div>
                <span className="t-h4 mt-[27px] text-ink group-hover:text-red transition-colors duration-300">{d.name}</span>
                {d.ctaText?.trim() && <span className="arrow-link mt-2 self-start text-red">{d.ctaText}</span>}
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
