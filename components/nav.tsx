import { signOut } from "@/lib/actions/auth";

export default function Nav({ toggleModal }: { toggleModal: () => void }) {
  return (
    <nav className="flex items-center justify-between border-b px-8 py-3">
      <h1 className="text-xl font-semibold">Photo Hub</h1>

      <div className="flex items-center gap-4">
        <button
          className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:bg-zinc-700 hover:cursor-pointer"
          onClick={toggleModal}
        >
          + Add Pin
        </button>
        <button
          onClick={signOut}
          className="rounded-full border-1 border-grey-500 px-5 py-1.5 text-sm text-zinc-500 hover:text-black hover:cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
