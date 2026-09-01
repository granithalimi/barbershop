import { createClient } from "@/lib/supabase/server";

export type CurrentUserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "client" | "barber" | "admin";
  avatar_url?: string | null;
  is_active: boolean;
};

export async function getCurrentUser(): Promise<{
  user: { id: string; email?: string } | null;
  profile: CurrentUserProfile | null;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, avatar_url, is_active")
    .eq("id", user.id)
    .single();


  return {
    user,
    profile: profile as CurrentUserProfile | null,
  };
}
