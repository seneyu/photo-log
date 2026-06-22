import Link from "next/link";

export default function Login() {
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

        <form action="" className="space-y-4">
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
