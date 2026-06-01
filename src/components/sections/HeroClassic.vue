<script setup>
import { computed } from 'vue';
import { useSiteStore } from '@/stores/useSiteStore';
import SmartLink from '@/components/ui/SmartLink.vue';
import { sanityImage } from '@/composables/useSanityImage';

const props = defineProps({ section: { type: Object, default: null } });
const site = useSiteStore();

// Reuse the same hero image as the modern hero; deliver at a comfortable
// width for the 3/4-column upper grid.
const heroSrc = computed(() => {
  const img = props.section?.image;
  if (!img) return '';
  return sanityImage(img).width(1280).auto('format').url();
});

const telHref = computed(() => 'tel:' + (site.contactPhone || '').replace(/[^\d+]/g, ''));

const ctaUrl = computed(() => props.section?.cta?.url || site.ctaUrl || '/contact');
const ctaLabel = computed(() => props.section?.cta?.label || site.ctaLabel || 'Contact Us');

// External quote link — fixed destination provided by the client.
const QUOTE_URL = 'https://vivecp.com/325f0387-6c68-4e2d-8966-5370c6714eb9';
</script>

<template>
  <section class="classic-hero">
    <!-- ── Upper section: photo (3 cols) + gray texture (1 col) ──
         Inner `__upper-grid` holds the height-constrained, clipped grid.
         The overlap box sits OUTSIDE that clip wrapper but INSIDE __upper
         so it can hang below the boundary without getting cropped. -->
    <div class="classic-hero__upper">
      <div class="classic-hero__upper-grid">
        <div class="classic-hero__photo">
          <img
            v-if="heroSrc"
            :src="heroSrc"
            :alt="section?.imageAlt || 'Insurance services'"
            class="classic-hero__photo-img"
          />
        </div>
        <div class="classic-hero__texture" aria-hidden="true">
          <span class="classic-hero__texture-text">INSURANCE<br />SOLUTIONS</span>
        </div>
      </div>

      <!-- Black overlap box: hangs below the upper-grid's bottom-right -->
      <div class="classic-hero__overlap-box">
        <p>{{ section?.subtitle || 'Taking the worry out of complex insurance issues for both BUSINESSES and INDIVIDUALS' }}</p>
      </div>
    </div>

    <!-- ── Lower section: tagline + CTAs, full width below the photo grid ── -->
    <div class="classic-hero__lower">
      <div class="classic-hero__lower-inner">
        <div class="classic-hero__lower-left">
          <h1 class="classic-hero__tagline">{{ section?.title || site.tagline || "Good Health, That's the Plan" }}</h1>
          <SmartLink :to="QUOTE_URL" class="classic-hero__quote-btn">
            Get a Personalized Life Insurance Quote Today
            <span aria-hidden="true">→</span>
          </SmartLink>
        </div>

        <div class="classic-hero__lower-right">
          <SmartLink :to="ctaUrl" class="classic-hero__contact-btn">{{ ctaLabel }}</SmartLink>
          <a v-if="site.contactPhone" :href="telHref" class="classic-hero__phone">{{ site.contactPhone }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Layout reference (replicating original Gatsby hero) ──────────────
 *
 *   ┌────────────────────────────────┬──────────┐
 *   │                                │  GRAY    │   ← .classic-hero__upper
 *   │     photo (3 cols)             │  TEXTURE │     (3fr 1fr grid)
 *   │                                │ "INS SOL"│
 *   ├────────────────────────────────┴──────────┤
 *   │ overlap box (absolute, bottom: -3rem)     │   ← hangs across boundary
 *   ├───────────────────────────────────────────┤
 *   │ GOOD HEALTH...      [Contact Us]          │   ← .classic-hero__lower
 *   │ [Quote Today →]      970.241.5542         │     (light bg, flex row)
 *   └───────────────────────────────────────────┘
 */

.classic-hero {
  position: relative;
  font-family: var(--font-body);
  background: #f8f7f5;
}

/* ── Upper: outer wrapper holds the absolute-positioned overlap box ───── */
.classic-hero__upper {
  position: relative;        /* anchor point for the overlap box */
  overflow: visible;         /* let the overlap box hang below the grid */
}

/* ── Inner grid: photo + gray texture, height-constrained + clipped ──── */
.classic-hero__upper-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  min-height: 420px;
  max-height: 42rem;         /* ~672px — keeps proportions tight at 1280-1440px */
  overflow: hidden;          /* photo clips rather than expanding the box */
}

.classic-hero__photo {
  position: relative;
  height: 100%;              /* fill the constrained grid cell */
  overflow: hidden;
  background: #d1d5db;
}

.classic-hero__photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;  /* keep face/subject visible when clipping */
  display: block;
}

.classic-hero__texture {
  position: relative;        /* anchor point for the absolute-positioned text */
  height: 100%;              /* match the constrained container height */
  /* Safety net: clamp() on the wordmark keeps text inside the panel at the
   * advertised viewport range, but font metrics vary by browser/zoom and the
   * panel narrows to ~25% of viewport at the 3fr/1fr ratio — clip rather
   * than bleed if measurements drift. */
  overflow: hidden;
  background: #e5e5e5;
  /* Subtle crosshatch — stands in for the original Gatsby texture asset */
  background-image:
    repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.04) 0 2px, transparent 2px 8px),
    repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.04) 0 2px, transparent 2px 8px);
}

/* Absolute-positioned wordmark, vertically centered in the upper third of
 * the panel: top: 35% places the element's top at the 35% mark, then
 * translateY(-50%) shifts it up by half its own height — so the text's
 * vertical center lands at ~35% of the panel height. */
