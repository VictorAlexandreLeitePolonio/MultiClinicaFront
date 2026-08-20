"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientPortalKeys } from "@/lib/queryKeys";
import { PatientMe, UpdatePatientMePayload } from "@/types";
import {
  getHistoryAppointments,
  getMe,
  getMyAppointmentRequests,
  getMyClinics,
  getUpcomingAppointments,
  updateMe,
} from "../services/patient-portal.service";

export function usePatientMe() {
  return useQuery({ queryKey: patientPortalKeys.me, queryFn: getMe });
}

export function useUpdatePatientMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePatientMePayload) => updateMe(payload),
    onSuccess: (me: PatientMe) => {
      queryClient.setQueryData(patientPortalKeys.me, me);
    },
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: patientPortalKeys.appointments("upcoming"),
    queryFn: getUpcomingAppointments,
  });
}

export function useHistoryAppointments() {
  return useQuery({
    queryKey: patientPortalKeys.appointments("history"),
    queryFn: getHistoryAppointments,
  });
}

export function useMyClinics() {
  return useQuery({ queryKey: patientPortalKeys.clinics, queryFn: getMyClinics });
}

export function useMyAppointmentRequests() {
  return useQuery({ queryKey: patientPortalKeys.requests, queryFn: getMyAppointmentRequests });
}
