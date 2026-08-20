"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicProfileKeys } from "@/lib/queryKeys";
import { CreateBusinessHourRequest } from "@/types";
import {
  addBusinessHour,
  deleteBusinessHour,
  getBusinessHours,
  getCategoryCatalog,
  getClinicCategories,
  setClinicCategories,
} from "../services/clinic-profile.service";

export function useCategoryCatalog(enabled = true) {
  return useQuery({ queryKey: clinicProfileKeys.categoryCatalog, queryFn: getCategoryCatalog, enabled });
}

export function useClinicCategories(enabled = true) {
  return useQuery({ queryKey: clinicProfileKeys.categories, queryFn: getClinicCategories, enabled });
}

export function useSetClinicCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryIds: number[]) => setClinicCategories(categoryIds),
    onSuccess: (categories) => {
      queryClient.setQueryData(clinicProfileKeys.categories, categories);
    },
  });
}

export function useBusinessHours(enabled = true) {
  return useQuery({ queryKey: clinicProfileKeys.businessHours, queryFn: getBusinessHours, enabled });
}

export function useAddBusinessHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBusinessHourRequest) => addBusinessHour(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clinicProfileKeys.businessHours });
    },
  });
}

export function useDeleteBusinessHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBusinessHour(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clinicProfileKeys.businessHours });
    },
  });
}
