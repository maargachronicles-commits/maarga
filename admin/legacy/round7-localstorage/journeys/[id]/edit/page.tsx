"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  getJourneys,
  saveJourneys,
  getDestinations,
  getContentForJourney,
  Journey,
  Destination,
} from "@/lib/cmsStore";

export default function EditJourneyPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [journey, setJourney] =
    useState<Journey | null>(null);

  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [title, setTitle] =
    useState("");

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
    useState<
      "PUBLISHED" | "DRAFT"
    >("DRAFT");

  const [showOnWebsite, setShowOnWebsite] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const found =
      getJourneys().find(
        (item) =>
          item.id === id
      );

    if (!found) return;

    setJourney(found);

    setTitle(found.title);
    setStartDate(
      found.startDate
    );
    setEndDate(
      found.endDate
    );
    setDuration(
      found.duration
    );
    setCoverImage(
      found.coverImage
    );
    setStandardPrice(
      String(
        found.standardPrice
      )
    );
    setEarlyBirdEnabled(
      found.earlyBirdEnabled
    );
    setEarlyBirdPrice(
      String(
        found.earlyBirdPrice
      )
    );
    setEarlyBirdDeadline(
      found.earlyBirdDeadline
    );
    setGroupSizeLimit(
      String(
        found.groupSizeLimit
      )
    );
    setStatus(
      found.status
    );
    setShowOnWebsite(
      found.showOnWebsite
    );

    setDestinations(
      getDestinations()
    );
  }, [id]);

  const linkedDestinations =
    getContentForJourney(id)
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

  const saveChanges = () => {
    if (!journey) return;

    if (!title.trim()) {
      alert(
        "Please enter a journey name."
      );
      return;
    }

    const updated =
      getJourneys().map(
        (item) =>
          item.id === id
            ? {
                ...item,

                title:
                  title.trim(),

                startDate,

                endDate,

                duration:
                  duration.trim(),

                coverImage:
                  coverImage.trim(),

                standardPrice:
                  Number(
                    standardPrice
                  ) || 0,

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
                  Number(
                    groupSizeLimit
                  ) || 0,

                status,

                showOnWebsite,

                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    setSaving(true);

    saveJourneys(updated);

    router.push(
      "/journeys"
    );
  };

  if (!journey) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">
        <div className="rounded-[10px] border border-[#DED8D1] bg-white p-10">
          <h1 className="font-serif text-[28px]">
            Journey not found
          </h1>

          <Link
            href="/journeys"
            className="mt-4 inline-block text-[12px] text-[#B43122]"
          >
            ← Back to Journeys
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] uppercase tracking-[0.18em] text-[#B43122]">
              Journeys
            </p>

            <h1 className="mt-2 font-serif text-[38px] text-[#292725]">
              {title}
            </h1>

            <p className="mt-2 text-[13px] text-[#777]">
              Manage journey details, pricing and
              booking information.
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
              onClick={saveChanges}
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white"
            >
              {saving
                ? "Saving..."
                : "Save Journey"}
            </button>

          </div>

        </div>


        {/* LINKED DESTINATIONS */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[9px] uppercase tracking-[0.18em] text-[#999]">
                Linked destinations
              </p>

              <p className="mt-1 text-[11px] text-[#777]">
                Destinations are connected from the
                Destination module.
              </p>

            </div>

            <span className="text-[10px] text-[#999]">
              {linkedDestinations.length} linked
            </span>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">

            {linkedDestinations.length >
            0 ? (
              linkedDestinations.map(
                (destination) => (
                  <Link
                    key={
                      destination.id
                    }
                    href={`/destinations/${destination.id}`}
                    className="rounded-[5px] border border-[#DED8D1] px-3 py-2 text-[10px] text-[#292725] hover:border-[#B43122] hover:text-[#B43122]"
                  >
                    {destination.name}
                  </Link>
                )
              )
            ) : (
              <span className="text-[10px] text-[#999]">
                No destinations have been linked yet.
              </span>
            )}

          </div>

        </section>


        <div className="mt-6 grid grid-cols-[1fr_300px] gap-6">

          <div className="space-y-5">

            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-7">

              <h2 className="text-[15px] font-semibold">
                Journey Details
              </h2>

              <div className="mt-6 space-y-5">

                <div>
                  <label className="text-[10px] font-medium">
                    Journey Name
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725]"
                  />
                </div>


                <div className="grid grid-cols-2 gap-5">

                  <div>
                    <label className="text-[10px] font-medium">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={(e) =>
                        setStartDate(
                          e.target.value
                        )
                      }
                      className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={
                        endDate
                      }
                      onChange={(e) =>
                        setEndDate(
                          e.target.value
                        )
                      }
                      className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                    />
                  </div>

                </div>


                <div>
                  <label className="text-[10px] font-medium">
                    Duration
                  </label>

                  <input
                    value={
                      duration
                    }
                    onChange={(e) =>
                      setDuration(
                        e.target.value
                      )
                    }
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                  />
                </div>


                <div>
                  <label className="text-[10px] font-medium">
                    Cover Image URL
                  </label>

                  <input
                    value={
                      coverImage
                    }
                    onChange={(e) =>
                      setCoverImage(
                        e.target.value
                      )
                    }
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                  />
                </div>

              </div>

            </section>


            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-7">

              <h2 className="text-[15px] font-semibold">
                Pricing
              </h2>

              <div className="mt-6 space-y-5">

                <div>
                  <label className="text-[10px] font-medium">
                    Standard Price (INR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      standardPrice
                    }
                    onChange={(e) =>
                      setStandardPrice(
                        e.target.value
                      )
                    }
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                  />
                </div>


                <div className="rounded-[7px] border border-[#E8E1DC] bg-[#FCFAF8] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[12px] font-medium">
                        Early-bird pricing
                      </p>

                      <p className="mt-1 text-[9px] text-[#888]">
                        Optional discounted pricing.
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
                        className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white ${
                          earlyBirdEnabled
                            ? "left-[21px]"
                            : "left-[3px]"
                        }`}
                      />
                    </button>

                  </div>


                  {earlyBirdEnabled && (
                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <input
                        type="number"
                        value={
                          earlyBirdPrice
                        }
                        onChange={(e) =>
                          setEarlyBirdPrice(
                            e.target.value
                          )
                        }
                        placeholder="Early-bird price"
                        className="h-[38px] rounded-[6px] border border-[#DED8D1] px-3 text-[11px]"
                      />

                      <input
                        type="date"
                        value={
                          earlyBirdDeadline
                        }
                        onChange={(e) =>
                          setEarlyBirdDeadline(
                            e.target.value
                          )
                        }
                        className="h-[38px] rounded-[6px] border border-[#DED8D1] px-3 text-[11px]"
                      />

                    </div>
                  )}

                </div>

              </div>

            </section>


            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-7">

              <h2 className="text-[15px] font-semibold">
                Capacity
              </h2>

              <div className="mt-6">

                <label className="text-[10px] font-medium">
                  Maximum Group Size
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    groupSizeLimit
                  }
                  onChange={(e) =>
                    setGroupSizeLimit(
                      e.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px]"
                />

                <p className="mt-2 text-[9px] text-[#999]">
                  Current registrations:{" "}
                  {
                    journey.currentRegistrations
                  }
                </p>

              </div>

            </section>

          </div>


          <aside className="h-fit">

            <section className="rounded-[10px] border border-[#DED8D1] bg-white p-6">

              <h2 className="text-[14px] font-semibold">
                Publishing settings
              </h2>

              <div className="mt-5">

                <label className="text-[9px] text-[#888]">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target
                        .value as
                        | "PUBLISHED"
                        | "DRAFT"
                    )
                  }
                  className="mt-2 h-[38px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px]"
                >

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>

                </select>


                <div className="mt-5 flex items-center justify-between border-t border-[#ECE6E0] pt-5">

                  <div>
                    <p className="text-[10px] font-medium">
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
                      className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white ${
                        showOnWebsite
                          ? "left-[21px]"
                          : "left-[3px]"
                      }`}
                    />
                  </button>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}