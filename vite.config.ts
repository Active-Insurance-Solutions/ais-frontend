import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    /* Sentry source-map upload: produced .map files are uploaded so Sentry
     * can show readable stack traces, then deleted from `dist` so they
     * don't ship to the public bundle. Auth happens via the
     * SENTRY_AUTH_TOKEN env var (Netlify) or .env.sentry-build-plugin
     * (local). Without a token the plugin warns and skips upload; the
     * build still succeeds. */
    sentryVitePlugin({
      org: 'active-insurance-solutions-sp',
      project: 'javascript-vue',
      sourcemaps: {
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    /* 'hidden' generates source maps in dist/ (so the Sentry plugin can
     * upload them) but strips the `//# sourceMappingURL=...` comment from
     * each bundle. Combined with the plugin's filesToDeleteAfterUpload,
     * this means: maps reach Sentry → maps don't ship publicly → browsers
     * never try to fetch missing .map files → no 404 noise in DevTools. */
    sourcemap: 'hidden',
  },
});
