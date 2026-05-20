# pws-foundation-template

This is a **scaffold template** — not a live project. It is cloned and configured by [pws-scaffolder](https://github.com/EricPhifer/pws-scaffolder) to generate client-specific Foundation sites.

## Stack

Vite, Vue 3, TypeScript, Tailwind CSS 4, Vue Router, Pinia, Lucide Vue Next, @vueuse/core, @unhead/vue

## Placeholder Pattern

Values that vary per client use the `##PLACEHOLDER##` pattern. These are replaced by the scaffolder at generation time:

- `Active Insurance Solutions` — client business name
- `` — short tagline
- `cj@activeinsurancegj.com`, ``, `` — contact info
- `#1B4F8A`, `#2E7CC4`, etc. — brand colors (light theme)
- `#2367b5`, `#4f95d6`, etc. — brand colors (dark theme)
- `Merriweather`, `Inter` — font family names
- `0.5rem` — global border radius
- `` — contact form endpoint
- `##COPYRIGHT_YEAR##` — dynamically generated at runtime (not a placeholder)

## Structure

```
src/
  components/layout/   SiteHeader, SiteFooter, SiteLayout
  components/ui/       BaseButton, BaseCard, BaseSection
  components/seo/      SeoHead (renderless head injection)
  composables/         useTheme (dark mode), useSeo (per-page meta)
  pages/               HomePage, AboutPage, ContactPage
  pages/legal/         PrivacyPolicy, Terms, Accessibility, CookiePolicy
  stores/              useSiteStore (site config: name, nav, contact)
  types/               SiteConfig, NavItem, PageMeta
```

## Do Not

- Run this template directly as a project
- Add client-specific values — use `##PLACEHOLDER##` pattern instead
- Remove placeholder comments in legal pages — scaffolder replaces them