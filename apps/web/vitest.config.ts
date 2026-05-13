import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config. Mirrors the tsconfig path aliases so tests import using
 * the same `@/...` and `@shared/...` specifiers as the app code.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/db/**", "lib/sports-api/api-football.ts", "lib/ai/prediction-engine.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@shared": resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
