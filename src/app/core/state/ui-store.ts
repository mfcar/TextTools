import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface KeyboardShortcut {
  readonly id: string;
  readonly keys: string;
  readonly description: string;
  readonly category?: string;
}

interface UiState {
  readonly sidebarOpen: boolean;
  readonly paletteOpen: boolean;
  readonly shortcuts: readonly KeyboardShortcut[];
  readonly historySortDescending: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  paletteOpen: false,
  shortcuts: [],
  historySortDescending: false,
};

export const UiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    toggleSidebar(): void {
      patchState(store, (state) => ({ sidebarOpen: !state.sidebarOpen }));
    },
    setSidebar(open: boolean): void {
      patchState(store, { sidebarOpen: open });
    },
    openPalette(): void {
      patchState(store, { paletteOpen: true });
    },
    closePalette(): void {
      patchState(store, { paletteOpen: false });
    },
    togglePalette(): void {
      patchState(store, (state) => ({ paletteOpen: !state.paletteOpen }));
    },
    registerShortcut(shortcut: KeyboardShortcut): void {
      patchState(store, (state) => ({
        shortcuts: [...state.shortcuts.filter((existing) => existing.id !== shortcut.id), shortcut],
      }));
    },
    unregisterShortcut(id: string): void {
      patchState(store, (state) => ({
        shortcuts: state.shortcuts.filter((existing) => existing.id !== id),
      }));
    },
    toggleHistorySort(): void {
      patchState(store, (state) => ({ historySortDescending: !state.historySortDescending }));
    },
  })),
);
