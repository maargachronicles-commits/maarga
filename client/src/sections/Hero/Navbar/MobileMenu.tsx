"use client";

import { Menu } from "lucide-react";

export default function MobileMenu() {
  return (
    <button
      className="
      lg:hidden
      flex
      items-center
      justify-center
      text-white
    "
    >
      <Menu size={30} />
    </button>
  );
}