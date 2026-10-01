import { useEffect, useRef } from "react";
import "./TempleReveal.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import temple from "../assets/temple.svg";
import templeMask from "../assets/temple_mask.svg";

gsap.registerPlugin(ScrollTrigger);

export default function TempleReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGImageElement>(null);

  useEffect(() => {
    if (!maskRef.current) return;

    gsap.set(maskRef.current, {
      x: -1200,
    });

    gsap.to(maskRef.current, {
      x: 0,
      ease: "none",

      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
        markers: true,
      },
    });
  }, []);

  return (
    <div className="templeSection" ref={sectionRef}>
      <svg
        className="templeSVG"
        viewBox="0 0 1373 707"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="templeRevealMask">
            <image
              ref={maskRef}
              href={templeMask}
              width="1373"
              height="707"
            />
          </mask>
        </defs>

        <image
          href={temple}
          width="1373"
          height="707"
          mask="url(#templeRevealMask)"
        />
      </svg>
    </div>
  );
}