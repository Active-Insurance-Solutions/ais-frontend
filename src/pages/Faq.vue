<script setup>
import { computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useSanity } from '@/composables/useSanity';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

const { data: page } = useSanity(pageQuery('/faq'));
useRevealObserver(page);

/* FAQPage JSON-LD — eligibility for Google's expandable Q&A rich result
 * in SERPs. Sourced from the same Sanity faqSection that drives the
 * on-page rendering, so editors only maintain one place.
 *
 * Note: emitted client-side after the Sanity fetch resolves, so the
 * initial SSG HTML doesn't contain it. Modern Googlebot runs JS on a
 * second indexing pass and will pick it up. If we later move FAQ items
 * into the SSG prefetch, this same code will bake the JSON-LD into the
 * initial HTML automatically. */
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
