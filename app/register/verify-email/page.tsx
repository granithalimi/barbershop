"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Scissors, Mail, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";

  return (
    <div className="w-full max-w-md">
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
          Check Your Email
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          We've sent a confirmation link to activate your account.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center space-y-6">
        {/* Animated Mail Icon */}
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Mail className="w-8 h-8 animate-pulse" />
        </div>

        {/* Email target & explanation */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Verification link sent to
          </p>
          <p className="text-sm font-semibold text-amber-400 bg-zinc-950/80 py-2 px-3.5 rounded-xl border border-zinc-800/80 inline-block max-w-full truncate font-mono">
            {email}
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1 max-w-xs mx-auto">
            Please click the link inside your email to verify your address and complete your registration.
          </p>
        </div>

        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            After verifying, you will be able to sign in, view upcoming cuts, and manage your appointments.
          </p>
        </div>

        {/* Action Button: Back to Sign In (No Resend Button) */}
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-xs"
          >
            Back to Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Back Link */}
      <header className="relative z-10 p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Apex Barbershop
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center text-xs text-zinc-500">
              Loading verification details...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Apex Barbershop. All rights reserved.</p>
      </footer>
    </div>
  );
}
