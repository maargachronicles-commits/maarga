import type { Row } from "./fileStore";

export const PLACEMENT_FIELDS = ["name", "designation", "description", "image", "ctaText", "ctaUrl"] as const;

/**
 * Resolve a page's scholar placements against the Intellects library.
 * A placement shows the library profile it points at; any field the client
 * filled in ON THAT PAGE wins over the profile ("override"). Editing an
 * override never touches the library, and clearing it falls back to the profile.
 * Placements whose profile was deleted still render from their own fields.
 */
export function resolvePlacements(placements: Row[], profiles: Row[]) {
  const byId = new Map(profiles.map((p) => [String(p.id), p]));
  return placements.map((pl) => {
    const profile = pl.intellectId ? byId.get(String(pl.intellectId)) : undefined;
    const out: Row = { id: pl.id, intellectId: pl.intellectId ?? null, order: pl.order, overrides: [] as string[] };
    for (const f of PLACEMENT_FIELDS) {
      const own = pl[f];
      const has = own !== null && own !== undefined && String(own).trim() !== "";
      out[f] = has ? own : (profile?.[f] ?? null);
      if (has) (out.overrides as string[]).push(f);
    }
    return out;
  });
}

/** Only placements that have something to show (a name at least). */
export const renderable = (rows: Row[]) => rows.filter((r) => r.name);
