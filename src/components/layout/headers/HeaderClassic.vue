<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useMediaQuery } from '@vueuse/core';
import { Sun, Moon } from 'lucide-vue-next';
import { useSiteStore } from '@/stores/useSiteStore';
import { useTheme } from '@/composables/useTheme';

const site = useSiteStore();
const route = useRoute();

/* Shared with the modern header — both views read/write the same
 * 'theme' localStorage key, so toggling on one view persists when the user
 * switches view modes. */
const { theme, toggle: toggleTheme } = useTheme();

/* Below 850px the layout collapses to a stacked column with a dark slate
 * (#1f2937) panel behind the logo. The light-mode logo (dark wordmark)
 * disappears on that background, so we swap to the dark-mode logo (white
 * wordmark) at that breakpoint. Falls back to the light logo if the CMS
 * hasn't supplied a dark-mode variant. */
const isStacked = useMediaQuery('(max-width: 849px)');
const headerLogo = computed(() =>
  isStacked.value && site.darkLogo ? site.darkLogo : site.logo,
);

const tabs = [
  { label: 'HOME',       to: '/' },
  { label: 'ABOUT US',   to: '/about' },
  { label: 'SERVICES',   to: '/services' },
  { label: 'FAQ',        to: '/faq' },
  { label: 'CONTACT US', to: '/contact' },
];

const telHref = computed(() => 'tel:' + (site.contactPhone || '').replace(/[^\d+]/g, ''));
const utilityNav = computed(() => site.utilityNav || []);
</script>

<template>
  <header class="classic-header">
    <!-- Spacer reserves 5rem in normal document flow so page content (the
         hero, etc.) doesn't slide up under the fixed utility bar. All four
         visual layers below are position: fixed and contribute 0 height in
         the flow. -->
    <div class="classic-header__spacer" aria-hidden="true"></div>

    <!-- Layer 1 — Blue gradient backdrop (z-index: 1) -->
    <div class="classic-header__gradient" aria-hidden="true"></div>

    <!-- Layer 2 — Gray utility bar (z-index: 5) -->
    <div class="classic-header__utility">
      <div class="classic-header__utility-inner">
        <a v-if="site.contactPhone" :href="telHref" class="classic-header__utility-phone">{{ site.contactPhone }}</a>
        <!-- Right-side group: quick-service links + theme toggle. Wrapping
             both keeps them together as the "right" group, so the parent's
             space-between layout still puts the phone on one side and these
             controls on the other (rather than spreading three items
             evenly across the bar). -->
        <div class="classic-header__utility-right">
          <nav v-if="utilityNav.length" class="classic-header__utility-links" aria-label="Quick service links">
            <template v-for="(link, idx) in utilityNav" :key="link.to">
              <RouterLink :to="link.to" class="classic-header__utility-link">{{ link.label }}</RouterLink>
              <span v-if="idx < utilityNav.length - 1" class="classic-header__utility-sep" aria-hidden="true">|</span>
            </template>
          </nav>
          <button
            type="button"
            class="classic-header__utility-theme"
            :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" :size="18" aria-hidden="true" />
            <Moon v-else :size="18" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Layer 3 — Logo (z-index: 15, top of stack) -->
    <RouterLink to="/" class="classic-header__logo" :aria-label="site.name">
      <img v-if="headerLogo" :src="headerLogo" :alt="site.name" />
      <span v-else class="classic-header__logo-text">{{ site.name }}</span>
    </RouterLink>

    <!-- Layer 4 — Fixed nav tabs (z-index: 4) -->
    <nav class="classic-header__tabs" aria-label="Primary">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="classic-header__tab"
        :class="{
          'classic-header__tab--active': route.path === tab.to,
          'classic-header__tab--contact': tab.to === '/contact',
        }"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.classic-header {
  font-family: var(--font-body);
}

/* ── Normal-flow spacer ───────────────────────────────────────────────── *
 * Reserves vertical space equal to the fixed utility bar's height so the
 * page content (rendered after <SiteHeader />) starts below it. The other
 * fixed layers (gradient, logo, tabs) are visual overlays only — they
 * don't displace page content. */
.classic-header__spacer {
  height: 5rem;
}

/* ── Layer 1: Blue gradient backdrop (z-index: 1) ─────────────────────── *
 * Fades from solid primary blue at top to transparent over 16rem. Persists
 * as the user scrolls (position: fixed). Tints the top 16rem of every
 * viewport. pointer-events: none lets clicks pass through to content below. */
.classic-header__gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 16rem;
  background: linear-gradient(to bottom, #1B4F8A, transparent);
  z-index: 1;
  pointer-events: none;
}

/* ── Layer 2: Gray utility bar (z-index: 5) ───────────────────────────── *
 * 5rem-tall opaque strip across the top. Covers the gradient in this band. */
