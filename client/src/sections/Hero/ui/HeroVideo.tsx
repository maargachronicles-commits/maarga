"use client";

export default function HeroVideo() {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
        poster="/images/hero-poster.webp"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}