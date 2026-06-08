<script setup lang="ts">
import { RouterView } from 'vue-router';
import SiteLayout from '@/components/layout/SiteLayout.vue';
</script>

<template>
  <SiteLayout>
    <!-- Suspense boundary: lets page components use top-level await in
         script-setup for Sanity prefetch. vite-ssg waits for Suspense to
         resolve before rendering the static HTML, so the prerendered output
         contains full page content (not just meta tags). The fallback shows
         during client-side navigations between routes. -->
    <Suspense>
      <RouterView />
      <template #fallback>
        <div class="route-loading" aria-label="Loading page">
          <div class="route-loading__ring"></div>
        </div>
      </template>
    </Suspense>
  </SiteLayout>
</template>

<style scoped>
.route-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50dvh;
  padding: 4rem 1.5rem;
}

.route-loading__ring {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: routeRingSpin 0.8s linear infinite;
}

@keyframes routeRingSpin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading__ring {
    animation: none;
    border-top-color: var(--color-border);
    opacity: 0.5;
  }
}
</style>
