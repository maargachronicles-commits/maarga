import type { Metadata } from "next";
import ExperienceHero from "@/sections/experience/ExperienceHero";
import PlaceMap from "@/sections/experience/PlaceMap";
import TwoLenses from "@/sections/experience/TwoLenses";
import Fragments from "@/sections/experience/Fragments";
import ExperienceIntellects from "@/sections/experience/ExperienceIntellects";
import Questions from "@/sections/experience/Questions";
import Footer from "@/sections/home/Footer";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { getExperience } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const metadata: Metadata = {
  title: "Experience — Maarga",
  description: "Hampi, Karnataka: read as engineering, read as cosmology — the scholar who reads this place, and the questions it still asks.",
};

/* Fresh CMS data on every request, like the homepage. */
export const dynamic = "force-dynamic";

/**
 * Experience page (Figma frame "Experience", 1512×9692). Every heading,
 * paragraph, photo, site, fragment, question and scholar comes from the CMS
 * (admin → Experience page); defaults mirror the Figma (Hampi).
 */
export default async function ExperiencePage() {
  const { data } = await getExperience();
  const s = data.settings;
  const t = (key: string, fallback = "") => s[key]?.trim() || fallback;
  const tab = (key: "expTabExperience" | "expTabItinerary" | "expTabGallery", text: string, href: string) => ({
    text: t(`${key}Text`, text),
    href: t(`${key}Url`, href),
  });

  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <ScrollIndicator />
      <ExperienceHero
        image={s.expHeroImage}
        label={t("expHeroLabel", "HAMPI")}
        title={t("expHeroTitle", "Experience the India in a never before pathway")}
        contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })}
        tabs={[
          { ...tab("expTabExperience", "Experience", "/experience"), active: true },
          tab("expTabItinerary", "Itinerary", "/experience#itinerary"),
          tab("expTabGallery", "Gallery", "/gallery"),
        ]}
      />
      <PlaceMap
        name={t("expPlaceName", "Hampi,")}
        region={t("expPlaceRegion", "Karnataka")}
        overviewTitle={t("expOverviewTitle", "Overview")}
        overviewText={t("expOverviewText")}
      />
      <TwoLenses
        told={{ label: t("expToldLabel", "What You've Been Told"), text: t("expToldText") }}
        heading={{ title: t("expLensesTitle", "Two Lenses, One Place"), sub: t("expLensesSub", "Read as Engineering / Read as Cosmology") }}
        sites={data.sites}
        hint={t("expClickHint", "*Click here on the person to experience the sight digitally")}
      />
      <div className="h-[100px] md:h-[172px]" aria-hidden />
      <Fragments label={t("expFragmentsLabel", "Fragments")} hint={t("expFragmentsHint", "Scroll down for next")} items={data.fragments} />
      <ExperienceIntellects
        items={data.intellects}
        copy={{ label: t("expIntellectsLabel", "Intellects"), title: t("expIntellectsTitle", "The Scholar Who Reads This Place"), intro: t("expIntellectsIntro") }}
      />
      <Questions title={t("expQuestionsTitle", "Questions Hampi Still Asks")} items={data.questions} />
      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: t("expEnquireCtaText", "Book The Architecture of an Empire"), href: t("expEnquireCtaUrl", "/contact") }}
        cta={{ label: t("expEnquireLabel", "Enquire"), title: t("expEnquireTitle", "Begin Your Maarga"), text: t("expEnquireText") }}
        className="pt-[110px] md:pt-[170px]"
        bg="bg-cream"
      />
    </main>
  );
}
