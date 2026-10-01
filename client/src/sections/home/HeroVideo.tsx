"use client";

import { useEffect, useRef } from "react";

/**
 * Background video: autoplay / muted / loop / playsInline, object-cover, no
 * controls. Poster prevents layout shift and acts as the fallback if autoplay
 * is blocked or the file fails to load.
 */
export default function HeroVideo({ src }: { src?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Some browsers only autoplay after an explicit play() call.
    v.play().catch(() => {
      /* poster remains visible — acceptable fallback */
    });
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero-poster.jpg"
      aria-hidden
    >
      <source src={src || "/hero.mp4"} type="video/mp4" />
    </video>
  );
}
