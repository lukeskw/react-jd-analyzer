import axios from "axios";

import {
  getAuthToken,
  notifyUnauthorized,
  setAuthToken,
} from "@/lib/auth/token";
import { environment } from "@/lib/environment";

const apiBaseURL = environment.VITE_API_URL;

const client = axios.create({
  baseURL: apiBaseURL,
  headers: {
    Accept: "application/json",
  },
   timeout: 30_000,
});

client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      setAuthToken(undefined);
      notifyUnauthorized();
      if (
        globalThis.window !== undefined &&
        globalThis.location.pathname !== "/login"
      ) {
        globalThis.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default client;
