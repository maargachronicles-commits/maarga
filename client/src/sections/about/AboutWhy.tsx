"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ArrowLink from "@/components/ui/ArrowLink";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { AboutData, LinkSetting } from "@/lib/types";

/* Figma "Component 4": 1558×637 at x −23. Percentages of the composition box. */
const W = 1558;
const H = 637;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const TILE_W = pct(260, W);
const COL = { edgeL: pct(0, W), l: pct(277, W), c: pct(554, W), r: pct(1021, W), edgeR: pct(1298, W) };
const EDGE = { top: pct(147, H), h: pct(343, H) };
const TOP = { top: "0%", h: pct(265, H) };
const BOT = { top: pct(294, H), h: pct(343, H) };

/** Progress of the widening at which the doorway figure starts sketching itself in (0–1). */
const FIGURE_FROM = 0.35;
/** Figure size / position inside the centre photo (Figma Frame 208: 42×156 at y 387 of 637). */
const FIGURE = { w: 42 / 450, top: 387 / 637 };

type Slots = AboutData["settings"];

/**
 * "Not Archival. Alive." (Figma "Frame 369") — copy block (675px) then the
 * seven-photo composition.
 *
 * Animation (client's reference video qq.mp4 — scroll-scrubbed & reversible):
 * once the composition is centred the stage pins and the CENTRE photo widens
 * HORIZONTALLY ONLY — its height never changes — until it spans the whole
 * viewport, pushing the side photos out of frame glued to its edges. Stop
 * scrolling = it freezes; scroll back = it narrows again.
 *
 * The widening is transform-only (no layout work per frame): the clip box is
 * scaleX'd while the photo box inside is counter-scaled, so the picture is
 * never stretched — more of it is simply revealed. The sketched figure in the
 * gateway draws itself in (top → bottom) over the last part of the widening.
 *
 * Reduced-motion users see the static composition. On phones the stage is
 * only as tall as the composition. Every photo slot is a CMS setting
 * (About page → Why Maarga photos). Best with a wide (≈2.4:1) centre photo.
 */
