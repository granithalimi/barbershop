"use client";

import { useEffect, useState } from "react";
import { Star, Check, Sparkles, Loader2 } from "lucide-react";
import { MOCK_BARBERS, type MockBarber } from "@/lib/mock-booking-data";
import { createClient } from "@/lib/supabase/client";

interface StepBarberSelectProps {
  selectedBarber: MockBarber | null;
  onSelectBarber: (barber: MockBarber) => void;
}

export default function StepBarberSelect({
  selectedBarber,
  onSelectBarber,
}: StepBarberSelectProps) {
  const [barbers, setBarbers] = useState<MockBarber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBarbers() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Query active barbers from profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, bio")
          .eq("role", "barber")
          .eq("is_active", true);

        if (profilesError) {
          throw profilesError;
        }

        if (profilesData && profilesData.length > 0) {
          // Fetch barber_services junction to get assigned serviceIds
          const { data: servicesData } = await supabase
            .from("barber_services")
            .select("barber_id, service_id");

          // Fetch reviews to calculate rating & reviewsCount
          const { data: reviewsData } = await supabase
            .from("reviews")
            .select("barber_id, rating");

          const mappedBarbers: MockBarber[] = profilesData.map((p) => {
            const barberReviews = reviewsData?.filter((r) => r.barber_id === p.id) || [];
            const avgRating = barberReviews.length > 0
              ? barberReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / barberReviews.length
              : 5.0;

            const barberServices = servicesData
              ? servicesData.filter((s) => s.barber_id === p.id).map((s) => s.service_id)
              : [];

            const initials = p.full_name
              ? p.full_name
                  .split(" ")
                  .filter(Boolean)
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "B";

            return {
              id: p.id,
              name: p.full_name,
              role: "Master Barber",
              rating: avgRating,
              reviewsCount: barberReviews.length,
              avatarUrl: p.avatar_url || undefined,
              initials: initials || "B",
              bio: p.bio || "Professional barber providing precision haircuts, beard grooming, and styling.",
              serviceIds: barberServices,
            };
          });

          setBarbers(mappedBarbers);
        } else {
          // Fallback to mock barbers if database has no barbers registered yet
          setBarbers(MOCK_BARBERS);
        }
      } catch (err) {
        console.error("Error fetching barbers from Supabase:", err);
        // Graceful fallback to mock barbers on connection/query error
        setBarbers(MOCK_BARBERS);
      } finally {
        setLoading(false);
      }
    }

    fetchBarbers();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="text-center sm:text-left mb-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          Choose Your Barber
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Select a master barber to view their available services and custom schedule.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-3 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <p className="text-xs sm:text-sm">Loading barbers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
          {barbers.map((barber) => {
            const isSelected = selectedBarber?.id === barber.id;

            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => onSelectBarber(barber)}
                className={`w-full text-left relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 active:scale-[0.99] cursor-pointer  ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10"
                    : "bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 shadow-md"
                }`}
              >
                {/* Avatar / Initials */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 transition-transform ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20 scale-105"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}
                >
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    barber.initials
                  )}
                </div>

                {/* Barber Details */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                      {barber.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {barber.rating.toFixed(1)} ({barber.reviewsCount})
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-amber-500/90 mt-0.5">
                    {barber.role}
                  </p>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {barber.bio}
                  </p>
                </div>

                {/* Selection Checkmark */}
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 shadow-sm"
                      : "border border-zinc-700 bg-zinc-950/40 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
