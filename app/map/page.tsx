import Feedpanel from "@/components/feed-panel";
import { createClient } from "@/lib/supabase/server";
import { MapStoreProvider } from "@/providers/map-store-provider";
import { headers } from "next/headers";
import MapPanel from "@/components/map-panel-client";

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

  // read the user-agent in headers to detect mobile device
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

  return (
    <MapStoreProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Map - 60% */}
        {!isMobile && (
          <div className="hidden md:block w-full w-3/5">
            <MapPanel pins={pins ?? []} />
          </div>
        )}

        {/* Feed column - 40% */}
        <Feedpanel user={user} pins={pins ?? []} />
      </div>
    </MapStoreProvider>
  );
}
