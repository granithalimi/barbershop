"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, Clock, Scissors, MessageCircle, Home, RotateCcw } from "lucide-react";
import type { MockBarber, MockService } from "@/lib/mock-booking-data";

interface StepBookingSuccessProps {
  barber: MockBarber;
  service: MockService;
  selectedDate: string;
  selectedTime: string;
  onReset: () => void;
}

export default function StepBookingSuccess({
  barber,
  service,
  selectedDate,
  selectedTime,
  onReset,
}: StepBookingSuccessProps) {
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-200">
      {/* Animated Checkmark */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500 text-amber-400 shadow-xl shadow-amber-500/20">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Appointment Requested!
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
          Your booking with <strong className="text-white">{barber.name}</strong> is now pending confirmation.
        </p>
      </div>

      {/* Appointment Summary Box */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>{service.name}</span>
          </div>
          <span className="text-xs font-bold text-amber-400">€{service.priceEur}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-300">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-bold text-white">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {selectedTime}
          </span>
        </div>

        {/* WhatsApp Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
          <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {barber.name} will review your request and send a direct confirmation to your WhatsApp shortly.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm"
        >
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold py-3.5 px-5 rounded-xl transition-all text-xs sm:text-sm"
        >
          <RotateCcw className="w-4 h-4 text-zinc-400" />
          Book Another
        </button>
      </div>
    </div>
  );
}
