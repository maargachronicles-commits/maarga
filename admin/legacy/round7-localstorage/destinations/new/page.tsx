"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createId,
  getDestinations,
  saveDestinations,
  Destination,
} from "@/lib/cmsStore";

import MediaPicker from "@/components/ui/MediaPicker";

export default function NewDestinationPage() {
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

  const [saving, setSaving] =
    useState(false);


  /* ============================================================
     SAVE
     ============================================================ */

  const handleSave = () => {
    if (!name.trim()) {
      alert(
        "Please enter a destination name."
      );

      return;
    }

    if (!region.trim()) {
      alert(
        "Please enter a region."
      );

      return;
    }

    if (!country.trim()) {
      alert(
        "Please enter a country."
      );

      return;
    }

    setSaving(true);

    try {
      const now =
        new Date().toISOString();

      const destination:
        Destination = {
        id: createId(
          "DST"
        ),

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

        createdAt: now,

        updatedAt: now,
      };

      const existing =
        getDestinations();

      saveDestinations([
        ...existing,
        destination,
      ]);

      window.location.href =
        `/destinations/${destination.id}`;
    } catch (error) {
      console.error(
        "Failed to create destination:",
        error
      );

      alert(
        "Failed to create destination."
      );

      setSaving(false);
    }
  };


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
              Create New Destination
            </h1>

            <p className="mt-2 text-[13px] text-[#777]">
              Add the place information first.
              Journeys, itineraries and stays are
              linked afterward.
            </p>

          </div>


          <div className="flex gap-3">

            <Link
              href="/destinations"
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555] transition hover:border-[#B43122] hover:text-[#B43122]"
            >
              Cancel
            </Link>


            <button
              type="button"
              disabled={saving}
              onClick={
                handleSave
              }
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[11px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Destination"}
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
                placeholder="Hampi"
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
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
                  placeholder="Karnataka"
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
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
                  placeholder="India"
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
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
                placeholder="Describe the destination..."
                className="mt-2 min-h-[150px] w-full resize-none rounded-[6px] border border-[#DED8D1] bg-white px-3 py-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
              />

            </div>


            {/* =================================================
                COVER IMAGE
                ================================================= */}

            <MediaPicker
              label="Cover Image"
              value={
                coverImage
              }
              onChange={
                setCoverImage
              }
              accept="image/*"
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
            LINKING INFO
            ====================================================== */}

        <section className="mt-6 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <h2 className="text-[15px] font-semibold text-[#292725]">
            What happens next?
          </h2>

          <div className="mt-5 grid grid-cols-3 gap-4">

            <div className="rounded-[8px] border border-[#E7E0DA] p-5">

              <p className="text-[10px] font-medium text-[#B43122]">
                01
              </p>

              <p className="mt-2 text-[11px] font-medium text-[#292725]">
                Destination
              </p>

              <p className="mt-1 text-[9px] leading-[1.5] text-[#888]">
                Create the place and its core
                information here.
              </p>

            </div>


            <div className="rounded-[8px] border border-[#E7E0DA] p-5">

              <p className="text-[10px] font-medium text-[#B43122]">
                02
              </p>

              <p className="mt-2 text-[11px] font-medium text-[#292725]">
                Journey
              </p>

              <p className="mt-1 text-[9px] leading-[1.5] text-[#888]">
                Link one or more journeys to
                this destination afterward.
              </p>

            </div>


            <div className="rounded-[8px] border border-[#E7E0DA] p-5">

              <p className="text-[10px] font-medium text-[#B43122]">
                03
              </p>

              <p className="mt-2 text-[11px] font-medium text-[#292725]">
                Itinerary & Stay
              </p>

              <p className="mt-1 text-[9px] leading-[1.5] text-[#888]">
                Each linked journey gets its
                own itinerary and accommodation
                configuration.
              </p>

            </div>

          </div>

        </section>


      </div>

    </main>
  );
}