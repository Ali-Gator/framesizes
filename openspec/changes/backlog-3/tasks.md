## 1. Spec deltas

- [x] 1.1 frame-size-chart delta (MODIFIED six common sizes, anatomy, proof line; ADDED first-paint unit, wide-phone stage, capped-stage labels, forced colors) — written in triage
- [x] 1.2 site-shell delta (ADDED `data-unit` before paint, segmented control in forced colors) — written in triage

## 2. Fixes — one subagent at a time, serially

- [x] 2.1 BL-6 — set `NEXT_DIST_DIR: ".next-e2e"` on the port-3100 server in `playwright.config.ts`; add `.next-e2e` to `.gitignore`, `.prettierignore`, `eslint.config.mjs`, `vitest.config.ts`, `apps/web/tsconfig.json` (include types, exclude dev); fix comments in `playwright.config.ts` and `apps/web/next.config.ts`. Check: `pnpm test:e2e` passes while `pnpm dev` runs.
- [x] 2.2 BL-30 — failing e2e tests:
  - `data-unit` from storage before bundles run ({@link openspec/specs/site-shell/spec.md#scenario-a-stored-choice-at-load}); block `/_next/static/**/*.js` with `page.route`, seed storage with `addInitScript`
  - nothing stored gives `in` ({@link openspec/specs/site-shell/spec.md#scenario-nothing-is-stored})
  - blocked storage flips the attribute ({@link openspec/specs/site-shell/spec.md#scenario-the-toggle-with-storage-blocked})
  - cm line follows the unit ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-cm-line-follows-the-unit})
  - anatomy in cm ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-four-measurements-in-centimetres})
  - wall height follows the unit ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-wall-height-follows-the-unit})
  - stored cm at first paint ({@link openspec/specs/frame-size-chart/spec.md#scenario-a-stored-unit-at-load})
- [x] 2.3 BL-30 — approved edit (design.md Decision 1): `e2e/frame-chart-content.spec.ts`, test "the widget footer says where the sizes come from", `toContain("8 ft (244 cm)")` becomes `toContain("8 ft")` and `toContain("244 cm")`, citing {@link openspec/specs/frame-size-chart/spec.md#scenario-the-proof-line}. No other assertion changes.
- [x] 2.4 BL-30 — implement in `layout.tsx` (inline head script, `data-unit="in"`, `suppressHydrationWarning`), `lib/unit.ts`, `globals.css`, `common-sizes.tsx`, `frame-anatomy.tsx` and `chart-footer.tsx`, until 2.2 and 2.3 pass. Keep the markup constraints in design.md (cm span second child, `data-value` inch-only). Run `humanizer:humanizer` over the new copy ("0.6 cm smaller", "8 ft" / "244 cm") and check it against the On-page SEO guide's Wording › Units.
- [x] 2.5 BL-28 — failing e2e tests at 430 × 932 and 620 × 800 for the wide-phone scenarios ({@link openspec/specs/frame-size-chart/spec.md#scenario-a-tall-frame-on-a-wide-phone}, {@link openspec/specs/frame-size-chart/spec.md#scenario-the-smallest-outline-on-a-wide-phone}, {@link openspec/specs/frame-size-chart/spec.md#scenario-a-wide-phone-keeps-the-preview-in-the-upper-half}, {@link openspec/specs/frame-size-chart/spec.md#scenario-keyboard-focus-on-a-wide-phone}, {@link openspec/specs/frame-size-chart/spec.md#scenario-a-narrow-phone-is-unchanged})
- [x] 2.6 BL-28 — grow the phone stage in `apps/web/src/app/widgets.css`: ratio height above 345px, upper-half cap with centring, `scroll-margin-top` follows. Keep the `@container card (max-width: 639.98px)` header literal. Iterate until 2.5 passes.
- [x] 2.7 BL-29 — failing e2e test at 800 × 600, both views ({@link openspec/specs/frame-size-chart/spec.md#scenario-labels-at-800--600})
- [x] 2.8 BL-29 — `container-type: inline-size` on `.fs-scale-stage`, 26-unit labels on capped stages up to 520px, and corrected comments in `widgets.css` and `size-compare.tsx`. Iterate until 2.7 passes.
- [x] 2.9 BL-24 — failing e2e tests with `forcedColors: "active"`, each asserting the media query matches first ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-in-forced-colors}, {@link openspec/specs/frame-size-chart/spec.md#scenario-the-phone-rows-in-forced-colors}, {@link openspec/specs/site-shell/spec.md#scenario-the-units-toggle-in-forced-colors})
- [x] 2.10 BL-24 — forced-colors rules in `widgets.css` (row outline that does not collide with the focus ring, system-colour radio dot) and on the checked option in `segmented-control.tsx`. Iterate until 2.9 passes.

## 3. Verify, delete, review, archive, ship

- [ ] 3.1 `pnpm fix`, `pnpm test`
- [ ] 3.2 Delete shipped bullets BL-30, BL-28, BL-29, BL-24 and BL-6 from `docs/backlog.md`
- [ ] 3.3 `/code-review high` in a fresh subagent; fix the findings and log the rest as new BL items
- [ ] 3.4 At archive, rewrite the permanent specs' non-requirement sections, which the deltas do not touch:
  - frame-size-chart Behavior: the 184px stage and the 287px `scroll-margin-top` become the grown stage; the one-column label wording; the static sections follow `data-unit`
  - site-shell Public Interface and Behavior: `data-unit` and the head script
- [ ] 3.5 Archive (`/opsx:archive` flow, no Tracker), On-page SEO guide pre-publish checklist for `/`, preflight, push, PR, auto-merge
