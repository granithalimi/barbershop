import Link from "next/link";
import { Calendar } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-16 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready for a Fresh Cut?
        </h2>
        <p className="text-zinc-300 text-base max-w-xl mx-auto">
          Pick your barber, choose your time, and lock in your appointment in under 60 seconds.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 active:scale-95 transition-all text-base"
        >
          <Calendar className="w-5 h-5" />
          Book Your Chair Now
        </Link>
      </div>
    </section>
  );
}
