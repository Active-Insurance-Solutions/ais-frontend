<script setup>
import { useSanityAsync } from '@/composables/useSanity';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

// Top-level await — vite-ssg waits for this to resolve via the <Suspense>
// boundary in App.vue, so the prerendered HTML contains the full home-page
// section tree (hero, partner logos, etc.) not just meta tags.
const { data: page } = await useSanityAsync(pageQuery('/'));
useRevealObserver(page);
</script>

<template>
  <main class="page page--home">
    <template v-for="section in (page?.sections || [])" :key="section._key">
      <component :is="sectionMap[section._type]" v-if="sectionMap[section._type]" :section="section" />
    </template>
  </main>
</template>
