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
     * Minimal config: error capture only. No replay or performance tracing,
     * which keeps the bundle small and free-tier quota usage low. Wire those
     * in later if you actually need them. */
    if (isClient && import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      Sentry.init({
        app,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.VITE_SANITY_DATASET || 'production',
        // Drop noisy errors that aren't actionable (browser extensions,
        // network blips from ad blockers, etc.). Extend as patterns surface.
        integrations: [
          Sentry.replayIntegration()
        ],
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
