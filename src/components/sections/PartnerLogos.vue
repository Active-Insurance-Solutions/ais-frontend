<script setup>
import { computed } from 'vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });
const logos = computed(() => props.section?.logos || []);

// Slug the carrier name so CSS can target specific logos. Used to give
// non-standard-aspect logos (very wide / square) extra room in their cell.
function logoKey(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
</script>

<template>
  <section v-if="logos.length" class="py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-6xl mx-auto">
      <div v-if="section?.heading || section?.subheading" class="text-center mb-12">
        <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)] mb-3">{{ section.heading }}</h2>
        <p v-if="section?.subheading" class="text-[var(--color-text-secondary)] text-base">{{ section.subheading }}</p>
      </div>
      <ul class="partner-logos__grid">
        <li
          v-for="logo in logos"
          :key="logo._key"
          :data-logo="logoKey(logo.name)"
          class="partner-logos__item"
        >
          <component
            :is="logo.url ? 'a' : 'div'"
            v-bind="logo.url ? { href: logo.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
            :style="logo.image ? { backgroundImage: `url(${sanityImage(logo.image).width(480).auto('format').url()})` } : null"
            class="partner-logos__cell"
            role="img"
            :aria-label="logo.name"
          >
            <span v-if="!logo.image" class="partner-logos__fallback">{{ logo.name }}</span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.partner-logos__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem;
  align-items: center;
  justify-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 640px) {
  .partner-logos__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  /* 4 columns at large screens — 11 logos render as 4+4+3 */
  .partner-logos__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.partner-logos__item {
  width: 100%;
  max-width: 14rem;
}

/* Logos are rendered as CSS background-images rather than <img> tags. This
 * sidesteps the well-known flex-item + replaced-element + global `img` reset
 * interactions that caused inconsistent sizing in our earlier attempts.
 *
 * - background-size: contain → image is scaled to fit, preserving aspect
 * - background-origin: content-box → padding is honored (image stays inside)
 * - background-position: center → centers the image in the content area */
.partner-logos__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 7.5rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  transition: opacity 0.2s ease;
  /* Light cell background so dark/transparent carrier logos stay readable in
   * either site theme. background-color paints first, then the inline
   * background-image (the logo URL) renders on top. */
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-origin: content-box;
}

/* Kansas City Life opts out — its <li> carries the navy→royal gradient and
 * the cell must stay transparent so the gradient shows through. */
.partner-logos__item[data-logo="kansas-city-life"] .partner-logos__cell {
  background-color: transparent;
}

.partner-logos__cell:hover {
  opacity: 0.75;
}

.partner-logos__cell:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
}

/* ── Per-logo cell adjustments ──
 *
 * Select Health, MetLife, and Companion Life previously had reduced padding
 * to fight clipping caused by a Sanity URL-builder rect=auto bug (since
 * fixed by switching to .width(N).auto('format') with no .height()). With
 * the URL bug resolved, every logo fits its cell at the standard 1rem
 * padding — see source dimensions / rendered sizes below. The padding
 * overrides were therefore reverted so all 11 cells have identical
 * breathing room (16px minimum from cell border to logo artwork).
 *
 *   Cell box (lg, capped at 14rem):  224 × 120
 *   Standard content area:           192 × 88   (after 1rem padding)
 *
 *   Logo            Source     Rendered (192×88, contain)
 *   Select Health   721 × 299  → 192 × 80   (width-bound, 8px vert breathing)
 *   MetLife         262 × 329  → 70 × 88    (height-bound, 61px horiz each side)
 *   Companion Life  369 × 49   → 192 × 26   (width-bound, 31px vert each side)
 *
 * (Different rendered sizes are inherent to each logo's aspect ratio, not
 * a padding issue. Equalizing rendered size would require differently-shaped
 * source assets or distorting the grid layout.) */

/* Kansas City Life — source PNG is white-on-transparent and disappears against
 * the white section background. The gradient lives on the <li> (the item)
 * rather than the cell so it paints BEFORE the cell's inline background-image
 * (the logo URL). The white logo then renders on top of the gradient through
 * the transparent areas of the PNG. Using longhand background-color /
 * background-image so the solid #1B4F8A fallback isn't reset by the gradient. */
.partner-logos__item[data-logo="kansas-city-life"] {
  background-color: #1B4F8A;
  background-image: linear-gradient(to bottom, #1B4F8A 0%, #2E7CC4 100%);
  border-radius: 8px;
}
.partner-logos__item[data-logo="kansas-city-life"] .partner-logos__cell {
  padding: 12px;
}

.partner-logos__fallback {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
