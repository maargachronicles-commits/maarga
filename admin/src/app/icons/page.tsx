"use client";

import "../homepage/homepage-editor.css";
import PageEditorShell from "@/components/homepage/PageEditorShell";
import { CollectionSection } from "@/components/homepage/sections";
import { Editable, ImageField } from "@/components/homepage/editorKit";

/**
 * Icons — the activity-icon library used in itineraries. An icon is any SVG/PNG;
 * on the site it is drawn cream on a 24 px red square (the colour of the file
 * does not matter). Itineraries pick icons from here and may rename/replace an
 * icon for themselves only.
 */
function IconsEditor() {
  return (
    <CollectionSection
      name="icons"
      imageField="url"
      keys={["name", "url"]}
      designWidth={260}
      layout="grid3"
      addLabel="Add icon"
      titleKey="name"
      pageName="the site"
      heading={<p className="t-body c-ink" style={{ textAlign: "center" }}>Activity icons — shown next to each itinerary activity as small red squares.</p>}
      footerHint={<>Upload an SVG (best) or PNG. It is shown cream on red automatically. <b>Show on the site</b> off = kept but not offered in the itinerary builder.</>}
      render={(a) => (
        <div style={{ width: 260, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 72, height: 72, background: "var(--mg-red)", display: "grid", placeItems: "center", flex: "none", borderRadius: 6 }}>
            <ImageField
              src={a.imageSrc}
              file={a.file}
              onFile={a.setFile} onPick={a.pickImage}
              folder="icons"
              accept="image/svg+xml,image/png,image/webp"
              invalid={a.invalid("url")}
              label="Replace"
              style={{ width: 48, height: 48 }}
              render={(url) => <img src={url} alt="" style={{ width: 48, height: 48, objectFit: "contain", filter: "brightness(0) invert(1)" }} />}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Editable className="t-h4 c-ink" value={a.v("name")} onChange={(v) => a.set("name", v)} placeholder="Icon name" invalid={a.invalid("name")} multiline={false} />
            <p className="mg-hint" style={{ marginTop: 4 }}>Shown as a tooltip and in the builder.</p>
          </div>
        </div>
      )}
    />
  );
}

const TABS = [{ id: "icons", label: "Activity icons", hint: "The icons itineraries can attach to an activity (temple, walk, coracle…)", el: <IconsEditor /> }];

export default function IconsPage() {
  return <PageEditorShell title="Icons" path="/destinations" tabs={TABS} intro={<>The library of activity icons. Each itinerary chooses from it and can rename or replace an icon for that itinerary only — the library never changes from there.</>} />;
}
