import path from "node:path";

import { defineConfig } from "vitest/config";

// One unit run for the whole workspace, in Node. A component test that clicks opts into jsdom
// with `// @vitest-environment jsdom` at its top.
export default defineConfig({
  // Pinned so TSX tests do not depend on the app's tsconfig `jsx` setting, which Next may rewrite.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: [{ find: /^@\//, replacement: `${path.resolve(import.meta.dirname, "apps/web/src")}/` }],
  },
  test: {
    environment: "node",
    include: [
      "scripts/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
      "apps/*/src/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
