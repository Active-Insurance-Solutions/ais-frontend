<script setup lang="ts">
import HeaderUtilityBar from './headers/HeaderUtilityBar.vue';
import HeaderClassic from './headers/HeaderClassic.vue';
import { useViewStore } from '@/stores/useViewStore';

const view = useViewStore();
</script>

<template>
  <HeaderClassic v-if="view.mode === 'classic'" />
  <HeaderUtilityBar v-else />
</template>
