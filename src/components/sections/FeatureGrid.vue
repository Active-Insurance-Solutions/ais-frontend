<script setup>
import { computed } from 'vue';
import {
  ShieldPlus, Briefcase, Users, Heart,
  Smile, Eye, ShieldAlert, Activity, Home,
  ShieldCheck, Handshake, ListChecks,
  Pill, FilePlus,
  MapPin,
  Clock, Sliders,
} from 'lucide-vue-next';

const props = defineProps({ section: { type: Object, default: null } });
const features = computed(() => props.section?.items || []);

/* Column layout — honors an explicit `cols` override on the section if set
 * (used by the /services Ancillary & Supplemental Coverage section to force
 * 2-col for 5 items per client direction). Falls back to the original
 * heuristic when unset so existing sections render unchanged. */
const gridColsClass = computed(() => {
  const cols = props.section?.cols;
  if (cols === 2) return 'md:grid-cols-2';
  if (cols === 3) return 'md:grid-cols-3';
  if (cols === 4) return 'md:grid-cols-4';
  return features.value.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3';
});

const gridVariantClass = computed(() =>
  props.section?.cols === 2 ? 'feature-grid--cols-2' : '',
);

// Maps each item title to a Lucide icon. Covers all 19 items rendered by the
// /services (4) and /plans (15) pages. New CMS-authored items not in this map
// fall back to the studio icon-picker SVG if one was set.
const ICON_MAP = {
  // Services page
  'Supplemental Plans': ShieldPlus,
  'Employer Benefit Solutions': Briefcase,
  'Individual and Family Insurance Plans': Users,
  'Life Insurance': Heart,
  // Plans page — Supplemental
  'Dental Plans': Smile,
  'Vision Plans': Eye,
  'Accident Plans': ShieldAlert,
  'Short-Term & Long-Term Disability Plans': Activity,
  'Long-Term Care Plans': Home,
  // Plans page — Employer Benefit Solutions
  'Better Health & Protection': ShieldCheck,
  'Personal Assistance': Handshake,
  'More Choices Than Ever': ListChecks,
  // Plans page — Medicare
  'Medicare Part D': Pill,
  'Medicare Supplement Plans': FilePlus,
  // Plans page — Individual and Family
  'Connect for Health Colorado': MapPin,
  'Family Plans': Users,
  // Plans page — Life Insurance
  'Term Life Insurance': Clock,
  'Whole Life Insurance': Heart,
  'Universal Life Insurance': Sliders,
};

function iconFor(title) {
  return ICON_MAP[(title || '').trim()] || null;
}
</script>

<template>
  <section
    :id="section?.anchorId || undefined"
    class="reveal py-16 px-6 bg-[var(--color-bg)] feature-grid"
  >
    <div v-if="section?.heading" class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-[var(--color-text)] text-center mb-12">{{ section.heading }}</h2>
    </div>
    <div
      v-if="features.length"
      class="reveal-stagger max-w-5xl mx-auto grid grid-cols-1 gap-8"
      :class="[gridColsClass, gridVariantClass]"
    >
      <div v-for="(feature, i) in features" :key="i" class="text-center p-6">
        <div class="mb-4 flex justify-center" aria-hidden="true">
          <component
            v-if="iconFor(feature.title)"
            :is="iconFor(feature.title)"
            :size="28"
            :stroke-width="1.75"
            class="feature-icon-lucide"
          />
          <div
            v-else-if="feature.icon?.svg"
            class="text-4xl feature-icon-cms"
            v-html="feature.icon.svg"
          ></div>
        </div>
        <h3 class="text-lg font-semibold text-[var(--color-text)] mb-2">{{ feature.title }}</h3>
        <p class="text-[var(--color-text-secondary)] text-sm">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Lucide icons use currentColor — color cascades from the parent. */
.feature-icon-lucide { color: var(--color-accent); }
/* CMS icon-picker fallback for items not in the Lucide map (e.g. future additions). */
.feature-icon-cms :deep(svg) { width: 2.5rem; height: 2.5rem; margin: 0 auto; color: var(--color-primary); }
.feature-grid[id] { scroll-margin-top: 100px; }

/* When a 2-column grid has an odd number of items, the last cell would
 * otherwise sit alone in the left column. Span it across both columns and
 * cap its width back to the same single-column dimensions so the card
 * stays the same size — just centered. Applies only at md+ where the
 * grid actually has 2 columns; at mobile (grid-cols-1) the selector still
 * matches but max-width: 100% is a no-op. */
@media (min-width: 768px) {
  .feature-grid--cols-2 > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
    max-width: calc(50% - 1rem);
    margin-inline: auto;
  }
}
</style>
