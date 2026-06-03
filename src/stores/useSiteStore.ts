import { defineStore } from 'pinia';
import type { NavItem, SiteConfig } from '@/types/site';

/* Default navs declared as typed constants outside the state factory. The
 * inline array form (state: () => ({ primaryNav: [...], ... })) inferred
 * each item as `undefined` under vue-tsc 2.3+ in CI (TS2322:
 * "Type 'undefined[]' is not assignable to type 'NavItem[]'"), even though
 * vue-tsc 2.2 accepted the same code locally. Explicitly typing each
 * constant clamps the inferred element type before it reaches the state
 * object literal, so any vue-tsc / TypeScript combination resolves it the
 * same way. */
const DEFAULT_PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'FAQ', to: '/faq' },
];

const DEFAULT_FOOTER_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
];

const DEFAULT_LEGAL_NAV: NavItem[] = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Accessibility Statement', to: '/accessibility' },
];

const DEFAULT_UTILITY_NAV: NavItem[] = [
  { label: 'Employer and Individual Health Plans', to: '/plans#employer-benefit-solutions' },
  { label: 'Medicare', to: '/plans#medicare' },
  { label: 'Life Insurance', to: '/plans#life-insurance' },
];

export const useSiteStore = defineStore('site', {
  state: (): SiteConfig => ({
    name: 'Active Insurance Solutions',
    logo: '',
    darkLogo: '',
    tagline: 'Good Health, That\'s the Plan',
    contactEmail: 'rhonda@activeinsurancegj.com',
    contactPhone: '970.241.5542',
    address: '940 Colorado Ave, Grand Junction, CO 81501',
    ctaLabel: 'Contact Us',
    ctaUrl: '/contact',
    ctaHeadline: 'Good Health, That\'s the Plan',
    ctaSubtext: 'Call 970.241.5542 or send a message.',
    ctaFooterLabel: 'Contact Us',
    ctaFooterUrl: '/contact',
    copyrightText: '',
    craftedBy: 'Crafted by Phifer Web Solutions',
    primaryNav: DEFAULT_PRIMARY_NAV,
    footerNav: DEFAULT_FOOTER_NAV,
    legalNav: DEFAULT_LEGAL_NAV,
    utilityNav: DEFAULT_UTILITY_NAV,
    socialLinks: [
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=100063979748012' },
    ],
  }),
});
