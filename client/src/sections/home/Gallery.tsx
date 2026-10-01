"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import CarouselArrows from "@/components/ui/CarouselArrows";
import type { GalleryImage } from "@/lib/types";

const PER_PAGE = 6;

/**
 * "Places do not speak for themselves. These do." (Figma Frame 308).
 * Heading → 33px → 3-column grid (417×542, 10px column gap, 11px row gap),
 * two rows per page, arrows 33px below paginate through the CMS gallery.
 * CMS-driven via /api/gallery.
 */
export default function Gallery({ items }: { items: GalleryImage[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const visible = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section id="gallery" className="w-full bg-white pt-[80px] md:pt-[130px]">
      <div className="container">
        <SectionHeading label="Gallery" title="Places do not speak for themselves. These do." />
        <ul className="mt-[33px] grid grid-cols-1 gap-x-[10px] gap-y-[11px] sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((g, i) => (
            <li key={g.id} className="relative aspect-[417/542] w-full overflow-hidden bg-ink/5">
              {g.ctaUrl?.trim() && <a href={g.ctaUrl} className="absolute inset-0 z-10" aria-label={g.alt || "Open"} />}
              <Image
                src={g.url}
                alt={g.alt || ""}
                fill
                sizes="(min-width:1024px) 417px, (min-width:640px) 50vw, 100vw"
                className="object-cover"
                loading={i < 3 ? "eager" : "lazy"}
              />
            </li>
          ))}
        </ul>
        {pages > 1 && (
          <div className="mt-[33px] flex justify-center">
            <CarouselArrows
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
              prevDisabled={page === 0}
              nextDisabled={page >= pages - 1}
            />
          </div>
        )}
      </div>
    </section>
  );
}
