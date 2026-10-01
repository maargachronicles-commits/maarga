import Navbar from "@/sections/home/Navbar";
import type { LinkSetting } from "@/lib/types";

/**
 * About page hero (Figma "Frame 364": 1512×800, fill #A62F20). The header
 * sits on the red, so Contact Us is the cream variant. Copy block 902px wide,
 * 302px from the top: Erode 16 label → 16px → three Clash 28/34.4 paragraphs
 * (12px apart, centred) with the designed underlined phrases.
 */
export default function AboutHero({ contact }: { contact?: LinkSetting }) {
  return (
    <section id="about-hero" className="relative w-full bg-red text-cream">
      <Navbar contact={contact} onRed />
      <div className="mx-auto flex w-full max-w-[902px] flex-col items-center px-6 pb-[110px] pt-[190px] text-center md:pb-[200px] md:pt-[302px] lg:px-0">
        <p className="t-body text-white">The Bridge We Set Out to Build</p>
        <div className="about-hero-copy mt-4 flex flex-col gap-3">
          <p>
            Most heritage experiences stop at what is visible:{" "}
            <u>dates, dynasties, a highlight reel of architecture.</u>
          </p>
          <p>
            Maarga exists because the scholars who can go further, who can{" "}
            <u>read a frieze like language or a temple layout like cosmology</u>, have never been made accessible to the
            traveller who wants to follow them.
          </p>
          <p>
            We didn&apos;t set out to build a better heritage tour.{" "}
            <u>We set out to close a gap that heritage tourism was never designed to close.</u>
          </p>
        </div>
      </div>
    </section>
  );
}
