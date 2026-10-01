"use client";
import { heroPosition } from "../utils/heroPosition";
export default function HeroSubtitle() {
  return (
    <div
      className="
      mb-12
      flex
      justify-center
      px-6
      text-center
      "
  style={{
    transform: `translate(${heroPosition.subtitle.x}px, ${heroPosition.subtitle.y}px)`,
  }}
    >
      <p
        className="
        max-w-4xl

        text-[clamp(15px,1vw,18px)]
        font-light
        uppercase

        tracking-[0.42em]

        text-white/95

        select-none
        "
      >
        Paths to India's Living Knowledge
      </p>
    </div>
  );
}