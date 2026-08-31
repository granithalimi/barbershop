"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  Trash2,
  Sparkles,
  Palmtree,
  Clock,
} from "lucide-react";
import { type BarberTimeOffRecord } from "@/lib/validations/barber-schedule";
import { TimeOffModal } from "./time-off-modal";
import { DeleteTimeOffModal } from "./delete-time-off-modal";

interface TimeOffSectionProps {
  barberId: string;
  barberName: string;
  timeOffList: BarberTimeOffRecord[];
}

export function TimeOffSection({
  barberId,
  barberName,
  timeOffList,
}: TimeOffSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [timeOffToDelete, setTimeOffToDelete] = useState<BarberTimeOffRecord | null>(null);

  const sortedList = [...timeOffList].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Upcoming Vacations & Time Off
          </h3>
          <p className="text-xs text-zinc-400 font-light">
            Block booking slots during holidays or scheduled leave for {barberName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add Time Off
        </button>
      </div>

      {/* Time Off Cards / Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
        {sortedList.length === 0 ? (
          <div className="py-16 text-center">
            <Palmtree className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <h3 className="text-sm font-medium text-white">No time off scheduled</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {barberName} has no upcoming vacation or leave dates recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Dates</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Duration</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Reason / Notes</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-normal">
                {sortedList.map((entry) => {
                  const start = new Date(entry.start_date);
                  const end = new Date(entry.end_date);
                  const diffDays =
                    Math.round(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                    ) + 1;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="font-medium text-white text-xs sm:text-sm">
                            {start.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            –{" "}
                            {end.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {diffDays} {diffDays === 1 ? "day" : "days"}
                        </span>
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-zinc-300 text-xs font-light">
                          {entry.reason || "Vacation / Personal Leave"}
                        </span>
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setTimeOffToDelete(entry)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
                          title="Remove Time Off"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TimeOffModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        barberId={barberId}
        barberName={barberName}
      />

      <DeleteTimeOffModal
        isOpen={!!timeOffToDelete}
        onClose={() => setTimeOffToDelete(null)}
        timeOff={timeOffToDelete}
      />
    </div>
  );
}
