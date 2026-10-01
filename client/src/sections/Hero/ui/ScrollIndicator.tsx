"use client";
import { heroPosition } from "../utils/heroPosition";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator() {
  return (
    <div
      className="
        absolute
        bottom-10
        left-1/2
        -translate-x-1/2
        flex
        flex-col
        items-center
        text-white
      "
  style={{
    transform: `translate(${heroPosition.scroll.x}px, ${heroPosition.scroll.y}px)`,
  }}
    >
      <span
        className="
          mb-2
          text-xs
          uppercase
          tracking-[0.35em]
          text-white/80
        "
      >
        Scroll
      </span>

      <ChevronDown
        size={26}
        className="animate-bounce"
      />
    </div>
  );
}