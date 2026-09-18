import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentStore } from '../core/state/document-store';
import { FlowStore } from '../core/state/flow-store';
import { defineTool } from '../core/tools/tool';
import { provideTools } from '../core/tools/tool-registry';
import { FlowsDialog } from './flows-dialog';

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Test',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

describe('FlowsDialog', () => {
  let component: FlowsDialog;
  let flows: InstanceType<typeof FlowStore>;
  let documents: InstanceType<typeof DocumentStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTools(upper), { provide: MatSnackBar, useValue: { open: vi.fn() } }],
    });
    flows = TestBed.inject(FlowStore);
    documents = TestBed.inject(DocumentStore);
    component = TestBed.createComponent(FlowsDialog).componentInstance;
  });

  it('sorts flows by most recently updated', () => {
    const older = flows.createFlow({ name: 'Older', steps: [] });
    const newer = flows.createFlow({ name: 'Newer', steps: [] });
    flows.saveVersion(newer, [{ toolId: 'upper', toolName: 'Uppercase', params: {} }]);

    expect(component['items']().map((flow) => flow.id)).toEqual([newer, older]);
  });

  it('moves the active row with arrow keys and wraps around', () => {
    flows.createFlow({ name: 'A', steps: [] });
    flows.createFlow({ name: 'B', steps: [] });

    expect(component['activeIndex']()).toBe(0);
    component['onListKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component['activeIndex']()).toBe(1);
    component['onListKeydown'](new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component['activeIndex']()).toBe(0);
    component['onListKeydown'](new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component['activeIndex']()).toBe(1);
    component['onListKeydown'](new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component['activeIndex']()).toBe(0);
  });

  it('runs a flow against the active document', async () => {
    const id = documents.openDocument({ content: 'hello' });
    const flowId = flows.createFlow({
      name: 'Shout',
      steps: [{ toolId: 'upper', toolName: 'Uppercase', params: {} }],
    });

    await component['run'](flows.entityMap()[flowId]);

    expect(documents.entityMap()[id].currentContent).toBe('HELLO');
  });
});
