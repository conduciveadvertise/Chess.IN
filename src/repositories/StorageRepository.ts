import { supabase, isSupabaseConfigured } from "../lib/supabase";

export class StorageRepository {
  /**
   * Upload an avatar file to Supabase storage bucket `avatars`
   */
  async uploadAvatar(userId: string, file: any): Promise<string> {
    if (!isSupabaseConfigured) {
      // Return local URI if available or fallback
      return file?.uri || "";
    }

    try {
      const fileName = file?.name || "avatar.png";
      const fileExt = fileName.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      // Fallback to local file URI on error
      return file?.uri || "";
    }
  }
}

export const storageRepository = new StorageRepository();
