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
    sourcemap: true,
  },
});
