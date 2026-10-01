import Hero from "@/sections/home/Hero";
import SketchStack from "@/sections/home/SketchStack";
import WhyMaarga from "@/sections/home/WhyMaarga";
import HeritageStrip from "@/sections/home/HeritageStrip";
import ThreadAndPearls from "@/sections/home/ThreadAndPearls";
import Intellects from "@/sections/home/Intellects";
import Trips from "@/sections/home/Trips";
import Destinations from "@/sections/home/Destinations";
import Events from "@/sections/home/Events";
import Festivals from "@/sections/home/Festivals";
import Testimonials from "@/sections/home/Testimonials";
import Gallery from "@/sections/home/Gallery";
import Footer from "@/sections/home/Footer";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { getHomepage } from "@/lib/api";
import { linkSetting } from "@/lib/types";

/* Always render with fresh CMS data so a change saved in the admin shows up on
   the next reload (no 60 s ISR window). */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data } = await getHomepage();
  const s = data.settings;

  return (
    <main className="w-full overflow-x-hidden">
      <ScrollIndicator />
      <Hero videoSrc={s.heroVideo} contact={linkSetting(s, "navContact", { text: "Contact Us", href: "/contact" })} />
      <SketchStack learnMore={linkSetting(s, "sketchCta", { text: "Learn more About us", href: "/about" })} />
      <WhyMaarga cta={linkSetting(s, "whyMaargaCta", { text: "Our experiences", href: "/experience" })} />
      <HeritageStrip />
      <ThreadAndPearls />
      <Intellects items={data.intellects} cta={linkSetting(s, "intellectsCta", { text: "Meet our intellectuals", href: "/about" })} />
      <Trips items={data.trips} intro={data.settings.tripsIntro} />
      <Destinations items={data.destinations} />
      <Events items={data.events} intro={data.settings.eventsIntro} />
      <Festivals image={data.settings.festivalImage} />
      <Testimonials items={data.testimonials} />
      <Gallery items={data.gallery} />
      <Footer ctaImage={s.ctaImage} enquire={linkSetting(s, "enquireCta", { text: "Contact Us", href: "/contact" })} />
    </main>
  );
}
