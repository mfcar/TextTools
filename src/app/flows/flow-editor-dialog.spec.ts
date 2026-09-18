import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowStore } from '../core/state/flow-store';
import { defineTool } from '../core/tools/tool';
import { ToolRegistry, provideTools } from '../core/tools/tool-registry';
import { FlowEditorDialog } from './flow-editor-dialog';

const append = defineTool({
  id: 'append',
  name: 'Append',
  description: 'Appends a fixed string.',
  category: 'Test',
  icon: 'add',
  params: [{ type: 'text', key: 's', label: 'Suffix', default: 'x' }],
  run: (input, params) => input + params.s,
});

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Test',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

describe('FlowEditorDialog', () => {
  let fixture: ComponentFixture<FlowEditorDialog>;
  let component: FlowEditorDialog;
  let flows: InstanceType<typeof FlowStore>;
  let flowId: string;
  const data: { flowId: string } = { flowId: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTools(append, upper),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    flows = TestBed.inject(FlowStore);
    flowId = flows.createFlow({
      name: 'Flow',
      steps: [
        { toolId: 'upper', toolName: 'Uppercase', params: {} },
        { toolId: 'append', toolName: 'Append', params: { s: '!' } },
      ],
    });
    data.flowId = flowId;

    fixture = TestBed.createComponent(FlowEditorDialog);
    component = fixture.componentInstance;
  });

  it('loads the flow steps into an editable list', () => {
    expect(component['steps']().map((step) => step.toolName)).toEqual(['Uppercase', 'Append']);
    expect(component['canSave']()).toBe(true);
  });

  it('reorders steps', () => {
    component['drop']({ previousIndex: 0, currentIndex: 1 } as never);
    expect(component['steps']().map((step) => step.toolName)).toEqual(['Append', 'Uppercase']);
  });

  it('removes a step', () => {
    const stepId = component['steps']()[0].id;
    component['removeStep'](stepId);
    expect(component['steps']()).toHaveLength(1);
    expect(component['steps']()[0].toolName).toBe('Append');
  });

  it('edits a step parameter', () => {
    const appendStep = component['steps']().find((step) => step.toolId === 'append')!;
    component['setSelect'](appendStep.id, 's', '?');
    const updated = component['steps']().find((step) => step.toolId === 'append')!;
    expect(updated.params['s']).toBe('?');
  });

  it('blocks saving when a step has no tool', () => {
    flows.saveVersion(flowId, [{ toolId: 'ghost', toolName: 'Ghost', params: {} }]);
    const stale = TestBed.createComponent(FlowEditorDialog).componentInstance;
    expect(stale['canSave']()).toBe(false);
  });

  it('saves a new version with the edited steps', () => {
    const stepId = component['steps']()[0].id;
    component['removeStep'](stepId);
    component['save']();

    const flow = flows.entityMap()[flowId];
    expect(flow.versions).toHaveLength(2);
    expect(flow.steps).toHaveLength(1);
    expect(flow.steps[0].toolName).toBe('Append');
  });

  it('adds a step from the picker with default params', () => {
    const registry = TestBed.inject(ToolRegistry);
    component['addStep'](registry.get('append')!);

    const steps = component['steps']();
    expect(steps).toHaveLength(3);
    expect(steps[2].toolName).toBe('Append');
    expect(steps[2].params['s']).toBe('x');
    expect(component['expandedId']()).toBe(steps[2].id);
    expect(component['picking']()).toBe(false);
  });

  it('marks a parameter as ask-on-run and persists it on save', () => {
    const appendStep = component['steps']().find((step) => step.toolId === 'append')!;
    expect(component['isAsk'](appendStep, 's')).toBe(false);

    component['toggleAsk'](appendStep.id, 's', true);
    const updated = component['steps']().find((step) => step.toolId === 'append')!;
    expect(component['isAsk'](updated, 's')).toBe(true);

    component['save']();

    const flow = flows.entityMap()[flowId];
    const saved = flow.steps.find((step) => step.toolId === 'append')!;
    expect(saved.ask).toEqual(['s']);
    expect(flow.steps.find((step) => step.toolId === 'upper')!.ask).toBeUndefined();
  });

  it('filters pickable tools by the search query', () => {
    component['pickQuery'].set('upper');
    expect(component['pickResults']().map((tool) => tool.id)).toEqual(['upper']);
  });

  it('creates a brand-new flow from scratch and closes the dialog', () => {
    TestBed.resetTestingModule();
    const close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideTools(append, upper),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    });
    const store = TestBed.inject(FlowStore);
    const registry = TestBed.inject(ToolRegistry);
    const editor = TestBed.createComponent(FlowEditorDialog).componentInstance;

    expect(editor['isNew']).toBe(true);
    expect(editor['available']()).toBe(true);
    expect(editor['canSave']()).toBe(false);

    editor['name'].set('Scratch');
    editor['addStep'](registry.get('upper')!);
    expect(editor['canSave']()).toBe(true);

    editor['save']();

    expect(close).toHaveBeenCalled();
    const created = store.entities().find((flow) => flow.name === 'Scratch');
    expect(created).toBeDefined();
    expect(created!.steps.map((step) => step.toolName)).toEqual(['Uppercase']);
  });
});
