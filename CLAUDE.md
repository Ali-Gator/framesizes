# Frame Sizes — Development Rules

Governing spec: `openspec/specs/constitution/spec.md` (where truth lives, how it is cited, how it is proven). How specs map to code and how changes run: `openspec/specs/spec-workflow/spec.md`. Research and site map (hubs, pages, keywords): https://claude.ai/artifact/3mBdEjuPsrJZsootpaHH18. On-page SEO guide (URL, title, h1, description, keywords, tags per page): https://claude.ai/artifact/KbaLF8WnJ2jRWc55r5yfcx. Tracker: see "Workflow config" below.

## Layout

pnpm workspace, Node 22.18+. `apps/web` is the Next.js app (Vercel Root Directory), statically rendered. Shared pure-TypeScript code (the size engine) goes under `packages/<name>` when the first change needs it.

## Workflow: Spec -> Tests -> Code

Work is an OpenSpec change under `openspec/changes/t<N>-<slug>/` (`T<N>` = its Tracker row). Drive it with `/opsx:propose`, `/opsx:apply`, `/opsx:archive`. A batch of backlog fixes is `backlog-<n>` instead, with no Tracker row: plan it with `/backlog-batch`, ship it with `/backlog-fix backlog-<n>`.

1. **Spec first** — the delta at `openspec/changes/<change>/specs/<capability>/spec.md`.
2. **Tests second** — cite the scenario at its permanent path: `{@link openspec/specs/<capability>/spec.md#<scenario-anchor>}`.
3. **Code last.**

