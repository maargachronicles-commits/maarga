import Image from "next/image";
import type { ItineraryStay } from "@/lib/types";

/** "Where you'll stay" (Figma Frame 450): Clash 40 title centred → 46 → rows of 693×420 photo + 550px copy, 24px apart. */
export default function Stays({ title, stays }: { title: string; stays: ItineraryStay[] }) {
  if (!stays?.length) return null;
  return (
    <section id="stays" className="w-full bg-cream pt-[100px] md:pt-[146px]">
      <div className="container">
        <h2 className="t-h1 text-center text-ink">{title}</h2>
        <ul className="mt-[46px] flex flex-col gap-6">
          {stays.map((s, i) => (
            <li key={i} className="flex flex-col gap-6 md:flex-row md:gap-7">
              <div className="relative aspect-[693/420] w-full flex-none overflow-hidden bg-ink/5 md:w-[55%] lg:w-[693px]">
                {s.image && <Image src={s.image} alt={s.name} fill sizes="(min-width:1024px) 693px, 100vw" className="object-cover" />}
              </div>
              <div className="flex-1 py-2 md:py-6">
                <h3 className="t-h4 text-red">{s.name}</h3>
                {s.description && <p className="t-body mt-7 text-black">{s.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
