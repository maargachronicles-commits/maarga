"use client";

import { forwardRef, useImperativeHandle, useRef, Fragment } from "react";

export interface SketchProgressHandle {
  /** 0 → 1: how much of the ACTIVE layer's drawing is done. */
  setProgress: (p: number) => void;
}

const R = 11; // ring radius (24px node, 1.2px stroke)
const CIRC = 2 * Math.PI * R; // ≈ 69.1

/**
 * 1 ── 2 ── 3 — position + drawing progress for the three sketch layers.
 * Layers before `index` are done (solid red), `index` is active (its ring
 * fills as the sketch draws), later ones are upcoming. Clicking a number
 * jumps to that layer. Progress is written straight to the DOM (no React
 * re-render per frame).
 */
const SketchProgress = forwardRef<SketchProgressHandle, { index: number; total: number; onJump?: (i: number) => void }>(
  function SketchProgress({ index, total, onJump }, ref) {
    const fillRef = useRef<SVGCircleElement>(null);
    const segRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(ref, () => ({
      setProgress: (p) => {
        const c = Math.min(1, Math.max(0, p));
        if (fillRef.current) fillRef.current.style.strokeDashoffset = String(CIRC * (1 - c));
        // the segment after the active node fills a little late so it reads as "leading to the next step"
        if (segRef.current) segRef.current.style.setProperty("--sk-fill", String(c >= 1 ? 1 : 0));
      },
    }));

    return (
      <div className="sk-progress" role="group" aria-label={`Part ${index} of ${total}`}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const state = n < index ? "done" : n === index ? "active" : "upcoming";
          return (
            <Fragment key={n}>
              <button
                type="button"
                className="sk-node"
                data-state={state}
                aria-current={state === "active" ? "step" : undefined}
                aria-label={`Go to part ${n}`}
                onClick={() => onJump?.(i)}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <circle className="sk-track" cx="12" cy="12" r={R} />
                  <circle className="sk-fill" cx="12" cy="12" r={R} ref={state === "active" ? fillRef : undefined} />
                </svg>
                <span>{n}</span>
              </button>
              {n < total && <span className="sk-seg" data-done={n < index ? "true" : "false"} ref={n === index ? segRef : undefined} />}
            </Fragment>
          );
        })}
      </div>
    );
  }
);

export default SketchProgress;
