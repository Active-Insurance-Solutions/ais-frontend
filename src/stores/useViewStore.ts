import { defineStore } from 'pinia';

// Temporary classic/modern view-mode toggle for client preview. The choice is
// persisted to localStorage so it survives reload + cross-page navigation
// within a single browser, but is NOT synced server-side — each device picks
// independently. Strip this store + the related Classic components once the
// client has decided on a direction.

export type ViewMode = 'modern' | 'classic';

const STORAGE_KEY = 'ais.view-mode';

function loadInitialMode(): ViewMode {
  if (typeof window === 'undefined') return 'modern';
  return window.localStorage.getItem(STORAGE_KEY) === 'classic' ? 'classic' : 'modern';
}

export const useViewStore = defineStore('view', {
  state: () => ({
    mode: loadInitialMode() as ViewMode,
  }),
  actions: {
    toggleMode() {
      this.mode = this.mode === 'modern' ? 'classic' : 'modern';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, this.mode);
      }
    },
    setMode(mode: ViewMode) {
      this.mode = mode;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, mode);
      }
    },
  },
});
