"use client";

import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";
import type { CurrentUserProfile } from "@/lib/supabase/auth";

export interface GuestData {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
}

interface StepContactDetailsProps {
  currentUser: {
    user: { id: string; email?: string } | null;
    profile: CurrentUserProfile | null;
  } | null;
  guestData: GuestData;
  onUpdateGuestData: (data: Partial<GuestData>) => void;
}

export default function StepContactDetails({
  currentUser,
  guestData,
  onUpdateGuestData,
}: StepContactDetailsProps) {
  const isLoggedIn = !!currentUser?.user;
  const profile = currentUser?.profile;

  const displayName = profile?.full_name || currentUser?.user?.email?.split("@")[0] || "Client";
  const displayEmail = profile?.email || currentUser?.user?.email || "";
  const displayPhone = profile?.phone || "No phone linked";

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (currentUser?.user?.email?.[0] || "U").toUpperCase();
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {isLoggedIn ? "Confirm Your Contact Info" : "Your Contact Details"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {isLoggedIn
            ? "Your verified account information will be used for appointment updates."
            : "Please enter your contact details so the barber can send your confirmation."}
        </p>
      </div>

      {/* Case A: Logged In Mode (Zero-Input Verified Card) */}
      {isLoggedIn ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
                  <p className="text-xs text-zinc-400 truncate">{displayEmail}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Mobile Phone
              </span>
              <span className="font-semibold text-zinc-200">
                {displayPhone}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Case B: Guest Mode (Clean Form with Dial Code Selector) */
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Full Name <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={guestData.fullName}
                onChange={(e) => onUpdateGuestData({ fullName: e.target.value })}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Phone Number with Country Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Mobile Phone (WhatsApp Notifications) <span className="text-amber-400">*</span>
            </label>
            <div className="flex gap-2">
              {/* Dial Code Selector */}
              <div className="w-[115px] sm:w-[130px] shrink-0">
                <select
                  value={guestData.countryCode}
                  onChange={(e) => onUpdateGuestData({ countryCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dialCode} className="bg-zinc-900 text-white">
                      {c.flag} {c.dialCode} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={guestData.phone}
                  onChange={(e) => onUpdateGuestData({ phone: e.target.value })}
                  placeholder="70 123 456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Email Address <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={guestData.email}
                onChange={(e) => onUpdateGuestData({ email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 hover:underline font-semibold">
              Sign In to autofill
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

