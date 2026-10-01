"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { describeError, isVideoUrl, listMedia, mediaSummary, uploadToLibrary, type MediaAsset, type MediaFolder } from "@/lib/homepageApi";

/**
 * "Choose from gallery" — the modal every image field opens. Lists the media
 * library folders (General, one per destination, one per event), the files in
 * the chosen folder, a search box, and an "Upload here" button that adds a new
 * file to that folder and picks it straight away.
 */
export default function MediaLibraryPicker({
  folder,
  accept = "image/*",
  onPick,
  onClose,
}: {
  folder?: string;
  accept?: string;
  onPick: (url: string, asset: MediaAsset) => void;
  onClose: () => void;
}) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [current, setCurrent] = useState(folder || "general");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wantsVideo = accept.includes("video");
  const wantsImage = accept.includes("image") || accept === "*" || accept === "*/*";

  useEffect(() => {
    mediaSummary()
      .then((r) => setFolders(r.data.folders))
      .catch((e) => setError(describeError(e)));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listMedia(current)
      .then((r) => setAssets(r.data))
      .catch((e) => setError(describeError(e)))
      .finally(() => setLoading(false));
  }, [current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shown = useMemo(
    () =>
      assets.filter((a) => {
        const video = a.kind === "video" || isVideoUrl(a.url);
        if (video && !wantsVideo) return false;
        if (!video && !wantsImage) return false;
        if (!q.trim()) return true;
        return `${a.alt || ""} ${a.url}`.toLowerCase().includes(q.toLowerCase());
      }),
    [assets, q, wantsImage, wantsVideo]
  );

  const upload = async (f: File) => {
    setUploading(true);
    setError(null);
    try {
      const asset = await uploadToLibrary(f, current, f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      onPick(asset.url, asset);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setUploading(false);
    }
  };

  const label = (f: MediaFolder) => (f.kind === "event" ? f.label.replace(/^Event · /, "") : f.label);

  // portal: the fields live inside scaled (transformed) frames, where position:fixed would be trapped
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="mg-picker-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal aria-label="Choose from the media library">
      <div className="mg-picker">
        <aside className="mg-picker-folders">
          <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#999", padding: "4px 10px 8px" }}>Folders</div>
          {["general", "destination", "event", "custom"].map((kind) => {
            const list = folders.filter((f) => f.kind === kind);
            if (!list.length) return null;
            return (
              <div key={kind} style={{ marginBottom: 10 }}>
                {kind !== "general" && <div style={{ fontSize: 11, color: "#999", padding: "6px 10px 2px", textTransform: "capitalize" }}>{kind === "custom" ? "Other" : `${kind}s`}</div>}
                {list.map((f) => (
                  <button key={f.key} type="button" className={f.key === current ? "active" : ""} onClick={() => setCurrent(f.key)}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label(f)}</span>
                    <small>{f.total}</small>
                  </button>
                ))}
              </div>
            );
          })}
        </aside>
        <section className="mg-picker-main">
          <div className="mg-picker-head">
            <strong style={{ fontSize: 14 }}>Choose from gallery</strong>
            <input type="search" placeholder="Search by caption…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" className="mg-btn" disabled={uploading} onClick={() => inputRef.current?.click()} title="Add a new file to this folder and use it">
              {uploading ? "Uploading…" : "+ Upload here"}
            </button>
            <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button type="button" className="mg-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          {error && <div className="mg-errors">{error}</div>}
          <div className="mg-picker-grid">
            {loading && <p className="mg-hint">Loading…</p>}
            {!loading && shown.length === 0 && <p className="mg-hint">Nothing in this folder yet — use “Upload here” or pick another folder.</p>}
            {shown.map((a) => (
              <button key={a.id} type="button" onClick={() => onPick(a.url, a)} title={a.alt || a.url}>
                {a.kind === "video" || isVideoUrl(a.url) ? <video src={a.url} muted playsInline /> : <img src={a.url} alt={a.alt || ""} loading="lazy" />}
                {a.alt && <span>{a.alt}</span>}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}
