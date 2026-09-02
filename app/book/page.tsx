import Link from "next/link";
import { Scissors, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/auth";
import BookingWizard from "./_components/BookingWizard";

export const metadata = {
  title: "Book an Appointment | Apex Barbershop",
  description: "Select your barber, pick a service, and book your haircut slot in seconds.",
};

export default async function BookPage() {
  const authData = await getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient Lighting & Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Brand Header */}
      <header className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-wider text-zinc-100 flex items-center gap-1">
              APEX <span className="text-amber-400">BARBERS</span>
            </span>
            <span className="block text-[9px] tracking-widest uppercase text-zinc-400 -mt-1 font-medium">
              Direct Booking
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant WhatsApp Confirmation
          </span>
        </div>
      </header>

      {/* Main Booking Wizard Container */}
      <main className="relative z-10 flex-1 px-3 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto w-full">
        <BookingWizard currentUser={authData} />
      </main>


      {/* Footer stays underneath the floating bottom action bar */}
      <footer className="relative z-0 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/80 pb-28 sm:pb-6">
        <p>© {new Date().getFullYear()} Apex Barbershop. Cash payment collected at the shop.</p>
      </footer>
    </div>
  );
}


