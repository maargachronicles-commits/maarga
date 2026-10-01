"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  EventRecord,
  getEvents,
  getScholars,
  saveEvents,
  Scholar,
} from "@/lib/cmsStore";

type Tab =
  | "ALL"
  | "UPCOMING"
  | "PAST"
  | "DRAFTS";

export default function EventsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [events, setEvents] =
    useState<EventRecord[]>([]);

  const [scholars, setScholars] =
    useState<Scholar[]>([]);

  const [activeTab, setActiveTab] =
    useState<Tab>("ALL");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const pageSize = 5;

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    setMounted(true);

    setEvents(getEvents());

    setScholars(getScholars());
  }, []);

  /*
   * ============================================================
   * SCHOLAR NAME
   * ============================================================
   */

  const getScholarName = (
    scholarId: string
  ) => {
    return (
      scholars.find(
        (scholar) =>
          scholar.id === scholarId
      )?.name || "—"
    );
  };

  /*
   * ============================================================
   * FILTER EVENTS
   * ============================================================
   */

  const filteredEvents = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const query =
      search.trim().toLowerCase();

    return events.filter((event) => {
      /*
       * Ignore archived events from the old
       * storage structure, if any still exist.
       */
      if (
        (event.status as string) ===
        "ARCHIVED"
      ) {
        return false;
      }

      /*
       * Search event title or scholar.
       */
      const matchesSearch =
        !query ||
        event.title
          .toLowerCase()
          .includes(query) ||
        getScholarName(
          event.scholarId
        )
          .toLowerCase()
          .includes(query) ||
        event.format
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) {
        return false;
      }

      /*
       * Drafts.
       */
      if (
        activeTab === "DRAFTS"
      ) {
        return event.status === "DRAFT";
      }

      /*
       * Date filtering.
       */
      const eventDate = new Date(
        event.date
      );

      eventDate.setHours(0, 0, 0, 0);

      if (
        activeTab === "UPCOMING"
      ) {
        return (
          event.status === "PUBLISHED" &&
          eventDate >= today
        );
      }

      if (activeTab === "PAST") {
        return (
          event.status === "PUBLISHED" &&
          eventDate < today
        );
      }

      /*
       * All Events.
       */
      return true;
    });
  }, [
    events,
    scholars,
    activeTab,
    search,
  ]);

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEvents.length /
        pageSize
    )
  );

  const visibleEvents =
    filteredEvents.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /*
   * ============================================================
   * WEBSITE VISIBILITY
   * ============================================================
   */

  const toggleWebsiteVisibility = (
    eventId: string
  ) => {
    const updatedEvents =
      events.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        return {
          ...event,

          /*
           * Old events that don't have
           * this field are treated as visible.
           */
          showOnWebsite:
            !(event.showOnWebsite ?? true),

          updatedAt:
            new Date().toISOString(),
        };
      });

    setEvents(updatedEvents);

    saveEvents(updatedEvents);
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const deleteEvent = (
    eventId: string
  ) => {
    const event = events.find(
      (item) =>
        item.id === eventId
    );

    if (!event) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${event.title}" permanently?`
      );

    if (!confirmed) {
      return;
    }

    const updatedEvents =
      events.filter(
        (item) =>
          item.id !== eventId
      );

    setEvents(updatedEvents);

    saveEvents(updatedEvents);
  };

  /*
   * ============================================================
   * HYDRATION / INITIAL LOAD
   * ============================================================
   */

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#F8F5F1] p-10">

        <div className="mx-auto max-w-[1400px]">

          <div className="flex min-h-[600px] items-center justify-center">

            <p className="text-[12px] text-[#888]">
              Loading events...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#F8F5F1] p-10">

      <div className="mx-auto max-w-[1400px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[12px] uppercase tracking-[0.2em] text-[#A62F20]">
              MAARGA CMS
            </p>

            <h1 className="mt-2 font-serif text-[38px] font-normal text-[#292725]">
              Events Management
            </h1>

            <p className="mt-2 text-[14px] text-[#77716C]">
              Design, schedule, and review academic
              events, masterclasses, and live study
              sessions.
            </p>

          </div>


          <Link
            href="/events/new"
            className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[12px] font-medium text-white transition hover:opacity-90"
          >
            + Create New Event
          </Link>

        </div>


        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div className="mt-7 flex justify-end">

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );

              setPage(1);
            }}
            placeholder="Search events..."
            autoComplete="off"
            className="h-[38px] w-[285px] rounded-[6px] border border-[#DDD6D0] bg-white px-3 text-[11px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
            style={{
              color: "#292725",
              WebkitTextFillColor:
                "#292725",
            }}
          />

        </div>


        {/* ======================================================
            TABS
        ====================================================== */}

        <div className="mt-6 flex border-b border-[#DED8D1]">

          {(
            [
              ["ALL", "All Events"],
              ["UPCOMING", "Upcoming"],
              ["PAST", "Past"],
              ["DRAFTS", "Drafts"],
            ] as const
          ).map(
            ([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() => {
                  setActiveTab(value);

                  setPage(1);
                }}
                className={`px-5 pb-4 text-[12px] transition ${
                  activeTab === value
                    ? "border-b-2 border-[#A62F20] text-[#A62F20]"
                    : "text-[#777] hover:text-[#A62F20]"
                }`}
              >
                {label}
              </button>

            )
          )}

        </div>


        {/* ======================================================
            TABLE
        ====================================================== */}

        <section className="mt-6 overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] border-collapse">

              <thead>

                <tr className="border-b border-[#E8E1DB] bg-[#FCFAF8]">

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Event
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Format
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Scholar
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Attendees
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Website
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleEvents.map(
                  (event) => {

                    const isVisible =
                      event.showOnWebsite ??
                      true;

                    return (
                      <tr
                        key={event.id}
                        className="border-b border-[#EEE8E3] last:border-b-0 hover:bg-[#FCFAF8]"
                      >

                        {/* EVENT */}

                        <td className="px-5 py-5">

                          <p className="max-w-[300px] text-[12px] font-medium text-[#292725]">
                            {event.title}
                          </p>

                          {event.description && (
                            <p className="mt-1 max-w-[300px] truncate text-[9px] text-[#999]">
                              {
                                event.description
                              }
                            </p>
                          )}

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-5 text-[11px] text-[#77716C]">

                          {event.date
                            ? new Date(
                                event.date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}

                        </td>


                        {/* FORMAT */}

                        <td className="px-5 py-5 text-[11px] text-[#77716C]">
                          {event.format ||
                            "—"}
                        </td>


                        {/* SCHOLAR */}

                        <td className="px-5 py-5 text-[11px] text-[#77716C]">
                          {getScholarName(
                            event.scholarId
                          )}
                        </td>


                        {/* ATTENDEES */}

                        <td className="px-5 py-5 text-[11px] text-[#77716C]">

                          {event.attendees >
                          0
                            ? `${event.attendees} registered`
                            : "—"}

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex rounded-[4px] px-2 py-1 text-[9px] font-medium ${
                              event.status ===
                              "PUBLISHED"
                                ? "bg-[#E8F4E8] text-[#438047]"
                                : "bg-[#FFF3D6] text-[#A36B00]"
                            }`}
                          >
                            {event.status}
                          </span>

                        </td>


                        {/* WEBSITE TOGGLE */}

                        <td className="px-5 py-5">

                          <div className="flex justify-center">

                            <button
                              type="button"
                              onClick={() =>
                                toggleWebsiteVisibility(
                                  event.id
                                )
                              }
                              aria-label={
                                isVisible
                                  ? "Hide event from website"
                                  : "Show event on website"
                              }
                              className={`relative h-[20px] w-[38px] rounded-full transition ${
                                isVisible
                                  ? "bg-[#A62F20]"
                                  : "bg-[#CFC9C3]"
                              }`}
                            >

                              <span
                                className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition ${
                                  isVisible
                                    ? "left-[21px]"
                                    : "left-[3px]"
                                }`}
                              />

                            </button>

                          </div>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-3">

                            <Link
                              href={`/events/${event.id}/summary`}
                              className="text-[10px] text-[#A62F20] hover:underline"
                            >
                              View
                            </Link>

                            <Link
                              href={`/events/${event.id}/summary`}
                              className="text-[10px] text-[#77716C] hover:text-[#A62F20]"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(
                                  event.id
                                )
                              }
                              className="text-[10px] text-[#77716C] hover:text-[#A62F20]"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {visibleEvents.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-5 py-20 text-center"
                    >

                      {events.length ===
                      0 ? (
                        <>
                          <p className="text-[13px] text-[#77716C]">
                            No events have been created yet.
                          </p>

                          <Link
                            href="/events/new"
                            className="mt-3 inline-block text-[12px] text-[#A62F20] hover:underline"
                          >
                            + Create your first event
                          </Link>
                        </>
                      ) : (
                        <p className="text-[13px] text-[#77716C]">
                          No events match your current filters.
                        </p>
                      )}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ======================================================
              FOOTER / PAGINATION
          ====================================================== */}

          <div className="flex items-center justify-between border-t border-[#E8E1DB] px-5 py-4">

            <p className="text-[10px] text-[#88817B]">

              Showing{" "}

              {filteredEvents.length ===
              0
                ? 0
                : (page - 1) *
                    pageSize +
                  1}

              {"–"}

              {Math.min(
                page * pageSize,
                filteredEvents.length
              )}

              {" "}of{" "}
              {filteredEvents.length} events

            </p>


            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                className="rounded-[5px] border border-[#DED8D1] bg-white px-3 py-2 text-[10px] text-[#777] transition hover:bg-[#F8F5F1] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>


              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
                className="rounded-[5px] border border-[#DED8D1] bg-white px-3 py-2 text-[10px] text-[#555] transition hover:bg-[#F8F5F1] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}