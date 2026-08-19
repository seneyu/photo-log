"use client";
import { useState, useRef } from "react";

export type LocationResult = {
  lat: number;
  lng: number;
  location_name: string;
};

type SearchSuggestions = {
  mapbox_id: string;
  address?: string;
  name: string;
  place_formatted: string;
};

export default function LocationSearchInput({
  initialValue = "",
  onSelect,
}: {
  initialValue?: string;
  onSelect: (result: LocationResult) => void;
}) {
  const [location, setLocation] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestions[]>([]);

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
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchText}&session_token=${sessionToken.current}&types=place,locality,neighborhood,street,address,poi,category&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
        );

        const data = await res.json();

        // console.log(data.suggestions);
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
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}?session_token=${sessionToken.current}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      );

      const data = await res.json();
      // console.log(data);

      const result: LocationResult = {
        lat: data.features[0].properties.coordinates.latitude,
        lng: data.features[0].properties.coordinates.longitude,
        location_name: data.features[0].properties.name,
      };

      setLocation(result.location_name);
      setSuggestions([]);
      onSelect(result);
    } catch (err) {
      console.error("Search box api /retrieve suggestion error: ", err);
    }
  };

  return (
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
              onClick={() => handleRetrieveSuggestion(suggestion.mapbox_id)}
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
  );
}