.classic-hero__texture-text {
  position: absolute;
  top: 35%;
  left: 1rem;
  right: 1rem;
  transform: translateY(-50%);
  /* Inner padding keeps glyph edges off the panel's left/right borders at any
   * size; pairs with the panel's overflow: hidden as a belt + suspenders. */
  padding: 0 0.5rem;
  font-family: 'Inter', sans-serif;
  /* Fluid sizing tuned to the panel's actual width budget. Panel ≈ V/4 at
   * the 3fr/1fr grid; after left:1rem + right:1rem + padding 0.5rem each
   * side, content area = V/4 − 48px. "INSURANCE" at Inter 800 caps with
   * 0.08em letter-spacing is ~6em wide, so max-fitting font ≈ (V/4 − 48)/6.
   * At V=769 (where the panel still shows above the 768 mobile breakpoint),
   * that's ~24px — so the vw multiplier must stay below 24/7.69 ≈ 3.1vw.
   * 2.75vw leaves comfortable margin even if a heavier fallback font loads.
   * Floor 1rem catches the very narrow desktop edge; cap 2.75rem keeps the
   * wordmark proportional at >1600px viewports without overpowering. */
  font-size: clamp(1rem, 2.75vw, 2.75rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  text-align: center;
  line-height: 1.1;
}

/* ── Black overlap box ───────────────────────────────────────────────── *
 * Absolutely positioned WITHIN .classic-hero__upper. `bottom: 0` puts the
 * box's bottom edge flush with the boundary; `translateY(50%)` then shifts
 * it down by half its own height so the box is vertically centered on the
 * boundary — half visible in the upper photo area, half in the lower
 * section. Works at any box height (no hardcoded offset to maintain). */
.classic-hero__overlap-box {
  position: absolute;
  bottom: 0;
  right: 1.5rem;
  transform: translateY(50%);
  z-index: 3;
  max-width: 32rem;
  background: #111827;
  color: #ffffff;
  padding: 1.25rem 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}

.classic-hero__overlap-box p {
  margin: 0;
}

/* ── Lower section ────────────────────────────────────────────────────── */
.classic-hero__lower {
  background: #f8f7f5;
  /* The overlap box is centered on the boundary (translateY(50%)), so its
   * bottom half hangs into this section. Box height is ~5.5rem, so the
   * overhang is ~2.75rem. 5rem padding-top gives content ~2.25rem of safe
   * breathing room below the box's bottom edge. */
  padding: 5rem 1.5rem 3rem;
}

.classic-hero__lower-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.classic-hero__lower-left {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: flex-start;
}

.classic-hero__tagline {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  color: #1f2937;
  margin: 0;
}

.classic-hero__quote-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: #1B4F8A;
  border: 2px solid #1B4F8A;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.classic-hero__quote-btn:hover {
  background: #1B4F8A;
  color: #ffffff;
}

.classic-hero__quote-btn:focus-visible {
  outline: 2px solid #1B4F8A;
  outline-offset: 3px;
}

.classic-hero__lower-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

/* Navy Contact Us button with the green double-border accent */
.classic-hero__contact-btn {
  display: inline-block;
  /* min-width ≈ "CONTACT US" intrinsic width at the base 0.9375rem font with
   * letter-spacing 0.06em + ~1.75rem of horizontal padding. Guarantees the
   * flex column never compresses the button below single-line content even
   * when the lower-right cell shrinks under flex layout pressure. */
  min-width: 11rem;
  padding: 0.75rem 1.75rem;
  background: #1B4F8A;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9375rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  /* Pair with min-width + responsive font reduction below to keep the label
   * on a single line at every viewport width — never wraps to two lines. */
  white-space: nowrap;
  text-align: center;
  text-decoration: none;
  border: 3px double #2D6A4F;
  outline: 1px solid #1B4F8A;
  outline-offset: 2px;
  transition: background 0.2s ease, transform 0.15s ease;
}

/* Below 1000px the lower-row flex children compress; nowrap alone would push
 * the button out of its column. Step the font down so the (now nowrap) label
 * still fits inside the cell without overflowing. */
@media (max-width: 1000px) {
  .classic-hero__contact-btn {
    font-size: 0.8rem;
  }
}

.classic-hero__contact-btn:hover {
  background: #143b68;
  transform: translateY(-1px);
}

.classic-hero__contact-btn:focus-visible {
  outline: 3px solid #2D6A4F;
}

.classic-hero__phone {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: #1B4F8A;
  text-decoration: none;
}

.classic-hero__phone:hover {
  text-decoration: underline;
}

/* ── Mobile ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .classic-hero__upper-grid {
    grid-template-columns: 1fr;
    min-height: 240px;
    max-height: none;        /* drop the cap on mobile — photo can size naturally */
  }

  /* Hide the texture column on mobile per spec */
  .classic-hero__texture {
    display: none;
  }

  /* Overlap box reverts to static positioning below the photo. Reset the
   * transform so the box doesn't shift by half its height in normal flow. */
  .classic-hero__overlap-box {
    position: static;
    transform: none;
    max-width: none;
    margin: 0;
    box-shadow: none;
  }

  /* Lower stacks vertically, no longer needs the overlap clearance */
  .classic-hero__lower {
    padding: 2rem 1.25rem;
  }
  .classic-hero__lower-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .classic-hero__lower-right {
    align-items: flex-start;
  }
}
</style>
