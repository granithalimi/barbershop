"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Image as ImageIcon,
  AlignLeft,
  Calendar,
} from "lucide-react";
import { updateProfile } from "@/features/profile/actions";
import type { CurrentUserProfile } from "@/lib/supabase/auth";

interface ProfileClientProps {
  initialProfile: CurrentUserProfile & {
    bio?: string | null;
    created_at?: string;
  };
  email: string;
}

export default function ProfileClient({
  initialProfile,
  email,
}: ProfileClientProps) {
  const [formData, setFormData] = useState({
    fullName: initialProfile?.full_name || "",
    phone: initialProfile?.phone || "",
    avatarUrl: initialProfile?.avatar_url || "",
    bio: initialProfile?.bio || "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const role = initialProfile?.role || "client";

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Administrator
          </span>
        );
      case "barber":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5" /> Barber
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" /> Client
          </span>
        );
    }
  };

  const getInitials = () => {
    if (formData.fullName.trim()) {
      const parts = formData.fullName.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return formData.fullName.substring(0, 2).toUpperCase();
    }
    return (email?.[0] || "U").toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
      bio: formData.bio,
      avatar_url: formData.avatarUrl,
    });

    if (res.success) {
      setSuccessMessage("Your profile has been successfully updated.");
    } else {
      setErrorMessage(res.error || "Failed to update profile.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Profile Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your personal information, contact details, and public bio.
          </p>
        </div>
        <div className="self-start sm:self-auto">{getRoleBadge()}</div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-300 text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Profile Overview Card & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar & Summary Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt={formData.fullName || "User Avatar"}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shadow-amber-500/10"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-3xl shadow-xl shadow-amber-500/20">
                {getInitials()}
              </div>
            )}
          </div>

          <div className="w-full">
            <h2 className="text-lg font-bold text-white truncate">
              {formData.fullName || "Your Name"}
            </h2>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{email}</p>
          </div>

          <div className="w-full pt-4 border-t border-zinc-800/80 space-y-2.5 text-left text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-500" /> Role
              </span>
              <span className="font-semibold text-zinc-200 capitalize">{role}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> Account Status
              </span>
              <span
                className={`font-semibold ${
                  initialProfile.is_active ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {initialProfile.is_active ? "Active" : "Suspended"}
              </span>
            </div>
            {initialProfile.created_at && (
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Member Since
                </span>
                <span className="text-zinc-300">
                  {new Date(initialProfile.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Phone Number <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Email Address (Readonly) */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/40 border border-zinc-800/60 rounded-xl text-zinc-400 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Email is managed via authentication credentials.
                </p>
              </div>

              {/* Avatar Image URL */}
              <div className="space-y-2">
                <label
                  htmlFor="avatarUrl"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Avatar Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio (Especially useful for Barbers and Clients) */}
            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Bio / About
              </label>
              <div className="relative">
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us a little bit about yourself..."
                  className="w-full p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-4 border-t border-zinc-800/80">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
