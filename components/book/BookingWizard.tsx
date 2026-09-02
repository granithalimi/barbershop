"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { type Barber, type Service } from "@/lib/booking-data"
import type { CurrentUserProfile } from "@/lib/supabase/auth";
import StepBarberSelect from "./StepBarberSelect";
import StepServiceSelect from "./StepServiceSelect";
import StepDateTimeSelect from "./StepDateTimeSelect";
import StepContactDetails, { type GuestData } from "./StepContactDetails";
import StepConfirmation from "./StepConfirmation";
import StepBookingSuccess from "./StepBookingSuccess";

import { createClient } from "@/lib/supabase/client";

interface BookingWizardProps {
  currentUser?: {
    user: { id: string; email?: string } | null;
    profile: CurrentUserProfile | null;
  } | null;
}

export default function BookingWizard({ currentUser = null }: BookingWizardProps) {
  // Current Step: 1 = Barber, 2 = Service, 3 = Date & Time, 4 = Contact, 5 = Confirmation, 6 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  const isLoggedIn = !!currentUser?.user;

  // Form State
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [guestData, setGuestData] = useState<GuestData>({
    fullName: currentUser?.profile?.full_name || "",
    email: currentUser?.user?.email || "",
    countryCode: "+389",
    phone: currentUser?.profile?.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step Handlers
  const handleSelectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    // Reset service if current service is not performed by this barber
    if (selectedService && !barber.serviceIds.includes(selectedService.id)) {
      setSelectedService(null);
    }
    setCurrentStep(2);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(3);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedBarber) return;
    if (currentStep === 2 && !selectedService) return;
    if (currentStep === 3 && (!selectedDate || !selectedTime)) return;
    if (currentStep === 4 && !isLoggedIn && (!guestData.fullName || !guestData.phone)) {
      alert("Please provide your full name and phone number to continue.");
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Compute precise start_time and end_time
      const [hours, mins] = selectedTime.split(":").map(Number);
      const totalStartMins = hours * 60 + mins;
      const totalEndMins = totalStartMins + (selectedService.durationMinutes || 30);

      const endHours = Math.floor(totalEndMins / 60);
      const endMins = totalEndMins % 60;

      const startTimeFormatted = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
      const endTimeFormatted = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}:00`;

      const supabase = createClient();

      const appointmentPayload = {
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        client_id: currentUser?.user?.id || null,
        guest_name: isLoggedIn ? null : (guestData.fullName || "Guest"),
        guest_email: isLoggedIn ? null : (guestData.email || null),
        guest_phone: isLoggedIn ? null : (`${guestData.countryCode}${guestData.phone}` || null),
        appointment_date: selectedDate,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        status: "pending",
        payment_method: "cash",
        total_price: selectedService.priceEur,
        notes: null,
      };

      const { error } = await supabase
        .from("appointments")
        .insert([appointmentPayload]);

      if (error) {
        throw error;
      }

      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Error creating appointment:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to book appointment. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setCurrentStep(1);
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedTime("10:30");
    setSubmitError(null);
    setGuestData({
      fullName: "",
      email: "",
      countryCode: "+389",
      phone: "",
    });
  };

  const stepsList = [
    { num: 1, label: "Barber" },
    { num: 2, label: "Service" },
    { num: 3, label: "Time" },
    { num: 4, label: "Details" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto pb-24 sm:pb-12">
      {/* Top Header & Breadcrumbs (Steps 1 to 5) */}
      {currentStep <= 5 && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBackStep}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            )}

            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {stepsList.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${isDone
                      ? "bg-amber-500"
                      : isCurrent
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-zinc-800"
                      }`}
                  />
                  <span
                    className={`hidden sm:block text-[10px] font-bold text-center uppercase tracking-wider ${isCurrent
                      ? "text-amber-400"
                      : isDone
                        ? "text-zinc-300"
                        : "text-zinc-600"
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Card View */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-4 sm:p-7 shadow-2xl shadow-black/80">
        {currentStep === 1 && (
          <StepBarberSelect
            selectedBarber={selectedBarber}
            onSelectBarber={handleSelectBarber}
          />
        )}

        {currentStep === 2 && selectedBarber && (
          <StepServiceSelect
            barber={selectedBarber}
            selectedService={selectedService}
            onSelectService={handleSelectService}
          />
        )}

        {currentStep === 3 && (
          <StepDateTimeSelect
            barber={selectedBarber}
            service={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={handleSelectDate}
            onSelectTime={setSelectedTime}
          />
        )}

        {currentStep === 4 && (
          <StepContactDetails
            currentUser={currentUser}
            guestData={guestData}
            onUpdateGuestData={(data) => setGuestData((prev) => ({ ...prev, ...data }))}
          />
        )}

        {currentStep === 5 && selectedBarber && selectedService && (
          <StepConfirmation
            barber={selectedBarber}
            service={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            currentUser={currentUser}
            guestData={guestData}
            isSubmitting={isSubmitting}
            error={submitError}
            onConfirm={handleConfirmBooking}
          />
        )}

        {currentStep === 6 && selectedBarber && selectedService && (
          <StepBookingSuccess
            barber={selectedBarber}
            service={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onReset={handleResetBooking}
          />
        )}
      </div>

      {/* Sticky Bottom Action Bar (for Steps 3 to 5 on mobile) */}
      {currentStep >= 3 && currentStep <= 5 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 z-40 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-6">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            {/* Quick summary snippet */}
            <div className="text-left leading-tight sm:hidden">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Total
              </span>
              <span className="text-lg font-black text-amber-400">
                €{selectedService?.priceEur || 0}
              </span>
            </div>

            {/* Next / Confirm Action Button */}
            {currentStep === 5 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="flex-1 sm:w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-sm disabled:opacity-50 z-20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Requesting Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <Check className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 sm:w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-sm z-20"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
