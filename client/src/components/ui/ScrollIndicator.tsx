"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * Minimal overlay scroll position indicator.
 *
 * The native scrollbar (with its white track) is hidden in globals.css so the
 * site is truly full-bleed; this draws only the "thumb" — a thin ink pill on
 * the right edge whose position/size mirror the page scroll. It brightens
 * while the page moves, dims when idle, and can be dragged. Lenis-aware
 * (uses the smooth-scroll instance when present, window scroll otherwise).
 */
export default function ScrollIndicator() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    const root = rootRef.current;
    if (!thumb || !root) return;

    const MIN = 36;
    let docH = 0;
    let vh = 0;
    let thumbH = MIN;
    let idle: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      vh = window.innerHeight;
      docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      thumbH = docH > vh ? Math.max(MIN, (vh / docH) * vh) : 0;
      thumb.style.height = `${thumbH}px`;
      root.style.opacity = docH > vh + 4 ? "" : "0";
    };

    const paint = (scrollY: number) => {
      const max = Math.max(1, docH - vh);
      const y = Math.min(1, Math.max(0, scrollY / max)) * (vh - thumbH);
      thumb.style.transform = `translate3d(0,${y}px,0)`;
      root.dataset.moving = "true";
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        root.dataset.moving = "false";
      }, 900);
    };

    measure();
    paint(window.scrollY);

    // Follow Lenis when it's driving the scroll, else the window.
    const lenis = getLenis();
    const onLenis = (e: { scroll: number }) => paint(e.scroll);
    const onWin = () => paint(window.scrollY);
    if (lenis) lenis.on("scroll", onLenis);
    window.addEventListener("scroll", onWin, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(() => {
      measure();
      paint(window.scrollY);
    });
    ro.observe(document.documentElement);
    ro.observe(document.body);

    /* ---- drag to scroll ---- */
    let dragging = false;
    let grabOffset = 0;
    const toScroll = (clientY: number) => {
      const ratio = Math.min(1, Math.max(0, (clientY - grabOffset) / Math.max(1, vh - thumbH)));
      const target = ratio * (docH - vh);
      const l = getLenis();
      if (l) l.scrollTo(target, { immediate: true });
      else window.scrollTo(0, target);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      root.dataset.dragging = "true";
      const r = thumb.getBoundingClientRect();
      grabOffset = e.clientY - r.top;
      thumb.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) toScroll(e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      root.dataset.dragging = "false";
      try {
        thumb.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    thumb.addEventListener("pointerdown", onDown);
    thumb.addEventListener("pointermove", onMove);
    thumb.addEventListener("pointerup", onUp);
    thumb.addEventListener("pointercancel", onUp);
    // click on the track jumps there
    const onTrack = (e: PointerEvent) => {
      if (e.target !== root) return;
      grabOffset = thumbH / 2;
      toScroll(e.clientY);
    };
    root.addEventListener("pointerdown", onTrack);

    return () => {
      if (lenis) lenis.off("scroll", onLenis);
      window.removeEventListener("scroll", onWin);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      thumb.removeEventListener("pointerdown", onDown);
      thumb.removeEventListener("pointermove", onMove);
      thumb.removeEventListener("pointerup", onUp);
      thumb.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerdown", onTrack);
      if (idle) clearTimeout(idle);
    };
  }, []);

  return (
    <div ref={rootRef} className="scroll-indicator" aria-hidden data-moving="false" data-dragging="false">
      <div ref={thumbRef} className="scroll-indicator__thumb" />
    </div>
  );
}
