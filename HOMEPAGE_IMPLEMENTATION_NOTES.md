# Maarga homepage — implementation notes (Sept 2026)

Reference: `Homepage (1).pdf` (1512 px desktop) + Figma export `1498-53406`. Figma = visual truth,
behaviour spec = interaction/CMS truth. Everything below is additive; no legacy files were deleted.

## Run it
```
# server
cd server && cp .env.example .env   # fill DATABASE_URL + CLOUDINARY_*
npm run generate && npm run migrate  # applies prisma/migrations/20260909120000_homepage_cms
npm run seed                          # Figma placeholder content (uses CLIENT_PUBLIC_URL, default http://localhost:3000)
npm run dev                           # http://localhost:5000

# client
cd client && cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```
If the API is unreachable the client renders the same placeholder content from `src/lib/placeholder.ts`
(dev convenience only — a console warning is logged).

## Fonts
Confirmed from the Figma text styles: **Clash Grotesk** (display/buttons/wordmark) and **Erode** (body).
Loaded from Fontshare in `app/layout.tsx`. Exact scale in `globals.css` (`.t-h1 … .t-foot-link`).
Colours: `#A62F20` red, `#272727` ink, `#FFFDFA` cream.

## Client structure (`client/src`)
| Path | What |
|---|---|
| `app/page.tsx` | Server component; fetches `GET /api/homepage` (ISR 60 s) and composes the 15 sections |
| `app/[...slug]/page.tsx` | Temporary "coming soon" so every routed link resolves — delete as pages ship |
| `lib/api.ts`, `lib/types.ts`, `lib/placeholder.ts` | API client + fallback |
| `lib/gsap.ts`, `lib/lenis.ts`, `providers/AnimationProvider.tsx` | GSAP/ScrollTrigger + Lenis wiring |
| `components/ui/*` | SectionHeading, ArrowLink, CarouselArrows |
| `sections/home/Hero.tsx`, `Navbar.tsx`, `HeroVideo.tsx` | Hero. MAARGA wordmark is an SVG `<text textLength>` so it spans x=65→1462 exactly as in the PDF regardless of font loading |
| `sections/home/SketchStack.tsx`, `SketchLayer.tsx`, `useStrokeDraw.ts` | Three sketch layers. `useStrokeDraw` = the existing dash-offset engine (from the 3 `AppOriginal.tsx` copies), 4.5 s, ease none. The stack is pinned 3 viewports; scroll only selects the active layer (snaps to 0 / 0.5 / 1), each layer plays once and never reverses. Reuses `Group11/13/12` + their CSS in place |
| `sections/home/WhyMaarga.tsx`, `HeritageStrip.tsx` | Static, Figma-exact (patterns bleed from −596/−118 px, 40 %) |
| `sections/home/ThreadAndPearls.tsx`, `mapFigures.ts` | 2D India map (`public/figma/india-2d.svg`, generated from a states GeoJSON). Figures = Figma SVGs; positions are lat/lon in `mapFigures.ts` (edit there to move a pearl). Scroll-scrubbed, reversible timeline: 0–.2 emerge, .2–.9 travel, .9–1 settle; anchors measured at runtime |
| `sections/home/Intellects.tsx` | CMS cards (424 px, gap 40) |
| `sections/home/Trips.tsx`, `Events.tsx`, `useCarousel.ts` | Click carousels, transform-only |
| `sections/home/Destinations.tsx` | Scroll-scrubbed horizontal drift, links to `/destinations/[id]` |
| `sections/home/Festivals.tsx`, `Gallery.tsx` | CMS image / paginated 3-col grid |
| `sections/home/Testimonials.tsx` | rAF marquee L→R, centre-detection sets `data-active` (glow + full pattern) |
| `sections/home/Footer.tsx` | CTA + footer. The footer is the CTA photo with a white mask whose MAARGA letters are knocked out (`footer-wordmark-mask.svg`), exactly as in Figma; changing `settings.ctaImage` changes both |

Assets: `public/figma/*` (logo, patterns, quote, mask, figures), `public/images/*` (Figma photos as JPEG placeholders).

## Server additions (`server/`)
- Prisma: `Event.category` (default "Knowledge Session"), `Intellect`, `Testimonial`, `GalleryImage`, `SiteSetting`.
- Routes: `/api/intellects`, `/api/testimonials`, `/api/gallery`, `/api/settings/:key` (`festivalImage | ctaImage | heroVideo`), `/api/homepage` (aggregate). Same shape as trips/events/destinations; Cloudinary via `src/lib/upload.ts`.
- `prisma/seed.ts`, `.env.example`.

## Open / follow-ups
- Map figure → state mapping was assigned by reading the design (the Figma map is an isometric skew, so positions were re-expressed as lat/lon). Review `mapFigures.ts`.
- `admin/` still writes to localStorage; repoint it to these endpoints (out of homepage scope).
- No auth on write routes (pre-existing).
- Dead weight flagged for later cleanup (not deleted): `client/maarga/`, `*.zip`, `public/4.svg`, `aftertera.svg`, old `sections/Hero/{Loader,Story,ui,animations,hooks}`, `Story4/5/6`.
- Mobile Figma frames were not provided; sections reflow sensibly below 1024 px.
