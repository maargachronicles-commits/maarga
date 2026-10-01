"use client";

import "../../../../homepage/homepage-editor.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButtonField, Editable, ImageField, ScaledFrame, Toggle } from "@/components/homepage/editorKit";
import { ConnectionHelp } from "@/components/homepage/sections";
import { PlacementEditor } from "@/components/homepage/experienceSections";
import MediaLibraryPicker from "@/components/homepage/MediaLibraryPicker";
import { API_URL, describeError, duplicateItinerary, folderKey, listCollection, setVisibility, updateItem, uploadToLibrary, type ApiError, type CmsRecord, type CollectionName } from "@/lib/homepageApi";

/* ---------------- types of the JSON fields ---------------- */
interface Activity {
  title: string;
  description: string;
  icons: string[];
}
interface Day {
  title: string;
  image: string;
  activities: Activity[];
}
interface Stay {
  name: string;
  description: string;
  image: string;
}
interface IconRow {
  id: string;
  name: string;
  url: string;
  published?: boolean;
}
type Overrides = Record<string, { name?: string; url?: string }>;

const TEXT_KEYS = ["label", "title", "durationLabel", "heroImage", "heroLabel", "heroTitle", "heroCtaText", "heroCtaUrl", "staysTitle", "intellectsLabel", "intellectsTitle", "intellectsIntro", "enquireLabel", "enquireTitle", "enquireText", "enquireCtaText", "enquireCtaUrl", "pdfUrl"] as const;
type TextKey = (typeof TEXT_KEYS)[number];
type Texts = Record<TextKey, string>;

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const newActivity = (): Activity => ({ title: "", description: "", icons: [] });
const newDay = (): Day => ({ title: "", image: "", activities: [newActivity()] });

/**
 * Itinerary builder — the whole itinerary page (Figma "Itinerary") shown in its real
 * design and editable in place: hero, Journey Path heading, days (add / reorder / delete,
 * photo per day, activities with icons), icon edits for this itinerary only, stays, the
 * itinerary's own scholars, Begin Your Maarga, optional PDF. One record → Save as draft /
 * Publish at the top; Publish needs a title, duration and at least one day.
 */
