"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { type ServiceItem, type ServiceInput, serviceSchema } from "@/lib/validations/service";
import { createService, updateService } from "@/features/admin/services/actions";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: ServiceItem | null;
}

export function ServiceModal({ isOpen, onClose, serviceToEdit }: ServiceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ServiceInput>({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 20,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name,
        description: serviceToEdit.description || "",
        duration_minutes: serviceToEdit.duration_minutes,
        price: Number(serviceToEdit.price),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        duration_minutes: 30,
        price: 20,
      });
    }
    setErrors({});
    setServerError(null);
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = serviceSchema.safeParse(formData);
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
      let res;
      if (serviceToEdit) {
        res = await updateService(serviceToEdit.id, validation.data);
      } else {
        res = await createService(validation.data);
      }

      if (res.error) {
        setServerError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {serviceToEdit ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="text-xs text-neutral-400">
                {serviceToEdit
                  ? "Update service information and pricing"
                  : "Create a new offering for your barbershop"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
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
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Service Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Skin Fade & Beard Trim"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full rounded-xl bg-neutral-950 border px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                errors.name ? "border-red-500" : "border-neutral-800"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a detailed description of what's included..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className={`w-full rounded-xl bg-neutral-950 border px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 resize-none ${
                errors.description ? "border-red-500" : "border-neutral-800"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Duration (minutes) <span className="text-amber-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: Number(e.target.value),
                  }))
                }
                className={`w-full rounded-xl bg-neutral-950 border px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                  errors.duration_minutes ? "border-red-500" : "border-neutral-800"
                }`}
              />
              {errors.duration_minutes && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.duration_minutes}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Price (€ EUR) <span className="text-amber-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className={`w-full rounded-xl bg-neutral-950 border px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                  errors.price ? "border-red-500" : "border-neutral-800"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-neutral-800 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {serviceToEdit ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
