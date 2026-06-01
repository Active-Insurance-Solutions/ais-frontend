<script setup lang="ts">
import { computed } from 'vue';
import { useViewStore } from '@/stores/useViewStore';

const view = useViewStore();

// Label shows the OTHER mode (the action you'll take by clicking).
const label = computed(() => (view.mode === 'modern' ? 'Classic View' : 'Modern View'));
</script>

<template>
  <button
    type="button"
    class="view-toggle"
    :aria-label="`Switch to ${view.mode === 'modern' ? 'classic' : 'modern'} view`"
    @click="view.toggleMode"
  >
    <span class="view-toggle__dot" aria-hidden="true"></span>
    {{ label }}
  </button>
</template>

<style scoped>
.view-toggle {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(17, 24, 39, 0.85);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.view-toggle:hover {
  background: rgba(17, 24, 39, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.24);
}

.view-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.view-toggle__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-accent);
  display: inline-block;
}
</style>