export default function AboutWhy({ slots, cta = { text: "View our destinations", href: "/destinations" } }: { slots: Slots; cta?: LinkSetting }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const centreRef = useRef<HTMLDivElement>(null); // clip box (scaleX)
  const innerRef = useRef<HTMLDivElement>(null); // photo + figure (counter scaleX)
  const figureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const comp = compRef.current;
    const centre = centreRef.current;
    const inner = innerRef.current;
    const figure = figureRef.current;
    if (!stage || !comp || !centre || !inner || !figure) return;

    const layoutFigure = (cw: number) => {
      figure.style.width = `${cw * FIGURE.w}px`;
      figure.style.top = `${FIGURE.top * 100}%`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      layoutFigure(centre.offsetWidth);
      gsap.set(figure, { clipPath: "inset(0 0 0% 0)" });
      return;
    }

    const ctx = gsap.context(() => {
      const sides = Array.from(comp.querySelectorAll<HTMLElement>("[data-side]"));
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      const build = () => {
        tl.clear();
        gsap.set([centre, inner, ...sides], { clearProps: "transform" });
        const cw = centre.offsetWidth;
        const stageW = stage.clientWidth;
        // how much wider the clip box must become to span the viewport (+ a hair so no seam shows)
        const S = (stageW / cw) * 1.005;
        // the photo box is always as wide as the fully widened clip → the cover crop never changes scale
        inner.style.width = `${cw * S}px`;
        inner.style.left = `${(cw - cw * S) / 2}px`;
        layoutFigure(cw);
        gsap.set([centre, inner], { transformOrigin: "50% 50%" });

        const push = (cw * (S - 1)) / 2; // neighbours ride on the growing edge
        tl.to(centre, { scaleX: S, duration: 1 }, 0);
        tl.to(inner, { scaleX: 1 / S, duration: 1 }, 0);
        sides.forEach((el) => {
          const dir = el.dataset.side === "l" ? -1 : 1;
          tl.to(el, { x: dir * push, duration: 1 }, 0);
        });
        // the sketched visitor draws in (head → feet) over the last part of the widening
        tl.fromTo(figure, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1 - FIGURE_FROM }, FIGURE_FROM);
      };
      build();

      const phone = window.innerWidth < 768;
      const st = ScrollTrigger.create({
        trigger: stage,
        start: phone ? "center center" : "top top",
        end: phone ? "+=80%" : "+=100%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onRefreshInit: build,
      });
      return () => st.kill();
    }, stage);
    return () => ctx.revert();
  }, []);

  const Tile = ({
    src,
    left,
    top,
    height,
    width = TILE_W,
    side,
    className = "",
  }: {
    src?: string;
    left: string;
    top: string;
    height: string;
    width?: string;
    side?: "l" | "r";
    className?: string;
  }) => (
    <div
      data-side={side}
      className={`absolute overflow-hidden bg-ink/5 will-change-transform ${className}`}
      style={{ left, top, width, height }}
    >
      {src && <Image src={src} alt="" fill sizes="(min-width:1024px) 30vw, 60vw" className="object-cover" />}
    </div>
  );

  return (
    <section id="about-why" className="w-full bg-cream">
      {/* copy block — scrolls away as the composition takes the screen */}
      <div className="mx-auto flex w-full max-w-[675px] flex-col items-center px-6 pt-[110px] text-center md:pt-[161px] lg:px-0">
        <img src="/figma/about-figures-three.svg" alt="" aria-hidden width={175} height={198} className="mb-[60px] h-auto w-[130px] md:mb-[161px] md:w-[175px]" />
        <p className="t-body text-red">Why Maarga</p>
        <h2 className="t-h2 mt-[3px] text-ink">Not Archival. Alive.</h2>
        <div className="t-body mt-[18px] space-y-[18px] text-ink">
          <p>
            Maarga&apos;s knowledge does not live in a lecture hall. It lives in the field — under the shade of a mandapa at
            midday, at the edge of a stepwell before the light changes, in the pause before a scholar answers a question
            they&apos;ve been asked a hundred times and still finds worth answering.
          </p>
          <p>You will stand in these places. Not read about them.</p>
        </div>
        <ArrowLink href={cta.href} className="mt-[25px] text-red">
          {cta.text}
        </ArrowLink>
      </div>

      {/* pinned stage: the composition centred in the viewport; the centre photo widens to the viewport edges */}
      <div ref={stageRef} className="relative mt-10 flex h-auto w-full items-center justify-center overflow-hidden md:mt-[55px] md:h-[100svh]">
        <div ref={compRef} className="about-gallery relative" style={{ aspectRatio: `${W} / ${H}` }}>
          <Tile src={slots.aboutGalleryEdgeLeft} left={COL.edgeL} top={EDGE.top} height={EDGE.h} side="l" />
          <Tile src={slots.aboutGalleryLeftTop} left={COL.l} top={TOP.top} height={TOP.h} side="l" />
          <Tile src={slots.aboutGalleryLeftBottom} left={COL.l} top={BOT.top} height={BOT.h} side="l" />
          <Tile src={slots.aboutGalleryRightTop} left={COL.r} top={TOP.top} height={TOP.h} side="r" />
          <Tile src={slots.aboutGalleryRightBottom} left={COL.r} top={BOT.top} height={BOT.h} side="r" />
          <Tile src={slots.aboutGalleryEdgeRight} left={COL.edgeR} top={EDGE.top} height={EDGE.h} side="r" />
          {/* clip box — only ever scaled on X */}
          <div ref={centreRef} className="absolute z-10 overflow-hidden bg-ink/5 will-change-transform" style={{ left: COL.c, top: 0, width: pct(450, W), height: "100%" }}>
            {/* photo box — counter-scaled so the picture is revealed, never stretched */}
            <div ref={innerRef} className="absolute top-0 h-full w-full will-change-transform" style={{ left: 0 }}>
              {slots.aboutGalleryCentre && (
                <Image src={slots.aboutGalleryCentre} alt="" fill sizes="100vw" className="object-cover" loading="eager" />
              )}
              {/* sketched visitor standing in the gateway (Figma "Frame 208") — sketches itself in while widening */}
              <div
                ref={figureRef}
                className="pointer-events-none absolute -translate-x-1/2"
                style={{ left: "50%", top: `${FIGURE.top * 100}%`, width: "9.4%", clipPath: "inset(0 0 100% 0)" }}
              >
                <img src="/figma/about-gallery-figure.svg" alt="" aria-hidden className="h-auto w-full max-w-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
