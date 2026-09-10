"use client";

import { useState } from "react";
import { createPin } from "@/lib/actions/pins";
import LocationSearchInput from "./location-search-input";
import { X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { getTodaysDate } from "@/lib/utils";

export default function PinUploadModal({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [validFiles, setValidFiles] = useState<File[]>([]); // File object has properties name, size, type
  const [errorMessage, setErrorMessage] = useState("");
  const [postErrorMessage, setPostErrorMessage] = useState("");
  const [, setCaption] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
    location_name: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const MAX_FILE_SIZE_BYTES = 10485760; // max per file 10MB (10 * 1024 * 1024)
  const COMPRESSION_THRESHOLD_BYTES = 1048576; // threshold 1MB (1 * 1024 * 1024)

  // handle and validate file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length > 5) {
      window.alert("Do not select more than 5 images.");
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const processPromises = selectedFiles.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image.`);
        return null;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name} exceeds 10MB.`);
        return null;
      }

      if (file.size > COMPRESSION_THRESHOLD_BYTES) {
        try {
          const compressedBlob = await imageCompression(file, options);
          return new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
        } catch (err) {
          console.error(
            "Compression processing failed, falling back to original files: ",
            file.name,
            err,
          );
          return file;
        }
      } else {
        // skip lightweight files entirely
        return file;
      }
    });

    const processedFiles = await Promise.all(processPromises);
    const approvedFiles = processedFiles.filter((file) => file !== null);

    setErrorMessage(errors.join(" "));
    setValidFiles(approvedFiles);
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    const formData = new FormData(e.currentTarget); // reads current value of every 'name' attribute in <form> element

    // delete uncompressed raw files and manually append optimized file from state container array
    formData.delete("photo_files");
    validFiles.forEach((file) => formData.append("photo_files", file));

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
                disabled={isProcessing}
                onChange={handleFileChange}
              />
              {isProcessing && (
                <p className="text-xs text-blue-500 animate-pulse mt-1">
                  Optimizing dimensions and crunching sizes...
                </p>
              )}
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
                max={getTodaysDate()}
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
              {isProcessing ? "Processing..." : "Post"}
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
