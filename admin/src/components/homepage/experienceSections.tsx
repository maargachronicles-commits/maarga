"use client";

import { useState, type ReactNode } from "react";
import { ButtonField, Editable, ImageField, ScaledFrame, SectionHeadingPreview, type EditableItem } from "./editorKit";
import { CollectionSection, LINK_ITEMS, LinkSettingEditor, SettingImage, useSetting, type RenderApi } from "./sections";
import type { CmsRecord, CollectionName, SettingKey } from "@/lib/homepageApi";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/* =====================================================================
   Scholar placements — "pick a profile from the Intellects library, then
   (optionally) change anything for THIS page only".
   Every field shows the library value greyed-in as the default; typing
   replaces it on this page; "↺ use profile" clears the override.
===================================================================== */
const PLACEMENT_KEYS = ["intellectId", "name", "designation", "description", "image", "ctaText", "ctaUrl"] as const;

function OverrideField({
  a,
  k,
  profile,
  className,
  style,
  placeholder,
  multiline = true,
}: {
  a: RenderApi;
  k: (typeof PLACEMENT_KEYS)[number];
  profile: CmsRecord | undefined;
  className: string;
  style?: React.CSSProperties;
  placeholder: string;
  multiline?: boolean;
}) {
  const own = a.v(k);
  const base = str(profile?.[k]);
  const overridden = own.trim() !== "";
  return (
    <div style={{ position: "relative" }}>
      <Editable
        className={`${className} ${overridden ? "mg-override" : ""}`}
        style={style}
        value={overridden ? own : base}
        onChange={(v) => a.set(k, v === base ? "" : v)}
        placeholder={placeholder}
        multiline={multiline}
        invalid={a.invalid(k)}
      />
      {overridden && profile && (
        <button type="button" className="mg-override-reset" title="Go back to what the library profile says" onClick={() => a.set(k, "")}>
          ↺ use profile
        </button>
      )}
    </div>
  );
}

