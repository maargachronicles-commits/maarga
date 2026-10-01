import Image from "next/image";
import Link from "next/link";
import type { LinkSetting } from "@/lib/types";

const MENU = [
  { label: "About us", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Destinations", href: "/destinations" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Shop", href: "/shop" },
];
const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/", external: true },
  { label: "Experience", href: "/experience" },
];
const LOCATION = [{ label: "About us", href: "/about" }];

function Column({ title, links, gap = 8 }: { title: string; links: { label: string; href: string; external?: boolean }[]; gap?: number }) {
  return (
    <div className="w-[165px]">
      <h3 className="t-foot-title text-ink">{title}</h3>
      <ul className="mt-3 flex flex-col" style={{ gap }}>
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="t-foot-link text-ink hover:text-red transition-colors">{l.label}</a>
            ) : (
              <Link href={l.href} className="t-foot-link text-ink hover:text-red transition-colors">{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Begin Your Maarga" CTA (Figma Frame 312) + Footer (Frame 317).
 *
 * In the Figma the footer is ONE image-filled frame (the CTA heritage photo,
 * CMS: settings.ctaImage). Its top 607px shows the photo with two 40% cream
 * patterns and a sketched standing figure; below that a white shape with the
 * letters M A A R G A knocked out (public/figma/footer-wordmark-mask.svg,
 * 1512×850) sits over the same photo — so the oversized wordmark's texture is
 * the photo showing through. Logo, link columns sit on the white area at the
 * Figma offsets. Replacing the CMS image updates both photo and wordmark.
 */
export default function Footer({
  ctaImage,
  enquire = { text: "Contact Us", href: "/contact" },
  className = "pt-[80px] md:pt-[106px]",
  bg = "bg-white",
  cta = {},
}: {
  ctaImage?: string;
  enquire?: LinkSetting;
  /** Copy of the "Begin Your Maarga" block (the Experience page uses its own, CMS-editable). */
  cta?: { label?: string; title?: string; text?: string };
  /** Top padding of the CTA block (the About page uses the Figma's 197px). */
  className?: string;
  /** Background of the CTA block — cream on the About page. */
  bg?: string;
}) {
  return (
    <>
      {/* ---- CTA ---- */}
      <section id="contact-cta" className={`w-full ${bg} ${className}`}>
        <div className="container flex flex-col items-center text-center">
          <p className="t-body text-red">{cta.label || "Enquire"}</p>
          <h2 className="t-h2 text-ink">{cta.title || "Begin Your Maarga"}</h2>
          <p className="t-body mt-6 max-w-[380px] text-ink">
            {cta.text || "Tell us what you're curious about. We'll connect you with the scholar and the site that answers it."}
          </p>
          <Link href={enquire.href} className="btn-red mt-9">
            {enquire.text}
          </Link>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative mt-[80px] w-full overflow-hidden bg-white md:mt-[106px]">
        <div className="wrap relative">
          {/* photo layer */}
          <div className="absolute inset-0">
            {ctaImage && <Image src={ctaImage} alt="" fill sizes="1512px" className="object-cover" priority={false} />}
          </div>

          {/* photo band: 607px with patterns + standing figure */}
          <div className="relative h-[420px] overflow-hidden md:h-[607px]">
            <img
              src="/figma/pattern-footer.svg"
              alt=""
              aria-hidden
              width={389}
              height={2007}
              className="pointer-events-none absolute left-[39px] top-[-308px] hidden w-[389px] max-w-none opacity-40 md:block"
            />
            <img
              src="/figma/pattern-footer.svg"
              alt=""
              aria-hidden
              width={389}
              height={2007}
              className="pointer-events-none absolute right-[47px] top-[-308px] hidden w-[389px] max-w-none opacity-40 md:block"
            />
            <img
              src="/figma/cta-figure.svg"
              alt=""
              aria-hidden
              width={40}
              height={119}
              className="pointer-events-none absolute left-[48.5%] top-[62.5%] w-[40px] max-w-none"
            />
          </div>

          {/* white area with the knocked-out MAARGA (desktop) */}
          <div className="relative hidden md:block">
            <img
              src="/figma/footer-wordmark-mask.svg"
              alt="MAARGA"
              className="block h-auto w-full"
              draggable={false}
            />
            <div className="absolute left-[7.8%] top-[9.1%] w-[7.5%]">
              <Link href="/" aria-label="Maarga home">
                <img src="/figma/logo-red.svg" alt="" width={114} height={114} className="w-full" />
              </Link>
            </div>
            <div className="absolute left-[52%] top-[9.1%] flex w-[40.1%] justify-between gap-6">
              <Column title="Menu" links={MENU} />
              <Column title="Socials" links={SOCIALS} />
              <Column title="Location" links={LOCATION} gap={16} />
            </div>
          </div>

          {/* mobile footer */}
          <div className="relative bg-white px-6 pb-10 pt-8 md:hidden">
            <Link href="/" aria-label="Maarga home" className="inline-block">
              <img src="/figma/logo-red.svg" alt="" width={72} height={72} />
            </Link>
            <div className="mt-8 flex flex-wrap gap-8">
              <Column title="Menu" links={MENU} />
              <Column title="Socials" links={SOCIALS} />
              <Column title="Location" links={LOCATION} gap={16} />
            </div>
            <div
              aria-hidden
              className="mt-10 overflow-hidden whitespace-nowrap text-ink/80"
              style={{ fontFamily: "var(--font-clash)", fontWeight: 300, fontSize: "18.5vw", lineHeight: 1 }}
            >
              MAARGA
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
