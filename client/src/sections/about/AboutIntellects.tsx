import Image from "next/image";
import { MAP_FIGURES, ROW_ORDER } from "@/sections/home/mapFigures";
import type { PlacedIntellect } from "@/lib/types";

/**
 * "The Reason the Journey Becomes an Education" (Figma "Frame 361", 1352px):
 * header (label → 4 → Clash 40 → 18 → Erode 16 body, 826px) → 50px → the
 * row of 13 sketched figures (same set as the homepage map, 61.8px gap) →
 * 50px → profile cards, 3 per row, 40px between columns and 50px between rows.
 * Card: image 424×420 r4 → 24 → name Clash 24 red → 8 → designation Erode 14
 * → 8 → description Erode 16/25.6. Profiles are the same Intellects the
 * homepage uses (CMS → Homepage → Intellects); every published one is listed.
 */
export default function AboutIntellects({
  items,
  copy = {},
}: {
  items: PlacedIntellect[];
  copy?: { label?: string; title?: string; intro?: string };
}) {
  const rowFigures = ROW_ORDER.map((id) => MAP_FIGURES.find((f) => f.id === id)!);
  return (
    <section id="about-intellects" className="w-full bg-cream pt-[90px] md:pt-[131px]">
      <div className="mx-auto w-full max-w-[1352px] px-6 xl:px-0">
        <div className="mx-auto flex max-w-[826px] flex-col items-center text-center">
          <p className="t-body text-red">{copy.label || "Intellects"}</p>
          <h2 className="t-h1 mt-1 text-ink">{copy.title || "The Reason the Journey Becomes an Education"}</h2>
          <p className="t-body mt-[18px] text-ink">
            {copy.intro ||
              "Maarga's scholar network is not built on superficial accolades. Every intellectual we work with has spent decades fully integrated with their chosen field of inquiry not adjacent to it."}
          </p>
        </div>

        <div className="mx-auto mt-[50px] flex min-h-[85px] w-full max-w-[1056px] flex-wrap items-end justify-center gap-x-[4vw] gap-y-6 md:flex-nowrap md:items-center md:gap-[3vw] lg:gap-[61.8px]">
          {rowFigures.map((f) => (
            <img
              key={f.id}
              src={`/figma/fig${f.id}-row.svg`}
              alt=""
              aria-hidden
              className="max-w-none flex-none"
              style={{ width: f.w, height: f.h }}
              draggable={false}
            />
          ))}
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
