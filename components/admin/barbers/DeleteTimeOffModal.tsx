"use client";

import { useTransition, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { type BarberTimeOffRecord } from "@/lib/validations/barber-schedule";
import { deleteTimeOff } from "@/features/admin/barbers/actions";

interface DeleteTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeOff: BarberTimeOffRecord | null;
}

export function DeleteTimeOffModal({
  isOpen,
  onClose,
  timeOff,
}: DeleteTimeOffModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !timeOff) return null;

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteTimeOff(timeOff.id);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-semibold text-white">
            Remove Time Off Entry?
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
            Are you sure you want to remove this time off record from{" "}
            <span className="font-semibold text-white">
              {new Date(timeOff.start_date).toLocaleDateString()}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {new Date(timeOff.end_date).toLocaleDateString()}
            </span>
            ? The barber will become available for booking during these dates.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Remove Time Off
          </button>
        </div>
      </div>
    </div>
  );
}
