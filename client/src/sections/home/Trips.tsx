"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { useCarousel } from "./useCarousel";
import type { Trip } from "@/lib/types";

const GAP = 30;

/**
 * "What Trips Are We Organising Now" (Figma Frame 273). Track of 1170×505
 * cards, 30px gap, starting at the content column's left edge; the next card
 * peeks in at the right (clipped by the page). Card: 313px red panel
 * (24px padding, space-between) + 857px image. The cream rangoli pattern the
 * Figma laid over the photo was removed on request. On phones the photo comes
 * FIRST and the red text panel below it. CMS-driven via /api/trips.
 */
export default function Trips({ items, intro }: { items: Trip[]; intro?: string }) {
  const { trackRef, prev, next, atStart, atEnd } = useCarousel(items.length, GAP);
  const lead = intro || items[0]?.body;

  return (
    <section id="trips" className="w-full bg-white pt-[90px] md:pt-[150px]">
      <div className="container">
        <SectionHeading label="Our Trips" title="What Trips Are We Organising Now" body={lead} />
      </div>

      <div className="mt-6 w-full overflow-hidden">
        <div className="container">
          <div ref={trackRef} className="flex will-change-transform" style={{ gap: GAP, transition: "transform .7s cubic-bezier(.4,0,.2,1)" }}>
            {items.map((t) => (
              <article
                key={t.id}
                className="flex h-auto w-[min(1170px,calc(100vw-48px))] flex-none flex-col-reverse overflow-hidden bg-cream md:h-[505px] md:flex-row"
              >
                <div className="flex w-full flex-col justify-between bg-red p-6 text-cream md:w-[313px]">
                  <div>
                    <p className="t-body text-cream/60">{t.category}</p>
                    <h3 className="t-h2 mt-1">{t.heading}</h3>
                    {t.subtitle && <p className="t-body mt-1">{t.subtitle}</p>}
                    <div className="t-body mt-2 flex justify-between">
                      <span>{t.dates}</span>
                      <span>{t.duration}</span>
                    </div>
                    <p className="t-body mt-[46px]">{t.body}</p>
                  </div>
                  <div className="mt-8 flex flex-col gap-2 md:mt-0">
                    <Link href={t.bookNowUrl || `/experience/${t.id}`} className="btn-cream">
                      {t.primaryCtaText || `Experience ${t.heading.split(",")[0]} with us`}
                    </Link>
                    <Link href={t.secondaryCtaUrl || `/experience/${t.id}`} className="btn-cream">
                      {t.secondaryCtaText || "View Itinerary"}
                    </Link>
                  </div>
                </div>
                <div className="relative h-[320px] w-full overflow-hidden md:h-full md:flex-1">
                  <Image src={t.image} alt={t.heading} fill sizes="(min-width:1024px) 857px, 100vw" className="object-cover" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <CarouselArrows onPrev={prev} onNext={next} prevDisabled={atStart} nextDisabled={atEnd} />
      </div>
    </section>
  );
}
