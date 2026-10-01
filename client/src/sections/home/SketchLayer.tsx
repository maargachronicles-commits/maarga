"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import type { ReactNode } from "react";
import { useStrokeDraw } from "./useStrokeDraw";
import SketchProgress, { type SketchProgressHandle } from "./SketchProgress";
import { ArrowIcon } from "@/components/ui/ArrowLink";
import Link from "next/link";
import type { LinkSetting } from "@/lib/types";

export interface SketchLayerHandle {
  play: () => void;
  reset: () => void;
  complete: () => void;
  el: HTMLDivElement | null;
}

export interface SketchLayerSpec {
  index: number;            // 1-based
  total: number;
  lines: string[];          // paragraph, one entry per designed line
  textLeftPct: number;      // % of layer width (PDF: 109/1512, 131/1512 for #3)
  textTopPct: number;       // % of layer height
  textWidth: number;        // px width of text block at 1512
  sketch: ReactNode;        // the SVG composition (Group11/13/12)
  sketchClass: string;      // story1-sketch / story2-sketch / story3-sketch
  sketchLeftPct: number;
  sketchTopPct: number;
  sketchWidthPct: number;
  sketchAspect: number;     // viewBox width / height
  footer: "scroll" | "learn";
  /** "Skip →" — present on every layer; on the last one it jumps to the next section. */
  onSkip?: () => void;
  /** Jump to layer i (0-based) from the 1 ── 2 ── 3 progress bar. */
  onJump?: (i: number) => void;
  /** "Learn more About us" — text + link from the CMS. */
  learnMore?: LinkSetting;
}

/** Each sketch draws itself in exactly this many seconds (spec: ~5 s max). */
export const SKETCH_DURATION = 5;

/**
 * One of the three stacked sketch layers. Cream background (#FFFDFA), red
 * Clash 22/27 copy at top-left, Erode 16 label + counter above it, and the
 * "Scroll down to go ahead / Skip →" row (or "Learn more About us →" + Skip)
 * ~20px from the bottom (moved down from the PDF's 50px so it clears the
 * drawing; a translucent cream backing keeps it legible over any stroke).
 */
const SketchLayer = forwardRef<SketchLayerHandle, SketchLayerSpec>(function SketchLayer(spec, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SketchProgressHandle>(null);
  const onProgress = useCallback((p: number) => progressRef.current?.setProgress(p), []);
  const { play, reset, complete } = useStrokeDraw(sketchRef, { duration: SKETCH_DURATION, onProgress });

  useImperativeHandle(ref, () => ({ play, reset, complete, el: rootRef.current }), [play, reset, complete]);

  return (
    <div ref={rootRef} className="absolute inset-0 h-full w-full overflow-hidden bg-cream">
      {/* sketch */}
      <div
        ref={sketchRef}
        className={`${spec.sketchClass} sketch-art absolute`}
        style={{
          left: `${spec.sketchLeftPct}%`,
          top: `${spec.sketchTopPct}%`,
          width: `${spec.sketchWidthPct}%`,
          aspectRatio: String(spec.sketchAspect),
        }}
      >
        {spec.sketch}
      </div>

      {/* copy — present as soon as the layer is visible; never waits for the drawing */}
      <div
        className="sketch-copy absolute"
        style={{
          left: `${spec.textLeftPct}%`,
          top: `max(24px, calc(${spec.textTopPct}% - 46px))`,
          minWidth: `min(${spec.textWidth}px, calc(100% - 48px))`,
          maxWidth: "calc(100% - 48px)",
        }}
      >
        {/* 1 ── 2 ── 3 : which part is showing + how far its drawing has got */}
        <div className="mb-[22px]">
          <SketchProgress ref={progressRef} index={spec.index} total={spec.total} onJump={spec.onJump} />
        </div>
        {/* the 1/3 counter was removed — the 1 ── 2 ── 3 progress above already says which part this is */}
        <div className="sketch-copy__row t-body text-ink/70" style={{ width: spec.textWidth }}>
          <span>What is Maarga</span>
        </div>
        <p className="t-h4 mt-0 text-red">
          {spec.lines.map((l, i) => (
            <span key={i} className="lg:block lg:whitespace-nowrap">
              {l}{" "}
            </span>
          ))}
        </p>
      </div>

      {/* footer row */}
      {spec.footer === "scroll" ? (
        <p className="t-body absolute bottom-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/90 px-4 py-1 italic text-ink/70">
          Scroll down to go ahead
        </p>
      ) : (
        <Link
          href={spec.learnMore?.href || "/about"}
          className="arrow-link absolute bottom-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-cream/90 text-red"
        >
          {spec.learnMore?.text || "Learn more About us"} <ArrowIcon />
        </Link>
      )}
      <button
        type="button"
        onClick={spec.onSkip}
        className="t-body absolute bottom-[22px] right-[4.4%] inline-flex items-center gap-1 border-b border-red bg-cream/90 italic text-red"
      >
        Skip <ArrowIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

export default SketchLayer;
