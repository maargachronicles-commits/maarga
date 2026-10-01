"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ConnectionHelp } from "./sections";
import { API_URL } from "@/lib/homepageApi";

interface Health {
  ok: boolean;
  store?: string;
  storeDetail?: string;
  uploads?: string;
}

export interface EditorTab {
  id: string;
  label: string;
  hint: string;
  el: ReactNode;
}

/**
 * Shared chrome of the live page editors (About / Experience): title, API
 * health, "Open live page", tabs kept in the URL hash.
 */
export default function PageEditorShell({ title, path, tabs, intro }: { title: string; path: string; tabs: EditorTab[]; intro: ReactNode }) {
  const [tab, setTab] = useState(tabs[0].id);
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
      const saved = window.location.hash.replace("#", "");
      if (tabs.some((t) => t.id === saved)) setTab(saved);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    check();
    const t = setInterval(check, 15000);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      clearInterval(t);
    };
  }, [check, tabs]);

  const current = tabs.find((t) => t.id === tab) ?? tabs[0];
  const status =
    health === null
      ? { color: "#ccc", text: "Checking API…" }
      : health.ok
        ? { color: "#1d6b32", text: `Connected · ${health.store === "postgres" ? "Postgres" : "local file store"}${health.uploads === "local" ? " · uploads on disk" : ""}` }
        : { color: "#c0392b", text: `API unreachable at ${API_URL}` };

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return (
    <div className="mg-page">
      <header className="mg-page-head">
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#8a8a8a", margin: 0 }}>Website</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "6px 0 0", letterSpacing: "-.02em" }}>{title}</h1>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 13, maxWidth: 720 }}>{intro}</p>
        </div>
        <div className="mg-page-status">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.color, display: "inline-block", flex: "none" }} />
          <span title={health?.storeDetail}>{status.text}</span>
          {health && !health.ok && (
            <button type="button" className="mg-btn" style={{ height: 26, padding: "0 8px" }} onClick={check}>
              Retry
            </button>
          )}
          <a href={`${site}${path}`} target="_blank" rel="noreferrer" style={{ color: "#a62f20", fontWeight: 500 }}>
            Open live page ↗
          </a>
        </div>
      </header>

      {health && !health.ok && (
        <div style={{ marginTop: 18 }}>
          <ConnectionHelp message={`Failed to fetch ${API_URL}`} onRetry={check} />
        </div>
      )}

      <nav className="mg-tabs" aria-label={`${title} sections`}>
        {tabs.map((t) => (
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

      <div key={current.id}>{current.el}</div>
    </div>
  );
}
