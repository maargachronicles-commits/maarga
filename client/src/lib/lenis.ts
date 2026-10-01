"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let instance: Lenis | null = null;

/** Create (once) the Lenis smooth-scroll instance wired into GSAP's ticker. */
export function initLenis() {
  if (instance || typeof window === "undefined") return instance;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  instance = new Lenis({ lerp: 0.1, smoothWheel: true });
  instance.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => instance?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return instance;
}

export function getLenis() {
  return instance;
}

export function destroyLenis() {
  instance?.destroy();
  instance = null;
}
