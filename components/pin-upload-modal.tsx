"use client";

import { useState, useRef } from "react";

type SearchSuggestions = {
  mapbox_id: string;
  address?: string;
  name: string;
  place_formatted: string;
};

export default function PinUploadModal({
  toggleModal,
}: {
  toggleModal: () => void;
}) {
  const [validFiles, setValidFiles] = useState<File[]>([]); // File object has properties name, size, type
  const [errorMessage, setErrorMessage] = useState("");

  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions[]>([]);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
    location_name: string;
  } | null>(null);

  // session token per modal open to group a single search session
  const sessionToken = useRef(crypto.randomUUID());

  // search box api runs only when user stop typing for 1000ms
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // search box api: /suggest and /retrieve endpoints for an interactive search with autocompelte
  // /suggest
  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const searchText = e.target.value;
    if (!searchText) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchText}&session_token=${sessionToken}&types=place,locality,neighborhood,street,address,poi,category&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
        );

        const data = await res.json();

        console.log(data.suggestions);
        setSuggestions(data.suggestions ?? []);
      } catch (err) {
        console.error("Search box api /search suggestions error: ", err);
      }
    }, 1000);
  };

  // /retrieve
  const handleRetrieveSuggestion = async (id: string) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}?session_token=${sessionToken}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      );

      const data = await res.json();
      console.log(data);

      setCoordinates({
        lat: data.features[0].properties.coordinates.latitude,
        lng: data.features[0].properties.coordinates.longitude,
        location_name: data.features[0].properties.name,
      });

      setLocation(data.features[0].properties.name);
      setSuggestions([]);
    } catch (err) {
      console.error("Search box api /retrieve suggestion error: ", err);
    }
  };

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
              placeholder="e.g. Shot on Portra 400, f/2.8 at golden hour..."
              className="w-full border px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div className="relative flex flex-col gap-1">
            <label className="text-s font-medium text-zinc-700">Location</label>
            <input
              type="text"
              name="location_name"
              placeholder="e.g. Golden Gate Park, San Francisco"
              className="w-full border px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                handleLocationChange(e);
              }}
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 z-10 max-h-36 overflow-y-auto border border-zinc-200 bg-white shadow-md">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.mapbox_id}
                    className="flex cursor-pointer flex-col px-3 py-2 hover:bg-zinc-50"
                    onClick={() =>
                      handleRetrieveSuggestion(suggestion.mapbox_id)
                    }
                  >
                    <span className="text-sm">{suggestion.name}</span>
                    <span className="text-xs text-zinc-400">
                      {suggestion.address
                        ? suggestion.address
                        : suggestion.place_formatted}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
