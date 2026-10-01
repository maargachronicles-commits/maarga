import gsap from "gsap";

export function drawTemple() {
  const object = document.querySelector(
    "#story-svg object"
  ) as HTMLObjectElement | null;

  if (!object) return;

  object.addEventListener(
    "load",
    () => {
      const svg = object.contentDocument;

      if (!svg) return;

      const paths = Array.from(
        svg.querySelectorAll("path")
      ) as SVGPathElement[];

      // Sort from top to bottom
      paths.sort((a, b) => {
        const ay = a.getBBox().y;
        const by = b.getBBox().y;
        return ay - by;
      });

      gsap.set(paths, {
        opacity: 0,
        scale: 0.98,
        transformOrigin: "center center",
      });

      gsap.set(".story-line", {
        opacity: 0,
        y: 15,
      });

      const tl = gsap.timeline();

      // Temple reveal
      tl.to(paths, {
        opacity: 1,
        scale: 1,
        duration: 0.08,
        stagger: 0.003,
        ease: "power1.out",
      });

      // Temple settle
      tl.fromTo(
        "#story-svg",
        {
          scale: 0.995,
        },
        {
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.25"
      );

      // Story text reveal
      tl.to(
        ".story-line",
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.2"
      );
    },
    { once: true }
  );
}