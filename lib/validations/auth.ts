import { z } from "zod";
import { sanitizeAndValidatePhone } from "@/lib/phone-utils";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(70, "Full name is too long."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(100, "Email is too long."),
    countryCode: z.string().default("+389"),
    phone: z.string().trim().min(1, "Phone number is required."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(100, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    const phoneRes = sanitizeAndValidatePhone(data.countryCode, data.phone);
    if (!phoneRes.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: phoneRes.error || "Please enter a valid phone number.",
        path: ["phone"],
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;
