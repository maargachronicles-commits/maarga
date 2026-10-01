import type { Metadata } from "next";
import AboutHero from "@/sections/about/AboutHero";
import NormWeRefuse from "@/sections/about/NormWeRefuse";
import Manifesto from "@/sections/about/Manifesto";
import Founders from "@/sections/about/Founders";
import AboutIntellects from "@/sections/about/AboutIntellects";
import AboutWhy from "@/sections/about/AboutWhy";
import Principles from "@/sections/about/Principles";
import Footer from "@/sections/home/Footer";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { getAbout } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const metadata: Metadata = {
  title: "About us — Maarga",
  description: "The bridge we set out to build: why Maarga exists, the norm we refuse, our founders, our scholars and our principles.",
};

/* Fresh CMS data on every request, like the homepage. */
export const dynamic = "force-dynamic";

/**
 * About page (Figma frame "About Us", 1512×9065). Section order and spacing
 * follow the Figma; CMS-driven parts: manifesto cards (+ hover photos),
 * founders, intellects (shared with the homepage) and the seven photos of the
 * "Not Archival. Alive." composition.
 */
export default async function AboutPage() {
  const { data } = await getAbout();
  const s = data.settings;
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <ScrollIndicator />
      <AboutHero contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} />
      <NormWeRefuse />
      <Manifesto cards={data.cards} />
      <Founders items={data.founders} />
      <AboutIntellects items={data.intellects} copy={{ label: s.aboutIntellectsLabel, title: s.aboutIntellectsTitle, intro: s.aboutIntellectsIntro }} />
      <AboutWhy slots={s} cta={linkSetting(s, "aboutWhyCta", { text: "View our destinations", href: "/destinations" })} />
      <Principles />
      <Footer ctaImage={s.ctaImage} enquire={linkSetting(s, "enquireCta", { text: "Contact Us", href: "/contact" })} className="pt-[110px] md:pt-[197px]" bg="bg-cream" />
    </main>
  );
}
