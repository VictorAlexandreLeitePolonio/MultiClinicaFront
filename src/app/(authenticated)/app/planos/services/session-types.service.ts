import api from "@/lib/api";

export interface SessionType {
  id: number;
  name: string;
}

export async function getSessionTypes(search?: string): Promise<SessionType[]> {
  const response = await api.get<SessionType[]>("/api/session-types", {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function createSessionType(name: string): Promise<SessionType> {
  const response = await api.post<SessionType>("/api/session-types", { name });
  return response.data;
}
