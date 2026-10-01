"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getTestimonials,
  saveTestimonials,
  Testimonial,
  TestimonialStatus,
} from "@/lib/cmsStore";

type Filter =
  | "ALL"
  | "PENDING_REVIEW"
  | "APPROVED";

export default function TestimonialsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [page, setPage] =
    useState(1);

  const pageSize = 6;

  /* ============================================================
     LOAD
     ============================================================ */

  useEffect(() => {
    setMounted(true);
    setTestimonials(
      getTestimonials()
    );
  }, []);

  /* ============================================================
     FILTER
     ============================================================ */

  const filteredTestimonials =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return testimonials.filter(
        (testimonial) => {
          const matchesSearch =
            !query ||
            testimonial.quote
              .toLowerCase()
              .includes(query) ||
            testimonial.travellerName
              .toLowerCase()
              .includes(query) ||
            testimonial.titleOrganisation
              .toLowerCase()
              .includes(query) ||
            testimonial.linkedItem
              .toLowerCase()
              .includes(query);

          if (!matchesSearch) {
            return false;
          }

          if (
            filter === "PENDING_REVIEW"
          ) {
            return (
              testimonial.status ===
              "PENDING_REVIEW"
            );
          }

          if (
            filter === "APPROVED"
          ) {
            return (
              testimonial.status ===
              "APPROVED"
            );
          }

          return true;
        }
      );
    }, [
      testimonials,
      search,
      filter,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTestimonials.length /
        pageSize
    )
  );

  const visibleTestimonials =
    filteredTestimonials.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* ============================================================
     WEBSITE TOGGLE
     ============================================================ */

  const toggleWebsite = (
    id: string
  ) => {
    const updated =
      testimonials.map(
        (testimonial) =>
          testimonial.id === id
            ? {
                ...testimonial,
                showOnWebsite:
                  !testimonial.showOnWebsite,
                updatedAt:
                  new Date().toISOString(),
              }
            : testimonial
      );

    setTestimonials(updated);
    saveTestimonials(updated);
  };

  /* ============================================================
     STATUS
     ============================================================ */

  const changeStatus = (
    id: string,
    status: TestimonialStatus
  ) => {
    const updated =
      testimonials.map(
        (testimonial) =>
          testimonial.id === id
            ? {
                ...testimonial,
                status,
                updatedAt:
                  new Date().toISOString(),
              }
            : testimonial
      );

    setTestimonials(updated);
    saveTestimonials(updated);
  };

  /* ============================================================
     DELETE
     ============================================================ */

  const deleteTestimonial = (
    id: string
  ) => {
    const testimonial =
      testimonials.find(
        (item) => item.id === id
      );

    if (!testimonial) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the testimonial from ${testimonial.travellerName}?`
      );

    if (!confirmed) {
      return;
    }

    const updated =
      testimonials.filter(
        (item) => item.id !== id
      );

    setTestimonials(updated);
    saveTestimonials(updated);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#F8F5F1] p-10">
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-[12px] text-[#888]">
            Loading testimonials...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1400px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="font-serif text-[12px] text-[#77716C]">
              Feedback Loop
            </p>

            <h1 className="mt-2 font-serif text-[36px] text-[#292725]">
              Testimonials
            </h1>

            <p className="mt-5 text-[14px] text-[#77716C]">
              Manage traveller testimonials and
              control which appear on the public
              homepage curation slots.
            </p>

          </div>


          <Link
            href="/testimonials/new"
            className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[12px] font-medium text-white transition hover:opacity-90"
          >
            + Add Testimonial
          </Link>

        </div>


        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div className="mt-7 flex items-center gap-4">

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search testimonials..."
            autoComplete="off"
            className="h-[40px] w-[310px] rounded-[6px] border border-[#DED8D1] bg-white px-4 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
          />


          <select
            value={filter}
            onChange={(event) => {
              setFilter(
                event.target.value as Filter
              );
              setPage(1);
            }}
            className="h-[40px] w-[220px] rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
          >

            <option value="ALL">
              All Reviews
            </option>

            <option value="PENDING_REVIEW">
              Pending Review
            </option>

            <option value="APPROVED">
              Approved
            </option>

          </select>

        </div>


        {/* ======================================================
            TABLE
        ====================================================== */}

        <section className="mt-7 overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] border-collapse">

              <thead>

                <tr className="border-b border-[#E8E1DB] bg-[#FCFAF8]">

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase text-[#888]">
                    Quote Excerpt
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase text-[#888]">
                    Traveller Name
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase text-[#888]">
                    Title / Organisation
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase text-[#888]">
                    Linked Trip / Event
                  </th>

                  <th className="px-6 py-4 text-center text-[10px] font-medium uppercase text-[#888]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-[10px] font-medium uppercase text-[#888]">
                    Website
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-medium uppercase text-[#888]">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleTestimonials.map(
                  (testimonial) => (

                    <tr
                      key={testimonial.id}
                      className="border-b border-[#EEE8E3] last:border-b-0 hover:bg-[#FCFAF8]"
                    >

                      {/* QUOTE */}

                      <td className="px-6 py-5">

                        <p className="max-w-[370px] truncate text-[12px] text-[#292725]">
                          "{testimonial.quote}"
                        </p>

                      </td>


                      {/* NAME */}

                      <td className="px-6 py-5">

                        <p className="text-[11px] font-semibold text-[#292725]">
                          {testimonial.travellerName}
                        </p>

                      </td>


                      {/* ORG */}

                      <td className="px-6 py-5">

                        <p className="max-w-[190px] truncate text-[11px] text-[#77716C]">
                          {
                            testimonial.titleOrganisation
                          }
                        </p>

                      </td>


                      {/* LINK */}

                      <td className="px-6 py-5">

                        <p className="max-w-[190px] truncate text-[11px] text-[#77716C]">
                          {testimonial.linkedItem ||
                            "General"}
                        </p>

                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <select
                          value={
                            testimonial.status
                          }
                          onChange={(event) =>
                            changeStatus(
                              testimonial.id,
                              event.target
                                .value as TestimonialStatus
                            )
                          }
                          className={`rounded-[5px] border-0 px-2 py-1 text-[9px] font-medium outline-none ${
                            testimonial.status ===
                            "APPROVED"
                              ? "bg-[#E8F4E8] text-[#438047]"
                              : "bg-[#FFF3D6] text-[#A36B00]"
                          }`}
                        >

                          <option value="PENDING_REVIEW">
                            PENDING REVIEW
                          </option>

                          <option value="APPROVED">
                            APPROVED
                          </option>

                        </select>

                      </td>


                      {/* WEBSITE */}

                      <td className="px-6 py-5">

                        <div className="flex justify-center">

                          <button
                            type="button"
                            onClick={() =>
                              toggleWebsite(
                                testimonial.id
                              )
                            }
                            aria-label={
                              testimonial.showOnWebsite
                                ? "Hide testimonial"
                                : "Show testimonial"
                            }
                            className={`relative h-[20px] w-[38px] rounded-full transition ${
                              testimonial.showOnWebsite
                                ? "bg-[#A62F20]"
                                : "bg-[#CFC9C3]"
                            }`}
                          >

                            <span
                              className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition ${
                                testimonial.showOnWebsite
                                  ? "left-[21px]"
                                  : "left-[3px]"
                              }`}
                            />

                          </button>

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-4">

                          <Link
                            href={`/testimonials/${testimonial.id}`}
                            className="text-[10px] text-[#A62F20] hover:underline"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTestimonial(
                                testimonial.id
                              )
                            }
                            className="text-[10px] text-[#777] hover:text-[#A62F20]"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}


                {/* EMPTY */}

                {visibleTestimonials.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-6 py-20 text-center"
                    >

                      <p className="text-[13px] text-[#777]">
                        No testimonials found.
                      </p>

                      <Link
                        href="/testimonials/new"
                        className="mt-3 inline-block text-[12px] text-[#A62F20]"
                      >
                        + Add your first testimonial
                      </Link>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ====================================================
              PAGINATION
          ==================================================== */}

          <div className="flex items-center justify-between border-t border-[#E8E1DB] px-6 py-4">

            <p className="text-[10px] text-[#888]">

              Showing{" "}

              {filteredTestimonials.length ===
              0
                ? 0
                : (page - 1) *
                    pageSize +
                  1}

              –

              {Math.min(
                page * pageSize,
                filteredTestimonials.length
              )}

              {" "}of{" "}
              {filteredTestimonials.length} testimonials

            </p>


            <div className="flex gap-2">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                className="rounded-[5px] border border-[#DED8D1] px-3 py-2 text-[10px] disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                className="rounded-[5px] border border-[#DED8D1] px-3 py-2 text-[10px] disabled:opacity-40"
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