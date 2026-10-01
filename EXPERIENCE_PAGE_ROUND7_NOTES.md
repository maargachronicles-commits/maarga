# Maarga — round 7 (11 Sept 2026): About fixes, Experience page, Intellects library

Builds on the round-6 zip. Client, admin and server type-check; `client` and `admin` compile
(`next build`). Behaviours were verified in a headless browser at 1512, 1024 and 390 px.

## Run it (unchanged)

```
npm install                      # repo root, once
cd server && npm run dev         # :5000 — no database needed (local file store)
cd client && npm run dev         # :3000 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
cd admin  && npm run dev         # :3001 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
```
Existing `server/data/homepage-cms.json`: the Experience content and the per-page scholar
placements are added on the next start; nothing else is touched.
Postgres users: `npm run migrate` (new migration `20260912120000_experience_page`), then `npm run seed`.

## About page — the two animation fixes

| Request | Change |
|---|---|
| Why Maarga zooms “vertically” — should widen horizontally, icon animated (qq.mp4) | `AboutWhy.tsx` rewritten. The centre photo now widens **horizontally only** — its height never changes — until it spans the viewport; the six side photos ride out glued to its edges. Implemented transform-only: the clip box is `scaleX`’d and the photo inside is counter-scaled, so the picture is *revealed*, never stretched. The sketched visitor in the gateway **draws itself in head → feet** over the last 65 % of the widening (`FIGURE_FROM` in the file). Scrubbed, reversible, phone variant kept. Looks best with a wide (≈2.4:1) centre photo. |
| Manifesto hover fades — should be instant (ww.mp4) | Photo appears and text flips red → cream **in the same frame** (`visibility` swap, no transitions, no dark overlay). Mouse: hover. Touch: tap opens, tap again closes. |
| Intellects not editable on the About page | New **Intellects** tab in CMS → About page (see “Scholars” below). Section label / title / intro are editable there too. |

## Experience page — `/experience` (new)

Figma frame “Experience” 1512×9692, section by section:

| Section | Notes |
|---|---|
| Hero (657 px photo) + tabs | Label “HAMPI” + Clash 40 title on the photo; three pills (Experience active, red outline). Photo, texts, tab labels/links are CMS settings. |
| **Hampi, Karnataka + map** | Flat **2D India map** (same file as the homepage). Karnataka is red on the map; as you scroll it **lifts off, grows and glides down to its seat** beside the Overview copy, the **temple icon rises onto it** over the last 30 %, and the Overview text drifts in. Start/end positions are measured from the real layout, so it lands correctly on every screen size. Scrubbed, reversible. |
| What You’ve Been Told | Red label + Clash 22 line. |
| Two Lenses, One Place | Four numbered sites: sketch (820 px), Engineering / Cosmology copy, right-aligned Clash 48 title, a **red sketched figure standing in the sketch** (clickable — opens the CMS link) and the “*Click here on the person…” hint. Sketch wipes in and copy drifts up as the row enters, figure steps in last. |
| Fragments (red band) | Pins; scrolling **turns the pages** (out, then in — no overlap), counter 1/3 and “Scroll down for next”. 0.9 vh of scroll per fragment; a single fragment is a static band. |
| Intellects | Three cards + the red intro line under them (CMS scholars, see below). |
| Questions Hampi Still Asks | Title, questions, the two sketched figures. |
| Enquire + footer | “Begin Your Maarga” copy and the red **Book The Architecture of an Empire** button are CMS-editable for this page. |

Responsive: single column below 768 px, map/seat resized, sites stack (title + sketch above the copy), fragments band 100 svh.

## CMS

### New sidebar entry **Experience page** (`/experience` in the admin)
Tabs: **Hero & copy** (photo, “Hampi, Karnataka”, Overview, What You’ve Been Told), **Two Lenses (sites)** (add/reorder sites, sketch, figure + left/top %, hint, link), **Fragments**, **Intellects**, **Questions**, **Enquire, tabs & links**. Same live-preview editor as the homepage: click text/photo, Position, Show on Experience page, Save as draft / Publish. Copy fields publish on their own with a small Publish button under them.

### New sidebar entry **Intellects** (`/intellects`) — the profile library
One profile per scholar (photo, name, designation, description, optional link). This is the same collection the homepage shows (“Show on homepage” controls only the homepage row). The old localStorage page is kept at `admin/legacy/intellects-localstorage/`.

### Scholars on the About and Experience pages — pick from the library, edit per page
On About → Intellects and Experience → Intellects every card has a **Profile** dropdown. Pick a profile and the card shows it. Click any text or the photo to change it **for that page only**: the field is outlined red, **↺ use profile** goes back to the library value. The library profile and the other pages never change. A card with no profile can also be typed from scratch. Publishing needs a chosen profile (or a name). Verified: overriding a name on the Experience page left `/api/about` and `/api/homepage` unchanged.

## Server
- Models (Prisma + file store): `IntellectPlacement` (`page`, `intellectId`, optional overrides), `ExperienceSite`, `ExperienceFragment`, `ExperienceQuestion`. Migration `20260912120000_experience_page`.
- `GET /api/experience` (aggregate); `/api/about` now returns the page’s placements resolved against the library (`intellectId`, `overrides[]` included).
- Admin collections: `about-intellects`, `experience-intellects` (GET also returns `profiles`), `experience-sites`, `experience-fragments`, `experience-questions`.
- Settings: Experience copy keys `exp*` (defaults in `seedData.EXPERIENCE_TEXT_DEFAULTS`), media `expHeroImage`, links `expEnquireCta*`, `expTab*`, About intellects copy `aboutIntellects*`.
- `src/lib/placements.ts` — the override/merge rule in one place.

## Files (new / main edits)
- client: `src/app/experience/page.tsx`, `src/sections/experience/*` (6 sections), `sections/about/{AboutWhy,Manifesto,AboutIntellects}.tsx`, `sections/home/Footer.tsx` (CTA copy props), `lib/{types,api,placeholder}.ts`, `globals.css`; assets `public/figma/{karnataka-2d,india-2d-no-ka,exp-fig-*,exp-question-figures}.svg`, `exp-temple-icon.png`, `public/images/exp-*.jpg`.
- admin: `src/app/{experience,intellects,about}/page.tsx`, `components/homepage/{PageEditorShell,experienceSections}.tsx`, `editorKit.tsx`, `sections.tsx`, `homepage-editor.css`, `lib/homepageApi.ts`, `AdminSidebar.tsx`.
- server: `prisma/schema.prisma` + migration, `src/lib/{fileStore,db,seedData,placements}.ts`, `src/routes/{experience,about,homepageAdmin,settings}.ts`, `server.ts`, `public/images/exp-*.jpg`.

## Tunables
`FIGURE_FROM`, `FIGURE` (AboutWhy) · map trigger `start`/`end` and icon position (PlaceMap) · `STEP_VH` (Fragments) · sketch reveal timings (TwoLenses) · figure position per site in the CMS.

## Still open
- Revoke the Figma token pasted in the first chat.
- No auth on write routes (pre-existing).
- Fontshare / Google Fonts are blocked in the sandbox, so preview screenshots use fallback fonts.
- The “Itinerary” tab points at `/experience#itinerary` until that page exists (editable under Experience → Enquire, tabs & links).
