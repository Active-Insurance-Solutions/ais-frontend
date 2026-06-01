<script setup>
import { computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import { useViewStore } from '@/stores/useViewStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import HeroClassic from '@/components/sections/HeroClassic.vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });
const site = useSiteStore();
const view = useViewStore();

// Default to compact title-bar rendering. Landing-page heroes that want the
// full-height treatment (image, CTA, ~480px tall) opt out by setting
// `compact: false` on the section in the CMS / seed.
const isCompact = computed(() => props.section?.compact !== false);

// Classic-mode override only applies to the full landing hero (Home page).
// Compact sub-page title bars use the modern treatment regardless of mode.
const useClassic = computed(() => !isCompact.value && view.mode === 'classic');

/* External life-insurance quote destination. Hardcoded to match the
 * client-supplied URL used on HeroClassic — parity between view modes.
 * Move to siteSettings if the destination ever needs to be CMS-editable. */
const QUOTE_URL = 'https://vivecp.com/325f0387-6c68-4e2d-8966-5370c6714eb9';

const heroStyle = computed(() => {
  const img = props.section?.image;
  if (!img) return {};
  const url = sanityImage(img).width(1920).auto('format').url();
  const styles = { '--hero-image': `url(${url})` };
  // Translate the editor's hotspot (normalized 0–1 coords) into CSS background-position.
  // Without this, background-size: cover always center-crops, ignoring CMS hotspot.
  if (img.hotspot) {
    const x = ((img.hotspot.x ?? 0.5) * 100).toFixed(1);
    const y = ((img.hotspot.y ?? 0.5) * 100).toFixed(1);
    styles['--hero-bg-pos'] = `${x}% ${y}%`;
  }
  return styles;
});
</script>

<template>
  <!-- Classic-mode landing hero (Home page, classic view) -->
  <HeroClassic v-if="useClassic" :section="section" />

  <!-- Compact title bar — default for inner pages -->
  <section v-else-if="isCompact" class="hero-compact">
    <div class="hero-compact__inner">
      <h1 v-if="section?.title" class="hero-compact__title">{{ section.title }}</h1>
      <p v-if="section?.subtitle" class="hero-compact__subtitle">{{ section.subtitle }}</p>
    </div>
  </section>

  <!-- Full landing-page hero — opt in via section.compact = false -->
  <section v-else class="hero relative flex items-center justify-center min-h-[480px] px-6 py-24 overflow-hidden" :style="heroStyle" :aria-label="section?.imageAlt || undefined">
    <div class="relative z-10 text-center text-white max-w-3xl mx-auto">
      <h1 v-if="section?.title || site.name" class="text-5xl font-extrabold leading-tight mb-4">{{ section?.title || site.name }}</h1>
      <p v-if="section?.subtitle || site.tagline" class="text-xl opacity-80 mb-8">{{ section?.subtitle || site.tagline }}</p>
      <!-- Sole hero CTA: external life-insurance quote link (same vivecp
           destination as HeroClassic). The CMS-driven section.cta is
           intentionally omitted here — the sitewide pre-footer CTA already
           handles contact-form routing, so the hero stays focused on the
           one action that's unique to the landing page. -->
      <SmartLink :to="QUOTE_URL" class="focus-ring-light inline-flex items-center gap-2 bg-white/10 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-[var(--color-primary)] transition-colors">
        Get a Personalized Life Insurance Quote
        <span aria-hidden="true">→</span>
      </SmartLink>
    </div>
  </section>
</template>

<style scoped>
/* ── Full landing-page hero ─────────────────────────────────────────────── */
.hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  background-size: cover;
  background-position: var(--hero-bg-pos, center);
}
.hero[style*="--hero-image"] {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 75%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 75%, transparent) 100%), var(--hero-image);
  background-size: cover;
  background-position: var(--hero-bg-pos, center);
}

/* ── Compact inner-page title bar ──────────────────────────────────────── */
/* Matches the full hero's gradient (same angle and color stops). Height lands
 * around 130 px on desktop / 110 px on mobile — fits the 120–140 px spec. */
.hero-compact {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 2rem 1.5rem;
  color: #ffffff;
  text-align: center;
}

.hero-compact__inner {
  max-width: 64rem;
  margin: 0 auto;
}

.hero-compact__title {
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.hero-compact__subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.9;
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .hero-compact {
    padding: 1.5rem 1.25rem;
  }
  .hero-compact__title {
    font-size: 1.5rem;
  }
}
</style>
