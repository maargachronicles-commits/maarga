"use client";

export default function StoryNavigation() {
  return (
    <div className="flex items-end justify-between">

      <div className="w-32" />

      <p
        className="
          story-scroll
          text-[15px]
          italic
          text-[#5E544D]
          tracking-wide
          select-none
        "
      >
        Scroll down to go ahead
      </p>

      <button
        className="
          story-skip
          text-[#B5482B]
          text-[15px]
          italic
          hover:translate-x-1
          transition-all
          duration-300
        "
      >
        Skip →
      </button>

    </div>
  );
}