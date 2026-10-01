import Navbar from "./Navbar";
import HeroVideo from "./HeroVideo";
import type { LinkSetting } from "@/lib/types";

interface Props {
  /** Optional CMS override for the hero video (settings.heroVideo). */
  videoSrc?: string;
  /** Nav "Contact Us" button (settings.navContactText / navContactUrl). */
  contact?: LinkSetting;
}

/**
 * Figma hero: 1512×862 frame, background video, nav overlaid, tagline
 * (Clash 40/49, cream) and the oversized MAARGA wordmark (Clash Light,
 * ≈380px at 1512) sitting on the bottom edge of the hero.
 *
 * The wordmark + tagline are anchored to the BOTTOM of the hero (not to a
 * percentage from the top) so the letters always touch the cream section
 * below and are never cropped by a short viewport — previously the block
 * was placed at 69.6% from the top, which on wide/short screens pushed the
 * bottom of the "G" out of the frame. Baseline y=266 in a 272-tall viewBox
 * leaves 6px for the round overshoot of the G while the flat feet still
 * sit on the edge. The wordmark is decorative (aria-hidden).
 */
export default function Hero({ videoSrc, contact }: Props) {
  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink">
      <HeroVideo src={videoSrc} />
      {/* subtle darkening so cream text stays legible on any frame */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />

      <Navbar contact={contact} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <h1 className="t-h1 mx-auto mb-[18px] w-[550px] max-w-[calc(100%-48px)] text-center text-cream">
          Paths to India&apos;s Living Knowledge
        </h1>

        {/* Wordmark: SVG so it spans exactly x=65→1462 of 1512 (measured in the PDF)
            regardless of font loading. */}
        <svg
          aria-hidden
          className="block w-full select-none"
          viewBox="0 0 1512 272"
          preserveAspectRatio="xMinYMax meet"
          style={{ overflow: "visible" }}
        >
          <text
            x="65"
            y="266"
            textLength="1397"
            lengthAdjust="spacingAndGlyphs"
            fill="#FFFDFA"
            style={{ fontFamily: "var(--font-clash)", fontWeight: 300, fontSize: 380 }}
          >
            MAARGA
          </text>
        </svg>
      </div>
    </section>
  );
}
