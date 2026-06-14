import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/api/scenarios/**/*.scenario.test.ts"],
    globals: false,
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    /** Integration tests share staging data — run files one at a time. */
    fileParallelism: false,
    sequence: { concurrent: false },
    reporters: ["verbose"],
    globalSetup: ["./tests/api/global-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
