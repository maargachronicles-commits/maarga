import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import type { Intellect, LinkSetting } from "@/lib/types";

/**
 * Figma "Founders Row": 3 cards × 424px, 40px gap (1352px total — wider than
 * the 1272 content column, so it uses its own width), 50px below the figure
 * row. Card: 424×420 image (r=4) → 24px → name (Clash 24, red) → 8px →
 * designation (Erode 14) → 8px → description (Erode 16/25.6).
 * CMS-driven: profiles come from /api/intellects.
 */
export default function Intellects({
  items,
  cta = { text: "Meet our intellectuals", href: "/about" },
}: {
  items: Intellect[];
  cta?: LinkSetting;
}) {
  return (
    <div className="mx-auto w-full max-w-[1352px] px-6 pt-[50px] xl:px-0">
      <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.id} className="flex flex-col">
            <div className="relative aspect-[424/420] w-full overflow-hidden rounded-[4px] bg-ink/5">
              <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 424px, 100vw" className="object-cover" />
            </div>
            <div className="mt-6">
              <h3 className="t-h3 text-red">{p.name}</h3>
              <p className="t-small mt-2 text-ink">{p.designation}</p>
              <p className="t-body-lg mt-2 text-ink">{p.description}</p>
              {p.ctaText?.trim() && (
                <ArrowLink href={p.ctaUrl?.trim() || cta.href} className="mt-4 text-red">
                  {p.ctaText}
                </ArrowLink>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-[50px] flex justify-center">
        <ArrowLink href={cta.href} className="text-red">
          {cta.text}
        </ArrowLink>
      </div>
    </div>
  );
}
