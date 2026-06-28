"use client";

import MapPanel from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapGL() {
  return (
    <div className="flex h-full overflow-hidden">
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
