# Backlog

Open items only. When one ships, **delete it**: its history lives in git and in the spec or
change that fixed it. The detail belongs in the linked spec or source; this file is the lean
index of what's left, grouped by area. Every item has the same shape:

```
- **[BL-nn] <Title>** — <what to do + why it matters, 1–2 sentences>.
  _Refs:_ `<spec / change / source>` · _Status:_ open | gated — <blocker> | deferred — <trigger>
```

**Ids** are `BL-nn` and **monotonic**. A new item takes the number on the `_Next id:_` line
below and bumps that line by one. Do not use the highest id still in the file, because it falls
every time a shipped item is deleted. Ids are **never reused**, so a `BL-nn` in a commit message
or an archived change always means the same item.

_Next id:_ **BL-2**

**Status** is one of: **open** (actionable now), **gated — X** (blocked on a named decision or
dependency), **deferred — X** (waiting on purpose for a named trigger). Split a multi-part item
into separate items rather than letting one grow into a paragraph.

**What goes here and what doesn't.** Work that a named later change already owns goes in the
Tracker, not here. This file holds what no change owns yet: phase-review findings left unfixed,
and defects or gaps found along the way that are worth fixing later. CLAUDE.md ("Backlog") says
when to add and when to fold items in.

## Tooling

- **[BL-1] Drop the TypeScript 6 alias** — `typescript` is aliased to `@typescript/typescript6` only because
  typescript-eslint lacks TS 7 support; once it ships, depend on plain `typescript@^7` and remove
  `@typescript/native`, so `tsc`, Next.js and eslint use one compiler.
  _Refs:_ `package.json`, https://github.com/typescript-eslint/typescript-eslint/issues/10940 · _Status:_ deferred — a
  typescript-eslint release that supports TS 7.1

## Site

## Widgets
