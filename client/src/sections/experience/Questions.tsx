import type { TextItem } from "@/lib/types";

/**
 * "Questions Hampi Still Asks" (Figma Frame 410, 466px): Clash 28 title →
 * 46 → questions (Erode 16, 33px apart) → 87 → the two sketched figures
 * (Figma Frame 405, 192×230). CMS: title (setting) + questions (collection).
 */
export default function Questions({ title, items }: { title: string; items: TextItem[] }) {
  if (!items.length && !title) return null;
  return (
    <section id="questions" className="w-full bg-cream pt-[100px] md:pt-[161px]">
      <div className="mx-auto flex w-full max-w-[466px] flex-col items-center px-6 text-center lg:px-0">
        <h2 className="t-h2 text-ink">{title}</h2>
        <ul className="mt-[46px] flex flex-col gap-[33px]">
          {items.map((q) => (
            <li key={q.id} className="t-body text-ink">
              {q.text}
            </li>
          ))}
        </ul>
        <img src="/figma/exp-question-figures.svg" alt="" aria-hidden width={192} height={230} className="mt-[70px] h-auto w-[150px] md:mt-[87px] md:w-[192px]" />
      </div>
    </section>
  );
}
