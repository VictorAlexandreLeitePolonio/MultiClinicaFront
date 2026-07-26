import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { PagedResult, User } from "@/types";
import {
  UsuarioCreateFormData,
  UsuarioFormData,
} from "@/app/(authenticated)/app/usuarios/schemas/usuario.schema";

export interface GetUsersParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export async function getUsers(params?: GetUsersParams): Promise<PagedResult<User>> {
  const response = await api.get<PagedResult<User> | User[]>("/api/users", {
    params,
  });

  return normalizePagedResult<User>(response.data, params?.pageSize);
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get<User>(`/api/users/${id}`);

  return response.data;
}

export async function createUser(payload: UsuarioCreateFormData): Promise<User> {
  const response = await api.post<User>("/api/users", payload);

  return response.data;
}

export async function updateUser(id: number, payload: Partial<UsuarioFormData>): Promise<User> {
  const response = await api.put<User>(`/api/users/${id}`, payload);

  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
