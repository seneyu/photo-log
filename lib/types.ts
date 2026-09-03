import { Database } from "@/lib/database.types";

export type Pin = Database["public"]["Tables"]["pins"]["Row"];
export type MapPin = Pick<Pin, "id" | "lat" | "lng">;

export type Comment = Database["public"]["Tables"]["comments"]["Row"];

// comment shape when fetched with profiles join (username, avatar_url)
export type CommentWithProfile = Comment & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "username" | "avatar_url"
  > | null;
};
