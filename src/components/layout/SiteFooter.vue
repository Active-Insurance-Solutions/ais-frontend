<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useSiteStore } from '@/stores/useSiteStore';
import { useSanity } from '@/composables/useSanity';
import { getSocialIcon } from '@/composables/useSocialIcons';
import { useBusinessHours } from '@/composables/useBusinessHours';
import SmartLink from '@/components/ui/SmartLink.vue';

const site = useSiteStore();
const route = useRoute();
const year = new Date().getFullYear();
const { hours: businessHours } = useBusinessHours();

// Closing CTA appears at the bottom of every page EXCEPT:
//   - Home, where the hero handles the CTA
//   - Contact, where the page IS the CTA — the closing band's button points
//     to /contact, so rendering it here would be a link back to the same page
// Per design-decisions.md L137 and rebuild-notes.md L117-122.
const CTA_HIDDEN_ROUTES = ['/', '/contact'];
const showClosingCta = computed(() => !CTA_HIDDEN_ROUTES.includes(route.path));

// ── Footer Columns (CMS) ──
interface FooterColumn { title: string; links: Array<{ label: string; url: string }> }
const { data: footerColumnsDoc } = useSanity<{ columns: FooterColumn[] }>(
  `*[_type == "footerColumns"][0]{ columns[]{title, links[]{label, url}} }`,
);
const cmsColumns = computed<FooterColumn[]>(() => footerColumnsDoc.value?.columns || []);

const { data: socialDoc } = useSanity<{ links: { platform: string; url: string }[] }>(
  `*[_type == "socialLinks"][0]{"links": coalesce(links, items)}`
);
const socialLinks = computed(() => {
  const raw = socialDoc.value?.links || site.socialLinks;
  return raw.map((l) => ({ ...l, platform: l.platform.toLowerCase() }));
});

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  pinterest: 'Pinterest',
  threads: 'Threads',
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  nextdoor: 'Nextdoor',
};

function isExternalUrl(url: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(url);
}

function telHref(raw: string): string {
  return 'tel:' + (raw || '').replace(/[^\d+]/g, '');
}
</script>

<template>
  <footer class="site-footer">
    <!-- Section 1: Closing CTA Band — omitted on Home -->
    <div v-if="showClosingCta && (site.ctaFooterLabel || site.ctaLabel)" class="cta-band">
      <div class="cta-band__inner">
        <h2 class="cta-band__heading">{{ site.ctaHeadline }}</h2>
        <p class="cta-band__text">{{ site.ctaSubtext }}</p>
        <SmartLink :to="site.ctaFooterUrl || site.ctaUrl" class="cta-band__button">
          {{ site.ctaFooterLabel || site.ctaLabel }}
        </SmartLink>
      </div>
    </div>

    <!-- Section 2: 3-column info area (Company / Legal from CMS; Contact from siteSettings) -->
    <div class="footer-columns">
      <div class="footer-columns__inner">
        <!-- CMS-driven columns (Company, Legal). Editor controls titles + link lists. -->
        <div v-for="col in cmsColumns" :key="col.title" class="footer-columns__col">
          <h3 class="footer-columns__title">{{ col.title }}</h3>
          <ul class="footer-columns__list">
            <li v-for="link in col.links" :key="link.url">
              <a
                v-if="isExternalUrl(link.url)"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-columns__link"
              >{{ link.label }}</a>
              <RouterLink v-else :to="link.url" class="footer-columns__link">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact column (hardcoded structure, content pulled from siteSettings). -->
        <div class="footer-columns__col">
          <h3 class="footer-columns__title">Contact</h3>
          <div class="footer-columns__contact">
            <p class="footer-columns__contact-name">{{ site.name }}</p>
            <p v-if="site.address" class="footer-columns__contact-address">{{ site.address }}</p>
            <a v-if="site.contactPhone" :href="telHref(site.contactPhone)" class="footer-columns__link">{{ site.contactPhone }}</a>
            <a v-if="site.contactEmail" :href="`mailto:${site.contactEmail}`" class="footer-columns__link">{{ site.contactEmail }}</a>
          </div>

          <!-- Hours of operation, fed by useBusinessHours (auto-switches Jun–Jul 2026). -->
          <div v-if="businessHours.length" class="footer-columns__hours">
            <p class="footer-columns__hours-label">Hours</p>
            <ul class="footer-columns__hours-list">
              <li v-for="row in businessHours" :key="row.days">
                <span class="footer-columns__hours-days">{{ row.days }}</span>
                <span class="footer-columns__hours-time">{{ row.time }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Bottom Bar (copyright / social / crafted-by) -->
    <div class="bottom-bar">
      <div class="bottom-bar__inner">
        <div class="bottom-bar__meta">
          <p class="bottom-bar__copyright">
            {{ site.copyrightText || `© ${year} ${site.name}. All rights reserved.` }}
          </p>
          <div v-if="socialLinks.length" class="bottom-bar__social">
            <a
              v-for="link in socialLinks"
              :key="link.platform"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="bottom-bar__social-link"
              :aria-label="platformLabels[link.platform] || link.platform"
            >
              <svg v-if="getSocialIcon(link.platform)" class="bottom-bar__social-svg" viewBox="0 0 24 24" fill="currentColor">
                <path :d="getSocialIcon(link.platform)!" />
              </svg>
              <span v-else class="bottom-bar__social-fallback">{{ (platformLabels[link.platform] || link.platform).charAt(0) }}</span>
            </a>
          </div>
          <p v-if="site.craftedBy" class="bottom-bar__crafted">
            <a
              href="https://phiferwebsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              class="bottom-bar__crafted-link"
            >{{ site.craftedBy }}</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
}

