import { createRouter, createWebHistory } from 'vue-router';

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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
  },
  {
    path: '/privacy-policy',
    name: 'Privacy Policy',
    component: PrivacyPolicy,
  },
  {
    path: '/terms-and-conditions',
    name: 'Terms & Conditions',
    component: TermsAndConditions,
  },
  {
    path: '/accessibility',
    name: 'Accessibility Statement',
    component: Accessibility,
  },
  {
    path: '/services',
    name: 'Services',
    component: Services,
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: Faq,
  },
  {
    path: '/plans',
    name: 'Plans',
    component: Plans,
  },
  {
    path: '/portfolio/:slug',
    name: 'ProjectDetail',
    component: ProjectDetail,
  },
  {
    path: '/team-projects/:slug',
    name: 'TeamProjectDetail',
    component: TeamProjectDetail,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

export default router;
