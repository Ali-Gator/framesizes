# Spec-to-Source Mapping

Each row maps a capability to the source paths it covers; its spec is at `openspec/specs/<capability>/spec.md`. The `check-spec-exists` hook uses this table to enforce Spec -> Tests -> Code.

The second column is parsed, not read: comma-separated globs and nothing else. Notes go under the table.

| Capability   | Source path globs                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seo-base`   | apps/web/src/lib/site-map.ts, apps/web/src/lib/seo.ts, apps/web/src/app/robots.ts, apps/web/src/app/sitemap.ts, apps/web/src/app/opengraph-image.tsx, apps/web/src/components/site/page-link.tsx                                                                                                                                                              |
| `site-shell` | apps/web/src/app/layout.tsx, apps/web/src/app/not-found.tsx, apps/web/src/components/site/site-header.tsx, apps/web/src/components/site/hub-nav.tsx, apps/web/src/components/site/site-footer.tsx, apps/web/src/components/site/unit-toggle.tsx, apps/web/src/components/site/logo-mark.tsx, apps/web/src/lib/unit.ts, apps/web/src/instrumentation-client.ts |

Rows never overlap and every row matches a file: {@link openspec/specs/spec-workflow/spec.md#requirement-mapping-rows-never-overlap}. Each capability owns its own folder, so row order never matters.

Config files (`*.config.*`) are spec-exempt, so no row lists them even when a capability owns them. A capability whose sources are all spec-exempt (scripts, config, workflow YAML, docs) has no row: `constitution` and `spec-workflow` are enforced by tests under `scripts/__tests__/`.

Add a capability's row when its change is archived: until its permanent spec exists, a row would block every edit to its paths.
