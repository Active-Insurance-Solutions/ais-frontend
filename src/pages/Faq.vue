<script setup>
import { computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useSanityAsync } from '@/composables/useSanity';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

const { data: page } = await useSanityAsync(pageQuery('/faq'));
useRevealObserver(page);

/* FAQPage JSON-LD — eligibility for Google's expandable Q&A rich result
 * in SERPs. Sourced from the same Sanity faqSection that drives the
 * on-page rendering, so editors only maintain one place.
 *
 * Because the page now uses useSanityAsync, page.value is populated at
 * SSG render time → the FAQPage schema gets baked into the prerendered
 * HTML directly, no JS-pass required for Google to see it. */
const faqItems = computed(() => {
  const faq = page.value?.sections?.find((s) => s._type === 'faqSection');
  return faq?.items ?? [];
});

useHead({
  script: computed(() => {
    if (!faqItems.value.length) return [];
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.value.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    };
    return [{ type: 'application/ld+json', innerHTML: JSON.stringify(schema) }];
  }),
});
</script>

<template>
  <main class="page page--faq">
    <template v-for="section in (page?.sections || [])" :key="section._key">
      <component :is="sectionMap[section._type]" v-if="sectionMap[section._type]" :section="section" />
    </template>
  </main>
</template>
