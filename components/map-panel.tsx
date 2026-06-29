"use client";

import MapPanel from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import dynamic from "next/dynamic";

// @mapbox/search-js-react accesses `document` on import — must be loaded client-side only
const SearchBoxComponent = dynamic(() => import("@/components/search-box"), {
  ssr: false,
});

export default function MapGL() {
  return (
    <div className="relative h-full overflow-hidden">
      <SearchBoxComponent />
      <MapPanel
        mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      />
    </div>
  );
}
