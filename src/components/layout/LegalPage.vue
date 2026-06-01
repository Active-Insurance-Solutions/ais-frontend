<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { PortableText } from '@portabletext/vue';

const route = useRoute();
// Derive the legalPage slug from the current path (e.g. "/privacy-policy" → "privacy-policy").
// The router doesn't pass props, so this is the single source of truth.
const slug = computed(() => route.path.replace(/^\//, '').replace(/\/$/, ''));
const fallbackTitle = computed(() => String(route.name || ''));

const page = ref(null);
const loading = ref(true);

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

// Re-fetch whenever the slug changes. The router reuses this same component
// across all three legal routes, so onMounted only fires once — without this
// watcher, navigating between legal pages leaves stale content on screen.
async function loadPage(currentSlug) {
  if (!projectId) { loading.value = false; return; }
  loading.value = true;
  page.value = null;
  try {
    const query = encodeURIComponent(`*[_type == "legalPage" && slug.current == "${currentSlug}"][0]{ title, lastUpdated, body }`);
    const res = await fetch(`https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
    const json = await res.json();
    page.value = json.result || null;
  } catch (e) {
    console.error('Failed to fetch legal page:', e);
  } finally {
    loading.value = false;
  }
}

watch(slug, loadPage, { immediate: true });
</script>

<template>
  <main class="page max-w-3xl mx-auto px-6 py-16">
    <div v-if="loading" class="text-center py-24">
      <p class="text-[var(--color-text-secondary)] text-sm">Loading...</p>
    </div>

    <template v-else-if="page">
      <h1 class="text-4xl font-bold text-[var(--color-text)] mb-4">{{ page.title }}</h1>
      <div class="legal-content text-[var(--color-text-secondary)]">
        <p v-if="page.lastUpdated" class="mb-8 text-sm"><strong>Last updated:</strong> {{ new Date(page.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
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
.legal-content :deep(h2) {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.legal-content :deep(h3) {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 1.5rem;
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
