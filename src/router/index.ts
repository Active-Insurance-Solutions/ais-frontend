import type { RouteRecordRaw, RouterScrollBehavior } from 'vue-router';

const Home = () => import('@/pages/Home.vue');
const About = () => import('@/pages/About.vue');
const Contact = () => import('@/pages/Contact.vue');
const PrivacyPolicy = () => import('@/components/layout/LegalPage.vue');
const TermsAndConditions = () => import('@/components/layout/LegalPage.vue');
const Accessibility = () => import('@/components/layout/LegalPage.vue');
const Services = () => import('@/pages/Services.vue');
const Faq = () => import('@/pages/Faq.vue');
const Plans = () => import('@/pages/Plans.vue');
const ProjectDetail = () => import('@/pages/ProjectDetail.vue');
const TeamProjectDetail = () => import('@/pages/TeamProjectDetail.vue');
const NotFound = () => import('@/pages/NotFound.vue');

/* Routes are exported as a plain array so vite-ssg can construct its own
 * router instance at prerender time. createRouter is no longer called here
 * — main.ts hands `routes` and `scrollBehavior` to ViteSSG, which builds
 * the router both for SSG rendering and for client-side hydration. */
export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/privacy-policy', name: 'Privacy Policy', component: PrivacyPolicy },
  { path: '/terms-and-conditions', name: 'Terms & Conditions', component: TermsAndConditions },
  { path: '/accessibility', name: 'Accessibility Statement', component: Accessibility },
  { path: '/services', name: 'Services', component: Services },
  { path: '/faq', name: 'FAQ', component: Faq },
  { path: '/plans', name: 'Plans', component: Plans },
  { path: '/portfolio/:slug', name: 'ProjectDetail', component: ProjectDetail },
  { path: '/team-projects/:slug', name: 'TeamProjectDetail', component: TeamProjectDetail },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

// Total height of the utility-bar header (top row ~36px + main nav 64px).
// Keep in sync with HeaderUtilityBar.vue dimensions.
const HEADER_OFFSET_PX = 100;

// Upper bound on how long scrollBehavior will wait for an async page to
// render its anchor target before giving up and scrolling to top.
const HASH_WAIT_TIMEOUT_MS = 2500;

/**
 * Poll the DOM via requestAnimationFrame until the selector resolves or the
 * timeout elapses. Returns the element on success, null on timeout.
 *
 * Needed because Sanity-driven pages (Plans, About, Faq, etc.) finish
 * rendering AFTER Vue Router's scrollBehavior fires — without this wait,
 * cross-page deep links like /plans#medicare land at the top of /plans
 * because the #medicare element doesn't exist yet at scroll time.
 *
 * Browser-only — only callable when `document` exists. scrollBehavior never
 * runs during SSG prerender (vite-ssg renders routes without scroll events)
 * so this never executes on the server.
 */
function waitForElement(selector: string, timeoutMs: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = performance.now();
    function tick() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (performance.now() - start > timeoutMs) return resolve(null);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

export const scrollBehavior: RouterScrollBehavior = async (to, _from, savedPosition) => {
  if (savedPosition) return savedPosition;
  if (!to.hash) return { top: 0 };

  // Wait for the hashed element to appear before instructing the browser
  // to scroll. If it never appears (bad hash, slow network past timeout),
  // fall back to top of page so the user isn't stranded mid-scroll.
  const target = await waitForElement(to.hash, HASH_WAIT_TIMEOUT_MS);
  if (!target) return { top: 0 };

  return {
    el: to.hash,
    top: HEADER_OFFSET_PX,
    behavior: 'smooth',
  };
};
