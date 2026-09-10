"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

export async function createPin(formData: FormData) {
  const photo_urls: string[] = [];

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Error in createPin server action. No authenticated user.");
    return { success: false, error: "Not authenticated." };
  }

  // process formData
  const files = formData.getAll("photo_files") as File[];
  const caption = formData.get("caption");
  const location_name = formData.get("location_name");
  const latitude = formData.get("lat");
  const longitude = formData.get("lng");
  const visited_at = formData.get("visited_at");

  // upload photos to supabase file storage and retrieve photo urls
  for (let file of files) {
    let path = `${user?.id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from("photo-uploads")
      .upload(path, file);

    if (error) {
      console.error(
        "Error in createPin server action. Photos upload failed: ",
        error,
      );
      return { success: false, error: "Failed to upload photos." };
    }

    // get photos urls
    const { data: urlData } = supabase.storage
      .from("photo-uploads")
      .getPublicUrl(path);
    photo_urls.push(urlData.publicUrl);
  }

  // insert data to pins table
  const { error } = await supabase.from("pins").insert({
    user_id: user?.id,
    photo_urls,
    caption,
    lat: Number(latitude),
    lng: Number(longitude),
    location_name,
    visited_at,
  });

  if (error) {
    console.error(
      "Error in createPin server action. Insert data failed: ",
      error,
    );

    return { success: false, error: "Failed to save data." };
  }

  // revalidatePath in server actions clears database cache
  // and forces an immediate server-side re-render of the updated path
  revalidatePath("/map");
  return { success: true, error: "" };
}

export async function updatePin(
  pinId: string,
  updates: {
    caption: string;
    location_name: string;
    lat: number;
    lng: number;
    visited_at: string;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Error in updatePin server action. No authenticated user.");
    return { success: false, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("pins")
    .update({
      caption: updates.caption,
      location_name: updates.location_name,
      lat: updates.lat,
      lng: updates.lng,
      visited_at: updates.visited_at,
    })
    .eq("id", pinId)
    .eq("user_id", user.id);
  // .select()
  // .single();

  if (error) {
    console.error("Error in updatePin server action: ", error);
    return { success: false, error: "Failed to update pin." };
  }

  revalidatePath("/map");
  return { success: true, error: "" };
}

export async function deletePin(pinId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Error in deletePin server action. No authenticated user.");
    return { success: false, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("pins")
    .delete()
    .eq("id", pinId)
    .eq("user_id", user.id);
  // .select()
  // .single();

  if (error) {
    console.error("Error in deletePin server action: ", error);
    return { success: false, error: "Failed to delete pin." };
  }

  revalidatePath("/map");
  return { success: true, error: "" };
}

export async function fetchMorePins(
  nextCursorId: string | null,
  nextCursorCreatedAt: string,
  limit: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Error in deletePin server action. No authenticated user.");
    return { success: false, error: "Not authenticated." };
  }

  // fetches records where created_at is older than the cursor
  // OR where created_at matches the cursor exactly but the id is smaller
  const { data, error } = await supabase
    .from("pins")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .or(
      `created_at.lt.${nextCursorCreatedAt},and(created_at.eq.${nextCursorCreatedAt},id.lt.${nextCursorId})`,
    )
    .limit(limit);

  const nextCursor = data?.length === limit ? data[data.length - 1].id : null;
  const nextCreatedAt =
    data?.length === limit ? data[data.length - 1].created_at : null;

  if (error) {
    console.error("Error in fetchMorePins server action: ", error);
    return { success: false, error: "Failed to fetch more pins." };
  }

  return { success: true, data, nextCursor, nextCreatedAt, error: "" };
}
