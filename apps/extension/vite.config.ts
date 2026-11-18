import path from "node:path";

import { defineConfig } from "vite";

const here = import.meta.dirname;
const web = path.resolve(here, "../web/src");

/*
 * The Chrome extension: two pages (the side panel and the full-size tab) and the background
 * service worker. G1's code is imported in place from apps/web, with Next's two imports shimmed.
 * MV3 pages allow no inline scripts, so nothing is inlined and no source map ships.
 */
export default defineConfig({
  root: here,
  base: "./",
  // As vitest.config.ts: the automatic runtime, so no React plugin is needed.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${web}/` },
      { find: /^next\/dynamic$/, replacement: path.resolve(here, "src/shims/next-dynamic.tsx") },
      { find: /^next\/link$/, replacement: path.resolve(here, "src/shims/next-link.tsx") },
    ],
    // apps/web's files and the extension's own resolve React from two folders: one copy only.
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        sidepanel: path.resolve(here, "sidepanel.html"),
        tab: path.resolve(here, "tab.html"),
        background: path.resolve(here, "src/background.ts"),
      },
      output: {
        // The manifest names the service worker by a fixed path.
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
      },
    },
  },
});
