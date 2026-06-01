<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useSanity } from '@/composables/useSanity';
import { useViewStore } from '@/stores/useViewStore';
import { sanityImage } from '@/composables/useSanityImage';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

/* One query for both view modes. Modern view iterates `sections` straight
 * through sectionMap (the original behavior). Classic view derives hero +
 * items by filtering the same array client-side, so we don't double-fetch
 * when switching modes. */
const { data: page } = useSanity(pageQuery('/services'));

const view = useViewStore();

/* Modern view's section components carry `.reveal` and rely on the
 * IntersectionObserver to fade in. Two events need to trigger a re-scan:
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
const featureGrid = computed(
  () => sections.value.find((s) => s._type === 'featureGrid') || null,
);

const heroTitle = computed(() => hero.value?.title || 'What We Cover');
const heroSubtitle = computed(
  () => hero.value?.subtitle || 'Insurance with Clarity',
);
const items = computed(() => featureGrid.value?.items || []);
const photoUrl = computed(() => {
  const img = hero.value?.image;
  return img ? sanityImage(img).width(800).fit('max').auto('format').url() : '';
});
const photoAlt = computed(
  () => hero.value?.imageAlt || 'Active Insurance Solutions',
);

/* Same pattern as About.vue: HeaderClassic's fixed gradient + tab overlay
 * covers the first ~10rem of page content past the spacer. Bump the title
 * bar's top padding so the heading clears the overlay in classic view; modern
 * (sticky) view keeps the standard 2rem. */
const titleBarTopPad = computed(() =>
  view.mode === 'classic' ? 'pt-8 min-[850px]:pt-32' : 'pt-8',
);

/* Service titles map 1:1 to the anchor IDs on /plans (see the utility-bar
 * quick links in seed.ts L588-592). Slugifying the title produces the same
 * anchor each time without needing a separate field in Sanity. */
function plansAnchor(title) {
  if (!title) return '/plans';
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `/plans#${slug}`;
}
</script>

<template>
  <main class="page page--services">
    <!-- ─── Classic view: custom two-column layout ─── -->
    <template v-if="view.mode === 'classic'">
      <!-- Compact navy title bar — heading + subtitle. Top padding scales up
           to clear the classic header's fixed overlay. -->
      <section
        class="bg-[var(--color-primary)] text-white text-center px-6 pb-8"
        :class="titleBarTopPad"
      >
        <h1 class="text-3xl font-bold m-0">{{ heroTitle }}</h1>
        <p class="text-base opacity-90 mt-2 m-0">{{ heroSubtitle }}</p>
      </section>

      <!-- Two-column body: services list (1fr) + brand-photo column (1fr)
           on lg+, single column on mobile. -->
      <div class="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section aria-label="Services we offer" class="space-y-6">
          <article
            v-for="item in items"
            :key="item._key"
            class="flex gap-4 items-start"
          >
            <span
              aria-hidden="true"
              class="w-3 h-3 mt-2 shrink-0 bg-[var(--color-primary)] rounded-sm"
            ></span>
            <div class="min-w-0 flex-1">
              <h2 class="text-lg font-bold m-0 mb-2">
                <RouterLink
                  :to="plansAnchor(item.title)"
                  class="text-[var(--color-primary)] hover:underline"
                >{{ item.title }}</RouterLink>
              </h2>
              <p class="text-[var(--color-text-secondary)] leading-relaxed m-0">
                {{ item.description }}
              </p>
            </div>
          </article>
        </section>

        <aside class="space-y-6">
          <!-- Main photo, with a navy/secondary gradient fallback when no
               image is set on services-hero. -->
          <div class="aspect-[4/3] rounded-lg overflow-hidden">
            <img
              v-if="photoUrl"
              :src="photoUrl"
              :alt="photoAlt"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full"
              style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
              aria-hidden="true"
            ></div>
          </div>

          <!-- "Insurance with Clarity" callout — navy block echoing the
               title bar's promise. Uses the same subtitle so a CMS edit
               flows through one place. The contact CTA lives in the sitewide
               pre-footer block, so no separate CTA card here. -->
          <div
            class="rounded-lg p-6 bg-[var(--color-primary)] text-white text-center"
          >
            <p
              class="text-2xl font-bold m-0"
              style="font-family: var(--font-heading)"
            >{{ heroSubtitle }}</p>
          </div>
        </aside>
      </div>
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
