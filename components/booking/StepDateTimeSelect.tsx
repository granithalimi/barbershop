"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from "lucide-react";
import { getMockSlotsForDate, type TimeSlot } from "@/lib/mock-booking-data";

interface StepDateTimeSelectProps {
  selectedDate: string; // "YYYY-MM-DD"
  selectedTime: string; // "HH:MM"
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

export default function StepDateTimeSelect({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: StepDateTimeSelectProps) {
  // Generate next 14 days starting from today
  const availableDates = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" }); // "Mon"
      const dayNum = d.getDate(); // 31
      const monthName = d.toLocaleDateString("en-US", { month: "short" }); // "Aug"
      const isoString = d.toISOString().split("T")[0]; // "2026-08-31"

      days.push({
        isoString,
        dayName,
        dayNum,
        monthName,
        isToday: i === 0,
        isSunday: d.getDay() === 0,
      });
    }
    return days;
  }, []);

  // Compute available slots for currently selected date
  const slots: TimeSlot[] = useMemo(() => {
    return getMockSlotsForDate(selectedDate);
  }, [selectedDate]);

  const morningSlots = slots.filter((s) => s.period === "morning");
  const afternoonSlots = slots.filter((s) => s.period === "afternoon");
  const eveningSlots = slots.filter((s) => s.period === "evening");

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

      {/* 1. Mobile-First Horizontal Date Strip */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            Select Day
          </label>
          <span className="text-xs font-semibold text-amber-400">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Scrollable Date Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {availableDates.map((day) => {
            const isSelected = selectedDate === day.isoString;

            return (
              <button
                key={day.isoString}
                type="button"
                onClick={() => onSelectDate(day.isoString)}
                className={`flex flex-col items-center justify-center min-w-[62px] sm:min-w-[70px] py-3 px-2 rounded-2xl border transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.03]"
                    : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isSelected ? "text-zinc-950" : "text-zinc-500"
                  }`}
                >
                  {day.isToday ? "Today" : day.dayName}
                </span>
                <span
                  className={`text-base sm:text-lg font-black mt-0.5 ${
                    isSelected ? "text-zinc-950" : "text-zinc-100"
                  }`}
                >
                  {day.dayNum}
                </span>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-zinc-900 font-semibold" : "text-zinc-500"
                  }`}
                >
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grouped Time Slot Chips */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Available Start Times
        </label>

        {/* Morning */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Morning (09:00 - 12:00)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {morningSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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

        {/* Afternoon */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Sunset className="w-3.5 h-3.5 text-amber-500" />
            <span>Afternoon (12:00 - 17:00)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {afternoonSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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

        {/* Evening */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Moon className="w-3.5 h-3.5 text-sky-400" />
            <span>Evening (17:00 - 20:00)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {eveningSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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
      </div>
    </div>
  );
}
