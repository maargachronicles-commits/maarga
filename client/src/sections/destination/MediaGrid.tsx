"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaItem } from "@/lib/types";

const PAGE = 15; // 5 rows × 3 tiles, as in the Figma

/**
 * The 3-column 417×542 gallery grid (Figma Frame 307: 10 px between tiles, 11 px between
 * rows) shared by the destination gallery, the Gallery Bank and the event gallery.
 * Optional filters (location dropdown, All / Images / Videos) and page arrows (34 px, 0.8 px
 * red stroke, disabled at 20 %). Two columns on tablets, one on phones.
 */
export default function MediaGrid({
  items,
  locations,
  locationLabel = "Location",
  filters = false,
  paginate = true,
}: {
  items: MediaItem[];
  locations?: string[];
  locationLabel?: string;
  filters?: boolean;
  paginate?: boolean;
}) {
  const [location, setLocation] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => items.filter((i) => (!location || i.location === location) && (kind === "all" || i.kind === kind)),
    [items, location, kind]
  );
  const pages = paginate ? Math.max(1, Math.ceil(filtered.length / PAGE)) : 1;
  useEffect(() => setPage(0), [location, kind]);
  const shown = paginate ? filtered.slice(page * PAGE, page * PAGE + PAGE) : filtered;

  return (
    <div className="container">
      {filters && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="relative block w-full sm:w-[417px]">
            <span className="sr-only">{locationLabel}</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="t-body h-11 w-full appearance-none border border-red bg-cream px-6 pr-12 text-red"
            >
              <option value="">{locationLabel}</option>
              {(locations ?? []).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <svg width="13" height="8" viewBox="0 0 13 8" fill="none" aria-hidden className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-red">
              <path d="M0.5 0.5 6.5 6.5 12.5 0.5" stroke="currentColor" strokeWidth="1.45" />
            </svg>
          </label>
          <div className="flex items-center gap-1" role="tablist" aria-label="Media type">
            {(["all", "image", "video"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className={`t-body px-[10px] py-1 capitalize ${kind === k ? "border border-ink text-ink" : "text-ink/60 hover:text-ink"}`}
              >
                {k === "all" ? "All" : k === "image" ? "Images" : "Videos"}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="t-body mt-10 text-center text-ink/60">Nothing here yet.</p>
      ) : (
        <ul className={`grid grid-cols-1 gap-x-[10px] gap-y-[11px] sm:grid-cols-2 lg:grid-cols-3 ${filters ? "mt-[34px]" : ""}`}>
          {shown.map((m) => (
            <li key={m.id} className="relative aspect-[417/542] overflow-hidden bg-ink/5">
              {m.kind === "video" ? (
                <video src={m.url} muted loop playsInline autoPlay className="h-full w-full object-cover" aria-label={m.alt || ""} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || ""} loading="lazy" className="h-full w-full object-cover" />
              )}
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button type="button" className="car-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <span className="t-small text-ink">
            {page + 1} / {pages}
          </span>
          <button type="button" className="car-btn" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
