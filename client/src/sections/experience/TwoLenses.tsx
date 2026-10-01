"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { ExperienceSite } from "@/lib/types";

/** Figma sketched figures that can stand in a sketch (Frame 210 / 201 / 221). */
export const FIGURES: Record<string, { src: string; w: number; h: number }> = {
  boulders: { src: "/figma/exp-fig-boulders.svg", w: 24, h: 76 },
  pillars: { src: "/figma/exp-fig-pillars.svg", w: 25, h: 78 },
  tank: { src: "/figma/exp-fig-tank.svg", w: 18, h: 80 },
  virupaksha: { src: "/figma/exp-fig-virupaksha.svg", w: 16, h: 53 },
};
export const figureOf = (key?: string | null) => FIGURES[key ?? ""] ?? FIGURES.boulders;

/**
 * "What You've Been Told" (Figma Frame 380) + "Two Lenses, One Place"
 * (Frames 383 / 402). Each site (Frame 400/401/402/403): left column 411px —
 * lens A (Erode 16 red label → 7 → Erode 16 text) … 126px … lens B; right
 * column 820px — number (Erode 16 red) → 16 → title (Clash 48 red), both
 * right-aligned, then the sketch with a red sketched figure standing in it and
 * the "*Click here on the person…" hint (right-aligned). 178px between sites.
 *
 * Motion (scroll-scrubbed, reversible, transform/clip only): as a site comes
 * into view its sketch wipes in from the left and the copy drifts up; the
 * figure steps in last. The figure is a link (CMS: "Link the figure opens").
 * Everything is CMS-driven (Experience page → Sites).
 */
export default function TwoLenses({
  told,
  heading,
  sites,
  hint,
}: {
  told: { label: string; text: string };
  heading: { title: string; sub: string };
  sites: ExperienceSite[];
  hint: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-site]").forEach((row) => {
        const sketch = row.querySelector<HTMLElement>("[data-sketch]");
        const fig = row.querySelector<HTMLElement>("[data-figure]");
        const copy = row.querySelectorAll<HTMLElement>("[data-copy]");
        if (!sketch) return;
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.fromTo(sketch, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7 }, 0);
        tl.fromTo(copy, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, 0.05);
        if (fig) tl.fromTo(fig, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.6);
        ScrollTrigger.create({ trigger: row, start: "top 85%", end: "center 50%", scrub: true, animation: tl });
      });
    }, root);
    return () => ctx.revert();
  }, [sites.length]);

  return (
    <div ref={rootRef} className="w-full bg-cream">
      {/* What you've been told */}
      <div className="mx-auto mt-[110px] flex w-full max-w-[725px] flex-col items-center px-6 text-center md:mt-[219px] lg:px-0">
        <p className="t-body text-red">{told.label}</p>
        <p className="t-h4 mt-2 text-ink">
          {told.text.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br className="hidden md:block" />}{i < arr.length - 1 && " "}
            </span>
          ))}
        </p>
      </div>

      {/* Two Lenses heading */}
      <div className="mx-auto mt-[100px] flex w-full max-w-[1272px] flex-col items-center px-6 md:mt-[149px] xl:px-0">
        <div className="w-[270px] max-w-full">
          <h2 className="t-h2 text-ink">{heading.title}</h2>
          <p className="t-body mt-[6px] text-ink">{heading.sub}</p>
        </div>
      </div>

      {/* Sites */}
      <ol className="mx-auto mt-[27px] flex w-full max-w-[1272px] flex-col gap-[100px] px-6 md:gap-[178px] xl:px-0">
        {sites.map((site, i) => {
          const f = figureOf(site.figure);
          const left = Number(site.figureLeft ?? 20);
          const top = Number(site.figureTop ?? 70);
          const figure = (
            <img src={f.src} alt="" width={f.w} height={f.h} className="h-auto w-full max-w-none" draggable={false} />
          );
          return (
            <li key={site.id} data-site className="grid grid-cols-1 gap-8 md:grid-cols-[411px_minmax(0,820px)] md:justify-between md:gap-[42px]">
              {/* copy column — vertically centred against the sketch like the Figma (padding 24, gap 126) */}
              <div className="order-2 flex flex-col justify-center gap-10 py-0 md:order-1 md:gap-[126px] md:py-6">
                <div data-copy>
                  <p className="t-body text-red">{site.lensALabel}</p>
                  <p className="t-body mt-[7px] text-ink">{site.lensAText}</p>
                </div>
                <div data-copy>
                  <p className="t-body text-red">{site.lensBLabel}</p>
                  <p className="t-body mt-[7px] text-ink">{site.lensBText}</p>
                </div>
              </div>

              <div className="order-1 flex flex-col md:order-2">
                <div data-copy className="flex flex-col items-end text-right">
                  <p className="t-body text-red">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="t-site mt-4 text-red">{site.title}</h3>
                </div>
                <div className="relative mt-0 w-full overflow-hidden">
                  <div data-sketch className="relative w-full will-change-[clip-path]" style={{ aspectRatio: "820 / 363" }}>
                    <Image src={site.image} alt={site.title} fill sizes="(min-width:1024px) 820px, 100vw" className="object-contain object-top" />
                  </div>
                  {/* sketched figure — clickable */}
                  <div
                    data-figure
                    className="absolute will-change-transform"
                    style={{ left: `${left}%`, top: `${top}%`, width: `${(f.w / 820) * 100}%`, minWidth: 14, transform: "translate(-50%, -100%)" }}
                  >
                    {site.ctaUrl?.trim() ? (
                      <Link href={site.ctaUrl} className="exp-figure block" aria-label={`Experience ${site.title} digitally`}>
                        {figure}
                      </Link>
                    ) : (
                      figure
                    )}
                  </div>
                </div>
                {(site.ctaText ?? (i === 0 ? hint : "")) && (
                  <p className="t-body mt-2 text-right text-red">{site.ctaText ?? hint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
