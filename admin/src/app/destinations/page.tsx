"use client";

import "../homepage/homepage-editor.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { ConnectionHelp } from "@/components/homepage/sections";
import { Toggle } from "@/components/homepage/editorKit";
import { createItem, deleteItem, describeError, listCollection, setVisibility, type CmsRecord } from "@/lib/homepageApi";
import { CopyField } from "@/components/homepage/experienceSections";

/**
 * Destinations & Itineraries — every destination as a card (photo, name, public
 * code, region, how many itineraries). Open a destination to manage its
 * itineraries, its details and its gallery folder.
 */
function DestinationList() {
  const [rows, setRows] = useState<CmsRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const load = () =>
    listCollection("destinations")
      .then((r) => setRows(r.data))
      .catch((e) => setError(describeError(e)));
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const r = await createItem("destinations", { name: name.trim(), region: "" }, null, "heroImage", "draft");
      setName("");
      window.location.href = `/destinations/${r.data.id}#details`;
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d: CmsRecord) => {
    if (!confirm(`Delete “${d.name}” and ALL its itineraries? This cannot be undone.`)) return;
    try {
      await deleteItem("destinations", d.id);
      load();
    } catch (e) {
      setError(describeError(e));
    }
  };

  const toggle = async (d: CmsRecord, v: boolean) => {
    setRows((l) => l && l.map((x) => (x.id === d.id ? { ...x, published: v } : x)));
    try {
      await setVisibility("destinations", d.id, v);
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
          <strong style={{ color: "#222" }}>Add a destination</strong>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Destination name, e.g. Badami" style={{ font: "13px var(--font-inter), system-ui", padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, minWidth: 240 }} />
          <button type="button" className="mg-btn primary" disabled={busy || !name.trim()} onClick={add}>
            {busy ? "Creating…" : "Create"}
          </button>
          <span className="mg-hint">A public code (e.g. HAM0001) is assigned automatically from the name and never changes.</span>
        </div>
      </div>
      {rows === null && !error && <p className="mg-hint">Loading…</p>}
      <div className="mg-card-grid">
        {rows?.map((d) => (
          <div key={d.id} className="mg-card">
            <div className="thumb">{d.heroImage ? <img src={String(d.heroImage)} alt="" /> : <div className="mg-hint" style={{ padding: 20 }}>No photo yet</div>}</div>
            <div className="body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3>{String(d.name || "Untitled")}</h3>
                <span className="mg-code">{String(d.code || "—")}</span>
                <span className={`mg-badge ${d.status === "PUBLISHED" ? "published" : "draft"}`}>{d.status === "PUBLISHED" ? "Published" : "Draft"}</span>
              </div>
              <p className="meta">
                {String(d.region || "Region not set")} · {Number(d.itineraries || 0)} itinerar{Number(d.itineraries || 0) === 1 ? "y" : "ies"}
              </p>
              <Toggle on={!!d.published} onChange={(v) => toggle(d, v)} label="Show on the site" />
              <div className="actions">
                <Link href={`/destinations/${d.id}`} className="mg-btn primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  Open
                </Link>
                {!!d.code && (
                  <a href={`${site}/destinations/${d.code}`} target="_blank" rel="noreferrer" className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                    Live page ↗
                  </a>
                )}
                <button type="button" className="mg-btn danger" onClick={() => remove(d)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IndexCopy() {
  return (
    <section className="mg">
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>/destinations heading</strong><span className="mg-hint">Shown above the destination cards on the public Destinations page</span></div>
        <div className="mg-preview mg" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <CopyField k="destinationsLabel" className="t-body c-red" placeholder="Destinations" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="destinationsTitle" className="t-h2 c-ink" placeholder="Every place, read the way it was built to be read." style={{ textAlign: "center", marginTop: 4 }} />
            <CopyField k="destinationsIntro" className="t-body c-ink" placeholder="Choose a destination to see its itineraries…" style={{ textAlign: "center", marginTop: 24 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

const TABS = [
  { id: "list", label: "Destinations", hint: "Each destination has its own itineraries, gallery folder and page copy. Open one to manage them.", el: <DestinationList /> },
  { id: "copy", label: "Destinations page copy", hint: "Heading of the public /destinations index", el: <IndexCopy /> },
];

export default function DestinationsAdminPage() {
  return (
    <PageEditorShell
      title="Destinations & Itineraries"
      path="/destinations"
      tabs={TABS}
      intro={
        <>
          A destination (e.g. Hampi, code <span className="mg-code">HAM0001</span>) can have any number of itineraries (codes <span className="mg-code">HAM00001</span>, <span className="mg-code">HAM00002</span>…). Visitors reach them at
          <span className="mg-code">/destinations/HAM0001/itinerary/HAM00001</span>. The homepage Destinations row is edited under Homepage → Destinations.
        </>
      }
    />
  );
}
