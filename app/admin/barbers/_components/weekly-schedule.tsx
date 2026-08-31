"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Clock,
  Check,
  Loader2,
  Copy,
  AlertCircle,
  Sparkles,
  Coffee,
} from "lucide-react";
import {
  type DayScheduleInput,
  type BarberScheduleRecord,
} from "@/lib/validations/barber-schedule";
import { saveWeeklySchedule } from "../actions";

interface WeeklyScheduleProps {
  barberId: string;
  barberName: string;
  initialSchedules: BarberScheduleRecord[];
}

const DAYS = [
  { index: 1, label: "Monday", short: "Mon" },
  { index: 2, label: "Tuesday", short: "Tue" },
  { index: 3, label: "Wednesday", short: "Wed" },
  { index: 4, label: "Thursday", short: "Thu" },
  { index: 5, label: "Friday", short: "Fri" },
  { index: 6, label: "Saturday", short: "Sat" },
  { index: 0, label: "Sunday", short: "Sun" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";
const DEFAULT_BREAK_START = "13:00";
const DEFAULT_BREAK_END = "14:00";

export function WeeklySchedule({
  barberId,
  barberName,
  initialSchedules,
}: WeeklyScheduleProps) {
  const [schedules, setSchedules] = useState<DayScheduleInput[]>([]);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Synchronize state when barberId or initialSchedules changes
  useEffect(() => {
    const map = new Map<number, BarberScheduleRecord>();
    initialSchedules.forEach((s) => map.set(s.day_of_week, s));

    const fullWeek: DayScheduleInput[] = DAYS.map((d) => {
      const existing = map.get(d.index);
      if (existing) {
        return {
          day_of_week: d.index,
          is_working: existing.is_working,
          start_time: existing.start_time.slice(0, 5),
          end_time: existing.end_time.slice(0, 5),
          break_start: existing.break_start ? existing.break_start.slice(0, 5) : "",
          break_end: existing.break_end ? existing.break_end.slice(0, 5) : "",
        };
      }
      return {
        day_of_week: d.index,
        is_working: d.index !== 0, // Sunday off by default if no record
        start_time: DEFAULT_START,
        end_time: DEFAULT_END,
        break_start: DEFAULT_BREAK_START,
        break_end: DEFAULT_BREAK_END,
      };
    });

    setSchedules(fullWeek);
    setFeedback(null);
  }, [barberId, initialSchedules]);

  const updateDay = (
    dayIndex: number,
    field: keyof DayScheduleInput,
    value: unknown
  ) => {
    setSchedules((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = schedules.find((d) => d.day_of_week === 1);
    if (!monday) return;

    setSchedules((prev) =>
      prev.map((day) => {
        // Apply Monday hours to Tuesday through Friday
        if ([2, 3, 4, 5].includes(day.day_of_week)) {
          return {
            ...day,
            is_working: monday.is_working,
            start_time: monday.start_time,
            end_time: monday.end_time,
            break_start: monday.break_start,
            break_end: monday.break_end,
          };
        }
        return day;
      })
    );
  };

  const handleSave = () => {
    setFeedback(null);

    // Basic client validation: start must be earlier than end when working
    for (const day of schedules) {
      if (day.is_working) {
        if (day.start_time >= day.end_time) {
          const dayName =
            DAYS.find((d) => d.index === day.day_of_week)?.label || "Day";
          setFeedback({
            type: "error",
            message: `${dayName}: Start time must be earlier than end time.`,
          });
          return;
        }
        if (day.break_start && day.break_end) {
          if (day.break_start >= day.break_end) {
            const dayName =
              DAYS.find((d) => d.index === day.day_of_week)?.label || "Day";
            setFeedback({
              type: "error",
              message: `${dayName}: Break start must be earlier than break end.`,
            });
            return;
          }
        }
      }
    }

    startTransition(async () => {
      const res = await saveWeeklySchedule(barberId, schedules);
      if (res.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({
          type: "success",
          message: `Weekly schedule for ${barberName} saved successfully!`,
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls & Helpers Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMondayToWeekdays}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Mon to Tue-Fri
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
          Save Weekly Schedule
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

      {/* 7-Day Schedule Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden divide-y divide-zinc-800/60">
        {DAYS.map((d) => {
          const dayData = schedules.find((s) => s.day_of_week === d.index) || {
            day_of_week: d.index,
            is_working: false,
            start_time: DEFAULT_START,
            end_time: DEFAULT_END,
            break_start: "",
            break_end: "",
          };

          return (
            <div
              key={d.index}
              className={`p-4 sm:px-6 sm:py-4.5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                dayData.is_working
                  ? "bg-zinc-900/40 hover:bg-zinc-800/30"
                  : "bg-zinc-950/40 opacity-70"
              }`}
            >
              {/* Day Label & Working Toggle */}
              <div className="flex items-center justify-between md:justify-start md:w-52 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(d.index, "is_working", !dayData.is_working)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      dayData.is_working ? "bg-amber-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                        dayData.is_working ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div>
                    <span className="font-medium text-white text-sm block">
                      {d.label}
                    </span>
                    <span
                      className={`text-[11px] font-light ${
                        dayData.is_working ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {dayData.is_working ? "Working" : "Day Off"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Working Hours & Break Hours Inputs */}
              {dayData.is_working ? (
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {/* Shift Hours */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-light">
                      <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                      <span>Shift:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={dayData.start_time}
                        onChange={(e) =>
                          updateDay(d.index, "start_time", e.target.value)
                        }
                        className="rounded-xl bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-zinc-500 text-xs">-</span>
                      <input
                        type="time"
                        value={dayData.end_time}
                        onChange={(e) =>
                          updateDay(d.index, "end_time", e.target.value)
                        }
                        className="rounded-xl bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Break Hours */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-light">
                      <Coffee className="h-3.5 w-3.5 text-sky-400/80" />
                      <span>Break:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={dayData.break_start || ""}
                        onChange={(e) =>
                          updateDay(d.index, "break_start", e.target.value)
                        }
                        placeholder="--:--"
                        className="rounded-xl bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-zinc-500 text-xs">-</span>
                      <input
                        type="time"
                        value={dayData.break_end || ""}
                        onChange={(e) =>
                          updateDay(d.index, "break_end", e.target.value)
                        }
                        placeholder="--:--"
                        className="rounded-xl bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 font-light italic">
                  Not scheduled to work on {d.label}s
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
