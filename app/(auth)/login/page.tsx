import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error: errorParam, message } = await searchParams;

  async function login(formData: FormData) {
    "use server";

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500">
            Log in to your Photo Hub account
          </p>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {errorParam && <p className="text-sm text-red-500">{errorParam}</p>}

        <form action={login} className="space-y-4">
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
            Log in
          </button>
        </form>

        <p className="text-sm text-center text-zinc-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-black hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
