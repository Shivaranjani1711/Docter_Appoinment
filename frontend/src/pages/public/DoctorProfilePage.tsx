import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDoctor, useDoctorSlots, useCreateAppointment } from "../../api/hooks";
import { useAuth } from "../../auth/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Alert } from "../../components/Alert";
import { ApiError } from "../../api/client";
import type { AppointmentSlot } from "../../types";

const schema = z.object({
  problemSummary: z.string().trim().min(5, "Please describe your problem (at least 5 characters)"),
  symptoms: z.string().trim().optional(),
  symptomDurationDays: z.coerce.number().int().min(0).optional(),
  additionalNotes: z.string().trim().optional(),
  relevantMedicalHistory: z.string().trim().optional(),
  currentMedications: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(todayIso());
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: doctorData, isLoading: doctorLoading } = useDoctor(id);
  const { data: slotsData, isLoading: slotsLoading } = useDoctorSlots(id, date);
  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (doctorLoading) return <LoadingState label="Loading doctor..." />;
  if (!doctorData) return <EmptyState title="Doctor not found" />;
  const doctor = doctorData.doctor;

  const onlineSlots = slotsData?.slots.filter((s) => s.type === "ONLINE") ?? [];
  const inPersonSlots = slotsData?.slots.filter((s) => s.type === "IN_PERSON") ?? [];

  async function onSubmit(values: FormValues) {
    if (!selectedSlot) {
      setBookingError("Please select a slot first.");
      return;
    }
    setBookingError(null);
    try {
      const appointment = await createAppointment.mutateAsync({
        slotId: selectedSlot._id,
        problemSummary: values.problemSummary,
        symptoms: values.symptoms ? values.symptoms.split(",").map((s) => s.trim()).filter(Boolean) : [],
        symptomDurationDays: values.symptomDurationDays,
        additionalNotes: values.additionalNotes,
        relevantMedicalHistory: values.relevantMedicalHistory,
        currentMedications: values.currentMedications,
      });
      navigate(`/patient/appointments/${appointment.appointment._id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "SLOT_ALREADY_BOOKED") {
          setBookingError("This slot was just booked by someone else. Please choose another slot.");
          setSelectedSlot(null);
        } else if (err.code === "EMAIL_NOT_VERIFIED") {
          setBookingError("Please verify your email before booking an appointment.");
        } else {
          setBookingError(err.message);
        }
      } else {
        setBookingError("Something went wrong while booking. Please try again.");
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="card">
        <h1 className="text-xl font-semibold text-ink-900">{doctor.userId?.fullName}</h1>
        <p className="text-ink-600">{doctor.specializationId?.name}</p>
        <p className="mt-2 text-sm text-ink-500">{doctor.experienceYears} years experience</p>
        {doctor.bio && <p className="mt-3 text-sm text-ink-700">{doctor.bio}</p>}
        {doctor.qualifications?.length > 0 && (
          <p className="mt-2 text-sm text-ink-600">Qualifications: {doctor.qualifications.join(", ")}</p>
        )}
        <p className="mt-2 text-sm font-medium text-ink-900">
          {doctor.consultationFee > 0 ? `Consultation fee: ₹${doctor.consultationFee}` : "No consultation fee"}
        </p>
      </div>

      {user?.role !== "PATIENT" ? (
        <Alert kind="info">
          <span>Log in as a patient to book an appointment with this doctor.</span>
        </Alert>
      ) : (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink-900">Book an appointment</h2>

          <label className="label mt-4" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="input max-w-xs"
            value={date}
            min={todayIso()}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot(null);
            }}
          />

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <SlotGroup
              title="Online consultation"
              slots={onlineSlots}
              selectedId={selectedSlot?._id}
              onSelect={setSelectedSlot}
              isLoading={slotsLoading}
              unsupportedMessage={!doctor.supportsOnline ? "This doctor does not offer online consultations." : undefined}
            />
            <SlotGroup
              title="In-person consultation"
              slots={inPersonSlots}
              selectedId={selectedSlot?._id}
              onSelect={setSelectedSlot}
              isLoading={slotsLoading}
              unsupportedMessage={!doctor.supportsInPerson ? "This doctor does not offer in-person consultations." : undefined}
            />
          </div>

          {selectedSlot && (
            <form className="card mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <p className="text-sm font-medium text-ink-900">
                Selected: {selectedSlot.type === "ONLINE" ? "Online" : "In-person"} on {date} at{" "}
                {selectedSlot.startTime}
              </p>
              {bookingError && <Alert kind="error">{bookingError}</Alert>}

              <div>
                <label className="label" htmlFor="problemSummary">
                  What's the main problem? *
                </label>
                <textarea
                  id="problemSummary"
                  className="input"
                  rows={2}
                  {...register("problemSummary")}
                  aria-invalid={!!errors.problemSummary}
                />
                {errors.problemSummary && <p className="field-error">{errors.problemSummary.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="symptoms">
                  Symptoms <span className="font-normal text-ink-400">(comma-separated, optional)</span>
                </label>
                <input id="symptoms" className="input" {...register("symptoms")} />
              </div>

              <div>
                <label className="label" htmlFor="symptomDurationDays">
                  How many days have you had these symptoms?{" "}
                  <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <input id="symptomDurationDays" type="number" min={0} className="input max-w-xs" {...register("symptomDurationDays")} />
              </div>

              <div>
                <label className="label" htmlFor="relevantMedicalHistory">
                  Relevant medical history <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <textarea id="relevantMedicalHistory" className="input" rows={2} {...register("relevantMedicalHistory")} />
              </div>

              <div>
                <label className="label" htmlFor="currentMedications">
                  Current medications <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <input id="currentMedications" className="input" {...register("currentMedications")} />
              </div>

              <div>
                <label className="label" htmlFor="additionalNotes">
                  Additional notes <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <textarea id="additionalNotes" className="input" rows={2} {...register("additionalNotes")} />
              </div>

              <button type="submit" className="btn-primary" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function SlotGroup({
  title,
  slots,
  selectedId,
  onSelect,
  isLoading,
  unsupportedMessage,
}: {
  title: string;
  slots: AppointmentSlot[];
  selectedId?: string;
  onSelect: (slot: AppointmentSlot) => void;
  isLoading: boolean;
  unsupportedMessage?: string;
}) {
  return (
    <div>
      <h3 className="font-medium text-ink-800">{title}</h3>
      {unsupportedMessage ? (
        <p className="mt-2 text-sm text-ink-500">{unsupportedMessage}</p>
      ) : isLoading ? (
        <LoadingState label="Loading slots..." />
      ) : slots.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500">No slots available for this date.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {slots.map((slot) => {
            const isOpen = slot.status === "OPEN";
            return (
              <button
                key={slot._id}
                type="button"
                disabled={!isOpen}
                onClick={() => onSelect(slot)}
                className={`rounded-sm border px-3 py-1.5 text-sm ${
                  selectedId === slot._id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : isOpen
                      ? "border-ink-200 text-ink-700 hover:border-brand-400"
                      : "border-ink-100 text-ink-300 line-through"
                }`}
              >
                {slot.startTime}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
