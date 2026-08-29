import { Award, Clock, ShieldCheck } from "lucide-react";

export default function ValuePillars() {
  return (
    <section className="py-12 bg-zinc-900/50 border-y border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Certified Master Barbers
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Experienced craftsmen dedicated to precision lines, customized fades, and classic cuts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                No Waiting Time
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Select your barber and preferred slot. Your chair is prepped and ready when you arrive.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Complimentary Amenities
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Enjoy fresh espresso, cold refreshments, and hot towel treatments with every service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
