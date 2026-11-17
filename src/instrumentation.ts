/** Refuse fixture deployment before the Node server accepts requests. No secrets read. */
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production"
    && process.env.COACH_PROVIDER === "fixtures") throw new Error("CONFIGURATION_ERROR: production fixtures are disabled");
}
