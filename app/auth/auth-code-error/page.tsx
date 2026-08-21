import Link from "next/link";

export default async function AuthCodeError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign-in failed
          </h1>
          <p className="text-sm text-zinc-500">
            {reason ?? "This link is invalid or has already been used."}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-center">
          <Link
            href="/signup"
            className="font-medium text-black hover:underline dark:text-white"
          >
            Back to sign up
          </Link>
          <Link href="/login" className="text-zinc-500 hover:underline">
            Already confirmed? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
