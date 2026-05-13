import { z } from "zod";

const nonEmpty = z.string().min(1);

const publicSchema = z.object({
  VITE_SUPABASE_URL: nonEmpty,
  VITE_SUPABASE_PUBLISHABLE_KEY: nonEmpty,
});

const serverSchema = z.object({
  SUPABASE_URL: nonEmpty,
  SUPABASE_PUBLISHABLE_KEY: nonEmpty,
  SUPABASE_SERVICE_ROLE_KEY: nonEmpty.optional(),
});

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

export function getPublicEnv(): PublicEnv {
  const raw = {
    VITE_SUPABASE_URL: pickString(import.meta.env.VITE_SUPABASE_URL),
    VITE_SUPABASE_PUBLISHABLE_KEY: pickString(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  };
  const parsed = publicSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Missing public env vars: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  }
  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  const raw = {
    SUPABASE_URL: pickString(process.env.SUPABASE_URL),
    SUPABASE_PUBLISHABLE_KEY: pickString(process.env.SUPABASE_PUBLISHABLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY: pickString(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  const parsed = serverSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Missing server env vars: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  }
  return parsed.data;
}

