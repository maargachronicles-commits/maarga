"use client";

import "../homepage/homepage-editor.css";
import { useEffect, useState } from "react";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import MediaFolderView, { MediaLoadError, useMediaFolders } from "@/components/homepage/MediaFolderView";
import { CopyField } from "@/components/homepage/experienceSections";
import { LinkSettingEditor, LINK_ITEMS } from "@/components/homepage/sections";

/**
 * Gallery (media library) — every image and video the site uses, in folders:
 * General, one per destination, one per event. Toggle "Gallery Bank" to show a
 * file on the public /gallery page; toggle the folder gallery to show it on that
 * destination's or event's own gallery. Counters show how many are selected.
 */
function Library() {
  const lib = useMediaFolders();
  const [current, setCurrent] = useState("general");
  const [custom, setCustom] = useState("");
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h.startsWith("folder=")) setCurrent(decodeURIComponent(h.slice(7)));
  }, []);
  if (lib.error) return <MediaLoadError error={lib.error} onRetry={lib.reload} />;
  const groups = [
    { kind: "general", label: null },
    { kind: "destination", label: "Destinations" },
    { kind: "event", label: "Events" },
    { kind: "custom", label: "Other folders" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 260px) 1fr", gap: 18, alignItems: "start" }} className="mg-library">
      <aside className="mg-item" style={{ padding: 10, position: "sticky", top: 12 }}>
        <p className="mg-hint" style={{ padding: "4px 8px 8px" }}>
          <b style={{ color: "#222" }}>{lib.totals.inBank}</b> of {lib.totals.total} files are in the Gallery Bank
        </p>
        {groups.map((g) => {
          const list = lib.folders.filter((f) => f.kind === g.kind);
          if (!list.length) return null;
          return (
            <div key={g.kind} style={{ marginBottom: 8 }}>
              {g.label && <div style={{ fontSize: 11, color: "#999", padding: "8px 8px 2px", textTransform: "uppercase", letterSpacing: ".08em" }}>{g.label}</div>}
              {list.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setCurrent(f.key);
                    window.location.hash = `folder=${encodeURIComponent(f.key)}`;
                  }}
                  className="mg-btn"
                  style={{ display: "flex", width: "100%", justifyContent: "space-between", height: "auto", padding: "7px 8px", border: 0, background: f.key === current ? "#f3ede3" : "transparent", textAlign: "left" }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.kind === "event" ? f.label.replace(/^Event · /, "") : f.label}</span>
                  <span style={{ color: "#888", fontSize: 11, flex: "none" }}>
                    {f.inBank}/{f.total}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const k = custom.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
            if (k) {
              setCurrent(k);
              setCustom("");
            }
          }}
          style={{ display: "flex", gap: 6, padding: "8px 4px 2px" }}
        >
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="New folder name" style={{ flex: 1, minWidth: 0, font: "12px var(--font-inter), system-ui", padding: "5px 8px", border: "1px solid #ccc", borderRadius: 6 }} />
          <button type="submit" className="mg-btn" disabled={!custom.trim()}>
            +
          </button>
        </form>
        <p className="mg-hint" style={{ padding: "6px 8px 0" }}>Destination and event folders appear automatically; a new folder is created when you upload into it.</p>
      </aside>
      <MediaFolderView folder={current} folders={lib.folders} onChanged={lib.reload} />
    </div>
  );
}

function BankCopy() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>Gallery Bank heading</strong><span className="mg-hint">Shown at the top of /gallery</span></div>
        <div className="mg-preview mg" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 543, margin: "0 auto" }}>
            <CopyField k="bankLabel" className="t-body c-red" placeholder="Gallery" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="bankTitle" className="t-h2 c-ink" placeholder="Places do not speak for themselves. These do." style={{ textAlign: "center", marginTop: 4 }} />
            <CopyField k="bankLocationLabel" className="t-body c-red" placeholder="Location (dropdown label)" multiline={false} style={{ textAlign: "center", marginTop: 24 }} />
          </div>
        </div>
      </div>
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>Begin Your Maarga (Gallery Bank)</strong></div>
        <div className="mg-preview mg" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            <CopyField k="bankEnquireLabel" className="t-body c-red" placeholder="Enquire" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="bankEnquireTitle" className="t-h2 c-ink" placeholder="Begin Your Maarga" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="bankEnquireText" className="t-body c-ink" placeholder="You've read the fragments…" style={{ textAlign: "center", marginTop: 24 }} />
          </div>
        </div>
      </div>
      <LinkSettingEditor item={{ key: "bankEnquireCta", section: "Gallery Bank", where: "Red button above the footer of /gallery", variant: "red", defaults: { text: "Book The Architecture of an Empire", url: "/contact" } } as (typeof LINK_ITEMS)[number]} />
    </section>
  );
}

const TABS = [
  { id: "library", label: "Media library", hint: "All files in folders. Upload from your computer, tick “Gallery Bank” to show a file on the public Gallery page, tick the destination/event gallery to show it there.", el: <Library /> },
  { id: "copy", label: "Gallery Bank copy", hint: "Heading, dropdown label and the Begin Your Maarga block of the public /gallery page", el: <BankCopy /> },
];

export default function GalleryLibraryPage() {
  return (
    <PageEditorShell
      title="Gallery"
      path="/gallery"
      tabs={TABS}
      intro={
        <>
          Every image or video uploaded anywhere in the CMS lands here. Files live in folders — <b>General</b>, one per <b>destination</b>, one per <b>event</b>. Each file has two switches:
          <b> Gallery Bank</b> (the public Gallery page) and the folder's own gallery (the destination's Gallery tab / the event's after-the-event gallery). Any “Change image” button on any
          page can pick from here.
        </>
      }
    />
  );
}
