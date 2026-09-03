"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export interface UpdateProfileInput {
  full_name: string;
  phone: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const authData = await getCurrentUser();

    if (!authData?.user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!data.full_name?.trim()) {
      return { success: false, error: "Full name is required." };
    }

    if (!data.phone?.trim()) {
      return { success: false, error: "Phone number is required." };
    }

    const supabase = await createClient();

    const updatePayload: {
      full_name: string;
      phone: string;
      bio?: string | null;
      avatar_url?: string | null;
      updated_at: string;
    } = {
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      bio: data.bio?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", authData.user.id);

    if (error) {
      console.error("Error updating profile:", error);
      if (error.code === "23505") {
        return {
          success: false,
          error: "This phone number is already registered to another account.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error updating profile:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}
