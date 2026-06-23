import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// proxy and entry point
// Next.js runs on every request before the page loads, refreshes the Supabase session via cookie
export async function proxy(request: NextRequest) {
return await updateSession(request);
}

// skip static assets — only run on actual page routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
