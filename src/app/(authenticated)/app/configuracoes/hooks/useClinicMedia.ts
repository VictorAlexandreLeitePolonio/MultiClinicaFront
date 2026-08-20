"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicProfileKeys } from "@/lib/queryKeys";
import { ClinicMediaType } from "@/types";
import {
  deleteClinicMedia,
  getClinicMedia,
  reorderClinicMedia,
  uploadClinicMedia,
} from "../services/clinic-media.service";

export function useClinicMedia(enabled = true) {
  return useQuery({ queryKey: clinicProfileKeys.media, queryFn: getClinicMedia, enabled });
}

function useMediaInvalidation() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: clinicProfileKeys.media });
}

export function useUploadClinicMedia() {
  const invalidate = useMediaInvalidation();
  return useMutation({
    mutationFn: ({ type, file, sortOrder }: { type: ClinicMediaType; file: File; sortOrder?: number }) =>
      uploadClinicMedia(type, file, sortOrder),
    onSuccess: invalidate,
  });
}

export function useReorderClinicMedia() {
  const invalidate = useMediaInvalidation();
  return useMutation({
    mutationFn: ({ id, sortOrder }: { id: number; sortOrder: number }) => reorderClinicMedia(id, sortOrder),
    onSuccess: invalidate,
  });
}

export function useDeleteClinicMedia() {
  const invalidate = useMediaInvalidation();
  return useMutation({
    mutationFn: (id: number) => deleteClinicMedia(id),
    onSuccess: invalidate,
  });
}
