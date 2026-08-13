import { signOut } from "@/lib/actions/auth";
import { LogOut, CirclePlus } from "lucide-react";

export default function Nav({ toggleModal }: { toggleModal: () => void }) {
  return (
    <nav className="flex items-center justify-between border-b px-4 md:px-8 py-3 w-full">
      <h1 className="text-xl font-semibold pr-2">Photo Hub</h1>

      <div className="flex items-center gap-4">
        <button
          className="flex item-scenter justify-center gap-1.5 rounded-full bg-black p-2 text-white hover:bg-zinc-700 cursor-pointer text-sm font-medium transition-all duration-200 lg:px-3 lg:py-1.5"
          onClick={toggleModal}
          title="Add Pin"
        >
          <CirclePlus className="h-5 w-5" />
          <span className="hidden lg:inline">Add Pin</span>
        </button>
        <button
          onClick={signOut}
          className=" flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 p-2 text-zinc-500 hover:text-black hover:bg-neutral-50 cursor-pointer text-sm font-medium transition-all duration-200 lg:px-3 lg:py-1.5"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden lg:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
