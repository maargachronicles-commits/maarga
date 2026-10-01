# Maarga homepage — round 5 (10 Sept 2026)

Builds on the round-4 zip. Client, admin and server type-check; client + admin `next build` pass;
behaviours below were verified in a headless browser (desktop 1512 px and mobile 390 px).

## Run it — no database needed any more

```
npm install                      # repo root, once

cd server && npm run dev         # :5000  — works with NO .env at all (see below)
cd client && npm run dev         # :3000  — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
cd admin  && npm run dev         # :3001  — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Why the CMS said "Failed to fetch" / "API unreachable"
The API could not start on a machine without Postgres: `routes/destinations.ts` imported the
*generated* Prisma client at load time, so unless `DATABASE_URL` was set **and** `prisma generate`
+ `migrate` had run, the whole process crashed on boot. The admin then got "Failed to fetch" on
every tab (and you never saw the position controls or link rows).

Fixed at the root:
- `server/src/lib/db.ts` — one data entry point. If `DATABASE_URL` is set, the Prisma client exists
  and Postgres answers within 4 s → Postgres. Otherwise → **local JSON store**
  `server/data/homepage-cms.json`, created and seeded with the Figma placeholder content on first
  start. `STORAGE=file|postgres|auto` overrides. The console prints which one is active; the admin
  header shows it too ("Connected · local file store").
- `server/src/lib/upload.ts` — Cloudinary when `CLOUDINARY_*` is set, otherwise files go to
  `server/uploads/` and are served at `/uploads/…`.
- `lib/prisma.ts` no longer crashes when the client was not generated; `destinations.ts` loads
  `Prisma.JsonNull` lazily.
- Placeholder photos are now served by the API (`server/public/images` → `/static/images/…`) so
  they show in both the site and the admin whatever ports they run on.
- `client/next.config.ts`: Next 16 refuses to optimise images from `localhost` by default — every
  CMS image was silently broken in dev. Allowed while the API is local.
- `npm run seed` works against either store (`--force` to reset content). When you later move to
  Postgres: fill `DATABASE_URL`, `npm run generate && npm run migrate && npm run seed`.

## Homepage fixes

| Request | Change |
|---|---|
| Layer 3 "spawns in" instead of sketching | Two causes, both in `useStrokeDraw.ts`. (1) The figures are hundreds of 0.5–3 px fragments; a "hidden" dash still showed its round line-caps, so the figures were visible from frame one. Dashes are now padded (`DASH_PAD`). (2) Stroke order was sorted from untransformed `getBBox()`, but layer 3's landscape is mirrored and the figures flipped, so the order ignored where things really are. Positions are now measured on screen. Verified: layer 3 draws top→bottom over 5 s like layers 1 and 2. |
| White scrollbar track | Native scrollbar hidden (`globals.css`); `components/ui/ScrollIndicator.tsx` draws only the thumb — 4 px ink pill on the right, brighter while scrolling, red on hover, draggable, click-to-jump, Lenis-aware. Thinner on touch devices. |
| Progress above "What is Maarga" | `SketchProgress.tsx`: `1 ── 2 ── 3`. Finished parts are solid red, the active part's ring fills clockwise with the drawing progress, upcoming parts are faint; the connectors turn red once the part before them is done. Click a number to jump to that part. Erode digits, site colours only. |
| MAARGA "G" cut off | The wordmark + tagline are now anchored to the **bottom** of the hero instead of "69.6 % from the top" (which cropped more on wide/short viewports). Baseline 266 in a 272-unit viewBox: the G is whole, the flat feet still sit on the cream edge. |
| All devices | Hero type scales; sketch copy reflows and the drawing centres under it below 900 px; Why Maarga / section paddings reduced on phones; heritage strip swipes sideways; India map sized to the viewport and the figure row wraps; trip/event cards stack; testimonials grow with their text; footer keeps its mobile layout. |

## CMS (admin → Homepage)

- **Position** dropdown ("1 of 3") on every card + ← → — the client can put any card 1st, 2nd, 3rd…
  Saved immediately (`PUT /reorder`).
- **Buttons everywhere work the same way**: the button is shown as on the site, click its label to
  edit it (defaults are today's texts), and the **Link** row right under it is the page it opens.
  Trips (both buttons), Knowledge Sessions, Intellects (optional link under the profile),
  Destinations (card link + optional label), Testimonials (optional), Gallery (image link).
- New tab **Buttons & links** for section-level buttons: header *Contact Us*, *Learn more About us*,
  *Our experiences*, *Meet our intellectuals*, *Begin Your Maarga → Contact Us*. Empty = default.
- Connection problems now show what to run instead of a bare "Failed to fetch"; health re-checks
  every 15 s with a Retry.
- Responsive admin: below 900 px the sidebar is a drawer behind a top bar; tabs scroll sideways;
  previews scale to the column.

## Server / data changes
- Migration `20260910120000_homepage_links`: `Intellect.ctaText/ctaUrl`, `Destination.ctaText/ctaUrl`,
  `Testimonial.ctaText/ctaUrl`, `GalleryImage.ctaUrl` (the file store needs no migration).
- Settings keys added: `navContactText/Url`, `sketchCtaText/Url`, `whyMaargaCtaText/Url`,
  `intellectsCtaText/Url`, `enquireCtaText/Url` (defaults in `src/lib/seedData.ts`).
- `/api/health` → `{ store: "postgres" | "file", uploads: "cloudinary" | "local" }`.
- Existing `/api/trips|events|destinations` legacy routes still use Prisma directly and therefore
  still need Postgres — they are not used by the homepage or the homepage editor.

## Tunables
`DASH_PAD`, `Y_BAND` (`useStrokeDraw.ts`) · `SKETCH_DURATION` (`SketchLayer.tsx`) · ring/segment
styles under `.sk-*` and scrollbar under `.scroll-indicator` (`globals.css`) · hero wordmark
baseline/viewBox in `Hero.tsx`.

## Still open
- Revoke the Figma token pasted in the first chat.
- No auth on write routes (pre-existing).
- The about-page Figma export was mentioned but not attached; nothing about-page related was built.
- Fontshare is blocked in the sandbox, so preview screenshots use fallback fonts.
