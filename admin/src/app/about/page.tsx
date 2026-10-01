"use client";

import "../homepage/homepage-editor.css";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { AboutGalleryEditor, AboutLinksEditor, FoundersEditor, ManifestoEditor } from "@/components/homepage/sections";
import { AboutIntellectsEditor } from "@/components/homepage/experienceSections";

/**
 * About page editor — same live-preview approach as the homepage editor:
 * every editable part is shown in its real design; click to change, then
 * Save as draft / Publish.
 */
const TABS = [
  { id: "manifesto", label: "Manifesto cards", hint: "“A New Paradigm of Living Wisdom” — three cards, each with a photo that appears on hover", el: <ManifestoEditor /> },
  { id: "founders", label: "Founders", hint: "“The Founders” cards on the red section", el: <FoundersEditor /> },
  { id: "intellects", label: "Intellects", hint: "“The Reason the Journey Becomes an Education” — which scholars appear here, from the Intellects library, with page-only edits", el: <AboutIntellectsEditor /> },
  { id: "gallery", label: "Why Maarga photos", hint: "The seven photos of “Not Archival. Alive.”", el: <AboutGalleryEditor /> },
  { id: "links", label: "Buttons & links", hint: "Buttons that live on the About page", el: <AboutLinksEditor /> },
];

export default function AboutEditorPage() {
  return (
    <PageEditorShell
      title="About page"
      path="/about"
      tabs={TABS}
      intro={
        <>
          Everything below is shown exactly as it appears on the About page. Click text or images to change them, then <b>Save as draft</b> or <b>Publish</b>.
          Scholar profiles themselves live in the <a href="/admin/intellects" style={{ color: "#a62f20" }}>Intellects</a> library; here you choose which ones appear and can adjust them for this page only.
        </>
      }
    />
  );
}
