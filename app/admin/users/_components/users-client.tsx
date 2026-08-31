"use client";

import { useState } from "react";
import {
  Search,
  Shield,
  Scissors,
  User,
  Sparkles,
  Users,
  Edit2,
  Phone,
  Mail,
} from "lucide-react";
import { type ProfileItem, type UserRole } from "@/lib/validations/user";
import { RoleModal } from "./role-modal";

interface UsersClientProps {
  initialUsers: ProfileItem[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ProfileItem | null>(null);

  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));

    if (filterRole === "all") return matchesSearch;
    return matchesSearch && user.role === filterRole;
  });

  const handleOpenRoleModal = (user: ProfileItem) => {
    setUserToEdit(user);
    setIsRoleModalOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case "barber":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 uppercase tracking-wider">
            <Scissors className="w-3 h-3" /> Barber
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
            <User className="w-3 h-3" /> Client
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-amber-500" />
            User Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            View registered user profiles and update access permissions & roles.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["all", "client", "barber", "admin"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                filterRole === role
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {role === "all" ? "All Users" : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <h3 className="text-sm font-medium text-white">No users found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery
                ? "Try adjusting your search query or role filter."
                : "No registered users in the database yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">User</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Contact</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Role</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-normal">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-800/30 transition group"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-sm shrink-0">
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <span className="font-medium text-white text-xs sm:text-sm block">
                            {user.full_name}
                          </span>
                          <span className="hidden sm:block text-zinc-400 text-xs mt-0.5 font-light">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="space-y-0.5 text-zinc-300 font-light text-[11px] sm:text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenRoleModal(user)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition cursor-pointer"
                        title="Change Role"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Change Role</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={userToEdit}
      />
    </div>
  );
}
