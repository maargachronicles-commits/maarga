"use client";

export default function Story5() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#A62F20]">
      {/* Topographic background */}
      <img
        src="/4.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {/* content goes here */}
      </div>
    </section>
  );
}