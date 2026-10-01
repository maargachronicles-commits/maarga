"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getDestinations,
  getEvents,
  getJourneys,
  getScholars,
  getTestimonials,
  Destination,
  EventRecord,
  Journey,
  Scholar,
  Testimonial,
} from "@/lib/cmsStore";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [events, setEvents] =
    useState<EventRecord[]>([]);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [scholars, setScholars] =
    useState<Scholar[]>([]);

  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  useEffect(() => {
    setMounted(true);

    setDestinations(getDestinations());
    setEvents(getEvents());
    setJourneys(getJourneys());
    setScholars(getScholars());
    setTestimonials(getTestimonials());
  }, []);

  /* ============================================================
     UPCOMING JOURNEYS
     ============================================================ */

  const upcomingJourneys = useMemo(() => {
    const now = new Date();

    return journeys
      .filter((journey) => {
        if (journey.status !== "PUBLISHED") {
          return false;
        }

        if (!journey.startDate) {
          return false;
        }

        return new Date(journey.startDate) >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() -
          new Date(b.startDate).getTime()
      );
  }, [journeys]);

  /* ============================================================
     ACTIVE EVENTS
     ============================================================ */

  const activeEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.status === "PUBLISHED" &&
        event.showOnWebsite
    );
  }, [events]);

  /* ============================================================
     PENDING TESTIMONIALS
     ============================================================ */

  const pendingTestimonials = useMemo(() => {
    return testimonials.filter(
      (testimonial) =>
        testimonial.status === "PENDING_REVIEW"
    );
  }, [testimonials]);

  /* ============================================================
     ACTIVE SCHOLARS
     ============================================================ */

  const activeScholars = useMemo(() => {
    return scholars.filter(
      (scholar) =>
        scholar.status === "Published"
    );
  }, [scholars]);

  /* ============================================================
     UPCOMING EVENTS
     ============================================================ */

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => {
        if (event.status !== "PUBLISHED") {
          return false;
        }

        if (!event.date) {
          return false;
        }

        return new Date(event.date) >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .slice(0, 3);
  }, [events]);

  /* ============================================================
     DATE FORMAT
     ============================================================ */

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatEventDate = (
    date: string
  ) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return {
        month: "—",
        day: "—",
      };
    }

    return {
      month: parsed
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase(),

      day: parsed.getDate(),
    };
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">

        <div className="flex min-h-[500px] items-center justify-center">

          <p className="text-[12px] text-[#888]">
            Loading dashboard...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div>

          <h1 className="text-[27px] font-semibold text-[#292725]">
            Welcome back, Mamtha
          </h1>

          <p className="mt-1 font-serif text-[14px] text-[#77716C]">
            Here is the state of Maarga&apos;s
            digital knowledge portal today.
          </p>

        </div>


        {/* ======================================================
            TOP STAT CARDS
        ====================================================== */}

        <div className="mt-7 grid grid-cols-4 gap-4">

          {/* DESTINATIONS */}

          <Link
            href="/destinations"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:-translate-y-[1px] hover:border-[#B43122] hover:shadow-sm"
          >

            <p className="text-[10px] font-medium uppercase text-[#77716C]">
              Total Destinations
            </p>

            <p className="mt-4 font-serif text-[30px] text-[#292725]">
              {destinations.length}
            </p>

            <p className="mt-2 text-[9px] text-[#B43122] opacity-0 transition group-hover:opacity-100">
              Open destinations →
            </p>

          </Link>


          {/* EVENTS */}

          <Link
            href="/events"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:-translate-y-[1px] hover:border-[#B43122] hover:shadow-sm"
          >

            <p className="text-[10px] font-medium uppercase text-[#77716C]">
              Active Events
            </p>

            <p className="mt-4 font-serif text-[30px] text-[#292725]">
              {activeEvents.length}
            </p>

            <p className="mt-2 text-[9px] text-[#B43122] opacity-0 transition group-hover:opacity-100">
              Open events →
            </p>

          </Link>


          {/* JOURNEYS */}

          <Link
            href="/journeys"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:-translate-y-[1px] hover:border-[#B43122] hover:shadow-sm"
          >

            <p className="text-[10px] font-medium uppercase text-[#77716C]">
              Upcoming Journeys
            </p>

            <p className="mt-4 font-serif text-[30px] text-[#292725]">
              {upcomingJourneys.length}
            </p>

            <p className="mt-2 text-[9px] text-[#B43122] opacity-0 transition group-hover:opacity-100">
              Open journeys →
            </p>

          </Link>


          {/* TESTIMONIALS */}

          <Link
            href="/testimonials"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:-translate-y-[1px] hover:border-[#B43122] hover:shadow-sm"
          >

            <p className="text-[10px] font-medium uppercase text-[#77716C]">
              Pending Testimonials
            </p>

            <p className="mt-4 font-serif text-[30px] text-[#292725]">
              {pendingTestimonials.length}
            </p>

            <p className="mt-2 text-[9px] text-[#B43122] opacity-0 transition group-hover:opacity-100">
              Review testimonials →
            </p>

          </Link>

        </div>


        {/* ======================================================
            SECONDARY STATS
        ====================================================== */}

        <div className="mt-4 grid grid-cols-3 gap-4">

          {/* PENDING */}

          <Link
            href="/testimonials"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:border-[#B43122]"
          >

            <p className="text-[10px] uppercase text-[#77716C]">
              Pending Testimonials
            </p>

            <div className="mt-3 flex items-center gap-3">

              <p className="font-serif text-[25px] text-[#292725]">
                {pendingTestimonials.length}
              </p>

              {pendingTestimonials.length > 0 && (
                <span className="rounded-[4px] bg-[#FFF2D5] px-2 py-1 text-[8px] text-[#A56A00]">
                  Needs Action
                </span>
              )}

            </div>

          </Link>


          {/* HOMEPAGE */}

          <Link
            href="/homepage"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:border-[#B43122]"
          >

            <p className="text-[10px] uppercase text-[#77716C]">
              Homepage
            </p>

            <div className="mt-3 flex items-center gap-3">

              <p className="font-serif text-[18px] text-[#292725]">
                Manage Homepage
              </p>

              <span className="rounded-[4px] bg-[#E8F4E8] px-2 py-1 text-[8px] text-[#438047]">
                Open
              </span>

            </div>

          </Link>


          {/* SCHOLARS */}

          <Link
            href="/intellects"
            className="group rounded-[10px] border border-[#DED8D1] bg-white p-5 transition hover:border-[#B43122]"
          >

            <p className="text-[10px] uppercase text-[#77716C]">
              Active Scholars
            </p>

            <div className="mt-3 flex items-center gap-3">

              <p className="font-serif text-[25px] text-[#292725]">
                {activeScholars.length}
              </p>

              <span className="text-[9px] text-[#999]">
                active
              </span>

              <span className="text-[#DDD5CF]">
                /
              </span>

              <span className="text-[9px] text-[#999]">
                {
                  scholars.filter(
                    (scholar) =>
                      scholar.status === "Draft"
                  ).length
                }{" "}
                draft
              </span>

            </div>

          </Link>

        </div>


        {/* ======================================================
            LOWER GRID
        ====================================================== */}

        <div className="mt-6 grid grid-cols-[1fr_330px] gap-5">

          {/* ====================================================
              RECENT ENQUIRIES
              ----------------------------------------------------
              LEFT UNTOUCHED / NON FUNCTIONAL FOR NOW
              ==================================================== */}

          <section className="rounded-[10px] border border-[#DED8D1] bg-white p-6">

            <div className="flex items-center justify-between">

              <h2 className="font-serif text-[18px] text-[#292725]">
                Recent Enquiries
              </h2>

              <span className="text-[9px] text-[#999]">
                Enquiries module coming next
              </span>

            </div>


            <div className="mt-5 overflow-hidden">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-b border-[#E8E1DC]">

                    <th className="pb-3 text-left text-[9px] font-normal text-[#888]">
                      Name
                    </th>

                    <th className="pb-3 text-left text-[9px] font-normal text-[#888]">
                      Email
                    </th>

                    <th className="pb-3 text-left text-[9px] font-normal text-[#888]">
                      Destination / Interest
                    </th>

                    <th className="pb-3 text-left text-[9px] font-normal text-[#888]">
                      Date
                    </th>

                    <th className="pb-3 text-left text-[9px] font-normal text-[#888]">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  <tr className="border-b border-[#EEE9E4]">
                    <td className="py-4 text-[10px]">
                      Devendra Joshi
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      devj@outlook.com
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      Hampi Journey
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      May 12, 2025
                    </td>
                    <td className="py-4">
                      <span className="rounded-[4px] bg-[#FFF0F0] px-2 py-1 text-[8px] text-[#B43122]">
                        NEW
                      </span>
                    </td>
                  </tr>


                  <tr className="border-b border-[#EEE9E4]">
                    <td className="py-4 text-[10px]">
                      Meera Krishnan
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      meera.k@gmail.com
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      Temple Architecture Masterclass
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      May 10, 2025
                    </td>
                    <td className="py-4">
                      <span className="rounded-[4px] bg-[#EDF7FB] px-2 py-1 text-[8px] text-[#3781A1]">
                        CONTACTED
                      </span>
                    </td>
                  </tr>


                  <tr className="border-b border-[#EEE9E4]">
                    <td className="py-4 text-[10px]">
                      Robert Vance
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      rvance@edu.org
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      Deccan Forts Expedition
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      May 8, 2025
                    </td>
                    <td className="py-4">
                      <span className="rounded-[4px] bg-[#E8F4E8] px-2 py-1 text-[8px] text-[#438047]">
                        CONVERTED
                      </span>
                    </td>
                  </tr>


                  <tr className="border-b border-[#EEE9E4]">
                    <td className="py-4 text-[10px]">
                      Amit Shah
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      amit.shah@gmail.com
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      Badami & Pattadakal Study Tour
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      May 5, 2025
                    </td>
                    <td className="py-4">
                      <span className="rounded-[4px] bg-[#FFF0F0] px-2 py-1 text-[8px] text-[#B43122]">
                        NEW
                      </span>
                    </td>
                  </tr>


                  <tr>
                    <td className="py-4 text-[10px]">
                      Srinivas Prasad
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      srinivas@prasad.in
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      Water Architecture Tour
                    </td>
                    <td className="py-4 text-[10px] text-[#777]">
                      May 2, 2025
                    </td>
                    <td className="py-4">
                      <span className="rounded-[4px] bg-[#EDF7FB] px-2 py-1 text-[8px] text-[#3781A1]">
                        CONTACTED
                      </span>
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </section>


          {/* ====================================================
              RIGHT COLUMN
              ==================================================== */}

          <div className="space-y-5">

            {/* QUICK ACTIONS */}

            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-5">

              <h2 className="font-serif text-[18px] text-[#292725]">
                Quick Actions
              </h2>


              <div className="mt-5 space-y-3">

                <Link
                  href="/destinations/new"
                  className="flex h-[42px] items-center justify-center rounded-[6px] bg-[#B43122] text-[10px] font-medium text-white transition hover:opacity-90"
                >
                  + Add New Destination
                </Link>


                <Link
                  href="/events/new"
                  className="flex h-[42px] items-center justify-center rounded-[6px] border border-[#B43122] text-[10px] font-medium text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
                >
                  + Create Event
                </Link>


                <Link
                  href="/journeys/new"
                  className="flex h-[42px] items-center justify-center rounded-[6px] border border-[#DED8D1] text-[10px] font-medium text-[#555] transition hover:border-[#B43122] hover:text-[#B43122]"
                >
                  + Create Journey
                </Link>


                <Link
                  href="/intellects/new"
                  className="flex h-[42px] items-center justify-center rounded-[6px] border border-[#DED8D1] text-[10px] font-medium text-[#555] transition hover:border-[#B43122] hover:text-[#B43122]"
                >
                  + Add Scholar
                </Link>

              </div>

            </section>


            {/* UPCOMING EVENTS */}

            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-5">

              <div className="flex items-center justify-between">

                <h2 className="font-serif text-[18px] text-[#292725]">
                  Upcoming Events
                </h2>

                <Link
                  href="/events"
                  className="text-[9px] text-[#B43122]"
                >
                  View all
                </Link>

              </div>


              <div className="mt-5 space-y-3">

                {upcomingEvents.length ===
                0 ? (
                  <div className="py-8 text-center text-[10px] text-[#999]">
                    No upcoming events.
                  </div>
                ) : (
                  upcomingEvents.map(
                    (event) => {

                      const eventDate =
                        formatEventDate(
                          event.date
                        );

                      return (
                        <Link
                          key={event.id}
                          href="/events"
                          className="flex gap-3 rounded-[7px] p-2 transition hover:bg-[#FCFAF8]"
                        >

                          <div className="flex h-[48px] w-[46px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-[#FFF4F1]">

                            <span className="text-[8px] font-semibold text-[#B43122]">
                              {
                                eventDate.month
                              }
                            </span>

                            <span className="font-serif text-[18px] text-[#B43122]">
                              {
                                eventDate.day
                              }
                            </span>

                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-[10px] font-medium text-[#292725]">
                              {
                                event.title
                              }
                            </p>

                            <p className="mt-1 truncate text-[9px] text-[#777]">
                              {
                                event.format
                              }
                            </p>

                          </div>

                        </Link>
                      );
                    }
                  )
                )}

              </div>

            </section>


            {/* UPCOMING JOURNEYS */}

            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-5">

              <div className="flex items-center justify-between">

                <h2 className="font-serif text-[18px] text-[#292725]">
                  Upcoming Journeys
                </h2>

                <Link
                  href="/journeys"
                  className="text-[9px] text-[#B43122]"
                >
                  View all
                </Link>

              </div>


              <div className="mt-4 space-y-3">

                {upcomingJourneys
                  .slice(0, 3)
                  .map((journey) => (
                    <Link
                      key={journey.id}
                      href="/journeys"
                      className="block rounded-[6px] border border-[#EEE9E4] p-3 transition hover:border-[#B43122]"
                    >

                      <p className="truncate text-[10px] font-medium text-[#292725]">
                        {journey.title}
                      </p>

                      <p className="mt-1 text-[9px] text-[#777]">
                        {formatDate(
                          journey.startDate
                        )}
                      </p>

                    </Link>
                  ))}

                {upcomingJourneys.length ===
                  0 && (
                  <p className="py-5 text-center text-[10px] text-[#999]">
                    No upcoming journeys.
                  </p>
                )}

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}