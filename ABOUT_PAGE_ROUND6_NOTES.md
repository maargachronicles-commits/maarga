# Maarga — round 6 (11 Sept 2026): About page + homepage fixes

Builds on the round-5 zip. Client, admin and server type-check; `client` and `admin` compile
(`next build`; the admin's *legacy* `/api/gallery/*` routes still need `CLOUDINARY_URL` at build time,
as before). Behaviours were verified in a headless browser at 1512 px and 390 px.

## Run it (unchanged)

```
npm install                      # repo root, once
cd server && npm run dev         # :5000 — no database needed (local file store)
cd client && npm run dev         # :3000 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
cd admin  && npm run dev         # :3001 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
```
If you already have `server/data/homepage-cms.json` from round 5, the About-page content is added to it
automatically on the next start (homepage content is not touched). Postgres users: `npm run migrate`
(new migration `20260911120000_about_page`) then `npm run seed`.

## About page — `/about` (new)

Figma frame "About Us" 1512×9065, built section by section with the Figma spacing:

| Section | Notes |
|---|---|
| Hero (red, 800 px) | Nav on red → cream *Contact Us*; current page underlined. Three Clash 28 paragraphs with the designed underlined phrases. |
| The Norm We Refuse | Heading block + the two sketched figures (SVG composed from the Figma vectors). |
| Manifesto — 3 cards | **Hover (or tap on touch) reveals the card's photo behind the text; nothing shows otherwise.** Same photo on all three by default; each card's heading, text and hover photo are editable in the CMS. |
| The Founders (red) | CMS-driven (new *Founders* collection). |
| The Reason the Journey Becomes an Education | 13-figure row + profile grid. Uses the **same Intellects as the homepage** (CMS → Homepage → Intellects); every published profile is listed. |
| Not Archival. Alive. | Copy + the seven-photo composition. **Animation as in your video:** when the composition is centred the section pins, the centre photo grows until it fills the screen and pushes the side photos out of frame; reversible with scroll, then the page continues into Principles. All seven photos are CMS slots. On phones the stage is only as tall as the composition (no empty band) and the centre photo fills that. |
| A Methodology of Attention | 2×2 grid, 01–04. |
| Enquire + footer | Same components as the homepage (cream background here). |

Responsive: single column below 768 px, hero copy 22 px, cards stack, figure row wraps — checked at 390 px for stray gaps.

## CMS — new sidebar entry **About page** (`/about` in the admin)

Same live-preview editor as the homepage (click text/images, Position, Show on About page, Save as draft / Publish):
- **Manifesto cards** — heading, text, hover photo per card.
- **Founders** — image, name, designation, description.
- **Why Maarga photos** — the seven slots shown in the real 1558×637 layout; hover a photo → *Change photo* → *Publish photo*.
- **Buttons & links** — "View our destinations". (Header *Contact Us* and *Begin Your Maarga* are shared with the homepage.)

Server: models `AboutCard`, `Founder`; `GET /api/about`; admin collections `about-cards`, `founders`;
settings `aboutGalleryEdgeLeft/LeftTop/LeftBottom/Centre/RightTop/RightBottom/EdgeRight`, `aboutWhyCtaText/Url`.

## Homepage changes

| Request | Change |
|---|---|
| Remove 1/3 2/3 3/3 | Gone (`SketchLayer.tsx`); the 1 ── 2 ── 3 progress stays. |
| Why Maarga patterns too slow | `SPEED` 18 → 48 px/s (`WhyMaarga.tsx`). On phones the pattern runs as two **horizontal bands above and below the copy** (top moves left, bottom moves right) instead of at the sides. |
| Gap between figure row and profiles | Root cause: the pinned map stage slides its content up but kept its full height, leaving that much empty space under the row. The following content is now pulled up by the same amount → 50 px gap as designed (`ThreadAndPearls.tsx`). |
| Festivals image **or** video | CMS accepts MP4/WebM or a photo (Homepage → *Hero video & festival*); the site renders `<video>` (muted, loop) for videos. |
| Trips: remove rangoli overlay | Removed on the site **and** in the CMS preview (Trips only — Events still has it; say if it should go too). |
| Remove footer image option | The "Begin Your Maarga"/footer photo is no longer editable in the CMS. |
| Mobile: image on top for Trips & Events | `flex-col-reverse` below 768 px. |
| Mobile: stray Contact Us next to ☰ | Removed. It was a real bug: `.btn-red` sets `display` in un-layered CSS, which beats Tailwind's `hidden` utility, so the button never actually hid. Wrapped so the breakpoint works. |
| Mobile footer wordmark clipped | MAARGA now fits the width. |

Also fixed: editable headings in the CMS previews collapsed to body size (`font: inherit` on the textarea
outranked the type classes); the type scale is re-asserted for editable fields.

## Files (new / main edits)
- client: `src/app/about/page.tsx`, `src/sections/about/*` (7 sections), `Navbar.tsx` (onRed, active link), `Footer.tsx` (props), `Festivals.tsx`, `Trips.tsx`, `Events.tsx`, `WhyMaarga.tsx`, `ThreadAndPearls.tsx`, `SketchLayer.tsx`, `lib/{types,api,placeholder}.ts`, `globals.css`; `public/figma/about-*.svg`, `public/images/temple-gateway.jpg`.
- admin: `src/app/about/page.tsx`, `components/homepage/sections.tsx` (Manifesto/Founders/AboutGallery/AboutLinks editors, festival media, footer image removed, trips overlay removed), `editorKit.tsx`, `lib/homepageApi.ts`, `homepage-editor.css`, `AdminSidebar.tsx`, `public/figma/*`.
- server: `prisma/schema.prisma` + migration, `src/lib/{fileStore,db,seedData}.ts`, `src/routes/{about,settings,homepageAdmin,server}.ts`, `public/images/temple-gateway.jpg`.

## Still open
- Revoke the Figma token pasted in the first chat.
- No auth on write routes (pre-existing).
- Fontshare is blocked in the sandbox, so preview screenshots use fallback fonts.
