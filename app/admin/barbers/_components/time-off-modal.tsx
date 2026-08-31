"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { type TimeOffInput, timeOffSchema } from "@/lib/validations/barber-schedule";
import { addTimeOff } from "../actions";

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  barberId: string;
  barberName: string;
}

export function TimeOffModal({
  isOpen,
  onClose,
  barberId,
  barberName,
}: TimeOffModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<TimeOffInput>({
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = timeOffSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const res = await addTimeOff(barberId, validation.data);
      if (res.error) {
        setServerError(res.error);
      } else {
        setFormData({ start_date: "", end_date: "", reason: "" });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add Time Off / Leave</h2>
              <p className="text-xs text-zinc-400">For {barberName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Start Date <span className="text-amber-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                    // If end_date is empty, sync it
                    end_date: prev.end_date ? prev.end_date : e.target.value,
                  }))
                }
                className={`w-full rounded-xl bg-zinc-950 border px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                  errors.start_date ? "border-red-500" : "border-zinc-800"
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-[11px] text-red-400">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                End Date <span className="text-amber-500">*</span>
              </label>
              <input
                type="date"
                required
                min={formData.start_date}
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
                className={`w-full rounded-xl bg-zinc-950 border px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                  errors.end_date ? "border-red-500" : "border-zinc-800"
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-[11px] text-red-400">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Vacation, Family Leave, Conference"
              value={formData.reason || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Time Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
