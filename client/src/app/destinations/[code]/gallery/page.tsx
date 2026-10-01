import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExperienceHero from "@/sections/experience/ExperienceHero";
import MediaGrid from "@/sections/destination/MediaGrid";
import Footer from "@/sections/home/Footer";
import { destinationTabs } from "@/sections/destination/tabs";
import { getDestination } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const data = await getDestination(code);
  return { title: data ? `Gallery — ${data.destination.name} — Maarga` : "Gallery — Maarga" };
}

/**
 * Destination gallery (Figma frame "Gallery", 1512×5386): hero + tabs (Gallery active) →
 * 3-column grid of the photos the CMS marked "Show in this destination's gallery"
 * (CMS → Gallery → folder <destination>) → Begin Your Maarga + footer.
 */
export default async function DestinationGallery({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getDestination(code);
  if (!data) notFound();
  const { destination: d, settings: s } = data;
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <ExperienceHero
        id="gallery-hero"
        image={d.heroImage}
        label={d.heroLabel || d.name.toUpperCase()}
        title={d.heroTitle || "Experience the India in a never before pathway"}
        contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })}
        tabs={destinationTabs(d, "gallery")}
      />
      <section className="w-full bg-cream pt-[48px] md:pt-[65px]">
        <MediaGrid items={data.gallery} />
      </section>
      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: d.enquireCtaText || "Enquire about this journey", href: d.enquireCtaUrl || "/contact" }}
        cta={{ label: d.enquireLabel || "Enquire", title: d.enquireTitle || "Begin Your Maarga", text: d.enquireText || "" }}
        className="pt-[80px] md:pt-[97px]"
        bg="bg-cream"
      />
    </main>
  );
}