.classic-header__utility {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5rem;
  background: #e5e7eb;
  border-bottom: 1px solid #d1d5db;
  z-index: 5;
}

.classic-header__utility-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.25rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #374151;
  font-size: 0.8125rem;
}

.classic-header__utility-phone {
  color: #374151;
  font-weight: 700;
  text-decoration: none;
  /* Logo container is `width: 50%` and overlays the utility bar (z:15 vs z:5).
   * Push the phone content right by 50vw so it always starts past the logo's
   * right edge regardless of viewport width. Mobile (<768px) overrides this
   * via the existing media query — the stacked layout doesn't need the offset. */
  padding-left: 50vw;
}

.classic-header__utility-phone:hover { text-decoration: underline; }
.classic-header__utility-phone:focus-visible {
  outline: 2px solid #1B4F8A;
  outline-offset: 2px;
  border-radius: 2px;
}

.classic-header__utility-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* Force single-row rendering — flex-wrap: wrap was causing the service
   * links to break onto multiple lines at wide viewports because the phone's
   * 50vw padding-left was eating too much horizontal room. */
  flex-wrap: nowrap;
  white-space: nowrap;
  justify-content: flex-end;
}

.classic-header__utility-link {
  color: #374151;
  font-weight: 700;
  text-decoration: none;
  /* Each link's text stays on one line; the parent's flex-wrap: nowrap keeps
   * the three links on the same row. font-size: 0.8rem is slightly smaller
   * than the default 0.8125rem to give the long labels more horizontal room. */
  white-space: nowrap;
  font-size: 0.8rem;
}

.classic-header__utility-link:hover { text-decoration: underline; }
.classic-header__utility-link:focus-visible {
  outline: 2px solid #1B4F8A;
  outline-offset: 2px;
  border-radius: 2px;
}

.classic-header__utility-sep {
  color: #9ca3af;
  user-select: none;
}

/* Right-side group wrapping the quick links + theme toggle. Keeps both
 * controls aligned together at the right end of the utility bar. */
.classic-header__utility-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Theme toggle button — icon-only, matches the utility text color, no
 * background until hover. Sized to sit in the same visual band as the
 * surrounding text links. */
.classic-header__utility-theme {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: 0;
  color: #374151;
  cursor: pointer;
  border-radius: 2px;
  transition: color 0.2s ease;
}

.classic-header__utility-theme:hover {
  color: #1B4F8A;
}

.classic-header__utility-theme:focus-visible {
  outline: 2px solid #1B4F8A;
  outline-offset: 2px;
}

/* ── Layer 3: Logo (z-index: 15, top of stack) ────────────────────────── *
 * Fixed to top-left, width 50% of viewport. Logo image's margin-top: -1rem
 * lifts it so its top edge sits flush with the viewport top — meaning the
 * logo's top portion overlaps the utility bar's left half. Where the logo
 * PNG is transparent, the gray utility bar (z:5) shows through; where the
 * PNG is opaque, the logo paints over the utility bar. */
.classic-header__logo {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  z-index: 15;
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.5rem;
  text-decoration: none;
}

.classic-header__logo img {
  max-width: 41.5rem;
  height: auto;
  margin-top: -1rem;
  display: block;
}

.classic-header__logo-text {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.04em;
}

/* ── Layer 4: Nav tabs (z-index: 4) ───────────────────────────────────── *
 * Fixed to top: 5rem (flush with the utility bar's bottom edge), right: 0.
 * Each tab is a square (8rem × 8rem) with 5px side margins creating the
 * visible gaps between tabs. */
.classic-header__tabs {
  position: fixed;
  top: 5rem;
  right: 0;
  z-index: 4;
  display: inline-flex;
}

.classic-header__tab {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  /* Width scales with viewport so "ABOUT US" and "CONTACT US" labels stay
   * single-line across the full desktop range. Floor 5rem (~80px) is the
   * size at the 850px breakpoint; ceiling 7rem (~112px) caps growth on
   * wider screens. Height stays at the original ~82px. */
  width: clamp(5rem, 6vw, 7rem);
  height: 82px;
  margin: 0 5px;
  padding: 0 0.5rem 1rem;
  background-color: #1f2937;
  color: #ffffff;
  font-family: var(--font-heading);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  /* Inset black shadow gives each tab a subtle "pressed" inner edge. Applied
   * at the base so all variants (active, Contact Us) inherit it; hover
   * overrides re-declare the same value so it isn't dropped on state change. */
  box-shadow: inset 0 0 5px #000;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.classic-header__tab:hover {
  background-color: #ffffff;
  color: #1f2937;
  box-shadow: inset 0 0 5px #000;
}

.classic-header__tab--active {
  background-color: #f8f7f5;
  color: #1f2937;
}

