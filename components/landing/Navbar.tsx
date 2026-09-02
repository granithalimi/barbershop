import Link from "next/link";
import { Scissors, Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/auth";
import UserMenuDropdown from "@/components/landing/UserMenuDropdown";

export default async function Navbar() {
  const authData = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Scissors className="w-6 h-6 transform -rotate-45" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold tracking-wider text-zinc-100 flex items-center gap-1.5">
              APEX <span className="text-amber-400">BARBERS</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-zinc-400 -mt-1 font-medium">
              Precision & Grooming
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#services" className="hover:text-amber-400 transition-colors">
            Services & Pricing
          </a>
          <a href="#gallery" className="hover:text-amber-400 transition-colors">
            Our Work
          </a>
          <a href="#barbers" className="hover:text-amber-400 transition-colors">
            Barbers
          </a>
          <a href="#info" className="hover:text-amber-400 transition-colors">
            Hours & Location
          </a>
        </nav>

        {/* Action CTAs / User State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {authData?.user ? (
            <UserMenuDropdown user={authData.user} profile={authData.profile} />
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-amber-400 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book Appointment</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

