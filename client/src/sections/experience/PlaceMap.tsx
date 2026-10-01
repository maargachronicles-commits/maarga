"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* india-2d.svg is 974×985.7; Karnataka (path 15 of the same file) sits at this box inside it. */
const MAP = { w: 974, h: 985.7 };
const KA = { x: 199, y: 611.5, w: 148.9, h: 244 };
/* karnataka-2d.svg has a 3px margin around the state on every side. */
const KA_SVG = { w: KA.w + 6, h: KA.h + 6 };

/**
 * "Hampi, Karnataka" + the map (Figma Frame 419 / 377 / 379), rebuilt with the
 * flat 2D India map used on the homepage instead of the Figma's isometric one.
 *
 * Animation (scroll-scrubbed, reversible, transform-only):
 *   • on the map Karnataka is red;
 *   • as the visitor scrolls, that red state lifts off the map, grows and glides
 *     down to its seat at the left of the Overview copy (Figma Frame 377: 732×405);
 *   • the temple icon (Figma Frame 375, 119×126) rises onto it over the last 30 %;
 *   • the Overview copy drifts up into place alongside.
 * The moving piece is ONE element whose start/end transforms are measured from
 * the real layout (FLIP), so it lands exactly wherever the responsive layout
 * puts its seat. Stop scrolling = it stops; scroll up = it flies back.
 */
export default function PlaceMap({
  name,
  region,
  overviewTitle,
  overviewText,
}: {
  name: string;
  region: string;
  overviewTitle: string;
  overviewText: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null); // the India map box
  const seatRef = useRef<HTMLDivElement>(null); // where Karnataka lands (invisible box)
  const flyerRef = useRef<HTMLDivElement>(null); // the red Karnataka that travels
  const iconRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null); // faint outline left behind on the map

  useEffect(() => {
    const section = sectionRef.current;
    const map = mapRef.current;
    const seat = seatRef.current;
    const flyer = flyerRef.current;
    const icon = iconRef.current;
    const copy = copyRef.current;
    const ghost = ghostRef.current;
    if (!section || !map || !seat || !flyer || !icon || !copy || !ghost) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      /** Karnataka's box on the rendered map, in section coordinates. */
      const mapSeat = () => {
        const mr = map.getBoundingClientRect();
        const sr = section.getBoundingClientRect();
        const k = mr.width / MAP.w;
        return { x: mr.left - sr.left + (KA.x - 3) * k, y: mr.top - sr.top + (KA.y - 3) * k, w: KA_SVG.w * k };
      };

      const build = () => {
        tl.clear();
        gsap.set([flyer, icon, copy], { clearProps: "transform,opacity" });
        const from = mapSeat();
        const sr = section.getBoundingClientRect();
        const to = seat.getBoundingClientRect();
        const toX = to.left - sr.left;
        const toY = to.top - sr.top;
        flyer.style.width = `${to.width}px`; // always exactly the seat's size
        flyer.style.height = `${to.height}px`;
        // the flyer's natural size is the seat's size; scale it down to the map's Karnataka at the start
        const s0 = from.w / to.width;
        gsap.set(flyer, { x: from.x, y: from.y, scale: s0, transformOrigin: "0 0" });
        gsap.set(icon, { opacity: 0, y: 40, scale: 0.6, transformOrigin: "50% 100%" });
        gsap.set(copy, { opacity: 0, y: 60 });

        if (reduced) {
          gsap.set(flyer, { x: toX, y: toY, scale: 1 });
          gsap.set(icon, { opacity: 1, y: 0, scale: 1 });
          gsap.set(copy, { opacity: 1, y: 0 });
          gsap.set(ghost, { opacity: 1 });
          return;
        }
        tl.to(flyer, { x: toX, y: toY, scale: 1, duration: 1 }, 0);
        tl.to(ghost, { opacity: 1, duration: 0.3 }, 0);
        tl.to(copy, { opacity: 1, y: 0, duration: 0.6 }, 0.35);
        tl.to(icon, { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 0.7);
      };
      build();
      if (reduced) return;

      const st = ScrollTrigger.create({
        trigger: map,
        start: "center 60%", // the map is centred → Karnataka starts to lift
        endTrigger: seat,
        end: "bottom 78%", // its seat is well inside the viewport → it has landed
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onRefreshInit: build,
      });
      return () => st.kill();
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="place" className="relative w-full bg-cream pt-[80px] md:pt-[105px]">
      <div className="mx-auto flex w-full max-w-[1272px] flex-col items-center px-6 xl:px-0">
        <h2 className="place-title text-center">
          <span className="text-red">{name}</span> <span className="text-ink">{region}</span>
        </h2>

        {/* the map — Karnataka drawn red on it; a faint ghost stays once it has flown */}
        <div ref={mapRef} className="relative mt-[26px] w-full max-w-[560px]" style={{ aspectRatio: `${MAP.w} / ${MAP.h}` }}>
          <img src="/figma/india-2d-no-ka.svg" alt="Map of India" className="absolute inset-0 h-full w-full opacity-60" draggable={false} />
          <div
            ref={ghostRef}
            className="absolute opacity-0"
            style={{ left: `${((KA.x - 3) / MAP.w) * 100}%`, top: `${((KA.y - 3) / MAP.h) * 100}%`, width: `${(KA_SVG.w / MAP.w) * 100}%` }}
            aria-hidden
          >
            <img src="/figma/karnataka-2d.svg" alt="" className="h-auto w-full opacity-25" draggable={false} />
          </div>
        </div>
      </div>

      {/* Karnataka's seat + Overview (Figma Frame 377 at x 119, Frame 379 at x 767 — 626px copy) */}
      <div className="mx-auto mt-[90px] w-full max-w-[1272px] px-6 md:mt-[150px] xl:px-0">
        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[minmax(0,300px)_minmax(0,626px)] md:justify-between md:gap-[40px]">
          <div ref={seatRef} className="relative w-[220px] md:w-full md:max-w-[300px]" style={{ aspectRatio: `${KA_SVG.w} / ${KA_SVG.h}` }} aria-hidden />
          <div ref={copyRef} className="max-w-[626px] pb-[10px] md:pb-[12px]">
            <h3 className="t-h2 text-ink">{overviewTitle}</h3>
            <div className="t-body mt-4 space-y-4 text-ink">
              {overviewText.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the travelling Karnataka (sized like its seat, transformed to the map at the start) */}
      <div ref={flyerRef} className="pointer-events-none absolute left-0 top-0 z-10 w-[220px] will-change-transform md:w-[300px]" style={{ aspectRatio: `${KA_SVG.w} / ${KA_SVG.h}` }} aria-hidden>
        <img src="/figma/karnataka-2d.svg" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        {/* temple icon (Figma Frame 375, 119×126) standing where Hampi is (15.33°N 76.46°E) */}
        {/* centred on the state's visual centre (its centroid, ≈47 % / 54 %) so the whole icon sits on the red — the
            earlier 33 % / 19 % put it in the narrow northern tip where it spilled over the edge */}
        <img
          ref={iconRef}
          src="/figma/exp-temple-icon.png"
          alt=""
          className="absolute h-auto"
          style={{ left: "47%", top: "54%", width: "52%", translate: "-50% -50%" }}
          draggable={false}
        />
      </div>
    </section>
  );
}
