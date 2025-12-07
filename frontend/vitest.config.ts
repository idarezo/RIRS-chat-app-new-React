// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setupTests.ts"],
    // Za React 19 potrebujemo te nastavitve
    alias: {
      react: "react",
      "react-dom": "react-dom",
      "react/jsx-runtime": "react/jsx-runtime",
    },
    coverage: {
      reporter: ["text", "html", "lcov"],
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
