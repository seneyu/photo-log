"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    console.log("login error: ", JSON.stringify(error));
    redirect(
      `/login?error=${encodeURIComponent(error.message ?? JSON.stringify(error))}`,
    );
  }

  redirect("/map");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    console.log("signup error: ", JSON.stringify(error));
    redirect(
      `/signup?error=${encodeURIComponent(error.message ?? JSON.stringify(error))}`,
    );
  }
  redirect("/signup?message=Check your email to confirm your account");
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      // after user approves on github, supabase processes it
      // then redirects to redirectTo -> /auth/callback/route.ts file
      redirectTo: `${origin}/auth/callback?next=/map`,
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
