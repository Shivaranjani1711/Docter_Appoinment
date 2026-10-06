import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  Appointment,
  AppointmentSlot,
  Doctor,
  MedicalReportSummary,
  NotificationItem,
  Prescription,
} from "../types";

export function useDoctors(params: { specializationId?: string; search?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.specializationId) qs.set("specializationId", params.specializationId);
  if (params.search) qs.set("search", params.search);
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => apiFetch<{ doctors: Doctor[] }>(`/doctors?${qs.toString()}`),
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => apiFetch<{ doctor: Doctor }>(`/doctors/${id}`),
    enabled: Boolean(id),
  });
}

export function useDoctorSlots(doctorId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["doctor-slots", doctorId, date],
    queryFn: () => apiFetch<{ slots: AppointmentSlot[] }>(`/doctors/${doctorId}/availability?date=${date}`),
    enabled: Boolean(doctorId && date),
  });
}

export function useMyAppointments(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["appointments", status],
    queryFn: () => apiFetch<{ appointments: Appointment[] }>(`/appointments${qs}`),
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => apiFetch<{ appointment: Appointment }>(`/appointments/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      slotId: string;
      problemSummary: string;
      symptoms?: string[];
      symptomDurationDays?: number;
      additionalNotes?: string;
      relevantMedicalHistory?: string;
      currentMedications?: string;
    }) => apiFetch<{ appointment: Appointment }>("/appointments", { method: "POST", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiFetch<{ appointment: Appointment }>(`/appointments/${id}/cancel`, { method: "POST", body: { reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newSlotId }: { id: string; newSlotId: string }) =>
      apiFetch<{ appointment: Appointment }>(`/appointments/${id}/reschedule`, {
        method: "POST",
        body: { newSlotId },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useConvertToVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiFetch<{ appointment: Appointment }>(`/appointments/${id}/convert-to-video`, {
        method: "POST",
        body: { reason },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: ["medical-reports"],
    queryFn: () => apiFetch<{ reports: MedicalReportSummary[] }>("/medical-reports"),
  });
}

export function useUploadReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<{ report: MedicalReportSummary }>("/medical-reports", {
        method: "POST",
        body: form,
        isFormData: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-reports"] }),
  });
}

export function useMyPrescriptions() {
  return useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => apiFetch<{ prescriptions: Prescription[] }>("/prescriptions"),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<{ notifications: NotificationItem[] }>("/notifications"),
    refetchInterval: 30000,
  });
}
