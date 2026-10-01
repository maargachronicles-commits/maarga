"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Stroke-reveal ("hand drawing") engine, extracted from the three
 * StorySection/AppOriginal.tsx copies:
 *  1. collect every <path> inside the SVG, split compound paths on M/m
 *  2. measure bbox + length once; sort top→bottom / left→right (Y_BAND rows)
 *  3. hide with stroke-dasharray = stroke-dashoffset = length
 *  4. build a paused GSAP timeline animating dashoffset→0, duration ∝ length,
 *     ease "none". Every stroke is placed at an ABSOLUTE time so the whole
 *     drawing takes exactly `duration` seconds (the previous relative
 *     "-=overlap" placement collapsed thousands of tiny tweens onto t≈0,
 *     which is why the sketches drew in a fraction of a second).
 *
 * Playback is independent of scroll (spec exception). `play()` always
 * (re)starts from an undrawn state; `reset()` hides the drawing again so it
 * can be replayed the next time its layer becomes active; `complete()` shows
 * the finished drawing instantly (layers sitting behind the active one).
 */
const Y_BAND = 22;
/** Extra dash/offset (svg units) so short strokes stay invisible until drawn. */
const DASH_PAD = 4;

function splitCompoundPath(path: SVGPathElement): SVGPathElement[] {
  const d = path.getAttribute("d");
  if (!d) return [path];
  const parts = d.split(/(?=[Mm])/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [path];
  const parent = path.parentNode;
  if (!parent) return [path];
  const clones = parts.map((part) => {
    const c = path.cloneNode(false) as SVGPathElement;
    c.setAttribute("d", part);
    return c;
  });
  clones.forEach((c) => parent.insertBefore(c, path));
  path.remove();
  return clones;
}

export function useStrokeDraw(
  hostRef: React.RefObject<HTMLElement | null>,
  { duration = 5, overlap = 0.015, onProgress }: { duration?: number; overlap?: number; onProgress?: (p: number) => void } = {}
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  /** what to do once the timeline exists, if a call came in before it was built */
  const pendingRef = useRef<"play" | "reset" | "complete" | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const svg = host?.querySelector("svg");
    if (!svg) return;

    let paths = Array.from(svg.querySelectorAll("path")) as SVGPathElement[];
    if (!paths.length) return;
    paths = paths.flatMap(splitCompoundPath);

    // Positions are measured on SCREEN (relative to the <svg>), not with
    // getBBox(): getBBox ignores ancestor transforms, and layer 3's groups are
    // mirrored (scale(-1,1)) / flipped (scale(1,-1)). Sorting by the raw
    // bbox put the flipped figure group first and drew it whole, so the
    // layer looked like it "spawned" instead of being sketched top→bottom.
    const svgBox = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const toUnits = svgBox.width > 0 && vb && vb.width > 0 ? vb.width / svgBox.width : 1;
    const measured = paths.map((el) => {
      let cx = 0, cy = 0, len = 1;
      try {
        const r = el.getBoundingClientRect();
        cx = (r.left - svgBox.left + r.width / 2) * toUnits;
        cy = (r.top - svgBox.top + r.height / 2) * toUnits;
        len = Math.max(el.getTotalLength(), 1);
      } catch {
        /* degenerate path */
      }
      return { el, cx, cy, len };
    });

    measured.sort((a, b) => (Math.abs(a.cy - b.cy) > Y_BAND ? a.cy - b.cy : a.cx - b.cx));
    const total = measured.reduce((s, m) => s + m.len, 0);

    // Dash = path length + PAD. Without the pad, a path shorter than its stroke
    // width (layer 3's figures are hundreds of 0.5–3 unit fragments) still
    // showed its round line-caps while "hidden", so the figures were fully
    // visible before the pen reached them — the "spawned in" look.
    measured.forEach(({ el, len }) => {
      el.style.strokeDasharray = String(len + DASH_PAD);
      el.style.strokeDashoffset = String(len + DASH_PAD);
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onUpdate: () => onProgressRef.current?.(tl.progress()) });
      let t = 0;
      measured.forEach(({ el, len }) => {
        const d = Math.max((len / total) * duration, 0.001);
        // absolute placement: start slightly before the previous stroke ends
        tl.to(el, { strokeDashoffset: 0, duration: d, ease: "none" }, Math.max(0, t - overlap));
        t += d;
      });
      tlRef.current = tl;
      // apply anything requested while we were still measuring
      if (pendingRef.current === "play") tl.restart();
      else if (pendingRef.current === "complete") tl.progress(1).pause();
      else onProgressRef.current?.(0);
      pendingRef.current = null;
    });

    return () => {
      tlRef.current = null;
      ctx.revert();
    };
  }, [hostRef, duration, overlap]);

  /** (Re)start drawing from an undrawn state. */
  const play = useCallback(() => {
    const tl = tlRef.current;
    onProgressRef.current?.(0);
    if (tl) tl.restart();
    else pendingRef.current = "play";
  }, []);

  /** Hide the drawing again so the next play() redraws it. */
  const reset = useCallback(() => {
    const tl = tlRef.current;
    onProgressRef.current?.(0);
    if (tl) tl.pause(0);
    else pendingRef.current = "reset";
  }, []);

  /** Show the finished drawing instantly (no animation). */
  const complete = useCallback(() => {
    const tl = tlRef.current;
    onProgressRef.current?.(1);
    if (tl) tl.progress(1).pause();
    else pendingRef.current = "complete";
  }, []);

  return { play, reset, complete, timeline: tlRef };
}
