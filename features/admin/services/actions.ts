"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";

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

  return supabase;
}

export async function createService(input: ServiceInput) {
  try {
    const supabase = await verifyAdmin();

    const validated = serviceSchema.safeParse(input);
    if (!validated.success) {
      return {
        error: validated.error.issues[0]?.message || "Invalid service data.",
      };
    }

    const { error } = await supabase.from("services").insert({
      name: validated.data.name.trim(),
      description: validated.data.description?.trim() || null,
      duration_minutes: validated.data.duration_minutes,
      price: validated.data.price,
    });

    if (error) {
      console.error("Supabase create service error:", error);
      return { error: "Failed to create service. Please try again." };
    }

    revalidatePath("/admin/services");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}

export async function updateService(id: string, input: ServiceInput) {
  try {
    const supabase = await verifyAdmin();

    const validated = serviceSchema.safeParse(input);
    if (!validated.success) {
      return {
        error: validated.error.issues[0]?.message || "Invalid service data.",
      };
    }

    const { error } = await supabase
      .from("services")
      .update({
        name: validated.data.name.trim(),
        description: validated.data.description?.trim() || null,
        duration_minutes: validated.data.duration_minutes,
        price: validated.data.price,
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase update service error:", error);
      return { error: "Failed to update service. Please try again." };
    }

    revalidatePath("/admin/services");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}

export async function deleteService(id: string) {
  try {
    const supabase = await verifyAdmin();

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete service error:", error);
      if (error.code === "23503") {
        return {
          error:
            "Cannot delete this service because it is linked to appointments.",
        };
      }
      return { error: "Failed to delete service. Please try again." };
    }

    revalidatePath("/admin/services");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}
