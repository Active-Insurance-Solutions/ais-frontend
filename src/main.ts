import { ViteSSG } from 'vite-ssg';
import { createPinia } from 'pinia';
import App from './App.vue';
import { routes, scrollBehavior } from './router';
import './assets/styles/main.css';

/* ViteSSG wraps createApp and handles router construction + head management
 * (via @unhead/vue) automatically. At build time the static routes get
 * prerendered to dist/{route}/index.html with their useSeo()-generated meta
 * tags baked in — so social previews, JSON-LD schema, and Google's older
 * crawlers all see the right meta even before any JS runs.
 *
 * The Sanity-fetched body content (legal page bodies, team list, partner
 * logos, etc.) still loads on the client after hydration — only the static
 * meta layer is prerendered. That's the goal: cheap social/SEO win without
 * wiring async data fetching into the SSG pipeline. */
export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  ({ app, isClient }) => {
    app.use(createPinia());

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