/* Declared after --active so Contact Us stays blue even on /contact */
.classic-header__tab--contact {
  background-color: #1B4F8A;
  color: #ffffff;
  /* "CONTACT US" is the longest label by ~3 chars vs the next-longest
   * ("ABOUT US"). At the other tabs' clamp(5rem, 6vw, 7rem) width, it sits
   * cramped at narrower desktop widths. Pinning Contact Us to 7.5rem gives
   * the label comfortable breathing room without changing tab box dimensions
   * for the rest of the nav. Overridden back to width: auto in the mobile
   * media query so the stacked layout still flex-distributes tabs evenly. */
  width: 7.5rem;
}

.classic-header__tab--contact:hover {
  background-color: #ffffff;
  color: #1f2937;
  box-shadow: inset 0 0 5px #000;
}

.classic-header__tab:focus-visible {
  outline: 2px dashed rgba(255, 255, 255, 0.6);
  outline-offset: -3px;
}

/* ── Mobile ───────────────────────────────────────────────────────────── *
 * The layered-fixed design doesn't work on small viewports (logo would
 * cover most of the screen, persistent tabs eat too much vertical space).
 * Collapse everything back into a normal-flow stacked header. */
/* ── Tight desktop band (850-1100px) ──────────────────────────────────── *
 * At the bottom of the layered desktop range, the utility bar's right edge
 * runs out of room and "Life Insurance" clips against the viewport (the
 * issue persists up to ~1100px, not just ~900px). Relax white-space, shrink
 * the link font, and let the utility bar grow taller so the links can wrap
 * to a second line cleanly. The fixed nav tabs drop down to match the
 * shorter min-height so they still meet the utility bar's bottom edge. */
@media (min-width: 850px) and (max-width: 1100px) {
  .classic-header__utility {
    height: auto;
    min-height: 3.5rem;
  }
  .classic-header__utility-links {
    flex-wrap: wrap;
    white-space: normal;
  }
  .classic-header__utility-link {
    white-space: normal;
    font-size: 0.7rem;
  }
  .classic-header__tabs {
    top: 3.5rem;
  }
}

/* ── Narrow desktop band (850-900px) — tab width ──────────────────────── *
 * At the bottom of the layered desktop range, the standard nav-tab block
 * (~490px: four 5rem tabs + one 7.5rem Contact Us + margins) is wider than
 * the available horizontal space to the right of the logo. The logo extends
 * to ~414px from the viewport's left edge, leaving only ~436px for the nav
 * at 850px viewport — the HOME tab ends up under the logo AND the wider
 * Contact Us tab clips off the right edge.
 *
 * All five tabs (including Contact Us) shrink to 4.5rem here so the nav
 * block totals ~410px — fits between the logo's right edge and the
 * viewport's right edge with ~26px of breathing room. Contact Us gets an
 * explicit override (same selector specificity as base, declared later in
 * source within this media query — guarantees the 7.5rem rule is replaced)
 * plus a smaller font so "CONTACT US" still fits inside the narrower box. */
@media (min-width: 850px) and (max-width: 900px) {
  .classic-header__tab {
    width: 4.5rem;
  }
  .classic-header__tab--contact {
    width: 4.5rem;
    font-size: 0.55rem;
  }
}

@media (max-width: 849px) {
  .classic-header__spacer { display: none; }
  .classic-header__gradient { display: none; }

  .classic-header__utility {
    position: relative;
    height: auto;
  }
  .classic-header__utility-inner {
    flex-direction: column;
    /* Horizontal padding reduced to 0.5rem so long labels have more room at
     * narrow viewports (e.g. 300px) without clipping the viewport edge. */
    padding: 0.75rem 0.5rem;
    gap: 0.4rem;
    text-align: center;
  }
  /* Reset the desktop logo-clearance offset — stacked layout doesn't need it. */
  .classic-header__utility-phone {
    padding-left: 0;
  }
  .classic-header__utility-links {
    /* Allow links to wrap to their own lines on narrow viewports. */
    flex-wrap: wrap;
    white-space: normal;
    justify-content: center;
  }
  .classic-header__utility-link {
    /* Allow long labels (e.g. "Employer and Individual Health Plans") to wrap
     * at word boundaries instead of overflowing/clipping at ~300px. */
    white-space: normal;
    font-size: 0.75rem;
  }

  .classic-header__logo {
    position: relative;
    width: 100%;
    background: #1f2937;
    padding: 1rem;
    justify-content: center;
  }
  .classic-header__logo img {
    max-width: 100%;
    max-height: 4rem;
    margin-top: 0;
  }

  .classic-header__tabs {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    flex-wrap: wrap;
    background: #1f2937;
  }
  .classic-header__tab {
    flex: 1 1 33%;
    width: auto;
    height: auto;
    min-height: 3.5rem;
    margin: 0;
    padding: 0.75rem 0.5rem;
    justify-content: center;
  }
}
</style>
