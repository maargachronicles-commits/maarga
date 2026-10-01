"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createId,
  getDestinations,
  getJourneys,
  getContentForDestination,
  saveDestinations,
  saveDestinationContent,
  deleteDestinationContent,
  Destination,
  Journey,
  DestinationContent,
} from "@/lib/cmsStore";

import MediaPicker from "@/components/ui/MediaPicker";

export default function DestinationEditPage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [contents, setContents] =
    useState<DestinationContent[]>([]);

  const [name, setName] =
    useState("");

  const [region, setRegion] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [coverImage, setCoverImage] =
    useState("");

  const [showOnWebsite, setShowOnWebsite] =
    useState(true);

  const [selectedJourneyId, setSelectedJourneyId] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* ============================================================
     LOAD
     ============================================================ */

  useEffect(() => {
    const allDestinations =
      getDestinations();

    const found =
      allDestinations.find(
        (item) =>
          item.id === id
      );

    if (!found) {
      return;
    }

    setDestinations(
      allDestinations
    );

    setDestination(
      found
    );

    setName(
      found.name
    );

    setRegion(
      found.region
    );

    setCountry(
      found.country
    );

    setDescription(
      found.description
    );

    setCoverImage(
      found.coverImage
    );

    setShowOnWebsite(
      found.showOnWebsite
    );

    setJourneys(
      getJourneys()
    );

    setContents(
      getContentForDestination(
        id
      )
    );
  }, [id]);

  /* ============================================================
     SAVE DESTINATION
     ============================================================ */

  const saveDetails = () => {
    if (!name.trim()) {
      alert(
        "Please enter a destination name."
      );

      return;
    }

    setSaving(true);

    const updated =
      destinations.map(
        (item) =>
          item.id === id
            ? {
                ...item,

                name:
                  name.trim(),

                region:
                  region.trim(),

                country:
                  country.trim(),

                description:
                  description.trim(),

                coverImage:
                  coverImage.trim(),

                showOnWebsite,

                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    saveDestinations(
      updated
    );

    const updatedDestination =
      updated.find(
        (item) =>
          item.id === id
      ) ?? null;

    setDestination(
      updatedDestination
    );

    setDestinations(
      updated
    );

    setSaving(false);

    alert(
      "Destination saved."
    );
  };

  /* ============================================================
     LINK JOURNEY
     ============================================================ */

  const linkJourney = () => {
    if (!selectedJourneyId) {
      alert(
        "Select a journey first."
      );

      return;
    }

    const alreadyLinked =
      contents.some(
        (content) =>
          content.journeyId ===
          selectedJourneyId
      );

    if (alreadyLinked) {
      alert(
        "This journey is already linked to this destination."
      );

      return;
    }

    const now =
      new Date().toISOString();

    const content:
      DestinationContent = {
      id: createId("ITN"),

      destinationId:
        id,

      journeyId:
        selectedJourneyId,

      days: [],

      accommodations: [],

      createdAt:
        now,

      updatedAt:
        now,
    };

    saveDestinationContent(
      content
    );

    setContents(
      getContentForDestination(
        id
      )
    );

    setSelectedJourneyId("");
  };

  /* ============================================================
     UNLINK JOURNEY
     ============================================================ */

  const unlinkJourney = (
    journeyId: string
  ) => {
    const journey =
      journeys.find(
        (item) =>
          item.id ===
          journeyId
      );

    if (!journey) {
      return;
    }

    const confirmed =
      window.confirm(
        `Unlink "${journey.title}" from ${name}?\n\nIts itinerary and stay configuration will also be removed.`
      );

    if (!confirmed) {
      return;
    }

    deleteDestinationContent(
      id,
      journeyId
    );

    setContents(
      getContentForDestination(
        id
      )
    );
  };

  /* ============================================================
     DESTINATION NOT FOUND
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

  /* ============================================================
     JOURNEYS
     ============================================================ */

  const linkedJourneyIds =
    contents.map(
      (content) =>
        content.journeyId
    );

  const availableJourneys =
    journeys.filter(
      (journey) =>
        !linkedJourneyIds.includes(
          journey.id
        )
    );

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1250px]">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] uppercase tracking-[0.18em] text-[#B43122]">
              Destinations
            </p>

            <h1 className="mt-2 font-serif text-[38px] text-[#292725]">
              {destination.name}
            </h1>

            <p className="mt-2 text-[13px] text-[#777]">
              Manage destination information,
              linked journeys, itineraries and stays.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href="/destinations"
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555]"
            >
              Back
            </Link>

            <button
              type="button"
              onClick={
                saveDetails
              }
              disabled={saving}
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Destination"}
            </button>

          </div>

        </div>


        {/* ======================================================
            DESTINATION DETAILS
            ====================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <h2 className="text-[15px] font-semibold text-[#292725]">
            Destination Details
          </h2>


          <div className="mt-6 space-y-5">

            {/* NAME */}

            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Destination Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
              />

            </div>


            {/* REGION / COUNTRY */}

            <div className="grid grid-cols-2 gap-5">

              <div>

                <label className="text-[10px] font-medium text-[#555]">
                  Region
                </label>

                <input
                  value={region}
                  onChange={(event) =>
                    setRegion(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                />

              </div>


              <div>

                <label className="text-[10px] font-medium text-[#555]">
                  Country
                </label>

                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
                />

              </div>

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                className="mt-2 min-h-[130px] w-full resize-none rounded-[6px] border border-[#DED8D1] bg-white px-3 py-3 text-[12px] text-[#292725] caret-[#292725] outline-none focus:border-[#B43122]"
              />

            </div>


            {/* =================================================
                COVER IMAGE
                ================================================= */}

            <MediaPicker
              label="Cover Image"
              value={coverImage}
              onChange={
                setCoverImage
              }
            />


            {/* WEBSITE VISIBILITY */}

            <div className="flex items-center justify-between rounded-[7px] border border-[#DED8D1] px-5 py-4">

              <div>

                <p className="text-[11px] font-medium text-[#292725]">
                  Show on website
                </p>

                <p className="mt-1 text-[9px] text-[#999]">
                  {showOnWebsite
                    ? "Visible publicly"
                    : "Hidden publicly"}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowOnWebsite(
                    (current) =>
                      !current
                  )
                }
                aria-label="Toggle website visibility"
                className={`relative h-[20px] w-[38px] rounded-full transition ${
                  showOnWebsite
                    ? "bg-[#B43122]"
                    : "bg-[#CFC9C3]"
                }`}
              >

                <span
                  className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white transition ${
                    showOnWebsite
                      ? "left-[21px]"
                      : "left-[3px]"
                  }`}
                />

              </button>

            </div>

          </div>

        </section>


        {/* ======================================================
            LINKED JOURNEYS
            ====================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <div>

            <h2 className="text-[15px] font-semibold text-[#292725]">
              Linked Journeys
            </h2>

            <p className="mt-1 text-[11px] text-[#777]">
              One destination can be part of multiple
              journeys. Each journey gets its own
              itinerary and stay configuration.
            </p>

          </div>


          {/* LINK */}

          <div className="mt-6 flex gap-3">

            <select
              value={
                selectedJourneyId
              }
              onChange={(event) =>
                setSelectedJourneyId(
                  event.target.value
                )
              }
              className="h-[40px] flex-1 rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725] outline-none focus:border-[#B43122]"
            >

              <option value="">
                Select a journey
              </option>

              {availableJourneys.map(
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


            <button
              type="button"
              onClick={
                linkJourney
              }
              disabled={
                !selectedJourneyId
              }
              className="rounded-[6px] bg-[#B43122] px-5 text-[10px] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Link Journey
            </button>

          </div>


          {/* LINKED JOURNEYS */}

          <div className="mt-6 space-y-4">

            {contents.length ===
              0 && (
              <div className="rounded-[8px] border border-dashed border-[#DED8D1] py-14 text-center text-[11px] text-[#888]">
                No journeys linked yet.
              </div>
            )}


            {contents.map(
              (content) => {

                const journey =
                  journeys.find(
                    (item) =>
                      item.id ===
                      content.journeyId
                  );

                if (!journey) {
                  return null;
                }

                return (
                  <div
                    key={
                      content.id
                    }
                    className="rounded-[8px] border border-[#DED8D1] bg-[#FCFAF8] p-5"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-[12px] font-semibold text-[#292725]">
                          {
                            journey.title
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-[#999]">
                          Itinerary ID:{" "}
                          {
                            content.id
                          }
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          unlinkJourney(
                            journey.id
                          )
                        }
                        className="text-[9px] text-[#777] transition hover:text-[#B43122]"
                      >
                        Unlink
                      </button>

                    </div>


                    {/* MANAGEMENT LINKS */}

                    <div className="mt-4 flex gap-3">

                      <Link
                        href={`/destinations/${id}/itinerary?journeyId=${journey.id}`}
                        className="rounded-[5px] border border-[#B43122] px-4 py-2 text-[9px] text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
                      >
                        Manage Itinerary
                      </Link>


                      <Link
                        href={`/destinations/${id}/itinerary/stay?journeyId=${journey.id}`}
                        className="rounded-[5px] border border-[#DED8D1] px-4 py-2 text-[9px] text-[#555] transition hover:border-[#B43122] hover:text-[#B43122]"
                      >
                        Manage Stay
                      </Link>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>

    </main>
  );
}