"use client";

import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  createId,
  getDestinationContent,
  getDestinations,
  getJourneys,
  saveDestinationContent,
  Destination,
  Journey,
  DestinationContent,
  Accommodation,
} from "@/lib/cmsStore";

import MediaPicker from "@/components/ui/MediaPicker";

export default function StayPage() {
  const params = useParams();
  const searchParams =
    useSearchParams();

  const destinationId =
    typeof params.id === "string"
      ? params.id
      : "";

  const queryJourneyId =
    searchParams.get(
      "journeyId"
    ) || "";

  const [destination, setDestination] =
    useState<Destination | null>(
      null
    );

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [journeyId, setJourneyId] =
    useState(queryJourneyId);

  const [content, setContent] =
    useState<DestinationContent | null>(
      null
    );

  const [accommodations, setAccommodations] =
    useState<Accommodation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* ============================================================
     LOAD DESTINATION / JOURNEYS
     ============================================================ */

  useEffect(() => {
    const destinations =
      getDestinations();

    const foundDestination =
      destinations.find(
        (item) =>
          item.id === destinationId
      );

    setDestination(
      foundDestination ?? null
    );

    const loadedJourneys =
      getJourneys();

    setJourneys(
      loadedJourneys
    );

    if (queryJourneyId) {
      loadContent(
        queryJourneyId
      );
    }

    setLoading(false);
  }, [
    destinationId,
    queryJourneyId,
  ]);

  /* ============================================================
     LOAD CONTENT
     ============================================================ */

  const loadContent = (
    selectedJourneyId: string
  ) => {
    if (!selectedJourneyId) {
      setJourneyId("");
      setContent(null);
      setAccommodations([]);
      return;
    }

    setJourneyId(
      selectedJourneyId
    );

    const found =
      getDestinationContent(
        destinationId,
        selectedJourneyId
      );

    setContent(
      found ?? null
    );

    setAccommodations(
      found?.accommodations ??
        []
    );
  };

  /* ============================================================
     SAVE STAY
     ============================================================ */

  const save = () => {
    if (!journeyId) {
      alert(
        "Please select a journey first."
      );

      return;
    }

    setSaving(true);

    const now =
      new Date().toISOString();

    const existing =
      content ??
      ({
        id: createId("ITN"),

        destinationId,

        journeyId,

        days: [],

        accommodations: [],

        createdAt: now,

        updatedAt: now,
      } satisfies DestinationContent);

    const updatedContent:
      DestinationContent = {
      ...existing,

      destinationId,

      journeyId,

      accommodations,

      updatedAt: now,
    };

    saveDestinationContent(
      updatedContent
    );

    setContent(
      updatedContent
    );

    setSaving(false);

    alert(
      "Stay information saved successfully."
    );
  };

  /* ============================================================
     ADD PROPERTY
     ============================================================ */

  const addAccommodation = () => {
    const newAccommodation:
      Accommodation = {
      id: createId("STY"),

      name: "New Property",

      description: "",

      image: "",

      tags: [],

      destinationSpecificNote:
        "",
    };

    setAccommodations(
      (current) => [
        ...current,
        newAccommodation,
      ]
    );
  };

  /* ============================================================
     UPDATE PROPERTY
     ============================================================ */

  const updateAccommodation = (
    accommodationId: string,
    changes: Partial<Accommodation>
  ) => {
    setAccommodations(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            accommodationId
              ? {
                  ...item,
                  ...changes,
                }
              : item
        )
    );
  };

  /* ============================================================
     DELETE PROPERTY
     ============================================================ */

  const deleteAccommodation = (
    accommodationId: string
  ) => {
    const accommodation =
      accommodations.find(
        (item) =>
          item.id ===
          accommodationId
      );

    if (!accommodation) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${accommodation.name || "this property"}"?`
      );

    if (!confirmed) {
      return;
    }

    setAccommodations(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            accommodationId
        )
    );
  };

  /* ============================================================
     DESTINATION NOT FOUND
     ============================================================ */

  if (
    !loading &&
    !destination
  ) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">

        <div className="mx-auto max-w-[1100px]">

          <div className="rounded-[10px] border border-[#DED8D1] bg-white p-10">

            <p className="text-[11px] uppercase tracking-[0.15em] text-[#B43122]">
              MAARGA CMS
            </p>

            <h1 className="mt-3 font-serif text-[30px] text-[#292725]">
              Destination not found
            </h1>

            <p className="mt-2 text-[11px] text-[#777]">
              The destination associated with this
              stay configuration could not be found.
            </p>

            <Link
              href="/destinations"
              className="mt-5 inline-block text-[10px] text-[#B43122]"
            >
              ← Back to Destinations
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* ============================================================
     LOADING
     ============================================================ */

  if (
    loading ||
    !destination
  ) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">

        <div className="flex min-h-[400px] items-center justify-center text-[11px] text-[#888]">
          Loading stay...
        </div>

      </main>
    );
  }

  const selectedJourney =
    journeys.find(
      (journey) =>
        journey.id ===
        journeyId
    );

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] uppercase tracking-[0.15em] text-[#B43122]">
              {destination.name}
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Stay
            </h1>

            <p className="mt-2 text-[12px] text-[#777]">
              Manage accommodation for a specific
              journey at this destination.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href={`/destinations/${destinationId}/itinerary${
                journeyId
                  ? `?journeyId=${journeyId}`
                  : ""
              }`}
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555] transition hover:border-[#B43122] hover:text-[#B43122]"
            >
              Itinerary
            </Link>


            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Stay"}
            </button>

          </div>

        </div>


        {/* ======================================================
            DESTINATION / JOURNEY
            ====================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-6">

          <div className="grid grid-cols-[1fr_300px] gap-6">

            <div>

              <p className="text-[9px] uppercase tracking-[0.15em] text-[#999]">
                Destination
              </p>

              <p className="mt-2 text-[14px] font-medium text-[#292725]">
                {destination.name}
              </p>

              <p className="mt-1 text-[10px] text-[#999]">
                {destination.region}

                {destination.region &&
                destination.country
                  ? ", "
                  : ""}

                {destination.country}
              </p>

            </div>


            <div>

              <label className="text-[9px] uppercase tracking-[0.15em] text-[#999]">
                Journey
              </label>

              <select
                value={journeyId}
                onChange={(event) =>
                  loadContent(
                    event.target.value
                  )
                }
                className="mt-2 h-[40px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725] outline-none focus:border-[#B43122]"
              >

                <option value="">
                  Select Journey
                </option>

                {journeys.map(
                  (journey) => (
                    <option
                      key={
                        journey.id
                      }
                      value={
                        journey.id
                      }
                    >
                      {
                        journey.title
                      }
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

        </section>


        {/* ======================================================
            NO JOURNEY
            ====================================================== */}

        {!journeyId ? (

          <div className="mt-6 rounded-[10px] border border-dashed border-[#DED8D1] bg-white p-20 text-center">

            <div className="mx-auto flex h-[55px] w-[55px] items-center justify-center rounded-full bg-[#F3EEE9] text-[23px] text-[#B43122]">
              +
            </div>

            <p className="mt-4 text-[12px] font-medium text-[#292725]">
              Select a journey
            </p>

            <p className="mt-2 text-[10px] text-[#888]">
              Choose the journey this stay
              configuration belongs to.
            </p>

          </div>

        ) : (

          <>

            {/* ==================================================
                SELECTED JOURNEY
                ================================================== */}

            <div className="mt-6 flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.15em] text-[#999]">
                  Selected Journey
                </p>

                <p className="mt-1 font-serif text-[22px] text-[#292725]">
                  {
                    selectedJourney?.title ||
                    "Journey"
                  }
                </p>

                {content && (
                  <p className="mt-1 text-[9px] text-[#999]">
                    Content ID:{" "}
                    {content.id}
                  </p>
                )}

              </div>


              <Link
                href={`/destinations/${destinationId}`}
                className="text-[10px] text-[#B43122]"
              >
                ← Back to Destination
              </Link>

            </div>


            {/* ==================================================
                ACCOMMODATION
                ================================================== */}

            <section className="mt-6 rounded-[10px] border border-[#DED8D1] bg-white p-7">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-[17px] font-semibold text-[#292725]">
                    Accommodation
                  </h2>

                  <p className="mt-1 text-[10px] text-[#777]">
                    Add the properties used for this
                    journey at {destination.name}.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    addAccommodation
                  }
                  className="rounded-[5px] border border-[#B43122] px-4 py-2 text-[10px] text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
                >
                  + Add Property
                </button>

              </div>


              {/* PROPERTY LIST */}

              <div className="mt-6 space-y-5">

                {accommodations.length ===
                  0 && (
                  <div className="rounded-[8px] border border-dashed border-[#DED8D1] p-14 text-center">

                    <p className="text-[11px] text-[#888]">
                      No accommodation added yet.
                    </p>

                    <button
                      type="button"
                      onClick={
                        addAccommodation
                      }
                      className="mt-3 text-[10px] text-[#B43122]"
                    >
                      + Add your first property
                    </button>

                  </div>
                )}


                {accommodations.map(
                  (
                    accommodation
                  ) => (

                    <div
                      key={
                        accommodation.id
                      }
                      className="rounded-[8px] border border-[#DED8D1] p-5"
                    >

                      {/* PROPERTY HEADER */}

                      <div className="flex items-start justify-between">

                        <div>

                          <p className="text-[12px] font-medium text-[#292725]">
                            {
                              accommodation.name ||
                              "New Property"
                            }
                          </p>

                          <p className="mt-1 text-[9px] text-[#999]">
                            Property
                          </p>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            deleteAccommodation(
                              accommodation.id
                            )
                          }
                          className="text-[9px] text-[#777] transition hover:text-[#B43122]"
                        >
                          Delete
                        </button>

                      </div>


                      {/* PROPERTY NAME */}

                      <div className="mt-5">

                        <label className="text-[9px] text-[#555]">
                          Property Name
                        </label>

                        <input
                          value={
                            accommodation.name
                          }
                          onChange={(event) =>
                            updateAccommodation(
                              accommodation.id,
                              {
                                name:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="Hotel / Property Name"
                          className="mt-2 h-[38px] w-full rounded-[5px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                        />

                      </div>


                      {/* PROPERTY IMAGE */}

                      <div className="mt-5">

                        <MediaPicker
                          label="Property Image"
                          value={
                            accommodation.image
                          }
                          onChange={(
                            image
                          ) =>
                            updateAccommodation(
                              accommodation.id,
                              {
                                image,
                              }
                            )
                          }
                          accept="image/*"
                        />

                      </div>


                      {/* DESCRIPTION */}

                      <div className="mt-5">

                        <label className="text-[9px] text-[#555]">
                          Description
                        </label>

                        <textarea
                          value={
                            accommodation.description
                          }
                          onChange={(event) =>
                            updateAccommodation(
                              accommodation.id,
                              {
                                description:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="Describe the property, room style, location, amenities..."
                          className="mt-2 min-h-[90px] w-full resize-none rounded-[5px] border border-[#DED8D1] bg-white px-3 py-3 text-[11px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                        />

                      </div>


                      {/* TAGS */}

                      <div className="mt-5">

                        <label className="text-[9px] text-[#555]">
                          Tags
                        </label>

                        <input
                          value={
                            accommodation.tags.join(
                              ", "
                            )
                          }
                          onChange={(event) =>
                            updateAccommodation(
                              accommodation.id,
                              {
                                tags:
                                  event.target.value
                                    .split(
                                      ","
                                    )
                                    .map(
                                      (
                                        tag
                                      ) =>
                                        tag.trim()
                                    )
                                    .filter(
                                      Boolean
                                    ),
                              }
                            )
                          }
                          placeholder="Heritage, Boutique, Luxury"
                          className="mt-2 h-[38px] w-full rounded-[5px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                        />

                        <p className="mt-1 text-[8px] text-[#999]">
                          Separate tags with commas.
                        </p>

                      </div>


                      {/* DESTINATION-SPECIFIC NOTE */}

                      <div className="mt-5">

                        <label className="text-[9px] text-[#555]">
                          Destination-specific Note
                        </label>

                        <textarea
                          value={
                            accommodation.destinationSpecificNote
                          }
                          onChange={(event) =>
                            updateAccommodation(
                              accommodation.id,
                              {
                                destinationSpecificNote:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="Special note for this destination / journey..."
                          className="mt-2 min-h-[75px] w-full resize-none rounded-[5px] border border-[#DED8D1] bg-white px-3 py-3 text-[11px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* ==================================================
                BOTTOM SAVE
                ================================================== */}

            <div className="mt-5 flex justify-end">

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-[6px] bg-[#B43122] px-6 py-3 text-[10px] text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Stay"}
              </button>

            </div>

          </>

        )}

      </div>

    </main>
  );
}