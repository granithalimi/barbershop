"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  Settings,
  Scissors,
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  LogOut,
  ChevronDown,
  Shield,
  Sparkles,
} from "lucide-react";
import type { CurrentUserProfile } from "@/lib/supabase/auth";

interface UserMenuDropdownProps {
  user: { id: string; email?: string };
  profile: CurrentUserProfile | null;
}

export default function UserMenuDropdown({ user, profile }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = profile?.role || "client";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user.email || "";

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case "barber":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
            <Scissors className="w-3 h-3" /> Barber
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
            Client
          </span>
        );
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (user.email?.[0] || "U").toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl transition-all text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-sm">
          {getInitials()}
        </div>
        <span className="font-semibold max-w-[120px] truncate text-left hidden sm:inline-block">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              {getRoleBadge()}
            </div>
            <p className="text-xs text-zinc-400 truncate">{displayEmail}</p>
          </div>

          {/* Role Navigation Items */}
          <div className="py-2 px-1">
            {role === "client" && (
              <>
                <Link
                  href="/client/appointments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>My Appointments</span>
                </Link>
                <Link
                  href="/client/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Profile Settings</span>
                </Link>
              </>
            )}

            {role === "barber" && (
              <>
                <Link
                  href="/barber/appointments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Scissors className="w-4 h-4 text-sky-400" />
                  <span>Barber Appointments</span>
                </Link>
                <Link
                  href="/barber/schedule"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>My Schedule</span>
                </Link>
                <Link
                  href="/barber/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Barber Bio & Profile</span>
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  href="/admin/overview"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Admin Overview</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>User Management</span>
                </Link>
                <Link
                  href="/admin/barbers"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Barber Shifts</span>
                </Link>
                <Link
                  href="/admin/services"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Service Catalog</span>
                </Link>
                <Link
                  href="/admin/appointments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-xl transition-colors"
                >
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>All Appointments</span>
                </Link>
              </>
            )}
          </div>

          {/* Logout Section */}
          <div className="pt-2 px-1 border-t border-zinc-800/80">
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
