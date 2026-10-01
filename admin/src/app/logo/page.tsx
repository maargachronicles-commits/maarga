"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createId,
  getActivityIcons,
  saveActivityIcons,
  ActivityIcon,
} from "@/lib/cmsStore";

const DEFAULT_ACTIVITY_TYPES = [
  "Walking",
  "Temple / Monument",
  "Boat",
  "Seminar",
  "Meal",
  "Transfer",
  "Viewpoint",
  "Performance",
  "Workshop",
];

function makeSlug(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

export default function LogoPage() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [icons, setIcons] =
    useState<ActivityIcon[]>([]);

  const [editingId, setEditingId] =
    useState<string | null>(
      null
    );

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState("");

  const [showOnWebsite, setShowOnWebsite] =
    useState(true);

  const [fileName, setFileName] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const saved =
      getActivityIcons();

    /*
     * First-time setup:
     * create placeholder records for the
     * standard itinerary activity types.
     *
     * They can later be replaced with real
     * uploaded icons.
     */
    if (
      saved.length === 0
    ) {
      const now =
        new Date().toISOString();

      const defaults =
        DEFAULT_ACTIVITY_TYPES.map(
          (type) => ({
            id: createId(
              "ACT"
            ),

            name: type,

            slug: makeSlug(
              type
            ),

            description:
              `${type} activity`,

            image: "",

            showOnWebsite:
              true,

            createdAt: now,

            updatedAt: now,
          })
        );

      saveActivityIcons(
        defaults
      );

      setIcons(
        defaults
      );
    } else {
      setIcons(saved);
    }
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setShowOnWebsite(true);
    setFileName("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  };

  const editIcon = (
    icon: ActivityIcon
  ) => {
    setEditingId(
      icon.id
    );

    setName(
      icon.name
    );

    setSlug(
      icon.slug
    );

    setDescription(
      icon.description
    );

    setImage(
      icon.image
    );

    setShowOnWebsite(
      icon.showOnWebsite
    );

    setFileName("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteIcon = (
    id: string
  ) => {
    const icon =
      icons.find(
        (item) =>
          item.id === id
      );

    if (!icon) {
      return;
    }

    if (
      !window.confirm(
        `Delete "${icon.name}" from the activity icon library?`
      )
    ) {
      return;
    }

    const updated =
      icons.filter(
        (item) =>
          item.id !== id
      );

    setIcons(
      updated
    );

    saveActivityIcons(
      updated
    );

    if (
      editingId === id
    ) {
      resetForm();
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !validTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please upload SVG, PNG, JPG or WebP."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Please use an icon smaller than 2 MB."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !==
        "string"
      ) {
        return;
      }

      setImage(
        result
      );

      setFileName(
        file.name
      );
    };

    reader.readAsDataURL(
      file
    );
  };

  const saveIcon = () => {
    if (!name.trim()) {
      alert(
        "Please enter an activity name."
      );

      return;
    }

    const finalSlug =
      slug.trim() ||
      makeSlug(name);

    const duplicate =
      icons.some(
        (icon) =>
          icon.slug ===
            finalSlug &&
          icon.id !==
            editingId
      );

    if (duplicate) {
      alert(
        "An activity with this slug already exists."
      );

      return;
    }

    setSaving(true);

    const now =
      new Date().toISOString();

    let updated: ActivityIcon[];

    if (editingId) {
      updated =
        icons.map(
          (icon) =>
            icon.id ===
            editingId
              ? {
                  ...icon,

                  name:
                    name.trim(),

                  slug:
                    finalSlug,

                  description:
                    description.trim(),

                  image,

                  showOnWebsite,

                  updatedAt: now,
                }
              : icon
        );
    } else {
      const newIcon: ActivityIcon = {
        id: createId(
          "ACT"
        ),

        name:
          name.trim(),

        slug:
          finalSlug,

        description:
          description.trim(),

        image,

        showOnWebsite,

        createdAt: now,

        updatedAt: now,
      };

      updated = [
        ...icons,
        newIcon,
      ];
    }

    saveActivityIcons(
      updated
    );

    setIcons(
      updated
    );

    window.dispatchEvent(
      new Event(
        "maarga-activity-icons-updated"
      )
    );

    resetForm();

    setSaving(false);
  };

  const filteredIcons =
    icons.filter(
      (icon) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          icon.name
            .toLowerCase()
            .includes(query) ||
          icon.slug
            .toLowerCase()
            .includes(query) ||
          icon.description
            .toLowerCase()
            .includes(query)
        );
      }
    );

  return (
    <main className="min-h-screen bg-[#FFFDFA] p-10">

      <div className="mx-auto max-w-[1150px]">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div>

          <p className="text-[11px] uppercase tracking-[0.18em] text-[#B43122]">
            MAARGA CMS
          </p>

          <h1 className="mt-2 font-serif text-[36px] text-[#292725]">
            Activity Icons
          </h1>

          <p className="mt-2 text-[13px] text-[#777]">
            Manage the icons used to identify
            activities throughout itineraries
            and the public website.
          </p>

        </div>


        {/* ====================================================
            EDITOR
        ==================================================== */}

        <section className="mt-7 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-[15px] font-semibold text-[#292725]">
                {editingId
                  ? "Edit Activity Icon"
                  : "Add Activity Icon"}
              </h2>

              <p className="mt-1 text-[10px] text-[#888]">
                These icons can be selected
                when creating itinerary stops.
              </p>

            </div>

            {editingId && (
              <button
                type="button"
                onClick={
                  resetForm
                }
                className="text-[9px] text-[#777]"
              >
                Cancel edit
              </button>
            )}

          </div>


          <div className="mt-6 grid grid-cols-2 gap-5">

            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Activity Name
              </label>

              <input
                value={name}
                onChange={(event) => {
                  setName(
                    event.target
                      .value
                  );

                  if (!editingId) {
                    setSlug(
                      makeSlug(
                        event.target
                          .value
                      )
                    );
                  }
                }}
                placeholder="Walking"
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
              />

            </div>


            <div>

              <label className="text-[10px] font-medium text-[#555]">
                Slug
              </label>

              <input
                value={slug}
                onChange={(event) =>
                  setSlug(
                    makeSlug(
                      event.target
                        .value
                    )
                  )
                }
                placeholder="walking"
                className="mt-2 h-[42px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[12px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
              />

            </div>

          </div>


          <div className="mt-5">

            <label className="text-[10px] font-medium text-[#555]">
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Walking / exploration activity"
              className="mt-2 min-h-[85px] w-full resize-none rounded-[6px] border border-[#DED8D1] bg-white px-3 py-3 text-[11px] text-[#292725]"
            />

          </div>


          {/* UPLOAD */}

          <div className="mt-5">

            <label className="text-[10px] font-medium text-[#555]">
              Icon
            </label>

            <input
              ref={inputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={
                handleFileUpload
              }
              className="hidden"
            />

            <div className="mt-2 flex gap-4">

              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                className="flex h-[100px] w-[100px] items-center justify-center rounded-[8px] border border-dashed border-[#CFC7C0] bg-[#FCFAF8]"
              >

                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-[62px] w-[62px] object-contain"
                  />
                ) : (
                  <span className="text-[25px] text-[#B43122]">
                    +
                  </span>
                )}

              </button>


              <div className="flex flex-col justify-center">

                <p className="text-[10px] text-[#555]">
                  SVG, PNG, JPG or WebP
                </p>

                {fileName && (
                  <p className="mt-2 text-[9px] text-[#B43122]">
                    {fileName}
                  </p>
                )}

                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage("");
                      setFileName("");

                      if (
                        inputRef.current
                      ) {
                        inputRef.current.value =
                          "";
                      }
                    }}
                    className="mt-2 text-left text-[9px] text-[#777]"
                  >
                    Remove icon
                  </button>
                )}

              </div>

            </div>

          </div>


          {/* WEBSITE */}

          <div className="mt-5 flex items-center justify-between rounded-[7px] border border-[#DED8D1] px-4 py-4">

            <div>

              <p className="text-[10px] font-medium">
                Show on website
              </p>

              <p className="mt-1 text-[9px] text-[#999]">
                Allow this icon to appear publicly.
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


          <div className="mt-6 flex justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={
                saveIcon
              }
              className="rounded-[6px] bg-[#B43122] px-5 py-3 text-[10px] text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Icon"
                : "Save Icon"}
            </button>

          </div>

        </section>


        {/* ====================================================
            LIBRARY
        ==================================================== */}

        <section className="mt-6 rounded-[10px] border border-[#DED8D1] bg-white p-7">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-[15px] font-semibold text-[#292725]">
                Icon Library
              </h2>

              <p className="mt-1 text-[10px] text-[#888]">
                {icons.length} activity icons
              </p>

            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search icons..."
              className="h-[34px] w-[250px] rounded-[5px] border border-[#DED8D1] px-3 text-[10px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#999]"
            />

          </div>


          <div className="mt-6 grid grid-cols-3 gap-4">

            {filteredIcons.map(
              (icon) => (

                <div
                  key={icon.id}
                  className="rounded-[8px] border border-[#E4DED8] p-5 transition hover:border-[#B43122]"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[7px] bg-[#F5F0EC]">

                      {icon.image ? (
                        <img
                          src={icon.image}
                          alt={icon.name}
                          className="h-[38px] w-[38px] object-contain"
                        />
                      ) : (
                        <span className="text-[22px] text-[#B43122]">
                          +
                        </span>
                      )}

                    </div>


                    <div className="min-w-0">

                      <p className="truncate text-[12px] font-medium text-[#292725]">
                        {icon.name}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#999]">
                        {icon.slug}
                      </p>

                    </div>

                  </div>


                  {icon.description && (
                    <p className="mt-4 line-clamp-2 text-[9px] leading-[1.5] text-[#777]">
                      {
                        icon.description
                      }
                    </p>
                  )}


                  <div className="mt-5 flex items-center justify-between">

                    <span
                      className={`rounded-[4px] px-2 py-1 text-[8px] ${
                        icon.showOnWebsite
                          ? "bg-[#E8F4E8] text-[#438047]"
                          : "bg-[#F1ECE7] text-[#777]"
                      }`}
                    >
                      {icon.showOnWebsite
                        ? "VISIBLE"
                        : "HIDDEN"}
                    </span>


                    <div className="flex gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          editIcon(
                            icon
                          )
                        }
                        className="text-[9px] text-[#B43122]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteIcon(
                            icon.id
                          )
                        }
                        className="text-[9px] text-[#777]"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>


          {filteredIcons.length ===
            0 && (
            <div className="py-16 text-center text-[10px] text-[#999]">
              No activity icons found.
            </div>
          )}

        </section>

      </div>

    </main>
  );
}