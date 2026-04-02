import type { Context } from "hono";

/**
 * Global error handler. Catches unhandled errors and returns structured JSON.
 */
export function errorHandler(err: Error, c: Context) {
  console.error("[error]", err.message);

  const status = (err as any).status || 500;
  return c.json(
    {
      error: status === 500 ? "internal_error" : "request_error",
      message: status === 500 ? "Internal server error" : err.message,
    },
    status
  );
}
