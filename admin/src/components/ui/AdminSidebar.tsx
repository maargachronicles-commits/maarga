"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SIDEBAR_KEY =
  "maarga_sidebar_collapsed";

const LOGO_KEY =
  "maarga_site_logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Homepage", href: "/homepage", icon: "⌂" },
  { label: "About page", href: "/about", icon: "◎" },
  { label: "Experience page", href: "/experience", icon: "◈" },
  // Destinations, each with its itineraries (codes HAM0001 / HAM00001…)
  { label: "Destinations & Itineraries", href: "/destinations", icon: "◒" },
  // Events overview + every event's own page
  { label: "Events", href: "/events", icon: "◷" },
  // Scholar profile library (used by the homepage, About, Experience, itineraries and events)
  { label: "Intellects", href: "/intellects", icon: "✦" },
  // Activity icons used in itineraries
  { label: "Icons", href: "/icons", icon: "▣" },
  // Media library: every image/video in folders, Gallery Bank + destination/event gallery toggles
  { label: "Gallery", href: "/gallery", icon: "▧" },
  // Homepage content lives in the live editor (/homepage) — this jumps to its tab
  { label: "Testimonials", href: "/homepage#testimonials", icon: "❝" },
  { label: "Enquiries", href: "/enquiries", icon: "✉" },
  { label: "Shop", href: "/shop", icon: "□" },
  { label: "Logo", href: "/logo", icon: "✦" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  const [siteLogo, setSiteLogo] =
    useState("");

  const [mounted, setMounted] =
    useState(false);

  /* Small screens: the sidebar becomes an off-canvas drawer opened from a top bar. */
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    const savedCollapsed =
      localStorage.getItem(
        SIDEBAR_KEY
      ) === "true";

    setCollapsed(
      savedCollapsed
    );

    const savedLogo =
      localStorage.getItem(
        LOGO_KEY
      );

    if (savedLogo) {
      setSiteLogo(
        savedLogo
      );
    }

    setMounted(true);

    const handleLogoUpdate = () => {
      setSiteLogo(
        localStorage.getItem(
          LOGO_KEY
        ) || ""
      );
    };

    const handleSidebarUpdate = () => {
      setCollapsed(
        localStorage.getItem(
          SIDEBAR_KEY
        ) === "true"
      );
    };

    window.addEventListener(
      "maarga-logo-updated",
      handleLogoUpdate
    );

    window.addEventListener(
      "maarga-sidebar-toggle",
      handleSidebarUpdate
    );

    return () => {
      window.removeEventListener(
        "maarga-logo-updated",
        handleLogoUpdate
      );

      window.removeEventListener(
        "maarga-sidebar-toggle",
        handleSidebarUpdate
      );
    };
  }, []);

  const toggleSidebar = () => {
    const next =
      !collapsed;

    setCollapsed(next);

    localStorage.setItem(
      SIDEBAR_KEY,
      String(next)
    );

    document.documentElement.style.setProperty(
      "--maarga-sidebar-width",
      next
        ? "76px"
        : "286px"
    );

    window.dispatchEvent(
      new Event(
        "maarga-sidebar-toggle"
      )
    );
  };

  const isActive = (
    href: string
  ) => {
    if (
      href === "/dashboard"
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };

  if (!mounted) {
    return (
      <aside
        className="admin-sidebar fixed left-0 top-0 z-[100] h-screen bg-[#202020]"
        style={{
          width:
            "var(--maarga-sidebar-width)",
        }}
      />
    );
  }

  return (
    <>
    {/* Mobile top bar */}
    <div className="admin-topbar">
      <button
        type="button"
        className="admin-topbar__menu"
        aria-label={drawerOpen ? "Close menu" : "Open menu"}
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {drawerOpen ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
        </svg>
      </button>
      <span className="admin-topbar__title">MAARGA <em>CMS</em></span>
    </div>
    {drawerOpen && <div className="admin-scrim" onClick={() => setDrawerOpen(false)} aria-hidden />}

    <aside
      className={`admin-sidebar fixed left-0 top-0 z-[100] flex h-screen flex-col border-r border-[#383838] bg-[#202020] text-white transition-[width,transform] duration-300 ${drawerOpen ? "is-open" : ""}`}
      style={{
        width:
          "var(--maarga-sidebar-width)",
      }}
    >

      {/* HEADER */}

      <div
        className={`relative h-[156px] py-8 ${
          collapsed
            ? "flex justify-center px-3"
            : "px-7"
        }`}
      >

        {!collapsed ? (
          <div>

            {siteLogo ? (
              <img
                src={siteLogo}
                alt="MAARGA"
                className="max-h-[55px] max-w-[190px] object-contain object-left"
              />
            ) : (
              <>
                <h1 className="font-sans text-[25px] font-semibold tracking-[-0.03em] text-white">
                  MAARGA
                </h1>

                <p className="mt-1 font-serif text-[11px] italic text-[#858585]">
                  WEBSITE CMS
                </p>
              </>
            )}

          </div>
        ) : (
          <div className="flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-full border border-[#444] bg-[#151515]">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="MAARGA"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <span className="text-[13px]">
                M
              </span>
            )}
          </div>
        )}

        {/* TOGGLE */}

        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute right-[-14px] top-[30px] z-[120] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#4A4A4A] bg-[#292929] text-[15px] text-[#DDD] shadow-lg transition hover:bg-[#B43122] hover:text-white"
          aria-label={
            collapsed
              ? "Open sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed
            ? "›"
            : "‹"}
        </button>

      </div>


      {/* NAVIGATION */}

      <nav
        className={`flex-1 overflow-y-auto pb-4 ${
          collapsed
            ? "px-[17px]"
            : "px-[22px]"
        }`}
      >

        <div className="space-y-1">

          {navItems.map(
            (item) => {
              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={`group flex h-[48px] items-center rounded-[6px] transition ${
                    collapsed
                      ? "justify-center"
                      : "gap-3 px-4"
                  } ${
                    active
                      ? "bg-[#B51F1F] text-white"
                      : "text-[#A8A8A8] hover:bg-[#2B2B2B] hover:text-white"
                  }`}
                >

                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-[13px]">
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="truncate text-[12px] font-medium">
                      {item.label}
                    </span>
                  )}

                </Link>
              );
            }
          )}

        </div>

      </nav>


      {/* USER */}

      <div
        className={`border-t border-[#383838] ${
          collapsed
            ? "flex justify-center px-3 py-5"
            : "px-6 py-5"
        }`}
      >

        {collapsed ? (
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#111] bg-[#111] text-[11px]">
            M
          </div>
        ) : (
          <div className="flex items-center gap-3">

            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#111] text-[12px]">
              M
            </div>

            <div>

              <p className="text-[11px] font-medium text-white">
                Mamtha Rao
              </p>

              <p className="mt-1 text-[9px] italic text-[#777]">
                Administrator
              </p>

            </div>

          </div>
        )}

      </div>

    </aside>
    </>
  );
}