"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, User, Mail, Phone, Lock, ArrowRight, ArrowLeft, MessageCircle, ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, } from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";

interface RegisterFormState {
  errors?: Record<string, string>;
  serverError?: string | null;
}

export default function RegisterPage() {
  const router = useRouter();

  // Action function passed to useActionState that calls /auth/register API route
  const registerAction = async (
    _prevState: RegisterFormState | null,
    formData: FormData
  ): Promise<RegisterFormState> => {
    const rawData = {
      fullName: (formData.get("fullName") as string)?.trim() || "",
      email: (formData.get("email") as string)?.trim() || "",
      countryCode: (formData.get("countryCode") as string)?.trim() || "+389",
      phone: (formData.get("phone") as string)?.trim() || "",
      password: (formData.get("password") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
    };

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawData),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        if (data.field) {
          return { errors: { [data.field]: data.error } };
        }
        return {
          serverError:
            data.error || "Failed to create account. Please try again.",
        };
      }

      if (data.success && data.redirectTo) {
        router.push(data.redirectTo);
      }

      return {};
    } catch (err: unknown) {
      console.error("Registration error:", err);
      return {
        serverError:
          "A network error occurred. Please check your connection and try again.",
      };
    }
  };

  const [state, formAction, isPending] = useActionState<
    RegisterFormState | null,
    FormData
  >(registerAction, null);

  // UI state for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errors = state?.errors || {};
  const serverError = state?.serverError;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Back Link */}
      <header className="relative z-10 p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Apex Barbershop
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Brand Logo & Heading */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 mb-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-6 h-6 transform -rotate-45" />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Join Apex Barbers to manage bookings, track past cuts, and leave reviews.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            <form action={formAction} noValidate className="space-y-4">
              {/* General Server Error Banner */}
              {serverError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="e.g. Alex Smith"
                    disabled={isPending}
                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${errors.fullName
                      ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={isPending}
                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number Field (With WhatsApp Notification note) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
                  >
                    Phone Number
                  </label>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <MessageCircle className="w-3 h-3" /> WhatsApp Alerts
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Country Selector */}
                  <select
                    id="countryCode"
                    name="countryCode"
                    defaultValue="+389"
                    disabled={isPending}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition-all font-mono max-w-[145px] sm:max-w-[165px]"
                  >
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.dialCode}>
                        {country.flag} {country.dialCode} ({country.code})
                      </option>
                    ))}
                  </select>

                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="70 123 456"
                      disabled={isPending}
                      className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all font-mono ${errors.phone
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        }`}
                    />
                  </div>
                </div>
                {errors.phone ? (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    Used by barbers to send instant WhatsApp appointment confirmations.
                  </p>
                )}
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isPending}
                      className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${errors.password
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isPending}
                      className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${errors.confirmPassword
                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-sm mt-4 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Apex Barbershop. All rights reserved.</p>
      </footer>
    </div>
  );
}