/* ─── Section 1: CTA Band ─── */
.cta-band {
  background-color: #1f2937;
  padding: 4rem 1.5rem;
  text-align: center;
}

.cta-band__inner {
  max-width: 48rem;
  margin: 0 auto;
}

.cta-band__heading {
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.cta-band__text {
  font-size: 1.125rem;
  color: #d1d5db;
  margin-bottom: 2rem;
}

.cta-band__button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 2rem;
  background-color: #ffffff;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}

.cta-band__button:hover {
  background-color: var(--color-accent);
  color: #111827;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cta-band__button:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* ─── Section 2: 3-Column Footer Info ─── */
.footer-columns {
  background-color: #1B4F8A;
  color: #e5e7eb;
  padding: 3rem 1.5rem;
}

.footer-columns__inner {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 3rem;
}

.footer-columns__title {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin: 0 0 1rem;
}

.footer-columns__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-columns__link {
  font-size: 0.9375rem;
  color: #e5e7eb;
  text-decoration: none;
  transition: color 0.2s ease;
  border-radius: 2px;
}

.footer-columns__link:hover {
  color: #ffffff;
  text-decoration: underline;
}

.footer-columns__link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.footer-columns__contact {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.footer-columns__contact-name {
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.footer-columns__contact-address {
  white-space: pre-line;
  color: #e5e7eb;
  margin: 0;
}

.footer-columns__hours {
  margin-top: 1.25rem;
}

.footer-columns__hours-label {
  font-family: var(--font-heading);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 0.4rem;
}

.footer-columns__hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
  color: #e5e7eb;
}

.footer-columns__hours-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.1rem 0;
}

.footer-columns__hours-time {
  color: #cbd5e1;
}

/* ─── Section 3: Bottom Bar ─── */
.bottom-bar {
  background-color: #000000;
  padding: 1.25rem 1.5rem;
}

.bottom-bar__inner {
  max-width: 72rem;
  margin: 0 auto;
}

/* Copyright (left) + Social (center) + Crafted By (right) row */
.bottom-bar__meta {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.bottom-bar__copyright {
  font-size: 0.875rem;
  color: #d1d5db;
  text-align: left;
}

.bottom-bar__crafted {
  font-size: 0.8125rem;
  color: #9ca3af;
  text-align: right;
}

.bottom-bar__crafted-link {
  color: inherit;
  text-decoration: none;
  border-radius: 2px;
  transition: color 0.2s ease;
}

.bottom-bar__crafted-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

.bottom-bar__crafted-link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.bottom-bar__social {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
}

.bottom-bar__social-link {
  display: inline-flex;
  align-items: center;
  color: #d1d5db;
  transition: color 0.2s ease;
  border-radius: 4px;
}

.bottom-bar__social-link:hover {
  color: #ffffff;
}

.bottom-bar__social-link:focus-visible {
  outline: 3px dashed rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.bottom-bar__social-svg {
  width: 1.25rem;
  height: 1.25rem;
}

.bottom-bar__social-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .cta-band__heading {
    font-size: 1.5rem;
  }

  .footer-columns__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .bottom-bar__meta {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .bottom-bar__copyright,
  .bottom-bar__crafted {
    text-align: center;
  }
}
</style>
