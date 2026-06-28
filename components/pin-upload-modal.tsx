"use client";

import { useState } from "react";

export default function PinUploadModal({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [validFiles, setValidFiles] = useState<File[]>([]); // File object has properties name, size, type
  const [errorMessage, setErrorMessage] = useState("");

  // 10MB in bytes
  const MAX_FILE_SIZE_BYTES = 10485760;

  // handle and validate file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    const approvedFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image.`);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name} exceeds 10MB.`);
      } else {
        approvedFiles.push(file);
      }
    });

    setErrorMessage(errors.join(" "));
    setValidFiles(approvedFiles);
  };

  return (
    // modal backdrop
    <div
      id="modal"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    >
      {/* modal container */}
      <form className="w-full max-w-md rounded-xl bg-white px-8 py-4">
        <div className="flex items-center justify-between py-4 border-b">
          <h1 className="font-semibold text-lg">Add Pin</h1>
          <span
            onClick={toggleModal}
            className="cursor-pointer text-zinc-400 hover:text-black text-xl"
          >
            &times;
          </span>
        </div>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-s font-medium text-zinc-700">
              Photos (Max 10MB per file)
            </label>
            <input
              type="file"
              accept="image/*"
              name="photo_urls"
              className="cursor-pointer text-sm text-zinc-500"
              multiple
              required
              onChange={handleFileChange}
            />
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-s font-medium text-zinc-700">Caption</label>
            <input
              type="text"
              name="caption"
              placeholder="Shot on Portra 400, f/2.8 at golden hour..."
              className="w-full border px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-s font-medium text-zinc-700">Location</label>
            <input
              type="text"
              name="location_name"
              placeholder="Search a place, e.g. Golden Gate Park, San Francisco"
              className="w-full border px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-s font-medium text-zinc-700">
              Visit Date
            </label>
            <input
              type="date"
              name="visited_at"
              className="w-full border px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
        </div>

        <div className="flex justify-end py-5">
          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-zinc-700 cursor-pointer"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
