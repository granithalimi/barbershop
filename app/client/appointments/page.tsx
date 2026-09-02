import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Plus,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import UserMenuDropdown from "@/app/_components/UserMenuDropdown";

export const dynamic = "force-dynamic";

interface AppointmentWithRelations {
  id: string;
  barber_id: string;
  service_id: string;
  client_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "declined" | "completed" | "cancelled";
  payment_method: "cash";
  total_price: number;
  notes: string | null;
  created_at: string;
  barber?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  } | null;
  service?: {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
  } | null;
}

export default async function ClientAppointmentsPage() {
  const supabase = await createClient();
  const authData = await getCurrentUser();

  // Protect route: require authenticated user
  if (!authData?.user) {
    redirect("/login");
  }

  // Protect route: require active client role
  if (
    !authData.profile ||
    authData.profile.is_active === false ||
    authData.profile.role !== "client"
  ) {
    redirect("/");
  }

  // Fetch client's appointments with joined barber profile and service details
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      barber:profiles!appointments_barber_id_fkey(id, full_name, email, phone, avatar_url),
      service:services(id, name, duration_minutes, price)
    `
    )
    .eq("client_id", authData.user.id)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    console.error("Error fetching client appointments:", error);
  }

  const clientAppointments: AppointmentWithRelations[] = appointments || [];

  const getStatusBadge = (status: AppointmentWithRelations["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
            Completed
          </span>
        );
      case "declined":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
              Client Portal
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
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Title & Booking Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-amber-500" />
              My Appointments
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              View your upcoming and past haircut & grooming appointments.
            </p>
          </div>

          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Book New Appointment
          </Link>
        </div>

        {/* Appointments Table Card or Empty State */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
          {clientAppointments.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No appointments booked yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                You don't have any appointments scheduled. Book your next visit with our master barbers in just a few clicks.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Scissors className="w-4 h-4 transform -rotate-45" />
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Service</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Barber</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Date & Time</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Price</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-normal">
                  {clientAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      {/* Service */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-amber-400 shrink-0">
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-medium text-white text-xs sm:text-sm block">
                              {appointment.service?.name || "Standard Service"}
                            </span>
                            <span className="text-zinc-400 text-[11px] font-light flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {appointment.service?.duration_minutes || 30} mins
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Barber */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs shrink-0">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                          </div>
                          <div>
                            <span className="font-medium text-zinc-200 text-xs block">
                              {appointment.barber?.full_name || "Apex Barber"}
                            </span>
                            {appointment.barber?.phone && (
                              <span className="text-[11px] text-zinc-500 font-light block">
                                {appointment.barber.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-zinc-300 font-light text-[11px] sm:text-xs">
                          <div className="flex items-center gap-1.5 text-white font-medium">
                            <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Clock className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span>
                              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price & Payment */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div>
                          <span className="font-semibold text-amber-400 text-xs sm:text-sm">
                            ${Number(appointment.total_price).toFixed(2)}
                          </span>
                          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                            {appointment.payment_method}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-0 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/80">
        <p>© {new Date().getFullYear()} Apex Barbershop. All rights reserved.</p>
      </footer>
    </div>
  );
}
