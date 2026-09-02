"use client";

import { useState } from "react";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  MessageCircle,
  Loader2,
  ExternalLink,
  Check,
  X,
  PhoneCall,
} from "lucide-react";
import { updateAppointmentStatus, type AppointmentStatus } from "../actions";

export interface BarberAppointmentItem {
  id: string;
  barber_id: string;
  service_id: string;
  client_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_method: "cash";
  total_price: number;
  notes: string | null;
  created_at: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  } | null;
  service?: {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
  } | null;
}

interface BarberAppointmentsClientProps {
  initialAppointments: BarberAppointmentItem[];
}

interface WhatsAppNotification {
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  whatsappUrl: string;
  status: AppointmentStatus;
}

export function BarberAppointmentsClient({
  initialAppointments,
}: BarberAppointmentsClientProps) {
  const [appointments, setAppointments] =
    useState<BarberAppointmentItem[]>(initialAppointments);
  const [filterStatus, setFilterStatus] = useState<"all" | AppointmentStatus>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] =
    useState<WhatsAppNotification | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  const countByStatus = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    declined: appointments.filter((a) => a.status === "declined").length,
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[^\d+]/g, "").replace(/^00/, "+").replace(/^\+/, "");
  };

  const buildWhatsAppLink = (
    phone: string,
    clientName: string,
    serviceName: string,
    dateStr: string,
    timeStr: string,
    newStatus: AppointmentStatus
  ) => {
    const cleanedPhone = cleanPhoneNumber(phone);
    const formattedDate = formatDate(dateStr);
    const formattedTime = formatTime(timeStr);

    let statusText = "";
    if (newStatus === "confirmed") {
      statusText = `Your appointment for ${serviceName} on ${formattedDate} at ${formattedTime} has been CONFIRMED. We look forward to seeing you at Apex Barbershop!`;
    } else if (newStatus === "declined") {
      statusText = `We regret to inform you that your appointment request for ${serviceName} on ${formattedDate} at ${formattedTime} could not be accepted. Please visit our website or contact us to reschedule.`;
    } else {
      statusText = `Your appointment for ${serviceName} on ${formattedDate} at ${formattedTime} is currently PENDING.`;
    }

    const message = `Hello ${clientName}, this is Apex Barbershop. ${statusText}`;
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleStatusUpdate = async (
    appointment: BarberAppointmentItem,
    newStatus: AppointmentStatus
  ) => {
    setLoadingId(appointment.id);

    const result = await updateAppointmentStatus(appointment.id, newStatus);
    setLoadingId(null);

    if (result.success) {
      // Update local state
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointment.id ? { ...item, status: newStatus } : item
        )
      );

      // Determine client contact info
      const clientName =
        appointment.client?.full_name || appointment.guest_name || "Client";
      const clientPhone =
        appointment.client?.phone || appointment.guest_phone || "";
      const serviceName = appointment.service?.name || "Service";

      if (clientPhone) {
        const whatsappUrl = buildWhatsAppLink(
          clientPhone,
          clientName,
          serviceName,
          appointment.appointment_date,
          appointment.start_time,
          newStatus
        );

        setActiveNotification({
          appointmentId: appointment.id,
          clientName,
          clientPhone,
          whatsappUrl,
          status: newStatus,
        });
      }
    } else {
      alert(result.error || "Failed to update appointment status");
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
            Pending
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Scissors className="h-6 w-6 text-amber-500" />
            Barber Appointments
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your schedule, update appointment status, and notify clients via WhatsApp.
          </p>
        </div>
      </div>

      {/* WhatsApp Notification Alert Card */}
      {activeNotification && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                Status updated to <span className="capitalize text-emerald-400 font-bold">{activeNotification.status}</span>
              </p>
              <p className="text-xs text-zinc-300">
                Send WhatsApp update to <span className="text-white font-medium">{activeNotification.clientName}</span> ({activeNotification.clientPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={activeNotification.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp Message
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <button
              onClick={() => setActiveNotification(null)}
              className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white text-xs transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/80 shadow-lg">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["all", "pending", "confirmed", "declined"] as const).map(
            (status) => {
              const count = countByStatus[status];
              const isSelected = filterStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  <span>{status === "all" ? "All Appointments" : status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
        <span className="text-xs text-zinc-500 px-1 self-start sm:self-auto hidden sm:inline">
          Showing {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Appointments Table Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No appointments found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              {filterStatus !== "all"
                ? `No ${filterStatus} appointments right now.`
                : "You have no appointments assigned yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-medium text-[11px]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Client</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Service</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Date & Time</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-normal">
                {filteredAppointments.map((apt) => {
                  const clientName =
                    apt.client?.full_name || apt.guest_name || "Guest Client";
                  const clientPhone =
                    apt.client?.phone || apt.guest_phone || null;
                  const clientEmail =
                    apt.client?.email || apt.guest_email || null;
                  const isLoading = loadingId === apt.id;
                  const isPending = apt.status === "pending";

                  return (
                    <tr
                      key={apt.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      {/* Client info: avatar and email hidden on mobile */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          {/* Avatar icon box: hidden on mobile */}
                          <div className="hidden sm:flex w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-zinc-950 font-bold text-xs shadow-sm shrink-0">
                            <User className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-white text-xs sm:text-sm block">
                                {clientName}
                              </span>
                              {!apt.client_id && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  Guest
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5 mt-0.5 text-zinc-400 text-[11px] font-light">
                              {/* Phone number: active clickable link on mobile/desktop */}
                              {clientPhone && (
                                <a
                                  href={`tel:${clientPhone}`}
                                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-amber-400 transition"
                                  title="Call client"
                                >
                                  <Phone className="w-3 h-3 text-amber-500/80 shrink-0" />
                                  <span>{clientPhone}</span>
                                </a>
                              )}

                              {/* Email: hidden on mobile */}
                              {clientEmail && (
                                <div className="hidden sm:flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                    {clientEmail}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service: logo hidden on mobile, service name & duration/price displayed */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          {/* Scissors icon box: hidden on mobile */}
                          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 items-center justify-center text-amber-400 shrink-0">
                            <Scissors className="w-3.5 h-3.5" />
                          </div>

                          <div>
                            <span className="font-medium text-white text-xs block">
                              {apt.service?.name || "Service"}
                            </span>
                            <span className="text-zinc-400 text-[11px] font-light flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {apt.service?.duration_minutes || 30}m • ${Number(apt.total_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-zinc-300 font-light text-[11px] sm:text-xs">
                          <div className="flex items-center gap-1.5 text-white font-medium">
                            <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{formatDate(apt.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Clock className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span>
                              {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>

                      {/* Actions: quick 1-tap Accept/Decline for pending, selector/WhatsApp for others */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {isLoading ? (
                            <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-amber-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Updating...
                            </div>
                          ) : isPending ? (
                            /* Quick Action 1-tap buttons for Pending bookings */
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStatusUpdate(apt, "confirmed")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                title="Accept & Confirm Appointment"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Accept</span>
                              </button>

                              <button
                                onClick={() => handleStatusUpdate(apt, "declined")}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition cursor-pointer hover:scale-105 active:scale-95"
                                title="Decline Appointment"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span className="hidden sm:inline">Decline</span>
                              </button>

                              {clientPhone && (
                                <a
                                  href={buildWhatsAppLink(
                                    clientPhone,
                                    clientName,
                                    apt.service?.name || "Service",
                                    apt.appointment_date,
                                    apt.start_time,
                                    apt.status
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                                  title="Send WhatsApp Message"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ) : (
                            /* Dropdown and WhatsApp button for Confirmed / Declined bookings */
                            <>
                              <select
                                value={apt.status}
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    apt,
                                    e.target.value as AppointmentStatus
                                  )
                                }
                                className="rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-amber-500/40 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="declined">Declined</option>
                              </select>

                              {clientPhone && (
                                <a
                                  href={buildWhatsAppLink(
                                    clientPhone,
                                    clientName,
                                    apt.service?.name || "Service",
                                    apt.appointment_date,
                                    apt.start_time,
                                    apt.status
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                                  title="Send WhatsApp Message"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
