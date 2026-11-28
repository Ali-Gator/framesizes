import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Plugin } from "vite";

import { type Messages, packageMessages, storeOf } from "./src/stores";

const here = import.meta.dirname;
const web = path.resolve(here, "../web/src");
// `STORE=edge vite build` builds the Edge Add-ons package into dist-edge/; unset is Chrome's dist/.
const store = storeOf(process.env.STORE);
const outDir = store === "chrome" ? "dist" : `dist-${store}`;

/**
 * Rewrites the copied `_locales` for the store: drops the locales it leaves out and writes the
 * messages it changes. Chrome's files are never touched, so its package stays byte for byte.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-each-store-gets-its-own-package}
 */
const storeLocales = (): Plugin => ({
  name: "store-locales",
  closeBundle() {
    const locales = path.resolve(here, outDir, "_locales");
    for (const locale of fs.readdirSync(locales)) {
      const file = path.join(locales, locale, "messages.json");
      const messages = JSON.parse(fs.readFileSync(file, "utf8")) as Messages;
      const out = packageMessages(store, locale, messages);
      if (out === null) fs.rmSync(path.join(locales, locale), { recursive: true });
      else if (out !== messages) fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
    }
  },
});

/*
 * The browser extension: two pages (the side panel and the full-size tab) and the background
 * service worker. G1's code is imported in place from apps/web, with Next's two imports shimmed.
 * MV3 pages allow no inline scripts, so nothing is inlined and no source map ships.
 */
export default defineConfig({
  root: here,
  base: "./",
  // As vitest.config.ts: the automatic runtime, so no React plugin is needed.
  oxc: { jsx: { runtime: "automatic" } },
  define: { "import.meta.env.STORE": JSON.stringify(store) },
  plugins: [storeLocales()],
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
    outDir,
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    rollupOptions: {
      // G1's "use client" lines mean nothing outside Next.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
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
