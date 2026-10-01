"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createId,
  getTestimonials,
  saveTestimonials,
  TestimonialStatus,
} from "@/lib/cmsStore";

export default function NewTestimonialPage() {
  const [quote, setQuote] =
    useState("");

  const [travellerName, setTravellerName] =
    useState("");

  const [titleOrganisation, setTitleOrganisation] =
    useState("");

  const [linkedItem, setLinkedItem] =
    useState("");

  const [status, setStatus] =
    useState<TestimonialStatus>(
      "PENDING_REVIEW"
    );

  const [showOnWebsite, setShowOnWebsite] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const saveTestimonial = () => {
    if (!quote.trim()) {
      alert("Please enter the testimonial.");
      return;
    }

    if (!travellerName.trim()) {
      alert("Please enter the traveller name.");
      return;
    }

    setSaving(true);

    const now =
      new Date().toISOString();

    const testimonial = {
      id: createId("TEST"),
      quote: quote.trim(),
      travellerName:
        travellerName.trim(),
      titleOrganisation:
        titleOrganisation.trim(),
      linkedItem:
        linkedItem.trim(),
      status,
      showOnWebsite,
      createdAt: now,
      updatedAt: now,
    };

    saveTestimonials([
      ...getTestimonials(),
      testimonial,
    ]);

    window.location.href =
      "/testimonials";
  };

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1100px]">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-[11px] text-[#777]">
              Testimonials &gt; Add Testimonial
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Add Testimonial
            </h1>
          </div>

          <div className="flex gap-3">

            <Link
              href="/testimonials"
              className="rounded-[6px] border border-[#DED8D1] bg-white px-5 py-3 text-[11px] text-[#555]"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={saveTestimonial}
              disabled={saving}
              className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[11px] text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Testimonial"}
            </button>

          </div>

        </div>


        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <div className="space-y-5">

            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Testimonial Quote
              </label>

              <textarea
                value={quote}
                onChange={(event) =>
                  setQuote(
                    event.target.value
                  )
                }
                placeholder="Write the traveller's testimonial..."
                className="mt-2 min-h-[140px] w-full resize-none rounded-[6px] border border-[#DED8D1] px-3 py-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
              />

            </div>


            <div className="grid grid-cols-2 gap-5">

              <div>

                <label className="text-[10px] font-medium text-[#555]">
                  Traveller Name
                </label>

                <input
                  value={travellerName}
                  onChange={(event) =>
                    setTravellerName(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
                />

              </div>


              <div>

                <label className="text-[10px] font-medium text-[#555]">
                  Title / Organisation
                </label>

                <input
                  value={
                    titleOrganisation
                  }
                  onChange={(event) =>
                    setTitleOrganisation(
                      event.target.value
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
                />

              </div>

            </div>


            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Linked Trip / Event
              </label>

              <input
                value={linkedItem}
                onChange={(event) =>
                  setLinkedItem(
                    event.target.value
                  )
                }
                placeholder="Hampi Dec 2024"
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725] outline-none focus:border-[#A62F20]"
              />

            </div>


            <div className="grid grid-cols-2 gap-5">

              <div>

                <label className="text-[10px] font-medium text-[#555]">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as TestimonialStatus
                    )
                  }
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725]"
                >

                  <option value="PENDING_REVIEW">
                    Pending Review
                  </option>

                  <option value="APPROVED">
                    Approved
                  </option>

                </select>

              </div>


              <div className="flex items-end">

                <div className="flex w-full items-center justify-between rounded-[6px] border border-[#DED8D1] px-4 py-3">

                  <div>

                    <p className="text-[11px] font-medium text-[#292725]">
                      Show on website
                    </p>

                    <p className="mt-1 text-[9px] text-[#999]">
                      Public visibility
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
                    className={`relative h-[20px] w-[38px] rounded-full ${
                      showOnWebsite
                        ? "bg-[#A62F20]"
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

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}