import type { Metadata } from "next";
import ExperienceHero from "@/sections/experience/ExperienceHero";
import Footer from "@/sections/home/Footer";
import { PastEventCard, UpcomingEventRow } from "@/sections/events/EventCards";
import { getEvents } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const metadata: Metadata = { title: "Events — Maarga" };
export const dynamic = "force-dynamic";

/**
 * Events overview (Figma frame "Events- overview", 1512×5615): hero (photo darkened 30 %,
 * "EVENTS" + Clash 40 line) → "Upcoming Events" bar (135 px, #C8C8C8 rules, Open Calendar)
 * → upcoming rows → "How These Sessions Work" (three 403 px columns, 1 px red top rule) →
 * "Past Events" (411 px cards, horizontal scroller) → Begin Your Maarga + footer.
 * Upcoming / past is decided by the event date; everything else is CMS → Events.
 */
export default async function EventsPage() {
  const data = await getEvents();
  const s = data?.settings ?? {};
  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const principles = data?.principles ?? [];
  const calendar = s.eventsCalendarUrl?.trim();
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <div className="[&_#events-hero>div:first-child::after]:absolute [&_#events-hero>div:first-child::after]:inset-0 [&_#events-hero>div:first-child::after]:bg-black/30 [&_#events-hero>div:first-child::after]:content-['']">
        <ExperienceHero id="events-hero" image={s.eventsHeroImage} label={s.eventsHeroLabel || "EVENTS"} title={s.eventsHeroTitle || "Not every question needs a journey to answer it."} contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} />
      </div>

      <section id="upcoming" className="w-full">
        <div className="border-y border-[#C8C8C8]">
          <div className="container flex flex-wrap items-center justify-between gap-4 py-6 md:py-8">
            <h2 className="t-h2 text-black">{s.eventsUpcomingTitle || "Upcoming Events"}</h2>
            {calendar && (
              <a href={calendar} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-[10px] border border-red bg-cream px-3 text-red" style={{ fontFamily: "var(--font-clash)", fontSize: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M5 22c-.55 0-1.02-.2-1.41-.59A1.93 1.93 0 0 1 3 20V6c0-.55.2-1.02.59-1.41A1.93 1.93 0 0 1 5 4h1V2h2v2h8V2h2v2h1c.55 0 1.02.2 1.41.59.39.39.59.86.59 1.41v14c0 .55-.2 1.02-.59 1.41-.39.39-.86.59-1.41.59H5Zm0-2h14V10H5v10Zm0-12h14V6H5v2Zm7 6a1 1 0 0 1-.71-.29A1 1 0 0 1 11 13c0-.28.1-.52.29-.71A1 1 0 0 1 12 12c.28 0 .52.1.71.29.19.19.29.43.29.71s-.1.52-.29.71A1 1 0 0 1 12 14Zm-4 0a1 1 0 0 1-.71-.29A1 1 0 0 1 7 13c0-.28.1-.52.29-.71A1 1 0 0 1 8 12c.28 0 .52.1.71.29.19.19.29.43.29.71s-.1.52-.29.71A1 1 0 0 1 8 14Zm8 0a1 1 0 0 1-.71-.29A1 1 0 0 1 15 13c0-.28.1-.52.29-.71A1 1 0 0 1 16 12c.28 0 .52.1.71.29.19.19.29.43.29.71s-.1.52-.29.71A1 1 0 0 1 16 14Z" /></svg>
                {s.eventsCalendarText || "Open Calendar"}
              </a>
            )}
          </div>
        </div>
        <div className="container">
          {upcoming.length === 0 ? (
            <p className="t-body py-16 text-center text-ink/60">{s.eventsNoUpcoming || "No sessions are scheduled right now."}</p>
          ) : (
            <ul className="flex flex-col gap-[51px] py-[51px]">
              {upcoming.map((e) => (
                <UpcomingEventRow key={e.id} e={e} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {principles.length > 0 && (
        <section id="how" className="container pt-[80px] md:pt-[120px]">
          <div className="mx-auto flex max-w-[453px] flex-col items-center text-center">
            <p className="t-body text-red">{s.eventsHowLabel || "Events"}</p>
            <h2 className="t-h1 mt-1 text-ink">{s.eventsHowTitle || "How These Sessions Work"}</h2>
          </div>
          <ol className="mt-[58px] grid grid-cols-1 gap-8 md:grid-cols-3">
            {principles.map((p, i) => (
              <li key={p.id} className="border-t border-red pt-8">
                <p className="text-red" style={{ fontFamily: "var(--font-clash)", fontSize: 32, lineHeight: "39.4px" }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="t-h4 mt-6 text-ink">{p.title}</h3>
                <p className="t-body mt-6 text-ink">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {past.length > 0 && (
        <section id="past" className="w-full pt-[80px] md:pt-[137px]">
          <div className="container">
            <h2 className="t-h2 text-black">{s.eventsPastTitle || "Past Events"}</h2>
          </div>
          <div className="mx-auto w-full max-w-[1512px] pl-6 md:pl-[120px]">
            <ul className="-mr-6 flex snap-x gap-5 overflow-x-auto pb-4 pt-[37px] pr-6 md:-mr-0">
              {past.map((e) => (
                <PastEventCard key={e.id} e={e} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <Footer
        ctaImage={s.ctaImage}
        enquire={{ text: s.eventsEnquireCtaText || "Enquire Now", href: s.eventsEnquireCtaUrl || "/contact" }}
        cta={{ label: s.eventsEnquireLabel || "Enquire", title: s.eventsEnquireTitle || "Begin Your Maarga", text: s.eventsEnquireText || "" }}
        className="pt-[110px] md:pt-[189px]"
        bg="bg-cream"
      />
    </main>
  );
}
