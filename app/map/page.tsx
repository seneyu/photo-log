import Feedpanel from "@/components/feed-panel";
import { createClient } from "@/lib/supabase/server";
import { MapStoreProvider } from "@/providers/map-store-provider";
import { headers } from "next/headers";
import MapPanel from "@/components/map-panel-client";
import { getDeviceDetail, getNextCursor, hasMorePins } from "@/lib/pagination";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // read the user-agent in headers to detect mobile device
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  const { isMobile, paginationLimit } = getDeviceDetail(userAgent);

  // all pins to list on map
  const mapPinsQuery = supabase
    .from("pins")
    .select("id, lat, lng")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  // pins for initial pagination, limit desktop 5, mobile 10
  const initialFeedQuery = supabase
    .from("pins")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(paginationLimit);

  const [{ data: mapPins }, { data: initialPins }] = await Promise.all([
    mapPinsQuery,
    initialFeedQuery,
  ]);

  const pinsArray = initialPins ?? [];
  const mapPinsArray = mapPins ?? [];

  // generate the cursor pointer
  const { nextCursorId, nextCursorCreatedAt } = getNextCursor(pinsArray);
  const hasMoreInitial = hasMorePins(pinsArray.length, mapPinsArray.length);

  return (
    <MapStoreProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Map - 60% */}
        {!isMobile && (
          <div className="hidden md:block w-full">
            <MapPanel pins={mapPins ?? []} />
          </div>
        )}

        {/* Feed column - 40% */}
        <Feedpanel
          user={user}
          initialPins={initialPins ?? []}
          nextCursorId={nextCursorId}
          nextCursorCreatedAt={nextCursorCreatedAt}
          limit={paginationLimit}
          hasMoreInitial={hasMoreInitial}
        />
      </div>
    </MapStoreProvider>
  );
}
