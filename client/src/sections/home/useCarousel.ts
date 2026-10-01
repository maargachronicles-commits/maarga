"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Click-driven horizontal carousel. The track is translated by
 * −index × (card width + gap), measured from the DOM so it stays correct at
 * any viewport. Transform-only (no layout thrash).
 */
export function useCarousel(count: number, gap: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const apply = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const first = track.firstElementChild as HTMLElement | null;
      const w = first ? first.getBoundingClientRect().width : 0;
      track.style.transform = `translate3d(${-i * (w + gap)}px, 0, 0)`;
    },
    [gap]
  );

  useEffect(() => {
    apply(index);
    const onResize = () => apply(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index, apply]);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(count - 1, i + 1));

  return { trackRef, index, prev, next, atStart: index === 0, atEnd: index >= count - 1 };
}
