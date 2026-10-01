"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityIcon, Itinerary, ItinerarySummary } from "@/lib/types";

/**
 * Itinerary page body (Figma "Itinerary" frame, Frames 424 / 445):
 *   • heading row — "Journey Path" (Erode 16 red) + Clash 40 title on the left; on the right a
 *     267×50 cream dropdown outlined red with the duration label (switches between this
 *     destination's itineraries) and a 50×50 red download button;
 *   • a 164 px day rail (rows 75 px, active row outlined red, others ink 30 %) that stays put while
 *     the days scroll on the right — clicking a day scrolls to it, scrolling highlights the day in view;
 *   • each day: 535×420 photo (28 px gap) + copy: "Day-N" (30 %) + day title, then the activities:
 *     Clash 22 red title, "activities" (Erode 12 #BEBDBB), the 24 px red icon squares, Erode 16 text.
 * Below 1024 px the rail becomes a horizontal scroller and the photo stacks above the copy.
 */
export default function ItineraryView({
  itinerary,
  icons,
  siblings,
  destinationCode,
}: {
  itinerary: Itinerary;
  icons: Record<string, ActivityIcon>;
  siblings: ItinerarySummary[];
  destinationCode: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dayRefs = useRef<(HTMLElement | null)[]>([]);
  const days = itinerary.days ?? [];

  /* highlight the day that is in view */
  useEffect(() => {
    const els = dayRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(Number((visible[0].target as HTMLElement).dataset.index));
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [days.length]);

  const goTo = (i: number) => {
    setActive(i);
    dayRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const others = useMemo(() => siblings.filter((s) => s.id !== itinerary.id), [siblings, itinerary.id]);

  const download = () => {
    if (itinerary.pdfUrl) window.open(itinerary.pdfUrl, "_blank", "noopener");
    else window.print();
  };

  return (
    <section id="itinerary" className="w-full bg-cream pt-[56px] md:pt-[71px]">
      <div className="container">
        {/* heading row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[628px]">
            <p className="t-body text-red">{itinerary.label || "Journey Path"}</p>
            <h2 className="t-h1 mt-1 text-ink">{itinerary.title}</h2>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="t-body flex h-[50px] w-[267px] items-center justify-between border border-red bg-cream px-6 text-red"
              >
                <span className="truncate">{itinerary.durationLabel || itinerary.title}</span>
                <svg width="13" height="8" viewBox="0 0 13 8" fill="none" aria-hidden className={`ml-2 flex-none transition-transform ${open ? "rotate-180" : ""}`}>
                  <path d="M0.5 0.5 6.5 6.5 12.5 0.5" stroke="currentColor" strokeWidth="1.45" />
                </svg>
              </button>
              {open && (
                <ul role="listbox" className="absolute right-0 top-[54px] z-20 w-[267px] border border-red bg-cream shadow-[0_8px_24px_rgba(39,39,39,.12)]">
                  <li role="option" aria-selected className="t-body px-6 py-3 text-red">
                    {itinerary.durationLabel || itinerary.title}
                    <span className="t-small block text-ink/60">{itinerary.title}</span>
                  </li>
                  {others.length === 0 && <li className="t-small px-6 py-3 text-ink/60">No other itineraries for this destination yet.</li>}
                  {others.map((s) => (
                    <li key={s.id} role="option" aria-selected={false}>
                      <Link href={`/destinations/${destinationCode}/itinerary/${s.code}`} className="t-body block px-6 py-3 text-ink hover:bg-red hover:text-cream" onClick={() => setOpen(false)}>
                        {s.durationLabel || s.title}
                        <span className="t-small block opacity-60">{s.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={download} aria-label={itinerary.pdfUrl ? "Download the itinerary PDF" : "Print or save this itinerary as PDF"} className="grid h-[50px] w-[50px] flex-none place-items-center bg-red text-cream transition-colors hover:bg-[#8f2719]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 12 3 7l1.4-1.45L7 8.15V0h2v8.15l2.6-2.6L13 7l-5 5ZM2 16c-.55 0-1.02-.2-1.41-.59A1.93 1.93 0 0 1 0 14v-3h2v3h12v-3h2v3c0 .55-.2 1.02-.59 1.41A1.93 1.93 0 0 1 14 16H2Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* rail + days */}
        <div className="mt-[56px] flex flex-col gap-6 md:mt-[71px] lg:flex-row lg:items-start lg:gap-0">
          <nav aria-label="Days" className="print:hidden lg:sticky lg:top-[80px] lg:w-[165px] lg:flex-none">
            <ol className="-mx-6 flex overflow-x-auto px-6 lg:mx-0 lg:block lg:overflow-visible lg:px-0">
              {days.map((d, i) => (
                <li key={i} className="flex-none">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={`t-h4 flex h-[60px] w-[120px] items-center justify-center whitespace-nowrap lg:h-[75px] lg:w-[164px] ${i === active ? "border border-red text-red" : "text-ink/30 hover:text-ink/60"}`}
                  >
                    Day-{i + 1}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <ol className="flex min-w-0 flex-1 flex-col gap-[62px]">
            {days.map((d, i) => (
              <li
                key={i}
                data-index={i}
                ref={(el) => {
                  dayRefs.current[i] = el;
                }}
                id={`day-${i + 1}`}
                className="flex scroll-mt-[90px] flex-col gap-6 md:flex-row md:gap-7"
              >
                <div className="relative aspect-[535/420] w-full flex-none overflow-hidden bg-ink/5 md:w-[46%] lg:w-[535px]">
                  {d.image && <Image src={d.image} alt={d.title} fill sizes="(min-width:1024px) 535px, 100vw" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 py-3">
                  <h3 className="t-h4 flex flex-wrap items-center gap-3 text-ink">
                    <span className="text-ink/30">Day-{i + 1}</span>
                    <span>{d.title}</span>
                  </h3>
                  <ul className="mt-5 flex flex-col gap-6">
                    {d.activities?.map((a, j) => {
                      const ics = (a.icons ?? []).map((id) => icons[id]).filter(Boolean);
                      return (
                        <li key={j}>
                          <h4 className="t-h4 text-red">{a.title}</h4>
                          {ics.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[12px] leading-[15px] text-[#BEBDBB]" style={{ fontFamily: "var(--font-erode)" }}>
                                activities
                              </p>
                              <ul className="mt-1 flex flex-wrap gap-2">
                                {ics.map((ic) => (
                                  <li key={ic.id} title={ic.name} className="grid h-6 w-6 place-items-center bg-red p-1">
                                    <img src={ic.url} alt={ic.name} className="act-icon h-4 w-4 object-contain" draggable={false} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {a.description && <p className="t-body mt-3 text-black">{a.description}</p>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
