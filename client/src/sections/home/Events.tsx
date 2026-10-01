"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import CarouselArrows from "@/components/ui/CarouselArrows";
import { useCarousel } from "./useCarousel";
import { formatEventDate } from "@/lib/api";
import type { EventItem } from "@/lib/types";

const GAP = 30;

/**
 * "Knowledge Sessions" (Figma Frame 293). Cards 845×505, 1px red border on
 * cream, 313px text panel (dates in red) + 532px image with the card pattern
 * (right part of it) overlaid at the bottom-left. Red "Know more" button.
 * On phones the photo comes first, the text panel below it.
 * Fully CMS-driven via /api/events (published + PUBLIC only).
 */
const DEFAULT_INTRO =
  "Maarga runs scholar-led sessions, live knowledge experiences, and intimate gatherings beyond travel — for those who cannot always journey but will not settle for surface-level engagement. Held in small groups. Never programmatic.";

export default function Events({ items, intro }: { items: EventItem[]; intro?: string }) {
  const { trackRef, prev, next, atStart, atEnd } = useCarousel(items.length, GAP);

  return (
    <section id="events" className="w-full bg-white pt-[80px] md:pt-[130px]">
      <div className="container">
        <SectionHeading
          label="Events"
          title="Knowledge Sessions"
          body={intro || DEFAULT_INTRO}
        />
      </div>

      <div className="mt-10 w-full overflow-hidden">
        <div className="container">
          <div ref={trackRef} className="flex will-change-transform" style={{ gap: GAP, transition: "transform .7s cubic-bezier(.4,0,.2,1)" }}>
            {items.map((e) => (
              <article
                key={e.id}
                className="flex w-[min(845px,calc(100vw-48px))] flex-none flex-col-reverse overflow-hidden border border-red bg-cream md:h-[505px] md:flex-row"
              >
                <div className="flex w-full flex-col justify-between p-6 text-ink md:w-[313px]">
                  <div>
                    <p className="t-body text-ink/60">{e.category || "Knowledge Session"}</p>
                    <h3 className="t-h2 mt-1">{e.title}</h3>
                    {e.location && <p className="t-body mt-1">{e.location}</p>}
                    <div className="t-body mt-2 flex justify-between text-red">
                      <span className="font-semibold">{formatEventDate(e.eventDate)}</span>
                      <span>{e.duration}</span>
                    </div>
                    {e.description && <p className="t-body mt-[46px]">{e.description}</p>}
                  </div>
                  <Link href={e.ctaUrl || e.meetingLink || `/events/${e.id}`} className="btn-red mt-8 w-full md:mt-0">
                    {e.ctaText || "Know more"}
                  </Link>
                </div>
                <div className="relative h-[320px] w-full overflow-hidden md:h-full md:flex-1">
                  {e.image && (
                    <Image src={e.image} alt={e.imageAltText || e.title} fill sizes="(min-width:1024px) 532px, 100vw" className="object-cover" />
                  )}
                  <img
                    src="/figma/pattern-card.svg"
                    alt=""
                    aria-hidden
                    width={947}
                    height={184}
                    className="pointer-events-none absolute left-[-727px] top-[290px] w-[952px] max-w-none"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <CarouselArrows onPrev={prev} onNext={next} prevDisabled={atStart} nextDisabled={atEnd} />
      </div>
    </section>
  );
}
