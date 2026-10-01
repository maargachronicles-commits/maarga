"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  createId,
  getJourneys,
  saveJourneys,
  Journey,
} from "@/lib/cmsStore";

export default function NewJourneyPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");
  const [duration, setDuration] =
    useState("");
  const [coverImage, setCoverImage] =
    useState("");

  const [standardPrice, setStandardPrice] =
    useState("");

  const [earlyBirdEnabled, setEarlyBirdEnabled] =
    useState(false);

  const [earlyBirdPrice, setEarlyBirdPrice] =
    useState("");

  const [earlyBirdDeadline, setEarlyBirdDeadline] =
    useState("");

  const [groupSizeLimit, setGroupSizeLimit] =
    useState("");

  const [status, setStatus] =
    useState<"PUBLISHED" | "DRAFT">(
      "DRAFT"
    );

  const [showOnWebsite, setShowOnWebsite] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* ============================================================
     AUTO DURATION
     ============================================================ */

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return;
    }

    const difference =
      end.getTime() -
      start.getTime();

    const nights = Math.floor(
      difference / 86400000
    );

    if (nights < 0) {
      return;
    }

    setDuration(
      `${nights + 1} Days / ${nights} Nights`
    );
  }, [startDate, endDate]);

  /* ============================================================
     SAVE
     ============================================================ */

  const handleSave = (
    saveStatus: "PUBLISHED" | "DRAFT"
  ) => {
    if (!title.trim()) {
      alert(
        "Please enter a journey name."
      );
      return;
    }

    if (!startDate) {
      alert(
        "Please select the start date."
      );
      return;
    }

    if (!endDate) {
      alert(
        "Please select the end date."
      );
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      alert(
        "End date cannot be before the start date."
      );
      return;
    }

    const price =
      Number(standardPrice) || 0;

    if (price <= 0) {
      alert(
        "Please enter a valid journey price."
      );
      return;
    }

    const capacity =
      Number(groupSizeLimit) || 0;

    if (capacity <= 0) {
      alert(
        "Please enter the maximum group size."
      );
      return;
    }

    if (
      earlyBirdEnabled &&
      Number(earlyBirdPrice) <= 0
    ) {
      alert(
        "Please enter a valid early-bird price."
      );
      return;
    }

    if (
      earlyBirdEnabled &&
      !earlyBirdDeadline
    ) {
      alert(
        "Please select an early-bird deadline."
      );
      return;
    }

    setSaving(true);

    const now =
      new Date().toISOString();

    const journey: Journey = {
      id: createId("JRN"),

      title: title.trim(),

      startDate,

      endDate,

      duration:
        duration.trim(),

      coverImage:
        coverImage.trim(),

      standardPrice: price,

      earlyBirdEnabled,

      earlyBirdPrice:
        earlyBirdEnabled
          ? Number(
              earlyBirdPrice
            ) || 0
          : 0,

      earlyBirdDeadline:
        earlyBirdEnabled
          ? earlyBirdDeadline
          : "",

      groupSizeLimit:
        capacity,

      currentRegistrations: 0,

      status: saveStatus,

      showOnWebsite,

      createdAt: now,

      updatedAt: now,
    };

    saveJourneys([
      ...getJourneys(),
      journey,
    ]);

    window.location.href =
      `/journeys/${journey.id}/edit`;
  };

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] text-[#777]">
              Journeys &gt; Create New Journey
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Create New Journey
            </h1>

            <p className="mt-2 text-[13px] text-[#77716C]">
              Create a bookable journey with its
              dates, pricing, and capacity.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href="/journeys"
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555]"
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave("DRAFT")
              }
              className="rounded-[6px] border border-[#B43122] bg-white px-5 py-3 text-[11px] text-[#B43122] disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave("PUBLISHED")
              }
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white disabled:opacity-50"
            >
              Publish Journey
            </button>

          </div>

        </div>


        <div className="mt-7 grid grid-cols-[1fr_300px] gap-6">

          {/* LEFT */}

          <div className="space-y-5">

            {/* JOURNEY DETAILS */}

            <section className="rounded-[10px] border border-[#E3DDD7] bg-white p-7">

              <h2 className="text-[15px] font-semibold text-[#292725]">
                Journey Details
              </h2>

              <div className="mt-6 space-y-5">

                {/* NAME */}

                <div>

                  <label className="text-[10px] font-medium text-[#555]">
                    Journey Name
                  </label>

                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    placeholder="The Temple Architects of the Deccan"
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#A19A94] focus:border-[#B43122]"
                  />

                </div>


                {/* DATES */}

                <div className="grid grid-cols-2 gap-5">

                  <div>

                    <label className="text-[10px] font-medium text-[#555]">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                      className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#B43122]"
                    />

                  </div>


                  <div>

                    <label className="text-[10px] font-medium text-[#555]">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      min={
                        startDate ||
                        undefined
                      }
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                      className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#B43122]"
                    />

                  </div>

                </div>


                {/* DURATION */}

                <div>

                  <label className="text-[10px] font-medium text-[#555]">
                    Duration
                  </label>

                  <input
                    value={duration}
                    onChange={(event) =>
                      setDuration(
                        event.target.value
                      )
                    }
                    placeholder="6 Days / 7 Nights"
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#B43122]"
                  />

                </div>


                {/* COVER */}

                <div>

                  <label className="text-[10px] font-medium text-[#555]">
                    Cover Image URL
                  </label>

                  <input
                    value={coverImage}
                    onChange={(event) =>
                      setCoverImage(
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] outline-none focus:border-[#B43122]"
                  />

                </div>

              </div>

            </section>


            {/* PRICING */}

            <section className="rounded-[10px] border border-[#E3DDD7] bg-white p-7">

              <h2 className="text-[15px] font-semibold text-[#292725]">
                Pricing
              </h2>

              <div className="mt-6 space-y-5">

                <div>

                  <label className="text-[10px] font-medium text-[#555]">
                    Standard Price (INR)
                  </label>

                  <div className="relative mt-2">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#777]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={standardPrice}
                      onChange={(event) =>
                        setStandardPrice(
                          event.target.value
                        )
                      }
                      className="h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white pl-8 pr-3 text-[12px] text-[#292725] outline-none focus:border-[#B43122]"
                    />

                  </div>

                </div>


                {/* EARLY BIRD */}

                <div className="rounded-[7px] border border-[#E8E1DC] bg-[#FCFAF8] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-[12px] font-medium text-[#292725]">
                        Early-bird pricing
                      </h3>

                      <p className="mt-1 text-[9px] text-[#888]">
                        Enable a discounted price until
                        a specific deadline.
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        setEarlyBirdEnabled(
                          (value) =>
                            !value
                        )
                      }
                      className={`relative h-[20px] w-[38px] rounded-full ${
                        earlyBirdEnabled
                          ? "bg-[#B43122]"
                          : "bg-[#CFC9C3]"
                      }`}
                    >

                      <span
                        className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow ${
                          earlyBirdEnabled
                            ? "left-[21px]"
                            : "left-[3px]"
                        }`}
                      />

                    </button>

                  </div>


                  {earlyBirdEnabled && (

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>

                        <label className="text-[9px] font-medium text-[#555]">
                          Early-bird Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            earlyBirdPrice
                          }
                          onChange={(
                            event
                          ) =>
                            setEarlyBirdPrice(
                              event.target
                                .value
                            )
                          }
                          className="mt-2 h-[38px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725]"
                        />

                      </div>


                      <div>

                        <label className="text-[9px] font-medium text-[#555]">
                          Deadline
                        </label>

                        <input
                          type="date"
                          value={
                            earlyBirdDeadline
                          }
                          onChange={(
                            event
                          ) =>
                            setEarlyBirdDeadline(
                              event.target
                                .value
                            )
                          }
                          className="mt-2 h-[38px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725]"
                        />

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </section>


            {/* CAPACITY */}

            <section className="rounded-[10px] border border-[#E3DDD7] bg-white p-7">

              <h2 className="text-[15px] font-semibold text-[#292725]">
                Capacity
              </h2>

              <div className="mt-6">

                <label className="text-[10px] font-medium text-[#555]">
                  Maximum Group Size
                </label>

                <input
                  type="number"
                  min="1"
                  value={groupSizeLimit}
                  onChange={(event) =>
                    setGroupSizeLimit(
                      event.target.value
                    )
                  }
                  placeholder="12"
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725]"
                />

              </div>

            </section>

          </div>


          {/* RIGHT */}

          <aside>

            <section className="rounded-[10px] border border-[#E3DDD7] bg-white p-6">

              <h2 className="text-[14px] font-semibold text-[#292725]">
                Publishing settings
              </h2>

              <div className="mt-5 space-y-5">

                <div>

                  <label className="text-[9px] text-[#888]">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as
                          | "PUBLISHED"
                          | "DRAFT"
                      )
                    }
                    className="mt-2 h-[38px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725]"
                  >

                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                  </select>

                </div>


                <div className="flex items-center justify-between border-t border-[#E8E1DC] pt-5">

                  <div>

                    <p className="text-[10px] font-medium text-[#292725]">
                      Show on website
                    </p>

                    <p className="mt-1 text-[8px] text-[#999]">
                      {showOnWebsite
                        ? "Visible publicly"
                        : "Hidden publicly"}
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setShowOnWebsite(
                        (value) =>
                          !value
                      )
                    }
                    className={`relative h-[20px] w-[38px] rounded-full ${
                      showOnWebsite
                        ? "bg-[#B43122]"
                        : "bg-[#CFC9C3]"
                    }`}
                  >

                    <span
                      className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow ${
                        showOnWebsite
                          ? "left-[21px]"
                          : "left-[3px]"
                      }`}
                    />

                  </button>

                </div>


                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    handleSave(
                      status
                    )
                  }
                  className="h-[40px] w-full rounded-[6px] bg-[#B43122] text-[11px] text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : status ===
                      "PUBLISHED"
                    ? "Publish Journey"
                    : "Save Draft"}
                </button>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}
