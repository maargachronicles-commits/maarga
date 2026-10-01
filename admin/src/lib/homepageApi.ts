/**
 * Client for /api/homepage-admin (server/src/routes/homepageAdmin.ts).
 * Every homepage collection shares the same verbs, so the editor is generic.
 */
/**
 * Where the Express API lives.
 *  1. NEXT_PUBLIC_API_URL if set.
 *  2. In the browser on a real domain (e.g. Vercel): the same site, since /api/* is routed to the server.
 *  3. On the server during a Vercel deployment: this deployment's own public URL.
 *  4. Otherwise local development: http://localhost:5000.
 */
function resolveApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const local = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(window.location.hostname);
    if (!local) return window.location.origin;
  }
  const host =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      : process.env.VERCEL_URL;
  if (host) return `https://${host}`;
  return "http://localhost:5000";
}

export const API_URL = resolveApiUrl().replace(/\/$/, "");

export type CollectionName =
  | "intellects"
  | "trips"
  | "destinations"
  | "events"
  | "testimonials"
  | "gallery"
  | "about-cards"
  | "founders"
  | "about-intellects"
  | "experience-intellects"
  | "experience-sites"
  | "experience-fragments"
  | "experience-questions"
  // round 8 — `?page=…` / `?destinationId=…` / `?folder=…` may be appended to scope a collection
  | "itineraries"
  | "icons"
  | "media"
  | "event-principles"
  | `itinerary-intellects?page=${string}`
  | `event-intellects?page=${string}`
  | `itineraries?destinationId=${string}`
  | `media?folder=${string}`;

/** "media?folder=x" → { base: "media", qs: "?folder=x" } — the query goes AFTER the id in item URLs. */
function splitName(name: string) {
  const i = name.indexOf("?");
  return i < 0 ? { base: name, qs: "" } : { base: name.slice(0, i), qs: name.slice(i) };
}
export type SaveMode = "draft" | "publish";

export interface FieldMeta {
  key: string;
  label: string;
  type?: "text" | "int" | "date" | "bool";
}

export interface CmsRecord {
  id: string;
  status: "DRAFT" | "PUBLISHED" | string;
  published: boolean;
  order: number;
  [key: string]: unknown;
}

export interface ApiError extends Error {
  status?: number;
  missing?: string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok || (json && json.success === false)) {
    const err: ApiError = new Error(json?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.missing = json?.missing;
    throw err;
  }
  return json as T;
}

export async function listCollection(name: CollectionName) {
  /** `profiles` — the Intellects library, returned for the per-page scholar placements */
  const { base, qs } = splitName(name);
  return request<{ success: true; data: CmsRecord[]; fields: FieldMeta[]; required: string[]; profiles?: CmsRecord[] }>(`/api/homepage-admin/${base}${qs}`);
}

/** Build multipart body from plain values + optional image file. */
function toFormData(values: Record<string, unknown>, file: File | null | undefined, imageField: string | undefined, mode?: SaveMode) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v instanceof Date) fd.append(k, v.toISOString());
    else fd.append(k, v === null ? "" : String(v));
  });
  if (file && imageField) fd.append("image", file, file.name);
  if (mode) fd.append("mode", mode);
  return fd;
}

export async function createItem(
  name: CollectionName,
  values: Record<string, unknown>,
  file: File | null | undefined,
  imageField: string | undefined,
  mode: SaveMode
) {
  const { base, qs } = splitName(name);
  return request<{ success: true; data: CmsRecord }>(`/api/homepage-admin/${base}${qs}`, {
    method: "POST",
    body: toFormData(values, file, imageField, mode),
  });
}

export async function updateItem(
  name: CollectionName,
  id: string,
  values: Record<string, unknown>,
  file: File | null | undefined,
  imageField: string | undefined,
  mode: SaveMode
) {
  const { base } = splitName(name);
  return request<{ success: true; data: CmsRecord }>(`/api/homepage-admin/${base}/${id}`, {
    method: "PUT",
    body: toFormData(values, file, imageField, mode),
  });
}

