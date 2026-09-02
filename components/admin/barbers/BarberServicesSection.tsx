"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Scissors,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

interface BarberServicesSectionProps {
  barberId: string;
  barberName: string;
}

export function BarberServicesSection({
  barberId,
  barberName,
}: BarberServicesSectionProps) {
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [assignedServiceIds, setAssignedServiceIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 1. Fetch catalog services and existing barber_services for the selected barber
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setFeedback(null);
        const supabase = createClient();

        // Fetch all available services
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("id, name, description, duration_minutes, price")
          .order("name", { ascending: true });

        if (servicesError) throw servicesError;

        // Fetch services assigned to this specific barber
        const { data: barberServicesData, error: barberServicesError } =
          await supabase
            .from("barber_services")
            .select("service_id")
            .eq("barber_id", barberId);

        if (barberServicesError) throw barberServicesError;

        setAllServices(servicesData || []);
        setAssignedServiceIds(
          new Set((barberServicesData || []).map((item) => item.service_id)),
        );
      } catch (err: unknown) {
        console.error("Error loading services:", err);
        const message =
          err instanceof Error ? err.message : "Failed to load services.";
        setFeedback({ type: "error", message });
      } finally {
        setLoading(false);
      }
    }

    if (barberId) {
      loadData();
    }
  }, [barberId]);

  // 2. Toggle service assignment in local state
  const toggleService = (serviceId: string) => {
    setAssignedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  // 3. Select All / Deselect All helpers
  const handleSelectAll = () => {
    setAssignedServiceIds(new Set(allServices.map((s) => s.id)));
  };

  const handleDeselectAll = () => {
    setAssignedServiceIds(new Set());
  };

  // 4. Save assigned services into public.barber_services
  const handleSave = () => {
    setFeedback(null);

    startTransition(async () => {
      try {
        const supabase = createClient();

        // Remove old associations for this barber
        const { error: deleteError } = await supabase
          .from("barber_services")
          .delete()
          .eq("barber_id", barberId);

        if (deleteError) throw deleteError;

        // Insert selected services
        const selectedIds = Array.from(assignedServiceIds);
        if (selectedIds.length > 0) {
          const payload = selectedIds.map((serviceId) => ({
            barber_id: barberId,
            service_id: serviceId,
          }));

          const { error: insertError } = await supabase
            .from("barber_services")
            .insert(payload);

          if (insertError) throw insertError;
        }

        setFeedback({
          type: "success",
          message: `Assigned ${selectedIds.length} service(s) to ${barberName} successfully!`,
        });
      } catch (err: unknown) {
        console.error("Error saving barber services:", err);
        const message =
          err instanceof Error ? err.message : "Failed to save services.";
        setFeedback({ type: "error", message });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400 gap-2 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
        <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
        <span className="text-xs">Loading services catalog...</span>
      </div>
    );
  }

  if (allServices.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <Scissors className="mx-auto h-8 w-8 text-amber-500/60 mb-2" />
        <h3 className="text-sm font-bold text-white">No Services Found</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Create services in the Service Catalog first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls & Helpers Bar (Same as weekly-schedule) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Select All
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-white transition cursor-pointer"
          >
            Deselect All
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 stroke-[2.5]" />
          )}
          Save Barber Services ({assignedServiceIds.size})
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Services List Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden divide-y divide-zinc-800/60">
        {allServices.map((service) => {
          const isAssigned = assignedServiceIds.has(service.id);

          return (
            <div
              key={service.id}
              className={`p-4 sm:px-6 sm:py-4.5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isAssigned
                  ? "bg-zinc-900/40 hover:bg-zinc-800/30"
                  : "bg-zinc-950/40 opacity-70"
              }`}
            >
              {/* Service Details & Toggle */}
              <div className="flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAssigned ? "bg-amber-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isAssigned ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div>
                    <span className="font-medium text-white text-sm block">
                      {service.name}
                    </span>
                    <span
                      className={`text-[11px] font-light ${
                        isAssigned ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {isAssigned ? "Offered by Barber" : "Not Offered"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Meta (Duration & Price) */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-zinc-400 font-light bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-semibold bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <span>€{Number(service.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
