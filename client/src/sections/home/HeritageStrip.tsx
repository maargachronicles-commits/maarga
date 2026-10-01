import Image from "next/image";

/** Static assets — Figma "Frame 260": five 417×542 image containers, no gap, clipped at 1512. */
const IMAGES = [
  { src: "/images/elephant-gateway.jpg", alt: "Elephant entering through an architectural gateway" },
  { src: "/images/hampi-chariot.jpg", alt: "Hampi stone chariot" },
  { src: "/images/blue-windows.jpg", alt: "Women standing at blue architectural windows" },
  { src: "/images/temple-elephant.jpg", alt: "Temple architecture with elephant" },
  { src: "/images/heritage-5.jpg", alt: "Heritage architecture" },
];

export default function HeritageStrip() {
  return (
    <section aria-label="Heritage imagery" className="w-full overflow-hidden bg-white">
      <div className="heritage-strip flex h-[300px] w-full snap-x snap-mandatory overflow-x-auto sm:h-[542px] lg:overflow-hidden">
        {IMAGES.map((img, i) => (
          <div key={i} className="relative h-full w-[62vw] flex-none snap-start sm:w-[417px]">
            <Image src={img.src} alt={img.alt} fill sizes="417px" className="object-cover" loading={i < 4 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>
    </section>
  );
}
