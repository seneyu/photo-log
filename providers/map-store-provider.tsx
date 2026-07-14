"use client";

import { type ReactNode, createContext, useState, useContext } from "react";
import { useStore } from "zustand";

import { type MapStore, createMapStore } from "@/stores/map-store";

export type MapStoreApi = ReturnType<typeof createMapStore>;

export const MapStoreContext = createContext<MapStoreApi | undefined>(
  undefined,
);

export interface MapStoreProviderProps {
  children: ReactNode;
}

export const MapStoreProvider = ({ children }: MapStoreProviderProps) => {
  const [store] = useState(() => createMapStore());
  return (
    <MapStoreContext.Provider value={store}>
      {children}
    </MapStoreContext.Provider>
  );
};

export const useMapStore = <T,>(selector: (store: MapStore) => T): T => {
  const mapStoreContext = useContext(MapStoreContext);
  if (!mapStoreContext) {
    throw new Error(`useMapStore must be used within MapStoreProvider`);
  }

  return useStore(mapStoreContext, selector);
};
