"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { AppointmentRequest } from "@/types";
import {
  acceptRequest,
  cancelRequestByClinic,
  getClinicRequests,
  rejectRequest,
} from "../../services/appointment-requests.service";

export function useClinicRequests() {
  return useQuery({
    queryKey: queryKeys.appointmentRequests.list(),
    queryFn: getClinicRequests,
  });
}

/** Invalida solicitações e consultas — o aceite gera uma nova consulta na Agenda. */
function useRequestMutation<TVars>(mutationFn: (vars: TVars) => Promise<AppointmentRequest>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointmentRequests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

export function useAcceptRequest() {
  return useRequestMutation(({ id, professionalId }: { id: number; professionalId: number }) =>
    acceptRequest(id, professionalId),
  );
}

export function useRejectRequest() {
  return useRequestMutation(({ id, reason }: { id: number; reason: string }) => rejectRequest(id, reason));
}

export function useCancelClinicRequest() {
  return useRequestMutation(({ id, reason }: { id: number; reason: string }) =>
    cancelRequestByClinic(id, reason),
  );
}
