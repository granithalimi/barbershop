"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type AppointmentStatus = "pending" | "confirmed" | "declined";

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus
) {
  try {
    const authData = await getCurrentUser();

    if (!authData?.user || authData.profile?.role !== "barber") {
      return { success: false, error: "Unauthorized. Barber access required." };
    }

    const supabase = await createClient();

    // Update appointment status where barber_id matches the authenticated barber
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .eq("barber_id", authData.user.id)
      .select(
        `
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        guest_name,
        guest_phone,
        client:profiles!appointments_client_id_fkey(full_name, phone),
        service:services(name)
      `
      )
      .single();

    if (error) {
      console.error("Error updating appointment status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/barber/appointments");
    return { success: true, appointment: data };
  } catch (err: unknown) {
    console.error("Unexpected error updating appointment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status",
    };
  }
}
