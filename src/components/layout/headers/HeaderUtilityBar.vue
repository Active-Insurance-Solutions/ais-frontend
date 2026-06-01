<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Menu, X, Sun, Moon, Phone } from 'lucide-vue-next';
import { useSiteStore } from '@/stores/useSiteStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import { useTheme } from '@/composables/useTheme';

const site = useSiteStore();
const { theme, toggle } = useTheme();
const mobileOpen = ref(false);

const currentLogo = computed(() => {
  if (theme.value === 'dark' && site.darkLogo) return site.darkLogo;
  return site.logo;
});

const telHref = computed(() => `tel:${site.contactPhone.replace(/[^\d+]/g, '')}`);
</script>

<template>
  <header class="utility-header">
    <!-- Top row: utility bar -->
    <div v-if="site.contactPhone || site.utilityNav?.length" class="utility-header__top">
      <div class="utility-header__top-inner">
        <a v-if="site.contactPhone" :href="telHref" class="utility-header__phone">
          <Phone :size="14" aria-hidden="true" />
          <span>{{ site.contactPhone }}</span>
        </a>

        <nav
          v-if="site.utilityNav?.length"
          class="utility-header__quick-links"
          aria-label="Quick service links"
        >
          <template v-for="(item, idx) in site.utilityNav" :key="item.to">
            <RouterLink :to="item.to" class="utility-header__quick-link">
              {{ item.label }}
            </RouterLink>
            <span
              v-if="idx < site.utilityNav.length - 1"
              class="utility-header__quick-sep"
              aria-hidden="true"
            >|</span>
          </template>
        </nav>
      </div>
    </div>

    <!-- Bottom row: main nav -->
    <div class="utility-header__main">
      <div class="utility-header__main-inner">
        <RouterLink to="/" class="utility-header__logo" @click="mobileOpen = false">
          <img
            v-if="currentLogo"
            :src="currentLogo"
            :alt="site.name"
            class="utility-header__logo-img"
          />
          <span v-else>{{ site.name }}</span>
        </RouterLink>

        <nav
          id="utility-mobile-nav"
          class="utility-header__nav"
          :class="{ 'utility-header__nav--open': mobileOpen }"
          aria-label="Primary"
        >
          <RouterLink
            v-for="item in site.primaryNav"
            :key="item.to"
            :to="item.to"
            class="utility-header__link"
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </RouterLink>

          <!-- Mobile-only sub-section: the plan deep-links that live in the
               desktop utility bar's quick-links nav. The utility bar itself
               is hidden at <=768px (display: none on .utility-header__quick-links)
               so without this group, mobile users have no way to reach the
               /plans anchors. Hidden at desktop where the quick links already
               show in the top gray bar. Top border separates them from the
               primary nav above; no label heading — the visual rule is enough. -->
          <div
            v-if="site.utilityNav?.length"
            class="utility-header__mobile-extra"
          >
            <RouterLink
              v-for="item in site.utilityNav"
              :key="item.to"
              :to="item.to"
              class="utility-header__link utility-header__link--sub"
              @click="mobileOpen = false"
            >
              {{ item.label }}
            </RouterLink>
          </div>

          <SmartLink
            v-if="site.ctaLabel"
            :to="site.ctaUrl"
            class="utility-header__cta utility-header__cta--mobile"
            @click="mobileOpen = false"
          >
            {{ site.ctaLabel }}
          </SmartLink>
        </nav>

        <div class="utility-header__actions">
          <SmartLink
            v-if="site.ctaLabel"
            :to="site.ctaUrl"
            class="utility-header__cta utility-header__cta--desktop"
          >
            {{ site.ctaLabel }}
          </SmartLink>

          <button
            class="utility-header__theme-toggle"
            :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
            @click="toggle"
          >
            <Sun v-if="theme === 'dark'" :size="20" />
            <Moon v-else :size="20" />
          </button>

          <button
            class="utility-header__hamburger"
            :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="mobileOpen"
            aria-controls="utility-mobile-nav"
            @click="mobileOpen = !mobileOpen"
          >
            <X v-if="mobileOpen" :size="24" />
            <Menu v-else :size="24" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Header-height var is exposed globally so router scrollBehavior can match it. */
.utility-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

