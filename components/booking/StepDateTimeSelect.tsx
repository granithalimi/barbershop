"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Calendar as CalendarIcon, Clock, Sun, Sunset, Moon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { type MockBarber, type MockService, type TimeSlot } from "@/lib/mock-booking-data";
import { createClient } from "@/lib/supabase/client";

interface StepDateTimeSelectProps {
  barber?: MockBarber | null;
  service?: MockService | null;
  selectedDate: string; // "YYYY-MM-DD"
  selectedTime: string; // "HH:MM"
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

export interface BarberScheduleRecord {
  id?: string;
  barber_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday... 6=Saturday
  start_time: string; // "HH:MM:SS" or "HH:MM"
  end_time: string;
  break_start?: string | null;
  break_end?: string | null;
  is_working: boolean;
}

export interface BarberTimeOffRecord {
  id?: string;
  barber_id: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  reason?: string | null;
}

export default function StepDateTimeSelect({
  barber,
  service,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: StepDateTimeSelectProps) {
  const [schedules, setSchedules] = useState<BarberScheduleRecord[]>([]);
  const [timeOff, setTimeOff] = useState<BarberTimeOffRecord[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);

  // 1. Fetch barber weekly schedules and time-off records
  useEffect(() => {
    async function fetchBarberScheduleData() {
      if (!barber?.id) {
        setLoadingSchedule(false);
        return;
      }

      try {
        setLoadingSchedule(true);
        const supabase = createClient();

        // Query barber's weekly working schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("barber_schedules")
          .select("*")
          .eq("barber_id", barber.id);

        if (scheduleError) {
          console.warn("Could not fetch barber_schedules:", scheduleError.message);
        } else if (scheduleData) {
          setSchedules(scheduleData);
        }

        // Query barber's active & upcoming time-off / leave
        const todayIso = new Date().toISOString().split("T")[0];
        const { data: timeOffData, error: timeOffError } = await supabase
          .from("barber_time_off")
          .select("*")
          .eq("barber_id", barber.id)
          .gte("end_date", todayIso);

        if (timeOffError) {
          console.warn("Could not fetch barber_time_off:", timeOffError.message);
        } else if (timeOffData) {
          setTimeOff(timeOffData);
        }
      } catch (err) {
        console.error("Error fetching barber schedule data:", err);
      } finally {
        setLoadingSchedule(false);
      }
    }

    fetchBarberScheduleData();
  }, [barber?.id]);

  // 2. Generate next 14 days starting from today, checking schedule & time-off status
  const availableDates = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const isoString = d.toISOString().split("T")[0];

      // Check if barber works on this day of the week (strict matching)
      let isWorkingDay = false;
      if (schedules.length > 0) {
        const scheduleForDay = schedules.find((s) => s.day_of_week === dayOfWeek);
        // Only working if explicitly configured in barber_schedules with is_working = true
        isWorkingDay = Boolean(scheduleForDay && scheduleForDay.is_working);
      } else {
        // Fallback default only when no schedule records exist at all in database: Sunday is off
        isWorkingDay = dayOfWeek !== 0;
      }

      // Check if this date falls within a barber's vacation / time-off period
      const isOnTimeOff = timeOff.some(
        (to) => isoString >= to.start_date && isoString <= to.end_date
      );

      const isAvailable = isWorkingDay && !isOnTimeOff;

      days.push({
        isoString,
        dayName,
        dayNum,
        monthName,
        isToday: i === 0,
        dayOfWeek,
        isAvailable,
        isOnTimeOff,
      });
    }
    return days;
  }, [schedules, timeOff]);

  // If the currently selected date is not available for this barber, auto-select the first available date
  useEffect(() => {
    if (availableDates.length > 0) {
      const currentDay = availableDates.find((d) => d.isoString === selectedDate);
      if (!currentDay || !currentDay.isAvailable) {
        const firstAvailable = availableDates.find((d) => d.isAvailable);
        if (firstAvailable) {
          onSelectDate(firstAvailable.isoString);
        }
      }
    }
  }, [availableDates, selectedDate, onSelectDate]);

  // 3. Fetch existing appointments for the selected barber on the selected date to prevent overlapping
  const [appointments, setAppointments] = useState<{ start_time: string; end_time: string }[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAppointments() {
      if (!barber?.id || !selectedDate) {
        setAppointments([]);
        return;
      }

      try {
        setLoadingAppointments(true);
        const supabase = createClient();

        // Fetch non-cancelled / non-declined appointments
        const { data, error } = await supabase
          .from("appointments")
          .select("start_time, end_time, status")
          .eq("barber_id", barber.id)
          .eq("appointment_date", selectedDate)
          .in("status", ["pending", "confirmed"]);

        if (error) {
          console.warn("Could not fetch appointments:", error.message);
        } else if (data) {
          setAppointments(data);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    }

    fetchAppointments();
  }, [barber?.id, selectedDate]);

  // Helper functions for time conversion
  const parseTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    return hours * 60 + mins;
  };

  const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // 4. Compute 15-minute dynamic slots for currently selected date
  const slots: TimeSlot[] = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDayObj = new Date(selectedDate);
    const dayOfWeek = selectedDayObj.getDay();

    // Check if on time off
    const isOnTimeOff = timeOff.some(
      (to) => selectedDate >= to.start_date && selectedDate <= to.end_date
    );
    if (isOnTimeOff) return [];

    // Find schedule for this day
    const scheduleForDay = schedules.find((s) => s.day_of_week === dayOfWeek);

    // If schedules are configured in DB and no active schedule exists for today, return empty
    if (schedules.length > 0 && (!scheduleForDay || !scheduleForDay.is_working)) {
      return [];
    }

    // Default fallback shift if no schedules exist at all in DB
    const startStr = scheduleForDay ? scheduleForDay.start_time : "09:00:00";
    const endStr = scheduleForDay ? scheduleForDay.end_time : "19:00:00";
    const breakStartStr = scheduleForDay?.break_start;
    const breakEndStr = scheduleForDay?.break_end;

    const startMin = parseTimeToMinutes(startStr);
    const endMin = parseTimeToMinutes(endStr);
    const breakStartMin = breakStartStr ? parseTimeToMinutes(breakStartStr) : null;
    const breakEndMin = breakEndStr ? parseTimeToMinutes(breakEndStr) : null;

    const serviceDuration = service?.durationMinutes || 30;
    const stepInterval = 15; // 15-minute intervals

    const generatedSlots: TimeSlot[] = [];

    // Check if selectedDate is today to disable past times
    const now = new Date();
    const todayIso = now.toISOString().split("T")[0];
    const isToday = selectedDate === todayIso;
    const currentMinToday = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer

    for (let currentSlotStart = startMin; currentSlotStart + serviceDuration <= endMin; currentSlotStart += stepInterval) {
      const currentSlotEnd = currentSlotStart + serviceDuration;
      const timeString = formatMinutesToTime(currentSlotStart);

      // Check if slot starts in the past (for today)
      let available = true;
      if (isToday && currentSlotStart < currentMinToday) {
        available = false;
      }

      // Check break overlap: max(start1, start2) < min(end1, end2)
      if (available && breakStartMin !== null && breakEndMin !== null) {
        const hasBreakOverlap =
          Math.max(currentSlotStart, breakStartMin) < Math.min(currentSlotEnd, breakEndMin);
        if (hasBreakOverlap) {
          available = false;
        }
      }

      // Check existing appointments overlap
      if (available && appointments.length > 0) {
        for (const appt of appointments) {
          const apptStartMin = parseTimeToMinutes(appt.start_time);
          const apptEndMin = parseTimeToMinutes(appt.end_time);

          const hasAppointmentOverlap =
            Math.max(currentSlotStart, apptStartMin) < Math.min(currentSlotEnd, apptEndMin);

          if (hasAppointmentOverlap) {
            available = false;
            break;
          }
        }
      }

      let period: "morning" | "afternoon" | "evening" = "morning";
      if (currentSlotStart < 12 * 60) {
        period = "morning";
      } else if (currentSlotStart < 17 * 60) {
        period = "afternoon";
      } else {
        period = "evening";
      }

      generatedSlots.push({
        time: timeString,
        available,
        period,
      });
    }

    return generatedSlots;
  }, [selectedDate, schedules, timeOff, service?.durationMinutes, appointments]);

  // If currently selected time is unavailable or invalid in new slot list, auto-select first available slot
  useEffect(() => {
    if (slots.length > 0) {
      const currentSelectedSlot = slots.find((s) => s.time === selectedTime);
      if (!currentSelectedSlot || !currentSelectedSlot.available) {
        const firstAvailableSlot = slots.find((s) => s.available);
        if (firstAvailableSlot) {
          onSelectTime(firstAvailableSlot.time);
        }
      }
    }
  }, [slots, selectedTime, onSelectTime]);

  const morningSlots = slots.filter((s) => s.period === "morning");
  const afternoonSlots = slots.filter((s) => s.period === "afternoon");
  const eveningSlots = slots.filter((s) => s.period === "evening");

  const dateScrollRef = useRef<HTMLDivElement>(null);

  const scrollDates = (direction: "left" | "right") => {
    if (dateScrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          Select Date & Time
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Pick a convenient day and conflict-free start time.
        </p>
      </div>

      {/* 1. Mobile & Desktop Responsive Horizontal Date Strip */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            Select Day
          </label>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => scrollDates("left")}
                aria-label="Previous dates"
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollDates("right")}
                aria-label="Next dates"
                className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs font-semibold text-amber-400">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Scrollable Date Chips */}
        {loadingSchedule ? (
          <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-xs">Checking barber schedule...</span>
          </div>
        ) : (
          <div
            ref={dateScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/60 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91_/_0.6)_transparent]"
          >
            {availableDates.map((day) => {
              const isSelected = selectedDate === day.isoString;
              const isAvailable = day.isAvailable;

              return (
                <button
                  key={day.isoString}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectDate(day.isoString)}
                  className={`flex flex-col items-center justify-center min-w-[62px] sm:min-w-[70px] py-3 px-2 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.03]"
                      : isAvailable
                      ? "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white active:scale-95"
                      : "bg-zinc-950/40 text-zinc-600 border-zinc-900 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      isSelected ? "text-zinc-950" : isAvailable ? "text-zinc-500" : "text-zinc-700"
                    }`}
                  >
                    {day.isToday ? "Today" : day.dayName}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-black mt-0.5 ${
                      isSelected ? "text-zinc-950" : isAvailable ? "text-zinc-100" : "text-zinc-600"
                    }`}
                  >
                    {day.dayNum}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-zinc-900 font-semibold" : isAvailable ? "text-zinc-500" : "text-zinc-700"
                    }`}
                  >
                    {day.isOnTimeOff ? "Off" : day.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Grouped Time Slot Chips */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Available Start Times
        </label>

        {loadingAppointments ? (
          <div className="flex items-center justify-center py-8 text-zinc-400 gap-2 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-xs">Checking availability...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400 space-y-1 bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
            <p className="text-xs sm:text-sm font-medium text-zinc-300">No available time slots on this date</p>
            <p className="text-[11px] text-zinc-500">Please choose another date or barber.</p>
          </div>
        ) : (
          <>
            {/* Morning */}
            {morningSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Morning (09:00 - 12:00)</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => onSelectTime(slot.time)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]"
                            : slot.available
                            ? "bg-zinc-900/80 text-zinc-200 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
                            : "bg-zinc-950/40 text-zinc-600 border-zinc-900 line-through opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {afternoonSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Sunset className="w-3.5 h-3.5 text-amber-500" />
                  <span>Afternoon (12:00 - 17:00)</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => onSelectTime(slot.time)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]"
                            : slot.available
                            ? "bg-zinc-900/80 text-zinc-200 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
                            : "bg-zinc-950/40 text-zinc-600 border-zinc-900 line-through opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evening */}
            {eveningSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Evening (17:00+)</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {eveningSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => onSelectTime(slot.time)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]"
                            : slot.available
                            ? "bg-zinc-900/80 text-zinc-200 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
                            : "bg-zinc-950/40 text-zinc-600 border-zinc-900 line-through opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
