"use client";

import dynamic from "next/dynamic";

const MapPanel = dynamic(() => import("@/components/map-panel"), {
  ssr: false,
});

export default MapPanel;
