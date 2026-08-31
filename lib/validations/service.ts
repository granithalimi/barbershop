import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters.")
    .max(100, "Service name cannot exceed 100 characters."),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  duration_minutes: z.coerce
    .number({ message: "Duration is required" })
    .int("Duration must be a whole number.")
    .min(5, "Duration must be at least 5 minutes.")
    .max(480, "Duration cannot exceed 480 minutes (8 hours)."),
  price: z.coerce
    .number({ message: "Price is required" })
    .min(0, "Price must be at least 0.")
    .max(10000, "Price cannot exceed 10,000."),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  created_at: string;
}
