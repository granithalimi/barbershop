"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  weeklyScheduleSchema,
  timeOffSchema,
  type DayScheduleInput,
  type TimeOffInput,
} from "@/lib/validations/barber-schedule";

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

export async function saveWeeklySchedule(
  barberId: string,
  days: DayScheduleInput[]
) {
  try {
    const supabase = await verifyAdmin();

    const validated = weeklyScheduleSchema.safeParse(days);
    if (!validated.success) {
      return {
        error: validated.error.issues[0]?.message || "Invalid schedule data.",
      };
    }

    const DEFAULT_OFF_START = "09:00:00";
    const DEFAULT_OFF_END = "18:00:00";

    const payload = validated.data.map((day) => {
      let startTime = day.start_time
        ? (day.start_time.length === 5 ? `${day.start_time}:00` : day.start_time)
        : DEFAULT_OFF_START;
      let endTime = day.end_time
        ? (day.end_time.length === 5 ? `${day.end_time}:00` : day.end_time)
        : DEFAULT_OFF_END;

      if (!day.is_working) {
        if (!day.start_time) startTime = DEFAULT_OFF_START;
        if (!day.end_time) endTime = DEFAULT_OFF_END;
      }

      return {
        barber_id: barberId,
        day_of_week: day.day_of_week,
        start_time: startTime,
        end_time: endTime,
        is_working: day.is_working,
      };
    });

    const { error } = await supabase
      .from("barber_schedules")
      .upsert(payload, { onConflict: "barber_id, day_of_week" });

    if (error) {
      console.error("Supabase save schedules error:", error);
      return { error: "Failed to save weekly schedule." };
    }

    revalidatePath("/admin/barbers");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}

export async function addTimeOff(barberId: string, input: TimeOffInput) {
  try {
    const supabase = await verifyAdmin();

    const validated = timeOffSchema.safeParse(input);
    if (!validated.success) {
      return {
        error: validated.error.issues[0]?.message || "Invalid date range.",
      };
    }

    const { error } = await supabase.from("barber_time_off").insert({
      barber_id: barberId,
      start_date: validated.data.start_date,
      end_date: validated.data.end_date,
      reason: validated.data.reason?.trim() || null,
    });

    if (error) {
      console.error("Supabase add time off error:", error);
      return { error: "Failed to add time off." };
    }

    revalidatePath("/admin/barbers");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}

export async function deleteTimeOff(timeOffId: string) {
  try {
    const supabase = await verifyAdmin();

    const { error } = await supabase
      .from("barber_time_off")
      .delete()
      .eq("id", timeOffId);

    if (error) {
      console.error("Supabase delete time off error:", error);
      return { error: "Failed to delete time off." };
    }

    revalidatePath("/admin/barbers");
    revalidatePath("/book");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}
