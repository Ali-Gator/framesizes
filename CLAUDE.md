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
  - Design system: https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5
- **Importance order (backlog-batch pass 1):** a wrong size or broken widget a visitor sees; then SEO defects on a live page (indexing, titles, canonical, Core Web Vitals); then ads/affiliate revenue leaks; then anything the next hub launch needs; then internal correctness and test gaps; polish last.
- **Required checks on `main`:** `check`, `e2e`, `validate`.
