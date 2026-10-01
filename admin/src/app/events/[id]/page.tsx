"use client";

import "../../homepage/homepage-editor.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { EventDetailEditor, EventGalleryEditor, EventScholarsEditor } from "@/components/homepage/eventSections";

export default function EventAdminPage() {
  const { id } = useParams<{ id: string }>();
  const tabs = useMemo(
    () => [
      { id: "page", label: "Event page", hint: "Overview row + the detail page: paragraphs, who it is for, price / early bird, Book now, after-the-event text and feedback", el: <EventDetailEditor id={id} /> },
      { id: "scholars", label: "Intellects", hint: "“Led by our Intellects” — profiles from the library, adjustable for this event only", el: <EventScholarsEditor id={id} /> },
      { id: "gallery", label: "Gallery folder", hint: "Photos from the event. “Event gallery” shows a photo on the event page once the date has passed; “Gallery Bank” on the public Gallery page.", el: <EventGalleryEditor id={id} /> },
    ],
    [id]
  );
  return (
    <PageEditorShell
      title="Event"
      path={`/events/${id}`}
      tabs={tabs}
      intro={
        <>
          <Link href="/events" style={{ color: "#a62f20" }}>
            ← All events
          </Link>
          {" · "}Everything visitors see on this event's page.
        </>
      }
    />
  );
}
