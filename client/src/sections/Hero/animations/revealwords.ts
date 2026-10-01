import gsap from "gsap";

export function revealWords() {
  gsap.fromTo(
    ".story-line",
    {
      opacity: 0,
      y: 12,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.22,
      delay: 1.4,
      ease: "power2.out",
    }
  );
}