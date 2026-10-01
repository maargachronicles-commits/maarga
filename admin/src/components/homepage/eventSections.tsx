"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { ButtonField, Editable, ImageField, ItemFrame, ScaledFrame, useCollection, type EditableItem } from "./editorKit";
import { CollectionSection, ConnectionHelp, LinkSettingEditor, LINK_ITEMS, SettingImage, type RenderApi } from "./sections";
import { CopyField, PlacementEditor } from "./experienceSections";
import MediaFolderView, { useMediaFolders } from "./MediaFolderView";
import { folderKey, formatEventDate, toDateInput, type CmsRecord, type CollectionName } from "@/lib/homepageApi";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
export const EVENT_KEYS = [
  "title", "subtitle", "description", "eventDate", "startTime", "endTime", "location", "image", "imageAltText", "ctaText", "ctaUrl", "category", "duration",
  "body", "whoIsThisFor", "postEventText", "feedback", "bookUrl", "bookCtaText", "standardTicketPrice", "earlyBirdEnabled", "earlyBirdPrice", "earlyBirdNote", "format", "meetingLink",
];

const clock = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = Number(m[1]);
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}${m[2] === "00" ? "" : `:${m[2]}`}${ap}`;
};
const isPastDate = (iso: string) => !!iso && new Date(iso).getTime() < Date.now() - 86400000;

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="t-small c-red">{label}</p>
    <div style={{ marginTop: 2 }}>{children}</div>
  </div>
);

/* ---------------- Overview card (Figma Frame 466) — the row visitors see on /events ---------------- */
export function EventOverviewCard({ a, item, folder }: { a: RenderApi; item: EditableItem; folder?: string }) {
  const d = a.v("eventDate") ? new Date(a.v("eventDate")) : null;
  const past = isPastDate(a.v("eventDate"));
  return (
    <div style={{ width: 1272, display: "flex", gap: 64 }}>
      <div style={{ width: 131, flex: "none", textAlign: "center" }}>
        <div className="t-h4" style={{ border: "1px solid #000", padding: 10, color: "#000" }}>{d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { month: "long" }) : "Month"}</div>
        <div className="t-h1" style={{ color: "#000", marginTop: 11 }}>{d && !Number.isNaN(d.getTime()) ? d.getDate() : "—"}</div>
        <label className="mg-field" style={{ marginTop: 10, textAlign: "left" }}>
          Date
          <input type="date" value={toDateInput(a.v("eventDate"))} onChange={(e) => a.set("eventDate", e.target.value)} className={a.invalid("eventDate") ? "mg-invalid" : ""} />
        </label>
        <span className={`mg-badge ${past ? "hidden" : "published"}`} style={{ display: "inline-block", marginTop: 8 }}>{past ? "Past event" : "Upcoming"}</span>
      </div>
      <div style={{ display: "flex", gap: 31, flex: 1 }}>
        <ImageField src={a.imageSrc} file={a.file} onFile={a.setFile} onPick={a.pickImage} folder={folder} invalid={a.invalid("image")} style={{ width: 539, height: 424, background: "var(--mg-red)", flex: "none" }} />
        <div style={{ width: 507, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 0" }}>
          <div>
            <Editable className="t-h2" style={{ color: "#000" }} value={a.v("title")} onChange={(v) => a.set("title", v)} placeholder="Event title" invalid={a.invalid("title")} multiline={false} />
            <Editable className="t-body" style={{ color: "#000", marginTop: 4 }} value={a.v("subtitle")} onChange={(v) => a.set("subtitle", v)} placeholder="Led by [scholar], on …" multiline={false} />
            <Editable className="t-body" style={{ color: "#000", marginTop: 24 }} value={a.v("description")} onChange={(v) => a.set("description", v)} placeholder="One paragraph about the session…" invalid={a.invalid("description")} />
            <div style={{ display: "flex", gap: 40, marginTop: 24, flexWrap: "wrap" }}>
              <Fact label="date">
                <p className="t-h4" style={{ color: "#000" }}>{formatEventDate(a.v("eventDate")) || "—"}</p>
              </Fact>
              <Fact label="time">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="time" value={a.v("startTime")} onChange={(e) => a.set("startTime", e.target.value)} className={a.invalid("startTime") ? "mg-invalid" : ""} style={{ font: "inherit", fontSize: 14, padding: 4, border: "1px solid #ddd", borderRadius: 6 }} />
                  <span>–</span>
                  <input type="time" value={a.v("endTime")} onChange={(e) => a.set("endTime", e.target.value)} className={a.invalid("endTime") ? "mg-invalid" : ""} style={{ font: "inherit", fontSize: 14, padding: 4, border: "1px solid #ddd", borderRadius: 6 }} />
                  <span className="mg-hint">→ {clock(a.v("startTime")) || "?"} - {clock(a.v("endTime")) || "?"}</span>
                </div>
              </Fact>
            </div>
            <div style={{ marginTop: 14 }}>
              <Fact label="Venue">
                <Editable className="t-h4" style={{ color: "#000" }} value={a.v("location")} onChange={(v) => a.set("location", v)} placeholder="Venue / city" multiline={false} />
              </Fact>
            </div>
          </div>
          <ButtonField variant="red" text={a.v("ctaText")} url={a.v("ctaUrl")} onText={(v) => a.set("ctaText", v)} onUrl={(v) => a.set("ctaUrl", v)} textPlaceholder="Know more" urlPlaceholder={`Leave empty → the event's own page (/events/${item.record?.id ?? "…"})`} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- /events list ---------------- */
