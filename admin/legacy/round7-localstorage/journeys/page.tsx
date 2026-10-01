"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getJourneys,
  getDestinations,
  getContentForJourney,
  saveJourneys,
  Journey,
  Destination,
} from "@/lib/cmsStore";

type Filter =
  | "ALL"
  | "UPCOMING"
  | "PAST"
  | "DRAFT";

export default function JourneysPage() {
  const [mounted, setMounted] =
    useState(false);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [search, setSearch] =
    useState("");

  const [destinationFilter, setDestinationFilter] =
    useState("ALL");

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [page, setPage] =
    useState(1);

  const pageSize = 5;

  useEffect(() => {
    setMounted(true);

    setJourneys(getJourneys());
    setDestinations(
      getDestinations()
    );
  }, []);

  const getJourneyDestinations = (
    journeyId: string
  ) => {
    const contents =
      getContentForJourney(
        journeyId
      );

    return contents
      .map(
        (content) =>
          destinations.find(
            (destination) =>
              destination.id ===
              content.destinationId
          )
      )
      .filter(
        (
          item
        ): item is Destination =>
          Boolean(item)
      );
  };

  const filteredJourneys =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      return journeys.filter(
        (journey) => {
          const linked =
            getJourneyDestinations(
              journey.id
            );

          const destinationText =
            linked
              .map(
                (item) =>
                  item.name
              )
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !query ||
            journey.title
              .toLowerCase()
              .includes(query) ||
            destinationText.includes(
              query
            );

          if (!matchesSearch) {
            return false;
          }

          if (
            destinationFilter !==
            "ALL"
          ) {
            if (
              !linked.some(
                (destination) =>
                  destination.id ===
                  destinationFilter
              )
            ) {
              return false;
            }
          }

          if (
            filter ===
            "UPCOMING"
          ) {
            return (
              journey.status ===
                "PUBLISHED" &&
              new Date(
                journey.startDate
              ) >= today
            );
          }

          if (
            filter === "PAST"
          ) {
            return (
              journey.status ===
                "PUBLISHED" &&
              new Date(
                journey.startDate
              ) < today
            );
          }

          if (
            filter === "DRAFT"
          ) {
            return (
              journey.status ===
              "DRAFT"
            );
          }

          return true;
        }
      );
    }, [
      journeys,
      destinations,
      search,
      destinationFilter,
      filter,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredJourneys.length /
          pageSize
      )
    );

  const visibleJourneys =
    filteredJourneys.slice(
      (page - 1) *
        pageSize,
      page * pageSize
    );

  useEffect(() => {
    if (
      page > totalPages
    ) {
      setPage(
        totalPages
      );
    }
  }, [
    page,
    totalPages,
  ]);

  const deleteJourney = (
    id: string
  ) => {
    const journey =
      journeys.find(
        (item) =>
          item.id === id
      );

    if (!journey) return;

    if (
      !window.confirm(
        `Delete "${journey.title}"?`
      )
    ) {
      return;
    }

    const updated =
      journeys.filter(
        (item) =>
          item.id !== id
      );

    setJourneys(updated);
    saveJourneys(updated);
  };

  const toggleWebsite = (
    id: string
  ) => {
    const updated =
      journeys.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                showOnWebsite:
                  !item.showOnWebsite,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    setJourneys(updated);
    saveJourneys(updated);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">
        <div className="flex min-h-[400px] items-center justify-center text-[12px] text-[#888]">
          Loading journeys...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="font-serif text-[28px] text-[#292725]">
              Journeys
            </h1>

            <p className="mt-1 text-[11px] text-[#777]">
              Plan and manage bookable journeys
              across multiple destinations.
            </p>

          </div>

          <Link
            href="/journeys/new"
            className="rounded-[5px] bg-[#B43122] px-5 py-3 text-[10px] text-white"
          >
            + Create New Journey
          </Link>

        </div>


        <div className="mt-6 flex gap-3">

          <input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search journeys..."
            className="h-[32px] w-[290px] rounded-[4px] border border-[#DED8D1] bg-white px-3 text-[10px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#999] focus:border-[#B43122]"
          />

          <select
            value={
              destinationFilter
            }
            onChange={(event) => {
              setDestinationFilter(
                event.target.value
              );
              setPage(1);
            }}
            className="h-[32px] rounded-[4px] border border-[#DED8D1] bg-white px-3 text-[10px] text-[#292725]"
          >
            <option value="ALL">
              Destination: All Destinations
            </option>

            {destinations.map(
              (destination) => (
                <option
                  key={destination.id}
                  value={destination.id}
                >
                  {destination.name}
                </option>
              )
            )}
          </select>

          <select
            value={filter}
            onChange={(event) => {
              setFilter(
                event.target
                  .value as Filter
              );
              setPage(1);
            }}
            className="h-[32px] rounded-[4px] border border-[#DED8D1] bg-white px-3 text-[10px] text-[#292725]"
          >
            <option value="ALL">
              Status: All
            </option>

            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="PAST">
              Past
            </option>

            <option value="DRAFT">
              Draft
            </option>
          </select>

        </div>


        <section className="mt-6 overflow-hidden rounded-[9px] border border-[#E2DDD8] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] border-collapse">

              <thead>

                <tr className="border-b border-[#E8E1DC]">

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Trip Name
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Destinations
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Date Range
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Duration
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Seats
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Price
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Status
                  </th>

                  <th className="px-4 py-4 text-center text-[9px] font-normal uppercase text-[#888]">
                    Website
                  </th>

                  <th className="px-4 py-4 text-left text-[9px] font-normal uppercase text-[#888]">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleJourneys.map(
                  (journey) => {

                    const linkedDestinations =
                      getJourneyDestinations(
                        journey.id
                      );

                    return (
                      <tr
                        key={
                          journey.id
                        }
                        className="border-b border-[#EEE9E4]"
                      >

                        <td className="px-4 py-4 text-[10px] font-semibold text-[#292725]">
                          {journey.title}
                        </td>

                        <td className="px-4 py-4">

                          {linkedDestinations.length >
                          0 ? (
                            <div className="flex flex-wrap gap-1">
                              {linkedDestinations.map(
                                (destination) => (
                                  <span
                                    key={
                                      destination.id
                                    }
                                    className="rounded-[3px] bg-[#F2ECE7] px-2 py-1 text-[8px] text-[#666]"
                                  >
                                    {
                                      destination.name
                                    }
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] text-[#A62F20]">
                              No destinations linked
                            </span>
                          )}

                        </td>

                        <td className="px-4 py-4 text-[10px] text-[#777]">
                          {journey.startDate &&
                          journey.endDate
                            ? `${new Date(
                                journey.startDate
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )} – ${new Date(
                                journey.endDate
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}`
                            : "—"}
                        </td>

                        <td className="px-4 py-4 text-[10px] text-[#777]">
                          {journey.duration ||
                            "—"}
                        </td>

                        <td className="px-4 py-4 text-[10px] text-[#777]">
                          {
                            journey.currentRegistrations
                          }
                          /
                          {
                            journey.groupSizeLimit
                          }
                        </td>

                        <td className="px-4 py-4 text-[10px] text-[#777]">
                          ₹
                          {journey.standardPrice.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`rounded-[4px] px-2 py-1 text-[8px] ${
                              journey.status ===
                              "PUBLISHED"
                                ? "bg-[#E8F4E8] text-[#438047]"
                                : "bg-[#FFF3D6] text-[#A36B00]"
                            }`}
                          >
                            {
                              journey.status
                            }
                          </span>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex justify-center">

                            <button
                              type="button"
                              onClick={() =>
                                toggleWebsite(
                                  journey.id
                                )
                              }
                              className={`relative h-[18px] w-[34px] rounded-full ${
                                journey.showOnWebsite
                                  ? "bg-[#B43122]"
                                  : "bg-[#CFC9C3]"
                              }`}
                            >
                              <span
                                className={`absolute top-[3px] h-[12px] w-[12px] rounded-full bg-white transition ${
                                  journey.showOnWebsite
                                    ? "left-[19px]"
                                    : "left-[3px]"
                                }`}
                              />
                            </button>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex gap-3">

                            <Link
                              href={`/journeys/${journey.id}/edit`}
                              className="text-[9px] text-[#B43122]"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                deleteJourney(
                                  journey.id
                                )
                              }
                              className="text-[9px] text-[#777] hover:text-[#B43122]"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

                {visibleJourneys.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-20 text-center text-[11px] text-[#888]"
                    >
                      No journeys found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>


          <div className="flex items-center justify-between border-t border-[#E8E1DC] px-4 py-4">

            <p className="text-[9px] text-[#888]">
              Showing{" "}
              {filteredJourneys.length ===
              0
                ? 0
                : (page - 1) *
                    pageSize +
                  1}
              –
              {Math.min(
                page *
                  pageSize,
                filteredJourneys.length
              )}{" "}
              of{" "}
              {
                filteredJourneys.length
              }{" "}
              journeys
            </p>


            <div className="flex gap-2">

              <button
                type="button"
                disabled={
                  page === 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                className="rounded-[4px] border border-[#DED8D1] px-3 py-1 text-[9px] disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
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
                className="rounded-[4px] border border-[#DED8D1] px-3 py-1 text-[9px] disabled:opacity-40"
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