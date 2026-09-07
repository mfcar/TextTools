import { DOCUMENT, DestroyRef, Service, inject } from '@angular/core';
import { UiStore } from '../state/ui-store';

export interface ShortcutBinding {
  readonly id: string;
  readonly keys: string;
  readonly description: string;
  readonly category?: string;
  readonly handler: (event: KeyboardEvent) => void;
}

interface Combo {
  readonly mod: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly key: string;
}

interface RegisteredShortcut extends ShortcutBinding {
  readonly combo: Combo;
}

export function parseCombo(keys: string): Combo {
  const parts = keys.split('+').map((part) => part.trim().toLowerCase());
  return {
    mod: parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts[parts.length - 1],
  };
}

export function comboMatches(combo: Combo, event: KeyboardEvent): boolean {
  const mod = event.ctrlKey || event.metaKey;
  return (
    combo.mod === mod &&
    combo.shift === event.shiftKey &&
    combo.alt === event.altKey &&
    event.key.toLowerCase() === combo.key
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) {
    return false;
  }
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable === true;
}

/**
 * Owns the single global keydown listener and dispatches to registered
 * shortcuts. Mirrors bindings into the UI store so they can be surfaced in a
 * shortcuts-help view.
 */
@Service()
export class KeyboardShortcuts {
  private readonly doc = inject(DOCUMENT);
  private readonly ui = inject(UiStore);
  private readonly shortcuts = new Map<string, RegisteredShortcut>();

  constructor() {
    const listener = (event: KeyboardEvent) => this.onKeydown(event);
    this.doc.addEventListener('keydown', listener);
    inject(DestroyRef).onDestroy(() => this.doc.removeEventListener('keydown', listener));
  }

  register(binding: ShortcutBinding): void {
    this.shortcuts.set(binding.id, { ...binding, combo: parseCombo(binding.keys) });
    this.ui.registerShortcut({
      id: binding.id,
      keys: binding.keys,
      description: binding.description,
      category: binding.category,
    });
  }

  unregister(id: string): void {
    this.shortcuts.delete(id);
    this.ui.unregisterShortcut(id);
  }

  private onKeydown(event: KeyboardEvent): void {
    for (const shortcut of this.shortcuts.values()) {
      if (!comboMatches(shortcut.combo, event)) {
        continue;
      }
      const printableSingle =
        shortcut.combo.key.length === 1 && !shortcut.combo.mod && !shortcut.combo.alt;
      if (printableSingle && isEditableTarget(event.target)) {
        return;
      }
      event.preventDefault();
      shortcut.handler(event);
      return;
    }
  }
}
