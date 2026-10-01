"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ButtonField,
  Editable,
  EmptyState,
  ImageField,
  ItemFrame,
  ScaledFrame,
  SectionHeadingPreview,
  useCollection,
  type EditableItem,
} from "./editorKit";
import {
  ABOUT_GALLERY_KEYS,
  API_URL,
  formatEventDate,
  getSettings,
  isVideoUrl,
  saveSettingFile,
  saveSettingValue,
  toDateInput,
  type CmsRecord,
  type AboutGalleryKey,
  type CollectionName,
  type SettingKey,
} from "@/lib/homepageApi";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/* ---------------------------------------------------------------------
   Generic collection wrapper
--------------------------------------------------------------------- */
export interface RenderApi {
  v: (key: string) => string;
  set: (key: string, val: string) => void;
  invalid: (key: string) => boolean;
  file: File | null;
  setFile: (f: File | null) => void;
  imageSrc: string | null;
  /** Intellects library (only for scholar placements) */
  profiles: CmsRecord[];
  /** an existing media-library file was chosen for the image field */
  pickImage: (url: string) => void;
}

export function CollectionSection({
  name,
  imageField,
  keys,
  designWidth,
  heading,
  intro,
  addLabel,
  newDefaults,
  layout = "stack",
  render,
  titleKey,
  titleOf,
  pageName = "homepage",
  previewBg,
  footerHint,
  extraActions,
}: {
  name: CollectionName;
  imageField?: string;
  keys: string[];
  designWidth: number;
  heading: ReactNode;
  intro?: ReactNode;
  addLabel: string;
  newDefaults?: Record<string, string>;
  layout?: "stack" | "grid3";
  render: (api: RenderApi, item: EditableItem) => ReactNode;
  titleKey?: string;
  /** custom title for the item bar (wins over titleKey) */
  titleOf?: (item: EditableItem, profiles: CmsRecord[]) => string | undefined;
  /** "homepage" (default) or "About page" — used in the hints & badges */
  pageName?: string;
  /** background of the item preview (e.g. red for the Founders section) */
  previewBg?: string;
  /** replaces the default footer hint */
  footerHint?: ReactNode;
  /** extra buttons in each item's bar */
  extraActions?: (item: EditableItem) => ReactNode;
}) {
  const toValues = useCallback((r: CmsRecord) => Object.fromEntries(keys.map((k) => [k, str(r[k])])), [keys]);
  const col = useCollection(name, imageField, toValues);

  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", border: "1px solid #e3ddd4", borderRadius: 10, padding: "28px 18px" }}>
        <ScaledFrame designWidth={1272}>
          <div style={{ width: 1272 }}>
            {heading}
            {intro}
          </div>
        </ScaledFrame>
      </div>

      {col.loading && <EmptyState text="Loading…" />}
      {col.loadError && <ConnectionHelp message={col.loadError} onRetry={col.reload} />}
      {!col.loading && !col.loadError && col.items.length === 0 && <EmptyState text="Nothing here yet. Add the first one below." />}

      <div style={layout === "grid3" ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 } : { display: "flex", flexDirection: "column", gap: 18 }}>
        {col.items.map((item, i) => {
          const api: RenderApi = {
            v: (k) => item.values[k] ?? "",
            set: (k, val) => col.setValue(item.id, k, val),
            invalid: (k) => item.missing.includes(k),
            file: item.file,
            setFile: (f) => col.setFile(item.id, f),
            imageSrc: imageField ? item.values[imageField] || null : null,
            profiles: col.profiles,
            pickImage: (url) => col.setImageUrl(item.id, url),
          };
          return (
            <ItemFrame
              key={item.id}
              item={item}
              index={i}
              count={col.items.length}
              title={titleOf ? titleOf(item, col.profiles) : titleKey ? item.values[titleKey] || undefined : undefined}
              onSaveDraft={() => col.save(item.id, "draft")}
              onPublish={() => col.save(item.id, "publish")}
              onToggle={(v) => col.toggle(item.id, v)}
              onDelete={() => col.remove(item.id)}
              onMove={(d) => col.move(item.id, d)}
              onMoveTo={(to) => col.moveTo(item.id, to)}
              onDiscard={() => col.discard(item.id)}
              pageName={pageName}
              previewBg={previewBg}
              extraActions={extraActions?.(item)}
            >
              <ScaledFrame designWidth={designWidth}>{render(api, item)}</ScaledFrame>
            </ItemFrame>
          );
        })}
      </div>

      <div>
        <button type="button" className="mg-btn primary" onClick={() => col.addNew(newDefaults)} style={{ height: 38, padding: "0 18px" }}>
          + {addLabel}
        </button>
        <p className="mg-hint" style={{ marginTop: 8 }}>
          {footerHint ?? (
            <>
              Click any text or image to edit it in place — button labels too; the <b>Link</b> row under each button is where it goes (visitors never see that row).
              Use <b>Position</b> (or ← →) to choose which card shows 1st, 2nd, 3rd… <b>Save as draft</b> keeps incomplete items; <b>Publish</b> needs every required field.
              <b> Show on {pageName}</b> hides something without deleting it.
            </>
          )}
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------
   Intellects — 424px card (image 424×420, name Clash 24 red, designation
   Erode 14, description Erode 16/25.6)
