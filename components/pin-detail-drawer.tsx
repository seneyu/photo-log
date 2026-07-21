"use client";
import { useEffect, useState } from "react";
import { Pin, CommentWithProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { createComment } from "@/lib/actions/comments";

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
                  <span className="text-neutral-600">{comment.content}</span>
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
      </div>
    </>
  );
}
