import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// A test-only browser host. Product page wiring belongs to T07.
export default defineConfig({
  root: fileURLToPath(new URL("./src/test/presentational", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { host: "127.0.0.1", port: 3211, strictPort: true },
});
