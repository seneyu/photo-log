import { createStore } from "zustand/vanilla";

// structure for UI state
export type MapUiState = {
  activePinId: string | null;
};

// actions functions to mutate state
export type MapUiActions = {
  setActivePinId: (id: string | null) => void;
};

export type MapStore = MapUiState & MapUiActions;

// initial fallback state
export const defaultInitState: MapUiState = {
  activePinId: null,
};

// the Vanilla Factory Function
// gets called inside the React Provider to spin up a completely isolated state instance
export const createMapStore = (initState: MapUiState = defaultInitState) => {
  return createStore<MapStore>()((set) => ({
    ...initState,

    // action implementations
    setActivePinId: (id) => set({ activePinId: id }),
  }));
};
