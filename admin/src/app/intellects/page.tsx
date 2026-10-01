"use client";

import "../homepage/homepage-editor.css";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { IntellectsEditor } from "@/components/homepage/sections";

/**
 * Intellects library — one profile per scholar (photo, name, designation,
 * description, optional link). The homepage lists these directly ("Show on
 * homepage" toggle); the About and Experience pages pick from this library
 * and may adjust a profile for their own page without changing it here.
 */
const TABS = [{ id: "profiles", label: "Profiles", hint: "Add, edit and order the scholar profiles. “Show on homepage” controls the homepage row only.", el: <IntellectsEditor /> }];

export default function IntellectsLibraryPage() {
  return (
    <PageEditorShell
      title="Intellects"
      path="/#intellects"
      tabs={TABS}
      intro={
        <>
          The library of scholar profiles. Each profile can be placed on the <a href="/admin/about#intellects" style={{ color: "#a62f20" }}>About page</a> and the{" "}
          <a href="/admin/experience#intellects" style={{ color: "#a62f20" }}>Experience page</a> from a dropdown; edits made there stay on that page — the profile here is the
          default everywhere else.
        </>
      }
    />
  );
}
