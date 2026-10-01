import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import type { PlacedIntellect } from "@/lib/types";

/**
 * "The Scholar Who Reads This Place" (Figma Frame 361, 1352px): label →
 * 4 → Clash 40 title → 50 → three 424px cards (40px gap; image 424×420 r4 →
 * 24 → name Clash 24 red → 8 → designation Erode 14 → 8 → description Erode
 * 16/25.6) → 50 → intro paragraph (609px, red, centred). Cards are this
 * page's scholar placements (CMS → Experience page → Intellects): a profile
 * from the library, optionally overridden for this page only.
 */
export default function ExperienceIntellects({
  items,
  copy,
}: {
  items: PlacedIntellect[];
  copy: { label: string; title: string; intro: string };
}) {
  return (
    <section id="experience-intellects" className="w-full bg-cream pt-[100px] md:pt-[133px]">
      <div className="mx-auto w-full max-w-[1352px] px-6 xl:px-0">
        <div className="mx-auto flex max-w-[586px] flex-col items-center text-center">
          <p className="t-body text-red">{copy.label}</p>
          <h2 className="t-h1 mt-1 text-ink">{copy.title}</h2>
        </div>
        <ul className="mt-[50px] grid grid-cols-1 gap-x-10 gap-y-[50px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col">
              <div className="relative aspect-[424/420] w-full overflow-hidden rounded-[4px] bg-ink/5">
                <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 424px, 100vw" className="object-cover" />
              </div>
              <h3 className="t-h3 mt-6 text-red">{p.name}</h3>
              <p className="t-small mt-2 text-ink">{p.designation}</p>
              <p className="t-body-lg mt-2 text-ink">{p.description}</p>
              {p.ctaText?.trim() && (
                <ArrowLink href={p.ctaUrl?.trim() || "/about"} className="mt-4 text-red">
                  {p.ctaText}
                </ArrowLink>
              )}
            </li>
          ))}
        </ul>
        <p className="t-body mx-auto mt-[50px] max-w-[609px] text-center text-red">{copy.intro}</p>
      </div>
    </section>
  );
}
