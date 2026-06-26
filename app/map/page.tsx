import Nav from "@/components/nav";
import MapGL from "@/components/mapgl";

export default function MapPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Map - 60% */}
      <div className="h-full w-3/5">
        <MapGL />
      </div>

      {/* Feed column - 40% */}
      <div className="flex h-full w-2/5 flex-col border-l">
        <Nav />
        <div>Feed</div>
      </div>
    </div>
  );
}
