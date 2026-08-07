"use client";
import { useEffect, useState } from "react";
import { Pin, CommentWithProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { X, SquarePen, Trash } from "lucide-react";
import { createComment } from "@/lib/actions/comments";
import LocationSearchInput, { LocationResult } from "./location-search-input";
import { deletePin, updatePin } from "@/lib/actions/pins";
import { useRouter } from "next/navigation";

export default function PinDetailDrawer({
  pin,
  user,
  onClose,
}: {
  pin: Pin;
  user: User | null;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currIndex, setCurrIndex] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(pin.caption ?? "");
  const [editCoordinates, setEditCoordinates] = useState<LocationResult | null>(
    null,
  );
  const [editVisitedAt, setEditVisitedAt] = useState(pin.visited_at ?? "");

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    setIsLoadingComments(true);

    supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("pin_id", pin.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load comments: ", error);
        } else {
          setComments(data);
        }
        setIsLoadingComments(false);
      });
  }, [pin.id]);

  const handleSubmitComment = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    const { success, error, comment } = await createComment(
      pin.id,
      commentText,
    );

    if (success && comment) {
      setComments((prev) => [...prev, comment]);
      setCommentText("");
    } else {
      console.error("Failed to post comment: ", error);
    }

    setIsSubmitting(false);
  };

  const handlePrev = () => {
    setCurrIndex((prev) => (prev === 0 ? pin.photo_urls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrIndex((prev) => (prev === pin.photo_urls.length - 1 ? 0 : prev + 1));
  };

  const handleSave = async () => {
    const { success, error } = await updatePin(pin.id, {
      caption: editCaption,
      location_name: editCoordinates?.location_name ?? pin.location_name ?? "",
      lat: editCoordinates?.lat ?? pin.lat,
      lng: editCoordinates?.lng ?? pin.lng,
      visited_at: editVisitedAt,
    });

    if (success) {
      setIsEditing(false);
      router.refresh(); // re-fetches pins server-side
    } else {
      console.error("Failed to update pin: ", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Delete this pin? This can't be undone.",
    );
    if (!confirmDelete) return;

    const { success, error } = await deletePin(pin.id);
    if (success) {
      router.refresh();
      onClose();
    } else {
      console.error("Failed to delete pin: ", error);
    }
  };

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
      {/* drawer */}
      <div className="fixed top-0 right-0 h-full w-1/2 max-w-[600px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <span className="font-medium text-neutral-900">{user?.email}</span>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 cursor-pointer text-zinc-400 hover:text-black"
              aria-label="Edit pin"
            >
              <SquarePen size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 cursor-pointer text-zinc-400 hover:text-red-600"
              aria-label="Delete pin"
            >
              <Trash size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-1 cursor-pointer text-zinc-400 hover:text-black"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* photos */}
        <div className="relative w-full h-[55vh] bg-neutral-800 overflow-hidden shrink-0">
          {pin.photo_urls.map((url, i) => (
            <div
              key={url}
              className={`absolute inset-0 flex justify-center items-center ${i === currIndex ? "block" : "hidden"}`}
            >
              <img
                src={url}
                alt={`${pin.caption}` || `${pin.location_name}` || "Pin photo"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}

          {/* carousel buttons */}
          {pin.photo_urls.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 flex justify-center items-center text-white w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer"
              >
                &#10094;
              </button>
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex justify-center items-center text-white w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer"
              >
                &#10095;
              </button>

              {/* dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {pin.photo_urls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrIndex(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currIndex ? "bg-white" : "bg-white/40"} hover:cursor-pointer`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* details */}
        <div className="p-4 border-b shrink-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <LocationSearchInput
                initialValue={pin.location_name ?? ""}
                onSelect={({ lat, lng, location_name }) => {
                  setEditCoordinates({ lat, lng, location_name });
                }}
              />
              <input
                type="date"
                value={editVisitedAt}
                onChange={(e) => setEditVisitedAt(e.target.value)}
                className="border px-3 py-2 text-sm"
              />
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="border px-3 py-2 text-sm resize-none"
              />
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-zinc-500 hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm bg-black text-white px-4 py-2 rounded-full bg-black/50 hover:bg-black hover:cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* comments */}
        {!isEditing && (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingComments ? (
                <p className="text-sm text-neutral-400">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-neutral-400">No comments yet.</p>
              ) : (
                <ul>
                  {comments.map((comment) => (
                    <li key={comment.id} className="text-sm">
                      <span className="font-medium text-neutral-900">
                        @{comment.profiles?.username}{" "}
                      </span>
                      {/* <br /> */}
                      <span className="text-neutral-600">
                        {comment.content}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* comments input */}
            <form
              onSubmit={handleSubmitComment}
              className="border-t p-3 flex items-end gap-2 shrink-0"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={1}
                className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="rounded-full bg-black text-white text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Post
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
