import type { Delegate } from "./fileStore";

/**
 * Public codes for destinations and their itineraries.
 *
 *   destination  → 3 letters from the name + 4 digits   e.g. Hampi  → HAM0001
 *   itinerary    → the destination's 3 letters + 5 digits e.g.        HAM00001
 *
 * The letters come from the destination name (A–Z only, padded with X), the
 * digits count up per prefix, and the loop below guarantees uniqueness even
 * when rows were deleted in between. Codes never change once assigned — they
 * are the public URLs (/destinations/HAM0001/itinerary/HAM00001).
 */
export function prefixFor(name: string | null | undefined) {
  const letters = String(name || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (letters + "XXX").slice(0, 3);
}

export const codePrefix = (code: string | null | undefined) => String(code || "").slice(0, 3) || "XXX";

async function nextCode(model: Delegate, prefix: string, digits: number) {
  const rows = await model.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } });
  let max = 0;
  for (const r of rows) {
    const n = Number(String(r.code).slice(prefix.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  for (let n = max + 1; n < 10 ** digits; n++) {
    const code = `${prefix}${String(n).padStart(digits, "0")}`;
    if (!(await model.findFirst({ where: { code } }))) return code;
  }
  throw new Error(`No free ${prefix} codes left`);
}

export const nextDestinationCode = (model: Delegate, name: string) => nextCode(model, prefixFor(name), 4);
export const nextItineraryCode = (model: Delegate, destinationCode: string) => nextCode(model, codePrefix(destinationCode), 5);

/** Give every destination without a code one (runs at boot / seed so old rows get URLs). */
export async function ensureDestinationCodes(destination: Delegate) {
  const rows = await destination.findMany({ orderBy: { createdAt: "asc" } });
  for (const d of rows) {
    if (!d.code) await destination.update({ where: { id: d.id }, data: { code: await nextDestinationCode(destination, d.name) } });
  }
}
