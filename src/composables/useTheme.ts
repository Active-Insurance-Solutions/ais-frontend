import { useLocalStorage } from '@vueuse/core';
import { watchEffect } from 'vue';

export function useTheme() {
  const theme = useLocalStorage<'light' | 'dark'>('theme', 'light');

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  /* watchEffect runs immediately during setup, which fires on the server
   * during vite-ssg prerender — where `document` doesn't exist. Guarding
   * with typeof check so prerender skips the DOM write; the initial theme
   * still appears correctly client-side because useLocalStorage hydrates
   * from the persisted value and watchEffect runs again on first client
   * render to apply data-theme to the documentElement. */
  if (typeof document !== 'undefined') {
    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
    });
  }

  return { theme, toggle };
}
