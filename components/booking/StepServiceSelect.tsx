"use client";

import { useEffect, useState } from "react";
import { Clock, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { MOCK_SERVICES, type MockBarber, type MockService } from "@/lib/mock-booking-data";
import { createClient } from "@/lib/supabase/client";

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
  const [services, setServices] = useState<MockService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBarberServices() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. First, try to fetch services mapped in the barber_services junction table
        const { data: junctionData, error: junctionError } = await supabase
          .from("barber_services")
          .select("service_id")
          .eq("barber_id", barber.id);

        let serviceIds: string[] = [];
        if (!junctionError && junctionData && junctionData.length > 0) {
          serviceIds = junctionData.map((item) => item.service_id);
        } else if (barber.serviceIds && barber.serviceIds.length > 0) {
          // If junction query returns nothing, use barber.serviceIds if available
          serviceIds = barber.serviceIds;
        }

        let query = supabase
          .from("services")
          .select("id, name, description, duration_minutes, price, is_active")
          .eq("is_active", true);

        // If specific service IDs were resolved for this barber, filter by them
        if (serviceIds.length > 0) {
          query = query.in("id", serviceIds);
        }

        const { data: servicesData, error: servicesError } = await query;

        if (servicesError) {
          throw servicesError;
        }

        if (servicesData && servicesData.length > 0) {
          const mappedServices: MockService[] = servicesData.map((s, index) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            durationMinutes: s.duration_minutes,
            priceEur: Number(s.price),
            popular: index === 0 || index === 2,
          }));

          setServices(mappedServices);
        } else {
          // If no services found in database for this barber, fallback to mock filtered services
          const fallback = MOCK_SERVICES.filter(
            (srv) => !barber.serviceIds?.length || barber.serviceIds.includes(srv.id)
          );
          setServices(fallback.length > 0 ? fallback : MOCK_SERVICES);
        }
      } catch (err) {
        console.error("Error fetching services from Supabase:", err);
        // Fallback to mock data on error
        const fallback = MOCK_SERVICES.filter(
          (srv) => !barber.serviceIds?.length || barber.serviceIds.includes(srv.id)
        );
        setServices(fallback.length > 0 ? fallback : MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    }

    if (barber?.id) {
      fetchBarberServices();
    }
  }, [barber]);

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-3 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <p className="text-xs sm:text-sm">Loading services for {barber.name}...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <p className="text-sm font-medium text-zinc-300">No services available</p>
          <p className="text-xs text-zinc-500">There are no services configured for this barber yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service)}
                className={`w-full text-left relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 active:scale-[0.99] cursor-pointer ${
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
      )}
    </div>
  );
}
