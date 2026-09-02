"use client";

import { useState } from "react";
import {
  Scissors,
  Clock,
  Palmtree,
} from "lucide-react";
import {
  type BarberProfile,
  type BarberScheduleRecord,
  type BarberTimeOffRecord,
} from "@/lib/validations/barber-schedule";
import { WeeklySchedule } from "./WeeklySchedule";
import { BarberServicesSection } from "./BarberServicesSection";
import { TimeOffSection } from "./TimeOffSection";

interface BarbersClientProps {
  barbers: BarberProfile[];
  allSchedules: BarberScheduleRecord[];
  allTimeOff: BarberTimeOffRecord[];
}

export function BarbersClient({
  barbers,
  allSchedules,
  allTimeOff,
}: BarbersClientProps) {
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    barbers[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState<"schedule" | "time-off" | "services">("schedule");

  const currentBarber =
    barbers.find((b) => b.id === selectedBarberId) || barbers[0];

  const currentSchedules = allSchedules.filter(
    (s) => s.barber_id === selectedBarberId
  );

  const currentTimeOff = allTimeOff.filter(
    (t) => t.barber_id === selectedBarberId
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || "B";
  };

  if (barbers.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8">
        <Scissors className="mx-auto h-10 w-10 text-amber-500/60 mb-3" />
        <h2 className="text-lg font-bold text-white">No Barbers Found</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          No team members currently have the Barber role. Assign the Barber role to
          a user in the User Management section first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Scissors className="h-6 w-6 text-amber-500" />
          Barber Shifts & Schedule Management
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure weekly availability, break times, and approved vacations for your barbers.
        </p>
      </div>

      {/* Barber Selector Bar */}
      <div className="bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80 shadow-lg">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
          Select Barber
        </p>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {barbers.map((barber) => {
            const isSelected = barber.id === currentBarber?.id;
            return (
              <button
                key={barber.id}
                onClick={() => setSelectedBarberId(barber.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-amber-500/10 border border-amber-500/40 text-white shadow-sm"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {getInitials(barber.full_name)}
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold block leading-tight">
                    {barber.full_name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-light block">
                    {barber.phone || barber.email}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Barber Header & Navigation Tabs */}
      {currentBarber && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 shrink-0">
              {getInitials(currentBarber.full_name)}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {currentBarber.full_name}
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                {currentBarber.email} • {currentBarber.phone || "No phone"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-fit">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Weekly Schedule
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "services"
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Services
            </button>
            <button
              onClick={() => setActiveTab("time-off")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "time-off"
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Palmtree className="h-3.5 w-3.5" />
              Vacations & Time Off ({currentTimeOff.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Tab View */}
      {currentBarber && (
        <>
          {activeTab === "schedule" && (
            <WeeklySchedule
              barberId={currentBarber.id}
              barberName={currentBarber.full_name}
              initialSchedules={currentSchedules}
            />
          )}

          {activeTab === "services" && (
            <BarberServicesSection
              barberId={currentBarber.id}
              barberName={currentBarber.full_name}
            />
          )}

          {activeTab === "time-off" && (
            <TimeOffSection
              barberId={currentBarber.id}
              barberName={currentBarber.full_name}
              timeOffList={currentTimeOff}
            />
          )}
        </>
      )}
    </div>
  );
}
