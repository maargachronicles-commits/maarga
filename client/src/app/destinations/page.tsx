import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/sections/home/Navbar";
import Footer from "@/sections/home/Footer";
import { getDestinations } from "@/lib/api";
import { linkSetting } from "@/lib/types";

export const metadata: Metadata = { title: "Destinations — Maarga" };
export const dynamic = "force-dynamic";

/**
 * /destinations — every published destination as a 417×596 card (the homepage
 * Destinations card), each linking to its itinerary. No Figma frame exists for this
 * index; the copy is CMS-editable (Homepage → Buttons & links → Destinations index).
 */
export default async function DestinationsIndex() {
  const data = await getDestinations();
  const s = data?.settings ?? {};
  const list = data?.destinations ?? [];
  return (
    <main className="w-full overflow-x-hidden bg-cream">
      <div className="relative h-[104px] w-full bg-ink">
        <Navbar contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} />
      </div>
      <section className="container pt-[60px] md:pt-[85px]">
        <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          <p className="t-body text-red">{s.destinationsLabel || "Destinations"}</p>
          <h1 className="t-h2 mt-1 text-ink">{s.destinationsTitle || "Every place, read the way it was built to be read."}</h1>
          {s.destinationsIntro && <p className="t-body mt-6 max-w-[520px] text-ink">{s.destinationsIntro}</p>}
        </div>
        {list.length === 0 ? (
          <p className="t-body mt-16 text-center text-ink/60">No destinations are published yet.</p>
        ) : (
          <ul className="mt-[60px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <li key={d.id}>
                <Link href={`/destinations/${d.code}/itinerary`} className="group block">
                  <div className="relative aspect-[417/542] w-full overflow-hidden bg-ink/5">
                    {d.heroImage && <Image src={d.heroImage} alt={d.name} fill sizes="(min-width:1024px) 417px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h2 className="t-h3 text-ink group-hover:text-red">{d.name}</h2>
                    <span className="t-small text-ink/60">{d.region}</span>
                  </div>
                  <p className="t-small mt-1 text-red">
                    {d.itineraries.length === 0 ? "Itineraries coming soon" : `${d.itineraries.length} itinerar${d.itineraries.length === 1 ? "y" : "ies"} · ${d.code}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Footer ctaImage={s.ctaImage} enquire={linkSetting(s, "enquireCta", { text: "Contact Us", href: "/contact" })} className="pt-[110px] md:pt-[150px]" bg="bg-cream" />
    </main>
  );
}
