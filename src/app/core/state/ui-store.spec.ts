import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiStore } from './ui-store';

describe('UiStore', () => {
  let store: InstanceType<typeof UiStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(UiStore);
  });

  it('defaults to an open sidebar and a closed palette', () => {
    expect(store.sidebarOpen()).toBe(true);
    expect(store.paletteOpen()).toBe(false);
    expect(store.shortcuts()).toEqual([]);
  });

  it('toggles and sets the sidebar', () => {
    store.toggleSidebar();
    expect(store.sidebarOpen()).toBe(false);
    store.setSidebar(true);
    expect(store.sidebarOpen()).toBe(true);
  });

  it('opens, closes, and toggles the palette', () => {
    store.openPalette();
    expect(store.paletteOpen()).toBe(true);
    store.closePalette();
    expect(store.paletteOpen()).toBe(false);
    store.togglePalette();
    expect(store.paletteOpen()).toBe(true);
  });

  it('registers a shortcut and replaces one with the same id', () => {
    store.registerShortcut({ id: 'palette', keys: 'Mod+k', description: 'Open palette' });
    store.registerShortcut({ id: 'palette', keys: 'Mod+p', description: 'Open palette' });
    expect(store.shortcuts()).toEqual([
      { id: 'palette', keys: 'Mod+p', description: 'Open palette' },
    ]);
  });

  it('unregisters a shortcut', () => {
    store.registerShortcut({ id: 'a', keys: 'Mod+a', description: 'A' });
    store.registerShortcut({ id: 'b', keys: 'Mod+b', description: 'B' });
    store.unregisterShortcut('a');
    expect(store.shortcuts().map((s) => s.id)).toEqual(['b']);
  });

  it('toggles the history sort order', () => {
    expect(store.historySortDescending()).toBe(false);
    store.toggleHistorySort();
    expect(store.historySortDescending()).toBe(true);
  });
});
