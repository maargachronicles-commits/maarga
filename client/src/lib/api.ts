import type { AboutData, ExperienceData, HomepageData } from "./types";
import { placeholderAbout, placeholderExperience, placeholderHomepage } from "./placeholder";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * Fetch the homepage aggregate from the Express API (server/).
 * Runs on the server (page.tsx) on every request (no-store) so CMS saves
 * show up immediately; falls back to the Figma placeholder
 * content if the API is unreachable so the page never renders empty in dev.
 */
export async function getHomepage(): Promise<{ data: HomepageData; source: "api" | "placeholder" }> {
  try {
    const res = await fetch(`${API_URL}/api/homepage`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: HomepageData };
    if (!json.success) throw new Error("API returned success:false");
    return { data: json.data, source: "api" };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[maarga] /api/homepage unreachable — using placeholder content.", (err as Error).message);
    }
    return { data: placeholderHomepage, source: "placeholder" };
  }
}

/** Same as getHomepage, for the About page (/api/about). */
export async function getAbout(): Promise<{ data: AboutData; source: "api" | "placeholder" }> {
  try {
    const res = await fetch(`${API_URL}/api/about`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: AboutData };
    if (!json.success) throw new Error("API returned success:false");
    return { data: json.data, source: "api" };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[maarga] /api/about unreachable — using placeholder content.", (err as Error).message);
    }
    return { data: placeholderAbout, source: "placeholder" };
  }
}

/** Same, for the Experience page (/api/experience). */
export async function getExperience(): Promise<{ data: ExperienceData; source: "api" | "placeholder" }> {
  try {
    const res = await fetch(`${API_URL}/api/experience`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: ExperienceData };
    if (!json.success) throw new Error("API returned success:false");
    return { data: json.data, source: "api" };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[maarga] /api/experience unreachable — using placeholder content.", (err as Error).message);
    }
    return { data: placeholderExperience, source: "placeholder" };
  }
}

export function formatEventDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Round 8: /api/site/* (no placeholder fallback — the pages 404 / show an empty state instead) ---------- */
import type { DestinationData, DestinationsIndexData, EventDetailData, EventsData, GalleryBankData, ItineraryData } from "./types";

async function site<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api/site${path}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: T };
    if (!json.success) throw new Error("API returned success:false");
    return json.data;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.warn(`[maarga] /api/site${path} unreachable —`, (err as Error).message);
    return null;
  }
}

export const getDestinations = () => site<DestinationsIndexData>("/destinations");
export const getDestination = (code: string) => site<DestinationData>(`/destinations/${encodeURIComponent(code)}`);
export const getItinerary = (code: string, itin: string) => site<ItineraryData>(`/destinations/${encodeURIComponent(code)}/itinerary/${encodeURIComponent(itin)}`);
export const getEvents = () => site<EventsData>("/events");
export const getEvent = (id: string) => site<EventDetailData>(`/events/${encodeURIComponent(id)}`);
export const getGalleryBank = () => site<GalleryBankData>("/gallery");
