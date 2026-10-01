"use client";
import { heroPosition } from "../utils/heroPosition";
export default function HeroTitle() {
  return (
    <div
      className="
      relative
      w-full
      overflow-hidden
      select-none
      "
  style={{
    transform: `translate(${heroPosition.title.x}px, ${heroPosition.title.y}px)`,
  }}
    >
      <h1
        className="
        whitespace-nowrap
        text-center
        text-white

        font-extralight
        leading-[0.82]
        tracking-[-0.055em]

        text-[clamp(150px,22vw,420px)]

        pointer-events-none
        "
      >
        MAARGA
      </h1>
    </div>
  );
}