--------------------------------------------------------------------- */
export function IntellectsEditor() {
  return (
    <CollectionSection
      name="intellects"
      imageField="image"
      keys={["name", "designation", "description", "image", "ctaText", "ctaUrl"]}
      designWidth={424}
      layout="grid3"
      addLabel="Add intellect"
      titleKey="name"
      heading={<SectionHeadingPreview label="Intellects" title="Led by Those Who Have Earned It" />}
      render={(a) => (
        <div style={{ width: 424 }}>
          <ImageField
            src={a.imageSrc}
            file={a.file}
            onFile={a.setFile} onPick={a.pickImage}
            invalid={a.invalid("image")}
            style={{ width: 424, aspectRatio: "424 / 420", borderRadius: 4, background: "rgba(39,39,39,.05)" }}
          />
          <div style={{ marginTop: 24 }}>
            <Editable className="t-h3 c-red" value={a.v("name")} onChange={(v) => a.set("name", v)} placeholder="Name" invalid={a.invalid("name")} multiline={false} />
            <Editable className="t-small c-ink" style={{ marginTop: 8 }} value={a.v("designation")} onChange={(v) => a.set("designation", v)} placeholder="Designation" invalid={a.invalid("designation")} multiline={false} />
            <Editable className="t-body-lg c-ink" style={{ marginTop: 8 }} value={a.v("description")} onChange={(v) => a.set("description", v)} placeholder="Short description" invalid={a.invalid("description")} />
            <div style={{ marginTop: 16 }}>
              <ButtonField
                variant="arrow"
                optional
                text={a.v("ctaText")}
                url={a.v("ctaUrl")}
                onText={(v) => a.set("ctaText", v)}
                onUrl={(v) => a.set("ctaUrl", v)}
                textPlaceholder="Link under the profile"
                hint="Leave the label empty and no link is shown under this profile."
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}

/* ---------------------------------------------------------------------
   Trips — 1170×505 card: 313px red panel + image (the rangoli overlay was removed on request)
--------------------------------------------------------------------- */
export function TripsEditor() {
  return (
    <CollectionSection
      name="trips"
      imageField="image"
      keys={["category", "heading", "subtitle", "dates", "duration", "body", "bookNowUrl", "primaryCtaText", "secondaryCtaText", "secondaryCtaUrl", "image"]}
      designWidth={1170}
      addLabel="Add trip"
      titleKey="heading"
      newDefaults={{ primaryCtaText: "Experience with us", secondaryCtaText: "View Itinerary" }}
      heading={<SectionHeadingPreview label="Our Trips" title="What Trips Are We Organising Now" />}
      intro={<SettingText k="tripsIntro" placeholder="Intro paragraph shown under the title (leave empty to use the first trip's description)" />}
      render={(a) => (
        <article className="bg-cream" style={{ display: "flex", width: 1170, height: 505, overflow: "hidden" }}>
          <div className="bg-red c-cream" style={{ width: 313, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <Editable className="t-body" style={{ opacity: 0.6 }} value={a.v("category")} onChange={(v) => a.set("category", v)} placeholder="Category line" invalid={a.invalid("category")} multiline={false} />
              <Editable className="t-h2" style={{ marginTop: 4 }} value={a.v("heading")} onChange={(v) => a.set("heading", v)} placeholder="Trip title" invalid={a.invalid("heading")} multiline={false} />
              <Editable className="t-body" style={{ marginTop: 4 }} value={a.v("subtitle")} onChange={(v) => a.set("subtitle", v)} placeholder="Subtitle (optional)" multiline={false} />
              <div className="t-body" style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Editable value={a.v("dates")} onChange={(v) => a.set("dates", v)} placeholder="Dates" invalid={a.invalid("dates")} multiline={false} />
                <Editable style={{ textAlign: "right" }} value={a.v("duration")} onChange={(v) => a.set("duration", v)} placeholder="Duration" invalid={a.invalid("duration")} multiline={false} />
              </div>
              <Editable className="t-body" style={{ marginTop: 46 }} value={a.v("body")} onChange={(v) => a.set("body", v)} placeholder="Description" invalid={a.invalid("body")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ButtonField
                variant="cream"
                text={a.v("primaryCtaText")}
                url={a.v("bookNowUrl")}
                onText={(v) => a.set("primaryCtaText", v)}
                onUrl={(v) => a.set("bookNowUrl", v)}
                textInvalid={a.invalid("primaryCtaText")}
                urlInvalid={a.invalid("bookNowUrl")}
              />
              <ButtonField
                variant="cream"
                text={a.v("secondaryCtaText")}
                url={a.v("secondaryCtaUrl")}
                onText={(v) => a.set("secondaryCtaText", v)}
                onUrl={(v) => a.set("secondaryCtaUrl", v)}
                textInvalid={a.invalid("secondaryCtaText")}
              />
            </div>
          </div>
          <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
            <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("image")} style={{ width: "100%", height: "100%" }} />
          </div>
        </article>
      )}
    />
  );
}

/* ---------------------------------------------------------------------
   Destinations — 417×596 (image 417×542 → 27px → name Clash 22)
--------------------------------------------------------------------- */
export function DestinationsEditor() {
  return (
    <CollectionSection
      name="destinations"
      imageField="heroImage"
      keys={["name", "region", "subtitle", "heroImageAltText", "heroImage", "ctaText", "ctaUrl"]}
      designWidth={417}
      layout="grid3"
      addLabel="Add destination"
      titleKey="name"
      heading={<SectionHeadingPreview label="Our destinations" title="Where all we take you" />}
      render={(a) => (
        <div style={{ width: 417 }}>
          <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("heroImage")} style={{ width: 417, aspectRatio: "417 / 542", background: "rgba(39,39,39,.05)" }} />
          <Editable className="t-h4 c-ink" style={{ marginTop: 27 }} value={a.v("name")} onChange={(v) => a.set("name", v)} placeholder="Destination name" invalid={a.invalid("name")} multiline={false} />
          <div style={{ marginTop: 10 }}>
            <ButtonField
              variant="arrow"
              optional
              text={a.v("ctaText")}
              url={a.v("ctaUrl")}
              onText={(v) => a.set("ctaText", v)}
              onUrl={(v) => a.set("ctaUrl", v)}
              textPlaceholder="Label under the name"
              urlPlaceholder="Where the card opens (default: /destinations/<id>)"
              hint="The whole card is clickable. Leave the link empty to use this destination's own page."
            />
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 6, fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 11, color: "#666" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 90 }}>Region / state</span>
              <input value={a.v("region")} onChange={(e) => a.set("region", e.target.value)} placeholder="Karnataka" style={smallInput} />
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 90 }}>Image alt text</span>
              <input value={a.v("heroImageAltText")} onChange={(e) => a.set("heroImageAltText", e.target.value)} placeholder="Describe the image" style={smallInput} />
            </label>
          </div>
        </div>
      )}
    />
  );
}

