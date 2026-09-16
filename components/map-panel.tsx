"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import * as mapboxgl from "mapbox-gl/esm";

import dynamic from "next/dynamic";
import { MapPin } from "@/lib/types";

import { useMapStore } from "@/providers/map-store-provider";

interface MapPanelProps {
  pins: MapPin[];
}

// @mapbox/search-js-react accesses `document` on import — must be loaded client-side only
const SearchBoxComponent = dynamic(() => import("@/components/search-box"), {
  ssr: false,
});

export default function MapGL({ pins }: MapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const setActivePinId = useMapStore((state) => state.setActivePinId);
  const setActiveDetailPinId = useMapStore(
    (state) => state.setActiveDetailPinId,
  );

  // creates new mapboxgl map on mount and attaches to mapContainerRef
  // using token to authenticates with mapbox's servers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      accessToken: `${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [105, 30],
      zoom: 2,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => mapRef.current?.remove();
  }, []);

  // reacts to pins change - add markers
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;

    if (pins.length === 0) {
      currentMap.setCenter([105, 30]).setZoom(2);
      return;
    }

    // maintain array of markers and cleanup functions
    const activeMarkers: mapboxgl.Marker[] = [];
    const cleanups: Array<() => void> = [];

    const mostRecentPin = pins[0];
    currentMap.flyTo({
      center: [mostRecentPin.lng, mostRecentPin.lat],
      zoom: 10,
      essential: true,
    });

    pins.forEach((pin) => {
      const newMarker = new mapboxgl.Marker()
        .setLngLat([pin.lng, pin.lat])
        .addTo(currentMap);

      activeMarkers.push(newMarker);

      const markerElement = newMarker.getElement();

      // marker hover listener
      const handleMouseEnter = () => {
        markerElement.style.cursor = "pointer";
      };
      markerElement.addEventListener("mouseenter", handleMouseEnter);

      // marker click listener - zustand action
      const handleMarkerClick = () => {
        setActivePinId(pin.id); // triggers scroll if the card is loaded
        // setActiveDetailPinId(pin.id); // always opens the drawer regardless of the feed load state
      };
      markerElement.addEventListener("click", handleMarkerClick);

      cleanups.push(() => {
        markerElement.removeEventListener("mouseenter", handleMouseEnter);
        markerElement.removeEventListener("click", handleMarkerClick);
      });
    });

    // cleanup phase - remove markers and events when pins array change
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      activeMarkers.forEach((marker) => marker.remove());
    };
  }, [pins, setActivePinId]);

  const handleLocationSelect = (coordinates: [number, number]) => {
    mapRef.current?.flyTo({
      center: coordinates,
      essential: true,
      zoom: 10,
      speed: 0.8,
    });
  };

  return (
    <div className="relative h-full overflow-hidden">
      <SearchBoxComponent onLocationSelect={handleLocationSelect} />
      <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>
    </div>
  );
}
