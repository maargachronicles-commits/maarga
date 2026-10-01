import type { DestinationPage } from "@/lib/types";

/** The three pills under a destination hero: Experience / Itinerary / Gallery. */
export function destinationTabs(d: DestinationPage, active: "experience" | "itinerary" | "gallery") {
  return [
    { text: "Experience", href: d.experienceUrl?.trim() || "/experience", active: active === "experience" },
    { text: "Itinerary", href: `/destinations/${d.code}/itinerary`, active: active === "itinerary" },
    { text: "Gallery", href: `/destinations/${d.code}/gallery`, active: active === "gallery" },
  ];
}
