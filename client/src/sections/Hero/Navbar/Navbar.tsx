"use client";

import Logo from "./Logo";
import NavigationMenu from "./NavigationMenu";
import ContactButton from "./ContactButton";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header
      className="
      absolute
      inset-x-0
      top-0
      z-50
      px-14
      pt-8
    "
    >
      <div
        className="
        mx-auto
        flex
        max-w-[1700px]
        items-center
        justify-between
      "
      >
        <Logo />

        <NavigationMenu />

        <div className="flex items-center gap-6">
          <ContactButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}