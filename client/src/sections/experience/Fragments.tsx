"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { TextItem } from "@/lib/types";

/** Scroll distance (in viewport heights) per fragment. */
const STEP_VH = 0.9;

/**
 * Red "Fragments" band (Figma Frame 392: 1512×772, #A62F20): label (Erode 16)
 * → 33 → fragment text (Clash 28/34.4 cream, 936px, centred) → counter "1/3"
 * → "Scroll down for next" 20px above the bottom edge.
 *
 * Behaviour: the band pins and scrolling turns the pages — each fragment gets
 * STEP_VH of scroll; the outgoing text slides up and the next one slides in,
 * scrubbed so it can be stopped half-way and reversed. With one fragment it
 * is a static band. Transform/opacity only.
 */
export default function Fragments({ label, hint, items }: { label: string; hint: string; items: TextItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const n = items.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const slides = Array.from(stage.querySelectorAll<HTMLElement>("[data-slide]"));
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      gsap.set(slides, { yPercent: 0, opacity: 0 });
      gsap.set(slides[0], { opacity: 1 });
      // page turn: the current text leaves first, then the next one arrives (no overlap)
      for (let i = 0; i < n - 1; i++) {
        tl.to(slides[i], { yPercent: -50, opacity: 0, duration: 0.45 }, i);
        tl.fromTo(slides[i + 1], { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45 }, i + 0.55);
      }
      const st = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: `+=${(n - 1) * STEP_VH * 100}%`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        animation: tl,
        onUpdate: (self) => setCurrent(Math.min(n - 1, Math.round(self.progress * (n - 1)))),
      });
      return () => st.kill();
    }, stage);
    return () => ctx.revert();
  }, [n]);

  if (!n) return null;

  return (
    <section id="fragments" className="w-full bg-red text-cream">
      <div ref={stageRef} className="relative flex h-[100svh] min-h-[560px] w-full flex-col items-center justify-center overflow-hidden md:h-[772px] md:min-h-0">
        <div className="relative flex w-full max-w-[936px] flex-col items-center px-6 text-center xl:px-0">
          <p className="t-body">{label}</p>
          <div className="relative mt-[33px] w-full" style={{ minHeight: "6.2em" }}>
            {items.map((f, i) => (
              <p
                key={f.id}
                data-slide
                className={`t-h2 will-change-transform ${i === 0 ? "relative" : "absolute inset-x-0 top-0"}`}
                aria-hidden={i !== current}
              >
                {f.text}
              </p>
            ))}
          </div>
          <p className="t-body mt-[70px] tabular-nums md:mt-[148px]" aria-live="polite">
            {current + 1}/{n}
          </p>
        </div>
        {n > 1 && <p className="t-body absolute bottom-[20px] left-1/2 -translate-x-1/2 whitespace-nowrap">{hint}</p>}
      </div>
    </section>
  );
}
