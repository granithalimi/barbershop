import { z } from "zod";

export const dayScheduleSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_working: z.boolean(),
    start_time: z.string().optional().or(z.literal("")),
    end_time: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.is_working) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        return (
          Boolean(data.start_time && timeRegex.test(data.start_time)) &&
          Boolean(data.end_time && timeRegex.test(data.end_time))
        );
      }
      return true;
    },
    {
      message: "Start time and end time are required when working",
      path: ["start_time"],
    }
  );

export const weeklyScheduleSchema = z.array(dayScheduleSchema);

export const timeOffSchema = z
  .object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    reason: z.string().max(255, "Reason cannot exceed 255 characters").optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date cannot be earlier than start date",
    path: ["end_date"],
  });

export type DayScheduleInput = z.infer<typeof dayScheduleSchema>;
export type TimeOffInput = z.infer<typeof timeOffSchema>;

export interface BarberProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface BarberScheduleRecord {
  id?: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
}

export interface BarberTimeOffRecord {
  id: string;
  barber_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}
