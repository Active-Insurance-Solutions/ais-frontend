<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  to: string;
}>();

/* Three categories of href:
 *   - External http(s) / protocol-relative → open in a new tab (off-site)
 *   - Handoff schemes (mailto:, tel:, sms:) → render as a plain <a>; the
 *     OS picks up the click and opens the mail client / dialer / SMS app
 *     in the current tab. Routing these through Vue Router was the bug
 *     that made the About-page Email buttons render as
 *     http://localhost:5173/mailto:randy@... — RouterLink treats the URL
 *     as a relative path and prepends the current origin.
 *   - Anything else → in-app navigation via Vue Router. */
const isExternalLink = computed(
  () => props.to.startsWith('http') || props.to.startsWith('//'),
);
const isHandoffLink = computed(() => /^(mailto:|tel:|sms:)/i.test(props.to));
</script>

<template>
  <a
    v-if="isExternalLink"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
  <a v-else-if="isHandoffLink" :href="to">
    <slot />
  </a>
  <RouterLink v-else :to="to">
    <slot />
  </RouterLink>
</template>