- A capability touched for the first time uses `## ADDED Requirements`, never `MODIFIED`.
- Archiving a brand-new capability keeps only its Purpose and Requirements. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/<capability>/spec.md` after archive.
- Add the capability's row to `openspec/specs/README.md` at archive, not before: until the permanent spec exists, the row blocks every edit to its paths. Leave exempt files (below) out of rows; the hook never gates them.
- **After every `/opsx:archive` of a `t<N>` change, update the Tracker** (the Tracker doc in "Workflow config", with the docs tools): set row `T<N>`'s Status (`Done` when the change completes the task, otherwise `In progress`) and add one line at the top of the Log table: today's date, `Claude Code`, what the change shipped. A `backlog-<n>` change skips this. No docs tools: print the status and log line for the user to paste. This step lives here, not in the generated OpenSpec skills, so `openspec update` never drops it.
- A change touching only exempt paths (below) sets `skip_specs: true` in its `.openspec.yaml` instead of inventing a requirement.
- `openspec validate --changes` runs in CI, not in the pre-commit hook: a half-planned change stays committable.

### A page with no approved design yet

The design is always its own step, done outside the code. `/opsx:propose t<N>` for a page with no design link under "Design source" runs by default in two phases (T4 ran this way; T7 and T11 split the same way):

1. **Phase 1 change and designer prompt, in one turn.** Propose `t<N>-<slug>-engine`: the pure math in `packages/<name>`, no UI and no page. Its proposal records the page's SEO-guide rows and the questions the canvas must settle. In the same turn, give the user a self-contained prompt for an AI designer. It names:
   - the design system and the closest approved sibling canvas;
   - the page's head values from the SEO guide, verbatim;
   - the widget's steps and the engine's rules, with real numbers;
   - every state to draw: each result, custom or empty, bad input, back;
   - desktop 1280 and phone 390 boards, and the page sections;
   - the open product questions, recommendation first;
   - plain copy: short sentences, no marketing tone, every fact and keyword kept, since it is humanized later (step 4).

   A page with no engine work skips the change: the prompt only.

2. **Design.** The user brings back the canvas. Check it against the phase 1 change and ask for approval of the canvas and its answers to the open questions. Then record its link under "Design source".
3. **Phase 1 implementation.** Fold what the canvas changed in the engine into the phase 1 change (`/opsx:update`), then `/opsx:apply` it. Phase 1 usually has no visitor-facing text; if it adds some (labels, names), the humanizer rule under "Conventions" applies to it too.
4. **Phase 2 change and implementation.** Propose `t<N>-<slug>` (the UI, copy, SEO and the page going live), then apply it. The proposal takes the copy from the canvas, and its tasks include a humanizer step. During `/opsx:apply`, Claude runs `humanizer:humanizer` over all of the page's visitor-facing text before the commit that adds it: the canvas copy, the FAQ, labels and alt text ("Conventions"). The title, `h1` and description come verbatim from the SEO guide and are not reworded. A rewording that changes what the approved canvas says goes to the user first.

### Exempt from the spec hook

Tests (`__tests__`, `*.test.*`, `*.spec.*`), docs and markdown, config files (`*.config.*`, `tsconfig*.json`, `package.json`), `apps/*/src/components/ui/**`, `apps/*/src/app/globals.css`, `scripts/**`, `apps/*/public/**`, any `*.json` / `*.yaml` / `*.yml` / `*.css`, `.claude/**`, `.env*`, `.gitignore`.

## Review and gates

- Each phase runs on its own branch. Commit freely; review once per phase with the `phase-review` skill (`/code-review high` in a fresh subagent).
- After `/opsx:apply` finishes, without being asked: phase review in a fresh `general-purpose` subagent (never inline), fix its findings, log what stays unfixed in `docs/backlog.md`, `/opsx:archive`, push, open a PR to `main`, and turn on its auto-merge with a merge commit (never squash).
- The user approves: a design before its UI proposal, any edit to an existing test, and every paid run.
- Decide technical choices yourself and report them in plain words. Ask the user only product, money or approval questions, one plain sentence each, with your recommendation first.
- `pnpm fix` then `pnpm test` is the manual phase gate. CI runs `ci.yml` (format, lint, typecheck, unit + citation gate), `openspec.yml` and `e2e.yml` on every push; `main` requires the `check`, `e2e` and `validate` checks.

## Backlog (`docs/backlog.md`)

Do these without being asked, in every phase:

- **Add.** Before archive, log every review finding you did not fix, and every defect or gap found along the way that is worth fixing later, as a `BL-nn` item (shape, ids and status rules are at the top of the file). Say in the PR which ids you added.
- **Route.** Work a Tracker row already owns stays in the Tracker. The backlog holds what no change owns.
- **Fold in.** When proposing a change, read the backlog and take the items in its area into its tasks. Delete an item when its fix ships, in the same PR.

## Hooks (`.claude/settings.json`)

1. **check-spec-exists** — blocks `Edit`, `Write` and visible `Bash` writes to a mapped path whose spec is missing. It guards against forgetting, not evasion: a path no README row matches is never blocked, and the Bash shapes it cannot read are pinned in `scripts/__tests__/hook-bash-write-targets.test.ts`.
2. **pre-commit-tests** — runs `format:check`, `lint`, `typecheck`, `test:unit` before any agent `git commit` — {@link openspec/specs/spec-workflow/spec.md#requirement-every-agent-commit-passes-the-fast-gates}.

## Conventions

- pnpm only. Everything written to the repo is English; chat replies are English unless asked otherwise.
- Every page targets one search intent and carries its own widget variant (research artifact, Plan tab). SEO basics per page: unique title, description, canonical, one `h1`, static HTML for the content.
- A change that adds or edits a page takes its URL, title, `h1`, description, keywords, alts, Open Graph and JSON-LD from the On-page SEO guide (a Claude Doc: read it with the docs tools, copy the page's row from its Per-page map into the proposal) and passes the guide's pre-publish checklist before archive. If the guide and the research disagree on a keyword, the research wins and the guide gets fixed.
- A change that adds or edits visitor-facing text (page copy, headings, FAQ answers, labels, title and description, alt and `aria-label` text) runs the `humanizer:humanizer` skill over the new or changed text before commit. It keeps every fact, size and SEO-guide keyword as it was.

## Workflow config

Read by the global `backlog-batch`, `backlog-fix` and `phase-review` skills (`~/.claude/skills/`).

- **Tracker:** https://claude.ai/artifact/StxPSLNos2SZYKWXUK4ueP (Claude Doc: Tracker table + Log; edit with the docs tools)
- **Gate commands:** `pnpm fix`, then `pnpm test`. Pre-push checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `openspec validate --all --no-interactive`.
- **Paid scripts (never run without the user's yes):** none yet. Anything that calls a paid API (AI, email, image generation) goes here when added.
- **Design source:** Lane-C designs are drawn as a canvas artifact the user approves; record each link here.
  - Home page (F1, `/`): https://claude.ai/artifact/FA2okr9myNhQiZsaGdeuMD, approved 2026-11-10.
  - Phone 375 picker and six common sizes (BL-11, BL-12, BL-19): same canvas, boards a–f, "Phone 375 — six common sizes" and "Phone 375×548 — short phone", approved 2026-11-13.
  - F2 Frames on your wall (`/frame-sizes-on-wall`, T7): https://claude.ai/artifact/AzNYiLnMFAN8rg8eeMaXZX, approved 2026-11-15.
  - G1 Gallery wall planner (`/gallery-wall-planner`, T11): https://claude.ai/artifact/HGW1ti5mv6Mc8BqPRepXGd, approved 2026-11-16.
  - G1 v3 balanced layout and letter chips (BL-71, BL-72): same canvas, boards n–u (row "v3 (backlog-5)"), version 13, approved 2026-11-20.
  - T23 Chrome extension + T24 extension section and page (`/extensions/gallery-wall-layout-generator`): https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv, approved 2026-11-17 (also holds the v2 sample room and the G1 "change sizes" board).
  - T23 Chrome Web Store graphics (small promo tile, 128 store icon, three screenshots; 1x PNGs in `apps/extension/store/`): https://claude.ai/artifact/QwSKJm2AYhdU2mEUejMMkF, approved 2026-11-18.
  - T25 language picker (X1 header trigger, dialog, phone sheet, RTL): https://claude.ai/artifact/DkYgEZL6NprbwHUPYdoL5G, approved 2026-11-20 (phone: option A, globe-only button).
  - BL-76 mirrored pin picture for Arabic Chrome (board "m-rtl", variant of T23 board m; 375 and 1280 previews): https://claude.ai/artifact/XHTeX8iuNAKsHAZY7XqzoZ, approved 2026-11-21.
  - F3 How big is 8x10 (`/how-big-is-8x10`, T3): https://claude.ai/artifact/274YEEAkh69NAuaRf4vk6C, version 18, approved 2026-11-21 (sheet of paper offered only where it fits across the box).
  - F4 Measure a picture frame (`/measure-picture-frame`, T4): https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB, approved 2026-11-22 (all four measurements; a custom size names the nearest sizes below and above; metric frames A4, A3, 30x40, 40x50 and 50x70 cm, the closer size wins; a rounded moulding is measured flat from the front).
  - F5 Frame and mat calculator (`/frame-mat-calculator`, T5): https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp, approved 2026-11-23 (Q1–Q8 option A: exact size, pre-cut frames with their borders, next size up, square frames; reverse names the print below and the frame's own mat; 2 in default border; metric kept).
  - F6 Poster frame sizes (`/poster-frame-sizes`, T6): https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT, approved 2026-11-23 (Q1–Q10 option A: ten poster sizes with A3, A2, A1; custom size field; pre-cut frames plus any frame with a 1–4 in border; 27x40 gets the 2 in custom frame; no 24x30 or 30x40; "A2 frame" by name; painting section in copy; portrait/landscape switch; opens on 24x36 without a mat; one three-column table).
  - F7 Frame mockup (`/frame-mockup`, T8): https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf, approved 2026-11-24 (Q1–Q10 option A: 19 US sizes plus A3, A2, A1 turned to the artwork, each chip with its cut; an original sample artwork on 24x36, no mat, above the sofa; fill and drag; black, white, light oak, walnut at 1 in; sofa wall and plain wall, own photo on F2; v2 room colour; whole wall and close-up; free 2,400 px PNG, no watermark; No mat / Mat switch; frame-shape table linking Art print sizes).
  - T27 store-aware X1 and G1/F2 extension section (Chrome, Edge, Opera; `?store=edge|opera`): https://claude.ai/artifact/ME5xpbNULkbax27e4vRqqp, version 1795865330-7c91, approved 2026-11-28 (Q1 A: `?store=` first, then the browser's brands, then Chrome; Q2 A: Edge and Opera labels stay English in all 28 languages; Q3 B: browser-neutral X1 title and description, SEO guide changed first; Q4 A: Opera boards built only after T28 confirms its side panel).
  - Design system: https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5
- **Chrome Web Store listing (T23):** https://docs.google.com/document/d/1TMWz0VdN7widrUj8JASdWACttfJeCHBb8QQ2QbOwbL0/edit?tab=t.0 (Google Doc: name, short and long description, keyword tables with Times used). The only copy; the Tracker's "Chrome extension and wall tool" section links to it.
- **Microsoft Edge Add-ons listing kit (T27):** https://claude.ai/artifact/M9vqUC7riwoQ46wpsfYkSY (Claude Doc: package, long description with keyword table, search terms, Properties and Privacy answers, certification notes, graphics, publishing guide). Written for package 0.1.1.
- **Importance order (backlog-batch pass 1):** a wrong size or broken widget a visitor sees; then SEO defects on a live page (indexing, titles, canonical, Core Web Vitals); then ads/affiliate revenue leaks; then anything the next hub launch needs; then internal correctness and test gaps; polish last.
- **Required checks on `main`:** `check`, `e2e`, `validate`.