export function EventsListEditor() {
  return (
    <CollectionSection
      name="events"
      imageField="image"
      keys={EVENT_KEYS}
      designWidth={1272}
      addLabel="Add event"
      titleKey="title"
      pageName="the site"
      newDefaults={{ ctaText: "Know more", bookCtaText: "Book now", startTime: "10:00", endTime: "14:00", format: "OFFLINE", feedback: "[]" }}
      heading={
        <div style={{ textAlign: "center" }}>
          <p className="t-h2 c-ink">Events</p>
          <p className="t-body c-ink" style={{ marginTop: 8, opacity: 0.7 }}>Upcoming / past is decided by the date automatically. Open an event for its detail page, scholars, feedback and gallery.</p>
        </div>
      }
      footerHint={<>Each card is exactly the row visitors see under “Upcoming Events” (past events show as the smaller cards). <b>Open event page</b> edits the detail page, scholars, after-the-event feedback and the event's gallery folder.</>}
      titleOf={(item) => (item.values.title ? `${item.values.title}${item.values.eventDate ? ` · ${formatEventDate(item.values.eventDate)}` : ""}` : undefined)}
      extraActions={(item) =>
        item.record ? (
          <Link href={`/events/${item.record.id}`} className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Open event page →
          </Link>
        ) : (
          <span className="mg-hint">Save first to edit the detail page</span>
        )
      }
      render={(a, item) => <EventOverviewCard a={a} item={item} folder={item.record ? folderKey.event(item.record.id) : "events"} />}
    />
  );
}

/* ---------------- "How These Sessions Work" ---------------- */
export function EventPrinciplesEditor() {
  return (
    <CollectionSection
      name="event-principles"
      keys={["title", "body"]}
      designWidth={403}
      layout="grid3"
      addLabel="Add a column"
      titleKey="title"
      pageName="the site"
      heading={
        <div style={{ textAlign: "center" }}>
          <CopyField k="eventsHowLabel" className="t-body c-red" placeholder="Events" multiline={false} style={{ textAlign: "center" }} />
          <CopyField k="eventsHowTitle" className="t-h1 c-ink" placeholder="How These Sessions Work" style={{ textAlign: "center", marginTop: 4 }} />
        </div>
      }
      footerHint={<>Numbered 01, 02, 03… by Position. Each column: 1 px red rule, Clash 32 number, Clash 22 title, Erode 16 text.</>}
      render={(a, item) => (
        <div style={{ width: 403, borderTop: "1px solid var(--mg-red)", paddingTop: 32 }}>
          <p style={{ fontFamily: "var(--mg-clash)", fontSize: 32, lineHeight: "39.4px", color: "var(--mg-red)" }}>{String((item.record?.order ?? 0) + 1).padStart(2, "0")}</p>
          <Editable className="t-h4 c-ink" style={{ marginTop: 24 }} value={a.v("title")} onChange={(v) => a.set("title", v)} placeholder="Live Scholar Sessions" invalid={a.invalid("title")} multiline={false} />
          <Editable className="t-body c-ink" style={{ marginTop: 24 }} value={a.v("body")} onChange={(v) => a.set("body", v)} placeholder="What this kind of session is…" invalid={a.invalid("body")} />
        </div>
      )}
    />
  );
}

/* ---------------- page copy: hero, bars, enquire ---------------- */
const EVENT_LINKS: typeof LINK_ITEMS = [
  { key: "eventsCalendar", section: "Upcoming Events bar", where: "Outlined button next to “Upcoming Events” — leave the text empty to hide it", variant: "cream", defaults: { text: "Open Calendar", url: "" } },
  { key: "eventsEnquireCta", section: "Begin Your Maarga", where: "Red button above the footer of the Events page and each event page", variant: "red", defaults: { text: "Enquire Now", url: "/contact" } },
];

export function EventsCopyEditor() {
  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SettingImage k="eventsHeroImage" title="Hero photo" hint="1512 × 657, darkened 30 % on the site so the cream copy reads." width={1512} aspect="1512 / 657" />
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>Hero copy</strong></div>
        <div className="mg-preview mg" style={{ background: "#272727", textAlign: "center" }}>
          <div style={{ maxWidth: 835, margin: "0 auto" }}>
            <CopyField k="eventsHeroLabel" className="t-body c-cream" placeholder="EVENTS" multiline={false} style={{ textAlign: "center", textTransform: "uppercase" }} light />
            <CopyField k="eventsHeroTitle" className="t-h1 c-cream" placeholder="Not every question needs a journey to answer it." style={{ textAlign: "center", marginTop: 13 }} light />
          </div>
        </div>
      </div>
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>Section titles</strong><span className="mg-hint">Upcoming / Past bars, the detail-page headings, and the message shown when nothing is scheduled</span></div>
        <div className="mg-preview mg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <CopyField k="eventsUpcomingTitle" className="t-h2 c-ink" placeholder="Upcoming Events" multiline={false} />
          <CopyField k="eventsPastTitle" className="t-h2 c-ink" placeholder="Past Events" multiline={false} />
          <CopyField k="eventsLedByTitle" className="t-h2 c-ink" placeholder="Led by our Intellects" multiline={false} />
          <CopyField k="eventsWhoTitle" className="t-h2 c-ink" placeholder="Who is this for" multiline={false} />
          <CopyField k="eventsPostTitle" className="t-h2 c-ink" placeholder="Post event" multiline={false} />
          <CopyField k="eventsGalleryTitle" className="t-h2 c-ink" placeholder="Gallery" multiline={false} />
          <div style={{ gridColumn: "1 / -1" }}>
            <CopyField k="eventsNoUpcoming" className="t-body c-ink" placeholder="No sessions are scheduled right now — the next ones are announced here first." />
          </div>
        </div>
      </div>
      <div className="mg-item">
        <div className="mg-item-bar"><strong style={{ color: "#222" }}>Begin Your Maarga (Events)</strong></div>
        <div className="mg-preview mg" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            <CopyField k="eventsEnquireLabel" className="t-body c-red" placeholder="Enquire" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="eventsEnquireTitle" className="t-h2 c-ink" placeholder="Begin Your Maarga" multiline={false} style={{ textAlign: "center" }} />
            <CopyField k="eventsEnquireText" className="t-body c-ink" placeholder="You've read the fragments…" style={{ textAlign: "center", marginTop: 24 }} />
          </div>
        </div>
      </div>
      {EVENT_LINKS.map((it) => (
        <LinkSettingEditor key={it.key} item={it} />
      ))}
    </section>
  );
}

