"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <a
      href="/"
      className="relative flex h-16 w-16 items-center justify-center transition-opacity duration-300 hover:opacity-90"
    >
      <Image
        src="/maarga-logo.svg"
        alt="Maarga"
        fill
        priority
        className="object-contain"
      />
    </a>
  );
}