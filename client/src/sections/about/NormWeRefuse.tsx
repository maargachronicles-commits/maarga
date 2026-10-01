/**
 * "The Norm We Refuse" (Figma "Frame 372"): heading block 760px wide — label
 * (Erode 16, red) → 4px → Clash 40 → 16px → Erode 16 body — then 95px → the
 * two sketched figures (191×215, centred).
 */
export default function NormWeRefuse() {
  return (
    <section id="norm" className="w-full bg-cream pt-[90px] md:pt-[146px]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center lg:px-0">
        <p className="t-body text-red">What We Stand Against</p>
        <h1 className="t-h1 mt-1 text-ink">The Norm We Refuse</h1>
        <div className="t-body mt-4 space-y-[19.8px] text-ink">
          <p>
            The guide who has memorised dates but cannot explain symbolism. The itinerary that fits seven sites into two
            days. A thousand years of architectural intelligence, reduced to &ldquo;very old, very impressive.&rdquo;
          </p>
          <p>This is the norm heritage travel in India has settled for. Maarga was not built to improve it. It was built to refuse it.</p>
        </div>
      </div>
      <img
        src="/figma/about-figures-two.svg"
        alt=""
        aria-hidden
        width={191}
        height={215}
        className="mx-auto mt-[60px] h-auto w-[140px] md:mt-[95px] md:w-[191px]"
      />
    </section>
  );
}
