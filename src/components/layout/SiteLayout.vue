<script setup lang="ts">
import { computed, watch } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import ViewToggle from '@/components/ui/ViewToggle.vue';
import { useSeo } from '@/composables/useSeo';
import { useSanity } from '@/composables/useSanity';
import { useSiteStore } from '@/stores/useSiteStore';

useSeo();

// Fetch site settings and navigation from Sanity, sync into the Pinia store
const site = useSiteStore();

// ── Site Settings ──
interface SiteSettings {
  siteName?: string;
  tagline?: string;
  logo?: { asset?: { url?: string } };
  darkLogo?: { asset?: { url?: string } };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaFooterLabel?: string;
  ctaFooterUrl?: string;
  copyrightText?: string;
  craftedBy?: string;
}

const { data: settings, loading: settingsLoading } = useSanity<SiteSettings>(
  `*[_type == "siteSettings"][0]{
    siteName,
    tagline,
    "logo": logo{asset->{url}},
    "darkLogo": darkLogo{asset->{url}},
    contactEmail,
    contactPhone,
    address,
    ctaLabel,
    ctaUrl,
    ctaHeadline,
    ctaSubtext,
    ctaFooterLabel,
    ctaFooterUrl,
    copyrightText,
    craftedBy
  }`
);

watch(settings, (s) => {
  if (!s) return;
  if (s.siteName) site.name = s.siteName;
  if (s.tagline) site.tagline = s.tagline;
  if (s.logo?.asset?.url) site.logo = s.logo.asset.url;
  if (s.darkLogo?.asset?.url) site.darkLogo = s.darkLogo.asset.url;
  if (s.contactEmail) site.contactEmail = s.contactEmail;
  if (s.contactPhone) site.contactPhone = s.contactPhone;
  if (s.address) site.address = s.address;
  if (s.ctaLabel) site.ctaLabel = s.ctaLabel;
  if (s.ctaUrl) site.ctaUrl = s.ctaUrl;
  if (s.ctaHeadline) site.ctaHeadline = s.ctaHeadline;
  if (s.ctaSubtext) site.ctaSubtext = s.ctaSubtext;
  if (s.ctaFooterLabel) site.ctaFooterLabel = s.ctaFooterLabel;
  if (s.ctaFooterUrl) site.ctaFooterUrl = s.ctaFooterUrl;
  if (s.copyrightText) site.copyrightText = s.copyrightText;
  if (s.craftedBy) site.craftedBy = s.craftedBy;
});

// ── Navigation ──
interface NavItem { label: string; url: string; isExternal?: boolean }
interface NavDoc { navType: string; items: NavItem[] }

const { data: navDocs, loading: navLoading } = useSanity<NavDoc[]>(
  `*[_type == "navigation"]{navType, items[]{label, url, isExternal}}`
);

watch(navDocs, (docs) => {
  if (!docs) return;
  for (const doc of docs) {
    const items = (doc.items || []).map((i) => ({ label: i.label, to: i.url }));
    if (doc.navType === 'main' && items.length) site.primaryNav = items;
    if (doc.navType === 'footer' && items.length) site.footerNav = items;
    if (doc.navType === 'legal' && items.length) site.legalNav = items;
  }
});

// ── Utility Bar ──
interface UtilityBarDoc {
  phone?: string;
  quickLinks?: Array<{ label: string; url: string }>;
}

const { data: utilityBar, loading: utilityBarLoading } = useSanity<UtilityBarDoc>(
  `*[_type == "utilityBar"][0]{ phone, quickLinks[]{label, url} }`,
);

watch(utilityBar, (doc) => {
  if (!doc) return;
  if (doc.phone) site.contactPhone = doc.phone;
  const links = (doc.quickLinks || []).map((l) => ({ label: l.label, to: l.url }));
  if (links.length) site.utilityNav = links;
});

const ready = computed(
  () => !settingsLoading.value && !navLoading.value && !utilityBarLoading.value,
);
</script>

<template>
  <div v-if="!ready" class="site-loader" aria-label="Loading">
    <div class="site-loader__ring"></div>
  </div>
  <div v-else class="site-layout site-layout--ready">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <SiteHeader />
    <div id="main-content">
      <slot />
    </div>
    <SiteFooter />
    <!-- Temporary classic/modern view-mode toggle for client preview.
         Remove the ViewToggle + useViewStore + Header/Hero Classic components
         once the client commits to one direction. -->
    <ViewToggle />
  </div>
</template>

<style scoped>
.site-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background-color: var(--color-bg);
}

.site-loader__ring {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: loaderSpin 0.8s linear infinite;
}

@keyframes loaderSpin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .site-loader__ring {
    animation: none;
    border-top-color: var(--color-border);
    opacity: 0.5;
  }
}

.site-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  animation: layoutFadeIn 0.2s ease;
}

@keyframes layoutFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: var(--border-radius);
  z-index: 100;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 1rem;
}
</style>
