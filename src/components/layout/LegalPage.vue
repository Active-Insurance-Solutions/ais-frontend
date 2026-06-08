<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { PortableText } from '@portabletext/vue';
import { useSanityAsync } from '@/composables/useSanity';

const route = useRoute();
const slugFromPath = (p) => p.replace(/^\//, '').replace(/\/$/, '');

function legalQuery(s) {
  return `*[_type == "legalPage" && slug.current == "${s}"][0]{ title, lastUpdated, body }`;
}

/* Initial fetch — awaits inline so vite-ssg bakes the legal-page body into
 * the prerendered HTML. Each of /privacy-policy, /terms-and-conditions,
 * and /accessibility gets its own static HTML file with the right content
 * (vite-ssg renders each route in its own component instance). */
const { data: page } = await useSanityAsync(legalQuery(slugFromPath(route.path)));
const loading = ref(false);

const fallbackTitle = computed(() => String(route.name || ''));

/* Sanity stores legalPage.lastUpdated as an ISO date string ("2026-06-08").
 * `new Date(str)` interprets that as UTC midnight; without timeZone: 'UTC'
 * in the formatter, it would render in the viewer's local TZ and resolve
 * to the previous day for anyone west of UTC (e.g. MDT → June 7 instead
 * of June 8). Forcing the format to use UTC components round-trips the
 * original value regardless of viewer locale. */
const formattedLastUpdated = computed(() => {
  if (!page.value?.lastUpdated) return '';
  return new Date(page.value.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
});

/* Vue Router reuses this same component instance across all three legal
 * routes — script-setup's await only runs on initial mount, not on
 * subsequent in-app navigations (e.g. clicking Privacy → Terms in the
 * footer). Watch the slug and re-fetch imperatively for those. immediate
 * is left at the default `false` so we don't double-fetch what the await
 * already returned at mount. */
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

async function refetch(slug) {
  if (!projectId) return;
  loading.value = true;
  try {
    const query = encodeURIComponent(legalQuery(slug));
    const res = await fetch(
      `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
    );
    const json = await res.json();
    page.value = json.result || null;
  } catch (e) {
    console.error('Failed to fetch legal page:', e);
    page.value = null;
  } finally {
    loading.value = false;
  }
}

watch(
  () => slugFromPath(route.path),
  (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) refetch(newSlug);
  },
);
</script>

<template>
  <main class="page max-w-3xl mx-auto px-6 py-16">
    <div v-if="loading" class="text-center py-24">
      <p class="text-[var(--color-text-secondary)] text-sm">Loading...</p>
    </div>

    <template v-else-if="page">
      <h1 class="text-4xl font-bold text-[var(--color-text)] mb-4">{{ page.title }}</h1>
      <div class="legal-content text-[var(--color-text-secondary)]">
        <p v-if="formattedLastUpdated" class="mb-8 text-sm"><strong>Last updated:</strong> {{ formattedLastUpdated }}</p>
        <PortableText v-if="page.body" :value="page.body" />
      </div>
    </template>

    <template v-else>
      <h1 class="text-4xl font-bold text-[var(--color-text)] mb-4">{{ fallbackTitle }}</h1>
      <div class="legal-content">
        <p class="text-[var(--color-text-secondary)]">This page has not been set up yet. Please add content in the CMS.</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
/* Heading scale — six distinct steps so PortableText h2..h6 styles set
 * via Studio always render with a clear visual hierarchy. Layout strategy:
 *   h2-h4: Merriweather serif, sentence case, descending size
 *   h5-h6: Inter sans-serif, uppercase, descending size + tracking
 * The serif → uppercase-sans switch at h5 gives an unmissable break even
 * when consecutive heading levels are visually close in size.
 *
 * Margin-top scales with prominence so deeper headings sit closer to
 * their surrounding text; margin-bottom is uniform at 0.5rem. */
.legal-content :deep(h2) {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.25;
  margin-top: 3rem;
  margin-bottom: 1rem;
}
.legal-content :deep(h3) {
  font-family: var(--font-heading);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
}
.legal-content :deep(h4) {
  font-family: var(--font-heading);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.35;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}
.legal-content :deep(h5) {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.legal-content :deep(h6) {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.legal-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.65;
}
.legal-content :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.legal-content :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.legal-content :deep(li) {
  margin-bottom: 0.4rem;
  line-height: 1.6;
}
</style>
