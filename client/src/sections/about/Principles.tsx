const PRINCIPLES = [
  {
    n: "01",
    title: "Every journey begins with a question.",
    body: "We do not offer destinations; we curate answers. Before booking, travelers join a quiet seminar mapping the philosophical framework of the landscape they will tread.",
  },
  {
    n: "02",
    title: "Deliberately small cohorts.",
    body: "To hear a whisper inside a cave or study the micro-engravings on a bronze casting, noise must vanish. Our journeys are capped strictly at 12 participants.",
  },
  {
    n: "03",
    title: "Unhurried, rhythmic pace.",
    body: "We eschew checklists. Rushing through four heritage sites in a single afternoon dilutes perception. We dedicate full, silent days to single assemblies.",
  },
  {
    n: "04",
    title: "Absolute specialized expertise.",
    body: "There are no generalist tour guides. Every single movement of our curriculum is structured and led by native researchers, authors, and master architects.",
  },
];

/**
 * "A Methodology of Attention" (Figma "Frame 347" + "Principles Column Grid"):
 * header → 58px → 2×2 grid, 620px columns, 32px gaps. Each segment: 1px red
 * top rule, 32px padding, number Clash 32 red → 24 → title Clash 22 → 24 →
 * body Erode 16. Static copy from the Figma.
 */
export default function Principles() {
  return (
    <section id="principles" className="w-full bg-cream pt-[110px] md:pt-[196px]">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <p className="t-body text-red">Our Principles</p>
          <h2 className="t-h1 mt-1 text-ink">A Methodology of Attention</h2>
        </div>
        <ol className="mt-10 grid grid-cols-1 gap-8 md:mt-[58px] md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <li key={p.n} className="border-t border-red pt-8">
              <p className="text-red" style={{ fontFamily: "var(--font-clash)", fontSize: 32, lineHeight: "39.4px" }}>
                {p.n}
              </p>
              <h3 className="t-h4 mt-6 text-ink">{p.title}</h3>
              <p className="t-body mt-6 text-ink">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
