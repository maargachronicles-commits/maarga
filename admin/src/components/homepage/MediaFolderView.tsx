"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toggle } from "./editorKit";
import { ConnectionHelp } from "./sections";
import { deleteItem, describeError, isVideoUrl, listMedia, mediaSummary, updateItem, uploadToLibrary, type MediaAsset, type MediaFolder } from "@/lib/homepageApi";

/**
 * One folder of the media library, shown as a grid of files. Every file has:
 *   • a caption (alt text)
 *   • "Gallery Bank" — show it on the public /gallery page
 *   • "<folder> gallery" — show it on that destination's / event's own gallery (not for General)
 *   • a "Move to…" folder select and Delete
 * The header counts how many files are selected for each place ("6 of 10 in Gallery Bank").
 * Changes save immediately; the small status text under the grid tells the client what happened.
 */
export default function MediaFolderView({ folder, folders, onChanged, title }: { folder: string; folders: MediaFolder[]; onChanged?: () => void; title?: string }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(0);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = folders.find((f) => f.key === folder);
  const kind = meta?.kind ?? (folder.startsWith("destination:") ? "destination" : folder.startsWith("event:") ? "event" : folder === "general" ? "general" : "custom");
  const folderName = title ?? meta?.label ?? folder;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAssets((await listMedia(folder)).data);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setLoading(false);
    }
  }, [folder]);
  useEffect(() => {
    load();
  }, [load]);

  const say = (t: string) => {
    setStatus(t);
    setTimeout(() => setStatus(""), 2500);
  };

  const patch = async (a: MediaAsset, data: Partial<MediaAsset>, msg: string) => {
    setAssets((l) => l.map((x) => (x.id === a.id ? { ...x, ...data } : x)));
    try {
      await updateItem("media", a.id, data as Record<string, unknown>, null, undefined, "publish");
      say(msg);
      onChanged?.();
    } catch (e) {
      setError(describeError(e));
      load();
    }
  };

  const remove = async (a: MediaAsset) => {
    if (!confirm("Delete this file from the library? Pages still using it will lose the image. This cannot be undone.")) return;
    try {
      await deleteItem("media", a.id);
      setAssets((l) => l.filter((x) => x.id !== a.id));
      say("Deleted.");
      onChanged?.();
    } catch (e) {
      setError(describeError(e));
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(files.length);
    setError(null);
    for (const f of Array.from(files)) {
      try {
        const asset = await uploadToLibrary(f, folder, f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
        setAssets((l) => [...l, asset]);
      } catch (e) {
        setError(describeError(e));
      }
      setUploading((n) => n - 1);
    }
    say("Uploaded.");
    onChanged?.();
  };

  const shown = useMemo(() => assets.filter((a) => !q.trim() || `${a.alt || ""} ${a.url}`.toLowerCase().includes(q.toLowerCase())), [assets, q]);
  const inBank = assets.filter((a) => a.inBank).length;
  const inFolder = assets.filter((a) => a.inFolderGallery).length;
  const folderGalleryLabel = kind === "destination" ? `${folderName.split(" · ")[0]} gallery page` : kind === "event" ? "this event's gallery" : null;

  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="mg-item">
        <div className="mg-item-bar" style={{ flexWrap: "wrap" }}>
          <strong style={{ color: "#222" }}>{folderName}</strong>
          <span className="mg-badge published" title="Files in this folder selected for the public Gallery Bank (/gallery)">
            {inBank} of {assets.length} in Gallery Bank
          </span>
          {folderGalleryLabel && (
            <span className="mg-badge hidden" title={`Files shown on ${folderGalleryLabel}`}>
              {inFolder} of {assets.length} on {folderGalleryLabel}
            </span>
          )}
          <span className="grow" />
          <input type="search" placeholder="Search captions…" value={q} onChange={(e) => setQ(e.target.value)} style={{ font: "13px var(--font-inter), system-ui", padding: "5px 9px", border: "1px solid #ccc", borderRadius: 6 }} />
          <button type="button" className="mg-btn primary" disabled={uploading > 0} onClick={() => inputRef.current?.click()}>
            {uploading > 0 ? `Uploading ${uploading}…` : "+ Upload files"}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm" hidden onChange={(e) => upload(e.target.files)} />
        </div>
        {error && <div className="mg-errors">{error}</div>}
        <div className="mg-preview" style={{ padding: 14 }}>
          {loading && <p className="mg-hint">Loading…</p>}
          {!loading && !error && assets.length === 0 && <p className="mg-hint">This folder is empty. Upload files here, or move files into it from another folder.</p>}
          <div className="mg-card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {shown.map((a) => {
              const video = a.kind === "video" || isVideoUrl(a.url);
              const file = a.kind === "file";
              return (
                <div key={a.id} className="mg-card">
                  <div className="thumb" style={{ aspectRatio: "4 / 3" }}>
                    {file ? (
                      <a href={a.url} target="_blank" rel="noreferrer" style={{ display: "grid", placeItems: "center", height: "100%", color: "#a62f20", fontSize: 13 }}>
                        Open file ↗
                      </a>
                    ) : video ? (
                      <video src={a.url} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src={a.url} alt={a.alt || ""} loading="lazy" />
                    )}
                    <span className="mg-badge hidden" style={{ position: "absolute", top: 6, left: 6 }}>{file ? "file" : video ? "video" : "image"}</span>
                  </div>
                  <div className="body">
                    <input
                      defaultValue={a.alt || ""}
                      placeholder="Caption / alt text"
                      onBlur={(e) => e.target.value !== (a.alt || "") && patch(a, { alt: e.target.value }, "Caption saved.")}
                      style={{ font: "13px var(--font-inter), system-ui", padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6 }}
                    />
                    {!file && (
                      <>
                        <Toggle on={a.inBank} onChange={(v) => patch(a, { inBank: v }, v ? "Shown in the Gallery Bank." : "Removed from the Gallery Bank.")} label="Gallery Bank" />
                        {folderGalleryLabel && <Toggle on={a.inFolderGallery} onChange={(v) => patch(a, { inFolderGallery: v }, v ? `Shown on ${folderGalleryLabel}.` : `Hidden from ${folderGalleryLabel}.`)} label={kind === "destination" ? "Destination gallery" : "Event gallery"} />}
                      </>
                    )}
                    <div className="actions">
                      <label className="mg-field" style={{ flex: 1 }}>
                        <select value={a.folder} onChange={(e) => e.target.value !== a.folder && patch(a, { folder: e.target.value }, "Moved.").then(() => setAssets((l) => l.filter((x) => x.id !== a.id)))} aria-label="Move to folder">
                          {folders.map((f) => (
                            <option key={f.key} value={f.key}>
                              {f.key === a.folder ? "Move to…" : f.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="button" className="mg-btn danger" onClick={() => remove(a)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {status && <p className="mg-hint" style={{ marginTop: 10, color: "#1d6b32" }}>{status}</p>}
        </div>
      </div>
    </section>
  );
}

/** Loads the folder summary once; re-fetches after uploads/moves. */
export function useMediaFolders() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [totals, setTotals] = useState({ total: 0, inBank: 0 });
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    mediaSummary()
      .then((r) => {
        setFolders(r.data.folders);
        setTotals(r.data.totals);
        setError(null);
      })
      .catch((e) => setError(describeError(e)));
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { folders, totals, error, reload };
}

export function MediaLoadError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <ConnectionHelp message={error} onRetry={onRetry} />;
}
