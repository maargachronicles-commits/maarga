"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createId,
  getScholars,
  getEvents,
  saveEvents,
  Scholar,
  EventRecord,
} from "@/lib/cmsStore";

export default function NewEventPage() {
  /*
   * ============================================================
   * SCHOLARS
   * ============================================================
   */

  const [scholars, setScholars] =
    useState<Scholar[]>([]);

  const [scholarsLoading, setScholarsLoading] =
    useState(true);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [date, setDate] = useState("");

  const [duration, setDuration] =
    useState("");

  const [format, setFormat] =
    useState("Online Session");

  const [scholarId, setScholarId] =
    useState("");

  const [attendees, setAttendees] =
    useState("0");

  const [saving, setSaving] =
    useState(false);

  /*
   * ============================================================
   * SEARCHABLE SCHOLAR SELECT
   * ============================================================
   */

  const [scholarSearch, setScholarSearch] =
    useState("");

  const [scholarDropdownOpen, setScholarDropdownOpen] =
    useState(false);

  const scholarDropdownRef =
    useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * LOAD SCHOLARS
   * ============================================================
   */

  useEffect(() => {
    try {
      const publishedScholars =
        getScholars().filter(
          (scholar) =>
            scholar.status === "Published"
        );

      setScholars(publishedScholars);
    } catch (error) {
      console.error(
        "Failed to load scholars:",
        error
      );
    } finally {
      setScholarsLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * CLOSE SCHOLAR DROPDOWN WHEN CLICKING OUTSIDE
   * ============================================================
   */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        scholarDropdownRef.current &&
        !scholarDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setScholarDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * ============================================================
   * SELECTED SCHOLAR
   * ============================================================
   */

  const selectedScholar =
    scholars.find(
      (scholar) =>
        scholar.id === scholarId
    ) || null;

  /*
   * ============================================================
   * FILTER SCHOLARS
   * ============================================================
   */

  const filteredScholars =
    useMemo(() => {
      const query =
        scholarSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return scholars;
      }

      return scholars.filter(
        (scholar) =>
          scholar.name
            .toLowerCase()
            .includes(query) ||
          scholar.credential
            .toLowerCase()
            .includes(query) ||
          scholar.group
            .toLowerCase()
            .includes(query)
      );
    }, [
      scholars,
      scholarSearch,
    ]);

  /*
   * ============================================================
   * SELECT SCHOLAR
   * ============================================================
   */

  const selectScholar = (
    scholar: Scholar
  ) => {
    setScholarId(scholar.id);

    setScholarSearch(
      scholar.name
    );

    setScholarDropdownOpen(false);
  };

  /*
   * ============================================================
   * SAVE EVENT
   * ============================================================
   */

  const handleSave = async (
    status: "DRAFT" | "PUBLISHED"
  ) => {
    if (!title.trim()) {
      alert(
        "Please enter an event title."
      );
      return;
    }

    if (!date) {
      alert(
        "Please select an event date."
      );
      return;
    }

    if (!scholarId) {
      alert(
        "Please select a scholar."
      );
      return;
    }

    const selected =
      scholars.find(
        (scholar) =>
          scholar.id === scholarId
      );

    if (!selected) {
      alert(
        "Please select a valid scholar."
      );
      return;
    }

    setSaving(true);

    try {
      const now =
        new Date().toISOString();

      const event: EventRecord = {
        id: createId("EVT"),

        title: title.trim(),

        description:
          description.trim(),

        date,

        duration:
          duration.trim(),

        format,

        scholarId:
          selected.id,

        attendees:
          Number(attendees) || 0,

        status,

        /*
         * New events are visible by default.
         * Admin can switch this OFF later.
         */
        showOnWebsite: true,

        summary: "",

        testimonialQuote: "",

        testimonialName: "",

        testimonialOrganisation:
          "",

        photos: [],

        createdAt: now,

        updatedAt: now,
      };

      const existingEvents =
        getEvents();

      saveEvents([
        ...existingEvents,
        event,
      ]);

      /*
       * Open the actual event after creation.
       */
      window.location.href =
        `/events/${event.id}/summary`;
    } catch (error) {
      console.error(
        "Failed to create event:",
        error
      );

      alert(
        "Something went wrong while creating the event."
      );

      setSaving(false);
    }
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#F8F5F1] p-10">

      <div className="mx-auto max-w-[1300px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] text-[#777]">
              Events &gt; Create New Event
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Create New Event
            </h1>

            <p className="mt-2 text-[13px] text-[#777]">
              Add the information that will appear
              in the event listing.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href="/events"
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555] transition hover:bg-[#F8F5F1]"
            >
              Cancel
            </Link>


            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave("DRAFT")
              }
              className="rounded-[6px] border border-[#A62F20] bg-white px-5 py-3 text-[11px] text-[#A62F20] transition hover:bg-[#F8F5F1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>


            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave("PUBLISHED")
              }
              className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[11px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Publishing..."
                : "Publish Event"}
            </button>

          </div>

        </div>


        {/* ======================================================
            EVENT DETAILS
        ====================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <h2 className="text-[14px] font-semibold text-[#292725]">
            Event Details
          </h2>


          <div className="mt-6 space-y-5">

            {/* EVENT TITLE */}

            <div>

              <label
                htmlFor="event-title"
                className="text-[10px] font-medium text-[#555]"
              >
                Event Title
              </label>

              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="The Architect of an Empire"
                autoComplete="off"
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
                style={{
                  color: "#292725",
                  WebkitTextFillColor:
                    "#292725",
                }}
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label
                htmlFor="event-description"
                className="text-[10px] font-medium text-[#555]"
              >
                Event Description
              </label>

              <textarea
                id="event-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the event..."
                className="mt-2 min-h-[110px] w-full resize-none rounded-[6px] border border-[#DED8D1] bg-white px-3 py-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
                style={{
                  color: "#292725",
                  WebkitTextFillColor:
                    "#292725",
                }}
              />

            </div>


            {/* DATE + DURATION */}

            <div className="grid grid-cols-2 gap-5">

              <div>

                <label
                  htmlFor="event-date"
                  className="text-[10px] font-medium text-[#555]"
                >
                  Event Date
                </label>

                <input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#A62F20]"
                  style={{
                    color: "#292725",
                    WebkitTextFillColor:
                      "#292725",
                  }}
                />

              </div>


              <div>

                <label
                  htmlFor="event-duration"
                  className="text-[10px] font-medium text-[#555]"
                >
                  Duration
                </label>

                <input
                  id="event-duration"
                  type="text"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value
                    )
                  }
                  placeholder="2 hours"
                  autoComplete="off"
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
                  style={{
                    color: "#292725",
                    WebkitTextFillColor:
                      "#292725",
                  }}
                />

              </div>

            </div>


            {/* FORMAT + ATTENDEES */}

            <div className="grid grid-cols-2 gap-5">

              <div>

                <label
                  htmlFor="event-format"
                  className="text-[10px] font-medium text-[#555]"
                >
                  Format
                </label>

                <select
                  id="event-format"
                  value={format}
                  onChange={(event) =>
                    setFormat(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
                  style={{
                    color: "#292725",
                  }}
                >

                  <option value="Online Session">
                    Online Session
                  </option>

                  <option value="Masterclass">
                    Masterclass
                  </option>

                  <option value="Live Study Session">
                    Live Study Session
                  </option>

                  <option value="Workshop">
                    Workshop
                  </option>

                  <option value="Lecture">
                    Lecture
                  </option>

                </select>

              </div>


              <div>

                <label
                  htmlFor="event-attendees"
                  className="text-[10px] font-medium text-[#555]"
                >
                  Expected Attendees
                </label>

                <input
                  id="event-attendees"
                  type="number"
                  min="0"
                  value={attendees}
                  onChange={(event) =>
                    setAttendees(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#A62F20]"
                  style={{
                    color: "#292725",
                    WebkitTextFillColor:
                      "#292725",
                  }}
                />

              </div>

            </div>


            {/* =================================================
                SEARCHABLE SCHOLAR
                ================================================= */}

            <div
              ref={scholarDropdownRef}
              className="relative"
            >

              <label
                htmlFor="scholar-search"
                className="text-[10px] font-medium text-[#555]"
              >
                Scholar
              </label>


              {/* SEARCH INPUT */}

              <div className="relative mt-2">

                <input
                  id="scholar-search"
                  type="text"
                  value={
                    scholarSearch
                  }
                  onFocus={() =>
                    setScholarDropdownOpen(
                      true
                    )
                  }
                  onChange={(event) => {
                    setScholarSearch(
                      event.target.value
                    );

                    setScholarDropdownOpen(
                      true
                    );

                    /*
                     * If the admin modifies
                     * the search text after
                     * selecting someone, clear
                     * the previous selection.
                     */
                    if (
                      selectedScholar &&
                      event.target.value !==
                        selectedScholar.name
                    ) {
                      setScholarId("");
                    }
                  }}
                  placeholder={
                    scholarsLoading
                      ? "Loading scholars..."
                      : "Search scholar by name or credential..."
                  }
                  disabled={
                    scholarsLoading ||
                    scholars.length === 0
                  }
                  autoComplete="off"
                  className="h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 pr-10 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20] disabled:cursor-not-allowed disabled:bg-[#F8F5F1] disabled:text-[#777]"
                  style={{
                    color: "#292725",
                    WebkitTextFillColor:
                      "#292725",
                  }}
                />


                {/* SEARCH / CLEAR ICON */}

                {scholarSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setScholarSearch("");
                      setScholarId("");
                      setScholarDropdownOpen(
                        true
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-[#999] hover:text-[#A62F20]"
                    aria-label="Clear scholar search"
                  >
                    ×
                  </button>
                )}

              </div>


              {/* SELECTED SCHOLAR */}

              {selectedScholar && (

                <div className="mt-2 flex items-center justify-between rounded-[6px] border border-[#E8D5D2] bg-[#FFF8F7] px-3 py-2">

                  <div>

                    <p className="text-[11px] font-medium text-[#292725]">
                      {selectedScholar.name}
                    </p>

                    <p className="mt-1 text-[9px] text-[#777]">
                      {selectedScholar.credential}
                    </p>

                  </div>

                  <span className="rounded-[4px] bg-[#FCEDEC] px-2 py-1 text-[8px] text-[#A62F20]">
                    {selectedScholar.group}
                  </span>

                </div>

              )}


              {/* DROPDOWN */}

              {scholarDropdownOpen &&
                !scholarsLoading &&
                scholars.length > 0 && (

                  <div className="absolute left-0 right-0 top-[72px] z-50 max-h-[260px] overflow-y-auto rounded-[7px] border border-[#DED8D1] bg-white shadow-xl">

                    {filteredScholars.length === 0 ? (

                      <div className="px-4 py-5 text-center">

                        <p className="text-[11px] text-[#777]">
                          No scholars found.
                        </p>

                        <p className="mt-1 text-[9px] text-[#A09A94]">
                          Try another name or credential.
                        </p>

                      </div>

                    ) : (

                      <div className="py-1">

                        {filteredScholars.map(
                          (scholar) => {

                            const isSelected =
                              scholar.id ===
                              scholarId;

                            return (

                              <button
                                key={
                                  scholar.id
                                }
                                type="button"
                                onClick={() =>
                                  selectScholar(
                                    scholar
                                  )
                                }
                                className={`block w-full px-4 py-3 text-left transition ${
                                  isSelected
                                    ? "bg-[#FFF4F2]"
                                    : "bg-white hover:bg-[#F8F5F1]"
                                }`}
                              >

                                <div className="flex items-center justify-between gap-4">

                                  <div className="min-w-0">

                                    <p className="truncate text-[11px] font-medium text-[#292725]">
                                      {scholar.name}
                                    </p>

                                    <p className="mt-1 truncate text-[9px] text-[#777]">
                                      {
                                        scholar.credential
                                      }
                                    </p>

                                  </div>

                                  <span className="shrink-0 rounded-[4px] bg-[#F1ECE7] px-2 py-1 text-[8px] text-[#777]">
                                    {scholar.group ===
                                    "Founder / Core Scholar"
                                      ? "CORE"
                                      : "NETWORK"}
                                  </span>

                                </div>

                              </button>

                            );
                          }
                        )}

                      </div>

                    )}

                  </div>

                )}


              {/* NO SCHOLARS */}

              {!scholarsLoading &&
                scholars.length === 0 && (

                  <div className="mt-2 rounded-[6px] border border-[#F0D8D4] bg-[#FFF7F5] px-3 py-3">

                    <p className="text-[10px] text-[#A62F20]">
                      No published scholars exist yet.
                    </p>

                    <Link
                      href="/intellects/new"
                      className="mt-1 inline-block text-[9px] text-[#A62F20] underline"
                    >
                      + Add a scholar from Intellects
                    </Link>

                  </div>

                )}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}