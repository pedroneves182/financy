import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
export const corsOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
