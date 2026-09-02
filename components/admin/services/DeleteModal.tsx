"use client";

import { useTransition, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { type ServiceItem } from "@/lib/validations/service";
import { deleteService } from "@/features/admin/services/actions";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

export function DeleteModal({ isOpen, onClose, service }: DeleteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-semibold text-white">
            Delete Service Permanently?
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-white">"{service.name}"</span>?
            This will permanently remove it from the database.
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
            className="rounded-xl border border-neutral-800 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Service
          </button>
        </div>
      </div>
    </div>
  );
}
