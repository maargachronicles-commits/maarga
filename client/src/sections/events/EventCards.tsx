import Image from "next/image";
import Link from "next/link";
import { formatClock, formatLongDate, type SiteEvent } from "@/lib/types";

const Field = ({ label, value, center }: { label: string; value: string; center?: boolean }) => (
  <div className={center ? "text-center" : ""}>
    <p className="t-small text-red">{label}</p>
    <p className="t-h4 mt-[2px] text-black">{value}</p>
  </div>
);

export const timeRange = (e: SiteEvent) => [formatClock(e.startTime), formatClock(e.endTime)].filter(Boolean).join(" - ");

/**
 * Upcoming event row (Figma Frame 466): 131px date column (month in a 48px ink-outlined
 * box, Clash 40 day) → 64 → 539×424 photo → 31 → 507px copy (Clash 28 title, "Led by…",
 * description, date/time/venue, red "Know more" 44px button).
 */
export function UpcomingEventRow({ e }: { e: SiteEvent }) {
  const d = e.eventDate ? new Date(e.eventDate) : null;
  const href = e.ctaUrl?.trim() || `/events/${e.id}`;
  return (
    <li className="flex flex-col gap-6 md:flex-row md:gap-8 lg:gap-16">
      {d && (
        <div className="flex flex-none items-center gap-4 md:w-[131px] md:flex-col md:items-center md:gap-[11px]">
          <span className="t-h4 border border-black px-[10px] py-[10px] text-black md:w-full md:text-center">{d.toLocaleDateString("en-GB", { month: "long" })}</span>
          <span className="t-h1 text-black">{d.getDate()}</span>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:gap-[31px]">
        <div className="relative aspect-[539/424] w-full flex-none overflow-hidden bg-red md:w-[48%] lg:w-[539px]">
          {e.image && <Image src={e.image} alt={e.imageAltText || e.title} fill sizes="(min-width:1024px) 539px, 100vw" className="object-cover" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 py-1 md:py-5">
          <div>
            <h3 className="t-h2 text-black">{e.title}</h3>
            {e.subtitle && <p className="t-body mt-1 text-black">{e.subtitle}</p>}
            {e.description && <p className="t-body mt-6 text-black">{e.description}</p>}
            <div className="mt-6 flex flex-col gap-[14px]">
              <div className="flex flex-wrap gap-x-[60px] gap-y-3 lg:gap-x-[150px]">
                <Field label="date" value={formatLongDate(e.eventDate)} />
                {timeRange(e) && <Field label="time" value={timeRange(e)} />}
              </div>
              {e.location && <Field label="Venue" value={e.location} />}
            </div>
          </div>
          <Link href={href} className="btn-red w-full">
            {e.ctaText || "Know more"}
          </Link>
        </div>
      </div>
    </li>
  );
}

/** Past event card (Figma Frame 465): 411px, photo 411×424 → 8 → padded copy → "Know more". */
export function PastEventCard({ e }: { e: SiteEvent }) {
  return (
    <li className="w-[300px] flex-none snap-start bg-white sm:w-[411px]">
      <div className="relative aspect-[411/424] w-full overflow-hidden bg-red">
        {e.image && <Image src={e.image} alt={e.imageAltText || e.title} fill sizes="411px" className="object-cover" />}
      </div>
      <div className="flex flex-col gap-6 p-3 pt-5">
        <div>
          <h3 className="t-h2 text-black">{e.title}</h3>
          {e.subtitle && <p className="t-body mt-1 text-black">{e.subtitle}</p>}
          {e.description && <p className="t-body mt-6 text-black">{e.description}</p>}
          <div className="mt-6 flex justify-between gap-6">
            <Field label="date" value={formatLongDate(e.eventDate)} />
            {e.location && <Field label="Venue" value={e.location} center />}
          </div>
        </div>
        <Link href={e.ctaUrl?.trim() || `/events/${e.id}`} className="btn-red w-full">
          {e.ctaText || "Know more"}
        </Link>
      </div>
    </li>
  );
}
