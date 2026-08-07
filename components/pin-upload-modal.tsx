"use client";

import { useState, useRef } from "react";
import { createPin } from "@/lib/actions/pins";
import LocationSearchInput from "./location-search-input";
import { X } from "lucide-react";

export default function PinUploadModal({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [validFiles, setValidFiles] = useState<File[]>([]); // File object has properties name, size, type
  const [errorMessage, setErrorMessage] = useState("");
  const [postErrorMessage, setPostErrorMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
    location_name: string;
  } | null>(null);

  // 10MB in bytes
  const MAX_FILE_SIZE_BYTES = 10485760;

  // handle and validate file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length > 5) {
      window.alert("Do not select more than 5 images.");
    } else {
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
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget); // reads current value of every 'name' attribute in <form> element

    const { success, error } = await createPin(formData);

    if (!success) {
      setPostErrorMessage(error);
    } else toggleModal();
  };

  return (
    <div>
      {/* modal backdrop */}
      <div
        id="modal"
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={toggleModal}
      >
        {/* modal container */}
        <form
          className="w-full max-w-md rounded-xl bg-white px-8 py-4"
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between py-4 border-b">
            <h1 className="font-semibold text-lg">Add Pin</h1>
            <span
              onClick={toggleModal}
              className="cursor-pointer text-zinc-400 hover:text-black"
            >
              <X size={20} />
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
                name="photo_files"
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
              <label className="text-s font-medium text-zinc-700">
                Caption
              </label>
              <input
                type="text"
                name="caption"
                placeholder="e.g. Shot on Portra 400, f/2.8 at golden hour..."
                className="w-full border px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <LocationSearchInput
              onSelect={({ lat, lng, location_name }) => {
                setCoordinates({ lat, lng, location_name });
              }}
            />
            <input type="hidden" name="lat" value={coordinates?.lat ?? ""} />
            <input type="hidden" name="lng" value={coordinates?.lng ?? ""} />
            <div className="flex flex-col gap-1">
              <label className="text-s font-medium text-zinc-700">
                Visit Date
              </label>
              <input
                type="date"
                name="visited_at"
                className="w-full border px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                required
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end py-5">
            <button
              type="submit"
              className="rounded-full border border-zinc-300 bg-white px-8 py-1.5 text-sm text-zinc-500 cursor-not-allowed enabled:cursor-pointer enabled:border-black enabled:bg-black enabled:text-white enabled:hover:bg-zinc-700"
              disabled={!coordinates || !validFiles.length || !visitDate}
            >
              Post
            </button>
          </div>
          {postErrorMessage && (
            <p className="text-sm text-red-500">{postErrorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
