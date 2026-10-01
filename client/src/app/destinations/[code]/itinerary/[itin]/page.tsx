import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExperienceHero from "@/sections/experience/ExperienceHero";
import ItineraryView from "@/sections/destination/ItineraryView";
import Stays from "@/sections/destination/Stays";
import ExperienceIntellects from "@/sections/experience/ExperienceIntellects";
import Footer from "@/sections/home/Footer";
import { destinationTabs } from "@/sections/destination/tabs";
import { getItinerary } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string; itin: string }> }): Promise<Metadata> {
  const { code, itin } = await params;
  const data = await getItinerary(code, itin);
  return { title: data ? `${data.itinerary.title} — ${data.destination.name} — Maarga` : "Itinerary — Maarga" };
}

/**
 * Itinerary page (Figma frame "Itinerary", 1512×8591): destination hero with the red
 * "Enquire about this journey" button + tabs → Journey Path + day rail → Where you'll stay
 * → the itinerary's own scholars → Begin Your Maarga + footer. Everything comes from
 * CMS → Destinations & Itineraries → <destination> → <itinerary>.
 */
export default async function ItineraryPage({ params }: { params: Promise<{ code: string; itin: string }> }) {
  const { code, itin } = await params;
  const data = await getItinerary(code, itin);
  if (!data) notFound();
  const { destination: d, itinerary: it, settings: s } = data;
  const heroCta = it.heroCtaText?.trim() ? { text: it.heroCtaText.trim(), href: it.heroCtaUrl?.trim() || d.enquireCtaUrl || "/contact" } : null;
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <ExperienceHero
        id="itinerary-hero"
        image={it.heroImage || d.heroImage}
        label={it.heroLabel || d.heroLabel || d.name.toUpperCase()}
        title={it.heroTitle || d.heroTitle || "Experience the India in a never before pathway"}
        contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })}
        tabs={destinationTabs(d, "itinerary")}
        cta={heroCta}
      />
      <ItineraryView itinerary={it} icons={data.icons} siblings={data.siblings} destinationCode={d.code} />
      <Stays title={it.staysTitle || "Where you'll stay"} stays={it.stays} />
      {data.intellects.length > 0 && (
        <ExperienceIntellects
          items={data.intellects}
          copy={{ label: it.intellectsLabel || "Intellects", title: it.intellectsTitle || "The Scholar Who Reads This Place", intro: it.intellectsIntro || "" }}
        />
      )}
      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: it.enquireCtaText || d.enquireCtaText || "Enquire about this journey", href: it.enquireCtaUrl || d.enquireCtaUrl || "/contact" }}
        cta={{ label: it.enquireLabel || d.enquireLabel || "Enquire", title: it.enquireTitle || d.enquireTitle || "Begin Your Maarga", text: it.enquireText || d.enquireText || "" }}
        className="pt-[110px] md:pt-[170px]"
        bg="bg-cream"
      />
    </main>
  );
}
