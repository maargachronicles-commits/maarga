"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MAP_FIGURES, ROW_ORDER, MAP_ASPECT, MAP_VIEWBOX, toMapPct, threadPath } from "./mapFigures";

/** Scale of a figure while standing on the map (Figma map figures ≈ 0.55× row size). */
const MAP_SCALE = 0.55;
/** Space kept under the figure row when the stage has scrolled up (px). */
const ROW_MARGIN = 110;

/**
 * "The Thread and the Pearls" (Figma Frame 362) + "Led by Those Who Have
 * Earned It" heading and figure row (Frame 361, top part).
 *
 * Scroll-scrubbed & reversible (global rule): the stage is pinned and a paused
 * GSAP timeline is driven by ScrollTrigger{scrub:true}. progress:
 *   0.00–0.20  figures lift off the map (y −20, scale → 1.15, faint shadow)
 *   0.20–0.90  travel map anchor → row slot along a gentle arc
 *   0.90–1.00  settle into the row
 *   0.55–1.00  the pinned stage itself slides up (inner wrapper, transform)
 *              so when the figures land the heading AND the full row are on
 *              screen with room to spare (ROW_MARGIN).
 * Stop = freeze, scroll up = exact reverse. Transform-only.
 *
 * Positions are measured at runtime (getBoundingClientRect) so the motion
 * stays correct at any viewport width.
 */
