import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/* No @vitejs/plugin-react: vitest transforms TSX with esbuild, which reads
   `jsx: "react-jsx"` from tsconfig.json — the automatic runtime, no import
   needed in a test file. The plugin's other job is Fast Refresh, which a test
   run has no use for. */
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
