"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2, Shield, Scissors, User } from "lucide-react";
import { type ProfileItem, type UserRole } from "@/lib/validations/user";
import { updateUserRole } from "../actions";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileItem | null;
}

const ROLES: {
  key: UserRole;
  label: string;
  description: string;
  icon: typeof Shield;
  colorClass: string;
  badgeClass: string;
}[] = [
  {
    key: "client",
    label: "Client",
    description: "Standard customer who can book appointments and view history.",
    icon: User,
    colorClass: "text-neutral-300",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
  {
    key: "barber",
    label: "Barber",
    description: "Staff member who can manage appointments, shifts, and schedules.",
    icon: Scissors,
    colorClass: "text-sky-400",
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Full system access to manage users, services, barbers, and settings.",
    icon: Shield,
    colorClass: "text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
];

export function RoleModal({ isOpen, onClose, user }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setServerError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (selectedRole === user.role) {
      onClose();
      return;
    }

    startTransition(async () => {
      const res = await updateUserRole(user.id, selectedRole);
      if (res.error) {
        setServerError(res.error);
      } else {
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
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Change User Role</h2>
              <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                {user.full_name} ({user.email})
              </p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {ROLES.map((roleOption) => {
            const Icon = roleOption.icon;
            const isSelected = selectedRole === roleOption.key;

            return (
              <label
                key={roleOption.key}
                onClick={() => setSelectedRole(roleOption.key)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {roleOption.label}
                    </span>
                    <input
                      type="radio"
                      name="role"
                      checked={isSelected}
                      onChange={() => setSelectedRole(roleOption.key)}
                      className="text-amber-500 focus:ring-amber-500/30 accent-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-light leading-relaxed">
                    {roleOption.description}
                  </p>
                </div>
              </label>
            );
          })}

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
              Update Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
