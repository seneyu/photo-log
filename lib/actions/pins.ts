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

  revalidatePath("/map");
  return { success: true, error: "" };
}
