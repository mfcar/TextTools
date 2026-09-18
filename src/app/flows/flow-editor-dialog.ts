import { DatePipe } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DiffView } from '../editor/diff-view';
import { Autofocus } from '../shared/autofocus';
import { FlowStore } from '../core/state/flow-store';
import { serializeSteps } from '../core/state/flow';
import { ParamSchema, ParamValue, SelectOption, ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import { ToolRegistry } from '../core/tools/tool-registry';
import { validateParams } from '../core/tools/validate-params';

export interface FlowEditorData {
  readonly flowId?: string;
}

interface EditableStep {
  readonly id: string;
  readonly toolId: string;
  readonly toolName: string;
  readonly params: ToolParams;
  readonly ask: readonly string[];
}

@Component({
  selector: 'app-flow-editor-dialog',
  imports: [
    DatePipe,
    CdkDropList,
    CdkDrag,
    Autofocus,
    DiffView,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  styleUrl: './flow-editor-dialog.scss',
  templateUrl: './flow-editor-dialog.html',
})
export class FlowEditorDialog {
  private readonly data = inject<FlowEditorData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FlowEditorDialog>);
  private readonly flows = inject(FlowStore);
  private readonly registry = inject(ToolRegistry);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isNew = this.data.flowId === undefined;
  protected readonly flow = computed(() =>
    this.data.flowId ? (this.flows.entityMap()[this.data.flowId] ?? null) : null,
  );
  protected readonly available = computed(() => this.isNew || this.flow() !== null);

  protected readonly name = signal(this.flow()?.name ?? '');
  protected readonly description = signal(this.flow()?.description ?? '');
  protected readonly steps = signal<readonly EditableStep[]>(
    (this.flow()?.steps ?? []).map((step) => ({
      id: crypto.randomUUID(),
      toolId: step.toolId,
      toolName: step.toolName,
      params: { ...step.params },
      ask: [...(step.ask ?? [])],
    })),
  );
  protected readonly expandedId = signal<string | null>(null);

  protected readonly picking = signal(false);
  protected readonly pickQuery = signal('');
  protected readonly pickResults = computed(() => this.registry.search(this.pickQuery()));

  protected readonly versions = computed(() => this.flow()?.versions ?? []);
  protected readonly diffFrom = signal(1);
  protected readonly diffTo = signal(this.flow()?.versions.length ?? 1);

  protected readonly canSave = computed(
    () =>
      this.name().trim().length > 0 &&
      this.steps().length > 0 &&
      this.steps().every((step) => this.stepErrors(step).length === 0),
  );

  protected readonly diffOriginal = computed(() => this.serializeVersion(this.diffFrom()));
  protected readonly diffModified = computed(() => this.serializeVersion(this.diffTo()));

  protected drop(event: CdkDragDrop<readonly EditableStep[]>): void {
    const next = [...this.steps()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.steps.set(next);
  }

  protected toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  protected removeStep(id: string): void {
    this.steps.update((steps) => steps.filter((step) => step.id !== id));
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    }
  }

  protected togglePicker(): void {
    this.picking.update((open) => !open);
    if (!this.picking()) {
      this.pickQuery.set('');
    }
  }

  protected setPickQuery(event: Event): void {
    this.pickQuery.set((event.target as HTMLInputElement).value);
  }

  protected addStep(tool: ToolDefinition): void {
    const params: ToolParams = {};
    for (const param of tool.params) {
      params[param.key] = param.default;
    }
    const step: EditableStep = {
      id: crypto.randomUUID(),
      toolId: tool.id,
      toolName: tool.name,
      params,
      ask: [],
    };
    this.steps.update((steps) => [...steps, step]);
    this.expandedId.set(step.id);
    this.picking.set(false);
    this.pickQuery.set('');
  }

  protected paramsOf(step: EditableStep): readonly ParamSchema[] {
    return this.registry.get(step.toolId)?.params ?? [];
  }

  protected stepErrors(step: EditableStep): readonly string[] {
    const tool = this.registry.get(step.toolId);
    if (!tool) {
      return [`Unknown tool "${step.toolId}".`];
    }
    return validateParams(tool.params, step.params).errors;
  }

  protected setParam(id: string, key: string, event: Event): void {
    this.updateParam(id, key, (event.target as HTMLInputElement).value);
  }

  protected setBool(id: string, key: string, checked: boolean): void {
    this.updateParam(id, key, checked);
  }

  protected setSelect(id: string, key: string, value: string): void {
    this.updateParam(id, key, value);
  }

  protected isAsk(step: EditableStep, key: string): boolean {
    return step.ask.includes(key);
  }

  protected toggleAsk(id: string, key: string, checked: boolean): void {
    this.steps.update((steps) =>
      steps.map((step) => {
        if (step.id !== id) {
          return step;
        }
        const ask = checked
          ? [...new Set([...step.ask, key])]
          : step.ask.filter((entry) => entry !== key);
        return { ...step, ask };
      }),
    );
  }

  protected paramString(step: EditableStep, key: string): string {
    const value = step.params[key];
    return value === undefined ? '' : String(value);
  }

  protected paramBool(step: EditableStep, key: string): boolean {
    return step.params[key] === true;
  }

  protected selectOptions(param: ParamSchema): readonly SelectOption[] {
    return param.type === 'select' ? param.options : [];
  }

  protected numberMin(param: ParamSchema): number | null {
    return param.type === 'number' && param.min !== undefined ? param.min : null;
  }

  protected numberMax(param: ParamSchema): number | null {
    return param.type === 'number' && param.max !== undefined ? param.max : null;
  }

  protected numberStep(param: ParamSchema): number | null {
    return param.type === 'number' && param.step !== undefined ? param.step : null;
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }
    const steps = this.steps().map((step) => ({
      toolId: step.toolId,
      toolName: step.toolName,
      params: { ...step.params },
      ...(step.ask.length ? { ask: [...step.ask] } : {}),
    }));
    const name = this.name().trim();
    const description = this.description().trim();
    const id = this.data.flowId;
    if (id === undefined) {
      this.flows.createFlow({ name, description, steps });
      this.snackBar.open('Flow created.', 'Dismiss', { duration: 3000 });
      this.dialogRef.close();
      return;
    }
    this.flows.renameFlow(id, name, description);
    this.flows.saveVersion(id, steps);
    this.diffTo.set(this.versions().length);
    this.snackBar.open('Flow saved.', 'Dismiss', { duration: 3000 });
  }

  private serializeVersion(version: number): string {
    const match = this.versions().find((entry) => entry.version === version);
    return match ? serializeSteps(match.steps) : '';
  }

  private updateParam(id: string, key: string, value: ParamValue): void {
    this.steps.update((steps) =>
      steps.map((step) =>
        step.id === id ? { ...step, params: { ...step.params, [key]: value } } : step,
      ),
    );
  }
}
