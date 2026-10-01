"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getDestinations,
  getJourneys,
  getContentForDestination,
  saveDestinations,
  Destination,
} from "@/lib/cmsStore";

export default function DestinationsPage() {
  const [mounted, setMounted] = useState(false);
  const [destinations, setDestinations] =
    useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 6;

  useEffect(() => {
    setMounted(true);
    setDestinations(getDestinations());
  }, []);

  const journeys = getJourneys();

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      if (!query) return true;

      return (
        destination.name.toLowerCase().includes(query) ||
        destination.region.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query)
      );
    });
  }, [destinations, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDestinations.length / pageSize
    )
  );

  const visibleDestinations =
    filteredDestinations.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const toggleWebsite = (id: string) => {
    const updated = destinations.map((destination) =>
      destination.id === id
        ? {
            ...destination,
            showOnWebsite:
              !destination.showOnWebsite,
            updatedAt: new Date().toISOString(),
          }
        : destination
    );

    setDestinations(updated);
    saveDestinations(updated);
  };

  const deleteDestination = (id: string) => {
    const destination = destinations.find(
      (item) => item.id === id
    );

    if (!destination) return;

    const confirmed = window.confirm(
      `Delete "${destination.name}"?`
    );

    if (!confirmed) return;

    const updated = destinations.filter(
      (item) => item.id !== id
    );

    setDestinations(updated);
    saveDestinations(updated);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">
        <div className="flex min-h-[400px] items-center justify-center text-[12px] text-[#888]">
          Loading destinations...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">
      <div className="mx-auto max-w-[1250px]">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#B43122]">
              MAARGA CMS
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Destinations
            </h1>

            <p className="mt-2 text-[13px] text-[#777]">
              Manage places and connect them to
              journey-specific itineraries and stays.
            </p>
          </div>

          <Link
            href="/destinations/new"
            className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white"
          >
            + Create New Destination
          </Link>

        </div>

        {/* SEARCH */}

        <div className="mt-7">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search destinations..."
            className="h-[40px] w-[340px] rounded-[6px] border border-[#DED8D1] bg-white px-4 text-[11px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#999] focus:border-[#B43122]"
          />
        </div>

        {/* TABLE */}

        <section className="mt-6 overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] border-collapse">

              <thead>
                <tr className="border-b border-[#E8E1DC]">

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Destination
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Region
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Country
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Journeys
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Website
                  </th>

                  <th className="px-5 py-4 text-left text-[9px] font-medium uppercase tracking-wide text-[#888]">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {visibleDestinations.map((destination) => {

                  const content =
                    getContentForDestination(
                      destination.id
                    );

                  const linkedJourneys =
                    journeys.filter((journey) =>
                      content.some(
                        (item) =>
                          item.journeyId ===
                          journey.id
                      )
                    );

                  return (
                    <tr
                      key={destination.id}
                      className="border-b border-[#EEE9E4] transition hover:bg-[#FCFAF8]"
                    >

                      <td className="px-5 py-5">
                        <p className="text-[11px] font-semibold text-[#292725]">
                          {destination.name}
                        </p>

                        {destination.description && (
                          <p className="mt-1 max-w-[300px] truncate text-[9px] text-[#999]">
                            {destination.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5 text-[10px] text-[#777]">
                        {destination.region || "—"}
                      </td>

                      <td className="px-5 py-5 text-[10px] text-[#777]">
                        {destination.country || "—"}
                      </td>

                      <td className="px-5 py-5">

                        {linkedJourneys.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {linkedJourneys.map(
                              (journey) => (
                                <span
                                  key={journey.id}
                                  className="rounded-[4px] bg-[#F2ECE7] px-2 py-1 text-[8px] text-[#666]"
                                >
                                  {journey.title}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-[#999]">
                            No journeys
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-5">

                        <span
                          className={`rounded-[4px] px-2 py-1 text-[8px] ${
                            destination.showOnWebsite
                              ? "bg-[#E8F4E8] text-[#438047]"
                              : "bg-[#F1ECE7] text-[#777]"
                          }`}
                        >
                          {destination.showOnWebsite
                            ? "PUBLISHED"
                            : "HIDDEN"}
                        </span>

                      </td>

                      <td className="px-5 py-5">

                        <div className="flex justify-center">

                          <button
                            type="button"
                            onClick={() =>
                              toggleWebsite(
                                destination.id
                              )
                            }
                            className={`relative h-[20px] w-[38px] rounded-full transition ${
                              destination.showOnWebsite
                                ? "bg-[#B43122]"
                                : "bg-[#CFC9C3]"
                            }`}
                          >
                            <span
                              className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow transition ${
                                destination.showOnWebsite
                                  ? "left-[21px]"
                                  : "left-[3px]"
                              }`}
                            />
                          </button>

                        </div>

                      </td>

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-4">

                          <Link
                            href={`/destinations/${destination.id}`}
                            className="text-[10px] text-[#B43122]"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteDestination(
                                destination.id
                              )
                            }
                            className="text-[10px] text-[#777] hover:text-[#B43122]"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

                {visibleDestinations.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-20 text-center"
                    >
                      <p className="text-[12px] text-[#777]">
                        No destinations found.
                      </p>

                      <Link
                        href="/destinations/new"
                        className="mt-3 inline-block text-[10px] text-[#B43122]"
                      >
                        + Create your first destination
                      </Link>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="flex items-center justify-between border-t border-[#E8E1DC] px-5 py-4">

            <p className="text-[9px] text-[#888]">
              Showing{" "}
              {filteredDestinations.length === 0
                ? 0
                : (page - 1) * pageSize + 1}
              –
              {Math.min(
                page * pageSize,
                filteredDestinations.length
              )}{" "}
              of{" "}
              {filteredDestinations.length} destinations
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="rounded-[4px] border border-[#DED8D1] px-3 py-2 text-[9px] disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                className="rounded-[4px] border border-[#DED8D1] px-3 py-2 text-[9px] disabled:opacity-40"
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