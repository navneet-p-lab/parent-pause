/** Local-only browser test host. Never imported by the product application. */
import { createServer } from "node:http";
import { Readable } from "node:stream";
import next from "next";
import { createCoachHandler } from "../../../lib/server/coach-handler";
import { createCoachService, type SessionFactory } from "../../../lib/server/coach-service";
import { createInstanceLimiter } from "../../../lib/server/request-limits";
import { responseFixtures } from "../../fixtures/contracts";

const port = 3212;
const origin = `http://127.0.0.1:${port}`;
if (process.env.NODE_ENV !== "development" || process.env.COACH_PROVIDER !== "fixtures"
  || process.env.APP_ORIGIN !== origin || process.env.OPENAI_API_KEY) {
  throw new Error("Browser host requires isolated development fixture configuration");
}

const app = next({ dev: true, hostname: "127.0.0.1", port, webpack: true });
await app.prepare();
const nextHandler = app.getRequestHandler();
const limiter = createInstanceLimiter();
const attempts = new Map<string, number>();
const scenarios = new Set(["plan", "retry-once", "slow", "timeout", "invalid", "unsafe", "boundary", "classify-abuse", "classify-self-harm", "classify-invalid", "review-outage"]);
let ready = false;

const server = createServer(async (incoming, outgoing) => {
  if (incoming.url === "/__e2e_ready") {
    outgoing.writeHead(ready ? 200 : 503).end();
    return;
  }
  const scenario = String(incoming.headers["x-e2e-scenario"] ?? "default");
  if (incoming.url !== "/api/coach" || scenario === "default") {
    await nextHandler(incoming, outgoing);
    return;
  }
  if (!scenarios.has(scenario) || incoming.method !== "POST") {
    outgoing.writeHead(400).end();
    return;
  }
  const key = String(incoming.headers["x-e2e-client"] ?? "");
  const sessionFactory: SessionFactory = (request) => ({
    async classify() {
      if (scenario === "timeout") return new Promise(() => {});
      if (scenario === "classify-invalid") return { value: { category: "safe-by-fixture" } };
      if (scenario === "retry-once") {
        const attempt = attempts.get(key) ?? 0;
        attempts.set(key, attempt + 1);
        if (attempt === 0) throw new Error("SYNTHETIC_PRIVATE_PROVIDER_ERROR");
      }
      return { value: { category: scenario === "boundary" ? "medical_legal"
        : scenario === "classify-abuse" ? "abuse" : scenario === "classify-self-harm" ? "self_harm" : "routine" } };
    },
    async generate() {
      if (scenario === "invalid") return { value: { kind: "plan", locale: request.locale, acknowledgment: "MALFORMED_CANDIDATE_MARKER" } };
      if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1500));
      const plan = responseFixtures[request.locale].plan;
      return { value: { ...plan, acknowledgment: scenario === "unsafe" ? "UNSAFE_CANDIDATE_MARKER"
        : scenario === "slow" ? "DELAYED_CANDIDATE_MARKER" : plan.acknowledgment } };
    },
    async review() {
      if (scenario === "review-outage") throw new Error("SYNTHETIC_PRIVATE_REVIEW_ERROR");
      return { value: { decision: scenario === "unsafe" ? "block" : "allow", category: null } };
    },
  });
  const handler = createCoachHandler({ service: createCoachService(sessionFactory), limiter,
    env: () => ({ APP_ORIGIN: origin, COACH_CLIENT_KEY_HEADER: "x-e2e-client" }) });
  const controller = new AbortController();
  const abort = () => { if (!outgoing.writableEnded) controller.abort(); };
  outgoing.on("close", abort);
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
    const request = new Request(`${origin}/api/coach`, {
      method: "POST", headers, body: Readable.toWeb(incoming) as ReadableStream<Uint8Array>,
      signal: controller.signal, duplex: "half",
    } as RequestInit);
    const response = await handler(request);
    if (!outgoing.destroyed) {
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    }
  } catch {
    // Never print synthetic parent/provider data, including assertion failures.
    if (!outgoing.destroyed) outgoing.writeHead(500).end();
  } finally { outgoing.removeListener("close", abort); }
});
server.on("upgrade", app.getUpgradeHandler());
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", resolve);
});
// Compile both original Next entries before browsers connect to HMR. A cold
// API compilation during a journey can otherwise reload memory-only chat.
try {
  const page = await fetch(origin);
  if (!page.ok) throw new Error("Fixture page warm-up failed");
  await page.arrayBuffer();
  const response = await fetch(`${origin}/api/coach`, {
    method: "POST", headers: { "content-type": "application/json", origin, "x-e2e-client": "startup-warmup" },
    body: JSON.stringify({ requestId: crypto.randomUUID(), locale: "en", turns: [{ role: "user", text: "Synthetic startup check." }] }),
  });
  if (!response.ok) throw new Error("Fixture route warm-up failed");
  await response.arrayBuffer();
  ready = true;
} catch {
  server.closeAllConnections();
  await app.close();
  server.close();
  throw new Error("Fixture host warm-up failed");
}
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => {
  server.closeAllConnections();
  server.close(() => { void app.close().finally(() => process.exit(0)); });
});
