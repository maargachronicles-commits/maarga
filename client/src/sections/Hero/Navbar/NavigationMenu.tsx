"use client";

const links = [
  "Home",
  "About Us",
  "Experience",
  "Destinations",
  "Events",
  "Gallery",
  "Shop",
];

export default function NavigationMenu() {
  return (
    <nav>
      <ul className="hidden lg:flex items-center gap-14">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="
              text-[15px]
              font-light
              tracking-wide
              text-white/90
              transition-all
              duration-300
              hover:text-white
              hover:opacity-100
            "
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}