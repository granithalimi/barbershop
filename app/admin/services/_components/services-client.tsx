"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  Scissors,
  Sparkles,
} from "lucide-react";
import { type ServiceItem } from "@/lib/validations/service";
import { ServiceModal } from "./service-modal";
import { DeleteModal } from "./delete-modal";

interface ServicesClientProps {
  initialServices: ServiceItem[];
}

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const filteredServices = initialServices.filter((service) => {
    return (
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenCreate = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (service: ServiceItem) => {
    setServiceToDelete(service);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Scissors className="h-6 w-6 text-amber-500" />
            Services Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure haircuts, treatments, pricing, and durations for client bookings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add New Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80 shadow-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Services Table Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <h3 className="text-sm font-medium text-white">No services found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery
                ? "Try adjusting your search criteria."
                : "Get started by adding your first barbershop service."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Service</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Duration</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Price</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-normal">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-zinc-800/30 transition group"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <span className="font-medium text-white text-xs sm:text-sm">
                          {service.name}
                        </span>
                        {service.description && (
                          <p className="hidden sm:block text-zinc-400 text-xs mt-0.5 font-light line-clamp-1 max-w-md">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-zinc-950 border border-zinc-800 px-2 sm:px-2.5 py-1 text-zinc-300 text-[11px] sm:text-xs font-light">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500/80" />
                        <span>{service.duration_minutes}m</span>
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-normal text-white text-xs sm:text-sm whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <span>€{Number(service.price).toFixed(2)}</span>
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="rounded-lg p-1 sm:p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(service)}
                          className="rounded-lg p-1 sm:p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={serviceToEdit}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        service={serviceToDelete}
      />
    </div>
  );
}