export default function ThreadAndPearls() {
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    const map = mapRef.current;
    const row = rowRef.current;
    if (!stage || !inner || !map || !row) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const figures = Array.from(stage.querySelectorAll<HTMLElement>("[data-figure]"));
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      const build = () => {
        tl.clear();
        gsap.set(inner, { y: 0 }); // measure with the stage un-shifted
        const stageBox = inner.getBoundingClientRect();
        figures.forEach((fig, i) => {
          const id = fig.dataset.figure!;
          const from = map.querySelector<HTMLElement>(`[data-map-anchor="${id}"]`)!.getBoundingClientRect();
          const to = row.querySelector<HTMLElement>(`[data-row-slot="${id}"]`)!.getBoundingClientRect();
          const w = fig.offsetWidth;
          const h = fig.offsetHeight;

          // anchor = feet (bottom-centre) on the map; slot = row box (same size as fig)
          const startX = from.left - stageBox.left + from.width / 2 - w / 2;
          const startY = from.top - stageBox.top + from.height - h; // scaled figure's feet on the anchor
          const endX = to.left - stageBox.left;
          const endY = to.top - stageBox.top;

          gsap.set(fig, { x: startX, y: startY, scale: MAP_SCALE, transformOrigin: "50% 100%" });

          if (reduce) {
            gsap.set(fig, { x: endX, y: endY, scale: 1 });
            return;
          }

          const stagger = i * 0.012; // slight cascade so the row assembles left → right
          // 1. emerge
          tl.to(fig, { y: startY - 20, scale: MAP_SCALE * 1.15, filter: "drop-shadow(0 6px 6px rgba(39,39,39,.18))", duration: 0.2 }, stagger);
          // 2. travel (arc via two-stage y easing)
          const midX = startX + (endX - startX) * 0.5;
          const midY = Math.min(startY - 20, endY) - 40;
          tl.to(fig, { x: midX, y: midY, scale: 1.1, duration: 0.35, ease: "power1.in" }, 0.2 + stagger);
          tl.to(fig, { x: endX, y: endY + 6, scale: 1.02, duration: 0.35, ease: "power1.out" }, 0.55 + stagger);
          // 3. settle
          tl.to(fig, { y: endY, scale: 1, filter: "drop-shadow(0 0 0 rgba(39,39,39,0))", duration: 0.1 }, 0.9 + stagger);
        });

        // From ~55% of the scrub the pinned stage itself scrolls up (inner
        // wrapper, transform) so that when the figures land the "Led by…"
        // heading AND the whole row sit comfortably inside the viewport
        // (row bottom ≥ ROW_MARGIN px above the fold). Reversible.
        const rowBottom = row.offsetTop + row.offsetHeight;
        const slide = Math.max(0, rowBottom - (window.innerHeight - ROW_MARGIN));
        // The slide moves the content up INSIDE the stage, which would leave
        // `slide` px of empty space under the row once the pin releases (the
        // big gap before the profile cards). Pull the following content up by
        // the same amount so the row → profiles gap is the designed 50px.
        if (afterRef.current) afterRef.current.style.marginTop = slide > 0 && !reduce ? `-${slide}px` : "0px";
        if (slide > 0 && !reduce) {
          const endT = tl.duration();
          tl.to(inner, { y: -slide, duration: endT * 0.45, ease: "power1.inOut" }, endT * 0.55);
        }
      };

      build();

      const st = ScrollTrigger.create({
        trigger: stage,
        start: "top 2%",
        end: "+=120%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onRefreshInit: () => build(),
      });

      return () => st.kill();
    }, stage);

    return () => ctx.revert();
  }, []);

  const rowFigures = ROW_ORDER.map((id) => MAP_FIGURES.find((f) => f.id === id)!);

  return (
    <section id="intellects" className="w-full bg-white">
      {/* ---- Heading block (Figma Frame 345): 684px, label→title 4, title→body 18 ---- */}
      <div className="container flex flex-col items-center pt-[80px] text-center md:pt-[114px]">
        <p className="t-body text-red">Intellects</p>
        <h2 className="t-h2 mt-1 text-ink">The Thread and the Pearls</h2>
        <div className="t-body mt-[18px] max-w-[684px] space-y-[19.8px] text-ink">
          <p>
            Scattered across India are the people who hold its knowledge, historians, iconographers, philosophers,
            practitioners. Each one a pearl, carrying a fragment of what a civilisation understood about itself.
          </p>
          <p>Alone, they remain difficult to find, and harder still to reach.</p>
          <p>
            Maarga is the thread. It does not hold the knowledge. It holds the people who do, together, in reach, in
            sequence, so that what was scattered becomes something a seeker can follow.
          </p>
        </div>
      </div>

      {/* ---- Pinned stage: map → "Led by…" heading → figure row ---- */}
      <div ref={stageRef} className="relative mt-[54px] w-full">
       <div ref={innerRef} className="relative will-change-transform">
        {/* Map (2D, flat). Height clamped so the row stays inside the viewport while pinned. */}
        <div
          ref={mapRef}
          className="relative mx-auto"
          style={{ width: `min(100%, calc(clamp(360px, 56vh, 640px) * ${MAP_ASPECT}))`, aspectRatio: String(MAP_ASPECT) }}
        >
          <img src="/figma/india-2d.svg" alt="Map of India" className="absolute inset-0 h-full w-full" draggable={false} />
          <svg viewBox={MAP_VIEWBOX} className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={threadPath()} fill="none" stroke="#A62F20" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* Anchors (feet positions) + the figures that stay on the map */}
          {MAP_FIGURES.map((f) => {
            const p = toMapPct(f.lat, f.lon);
            return (
              <div
                key={f.id}
                data-map-anchor={f.id}
                className="absolute"
                title={f.place}
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: 1, height: 1, transform: "translate(-50%, -100%)" }}
              >
                {!f.inRow && (
                  <img
                    src={`/figma/fig${f.id}-map.svg`}
                    alt=""
                    className="absolute bottom-0 left-1/2 max-w-none -translate-x-1/2"
                    style={{ width: f.w * MAP_SCALE, height: f.h * MAP_SCALE }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* "Led by Those Who Have Earned It" (Figma Frame 359) */}
        <div className="container flex flex-col items-center pt-[90px] text-center">
          <p className="t-body text-red">Intellects</p>
          <h2 className="t-h2 mt-1 text-ink">Led by Those Who Have Earned It</h2>
          <p className="t-body mt-[18px] max-w-[652px] text-ink">
            Every Maarga journey is anchored by a scholar who has spent decades, not seasons, with the subject. These are
            not guides. They are the reason the journey exists.
          </p>
        </div>

        {/* Figure row (Figma Frame 360): 13 slots, 61.8px gap, centred, 85px tall */}
        <div ref={rowRef} className="mx-auto mt-[50px] flex min-h-[85px] w-full max-w-[1056px] flex-wrap items-end justify-center gap-x-[4vw] gap-y-6 px-6 md:flex-nowrap md:items-center md:gap-[3vw] lg:gap-[61.8px] lg:px-0">
          {rowFigures.map((f) => (
            <div key={f.id} data-row-slot={f.id} style={{ width: f.w, height: f.h }} className="flex-none" />
          ))}
        </div>

        {/* The moving figures — absolutely positioned in stage space, transform-only */}
        {rowFigures.map((f) => (
          <img
            key={f.id}
            data-figure={f.id}
            src={`/figma/fig${f.id}-row.svg`}
            alt={f.place}
            className="pointer-events-none absolute left-0 top-0 max-w-none will-change-transform"
            style={{ width: f.w, height: f.h }}
            draggable={false}
          />
        ))}
       </div>
      </div>
      {/* compensates the stage's internal slide-up (see build) so nothing gapes below the row */}
      <div ref={afterRef} aria-hidden />
    </section>
  );
}
