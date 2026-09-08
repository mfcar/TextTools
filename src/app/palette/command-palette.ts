import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentStore } from '../core/state/document-store';
import { UiStore } from '../core/state/ui-store';
import { ParamSchema, ParamValue, SelectOption, ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import { ToolRegistry } from '../core/tools/tool-registry';
import { validateParams } from '../core/tools/validate-params';
import { HighlightSegment, highlightMatches } from './highlight';

const ITEM_SIZE = 60;
const MAX_VISIBLE_ITEMS = 8;

function defaultsOf(params: readonly ParamSchema[]): ToolParams {
  const values: ToolParams = {};
  for (const param of params) {
    values[param.key] = param.default;
  }
  return values;
}

@Component({
  selector: 'app-command-palette',
  imports: [
    A11yModule,
    ScrollingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  styleUrl: './command-palette.scss',
  templateUrl: './command-palette.html',
})
export class CommandPalette {
  private readonly registry = inject(ToolRegistry);
  private readonly documents = inject(DocumentStore);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly ui = inject(UiStore);

  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly selected = signal<ToolDefinition | null>(null);
  protected readonly running = signal(false);

  protected readonly results = computed(() => this.registry.search(this.query()));
  protected readonly activeTool = computed(() => {
    const list = this.results();
    return list.length === 0 ? null : list[Math.min(this.activeIndex(), list.length - 1)];
  });
  protected readonly listHeight = computed(
    () => `min(${Math.min(this.results().length, MAX_VISIBLE_ITEMS) * ITEM_SIZE}px, 60vh)`,
  );

  private readonly paramValues = signal<ToolParams>({});
  protected readonly validation = computed(() => {
    const tool = this.selected();
    return tool
      ? validateParams(tool.params, this.paramValues())
      : { params: {} as ToolParams, errors: [] as readonly string[] };
  });
  protected readonly canRun = computed(() => this.validation().errors.length === 0);

  constructor() {
    effect(() => {
      if (!this.ui.paletteOpen()) {
        this.reset();
      }
    });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.selected()) {
        this.back();
      } else {
        this.close();
      }
      return;
    }

    if (this.selected()) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.choose(this.activeTool());
        break;
    }
  }

  private moveActive(delta: number): void {
    const count = this.results().length;
    if (!count) {
      return;
    }
    const next = (this.activeIndex() + delta + count) % count;
    this.activeIndex.set(next);
    this.viewport()?.scrollToIndex(next);
  }

  protected choose(tool: ToolDefinition | null): void {
    if (!tool || this.running()) {
      return;
    }
    if (tool.params.length === 0) {
      void this.run(tool, {});
      return;
    }
    this.paramValues.set(defaultsOf(tool.params));
    this.selected.set(tool);
  }

  protected back(): void {
    this.selected.set(null);
  }

  protected submit(): void {
    const tool = this.selected();
    if (tool && this.canRun() && !this.running()) {
      void this.run(tool, this.validation().params);
    }
  }

  protected close(): void {
    this.ui.closePalette();
  }

  protected setParam(key: string, event: Event): void {
    this.updateParam(key, (event.target as HTMLInputElement).value);
  }

  protected setBool(key: string, checked: boolean): void {
    this.updateParam(key, checked);
  }

  protected setSelect(key: string, value: string): void {
    this.updateParam(key, value);
  }

  protected paramString(key: string): string {
    const value = this.paramValues()[key];
    return value === undefined ? '' : String(value);
  }

  protected paramBool(key: string): boolean {
    return this.paramValues()[key] === true;
  }

  protected highlight(text: string): readonly HighlightSegment[] {
    return highlightMatches(text, this.query());
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

  private updateParam(key: string, value: ParamValue): void {
    this.paramValues.update((current) => ({ ...current, [key]: value }));
  }

  private async run(tool: ToolDefinition, params: ToolParams): Promise<void> {
    const id = this.documents.activeId();
    if (!id) {
      this.snackBar.open('Open a document first.', 'Dismiss', { duration: 4000 });
      return;
    }
    this.running.set(true);
    const result = await this.documents.applyTool(id, tool.id, params);
    this.running.set(false);
    if (result.ok) {
      this.close();
    } else {
      this.snackBar.open(result.error, 'Dismiss', { duration: 6000 });
    }
  }

  private reset(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.selected.set(null);
    this.running.set(false);
    this.paramValues.set({});
  }
}
