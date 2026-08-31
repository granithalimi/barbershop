import { z } from "zod";

export const userRoleSchema = z.enum(["client", "barber", "admin"]);

export type UserRole = z.infer<typeof userRoleSchema>;

export interface ProfileItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
