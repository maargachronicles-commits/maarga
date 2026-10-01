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
  getDestinations,
  getJourneys,
  getDestinationContent,
  saveDestinationContent,
  getActivityIcons,
  Destination,
  Journey,
  DestinationContent,
  ItineraryDay,
  ItineraryStop,
  ItineraryStopType,
  ActivityIcon,
} from "@/lib/cmsStore";

export default function ItineraryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const destinationId =
    typeof params.id === "string"
      ? params.id
      : "";

  const queryJourneyId =
    searchParams.get("journeyId") || "";

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [journeyId, setJourneyId] =
    useState(queryJourneyId);

  const [content, setContent] =
    useState<DestinationContent | null>(
      null
    );

  const [days, setDays] =
    useState<ItineraryDay[]>([]);

  /* ============================================================
     ACTIVITY ICONS
     ============================================================ */

  const [activityIcons, setActivityIcons] =
    useState<ActivityIcon[]>([]);

  /* ============================================================
     LOAD
     ============================================================ */

  useEffect(() => {
    const foundDestination =
      getDestinations().find(
        (item) =>
          item.id === destinationId
      );

    setDestination(
      foundDestination ?? null
    );

    setJourneys(
      getJourneys()
    );

    setActivityIcons(
      getActivityIcons()
    );

    /*
     * If this page is opened from a linked journey,
     * load that destination + journey combination.
     */
    if (queryJourneyId) {
      loadContent(
        queryJourneyId
      );
    }

    /*
     * Refresh icons if the Icon Library changes
     * while this page is open.
     */
    const handleIconsUpdated =
      () => {
        setActivityIcons(
          getActivityIcons()
        );
      };

    window.addEventListener(
      "maarga-activity-icons-updated",
      handleIconsUpdated
    );

    return () => {
      window.removeEventListener(
        "maarga-activity-icons-updated",
        handleIconsUpdated
      );
    };
  }, [
    destinationId,
    queryJourneyId,
  ]);

  /* ============================================================
     LOAD DESTINATION + JOURNEY CONTENT
     ============================================================ */

  const loadContent = (
    selectedJourneyId: string
  ) => {
    setJourneyId(
      selectedJourneyId
    );

    const found =
      getDestinationContent(
        destinationId,
        selectedJourneyId
      );

    setContent(found);

    setDays(
      found?.days ?? []
    );
  };

  /* ============================================================
     SAVE
     ============================================================ */

  const save = () => {
    if (!journeyId) {
      alert(
        "Select a journey first."
      );

      return;
    }

    const existing =
      content ??
      ({
        id: createId("ITN"),

        destinationId,

        journeyId,

        days: [],

        accommodations: [],

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      } satisfies DestinationContent);

    saveDestinationContent({
      ...existing,

      days,

      updatedAt:
        new Date().toISOString(),
    });

    /*
     * Refresh saved content so the current state
     * remains the source of truth.
     */
    const saved =
      getDestinationContent(
        destinationId,
        journeyId
      );

    setContent(
      saved
    );

    alert(
      "Itinerary saved."
    );
  };

  /* ============================================================
     DAYS
     ============================================================ */

  const addDay = () => {
    setDays(
      (current) => [
        ...current,

        {
          id: createId("DAY"),

          dayNumber:
            current.length + 1,

          title:
            `Day ${current.length + 1}`,

          coverImage: "",

          stops: [],
        },
      ]
    );
  };

  const updateDay = (
    dayId: string,
    changes: Partial<ItineraryDay>
  ) => {
    setDays(
      (current) =>
        current.map(
          (day) =>
            day.id === dayId
              ? {
                  ...day,
                  ...changes,
                }
              : day
        )
    );
  };

  const deleteDay = (
    dayId: string
  ) => {
    setDays(
      (current) =>
        current
          .filter(
            (day) =>
              day.id !== dayId
          )
          .map(
            (
              day,
              index
            ) => ({
              ...day,

              dayNumber:
                index + 1,
            })
          )
    );
  };

  /* ============================================================
     STOPS
     ============================================================ */

  const getDefaultActivityType =
    (): ItineraryStopType => {
      /*
       * Keep Walking as the fallback because
       * it exists in the existing ItineraryStopType.
       */
      return "Walking";
    };

  const addStop = (
    dayId: string
  ) => {
    setDays(
      (current) =>
        current.map(
          (day) => {
            if (
              day.id !==
              dayId
            ) {
              return day;
            }

            const stop: ItineraryStop =
              {
                id:
                  createId("STP"),

                type:
                  getDefaultActivityType(),

                title:
                  "New Stop",

                description:
                  "",

                order:
                  day.stops.length,
              };

            return {
              ...day,

              stops: [
                ...day.stops,
                stop,
              ],
            };
          }
        )
    );
  };

  const updateStop = (
    dayId: string,
    stopId: string,
    changes: Partial<ItineraryStop>
  ) => {
    setDays(
      (current) =>
        current.map(
          (day) =>
            day.id === dayId
              ? {
                  ...day,

                  stops:
                    day.stops.map(
                      (stop) =>
                        stop.id ===
                        stopId
                          ? {
                              ...stop,
                              ...changes,
                            }
                          : stop
                    ),
                }
              : day
        )
    );
  };

  const deleteStop = (
    dayId: string,
    stopId: string
  ) => {
    setDays(
      (current) =>
        current.map(
          (day) =>
            day.id === dayId
              ? {
                  ...day,

                  stops:
                    day.stops
                      .filter(
                        (stop) =>
                          stop.id !==
                          stopId
                      )
                      .map(
                        (
                          stop,
                          index
                        ) => ({
                          ...stop,

                          order:
                            index,
                        })
                      ),
                }
              : day
        )
    );
  };

  /* ============================================================
     ACTIVITY ICON HELPERS
     ============================================================ */

  const getIconForType = (
    type: ItineraryStopType
  ) => {
    return (
      activityIcons.find(
        (icon) =>
          icon.name === type
      ) ?? null
    );
  };

  /* ============================================================
     EMPTY / ERROR STATE
     ============================================================ */

  if (!destination) {
    return (
      <main className="min-h-screen bg-[#FFFDFA] p-10">

        <div className="rounded-[10px] border border-[#DED8D1] bg-white p-10">

          <h1 className="font-serif text-[28px] text-[#292725]">
            Destination not found
          </h1>

          <Link
            href="/destinations"
            className="mt-4 inline-block text-[11px] text-[#B43122]"
          >
            ← Back to Destinations
          </Link>

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
              Itinerary
            </h1>

            <p className="mt-2 text-[12px] text-[#777]">
              Build the itinerary for a specific
              journey at this destination.
            </p>

          </div>


          <button
            type="button"
            onClick={save}
            className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white"
          >
            Save Itinerary
          </button>

        </div>


        {/* ======================================================
            DESTINATION + JOURNEY
            ====================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-6">

          <div className="grid grid-cols-[1fr_300px] gap-6">

            <div>

              <p className="text-[9px] uppercase tracking-[0.14em] text-[#999]">
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

              <label className="text-[9px] uppercase tracking-[0.14em] text-[#999]">
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

            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F3EEE9] text-[22px] text-[#B43122]">
              +
            </div>

            <p className="mt-4 text-[12px] font-medium text-[#292725]">
              Select a journey
            </p>

            <p className="mt-2 text-[10px] text-[#888]">
              Choose the journey this itinerary
              belongs to.
            </p>

          </div>

        ) : (

          <>

            {/* ==================================================
                SELECTED JOURNEY
                ================================================== */}

            <div className="mt-6 flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999]">
                  Selected Journey
                </p>

                <p className="mt-1 font-serif text-[22px] text-[#292725]">
                  {
                    selectedJourney?.title
                  }
                </p>

                {content && (
                  <p className="mt-1 text-[9px] text-[#999]">
                    Itinerary ID:{" "}
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
                ICON LIBRARY NOTICE
                ================================================== */}

            {activityIcons.length ===
              0 && (
              <div className="mt-5 rounded-[8px] border border-[#E6D7D1] bg-[#FFF8F5] px-5 py-4">

                <p className="text-[10px] font-medium text-[#B43122]">
                  No activity icons found.
                </p>

                <p className="mt-1 text-[9px] text-[#777]">
                  Add your activity icons from
                  the Logo / Activity Icons section.
                </p>

                <Link
                  href="/logo"
                  className="mt-2 inline-block text-[9px] text-[#B43122]"
                >
                  Open Activity Icon Library →
                </Link>

              </div>
            )}


            {/* ==================================================
                DAYS
                ================================================== */}

            <div className="mt-6 space-y-5">

              {days.length ===
                0 && (
                <div className="rounded-[10px] border border-dashed border-[#DED8D1] bg-white p-16 text-center">

                  <p className="text-[12px] text-[#777]">
                    No itinerary days yet.
                  </p>

                  <p className="mt-2 text-[10px] text-[#999]">
                    Start by adding Day 1.
                  </p>

                </div>
              )}


              {days.map(
                (day) => (

                  <section
                    key={day.id}
                    className="overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white"
                  >

                    {/* DAY HEADER */}

                    <div className="flex items-center justify-between border-b border-[#ECE6E0] px-6 py-5">

                      <div className="flex min-w-0 items-center gap-4">

                        <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[#B43122]">
                          Day{" "}
                          {
                            day.dayNumber
                          }
                        </span>


                        <input
                          value={
                            day.title
                          }
                          onChange={(event) =>
                            updateDay(
                              day.id,
                              {
                                title:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          className="min-w-0 border-none bg-transparent font-serif text-[22px] text-[#292725] outline-none"
                        />

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          deleteDay(
                            day.id
                          )
                        }
                        className="shrink-0 text-[9px] text-[#777] transition hover:text-[#B43122]"
                      >
                        Delete Day
                      </button>

                    </div>


                    {/* DAY BODY */}

                    <div className="p-6">

                      <div className="mb-5">

                        <label className="text-[9px] font-medium text-[#555]">
                          Day Cover Image
                        </label>

                        <input
                          value={
                            day.coverImage
                          }
                          onChange={(event) =>
                            updateDay(
                              day.id,
                              {
                                coverImage:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="https://..."
                          className="mt-2 h-[38px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[10px] text-[#292725]"
                        />

                      </div>


                      {/* STOPS */}

                      <div className="space-y-4">

                        {day.stops.map(
                          (
                            stop,
                            index
                          ) => {

                            const icon =
                              getIconForType(
                                stop.type
                              );

                            return (
                              <div
                                key={
                                  stop.id
                                }
                                className="rounded-[8px] border border-[#E7E0DB] bg-[#FFFEFD] p-4"
                              >

                                <div className="flex items-start gap-4">

                                  {/* ORDER */}

                                  <div className="flex h-[36px] w-[28px] shrink-0 items-center justify-center text-[9px] text-[#999]">
                                    {index +
                                      1}
                                  </div>


                                  {/* ICON */}

                                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[7px] border border-[#E5DED8] bg-[#F5F0EC]">

                                    {icon?.image ? (
                                      <img
                                        src={
                                          icon.image
                                        }
                                        alt={
                                          icon.name
                                        }
                                        className="h-[30px] w-[30px] object-contain"
                                      />
                                    ) : (
                                      <span className="text-[16px] text-[#B43122]">
                                        ✦
                                      </span>
                                    )}

                                  </div>


                                  {/* CONTENT */}

                                  <div className="min-w-0 flex-1">

                                    <div className="grid grid-cols-[220px_1fr] gap-3">

                                      {/* ACTIVITY */}

                                      <div>

                                        <label className="text-[8px] uppercase tracking-wide text-[#999]">
                                          Activity Type
                                        </label>

                                        <select
                                          value={
                                            stop.type
                                          }
                                          onChange={(event) =>
                                            updateStop(
                                              day.id,
                                              stop.id,
                                              {
                                                type:
                                                  event
                                                    .target
                                                    .value as ItineraryStopType,
                                              }
                                            )
                                          }
                                          className="mt-2 h-[38px] w-full rounded-[5px] border border-[#DED8D1] bg-white px-3 text-[10px] text-[#292725] outline-none focus:border-[#B43122]"
                                        >

                                          {activityIcons
                                            .filter(
                                              (
                                                item
                                              ) =>
                                                item.showOnWebsite
                                            )
                                            .map(
                                              (
                                                item
                                              ) => (
                                                <option
                                                  key={
                                                    item.id
                                                  }
                                                  value={
                                                    item.name
                                                  }
                                                >
                                                  {
                                                    item.name
                                                  }
                                                </option>
                                              )
                                            )}

                                          /*
                                           * Keep existing
                                           * saved activity types
                                           * available even if
                                           * their icon was hidden
                                           * or deleted.
                                           */
                                          {!activityIcons.some(
                                            (
                                              item
                                            ) =>
                                              item.name ===
                                              stop.type
                                          ) && (
                                            <option
                                              value={
                                                stop.type
                                              }
                                            >
                                              {
                                                stop.type
                                              }
                                            </option>
                                          )}

                                        </select>

                                      </div>


                                      {/* TITLE */}

                                      <div>

                                        <label className="text-[8px] uppercase tracking-wide text-[#999]">
                                          Stop Title
                                        </label>

                                        <input
                                          value={
                                            stop.title
                                          }
                                          onChange={(event) =>
                                            updateStop(
                                              day.id,
                                              stop.id,
                                              {
                                                title:
                                                  event
                                                    .target
                                                    .value,
                                              }
                                            )
                                          }
                                          placeholder="Virupaksha Temple"
                                          className="mt-2 h-[38px] w-full rounded-[5px] border border-[#DED8D1] px-3 text-[10px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                                        />

                                      </div>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="mt-3">

                                      <label className="text-[8px] uppercase tracking-wide text-[#999]">
                                        Description
                                      </label>

                                      <textarea
                                        value={
                                          stop.description
                                        }
                                        onChange={(event) =>
                                          updateStop(
                                            day.id,
                                            stop.id,
                                            {
                                              description:
                                                event
                                                  .target
                                                  .value,
                                            }
                                          )
                                        }
                                        placeholder="Describe this activity..."
                                        className="mt-2 min-h-[70px] w-full resize-none rounded-[5px] border border-[#DED8D1] px-3 py-3 text-[10px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                                      />

                                    </div>


                                    {/* ICON STATUS */}

                                    <div className="mt-3 flex items-center gap-2">

                                      {icon ? (
                                        <>
                                          <div className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] bg-[#F4EFEA]">

                                            {icon.image ? (
                                              <img
                                                src={
                                                  icon.image
                                                }
                                                alt=""
                                                className="h-[17px] w-[17px] object-contain"
                                              />
                                            ) : (
                                              <span className="text-[9px] text-[#B43122]">
                                                ✦
                                              </span>
                                            )}

                                          </div>

                                          <span className="text-[9px] text-[#777]">
                                            {
                                              icon.name
                                            }{" "}
                                            icon
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-[9px] text-[#B43122]">
                                          No icon configured for this
                                          activity
                                        </span>
                                      )}

                                    </div>

                                  </div>


                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteStop(
                                        day.id,
                                        stop.id
                                      )
                                    }
                                    className="shrink-0 text-[9px] text-[#777] hover:text-[#B43122]"
                                  >
                                    Delete
                                  </button>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>


                      {/* ADD STOP */}

                      <button
                        type="button"
                        onClick={() =>
                          addStop(
                            day.id
                          )
                        }
                        className="mt-5 rounded-[5px] border border-[#B43122] px-4 py-2 text-[9px] text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
                      >
                        + Add Stop
                      </button>

                    </div>

                  </section>

                )
              )}


              {/* ADD DAY */}

              <button
                type="button"
                onClick={addDay}
                className="w-full rounded-[7px] border border-[#B43122] bg-white py-4 text-[10px] text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
              >
                + Add Day
              </button>

            </div>

          </>

        )}

      </div>

    </main>
  );
}