/* ---------------- single event: detail page editor ---------------- */
type Feedback = { quote: string; name: string; role: string };
const parseFeedback = (s: string): Feedback[] => {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v.map((f) => ({ quote: str(f.quote), name: str(f.name), role: str(f.role) })) : [];
  } catch {
    return [];
  }
};

export function EventDetailEditor({ id }: { id: string }) {
  const toValues = useCallback((r: CmsRecord) => Object.fromEntries(EVENT_KEYS.map((k) => [k, k === "feedback" ? JSON.stringify(r.feedback ?? []) : str(r[k])])), []);
  const col = useCollection("events", "image", toValues);
  const item = col.items.find((x) => x.id === id);
  useEffect(() => {
    if (item?.record && typeof document !== "undefined") document.title = `${str(item.record.title)} — Maarga CMS`;
  }, [item?.record]);
  if (col.loading) return <p className="mg-hint">Loading…</p>;
  if (col.loadError) return <ConnectionHelp message={col.loadError} onRetry={col.reload} />;
  if (!item) return <p className="mg-hint">Event not found.</p>;
  const a: RenderApi = {
    v: (k) => item.values[k] ?? "",
    set: (k, v) => col.setValue(item.id, k, v),
    invalid: (k) => item.missing.includes(k),
    file: item.file,
    setFile: (f) => col.setFile(item.id, f),
    imageSrc: item.values.image || null,
    profiles: col.profiles,
    pickImage: (u) => col.setImageUrl(item.id, u),
  };
  const folder = folderKey.event(id);
  const feedback = parseFeedback(a.v("feedback"));
  const setFeedback = (l: Feedback[]) => a.set("feedback", JSON.stringify(l));
  const past = isPastDate(a.v("eventDate"));
  const early = a.v("earlyBirdEnabled") === "true";
  const paragraphs = (a.v("body") || "").split(/\n\s*\n/).filter(Boolean);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return (
    <section className="mg" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ItemFrame
        item={item}
        index={0}
        count={1}
        title={`${a.v("title") || "Event"}${a.v("eventDate") ? ` · ${formatEventDate(a.v("eventDate"))}` : ""}`}
        pageName="the site"
        onSaveDraft={() => col.save(item.id, "draft")}
        onPublish={() => col.save(item.id, "publish")}
        onToggle={(v) => col.toggle(item.id, v)}
        onDelete={() => col.remove(item.id).then(() => (window.location.href = "/events"))}
        onMove={() => {}}
        onDiscard={() => col.discard(item.id)}
        extraActions={
          <a href={`${site}/events/${id}`} target="_blank" rel="noreferrer" className="mg-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Live ↗
          </a>
        }
      >
        <ScaledFrame designWidth={1272}>
          <div style={{ width: 1272 }}>
            <p className="mg-hint" style={{ marginBottom: 10 }}>Overview row (what visitors see on /events) — the same fields as in the Events list.</p>
            <EventOverviewCard a={a} item={item} folder={folder} />
            <hr style={{ border: 0, borderTop: "1px dashed #ddd", margin: "40px 0" }} />
            <p className="mg-hint" style={{ marginBottom: 10 }}>Event page (/events/…): 1272×502 photo (same photo), title, paragraphs, sidebar with date / time / location / price, “Book now”.</p>
            <div style={{ display: "grid", gridTemplateColumns: "903px 299px", justifyContent: "space-between", gap: 70 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 47 }}>
                <div>
                  <p className="t-h2" style={{ color: "#000" }}>{a.v("title") || "Event title"}</p>
                  <Editable className="t-body" style={{ color: "#000", marginTop: 14 }} value={a.v("body")} onChange={(v) => a.set("body", v)} placeholder="The long description shown on the event page. Leave an empty line between paragraphs." />
                  {paragraphs.length > 1 && <p className="mg-hint">{paragraphs.length} paragraphs</p>}
                </div>
                <div>
                  <p className="t-h2 c-ink">Who is this for</p>
                  <Editable className="t-body" style={{ color: "#000", marginTop: 14 }} value={a.v("whoIsThisFor")} onChange={(v) => a.set("whoIsThisFor", v)} placeholder="Who should come — leave empty to hide the section." />
                </div>
              </div>
              <aside style={{ borderLeft: "1px solid var(--mg-red)", padding: "24px 0 24px 36px", display: "flex", flexDirection: "column", gap: 24 }}>
                <Fact label="date"><p className="t-h2" style={{ color: "#000" }}>{formatEventDate(a.v("eventDate")) || "—"}</p></Fact>
                <Fact label="time"><p className="t-h2" style={{ color: "#000" }}>{clock(a.v("startTime"))} - {clock(a.v("endTime"))}</p></Fact>
                <Fact label="location"><p className="t-h2" style={{ color: "#000" }}>{a.v("location") || "—"}</p></Fact>
                <label className="mg-field">
                  Format
                  <select value={a.v("format") || "OFFLINE"} onChange={(e) => a.set("format", e.target.value)}>
                    <option value="OFFLINE">In person</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </label>
                {a.v("format") === "ONLINE" && (
                  <label className="mg-field">
                    Meeting link (sent after booking; not shown publicly)
                    <input value={a.v("meetingLink")} onChange={(e) => a.set("meetingLink", e.target.value)} placeholder="https://…" />
                  </label>
                )}
                <label className="mg-field">
                  Ticket price (per person, shown when early bird is off)
                  <input type="number" value={a.v("standardTicketPrice")} onChange={(e) => a.set("standardTicketPrice", e.target.value)} placeholder="2400" />
                </label>
                <label className="mg-check" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={early} onChange={(e) => a.set("earlyBirdEnabled", e.target.checked ? "true" : "false")} /> Early bird price on
                </label>
                {early && (
                  <>
                    <Fact label="early bird">
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <input type="number" value={a.v("earlyBirdPrice")} onChange={(e) => a.set("earlyBirdPrice", e.target.value)} placeholder="1800" className="t-h2" style={{ width: 120, border: "1px dashed #ccc", borderRadius: 6, padding: "2px 6px", color: "#000" }} />
                        <span className="t-h2" style={{ color: "#000" }}>/person</span>
                      </div>
                      <Editable className="t-small c-ink" value={a.v("earlyBirdNote")} onChange={(v) => a.set("earlyBirdNote", v)} placeholder="*offer till 24th July" multiline={false} />
                    </Fact>
                  </>
                )}
                <ButtonField variant="red" optional text={a.v("bookCtaText")} url={a.v("bookUrl")} onText={(v) => a.set("bookCtaText", v)} onUrl={(v) => a.set("bookUrl", v)} textPlaceholder="Book now" hint={past ? "Hidden automatically once the date has passed." : "Leave the label empty to hide the button."} />
              </aside>
            </div>
            <hr style={{ border: 0, borderTop: "1px dashed #ddd", margin: "40px 0" }} />
            <p className="mg-hint" style={{ marginBottom: 10 }}>
              After the event — shown automatically once the date has passed{past ? " (this event is in the past)" : ""}: a short text, attendee feedback cards (538×313, red outline, quote mark) and the event's gallery folder.
            </p>
            <Editable className="t-body" style={{ color: "#000", maxWidth: 903 }} value={a.v("postEventText")} onChange={(v) => a.set("postEventText", v)} placeholder="A few lines about how the session went…" />
            <div style={{ display: "flex", gap: 24, marginTop: 40, overflowX: "auto", paddingBottom: 8 }}>
              {feedback.map((f, i) => (
                <div key={i} style={{ width: 538, flex: "none", border: "1px solid var(--mg-red)", background: "#fff", padding: "30px 36px 40px", position: "relative" }}>
                  <img src="/figma/quote.svg" alt="" width={30} height={31} />
                  <Editable className="t-body c-ink" style={{ marginTop: 8 }} value={f.quote} onChange={(v) => setFeedback(feedback.map((x, j) => (j === i ? { ...x, quote: v } : x)))} placeholder="What the attendee said…" />
                  <Editable className="t-h4 c-ink" style={{ marginTop: 25 }} value={f.name} onChange={(v) => setFeedback(feedback.map((x, j) => (j === i ? { ...x, name: v } : x)))} placeholder="Name" multiline={false} />
                  <Editable className="t-small c-ink" value={f.role} onChange={(v) => setFeedback(feedback.map((x, j) => (j === i ? { ...x, role: v } : x)))} placeholder="Role, company" multiline={false} />
                  <button type="button" className="mg-btn danger icon" style={{ position: "absolute", top: 8, right: 8 }} title="Remove this feedback" onClick={() => setFeedback(feedback.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="mg-btn" style={{ height: 60, alignSelf: "center", flex: "none" }} onClick={() => setFeedback([...feedback, { quote: "", name: "", role: "" }])}>
                + Add feedback
              </button>
            </div>
          </div>
        </ScaledFrame>
      </ItemFrame>
      <p className="mg-hint">
        Everything above saves together with <b>Save as draft</b> / <b>Publish</b>. Scholars and the gallery below save on their own.
      </p>
    </section>
  );
}

export function EventScholarsEditor({ id }: { id: string }) {
  return (
    <PlacementEditor
      page={`event:${id}`}
      collection={`event-intellects?page=event:${id}` as CollectionName}
      pageLabel="this event"
      folder="intellects"
      heading={
        <div style={{ textAlign: "center" }}>
          <CopyField k="eventsLedByTitle" className="t-h2 c-ink" placeholder="Led by our Intellects" multiline={false} style={{ textAlign: "center" }} />
        </div>
      }
    />
  );
}

export function EventGalleryEditor({ id }: { id: string }) {
  const lib = useMediaFolders();
  return <MediaFolderView folder={folderKey.event(id)} folders={lib.folders} onChanged={lib.reload} />;
}
