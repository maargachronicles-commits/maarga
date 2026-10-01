# Maarga homepage — rounds 2 & 3 (10 Sept 2026)

## Round 3 (applies on top of round 2 — patch 0003)

| Request | Change |
|---|---|
| Destinations should NOT be scroll-linked | Now a **continuous left → right marquee** (rAF, transform-only, seamless loop, pauses off-screen), exactly like the testimonials row. Cards still link to `/destinations/[id]`. |
| Why Maarga patterns should NOT be scroll-linked | Now drift **continuously**: left column down, right column up (18 px/s). Each side stacks three copies of the 1542 px pattern so the loop never shows a gap. |
| Map: page should scroll with the figures so the row is fully visible | The pinned stage starts sliding up at **55 %** of the scrub and lands with the whole row ≥ 110 px above the fold (`ROW_MARGIN` in `ThreadAndPearls.tsx`). Reversible. |
| "Scroll down to go ahead" overlapping the sketch | Footer row on all three layers moved down to ~20 px from the bottom (was 50 px) with a translucent cream backing, so it never sits on a stroke but stays inside the frame. |

Install: `git am --3way 0003-*.patch` after 0002 (or use the round-3 zip). No server/admin/migration changes in round 3.


Builds on commit `988d23b`. Client, admin and server all compile (`tsc` + `next build`).
Behaviours below were verified in a headless browser against the built site.

## Install / update

```
git checkout homepage
git am --3way 0002-Homepage-round-2-sketch-fixes-scrubbed-destinations-CMS-editor.patch
npm install                                   # repo root

cd server
npm run generate && npm run migrate           # applies prisma/migrations/20260909180000_homepage_editor
npm run seed                                  # only if the DB is empty / you want the Figma placeholders
npm run dev                                   # :5000

cd ../client   && npm run dev                 # :3000   (.env.local: NEXT_PUBLIC_API_URL=http://localhost:5000)
cd ../admin    && npm run dev                 # :3001   (.env.local: NEXT_PUBLIC_API_URL=http://localhost:5000)
```
`client/.env.example` and `admin/.env.example` are now tracked (the `.gitignore` excluded them before).

## What changed on the site

| Request | Change |
|---|---|
| Sketch drew far too fast | Real cause: the stroke timeline placed ~2 000 tiny tweens with a relative `-=overlap`, collapsing them onto t≈0. `useStrokeDraw` now places every stroke at an absolute time → each layer takes **exactly 5 s** (`SKETCH_DURATION` in `SketchLayer.tsx`). |
| Sketch too light | Figma groups sit at 20 % opacity. CSS in the three `story*Sketch.css` files lifts them to 55 % and thickens the pen (ink 0.5→0.9, red 0.8→1.1). Tweak the three numbers there if you want it lighter/darker. |
| Start at 35 % visible | Layer 1 starts when the section top reaches 65 % of the viewport (`start: "top 65%"`). Layers 2/3 start when they become active. |
| Redraw when revisiting | Every activation (forward *or* back) restarts that layer from blank; layers behind stay fully drawn, layers ahead are hidden + blank. Scrolling back above the section resets everything so layer 1 redraws when you come down from the hero. |
| Skip on layer 3 | Added (right-aligned, same style). It scrolls past the stack into Why Maarga. |
| Destinations moved on their own | The section is now **pinned** and the row's horizontal travel is mapped 1:1 onto scroll distance (scrub, reversible). Stop scrolling → it stops. |
| Odd scrollbar | Thin 5 px minimal scrollbar, no arrow buttons (`globals.css`). |
| Why Maarga patterns | Left pattern drifts **down**, right pattern drifts **up** while the section passes through the viewport (scrubbed, reversible). |
| Cyclist on the map | Removed (`mapFigures.ts`, figure 219 and its thread stop). |
| Hero tagline off-centre | Tailwind's `-translate-x-1/2` plus the inline `translate(-50%)` double-shifted it. Fixed; it is centred. |
| Map end-state cut off | The pinned stage's inner wrapper slides up over the last ~14 % of the scrub by exactly its overflow, so when the figures land the "Led by…" heading and the full row are on screen. Reversible. |

Also: the homepage now renders fresh CMS data on every request (`force-dynamic`, `cache: "no-store"`), so a Publish in the CMS shows on the next reload.

## CMS (admin → Homepage)

`admin/src/app/homepage/page.tsx` is a new **live editor**. Tabs: Trips, Knowledge Sessions, Intellects, Destinations, Testimonials, Gallery, Hero video & images.

- Each item is rendered in the **real homepage design** (Clash Grotesk / Erode, exact card sizes, red panels, patterns). Click any text — including **button labels** — to edit it in place; click an image to replace it. Links for buttons sit in a small "↳ link" row under each button (visitors never see that row).
- **Show on homepage** toggle per item: hidden items stay saved but are not returned by `/api/homepage`.
- **Save as draft**: saves anything, even empty fields (status `DRAFT`, never shown on the site).
- **Publish**: every required field must be filled; missing ones are outlined in red and listed. Server re-validates and answers `422 { missing: [...] }`.
- ↑/↓ reorder, Delete, Discard unsaved edits; badges show Draft / Published / Hidden / Unsaved changes.
- Section intro copy for Trips and Knowledge Sessions is editable under the heading (stored as settings `tripsIntro`, `eventsIntro`).
- Hero video (MP4/WebM ≤ 60 MB), Festival image, and the CTA/footer image are in the last tab.

Sidebar entries *Intellects / Testimonials / Gallery* now jump straight to the matching tab so there is one place for homepage content. The old localStorage page is kept at `admin/legacy/homepage-localstorage.page.tsx.bak` for reference. The other legacy admin pages (Destinations detail, Itinerary, Events detail, Journeys) still use localStorage and are unchanged — they manage the detail pages, not the homepage.

## Server

- `prisma/migrations/20260909180000_homepage_editor`: `status` (DRAFT/PUBLISHED) on Trip/Intellect/Testimonial/GalleryImage; Trip `primaryCtaText`, `secondaryCtaText`, `secondaryCtaUrl`; Event `ctaText`, `ctaUrl`; previously NOT NULL text columns made nullable so drafts can be incomplete (Event `eventDate/startTime/endTime`, Destination `region`, Trip/Intellect/Testimonial text + image columns).
- `src/routes/homepageAdmin.ts` → `/api/homepage-admin/:collection` (`GET`, `POST`, `PUT /:id`, `PATCH /:id/visibility`, `PUT /reorder`, `DELETE /:id`) + `/settings/:key`. Body field `mode=draft|publish`.
- `/api/homepage` now returns only `status = PUBLISHED AND published = true`.
- Settings keys extended with `tripsIntro`, `eventsIntro`; `uploadToCloudinary` accepts `"video"` for the hero.
- Existing `/api/trips|events|…` routes are untouched and still work.

## Open items

- **Revoke the Figma token** pasted in the earlier chat.
- Run the migration against your Postgres (Prisma engines could not be downloaded in the sandbox, so it was not executed here).
- Existing rows get `status = 'PUBLISHED'` by default, so nothing disappears after migrating; Events keep whatever `status` they already had (the seed sets `PUBLISHED`).
- No auth on write routes (pre-existing).
- Fontshare is blocked in the sandbox, so preview screenshots use fallback fonts.
