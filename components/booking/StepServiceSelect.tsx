"use client";

import { Clock, Check, Sparkles } from "lucide-react";
import { MOCK_SERVICES, type MockBarber, type MockService } from "@/lib/mock-booking-data";

interface StepServiceSelectProps {
  barber: MockBarber;
  selectedService: MockService | null;
  onSelectService: (service: MockService) => void;
}

export default function StepServiceSelect({
  barber,
  selectedService,
  onSelectService,
}: StepServiceSelectProps) {
  // Filter services assigned to this specific barber
  const barberServices = MOCK_SERVICES.filter((srv) =>
    barber.serviceIds.includes(srv.id)
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="text-center sm:text-left mb-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          Select a Service
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Showing services provided by <span className="text-amber-400 font-semibold">{barber.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
        {barberServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service)}
              className={`w-full text-left relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 active:scale-[0.99] ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10"
                  : "bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {service.name}
                    </h3>
                    {service.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Sparkles className="w-2.5 h-2.5" /> Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {service.durationMinutes} min
                    </span>
                  </div>
                </div>

                {/* Price & Selection Check */}
                <div className="text-right flex flex-col items-end justify-between self-stretch shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 shadow-sm"
                        : "border border-zinc-700 bg-zinc-950/40 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div className="mt-4">
                    <span className="text-lg sm:text-xl font-black text-amber-400">
                      €{service.priceEur}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
