# Maarga — round 8 (12 Sept 2026): Itinerary, Gallery, Events pages + Destinations/Itineraries CMS

Builds on the round-7 zip. Server, client and admin type-check; `client` and `admin` compile (`next build`).
The admin **no longer needs `CLOUDINARY_URL` at build time** — all media goes through the API now.
Behaviours were verified in a headless browser at 1512 px and 390 px (no horizontal overflow, no page errors).

## Run it (unchanged)

```
npm install                      # repo root, once
cd server && npm run dev         # :5000 — no database needed (local file store)
cd client && npm run dev         # :3000 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
cd admin  && npm run dev         # :3001 — .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
```
Existing `server/data/homepage-cms.json`: on the next start every destination gets a code, Hampi gets one
itinerary (HAM00001), the icon library, the media library (folders), the events copy and one past event are
added. Nothing that already exists is changed.
Postgres users: `npm run migrate` (new migration `20260912180000_destinations_itineraries_media_events`), then `npm run seed`.

## Codes

| Thing | Code | Example URL |
|---|---|---|
| Destination | 3 letters from the name + 4 digits, assigned on creation, never changes | `/destinations/HAM0001` |
| Itinerary | the destination's 3 letters + 5 digits | `/destinations/HAM0001/itinerary/HAM00001` |

`/destinations/HAM0001` opens the first published itinerary; `/destinations/HAM0001/gallery` is the destination's gallery. The tabs under the hero (Experience / Itinerary / Gallery) are wired for every destination; the Experience tab points at the link set in Destination details (default `/experience`). The Experience page's own tabs now point at Hampi's itinerary and gallery.

## New public pages (all device-ready)

| Page | Figma frame | Notes |
|---|---|---|
| `/destinations` | — (no frame) | Card grid of published destinations, copy editable (CMS → Destinations & Itineraries → page copy). |
| `/destinations/[code]/itinerary/[itin]` | Itinerary | Hero + red “Enquire about this journey”, tabs, Journey Path heading, **duration dropdown switches between the destination's itineraries**, download button (uploaded PDF, or prints the page), sticky 164 px day rail (highlights the day in view, click to jump), days with 535×420 photo + activities + 24 px red icon squares, Where you'll stay, the itinerary's own scholars, Begin Your Maarga. Phone: rail scrolls horizontally, photo stacks above copy. |
| `/destinations/[code]/gallery` | Gallery | 3-column 417×542 grid of the destination folder's photos toggled “Destination gallery”. |
| `/gallery` | Gallery-Bank | Location dropdown (destinations that have Bank photos), All / Images / Videos, 15 per page with arrows. Shows every library file toggled “Gallery Bank”. |
| `/events` | Events- overview | Hero (photo darkened 30 %), Upcoming rows (date column, 539×424 photo, copy, Know more), How These Sessions Work, Past Events cards. **Upcoming/past is decided by the date.** |
| `/events/[id]` | Events - information / After the event | 1272×502 photo, breadcrumb, copy + Led by our Intellects + Who is this for, red-ruled sidebar (date, time, location, early bird / price, Book now). After the date: booking disappears, **Post event** text + feedback cards + the event's gallery appear. |

Experience page fix: the temple icon is centred on Karnataka's centroid (47 % / 54 %) so it sits fully on the red state after the animation (it was in the narrow northern tip).

## CMS

### Destinations & Itineraries (`/destinations`)
- Cards for every destination (photo, name, code, region, itinerary count, show toggle, Live link). **Create** by typing a name.
- Open a destination → tabs: **Itineraries** (list; New / Open builder / Duplicate / Delete / show toggle), **Destination details** (hero photo + copy, name, region, Experience link, Begin Your Maarga — in the real design), **Gallery folder**.
- **Itinerary builder**: the whole page in its design. Sticky bar: code, status, Show on site, Live, Duplicate, Discard, Save as draft, Publish (needs title, duration, ≥1 day with a title). Sections: Hero, Journey Path heading + duration + PDF, Days (add / reorder / remove; photo per day; activities with title, icons, text), **Icons used in this itinerary** (rename or replace an icon for this itinerary only, ↺ use library), Where you'll stay, Intellects (profile dropdown + per-itinerary overrides, as on About/Experience), Begin Your Maarga.