const smallInput: React.CSSProperties = { flex: 1, height: 24, border: "1px dashed #cfc9bf", borderRadius: 4, padding: "0 6px", fontSize: 11, background: "#fff" };

/* ---------------------------------------------------------------------
   Events — 845×505 card, 1px red border, red date/duration, red button
--------------------------------------------------------------------- */
export function EventsEditor() {
  return (
    <CollectionSection
      name="events"
      imageField="image"
      keys={["category", "title", "location", "eventDate", "duration", "description", "ctaText", "ctaUrl", "imageAltText", "image"]}
      designWidth={845}
      addLabel="Add knowledge session"
      titleKey="title"
      newDefaults={{ ctaText: "Know more", category: "Knowledge Session" }}
      heading={<SectionHeadingPreview label="Events" title="Knowledge Sessions" />}
      intro={<SettingText k="eventsIntro" placeholder="Intro paragraph shown under the title (leave empty to use the default copy)" />}
      render={(a) => (
        <article className="bg-cream" style={{ display: "flex", width: 845, height: 505, border: "1px solid var(--mg-red)", overflow: "hidden" }}>
          <div className="c-ink" style={{ width: 313, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <Editable className="t-body" style={{ opacity: 0.6 }} value={a.v("category")} onChange={(v) => a.set("category", v)} placeholder="Category line" multiline={false} />
              <Editable className="t-h2" style={{ marginTop: 4 }} value={a.v("title")} onChange={(v) => a.set("title", v)} placeholder="Event title" invalid={a.invalid("title")} multiline={false} />
              <Editable className="t-body" style={{ marginTop: 4 }} value={a.v("location")} onChange={(v) => a.set("location", v)} placeholder="Location (optional)" multiline={false} />
              <div className="t-body c-red" style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <DateEditable value={a.v("eventDate")} onChange={(v) => a.set("eventDate", v)} invalid={a.invalid("eventDate")} />
                <Editable style={{ textAlign: "right" }} value={a.v("duration")} onChange={(v) => a.set("duration", v)} placeholder="Duration" invalid={a.invalid("duration")} multiline={false} />
              </div>
              <Editable className="t-body" style={{ marginTop: 46 }} value={a.v("description")} onChange={(v) => a.set("description", v)} placeholder="Description" invalid={a.invalid("description")} />
            </div>
            <ButtonField
              variant="red"
              text={a.v("ctaText")}
              url={a.v("ctaUrl")}
              onText={(v) => a.set("ctaText", v)}
              onUrl={(v) => a.set("ctaUrl", v)}
              textInvalid={a.invalid("ctaText")}
              urlPlaceholder="Where “Know more” opens (default: this session's page)"
            />
          </div>
          <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
            <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("image")} style={{ width: "100%", height: "100%" }} />
            <img src="/figma/pattern-card.svg" alt="" style={{ position: "absolute", left: -727, top: 290, width: 952, maxWidth: "none", pointerEvents: "none" }} />
          </div>
        </article>
      )}
    />
  );
}

/** Date shown as the visitor sees it ("14 Oct 2026"); click to change with a date picker. */
function DateEditable({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  if (open || !value) {
    return (
      <input
        type="date"
        autoFocus={open}
        value={toDateInput(value)}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
        onBlur={() => setOpen(false)}
        className={`mg-edit ${invalid ? "mg-invalid" : ""}`}
        style={{ width: "auto", fontWeight: 600 }}
      />
    );
  }
  return (
    <button type="button" className="mg-edit mg-inline" style={{ fontWeight: 600, cursor: "text" }} onClick={() => setOpen(true)} title="Click to change the date">
      {formatEventDate(value)}
    </button>
  );
}

/* ---------------------------------------------------------------------
   Testimonials — 844×313 card, red border, quote mark, pattern at bottom
--------------------------------------------------------------------- */
export function TestimonialsEditor() {
  return (
    <CollectionSection
      name="testimonials"
      keys={["quote", "travellerName", "role", "ctaText", "ctaUrl"]}
      designWidth={844}
      addLabel="Add testimonial"
      titleKey="travellerName"
      heading={<SectionHeadingPreview label="Testimonial" title="What Our Travellers Say" />}
      render={(a) => (
        <figure className="bg-white" style={{ position: "relative", width: 844, height: 313, border: "1px solid var(--mg-red)", overflow: "hidden", margin: 0 }}>
          <div style={{ position: "absolute", left: 70, right: 70, top: 50 }}>
            <img src="/figma/quote.svg" alt="" width={30} height={31} />
            <Editable className="t-body c-ink" style={{ marginTop: 8 }} value={a.v("quote")} onChange={(v) => a.set("quote", v)} placeholder="What the traveller said…" invalid={a.invalid("quote")} />
            <div style={{ marginTop: 25 }}>
              <Editable className="t-h4 c-ink" value={a.v("travellerName")} onChange={(v) => a.set("travellerName", v)} placeholder="Traveller name" invalid={a.invalid("travellerName")} multiline={false} />
              <Editable className="t-body c-ink" style={{ marginTop: 2 }} value={a.v("role")} onChange={(v) => a.set("role", v)} placeholder="Role / organisation (optional)" multiline={false} />
              <div style={{ marginTop: 12, maxWidth: 420 }}>
                <ButtonField
                  variant="arrow"
                  optional
                  text={a.v("ctaText")}
                  url={a.v("ctaUrl")}
                  onText={(v) => a.set("ctaText", v)}
                  onUrl={(v) => a.set("ctaUrl", v)}
                  textPlaceholder="Link under the name"
                  hint="Optional — e.g. “Read the full story”. Needs both a label and a link to show."
                />
              </div>
            </div>
          </div>
          <img src="/figma/pattern-testimonial.svg" alt="" style={{ position: "absolute", bottom: -42, left: -1, width: 847, maxWidth: "none", pointerEvents: "none" }} />
        </figure>
      )}
    />
  );
}

/* ---------------------------------------------------------------------
   Gallery — 417×542 tiles
--------------------------------------------------------------------- */
export function GalleryEditor() {
  return (
    <CollectionSection
      name="gallery"
      imageField="url"
      keys={["alt", "url", "ctaUrl"]}
      designWidth={417}
      layout="grid3"
      addLabel="Add gallery image"
      heading={<SectionHeadingPreview label="Gallery" title="Places do not speak for themselves. These do." />}
      render={(a) => (
        <div style={{ width: 417 }}>
          <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("url")} style={{ width: 417, aspectRatio: "417 / 542", background: "rgba(39,39,39,.05)" }} />
          <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 11, color: "#666" }}>
            <span style={{ width: 90 }}>Alt text</span>
            <input value={a.v("alt")} onChange={(e) => a.set("alt", e.target.value)} placeholder="Describe the image (accessibility)" style={smallInput} />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 11, color: "#666" }}>
            <span style={{ width: 90 }}>Image link</span>
            <input value={a.v("ctaUrl")} onChange={(e) => a.set("ctaUrl", e.target.value)} placeholder="Optional — page this tile opens" style={smallInput} />
          </label>
        </div>
      )}
    />
  );
}

