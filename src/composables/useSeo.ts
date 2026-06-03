import { useHead } from '@unhead/vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://activeinsurancegj.com';
const siteName = 'Active Insurance Solutions';
const defaultImage = `${siteUrl}/og-image.png`;

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: 'Active Insurance Solutions helps Western Colorado businesses and individuals find the right health, Medicare, and life insurance plans at competitive rates.',
  },
  '/about': {
    title: 'About',
    description: 'Meet the Active Insurance Solutions team — knowledgeable Grand Junction locals dedicated to long-term client relationships and personalized insurance guidance.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Reach out to Active Insurance Solutions in Grand Junction, CO. Call 970.241.5542 or send a message to discuss your insurance needs — we respond within one business day.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Privacy Policy - Active Insurance Solutions',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Terms & Conditions - Active Insurance Solutions',
  },
  '/accessibility': {
    title: 'Accessibility Statement',
    description: 'Accessibility Statement - Active Insurance Solutions',
  },
  '/cookie-policy': {
    title: 'Cookie Policy',
    description: 'Active Insurance Solutions does not use cookies to track or profile visitors. Learn how our privacy-first analytics work and how third-party embeds may behave.',
  },
  '/services': {
    title: 'Services',
    description: 'From employer benefit plans to individual health coverage, Active Insurance Solutions offers inclusive, flexible insurance solutions for Western Colorado.',
  },
  '/faq': {
    title: 'FAQ',
    description: 'Get answers to common insurance questions — from Medicare Supplement vs. Advantage Plans to group benefits and individual enrollment periods.',
  },
  '/plans': {
    title: 'Plans',
    description: 'Explore health, Medicare, life, supplemental, and employer benefit plans offered by Active Insurance Solutions in Grand Junction, Colorado.',
  },
};

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Active Insurance Solutions",
  "url": "https://activeinsurancegj.com",
  "email": "rhonda@activeinsurancegj.com",
  "telephone": "9702415542",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "940 Colorado Ave",
    "addressLocality": "Grand Junction",
    "addressRegion": "CO",
    "postalCode": "81501",
    "addressCountry": "US"
  }
};

export function useSeo() {
  const route = useRoute();

  const meta = computed(() => pageMeta[route.path] || {
    title: siteName,
    description: 'Purpose-driven solutions from ' + siteName + '.',
  });

  // Append location so the site ranks better for "{service} grand junction co"
  // queries — addresses the locationInTitle gap from the 2026-04 health check.
  // Skipped when the per-page title already contains the brand (covers any
  // hand-set titles that include their own location framing).
  const fullTitle = computed(() => {
    const t = meta.value.title;
    return t.includes(siteName) ? t : `${t} | ${siteName} | Grand Junction, CO`;
  });

  const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`);

  useHead({
    title: fullTitle,
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    meta: [
      { name: 'description', content: computed(() => meta.value.description) },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: computed(() => meta.value.description) },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: defaultImage },
      { property: 'og:locale', content: 'en_US' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: computed(() => meta.value.description) },
      { name: 'twitter:image', content: defaultImage },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schemaJsonLd),
      },
    ],
  });
}