export async function setVisibility(name: CollectionName, id: string, published: boolean) {
  return request<{ success: true; data: CmsRecord }>(`/api/homepage-admin/${splitName(name).base}/${id}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ published }),
  });
}

export async function reorderItems(name: CollectionName, ids: string[]) {
  return request<{ success: true }>(`/api/homepage-admin/${splitName(name).base}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function deleteItem(name: CollectionName, id: string) {
  return request<{ success: true }>(`/api/homepage-admin/${splitName(name).base}/${id}`, { method: "DELETE" });
}

export type LinkSettingKey = "navContact" | "sketchCta" | "whyMaargaCta" | "intellectsCta" | "enquireCta" | "aboutWhyCta" | "expEnquireCta" | "expTabExperience" | "expTabItinerary" | "expTabGallery";
/** The seven photo slots of the About page's "Not Archival. Alive." composition, left → right. */
export const ABOUT_GALLERY_KEYS = [
  "aboutGalleryEdgeLeft",
  "aboutGalleryLeftTop",
  "aboutGalleryLeftBottom",
  "aboutGalleryCentre",
  "aboutGalleryRightTop",
  "aboutGalleryRightBottom",
  "aboutGalleryEdgeRight",
] as const;
export type AboutGalleryKey = (typeof ABOUT_GALLERY_KEYS)[number];
/** Experience-page copy + media and the About intellects copy live in settings too (see server seedData.EXPERIENCE_TEXT_DEFAULTS). */
export type ExperienceSettingKey = `exp${string}` | `aboutIntellects${string}` | `events${string}` | `bank${string}` | `destinations${string}`;
export type SettingKey = "festivalImage" | "ctaImage" | "heroVideo" | "tripsIntro" | "eventsIntro" | AboutGalleryKey | `${LinkSettingKey}Text` | `${LinkSettingKey}Url` | ExperienceSettingKey;

/** True when a CMS media URL is a video (Cloudinary /video/ path or a video extension). */
export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

/** Human message for a failed request (browsers say just "Failed to fetch" when the API is down). */
export function describeError(e: unknown) {
  const msg = (e as Error)?.message || String(e);
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return `Cannot reach the API at ${API_URL}`;
  return msg;
}

export async function getSettings() {
  return request<{ success: true; data: Partial<Record<SettingKey, string>> }>(`/api/homepage-admin/settings`);
}

export async function saveSettingValue(key: SettingKey, value: string) {
  const fd = new FormData();
  fd.append("value", value);
  return request<{ success: true; data: { key: string; value: string } }>(`/api/homepage-admin/settings/${key}`, {
    method: "PUT",
    body: fd,
  });
}

export async function saveSettingFile(key: SettingKey, file: File) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  return request<{ success: true; data: { key: string; value: string } }>(`/api/homepage-admin/settings/${key}`, {
    method: "PUT",
    body: fd,
  });
}

export function formatEventDate(iso: unknown) {
  if (!iso) return "";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** ISO → yyyy-mm-dd for <input type="date"> */
export function toDateInput(iso: unknown) {
  if (!iso) return "";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/* ---------- Round 8 helpers ---------- */

export interface MediaAsset extends CmsRecord {
  url: string;
  alt?: string | null;
  folder: string;
  kind: "image" | "video" | string;
  inBank: boolean;
  inFolderGallery: boolean;
}
export interface MediaFolder {
  key: string;
  label: string;
  kind: "general" | "destination" | "event" | "custom" | string;
  total: number;
  inBank: number;
  inFolderGallery: number;
}

export const listMedia = (folder?: string) => listCollection((folder ? `media?folder=${encodeURIComponent(folder)}` : "media") as CollectionName) as unknown as Promise<{ success: true; data: MediaAsset[] }>;
export const mediaSummary = () => request<{ success: true; data: { folders: MediaFolder[]; totals: { total: number; inBank: number } } }>(`/api/homepage-admin/media/summary`);

/** Upload a file straight into the media library (folder) and get the asset back. */
export async function uploadToLibrary(file: File, folder = "general", alt = "") {
  const res = await createItem("media", { folder, alt, inBank: false, inFolderGallery: true }, file, "url", "publish");
  return res.data as MediaAsset;
}

export const duplicateItinerary = (id: string) => request<{ success: true; data: CmsRecord }>(`/api/homepage-admin/itineraries/${id}/duplicate`, { method: "POST" });

export const folderKey = {
  destination: (id: string) => `destination:${id}`,
  event: (id: string) => `event:${id}`,
};
