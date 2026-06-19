import { ViteSSG } from 'vite-ssg';
import { createPinia } from 'pinia';
import * as Sentry from '@sentry/vue';
import App from './App.vue';
import { routes, scrollBehavior } from './router';
import './assets/styles/main.css';

/* ViteSSG wraps createApp and handles router construction + head management
 * (via @unhead/vue) automatically. At build time the static routes get
 * prerendered to dist/{route}/index.html with their useSeo()-generated meta
 * tags + Sanity-fetched page body (via useSanityAsync + <Suspense>) baked
 * in — so social previews, JSON-LD schema, and Google's older crawlers all
 * see the right content even before any JS runs. */
export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  ({ app }) => {
    /* vite-ssg deprecated the `isClient` callback arg in favor of the
     * standard Vite SSR flag. Same semantics — true in the browser, false
     * during SSG prerender. */
    const isClient = !import.meta.env.SSR;

    app.use(createPinia());

    /* Sentry — client-side error monitoring. Initialized only when:
     *   - We're in the browser (not during SSG prerender)
     *   - The build is production (skips dev where rebuild errors are noisy)
     *   - A DSN is configured (so a missing env var doesn't crash init)
     * Errors + replay-on-error are on; performance tracing and session
     * sampling are off so we stay inside the free-tier monthly quotas.
     * VITE_SENTRY_ENVIRONMENT is set per Netlify deploy context so the
     * Sentry environment field reflects production vs. staging vs. preview
     * (decoupled from VITE_SANITY_DATASET, which we keep on `staging`
     * everywhere for content workflow reasons). */
    if (isClient && import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      Sentry.init({
        app,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
        integrations: [Sentry.replayIntegration()],
        // Drop noisy errors that aren't actionable (browser extensions,
        // network blips from ad blockers, etc.). Extend as patterns surface.
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
      });
    }

    if (isClient) {
      // Space-to-click for keyboard accessibility on <a> tags. Native anchors
      // only respond to Enter; this gives them Space parity with <button>.
      // Browser-only — wrapped in isClient guard so it doesn't try to touch
      // `document` during SSG prerender.
      document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && e.target instanceof HTMLAnchorElement) {
          e.preventDefault();
          e.target.click();
        }
      });
    }
  },
);