export function PlacementEditor({
  page,
  heading,
  intro,
  previewBg,
  collection,
  pageLabel,
  folder,
}: {
  page: "about" | "experience" | string;
  heading: ReactNode;
  intro?: ReactNode;
  previewBg?: string;
  /** scoped placement collection, e.g. `itinerary-intellects?page=itinerary:<id>` (defaults to `${page}-intellects`) */
  collection?: CollectionName;
  /** label used in badges/hints ("this itinerary") */
  pageLabel?: string;
  /** media-library folder the photo picker opens first */
  folder?: string;
}) {
  const pageName = pageLabel ?? (page === "about" ? "About page" : "Experience page");
  return (
    <CollectionSection
      name={collection ?? (`${page}-intellects` as CollectionName)}
      imageField="image"
      keys={[...PLACEMENT_KEYS]}
      designWidth={424}
      layout="grid3"
      addLabel="Add a scholar to this page"
      pageName={pageName}
      previewBg={previewBg}
      heading={heading}
      intro={intro}
      titleOf={(item, profiles) => item.values.name || str(profiles.find((p) => p.id === item.values.intellectId)?.name) || undefined}
      footerHint={
        <>
          Each card is a scholar <b>placed on this page</b>. Pick a profile from the <b>Intellects</b> library (sidebar → Intellects), then click any text or the
          photo to change it <b>for this page only</b> — the library profile and the other pages keep their own version. Fields you changed are outlined in red;{" "}
          <b>↺ use profile</b> goes back to the library text. <b>Save as draft</b> keeps incomplete cards; <b>Publish</b> needs a chosen profile (or a name).
        </>
      }
      render={(a) => {
        const profile = a.profiles.find((p) => p.id === a.v("intellectId"));
        const imageOverride = !!a.file || !!a.v("image");
        return (
          <div style={{ width: 424 }}>
            <label className="mg-link" style={{ marginBottom: 10, display: "flex" }}>
              <span>Profile</span>
              <select
                value={a.v("intellectId")}
                onChange={(e) => a.set("intellectId", e.target.value)}
                style={{ flex: 1, minWidth: 0, font: "inherit", fontSize: 13, padding: "4px 6px", border: "1px solid #ccc", borderRadius: 6, background: "#fff" }}
                aria-label="Profile from the Intellects library"
              >
                <option value="">— none (type everything below) —</option>
                {a.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {str(p.name) || "(unnamed)"}
                    {p.status !== "PUBLISHED" ? " · draft" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ position: "relative" }}>
              <ImageField
                src={a.v("image") || str(profile?.image) || null}
                file={a.file}
                onFile={a.setFile} onPick={a.pickImage}
                folder={folder}
                invalid={a.invalid("image")}
                label="Change photo for this page"
                style={{ width: 424, aspectRatio: "424 / 420", borderRadius: 4, background: "rgba(39,39,39,.05)", outline: imageOverride ? "2px solid #a62f20" : undefined }}
              />
              {imageOverride && profile && (
                <button type="button" className="mg-override-reset" style={{ top: 8, right: 8 }} onClick={() => { a.set("image", ""); a.setFile(null); }}>
                  ↺ use profile photo
                </button>
              )}
            </div>
            <div style={{ marginTop: 24 }}>
              <OverrideField a={a} k="name" profile={profile} className="t-h3 c-red" placeholder="Name" multiline={false} />
              <OverrideField a={a} k="designation" profile={profile} className="t-small c-ink" style={{ marginTop: 8 }} placeholder="Designation" multiline={false} />
              <OverrideField a={a} k="description" profile={profile} className="t-body-lg c-ink" style={{ marginTop: 8 }} placeholder="Short description" />
              <div style={{ marginTop: 16 }}>
                <ButtonField
                  variant="arrow"
                  optional
                  text={a.v("ctaText") || str(profile?.ctaText)}
                  url={a.v("ctaUrl") || str(profile?.ctaUrl)}
                  onText={(v) => a.set("ctaText", v === str(profile?.ctaText) ? "" : v)}
                  onUrl={(v) => a.set("ctaUrl", v === str(profile?.ctaUrl) ? "" : v)}
                  textPlaceholder="Link under the profile"
                  hint="Optional. Leave empty and no link is shown under this card."
                />
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

/* =====================================================================
   Copy settings — one heading/paragraph rendered in the design, saved on
   Publish. Empty → the Figma default text.
===================================================================== */
export function CopyField({ k, className, placeholder, style, multiline = true, light }: { k: SettingKey; className: string; placeholder: string; style?: React.CSSProperties; multiline?: boolean; light?: boolean }) {
  const s = useSetting(k);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? s.value;
  const dirty = draft !== null && draft !== s.value;
  return (
    <div style={{ position: "relative" }}>
      <Editable className={className} style={style} value={shown} onChange={setDraft} placeholder={placeholder} multiline={multiline} />
      {dirty && (
        <div className="mg-copy-actions">
          <button type="button" className="mg-btn primary" disabled={s.busy} onClick={() => s.saveText(draft).then(() => setDraft(null))}>
            {s.busy ? "Saving…" : "Publish"}
          </button>
          <button type="button" className="mg-btn" onClick={() => setDraft(null)}>
            Discard
          </button>
        </div>
      )}
      {s.error && <div className="mg-errors" style={{ marginTop: 6, color: light ? "#fff" : undefined }}>{s.error}</div>}
    </div>
  );
}

function Block({ title, hint, children, bg }: { title: string; hint?: string; children: ReactNode; bg?: string }) {
  return (
    <div className="mg-item">
      <div className="mg-item-bar">
        <strong style={{ color: "#222" }}>{title}</strong>
        {hint && <span className="mg-hint">{hint}</span>}
      </div>
      <div className="mg-preview mg" style={bg ? { background: bg } : undefined}>{children}</div>
    </div>
  );
}

/* Hero + tabs + place name + overview + "What you've been told" */
export function ExperienceHeroEditor() {
  const hero = useSetting("expHeroImage");
  const [file, setFile] = useState<File | null>(null);
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="mg-item">
        <div className="mg-item-bar">
          <strong style={{ color: "#222" }}>Hero</strong>
          <span className="mg-hint">Photo 1512 × 657 with the label and title on it. Click the photo to replace it, click the texts to edit.</span>
          <span className="grow" />
          {file && (
            <>
              <button type="button" className="mg-btn" onClick={() => setFile(null)}>Discard</button>
              <button type="button" className="mg-btn primary" disabled={hero.busy} onClick={() => hero.saveFile(file).then(() => setFile(null))}>
                {hero.busy ? "Uploading…" : "Publish photo"}
              </button>
            </>
          )}
        </div>
        {hero.error && <div className="mg-errors">{hero.error}</div>}
        <div className="mg-preview mg">
          <ScaledFrame designWidth={1512}>
            <div style={{ position: "relative", width: 1512, height: 657, background: "#272727" }}>
              <ImageField src={hero.value || null} file={file} onFile={setFile} onPick={(u) => hero.saveText(u)} label="Change hero photo" style={{ position: "absolute", inset: 0, width: 1512, height: 657 }} />
              <div style={{ position: "absolute", left: 339, bottom: 72, width: 835, textAlign: "center", zIndex: 2, pointerEvents: "none" }}>
                <div style={{ pointerEvents: "auto", background: "rgba(39,39,39,.35)", borderRadius: 8, padding: "8px 12px" }}>
                  <CopyField k="expHeroLabel" className="t-body c-cream" placeholder="HAMPI" style={{ textAlign: "center", textTransform: "uppercase" }} multiline={false} light />
                  <CopyField k="expHeroTitle" className="t-h1 c-cream" placeholder="Experience the India in a never before pathway" style={{ textAlign: "center", marginTop: 13 }} light />
                </div>
              </div>
            </div>
          </ScaledFrame>
        </div>
      </div>

      <Block title="Place" hint="The big “Hampi, Karnataka” heading over the map — first word red, second ink.">
        <ScaledFrame designWidth={1272}>
          <div style={{ width: 1272, display: "flex", justifyContent: "center", gap: 15 }}>
            <CopyField k="expPlaceName" className="place-title c-red" placeholder="Hampi," multiline={false} style={{ textAlign: "right" }} />
            <CopyField k="expPlaceRegion" className="place-title c-ink" placeholder="Karnataka" multiline={false} />
          </div>
        </ScaledFrame>
      </Block>

      <Block title="Overview" hint="Heading + paragraph beside the red Karnataka. Leave an empty line between paragraphs.">
        <ScaledFrame designWidth={626}>
          <div style={{ width: 626 }}>
            <CopyField k="expOverviewTitle" className="t-h2 c-ink" placeholder="Overview" multiline={false} />
            <CopyField k="expOverviewText" className="t-body c-ink" placeholder="Hampi sits on the southern bank…" style={{ marginTop: 16 }} />
          </div>
        </ScaledFrame>
      </Block>

      <Block title="What You've Been Told" hint="Red label + the Clash 22 line under it (725px, centred).">
        <ScaledFrame designWidth={725}>
          <div style={{ width: 725, textAlign: "center" }}>
            <CopyField k="expToldLabel" className="t-body c-red" placeholder="What You've Been Told" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="expToldText" className="t-h4 c-ink" placeholder="Vijayanagara Empire. 14th century…" style={{ textAlign: "center", marginTop: 8 }} />
          </div>
        </ScaledFrame>
      </Block>
    </section>
  );
}

/* =====================================================================
   Two Lenses — heading + the sites
===================================================================== */
const FIGURE_OPTIONS = [
  { key: "boulders", label: "Standing figure (boulders)", src: "/figma/exp-fig-boulders.svg", w: 24, h: 76 },
  { key: "pillars", label: "Standing figure (pillars)", src: "/figma/exp-fig-pillars.svg", w: 25, h: 78 },
  { key: "tank", label: "Standing figure (tank)", src: "/figma/exp-fig-tank.svg", w: 18, h: 80 },
  { key: "virupaksha", label: "Standing figure (temple)", src: "/figma/exp-fig-virupaksha.svg", w: 16, h: 53 },
];

export function SitesEditor() {
  return (
    <CollectionSection
      name="experience-sites"
      imageField="image"
      keys={["title", "lensALabel", "lensAText", "lensBLabel", "lensBText", "image", "figure", "figureLeft", "figureTop", "ctaText", "ctaUrl"]}
      designWidth={1273}
      addLabel="Add a site"
      titleKey="title"
      pageName="Experience page"
      newDefaults={{ lensALabel: "Engineering", lensBLabel: "Cosmology", figure: "boulders", figureLeft: "20", figureTop: "75" }}
      heading={
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 270 }}>
            <CopyField k="expLensesTitle" className="t-h2 c-ink" placeholder="Two Lenses, One Place" multiline={false} />
            <CopyField k="expLensesSub" className="t-body c-ink" placeholder="Read as Engineering / Read as Cosmology" style={{ marginTop: 6 }} multiline={false} />
          </div>
        </div>
      }
      footerHint={
        <>
          Each site is numbered automatically by its <b>Position</b>. Click the sketch to replace it; the red <b>figure</b> can be moved with the left/top
          percentages under it and opens the <b>Link</b> when a visitor clicks it. The hint under the sketch is shown only when filled.
        </>
      }
      render={(a, item) => <SiteCard a={a} item={item} />}
    />
  );
}

function SiteCard({ a, item }: { a: RenderApi; item: EditableItem }) {
  const fig = FIGURE_OPTIONS.find((f) => f.key === a.v("figure")) ?? FIGURE_OPTIONS[0];
  const left = Number(a.v("figureLeft") || 20);
  const top = Number(a.v("figureTop") || 75);
  void item;
  return (
    <div style={{ width: 1273, display: "grid", gridTemplateColumns: "411px 820px", justifyContent: "space-between", columnGap: 42 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 126, padding: "24px 0" }}>
        <div>
          <Editable className="t-body c-red" value={a.v("lensALabel")} onChange={(v) => a.set("lensALabel", v)} placeholder="Engineering" invalid={a.invalid("lensALabel")} multiline={false} />
          <Editable className="t-body c-ink" style={{ marginTop: 7 }} value={a.v("lensAText")} onChange={(v) => a.set("lensAText", v)} placeholder="What an engineer sees here…" invalid={a.invalid("lensAText")} />
        </div>
        <div>
          <Editable className="t-body c-red" value={a.v("lensBLabel")} onChange={(v) => a.set("lensBLabel", v)} placeholder="Cosmology" invalid={a.invalid("lensBLabel")} multiline={false} />
          <Editable className="t-body c-ink" style={{ marginTop: 7 }} value={a.v("lensBText")} onChange={(v) => a.set("lensBText", v)} placeholder="What the tradition says…" invalid={a.invalid("lensBText")} />
        </div>
      </div>
      <div>
        <div style={{ textAlign: "right" }}>
          <p className="t-body c-red">{String((item.record?.order ?? 0) + 1).padStart(2, "0")}</p>
          <Editable className="t-site c-red" style={{ marginTop: 16, textAlign: "right" }} value={a.v("title")} onChange={(v) => a.set("title", v)} placeholder="Site title" invalid={a.invalid("title")} multiline={false} />
        </div>
        <div style={{ position: "relative", width: 820 }}>
          <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} invalid={a.invalid("image")} label="Change sketch" style={{ width: 820, aspectRatio: "820 / 363", background: "rgba(39,39,39,.03)" }} render={(url) => <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top" }} />} />
          <img src={fig.src} alt="" style={{ position: "absolute", left: `${left}%`, top: `${top}%`, width: fig.w, transform: "translate(-50%,-100%)", pointerEvents: "none", zIndex: 3 }} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <label className="mg-link" style={{ flex: "0 0 auto" }}>
            <span>Figure</span>
            <select value={fig.key} onChange={(e) => a.set("figure", e.target.value)} style={{ font: "inherit", fontSize: 12, padding: "3px 6px", border: "1px solid #ccc", borderRadius: 6, background: "#fff" }}>
              {FIGURE_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </label>
          <label className="mg-link" style={{ flex: "0 0 auto" }}>
            <span>left %</span>
            <input type="number" min={0} max={100} step={0.5} value={a.v("figureLeft")} onChange={(e) => a.set("figureLeft", e.target.value)} style={{ width: 70 }} />
          </label>
          <label className="mg-link" style={{ flex: "0 0 auto" }}>
            <span>top %</span>
            <input type="number" min={0} max={100} step={0.5} value={a.v("figureTop")} onChange={(e) => a.set("figureTop", e.target.value)} style={{ width: 70 }} />
          </label>
        </div>
        <div style={{ marginTop: 10 }}>
          <ButtonField
            variant="arrow"
            optional
            text={a.v("ctaText")}
            url={a.v("ctaUrl")}
            onText={(v) => a.set("ctaText", v)}
            onUrl={(v) => a.set("ctaUrl", v)}
            textPlaceholder="*Click here on the person to experience the sight digitally"
            urlPlaceholder="Page the figure opens (e.g. a 3D tour)"
            hint="The hint sits right-aligned under the sketch; the figure itself is the clickable thing."
          />
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   Fragments (red band) + Questions — text-only collections
===================================================================== */
export function FragmentsEditor() {
  return (
    <CollectionSection
      name="experience-fragments"
      keys={["text"]}
      designWidth={936}
      addLabel="Add a fragment"
      pageName="Experience page"
      previewBg="var(--mg-red)"
      heading={
        <div className="bg-red" style={{ margin: "-28px -18px", padding: "28px 18px", textAlign: "center" }}>
          <CopyField k="expFragmentsLabel" className="t-body c-cream" placeholder="Fragments" multiline={false} style={{ textAlign: "center" }} light />
          <p className="t-body c-cream" style={{ marginTop: 10, opacity: 0.7 }}>Visitors scroll through the fragments one by one inside the red band; the counter (1/3…) and the hint are automatic.</p>
          <CopyField k="expFragmentsHint" className="t-body c-cream" placeholder="Scroll down for next" multiline={false} style={{ textAlign: "center", marginTop: 8 }} light />
        </div>
      }
      footerHint={<>Each card is one fragment (one “page” of the red band). Use <b>Position</b> to order them.</>}
      render={(a) => (
        <div className="bg-red" style={{ width: 936, padding: "40px 0", textAlign: "center" }}>
          <Editable className="t-h2 c-cream" style={{ textAlign: "center" }} value={a.v("text")} onChange={(v) => a.set("text", v)} placeholder="A fragment of the place's story…" invalid={a.invalid("text")} />
        </div>
      )}
    />
  );
}

export function QuestionsEditor() {
  return (
    <CollectionSection
      name="experience-questions"
      keys={["text"]}
      designWidth={466}
      addLabel="Add a question"
      pageName="Experience page"
      heading={
        <div style={{ textAlign: "center" }}>
          <CopyField k="expQuestionsTitle" className="t-h2 c-ink" placeholder="Questions Hampi Still Asks" multiline={false} style={{ textAlign: "center" }} />
        </div>
      }
      footerHint={<>One card per question, shown centred under the title; the two sketched figures follow automatically.</>}
      render={(a) => (
        <div style={{ width: 466, textAlign: "center" }}>
          <Editable className="t-body c-ink" style={{ textAlign: "center" }} value={a.v("text")} onChange={(v) => a.set("text", v)} placeholder="A question this place still asks…" invalid={a.invalid("text")} />
        </div>
      )}
    />
  );
}

/* =====================================================================
   Intellects section copy + placements (Experience page)
===================================================================== */
export function ExperienceIntellectsEditor() {
  return (
    <PlacementEditor
      page="experience"
      heading={
        <div style={{ textAlign: "center" }}>
          <CopyField k="expIntellectsLabel" className="t-body c-red" placeholder="Intellects" multiline={false} style={{ textAlign: "center" }} />
          <CopyField k="expIntellectsTitle" className="t-h1 c-ink" placeholder="The Scholar Who Reads This Place" style={{ textAlign: "center", marginTop: 4 }} />
        </div>
      }
      intro={
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <div style={{ width: 609 }}>
            <CopyField k="expIntellectsIntro" className="t-body c-red" placeholder="Maarga's scholar network is not built on superficial accolades…" style={{ textAlign: "center" }} />
          </div>
        </div>
      }
    />
  );
}

export function AboutIntellectsEditor() {
  return (
    <PlacementEditor
      page="about"
      heading={
        <div style={{ textAlign: "center" }}>
          <CopyField k="aboutIntellectsLabel" className="t-body c-red" placeholder="Intellects" multiline={false} style={{ textAlign: "center" }} />
          <CopyField k="aboutIntellectsTitle" className="t-h1 c-ink" placeholder="The Reason the Journey Becomes an Education" style={{ textAlign: "center", marginTop: 4 }} />
        </div>
      }
      intro={
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <div style={{ width: 826 }}>
            <CopyField k="aboutIntellectsIntro" className="t-body c-ink" placeholder="Maarga's scholar network is not built on superficial accolades…" style={{ textAlign: "center" }} />
          </div>
        </div>
      }
    />
  );
}

/* =====================================================================
   Enquire block + buttons/links of the Experience page
===================================================================== */
const EXP_LINK_ITEMS: typeof LINK_ITEMS = [
  { key: "expEnquireCta", section: "Begin Your Maarga", where: "Red button above the footer of the Experience page", variant: "red", defaults: { text: "Book The Architecture of an Empire", url: "/contact" } },
  { key: "expTabExperience", section: "Tab 1 (active)", where: "First pill under the hero", variant: "cream", defaults: { text: "Experience", url: "/experience" } },
  { key: "expTabItinerary", section: "Tab 2", where: "Second pill under the hero", variant: "cream", defaults: { text: "Itinerary", url: "/experience#itinerary" } },
  { key: "expTabGallery", section: "Tab 3", where: "Third pill under the hero", variant: "cream", defaults: { text: "Gallery", url: "/gallery" } },
];

export function ExperienceLinksEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Block title="Begin Your Maarga" hint="Label, heading and paragraph of the enquire block (the button is below).">
        <ScaledFrame designWidth={380}>
          <div style={{ width: 380, textAlign: "center" }}>
            <CopyField k="expEnquireLabel" className="t-body c-red" placeholder="Enquire" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="expEnquireTitle" className="t-h2 c-ink" placeholder="Begin Your Maarga" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="expEnquireText" className="t-body c-ink" placeholder="You've read the fragments. The rest of the story is told standing inside it." style={{ textAlign: "center", marginTop: 24 }} />
          </div>
        </ScaledFrame>
      </Block>
      <p className="mg-hint" style={{ margin: 0 }}>
        The header <b>Contact Us</b> is shared with every page — edit it under Homepage → Buttons &amp; links.
      </p>
      {EXP_LINK_ITEMS.map((it) => (
        <LinkSettingEditor key={it.key} item={it} />
      ))}
      <SettingImage k="ctaImage" title="Footer photo" hint="Shared with the homepage and the About page." width={1512} aspect="1512 / 607" />
    </section>
  );
}
