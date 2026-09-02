"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { userRoleSchema, type UserRole } from "@/lib/validations/user";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_active === false || profile.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  return { supabase, currentUserId: user.id };
}

export async function updateUserRole(targetUserId: string, newRole: UserRole) {
  try {
    const { supabase, currentUserId } = await verifyAdmin();

    const validated = userRoleSchema.safeParse(newRole);
    if (!validated.success) {
      return { error: "Invalid role selected." };
    }

    // Prevent admin from accidentally demoting themselves if they are the only admin
    if (targetUserId === currentUserId && newRole !== "admin") {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if ((count ?? 0) <= 1) {
        return {
          error:
            "You cannot demote yourself because you are the only administrator in the system.",
        };
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: validated.data })
      .eq("id", targetUserId);

    if (error) {
      console.error("Supabase update role error:", error);
      return { error: "Failed to update user role. Please try again." };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}
