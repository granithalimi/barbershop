"use client";

import {
  Scissors,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import type { MockBarber, MockService } from "@/lib/mock-booking-data";
import type { CurrentUserProfile } from "@/lib/supabase/auth";
import type { GuestData } from "./StepContactDetails";

interface StepConfirmationProps {
  barber: MockBarber;
  service: MockService;
  selectedDate: string;
  selectedTime: string;
  currentUser?: {
    user: { id: string; email?: string } | null;
    profile: CurrentUserProfile | null;
  } | null;
  guestData: GuestData;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export default function StepConfirmation({
  barber,
  service,
  selectedDate,
  selectedTime,
  currentUser,
  guestData,
  isSubmitting,
  onConfirm,
}: StepConfirmationProps) {
  const isLoggedIn = !!currentUser?.user;
  const profile = currentUser?.profile;

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const clientName = isLoggedIn
    ? profile?.full_name || currentUser?.user?.email?.split("@")[0] || "Client"
    : guestData.fullName || "Guest Client";

  const clientPhone = isLoggedIn
    ? profile?.phone || "No phone linked"
    : `${guestData.countryCode} ${guestData.phone}` || "N/A";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Review & Confirm Booking
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Please review your appointment summary before finalizing.
        </p>
      </div>

      {/* Receipt Breakdown Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-4 sm:p-5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0 shadow-md shadow-amber-500/20">
                {barber.initials}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {barber.name}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{barber.role}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700">
              Apex Barbershop
            </span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {/* Service & Duration */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-800/80">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-zinc-400">Service</span>
              <p className="font-bold text-white">{service.name}</p>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Duration: {service.durationMinutes} min
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase font-bold text-zinc-400">Price</span>
              <p className="text-base sm:text-lg font-black text-amber-400">
                €{service.priceEur}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800/80">
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Date
              </span>
              <p className="font-semibold text-zinc-200 text-xs sm:text-sm">{formattedDate}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-400" /> Start Time
              </span>
              <p className="font-semibold text-zinc-200 text-xs sm:text-sm">{selectedTime}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="pb-3 border-b border-zinc-800/80">
            <span className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-amber-400" /> Client
            </span>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-200">{clientName}</p>
              <span className="text-zinc-400 text-xs">{clientPhone}</span>
            </div>
          </div>

          {/* Total & Payment Notice */}
          <div className="pt-1 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Total to pay at shop</p>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Banknote className="w-3.5 h-3.5" /> Cash Payment
              </span>
            </div>
            <span className="text-2xl font-black text-white">€{service.priceEur}.00</span>
          </div>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-center">
        <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          No upfront payment required. You will receive a WhatsApp confirmation.
        </p>
      </div>
    </div>
  );
}
