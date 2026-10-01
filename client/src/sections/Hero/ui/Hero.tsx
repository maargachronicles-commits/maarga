"use client";

import Navbar from "../Navbar/Navbar";
import HeroVideo from "./HeroVideo";
import HeroOverlay from "./HeroOverlay";
import HeroSubtitle from "./HeroSubtitle";
import HeroTitle from "./HeroTitle";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Premium Frame */}
      <div className="absolute inset-0 p-2">
        <div className="relative h-full w-full overflow-hidden">

          <HeroVideo />

          <HeroOverlay />

          <Navbar />

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center">

            {/* Top spacing */}
            <div className="h-[28vh]" />

            <HeroSubtitle />

            <HeroTitle />

            {/* Push scroll indicator to bottom */}
            <div className="flex-1" />

            <ScrollIndicator />

            <div className="h-10" />

          </div>

        </div>
      </div>
    </section>
  );
}