### Icons (`/icons`)
Library of activity icons (SVG/PNG; drawn cream on red automatically). Itineraries pick from here.

### Events (`/events`)
- **Events**: each event as the upcoming row visitors see (date picker, times, venue, photo, Know more). *Open event page →* for the detail page: paragraphs, Who is this for, format / meeting link, price, early bird (+ note), Book now, Post event text, feedback cards; tabs for the event's **Intellects** and **Gallery folder**.
- **How These Sessions Work** (numbered columns), **Hero, titles & links** (hero photo/line, section titles, Open Calendar link, Begin Your Maarga).

### Gallery (`/gallery`) — the media library
Folders: General, one per destination, one per event, plus custom folders. Multi-upload, caption, **Gallery Bank** toggle, **destination / event gallery** toggle, move between folders, delete. Header shows “N of M in Gallery Bank” and “N of M on the destination gallery page”; the sidebar shows the site-wide count.
**Every “Change image” button in the whole CMS now offers “from PC” or “from Gallery”** (picker with folders, search and “Upload here”). Everything uploaded anywhere lands in the library; replacing a picture never deletes a library file.

## Server
- Models: `Itinerary`, `ActivityIcon`, `MediaAsset`, `EventPrinciple`; `Destination` + code/hero/enquire fields; `Event` + subtitle, body, whoIsThisFor, postEventText, feedback (JSON), bookUrl/bookCtaText, earlyBirdNote.
- `/api/homepage-admin`: collections `itineraries` (`?destinationId=`), `icons`, `media` (`?folder=`), `event-principles`, `itinerary-intellects` / `event-intellects` (`?page=itinerary:<id>` / `event:<id>`); JSON field type; `POST /itineraries/:id/duplicate`; `GET /media/summary`.
- `/api/site`: `/destinations`, `/destinations/:code`, `/destinations/:code/itinerary/:itin` (`_first` = first published), `/events`, `/events/:id`, `/gallery`.
- `src/lib/codes.ts` (code generator), `src/lib/seedSite.ts` (round-8 seed), `public/icons/*.svg`, `public/images/itin-*, events-hero, event-detail-hero, gallery-*`.

## Files (new / main edits)
- client: `app/destinations/**`, `app/events/**`, `app/gallery/page.tsx`, `sections/destination/{ItineraryView,Stays,MediaGrid,tabs}.tsx`, `sections/events/EventCards.tsx`, `sections/experience/{ExperienceHero,PlaceMap}.tsx`, `sections/home/Navbar.tsx` (onCream), `lib/{types,api}.ts`, `globals.css` (icon tint, print).
- admin: `app/{destinations,events,gallery,icons}/**`, `components/homepage/{MediaLibraryPicker,MediaFolderView,eventSections}.tsx`, `editorKit.tsx` (from PC / from Gallery, setImageUrl, extraActions), `experienceSections.tsx` (PlacementEditor for any page), `sections.tsx`, `homepage-editor.css`, `lib/homepageApi.ts`, `ui/AdminSidebar.tsx`. Legacy localStorage pages → `admin/legacy/round7-localstorage/`.
- server: `prisma/schema.prisma` + migration, `src/lib/{fileStore,db,codes,seedSite,seedData}.ts`, `src/routes/{homepageAdmin,site,settings}.ts`, `server.ts`, `prisma/seed.ts`.

## Gaps / decisions to confirm
- No Figma frame for the `/destinations` index — a simple card grid was built.
- The homepage Gallery row still uses its own `gallery` collection (it can pick from the library, but the Gallery Bank toggle does not drive it). Say if they should be one thing.
- “Open Calendar” on the Events page is hidden until a link is set.
- The itinerary download button prints the page when no PDF is uploaded; upload a PDF in the builder for a real download.

## Still open
- Revoke the Figma token pasted in the first chat.
- No auth on write routes (pre-existing).
- Fontshare / Google Fonts are blocked in the sandbox, so preview screenshots use fallback fonts.
