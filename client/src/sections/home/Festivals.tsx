import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import { isVideoUrl } from "@/lib/types";

/**
 * "Experience the tradition in Maarga way" (Figma Frame 276). Heading block
 * (label→title 0, title→body 24, body 694px) → 40px → 1272×529 image.
 * Static section; the media is CMS-driven (settings.festivalImage) and may be
 * a photo OR a video (autoplays muted, loops).
 */
export default function Festivals({ image }: { image?: string }) {
  return (
    <section id="festivals" className="w-full bg-white pt-[80px] md:pt-[130px]">
      <div className="container">
        <SectionHeading
          label="Festivals"
          title="Experience the tradition in Maarga way"
          bodyWidth={695}
          body="Lorem ipsum dolor sit amet consectetur. Dictumst posuere facilisis sed in urna. Sed integer fusce aenean turpis commodo ultrices enim sed. Sit vel aliquet sit vulputate integer."
        />
        <div className="relative mt-10 aspect-[1272/529] w-full overflow-hidden bg-ink/5">
          {image && isVideoUrl(image) ? (
            <video src={image} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            image && <Image src={image} alt="Festival celebration" fill sizes="(min-width:1320px) 1272px, 100vw" className="object-cover" />
          )}
        </div>
      </div>
    </section>
  );
}
