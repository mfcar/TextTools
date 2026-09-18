import { DatePipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { DocumentStore } from '../core/state/document-store';
import { FlowStore } from '../core/state/flow-store';
import { Flow } from '../core/state/models';
import { ToolParams } from '../core/tools/param-schema';
import { ToolRegistry } from '../core/tools/tool-registry';
import { ConfirmDialog } from '../shared/dialogs/confirm-dialog';
import type { FlowRunRequest } from './flow-run-params-dialog';

@Component({
  selector: 'app-flows-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
  styleUrl: './flows-dialog.scss',
  templateUrl: './flows-dialog.html',
})
export class FlowsDialog {
  private readonly flows = inject(FlowStore);
  private readonly documents = inject(DocumentStore);
  private readonly registry = inject(ToolRegistry);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly items = computed(() =>
    [...this.flows.entities()].sort((a, b) => b.updatedAt - a.updatedAt),
  );
  protected readonly hasActiveDocument = computed(() => this.documents.activeId() !== null);

  protected readonly activeIndex = signal(0);
  private readonly rowEls = viewChildren<ElementRef<HTMLLIElement>>('flowItem');

  protected onListKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusRow(this.activeIndex() + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusRow(this.activeIndex() - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusRow(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusRow(this.items().length - 1);
        break;
    }
  }

  private focusRow(index: number): void {
    const count = this.items().length;
    if (count === 0) {
      return;
    }
    const next = (index + count) % count;
    this.activeIndex.set(next);
    this.rowEls()[next]?.nativeElement.focus();
  }

  protected async run(flow: Flow): Promise<void> {
    const id = this.documents.activeId();
    if (!id) {
      this.snackBar.open('Open a document first.', 'Dismiss', { duration: 4000 });
      return;
    }
    const requests = this.buildAskRequests(flow);
    let overrides: readonly ToolParams[] = [];
    if (requests.length > 0) {
      const { FlowRunParamsDialog } = await import('./flow-run-params-dialog');
      const ref = this.dialog.open(FlowRunParamsDialog, {
        data: { flowName: flow.name, requests },
        width: '32rem',
        maxWidth: '95vw',
      });
      const answers = await firstValueFrom(ref.afterClosed());
      if (!answers) {
        return;
      }
      const collected = flow.steps.map(() => ({}) as ToolParams);
      for (const answer of answers) {
        collected[answer.stepIndex] = {
          ...collected[answer.stepIndex],
          [answer.key]: answer.value,
        };
      }
      overrides = collected;
    }
    const result = await this.documents.applyFlow(id, flow, overrides);
    if (result.ok) {
      const plural = result.appliedCount === 1 ? '' : 's';
      this.snackBar.open(
        `Ran "${flow.name}" — ${result.appliedCount} step${plural} applied.`,
        'Dismiss',
        { duration: 4000 },
      );
    } else {
      this.snackBar.open(result.error ?? 'The flow failed to run.', 'Dismiss', { duration: 6000 });
    }
  }

  private buildAskRequests(flow: Flow): readonly FlowRunRequest[] {
    const requests: FlowRunRequest[] = [];
    flow.steps.forEach((step, index) => {
      const ask = step.ask ?? [];
      if (ask.length === 0) {
        return;
      }
      const tool = this.registry.get(step.toolId);
      if (!tool) {
        return;
      }
      for (const param of tool.params) {
        if (ask.includes(param.key)) {
          requests.push({
            stepIndex: index,
            stepPosition: index + 1,
            toolName: step.toolName,
            param,
            initial: step.params[param.key] ?? param.default,
          });
        }
      }
    });
    return requests;
  }

  protected async create(): Promise<void> {
    const { FlowEditorDialog } = await import('./flow-editor-dialog');
    this.dialog.open(FlowEditorDialog, {
      data: {},
      width: '48rem',
      maxWidth: '95vw',
    });
  }

  protected async edit(flow: Flow): Promise<void> {
    const { FlowEditorDialog } = await import('./flow-editor-dialog');
    this.dialog.open(FlowEditorDialog, {
      data: { flowId: flow.id },
      width: '48rem',
      maxWidth: '95vw',
    });
  }

  protected remove(flow: Flow): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Delete flow',
          message: `Delete "${flow.name}"? This cannot be undone.`,
          confirmLabel: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.flows.deleteFlow(flow.id);
        }
      });
  }
}
