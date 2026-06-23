"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      // after user approves on github, supabase processes it
      // then redirects to redirectTo -> /auth/callback/route.ts file
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/map`,
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message ?? JSON.stringify(error))}`,
    );
  }

  // server action sends user to github
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
