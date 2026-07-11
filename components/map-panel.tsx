"use client";

import { useEffect, useRef } from "react";

// import MapPanel from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as mapboxgl from "mapbox-gl/esm";

import dynamic from "next/dynamic";
import { Pin } from "@/lib/types";

// @mapbox/search-js-react accesses `document` on import — must be loaded client-side only
const SearchBoxComponent = dynamic(() => import("@/components/search-box"), {
  ssr: false,
});

export default function MapGL({ pins }: { pins: Pin[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // creates new mapboxgl map on mount and attaches to mapContainerRef
  // using token to authenticates with mapbox's servers
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: `${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/standard",
      center: [105, 30],
      zoom: 2,
    });

    return () => mapRef.current?.remove();
  }, []);

  // reacts to pins change - add markers and fitBounds
  useEffect(() => {
    if (!mapRef.current) return;

    if (pins.length === 0) {
      mapRef.current.setCenter([105, 30]).setZoom(2);
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    for (let pin of pins) {
      new mapboxgl.Marker().setLngLat([pin.lng, pin.lat]).addTo(mapRef.current);
    }

    pins.forEach((pin) => bounds.extend([pin.lng, pin.lat]));
    mapRef.current.fitBounds(bounds, { padding: 250, maxZoom: 10 });
  }, [pins]);

  return (
    <div className="relative h-full overflow-hidden">
      <SearchBoxComponent />
      <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>
    </div>
  );
}
