import type { AxiosError } from "axios";

type ValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type FieldError = {
  field: string;
  messages: string[];
};

export const isAxiosError = (error: unknown): error is AxiosError => {
  if (!error || typeof error !== "object") {
    return false;
  }
  return "isAxiosError" in error;
};

export const isValidationError = (
  error: unknown,
): error is AxiosError<ValidationErrorResponse> => {
  return isAxiosError(error) && error.response?.status === 422;
};

export const extractFieldErrors = (
  error: AxiosError<ValidationErrorResponse>,
): FieldError[] => {
  const payload = error.response?.data;
  if (!payload?.errors) return [];
  return Object.entries(payload.errors).map(([field, messages]) => ({
    field,
    messages,
  }));
};

export const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data as { message?: string };
    return responseMessage?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Algo deu errado. Tente novamente.";
};
