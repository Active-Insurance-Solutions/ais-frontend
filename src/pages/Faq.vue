<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useViewStore } from '@/stores/useViewStore';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

/* One query for both view modes. Modern view iterates `sections` straight
 * through sectionMap (the original FaqSection accordion behavior — click
 * to open one question at a time). Classic view renders ALL answers
 * always-expanded inline, matching the original site's reading-list layout
 * (no click-to-open, no JS state, every answer visible immediately). */
const { data: page } = useSanity(pageQuery('/faq'));

const view = useViewStore();

/* Modern view's FaqSection (and other reveal-based sections, transitively)
 * relies on the IntersectionObserver to fade in `.reveal` nodes. Two events
 * need to trigger a re-scan:
 *  1. Sanity fetch resolves and the modern template mounts its sections.
 *  2. User toggles classic → modern, which UN-mounts the modern branch then
 *     re-mounts it with fresh `.reveal` nodes (no `.is-visible` class).
 * Combining both into one computed string ref makes the watch in
 * useRevealObserver fire on either signal. */
const revealTrigger = computed(
  () => `${view.mode}:${page.value ? 'loaded' : 'pending'}`,
);
useRevealObserver(revealTrigger);

const sections = computed(() => page.value?.sections || []);
const hero = computed(
  () => sections.value.find((s) => s._type === 'heroSection') || null,
);
const faqSection = computed(
  () => sections.value.find((s) => s._type === 'faqSection') || null,
);
const heroTitle = computed(
  () => hero.value?.title || 'Frequently Asked Questions',
);
const items = computed(() => faqSection.value?.items || []);

/* Same pattern as About/Services: HeaderClassic's fixed gradient + tab
 * overlay covers the first ~10rem past the spacer. Bump the title bar's
 * top padding only in classic view; modern (sticky) view keeps pt-8. */
const titleBarTopPad = computed(() =>
  view.mode === 'classic' ? 'pt-8 min-[850px]:pt-32' : 'pt-8',
);

/* Same plain-text → paragraph/list parser FaqSection uses. The answer field
 * in Sanity is plain text with \n\n paragraph separators; this turns each
 * paragraph into either a <p> or, when every line starts with • or -, a
 * <ul>. */
function parseAnswer(text) {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return null;
      const looksLikeList = lines.every((l) => /^[•\-]\s+/.test(l));
      if (looksLikeList) {
        return {
          type: 'list',
          items: lines.map((l) => l.replace(/^[•\-]\s+/, '')),
        };
      }
      return { type: 'para', text: lines.join(' ') };
    })
    .filter(Boolean);
}
</script>

<template>
  <main class="page page--faq">
    <!-- ─── Classic view: navy title bar + custom styled accordion ─── -->
    <template v-if="view.mode === 'classic'">
      <section
        class="bg-[var(--color-primary)] text-white text-center px-6 pb-8"
        :class="titleBarTopPad"
      >
        <h1 class="text-3xl font-bold m-0">{{ heroTitle }}</h1>
      </section>

      <!-- FAQ list. Each row: navy square accent + navy question bar +
           always-rendered answer. No accordion behavior in classic view —
           all answers visible at once for skimmable reading. -->
      <section v-if="items.length" class="py-12 px-6">
        <div class="max-w-3xl mx-auto">
          <ul class="list-none p-0 m-0 space-y-8">
            <li
              v-for="(item, idx) in items"
              :key="item._key || idx"
              class="flex items-start gap-3"
            >
              <span
                aria-hidden="true"
                class="w-4 h-4 bg-[var(--color-primary)] rounded-sm mt-3.5 shrink-0"
              ></span>
              <div class="flex-1 min-w-0">
                <!-- Static question bar — no button, no toggle. Semantic h3
                     since the page's h1 is in the navy title bar above. -->
                <h3
                  class="bg-[var(--color-primary)] text-white text-left font-bold px-5 py-3 rounded-lg text-sm md:text-base m-0"
                >
                  {{ item.question }}
                </h3>
                <div class="px-5 py-4 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  <template
                    v-for="(block, i) in parseAnswer(item.answer)"
                    :key="i"
                  >
                    <ul
                      v-if="block.type === 'list'"
                      class="list-disc pl-5 my-3 space-y-1.5"
                    >
                      <li v-for="(li, j) in block.items" :key="j">{{ li }}</li>
                    </ul>
                    <p v-else class="mb-3 last:mb-0">{{ block.text }}</p>
                  </template>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <!-- ─── Modern view: original generic sections renderer (uses
         FaqSection unchanged) ─── -->
    <template v-else>
      <template v-for="section in sections" :key="section._key">
        <component
          :is="sectionMap[section._type]"
          v-if="sectionMap[section._type]"
          :section="section"
        />
      </template>
    </template>
  </main>
</template>