/* ── Top row: utility bar ─────────────────────────────────────────────── */
/* Text is hardcoded white because the utility bar bg is always the primary
 * blue (different shade per theme, but always strong blue). Using
 * --color-text-inverse here flipped to #111827 in dark mode and rendered at
 * only 3.11:1 contrast on the dark-mode primary #2367b5. White gives 8.29:1
 * (AAA) in light mode and 5.71:1 (AA) in dark mode. */
.utility-header__top {
  background-color: var(--color-primary);
  color: #ffffff;
  font-size: 0.8125rem;
}

.utility-header__top-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.4rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.25rem;
}

.utility-header__phone {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #ffffff;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.utility-header__phone:hover {
  opacity: 0.85;
  color: #ffffff;
}

.utility-header__phone:focus-visible {
  outline: 2px dashed #ffffff;
  outline-offset: 3px;
  border-radius: 2px;
}

.utility-header__quick-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.utility-header__quick-link {
  color: #ffffff;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.utility-header__quick-link:hover {
  opacity: 0.85;
  color: #ffffff;
}

.utility-header__quick-link:focus-visible {
  outline: 2px dashed #ffffff;
  outline-offset: 3px;
  border-radius: 2px;
}

.utility-header__quick-sep {
  opacity: 0.5;
  user-select: none;
}

/* ── Bottom row: main nav ─────────────────────────────────────────────── */
.utility-header__main-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.utility-header__logo {
  font-family: var(--font-heading);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-primary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.utility-header__logo:hover {
  color: var(--color-primary);
}

.utility-header__logo:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 4px;
}

.utility-header__logo-img {
  height: 2.5rem;
  width: auto;
  object-fit: contain;
}

.utility-header__nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.utility-header__link {
  color: var(--color-text);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.utility-header__link:hover,
.utility-header__link.router-link-active {
  color: var(--color-primary);
}

.utility-header__link:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

.utility-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* CTA — uses the darker amber (--color-accent-hover, #b16105) so white text passes
 * WCAG AA (4.58:1). The lighter --color-accent (#D97706) is only 3.19:1 against
 * white and fails AA for non-large text. Hover darkens further via brightness filter. */
.utility-header__cta {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  background-color: var(--color-accent-hover);
  color: var(--color-text-inverse);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--border-radius);
  transition: filter 0.2s ease;
}

.utility-header__cta:hover {
  color: var(--color-text-inverse);
  filter: brightness(0.9);
}

.utility-header__cta:focus-visible {
  outline: 3px dashed var(--color-accent);
  outline-offset: 2px;
}

.utility-header__cta--mobile {
  display: none;
}

/* Mobile-only plan-category sub-section. Hidden at desktop where these
 * links live in the utility bar's quick-links nav. Revealed inside the
 * open hamburger menu at <=768px via the media query below. */
.utility-header__mobile-extra {
  display: none;
}

.utility-header__theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.375rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.utility-header__theme-toggle:hover {
  background-color: var(--color-border);
}

.utility-header__theme-toggle:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
}

.utility-header__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.375rem;
}

.utility-header__hamburger:focus-visible {
  outline: 3px dashed var(--color-primary);
  outline-offset: 2px;
}

/* ── Mobile ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  /* Simplify utility bar: keep phone, drop quick-links (accessible elsewhere) */
  .utility-header__top-inner {
    justify-content: center;
  }

  .utility-header__quick-links {
    display: none;
  }

  .utility-header__hamburger {
    display: flex;
  }

  .utility-header__cta--desktop {
    display: none;
  }

  .utility-header__nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    gap: 0.5rem;
  }

  .utility-header__nav--open {
    display: flex;
  }

  .utility-header__cta--mobile {
    display: inline-flex;
    margin-top: 0.5rem;
    justify-content: center;
  }

  .utility-header__link {
    padding: 0.5rem 0;
  }

  /* Reveal the plan-category sub-section inside the open hamburger.
   * Separated visually from the primary nav with a top border + label. */
  .utility-header__mobile-extra {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
  }

  /* Slightly smaller text for the sub-links so they read as secondary
   * navigation, not equal-weight peers of the primary nav above. */
  .utility-header__link--sub {
    font-size: 0.875rem;
    padding-left: 0.5rem;
  }
}
</style>
