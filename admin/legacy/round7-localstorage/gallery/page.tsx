"use client";

import { useEffect, useRef, useState } from "react";

type UploadedAsset = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  original_filename?: string;
};

export default function GalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [error, setError] = useState("");

  // Selected image/video for popup
  const [selectedAsset, setSelectedAsset] =
    useState<UploadedAsset | null>(null);

  /*
   * ============================================================
   * LOAD EXISTING CLOUDINARY ASSETS
   * ============================================================
   */

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/gallery/assets", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load gallery assets"
          );
        }

        setAssets(data.assets || []);
      } catch (err) {
        console.error("Failed to load gallery:", err);

        setError(
          "Failed to load gallery. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  /*
   * ============================================================
   * UPLOAD
   * ============================================================
   */

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
          "/api/gallery/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Upload failed"
          );
        }

        // Add new asset immediately
        setAssets((current) => [
          data.asset,
          ...current,
        ]);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Failed to upload one or more files."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /*
   * ============================================================
   * DELETE ASSET
   * ============================================================
   */

  const handleDelete = async (
    asset: UploadedAsset
  ) => {
    const filename =
      asset.original_filename ||
      asset.public_id;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"? This will permanently remove the file from Cloudinary.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        "/api/gallery/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: asset.public_id,
            resource_type:
              asset.resource_type || "image",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete asset"
        );
      }

      /*
       * Remove the deleted asset from local state.
       */
      setAssets((current) =>
        current.filter(
          (item) =>
            item.public_id !== asset.public_id
        )
      );

      /*
       * Close popup.
       */
      setSelectedAsset(null);
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        "Failed to delete the selected asset."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * CLOSE PREVIEW
   * ============================================================
   */

  const closePreview = () => {
    if (!deleting) {
      setSelectedAsset(null);
    }
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#F8F5F1] p-10">

      <div className="mx-auto max-w-[1400px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[12px] uppercase tracking-[0.2em] text-[#A62F20]">
              MAARGA CMS
            </p>

            <h1 className="mt-2 font-serif text-[42px] text-[#292725]">
              Gallery
            </h1>

            <p className="mt-2 text-[15px] text-[#777]">
              Manage images and media used across the website.
            </p>

          </div>

          {/* Upload button */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            className="rounded-[6px] bg-[#A62F20] px-6 py-3 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "+ Upload Media"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="mt-6 rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

            {error}

          </div>

        )}


        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="mt-10 flex min-h-[420px] items-center justify-center rounded-[12px] border border-[#DED8D1] bg-white">

            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5DED7] border-t-[#A62F20]" />

              <p className="mt-4 text-[14px] text-[#888]">
                Loading gallery...
              </p>

            </div>

          </div>

        ) : assets.length === 0 ? (

          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <div className="mt-10 flex min-h-[420px] items-center justify-center rounded-[12px] border border-[#DED8D1] bg-white">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1ECE7] text-2xl">
                +
              </div>

              <h2 className="mt-5 text-[20px] text-[#292725]">
                No media uploaded
              </h2>

              <p className="mt-2 text-[14px] text-[#888]">
                Upload images or videos to start building
                your media library.
              </p>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-5 text-[14px] text-[#A62F20] hover:underline"
              >
                + Upload your first file
              </button>

            </div>

          </div>

        ) : (

          /* ====================================================
             MEDIA GRID
          ==================================================== */

          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {assets.map((asset) => (

              <button
                key={asset.public_id}
                type="button"
                onClick={() =>
                  setSelectedAsset(asset)
                }
                className="group overflow-hidden rounded-[10px] border border-[#DED8D1] bg-white text-left transition hover:-translate-y-[2px] hover:shadow-lg"
              >

                {/* IMAGE / VIDEO */}

                <div className="relative aspect-square overflow-hidden bg-[#F1ECE7]">

                  {asset.resource_type ===
                  "image" ? (

                    <img
                      src={asset.secure_url}
                      alt={
                        asset.original_filename ||
                        ""
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />

                  ) : (

                    <video
                      src={asset.secure_url}
                      className="h-full w-full object-cover"
                    />

                  )}

                  {/* Hover overlay */}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">

                    <span className="rounded-full bg-white/90 px-4 py-2 text-[12px] text-[#292725] opacity-0 shadow transition group-hover:opacity-100">
                      View
                    </span>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="p-3">

                  <p className="truncate text-[13px] text-[#292725]">
                    {asset.original_filename ||
                      asset.public_id}
                  </p>

                  <p className="mt-1 text-[11px] text-[#999]">
                    {asset.format?.toUpperCase() ||
                      asset.resource_type}
                  </p>

                </div>

              </button>

            ))}

          </div>

        )}

      </div>


      {/* ======================================================
          IMAGE / VIDEO POPUP
      ====================================================== */}

      {selectedAsset && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
          onClick={closePreview}
        >

          {/* Popup */}

          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[8px] bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close */}

            <button
              type="button"
              onClick={closePreview}
              disabled={deleting}
              aria-label="Close preview"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-[20px] text-white transition hover:bg-black/80 disabled:opacity-50"
            >
              ×
            </button>


            {/* Preview */}

            {selectedAsset.resource_type ===
            "image" ? (

              <img
                src={selectedAsset.secure_url}
                alt={
                  selectedAsset.original_filename ||
                  ""
                }
                className="max-h-[75vh] max-w-[85vw] object-contain"
              />

            ) : (

              <video
                src={selectedAsset.secure_url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-[85vw]"
              />

            )}


            {/* ==================================================
                BOTTOM INFORMATION
            ================================================== */}

            <div className="flex items-center justify-between gap-6 border-t border-[#E5E0DA] bg-white px-5 py-4">

              <div className="min-w-0">

                <p className="truncate text-[14px] font-medium text-[#292725]">
                  {selectedAsset.original_filename ||
                    selectedAsset.public_id}
                </p>

                <p className="mt-1 text-[11px] text-[#999]">
                  {selectedAsset.format?.toUpperCase() ||
                    selectedAsset.resource_type}
                </p>

              </div>


              {/* ACTIONS */}

              <div className="flex flex-shrink-0 items-center gap-2">

                {/* Copy URL */}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedAsset.secure_url
                    );
                  }}
                  disabled={deleting}
                  className="border border-[#D8D1CA] px-4 py-2 text-[12px] text-[#A62F20] transition hover:bg-[#A62F20] hover:text-white disabled:opacity-50"
                >
                  Copy URL
                </button>


                {/* Delete */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(selectedAsset)
                  }
                  disabled={deleting}
                  className="border border-red-200 px-4 py-2 text-[12px] text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}