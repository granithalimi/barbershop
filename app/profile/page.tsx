import Link from "next/link";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, type CurrentUserProfile } from "@/lib/supabase/auth";
import UserMenuDropdown from "@/components/landing/UserMenuDropdown";
import ProfileClient from "@/components/profile/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const authData = await getCurrentUser();

  // Protect route: require authenticated user regardless of role
  if (!authData?.user) {
    redirect("/login");
  }

  // Fetch full profile details including bio and timestamps
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, avatar_url, bio, is_active, created_at, updated_at")
    .eq("id", authData.user.id)
    .single();

  const userProfile = (profile || authData.profile || {
    id: authData.user.id,
    email: authData.user.email || "",
    full_name: "",
    phone: "",
    role: "client",
    avatar_url: null,
    bio: null,
    is_active: true,
    created_at: new Date().toISOString(),
  }) as CurrentUserProfile & {
    bio?: string | null;
    created_at?: string;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-30 p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-wider text-zinc-100 flex items-center gap-1">
              APEX <span className="text-amber-400">BARBERS</span>
            </span>
            <span className="block text-[9px] tracking-widest uppercase text-zinc-400 -mt-1 font-medium">
              Profile & Account
            </span>
          </div>
        </Link>

        {/* Right side: User Dropdown */}
        <div className="flex items-center gap-3">
          {authData?.user && (
            <UserMenuDropdown user={authData.user} profile={authData.profile} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <ProfileClient
          initialProfile={userProfile}
          email={authData.user.email || userProfile.email || ""}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-0 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/80">
        <p>© {new Date().getFullYear()} Apex Barbershop. All rights reserved.</p>
      </footer>
    </div>
  );
}
