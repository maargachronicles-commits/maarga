"use client";

import "../homepage/homepage-editor.css";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { ExperienceHeroEditor, ExperienceIntellectsEditor, ExperienceLinksEditor, FragmentsEditor, QuestionsEditor, SitesEditor } from "@/components/homepage/experienceSections";

/**
 * Experience page editor — every part of /experience shown in its real
 * design; click to change, Save as draft / Publish.
 */
const TABS = [
  { id: "hero", label: "Hero & copy", hint: "Hero photo, “Hampi, Karnataka”, Overview and “What You've Been Told”", el: <ExperienceHeroEditor /> },
  { id: "sites", label: "Two Lenses (sites)", hint: "The numbered sketches with Engineering / Cosmology copy and the clickable figure", el: <SitesEditor /> },
  { id: "fragments", label: "Fragments", hint: "The red band visitors scroll through", el: <FragmentsEditor /> },
  { id: "intellects", label: "Intellects", hint: "Which scholars appear on this page — from the Intellects library, with page-only edits", el: <ExperienceIntellectsEditor /> },
  { id: "questions", label: "Questions", hint: "“Questions Hampi Still Asks”", el: <QuestionsEditor /> },
  { id: "links", label: "Enquire, tabs & links", hint: "Begin Your Maarga copy, the red button and the three tabs under the hero", el: <ExperienceLinksEditor /> },
];

export default function ExperienceEditorPage() {
  return (
    <PageEditorShell
      title="Experience page"
      path="/experience"
      tabs={TABS}
      intro={
        <>
          Everything below is shown exactly as it appears on the Experience page. Click text or images to change them, then <b>Save as draft</b> or <b>Publish</b>.
          Scholars are picked from the <a href="/admin/intellects" style={{ color: "#a62f20" }}>Intellects</a> library and can be adjusted for this page only.
        </>
      }
    />
  );
}