export default function ItineraryBuilderPage() {
  const params = useParams<{ id: string; itin: string }>();
  const { id: destinationId, itin } = params;

  const [record, setRecord] = useState<CmsRecord | null>(null);
  const [destination, setDestination] = useState<CmsRecord | null>(null);
  const [icons, setIcons] = useState<IconRow[]>([]);
  const [texts, setTexts] = useState<Texts | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [published, setPublished] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const folder = folderKey.destination(destinationId);

  const hydrate = useCallback((r: CmsRecord) => {
    setRecord(r);
    setTexts(Object.fromEntries(TEXT_KEYS.map((k) => [k, str(r[k])])) as Texts);
    setDays(Array.isArray(r.days) ? (r.days as Day[]).map((d) => ({ title: str(d.title), image: str(d.image), activities: (d.activities ?? []).map((a) => ({ title: str(a.title), description: str(a.description), icons: Array.isArray(a.icons) ? a.icons.map(String) : [] })) })) : []);
    setStays(Array.isArray(r.stays) ? (r.stays as Stay[]).map((s) => ({ name: str(s.name), description: str(s.description), image: str(s.image) })) : []);
    setOverrides((r.iconOverrides as Overrides) ?? {});
    setPublished(!!r.published);
    setHeroFile(null);
    setDirty(false);
    setMissing([]);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [its, dests, ics] = await Promise.all([
        listCollection(`itineraries?destinationId=${destinationId}` as CollectionName),
        listCollection("destinations"),
        listCollection("icons"),
      ]);
      const r = its.data.find((x) => x.id === itin);
      if (!r) throw new Error("This itinerary does not exist (it may have been deleted).");
      hydrate(r);
      setDestination(dests.data.find((d) => d.id === destinationId) ?? null);
      setIcons(ics.data.map((x) => ({ id: x.id, name: str(x.name), url: str(x.url), published: !!x.published && x.status === "PUBLISHED" })));
    } catch (e) {
      setError(describeError(e));
    }
  }, [destinationId, itin, hydrate]);
  useEffect(() => {
    load();
  }, [load]);

  /* warn before leaving with unsaved edits */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setNotice(null);
  };
  const setText = (k: TextKey, v: string) => {
    setTexts((t) => (t ? { ...t, [k]: v } : t));
    setMissing((m) => m.filter((x) => x !== k));
    touch();
  };
  const patchDay = (i: number, fn: (d: Day) => Day) => {
    setDays((l) => l.map((d, j) => (j === i ? fn(d) : d)));
    touch();
  };
  const moveDay = (i: number, dir: -1 | 1) => {
    setDays((l) => {
      const n = [...l];
      const t = i + dir;
      if (t < 0 || t >= n.length) return l;
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });
    touch();
  };
  const patchStay = (i: number, fn: (s: Stay) => Stay) => {
    setStays((l) => l.map((s, j) => (j === i ? fn(s) : s)));
    touch();
  };

  const say = (t: string) => {
    setNotice(t);
    setTimeout(() => setNotice(null), 3000);
  };

  const save = async (mode: "draft" | "publish") => {
    if (!texts) return;
    if (mode === "publish") {
      const miss: string[] = [];
      if (!texts.title.trim()) miss.push("title");
      if (!texts.durationLabel.trim()) miss.push("durationLabel");
      if (days.length === 0) miss.push("days");
      if (days.some((d) => !d.title.trim())) miss.push("dayTitle");
      if (miss.length) {
        setMissing(miss);
        setError("To publish, fill in: " + miss.map((m) => ({ title: "the itinerary title", durationLabel: "the duration label", days: "at least one day", dayTitle: "a title for every day" })[m]).join(", ") + ".");
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        ...texts,
        days: JSON.stringify(days),
        stays: JSON.stringify(stays),
        iconOverrides: JSON.stringify(overrides),
        published,
      };
      if (heroFile) delete payload.heroImage;
      const r = await updateItem("itineraries", itin, payload, heroFile, "heroImage", mode);
      hydrate(r.data);
      say(mode === "publish" ? "Published — the live page shows this version." : "Saved as draft.");
    } catch (e) {
      const err = e as ApiError;
      setError(err.message + (err.missing?.length ? ` (${err.missing.join(", ")})` : ""));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (v: boolean) => {
    setPublished(v);
    try {
      await setVisibility("itineraries", itin, v);
      say(v ? "Shown on the site." : "Hidden from the site (still saved).");
    } catch (e) {
      setPublished(!v);
      setError(describeError(e));
    }
  };

  const dup = async () => {
    try {
      const r = await duplicateItinerary(itin);
      window.location.href = `/destinations/${destinationId}/itinerary/${r.data.id}`;
    } catch (e) {
      setError(describeError(e));
    }
  };

  /* icon helpers */
  const iconById = useMemo(() => {
    const m = new Map<string, IconRow>();
    for (const ic of icons) m.set(ic.id, { ...ic, name: overrides[ic.id]?.name || ic.name, url: overrides[ic.id]?.url || ic.url });
    for (const [id, o] of Object.entries(overrides)) if (!m.has(id) && o.url) m.set(id, { id, name: o.name || "", url: o.url });
    return m;
  }, [icons, overrides]);
  const usedIconIds = useMemo(() => Array.from(new Set(days.flatMap((d) => d.activities.flatMap((a) => a.icons)))), [days]);

  const pdfInput = useRef<HTMLInputElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const uploadPdf = async (f: File) => {
    setPdfBusy(true);
    try {
      const asset = await uploadToLibrary(f, folder, `${texts?.title || "Itinerary"} PDF`);
      setText("pdfUrl", asset.url);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setPdfBusy(false);
    }
  };

  if (error && !record) return <div className="mg-page"><ConnectionHelp message={error} onRetry={load} /></div>;
  if (!record || !texts) return <div className="mg-page"><p className="mg-hint">Loading itinerary…</p></div>;

  const code = str(record.code);
  const liveUrl = destination?.code ? `${site}/destinations/${destination.code}/itinerary/${code}` : null;
  const heroSrc = texts.heroImage || str(destination?.heroImage) || null;
  const placementCollection = `itinerary-intellects?page=itinerary:${itin}` as CollectionName;

  return (
    <div className="mg-page">
      {/* ---------- sticky action bar ---------- */}
      <div className="mg-sticky-bar">
        <div className="mg-item-bar" style={{ border: 0, background: "transparent", flexWrap: "wrap" }}>
          <Link href={`/destinations/${destinationId}`} style={{ color: "#a62f20", fontSize: 13 }}>
            ← {str(destination?.name) || "Destination"}
          </Link>
          <strong style={{ color: "#222" }}>{texts.title || "Untitled itinerary"}</strong>
          <span className="mg-code">{code}</span>
          <span className={`mg-badge ${record.status === "PUBLISHED" ? "published" : "draft"}`}>{record.status === "PUBLISHED" ? "Published" : "Draft"}</span>
          {!published && <span className="mg-badge hidden">Hidden from the site</span>}
          {dirty && <span className="mg-badge dirty">Unsaved changes</span>}
          <span className="grow" />
          <Toggle on={published} onChange={toggle} label="Show on the site" />
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Live ↗
            </a>
          )}
          <button type="button" className="mg-btn" onClick={dup} title="Copy this itinerary into a new draft">
            Duplicate
          </button>
          {dirty && (
            <button type="button" className="mg-btn" onClick={() => hydrate(record)}>
              Discard
            </button>
          )}
          <button type="button" className="mg-btn" disabled={saving || !dirty} onClick={() => save("draft")} title="Saves even if parts are empty">
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button type="button" className="mg-btn primary" disabled={saving} onClick={() => save("publish")}>
            {saving ? "Saving…" : "Publish"}
          </button>
        </div>
        {error && <div className="mg-errors" style={{ borderRadius: 8, marginTop: 6 }}>{error}</div>}
        {notice && <p className="mg-hint" style={{ color: "#1d6b32", margin: "6px 0 0" }}>{notice}</p>}
      </div>

      <div className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* ---------- hero ---------- */}
        <Block title="Hero" hint="Photo 1512×657 with the destination label, title and the red button. Empty photo = the destination's photo.">
          <ScaledFrame designWidth={1512}>
            <div style={{ position: "relative", width: 1512, height: 657, background: "#272727" }}>
              <ImageField
                src={heroSrc}
                file={heroFile}
                onFile={(f) => {
                  setHeroFile(f);
                  touch();
                }}
                onPick={(u) => {
                  setHeroFile(null);
                  setText("heroImage", u);
                }}
                folder={folder}
                label="Change hero photo"
                style={{ position: "absolute", inset: 0, width: 1512, height: 657 }}
              />
              <div style={{ position: "absolute", left: 339, bottom: 50, width: 835, textAlign: "center", zIndex: 2, pointerEvents: "none" }}>
                <div style={{ pointerEvents: "auto", background: "rgba(39,39,39,.35)", borderRadius: 8, padding: "8px 12px" }}>
                  <Editable className="t-body c-cream" value={texts.heroLabel} onChange={(v) => setText("heroLabel", v)} placeholder={str(destination?.heroLabel) || str(destination?.name).toUpperCase() || "HAMPI"} multiline={false} style={{ textAlign: "center", textTransform: "uppercase" }} />
                  <Editable className="t-h1 c-cream" value={texts.heroTitle} onChange={(v) => setText("heroTitle", v)} placeholder={str(destination?.heroTitle) || "Experience the India in a never before pathway"} style={{ textAlign: "center", marginTop: 13 }} />
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 13 }}>
                    <ButtonField variant="red" optional text={texts.heroCtaText} url={texts.heroCtaUrl} onText={(v) => setText("heroCtaText", v)} onUrl={(v) => setText("heroCtaUrl", v)} textPlaceholder="Enquire about this journey" hint="Leave the label empty to hide the button." />
                  </div>
                </div>
              </div>
            </div>
          </ScaledFrame>
        </Block>

        {/* ---------- heading row ---------- */}
        <Block title="Journey Path heading" hint="Small red label, Clash 40 title, and the duration shown in the dropdown (also how visitors tell itineraries apart).">
          <ScaledFrame designWidth={1272}>
            <div style={{ width: 1272, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
              <div style={{ width: 628 }}>
                <Editable className="t-body c-red" value={texts.label} onChange={(v) => setText("label", v)} placeholder="Journey Path" multiline={false} />
                <Editable className="t-h1 c-ink" style={{ marginTop: 4 }} value={texts.title} onChange={(v) => setText("title", v)} placeholder="The Temple Architects of the Deccan" invalid={missing.includes("title")} />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 267, height: 50, border: "1px solid var(--mg-red)", display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
                  <Editable className="t-body c-red" value={texts.durationLabel} onChange={(v) => setText("durationLabel", v)} placeholder="6 Days / 7 Nights" multiline={false} invalid={missing.includes("durationLabel")} />
                  <span style={{ color: "var(--mg-red)" }}>⌄</span>
                </div>
                <div style={{ width: 50, height: 50, background: "var(--mg-red)", display: "grid", placeItems: "center", color: "#fff" }} title="Download button (PDF below)">
                  ↓
                </div>
              </div>
            </div>
          </ScaledFrame>
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mg-hint">Download button:</span>
            {texts.pdfUrl ? (
              <>
                <a href={texts.pdfUrl} target="_blank" rel="noreferrer" className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  Open PDF ↗
                </a>
                <button type="button" className="mg-btn" onClick={() => setText("pdfUrl", "")}>
                  Remove PDF
                </button>
              </>
            ) : (
              <span className="mg-hint">no PDF uploaded — the button prints the page instead.</span>
            )}
            <button type="button" className="mg-btn" disabled={pdfBusy} onClick={() => pdfInput.current?.click()}>
              {pdfBusy ? "Uploading…" : texts.pdfUrl ? "Replace PDF" : "Upload PDF"}
            </button>
            <input ref={pdfInput} type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
          </div>
        </Block>

        {/* ---------- days ---------- */}
        <Block title={`Days (${days.length})`} hint="Each day: a 535×420 photo, a title and its activities. Every activity can have icons (from the Icons library) and a short text.">
          {days.length === 0 && <p className="mg-hint" style={{ margin: "0 0 12px" }}>No days yet — add the first one.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {days.map((d, i) => (
              <div key={i} className="mg-item">
                <div className="mg-item-bar">
                  <strong style={{ color: "#222" }}>Day-{i + 1}</strong>
                  <span className="mg-move">
                    <button type="button" className="mg-btn icon" disabled={i === 0} onClick={() => moveDay(i, -1)} title="Move earlier">↑</button>
                    <button type="button" className="mg-btn icon" disabled={i === days.length - 1} onClick={() => moveDay(i, 1)} title="Move later">↓</button>
                  </span>
                  <span className="grow" />
                  <button type="button" className="mg-btn" onClick={() => patchDay(i, (x) => ({ ...x, activities: [...x.activities, newActivity()] }))}>
                    + Add activity
                  </button>
                  <button type="button" className="mg-btn danger" onClick={() => confirm(`Remove Day-${i + 1}?`) && (setDays((l) => l.filter((_, j) => j !== i)), touch())}>
                    Remove day
                  </button>
                </div>
                <div className="mg-preview mg">
                  <ScaledFrame designWidth={1107}>
                    <div style={{ width: 1107, display: "flex", gap: 28, alignItems: "flex-start" }}>
                      <DayImage value={d.image} folder={folder} onChange={(u) => patchDay(i, (x) => ({ ...x, image: u }))} />
                      <div style={{ width: 544, padding: "12px 0" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span className="t-h4" style={{ color: "rgba(39,39,39,.3)", flex: "none" }}>Day-{i + 1}</span>
                          <Editable className="t-h4 c-ink" value={d.title} onChange={(v) => patchDay(i, (x) => ({ ...x, title: v }))} placeholder="Day title, e.g. Arrival" multiline={false} invalid={missing.includes("dayTitle") && !d.title.trim()} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>
                          {d.activities.map((a, j) => (
                            <div key={j} style={{ position: "relative", paddingRight: 30 }}>
                              <Editable className="t-h4 c-red" value={a.title} onChange={(v) => patchDay(i, (x) => ({ ...x, activities: x.activities.map((y, k) => (k === j ? { ...y, title: v } : y)) }))} placeholder="Activity, e.g. Sunset at Hemakuta hill" multiline={false} />
                              <p style={{ fontFamily: "var(--mg-erode)", fontSize: 12, lineHeight: "15px", color: "#BEBDBB", marginTop: 4 }}>activities</p>
                              <IconRowEditor
                                chosen={a.icons}
                                icons={icons.filter((ic) => ic.published || a.icons.includes(ic.id))}
                                resolve={(id) => iconById.get(id)}
                                onChange={(ids) => patchDay(i, (x) => ({ ...x, activities: x.activities.map((y, k) => (k === j ? { ...y, icons: ids } : y)) }))}
                              />
                              <Editable className="t-body" style={{ color: "#000", marginTop: 12 }} value={a.description} onChange={(v) => patchDay(i, (x) => ({ ...x, activities: x.activities.map((y, k) => (k === j ? { ...y, description: v } : y)) }))} placeholder="One or two sentences about this activity…" />
                              <button
                                type="button"
                                className="mg-btn icon danger"
                                style={{ position: "absolute", right: -6, top: 0 }}
                                title="Remove this activity"
                                onClick={() => patchDay(i, (x) => ({ ...x, activities: x.activities.filter((_, k) => k !== j) }))}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {d.activities.length === 0 && <p className="mg-hint">No activities — use “+ Add activity”.</p>}
                        </div>
                      </div>
                    </div>
                  </ScaledFrame>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mg-btn primary" style={{ marginTop: 14, height: 38, padding: "0 18px" }} onClick={() => (setDays((l) => [...l, newDay()]), touch())}>
            + Add day
          </button>
        </Block>

        {/* ---------- icon edits for this itinerary ---------- */}
        <Block title="Icons used in this itinerary" hint="Rename or replace an icon here and it changes ONLY in this itinerary. The Icons library and other itineraries keep the original.">
          {usedIconIds.length === 0 ? (
            <p className="mg-hint" style={{ margin: 0 }}>No icons chosen yet. Add icons to an activity above; they appear here.</p>
          ) : (
            <div className="mg-card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {usedIconIds.map((id) => {
                const base = icons.find((ic) => ic.id === id);
                const o = overrides[id] ?? {};
                const shown = iconById.get(id);
                return (
                  <IconOverrideCard
                    key={id}
                    id={id}
                    base={base}
                    override={o}
                    shown={shown}
                    folder="icons"
                    onChange={(next) => {
                      setOverrides((all) => {
                        const copy = { ...all };
                        if (!next.name && !next.url) delete copy[id];
                        else copy[id] = next;
                        return copy;
                      });
                      touch();
                    }}
                  />
                );
              })}
            </div>
          )}
        </Block>

        {/* ---------- stays ---------- */}
        <Block title="Where you'll stay" hint="Heading + one row per stay: 693×420 photo, name (red), text.">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Editable className="t-h1 c-ink" value={texts.staysTitle} onChange={(v) => setText("staysTitle", v)} placeholder="Where you'll stay" multiline={false} style={{ textAlign: "center" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stays.map((s, i) => (
              <div key={i} className="mg-item">
                <div className="mg-item-bar">
                  <strong style={{ color: "#222" }}>{s.name || `Stay ${i + 1}`}</strong>
                  <span className="grow" />
                  <button type="button" className="mg-btn danger" onClick={() => (setStays((l) => l.filter((_, j) => j !== i)), touch())}>
                    Remove
                  </button>
                </div>
                <div className="mg-preview mg">
                  <ScaledFrame designWidth={1271}>
                    <div style={{ width: 1271, display: "flex", gap: 28 }}>
                      <DayImage value={s.image} folder={folder} width={693} onChange={(u) => patchStay(i, (x) => ({ ...x, image: u }))} />
                      <div style={{ width: 550, padding: "24px 0" }}>
                        <Editable className="t-h4 c-red" value={s.name} onChange={(v) => patchStay(i, (x) => ({ ...x, name: v }))} placeholder="Hotel name" multiline={false} />
                        <Editable className="t-body" style={{ color: "#000", marginTop: 28 }} value={s.description} onChange={(v) => patchStay(i, (x) => ({ ...x, description: v }))} placeholder="A few lines about the stay…" />
                      </div>
                    </div>
                  </ScaledFrame>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mg-btn primary" style={{ marginTop: 14, height: 38, padding: "0 18px" }} onClick={() => (setStays((l) => [...l, { name: "", description: "", image: "" }]), touch())}>
            + Add stay
          </button>
        </Block>

        {/* ---------- scholars (this itinerary only) ---------- */}
        <Block title="Intellects on this itinerary" hint="Pick profiles from the Intellects library; edits here apply to this itinerary only. Cards save on their own (Save as draft / Publish per card).">
          <PlacementEditor
            page={`itinerary:${itin}`}
            collection={placementCollection}
            pageLabel="this itinerary"
            folder="intellects"
            heading={
              <div style={{ textAlign: "center" }}>
                <Editable className="t-body c-red" value={texts.intellectsLabel} onChange={(v) => setText("intellectsLabel", v)} placeholder="Intellects" multiline={false} style={{ textAlign: "center" }} />
                <Editable className="t-h1 c-ink" value={texts.intellectsTitle} onChange={(v) => setText("intellectsTitle", v)} placeholder="The Scholar Who Reads This Place" style={{ textAlign: "center", marginTop: 4 }} />
              </div>
            }
            intro={
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <div style={{ width: 609 }}>
                  <Editable className="t-body c-red" value={texts.intellectsIntro} onChange={(v) => setText("intellectsIntro", v)} placeholder="Maarga's scholar network is not built on superficial accolades…" style={{ textAlign: "center" }} />
                </div>
              </div>
            }
          />
          <p className="mg-hint" style={{ marginTop: 8 }}>The label, heading and intro above belong to the itinerary — they save with the Publish button at the top.</p>
        </Block>

        {/* ---------- enquire ---------- */}
        <Block title="Begin Your Maarga" hint="Enquire block above the footer of this itinerary page.">
          <div style={{ textAlign: "center" }}>
            <div style={{ maxWidth: 380, margin: "0 auto" }}>
              <Editable className="t-body c-red" value={texts.enquireLabel} onChange={(v) => setText("enquireLabel", v)} placeholder="Enquire" multiline={false} style={{ textAlign: "center" }} />
              <Editable className="t-h2 c-ink" value={texts.enquireTitle} onChange={(v) => setText("enquireTitle", v)} placeholder="Begin Your Maarga" multiline={false} style={{ textAlign: "center" }} />
              <Editable className="t-body c-ink" value={texts.enquireText} onChange={(v) => setText("enquireText", v)} placeholder="Seven days. One empire, read the way it was built to be read." style={{ textAlign: "center", marginTop: 24 }} />
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <ButtonField variant="red" text={texts.enquireCtaText} url={texts.enquireCtaUrl} onText={(v) => setText("enquireCtaText", v)} onUrl={(v) => setText("enquireCtaUrl", v)} textPlaceholder="Enquire about this journey" />
              </div>
            </div>
          </div>
        </Block>
        <p className="mg-hint">
          API: <span className="mg-code">{API_URL}/api/site/destinations/{str(destination?.code)}/itinerary/{code}</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------- small building blocks ---------------- */

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mg-item">
      <div className="mg-item-bar">
        <strong style={{ color: "#222" }}>{title}</strong>
        {hint && <span className="mg-hint">{hint}</span>}
      </div>
      <div className="mg-preview mg">{children}</div>
    </div>
  );
}

/** A photo slot stored as URL in the JSON (upload goes to the media library first, then the URL is kept). */
function DayImage({ value, onChange, folder, width = 535 }: { value: string; onChange: (url: string) => void; folder: string; width?: number }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const height = Math.round((width * 420) / (width === 693 ? 693 : 535));
  return (
    <div style={{ width, flex: "none" }}>
      <ImageField
        src={value || null}
        file={null}
        onFile={async (f) => {
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            const asset = await uploadToLibrary(f, folder, f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
            onChange(asset.url);
          } catch (e) {
            setErr(describeError(e));
          } finally {
            setBusy(false);
          }
        }}
        onPick={onChange}
        folder={folder}
        label={busy ? "Uploading…" : "Change photo"}
        style={{ width, height, background: "rgba(39,39,39,.05)" }}
      />
      {err && <p className="mg-errors" style={{ marginTop: 4 }}>{err}</p>}
    </div>
  );
}

/** Icon chips + an "add icon" select for one activity. */
function IconRowEditor({ chosen, icons, resolve, onChange }: { chosen: string[]; icons: IconRow[]; resolve: (id: string) => IconRow | undefined; onChange: (ids: string[]) => void }) {
  const available = icons.filter((ic) => !chosen.includes(ic.id));
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
      {chosen.map((id) => {
        const ic = resolve(id);
        return (
          <span key={id} className="mg-icon-chip" title={ic?.name}>
            <span className="sq">{ic?.url && <img src={ic.url} alt="" />}</span>
            {ic?.name || "missing icon"}
            <button type="button" aria-label={`Remove ${ic?.name || "icon"}`} onClick={() => onChange(chosen.filter((x) => x !== id))}>
              ✕
            </button>
          </span>
        );
      })}
      <select
        value=""
        onChange={(e) => e.target.value && onChange([...chosen, e.target.value])}
        style={{ font: "12px var(--font-inter), system-ui", padding: "4px 8px", border: "1px dashed #a62f20", borderRadius: 999, color: "#a62f20", background: "#fff" }}
        aria-label="Add an icon to this activity"
      >
        <option value="">+ icon</option>
        {available.map((ic) => (
          <option key={ic.id} value={ic.id}>
            {resolve(ic.id)?.name || ic.name}
          </option>
        ))}
      </select>
      {icons.length === 0 && (
        <Link href="/icons" className="mg-hint" style={{ color: "#a62f20" }}>
          Add icons to the library →
        </Link>
      )}
    </div>
  );
}

/** One icon's per-itinerary edit: name + image, with "↺ use library" reset. */
function IconOverrideCard({ id, base, override, shown, folder, onChange }: { id: string; base?: IconRow; override: { name?: string; url?: string }; shown?: IconRow; folder: string; onChange: (o: { name?: string; url?: string }) => void }) {
  const [picking, setPicking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const edited = !!(override.name || override.url);
  return (
    <div className="mg-card" style={{ outline: edited ? "2px solid #a62f20" : undefined }}>
      <div className="body" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, background: "#a62f20", borderRadius: 6, display: "grid", placeItems: "center", flex: "none" }}>
          {shown?.url && <img src={shown.url} alt="" style={{ width: 36, height: 36, objectFit: "contain", filter: "brightness(0) invert(1)" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={override.name ?? ""}
            placeholder={base?.name || "Name for this itinerary"}
            onChange={(e) => onChange({ ...override, name: e.target.value || undefined })}
            style={{ width: "100%", font: "13px var(--font-inter), system-ui", padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6 }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <button type="button" className="mg-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? "Uploading…" : "Replace · PC"}
            </button>
            <button type="button" className="mg-btn" onClick={() => setPicking(true)}>
              Replace · Gallery
            </button>
            {edited && (
              <button type="button" className="mg-btn danger" onClick={() => onChange({})} title="Back to the library icon">
                ↺ use library
              </button>
            )}
          </div>
          {!base && <p className="mg-hint" style={{ marginTop: 4 }}>This icon was removed from the library; this itinerary keeps its own copy.</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/webp"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            const asset = await uploadToLibrary(f, folder, f.name);
            onChange({ ...override, url: asset.url });
          } finally {
            setBusy(false);
          }
        }}
      />
      {picking && (
        <MediaLibraryPicker
          folder={folder}
          accept="image/*"
          onClose={() => setPicking(false)}
          onPick={(u) => {
            onChange({ ...override, url: u });
            setPicking(false);
          }}
        />
      )}
      <span hidden>{id}</span>
    </div>
  );
}
