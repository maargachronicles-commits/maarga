import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/sections/home/Navbar";
import Footer from "@/sections/home/Footer";
import MediaGrid from "@/sections/destination/MediaGrid";
import { timeRange } from "@/sections/events/EventCards";
import { getEvent } from "@/lib/api";
import { formatLongDate, linkSetting } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getEvent(id);
  return { title: data ? `${data.event.title} — Events — Maarga` : "Event — Maarga" };
}

const Fact = ({ label, value, note, big }: { label: string; value: string; note?: string; big?: boolean }) => (
  <div>
    <p className="t-small text-red">{label}</p>
    <p className={`${big ? "t-h2" : "t-h4"} mt-[2px] text-black`}>{value}</p>
    {note && <p className="t-small text-ink">{note}</p>}
  </div>
);

/**
 * Event detail (Figma "Events - information" / "Events - After the event"): header on cream,
 * 1272×502 photo, breadcrumb, 903 px copy (title, paragraphs, "Led by our Intellects" 274 px
 * cards, "Who is this for") beside a 299 px sidebar with a 1 px red left rule (date, time,
 * location, early bird, red "Book now"). Once the date has passed the booking disappears and
 * "Post event" (text + attendee feedback cards) and the event gallery appear.
 */
export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEvent(id);
  if (!data) notFound();
  const { event: e, settings: s } = data;
  const paragraphs = (e.body || e.description || "").split(/\n\s*\n/).filter(Boolean);
  const past = !!e.isPast;
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <div className="relative h-[104px] w-full">
        <Navbar contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} onCream />
      </div>

      <div className="container">
        <div className="relative aspect-[1272/502] w-full overflow-hidden bg-red">
          {e.image && <Image src={e.image} alt={e.imageAltText || e.title} fill priority sizes="(min-width:1320px) 1272px, 100vw" className="object-cover" />}
        </div>
        <nav aria-label="Breadcrumb" className="t-body mt-[42px] flex flex-wrap items-center gap-3 text-black">
          <Link href="/events" className="underline underline-offset-[3px] hover:text-red">
            Events
          </Link>
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" aria-hidden><path d="m1 1 4 4-4 4" /></svg>
          <span>{e.title}</span>
        </nav>

        <div className="mt-[37px] grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,903px)_299px] lg:justify-between lg:gap-[70px]">
          <article className="flex flex-col gap-[47px]">
            <div>
              <h1 className="t-h2 text-black">{e.title}</h1>
              <div className="t-body mt-[14px] flex flex-col gap-[15px] text-black">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {data.intellects.length > 0 && (
              <section>
                <h2 className="t-h2 text-ink">{s.eventsLedByTitle || "Led by our Intellects"}</h2>
                <ul className="mt-[14px] grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
                  {data.intellects.map((p) => (
                    <li key={p.id}>
                      <div className="relative aspect-[274/290] w-full overflow-hidden rounded-[4px] bg-ink/5">
                        <Image src={p.image} alt={p.name} fill sizes="274px" className="object-cover" />
                      </div>
                      <h3 className="t-h3 mt-4 text-red">{p.name}</h3>
                      <p className="t-body mt-2 text-ink">{p.designation}</p>
                      <p className="t-body mt-2 text-ink">{p.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {e.whoIsThisFor && (
              <section>
                <h2 className="t-h2 text-black">{s.eventsWhoTitle || "Who is this for"}</h2>
                <p className="t-body mt-[14px] text-black">{e.whoIsThisFor}</p>
              </section>
            )}
          </article>

          <aside className="self-start border-l border-red py-6 pl-6 lg:sticky lg:top-[80px] lg:pl-9">
            <div className="flex flex-col gap-6">
              <Fact label="date" value={formatLongDate(e.eventDate)} big />
              {timeRange(e) && <Fact label="time" value={timeRange(e)} big />}
              {e.location && <Fact label="location" value={e.location} big />}
              {e.format === "ONLINE" && e.meetingLink && !past && <Fact label="format" value="Online" note="Link is sent after booking" />}
              {!past && e.earlyBirdEnabled && e.earlyBirdPrice != null && <Fact label="early bird" value={`${e.earlyBirdPrice}/person`} note={e.earlyBirdNote || undefined} big />}
              {!past && !e.earlyBirdEnabled && e.standardTicketPrice != null && <Fact label="price" value={`${e.standardTicketPrice}/person`} big />}
            </div>
            {!past && (e.bookUrl || e.bookCtaText) && (
              <Link href={e.bookUrl || "/contact"} className="btn-red mt-6 w-full">
                {e.bookCtaText || "Book now"}
              </Link>
            )}
          </aside>
        </div>

        {past && (e.postEventText || e.feedback.length > 0) && (
          <section className="mt-[100px] md:mt-[130px]">
            <div className="max-w-[903px]">
              <h2 className="t-h2 text-black">{s.eventsPostTitle || "Post event"}</h2>
              {e.postEventText && <p className="t-body mt-[6px] text-black">{e.postEventText}</p>}
            </div>
            {e.feedback.length > 0 && (
              <ul className="-mr-6 mt-[56px] flex snap-x gap-6 overflow-x-auto pb-4 pr-6 md:mr-0">
                {e.feedback.map((f, i) => (
                  <li key={i} className="relative w-[320px] flex-none snap-start overflow-hidden border border-red bg-white px-8 pb-[80px] pt-[30px] sm:w-[538px] sm:px-9">
                    <img src="/figma/quote.svg" alt="" aria-hidden width={30} height={31} />
                    <blockquote className="t-body mt-2 text-ink">{f.quote}</blockquote>
                    <p className="t-h4 mt-6 text-ink">{f.name}</p>
                    {f.role && <p className="t-small text-ink">{f.role}</p>}
                    <img src="/figma/pattern-testimonial.svg" alt="" aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full opacity-60" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {past && data.gallery.length > 0 && (
        <section className="w-full pt-[80px] md:pt-[87px]">
          <div className="container">
            <h2 className="t-h2 text-black">{s.eventsGalleryTitle || "Gallery"}</h2>
          </div>
          <div className="mt-[30px]">
            <MediaGrid items={data.gallery} paginate={false} />
          </div>
        </section>
      )}

      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: s.eventsEnquireCtaText || "Enquire Now", href: s.eventsEnquireCtaUrl || "/contact" }}
        cta={{ label: s.eventsEnquireLabel || "Enquire", title: s.eventsEnquireTitle || "Begin Your Maarga", text: s.eventsEnquireText || "" }}
        className="pt-[110px] md:pt-[133px]"
        bg="bg-cream"
      />
    </main>
  );
}
