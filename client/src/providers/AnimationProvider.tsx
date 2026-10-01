"use client";

import { ReactNode, useEffect } from "react";
import { initLenis, destroyLenis } from "@/lib/lenis";

/** Boots Lenis smooth scrolling + GSAP ScrollTrigger sync for the whole app. */
export default function AnimationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initLenis();
    return () => destroyLenis();
  }, []);

  return <>{children}</>;
}
