<script setup>
import { computed } from 'vue';
import { PortableText } from '@portabletext/vue';

const props = defineProps({ section: { type: Object, default: null } });

/* Centered "card" variant — matches the visual treatment of the icon cards
 * in FeatureGrid (smaller bold title, muted secondary body, all centered).
 * Used by /services to render Dental and Vision Plans as a visual sibling
 * of the four service-category cards. Default (centered: false) is the
 * left-aligned long-form treatment used by /about's mission block. */
const centered = computed(() => !!props.section?.centered);
</script>

<template>
  <section v-if="section?.heading || section?.body" class="py-16 px-6 bg-[var(--color-bg)]">
    <div :class="centered ? 'max-w-3xl mx-auto text-center' : 'max-w-3xl mx-auto'">
      <h2
        v-if="section?.heading"
        :class="centered
          ? 'text-lg font-semibold text-[var(--color-text)] mb-3'
          : 'text-3xl font-bold text-[var(--color-text)] mb-6'"
      >{{ section.heading }}</h2>
      <div
        v-if="section?.body"
        :class="centered
          ? 'text-[var(--color-text-secondary)] text-sm leading-relaxed text-content-card'
          : 'legal-content text-[var(--color-text-secondary)]'"
      >
        <PortableText :value="section.body" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Paragraph spacing for the centered card variant only — PortableText
 * emits raw <p> tags, which would otherwise run together without margins.
 * Scoped to .text-content-card so the existing left-aligned variant
 * (e.g. About mission) keeps its current paragraph styling. */
.text-content-card :deep(p) {
  margin-bottom: 1rem;
}
.text-content-card :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
