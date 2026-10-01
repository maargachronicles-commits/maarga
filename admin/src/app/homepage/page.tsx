"use client";

import { useCallback, useEffect, useState } from "react";
import "./homepage-editor.css";
import {
  ConnectionHelp,
  DestinationsEditor,
  EventsEditor,
  GalleryEditor,
  IntellectsEditor,
  LinksEditor,
  SettingsEditor,
  TestimonialsEditor,
  TripsEditor,
} from "@/components/homepage/sections";
import { API_URL } from "@/lib/homepageApi";

/**
 * Homepage editor. Each tab shows a CMS-driven section of the live homepage
 * in its real design (same fonts, sizes, colours, buttons). The client edits
 * the text/images in place, toggles "Show on homepage", chooses the position
 * of every card, and saves either as a Draft (anything goes) or Publishes
 * (all required fields). The public site reads the same API.
 */
const TABS = [
  { id: "trips", label: "Trips", hint: "“What Trips Are We Organising Now” cards", el: <TripsEditor /> },
  { id: "events", label: "Knowledge Sessions", hint: "“Events” cards", el: <EventsEditor /> },
  { id: "intellects", label: "Intellects", hint: "Profile cards under the India map — this is the Intellects library (same as sidebar → Intellects); the About and Experience pages pick from it", el: <IntellectsEditor /> },
  { id: "destinations", label: "Destinations", hint: "“Where all we take you” row", el: <DestinationsEditor /> },
  { id: "testimonials", label: "Testimonials", hint: "“What Our Travellers Say” cards", el: <TestimonialsEditor /> },
  { id: "gallery", label: "Gallery", hint: "Image grid", el: <GalleryEditor /> },
  { id: "links", label: "Buttons & links", hint: "Section buttons: what they say and where they go", el: <LinksEditor /> },
  { id: "media", label: "Hero video & festival", hint: "Hero background video and the festival photo / video", el: <SettingsEditor /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Health {
  ok: boolean;
  store?: string;
  storeDetail?: string;
  uploads?: string;
}

export default function HomepageEditorPage() {
  const [tab, setTab] = useState<TabId>("trips");
  const [health, setHealth] = useState<Health | null>(null);

  const check = useCallback(() => {
    setHealth(null);
    fetch(`${API_URL}/api/health`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        setHealth({ ok: r.ok, store: j.store, storeDetail: j.storeDetail, uploads: j.uploads });
      })
      .catch(() => setHealth({ ok: false }));
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const saved = window.location.hash.replace("#", "") as TabId;
      if (TABS.some((t) => t.id === saved)) setTab(saved);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    check();
    const t = setInterval(check, 15000);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      clearInterval(t);
    };
  }, [check]);

  const current = TABS.find((t) => t.id === tab)!;
  const status =
    health === null
      ? { color: "#ccc", text: "Checking API…" }
      : health.ok
        ? { color: "#1d6b32", text: `Connected · ${health.store === "postgres" ? "Postgres" : "local file store"}${health.uploads === "local" ? " · uploads on disk" : ""}` }
        : { color: "#c0392b", text: `API unreachable at ${API_URL}` };

  return (
    <div className="mg-page">
      <header className="mg-page-head">
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#8a8a8a", margin: 0 }}>Website</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "6px 0 0", letterSpacing: "-.02em" }}>Homepage</h1>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 13, maxWidth: 720 }}>
            Everything below is shown exactly as it appears on the homepage. Click text, buttons or images to change them, pick each card&apos;s{" "}
            <b>Position</b>, then <b>Save as draft</b> (incomplete is fine) or <b>Publish</b> (all required fields). Items switched off with{" "}
            <b>Show on homepage</b> stay saved but are not shown.
          </p>
        </div>
        <div className="mg-page-status">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.color, display: "inline-block", flex: "none" }} />
          <span title={health?.storeDetail}>{status.text}</span>
          {health && !health.ok && (
            <button type="button" className="mg-btn" style={{ height: 26, padding: "0 8px" }} onClick={check}>
              Retry
            </button>
          )}
          <a href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} target="_blank" rel="noreferrer" style={{ color: "#a62f20", fontWeight: 500 }}>
            Open live site ↗
          </a>
        </div>
      </header>

      {health && !health.ok && (
        <div style={{ marginTop: 18 }}>
          <ConnectionHelp message={`Failed to fetch ${API_URL}`} onRetry={check} />
        </div>
      )}

      <nav className="mg-tabs" aria-label="Homepage sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mg-tab ${t.id === tab ? "active" : ""}`}
            onClick={() => {
              setTab(t.id);
              window.location.hash = t.id;
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <p style={{ margin: "14px 0 18px", fontSize: 12, color: "#8a8a8a" }}>{current.hint}</p>

      <div key={tab}>{current.el}</div>
    </div>
  );
}
