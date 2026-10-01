"use client";

import "../../homepage/homepage-editor.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { ButtonField, Editable, ImageField, ItemFrame, ScaledFrame, useCollection } from "@/components/homepage/editorKit";
import { ConnectionHelp } from "@/components/homepage/sections";
import MediaFolderView, { useMediaFolders } from "@/components/homepage/MediaFolderView";
import { createItem, deleteItem, describeError, duplicateItinerary, folderKey, listCollection, setVisibility, type CmsRecord, type CollectionName } from "@/lib/homepageApi";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/* ---------------- Itineraries of this destination ---------------- */
function ItineraryList({ destination }: { destination: CmsRecord }) {
  const name = `itineraries?destinationId=${destination.id}` as CollectionName;
  const [rows, setRows] = useState<CmsRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      listCollection(name)
        .then((r) => setRows(r.data))
        .catch((e) => setError(describeError(e))),
    [name]
  );
  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    setBusy(true);
    try {
      const r = await createItem(
        "itineraries",
        {
          destinationId: destination.id,
          title: title.trim() || "New itinerary",
          label: "Journey Path",
          heroLabel: str(destination.heroLabel) || str(destination.name).toUpperCase(),
          heroTitle: str(destination.heroTitle),
          heroCtaText: "Enquire about this journey",
          heroCtaUrl: str(destination.enquireCtaUrl) || "/contact",
          days: JSON.stringify([{ title: "Arrival", image: "", activities: [{ title: "", description: "", icons: [] }] }]),
          stays: JSON.stringify([]),
        },
        null,
        "heroImage",
        "draft"
      );
      window.location.href = `/destinations/${destination.id}/itinerary/${r.data.id}`;
    } catch (e) {
      setError(describeError(e));
      setBusy(false);
    }
  };
  const dup = async (it: CmsRecord) => {
    try {
      await duplicateItinerary(it.id);
      load();
    } catch (e) {
      setError(describeError(e));
    }
  };
  const remove = async (it: CmsRecord) => {
    if (!confirm(`Delete “${str(it.title)}” (${str(it.code)})? This cannot be undone.`)) return;
    try {
      await deleteItem("itineraries", it.id);
      load();
    } catch (e) {
      setError(describeError(e));
    }
  };
  const toggle = async (it: CmsRecord, v: boolean) => {
    setRows((l) => l && l.map((x) => (x.id === it.id ? { ...x, published: v } : x)));
    try {
      await setVisibility("itineraries", it.id, v);
    } catch (e) {
      setError(describeError(e));
      load();
    }
  };

  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && <ConnectionHelp message={error} onRetry={load} />}
      <div className="mg-item">
        <div className="mg-item-bar" style={{ flexWrap: "wrap" }}>
          <strong style={{ color: "#222" }}>New itinerary</strong>
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Title, e.g. The Temple Architects of the Deccan" style={{ font: "13px var(--font-inter), system-ui", padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, minWidth: 300, flex: 1 }} />
          <button type="button" className="mg-btn primary" disabled={busy} onClick={add}>
            {busy ? "Creating…" : "Create & open builder"}
          </button>
        </div>
      </div>
      {rows === null && !error && <p className="mg-hint">Loading…</p>}
      {rows?.length === 0 && <p className="mg-hint">No itineraries yet — create the first one above.</p>}
      <div className="mg-card-grid">
        {rows?.map((it) => {
          const days = Array.isArray(it.days) ? (it.days as unknown[]).length : 0;
          return (
            <div key={it.id} className="mg-card">
              <div className="thumb">{it.heroImage || destination.heroImage ? <img src={str(it.heroImage || destination.heroImage)} alt="" /> : null}</div>
              <div className="body">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h3>{str(it.title) || "Untitled"}</h3>
                  <span className="mg-code">{str(it.code)}</span>
                  <span className={`mg-badge ${it.status === "PUBLISHED" ? "published" : "draft"}`}>{it.status === "PUBLISHED" ? "Published" : "Draft"}</span>
                  {!it.published && <span className="mg-badge hidden">Hidden</span>}
                </div>
                <p className="meta">
                  {str(it.durationLabel) || "Duration not set"} · {days} day{days === 1 ? "" : "s"}
                </p>
                <label className="mg-toggle" style={{ fontSize: 12 }}>
                  <input type="checkbox" checked={!!it.published} onChange={(e) => toggle(it, e.target.checked)} /> Show on the site
                </label>
                <div className="actions">
                  <Link href={`/destinations/${destination.id}/itinerary/${it.id}`} className="mg-btn primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                    Open builder
                  </Link>
                  {!!destination.code && !!it.code && (
                    <a href={`${site}/destinations/${destination.code}/itinerary/${it.code}`} target="_blank" rel="noreferrer" className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                      Live ↗
                    </a>
                  )}
                  <button type="button" className="mg-btn" onClick={() => dup(it)}>
                    Duplicate
                  </button>
                  <button type="button" className="mg-btn danger" onClick={() => remove(it)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mg-hint">Each itinerary gets its own code under the destination ({str(destination.code)} → {str(destination.code).slice(0, 3)}00001, …). Duplicate copies days, stays and scholars into a new draft.</p>
    </section>
  );
}

/* ---------------- Destination details (hero, page copy, enquire) ---------------- */
const DETAIL_KEYS = ["name", "region", "subtitle", "heroImage", "heroImageAltText", "heroLabel", "heroTitle", "experienceUrl", "enquireLabel", "enquireTitle", "enquireText", "enquireCtaText", "enquireCtaUrl", "ctaText", "ctaUrl"];

function DestinationDetails({ id, onSaved }: { id: string; onSaved: (r: CmsRecord) => void }) {
  const toValues = useCallback((r: CmsRecord) => Object.fromEntries(DETAIL_KEYS.map((k) => [k, str(r[k])])), []);
  const col = useCollection("destinations", "heroImage", toValues);
  const item = col.items.find((x) => x.id === id);
  useEffect(() => {
    if (item?.record) onSaved(item.record);
  }, [item?.record, onSaved]);
  if (col.loading) return <p className="mg-hint">Loading…</p>;
  if (col.loadError) return <ConnectionHelp message={col.loadError} onRetry={col.reload} />;
  if (!item) return <p className="mg-hint">Destination not found.</p>;
  const v = (k: string) => item.values[k] ?? "";
  const set = (k: string, val: string) => col.setValue(item.id, k, val);
  const inv = (k: string) => item.missing.includes(k);
  const folder = folderKey.destination(id);
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ItemFrame
        item={item}
        index={0}
        count={1}
        title={`${v("name") || "Destination"} · ${str(item.record?.code)}`}
        pageName="the site"
        onSaveDraft={() => col.save(item.id, "draft")}
        onPublish={() => col.save(item.id, "publish")}
        onToggle={(x) => col.toggle(item.id, x)}
        onDelete={() => alert("Delete destinations from the Destinations list.")}
        onMove={() => {}}
        onDiscard={() => col.discard(item.id)}
      >
        <ScaledFrame designWidth={1512}>
          <div style={{ width: 1512 }}>
            {/* hero */}
            <div style={{ position: "relative", width: 1512, height: 657, background: "#272727" }}>
              <ImageField src={v("heroImage") || null} file={item.file} onFile={(f) => col.setFile(item.id, f)} onPick={(u) => col.setImageUrl(item.id, u)} folder={folder} invalid={inv("heroImage")} label="Change hero photo" style={{ position: "absolute", inset: 0, width: 1512, height: 657 }} />
              <div style={{ position: "absolute", left: 339, bottom: 72, width: 835, textAlign: "center", zIndex: 2, pointerEvents: "none" }}>
                <div style={{ pointerEvents: "auto", background: "rgba(39,39,39,.35)", borderRadius: 8, padding: "8px 12px" }}>
                  <Editable className="t-body c-cream" value={v("heroLabel")} onChange={(x) => set("heroLabel", x)} placeholder={v("name").toUpperCase() || "HAMPI"} multiline={false} style={{ textAlign: "center", textTransform: "uppercase" }} />
                  <Editable className="t-h1 c-cream" value={v("heroTitle")} onChange={(x) => set("heroTitle", x)} placeholder="Experience the India in a never before pathway" style={{ textAlign: "center", marginTop: 13 }} />
                </div>
              </div>
            </div>
            {/* name / region / links */}
            <div style={{ padding: "28px 120px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <label className="mg-field">
                Destination name (used for the code and the homepage card)
                <input value={v("name")} onChange={(e) => set("name", e.target.value)} className={inv("name") ? "mg-invalid" : ""} />
              </label>
              <label className="mg-field">
                Region / state
                <input value={v("region")} onChange={(e) => set("region", e.target.value)} placeholder="Karnataka" />
              </label>
              <label className="mg-field">
                Subtitle (homepage card)
                <input value={v("subtitle")} onChange={(e) => set("subtitle", e.target.value)} placeholder="UNESCO World Heritage Site" />
              </label>
              <label className="mg-field">
                Hero photo alt text
                <input value={v("heroImageAltText")} onChange={(e) => set("heroImageAltText", e.target.value)} />
              </label>
              <label className="mg-field">
                “Experience” tab link (the destination's experience page)
                <input value={v("experienceUrl")} onChange={(e) => set("experienceUrl", e.target.value)} placeholder="/experience" />
              </label>
              <div className="mg-field">
                Public links
                <span className="mg-hint">
                  Itinerary: <span className="mg-code">/destinations/{str(item.record?.code)}/itinerary</span> · Gallery: <span className="mg-code">/destinations/{str(item.record?.code)}/gallery</span>
                </span>
              </div>
            </div>
            {/* enquire block */}
            <div style={{ padding: "0 120px 40px", textAlign: "center" }}>
              <div style={{ maxWidth: 380, margin: "0 auto" }}>
                <Editable className="t-body c-red" value={v("enquireLabel")} onChange={(x) => set("enquireLabel", x)} placeholder="Enquire" multiline={false} style={{ textAlign: "center" }} />
                <Editable className="t-h2 c-ink" value={v("enquireTitle")} onChange={(x) => set("enquireTitle", x)} placeholder="Begin Your Maarga" multiline={false} style={{ textAlign: "center" }} />
                <Editable className="t-body c-ink" value={v("enquireText")} onChange={(x) => set("enquireText", x)} placeholder="Seven days. One empire, read the way it was built to be read." style={{ textAlign: "center", marginTop: 24 }} />
                <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                  <ButtonField variant="red" text={v("enquireCtaText")} url={v("enquireCtaUrl")} onText={(x) => set("enquireCtaText", x)} onUrl={(x) => set("enquireCtaUrl", x)} textPlaceholder="Enquire about this journey" hint="Used on the destination's gallery page and as the default for its itineraries." />
                </div>
              </div>
            </div>
          </div>
        </ScaledFrame>
      </ItemFrame>
      <p className="mg-hint">
        These are the destination's own page settings (hero on the Itinerary and Gallery tabs, the Begin Your Maarga block). The homepage card (417×596) is edited under Homepage → Destinations and uses the same name, region, subtitle and photo.
      </p>
    </section>
  );
}

function DestinationGalleryTab({ id }: { id: string }) {
  const lib = useMediaFolders();
  return <MediaFolderView folder={folderKey.destination(id)} folders={lib.folders} onChanged={lib.reload} />;
}

export default function DestinationAdminPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [dest, setDest] = useState<CmsRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(
    () =>
      listCollection("destinations")
        .then((r) => setDest(r.data.find((d) => d.id === id) ?? null))
        .catch((e) => setError(describeError(e))),
    [id]
  );
  useEffect(() => {
    load();
  }, [load]);
  const onSaved = useCallback((r: CmsRecord) => setDest(r), []);

  const tabs = useMemo(
    () =>
      dest
        ? [
            { id: "itineraries", label: `Itineraries (${Number(dest.itineraries || 0)})`, hint: "All itineraries of this destination. Visitors switch between them with the dropdown on the itinerary page.", el: <ItineraryList destination={dest} /> },
            { id: "details", label: "Destination details", hint: "Name, region, hero photo and copy, links, Begin Your Maarga", el: <DestinationDetails id={id} onSaved={onSaved} /> },
            { id: "gallery", label: "Gallery folder", hint: "Photos of this destination. “Destination gallery” shows a photo on its Gallery tab; “Gallery Bank” on the public Gallery page.", el: <DestinationGalleryTab id={id} /> },
          ]
        : [{ id: "loading", label: "…", hint: "", el: error ? <ConnectionHelp message={error} onRetry={load} /> : <p className="mg-hint">Loading…</p> }],
    [dest, id, onSaved, error, load]
  );

  return (
    <PageEditorShell
      title={dest ? `${str(dest.name)} · ${str(dest.code)}` : "Destination"}
      path={dest?.code ? `/destinations/${dest.code}/itinerary` : "/destinations"}
      tabs={tabs}
      intro={
        <>
          <Link href="/destinations" style={{ color: "#a62f20" }}>
            ← All destinations
          </Link>
          {" · "}Manage this destination's itineraries, page copy and gallery folder.
        </>
      }
    />
  );
}
