import MapPanel from "@/components/map-panel";
import Feedpanel from "@/components/feed-panel";
import { createClient } from "@/lib/supabase/server";
import { MapStoreProvider } from "@/providers/map-store-provider";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // retrieve authenticated user's pins
  const { data: pins } = await supabase
    .from("pins")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <MapStoreProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Map - 60% */}
        <div className="h-full w-3/4">
          <MapPanel pins={pins ?? []} />
        </div>

        {/* Feed column - 40% */}
        <Feedpanel user={user} pins={pins ?? []} />
      </div>
    </MapStoreProvider>
  );
}
