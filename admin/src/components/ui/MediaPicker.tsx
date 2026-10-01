"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type GalleryAsset = {
  public_id: string;
  secure_url: string;
  resource_type?: string;
  format?: string;
  original_filename?: string;
};

type MediaPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  accept?: string;
};

export default function MediaPicker({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
}: MediaPickerProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [showGallery, setShowGallery] =
    useState(false);

  const [assets, setAssets] =
    useState<GalleryAsset[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD GALLERY
     ============================================================ */

  useEffect(() => {
    if (!showGallery) {
      return;
    }

    loadGallery();
  }, [showGallery]);

  const loadGallery = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/gallery/assets",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load gallery."
        );
      }

      const loadedAssets =
        Array.isArray(
          data?.assets
        )
          ? data.assets
          : [];

      const imageAssets =
        loadedAssets.filter(
          (asset: GalleryAsset) =>
            !asset.resource_type ||
            asset.resource_type ===
              "image"
        );

      setAssets(
        imageAssets
      );
    } catch (err) {
      console.error(
        "Gallery load error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load gallery."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UPLOAD FROM PC
     ============================================================ */

  const uploadFromPC = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please choose an image file."
      );

      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/gallery/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Upload failed."
        );
      }

      const uploaded =
        data?.asset;

      if (
        !uploaded?.secure_url
      ) {
        throw new Error(
          "Upload succeeded but no image URL was returned."
        );
      }

      /*
       * Save the Cloudinary URL
       * into the parent field.
       */
      onChange(
        uploaded.secure_url
      );

      /*
       * Add the newly uploaded image
       * to our current gallery list too.
       */
      setAssets(
        (current) => [
          uploaded,
          ...current.filter(
            (asset) =>
              asset.public_id !==
              uploaded.public_id
          ),
        ]
      );

      setShowGallery(
        false
      );
    } catch (err) {
      console.error(
        "Image upload error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Image upload failed.";

      setError(
        message
      );

      alert(
        message
      );
    } finally {
      setUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  };

  /* ============================================================
     GALLERY SEARCH
     ============================================================ */

  const filteredAssets =
    assets.filter(
      (asset) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        const filename =
          (
            asset.original_filename ||
            ""
          ).toLowerCase();

        const publicId =
          asset.public_id
            .toLowerCase();

        return (
          filename.includes(
            query
          ) ||
          publicId.includes(
            query
          )
        );
      }
    );

  /* ============================================================
     SELECT GALLERY IMAGE
     ============================================================ */

  const selectImage = (
    asset: GalleryAsset
  ) => {
    onChange(
      asset.secure_url
    );

    setShowGallery(
      false
    );

    setSearch("");
    setError("");
  };

  /* ============================================================
     OPEN GALLERY
     ============================================================ */

  const openGallery = () => {
    setSearch("");
    setError("");
    setShowGallery(true);
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <>
      <div>

        {/* LABEL */}

        <label className="text-[10px] font-medium text-[#555]">
          {label}
        </label>


        {/* CURRENT IMAGE */}

        <div className="mt-2 overflow-hidden rounded-[8px] border border-[#DED8D1] bg-[#F5F0EC]">

          {value ? (
            <div className="relative h-[190px]">

              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />

              <div className="absolute right-3 top-3 flex gap-2">

                <button
                  type="button"
                  onClick={
                    openGallery
                  }
                  className="rounded-[5px] bg-white px-3 py-2 text-[9px] text-[#292725] shadow"
                >
                  Change
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange("")
                  }
                  className="rounded-[5px] bg-white px-3 py-2 text-[9px] text-[#B43122] shadow"
                >
                  Remove
                </button>

              </div>

            </div>
          ) : (
            <div className="flex h-[190px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[22px] text-[#B43122]">
                  +
                </div>

                <p className="mt-3 text-[11px] font-medium text-[#292725]">
                  No image selected
                </p>

                <p className="mt-1 text-[9px] text-[#999]">
                  Choose an image below
                </p>

              </div>

            </div>
          )}

        </div>


        {/* ACTION BUTTONS */}

        <div className="mt-3 flex gap-2">

          <button
            type="button"
            onClick={
              openGallery
            }
            className="rounded-[5px] border border-[#B43122] bg-white px-4 py-2 text-[9px] text-[#B43122] transition hover:bg-[#B43122] hover:text-white"
          >
            Choose from Gallery
          </button>


          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={
              uploadFromPC
            }
            className="hidden"
          />

          <button
            type="button"
            disabled={
              uploading
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="rounded-[5px] border border-[#DED8D1] bg-white px-4 py-2 text-[9px] text-[#555] transition hover:border-[#B43122] hover:text-[#B43122] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Upload from PC"}
          </button>

        </div>

      </div>


      {/* ========================================================
          GALLERY MODAL
          ======================================================== */}

      {showGallery && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-6"
          onClick={() =>
            setShowGallery(false)
          }
        >

          <div
            className="flex max-h-[88vh] w-full max-w-[1050px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#E5DFD9] px-6 py-5">

              <div>

                <h2 className="text-[16px] font-semibold text-[#292725]">
                  Choose from Gallery
                </h2>

                <p className="mt-1 text-[9px] text-[#888]">
                  Select an image already stored
                  in the Maarga media library.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowGallery(false)
                }
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F1ECE7] text-[18px] text-[#555] hover:bg-[#E8E0DA]"
              >
                ×
              </button>

            </div>


            {/* SEARCH */}

            <div className="border-b border-[#E5DFD9] px-6 py-4">

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search gallery..."
                className="h-[40px] w-full rounded-[6px] border border-[#DED8D1] bg-white px-3 text-[11px] text-[#292725] caret-[#292725] outline-none placeholder:text-[#AAA] focus:border-[#B43122]"
              />

            </div>


            {/* BODY */}

            <div className="flex-1 overflow-y-auto p-6">

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">

                  <p className="text-[11px] text-[#888]">
                    Loading gallery...
                  </p>

                </div>
              ) : error ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                  <p className="text-[11px] text-[#B43122]">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadGallery
                    }
                    className="mt-3 text-[10px] text-[#B43122]"
                  >
                    Try Again
                  </button>

                </div>
              ) : filteredAssets.length ===
                0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center">

                  <p className="text-[11px] text-[#888]">
                    No images found.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-3 text-[10px] text-[#B43122]"
                  >
                    Upload an image from PC
                  </button>

                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">

                  {filteredAssets.map(
                    (asset) => (
                      <button
                        key={
                          asset.public_id
                        }
                        type="button"
                        onClick={() =>
                          selectImage(
                            asset
                          )
                        }
                        className="group overflow-hidden rounded-[8px] border border-[#DED8D1] bg-white text-left transition hover:-translate-y-[1px] hover:border-[#B43122] hover:shadow-md"
                      >

                        <div className="aspect-square overflow-hidden bg-[#F4F0EC]">

                          <img
                            src={
                              asset.secure_url
                            }
                            alt={
                              asset.original_filename ||
                              ""
                            }
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />

                        </div>

                        <div className="p-3">

                          <p className="truncate text-[9px] text-[#292725]">
                            {
                              asset.original_filename ||
                              asset.public_id
                            }
                          </p>

                          {asset.format && (
                            <p className="mt-1 text-[8px] uppercase text-[#999]">
                              {
                                asset.format
                              }
                            </p>
                          )}

                        </div>

                      </button>
                    )
                  )}

                </div>
              )}

            </div>


            {/* FOOTER */}

            <div className="flex items-center justify-between border-t border-[#E5DFD9] px-6 py-4">

              <div>

                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="rounded-[5px] bg-[#B43122] px-4 py-2 text-[9px] text-white disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload from PC"}
                </button>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowGallery(false)
                }
                className="rounded-[5px] border border-[#DED8D1] px-4 py-2 text-[9px] text-[#555]"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}