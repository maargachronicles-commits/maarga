import Image from "next/image";
import Link from "next/link";
import Navbar from "@/sections/home/Navbar";
import type { LinkSetting } from "@/lib/types";

/**
 * Experience page hero (Figma "Hero image": 1512×657, photo fill) — the
 * header sits on the photo; copy block 835px wide bottom-aligned 72px above
 * the edge: Erode 16 label ("HAMPI") → 13 → Clash 40/49 title, both cream.
 *
 * Below it the tab row (Figma "Frame 418": 74px, 1px #E6E6E6 bottom rule):
 * three pills, padding 12/36, the active one outlined red. Photo + every
 * text + tab label/link are CMS settings (Experience page → Hero & copy).
 */
export default function ExperienceHero({
  image,
  label,
  title,
  contact,
  tabs,
  cta,
  id = "experience-hero",
}: {
  image?: string | null;
  label: string;
  title: string;
  contact?: LinkSetting;
  /** the three pills under the photo; omit for a hero without tabs (Events page) */
  tabs?: (LinkSetting & { active?: boolean })[];
  /** red button under the title (Itinerary page: "Enquire about this journey") */
  cta?: LinkSetting | null;
  id?: string;
}) {
  return (
    <section id={id} className="w-full bg-cream">
      <div className="relative h-[70svh] min-h-[420px] w-full overflow-hidden bg-ink md:h-[657px]">
        {image && <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />}
        {/* soft darkening at the bottom so the cream copy always reads */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/55 to-transparent" aria-hidden />
        <Navbar contact={contact} />
        <div className="absolute inset-x-0 bottom-[56px] mx-auto flex w-full max-w-[835px] flex-col items-center px-6 text-center text-cream md:bottom-[72px] lg:px-0">
          <p className="t-body uppercase tracking-[0.02em]">{label}</p>
          <h1 className="t-h1 mt-[13px]">{title}</h1>
          {cta?.text && (
            <Link href={cta.href} className="btn-red mt-[13px]">
              {cta.text}
            </Link>
          )}
        </div>
      </div>

      {tabs && tabs.length > 0 && (
      <nav aria-label="Destination sections" className="w-full border-b border-[#E6E6E6]">
        <ul className="mx-auto flex w-full max-w-[1512px] items-end justify-start gap-0 overflow-x-auto px-6 pt-[16px] md:justify-center md:px-[50px] md:pt-[28px]">
          {tabs.map((t) => (
            <li key={t.text} className="flex-none">
              <Link
                href={t.href}
                aria-current={t.active ? "page" : undefined}
                className={`t-body inline-flex h-[45px] items-center justify-center whitespace-nowrap px-6 md:px-[36px] ${
                  t.active ? "border border-red text-red" : "text-ink hover:text-red"
                }`}
                style={{ minWidth: 150 }}
              >
                {t.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      )}
    </section>
  );
}
