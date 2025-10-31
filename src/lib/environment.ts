import { z } from "zod";

const environmentSchema = z.object({
  VITE_API_URL: z.url(),
});

const _environment = environmentSchema.safeParse(import.meta.env);

if (_environment.success === false) {
  console.error("Invalid environment variables", _environment.error.format());
  throw new Error("Invalid environment variables");
}

export const environment = _environment.data;
