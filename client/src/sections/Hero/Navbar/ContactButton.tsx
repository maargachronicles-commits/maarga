"use client";
import { heroConfig } from "../config/heroConfig";
export default function ContactButton() {
  return (
    <button
      className="
        flex
        items-center
        justify-center

        h-[40px]
        w-[110px]

        bg-[#AF311E]
        text-white

        text-[16px]
        font-normal

        transition-all
        duration-300

        hover:bg-[#972918]
        active:scale-[0.98]
      "
       style={{
    transform: `translate(${heroConfig.contactButton.x}px, ${heroConfig.contactButton.y}px)`,
  }}

      
    >
      Contact Us
    </button>
  );
}