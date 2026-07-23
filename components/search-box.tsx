import { SearchBox } from "@mapbox/search-js-react";
import { SearchBoxRetrieveResponse } from "@mapbox/search-js-core";

interface SearchBoxComponentProps {
  onLocationSelect: (coordinates: [number, number]) => void;
}

export default function SearchBoxComponent({
  onLocationSelect,
}: SearchBoxComponentProps) {
  const handleRetrieve = (response: SearchBoxRetrieveResponse) => {
    if (!response || !response.features || response.features.length === 0)
      return;

    const coordinates = response.features[0].geometry.coordinates as [
      number,
      number,
    ];

    onLocationSelect(coordinates);
  };

  return (
    <div className="absolute z-10 m-6">
      <SearchBox
        accessToken={`${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        options={{ language: "en" }}
        onRetrieve={handleRetrieve} // triggers when a destination is selected
      />
    </div>
  );
}
