<script setup>
import { computed } from 'vue';
import { PortableText } from '@portabletext/vue';
import { useSanity } from '@/composables/useSanity';
import { useViewStore } from '@/stores/useViewStore';
import { sanityImage } from '@/composables/useSanityImage';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

/* Single query for both view modes. Modern view iterates `sections` straight
 * through sectionMap (the original behavior). Classic view derives its three
 * named regions — hero, team, mission — by filtering the same array client-
 * side, so we don't double-fetch when switching modes. */
const { data: page } = useSanity(pageQuery('/about'));

const view = useViewStore();

/* Modern view uses several section components that carry `.reveal` and rely
 * on IntersectionObserver to fade in. Two events need to trigger a re-scan:
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
const team = computed(() =>
  sections.value.filter((s) => s._type === 'splitSection'),
);
const mission = computed(
  () => sections.value.find((s) => s._type === 'textContent') || null,
);
const heroTitle = computed(() => hero.value?.title || 'Meet Our Team');

/* In classic view, HeaderClassic uses a layered fixed-positioning scheme:
 * a navy gradient backdrop (z-index 1, position: fixed, height 16rem) sits
 * over page content from the top of the viewport, and the tab row hangs at
 * top: 5rem with ~5rem of height. The header's `__spacer` only reserves the
 * utility bar's 5rem in document flow, so the next ~5rem of content gets
 * overlaid by the gradient + tabs.
 *
 * Modern view uses position: sticky (in flow) — no overlap.
 *
 * Bump the title bar's top padding only when the classic header is active
 * so the heading text clears the fixed overlay area. */
const titleBarTopPad = computed(() =>
  view.mode === 'classic' ? 'pt-8 min-[850px]:pt-32' : 'pt-8',
);

/* 160px square portrait → request 320px source for retina sharpness.
 * fit('max') preserves the original aspect ratio (no Sanity auto-crop). */
function portraitUrl(image) {
  if (!image) return '';
  return sanityImage(image).width(320).fit('max').auto('format').url();
}

/* The team's ctaUrl is always a "mailto:foo@bar" pattern in the seed.
 * Show the address itself rather than the ctaLabel ("Email C.J.") so each
 * row reads like a directory entry. Falls back to ctaLabel if the URL
 * isn't a mailto. */
function emailFromCta(url) {
  if (!url) return '';
  return url.startsWith('mailto:') ? url.slice(7) : '';
}
</script>

<template>
  <main class="page page--about">
    <!-- ─── Classic view: custom team-list + mission sidebar layout ─── -->
    <template v-if="view.mode === 'classic'">
      <!-- Compact navy title bar — full viewport width, outside the body grid's
           max-width wrapper. Top padding scales up to clear the classic
           header's fixed gradient + tab overlay. -->
      <section
        class="bg-[var(--color-primary)] text-white text-center px-6 pb-8"
        :class="titleBarTopPad"
      >
        <h1 class="text-3xl font-bold m-0">{{ heroTitle }}</h1>
      </section>

      <!-- Two-column body: team list (1fr) + sidebar (35%) on lg+,
           single column on mobile. -->
      <div class="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_35%] gap-12">
        <section aria-label="Team members">
          <article
            v-for="(m, i) in team"
            :key="m._key"
            class="flex flex-col sm:flex-row gap-6 items-start py-8"
            :class="i < team.length - 1 ? 'border-b border-[var(--color-border)]' : ''"
          >
            <img
              v-if="m.image"
              :src="portraitUrl(m.image)"
              :alt="m.imageAlt || m.heading"
              loading="lazy"
              class="w-40 h-40 rounded-lg object-cover object-top shrink-0"
            />
            <div class="min-w-0 flex-1">
              <h2 class="text-xl font-bold text-[var(--color-primary)] m-0">
                {{ m.heading }}
              </h2>
              <p v-if="m.eyebrow" class="text-sm text-[var(--color-text-muted)] mt-1 mb-3 m-0">
                {{ m.eyebrow }}
              </p>
              <a
                v-if="m.ctaUrl && m.ctaUrl.startsWith('mailto:')"
                :href="m.ctaUrl"
                class="text-sm text-[var(--color-secondary)] block mb-3 hover:underline"
              >{{ emailFromCta(m.ctaUrl) }}</a>
              <p v-if="m.body" class="text-[var(--color-text-secondary)] leading-relaxed m-0">
                {{ m.body }}
              </p>
            </div>
          </article>
        </section>

        <!-- Sidebar: mission PortableText. The contact CTA lives in the
             sitewide pre-footer block, so no separate CTA card here. -->
        <aside>
          <div
            v-if="mission?.body"
            class="rounded-lg p-6 bg-[var(--color-primary)] text-white about-mission"
          >
            <h2 v-if="mission.heading" class="text-2xl font-bold text-white mt-0 mb-4">
              {{ mission.heading }}
            </h2>
            <PortableText :value="mission.body" />
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

<style scoped>
/* PortableText renders <p> tags as children of the navy mission block;
 * give them comfortable spacing inside the dark card. */
.about-mission :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}
.about-mission :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
