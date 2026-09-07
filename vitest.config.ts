// vitest.config.ts
//
// Minimal vitest configuration. Defaults handle most things; this file
// only pins the include glob and root for explicitness.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: false,
    passWithNoTests: false,
  },
});
