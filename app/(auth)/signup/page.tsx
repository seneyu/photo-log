import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error: errorParam, message } = await searchParams;

  async function signUp(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      console.log("signup error:", JSON.stringify(error));
      redirect(
        `/signup?error=${encodeURIComponent(error.message ?? JSON.stringify(error))}`,
      );
    }
    redirect("/signup?message=Check your email to confirm your account");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Photo Hub
          </h1>
          <p className="text-sm text-zinc-500">
            Create an account to start sharing photos
          </p>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {errorParam && <p className="text-sm text-red-500">{errorParam}</p>}

        <form action={signUp} className="space-y-4">
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Sign up
          </button>
        </form>

        <p className="text-sm text-center text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
