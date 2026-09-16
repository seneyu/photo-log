"use server";

import { createClient } from "../supabase/server";
import { CommentWithProfile } from "../types";
import { isDemoAccount } from "../utils";

export async function createComment(
  pinId: string,
  comment: string,
): Promise<{ success: boolean; error: string; comment?: CommentWithProfile }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(
      "Error in createComment server action. No authenticated user.",
    );
    return { success: false, error: "Not authenticated." };
  }

  if (isDemoAccount(user.email)) {
    return {
      success: false,
      error: "Demo mode is read-only. Sign up to leave a comment.",
    };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ pin_id: pinId, user_id: user.id, content: comment })
    .select("*, profiles(username)")
    .single(); // return the inserted row

  if (error) {
    console.error(
      "Error in createComment server action. Create comment failed: ",
      error,
    );
    return { success: false, error: "Failed to create comment." };
  }

  return { success: true, comment: data, error: "" };
}
