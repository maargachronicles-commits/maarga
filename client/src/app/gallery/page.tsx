import type { Metadata } from "next";
import Navbar from "@/sections/home/Navbar";
import MediaGrid from "@/sections/destination/MediaGrid";
import Footer from "@/sections/home/Footer";
import { getGalleryBank } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const metadata: Metadata = { title: "Gallery — Maarga" };
export const dynamic = "force-dynamic";

/**
 * Gallery Bank (Figma frame "Gallery-Bank", 1512×5095): dark header on cream, "Gallery" +
 * Clash 28 line, Location dropdown (417 px, red outline) + All / Images / Videos, the
 * 3-column grid, page arrows, Begin Your Maarga + footer. Shows every media-library item
 * the CMS toggled "Show in Gallery Bank"; the location filter lists the destinations
 * whose folders have such items.
 */
export default async function GalleryBankPage() {
  const data = await getGalleryBank();
  const s = data?.settings ?? {};
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <div className="relative h-[104px] w-full">
        <Navbar contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} onCream />
      </div>
      <section className="w-full pt-[85px]">
        <div className="mx-auto flex max-w-[543px] flex-col items-center px-6 text-center">
          <p className="t-body text-red">{s.bankLabel || "Gallery"}</p>
          <h1 className="t-h2 mt-1 text-ink">{s.bankTitle || "Places do not speak for themselves. These do."}</h1>
        </div>
        <div className="mt-[100px]">
          <MediaGrid items={data?.items ?? []} locations={data?.locations ?? []} locationLabel={s.bankLocationLabel || "Location"} filters />
        </div>
      </section>
      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: s.bankEnquireCtaText || "Book The Architecture of an Empire", href: s.bankEnquireCtaUrl || "/contact" }}
        cta={{ label: s.bankEnquireLabel || "Enquire", title: s.bankEnquireTitle || "Begin Your Maarga", text: s.bankEnquireText || "" }}
        className="pt-[110px] md:pt-[166px]"
        bg="bg-cream"
      />
    </main>
  );
}
