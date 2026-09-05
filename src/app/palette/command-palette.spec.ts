import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentStore } from '../core/state/document-store';
import { UiStore } from '../core/state/ui-store';
import { defineTool, failure } from '../core/tools/tool';
import { provideTools } from '../core/tools/tool-registry';
import { CommandPalette } from './command-palette';

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Case',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

const repeat = defineTool({
  id: 'repeat',
  name: 'Repeat',
  description: 'Repeats text a number of times.',
  category: 'Text',
  icon: 'repeat',
  params: [{ type: 'number', key: 'times', label: 'Times', default: 2, integer: true, min: 1 }],
  run: (input, params) => input.repeat(params.times),
});

const boom = defineTool({
  id: 'boom',
  name: 'Boom',
  description: 'Always fails.',
  category: 'Text',
  icon: 'error',
  params: [],
  run: () => failure('kaboom'),
});

describe('CommandPalette', () => {
  let fixture: ComponentFixture<CommandPalette>;
  let component: CommandPalette;
  let store: InstanceType<typeof DocumentStore>;
  let ui: InstanceType<typeof UiStore>;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let docId: string;

  const flush = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({
      imports: [CommandPalette],
      providers: [provideTools(upper, repeat, boom), { provide: MatSnackBar, useValue: snackBar }],
    });
    store = TestBed.inject(DocumentStore);
    ui = TestBed.inject(UiStore);
    docId = store.openDocument({ content: 'abc' });

    fixture = TestBed.createComponent(CommandPalette);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const open = async () => {
    ui.openPalette();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('renders nothing while closed', () => {
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows a dialog with a search box when opened', async () => {
    await open();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.palette__search')).toBeTruthy();
  });

  it('filters results as the query changes', async () => {
    await open();
    component['onSearch']({ target: { value: 'uppercase' } } as unknown as Event);

    expect(component['results']().map((tool) => tool.id)).toEqual(['upper']);
  });

  it('shows an empty state when nothing matches', async () => {
    await open();
    component['onSearch']({ target: { value: 'zzzz' } } as unknown as Event);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.palette__empty')).toBeTruthy();
  });

  it('moves the active item with the arrow keys', async () => {
    await open();
    const preventDefault = vi.fn();

    component['onKeydown']({ key: 'ArrowDown', preventDefault } as unknown as KeyboardEvent);
    expect(component['activeIndex']()).toBe(1);

    component['onKeydown']({ key: 'ArrowUp', preventDefault } as unknown as KeyboardEvent);
    expect(component['activeIndex']()).toBe(0);
    expect(preventDefault).toHaveBeenCalledTimes(2);
  });

  it('runs a param-less tool immediately and closes', async () => {
    await open();
    component['choose'](upper);
    await flush();

    expect(store.entityMap()[docId].currentContent).toBe('ABC');
    expect(ui.paletteOpen()).toBe(false);
  });

  it('opens a params form for a tool that takes params', async () => {
    await open();
    component['choose'](repeat);
    fixture.detectChanges();

    expect(component['selected']()?.id).toBe('repeat');
    expect(fixture.nativeElement.querySelector('.palette__form')).toBeTruthy();
    expect(ui.paletteOpen()).toBe(true);
  });

  it('blocks running when params are invalid', async () => {
    await open();
    component['choose'](repeat);
    component['setParam']('times', { target: { value: '0' } } as unknown as Event);

    expect(component['canRun']()).toBe(false);
    expect(component['validation']().errors.length).toBeGreaterThan(0);
  });

  it('runs a tool with valid params via submit', async () => {
    await open();
    component['choose'](repeat);
    component['setParam']('times', { target: { value: '3' } } as unknown as Event);
    component['submit']();
    await flush();

    expect(store.entityMap()[docId].currentContent).toBe('abcabcabc');
    expect(ui.paletteOpen()).toBe(false);
  });

  it('surfaces a tool failure in a snackbar and stays open', async () => {
    await open();
    component['choose'](boom);
    await flush();

    expect(snackBar.open).toHaveBeenCalledWith('kaboom', 'Dismiss', expect.anything());
    expect(ui.paletteOpen()).toBe(true);
  });

  it('warns when there is no active document', async () => {
    store.closeDocument(docId);
    await open();
    component['choose'](upper);
    await flush();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Open a document first.',
      'Dismiss',
      expect.anything(),
    );
  });

  it('closes on Escape from the list', async () => {
    await open();
    component['onKeydown']({ key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(ui.paletteOpen()).toBe(false);
  });

  it('returns to the list on Escape from the params form', async () => {
    await open();
    component['choose'](repeat);
    component['onKeydown']({ key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(component['selected']()).toBeNull();
    expect(ui.paletteOpen()).toBe(true);
  });
});
