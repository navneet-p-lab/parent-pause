import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Use the environment loader belonging to the pinned Next dependency, including
// its production-file precedence, before deciding whether startup is permitted.
const requireFromNext = createRequire(import.meta.resolve("next/package.json"));
const { loadEnvConfig } = requireFromNext("@next/env");
let environmentValid = true;
loadEnvConfig(process.cwd(), false, { info() {}, error() { environmentValid = false; } }, true);

// `next start` is always a production server, even if NODE_ENV was not set.
// Next's registration hook can be lazy, so reject before importing the CLI.
if (!environmentValid) {
  console.error("CONFIGURATION_ERROR: production environment could not be loaded");
  process.exitCode = 1;
} else if (process.env.COACH_PROVIDER === "fixtures") {
  console.error("CONFIGURATION_ERROR: production fixtures are disabled");
  process.exitCode = 1;
} else {
  process.argv.splice(1, 1, fileURLToPath(import.meta.resolve("next/dist/bin/next")), "start", "--hostname", "127.0.0.1");
  await import("next/dist/bin/next");
}
