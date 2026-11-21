import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

/**
 * Page views (and Web Vitals, a PostHog project setting) without cookies or browser storage,
 * sent through the site's own `/ingest` proxy (next.config.ts). No token, no analytics: CI and tests.
 * {@link openspec/specs/site-shell/spec.md#requirement-visits-are-measured-without-cookies}
 */
if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-08-30",
    cookieless_mode: "always",
    autocapture: false,
    disable_session_recording: true,
    // Pinned here, not left to the project's remote settings, so the Privacy Policy stays true
    // whatever the PostHog dashboard says (t26 review).
    enable_heatmaps: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    disable_surveys: true,
    disable_scroll_properties: true,
  });
}
