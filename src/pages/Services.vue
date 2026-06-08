<script setup>
import { useSanityAsync } from '@/composables/useSanity';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

const { data: page } = await useSanityAsync(pageQuery('/services'));
useRevealObserver(page);
</script>

<template>
  <main class="page page--services">
    <template v-for="section in (page?.sections || [])" :key="section._key">
      <component :is="sectionMap[section._type]" v-if="sectionMap[section._type]" :section="section" />
    </template>
  </main>
</template>
