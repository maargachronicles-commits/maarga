"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";

import {
  getTestimonials,
  saveTestimonials,
  Testimonial,
  TestimonialStatus,
} from "@/lib/cmsStore";

export default function EditTestimonialPage() {
  const params = useParams();
  const router = useRouter();

  const testimonialId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [testimonial, setTestimonial] =
    useState<Testimonial | null>(null);

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

  useEffect(() => {
    const testimonials =
      getTestimonials();

    const found =
      testimonials.find(
        (item) =>
          item.id === testimonialId
      );

    if (!found) {
      return;
    }

    setTestimonial(found);

    setQuote(found.quote);

    setTravellerName(
      found.travellerName
    );

    setTitleOrganisation(
      found.titleOrganisation
    );

    setLinkedItem(
      found.linkedItem
    );

    setStatus(found.status);

    setShowOnWebsite(
      found.showOnWebsite
    );
  }, [testimonialId]);

  const saveChanges = () => {
    if (!quote.trim()) {
      alert(
        "Please enter the testimonial."
      );
      return;
    }

    if (!travellerName.trim()) {
      alert(
        "Please enter the traveller name."
      );
      return;
    }

    setSaving(true);

    const updated =
      getTestimonials().map(
        (item) =>
          item.id === testimonialId
            ? {
                ...item,
                quote:
                  quote.trim(),
                travellerName:
                  travellerName.trim(),
                titleOrganisation:
                  titleOrganisation.trim(),
                linkedItem:
                  linkedItem.trim(),
                status,
                showOnWebsite,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    saveTestimonials(updated);

    router.push(
      "/testimonials"
    );
  };

  if (!testimonial) {
    return (
      <main className="min-h-screen bg-[#F8F5F1] p-10">

        <div className="rounded-[10px] border border-[#DED8D1] bg-white p-10">

          <h1 className="font-serif text-[28px]">
            Testimonial not found
          </h1>

          <Link
            href="/testimonials"
            className="mt-4 inline-block text-[12px] text-[#A62F20]"
          >
            ← Back to Testimonials
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1100px]">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] text-[#777]">
              Testimonials &gt; Edit
            </p>

            <h1 className="mt-2 font-serif text-[34px] text-[#292725]">
              Edit Testimonial
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
              onClick={saveChanges}
              disabled={saving}
              className="rounded-[6px] bg-[#A62F20] px-5 py-3 text-[11px] text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
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
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725]"
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
                  className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725]"
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
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] px-3 text-[12px] text-[#292725]"
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