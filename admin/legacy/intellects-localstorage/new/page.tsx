"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useState,
} from "react";

import {
  createId,
  getScholars,
  saveScholars,
  Scholar,
} from "@/lib/cmsStore";

export default function NewScholarPage() {
  const [visibility, setVisibility] =
    useState<
      "Founder / Core Scholar" |
      "Network Scholar"
    >("Founder / Core Scholar");

  const [highlights, setHighlights] =
    useState<string[]>([""]);

  const [tags, setTags] =
    useState<string[]>([]);

  const [tagInput, setTagInput] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [credential, setCredential] =
    useState("");

  const [biography, setBiography] =
    useState("");

  const [portraitPreview, setPortraitPreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const addHighlight = () => {
    setHighlights((current) => [
      ...current,
      "",
    ]);
  };

  const updateHighlight = (
    index: number,
    value: string
  ) => {
    setHighlights((current) =>
      current.map((item, i) =>
        i === index
          ? value
          : item
      )
    );
  };

  const removeHighlight = (
    index: number
  ) => {
    setHighlights((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const addTag = () => {
    const value =
      tagInput.trim();

    if (!value) {
      return;
    }

    if (!tags.includes(value)) {
      setTags((current) => [
        ...current,
        value,
      ]);
    }

    setTagInput("");
  };

  const removeTag = (
    tag: string
  ) => {
    setTags((current) =>
      current.filter(
        (item) => item !== tag
      )
    );
  };

  const handlePortraitChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setPortraitPreview(
          reader.result
        );
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSaveScholar = (
    status: "Published" | "Draft"
  ) => {
    if (!fullName.trim()) {
      alert(
        "Please enter the scholar's full name."
      );
      return;
    }

    if (!credential.trim()) {
      alert(
        "Please enter the scholar's credential."
      );
      return;
    }

    setSaving(true);

    const scholar: Scholar = {
      id: createId("SCH"),

      name:
        fullName.trim(),

      credential:
        credential.trim(),

      group:
        visibility ===
        "Network Scholar"
          ? "Network Scholar"
          : "Founder / Core Scholar",

      status,

      showOnWebsite: true,

      biography:
        biography.trim(),

      highlights:
        highlights
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      tags,

      portrait:
        portraitPreview,
    };

    const existing =
      getScholars();

    saveScholars([
      ...existing,
      scholar,
    ]);

    window.location.href =
      "/intellects";
  };

  return (
    <main className="min-h-screen bg-[#FFFDFA] px-[40px] py-[30px]">

      <div className="flex items-start justify-between">

        <div>

          <p className="font-serif text-[9px] text-[#9A938C]">
            Intellects &gt; Add Scholar
          </p>

          <h1 className="mt-[4px] font-serif text-[25px] font-semibold text-[#292929]">
            Add New Scholar
          </h1>

        </div>

        <div className="flex gap-[10px]">

          <Link
            href="/intellects"
            className="rounded-[5px] border border-[#DED8D2] bg-white px-[15px] py-[9px] text-[10px] text-[#555]"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleSaveScholar("Draft")
            }
            className="rounded-[5px] border border-[#DED8D2] bg-white px-[15px] py-[9px] text-[10px] text-[#555] disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleSaveScholar(
                "Published"
              )
            }
            className="rounded-[5px] bg-[#9F191C] px-[15px] py-[9px] text-[10px] text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Publish Scholar"}
          </button>

        </div>

      </div>


      <div className="mt-[20px] grid grid-cols-[1fr_213px] gap-[17px]">

        <div className="space-y-[14px]">

          {/* PORTRAIT */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Portrait
            </h2>

            <div className="mt-[12px] flex items-center gap-[14px]">

              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5B483D] font-serif text-[12px] text-white">

                {portraitPreview ? (
                  <img
                    src={portraitPreview}
                    alt="Portrait preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "?"
                )}

              </div>

              <label className="flex h-[48px] flex-1 cursor-pointer items-center justify-center rounded-[7px] border border-dashed border-[#DDD6D0]">

                <div className="text-center">

                  <p className="text-[10px] font-medium text-[#9F191C]">
                    Upload a file
                  </p>

                  <p className="mt-[3px] text-[7px] text-[#99928B]">
                    Recommended: 400×400px
                    (PNG, JPG)
                  </p>

                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={
                    handlePortraitChange
                  }
                  className="hidden"
                />

              </label>

            </div>

          </section>


          {/* BASIC */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Basic Information
            </h2>

            <div className="mt-[13px] space-y-[12px]">

              <label className="block">

                <span className="text-[8px] text-[#555]">
                  Full Name
                </span>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="Dr. Shreenand R. Bhat"
                  className="mt-[5px] h-[27px] w-full rounded-[4px] border border-[#DED8D2] bg-white px-[9px] text-[9px] text-[#292929] caret-[#292929] outline-none focus:border-[#9F191C]"
                />

              </label>

              <label className="block">

                <span className="text-[8px] text-[#555]">
                  Title / Credential Headline
                </span>

                <input
                  type="text"
                  value={credential}
                  onChange={(event) =>
                    setCredential(
                      event.target.value
                    )
                  }
                  placeholder="Ph.D. in Epigraphy and Art History"
                  className="mt-[5px] h-[27px] w-full rounded-[4px] border border-[#DED8D2] bg-white px-[9px] text-[9px] text-[#292929] caret-[#292929] outline-none focus:border-[#9F191C]"
                />

              </label>

              <div>

                <span className="text-[8px] text-[#555]">
                  Visibility / Listing Group
                </span>

                <div className="mt-[7px] flex gap-[18px]">

                  <label className="flex items-center gap-[5px] text-[8px] text-[#555]">

                    <input
                      type="radio"
                      name="visibility"
                      checked={
                        visibility ===
                        "Founder / Core Scholar"
                      }
                      onChange={() =>
                        setVisibility(
                          "Founder / Core Scholar"
                        )
                      }
                      className="accent-[#9F191C]"
                    />

                    Founder / Core Scholar

                  </label>

                  <label className="flex items-center gap-[5px] text-[8px] text-[#555]">

                    <input
                      type="radio"
                      name="visibility"
                      checked={
                        visibility ===
                        "Network Scholar"
                      }
                      onChange={() =>
                        setVisibility(
                          "Network Scholar"
                        )
                      }
                      className="accent-[#9F191C]"
                    />

                    Network Scholar

                  </label>

                </div>

              </div>

            </div>

          </section>


          {/* BIOGRAPHY */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Biography
            </h2>

            <textarea
              value={biography}
              onChange={(event) =>
                setBiography(
                  event.target.value
                )
              }
              placeholder="Write the scholar biography..."
              className="mt-[10px] h-[65px] w-full resize-none rounded-[4px] border border-[#DED8D2] px-[9px] py-[8px] text-[9px] leading-[1.5] text-[#292929] outline-none focus:border-[#9F191C]"
            />

          </section>


          {/* HIGHLIGHTS */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Credential Highlights
            </h2>

            <div className="mt-[10px] space-y-[7px]">

              {highlights.map(
                (
                  highlight,
                  index
                ) => (

                  <div
                    key={index}
                    className="flex items-center gap-[8px]"
                  >

                    <span className="text-[9px] text-[#999]">
                      ⠿
                    </span>

                    <input
                      value={highlight}
                      onChange={(event) =>
                        updateHighlight(
                          index,
                          event.target.value
                        )
                      }
                      placeholder="Add credential highlight..."
                      className="h-[24px] flex-1 border-b border-[#EEE9E4] bg-transparent text-[9px] text-[#292929] outline-none"
                    />

                    {highlights.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeHighlight(
                            index
                          )
                        }
                        className="text-[10px] text-[#777]"
                      >
                        ⊗
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

            <button
              type="button"
              onClick={
                addHighlight
              }
              className="mt-[10px] text-[9px] text-[#9F191C]"
            >
              + Add Another Point
            </button>

          </section>


          {/* TAGS */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Specialisation Tags
            </h2>

            <div className="mt-[10px] flex min-h-[28px] flex-wrap items-center gap-[5px] rounded-[4px] border border-[#DED8D2] px-[7px] py-[4px]">

              {tags.map((tag) => (

                <span
                  key={tag}
                  className="flex items-center gap-[4px] rounded-[3px] bg-[#FCEDEC] px-[7px] py-[4px] text-[7px] text-[#9F191C]"
                >

                  {tag}

                  <button
                    type="button"
                    onClick={() =>
                      removeTag(tag)
                    }
                    className="text-[8px]"
                  >
                    ×
                  </button>

                </span>

              ))}

              <input
                value={tagInput}
                onChange={(event) =>
                  setTagInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="Add tag..."
                className="min-w-[80px] flex-1 text-[8px] text-[#292929] outline-none"
              />

            </div>

          </section>


          {/* LINKED CONTENT */}

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Linked Content
            </h2>

            <div className="mt-[10px] rounded-[4px] border border-dashed border-[#DED8D2] p-[12px]">

              <p className="text-[8px] leading-[1.5] text-[#99928B]">
                Linked destinations and
                events will appear here
                automatically once this
                scholar is connected to them.
              </p>

              <p className="mt-[7px] text-[8px] text-[#9F191C]">
                No linked content yet.
              </p>

            </div>

          </section>

        </div>


        {/* RIGHT */}

        <aside>

          <section className="rounded-[9px] border border-[#E5DFD9] bg-white p-[16px]">

            <h2 className="text-[11px] font-semibold text-[#292929]">
              Publishing settings
            </h2>

            <div className="mt-[15px] space-y-[11px]">

              <div className="flex justify-between text-[8px]">

                <span className="text-[#8C8781]">
                  Status
                </span>

                <span className="rounded-[3px] bg-[#E7F4E7] px-[6px] py-[3px] text-[7px] text-[#32813A]">
                  Ready
                </span>

              </div>

              <div className="flex justify-between text-[8px]">

                <span className="text-[#8C8781]">
                  Listing Group
                </span>

                <span className="text-[#555]">
                  {visibility ===
                  "Founder / Core Scholar"
                    ? "Core"
                    : "Network"}
                </span>

              </div>

              <div className="flex justify-between text-[8px]">

                <span className="text-[#8C8781]">
                  Website
                </span>

                <span className="text-[#555]">
                  Visible
                </span>

              </div>

              <div className="flex justify-between text-[8px]">

                <span className="text-[#8C8781]">
                  Created
                </span>

                <span className="text-[#555]">
                  —
                </span>

              </div>

              <div className="flex justify-between text-[8px]">

                <span className="text-[#8C8781]">
                  Last modified
                </span>

                <span className="text-[#555]">
                  —
                </span>

              </div>

            </div>

            <div className="mt-[17px] space-y-[7px]">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  handleSaveScholar(
                    "Published"
                  )
                }
                className="h-[28px] w-full rounded-[4px] bg-[#9F191C] text-[9px] text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Publish Scholar"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  handleSaveScholar(
                    "Draft"
                  )
                }
                className="h-[28px] w-full rounded-[4px] border border-[#9F191C] bg-white text-[9px] text-[#9F191C] disabled:opacity-50"
              >
                Keep Draft
              </button>

            </div>

          </section>

        </aside>

      </div>

    </main>
  );
}