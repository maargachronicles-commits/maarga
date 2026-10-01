/**
 * Figures for "The Thread and the Pearls".
 * `id` = Figma frame number (public/figma/fig<id>-row.svg). The Figma map is an
 * isometric skew of India, so positions are re-expressed here as lat/lon on
 * the flat 2D map (public/figma/india-2d.svg) — matched by order to the
 * designed placements; adjust lat/lon to move a pearl to a different state.
 * `thread` = order along the red connecting line. `w/h` = row size (px @1512).
 * (The Figma cyclist figure, 219, was removed on request — every figure travels to the row.)
 */
export interface MapFigure {
  id: number;
  lat: number;
  lon: number;
  w: number;
  h: number;
  place: string;
  inRow: boolean;
}

export const MAP_FIGURES: MapFigure[] = [
  { id: 349, lat: 34.15, lon: 77.55, w: 21.2, h: 74.7, place: "Ladakh", inRow: true },
  { id: 350, lat: 27.15, lon: 81.4, w: 22.3, h: 70.1, place: "Uttar Pradesh", inRow: true },
  { id: 348, lat: 28.6, lon: 77.2, w: 25.4, h: 78.0, place: "Delhi", inRow: true },
  { id: 347, lat: 26.9, lon: 71.9, w: 22.3, h: 70.1, place: "Rajasthan", inRow: true },
  { id: 204, lat: 23.5, lon: 72.1, w: 27.6, h: 72.7, place: "Gujarat", inRow: true },
  { id: 203, lat: 24.8, lon: 79.9, w: 20.6, h: 72.7, place: "Madhya Pradesh", inRow: true },
  { id: 222, lat: 20.3, lon: 85.8, w: 28.1, h: 85.0, place: "Odisha", inRow: true },
  { id: 210, lat: 20.0, lon: 75.3, w: 22.3, h: 70.1, place: "Maharashtra", inRow: true },
  { id: 214, lat: 15.4, lon: 74.0, w: 27.1, h: 71.4, place: "Goa / Karnataka coast", inRow: true },
  { id: 199, lat: 18.0, lon: 79.6, w: 18.3, h: 68.6, place: "Telangana", inRow: true },
  { id: 200, lat: 15.3, lon: 76.5, w: 21.2, h: 74.7, place: "Hampi, Karnataka", inRow: true },
  { id: 220, lat: 10.8, lon: 79.1, w: 25.4, h: 78.0, place: "Tamil Nadu", inRow: true },
  { id: 218, lat: 26.1, lon: 91.7, w: 31.7, h: 83.0, place: "Assam", inRow: true },
];

/** Row order (left → right) as in Figma "Frame 360". */
export const ROW_ORDER = [220, 214, 200, 210, 347, 199, 204, 348, 203, 222, 350, 349, 218];

/** Thread order for the red connecting line. */
export const THREAD_ORDER = [349, 350, 348, 347, 204, 210, 214, 220, 200, 199, 222, 203, 218];

/* Projection used to generate india-2d.svg (equirectangular, cos(22°) x-scale). */
const PROJ = { minLon: 68.19264, maxLat: 35.50133, k: 0.927184, scale: 35.50517, pad: 6, width: 974, height: 985.7 };
export const MAP_ASPECT = PROJ.width / PROJ.height;

/** lat/lon → percentage position inside the map box. */
export function toMapPct(lat: number, lon: number) {
  const x = (lon - PROJ.minLon) * PROJ.k * PROJ.scale + PROJ.pad;
  const y = (PROJ.maxLat - lat) * PROJ.scale + PROJ.pad;
  return { x: (x / PROJ.width) * 100, y: (y / PROJ.height) * 100 };
}

/** Catmull-Rom → cubic bezier path through points (viewBox units). */
export function threadPath(): string {
  const pts = THREAD_ORDER.map((id) => {
    const f = MAP_FIGURES.find((m) => m.id === id)!;
    const p = toMapPct(f.lat, f.lon);
    return { x: (p.x / 100) * PROJ.width, y: (p.y / 100) * PROJ.height };
  });
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const MAP_VIEWBOX = `0 0 ${PROJ.width} ${PROJ.height}`;
