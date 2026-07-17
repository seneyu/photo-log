import { Pin } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { X } from "lucide-react";

export default function PinDetailDrawer({
  pin,
  user,
  onClose,
}: {
  pin: Pin;
  user: User | null;
  onClose: () => void;
}) {
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
      {/* drawer */}
      <div className="fixed top-0 right-0 h-full w-1/2 max-w-[600px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <span className="font-medium text-neutral-900">{user?.email}</span>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer text-zinc-400 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* photos */}
        <div className="w-full h-[55vh] bg-neutral-800 flex items-center justify-center shrink-0">
          {pin.photo_urls[0] && (
            <img
              src={pin.photo_urls[0]}
              alt={pin.caption || pin.location_name || "Pin photo"}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* details */}
        <div className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-900">
              {pin.location_name}
            </h3>
            <span className="text-xs text-neutral-400">
              Visited {formatDate(pin.visited_at)}
            </span>
          </div>
          {pin.caption && (
            <p className="text-sm text-neutral-600 mt-1">{pin.caption}</p>
          )}
        </div>

        {/* comments */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-neutral-400">Comments</p>
        </div>
      </div>
    </>
  );
}
