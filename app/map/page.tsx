import MapPanel from "@/components/map-panel";
import Feedpanel from "@/components/feed-panel";

export default function MapPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Map - 60% */}
      <div className="h-full w-3/5">
        <MapPanel />
      </div>

      {/* Feed column - 40% */}
      <Feedpanel />
    </div>
  );
}
