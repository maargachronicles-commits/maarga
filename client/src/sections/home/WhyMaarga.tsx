"use client";

import { useEffect, useRef } from "react";
import ArrowLink from "@/components/ui/ArrowLink";
import type { LinkSetting } from "@/lib/types";

const PATTERN_H = 1542; // px, natural height of pattern-side.svg (one loop)
const BAND_H = 120;     // px, height of the phone bands
const BAND_W = PATTERN_H * (BAND_H / 299); // one pattern loop, rotated
const SPEED = 48;       // px / second (was 18 — too slow to read as motion)

/**
 * Figma "Frame 245": 1512×763, fill #A62F20. Content column 675px centred,
 * 224px from the top: label (Erode 16) → 3px → heading (Clash 28) → 18px →
 * body (Erode 16/19.8, centred) → 63px → "Our experiences →" underlined link.
 * Two 299×1542 stroke patterns at 40% opacity bleed in from the sides and are
 * clipped by the section. Text is static; the patterns drift CONTINUOUSLY —
 * left one downwards, right one upwards (rAF, transform-only, not tied to
 * scroll). Each side stacks three copies so the loop is seamless.
 *
 * Below 768px there is no room beside the copy, so the same pattern runs as
 * two horizontal bands instead: one ABOVE the copy (moving left) and one
 * BELOW it (moving right). Same speed, same loop, same opacity.
 */
export default function WhyMaarga({ cta = { text: "Our experiences", href: "/experience" } }: { cta?: LinkSetting }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!section || !left || !right) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let y = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(section);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        y = (y + SPEED * dt) % PATTERN_H;
        // left: base offset −PATTERN_H so moving down never exposes a gap; right: moves up
        left.style.transform = `translate3d(0,${-PATTERN_H + y}px,0)`;
        right.style.transform = `translate3d(0,${-y}px,0)`;
        // phone bands: top band moves left, bottom band moves right
        const by = y * (BAND_W / PATTERN_H);
        if (top) top.style.transform = `translate3d(${-by}px,0,0)`;
        if (bottom) bottom.style.transform = `translate3d(${-BAND_W + by}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const Pattern = () => (
    <img src="/figma/pattern-side.svg" alt="" width={299} height={PATTERN_H} aria-hidden className="block w-[299px] max-w-none" />
  );
  /* the same pattern turned 90° for the horizontal phone bands (one loop = BAND_W px wide, 120px tall) */
  const Band = () => (
    <div style={{ position: "relative", width: BAND_W, height: BAND_H, flex: "none", overflow: "hidden" }}>
      <img
        src="/figma/pattern-side.svg"
        alt=""
        aria-hidden
        width={299}
        height={PATTERN_H}
        className="block max-w-none"
        style={{ position: "absolute", left: BAND_W, top: 0, width: BAND_H, height: BAND_W, transform: "rotate(90deg)", transformOrigin: "top left" }}
      />
    </div>
  );

  return (
    <section ref={sectionRef} id="why-maarga" className="relative w-full overflow-hidden bg-red text-white">
      <div className="wrap relative md:min-h-[763px]">
        {/* left column: 3 stacked copies, base offset −596px as in Figma, drifts DOWN */}
        <div className="pointer-events-none absolute left-[31px] top-[-596px] hidden opacity-40 md:block">
          <div ref={leftRef} className="will-change-transform">
            <Pattern /><Pattern /><Pattern />
          </div>
        </div>
        {/* right column: base offset −118px as in Figma, drifts UP */}
        <div className="pointer-events-none absolute right-[31px] top-[-118px] hidden opacity-40 md:block">
          <div ref={rightRef} className="will-change-transform">
            <Pattern /><Pattern /><Pattern />
          </div>
        </div>

        {/* phone bands: pattern above and below the copy (there is no room beside it) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] overflow-hidden opacity-40 md:hidden">
          <div ref={topRef} className="flex h-[120px] will-change-transform">
            <Band /><Band /><Band />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] overflow-hidden opacity-40 md:hidden">
          <div ref={bottomRef} className="flex h-[120px] will-change-transform">
            <Band /><Band /><Band />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[675px] flex-col items-center px-6 pb-[170px] pt-[170px] text-center md:px-0 md:pb-[187px] md:pt-[224px]">
          <p className="t-body text-cream">Why Maarga</p>
          <h2 className="t-h2 mt-[3px]">India&apos;s heritage is not a checklist. It has been sold as one.</h2>
          <div className="t-body mt-[18px] space-y-[19.8px]">
            <p>
              Most heritage travel in India optimises for coverage, more forts, more temples, more days ticked off,
              delivered by a guide reciting dates they didn&apos;t choose and can&apos;t go beyond. The depth is there. It has
              simply never been the product.
            </p>
            <p>
              Maarga is built on a different premise: that a temple layout is cosmology, that a water system is resolved
              engineering, that a frieze can be read like language, if the right person is standing beside you. We don&apos;t
              sell destinations. We give you access to the people who can make a ruin legible as a resolved idea.
            </p>
            <p>This is not a faster way to see more. It&apos;s the only way to actually understand what you&apos;re looking at.</p>
          </div>
          <ArrowLink href={cta.href} className="mt-[63px] text-white">
            {cta.text}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
