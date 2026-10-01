"use client";

import Image from "next/image";
import Story4Text from "./Story4Text";

export default function Story4() {
  return (
    <section className="relative h-screen overflow-hidden bg-[#A6422A]">
      {/* Background */}
      <Image
        src="/terabg.svg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Content */}
      <div className="absolute inset-0">
        <Story4Text />
      </div>
    </section>
  );
}