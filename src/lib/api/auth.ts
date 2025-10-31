import client from "@/lib/api/client";
import type { AuthUser, LoginRequest, LoginResponse } from "@/lib/api/types";

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const me = async (): Promise<AuthUser> => {
  const { data } = await client.get<AuthUser>("/auth/me");
  return data;
};
