"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getScholars,
  saveScholars,
  Scholar,
} from "@/lib/cmsStore";

type Filter =
  | "ALL"
  | "CORE"
  | "NETWORK"
  | "PUBLISHED"
  | "DRAFT";

export default function IntellectsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [scholars, setScholars] =
    useState<Scholar[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("ALL");

  /*
   * ============================================================
   * LOAD SCHOLARS
   * ============================================================
   */

  useEffect(() => {
    setMounted(true);
    setScholars(getScholars());
  }, []);

  /*
   * ============================================================
   * FILTER SCHOLARS
   * ============================================================
   */

  const filteredScholars = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return scholars.filter((scholar) => {
      const matchesSearch =
        !query ||
        scholar.name
          .toLowerCase()
          .includes(query) ||
        scholar.credential
          .toLowerCase()
          .includes(query) ||
        scholar.group
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "CORE") {
        return (
          scholar.group ===
          "Founder / Core Scholar"
        );
      }

      if (filter === "NETWORK") {
        return (
          scholar.group ===
          "Network Scholar"
        );
      }

      if (
        filter === "PUBLISHED"
      ) {
        return scholar.status === "Published";
      }

      if (filter === "DRAFT") {
        return scholar.status === "Draft";
      }

      return true;
    });
  }, [scholars, search, filter]);

  /*
   * ============================================================
   * DELETE SCHOLAR
   * ============================================================
   */

  const deleteScholar = (
    scholarId: string
  ) => {
    const scholar = scholars.find(
      (item) =>
        item.id === scholarId
    );

    if (!scholar) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${scholar.name}" permanently?`
      );

    if (!confirmed) {
      return;
    }

    const updated =
      scholars.filter(
        (item) =>
          item.id !== scholarId
      );

    setScholars(updated);

    saveScholars(updated);
  };

  /*
   * ============================================================
   * HYDRATION
   * ============================================================
   */

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#F8F5F1] p-10">

        <div className="mx-auto max-w-[1400px]">

          <div className="flex min-h-[500px] items-center justify-center">

            <p className="text-[12px] text-[#888]">
              Loading scholars...
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

            <h1 className="mt-2 font-serif text-[38px] text-[#292725]">
              Intellects
            </h1>

            <p className="mt-2 text-[14px] text-[#77716C]">
              Manage scholars, historians, and contributors.
            </p>

          </div>


          <Link
            href="/intellects/new"
            className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[12px] font-medium text-white transition hover:opacity-90"
          >
            + Add New Scholar
          </Link>

        </div>


        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <div className="mt-7 flex items-center gap-3">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search scholars..."
            autoComplete="off"
            className="h-[40px] w-[385px] rounded-[6px] border border-[#DED8D1] bg-white px-4 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#9B948E] focus:border-[#A62F20]"
            style={{
              color: "#292725",
              WebkitTextFillColor:
                "#292725",
            }}
          />


          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target
                  .value as Filter
              )
            }
            className="h-[40px] w-[210px] rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
          >
            <option value="ALL">
              All Scholars
            </option>

            <option value="CORE">
              Founder / Core Scholars
            </option>

            <option value="NETWORK">
              Network Scholars
            </option>

            <option value="PUBLISHED">
              Published
            </option>

            <option value="DRAFT">
              Drafts
            </option>
          </select>

        </div>


        {/* ======================================================
            SCHOLAR TABLE
        ====================================================== */}

        <section className="mt-7 overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] border-collapse">

              <thead>

                <tr className="border-b border-[#E8E1DB] bg-[#FCFAF8]">

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Scholar
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Credential
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Listing Group
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-medium uppercase tracking-[0.08em] text-[#888]">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredScholars.map(
                  (scholar) => (

                    <tr
                      key={scholar.id}
                      className="border-b border-[#EEE8E3] last:border-b-0 hover:bg-[#FCFAF8]"
                    >

                      {/* SCHOLAR */}

                      <td className="px-6 py-5">

                        <p className="text-[12px] font-medium text-[#292725]">
                          {scholar.name}
                        </p>

                      </td>


                      {/* CREDENTIAL */}

                      <td className="px-6 py-5">

                        <p className="max-w-[320px] text-[11px] text-[#77716C]">
                          {scholar.credential}
                        </p>

                      </td>


                      {/* GROUP */}

                      <td className="px-6 py-5">

                        <span className="inline-flex rounded-[4px] bg-[#F1ECE7] px-2 py-1 text-[9px] text-[#777]">

                          {scholar.group ===
                          "Founder / Core Scholar"
                            ? "CORE SCHOLAR"
                            : "NETWORK SCHOLAR"}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-[4px] px-2 py-1 text-[9px] font-medium ${
                            scholar.status ===
                            "Published"
                              ? "bg-[#E8F4E8] text-[#438047]"
                              : "bg-[#FFF3D6] text-[#A36B00]"
                          }`}
                        >
                          {scholar.status.toUpperCase()}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-4">

                          <Link
                            href={`/intellects/${scholar.id}`}
                            className="text-[10px] text-[#A62F20] hover:underline"
                          >
                            View
                          </Link>

                          <Link
                            href={`/intellects/${scholar.id}`}
                            className="text-[10px] text-[#77716C] hover:text-[#A62F20]"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteScholar(
                                scholar.id
                              )
                            }
                            className="text-[10px] text-[#77716C] hover:text-[#A62F20]"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {filteredScholars.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center"
                    >

                      {scholars.length ===
                      0 ? (
                        <>
                          <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#F5ECE8] text-[24px] text-[#A62F20]">
                            +
                          </div>

                          <h2 className="mt-5 font-serif text-[24px] text-[#292725]">
                            No scholars yet
                          </h2>

                          <p className="mx-auto mt-2 max-w-[500px] text-[13px] leading-[1.5] text-[#77716C]">
                            Add your first scholar
                            to start building the
                            Intellects section of
                            the MAARGA website.
                          </p>

                          <Link
                            href="/intellects/new"
                            className="mt-5 inline-block text-[12px] text-[#A62F20] hover:underline"
                          >
                            + Add your first scholar
                          </Link>
                        </>
                      ) : (
                        <>
                          <p className="text-[13px] text-[#77716C]">
                            No scholars match your
                            current search or filter.
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setFilter(
                                "ALL"
                              );
                            }}
                            className="mt-3 text-[12px] text-[#A62F20] hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      )}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ======================================================
              FOOTER
          ====================================================== */}

          {filteredScholars.length >
            0 && (

            <div className="flex items-center justify-between border-t border-[#E8E1DB] px-6 py-4">

              <p className="text-[10px] text-[#88817B]">
                Showing{" "}
                {filteredScholars.length}{" "}
                of {scholars.length} scholars
              </p>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}