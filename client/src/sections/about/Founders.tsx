import Image from "next/image";
import type { Founder } from "@/lib/types";

/**
 * "The Founders" (Figma frame "The Founders": 1512×804, red, 80px padding).
 * Header (label → 4 → Clash 40, cream) → 24px → row of 424px cards, 40px
 * gap: image 424×420 r4 → 24 → name Clash 22 → 8 → designation Erode 16 →
 * 8 → description Erode 16/19.8, all cream. CMS-driven (founders).
 */
export default function Founders({ items }: { items: Founder[] }) {
  return (
    <section id="founders" className="w-full bg-red py-[70px] text-cream md:py-[80px]">
      <div className="mx-auto w-full max-w-[1352px] px-6 xl:px-0">
        <div className="flex flex-col items-center text-center">
          <p className="t-body text-cream">The Architects</p>
          <h2 className="t-h1 mt-1 text-cream">The Founders</h2>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <li key={f.id} className="flex flex-col">
              <div className="relative aspect-[424/420] w-full overflow-hidden rounded-[4px] bg-black/10">
                <Image src={f.image} alt={f.name} fill sizes="(min-width:1024px) 424px, 100vw" className="object-cover" />
              </div>
              <h3 className="t-h4 mt-6">{f.name}</h3>
              <p className="t-body mt-2">{f.designation}</p>
              <p className="t-body mt-2">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
