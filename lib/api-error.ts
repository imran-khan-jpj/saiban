import { DEFAULTS } from "@/app/defaults";

/**
 * Extracts a user-facing message from NestJS / BFF error bodies.
 * Handles `message` as a string, string array, or falls back to `error`.
 */
export function parseApiErrorMessage(
  data: unknown,
  fallback: string = DEFAULTS.ERROR_MESSAGE,
): string {
  if (!data || typeof data !== "object") return fallback;

  const obj = data as { message?: unknown; error?: unknown };

  if (typeof obj.message === "string" && obj.message.length > 0) {
    return obj.message;
  }

  if (Array.isArray(obj.message) && obj.message.length > 0) {
    const first = obj.message[0];
    if (typeof first === "string" && first.length > 0) return first;
  }

  if (typeof obj.error === "string" && obj.error.length > 0) {
    return obj.error;
  }

  return fallback;
}
