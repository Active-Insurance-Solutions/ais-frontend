<script setup>
import { computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useViewStore } from '@/stores/useViewStore';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

/* One query for both view modes — same pattern as About/Services/FAQ/Contact.
 * The Plans page is a sequence of featureGrid documents (5 of them, one per
 * category). Modern view iterates them through sectionMap (FeatureGrid
 * renders each section unchanged). Classic view renders them inline with a
 * dark title bar + two-column plan list per section. */
const { data: page } = useSanity(pageQuery('/plans'));
const view = useViewStore();

/* Combine view mode + page-load state into one reveal trigger so the
 * observer re-scans both when the Sanity fetch resolves AND when toggling
 * back to modern view re-mounts its `.reveal` nodes. */
const revealTrigger = computed(
  () => `${view.mode}:${page.value ? 'loaded' : 'pending'}`,
);
useRevealObserver(revealTrigger);

const sections = computed(() => page.value?.sections || []);

/* Pull every featureGrid section (one per category). The order in `sections`
 * matches the Sanity document order, which is the seed-defined ordering:
 * Supplemental → Employer → Medicare → Individual → Life. */
const featureGrids = computed(() =>
  sections.value.filter((s) => s._type === 'featureGrid'),
);

/* Same pattern as the other classic pages: bump the title bar's top padding
 * in classic view so the heading clears HeaderClassic's fixed overlay. */
const titleBarTopPad = computed(() =>
  view.mode === 'classic' ? 'pt-8 min-[850px]:pt-32' : 'pt-8',
);
</script>

<template>
  <main class="page page--plans">
    <!-- ─── Classic view: title bar + stacked category sections ─── -->
    <template v-if="view.mode === 'classic'">
      <section
        class="bg-[var(--color-primary)] text-white text-center px-6 pb-8"
        :class="titleBarTopPad"
      >
        <h1 class="text-3xl font-bold m-0">Insurance Plans</h1>
      </section>

      <!-- One section per featureGrid in the Sanity document. Anchored by
           `anchorId` so the utility bar's deep links land here. -->
      <section
        v-for="grid in featureGrids"
        :key="grid._key"
        :id="grid.anchorId || undefined"
        class="py-12 px-6 scroll-mt-32"
      >
        <div class="max-w-5xl mx-auto">
          <!-- Navy square accent + dark title bar with the category name.
               Same accent/bar visual rhythm used on the FAQ classic rows. -->
          <div class="flex items-start gap-3 mb-6">
            <span
              aria-hidden="true"
              class="w-4 h-4 bg-[var(--color-primary)] rounded-sm mt-3.5 shrink-0"
            ></span>
            <h2
              class="flex-1 bg-gray-900 text-white text-lg md:text-xl font-bold px-5 py-3 rounded-lg m-0"
              style="font-family: var(--font-heading)"
            >
              {{ grid.heading }}
            </h2>
          </div>

          <!-- Two-column plan list. `pl-7` indents the grid under the title
               bar's text (accent w-4 + gap-3 = 28px), keeping a clean visual
               left rule. Stacks to one column below md. -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pl-0 md:pl-7">
            <p
              v-for="item in (grid.items || [])"
              :key="item._key"
              class="text-[var(--color-text-secondary)] leading-relaxed m-0"
            >
              <span class="uppercase font-bold text-[var(--color-primary)]">{{ item.title }}</span>
              <span class="mx-2 text-[var(--color-text-muted)]" aria-hidden="true">|</span>
              <span>{{ item.description }}</span>
            </p>
          </div>
        </div>
      </section>
    </template>

    <!-- ─── Modern view: original generic sections renderer ─── -->
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
