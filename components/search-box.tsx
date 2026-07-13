import { SearchBox } from "@mapbox/search-js-react";

export default function SearchBoxComponent() {
  return (
    <div className="absolute z-10 m-6">
      <SearchBox
        accessToken={`${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        options={{ language: "en" }}
      />
    </div>
  );
}
