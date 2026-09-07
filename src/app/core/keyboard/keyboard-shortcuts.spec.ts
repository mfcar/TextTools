import { TestBed } from '@angular/core/testing';
import { KeyboardShortcuts, comboMatches, parseCombo } from './keyboard-shortcuts';
import { UiStore } from '../state/ui-store';

function keydown(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { ...init, cancelable: true });
}

describe('parseCombo', () => {
  it('parses modifiers and the final key', () => {
    expect(parseCombo('Mod+Shift+W')).toEqual({ mod: true, shift: true, alt: false, key: 'w' });
  });

  it('parses a bare key', () => {
    expect(parseCombo('F2')).toEqual({ mod: false, shift: false, alt: false, key: 'f2' });
  });
});

describe('comboMatches', () => {
  it('matches Ctrl or Meta for a Mod combo', () => {
    const combo = parseCombo('Mod+K');
    expect(comboMatches(combo, keydown({ key: 'k', ctrlKey: true }))).toBe(true);
    expect(comboMatches(combo, keydown({ key: 'k', metaKey: true }))).toBe(true);
    expect(comboMatches(combo, keydown({ key: 'k' }))).toBe(false);
  });

  it('requires the shift modifier to match', () => {
    const combo = parseCombo('Mod+Shift+W');
    expect(comboMatches(combo, keydown({ key: 'w', ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(comboMatches(combo, keydown({ key: 'w', ctrlKey: true }))).toBe(false);
  });
});

describe('KeyboardShortcuts', () => {
  let service: KeyboardShortcuts;

  beforeEach(() => {
    service = TestBed.inject(KeyboardShortcuts);
  });

  it('dispatches a registered shortcut and mirrors it into the UI store', () => {
    let calls = 0;
    service.register({
      id: 'test',
      keys: 'Mod+K',
      description: 'Test',
      handler: () => calls++,
    });

    expect(
      TestBed.inject(UiStore)
        .shortcuts()
        .some((s) => s.id === 'test'),
    ).toBe(true);

    document.dispatchEvent(keydown({ key: 'k', ctrlKey: true }));
    expect(calls).toBe(1);
  });

  it('ignores a printable single-key shortcut while typing in an input', () => {
    let calls = 0;
    service.register({ id: 'single', keys: 'a', description: 'A', handler: () => calls++ });

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(keydown({ key: 'a', bubbles: true }));
    input.remove();

    expect(calls).toBe(0);
  });

  it('does not dispatch after unregister', () => {
    let calls = 0;
    service.register({ id: 'gone', keys: 'F2', description: 'Rename', handler: () => calls++ });
    service.unregister('gone');

    document.dispatchEvent(keydown({ key: 'F2' }));
    expect(calls).toBe(0);
    expect(
      TestBed.inject(UiStore)
        .shortcuts()
        .some((s) => s.id === 'gone'),
    ).toBe(false);
  });
});