/* ---------------------------------------------------------------------
   Settings — single assets / copy: hero video, festival image, CTA image,
   trips & events intro paragraphs.
--------------------------------------------------------------------- */
export function useSetting(key: SettingKey) {
  const [value, setValue] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getSettings()
      .then((r) => setValue(r.data[key] || ""))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoaded(true));
  }, [key]);
  const saveText = async (v: string) => {
    setBusy(true);
    setError(null);
    try {
      await saveSettingValue(key, v);
      setValue(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const saveFile = async (f: File) => {
    setBusy(true);
    setError(null);
    try {
      const r = await saveSettingFile(key, f);
      setValue(r.data.value);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { value, loaded, busy, error, saveText, saveFile };
}

/** Editable intro paragraph under a section heading, saved as a setting. */
export function SettingText({ k, placeholder }: { k: SettingKey; placeholder: string }) {
  const s = useSetting(k);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? s.value;
  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Editable className="t-body c-ink" style={{ maxWidth: 864, textAlign: "center" }} value={shown} onChange={setDraft} placeholder={placeholder} />
      {draft !== null && draft !== s.value && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" className="mg-btn primary" disabled={s.busy} onClick={() => s.saveText(draft).then(() => setDraft(null))}>
            {s.busy ? "Saving…" : "Save intro"}
          </button>
          <button type="button" className="mg-btn" onClick={() => setDraft(null)}>
            Discard
          </button>
        </div>
      )}
      {s.error && <div className="mg-errors" style={{ marginTop: 8 }}>{s.error}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Connection help — shown instead of the bare "Failed to fetch"
--------------------------------------------------------------------- */
export function ConnectionHelp({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const unreachable = /fetch|network|unreachable/i.test(message);
  return (
    <div className="mg-conn">
      <strong>{unreachable ? `The API at ${API_URL} is not answering.` : message}</strong>
      {unreachable ? (
        <>
          <div style={{ marginTop: 6 }}>
            Start it in a terminal — no database or Cloudinary account is needed, the API keeps its content in a local file until Postgres is configured:
          </div>
          <pre>cd server{"\n"}npm run dev</pre>
          <div style={{ marginTop: 8 }}>
            If it runs on another port or machine, set <code>NEXT_PUBLIC_API_URL</code> in <code>admin/.env.local</code> and restart the admin.
          </div>
        </>
      ) : null}
      {onRetry && (
        <button type="button" className="mg-btn primary" style={{ marginTop: 10 }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Buttons & links — every section-level button on the homepage, shown as
   it appears on the site with editable text + the page it opens.
--------------------------------------------------------------------- */
export const LINK_ITEMS: { key: string; section: string; where: string; variant: "red" | "cream" | "arrow" | "arrow-light"; onRed?: boolean; defaults: { text: string; url: string } }[] = [
  { key: "navContact", section: "Header", where: "Red button at the top right of every page", variant: "red", defaults: { text: "Contact Us", url: "/contact" } },
  { key: "sketchCta", section: "What is Maarga (3rd sketch)", where: "Underlined link at the bottom of the third drawing", variant: "arrow", defaults: { text: "Learn more About us", url: "/about" } },
  { key: "whyMaargaCta", section: "Why Maarga", where: "Underlined link at the end of the red section", variant: "arrow-light", onRed: true, defaults: { text: "Our experiences", url: "/experience" } },
  { key: "intellectsCta", section: "Intellects", where: "Underlined link under the three profile cards", variant: "arrow", defaults: { text: "Meet our intellectuals", url: "/about" } },
  { key: "enquireCta", section: "Begin Your Maarga", where: "Red button above the footer", variant: "red", defaults: { text: "Contact Us", url: "/contact" } },
];

export function LinkSettingEditor({ item }: { item: (typeof LINK_ITEMS)[number] }) {
  const text = useSetting(`${item.key}Text` as SettingKey);
  const url = useSetting(`${item.key}Url` as SettingKey);
  const [t, setT] = useState<string | null>(null);
  const [u, setU] = useState<string | null>(null);
  const shownT = t ?? text.value ?? "";
  const shownU = u ?? url.value ?? "";
  const dirty = (t !== null && t !== text.value) || (u !== null && u !== url.value);
  const busy = text.busy || url.busy;
  const save = async () => {
    if (t !== null && t !== text.value) await text.saveText(t || item.defaults.text);
    if (u !== null && u !== url.value) await url.saveText(u || item.defaults.url);
    setT(null);
    setU(null);
  };
  return (
    <div className="mg-item">
      <div className="mg-item-bar">
        <strong style={{ color: "#222" }}>{item.section}</strong>
        <span className="mg-hint">{item.where}</span>
        <span className="grow" />
        {dirty && (
          <>
            <button type="button" className="mg-btn" onClick={() => { setT(null); setU(null); }}>
              Discard
            </button>
            <button type="button" className="mg-btn primary" disabled={busy} onClick={save}>
              {busy ? "Saving…" : "Publish"}
            </button>
          </>
        )}
      </div>
      {(text.error || url.error) && <div className="mg-errors">{text.error || url.error}</div>}
      <div className={`mg-preview mg ${item.onRed ? "bg-red" : ""}`} style={{ display: "flex", justifyContent: "center", padding: "28px 18px" }}>
        <div style={{ width: item.variant === "red" ? 260 : 320, maxWidth: "100%" }}>
          <ButtonField
            variant={item.variant}
            text={shownT}
            url={shownU}
            onText={setT}
            onUrl={setU}
            textPlaceholder={item.defaults.text}
            urlPlaceholder={item.defaults.url}
          />
        </div>
      </div>
    </div>
  );
}

export function LinksEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p className="mg-hint" style={{ margin: 0 }}>
        Card buttons (trips, knowledge sessions, intellects, destinations…) are edited on their own cards. The buttons below belong to a whole
        section; change the label, and the <b>Link</b> underneath is the page it opens. Empty fields fall back to the defaults shown.
      </p>
      {LINK_ITEMS.map((it) => (
        <LinkSettingEditor key={it.key} item={it} />
      ))}
    </section>
  );
}

export function SettingImage({ k, title, hint, width, aspect, video, media }: { k: SettingKey; title: string; hint: string; width: number; aspect: string; video?: boolean; /** accepts an image OR a video */ media?: boolean }) {
  const s = useSetting(k);
  const [file, setFile] = useState<File | null>(null);
  const showsVideo = video || (media && (file ? file.type.startsWith("video/") : isVideoUrl(s.value)));
  return (
    <div className="mg-item">
      <div className="mg-item-bar">
        <strong style={{ color: "#222" }}>{title}</strong>
        <span className="mg-hint">{hint}</span>
        <span className="grow" />
        {file && (
          <>
            <button type="button" className="mg-btn" onClick={() => setFile(null)}>
              Discard
            </button>
            <button type="button" className="mg-btn primary" disabled={s.busy} onClick={() => s.saveFile(file).then(() => setFile(null))}>
              {s.busy ? "Uploading…" : "Publish"}
            </button>
          </>
        )}
      </div>
      {s.error && <div className="mg-errors">{s.error}</div>}
      <div className="mg-preview mg">
        <ScaledFrame designWidth={width}>
          <ImageField
            src={s.value || null}
            file={file}
            onFile={setFile}
            onPick={(u) => s.saveText(u)}
            accept={video ? "video/mp4,video/webm" : media ? "image/*,video/mp4,video/webm" : "image/*"}
            label={video ? "Change video" : media ? "Change image / video" : "Change image"}
            style={{ width, aspectRatio: aspect, background: "rgba(39,39,39,.05)" }}
            render={showsVideo ? (url) => <video src={url} muted autoPlay loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : undefined}
          />
        </ScaledFrame>
      </div>
    </div>
  );
}

export function SettingsEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SettingImage k="heroVideo" title="Hero background video" hint="Autoplays muted behind the navigation. MP4/WebM, keep it under ~60 MB." width={1512} aspect="1512 / 862" video />
      <div style={{ background: "#fff", border: "1px solid #e3ddd4", borderRadius: 10, padding: "28px 18px" }}>
        <ScaledFrame designWidth={1272}>
          <div style={{ width: 1272 }}>
            <SectionHeadingPreview label="Festivals" title="Experience the tradition in Maarga way" />
          </div>
        </ScaledFrame>
      </div>
      <SettingImage k="festivalImage" title="Festival image or video" hint="The 1272 × 529 media under “Experience the tradition in Maarga way” — a photo or an MP4/WebM video (plays muted, loops)." width={1272} aspect="1272 / 529" media />
      {/* The footer / "Begin Your Maarga" photo is fixed by design and intentionally not editable here. */}
    </section>
  );
}

/* =====================================================================
   ABOUT PAGE
===================================================================== */

/* Manifesto — "A New Paradigm of Living Wisdom": 424×583 card, 40px padding,
   Clash 28 red heading at the top, Clash 22 body at the bottom, 1px red
   border. The photo is revealed behind the card on hover on the site; here it
   is shown faded so the client sees what will appear. */
export function ManifestoEditor() {
  return (
    <CollectionSection
      name="about-cards"
      imageField="image"
      keys={["title", "body", "image"]}
      designWidth={424}
      layout="grid3"
      addLabel="Add manifesto card"
      titleKey="title"
      pageName="About page"
      heading={
        <SectionHeadingPreview label="Manifesto" title="A New Paradigm of Living Wisdom">
          <p className="t-body c-ink" style={{ marginTop: 16, maxWidth: 856 }}>
            We use travel, scholar-led sessions, and curated knowledge experiences to unlock the philosophy, spatial intelligence, and living wisdom
            embedded in India&apos;s heritage landscapes. The scholar is the product. The transformation is the outcome.
          </p>
        </SectionHeadingPreview>
      }
      render={(a) => (
        <div style={{ width: 424 }}>
          <article className="bg-cream" style={{ position: "relative", width: 424, height: 583, border: "1px solid var(--mg-red)", padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center", overflow: "hidden" }}>
            <Editable className="t-h2 c-red" value={a.v("title")} onChange={(v) => a.set("title", v)} placeholder="We will not…" invalid={a.invalid("title")} style={{ position: "relative", zIndex: 1 }} />
            <Editable className="t-h4 c-ink" value={a.v("body")} onChange={(v) => a.set("body", v)} placeholder="What this means for every journey" invalid={a.invalid("body")} style={{ position: "relative", zIndex: 1 }} />
          </article>
          <p className="mg-hint" style={{ margin: "10px 0 6px" }}>
            <b>Hover photo</b> — hidden until a visitor moves the mouse over (or taps) this card, then it fills the card behind the text.
          </p>
          <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("image")} label="Change hover photo" style={{ width: 424, aspectRatio: "424 / 583", background: "rgba(39,39,39,.05)" }} />
        </div>
      )}
    />
  );
}

/* Founders — red section; card 424: image 424×420 r4 → 24 → name Clash 22 →
   8 → designation Erode 16 → 8 → description Erode 16 (all cream). */
export function FoundersEditor() {
  return (
    <CollectionSection
      name="founders"
      imageField="image"
      keys={["name", "designation", "description", "image"]}
      designWidth={424}
      layout="grid3"
      addLabel="Add founder"
      titleKey="name"
      pageName="About page"
      previewBg="var(--mg-red)"
      heading={
        <div className="bg-red" style={{ margin: "-28px -18px", padding: "28px 18px" }}>
          <SectionHeadingPreview label="The Architects" title="The Founders" light />
        </div>
      }
      render={(a) => (
        <div className="bg-red c-cream" style={{ width: 424 }}>
          <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("image")} style={{ width: 424, aspectRatio: "424 / 420", borderRadius: 4, background: "rgba(0,0,0,.1)" }} />
          <div style={{ marginTop: 24 }}>
            <Editable className="t-h4" value={a.v("name")} onChange={(v) => a.set("name", v)} placeholder="Name" invalid={a.invalid("name")} multiline={false} />
            <Editable className="t-body" style={{ marginTop: 8 }} value={a.v("designation")} onChange={(v) => a.set("designation", v)} placeholder="Designation" invalid={a.invalid("designation")} multiline={false} />
            <Editable className="t-body" style={{ marginTop: 8 }} value={a.v("description")} onChange={(v) => a.set("description", v)} placeholder="Short description" invalid={a.invalid("description")} />
          </div>
        </div>
      )}
    />
  );
}

/* "Not Archival. Alive." — seven photo slots shown in the real 1558×637 layout.
   Click a photo to replace it; each slot publishes on its own. */
const GALLERY_LAYOUT: Record<AboutGalleryKey, { left: number; top: number; w: number; h: number; label: string }> = {
  aboutGalleryEdgeLeft: { left: 0, top: 147, w: 260, h: 343, label: "Left edge" },
  aboutGalleryLeftTop: { left: 277, top: 0, w: 260, h: 265, label: "Left top" },
  aboutGalleryLeftBottom: { left: 277, top: 294, w: 260, h: 343, label: "Left bottom" },
  aboutGalleryCentre: { left: 554, top: 0, w: 450, h: 637, label: "Centre (grows to fill the screen on scroll)" },
  aboutGalleryRightTop: { left: 1021, top: 0, w: 260, h: 265, label: "Right top" },
  aboutGalleryRightBottom: { left: 1021, top: 294, w: 260, h: 343, label: "Right bottom" },
  aboutGalleryEdgeRight: { left: 1298, top: 147, w: 260, h: 343, label: "Right edge" },
};

function GallerySlot({ k }: { k: AboutGalleryKey }) {
  const s = useSetting(k);
  const [file, setFile] = useState<File | null>(null);
  const l = GALLERY_LAYOUT[k];
  return (
    <div style={{ position: "absolute", left: l.left, top: l.top, width: l.w, height: l.h }} title={l.label}>
      <ImageField src={s.value || null} file={file} onFile={setFile} onPick={(u) => s.saveText(u)} label="Change photo" style={{ width: "100%", height: "100%", background: "rgba(39,39,39,.05)" }} />
      {k === "aboutGalleryCentre" && !file && (
        <img src="/figma/about-gallery-figure.svg" alt="" style={{ position: "absolute", left: "44%", top: "60.75%", width: "9.4%", pointerEvents: "none" }} />
      )}
      {file && (
        <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, display: "flex", gap: 6, justifyContent: "center", zIndex: 2 }}>
          <button type="button" className="mg-btn" onClick={() => setFile(null)}>Discard</button>
          <button type="button" className="mg-btn primary" disabled={s.busy} onClick={() => s.saveFile(file).then(() => setFile(null))}>
            {s.busy ? "Uploading…" : "Publish photo"}
          </button>
        </div>
      )}
      {s.error && <div className="mg-errors" style={{ position: "absolute", inset: "auto 0 0 0" }}>{s.error}</div>}
    </div>
  );
}

export function AboutGalleryEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", border: "1px solid #e3ddd4", borderRadius: 10, padding: "28px 18px" }}>
        <ScaledFrame designWidth={1272}>
          <div style={{ width: 1272 }}>
            <SectionHeadingPreview label="Why Maarga" title="Not Archival. Alive.">
              <p className="t-body c-ink" style={{ marginTop: 18, maxWidth: 675 }}>
                Maarga&apos;s knowledge does not live in a lecture hall. It lives in the field — under the shade of a mandapa at midday, at the edge of a
                stepwell before the light changes, in the pause before a scholar answers a question they&apos;ve been asked a hundred times and still finds
                worth answering.
              </p>
              <p className="t-body c-ink" style={{ marginTop: 18 }}>You will stand in these places. Not read about them.</p>
            </SectionHeadingPreview>
          </div>
        </ScaledFrame>
      </div>
      <div className="mg-item">
        <div className="mg-item-bar">
          <strong style={{ color: "#222" }}>Seven photos</strong>
          <span className="mg-hint">Shown exactly as on the About page. Hover a photo and click “Change photo”; each one publishes on its own. As the visitor scrolls, the centre photo grows to fill the screen.</span>
        </div>
        <div className="mg-preview mg">
          <ScaledFrame designWidth={1558}>
            <div style={{ position: "relative", width: 1558, height: 637 }}>
              {ABOUT_GALLERY_KEYS.map((k) => (
                <GallerySlot key={k} k={k} />
              ))}
            </div>
          </ScaledFrame>
        </div>
      </div>
    </section>
  );
}

/** Buttons that live on the About page only. */
const ABOUT_LINK_ITEMS: typeof LINK_ITEMS = [
  { key: "aboutWhyCta", section: "Not Archival. Alive.", where: "Underlined link under the Why Maarga copy", variant: "arrow", defaults: { text: "View our destinations", url: "/destinations" } },
];

export function AboutLinksEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p className="mg-hint" style={{ margin: 0 }}>
        The header <b>Contact Us</b> and the <b>Begin Your Maarga</b> button are shared with the homepage — edit them under Homepage → Buttons &amp; links.
      </p>
      {ABOUT_LINK_ITEMS.map((it) => (
        <LinkSettingEditor key={it.key} item={it} />
      ))}
    </section>
  );
}
