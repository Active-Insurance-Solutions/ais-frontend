import { defineStore } from 'pinia';
import type { SiteConfig } from '@/types/site';

export const useSiteStore = defineStore('site', {
  state: (): SiteConfig => ({
    name: 'Active Insurance Solutions',
    logo: '',
    darkLogo: '',
    tagline: 'Good Health, That\'s the Plan',
    contactEmail: 'cj@activeinsurancegj.com',
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
    primaryNav: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'FAQ', to: '/faq' },
    ],
    footerNav: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact Us', to: '/contact' },
    ],
    legalNav: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
      { label: 'Accessibility Statement', to: '/accessibility' },
    ],
    utilityNav: [
      { label: 'Employer and Individual Health Plans', to: '/plans#employer-benefit-solutions' },
      { label: 'Medicare', to: '/plans#medicare' },
      { label: 'Life Insurance', to: '/plans#life-insurance' },
    ],
    socialLinks: [
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=100063979748012' },
    ],
  }),
});
