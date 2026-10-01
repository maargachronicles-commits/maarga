"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import SketchLayer, { type SketchLayerHandle } from "./SketchLayer";
import type { LinkSetting } from "@/lib/types";

/* Existing sketch compositions + their stroke CSS (kept in place, reused). */
import Group11 from "@/sections/Hero/StorySection/assets/Group11";
import "@/sections/Hero/StorySection/assets/story1Sketch.css";
import Group13 from "@/sections/Hero/StorySection/Story2/assets/Group13";
import "@/sections/Hero/StorySection/Story2/assets/story2Sketch.css";
import Group12 from "@/sections/Hero/StorySection/Story3/assets/Group12";
import "@/sections/Hero/StorySection/Story3/assets/story3Sketch.css";

const LAYERS = 3;
/** Progress positions of the three layers (0 → layer 1, 0.5 → layer 2, 1 → layer 3). */
const SNAPS = [0, 0.5, 1];

/**
 * "Living Knowledge" — three stacked sketch layers.
 *
 * Trigger layer: the stack is pinned for 3 viewports. Scroll progress only
 * selects the ACTIVE layer (round(progress × 2)) and snaps to layer
 * boundaries so a layer never sits half-shown. Every time a layer becomes
 * active — forwards or backwards — it comes forward (z-index + 0.6 s settle)
 * and its drawing timeline is (re)started from blank, so revisiting layer 2
 * or 3 redraws it. Layers behind the active one stay fully drawn; layers
 * ahead are hidden and reset. Scrolling back above the section resets
 * everything, so layer 1 redraws when the user comes down from the hero.
 *
 * Layer 1 starts as soon as 35 % of the section is in view (start "top 65%").
 * The drawing itself is never scrubbed or reversed (spec exception).
 */
export default function SketchStack({ learnMore }: { learnMore?: LinkSetting }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(SketchLayerHandle | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    let active = -1;
    const handles = () => layerRefs.current;

    const activate = (i: number) => {
      if (i === active) return;
      const forward = i > active;
      active = i;
      handles().forEach((h, idx) => {
        const el = h?.el;
        if (!h || !el) return;
        el.style.zIndex = idx === i ? "30" : idx < i ? String(10 + idx) : "0";
        if (idx > i) {
          // not reached yet: hidden underneath, blank so it redraws when reached
          gsap.set(el, { autoAlpha: 0 });
          h.reset();
        } else if (idx < i) {
          // behind the active layer: fully drawn
          gsap.set(el, { autoAlpha: 1, y: 0 });
          h.complete();
        }
      });
      const h = handles()[i];
      const el = h?.el;
      if (el) {
        if (forward) {
          gsap.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", overwrite: true });
        } else {
          gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: true });
        }
      }
      // text is already in the layer; the sketch (re)draws from blank
      h?.play();
    };

    /** User scrolled back above the section: blank everything so layer 1 redraws on re-entry. */
    const resetAll = () => {
      active = -1;
      handles().forEach((h, idx) => {
        const el = h?.el;
        if (!h || !el) return;
        h.reset();
        gsap.set(el, { autoAlpha: idx === 0 ? 1 : 0, zIndex: idx === 0 ? 30 : 0, y: 0 });
      });
    };

    const ctx = gsap.context(() => {
      // initial state: layer 1 on top (undrawn), others hidden underneath
      handles().forEach((h, idx) => h?.el && gsap.set(h.el, { autoAlpha: idx === 0 ? 1 : 0, zIndex: idx === 0 ? 30 : 0 }));

      stRef.current = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: () => `+=${window.innerHeight * (LAYERS - 1)}`,
        pin: stage,
        pinSpacing: true,
        scrub: true,
        snap: { snapTo: SNAPS, duration: { min: 0.3, max: 0.7 }, delay: 0.05, ease: "power2.inOut", directional: true },
        onUpdate: (self) => activate(Math.min(LAYERS - 1, Math.floor(self.progress * (LAYERS - 1) + 0.52))),
      });

      // Layer 1 starts drawing once 35% of the section is visible; leaving
      // upwards (back to the hero) blanks it so it draws again next time.
      ScrollTrigger.create({
        trigger: wrap,
        start: "top 65%",
        onEnter: () => activate(0),
        onLeaveBack: () => resetAll(),
      });
    }, wrap);

    return () => {
      ctx.revert();
      stRef.current = null;
    };
  }, []);

  /** "Skip →" — jump to the next layer boundary, or past the stack after the last layer. */
  const skipTo = (nextIndex: number) => {
    const st = stRef.current;
    if (!st) return;
    const y =
      nextIndex >= LAYERS
        ? st.end + window.innerHeight // stage unpins at st.end; the next section sits one viewport below
        : st.start + (st.end - st.start) * SNAPS[nextIndex];
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section ref={wrapRef} id="living-knowledge" aria-label="What is Maarga" className="relative w-full bg-cream">
      <div ref={stageRef} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" style={{ contentVisibility: "auto" }}>
        <SketchLayer
          ref={(h) => { layerRefs.current[0] = h; }}
          index={1}
          total={3}
          lines={[
            "Standing before a thousand-year-old temple,",
            "a stepwell, a fortified city, most travellers are",
            "given a date and a dynasty.",
          ]}
          textLeftPct={7.2}
          textTopPct={13}
          textWidth={417}
          sketch={<Group11 />}
          sketchClass="story1-sketch"
          sketchLeftPct={5.3}
          sketchTopPct={9.5}
          sketchWidthPct={87.3}
          sketchAspect={1372.56 / 707.266}
          footer="scroll"
          onSkip={() => skipTo(1)}
          onJump={skipTo}
        />
        <SketchLayer
          ref={(h) => { layerRefs.current[1] = h; }}
          index={2}
          total={3}
          lines={[
            "We give you the person who can explain why a",
            "civilisation built it that way — a historian, an",
            "iconographer, a scholar who has spent decades",
            "earning the right to answer that question.",
          ]}
          textLeftPct={7.2}
          textTopPct={12}
          textWidth={466}
          sketch={<Group13 />}
          sketchClass="story2-sketch"
          sketchLeftPct={15.5}
          sketchTopPct={5.4}
          sketchWidthPct={78.4}
          sketchAspect={1220.24 / 738.454}
          footer="scroll"
          onSkip={() => skipTo(2)}
          onJump={skipTo}
        />
        <SketchLayer
          ref={(h) => { layerRefs.current[2] = h; }}
          index={3}
          total={3}
          lines={[
            "Maarga is the thread between the intellectually curious",
            "and those who have given their lives to studying India's",
            "heritage. Not a tour. A path to understanding.",
          ]}
          textLeftPct={8.7}
          textTopPct={8}
          textWidth={512}
          sketch={<Group12 />}
          sketchClass="story3-sketch"
          sketchLeftPct={13.2}
          sketchTopPct={10.8}
          sketchWidthPct={74.7}
          sketchAspect={1187.93 / 704.112}
          footer="learn"
          onSkip={() => skipTo(3)}
          onJump={skipTo}
          learnMore={learnMore}
        />
      </div>
    </section>
  );
}
