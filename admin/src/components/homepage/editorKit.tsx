"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  createItem,
  deleteItem,
  describeError,
  listCollection,
  reorderItems,
  setVisibility,
  updateItem,
  type ApiError,
  type CmsRecord,
  type CollectionName,
  type FieldMeta,
  type SaveMode,
} from "@/lib/homepageApi";
import MediaLibraryPicker from "./MediaLibraryPicker";

/* =====================================================================
   Editable — a textarea that looks exactly like the text it replaces.
   Inherits font/colour/alignment from its parent; auto-grows; dashed
   outline on hover so the client can see what is editable.
===================================================================== */
export function Editable({
  value,
  onChange,
  placeholder,
  className = "",
  style,
  invalid,
  inline,
  multiline = true,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  invalid?: boolean;
  inline?: boolean;
  multiline?: boolean;
  type?: "text" | "date";
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const cls = `${className} mg-edit ${invalid ? "mg-invalid" : ""} ${inline ? "mg-inline" : ""}`.trim();

  if (type === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
        style={{ ...style, height: "auto" }}
        title="Pick a date"
      />
    );
  }

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(multiline ? e.target.value : e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") e.preventDefault();
      }}
      className={cls}
      style={style}
      spellCheck
    />
  );
}

/* =====================================================================
   ImageField — shows the current image at the design's size; hover to
   replace; supports an empty state for drafts.
===================================================================== */
export function ImageField({
  src,
  file,
  onFile,
  className = "",
  style,
  alt = "",
  invalid,
  label = "Change image",
  accept = "image/*",
  render,
  onPick,
  folder,
}: {
  src?: string | null;
  file?: File | null;
  onFile: (f: File | null) => void;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  invalid?: boolean;
  label?: string;
  accept?: string;
  /** custom renderer for the media (e.g. <video>) */
  render?: (url: string) => ReactNode;
  /** when given, a second button lets the client pick an existing file from the media library (CMS → Gallery) */
  onPick?: (url: string) => void;
  /** library folder to open first (e.g. destination:<id>) */
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const url = preview || src || "";
  return (
    <div className={`mg-img ${url ? "" : "mg-img-none"} ${invalid ? "mg-invalid" : ""} ${className}`} style={style}>
      {url ? (render ? render(url) : <img src={url} alt={alt} />) : <div className="mg-img-empty">No image yet — click to add</div>}
      <div className="mg-img-actions">
        <button type="button" className="mg-img-btn" onClick={() => inputRef.current?.click()} title="Upload a file from this computer">
          {url ? label : "Upload"} · from PC
        </button>
        {onPick && (
          <button type="button" className="mg-img-btn alt" onClick={() => setPicking(true)} title="Choose a file already in the media library (CMS → Gallery)">
            from Gallery
          </button>
        )}
      </div>
      {picking && onPick && (
        <MediaLibraryPicker
          folder={folder}
          accept={accept}
          onClose={() => setPicking(false)}
          onPick={(u) => {
            onPick(u);
            onFile(null);
            setPicking(false);
          }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* =====================================================================
   ScaledFrame — renders a fixed-width design and scales it down to the
   available admin width so 1512px layouts fit without reflowing.
===================================================================== */
export function ScaledFrame({ designWidth, children }: { designWidth: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [h, setH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, o.clientWidth / designWidth)));
    ro.observe(o);
    setScale(Math.min(1, o.clientWidth / designWidth));
    return () => ro.disconnect();
  }, [designWidth]);

  useEffect(() => {
    const i = inner.current;
    if (!i) return;
    const ro = new ResizeObserver(() => setH(i.offsetHeight * scale));
    ro.observe(i);
    setH(i.offsetHeight * scale);
    return () => ro.disconnect();
  }, [scale]);

  return (
    <div ref={outer} className="mg-scale-outer" style={{ height: h }}>
      <div ref={inner} className="mg-scale-inner" style={{ width: designWidth, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/* =====================================================================
   Toggle
===================================================================== */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" className={`mg-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="track" />
      <span>{label}</span>
    </button>
  );
}

/* =====================================================================
   useCollection — load + local edits + save (draft / publish) + toggle +
   reorder + delete for one homepage collection.
===================================================================== */
export interface EditableItem {
  /** "new-…" ids are unsaved */
  id: string;
  record: CmsRecord | null;
  values: Record<string, string>;
  file: File | null;
  dirty: boolean;
  saving: boolean;
  errors: string[];
  missing: string[];
  published: boolean;
  status: "DRAFT" | "PUBLISHED";
}

const isNew = (id: string) => id.startsWith("new-");

export function useCollection(name: CollectionName, imageField: string | undefined, toValues: (r: CmsRecord) => Record<string, string>) {
  const [items, setItems] = useState<EditableItem[]>([]);
  const [profiles, setProfiles] = useState<CmsRecord[]>([]);
  const [fields, setFields] = useState<FieldMeta[]>([]);
  const [required, setRequired] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fromRecord = useCallback(
    (r: CmsRecord): EditableItem => ({
      id: r.id,
      record: r,
      values: toValues(r),
      file: null,
      dirty: false,
      saving: false,
      errors: [],
      missing: [],
      published: !!r.published,
      status: r.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    }),
    [toValues]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listCollection(name);
      setItems(res.data.map(fromRecord));
      setProfiles(res.profiles ?? []);
      setFields(res.fields);
      setRequired(res.required);
    } catch (e) {
      setLoadError(describeError(e));
    } finally {
      setLoading(false);
    }
  }, [name, fromRecord]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (id: string, fn: (it: EditableItem) => EditableItem) =>
    setItems((list) => list.map((it) => (it.id === id ? fn(it) : it)));

  const setValue = (id: string, key: string, v: string) =>
    patch(id, (it) => ({ ...it, dirty: true, values: { ...it.values, [key]: v }, missing: it.missing.filter((m) => m !== key) }));

  const setFile = (id: string, f: File | null) => patch(id, (it) => ({ ...it, dirty: true, file: f, missing: it.missing.filter((m) => m !== imageField) }));

  /** an existing library file was chosen → store its URL (no upload happens) */
  const setImageUrl = (id: string, url: string) =>
    patch(id, (it) => ({ ...it, dirty: true, file: null, values: imageField ? { ...it.values, [imageField]: url } : it.values, missing: it.missing.filter((m) => m !== imageField) }));

  const addNew = (defaults: Record<string, string> = {}) =>
    setItems((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        record: null,
        values: defaults,
        file: null,
        dirty: true,
        saving: false,
        errors: [],
        missing: [],
        published: true,
        status: "DRAFT",
      },
    ]);

  const save = async (id: string, mode: SaveMode) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    // client-side check first so the user sees exactly which field is missing
    if (mode === "publish") {
      const missing = required.filter((k) => {
        if (k === imageField) return !it.file && !it.values[k];
        return !(it.values[k] ?? "").trim();
      });
      if (missing.length) {
        const labels = missing.map((k) => fields.find((f) => f.key === k)?.label ?? k);
        patch(id, (x) => ({ ...x, missing, errors: [`To publish, fill in: ${labels.join(", ")}.`] }));
        return;
      }
    }
    patch(id, (x) => ({ ...x, saving: true, errors: [] }));
    try {
      const payload: Record<string, unknown> = { ...it.values, published: it.published };
      if (imageField && it.file) delete payload[imageField]; // file wins
      const res = isNew(id)
        ? await createItem(name, payload, it.file, imageField, mode)
        : await updateItem(name, id, payload, it.file, imageField, mode);
      setItems((list) => list.map((x) => (x.id === id ? fromRecord(res.data) : x)));
    } catch (e) {
      const err = e as ApiError;
      patch(id, (x) => ({
        ...x,
        saving: false,
        errors: [err.message + (err.missing?.length ? ` (${err.missing.join(", ")})` : "")],
      }));
    }
  };

  const toggle = async (id: string, published: boolean) => {
    patch(id, (x) => ({ ...x, published }));
    if (isNew(id)) return; // saved together with the record
    try {
      await setVisibility(name, id, published);
    } catch (e) {
      patch(id, (x) => ({ ...x, published: !published, errors: [(e as Error).message] }));
    }
  };

  const remove = async (id: string) => {
    if (isNew(id)) return setItems((l) => l.filter((x) => x.id !== id));
    if (!confirm("Delete this item permanently? This cannot be undone.")) return;
    try {
      await deleteItem(name, id);
      setItems((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      patch(id, (x) => ({ ...x, errors: [(e as Error).message] }));
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((x) => x.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    setItems(next);
    const saved = next.filter((x) => !isNew(x.id)).map((x) => x.id);
    try {
      await reorderItems(name, saved);
    } catch (e) {
      setItems(items);
      alert((e as Error).message);
    }
  };

  /** Put the item at an exact position (0-based) — "show this card 1st / 2nd / 3rd…". */
  const moveTo = async (id: string, to: number) => {
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0 || to < 0 || to >= items.length || to === idx) return;
    const next = [...items];
    const [it] = next.splice(idx, 1);
    next.splice(to, 0, it);
    setItems(next);
    const saved = next.filter((x) => !isNew(x.id)).map((x) => x.id);
    try {
      await reorderItems(name, saved);
    } catch (e) {
      setItems(items);
      alert((e as Error).message);
    }
  };

  const discard = (id: string) =>
    setItems((l) => l.flatMap((x) => (x.id !== id ? [x] : x.record ? [fromRecord(x.record)] : [])));

  const requiredSet = useMemo(() => new Set(required), [required]);

  return { items, profiles, fields, required: requiredSet, loading, loadError, reload: load, setValue, setFile, setImageUrl, addNew, save, toggle, remove, move, moveTo, discard };
}

/* =====================================================================
   ItemFrame — the admin chrome around one preview card.
===================================================================== */
export function ItemFrame({
  item,
  index,
  count,
  onSaveDraft,
  onPublish,
  onToggle,
  onDelete,
  onMove,
  onMoveTo,
  onDiscard,
  children,
  title,
  pageName = "homepage",
  previewBg,
  extraActions,
}: {
  item: EditableItem;
  index: number;
  count: number;
  onSaveDraft: () => void;
  onPublish: () => void;
  onToggle: (v: boolean) => void;
  onDelete: () => void;
  onMove: (d: -1 | 1) => void;
  onMoveTo?: (index: number) => void;
  onDiscard: () => void;
  children: ReactNode;
  title?: string;
  pageName?: string;
  previewBg?: string;
  /** extra buttons in the bar (e.g. "Open itinerary", "Duplicate") */
  extraActions?: ReactNode;
}) {
  const unsaved = isNew(item.id);
  return (
    <div className="mg-item">
      <div className="mg-item-bar">
        <label className="mg-pos" title={`Which position this card takes on the ${pageName} (1 = first)`}>
          <span>Position</span>
          <select value={index} onChange={(e) => onMoveTo?.(Number(e.target.value))} aria-label={`Position on the ${pageName}`}>
            {Array.from({ length: count }, (_, i) => (
              <option key={i} value={i}>
                {i + 1} of {count}
              </option>
            ))}
          </select>
        </label>
        <span className="mg-move">
          <button type="button" className="mg-btn icon" title="Move one position earlier" disabled={index === 0} onClick={() => onMove(-1)}>
            ←
          </button>
          <button type="button" className="mg-btn icon" title="Move one position later" disabled={index >= count - 1} onClick={() => onMove(1)}>
            →
          </button>
        </span>
        {title && <strong style={{ color: "#222" }}>{title}</strong>}
        <span className={`mg-badge ${item.status === "PUBLISHED" ? "published" : "draft"}`}>
          {unsaved ? "Not saved yet" : item.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
        {!item.published && <span className="mg-badge hidden">Hidden from {pageName}</span>}
        {item.dirty && !unsaved && <span className="mg-badge dirty">Unsaved changes</span>}
        <span className="grow" />
        {extraActions}
        <Toggle on={item.published} onChange={onToggle} label={`Show on ${pageName}`} />
        {item.dirty && !unsaved && (
          <button type="button" className="mg-btn" onClick={onDiscard}>
            Discard
          </button>
        )}
        <button type="button" className="mg-btn" disabled={item.saving || !item.dirty} onClick={onSaveDraft} title="Saves even if some fields are empty">
          {item.saving ? "Saving…" : "Save as draft"}
        </button>
        <button type="button" className="mg-btn primary" disabled={item.saving} onClick={onPublish} title="All required fields must be filled">
          {item.saving ? "Saving…" : "Publish"}
        </button>
        <button type="button" className="mg-btn danger" onClick={onDelete}>
          Delete
        </button>
      </div>
      {item.errors.length > 0 && <div className="mg-errors">{item.errors.join(" ")}</div>}
      <div className="mg-preview" style={previewBg ? { background: previewBg } : undefined}>{children}</div>
    </div>
  );
}

/* Small helpers reused by the section editors */
export function SectionHeadingPreview({ label, title, children, light }: { label: string; title: string; children?: ReactNode; light?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <p className={`t-body ${light ? "c-cream" : "c-red"}`}>{label}</p>
      <h2 className={`t-h2 ${light ? "c-cream" : "c-ink"}`} style={{ marginTop: 4 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* =====================================================================
   ButtonField — a button exactly as it looks on the site, with editable
   label, and the link it opens directly underneath (visitors never see the
   link row). Used the same way in every section so the client always finds
   "button text + link" in the same place.
===================================================================== */
export function ButtonField({
  text,
  url,
  onText,
  onUrl,
  variant = "cream",
  textInvalid,
  urlInvalid,
  optional,
  textPlaceholder = "Button text",
  urlPlaceholder = "/page or https://…",
  hint,
}: {
  text: string;
  url: string;
  onText: (v: string) => void;
  onUrl: (v: string) => void;
  variant?: "cream" | "red" | "arrow" | "arrow-light";
  textInvalid?: boolean;
  urlInvalid?: boolean;
  /** Optional buttons render only when the client types a label; shown here as a dashed outline. */
  optional?: boolean;
  textPlaceholder?: string;
  urlPlaceholder?: string;
  hint?: string;
}) {
  const isArrow = variant.startsWith("arrow");
  const empty = optional && !text.trim();
  return (
    <div className={`mg-button-field ${empty ? "is-empty" : ""}`}>
      <div className={isArrow ? `arrow-link ${variant === "arrow-light" ? "c-cream" : "c-red"}` : `${variant === "red" ? "btn-red" : "btn-cream"}`} style={isArrow ? undefined : { padding: "0 8px" }}>
        <Editable
          value={text}
          onChange={onText}
          placeholder={optional ? `${textPlaceholder} (optional)` : textPlaceholder}
          invalid={textInvalid}
          multiline={false}
          inline={isArrow}
          style={isArrow ? undefined : { textAlign: "center" }}
        />
        {isArrow && (
          <svg viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8.2M7.1 2.9 11.2 7l-4.1 4.1" stroke="currentColor" strokeWidth="1.18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <label className={`mg-link ${variant === "cream" || variant === "arrow-light" ? "on-red" : ""}`}>
        <span>Link</span>
        <input value={url} onChange={(e) => onUrl(e.target.value)} placeholder={urlPlaceholder} className={urlInvalid ? "mg-invalid" : ""} spellCheck={false} />
      </label>
      {hint && <p className="mg-link-hint">{hint}</p>}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="mg-hint" style={{ padding: "24px 0" }}>
      {text}
    </div>
  );
}
