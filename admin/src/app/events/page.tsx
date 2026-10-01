"use client";

import "../homepage/homepage-editor.css";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { EventPrinciplesEditor, EventsCopyEditor, EventsListEditor } from "@/components/homepage/eventSections";

const TABS = [
  { id: "events", label: "Events", hint: "Every event as the row visitors see on /events. Date decides Upcoming vs Past. Open an event for its own page.", el: <EventsListEditor /> },
  { id: "how", label: "How These Sessions Work", hint: "The three numbered columns under the upcoming events", el: <EventPrinciplesEditor /> },
  { id: "copy", label: "Hero, titles & links", hint: "Hero photo and line, section titles, Open Calendar link, Begin Your Maarga", el: <EventsCopyEditor /> },
];

export default function EventsAdminPage() {
  return (
    <PageEditorShell
      title="Events"
      path="/events"
      tabs={TABS}
      intro={
        <>
          The Events page and every event's own page. Add an event, fill the row, <b>Publish</b> — it appears under Upcoming until its date passes, then moves to Past Events and its page
          shows the after-the-event section (feedback + gallery). Homepage “Knowledge Sessions” cards are the same events (Homepage → Knowledge Sessions).
        </>
      }
    />
  );
}
