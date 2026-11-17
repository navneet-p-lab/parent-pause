import "server-only";

export class ConfigurationError extends Error {
  readonly code = "CONFIGURATION_ERROR";
  constructor() { super("CONFIGURATION_ERROR"); this.name = "ConfigurationError"; }
}

export type ProviderConfig =
  | { mode: "fixtures" }
  | { mode: "openai"; apiKey: string; model: string };

/** Explicit environment only: no public credentials, implicit model or custom endpoint. */
export function readProviderConfig(env: Record<string, string | undefined> = process.env): ProviderConfig {
  const mode = env.COACH_PROVIDER;
  if (mode === "fixtures") {
    if (env.NODE_ENV !== "test" && env.NODE_ENV !== "development") throw new ConfigurationError();
    return { mode };
  }
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim();
  if (mode !== "openai" || !apiKey || !model || /\s/.test(model)
    || model.length > 200 || /[\r\n]/.test(apiKey)) throw new ConfigurationError();
  return { mode, apiKey, model };
}
